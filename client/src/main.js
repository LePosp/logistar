
import { makeT, clamp, center } from './camera.js';
import * as W from './world.js';
import * as BG from './stars.js';
import { drawSectors, drawSystems, drawHUD } from './render.js';
import { attach } from './input.js';
import { onRoute, toGalaxy, toSystem } from './router.js';
import { initUI } from './ui.js';
import { generateSystem, drawSystem } from './system_view.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const backBtn = document.getElementById('backBtn');

const st = {
  canvas, ctx,
  mode:'galaxy',
  t:makeT(0,0,0.35),
  galaxyT:makeT(0,0,0.35),
  systemT:makeT(0,0,1.0),
  sectors:[], systems:[], bounds:null,
  mouse:null, mouseW:null,
  selected:null,
  system:null, isReady:false,
};
function useT(which){ st.t = which==='galaxy' ? st.galaxyT : st.systemT; }

function resize(){
  const dpr=Math.max(1,devicePixelRatio||1);
  canvas.style.width=innerWidth+'px';
  canvas.style.height=innerHeight+'px';
  canvas.width=Math.floor(innerWidth*dpr);
  canvas.height=Math.floor(innerHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(st.isReady) draw();
}
window.addEventListener('resize', resize);

function draw(){
  BG.background(ctx,st);
  if(st.mode==='galaxy'){
    drawSectors(ctx,st);
    drawSystems(ctx,st);
  }else{
    drawSystem(ctx,st,0);
  }
  drawHUD(st);
}

function boot(){
  resize();
  st.sectors=W.sectors();
  st.bounds=W.bounds(st.sectors);
  st.systems=W.systems(st.sectors);
  st.center=()=>{ center(st,canvas); clamp(st,canvas); draw(); };
  st.center();
  st.toGalaxy=()=>toGalaxy();

  // Для зума «к точке мира» (используется кликом по кластерам раньше; пригодится)
  st.onZoomToWorld=(wx,wy)=>{
    const cx=innerWidth/2, cy=innerHeight/2;
    const ns = Math.min(1.2, Math.max(0.35, st.t.scale*1.6));
    st.t.x = (cx/ns) - wx;
    st.t.y = (cy/ns) - wy;
    st.t.scale = ns;
    clamp(st,canvas);
    draw();
  };

  attach(canvas,st,{ draw, clamp, toSystem });
  initUI(st,{ draw, toGalaxy, toSystem });

  onRoute((r)=>{
    if(r.route==='galaxy'){
      st.mode='galaxy'; useT('galaxy'); backBtn.style.display='none';
      draw();
    }else if(r.route==='system'){
      const id=r.id;
      st.selected = st.systems.find(s=>s.id===id) || st.selected;
      st.system = generateSystem(id);
      st.mode='system'; useT('system');
      st.systemT.scale=1.0;
      st.systemT.x = (innerWidth/2)/st.systemT.scale;
      st.systemT.y = (innerHeight/2)/st.systemT.scale;
      backBtn.style.display='inline-block';
      // БЕЗ RAF: статическая отрисовка
      draw();
    }
  });
  backBtn.onclick = ()=> toGalaxy();

  st.isReady=true;
  draw();
}
boot();
