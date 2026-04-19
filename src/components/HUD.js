import React from 'react';
import styles from './HUD.module.css';
import { MAPPED_DATA } from '../app/data.js';

export default function HUD({ activeSubData, activePath }) {
  return (
    <div className={styles.hudOverlay}>
      <p className={styles.hudPhaseName}>{activeSubData.phaseName}</p>
      <h1 className={styles.hudTitle} style={{ color: activeSubData.color }}>
        {activeSubData.id}
        {activeSubData.name}
      </h1>
      <div className={styles.progressContainer}>
        {MAPPED_DATA[activePath.p].sub.map((_, idx) => (
          <div
            key={idx}
            className={`${styles.progressDot} ${idx === activePath.s ? styles.progressDotActive : styles.progressDotInactive}`}
          />
        ))}
      </div>
    </div>
  );
}
