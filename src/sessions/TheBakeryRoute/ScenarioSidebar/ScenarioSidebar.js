import React from 'react';
import { Map, ChevronDown, ChevronUp } from 'lucide-react';
import styles from './ScenarioSidebar.module.css';

const ScenarioSidebar = ({ 
    phases, 
    activePhaseId, 
    setActivePhaseId, 
    isSidebarOpen, 
    setIsSidebarOpen 
}) => {
    return (
        <div className={`${styles.sidebar} ${isSidebarOpen ? styles.sidebarStateOpen : styles.sidebarStateClosed}`}>
            <div
                className={`${styles.sidebarHeader} ${!isSidebarOpen ? styles.sidebarHeaderClosedLg : ''}`}
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            >
                <div className={styles.sidebarHeaderLeft}>
                    <div className={styles.sidebarIconWrapper}>
                        <Map color="#60a5fa" size={24} />
                    </div>
                    <h2 className={`${styles.sidebarTitle} ${isSidebarOpen ? styles.sidebarTitleOpen : styles.sidebarTitleClosed}`}>
                        Select Scenario
                    </h2>
                </div>
                <button className={styles.sidebarToggleBtn}>
                    <ChevronDown
                        size={20}
                        className={`${styles.toggleIcon} ${isSidebarOpen ? styles.rotate180_lg_rotate90 : styles.rotate0_lg_rotateMinus90}`}
                    />
                </button>
            </div>

            <div className={`${styles.sidebarContentWrapper} ${isSidebarOpen ? styles.sidebarContentOpen : styles.sidebarContentClosed}`}>
                <div className={styles.scenarioList}>
                    {phases.map((phase) => (
                        <button
                            key={phase.id}
                            onClick={() => setActivePhaseId(phase.id)}
                            className={`${styles.scenarioCard} ${activePhaseId === phase.id ? styles.scenarioCardActive : ''}`}
                        >
                            <div
                                className={styles.cardGlowLine}
                                style={{ background: phase.gradientVertical }}
                            />

                            <div className={styles.cardContent}>
                                <div className={styles.cardHeader}>
                                    <span className={`${styles.cardTitle} ${activePhaseId === phase.id ? styles.cardTitleActive : styles.cardTitleInactive}`}>
                                        {phase.name}
                                    </span>
                                    {activePhaseId === phase.id ? (
                                        <ChevronUp size={20} color="white" className={styles.toggleIcon} />
                                    ) : (
                                        <ChevronDown size={20} color="#64748b" className={styles.toggleIcon} />
                                    )}
                                </div>

                                <div className={`${styles.cardBody} ${activePhaseId === phase.id ? styles.cardBodyOpen : styles.cardBodyClosed}`}>
                                    <div className={styles.cardBodyInner}>
                                        <div className={styles.tagRow}>
                                            <span className={`${styles.tag} ${phase.hasDetour ? styles.tagChoicePossible : styles.tagChoiceNotPossible}`}>
                                                {phase.choice}
                                            </span>
                                            <span className={`${styles.tag} ${phase.hasDesire ? styles.tagIntentWith : styles.tagIntentWithout}`}>
                                                {phase.intention}
                                            </span>
                                        </div>
                                        <p className={`${styles.cardSummary} ${activePhaseId === phase.id ? styles.cardSummaryActive : styles.cardSummaryInactive}`}>
                                            {phase.summary}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ScenarioSidebar;
