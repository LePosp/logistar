export function parseHash(){
  const h = (location.hash||'').replace(/^#/,'').trim();
  if(!h || h==='/' || h==='galaxy' || h==='/galaxy') return {route:'galaxy'};
  const m = h.match(/^\\/?system\\/(.+)$/);
  if(m) return {route:'system', id:m[1]};
  return {route:'galaxy'};
}
export function toGalaxy(){ location.hash = '#/galaxy'; }
export function toSystem(id){ location.hash = '#/system/'+id; }
export function onRoute(cb){ window.addEventListener('hashchange', ()=>cb(parseHash())); cb(parseHash()); }
