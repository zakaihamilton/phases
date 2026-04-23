// RenderAdamKadmon.js
import { drawMultiColorPipe, draw3DDisk, drawSparks, drawExpandingScreen, hues } from './RenderUtils';

export const drawWorldOfAdamKadmon = (ctx, cx, cy, pState, maxR, time) => {
    ctx.save(); ctx.globalCompositeOperation = 'screen';

    const phase4Radius = maxR * (1 - (3 * 0.22));
    const tilt = pState.tiltProgress || 0;

    // Shift the whole bundle to center the stagger
    ctx.translate((120 / pState.zoomLevel) * tilt, 0);

    for (let k = 0; k < 5; k++) {
        const layer = pState.layers[k];

        if (!layer || layer.rayProgress <= 0.01) continue;

        ctx.save();

        // PURE X-AXIS STAGGER: This cleanly steps the vertical pipes side-by-side!
        ctx.translate(-k * (80 / pState.zoomLevel) * tilt, 0);

        const levelValue = 4 - k;
        const SefFraction = (levelValue + 1) / 5;
        const RoshFraction = levelValue / 4;

        const hTop = cy - phase4Radius;
        const hBot = cy - (phase4Radius * 0.50);
        const hStr = hTop + (hBot - hTop) * 0.80;

        const bTop = hStr;
        const bMaxBot = bTop + (cy - (phase4Radius * 0.25) - bTop) * SefFraction;
        const bStr = bTop + (bMaxBot - bTop) * 0.80;

        const eTop = bStr;
        const eMaxBot = eTop + (cy - (phase4Radius * 0.06) - eTop) * SefFraction;
        const eStr = eTop + (eMaxBot - eTop) * 0.80;

        const partzufColor = hues[k];

        // --- 1. DIRECT LIGHT ---
        if (layer.rayProgress > 0.01) {
            drawMultiColorPipe(ctx, cx, hTop, hBot, 10, layer.rayProgress, pState.zoomLevel, false);
        }
        if (layer.bodyLightProgress > 0.01) {
            drawMultiColorPipe(ctx, cx, bTop, bMaxBot, 10, layer.bodyLightProgress, pState.zoomLevel, false);
        }
        if (layer.endLightProgress > 0.01) {
            drawMultiColorPipe(ctx, cx, eTop, eMaxBot, 10, layer.endLightProgress, pState.zoomLevel, false);
        }

        // --- 2. REFLECTED LIGHT ---
        if (layer.headReflectProgress > 0.01) {
            const hRTop = hStr - (hStr - hTop) * RoshFraction;
            drawMultiColorPipe(ctx, cx, hStr, hRTop, 26, layer.headReflectProgress, pState.zoomLevel, true);
        }
        if (layer.bodyReflectProgress > 0.01) {
            const shyMouth = bTop + (10 / pState.zoomLevel);
            drawMultiColorPipe(ctx, cx, bStr, shyMouth, 26, layer.bodyReflectProgress, pState.zoomLevel, true);
        }
        if (layer.endReflectProgress > 0.01) {
            const shyTabur = eTop + (10 / pState.zoomLevel);
            drawMultiColorPipe(ctx, cx, eStr, shyTabur, 26, layer.endReflectProgress, pState.zoomLevel, true);
        }

        // --- 3. SCREENS ---
        if (layer.rayProgress > 0.79) {
            const sW = Math.max(0.1, (phase4Radius * 0.50) * 0.5);

            draw3DDisk(ctx, cx, hStr, sW, hBot - hStr, partzufColor, layer.rayProgress, pState.zoomLevel);

            drawExpandingScreen(ctx, cx, bTop, bMaxBot, layer.bodyExpandProgresses, sW, pState.zoomLevel);
            if (layer.bodyLightProgress > 0.79) {
                draw3DDisk(ctx, cx, bStr, sW, bMaxBot - bStr, partzufColor, layer.bodyLightProgress, pState.zoomLevel);
            }

            drawExpandingScreen(ctx, cx, eTop, eMaxBot, layer.endExpandProgresses, sW, pState.zoomLevel);
            if (layer.endLightProgress > 0.79) {
                draw3DDisk(ctx, cx, eStr, sW, eMaxBot - eStr, partzufColor, layer.endLightProgress, pState.zoomLevel);
            }

            drawSparks(ctx, cx, hStr, layer.mouthFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, bStr, layer.navelFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, eStr, layer.toesFlareOpacity, time, pState.zoomLevel);
        }

        ctx.restore();
    }
    ctx.restore();
};