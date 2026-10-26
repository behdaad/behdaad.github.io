#!/usr/bin/env python3
"""Generate all three static layouts: python3 war-timeline/build.py world-war-i"""
import json
import re
import sys
from html import escape
from pathlib import Path

ROOT = Path(__file__).resolve().parent

def esc(value):
    return escape(str(value), quote=True)

def template(name, values):
    result = (ROOT / 'templates' / name).read_text()
    for key, value in values.items():
        result = result.replace('{{' + key + '}}', str(value))
    return result

def generate(folder):
    data = json.loads((folder / 'data.json').read_text())
    entries, events = data['entries'], data['events']
    demo = data.get('demo', True)
    first, last = data['startYear'], data['endYear']
    years = list(range(first, last + 1))
    event_map = {e['id']: e for e in events}
    entry_map = {e['id']: e for e in entries}
    if len(entry_map) != len(entries) or len(event_map) != len(events):
        raise ValueError('IDs must be unique within entries and events')
    for item in entries + events:
        if not re.fullmatch(r'[a-z0-9]+(?:-[a-z0-9]+)*', item['id']):
            raise ValueError('IDs must use lowercase letters, digits and hyphens')
    for event_item in events:
        if not first <= event_item['year'] <= last:
            raise ValueError('Event outside timeline')
    for n, entry in enumerate(entries, 1):
        entry['number'] = f'{n:02}'
        previous_end = first - 1
        for start, end in entry['coverage']:
            if start <= previous_end:
                raise ValueError('Coverage intervals must be ordered and non-overlapping')
            previous_end = end
            if not first <= start <= end <= last:
                raise ValueError(f'Coverage outside timeline: {entry["id"]}')
        for event_id in entry['events']:
            if event_id not in event_map:
                raise ValueError(f'Unknown event: {event_id}')
    def source_links(item):
        links = []
        for source in item.get('sources', []):
            if not source['url'].startswith(('https://', 'http://')):
                raise ValueError('Source URLs must use HTTP(S)')
            links.append(f'<a href="{esc(source["url"])}" target="_blank" rel="noopener noreferrer">{esc(source["label"])} ↗</a>')
        return '<div class="source-links">' + ' · '.join(links) + '</div>' if links else ''
    def score(e):
        if demo:
            return f'★ {esc(e["rating"])} <small>DEMO SCORE</small>'
        url = e.get('imdbUrl', '')
        if url and not url.startswith('https://www.imdb.com/title/'):
            raise ValueError('Use a direct HTTPS IMDb title URL')
        label = f'★ {esc(e["rating"])} <small>IMDb</small>'
        link = f'<a href="{esc(url)}" target="_blank" rel="noopener noreferrer">{label}</a>' if url else label
        return link + f'<small> CHECKED {esc(e.get("ratingChecked", "date unavailable"))}</small>'
    def coverage(e):
        return ', '.join(str(a) if a == b else f'{a}–{b}' for a, b in e['coverage'])
    def runtime(e):
        return f'{e["episodes"]} × {e["episodeMinutes"]} min' if e['format'] == 'Series' else f'{e["minutes"]} min'
    def number(e):
        return f'<span class="number" style="--story:{esc(e["color"])}">{e["number"]}</span>'
    def track(e, link=True):
        bars = ''
        for a, b in e['coverage']:
            style = f'--start:{(a-first)/len(years)*100:.5f}%;--length:{(b-a+1)/len(years)*100:.5f}%;--story:{e["color"]}'
            label = str(a) if a == b else f'{a}–{b}'
            bars += f'<span class="range" style="{esc(style)}"><span>{label}</span></span>'
        return f'<a class="track story-target" data-story="{esc(e["id"])}" href="#story-{esc(e["id"])}" aria-label="{esc(e["title"])}: main story {coverage(e)}">{bars}</a>' if link else f'<div class="track" role="img" aria-label="Main-story years: {coverage(e)}">{bars}</div>'
    def related(e):
        return ''.join(f'<button type="button" class="event-chip" data-event="{esc(i)}">{event_map[i]["year"]} · {esc(event_map[i]["title"])}</button>' for i in e['events'])
    def card(e, strip=False):
        mini = f'<div class="mini-timeline"><div class="axis">{year_labels}</div>{track(e, False)}</div>' if strip else ''
        return f'''<article class="story-card" id="story-{esc(e['id'])}" data-card="{esc(e['id'])}" style="--story:{esc(e['color'])}">
<div class="card-index">{number(e)}<span>WATCH {e['number']}</span></div><div class="card-main"><div class="card-meta"><span>{esc(e['format'])} / {e['releaseYear']}</span><span>{runtime(e)}</span><span class="score">{score(e)}</span></div><h3>{esc(e['title'])}</h3><p class="premise">{esc(e['premise'])}</p>{mini}<p class="coverage-label">MAIN STORY <strong>{coverage(e)}</strong></p><p class="learning"><b>What you’ll learn</b> {esc(e['learn'])}</p><div class="event-chips" aria-label="Related events">{related(e)}</div><details><summary>About these story dates</summary><p>{esc(e['coverageNote'])}</p>{source_links(e)}</details></div></article>'''
    def event(e):
        linked = [x for x in entries if e['id'] in x['events']]
        links = ''.join(f'<a class="event-watch story-target" data-story="{esc(x["id"])}" href="#story-{esc(x["id"])}">{number(x)}<span>{esc(x["title"])}</span><span aria-hidden="true">↗</span></a>' for x in linked)
        return f'<article class="event-note" id="event-{esc(e["id"])}" data-event-note="{esc(e["id"])}"><button class="event-year" type="button" data-event="{esc(e["id"])}" aria-label="Highlight stories connected to {esc(e["title"])}">{e["year"]} <span>↗</span></button><h3>{esc(e["title"])}</h3><p>{esc(e["description"])}</p><div class="event-watches">{links}</div>{source_links(e)}</article>'
    year_labels = ''.join(f'<span>{y}</span>' for y in years)
    common = {'years': year_labels, 'cards': ''.join(card(e) for e in entries), 'events': ''.join(event(e) for e in events)}
    chart_rows = ''.join(f'<div class="chart-row" data-chart-row="{esc(e["id"])}"><a class="chart-title story-target" data-story="{esc(e["id"])}" href="#story-{esc(e["id"])}">{number(e)}<span>{esc(e["title"])}</span></a>{track(e)}</div>' for e in entries)
    dots = ''.join(f'<button type="button" data-event="{esc(e["id"])}" style="grid-column:{e['year'] - first + 1}" aria-label="{e["year"]}: {esc(e["title"])}"><span>◆</span><small>{i+1:02}</small></button>' for i, e in enumerate(events))
    key = ''.join(f'<a class="story-target" data-story="{esc(e["id"])}" href="#story-{esc(e["id"])}">{number(e)}<span>{esc(e["title"])}</span></a>' for e in entries)
    vertical_rows = ''
    for y in years:
        lanes = ''
        for e in entries:
            active = any(a <= y <= b for a, b in e['coverage'])
            lanes += f'<a class="lane {"active" if active else ""} story-target" data-story="{esc(e["id"])}" style="--story:{esc(e["color"])}" href="#story-{esc(e["id"])}" aria-label="{esc(e["title"])}: {"covers" if active else "does not cover"} {y}">{e["number"] if active else ""}</a>' if active else '<span class="lane"></span>'
        vertical_rows += f'<div class="vertical-row"><div>{"".join(event(e) for e in events if e["year"] == y) or f"<p>{y}</p>"}</div><div class="lanes">{lanes}</div></div>'
    layouts = [('', 'chart.html', 'The whole picture.', 'Compare overlapping stories against a single shared timeline.', 'Chart + reading list'), ('vertical', 'vertical.html', 'Follow the years.', 'Walk through events, with story coverage running beside them.', 'Vertical timeline'), ('watchlist', 'watchlist.html', 'One story at a time.', 'A viewing route with a little historical context at every stop.', 'Watchlist first')]
    total = sum(e.get('minutes', e.get('episodes', 0) * e.get('episodeMinutes', 0)) for e in entries)
    for n, (sub, file, name, description, nav_name) in enumerate(layouts, 1):
        out = folder / sub
        out.mkdir(parents=True, exist_ok=True)
        prefix = '..' if sub else '.'
        base = '../..' if sub else '..'
        nav = ''.join(f'<a href="{prefix}/{other + "/" if other else ""}" {"aria-current=\"page\"" if other == sub else ""}><span>0{i}</span>{esc(label)}<b>↗</b></a>' for i, (other, _, _, _, label) in enumerate(layouts, 1))
        values = dict(common, route_title=f'Your {len(entries)}-story route', chart_rows=chart_rows, event_dots=dots, key=key, lane_labels=''.join(number(e) for e in entries), vertical_rows=vertical_rows, watchlist_cards=''.join(card(e, True) for e in entries))
        body = template(file, values)
        shell = template('shell.html', {'year_count': len(years), 'lane_count': len(entries), 'entry_count': f'{len(entries):02}', 'route_title': f'Your {len(entries)}-story route', 'description': esc('A fictional, three-layout demonstration of a reusable history-through-film timeline.' if demo else data['subtitle']), 'robots': '<meta name="robots" content="noindex">' if demo else '', 'banner': '<div class="demo-banner">DESIGN DEMO <span>Fictional events, titles &amp; ratings. Not a WW1 watchlist.</span></div>' if demo else '', 'content_note': esc(f'The dates below belong to an invented conflict ({first}–{last}). They exist only to demonstrate the design. Every score is a fictional IMDb-style placeholder.' if demo else data.get('introNote', 'Main-story coverage, curated for a short viewing journey. See each entry for sources and score-check dates.')),  'connections': json.dumps({'entries': [{'id': e['id'], 'title': e['title'], 'events': e['events']} for e in entries], 'events': [{'id': e['id'], 'title': e['title']} for e in events]}).replace('<', '\u003c'), 'page_title': esc(f'{data["title"]} — {nav_name} / UI demo'), 'asset': f'{base}/war-timeline', 'home': f'{prefix}/', 'title': esc(data['title']), 'subtitle': esc(data['subtitle']), 'duration': f'{total//60}H {total%60:02}M', 'navigation': nav, 'layout_number': f'{n:02}', 'layout_name': name, 'layout_description': description, 'body': body, 'guide': f'{base}/war-timeline/TEMPLATE.md'})
        (out / 'index.html').write_text(shell)
        print(out / 'index.html')

if __name__ == '__main__':
    generate(Path(sys.argv[1]).resolve())
