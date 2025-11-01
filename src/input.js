import * as cfg from './config.js';

export function attachInput(canvas, state, api){
  const { draw, screenToWorld, clampTransform, centerView } = api;
  let mouseDown=false, mlx=0, mly=0;

  canvas.addEventListener('mousedown', e=>{ mouseDown=true; mlx=e.clientX; mly=e.clientY; });
  window.addEventListener('mouseup', ()=>{ mouseDown=false; });

  window.addEventListener('mousemove', e=>{
    state.mouse = { x:e.clientX, y:e.clientY };
    state.mouseWorld = screenToWorld(state, e.clientX, e.clientY);
    if(!mouseDown) { draw(); return; }
    const dx=e.clientX-mlx, dy=e.clientY-mly; mlx=e.clientX; mly=e.clientY;
    state.transform.x += dx/state.transform.scale; state.transform.y += dy/state.transform.scale;
    clampTransform(state, canvas); draw();
  }, {passive:false});

  function onWheel(e){
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1;
    const zoomIntensity = 0.18;
    const mw = screenToWorld(state, e.clientX, e.clientY);
    let newScale = state.transform.scale * (1 + dir*zoomIntensity);
    newScale = Math.max(0.12, Math.min(3.0, newScale));
    const newTx = (e.clientX / newScale) - mw.x;
    const newTy = (e.clientY / newScale) - mw.y;
    state.transform.scale = newScale; state.transform.x = newTx; state.transform.y = newTy;
    clampTransform(state, canvas); draw();
  }
  canvas.addEventListener('wheel', onWheel, {passive:false});
  window.addEventListener('wheel', onWheel, {passive:false});

  window.addEventListener('keydown', e=>{
    const k = e.key.toLowerCase();
    const panStep = 120/state.transform.scale;
    if (k==='arrowleft'){ state.transform.x += panStep; clampTransform(state, canvas); draw(); }
    else if (k==='arrowright'){ state.transform.x -= panStep; clampTransform(state, canvas); draw(); }
    else if (k==='arrowup'){ state.transform.y += panStep; clampTransform(state, canvas); draw(); }
    else if (k==='arrowdown'){ state.transform.y -= panStep; clampTransform(state, canvas); draw(); }
    else if (k==='z'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=screenToWorld(state, cx, cy); let ns=Math.min(3.0, state.transform.scale*1.18); state.transform.x=(cx/ns)-mw.x; state.transform.y=(cy/ns)-mw.y; clampTransform(state, canvas); state.transform.scale=ns; draw(); }
    else if (k==='x'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=screenToWorld(state, cx, cy); let ns=Math.max(0.12, state.transform.scale/1.18); state.transform.x=(cx/ns)-mw.x; state.transform.y=(cy/ns)-mw.y; clampTransform(state, canvas); state.transform.scale=ns; draw(); }
    else if (k==='d'){ centerView(state, canvas); draw(); }
    else if (k==='h'){ const btn=document.getElementById('toggleHints'); btn?.click(); }
  });

  // выбор системы
  canvas.addEventListener('click', e=>{
    if (state.transform.scale <= cfg.LOD_THRESHOLD) return;
    const mx = e.clientX, my = e.clientY;
    let hit = null, bestDist = 1e9;
    for (const s of state.systems){
      const p = { x:(s.x+state.transform.x)*state.transform.scale, y:(s.y+state.transform.y)*state.transform.scale };
      const dx = p.x - mx, dy = p.y - my;
      const d2 = dx*dx + dy*dy;
      const r = Math.max(5, 6*state.transform.scale);
      if (d2 <= (r*r) && d2 < bestDist){ bestDist = d2; hit = s; }
    }
    state.selectedSystem = hit;
    const card = document.getElementById('card');
    if (hit){
      const sec = state.sectors.find(ss=>ss.id===hit.sectorId);
      document.getElementById('cardTitle').textContent = hit.name;
      document.getElementById('cardMeta').innerHTML = `Тип: <b>${hit.type}</b><br>Сектор: <b>${sec ? sec.name : hit.sectorId}</b><br>Координаты: <b>${Math.round(hit.x)}, ${Math.round(hit.y)}</b>`;
      card.style.display = 'block';
    } else {
      card.style.display = 'none';
    }
    draw();
  });

  document.getElementById('closeCard').onclick = ()=>{ state.selectedSystem = null; document.getElementById('card').style.display='none'; draw(); };
  document.getElementById('enterBtn').onclick = ()=> alert('Заглушка: входим в локальную карту системы');
}
