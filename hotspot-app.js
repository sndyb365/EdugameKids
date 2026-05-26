let current=1;
const IS_EDITOR=document.body.dataset.editor==='true';
let edit=IS_EDITOR, selected=null;
const deck=document.getElementById('deck'), pageInfo=document.getElementById('pageInfo'), prevBtn=document.getElementById('prevBtn'), nextBtn=document.getElementById('nextBtn');
const editBtn=document.getElementById('editBtn'), panel=document.getElementById('panel');
const BASE_W=typeof W!=='undefined'?W:1190;
const BASE_H=typeof H!=='undefined'?H:1685;
const TOTAL=typeof total!=='undefined'?total:26;
const local=localStorage.getItem('aspekHotspotData');
if(local){try{const parsed=JSON.parse(local);Object.keys(overlays).forEach(k=>delete overlays[k]);Object.assign(overlays,parsed)}catch(e){}}
function saveLocal(){localStorage.setItem('aspekHotspotData',JSON.stringify(overlays));}

function resetCurrentAnswers(){
  if(!confirm('Reset jawaban di slide ini?')) return;
  (overlays[current]||[]).forEach(o=>{
    localStorage.removeItem(`textAnswer_${current}_${o.id}`);
    localStorage.removeItem(`mark_${current}_${o.id}`);
    localStorage.removeItem(`circle_${current}_${o.id}`);
  });
  render();
}

function pctX(x){return (x/BASE_W*100)+'%'}
function pctY(y){return (y/BASE_H*100)+'%'}
function pctW(w){return (w/BASE_W*100)+'%'}
function pctH(h){return (h/BASE_H*100)+'%'}
function stagePoint(clientX,clientY){const r=document.getElementById('stage').getBoundingClientRect();return {x:(clientX-r.left)/r.width*BASE_W,y:(clientY-r.top)/r.height*BASE_H};}
function setBox(el,x,y,w,h){Object.assign(el.style,{left:pctX(x),top:pctY(y),width:pctW(w),height:pctH(h)})}
function pnum(v){return parseFloat(v)||0}
function currentBox(el){return {x:pnum(el.dataset.x),y:pnum(el.dataset.y),w:pnum(el.dataset.w),h:pnum(el.dataset.h)}}
function applyBox(el,x,y,w,h){el.dataset.x=x;el.dataset.y=y;el.dataset.w=w;el.dataset.h=h;setBox(el,x,y,w,h)}
// create persistent reset button outside stage (fixed position)
let _resetBtn = null;
function ensureResetBtn(){
  if(IS_EDITOR) return;
  if(!_resetBtn){
    _resetBtn = document.createElement('button');
    _resetBtn.className = 'reset';
    _resetBtn.textContent = '🔄 Reset';
    _resetBtn.onclick = () => resetCurrentAnswers();
    document.body.appendChild(_resetBtn);
  }
}
function render(){
  selected=null; deck.innerHTML='';
  const shell=document.createElement('div'); shell.className='stageShell';
  const stage=document.createElement('div'); stage.className='stage'+(edit?' edit':''); stage.id='stage';
  stage.innerHTML=`<img class="bg" src="slides/slide_${String(current).padStart(2,'0')}.png" draggable="false"><svg class="lineSvg" viewBox="0 0 ${BASE_W} ${BASE_H}" preserveAspectRatio="none"></svg>`;
  const svg=stage.querySelector('svg');
  (overlays[current]||[]).forEach((o,i)=>make(stage,svg,o,i));
  ensureResetBtn();
  stage.addEventListener('pointerdown',e=>{ if(edit && e.target===stage){ clearSelected(); }});
  shell.appendChild(stage); deck.appendChild(shell);
  pageInfo.textContent=`Halaman ${current}/${TOTAL}`;
  prevBtn.disabled=current===1; nextBtn.disabled=current===TOTAL;
}


/* ══════════════════════════════════════════════
   SISTEM PENILAIAN BARU
   - Kunci jawaban disimpan per hotspot di hotspot-data.js / localStorage aspekHotspotData
   - Mark default: kalau args[3] = check/cross, otomatis jadi kunci
   - Mark args[3] = both tidak dinilai sampai guru memilih kunci di editor
   - Hasil siswa disimpan ke localStorage dan bisa dibuka dari editor.html
   ══════════════════════════════════════════════ */

const SCORE_RESULTS_KEY = 'aspekStudentResults';
const STUDENT_NAME_KEY = 'aspekStudentName';

