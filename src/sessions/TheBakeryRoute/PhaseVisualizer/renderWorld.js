import { toIso } from "./isoMath";
import {
  BAKERY_BOUNDS,
  BENCHES,
  BUILDINGS,
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  CROSSWALKS,
  DETOUR_CURVE,
  HOME,
  HOME_BOUNDS,
  MAIN_CURVE,
  STREET_LIGHTS,
  TREES,
} from "./sceneData";

const drawPath = (ctx, curve, width, color, frames, isDashed = false) => {
  ctx.beginPath();
  ctx.moveTo(curve.p0.x, curve.p0.y);
  ctx.bezierCurveTo(
    curve.p1.x,
    curve.p1.y,
    curve.p2.x,
    curve.p2.y,
    curve.p3.x,
    curve.p3.y,
  );
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = "round";
  if (isDashed) {
    ctx.setLineDash([20, 25]);
    ctx.lineDashOffset = -frames * 0.6;
  } else {
    ctx.setLineDash([]);
  }
  ctx.stroke();
  ctx.setLineDash([]);
};

export const drawGroundLayer = (
  ctx,
  { scale, frames, grassTufts, currentDetourLevel, currentDesireLevel },
) => {
  // === 1. Background ===
  ctx.setTransform(scale, 0, 0, scale, 0, 0);
  ctx.fillStyle = "#020b06";
  ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

  // === 2. Flat Ground Layer ===
  ctx.save();
  ctx.setTransform(
    scale * -0.7,
    scale * 0.45,
    scale * 0.7,
    scale * 0.45,
    scale * 470,
    scale * -40,
  );

  // Grass tufts
  ctx.strokeStyle = "#064e3b";
  ctx.lineWidth = 1.5;
  ctx.globalAlpha = 0.5;
  for (const grass of grassTufts) {
    ctx.beginPath();
    ctx.moveTo(grass.x, grass.y);
    ctx.lineTo(grass.x + 8, grass.y + 8);
    ctx.stroke();
  }
  ctx.globalAlpha = 1.0;

  // Smooth Detour Path Transition
  if (currentDetourLevel > 0.01) {
    ctx.globalAlpha = currentDetourLevel;
    drawPath(ctx, DETOUR_CURVE, 36, "#1e293b", frames);
    drawPath(ctx, DETOUR_CURVE, 3, "#334155", frames, true);
  }
  if (currentDetourLevel < 0.99) {
    ctx.globalAlpha = 1 - currentDetourLevel;
    ctx.beginPath();
    ctx.moveTo(DETOUR_CURVE.p0.x, DETOUR_CURVE.p0.y);
    ctx.bezierCurveTo(
      DETOUR_CURVE.p1.x,
      DETOUR_CURVE.p1.y,
      DETOUR_CURVE.p2.x,
      DETOUR_CURVE.p2.y,
      DETOUR_CURVE.p3.x,
      DETOUR_CURVE.p3.y,
    );
    ctx.strokeStyle = "#0f172a";
    ctx.lineWidth = 3;
    ctx.setLineDash([8, 12]);
    ctx.stroke();
    ctx.setLineDash([]);
  }
  ctx.globalAlpha = 1.0;

  // Main Path
  drawPath(ctx, MAIN_CURVE, 36, "#1e293b", frames);
  drawPath(ctx, MAIN_CURVE, 30, "#0f172a", frames);

  // Smoothly shift dashed line path color based on Desire state
  const pR = 71 + (217 - 71) * currentDesireLevel;
  const pG = 85 + (119 - 85) * currentDesireLevel;
  const pB = 105 + (6 - 105) * currentDesireLevel;
  const pA = 0.5 + (0.6 - 0.5) * currentDesireLevel;
  drawPath(
    ctx,
    MAIN_CURVE,
    5,
    `rgba(${pR}, ${pG}, ${pB}, ${pA})`,
    frames,
    true,
  );

  // Crosswalks
  ctx.fillStyle = "rgba(255, 255, 255, 0.25)";
  for (const cw of CROSSWALKS) {
    for (let i = 0; i < cw.count; i++) {
      if (cw.horizontal) {
        ctx.fillRect(cw.x + i * cw.gap, cw.y, cw.width, cw.height);
      } else {
        ctx.fillRect(cw.x, cw.y + i * cw.gap, cw.width, cw.height);
      }
    }
  }

  // Ground glows
  const hGlow = ctx.createRadialGradient(HOME.x, HOME.y, 0, HOME.x, HOME.y, 80);
  hGlow.addColorStop(0, "rgba(59, 130, 246, 0.25)");
  hGlow.addColorStop(1, "transparent");
  ctx.fillStyle = hGlow;
  ctx.beginPath();
  ctx.arc(HOME.x, HOME.y, 80, 0, Math.PI * 2);
  ctx.fill();

  for (const light of STREET_LIGHTS) {
    const gradient = ctx.createRadialGradient(
      light.x,
      light.y,
      0,
      light.x,
      light.y,
      50,
    );
    gradient.addColorStop(0, "rgba(253, 224, 71, 0.2)");
    gradient.addColorStop(1, "transparent");
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(light.x, light.y, 50, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
};

const queueMistAndFireflies = (obj, ctx, mistPatches, fireflies) => {
  for (const mist of mistPatches) {
    mist.x += mist.speed;
    if (mist.x > CANVAS_WIDTH + mist.size * 2) {
      mist.x = -mist.size * 2;
      mist.y = Math.random() * CANVAS_HEIGHT;
    }
    obj(mist.x + mist.y, () => {
      const pos = toIso(mist.x, mist.y, -10);
      ctx.fillStyle = "rgba(148, 163, 184, 0.035)";
      ctx.beginPath();
      ctx.ellipse(pos.x, pos.y, mist.size, mist.size * 0.4, 0, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  for (const f of fireflies) {
    f.phase += f.twinkleSpeed;
    f.x += f.vx;
    f.y += f.vy;
    if (f.x < 0) f.x = CANVAS_WIDTH;
    if (f.x > CANVAS_WIDTH) f.x = 0;
    if (f.y < 0) f.y = CANVAS_HEIGHT;
    if (f.y > CANVAS_HEIGHT) f.y = 0;
    obj(f.x + f.y, () => {
      const pos = toIso(f.x, f.y, 20 + Math.sin(f.phase) * 10);
      ctx.fillStyle = `rgba(163, 230, 53, ${Math.abs(Math.sin(f.phase)) * 0.9 + 0.1})`;
      ctx.beginPath();
      ctx.arc(pos.x, pos.y, f.size, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

const queueBenches = (obj, ctx) => {
  for (const bench of BENCHES) {
    obj(bench.x + bench.w / 2 + bench.y + bench.h / 2, () => {
      const z = 8;
      const bl = toIso(bench.x, bench.y + bench.h, z);
      const br = toIso(bench.x + bench.w, bench.y + bench.h, z);
      const tl = toIso(bench.x, bench.y, z);
      const tr = toIso(bench.x + bench.w, bench.y, z);
      const drop = toIso(bench.x, bench.y, 0).y - toIso(bench.x, bench.y, z).y;

      ctx.fillStyle = "#451a03";
      ctx.fillRect(tl.x - 1, tl.y, 2, drop);
      ctx.fillRect(tr.x - 1, tr.y, 2, drop);
      ctx.fillRect(bl.x - 1, bl.y, 2, drop);
      ctx.fillRect(br.x - 1, br.y, 2, drop);

      ctx.fillStyle = bench.color;
      ctx.beginPath();
      ctx.moveTo(tl.x, tl.y);
      ctx.lineTo(tr.x, tr.y);
      ctx.lineTo(br.x, br.y);
      ctx.lineTo(bl.x, bl.y);
      ctx.fill();
    });
  }
};

const queueBuildings = (obj, ctx) => {
  for (const b of BUILDINGS) {
    obj(b.x + b.w / 2 + b.y + b.h / 2, () => {
      const topL = toIso(b.x, b.y, b.z);
      const topR = toIso(b.x + b.w, b.y, b.z);
      const botR = toIso(b.x + b.w, b.y + b.h, b.z);
      const botL = toIso(b.x, b.y + b.h, b.z);

      const gTopR = toIso(b.x + b.w, b.y, 0);
      const gBotR = toIso(b.x + b.w, b.y + b.h, 0);
      const gBotL = toIso(b.x, b.y + b.h, 0);

      ctx.fillStyle = "rgba(0,0,0,0.4)";
      const shadowL = toIso(b.x - 15, b.y + b.h + 15, 0);
      const shadowR = toIso(b.x + b.w - 5, b.y + b.h + 20, 0);
      ctx.beginPath();
      ctx.moveTo(gBotL.x, gBotL.y);
      ctx.lineTo(gBotR.x, gBotR.y);
      ctx.lineTo(shadowR.x, shadowR.y);
      ctx.lineTo(shadowL.x, shadowL.y);
      ctx.fill();

      ctx.fillStyle = b.colors[2];
      ctx.beginPath();
      ctx.moveTo(topR.x, topR.y);
      ctx.lineTo(botR.x, botR.y);
      ctx.lineTo(gBotR.x, gBotR.y);
      ctx.lineTo(gTopR.x, gTopR.y);
      ctx.fill();

      ctx.fillStyle = b.colors[1];
      ctx.beginPath();
      ctx.moveTo(botL.x, botL.y);
      ctx.lineTo(botR.x, botR.y);
      ctx.lineTo(gBotR.x, gBotR.y);
      ctx.lineTo(gBotL.x, gBotL.y);
      ctx.fill();

      const winRows = Math.floor(b.z / 25);
      const winCols = Math.floor(b.w / 18);
      for (let r = 0; r < winRows; r++) {
        for (let c = 0; c < winCols; c++) {
          const isLit = (b.x + b.y + r + c) % 7 === 0;
          ctx.fillStyle = isLit
            ? "rgba(253, 224, 71, 0.45)"
            : "rgba(255, 255, 255, 0.03)";

          const wZ = 20 + r * 22;
          const wX = b.x + 8 + c * 16;

          const wTL = toIso(wX, b.y + b.h, wZ + 12);
          const wTR = toIso(wX + 8, b.y + b.h, wZ + 12);
          const wBR = toIso(wX + 8, b.y + b.h, wZ);
          const wBL = toIso(wX, b.y + b.h, wZ);

          ctx.beginPath();
          ctx.moveTo(wTL.x, wTL.y);
          ctx.lineTo(wTR.x, wTR.y);
          ctx.lineTo(wBR.x, wBR.y);
          ctx.lineTo(wBL.x, wBL.y);
          ctx.fill();
        }
      }

      const winColsL = Math.floor(b.h / 18);
      for (let r = 0; r < winRows; r++) {
        for (let c = 0; c < winColsL; c++) {
          const isLit = (b.x + b.y + r + c * 2) % 9 === 0;
          ctx.fillStyle = isLit
            ? "rgba(253, 224, 71, 0.3)"
            : "rgba(255, 255, 255, 0.015)";

          const wZ = 20 + r * 22;
          const wY = b.y + 8 + c * 16;

          const wTL = toIso(b.x + b.w, wY, wZ + 12);
          const wTR = toIso(b.x + b.w, wY + 8, wZ + 12);
          const wBR = toIso(b.x + b.w, wY + 8, wZ);
          const wBL = toIso(b.x + b.w, wY, wZ);

          ctx.beginPath();
          ctx.moveTo(wTL.x, wTL.y);
          ctx.lineTo(wTR.x, wTR.y);
          ctx.lineTo(wBR.x, wBR.y);
          ctx.lineTo(wBL.x, wBL.y);
          ctx.fill();
        }
      }

      ctx.fillStyle = b.colors[0];
      ctx.beginPath();
      ctx.moveTo(topL.x, topL.y);
      ctx.lineTo(topR.x, topR.y);
      ctx.lineTo(botR.x, botR.y);
      ctx.lineTo(botL.x, botL.y);
      ctx.fill();

      ctx.fillStyle = "rgba(0,0,0,0.15)";
      const pad = 4;
      const iTopL = toIso(b.x + pad, b.y + pad, b.z);
      const iTopR = toIso(b.x + b.w - pad, b.y + pad, b.z);
      const iBotR = toIso(b.x + b.w - pad, b.y + b.h - pad, b.z);
      const iBotL = toIso(b.x + pad, b.y + b.h - pad, b.z);
      ctx.beginPath();
      ctx.moveTo(iTopL.x, iTopL.y);
      ctx.lineTo(iTopR.x, iTopR.y);
      ctx.lineTo(iBotR.x, iBotR.y);
      ctx.lineTo(iBotL.x, iBotL.y);
      ctx.fill();
    });
  }
};

const queueHome = (obj, ctx) => {
  const { x: homeX, y: homeY, w: homeW, h: homeH, z } = HOME_BOUNDS;
  obj(homeX + homeW / 2 + homeY + homeH / 2, () => {
    const topR = toIso(homeX + homeW, homeY, z);
    const botR = toIso(homeX + homeW, homeY + homeH, z);
    const botL = toIso(homeX, homeY + homeH, z);
    const pk = toIso(homeX + homeW / 2, homeY + homeH / 2, z + 25);

    ctx.fillStyle = "#172554";
    ctx.beginPath();
    ctx.moveTo(topR.x, topR.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(
      toIso(homeX + homeW, homeY + homeH, 0).x,
      toIso(homeX + homeW, homeY + homeH, 0).y,
    );
    ctx.lineTo(
      toIso(homeX + homeW, homeY, 0).x,
      toIso(homeX + homeW, homeY, 0).y,
    );
    ctx.fill();

    ctx.fillStyle = "#1e3a8a";
    ctx.beginPath();
    ctx.moveTo(botL.x, botL.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(
      toIso(homeX + homeW, homeY + homeH, 0).x,
      toIso(homeX + homeW, homeY + homeH, 0).y,
    );
    ctx.lineTo(
      toIso(homeX, homeY + homeH, 0).x,
      toIso(homeX, homeY + homeH, 0).y,
    );
    ctx.fill();

    ctx.fillStyle = "#2563eb";
    ctx.beginPath();
    ctx.moveTo(topR.x, topR.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(pk.x, pk.y);
    ctx.fill();

    ctx.fillStyle = "#3b82f6";
    ctx.beginPath();
    ctx.moveTo(botL.x, botL.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(pk.x, pk.y);
    ctx.fill();

    ctx.fillStyle = "#60a5fa";
    ctx.shadowColor = "#93c5fd";
    ctx.shadowBlur = 10;
    const doorTL = toIso(homeX + homeW / 2 - 8, homeY + homeH, 18);
    const doorTR = toIso(homeX + homeW / 2 + 8, homeY + homeH, 18);
    ctx.beginPath();
    ctx.moveTo(doorTL.x, doorTL.y);
    ctx.lineTo(doorTR.x, doorTR.y);
    ctx.lineTo(
      toIso(homeX + homeW / 2 + 8, homeY + homeH, 0).x,
      toIso(homeX + homeW / 2 + 8, homeY + homeH, 0).y,
    );
    ctx.lineTo(
      toIso(homeX + homeW / 2 - 8, homeY + homeH, 0).x,
      toIso(homeX + homeW / 2 - 8, homeY + homeH, 0).y,
    );
    ctx.fill();
    ctx.shadowBlur = 0;
  });
};

const queueBakery = (obj, ctx, frames) => {
  const { x: bakX, y: bakY, w: bakW, h: bakH, z } = BAKERY_BOUNDS;
  obj(bakX + bakW / 2 + bakY + bakH / 2, () => {
    const topL = toIso(bakX, bakY, z);
    const topR = toIso(bakX + bakW, bakY, z);
    const botR = toIso(bakX + bakW, bakY + bakH, z);
    const botL = toIso(bakX, bakY + bakH, z);

    ctx.fillStyle = "#451a03";
    ctx.beginPath();
    ctx.moveTo(topR.x, topR.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(
      toIso(bakX + bakW, bakY + bakH, 0).x,
      toIso(bakX + bakW, bakY + bakH, 0).y,
    );
    ctx.lineTo(toIso(bakX + bakW, bakY, 0).x, toIso(bakX + bakW, bakY, 0).y);
    ctx.fill();

    ctx.fillStyle = "#78350f";
    ctx.beginPath();
    ctx.moveTo(botL.x, botL.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(
      toIso(bakX + bakW, bakY + bakH, 0).x,
      toIso(bakX + bakW, bakY + bakH, 0).y,
    );
    ctx.lineTo(toIso(bakX, bakY + bakH, 0).x, toIso(bakX, bakY + bakH, 0).y);
    ctx.fill();

    ctx.fillStyle = "#92400e";
    ctx.beginPath();
    ctx.moveTo(topL.x, topL.y);
    ctx.lineTo(topR.x, topR.y);
    ctx.lineTo(botR.x, botR.y);
    ctx.lineTo(botL.x, botL.y);
    ctx.fill();

    const faceX = bakX + bakW;
    for (let i = 0; i < 7; i++) {
      ctx.fillStyle = i % 2 === 0 ? "#ef4444" : "#fef2f2";
      const sliceH = bakH / 7;
      const aTL = toIso(faceX, bakY + i * sliceH, z - 8);
      const aTR = toIso(faceX, bakY + (i + 1) * sliceH, z - 8);
      const aBR = toIso(faceX + 15, bakY + (i + 1) * sliceH, z - 18);
      const aBL = toIso(faceX + 15, bakY + i * sliceH, z - 18);
      ctx.beginPath();
      ctx.moveTo(aTL.x, aTL.y);
      ctx.lineTo(aTR.x, aTR.y);
      ctx.lineTo(aBR.x, aBR.y);
      ctx.lineTo(aBL.x, aBL.y);
      ctx.fill();
    }

    const wTL = toIso(faceX, bakY + bakH * 0.2, z - 25);
    const wTR = toIso(faceX, bakY + bakH * 0.8, z - 25);
    const wBR = toIso(faceX, bakY + bakH * 0.8, z - 45);
    const wBL = toIso(faceX, bakY + bakH * 0.2, z - 45);
    ctx.fillStyle = "#fef08a";
    ctx.shadowColor = "#f59e0b";
    ctx.shadowBlur = 20 + Math.sin(frames * 0.08) * 10;
    ctx.beginPath();
    ctx.moveTo(wTL.x, wTL.y);
    ctx.lineTo(wTR.x, wTR.y);
    ctx.lineTo(wBR.x, wBR.y);
    ctx.lineTo(wBL.x, wBL.y);
    ctx.fill();
    ctx.shadowBlur = 0;
  });
};

const queueTreesAndLights = (obj, ctx) => {
  const clusters = [
    { dx: -0.3, dy: 0, dz: -0.2, s: 0.7 },
    { dx: 0.3, dy: 0, dz: -0.2, s: 0.7 },
    { dx: 0, dy: -0.3, dz: -0.2, s: 0.75 },
    { dx: 0, dy: 0, dz: 0.15, s: 0.85 },
    { dx: 0, dy: 0, dz: 0, s: 1.0 },
  ];

  for (const tree of TREES) {
    obj(tree.x + tree.y, () => {
      const trunkH = 15 + tree.size * 0.3;
      const base = toIso(tree.x, tree.y, 0);
      const trunkTop = toIso(tree.x, tree.y, trunkH);
      const canopyCenter = toIso(tree.x, tree.y, trunkH + tree.size * 0.4);

      ctx.fillStyle = "rgba(0,0,0,0.3)";
      ctx.beginPath();
      ctx.ellipse(
        base.x,
        base.y,
        tree.size * 0.8,
        tree.size * 0.4,
        0,
        0,
        Math.PI * 2,
      );
      ctx.fill();

      ctx.fillStyle = "#451a03";
      ctx.beginPath();
      const trunkBottomW = 3 + tree.size * 0.15;
      const trunkTopW = 1.5 + tree.size * 0.08;
      ctx.moveTo(base.x - trunkBottomW, base.y);
      ctx.lineTo(base.x + trunkBottomW, base.y);
      ctx.lineTo(trunkTop.x + trunkTopW, trunkTop.y);
      ctx.lineTo(trunkTop.x - trunkTopW, trunkTop.y);
      ctx.fill();

      for (const c of clusters) {
        const cx = canopyCenter.x + c.dx * tree.size;
        const cy = canopyCenter.y + c.dy * tree.size - c.dz * tree.size;

        ctx.fillStyle = tree.color;
        ctx.beginPath();
        ctx.arc(cx, cy, tree.size * 0.65 * c.s, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(255,255,255,0.06)";
        ctx.beginPath();
        ctx.arc(
          cx - tree.size * 0.15 * c.s,
          cy - tree.size * 0.15 * c.s,
          tree.size * 0.4 * c.s,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      }
    });
  }

  for (const light of STREET_LIGHTS) {
    obj(light.x + light.y, () => {
      const base = toIso(light.x, light.y, 0);
      const top = toIso(light.x, light.y, 40);
      ctx.strokeStyle = "#475569";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(base.x, base.y);
      ctx.lineTo(top.x, top.y);
      ctx.stroke();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(top.x, top.y, 3, 0, Math.PI * 2);
      ctx.fill();
    });
  }
};

export const queueWorldRenderables = (
  obj,
  ctx,
  { frames, mistPatches, fireflies },
) => {
  queueMistAndFireflies(obj, ctx, mistPatches, fireflies);
  queueBenches(obj, ctx);
  queueBuildings(obj, ctx);
  queueHome(obj, ctx);
  queueBakery(obj, ctx, frames);
  queueTreesAndLights(obj, ctx);
};
