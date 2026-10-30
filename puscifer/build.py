#!/usr/bin/env python3
"""Render a complete, readable static guide from data.json."""
import json
from datetime import date
from html import escape as e
from pathlib import Path
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parent

def anchor(label, url, cls=''):
    return f'<a class="{cls}" href="{e(url, quote=True)}" target="_blank" rel="noopener noreferrer">{e(label)} <span aria-hidden="true">↗</span></a>'

def is_apple_music_url(url):
    return urlsplit(url).hostname == 'music.apple.com'

def display_date(value):
    if len(value) == 4: return value + ' · year only'
    d = date.fromisoformat(value)
    return f'{d.day:02} {d:%b %Y}'

def era(value):
    year = int(value[:4])
    for i, end in enumerate([2007, 2011, 2015, 2020, 2024]):
        if year < end: return i
    return 5

ERAS = [
    ('1995—2006', 'Before the record', 'A fictional band becomes a soundtrack credit. Comedy and collaboration are there from the beginning.'),
    ('2007—2010', 'Body, beat & bad manners', 'The first album, the first live shows, the first detours. Electronics make room for melody and the Arizona landscape.'),
    ('2011—2014', 'Meet the Bergers', 'Conditions of My Parole and the early concert film turn the songs into a strange little community.'),
    ('2015—2019', 'Into the wrestling ring', 'Money Shot opens out: desert panoramas, masked wrestlers and a deeper conversation between the voices.'),
    ('2020—2023', 'Observe. Question. Repeat.', 'Existential Reckoning brings synthetic textures, alien investigations and a run of films that reframe the back catalog.'),
    ('2024—2026', 'Normal isn’t', 'Birthday collaborations lead into the fifth album, a new cast, comics and the show waiting in Amsterdam.'),
]

def render_item(x, number):
    ident = e(x['id'], quote=True)
    links = ''.join(anchor(l['label'], l['url'], 'media-link apple-music-navigation' if is_apple_music_url(l['url']) else 'media-link') for l in x['links'])
    sources = list(dict.fromkeys(x.get('sources', []) + ([x['sourcesNote']] if x.get('sourcesNote') else [])))
    evidence = ''.join(f'<li>{anchor("Source " + str(i+1), u)}</li>' for i,u in enumerate(sources))
    tracks = '<p class="track-label">Tracks on the official shop edition</p><ol class="tracks">' + ''.join(f'<li>{e(t)}</li>' for t in x['tracks']) + '</ol>' if x.get('tracks') else ''
    alternative = '<p>Alternative edition: ' + ' · '.join(anchor('Apple Music · deluxe',l['url']) for l in x['also']) + '. Bonus material includes The Undertaker (Spanish Fly Mix), Lighten Up, Francis, and additional Queen B and Momma Sed mixes.</p>' if x.get('also') else ''
    note = e(x.get('dateNote', 'Release date checked against the linked catalog or announcement. Later editions can carry different dates.'))
    tags = ''.join(f'<span>{e(c)}</span>' for c in x['characters'])
    minutes = f' · {x["minutes"]:g} min' if x.get('minutes') else ''
    badge = '<span class="essential-tag">Before the show</span>' if x['essential'] else ''
    image = f'<img class="record-art" src="assets/{ident}.jpg" width="112" height="112" loading="lazy" alt="{e(x["title"],quote=True)} cover">' if x.get('localImage') else ''
    search = e(' '.join([x['title'], x['text'], x['kind'], *x['characters'], *x.get('tracks', [])]).lower(), quote=True)
    return f'''<article class="entry{' featured' if image else ''}" id="{ident}" data-id="{ident}" data-date="{x['date']}" data-kind="{e(x['kind'])}" data-essential="{str(x['essential']).lower()}" data-extra="{str(x['extra']).lower()}" data-characters="{e('|'.join(x['characters']),quote=True)}" data-search="{search}">
      <div class="entry-check"><input type="checkbox" id="check-{ident}" disabled aria-label="Mark {e(x['title'],quote=True)} as consumed"><label for="check-{ident}"><span aria-hidden="true">✓</span><span class="sr-only">Mark {e(x['title'])} as consumed</span></label><span class="entry-number" aria-hidden="true">{number:03}</span></div>
      <div class="entry-body"><div class="entry-meta"><time datetime="{x['date']}">{display_date(x['date'])}</time><span>{e(x['kind'])}{minutes}</span>{badge}</div>
      <h4>{e(x['title'])}</h4><p>{e(x['text'])}</p><div class="media-links">{links}</div>
      <details class="entry-details"><summary>Notes & sources</summary><div class="detail-body"><p>{note}</p>{f'<p>{e(x["access"])}</p>' if x.get('access') else ''}{tracks}{alternative}{f'<div class="character-tags">{tags}</div>' if tags else ''}<ul class="source-links">{evidence}</ul></div></details></div>{image}
    </article>'''

def build():
    data = json.loads((ROOT/'data.json').read_text()); items = data['items']
    assert len({x['id'] for x in items}) == len(items), 'Duplicate IDs break saved progress'
    assert items == sorted(items, key=lambda x:(x['date'] if len(x['date'])==10 else x['date']+'-12-31',0 if x['kind'] in ['Album','EP'] else 1,x['id'])), 'Chronology is not sorted'
    sections = []
    for n, (years,title,desc) in enumerate(ERAS):
        rows = [render_item(x, i+1) for i,x in enumerate(items) if era(x['date']) == n]
        sections.append(f'<section class="era" id="era-{n}"><header class="era-heading"><p class="eyebrow">Chapter {n+1:02} / {years}</p><h3>{title}</h3><p>{desc}</p></header><div class="era-entries">'+''.join(rows)+'</div></section>')
    kinds = ''.join(f'<option value="{e(k)}">{e(k)}</option>' for k in sorted({x['kind'] for x in items}))
    chars = ''.join(f'<option>{e(c)}</option>' for c in ['Bellendia Black','Billy D','Dick Merkin','Fanny Grey','Hildy Berger','Luchafer','Major Douche','Peter Merkin','Pusciforce','The Briefcase','The Synth Whisperer'])
    template=(ROOT/'template.html').read_text()
    for key,value in {'ENTRIES':''.join(sections),'KINDS':kinds,'CHARACTERS':chars,'TOTAL':str(len(items)),'ESSENTIALS':str(sum(x['essential'] for x in items)),'JOURNEY':str(sum(not x['extra'] for x in items))}.items():
        template=template.replace('{{'+key+'}}',value)
    (ROOT/'index.html').write_text(template)
    print(f'Rendered {len(items)} items across {len(ERAS)} chapters.')

if __name__ == '__main__': build()
