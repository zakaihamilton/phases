import React from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

const Mandala = ({ cameraScale, activePath, visibleList, radiusLevels }) => {
  const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

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
        const isFocused = index === focusedIndex;
        const isPreviousPhase = data.pIdx < activePath.p;
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;

        // Standardize Border - use a constant width and use spread shadow for "thick" look
        // This avoids layout-heavy border-width transitions which cause flickers.
        const cBorderWidth = isFocused ? 12 : 10;
        const cBorderColor = data.color;
        
        // Construct Glow with stable string structure for transitions
        // 3 segments: [Outer Glow], [Inset Effect], [Condensed Spread]
        const baseGlowSize = 40 * (data.glowIntensity || 1);
        const glowColor = data.color;
        const color0 = glowColor.startsWith('#') ? `${glowColor}00` : 'rgba(255, 255, 255, 0)';
        
        let segGlow = `0 0 0px ${color0}`;
        let segInset = `inset 0 0 0px 0px ${color0}`;
        let segSpread = `0 0 0 0px ${color0}`;
        
        if (isVisible) {
          if (isFocused) {
            segGlow = `0 0 ${baseGlowSize + 10}px ${glowColor}`;
            segInset = `inset 15px 0 25px -5px ${glowColor}`;
          } else if (isPreviousPhase) {
            segSpread = `0 0 0 20px ${glowColor}`;
            if (data.sIdx === 0) segGlow = `0 0 40px ${glowColor}`;
          } else {
            segGlow = `0 0 ${baseGlowSize}px ${glowColor}`;
          }
        }

        const boxShadow = `${segGlow}, ${segInset}, ${segSpread}`;

        return (
          <div
            key={data.id}
            className={styles.ringWrapper}
            style={{
              opacity: isVisible ? (data.opacity || 1) : 0,
              transform: `translate(-50%, -50%) scale(${dynamicScale})`,
              zIndex: index,
            }}
          >
            <div
              className={`${styles.ringInner} ${isFocused ? styles.focused : ''} ${data.pulse && isVisible ? styles.pulse : ''}`}
              style={{
                borderWidth: `${cBorderWidth}px`,
                borderStyle: 'solid',
                borderColor: cBorderColor,
                boxShadow: boxShadow,
                backgroundColor: isVisible ? (data.bg || color0) : color0,
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Mandala);
