import React, { useEffect, useRef } from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

const Mandala = ({ cameraScale, activePath, visibleList, radiusLevels }) => {
  const canvasRef = useRef(null);

  // Memory stores
  const transitionsRef = useRef(new Map());
  const gradientCacheRef = useRef(new Map());

  // New Trackers for Cinematic Transitions
  const prevPathRef = useRef(`${activePath.p}-${activePath.s}`);
  const globalSpinVelocityRef = useRef(0);
  const globalSpinOffsetRef = useRef(0);

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
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
      ctx.globalCompositeOperation = 'lighter';

      // --- 1. GLOBAL ROTATIONAL BURST ---
      const currentPathStr = `${activePath.p}-${activePath.s}`;
      if (prevPathRef.current !== currentPathStr) {
        // Inject a sudden burst of speed when phase changes
        globalSpinVelocityRef.current += 3.0;
        prevPathRef.current = currentPathStr;
      }

      // Apply friction to slow the burst down smoothly
      globalSpinVelocityRef.current -= globalSpinVelocityRef.current * 2.5 * dt;
      globalSpinOffsetRef.current += globalSpinVelocityRef.current * dt;

      const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

      FLAT_DATA.forEach((data, index) => {
        if (!visibleList.includes(index)) return;

        const isFocused = index === focusedIndex;
        const rl = radiusLevels[index];
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;

        // Push unfocused rings slightly further back for depth
        const depthScale = isFocused ? 1 : 0.95;
        const targetRadius = 800 * dynamicScale * cameraScale * depthScale;

        // Dim unfocused rings significantly to make transitions pop
        const baseTargetOpacity = data.opacity || 1;
        const targetOpacity = isFocused ? baseTargetOpacity : baseTargetOpacity * 0.4;
        const targetFocus = isFocused ? 1 : 0;

        let tState = transitionsRef.current.get(index);
        if (!tState) {
          tState = {
            focusProgress: targetFocus,
            animatedRadius: targetRadius,
            radiusVelocity: 0, // Used for spring physics
            animatedOpacity: targetOpacity,
            ripples: []
          };
          transitionsRef.current.set(index, tState);
        }

        // --- 2. SPRING PHYSICS LERPING ---
        // Instead of linear sliding, we use stiffness and damping to make the radius "bounce" into place
        const stiffness = 120; // Higher = faster snap
        const damping = 12;    // Higher = less bounciness

        const springForce = (targetRadius - tState.animatedRadius) * stiffness;
        tState.radiusVelocity += (springForce - (tState.radiusVelocity * damping)) * dt;
        tState.animatedRadius += tState.radiusVelocity * dt;

        // Smooth fade for opacity and focus
        tState.focusProgress += (targetFocus - tState.focusProgress) * 8 * dt;
        tState.animatedOpacity += (targetOpacity - tState.animatedOpacity) * 8 * dt;

        const focusP = tState.focusProgress;
        const currentRadius = Math.max(0, tState.animatedRadius); // Prevent negative radius bounds
        let baseOpacity = tState.animatedOpacity;

        if (baseOpacity < 0.001 && currentRadius < 1) return;

        if (data.pulse && baseOpacity > 0.01) {
          baseOpacity = baseOpacity * (0.8 + Math.sin(elapsedTime * 2) * 0.2);
        }

        const cColor = data.color;
        ctx.lineCap = 'round';

        const getCometGradient = (radius) => {
          const cacheKey = `${Math.round(radius / 10) * 10}-${cColor}`;
          let grad = gradientCacheRef.current.get(cacheKey);
          if (!grad) {
            grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
            grad.addColorStop(0, cColor);
            grad.addColorStop(0.5, 'transparent');
            grad.addColorStop(1, cColor);
            gradientCacheRef.current.set(cacheKey, grad);
          }
          return grad;
        };

        const drawRing = (radius, width, dashArray, rotationSpeed, glowAmount, alpha, useGradient = false) => {
          if (alpha <= 0.01 || radius <= 0) return;

          ctx.save();
          ctx.translate(CENTER, CENTER);

          // Apply individual spin + global momentum burst
          if (rotationSpeed) {
            ctx.rotate((elapsedTime * rotationSpeed) + (globalSpinOffsetRef.current * Math.sign(rotationSpeed)));
          } else {
            // Even non-spinning rings slightly drift with the momentum burst
            ctx.rotate(globalSpinOffsetRef.current * 0.2);
          }

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);
          ctx.strokeStyle = useGradient ? getCometGradient(radius) : cColor;

          if (dashArray) ctx.setLineDash(dashArray);

          if (glowAmount > 0) {
            ctx.globalAlpha = Math.max(0, alpha * 0.25);
            ctx.lineWidth = width + glowAmount;
            ctx.stroke();
          }

          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));
          ctx.lineWidth = width;
          ctx.stroke();
          ctx.restore();
        };

        const drawNodes = (radius, count, rotationSpeed, alpha) => {
          if (alpha <= 0.01 || radius <= 0) return;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(CENTER, CENTER);

          // Apply spin + momentum burst
          ctx.rotate((elapsedTime * rotationSpeed) + (globalSpinOffsetRef.current * Math.sign(rotationSpeed)));

          ctx.fillStyle = cColor;

          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = alpha;
          }
          ctx.restore();
        };

        // --- DRAW LAYERS ---

        // Shockwaves
        if (isFocused && Math.random() < 0.03) {
          tState.ripples.push({ spread: 0, alpha: 1 });
        }

        for (let i = tState.ripples.length - 1; i >= 0; i--) {
          let ripple = tState.ripples[i];
          ripple.spread += 100 * dt;
          ripple.alpha -= 0.8 * dt;

          if (ripple.alpha <= 0) {
            tState.ripples.splice(i, 1);
          } else {
            drawRing(currentRadius + ripple.spread, 1, null, 0, 10, baseOpacity * ripple.alpha * 0.5);
          }
        }

        // Orbits
        if (focusP > 0.01) {
          drawRing(currentRadius * 1.05, 1, [4, 60], -0.15, 5, baseOpacity * 0.4 * focusP);
          drawNodes(currentRadius * 1.05, 3, -0.15, baseOpacity * 0.8 * focusP);

          drawRing(currentRadius * 0.95, 2, [40, 20, 5, 20], 0.3, 5, baseOpacity * 0.8 * focusP);
          drawNodes(currentRadius * 0.95, 6, 0.3, baseOpacity * 0.8 * focusP);
        }

        // Core
        const currentThickness = 10 - (4 * focusP);
        const currentGlow = 15 + (15 * focusP);

        drawRing(currentRadius, currentThickness, null, 0, currentGlow, baseOpacity * (1 - focusP));
        drawRing(currentRadius, currentThickness, [180, 60, 20, 60], 0.1, currentGlow, baseOpacity * focusP, true);

        // Fill
        if (data.bg) {
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, baseOpacity));
          ctx.beginPath();
          ctx.arc(CENTER, CENTER, currentRadius, 0, Math.PI * 2);
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