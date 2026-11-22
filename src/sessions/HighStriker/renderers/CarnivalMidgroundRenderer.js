export const drawPedestrians = (ctx, engine) => {
  const { width, height, time, pedestrians } = engine;
  const baseY = height * 0.6 + 15;

  for (const p of pedestrians) {
    if (p.x < -100 || p.x > width + 100) continue;

    const walkSpeed = time * 8 + p.off;
    const bob = Math.abs(Math.sin(walkSpeed)) * 6 * p.scale;
    const swing = Math.sin(walkSpeed) * 12;

    ctx.save();
    ctx.translate(p.x, baseY - bob);
    ctx.scale(p.scale, p.scale);

    // Flip based on direction
    if (p.v < 0) ctx.scale(-1, 1);

    // Legs
    ctx.strokeStyle = "#2f3542";
    ctx.lineWidth = 4;
    ctx.lineCap = "round";

    // Back leg
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(Math.sin(walkSpeed + Math.PI) * 10, 5);
    ctx.stroke();

    // Arms - Back arm
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(-swing * 0.5, -5 + swing * 0.2);
    ctx.stroke();

    // Body
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.roundRect(-7, -26, 14, 22, 5);
    ctx.fill();

    // Head
    ctx.fillStyle = "#ffeaa7";
    ctx.beginPath();
    ctx.arc(0, -32, 6, 0, Math.PI * 2);
    ctx.fill();

    // Eyes - Looking Forward
    ctx.fillStyle = "#2f3542";
    ctx.beginPath();
    ctx.arc(3, -33, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Back eye hint
    ctx.globalAlpha = 0.3;
    ctx.beginPath();
    ctx.arc(1, -33, 1, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1.0;

    // Hair/Hat detail
    ctx.fillStyle = p.off % 2 < 1 ? "#2f3542" : "#8e44ad";
    ctx.beginPath();
    ctx.arc(0, -34, 6, Math.PI, 0);
    ctx.fill();

    // Front leg
    ctx.strokeStyle = "#2f3542";
    ctx.beginPath();
    ctx.moveTo(0, -5);
    ctx.lineTo(Math.sin(walkSpeed) * 10, 5);
    ctx.stroke();

    // Front arm
    ctx.beginPath();
    ctx.moveTo(0, -20);
    ctx.lineTo(swing * 0.5, -5 - swing * 0.2);
    ctx.stroke();

    ctx.restore();
  }
};

export const drawFerrisWheel = (ctx, engine) => {
  const { width, height, time } = engine;
  const baseY = height * 0.6;
  const fwX = width < 600 ? width * 1.1 : width * 0.82;
  const fwY = baseY - 240;
  const fwR = 180;
  const fwRot = time * 0.3;

  // Main Supports
  ctx.strokeStyle = "#2f3542";
  ctx.lineWidth = 14;
  ctx.beginPath();
  ctx.moveTo(fwX, fwY);
  ctx.lineTo(fwX + 100, baseY);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(fwX, fwY);
  ctx.lineTo(fwX - 100, baseY);
  ctx.stroke();

  // Cross supports
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.moveTo(fwX - 45, fwY + 110);
  ctx.lineTo(fwX + 45, fwY + 110);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(fwX - 70, fwY + 180);
  ctx.lineTo(fwX + 70, fwY + 180);
  ctx.stroke();

  // Outer Glow
  ctx.save();
  ctx.globalCompositeOperation = "screen";
  ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
  ctx.lineWidth = 15;
  ctx.beginPath();
  ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // Wheel Rings
  ctx.strokeStyle = "#747d8c";
  ctx.lineWidth = 10;
  ctx.beginPath();
  ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2);
  ctx.stroke();
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(fwX, fwY, fwR - 40, 0, Math.PI * 2);
  ctx.stroke();

  // Truss Structure between rings
  ctx.lineWidth = 2;
  ctx.strokeStyle = "rgba(116, 125, 140, 0.6)";
  const trussCount = 24;
  for (let i = 0; i < trussCount; i++) {
    const a1 = fwRot + (i * Math.PI * 2) / trussCount;
    const a2 = fwRot + ((i + 0.5) * Math.PI * 2) / trussCount;
    const a3 = fwRot + ((i + 1) * Math.PI * 2) / trussCount;

    ctx.beginPath();
    ctx.moveTo(fwX + Math.cos(a1) * fwR, fwY + Math.sin(a1) * fwR);
    ctx.lineTo(
      fwX + Math.cos(a2) * (fwR - 40),
      fwY + Math.sin(a2) * (fwR - 40),
    );
    ctx.lineTo(fwX + Math.cos(a3) * fwR, fwY + Math.sin(a3) * fwR);
    ctx.stroke();
  }

  // Spokes
  const spokeCount = 16;
  for (let i = 0; i < spokeCount; i++) {
    const angle = fwRot + (i * Math.PI * 2) / spokeCount;
    ctx.strokeStyle = "rgba(87, 101, 116, 0.4)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(fwX, fwY);
    ctx.lineTo(fwX + Math.cos(angle) * fwR, fwY + Math.sin(angle) * fwR);
    ctx.stroke();

    // Lights on spokes
    const lightOn = (Math.floor(time * 3) + i) % 4 === 0;
    if (lightOn) {
      const lDist = fwR * 0.7;
      ctx.save();
      ctx.fillStyle = i % 2 === 0 ? "#f1c40f" : "#ff4757";
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(
        fwX + Math.cos(angle) * lDist,
        fwY + Math.sin(angle) * lDist,
        4,
        0,
        Math.PI * 2,
      );
      ctx.fill();
      ctx.restore();
    }
  }

  // Cabins
  const cabinCount = 16;
  for (let i = 0; i < cabinCount; i++) {
    const angle = fwRot + (i * Math.PI * 2) / cabinCount;
    const cx = fwX + Math.cos(angle) * fwR;
    const cy = fwY + Math.sin(angle) * fwR;

    ctx.save();
    ctx.translate(cx, cy);

    // Cabin Suspension
    ctx.strokeStyle = "#576574";
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(-8, -10);
    ctx.lineTo(0, 0);
    ctx.lineTo(8, -10);
    ctx.stroke();

    // Main Cabin Body
    const cColor =
      i % 3 === 0 ? "#ff6b81" : i % 3 === 1 ? "#1e90ff" : "#2ed573";
    ctx.fillStyle = cColor;
    ctx.beginPath();
    ctx.roundRect(-16, 0, 32, 38, 8);
    ctx.fill();
    ctx.strokeStyle = "#2f3542";
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Window/Glass
    ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
    ctx.beginPath();
    ctx.roundRect(-12, 6, 24, 16, 4);
    ctx.fill();

    // Roof
    ctx.fillStyle = "#feca57";
    ctx.beginPath();
    ctx.moveTo(-20, 2);
    ctx.lineTo(20, 2);
    ctx.lineTo(0, -14);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Base/Step
    ctx.fillStyle = "#2f3542";
    ctx.fillRect(-12, 38, 24, 3);

    ctx.restore();
  }

  // Central Hub
  const hubR = 25;
  const hubGrad = ctx.createRadialGradient(fwX, fwY, 5, fwX, fwY, hubR);
  hubGrad.addColorStop(0, "#f1c40f");
  hubGrad.addColorStop(0.6, "#e67e22");
  hubGrad.addColorStop(1, "#d35400");
  ctx.fillStyle = hubGrad;
  ctx.beginPath();
  ctx.arc(fwX, fwY, hubR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = "#2f3542";
  ctx.lineWidth = 4;
  ctx.stroke();

  // Hub Lights
  for (let i = 0; i < 10; i++) {
    const a = fwRot * -2.5 + (i * Math.PI * 2) / 10;
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(fwX + Math.cos(a) * 16, fwY + Math.sin(a) * 16, 3, 0, Math.PI * 2);
    ctx.fill();
  }
};

export const drawDropTower = (ctx, engine) => {
  const { width, height, time } = engine;
  const baseY = height * 0.6;
  const dtX = width < 600 ? width * 0.05 : width * 0.28;
  const dtH = 250;

  ctx.fillStyle = "#7f8fa6";
  ctx.fillRect(dtX - 10, baseY - dtH, 20, dtH);
  ctx.strokeStyle = "#2f3542";
  ctx.lineWidth = 2;
  ctx.strokeRect(dtX - 10, baseY - dtH, 20, dtH);
  for (let i = 0; i < 10; i++) {
    ctx.beginPath();
    ctx.moveTo(dtX - 10, baseY - dtH + i * 25);
    ctx.lineTo(dtX + 10, baseY - dtH + i * 25 + 10);
    ctx.stroke();
  }

  ctx.fillStyle = "#e84118";
  ctx.beginPath();
  ctx.arc(dtX, baseY - dtH, 18, Math.PI, 0);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(dtX, baseY - dtH - 10, 4, 0, Math.PI * 2);
  ctx.fill();

  const dropCycle = (time * 0.3) % 1.0;
  let carriageY = baseY - dtH + 25;
  if (dropCycle < 0.5) {
    carriageY = baseY - 25 - (dropCycle / 0.5) * (dtH - 50);
  } else if (dropCycle < 0.6) {
    carriageY = baseY - dtH + 25;
  } else if (dropCycle < 0.7) {
    const dropProgress = (dropCycle - 0.6) / 0.1;
    carriageY = baseY - dtH + 25 + dropProgress ** 3 * (dtH - 50);
  } else {
    carriageY = baseY - 25;
  }
  ctx.fillStyle = "#fbc531";
  ctx.fillRect(dtX - 22, carriageY, 44, 20);
  ctx.strokeRect(dtX - 22, carriageY, 44, 20);
  ctx.fillStyle = "#2f3542";
  ctx.fillRect(dtX - 25, carriageY + 20, 50, 10);

  ctx.fillStyle = "#ff4757";
  ctx.beginPath();
  ctx.arc(dtX - 15, carriageY + 15, 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#1e90ff";
  ctx.beginPath();
  ctx.arc(dtX + 15, carriageY + 15, 4, 0, Math.PI * 2);
  ctx.fill();
};

export const drawRollercoaster = (ctx, engine) => {
  const { width, height, time } = engine;
  const baseY = height * 0.6;
  const rcX = width < 600 ? width * -0.8 : width * 0.08;
  ctx.lineCap = "butt";

  ctx.strokeStyle = "#5c3a21";
  ctx.lineWidth = 4;
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    const tx =
      (1 - t) ** 2 * rcX + 2 * (1 - t) * t * (rcX + 140) + t ** 2 * (rcX + 280);
    const ty =
      (1 - t) ** 2 * baseY + 2 * (1 - t) * t * (baseY - 280) + t ** 2 * baseY;

    const dx =
      2 * (1 - t) * (rcX + 140 - rcX) + 2 * t * (rcX + 280 - (rcX + 140));
    const dy =
      2 * (1 - t) * (baseY - 280 - baseY) + 2 * t * (baseY - (baseY - 280));
    const len = Math.sqrt(dx * dx + dy * dy);
    const nx = -dy / len;
    const ny = dx / len;

    ctx.beginPath();
    ctx.moveTo(tx - nx * 10, ty - ny * 10);
    ctx.lineTo(tx + nx * 10, ty + ny * 10);
    ctx.stroke();
  }

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#576574";
  for (let i = 0; i <= 12; i++) {
    const t = i / 12;
    const tx =
      (1 - t) ** 2 * rcX + 2 * (1 - t) * t * (rcX + 140) + t ** 2 * (rcX + 280);
    const ty =
      (1 - t) ** 2 * baseY + 2 * (1 - t) * t * (baseY - 280) + t ** 2 * baseY;

    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx - 15, baseY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(tx, ty);
    ctx.lineTo(tx + 15, baseY);
    ctx.stroke();
    if (i < 12) {
      const tNext = (i + 1) / 12;
      const txN =
        (1 - tNext) ** 2 * rcX +
        2 * (1 - tNext) * tNext * (rcX + 140) +
        tNext ** 2 * (rcX + 280);
      const tyN =
        (1 - tNext) ** 2 * baseY +
        2 * (1 - tNext) * tNext * (baseY - 280) +
        tNext ** 2 * baseY;
      ctx.beginPath();
      ctx.moveTo(tx, baseY - 20);
      ctx.lineTo(txN, tyN);
      ctx.stroke();
    }
  }

  ctx.lineWidth = 6;
  ctx.strokeStyle = "#c23616";
  ctx.beginPath();
  ctx.moveTo(rcX, baseY);
  ctx.quadraticCurveTo(rcX + 140, baseY - 280, rcX + 280, baseY);
  ctx.stroke();

  ctx.lineWidth = 2;
  ctx.strokeStyle = "#ff7675";
  ctx.beginPath();
  ctx.moveTo(rcX, baseY);
  ctx.quadraticCurveTo(rcX + 140, baseY - 280, rcX + 280, baseY);
  ctx.stroke();

  const tC_base = ((time * 0.15) % 1.5) - 0.2;

  for (let i = 0; i < 3; i++) {
    const tC = tC_base - i * 0.05;
    if (tC < 0 || tC > 1) continue;

    const cartX =
      (1 - tC) ** 2 * rcX +
      2 * (1 - tC) * tC * (rcX + 140) +
      tC ** 2 * (rcX + 280);
    const cartY =
      (1 - tC) ** 2 * baseY +
      2 * (1 - tC) * tC * (baseY - 280) +
      tC ** 2 * baseY;

    const dx =
      2 * (1 - tC) * (rcX + 140 - rcX) + 2 * tC * (rcX + 280 - (rcX + 140));
    const dy =
      2 * (1 - tC) * (baseY - 280 - baseY) + 2 * tC * (baseY - (baseY - 280));
    const angle = Math.atan2(dy, dx);

    ctx.save();
    ctx.translate(cartX, cartY - 8);
    ctx.rotate(angle);

    ctx.fillStyle = i === 0 ? "#ff4757" : "#1e90ff";
    ctx.beginPath();
    ctx.roundRect(-20, -12, 40, 20, 6);
    ctx.fill();
    ctx.strokeStyle = "#2f3542";
    ctx.lineWidth = 2;
    ctx.stroke();

    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(-8, -18, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#2ed573";
    ctx.beginPath();
    ctx.arc(8, -18, 5, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }
};

export const drawCircusTent = (ctx, engine) => {
  const { width, height } = engine;
  const baseY = height * 0.6;
  const tentX = width < 600 ? width * 0.15 : width * 0.42;

  ctx.fillStyle = "#ff4757";
  ctx.beginPath();
  ctx.moveTo(tentX, baseY - 180);
  ctx.lineTo(tentX - 110, baseY);
  ctx.lineTo(tentX + 110, baseY);
  ctx.fill();
  ctx.fillStyle = "#f5f6fa";
  ctx.beginPath();
  ctx.moveTo(tentX, baseY - 180);
  ctx.lineTo(tentX - 55, baseY);
  ctx.lineTo(tentX - 25, baseY);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(tentX, baseY - 180);
  ctx.lineTo(tentX + 55, baseY);
  ctx.lineTo(tentX + 25, baseY);
  ctx.fill();

  ctx.fillStyle = "#2f3542";
  ctx.beginPath();
  ctx.moveTo(tentX - 20, baseY);
  ctx.lineTo(tentX + 20, baseY);
  ctx.lineTo(tentX, baseY - 40);
  ctx.fill();

  ctx.fillStyle = "#2f3542";
  for (let i = -4; i <= 4; i++) {
    ctx.beginPath();
    ctx.arc(
      tentX + i * 22,
      baseY - 90 + Math.abs(i) * 18,
      14,
      0,
      Math.PI,
      false,
    );
    ctx.fill();
  }

  ctx.strokeStyle = "#222";
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(tentX, baseY - 180);
  ctx.lineTo(tentX, baseY - 215);
  ctx.stroke();
  ctx.fillStyle = "#f1c40f";
  ctx.beginPath();
  ctx.moveTo(tentX, baseY - 215);
  ctx.lineTo(tentX + 30, baseY - 200);
  ctx.lineTo(tentX, baseY - 190);
  ctx.fill();
};

export const drawCarousel = (ctx, engine) => {
  const { width, height, time } = engine;
  const baseY = height * 0.6;
  const cX = width < 600 ? width * 0.95 : width * 0.58;
  const cW = 160;
  const cH = 90;

  ctx.fillStyle = "#e84118";
  ctx.beginPath();
  ctx.moveTo(cX, baseY - cH - 45);
  ctx.lineTo(cX - cW / 2, baseY - cH);
  ctx.lineTo(cX + cW / 2, baseY - cH);
  ctx.fill();
  ctx.fillStyle = "#f5f6fa";
  ctx.beginPath();
  ctx.moveTo(cX, baseY - cH - 45);
  ctx.lineTo(cX - cW / 4, baseY - cH);
  ctx.lineTo(cX - 15, baseY - cH);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(cX, baseY - cH - 45);
  ctx.lineTo(cX + cW / 4, baseY - cH);
  ctx.lineTo(cX + 15, baseY - cH);
  ctx.fill();

  for (let i = 0; i < 8; i++) {
    const sx = cX - cW / 2 + 10 + i * 20;
    ctx.fillStyle = i % 2 === 0 ? "#e84118" : "#f5f6fa";
    ctx.beginPath();
    ctx.arc(sx, baseY - cH, 10, 0, Math.PI, false);
    ctx.fill();
    ctx.fillStyle = "#f1c40f";
    ctx.beginPath();
    ctx.arc(sx, baseY - cH + 5, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = "#2f3542";
  ctx.fillRect(cX - cW / 2, baseY - 18, cW, 18);
  ctx.fillStyle = "#ff4757";
  ctx.fillRect(cX - cW / 2, baseY - 10, cW, 4);

  for (let i = 0; i < 6; i++) {
    const px = cX - cW / 2 + 15 + i * 26;
    ctx.fillStyle = "#dcdde1";
    ctx.fillRect(px, baseY - cH, 4, cH);

    const hBounce = Math.sin(time * 2.5 + i) * 18;

    ctx.save();
    ctx.translate(px + 2, baseY - cH / 2 + hBounce);
    ctx.fillStyle = i % 2 === 0 ? "#9b59b6" : "#3498db";
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-8, -8, 5, 8, -Math.PI / 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(-12, -14, 6, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#f1c40f";
    ctx.fillRect(-4, -6, 8, 4);
    ctx.restore();
  }
};

const drawBunting = (ctx, engine) => {
  const { width, time } = engine;
  ctx.strokeStyle = "#2f3542";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(0, 50);
  ctx.quadraticCurveTo(width / 2, 150 + Math.sin(time) * 20, width, 50);
  ctx.stroke();
  for (let i = 1; i < 25; i++) {
    const bT = i / 25;
    const bx = 2 * (1 - bT) * bT * (width / 2) + bT ** 2 * width;
    const by =
      (1 - bT) ** 2 * 50 +
      2 * (1 - bT) * bT * (150 + Math.sin(time) * 20) +
      bT ** 2 * 50;
    ctx.fillStyle = i % 2 === 0 ? "#ff4757" : "#1e90ff";
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.lineTo(bx - 12, by + 25);
    ctx.lineTo(bx + 12, by + 25);
    ctx.fill();
    ctx.stroke();
  }
};

export const drawMidground = (ctx, engine) => {
  drawFerrisWheel(ctx, engine);
  drawDropTower(ctx, engine);
  drawRollercoaster(ctx, engine);
  drawCircusTent(ctx, engine);
  drawCarousel(ctx, engine);
  drawBunting(ctx, engine);
  drawPedestrians(ctx, engine);
};
