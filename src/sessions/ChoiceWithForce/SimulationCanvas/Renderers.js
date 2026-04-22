// Renderers.js

const phaseRgbs = [[255, 235, 59], [33, 150, 243], [244, 67, 54], [76, 175, 80]];
const subPhaseRgbs = [[180, 180, 180], [255, 235, 59], [33, 150, 243], [76, 175, 80]];

const BLENDED_COLORS = phaseRgbs.map(mainRgb => {
    return subPhaseRgbs.map(subRgb => {
        const r = Math.round(mainRgb[0] * 0.6 + subRgb[0] * 0.4);
        const g = Math.round(mainRgb[1] * 0.6 + subRgb[1] * 0.4);
        const b = Math.round(mainRgb[2] * 0.6 + subRgb[2] * 0.4);
        return `${r}, ${g}, ${b}`;
    });
});

const drawGlowStroke = (ctx, colorRgb, opacity, lineWidth, iterations = 3) => {
    if (opacity <= 0.01) return;
    ctx.strokeStyle = `rgba(${colorRgb}, ${opacity})`;
    ctx.lineWidth = lineWidth;
    ctx.stroke();
    for (let i = 1; i <= iterations; i++) {
        const glowOpacity = opacity * (0.3 / i);
        ctx.strokeStyle = `rgba(${colorRgb}, ${glowOpacity})`;
        ctx.lineWidth = lineWidth + (i * 4);
        ctx.stroke();
    }
};

export const drawOrb = (ctx, x, y, radius, colorInner, colorOuter, opacity) => {
    if (opacity <= 0.01 || radius <= 0) return;
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.globalCompositeOperation = 'screen';
    const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
    grad.addColorStop(0, colorInner);
    grad.addColorStop(1, colorOuter);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
};

export const drawRootLight = (ctx, cx, cy, w, h, time, pState) => {
    if (pState.infinityAlpha <= 0.01) return;
    const breathe = Math.sin(time * 2) * 0.05 + 1;
    const maxRadius = Math.max(0, Math.max(w, h) * 0.75 * breathe);
    drawOrb(ctx, cx, cy, maxRadius, 'rgba(180, 180, 180, 0.4)', 'rgba(100, 100, 100, 0)', pState.infinityAlpha);
};

export const drawEmanations = (ctx, cx, cy, time, pState, maxR) => {
    for (let i = 0; i < 4; i++) {
        const phaseMasterOpacity = pState.outerPhasesOpacity;
        if (phaseMasterOpacity <= 0.01 && i < 3) continue;

        const r = maxR * (1 - (i * 0.22));
        const breatheRadius = Math.max(0, r + Math.sin(time * 1.5 + i) * 2);
        const mainRgb = phaseRgbs[i];

        const lightOpacity = pState.lightOpacities[i] * phaseMasterOpacity;
        if (lightOpacity > 0.01) {
            ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${mainRgb[0]}, ${mainRgb[1]}, ${mainRgb[2]}, 0.25)`;
            ctx.globalAlpha = lightOpacity; ctx.globalCompositeOperation = 'screen'; ctx.fill();
            ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1;
        }

        if (i === 3 && pState.voidOpacity > 0.01) {
            ctx.beginPath(); ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${pState.voidOpacity})`; ctx.fill();
        }

        for (let j = 0; j < 4; j++) {
            const layerOpacity = pState.subVesselOpacities[i][j] * phaseMasterOpacity;
            if (layerOpacity > 0.01) {
                const layerRadius = Math.max(0, breatheRadius - (j * 4 / pState.zoomLevel));
                ctx.beginPath(); ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);
                drawGlowStroke(ctx, BLENDED_COLORS[i][j], layerOpacity, 2 / pState.zoomLevel, 2);
            }
        }

        if (i === 3) {
            for (let j = 0; j < 5; j++) {
                const layerOp = pState.restrictionOpacities[j];
                if (layerOp > 0.01) {
                    const restrictRadiusScale = 1 - (j * 0.10);
                    const restrictR = r * restrictRadiusScale;
                    const restrictBreatheR = Math.max(0, restrictR + Math.sin(time * 1.5 + i + j) * 1.5);
                    ctx.beginPath(); ctx.arc(cx, cy, restrictBreatheR, 0, Math.PI * 2);
                    drawGlowStroke(ctx, '220, 230, 255', layerOp * 0.9, 2 / pState.zoomLevel, 2);
                }
            }
        }
    }
};

