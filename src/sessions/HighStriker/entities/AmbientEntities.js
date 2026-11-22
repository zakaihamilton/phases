/**
 * Ambient environment entities (clouds, balloons, grass, pedestrians, trees, flowers, birds)
 * and their per-frame motion updates for HighStriker.
 */

export const createAmbientEntities = (levelWidth = 4000) => ({
  clouds: Array.from({ length: 15 }, () => ({
    x: Math.random() * levelWidth,
    y: Math.random() * 250,
    s: 0.5 + Math.random() * 1.5,
    v: 10 + Math.random() * 20,
  })),

  balloons: Array.from({ length: 8 }, (_, i) => ({
    x: 100 + i * 300 + Math.random() * 200,
    y: Math.random() * 300 + 50,
    offset: Math.random() * Math.PI * 2,
    color: ["#ff4757", "#1e90ff", "#f1c40f", "#2ed573", "#9b59b6"][i % 5],
  })),

  grass: Array.from({ length: 400 }, (_, i) => ({
    x: i * 10,
    h: 8 + Math.random() * 16,
    off: Math.random() * Math.PI * 2,
  })),

  pedestrians: Array.from({ length: 15 }, () => ({
    x: Math.random() * 3000,
    y: 0,
    v: (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
    color: ["#ff9f43", "#ee5253", "#0abde3", "#10ac84", "#5f27cd", "#222f3e"][
      Math.floor(Math.random() * 6)
    ],
    scale: 0.35 + Math.random() * 0.25,
    off: Math.random() * Math.PI * 2,
  })),

  trees: Array.from({ length: 12 }, () => ({
    x: Math.random() * levelWidth,
    s: 0.6 + Math.random() * 0.5,
    type: Math.random() > 0.5 ? 1 : 2,
  })),

  flowers: Array.from({ length: 80 }, () => ({
    x: Math.random() * levelWidth,
    color: ["#ff9ff3", "#feca57", "#ff6b6b", "#48dbfb"][
      Math.floor(Math.random() * 4)
    ],
    h: 10 + Math.random() * 10,
  })),

  birds: Array.from({ length: 12 }, () => ({
    x: Math.random() * levelWidth,
    y: 50 + Math.random() * 250,
    speed: 30 + Math.random() * 50,
    off: Math.random() * 10,
    scale: 0.4 + Math.random() * 0.6,
  })),
});

export const updateAmbientEntities = (entities, dt, width) => {
  for (const c of entities.clouds) {
    c.x += c.v * dt;
    if (c.x > width + 200) c.x = -200;
  }

  for (const p of entities.pedestrians) {
    p.x += p.v * dt;
    if (p.x > 3000) p.x = -100;
    if (p.x < -100) p.x = 3000;
  }

  for (const b of entities.birds) {
    b.x -= b.speed * dt;
    if (b.x < -100) b.x = width + 100;
  }
};
