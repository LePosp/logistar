export function makeT(x=0,y=0,scale=1){ return { x,y, scale }; }

// world -> screen (returns client/CSS coordinates by default)
// If canvas is provided we map into client coordinates via bounding rect and DPR.
export function w2s(st,wx,wy,canvas){
  const sx = (wx + st.t.x) * st.t.scale;
  const sy = (wy + st.t.y) * st.t.scale;
  if(!canvas) return { x:sx, y:sy };
  const rect = canvas.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  // canvas.width = rect.width * dpr, so convert internal screen px -> client px
  return { x: rect.left + sx / dpr, y: rect.top + sy / dpr };
}

// screen/client -> world. If canvas provided, convert client coords -> internal screen px first.
export function s2w(st,sx,sy,canvas){
  if(!canvas){
    const s=st.t.scale; return { x: sx/s - st.t.x, y: sy/s - st.t.y };
  }
  const rect = canvas.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  const localX = (sx - rect.left) * dpr;
  const localY = (sy - rect.top)  * dpr;
  const s = st.t.scale;
  return { x: localX / s - st.t.x, y: localY / s - st.t.y };
}

export function clamp(st,canvas){
  if(!st.bounds) return;
  const s = st.t.scale, dpr = devicePixelRatio || 1;
  const vw = canvas.width / dpr / s, vh = canvas.height / dpr / s;
  // симметричные пределы — чтобы не «тянуло» к левому/верхнему краю
  const extX = Math.max(Math.abs(st.bounds.minX), Math.abs(st.bounds.maxX));
  const extY = Math.max(Math.abs(st.bounds.minY), Math.abs(st.bounds.maxY));
  const pad = 0.10; // немного воздуха
  const minX = -extX + vw*pad;
  const maxX =  extX - vw*pad;
  const minY = -extY + vh*pad;
  const maxY =  extY - vh*pad;
  st.t.x = Math.max(minX, Math.min(maxX, st.t.x));
  st.t.y = Math.max(minY, Math.min(maxY, st.t.y));
}

export function centerToOrigin(st,canvas){
  const s = st.t.scale, dpr = devicePixelRatio || 1;
  const vw = canvas.width / dpr / s, vh = canvas.height / dpr / s;
  // положим (0,0) мира в центр экрана (в мировых единицах относительно текущего масштаба)
  st.t.x = vw/2;
  st.t.y = vh/2;
}
