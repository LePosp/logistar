
import { R1,R2,N1,N2,BOUND,SEED,SYS } from './config.js';
import { prng, r01 } from './rng.js';
import { voronoi } from './voronoi.js';
import { randIn } from './geometry.js';
export function sites(){
  const a=[];
  for(let i=0;i<N1;i++){ const t=i/N1*Math.PI*2; a.push({x:Math.cos(t)*R1,y:Math.sin(t)*R1}); }
  for(let i=0;i<N2;i++){ const t=i/N2*Math.PI*2+Math.PI/N2; a.push({x:Math.cos(t)*R2,y:Math.sin(t)*R2}); }
  return a;
}
export function border(n=96){ const p=[]; for(let i=0;i<n;i++){const t=i/n*Math.PI*2; p.push({x:Math.cos(t)*BOUND,y:Math.sin(t)*BOUND});} return p; }
export function sectors(){ return voronoi(sites(), border()); }
export function bounds(secs){
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  for(const s of secs) for(const v of s.poly){ minX=Math.min(minX,v.x); minY=Math.min(minY,v.y); maxX=Math.max(maxX,v.x); maxY=Math.max(maxY,v.y); }
  return {minX,minY,maxX,maxY};
}
export function systems(secs){
  const rnd=prng(SEED); const out=[]; let id=0;
  for(const s of secs){
    const cnt=SYS[0]+Math.floor(r01(rnd)*(SYS[1]-SYS[0]+1));
    for(let i=0;i<cnt;i++){
      const p=randIn(s.poly,rnd,r01);
      const t=r01(rnd); const type=t<.34?'mining':(t<.67?'gas':'hub');
      out.push({id:'SYS'+id++,name:'Система '+id,sector:s.id,x:p.x,y:p.y,type});
    }
  }
  return out;
}
