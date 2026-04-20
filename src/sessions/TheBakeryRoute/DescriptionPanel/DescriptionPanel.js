import React from 'react';
import { Route, ChevronDown, Info } from 'lucide-react';
import styles from './DescriptionPanel.module.css';

const DescriptionPanel = ({
    phase,
    isSidebarOpen,
    isDescriptionOpen,
    setIsDescriptionOpen,
    isHorizontallyCollapsed
}) => {
    return (
        <div className={`${styles.descPane} ${isSidebarOpen ? styles.descPaneSidebarOpen : (isDescriptionOpen ? styles.descPaneDescOpen : styles.descPaneDescClosed)
            }`}>
            <div className={styles.descTopGlow} style={{ background: phase.gradientHorizontal }} />

            <div
                className={`${styles.descHeader} ${isHorizontallyCollapsed ? styles.descHeaderCollapsed : styles.descHeaderNormal}`}
                onClick={() => setIsDescriptionOpen(!isDescriptionOpen)}
            >
                <div className={`${styles.descHeaderLeft} ${isHorizontallyCollapsed ? styles.descHeaderLeftCollapsed : ''}`}>
                    <div className={styles.descIconWrap} style={{ background: phase.gradientVertical }}>
                        <Route color="white" size={24} />
                    </div>
                    <h3 className={`${styles.descTitle} ${isHorizontallyCollapsed ? styles.descTitleCollapsed : styles.descTitleNormal}`}>
                        {isHorizontallyCollapsed ? 'Description' : phase.name}
                    </h3>
                </div>
                <button className={styles.descToggleBtn}>
                    <ChevronDown
                        size={24}
                        className={`${styles.toggleIcon} ${isHorizontallyCollapsed ? styles.rotate90Lg : (isDescriptionOpen ? styles.rotate180 : styles.rotate0)}`}
                    />
                </button>
            </div>

            <div className={`${styles.descContentWrap} ${isDescriptionOpen ? styles.descContentOpen : (!isSidebarOpen ? styles.descContentClosedHalf : styles.descContentClosedFull)
                }`}>
                <div className={`${styles.descInner} ${isHorizontallyCollapsed ? styles.descInnerCollapsed : ''}`}>
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
                        Condition: {phase.choice} & {phase.intention}
                    </p>

                    <p className={styles.descText}>
                        {phase.description}
                    </p>

                    <div className={styles.takeawayBox}>
                        <div className={styles.takeawayHeader}>
                            <Info size={20} color="#60a5fa" />
                            <span className={styles.takeawayTitle}>Spiritual Takeaway</span>
                        </div>
                        <p className={styles.takeawayText}>
                            {phase.id === 1 && "True reception requires desire. Since there is neither choice nor craving here, the experience means nothing to the person. It is not considered a true vessel."}
                            {phase.id === 2 && "Even with the freedom to choose, without an inner craving, simply experiencing the pleasure holds no real spiritual weight. The vessel remains empty of intent."}
                            {phase.id === 3 && "Though the situation is forced upon them, the presence of inner craving makes this an active, rather than passive, experience. The desire awakens."}
                            {phase.id === 4 && "This represents the 'True Vessel' (Malchut). They had the freedom to walk away, but deliberately used their agency to seek out and engage with the pleasure. Choice and Desire are united."}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DescriptionPanel;
