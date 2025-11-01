
import { CORE_RADIUS } from './config.js';

// "Ромбические" сектора вокруг центра (красиво смыкаются)
export function sectors(){
  const size=2600; // диаметр ромба
  const half=size/2;
  const centers=[
    {x:0,y:0}, {x:size,y:0}, {x:-size,y:0}, {x:0,y:size}, {x:0,y:-size},
    {x:size,y:size}, {x:-size,y:size}, {x:size,y:-size}, {x:-size,y:-size}
  ];
  return centers.map((c,i)=>{
    const poly=[
      {x:c.x, y:c.y-half}, {x:c.x+half, y:c.y}, {x:c.x, y:c.y+half}, {x:c.x-half, y:c.y}
    ];
    return { name:`Сектор ${i}`, center:c, poly };
  });
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

export function systems(sectors){
  // Сгенерим около 160 систем вокруг центра, исключая ядро
  const out=[]; const rng=mulberry32(123456);
  const N=160;
  for(let i=0;i<N;i++){
    const r=randBetween(rng, 600, 6400);
    const a=randBetween(rng, 0, Math.PI*2);
    const x=Math.cos(a)*r, y=Math.sin(a)*r;
    if(x*x+y*y<CORE_RADIUS*CORE_RADIUS) continue;
    const t=rng(); const type = t<0.33?'mining':(t<0.66?'gas':'hub');
    out.push({ id:`sys_${i}`, name:`Система ${i}`, x,y,type });
  }
  return out;
}

// --- tiny RNG
function mulberry32(a){return function(){let t=a+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return((t^t>>>14)>>>0)/4294967296;}}
function randBetween(r, lo, hi){return lo + (hi-lo)*r();}
