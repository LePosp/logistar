import { dot, clipPolyHalfPlane } from './geometry.js';

export function buildVoronoiSectors(sites, borderPoly){
  const cells = [];
  for (let i=0;i<sites.length;i++){
    const A = sites[i];
    let cell = borderPoly.slice();
    for (let j=0;j<sites.length;j++){
      if (i===j) continue;
      const B = sites[j];
      const n = { x: B.x - A.x, y: B.y - A.y };
      const c = (dot(B,B) - dot(A,A)) * 0.5;
      cell = clipPolyHalfPlane(cell, n, c);
      if (!cell.length) break;
    }
    if (cell.length){
      let cx=0, cy=0; for(const v of cell){ cx+=v.x; cy+=v.y; } cx/=cell.length; cy/=cell.length;
      cells.push({ id:`S${i}`, name:`Сектор ${i}`, poly:cell, center:{x:cx,y:cy} });
    }
  }
  return cells;
}
