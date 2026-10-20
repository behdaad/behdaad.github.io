import json,re,unicodedata,urllib.parse
from pathlib import Path
R=Path(__file__).resolve().parent
load=lambda name:json.loads((R/name).read_text())
def slug(s):return re.sub(r'[^a-z0-9]+','-',unicodedata.normalize('NFKD',s).encode('ascii','ignore').decode().lower()).strip('-')
races=load('selected-races.json');results=load('results.json');archive=load('f1tv-archive.json');docs=load('f1tv-documentaries.json');items=[]
for r in races:
 y=r['year'];name=r['name'];rn={'São Paulo':'Brazil','Caesars Palace':"Caesar's Palace"}.get(name,name)
 if y==1977 and name=='United States':rn='USA East'
 result=next(x for x in results[str(y)] if x['name']==rn)
 r.update(type='race',id=f'{y}-{slug(name)}',date=result['date'],result=result,order=list(results[str(y)]).index(result)+1,sources=[{'title':'Official race result','url':result['source']}])
 adjective={'Italy':'Italian','Great Britain':'British','Germany':'German','Switzerland':'Swiss','Spain':'Spanish','Morocco':'Moroccan','South Africa':'South African','Mexico':'Mexican','Japan':'Japanese','Brazil':'Brazilian','Australia':'Australian','Portugal':'Portuguese','Europe':'European','Belgium':'Belgian','Hungary':'Hungarian','France':'French','Austria':'Austrian','China':'Chinese','São Paulo':'São Paulo'}.get(name,name)
 r['raceName']=f'{adjective} Grand Prix'
 wiki=f'{y} {adjective} Grand Prix'
 if y==1977 and name=='United States':wiki='1977 United States Grand Prix'
 r['sources'].append(dict(title='Race history and references',url='https://en.wikipedia.org/wiki/'+urllib.parse.quote(wiki.replace(' ','_'))))
 if y>=2018:
  records=load(f'race-{y}-{re.sub("[^a-zA-Z0-9]","-",name)}.json')
  pool=[a for a in records if re.search(r'^(?:\d{4} .+? - )?race highlights\b|^\d{4} .+?grand prix - highlights\b',a['title'],re.I) and not re.search(r'sprint|f1a|f2|f3|porsche|supercup|qualifying|practice',a['title'],re.I)]
  if y==2021 and name=='Belgium':pool=[a for a in records if a['title'].startswith('RACE RECAP - Belgium')]
  if not pool:raise ValueError(f'No race highlights {y} {name}')
  if y==2023 and name=='Qatar':r['titleSession']=next(a for a in records if a['title'].startswith('SPRINT HIGHLIGHTS - Qatar'))
  r['watch']=pool[0];r['watchLabel']='Watch race highlights';r['watchKind']='Race highlights'
  if y==2021 and name=='Belgium':r['watchLabel']='Watch race recap';r['watchKind']='Race recap · no green-flag racing'
  longer=[a for a in records if re.search('race in 30',a['title'],re.I) and not re.search('sprint|f1a|f2|f3',a['title'],re.I)]
  if longer:r['extended']=longer[0]
 elif y>=1981:
  r['watch']=r['catalog'];title=r['watch']['title'].lower()
  if 'highlights' in title or 'in review' in title:r['watchLabel']='Watch race highlights';r['watchKind']='Extended highlights' if 'extended highlights' in title else 'In Review · race highlights'
  else:r['watchLabel']='Watch full race';r['watchKind']='Full race replay · highlights not listed'
 elif y>=1970:
  r['watch']=next(a for a in archive if str(y) in a['title'] and '/detail/' in a['url']);r['watchLabel']='Watch season review';r['watchKind']='Season film · not individual race highlights'
 else:r['watchKind']='Historical entry · no individual F1 TV highlights listed'
 if 'watch' in r:
  r['sources'].append(dict(title='F1 TV catalog entry',url=r['watch']['url']));r['artwork']=r['watch']['image'];r['duration']=next(iter(re.findall(r'\d\d:\d\d:\d\d',r['watch']['title'])),'')
 items.append(r)
