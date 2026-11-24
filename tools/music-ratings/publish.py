"""Export the public album ratings and publish them from a dedicated Git repository."""

import argparse
from datetime import date, datetime, timedelta
import fcntl
import json
import math
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from zoneinfo import ZoneInfo

from numbers_parser import Document


SOURCE = Path.home() / "Library/Mobile Documents/com~apple~Numbers/Documents/Ratings/Music.numbers"
STATE = Path.home() / "Library/Application Support/behdaad-ratings"
ORIGIN = "https://github.com/behdaad/behdaad.github.io.git"
OUTPUT = "ratings/albums.json"
UPSTREAM = "refs/remotes/origin/master"
ZONE = ZoneInfo("Europe/Amsterdam")


def year_value(value):
    if isinstance(value, (date, datetime)):
        return value.year
    if type(value) in (int, float) and 1 <= value <= 9999 and int(value) == value:
        return int(value)
    if value in (None, ""):
        return None
    raise ValueError("Invalid release year in the album table")


def export(source):
    before = source.stat()
    table = Document(source).sheets["Albums"].tables["Album ratings"]
    rows = iter(table.iter_rows(values_only=True))
    header = next(rows)
    required = ("Band", "Album", "Year", "Rating", "Type")
    if table.num_header_rows != 1 or any(header.count(name) != 1 for name in required):
        raise ValueError("Album table headers have changed")
    band, album, year, rating, kind = (header.index(name) for name in required)

    albums = []
    for row in rows:
        if not any(value not in (None, "") for value in row):
            continue
        if not isinstance(row[kind], str) or not row[kind].strip():
            raise ValueError("Missing release type in the album table")
        if row[kind] != "Album":
            continue
        artist, title, score = row[band], row[album], row[rating]
        if type(title) in (int, float) and math.isfinite(title):
            title = format(title, ".15g")
        if not isinstance(artist, str) or not artist.strip() or not isinstance(title, str) or not title.strip():
            raise ValueError("Missing artist or title in an album row")
        if score == "":
            score = None
        if score is not None and (type(score) not in (int, float) or not math.isfinite(score)):
            raise ValueError("Invalid rating in an album row")
        albums.append(dict(artist=artist, album=title, year=year_value(row[year]), rating=score))

    if not albums:
        raise ValueError("The workbook contains no album rows")
    after = source.stat()
    if (before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns):
        raise ValueError("The workbook changed during export")
    lines = [json.dumps(album, ensure_ascii=False, allow_nan=False) for album in albums]
    return ("[\n  " + ",\n  ".join(lines) + "\n]\n").encode()


def git(repo, *args, data=None, index=None):
    env = {**os.environ, "GIT_TERMINAL_PROMPT": "0", "GIT_SSH_COMMAND": "ssh -o BatchMode=yes"}
    if index is not None:
        env["GIT_INDEX_FILE"] = str(index)
    return subprocess.run(
        ["/usr/bin/git", "-C", str(repo), *args], input=data, stdout=subprocess.PIPE,
        env=env, check=True, timeout=90,
    )


def publish(repo, data):
    if git(repo, "remote", "get-url", "--push", "origin").stdout.decode().strip() != ORIGIN:
        raise ValueError("Publisher origin does not match the site repository")
    git(repo, "fetch", "--no-tags", "origin", f"refs/heads/master:{UPSTREAM}")
    parent = git(repo, "rev-parse", UPSTREAM).stdout.decode().strip()
    current = git(repo, "show", f"{parent}:{OUTPUT}")
    if current.stdout == data:
        return "Public ratings are already current"

    with tempfile.TemporaryDirectory() as directory:
        index = Path(directory) / "index"
        git(repo, "read-tree", parent, index=index)
        blob = git(repo, "hash-object", "-w", "--stdin", data=data).stdout.decode().strip()
        git(repo, "update-index", "--add", "--cacheinfo", f"100644,{blob},{OUTPUT}", index=index)
        tree = git(repo, "write-tree", index=index).stdout.decode().strip()

    changes = git(repo, "diff-tree", "-r", "--name-only", parent, tree).stdout.decode().splitlines()
    if changes != [OUTPUT]:
        raise ValueError("Unexpected files in ratings update")
    commit = git(repo, "commit-tree", tree, "-p", parent, "-m", "Update public Music ratings").stdout.decode().strip()
    git(repo, "push", "origin", f"{commit}:refs/heads/master")
    return f"Pushed {commit[:12]}"


def due_date(now):
    return now.date() if now.hour >= 3 else now.date() - timedelta(days=1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--export", type=Path, help="Write a preview and skip publishing")
    parser.add_argument("--state", type=Path, default=STATE)
    parser.add_argument("--now", action="store_true", help="Run even if the latest scheduled refresh succeeded")
    args = parser.parse_args()

    if args.export:
        args.export.write_bytes(export(args.source))
        return

    success = args.state / "last-success.json"
    with (args.state / "publish.lock").open("a") as lock:
        try:
            fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return
        now = datetime.now(ZONE)
        due = due_date(now).isoformat()
        if not args.now and success.exists() and json.loads(success.read_text())["due_date"] >= due:
            return
        result = publish(args.state / "site.git", export(args.source))
        pending = success.with_suffix(".tmp")
        pending.write_text(json.dumps({
            "due_date": due, "completed_at": datetime.now(ZONE).isoformat(), "result": result,
        }) + "\n")
        pending.replace(success)
        print(f"{now.isoformat()} {result}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"{datetime.now(ZONE).isoformat()} Ratings export failed: {error}", file=sys.stderr)
        sys.exit(1)
