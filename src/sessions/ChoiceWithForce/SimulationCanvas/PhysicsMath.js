// PhysicsMath.js

const EPSILON = 0.015;

const done = (val, target) => Math.abs(val - target) <= EPSILON;
const arrDone = (arr, targetsArr) => arr.every((val, i) => done(val, targetsArr[i]));

const getVisualSum = (state) => {
    let sum = state.rootOpacities.reduce((a, b) => a + b, 0);
    state.layers.forEach(l => {
        sum += l.kavProgress + l.reflectProgress + l.windowProgress + l.windowFillProgress +
            l.gufExpandProgresses.reduce((a, b) => a + b, 0) + l.gufLightProgress + l.gufReflectProgress +
            l.sofExpandProgresses.reduce((a, b) => a + b, 0) + l.sofLightProgress + l.sofReflectProgress;
    });
    return sum;
};

export const applyEasing = (pState, targets, easeSpeed = 0.02) => {
    const distance = Math.abs(getVisualSum(targets) - getVisualSum(pState));
    const seqSpeedBoost = easeSpeed * (2.5 + (distance * 1.5));
    const bgEase = easeSpeed * (1 + (distance * 0.5));

    pState.infinityAlpha += (targets.infinityAlpha - pState.infinityAlpha) * bgEase;
    pState.zoomLevel += (targets.zoomLevel - pState.zoomLevel) * bgEase;
    pState.voidOpacity += (targets.voidOpacity - pState.voidOpacity) * bgEase;
    pState.outerPhasesOpacity += (targets.outerPhasesOpacity - pState.outerPhasesOpacity) * bgEase;

    for (let i = 0; i < 5; i++) { pState.rootOpacities[i] += (targets.rootOpacities[i] - pState.rootOpacities[i]) * bgEase; }
    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += (targets.lightOpacities[i] - pState.lightOpacities[i]) * bgEase;
        for (let j = 0; j < 4; j++) { pState.subVesselOpacities[i][j] += (targets.subVesselOpacities[i][j] - pState.subVesselOpacities[i][j]) * bgEase; }
    }
    for (let i = 0; i < 5; i++) { pState.restrictionOpacities[i] += (targets.restrictionOpacities[i] - pState.restrictionOpacities[i]) * bgEase; }

    const updateProp = (p, t, prop, canMoveFwd, canMoveBwd) => {
        const diff = t[prop] - p[prop];
        if ((diff > EPSILON && canMoveFwd) || (diff < -EPSILON && canMoveBwd)) { p[prop] += diff * seqSpeedBoost; }
        else if (Math.abs(diff) <= EPSILON) { p[prop] = t[prop]; }
    };

    const updateArr = (p, t, arrProp, canMoveFwd, canMoveBwd) => {
        for (let i = 0; i < 5; i++) {
            const diff = t[arrProp][i] - p[arrProp][i];
            const prevDoneFwd = i === 0 ? canMoveFwd : done(p[arrProp][i - 1], t[arrProp][i - 1]);
            const nextDoneBwd = i === 4 ? canMoveBwd : done(p[arrProp][i + 1], t[arrProp][i + 1]);
            if ((diff > EPSILON && prevDoneFwd) || (diff < -EPSILON && nextDoneBwd)) { p[arrProp][i] += diff * seqSpeedBoost; }
            else if (Math.abs(diff) <= EPSILON) { p[arrProp][i] = t[arrProp][i]; }
        }
    };

    for (let i = 0; i < 5; i++) {
        const p = pState.layers[i];
        const t = targets.layers[i];

        p.pehFlareOpacity += (t.pehFlareOpacity - p.pehFlareOpacity) * bgEase;
        p.taburFlareOpacity += (t.taburFlareOpacity - p.taburFlareOpacity) * bgEase;
        p.siyumFlareOpacity += (t.siyumFlareOpacity - p.siyumFlareOpacity) * bgEase;

        const rLightDone = done(p.kavProgress, t.kavProgress);
        const rReflectDone = rLightDone && done(p.reflectProgress, t.reflectProgress);
        const wFormDone = rReflectDone && done(p.windowProgress, t.windowProgress);
        const wFillDone = wFormDone && done(p.windowFillProgress, t.windowFillProgress);
        const gExpandDone = wFillDone && arrDone(p.gufExpandProgresses, t.gufExpandProgresses);
        const gLightDone = gExpandDone && done(p.gufLightProgress, t.gufLightProgress);
        const gReflectDone = gLightDone && done(p.gufReflectProgress, t.gufReflectProgress);
        const sExpandDone = gReflectDone && arrDone(p.sofExpandProgresses, t.sofExpandProgresses);
        const sLightDone = sExpandDone && done(p.sofLightProgress, t.sofLightProgress);

        const sReflectDoneRev = done(p.sofReflectProgress, t.sofReflectProgress);
        const sLightDoneRev = sReflectDoneRev && done(p.sofLightProgress, t.sofLightProgress);
        const sExpandDoneRev = sLightDoneRev && arrDone(p.sofExpandProgresses, t.sofExpandProgresses);
        const gReflectDoneRev = sExpandDoneRev && done(p.gufReflectProgress, t.gufReflectProgress);
        const gLightDoneRev = gReflectDoneRev && done(p.gufLightProgress, t.gufLightProgress);
        const gExpandDoneRev = gLightDoneRev && arrDone(p.gufExpandProgresses, t.gufExpandProgresses);
        const wFillDoneRev = gExpandDoneRev && done(p.windowFillProgress, t.windowFillProgress);
        const wFormDoneRev = wFillDoneRev && done(p.windowProgress, t.windowProgress);
        const rReflectDoneRev = wFormDoneRev && done(p.reflectProgress, t.reflectProgress);

        updateProp(p, t, 'kavProgress', true, rReflectDoneRev);
        updateProp(p, t, 'reflectProgress', rLightDone, wFormDoneRev);
        updateProp(p, t, 'windowProgress', rReflectDone, wFillDoneRev);
        updateProp(p, t, 'windowFillProgress', wFormDone, gExpandDoneRev);

        updateArr(p, t, 'gufExpandProgresses', wFillDone, gLightDoneRev);
        updateProp(p, t, 'gufLightProgress', gExpandDone, gReflectDoneRev);
        updateProp(p, t, 'gufReflectProgress', gLightDone, sExpandDoneRev);

        updateArr(p, t, 'sofExpandProgresses', gReflectDone, sLightDoneRev);
        updateProp(p, t, 'sofLightProgress', sExpandDone, sReflectDoneRev);
        updateProp(p, t, 'sofReflectProgress', sLightDone, true);
    }
};