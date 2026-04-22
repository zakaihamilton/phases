// RenderUtils.js

export const phaseRgbs = [[255, 235, 59], [33, 150, 243], [244, 67, 54], [76, 175, 80]];
export const subPhaseRgbs = [[180, 180, 180], [255, 235, 59], [33, 150, 243], [76, 175, 80]];
export const hues = ['180, 180, 180', '255, 235, 59', '33, 150, 243', '244, 67, 54', '76, 175, 80'];

export const BLENDED_COLORS = phaseRgbs.map(mainRgb => {
    return subPhaseRgbs.map(subRgb => {
        const r = Math.round(mainRgb[0] * 0.6 + subRgb[0] * 0.4);
        const g = Math.round(mainRgb[1] * 0.6 + subRgb[1] * 0.4);
        const b = Math.round(mainRgb[2] * 0.6 + subRgb[2] * 0.4);
        return `${r}, ${g}, ${b}`;
    });
});

export const drawGlowStroke = (ctx, colorRgb, opacity, lineWidth, iterations = 3) => {
    if (opacity <= 0.01) return;
    ctx.strokeStyle = `rgba(${colorRgb}, ${opacity})`; ctx.lineWidth = lineWidth; ctx.stroke();
    for (let i = 1; i <= iterations; i++) {
        ctx.strokeStyle = `rgba(${colorRgb}, ${opacity * (0.3 / i)})`;
        ctx.lineWidth = lineWidth + (i * 4); ctx.stroke();
    }
};

export const drawOrb = (ctx, x, y, radius, colorInner, colorOuter, opacity) => {
    if (opacity <= 0.01 || radius <= 0) return;
    ctx.save(); ctx.globalAlpha = opacity; ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, colorInner); grad.addColorStop(1, colorOuter);
    ctx.fillStyle = grad; ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill(); ctx.restore();
};

export const drawSparks = (ctx, cx, yPos, opacity, time, zoomLevel) => {
    if (opacity <= 0.01) return;
    ctx.save(); ctx.globalAlpha = opacity; ctx.translate(cx, yPos);
    for (let i = 0; i < 24; i++) {
        const baseAngle = (Math.PI * 2 / 24) * i;
        const flicker = Math.sin(time * 30 + i * 100);
        if (flicker > 0) {
            const length = (6 + flicker * 25) / zoomLevel;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(baseAngle) * length, Math.sin(baseAngle) * length);
            ctx.strokeStyle = i % 2 === 0 ? `rgba(255, 255, 255, 0.8)` : `rgba(${hues[4]}, 0.6)`;
            ctx.lineWidth = (i % 2 === 0 ? 2 : 3) / zoomLevel; ctx.stroke();
        }
    }
    ctx.beginPath(); ctx.arc(0, 0, 6 / zoomLevel, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fill(); ctx.restore();
};

