// Rules.js
export const calculateTargets = (activeSequence) => {
    const targets = {
        infinityAlpha: 0,
        subVesselOpacities: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        lightOpacities: [0, 0, 0, 0],
        restrictionOpacities: [0, 0, 0, 0, 0],
        voidOpacity: 0,
        kavProgress: 0,
        reflectProgress: 0,
        outerPhasesOpacity: 1,
        windowProgress: 0,
        windowFillProgress: 0,
        screenExpandProgress: 0,
        gufLightProgress: 0, // NEW: Tracks the light falling into the body
        zoomLevel: 1
    };

    let currentVesselIndex = -1;
    let coarsenCount = 0; let restrictCount = 0; let kavDescendCount = 0; let kavReflectCount = 0;
    let gufExpandCount = 0; let gufFillCount = 0;

    activeSequence.forEach(action => {
        if (action === 'ROOT') targets.infinityAlpha = 1;
        else if (action === 'COARSEN') {
            if (coarsenCount === 4 || currentVesselIndex === -1) { currentVesselIndex++; coarsenCount = 0; }
            targets.subVesselOpacities[currentVesselIndex][coarsenCount] = 1;
            coarsenCount++;
        }
        else if (action === 'LIGHT') { targets.lightOpacities[currentVesselIndex] = 1; coarsenCount = 4; }
        else if (action === 'RESTRICT_COARSEN') { targets.restrictionOpacities[restrictCount] = 1; restrictCount++; }
        else if (action === 'RESTRICT_ACTIVATE') { targets.lightOpacities[3] = 0; targets.voidOpacity = 1; }
        else if (action === 'KAV_DESCEND') { kavDescendCount++; targets.kavProgress = kavDescendCount * 0.20; }
        else if (action === 'KAV_REFLECT') { targets.kavProgress = 1; kavReflectCount++; targets.reflectProgress = kavReflectCount * 0.20; }
        else if (action === 'WINDOW_FORM') { targets.windowProgress = 1; }
        else if (action === 'WINDOW_FILL') { targets.windowProgress = 1; targets.windowFillProgress = 1; }

        // --- GUF SEPARATION ---
        else if (action === 'GUF_EXPAND') {
            targets.windowProgress = 1; targets.windowFillProgress = 1;
            gufExpandCount++; targets.screenExpandProgress = gufExpandCount * 0.20;
        }
        else if (action === 'GUF_FILL') {
            targets.windowProgress = 1; targets.windowFillProgress = 1; targets.screenExpandProgress = 1;
            gufFillCount++; targets.gufLightProgress = gufFillCount * 0.20;
        }
    });

    const zoomIndex = currentVesselIndex >= 0 ? currentVesselIndex : 0;
    if (zoomIndex === 3) targets.zoomLevel = 2.8;
    else if (zoomIndex === 2) targets.zoomLevel = 2.2;
    else if (zoomIndex === 1) targets.zoomLevel = 1.6;
    else if (zoomIndex === 0) targets.zoomLevel = 1.2;

    if (targets.windowProgress > 0 || kavDescendCount > 0 || kavReflectCount > 0) {
        targets.zoomLevel = 4.2; targets.outerPhasesOpacity = 0;
    } else if (restrictCount > 0) {
        targets.zoomLevel = 2.8 + (restrictCount * 0.3);
    }

    return targets;
};