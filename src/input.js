import { s2w } from './camera.js';

function clientPos(e){ return { x: e.clientX, y: e.clientY }; }

export function attach(canvas, st, api){
  const { draw, clamp, toSystem, ensureScale } = api;
  let md=false, lx=0, ly=0, activePointerId = null;

  // pointer events (works for mouse + touch + pen)
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    activePointerId = e.pointerId;
    md = true;
    const p = clientPos(e);
    lx = p.x; ly = p.y;
  });

  window.addEventListener('pointerup', e => {
    if(activePointerId && e.pointerId !== activePointerId) return;
    md = false; activePointerId = null;
  });

  window.addEventListener('pointermove', e => {
    const p = clientPos(e);
    st.mouse = { x: p.x, y: p.y };
    st.mouseW = s2w(st, p.x, p.y, canvas);
    if (md) {
      const dx = p.x - lx, dy = p.y - ly; lx = p.x; ly = p.y;
      // dx/dy are client (CSS) pixels; convert to world displacement via current scale
      st.t.x += dx / st.t.scale;
      st.t.y += dy / st.t.scale;
      ensureScale(); clamp(st, canvas); draw();
    } else {
      draw();
    }
  }, { passive:false });

  // wheel: listen only on canvas to avoid double handling
  function onWheel(e){
    e.preventDefault();
    ensureScale();
    const dir = e.deltaY < 0 ? 1 : -1;
    const p = clientPos(e);
    const mw = s2w(st, p.x, p.y, canvas);
    let ns = st.t.scale * (1 + dir * 0.18);
    ns = Math.max(0.12, Math.min(4.0, ns));
    // compute new offsets so the world point under pointer remains under pointer
    const rect = canvas.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;
    const pxScreen = (p.x - rect.left) * dpr; // internal screen px
    const pyScreen = (p.y - rect.top)  * dpr;
    st.t.x = pxScreen / ns - mw.x;
    st.t.y = pyScreen / ns - mw.y;
    st.t.scale = ns;
    clamp(st, canvas); draw();
  }
  canvas.addEventListener('wheel', onWheel, { passive:false });

  // click -> select system (galaxy mode)
  canvas.addEventListener('click', e => {
    if (st.mode !== 'galaxy') return;
    const p = clientPos(e);
    let best=null, bestD=Infinity;
    const pr = Math.max(10, 12*st.t.scale);
    const rect = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
    for(const sys of st.systems){
      const sx = (sys.x + st.t.x) * st.t.scale;
      const sy = (sys.y + st.t.y) * st.t.scale;
      const sxClient = rect.left + sx / dpr;
      const syClient = rect.top  + sy / dpr;
      const dx = p.x - sxClient, dy = p.y - syClient, d = dx*dx + dy*dy;
      if (d < bestD && d <= pr*pr){ best = sys; bestD = d; }
    }
    if(best){ st.selected = best; st.showCard && st.showCard(best); }
    else { st.selected = null; st.hideCard && st.hideCard(); }
    draw();
  });

  // keyboard navigation
  window.addEventListener('keydown', e=>{
    const k = (e.key || '').toLowerCase();
    const step = 120 / st.t.scale;
    if(k === 'arrowleft'){  st.t.x += step; }
    if(k === 'arrowright'){ st.t.x -= step; }
    if(k === 'arrowup'){    st.t.y += step; }
    if(k === 'arrowdown'){  st.t.y -= step; }

    // use center of canvas for keyboard zoom
    const rect = canvas.getBoundingClientRect();
    const cx = rect.left + rect.width/2, cy = rect.top + rect.height/2;
    if(k === 'z' || k === '+'){
      const mw = s2w(st, cx, cy, canvas); let ns = Math.min(4, st.t.scale * 1.18);
      const rect = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      st.t.x = ((cx - rect.left) * dpr) / ns - mw.x;
      st.t.y = ((cy - rect.top)  * dpr) / ns - mw.y;
      st.t.scale = ns;
    }
    if(k === 'x' || k === '-'){
      const mw = s2w(st, cx, cy, canvas); let ns = Math.max(0.12, st.t.scale / 1.18);
      const rect = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      st.t.x = ((cx - rect.left) * dpr) / ns - mw.x;
      st.t.y = ((cy - rect.top)  * dpr) / ns - mw.y;
      st.t.scale = ns;
    }

    if((k === 'enter' || k === ' ') && st.mode === 'galaxy'){ if(st.selected) toSystem(st.selected.id); }
    if(k === 'd'){ st.center && st.center(); }
    ensureScale(); clamp(st, canvas); draw();
  });
}
