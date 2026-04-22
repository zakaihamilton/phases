// SimulationCanvas.js

import React, { useEffect, useRef } from 'react';
import styles from './SimulationCanvas.module.css';
import { SpiritualStates } from './Timeline';
import { calculateTargets } from './Rules';
import { applyEasing } from './PhysicsMath';
import { drawRootLight, drawEmanations } from './RenderBackground';
import { drawWorldOfAdamKadmon } from './RenderAdamKadmon';
import { getFreshState } from './Schema';

const SimulationCanvas = ({ activeSequence }) => {
    const canvasRef = useRef(null);
    const targetsRef = useRef(getFreshState());

    const prevSeqLenRef = useRef(0);
    const forceSnapRef = useRef(true);

    useEffect(() => {
        targetsRef.current = calculateTargets(activeSequence, SpiritualStates);
        const currentLen = activeSequence ? activeSequence.length : 0;

        if (Math.abs(currentLen - prevSeqLenRef.current) > 1 || prevSeqLenRef.current === 0) {
            forceSnapRef.current = true;
        }
        prevSeqLenRef.current = currentLen;
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

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            drawRootLight(ctx, cx, cy, w, h, time, pState);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(pState.zoomLevel, pState.zoomLevel);

            // --- GLOBE ROTATE EFFECT (YAW) ---
            if (pState.tiltProgress > 0.01) {
                // By compressing only the X-axis, the circles visually rotate to the right like a globe.
                // Because there is no ctx.rotate(), the vertical lines will never skew or tilt upwards!
                ctx.scale(1 - (0.65 * pState.tiltProgress), 1);
            }

            ctx.translate(-cx, -cy);

            const maxR = Math.min(w, h) * 0.35;

            drawEmanations(ctx, cx, cy, time, pState, maxR);
            drawWorldOfAdamKadmon(ctx, cx, cy, pState, maxR, time);

            ctx.restore();
            animationFrameId = requestAnimationFrame(render);
        };

        render();
        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className={styles.root} style={{ width: '100%', height: '100%' }}>
            <canvas ref={canvasRef} className={styles.canvas} style={{ width: '100%', height: '100%', display: 'block' }} />
        </div>
    );
};

export default SimulationCanvas;