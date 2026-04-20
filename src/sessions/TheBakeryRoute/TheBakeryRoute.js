import React, { useState } from 'react';
import styles from './TheBakeryRoute.module.css';
import { PHASES } from './Phases';
import Header from './Header';
import PhaseVisualizer from './PhaseVisualizer';
import ScenarioSidebar from './ScenarioSidebar';
import DescriptionPanel from './DescriptionPanel';
import { useNavigation } from './Navigation';

export default function TheBakeryRoute() {
    const [activePhaseId, setActivePhaseId] = useState(1);
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

    const activePhase = PHASES.find(p => p.id === activePhaseId);
    const isHorizontallyCollapsed = !isSidebarOpen && !isDescriptionOpen;

    return (
        <div
            className={styles.appContainer}
            style={{ background: `radial-gradient(circle at top right, ${activePhase.glowColor}, transparent 50%), #020617` }}
        >
            <div className={styles.contentWrapper}>
                <Header />

                <div className={styles.mainLayout}>
                    <ScenarioSidebar
                        phases={PHASES}
                        activePhaseId={activePhaseId}
                        setActivePhaseId={setActivePhaseId}
                        isSidebarOpen={isSidebarOpen}
                        setIsSidebarOpen={setIsSidebarOpen}
                    />

                    <div className={styles.rightCol}>
                        <div className={`${styles.canvasPane} ${isSidebarOpen ? styles.canvasPaneSidebarOpen : (isDescriptionOpen ? styles.canvasPaneDescOpen : styles.canvasPaneDescClosed)
                            }`}>
                            <PhaseVisualizer
                                phase={activePhase}
                                isExpanded={!isSidebarOpen}
                                isSuperExpanded={isHorizontallyCollapsed}
                            />
                        </div>

                        <DescriptionPanel
                            phase={activePhase}
                            isSidebarOpen={isSidebarOpen}
                            isDescriptionOpen={isDescriptionOpen}
                            setIsDescriptionOpen={setIsDescriptionOpen}
                            isHorizontallyCollapsed={isHorizontallyCollapsed}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
