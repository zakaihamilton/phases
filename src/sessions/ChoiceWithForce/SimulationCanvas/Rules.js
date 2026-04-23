// Rules.js

import { getFreshState } from './Schema';

export const calculateTargets = (activeSequence, timeline) => {
    let targetState = getFreshState();

    if (!activeSequence || activeSequence.length === 0) {
        return targetState;
    }

    const currentStep = activeSequence[activeSequence.length - 1];

    // Finds the precise index in the master timeline so mid-sequence jumps calculate correctly
    let absoluteIndex = timeline.findIndex(t => t.action === currentStep.action);

    // Fallback if not found
    if (absoluteIndex === -1) {
        absoluteIndex = activeSequence.length - 1;
    }

    // Fold the state from the VERY BEGINNING to ensure all history (Light) is applied!
    for (let i = 0; i <= absoluteIndex; i++) {
        const step = timeline[i];
        if (step && step.stateModifiers) {
            const isLastStep = (i === absoluteIndex);
            targetState = step.stateModifiers(targetState, isLastStep);
        }
    }

    return targetState;
};