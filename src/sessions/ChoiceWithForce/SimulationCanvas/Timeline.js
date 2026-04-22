// Timeline.js
// The timeline now directly modifies the state, eliminating the need for Rules.js parsing!

const buildTimeline = () => {
    const timeline = [];

    // Helper to safely draft modifiers without mutating original state
    const mod = (fn) => (state, isLast) => {
        const s = JSON.parse(JSON.stringify(state));
        fn(s, isLast);
        return s;
    };

    // 1. Root Phases
    const roots = ["Energy", "Still", "Vegetative", "Animate", "Speaking"];
    roots.forEach((name, i) => {
        timeline.push({
            name: `Root Phase: ${name}`,
            description: `Level ${i} of the Infinite.`,
            action: `ROOT_${i}`,
            stateModifiers: mod(s => {
                s.infinityAlpha = 1; s.zoomLevel = 1.2;
                for (let j = 0; j <= i; j++) s.rootOpacities[j] = 1;
            })
        });
    });

    // 2. Coarsenings & Light (Phase 1 to 4)
    const vessels = ["Wisdom", "Understanding", "Beauty", "Kingdom"];
    vessels.forEach((vName, vIdx) => {
        for (let cIdx = 0; cIdx < 4; cIdx++) {
            timeline.push({
                name: `Phase ${vIdx + 1}: Coarsening ${cIdx + 1}`,
                description: `Vessel ${vName} coarsening.`,
                action: `COARSEN_${vIdx}_${cIdx}`,
                stateModifiers: mod(s => {
                    s.subVesselOpacities[vIdx][cIdx] = 1;
                    s.zoomLevel = 1.2 + (vIdx * 0.4);
                })
            });
        }
        timeline.push({
            name: `Phase ${vIdx + 1}: Light of ${vName}`,
            description: `Light fills ${vName}.`,
            action: `LIGHT_${vIdx}`,
            stateModifiers: mod(s => {
                s.lightOpacities[vIdx] = 1;
                s.zoomLevel = 1.2 + (vIdx * 0.4);
            })
        });
    });

    // 3. Restriction
    for (let r = 0; r < 5; r++) {
        timeline.push({
            name: `Restriction: Step ${r + 1}`,
            description: `Solidifying restriction.`,
            action: `RESTRICT_${r}`,
            stateModifiers: mod(s => {
                s.restrictionOpacities[r] = 1;
                s.zoomLevel = 2.8 + (r * 0.3);
            })
        });
    }
    timeline.push({
        name: "The Tzimtzum",
        description: "Light departs.",
        action: 'RESTRICT_ACTIVATE',
        stateModifiers: mod(s => {
            s.lightOpacities[3] = 0; s.voidOpacity = 1; s.zoomLevel = 4.2; s.outerPhasesOpacity = 0;
        })
    });

    // 4. The 5 Nested Layers of the Partzuf
    const purifications = ["Kingdom (Galgalta)", "Beauty", "Understanding", "Wisdom", "Crown"];

    for (let lyr = 0; lyr < 5; lyr++) {
        const pName = purifications[lyr];

        if (lyr > 0) {
            timeline.push({
                name: `Purification to ${pName}`,
                description: `The screen purifies to the next layer. Nested emergence begins.`,
                action: `PURIFY_START_${lyr}`,
                stateModifiers: mod(s => {
                    s.layers[lyr] = JSON.parse(JSON.stringify(s.layers[lyr])); // Ensure clean initialization 
                })
            });
        }

        // Rosh (Head)
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Rosh of ${pName}: Descend ${step}`,
                description: `Direct Light descends.`,
                action: `ROSH_DESCEND_${lyr}_${step}`,
                stateModifiers: mod((s, isLast) => {
                    s.layers[lyr].kavProgress = Math.min(step * 0.20, 0.80);
                    if (isLast && step >= 5) s.layers[lyr].pehFlareOpacity = 1;
                })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Rosh of ${pName}: Reflect ${step}`,
                description: `Reflected Light ascends.`,
                action: `ROSH_REFLECT_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].reflectProgress = step * 0.20; })
            });
        }

        if (lyr === 0) {
            timeline.push({ name: "The Window", description: "Forming window.", action: 'WINDOW_FORM', stateModifiers: mod(s => { s.layers[0].windowProgress = 1; }) });
            timeline.push({ name: "Filling the Crown", description: "Filling window.", action: 'WINDOW_FILL', stateModifiers: mod(s => { s.layers[0].windowFillProgress = 1; }) });
        }

        // Guf (Interior)
        for (let step = 0; step < 5; step++) {
            timeline.push({
                name: `Guf of ${pName}: Expand ${step + 1}`,
                description: `Interior boundary expands.`,
                action: `GUF_EXPAND_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].gufExpandProgresses[step] = 1; })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Guf of ${pName}: Light ${step}`,
                description: `Light hits the Navel.`,
                action: `GUF_DESCEND_${lyr}_${step}`,
                stateModifiers: mod((s, isLast) => {
                    s.layers[lyr].gufLightProgress = Math.min(step * 0.20, 0.80);
                    if (isLast && step >= 5) s.layers[lyr].taburFlareOpacity = 1;
                })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Guf of ${pName}: Reflect ${step}`,
                description: `Reflection rises from Navel.`,
                action: `GUF_REFLECT_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].gufReflectProgress = step * 0.20; })
            });
        }

        // Sof (End)
        for (let step = 0; step < 5; step++) {
            timeline.push({
                name: `Sof of ${pName}: Expand ${step + 1}`,
                description: `End boundary expands.`,
                action: `SOF_EXPAND_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].sofExpandProgresses[step] = 1; })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Sof of ${pName}: Light ${step}`,
                description: `Light hits the Siyum.`,
                action: `SOF_DESCEND_${lyr}_${step}`,
                stateModifiers: mod((s, isLast) => {
                    s.layers[lyr].sofLightProgress = Math.min(step * 0.20, 0.80);
                    if (isLast && step >= 5) s.layers[lyr].siyumFlareOpacity = 1;
                })
            });
        }
        for (let step = 1; step <= 5; step++) {
            timeline.push({
                name: `Sof of ${pName}: Reflect ${step}`,
                description: `Reflection rises from Siyum.`,
                action: `SOF_REFLECT_${lyr}_${step}`,
                stateModifiers: mod(s => { s.layers[lyr].sofReflectProgress = step * 0.20; })
            });
        }
    }

    return timeline;
};

// Generates the active sequence array automatically so parent UI buttons work
export const SpiritualStates = buildTimeline().map((state, index, arr) => {
    const seq = arr.slice(0, index + 1).map(s => s.action);
    return { index, ...state, activeSequence: seq };
});