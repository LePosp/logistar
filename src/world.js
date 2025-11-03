
import { CORE_RADIUS, SECTOR_COUNT, SECTOR_RADIUS, RADIAL_SEGMENTS, RADIAL_WIGGLE } from './config.js';

// Сектора — круглая галактика, границы соприкасаются, радиальные рёбра «неровные» (совпадают у соседей)
export function sectors(){
  const N = SECTOR_COUNT;
  const R = SECTOR_RADIUS;
  const dTheta = (Math.PI*2)/N;
  // сгенерим «неровные» радиальные ребра, которые шарятся между секторами
  const radial = [];
  for(let k=0;k<N;k++){
    const ang = k*dTheta;
    const pts = [{x:0,y:0}];
    for(let i=1;i<=RADIAL_SEGMENTS;i++){
      const t=i/RADIAL_SEGMENTS;
      const rr = R * (t + (Math.sin((t+0.23*k)*Math.PI*2)*0.5 + Math.cos((t*1.7+0.11*k)*Math.PI)*0.5) * RADIAL_WIGGLE * (1.0 - 0.6*t));
      const x = Math.cos(ang) * rr;
      const y = Math.sin(ang) * rr;
      pts.push({x,y});
    }
    radial.push(pts);
  }
  // соберём полигоны секторов: радиальная грань k -> дуга -> радиальная грань (k+1) назад
  const sectors = [];
  for(let k=0;k<N;k++){
    const a0 = k*dTheta, a1 = (k+1)*dTheta;
    const poly = [];
    // радиальная грань k
    for(const p of radial[k]) poly.push(p);
    // дуга внешняя: аккуратная дуга окружности (общая для соседей)
    const ARC_STEPS = 5;
    for(let i=1;i<=ARC_STEPS;i++){
      const tt = i/ARC_STEPS;
      const aa = a0*(1-tt) + a1*tt;
      poly.push({ x: Math.cos(aa)*R, y: Math.sin(aa)*R });
    }
    // радиальная грань k+1 назад
    const next = radial[(k+1)%N];
    for(let i=next.length-2; i>=0; i--) poly.push(next[i]);
    sectors.push({ name:`Сектор ${k}`, center: midPoint(poly), poly });
  }
  return sectors;
}

function midPoint(poly){
  let x=0,y=0; for(const p of poly){x+=p.x;y+=p.y;} return {x:x/poly.length, y:y/poly.length};
}

export function bounds(sectors){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for(const s of sectors){
    for(const p of s.poly){
      if(p.x<minX)minX=p.x; if(p.y<minY)minY=p.y;
      if(p.x>maxX)maxX=p.x; if(p.y>maxY)maxY=p.y;
    }
  }
  const pad=800;
  return {minX:minX-pad, minY:minY-pad, maxX:maxX+pad, maxY:maxY+pad};
}

export function systems(){
  // БОЛЬШЕ систем в круге, исключая ядро
  const out=[]; const rng=mulberry32(987654);
  const N=600;
  for(let i=0;i<N;i++){
    const r = randBetween(rng, 400, SECTOR_RADIUS-80);
    const a = randBetween(rng, 0, Math.PI*2);
    const x = Math.cos(a)*r, y = Math.sin(a)*r;
    if(x*x+y*y<CORE_RADIUS*CORE_RADIUS) continue;
    const t=rng(); const type = t<0.33?'mining':(t<0.66?'gas':'hub');
    out.push({ id:`sys_${i}`, name:`Система ${i}`, x,y,type });
  }
  return out;
}

// --- tiny RNG
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
function randBetween(r, lo, hi){return lo + (hi-lo)*r();}
