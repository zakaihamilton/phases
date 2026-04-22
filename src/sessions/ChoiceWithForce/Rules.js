// Rules.js

export const calculateTargets = (activeSequence) => {
    const targets = {
        infinityAlpha: 0,
        rootOpacities: [0, 0, 0, 0, 0], // NEW: 5 Layers of Infinity
        subVesselOpacities: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        lightOpacities: [0, 0, 0, 0],
        restrictionOpacities: [0, 0, 0, 0, 0],
        voidOpacity: 0,
        kavProgress: 0,
        reflectProgress: 0,
        outerPhasesOpacity: 1,
        windowProgress: 0,
        windowFillProgress: 0,
        pehFlareOpacity: 0,
        taburFlareOpacity: 0,
        siyumFlareOpacity: 0,
        gufExpandProgresses: [0, 0, 0, 0, 0],
        gufLightProgress: 0,
        gufReflectProgress: 0,
        sofExpandProgresses: [0, 0, 0, 0, 0],
        sofLightProgress: 0,
        sofReflectProgress: 0,
        zoomLevel: 1
    };

    let currentVesselIndex = -1;
    let coarsenCount = 0; let restrictCount = 0; let kavDescendCount = 0; let kavReflectCount = 0;
    let gufExpandCount = 0; let gufDescendCount = 0; let gufReflectCount = 0;
    let sofExpandCount = 0; let sofDescendCount = 0; let sofReflectCount = 0;

    activeSequence.forEach(action => {
        // Parse the 5 Root Phases
        if (action.startsWith('ROOT_')) {
            targets.infinityAlpha = 1;
            const step = parseInt(action.split('_')[1], 10);
            for (let i = 0; i <= step; i++) {
                targets.rootOpacities[i] = 1;
            }
        }
        else if (action === 'COARSEN') {
            if (coarsenCount === 4 || currentVesselIndex === -1) { currentVesselIndex++; coarsenCount = 0; }
            targets.subVesselOpacities[currentVesselIndex][coarsenCount] = 1; coarsenCount++;
        }
        else if (action === 'LIGHT') { targets.lightOpacities[currentVesselIndex] = 1; coarsenCount = 4; }
        else if (action === 'RESTRICT_COARSEN') { targets.restrictionOpacities[restrictCount] = 1; restrictCount++; }
        else if (action === 'RESTRICT_ACTIVATE') { targets.lightOpacities[3] = 0; targets.voidOpacity = 1; }

        else if (action === 'KAV_DESCEND') { kavDescendCount++; targets.kavProgress = Math.min(kavDescendCount * 0.20, 0.80); }
        else if (action === 'KAV_REFLECT') { targets.kavProgress = 0.80; kavReflectCount++; targets.reflectProgress = kavReflectCount * 0.20; }
        else if (action === 'WINDOW_FORM') { targets.windowProgress = 1; }
        else if (action === 'WINDOW_FILL') { targets.windowProgress = 1; targets.windowFillProgress = 1; }

        else if (action === 'GUF_EXPAND') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            targets.gufExpandProgresses[gufExpandCount] = 1; gufExpandCount++;
        }
        else if (action === 'GUF_DESCEND') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            targets.gufExpandProgresses = [1, 1, 1, 1, 1];
            gufDescendCount++; targets.gufLightProgress = Math.min(gufDescendCount * 0.20, 0.80);
        }
        else if (action === 'GUF_REFLECT') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            targets.gufExpandProgresses = [1, 1, 1, 1, 1];
            targets.gufLightProgress = 0.80;
            gufReflectCount++; targets.gufReflectProgress = gufReflectCount * 0.20;
        }

        else if (action === 'SOF_EXPAND') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            targets.gufExpandProgresses = [1, 1, 1, 1, 1]; targets.gufLightProgress = 0.80; targets.gufReflectProgress = 1;
            targets.sofExpandProgresses[sofExpandCount] = 1; sofExpandCount++;
        }
        else if (action === 'SOF_DESCEND') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            targets.gufExpandProgresses = [1, 1, 1, 1, 1]; targets.gufLightProgress = 0.80; targets.gufReflectProgress = 1;
            targets.sofExpandProgresses = [1, 1, 1, 1, 1];
            sofDescendCount++; targets.sofLightProgress = Math.min(sofDescendCount * 0.20, 0.80);
        }
        else if (action === 'SOF_REFLECT') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            targets.gufExpandProgresses = [1, 1, 1, 1, 1]; targets.gufLightProgress = 0.80; targets.gufReflectProgress = 1;
            targets.sofExpandProgresses = [1, 1, 1, 1, 1];
            targets.sofLightProgress = 0.80;
            sofReflectCount++; targets.sofReflectProgress = sofReflectCount * 0.20;
        }
    });

    if (kavDescendCount >= 5 && gufExpandCount === 0) targets.pehFlareOpacity = 1;
    else targets.pehFlareOpacity = 0;

    if (gufDescendCount >= 5 && gufReflectCount === 0 && sofExpandCount === 0) targets.taburFlareOpacity = 1;
    else targets.taburFlareOpacity = 0;

    if (sofDescendCount >= 5 && sofReflectCount === 0) targets.siyumFlareOpacity = 1;
    else targets.siyumFlareOpacity = 0;

    const zoomIndex = currentVesselIndex >= 0 ? currentVesselIndex : 0;
    if (zoomIndex === 3) targets.zoomLevel = 2.8;
    else if (zoomIndex === 2) targets.zoomLevel = 2.2;
    else if (zoomIndex === 1) targets.zoomLevel = 1.6;
    else if (zoomIndex === 0) targets.zoomLevel = 1.2;

    if (targets.windowProgress > 0 || kavDescendCount > 0) {
        targets.zoomLevel = 4.2; targets.outerPhasesOpacity = 0;
    } else if (restrictCount > 0) {
        targets.zoomLevel = 2.8 + (restrictCount * 0.3);
    }

    return targets;
};