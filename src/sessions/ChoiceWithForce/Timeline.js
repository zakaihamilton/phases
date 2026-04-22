// Timeline.js

const rawStates = [
    { name: "Root Phase", description: "The Light of Crown (Keter). The Infinite Light fills the background.", action: 'ROOT' },

    // --- PHASE 1 TO 4 ---
    { name: "Phase 1: Crown of Wisdom", description: "Kingdom of Crown coarsens to become the vessel for Crown of Wisdom.", action: 'COARSEN' },
    { name: "Phase 1: Wisdom of Wisdom", description: "The vessel coarsens further to Wisdom of Wisdom.", action: 'COARSEN' },
    { name: "Phase 1: Understanding of Wisdom", description: "The vessel coarsens to Understanding and Beauty of Wisdom.", action: 'COARSEN' },
    { name: "Phase 1: Kingdom of Wisdom", description: "The vessel completes its coarsening at Kingdom of Wisdom.", action: 'COARSEN' },
    { name: "Phase 1: Light of Wisdom", description: "The completed vessel attracts the Light of Wisdom.", action: 'LIGHT' },

    { name: "Phase 2: Crown of Understanding", description: "Kingdom of Wisdom coarsens to become Crown of Understanding.", action: 'COARSEN' },
    { name: "Phase 2: Wisdom of Understanding", description: "The vessel coarsens further to Wisdom of Understanding.", action: 'COARSEN' },
    { name: "Phase 2: Understanding of Understanding", description: "The vessel coarsens to Understanding and Beauty of Understanding.", action: 'COARSEN' },
    { name: "Phase 2: Kingdom of Understanding", description: "The vessel completes its coarsening at Kingdom of Understanding.", action: 'COARSEN' },
    { name: "Phase 2: Light of Understanding", description: "The completed vessel attracts the Light of Understanding.", action: 'LIGHT' },

    { name: "Phase 3: Crown of Beauty", description: "Kingdom of Understanding coarsens to become Crown of Beauty.", action: 'COARSEN' },
    { name: "Phase 3: Wisdom of Beauty", description: "The vessel coarsens further to Wisdom of Beauty.", action: 'COARSEN' },
    { name: "Phase 3: Understanding of Beauty", description: "The vessel coarsens to Understanding and Beauty of Beauty.", action: 'COARSEN' },
    { name: "Phase 3: Kingdom of Beauty", description: "The vessel completes its coarsening at Kingdom of Beauty.", action: 'COARSEN' },
    { name: "Phase 3: Light of Beauty", description: "The completed vessel attracts the Light of Beauty.", action: 'LIGHT' },

    { name: "Phase 4: Crown of Kingdom", description: "Kingdom of Beauty coarsens to become Crown of Kingdom.", action: 'COARSEN' },
    { name: "Phase 4: Wisdom of Kingdom", description: "The vessel coarsens further to Wisdom of Kingdom.", action: 'COARSEN' },
    { name: "Phase 4: Understanding of Kingdom", description: "The vessel coarsens to Understanding and Beauty of Kingdom.", action: 'COARSEN' },
    { name: "Phase 4: Kingdom of Kingdom", description: "The vessel completes its absolute coarsening.", action: 'COARSEN' },
    { name: "Phase 4: Light of Kingdom", description: "The final vessel attracts the Light of Kingdom.", action: 'LIGHT' },

    // --- RESTRICTION ---
    { name: "Restriction: Crown", description: "Phase 4 recognizes its disparity of form and desires not to receive.", action: 'RESTRICT_COARSEN' },
    { name: "Restriction: Wisdom", description: "The desire to restrict coarsens to Wisdom of Restriction.", action: 'RESTRICT_COARSEN' },
    { name: "Restriction: Understanding", description: "The desire to restrict coarsens to Understanding of Restriction.", action: 'RESTRICT_COARSEN' },
    { name: "Restriction: Beauty", description: "The desire to restrict coarsens to Beauty of Restriction.", action: 'RESTRICT_COARSEN' },
    { name: "Restriction: Kingdom", description: "The restriction fully solidifies at Kingdom of Restriction.", action: 'RESTRICT_COARSEN' },
    { name: "The Tzimtzum", description: "The Restriction is activated. The Light departs from Phase Four.", action: 'RESTRICT_ACTIVATE' },

    // --- ROSH (HEAD) ---
    { name: "Ohr Yashar: Crown", description: "The Line of Light enters the void, reaching Crown.", action: 'KAV_DESCEND' },
    { name: "Ohr Yashar: Wisdom", description: "The Direct Light descends to Wisdom.", action: 'KAV_DESCEND' },
    { name: "Ohr Yashar: Understanding", description: "The Direct Light descends to Understanding.", action: 'KAV_DESCEND' },
    { name: "Ohr Yashar: Beauty", description: "The Direct Light descends to Beauty.", action: 'KAV_DESCEND' },
    { name: "Ohr Yashar: Kingdom", description: "The Light strikes the Screen (Masach) at Kingdom.", action: 'KAV_DESCEND' },

    { name: "Ohr Chozer: Crown", description: "Crown of Reflection clothes Kingdom of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Wisdom", description: "Wisdom of Reflection ascends and clothes Beauty of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Understanding", description: "Understanding of Reflection ascends and clothes Understanding of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Beauty", description: "Beauty of Reflection ascends and clothes Wisdom of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Kingdom", description: "Kingdom of Reflection completes the vessel.", action: 'KAV_REFLECT' },

    // --- CHALON (WINDOW) ---
    { name: "The Window (Chalon)", description: "The Reflected Light lines the Circle of Crown to form a window.", action: 'WINDOW_FORM' },
    { name: "Filling the Crown", description: "The Direct Light fills the Circle of Crown within the lining.", action: 'WINDOW_FILL' },

    // --- GUF (BODY): VESSELS (EXPANDING SCREEN) ---
    { name: "Guf Expansion: Crown", description: "The Screen drops to form the Crown of the Body (Guf).", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Wisdom", description: "The Screen drops from Crown to form the Wisdom of the Body.", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Understanding", description: "The Screen drops to form the Understanding of the Body.", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Beauty", description: "The Screen drops to form the Beauty of the Body.", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Kingdom", description: "The Screen completely unfurls to form the Kingdom of the Body.", action: 'GUF_EXPAND' },

    // --- GUF (BODY): LIGHT (TA'AMIM) ---
    { name: "Guf Light: Crown", description: "The Direct Light descends to fill the Crown of the Body.", action: 'GUF_FILL' },
    { name: "Guf Light: Wisdom", description: "The Direct Light descends to fill the Wisdom of the Body.", action: 'GUF_FILL' },
    { name: "Guf Light: Understanding", description: "The Direct Light descends to fill the Understanding of the Body.", action: 'GUF_FILL' },
    { name: "Guf Light: Beauty", description: "The Direct Light descends to fill the Beauty of the Body.", action: 'GUF_FILL' },
    { name: "Guf Light: Kingdom", description: "The Direct Light fills the entirety of the Guf.", action: 'GUF_FILL' }
];

export const SpiritualStates = rawStates.map((state, index) => {
    return { index: index, name: state.name, description: state.description, activeSequence: rawStates.slice(0, index + 1).map(s => s.action) };
});