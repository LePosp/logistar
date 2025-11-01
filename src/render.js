
import { w2s } from './camera.js';
import { computeClusters } from './cluster.js';

export function drawSectors(ctx,st){
  ctx.save(); ctx.lineWidth=Math.max(1.5,2.2*st.t.scale);
  for(const s of st.sectors){
    const ps=s.poly.map(p=>w2s(st,p.x,p.y));
    ctx.beginPath(); ctx.moveTo(ps[0].x,ps[0].y); for(let i=1;i<ps.length;i++)ctx.lineTo(ps[i].x,ps[i].y); ctx.closePath();
    ctx.fillStyle='rgba(40,70,110,0.045)'; ctx.strokeStyle='rgba(67,110,168,0.7)'; ctx.fill(); ctx.stroke();
    const c=w2s(st,s.center.x,s.center.y);
    ctx.fillStyle='rgba(225,235,255,.95)'; ctx.font=`${Math.max(13,15*st.t.scale)}px sans-serif`; ctx.fillText(s.name,c.x-34,c.y-8);
  } ctx.restore();
}

export function drawSystems(ctx,st){
  ctx.save();
  for(const sys of st.systems){
    const p=w2s(st,sys.x,sys.y);
    const r=Math.max(2,3.5*st.t.scale);
    const col=sys.type==='mining'?'#f3b56b':(sys.type==='gas'?'#9be0ff':'#b9ffa4');
    ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
  }
  if(st.selected){
    const p=w2s(st,st.selected.x,st.selected.y);
    ctx.beginPath(); ctx.arc(p.x,p.y,10+8*st.t.scale,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,0.95)'; ctx.lineWidth=2; ctx.stroke();
  }
  ctx.restore();
}

export function drawClusters(ctx,st){
  const clusters=computeClusters(st); st._clusters=clusters;
  ctx.save();
  for(const c of clusters){
    const r=Math.max(12, 10 + Math.log2(4+c.count)*6);
    const col=c.type==='mining'?'#f6c27f':(c.type==='gas'?'#a8e6ff':'#c8ffb4');
    ctx.beginPath(); ctx.arc(c.sx,c.sy,r,0,Math.PI*2);
    ctx.fillStyle='rgba(18,26,40,0.85)'; ctx.fill();
    ctx.lineWidth=2; ctx.strokeStyle=col; ctx.stroke();
    ctx.font='bold 12px system-ui,Segoe UI,Arial'; ctx.fillStyle='#eaf2ff';
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(String(c.count), c.sx, c.sy);
  }
  ctx.restore();
}

export function drawHUD(st){
  const dbg=document.getElementById('dbg');
  if(st.mouseW) dbg.textContent=`x:${Math.round(st.mouseW.x)}, y:${Math.round(st.mouseW.y)}, z:${st.t.scale.toFixed(2)}`;
  document.getElementById('hud').textContent=`зум:${st.t.scale.toFixed(2)} | сектора:${st.sectors.length} | системы:${st.systems.length}`;
}
