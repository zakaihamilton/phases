// RenderAdamKadmon.js
import { buildGradients, drawWalls, drawDirectLight, drawSparks, drawExpandingScreen } from './RenderUtils';

export const drawWorldOfAdamKadmon = (ctx, cx, cy, pState, maxR, time) => {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const phase4Radius = maxR * (1 - (3 * 0.22));

    ctx.translate((200 / pState.zoomLevel) * pState.tiltProgress, 0);

    for (let k = 0; k < 5; k++) {
        const layer = pState.layers[k];
        if (layer.kavProgress <= 0.01) continue;

        ctx.save();

        ctx.translate(-k * (100 / pState.zoomLevel) * pState.tiltProgress, 0);

        const levelValue = 4 - k;
        const SefFraction = (levelValue + 1) / 5;
        const RoshFraction = levelValue / 4;

        // Geometry Engine
        const rTop = cy - phase4Radius;
        const rBot = cy - (phase4Radius * 0.50);
        const rStr = rTop + (rBot - rTop) * 0.80;

        const gTop = rBot;
        const gBot = gTop + (cy - (phase4Radius * 0.25) - gTop) * SefFraction;
        const gStr = gTop + (gBot - gTop) * 0.80;

        const sTop = gBot;
        const sBot = sTop + (cy - (phase4Radius * 0.06) - sTop) * SefFraction;
        const sStr = sTop + (sBot - sTop) * 0.80;

        const { dlGrad: rGradD, rlGrad: rGradR } = buildGradients(ctx, cx, rTop, rBot);
        const { dlGrad: gGradD, rlGrad: gGradR } = buildGradients(ctx, cx, gTop, gBot);
        const { dlGrad: sGradD, rlGrad: sGradR } = buildGradients(ctx, cx, sTop, sBot);

        // 1. REFLECTED LIGHT
        if (layer.reflectProgress > 0.01) {
            const crPrg = Math.min(layer.reflectProgress * 5, 1);
            const curY = rBot - (rBot - rStr) * crPrg;
            ctx.save(); ctx.globalAlpha = layer.reflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, rBot); ctx.lineTo(cx, curY);
            ctx.strokeStyle = rGradR; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
            drawWalls(ctx, cx, curY, rBot, layer.reflectProgress, pState.zoomLevel);

            if (layer.reflectProgress > 0.20) {
                const upPrg = (layer.reflectProgress - 0.20) / 0.80;
                const actY = rStr - (rStr - rTop) * RoshFraction;
                const curRest = rStr - (rStr - actY) * upPrg;
                ctx.beginPath(); ctx.moveTo(cx, rStr); ctx.lineTo(cx, curRest);
                ctx.strokeStyle = rGradR; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
                drawWalls(ctx, cx, curRest, rStr, layer.reflectProgress, pState.zoomLevel);
            }
            ctx.restore();
        }

        if (layer.gufReflectProgress > 0.01) {
            const crPrg = Math.min(layer.gufReflectProgress * 5, 1);
            const curY = gBot - (gBot - gStr) * crPrg;
            ctx.save(); ctx.globalAlpha = layer.gufReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, gBot); ctx.lineTo(cx, curY);
            ctx.strokeStyle = gGradR; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
            drawWalls(ctx, cx, curY, gBot, layer.gufReflectProgress, pState.zoomLevel);

            if (layer.gufReflectProgress > 0.20) {
                const upPrg = (layer.gufReflectProgress - 0.20) / 0.80;
                const shyMouth = gTop + (10 / pState.zoomLevel);
                const curRest = gStr - (gStr - shyMouth) * upPrg;
                ctx.beginPath(); ctx.moveTo(cx, gStr); ctx.lineTo(cx, curRest);
                ctx.strokeStyle = gGradR; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
                drawWalls(ctx, cx, curRest, gStr, layer.gufReflectProgress, pState.zoomLevel);
            }
            ctx.restore();
        }

        if (layer.sofReflectProgress > 0.01) {
            const crPrg = Math.min(layer.sofReflectProgress * 5, 1);
            const curY = sBot - (sBot - sStr) * crPrg;
            ctx.save(); ctx.globalAlpha = layer.sofReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, sBot); ctx.lineTo(cx, curY);
            ctx.strokeStyle = sGradR; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
            drawWalls(ctx, cx, curY, sBot, layer.sofReflectProgress, pState.zoomLevel);

            if (layer.sofReflectProgress > 0.20) {
                const upPrg = (layer.sofReflectProgress - 0.20) / 0.80;
                const shyTabur = sTop + (10 / pState.zoomLevel);
                const curRest = sStr - (sStr - shyTabur) * upPrg;
                ctx.beginPath(); ctx.moveTo(cx, sStr); ctx.lineTo(cx, curRest);
                ctx.strokeStyle = sGradR; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
                drawWalls(ctx, cx, curRest, sStr, layer.sofReflectProgress, pState.zoomLevel);
            }
            ctx.restore();
        }

        // 2. DIRECT LIGHT
        ctx.save(); ctx.globalAlpha = layer.kavProgress;
        drawDirectLight(ctx, cx, rTop, rTop + (rBot - rTop) * layer.kavProgress, rGradD, 1, pState.zoomLevel); ctx.restore();

        if (layer.gufLightProgress > 0.01) {
            ctx.save(); ctx.globalAlpha = 1;
            drawDirectLight(ctx, cx, gTop, gTop + (gBot - gTop) * layer.gufLightProgress, gGradD, 1, pState.zoomLevel); ctx.restore();
        }

        if (layer.sofLightProgress > 0.01) {
            ctx.save(); ctx.globalAlpha = 0.5;
            drawDirectLight(ctx, cx, sTop, sTop + (sBot - sTop) * layer.sofLightProgress, sGradD, 0.5, pState.zoomLevel); ctx.restore();
        }

        // 3. SCREENS & SPARKS
        if (layer.kavProgress > 0.79) {
            const sW = (phase4Radius * 0.50) * 0.5;

            ctx.beginPath(); ctx.rect(cx - sW, rStr, sW * 2, rBot - rStr);
            ctx.strokeStyle = `rgba(100, 200, 255, ${layer.kavProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();

            drawExpandingScreen(ctx, cx, gTop, gBot, layer.gufExpandProgresses, sW, pState.zoomLevel);
            if (layer.gufLightProgress > 0.79) {
                ctx.beginPath(); ctx.rect(cx - sW, gStr, sW * 2, gBot - gStr);
                ctx.strokeStyle = `rgba(100, 200, 255, ${layer.gufLightProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
            }

            drawExpandingScreen(ctx, cx, sTop, sBot, layer.sofExpandProgresses, sW, pState.zoomLevel);
            if (layer.sofLightProgress > 0.79) {
                ctx.beginPath(); ctx.rect(cx - sW, sStr, sW * 2, sBot - sStr);
                ctx.strokeStyle = `rgba(100, 200, 255, ${layer.sofLightProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
            }

            drawSparks(ctx, cx, rStr, layer.pehFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, gStr, layer.taburFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, sStr, layer.siyumFlareOpacity, time, pState.zoomLevel);
        }

        ctx.restore();
    }
    ctx.restore();
};