import { CORE_RADIUS, SECTOR_COUNT, SECTOR_RADIUS, RADIAL_SEGMENTS, RADIAL_WIGGLE, ARC_WIGGLE_AMPL } from './config.js';

// единая функция «волнистой» дуги — чтобы соседние сектора совпадали по границе
function arcRadius(theta){
  const a1 = Math.sin(theta*3.0 + 0.7)*0.5 + Math.cos(theta*1.6 - 0.3)*0.5;
  const a2 = Math.sin(theta*5.2 + 1.1)*0.5 + Math.cos(theta*2.9 + 0.4)*0.5;
  return SECTOR_RADIUS * (1 + ARC_WIGGLE_AMPL * 0.5*(a1*0.6 + a2*0.4));
}

export function sectors(){
  const N = SECTOR_COUNT;
  const dA = (Math.PI*2)/N;
  const radial = [];
  for(let k=0;k<N;k++){
    const ang = k*dA;
    const pts = [{x:0,y:0}];
    for(let i=1;i<=RADIAL_SEGMENTS;i++){
      const t=i/RADIAL_SEGMENTS;
      const wob = (Math.sin((t+0.23*k)*Math.PI*2)*0.5 + Math.cos((t*1.7+0.11*k)*Math.PI)*0.5) * RADIAL_WIGGLE * (1.0 - 0.55*t);
      const rr = (t + wob) * arcRadius(ang);
      pts.push({x: Math.cos(ang)*rr, y: Math.sin(ang)*rr});
    }
    radial.push(pts);
  }
  const secs=[];
  for(let k=0;k<N;k++){
    const a0=k*dA, a1=(k+1)*dA;
    const poly=[];
    for(const p of radial[k]) poly.push(p);
    const ARC_STEPS=6;
    for(let i=1;i<=ARC_STEPS;i++){
      const tt=i/ARC_STEPS, th=a0*(1-tt)+a1*tt, r=arcRadius(th);
      poly.push({x:Math.cos(th)*r, y:Math.sin(th)*r});
    }
    const next=radial[(k+1)%N];
    for(let i=next.length-2;i>=0;i--) poly.push(next[i]);
    secs.push({name:`Сектор ${k}`, center: mid(poly), poly});
  }
  return secs;
}
function mid(poly){ let x=0,y=0; for(const p of poly){x+=p.x;y+=p.y;} return {x:x/poly.length, y:y/poly.length}; }

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
  const out=[]; const rng=mulberry32(987654);
  const N=700; // больше систем
  for(let i=0;i<N;i++){
    const r = randBetween(rng, 380, SECTOR_RADIUS-60);
    const a = randBetween(rng, 0, Math.PI*2);
    const x = Math.cos(a)*r, y = Math.sin(a)*r;
    if(x*x+y*y<CORE_RADIUS*CORE_RADIUS) continue; // пустое ядро
    const t=rng(); const type = t<0.33?'mining':(t<0.66?'gas':'hub');
    out.push({ id:`sys_${i}`, name:`Система ${i}`, x,y,type });
  }
  return out;
}
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
function randBetween(r, lo, hi){return lo + (hi-lo)*r();}
