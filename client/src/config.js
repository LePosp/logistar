export const CORE_RADIUS   = 1600;   // яркое ядро — систем нет, звёзд почти нет
export const GALAXY_RADIUS = 8200;   // общий радиус затухания фона

// плотность звёзд
export const STAR_TILE   = 640;
export const STAR_LAYERS = [
  { seed: 11, count: 28, size: [0.6, 1.0], alpha: 0.30 },
  { seed: 17, count: 18, size: [0.9, 1.5], alpha: 0.50 },
  { seed: 23, count: 10, size: [1.1, 1.9], alpha: 0.75 },
];

// сектора: круг, но с «волнистыми» границами
export const SECTOR_COUNT    = 14;
export const SECTOR_RADIUS   = 5600;
export const BOUNDARY_STEPS  = 18;   // чем больше — тем плавнее границы
export const OUTER_ARC_STEPS = 10;   // стыковка по внешнему радиусу
export const BOUNDARY_CURVE_AMPL = 0.28; // изгиб границ (0..~0.4)
export const RADIAL_WIGGLE       = 0.08; // небольшая «лохматость» по радиусу
