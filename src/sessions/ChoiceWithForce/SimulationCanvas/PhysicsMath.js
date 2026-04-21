// physicsMath.js

export const applyEasing = (pState, targets, easeSpeed = 0.015) => {
    // 1. Root & Camera Easing
    pState.infinityAlpha += (targets.infinityAlpha - pState.infinityAlpha) * easeSpeed;
    pState.zoomLevel += (targets.zoomLevel - pState.zoomLevel) * easeSpeed;
    pState.voidOpacity += (targets.voidOpacity - pState.voidOpacity) * easeSpeed;

    // 2. Arrays Easing
    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += (targets.lightOpacities[i] - pState.lightOpacities[i]) * easeSpeed;
        for (let j = 0; j < 4; j++) {
            pState.subVesselOpacities[i][j] += (targets.subVesselOpacities[i][j] - pState.subVesselOpacities[i][j]) * easeSpeed;
        }
    }

    // Separate loop for the 5 Restriction Rings
    for (let i = 0; i < 5; i++) {
        pState.restrictionOpacities[i] += (targets.restrictionOpacities[i] - pState.restrictionOpacities[i]) * easeSpeed;
    }
    // 3. Line of Light & Reflection
    pState.kavProgress += (targets.kavProgress - pState.kavProgress) * easeSpeed;
    pState.reflectProgress += (targets.reflectProgress - pState.reflectProgress) * easeSpeed;

    // 4. Cinematic Fading
    pState.outerPhasesOpacity += (targets.outerPhasesOpacity - pState.outerPhasesOpacity) * easeSpeed;
};