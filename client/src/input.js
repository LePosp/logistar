
import { s2w } from './camera.js';
export function attach(canvas, st, api){
  const { draw, clamp, toSystem } = api;
  let md=false,lx=0,ly=0;

  canvas.addEventListener('mousedown', e=>{
    if(st.mode!=='galaxy') return; // перетаскивание только в галактике
    md=true; lx=e.clientX; ly=e.clientY;
  });
  window.addEventListener('mouseup', ()=> md=false );
  window.addEventListener('mousemove', e=>{
    st.mouse={x:e.clientX,y:e.clientY};
    st.mouseW = st.mode==='galaxy' ? s2w(st,e.clientX,e.clientY) : null;
    if(st.mode==='galaxy' && md){
      const dx=e.clientX-lx, dy=e.clientY-ly; lx=e.clientX; ly=e.clientY;
      st.t.x += dx/st.t.scale; st.t.y += dy/st.t.scale; clamp(st,canvas); draw();
    }else{
      draw();
    }
  }, {passive:false});

  function onWheel(e){
    e.preventDefault();
    if(st.mode==='galaxy'){
      const dir=e.deltaY<0?1:-1; const k=1+dir*0.18;
      const mw=s2w(st,e.clientX,e.clientY);
      let ns=Math.max(0.12, Math.min(4.0, st.t.scale*k));
      st.t.x=(e.clientX/ns)-mw.x; st.t.y=(e.clientY/ns)-mw.y; st.t.scale=ns;
      clamp(st,canvas); draw();
    }else{
      // системный режим: масштабируем вокруг центра экрана, без панорамирования
      const dir=e.deltaY<0?1:-1;
      let ns=Math.max(0.6, Math.min(2.5, st.t.scale*(1+dir*0.12)));
      st.t.scale=ns; draw();
    }
  }
  canvas.addEventListener('wheel', onWheel, {passive:false});
  window.addEventListener('wheel', onWheel, {passive:false});

  // pick system
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
    if(st.mode==='galaxy'){
      if(k==='arrowleft'){ st.t.x+=step; }
      else if(k==='arrowright'){ st.t.x-=step; }
      else if(k==='arrowup'){ st.t.y+=step; }
      else if(k==='arrowdown'){ st.t.y-=step; }
      else if(k==='z'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=s2w(st,cx,cy); let ns=Math.min(4,st.t.scale*1.18); st.t.x=(cx/ns)-mw.x; st.t.y=(cy/ns)-mw.y; st.t.scale=ns; }
      else if(k==='x'){ const cx=innerWidth/2, cy=innerHeight/2; const mw=s2w(st,cx,cy); let ns=Math.max(0.12,st.t.scale/1.18); st.t.x=(cx/ns)-mw.x; st.t.y=(cy/ns)-mw.y; st.t.scale=ns; }
      else if((k==='enter'||k===' ')){ if(st.selected) toSystem(st.selected.id); }
      else if(k==='d'){ st.center && st.center(); }
    }else{
      if(k==='z'){ st.t.scale=Math.min(2.5, st.t.scale*1.14); }
      else if(k==='x'){ st.t.scale=Math.max(0.6, st.t.scale/1.14); }
      else if(k==='escape' || k==='backspace'){ if(st.toGalaxy) st.toGalaxy(); }
    }
    clamp(st,canvas); draw();
  });
}
