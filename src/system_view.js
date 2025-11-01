import { worldToScreen } from './camera.js';
import { prng, rand01 } from './rng.js';

function hashId(id){ let h=0; for(let i=0;i<id.length;i++){ h = (h*131 + id.charCodeAt(i))>>>0; } return h||1; }

export function generateSystem(id){
  const r = prng(hashId(id));
  const planets = [];
  const n = 3 + Math.floor(rand01(r)*5); // 3..7
  for(let i=0;i<n;i++){
    const dist = 260 + i*170 + rand01(r)*50;
    const size = 9 + rand01(r)*14;
    const typeRnd = rand01(r);
    const type = typeRnd<0.35 ? 'terra' : (typeRnd<0.7 ? 'gas' : 'rock');
    planets.push({ name:`P${i+1}`, dist, size, type, angle: rand01(r)*Math.PI*2, speed: (0.3 + rand01(r)*0.6) / (i+1) });
  }
  return { starColor:'#ffdca8', planets };
}

export function drawSystem(ctx,state,dt){
  const p = worldToScreen(state,0,0);
  const R = 60 * state.transform.scale;
  ctx.save();
  ctx.globalCompositeOperation='lighter';
  let g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R*6);
  g.addColorStop(0,'rgba(255,230,180,0.15)'); g.addColorStop(1,'rgba(255,230,180,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,R*6,0,Math.PI*2); ctx.fill();
  g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R*2.5);
  g.addColorStop(0,'rgba(255,240,200,0.35)'); g.addColorStop(1,'rgba(255,240,200,0)');
  ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,R*2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x,p.y,R,0,Math.PI*2); ctx.fillStyle='#ffdca8'; ctx.fill();
  ctx.restore();

  ctx.save();
  ctx.strokeStyle='rgba(180,200,230,0.25)'; ctx.lineWidth=Math.max(1, 1.5*state.transform.scale);
  for(const pl of state.system.planets){
    pl.angle += pl.speed * dt * 0.001;
    const wp = { x: Math.cos(pl.angle)*pl.dist, y: Math.sin(pl.angle)*pl.dist };
    const sp = worldToScreen(state, wp.x, wp.y);
    const or = pl.dist * state.transform.scale;
    ctx.beginPath(); ctx.arc(p.x,p.y,or,0,Math.PI*2); ctx.stroke();
    ctx.beginPath(); ctx.arc(sp.x, sp.y, Math.max(2.5, pl.size*state.transform.scale*0.5), 0, Math.PI*2);
    ctx.fillStyle = pl.type==='terra' ? '#a2d0ff' : (pl.type==='gas' ? '#9be0ff' : '#c9c1b6');
    ctx.fill();
  }
  ctx.restore();
}
