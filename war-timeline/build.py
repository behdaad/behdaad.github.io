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
<h3 id="title-{entry['id']}">{esc(entry['title'])}</h3>
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
        count = len(year_events)
        year_sections.append(
            f'<details class="timeline-year" id="year-{year}" style="grid-row:{year-first+1}" open>'
            f'<summary><span class="year-pill">{year}<span class="year-chevron" aria-hidden="true"></span></span>'
            f'<span class="sr-only"> · {count} historical {"event" if count == 1 else "events"}</span></summary>'
            f'<div class="year-body"><div class="year-events">'
            + ''.join(event(item, i) for i, item in year_events) + '</div></div></details>'
        )
    def span_bounds(entry):
        anchors = [event_map[event_id]['year'] for event_id in entry['events']]
        return min([entry['coverage'][0][0]] + anchors), max([entry['coverage'][-1][1]] + anchors)

    # Reserve the envelope, including contextual event anchors, so dots never land on another title's bar.
    lane_ends = []
    lanes = {}
    for entry in sorted(entries, key=lambda item: (span_bounds(item)[0], -span_bounds(item)[1])):
        start, end = span_bounds(entry)
        lane = next((i for i, until in enumerate(lane_ends) if until < start), len(lane_ends))
        if lane == len(lane_ends):
            lane_ends.append(end)
        else:
            lane_ends[lane] = end
        lanes[entry['id']] = lane + 1

    film_spans = []
    span_markers = []
    overview_rows = []
    for entry in entries:
        lane = lanes[entry['id']]
        ranges = []
        for part, (start, end) in enumerate(entry['coverage']):
            label = f'{entry["number"]} · {entry["title"]} · {coverage(entry)}' if part == 0 else entry['number']
            film_spans.append(
                f'<a class="film-span" data-story="{entry["id"]}" href="#story-{entry["id"]}" '
                f'style="--lane:{lane};--story:{esc(entry["color"])};grid-row:{start-first+1}/{end-first+2}" '
                f'title="{esc(entry["title"])} · Main story {coverage(entry)}" '
                f'aria-label="{esc(entry["title"])}: main story {coverage(entry)}; open details">'
                f'<span class="span-label">{esc(label)}</span></a>'
            )
            interval = str(start) if start == end else f'{start}–{end}'
            ranges.append(
                f'<span class="overview-range" style="--start:{(start-first)/len(years)*100:.5f}%;'
                f'--length:{(end-start+1)/len(years)*100:.5f}%">{interval}</span>'
            )
        for event_id in entry['events']:
            item = event_map[event_id]
            relation = entry.get('eventNotes', {}).get(event_id, 'Event connection')
            marker_label = f'{entry["title"]} · {item["title"]} · {relation}'
            span_markers.append(
                f'<a class="span-event" data-marker-story="{entry["id"]}" data-event-link="{event_id}" '
                f'href="#event-{event_id}" style="--lane:{lane};--story:{esc(entry["color"])};'
                f'grid-row:{item["year"]-first+1}" title="{esc(marker_label)}" aria-label="{esc(marker_label)}">'
                '<span class="sr-only">Event connection</span></a>'
            )
        overview_rows.append(
            f'<div class="overview-row" style="--story:{esc(entry["color"])}">'
            f'<a class="overview-title" href="#story-{entry["id"]}" data-story="{entry["id"]}">'
            f'{number(entry)}<span>{esc(entry["title"])}</span><small>★ {esc(entry["rating"])}</small></a>'
            f'<a class="overview-track" href="#story-{entry["id"]}" data-story="{entry["id"]}" '
            f'aria-label="{esc(entry["title"])}: main story {coverage(entry)}; open details">'
            + ''.join(ranges) + '</a></div>'
        )
    overview_axis = ''.join(f'<a href="#year-{year}" data-year="{year}">{year}</a>' for year in years)
    overview_events = []
    for year in years:
        links = ''.join(
            f'<a href="#event-{item["id"]}" data-event-link="{item["id"]}" '
            f'title="{esc(item["title"])}" aria-label="{year}: {esc(item["title"])}">{i:02}</a>'
            for i, item in enumerate(events, 1) if item['year'] == year
        )
        overview_events.append('<span>' + links + '</span>')
    body = template('timeline.html', {
        'year_sections': ''.join(year_sections),
        'film_spans': ''.join(film_spans),
        'span_markers': ''.join(span_markers),
        'lane_count': len(lane_ends),
        'event_column': len(lane_ends) + 1,
        'overview_rows': ''.join(overview_rows),
        'overview_axis': overview_axis,
        'overview_events': ''.join(overview_events),
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
