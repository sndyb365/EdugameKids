let trueFalseTool = 'check';
/* ═══════════════════════════════════════
   EduGameKids – app.js  v3.0
   ═══════════════════════════════════════ */
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

const state = {
  identity: null,
  aspect: null,
  current: 1,
  tool: 'select',
  drawing: false,
  last: null,
  sound: true,
};


/* ── Load hotspot edits from universal editor ── */
function applyEditorOverrides(){
  try{
    const saved=JSON.parse(localStorage.getItem('egk_editor_data')||'null');
    if(!saved) return;
    Object.keys(saved).forEach(k=>{
      if(ASPEK_DATA[k] && saved[k].overlays){ ASPEK_DATA[k].overlays=saved[k].overlays; }
    });
  }catch(e){}
}

const ASPECT_META = {
  afektif:     { emoji: '💖', color: '#ff5fa8', label: 'Afektif' },
  psikomotorik:{ emoji: '✋', color: '#00cc88', label: 'Psikomotorik' },
  kognitif:    { emoji: '🧠', color: '#4a9fff', label: 'Kognitif' },
};

/* ── Helpers ── */
function uid() { return 'id_' + Date.now() + '_' + Math.random().toString(16).slice(2); }
function esc(s = '') { return String(s).replace(/[&<>"]/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m])); }

function toast(msg, type = '') {
  const t = $('#toast');
  t.textContent = msg;
  t.style.background = type === 'win'
    ? 'linear-gradient(135deg,#00cc88,#00d4f0)'
    : type === 'warn'
    ? 'linear-gradient(135deg,#ff8c42,#ff5fa8)'
    : 'linear-gradient(135deg,#9b59b6,#4a9fff)';
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2000);
}

function beep(type = 'click') {
  if (!state.sound) return;
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const o = ac.createOscillator();
    const g = ac.createGain();
    if (type === 'win') {
      // happy jingle
      [523, 659, 784].forEach((f, i) => {
        const oi = ac.createOscillator();
        const gi = ac.createGain();
        oi.type = 'triangle';
        oi.frequency.value = f;
        gi.gain.setValueAtTime(.04, ac.currentTime + i * .1);
        gi.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + i * .1 + .18);
        oi.connect(gi); gi.connect(ac.destination);
        oi.start(ac.currentTime + i * .1);
        oi.stop(ac.currentTime + i * .1 + .2);
      });
      return;
    }
    o.type = type === 'bad' ? 'sawtooth' : 'sine';
    o.frequency.value = type === 'bad' ? 160 : 480;
    g.gain.setValueAtTime(.032, ac.currentTime);
    g.gain.exponentialRampToValueAtTime(.0001, ac.currentTime + .14);
    o.connect(g); g.connect(ac.destination);
    o.start(); o.stop(ac.currentTime + .15);
  } catch (e) {}
}

function confetti() {
  const items = ['⭐','✨','🎈','💫','🎉','🌟','🟡','🟣','🔵','🟢','🎊','🏆'];
  for (let i = 0; i < 50; i++) {
    const s = document.createElement('span');
    s.textContent = items[i % items.length];
    s.style.cssText = `
      position:fixed;left:${Math.random()*100}vw;top:-40px;
      z-index:9999;font-style:normal;
      font-size:${20 + Math.random() * 22}px;
      transition:transform ${1.2 + Math.random() * .8}s ease,opacity ${1.4 + Math.random() * .6}s;
      pointer-events:none;
    `;
    document.body.appendChild(s);
    requestAnimationFrame(() => {
      s.style.transform = `translateY(${75 + Math.random() * 90}vh) rotate(${Math.random() * 400 - 200}deg)`;
      s.style.opacity = '0';
    });
    setTimeout(() => s.remove(), 2100);
  }
}

function show(id) {
  $$('.screen').forEach(s => s.classList.remove('active'));
  $('#' + id).classList.add('active');
  // Reset scroll ke atas setiap ganti screen
  window.scrollTo(0, 0);
  document.documentElement.scrollTop = 0;
  document.body.scrollTop = 0;
  // Scope runtime-only toolbars. Jangan biarkan toolbar true/false kebawa ke lobby/dashboard/menu.
  document.body.classList.toggle('egk-playing', id === 'play');
  if (id !== 'play') {
    document.body.classList.remove('has-truefalse-slide');
    const tf = document.getElementById('trueFalseToolbar');
    if (tf) tf.remove();
  }
}

/* ── Identity ── */
function saveIdentity() { /* data diri tidak disimpan di cache - selalu isi ulang */ }
function loadIdentity() {
  // Selalu tampilkan form data diri, tidak pernah skip dari cache
  state.identity = null;
}

function updateLobbyText() {
  const i = state.identity; if (!i) return;
  $('#helloText').textContent = `Halo, ${i.name}! 👋`;
  $('#studentText').textContent = `Kelas ${i.kelas} • Absen ${i.number}`;
  updateAllProgress();
}

function enterLobby() {
  const name   = $('#inpName').value.trim();
  const number = $('#inpNo').value.trim();
  const kelas  = $('#inpClass').value.trim();
  if (!name || !number || !kelas) {
    toast('Isi nama, absen, dan kelas dulu ya! 😊', 'warn');
    beep('bad');
    // shake the button
    const btn = $('#enterBtn');
    btn.style.animation = 'none';
    requestAnimationFrame(() => { btn.style.animation = 'shake .4s ease'; });
    return;
  }
  state.identity = { name, number, kelas };
  saveIdentity();
  updateLobbyText();
  confetti();
  beep('win');
  show('lobby');
}

/* ── Progress ── */
function progressKey(aspect) {
  return `egk_progress_${aspect}_${state.identity?.number}_${state.identity?.name}_${state.identity?.kelas}`;
}
function answerKey(id) {
  return `egk_ans_${state.aspect}_${state.current}_${id}_${state.identity.number}_${state.identity.name}`;
}
function drawKey() {
  return `egk_draw_${state.aspect}_${state.current}_${state.identity.number}_${state.identity.name}`;
}
function resultKey() { return 'egk_results'; }
function loadResults() { try { return JSON.parse(localStorage.getItem(resultKey()) || '[]'); } catch { return []; } }
function saveResult(r) { const arr = loadResults(); arr.push(r); localStorage.setItem(resultKey(), JSON.stringify(arr)); }

function getProgressPct(aspect) {
  if (!state.identity) return 0;
  const current = Number(localStorage.getItem(progressKey(aspect)) || 1);
  const total = ASPEK_DATA[aspect].total;
  return Math.round(((current - 1) / total) * 100);
}

function updateAllProgress() {
  $$('.mission-card').forEach(card => {
    const aspect = card.dataset.aspect;
    const pct = getProgressPct(aspect);
    const bar = $('.prog-bar', card);
    if (bar) bar.style.width = Math.max(5, pct) + '%';
  });
}

/* ── Gameplay ── */
function imgPath(aspect, page) {
  return `${ASPEK_DATA[aspect].folder}/slide_${String(page).padStart(2, '0')}.png`;
}

