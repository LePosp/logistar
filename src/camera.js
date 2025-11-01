
export function makeT(x=0,y=0,scale=1){ return { x,y, scale }; }

export function w2s(st,wx,wy){
  return { x:(wx+st.t.x)*st.t.scale, y:(wy+st.t.y)*st.t.scale };
}
export function s2w(st,sx,sy){
  const s=st.t.scale; return { x:sx/s - st.t.x, y: sy/s - st.t.y };
}

export function clamp(st,canvas){
  if(!st.bounds) return;
  const s=st.t.scale;
  const vw = canvas.width/(devicePixelRatio||1)/s;
  const vh = canvas.height/(devicePixelRatio||1)/s;
  const minX = -st.bounds.maxX + vw*0.1;
  const maxX = -st.bounds.minX - vw*0.1;
  const minY = -st.bounds.maxY + vh*0.1;
  const maxY = -st.bounds.minY - vh*0.1;
  st.t.x = Math.max(minX, Math.min(maxX, st.t.x));
  st.t.y = Math.max(minY, Math.min(maxY, st.t.y));
}

export function center(st,canvas){
  const cx=(st.bounds.minX+st.bounds.maxX)/2;
  const cy=(st.bounds.minY+st.bounds.maxY)/2;
  const s = Math.max((st.bounds.maxX-st.bounds.minX)/ (canvas.width/(devicePixelRatio||1)*0.7),
                     (st.bounds.maxY-st.bounds.minY)/ (canvas.height/(devicePixelRatio||1)*0.7));
  const ns = 1/Math.max(s, 0.001);
  st.t.scale = Math.max(0.2, Math.min(1.2, ns));
  st.t.x = (canvas.width/(devicePixelRatio||1)/st.t.scale)/2 - cx;
  st.t.y = (canvas.height/(devicePixelRatio||1)/st.t.scale)/2 - cy;
}
