// SimulationCanvas.js
// Restored backwards compatibility with parent components via `activeSequence`

import React, { useEffect, useRef } from 'react';
import styles from './SimulationCanvas.module.css';
import { SpiritualStates } from './Timeline';
import { calculateTargets } from './Rules';
import { applyEasing } from './PhysicsMath';
import { drawRootLight, drawEmanations, drawWorldOfAdamKadmon } from './Renderers';
import { getFreshState } from './Schema';

const SimulationCanvas = ({ activeSequence }) => {
    const canvasRef = useRef(null);
    const targetsRef = useRef(getFreshState());

    useEffect(() => {
        // Active sequence directly maps to the rules compiler
        targetsRef.current = calculateTargets(activeSequence, SpiritualStates);
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
            const dpr = window.devicePixelRatio || 1;
            const w = canvas.width / dpr;
            const h = canvas.height / dpr;
            const cx = w / 2;
            const cy = h / 2;

            applyEasing(pState, targetsRef.current, 0.015);

            ctx.globalCompositeOperation = 'source-over';
            ctx.fillStyle = '#000000';
            ctx.fillRect(0, 0, w, h);

            drawRootLight(ctx, cx, cy, w, h, time, pState);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(pState.zoomLevel, pState.zoomLevel);
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