function startAspect(aspect) {
  state.aspect = aspect;
  state.current = Number(localStorage.getItem(progressKey(aspect)) || 1);
  state.tool = 'select';
  const meta = ASPECT_META[aspect];
  $('#aspectTitle').textContent = `${meta.emoji} ${ASPEK_DATA[aspect].title}`;
  $('#studentBadge').textContent = `${state.identity.name} • Absen ${state.identity.number} • ${state.identity.kelas}`;
  setTool('select', true);
  show('play');
  renderStage();
  renderPageNavigation(state.total || 26);
  beep('win');
}

function go(n) {
  const total = ASPEK_DATA[state.aspect].total;
  saveDrawing();
  state.current = Math.max(1, Math.min(total, state.current + n));
  localStorage.setItem(progressKey(state.aspect), state.current);
  renderStage();
  beep();
}

function currentSlideOverlays() {
  if (!state.aspect) return [];
  return (ASPEK_DATA[state.aspect].overlays || {})[state.current] || [];
}

function isBothMark(o) {
  return o && o.type === 'mark' && String(o.args?.[3] || '').toLowerCase() === 'both';
}

function hasTrueFalseChoiceToolbar() {
  const data = currentSlideOverlays();
  return data.some(o => o.type === 'truefalse' || isBothMark(o));
}

function slideOverlayTypes() {
  const data = currentSlideOverlays();
  const types = new Set(data.map(o => o.type).filter(t => t !== 'hint'));
  // Browser fresh / deploy version masih banyak memakai mark(..., 'both').
  // Anggap itu sebagai Benar/Salah supaya Chrome, Edge, dan deploy konsisten.
  if (data.some(isBothMark)) types.add('truefalse');
  return types;
}

function setTool(t, silent = false) {
  state.tool = t;
  $$('.tool').forEach(b => b.classList.remove('active'));
  const map = { select: '#selectTool', draw: '#drawTool', eraser: '#eraserTool' };
  if (map[t] && $(map[t])) $(map[t]).classList.add('active');
  const c = $('.draw-canvas');
  const layer = $('.overlay-layer');
  if (c) c.style.pointerEvents = t === 'select' ? 'none' : 'auto';
  if (layer) layer.style.pointerEvents = t === 'select' ? 'auto' : 'none';
  if (!silent) {
    const labels = {
      select: '👆 Siap memilih jawaban!',
      draw: '✏️ Silakan coret / tarik garis!',
      eraser: '🧽 Hapus coretan yang keliru!'
    };
    toast(labels[t] || '');
  }
}

function updateToolsForSlide() {
  const types = slideOverlayTypes();
  const drawTypes = new Set(['connect','maze','mazePath','finish','pathPoint','pathpoint','pathPaint','trace','coloring','colorzone']);
  const hasDrawFeature = [...types].some(t => drawTypes.has(t));
  const hasConnectOnly = types.has('connect') && !([...types].some(t => ['maze','mazePath','finish','pathPoint','pathpoint','pathPaint','trace','coloring','colorzone'].includes(t)));
  // Cover/halaman pertama tiap aspek tidak punya interaksi, jadi jangan tampilkan
  // tool Pensil/Warna/Hapus. Reset dan Suara tetap boleh muncul.
// Hanya cover tiap aspek yg hide tools
const isCoverPage =
  (state.aspect === 'afektif' && Number(state.current) === 1) ||
  (state.aspect === 'kognitif' && Number(state.current) === 1) ||
  (state.aspect === 'psikomotorik' && Number(state.current) === 1);
  const needsPick = !isCoverPage && (types.has('mark') || types.has('truefalse') || types.has('circle') || types.has('text') || types.has('dragdrop') || types.has('connect'));

  // FIX: fitur tambahan dari editor seperti Coloring, Color Zones, Trace, Maze Path,
  // Path Paint, dan Finish harus tetap mengaktifkan pensil/eraser.
  // Tapi slide kosong/cover jangan otomatis dianggap butuh pensil.
  const needsDraw = !isCoverPage && (hasConnectOnly ? false : hasDrawFeature);

  const label = (() => {
    if (types.has('truefalse')) return ['✅✖', 'Benar/Salah'];
    if (types.has('mark')) return ['☑️', 'Ceklis'];
    if (types.has('circle')) return ['⭕', 'Lingkari'];
    if (types.has('text')) return ['⌨️', 'Teks'];
    if (types.has('dragdrop')) return ['🧩', 'Seret'];
    if (types.has('connect')) return ['🔗', 'Sambung'];
    if (types.has('coloring') || types.has('colorzone')) return ['🎨', 'Warnai'];
    if (types.has('trace')) return ['✍️', 'Tebalkan'];
    if (types.has('maze') || types.has('mazePath') || types.has('pathPoint') || types.has('pathpoint') || types.has('pathPaint') || types.has('finish')) return ['🧭', 'Tarik Garis'];
    return ['👆', 'Pilih'];
  })();

  $('#selectTool .tool-icon').textContent = label[0];
  $('#selectTool .tool-label').textContent = label[1];
  
  const isMazeTrace = types.has('maze') || types.has('mazePath') || types.has('pathPoint') || types.has('pathpoint') || types.has('pathPaint') || types.has('trace') || types.has('finish');
  $('#drawTool .tool-label').textContent = isMazeTrace ? 'Tarik Garis' : (types.has('connect') ? 'Garis' : 'Pensil');
  $('#drawTool .tool-icon').textContent = isMazeTrace ? '〰️' : (types.has('connect') ? '〰️' : '✏️');

if (isCoverPage) {
  $('#selectTool').classList.add('hidden');
  $('#drawTool').classList.add('hidden');
  $('#eraserTool').classList.add('hidden');
} else {
  $('#selectTool').classList.toggle('hidden', !needsPick && needsDraw);
  $('#drawTool').classList.toggle('hidden', !needsDraw);
  $('#eraserTool').classList.toggle('hidden', !needsDraw);
}
  $('#resetSlideBtn').classList.remove('hidden');
  $('#soundBtn').classList.remove('hidden');

  const visibleTool = { select: needsPick, draw: needsDraw, eraser: needsDraw }[state.tool];
  if (!visibleTool) state.tool = needsDraw ? 'draw' : 'select';
}

