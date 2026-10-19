"""Rebuild the standalone archive after editing matches.json: python3 tennis/build.py."""
from pathlib import Path
import json, html, datetime
ROOT = Path(__file__).resolve().parent
matches = json.loads((ROOT / 'matches.json').read_text())
e = lambda value: html.escape(str(value), quote=True)
audit_path = ROOT / 'video-audit.json'
audit = {v['id']: v for v in json.loads(audit_path.read_text())['videos']} if audit_path.exists() else {}
def duration(video):
    seconds = int(audit.get(video['id'], {}).get('durationSeconds') or 0)
    if not seconds: return ''
    return f'{seconds // 3600}:{seconds % 3600 // 60:02}:{seconds % 60:02}' if seconds >= 3600 else f'{seconds // 60}:{seconds % 60:02}'
cards=[]
for i,m in enumerate(matches):
    year=m['date'][:4]; names=' vs '.join(m['players']); v=m['videos'][0]
    date=datetime.date.fromisoformat(m['date']).strftime('%d %b %Y').lstrip('0')
    extra=''.join(f'<a href="https://www.youtube.com/watch?v={e(vv["id"])}" target="_blank" rel="noopener noreferrer">{e(vv["title"])} ↗</a>' for vv in m['videos'][1:])
    refs=''.join(f'<li><a href="{e(s["url"])}" target="_blank" rel="noopener noreferrer">{e(s["title"])} ↗</a></li>' for s in m['sources'])
    cards.append(f'''<article class="match" id="{e(m['id'])}">
<div class="timeline-date"><span>{year}</span><time datetime="{m['date']}">{date}</time><span class="timeline-dot" aria-hidden="true"></span></div>
<div class="match-content"><div class="match-topline"><span class="surface {m['surface'].lower()}">{e(m['surface'])}</span><span>{e(m['event'])} / {e(m['stage'])}</span><span class="origin {'added' if m['origin']=='discovery' else ''}">{'＋ Beyond the playlist' if m['origin']=='discovery' else 'From your playlist'}</span></div>
<div class="match-body"><div class="match-copy"><h3><a href="#{e(m['id'])}">{e(m['players'][0])}<span class="versus">vs</span>{e(m['players'][1])}</a></h3><h4>{e(m['headline'])}</h4><p>{e(m['why'])}</p><details><summary>Match sources &amp; more footage</summary><ul>{refs}</ul>{f'<div class="extra-footage">{extra}</div>' if extra else ''}</details></div>
<div class="video-column"><div class="video-shell" data-video="{v['id']}" data-title="{e(names+' · '+m['event']+' '+year)}"><button class="video-play" type="button" aria-label="Play {e(names)} highlights"><img src="https://i.ytimg.com/vi/{v['id']}/hqdefault.jpg" alt="" width="480" height="360" loading="lazy"><span class="play-symbol" aria-hidden="true">▶</span><span class="video-overlay">PLAY HIGHLIGHTS <span>{duration(v)}</span></span></button></div><div class="video-caption"><span>{e(v['channel'])}</span><a href="https://www.youtube.com/watch?v={v['id']}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a></div><noscript><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/{v['id']}" title="{e(names)} highlights" allow="encrypted-media; picture-in-picture; fullscreen" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe></noscript></div></div></div></article>''')
page='''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#142d27"><meta name="description" content="A chronological collection of extraordinary tennis matches. Explore classic rivalries, impossible comebacks and official highlights, from 1980 to 2025."><title>To the Limit — A tennis match archive</title><link rel="icon" href="favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="styles.css"><script src="app.js" defer></script><noscript><style>.video-shell{display:none}</style></noscript></head>
<body><a class="skip-link" href="#archive">Skip to match archive</a>
<header class="masthead"><a class="brand" href="./"><span class="brand-ball" aria-hidden="true">◒</span> TO THE LIMIT<span class="brand-note">A TENNIS ARCHIVE</span></a><nav aria-label="Main"><a href="#archive">The matches <span>↙</span></a><a href="https://www.youtube.com/playlist?list=PLBrgqZ_qXv7EuHWi05VrZgjKb2f8pXIpP" target="_blank" rel="noopener noreferrer">The original playlist ↗</a></nav></header>
<main><section class="hero" aria-labelledby="hero-title"><div class="hero-copy"><p class="eyebrow"><span class="tiny-ball"></span> GREAT TENNIS TAKES TWO.</p><h1 id="hero-title">To the<br><em>limit.</em></h1><p class="hero-description">One more ball. One more answer.<br>A collection of matches where extraordinary opponents bring out something extraordinary in each other.</p><a class="hero-link" href="#archive">Explore the timeline <span>↓</span></a></div>
<div class="hero-art" aria-hidden="true"><div class="court"><div class="court-singles"></div><div class="service-line"></div><div class="centre-line"></div><div class="net"></div><svg class="rally-path" viewBox="0 0 400 500"><path d="M95 410 Q360 240 160 115 Q70 60 280 70"/><circle cx="95" cy="410" r="7"/><circle cx="280" cy="70" r="11"/></svg></div><span class="court-label court-label-top">ADVANTAGE, NEITHER.</span><span class="art-score">40<span>—</span>40</span><span class="court-label court-label-bottom">THE BEAUTY IS IN THE RESISTANCE.</span></div>
<div class="hero-footer"><span>1980 — 2025</span><span>62 MATCHES / 54 FROM YOUR PLAYLIST / 8 DISCOVERIES</span><span>SCROLL TO REPLAY ↙</span></div></section>
<section class="intro-note"><p class="eyebrow">AN OPEN-ENDED WATCHLIST</p><p>Not a ranking. A timeline of nerve, invention and refusal to give in. Your playlist is the starting point; a few earlier classics and women’s matches widen the view. <span>Historic milestones stay, even when the score was less close.</span></p></section>
<section class="archive" id="archive" aria-labelledby="archive-title"><div class="archive-heading"><div><p class="eyebrow">POINTS WORTH RETURNING TO</p><h2 id="archive-title">The match archive<span>.</span></h2></div><p>62 matches · oldest first</p></div>
<div id="timeline">__CARDS__</div></section>
<section class="curation-note" id="about"><p class="eyebrow">ABOUT THE SELECTION</p><div><h2>A good opponent makes<br>a great match.</h2><p>The eight additions broaden the playlist with earlier rivalries and women’s singles. Selection notes are editorial; tournament archives and footage are linked on each match. Official tournament or tour highlights are preferred for additions and replacement cuts, with extended coverage where available.</p><p>All 56 public playlist videos are retained across 54 match entries. Extra clips sit with their match; three fuller highlight cuts are offered alongside the originals. Some original videos are single-game edits, winners compilations or recaps, as their titles indicate.</p><p>Press play to load a YouTube embed. If a video is unavailable in your region or the owner limits embedding, use its YouTube link. Match notes discuss results.</p><p class="checked">CURATED 19 OCTOBER 2026 · A SNAPSHOT, NOT A LIVE PLAYLIST SYNC</p></div></section></main>
<footer><a class="brand" href="./">◒ TO THE LIMIT</a><span>A personal collection. An endless conversation.</span><a href="/">behdaad.me ↗</a></footer></body></html>'''
(ROOT/'index.html').write_text(page.replace('__CARDS__','\n'.join(cards)))
print('Built tennis/index.html with',len(matches),'static match entries')
