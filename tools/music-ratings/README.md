# Music and concert ratings publisher

The music page reads `ratings/music/albums.json`. The exporter selects rows
marked `Album` from the `Album ratings` table on the `Albums` sheet in the saved
`Music.numbers` workbook under iCloud Drive → Numbers → Ratings. The album
snapshot contains artist, album, year, rating, and origin. The concerts
page reads `ratings/concerts/concerts.json`, exported from the `Concerts` table
on the `Concerts` sheet. The concert snapshot contains performer, date, city,
venue, sound quality, rating, comments, and origin.

To preview a snapshot locally, install the pinned dependency in a Python 3.11+
virtual environment and run:

```sh
python tools/music-ratings/publish.py \
  --export /tmp/album-ratings-preview.json \
  --export-concerts /tmp/concert-ratings-preview.json
```

After the initial website and snapshot are on `origin/master`, run
`python3 tools/music-ratings/install.py` from the Mac that syncs the workbook.
Run installation again after changing the publisher. Git must be configured
with a commit identity and credentials that work without a terminal prompt.

The LaunchAgent starts at 03:00 Mac time and checks every 15 minutes. The
publisher uses Europe/Amsterdam to decide when a refresh is due, so if the Mac
is set to another time zone, the interval provides the next eligible run.
The first eligible run after wake or login catches up. Publishing starts from
the current remote master and commits changed snapshots together.

Find the last successful check and logs under
`~/Library/Application Support/behdaad-ratings/`. To run immediately,
invoke the installed publisher using its virtual environment:

```sh
ratings_state="$HOME/Library/Application Support/behdaad-ratings"
"$ratings_state/venv/bin/python" "$ratings_state/publish.py" --now
```