function renderStage() {
  const a = ASPEK_DATA[state.aspect];
  $('#pageInfo').textContent = `Slide ${state.current} / ${a.total}`;
  $('#prevBtn').disabled = state.current <= 1;
  $('#nextBtn').disabled = state.current >= a.total;

  const shell = $('#stageShell');
  shell.innerHTML = '';

  const stage = document.createElement('div');
  stage.className = 'stage';
  stage.innerHTML = `
    <img class="slide-img" src="${imgPath(state.aspect, state.current)}" draggable="false" alt="Slide ${state.current}">
    <canvas class="draw-canvas"></canvas>
    <div class="overlay-layer"></div>
  `;
  shell.appendChild(stage);

  const img = $('.slide-img', stage);
  img.onerror = () => {
    img.style.display = 'none';
    const fb = document.createElement('div');
    fb.style.cssText = 'display:grid;place-items:center;width:100%;height:340px;border-radius:24px;background:linear-gradient(135deg,#f0f0ff,#ffe8f8);font-size:24px;font-weight:900;color:#9b59b6;text-align:center;gap:12px;';
    fb.innerHTML = `<div style="font-size:64px">🖼️</div><div>Gambar slide ${state.current} belum ada</div>`;
    stage.appendChild(fb);
  };
  img.onload = () => { fitCanvas(); restoreDrawing(); };
  if (img.complete) setTimeout(() => { fitCanvas(); restoreDrawing(); }, 30);

  renderOverlays($('.overlay-layer', stage));
  setupDrawing($('.draw-canvas', stage));
  updateToolsForSlide();
  const drawTypesNow = slideOverlayTypes();
  stage.classList.toggle('draw-feature-slide', [...drawTypesNow].some(t => ['connect','mazePath','finish','pathPaint','trace','coloring','colorzone'].includes(t)));
  setTool(state.tool, true);
  ensureTrueFalseToolbar();
}



function ensureTrueFalseToolbar(){
  const inPlay = document.getElementById('play')?.classList.contains('active');
  let bar = document.getElementById('trueFalseToolbar');
  if(!inPlay){
    document.body.classList.remove('has-truefalse-slide');
    if(bar) bar.remove();
    return;
  }
  const types = slideOverlayTypes();
  const hasChoiceToolbar = hasTrueFalseChoiceToolbar();
  document.body.classList.toggle('has-truefalse-slide', hasChoiceToolbar);
  if(!hasChoiceToolbar){ if(bar) bar.remove(); return; }
  if(!bar){
    bar = document.createElement('div');
    bar.id = 'trueFalseToolbar';
    bar.className = 'truefalse-toolbar';
    bar.innerHTML = `<button type="button" data-tf="check"><span>✅</span><b>Centang</b></button><button type="button" data-tf="cross"><span>❌</span><b>Silang</b></button><button type="button" data-tf="erase"><span>🧽</span><b>Hapus</b></button>`;
    (document.querySelector('#play .stage-area') || document.body).appendChild(bar);
    bar.addEventListener('click', e=>{
      const btn=e.target.closest('[data-tf]'); if(!btn) return;
      trueFalseTool=btn.dataset.tf;
      bar.querySelectorAll('[data-tf]').forEach(b=>b.classList.toggle('active',b.dataset.tf===trueFalseTool));
      toast(trueFalseTool==='check'?'Pilih area untuk diberi centang ✅':trueFalseTool==='cross'?'Pilih area untuk diberi silang ❌':'Klik area untuk menghapus tanda 🧽');
    });
  }
  // Pastikan toolbar Benar/Salah selalu ikut layout stage-area, bukan fixed di bawah layar.
  const stageArea = document.querySelector('#play .stage-area');
  if(stageArea && bar.parentElement !== stageArea) stageArea.appendChild(bar);
  bar.querySelectorAll('[data-tf]').forEach(b=>b.classList.toggle('active',b.dataset.tf===trueFalseTool));
}


function base() {
  const a = ASPEK_DATA[state.aspect];
  return { w: a.baseW || 1190, h: a.baseH || 1685 };
}
function pct(v, max) { return (v / max * 100) + '%'; }

function renderOverlays(layer) {
  const data = (ASPEK_DATA[state.aspect].overlays || {})[state.current] || [];
  const b = base();

  data.forEach(o => {
    if (o.type === 'hint') {
      const h = document.createElement('div');
      h.className = 'hint';
      h.textContent = o.args?.[0] || 'Kerjakan dengan teliti ya!';
      layer.appendChild(h);
      setTimeout(() => h.remove(), 3800);
      return;
    }

    if (o.type === 'truefalse') {
      const [cx, cy, s] = o.args;
      const el = document.createElement('button');
      el.className = 'mark trueFalseMark'; el.dataset.id = o.id;
      Object.assign(el.style, {
        left: pct(cx - s / 2, b.w), top: pct(cy - s / 2, b.h),
        width: pct(s, b.w), height: pct(s, b.h),
      });
      el.dataset.v = localStorage.getItem(answerKey(o.id)) || '';
      el.onclick = () => {
        const next = trueFalseTool === 'erase' ? '' : trueFalseTool;
        el.dataset.v = next;
        if (next) localStorage.setItem(answerKey(o.id), next); else localStorage.removeItem(answerKey(o.id));
        beep();
      };
      layer.appendChild(el);
      return;
    }

    if (o.type === 'mark') {
      const [cx, cy, s, mode] = o.args;
      const el = document.createElement('button');
      el.className = 'mark'; el.dataset.id = o.id;
      Object.assign(el.style, {
        left: pct(cx - s / 2, b.w), top: pct(cy - s / 2, b.h),
        width: pct(s, b.w), height: pct(s, b.h),
      });
      el.dataset.v = localStorage.getItem(answerKey(o.id)) || '';
      el.onclick = () => {
        let v = el.dataset.v || '';
        let next = '';
        if (mode === 'check') {
          next = v ? '' : 'check';
        } else if (String(mode || '').toLowerCase() === 'both' && hasTrueFalseChoiceToolbar()) {
          // Mode both memakai toolbar Centang / Silang / Hapus.
          next = trueFalseTool === 'erase' ? '' : trueFalseTool;
        } else {
          next = v === '' ? 'check' : v === 'check' ? 'cross' : '';
        }
        el.dataset.v = next;
        if (next) localStorage.setItem(answerKey(o.id), next); else localStorage.removeItem(answerKey(o.id));
        beep();
      };
      layer.appendChild(el);
      return;
    }

    if (o.type === 'circle') {
      const [cx, cy, s] = o.args;
      const el = document.createElement('button');
      el.className = 'circleMark'; el.dataset.id = o.id;
      Object.assign(el.style, {
        left: pct(cx - s / 2, b.w), top: pct(cy - s / 2, b.h),
        width: pct(s, b.w), height: pct(s, b.h),
      });
      el.dataset.v = localStorage.getItem(answerKey(o.id)) || '';
      el.onclick = () => {
        el.dataset.v = el.dataset.v === 'on' ? '' : 'on';
        localStorage.setItem(answerKey(o.id), el.dataset.v);
        beep();
      };
      layer.appendChild(el);
      return;
    }

    if (o.type === 'text') {
      const [x, y, w, h] = o.args;
      const box = document.createElement('div');
      box.className = 'answerBox';
      Object.assign(box.style, {
        left: pct(x, b.w), top: pct(y, b.h),
        width: pct(w, b.w), height: pct(h, b.h),
      });
      const input = document.createElement(h > 100 ? 'textarea' : 'input');
      input.placeholder = '';
      input.value = localStorage.getItem(answerKey(o.id)) || '';
      input.oninput = () => localStorage.setItem(answerKey(o.id), input.value);
      box.appendChild(input);
      layer.appendChild(box);
      return;
    }


    if (o.type === 'connect') {
      createConnectOverlay(layer, o, b);
      return;
    }

    if (o.type === 'dragdrop') {
      createDragDropOverlay(layer, o, b);
      return;
    }

    // Tambahan aman dari Editor Universal: tidak mengubah logika drag-drop/pensil.
    if (o.type === 'imageLocal') {
      const [x=0,y=0,w=120,h=120,src=''] = o.args || [];
      if (!src) return;
      const img = document.createElement('img');
      img.className = 'localImageOverlay';
      img.src = src;
      img.draggable = false;
      Object.assign(img.style, { position:'absolute', left:pct(x,b.w), top:pct(y,b.h), width:pct(w,b.w), height:pct(h,b.h), objectFit:'contain', pointerEvents:'none', userSelect:'none' });
      layer.appendChild(img);
      return;
    }

    if (['mazePath','finish','pathPaint','trace','coloring','colorzone'].includes(o.type)) {
      const [x=0,y=0,w=120,h=80,color='#ffcc33'] = o.args || [];
      const el = document.createElement('div');
      el.className = 'addonOverlay ' + o.type;
      const labels = { mazePath:'', finish:'🏁', pathPaint:'', trace:'', coloring:'', colorzone:'' };
      el.textContent = labels[o.type] || '';
      Object.assign(el.style, { position:'absolute', left:pct(x,b.w), top:pct(y,b.h), width:pct(w,b.w), height:pct(h,b.h), pointerEvents:'none', display:'grid', placeItems:'center', fontSize:'28px', fontWeight:'900' });
      if (o.type === 'finish') { el.style.border='3px dashed #00cc88'; el.style.borderRadius='18px'; el.style.background='rgba(0,204,136,.08)'; }
      if (o.type === 'colorzone') { el.style.border='3px dashed '+color; el.style.borderRadius='18px'; el.style.background=color+'22'; }
      layer.appendChild(el);
      return;
    }
  });
}

