import { makeT, clamp, centerToOrigin } from './camera.js';
import * as W from './world.js';
import * as BG from './stars.js';
import { drawSectors, drawSystems, drawHUD } from './render.js';
import { attach } from './input.js';
import { onRoute, toGalaxy, toSystem } from './router.js';
import { initUI } from './ui.js';
import { generateSystem, drawSystem } from './system_view.js';

console.log('LogiStar build: core+wiggle+safeScale');

const canvas = document.getElementById('map');
const ctx = canvas.getContext('2d');
const backBtn = document.getElementById('backBtn');

// --- общее состояние
const st = {
  canvas, ctx,
  mode: 'galaxy',
  galaxyT: makeT(0, 0, 0.30),
  systemT: makeT(0, 0, 1.00),
  t: null,                   // активная трансформация
  sectors: [], systems: [], bounds: null,
  mouse: null, mouseW: null,
  selected: null,
  system: null,
  isReady: false,
  center: null,
  toGalaxy: null,
};

// активная трансформация
function useT(which){ st.t = which === 'galaxy' ? st.galaxyT : st.systemT; ensureScale(); }

// страховка масштаба (главный фикс от «пустого экрана»)
function ensureScale() {
  if (!st.t || !Number.isFinite(st.t.scale) || st.t.scale < 0.08) st.t.scale = 0.30;
  if (st.t.scale > 6) st.t.scale = 6;
}

// ресайз
function resize() {
  const dpr = Math.max(1, devicePixelRatio || 1);
  canvas.style.width = innerWidth + 'px';
  canvas.style.height = innerHeight + 'px';
  canvas.width = Math.floor(innerWidth * dpr);
  canvas.height = Math.floor(innerHeight * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ensureScale();
  if (st.bounds) { clamp(st, canvas); }
  if (st.isReady) draw();
}
window.addEventListener('resize', resize);

// рисование
function draw() {
  ensureScale();
  if (st.mode === 'galaxy') {
    BG.galaxyBackground(ctx, st);
    drawSectors(ctx, st);
    drawSystems(ctx, st);
  } else {
    BG.systemBackground(ctx);
    drawSystem(ctx, st);
  }
  drawHUD(st);
}

// загрузка
function boot() {
  // базовая геометрия
  st.sectors = W.sectors();
  st.bounds  = W.bounds(st.sectors);
  st.systems = W.systems();

  // центрирование на (0,0) мира
  st.center = () => { centerToOrigin(st, canvas); clamp(st, canvas); draw(); };
  useT('galaxy'); // активируем галактическую трансформацию
  st.center();

  // роутинг
  st.toGalaxy = () => toGalaxy();
  onRoute((r) => {
    if (r.route === 'galaxy') {
      st.mode = 'galaxy'; useT('galaxy'); backBtn.style.display = 'none';
      st.selected = null;
      draw();
    } else if (r.route === 'system') {
      const id = r.id;
      st.selected = st.systems.find(s => s.id === id) || st.selected;
      if (!st.selected) { toGalaxy(); return; }
      st.system = generateSystem(id);
      st.mode = 'system'; useT('system');
      // стартовые значения внутри системы
      st.systemT.scale = Math.max(0.8, Math.min(2.0, st.galaxyT.scale * 2.2));
      clamp(st, canvas);
      backBtn.style.display = 'inline-block';
      draw();
    }
  });
  backBtn.onclick = () => toGalaxy();

  // инпуты/GUI
  attach(canvas, st, { draw, clamp, toSystem, ensureScale });
  initUI(st, { draw, toGalaxy, toSystem });

  st.isReady = true;
  resize(); // выставим размеры и перерисуем
  draw();
}
boot();
