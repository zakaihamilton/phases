const Rules = [
    {
        id: 'INFINITY',
        name: 'Infinite Light',
        desc: 'Activates omnipresent background energy field.',
        applyState: (pState, isActive) => {
            const target = isActive ? 1 : 0;
            pState.infinityAlpha += (target - pState.infinityAlpha) * 0.05;
        }
    },
    {
        id: 'IGULIM',
        name: 'Igulim (Rings)',
        desc: 'Renders 4 concentric structural boundaries.',
        applyState: (pState, isActive) => {
            const target = isActive ? 1 : 0;
            pState.igulimProgress += (target - pState.igulimProgress) * 0.05;
            pState.strokes += (target - pState.strokes) * 0.05;
        }
    },
    {
        id: 'FILL',
        name: 'Light Fill',
        desc: 'Increases inner opacity of concentric boundaries to 100%.',
        applyState: (pState, isActive, activeRules) => {
            const targetFill = isActive ? 1 : 0;
            const isRestricted = activeRules.has('RESTRICTION');

            for (let i = 0; i < 4; i++) {
                if (isRestricted) {
                    pState.fills[i] += (0 - pState.fills[i]) * 0.05;
                } else {
                    pState.fills[i] += (targetFill - pState.fills[i]) * 0.05;
                }
            }
        }
    },
    {
        id: 'RESTRICTION',
        name: 'Restriction',
        desc: 'Overrides Fill. Forces inner opacity of boundaries to 0%.',
        // State mutation is handled inside the FILL rule's dependency check
        applyState: () => { }
    },
    {
        id: 'SCREEN',
        name: 'The Screen',
        desc: 'Renders barrier at Y:83%. Truncates Attraction vector.',
        applyState: (pState, isActive) => {
            const target = isActive ? 1 : 0;
            pState.screenAlpha += (target - pState.screenAlpha) * 0.05;
        }
    },
    {
        id: 'ATTRACTION',
        name: 'Attraction Vector',
        desc: 'Initiates downward vertical light beam targeting Y:100%.',
        applyState: (pState, isActive, activeRules) => {
            const screenPosition = 0.833;
            const targetBeamRaw = isActive ? 1 : 0;
            const actualBeamTarget = activeRules.has('SCREEN') ? Math.min(targetBeamRaw, screenPosition) : targetBeamRaw;

            if (pState.beamProgress < actualBeamTarget) {
                pState.beamProgress += (actualBeamTarget - pState.beamProgress) * 0.1 + 0.005;
                if (pState.beamProgress > actualBeamTarget) pState.beamProgress = actualBeamTarget;
            } else {
                pState.beamProgress += (actualBeamTarget - pState.beamProgress) * 0.1;
            }
        }
    },
    {
        id: 'REFLECTION',
        name: 'Reflected Vector',
        desc: 'If Screen and Attraction collide, initiates upward light vector.',
        applyState: (pState, isActive, activeRules) => {
            const screenPosition = 0.833;
            const isHittingScreen = pState.beamProgress >= screenPosition - 0.01;
            const targetReflect = (isActive && activeRules.has('SCREEN') && activeRules.has('ATTRACTION') && isHittingScreen) ? 1 : 0;

            if (pState.reflectProgress < targetReflect) {
                pState.reflectProgress += (targetReflect - pState.reflectProgress) * 0.04 + 0.002;
                if (pState.reflectProgress > targetReflect) pState.reflectProgress = targetReflect;
            } else {
                pState.reflectProgress += (targetReflect - pState.reflectProgress) * 0.1;
            }
        }
    }
];

export default Rules;