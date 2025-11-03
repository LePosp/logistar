import { s2w } from './camera.js';
export function attach(canvas, st, api){
  const { draw, clamp, toSystem } = api;
  let md=false,lx=0,ly=0;

  canvas.addEventListener('mousedown', e=>{ md=true; lx=e.clientX; ly=e.clientY; });
  window.addEventListener('mouseup', ()=> md=false );
  window.addEventListener('mousemove', e=>{
    st.mouse={x:e.clientX,y:e.clientY};
    st.mouseW = s2w(st,e.clientX,e.clientY);
    if(md){
      const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
      st.t.x += dx/st.t.scale; st.t.y += dy/st.t.scale; // панорама и в системе, и в галактике
      clamp(st,canvas); draw();
    }else{ draw(); }
  }, {passive:false});

  function onWheel(e){
    e.preventDefault();
    const dir=e.deltaY<0?1:-1;
    const mw=s2w(st,e.clientX,e.clientY);
    let ns = st.t.scale*(1+dir*0.18);
    ns = Math.max(0.12, Math.min(4.0, ns));
    st.t.x=(e.clientX/ns)-mw.x; st.t.y=(e.clientY/ns)-mw.y; st.t.scale=ns;
    clamp(st,canvas); draw();
  }
  canvas.addEventListener('wheel', onWheel, {passive:false});
  window.addEventListener('wheel', onWheel, {passive:false});

  // клик по системе (только в галактике)
  canvas.addEventListener('click', e=>{
    if(st.mode!=='galaxy') return;
    const px=e.clientX, py=e.clientY;
    let best=null, bestD=1e9; const pr=Math.max(10,12*st.t.scale);
    for(const s of st.systems){
      const sx=(s.x+st.t.x)*st.t.scale, sy=(s.y+st.t.y)*st.t.scale;
      const dx=px-sx, dy=py-sy, d=dx*dx+dy*dy;
      if(d<bestD && d<=pr*pr){ best={sys:s, sx, sy}; bestD=d; }
    }
    if(best){ st.selected=best.sys; st.showCard && st.showCard(best.sys); draw(); }
    else{ st.selected=null; st.hideCard && st.hideCard(); draw(); }
  });

  window.addEventListener('keydown', e=>{
    const k=e.key.toLowerCase(), step=120/st.t.scale;
    if(k==='arrowleft'){ st.t.x+=step; }
    else if(k==='arrowright'){ st.t.x-=step; }
    else if(k==='arrowup'){ st.t.y+=step; }
    else if(k==='arrowdown'){ st.t.y-=step; }
    else if(k==='z' || k==='+'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=s2w(st,cx,cy); let ns=Math.min(4,st.t.scale*1.18); st.t.x=(cx/ns)-mw.x; st.t.y=(cy/ns)-mw.y; st.t.scale=ns; }
    else if(k==='x' || k==='-'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=s2w(st,cx,cy); let ns=Math.max(0.12,st.t.scale/1.18); st.t.x=(cx/ns)-mw.x; st.t.y=(cy/ns)-mw.y; st.t.scale=ns; }
    else if((k==='enter'||k===' ') && st.mode==='galaxy'){ if(st.selected) toSystem(st.selected.id); }
    else if(k==='d'){ st.center && st.center(); }
    clamp(st,canvas); draw();
  });
}
