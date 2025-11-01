
import { dot, clip } from './geometry.js';
export function voronoi(sites,border){
  const cells=[];
  for(let i=0;i<sites.length;i++){
    const A=sites[i]; let cell=border.slice();
    for(let j=0;j<sites.length;j++){ if(i===j) continue;
      const B=sites[j], n={x:B.x-A.x,y:B.y-A.y}, c=(dot(B,B)-dot(A,A))*0.5;
      cell=clip(cell,n,c); if(!cell.length) break;
    }
    if(cell.length){
      let cx=0,cy=0; for(const v of cell){cx+=v.x;cy+=v.y;} cx/=cell.length; cy/=cell.length;
      cells.push({id:'S'+i,name:'Сектор '+i,poly:cell,center:{x:cx,y:cy}});
    }
  }
  return cells;
}
