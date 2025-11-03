import { s2w } from './camera.js';

function clientPos(e){ return { x: e.clientX, y: e.clientY }; }

// Attach input handlers: pointer-based panning + pinch-to-zoom + wheel zoom + keyboard
export function attach(canvas, st, api){
  const { draw, clamp, toSystem, ensureScale } = api;
  let md=false, lx=0, ly=0, activePointerId = null, lastPinchDist = undefined;
  const pointers = new Map();

  // pointerdown: track pointers
  canvas.addEventListener('pointerdown', e => {
    canvas.setPointerCapture && canvas.setPointerCapture(e.pointerId);
    pointers.set(e.pointerId, clientPos(e));
    if (pointers.size === 1) {
      const p = clientPos(e);
      lx = p.x; ly = p.y; md = true; activePointerId = e.pointerId;
    } else {
      md = false; activePointerId = null;
      // prepare pinch
      const it = pointers.values(); const a = it.next().value; const b = it.next().value;
      if (a && b) lastPinchDist = Math.hypot(a.x - b.x, a.y - b.y);
    }
  });

  window.addEventListener('pointermove', e => {
    if (!pointers.has(e.pointerId)) return;
    pointers.set(e.pointerId, clientPos(e));
    st.mouse = clientPos(e);
    st.mouseW = s2w(st, st.mouse.x, st.mouse.y, canvas);

    if (pointers.size === 2) {
      // pinch-to-zoom
      const it = pointers.values(); const a = it.next().value; const b = it.next().value;
      const midX = (a.x + b.x)/2, midY = (a.y + b.y)/2;
      const dist = Math.hypot(a.x - b.x, a.y - b.y);
      if (typeof lastPinchDist === 'number' && lastPinchDist > 0){
        const ratio = dist / lastPinchDist;
        let ns = st.t.scale * ratio;
        ns = Math.max(0.02, Math.min(6, ns));
        const mw = s2w(st, midX, midY, canvas);
        const rect = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
        st.t.x = ((midX - rect.left) * dpr) / ns - mw.x;
        st.t.y = ((midY - rect.top)  * dpr) / ns - mw.y;
        st.t.scale = ns;
        clamp(st, canvas); draw();
      }
      lastPinchDist = dist;
      return;
    }

    if (md) {
      const p = clientPos(e);
      const dx = p.x - lx, dy = p.y - ly; lx = p.x; ly = p.y;
      st.t.x += dx / st.t.scale;
      st.t.y += dy / st.t.scale;
      ensureScale(); clamp(st, canvas); draw();
    } else {
      draw();
    }
  }, { passive:false });

  window.addEventListener('pointerup', e => {
    pointers.delete(e.pointerId);
    if (e.pointerId === activePointerId) activePointerId = null, md=false;
    if (pointers.size < 2) lastPinchDist = undefined;
  });

  // wheel zoom (only on canvas)
  function onWheel(e){
    e.preventDefault();
    ensureScale();
    const dir = e.deltaY < 0 ? 1 : -1;
    const p = clientPos(e);
    const mw = s2w(st, p.x, p.y, canvas);
    let ns = st.t.scale * (1 + dir * 0.18);
    ns = Math.max(0.02, Math.min(6.0, ns));
    const rect = canvas.getBoundingClientRect();
    const dpr = devicePixelRatio || 1;
    const pxScreen = (p.x - rect.left) * dpr;
    const pyScreen = (p.y - rect.top)  * dpr;
    st.t.x = pxScreen / ns - mw.x;
    st.t.y = pyScreen / ns - mw.y;
    st.t.scale = ns;
    clamp(st, canvas); draw();
  }
  canvas.addEventListener('wheel', onWheel, { passive:false });

  // click -> select system (galaxy mode). For touch, emulate tap threshold by relying on pointer events.
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
      const mw = s2w(st, cx, cy, canvas); let ns = Math.min(6, st.t.scale * 1.18);
      const rect2 = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      st.t.x = ((cx - rect2.left) * dpr) / ns - mw.x;
      st.t.y = ((cy - rect2.top)  * dpr) / ns - mw.y;
      st.t.scale = ns;
    }
    if(k === 'x' || k === '-'){
      const mw = s2w(st, cx, cy, canvas); let ns = Math.max(0.02, st.t.scale / 1.18);
      const rect2 = canvas.getBoundingClientRect(), dpr = devicePixelRatio || 1;
      st.t.x = ((cx - rect2.left) * dpr) / ns - mw.x;
      st.t.y = ((cy - rect2.top)  * dpr) / ns - mw.y;
      st.t.scale = ns;
    }

    if((k === 'enter' || k === ' ') && st.mode === 'galaxy'){ if(st.selected) toSystem(st.selected.id); }
    if(k === 'd'){ st.center && st.center(); }
    ensureScale(); clamp(st, canvas); draw();
  });
}
