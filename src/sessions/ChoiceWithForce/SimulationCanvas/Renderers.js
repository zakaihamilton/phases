// Renderers.js

const phaseRgbs = [[255, 235, 59], [33, 150, 243], [244, 67, 54], [76, 175, 80]];
const subPhaseRgbs = [[180, 180, 180], [255, 235, 59], [33, 150, 243], [76, 175, 80]];
const hues = ['180, 180, 180', '255, 235, 59', '33, 150, 243', '244, 67, 54', '76, 175, 80'];

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
};

// MODULAR COMPONENTS
const buildGradients = (ctx, cx, topY, bottomY) => {
    const dlGrad = ctx.createLinearGradient(cx, topY, cx, bottomY);
    const rlGrad = ctx.createLinearGradient(cx, bottomY, cx, topY);
    for (let i = 0; i < 5; i++) {
        dlGrad.addColorStop(i * 0.25, `rgb(${hues[i]})`); rlGrad.addColorStop(i * 0.25, `rgb(${hues[i]})`);
    }
    return { dlGrad, rlGrad };
};

const drawWalls = (ctx, cx, topY, bottomY, opacity, zoomLevel) => {
    ctx.beginPath();
    ctx.moveTo(cx - (24 / zoomLevel), bottomY); ctx.lineTo(cx - (24 / zoomLevel), topY);
    ctx.moveTo(cx + (24 / zoomLevel), bottomY); ctx.lineTo(cx + (24 / zoomLevel), topY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.9})`; ctx.lineWidth = 2 / zoomLevel; ctx.stroke();
};

const drawDirectLight = (ctx, cx, topY, bottomY, grad, opacityModifier, zoomLevel) => {
    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, bottomY);
    ctx.strokeStyle = grad; ctx.lineWidth = 20 / zoomLevel; ctx.stroke();
    ctx.beginPath(); ctx.moveTo(cx, topY); ctx.lineTo(cx, bottomY);
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.9 * opacityModifier})`; ctx.lineWidth = 2.5 / zoomLevel; ctx.stroke();
};