function normalizeText(v){return String(v||'').trim().toLowerCase();}
function htmlEscape(v){return String(v??'').replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));}
function getAnswerKey(o){
  if(!o) return '';
  if(o.answer!==undefined && o.answer!==null && String(o.answer).trim()!=='') return String(o.answer).trim();
  if(o.type==='mark'){
    const mode=o.args && o.args[3];
    if(mode==='check' || mode==='cross') return mode;
  }
  return '';
}
function answerLabel(v){
  if(v==='check') return '✓ Check';
  if(v==='cross') return '✗ Cross';
  if(v==='on') return 'Dipilih';
  if(v==='off') return 'Tidak dipilih';
  return v || '-';
}
function saveCurrentTextAnswers(){ saveCurrentAnswers(); }
function saveCurrentAnswers(){
  if(IS_EDITOR) return;
  const stage=document.getElementById('stage');
  if(!stage) return;
  (overlays[current]||[]).forEach((o)=>{
    if(o.type==='text'){
      const el=stage.querySelector(`[data-id="${o.id}"] .answerInner`);
      if(el) localStorage.setItem(`textAnswer_${current}_${o.id}`, el.value||el.textContent||'');
    }
    if(o.type==='mark'){
      const el=stage.querySelector(`[data-id="${o.id}"]`);
      if(el) localStorage.setItem(`mark_${current}_${o.id}`, el.dataset.v||'');
    }
    if(o.type==='circle'){
      const el=stage.querySelector(`[data-id="${o.id}"]`);
      if(el) localStorage.setItem(`circle_${current}_${o.id}`, el.dataset.v||'');
    }
  });
}
function collectScoreDetails(){
  saveCurrentAnswers();
  let total=0, correct=0;
  const details=[];
  Object.keys(overlays).sort((a,b)=>Number(a)-Number(b)).forEach(pg=>{
    (overlays[pg]||[]).forEach((o,idx)=>{
      const key=getAnswerKey(o);
      if(!key) return;
      let student='', ok=false;
      if(o.type==='text'){
        total++;
        student=localStorage.getItem(`textAnswer_${pg}_${o.id}`)||'';
        const keys=String(key).split('|').map(k=>normalizeText(k)).filter(Boolean);
        const st=normalizeText(student);
        ok=!!st && keys.some(k=>st.includes(k));
      }else if(o.type==='mark'){
        total++;
        student=localStorage.getItem(`mark_${pg}_${o.id}`)||'';
        ok=student===key;
      }else if(o.type==='circle'){
        total++;
        student=localStorage.getItem(`circle_${pg}_${o.id}`)||'';
        ok=(key==='on') ? student==='on' : student!== 'on';
      }else{
        return;
      }
      if(ok) correct++;
      details.push({page:Number(pg), nomor:idx+1, id:o.id, type:o.type, student, correctAnswer:key, ok});
    });
  });
  const score=total?Math.round((correct/total)*100):0;
  return {total, correct, score, details};
}
function getStudentName(){
  let name=localStorage.getItem(STUDENT_NAME_KEY)||'';
  if(!name){
    name=prompt('Masukkan nama siswa dulu:') || 'Siswa Tanpa Nama';
    localStorage.setItem(STUDENT_NAME_KEY,name);
  }
  return name;
}
function saveStudentResult(result){
  const name=getStudentName();
  const list=JSON.parse(localStorage.getItem(SCORE_RESULTS_KEY)||'[]');
  const payload={
    id:'result_'+Date.now(),
    name,
    score:result.score,
    correct:result.correct,
    total:result.total,
    time:new Date().toLocaleString('id-ID'),
    details:result.details
  };
  list.unshift(payload);
  localStorage.setItem(SCORE_RESULTS_KEY,JSON.stringify(list.slice(0,100)));
  return payload;
}
function showScore(){
  const result=collectScoreDetails();
  const saved=IS_EDITOR?null:saveStudentResult(result);
  const byPage={};
  result.details.forEach(d=>{(byPage[d.page] ||= []).push(d);});
  const modal=document.createElement('div');
  modal.id='scoreModal';
  modal.innerHTML=`
  <div class="score-backdrop">
    <div class="score-card">
      <div class="score-head">
        <div>
          <h2>📊 Hasil Penilaian</h2>
          <p>${saved?htmlEscape(saved.name):'Preview editor'} • ${saved?htmlEscape(saved.time):new Date().toLocaleString('id-ID')}</p>
        </div>
        <button class="score-x" onclick="document.getElementById('scoreModal').remove()">×</button>
      </div>
      <div class="score-main">
        <div class="score-number">${result.score}</div>
        <div class="score-sub">${result.correct} benar dari ${result.total} soal dinilai</div>
      </div>
      ${result.total===0?`<div class="score-empty">Belum ada kunci jawaban. Buka <b>editor.html</b>, pilih hotspot, lalu isi bagian <b>Kunci</b>.</div>`:''}
      <div class="score-list">
        ${Object.keys(byPage).map(pg=>`
          <div class="score-page">
            <h3>Slide ${pg}</h3>
            ${byPage[pg].map(d=>`
              <div class="score-row ${d.ok?'ok':'bad'}">
                <span>${d.ok?'✅':'❌'}</span>
                <div>
                  <b>${d.type==='text'?'Textbox':d.type==='mark'?'Check/Cross':'Circle'} #${d.nomor}</b>
                  <small>Jawaban siswa: <b>${htmlEscape(answerLabel(d.student))}</b> — Kunci: <b>${htmlEscape(answerLabel(d.correctAnswer))}</b></small>
                </div>
              </div>
            `).join('')}
          </div>
        `).join('')}
      </div>
      <button class="score-close" onclick="document.getElementById('scoreModal').remove()">Tutup</button>
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function showEditorDashboard(){
  const list=JSON.parse(localStorage.getItem(SCORE_RESULTS_KEY)||'[]');
  const modal=document.createElement('div');
  modal.id='scoreModal';
  modal.innerHTML=`
  <div class="score-backdrop">
    <div class="score-card score-wide">
      <div class="score-head">
        <div><h2>📋 Dashboard Nilai Siswa</h2><p>Data tersimpan di browser/perangkat ini.</p></div>
        <button class="score-x" onclick="document.getElementById('scoreModal').remove()">×</button>
      </div>
      ${list.length===0?`<div class="score-empty">Belum ada hasil siswa. Siswa harus klik <b>Cek Skor</b> di index.html dulu.</div>`:`
      <div class="dash-table-wrap"><table class="dash-table">
        <thead><tr><th>Nama</th><th>Nilai</th><th>Benar</th><th>Waktu</th></tr></thead>
        <tbody>${list.map(r=>`<tr><td>${htmlEscape(r.name)}</td><td><b>${r.score}</b></td><td>${r.correct}/${r.total}</td><td>${htmlEscape(r.time)}</td></tr>`).join('')}</tbody>
      </table></div>
      <h3 style="margin:16px 0 8px">Detail hasil terbaru</h3>
      <div class="score-list">${(list[0].details||[]).map(d=>`<div class="score-row ${d.ok?'ok':'bad'}"><span>${d.ok?'✅':'❌'}</span><div><b>Slide ${d.page} — ${d.type} #${d.nomor}</b><small>Jawaban: <b>${htmlEscape(answerLabel(d.student))}</b> — Kunci: <b>${htmlEscape(answerLabel(d.correctAnswer))}</b></small></div></div>`).join('')}</div>`}
      <div class="dash-actions">
        <button class="score-close" onclick="exportResults()">Export JSON</button>
        <button class="score-close danger" onclick="clearResults()">Hapus Data</button>
      </div>
    </div>
  </div>`;
  document.body.appendChild(modal);
}
function exportResults(){
  const data=localStorage.getItem(SCORE_RESULTS_KEY)||'[]';
  const blob=new Blob([data],{type:'application/json'});
  const a=document.createElement('a');
  a.href=URL.createObjectURL(blob);
  a.download='hasil-penilaian-siswa.json';
  a.click();
  URL.revokeObjectURL(a.href);
}
function clearResults(){
  if(confirm('Hapus semua hasil nilai siswa di dashboard ini?')){
    localStorage.removeItem(SCORE_RESULTS_KEY);
    document.getElementById('scoreModal')?.remove();
    showEditorDashboard();
  }
}
function showSlideKeys(){
  const rows=(overlays[current]||[]).map((o,idx)=>({o,idx,key:getAnswerKey(o)})).filter(x=>['mark','circle','text'].includes(x.o.type));
  const modal=document.createElement('div');
  modal.id='scoreModal';
  modal.innerHTML=`<div class="score-backdrop"><div class="score-card score-wide"><div class="score-head"><div><h2>🔑 Kunci Jawaban Slide ${current}</h2><p>Klik hotspot di slide untuk ubah kunci lebih detail.</p></div><button class="score-x" onclick="document.getElementById('scoreModal').remove()">×</button></div>${rows.length?`<div class="score-list">${rows.map(r=>`<div class="score-row ${r.key?'ok':'bad'}"><span>${r.key?'🔑':'—'}</span><div><b>${r.o.type} #${r.idx+1}</b><small>ID: ${htmlEscape(r.o.id)} — Kunci: <b>${htmlEscape(answerLabel(r.key))}</b></small></div></div>`).join('')}</div>`:`<div class="score-empty">Tidak ada item yang bisa dinilai di slide ini.</div>`}<button class="score-close" onclick="document.getElementById('scoreModal').remove()">Tutup</button></div></div>`;
  document.body.appendChild(modal);
}


prevBtn.onclick=()=>{if(current>1){saveCurrentTextAnswers();current--;render()}}; nextBtn.onclick=()=>{if(current<TOTAL){saveCurrentTextAnswers();current++;render()}};
// Tombol Cek Skor — cari di DOM, support id 'scoreBtn' atau 'checkScore'
const scoreBtn=document.getElementById('scoreBtn')||document.getElementById('checkScore');
if(scoreBtn) scoreBtn.onclick=()=>showScore();
const dashBtn=document.getElementById('dashBtn'); if(dashBtn) dashBtn.onclick=()=>showEditorDashboard();
const keysBtn=document.getElementById('keysBtn'); if(keysBtn) keysBtn.onclick=()=>showSlideKeys();
if(editBtn){editBtn.onclick=()=>{saveLocal();edit=!edit;editBtn.textContent='Mode Edit: '+(edit?'ON':'OFF');editBtn.classList.toggle('on',edit);render()}; editBtn.classList.toggle('on',edit)}
document.addEventListener('keydown',e=>{if(e.key==='ArrowRight'&&!edit)nextBtn.click(); if(e.key==='ArrowLeft'&&!edit)prevBtn.click(); if(edit&&(e.key==='Delete'||e.key==='Backspace'))deleteSelected();});
function clearSelected(){document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));selected=null;if(panel)panel.innerText='Klik hotspot/textbox. Drag untuk geser. Tarik kotak merah pojok kanan-bawah untuk gedein/kecilin. Tekan Delete untuk hapus.'}
function setSelected(el,o,i,path){document.querySelectorAll('.selected').forEach(x=>x.classList.remove('selected'));el.classList.add('selected');selected={o,i,path,el};const b=currentBox(el);if(!panel)return;
const canFont=o.type==='text'||o.type==='dragdrop'||o.type==='drag';
const canAnswer=o.type==='mark'||o.type==='circle'||o.type==='text';
const canShape=['shape_rect','shape_ellipse','shape_line','shape_triangle'].includes(o.type);
const fs=o.fontSize||0;
const lh=o.lineHeight||'';
const ta=o.textAlign||'left';
const tc=o.textColor||'#111111';
// shape defaults
const sf=o.shapeFill||'rgba(99,102,241,0.2)';
const ss=o.shapeStroke||'#6366f1';
const sw=o.shapeStrokeW??4;
const sop=Math.round((o.shapeOpacity??1)*100);
// convert rgba fill to hex+alpha for color input (best effort)
function rgbaToHex(c){const m=c.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);if(!m)return c.startsWith('#')?c:'#6366f1';return '#'+[m[1],m[2],m[3]].map(n=>parseInt(n).toString(16).padStart(2,'0')).join('');}
const sfHex=rgbaToHex(sf);
panel.innerHTML=`<div id="tbWrap" style="display:flex;flex-wrap:wrap;gap:6px;align-items:center;justify-content:center;font-size:12px">
<span style="color:#64748b;font-size:11px"><b>${el.dataset.name}</b> ${Math.round(b.w)}×${Math.round(b.h)}</span>
${canShape?`
<span class="tb-group">
  <span class="tb-label">Fill</span>
  <input type="color" id="shapeFillPick" value="${sfHex}" style="width:30px;height:26px;border:2px solid #cbd5e1;border-radius:6px;cursor:pointer;padding:2px">
  <button class="tb-btn" id="shapeFillNone" title="Tanpa fill" style="font-size:10px">none</button>
