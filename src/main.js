
import { makeT, clamp, center } from './camera.js';
import * as W from './world.js';
import * as BG from './stars.js';
import { drawSectors, drawSystems, drawHUD } from './render.js';
import { attach } from './input.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const st = { canvas, ctx, t:makeT(0,0,0.35), sectors:[], systems:[], bounds:null, mouse:null, mouseW:null };

function resize(){
  const dpr=Math.max(1,devicePixelRatio||1);
  canvas.style.width=innerWidth+'px';
  canvas.style.height=innerHeight+'px';
  canvas.width=Math.floor(innerWidth*dpr);
  canvas.height=Math.floor(innerHeight*dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  draw();
}
window.addEventListener('resize', resize);

function draw(){
  BG.background(ctx,st);
  drawSectors(ctx,st);
  drawSystems(ctx,st);     // системы видны на любом масштабе
  drawHUD(st);
}

function boot(){
  resize();
  st.sectors=W.sectors();
  st.bounds=W.bounds(st.sectors);
  st.systems=W.systems(st.sectors);
  st.center=()=>{ center(st,canvas); clamp(st,canvas); draw(); };
  st.center();
  document.getElementById('toggleHints').onclick=()=>{
    document.getElementById('ui').classList.toggle('hidden');
    document.getElementById('legend').classList.toggle('hidden');
  };
  attach(canvas,st,{draw,clamp});
}
boot();
