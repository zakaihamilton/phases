// PhysicsMath.js

const EPSILON = 0.015;

const done = (val, target) => Math.abs(val - target) <= EPSILON;
const arrDone = (arr, targetsArr) => arr.every((val, i) => done(val, targetsArr[i]));

const getVisualSum = (state) => {
    return state.rootOpacities.reduce((a, b) => a + b, 0) +
        state.kavProgress +
        state.reflectProgress +
        state.windowProgress +
        state.windowFillProgress +
        state.gufExpandProgresses.reduce((a, b) => a + b, 0) +
        state.gufLightProgress +
        state.gufReflectProgress +
        state.sofExpandProgresses.reduce((a, b) => a + b, 0) +
        state.sofLightProgress +
        state.sofReflectProgress;
};

export const applyEasing = (pState, targets, easeSpeed = 0.02) => {
    const distance = Math.abs(getVisualSum(targets) - getVisualSum(pState));
    const seqSpeedBoost = easeSpeed * (2.5 + (distance * 1.5));
    const bgEase = easeSpeed * (1 + (distance * 0.5));

    pState.infinityAlpha += (targets.infinityAlpha - pState.infinityAlpha) * bgEase;
    pState.zoomLevel += (targets.zoomLevel - pState.zoomLevel) * bgEase;
    pState.voidOpacity += (targets.voidOpacity - pState.voidOpacity) * bgEase;
    pState.outerPhasesOpacity += (targets.outerPhasesOpacity - pState.outerPhasesOpacity) * bgEase;

    for (let i = 0; i < 5; i++) {
        pState.rootOpacities[i] += (targets.rootOpacities[i] - pState.rootOpacities[i]) * bgEase;
    }

    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += (targets.lightOpacities[i] - pState.lightOpacities[i]) * bgEase;
        for (let j = 0; j < 4; j++) {
            pState.subVesselOpacities[i][j] += (targets.subVesselOpacities[i][j] - pState.subVesselOpacities[i][j]) * bgEase;
        }
    }
    for (let i = 0; i < 5; i++) {
        pState.restrictionOpacities[i] += (targets.restrictionOpacities[i] - pState.restrictionOpacities[i]) * bgEase;
    }

    pState.pehFlareOpacity += (targets.pehFlareOpacity - pState.pehFlareOpacity) * bgEase;
    pState.taburFlareOpacity += (targets.taburFlareOpacity - pState.taburFlareOpacity) * bgEase;
    pState.siyumFlareOpacity += (targets.siyumFlareOpacity - pState.siyumFlareOpacity) * bgEase;

    const rLightDone = done(pState.kavProgress, targets.kavProgress);
    const rReflectDone = rLightDone && done(pState.reflectProgress, targets.reflectProgress);
    const wFormDone = rReflectDone && done(pState.windowProgress, targets.windowProgress);
    const wFillDone = wFormDone && done(pState.windowFillProgress, targets.windowFillProgress);
    const gExpandDone = wFillDone && arrDone(pState.gufExpandProgresses, targets.gufExpandProgresses);
    const gLightDone = gExpandDone && done(pState.gufLightProgress, targets.gufLightProgress);
    const gReflectDone = gLightDone && done(pState.gufReflectProgress, targets.gufReflectProgress);
    const sExpandDone = gReflectDone && arrDone(pState.sofExpandProgresses, targets.sofExpandProgresses);
    const sLightDone = sExpandDone && done(pState.sofLightProgress, targets.sofLightProgress);

    const sReflectDoneRev = done(pState.sofReflectProgress, targets.sofReflectProgress);
    const sLightDoneRev = sReflectDoneRev && done(pState.sofLightProgress, targets.sofLightProgress);
    const sExpandDoneRev = sLightDoneRev && arrDone(pState.sofExpandProgresses, targets.sofExpandProgresses);
    const gReflectDoneRev = sExpandDoneRev && done(pState.gufReflectProgress, targets.gufReflectProgress);
    const gLightDoneRev = gReflectDoneRev && done(pState.gufLightProgress, targets.gufLightProgress);
    const gExpandDoneRev = gLightDoneRev && arrDone(pState.gufExpandProgresses, targets.gufExpandProgresses);
    const wFillDoneRev = gExpandDoneRev && done(pState.windowFillProgress, targets.windowFillProgress);
    const wFormDoneRev = wFillDoneRev && done(pState.windowProgress, targets.windowProgress);
    const rReflectDoneRev = wFormDoneRev && done(pState.reflectProgress, targets.reflectProgress);

    const updateProp = (prop, canMoveFwd, canMoveBwd) => {
        const diff = targets[prop] - pState[prop];
        const isFwd = diff > EPSILON;
        const isBwd = diff < -EPSILON;
        if ((isFwd && canMoveFwd) || (isBwd && canMoveBwd)) {
            pState[prop] += diff * seqSpeedBoost;
        } else if (!isFwd && !isBwd) {
            pState[prop] = targets[prop];
        }
    };

    const updateArr = (arrProp, canMoveFwd, canMoveBwd) => {
        for (let i = 0; i < 5; i++) {
            const diff = targets[arrProp][i] - pState[arrProp][i];
            const isFwd = diff > EPSILON;
            const isBwd = diff < -EPSILON;
            const prevDoneFwd = i === 0 ? canMoveFwd : done(pState[arrProp][i - 1], targets[arrProp][i - 1]);
            const nextDoneBwd = i === 4 ? canMoveBwd : done(pState[arrProp][i + 1], targets[arrProp][i + 1]);

            if ((isFwd && prevDoneFwd) || (isBwd && nextDoneBwd)) {
                pState[arrProp][i] += diff * seqSpeedBoost;
            } else if (!isFwd && !isBwd) {
                pState[arrProp][i] = targets[arrProp][i];
            }
        }
    };

    updateProp('kavProgress', true, rReflectDoneRev);
    updateProp('reflectProgress', rLightDone, wFormDoneRev);
    updateProp('windowProgress', rReflectDone, wFillDoneRev);
    updateProp('windowFillProgress', wFormDone, gExpandDoneRev);

    updateArr('gufExpandProgresses', wFillDone, gLightDoneRev);
    updateProp('gufLightProgress', gExpandDone, gReflectDoneRev);
    updateProp('gufReflectProgress', gLightDone, sExpandDoneRev);

    updateArr('sofExpandProgresses', gReflectDone, sLightDoneRev);
    updateProp('sofLightProgress', sExpandDone, sReflectDoneRev);
    updateProp('sofReflectProgress', sLightDone, true);
};