function normalizeConnectArgs(o) {
  const a = o.args || [];
  if (Array.isArray(a) && Array.isArray(a[0]) && Array.isArray(a[1]) && Array.isArray(a[0][0])) {
    return { left: a[0] || [], right: a[1] || [] };
  }
  if (a && typeof a === 'object' && Array.isArray(a.left) && Array.isArray(a.right)) {
    return { left: a.left, right: a.right };
  }
  if (a && typeof a === 'object' && Array.isArray(a.points)) {
    const pts = a.points || [];
    return { left: pts.filter((_,i)=>i%2===0), right: pts.filter((_,i)=>i%2===1) };
  }
  return { left: [], right: [] };
}
function connectStateKey(o){ return answerKey(o.id) + '_connect_lines'; }
function readConnectState(o){ try { return JSON.parse(localStorage.getItem(connectStateKey(o)) || '[]'); } catch { return []; } }
function writeConnectState(o, arr){ localStorage.setItem(connectStateKey(o), JSON.stringify(arr || [])); }
function showResult(ok){
  toast(ok ? '🎉 Anda Benar!' : '❌ Jawaban Salah', ok ? 'success' : 'warn');
  beep(ok ? 'win' : 'bad');
}
function createSvgLine(svg, p1, p2, cls='connectUserLine'){
  const ln = document.createElementNS('http://www.w3.org/2000/svg','line');
  ln.setAttribute('x1', p1.x); ln.setAttribute('y1', p1.y);
  ln.setAttribute('x2', p2.x); ln.setAttribute('y2', p2.y);
  ln.setAttribute('y2', p2.y);
  ln.setAttribute('class', cls);
  svg.appendChild(ln);
  return ln;
}
function createConnectOverlay(layer, o, b) {
  const { left, right } = normalizeConnectArgs(o);
  if (!left.length || !right.length) return;

  const wrap = document.createElement('div');
  wrap.className = 'connectPlay';
  wrap.dataset.id = o.id;
  // Penting: wrapper full-slide tidak boleh menutup connect lain / drag-drop.
  // Yang bisa diklik hanya dot connect-nya saja.
  Object.assign(wrap.style, { position:'absolute', inset:'0', pointerEvents:'none' });

  const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
  svg.setAttribute('viewBox', `0 0 ${b.w} ${b.h}`);
  svg.setAttribute('preserveAspectRatio','none');
  svg.classList.add('connectSvg');
  wrap.appendChild(svg);

  const saved = readConnectState(o);
  saved.forEach(rec => {
    const l = left[rec.left], r = right[rec.right];
    if (l && r) createSvgLine(svg, {x:l[0],y:l[1]}, {x:r[0],y:r[1]}, rec.ok ? 'connectUserLine ok' : 'connectUserLine');
  });

  const allDots = [];
  function addDot(pt, side, idx) {
    const dot = document.createElement('button');
    dot.type = 'button';
    dot.className = 'connectHitDot ' + side;
    dot.dataset.side = side;
    dot.dataset.idx = String(idx);
    dot.setAttribute('aria-label', side + ' ' + (idx+1));
    Object.assign(dot.style, {
      position:'absolute',
      left:pct(pt[0] - 22, b.w), top:pct(pt[1] - 22, b.h),
      width:pct(44, b.w), height:pct(44, b.h),
      pointerEvents:'auto',
      zIndex:'80'
    });
    wrap.appendChild(dot);
    allDots.push(dot);
  }
  left.forEach((p,i)=>addDot(p,'left',i));
  right.forEach((p,i)=>addDot(p,'right',i));

  let active = null;
  const toBasePoint = (e) => {
    const r = wrap.getBoundingClientRect();
    return { x: (e.clientX - r.left) / Math.max(1,r.width) * b.w, y: (e.clientY - r.top) / Math.max(1,r.height) * b.h };
  };
  const dotCenterBase = (dot) => {
    const side = dot.dataset.side, idx = Number(dot.dataset.idx);
    const pt = side === 'left' ? left[idx] : right[idx];
    return { x: pt[0], y: pt[1] };
  };
  const hitDot = (e, oppositeSide) => {
    const x=e.clientX, y=e.clientY;
    let best = null, bestD = Infinity;
    allDots.forEach(d=>{
      if(d.dataset.side !== oppositeSide) return;
      const r=d.getBoundingClientRect();
      const cx=(r.left+r.right)/2, cy=(r.top+r.bottom)/2;
      const dist=Math.hypot(x-cx,y-cy);
      if(dist < bestD && dist < Math.max(34, r.width*0.9)){ best=d; bestD=dist; }
    });
    return best;
  };

  allDots.forEach(dot => {
    dot.addEventListener('pointerdown', e => {
      // Connect harus tetap bisa ditarik walau tool aktif bukan 'select' (mis. setelah reset / mode lain).
      e.preventDefault(); e.stopPropagation();
      try { dot.setPointerCapture(e.pointerId); } catch {}
      const from = dotCenterBase(dot);
      const temp = createSvgLine(svg, from, toBasePoint(e), 'connectUserLine temp');
      active = { dot, temp, fromSide: dot.dataset.side, fromIdx: Number(dot.dataset.idx), from };
    });
    dot.addEventListener('pointermove', e => {
      if (!active || active.dot !== dot) return;
      const p = toBasePoint(e);
      active.temp.setAttribute('x2', p.x); active.temp.setAttribute('y2', p.y);
    });
    dot.addEventListener('pointerup', e => {
      if (!active || active.dot !== dot) return;
      e.preventDefault(); e.stopPropagation();
      try { dot.releasePointerCapture(e.pointerId); } catch {}
      const opposite = active.fromSide === 'left' ? 'right' : 'left';
      const target = hitDot(e, opposite);
      active.temp.remove();
      if (!target) { active = null; toast('Masih salah, coba lagi', 'warn'); beep('bad'); return; }
      const targetIdx = Number(target.dataset.idx);
      const leftIdx = active.fromSide === 'left' ? active.fromIdx : targetIdx;
      const rightIdx = active.fromSide === 'left' ? targetIdx : active.fromIdx;
      const ok = leftIdx === rightIdx; // cek benar/salah hanya untuk penilaian
      let arr = readConnectState(o).filter(r => r.left !== leftIdx);
      arr.push({ left:leftIdx, right:rightIdx, ok:ok });
      writeConnectState(o, arr);
      createSvgLine(svg, {x:left[leftIdx][0],y:left[leftIdx][1]}, {x:right[rightIdx][0],y:right[rightIdx][1]}, 'connectUserLine');
      active = null;
    });
    dot.addEventListener('pointercancel', () => { if(active?.temp) active.temp.remove(); active = null; });
  });

  // Fallback global: supaya garis tetap nyambung walau pointer keluar dari bulatan.
  if (!window.__egkConnectGlobalFix) {
    window.__egkConnectGlobalFix = true;
    window.addEventListener('pointermove', (e) => {
      const wraps = document.querySelectorAll('.connectPlay');
      wraps.forEach(w => {
        const temp = w.querySelector('.connectUserLine.temp');
        if (!temp) return;
        const svgEl = w.querySelector('svg');
        const view = svgEl?.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0,0,1000,1000];
        const rr = w.getBoundingClientRect();
        const x = (e.clientX - rr.left) / Math.max(1,rr.width) * view[2];
        const y = (e.clientY - rr.top) / Math.max(1,rr.height) * view[3];
        temp.setAttribute('x2', x); temp.setAttribute('y2', y);
      });
    }, {passive:true});
  }

  layer.appendChild(wrap);
}

