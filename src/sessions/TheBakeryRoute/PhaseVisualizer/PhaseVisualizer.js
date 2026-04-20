import React, { useEffect, useRef } from 'react';
import { Navigation } from 'lucide-react';
import styles from './PhaseVisualizer.module.css';

const PhaseVisualizer = ({ phase, isExpanded, isSuperExpanded, isDescriptionOpen }) => {
    const canvasRef = useRef(null);
    const phaseRef = useRef(phase);

    useEffect(() => {
        phaseRef.current = phase;
    }, [phase]);

    useEffect(() => {
        const toIso = (originalX, originalY, z = 0) => {
            const x = originalY;
            const y = originalX;
            return {
                x: 0.7 * x - 0.7 * y + 470,
                y: 0.45 * x + 0.45 * y - 40 - z
            };
        };

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const W = 800;
        const H = 600;

        const scale = window.devicePixelRatio || 2;
        canvas.width = W * scale;
        canvas.height = H * scale;
        ctx.scale(scale, scale);

        const START = { x: 400, y: 530 };
        const HOME = { x: 400, y: 70 };
        const BAKERY = { x: 620, y: 300 };

        const mainCurve = { p0: START, p1: { x: 760, y: 450 }, p2: { x: 760, y: 150 }, p3: HOME };
        const detourCurve = { p0: START, p1: { x: 40, y: 450 }, p2: { x: 40, y: 150 }, p3: HOME };

        const grassTufts = Array.from({ length: 2000 }).map(() => ({
            x: Math.random() * W, y: Math.random() * H, height: Math.random() * 5 + 3, tilt: (Math.random() - 0.5) * 5
        }));

        const benches = [
            { x: 520, y: 380, w: 22, h: 10, color: '#78350f' },
            { x: 260, y: 360, w: 10, h: 22, color: '#78350f' },
            { x: 480, y: 150, w: 22, h: 10, color: '#78350f' },
            { x: 180, y: 450, w: 22, h: 10, color: '#78350f' },
            { x: 660, y: 180, w: 10, h: 22, color: '#78350f' }
        ];

        const crosswalks = [
            { x: 360, y: 110, count: 4, width: 8, height: 20, gap: 14, horizontal: true },
            { x: 720, y: 300, count: 3, width: 20, height: 8, gap: 12, horizontal: false },
            { x: 140, y: 420, count: 3, width: 20, height: 8, gap: 12, horizontal: false },
            { x: 500, y: 250, count: 4, width: 8, height: 20, gap: 14, horizontal: true }
        ];

        const trees = [
            { x: 200, y: 480, size: 22, color: '#064e3b' }, { x: 260, y: 500, size: 30, color: '#065f46' },
            { x: 560, y: 490, size: 26, color: '#064e3b' }, { x: 160, y: 380, size: 24, color: '#065f46' },
            { x: 240, y: 250, size: 32, color: '#064e3b' }, { x: 180, y: 220, size: 18, color: '#065f46' },
            { x: 560, y: 150, size: 28, color: '#064e3b' }, { x: 620, y: 120, size: 22, color: '#065f46' },
            { x: 240, y: 100, size: 24, color: '#064e3b' }, { x: 520, y: 80, size: 18, color: '#065f46' },
            { x: 100, y: 450, size: 28, color: '#065f46' }, { x: 700, y: 480, size: 20, color: '#064e3b' },
            { x: 680, y: 380, size: 30, color: '#064e3b' }, { x: 100, y: 280, size: 25, color: '#065f46' },
            { x: 680, y: 200, size: 26, color: '#064e3b' }, { x: 120, y: 150, size: 22, color: '#065f46' },
            { x: 700, y: 80, size: 32, color: '#064e3b' }, { x: 340, y: 400, size: 20, color: '#065f46' }
        ];

        const buildings = [
            { x: 280, y: 320, w: 70, h: 90, z: 120, colors: ['#1e293b', '#0f172a', '#020617'] },
            { x: 180, y: 220, w: 60, h: 70, z: 90, colors: ['#334155', '#1e293b', '#0f172a'] },
            { x: 380, y: 170, w: 50, h: 60, z: 100, colors: ['#1e293b', '#0f172a', '#020617'] },
            { x: 480, y: 410, w: 60, h: 50, z: 80, colors: ['#334155', '#1e293b', '#0f172a'] },
            { x: 250, y: 120, w: 50, h: 60, z: 110, colors: ['#475569', '#334155', '#1e293b'] }
        ];

        const streetLights = [
            { x: 400, y: 530 }, { x: 640, y: 430 }, { x: 700, y: 230 }, { x: 400, y: 70 },
            { x: 260, y: 400 }, { x: 160, y: 200 }, { x: 550, y: 500 }
        ];

        const fireflies = Array.from({ length: 40 }).map(() => ({
            x: Math.random() * W, y: Math.random() * H, size: Math.random() * 2 + 0.8,
            twinkleSpeed: Math.random() * 0.04 + 0.02, phase: Math.random() * Math.PI * 2,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4
        }));

        const mistPatches = Array.from({ length: 16 }).map(() => ({
            x: Math.random() * W, y: Math.random() * H, size: Math.random() * 70 + 50, speed: Math.random() * 0.2 + 0.1
        }));

        let t = 0;
        let walkerTrail = [];
        let aromaParticles = [];
        let emotionParticles = [];
        let frames = 0;
        let lastPhaseId = phaseRef.current.id;

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
            const currentPhase = phaseRef.current;

            if (currentPhase.id !== lastPhaseId) {
                t = 0;
                walkerTrail = [];
                aromaParticles = [];
                emotionParticles = [];
                lastPhaseId = currentPhase.id;
            }

            // === 1. Background ===
            ctx.setTransform(scale, 0, 0, scale, 0, 0); // Reset transform
            ctx.fillStyle = '#020b06';
            ctx.fillRect(0, 0, W, H);

            // === 2. Flat Ground Layer ===
            ctx.save();
            ctx.setTransform(scale * -0.7, scale * 0.45, scale * 0.7, scale * 0.45, scale * 470, scale * -40);

            // Grass tufts
            ctx.strokeStyle = '#064e3b';
            ctx.lineWidth = 1.5;
            ctx.globalAlpha = 0.5;
            grassTufts.forEach(grass => {
                ctx.beginPath();
                ctx.moveTo(grass.x, grass.y);
                // Draw flat line segment to simulate texture
                ctx.lineTo(grass.x + 8, grass.y + 8);
                ctx.stroke();
            });
            ctx.globalAlpha = 1.0;

            // Paths
            if (currentPhase.hasDetour) {
                drawPath(detourCurve, 36, '#1e293b');
                drawPath(detourCurve, 3, '#334155', true);
            } else {
                ctx.beginPath(); ctx.moveTo(detourCurve.p0.x, detourCurve.p0.y);
                ctx.bezierCurveTo(detourCurve.p1.x, detourCurve.p1.y, detourCurve.p2.x, detourCurve.p2.y, detourCurve.p3.x, detourCurve.p3.y);
                ctx.strokeStyle = '#0f172a'; ctx.lineWidth = 3; ctx.setLineDash([8, 12]); ctx.stroke(); ctx.setLineDash([]);
            }

            drawPath(mainCurve, 36, '#1e293b');
            drawPath(mainCurve, 30, '#0f172a');
            drawPath(mainCurve, 5, currentPhase.hasDesire ? 'rgba(217, 119, 6, 0.6)' : 'rgba(71, 85, 105, 0.5)', true);

            // Crosswalks
            ctx.fillStyle = 'rgba(255, 255, 255, 0.25)';
            crosswalks.forEach(cw => {
                for (let i = 0; i < cw.count; i++) {
                    if (cw.horizontal) ctx.fillRect(cw.x + i * cw.gap, cw.y, cw.width, cw.height);
                    else ctx.fillRect(cw.x, cw.y + i * cw.gap, cw.width, cw.height);
                }
            });

            // Ground glows
            const hGlow = ctx.createRadialGradient(HOME.x, HOME.y, 0, HOME.x, HOME.y, 80);
            hGlow.addColorStop(0, 'rgba(59, 130, 246, 0.25)'); hGlow.addColorStop(1, 'transparent');
            ctx.fillStyle = hGlow; ctx.beginPath(); ctx.arc(HOME.x, HOME.y, 80, 0, Math.PI * 2); ctx.fill();

            streetLights.forEach(light => {
                const gradient = ctx.createRadialGradient(light.x, light.y, 0, light.x, light.y, 50);
                gradient.addColorStop(0, 'rgba(253, 224, 71, 0.2)');
                gradient.addColorStop(1, 'transparent');
                ctx.fillStyle = gradient; ctx.beginPath(); ctx.arc(light.x, light.y, 50, 0, Math.PI * 2); ctx.fill();
            });

            ctx.restore(); // END GROUND TRANSFORM

            // === 3. Generate isometric renderables (Z-Sorted) ===
            const renderables = [];
            const obj = (depth, fn) => renderables.push({ depth, draw: fn });

            // Mist patches (flat but floating slightly)
            mistPatches.forEach(mist => {
                mist.x += mist.speed;
                if (mist.x > W + mist.size * 2) { mist.x = -mist.size * 2; mist.y = Math.random() * H; }
                obj(mist.x + mist.y, () => {
                    const pos = toIso(mist.x, mist.y, -10);
                    ctx.fillStyle = 'rgba(148, 163, 184, 0.035)';
                    ctx.beginPath(); ctx.ellipse(pos.x, pos.y, mist.size, mist.size * 0.4, 0, 0, Math.PI * 2); ctx.fill();
                });
            });

            // Fireflies
            fireflies.forEach(f => {
                f.phase += f.twinkleSpeed; f.x += f.vx; f.y += f.vy;
                if (f.x < 0) f.x = W; if (f.x > W) f.x = 0; if (f.y < 0) f.y = H; if (f.y > H) f.y = 0;
                obj(f.x + f.y, () => {
                    const pos = toIso(f.x, f.y, 20 + Math.sin(f.phase) * 10);
                    ctx.fillStyle = `rgba(163, 230, 53, ${Math.abs(Math.sin(f.phase)) * 0.9 + 0.1})`;
                    ctx.beginPath(); ctx.arc(pos.x, pos.y, f.size, 0, Math.PI * 2); ctx.fill();
                });
            });

            // Benches
            benches.forEach(bench => {
                obj(bench.x + bench.w / 2 + bench.y + bench.h / 2, () => {
                    const z = 8;
                    const bl = toIso(bench.x, bench.y + bench.h, z);
                    const br = toIso(bench.x + bench.w, bench.y + bench.h, z);
                    const tl = toIso(bench.x, bench.y, z);
                    const tr = toIso(bench.x + bench.w, bench.y, z);
                    const drop = toIso(bench.x, bench.y, 0).y - toIso(bench.x, bench.y, z).y;

                    ctx.fillStyle = '#451a03'; // legs
                    ctx.fillRect(tl.x - 1, tl.y, 2, drop);
                    ctx.fillRect(tr.x - 1, tr.y, 2, drop);
                    ctx.fillRect(bl.x - 1, bl.y, 2, drop);
                    ctx.fillRect(br.x - 1, br.y, 2, drop);

                    ctx.fillStyle = bench.color; // top
                    ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y); ctx.fill();
                });
            });

            // Buildings
            buildings.forEach(b => {
                obj(b.x + b.w / 2 + b.y + b.h / 2, () => {
                    const topL = toIso(b.x, b.y, b.z);
                    const topR = toIso(b.x + b.w, b.y, b.z);
                    const botR = toIso(b.x + b.w, b.y + b.h, b.z);
                    const botL = toIso(b.x, b.y + b.h, b.z);

                    // Screen Left face
                    ctx.fillStyle = b.colors[2];
                    ctx.beginPath(); ctx.moveTo(topR.x, topR.y); ctx.lineTo(botR.x, botR.y);
                    ctx.lineTo(toIso(b.x + b.w, b.y + b.h, 0).x, toIso(b.x + b.w, b.y + b.h, 0).y);
                    ctx.lineTo(toIso(b.x + b.w, b.y, 0).x, toIso(b.x + b.w, b.y, 0).y); ctx.fill();

                    // Screen Right face
                    ctx.fillStyle = b.colors[1];
                    ctx.beginPath(); ctx.moveTo(botL.x, botL.y); ctx.lineTo(botR.x, botR.y);
                    ctx.lineTo(toIso(b.x + b.w, b.y + b.h, 0).x, toIso(b.x + b.w, b.y + b.h, 0).y);
                    ctx.lineTo(toIso(b.x, b.y + b.h, 0).x, toIso(b.x, b.y + b.h, 0).y); ctx.fill();

                    // Top face
                    ctx.fillStyle = b.colors[0];
                    ctx.beginPath(); ctx.moveTo(topL.x, topL.y); ctx.lineTo(topR.x, topR.y);
                    ctx.lineTo(botR.x, botR.y); ctx.lineTo(botL.x, botL.y); ctx.fill();
                });
            });

            // Home
            const homeW = 60, homeH = 50, homeZ = 50;
            const homeX = 370, homeY = 20;
            obj(homeX + homeW / 2 + homeY + homeH / 2, () => {
                const z = homeZ;
                const topR = toIso(homeX + homeW, homeY, z);
                const botR = toIso(homeX + homeW, homeY + homeH, z);
                const botL = toIso(homeX, homeY + homeH, z);
                const pk = toIso(homeX + homeW / 2, homeY + homeH / 2, z + 25);

                ctx.fillStyle = '#172554';
                ctx.beginPath(); ctx.moveTo(topR.x, topR.y); ctx.lineTo(botR.x, botR.y);
                ctx.lineTo(toIso(homeX + homeW, homeY + homeH, 0).x, toIso(homeX + homeW, homeY + homeH, 0).y);
                ctx.lineTo(toIso(homeX + homeW, homeY, 0).x, toIso(homeX + homeW, homeY, 0).y); ctx.fill();

                ctx.fillStyle = '#1e3a8a';
                ctx.beginPath(); ctx.moveTo(botL.x, botL.y); ctx.lineTo(botR.x, botR.y);
                ctx.lineTo(toIso(homeX + homeW, homeY + homeH, 0).x, toIso(homeX + homeW, homeY + homeH, 0).y);
                ctx.lineTo(toIso(homeX, homeY + homeH, 0).x, toIso(homeX, homeY + homeH, 0).y); ctx.fill();

                ctx.fillStyle = '#2563eb'; ctx.beginPath(); ctx.moveTo(topR.x, topR.y); ctx.lineTo(botR.x, botR.y); ctx.lineTo(pk.x, pk.y); ctx.fill();
                ctx.fillStyle = '#3b82f6'; ctx.beginPath(); ctx.moveTo(botL.x, botL.y); ctx.lineTo(botR.x, botR.y); ctx.lineTo(pk.x, pk.y); ctx.fill();

                // Door (Screen right face)
                ctx.fillStyle = '#60a5fa'; ctx.shadowColor = '#93c5fd'; ctx.shadowBlur = 10;
                const doorTL = toIso(homeX + homeW / 2 - 8, homeY + homeH, 18);
                const doorTR = toIso(homeX + homeW / 2 + 8, homeY + homeH, 18);
                ctx.beginPath(); ctx.moveTo(doorTL.x, doorTL.y); ctx.lineTo(doorTR.x, doorTR.y);
                ctx.lineTo(toIso(homeX + homeW / 2 + 8, homeY + homeH, 0).x, toIso(homeX + homeW / 2 + 8, homeY + homeH, 0).y);
                ctx.lineTo(toIso(homeX + homeW / 2 - 8, homeY + homeH, 0).x, toIso(homeX + homeW / 2 - 8, homeY + homeH, 0).y); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Bakery
            const bakW = 70, bakH = 60, bakZ = 50;
            const bakX = 585, bakY = 270;
            obj(bakX + bakW / 2 + bakY + bakH / 2, () => {
                const z = bakZ;
                const topL = toIso(bakX, bakY, z);
                const topR = toIso(bakX + bakW, bakY, z);
                const botR = toIso(bakX + bakW, bakY + bakH, z);
                const botL = toIso(bakX, bakY + bakH, z);

                // Screen Left Face
                ctx.fillStyle = '#451a03';
                ctx.beginPath(); ctx.moveTo(topR.x, topR.y); ctx.lineTo(botR.x, botR.y);
                ctx.lineTo(toIso(bakX + bakW, bakY + bakH, 0).x, toIso(bakX + bakW, bakY + bakH, 0).y);
                ctx.lineTo(toIso(bakX + bakW, bakY, 0).x, toIso(bakX + bakW, bakY, 0).y); ctx.fill();

                // Screen Right Face
                ctx.fillStyle = '#78350f';
                ctx.beginPath(); ctx.moveTo(botL.x, botL.y); ctx.lineTo(botR.x, botR.y);
                ctx.lineTo(toIso(bakX + bakW, bakY + bakH, 0).x, toIso(bakX + bakW, bakY + bakH, 0).y);
                ctx.lineTo(toIso(bakX, bakY + bakH, 0).x, toIso(bakX, bakY + bakH, 0).y); ctx.fill();

                // Top
                ctx.fillStyle = '#92400e';
                ctx.beginPath(); ctx.moveTo(topL.x, topL.y); ctx.lineTo(topR.x, topR.y);
                ctx.lineTo(botR.x, botR.y); ctx.lineTo(botL.x, botL.y); ctx.fill();

                // Awning on SCREEN LEFT face (X = bakX + bakW)
                const faceX = bakX + bakW;
                for (let i = 0; i < 7; i++) {
                    ctx.fillStyle = i % 2 === 0 ? '#ef4444' : '#fef2f2';
                    const sliceH = bakH / 7;
                    const aTL = toIso(faceX, bakY + i * sliceH, z - 8);
                    const aTR = toIso(faceX, bakY + (i + 1) * sliceH, z - 8);
                    // Protrude out in local X+ direction (Screen Left)
                    const aBR = toIso(faceX + 15, bakY + (i + 1) * sliceH, z - 18);
                    const aBL = toIso(faceX + 15, bakY + i * sliceH, z - 18);
                    ctx.beginPath(); ctx.moveTo(aTL.x, aTL.y); ctx.lineTo(aTR.x, aTR.y);
                    ctx.lineTo(aBR.x, aBR.y); ctx.lineTo(aBL.x, aBL.y); ctx.fill();
                }

                // Window glowing on SCREEN LEFT face
                const wTL = toIso(faceX, bakY + bakH * 0.2, z - 25);
                const wTR = toIso(faceX, bakY + bakH * 0.8, z - 25);
                const wBR = toIso(faceX, bakY + bakH * 0.8, z - 45);
                const wBL = toIso(faceX, bakY + bakH * 0.2, z - 45);
                ctx.fillStyle = '#fef08a'; ctx.shadowColor = '#f59e0b'; ctx.shadowBlur = 20 + Math.sin(frames * 0.08) * 10;
                ctx.beginPath(); ctx.moveTo(wTL.x, wTL.y); ctx.lineTo(wTR.x, wTR.y); ctx.lineTo(wBR.x, wBR.y); ctx.lineTo(wBL.x, wBL.y); ctx.fill();
                ctx.shadowBlur = 0;
            });

            // Trees
            trees.forEach(tree => {
                obj(tree.x + tree.y, () => {
                    const trunkH = 20;
                    const trunk = toIso(tree.x, tree.y, 0);
                    const trunkTop = toIso(tree.x, tree.y, trunkH);
                    const canopy = toIso(tree.x, tree.y, trunkH + tree.size * 0.5);

                    ctx.strokeStyle = '#451a03'; ctx.lineWidth = 4;
                    ctx.beginPath(); ctx.moveTo(trunk.x, trunk.y); ctx.lineTo(trunkTop.x, trunkTop.y); ctx.stroke();
                    ctx.fillStyle = tree.color; ctx.beginPath(); ctx.arc(canopy.x, canopy.y, tree.size * 0.8, 0, Math.PI * 2); ctx.fill();
                    ctx.fillStyle = 'rgba(255,255,255,0.06)'; ctx.beginPath(); ctx.arc(canopy.x - tree.size * 0.2, canopy.y + tree.size * 0.2, tree.size * 0.5, 0, Math.PI * 2); ctx.fill();
                });
            });

            // Street Lights
            streetLights.forEach(light => {
                obj(light.x + light.y, () => {
                    const base = toIso(light.x, light.y, 0);
                    const top = toIso(light.x, light.y, 40);
                    ctx.strokeStyle = '#475569'; ctx.lineWidth = 2;
                    ctx.beginPath(); ctx.moveTo(base.x, base.y); ctx.lineTo(top.x, top.y); ctx.stroke();
                    ctx.fillStyle = '#fef08a'; ctx.beginPath(); ctx.arc(top.x, top.y, 3, 0, Math.PI * 2); ctx.fill();
                });
            });

            // Walker pos
            const currentT = Math.min(t, 1.0);
            const pos = getBezierXY(currentT, mainCurve);
            const isNearBakery = Math.hypot(pos.x - BAKERY.x, pos.y - BAKERY.y) < 140;

            if (frames % 3 === 0) walkerTrail.push({ x: pos.x, y: pos.y, life: 1 });
            walkerTrail.forEach((tr, index) => {
                tr.life -= 0.025;
                if (tr.life <= 0) walkerTrail.splice(index, 1);
                else {
                    obj(tr.x + tr.y, () => {
                        const trPos = toIso(tr.x, tr.y, 2);
                        ctx.beginPath(); ctx.arc(trPos.x, trPos.y, (6 + (1 - tr.life) * 3) * 0.7, 0, Math.PI * 2);
                        ctx.fillStyle = currentPhase.hasDesire ? `rgba(244, 63, 94, ${tr.life * 0.4})` : `rgba(148, 163, 184, ${tr.life * 0.4})`; ctx.fill();
                    });
                }
            });

            const bounce = Math.abs(Math.sin(frames * 0.25)) * 6;
            obj(pos.x + pos.y, () => {
                const wPos = toIso(pos.x, pos.y, bounce + 10);
                const shadow = toIso(pos.x, pos.y, 0);

                ctx.fillStyle = 'rgba(0,0,0,0.4)';
                ctx.beginPath(); ctx.ellipse(shadow.x, shadow.y, 8 - bounce * 0.3, 4 - bounce * 0.15, 0, 0, Math.PI * 2); ctx.fill();

                ctx.fillStyle = currentPhase.hasDesire ? '#F43F5E' : '#94A3B8';
                ctx.shadowColor = currentPhase.hasDesire ? '#FB7185' : 'transparent';
                ctx.shadowBlur = currentPhase.hasDesire ? 15 : 0;
                ctx.beginPath(); ctx.arc(wPos.x, wPos.y, 6, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.arc(wPos.x, wPos.y - 2, 2.5, 0, Math.PI * 2); ctx.fill();
                ctx.shadowBlur = 0;
            });

            if (frames % 5 === 0) {
                // Emit from bakery awning block
                aromaParticles.push({
                    x: bakX + bakW + 12, y: bakY + bakH / 2, z: bakZ + 10,
                    vx: (Math.random() * 2.5) + 0.8, vy: (Math.random() * 1.2) + 0.5,
                    life: 1, size: Math.random() * 12 + 10, spin: Math.random() * Math.PI * 2
                });
            }

            aromaParticles.forEach((p, index) => {
                p.x += p.vx; p.y += p.vy; p.life -= 0.005; p.spin += 0.02; p.vx += Math.sin(frames * 0.02 + p.y) * 0.04;
                if (p.life <= 0) aromaParticles.splice(index, 1);
                else {
                    obj(p.x + p.y, () => {
                        p.z = (p.z || bakZ + 10) + 0.3;
                        const aPos = toIso(p.x, p.y, p.z);
                        ctx.save(); ctx.translate(aPos.x, aPos.y); ctx.rotate(p.spin); ctx.beginPath();
                        ctx.ellipse(0, 0, p.size, p.size * 0.6, 0, 0, Math.PI * 2);
                        ctx.fillStyle = `rgba(251, 191, 36, ${p.life * 0.18})`; ctx.fill(); ctx.restore();
                    });
                }
            });

            if (isNearBakery && frames % (currentPhase.hasDesire ? 20 : 40) === 0) {
                emotionParticles.push({
                    x: pos.x, y: pos.y, z: bounce + 18,
                    vx: currentPhase.hasDesire ? (Math.random() * 1 + 0.5) : (Math.random() * -0.5 - 0.2),
                    vy: Math.random() * -1.5 - 0.5,
                    life: 1, type: currentPhase.hasDesire ? 'desire' : 'indifferent', scale: Math.random() * 0.5 + 0.5
                });
            }

            emotionParticles.forEach((ep, index) => {
                ep.x += ep.vx; ep.y += ep.vy; ep.life -= 0.012;
                if (ep.life <= 0) emotionParticles.splice(index, 1);
                else {
                    obj(ep.x + ep.y, () => {
                        ep.z = (ep.z || 0) + 1;
                        const ePos = toIso(ep.x, ep.y, ep.z + 15);
                        ctx.globalAlpha = ep.life * 0.4;
                        if (ep.type === 'desire') {
                            ctx.save(); ctx.translate(ePos.x, ePos.y); ctx.scale(ep.scale * 0.7, ep.scale * 0.7); ctx.fillStyle = '#FDA4AF';
                            ctx.beginPath(); ctx.moveTo(0, 0); ctx.bezierCurveTo(0, -4, -6, -18, -18, -18);
                            ctx.bezierCurveTo(-36, -18, -36, 6, -36, 6); ctx.bezierCurveTo(-36, 24, -12, 36, 0, 48);
                            ctx.bezierCurveTo(12, 36, 36, 24, 36, 6); ctx.bezierCurveTo(36, 6, 36, -18, 18, -18);
                            ctx.bezierCurveTo(6, -18, 0, -4, 0, 0); ctx.fill(); ctx.restore();
                        } else {
                            ctx.fillStyle = '#64748B'; ctx.beginPath(); ctx.arc(ePos.x, ePos.y, 3 * ep.scale, 0, Math.PI * 2); ctx.fill();
                            ctx.strokeStyle = '#475569'; ctx.lineWidth = 1.5; ctx.beginPath(); ctx.arc(ePos.x, ePos.y, 8 * ep.scale - ep.life * 2, 0, Math.PI * 2); ctx.stroke();
                        }
                        ctx.globalAlpha = 1;
                    });
                }
            });

            // Draw all sorted objects
            renderables.sort((a, b) => a.depth - b.depth).forEach(r => r.draw());

            t += 0.0022;
            if (t >= 1.25) { t = 0; walkerTrail = []; emotionParticles = []; }
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

            <canvas
                ref={canvasRef}
                className={`${styles.canvasEl} ${!isDescriptionOpen ? styles.canvasElFill : ''}`}
            />

            <div className={styles.hudOverlay}>
                <div className={styles.hudHeader}>
                    <Navigation size={18} color="#60a5fa" /> Legend
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
        </div>
    );
};

export default PhaseVisualizer;