</span>
<span class="tb-group">
  <span class="tb-label">Border</span>
  <input type="color" id="shapeStrokePick" value="${ss.startsWith('#')?ss:'#6366f1'}" style="width:30px;height:26px;border:2px solid #cbd5e1;border-radius:6px;cursor:pointer;padding:2px">
</span>
<span class="tb-group">
  <span class="tb-label">Tebal</span>
  <button class="tb-btn" id="swMinus">−</button>
  <span id="swVal" class="tb-val">${sw}px</span>
  <button class="tb-btn" id="swPlus">+</button>
</span>
<span class="tb-group">
  <span class="tb-label">Opacity</span>
  <button class="tb-btn" id="sopMinus">−</button>
  <span id="sopVal" class="tb-val">${sop}%</span>
  <button class="tb-btn" id="sopPlus">+</button>
</span>
`:''}
${canFont?`
<span class="tb-group">
  <span class="tb-label">Font</span>
  <button class="tb-btn" id="fsMinus">−</button>
  <span id="fsVal" class="tb-val">${fs?fs+'px':'auto'}</span>
  <button class="tb-btn" id="fsPlus">+</button>
  <button class="tb-btn" id="fsReset" title="reset">↺</button>
</span>
<span class="tb-group">
  <span class="tb-label">Baris</span>
  <button class="tb-btn" id="lhMinus">−</button>
  <span id="lhVal" class="tb-val">${lh||'auto'}</span>
  <button class="tb-btn" id="lhPlus">+</button>
  <button class="tb-btn" id="lhReset" title="reset">↺</button>
