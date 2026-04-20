import React, { useEffect, useRef } from 'react';
import styles from './Mandala.module.css';
import { FLAT_DATA } from '../app/data.js';

const Mandala = ({ cameraScale, activePath, visibleList, radiusLevels }) => {
  const canvasRef = useRef(null);

  const transitionsRef = useRef(new Map());
  const gradientCacheRef = useRef(new Map());
  const starsRef = useRef([]);
  const cloudsRef = useRef([]);

  const prevPathRef = useRef(`${activePath.p}-${activePath.s}`);
  const globalSpinVelocityRef = useRef(0);
  const globalSpinOffsetRef = useRef(0);
  const phaseTransitionRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;

    const VIEW_SIZE = 2000;
    const CENTER = VIEW_SIZE / 2;

    const isMobile = window.innerWidth < 768;
    const dpr = Math.min(window.devicePixelRatio || 1, isMobile ? 2 : 3);
    
    canvas.width = VIEW_SIZE * dpr;
    canvas.height = VIEW_SIZE * dpr;
    ctx.scale(dpr, dpr);

    // --- INITIALIZE BACKGROUNDS ---
    if (starsRef.current.length === 0) {
      const starCount = isMobile ? 150 : 400;
      for (let i = 0; i < starCount; i++) {
        const r = Math.sqrt(Math.random()) * 1500;
        const theta = Math.random() * Math.PI * 2;

        starsRef.current.push({
          x: Math.cos(theta) * r,
          y: Math.sin(theta) * r,
          radius: Math.random() * 1.2 + 0.2,
          baseAlpha: Math.random() * 0.4 + 0.1,
          twinkleSpeed: Math.random() * 1.5 + 0.5,
          timeOffset: Math.random() * Math.PI * 2,
          color: Math.random() > 0.8 ? '#88ccff' : (Math.random() > 0.9 ? '#ffcc88' : '#ffffff')
        });
      }
    }

    if (cloudsRef.current.length === 0) {
      const cosmicColors = [
        { r: 74, g: 0, b: 224 },
        { r: 0, g: 198, b: 255 },
        { r: 255, g: 0, b: 153 },
        { r: 142, g: 45, b: 226 }
      ];

      const cloudCount = isMobile ? 4 : 8;
      for (let i = 0; i < cloudCount; i++) {
        const colorObj = cosmicColors[Math.floor(Math.random() * cosmicColors.length)];
        cloudsRef.current.push({
          x: Math.random() * VIEW_SIZE,
          y: Math.random() * VIEW_SIZE,
          radius: Math.random() * 500 + 400,
          vx: (Math.random() - 0.5) * (isMobile ? 8 : 15),
          vy: (Math.random() - 0.5) * (isMobile ? 8 : 15),
          baseAlpha: Math.random() * 0.04 + 0.01,
          pulseSpeed: Math.random() * 0.5 + 0.2,
          timeOffset: Math.random() * Math.PI * 2,
          color: colorObj
        });
      }
    }

    let startTime = performance.now();
    let lastTime = startTime;

    const draw = (currentTime) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.05);
      lastTime = currentTime;
      const elapsedTime = (currentTime - startTime) / 1000;

      ctx.clearRect(0, 0, VIEW_SIZE, VIEW_SIZE);
      ctx.globalCompositeOperation = 'lighter';

      // --- TRANSITION TRIGGERS ---
      const currentPathStr = `${activePath.p}-${activePath.s}`;
      if (prevPathRef.current !== currentPathStr) {
        globalSpinVelocityRef.current += isMobile ? 1.5 : 3.0;
        phaseTransitionRef.current = 1.0;
        prevPathRef.current = currentPathStr;
      }

      globalSpinVelocityRef.current -= globalSpinVelocityRef.current * 2.5 * dt;
      globalSpinOffsetRef.current += globalSpinVelocityRef.current * dt;

      phaseTransitionRef.current = Math.max(0, phaseTransitionRef.current - (1.5 * dt));
      const tIntensity = phaseTransitionRef.current;

      // --- 1. DRAW GAS CLOUDS ---
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(globalSpinOffsetRef.current * 0.02);
      ctx.translate(-CENTER, -CENTER);

      cloudsRef.current.forEach(cloud => {
        cloud.x += cloud.vx * dt;
        cloud.y += cloud.vy * dt;

        if (cloud.x < -cloud.radius) cloud.x = VIEW_SIZE + cloud.radius;
        if (cloud.x > VIEW_SIZE + cloud.radius) cloud.x = -cloud.radius;
        if (cloud.y < -cloud.radius) cloud.y = VIEW_SIZE + cloud.radius;
        if (cloud.y > VIEW_SIZE + cloud.radius) cloud.y = -cloud.radius;

        const currentAlpha = cloud.baseAlpha + Math.sin(elapsedTime * cloud.pulseSpeed + cloud.timeOffset) * (cloud.baseAlpha * 0.5);

        ctx.save();
        ctx.globalAlpha = Math.max(0, currentAlpha);
        ctx.translate(cloud.x, cloud.y);

        const cacheKey = `cloud-${cloud.color.r}-${cloud.color.g}-${Math.round(cloud.radius)}`;
        let grad = gradientCacheRef.current.get(cacheKey);

        if (!grad) {
          grad = ctx.createRadialGradient(0, 0, 0, 0, 0, cloud.radius);
          grad.addColorStop(0, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, 1)`);
          grad.addColorStop(1, `rgba(${cloud.color.r}, ${cloud.color.g}, ${cloud.color.b}, 0)`);
          gradientCacheRef.current.set(cacheKey, grad);
        }

        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(0, 0, cloud.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      ctx.restore();

      // --- 2. DRAW STARFIELD ---
      ctx.save();
      ctx.translate(CENTER, CENTER);
      ctx.rotate(globalSpinOffsetRef.current * 0.05);

      starsRef.current.forEach(star => {
        const currentAlpha = star.baseAlpha + Math.sin(elapsedTime * star.twinkleSpeed + star.timeOffset) * 0.3;
        ctx.globalAlpha = Math.max(0, Math.min(1, currentAlpha));

        if (tIntensity > 0.01 && !isMobile) {
          const angle = Math.atan2(star.y, star.x);
          const stretch = tIntensity * 250 * star.radius;

          const grad = ctx.createLinearGradient(star.x, star.y, star.x + Math.cos(angle) * stretch, star.y + Math.sin(angle) * stretch);
          grad.addColorStop(0, star.color);
          grad.addColorStop(1, 'transparent');

          ctx.beginPath();
          ctx.moveTo(star.x, star.y);
          ctx.lineTo(star.x + Math.cos(angle) * stretch, star.y + Math.sin(angle) * stretch);
          ctx.strokeStyle = grad;
          ctx.lineWidth = star.radius * 1.5;
          ctx.stroke();
        } else {
          ctx.fillStyle = star.color;
          ctx.beginPath();
          ctx.arc(star.x, star.y, star.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      });
      ctx.restore();

      // --- 3. THE REFINED NOVA SHOCKWAVE ---
      if (tIntensity > 0.01) {
        ctx.save();
        ctx.translate(CENTER, CENTER);
        const novaRadius = (1.0 - Math.pow(tIntensity, 3)) * (VIEW_SIZE * 0.8);

        // Ambient screen flash (Reduced to 1% opacity so it's not blinding)
        ctx.fillStyle = `rgba(0, 198, 255, ${tIntensity * 0.01})`;
        ctx.beginPath();
        ctx.arc(0, 0, VIEW_SIZE, 0, Math.PI * 2);
        ctx.fill();

        // Expanding Energy Ring (Thinner, softer color, tighter glow)
        ctx.beginPath();
        ctx.arc(0, 0, Math.max(0, novaRadius), 0, Math.PI * 2);
        ctx.lineWidth = tIntensity * (isMobile ? 8 : 15);
        ctx.strokeStyle = `rgba(200, 240, 255, ${tIntensity * 0.6})`;
        
        if (!isMobile) {
           ctx.shadowBlur = 30;
           ctx.shadowColor = '#00c6ff';
        }
        
        ctx.stroke();
        ctx.restore();
      }

      // --- 4. DRAW MANDALA RINGS ---
      const focusedIndex = FLAT_DATA.findIndex(d => d.pIdx === activePath.p && d.sIdx === activePath.s);

      FLAT_DATA.forEach((data, index) => {
        if (!visibleList.includes(index)) return;

        const isFocused = index === focusedIndex;
        const rl = radiusLevels[index];
        const dynamicScale = rl === 0 ? 0.05 : 0.2 + (rl - 1) * 0.18;

        const depthScale = isFocused ? 1 : 0.95;
        const targetRadius = 800 * dynamicScale * cameraScale * depthScale;

        const baseTargetOpacity = data.opacity || 1;
        const targetOpacity = isFocused ? baseTargetOpacity : baseTargetOpacity * 0.4;
        const targetFocus = isFocused ? 1 : 0;

        let tState = transitionsRef.current.get(index);
        if (!tState) {
          tState = {
            focusProgress: targetFocus,
            animatedRadius: targetRadius,
            radiusVelocity: 0,
            animatedOpacity: targetOpacity,
            ripples: []
          };
          transitionsRef.current.set(index, tState);
        }

        const stiffness = (isMobile ? 120 : 180) - (index * 6);
        const damping = (isMobile ? 10 : 12) + (index * 0.2);

        const springForce = (targetRadius - tState.animatedRadius) * stiffness;
        tState.radiusVelocity += (springForce - (tState.radiusVelocity * damping)) * dt;
        tState.animatedRadius += tState.radiusVelocity * dt;

        tState.focusProgress += (targetFocus - tState.focusProgress) * (isMobile ? 6 : 8) * dt;
        tState.animatedOpacity += (targetOpacity - tState.animatedOpacity) * (isMobile ? 6 : 8) * dt;

        const focusP = tState.focusProgress;
        const currentRadius = Math.max(0, tState.animatedRadius);
        let baseOpacity = tState.animatedOpacity;

        if (baseOpacity < 0.001 && currentRadius < 1) return;

        if (data.pulse && baseOpacity > 0.01) {
          baseOpacity = baseOpacity * (0.8 + Math.sin(elapsedTime * 2) * 0.2);
        }

        const cColor = data.color;
        ctx.lineCap = 'round';

        const getCometGradient = () => {
          const cacheKey = `sheen-${cColor}`;
          let grad = gradientCacheRef.current.get(cacheKey);

          if (!grad) {
            grad = ctx.createConicGradient(0, 0, 0);
            grad.addColorStop(0, cColor);
            grad.addColorStop(0.8, cColor);
            grad.addColorStop(0.95, '#ffffff');
            grad.addColorStop(1, cColor);
            gradientCacheRef.current.set(cacheKey, grad);
          }
          return grad;
        };

        const drawRing = (radius, width, dashArray, rotationSpeed, glowAmount, alpha, useGradient = false) => {
          if (alpha <= 0.01 || radius <= 0) return;

          ctx.save();
          ctx.translate(CENTER, CENTER);

          if (rotationSpeed) {
            ctx.rotate((elapsedTime * rotationSpeed) + (globalSpinOffsetRef.current * Math.sign(rotationSpeed)));
          } else {
            ctx.rotate(globalSpinOffsetRef.current * 0.2);
          }

          ctx.beginPath();
          ctx.arc(0, 0, radius, 0, Math.PI * 2);

          ctx.strokeStyle = (useGradient && !isMobile) ? getCometGradient() : cColor;

          if (dashArray) ctx.setLineDash(dashArray);

          if (glowAmount > 0 && !isMobile) {
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

          ctx.rotate((elapsedTime * rotationSpeed) + (globalSpinOffsetRef.current * Math.sign(rotationSpeed)));

          ctx.fillStyle = cColor;

          for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 / count) * i;
            ctx.beginPath();
            ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, isMobile ? 3 : 4, 0, Math.PI * 2);
            ctx.fill();

            if (!isMobile) {
              ctx.globalAlpha = alpha * 0.3;
              ctx.beginPath();
              ctx.arc(Math.cos(angle) * radius, Math.sin(angle) * radius, 12, 0, Math.PI * 2);
              ctx.fill();
              ctx.globalAlpha = alpha;
            }
          }
          ctx.restore();
        };

        if (isFocused && !isMobile && Math.random() < 0.03) {
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

        if (focusP > 0.01) {
          drawRing(currentRadius * 1.05, 1, null, -0.15, 5, baseOpacity * 0.4 * focusP, true);
          drawNodes(currentRadius * 1.05, 3, -0.15, baseOpacity * 0.8 * focusP);

          drawRing(currentRadius * 0.95, 2, null, 0.3, 5, baseOpacity * 0.8 * focusP, true);
          drawNodes(currentRadius * 0.95, 6, 0.3, baseOpacity * 0.8 * focusP);
        }

        const currentThickness = isMobile ? (8 - (3 * focusP)) : (10 - (4 * focusP));
        const currentGlow = 15 + (15 * focusP);

        const slowDriftSpeed = (index % 2 === 0 ? 0.3 : -0.3) - (index * 0.05);

        drawRing(currentRadius, currentThickness, null, slowDriftSpeed, currentGlow, baseOpacity * (1 - focusP), true);
        drawRing(currentRadius, currentThickness, null, 0.6, currentGlow, baseOpacity * focusP, true);

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