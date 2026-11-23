import { getBezierXY, lerpPoint, toIso } from "./isoMath";
import { BAKERY, MAIN_CURVE } from "./sceneData";

const WHEEL_COLORS = {
  top: "#334155",
  front: "#0f172a",
  right: "#1e293b",
  back: "#020617",
  left: "#1e293b",
};

const WHEEL_OFFSETS = [
  { lx: 8, ly: -7.5 },
  { lx: 8, ly: 7.5 },
  { lx: -8, ly: -7.5 },
  { lx: -8, ly: 7.5 },
];

const drawInsetPoly = (ctx, pA, pB, pC, pD, insetT, color) => {
  const cx = (pA.x + pB.x + pC.x + pD.x) / 4;
  const cy = (pA.y + pB.y + pC.y + pD.y) / 4;
  const ins = (p) => ({
    x: p.x + (cx - p.x) * insetT,
    y: p.y + (cy - p.y) * insetT,
  });
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(ins(pA).x, ins(pA).y);
  ctx.lineTo(ins(pB).x, ins(pB).y);
  ctx.lineTo(ins(pC).x, ins(pC).y);
  ctx.lineTo(ins(pD).x, ins(pD).y);
  ctx.fill();
};

const drawCabinDetails = (ctx, fIndex, pA, pB, pC, pD) => {
  if (fIndex === 4) return;
  const winColor = "rgba(200, 230, 255, 0.8)";
  const frameColor = "rgba(20, 30, 40, 0.9)";
  drawInsetPoly(ctx, pA, pB, pC, pD, 0.2, frameColor);
  drawInsetPoly(ctx, pA, pB, pC, pD, 0.3, winColor);

  ctx.strokeStyle = "rgba(255,255,255,0.4)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  const cx = (pA.x + pB.x + pC.x + pD.x) / 4;
  const cy = (pA.y + pB.y + pC.y + pD.y) / 4;
  ctx.moveTo(pA.x + (cx - pA.x) * 0.3, pA.y + (cy - pA.y) * 0.3);
  ctx.lineTo(pC.x + (cx - pC.x) * 0.3, pC.y + (cy - pC.y) * 0.3);
  ctx.stroke();
};

