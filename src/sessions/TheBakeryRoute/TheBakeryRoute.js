import React, { useState, useEffect } from 'react';
import styles from './TheBakeryRoute.module.css';
import { PHASES } from './Phases';
import PhaseVisualizer from './PhaseVisualizer';
import ScenarioSidebar from './ScenarioSidebar';
import DescriptionPanel from './DescriptionPanel';
import { useNavigation } from './Navigation';
import BackButton from "./BackButton";

export default function TheBakeryRoute() {
    const [activePhaseId, setActivePhaseId] = useState(1);

    // Sidebar and Description are now conceptually "always open" in a floating state, 
    // but we can retain the toggles if the user wants to minimize them.
    const [isDescriptionOpen, setIsDescriptionOpen] = useState(true);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    useNavigation({
        activePhaseId,
        setActivePhaseId,
        phases: PHASES,
        isSidebarOpen,
        setIsSidebarOpen,
        isDescriptionOpen,
        setIsDescriptionOpen
    });

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') {
                setActivePhaseId((prev) => Math.min(prev + 1, PHASES.length));
            } else if (e.key === 'ArrowLeft') {
                setActivePhaseId((prev) => Math.max(prev - 1, 1));
            }
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, []);

    const activePhase = PHASES.find(p => p.id === activePhaseId);

    return (
        <div
            className={styles.appContainer}
            style={{ background: `radial-gradient(circle at top right, ${activePhase.glowColor}, transparent 50%), #020617` }}
        >
            <div className={styles.canvasPane}>
                <PhaseVisualizer
                    phase={activePhase}
                    isExpanded={true}
                    isSuperExpanded={true}
                    isDescriptionOpen={isDescriptionOpen}
                />
            </div>

            <BackButton />

            <ScenarioSidebar
                phases={PHASES}
                activePhaseId={activePhaseId}
                setActivePhaseId={setActivePhaseId}
                isSidebarOpen={isSidebarOpen}
                setIsSidebarOpen={setIsSidebarOpen}
            />

            <DescriptionPanel
                phase={activePhase}
                isSidebarOpen={isSidebarOpen}
                isDescriptionOpen={isDescriptionOpen}
                setIsDescriptionOpen={setIsDescriptionOpen}
                isHorizontallyCollapsed={false}
            />
        </div>
    );
}
