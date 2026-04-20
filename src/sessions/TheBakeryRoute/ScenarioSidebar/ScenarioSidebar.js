import React from 'react';
import styles from './ScenarioSidebar.module.css';

const ScenarioSidebar = ({ 
    phases, 
    activePhaseId, 
    setActivePhaseId 
}) => {
    return (
        <div className={styles.timelineContainer}>
            <div className={styles.progressLine} />
            {phases.map((phase, index) => (
                <div key={phase.id} className={styles.dotWrapper}>
                    <button
                        onClick={() => setActivePhaseId(phase.id)}
                        className={`${styles.timelineDot} ${activePhaseId === phase.id ? styles.timelineDotActive : ''} ${activePhaseId > phase.id ? styles.timelineDotCompleted : ''}`}
                        title={phase.name}
                    >
                        {activePhaseId === phase.id && (
                            <div 
                                className={styles.dotGlow} 
                                style={{ background: phase.gradientHorizontal }} 
                            />
                        )}
                        <span className={styles.dotIndex}>{phase.id}</span>
                    </button>
                    <span className={`${styles.dotLabel} ${activePhaseId === phase.id ? styles.dotLabelActive : ''}`}>
                        {phase.name}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default ScenarioSidebar;
