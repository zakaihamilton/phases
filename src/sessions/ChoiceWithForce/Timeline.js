// Timeline.js

const rawStates = [
    // --- ROOT PHASE (EIN SOF & THE FOUR KINGDOMS) ---
    { name: "Root Phase: Energy", description: "Crown of Root (Energy / Shoresh). The pure, boundless force.", action: 'ROOT_0' },
    { name: "Root Phase: Still", description: "Wisdom of Root (Still / Domem). The initial potential of the Infinite.", action: 'ROOT_1' },
    { name: "Root Phase: Vegetative", description: "Understanding of Root (Vegetative / Tzomeach). Expansion within the Infinite.", action: 'ROOT_2' },
    { name: "Root Phase: Animate", description: "Beauty of Root (Animate / Chai). Life force within the Infinite.", action: 'ROOT_3' },
    { name: "Root Phase: Speaking", description: "Kingdom of Root (Speaking / Medaber). The Infinite completes its internal structure.", action: 'ROOT_4' },

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
    { name: "Ohr Yashar: Kingdom", description: "The Light strikes the upper boundary of the Screen (Masach).", action: 'KAV_DESCEND' },

    { name: "Ohr Chozer: Crown", description: "Crown of Reflection builds bottom-up inside the Screen.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Wisdom", description: "Wisdom of Reflection ascends and clothes Beauty of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Understanding", description: "Understanding of Reflection ascends and clothes Understanding of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Beauty", description: "Beauty of Reflection ascends and clothes Wisdom of Direct Light.", action: 'KAV_REFLECT' },
    { name: "Ohr Chozer: Kingdom", description: "Kingdom of Reflection completes the vessel.", action: 'KAV_REFLECT' },

    // --- CHALON (WINDOW) ---
    { name: "The Window (Chalon)", description: "The Reflected Light lines the Circle of Crown to form a window.", action: 'WINDOW_FORM' },
    { name: "Filling the Crown", description: "The Direct Light fills the Circle of Crown within the lining.", action: 'WINDOW_FILL' },

    // --- GUF (INTERIOR): VESSELS ---
    { name: "Guf Expansion: Crown", description: "The Screen drops to form the Crown of the Body (Guf).", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Wisdom", description: "The Screen drops from Crown to form the Wisdom of the Body.", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Understanding", description: "The Screen drops to form the Understanding of the Body.", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Beauty", description: "The Screen drops to form the Beauty of the Body.", action: 'GUF_EXPAND' },
    { name: "Guf Expansion: Kingdom", description: "The Screen completely unfurls to form the Kingdom of the Body.", action: 'GUF_EXPAND' },

    // --- GUF (INTERIOR): DIRECT LIGHT ---
    { name: "Guf Direct Light: Crown", description: "The Direct Light descends to the Crown of the Body.", action: 'GUF_DESCEND' },
    { name: "Guf Direct Light: Wisdom", description: "The Direct Light descends to the Wisdom of the Body.", action: 'GUF_DESCEND' },
    { name: "Guf Direct Light: Understanding", description: "The Direct Light descends to the Understanding of the Body.", action: 'GUF_DESCEND' },
    { name: "Guf Direct Light: Beauty", description: "The Direct Light descends to the Beauty of the Body.", action: 'GUF_DESCEND' },
    { name: "Guf Direct Light: Kingdom (Navel)", description: "The Light strikes the upper boundary of the Navel (Tabur).", action: 'GUF_DESCEND' },

    // --- GUF (INTERIOR): REFLECTED LIGHT ---
    { name: "Guf Reflected Light: Crown", description: "Crown of Reflection builds bottom-up inside the Navel.", action: 'GUF_REFLECT' },
    { name: "Guf Reflected Light: Wisdom", description: "Wisdom of Reflection ascends through Beauty of the Body.", action: 'GUF_REFLECT' },
    { name: "Guf Reflected Light: Understanding", description: "Understanding of Reflection ascends through Understanding of the Body.", action: 'GUF_REFLECT' },
    { name: "Guf Reflected Light: Beauty", description: "Beauty of Reflection ascends through Wisdom of the Body.", action: 'GUF_REFLECT' },
    { name: "Guf Reflected Light: Kingdom", description: "Kingdom of Reflection completes its ascent to just beneath the Mouth (Peh).", action: 'GUF_REFLECT' },

    // --- SOF (END): VESSELS ---
    { name: "Sof Expansion: Crown", description: "The Navel expands downwards to form the Crown of the End (Sof).", action: 'SOF_EXPAND' },
    { name: "Sof Expansion: Wisdom", description: "The Navel drops to form the Wisdom of the End.", action: 'SOF_EXPAND' },
    { name: "Sof Expansion: Understanding", description: "The Navel drops to form the Understanding of the End.", action: 'SOF_EXPAND' },
    { name: "Sof Expansion: Beauty", description: "The Navel drops to form the Beauty of the End.", action: 'SOF_EXPAND' },
    { name: "Sof Expansion: Kingdom", description: "The Screen reaches the absolute center point (Siyum Raglin).", action: 'SOF_EXPAND' },

    // --- SOF (END): DIRECT LIGHT (MERCY) ---
    { name: "Sof Direct Light: Crown", description: "The Light of Mercy (Ohr Chasodim) enters the End at half visibility.", action: 'SOF_DESCEND' },
    { name: "Sof Direct Light: Wisdom", description: "The Light of Mercy descends to Wisdom of the End.", action: 'SOF_DESCEND' },
    { name: "Sof Direct Light: Understanding", description: "The Light of Mercy descends to Understanding of the End.", action: 'SOF_DESCEND' },
    { name: "Sof Direct Light: Beauty", description: "The Light of Mercy descends to Beauty of the End.", action: 'SOF_DESCEND' },
    { name: "Sof Direct Light: Kingdom (Siyum)", description: "The Light of Mercy strikes the boundary of the absolute End.", action: 'SOF_DESCEND' },

    // --- SOF (END): REFLECTED LIGHT ---
    { name: "Sof Reflected Light: Crown", description: "Crown of Reflection builds bottom-up inside the End.", action: 'SOF_REFLECT' },
    { name: "Sof Reflected Light: Wisdom", description: "Wisdom of Reflection ascends through Beauty of the End.", action: 'SOF_REFLECT' },
    { name: "Sof Reflected Light: Understanding", description: "Understanding of Reflection ascends through Understanding of the End.", action: 'SOF_REFLECT' },
    { name: "Sof Reflected Light: Beauty", description: "Beauty of Reflection ascends through Wisdom of the End.", action: 'SOF_REFLECT' },
    { name: "Sof Reflected Light: Kingdom", description: "Kingdom of Reflection completes its ascent to just beneath the Navel (Tabur).", action: 'SOF_REFLECT' }
];

export const SpiritualStates = rawStates.map((state, index) => {
    return { index: index, name: state.name, description: state.description, activeSequence: rawStates.slice(0, index + 1).map(s => s.action) };
});