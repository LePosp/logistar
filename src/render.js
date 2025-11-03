import { w2s } from './camera.js';
import { CORE_RADIUS } from './config.js';

export function drawSectors(ctx,st){
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';
  ctx.lineWidth=Math.max(1.1,1.6*st.t.scale);
  for(const s of st.sectors){
    const ps=s.poly.map(p=>w2s(st,p.x,p.y, ctx.canvas));
    if(ps.length<3) continue;
    ctx.beginPath(); ctx.moveTo(ps[0].x,ps[0].y);
    for(let i=1;i<ps.length;i++) ctx.lineTo(ps[i].x,ps[i].y);
    ctx.closePath();
    ctx.strokeStyle='rgba(76,121,180,0.55)';
    ctx.fillStyle='rgba(40,70,110,0.020)';
    ctx.fill(); ctx.stroke();
    const c=w2s(st,s.center.x,s.center.y, ctx.canvas);
    ctx.fillStyle='rgba(225,235,255,.95)';
    ctx.font=`${Math.max(12,13*st.t.scale)}px system-ui,Segoe UI,Arial`;
    // center text horizontally
    const metrics = ctx.measureText(s.name);
    ctx.fillText(s.name, c.x - metrics.width/2, c.y + 4);
  }
  ctx.restore();
}

export function drawSystems(ctx,st){
  ctx.save();
  for(const sys of st.systems){
    const d2=sys.x*sys.x+sys.y*sys.y; if(d2<CORE_RADIUS*CORE_RADIUS) continue; // пустое яркое ядро
    const p=w2s(st,sys.x,sys.y, ctx.canvas);
    const r=Math.max(1, Math.min(5, 1.2 + 2.4*st.t.scale));
    const col=sys.type==='mining'?'#f3b56b':(sys.type==='gas'?'#9be0ff':'#b9ffa4');
    ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=col; ctx.fill();
  }
  if(st.selected){
    const p=w2s(st,st.selected.x,st.selected.y, ctx.canvas);
    ctx.beginPath(); ctx.arc(p.x,p.y,10+8*st.t.scale,0,Math.PI*2);
    ctx.strokeStyle='rgba(255,255,255,.95)'; ctx.lineWidth=2; ctx.stroke();
  }
  ctx.restore();
}

export function drawHUD(st){
  const dbg=document.getElementById('dbg');
  if(st.mouseW) dbg.textContent=`x:${Math.round(st.mouseW.x)}, y:${Math.round(st.mouseW.y)}, z:${st.t.scale.toFixed(2)}`;
  const hud=document.getElementById('hud');
  if(hud) hud.textContent=`зум:${st.t.scale.toFixed(2)} | сектора:${st.sectors.length} | системы:${st.systems.length}`;
}
