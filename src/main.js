import * as cfg from './config.js';
import { makeTransform, clampTransform, centerView, screenToWorld } from './camera.js';
import { buildSites, buildBorder, buildSectors, buildSystems, boundsOfSectors } from './world.js';
import { initStars, drawBackground } from './stars.js';
import { drawSectors, drawSystems, drawHUD } from './render.js';
import { attachInput } from './input.js';
import { initUI } from './ui.js';

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');

const state = {
  canvas, ctx,
  transform: makeTransform(0,0,0.28),
  sectors: [], systems: [], worldBounds: null,
  worldStarsFar: [], worldStarsNear: [],
  selectedSystem: null, mouse: {x:innerWidth/2, y:innerHeight/2}, mouseWorld: {x:0,y:0},
  isReady: false
};

function resizeCanvas(){
  const dpr = Math.max(1, window.devicePixelRatio || 1);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr,0,0,dpr,0,0);
  if (state.isReady) draw();
}
window.addEventListener('resize', resizeCanvas);

function draw(){
  drawBackground(ctx, state);
  drawSectors(ctx, state);
  if (state.transform.scale > cfg.LOD_THRESHOLD) drawSystems(ctx, state);
  drawHUD(state);
}

(function boot(){
  resizeCanvas();

  const sites   = buildSites();
  const border  = buildBorder();
  state.sectors = buildSectors(sites, border);
  state.worldBounds = boundsOfSectors(state.sectors);
  state.systems = buildSystems(state.sectors);

  initStars(state);
  centerView(state, canvas);
  clampTransform(state, canvas);

  attachInput(canvas, state, { draw, screenToWorld, clampTransform, centerView });
  initUI(state, { draw });

  state.isReady = true;
  draw();
})();
