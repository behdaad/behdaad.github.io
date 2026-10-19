"""Fetch attributed Wikimedia photographs. Cached responses make this resumable.

Run after build-catalog.py. Each selection is recorded for visual review.
"""
import concurrent.futures, hashlib, html, json, re, time, urllib.parse, urllib.request, sys, threading
from html.parser import HTMLParser
from pathlib import Path

ROOT=Path(__file__).resolve().parents[1]
CACHE=Path('/tmp/automotive-research-cache'); CACHE.mkdir(exist_ok=True)
UA='AutomotiveHistory/1.0 (personal educational history; image attribution retained)'
gate=threading.Lock()
last_request=0
def get(url):
    global last_request
    p=CACHE/hashlib.sha256(url.encode()).hexdigest()
    if p.exists(): return p.read_bytes()
    for attempt in range(3):
        try:
            with gate:
                time.sleep(max(0,2-(time.monotonic()-last_request)))
                last_request=time.monotonic()
            with urllib.request.urlopen(urllib.request.Request(url,headers={'User-Agent':UA}),timeout=45) as r: b=r.read()
            p.write_bytes(b);return b
        except Exception:
            if attempt==2:raise
            time.sleep(1+attempt)
def api(host, **params):
    return json.loads(get('https://'+host+'/w/api.php?'+urllib.parse.urlencode(dict(format='json',**params))))
def clean(s):return html.unescape(re.sub('<[^>]+>','',s or '')).strip()
class Attr(HTMLParser):
    def handle_starttag(self,t,a):self.attrs=dict(a)
def candidates(wiki):
    s=get('https://en.wikipedia.org/wiki/'+urllib.parse.quote(wiki.replace(' ','_'))).decode()
    out=[]
    for m in re.finditer(r'<img\b[^>]+>',s):
        p=Attr();p.feed(m.group());a=p.attrs
        if int(a.get('width','0'))<120:continue
        src=a.get('src','')
        if '/commons/' not in src or '/thumb/' not in src:continue
        filename=urllib.parse.unquote(src.split('/')[-2])
        if not re.search(r'\.(jpg|jpeg|png)$',filename,re.I):continue
        if re.search(r'logo|badge|signature|diagram|chart|engine|map\b|Flag|disambig|cutaway|motorblock',filename,re.I):continue
        if float(a.get('width',1))/max(1,float(a.get('height',1)))<1.15:continue
        # Captions are adjacent to thumbnails; retain visible context for audit.
        nearby=clean(s[m.end():m.end()+1100]).split('\n')[0][:260]
        out.append(dict(file=filename,caption=nearby,alt=a.get('alt',''),width=int(a['width'])))
    seen=set();return [x for x in out if not (x['file'] in seen or seen.add(x['file']))]

def main():
    data=json.loads(ROOT.joinpath('data.json').read_text())
    items=[v for c in data['cars'] for v in c['variants']]+data['honors']
    pages=sorted(set(v['wiki'] for v in items)); gathered={}
    with concurrent.futures.ThreadPoolExecutor(max_workers=1) as ex:
        futs={ex.submit(candidates,w):w for w in pages}
        for fut in concurrent.futures.as_completed(futs):
            w=futs[fut]
            try:gathered[w]=fut.result()
            except Exception as e:print('PAGE FAILED',w,str(e),flush=True);gathered[w]=[]
    ROOT.joinpath('research/image-candidates.json').write_text(json.dumps(gathered,ensure_ascii=False,indent=2))
    if '--catalog-only' in sys.argv:
        print('Candidate pages ready:',len(gathered),flush=True)
        return
    selected=[]
    overrides=json.loads(ROOT.joinpath('research/media-overrides.json').read_text()) if ROOT.joinpath('research/media-overrides.json').exists() else {}
    for v in items:
        key=v['wiki']+'|'+v.get('name','')
        if key in overrides: pool=[dict(file=f,caption='') for f in overrides[key]]
        else:
            pool=gathered[v['wiki']]
            if v.get('reject'):pool=[x for x in pool if not re.search(v['reject'],x['file'],re.I)]
            if v.get('match'):
                pool=[x for x in pool if re.search(v['match'],x['file'],re.I)]
            pool=sorted(pool,key=lambda x:bool(re.search(r'rear|interior|dashboard|back|side|heck',x['file'],re.I)))
        v['selectedFiles']=[x['file'] for x in pool[:(1 if v in data['honors'] else 3)]]
        if not v['selectedFiles']:print('NO MATCH',key,flush=True)
        selected+=v['selectedFiles']
    info={}
    unique=list(dict.fromkeys(selected))
    for i in range(0,len(unique),25):
        j=api('commons.wikimedia.org',action='query',titles='|'.join('File:'+f for f in unique[i:i+25]),prop='imageinfo',iiprop='url|extmetadata',iiurlwidth=1000)
        for p in j['query']['pages'].values():
            if 'imageinfo' in p:info[p['title'][5:].replace('_',' ')]=p['imageinfo'][0]
    manifest={}
    old_manifest=json.loads(ROOT.joinpath('research/image-credits.json').read_text()) if ROOT.joinpath('research/image-credits.json').exists() else {}
    def download(f):
        if f in old_manifest and ROOT.joinpath(old_manifest[f]['src']).exists():
            return(f,old_manifest[f],None)
        key=f.replace('_',' ')
        if key not in info:return (f,None,'Missing Commons metadata')
        inf=info[key];ext=inf.get('extmetadata',{})
        license=clean(ext.get('LicenseShortName',{}).get('value',''))
        license_url=ext.get('LicenseUrl',{}).get('value','')
        if not license or ('cc' not in license.lower() and 'public domain' not in license.lower() and 'pd' not in license.lower() and license not in ['FAL','Attribution'] and 'creativecommons.org/licenses/' not in license_url):
            return(f,None,'Unrecognised license: '+license)
        url=inf.get('thumburl',inf['url'])
        suffix=Path(urllib.parse.urlparse(url).path).suffix.lower()
        path='assets/'+hashlib.sha256(f.encode()).hexdigest()[:14]+suffix
        try:
            target=ROOT/path
            if not target.exists():target.write_bytes(get(url))
            return(f,dict(src=path,file=f,credit=clean(ext.get('Artist',{}).get('value','Wikimedia Commons')),license=license,
                licenseUrl=ext.get('LicenseUrl',{}).get('value','https://artlibre.org/licence/lal/en/' if license=='FAL' else 'https://commons.wikimedia.org/wiki/Template:Attribution' if license=='Attribution' else 'https://commons.wikimedia.org/wiki/Commons:Licensing'),
                page=inf['descriptionurl'],description=clean(ext.get('ImageDescription',{}).get('value',f))[:800],origin='Wikimedia Commons · archive / contemporary photograph'),None)
        except Exception as e:return(f,None,str(e))
    with concurrent.futures.ThreadPoolExecutor(max_workers=5) as ex:
        for f,m,e in ex.map(download,unique):
            if e:print('IMAGE FAILED',f,e,flush=True)
            else:manifest[f]=m
    for v in items:
        v['photos']=[manifest[f] for f in v.pop('selectedFiles') if f in manifest]
        v['factSource']='https://en.wikipedia.org/wiki/'+urllib.parse.quote(v['wiki'].replace(' ','_'))
    ROOT.joinpath('data.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n')
    ROOT.joinpath('research/image-credits.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    print('DONE',len(manifest),'unique photographs;',sum(not v['photos'] for v in items),'empty galleries;',sum(len(v['photos'])<2 for v in items[:-len(data['honors'])]),'galleries with fewer than two images',flush=True)
if __name__=='__main__':main()
