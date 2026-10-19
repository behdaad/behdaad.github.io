"""Build a reviewable photograph plan; no unidentified replacement models are used."""
import importlib.util,json,re,unicodedata
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
s=importlib.util.spec_from_file_location('catalog',HERE/'catalog.py');c=importlib.util.module_from_spec(s);s.loader.exec_module(c)
pages=json.loads((HERE/'pages.json').read_text());old=json.loads((ROOT/'data.json').read_text());old_by_id={car['id']:car for car in old['cars']}
path=HERE/'photo-overrides.json';overrides=json.loads(path.read_text()) if path.exists() else {}
def norm(s):return ''.join(ch for ch in unicodedata.normalize('NFKD',s) if not unicodedata.combining(ch)).lower().replace('_',' ')
def match(pattern,text):
 try:return bool(re.search(norm(pattern),norm(text),re.I))
 except re.error:return norm(pattern) in norm(text)
reject=r'logo|badge|engine|dashboard|interior|interieur|cockpit|cabin|chassis|cutaway|replica|lego|diecast|scale.model|gearbox|wheel|innen|inetrior|calandre|SVR|signature|concept|prototype|scale|museum.model'
plan=[]
for brand,cars in c.CATALOG.items():
 for car in cars:
  for i,v in enumerate(car['variants']):
   key=f'{brand}/{car["id"]}/{i}';page=pages.get(v['wiki'],{});pictures=page.get('photos',[]);files=[];reason=''
   if key in overrides:files=overrides[key];reason='Manual visual selection'
   else:
    prior=old_by_id.get(car.get('inherit'),{})
    near=[p for p in prior.get('variants',[]) if p['wiki']==v['wiki'] and p['year']==v['year']]
    if near:
     p=min(near,key=lambda p:abs(p['year']-v['year']));files=[x['file'] for x in p['photos']];reason='Previously verified gallery'
    else:
     pool=[p for p in pictures if not re.search(reject,norm(p['file']+' '+p['section']+' '+p['alt']))]
     matching=[p for p in pool if v['match'] and match(v['match'],p['file']+' '+p['section']+' '+p['alt'])]
     if matching:pool=matching;reason='Model/generation match'
     elif v['match']:reason='REVIEW: no exact generation filename match'
     else:reason='Model article photographs'
     def score(p):
      name=norm(p['file']);value=0
      if v['match'] and match(v['match'],p['file']):value+=40
      if re.search(r'front|vorne|avant|fvl|frontansicht',name):value+=12
      if re.search(r'rear|arriere|heck|back',name):value-=5
      if re.search(r'rear wheel|headlight|headlamp|taillight|detail|bonnet|brake|motor|suspension',name):value-=80
      return value
     ordered=sorted(pool,key=score,reverse=True)
     if ordered:
      files=[ordered[0]['file']]
      rear=next((p for p in ordered[1:] if re.search(r'rear|arriere|heck|back',norm(p['file']))),None)
      second=rear or (ordered[1] if len(ordered)>1 else None)
      if second:files.append(second['file'])
   plan.append(dict(key=key,brand=brand,car=car['name'],variant=v['name'],year=v['year'],wiki=v['wiki'],reason=reason,files=files))
(HERE/'photo-plan.json').write_text(json.dumps(plan,ensure_ascii=False,indent=2)+'\n')
print(len(plan),'chapters;',len({f for p in plan for f in p['files']}),'unique photographs;',sum(not p['files'] for p in plan),'empty;',sum(p['reason'].startswith('REVIEW') for p in plan),'need generation review')
