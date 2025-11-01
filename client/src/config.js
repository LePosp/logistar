
// Visual & generation constants
export const CORE_RADIUS = 1200;   // ядро галактики: в нём НЕ показываем системы
export const GALAXY_RADIUS = 7000; // радиус для фона/градиента

// Параметры звёздного фона (тайловые слои)
export const STAR_TILE = 640; // размер тайла в мировых координатах
export const STAR_LAYERS = [
  { seed: 11, count: 22, size: [0.6, 1.0], alpha: 0.30 }, // рассеянные
  { seed: 17, count: 14, size: [0.8, 1.4], alpha: 0.50 }, // средние
  { seed: 23, count:  7, size: [1.0, 1.8], alpha: 0.75 }, // редкие яркие
];
