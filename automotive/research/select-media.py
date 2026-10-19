"""Record explicit image choices after checking filenames and article captions.

Indices refer to the checked-in candidate snapshot, not an unstable live query.
The resulting overrides store full filenames and survive candidate refreshes.
"""
import json
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
d=json.loads(ROOT.joinpath('data.json').read_text())
candidates=json.loads(ROOT.joinpath('research/image-candidates.json').read_text())
extra=json.loads(ROOT.joinpath('research/extra-image-candidates.json').read_text())
picks={
 'patent':[[15,21,0]],
 'model-t':[[6,25],[47,48]],
 'airflow':[[1,3],[6]],
 'beetle':[[0,7],[0,1],[0,2]],
 '300sl':[[4,6],[16,9]],
 'ds':[[],[8],[9,4]],
 'mini':[[0,5,1],[2,3],[15,16],[24,28],[0,51]],
 'etype':[[0,1],[9,10],[12,14]],
 '911':[[0,5],[14,16],[1,4],[1,2],[1,6],[0,3],[0,1],[12,4,2]],
 'mustang':[[0,1],[0,1],[1,2],[1,3],[5,8],[2,4],[1,2]],
 'miura':[[5],[0,9]],
 'sm':[[0,1]],
 'stratos':[[0,3],[]],
 'countach':[[7,8],[17,10],[14,15],[0,1]],
 'golf':[[0,5],[0,1],[0,6],[0,1],[0,2],[0,1],[2,3],[0,1]],
 'espace':[[4,3],[7,8],[11,12],[16,17],[22,23],[26,27]],
 'f40':[[1,2],[4]],
 'mx5':[[5,6],[0,1],[0,3],[0,7],[2,14]],
 'f1':[[0,1,2],[10],[2,3]],
 'prius':[[0,3],[0,5],[0,1],[0,1],[0,7]],
 'tt':[[1,2],[9,11],[19,20]],
 'model-s':[[],[7,8],[9,10]],
 'i3':[[3,4,17]],
 'ioniq5':[[0,1],[12,13]],
 'cybertruck':[[0,8,6]],
}
out={}
for car in d['cars']:
    for v,ids in zip(car['variants'],picks[car['id']]):
        out[v['wiki']+'|'+v['name']]=[candidates[v['wiki']][i]['file'] for i in ids]
def add(carid,index,q,indices):
    v=next(c for c in d['cars'] if c['id']==carid)['variants'][index]
    out[v['wiki']+'|'+v['name']]+=[extra[q][i] for i in indices]
add('airflow',1,'1936 Chrysler Airflow',[2])
add('ds',0,'1956 Citroen DS 19',[6,2])
add('ds',1,'Citroen DS Cabriolet',[1])
add('miura',0,'Lamborghini Miura P400',[3])
add('stratos',1,'Lancia Stratos Alitalia',[2,7])
add('f40',1,'Ferrari F40 LM',[1])
add('f1',1,'McLaren F1 LM',[6])
add('model-s',0,'Tesla Model S 2013',[3,6])
ROOT.joinpath('research/media-overrides.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Explicit selections:',len(out))
