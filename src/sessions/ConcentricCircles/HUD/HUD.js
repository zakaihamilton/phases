import React, { useMemo, useState, useEffect } from 'react';
import styles from './HUD.module.css';
import { MAPPED_DATA } from '../Data.js';

const HUD = ({ activeSubData, activePath }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const phaseIndex = activePath.p;
  const subPhaseIndex = activePath.s;
  const currentPhase = MAPPED_DATA[phaseIndex];

  const phaseLabel = useMemo(() => activeSubData.phaseNumber, [activeSubData.phaseNumber]);
  const phaseDescription = activeSubData.phaseTitle;

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter') {
        setIsCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Unique key to force re-render animations on phase change
  const transitionKey = `${phaseIndex}-${subPhaseIndex}`;

  const CollapseIcon = ({ isCollapsed }) => (
    <svg
      className={`${styles.collapseIcon} ${isCollapsed ? styles.rotated : ''}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="3"
    >
      <path d="M19 9l-7 7-7-7" />
    </svg>
  );

  return (
    <div className={`${styles.hudOverlay} ${isCollapsed ? styles.hudOverlayCollapsed : ''}`}>
      <div
        className={styles.hudGlow}
        style={{
          backgroundColor: activeSubData.color
        }}
      />

      <div
        className={`${styles.hudCard} ${isCollapsed ? styles.hudCardCollapsed : ''}`}
        onClick={() => isCollapsed && setIsCollapsed(false)}
      >
        <button
          className={styles.collapseBtn}
          onClick={(e) => {
            e.stopPropagation();
            setIsCollapsed(!isCollapsed);
          }}
          title={isCollapsed ? "Expand HUD" : "Collapse HUD"}
        >
          <CollapseIcon isCollapsed={isCollapsed} />
        </button>

        {!isCollapsed && (
          <>
            {/* Animated Header */}
            <header key={`header-${transitionKey}`} className={`${styles.hudHeader} ${styles.animateSlideUp}`}>
              <div className={styles.hudPhaseBadge}>{phaseLabel}</div>
              <div className={styles.hudPhaseName}>{phaseDescription}</div>
            </header>

            {/* Animated Title Area */}
            <div key={`title-${transitionKey}`} className={`${styles.hudTitleContainer} ${styles.animateSlideUpDelay}`}>
              <h1 className={styles.hudTitle} style={{ color: activeSubData.color }}>
                {activeSubData.name}
              </h1>
              <div className={styles.hudSubInfo}>
                <div className={styles.hudSubTitle}>
                  <span className={styles.hudSubLabel}>LEVEL</span> {activeSubData.id}
                </div>
              </div>
            </div>

            {/* Progress stays static so dots can animate their width smoothly */}
            <footer className={styles.progressContainer}>
              {currentPhase.sub.map((_, idx) => (
                <div
                  key={idx}
                  className={`${styles.progressDot} ${idx === subPhaseIndex
                    ? styles.progressDotActive
                    : styles.progressDotInactive
                    }`}
                  style={idx === subPhaseIndex ? {
                    backgroundColor: activeSubData.color,
                    boxShadow: `0 0 20px ${activeSubData.color}cc`
                  } : {}}
                />
              ))}
            </footer>
          </>
        )}

        {isCollapsed && (
          <div className={styles.collapsedInfo}>
            <div className={styles.hudLevelSmall}>{activeSubData.id}</div>
            <div className={styles.hudLevelSmall}>{activeSubData.name}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default React.memo(HUD);