import React from 'react';
import { Info, ChevronDown } from 'lucide-react';
import styles from './DescriptionPanel.module.css';

const DescriptionPanel = ({
    phase,
    phases,
    isDescriptionOpen,
    setIsDescriptionOpen
}) => {
    const currentIndex = phases.findIndex(p => p.id === phase.id);
    const prevPhase = phases[currentIndex - 1];
    const nextPhase = phases[currentIndex + 1];

    return (
        <div className={`${styles.descPane} ${!isDescriptionOpen ? styles.descPaneCollapsed : ''}`}>
            <div className={styles.descTopGlow} style={{ background: phase.gradientHorizontal }} />

            <div className={styles.descHeader}>
                <div key={phase.id} className={styles.descHeaderLeft}>
                    <div className={styles.phaseBadge} style={{ background: phase.gradientVertical }}>
                        PHASE 0{phase.id}
                    </div>
                    <h3 className={styles.descTitle}>
                        {phase.name}
                    </h3>
                </div>
                <button
                    onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
                    className={styles.collapseBtn}
                    title={isDescriptionOpen ? "Minimize" : "Expand"}
                >
                    {isDescriptionOpen ? <ChevronDown size={24} color="white" /> : <Info size={24} color="white" />}
                </button>
            </div>

            <div
                className={styles.descContentWrap}
                style={{
                    maxHeight: isDescriptionOpen ? '1000px' : '0px',
                    opacity: isDescriptionOpen ? 1 : 0,
                    transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
            >
                <div key={phase.id} className={styles.descInner}>
                    <p
                        key={phase.id}
                        className={styles.descCondition}
                        style={{
                            backgroundImage: phase.gradientHorizontal,
                            WebkitBackgroundClip: 'text',
                            backgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            color: 'transparent'
                        }}
                    >
                        {phase.choice} • {phase.intention}
                    </p>

                    <p className={styles.descText}>
                        {phase.description}
                    </p>

                    <div className={styles.takeawayBox}>
                        <div className={styles.takeawayHeader}>
                            <Info size={18} color="#60a5fa" />
                            <span className={styles.takeawayTitle}>Spiritual Insight</span>
                        </div>
                        <p className={styles.takeawayText}>
                            {phase.id === 1 && "True reception requires desire. Since there is neither choice nor craving here, the experience means nothing to the person. It is not considered a true vessel."}
                            {phase.id === 2 && "Even with the freedom to choose, without an inner craving, simply experiencing the pleasure holds no real spiritual weight. The vessel remains empty of intent."}
                            {phase.id === 3 && "Though the situation is forced upon them, the presence of inner craving makes this an active, rather than passive, experience. The desire awakens."}
                            {phase.id === 4 && "This represents the 'True Vessel' (Kingdom). They had the freedom to walk away, but deliberately used their agency to seek out and engage with the pleasure. Choice and Desire are united."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DescriptionPanel;