const drawSparks = (ctx, cx, yPos, opacity, time, zoomLevel) => {
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

// MAIN CONTROLLER
export const drawWorldOfAdamKadmon = (ctx, cx, cy, pState, maxR, time) => {
    ctx.save(); ctx.globalCompositeOperation = 'screen';
    const phase4Radius = maxR * (1 - (3 * 0.22));

    // Shift the entire stack to the right by 200px so that when the 5 nested layers 
    // spread out to the left (100px each), the whole group stays visually centered!
    ctx.translate((200 / pState.zoomLevel) * pState.tiltProgress, 0);

    for (let k = 0; k < 5; k++) {
        const layer = pState.layers[k];
        if (layer.kavProgress <= 0.01) continue;

        ctx.save();

        // Shift each nested layer horizontally to the left so all faces can be seen side-by-side
        ctx.translate(-k * (100 / pState.zoomLevel) * pState.tiltProgress, 0);

        const levelValue = 4 - k;
        const SefirahFraction = (levelValue + 1) / 5;
        const RoshReflectFraction = levelValue / 4;

        const roshTopY = cy - phase4Radius;
        const roshBottomY = cy - (phase4Radius * 0.50);
        const roshStrikeY = roshTopY + (roshBottomY - roshTopY) * 0.80;

        const gufTopY = roshBottomY;
        const gufMaxBottomY = cy - (phase4Radius * 0.25);
        const activeGufBottomY = gufTopY + (gufMaxBottomY - gufTopY) * SefirahFraction;
        const activeGufStrikeY = gufTopY + (activeGufBottomY - gufTopY) * 0.80;

        const sofTopY = activeGufBottomY;
        const sofMaxBottomY = cy - (phase4Radius * 0.06);
        const activeSofBottomY = sofTopY + (sofMaxBottomY - sofTopY) * SefirahFraction;
        const activeSofStrikeY = sofTopY + (activeSofBottomY - sofTopY) * 0.80;

        const { dlGrad: dlGradRosh, rlGrad: rlGradRosh } = buildGradients(ctx, cx, roshTopY, roshBottomY);
        const { dlGrad: dlGradGuf, rlGrad: rlGradGuf } = buildGradients(ctx, cx, gufTopY, activeGufBottomY);
        const { dlGrad: dlGradSof, rlGrad: rlGradSof } = buildGradients(ctx, cx, sofTopY, activeSofBottomY);

        if (layer.reflectProgress > 0.01) {
            const crownReflectProgress = Math.min(layer.reflectProgress * 5, 1);
            const currentTopY_Crown = roshBottomY - (roshBottomY - roshStrikeY) * crownReflectProgress;
            ctx.save(); ctx.globalAlpha = layer.reflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, roshBottomY); ctx.lineTo(cx, currentTopY_Crown);
            ctx.strokeStyle = rlGradRosh; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
            drawWalls(ctx, cx, currentTopY_Crown, roshBottomY, layer.reflectProgress, pState.zoomLevel);

            if (layer.reflectProgress > 0.20) {
                const upwardReflectProgress = (layer.reflectProgress - 0.20) / 0.80;
                const activeRoshReflectTopY = roshStrikeY - (roshStrikeY - roshTopY) * RoshReflectFraction;
                const currentTopY_Rest = roshStrikeY - (roshStrikeY - activeRoshReflectTopY) * upwardReflectProgress;
                ctx.beginPath(); ctx.moveTo(cx, roshStrikeY); ctx.lineTo(cx, currentTopY_Rest);
                ctx.strokeStyle = rlGradRosh; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
                drawWalls(ctx, cx, currentTopY_Rest, roshStrikeY, layer.reflectProgress, pState.zoomLevel);
            }
            ctx.restore();
        }

        if (layer.gufReflectProgress > 0.01) {
            const crownReflectProgress = Math.min(layer.gufReflectProgress * 5, 1);
            const currentTopY_Crown = activeGufBottomY - (activeGufBottomY - activeGufStrikeY) * crownReflectProgress;
            ctx.save(); ctx.globalAlpha = layer.gufReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, activeGufBottomY); ctx.lineTo(cx, currentTopY_Crown);
            ctx.strokeStyle = rlGradGuf; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
            drawWalls(ctx, cx, currentTopY_Crown, activeGufBottomY, layer.gufReflectProgress, pState.zoomLevel);

            if (layer.gufReflectProgress > 0.20) {
                const upwardReflectProgress = (layer.gufReflectProgress - 0.20) / 0.80;
                const shyOfMouthY = gufTopY + (10 / pState.zoomLevel);
                const currentTopY_Rest = activeGufStrikeY - (activeGufStrikeY - shyOfMouthY) * upwardReflectProgress;
                ctx.beginPath(); ctx.moveTo(cx, activeGufStrikeY); ctx.lineTo(cx, currentTopY_Rest);
                ctx.strokeStyle = rlGradGuf; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
                drawWalls(ctx, cx, currentTopY_Rest, activeGufStrikeY, layer.gufReflectProgress, pState.zoomLevel);
            }
            ctx.restore();
        }

        if (layer.sofReflectProgress > 0.01) {
            const crownReflectProgress = Math.min(layer.sofReflectProgress * 5, 1);
            const currentTopY_Crown = activeSofBottomY - (activeSofBottomY - activeSofStrikeY) * crownReflectProgress;
            ctx.save(); ctx.globalAlpha = layer.sofReflectProgress;
            ctx.beginPath(); ctx.moveTo(cx, activeSofBottomY); ctx.lineTo(cx, currentTopY_Crown);
            ctx.strokeStyle = rlGradSof; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
            drawWalls(ctx, cx, currentTopY_Crown, activeSofBottomY, layer.sofReflectProgress, pState.zoomLevel);

            if (layer.sofReflectProgress > 0.20) {
                const upwardReflectProgress = (layer.sofReflectProgress - 0.20) / 0.80;
                const shyOfTaburY = sofTopY + (10 / pState.zoomLevel);
                const currentTopY_Rest = activeSofStrikeY - (activeSofStrikeY - shyOfTaburY) * upwardReflectProgress;
                ctx.beginPath(); ctx.moveTo(cx, activeSofStrikeY); ctx.lineTo(cx, currentTopY_Rest);
                ctx.strokeStyle = rlGradSof; ctx.lineWidth = 48 / pState.zoomLevel; ctx.stroke();
                drawWalls(ctx, cx, currentTopY_Rest, activeSofStrikeY, layer.sofReflectProgress, pState.zoomLevel);
            }
            ctx.restore();
        }

        ctx.save(); ctx.globalAlpha = layer.kavProgress;
        drawDirectLight(ctx, cx, roshTopY, roshTopY + (roshBottomY - roshTopY) * layer.kavProgress, dlGradRosh, 1, pState.zoomLevel); ctx.restore();

        if (layer.gufLightProgress > 0.01) {
            ctx.save(); ctx.globalAlpha = 1;
            drawDirectLight(ctx, cx, gufTopY, gufTopY + (activeGufBottomY - gufTopY) * layer.gufLightProgress, dlGradGuf, 1, pState.zoomLevel); ctx.restore();
        }

        if (layer.sofLightProgress > 0.01) {
            ctx.save(); ctx.globalAlpha = 0.5;
            drawDirectLight(ctx, cx, sofTopY, sofTopY + (activeSofBottomY - sofTopY) * layer.sofLightProgress, dlGradSof, 0.5, pState.zoomLevel); ctx.restore();
        }

        if (layer.kavProgress > 0.79) {
            const screenWidth = (phase4Radius * 0.50) * 0.5;

            const drawExpandingScreen = (topY, bottomY, progressesArray) => {
                const sectionHeight = (bottomY - topY) / 5;
                let previousY = topY; let lowestY = topY;

                for (let i = 0; i < 5; i++) {
                    const targetY = topY + ((i + 1) * sectionHeight);
                    const currentY = previousY + (targetY - previousY) * progressesArray[i];
                    if (progressesArray[i] > 0.001) {
                        ctx.beginPath(); ctx.moveTo(cx - screenWidth, currentY); ctx.lineTo(cx + screenWidth, currentY);
                        ctx.strokeStyle = `rgba(${hues[i]}, ${progressesArray[i]})`;
                        ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
                    }
                    previousY = currentY;
                    if (currentY > lowestY) lowestY = currentY;
                }
                if (lowestY > topY + 0.1) {
                    ctx.beginPath(); ctx.moveTo(cx - screenWidth, topY); ctx.lineTo(cx - screenWidth, lowestY);
                    ctx.moveTo(cx + screenWidth, topY); ctx.lineTo(cx + screenWidth, lowestY);
                    ctx.strokeStyle = `rgba(100, 200, 255, ${progressesArray[0]})`;
                    ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
                }
            };

            ctx.beginPath(); ctx.rect(cx - screenWidth, roshStrikeY, screenWidth * 2, roshBottomY - roshStrikeY);
            ctx.strokeStyle = `rgba(100, 200, 255, ${layer.kavProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();

            drawExpandingScreen(gufTopY, activeGufBottomY, layer.gufExpandProgresses);
            if (layer.gufLightProgress > 0.79) {
                ctx.beginPath(); ctx.rect(cx - screenWidth, activeGufStrikeY, screenWidth * 2, activeGufBottomY - activeGufStrikeY);
                ctx.strokeStyle = `rgba(100, 200, 255, ${layer.gufLightProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
            }

            drawExpandingScreen(sofTopY, activeSofBottomY, layer.sofExpandProgresses);
            if (layer.sofLightProgress > 0.79) {
                ctx.beginPath(); ctx.rect(cx - screenWidth, activeSofStrikeY, screenWidth * 2, activeSofBottomY - activeSofStrikeY);
                ctx.strokeStyle = `rgba(100, 200, 255, ${layer.sofLightProgress})`; ctx.lineWidth = 3 / pState.zoomLevel; ctx.stroke();
            }

            drawSparks(ctx, cx, roshStrikeY, layer.pehFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, activeGufStrikeY, layer.taburFlareOpacity, time, pState.zoomLevel);
            drawSparks(ctx, cx, activeSofStrikeY, layer.siyumFlareOpacity, time, pState.zoomLevel);
        }

        if (k === 0 && layer.windowProgress > 0.01) {
            const crownOuterR = phase4Radius * 1.0; const crownInnerR = phase4Radius * 0.90;
            const bOuter = Math.max(0, crownOuterR + Math.sin(time * 1.5 + 3) * 1.5);
            const bInner = Math.max(0, crownInnerR + Math.sin(time * 1.5 + 3.5) * 1.5);

            ctx.save(); ctx.globalAlpha = layer.windowProgress;
            ctx.beginPath(); ctx.arc(cx, cy, bOuter, 0, Math.PI * 2); drawGlowStroke(ctx, hues[0], 0.8, 4 / pState.zoomLevel, 2);
            ctx.beginPath(); ctx.arc(cx, cy, bInner, 0, Math.PI * 2); drawGlowStroke(ctx, hues[0], 0.8, 4 / pState.zoomLevel, 2);

            if (layer.windowFillProgress > 0.01) {
                ctx.beginPath(); ctx.arc(cx, cy, crownOuterR, 0, Math.PI * 2, false); ctx.arc(cx, cy, crownInnerR, 0, Math.PI * 2, true);
                ctx.fillStyle = `rgba(200, 200, 200, ${layer.windowFillProgress * 0.75})`; ctx.fill();
            }
            ctx.restore();
        }
        ctx.restore();
    }
    ctx.restore();
};