import React, { useMemo } from 'react';
import styles from './HUD.module.css';
import { MAPPED_DATA } from '../app/data.js';

const HUD = ({ activeSubData, activePath }) => {
  const phaseIndex = activePath.p;
  const subPhaseIndex = activePath.s;
  const currentPhase = MAPPED_DATA[phaseIndex];

  const phaseLabel = useMemo(() => activeSubData.phaseNumber, [activeSubData.phaseNumber]);
  const phaseDescription = activeSubData.phaseTitle;

  // Unique key to force re-render animations on phase change
  const transitionKey = `${phaseIndex}-${subPhaseIndex}`;

  return (
    <div className={styles.hudOverlay}>
      <div
        className={styles.hudGlow}
        style={{
          backgroundColor: activeSubData.color
        }}
      />

      <div className={styles.hudCard}>
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
      </div>
    </div>
  );
};

export default React.memo(HUD);