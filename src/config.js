
export const CORE_RADIUS   = 1200;   // ядро светится, внутри не показываем системы
export const GALAXY_RADIUS = 7000;   // радиус затухания фона
export const STAR_TILE     = 640;    // размер тайла звёздного слоя
export const STAR_LAYERS   = [
  { seed: 11, count: 24, size: [0.6, 1.0], alpha: 0.30 },
  { seed: 17, count: 14, size: [0.9, 1.5], alpha: 0.50 },
  { seed: 23, count:  8, size: [1.1, 1.9], alpha: 0.75 },
];
