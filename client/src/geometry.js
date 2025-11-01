
export const dot=(a,b)=>a.x*b.x+a.y*b.y;
export function clip(poly,n,c){
  if(!poly.length)return poly; const out=[];
  for(let i=0;i<poly.length;i++){
    const A=poly[i], B=poly[(i+1)%poly.length];
    const fa=A.x*n.x+A.y*n.y-c, fb=B.x*n.x+B.y*n.y-c;
    const ain=fa<=1e-9, bin=fb<=1e-9;
    if(ain&&bin) out.push(B);
    else if(ain&&!bin){ const d={x:B.x-A.x,y:B.y-A.y}; const t=(c-(A.x*n.x+A.y*n.y))/(d.x*n.x+d.y*n.y); out.push({x:A.x+d.x*t,y:A.y+d.y*t}); }
    else if(!ain&&bin){ const d={x:B.x-A.x,y:B.y-A.y}; const t=(c-(A.x*n.x+A.y*n.y))/(d.x*n.x+d.y*n.y); out.push({x:A.x+d.x*t,y:A.y+d.y*t}); out.push(B); }
  }
  return out;
}
export function inPoly(p,poly){
  let c=false; for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const A=poly[i],B=poly[j];
    const inter=((A.y>p.y)!=(B.y>p.y))&&(p.x<(B.x-A.x)*(p.y-A.y)/(B.y-A.y+1e-9)+A.x);
    if(inter) c=!c;
  } return c;
}
export function randIn(poly, rnd, r01){
  let minX=1e9,minY=1e9,maxX=-1e9,maxY=-1e9;
  for(const v of poly){minX=Math.min(minX,v.x);minY=Math.min(minY,v.y);maxX=Math.max(maxX,v.x);maxY=Math.max(maxY,v.y);}
  for(let k=0;k<1000;k++){ const x=minX+r01(rnd)*(maxX-minX), y=minY+r01(rnd)*(maxY-minY); if(inPoly({x,y},poly)) return {x,y}; }
  return {x:(minX+maxX)/2,y:(minY+maxY)/2};
}
