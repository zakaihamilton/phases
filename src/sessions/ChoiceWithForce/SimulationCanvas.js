import React, { useEffect, useRef } from 'react';
import styles from './SimulationCanvas.module.css';
import RulesArray from './Rules'; // Import the rules array

const SimulationCanvas = ({ activeRules }) => {
    const canvasRef = useRef(null);
    const rulesRef = useRef(activeRules);

    // Keep ref synced for the canvas animation loop
    useEffect(() => {
        rulesRef.current = activeRules;
    }, [activeRules]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        // Physics State: Normalized values (0 to 1) for responsive rendering
        const pState = {
            infinityAlpha: 0,
            igulimProgress: 0,
            fills: [0, 0, 0, 0],
            strokes: 0,
            beamProgress: 0,
            screenAlpha: 0,
            reflectProgress: 0
        };

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', resize);
        resize();

        const drawOrb = (x, y, radius, colorInner, colorOuter, opacity) => {
            if (opacity <= 0.01 || radius <= 0) return;

            ctx.save();
            ctx.globalAlpha = opacity;
            ctx.globalCompositeOperation = 'screen';
            const grad = ctx.createRadialGradient(x, y, 0, x, y, radius);
            grad.addColorStop(0, colorInner);
            grad.addColorStop(1, colorOuter);
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
            ctx.restore();
        };

        const render = () => {
            time += 0.01;
            const rules = rulesRef.current;
            const w = canvas.width / (window.devicePixelRatio || 1);
            const h = canvas.height / (window.devicePixelRatio || 1);
            const cx = w / 2;
            const cy = h / 2;

            RulesArray.forEach(rule => {
                if (rule.applyState) {
                    rule.applyState(pState, rules.has(rule.id), rules);
                }
            });

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            if (pState.infinityAlpha > 0.01) {
                const breathe = Math.sin(time * 2) * 0.05 + 1;
                drawOrb(cx, cy, Math.max(0, Math.max(w, h) * 0.75 * breathe), `rgba(255, 210, 80, 0.4)`, `rgba(255, 180, 0, 0)`, pState.infinityAlpha);
            }

            const maxR = Math.min(w, h) * 0.35;
            for (let i = 0; i < 4; i++) {
                const r = (maxR / 4) * (i + 1);
                if (pState.fills[i] > 0.01) {
                    ctx.beginPath();
                    ctx.arc(cx, cy, Math.max(0, r), 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(255, 215, 0, ${pState.fills[i] * 0.4})`;
                    ctx.fill();
                }
                if (pState.strokes > 0.01) {
                    ctx.beginPath();
                    const strokeRadius = Math.max(0, r * pState.igulimProgress + Math.sin(time * 1.5 + i) * 2);
                    ctx.arc(cx, cy, strokeRadius, 0, Math.PI * 2);
                    ctx.strokeStyle = `rgba(255, 220, 120, ${pState.strokes * 0.4})`;
                    ctx.lineWidth = 1;
                    ctx.stroke();
                }
            }

            const topY = h * 0.2;
            const botY = h * 0.8;
            const totalDist = botY - topY;
            const screenPosition = 0.833;
            const screenY = topY + totalDist * screenPosition;

            if (pState.beamProgress > 0) {
                const currentY = topY + totalDist * pState.beamProgress;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const beamGrad = ctx.createLinearGradient(0, topY, 0, currentY);
                beamGrad.addColorStop(0, 'rgba(255, 220, 100, 0.9)');
                beamGrad.addColorStop(1, 'rgba(255, 150, 0, 0.6)');
                ctx.fillStyle = beamGrad;
                ctx.fillRect(cx - 3, topY, 6, currentY - topY);
                drawOrb(cx, currentY, 30, 'rgba(255, 200, 50, 0.5)', 'rgba(255, 200, 50, 0)', 1);
                ctx.restore();
            }

            if (pState.screenAlpha > 0.01) {
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                ctx.fillStyle = `rgba(255, 255, 255, ${pState.screenAlpha})`;
                ctx.fillRect(cx - 70, screenY - 2, 140, 4);
                ctx.fillStyle = `rgba(255, 80, 50, ${pState.screenAlpha * 0.8})`;
                ctx.fillRect(cx - 30, screenY, 60, 2);
                drawOrb(cx, screenY, 60, `rgba(255, 255, 255, ${pState.screenAlpha * 0.8})`, `rgba(255, 255, 255, 0)`, 1);
                ctx.restore();
            }

            if (pState.reflectProgress > 0.01) {
                const currentReflectY = screenY - (screenY - topY) * pState.reflectProgress;
                ctx.save();
                ctx.globalCompositeOperation = 'screen';
                const refWidth = 24;
                ctx.fillStyle = `rgba(180, 220, 255, ${pState.reflectProgress * 0.85})`;
                ctx.fillRect(cx - refWidth / 2, currentReflectY, refWidth, screenY - currentReflectY);
                const washGrad = ctx.createLinearGradient(cx - refWidth * 2, 0, cx + refWidth * 2, 0);
                washGrad.addColorStop(0, 'rgba(100, 150, 255, 0)');
                washGrad.addColorStop(0.5, `rgba(100, 180, 255, ${pState.reflectProgress * 0.4})`);
                washGrad.addColorStop(1, 'rgba(100, 150, 255, 0)');
                ctx.fillStyle = washGrad;
                ctx.fillRect(cx - refWidth * 2, currentReflectY - 10, refWidth * 4, screenY - currentReflectY + 10);
                ctx.restore();
            }

            animationFrameId = requestAnimationFrame(render);
        };

        render();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className={styles.root}>
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.gridOverlay} />
        </div>
    );
};

export default SimulationCanvas;