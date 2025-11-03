import { STAR_TILE, STAR_LAYERS, GALAXY_RADIUS, CORE_RADIUS } from './config.js';
import { w2s } from './camera.js';

function lcg(seed){ let s=seed>>>0 || 1; return ()=> (s = (s*1664525 + 1013904223) >>> 0); }
function fr(r){ return r()/0xffffffff; }

// Caching offscreen backgrounds to avoid flicker / per-frame RNG
let _galaxyCache = null, _galaxySize = {w:0,h:0};
let _systemCache = null, _systemSize = {w:0,h:0};

export function galaxyBackground(ctx,st){
  const rect = ctx.canvas.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));

  if (!_galaxyCache || _galaxySize.w !== w || _galaxySize.h !== h){
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const oc = off.getContext('2d');
    // base fill
    oc.save();
    oc.fillStyle='#0b1017';
    oc.fillRect(0,0,w,h);
    oc.restore();

    // draw stable stars layer relative to world origin (we will offset at draw time via w2s)
    // We'll render stars anchored to canvas center as if st.t.x=0/st.t.y=0; final placement uses w2s
    for(const layer of STAR_LAYERS){
      for(let ix= -2; ix<=2; ix++){
        for(let iy=-2; iy<=2; iy++){
          const seed=((ix*73856093) ^ (iy*19349663) ^ (layer.seed*83492791))>>>0;
          const rnd=lcg(seed);
          for(let i=0;i<layer.count;i++){
            const rx=fr(rnd), ry=fr(rnd), rs=fr(rnd);
            const wx=ix*STAR_TILE + rx*STAR_TILE;
            const wy=iy*STAR_TILE + ry*STAR_TILE;
            const dist=Math.hypot(wx,wy);
            if(dist < CORE_RADIUS*1.05) continue;
            const fade = 0.85 + 0.35*Math.max(0,1.0 - (dist/GALAXY_RADIUS));
            const size=layer.size[0] + (layer.size[1]-layer.size[0])*rs;
            const a=layer.alpha*fade;
            // place relative to center of offscreen (we'll actually draw using w2s when rendering main canvas)
            const px = Math.floor(w/2 + wx);
            const py = Math.floor(h/2 + wy);
            oc.globalAlpha = a;
            oc.fillStyle = '#cfe2ff';
            oc.fillRect(px,py,size,size);
          }
        }
      }
    }

    // radial glow (drawn in device pixels)
    const coreX = w/2, coreY = h/2;
    const R = Math.max(w, h) * 0.85;
    const g = oc.createRadialGradient(coreX,coreY,0, coreX,coreY,R);
    g.addColorStop(0.00, 'rgba(255,240,220,0.30)');
    g.addColorStop(0.18, 'rgba(255,240,220,0.18)');
    g.addColorStop(0.45, 'rgba(220,230,255,0.08)');
    g.addColorStop(1.00, 'rgba(0,0,0,0)');
    oc.fillStyle = g;
    oc.globalCompositeOperation = 'lighter';
    oc.fillRect(0,0,w,h);
    oc.globalCompositeOperation = 'source-over';

    _galaxyCache = off;
    _galaxySize = {w,h};
  }

  // draw cached background scaled to actual canvas (ctx canvas is in device px)
  ctx.drawImage(_galaxyCache, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

export function systemBackground(ctx){
  const rect = ctx.canvas.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  const w = Math.max(1, Math.floor(rect.width * dpr));
  const h = Math.max(1, Math.floor(rect.height * dpr));

  if (!_systemCache || _systemSize.w !== w || _systemSize.h !== h){
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const oc = off.getContext('2d');
    oc.fillStyle='#0b1017'; oc.fillRect(0,0,w,h);
    oc.globalAlpha=0.25; oc.fillStyle='#d6e3ff';
    // stable seeded dots
    const rng = mulberry32(98765);
    for(let i=0;i<120;i++){ const x=rng()*w, y=rng()*h; oc.fillRect(x,y,1,1); }
    oc.globalAlpha=1;
    _systemCache = off; _systemSize = {w,h};
  }

  ctx.drawImage(_systemCache, 0, 0, ctx.canvas.width, ctx.canvas.height);
}

// small PRNG for stable system background
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
