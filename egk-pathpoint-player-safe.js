
/* EGK PATH POINT PLAYER SAFE PATCH
   Hanya label Mulai/Selesai + validasi notifikasi. Tidak menyentuh dragdrop. */
(function(){
  function $(q,root=document){return root.querySelector(q)}
  function pct(v,m){return (v/m*100)+'%'}
  function base(){const d=ASPEK_DATA[state.aspect]||{}; return {w:d.baseW||1600,h:d.baseH||900};}
  function currentMazes(){
    const data=((ASPEK_DATA[state.aspect]||{}).overlays||{})[String(state.current)]||[];
    return data.filter(o=>o.type==='maze' || o.type==='mazePath' || o.type==='trace');
  }
  function normalize(o){
    const b=base();
    if(o.type==='maze'){
      const a=o.args||{};
      return {start:a.start||[b.w*.18,b.h*.20], finish:a.finish||[b.w*.82,b.h*.75], path:Array.isArray(a.path)?a.path:[], tolerance:Number(a.tolerance||45), pathTolerance:Number(a.pathTolerance||65)};
    }
    const kp=Array.isArray(o.keyPath)?o.keyPath:[];
    const p=kp.map(pt=>Array.isArray(pt)?pt:[pt.x,pt.y]).filter(p=>Number.isFinite(+p[0])&&Number.isFinite(+p[1]));
    if(p.length>=2) return {start:p[0], finish:p[p.length-1], path:p.slice(1,-1), tolerance:Number(o.tolerance||45), pathTolerance:Number(o.tolerance||45)};
    const a=Array.isArray(o.args)?o.args:[0,0,b.w,b.h];
    return {start:[a[0],a[1]+a[3]/2], finish:[a[0]+a[2],a[1]+a[3]/2], path:[], tolerance:45, pathTolerance:65};
  }
  function addStartFinishHints(){
    const stage=$('.stage');
    const layer=$('.overlay-layer');
    if(!stage||!layer) return;

    layer.querySelectorAll('.pathpointHint').forEach(x=>x.remove());

    const mazes=currentMazes();
    if(!mazes.length) return;

    stage.classList.add('hasMazePathPoint');
  }
  const st=document.createElement('style');
  st.textContent=`
    .hasMazePathPoint .addonOverlay.mazePath,.hasMazePathPoint .addonOverlay.trace,.hasMazePathPoint .addonOverlay.pathPaint,.hasMazePathPoint .addonOverlay.finish{border:0!important;outline:0!important;background:transparent!important;color:transparent!important;box-shadow:none!important;}
    .pathpointHint,
    .pathpointHint *,
    .ppText,
    .ppDot{
      display:none!important;
      opacity:0!important;
      visibility:hidden!important;
      border:0!important;
      outline:0!important;
      box-shadow:none!important;
      background:transparent!important;
    }
    .pathpointHint .ppDot{width:24px;height:24px;border-radius:999px;border:4px solid #fff;box-shadow:0 7px 18px rgba(0,0,0,.22)}
    .pathpointHint.start .ppDot{background:#22c55e}
    .pathpointHint.finish .ppDot{background:#ef4444}
    .pathpointHint .ppText{padding:3px 8px;border-radius:999px;color:#fff;font-weight:1000;font-size:12px;line-height:1;text-shadow:0 2px 5px rgba(0,0,0,.24);white-space:nowrap;box-shadow:0 5px 14px rgba(0,0,0,.15)}
    .pathpointHint.start .ppText{background:#22c55e}
    .pathpointHint.finish .ppText{background:#ef4444}
    .pathpointHint.start{transform:translateY(-8px)}
    .pathpointHint.finish{transform:translateY(8px)}
    .egkResultPopup{position:fixed;left:50%;top:18%;transform:translateX(-50%) scale(.9);z-index:99999;padding:16px 22px;border-radius:24px;font-weight:1000;font-size:22px;color:#fff;box-shadow:0 18px 45px rgba(0,0,0,.22);opacity:0;transition:.22s ease;pointer-events:none}.egkResultPopup.show{opacity:1;transform:translateX(-50%) scale(1)}.egkResultPopup.ok{background:#22c55e}.egkResultPopup.bad{background:#ef4444}#checkPathBtn{display:none!important}`;
  document.head.appendChild(st);
  function resultPopup(ok){
    let el=$('.egkResultPopup'); if(!el){el=document.createElement('div');el.className='egkResultPopup';document.body.appendChild(el)}
    el.className='egkResultPopup '+(ok?'ok':'bad'); el.textContent=ok?'🎉 Anda Benar!':'❌ Jawaban Salah';
    requestAnimationFrame(()=>el.classList.add('show'));
    setTimeout(()=>el.classList.remove('show'),1700);
    if(typeof beep==='function') beep(ok?'win':'bad');
    if(typeof toast==='function') toast(ok?'🎉 Anda Benar!':'❌ Jawaban Salah', ok?'win':'warn');
  }
  function resetWrongPathLine(){
    const c=$('.draw-canvas');
    if(!c) return;
    const ctx=c.getContext('2d');
    ctx.clearRect(0,0,c.width,c.height);
    try{ if(typeof drawKey==='function') localStorage.removeItem(drawKey()); }catch(e){}
    try{ if(typeof saveDrawing==='function') saveDrawing(); }catch(e){}
  }
  function dist(a,b){const dx=a[0]-b[0],dy=a[1]-b[1];return Math.hypot(dx,dy)}
  function pointSegDist(p,a,b){const x=p[0],y=p[1],x1=a[0],y1=a[1],x2=b[0],y2=b[1]; const dx=x2-x1,dy=y2-y1; if(dx===0&&dy===0) return Math.hypot(x-x1,y-y1); let t=((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy); t=Math.max(0,Math.min(1,t)); return Math.hypot(x-(x1+t*dx),y-(y1+t*dy));}
  function validatePath(){
    const mazes=currentMazes();
    if(!mazes.length) return null;

    const c=$('.draw-canvas');
    if(!c) return null;

    const b=base();
    const sx=b.w/c.width;
    const sy=b.h/c.height;

    const ctx=c.getContext('2d');
    const data=ctx.getImageData(0,0,c.width,c.height).data;

    const pts=[];
    for(let y=0;y<c.height;y+=6){
      for(let x=0;x<c.width;x+=6){
        if(data[(y*c.width+x)*4+3]>20){
          pts.push([x*sx,y*sy]);
        }
      }
    }

    if(pts.length<8) return false;

    let benar=0;

    for(const maze of mazes){
      const m=normalize(maze);
      const all=[m.start,...m.path,m.finish];

      const nearStart=pts.some(p=>dist(p,m.start)<=Math.max(50,m.tolerance));
      const nearFinish=pts.some(p=>dist(p,m.finish)<=Math.max(50,m.tolerance));

      let good=0;
      let totalNearMaze=0;

      for(const p of pts){
        let md=Infinity;

        for(let i=1;i<all.length;i++){
          md=Math.min(md,pointSegDist(p,all[i-1],all[i]));
        }

        if(md<=m.pathTolerance*2){
          totalNearMaze++;
          if(md<=m.pathTolerance) good++;
        }
      }

      const ratio=totalNearMaze ? good/totalNearMaze : 0;

      if(nearStart && nearFinish && ratio>=0.58){
        benar++;
      }
    }

    return benar===mazes.length;
  }
  let autoChecked = false;
  function armAutoValidate(){
    const mazes=currentMazes();
    const c=$('.draw-canvas');
    if(!mazes.length||!c||c.dataset.pathAutoValidate==='1') return;
    c.dataset.pathAutoValidate='1';
    autoChecked=false;
    function done(){
      if(autoChecked) return;
      setTimeout(()=>{
        const r=validatePath();
        // hanya munculkan notif kalau anak sudah benar-benar menggambar sampai dekat finish / ada coretan cukup
        if(r===null) return;
        if(r === false){
          autoChecked = false;
          return;
        }
        if(r === true && !autoChecked){
          autoChecked = true;
          resultPopup(true);
        }
      },120);
    }
    c.addEventListener('pointerup', done, {passive:true});
    c.addEventListener('mouseup', done, {passive:true});
    c.addEventListener('touchend', done, {passive:true});
  }
  const oldRender=renderStage;
  renderStage=function(){ oldRender(); setTimeout(()=>{addStartFinishHints(); const mazes=currentMazes(); const c=$('.draw-canvas'); if(mazes.length&&c&&typeof setTool==='function'){
          setTool('draw', true);
          c.style.pointerEvents='auto';
          const sel=document.getElementById('selectTool');
          const color=document.getElementById('colorTool');
          const draw=document.getElementById('drawTool');
          if(sel) sel.classList.add('hidden');
          if(color) color.classList.add('hidden');
          if(draw){
            draw.classList.remove('hidden');
            const ic=draw.querySelector('.tool-icon');
            const lb=draw.querySelector('.tool-label');
            if(ic) ic.textContent='〰️';
            if(lb) lb.textContent='Tarik Garis';
          }
          armAutoValidate();
        }},0); };
})();


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
