// PhysicsMath.js

// Epsilon defines how close a value must be to its target to be considered "done"
const EPSILON = 0.015;

// Helper to check if a single value has reached its target
const done = (val, target) => Math.abs(val - target) <= EPSILON;

// Helper to check if an array has completely reached its targets
const arrDone = (arr, targetsArr) => arr.every((val, i) => done(val, targetsArr[i]));

// Calculates the exact total "Visual Distance" between the current frame and target frame
const getVisualSum = (state) => {
    return state.kavProgress +
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
    // 1. CALCULATE DYNAMIC SPEED BOOST
    // Measure how many chronological steps are currently out of sync.
    const distance = Math.abs(getVisualSum(targets) - getVisualSum(pState));

    // Dynamic Multiplier: The further the distance, the faster it fast-forwards.
    // As the animation catches up (distance approaches 0), it smoothly decelerates to base speed (2.5x).
    const seqSpeedBoost = easeSpeed * (2.5 + (distance * 1.5));
    const bgEase = easeSpeed * (1 + (distance * 0.5));

    // --- 2. NON-SEQUENTIAL PROPERTIES (Backgrounds & Opacities fade naturally) ---
    pState.infinityAlpha += (targets.infinityAlpha - pState.infinityAlpha) * bgEase;
    pState.zoomLevel += (targets.zoomLevel - pState.zoomLevel) * bgEase;
    pState.voidOpacity += (targets.voidOpacity - pState.voidOpacity) * bgEase;
    pState.outerPhasesOpacity += (targets.outerPhasesOpacity - pState.outerPhasesOpacity) * bgEase;

    for (let i = 0; i < 4; i++) {
        pState.lightOpacities[i] += (targets.lightOpacities[i] - pState.lightOpacities[i]) * bgEase;
        for (let j = 0; j < 4; j++) {
            pState.subVesselOpacities[i][j] += (targets.subVesselOpacities[i][j] - pState.subVesselOpacities[i][j]) * bgEase;
        }
    }
    for (let i = 0; i < 5; i++) {
        pState.restrictionOpacities[i] += (targets.restrictionOpacities[i] - pState.restrictionOpacities[i]) * bgEase;
    }

    // Flares trigger immediately based on the target rules
    pState.pehFlareOpacity += (targets.pehFlareOpacity - pState.pehFlareOpacity) * bgEase;
    pState.taburFlareOpacity += (targets.taburFlareOpacity - pState.taburFlareOpacity) * bgEase;
    pState.siyumFlareOpacity += (targets.siyumFlareOpacity - pState.siyumFlareOpacity) * bgEase;

    // --- 3. SEQUENTIAL CAUSE AND EFFECT (Hishtalshelut) ---
    // These booleans act as mathematical "gates". A property cannot animate until 
    // the preceding property has finished arriving at its target.

    // Forward Conditions (Building Top-Down)
    const rLightDone = done(pState.kavProgress, targets.kavProgress);
    const rReflectDone = rLightDone && done(pState.reflectProgress, targets.reflectProgress);
    const wFormDone = rReflectDone && done(pState.windowProgress, targets.windowProgress);
    const wFillDone = wFormDone && done(pState.windowFillProgress, targets.windowFillProgress);
    const gExpandDone = wFillDone && arrDone(pState.gufExpandProgresses, targets.gufExpandProgresses);
    const gLightDone = gExpandDone && done(pState.gufLightProgress, targets.gufLightProgress);
    const gReflectDone = gLightDone && done(pState.gufReflectProgress, targets.gufReflectProgress);
    const sExpandDone = gReflectDone && arrDone(pState.sofExpandProgresses, targets.sofExpandProgresses);
    const sLightDone = sExpandDone && done(pState.sofLightProgress, targets.sofLightProgress);

    // Backward Conditions (Dismantling Bottom-Up during reverse jumps)
    const sReflectDoneRev = done(pState.sofReflectProgress, targets.sofReflectProgress);
    const sLightDoneRev = sReflectDoneRev && done(pState.sofLightProgress, targets.sofLightProgress);
    const sExpandDoneRev = sLightDoneRev && arrDone(pState.sofExpandProgresses, targets.sofExpandProgresses);
    const gReflectDoneRev = sExpandDoneRev && done(pState.gufReflectProgress, targets.gufReflectProgress);
    const gLightDoneRev = gReflectDoneRev && done(pState.gufLightProgress, targets.gufLightProgress);
    const gExpandDoneRev = gLightDoneRev && arrDone(pState.gufExpandProgresses, targets.gufExpandProgresses);
    const wFillDoneRev = gExpandDoneRev && done(pState.windowFillProgress, targets.windowFillProgress);
    const wFormDoneRev = wFillDoneRev && done(pState.windowProgress, targets.windowProgress);
    const rReflectDoneRev = wFormDoneRev && done(pState.reflectProgress, targets.reflectProgress);

    // Conditionally ease a single property ONLY if its turn has arrived
    const updateProp = (prop, canMoveFwd, canMoveBwd) => {
        const diff = targets[prop] - pState[prop];
        const isFwd = diff > EPSILON;
        const isBwd = diff < -EPSILON;

        if ((isFwd && canMoveFwd) || (isBwd && canMoveBwd)) {
            pState[prop] += diff * seqSpeedBoost;
        } else if (!isFwd && !isBwd) {
            pState[prop] = targets[prop]; // Snap to prevent floating drift
        }
    };

    // Conditionally ease arrays sequentially (element [1] waits for element [0])
    const updateArr = (arrProp, canMoveFwd, canMoveBwd) => {
        for (let i = 0; i < 5; i++) {
            const diff = targets[arrProp][i] - pState[arrProp][i];
            const isFwd = diff > EPSILON;
            const isBwd = diff < -EPSILON;

            // Arrays cascade: forward requires previous line done, backward requires next line done
            const prevDoneFwd = i === 0 ? canMoveFwd : done(pState[arrProp][i - 1], targets[arrProp][i - 1]);
            const nextDoneBwd = i === 4 ? canMoveBwd : done(pState[arrProp][i + 1], targets[arrProp][i + 1]);

            if ((isFwd && prevDoneFwd) || (isBwd && nextDoneBwd)) {
                pState[arrProp][i] += diff * seqSpeedBoost;
            } else if (!isFwd && !isBwd) {
                pState[arrProp][i] = targets[arrProp][i];
            }
        }
    };

    // Apply the chronological rules
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