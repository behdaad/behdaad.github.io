"""Install the Music ratings publisher as a per-user macOS LaunchAgent."""

import os
from pathlib import Path
import plistlib
import shutil
import subprocess
import sys


LABEL = "me.behdaad.music-ratings"
ORIGIN = "https://github.com/behdaad/behdaad.github.io.git"
STATE = Path.home() / "Library/Application Support/behdaad-ratings"
PLIST = Path.home() / f"Library/LaunchAgents/{LABEL}.plist"
DOMAIN = f"gui/{os.getuid()}"
HERE = Path(__file__).resolve().parent


def run(*args):
    subprocess.run(args, check=True)


def main():
    STATE.mkdir(mode=0o700, parents=True, exist_ok=True)
    venv = STATE / "venv"
    python = venv / "bin/python"
    if not python.exists():
        run(sys.executable, "-m", "venv", str(venv))
    run(str(python), "-m", "pip", "install", "-r", str(HERE / "requirements.txt"))

    repo = STATE / "site.git"
    if not repo.exists():
        run("/usr/bin/git", "clone", "--bare", ORIGIN, str(repo))

    if subprocess.run(
        ["/bin/launchctl", "print", f"{DOMAIN}/{LABEL}"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    ).returncode == 0:
        run("/bin/launchctl", "bootout", f"{DOMAIN}/{LABEL}")

    script = STATE / "publish.py"
    shutil.copyfile(HERE / script.name, script)
    PLIST.parent.mkdir(parents=True, exist_ok=True)
    with PLIST.open("wb") as file:
        plistlib.dump({
            "Label": LABEL,
            "ProgramArguments": [str(python), "-B", str(script)],
            "RunAtLoad": True,
            "StartCalendarInterval": {"Hour": 3, "Minute": 0},
            "StartInterval": 900,
            "StandardOutPath": str(STATE / "publisher.log"),
            "StandardErrorPath": str(STATE / "publisher-errors.log"),
        }, file)
    run("/usr/bin/plutil", "-lint", str(PLIST))
    run("/bin/launchctl", "bootstrap", DOMAIN, str(PLIST))


if __name__ == "__main__":
    main()
