/**
 * Static scene geometry and randomized ambient element factories
 * for TheBakeryRoute PhaseVisualizer canvas.
 */

export const CANVAS_WIDTH = 800;
export const CANVAS_HEIGHT = 600;

export const START = { x: 400, y: 530 };
export const HOME = { x: 400, y: 70 };
export const BAKERY = { x: 620, y: 300 };

export const HOME_BOUNDS = { x: 370, y: 20, w: 60, h: 50, z: 50 };
export const BAKERY_BOUNDS = { x: 585, y: 270, w: 70, h: 60, z: 50 };

export const MAIN_CURVE = {
  p0: START,
  p1: { x: 760, y: 450 },
  p2: { x: 760, y: 150 },
  p3: HOME,
};

export const DETOUR_CURVE = {
  p0: START,
  p1: { x: 40, y: 450 },
  p2: { x: 40, y: 150 },
  p3: HOME,
};

export const BENCHES = [
  { x: 520, y: 380, w: 22, h: 10, color: "#78350f" },
  { x: 260, y: 360, w: 10, h: 22, color: "#78350f" },
  { x: 480, y: 150, w: 22, h: 10, color: "#78350f" },
  { x: 180, y: 450, w: 22, h: 10, color: "#78350f" },
  { x: 660, y: 180, w: 10, h: 22, color: "#78350f" },
];

export const CROSSWALKS = [
  { x: 360, y: 110, count: 4, width: 8, height: 20, gap: 14, horizontal: true },
  {
    x: 720,
    y: 300,
    count: 3,
    width: 20,
    height: 8,
    gap: 12,
    horizontal: false,
  },
  {
    x: 140,
    y: 420,
    count: 3,
    width: 20,
    height: 8,
    gap: 12,
    horizontal: false,
  },
  { x: 500, y: 250, count: 4, width: 8, height: 20, gap: 14, horizontal: true },
];

export const TREES = [
  { x: 200, y: 480, size: 22, color: "#064e3b" },
  { x: 260, y: 500, size: 30, color: "#065f46" },
  { x: 560, y: 490, size: 26, color: "#064e3b" },
  { x: 160, y: 380, size: 24, color: "#065f46" },
  { x: 240, y: 250, size: 32, color: "#064e3b" },
  { x: 180, y: 220, size: 18, color: "#065f46" },
  { x: 560, y: 150, size: 28, color: "#064e3b" },
  { x: 620, y: 120, size: 22, color: "#065f46" },
  { x: 240, y: 100, size: 24, color: "#064e3b" },
  { x: 520, y: 80, size: 18, color: "#065f46" },
  { x: 100, y: 450, size: 28, color: "#065f46" },
  { x: 700, y: 480, size: 20, color: "#064e3b" },
  { x: 680, y: 380, size: 30, color: "#064e3b" },
  { x: 100, y: 280, size: 25, color: "#065f46" },
  { x: 680, y: 200, size: 26, color: "#064e3b" },
  { x: 120, y: 150, size: 22, color: "#065f46" },
  { x: 700, y: 80, size: 32, color: "#064e3b" },
  { x: 340, y: 400, size: 20, color: "#065f46" },
];

export const BUILDINGS = [
  {
    x: 280,
    y: 320,
    w: 70,
    h: 90,
    z: 120,
    colors: ["#1e293b", "#0f172a", "#020617"],
  },
  {
    x: 180,
    y: 220,
    w: 60,
    h: 70,
    z: 90,
    colors: ["#334155", "#1e293b", "#0f172a"],
  },
  {
    x: 380,
    y: 170,
    w: 50,
    h: 60,
    z: 100,
    colors: ["#1e293b", "#0f172a", "#020617"],
  },
  {
    x: 480,
    y: 410,
    w: 60,
    h: 50,
    z: 80,
    colors: ["#334155", "#1e293b", "#0f172a"],
  },
  {
    x: 250,
    y: 120,
    w: 50,
    h: 60,
    z: 110,
    colors: ["#475569", "#334155", "#1e293b"],
  },
];

export const STREET_LIGHTS = [
  { x: 400, y: 530 },
  { x: 640, y: 430 },
  { x: 700, y: 230 },
  { x: 400, y: 70 },
  { x: 260, y: 400 },
  { x: 160, y: 200 },
  { x: 550, y: 500 },
];

export const createGrassTufts = (
  count = 2000,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
) =>
  Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    height: Math.random() * 5 + 3,
    tilt: (Math.random() - 0.5) * 5,
  }));

export const createFireflies = (
  count = 40,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
) =>
  Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 2 + 0.8,
    twinkleSpeed: Math.random() * 0.04 + 0.02,
    phase: Math.random() * Math.PI * 2,
    vx: (Math.random() - 0.5) * 0.4,
    vy: (Math.random() - 0.5) * 0.4,
  }));

export const createMistPatches = (
  count = 16,
  width = CANVAS_WIDTH,
  height = CANVAS_HEIGHT,
) =>
  Array.from({ length: count }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    size: Math.random() * 70 + 50,
    speed: Math.random() * 0.2 + 0.1,
  }));
