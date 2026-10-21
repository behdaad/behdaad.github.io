(() => {
  'use strict';
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('.gallery').forEach(gallery => {
    const strip = gallery.querySelector('.slides');
    const buttons = gallery.querySelector('.gallery-buttons');
    if (!strip || !buttons) return;
    const count = strip.children.length;
    const update = () => {
      const index = Math.round(strip.scrollLeft / strip.clientWidth);
      gallery.querySelector('.counter').textContent = `${index + 1} / ${count}`;
      buttons.children[0].disabled = index === 0;
      buttons.children[1].disabled = index === count - 1;
    };
    buttons.hidden = false;
    buttons.addEventListener('click', event => {
      const button = event.target.closest('[data-step]');
      if (!button) return;
      strip.scrollBy({left: Number(button.dataset.step) * strip.clientWidth, behavior: reduced ? 'instant' : 'smooth'});
    });
    strip.addEventListener('scroll', update, {passive:true});
    strip.addEventListener('keydown', event => {
      if (!['ArrowLeft','ArrowRight'].includes(event.key)) return;
      event.preventDefault();
      strip.scrollBy({left: (event.key === 'ArrowRight' ? 1 : -1) * strip.clientWidth, behavior: reduced ? 'instant' : 'smooth'});
    });
    new ResizeObserver(update).observe(strip);
    update();
  });
  const notice = document.querySelector('#notice');
  let noticeTimer;
  const announce = message => {
    clearTimeout(noticeTimer);
    notice.textContent = message;
    noticeTimer = setTimeout(() => {notice.textContent='';}, 5000);
  };
  document.querySelectorAll('[data-share]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const url = new URL(window.location.href);
      url.hash = button.dataset.share;
      try {
        await navigator.clipboard.writeText(url.href);
        announce('Plan link copied. Paste it into your group chat.');
      } catch {
        window.location.hash = button.dataset.share;
        announce('This plan is now in the address bar. Copy its URL to share.');
      }
    });
  });
  document.querySelector('.sort-control').hidden = false;
  document.querySelector('#sort').addEventListener('change', event => {
    const list = document.querySelector('#pair-list');
    [...list.children].sort((a,b) => Number(a.dataset[event.target.value])-Number(b.dataset[event.target.value])).forEach(card => list.append(card));
    announce('Evenings reordered.');
  });
  const venues = JSON.parse(document.querySelector('#venue-data').textContent);
  if (!window.L) return; // Text addresses and directions remain usable without the map library.
  const observer = new IntersectionObserver(entries => entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const element = entry.target;
    observer.unobserve(element);
    const a = venues[element.dataset.bar], b = venues[element.dataset.restaurant];
    element.replaceChildren();
    const map = L.map(element,{scrollWheelZoom:false,dragging:!L.Browser.mobile,tapHold:false});
    const tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png',{
      maxZoom:19, attribution:'© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);
    tiles.on('tileerror', () => {
      element.setAttribute('aria-label',`Map tiles unavailable. A: ${a.name}; B: ${b.name}. Use walking directions below.`);
    });
    [[a,'A',''],[b,'B','restaurant']].forEach(([venue,label,cls]) => {
      L.marker(venue.coords, {title:venue.name,alt:`${label}: ${venue.name}`,icon:L.divIcon({className:`pin ${cls}`,html:label,iconSize:[34,34],iconAnchor:[17,17]})}).addTo(map).bindPopup(venue.name);
    });
    const fit = () => map.fitBounds([a.coords,b.coords],{padding:[42,42],maxZoom:16,animate:false});
    fit();
    new ResizeObserver(() => {map.invalidateSize();fit();}).observe(element);
  }),{rootMargin:'200px'});
  document.querySelectorAll('.map').forEach(element => observer.observe(element));
})();
