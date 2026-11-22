import { toIso } from "./isoMath";
import { BAKERY_BOUNDS } from "./sceneData";

export const updateAndQueueParticles = (
  obj,
  ctx,
  {
    frames,
    currentPhase,
    pos,
    bounce,
    isNearBakery,
    aromaParticles,
    emotionParticles,
  },
) => {
  const { x: bakX, y: bakY, w: bakW, h: bakH, z: bakZ } = BAKERY_BOUNDS;

  if (frames % 5 === 0) {
    aromaParticles.push({
      x: bakX + bakW + 12,
      y: bakY + bakH / 2,
      z: bakZ + 10,
      vx: Math.random() * 2.5 + 0.8,
      vy: Math.random() * 1.2 + 0.5,
      life: 1,
      size: Math.random() * 12 + 10,
      spin: Math.random() * Math.PI * 2,
    });
  }

  for (let i = aromaParticles.length - 1; i >= 0; i--) {
    const p = aromaParticles[i];
    p.x += p.vx;
    p.y += p.vy;
    p.life -= 0.005;
    p.spin += 0.02;
    p.vx += Math.sin(frames * 0.02 + p.y) * 0.04;
    if (p.life <= 0) {
      aromaParticles.splice(i, 1);
    } else {
      obj(p.x + p.y, () => {
        p.z = (p.z || bakZ + 10) + 0.3;
        const aPos = toIso(p.x, p.y, p.z);
        ctx.save();
        ctx.translate(aPos.x, aPos.y);
        ctx.rotate(p.spin);
        ctx.beginPath();
        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${p.life * 0.18})`;
        ctx.fill();
        ctx.restore();
      });
    }
  }

  if (isNearBakery && frames % (currentPhase.hasDesire ? 20 : 40) === 0) {
    emotionParticles.push({
      x: pos.x,
      y: pos.y,
      z: bounce + 18,
      vx: currentPhase.hasDesire
        ? Math.random() * 1 + 0.5
        : Math.random() * -0.5 - 0.2,
      vy: Math.random() * -1.5 - 0.5,
      life: 1,
      type: currentPhase.hasDesire ? "desire" : "indifferent",
      scale: Math.random() * 0.5 + 0.5,
    });
  }

  for (let i = emotionParticles.length - 1; i >= 0; i--) {
    const ep = emotionParticles[i];
    ep.x += ep.vx;
    ep.y += ep.vy;
    ep.life -= 0.012;
    if (ep.life <= 0) {
      emotionParticles.splice(i, 1);
    } else {
      obj(ep.x + ep.y, () => {
        ep.z = (ep.z || 0) + 1;
        const ePos = toIso(ep.x, ep.y, ep.z + 15);
        ctx.globalAlpha = ep.life * 0.4;
        if (ep.type === "desire") {
          ctx.save();
          ctx.translate(ePos.x, ePos.y);
          ctx.scale(ep.scale * 0.7, ep.scale * 0.7);
          ctx.fillStyle = "#FDA4AF";
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.bezierCurveTo(0, -4, -6, -18, -18, -18);
          ctx.bezierCurveTo(-36, -18, -36, 6, -36, 6);
          ctx.bezierCurveTo(-36, 24, -12, 36, 0, 48);
          ctx.bezierCurveTo(12, 36, 36, 24, 36, 6);
          ctx.bezierCurveTo(36, 6, 36, -18, 18, -18);
          ctx.bezierCurveTo(6, -18, 0, -4, 0, 0);
          ctx.fill();
          ctx.restore();
        } else {
          ctx.fillStyle = "#64748B";
          ctx.beginPath();
          ctx.arc(ePos.x, ePos.y, 3 * ep.scale, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = "#475569";
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.arc(ePos.x, ePos.y, 8 * ep.scale - ep.life * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.globalAlpha = 1;
      });
    }
  }
};