// --- NEW: MULTI-COLOR 3D CYLINDRICAL PIPES ---
export const drawMultiColorPipe = (ctx, cx, originY, destY, radius, progress, zoomLevel, isHollow) => {
    if (progress <= 0.01) return;
    const r = radius / zoomLevel;
    const totalH = Math.abs(destY - originY);
    if (totalH <= 0.1) return;

    const segH = totalH / 5;
    const direction = destY > originY ? 1 : -1;
    const capSquash = r * 0.35;

    ctx.save();
    ctx.globalCompositeOperation = 'source-over';

    for (let i = 0; i < 5; i++) {
        const segStartProgress = i * 0.2;
        if (progress <= segStartProgress) continue;

        const segLocalProgress = Math.min(1, (progress - segStartProgress) / 0.2);
        const segLength = segH * segLocalProgress;

        const segOriginY = originY + (i * segH * direction);
        const segDestY = segOriginY + (segLength * direction);

        const yMin = Math.min(segOriginY, segDestY);
        const yMax = Math.max(segOriginY, segDestY);
        const h = yMax - yMin;

        // Gray (0), Yellow (1), Blue (2), Red (3), Green (4)
        const rgbStr = hues[i];

        ctx.globalAlpha = isHollow ? 0.85 : 1.0;

        const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
        if (isHollow) {
            grad.addColorStop(0, `rgba(${rgbStr}, 0.9)`);
            grad.addColorStop(0.2, `rgba(${rgbStr}, 0.5)`);
            grad.addColorStop(0.5, `rgba(${rgbStr}, 0.1)`);
            grad.addColorStop(0.8, `rgba(${rgbStr}, 0.5)`);
            grad.addColorStop(1, `rgba(${rgbStr}, 0.9)`);
        } else {
            grad.addColorStop(0, `rgba(${rgbStr}, 0.8)`);
            grad.addColorStop(0.3, `rgba(${rgbStr}, 1)`);
            grad.addColorStop(0.5, `rgba(255, 255, 255, 0.7)`);
            grad.addColorStop(0.7, `rgba(${rgbStr}, 1)`);
            grad.addColorStop(1, `rgba(${rgbStr}, 0.8)`);
        }

        ctx.beginPath();
        ctx.rect(cx - r, yMin, r * 2, h);
        ctx.fillStyle = grad;
        ctx.fill();

        // Add a 3D structural connecting ring between the 5 phases
        if (i > 0 && progress > segStartProgress) {
            ctx.beginPath();
            ctx.ellipse(cx, segOriginY, r, capSquash, 0, 0, Math.PI * 2);
            ctx.strokeStyle = `rgba(255, 255, 255, ${isHollow ? 0.4 : 0.8})`;
            ctx.lineWidth = 1.5 / zoomLevel;
            ctx.stroke();
        }
    }

    const currentEndY = originY + (totalH * progress * direction);
    const lowestY = Math.max(originY, currentEndY);
    const highestY = Math.min(originY, currentEndY);

    const activeColorIdx = Math.floor(Math.min(progress, 0.99) * 5);
    const bottomColorRgb = direction === 1 ? hues[activeColorIdx] : hues[0];
    const topColorRgb = direction === 1 ? hues[0] : hues[activeColorIdx];

    // Bottom Cap
    ctx.beginPath();
    ctx.ellipse(cx, lowestY, r, capSquash, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${bottomColorRgb}, ${isHollow ? 0.8 : 0.9})`;
    ctx.fill();

    // Top Cap
    ctx.beginPath();
    ctx.ellipse(cx, highestY, r, capSquash, 0, 0, Math.PI * 2);
    if (isHollow) {
        ctx.strokeStyle = `rgba(${topColorRgb}, 0.9)`;
        ctx.lineWidth = 2 / zoomLevel;
        ctx.stroke();
        ctx.fillStyle = `rgba(${topColorRgb}, 0.15)`;
        ctx.fill();
    } else {
        ctx.fillStyle = `rgba(255, 255, 255, 0.95)`;
        ctx.fill();
    }

    ctx.restore();
};

// --- 3D VOLUMETRIC SCREENS (MASACH) ---
export const draw3DDisk = (ctx, cx, cy, radius, thickness, rgbStr, opacity, zoomLevel) => {
    if (opacity <= 0.01) return;
    const r = radius / zoomLevel;
    const t = Math.max(thickness, 1) / zoomLevel;
    const capSquash = r * 0.35;

    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = 'source-over';

    ctx.beginPath();
    ctx.ellipse(cx, cy + t, r, capSquash, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgbStr}, 0.4)`;
    ctx.fill();

    const grad = ctx.createLinearGradient(cx - r, 0, cx + r, 0);
    grad.addColorStop(0, `rgba(${rgbStr}, 0.8)`);
    grad.addColorStop(0.5, `rgba(255, 255, 255, 0.5)`);
    grad.addColorStop(1, `rgba(${rgbStr}, 0.8)`);

    ctx.beginPath();
    ctx.rect(cx - r, cy, r * 2, t);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.ellipse(cx, cy, r, capSquash, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${rgbStr}, 0.85)`;
    ctx.fill();

    ctx.strokeStyle = `rgba(255, 255, 255, 0.8)`;
    ctx.lineWidth = 1.5 / zoomLevel;
    ctx.stroke();

    ctx.restore();
};

export const drawExpandingScreen = (ctx, cx, topY, bottomY, progressesArray, screenWidth, zoomLevel, baseRgb) => {
    const sectionHeight = (bottomY - topY) / 5;
    let previousY = topY; let lowestY = topY;

    for (let i = 0; i < 5; i++) {
        const targetY = topY + ((i + 1) * sectionHeight);
        const currentY = previousY + (targetY - previousY) * progressesArray[i];
        if (progressesArray[i] > 0.001) {
            draw3DDisk(ctx, cx, currentY, screenWidth, 4, hues[i], progressesArray[i], zoomLevel);
        }
        previousY = currentY;
        if (currentY > lowestY) lowestY = currentY;
    }
};