import { useEffect } from 'react';
import { SpiritualStates } from '../SimulationCanvas/Timeline';

/**
 * Helper to get initial state from hash
 */
export const getInitialStateIndex = () => {
    if (typeof window === 'undefined') return 0;
    const hash = window.location.hash.replace('#', '');
    const parts = hash.split('/');
    if (parts[0] === 'choice-with-force') {
        const id = parseInt(parts[1], 10);
        if (!isNaN(id)) {
            return Math.max(0, Math.min(id, SpiritualStates.length - 1));
        }
    }
    return 0;
};


export function useNavigation({
    currentStateIndex,
    setCurrentStateIndex
}) {

    // Initial load and hash change listener
    useEffect(() => {
        const syncFromHash = () => {
            const hash = window.location.hash.replace('#', '');
            const parts = hash.split('/');

            // Check if the hash matches this session
            if (parts[0] === 'choice-with-force') {
                const id = parseInt(parts[1], 10);
                if (!isNaN(id)) {
                    // Clamp the ID to valid range
                    const validatedId = Math.max(0, Math.min(id, SpiritualStates.length - 1));
                    setCurrentStateIndex(validatedId);
                } else if (!parts[1]) {
                    // Default to first state if no index provided
                    setCurrentStateIndex(0);
                }
            }
        };

        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);
        return () => window.removeEventListener('hashchange', syncFromHash);
    }, [setCurrentStateIndex]);

    // Update hash on currentStateIndex change
    useEffect(() => {
        const newHash = `#choice-with-force/${currentStateIndex}`;
        if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', newHash);
        }
    }, [currentStateIndex]);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Return to launcher on Escape
            if (e.key === "Escape") {
                window.location.hash = 'launcher';
                return;
            }

            // State navigation with Left/Right arrows
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                setCurrentStateIndex(prev => Math.max(0, prev - 1));
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setCurrentStateIndex(prev => Math.min(SpiritualStates.length - 1, prev + 1));
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [setCurrentStateIndex]);
}
