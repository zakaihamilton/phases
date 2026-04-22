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

export const buildGradients = (ctx, cx, topY, bottomY) => {
    const dlGrad = ctx.createLinearGradient(cx, topY, cx, bottomY);
    const rlGrad = ctx.createLinearGradient(cx, bottomY, cx, topY);
    for (let i = 0; i < 5; i++) {
        dlGrad.addColorStop(i * 0.25, `rgb(${hues[i]})`); rlGrad.addColorStop(i * 0.25, `rgb(${hues[i]})`);
    }
    return { dlGrad, rlGrad };
};

export const drawWalls = (ctx, cx, topY, bottomY, opacity, zoomLevel) => {
    ctx.beginPath();
    ctx.moveTo(cx - (24 / zoomLevel), bottomY); ctx.lineTo(cx - (24 / zoomLevel), topY);
    ctx.moveTo(cx + (24 / zoomLevel), bottomY); ctx.lineTo(cx + (24 / zoomLevel), topY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`; ctx.lineWidth = 2 / zoomLevel; ctx.stroke();
};

export const drawDirectLight = (ctx, cx, topY, bottomY, grad, opacityModifier, zoomLevel) => {
    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, bottomY);
    ctx.strokeStyle = grad; ctx.lineWidth = 20 / zoomLevel; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, bottomY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * opacityModifier})`; ctx.lineWidth = 2.5 / zoomLevel; ctx.stroke();
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

export const drawExpandingScreen = (ctx, cx, topY, bottomY, progressesArray, screenWidth, zoomLevel) => {
    const sectionHeight = (bottomY - topY) / 5;
    let previousY = topY; let lowestY = topY;

    for (let i = 0; i < 5; i++) {
        const targetY = topY + ((i + 1) * sectionHeight);
        const currentY = previousY + (targetY - previousY) * progressesArray[i];
        if (progressesArray[i] > 0.001) {
            ctx.beginPath(); ctx.moveTo(cx - screenWidth, currentY); ctx.lineTo(cx + screenWidth, currentY);
            ctx.strokeStyle = `rgba(${hues[i]}, ${progressesArray[i]})`;
            ctx.lineWidth = 3 / zoomLevel; ctx.stroke();
        }
        previousY = currentY;
        if (currentY > lowestY) lowestY = currentY;
    }
    if (lowestY > topY + 0.1) {
        ctx.beginPath(); ctx.moveTo(cx - screenWidth, topY); ctx.lineTo(cx - screenWidth, lowestY);
        ctx.moveTo(cx + screenWidth, topY); ctx.lineTo(cx + screenWidth, lowestY);
        ctx.strokeStyle = `rgba(100, 200, 255, ${progressesArray[0]})`;
        ctx.lineWidth = 3 / zoomLevel; ctx.stroke();
    }
};