export function generateSystem(id){
  let h=0;
  for(let i=0;i<id.length;i++) h = (h*131 + id.charCodeAt(i)) >>> 0;
  const rnd = () => (h = (h*1664525 + 1013904223) >>> 0) / 0xffffffff;
  const n = 3 + Math.floor(rnd() * 4);
  const planets = [];
  let angle = rnd() * Math.PI * 2;
  for(let i=0;i<n;i++){
    angle += 0.8 + rnd() * 0.7;
    const size = 8 + rnd() * 12;
    const dist = 240 + i*160 + rnd() * 40;
    // take a single random for type so thresholds are consistent
    const tr = rnd();
    const type = tr < 0.35 ? 'terra' : (tr < 0.65 ? 'gas' : 'rock');
    planets.push({ name: 'P' + (i+1), dist, size, type, angle });
  }
  return { starColor:'#ffdca8', planets };
}

export function drawSystem(ctx,st){
  // Calculate center in client (CSS) coordinates using canvas bounding rect.
  const rect = ctx.canvas.getBoundingClientRect();
  const dpr = devicePixelRatio || 1;
  // internal screen coords used by other logic are in canvas pixels (canvas.width = rect.width * dpr)
  const cxClient = rect.left + rect.width / 2;
  const cyClient = rect.top  + rect.height / 2;
  // Convert center to internal "screen" pixels and apply transformation similarly to other code
  const px = ( (rect.width * dpr) / 2 );
  const py = ( (rect.height * dpr) / 2 );
  // We want to draw in canvas coordinates (which are in device pixels), so compute center in canvas pixels
  // Taking pan/offset into account:
  const cx = px + st.t.x * st.t.scale;
  const cy = py + st.t.y * st.t.scale;
  const R = 60 * st.t.scale;

  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  // big glow
  let g = ctx.createRadialGradient(cx,cy,0,cx,cy,R*6);
  g.addColorStop(0,'rgba(255,230,180,0.15)'); g.addColorStop(1,'rgba(255,230,180,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,R*6,0,Math.PI*2); ctx.fill();
  // mid glow
  g = ctx.createRadialGradient(cx,cy,0,cx,cy,R*2.5);
  g.addColorStop(0,'rgba(255,240,200,0.35)'); g.addColorStop(1,'rgba(255,240,200,0)');
  ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx,cy,R*2.5,0,Math.PI*2); ctx.fill();
  // star
  ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2); ctx.fillStyle = '#ffdca8'; ctx.fill();
  ctx.restore();

  // orbits + planets
  ctx.save();
  ctx.strokeStyle = 'rgba(180,200,230,0.25)';
  ctx.lineWidth = Math.max(1, 1.5 * st.t.scale);
  for(const pl of st.system.planets){
    const or = pl.dist * st.t.scale;
    ctx.beginPath(); ctx.arc(cx,cy,or,0,Math.PI*2); ctx.stroke();
    const pxp = cx + Math.cos(pl.angle) * pl.dist * st.t.scale;
    const pyp = cy + Math.sin(pl.angle) * pl.dist * st.t.scale;
    ctx.beginPath();
    const pr = Math.max(2.5, pl.size * st.t.scale * 0.5);
    ctx.arc(pxp, pyp, pr, 0, Math.PI*2);
    ctx.fillStyle = pl.type === 'terra' ? '#a2d0ff' : (pl.type === 'gas' ? '#9be0ff' : '#c9c1b6');
    ctx.fill();
  }
  ctx.restore();
}
