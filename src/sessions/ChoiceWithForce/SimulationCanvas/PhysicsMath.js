// PhysicsMath.js
// Config-driven sequential engine. It calculates "Visual Distance" to intelligently fast-forward.

const EPSILON = 0.015;
const done = (val, target) => Math.abs(val - target) <= EPSILON;

// The exact chronological order of creation within any Partzuf
const CHRONOLOGY = [
    { prop: 'kavProgress', type: 'value' },
    { prop: 'reflectProgress', type: 'value' },
    { prop: 'windowProgress', type: 'value' },
    { prop: 'windowFillProgress', type: 'value' },
    { prop: 'gufExpandProgresses', type: 'array' },
    { prop: 'gufLightProgress', type: 'value' },
    { prop: 'gufReflectProgress', type: 'value' },
    { prop: 'sofExpandProgresses', type: 'array' },
    { prop: 'sofLightProgress', type: 'value' },
    { prop: 'sofReflectProgress', type: 'value' }
];

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
    // Dynamic Speed Boost: The larger the sequence jump, the faster it animates!
    const distance = Math.abs(getVisualSum(targets) - getVisualSum(pState));
    const seqSpeedBoost = easeSpeed * (2.5 + (distance * 1.5));
    const bgEase = easeSpeed * (1 + (distance * 0.5));

    // Generic backgrounds
    pState.infinityAlpha += (targets.infinityAlpha - pState.infinityAlpha) * bgEase;
    pState.zoomLevel += (targets.zoomLevel - pState.zoomLevel) * bgEase;
    pState.voidOpacity += (targets.voidOpacity - pState.voidOpacity) * bgEase;
    pState.outerPhasesOpacity += (targets.outerPhasesOpacity - pState.outerPhasesOpacity) * bgEase;

    for (let i = 0; i < 5; i++) pState.rootOpacities[i] += (targets.rootOpacities[i] - pState.rootOpacities[i]) * bgEase;
    for (let i = 0; i < 5; i++) pState.restrictionOpacities[i] += (targets.restrictionOpacities[i] - pState.restrictionOpacities[i]) * bgEase;
    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += (targets.lightOpacities[i] - pState.lightOpacities[i]) * bgEase;
        for (let j = 0; j < 4; j++) pState.subVesselOpacities[i][j] += (targets.subVesselOpacities[i][j] - pState.subVesselOpacities[i][j]) * bgEase;
    }

    // Evaluate each Layer
    for (let lyr = 0; lyr < 5; lyr++) {
        const p = pState.layers[lyr];
        const t = targets.layers[lyr];

        p.pehFlareOpacity += (t.pehFlareOpacity - p.pehFlareOpacity) * bgEase;
        p.taburFlareOpacity += (t.taburFlareOpacity - p.taburFlareOpacity) * bgEase;
        p.siyumFlareOpacity += (t.siyumFlareOpacity - p.siyumFlareOpacity) * bgEase;

        let canMoveFwd = true;
        let canMoveBwd = true;

        // Auto-Sequence Forwards
        for (let i = 0; i < CHRONOLOGY.length; i++) {
            const rule = CHRONOLOGY[i];
            if (rule.type === 'value') {
                const diff = t[rule.prop] - p[rule.prop];
                if (diff > EPSILON && canMoveFwd) p[rule.prop] += diff * seqSpeedBoost;
                else if (Math.abs(diff) <= EPSILON) p[rule.prop] = t[rule.prop];
                if (!done(p[rule.prop], t[rule.prop])) canMoveFwd = false;
            } else if (rule.type === 'array') {
                for (let j = 0; j < 5; j++) {
                    const diff = t[rule.prop][j] - p[rule.prop][j];
                    const prevDoneFwd = j === 0 ? canMoveFwd : done(p[rule.prop][j - 1], t[rule.prop][j - 1]);
                    if (diff > EPSILON && prevDoneFwd) p[rule.prop][j] += diff * seqSpeedBoost;
                    else if (Math.abs(diff) <= EPSILON) p[rule.prop][j] = t[rule.prop][j];
                    if (!done(p[rule.prop][j], t[rule.prop][j])) canMoveFwd = false;
                }
            }
        }

        // Auto-Sequence Backwards (For skipping backward in the timeline)
        for (let i = CHRONOLOGY.length - 1; i >= 0; i--) {
            const rule = CHRONOLOGY[i];
            if (rule.type === 'value') {
                const diff = t[rule.prop] - p[rule.prop];
                if (diff < -EPSILON && canMoveBwd) p[rule.prop] += diff * seqSpeedBoost;
                if (!done(p[rule.prop], t[rule.prop])) canMoveBwd = false;
            } else if (rule.type === 'array') {
                for (let j = 4; j >= 0; j--) {
                    const diff = t[rule.prop][j] - p[rule.prop][j];
                    const nextDoneBwd = j === 4 ? canMoveBwd : done(p[rule.prop][j + 1], t[rule.prop][j + 1]);
                    if (diff < -EPSILON && nextDoneBwd) p[rule.prop][j] += diff * seqSpeedBoost;
                    if (!done(p[rule.prop][j], t[rule.prop][j])) canMoveBwd = false;
                }
            }
        }
    }
};