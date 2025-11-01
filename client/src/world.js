import * as cfg from './config.js';
import { prng, rand01 } from './rng.js';
import { randomPointInPoly } from './geometry.js';
import { buildVoronoiSectors } from './voronoi.js';

export function buildSites(){
  const sites = [];
  for (let i=0;i<cfg.RING1_COUNT;i++){
    const a = (i/cfg.RING1_COUNT)*Math.PI*2;
    sites.push({ x: Math.cos(a)*cfg.RING1_R, y: Math.sin(a)*cfg.RING1_R, id:i });
  }
  for (let i=0;i<cfg.RING2_COUNT;i++){
    const a = (i/cfg.RING2_COUNT)*Math.PI*2 + (Math.PI/cfg.RING2_COUNT);
    sites.push({ x: Math.cos(a)*cfg.RING2_R, y: Math.sin(a)*cfg.RING2_R, id:cfg.RING1_COUNT+i });
  }
  return sites;
}

export function buildBorder(segs=96){
  const poly = [];
  for (let i=0;i<segs;i++){
    const t = (i/segs)*Math.PI*2;
    poly.push({ x: Math.cos(t)*cfg.BOUND_R, y: Math.sin(t)*cfg.BOUND_R });
  }
  return poly;
}

export function buildSectors(sites, border){
  return buildVoronoiSectors(sites, border);
}

export function boundsOfSectors(secs){
  let minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  for (const s of secs){
    for (const v of s.poly){
      if(v.x<minX)minX=v.x; if(v.y<minY)minY=v.y;
      if(v.x>maxX)maxX=v.x; if(v.y>maxY)maxY=v.y;
    }
  }
  return {minX,minY,maxX,maxY, width:maxX-minX, height:maxY-minY, cx:(minX+maxX)/2, cy:(minY+maxY)/2};
}

export function buildSystems(sectors){
  const rng = prng(cfg.SEED);
  const systems = [];
  let sysId=0;
  for (const sec of sectors){
    const min = cfg.SYSTEMS_PER_SECTOR[0], max = cfg.SYSTEMS_PER_SECTOR[1];
    const count = min + Math.floor(rand01(rng) * (max-min+1));
    for (let i=0;i<count;i++){
      const p = randomPointInPoly(sec.poly, rng, rand01);
      const t = rand01(rng);
      const type = t<0.34 ? 'mining' : (t<0.67 ? 'gas' : 'hub');
      systems.push({ id:`SYS${sysId++}`, name:`Система ${sysId}`, sectorId: sec.id, x:p.x, y:p.y, type });
    }
  }
  return systems;
}