function itemTargetIndex(item, drops) {
  if (item.target !== undefined && item.target !== null && item.target !== '') {
    if (typeof item.target === 'number') return item.target;
    const byId = drops.findIndex(d => String(d.id) === String(item.target));
    if (byId >= 0) return byId;
    const asNum = Number(item.target);
    if (!Number.isNaN(asNum)) return asNum;
  }
  if (item.answer !== undefined && item.answer !== null && item.answer !== '') {
    const byId = drops.findIndex(d => String(d.id) === String(item.answer));
    if (byId >= 0) return byId;
  }
  return null;
}

function getDragState(o) {
  try { return JSON.parse(localStorage.getItem(answerKey(o.id)) || '{}'); }
  catch { return {}; }
}
function setDragState(o, map) { localStorage.setItem(answerKey(o.id), JSON.stringify(map)); }


function cropStyleForPiece(el, item, b, placedBox = null) {
  const slide = $('.slide-img');
  if (!slide) return;

  // Reset semua style kotak — dragPiece harus invisible, hanya gambar yang kelihatan
  el.innerHTML = el.querySelector('span') ? el.querySelector('span').outerHTML : '';
  el.style.cssText = (el.style.cssText || '')
    .replace(/background[^;]*;/g, '')
    .replace(/border[^;]*;/g, '')
    .replace(/box-shadow[^;]*;/g, '');
  el.style.background      = 'none';
  el.style.backgroundColor = 'transparent';
  el.style.backgroundImage = 'none';
  el.style.border          = 'none';
  el.style.boxShadow       = 'none';
  el.style.borderRadius    = '0';
  el.style.overflow        = 'visible';
  el.style.padding         = '0';

  // DUAL SOURCE DRAG-DROP:
  // 1) Kalau item punya src/dataUrl/imageSrc => pakai gambar lokal import.
  // 2) Kalau tidak ada src => tetap crop dari gambar slide.
  const localSrc = item.src || item.dataUrl || item.image || item.imageSrc;
  if (localSrc) {
    const img = document.createElement('img');
    img.src = localSrc;
    img.draggable = false;
    img.style.cssText = [
      'position:absolute',
      'inset:0',
      'width:100%',
      'height:100%',
      'object-fit:contain',
      'object-position:center',
      'pointer-events:none',
      'display:block',
      'filter:drop-shadow(0 3px 8px rgba(0,0,0,0.28))'
    ].join(';');
    el.appendChild(img);
    return;
  }

  // Ukuran piece dalam px (dari rendered slide)
  const stageEl  = slide.parentElement;
  const rendered = slide.getBoundingClientRect();
  const rW = rendered.width  || slide.clientWidth;
  const rH = rendered.height || slide.clientHeight;

  // Offset crop dalam px rendered
  const offX = (item.x / b.w) * rW;
  const offY = (item.y / b.h) * rH;

  // <img> full slide, digeser supaya area crop tepat di pojok kiri atas clip-box
  const img = document.createElement('img');
  img.src        = slide.src;       // same src → browser cache, tidak re-download
  img.draggable  = false;
  img.style.cssText = [
    'position:absolute',
    'top:0', 'left:0',
    'width:'  + rW + 'px',
    'height:' + rH + 'px',
    'transform:translate(-' + offX.toFixed(2) + 'px,-' + offY.toFixed(2) + 'px)',
    'mix-blend-mode:multiply',   // putih hilang, objek terlihat
    'pointer-events:none',
    'display:block',
    'flex-shrink:0',
  ].join(';');

  // clip-box: semua yang di luar area piece tersembunyi
  const clip = document.createElement('div');
  clip.style.cssText = [
    'position:absolute',
    'inset:0',
    'overflow:hidden',
    'background:none',
    'border:none',
    'box-shadow:none',
    // shadow ikut bentuk transparan objek (bukan kotak)
    'filter:drop-shadow(0 3px 8px rgba(0,0,0,0.28))',
  ].join(';');

  clip.appendChild(img);
  el.appendChild(clip);
}
function createDragDropOverlay(layer, o, b) {
  const [items = [], drops = []] = o.args || [];
  const saved = getDragState(o);
  const dropEls = [];

  drops.forEach((d, i) => {
    const z = document.createElement('div');
    z.className = 'dropZone';
    z.dataset.drop = String(i);
    Object.assign(z.style, {
      left: pct(d.x,b.w), top: pct(d.y,b.h), width: pct(d.w,b.w), height: pct(d.h,b.h),
      borderRadius: `${Number(d.r ?? d.radius ?? 14)}px`
    });
    z.innerHTML = `<span>🎯</span>`;
    layer.appendChild(z);
    dropEls.push(z);
  });

  // v17: source puzzle biasanya sudah tercetak di gambar slide.
  // Buat cover untuk tiap source, tapi hanya tampil kalau item sudah drop benar.
  // Jadi item bawah hilang, tapi gambar yang pindah ke drop tetap terlihat.
  const sourceCovers = {};
  const refreshOccupiedDrops = () => {
    dropEls.forEach((dz, i) => {
      const used = Object.values(saved).some(v => Number((v && typeof v === 'object') ? v.drop : v) === i);
      dz.classList.toggle('occupied', used);
    });
  };
  const makeSourceCover = (item, idx) => {
    const c = document.createElement('div');
    c.className = 'dragSourceBlank';
    Object.assign(c.style, {
      left: pct(item.x,b.w), top: pct(item.y,b.h), width: pct(item.w,b.w), height: pct(item.h,b.h),
      borderRadius: `${Number(item.r ?? item.radius ?? 4)}px`,
      background: (() => {
        // Sample warna slide di tengah area item → blank cover cocok dengan bg slide
        try {
          const sl = document.querySelector('.slide-img');
          if (!sl || !sl.naturalWidth) return item.blankColor || o.blankColor || 'rgba(255,255,255,.98)';
          const nw = sl.naturalWidth, nh = sl.naturalHeight;
          const bw = ASPEK_DATA[state.aspect]?.baseW || 1190;
          const bh = ASPEK_DATA[state.aspect]?.baseH || 1685;
          const cx = Math.round((item.x + item.w/2) / bw * nw);
          const cy = Math.round((item.y + item.h/2) / bh * nh);
          const tmp = document.createElement('canvas');
          tmp.width = 1; tmp.height = 1;
          const tctx = tmp.getContext('2d');
          tctx.drawImage(sl, cx, cy, 1, 1, 0, 0, 1, 1);
          const px = tctx.getImageData(0,0,1,1).data;
          return `rgb(${px[0]},${px[1]},${px[2]})`;
        } catch(e) { return item.blankColor || o.blankColor || 'rgba(255,255,255,.98)'; }
      })(),
      display: (() => { const rec = saved[String(idx)]; const di = Number((rec && typeof rec === 'object') ? rec.drop : rec); return (rec !== undefined && rec !== null && drops[di]) ? 'block' : 'none'; })()
    });
    layer.appendChild(c);
    sourceCovers[String(idx)] = c;
  };

  items.forEach((it, idx) => {
    const isLocal = !!(it.src || it.dataUrl || it.image || it.imageSrc);
    if (!isLocal) makeSourceCover(it, idx);
  });
  refreshOccupiedDrops();

  // FREE POSITION DROP FIX:
  // 1 dropzone boleh menampung banyak item, tapi item TIDAK di-auto-grid.
  // Ukuran item tetap mengikuti box drag aslinya dan posisi mengikuti lokasi user melepas.
  const normalizeSaved = (v) => {
    if (v && typeof v === 'object') return v;
    if (v !== undefined && v !== null && v !== '') return { drop: Number(v) };
    return null;
  };

  const getPlacedBox = (item, idx) => {
    const rec = normalizeSaved(saved[String(idx)]);
    if (!rec || !drops[Number(rec.drop)]) return null;
    const d = drops[Number(rec.drop)];
    const w = Number(rec.w ?? item.w);
    const h = Number(rec.h ?? item.h);
    return {
      x: Number.isFinite(Number(rec.x)) ? Number(rec.x) : d.x + (d.w - w) / 2,
      y: Number.isFinite(Number(rec.y)) ? Number(rec.y) : d.y + (d.h - h) / 2,
      w, h,
      r: item.r ?? item.radius ?? 14,
      drop: Number(rec.drop)
    };
  };

  const placeItem = (el, item, idx) => {
    const box = getPlacedBox(item, idx);
    if (box) {
      Object.assign(el.style, {
        left: pct(box.x,b.w), top: pct(box.y,b.h), width: pct(box.w,b.w), height: pct(box.h,b.h),
        borderRadius: `${Number(box.r ?? item.r ?? item.radius ?? 14)}px`
      });
      cropStyleForPiece(el, item, b, item);
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.dataset.drop = String(box.drop);
    } else {
      Object.assign(el.style, {
        left: pct(item.x,b.w), top: pct(item.y,b.h), width: pct(item.w,b.w), height: pct(item.h,b.h),
        borderRadius: `${Number(item.r ?? item.radius ?? 14)}px`
      });
      cropStyleForPiece(el, item, b, item);
      el.style.opacity = '1';
      el.style.visibility = 'visible';
      el.dataset.drop = '';
    }
  };

  const itemEls = {};
  const reflowPlacedItems = () => {
    Object.keys(itemEls).forEach(k => {
      const i = Number(k);
      if (items[i]) placeItem(itemEls[k], items[i], i);
    });
    refreshOccupiedDrops();
  };

  items.forEach((it, idx) => {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'dragPiece';
    el.dataset.item = String(idx);
    el.dataset.id = `${o.id}_${idx}`;
    const label = it.t || it.label || '';
    el.innerHTML = label ? `<span>${esc(label)}</span>` : '';
    placeItem(el, it, idx);
    layer.appendChild(el);
    itemEls[String(idx)] = el;

    let active = null;
    el.addEventListener('pointerdown', e => {
      if (state.tool !== 'select') return;
      e.preventDefault();
      el.setPointerCapture(e.pointerId);
      const r = layer.getBoundingClientRect();
      const er = el.getBoundingClientRect();
      active = { ox: e.clientX - er.left, oy: e.clientY - er.top, lw: r.width, lh: r.height, ew: er.width, eh: er.height };
      el.classList.add('dragging');
      el.style.zIndex = 40;
      beep();
    });
    el.addEventListener('pointermove', e => {
      if (!active || !el.hasPointerCapture(e.pointerId)) return;
      const r = layer.getBoundingClientRect();
      const x = Math.max(0, Math.min(r.width-active.ew, e.clientX-r.left-active.ox));
      const y = Math.max(0, Math.min(r.height-active.eh, e.clientY-r.top-active.oy));
      Object.assign(el.style, { left:(x/r.width*100)+'%', top:(y/r.height*100)+'%' });
    });
    el.addEventListener('pointerup', e => {
      if (!active) return;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      const er = el.getBoundingClientRect();
      const cx = er.left + er.width/2, cy = er.top + er.height/2;
      let hit = -1;
      dropEls.forEach((dz, i) => {
        const dr = dz.getBoundingClientRect();
        if (cx >= dr.left && cx <= dr.right && cy >= dr.top && cy <= dr.bottom) hit = i;
      });
      if (hit >= 0) {
        const target = itemTargetIndex(it, drops);
        const ok = target === null || Number(target) === hit;

// ❌ Kalau salah → jangan bisa drop
if (!ok) {

  delete saved[String(idx)];

  if (sourceCovers[String(idx)]) {
    sourceCovers[String(idx)].style.display = 'none';
  }

  reflowPlacedItems();

  beep('bad');

  return;
}

// ✅ Kalau benar → baru masuk dropzone
const lr = layer.getBoundingClientRect();
const er2 = el.getBoundingClientRect();

saved[String(idx)] = {
  drop: hit,
  correct: true,
  x: (er2.left - lr.left) / lr.width * b.w,
  y: (er2.top - lr.top) / lr.height * b.h,
  w: it.w,
  h: it.h
};
        if (sourceCovers[String(idx)]) sourceCovers[String(idx)].style.display = 'block';
        reflowPlacedItems();
        layer.appendChild(el);

        if (ok) {
          el.classList.add('correct');
          beep('win');
        } else {
          beep('bad');
        }
      } else {
        delete saved[String(idx)];
        if (sourceCovers[String(idx)]) sourceCovers[String(idx)].style.display = 'none';
        reflowPlacedItems();
        toast('🧩 Kepingan dikembalikan', 'warn');
      }
      setDragState(o, saved);
      refreshOccupiedDrops();
      active = null;
      el.classList.remove('dragging');
    setTimeout(()=>{ el.classList.remove('correct'); }, 900);
    });
  });
}

