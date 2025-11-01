
import { w2s } from './camera.js';
function drawScreen(ctx,st,step,alpha,size,off){
  const c=st.canvas, cols=Math.ceil(c.width/step)+2, rows=Math.ceil(c.height/step)+2;
  const offX=(st.t.x*off)%step, offY=(st.t.y*off)%step;
  ctx.save(); ctx.globalAlpha=alpha; ctx.fillStyle='#dfe8ff';
  for(let iy=-1;iy<rows;iy++) for(let ix=-1;ix<cols;ix++){ ctx.fillRect(ix*step+offX, iy*step+offY, size, size); }
  ctx.restore();
}
export function background(ctx,st){
  const g=ctx.createLinearGradient(0,0,0,st.canvas.height); g.addColorStop(0,'#07111a'); g.addColorStop(1,'#0c1016');
  ctx.fillStyle=g; ctx.fillRect(0,0,st.canvas.width,st.canvas.height);
  drawScreen(ctx,st,100,0.28,1,0.20); drawScreen(ctx,st,60,0.35,1.2,0.30);
  const p=w2s(st,0,0), r=900*st.t.scale; ctx.save(); ctx.globalCompositeOperation='lighter';
  let grad=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,r*2.2); grad.addColorStop(0,'rgba(240,248,255,0.07)'); grad.addColorStop(1,'rgba(240,248,255,0)');
  ctx.fillStyle=grad; ctx.beginPath(); ctx.arc(p.x,p.y,r*2.2,0,Math.PI*2); ctx.fill(); ctx.restore();
}
