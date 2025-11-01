
import { PAD } from './config.js';
export const makeT=(x=0,y=0,s=0.35)=>({x,y,scale:s});
export const w2s=(st,x,y)=>({x:(x+st.t.x)*st.t.scale,y:(y+st.t.y)*st.t.scale});
export const s2w=(st,x,y)=>({x:x/st.t.scale - st.t.x, y:y/st.t.scale - st.t.y});
export function center(st,canvas){
  const cx=(canvas.width/(devicePixelRatio||1))/2, cy=(canvas.height/(devicePixelRatio||1))/2;
  st.t.x=(cx/st.t.scale); st.t.y=(cy/st.t.scale);
}
export function clamp(st,canvas){
  const vw=(canvas.width/(devicePixelRatio||1))/st.t.scale, vh=(canvas.height/(devicePixelRatio||1))/st.t.scale;
  const minTx=-(st.bounds.maxX+PAD-vw), maxTx=-st.bounds.minX+PAD;
  const minTy=-(st.bounds.maxY+PAD-vh), maxTy=-st.bounds.minY+PAD;
  st.t.x=Math.min(maxTx,Math.max(minTx,st.t.x));
  st.t.y=Math.min(maxTy,Math.max(minTy,st.t.y));
}
