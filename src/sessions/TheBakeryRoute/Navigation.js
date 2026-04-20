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
    useEffect(() => {
        const handleKeyDown = (e) => {
            // Return to launcher on Escape
            if (e.key === "Escape") {
                window.location.hash = 'launcher';
                return;
            }

            // Phase navigation with Up/Down arrows
            if (e.key === "ArrowUp") {
                e.preventDefault();
                setActivePhaseId(prev => {
                    const currentIndex = phases.findIndex(p => p.id === prev);
                    const nextIndex = Math.max(0, currentIndex - 1);
                    return phases[nextIndex].id;
                });
            } else if (e.key === "ArrowDown") {
                e.preventDefault();
                setActivePhaseId(prev => {
                    const currentIndex = phases.findIndex(p => p.id === prev);
                    const nextIndex = Math.min(phases.length - 1, currentIndex + 1);
                    return phases[nextIndex].id;
                });
            }

            // Panel toggling with Left/Right arrows
            if (e.key === "ArrowLeft") {
                if (isDescriptionOpen) {
                    setIsDescriptionOpen(false);
                } else if (!isSidebarOpen) {
                    setIsSidebarOpen(true);
                }
            } else if (e.key === "ArrowRight") {
                if (isSidebarOpen) {
                    setIsSidebarOpen(false);
                } else if (!isDescriptionOpen) {
                    setIsDescriptionOpen(true);
                }
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
