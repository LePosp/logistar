import { SECTOR_COUNT, SECTOR_RADIUS, BOUNDARY_STEPS, OUTER_ARC_STEPS, BOUNDARY_CURVE_AMPL, RADIAL_WIGGLE } from './config.js';
import { CORE_RADIUS } from './config.js';

// гладкий, но общий для соседей изгиб границ
function boundaryPoint(k, t){
  // базовые углы для границы между секторами k и k+1
  const a0 = (k    ) * (Math.PI*2/SECTOR_COUNT);
  const a1 = (k + 1) * (Math.PI*2/SECTOR_COUNT);
  // кривизна угла (одинакова для обеих областей)
  const bend = Math.sin(t*Math.PI*2 + k*0.9)*0.5 + Math.cos(t*3.1 + k*0.2)*0.5;
  const phi  = a0*(1-t) + a1*t + bend * (a1-a0) * BOUNDARY_CURVE_AMPL;
  // общий для всех границ радиус (чтобы стык совпадал)
  const wr   = (Math.sin((t+k*0.77)*4.0) + Math.cos((t*1.7+k*0.31)*3.0)) * 0.5 * RADIAL_WIGGLE;
  const r    = (t + wr) * SECTOR_RADIUS;
  return { x: Math.cos(phi)*r, y: Math.sin(phi)*r };
}

export function sectors(){
  const N=SECTOR_COUNT;
  // общие массивы точек для каждой границы
  const borders = Array.from({length:N}, (_,k)=>{
    const pts=[]; for(let i=0;i<=BOUNDARY_STEPS;i++){ const t=i/BOUNDARY_STEPS; pts.push(boundaryPoint(k,t)); }
    return pts;
  });

  function outerAt(angle){ return { x: Math.cos(angle)*SECTOR_RADIUS, y: Math.sin(angle)*SECTOR_RADIUS }; }

  const secs=[];
  for(let k=0;k<N;k++){
    const left  = borders[k];
    const right = borders[(k+1)%N];
    const poly=[];
    // левая граница от центра к краю
    for(const p of left) poly.push(p);
    // внешняя дуга между концами левой/правой
    const a0 = k    * (Math.PI*2/N);
    const a1 = (k+1)* (Math.PI*2/N);
    for(let i=1;i<=OUTER_ARC_STEPS;i++){
      const tt=i/OUTER_ARC_STEPS; const ang=a0*(1-tt)+a1*tt;
      poly.push(outerAt(ang));
    }
    // правая граница обратно к центру
    for(let i=right.length-2;i>=0;i--) poly.push(right[i]);

    secs.push({ name:`Сектор ${k}`, center: centroid(poly), poly });
  }
  return secs;
}

function centroid(poly){
  // polygon centroid (area-weighted). Works for non-self-intersecting polygons.
  let area = 0, cx = 0, cy = 0;
  for (let i = 0, n = poly.length, j = n - 1; i < n; j = i++) {
    const xi = poly[i].x, yi = poly[i].y;
    const xj = poly[j].x, yj = poly[j].y;
    const a = xj * yi - xi * yj;
    area += a;
    cx += (xj + xi) * a;
    cy += (yj + yi) * a;
  }
  if (Math.abs(area) < 1e-6) {
    // fallback to simple average
    let sx=0, sy=0;
    for(const p of poly){ sx+=p.x; sy+=p.y; }
    return { x: sx/poly.length, y: sy/poly.length };
  }
  area *= 0.5;
  return { x: cx / (6 * area), y: cy / (6 * area) };
}

// больше систем, не в ядре
export function systems(){
  const out=[]; const rng=mulberry32(42);
  const total=900;
  for(let i=0;i<total;i++){
    const r = lerp(380, SECTOR_RADIUS-80, rng());
    const a = rng()*Math.PI*2;
    const x = Math.cos(a)*r, y=Math.sin(a)*r;
    if(x*x+y*y<CORE_RADIUS*CORE_RADIUS) continue;
    const t=rng(); const type=t<0.33?'mining':(t<0.66?'gas':'hub');
    out.push({ id:`sys_${i}`, name:`Система ${i}`, x,y,type });
  }
  return out;
}

// utils
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;};}
function lerp(a,b,t){return a+(b-a)*t;}