</span>
<span class="tb-group">
  <span class="tb-label">Align</span>
  <button class="tb-btn tb-tog ${ta==='left'?'tb-on':''}" id="taLeft" title="Kiri">⬛&#x200b;≡</button>
  <button class="tb-btn tb-tog ${ta==='center'?'tb-on':''}" id="taCenter" title="Tengah">≡</button>
  <button class="tb-btn tb-tog ${ta==='right'?'tb-on':''}" id="taRight" title="Kanan">≡&#x200b;⬛</button>
</span>
<span class="tb-group">
  <button class="tb-btn tb-tog ${o.bold?'tb-on':''}" id="tbBold" style="font-weight:900">B</button>
  <button class="tb-btn tb-tog ${o.italic?'tb-on':''}" id="tbItalic" style="font-style:italic">I</button>
</span>
<span class="tb-group">
  <span class="tb-label">Warna</span>
  <input type="color" id="tbColor" value="${tc}" style="width:30px;height:26px;border:2px solid #cbd5e1;border-radius:6px;cursor:pointer;padding:2px">
  <button class="tb-btn" id="tbColorReset" title="reset warna">↺</button>
</span>
`:'<span style="color:#94a3b8;font-size:11px">Pilih textbox/drag untuk format teks</span>'}
${canAnswer?`
<span class="tb-group">
  <span class="tb-label">✓ Kunci</span>
  ${o.type==='mark'?`
    <button class="tb-btn tb-tog ${o.answer==='check'?'tb-on':''}" id="ansCheck" style="color:#16a34a;font-size:16px">✓</button>
    <button class="tb-btn tb-tog ${o.answer==='cross'?'tb-on':''}" id="ansCross" style="color:#dc2626;font-size:16px">✗</button>
    <button class="tb-btn tb-tog ${!o.answer?'tb-on':''}" id="ansNone" title="Tidak dinilai">—</button>
  `:''}
  ${o.type==='circle'?`
    <button class="tb-btn tb-tog ${o.answer==='on'?'tb-on':''}" id="ansCircleOn" title="Benar jika dipilih">✓ pilih</button>
    <button class="tb-btn tb-tog ${o.answer==='off'?'tb-on':''}" id="ansCircleOff" title="Benar jika tidak dipilih">✓ jangan</button>
    <button class="tb-btn tb-tog ${!o.answer?'tb-on':''}" id="ansNone" title="Tidak dinilai">—</button>
  `:''}
