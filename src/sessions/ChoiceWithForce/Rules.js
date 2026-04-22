// Rules.js

const createLayerState = () => ({
    kavProgress: 0, reflectProgress: 0, windowProgress: 0, windowFillProgress: 0,
    gufExpandProgresses: [0, 0, 0, 0, 0], gufLightProgress: 0, gufReflectProgress: 0,
    sofExpandProgresses: [0, 0, 0, 0, 0], sofLightProgress: 0, sofReflectProgress: 0,
    pehFlareOpacity: 0, taburFlareOpacity: 0, siyumFlareOpacity: 0
});

export const calculateTargets = (activeSequence) => {
    const targets = {
        infinityAlpha: 0, rootOpacities: [0, 0, 0, 0, 0], zoomLevel: 1,
        subVesselOpacities: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
        lightOpacities: [0, 0, 0, 0], restrictionOpacities: [0, 0, 0, 0, 0], voidOpacity: 0,
        outerPhasesOpacity: 1,
        layers: [createLayerState(), createLayerState(), createLayerState(), createLayerState(), createLayerState()]
    };

    let currentVesselIndex = -1; let coarsenCount = 0; let restrictCount = 0;

    // Dynamic counters for whichever layer is currently being built
    let actLyr = 0; // 0 = Base (Kingdom), 1 = Beauty, 2 = Understanding, 3 = Wisdom, 4 = Crown
    let kDsc = [0, 0, 0, 0, 0], kRef = [0, 0, 0, 0, 0];
    let gExp = [0, 0, 0, 0, 0], gDsc = [0, 0, 0, 0, 0], gRef = [0, 0, 0, 0, 0];
    let sExp = [0, 0, 0, 0, 0], sDsc = [0, 0, 0, 0, 0], sRef = [0, 0, 0, 0, 0];

    activeSequence.forEach(action => {
        if (action.startsWith('ROOT_')) {
            targets.infinityAlpha = 1;
            for (let i = 0; i <= parseInt(action.split('_')[1], 10); i++) targets.rootOpacities[i] = 1;
        }
        else if (action === 'COARSEN') {
            if (coarsenCount === 4 || currentVesselIndex === -1) { currentVesselIndex++; coarsenCount = 0; }
            targets.subVesselOpacities[currentVesselIndex][coarsenCount] = 1; coarsenCount++;
        }
        else if (action === 'LIGHT') { targets.lightOpacities[currentVesselIndex] = 1; coarsenCount = 4; }
        else if (action === 'RESTRICT_COARSEN') { targets.restrictionOpacities[restrictCount] = 1; restrictCount++; }
        else if (action === 'RESTRICT_ACTIVATE') { targets.lightOpacities[3] = 0; targets.voidOpacity = 1; }

        // BASE LAYER (Kingdom - Index 0)
        else if (action === 'KAV_DESCEND') { kDsc[0]++; targets.layers[0].kavProgress = Math.min(kDsc[0] * 0.20, 0.80); }
        else if (action === 'KAV_REFLECT') { targets.layers[0].kavProgress = 0.80; kRef[0]++; targets.layers[0].reflectProgress = kRef[0] * 0.20; }
        else if (action === 'WINDOW_FORM') { targets.layers[0].windowProgress = 1; }
        else if (action === 'WINDOW_FILL') { targets.layers[0].windowProgress = 1; targets.layers[0].windowFillProgress = 1; }

        else if (action === 'GUF_EXPAND') {
            targets.layers[0].windowProgress = 1; targets.layers[0].windowFillProgress = 1;
            targets.layers[0].gufExpandProgresses[gExp[0]] = 1; gExp[0]++;
        }
        else if (action === 'GUF_DESCEND') {
            targets.layers[0].gufExpandProgresses = [1, 1, 1, 1, 1];
            gDsc[0]++; targets.layers[0].gufLightProgress = Math.min(gDsc[0] * 0.20, 0.80);
        }
        else if (action === 'GUF_REFLECT') {
            targets.layers[0].gufLightProgress = 0.80;
            gRef[0]++; targets.layers[0].gufReflectProgress = gRef[0] * 0.20;
        }
        else if (action === 'SOF_EXPAND') {
            targets.layers[0].gufReflectProgress = 1;
            targets.layers[0].sofExpandProgresses[sExp[0]] = 1; sExp[0]++;
        }
        else if (action === 'SOF_DESCEND') {
            targets.layers[0].sofExpandProgresses = [1, 1, 1, 1, 1];
            sDsc[0]++; targets.layers[0].sofLightProgress = Math.min(sDsc[0] * 0.20, 0.80);
        }
        else if (action === 'SOF_REFLECT') {
            targets.layers[0].sofLightProgress = 0.80;
            sRef[0]++; targets.layers[0].sofReflectProgress = sRef[0] * 0.20;
        }

        // PURIFICATION LAYERS (Indices 1 to 4)
        // These draw on top without destroying the previous ones
        else if (action.startsWith('PURIFY_')) { actLyr = 4 - parseInt(action.split('_')[1], 10); }
        else if (action.startsWith('ROSH_DESCEND_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            kDsc[actLyr]++; targets.layers[actLyr].kavProgress = Math.min(kDsc[actLyr] * 0.20, 0.80);
        }
        else if (action.startsWith('ROSH_REFLECT_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].kavProgress = 0.80; kRef[actLyr]++; targets.layers[actLyr].reflectProgress = kRef[actLyr] * 0.20;
        }
        else if (action.startsWith('GUF_EXPAND_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].gufExpandProgresses[gExp[actLyr]] = 1; gExp[actLyr]++;
        }
        else if (action.startsWith('GUF_DESCEND_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].gufExpandProgresses = [1, 1, 1, 1, 1];
            gDsc[actLyr]++; targets.layers[actLyr].gufLightProgress = Math.min(gDsc[actLyr] * 0.20, 0.80);
        }
        else if (action.startsWith('GUF_REFLECT_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].gufLightProgress = 0.80;
            gRef[actLyr]++; targets.layers[actLyr].gufReflectProgress = gRef[actLyr] * 0.20;
        }
        else if (action.startsWith('SOF_EXPAND_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].gufReflectProgress = 1;
            targets.layers[actLyr].sofExpandProgresses[sExp[actLyr]] = 1; sExp[actLyr]++;
        }
        else if (action.startsWith('SOF_DESCEND_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].sofExpandProgresses = [1, 1, 1, 1, 1];
            sDsc[actLyr]++; targets.layers[actLyr].sofLightProgress = Math.min(sDsc[actLyr] * 0.20, 0.80);
        }
        else if (action.startsWith('SOF_REFLECT_')) {
            actLyr = 4 - parseInt(action.split('_')[2], 10);
            targets.layers[actLyr].sofLightProgress = 0.80;
            sRef[actLyr]++; targets.layers[actLyr].sofReflectProgress = sRef[actLyr] * 0.20;
        }
    });

    // Reset flares across all layers
    targets.layers.forEach(layer => { layer.pehFlareOpacity = 0; layer.taburFlareOpacity = 0; layer.siyumFlareOpacity = 0; });
    const lastAction = activeSequence[activeSequence.length - 1] || '';

    // Only the *active* layer's boundary flashes during its strike phase!
    if (lastAction === 'KAV_DESCEND') targets.layers[0].pehFlareOpacity = 1;
    if (lastAction === 'GUF_DESCEND') targets.layers[0].taburFlareOpacity = 1;
    if (lastAction === 'SOF_DESCEND') targets.layers[0].siyumFlareOpacity = 1;

    if (lastAction.startsWith('ROSH_DESCEND_')) targets.layers[4 - parseInt(lastAction.split('_')[2], 10)].pehFlareOpacity = 1;
    if (lastAction.startsWith('GUF_DESCEND_')) targets.layers[4 - parseInt(lastAction.split('_')[2], 10)].taburFlareOpacity = 1;
    if (lastAction.startsWith('SOF_DESCEND_')) targets.layers[4 - parseInt(lastAction.split('_')[2], 10)].siyumFlareOpacity = 1;

    const zoomIndex = currentVesselIndex >= 0 ? currentVesselIndex : 0;
    if (zoomIndex === 3) targets.zoomLevel = 2.8;
    else if (zoomIndex === 2) targets.zoomLevel = 2.2;
    else if (zoomIndex === 1) targets.zoomLevel = 1.6;
    else if (zoomIndex === 0) targets.zoomLevel = 1.2;

    if (targets.layers[0].windowProgress > 0 || kDsc[0] > 0) {
        targets.zoomLevel = 4.2; targets.outerPhasesOpacity = 0;
    } else if (restrictCount > 0) {
        targets.zoomLevel = 2.8 + (restrictCount * 0.3);
    }

    return targets;
};