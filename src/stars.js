import { worldToScreen } from './camera.js';

function fract(n){ return n - Math.floor(n); }
function hash(x,y){ return fract(Math.sin(x*127.1 + y*311.7) * 43758.5453); }

function drawScreenStars(ctx, state, step, alpha, size, offsetFactor){
  const canvas = state.canvas;
  const cols = Math.ceil(canvas.width / step) + 2;
  const rows = Math.ceil(canvas.height / step) + 2;
  const offX = (state.transform.x * offsetFactor) % step;
  const offY = (state.transform.y * offsetFactor) % step;
  ctx.save(); ctx.globalAlpha = alpha; ctx.fillStyle = '#dfe8ff';
  for(let iy=-1; iy<rows; iy++){
    for(let ix=-1; ix<cols; ix++){
      const jx = hash(ix + Math.floor(state.transform.x), iy + Math.floor(state.transform.y));
      const jy = hash(ix + 17 + Math.floor(state.transform.x), iy + 29 + Math.floor(state.transform.y));
      const x = ix*step + jx*step + offX;
      const y = iy*step + jy*step + offY;
      ctx.fillRect(x, y, size, size);
    }
  }
  ctx.restore();
}

export function initStars(state){
  const w = state.worldBounds;
  function gen(n){
    const a=[];
    for(let i=0;i<n;i++){
      a.push({x:(Math.random()-0.5)*w.width*1.5, y:(Math.random()-0.5)*w.height*1.5});
    }
    return a;
  }
  state.worldStarsFar = gen(1600);
  state.worldStarsNear = gen(700);
}

function drawWorldStars(ctx, state){
  const canvas = state.canvas;
  const viewW = canvas.width/state.transform.scale, viewH = canvas.height/state.transform.scale;
  const viewX = -state.transform.x, viewY = -state.transform.y;
  ctx.save();
  ctx.globalAlpha = 0.25;
  for(const s of state.worldStarsFar){
    if(s.x < viewX-200 || s.x > viewX+viewW+200 || s.y < viewY-200 || s.y > viewY+viewH+200) continue;
    const p = worldToScreen(state, s.x, s.y);
    ctx.fillStyle = '#cfe0ff'; ctx.fillRect(p.x, p.y, 1, 1);
  }
  ctx.globalAlpha = 0.5;
  for(const s of state.worldStarsNear){
    if(s.x < viewX-200 || s.x > viewX+viewW+200 || s.y < viewY-200 || s.y > viewY+viewH+200) continue;
    const p = worldToScreen(state, s.x, s.y);
    ctx.fillStyle = '#f2f6ff'; ctx.fillRect(p.x, p.y, 1.2, 1.2);
  }
  ctx.restore();
}

function drawCore(ctx, state){
  const p = worldToScreen(state, 0,0);
  const baseR = 900 * state.transform.scale;
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  let g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR*2.2);
  g.addColorStop(0, 'rgba(240,248,255,0.07)');
  g.addColorStop(1, 'rgba(240,248,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, baseR*2.2, 0, Math.PI*2); ctx.fill();
  g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR*1.3);
  g.addColorStop(0, 'rgba(200,230,255,0.12)');
  g.addColorStop(1, 'rgba(200,230,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, baseR*1.3, 0, Math.PI*2); ctx.fill();
  g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, baseR*0.6);
  g.addColorStop(0, 'rgba(255,255,255,0.25)');
  g.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(p.x, p.y, baseR*0.6, 0, Math.PI*2); ctx.fill();
  ctx.restore();
}

export function drawBackground(ctx, state){
  // градиентный фон
  const g = ctx.createLinearGradient(0,0,0,state.canvas.height);
  g.addColorStop(0,'#07111a'); g.addColorStop(1,'#0c1016');
  ctx.fillStyle = g; ctx.fillRect(0,0,state.canvas.width, state.canvas.height);
  // экранные звезды
  drawScreenStars(ctx, state, 100, 0.28, 1, 0.20);
  drawScreenStars(ctx, state, 60,  0.35, 1.2, 0.30);
  // мировые звезды и ядро
  drawWorldStars(ctx, state);
  drawCore(ctx, state);
}
