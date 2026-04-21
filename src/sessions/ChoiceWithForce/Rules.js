// Rules.js

export const calculateTargets = (activeSequence) => {
    const targets = {
        infinityAlpha: 0,
        subVesselOpacities: [
            [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]
        ],
        lightOpacities: [0, 0, 0, 0],
        restrictionOpacities: [0, 0, 0, 0, 0],
        voidOpacity: 0,
        kavProgress: 0,
        reflectProgress: 0,
        outerPhasesOpacity: 1, // NEW: Controls visibility of outer structural rings
        zoomLevel: 1
    };

    let currentVesselIndex = -1;
    let coarsenCount = 0;
    let restrictCount = 0;
    let kavDescendCount = 0; // NEW
    let kavReflectCount = 0; // NEW

    activeSequence.forEach(action => {
        if (action === 'ROOT') targets.infinityAlpha = 1;
        else if (action === 'COARSEN') {
            if (coarsenCount === 4 || currentVesselIndex === -1) {
                currentVesselIndex++;
                coarsenCount = 0;
            }
            targets.subVesselOpacities[currentVesselIndex][coarsenCount] = 1;
            coarsenCount++;
        }
        else if (action === 'LIGHT') {
            targets.lightOpacities[currentVesselIndex] = 1;
            coarsenCount = 4;
        }
        else if (action === 'RESTRICT_COARSEN') {
            targets.restrictionOpacities[restrictCount] = 1;
            restrictCount++;
        }
        else if (action === 'RESTRICT_ACTIVATE') {
            targets.lightOpacities[3] = 0;
            targets.voidOpacity = 1;
        }
        // --- NEW 5-STEP LINE PROGRESSION LOGIC ---
        else if (action === 'KAV_DESCEND') {
            kavDescendCount++;
            // 5 steps to reach 100%
            targets.kavProgress = kavDescendCount * 0.20;
        }
        else if (action === 'KAV_REFLECT') {
            targets.kavProgress = 1; // Ensure direct light is locked at bottom
            kavReflectCount++;
            // 5 steps to reach 100% upward
            targets.reflectProgress = kavReflectCount * 0.20;
        }
    });

    // Camera zooming & fading logic
    const zoomIndex = currentVesselIndex >= 0 ? currentVesselIndex : 0;
    if (zoomIndex === 3) targets.zoomLevel = 2.8;
    else if (zoomIndex === 2) targets.zoomLevel = 2.2;
    else if (zoomIndex === 1) targets.zoomLevel = 1.6;
    else if (zoomIndex === 0) targets.zoomLevel = 1.2;

    // Push the camera in super tight and trigger the fade-out
    if (kavDescendCount > 0 || kavReflectCount > 0) {
        targets.zoomLevel = 4.2; // A dramatic push-in to frame Phase 4 perfectly
        targets.outerPhasesOpacity = 0; // Fade out Phases 1, 2, and 3
    } else if (restrictCount > 0) {
        targets.zoomLevel = 2.8 + (restrictCount * 0.3);
    }

    return targets;
};