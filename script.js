// LogiStar Map — Step 1 (Canvas 2D, pan+zoom, LOD sectors/systems)
const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const hud = document.getElementById('hud');

let sectors = [];
let systems = [];
let world = { width: 1, height: 1 };
let transform = { x: 0, y: 0, scale: 0.55 };
let mouse = { down:false, lastX:0, lastY:0 };
let lodThreshold = 0.7;

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}
window.addEventListener('resize', resize);
resize();

function worldToScreen(x,y){
  return {
    x: (x + transform.x)*transform.scale,
    y: (y + transform.y)*transform.scale
  };
}
function screenToWorld(x,y){
  return {
    x: x/transform.scale - transform.x,
    y: y/transform.scale - transform.y
  };
}

function clampTransform(){
  const margin = 200;
  const viewW = canvas.width / transform.scale;
  const viewH = canvas.height / transform.scale;
  const minX = -world.width + margin;
  const maxX = viewW - margin;
  const minY = -world.height + margin;
  const maxY = viewH - margin;
  transform.x = Math.min(maxX, Math.max(minX, transform.x));
  transform.y = Math.min(maxY, Math.max(minY, transform.y));
}

canvas.addEventListener('mousedown', (e)=>{
  mouse.down = true; mouse.lastX = e.clientX; mouse.lastY = e.clientY;
});
window.addEventListener('mouseup', ()=>{ mouse.down=false; });
window.addEventListener('mousemove', (e)=>{
  if(!mouse.down) return;
  const dx = e.clientX - mouse.lastX;
  const dy = e.clientY - mouse.lastY;
  mouse.lastX = e.clientX; mouse.lastY = e.clientY;
  transform.x += dx/transform.scale;
  transform.y += dy/transform.scale;
  clampTransform();
  draw();
});

canvas.addEventListener('wheel', (e)=>{
  e.preventDefault();
  const zoomIntensity = 0.18;
  const direction = (e.deltaY < 0) ? 1 : -1;
  const mouseWorld = screenToWorld(e.clientX, e.clientY);
  let newScale = transform.scale * (1 + direction*zoomIntensity);
  newScale = Math.max(0.15, Math.min(3.0, newScale));
  const newTx = (e.clientX / newScale) - mouseWorld.x;
  const newTy = (e.clientY / newScale) - mouseWorld.y;
  transform.scale = newScale;
  transform.x = newTx;
  transform.y = newTy;
  clampTransform();
  draw();
},{passive:false});

window.addEventListener('keydown', (e)=>{
  if(e.key.toLowerCase()==='d'){ centerView(); draw(); }
})

function centerView(){
  transform.scale = 0.55;
  transform.x = -(world.width/2 - canvas.width/(2*transform.scale));
  transform.y = -(world.height/2 - canvas.height/(2*transform.scale));
}

function drawBackground(){
  const g = ctx.createLinearGradient(0,0,0,canvas.height);
  g.addColorStop(0,'#07111a'); g.addColorStop(1,'#0c1016');
  ctx.fillStyle = g; ctx.fillRect(0,0,canvas.width, canvas.height);

  // world-space simple starfield (parallax feel)
  const viewW = canvas.width/transform.scale;
  const viewH = canvas.height/transform.scale;
  const viewX = -transform.x, viewY = -transform.y;

  function prng(seed){ let s = seed % 2147483647; if(s<=0) s+=2147483646; return ()=> s = s*16807 % 2147483647; }
  const rnd = prng(1337);
  function* stars(n){
    for(let i=0;i<n;i++){ 
      const x = (rnd()/2147483647)*world.width;
      const y = (rnd()/2147483647)*world.height;
      yield {x,y};
    }
  }
  ctx.save();
  ctx.globalAlpha = 0.35;
  let count = 0;
  for (const s of stars(1200)){
    if(s.x < viewX-200 || s.x > viewX+viewW+200 || s.y < viewY-200 || s.y > viewY+viewH+200) continue;
    const p = worldToScreen(s.x, s.y);
    ctx.fillStyle = '#d9e4ff';
    ctx.fillRect(p.x, p.y, 1, 1);
    if(++count>400) break;
  }
  ctx.globalAlpha = 0.6;
  count = 0;
  for (const s of stars(2200)){
    if(s.x < viewX-200 || s.x > viewX+viewW+200 || s.y < viewY-200 || s.y > viewY+viewH+200) continue;
    const p = worldToScreen(s.x, s.y);
    ctx.fillStyle = '#f2f6ff';
    ctx.fillRect(p.x, p.y, 1.2, 1.2);
    if(++count>400) break;
  }
  ctx.restore();
}

function drawSectors(){
  ctx.save();
  ctx.lineWidth = Math.max(1, 2.5*transform.scale);
  sectors.forEach(s=>{
    const p = worldToScreen(s.x, s.y);
    const w = s.w*transform.scale, h = s.h*transform.scale;
    ctx.fillStyle = 'rgba(40, 70, 110, 0.06)';
    ctx.strokeStyle = '#27405f';
    ctx.fillRect(p.x, p.y, w, h);
    ctx.strokeRect(p.x, p.y, w, h);
    ctx.fillStyle = 'rgba(210,230,255,0.95)';
    ctx.font = `${Math.max(12, 14*transform.scale)}px sans-serif`;
    ctx.fillText(s.name, p.x + 8, p.y + Math.max(14,16*transform.scale));
  });
  ctx.restore();
}

function drawSystems(){
  ctx.save();
  const r = Math.max(3, 4.5*transform.scale);
  systems.forEach(sys=>{
    const p = worldToScreen(sys.x, sys.y);
    let color = '#9bb6ff';
    if(sys.type==='mining') color = '#f3b56b';
    else if(sys.type==='gas') color = '#9be0ff';
    else if(sys.type==='hub') color = '#b9ffa4';
    ctx.beginPath(); ctx.arc(p.x, p.y, r, 0, Math.PI*2);
    ctx.fillStyle = color; ctx.shadowColor = 'rgba(0,0,0,0.4)'; ctx.shadowBlur = 4;
    ctx.fill();
    if(transform.scale > 1.0){
      ctx.shadowBlur = 0;
      ctx.fillStyle = 'rgba(215,226,255,0.92)';
      ctx.font = `${Math.max(10, 12*transform.scale)}px sans-serif`;
      ctx.fillText(sys.name, p.x + 6*r, p.y - 2);
    }
  });
  ctx.restore();
}

function draw(){
  drawBackground();
  hud.textContent = `Зум: ${transform.scale.toFixed(2)} | смещение: (${transform.x.toFixed(0)}, ${transform.y.toFixed(0)}) | сектора: ${sectors.length} | системы: ${systems.length}`;
  drawSectors();
  if(transform.scale > lodThreshold) drawSystems();
}

async function boot(){
  try{
    const s = await fetch('data/sectors.json').then(r=>r.json());
    const y = await fetch('data/systems.json').then(r=>r.json());
    sectors = s.sectors;
    systems = y.systems;
    world.width = s.cols * s.sectorSize;
    world.height = s.rows * s.sectorSize;
    centerView();
  } catch(e){
    console.error('Failed to load data:', e);
  } finally {
    draw();
  }
}

boot();
