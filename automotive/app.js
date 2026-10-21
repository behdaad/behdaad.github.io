/* A buildless archive: all research and photograph credits live in data.json. */
(async () => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let data;
  try {
    const response = await fetch('data.json');
    if (!response.ok) throw new Error(`Catalog request returned ${response.status}`);
    data = await response.json();
  } catch (error) {
    $('#history').innerHTML = '<p class="load-error">The archive could not load. Please reload the page, or <a href="data.json">open the research catalog</a>.</p>';
    console.error(error); return;
  }
  const { cars, sources } = data;
  const archive = Boolean(data.archive);
  const brands = [...new Set(cars.map(car => car.brand))];
  const dialog = $('#car-dialog');
  let activeCar, lastTrigger, pushedCar = false;
  const galleries = new Map();
  function sourceLink(key, full = false) {
    const s = sources[key];
    return `<a href="${esc(s.url)}" target="_blank" rel="noopener noreferrer">${esc(s.outlet)}${full ? ' · ' + esc(s.title) : ''} ↗</a>`;
  }
  function points(car) {
    const corroboration = new Set(car.sources.map(key => sources[key].outlet)).size > 1 ? 10 : 0;
    return { corroboration, total: car.design + car.industry + corroboration };
  }
  function photo(photo, alt, lazy = true) {
    return photo ? `<img src="${esc(photo.src)}" alt="${esc(alt)}" ${lazy ? 'loading="lazy"' : 'fetchpriority="high"'} decoding="async" width="1000" height="650">` : '<p class="load-error">Photograph unavailable. See the linked model history.</p>';
  }
  const hero = cars.find(c => c.id === data.heroId) || cars.find(c => c.id === 'ds') || cars[0];
  const heroPhoto = hero.variants[0].photos[0];
  $('#hero').innerHTML = `${photo(heroPhoto,hero.brand+' '+hero.name,false)}<a class="hero-credit" href="${esc(heroPhoto?.page || '#car=ds')}" target="_blank" rel="noopener noreferrer">Photo & credit ↗</a><figcaption><div><span>${hero.year} / ${esc(hero.brand.toUpperCase())}</span><strong>${archive?esc(hero.name):'A different idea of the future.'}</strong><span>${archive?'':esc(hero.name)+' · '}${esc(heroPhoto?.origin || 'Archive photograph')}</span></div><a href="#car=${hero.id}" data-car="${hero.id}">Explore ↗</a></figcaption>`;
  $('#makers').innerHTML = archive ? cars.map(car => `<a class="maker model-index-item" href="#car=${car.id}" data-car="${car.id}"><span class="maker-top"><span>${car.year}</span><span>${car.variants.length} ${car.variants.length===1?'CHAPTER':'CHAPTERS'} ↗</span></span><strong>${esc(car.name)}</strong><small>${esc(car.category)}</small></a>`).join('') : brands.map((brand, index) => {
    const represented = cars.filter(c => c.brand === brand);
    const outlets = [...new Set(represented.flatMap(c => c.sources.map(k => sources[k].outlet)))];
    return `<button class="maker" data-brand="${esc(brand)}" aria-pressed="false"><span class="maker-top"><span>${String(index + 1).padStart(2,'0')}</span><span>${represented.length} ${represented.length === 1 ? 'CAR' : 'CARS'} ↘</span></span><strong>${esc(brand)}</strong><small>${esc(represented.map(c => c.name).join(' · '))}</small><small>Selected by ${esc(outlets.join(' / '))}</small></button>`;
  }).join('');
  (archive ? [...new Set(cars.map(car=>car.category))].sort() : brands).forEach(value => $('#brand').add(new Option(value, value)));
  $('#bibliography').innerHTML = Object.keys(sources).map(key => sourceLink(key, true)).join('');
  const chapters = archive ? [
    {start:1800,end:1949,years:'BEFORE 1950',title:'The early road cars',note:'Origins, coachbuilders and the first series.'},
    {start:1950,end:1969,years:'1950—1969',title:'A new design language',note:'Postwar platforms and new proportions.'},
    {start:1970,end:1989,years:'1970—1989',title:'New shapes and new branches',note:'Wedges, touring cars and growing model ranges.'},
    {start:1990,end:2009,years:'1990—2009',title:'Expanding the family',note:'New platforms, body styles and technologies.'},
    {start:2010,end:2100,years:'2010—2026',title:'Power and form, reconsidered',note:'Electrification and the modern range.'}
  ] : [
    { start:1886,end:1953,years:'1886—1938',title:'Inventing the automobile',note:'From invention to industrial scale.' },
    { start:1954,end:1965,years:'1954—1964',title:'A new language of possibility',note:'Optimism, packaging and the open road.' },
    { start:1966,end:1983,years:'1966—1974',title:'Breaking the shape of things',note:'The supercar, the wedge, the rational hatch.' },
    { start:1984,end:2011,years:'1984—2011',title:'Reinventing the familiar',note:'New formats for families, speed and efficiency.' },
    { start:2012,end:2030,years:'2012—2023',title:'Rethinking power and form',note:'Electric platforms and new supercar extremes.' }
  ];
  function renderTimeline() {
    const query = $('#search').value.trim().toLocaleLowerCase();
    const brand = $('#brand').value;
    const filtered = cars.filter(c => (!brand || (archive?c.category:c.brand) === brand) && [c.brand,c.name,c.designer,c.country,c.title,c.story,...c.variants.map(v=>v.name)].join(' ').toLocaleLowerCase().includes(query));
    $('#history').innerHTML = chapters.map(chapter => {
      const entries = filtered.filter(c => c.year >= chapter.start && c.year <= chapter.end);
      if (!entries.length) return '';
      return `<section class="chapter" aria-label="${esc(chapter.title)}"><header class="chapter-heading"><span>${chapter.years}</span><h3>${chapter.title}</h3><p>${chapter.note}</p></header>${entries.map(car => {
        const variant=car.variants[0];
        return `<article class="car" id="entry-${car.id}"><div class="year">${car.year}</div><figure class="car-photo"><a href="#car=${car.id}" data-car="${car.id}" aria-label="Explore ${esc(car.brand+' '+car.name)}">${variant.photos?.length?photo(variant.photos[0],car.name+' · '+variant.name):`<span class="photo-unavailable">Photograph pending · see full credits in the detail view</span>`}</a><span class="photo-label">${esc(car.country.toUpperCase())} / ${esc(car.designer.split(' / ')[0])}</span></figure><div class="car-copy"><p class="car-meta"><span>${esc(archive?car.category:car.brand)}</span>${archive?`<span title="Introduction years of the design chapters">${car.year===car.variants.at(-1).year?'DEBUT '+car.year:car.year+'—'+car.variants.at(-1).year}</span>`:`<span class="design-score" title="Evidence index: design ${car.design}/60, industry ${car.industry}/30, independent corroboration ${points(car).corroboration}/10">${points(car).total} / 100</span>`}</p><h4><a href="#car=${car.id}" data-car="${car.id}">${esc(car.name)}</a></h4><p class="car-deck">${esc(car.title)}</p><p class="car-story">${esc(car.story)}</p><p class="car-source">${archive?'Reading & reviews':'Editorial evidence'}: ${car.sources.slice(0,2).map(key=>sourceLink(key)).join(' / ')}</p><a class="arrow-link" href="#car=${car.id}" data-car="${car.id}">Explore the car <span>↗</span> <small>${car.variants.length} ${car.variants.length===1?'design chapter':'evolution entries'}</small></a></div></article>`;
      }).join('')}</section>`;
    }).join('');
    $('#result-count').textContent = `${filtered.length} / ${cars.length} cars`;
    $('#empty').hidden = Boolean(filtered.length);
    document.querySelectorAll('[data-brand]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.brand===brand)));
  }
  $('#honors').remove();
  document.querySelector('.honors-section')?.remove();
  function gallery(variant, id, label) {
    galleries.set(id,{photos:variant.photos,index:0,label});
    if (!variant.photos?.length) return `<p class="load-error">Photographs for this chapter are pending local attribution and download. The model history remains available below.</p>`;
    return `<div class="gallery" data-gallery="${id}" role="region" aria-label="${esc(label)} photo gallery"><div class="gallery-stage"><a class="gallery-original" href="${esc(variant.photos[0]?.src || variant.factSource)}" target="_blank" rel="noopener" aria-label="Open full-size ${esc(label)} photograph">${photo(variant.photos[0],label)}</a>${variant.photos.length>1?`<button class="gallery-prev" data-step="-1" aria-label="Previous ${esc(label)} photo">←</button><button class="gallery-next" data-step="1" aria-label="Next ${esc(label)} photo">→</button>`:''}</div><div class="gallery-thumbs" aria-label="Choose photograph">${variant.photos.map((p,i)=>`<button data-index="${i}" aria-pressed="${i===0}" aria-label="${esc(label)} photo ${i+1} of ${variant.photos.length}">${photo(p,'')}</button>`).join('')}</div><p class="gallery-credit"></p></div>`;
  }
  function updateGallery(element, index) {
    const state=galleries.get(element.dataset.gallery);
    if (!state?.photos.length) return;
    state.index=(index+state.photos.length)%state.photos.length;
    const p=state.photos[state.index];
    const img=element.querySelector('.gallery-stage img');
    img.src=p.src; img.alt=`${state.label} · photograph ${state.index+1}: ${p.description.slice(0,160)}`;
    element.querySelector('.gallery-original').href=p.src;
    element.querySelectorAll('[data-index]').forEach((button,i)=>button.setAttribute('aria-pressed',String(i===state.index)));
    element.querySelector('.gallery-credit').innerHTML=`${state.index+1} / ${state.photos.length} · ${esc(p.origin)}<br><a href="${esc(p.page)}" target="_blank" rel="noopener noreferrer">${esc(p.credit)} ↗</a><a href="${esc(p.licenseUrl)}" target="_blank" rel="noopener noreferrer">${esc(p.license)} ↗</a><span>${esc(p.file)}</span>`;
  }
  function video(car) {
    const v=car.video;
    if (!v) return '';
    const kindLabel = ({review:'Driving review',feature:'Specialist feature',walkaround:'Walkaround','first-look':'First look',history:'Historical overview'})[v.kind] || 'Video feature';
    const videoLabel = archive ? `<p class="eyebrow video-kind">${esc(kindLabel.toUpperCase())} / YOUTUBE</p>` : '';
    if (!v.id && !v.episode) return `<section class="watch-section">${videoLabel}<h3>Watch the car.</h3><p>${esc(v.channel)} · ${esc(v.note||'Model-specific review or historical feature.')}</p><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a></section>`;
    return `<section class="watch-section">${videoLabel}<h3>Watch the car.</h3><p>${esc(v.channel)}${v.note?' · '+esc(v.note):''}</p>${v.id?`<div class="video-wrap"><button class="video-consent" data-video="${esc(v.id)}" aria-label="Play ${esc(v.title)}"><span class="play" aria-hidden="true">▶</span><span><small>${esc(v.channel.toUpperCase())} / YOUTUBE</small><strong>${esc(v.title)}</strong><span>Play video · loads YouTube’s embedded player</span></span></button></div><div class="watch-links"><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">Watch on YouTube ↗</a>${v.related?`<a href="${esc(v.related.url)}" target="_blank" rel="noopener noreferrer">${esc(v.related.title)} ↗</a>`:""}</div>`:`<div class="episode"><strong>${esc(v.episode)}</strong><a href="${esc(v.url)}" target="_blank" rel="noopener noreferrer">${esc(v.title)} ↗</a><p>Find this episode on your local broadcaster or streaming service. Availability varies by region.</p></div>`}</section>`;
  }
  function archiveEvidence(car) {
    return `<section class="evidence"><h3>History & reviews.</h3><p>${esc(car.evidence)}</p><div class="source-links">${car.sources.map(k=>sourceLink(k,true)).join('')}</div>${car.facts?`<dl class="model-facts">${Object.entries(car.facts).map(([key,value])=>`<div><dt>${esc(key)}</dt><dd>${esc(value)}</dd></div>`).join('')}</dl>`:''}</section>`;
  }
  function renderDetail(car) {
    activeCar=car;
    galleries.clear();
    const score=points(car);
    $('#detail').innerHTML=`<header class="detail-heading"><div><p class="eyebrow">${car.year} / ${esc(car.brand.toUpperCase())} / ${esc(car.country.toUpperCase())}</p><h2 id="detail-title">${esc(car.name)}</h2><p class="car-deck">${esc(car.title)}</p></div><p>DESIGN<br>${esc(car.designer)}</p></header>${gallery(car.variants[0],'main',car.name)}<p class="detail-story">${esc(car.story)}</p>${archive?archiveEvidence(car):`<section class="evidence"><h3>Why it is here.</h3><div class="score-grid"><div><span>DESIGN / 60</span><strong>${car.design}</strong></div><div><span>INDUSTRY / 30</span><strong>${car.industry}</strong></div><div><span>CORROBORATION / 10</span><strong>${score.corroboration}</strong></div><div><span>EVIDENCE INDEX / 100</span><strong>${score.total}</strong></div></div><p>${esc(car.evidence)}</p><p>Computed from the published evidence; not a score awarded by a reviewer. Design is weighted twice as heavily as industry influence. This score applies to the model family.</p><div class="source-links">${car.sources.map(k=>sourceLink(k,true)).join('')}</div></section>`}${video(car)}<section class="evolution-header"><p class="eyebrow">THE DESIGN, OVER TIME</p><h3>One idea. ${car.variants.length===1?'One distinct form.':'Different expressions.'}</h3><p>${esc(car.excluded)}</p></section><div class="evolution">${car.variants.map((v,i)=>{
      const prev=car.variants[i-1];
      const label=`${car.name} ${v.name}`;
      return `<article class="generation"><div class="year">${v.year}</div><div><p class="eyebrow">${i===0?'THE STARTING POINT':`EVOLUTION ${String(i+1).padStart(2,'0')}`} / ${esc(v.kind)}</p><h4>${esc(v.name)}</h4>${gallery(v,'generation-'+i,label)}<section class="diff" aria-label="${esc(v.name)} differences"><p class="diff-label">${prev?'DIFF / FROM '+esc(prev.name.toUpperCase()):'BASELINE / WHAT DEFINES IT'}</p>${prev?`<div class="diff-pictures"><figure>${photo(prev.photos[0],car.name+' '+prev.name+' before')}<figcaption>BEFORE · ${prev.year} ${esc(prev.name)}</figcaption></figure><figure>${photo(v.photos[0],label+' after')}<figcaption>AFTER · ${v.year} ${esc(v.name)}</figcaption></figure></div>`:''}<div class="diff-text"><div><strong>${prev?'Form · what changed':'Form · the starting design'}</strong><p>${prev?`<span>Before: ${esc(prev.shape)}</span><br><span>After: ${esc(v.shape)}</span>`:esc(v.shape)}</p></div><div><strong>${prev?'Underneath · what changed':'Underneath · the starting architecture'}</strong><p>${prev?`<span>Before: ${esc(prev.engineering)}</span><br><span>After: ${esc(v.engineering)}</span>`:esc(v.engineering)}</p></div></div></section><a class="fact-source" href="${esc(v.factSource)}" target="_blank" rel="noopener noreferrer">Model history, dates & further references ↗</a></div></article>`;
    }).join('')}</div><div class="archive-end"><button data-neighbor="-1" ${cars.indexOf(car)===0?'disabled':''}>← Previous car</button><span class="eyebrow">${String(cars.indexOf(car)+1).padStart(2,'0')} / ${cars.length}</span><button data-neighbor="1" ${cars.indexOf(car)===cars.length-1?'disabled':''}>Next car →</button></div>`;
    $('#detail').querySelectorAll('[data-gallery]').forEach(el=>updateGallery(el,0));
    $('#permalink').href=`${location.pathname}#car=${car.id}`;
  }
  function openCar(id, push = true, trigger = null) {
    const car=cars.find(c=>c.id===id);
    if (!car) return;
    if (!dialog.open) lastTrigger=trigger || document.activeElement;
    renderDetail(car);
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');
    if (push && location.hash!==`#car=${id}`) { history.pushState({automotiveCar:true},'',`#car=${id}`);pushedCar=true; }
    $('#close-dialog').focus({preventScroll:true});
    // A closed dialog has no scroll box; reset only after it is visible.
    dialog.scrollTo({top:0,left:0,behavior:'instant'});
  }
  function closeCar(fromHistory = false) {
    if (!dialog.open) return;
    dialog.close();
    document.body.classList.remove('modal-open');
    $('#detail').innerHTML='';galleries.clear();activeCar=null;
    if (!fromHistory && location.hash.startsWith('#car=')) {
      if (pushedCar) history.back();
      else history.replaceState(null,'',location.pathname+location.search);
    }
    pushedCar=false;
    if (lastTrigger?.isConnected) lastTrigger.focus({preventScroll:true});
  }
  document.addEventListener('click',async event=>{
    const carLink=event.target.closest('[data-car]');
    if (carLink && !event.ctrlKey && !event.metaKey && !event.shiftKey) { event.preventDefault();openCar(carLink.dataset.car,true,carLink);return; }
    const maker=event.target.closest('[data-brand]');
    if (maker) {$('#brand').value=$('#brand').value===maker.dataset.brand?'':maker.dataset.brand;$('#search').value='';renderTimeline();$('#timeline').scrollIntoView();$('#brand').focus({preventScroll:true});return;}
    const galleryButton=event.target.closest('[data-step], [data-index]');
    if (galleryButton) {const el=galleryButton.closest('[data-gallery]');const state=galleries.get(el.dataset.gallery);updateGallery(el,galleryButton.hasAttribute('data-index')?Number(galleryButton.dataset.index):state.index+Number(galleryButton.dataset.step));return;}
    const play=event.target.closest('[data-video]');
    if (play) {const frame=document.createElement('iframe');frame.title=activeCar.video.title;frame.src=`https://www.youtube-nocookie.com/embed/${play.dataset.video}?autoplay=1`;frame.allow='accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.referrerPolicy='strict-origin-when-cross-origin';play.replaceWith(frame);frame.focus();return;}
    const next=event.target.closest('[data-neighbor]');
    if(next){const car=cars[cars.indexOf(activeCar)+Number(next.dataset.neighbor)];if(car){history.replaceState(history.state,'',`#car=${car.id}`);openCar(car.id,false);}return;}
    if(event.target.closest('#permalink')){event.preventDefault();try{await navigator.clipboard.writeText(location.href);$('#permalink').textContent='LINK COPIED ✓';setTimeout(()=>{$('#permalink').textContent='COPY CAR LINK ↗';},1800);}catch{ $('#announcement').textContent='Copy the car link from the address bar.'; }}
  });
  $('#close-dialog').addEventListener('click',()=>closeCar());
  dialog.addEventListener('cancel',event=>{event.preventDefault();closeCar();});
  dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeCar();}});
  $('#search').addEventListener('input',renderTimeline);
  $('#brand').addEventListener('change',renderTimeline);
  $('#reset').addEventListener('click',()=>{$('#search').value='';$('#brand').value='';renderTimeline();});
  function route(){const match=location.hash.match(/^#car=([a-z0-9-]+)$/);if(match)openCar(match[1],false);else closeCar(true);}
  window.addEventListener('popstate',route);
  window.addEventListener('hashchange',route);
  if (archive && $('#films')) {
    $('#films').innerHTML=data.films.map(film=>`<article class="film-card"><p class="eyebrow">${esc(film.year)} / ${esc(film.type)}</p><h3>${esc(film.title)}</h3><p class="film-origin">${esc(film.origin)}</p><p>${esc(film.description)}</p><div class="watch-links"><a href="${esc(film.url)}" target="_blank" rel="noopener noreferrer">${esc(film.linkLabel||'Film information')} ↗</a>${film.watchUrl?`<a href="${esc(film.watchUrl)}" target="_blank" rel="noopener noreferrer">${esc(film.watchLabel||'Watch / trailer')} ↗</a>`:''}</div></article>`).join('');
  }
  renderTimeline();route();
  // Initial section anchors otherwise resolve before the fetched timeline exists.
  const initialSection = location.hash;
  if (archive && ['#watch','#timeline','#manufacturers'].includes(initialSection)) {
    document.fonts.ready.then(() => {
      if (location.hash === initialSection) document.getElementById(initialSection.slice(1))?.scrollIntoView({behavior:'instant'});
    });
  }
})();
