
function seedFrom(id){ let h=0; for(let i=0;i<id.length;i++){ h=(h*131 + id.charCodeAt(i))>>>0; } return (h||1)>>>0; }
function prng(s){ s=s%2147483647; if(s<=0)s+=2147483646; return ()=> s=s*16807%2147483647; }
const r01 = n => n()/2147483647;
export function generateSystem(id){
  const rnd=prng(seedFrom(id)); const planets=[]; const n=3+Math.floor(r01(rnd)*5);
  for(let i=0;i<n;i++){ const dist=260+i*170+r01(rnd)*50, size=9+r01(rnd)*14; const t=r01(rnd); const type=t<.35?'terra':(t<.7?'gas':'rock'); planets.push({name:'P'+(i+1),dist,size,type,angle:r01(rnd)*Math.PI*2,speed:(0.3+r01(rnd)*0.6)/(i+1)}); }
  return { starColor:'#ffdca8', planets };
}
export function drawSystem(ctx,st,dt){
  const p={x:(innerWidth/2), y:(innerHeight/2)}, R=60*st.t.scale;
  ctx.save(); ctx.globalCompositeOperation='lighter';
  let g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R*6); g.addColorStop(0,'rgba(255,230,180,0.15)'); g.addColorStop(1,'rgba(255,230,180,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,R*6,0,Math.PI*2); ctx.fill();
  g=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,R*2.5); g.addColorStop(0,'rgba(255,240,200,0.35)'); g.addColorStop(1,'rgba(255,240,200,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(p.x,p.y,R*2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(p.x,p.y,R,0,Math.PI*2); ctx.fillStyle='#ffdca8'; ctx.fill(); ctx.restore();
  ctx.save(); ctx.strokeStyle='rgba(180,200,230,0.25)'; ctx.lineWidth=Math.max(1,1.5*st.t.scale);
  for(const pl of st.system.planets){ pl.angle+=pl.speed*dt*0.001; const wp={x:Math.cos(pl.angle)*pl.dist,y:Math.sin(pl.angle)*pl.dist}; const sp={x:p.x+wp.x*st.t.scale,y:p.y+wp.y*st.t.scale}; const or=pl.dist*st.t.scale;
    ctx.beginPath(); ctx.arc(p.x,p.y,or,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(sp.x,sp.y,Math.max(2.5,pl.size*st.t.scale*0.5),0,Math.PI*2); ctx.fillStyle=pl.type==='terra'?'#a2d0ff':(pl.type==='gas'?'#9be0ff':'#c9c1b6'); ctx.fill(); }
  ctx.restore();
}
