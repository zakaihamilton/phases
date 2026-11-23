import { towerLevels } from "./data";
import {
  createAmbientEntities,
  updateAmbientEntities,
} from "./entities/AmbientEntities";
import { drawCharacter } from "./renderers/CharacterRenderer";
import {
  drawBAM,
  drawCinematicEffects,
  drawFlash,
  drawFloatingTexts,
  drawParticles,
  drawPuckTrail,
  drawShockwaves,
  drawSpeedLines,
} from "./renderers/EffectsRenderer";
import {
  drawEnvironment,
  drawFlora,
  drawMidground,
} from "./renderers/EnvironmentRenderer";
import { drawStrikerTower } from "./renderers/TowerRenderer";
import ParticleSystem from "./systems/ParticleSystem";

const REST_ANGLE = Math.PI * 0.8;
const WINDUP_ANGLE = Math.PI * 1.95;
const STRIKE_ANGLE = Math.PI * 0.85;

export default class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d", { alpha: false });
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.isRunning = false;

    this.time = 0;
    this.lastTime = performance.now();

    this.gravity = 1800;
    this.towerHeight = 450;
    this.puckY = 0;
    this.puckVy = 0;

    this.hammerAngle = REST_ANGLE;
    this.padScaleY = 1.0;

    this.shake = 0;
    this.bamScale = 0;
    this.flashAlpha = 0;
    this.requestId = null;
    this.baseScale = 1.0;
    this.zoomLevel = 1.0;
    this.targetZoomLevel = 1.0;

    this.reachedLevels = new Set();
    this.currentActiveLevel = -1;
    this.activeTargetLevel = -1;

    this.blinkTimer = 2.0;
    this.eyeLookX = 0;
    this.eyeLookY = 0;
    this.eyeTargetX = 0;
    this.eyeTargetY = 0;

    this.animState = "IDLE";
    this.timeScale = 1.0;
    this.vignetteIntensity = 0;
    this.targetPuckRatio = 0;
    this.animCallback = null;
    this.windupTimer = 0;
    this.swingTimer = 0;

    this.purificationStep = 0;
    this.displayStep = 0;
    this.levelWidth = 4000;

    this.particleSystem = new ParticleSystem();
    Object.assign(this, createAmbientEntities(this.levelWidth));

    this.resize = this.resize.bind(this);
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  get impactParticles() {
    return this.particleSystem.impactParticles;
  }

  get shockwaves() {
    return this.particleSystem.shockwaves;
  }

  get floatingTexts() {
    return this.particleSystem.floatingTexts;
  }

  get puckTrail() {
    return this.particleSystem.puckTrail;
  }

  get confetti() {
    return this.particleSystem.confetti;
  }

  resize() {
    this.width = window.innerWidth;
    this.height = window.innerHeight;
    this.canvas.width = this.width * window.devicePixelRatio;
    this.canvas.height = this.height * window.devicePixelRatio;
    this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

    this.baseScale = this.width < 900 ? Math.max(0.35, this.width / 1100) : 1.0;
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.lastTime = performance.now();
      this.loop();
    }
  }

  stop() {
    this.isRunning = false;
    window.removeEventListener("resize", this.resize);
    if (this.requestId) {
      cancelAnimationFrame(this.requestId);
      this.requestId = null;
    }
  }

  playSequence(command, powerRatio, onComplete) {
    this.animCallback = onComplete;

    this.windupTimer = 0;
    this.swingTimer = 0;
    this.puckY = 0;
    this.puckVy = 0;
    this.particleSystem.resetTrail();

    if (
      command === "WINDUP" ||
      command === "WINDING_FULL" ||
      command === "RESET_IDLE" ||
      command === "CONCLUSION"
    ) {
      this.reachedLevels.clear();
      this.currentActiveLevel = -1;
    }

    if (command === "WINDUP") {
      this.animState = "WINDING";
    } else if (command === "SWING_IMPACT") {
      this.animState = "SWINGING";
    } else if (command === "SHOOT") {
      this.targetPuckRatio = powerRatio;
      this.triggerLaunch(powerRatio);
    } else if (command === "FULL_HIT") {
      this.targetPuckRatio = powerRatio;
      this.animState = "WINDING_FULL";
    } else if (command === "RESET_IDLE") {
      this.hammerAngle = REST_ANGLE;
      this.animState = "IDLE";
      if (this.animCallback) this.animCallback();
    } else if (command === "CONCLUSION") {
      this.activeTargetLevel = -1;
      this.currentActiveLevel = -1;
      this.hammerAngle = REST_ANGLE;
      this.animState = "IDLE";
      if (this.animCallback) this.animCallback();
    }
  }

  triggerLaunch(ratio) {
    const targetHeight = this.towerHeight * ratio;
    this.puckVy = Math.sqrt(2 * this.gravity * targetHeight);
    this.animState = "RISING";
  }

  spawnImpact() {
    const colors = this.interpolatePhaseColors(this.displayStep);
    this.shake = 20;
    this.timeScale = 0.15;
    this.vignetteIntensity = 1.0;
    this.padScaleY = 0.75;
    this.bamScale = 1.0;
    this.flashAlpha = 0.8;
    this.targetZoomLevel = 1.15;
    this.flashColor = colors.light;
    this.particleSystem.spawnImpactBurst(this.width, this.height);
  }

  spawnConfetti() {
    this.particleSystem.spawnConfetti(this.width, this.height);
  }

  spawnLevelBurst(ratio) {
    this.particleSystem.spawnLevelBurst(
      this.width,
      this.height,
      this.towerHeight,
      ratio,
    );
  }

  updateCameraAndEyes(dt, rawDt) {
    this.timeScale += (1.0 - this.timeScale) * rawDt * 4;

    if (this.vignetteIntensity > 0) {
      this.vignetteIntensity = Math.max(
        0,
        this.vignetteIntensity - rawDt * 1.2,
      );
    }

    this.zoomLevel += (this.targetZoomLevel - this.zoomLevel) * rawDt * 6;
    if (
      this.animState === "IDLE" ||
      this.animState === "RISING" ||
      this.animState === "FALLING"
    ) {
      this.targetZoomLevel = 1.0;
    }

    this.time += dt;

    this.blinkTimer -= dt;
    if (this.blinkTimer < -0.15) {
      this.blinkTimer = 2 + Math.random() * 4;
    }

    if (this.puckY > 10) {
      this.eyeTargetX = -2;
      this.eyeTargetY = -3;
    } else if (
      this.animState === "SWINGING" ||
      this.animState === "SWINGING_FULL"
    ) {
      this.eyeTargetX = -3;
      this.eyeTargetY = 2;
    } else if (
      this.animState === "WINDING" ||
      this.animState === "WINDING_FULL"
    ) {
      this.eyeTargetX = 2;
      this.eyeTargetY = -1;
    } else if (this.time % 3 < 0.02) {
      this.eyeTargetX = (Math.random() - 0.5) * 3;
      this.eyeTargetY = (Math.random() - 0.5) * 3;
    }
    this.eyeLookX += (this.eyeTargetX - this.eyeLookX) * dt * 8;
    this.eyeLookY += (this.eyeTargetY - this.eyeLookY) * dt * 8;

    if (this.shake > 0) this.shake = Math.max(0, this.shake - rawDt * 50);
    if (this.padScaleY < 1.0)
      this.padScaleY = Math.min(1.0, this.padScaleY + dt * 5);

    if (this.bamScale > 0) {
      this.bamScale += dt * 3.5;
      if (this.bamScale > 2.5) this.bamScale = 0;
    }

    if (this.flashAlpha > 0) {
      this.flashAlpha = Math.max(0, this.flashAlpha - dt * 2.5);
    }
  }

  updateTowerLevels() {
    if (this.puckY > 0) {
      let highest = -1;
      for (const l of towerLevels) {
        if (this.puckY / this.towerHeight >= l.ratio - 0.02) {
          highest = Math.max(highest, l.id);
          if (!this.reachedLevels.has(l.id)) {
            this.reachedLevels.add(l.id);
            this.spawnLevelBurst(l.ratio);
          }
        }
      }
      this.currentActiveLevel = highest;
    } else if (
      this.animState === "IDLE" ||
      this.animState === "WINDING" ||
      this.animState === "WINDING_FULL"
    ) {
      this.currentActiveLevel = -1;
    }
  }

  updateStateMachine(dt) {
    if (this.animState === "WINDING" || this.animState === "WINDING_FULL") {
      this.windupTimer += dt;
      const progress = Math.min(this.windupTimer / 0.8, 1.0);
      const ease =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress;
      this.hammerAngle = REST_ANGLE + (WINDUP_ANGLE - REST_ANGLE) * ease;

      if (progress >= 1.0) {
        if (this.animState === "WINDING_FULL") {
          this.animState = "SWINGING_FULL";
          this.swingTimer = 0;
        } else {
          this.animState = "WINDUP_HOLD";
          if (this.animCallback) {
            this.animCallback();
            this.animCallback = null;
          }
        }
      }
    } else if (
      this.animState === "SWINGING" ||
      this.animState === "SWINGING_FULL"
    ) {
      this.swingTimer += dt;
      const progress = Math.min(this.swingTimer / 0.2, 1.0);
      const ease = 1 - (1 - progress) ** 4;
      this.hammerAngle = WINDUP_ANGLE + (STRIKE_ANGLE - WINDUP_ANGLE) * ease;

      if (progress >= 1.0) {
        this.spawnImpact();
        if (this.animState === "SWINGING_FULL") {
          this.triggerLaunch(this.targetPuckRatio);
        } else {
          this.animState = "IMPACT_HOLD";
          if (this.animCallback) {
            this.animCallback();
            this.animCallback = null;
          }
        }
      }
    } else if (this.animState === "RISING") {
      this.puckY += this.puckVy * dt;
      this.puckVy -= this.gravity * dt;
      if (this.puckVy <= 0) {
        this.animState = "FALLING";

        // Cinematic slow-mo at peak
        if (this.targetPuckRatio > 0.6) {
          this.timeScale = 0.3;
        }

        if (this.targetPuckRatio >= 0.95) {
          this.shake = 8;
          this.vignetteIntensity = 0.5;
          this.particleSystem.spawnBellShockwave();
          this.spawnConfetti();
        }
      }
    } else if (this.animState === "FALLING") {
      this.puckY += this.puckVy * dt;
      this.puckVy -= this.gravity * dt;
      if (this.puckY <= 0) {
        this.puckY = 0;
        this.puckVy = 0;
        this.animState = "IDLE";
        this.currentActiveLevel = 0;
        if (this.animCallback) {
          this.animCallback();
          this.animCallback = null;
        }
      }
    }
  }

  update(rawDt) {
    const dt = rawDt * this.timeScale;
    this.updateCameraAndEyes(dt, rawDt);
    this.updateTowerLevels();
    this.particleSystem.update(dt, {
      time: this.time,
      gravity: this.gravity,
      height: this.height,
      puckY: this.puckY,
      puckVy: this.puckVy,
    });
    updateAmbientEntities(this, dt, this.width);
    this.updateStateMachine(dt);
  }

  loop() {
    if (!this.isRunning) return;
    const now = performance.now();
    const dt = Math.min((now - this.lastTime) / 1000, 0.05);
    this.lastTime = now;

    this.update(dt);
    this.draw();

    const stepTarget = this.purificationStep;
    const stepDiff = stepTarget - this.displayStep;
    if (Math.abs(stepDiff) > 0.001) {
      this.displayStep += stepDiff * Math.min(dt * 5, 1.0);
    } else {
      this.displayStep = stepTarget;
    }

    this.requestId = requestAnimationFrame(() => this.loop());
  }

  interpolatePhaseColors(step) {
    const colors = [
      { main: [25, 111, 61], light: [46, 204, 113], dark: [20, 90, 50] },
      { main: [148, 49, 38], light: [231, 76, 60], dark: [123, 36, 28] },
      { main: [31, 97, 141], light: [52, 152, 219], dark: [26, 82, 118] },
      { main: [183, 149, 11], light: [241, 196, 15], dark: [154, 125, 10] },
      { main: [52, 73, 94], light: [127, 140, 141], dark: [44, 62, 80] },
    ];

    const idx1 = Math.floor(step);
    const idx2 = Math.min(idx1 + 1, colors.length - 1);
    const t = step - idx1;

    const lerp = (c1, c2, ratio) => Math.round(c1 + (c2 - c1) * ratio);
    const lerpColor = (col1, col2, ratio) =>
      `rgb(${lerp(col1[0], col2[0], ratio)}, ${lerp(col1[1], col2[1], ratio)}, ${lerp(col1[2], col2[2], ratio)})`;

    return {
      main: lerpColor(colors[idx1].main, colors[idx2].main, t),
      light: lerpColor(colors[idx1].light, colors[idx2].light, t),
      dark: lerpColor(colors[idx1].dark, colors[idx2].dark, t),
    };
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.width, this.height);

    ctx.save();

    // --- World Space Scaling & Zoom ---
    const zoomX = this.width / 2;
    const zoomY = this.height * 0.7;
    ctx.translate(zoomX, zoomY);
    ctx.scale(this.zoomLevel, this.zoomLevel);
    ctx.translate(-zoomX, -zoomY);

    if (this.shake > 0) {
      ctx.translate(
        (Math.random() - 0.5) * this.shake,
        (Math.random() - 0.5) * this.shake,
      );
    }

    ctx.fillStyle = "#81ecec";
    ctx.fillRect(-200, -200, this.width + 400, this.height + 400);

    drawEnvironment(ctx, this);
    drawFlora(ctx, this);

    ctx.save();
    ctx.translate(this.width / 2, this.height * 0.6);
    ctx.scale(this.baseScale, this.baseScale);
    ctx.translate(-this.width / 2, -this.height * 0.6);

    drawMidground(ctx, this);
    drawShockwaves(ctx, this);
    drawPuckTrail(ctx, this);
    drawStrikerTower(ctx, this);
    drawCharacter(ctx, this);
    drawParticles(ctx, this);
    drawFloatingTexts(ctx, this);
    drawBAM(ctx, this);
    ctx.restore();

    ctx.restore();

    drawSpeedLines(ctx, this);
    drawCinematicEffects(ctx, this);
    drawFlash(ctx, this);
  }
}
