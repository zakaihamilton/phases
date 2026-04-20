import React from 'react';
import styles from './ScenarioSidebar.module.css';

const ScenarioSidebar = ({ 
    phases, 
    activePhaseId, 
    setActivePhaseId 
}) => {
    return (
        <div className={styles.timelineContainer}>
            {phases.map((phase) => (
                <button
                    key={phase.id}
                    onClick={() => setActivePhaseId(phase.id)}
                    className={`${styles.timelineDot} ${activePhaseId === phase.id ? styles.timelineDotActive : ''}`}
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
            ))}
        </div>
    );
};

export default ScenarioSidebar;
