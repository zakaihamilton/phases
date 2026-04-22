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
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${mainRgb[0]}, ${mainRgb[1]}, ${mainRgb[2]}, 0.25)`;
            ctx.globalAlpha = lightOpacity;
            ctx.globalCompositeOperation = 'screen';
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
            ctx.globalAlpha = 1;
        }

        if (i === 3 && pState.voidOpacity > 0.01) {
            ctx.beginPath();
            ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 0, 0, ${pState.voidOpacity})`;
            ctx.fill();
        }

        for (let j = 0; j < 4; j++) {
            const layerOpacity = pState.subVesselOpacities[i][j] * phaseMasterOpacity;
            if (layerOpacity > 0.01) {
                const layerRadius = Math.max(0, breatheRadius - (j * 4 / pState.zoomLevel));
                const blendedRgb = BLENDED_COLORS[i][j];

                ctx.beginPath();
                ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);
                drawGlowStroke(ctx, blendedRgb, layerOpacity, 2 / pState.zoomLevel, 2);
            }
        }

        if (i === 3) {
            for (let j = 0; j < 5; j++) {
                const layerOp = pState.restrictionOpacities[j];
                if (layerOp > 0.01) {
                    const restrictRadiusScale = 1 - (j * 0.10);
                    const restrictR = r * restrictRadiusScale;
                    const restrictBreatheR = Math.max(0, restrictR + Math.sin(time * 1.5 + i + j) * 1.5);

                    ctx.beginPath();
                    ctx.arc(cx, cy, restrictBreatheR, 0, Math.PI * 2);
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

    const phase4Radius = maxR * (1 - (3 * 0.22));
    const startY = cy - phase4Radius;

    // NEW ACCORDION LOGIC: The screen dynamically drops near the center (scale 0.10)
    const baseScreenY = cy - (phase4Radius * 0.50);
    const maxExpandedScreenY = cy - (phase4Radius * 0.10);
    const dynamicScreenY = baseScreenY + (maxExpandedScreenY - baseScreenY) * (pState.screenExpandProgress || 0);

    const currentY = startY + (dynamicScreenY - startY) * pState.kavProgress;

    const hues = [
        '180, 180, 180', // 0: Crown
        '255, 235, 59',  // 1: Wisdom
        '33, 150, 243',  // 2: Understanding
        '244, 67, 54',   // 3: Beauty
        '76, 175, 80'    // 4: Kingdom
    ];

    // Gradients (Dynamically stretching to the new bottom screen)
    const dlGrad = ctx.createLinearGradient(cx, startY, cx, dynamicScreenY);
    dlGrad.addColorStop(0, `rgb(${hues[0]})`);
    dlGrad.addColorStop(0.25, `rgb(${hues[1]})`);
    dlGrad.addColorStop(0.5, `rgb(${hues[2]})`);
    dlGrad.addColorStop(0.75, `rgb(${hues[3]})`);
    dlGrad.addColorStop(1, `rgb(${hues[4]})`);

    const rlGrad = ctx.createLinearGradient(cx, dynamicScreenY, cx, startY);
    rlGrad.addColorStop(0, `rgb(${hues[0]})`);
    rlGrad.addColorStop(0.25, `rgb(${hues[1]})`);
    rlGrad.addColorStop(0.5, `rgb(${hues[2]})`);
    rlGrad.addColorStop(0.75, `rgb(${hues[3]})`);
    rlGrad.addColorStop(1, `rgb(${hues[4]})`);

    // 1. REFLECTED LIGHT (Stretches downwards seamlessly!)
    if (pState.reflectProgress > 0.01) {
        const currentReflectY = dynamicScreenY - (dynamicScreenY - startY) * pState.reflectProgress;
        ctx.save();
        ctx.globalAlpha = pState.reflectProgress;
        ctx.beginPath();
        ctx.moveTo(cx, dynamicScreenY);
        ctx.lineTo(cx, currentReflectY);
        ctx.strokeStyle = rlGrad;
        ctx.lineWidth = 32 / pState.zoomLevel;
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(cx - (15 / pState.zoomLevel), dynamicScreenY);
        ctx.lineTo(cx - (15 / pState.zoomLevel), currentReflectY);
        ctx.moveTo(cx + (15 / pState.zoomLevel), dynamicScreenY);
        ctx.lineTo(cx + (15 / pState.zoomLevel), currentReflectY);
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.lineWidth = 1.5 / pState.zoomLevel;
        ctx.stroke();
        ctx.restore();
    }

    // 2. DIRECT LIGHT
    ctx.save();
    ctx.globalAlpha = pState.kavProgress;
    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.lineTo(cx, currentY);
    ctx.strokeStyle = dlGrad;
    ctx.lineWidth = 12 / pState.zoomLevel;
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.lineTo(cx, currentY);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.lineWidth = 1.5 / pState.zoomLevel;
    ctx.stroke();
    ctx.restore();

    // 3. THE MASACH (SCREEN) - ACCORDION EXPANSION
    if (pState.kavProgress > 0.99) {
        const screenWidth = (phase4Radius * 0.50) * 0.4;

        // Loop 5 times to create the internal phases (Crown to Kingdom)
        for (let i = 0; i < 5; i++) {
            // When progress is 0, they all sit tightly overlapping at baseScreenY.
            // As progress approaches 1, they spread out down to dynamicScreenY.
            const lineY = baseScreenY + (dynamicScreenY - baseScreenY) * (i / 4);

            ctx.beginPath();
            ctx.moveTo(cx - screenWidth, lineY);
            ctx.lineTo(cx + screenWidth, lineY);

            // Color code the 5 horizontal screens to the 5 Sefirot
            ctx.strokeStyle = `rgba(${hues[i]}, ${pState.kavProgress})`;
            ctx.lineWidth = 3 / pState.zoomLevel;
            ctx.stroke();
        }

        // The Sparks perfectly ride the bottom-most screen as it descends
        ctx.save();
        ctx.translate(cx, dynamicScreenY);
        const numSparks = 18;
        for (let i = 0; i < numSparks; i++) {
            const baseAngle = (Math.PI * 2 / numSparks) * i;
            const flicker = Math.sin(time * 30 + i * 100);

            if (flicker > 0) {
                const length = (4 + flicker * 20) / pState.zoomLevel;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(baseAngle) * length, Math.sin(baseAngle) * length);
                const isCore = i % 2 === 0;
                ctx.strokeStyle = isCore ? `rgba(255, 255, 255, 0.8)` : `rgba(${hues[4]}, 0.6)`;
                ctx.lineWidth = (isCore ? 1.5 : 3) / pState.zoomLevel;
                ctx.stroke();
            }
        }
        ctx.beginPath();
        ctx.arc(0, 0, 4 / pState.zoomLevel, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.fill();
        ctx.restore();
    }

    // 4. THE WINDOW & CIRCLE FILL
    if (pState.windowProgress > 0.01) {
        const crownOuterR = phase4Radius * 1.0;
        const crownInnerR = phase4Radius * 0.90;
        const bOuter = Math.max(0, crownOuterR + Math.sin(time * 1.5 + 3) * 1.5);
        const bInner = Math.max(0, crownInnerR + Math.sin(time * 1.5 + 3.5) * 1.5);

        ctx.save();
        ctx.globalAlpha = pState.windowProgress;

        ctx.beginPath();
        ctx.arc(cx, cy, bOuter, 0, Math.PI * 2);
        drawGlowStroke(ctx, hues[0], 0.8, 4 / pState.zoomLevel, 2);

        ctx.beginPath();
        ctx.arc(cx, cy, bInner, 0, Math.PI * 2);
        drawGlowStroke(ctx, hues[0], 0.8, 4 / pState.zoomLevel, 2);

        if (pState.windowFillProgress > 0.01) {
            ctx.beginPath();
            ctx.arc(cx, cy, crownOuterR, 0, Math.PI * 2, false);
            ctx.arc(cx, cy, crownInnerR, 0, Math.PI * 2, true);
            ctx.fillStyle = `rgba(200, 200, 200, ${pState.windowFillProgress * 0.75})`;
            ctx.fill();
        }
        ctx.restore();
    }

    ctx.restore();
};