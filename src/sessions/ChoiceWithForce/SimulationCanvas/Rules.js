// Rules.js
// 100% automated timeline compiler

import { getFreshState } from './Schema';

export const calculateTargets = (activeSequence, timeline) => {
    let targetState = getFreshState();

    if (!activeSequence || activeSequence.length === 0) {
        return targetState;
    }

    // Convert the activeSequence length back into an index to map to the timeline
    const activeIndex = activeSequence.length - 1;

    // Cumulatively fold the state modifiers up to the target index
    for (let i = 0; i <= activeIndex; i++) {
        const step = timeline[i];
        if (step && step.stateModifiers) {
            const isLastStep = (i === activeIndex);
            targetState = step.stateModifiers(targetState, isLastStep);
        }
    }

    return targetState;
};