#!/usr/bin/env python3
"""Generate the year-by-year timeline and connected viewing guide: python3 war-timeline/build.py world-war-i"""
import json
import re
import sys
from hashlib import sha256
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent


def esc(value):
    return escape(str(value), quote=True)


def template(name, values):
    content = (ROOT / 'templates' / name).read_text()
    return re.sub(r'\{\{([a-z_]+)\}\}', lambda match: str(values[match[1]]), content)


def generate(folder):
    data = json.loads((folder / 'data.json').read_text())
    entries, events = data['entries'], data['events']
    first, last = data['startYear'], data['endYear']
    years = list(range(first, last + 1))
    event_map = {e['id']: e for e in events}
    if len({e['id'] for e in entries}) != len(entries) or len(event_map) != len(events):
        raise ValueError('IDs must be unique within entries and events')
    if not years or not entries:
        raise ValueError('The timeline needs ordered year bounds and at least one entry')
    for item in entries + events:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', item['id']):
            raise ValueError('IDs must use lowercase letters, digits and hyphens')
    for event_item in events:
        if not first <= event_item['year'] <= last:
            raise ValueError('Event outside timeline')
    for n, entry in enumerate(entries, 1):
        entry['number'] = f'{n:02}'
        if not re.fullmatch(r'#[0-9a-fA-F]{6}', entry['color']):
            raise ValueError('Story colours must be six-digit hex values')
        if not entry['coverage']:
            raise ValueError('Entries need at least one main-story interval')
        previous_end = first - 1
        for start, end in entry['coverage']:
            if not first <= start <= end <= last or start <= previous_end:
                raise ValueError('Coverage must be ordered, non-overlapping and within the timeline')
            previous_end = end
        for event_id in entry['events']:
            if event_id not in event_map:
                raise ValueError(f'Unknown event: {event_id}')

    def source_links(item):
        links = []
        for source in item.get('sources', []):
            if not source['url'].startswith(('https://', 'http://')):
                raise ValueError('Source URLs must use HTTP(S)')
            links.append(
                f'<a href="{esc(source["url"])}" target="_blank" '
                f'rel="noopener noreferrer">{esc(source["label"])} ↗</a>'
            )
        return '<div class="source-links">' + ' · '.join(links) + '</div>' if links else ''

    def score(entry):
        url = entry['imdbUrl']
        if not re.fullmatch(r'https://www\.imdb\.com/title/tt\d+/', url):
            raise ValueError('Use a direct HTTPS IMDb title URL')
        return (
            f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">'
            f'★ {esc(entry["rating"])} <small>/10 IMDb ↗</small></a>'
            f'<small class="score-date">CHECKED {esc(entry["ratingChecked"])}</small>'
        )

    def coverage(entry):
        return ', '.join(str(a) if a == b else f'{a}–{b}' for a, b in entry['coverage'])

    def runtime(entry):
        if entry['format'] == 'Series':
            return f'{entry["episodes"]} × {entry["episodeMinutes"]} min'
        return f'{entry["minutes"]} min'

    def number(entry):
        return f'<span class="number" style="--story:{esc(entry["color"])}">{entry["number"]}</span>'

    def coverage_strip(entry):
        cells = []
        for year in years:
            active = any(a <= year <= b for a, b in entry['coverage'])
            if active:
                cells.append(
                    f'<a class="coverage-year covered" href="#year-{year}" data-year="{year}" '
                    f'data-coverage-story="{entry["id"]}" aria-label="{esc(entry["title"])}: main story in {year}">{year}</a>'
                )
            else:
                cells.append(f'<span class="coverage-year" aria-hidden="true">{year}</span>')
        return '<div class="coverage-strip" aria-label="Main-story years: ' + coverage(entry) + '">' + ''.join(cells) + '</div>'

    def related(entry):
        chips = []
        for event_id in entry['events']:
            note = entry.get('eventNotes', {}).get(event_id)
            prefix = f'{esc(note)} · ' if note else ''
            chips.append(
                f'<a class="event-chip" href="#event-{event_id}" data-event-link="{event_id}">'
                f'{prefix}{event_map[event_id]["year"]} · {esc(event_map[event_id]["title"])}</a>'
            )
        return ''.join(chips)

    def card(entry):
        return f'''<article class="story-card" id="story-{entry['id']}" data-card="{entry['id']}" style="--story:{esc(entry['color'])}">
<div class="card-index">{number(entry)}</div>
<div class="card-main">
<div class="card-meta"><span>{esc(entry['format'])} / {entry['releaseYear']}</span><span>{runtime(entry)}</span><span class="score">{score(entry)}</span></div>
<h3>{esc(entry['title'])}</h3>
<p class="coverage-label">MAIN STORY <strong>{coverage(entry)}</strong></p>
{coverage_strip(entry)}
<p class="premise">{esc(entry['premise'])}</p>
<p class="learning"><b>What you’ll learn</b> {esc(entry['learn'])}</p>
<div class="event-chips" aria-label="Related events">{related(entry)}</div>
<details><summary>Story dates &amp; historical context</summary><p>{esc(entry['coverageNote'])}</p>{source_links(entry)}</details>
</div></article>'''

    def event(item, index):
        links = []
        for entry in entries:
            if item['id'] not in entry['events']:
                continue
            relation = entry.get('eventNotes', {}).get(item['id'], 'Watch for this event')
            links.append(
                f'<a class="event-watch" data-story="{entry["id"]}" href="#story-{entry["id"]}">'
                f'{number(entry)}<span>{esc(entry["title"])}<small>{esc(relation)} · Main story {coverage(entry)}</small></span>'
                '<span aria-hidden="true">↗</span></a>'
            )
        label = item.get('dateLabel', item['year'])
        gap = f'<p class="coverage-gap">{esc(item["gapNote"])}</p>' if item.get('gapNote') else ''
        return f'''<article class="event-note" id="event-{item['id']}" data-event-note="{item['id']}">
<button class="event-year" type="button" data-event="{item['id']}" aria-label="Highlight stories connected to {esc(item['title'])}"><span>{index:02} / {esc(label)}</span><span>↗</span></button>
<h3>{esc(item['title'])}</h3><p>{esc(item['description'])}</p>
<div class="event-watches">{''.join(links)}</div>{gap}
<details class="event-sources"><summary>Historical sources</summary>{source_links(item)}</details></article>'''

    year_sections = []
    for year in years:
        year_events = [(i, item) for i, item in enumerate(events, 1) if item['year'] == year]
        active_entries = [entry for entry in entries if any(a <= year <= b for a, b in entry['coverage'])]
        movie_links = ''.join(
            f'<a class="year-film" href="#story-{entry["id"]}" data-story="{entry["id"]}" '
            f'style="--story:{esc(entry["color"])}">{number(entry)}<span>{esc(entry["title"])}'
            f'<small>{coverage(entry)}</small></span></a>' for entry in active_entries
        )
        screen = (
            f'<div class="year-screen"><h3>On screen in {year}</h3><p>Main-story coverage · titles can span several years</p>'
            f'<div class="year-films">{movie_links}</div></div>' if movie_links else ''
        )
        count = len(year_events)
        year_sections.append(
            f'<details class="timeline-year" id="year-{year}" open>'
            f'<summary><span class="year-pill">{year}<span class="year-chevron" aria-hidden="true"></span></span>'
            f'<span class="sr-only"> · {count} historical {"event" if count == 1 else "events"}, '
            f'{len(active_entries)} {"title" if len(active_entries) == 1 else "titles"} set in this year</span></summary>'
            f'<div class="year-body">{screen}<div class="year-events">'
            + ''.join(event(item, i) for i, item in year_events) + '</div></div></details>'
        )
    body = template('timeline.html', {
        'year_sections': ''.join(year_sections),
        'year_links': ''.join(f'<a href="#year-{year}" data-year="{year}">{year}</a>' for year in years),
        'cards': ''.join(card(entry) for entry in entries),
        'route_title': f'{len(entries)} films & series',
    })
    total = sum(
        entry['episodes'] * entry['episodeMinutes'] if entry['format'] == 'Series' else entry['minutes']
        for entry in entries
    )
    connections = {
        'entries': [{'id': e['id'], 'title': e['title'], 'events': e['events']} for e in entries],
        'events': [{'id': e['id'], 'title': e['title']} for e in events],
    }
    html = template('shell.html', {
        'page_title': esc(f'{data["title"]} — A history worth watching'),
        'description': esc(data['subtitle']),
        'year_count': len(years),
        'strip_columns': min(len(years), 7),
        'entry_count': f'{len(entries):02}',
        'asset': '../war-timeline',
        'style_version': sha256((ROOT / 'styles.css').read_bytes()).hexdigest()[:12],
        'script_version': sha256((ROOT / 'app.js').read_bytes()).hexdigest()[:12],
        'title': esc(data['title']),
        'subtitle': esc(data['subtitle']),
        'duration': f'≈ {total//60}H {total%60:02}M',
        'content_note': esc(data['introNote']),
        'scope_note': esc(data.get('scopeNote', '')),
        'closing_note': esc(data.get('closingNote', 'Films are selected for engaging viewing, not as substitutes for the historical sources.')),
        'research_date': esc(data['researchDate']),
        'connections': json.dumps(connections).replace('<', '\u003c'),
        'body': body,
    })
    (folder / 'index.html').write_text(html)
    print(folder / 'index.html')


if __name__ == '__main__':
    generate(Path(sys.argv[1]).resolve())
