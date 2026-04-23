// Timeline.js

const buildTimeline = () => {
    const timeline = [];

    const mod = (fn) => (state, isLast) => {
        const s = JSON.parse(JSON.stringify(state));
        fn(s, isLast);
        return s;
    };

    const roots = ["Energy", "Still", "Vegetative", "Animate", "Speaking"];
    roots.forEach((name, i) => {
        timeline.push({
            name: `Root Phase: ${name}`, description: `Level ${i} of the Infinite.`, action: `ROOT_${i}`,
            stateModifiers: mod(s => {
                s.infinityAlpha = 1; s.zoomLevel = 1.2; s.tiltProgress = 0;
                for (let j = 0; j <= i; j++) s.rootOpacities[j] = 1;
            })
        });
    });

    const vessels = ["Wisdom", "Understanding", "Beauty", "Kingdom"];
    vessels.forEach((vName, vIdx) => {
        for (let cIdx = 0; cIdx < 4; cIdx++) {
            timeline.push({
                name: `Phase ${vIdx + 1}: Coarsening ${cIdx + 1}`, description: `Vessel ${vName} coarsening.`, action: `COARSEN_${vIdx}_${cIdx}`,
                stateModifiers: mod(s => { s.subVesselOpacities[vIdx][cIdx] = 1; s.zoomLevel = 1.2 + (vIdx * 0.4); })
            });
        }
        timeline.push({
            name: `Phase ${vIdx + 1}: Light Enters`, description: `Light enters ${vName}.`, action: `LIGHT_${vIdx}`,
            stateModifiers: mod(s => { s.lightOpacities[vIdx] = 1; })
        });
    });

    timeline.push({
        name: `The Restriction`, description: `The Light departs. The Void is formed.`, action: `RESTRICTION_VOID`,
        stateModifiers: mod(s => { s.voidOpacity = 1; })
    });

    for (let i = 0; i < 5; i++) {
        timeline.push({
            name: `Circles of Restriction ${i + 1}`, description: `Setting boundaries of the Void.`, action: `RESTRICTION_CIRCLES_${i}`,
            stateModifiers: mod(s => { s.restrictionOpacities[i] = 1; })
        });
    }

    timeline.push({
        name: `Preparation for the Ray`, description: `The Outer Phases dim. The 3D view rotates.`, action: `PREP_RAY`,
        stateModifiers: mod(s => { s.outerPhasesOpacity = 0.2; s.tiltProgress = 1; })
    });

    const pNames = ["Crown", "Wisdom", "Understanding", "Beauty", "Kingdom"];

    for (let lyr = 0; lyr < 5; lyr++) {
        const pName = pNames[lyr];

        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Head of ${pName}: Ray ${step}`, description: `Ray descends into the Head.`, action: `RAY_DESCEND_${lyr}_${step}`,
                stateModifiers: mod((s, isLast) => {
                    s.layers[lyr].rayProgress = Math.min(step * 0.20, 0.80);
                    if (isLast && step >= 5) s.layers[lyr].mouthFlareOpacity = 1;
                })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Head of ${pName}: Reflect ${step}`, description: `Reflection rises from the Mouth.`, action: `HEAD_REFLECT_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].headReflectProgress = step * 0.20; })
            });
        }
        timeline.push({
            name: `Head of ${pName}: Window Lined`, description: `The Outer Vessel is defined.`, action: `WINDOW_LINE_${lyr}`,
            stateModifiers: mod(s => { s.layers[lyr].windowProgress = 1; })
        });
        timeline.push({
            name: `Head of ${pName}: Window Filled`, description: `The Inner Vessel manifests.`, action: `WINDOW_FILL_${lyr}`,
            stateModifiers: mod(s => { s.layers[lyr].windowFillProgress = 1; })
        });

        for (let step = 0; step < 5; step++) {
            timeline.push({
                name: `Body of ${pName}: Expand ${step + 1}`, description: `Body boundary expands.`, action: `BODY_EXPAND_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].bodyExpandProgresses[step] = 1; })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Body of ${pName}: Light ${step}`, description: `Light hits the Navel.`, action: `BODY_DESCEND_${lyr}_${step}`,
                stateModifiers: mod((s, isLast) => {
                    s.layers[lyr].bodyLightProgress = Math.min(step * 0.20, 0.80);
                    if (isLast && step >= 5) s.layers[lyr].navelFlareOpacity = 1;
                })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Body of ${pName}: Reflect ${step}`, description: `Reflection rises from the Navel.`, action: `BODY_REFLECT_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].bodyReflectProgress = step * 0.20; })
            });
        }

        for (let step = 0; step < 5; step++) {
            timeline.push({
                name: `End of ${pName}: Expand ${step + 1}`, description: `End boundary expands.`, action: `END_EXPAND_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].endExpandProgresses[step] = 1; })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `End of ${pName}: Light ${step}`, description: `Light hits the Toes.`, action: `END_DESCEND_${lyr}_${step}`,
                stateModifiers: mod((s, isLast) => {
                    s.layers[lyr].endLightProgress = Math.min(step * 0.20, 0.80);
                    if (isLast && step >= 5) s.layers[lyr].toesFlareOpacity = 1;
                })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `End of ${pName}: Reflect ${step}`, description: `Reflection rises from the Toes.`, action: `END_REFLECT_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].endReflectProgress = step * 0.20; })
            });
        }
    }

    return timeline;
};

export const SpiritualStates = buildTimeline();