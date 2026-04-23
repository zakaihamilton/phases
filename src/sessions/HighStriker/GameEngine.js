import { towerLevels } from './data';
import { drawEnvironment, drawFlora, drawMidground } from './renderers/EnvironmentRenderer';
import { drawStrikerTower } from './renderers/TowerRenderer';
import { drawCharacter } from './renderers/CharacterRenderer';
import { drawParticles, drawBAM, drawFloatingTexts, drawCinematicEffects } from './renderers/EffectsRenderer';

export default class GameEngine {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d', { alpha: false });
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.isRunning = false;

        this.time = 0;
        this.lastTime = performance.now();

        this.gravity = 1800;
        this.towerHeight = 450;
        this.puckY = 0;
        this.puckVy = 0;
        this.puckTrail = [];

        this.hammerAngle = Math.PI * 0.8;
        this.padScaleY = 1.0;

        this.impactParticles = [];
        this.shockwaves = [];
        this.shake = 0;
        this.bamScale = 0;
        this.flashAlpha = 0;
        this.requestId = null;
        this.baseScale = 1.0;
        this.floatingTexts = [];

        this.reachedLevels = new Set();
        this.currentActiveLevel = -1;
        this.activeTargetLevel = -1;

        this.blinkTimer = 2.0;
        this.eyeLookX = 0;
        this.eyeLookY = 0;
        this.eyeTargetX = 0;
        this.eyeTargetY = 0;

        this.animState = 'IDLE';
        this.timeScale = 1.0;
        this.vignetteIntensity = 0;
        this.targetPuckRatio = 0;
        this.animCallback = null;
        this.windupTimer = 0;
        this.swingTimer = 0;

        this.purificationStep = 0;
        this.displayStep = 0;
        this.levelWidth = 4000;

        this.clouds = Array.from({ length: 15 }, () => ({
            x: Math.random() * this.levelWidth, y: Math.random() * 250,
            s: 0.5 + Math.random() * 1.5, v: 10 + Math.random() * 20
        }));

        this.balloons = Array.from({ length: 8 }, (_, i) => ({
            x: 100 + i * 300 + Math.random() * 200, y: Math.random() * 300 + 50,
            offset: Math.random() * Math.PI * 2, color: ['#ff4757', '#1e90ff', '#f1c40f', '#2ed573', '#9b59b6'][i % 5]
        }));

        this.grass = Array.from({ length: 400 }, (_, i) => ({
            x: i * 10, h: 8 + Math.random() * 16, off: Math.random() * Math.PI * 2
        }));

        this.pedestrians = Array.from({ length: 15 }, () => ({
            x: Math.random() * 3000,
            y: 0,
            v: (Math.random() > 0.5 ? 1 : -1) * (15 + Math.random() * 25),
            color: ['#ff9f43', '#ee5253', '#0abde3', '#10ac84', '#5f27cd', '#222f3e'][Math.floor(Math.random() * 6)],
            scale: 0.35 + Math.random() * 0.25,
            off: Math.random() * Math.PI * 2
        }));

        this.trees = Array.from({ length: 12 }, (_, i) => ({
            x: Math.random() * this.levelWidth, s: 0.6 + Math.random() * 0.5, type: Math.random() > 0.5 ? 1 : 2
        }));

        this.flowers = Array.from({ length: 80 }, () => ({
            x: Math.random() * this.levelWidth,
            color: ['#ff9ff3', '#feca57', '#ff6b6b', '#48dbfb'][Math.floor(Math.random() * 4)],
            h: 10 + Math.random() * 10
        }));

        this.birds = Array.from({ length: 12 }, () => ({
            x: Math.random() * this.levelWidth, y: 50 + Math.random() * 250,
            speed: 30 + Math.random() * 50, off: Math.random() * 10, scale: 0.4 + Math.random() * 0.6
        }));

        this.confetti = [];