function fitCanvas() {
  const c = $('.draw-canvas'), img = $('.slide-img');
  if (!c || !img) return;
  c.width = img.clientWidth;
  c.height = img.clientHeight;
}

function setupDrawing(c) {
  const pos = e => { const r = c.getBoundingClientRect(); return { x: e.clientX - r.left, y: e.clientY - r.top }; };
  c.onpointerdown = e => {
    if (state.tool === 'select') return;
    state.drawing = true; state.last = pos(e);
    c.setPointerCapture(e.pointerId);
  };
  c.onpointermove = e => {
    if (!state.drawing) return;
    const p = pos(e), ctx = c.getContext('2d');
    ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.lineWidth = state.tool === 'eraser' ? 32 : 6;
    ctx.strokeStyle = ASPECT_META[state.aspect]?.color || '#ff5fa8';
    ctx.globalCompositeOperation = state.tool === 'eraser' ? 'destination-out' : 'source-over';
    ctx.beginPath();
    ctx.moveTo(state.last.x, state.last.y);
    ctx.lineTo(p.x, p.y);
    ctx.stroke();
    state.last = p;
  };
  c.onpointerup = e => {
    state.drawing = false;
    saveDrawing();
    try { c.releasePointerCapture(e.pointerId); } catch {}
  };
}

