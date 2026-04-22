// Schema.js

export const createLayerState = () => ({
    kavProgress: 0,
    reflectProgress: 0,
    windowProgress: 0,
    windowFillProgress: 0,
    gufExpandProgresses: [0, 0, 0, 0, 0],
    gufLightProgress: 0,
    gufReflectProgress: 0,
    sofExpandProgresses: [0, 0, 0, 0, 0],
    sofLightProgress: 0,
    sofReflectProgress: 0,
    pehFlareOpacity: 0,
    taburFlareOpacity: 0,
    siyumFlareOpacity: 0
});

export const INITIAL_STATE = {
    infinityAlpha: 0,
    rootOpacities: [0, 0, 0, 0, 0],
    subVesselOpacities: [[0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0], [0, 0, 0, 0]],
    lightOpacities: [0, 0, 0, 0],
    restrictionOpacities: [0, 0, 0, 0, 0],
    voidOpacity: 0,
    zoomLevel: 1,
    outerPhasesOpacity: 1,
    tiltProgress: 0, // NEW: Controls the 2.5D Isometric Camera
    layers: [createLayerState(), createLayerState(), createLayerState(), createLayerState(), createLayerState()]
};

export const getFreshState = () => JSON.parse(JSON.stringify(INITIAL_STATE));