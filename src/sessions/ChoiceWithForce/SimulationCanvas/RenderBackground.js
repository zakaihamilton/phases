// RenderBackground.js
import { phaseRgbs, hues, BLENDED_COLORS, drawOrb, drawGlowStroke } from './RenderUtils';

export const drawRootLight = (ctx, cx, cy, w, h, time, pState) => {
    if (pState.infinityAlpha <= 0.01) return;
    const breathe = Math.sin(time * 2) * 0.05 + 1;
    const maxRadius = Math.max(0, Math.max(w, h) * 0.75 * breathe);

    for (let i = 0; i < 5; i++) {
        if (pState.rootOpacities[i] > 0.01) {
            const r = maxRadius * (1 - (i * 0.08));
            drawOrb(ctx, cx, cy, r, `rgba(${hues[i]}, 0.3)`, `rgba(0, 0, 0, 0)`, pState.rootOpacities[i]);
        }
    }
};

export const drawEmanations = (ctx, cx, cy, time, pState, maxR) => {
    for (let i = 0; i < 4; i++) {
        const phaseMasterOpacity = pState.outerPhasesOpacity;
        if (phaseMasterOpacity <= 0.01 && i < 3) continue;

        const r = maxR * (1 - (i * 0.22));
        const breatheRadius = Math.max(0, r + Math.sin(time * 1.5 + i) * 2);
        const mainRgb = phaseRgbs[i];

        if (pState.lightOpacities[i] > 0.01) {
            ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${mainRgb[0]}, ${mainRgb[1]}, ${mainRgb[2]}, 0.25)`;
            ctx.globalAlpha = pState.lightOpacities[i] * phaseMasterOpacity; ctx.globalCompositeOperation = 'screen'; ctx.fill();
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }
        if (i === 3 && pState.voidOpacity > 0.01) {
            ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${pState.voidOpacity})`; ctx.fill();
        }
        for (let j = 0; j < 4; j++) {
            if (pState.subVesselOpacities[i][j] * phaseMasterOpacity > 0.01) {
                const layerRadius = Math.max(0, breatheRadius - (j * 4 / pState.zoomLevel));
                ctx.beginPath(); ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);
                drawGlowStroke(ctx, BLENDED_COLORS[i][j], pState.subVesselOpacities[i][j] * phaseMasterOpacity, 2 / pState.zoomLevel, 2);
            }
        }
        if (i === 3) {
            for (let j = 0; j < 5; j++) {
                if (pState.restrictionOpacities[j] > 0.01) {
                    const restrictRadiusScale = 1 - (j * 0.10);
                    const restrictBreatheR = Math.max(0, r * restrictRadiusScale + Math.sin(time * 1.5 + i + j) * 1.5);
                    ctx.beginPath(); ctx.arc(cx, cy, restrictBreatheR, 0, Math.PI * 2);
                    drawGlowStroke(ctx, '220, 230, 255', pState.restrictionOpacities[j] * 0.9, 2 / pState.zoomLevel, 2);
                }
            }
        }
    }

    const phase4Radius = maxR * (1 - (3 * 0.22));

    for (let k = 0; k < 5; k++) {
        const layer = pState.layers[k];
        if (layer.windowProgress > 0.01) {
            ctx.save();

            // NO PARALLAX OFFSETS HERE! 
            // This ensures the window fills map perfectly to the exact center of the Circles of Restriction!

            const outerR = phase4Radius * (1 - (k * 0.10));
            const innerR = Math.max(0, phase4Radius * (1 - ((k + 1) * 0.10)));

            const bOuter = Math.max(0, outerR + Math.sin(time * 1.5 + 3 + k) * 1.5);
            const bInner = Math.max(0, innerR + Math.sin(time * 1.5 + 3 + (k + 1)) * 1.5);

            ctx.globalAlpha = layer.windowProgress;

            ctx.beginPath(); ctx.arc(cx, cy, bOuter, 0, Math.PI * 2);
            drawGlowStroke(ctx, hues[k], 0.8, 4 / pState.zoomLevel, 2);

            ctx.beginPath(); ctx.arc(cx, cy, bInner, 0, Math.PI * 2);
            drawGlowStroke(ctx, hues[k], 0.8, 4 / pState.zoomLevel, 2);

            if (layer.windowFillProgress > 0.01) {
                ctx.beginPath();
                ctx.arc(cx, cy, outerR, 0, Math.PI * 2, false);
                ctx.arc(cx, cy, innerR, 0, Math.PI * 2, true);
                ctx.fillStyle = `rgba(${hues[k]}, ${layer.windowFillProgress * 0.45})`;
                ctx.fill();
            }
            ctx.restore();
        }
    }
};