function saveDrawing() {
  const c = $('.draw-canvas');
  if (!c || !state.aspect) return;
  try { localStorage.setItem(drawKey(), c.toDataURL('image/png')); } catch {}
}

function restoreDrawing() {
  const c = $('.draw-canvas'); if (!c) return;
  const data = localStorage.getItem(drawKey()); if (!data) return;
  const img = new Image();
  img.onload = () => c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
  img.src = data;
}

function resetSlide() {
  const data = (ASPEK_DATA[state.aspect].overlays || {})[state.current] || [];
  data.forEach(o => {
    const k = answerKey(o.id);
    localStorage.removeItem(k);
    // Connect menyimpan garis di key tambahan, jadi wajib ikut dihapus saat reset.
    localStorage.removeItem(k + '_connect_lines');
    localStorage.removeItem(k + '_path_lines');
    localStorage.removeItem(k + '_trace_lines');
  });
  localStorage.removeItem(drawKey());
  renderStage();
  toast('🔄 Slide direset!');
}

function completionScore() {
  const overlays = ASPEK_DATA[state.aspect].overlays || {};
  let total = 0, filled = 0;
  Object.keys(overlays).forEach(pg => {
    overlays[pg].forEach(o => {
      if (['mark', 'truefalse', 'circle', 'text'].includes(o.type)) {
        total++;
        const k = `egk_ans_${state.aspect}_${pg}_${o.id}_${state.identity.number}_${state.identity.name}`;
        if ((localStorage.getItem(k) || '').trim()) filled++;
      }
      if (o.type === 'dragdrop') {
        const [items = [], drops = []] = o.args || [];
        const k = `egk_ans_${state.aspect}_${pg}_${o.id}_${state.identity.number}_${state.identity.name}`;
        let map = {}; try { map = JSON.parse(localStorage.getItem(k) || '{}'); } catch {}
        total += items.length;

        // Nilai drag-drop dihitung berdasarkan target benar.
        // Salah target tetap dianggap terjawab/terpasang, tapi skor item = 0.
        items.forEach((item, idx) => {
          const rec = map[String(idx)];
          if (rec === undefined || rec === null || rec === '') return;

          if (rec && typeof rec === 'object' && 'correct' in rec) {
            if (rec.correct === true) filled++;
            return;
          }

          // Backward compatibility untuk data lama yang masih format drop index saja.
          const dropIndex = Number((rec && typeof rec === 'object') ? rec.drop : rec);
          const target = itemTargetIndex(item, drops);
          if (target === null || Number(target) === dropIndex) filled++;
        });
      }
    });
  });
  return { score: total ? Math.round(filled / total * 100) : null, filled, total };
}

function scoreModal() {
  saveDrawing();
  const r = completionScore();
  const isManual = ASPEK_DATA[state.aspect].mode === 'manual' || r.score === null;

  const modal = document.createElement('div');
  modal.className = 'modal';

  const scoreHTML = isManual
    ? `<p style="font-size:18px;font-weight:800;color:var(--muted);margin-bottom:16px">
         Aspek ini dinilai oleh guru berdasarkan observasi. Guru bisa isi nilai di bawah ini.
       </p>
       <div class="grade-grid">
         <label>⭐ Ketepatan    <input type="number" min="0" max="100" id="g1" value="85"></label>
         <label>✨ Kerapian     <input type="number" min="0" max="100" id="g2" value="85"></label>
         <label>🎨 Kreativitas  <input type="number" min="0" max="100" id="g3" value="85"></label>
         <label>🎯 Fokus/Mandiri <input type="number" min="0" max="100" id="g4" value="85"></label>
       </div>`
    : `<div class="big-score">${r.score}</div>
       <p style="font-weight:800;color:var(--muted);margin-bottom:8px">
         ${r.filled} jawaban benar dari ${r.total} item.
       </p>
`;

  modal.innerHTML = `
    <div class="modal-card pop-in">
      <h2>${isManual ? '📋 Observasi Guru' : '🏆 Skor Kamu!'}</h2>
      ${scoreHTML}
      <div class="modal-actions">
        <button class="pill-btn finish-btn" id="saveScoreModal">💾 Simpan Hasil</button>
        <button class="pill-btn" id="closeModal">❌ Tutup</button>
      </div>
    </div>`;

  $('#modalRoot').appendChild(modal);
  $('#closeModal', modal).onclick = () => modal.remove();
  $('#saveScoreModal', modal).onclick = () => finishAspect(modal);
}