const drawBodyDetails = (ctx, fIndex, pA, pB, pC, pD) => {
  if (fIndex === 0) {
    drawInsetPoly(ctx, pA, pB, pC, pD, 0.35, "#111");
    const hl1 = lerpPoint(lerpPoint(pA, pB, 0.2), lerpPoint(pD, pC, 0.2), 0.4);
    const hl2 = lerpPoint(lerpPoint(pA, pB, 0.8), lerpPoint(pD, pC, 0.8), 0.4);
    ctx.fillStyle = "#ffffff";
    ctx.shadowColor = "#fef08a";
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.arc(hl1.x, hl1.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(hl2.x, hl2.y, 2.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  } else if (fIndex === 2) {
    const tl1 = lerpPoint(
      lerpPoint(pA, pB, 0.15),
      lerpPoint(pD, pC, 0.15),
      0.3,
    );
    const tl2 = lerpPoint(
      lerpPoint(pA, pB, 0.85),
      lerpPoint(pD, pC, 0.85),
      0.3,
    );
    ctx.fillStyle = "#f87171";
    ctx.shadowColor = "#dc2626";
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(tl1.x, tl1.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tl2.x, tl2.y, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
};

const drawWheelDetails = (ctx, fIndex, pA, pB, pC, pD) => {
  if (fIndex === 1 || fIndex === 3) {
    drawInsetPoly(ctx, pA, pB, pC, pD, 0.4, "#94a3b8");
  }
};

const flattenRotatedBoxFaces = (
  ctx,
  carFaces,
  { cx, cy, cz, l, w, h, boxAngle, colors, drawFaceDetails = null },
) => {
  const pts = [
    { x: l / 2, y: -w / 2 },
    { x: l / 2, y: w / 2 },
    { x: -l / 2, y: w / 2 },
    { x: -l / 2, y: -w / 2 },
  ].map((p) => {
    const rx = p.x * Math.cos(boxAngle) - p.y * Math.sin(boxAngle);
    const ry = p.x * Math.sin(boxAngle) + p.y * Math.cos(boxAngle);
    return { x: cx + rx, y: cy + ry };
  });

  const top = pts.map((p) => toIso(p.x, p.y, cz + h));
  const bot = pts.map((p) => toIso(p.x, p.y, cz));

  const isObj = typeof colors === "object";
  const faces = [
    {
      p1: 0,
      p2: 1,
      c: isObj ? colors.front : colors,
      over: isObj ? null : "rgba(0,0,0,0.1)",
      index: 0,
      nx: Math.cos(boxAngle),
      ny: Math.sin(boxAngle),
    },
    {
      p1: 1,
      p2: 2,
      c: isObj ? colors.right : colors,
      over: isObj ? null : "rgba(0,0,0,0.3)",
      index: 1,
      nx: -Math.sin(boxAngle),
      ny: Math.cos(boxAngle),
    },
    {
      p1: 2,
      p2: 3,
      c: isObj ? colors.back : colors,
      over: isObj ? null : "rgba(0,0,0,0.5)",
      index: 2,
      nx: -Math.cos(boxAngle),
      ny: -Math.sin(boxAngle),
    },
    {
      p1: 3,
      p2: 0,
      c: isObj ? colors.left : colors,
      over: isObj ? null : "rgba(0,0,0,0.3)",
      index: 3,
      nx: Math.sin(boxAngle),
      ny: -Math.cos(boxAngle),
    },
  ];

  const boxBaseDepth = cx + cy;

  for (const f of faces) {
    // True 3D isometric normal culling
    if (f.nx + f.ny > -0.05) {
      carFaces.push({
        depth: boxBaseDepth + (cz + h / 2) * 1.5,
        draw: () => {
          ctx.fillStyle = f.c;
          ctx.beginPath();
          ctx.moveTo(top[f.p1].x, top[f.p1].y);
          ctx.lineTo(top[f.p2].x, top[f.p2].y);
          ctx.lineTo(bot[f.p2].x, bot[f.p2].y);
          ctx.lineTo(bot[f.p1].x, bot[f.p1].y);
          ctx.fill();
          if (f.over) {
            ctx.fillStyle = f.over;
            ctx.fill();
          }
          ctx.strokeStyle = "rgba(0,0,0,0.15)";
          ctx.lineWidth = 0.5;
          ctx.stroke();
          if (drawFaceDetails) {
            drawFaceDetails(
              ctx,
              f.index,
              top[f.p1],
              top[f.p2],
              bot[f.p2],
              bot[f.p1],
            );
          }
        },
      });
    }
  }

  carFaces.push({
    depth: boxBaseDepth + (cz + h) * 1.5,
    draw: () => {
      ctx.fillStyle = isObj ? colors.top : colors;
      ctx.beginPath();
      ctx.moveTo(top[0].x, top[0].y);
      ctx.lineTo(top[1].x, top[1].y);
      ctx.lineTo(top[2].x, top[2].y);
      ctx.lineTo(top[3].x, top[3].y);
      ctx.fill();
      if (!isObj) {
        ctx.fillStyle = "rgba(255,255,255,0.2)";
        ctx.fill();
      }
      ctx.stroke();
      if (drawFaceDetails) {
        drawFaceDetails(ctx, 4, top[0], top[1], top[2], top[3]);
      }
    },
  });
};

export const updateAndQueueCar = (
  obj,
  ctx,
  { t, frames, trail, currentDesireLevel, bodyColor },
) => {
  const currentT = Math.min(t, 1.0);
  const pos = getBezierXY(currentT, MAIN_CURVE);

  const nextT = Math.min(t + 0.01, 1.0);
  const nextPos = getBezierXY(nextT, MAIN_CURVE);
  let angle = Math.atan2(nextPos.y - pos.y, nextPos.x - pos.x);
  if (t >= 0.99) {
    const prevPos = getBezierXY(0.98, MAIN_CURVE);
    angle = Math.atan2(pos.y - prevPos.y, pos.x - prevPos.x);
  }

  const isNearBakery = Math.hypot(pos.x - BAKERY.x, pos.y - BAKERY.y) < 140;

  const getWorldPos = (localX, localY) => ({
    x: pos.x + localX * Math.cos(angle) - localY * Math.sin(angle),
    y: pos.y + localX * Math.sin(angle) + localY * Math.cos(angle),
  });

  // Smoothly shift tire tracks color
  if (frames % 6 === 0) {
    const tW = 5.5;
    const rearPos = getWorldPos(-8, 0);
    trail.push({
      lx: rearPos.x - Math.sin(angle) * tW,
      ly: rearPos.y + Math.cos(angle) * tW,
      rx: rearPos.x + Math.sin(angle) * tW,
      ry: rearPos.y - Math.cos(angle) * tW,
      life: 1,
    });
  }

  const trackR = 148 + (244 - 148) * currentDesireLevel;
  const trackG = 163 + (63 - 163) * currentDesireLevel;
  const trackB = 184 + (94 - 184) * currentDesireLevel;

  for (let i = trail.length - 1; i >= 0; i--) {
    const tr = trail[i];
    tr.life -= 0.06;
    if (tr.life <= 0) {
      trail.splice(i, 1);
    } else {
      obj(tr.lx + tr.ly, () => {
        const trackLeft = toIso(tr.lx, tr.ly, 1);
        const trackRight = toIso(tr.rx, tr.ry, 1);
        ctx.fillStyle = `rgba(${trackR}, ${trackG}, ${trackB}, ${tr.life * 0.4})`;
        ctx.beginPath();
        ctx.arc(trackLeft.x, trackLeft.y, 1, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(trackRight.x, trackRight.y, 1, 0, Math.PI * 2);
        ctx.fill();
      });
    }
  }

  const bounce = Math.abs(Math.sin(frames * 0.4)) * 1.5;

  // Generate full Z-sorted car representation
  obj(pos.x + pos.y, () => {
    const shadow = toIso(pos.x, pos.y, 0);
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.beginPath();
    ctx.ellipse(shadow.x, shadow.y, 18, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    const carFaces = [];

    // Pushed wheels out slightly to avoid intersecting the main body
    for (const w of WHEEL_OFFSETS) {
      const wp = getWorldPos(w.lx, w.ly);
      flattenRotatedBoxFaces(ctx, carFaces, {
        cx: wp.x,
        cy: wp.y,
        cz: bounce,
        l: 7,
        w: 3,
        h: 5,
        boxAngle: angle,
        colors: WHEEL_COLORS,
        drawFaceDetails: drawWheelDetails,
      });
    }

    flattenRotatedBoxFaces(ctx, carFaces, {
      cx: pos.x,
      cy: pos.y,
      cz: bounce + 2.5,
      l: 26,
      w: 14,
      h: 7,
      boxAngle: angle,
      colors: bodyColor,
      drawFaceDetails: drawBodyDetails,
    });

    const cp = getWorldPos(-2, 0);
    flattenRotatedBoxFaces(ctx, carFaces, {
      cx: cp.x,
      cy: cp.y,
      cz: bounce + 9.5,
      l: 14,
      w: 12,
      h: 6,
      boxAngle: angle,
      colors: bodyColor,
      drawFaceDetails: drawCabinDetails,
    });

    // Execute drawing sequentially based purely on geometry depth
    carFaces.sort((a, b) => a.depth - b.depth);
    for (const r of carFaces) {
      r.draw();
    }
  });

  return { pos, bounce, isNearBakery };
};
