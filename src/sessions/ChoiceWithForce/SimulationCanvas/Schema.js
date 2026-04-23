// Schema.js

export const createLayerState = () => ({
    rayProgress: 0,
    headReflectProgress: 0,
    windowProgress: 0,
    windowFillProgress: 0,
    bodyExpandProgresses: [0, 0, 0, 0, 0],
    bodyLightProgress: 0,
    bodyReflectProgress: 0,
    endExpandProgresses: [0, 0, 0, 0, 0],
    endLightProgress: 0,
    endReflectProgress: 0,
    mouthFlareOpacity: 0,
    navelFlareOpacity: 0,
    toesFlareOpacity: 0
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
    tiltProgress: 0,
    layers: [createLayerState(), createLayerState(), createLayerState(), createLayerState(), createLayerState()]
};

export const getFreshState = () => JSON.parse(JSON.stringify(INITIAL_STATE));