</span>
${o.type==='text'?`
<div style="width:100%;margin-top:4px;display:flex;flex-direction:column;gap:4px">
  <span style="font-size:11px;color:#6366f1;font-weight:700">🤖 Kunci Jawaban (untuk AI Scoring)</span>
  <textarea id="ansTextKey" rows="2" placeholder="Contoh: fotosintesis | fotosintesa | memasak makanan" style="width:100%;padding:6px 10px;border:1.5px solid #c7d2fe;border-radius:8px;font-size:12px;resize:vertical;font-family:inherit;box-sizing:border-box;outline:none">${o.answer||''}</textarea>
  <span style="font-size:10px;color:#94a3b8">Pisahkan alternatif kata kunci dengan <b>|</b> — jawaban benar jika mengandung salah satu</span>
</div>
`:''}
`:''}
</div>`;
if(canFont){
  const STEP=2,MIN=8,MAX=120,LH_STEP=0.1,LH_MIN=0.8,LH_MAX=3.0;
  const fsVal=document.getElementById('fsVal');
  const lhVal=document.getElementById('lhVal');
  function save(){saveLocal();applyTextStyle(el,o);}
  function applyFs(v){o.fontSize=v||0;save();fsVal.textContent=v?v+'px':'auto';}
  function applyLh(v){o.lineHeight=v?v.toFixed(1):'';save();lhVal.textContent=v?v.toFixed(1):'auto';}
  function applyTa(v){o.textAlign=v;save();['Left','Center','Right'].forEach(d=>{const b=document.getElementById('ta'+d);if(b)b.classList.toggle('tb-on',d.toLowerCase()===v);});}
  document.getElementById('fsMinus').onclick=()=>{const c=o.fontSize||getFontSizePx(el);applyFs(Math.max(MIN,c-STEP));};
  document.getElementById('fsPlus').onclick=()=>{const c=o.fontSize||getFontSizePx(el);applyFs(Math.min(MAX,c+STEP));};
  document.getElementById('fsReset').onclick=()=>applyFs(0);
  document.getElementById('lhMinus').onclick=()=>{const c=parseFloat(o.lineHeight)||1.4;applyLh(Math.max(LH_MIN,+(c-LH_STEP).toFixed(1)));};
  document.getElementById('lhPlus').onclick=()=>{const c=parseFloat(o.lineHeight)||1.4;applyLh(Math.min(LH_MAX,+(c+LH_STEP).toFixed(1)));};
  document.getElementById('lhReset').onclick=()=>applyLh(0);
  document.getElementById('taLeft').onclick=()=>applyTa('left');
  document.getElementById('taCenter').onclick=()=>applyTa('center');
  document.getElementById('taRight').onclick=()=>applyTa('right');
  document.getElementById('tbBold').onclick=function(){o.bold=!o.bold;this.classList.toggle('tb-on',o.bold);save();};
  document.getElementById('tbItalic').onclick=function(){o.italic=!o.italic;this.classList.toggle('tb-on',o.italic);save();};
  const colorPick=document.getElementById('tbColor');
  colorPick.oninput=()=>{o.textColor=colorPick.value;save();};
  document.getElementById('tbColorReset').onclick=()=>{o.textColor='';colorPick.value='#111111';save();};
}
if(canAnswer){
  function setAnswer(v){o.answer=v;saveLocal();
    ['ansCheck','ansCross','ansNone','ansCircleOn','ansCircleOff'].forEach(id=>{
      const b=document.getElementById(id);if(!b)return;
      const map={ansCheck:'check',ansCross:'cross',ansCircleOn:'on',ansCircleOff:'off',ansNone:''};
      b.classList.toggle('tb-on',map[id]===v);
    });
  }
  ['ansCheck','ansCross','ansNone','ansCircleOn','ansCircleOff'].forEach(id=>{
    const b=document.getElementById(id);if(!b)return;
    const map={ansCheck:'check',ansCross:'cross',ansCircleOn:'on',ansCircleOff:'off',ansNone:''};
    b.onclick=()=>setAnswer(map[id]);
  });
  // Handler textarea kunci jawaban untuk textbox
  const ansTextKey=document.getElementById('ansTextKey');
  if(ansTextKey){
    ansTextKey.oninput=()=>{o.answer=ansTextKey.value;saveLocal();};
    // Prevent drag saat mengetik di textarea
    ansTextKey.addEventListener('pointerdown',e=>e.stopPropagation());
  }
}
// ── Shape panel handlers ──
if(canShape){
  function saveShape(){saveLocal();applyShapeStyle(el,o);}
  // Fill color
  const fillPick=document.getElementById('shapeFillPick');
  if(fillPick) fillPick.oninput=()=>{o.shapeFill=fillPick.value;saveShape();};
  const fillNone=document.getElementById('shapeFillNone');
  if(fillNone) fillNone.onclick=()=>{o.shapeFill='none';if(fillPick)fillPick.value='#6366f1';saveShape();};
  // Stroke color
  const strokePick=document.getElementById('shapeStrokePick');
  if(strokePick) strokePick.oninput=()=>{o.shapeStroke=strokePick.value;saveShape();};
  // Stroke width
  const swVal=document.getElementById('swVal');
  document.getElementById('swMinus').onclick=()=>{o.shapeStrokeW=Math.max(0,((o.shapeStrokeW??4)-1));if(swVal)swVal.textContent=o.shapeStrokeW+'px';saveShape();};
  document.getElementById('swPlus').onclick=()=>{o.shapeStrokeW=Math.min(40,((o.shapeStrokeW??4)+1));if(swVal)swVal.textContent=o.shapeStrokeW+'px';saveShape();};
  // Opacity
  const sopVal=document.getElementById('sopVal');
  document.getElementById('sopMinus').onclick=()=>{o.shapeOpacity=+(Math.max(0,((o.shapeOpacity??1)*100-5))/100).toFixed(2);if(sopVal)sopVal.textContent=Math.round(o.shapeOpacity*100)+'%';saveShape();};
  document.getElementById('sopPlus').onclick=()=>{o.shapeOpacity=+(Math.min(100,((o.shapeOpacity??1)*100+5))/100).toFixed(2);if(sopVal)sopVal.textContent=Math.round(o.shapeOpacity*100)+'%';saveShape();};
}}
function deleteSelected(){if(!selected)return; const arr=overlays[current]||[]; const idx=arr.indexOf(selected.o); if(idx>-1){arr.splice(idx,1);saveLocal();render();}}
const delBtn=document.getElementById('deleteBtn'); if(delBtn) delBtn.onclick=deleteSelected;
function bindEdit(el,o,i,path){
  el.dataset.name=o.id||`${o.type}_${i}`; if(!edit)return;
  el.tabIndex=0;
  const h=document.createElement('div');h.className='handle';el.appendChild(h);
  el.addEventListener('pointerdown',e=>{ if(e.target===h)return; setSelected(el,o,i,path); const start=stagePoint(e.clientX,e.clientY); const b=currentBox(el); el.setPointerCapture(e.pointerId); e.preventDefault(); e.stopPropagation(); const mv=ev=>{const now=stagePoint(ev.clientX,ev.clientY); const dx=now.x-start.x,dy=now.y-start.y; let nx=Math.max(0,Math.min(BASE_W-b.w,b.x+dx)); let ny=Math.max(0,Math.min(BASE_H-b.h,b.y+dy)); applyBox(el,nx,ny,b.w,b.h); updateDataFromEl(el,o,path); saveLocal(); setSelected(el,o,i,path)}; const up=ev=>{try{el.releasePointerCapture(e.pointerId)}catch(_){} el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',up)}; el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up);});
  h.addEventListener('pointerdown',e=>{ setSelected(el,o,i,path); const start=stagePoint(e.clientX,e.clientY); const b=currentBox(el); el.setPointerCapture(e.pointerId); e.stopPropagation(); e.preventDefault(); const mv=ev=>{const now=stagePoint(ev.clientX,ev.clientY); const nw=Math.max(20,Math.min(BASE_W-b.x,b.w+(now.x-start.x))); const nh=Math.max(20,Math.min(BASE_H-b.y,b.h+(now.y-start.y))); applyBox(el,b.x,b.y,nw,nh); updateDataFromEl(el,o,path); saveLocal(); setSelected(el,o,i,path)}; const up=ev=>{try{el.releasePointerCapture(e.pointerId)}catch(_){} el.removeEventListener('pointermove',mv); el.removeEventListener('pointerup',up)}; el.addEventListener('pointermove',mv); el.addEventListener('pointerup',up);});
}
function updateDataFromEl(el,o,path){
const {x,y,w,h}=currentBox(el);
if(path?.kind==='center'){
o.args[0]=x+w/2;
o.args[1]=y+h/2;
o.args[2]=Math.max(w,h);
}else if(path?.kind==='text'){
o.args[0]=x;
o.args[1]=y;
o.args[2]=w;
o.args[3]=h;
}else if(path?.kind==='shape'){
o.args[0]=x;
o.args[1]=y;
o.args[2]=w;
o.args[3]=h;
}else if(path?.kind==='dragItem'){
Object.assign(o.args[0][path.idx],{x,y,w,h});
}else if(path?.kind==='drop'){
Object.assign(o.args[1][path.idx],{x,y,w,h});
}else if(path?.kind==='anchorStart'){
o.args[0][path.idx]=[x+w/2,y+h/2];
}else if(path?.kind==='anchorEnd'){
o.args[1][path.idx]=[x+w/2,y+h/2];
}
}

/* ── SHAPE HELPERS ── */
function applyShapeStyle(el, o){
  const svg = el.querySelector('svg');
  if(!svg) return;
  const shape = svg.firstElementChild;
  if(!shape) return;
  const fill   = o.shapeFill   || 'rgba(99,102,241,0.25)';
  const stroke = o.shapeStroke || '#6366f1';
  const sw     = o.shapeStrokeW ?? 4;
  const op     = o.shapeOpacity ?? 1;
  svg.style.opacity = op;
  shape.setAttribute('fill',   fill);
  shape.setAttribute('stroke', stroke);
  shape.setAttribute('stroke-width', sw);
}

function makeShapeEl(o, i){
  const [x,y,w,h] = o.args;
  const wrap = document.createElement('div');
  wrap.className = 'shapeWrap';
  applyBox(wrap, x, y, w, h);

  const ns = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(ns, 'svg');
  svg.setAttribute('viewBox', `0 0 100 100`);
  svg.setAttribute('preserveAspectRatio', 'none');
  svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;';

  let shape;
  const sw2 = (o.shapeStrokeW ?? 4) / 2; // inset agar stroke tidak terpotong
  if(o.type==='shape_rect'){
    shape = document.createElementNS(ns,'rect');
    shape.setAttribute('x', sw2); shape.setAttribute('y', sw2);
    shape.setAttribute('width', 100-sw2*2); shape.setAttribute('height', 100-sw2*2);
    shape.setAttribute('rx','4');
  } else if(o.type==='shape_ellipse'){
    shape = document.createElementNS(ns,'ellipse');
    shape.setAttribute('cx','50'); shape.setAttribute('cy','50');
    shape.setAttribute('rx', 50-sw2); shape.setAttribute('ry', 50-sw2);
  } else if(o.type==='shape_line'){
    shape = document.createElementNS(ns,'line');
    shape.setAttribute('x1','0'); shape.setAttribute('y1','50');
    shape.setAttribute('x2','100'); shape.setAttribute('y2','50');
    shape.setAttribute('stroke-linecap','round');
  } else if(o.type==='shape_triangle'){
    shape = document.createElementNS(ns,'polygon');
    const p=sw2;
    shape.setAttribute('points',`50,${p} ${100-p},${100-p} ${p},${100-p}`);
  }

  svg.appendChild(shape);
  wrap.appendChild(svg);

  // pointer events hanya di wrapper (bukan svg anak) supaya drag bekerja
  wrap.style.pointerEvents = 'auto';
  applyShapeStyle(wrap, o);
  return wrap;
}
/* ── END SHAPE HELPERS ── */
function getFontSizePx(el){
  const inner=el.querySelector('.answerInner,.drag-inner')||el;
  return parseInt(window.getComputedStyle(inner).fontSize)||20;
}
function applyTextStyle(el,o){
  const targets=[];
  const inner=el.querySelector('.answerInner');
  if(inner) targets.push(inner);
  if(el.classList.contains('drag')) targets.push(el);
  targets.forEach(t=>{
    t.style.fontSize   = o.fontSize   ? o.fontSize+'px'   : '';
    t.style.lineHeight = o.lineHeight  ? o.lineHeight       : '';
    t.style.textAlign  = o.textAlign   || '';
    t.style.fontWeight = o.bold        ? 'bold'            : '';
    t.style.fontStyle  = o.italic      ? 'italic'          : '';
    t.style.color      = o.textColor   || '';
  });
}
// backward compat alias
function applyFontSize(el,o){ applyTextStyle(el,o); }
function make(stage,svg,o,i){
  const a=o.args;
  if(o.type==='mark'){
    const [cx,cy,s,mode]=a;
    const el=document.createElement('div');
    el.className='mark';
    el.dataset.id=o.id;
    el.style.setProperty('--s',pctW(s));
    applyBox(el,cx-s/2,cy-s/2,s,s);
    const saved=localStorage.getItem(`mark_${current}_${o.id}`)||'';
    if(saved) el.dataset.v=saved;
    // FIX: pakai pointerdown + hitbox besar agar checkbox tetap mudah diklik
    // walaupun posisi antar checkbox rapat di slide.
    el.addEventListener('pointerdown',(e)=>{
      if(edit)return;
      e.preventDefault();
      e.stopPropagation();

      const v=el.dataset.v||'';
      const next=mode==='check'?(v?'':'check'):(v===''?'check':v==='check'?'cross':'');
      el.dataset.v=next;
      localStorage.setItem(`mark_${current}_${o.id}`, next);
    });
    stage.appendChild(el);
    bindEdit(el,o,i,{kind:'center',idx:0});
  }
  if(o.type==='circle'){
    const [cx,cy,s]=a;
    const el=document.createElement('div');
    el.className='circleMark';
    el.dataset.id=o.id;
    applyBox(el,cx-s/2,cy-s/2,s,s);
    const saved=localStorage.getItem(`circle_${current}_${o.id}`)||'';
    if(saved) el.dataset.v=saved;
    el.onclick=()=>{
      if(!edit){
        el.dataset.v=el.dataset.v==='on'?'':'on';
        localStorage.setItem(`circle_${current}_${o.id}`, el.dataset.v||'');
      }
    };
    stage.appendChild(el);
    bindEdit(el,o,i,{kind:'center',idx:0});
  }
  if(o.type==='text'){
    const [x,y,w,h]=a;
    const box=document.createElement('div');
    box.className='answerBox';
    box.dataset.id=o.id;
    applyBox(box,x,y,w,h);
    const inner=document.createElement(h>90?'textarea':'input');
    inner.className='answerInner';
    inner.placeholder='Ketik jawaban...';
    inner.value=localStorage.getItem(`textAnswer_${current}_${o.id}`)||'';
    inner.addEventListener('input',()=>localStorage.setItem(`textAnswer_${current}_${o.id}`,inner.value||''));
    applyTextStyle(box,o);
    box.style.borderRadius = (o.borderRadius ?? '') ? (o.borderRadius+'px') : box.style.borderRadius;
    if(o.bgColor) box.style.background = o.bgColor;
    if(o.padding !== undefined) inner.style.padding = o.padding + 'px';
    if(o.text) inner.placeholder = o.text;
    if(edit){inner.disabled=true;inner.placeholder='Textbox siswa (font: '+(o.fontSize?o.fontSize+'px':'auto')+')';}
    box.appendChild(inner);
    stage.appendChild(box);
    bindEdit(box,o,i,{kind:'text'});
  }
  if(o.type==='hint'&&!edit){
    const el=document.createElement('div');
    el.className='hint';
    el.textContent=a[0];
    stage.appendChild(el);
    setTimeout(()=>el.style.display='none',3500);
  }
  if(o.type==='connect'){createConnect(stage,svg,o)}
  if(o.type==='dragdrop'){createDragDrop(stage,o)}
  if(['shape_rect','shape_ellipse','shape_line','shape_triangle'].includes(o.type)){
    const el=makeShapeEl(o,i);
    stage.appendChild(el);
    bindEdit(el,o,i,{kind:'shape'});
  }
}
function createLine(svg,x1,y1,x2,y2,temp=false){const l=document.createElementNS('http://www.w3.org/2000/svg','line');l.setAttribute('x1',x1);l.setAttribute('y1',y1);l.setAttribute('x2',x2);l.setAttribute('y2',y2);l.setAttribute('stroke',temp?'#60a5fa':'#111827');l.setAttribute('stroke-width',temp?6:8);l.setAttribute('stroke-linecap','round');svg.appendChild(l);return l}
function createConnect(stage,svg,o){const [starts,ends]=o.args;let active=null,line=null;const all=[];const addA=(p,cls,idx)=>{const el=document.createElement('div');el.className='anchor '+cls;applyBox(el,p[0]-12,p[1]-12,24,24);stage.appendChild(el);all.push(el);bindEdit(el,o,0,{kind:cls==='start'?'anchorStart':'anchorEnd',idx})};starts.forEach((p,i)=>addA(p,'start',i));ends.forEach((p,i)=>addA(p,'end',i));if(edit)return;stage.addEventListener('pointerdown',e=>{if(!e.target.classList.contains('start'))return;const b=currentBox(e.target);active=[b.x+12,b.y+12];line=createLine(svg,active[0],active[1],active[0],active[1],true);stage.setPointerCapture(e.pointerId)});stage.addEventListener('pointermove',e=>{if(!line)return;const p=stagePoint(e.clientX,e.clientY);line.setAttribute('x2',p.x);line.setAttribute('y2',p.y)});stage.addEventListener('pointerup',e=>{if(!line)return;const p=stagePoint(e.clientX,e.clientY);const end=all.find(el=>{const b=currentBox(el);return el.classList.contains('end')&&Math.hypot(b.x+12-p.x,b.y+12-p.y)<55});if(end){const b=currentBox(end);line.remove();createLine(svg,active[0],active[1],b.x+12,b.y+12,false)}else line.remove();line=null;active=null})}

function createDragDrop(stage,o){
  const [items,drops]=o.args;
  const placedByDrop = drops.map(()=>[]);
  const dropEls=[];

  const getImg = it => it.src || it.img || it.image || it.url || it.dataUrl || '';
  const renderDragContent = (el,it)=>{
    el.innerHTML='';
    const imgSrc=getImg(it);
    if(imgSrc){
      const img=document.createElement('img');
      img.src=imgSrc; img.draggable=false; img.alt=it.t||'drag item';
      img.className='drag-thumb-img';
      el.appendChild(img);
      if(it.t){ const cap=document.createElement('span'); cap.className='drag-caption'; cap.textContent=it.t; el.appendChild(cap); }
    }else{
      el.textContent=it.t || 'Item';
    }
  };

  const hitDrop=(el)=>{
    const b=currentBox(el);
    const cx=b.x+b.w/2, cy=b.y+b.h/2;
    let best=-1;
    drops.forEach((d,i)=>{
      if(cx>=d.x && cx<=d.x+d.w && cy>=d.y && cy<=d.y+d.h) best=i;
    });
    return best;
  };

  // FREE POSITION DROP:
  // Banyak item boleh masuk 1 dropzone, tapi posisi TIDAK di-auto-grid.
  // Ukuran item tetap sesuai box drag aslinya; user bebas meletakkan di sisi mana saja.
  const layoutDrop=(dropIdx)=>{
    placedByDrop[dropIdx]=placedByDrop[dropIdx].filter(Boolean);
    placedByDrop[dropIdx].forEach((el,idx)=>{
      el.classList.add('dropped-item');
      el.dataset.dropIdx=String(dropIdx);
      el.style.zIndex=22+idx;
    });
  };

  const removeFromDrop=(el)=>{
    const old=el.dataset.dropIdx;
    if(old!==undefined && old!==''){
      const oi=Number(old);
      placedByDrop[oi]=placedByDrop[oi].filter(x=>x!==el);
      el.dataset.dropIdx='';
      el.classList.remove('dropped-item');
      layoutDrop(oi);
    }
  };

  drops.forEach((d,i)=>{
    const z=document.createElement('div');
    z.className='drop multi-dropzone';
    z.dataset.dropIndex=String(i);
    applyBox(z,d.x,d.y,d.w,d.h);
    stage.appendChild(z);
    dropEls.push(z);
    bindEdit(z,o,i,{kind:'drop',idx:i});
  });

  items.forEach((it,i)=>{
    const el=document.createElement('div');
    el.className='drag';
    renderDragContent(el,it);
    applyTextStyle(el,o);
    applyBox(el,it.x,it.y,it.w,it.h);
    el.dataset.origX=it.x; el.dataset.origY=it.y; el.dataset.origW=it.w; el.dataset.origH=it.h;
    stage.appendChild(el);
    if(edit){
      bindEdit(el,o,i,{kind:'dragItem',idx:i});
    }else{
      let dx=0,dy=0;
      el.addEventListener('pointerdown',e=>{
        removeFromDrop(el);
        el.setPointerCapture(e.pointerId);
        const p=stagePoint(e.clientX,e.clientY), b=currentBox(el);
        // Saat diambil dari dropzone, balikin ukuran asli biar enak digeser.
        const ow=pnum(el.dataset.origW)||b.w, oh=pnum(el.dataset.origH)||b.h;
        applyBox(el,b.x,b.y,ow,oh);
        dx=p.x-b.x; dy=p.y-b.y;
        el.style.zIndex=80;
        e.preventDefault();
      });
      el.addEventListener('pointermove',e=>{
        if(!el.hasPointerCapture(e.pointerId))return;
        const p=stagePoint(e.clientX,e.clientY), b=currentBox(el);
        applyBox(el,p.x-dx,p.y-dy,b.w,b.h);
      });
      el.addEventListener('pointerup',e=>{
        try{el.releasePointerCapture(e.pointerId)}catch(_){}
        const target=hitDrop(el);
        if(target>-1){
          if(!placedByDrop[target].includes(el)) placedByDrop[target].push(el);
          // Tetap di posisi user melepas mouse/finger, ukuran tetap ukuran drag box.
          el.classList.add('dropped-item');
          el.dataset.dropIdx=String(target);
          el.style.zIndex=30 + placedByDrop[target].length;
        }else{
          el.style.zIndex=20;
        }
      });
    }
  });
}
function drag(el){let dx=0,dy=0;el.addEventListener('pointerdown',e=>{el.setPointerCapture(e.pointerId);const p=stagePoint(e.clientX,e.clientY),b=currentBox(el);dx=p.x-b.x;dy=p.y-b.y;el.style.zIndex=30});el.addEventListener('pointermove',e=>{if(!el.hasPointerCapture(e.pointerId))return;const p=stagePoint(e.clientX,e.clientY),b=currentBox(el);applyBox(el,p.x-dx,p.y-dy,b.w,b.h)});el.addEventListener('pointerup',e=>{try{el.releasePointerCapture(e.pointerId)}catch(_){}})}
function addObj(type){
  let o;
  const cx=BASE_W*.5, cy=BASE_H*.5;
  if(type==='mark')    o={id:`mark_${Date.now()}`,type:'mark',args:[cx,cy,70,'both']};
  if(type==='text')    o={id:`text_${Date.now()}`,type:'text',args:[BASE_W*.35,BASE_H*.45,BASE_W*.32,80]};
  if(type==='circle')  o={id:`circle_${Date.now()}`,type:'circle',args:[cx,cy,110]};
  // shapes: args = [x, y, w, h]
  if(type==='shape_rect')     o={id:`rect_${Date.now()}`,type:'shape_rect',    args:[cx-100,cy-60,200,120], shapeFill:'rgba(99,102,241,0.2)',shapeStroke:'#6366f1',shapeStrokeW:4,shapeOpacity:1};
  if(type==='shape_ellipse')  o={id:`ellipse_${Date.now()}`,type:'shape_ellipse',args:[cx-100,cy-60,200,120], shapeFill:'rgba(236,72,153,0.2)',shapeStroke:'#ec4899',shapeStrokeW:4,shapeOpacity:1};
  if(type==='shape_line')     o={id:`line_${Date.now()}`,type:'shape_line',    args:[cx-120,cy-4,240,8],     shapeFill:'none',shapeStroke:'#f59e0b',shapeStrokeW:6,shapeOpacity:1};
  if(type==='shape_triangle') o={id:`tri_${Date.now()}`,type:'shape_triangle', args:[cx-80,cy-80,160,130],   shapeFill:'rgba(34,197,94,0.2)',shapeStroke:'#22c55e',shapeStrokeW:4,shapeOpacity:1};
  if(!o) return;
  (overlays[current]??=[]).push(o);
  saveLocal();render();
}
const addCheck=document.getElementById('addCheck'),addText=document.getElementById('addText'),addCircle=document.getElementById('addCircle'),saveBtn=document.getElementById('saveBtn');
const addRect=document.getElementById('addRect'),addEllipse=document.getElementById('addEllipse'),addLine=document.getElementById('addLine'),addTriangle=document.getElementById('addTriangle');
if(addCheck)addCheck.onclick=()=>addObj('mark');
if(addText)addText.onclick=()=>addObj('text');
if(addCircle)addCircle.onclick=()=>addObj('circle');
if(addRect)addRect.onclick=()=>addObj('shape_rect');
if(addEllipse)addEllipse.onclick=()=>addObj('shape_ellipse');
if(addLine)addLine.onclick=()=>addObj('shape_line');
if(addTriangle)addTriangle.onclick=()=>addObj('shape_triangle');
if(saveBtn)saveBtn.onclick=async()=>{
  const js='const W='+BASE_W+',H='+BASE_H+',total='+TOTAL+';\nconst overlays='+JSON.stringify(overlays,null,2)+';\n';
  saveBtn.disabled=true; saveBtn.textContent='Menyimpan...';
  try{
    const r=await fetch('/save-hotspot',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({content:js})});
    const d=await r.json();
    if(d.ok){
      saveBtn.textContent='✓ Tersimpan!';
      saveBtn.style.background='linear-gradient(135deg,#16a34a,#15803d)';
      setTimeout(()=>{saveBtn.textContent='Simpan';saveBtn.disabled=false;saveBtn.style.background='';},2200);
    } else { throw new Error(d.message); }
  } catch(e){
    // fallback: kalau server tidak jalan, download biasa
    if(e.message && e.message.includes('fetch')||e instanceof TypeError){
      const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([js],{type:'text/javascript'}));a.download='hotspot-data.js';a.click();
      alert('Server tidak ditemukan.\nFile didownload manual sebagai hotspot-data.js — replace file lama.');
    } else {
      alert('Gagal simpan: '+e.message);
    }
    saveBtn.textContent='Simpan'; saveBtn.disabled=false;
  }
};
render();




// Musik ramah anak: aktif setelah klik pertama (aturan browser butuh user gesture)
window.addEventListener('load',()=>{
  const musicBtn=document.createElement('button');
  musicBtn.className='music-fab';
  musicBtn.innerHTML='🎵 Nyalakan Musik';
  document.body.appendChild(musicBtn);

  let ctx=null, master=null, playing=false, timer=null, step=0;
  const melody=[523,587,659,784,659,587,523,392,440,523,587,659];

  function ensureAudio(){
    if(!ctx){
      ctx=new (window.AudioContext||window.webkitAudioContext)();
      master=ctx.createGain();
      master.gain.value=0.14;
      master.connect(ctx.destination);
    }
    if(ctx.state==='suspended') return ctx.resume();
    return Promise.resolve();
  }
  function tone(freq,dur=0.22){
    if(!ctx || !master) return;
    const osc=ctx.createOscillator();
    const gain=ctx.createGain();
    osc.type='sine';
    osc.frequency.value=freq;
    gain.gain.setValueAtTime(0.0001,ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.9,ctx.currentTime+0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001,ctx.currentTime+dur);
    osc.connect(gain); gain.connect(master);
    osc.start(); osc.stop(ctx.currentTime+dur+0.02);
  }
  function start(){
    ensureAudio().then(()=>{
      if(playing) return;
      playing=true;
      musicBtn.classList.add('playing');
      musicBtn.innerHTML='🎵 Musik Nyala';
      tone(784,.18);
      timer=setInterval(()=>{ const f=melody[step++%melody.length]; tone(f,.28); setTimeout(()=>tone(f*1.5,.14),90); },330);
    }).catch(()=>{
      musicBtn.innerHTML='Klik lagi 🎵';
    });
  }
  function stop(){
    playing=false;
    clearInterval(timer);
    musicBtn.classList.remove('playing');
    musicBtn.innerHTML='🎵 Nyalakan Musik';
  }
  musicBtn.onclick=(e)=>{e.stopPropagation(); playing?stop():start();};

  // Biar benar-benar mulai: klik pertama di mana saja juga menyalakan musik sekali.
  document.addEventListener('pointerdown',()=>{ if(!playing) start(); },{once:true});
});


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
