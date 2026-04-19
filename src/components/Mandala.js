import React from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

export default function Mandala({ cameraScale, activePath, visibleList, radiusLevels }) {
  return (
    <div
      className={styles.camera}
      style={{
        transform: `translate(-50%, -50%) scale(${cameraScale})`
      }}
    >
      {FLAT_DATA.map((data, index) => {
        const rl = radiusLevels[index];
        const isVisible = visibleList.includes(index);
        const isFocused = index === FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);
        const isPreviousPhase = data.pIdx < activePath.p;
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;

        let borderStyle = data.borderCSS;
        if (isPreviousPhase && isVisible) {
          const thickness = 60 - (data.sIdx * 10);
          borderStyle = `${thickness}px solid ${data.color}`;
        }

        return (
          <div
            key={data.id}
            className={styles.ringWrapper}
            style={{
              opacity: isVisible ? 1 : 0,
              transform: `translate(-50%, -50%) scale(${dynamicScale})`,
              zIndex: index,
            }}
          >
            <div
              className={`${styles.ringInner} ${data.pulse && isVisible ? styles.pulse : ''}`}
              style={{
                ...data.extraStyle,
                border: borderStyle,
                boxShadow: isVisible ? (isFocused ? `${data.glow}, inset 15px 0 25px -5px ${data.color}` : (isPreviousPhase ? (data.sIdx === 0 ? `0 0 40px ${data.color}` : 'none') : data.glow)) : 'none',
                backgroundColor: isVisible ? (data.bg || 'transparent') : 'transparent',
                animation: isFocused ? `${styles.spin} 15s linear infinite` : 'none',
              }}
            />
          </div>
        );
      })}
    </div>
  );
}
