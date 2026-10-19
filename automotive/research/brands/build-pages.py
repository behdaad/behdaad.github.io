"""Generate the five buildless brand archives from the audited registry and media plan."""
import copy,html,importlib.util,json,re,urllib.parse
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
s=importlib.util.spec_from_file_location('catalog',HERE/'catalog.py');c=importlib.util.module_from_spec(s);s.loader.exec_module(c)
configs=json.loads((HERE/'brands.json').read_text());pages=json.loads((HERE/'pages.json').read_text());plan={p['key']:p for p in json.loads((HERE/'photo-plan.json').read_text())};manifest=json.loads((HERE/'image-credits.json').read_text()) if (HERE/'image-credits.json').exists() else {}
original=json.loads((ROOT/'data.json').read_text());prior={car['id']:car for car in original['cars']}
video_path=HERE/'videos.json';videos=json.loads(video_path.read_text()) if video_path.exists() else {}
def clean(text):
 text=re.sub(r'\.mw-parser-output[^{}]*\{[^{}]*\}','',text)
 text=re.sub(r'\[[^\]]*\]','',text)
 return re.sub(r'\s+',' ',text).strip()
def facts(page,year):
 boxes=page.get('facts',[])
 if not boxes:return {}
 def score(box):
  years=[int(x) for x in re.findall(r'\b(?:18|19|20)\d{2}\b',box.get('Production',box.get('Model years','')))]
  return min((abs(y-year) for y in years),default=100)
 box=min(boxes,key=score)
 return {k:clean(box[k])[:220] for k in ['Production','Designer','Class','Body style','Layout','Engine','Electric motor','Transmission'] if box.get(k)}
