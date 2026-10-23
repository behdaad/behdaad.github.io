(() => {
  'use strict';
  const $ = selector => document.querySelector(selector);
  const keys = ['shutter', 'aperture', 'iso', 'exposure', 'white-balance', 'focal-length', 'focus'];
  const shutters = [2000, 1000, 500, 250, 125, 60, 30, 15];
  const apertures = [1.48, 1.8, 2.8, 4];
  const isos = [100, 200, 400, 800, 1600, 3200];
  const focalLengths = [13, 24, 48, 100, 200];
  const defaults = () => ({ shutter: 3, aperture: 2, iso: 0, kelvin: 5500, focal: 1, focus: 0 });
  const states = Object.fromEntries(keys.map(key => [key, defaults()]));
  const canvas = $('#scene');
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return;
  let active = 'shutter';
  let comparing = false;
  let loadedMission = null;
  const titles = { shutter: 'MOTION STUDY', aperture: 'DEPTH STUDY', iso: 'SIGNAL STUDY', exposure: 'EXPOSURE STUDY', 'white-balance': 'COLOR STUDY', 'focal-length': 'FRAMING STUDY', focus: 'FOCUS STUDY' };
  const modelNotes = {
    shutter: 'Brightness is held steady to isolate motion blur. Imagine the camera staying still while the cyclist moves.',
    aperture: 'Brightness is held steady. Focus stays on the foreground flowers. Depth blur is exaggerated so the difference is easy to see.',
    iso: 'Equal-brightness comparison: higher ISO is paired with a faster shutter and less captured light. Grain is exaggerated; it is not an iPhone noise measurement.',
    exposure: 'Manual exposure: all three settings work together. The meter compares with this scene’s reference brightness, not a universal “correct” exposure.',
    'white-balance': 'The light stays at 5500 K. This slider changes the camera’s white balance setting, not the actual color of the light.',
    'focal-length': 'Same camera position, different framing. The illustration is cropped to demonstrate field of view; lens distortion and sensor switching are not simulated.',
    focus: 'A deliberately shallow depth of field makes the focus plane visible. Blur is exaggerated and the distances are illustrative.'
  };
  const definitions = {
    shutter: { key: 'shutter', label: 'Shutter speed', max: shutters.length - 1, format: value => `1/${shutters[value]} s`, ends: ['Faster · freeze motion', 'Slower · show movement'] },
    aperture: { key: 'aperture', label: 'Aperture', max: apertures.length - 1, format: value => `f/${apertures[value]}`, ends: ['Wider opening', 'Narrower opening'] },
    iso: { key: 'iso', label: 'ISO', max: isos.length - 1, format: value => `ISO ${isos[value]}`, ends: ['Lower signal gain', 'Higher signal gain'] },
    'white-balance': { key: 'kelvin', label: 'White balance setting', min: 2500, max: 9000, step: 100, format: value => `${value.toLocaleString('en')} K`, ends: ['Cooler result', 'Warmer result'] },
    'focal-length': { key: 'focal', label: 'Focal length · 35 mm equivalent', max: focalLengths.length - 1, format: value => `${focalLengths[value]} mm`, ends: ['Wide view', 'Tight view'] },
    focus: { key: 'focus', label: 'Focus distance', max: 2, format: value => ['Flowers · near', 'Cyclist · middle', 'Houses · far'][value], ends: ['Near', 'Far'] }
  };

  // Each scene layer is original vector artwork. Canvas filters separate depth planes.
  function surface() {
    const layer = document.createElement('canvas');
    layer.width = 1000; layer.height = 750;
    return layer;
  }
  const background = surface();
  const landscape = background.getContext('2d');
  const sky = landscape.createLinearGradient(0, 0, 0, 440);
  sky.addColorStop(0, '#9dbbc0'); sky.addColorStop(1, '#e4d9b7');
  landscape.fillStyle = sky; landscape.fillRect(0, 0, 1000, 750);
  landscape.fillStyle = '#f4dea5'; landscape.beginPath(); landscape.arc(825, 125, 48, 0, Math.PI * 2); landscape.fill();
  const water = landscape.createLinearGradient(0, 420, 0, 750);
  water.addColorStop(0, '#648e8d'); water.addColorStop(1, '#385f62');
  landscape.fillStyle = water; landscape.fillRect(0, 430, 1000, 320);
  let seed = 51;
  const random = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
  for (let i = 0; i < 160; i++) {
    const y = 445 + random() * 300;
    landscape.fillStyle = i % 3 === 0 ? '#e0c48445' : '#c0d5c028';
    landscape.fillRect(random() * 1000, y, 5 + random() * 60, 1 + random() * 3);
  }
  const buildings = surface();
  const b = buildings.getContext('2d');
  function house(x, width, top, color, gable) {
    b.fillStyle = '#304a43'; b.fillRect(x - 5, top + 60, width + 9, 316 - top);
    b.fillStyle = color; b.fillRect(x, top + 48, width, 370 - top);
    b.beginPath(); b.moveTo(x - 4, top + 54);
    if (gable) {
      b.lineTo(x + width * .15, top + 54); b.lineTo(x + width * .15, top + 30);
      b.lineTo(x + width * .32, top + 30); b.lineTo(x + width * .32, top + 12);
      b.lineTo(x + width * .43, top + 12); b.lineTo(x + width * .43, top);
      b.lineTo(x + width * .57, top); b.lineTo(x + width * .57, top + 12);
      b.lineTo(x + width * .68, top + 12); b.lineTo(x + width * .68, top + 30);
      b.lineTo(x + width * .85, top + 30); b.lineTo(x + width * .85, top + 54);
    } else { b.lineTo(x + width / 2, top - 3); }
    b.lineTo(x + width + 4, top + 54); b.closePath(); b.fill();
    b.strokeStyle = '#e6d9bd'; b.lineWidth = 4; b.stroke();
    b.fillStyle = '#152e30';
    const cols = width > 120 ? 3 : 2;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < cols; col++) {
        const wx = x + 17 + col * (width - 26) / cols;
        const wy = top + 79 + row * 83;
        b.fillStyle = '#dfd6b9'; b.fillRect(wx - 4, wy - 4, 30, 53);
        b.fillStyle = '#355557'; b.fillRect(wx, wy, 22, 45);
        b.fillStyle = '#d3c69f'; b.fillRect(wx, wy + 21, 22, 3); b.fillRect(wx + 10, wy, 2, 45);
        b.fillStyle = '#b9ccbc45'; b.fillRect(wx + 2, wy + 2, 7, 17);
      }
    }
    b.fillStyle = '#293d38'; b.fillRect(x + width / 2 - 16, 364, 32, 54);
    b.fillStyle = '#e2c89b'; b.fillRect(x + width / 2 + 7, 390, 3, 3);
    b.strokeStyle = '#574f4425'; b.lineWidth = 1;
    for (let y = top + 63; y < 415; y += 12) { b.beginPath(); b.moveTo(x + 2, y); b.lineTo(x + width - 2, y); b.stroke(); }
  }
  house(-20, 122, 156, '#b78f64', true);
  house(108, 123, 103, '#8d5440', true);
  house(238, 143, 137, '#dbc6a1', false);
  house(388, 105, 79, '#754f42', true);
  house(500, 131, 119, '#b46f4c', true);
  house(638, 137, 93, '#beb699', false);
  house(782, 116, 149, '#5c726b', true);
  house(905, 124, 121, '#be9569', true);
  b.fillStyle = '#a69f8b'; b.fillRect(0, 417, 1000, 26);
  b.fillStyle = '#4f5145'; b.fillRect(0, 440, 1000, 12);
  for (let x = 15; x < 1000; x += 45) { b.fillStyle = '#343f39'; b.fillRect(x, 393, 4, 32); }
  b.fillRect(0, 398, 1000, 3);
  // Leaf clusters and a tree trunk, rather than a stock photograph.
  function tree(x, y, scale) {
    b.fillStyle = '#5e5b43'; b.fillRect(x - 5 * scale, y, 10 * scale, 120 * scale);
    for (let i = 0; i < 28; i++) {
      b.fillStyle = ['#536b49', '#6f7b4b', '#8b8d53', '#465e46'][i % 4];
      b.beginPath(); b.arc(x + (random() - .5) * 110 * scale, y - random() * 70 * scale, (18 + random() * 17) * scale, 0, Math.PI * 2); b.fill();
    }
  }
  tree(47, 325, 1); tree(960, 312, 1.1);
  const foreground = surface();
  const f = foreground.getContext('2d');
  f.fillStyle = '#b6ac94'; f.beginPath(); f.moveTo(0, 603); f.lineTo(1000, 541); f.lineTo(1000, 750); f.lineTo(0, 750); f.fill();
  f.strokeStyle = '#7c7a6850'; f.lineWidth = 1;
  for (let y = 620; y < 760; y += 24) { f.beginPath(); f.moveTo(0, y); f.lineTo(1000, y - 62); f.stroke(); }
  for (let x = 0; x < 1050; x += 70) { f.beginPath(); f.moveTo(x, 604 - x * .062); f.lineTo(x - 50, 750); f.stroke(); }
  f.fillStyle = '#384a42'; f.fillRect(0, 562, 1000, 8);
  for (let x = 0; x < 1000; x += 106) { f.fillRect(x, 562, 6, 89); f.beginPath(); f.arc(x + 3, 560, 6, 0, Math.PI * 2); f.fill(); }
  f.fillRect(0, 599, 1000, 4);
  const flowers = surface();
  const p = flowers.getContext('2d');
  p.fillStyle = '#626449'; p.fillRect(30, 708, 270, 42);
  for (let i = 0; i < 17; i++) {
    const x = 28 + i * 17 + random() * 8; const y = 620 + random() * 80;
    p.strokeStyle = '#3b6247'; p.lineWidth = 4; p.beginPath(); p.moveTo(x, 735); p.quadraticCurveTo(x + 15, y + 48, x, y); p.stroke();
    p.fillStyle = i % 3 === 0 ? '#e7b348' : i % 3 === 1 ? '#c57354' : '#f1ddbc';
    p.beginPath(); p.moveTo(x, y + 20); p.bezierCurveTo(x - 28, y + 4, x - 15, y - 15, x - 7, y - 5); p.lineTo(x, y - 17); p.lineTo(x + 8, y - 5); p.bezierCurveTo(x + 21, y - 16, x + 25, y + 8, x, y + 20); p.fill();
  }
  function cyclist(c, shift = 0) {
    c.save(); c.translate(620 + shift, 534); c.scale(1.15, 1.15);
    c.fillStyle = '#243a3930'; c.beginPath(); c.ellipse(0, 43, 87, 8, 0, 0, Math.PI * 2); c.fill();
    c.strokeStyle = '#293d39'; c.lineWidth = 4;
    for (const x of [-47, 47]) {
      c.beginPath(); c.arc(x, 3, 33, 0, Math.PI * 2); c.stroke();
      c.lineWidth = 1; for (let a = 0; a < Math.PI * 2; a += Math.PI / 6) { c.beginPath(); c.moveTo(x, 3); c.lineTo(x + Math.cos(a) * 32, 3 + Math.sin(a) * 32); c.stroke(); } c.lineWidth = 4;
    }
    c.strokeStyle = '#bb6744'; c.lineWidth = 5; c.beginPath(); c.moveTo(-47, 3); c.lineTo(-18, -40); c.lineTo(6, 3); c.lineTo(-47, 3); c.lineTo(28, -36); c.lineTo(47, 3); c.moveTo(-18, -40); c.lineTo(28, -36); c.stroke();
    c.strokeStyle = '#253d38'; c.lineWidth = 5; c.beginPath(); c.moveTo(28, -36); c.lineTo(23, -55); c.lineTo(40, -58); c.moveTo(-18, -40); c.lineTo(-23, -53); c.lineTo(-36, -53); c.stroke();
    c.strokeStyle = '#293b3b'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(-18, -62); c.lineTo(0, -29); c.lineTo(-12, 0); c.moveTo(-18, -62); c.lineTo(-40, -25); c.lineTo(-26, 10); c.stroke();
    c.strokeStyle = '#dba83e'; c.lineWidth = 24; c.beginPath(); c.moveTo(-18, -68); c.lineTo(-13, -105); c.stroke();
    c.strokeStyle = '#c38b68'; c.lineWidth = 8; c.beginPath(); c.moveTo(-6, -94); c.lineTo(12, -70); c.lineTo(34, -57); c.stroke();
    c.fillStyle = '#c68e69'; c.beginPath(); c.arc(-9, -128, 15, 0, Math.PI * 2); c.fill();
    c.fillStyle = '#293d39'; c.beginPath(); c.arc(-12, -133, 16, Math.PI, Math.PI * 2); c.fill();
    c.restore();
  }
  function drawLayer(layer, blur = 0) {
    ctx.save(); ctx.filter = blur > .1 ? `blur(${blur}px)` : 'none'; ctx.drawImage(layer, 0, 0); ctx.restore();
  }
  function exposureStops(s) {
    return Math.log2((250 / shutters[s.shutter]) * Math.pow(2.8 / apertures[s.aperture], 2) * isos[s.iso] / 100);
  }
  function render() {
    const s = comparing ? defaults() : states[active];
    ctx.save(); ctx.clearRect(0, 0, 1000, 750);
    if (active === 'focal-length') {
      const zoom = focalLengths[s.focal] / 13;
      const centerX = Math.min(550, 1000 - 500 / zoom);
      const centerY = Math.max(335, 375 / zoom);
      ctx.translate(500, 375); ctx.scale(zoom, zoom); ctx.translate(-centerX, -centerY);
    }
    // Fill beyond the transformed artwork at the widest view, with the same sky/water.
    ctx.fillStyle = '#9dbbc0'; ctx.fillRect(-2000, -2000, 5000, 5000);
    drawLayer(background);
    let farBlur = .15, nearBlur = 0, middleBlur = 0;
    if (active === 'aperture' || active === 'exposure') farBlur = 1 + (4 - apertures[s.aperture]) / 2.52 * 12;
    if (active === 'focus') {
      farBlur = [13, 6, 0][s.focus]; nearBlur = [0, 7, 14][s.focus]; middleBlur = [5, 0, 5][s.focus];
    }
    drawLayer(buildings, farBlur);
    drawLayer(foreground);
    const motion = active === 'shutter' || active === 'exposure' ? Math.max(0, 250 / shutters[s.shutter] - 1) * 6 : 0;
    ctx.save(); ctx.filter = middleBlur ? `blur(${middleBlur}px)` : 'none';
    if (motion > 1) {
      const samples = 23; ctx.globalAlpha = 1 / samples;
      for (let i = 0; i < samples; i++) cyclist(ctx, (i / (samples - 1) - .5) * motion);
    } else cyclist(ctx);
    ctx.restore(); drawLayer(flowers, nearBlur); ctx.restore();
    const pixels = ctx.getImageData(0, 0, 1000, 750);
    const data = pixels.data;
    const stops = active === 'exposure' ? exposureStops(s) : 0;
    const light = 2 ** stops;
    const temp = active === 'white-balance' ? (s.kelvin - 5500) / 3500 : 0;
    const noise = active === 'iso' || active === 'exposure' ? s.iso * 3.8 : 0;
    const bins = new Array(64).fill(0);
    let grainSeed = 17;
    for (let i = 0; i < data.length; i += 4) {
      grainSeed = (Math.imul(grainSeed, 1664525) + 1013904223) >>> 0;
      const grain = ((grainSeed / 4294967296) - .5) * noise * 3;
      for (let channel = 0; channel < 3; channel++) {
        let value = data[i + channel];
        if (stops) value = 255 * Math.pow(Math.pow(value / 255, 2.2) * light, 1 / 2.2);
        if (temp) value *= channel === 0 ? 1 + temp * .25 : channel === 2 ? 1 - temp * .25 : 1;
        data[i + channel] = Math.max(0, Math.min(255, value + grain));
      }
      if (i % 16 === 0) bins[Math.min(63, Math.floor((data[i] * .2126 + data[i + 1] * .7152 + data[i + 2] * .0722) / 4))]++;
    }
    ctx.putImageData(pixels, 0, 0);
    const h = $('#histogram').getContext('2d');
    h.clearRect(0, 0, 450, 90); h.fillStyle = '#3d594b';
    const max = Math.max(...bins);
    bins.forEach((value, i) => h.fillRect(i * 450 / 64, 90 - value / max * 85, 450 / 64 - 1, value / max * 85));
    const value = active === 'exposure' ? `${stops >= 0 ? '+' : ''}${stops.toFixed(1)} EV from reference` : definitions[active].format(s[definitions[active].key]);
    $('#scene-setting').textContent = active === 'exposure' ? `${definitions.aperture.format(s.aperture)} · ${definitions.shutter.format(s.shutter)} · ${definitions.iso.format(s.iso)}` : value;
    $('#scene-tag').textContent = comparing ? 'REFERENCE SETTINGS' : titles[active];
    $('#exposure-meter').textContent = value;
    canvas.setAttribute('aria-label', `Illustrated canal scene. ${comparing ? 'Reference. ' : ''}${feedback(s)}`);
    $('#scene-feedback').textContent = comparing ? 'Reference view shown. Choose “Return to my settings” to see your changes again.' : feedback(s);
  }
  function feedback(s) {
    switch (active) {
      case 'shutter': return shutters[s.shutter] >= 500 ? 'A short exposure freezes the cyclist. Less light is collected during each capture.' : shutters[s.shutter] <= 60 ? 'The cyclist leaves a trail. The stationary scene stays sharp because this camera is held still.' : 'Some movement can show. A faster shutter helps with faster subjects.';
      case 'aperture': return apertures[s.aperture] >= 2.8 ? 'The narrower opening brings more of the background into acceptable focus.' : 'The flowers stay sharp while the wider opening gives a shallower depth of field.';
      case 'iso': return s.iso === 0 ? 'ISO 100: a clean reference with enough captured light.' : `ISO ${isos[s.iso]}: in this example a faster shutter keeps brightness steady, but less captured light makes grain more visible.`;
      case 'exposure': { const ev = exposureStops(s); return `${ev > .3 ? 'Brighter than reference; watch the highlights.' : ev < -.3 ? 'Darker than reference; shadow detail becomes harder to see.' : 'Close to the reference brightness.'} Shutter controls motion; aperture controls depth; ISO changes signal gain.`; }
      case 'white-balance': return s.kelvin < 5200 ? 'The setting is below the daylight temperature: the scene looks cooler and bluer.' : s.kelvin > 5800 ? 'The setting is above the daylight temperature: the scene looks warmer and more amber.' : 'The setting approximately matches this daylight scene: whites look neutral.';
      case 'focal-length': return `${focalLengths[s.focal]} mm equivalent: ${s.focal < 2 ? 'a wider view includes the surroundings' : 'a narrower view isolates a smaller part of the scene'}. The camera has not moved, so perspective stays the same.`;
      case 'focus': return ['Nearby flowers are sharp; houses in the distance are blurred.', 'The cyclist’s distance is sharp; foreground flowers and distant houses are softer.', 'Distant houses are sharp; nearby flowers are blurred.'][s.focus];
    }
  }
  function stopComparing() {
    comparing = false; $('#compare').textContent = 'Show reference'; $('#compare').setAttribute('aria-pressed', 'false');
  }
  function buildControls() {
    const container = $('#controls'); container.replaceChildren();
    const controls = active === 'exposure' ? [definitions.shutter, definitions.aperture, definitions.iso] : [definitions[active]];
    controls.forEach(def => {
      const group = document.createElement('div'); group.className = 'control';
      const top = document.createElement('div'); top.className = 'control-title';
      const label = document.createElement('label'); label.htmlFor = `control-${def.key}`; label.textContent = def.label;
      const output = document.createElement('output'); output.htmlFor = label.htmlFor;
      const input = document.createElement('input'); input.type = 'range'; input.id = label.htmlFor; input.min = def.min || 0; input.max = def.max; input.step = def.step || 1; input.value = states[active][def.key];
      const update = () => {
        const value = Number(input.value); states[active][def.key] = value; output.textContent = def.format(value); input.setAttribute('aria-valuetext', def.format(value));
      };
      update();
      input.addEventListener('input', () => { update(); stopComparing(); render(); $('#mission-result').textContent = ''; });
      const ends = document.createElement('div'); ends.className = 'range-labels'; ends.setAttribute('aria-hidden', 'true');
      def.ends.forEach(text => { const span = document.createElement('span'); span.textContent = text; ends.append(span); });
      top.append(label, output); group.append(top, input, ends); container.append(group);
    });
    const row = document.createElement('div'); row.className = 'reset-row';
    const reset = document.createElement('button'); reset.type = 'button'; reset.textContent = 'Reset this lesson ↺';
    reset.addEventListener('click', () => {
      states[active] = defaults(); stopComparing(); buildControls(); render();
      $('#controls .reset-row button').focus(); $('#mission-result').textContent = '';
    });
    row.append(reset); container.append(row);
  }
  function selectLesson(key, updateHash = true) {
    if (!keys.includes(key)) return;
    active = key; stopComparing();
    document.querySelectorAll('.lesson').forEach(article => { article.hidden = article.id !== key; });
    document.querySelectorAll('[data-lesson]').forEach(link => {
      if (link.dataset.lesson === key) link.setAttribute('aria-current', 'step'); else link.removeAttribute('aria-current');
    });
    $('#model-note').textContent = modelNotes[key];
    $('.histogram-panel').hidden = key !== 'exposure';
    const index = keys.indexOf(key);
    $('#lesson-count').textContent = `0${index + 1} / 07`;
    $('#previous').disabled = index === 0; $('#next').disabled = index === keys.length - 1;
    if (updateHash) history.replaceState(null, '', `#${key}`);
    buildControls(); render();
  }
  const missions = {
    motion: { lesson: 'shutter', prompt: 'Use the shutter lesson to freeze a moving cyclist. Aim for 1/1000 s or faster.', pass: s => shutters[s.shutter] >= 1000, success: 'Yes. A short capture freezes this cyclist. In low light, you might need a wider aperture or higher ISO.', hint: 'Try a shorter exposure: 1/1000 s or 1/2000 s. A smaller denominator means a longer capture.' },
    depth: { lesson: 'aperture', prompt: 'Keep the flowers in focus and make the background clearer. Choose the narrowest available opening.', pass: s => apertures[s.aperture] === 4, success: 'Yes. f/4 gives the deepest sharp zone in this example. The smaller opening also collects less light.', hint: 'Choose the largest f-number. A larger f-number means a narrower opening.' },
    color: { lesson: 'white-balance', prompt: 'The scene is lit by 5500 K daylight. Match the white balance setting to make the whites neutral.', pass: s => s.kelvin === 5500, success: 'Yes. Matching the setting to the illumination makes neutral surfaces look neutral. A warmer or cooler look can also be intentional.', hint: 'Set white balance to 5500 K, the light temperature used in this illustration.' },
    balance: { lesson: 'exposure', prompt: 'Start with a dark exposure at 1/500 s, f/2.8, ISO 100. Keep that shutter and aperture, and bring brightness back to the reference.', pass: s => s.shutter === 2 && s.aperture === 2 && s.iso === 1, success: 'Yes. ISO 200 restores the nominal brightness lost by halving exposure time. It does not restore the lost captured light.', hint: 'Keep 1/500 s and f/2.8. Doubling ISO from 100 to 200 restores one stop of rendered brightness.' }
  };
  $('#mission').addEventListener('change', () => { loadedMission = null; $('#mission-prompt').textContent = missions[$('#mission').value].prompt; $('#mission-result').textContent = ''; });
  $('#load-mission').addEventListener('click', () => {
    loadedMission = $('#mission').value;
    const mission = missions[loadedMission]; states[mission.lesson] = defaults();
    if (loadedMission === 'balance') states.exposure.shutter = 2;
    if (loadedMission === 'color') states['white-balance'].kelvin = 3200;
    selectLesson(mission.lesson); $('#learn').scrollIntoView({ block: 'start' });
    $('#controls input').focus({ preventScroll: true }); $('#mission-result').textContent = '';
  });
  $('#check-mission').addEventListener('click', () => {
    const key = $('#mission').value; const mission = missions[key];
    $('#mission-result').textContent = loadedMission !== key ? 'Choose “Try in the playground” to start this assignment first.' : mission.pass(states[mission.lesson]) ? mission.success : mission.hint;
  });
  document.querySelectorAll('[data-lesson]').forEach(link => link.addEventListener('click', event => { event.preventDefault(); selectLesson(link.dataset.lesson); }));
  $('#previous').addEventListener('click', () => { selectLesson(keys[keys.indexOf(active) - 1]); $('.lesson-nav [aria-current]').focus(); });
  $('#next').addEventListener('click', () => { selectLesson(keys[keys.indexOf(active) + 1]); $('.lesson-nav [aria-current]').focus(); });
  $('#compare').addEventListener('click', () => {
    comparing = !comparing; $('#compare').setAttribute('aria-pressed', String(comparing));
    $('#compare').textContent = comparing ? 'Return to my settings' : 'Show reference'; render();
  });
  window.addEventListener('hashchange', () => { const key = location.hash.slice(1); if (keys.includes(key)) selectLesson(key, false); });
  $('.simulator').hidden = false; $('.lesson-pagination').hidden = false; $('.mission-actions').hidden = false;
  selectLesson(keys.includes(location.hash.slice(1)) ? location.hash.slice(1) : 'shutter', false);
})();
