export const drawAtmosphere = (ctx, engine) => {
  const { width, height, time } = engine;

  // Floating Motes / Dust
  ctx.save();
  const moteCount = 40;
  ctx.fillStyle = "rgba(255, 255, 255, 0.3)";
  for (let i = 0; i < moteCount; i++) {
    const x =
      (Math.sin(i * 123.45) * 0.5 + 0.5) * width +
      Math.sin(time * 0.2 + i) * 50;
    const y =
      (Math.cos(i * 678.9) * 0.5 + 0.5) * height +
      Math.cos(time * 0.3 + i) * 30;
    const size = (Math.sin(i + time) * 0.5 + 0.5) * 2 + 1;

    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // Subtle Ground Fog
  const fogGrad = ctx.createLinearGradient(0, height * 0.5, 0, height * 0.65);
  fogGrad.addColorStop(0, "rgba(255, 255, 255, 0)");
  fogGrad.addColorStop(1, "rgba(255, 255, 255, 0.15)");
  ctx.fillStyle = fogGrad;
  ctx.fillRect(0, height * 0.5, width, height * 0.15);
};

export const drawLensFlare = (ctx, engine) => {
  const { width, height, puckY, towerHeight } = engine;
  const sunX = width * 0.85;
  const sunY = height * 0.25;

  // Flare intensity based on puck height
  const ratio = Math.min(puckY / towerHeight, 1.0);
  if (ratio < 0.5) return;

  const centerX = width / 2;
  const centerY = height / 2;

  const dx = sunX - centerX;
  const dy = sunY - centerY;

  ctx.save();
  ctx.globalCompositeOperation = "screen";

  const flareColors = [
    "rgba(255, 200, 50, 0.2)",
    "rgba(50, 200, 255, 0.1)",
    "rgba(255, 100, 255, 0.1)",
  ];

  for (let i = 1; i <= 3; i++) {
    const fx = sunX - dx * i * 0.4;
    const fy = sunY - dy * i * 0.4;
    const size = 20 + i * 40;

    ctx.beginPath();
    const grad = ctx.createRadialGradient(fx, fy, 0, fx, fy, size);
    grad.addColorStop(0, flareColors[i - 1]);
    grad.addColorStop(1, "transparent");
    ctx.fillStyle = grad;
    ctx.arc(fx, fy, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const drawSkyAndSun = (ctx, engine) => {
  const { width, height, time } = engine;
  const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
  gradient.addColorStop(0, "#0abde3");
  gradient.addColorStop(1, "#c8d6e5");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height * 0.6);

  ctx.save();
  const sunX = width * 0.85;
  const sunY = height * 0.25;

  ctx.globalCompositeOperation = "screen";
  const sunGrad = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 200);
  sunGrad.addColorStop(0, "rgba(255, 255, 255, 1)");
  sunGrad.addColorStop(0.2, "rgba(253, 203, 110, 0.8)");
  sunGrad.addColorStop(1, "rgba(253, 203, 110, 0)");
  ctx.fillStyle = sunGrad;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 200, 0, Math.PI * 2);
  ctx.fill();

  ctx.translate(sunX, sunY);
  ctx.rotate(time * 0.05);
  for (let i = 0; i < 12; i++) {
    ctx.rotate(Math.PI / 6);
    const grad = ctx.createLinearGradient(0, 0, 1200, 0);
    grad.addColorStop(0, "rgba(255, 255, 200, 0.25)");
    grad.addColorStop(0.5, "rgba(255, 255, 200, 0.05)");
    grad.addColorStop(1, "rgba(255, 255, 200, 0)");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(1200, -80);
    ctx.lineTo(1200, 80);
    ctx.fill();
  }
  ctx.restore();
};

const drawGroundAndGrass = (ctx, engine) => {
  const { width, height, time, grass, animState, puckVy } = engine;
  ctx.fillStyle = "#10ac84";
  ctx.fillRect(0, height * 0.6, width, height * 0.4);
  ctx.fillStyle = "#1dd1a1";
  ctx.fillRect(0, height * 0.6, width, 15);

  const baseY = height * 0.6;

  ctx.fillStyle = "#01a3a4";
  for (const g of grass) {
    if (g.x > width + 50) continue;

    // Grass responds to puck speed if nearby
    const distToCenter = Math.abs(g.x - (width / 2 - 90));
    const speedInfluence =
      animState === "RISING" || animState === "FALLING"
        ? Math.abs(puckVy) * 0.005
        : 0;
    const ripple = speedInfluence * Math.exp(-distToCenter * 0.01);

    const tilt =
      Math.sin(time * 2.5 + g.off) * 8 +
      ripple * Math.sign(g.x - (width / 2 - 90));
    ctx.beginPath();
    ctx.moveTo(g.x, baseY + 4);
    ctx.quadraticCurveTo(
      g.x + tilt / 2,
      baseY - g.h / 2,
      g.x + tilt,
      baseY - g.h,
    );
    ctx.lineTo(g.x + tilt + 3, baseY - g.h);
    ctx.quadraticCurveTo(
      g.x + 3 + tilt / 2,
      baseY - g.h / 2,
      g.x + 8,
      baseY + 4,
    );
    ctx.fill();

    ctx.fillStyle = "#1dd1a1";
    ctx.beginPath();
    ctx.moveTo(g.x + 2, baseY + 4);
    ctx.quadraticCurveTo(
      g.x + tilt / 2 + 2,
      baseY - g.h / 3,
      g.x + tilt + 1,
      baseY - g.h / 2,
    );
    ctx.lineTo(g.x + tilt + 2, baseY - g.h / 2);
    ctx.fill();

    if (g.off % 7 < 0.2) {
      ctx.fillStyle = g.off % 14 < 0.1 ? "#ff7675" : "#74b9ff";
      ctx.beginPath();
      ctx.arc(g.x + tilt + 1, baseY - g.h - 2, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "#01a3a4";
  }
};

const drawClouds = (ctx, clouds) => {
  for (const c of clouds) {
    ctx.save();
    ctx.translate(c.x, c.y);
    ctx.scale(c.s, c.s);

    ctx.fillStyle = "rgba(200, 214, 229, 0.6)";
    ctx.beginPath();
    ctx.arc(0, 10, 40, 0, Math.PI * 2);
    ctx.arc(30, -10, 50, 0, Math.PI * 2);
    ctx.arc(70, 10, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = "#ffffff";
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.arc(30, -20, 50, 0, Math.PI * 2);
    ctx.arc(70, 0, 40, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

const drawBirds = (ctx, birds, width, time) => {
  ctx.strokeStyle = "#222f3e";
  ctx.fillStyle = "#222f3e";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const b of birds) {
    if (b.x < -50 || b.x > width + 50) continue;
    const flap = Math.sin(time * 10 + b.off) * 15 * b.scale;

    ctx.save();
    ctx.translate(b.x, b.y);
    ctx.scale(b.scale, b.scale);

    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(12, -flap, 24, -5 - flap * 0.2);
    ctx.moveTo(0, 0);
    ctx.quadraticCurveTo(-12, -flap, -24, -5 - flap * 0.2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(0, 2, 4, 6, Math.PI / 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

const drawBalloons = (ctx, balloons, width, time) => {
  for (const b of balloons) {
    if (b.x > width + 100) continue;
    const by = b.y + Math.sin(time + b.offset) * 15;
    const scale = b.scale || 1.0;
    const bx = b.x;

    ctx.save();
    ctx.translate(bx, by);
    ctx.scale(scale, scale);

    ctx.strokeStyle = "#576574";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-10, 20);
    ctx.lineTo(-12, 40);
    ctx.moveTo(10, 20);
    ctx.lineTo(12, 40);
    ctx.moveTo(-4, 25);
    ctx.lineTo(-4, 40);
    ctx.moveTo(4, 25);
    ctx.lineTo(4, 40);
    ctx.stroke();

    const colors = [b.color, "#ffffffdd", b.color];
    for (let i = 0; i < 3; i++) {
      ctx.fillStyle = colors[i];
      ctx.beginPath();
      const xOff = (i - 1) * 12;
      const w = i === 1 ? 14 : 22;
      ctx.ellipse(xOff, 0, w, 35, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(0,0,0,0.1)";
      ctx.stroke();
    }

    const envelopeGrad = ctx.createRadialGradient(-10, -15, 5, 0, 0, 45);
    envelopeGrad.addColorStop(0, "rgba(255, 255, 255, 0.3)");
    envelopeGrad.addColorStop(1, "transparent");
    ctx.fillStyle = envelopeGrad;
    ctx.beginPath();
    ctx.ellipse(0, 0, 32, 35, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = b.color;
    ctx.beginPath();
    ctx.moveTo(-18, 10);
    ctx.quadraticCurveTo(0, 35, 18, 10);
    ctx.fill();

    ctx.fillStyle = "rgba(255, 159, 67, 0.4)";
    ctx.beginPath();
    ctx.arc(0, 32, 6, 0, Math.PI * 2);
    ctx.fill();

    const basketGrad = ctx.createLinearGradient(-12, 40, 12, 40);
    basketGrad.addColorStop(0, "#84817a");
    basketGrad.addColorStop(0.5, "#aaa69d");
    basketGrad.addColorStop(1, "#84817a");
    ctx.fillStyle = basketGrad;
    ctx.strokeStyle = "#222f3e";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(-12, 40, 24, 16, 4);
    ctx.fill();
    ctx.stroke();

    ctx.strokeStyle = "rgba(0,0,0,0.15)";
    ctx.beginPath();
    ctx.moveTo(-12, 45);
    ctx.lineTo(12, 45);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-12, 51);
    ctx.lineTo(12, 51);
    ctx.stroke();

    ctx.restore();
  }
};

export const drawEnvironment = (ctx, engine) => {
  const { width, time, clouds, birds, balloons } = engine;

  drawSkyAndSun(ctx, engine);
  drawAtmosphere(ctx, engine);
  drawLensFlare(ctx, engine);
  drawGroundAndGrass(ctx, engine);
  drawClouds(ctx, clouds);
  drawBirds(ctx, birds, width, time);
  drawBalloons(ctx, balloons, width, time);
};

export const drawFlora = (ctx, engine) => {
  const { width, height, time, trees, flowers } = engine;
  const baseY = height * 0.6;

  for (const t of trees) {
    if (t.x < -100 || t.x > width + 100) continue;

    ctx.save();
    ctx.translate(t.x, baseY);
    ctx.scale(t.s, t.s);

    const trunkGrad = ctx.createLinearGradient(-12, 0, 12, 0);
    trunkGrad.addColorStop(0, "#4a2f1d");
    trunkGrad.addColorStop(1, "#8e5a36");
    ctx.fillStyle = trunkGrad;
    ctx.fillRect(-12, -90, 24, 90);

    if (t.type === 1) {
      ctx.fillStyle = "#1e8449";
      ctx.beginPath();
      ctx.arc(0, -100, 45, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#229954";
      ctx.beginPath();
      ctx.arc(-30, -80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#27ae60";
      ctx.beginPath();
      ctx.arc(30, -80, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#2ecc71";
      ctx.beginPath();
      ctx.arc(0, -130, 35, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.fillStyle = "#0b5345";
      ctx.beginPath();
      ctx.moveTo(0, -160);
      ctx.lineTo(-45, -70);
      ctx.lineTo(45, -70);
      ctx.fill();
      ctx.fillStyle = "#117864";
      ctx.beginPath();
      ctx.moveTo(0, -130);
      ctx.lineTo(-40, -50);
      ctx.lineTo(40, -50);
      ctx.fill();
      ctx.fillStyle = "#1abc9c";
      ctx.beginPath();
      ctx.moveTo(0, -100);
      ctx.lineTo(-35, -30);
      ctx.lineTo(35, -30);
      ctx.fill();
    }
    ctx.restore();
  }

  for (const f of flowers) {
    if (f.x < 0 || f.x > width) continue;

    const wave = Math.sin(time * 2 + f.x) * 3;

    ctx.strokeStyle = "#27ae60";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(f.x, baseY);
    ctx.quadraticCurveTo(
      f.x + wave / 2,
      baseY - f.h / 2,
      f.x + wave,
      baseY - f.h,
    );
    ctx.stroke();

    ctx.fillStyle = "#2ecc71";
    ctx.beginPath();
    ctx.ellipse(
      f.x + wave / 2 + 3,
      baseY - f.h / 2,
      4,
      2,
      Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(
      f.x + wave / 2 - 3,
      baseY - f.h / 2 + 3,
      4,
      2,
      -Math.PI / 4,
      0,
      Math.PI * 2,
    );
    ctx.fill();

    ctx.save();
    ctx.translate(f.x + wave, baseY - f.h);
    ctx.fillStyle = f.color;
    for (let i = 0; i < 5; i++) {
      ctx.beginPath();
      ctx.ellipse(0, -4, 3, 5, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate((Math.PI * 2) / 5);
    }
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(0, 0, 3, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
};