function finishAspect(existingModal = null) {
  saveDrawing();
  const r = completionScore();
  let manual = null, final = r.score;
  if (existingModal) {
    const gs = $$('input[type="number"]', existingModal).map(i => Number(i.value)).filter(n => !Number.isNaN(n));
    if (gs.length) { manual = Math.round(gs.reduce((a, b) => a + b, 0) / gs.length); final = manual; }
  }
  saveResult({
    id: uid(), time: new Date().toLocaleString('id-ID'),
    identity: state.identity,
    aspect: state.aspect,
    aspectTitle: ASPEK_DATA[state.aspect].title,
    completion: r, manualScore: manual, finalScore: final,
    status: manual !== null ? 'Dinilai manual' : (final !== null ? 'Skor kelengkapan' : 'Butuh observasi guru'),
  });
  confetti(); beep('win');
  toast('🎉 Hasil tersimpan! Kerja bagus!', 'win');
  if (existingModal) existingModal.remove();
}

/* ── Theme ── */
function applyTheme() {
  const dark = localStorage.getItem('egk_theme') === 'dark';
  document.body.classList.toggle('dark', dark);
  $('#themeBtn').textContent = dark ? '☀️' : '🌙';
}

/* ── Shake animation ── */
const shakeStyle = document.createElement('style');
shakeStyle.textContent = `@keyframes shake { 0%,100%{transform:translateX(0)} 20%,60%{transform:translateX(-8px)} 40%,80%{transform:translateX(8px)} }`;
document.head.appendChild(shakeStyle);

/* ── Event Listeners ── */
$('#enterBtn').onclick = enterLobby;
$('#editIdentityBtn').onclick = () => show('welcome');
$$('.mission-card').forEach(c => c.onclick = () => startAspect(c.dataset.aspect));
$('#menuBtn').onclick = () => { saveDrawing(); updateAllProgress(); show('lobby'); };
$('#prevBtn').onclick = () => go(-1);
$('#nextBtn').onclick = () => go(1);
$('#selectTool').onclick = () => setTool('select');
$('#drawTool').onclick   = () => setTool('draw');
$('#eraserTool').onclick = () => setTool('eraser');
$('#resetSlideBtn').onclick = resetSlide;
$('#scoreBtn').onclick = scoreModal;
$('#finishBtn').onclick = () => scoreModal();
$('#soundBtn').onclick = () => {
  state.sound = !state.sound;
  const btn = $('#soundBtn');
  btn.querySelector('.tool-icon').textContent = state.sound ? '🔊' : '🔇';
  toast(state.sound ? '🔊 Suara aktif!' : '🔇 Suara mati');
};
$('#themeBtn').onclick = () => {
  localStorage.setItem('egk_theme', document.body.classList.contains('dark') ? 'light' : 'dark');
  applyTheme();
};

window.addEventListener('resize', () => { fitCanvas(); restoreDrawing(); });
window.addEventListener('keydown', e => {
  if (!$('#play').classList.contains('active')) return;
  if (e.key === 'ArrowLeft')  go(-1);
  if (e.key === 'ArrowRight') go(1);
});

/* ── Init ── */
applyEditorOverrides();
applyTheme();
loadIdentity();
if (!state.identity) show('welcome');

// ===== EXPORT_ASSETS_SYSTEM =====
window.exportImportedAssets = async function(){
  const imported = [];
  if(window.HOTSPOTS){
    Object.values(window.HOTSPOTS).forEach(arr=>{
      (arr||[]).forEach(item=>{
        if(item && item.src && String(item.src).startsWith('data:image')){
          imported.push(item);
        }
      });
    });
  }

  let index = 1;
  imported.forEach(item=>{
    item.src = 'assets/imported/img_' + String(index).padStart(3,'0') + '.png';
    index++;
  });
}
// ===== END EXPORT_ASSETS_SYSTEM =====



;
/* EGK_COMPACT_IMPORT_IMAGE_PATCH */
(function(){
  if(document.getElementById('egkCompactImportImagePatch')) return;
  const st = document.createElement('style');
  st.id = 'egkCompactImportImagePatch';
  st.textContent = `
    .drag-piece-img{
      width:100%!important;
      height:100%!important;
      object-fit:contain!important;
      object-position:center!important;
      transform:scale(1.18)!important;
      transform-origin:center!important;
      pointer-events:none!important;
      user-select:none!important;
    }
    .dragItem,
    .drag-piece,
    .addonOverlay.dragItem,
    .addonOverlay.dragdrop{
      padding:0!important;
      overflow:hidden!important;
    }
  `;
  document.head.appendChild(st);
})();



// Dropdown nomor slide: default tersembunyi, muncul saat chip "Slide x / x" diklik.
function renderPageNavigation(total){
  // Versi lama sengaja dimatikan supaya tombol 1-26 tidak selalu tampil dan menutup konten.
  const nav = document.getElementById('pageNav');
  if(nav) nav.innerHTML = '';
}

function setupSlideDropdown(total=26){
  const indicator = document.getElementById('pageInfo');
  const dropdown = document.getElementById('slideDropdown');
  if(!indicator || !dropdown) return;

  indicator.setAttribute('role', 'button');
  indicator.setAttribute('tabindex', '0');
  indicator.setAttribute('aria-haspopup', 'true');
  indicator.setAttribute('aria-expanded', 'false');
  indicator.title = 'Klik untuk pilih slide';

  function updateLabel(){
    indicator.innerText = `Slide ${state.current || 1} / ${total}`;
  }

  function renderButtons(){
    dropdown.innerHTML = '';
    dropdown.setAttribute('aria-label', 'Pilih nomor slide');

    for(let i=1;i<=total;i++){
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'slide-number-btn';
      btn.innerText = i;

      if(i === state.current) btn.classList.add('active');

      btn.addEventListener('click', () => {
        state.current = i;
        renderStage();
        updateLabel();
        renderButtons();
        closeDropdown();
      });

      dropdown.appendChild(btn);
    }
    updateLabel();
  }

  function openDropdown(){
    renderButtons();
    dropdown.classList.remove('hidden');
    indicator.setAttribute('aria-expanded', 'true');
  }

  function closeDropdown(){
    dropdown.classList.add('hidden');
    indicator.setAttribute('aria-expanded', 'false');
  }

  function toggleDropdown(){
    dropdown.classList.contains('hidden') ? openDropdown() : closeDropdown();
  }

  indicator.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  indicator.addEventListener('keydown', (e) => {
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      toggleDropdown();
    }
    if(e.key === 'Escape') closeDropdown();
  });

  dropdown.addEventListener('click', (e) => e.stopPropagation());
  document.addEventListener('click', closeDropdown);
  document.addEventListener('keydown', (e) => { if(e.key === 'Escape') closeDropdown(); });

  renderButtons();
}

window.addEventListener('load', () => {
  setTimeout(() => {
    setupSlideDropdown(26);
  }, 800);
});
