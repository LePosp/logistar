export function makeT(x=0,y=0,scale=1){ return { x,y, scale }; }
export function w2s(st,wx,wy){ return { x:(wx+st.t.x)*st.t.scale, y:(wy+st.t.y)*st.t.scale }; }
export function s2w(st,sx,sy){ const s=st.t.scale; return { x:sx/s - st.t.x, y: sy/s - st.t.y }; }

export function clamp(st,canvas){
  if(!st.bounds) return;
  const s=st.t.scale, dpr=devicePixelRatio||1;
  const vw = canvas.width/dpr/s, vh = canvas.height/dpr/s;
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
  const s = st.t.scale, dpr=devicePixelRatio||1;
  const vw = canvas.width/dpr/s, vh = canvas.height/dpr/s;
  st.t.x = vw/2;  // положим (0,0) мира в центр экрана
  st.t.y = vh/2;
}
