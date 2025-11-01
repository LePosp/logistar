import * as cfg from './config.js';
import { makeTransform, clampTransform, centerView, screenToWorld } from './camera.js';
import { buildSites, buildBorder, buildSectors, buildSystems, boundsOfSectors } from './world.js';
import { initStars, drawBackground } from './stars.js';
import { drawSectors, drawSystems, drawClusters, drawHUD } from './render.js';
import { attachInput } from './input.js';
import { initUI } from './ui.js';
import { tween, easeInOutQuad } from './tween.js';
import { onRoute, toGalaxy } from './router.js';
import { generateSystem, drawSystem } from './system_view.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const fade = document.getElementById('fade');
const backBtn = document.getElementById('backBtn');

const state = {
  canvas, ctx,
  mode: 'galaxy',
  transform: makeTransform(0,0,0.28),
  galaxyTransform: makeTransform(0,0,0.28),
  systemTransform: makeTransform(0,0,1.0),
  sectors: [], systems: [], worldBounds: null,
  worldStarsFar: [], worldStarsNear: [],
  system: null, selectedSystem: null,
  mouse: {x:innerWidth/2, y:innerHeight/2}, mouseWorld:{x:0,y:0},
  isReady:false,
  _lastClusters: null,
};

function useTransform(which){
  state.transform = which==='galaxy' ? state.galaxyTransform : state.systemTransform;
}

function resizeCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if(state.isReady) draw(0);
}
window.addEventListener('resize', resizeCanvas);

let lastTs = performance.now();
function draw(ts){
  const dt = typeof ts==='number' ? (ts - lastTs) : 16;
  lastTs = typeof ts==='number' ? ts : lastTs + 16;

  drawBackground(ctx, state);

  if(state.mode==='galaxy'){
    drawSectors(ctx,state);
    if(state.transform.scale <= cfg.LOD_THRESHOLD) drawClusters(ctx,state);
    else drawSystems(ctx,state);
  }else{
    drawSystem(ctx, state, dt);
  }
  drawHUD(state);

  if(state._needRAF) requestAnimationFrame(draw);
}

function boot(){
  resizeCanvas();
  const sites = buildSites();
  const border = buildBorder();
  state.sectors = buildSectors(sites, border);
  state.worldBounds = boundsOfSectors(state.sectors);
  state.systems = buildSystems(state.sectors);

  initStars(state);
  centerView(state, canvas);
  clampTransform(state, canvas);

  state.center = ()=>{ centerView(state, canvas); clampTransform(state, canvas); };
  state.onZoomToWorld = (wx,wy)=>{
    const target = { x: (innerWidth/2 / state.transform.scale) - wx, y: (innerHeight/2 / state.transform.scale) - wy, scale: Math.min(1.2, Math.max(0.35, state.transform.scale*1.6)) };
    const from = { ...state.transform };
    tween(from, target, cfg.TWEEN_MS, easeInOutQuad, v=>{ state.transform.x=v.x; state.transform.y=v.y; state.transform.scale=v.scale; clampTransform(state,canvas); draw(performance.now()); }, ()=>{});
  };

  attachInput(canvas, state, { draw:()=>draw(performance.now()), screenToWorld, clampTransform, centerView });
  initUI(state, { draw });

  onRoute(async (r)=>{
    if(r.route==='galaxy'){
      state.mode='galaxy'; useTransform('galaxy'); backBtn.style.display='none';
      state._needRAF=false;
      fadeTo(0.0, 250);
      draw(performance.now());
    }else if(r.route==='system'){
      const id=r.id;
      state.selectedSystem = state.systems.find(s=>s.id===id) || null;
      state.system = generateSystem(id);
      state.mode='system'; useTransform('system');
      state.systemTransform.scale=1.0;
      state.systemTransform.x = (innerWidth/2)/state.systemTransform.scale;
      state.systemTransform.y = (innerHeight/2)/state.systemTransform.scale;
      backBtn.style.display='inline-block';
      fadeTo(0.12, 250, ()=>fadeTo(0.0, 250));
      state._needRAF = true;
      requestAnimationFrame(draw);
    }
  });

  backBtn.onclick = ()=> toGalaxy();

  state.isReady=true;
  draw(performance.now());
}

function fadeTo(target, ms, then){
  const from = parseFloat(getComputedStyle(fade).opacity)||0;
  const t0 = performance.now();
  function step(now){
    const k = Math.min(1, (now-t0)/ms);
    fade.style.opacity = (from + (target-from)*k).toFixed(3);
    if(k<1) requestAnimationFrame(step); else then && then();
  }
  requestAnimationFrame(step);
}

boot();
