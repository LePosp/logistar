
export function generateSystem(id){
  let h=0; for(let i=0;i<id.length;i++) h=(h*131 + id.charCodeAt(i))>>>0;
  const rnd=()=> (h = (h*1664525 + 1013904223) >>> 0) / 0xffffffff;
  const n = 3 + Math.floor(rnd()*4);
  const planets = []; let angle = rnd()*Math.PI*2;
  for(let i=0;i<n;i++){
    angle += 0.8 + rnd()*0.7;
    planets.push({ name:'P'+(i+1), dist: 240 + i*160 + rnd()*40, size: 8 + rnd()*12, type: rnd()<0.35?'terra':(rnd()<0.65?'gas':'rock'), angle });
  }
  return { starColor:'#ffdca8', planets };
}

export function drawSystem(ctx,st){
  const cx=innerWidth/2, cy=innerHeight/2; const R=60*st.t.scale;
  // фон рисуется отдельно в main (systemBackground)
  ctx.save(); ctx.globalCompositeOperation='lighter';
  let g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*6); g.addColorStop(0,'rgba(255,230,180,0.15)'); g.addColorStop(1,'rgba(255,230,180,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R*6,0,Math.PI*2); ctx.fill();
  g=ctx.createRadialGradient(cx,cy,0,cx,cy,R*2.5); g.addColorStop(0,'rgba(255,240,200,0.35)'); g.addColorStop(1,'rgba(255,240,200,0)'); ctx.fillStyle=g; ctx.beginPath(); ctx.arc(cx,cy,R*2.5,0,Math.PI*2); ctx.fill();
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle='#ffdca8'; ctx.fill(); ctx.restore();

  ctx.save(); ctx.strokeStyle='rgba(180,200,230,0.25)'; ctx.lineWidth=Math.max(1,1.5*st.t.scale);
  for(const pl of st.system.planets){
    const or=pl.dist*st.t.scale; ctx.beginPath(); ctx.arc(cx,cy,or,0,Math.PI*2); ctx.stroke();
    const px = cx + Math.cos(pl.angle)*pl.dist*st.t.scale; const py = cy + Math.sin(pl.angle)*pl.dist*st.t.scale;
    ctx.beginPath(); ctx.arc(px,py,Math.max(2.5,pl.size*st.t.scale*0.5),0,Math.PI*2); ctx.fillStyle = pl.type==='terra' ? '#a2d0ff' : (pl.type==='gas' ? '#9be0ff' : '#c9c1b6'); ctx.fill();
  } ctx.restore();
}
