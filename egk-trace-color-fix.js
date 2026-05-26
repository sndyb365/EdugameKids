(function(){
  const COLORS = [
    ['#ff5b5b','1 Merah'], ['#ffd84d','2 Kuning'], ['#79d957','3 Hijau'],
    ['#5ce1e6','4 Biru Muda'], ['#b85cff','5 Ungu'], ['#ff9b4a','6 Oranye'],
    ['#111111','Hitam'], ['#ffffff','Putih']
  ];
  const colorMap = {'1':'#ff5b5b','2':'#ffd84d','3':'#79d957','4':'#5ce1e6','5':'#b85cff','6':'#ff9b4a',red:'#ff5b5b',yellow:'#ffd84d',green:'#79d957',blue:'#5ce1e6',purple:'#b85cff',orange:'#ff9b4a'};
  let penColor = localStorage.getItem('egk_pen_color') || COLORS[0][0];
  let currentStroke = null;

  function keyStroke(){ return `egk_strokes_${state.aspect}_${state.current}_${state.identity.number}_${state.identity.name}`; }
  function getStrokes(){ try{return JSON.parse(localStorage.getItem(keyStroke())||'[]')}catch{return[]} }
  function setStrokes(v){ try{localStorage.setItem(keyStroke(),JSON.stringify(v))}catch{} }
  function baseNow(){ const a=ASPEK_DATA[state.aspect]; return {w:a.baseW||1190,h:a.baseH||1685}; }
  function overlaysNow(){ return (ASPEK_DATA[state.aspect].overlays||{})[state.current]||[]; }

  function syncColorButton(){
    document.documentElement.style.setProperty('--egk-current-pen', penColor);
    const color=document.getElementById('colorTool');
    if(color) color.classList.toggle('hidden', !document.getElementById('drawTool') || document.getElementById('drawTool').classList.contains('hidden'));
  }
  function buildPalette(){
    let pop=document.getElementById('egkColorPop');
    if(!pop){ pop=document.createElement('div'); pop.id='egkColorPop'; pop.className='egk-color-pop'; document.body.appendChild(pop); }
    pop.innerHTML='';
    COLORS.forEach(([c,label])=>{ const b=document.createElement('button'); b.className='egk-color-btn'+(c===penColor?' active':''); b.title=label; b.style.background=c; b.onclick=(e)=>{e.stopPropagation(); penColor=c; localStorage.setItem('egk_pen_color',c); syncColorButton(); buildPalette(); if(typeof toast==='function') toast('🎨 Warna dipilih: '+label);}; pop.appendChild(b); });
    positionPalette(pop);
    return pop;
  }
  function viewportSize(){ const vv=window.visualViewport; return {w:vv?.width||window.innerWidth,h:vv?.height||window.innerHeight, ox:vv?.offsetLeft||0, oy:vv?.offsetTop||0}; }
  function positionPalette(pop=document.getElementById('egkColorPop')){
    const color=document.getElementById('colorTool') || document.getElementById('drawTool');
    if(!pop || !color) return;
    const r=color.getBoundingClientRect();
    const vp=viewportSize();
    const margin=10;
    pop.classList.remove('compact');

    const wasShown=pop.classList.contains('show');
    const oldDisplay=pop.style.display;
    if(!wasShown) pop.style.display='flex';
    const ph=pop.offsetHeight || 100;
    const pw=pop.offsetWidth || 116;
    if(!wasShown) pop.style.display=oldDisplay;

    // Posisi: BAWAH tombol warna, center horizontal terhadap tombol
    let top = r.bottom + 10 + vp.oy;
    let left = (r.left + r.width/2) - pw/2 + vp.ox;

    // Kalau mentok bawah, taruh di atas tombol
    if(top + ph + margin > vp.oy + vp.h){
      top = r.top - ph - 10 + vp.oy;
    }
    // Clamp horizontal
    left = Math.max(vp.ox + margin, Math.min(left, vp.ox + vp.w - pw - margin));
    // Clamp vertikal
    top = Math.max(vp.oy + margin, Math.min(top, vp.oy + vp.h - ph - margin));

    pop.style.left=Math.round(left)+'px';
    pop.style.top=Math.round(top)+'px';
  }
  function togglePalette(force){ const pop=buildPalette(); const show=force ?? !pop.classList.contains('show'); pop.classList.toggle('show',show); if(show) requestAnimationFrame(()=>positionPalette(pop)); }
  window.addEventListener('resize',()=>positionPalette(),{passive:true});
  window.visualViewport?.addEventListener('resize',()=>positionPalette(),{passive:true});
  window.visualViewport?.addEventListener('scroll',()=>positionPalette(),{passive:true});
  document.addEventListener('click',e=>{ if(!e.target.closest('#colorTool') && !e.target.closest('#egkColorPop')) document.getElementById('egkColorPop')?.classList.remove('show'); },true);

  const oldSetTool = window.setTool || setTool;
  window.setTool = setTool = function(t,silent){ oldSetTool(t,silent); syncColorButton(); document.getElementById('egkColorPop')?.classList.remove('show'); };
  setTimeout(()=>{ syncColorButton(); const c=document.getElementById('colorTool'); if(c) c.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();togglePalette();},true); },200);

  window.setupDrawing = setupDrawing = function(c){
    const pos=e=>{ const r=c.getBoundingClientRect(); return {x:e.clientX-r.left,y:e.clientY-r.top}; };
    const toBase=p=>{ const b=baseNow(); return {x:p.x/c.width*b.w,y:p.y/c.height*b.h,t:Date.now()}; };
    c.onpointerdown=e=>{
      if(state.tool==='select') return;
      state.drawing=true; state.last=pos(e); c.setPointerCapture(e.pointerId);
      if(state.tool!=='eraser') currentStroke={color:penColor,width:9,points:[toBase(state.last)]};
    };
    c.onpointermove=e=>{
      if(!state.drawing) return;
      const p=pos(e), ctx=c.getContext('2d');
      ctx.lineCap='round'; ctx.lineJoin='round'; ctx.lineWidth=state.tool==='eraser'?34:9;
      ctx.strokeStyle=state.tool==='eraser'?'rgba(0,0,0,1)':penColor;
      ctx.globalCompositeOperation=state.tool==='eraser'?'destination-out':'source-over';
      ctx.beginPath(); ctx.moveTo(state.last.x,state.last.y);
      // smooth quadratic, bukan garis patah lurus
      const mx=(state.last.x+p.x)/2, my=(state.last.y+p.y)/2;
      ctx.quadraticCurveTo(state.last.x,state.last.y,mx,my); ctx.stroke();
      state.last=p; if(currentStroke) currentStroke.points.push(toBase(p));
    };
    c.onpointerup=e=>{
      state.drawing=false; if(currentStroke && currentStroke.points.length>1){ const arr=getStrokes(); arr.push(currentStroke); setStrokes(arr); currentStroke=null; }
      if(typeof saveDrawing==='function') saveDrawing(); try{c.releasePointerCapture(e.pointerId)}catch{}
    };
  };

  const oldReset = window.resetSlide || resetSlide;
  window.resetSlide = resetSlide = function(){ localStorage.removeItem(keyStroke()); oldReset(); };

  function distPointSeg(p,a,b){ const vx=b.x-a.x, vy=b.y-a.y, wx=p.x-a.x, wy=p.y-a.y; const l2=vx*vx+vy*vy||1; let t=(wx*vx+wy*vy)/l2; t=Math.max(0,Math.min(1,t)); const x=a.x+t*vx,y=a.y+t*vy; return Math.hypot(p.x-x,p.y-y); }
  function minDistToPath(p,path){ let m=1e9; for(let i=1;i<path.length;i++) m=Math.min(m,distPointSeg(p,path[i-1],path[i])); return m; }
  function pathLen(pts){ let l=0; for(let i=1;i<pts.length;i++) l+=Math.hypot(pts[i].x-pts[i-1].x,pts[i].y-pts[i-1].y); return l; }
  function traceScoreFor(o){
    const key=o.keyPath||o.answerPath||o.traceKey||[]; const strokes=getStrokes().flatMap(s=>s.points||[]); if(!strokes.length) return 0;
    const r={x:o.args?.[0]||0,y:o.args?.[1]||0,w:o.args?.[2]||9999,h:o.args?.[3]||9999};
    const pts=strokes.filter(p=>p.x>=r.x&&p.x<=r.x+r.w&&p.y>=r.y&&p.y<=r.y+r.h);
    if(!pts.length) return 0;
    if(key.length>=2){
      const tol=Number(o.tolerance||o.tol||28);
      const near=pts.filter(p=>minDistToPath(p,key)<=tol).length/pts.length;
      const samples=key.filter((_,i)=>i%Math.max(1,Math.floor(key.length/120))===0);
      const covered=samples.filter(k=>pts.some(p=>Math.hypot(p.x-k.x,p.y-k.y)<=tol*1.35)).length/(samples.length||1);
      const neat=Math.max(0,100-(pts.reduce((a,p)=>a+Math.min(100,minDistToPath(p,key)),0)/pts.length)*2.2);
      return Math.round(neat*.45 + near*100*.25 + covered*100*.30);
    }
    // Tanpa kunci: nilai kerapian umum = tidak terlalu patah + cukup mengikuti area
    const len=pathLen(pts); let turn=0; for(let i=2;i<pts.length;i++){ const a=Math.atan2(pts[i-1].y-pts[i-2].y,pts[i-1].x-pts[i-2].x), b=Math.atan2(pts[i].y-pts[i-1].y,pts[i].x-pts[i-1].x); turn+=Math.abs(Math.atan2(Math.sin(b-a),Math.cos(b-a))); }
    const smooth=Math.max(0,100-(turn/Math.max(1,pts.length))*90); const enough=Math.min(100,len/Math.max(120,Math.min(r.w,r.h))*55);
    return Math.round(smooth*.55 + enough*.45);
  }
  function rgb(hex){hex=(hex||'').replace('#','');return [parseInt(hex.slice(0,2),16),parseInt(hex.slice(2,4),16),parseInt(hex.slice(4,6),16)]}
  function colorZoneScore(o){ const c=document.querySelector('.draw-canvas'); if(!c) return 0; const b=baseNow(), ctx=c.getContext('2d'); const [x=0,y=0,w=1,h=1,ans='']=o.args||[]; const want=rgb(colorMap[String(o.answer||o.correct||ans).toLowerCase()]||ans); const sx=x/b.w*c.width, sy=y/b.h*c.height, sw=Math.max(1,w/b.w*c.width), sh=Math.max(1,h/b.h*c.height); let data; try{data=ctx.getImageData(sx,sy,sw,sh).data}catch{return 0} let match=0,paint=0; for(let i=0;i<data.length;i+=16){ const a=data[i+3]; if(a<40) continue; paint++; const d=Math.hypot(data[i]-want[0],data[i+1]-want[1],data[i+2]-want[2]); if(d<95) match++; } return paint?Math.round(match/paint*100):0; }

  window.EGK_VALIDATE_INTERACTIVE=function(){
    const res=[]; overlaysNow().forEach(o=>{ if(o.type==='trace')res.push({id:o.id,type:'trace',score:traceScoreFor(o),ok:traceScoreFor(o)>=Number(o.minScore||70)}); if(o.type==='colorzone')res.push({id:o.id,type:'colorzone',score:colorZoneScore(o),ok:colorZoneScore(o)>=Number(o.minScore||70)}); });
    const avg=res.length?Math.round(res.reduce((a,b)=>a+b.score,0)/res.length):null;
    let badge=document.getElementById('egkTraceBadge'); if(!badge){badge=document.createElement('div');badge.id='egkTraceBadge';badge.className='egk-trace-badge';document.body.appendChild(badge)}
    badge.textContent=avg===null?'Belum ada trace/color':'Nilai: '+avg; badge.classList.add('show'); setTimeout(()=>badge.classList.remove('show'),3500); return {score:avg,items:res};
  };

  const oldCompletion=window.completionScore||completionScore;
  window.completionScore=completionScore=function(){ const base=oldCompletion(); let total=base.total, filled=base.filled; overlaysNow().forEach(o=>{ if(o.type==='trace'){total++; if(traceScoreFor(o)>=Number(o.minScore||70)) filled++;} if(o.type==='colorzone'){total++; if(colorZoneScore(o)>=Number(o.minScore||70)) filled++;} }); return {score:total?Math.round(filled/total*100):null,filled,total}; };
})();
