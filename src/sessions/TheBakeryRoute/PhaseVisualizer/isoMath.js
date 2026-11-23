/**
 * Isometric projection, Bezier curve evaluation, and color parsing helpers
 * for TheBakeryRoute PhaseVisualizer canvas.
 */

export const toIso = (originalX, originalY, z = 0) => {
  const x = originalY;
  const y = originalX;
  return {
    x: 0.7 * x - 0.7 * y + 470,
    y: 0.45 * x + 0.45 * y - 40 - z,
  };
};

export const parseColor = (colorStr) => {
  if (!colorStr) return [96, 165, 250];
  const s = colorStr.toLowerCase().trim();
  if (s.startsWith("rgb")) {
    const match = s.match(/\d+(\.\d+)?/g);
    if (match && match.length >= 3) {
      return [parseFloat(match[0]), parseFloat(match[1]), parseFloat(match[2])];
    }
  }
  if (s.startsWith("#")) {
    let hex = s.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    if (hex.length >= 6) {
      return [
        parseInt(hex.slice(0, 2), 16),
        parseInt(hex.slice(2, 4), 16),
        parseInt(hex.slice(4, 6), 16),
      ];
    }
  }
  return [96, 165, 250];
};

export const getBezierXY = (t, curve) => {
  const { p0, p1, p2, p3 } = curve;
  const cX = 3 * (p1.x - p0.x);
  const bX = 3 * (p2.x - p1.x) - cX;
  const aX = p3.x - p0.x - cX - bX;
  const cY = 3 * (p1.y - p0.y);
  const bY = 3 * (p2.y - p1.y) - cY;
  const aY = p3.y - p0.y - cY - bY;
  return {
    x: aX * t ** 3 + bX * t ** 2 + cX * t + p0.x,
    y: aY * t ** 3 + bY * t ** 2 + cY * t + p0.y,
  };
};

export const lerpPoint = (p1, p2, t) => ({
  x: p1.x + (p2.x - p1.x) * t,
  y: p1.y + (p2.y - p1.y) * t,
});
