import React, { useEffect, useRef } from 'react';
import { Navigation } from 'lucide-react';
import styles from './PhaseVisualizer.module.css';

const PhaseVisualizer = ({ phase, isExpanded, isSuperExpanded }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        // Logical resolution (Internal drawing coordinates)
        const W = 400;
        const H = 600;

        const scale = window.devicePixelRatio || 2;
        canvas.width = W * scale;
        canvas.height = H * scale;
        ctx.scale(scale, scale);

        const START = { x: 200, y: 530 };
        const HOME = { x: 200, y: 70 };
        const BAKERY = { x: 310, y: 300 };

        const mainCurve = { p0: START, p1: { x: 380, y: 450 }, p2: { x: 380, y: 150 }, p3: HOME };
        const detourCurve = { p0: START, p1: { x: 20, y: 450 }, p2: { x: 20, y: 150 }, p3: HOME };

        const grassTufts = Array.from({ length: 1000 }).map(() => ({
            x: Math.random() * W, y: Math.random() * H, height: Math.random() * 5 + 3, tilt: (Math.random() - 0.5) * 5
        }));

        const benches = [
            { x: 260, y: 380, w: 22, h: 10, color: '#78350f' },
            { x: 130, y: 360, w: 10, h: 22, color: '#78350f' },
            { x: 240, y: 150, w: 22, h: 10, color: '#78350f' }
        ];

        const crosswalks = [
            { x: 180, y: 110, count: 4, width: 8, height: 20, gap: 14, horizontal: true },
            { x: 360, y: 300, count: 3, width: 20, height: 8, gap: 12, horizontal: false }
        ];

        const trees = [
            { x: 100, y: 480, size: 22, color: '#064e3b' }, { x: 130, y: 500, size: 30, color: '#065f46' },
            { x: 280, y: 490, size: 26, color: '#064e3b' }, { x: 80, y: 380, size: 24, color: '#065f46' },
            { x: 120, y: 250, size: 32, color: '#064e3b' }, { x: 90, y: 220, size: 18, color: '#065f46' },
            { x: 280, y: 150, size: 28, color: '#064e3b' }, { x: 310, y: 120, size: 22, color: '#065f46' },
            { x: 120, y: 100, size: 24, color: '#064e3b' }, { x: 260, y: 80, size: 18, color: '#065f46' },
        ];

        const buildings = [
            { x: 140, y: 290, w: 70, h: 90, color: '#0f172a' }, { x: 70, y: 270, w: 60, h: 70, color: '#1e293b' },
            { x: 190, y: 170, w: 50, h: 60, color: '#0f172a' }, { x: 220, y: 410, w: 60, h: 50, color: '#1e293b' },
        ];

        const streetLights = [{ x: 200, y: 530 }, { x: 320, y: 430 }, { x: 350, y: 230 }, { x: 200, y: 70 }];

        const fireflies = Array.from({ length: 80 }).map(() => ({
            x: Math.random() * W, y: Math.random() * H, size: Math.random() * 2 + 0.8,
            twinkleSpeed: Math.random() * 0.04 + 0.02, phase: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
        }));

        const mistPatches = Array.from({ length: 8 }).map(() => ({
            x: Math.random() * W, y: Math.random() * H, size: Math.random() * 70 + 50, speed: Math.random() * 0.2 + 0.1
        }));

        let t = 0;
        let walkerTrail = [];
        let aromaParticles = [];
        let emotionParticles = [];
        let frames = 0;

        const getBezierXY = (t, curve) => {
            const { p0, p1, p2, p3 } = curve;
            const cX = 3 * (p1.x - p0.x), bX = 3 * (p2.x - p1.x) - cX, aX = p3.x - p0.x - cX - bX;
            const cY = 3 * (p1.y - p0.y), bY = 3 * (p2.y - p1.y) - cY, aY = p3.y - p0.y - cY - bY;
            return {
                x: (aX * Math.pow(t, 3)) + (bX * Math.pow(t, 2)) + (cX * t) + p0.x,
                y: (aY * Math.pow(t, 3)) + (bY * Math.pow(t, 2)) + (cY * t) + p0.y
            };
        };

        const drawPath = (curve, width, color, isDashed = false) => {
            ctx.beginPath();
            ctx.moveTo(curve.p0.x, curve.p0.y);
            ctx.bezierCurveTo(curve.p1.x, curve.p1.y, curve.p2.x, curve.p2.y, curve.p3.x, curve.p3.y);
            ctx.strokeStyle = color;
            ctx.lineWidth = width;
            ctx.lineCap = 'round';
            if (isDashed) {
                ctx.setLineDash([20, 25]);
                ctx.lineDashOffset = -frames * 0.6;
            } else {
                ctx.setLineDash([]);
            }
            ctx.stroke();
            ctx.setLineDash([]);
        };

        const render = () => {
            frames++;
            ctx.fillStyle = '#020b06';
            ctx.fillRect(0, 0, W, H);

            ctx.strokeStyle = '#064e3b';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.5;
            grassTufts.forEach(grass => {
                ctx.beginPath(); ctx.moveTo(grass.x, grass.y); ctx.lineTo(grass.x + grass.tilt, grass.y - grass.height); ctx.stroke();
            });
            ctx.globalAlpha = 1.0;

            ctx.fillStyle = 'rgba(148, 163, 184, 0.035)';
            mistPatches.forEach(mist => {
                mist.x += mist.speed;
                if (mist.x > W + mist.size * 2) { mist.x = -mist.size * 2; mist.y = Math.random() * H; }
                ctx.beginPath(); ctx.ellipse(mist.x, mist.y, mist.size, mist.size * 0.6, 0, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.ellipse(mist.x + mist.size * 0.5, mist.y - mist.size * 0.2, mist.size * 0.8, mist.size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
            });

            fireflies.forEach(f => {
                f.phase += f.twinkleSpeed; f.x += f.vx; f.y += f.vy;
                if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; if (f.y < 0) f.y = H; if (f.y > H) f.y = 0;
                ctx.fillStyle = `rgba(163, 230, 53, ${Math.abs(Math.sin(f.phase)) * 0.9 + 0.1})`;
                ctx.beginPath(); ctx.arc(f.x, f.y, f.size, 0, Math.PI * 2); ctx.fill();
            });

            buildings.forEach(b => {
                ctx.fillStyle = b.color; ctx.fillRect(b.x, b.y, b.w, b.h);
                ctx.fillStyle = '#334155';
                for (let i = 0; i < 3; i++) { for (let j = 0; j < 4; j++) { ctx.fillRect(b.x + 10 + i * 18, b.y + 10 + j * 18, 10, 10); } }
            });

            if (phase.hasDetour) {
                drawPath(detourCurve, 36, '#1e293b');
                drawPath(detourCurve, 3, '#334155', true);
            } else {
                ctx.beginPath(); ctx.moveTo(detourCurve.p0.x, detourCurve.p0.y);
                ctx.bezierCurveTo(detourCurve.p1.x, detourCurve.p1.y, detourCurve.p2.x, detourCurve.p2.y, detourCurve.p3.x, detourCurve.p3.y);
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.setLineDash([8, 12]); ctx.stroke(); ctx.setLineDash([]);
            }

            drawPath(mainCurve, 36, '#1e293b');
            drawPath(mainCurve, 30, '#0f172a');
            drawPath(mainCurve, 5, phase.hasDesire ? 'rgba(217, 119, 6, 0.6)' : 'rgba(71, 85, 105, 0.5)', true);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            crosswalks.forEach(cw => {
                for (let i = 0; i < cw.count; i++) {
                    if (cw.horizontal) ctx.fillRect(cw.x + i * cw.gap, cw.y, cw.width, cw.height);
                    else ctx.fillRect(cw.x, cw.y + i * cw.gap, cw.width, cw.height);
                }
            });

            benches.forEach(bench => {
                ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fillRect(bench.x + 3, bench.y + 3, bench.w, bench.h);
                ctx.fillStyle = bench.color; ctx.fillRect(bench.x, bench.y, bench.w, bench.h);
                ctx.fillStyle = '#451a03';
                if (bench.w > bench.h) ctx.fillRect(bench.x, bench.y, bench.w, 3);
                else ctx.fillRect(bench.x, bench.y, 3, bench.h);
            });

            trees.forEach(tree => {
                ctx.fillStyle = tree.color; ctx.beginPath(); ctx.arc(tree.x, tree.y, tree.size, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(tree.x - 3, tree.y - 3, tree.size - 6, 0, Math.PI * 2); ctx.fill();
            });

            streetLights.forEach(light => {
                ctx.fillStyle = '#475569'; ctx.beginPath(); ctx.arc(light.x, light.y, 4, 0, Math.PI * 2); ctx.fill();
                const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 50);
                gradient.addColorStop(0, 'rgba(253, 224, 71, 0.35)');
                gradient.addColorStop(1, 'rgba(253, 224, 71, 0)');
                ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(light.x, light.y, 50, 0, Math.PI * 2); ctx.fill();
            });

            const hGlow = ctx.createRadialGradient(HOME.x, HOME.y, 0, HOME.x, HOME.y, 80);
            hGlow.addColorStop(0, 'rgba(59, 130, 246, 0.25)'); hGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = hGlow; ctx.beginPath(); ctx.arc(HOME.x, HOME.y, 80, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#1e3a8a'; ctx.fillRect(HOME.x - 30, HOME.y - 25, 60, 50);
            ctx.fillStyle = '#1e40af'; ctx.beginPath(); ctx.moveTo(HOME.x - 35, HOME.y - 25); ctx.lineTo(HOME.x, HOME.y - 55); ctx.lineTo(HOME.x + 35, HOME.y - 25); ctx.fill();
            ctx.fillStyle = '#60a5fa'; ctx.shadowColor = '#93c5fd'; ctx.shadowBlur = 15; ctx.fillRect(HOME.x - 12, HOME.y - 6, 24, 18); ctx.shadowBlur = 0;

            ctx.fillStyle = '#334155'; ctx.beginPath(); ctx.arc(START.x, START.y, 24, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#1e293b'; ctx.beginPath(); ctx.arc(START.x, START.y, 18, 0, Math.PI * 2); ctx.fill();

            ctx.fillStyle = '#78350f'; ctx.fillRect(BAKERY.x - 35, BAKERY.y - 30, 70, 60);
            for (let i = 0; i < 7; i++) {
                ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#fef2f2';
                ctx.fillRect(BAKERY.x - 35 + (i * 10), BAKERY.y - 35, 10, 18);
            }
            ctx.fillStyle = '#fef08a'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 25 + Math.sin(frames * 0.08) * 10;
            ctx.fillRect(BAKERY.x - 24, BAKERY.y - 12, 48, 30); ctx.shadowBlur = 0;
            ctx.fillStyle = '#b45309';
            ctx.beginPath(); ctx.arc(BAKERY.x - 12, BAKERY.y + 6, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(BAKERY.x + 12, BAKERY.y + 6, 5, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(BAKERY.x, BAKERY.y + 12, 6, 0, Math.PI * 2); ctx.fill();

            if (frames % 5 === 0) {
                aromaParticles.push({
                    x: BAKERY.x - 12, y: BAKERY.y - 24,
                    vx: (Math.random() * -2.5) - 0.8, vy: (Math.random() * -1.2) - 0.5,
                    life: 1, size: Math.random() * 18 + 18, spin: Math.random() * Math.PI * 2
                });
            }

            aromaParticles.forEach((p, index) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.005; p.spin += 0.02; p.vx += Math.sin(frames * 0.02 + p.y) * 0.04;
                if (p.life <= 0) aromaParticles.splice(index, 1);
                else {
                    ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.spin); ctx.beginPath();
                    ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(251, 191, 36, ${p.life * 0.18})`; ctx.fill(); ctx.restore();
                }
            });

            const pos = getBezierXY(t, mainCurve);
            const isNearBakery = Math.hypot(pos.x - BAKERY.x, pos.y - BAKERY.y) < 140;

            if (frames % 3 === 0) walkerTrail.push({ x: pos.x, y: pos.y, life: 1 });
            walkerTrail.forEach((tr, index) => {
                tr.life -= 0.025;
                if (tr.life <= 0) walkerTrail.splice(index, 1);
                else {
                    ctx.beginPath(); ctx.arc(tr.x, tr.y, 6 + (1 - tr.life) * 3, 0, Math.PI * 2);
                    ctx.fillStyle = phase.hasDesire ? `rgba(244, 63, 94, ${tr.life * 0.4})` : `rgba(148, 163, 184, ${tr.life * 0.4})`; ctx.fill();
                }
            });

            ctx.fillStyle = phase.hasDesire ? '#F43F5E' : '#94A3B8';
            ctx.shadowColor = phase.hasDesire ? '#FB7185' : 'transparent';
            ctx.shadowBlur = phase.hasDesire ? 25 : 0;

            const bounce = Math.abs(Math.sin(frames * 0.25)) * 4;
            ctx.beginPath(); ctx.arc(pos.x, pos.y - bounce, 10, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(pos.x, pos.y - bounce, 4, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;

            if (isNearBakery && frames % (phase.hasDesire ? 5 : 12) === 0) {
                emotionParticles.push({
                    x: pos.x, y: pos.y - 18 - bounce,
                    vx: phase.hasDesire ? (Math.random() * 2 + 0.8) : (Math.random() * -0.8 - 0.5),
                    vy: Math.random() * -2.5 - 1.5,
                    life: 1, type: phase.hasDesire ? 'desire' : 'indifferent', scale: Math.random() * 0.6 + 0.6
                });
            }

            emotionParticles.forEach((ep, index) => {
                ep.x += ep.vx; ep.y += ep.vy; ep.life -= 0.012;
                if (ep.life <= 0) emotionParticles.splice(index, 1);
                else {
                    ctx.globalAlpha = ep.life;
                    if (ep.type === 'desire') {
                        ctx.save(); ctx.translate(ep.x, ep.y); ctx.scale(ep.scale, ep.scale); ctx.fillStyle = '#FDA4AF';
                        ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(0, -4, -6, -18, -18, -18);
                        ctx.bezierCurveTo(-36, -18, -36, 6, -36, 6); ctx.bezierCurveTo(-36, 24, -12, 36, 0, 48);
                        ctx.bezierCurveTo(12, 36, 36, 24, 36, 6); ctx.bezierCurveTo(36, 6, 36, -18, 18, -18);
                        ctx.bezierCurveTo(6, -18, 0, -4, 0, 0); ctx.fill(); ctx.restore();

                        ctx.strokeStyle = `rgba(251, 113, 133, ${ep.life * 0.4})`; ctx.lineWidth = 1.5;
                        ctx.beginPath(); ctx.moveTo(pos.x, pos.y); ctx.lineTo(BAKERY.x, BAKERY.y); ctx.stroke();
                    } else {
                        ctx.fillStyle = '#64748B'; ctx.beginPath(); ctx.arc(ep.x, ep.y, 4 * ep.scale, 0, Math.PI * 2); ctx.fill();
                        ctx.strokeStyle = '#475569'; ctx.lineWidth = 2.5; ctx.beginPath(); ctx.arc(ep.x, ep.y, 10 * ep.scale - ep.life * 2, 0, Math.PI * 2); ctx.stroke();
                    }
                    ctx.globalAlpha = 1;
                }
            });

            t += 0.0022;
            if (t >= 1.05) { t = 0; walkerTrail = []; emotionParticles = []; }
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => cancelAnimationFrame(animationFrameId);
    }, [phase]);

    // Determine width classes
    const widthClass = isSuperExpanded
        ? styles.canvasMaxWidthSuper
        : (isExpanded ? styles.canvasMaxWidthExpanded : styles.canvasMaxWidthNormal);

    return (
        <div className={`${styles.canvasWrapper} ${widthClass}`}>
            <div
                className={styles.canvasGlow}
                style={{ background: `radial-gradient(circle at center, ${phase.glowColor} 0%, transparent 70%)` }}
            />

            <canvas ref={canvasRef} className={styles.canvasEl} />

            <div className={styles.hudOverlay}>
                <div className={styles.hudHeader}>
                    <Navigation size={18} color="#60a5fa" /> Environment HUD
                </div>
                <div className={styles.hudList}>
                    <div className={styles.hudRow}>
                        <div className={styles.hudRowTitle}>
                            <span className={`${styles.hudDot} ${phase.hasDetour ? styles.hudDotGreen : styles.hudDotRed}`} />
                            <span className={styles.hudLabel}>Route Status</span>
                        </div>
                        <div className={styles.hudValue}>
                            {phase.hasDetour ? "Alternate path (Choice)" : "Only road home (Coerced)"}
                        </div>
                    </div>
                    <div className={styles.hudRow}>
                        <div className={styles.hudRowTitle}>
                            <span className={`${styles.hudDot} ${phase.hasDesire ? styles.hudDotRose : styles.hudDotSlate}`} />
                            <span className={styles.hudLabel}>Internal State</span>
                        </div>
                        <div className={styles.hudValue}>
                            {phase.hasDesire ? "Drawn to scent (Craving)" : "Immune to scent (Indifferent)"}
                        </div>
                    </div>
                </div>
            </div>

            <div className={`${styles.mapLabel} ${styles.startLabel}`}>START</div>
            <div className={`${styles.mapLabel} ${styles.homeLabel}`}>HOME</div>
        </div>
    );
};

export default PhaseVisualizer;
