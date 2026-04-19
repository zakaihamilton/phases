import React, { useEffect, useRef } from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

const Mandala = ({ cameraScale, activePath, visibleList, radiusLevels }) => {
  const canvasRef = useRef(null);
  const transitionsRef = useRef(new Map());

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const VIEW_SIZE = 2000;
    const CENTER = VIEW_SIZE / 2;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = VIEW_SIZE * dpr;
    canvas.height = VIEW_SIZE * dpr;
    ctx.scale(dpr, dpr);

    let startTime = performance.now();
    let lastTime = startTime;

    const draw = (currentTime) => {
      // Calculate delta time to ensure smooth zooming regardless of frame rate
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
      ctx.globalCompositeOperation = 'lighter';

      const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

      FLAT_DATA.forEach((data, index) => {
        const isVisible = visibleList.includes(index);
        const isFocused = index === focusedIndex;

        // Calculate the mathematical target size for this specific frame
        const rl = radiusLevels[index];
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;
        const targetRadius = 800 * dynamicScale * cameraScale;
        const targetOpacity = isVisible ? (data.opacity || 1) : 0;
        const targetFocus = isFocused ? 1 : 0;

        // --- LERP ENGINE: Smoothly animate Focus, Zoom (Radius), and Fades (Opacity) ---
        let tState = transitionsRef.current.get(index);
        if (!tState) {
          // Initialize state for the very first frame
          tState = {
            focusProgress: targetFocus,
            animatedRadius: targetRadius,
            animatedOpacity: targetOpacity
          };
          transitionsRef.current.set(index, tState);
        }

        // The multiplier (6) dictates the speed of the transition. 
        // This math creates a beautiful exponential ease-out curve, mimicking your CSS.
        tState.focusProgress += (targetFocus - tState.focusProgress) * 6 * dt;
        tState.animatedRadius += (targetRadius - tState.animatedRadius) * 6 * dt;
        tState.animatedOpacity += (targetOpacity - tState.animatedOpacity) * 6 * dt;

        const focusP = tState.focusProgress;
        const currentRadius = tState.animatedRadius;
        let baseOpacity = tState.animatedOpacity;

        // Optimization: If the ring is completely invisible and shrunk, don't draw it
        if (baseOpacity < 0.001 && currentRadius < 1) return;

        // Apply the continuous pulsing effect on top of the animated base opacity
        if (data.pulse && baseOpacity > 0.01) {
          baseOpacity = baseOpacity * (0.8 + Math.sin(elapsedTime * 2) * 0.2);
        }

        const cColor = data.color;
        ctx.lineCap = 'round';

        const drawRing = (radius, width, dashArray, rotationSpeed, glowAmount, alpha) => {
          if (alpha <= 0.01 || radius <= 0) return;
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha)); // Clamp alpha between 0 and 1

          if (rotationSpeed) {
            ctx.translate(CENTER, CENTER);
            ctx.rotate(elapsedTime * rotationSpeed);
            ctx.translate(-CENTER, -CENTER);
          }

          ctx.beginPath();
          ctx.arc(CENTER, CENTER, radius, 0, Math.PI * 2);
          ctx.strokeStyle = cColor;
          ctx.lineWidth = width;

          if (dashArray) ctx.setLineDash(dashArray);

          if (glowAmount > 0) {
            ctx.shadowBlur = glowAmount;
            ctx.shadowColor = cColor;
          }

          ctx.stroke();
          ctx.restore();
        };

        // --- DRAWING THE LAYERS WITH LERPED RADIUS ---

        // 1. Outer Tracking Orbit 
        drawRing(currentRadius * 1.05, 2, [4, 40], -0.15, 0, baseOpacity * 0.4 * focusP);

        // 2. Inner Tracking Orbit 
        drawRing(currentRadius * 0.95, 3, [60, 20, 10, 20], 0.3, 0, baseOpacity * 0.8 * focusP);

        // 3. The Core Rings 
        const currentThickness = 10 - (4 * focusP);
        const currentGlow = 15 + (15 * focusP);

        // Solid Default Ring (fades out as focusP goes to 1)
        drawRing(currentRadius, currentThickness, null, 0, currentGlow, baseOpacity * (1 - focusP));

        // Spinning Dashed Ring (fades in as focusP goes to 1)
        drawRing(currentRadius, currentThickness, [180, 60, 20, 60], 0.1, currentGlow, baseOpacity * focusP);

        // 4. Background Fill
        if (data.bg) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, baseOpacity));
          ctx.beginPath();
          ctx.arc(CENTER, CENTER, Math.max(0, currentRadius), 0, Math.PI * 2);
          ctx.fillStyle = data.bg;
          ctx.fill();
          ctx.restore();
        }
      });

      animationFrameId = requestAnimationFrame(draw);
    };

    animationFrameId = requestAnimationFrame(draw);

    return () => cancelAnimationFrame(animationFrameId);
  }, [cameraScale, activePath, visibleList, radiusLevels]);

  return (
    <div className={styles.cameraWrapper}>
      <canvas
        ref={canvasRef}
        className={styles.canvasElement}
        style={{
          width: '2000px',
          height: '2000px',
        }}
      />
    </div>
  );
};

export default React.memo(Mandala);