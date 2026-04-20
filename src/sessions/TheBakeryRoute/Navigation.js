import { useEffect } from 'react';

/**
 * Custom hook to handle keyboard navigation for TheBakeryRoute
 * 
 * @param {Object} props - Navigation properties
 * @param {number} props.activePhaseId - Current active phase ID
 * @param {Function} props.setActivePhaseId - Setter for active phase ID
 * @param {Array} props.phases - List of all phases
 * @param {boolean} props.isSidebarOpen - Current state of sidebar visibility
 * @param {Function} props.setIsSidebarOpen - Setter for sidebar visibility
 * @param {boolean} props.isDescriptionOpen - Current state of description panel visibility
 * @param {Function} props.setIsDescriptionOpen - Setter for description panel visibility
 */
export function useNavigation({
    activePhaseId,
    setActivePhaseId,
    phases,
    isSidebarOpen,
    setIsSidebarOpen,
    isDescriptionOpen,
    setIsDescriptionOpen
}) {
    // Initial load and hash change listener
    useEffect(() => {
        const syncFromHash = () => {
            const hash = window.location.hash.replace('#', '');
            const parts = hash.split('/');
            if (parts[0] === 'bakery-route') {
                const id = parseInt(parts[1], 10);
                if (!isNaN(id)) {
                    if (phases.some(p => p.id === id)) {
                        setActivePhaseId(id);
                    }
                } else if (!parts[1]) {
                    // Default to first phase if no ID provided
                    setActivePhaseId(phases[0].id);
                }
            }
        };

        syncFromHash();
        window.addEventListener('hashchange', syncFromHash);
        return () => window.removeEventListener('hashchange', syncFromHash);
    }, [phases, setActivePhaseId]);

    // Update hash on activePhaseId change
    useEffect(() => {
        const newHash = `#bakery-route/${activePhaseId}`;
        if (window.location.hash !== newHash) {
            window.history.replaceState(null, '', newHash);
        }
    }, [activePhaseId]);

    useEffect(() => {
        const handleKeyDown = (e) => {
            // Return to launcher on Escape
            if (e.key === "Escape") {
                window.location.hash = 'launcher';
                return;
            }

            // Phase navigation with Left/Right arrows
            if (e.key === "ArrowLeft") {
                e.preventDefault();
                setActivePhaseId(prev => {
                    const currentIndex = phases.findIndex(p => p.id === prev);
                    const nextIndex = Math.max(0, currentIndex - 1);
                    return phases[nextIndex].id;
                });
            } else if (e.key === "ArrowRight") {
                e.preventDefault();
                setActivePhaseId(prev => {
                    const currentIndex = phases.findIndex(p => p.id === prev);
                    const nextIndex = Math.min(phases.length - 1, currentIndex + 1);
                    return phases[nextIndex].id;
                });
            }

            // Description panel visibility with Up/Down arrows
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setIsDescriptionOpen(true);
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setIsDescriptionOpen(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [
        activePhaseId, 
        setActivePhaseId, 
        phases, 
        isSidebarOpen, 
        setIsSidebarOpen, 
        isDescriptionOpen, 
        setIsDescriptionOpen
    ]);
}
