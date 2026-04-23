// PhysicsMath.js

const EPSILON = 0.015;
const done = (val, target) => Math.abs((val || 0) - (target || 0)) <= EPSILON;

const CHRONOLOGY = [
    { prop: 'rayProgress', type: 'value' }, { prop: 'headReflectProgress', type: 'value' },
    { prop: 'windowProgress', type: 'value' }, { prop: 'windowFillProgress', type: 'value' },
    { prop: 'bodyExpandProgresses', type: 'array' }, { prop: 'bodyLightProgress', type: 'value' }, { prop: 'bodyReflectProgress', type: 'value' },
    { prop: 'endExpandProgresses', type: 'array' }, { prop: 'endLightProgress', type: 'value' }, { prop: 'endReflectProgress', type: 'value' }
];

const getVisualSum = (state) => {
    if (!state || !state.rootOpacities) return 0;
    let sum = state.rootOpacities.reduce((a, b) => a + (b || 0), 0);
    if (state.layers) {
        state.layers.forEach(l => {
            if (!l) return;
            sum += (l.rayProgress || 0) + (l.headReflectProgress || 0) + (l.windowProgress || 0) + (l.windowFillProgress || 0) +
                (l.bodyLightProgress || 0) + (l.bodyReflectProgress || 0) + (l.endLightProgress || 0) + (l.endReflectProgress || 0);
            if (l.bodyExpandProgresses) sum += l.bodyExpandProgresses.reduce((a, b) => a + (b || 0), 0);
            if (l.endExpandProgresses) sum += l.endExpandProgresses.reduce((a, b) => a + (b || 0), 0);
        });
    }
    return sum;
};

export const applyEasing = (pState, targets, easeSpeed = 0.015) => {
    if (!targets) return;

    pState.zoomLevel += ((targets.zoomLevel || 1) - (pState.zoomLevel || 1)) * 0.05;
    pState.tiltProgress += ((targets.tiltProgress || 0) - (pState.tiltProgress || 0)) * 0.05;
    pState.infinityAlpha += ((targets.infinityAlpha || 0) - (pState.infinityAlpha || 0)) * 0.02;
    pState.voidOpacity += ((targets.voidOpacity || 0) - (pState.voidOpacity || 0)) * 0.02;
    pState.outerPhasesOpacity += ((targets.outerPhasesOpacity || 0) - (pState.outerPhasesOpacity || 0)) * 0.02;

    for (let i = 0; i < 5; i++) {
        pState.rootOpacities[i] += ((targets.rootOpacities[i] || 0) - (pState.rootOpacities[i] || 0)) * 0.02;
        pState.restrictionOpacities[i] += ((targets.restrictionOpacities[i] || 0) - (pState.restrictionOpacities[i] || 0)) * 0.02;
    }
    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += ((targets.lightOpacities[i] || 0) - (pState.lightOpacities[i] || 0)) * 0.02;
        for (let j = 0; j < 4; j++) {
            pState.subVesselOpacities[i][j] += ((targets.subVesselOpacities[i][j] || 0) - (pState.subVesselOpacities[i][j] || 0)) * 0.02;
        }
    }

    const tSum = getVisualSum(targets);
    const pSum = getVisualSum(pState);
    const difference = Math.abs(tSum - pSum);
    const seqSpeedBoost = Math.max(easeSpeed, Math.min(0.15, difference * 0.01));

    let canMoveFwd = true;
    let canMoveBwd = true;

    pState.layers.forEach((p, lyrIdx) => {
        const t = targets.layers[lyrIdx];
        if (!t) return;

        p.mouthFlareOpacity += ((t.mouthFlareOpacity || 0) - (p.mouthFlareOpacity || 0)) * 0.05;
        p.navelFlareOpacity += ((t.navelFlareOpacity || 0) - (p.navelFlareOpacity || 0)) * 0.05;
        p.toesFlareOpacity += ((t.toesFlareOpacity || 0) - (p.toesFlareOpacity || 0)) * 0.05;

        for (let i = 0; i < CHRONOLOGY.length; i++) {
            const rule = CHRONOLOGY[i];
            if (rule.type === 'value') {
                const diff = (t[rule.prop] || 0) - (p[rule.prop] || 0);
                if (diff > EPSILON && canMoveFwd) p[rule.prop] += diff * seqSpeedBoost;
                else if (Math.abs(diff) <= EPSILON) p[rule.prop] = (t[rule.prop] || 0);
                if (!done(p[rule.prop], t[rule.prop])) canMoveFwd = false;
            } else if (rule.type === 'array') {
                if (!p[rule.prop]) p[rule.prop] = [0, 0, 0, 0, 0];
                if (!t[rule.prop]) t[rule.prop] = [0, 0, 0, 0, 0];
                for (let j = 0; j < 5; j++) {
                    const diff = (t[rule.prop][j] || 0) - (p[rule.prop][j] || 0);
                    const prevDoneFwd = j === 0 ? canMoveFwd : done(p[rule.prop][j - 1], t[rule.prop][j - 1]);
                    if (diff > EPSILON && prevDoneFwd) p[rule.prop][j] += diff * seqSpeedBoost;
                    else if (Math.abs(diff) <= EPSILON) p[rule.prop][j] = (t[rule.prop][j] || 0);
                    if (!done(p[rule.prop][j], t[rule.prop][j])) canMoveFwd = false;
                }
            }
        }

        for (let i = CHRONOLOGY.length - 1; i >= 0; i--) {
            const rule = CHRONOLOGY[i];
            if (rule.type === 'value') {
                const diff = (t[rule.prop] || 0) - (p[rule.prop] || 0);
                if (diff < -EPSILON && canMoveBwd) p[rule.prop] += diff * seqSpeedBoost;
                if (!done(p[rule.prop], t[rule.prop])) canMoveBwd = false;
            } else if (rule.type === 'array') {
                if (!p[rule.prop]) p[rule.prop] = [0, 0, 0, 0, 0];
                if (!t[rule.prop]) t[rule.prop] = [0, 0, 0, 0, 0];
                for (let j = 4; j >= 0; j--) {
                    const diff = (t[rule.prop][j] || 0) - (p[rule.prop][j] || 0);
                    const prevDoneBwd = j === 4 ? canMoveBwd : done(p[rule.prop][j + 1], t[rule.prop][j + 1]);
                    if (diff < -EPSILON && prevDoneBwd) p[rule.prop][j] += diff * seqSpeedBoost;
                    if (!done(p[rule.prop][j], t[rule.prop][j])) canMoveBwd = false;
                }
            }
        }
    });
};