export const drawKav = (ctx, cx, cy, w, h, pState, maxR, time) => {
    if (pState.kavProgress <= 0.01) return;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';

    // GEOMETRY
    const phase4Radius = maxR * (1 - (3 * 0.22));

    // ROSH
    const roshTopY = cy - phase4Radius;
    const roshBottomY = cy - (phase4Radius * 0.50); // Peh
    const roshStrikeY = roshTopY + (roshBottomY - roshTopY) * 0.80;

    // GUF (Interior)
    const gufTopY = roshBottomY;
    const gufBottomY = cy - (phase4Radius * 0.25);  // Tabur
    const gufStrikeY = gufTopY + (gufBottomY - gufTopY) * 0.80;

    // SOF (End)
    const sofTopY = gufBottomY;
    // NEW: The Siyum explicitly stops 6% ABOVE the absolute center of the innermost circle (cy)
    const sofBottomY = cy - (phase4Radius * 0.06);
    const sofStrikeY = sofTopY + (sofBottomY - sofTopY) * 0.80;

    // LIGHT DESCENTS
    const roshLightY = roshTopY + (roshBottomY - roshTopY) * pState.kavProgress;
    const gufLightY = gufTopY + (gufBottomY - gufTopY) * pState.gufLightProgress;
    const sofLightY = sofTopY + (sofBottomY - sofTopY) * pState.sofLightProgress;

    const hues = ['180, 180, 180', '255, 235, 59', '33, 150, 243', '244, 67, 54', '76, 175, 80'];

    // GRADIENTS
    const buildGradients = (topY, bottomY) => {
        const dlGrad = ctx.createLinearGradient(cx, topY, cx, bottomY);
        const rlGrad = ctx.createLinearGradient(cx, bottomY, cx, topY);
        for (let i = 0; i < 5; i++) {
            dlGrad.addColorStop(i * 0.25, `rgb(${hues[i]})`);
            rlGrad.addColorStop(i * 0.25, `rgb(${hues[i]})`);
        }
        return { dlGrad, rlGrad };
    };

    const { dlGrad: dlGradRosh, rlGrad: rlGradRosh } = buildGradients(roshTopY, roshBottomY);
    const { dlGrad: dlGradGuf, rlGrad: rlGradGuf } = buildGradients(gufTopY, gufBottomY);
    const { dlGrad: dlGradSof, rlGrad: rlGradSof } = buildGradients(sofTopY, sofBottomY);

    // Reflected Light walls expanded to handle 48px width (half is 24px)
    const drawWalls = (topY, bottomY, opacity) => {
        ctx.beginPath();
        ctx.moveTo(cx - (24 / pState.zoomLevel), bottomY); ctx.lineTo(cx - (24 / pState.zoomLevel), topY);
        ctx.moveTo(cx + (24 / pState.zoomLevel), bottomY); ctx.lineTo(cx + (24 / pState.zoomLevel), topY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`;
        ctx.lineWidth = 2 / pState.zoomLevel;
        ctx.stroke();
    };

    // 1. REFLECTED LIGHT (OHR CHOZER)
    // ROSH
    if (pState.reflectProgress > 0.01) {
        const crownReflectProgress = Math.min(pState.reflectProgress * 5, 1);
        const currentTopY_Crown = roshBottomY - (roshBottomY - roshStrikeY) * crownReflectProgress;

        ctx.save(); ctx.globalAlpha = pState.reflectProgress;
        ctx.beginPath(); ctx.moveTo(cx, roshBottomY); ctx.lineTo(cx, currentTopY_Crown);
        ctx.strokeStyle = rlGradRosh; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke(); // Widened to 48
        drawWalls(currentTopY_Crown, roshBottomY, pState.reflectProgress);

        if (pState.reflectProgress > 0.20) {
            const upwardReflectProgress = (pState.reflectProgress - 0.20) / 0.80;
            const currentTopY_Rest = roshStrikeY - (roshStrikeY - roshTopY) * upwardReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, roshStrikeY); ctx.lineTo(cx, currentTopY_Rest);
            ctx.strokeStyle = rlGradRosh; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke(); // Widened to 48
            drawWalls(currentTopY_Rest, roshStrikeY, pState.reflectProgress);
        }
        ctx.restore();
    }
    // GUF 
    if (pState.gufReflectProgress > 0.01) {
        const crownReflectProgress = Math.min(pState.gufReflectProgress * 5, 1);
        const currentTopY_Crown = gufBottomY - (gufBottomY - gufStrikeY) * crownReflectProgress;

        ctx.save(); ctx.globalAlpha = pState.gufReflectProgress;
        ctx.beginPath(); ctx.moveTo(cx, gufBottomY); ctx.lineTo(cx, currentTopY_Crown);
        ctx.strokeStyle = rlGradGuf; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke(); // Widened to 48
        drawWalls(currentTopY_Crown, gufBottomY, pState.gufReflectProgress);

        if (pState.gufReflectProgress > 0.20) {
            const upwardReflectProgress = (pState.gufReflectProgress - 0.20) / 0.80;
            const shyOfMouthY = gufTopY + (10 / pState.zoomLevel);
            const currentTopY_Rest = gufStrikeY - (gufStrikeY - shyOfMouthY) * upwardReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, gufStrikeY); ctx.lineTo(cx, currentTopY_Rest);
            ctx.strokeStyle = rlGradGuf; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke(); // Widened to 48
            drawWalls(currentTopY_Rest, gufStrikeY, pState.gufReflectProgress);
        }
        ctx.restore();
    }
    // SOF
    if (pState.sofReflectProgress > 0.01) {
        const crownReflectProgress = Math.min(pState.sofReflectProgress * 5, 1);
        const currentTopY_Crown = sofBottomY - (sofBottomY - sofStrikeY) * crownReflectProgress;

        ctx.save(); ctx.globalAlpha = pState.sofReflectProgress;
        ctx.beginPath(); ctx.moveTo(cx, sofBottomY); ctx.lineTo(cx, currentTopY_Crown);
        ctx.strokeStyle = rlGradSof; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke(); // Widened to 48
        drawWalls(currentTopY_Crown, sofBottomY, pState.sofReflectProgress);

        if (pState.sofReflectProgress > 0.20) {
            const upwardReflectProgress = (pState.sofReflectProgress - 0.20) / 0.80;
            const shyOfTaburY = sofTopY + (10 / pState.zoomLevel);
            const currentTopY_Rest = sofStrikeY - (sofStrikeY - shyOfTaburY) * upwardReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, sofStrikeY); ctx.lineTo(cx, currentTopY_Rest);
            ctx.strokeStyle = rlGradSof; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke(); // Widened to 48
            drawWalls(currentTopY_Rest, sofStrikeY, pState.sofReflectProgress);
        }
        ctx.restore();
    }

    // 2. DIRECT LIGHT (OHR YASHAR)
    const drawDirectLight = (topY, bottomY, grad, opacityModifier = 1) => {
        // Main beam widened to 20px
        ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, bottomY);
        ctx.strokeStyle = grad; ctx.lineWidth = 20 / pState.zoomLevel; ctx.stroke();

        // Inner white core brightened/thickened slightly to match
        ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, bottomY);
        ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * opacityModifier})`; ctx.lineWidth = 2.5 / pState.zoomLevel; ctx.stroke();
    };

    // ROSH
    ctx.save(); ctx.globalAlpha = pState.kavProgress;
    drawDirectLight(roshTopY, roshLightY, dlGradRosh);
    ctx.restore();

    // GUF 
    if (pState.gufLightProgress > 0.01) {
        ctx.save(); ctx.globalAlpha = 1;
        drawDirectLight(gufTopY, gufLightY, dlGradGuf);
        ctx.restore();
    }

    // SOF (Half Opacity - Light of Mercy)
    if (pState.sofLightProgress > 0.01) {
        ctx.save();
        ctx.globalAlpha = 0.5;
        drawDirectLight(sofTopY, sofLightY, dlGradSof, 0.5);
        ctx.restore();
    }

    // 3. THE SCREENS & SPARKS
    if (pState.kavProgress > 0.79) {
        // Widened the horizontal screen to support the new 48px reflected light perfectly
        const screenWidth = (phase4Radius * 0.50) * 0.5;

        const drawHorizontalLines = (topY, bottomY, progressesArray) => {
            const sectionHeight = (bottomY - topY) / 5;
            for (let i = 0; i < 5; i++) {
                if (progressesArray[i] > 0.001) {
                    const startLineY = topY + (i * sectionHeight);
                    const finalLineY = topY + ((i + 1) * sectionHeight);
                    const lineY = startLineY + (finalLineY - startLineY) * progressesArray[i];
                    ctx.beginPath(); ctx.moveTo(cx - screenWidth, lineY); ctx.lineTo(cx + screenWidth, lineY);
                    ctx.strokeStyle = `rgba(${hues[i]}, ${progressesArray[i]})`;
                    ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
                }
            }
        };

        // Rosh Masach Rectangle
        ctx.beginPath(); ctx.rect(cx - screenWidth, roshStrikeY, screenWidth * 2, roshBottomY - roshStrikeY);
        ctx.strokeStyle = `rgba(100, 200, 255, ${pState.kavProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();

        // Guf Lines & Rectangle
        drawHorizontalLines(gufTopY, gufBottomY, pState.gufExpandProgresses);
        if (pState.gufLightProgress > 0.79) {
            ctx.beginPath(); ctx.rect(cx - screenWidth, gufStrikeY, screenWidth * 2, gufBottomY - gufStrikeY);
            ctx.strokeStyle = `rgba(100, 200, 255, ${pState.gufLightProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
        }

        // Sof Lines & Rectangle
        drawHorizontalLines(sofTopY, sofBottomY, pState.sofExpandProgresses);
        if (pState.sofLightProgress > 0.79) {
            ctx.beginPath(); ctx.rect(cx - screenWidth, sofStrikeY, screenWidth * 2, sofBottomY - sofStrikeY);
            ctx.strokeStyle = `rgba(100, 200, 255, ${pState.sofLightProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
        }

        // Sparks Generator
        const drawSparks = (yPos, opacity) => {
            if (opacity <= 0.01) return;
            ctx.save(); ctx.globalAlpha = opacity; ctx.translate(cx, yPos);
            for (let i = 0; i < 24; i++) { // Increased particle count to match wider beam
                const baseAngle = (Math.PI * 2 / 24) * i;
                const flicker = Math.sin(time * 30 + i * 100);
                if (flicker > 0) {
                    const length = (6 + flicker * 25) / pState.zoomLevel; // Sparks stretch slightly further
                    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(baseAngle) * length, Math.sin(baseAngle) * length);
                    const isCore = i % 2 === 0;
                    ctx.strokeStyle = isCore ? `rgba(255, 255, 255, 0.8)` : `rgba(${hues[4]}, 0.6)`;
                    ctx.lineWidth = (isCore ? 2 : 3) / pState.zoomLevel; ctx.stroke();
                }
            }
            ctx.beginPath(); ctx.arc(0, 0, 6 / pState.zoomLevel, 0, Math.PI * 2); // Larger impact core
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)'; ctx.fill(); ctx.restore();
        };

        drawSparks(roshStrikeY, pState.pehFlareOpacity);
        drawSparks(gufStrikeY, pState.taburFlareOpacity);
        drawSparks(sofStrikeY, pState.siyumFlareOpacity);
    }

    // 4. THE WINDOW & CIRCLE FILL
    if (pState.windowProgress > 0.01) {
        const crownOuterR = phase4Radius * 1.0; const crownInnerR = phase4Radius * 0.90;
        const bOuter = Math.max(0, crownOuterR + Math.sin(time * 1.5 + 3) * 1.5);
        const bInner = Math.max(0, crownInnerR + Math.sin(time * 1.5 + 3.5) * 1.5);

        ctx.save(); ctx.globalAlpha = pState.windowProgress;
        ctx.beginPath(); ctx.arc(cx, cy, bOuter, 0, Math.PI * 2); drawGlowStroke(ctx, hues[0], 0.8, 4 / pState.zoomLevel, 2);
        ctx.beginPath(); ctx.arc(cx, cy, bInner, 0, Math.PI * 2); drawGlowStroke(ctx, hues[0], 0.8, 4 / pState.zoomLevel, 2);

        if (pState.windowFillProgress > 0.01) {
            ctx.beginPath(); ctx.arc(cx, cy, crownOuterR, 0, Math.PI * 2, false); ctx.arc(cx, cy, crownInnerR, 0, Math.PI * 2, true);
            ctx.fillStyle = `rgba(200, 200, 200, ${pState.windowFillProgress * 0.75})`; ctx.fill();
        }
        ctx.restore();
    }
    ctx.restore();
};