def e(s):return html.escape(str(s),quote=True)
def document(slug,config,cars):
 count=len(cars);variants=sum(len(car['variants']) for car in cars);name=config['name'];first=min(car['year'] for car in cars);last=max(car['year'] for car in cars)
 links=''.join(f'<a href="../{key}/" {"aria-current=page" if key==slug else ""}>{e(value["name"])}</a>' for key,value in configs.items())
 return f'''<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="theme-color" content="#f4f2ed"><meta name="description" content="{e(name)} road-car history: {count} model families, {variants} design chapters, credited photo galleries, reviews and films."><title>{e(name)} — Automotive</title><link rel="icon" href="../favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="../styles.css"><script src="../app.js" defer></script></head>
<body class="brand-archive"><a class="skip" href="#timeline">Skip to the timeline</a>
<header class="masthead"><a class="wordmark" href="../">AUTOMOTIVE<span>A DESIGN HISTORY</span></a><nav aria-label="Main navigation"><a href="#manufacturers">Models</a><a href="#timeline">Timeline</a><a href="#watch">Films & TV</a></nav><a class="home-link" href="../">ALL MAKERS ↗</a></header>
<main><nav class="brand-links" aria-label="Brand archives">{links}</nav>
<section class="intro" aria-labelledby="page-title"><div class="intro-text"><p class="eyebrow"><span class="red-dot"></span>THE ROAD-CAR ARCHIVE / {first}—{last}</p><h1 id="page-title" class="brand-title">{e(name)}<br><em>in profile.</em></h1><p class="standfirst">{e(config['tagline'])}</p><p class="intro-note">{e(config['intro'])}</p><a class="arrow-link" href="#manufacturers">Explore the models <span>↘</span></a></div><figure class="hero-figure" id="hero"><div class="hero-loading">THE SHAPE OF THINGS TO COME</div></figure><div class="edition-line"><span>PRODUCTION ROAD-CAR FAMILIES / RESEARCHED THROUGH OCTOBER 2026</span><span>{count} MODEL FAMILIES <i>/</i> {variants} DESIGN CHAPTERS</span></div></section>
<section class="makers-section" id="manufacturers" aria-labelledby="makers-title"><div class="section-heading"><div><p class="eyebrow">01 / THE MODELS</p><h2 id="makers-title">The family, through time.</h2></div><p>Every family has its own timeline.<br>Open a name to compare its distinct forms.</p></div><div id="makers" class="makers model-index" aria-label="Model families"></div>
<details class="method"><summary>Coverage, grouping & sources <span>How to read this archive ↗</span></summary><div class="method-content"><h3>Production families, rather than a shortlist.</h3><p>This catalog follows the named production road-car families in the linked model indexes. Generations, open bodies, homologation road cars and distinct design variants appear inside the relevant family. Engine options, small facelifts and near-identical editions are grouped, with their names retained in the entries. An introduction date can precede deliveries or a market’s model year.</p><p>Race-only cars, concepts, single commissioned bodies, military-only vehicles, commercial vans and heavy trucks are excluded. Personal-use pickups are included alongside SUVs. Road-legal homologation cars are labelled. The Mercedes-Benz catalog begins with the 1926 merger and its carry-over range; earlier Benz and Mercedes companies are historical context, not a claim that their pre-merger catalogs are covered.</p><p>Historical model indexes establish coverage; linked model histories support dates and engineering. Published reviews and contemporary reports are attached where verified. A news report or factory history is identified by its source title rather than presented as a road test. Every family has a selected YouTube video. Driving reviews are prioritised; rare historic models may instead have a clearly labelled specialist feature, historical overview or walkaround. The video may cover a later variant within the same model family.</p><p>Every photo links to its photographer, license and original description. Archive and contemporary Commons photos are used alongside a small number of credited manufacturer publicity photographs; the archive is not presented as an official launch-photo collection. A surviving car can be a later example of the same body chapter. Comparisons show the principal design forms, rather than every specification or regional bumper change.</p><p><a href="{e(config['catalogUrl'])}" target="_blank" rel="noopener noreferrer">Model coverage index ↗</a> · <a href="{e(config['officialUrl'])}" target="_blank" rel="noopener noreferrer">Official heritage / model reference ↗</a> · <a href="../research/brands/README.md">Coverage audit and maintenance notes ↗</a></p><div id="bibliography" class="bibliography"></div></div></details></section>
<section class="history-section" id="timeline" aria-labelledby="timeline-title"><div class="section-heading"><div><p class="eyebrow">02 / THE TIMELINE</p><h2 id="timeline-title">Every shape has a story.</h2></div><p>Read chronologically.<br>Models, generations and meaningful differences.</p></div><div class="filter-bar"><label class="search-label"><span aria-hidden="true">⌕</span><input type="search" id="search" placeholder="Find a model, generation or chassis code…" aria-label="Search cars"></label><label><span class="sr-only">Filter by vehicle category</span><select id="brand"><option value="">All vehicle types</option></select></label><button id="reset" type="button">Reset ↺</button><span id="result-count" role="status"></span></div><div id="history"></div><p id="empty" hidden>No models match this search. Try another name or reset the filters.</p></section>
<section class="honors-section films-section" id="watch" aria-labelledby="films-title"><div class="section-heading"><div><p class="eyebrow">03 / ON SCREEN</p><h2 id="films-title">Films, documentaries & television.</h2></div><p>Different perspectives on the marque.<br>Drama, reporting and factory films are labelled.</p></div><p class="films-note">Links lead to verified title information, official trailers or official full films. Streaming availability varies by country; a title listing does not guarantee a current subscription stream.</p><div id="films" class="films"></div></section><div id="honors" hidden></div></main>
<footer><a class="wordmark" href="../">AUTOMOTIVE</a><p>{e(name)} road-car archive.<br>Research edition · 20 October 2026</p><a href="#manufacturers">Models & sources ↑</a></footer><dialog id="car-dialog" aria-labelledby="detail-title"><div class="dialog-top"><a href="#" id="permalink">COPY CAR LINK ↗</a><span>THE {e(name.upper())} ARCHIVE</span><button type="button" id="close-dialog" aria-label="Close car details">Close <span aria-hidden="true">×</span></button></div><div id="detail"></div></dialog><div id="announcement" class="sr-only" role="status"></div><noscript><p class="noscript">This illustrated timeline needs JavaScript. Read the <a href="data.json">complete catalog</a> or <a href="../research/brands/README.md">coverage notes</a>.</p></noscript></body></html>
'''
for slug,config in configs.items():
 sources={};cars=[]
 for record in c.CATALOG[slug]:
  car=copy.deepcopy(record);variants=[];keys=[];review_count=0
  for i,v in enumerate(car['variants']):
   page=pages.get(v['wiki'],{});v['factSource']=page.get('url','https://en.wikipedia.org/wiki/'+urllib.parse.quote(v['wiki'].replace(' ','_')))
   v['photos']=[]
   for file in plan.get(f'{slug}/{car["id"]}/{i}',{}).get('files',[]):
    if file in manifest:
     photo=copy.deepcopy(manifest[file]);photo['src']='../'+photo['src'];v['photos'].append(photo)
   v['facts']=facts(page,v['year']);variants.append(v)
   key=f'history-{car["id"]}-{i}';sources[key]=dict(outlet='Model history',title=v['name']+' — history and specifications',url=v['factSource']);keys.append(key)
   for j,r in enumerate(page.get('reviews',[])[:3]):
    url=r['url'];outlet=next((label for host,label in [('topgear.com','Top Gear'),('evo.co.uk','evo'),('caranddriver.com','Car and Driver'),('autocar.co.uk','Autocar'),('hagerty','Hagerty'),('autoexpress','Auto Express'),('motortrend','MotorTrend'),('roadandtrack','Road & Track')] if host in url),'Published coverage')
    key=f'reading-{car["id"]}-{i}-{j}'
    if url not in [sources[k]['url'] for k in keys]:sources[key]=dict(outlet=outlet,title=r['title'],url=url);keys.insert(0,key);review_count+=1
  base=prior.get(car.get('inherit'),{});video=videos.get(f'{slug}/{car["id"]}',base.get('video'))
  if not video or not video.get('id'):raise ValueError('A selected YouTube video is required for '+slug+'/'+car['id'])
  car.update(brand=config['name'],country=config['country'],year=variants[0]['year'],designer=variants[0]['facts'].get('Designer',config['name']+' design teams'),title=variants[0]['shape'],design=0,industry=0,variants=variants,sources=keys,video=video,facts=variants[0]['facts'],evidence='A production road-car family. Read the linked model histories for dates and construction, and the published coverage for contemporary assessments.',excluded='Distinct generations and body forms are shown below. Engine-only versions, small trim changes and closely related editions share a chapter. Race-only derivatives and one-off commissions are excluded.')
  cars.append(car)
 cars.sort(key=lambda car:car['year'])
 out=ROOT/slug;out.mkdir(exist_ok=True)
 data=dict(archive=True,brand=config['name'],heroId=config['heroId'],updated='20 October 2026',sources=sources,cars=cars,honors=[],films=config['films'])
 (out/'data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');(out/'index.html').write_text(document(slug,config,cars))
 print(slug,len(cars),'families',sum(len(car['variants']) for car in cars),'chapters',sum(not v['photos'] for car in cars for v in car['variants']),'empty galleries',flush=True)
coverage={slug:dict(name=configs[slug]['name'],modelIndex=configs[slug]['catalogUrl'],officialReference=configs[slug]['officialUrl'],families=[dict(id=car['id'],name=car['name'],chapters=[dict(year=v['year'],name=v['name'],source='https://en.wikipedia.org/wiki/'+urllib.parse.quote(v['wiki'].replace(' ','_'))) for v in car['variants']]) for car in sorted(records,key=lambda r:r['variants'][0]['year'])]) for slug,records in c.CATALOG.items()}
(HERE/'coverage.json').write_text(json.dumps(coverage,ensure_ascii=False,indent=2)+'\n')
