import React from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

const Mandala = ({ cameraScale, activePath, visibleList, radiusLevels }) => {
  const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

  // SVG viewBox size. This gives us a massive, crisp canvas to work on.
  const VIEW_SIZE = 2000;
  const CENTER = VIEW_SIZE / 2;

  return (
    <div
      className={styles.camera}
      style={{
        transform: `translate(-50%, -50%) scale(${cameraScale})`
      }}
    >
      <svg
        width={VIEW_SIZE}
        height={VIEW_SIZE}
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className={styles.svgCanvas}
      >
        {/* Define our SVG Glow Filters once */}
        <defs>
          <filter id="glow-focused" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="15" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="glow-default" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {FLAT_DATA.map((data, index) => {
          const rl = radiusLevels[index];
          const isVisible = visibleList.includes(index);
          const isFocused = index === focusedIndex;

          // Base radius of the circle
          const baseRadius = 800;
          // Scale it down based on your dynamic scale logic
          const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;
          const currentRadius = baseRadius * dynamicScale;

          const cColor = data.color;
          const cOpacity = isVisible ? (data.opacity || 1) : 0;

          return (
            <g
              key={data.id}
              className={`${styles.ringGroup} ${isFocused ? styles.focused : ''} ${data.pulse && isVisible ? styles.pulse : ''}`}
              style={{
                opacity: cOpacity,
                // We use transform-origin in CSS to keep the spin centered
              }}
            >
              {/* The Circle */}
              <circle
                cx={CENTER}
                cy={CENTER}
                r={currentRadius}
                fill={isVisible && data.bg ? data.bg : 'transparent'}
                stroke={cColor}
                strokeWidth={isFocused ? 12 : 10}
                filter={isFocused ? "url(#glow-focused)" : "url(#glow-default)"}
                className={styles.svgCircle}
              />
            </g>
          );
        })}
      </svg>
    </div>
  );
};

export default React.memo(Mandala);