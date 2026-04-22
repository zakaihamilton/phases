// PhysicsMath.js

export const applyEasing = (pState, targets, easeSpeed = 0.015) => {
    pState.infinityAlpha += (targets.infinityAlpha - pState.infinityAlpha) * easeSpeed;
    pState.zoomLevel += (targets.zoomLevel - pState.zoomLevel) * easeSpeed;
    pState.voidOpacity += (targets.voidOpacity - pState.voidOpacity) * easeSpeed;
    pState.outerPhasesOpacity += (targets.outerPhasesOpacity - pState.outerPhasesOpacity) * easeSpeed;

    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += (targets.lightOpacities[i] - pState.lightOpacities[i]) * easeSpeed;
        for (let j = 0; j < 4; j++) {
            pState.subVesselOpacities[i][j] += (targets.subVesselOpacities[i][j] - pState.subVesselOpacities[i][j]) * easeSpeed;
        }
    }

    for (let i = 0; i < 5; i++) {
        pState.restrictionOpacities[i] += (targets.restrictionOpacities[i] - pState.restrictionOpacities[i]) * easeSpeed;
        pState.gufExpandProgresses[i] += (targets.gufExpandProgresses[i] - pState.gufExpandProgresses[i]) * easeSpeed;
        pState.sofExpandProgresses[i] += (targets.sofExpandProgresses[i] - pState.sofExpandProgresses[i]) * easeSpeed;
    }

    pState.kavProgress += (targets.kavProgress - pState.kavProgress) * easeSpeed;
    pState.reflectProgress += (targets.reflectProgress - pState.reflectProgress) * easeSpeed;
    pState.windowProgress += (targets.windowProgress - pState.windowProgress) * easeSpeed;
    pState.windowFillProgress += (targets.windowFillProgress - pState.windowFillProgress) * easeSpeed;

    pState.pehFlareOpacity += (targets.pehFlareOpacity - pState.pehFlareOpacity) * easeSpeed;
    pState.taburFlareOpacity += (targets.taburFlareOpacity - pState.taburFlareOpacity) * easeSpeed;
    pState.siyumFlareOpacity += (targets.siyumFlareOpacity - pState.siyumFlareOpacity) * easeSpeed;

    pState.gufLightProgress += (targets.gufLightProgress - pState.gufLightProgress) * easeSpeed;
    pState.gufReflectProgress += (targets.gufReflectProgress - pState.gufReflectProgress) * easeSpeed;

    pState.sofLightProgress += (targets.sofLightProgress - pState.sofLightProgress) * easeSpeed;
    pState.sofReflectProgress += (targets.sofReflectProgress - pState.sofReflectProgress) * easeSpeed;
};