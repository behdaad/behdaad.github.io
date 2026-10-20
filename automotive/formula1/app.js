'use strict';
(() => {
  const $ = (s) => document.querySelector(s);
  const escape = (s = '') => String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normal = s => String(s).normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const external = (url, text, cls = '') => `<a class="${cls}" href="${escape(url)}" target="_blank" rel="noopener noreferrer">${text}</a>`;
  const eras = [
    {start:1950,end:1969,title:'The foundations of a world championship',text:'Front-engined giants give way to compact rear-engined cars. Fangio sets the benchmark; British constructors and the monocoque change the shape of the sport. The early years are a concise route through the essentials.'},
    {start:1970,end:1990,title:'Ground effect, turbo power, fierce rivals',text:'The cars become aerodynamic experiments and the business grows around television. Stewart campaigns for safety; Lauda and Hunt fight a famous title battle; Prost and Senna turn team-mate tension into a defining feud.'},
    {start:1991,end:2006,title:'Schumacher arrives. Ferrari rebuilds.',text:'A debut at Spa begins the central thread of this chapter. Electronics, refuelling, safety changes and tyre competition shape the racing; Schumacher’s Benetton titles lead into Ferrari’s long climb and five consecutive drivers’ championships.'},
    {start:2007,end:2013,title:'A new generation takes the wheel',text:'Hamilton and Vettel arrive as Alonso and Räikkönen challenge for titles. A major aerodynamic reset creates Brawn’s opportunity in 2009; refuelling disappears in 2010, then DRS and Pirelli tyres change the rhythm of racing in 2011.'},
    {start:2014,end:2021,title:'Hybrid power. Fractured partnerships.',text:'Turbo-hybrid power units begin a period of Mercedes dominance. Hamilton and Rosberg fight within the same team; Ferrari and Red Bull later challenge. The halo arrives in 2018, and Hamilton versus Verstappen brings the era to an intensely disputed close.'},
    {start:2022,end:2026,title:'Ground effect returns. The story continues.',text:'The 2022 rules put greater emphasis on underfloor downforce. Red Bull sets the early standard, before McLaren’s resurgence. The 2026 reset brings active aerodynamics, more electrical power and a new generation of drivers. This final season is still in progress.'}
  ];
  let data, byId, returnFocus, previousHash = '', activeRace = null;
  const dialog = $('#notes');
  function photo(i) {
    if (!i.photo) return '';
    const p = i.photo;
    return `<figure class="${i.type === 'race' ? 'race-photo' : ''}"><img src="${escape(p.src)}" alt="${escape(p.alt)}" width="768" height="432" loading="lazy" decoding="async"><figcaption>${external(p.page, `${escape(p.kind)} ↗`)}<br>© ${escape(p.credit)}</figcaption></figure>`;
  }
  function links(i) {
    if (i.watch) return `<div class="entry-links">${external(i.watch.url, `${escape(i.watchLabel)} <span aria-hidden="true">↗</span>`, 'watch-link')}${i.alternativeHighlights ? external(i.alternativeHighlights.url,'Official highlights on YouTube ↗','secondary-link') : ''}${i.titleSession ? external(i.titleSession.url,'Watch title-clinching sprint ↗','secondary-link') : ''}${i.type === 'race' ? `<button class="notes-button" data-notes="${escape(i.id)}">Race notes & sources</button>` : ''}</div><p class="format-note">${escape(i.watchKind)}${i.duration ? ' · ' + escape(i.duration) : ''}</p>`;
    return `<div class="entry-links"><button class="notes-button" data-notes="${escape(i.id)}">Race notes & historical sources</button></div><p class="format-note">${escape(i.watchKind)}</p>`;
  }
  function card(i) {
    const heading = `heading-${i.id}`;
    if (i.type === 'race') return `<article id="entry-${i.id}" class="entry entry-race ${i.photo ? '' : 'race-no-image'}" data-id="${i.id}" data-type="race" aria-labelledby="${heading}"><div class="race-layout">${photo(i)}<div><p class="entry-meta">RACE / ${escape(i.tag)}</p><p class="race-place">${escape(i.raceName)} · ${escape(i.date)} ${i.year}</p><h3 id="${heading}" class="race-outcome">${escape(i.title)}</h3><p class="outcome-placeholder" aria-hidden="true">${escape(i.name)} ${i.year}</p><p class="entry-story race-outcome">${escape(i.story)}</p><p class="outcome-warning">Race story hidden.</p>${links(i)}<button type="button" class="reveal-outcome" data-reveal="${i.id}" hidden>Reveal race story</button></div></div></article>`;
    if (i.type === 'documentary') {
      const episodes = i.episodes ? `<div class="episodes" aria-label="Series episodes">${[...new Map(i.episodes.map(e => [e.url, e])).values()].sort((a,b)=>a.title.localeCompare(b.title)).map((e,n)=>external(e.url,`Episode ${n+1} ↗`)).join('')}</div>` : '';
      return `<article id="entry-${i.id}" class="entry entry-documentary" data-id="${i.id}" data-type="documentary" aria-labelledby="${heading}"><div class="doc-layout">${photo(i)}<div><p class="entry-meta">THE DOCUMENTARY DETOUR / F1 TV</p><h3 id="${heading}">${escape(i.title)}</h3><p class="span-label">${escape(i.span)}</p><p class="entry-story">${escape(i.story)}</p>${links(i)}${episodes}</div></div></article>`;
    }
    if (i.type === 'person') {
      const p = i.photo;
      return `<article id="entry-${i.id}" class="entry entry-person" data-id="${i.id}" data-type="person" aria-labelledby="${heading}"><figure><img src="${escape(p.src)}" alt="${escape(p.alt)} — reference portrait" loading="lazy" decoding="async" width="240" height="300"></figure><div class="person-copy"><p class="entry-meta">A FACE TO REMEMBER / INTRODUCED ${i.year}</p><h3 id="${heading}">${escape(i.name)}</h3><p class="person-subtitle">${escape(i.title)}</p><p class="entry-story">${escape(i.story)}</p><details class="portrait-credit"><summary>Portrait source & licence</summary><p>${escape(p.kind)}. ${external(p.page,escape(p.credit)+' ↗')} · ${external(p.licenseUrl,escape(p.license))}. ${escape(p.caption)}</p></details><div class="entry-links">${external(i.source,'Biography & references ↗','secondary-link')}</div></div></article>`;
    }
    return `<article id="entry-${i.id}" class="entry entry-screen" data-id="${i.id}" data-type="screen" aria-labelledby="${heading}"><div class="screen-layout"><span class="screen-icon" aria-hidden="true">▻</span><div><p class="entry-meta">OFF THE CIRCUIT / FILMS & TELEVISION</p><h3 id="${heading}">${escape(i.title)}</h3><p class="screen-format">${escape(i.format)} · released ${i.released}</p><p class="span-label">${escape(i.span)}</p><p class="entry-story">${escape(i.story)}</p><div class="entry-links">${external(i.url, `${escape(i.label)} <span aria-hidden="true">↗</span>`, 'watch-link')}${i.url !== i.sources[0].url ? external(i.sources[0].url,'About this selection ↗','secondary-link') : ''}</div></div></div></article>`;
  }
  function createTimeline() {
    let html = '';
    for (const era of eras) {
      html += `<div class="era-heading" data-start="${era.start}" data-end="${era.end}"><p class="eyebrow">${era.start} — ${era.end}</p><div><h3>${era.title}</h3><p>${era.text}</p></div></div>`;
      for (let year = era.start; year <= era.end; year++) {
        const items = data.items.filter(i => i.year === year);
        html += `<section class="season" id="year-${year}" aria-labelledby="year-title-${year}" data-year="${year}"><h2 class="season-year" id="year-title-${year}"><a href="#year-${year}" aria-label="${year} season">${year}</a></h2><div class="year-content">${items.map(card).join('')}</div></section>`;
      }
    }
    $('#timeline').innerHTML = html;
  }
  function matches(i) {
    const query = normal($('#search').value.trim());
    const type = $('#type').value;
    const [start, end] = $('#era').value === 'all' ? [1950,2026] : $('#era').value.split('-').map(Number);
    const typeMatch = type === 'all' || i.type === type || (type === 'decider' && i.type === 'race' && /title (clincher|decider)/i.test(i.tag)) || (type === 'controversy' && i.type === 'race' && /controvers|crashgate|team orders|stewarding|collision|tragedy|fatal|safety|tyre failure/i.test(i.tag));
    return typeMatch && i.year >= start && i.year <= end && (!query || normal([i.year,i.name,i.title,i.story,i.tag,i.span].filter(Boolean).join(' ')).includes(query));
  }
  function filter() {
    let count = 0, years = 0;
    for (const i of data.items) {const visible = matches(i);$(`#entry-${i.id}`).hidden = !visible;if(visible) count++;}
    document.querySelectorAll('.season').forEach(s => {s.hidden = !s.querySelector('.entry:not([hidden])');if(!s.hidden) years++;});
    document.querySelectorAll('.era-heading').forEach(h => {h.hidden = !data.items.some(i => i.year >= +h.dataset.start && i.year <= +h.dataset.end && matches(i));});
    $('#status').textContent = `${count} entries · ${years} seasons`;
    $('#empty').hidden = count > 0;
    $('#jump').innerHTML = '<option value="">Jump to year</option>' + Array.from(document.querySelectorAll('.season:not([hidden])')).map(s=>`<option value="${s.dataset.year}">${s.dataset.year}</option>`).join('');
  }
  function jump(year) {
    if (!data || !$(`#year-${year}`)) return;
    if ($(`#year-${year}`).hidden) {$('#search').value = '';$('#type').value = 'all';$('#era').value = 'all';filter();}
    history.replaceState(null,'',`#year-${year}`);
    $(`#year-${year}`).scrollIntoView({behavior:'instant'});
    const target = $(`#year-title-${year} a`);target.focus({preventScroll:true});
  }
  function openNotes(id, updateHash = true) {
    const i = byId.get(id);if (!i || i.type !== 'race') return;
    if (!dialog.open) {returnFocus = document.activeElement;previousHash = location.hash.startsWith('#race=') ? '' : location.hash;}
    activeRace = id;
    $('#notes-content').innerHTML = `<p class="eyebrow">${i.year} / ${escape(i.name)} GRAND PRIX</p><h2 id="notes-title">${escape(i.title)}</h2><p class="format-note">${escape(i.date)} ${i.year} · ${escape(i.tag)}</p>${i.photo ? `<img src="${escape(i.photo.src)}" alt="${escape(i.photo.alt)}"><p class="format-note">${external(i.photo.page,escape(i.photo.kind)+' ↗')} · © ${escape(i.photo.credit)}</p>` : ''}<p class="entry-story">${escape(i.story)}</p><p class="format-note">Official winner: ${escape(i.result.winner.replace(/([a-zé])([A-Z]{3})$/, '$1'))}. Source: the final race classification, including subsequent penalties.</p>${links(i).replace(/<button.*?<\/button>/,'')}${i.extended ? `<div class="entry-links">${external(i.extended.url,'Watch Race in 30 ↗','secondary-link')}</div>` : ''}<h3>Read the record</h3><ul class="source-list">${i.sources.map(s=>`<li>${external(s.url,escape(s.title)+' ↗')}</li>`).join('')}</ul><p class="format-note">Catalog checked ${data.cutoff}. Watch links open another tab. F1 TV may ask you to sign in; playback availability depends on your region and subscription.</p>`;
    if (!dialog.open) dialog.showModal();
    document.body.classList.add('modal-open');dialog.scrollTop = 0;
    $('#close-notes').focus({preventScroll:true});
    if (updateHash) history.pushState(null,'',`#race=${encodeURIComponent(id)}`);
  }
  function closeNotes(updateHash = true) {
    if (!dialog.open) return;
    dialog.close();document.body.classList.remove('modal-open');activeRace = null;
    if (updateHash && location.hash.startsWith('#race=')) history.replaceState(null,'',location.pathname+location.search+previousHash);
    if (returnFocus?.isConnected) returnFocus.focus({preventScroll:true});
  }
  function route() {
    if (!data) return;
    if (location.hash.startsWith('#race=')) {
      const id = decodeURIComponent(location.hash.slice(6));if(byId.has(id))openNotes(id,false);else closeNotes(false);
    } else {closeNotes(false);if(/^#year-\d{4}$/.test(location.hash))jump(+location.hash.slice(6));}
  }
  async function init() {
    try {
      const response = await fetch('data.json');if(!response.ok)throw new Error('Timeline data unavailable');data = await response.json();byId = new Map(data.items.map(i=>[i.id,i]));
      createTimeline();filter();
      const counts = Object.fromEntries(['race','documentary','screen','person'].map(type=>[type,data.items.filter(i=>i.type===type).length]));
      $('#totals').innerHTML = `${counts.race} RACES <br>${counts.documentary} F1 TV DETOURS · ${counts.screen} FILMS & SERIES<br>${counts.person} INTRODUCTIONS TO THE PEOPLE`;
      const hero = byId.get('1992-belgium');
      $('#hero').innerHTML = `<img src="${escape(hero.photo.src)}" alt="${escape(hero.photo.alt)}" width="768" height="432" fetchpriority="high"><figcaption><p class="eyebrow">SPA-FRANCORCHAMPS / 1992</p><strong>A first win.<br>The beginning of an era.</strong>${external(hero.photo.page,'F1 TV catalog artwork · © Formula 1 / F1 TV ↗')}</figcaption>`;
      $('#search').addEventListener('input',filter);$('#type').addEventListener('change',filter);$('#era').addEventListener('change',filter);$('#jump').addEventListener('change',e=>{if(e.target.value)jump(+e.target.value);});
      $('#reset').addEventListener('click',()=>{$('#search').value='';$('#type').value='all';$('#era').value='all';filter();});
      $('#spoilers').addEventListener('change',e=>{document.body.classList.toggle('hide-outcomes',e.target.checked);document.querySelectorAll('[data-reveal]').forEach(b=>{b.hidden=!e.target.checked;});});
      document.addEventListener('click',e=>{const note=e.target.closest('[data-notes]');if(note){openNotes(note.dataset.notes);return;}const nav=e.target.closest('[data-jump]');if(nav){e.preventDefault();jump(+nav.dataset.jump);return;}const reveal=e.target.closest('[data-reveal]');if(reveal){const card=reveal.closest('article');const revealed=card.classList.toggle('revealed-entry');card.querySelectorAll('.race-outcome').forEach(n=>n.classList.toggle('revealed',revealed));reveal.textContent=revealed?'Hide race story':'Reveal race story';reveal.setAttribute('aria-expanded',String(revealed));}});
      $('#close-notes').addEventListener('click',()=>closeNotes());dialog.addEventListener('cancel',e=>{e.preventDefault();closeNotes();});dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)closeNotes();}});
      window.addEventListener('hashchange',route);window.addEventListener('popstate',route);route();
    } catch(error) {$('#timeline').innerHTML='<p>The timeline could not load. Please reload this page.</p>';$('#status').textContent='Unable to load timeline';console.error(error);}
  }
  init();
})();
