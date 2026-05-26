
/* EGK PATH POINT SAFE PATCH
   Khusus editor. Tidak mengubah dragdrop/startDrag/dropzone/dragPiece. */
(function(){
  function q(s){return document.querySelector(s)}
  function safeBase(){ return typeof base==='function' ? base() : {w:1600,h:900}; }
  function safeArr(){ return typeof arr==='function' ? arr() : []; }
  function safePct(v,m){ return (v/m*100)+'%'; }
  function normalizeMaze(m){
    const b=safeBase();
    m.type='maze';
    m.args=m.args&&typeof m.args==='object'&&!Array.isArray(m.args)?m.args:{};
    m.args.start=Array.isArray(m.args.start)?m.args.start:[Math.round(b.w*.18),Math.round(b.h*.20)];
    m.args.finish=Array.isArray(m.args.finish)?m.args.finish:[Math.round(b.w*.82),Math.round(b.h*.75)];
    m.args.path=Array.isArray(m.args.path)?m.args.path:[];
    m.args.tolerance=Number(m.args.tolerance||45);
    m.args.pathTolerance=Number(m.args.pathTolerance||65);
    m.args.note=m.args.note||'Tarik garis dari Mulai ke Selesai.';
    return m;
  }
  function selectedParentIdSafe(){
    const raw = String(typeof selected !== 'undefined' ? selected : '');
    return raw.split('|')[0];
  }
  function selectedMaze(){
    const id = selectedParentIdSafe();
    const m = safeArr().find(x => x && x.type === 'maze' && x.id === id);
    return m ? normalizeMaze(m) : null;
  }
  function createMaze(){
    const b=safeBase();
    const n=safeArr().filter(x=>x && x.type==='maze').length + 1;
    // Offset posisi biar kalau klik berkali-kali, maze baru tidak tepat numpuk di titik yang sama.
    const off=((n-1)%6)*70;
    const m={id:'maze_'+aspect+'_'+page+'_'+Date.now()+'_'+Math.floor(Math.random()*9999),type:'maze',args:{
      start:[Math.round(b.w*.18+off),Math.round(b.h*.20+off)],
      finish:[Math.round(b.w*.82-off),Math.round(b.h*.75-off)],
      path:[], tolerance:45, pathTolerance:65, note:'Tarik garis dari Mulai ke Selesai.'
    }};
    safeArr().push(m);
    return normalizeMaze(m);
  }
  function ensureMaze(){
    // Untuk tambah Path Point: pakai maze yang sedang dipilih dulu.
    // Kalau belum ada yang dipilih, baru pakai maze pertama. Kalau belum ada sama sekali, buat baru.
    return selectedMaze() || normalizeMaze(safeArr().find(x=>x && x.type==='maze') || createMaze());
  }
  const oldAdd = typeof add==='function' ? add : null;
  if(oldAdd){
    add=function(type){
      if(type==='maze'){
        const m=createMaze(); selected=m.id; render(); saveLocal(); return;
      }
      // jangan biarkan PATH PAINT lama kepakai untuk path point
      if(type==='pathPaint'){
        window.addMazePathPoint(); return;
      }
      return oldAdd(type);
    };
  }
  window.addMazePathPoint=function(){
    const m=ensureMaze(); const a=m.args;
    const parts=String(selected||'').split('|');
    let insertAt=a.path.length;
    let from=a.path[a.path.length-1]||a.start;
    let to=a.finish;
    if(parts[0]===m.id && parts[1]==='path' && a.path[Number(parts[2])]){
      insertAt=Number(parts[2])+1;
      from=a.path[Number(parts[2])];
      to=a.path[Number(parts[2])+1]||a.finish;
    }
    const np=[Math.round((Number(from[0])+Number(to[0]))/2),Math.round((Number(from[1])+Number(to[1]))/2)];
    a.path.splice(insertAt,0,np);
    selected=m.id+'|path|'+insertAt;
    render(); saveLocal();
    const st=q('#status'); if(st) st.textContent='✅ Path Point ditambah. Geser titik kuning. Garis otomatis Start → Point → Finish.';
  };
  document.addEventListener('click',function(e){
    const btn=e.target.closest&&e.target.closest('#addMazePathPoint,#mazeAddPointProp');
    if(!btn) return;
    e.preventDefault(); e.stopPropagation(); window.addMazePathPoint();
  },true);
  const oldDel = typeof del==='function' ? del : null;
  if(oldDel){
    del=function(){
      const parts=String(selected||'').split('|');
      if(parts[1]==='path'){
        const m=safeArr().find(x=>x.id===parts[0]&&x.type==='maze');
        const idx=Number(parts[2]);
        if(m&&Array.isArray(m.args&&m.args.path)&&m.args.path[idx]){
          m.args.path.splice(idx,1); selected=m.id; render(); saveLocal(); return;
        }
      }
      return oldDel();
    };
  }

  function bindMazePointDrag(el,o,sel,kind,idx){
    // Drag khusus Path Point. Tidak pakai bindHotDrag bawaan supaya tidak kena resize-handle
    // dan tidak nabrak logic drag-drop project.
    el.style.touchAction='none';
    el.style.cursor='grab';
    el.onpointerdown=function(e){
      e.preventDefault();
      e.stopPropagation();
      if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      normalizeMaze(o);
      selected=sel;
      if(typeof props==='function') props();
      const b=safeBase();
      const rect=q('#stage').getBoundingClientRect();
      const start=JSON.parse(JSON.stringify(o.args));
      const sx=e.clientX, sy=e.clientY;
      el.style.cursor='grabbing';
      try{ el.setPointerCapture(e.pointerId); }catch(_){ }
      let raf=0;
      const repaint=()=>{ raf=0; try{ render(); }catch(_){ } };
      const moveEv=function(ev){
        ev.preventDefault();
        const dx=(ev.clientX-sx)/Math.max(1,rect.width)*b.w;
        const dy=(ev.clientY-sy)/Math.max(1,rect.height)*b.h;
        if(kind==='finish'){
          const f=start.finish||o.args.finish;
          o.args.finish=[Math.round(f[0]+dx),Math.round(f[1]+dy)];
        }else if(kind==='path'){
          const p=(start.path&&start.path[idx])||o.args.path[idx]||[0,0];
          o.args.path[idx]=[Math.round(p[0]+dx),Math.round(p[1]+dy)];
        }else{
          const st=start.start||o.args.start;
          o.args.start=[Math.round(st[0]+dx),Math.round(st[1]+dy)];
        }
        if(!raf) raf=requestAnimationFrame(repaint);
      };
      const upEv=function(ev){
        document.removeEventListener('pointermove',moveEv,true);
        document.removeEventListener('pointerup',upEv,true);
        document.removeEventListener('pointercancel',upEv,true);
        try{ saveLocal(); }catch(_){ }
        try{ render(); }catch(_){ }
      };
      document.addEventListener('pointermove',moveEv,{capture:true,passive:false});
      document.addEventListener('pointerup',upEv,{capture:true,once:true});
      document.addEventListener('pointercancel',upEv,{capture:true,once:true});
    };
  }

  const oldDrawHot = typeof drawHot==='function' ? drawHot : null;
  if(oldDrawHot){
    drawHot=function(o){
      if(!o || o.type!=='maze') return oldDrawHot(o);
      normalizeMaze(o);
      const b=safeBase(), a=o.args, key=(typeof selKey==='function'?selKey(o):o.id), all=[a.start,...a.path,a.finish];
      const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');
      svg.classList.add('mazePathLine'); svg.setAttribute('viewBox','0 0 '+b.w+' '+b.h);
      for(let i=1;i<all.length;i++){
        const ln=document.createElementNS('http://www.w3.org/2000/svg','line');
        ln.setAttribute('x1',all[i-1][0]); ln.setAttribute('y1',all[i-1][1]);
        ln.setAttribute('x2',all[i][0]); ln.setAttribute('y2',all[i][1]);
        ln.setAttribute('stroke','#f59e0b'); ln.setAttribute('stroke-width','8');
        ln.setAttribute('stroke-linecap','round'); ln.setAttribute('stroke-dasharray','14 10'); ln.setAttribute('opacity','.9');
        svg.appendChild(ln);
      }
      layer.appendChild(svg);
      function dot(pt,cls,text,size,sel,kind,idx){
        const el=document.createElement('div');
        el.className='hot '+cls+(selected===sel?' selected':''); el.textContent=text;
        Object.assign(el.style,{left:safePct(pt[0]-size/2,b.w),top:safePct(pt[1]-size/2,b.h),width:safePct(size,b.w),height:safePct(size,b.h),borderRadius:'999px',display:'grid',placeItems:'center',zIndex:20,fontWeight:'900'});
        bindMazePointDrag(el,o,sel,kind,idx); layer.appendChild(el);
      }
      dot(a.start,'mazeStart','Mulai',64,key,'start',0);
      a.path.forEach((pt,i)=>dot(pt,'mazePathPoint',String(i+1),36,key+'|path|'+i,'path',i));
      dot(a.finish,'mazeFinish','Selesai',76,key+'|finish','finish',0);
    };
  }
  const oldMove = typeof move==='function' ? move : null;
  if(oldMove){
    move=function(o,start,dx,dy,kind='',idx=0){
      if(o && o.type==='maze'){
        normalizeMaze(o);
        if(kind==='finish'){
          const f=start.finish||o.args.finish; o.args.finish=[Math.round(f[0]+dx),Math.round(f[1]+dy)];
        }else if(kind==='path'){
          const p=(start.path&&start.path[idx])||o.args.path[idx]; o.args.path[idx]=[Math.round(p[0]+dx),Math.round(p[1]+dy)];
        }else{
          const st=start.start||o.args.start; o.args.start=[Math.round(st[0]+dx),Math.round(st[1]+dy)];
        }
        return;
      }
      return oldMove(o,start,dx,dy,kind,idx);
    };
  }
  const oldApplyLiveStyle = typeof applyLiveStyle==='function' ? applyLiveStyle : null;
  if(oldApplyLiveStyle){
    applyLiveStyle=function(el,o,kind='',idx=0){
      if(o && o.type==='maze'){
        normalizeMaze(o); const b=safeBase();
        let pt=kind==='finish'?o.args.finish:(kind==='path'?o.args.path[idx]:o.args.start);
        const size=kind==='path'?36:(kind==='finish'?76:64);
        Object.assign(el.style,{left:safePct(pt[0]-size/2,b.w),top:safePct(pt[1]-size/2,b.h),width:safePct(size,b.w),height:safePct(size,b.h)});
        return;
      }
      return oldApplyLiveStyle(el,o,kind,idx);
    };
  }
  const oldProps = typeof props==='function' ? props : null;
  if(oldProps){
    props=function(){
      const o=safeArr().find(x=>x.id===selectedParentId());
      if(!o || o.type!=='maze') return oldProps();
      normalizeMaze(o); const a=o.args;
      q('#props').innerHTML=`
        <label>ID</label><input id="pid" value="${o.id}">
        <label>Type</label><input value="maze / path point" disabled>
        <p class="hintline">Start, Finish, dan titik Path Point bisa digeser langsung di slide.</p>
        <div class="propgrid">
          <label>Start X<input id="msx" type="number" value="${Math.round(a.start[0])}"></label>
          <label>Start Y<input id="msy" type="number" value="${Math.round(a.start[1])}"></label>
          <label>Finish X<input id="mfx" type="number" value="${Math.round(a.finish[0])}"></label>
          <label>Finish Y<input id="mfy" type="number" value="${Math.round(a.finish[1])}"></label>
          <label>Finish Tolerance<input id="mtol" type="number" value="${Math.round(a.tolerance)}"></label>
          <label>Path Tolerance<input id="mptol" type="number" value="${Math.round(a.pathTolerance)}"></label>
        </div>
        <p class="hintline">Path tersimpan: ${a.path.length} titik. Klik ➕ Path Point berkali-kali, lalu geser titik kuning.</p>
        <div class="prop-actions"><button id="mazeAddPointProp" class="pill-btn score-btn">➕ Tambah Point</button><button id="mazeDeletePointProp" class="pill-btn">🗑️ Hapus Point Terpilih</button><button id="applyMaze" class="pill-btn teacher">✅ Terapkan Maze</button></div>
        <label>Args</label><textarea id="pargs" style="height:160px">${JSON.stringify(a,null,2)}</textarea>
        <button id="applyProps" class="pill-btn finish-btn" style="margin-top:8px">Terapkan JSON</button>`;
      const apply=()=>{ o.id=q('#pid').value.trim()||o.id; a.start=[Number(q('#msx').value)||0,Number(q('#msy').value)||0]; a.finish=[Number(q('#mfx').value)||0,Number(q('#mfy').value)||0]; a.tolerance=Number(q('#mtol').value)||45; a.pathTolerance=Number(q('#mptol').value)||65; selected=o.id; render(); saveLocal(); };
      q('#mazeAddPointProp').onclick=window.addMazePathPoint;
      q('#mazeDeletePointProp').onclick=()=>del();
      q('#applyMaze').onclick=apply;
      ['#msx','#msy','#mfx','#mfy','#mtol','#mptol'].forEach(s=>{const el=q(s); if(el) el.onchange=apply;});
      q('#applyProps').onclick=()=>{try{o.args=JSON.parse(q('#pargs').value); normalizeMaze(o); selected=o.id; render(); saveLocal();}catch(e){alert('Args harus JSON valid')}};
    };
  }
})();


(function(){
  const css = `.mazeStart,.mazeFinish,.mazePathPoint{pointer-events:auto!important;user-select:none!important;-webkit-user-select:none!important;touch-action:none!important}.mazePathPoint .resize-handle,.mazeStart .resize-handle,.mazeFinish .resize-handle{display:none!important}`;
  const st=document.createElement('style'); st.textContent=css; document.head.appendChild(st);
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
