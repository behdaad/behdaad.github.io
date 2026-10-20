import json,re,unicodedata
from pathlib import Path
R=Path(__file__).resolve().parent
races=[];missing=[]
def norm(x):return ''.join(c for c in unicodedata.normalize('NFKD',x.lower()) if not unicodedata.combining(c))
alias={'Italy':'italian','Great Britain':'british','Germany':'german','Switzerland':'swiss','Spain':'spanish','Morocco':'moroccan','United States':'united states','South Africa':'south african','Mexico':'mexic','Japan':'japan','Brazil':'brazil','Australia':'australi','Portugal':'portug','Europe':'europ','Belgium':'belg','Hungary':'hungar','France':'french','Austria':'austri','China':'chinese','São Paulo':'sao paulo','Caesars Palace':'caesars palace'}
for line in (R/'races.txt').read_text().splitlines():
 y,name,title,story,tag=line.split('|');y=int(y);r=dict(year=y,name=name,title=title,story=story,tag=tag)
 if y>=1981:
  items=json.loads((R/f'season-{y}.json').read_text());term=alias.get(name,norm(name))
  candidates=[a for a in items if (term in norm(a['title']) or norm(name) in norm(a['title']) or term.replace(' ','-') in norm(a['url'])) and (str(y) in a['title'] or y>=2018)]
  if name=='Austria':candidates=[a for a in candidates if 'australian' not in norm(a['title'])]
  if name=='Spain':candidates=[a for a in candidates if 'spanish' in norm(a['title']) or 'espana' in norm(a['url'])]
  if name=='Italy':candidates=[a for a in candidates if not any(t in norm(a['url']) for t in ['emilia','toscana','tuscan'])]
  if name=='Qatar':candidates=[a for a in candidates if norm(a['title']).startswith('qatar\n')]
  # Newer seasons contain weekend pages, older seasons contain direct clips.
  if y>=2018:
   candidates=[a for a in candidates if '/page/' in a['url'] and any(t in a['url'] for t in ['grand-prix','gran-premio','grosser-preis','grande-premio'])]
  else:
   candidates=[a for a in candidates if '/detail/' in a['url']]
   candidates.sort(key=lambda a:0 if 'highlights' in norm(a['title']) else 1 if 'in review' in norm(a['title']) else 2)
  if candidates:r['catalog']=candidates[0]
  else:missing.append((y,name,term))
 races.append(r)
(R/'selected-races.json').write_text(json.dumps(races,ensure_ascii=False,indent=2))
print('Missing',missing)
print('Modern',len([r for r in races if r['year']>=2018]))
