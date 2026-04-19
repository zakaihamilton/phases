import React, { useMemo } from 'react';
import styles from './HUD.module.css';
import { MAPPED_DATA } from '../app/data.js';

const HUD = ({ activeSubData, activePath }) => {
  const phaseIndex = activePath.p;
  const subPhaseIndex = activePath.s;
  const currentPhase = MAPPED_DATA[phaseIndex];
  
  const phaseLabel = useMemo(() => `PHASE ${activeSubData.phaseNumber}`, [activeSubData.phaseNumber]);
  const phaseDescription = activeSubData.phaseTitle;

  return (
    <div className={styles.hudOverlay}>
      <div 
        className={styles.hudGlow} 
        style={{ 
          background: `radial-gradient(circle, ${activeSubData.color} 0%, transparent 70%)` 
        }} 
      />
      
      <div className={styles.hudCard}>
        <header className={styles.hudHeader}>
          <div className={styles.hudPhaseBadge}>{phaseLabel}</div>
          <div className={styles.hudPhaseName}>{phaseDescription}</div>
        </header>

        <div className={styles.hudTitleContainer}>
          <h1 className={styles.hudTitle} style={{ color: activeSubData.color }}>
            {activeSubData.name}
          </h1>
          <div className={styles.hudSubInfo}>
            <span className={styles.hudSubTitle}>LEVEL {activeSubData.id}</span>
            <div className={styles.hudDivider} />
            <span className={styles.hudProgressLabel}>
              {subPhaseIndex + 1} / {currentPhase.sub.length}
            </span>
          </div>
        </div>

        <footer className={styles.progressContainer}>
          {currentPhase.sub.map((_, idx) => (
            <div
              key={idx}
              className={`${styles.progressDot} ${
                idx === subPhaseIndex 
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
