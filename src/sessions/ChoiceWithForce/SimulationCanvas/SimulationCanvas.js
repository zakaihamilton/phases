// SimulationCanvas.js

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

            // 1. Cosmic Background is drawn flat
            drawRootLight(ctx, cx, cy, w, h, time, pState);

            ctx.save();
            ctx.translate(cx, cy);
            ctx.scale(pState.zoomLevel, pState.zoomLevel);

            // --- TRUE 2.5D ISOMETRIC TILT ---
            if (pState.tiltProgress > 0.01) {
                // Compress the X-axis to simulate viewing from a side angle
                ctx.scale(1 - (0.35 * pState.tiltProgress), 1);
                // Skew the Y-axis to tilt horizontal lines into 3D space, keeping vertical pillars straight
                ctx.transform(1, 0.15 * pState.tiltProgress, 0, 1, 0, 0);
            }

            ctx.translate(-cx, -cy);

            const maxR = Math.min(w, h) * 0.35;
            
            // The void boundaries tilt into 3D geometric ellipses perfectly
            drawEmanations(ctx, cx, cy, time, pState, maxR);
            
            // The nested layers are drawn
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