        this.resize = this.resize.bind(this);
        window.addEventListener('resize', this.resize);
        this.resize();
    }

    resize() {
        this.width = window.innerWidth;
        this.height = window.innerHeight;
        this.canvas.width = this.width * window.devicePixelRatio;
        this.canvas.height = this.height * window.devicePixelRatio;
        this.ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

        if (this.width < 900) {
            this.baseScale = Math.max(0.35, this.width / 1100);
        } else {
            this.baseScale = 1.0;
        }
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
        window.removeEventListener('resize', this.resize);
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
        this.puckTrail = [];

        if (command === 'WINDUP' || command === 'WINDING_FULL' || command === 'RESET_IDLE' || command === 'CONCLUSION') {
            this.reachedLevels.clear();
            this.currentActiveLevel = -1;
        }

        if (command === 'WINDUP') {
            this.animState = 'WINDING';
        }
        else if (command === 'SWING_IMPACT') {
            this.animState = 'SWINGING';
        }
        else if (command === 'SHOOT') {
            this.targetPuckRatio = powerRatio;
            this.triggerLaunch(powerRatio);
        }
        else if (command === 'FULL_HIT') {
            this.targetPuckRatio = powerRatio;
            this.animState = 'WINDING_FULL';
        }
        else if (command === 'RESET_IDLE') {
            this.hammerAngle = Math.PI * 0.8;
            this.animState = 'IDLE';
            if (this.animCallback) this.animCallback();
        }
        else if (command === 'CONCLUSION') {
            this.activeTargetLevel = -1;
            this.currentActiveLevel = -1;
            this.hammerAngle = Math.PI * 0.8;
            this.animState = 'IDLE';
            if (this.animCallback) this.animCallback();
        }
    }

    triggerLaunch(ratio) {
        const targetHeight = this.towerHeight * ratio;
        this.puckVy = Math.sqrt(2 * this.gravity * targetHeight);
        this.animState = 'RISING';
    }

    spawnImpact() {
        const colors = this.interpolatePhaseColors(this.displayStep);
        this.shake = 12;
        this.timeScale = 0.2;
        this.vignetteIntensity = 0.8;
        this.padScaleY = 0.8;
        this.bamScale = 1.2;
        this.flashAlpha = 0.6;
        this.flashColor = colors.light;
        this.shockwaves.push({ r: 10, alpha: 1.0, width: 20 });
        this.floatingTexts.push({
            x: this.width / 2 - 100,
            y: this.height - 250,
            text: 'CLANG!',
            life: 1.0,
            color: '#ff4757'
        });
        this.shockwaves.push({ r: 5, alpha: 0.8, width: 10 });

        for (let i = 0; i < 100; i++) {
            const ang = Math.random() * Math.PI * 2;
            const vel = 300 + Math.random() * 1200;
            this.impactParticles.push({
                x: this.width / 2 - 90,
                y: this.height - 120,
                vx: Math.cos(ang) * vel,
                vy: -Math.abs(Math.sin(ang) * vel) - 200,
                life: 1.2 + Math.random() * 0.8,
                size: 4 + Math.random() * 8,
                color: ['#ff9f43', '#feca57', '#fff', '#ff4757', '#00d2d3'][Math.floor(Math.random() * 5)],
                type: Math.random() > 0.5 ? 'star' : 'circle',
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 10
            });
        }
    }

    spawnConfetti() {
        for (let i = 0; i < 150; i++) {
            this.confetti.push({
                x: Math.random() * this.width,
                y: Math.random() * (this.height * 0.5),
                vx: (Math.random() - 0.5) * 300,
                vy: 100 + Math.random() * 300,
                rot: Math.random() * Math.PI * 2,
                vrot: (Math.random() - 0.5) * 10,
                size: 8 + Math.random() * 10,
                color: ['#ff4757', '#2ed573', '#1e90ff', '#feca57', '#ff9ff3'][Math.floor(Math.random() * 5)]
            });
        }
    }

    spawnLevelBurst(ratio) {
        const baseX = this.width / 2 - 90;
        const baseY = this.height - 110;
        const y = baseY - (this.towerHeight * ratio);

        for (let i = 0; i < 25; i++) {
            this.impactParticles.push({
                x: baseX - 24,
                y: y,
                vx: (Math.random() - 0.5) * 700,
                vy: (Math.random() - 0.5) * 700,
                life: 0.6 + Math.random() * 0.4,
                color: Math.random() > 0.5 ? '#00d2d3' : '#f1c40f'
            });
        }
    }

    update(rawDt) {
        const dt = rawDt * this.timeScale;
        this.timeScale += (1.0 - this.timeScale) * rawDt * 5;

        if (this.vignetteIntensity > 0) {
            this.vignetteIntensity -= rawDt * 1.5;
            if (this.vignetteIntensity < 0) this.vignetteIntensity = 0;
        }

        this.time += dt;

        this.blinkTimer -= dt;
        if (this.blinkTimer < -0.15) {
            this.blinkTimer = 2 + Math.random() * 4;
        }

        if (this.puckY > 10) {
            this.eyeTargetX = -2;
            this.eyeTargetY = -3;
        } else if (this.animState === 'SWINGING' || this.animState === 'SWINGING_FULL') {
            this.eyeTargetX = -3;
            this.eyeTargetY = 2;
        } else if (this.animState === 'WINDING' || this.animState === 'WINDING_FULL') {
            this.eyeTargetX = 2;
            this.eyeTargetY = -1;
        } else {
            if (this.time % 3 < 0.02) {
                this.eyeTargetX = (Math.random() - 0.5) * 3;
                this.eyeTargetY = (Math.random() - 0.5) * 3;
            }
        }
        this.eyeLookX += (this.eyeTargetX - this.eyeLookX) * dt * 8;
        this.eyeLookY += (this.eyeTargetY - this.eyeLookY) * dt * 8;

        if (this.shake > 0) this.shake -= rawDt * 45;
        if (this.shake < 0) this.shake = 0;

        if (this.padScaleY < 1.0) {
            this.padScaleY += dt * 6;
            if (this.padScaleY > 1.0) this.padScaleY = 1.0;
        }

        this.floatingTexts.forEach((t, i) => {
            t.y -= dt * 50;
            t.life -= dt;
            if (t.life <= 0) this.floatingTexts.splice(i, 1);
        });

        if (this.bamScale > 0) {
            this.bamScale += dt * 3.0;
            if (this.bamScale > 2.0) this.bamScale = 0;
        }

        if (this.flashAlpha > 0) {
            this.flashAlpha -= dt * 3;
            if (this.flashAlpha < 0) this.flashAlpha = 0;
        }

        if (this.puckY > 0) {
            let highest = -1;
            towerLevels.forEach(l => {
                if ((this.puckY / this.towerHeight) >= l.ratio - 0.02) {
                    highest = Math.max(highest, l.id);
                    if (!this.reachedLevels.has(l.id)) {
                        this.reachedLevels.add(l.id);
                        this.spawnLevelBurst(l.ratio);
                    }
                }
            });
            this.currentActiveLevel = highest;
        } else if (this.animState === 'IDLE' || this.animState === 'WINDING' || this.animState === 'WINDING_FULL') {
            this.currentActiveLevel = -1;
        }

        this.impactParticles.forEach(p => {
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.vy += (this.gravity * 0.5) * dt;
            p.life -= dt * 1.0;
            if (p.rot !== undefined) p.rot += p.vrot * dt;
        });
        this.impactParticles = this.impactParticles.filter(p => p.life > 0);

        this.confetti.forEach(c => {
            c.x += c.vx * dt + Math.sin(this.time * 2 + c.y * 0.01) * 50 * dt;
            c.y += c.vy * dt;
            c.rot += c.vrot * dt;
        });
        this.confetti = this.confetti.filter(c => c.y < this.height + 50);

        this.shockwaves.forEach(s => {
            s.r += dt * 800;
            s.alpha -= dt * 2.5;
        });
        this.shockwaves = this.shockwaves.filter(s => s.alpha > 0);

        if (this.puckY > 5 || this.puckVy > 0) {
            this.puckTrail.push({ y: this.puckY, life: 1.0 });
        }
        this.puckTrail.forEach(t => t.life -= dt * 4);
        this.puckTrail = this.puckTrail.filter(t => t.life > 0);

        this.clouds.forEach(c => {
            c.x += c.v * dt;
            if (c.x > this.width + 200) c.x = -200;
        });

        this.pedestrians.forEach(p => {
            p.x += p.v * dt;
            if (p.x > 3000) p.x = -100;
            if (p.x < -100) p.x = 3000;
        });

        this.birds.forEach(b => {
            b.x -= b.speed * dt;
            if (b.x < -100) b.x = this.width + 100;
        });

        const REST_ANGLE = Math.PI * 0.8;
        const WINDUP_ANGLE = Math.PI * 1.95;
        const STRIKE_ANGLE = Math.PI * 0.85;

        if (this.animState === 'WINDING' || this.animState === 'WINDING_FULL') {
            this.windupTimer += dt;
            const progress = Math.min(this.windupTimer / 0.8, 1.0);
            const ease = progress < 0.5 ? 2 * progress * progress : -1 + (4 - 2 * progress) * progress;
            this.hammerAngle = REST_ANGLE + (WINDUP_ANGLE - REST_ANGLE) * ease;

            if (progress >= 1.0) {
                if (this.animState === 'WINDING_FULL') {
                    this.animState = 'SWINGING_FULL';
                    this.swingTimer = 0;
                } else {
                    this.animState = 'WINDUP_HOLD';
                    if (this.animCallback) { this.animCallback(); this.animCallback = null; }
                }
            }
        }
        else if (this.animState === 'SWINGING' || this.animState === 'SWINGING_FULL') {
            this.swingTimer += dt;
            const progress = Math.min(this.swingTimer / 0.2, 1.0);
            const ease = 1 - Math.pow(1 - progress, 4);
            this.hammerAngle = WINDUP_ANGLE + (STRIKE_ANGLE - WINDUP_ANGLE) * ease;

            if (progress >= 1.0) {
                this.spawnImpact();
                if (this.animState === 'SWINGING_FULL') {
                    this.triggerLaunch(this.targetPuckRatio);
                } else {
                    this.animState = 'IMPACT_HOLD';
                    if (this.animCallback) { this.animCallback(); this.animCallback = null; }
                }
            }
        }
        else if (this.animState === 'RISING') {
            this.puckY += this.puckVy * dt;
            this.puckVy -= this.gravity * dt;
            if (this.puckVy <= 0) {
                this.animState = 'FALLING';
                if (this.targetPuckRatio >= 0.95) {
                    this.shake = 0;
                    this.shockwaves.push({ r: 20, alpha: 1.0, isBell: true, width: 40 });
                    this.spawnConfetti();
                }
            }
        }
        else if (this.animState === 'FALLING') {
            this.puckY += this.puckVy * dt;
            this.puckVy -= this.gravity * dt;
            if (this.puckY <= 0) {
                this.puckY = 0;
                this.puckVy = 0;
                this.animState = 'IDLE';
                this.currentActiveLevel = 0;
                if (this.animCallback) { this.animCallback(); this.animCallback = null; }
            }
        }
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
            { main: [25, 111, 61], light: [46, 204, 113], dark: [20, 90, 50] },    // Phase 4 (Crown) - Green
            { main: [148, 49, 38], light: [231, 76, 60], dark: [123, 36, 28] },   // Phase 3 (Wisdom) - Red
            { main: [31, 97, 141], light: [52, 152, 219], dark: [26, 82, 118] },  // Phase 2 (Understanding) - Blue
            { main: [183, 149, 11], light: [241, 196, 15], dark: [154, 125, 10] }, // Phase 1 (Small Face) - Gold
            { main: [52, 73, 94], light: [127, 140, 141], dark: [44, 62, 80] }    // Root (Kingdom) - Gray
        ];

        const idx1 = Math.floor(step);
        const idx2 = Math.min(idx1 + 1, colors.length - 1);
        const t = step - idx1;

        const lerp = (c1, c2, t) => Math.round(c1 + (c2 - c1) * t);
        const lerpColor = (col1, col2, t) => `rgb(${lerp(col1[0], col2[0], t)}, ${lerp(col1[1], col2[1], t)}, ${lerp(col1[2], col2[2], t)})`;

        return {
            main: lerpColor(colors[idx1].main, colors[idx2].main, t),
            light: lerpColor(colors[idx1].light, colors[idx2].light, t),
            dark: lerpColor(colors[idx1].dark, colors[idx2].dark, t)
        };
    }

    draw() {
        const ctx = this.ctx;

        ctx.clearRect(0, 0, this.width, this.height);

        ctx.save();
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }

        ctx.fillStyle = '#81ecec';
        ctx.fillRect(-200, -200, this.width + 400, this.height + 400);

        drawEnvironment(ctx, this);
        drawFlora(ctx, this);

        ctx.save();
        ctx.translate(this.width / 2, this.height * 0.6);
        ctx.scale(this.baseScale, this.baseScale);
        ctx.translate(-this.width / 2, -this.height * 0.6);

        drawMidground(ctx, this);
        drawStrikerTower(ctx, this);
        drawCharacter(ctx, this);
        drawParticles(ctx, this);
        drawFloatingTexts(ctx, this);
        drawBAM(ctx, this);
        ctx.restore();

        ctx.restore();

        drawCinematicEffects(ctx, this);

        if (this.flashAlpha > 0) {
            ctx.fillStyle = this.flashColor || `rgba(255, 255, 255, ${this.flashAlpha})`;
            if (!this.flashColor) ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
            else {
                ctx.globalAlpha = this.flashAlpha;
                ctx.fillRect(0, 0, this.width, this.height);
                ctx.globalAlpha = 1.0;
            }
            if (!this.flashColor) ctx.fillRect(0, 0, this.width, this.height);
        }
    }
}