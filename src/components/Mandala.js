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

        // Construct Border Components
        const baseThickness = isFocused ? 12 : 10;
        let cBorderWidth = baseThickness;
        let cBorderStyle = data.borderType || 'solid';
        let cBorderColor = data.color;

        if (isPreviousPhase && isVisible) {
          cBorderWidth = Math.max(10, 60 - (data.sIdx * 10));
          cBorderStyle = 'solid';
        }
        
        // Construct Glow
        const baseGlowSize = 40 * (data.glowIntensity || 1);
        const glowColor = data.color;
        let boxShadow = 'none';
        
        if (isVisible) {
          if (isFocused) {
            boxShadow = `0 0 ${baseGlowSize + 10}px ${glowColor}, inset 15px 0 25px -5px ${glowColor}`;
          } else if (isPreviousPhase) {
            if (data.sIdx === 0) {
              boxShadow = `0 0 40px ${glowColor}, inset 0 0 0 0 transparent`;
            } else {
              boxShadow = `0 0 0px transparent, inset 0 0 0 0 transparent`;
            }
          } else {
            boxShadow = `0 0 ${baseGlowSize}px ${glowColor}, inset 0 0 0 0 transparent`;
          }
        } else {
          boxShadow = `0 0 0px transparent, inset 0 0 0 0 transparent`;
        }

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
                borderStyle: cBorderStyle,
                borderColor: cBorderColor,
                boxShadow: boxShadow,
                backgroundColor: isVisible ? (data.bg || 'transparent') : 'transparent',
              }}
            />
          </div>
        );
      })}
    </div>
  );
};

export default React.memo(Mandala);
