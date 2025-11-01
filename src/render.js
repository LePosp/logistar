import * as cfg from './config.js';
import { worldToScreen } from './camera.js';
import { computeClusters } from './cluster.js';

export function drawSectors(ctx,state){
  ctx.save();
  ctx.lineWidth=Math.max(1.5,2.2*state.transform.scale);
  for(const s of state.sectors){
    const ps=s.poly.map(p=>worldToScreen(state,p.x,p.y));
    ctx.save(); ctx.beginPath(); ctx.moveTo(ps[0].x,ps[0].y); for(let i=1;i<ps.length;i++)ctx.lineTo(ps[i].x,ps[i].y);
    ctx.closePath(); ctx.fillStyle='rgba(40,70,110,0.035)'; ctx.strokeStyle='rgba(67,110,168,0.65)'; ctx.fill(); ctx.stroke();
    const c=worldToScreen(state,s.center.x,s.center.y); ctx.fillStyle='rgba(225,235,255,0.95)';
    ctx.font=`${Math.max(13,15*state.transform.scale)}px sans-serif`; ctx.fillText(s.name, c.x-34, c.y-8);
    ctx.restore();
  }
  ctx.restore();
}

export function drawSystems(ctx,state){
  ctx.save();
  const r=Math.max(3.2,4.8*state.transform.scale);
  for(const sys of state.systems){
    const p=worldToScreen(state,sys.x,sys.y);
    let col=sys.type==='mining'?'#f3b56b':(sys.type==='gas'?'#9be0ff':'#b9ffa4');
    ctx.beginPath(); ctx.arc(p.x,p.y,r,0,Math.PI*2); ctx.fillStyle=col; ctx.shadowColor='rgba(0,0,0,0.4)'; ctx.shadowBlur=4; ctx.fill();
  }
  if(state.selectedSystem){
    const p=worldToScreen(state,state.selectedSystem.x,state.selectedSystem.y);
    ctx.beginPath(); ctx.arc(p.x,p.y,r+6,0,Math.PI*2); ctx.strokeStyle='rgba(255,255,255,0.9)'; ctx.lineWidth=2; ctx.stroke();
    ctx.beginPath(); ctx.arc(p.x,p.y,r+12,0,Math.PI*2); ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=1.5; ctx.stroke();
  }
  ctx.restore();
}

export function drawClusters(ctx,state){
  const clusters = computeClusters(state);
  state._lastClusters = clusters; // для хита клика
  ctx.save();
  for(const c of clusters){
    const r = Math.max(10, 8 + Math.log2(4+c.count)*5);
    const col = c.type==='mining'?'#f3b56b':(c.type==='gas'?'#9be0ff':'#b9ffa4');
    ctx.beginPath(); ctx.arc(c.sx,c.sy,r,0,Math.PI*2);
    ctx.fillStyle = 'rgba(20,30,45,0.7)'; ctx.fill();
    ctx.lineWidth = 2; ctx.strokeStyle = col; ctx.stroke();
    ctx.font='12px sans-serif'; ctx.fillStyle='#eaf2ff'; ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(c.count.toString(), c.sx, c.sy);
  }
  ctx.restore();
}

export function drawHUD(state){
  const hud=document.getElementById('hud'); if(!hud) return;
  hud.textContent = state.mode==='galaxy'
    ? `Зум: ${state.transform.scale.toFixed(2)} | смещение: (${state.transform.x.toFixed(0)}, ${state.transform.y.toFixed(0)}) | сектора: ${state.sectors.length} | системы: ${state.systems.length}`
    : `Сцена: система | зум: ${state.transform.scale.toFixed(2)}`;
  const dbg=document.getElementById('dbg');
  if(dbg&&state.mouse){ const {x,y}=state.mouseWorld||{x:0,y:0}; dbg.textContent=`x: ${Math.round(x)}, y: ${Math.round(y)}, z: ${state.transform.scale.toFixed(2)}`; }
}
