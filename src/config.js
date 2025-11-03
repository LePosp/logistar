
export const CORE_RADIUS   = 1200;   // ядро светится, внутри не показываем системы
export const GALAXY_RADIUS = 7000;   // радиус затухания фона
export const STAR_TILE     = 640;    // размер тайла звёздного слоя
export const STAR_LAYERS   = [
  { seed: 11, count: 28, size: [0.6, 1.0], alpha: 0.30 },
  { seed: 17, count: 16, size: [0.9, 1.5], alpha: 0.50 },
  { seed: 23, count:  9, size: [1.1, 1.9], alpha: 0.75 },
];

// Сектора (круглая галактика)
export const SECTOR_COUNT = 14;     // количество секторов (радиальных)
export const SECTOR_RADIUS = 5200;  // радиус галактики по секторам
export const RADIAL_SEGMENTS = 8;   // детализация «рваных» радиальных рёбер
export const RADIAL_WIGGLE = 0.08;  // 0..0.2 — степень неровности радиальных границ (доля от радиуса)
