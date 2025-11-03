export function makeT(x=0,y=0,scale=1){ return { x,y, scale }; }
export function w2s(st,wx,wy){ return { x:(wx+st.t.x)*st.t.scale, y:(wy+st.t.y)*st.t.scale }; }
export function s2w(st,sx,sy){ const s=st.t.scale; return { x:sx/s - st.t.x, y: sy/s - st.t.y }; }

export function clamp(st,canvas){
  if(!st.bounds) return;
  const s=st.t.scale, vw = canvas.width/(devicePixelRatio||1)/s, vh = canvas.height/(devicePixelRatio||1)/s;
  const pad = 0.08;
  const minX = -st.bounds.maxX + vw*pad;
  const maxX = -st.bounds.minX - vw*pad;
  const minY = -st.bounds.maxY + vh*pad;
  const maxY = -st.bounds.minY - vh*pad;
  st.t.x = Math.max(minX, Math.min(maxX, st.t.x));
  st.t.y = Math.max(minY, Math.min(maxY, st.t.y));
}

export function centerToOrigin(st,canvas){
  const s = st.t.scale;
  const dpr = devicePixelRatio||1;
  const vw = canvas.width/dpr/s, vh = canvas.height/dpr/s;
  // центр мира (0,0) — в центре экрана
  st.t.x = (vw/2);
  st.t.y = (vh/2);
}
