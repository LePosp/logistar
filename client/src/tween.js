export function tween(from,to,ms,ease,step,done){
  const t0=performance.now();
  function loop(now){
    const k=Math.min(1,(now-t0)/ms);
    const v = {}; for(const key in to){ const a=from[key], b=to[key]; v[key]=a+(b-a)*ease(k); }
    step(v,k);
    if(k<1) requestAnimationFrame(loop); else done&&done();
  }
  requestAnimationFrame(loop);
}
export const easeOutCubic = t=>1-Math.pow(1-t,3);
export const easeInOutQuad = t=> t<.5 ? 2*t*t : 1 - Math.pow(-2*t+2,2)/2;
