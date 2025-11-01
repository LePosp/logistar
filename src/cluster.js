import * as cfg from './config.js';

export function computeClusters(state){
  const cell = cfg.CLUSTER_CELL_PX;
  const map = new Map();
  for(const s of state.systems){
    const sx = (s.x + state.transform.x)*state.transform.scale;
    const sy = (s.y + state.transform.y)*state.transform.scale;
    const ix = Math.floor(sx / cell), iy = Math.floor(sy / cell);
    const key = ix + ':' + iy;
    let c = map.get(key);
    if(!c) { c = { ix, iy, sx:0, sy:0, wx:0, wy:0, count:0, mining:0, gas:0, hub:0 }; map.set(key, c); }
    c.sx += sx; c.sy += sy; c.wx += s.x; c.wy += s.y; c.count++;
    if(s.type==='mining') c.mining++; else if(s.type==='gas') c.gas++; else c.hub++;
  }
  const arr=[];
  for(const c of map.values()){
    const type = c.mining>c.gas && c.mining>c.hub ? 'mining' : (c.gas>c.hub ? 'gas' : 'hub');
    arr.push({ sx:c.sx/c.count, sy:c.sy/c.count, wx:c.wx/c.count, wy:c.wy/c.count, count:c.count, type });
  }
  return arr;
}
