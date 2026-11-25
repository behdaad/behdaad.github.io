"""Export public music and concert ratings and publish them from a dedicated Git repository."""

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
ALBUMS = "ratings/music/albums.json"
CONCERTS = "ratings/concerts/concerts.json"
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


def table_rows(table, required):
    # Read stored rows directly. The concert table's category view only affects presentation.
    rows = iter(table.rows(values_only=True))
    header = next(rows)
    if table.num_header_rows != 1 or any(header.count(name) != 1 for name in required):
        raise ValueError(f"{table.name} table headers have changed")
    indexes = [header.index(name) for name in required]
    for row in rows:
        if any(value not in (None, "") for value in row):
            yield (row[index] for index in indexes)


def rating_value(value):
    if value in (None, ""):
        return None
    if type(value) not in (int, float) or not math.isfinite(value):
        raise ValueError("Invalid rating in the workbook")
    return value


def export_albums(document):
    table = document.sheets["Albums"].tables["Album ratings"]
    required = ("Band", "Album", "Year", "Rating", "Type", "Origin")

    albums = []
    for artist, title, year, score, kind, origin in table_rows(table, required):
        if not isinstance(kind, str) or not kind.strip():
            raise ValueError("Missing release type in the album table")
        if kind != "Album":
            continue
        if type(title) in (int, float) and math.isfinite(title):
            title = format(title, ".15g")
        if not isinstance(artist, str) or not artist.strip() or not isinstance(title, str) or not title.strip():
            raise ValueError("Missing artist or title in an album row")
        if origin is not None and not isinstance(origin, str):
            raise ValueError("Invalid origin in the album table")
        albums.append(dict(artist=artist, album=title, year=year_value(year), rating=rating_value(score), origin=origin or None))
    return albums


def export_concerts(document):
    table = document.sheets["Concerts"].tables["Concerts"]
    required = ("Band", "Date", "City", "Venue", "Sound Quality (1-5)", "Rating", "Comments", "Origin")
    concerts = []
    for artist, day, city, venue, sound, score, comments, origin in table_rows(table, required):
        if not isinstance(artist, str) or not artist.strip() or not isinstance(day, date):
            raise ValueError("Missing performer or invalid date in the concert table")
        if any(value is not None and not isinstance(value, str) for value in (city, venue, comments, origin)):
            raise ValueError("Invalid city, venue, comments, or origin in the concert table")
        if isinstance(day, datetime):
            day = day.date()
        concerts.append(dict(
            artist=artist, date=day.isoformat(), city=city, venue=venue,
            soundQuality=rating_value(sound), rating=rating_value(score),
            comments=comments or None, origin=origin or None,
        ))
    return concerts


EXPORTERS = {ALBUMS: export_albums, CONCERTS: export_concerts}


def export(source, outputs):
    before = source.stat()
    document = Document(source)
    data = {}
    for path in outputs:
        entries = EXPORTERS[path](document)
        if not entries:
            raise ValueError(f"The workbook contains no rows for {path}")
        lines = [json.dumps(entry, ensure_ascii=False, allow_nan=False) for entry in entries]
        data[path] = ("[\n  " + ",\n  ".join(lines) + "\n]\n").encode()

    after = source.stat()
    if (before.st_ino, before.st_size, before.st_mtime_ns) != (after.st_ino, after.st_size, after.st_mtime_ns):
        raise ValueError("The workbook changed during export")
    return data


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
    updates = {
        path: snapshot for path, snapshot in data.items()
        if git(repo, "show", f"{parent}:{path}").stdout != snapshot
    }
    if not updates:
        return "Public ratings are already current"

    with tempfile.TemporaryDirectory() as directory:
        index = Path(directory) / "index"
        git(repo, "read-tree", parent, index=index)
        for path, snapshot in updates.items():
            blob = git(repo, "hash-object", "-w", "--stdin", data=snapshot).stdout.decode().strip()
            git(repo, "update-index", "--cacheinfo", f"100644,{blob},{path}", index=index)
        tree = git(repo, "write-tree", index=index).stdout.decode().strip()

    changes = git(repo, "diff-tree", "-r", "--name-only", parent, tree).stdout.decode().splitlines()
    if set(changes) != updates.keys() or not updates.keys() <= EXPORTERS.keys():
        raise ValueError("Unexpected files in ratings update")
    commit = git(repo, "commit-tree", tree, "-p", parent, "-m", "Update public Music ratings").stdout.decode().strip()
    git(repo, "push", "origin", f"{commit}:refs/heads/master")
    return f"Pushed {commit[:12]}"


def due_date(now):
    return now.date() if now.hour >= 3 else now.date() - timedelta(days=1)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--source", type=Path, default=SOURCE)
    parser.add_argument("--export", type=Path, help="Write an album preview and skip publishing")
    parser.add_argument("--export-concerts", type=Path, help="Write a concert preview and skip publishing")
    parser.add_argument("--state", type=Path, default=STATE)
    parser.add_argument("--now", action="store_true", help="Run even if the latest scheduled refresh succeeded")
    args = parser.parse_args()

    previews = {path: target for path, target in (
        (ALBUMS, args.export), (CONCERTS, args.export_concerts)
    ) if target is not None}
    if previews:
        for path, snapshot in export(args.source, previews).items():
            previews[path].write_bytes(snapshot)
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
        result = publish(args.state / "site.git", export(args.source, EXPORTERS))
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
