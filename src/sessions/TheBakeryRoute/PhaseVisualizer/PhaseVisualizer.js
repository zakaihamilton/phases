import { Navigation } from "lucide-react";
import { useEffect, useRef } from "react";
import { parseColor } from "./isoMath";
import styles from "./PhaseVisualizer.module.css";
import { updateAndQueueCar } from "./renderCar";
import { updateAndQueueParticles } from "./renderParticles";
import { drawGroundLayer, queueWorldRenderables } from "./renderWorld";
import {
  CANVAS_HEIGHT,
  CANVAS_WIDTH,
  createFireflies,
  createGrassTufts,
  createMistPatches,
} from "./sceneData";

const PhaseVisualizer = ({
  phase,
  isExpanded,
  isSuperExpanded,
  isDescriptionOpen,
}) => {
  const canvasRef = useRef(null);
  const phaseRef = useRef(phase);

  // Track the latest phase WITHOUT triggering a hard re-render of the canvas effect below
  useEffect(() => {
    phaseRef.current = phase;
  }, [phase]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    const scale = window.devicePixelRatio || 2;
    canvas.width = CANVAS_WIDTH * scale;
    canvas.height = CANVAS_HEIGHT * scale;
    ctx.scale(scale, scale);

    const grassTufts = createGrassTufts();
    const fireflies = createFireflies();
    const mistPatches = createMistPatches();

    let t = 0;
    let trail = [];
    let aromaParticles = [];
    let emotionParticles = [];
    let frames = 0;
    let lastPhaseId = phaseRef.current.id;

    // Smooth transition trackers
    let currentDesireLevel = phaseRef.current.hasDesire ? 1 : 0;
    let currentDetourLevel = phaseRef.current.hasDetour ? 1 : 0;
    const currentColorRGB = parseColor(phaseRef.current.glowColor);

    const render = () => {
      frames++;
      const currentPhase = phaseRef.current;

      // Trigger reset of car journey if the phase identity changes
      if (currentPhase.id !== lastPhaseId) {
        t = 0;
        trail = [];
        aromaParticles = [];
        emotionParticles = [];
        lastPhaseId = currentPhase.id;
      }

      // Smoothly lerp visual states
      const targetDesire = currentPhase.hasDesire ? 1 : 0;
      currentDesireLevel += (targetDesire - currentDesireLevel) * 0.05;

      const targetDetour = currentPhase.hasDetour ? 1 : 0;
      currentDetourLevel += (targetDetour - currentDetourLevel) * 0.05;

      const targetColorRGB = parseColor(currentPhase.glowColor);
      currentColorRGB[0] += (targetColorRGB[0] - currentColorRGB[0]) * 0.05;
      currentColorRGB[1] += (targetColorRGB[1] - currentColorRGB[1]) * 0.05;
      currentColorRGB[2] += (targetColorRGB[2] - currentColorRGB[2]) * 0.05;

      const bodyColor = `rgb(${Math.round(currentColorRGB[0])}, ${Math.round(currentColorRGB[1])}, ${Math.round(currentColorRGB[2])})`;

      drawGroundLayer(ctx, {
        scale,
        frames,
        grassTufts,
        currentDetourLevel,
        currentDesireLevel,
      });

      // Generate isometric renderables (Z-sorted)
      const renderables = [];
      const obj = (depth, fn) => renderables.push({ depth, draw: fn });

      queueWorldRenderables(obj, ctx, { frames, mistPatches, fireflies });

      const { pos, bounce, isNearBakery } = updateAndQueueCar(obj, ctx, {
        t,
        frames,
        trail,
        currentDesireLevel,
        bodyColor,
      });

      updateAndQueueParticles(obj, ctx, {
        frames,
        currentPhase,
        pos,
        bounce,
        isNearBakery,
        aromaParticles,
        emotionParticles,
      });

      renderables.sort((a, b) => a.depth - b.depth);
      for (const r of renderables) {
        r.draw();
      }

      // T continues looping infinitely, ignoring external state changes
      t += 0.0022;
      if (t >= 1.25) {
        t = 0;
        trail = [];
        emotionParticles = [];
      }
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  const widthClass = isSuperExpanded
    ? styles.canvasMaxWidthSuper
    : isExpanded
      ? styles.canvasMaxWidthExpanded
      : styles.canvasMaxWidthNormal;

  return (
    <div className={`${styles.canvasWrapper} ${widthClass}`}>
      <div
        className={styles.canvasGlow}
        style={{
          background: `radial-gradient(circle at center, ${phase.glowColor} 0%, transparent 70%)`,
          transition: "background 1s ease",
        }}
      />

      <canvas
        ref={canvasRef}
        className={`${styles.canvasEl} ${!isDescriptionOpen ? styles.canvasElFill : ""}`}
      />

      <div className={styles.hudOverlay}>
        <div className={styles.hudHeader}>
          <Navigation size={18} color="#60a5fa" /> Legend
        </div>
        <div className={styles.hudList}>
          <div className={styles.hudRow}>
            <div className={styles.hudRowTitle}>
              <span
                className={`${styles.hudDot} ${phase.hasDetour ? styles.hudDotGreen : styles.hudDotRed}`}
              />
              <span className={styles.hudLabel}>Route Status</span>
            </div>
            <div className={styles.hudValue}>
              {phase.hasDetour
                ? "Alternate path (Choice)"
                : "Only road home (Coerced)"}
            </div>
          </div>
          <div className={styles.hudRow}>
            <div className={styles.hudRowTitle}>
              <span
                className={`${styles.hudDot} ${phase.hasDesire ? styles.hudDotRose : styles.hudDotSlate}`}
              />
              <span className={styles.hudLabel}>Internal State</span>
            </div>
            <div className={styles.hudValue}>
              {phase.hasDesire
                ? "Drawn to scent (Craving)"
                : "Immune to scent (Indifferent)"}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PhaseVisualizer;
