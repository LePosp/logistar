export const dot = (p,q)=> p.x*q.x + p.y*q.y;

// Отсечение полигона полуплоскостью n·x <= c
export function clipPolyHalfPlane(poly, n, c){
  if (!poly.length) return poly;
  const out = [];
  for (let i=0;i<poly.length;i++){
    const a = poly[i];
    const b = poly[(i+1)%poly.length];
    const fa = (a.x*n.x + a.y*n.y) - c;
    const fb = (b.x*n.x + b.y*n.y) - c;
    const ain = fa <= 1e-9, bin = fb <= 1e-9;
    if (ain && bin){
      out.push(b);
    } else if (ain && !bin){
      const d = { x:b.x-a.x, y:b.y-a.y };
      const t = (c - (a.x*n.x + a.y*n.y)) / (d.x*n.x + d.y*n.y);
      out.push({ x:a.x + d.x*t, y:a.y + d.y*t });
    } else if (!ain && bin){
      const d = { x:b.x-a.x, y:b.y-a.y };
      const t = (c - (a.x*n.x + a.y*n.y)) / (d.x*n.x + d.y*n.y);
      out.push({ x:a.x + d.x*t, y:a.y + d.y*t });
      out.push(b);
    }
  }
  return out;
}

export function pointInPoly(pt, poly){
  let c=false;
  for(let i=0,j=poly.length-1;i<poly.length;j=i++){
    const xi=poly[i].x, yi=poly[i].y, xj=poly[j].x, yj=poly[j].y;
    const inter = ((yi>pt.y)!=(yj>pt.y)) && (pt.x < (xj-xi)*(pt.y-yi)/(yj-yi+1e-9) + xi);
    if (inter) c=!c;
  }
  return c;
}

export function randomPointInPoly(poly, rnd, rand01){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const v of poly){
    if(v.x<minX)minX=v.x; if(v.y<minY)minY=v.y; if(v.x>maxX)maxX=v.x; if(v.y>maxY)maxY=v.y;
  }
  for(let k=0;k<2000;k++){
    const x=minX + rand01(rnd)*(maxX-minX);
    const y=minY + rand01(rnd)*(maxY-minY);
    if (pointInPoly({x,y}, poly)) return {x,y};
  }
  return { x:(minX+maxX)/2, y:(minY+maxY)/2 };
}
