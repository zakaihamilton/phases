// SimulationCanvas.js

import React, { useEffect, useRef, useState } from 'react';
import styles from './SimulationCanvas.module.css';
import { SpiritualStates } from './Timeline';
import { calculateTargets } from './Rules';
import { applyEasing } from './PhysicsMath';
import { drawRootLight, drawEmanations } from './RenderBackground';
import { drawWorldOfAdamKadmon } from './RenderAdamKadmon';
import { getFreshState } from './Schema';

const SimulationCanvas = ({ activeSequence = SpiritualStates }) => {
    const canvasRef = useRef(null);
    const targetsRef = useRef(getFreshState());
    const prevIndexRef = useRef(-1);
    const forceSnapRef = useRef(true);

    const [errorMsg, setErrorMsg] = useState(null);

    useEffect(() => {
        try {
            targetsRef.current = calculateTargets(activeSequence, SpiritualStates);

            const currentStep = activeSequence && activeSequence.length > 0 ? activeSequence[activeSequence.length - 1] : null;
            let absoluteIndex = currentStep ? SpiritualStates.findIndex(t => t.action === currentStep.action) : -1;
            if (absoluteIndex === -1) absoluteIndex = activeSequence ? activeSequence.length : 0;

            if (absoluteIndex === 0 || Math.abs(absoluteIndex - prevIndexRef.current) > 1) {
                forceSnapRef.current = true;
            }
            prevIndexRef.current = absoluteIndex;
        } catch (err) {
            setErrorMsg("Target Calc Error: " + err.message);
        }
    }, [activeSequence]);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
        let time = 0;

        const pState = getFreshState();

        const resize = () => {
            const dpr = window.devicePixelRatio || 1;
            const rect = canvas.parentElement.getBoundingClientRect();
            canvas.width = rect.width * dpr;
            canvas.height = rect.height * dpr;
            ctx.scale(dpr, dpr);
        };

        window.addEventListener('resize', resize);
        resize();

        const render = () => {
            try {
                time += 0.01;

                if (forceSnapRef.current) {
                    Object.assign(pState, JSON.parse(JSON.stringify(targetsRef.current)));
                    forceSnapRef.current = false;
                } else {
                    applyEasing(pState, targetsRef.current, 0.015);
                }

                const dpr = window.devicePixelRatio || 1;
                const w = canvas.width / dpr;
                const h = canvas.height / dpr;
                const cx = w / 2;
                const cy = h / 2;
                const maxR = Math.min(w, h) * 0.35;

                ctx.globalCompositeOperation = 'source-over';
                ctx.fillStyle = '#000000';
                ctx.fillRect(0, 0, w, h);

                drawRootLight(ctx, cx, cy, w, h, time, pState);

                // --- 1. DRAW BACKGROUND FLOOR (ISOMETRIC ROTATION) ---
                ctx.save();
                ctx.translate(cx, cy);
                ctx.scale(pState.zoomLevel || 1, pState.zoomLevel || 1);

                if (pState.tiltProgress > 0.01) {
                    // Squash Y-axis and Rotate: This creates a perfect tilted 3D Floor!
                    ctx.scale(1, 1 - (0.55 * pState.tiltProgress));
                    ctx.rotate(-0.60 * pState.tiltProgress);
                }

                ctx.translate(-cx, -cy);
                drawEmanations(ctx, cx, cy, time, pState, maxR);
                ctx.restore(); // RESET CANVAS TO FLAT!


                // --- 2. DRAW 3D PIPES (STRAIGHT VERTICAL) ---
                ctx.save();
                ctx.translate(cx, cy);
                ctx.scale(pState.zoomLevel || 1, pState.zoomLevel || 1);
                ctx.translate(-cx, -cy);
                // Because the canvas is restored, the pipes draw perfectly straight UP without skewing!
                drawWorldOfAdamKadmon(ctx, cx, cy, pState, maxR, time);
                ctx.restore();

            } catch (err) {
                setErrorMsg("RENDER CRASH: " + err.message);
                return;
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
        <div className={styles.root} style={{ width: '100%', height: '100%', position: 'relative' }}>
            <canvas ref={canvasRef} className={styles.canvas} style={{ width: '100%', height: '100%', display: 'block' }} />

            {errorMsg && (
                <div style={{
                    position: 'absolute', top: 10, left: 10, zIndex: 9999,
                    backgroundColor: 'rgba(0, 0, 0, 0.85)', color: '#FF0000',
                    border: '1px solid #FF0000', padding: '15px', fontFamily: 'monospace'
                }}>
                    {errorMsg}
                </div>
            )}
        </div>
    );
};

export default SimulationCanvas;