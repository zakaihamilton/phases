import React, { useEffect, useRef } from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

const Mandala = ({ cameraScale, activePath, visibleList, radiusLevels }) => {
  const canvasRef = useRef(null);

  // Memory stores
  const transitionsRef = useRef(new Map());
  const gradientCacheRef = useRef(new Map()); // Caches gradients to prevent GC thrashing

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
      // Cap delta time to prevent massive jumps if the tab is inactive
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
      ctx.globalCompositeOperation = 'lighter';

      const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

      FLAT_DATA.forEach((data, index) => {
        if (!visibleList.includes(index)) return;

        const isFocused = index === focusedIndex;
        const rl = radiusLevels[index];
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;
        const targetRadius = 800 * dynamicScale * cameraScale;
        const targetOpacity = data.opacity || 1;
        const targetFocus = isFocused ? 1 : 0;

        let tState = transitionsRef.current.get(index);
        if (!tState) {
          tState = {
            focusProgress: targetFocus,
            animatedRadius: targetRadius,
            animatedOpacity: targetOpacity,
            ripples: []
          };
          transitionsRef.current.set(index, tState);
        }

        tState.focusProgress += (targetFocus - tState.focusProgress) * 6 * dt;
        tState.animatedRadius += (targetRadius - tState.animatedRadius) * 6 * dt;
        tState.animatedOpacity += (targetOpacity - tState.animatedOpacity) * 6 * dt;

        const focusP = tState.focusProgress;
        const currentRadius = tState.animatedRadius;
        let baseOpacity = tState.animatedOpacity;

        // Strict early exit to save render cycles
        if (baseOpacity < 0.001 && currentRadius < 1) return;

        if (data.pulse && baseOpacity > 0.01) {
          baseOpacity = baseOpacity * (0.8 + Math.sin(elapsedTime * 2) * 0.2);
        }

        const cColor = data.color;
        ctx.lineCap = 'round';

        // --- OPTIMIZATION 1: Gradient Caching ---
        const getCometGradient = (radius) => {
          // Round radius to nearest 10px to reuse gradients and avoid memory leaks
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

        // Add a mouse move listener to your useEffect to capture parallax offset
        let mouseX = 0, mouseY = 0;
        window.addEventListener('mousemove', (e) => {
          mouseX = (e.clientX / window.innerWidth - 0.5) * 20; // 20px max offset
          mouseY = (e.clientY / window.innerHeight - 0.5) * 20;
        });

        const drawRing = (radius, width, dashArray, rotationSpeed, glowAmount, alpha, useGradient = false) => {
          if (alpha <= 0.01 || radius <= 0) return;

          // Draw 3 times for Chromatic Aberration
          const colors = ['#ff0000', '#00ff00', '#0000ff']; // R, G, B
          const offsets = [-1, 0, 1]; // Slight pixel shift

          offsets.forEach((offset, i) => {
            ctx.save();
            ctx.globalAlpha = alpha * 0.5; // Lower alpha for each color pass

            // Apply Parallax + Chromatic Offset
            ctx.translate(CENTER + mouseX + offset, CENTER + mouseY + offset);

            if (rotationSpeed) {
              ctx.rotate(elapsedTime * rotationSpeed);
            }

            ctx.beginPath();
            ctx.arc(0, 0, radius, 0, Math.PI * 2);

            // Use the color pass for the stroke
            ctx.strokeStyle = colors[i];
            ctx.lineWidth = width;

            if (dashArray) ctx.setLineDash(dashArray);
            ctx.stroke();
            ctx.restore();
          });
        };

        const drawNodes = (radius, count, rotationSpeed, alpha) => {
          if (alpha <= 0.01 || radius <= 0) return;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(CENTER, CENTER);
          ctx.rotate(elapsedTime * rotationSpeed);

          ctx.fillStyle = cColor;

          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 4, 0, Math.PI * 2);
            ctx.fill();

            // Fast Glow for nodes
            ctx.globalAlpha = alpha * 0.3;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 12, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalAlpha = alpha;
          }
          ctx.restore();
        };

        // --- OPTIMIZATION 3: In-Place Array Mutation for GC ---
        if (isFocused && Math.random() < 0.03) {
          tState.ripples.push({ spread: 0, alpha: 1 });
        }

        // Loop backwards to safely remove items without using .filter()
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

        // Draw Orbits
        if (focusP > 0.01) {
          drawRing(currentRadius * 1.05, 1, [4, 60], -0.15, 5, baseOpacity * 0.4 * focusP);
          drawNodes(currentRadius * 1.05, 3, -0.15, baseOpacity * 0.8 * focusP);

          drawRing(currentRadius * 0.95, 2, [40, 20, 5, 20], 0.3, 5, baseOpacity * 0.8 * focusP);
          drawNodes(currentRadius * 0.95, 6, 0.3, baseOpacity * 0.8 * focusP);
        }

        // Draw Core
        const currentThickness = 10 - (4 * focusP);
        const currentGlow = 15 + (15 * focusP);

        drawRing(currentRadius, currentThickness, null, 0, currentGlow, baseOpacity * (1 - focusP));
        drawRing(currentRadius, currentThickness, [180, 60, 20, 60], 0.1, currentGlow, baseOpacity * focusP, true);

        // Draw Background Fill
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