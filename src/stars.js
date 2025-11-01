
import { STAR_TILE, STAR_LAYERS, GALAXY_RADIUS } from './config.js';
import { w2s } from './camera.js';

function lcg(seed){ let s=seed>>>0 || 1; return ()=> (s = (s*1664525 + 1013904223) >>> 0); }
function fr(r){ return r()/0xffffffff; }

function coreGradient(ctx){
  const cx=innerWidth/2, cy=innerHeight/2;
  const R=Math.max(innerWidth, innerHeight)*0.75;
  const g=ctx.createRadialGradient(cx,cy,0,cx,cy,R);
  g.addColorStop(0.0, 'rgba(220,230,255,0.08)');
  g.addColorStop(0.4, 'rgba(180,200,255,0.05)');
  g.addColorStop(1.0, 'rgba(0,0,0,0)');
  ctx.fillStyle=g; ctx.fillRect(0,0,innerWidth,innerHeight);
}

export function background(ctx,st){
  ctx.save(); ctx.fillStyle='#0b1017'; ctx.fillRect(0,0,innerWidth,innerHeight); ctx.restore();
  // compute visible world rect
  const tl = { x: -st.t.x, y: -st.t.y };
  const br = { x: (innerWidth/st.t.scale) - st.t.x, y: (innerHeight/st.t.scale) - st.t.y };
  const ix0=Math.floor(tl.x/STAR_TILE)-1, iy0=Math.floor(tl.y/STAR_TILE)-1;
  const ix1=Math.floor(br.x/STAR_TILE)+1, iy1=Math.floor(br.y/STAR_TILE)+1;
  ctx.save();
  for(const layer of STAR_LAYERS){
    for(let ix=ix0; ix<=ix1; ix++){
      for(let iy=iy0; iy<=iy1; iy++){
        const seed=((ix*73856093) ^ (iy*19349663) ^ (layer.seed*83492791))>>>0;
        const rnd=lcg(seed);
        for(let i=0;i<layer.count;i++){
          const rx=fr(rnd), ry=fr(rnd), rs=fr(rnd);
          const wx=ix*STAR_TILE + rx*STAR_TILE;
          const wy=iy*STAR_TILE + ry*STAR_TILE;
          const dist=Math.hypot(wx,wy);
          const fall = 0.85 + 0.35*Math.max(0,1.0 - (dist/GALAXY_RADIUS));
          const size=layer.size[0] + (layer.size[1]-layer.size[0])*rs;
          const a=layer.alpha*fall;
          const p=w2s(st,wx,wy);
          ctx.globalAlpha=a; ctx.fillStyle='#cfe2ff'; ctx.fillRect(p.x,p.y,size,size);
        }
      }
    }
  }
  ctx.restore();
  coreGradient(ctx);
}
