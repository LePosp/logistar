export const CORE_RADIUS   = 1300;   // ядро — светится, систем нет
export const GALAXY_RADIUS = 7200;   // затухание фона
export const STAR_TILE     = 640;    // тайл звёзд
export const STAR_LAYERS   = [
  { seed: 11, count: 28, size: [0.6, 1.0], alpha: 0.30 },
  { seed: 17, count: 16, size: [0.9, 1.5], alpha: 0.50 },
  { seed: 23, count:  9, size: [1.1, 1.9], alpha: 0.75 },
];

// сектора (круг + неровные границы)
export const SECTOR_COUNT    = 14;
export const SECTOR_RADIUS   = 5200;
export const RADIAL_SEGMENTS = 8;
export const RADIAL_WIGGLE   = 0.10; // «рваность» рёбер
export const ARC_WIGGLE_AMPL = 0.06; // волна по дуге
