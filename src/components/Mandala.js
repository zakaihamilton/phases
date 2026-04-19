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
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
      ctx.globalCompositeOperation = 'lighter'; // Keeps the beautiful additive light blending

      const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

      FLAT_DATA.forEach((data, index) => {
        const isVisible = visibleList.includes(index);
        const isFocused = index === focusedIndex;

        const rl = radiusLevels[index];
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;
        const targetRadius = 800 * dynamicScale * cameraScale;
        const targetOpacity = isVisible ? (data.opacity || 1) : 0;
        const targetFocus = isFocused ? 1 : 0;

        let tState = transitionsRef.current.get(index);
        if (!tState) {
          tState = {
            focusProgress: targetFocus,
            animatedRadius: targetRadius,
            animatedOpacity: targetOpacity,
            ripples: [] // Initialize our new shockwave particle system
          };
          transitionsRef.current.set(index, tState);
        }

        tState.focusProgress += (targetFocus - tState.focusProgress) * 6 * dt;
        tState.animatedRadius += (targetRadius - tState.animatedRadius) * 6 * dt;
        tState.animatedOpacity += (targetOpacity - tState.animatedOpacity) * 6 * dt;

        const focusP = tState.focusProgress;
        const currentRadius = tState.animatedRadius;
        let baseOpacity = tState.animatedOpacity;

        if (baseOpacity < 0.001 && currentRadius < 1) return;

        if (data.pulse && baseOpacity > 0.01) {
          baseOpacity = baseOpacity * (0.8 + Math.sin(elapsedTime * 2) * 0.2);
        }

        const cColor = data.color;
        ctx.lineCap = 'round';

        // --- NEW: Helper function to create Comet Trail Gradients ---
        const getCometGradient = (radius) => {
          // Creates a linear sweep that acts like a 3D sheen across the ring
          const grad = ctx.createLinearGradient(-radius, -radius, radius, radius);
          grad.addColorStop(0, cColor);
          grad.addColorStop(0.5, 'transparent');
          grad.addColorStop(1, cColor);
          return grad;
        };

        const drawRing = (radius, width, dashArray, rotationSpeed, glowAmount, alpha, useGradient = false) => {
          if (alpha <= 0.01 || radius <= 0) return;
          ctx.save();
          ctx.globalAlpha = Math.max(0, Math.min(1, alpha));

          if (rotationSpeed) {
            ctx.translate(CENTER, CENTER);
            ctx.rotate(elapsedTime * rotationSpeed);
          } else {
            ctx.translate(CENTER, CENTER); // Center origin even if not rotating
          }

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);

          // Apply standard color or our new comet sweep gradient
          ctx.strokeStyle = useGradient ? getCometGradient(radius) : cColor;
          ctx.lineWidth = width;

          if (dashArray) ctx.setLineDash(dashArray);

          if (glowAmount > 0) {
            ctx.shadowBlur = glowAmount;
            ctx.shadowColor = cColor;
          }

          ctx.stroke();
          ctx.restore();
        };

        // --- NEW: Helper function to draw glowing Data Nodes ---
        const drawNodes = (radius, count, rotationSpeed, alpha) => {
          if (alpha <= 0.01 || radius <= 0) return;
          ctx.save();
          ctx.globalAlpha = alpha;
          ctx.translate(CENTER, CENTER);
          ctx.rotate(elapsedTime * rotationSpeed);

          ctx.fillStyle = cColor;
          ctx.shadowBlur = 15;
          ctx.shadowColor = cColor;

          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            ctx.beginPath();
            // Plot nodes along the circumference
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 4, 0, Math.PI * 2);
            ctx.fill();
          }
          ctx.restore();
        };


        // --- EFFECTS ENGINE ---

        // 1. Shockwave Ripples (Spawns periodically when focused)
        if (isFocused && Math.random() < 0.03) { // 3% chance per frame to spawn a ripple
          tState.ripples.push({ spread: 0, alpha: 1 });
        }

        // Update and draw existing ripples
        tState.ripples = tState.ripples.filter(ripple => {
          ripple.spread += 100 * dt; // Expansion speed
          ripple.alpha -= 0.8 * dt;  // Fade out speed

          if (ripple.alpha > 0) {
            drawRing(currentRadius + ripple.spread, 1, null, 0, 10, baseOpacity * ripple.alpha * 0.5);
            return true; // Keep ripple alive
          }
          return false; // Destroy ripple
        });

        // 2. Outer Tracking Orbit + Data Nodes
        drawRing(currentRadius * 1.05, 1, [4, 60], -0.15, 5, baseOpacity * 0.4 * focusP);
        drawNodes(currentRadius * 1.05, 3, -0.15, baseOpacity * 0.8 * focusP); // 3 counter-clockwise nodes

        // 3. Inner Tracking Orbit + Data Nodes
        drawRing(currentRadius * 0.95, 2, [40, 20, 5, 20], 0.3, 5, baseOpacity * 0.8 * focusP);
        drawNodes(currentRadius * 0.95, 6, 0.3, baseOpacity * 0.8 * focusP); // 6 fast clockwise nodes

        // 4. The Core Rings
        const currentThickness = 10 - (4 * focusP);
        const currentGlow = 15 + (15 * focusP);

        // Solid Default Ring (fades out as focusP goes to 1)
        drawRing(currentRadius, currentThickness, null, 0, currentGlow, baseOpacity * (1 - focusP));

        // Spinning Dashed Ring (Fades in, uses the Comet Sweep Gradient!)
        drawRing(currentRadius, currentThickness, [180, 60, 20, 60], 0.1, currentGlow, baseOpacity * focusP, true);

        // 5. Background Fill
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