for line in (R/'documentaries.txt').read_text().splitlines():
 y,id,title,span,story=line.split('|');matches=[a for a in docs if '/detail/'+id+'/' in a['url']];cat=max(matches,key=lambda a:len(a['title']))
 d=dict(year=int(y),type='documentary',id='doc-'+id,title=title,span=span,story=story,order=90,watch=cat,watchKind='F1 TV documentary',watchLabel='Watch on F1 TV',artwork=cat['image'],duration=next(iter(re.findall(r'\d\d:\d\d:\d\d',cat['title'])),''),sources=[dict(title='F1 TV documentary catalog',url='https://f1tv.formula1.com/page/413/documentaries')])
 if id=='1000005473':d['episodes']=[a for a in docs if any('/detail/'+n+'/' in a['url'] for n in ['1000005473','1000005474','1000005477'])]
 items.append(d)
newguide='https://www.formula1.com/en/latest/article/the-best-f1-films-and-tv-shows-to-watch-during-april.5U9caN4lPDYCzvv2pQjJHG.5U9caN4lPDYCzvv2pQjJHG'
oldguide='https://www.formula1.com/en/latest/article/senna-stirling-schumacher-and-more-11-great-f1-documentaries-and-films-to.7sWGy13vRCfLC2kc53EmsT'
for f in load('films.json'):
 f.update(type='screen',id='screen-'+slug(f['title'])+'-'+str(f['released']),order=95,sources=[dict(title='Formula 1 viewing recommendation',url=oldguide if f.get('guide')=='older' else newguide)])
 f['url']=f.get('url',f['sources'][0]['url']);items.append(f)
if (R/'portraits.json').exists():
 for p in load('portraits.json'):p.update(type='person',id='person-'+slug(p['wiki']),order=0,sources=[dict(title='Biography and references',url=p['source'])]);items.append(p)
# Specific primary sources for rulings and recent developments.
extras={
 '2021-abu-dhabi':('FIA report on the 2021 Abu Dhabi Grand Prix','https://www.fia.com/sites/default/files/2021_f1_abu_dhabi_grand_prix_-_report_to_the_wmsc_-_19_march_2022.pdf'),
 '2026-australia':('2026 technical rules explained','https://www.formula1.com/en/latest/article/everything-you-need-to-know-about-the-new-f1-rules-for-2026.48bv0VTxhIlhrQXmxercXk'),
 '2025-qatar':('Official Qatar race report','https://www.formula1.com/en/latest/article/verstappen-wins-qatar-gp-as-title-battle-goes-to-abu-dhabi-with-piastri.5KlYT7q8OcrJ7AnMALjkxJ.5KlYT7q8OcrJ7AnMALjkxJ'),
 '2021-belgium':('Race director’s explanation','https://www.formula1.com/en/latest/article/we-did-the-best-we-could-but-the-weather-got-the-better-of-us-says-masi.6SD75AurkdGjl0eNcRmKGr')}
for i in items:
 if i['id'] in extras:t,u=extras[i['id']];i['sources'].append(dict(title=t,url=u))
items.sort(key=lambda i:(i['year'],i['order'],i['id']))
oldpath=R.parent/'data.json'
if oldpath.exists():
 old={i['id']:i for i in json.loads(oldpath.read_text())['items']}
 for i in items:
  if i['id'] in old:
   prior=old[i['id']]
   if 'photo' in prior and 'photo' not in i:i['photo']=prior['photo']
   if 'alternativeHighlights' in prior:i['alternativeHighlights']=prior['alternativeHighlights']
   for source in prior.get('sources',[]):
    if source not in i['sources']:i['sources'].append(source)
out=dict(updated='2026-10-20',cutoff='20 October 2026',items=items)
(R.parent/'data.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Entries',len(items),'races',len(races),'no highlights',[(r['year'],r['name']) for r in races if r['year']>=1981 and 'Full race' in r['watchKind']]);print('Missing art',[(i['year'],i.get('name',i['title'])) for i in items if i['type'] in ['race','documentary'] and i['year']>=1970 and not i.get('artwork')])
