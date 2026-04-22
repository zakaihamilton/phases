// RenderAdamKadmon.js
import { drawMultiColorPipe, draw3DDisk, drawSparks, drawExpandingScreen, hues } from './RenderUtils';

export const drawWorldOfAdamKadmon = (ctx, cx, cy, pState, maxR, time) => {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const phase4Radius = maxR * (1 - (3 * 0.22));

    // Reduced camera pan to match the tighter stagger
    ctx.translate((120 / pState.zoomLevel) * pState.tiltProgress, 0);

    for (let k = 0; k < 5; k++) {
        const layer = pState.layers[k];
        if (layer.kavProgress <= 0.01) continue;

        ctx.save();

        // --- TIGHTER HORIZONTAL PARALLAX ---
        // Reduced from 125 to 60. The layers step gently to the left per purification, 
        // keeping the 3D pipes closely nested instead of slanting out of control.
        ctx.translate(-k * (60 / pState.zoomLevel) * pState.tiltProgress, 0);

        const levelValue = 4 - k;
        const SefFraction = (levelValue + 1) / 5;
        const RoshFraction = levelValue / 4;

        const rTop = cy - phase4Radius;
        const rBot = cy - (phase4Radius * 0.50);
        const rStr = rTop + (rBot - rTop) * 0.80;

        const gTop = rBot;
        const gBot = gTop + (cy - (phase4Radius * 0.25) - gTop) * SefFraction;
        const gStr = gTop + (gBot - gTop) * 0.80;

        const sTop = gBot;
        const sBot = sTop + (cy - (phase4Radius * 0.06) - sTop) * SefFraction;
        const sStr = sTop + (sBot - sTop) * 0.80;

        const partzufColor = hues[k];

        // --- 1. MULTI-COLOR DIRECT LIGHT (Grows Top to Bottom) ---
        if (layer.kavProgress > 0.01) {
            const directProgress = Math.min(1, layer.kavProgress / 0.80);
            drawMultiColorPipe(ctx, cx, rTop, rStr, 10, directProgress, pState.zoomLevel, false);
        }
        if (layer.gufLightProgress > 0.01) {
            const gufDirectProgress = Math.min(1, layer.gufLightProgress / 0.80);
            drawMultiColorPipe(ctx, cx, gTop, gStr, 10, gufDirectProgress, pState.zoomLevel, false);
        }
        if (layer.sofLightProgress > 0.01) {
            const sofDirectProgress = Math.min(1, layer.sofLightProgress / 0.80);
            drawMultiColorPipe(ctx, cx, sTop, sStr, 10, sofDirectProgress, pState.zoomLevel, false);
        }

        // --- 2. MULTI-COLOR REFLECTED LIGHT (Grows Bottom to Top) ---
        if (layer.reflectProgress > 0.01) {
            const actY = rStr - (rStr - rTop) * RoshFraction;
            drawMultiColorPipe(ctx, cx, rStr, actY, 26, layer.reflectProgress, pState.zoomLevel, true);
        }
        if (layer.gufReflectProgress > 0.01) {
            const shyMouth = gTop + (10 / pState.zoomLevel);
            drawMultiColorPipe(ctx, cx, gStr, shyMouth, 26, layer.gufReflectProgress, pState.zoomLevel, true);
        }
        if (layer.sofReflectProgress > 0.01) {
            const shyTabur = sTop + (10 / pState.zoomLevel);
            drawMultiColorPipe(ctx, cx, sStr, shyTabur, 26, layer.sofReflectProgress, pState.zoomLevel, true);
        }

        // --- 3. 3D VOLUMETRIC SCREENS (MASACH) ---
        if (layer.kavProgress > 0.79) {
            const sW = (phase4Radius * 0.50) * 0.5;

            draw3DDisk(ctx, cx, rStr, sW, rBot - rStr, partzufColor, layer.kavProgress, pState.zoomLevel);

            drawExpandingScreen(ctx, cx, gTop, gBot, layer.gufExpandProgresses, sW, pState.zoomLevel, partzufColor);
            if (layer.gufLightProgress > 0.79) {
                draw3DDisk(ctx, cx, gStr, sW, gBot - gStr, partzufColor, layer.gufLightProgress, pState.zoomLevel);
            }

            drawExpandingScreen(ctx, cx, sTop, sBot, layer.sofExpandProgresses, sW, pState.zoomLevel, partzufColor);
            if (layer.sofLightProgress > 0.79) {
                draw3DDisk(ctx, cx, sStr, sW, sBot - sStr, partzufColor, layer.sofLightProgress, pState.zoomLevel);
            }

            drawSparks(ctx, cx, rStr, layer.pehFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, gStr, layer.taburFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, sStr, layer.siyumFlareOpacity, time, pState.zoomLevel);
        }

        ctx.restore();
    }
    ctx.restore();
};