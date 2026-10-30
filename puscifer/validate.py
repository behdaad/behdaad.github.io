#!/usr/bin/env python3
"""Validate guide integrity, source coverage and the generated static page."""
import json
import re
from datetime import date
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlparse, unquote
from build import build
ROOT = Path(__file__).resolve().parent

def validate():
    data=json.loads((ROOT/'data.json').read_text()); items=data['items']
    ledger=json.loads((ROOT/'research/source-ledger.json').read_text())
    ids={x['id'] for x in items}
    assert len(ids)==len(items), 'Duplicate progress IDs'
    assert {x['id'] for x in items if x['kind']=='Album'} == {'vagina','conditions','money','existential','normal'}, 'Five studio albums must remain covered'
    assert len([x for x in items if x['kind']=='Comic']) == 4, 'Current comic series coverage changed'
    assert len(ledger['youtube'])==125
    assert len({x['id'] for x in ledger['youtube']})==125
    for upload in ledger['youtube']:
        assert upload['entry'] in ids, f'Unaccounted official upload: {upload["id"]}'
        parent=next(x for x in items if x['id']==upload['entry'])
        assert any(link['url']==upload['url'] for link in parent['links']), f'Upload link missing: {upload["id"]}'
    tv_films={'blood','what-film','berger','arcosanti-film','billy-film','curmudgeon','versatile-film','violator-film','easter','global-film','jiujitsu','normal-film'}
    assert tv_films <= ids, 'Missing a film from the official TV navigation'
    for x in items:
        assert x['links'] and x['sources'], f'Missing access/source link: {x["id"]}'
        assert re.fullmatch(r'[a-zA-Z0-9_-]+',x['id']), 'ID unsafe for stable anchors'
        assert x['date'] <= data['checked'], f'Release after research cutoff: {x["id"]}'
        if len(x['date'])==10:date.fromisoformat(x['date'])
        else: assert len(x['date'])==4 and 'year' in x['dateNote'].lower()
        for l in x['links']:
            assert urlparse(l['url']).scheme=='https', f'Unsafe access link: {x["id"]}'
        for s in x['sources']:assert urlparse(s).scheme=='https'
    # Rebuilding must reproduce the checked-in page exactly.
    before=(ROOT/'index.html').read_text(); build()
    assert before==(ROOT/'index.html').read_text(), 'Generated HTML was stale; review the rebuilt index.html'
    class Page(HTMLParser):
        def __init__(self):super().__init__();self.ids=[];self.local=[];self.entry_count=0;self.check_count=0
        def handle_starttag(self,tag,attrs):
            a=dict(attrs)
            if 'id' in a:self.ids.append(a['id'])
            if tag=='article' and 'entry' in a.get('class','').split():self.entry_count+=1
            if tag=='input' and a.get('type')=='checkbox' and a.get('id','').startswith('check-'):
                self.check_count+=1;assert 'disabled' in a, 'No-JS checkboxes must not imply saved state'
            for attr in ['src','href']:
                value=a.get(attr,'')
                if value and not value.startswith(('https:','http:','data:','#')):self.local.append(value)
            if tag=='a' and a.get('href','').startswith('https:'):
                assert a.get('target')=='_blank' and 'noopener' in a.get('rel',''), 'Unsafe new-tab link'
    page=Page();page.feed(before)
    assert len(page.ids)==len(set(page.ids)), 'Duplicate HTML IDs'
    assert page.entry_count==page.check_count==len(items), 'Missing rendered entry/checkbox'
    for value in page.local:assert (ROOT/unquote(value.split('#')[0])).is_file(), f'Missing local asset: {value}'
    assert '{{' not in before, 'Unreplaced template token'
    assert 'fetch(' not in (ROOT/'app.js').read_text(), 'Guide should work without a runtime content fetch'
    print(f'Validated {len(items)} entries, 125 official uploads, 12 TV films, four comics, stable IDs, source links and local assets.')

if __name__=='__main__':validate()
