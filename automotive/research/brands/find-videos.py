"""Collect public YouTube result metadata for editorial review, without downloading video.

Only title/channel/duration/description snippets are retained. Candidate collection
never changes the public catalog; approved selections belong in videos.json.
"""
import concurrent.futures,hashlib,json,re,subprocess,threading,time,urllib.parse
from pathlib import Path
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];CACHE=Path('/tmp/automotive-youtube-cache');CACHE.mkdir(exist_ok=True)
queries=json.loads((HERE/'video-queries.json').read_text());out_path=CACHE/'candidates.json';out=json.loads(out_path.read_text()) if out_path.exists() else {}
lock=threading.Lock();last=0

def content(x):return x.get('simpleText','') or ''.join(r.get('text','') for r in x.get('runs',[]))
def collect(key,query):
 global last
 cache=CACHE/(hashlib.sha256(query.encode()).hexdigest()+'.html')
 if cache.exists():raw=cache.read_text()
 else:
  with lock:
   time.sleep(max(0,1.5-(time.monotonic()-last)));last=time.monotonic()
  url='https://www.youtube.com/results?'+urllib.parse.urlencode(dict(search_query=query,hl='en'))
  raw=subprocess.check_output(['curl','-fLsS','--max-time','40',url]).decode('utf-8',errors='replace');cache.write_text(raw)
 match=re.search(r'(?:var ytInitialData|window\["ytInitialData"\])\s*=\s*',raw)
 if not match:raise ValueError('No public video result metadata; access/consent page is not bypassed')
 data=json.JSONDecoder().raw_decode(raw[match.end():])[0];videos=[]
 def visit(item):
  if isinstance(item,dict):
   if 'videoRenderer' in item:
    v=item['videoRenderer'];owner=v.get('ownerText',{});runs=owner.get('runs',[{}]);channel=runs[0].get('navigationEndpoint',{}).get('browseEndpoint',{})
    videos.append(dict(id=v['videoId'],title=content(v.get('title',{})),channel=content(owner),channelId=channel.get('browseId',''),channelHandle=channel.get('canonicalBaseUrl',''),duration=content(v.get('lengthText',{})),published=content(v.get('publishedTimeText',{})),description=' '.join(content(s.get('snippetText',{})) for s in v.get('detailedMetadataSnippets',[]))[:700],url='https://www.youtube.com/watch?v='+v['videoId']))
   else:
    for value in item.values():visit(value)
  elif isinstance(item,list):
   for value in item:visit(value)
 visit(data)
 seen=set();videos=[v for v in videos if not (v['id'] in seen or seen.add(v['id']))]
 return key,dict(query=query,searchUrl='https://www.youtube.com/results?'+urllib.parse.urlencode(dict(search_query=query)),checked='2026-10-20',candidates=videos[:24])
work=[(key,query) for key,query in queries.items() if key not in out or out[key].get('query')!=query]
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as executor:
 futures={executor.submit(collect,key,query):key for key,query in work}
 for i,future in enumerate(concurrent.futures.as_completed(futures),1):
  key=futures[future]
  try:key,result=future.result();out[key]=result;print(key,len(result['candidates']),flush=True)
  except Exception as e:print('ERROR',key,str(e),flush=True)
  out_path.write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n')
print('Collected',len(out),'/',len(queries),'queries',flush=True)
