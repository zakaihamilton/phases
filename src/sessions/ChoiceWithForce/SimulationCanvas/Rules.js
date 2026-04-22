// Rules.js
// 100% automated timeline compiler

import { getFreshState } from './Schema';

export const calculateTargets = (activeSequence, timeline) => {
    let targetState = getFreshState();

    if (!activeSequence || activeSequence.length === 0) {
        return targetState;
    }

    // 1. Identify the current step the user is on
    const currentStep = activeSequence[activeSequence.length - 1];

    // 2. Find its absolute position in the master timeline using its unique 'action' ID
    const absoluteIndex = timeline.findIndex(t => t.action === currentStep.action);

    // Fallback to length-based index if action isn't found
    const targetIndex = absoluteIndex !== -1 ? absoluteIndex : activeSequence.length - 1;

    // 3. Cumulatively fold the state modifiers from the VERY BEGINNING up to the target index.
    // This ensures all previous states (foundational layers, previous purifications) are fully built!
    for (let i = 0; i <= targetIndex; i++) {
        const step = timeline[i];
        if (step && step.stateModifiers) {
            const isLastStep = (i === targetIndex);
            targetState = step.stateModifiers(targetState, isLastStep);
        }
    }

    return targetState;
};