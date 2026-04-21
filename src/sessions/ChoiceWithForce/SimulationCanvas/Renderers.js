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
    const phaseRgbs = [ [255, 235, 59], [33, 150, 243], [244, 67, 54], [76, 175, 80] ];
    const subPhaseRgbs = [ [180, 180, 180], [255, 235, 59], [33, 150, 243], [76, 175, 80] ];

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
                ctx.beginPath();
                const layerRadius = Math.max(0, breatheRadius - (j * 4 / pState.zoomLevel));
                ctx.arc(cx, cy, layerRadius, 0, Math.PI * 2);

                const subRgb = subPhaseRgbs[j];
                const rBlend = Math.round(mainRgb[0] * 0.6 + subRgb[0] * 0.4);
                const gBlend = Math.round(mainRgb[1] * 0.6 + subRgb[1] * 0.4);
                const bBlend = Math.round(mainRgb[2] * 0.6 + subRgb[2] * 0.4);

                ctx.strokeStyle = `rgba(${rBlend}, ${gBlend}, ${bBlend}, ${layerOpacity})`;
                ctx.lineWidth = 2 / pState.zoomLevel; 
                ctx.shadowBlur = 6;
                ctx.shadowColor = `rgba(${mainRgb[0]}, ${mainRgb[1]}, ${mainRgb[2]}, ${layerOpacity * 0.6})`;
                ctx.stroke();
                ctx.shadowBlur = 0;
            }
        }

        if (i === 3) {
            for (let j = 0; j < 5; j++) {
                if (pState.restrictionOpacities[j] > 0.01) {
                    ctx.beginPath();
                    // GEOMETRY FIX: j * 0.10. 
                    // This means j=0 is 1.0 (perfectly flush with the outer void edge).
                    const restrictRadiusScale = 1 - (j * 0.10);
                    const restrictR = r * restrictRadiusScale;
                    const restrictBreatheR = Math.max(0, restrictR + Math.sin(time * 1.5 + i + j) * 1.5);
                    
                    ctx.arc(cx, cy, restrictBreatheR, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(220, 230, 255, ${pState.restrictionOpacities[j] * 0.9})`;
                    ctx.lineWidth = 2 / pState.zoomLevel;
                    ctx.shadowBlur = 8;
                    ctx.shadowColor = `rgba(200, 220, 255, ${pState.restrictionOpacities[j] * 0.5})`;
                    ctx.stroke();
                    ctx.shadowBlur = 0;
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
    const screenY = cy - (phase4Radius * 0.50); 
    const currentY = startY + (screenY - startY) * pState.kavProgress;

    // 1. REFLECTED LIGHT (OHR CHOZER)
    if (pState.reflectProgress > 0.01) {
        const currentReflectY = screenY - (screenY - startY) * pState.reflectProgress;

        ctx.beginPath();
        ctx.moveTo(cx, screenY);
        ctx.lineTo(cx, currentReflectY);
        ctx.strokeStyle = `rgba(100, 180, 255, ${pState.reflectProgress * 0.5})`;
        ctx.lineWidth = 18 / pState.zoomLevel; 
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(100, 200, 255, 1)';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(cx - (8 / pState.zoomLevel), screenY);
        ctx.lineTo(cx - (8 / pState.zoomLevel), currentReflectY);
        ctx.moveTo(cx + (8 / pState.zoomLevel), screenY);
        ctx.lineTo(cx + (8 / pState.zoomLevel), currentReflectY);
        ctx.strokeStyle = `rgba(200, 240, 255, ${pState.reflectProgress * 0.9})`;
        ctx.lineWidth = 1.5 / pState.zoomLevel;
        ctx.shadowBlur = 0; 
        ctx.stroke();
    }

    // 2. DIRECT LIGHT (OHR YASHAR)
    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.lineTo(cx, currentY);
    ctx.strokeStyle = `rgba(255, 230, 150, ${pState.kavProgress})`;
    ctx.lineWidth = 4 / pState.zoomLevel; 
    ctx.shadowBlur = 10;
    ctx.shadowColor = 'rgba(255, 220, 100, 1)';
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(cx, startY);
    ctx.lineTo(cx, currentY);
    ctx.shadowBlur = 0; 
    ctx.strokeStyle = `rgba(255, 255, 255, ${pState.kavProgress})`;
    ctx.lineWidth = 1.5 / pState.zoomLevel;
    ctx.stroke();

    // 3. THE MASACH (SCREEN) & SPARKS
    if (pState.kavProgress > 0.99) {
        ctx.beginPath();
        const screenWidth = (phase4Radius * 0.50) * 0.4; 
        ctx.moveTo(cx - screenWidth, screenY);
        ctx.lineTo(cx + screenWidth, screenY);
        ctx.strokeStyle = `rgba(100, 200, 255, ${pState.kavProgress})`;
        ctx.lineWidth = 3 / pState.zoomLevel;
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(100, 200, 255, 1)';
        ctx.stroke();

        ctx.save();
        ctx.translate(cx, screenY); 
        const numSparks = 24; 
        for (let i = 0; i < numSparks; i++) {
            const baseAngle = (Math.PI * 2 / numSparks) * i;
            const jitter = Math.sin(time * 15 + i) * 0.5; 
            const flicker = Math.random() * Math.sin(time * 30 + i * 100);
            
            if (flicker > 0) {
                const length = (4 + flicker * 25) / pState.zoomLevel;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(Math.cos(baseAngle + jitter) * length, Math.sin(baseAngle + jitter) * length);
                const isCore = Math.random() > 0.5;
                ctx.strokeStyle = isCore ? `rgba(255, 255, 255, ${Math.random()})` : `rgba(255, 200, 50, ${Math.random()})`;
                ctx.lineWidth = (isCore ? 1.5 : 3) / pState.zoomLevel;
                ctx.stroke();
            }
        }
        ctx.beginPath();
        ctx.arc(0, 0, (3 + Math.random() * 4) / pState.zoomLevel, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.shadowBlur = 15;
        ctx.shadowColor = 'rgba(255, 255, 255, 1)';
        ctx.fill();
        ctx.restore();
    }

    // 4. THE WINDOW (CHALON) & CIRCLE OF CROWN FILL
    if (pState.windowProgress > 0.01) {
        // GEOMETRY FIX: Define both the Outer (1.0) and Inner (0.90) boundaries
        const crownOuterR = phase4Radius * 1.0;  // Flush with infinity
        const crownInnerR = phase4Radius * 0.90; // Top of Wisdom
        
        const breatheOuter = Math.max(0, crownOuterR + Math.sin(time * 1.5 + 3 + 0) * 1.5);
        const breatheInner = Math.max(0, crownInnerR + Math.sin(time * 1.5 + 3 + 1) * 1.5);

        // A. Lining the OUTER border (Top of the donut)
        ctx.beginPath();
        ctx.arc(cx, cy, breatheOuter, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${pState.windowProgress})`; 
        ctx.lineWidth = 8 / pState.zoomLevel; 
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(100, 200, 255, 1)';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(cx, cy, breatheOuter, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pState.windowProgress})`; 
        ctx.lineWidth = 2.5 / pState.zoomLevel;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // B. Lining the INNER border (Bottom of the donut)
        ctx.beginPath();
        ctx.arc(cx, cy, breatheInner, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 200, 255, ${pState.windowProgress})`; 
        ctx.lineWidth = 8 / pState.zoomLevel; 
        ctx.shadowBlur = 20;
        ctx.shadowColor = 'rgba(100, 200, 255, 1)';
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(cx, cy, breatheInner, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 255, 255, ${pState.windowProgress})`; 
        ctx.lineWidth = 2.5 / pState.zoomLevel;
        ctx.shadowBlur = 0;
        ctx.stroke();

        // C. High-Opacity Gold Direct Light Fill inside the lined Window
        if (pState.windowFillProgress > 0.01) {
            ctx.beginPath();
            // Draw outer border clockwise, inner border counter-clockwise (true)
            // This perfectly hollows out the center so the light only sits inside the lining!
            ctx.arc(cx, cy, crownOuterR, 0, Math.PI * 2, false);
            ctx.arc(cx, cy, crownInnerR, 0, Math.PI * 2, true); 
            
            ctx.fillStyle = `rgba(255, 220, 50, ${pState.windowFillProgress * 0.7})`;
            ctx.fill();
        }
    }

    ctx.restore();
};