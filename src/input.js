import * as cfg from './config.js';
import { screenToWorld } from './camera.js';
import { toSystem, toGalaxy } from './router.js';

export function attachInput(canvas,state,api){
  const { draw, clampTransform } = api;
  let md=false, mlx=0,mly=0;

  canvas.addEventListener('mousedown',e=>{ md=true; mlx=e.clientX; mly=e.clientY; });
  window.addEventListener('mouseup',()=>{ md=false; });

  window.addEventListener('mousemove',e=>{
    state.mouse={x:e.clientX,y:e.clientY}; state.mouseWorld=screenToWorld(state,e.clientX,e.clientY);
    if(!md){ draw(); return; }
    const dx=e.clientX-mlx, dy=e.clientY-mly; mlx=e.clientX; mly=e.clientY;
    state.transform.x += dx/state.transform.scale; state.transform.y += dy/state.transform.scale;
    clampTransform(state, canvas); draw();
  }, {passive:false});

  function onWheel(e){
    e.preventDefault();
    const dir = e.deltaY < 0 ? 1 : -1; const k = 1 + dir*0.18;
    const mw=screenToWorld(state,e.clientX,e.clientY);
    let ns=Math.max(0.12, Math.min(4.0, state.transform.scale * k));
    state.transform.x = (e.clientX/ns) - mw.x; state.transform.y = (e.clientY/ns) - mw.y; state.transform.scale = ns;
    clampTransform(state, canvas); draw();
  }
  canvas.addEventListener('wheel', onWheel, {passive:false});
  window.addEventListener('wheel', onWheel, {passive:false});

  canvas.addEventListener('click', e=>{
    if(state.mode!=='galaxy') return;
    const mx=e.clientX,my=e.clientY;
    if(state.transform.scale <= cfg.LOD_THRESHOLD){
      const cs = state._lastClusters||[];
      let hit=null;
      for(const c of cs){
        const r = Math.max(10, 8 + Math.log2(4+c.count)*5);
        const dx=c.sx-mx, dy=c.sy-my;
        if(dx*dx+dy*dy <= r*r){ hit=c; break; }
      }
      if(hit){
        state.onZoomToWorld && state.onZoomToWorld(hit.wx, hit.wy);
        return;
      }
    }
    let hitS=null, best=1e9;
    for(const s of state.systems){
      const px=(s.x+state.transform.x)*state.transform.scale, py=(s.y+state.transform.y)*state.transform.scale;
      const r=Math.max(5,6*state.transform.scale); const dx=px-mx, dy=py-my; const d=dx*dx+dy*dy;
      if(d<=r*r && d<best){ best=d; hitS=s; }
    }
    if(hitS){ state.selectedSystem=hitS; toSystem(hitS.id); }
    draw();
  });

  window.addEventListener('keydown', e=>{
    const k=e.key.toLowerCase();
    const step=120/state.transform.scale;
    if(k==='arrowleft'){ state.transform.x += step; clampTransform(state,canvas); draw(); }
    else if(k==='arrowright'){ state.transform.x -= step; clampTransform(state,canvas); draw(); }
    else if(k==='arrowup'){ state.transform.y += step; clampTransform(state,canvas); draw(); }
    else if(k==='arrowdown'){ state.transform.y -= step; clampTransform(state,canvas); draw(); }
    else if(k==='z'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=screenToWorld(state,cx,cy); let ns=Math.min(4.0,state.transform.scale*1.18); state.transform.x=(cx/ns)-mw.x; state.transform.y=(cy/ns)-mw.y; state.transform.scale=ns; clampTransform(state,canvas); draw(); }
    else if(k==='x'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=screenToWorld(state,cx,cy); let ns=Math.max(0.12,state.transform.scale/1.18); state.transform.x=(cx/ns)-mw.x; state.transform.y=(cy/ns)-mw.y; state.transform.scale=ns; clampTransform(state,canvas); draw(); }
    else if(k==='d'){ state.center && state.center(); draw(); }
    else if(k==='h'){ document.getElementById('toggleHints')?.click(); }
    else if(k==='escape' || k==='backspace'){ if(state.mode==='system') toGalaxy(); }
  });
}
