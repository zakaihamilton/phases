import { towerLevels } from './data';

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

        // Level tracking
        this.reachedLevels = new Set();
        this.currentActiveLevel = -1;
        this.activeTargetLevel = -1; // New property for bulb lights

        this.blinkTimer = 2.0;

        this.animState = 'IDLE';
        this.targetPuckRatio = 0;
        this.animCallback = null;
        this.windupTimer = 0;
        this.swingTimer = 0;

        this.purificationStep = 0;
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

        // Calculate dynamic scale for mobile
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

        if (command === 'WINDUP' || command === 'WINDING_FULL' || command === 'RESET_IDLE') {
            this.reachedLevels.clear();
            this.currentActiveLevel = -1;
        }

        if (command === 'WINDUP') {
            this.animState = 'WINDING';
            this.windupTimer = 0;
        }
        else if (command === 'SWING_IMPACT') {
            this.animState = 'SWINGING';
            this.swingTimer = 0;
        }
        else if (command === 'SHOOT') {
            this.targetPuckRatio = powerRatio;
            this.triggerLaunch(powerRatio);
        }
        else if (command === 'FULL_HIT') {
            this.targetPuckRatio = powerRatio;
            this.animState = 'WINDING_FULL';
            this.windupTimer = 0;
        }
        else if (command === 'RESET_IDLE') {
            this.hammerAngle = Math.PI * 0.8;
            this.puckY = 0;
            this.puckTrail = [];
            this.animState = 'IDLE';
            if (this.animCallback) this.animCallback();
        }
        else if (command === 'CONCLUSION') {
            this.reachedLevels.clear();
            this.activeTargetLevel = -1;
            this.currentActiveLevel = -1;
            this.hammerAngle = Math.PI * 0.8;
            this.puckY = 0;
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
        this.shake = 0; // Disabled shake entirely
        this.padScaleY = 0.8; // Subtle compression
        this.bamScale = 1.2;
        this.flashAlpha = 0.6;
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
                y: Math.random() * (this.height * 0.5), // Spawn in top half instead of negative Y
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

    update(dt) {
        this.time += dt;

        this.blinkTimer -= dt;
        if (this.blinkTimer < -0.15) {
            this.blinkTimer = 2 + Math.random() * 4;
        }

        if (this.shake > 0) this.shake -= dt * 40;
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

        // Dynamic Level Highlighting (Tracks reached levels during animation)
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
                    this.shake = 0; // Disabled shake entirely
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
                this.currentActiveLevel = 0; // Settles at Kingdom
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

        this.requestId = requestAnimationFrame(() => this.loop());
    }

    draw() {
        const ctx = this.ctx;

        // Clear the entire canvas first
        ctx.clearRect(0, 0, this.width, this.height);

        ctx.save();
        // Shake everything including background
        if (this.shake > 0) {
            ctx.translate((Math.random() - 0.5) * this.shake, (Math.random() - 0.5) * this.shake);
        }
        
        // Fill background over-sized to prevent empty edges during shake
        ctx.fillStyle = '#81ecec';
        ctx.fillRect(-50, -50, this.width + 100, this.height + 100);

        this.drawEnvironment(ctx);
        this.drawFlora(ctx);

        ctx.save();
        // Scale the main game elements for mobile
        ctx.translate(this.width / 2, this.height * 0.6);
        ctx.scale(this.baseScale, this.baseScale);
        ctx.translate(-this.width / 2, -this.height * 0.6);

        this.drawMidground(ctx);
        this.drawStrikerTower(ctx);
        this.drawCharacter(ctx);
        this.drawParticles(ctx);
        this.drawFloatingTexts(ctx);
        this.drawBAM(ctx);
        ctx.restore();

        ctx.restore();

        this.drawCinematicEffects(ctx);
        
        if (this.flashAlpha > 0) {
            ctx.fillStyle = `rgba(255, 255, 255, ${this.flashAlpha})`;
            ctx.fillRect(0, 0, this.width, this.height);
        }
    }

    drawEnvironment(ctx) {
        const gradient = ctx.createLinearGradient(0, 0, 0, this.height * 0.6);
        gradient.addColorStop(0, '#0abde3');
        gradient.addColorStop(1, '#c8d6e5');
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height * 0.6);

        ctx.save();
        const sunX = this.width * 0.85;
        const sunY = this.height * 0.25;

        ctx.globalCompositeOperation = 'screen';
        const sunGrad = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 200);
        sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
        sunGrad.addColorStop(0.2, 'rgba(253, 203, 110, 0.8)');
        sunGrad.addColorStop(1, 'rgba(253, 203, 110, 0)');
        ctx.fillStyle = sunGrad;
        ctx.beginPath(); ctx.arc(sunX, sunY, 200, 0, Math.PI * 2); ctx.fill();

        ctx.translate(sunX, sunY);
        ctx.rotate(this.time * 0.05);
        for (let i = 0; i < 12; i++) {
            ctx.rotate(Math.PI / 6);
            const grad = ctx.createLinearGradient(0, 0, 800, 0);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.2)');
            grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
            ctx.fillStyle = grad;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(800, -40);
            ctx.lineTo(800, 40);
            ctx.fill();
        }
        ctx.restore();

        ctx.fillStyle = '#10ac84';
        ctx.fillRect(0, this.height * 0.6, this.width, this.height * 0.4);
        ctx.fillStyle = '#1dd1a1';
        ctx.fillRect(0, this.height * 0.6, this.width, 15);

        const baseY = this.height * 0.6;

        ctx.fillStyle = '#01a3a4';
        this.grass.forEach(g => {
            if (g.x > this.width + 50) return;
            const tilt = Math.sin(this.time * 2.5 + g.off) * 8;
            ctx.beginPath();
            ctx.moveTo(g.x, baseY + 4);
            ctx.quadraticCurveTo(g.x + tilt / 2, baseY - g.h / 2, g.x + tilt, baseY - g.h);
            ctx.lineTo(g.x + tilt + 3, baseY - g.h);
            ctx.quadraticCurveTo(g.x + 3 + tilt / 2, baseY - g.h / 2, g.x + 8, baseY + 4);
            ctx.fill();
            
            // Add a second layer of highlights to grass
            ctx.fillStyle = '#1dd1a1';
            ctx.beginPath();
            ctx.moveTo(g.x + 2, baseY + 4);
            ctx.quadraticCurveTo(g.x + tilt / 2 + 2, baseY - g.h / 3, g.x + tilt + 1, baseY - g.h / 2);
            ctx.lineTo(g.x + tilt + 2, baseY - g.h / 2);
            ctx.fill();
            
            // Add tiny colorful flowers
            if (g.off % 7 < 0.2) {
                ctx.fillStyle = g.off % 14 < 0.1 ? '#ff7675' : '#74b9ff';
                ctx.beginPath();
                ctx.arc(g.x + tilt + 1, baseY - g.h - 2, 3, 0, Math.PI * 2);
                ctx.fill();
            }

            ctx.fillStyle = '#01a3a4';
        });

        this.clouds.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.scale(c.s, c.s);

            ctx.fillStyle = 'rgba(200, 214, 229, 0.6)';
            ctx.beginPath();
            ctx.arc(0, 10, 40, 0, Math.PI * 2);
            ctx.arc(30, -10, 50, 0, Math.PI * 2);
            ctx.arc(70, 10, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(0, 0, 40, 0, Math.PI * 2);
            ctx.arc(30, -20, 50, 0, Math.PI * 2);
            ctx.arc(70, 0, 40, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        ctx.strokeStyle = '#222f3e';
        ctx.fillStyle = '#222f3e';
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        this.birds.forEach(b => {
            if (b.x < -50 || b.x > this.width + 50) return;
            const flap = Math.sin(this.time * 10 + b.off) * 15 * b.scale;

            ctx.save();
            ctx.translate(b.x, b.y);
            ctx.scale(b.scale, b.scale);

            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(12, -flap, 24, -5 - flap * 0.2);
            ctx.moveTo(0, 0);
            ctx.quadraticCurveTo(-12, -flap, -24, -5 - flap * 0.2);
            ctx.stroke();

            ctx.beginPath();
            ctx.ellipse(0, 2, 4, 6, Math.PI / 2, 0, Math.PI * 2);
            ctx.fill();

            ctx.restore();
        });

        this.balloons.forEach(b => {
            if (b.x > this.width + 100) return;
            const by = b.y + Math.sin(this.time + b.offset) * 15;

            ctx.fillStyle = b.color;
            ctx.beginPath();
            ctx.moveTo(b.x, by + 25);
            ctx.bezierCurveTo(b.x + 35, by + 10, b.x + 35, by - 35, b.x, by - 35);
            ctx.bezierCurveTo(b.x - 35, by - 35, b.x - 35, by + 10, b.x, by + 25);
            ctx.fill();

            ctx.fillStyle = 'rgba(0,0,0,0.15)';
            ctx.beginPath();
            ctx.ellipse(b.x, by - 5, 10, 30, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.strokeStyle = '#555';
            ctx.lineWidth = 1;
            ctx.beginPath(); ctx.moveTo(b.x - 8, by + 22); ctx.lineTo(b.x - 12, by + 40); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(b.x + 8, by + 22); ctx.lineTo(b.x + 12, by + 40); ctx.stroke();

            ctx.fillStyle = '#8395a7';
            ctx.fillRect(b.x - 12, by + 40, 24, 14);
            ctx.strokeStyle = '#222f3e';
            ctx.strokeRect(b.x - 12, by + 40, 24, 14);
        });
    }

    drawFlora(ctx) {
        const baseY = this.height * 0.6;

        this.trees.forEach(t => {
            if (t.x < -100 || t.x > this.width + 100) return;

            ctx.save();
            ctx.translate(t.x, baseY);
            ctx.scale(t.s, t.s);

            const trunkGrad = ctx.createLinearGradient(-12, 0, 12, 0);
            trunkGrad.addColorStop(0, '#4a2f1d');
            trunkGrad.addColorStop(1, '#8e5a36');
            ctx.fillStyle = trunkGrad;
            ctx.fillRect(-12, -90, 24, 90);

            if (t.type === 1) {
                ctx.fillStyle = '#1e8449';
                ctx.beginPath(); ctx.arc(0, -100, 45, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#229954';
                ctx.beginPath(); ctx.arc(-30, -80, 40, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#27ae60';
                ctx.beginPath(); ctx.arc(30, -80, 40, 0, Math.PI * 2); ctx.fill();
                ctx.fillStyle = '#2ecc71';
                ctx.beginPath(); ctx.arc(0, -130, 35, 0, Math.PI * 2); ctx.fill();
            } else {
                ctx.fillStyle = '#0b5345';
                ctx.beginPath(); ctx.moveTo(0, -160); ctx.lineTo(-45, -70); ctx.lineTo(45, -70); ctx.fill();
                ctx.fillStyle = '#117864';
                ctx.beginPath(); ctx.moveTo(0, -130); ctx.lineTo(-40, -50); ctx.lineTo(40, -50); ctx.fill();
                ctx.fillStyle = '#1abc9c';
                ctx.beginPath(); ctx.moveTo(0, -100); ctx.lineTo(-35, -30); ctx.lineTo(35, -30); ctx.fill();
            }
            ctx.restore();
        });

        this.flowers.forEach(f => {
            if (f.x < 0 || f.x > this.width) return;

            const wave = Math.sin(this.time * 2 + f.x) * 3;

            ctx.strokeStyle = '#27ae60';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(f.x, baseY);
            ctx.quadraticCurveTo(f.x + wave / 2, baseY - f.h / 2, f.x + wave, baseY - f.h);
            ctx.stroke();

            ctx.fillStyle = '#2ecc71';
            ctx.beginPath(); ctx.ellipse(f.x + wave / 2 + 3, baseY - f.h / 2, 4, 2, Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(f.x + wave / 2 - 3, baseY - f.h / 2 + 3, 4, 2, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();

            ctx.save();
            ctx.translate(f.x + wave, baseY - f.h);
            ctx.fillStyle = f.color;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.ellipse(0, -4, 3, 5, 0, 0, Math.PI * 2);
                ctx.fill();
                ctx.rotate((Math.PI * 2) / 5);
            }
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.arc(0, 0, 3, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        });
    }

    drawMidground(ctx) {
        const baseY = this.height * 0.6;

        // --- Ferris Wheel ---
        const fwX = this.width < 600 ? this.width * 1.1 : this.width * 0.82;
        const fwY = baseY - 130;
        const fwR = 120;
        const fwRot = this.time * 0.3;

        // Support Structure
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 12;
        ctx.beginPath(); ctx.moveTo(fwX, fwY); ctx.lineTo(fwX + 60, baseY); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(fwX, fwY); ctx.lineTo(fwX - 60, baseY); ctx.stroke();

        // Outer Rim Glow
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
        ctx.lineWidth = 15;
        ctx.beginPath(); ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2); ctx.stroke();
        ctx.restore();

        // Main Rims
        ctx.strokeStyle = '#747d8c';
        ctx.lineWidth = 8;
        ctx.beginPath(); ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2); ctx.stroke();
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(fwX, fwY, fwR - 30, 0, Math.PI * 2); ctx.stroke();

        // Spokes
        ctx.strokeStyle = 'rgba(87, 101, 116, 0.5)';
        ctx.lineWidth = 2;
        for (let i = 0; i < 12; i++) {
            const angle = fwRot + (i * Math.PI / 6);
            ctx.beginPath();
            ctx.moveTo(fwX, fwY);
            ctx.lineTo(fwX + Math.cos(angle) * fwR, fwY + Math.sin(angle) * fwR);
            ctx.stroke();

            // Rim Lights
            const lightOn = (Math.floor(this.time * 4) + i) % 3 === 0;
            if (lightOn) {
                ctx.save();
                ctx.fillStyle = i % 2 === 0 ? '#f1c40f' : '#ff4757';
                ctx.shadowColor = ctx.fillStyle;
                ctx.shadowBlur = 10;
                ctx.beginPath(); ctx.arc(fwX + Math.cos(angle) * fwR, fwY + Math.sin(angle) * fwR, 5, 0, Math.PI * 2); ctx.fill();
                ctx.restore();
            }
        }

        // Gondolas
        for (let i = 0; i < 12; i++) {
            const angle = fwRot + (i * Math.PI / 6);
            const cx = fwX + Math.cos(angle) * fwR;
            const cy = fwY + Math.sin(angle) * fwR;

            ctx.save();
            ctx.translate(cx, cy);
            // Counter-rotate gondola to keep it upright
            ctx.rotate(0); 

            ctx.fillStyle = i % 2 === 0 ? '#ff6b81' : '#1e90ff';
            ctx.beginPath(); ctx.roundRect(-18, 0, 36, 42, 8); ctx.fill();
            ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 3; ctx.stroke();

            // Window
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.fillRect(-14, 8, 28, 18);
            
            // Roof
            ctx.fillStyle = '#feca57';
            ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(0, -18); ctx.fill(); ctx.stroke();
            
            // Hanging bars
            ctx.strokeStyle = '#576574'; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.stroke();
            
            ctx.restore();
        }

        // Central Hub
        const hubGrad = ctx.createRadialGradient(fwX, fwY, 5, fwX, fwY, 30);
        hubGrad.addColorStop(0, '#f1c40f');
        hubGrad.addColorStop(1, '#e67e22');
        ctx.fillStyle = hubGrad;
        ctx.beginPath(); ctx.arc(fwX, fwY, 20, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 4; ctx.stroke();
        
        // Hub Lights
        for (let i = 0; i < 8; i++) {
            const a = fwRot * 2 + (i * Math.PI / 4);
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.arc(fwX + Math.cos(a) * 12, fwY + Math.sin(a) * 12, 3, 0, Math.PI * 2); ctx.fill();
        }

        // --- Drop Tower ---
        const dtX = this.width < 600 ? this.width * 0.05 : this.width * 0.28;
        const dtH = 250;

        ctx.fillStyle = '#7f8fa6';
        ctx.fillRect(dtX - 10, baseY - dtH, 20, dtH);
        ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 2;
        ctx.strokeRect(dtX - 10, baseY - dtH, 20, dtH);
        for (let i = 0; i < 10; i++) {
            ctx.beginPath(); ctx.moveTo(dtX - 10, baseY - dtH + i * 25); ctx.lineTo(dtX + 10, baseY - dtH + i * 25 + 10); ctx.stroke();
        }

        ctx.fillStyle = '#e84118';
        ctx.beginPath(); ctx.arc(dtX, baseY - dtH, 18, Math.PI, 0); ctx.fill();
        ctx.beginPath(); ctx.arc(dtX, baseY - dtH - 10, 4, 0, Math.PI * 2); ctx.fill();

        const dropCycle = (this.time * 0.3) % 1.0;
        let carriageY = baseY - dtH + 25;
        if (dropCycle < 0.5) {
            carriageY = baseY - 25 - ((dropCycle / 0.5) * (dtH - 50));
        } else if (dropCycle < 0.6) {
            carriageY = baseY - dtH + 25;
        } else if (dropCycle < 0.7) {
            const dropProgress = (dropCycle - 0.6) / 0.1;
            carriageY = (baseY - dtH + 25) + Math.pow(dropProgress, 3) * (dtH - 50);
        } else {
            carriageY = baseY - 25;
        }
        ctx.fillStyle = '#fbc531';
        ctx.fillRect(dtX - 22, carriageY, 44, 20); ctx.strokeRect(dtX - 22, carriageY, 44, 20);
        ctx.fillStyle = '#2f3542';
        ctx.fillRect(dtX - 25, carriageY + 20, 50, 10);

        ctx.fillStyle = '#ff4757';
        ctx.beginPath(); ctx.arc(dtX - 15, carriageY + 15, 4, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#1e90ff';
        ctx.beginPath(); ctx.arc(dtX + 15, carriageY + 15, 4, 0, Math.PI * 2); ctx.fill();

        // --- High-Quality Rollercoaster ---
        const rcX = this.width < 600 ? this.width * -0.8 : this.width * 0.08;
        ctx.lineCap = 'butt';

        // Sleepers (Cross-ties)
        ctx.strokeStyle = '#5c3a21'; // Wooden brown
        ctx.lineWidth = 4;
        for (let i = 0; i <= 50; i++) {
            const t = i / 50;
            const tx = Math.pow(1 - t, 2) * rcX + 2 * (1 - t) * t * (rcX + 140) + Math.pow(t, 2) * (rcX + 280);
            const ty = Math.pow(1 - t, 2) * baseY + 2 * (1 - t) * t * (baseY - 280) + Math.pow(t, 2) * baseY;

            const dx = 2 * (1 - t) * (rcX + 140 - rcX) + 2 * t * (rcX + 280 - (rcX + 140));
            const dy = 2 * (1 - t) * (baseY - 280 - baseY) + 2 * t * (baseY - (baseY - 280));
            const len = Math.sqrt(dx * dx + dy * dy);
            const nx = -dy / len;
            const ny = dx / len;

            ctx.beginPath();
            ctx.moveTo(tx - nx * 10, ty - ny * 10);
            ctx.lineTo(tx + nx * 10, ty + ny * 10);
            ctx.stroke();
        }

        // Trestles
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#576574';
        for (let i = 0; i <= 12; i++) {
            const t = i / 12;
            const tx = Math.pow(1 - t, 2) * rcX + 2 * (1 - t) * t * (rcX + 140) + Math.pow(t, 2) * (rcX + 280);
            const ty = Math.pow(1 - t, 2) * baseY + 2 * (1 - t) * t * (baseY - 280) + Math.pow(t, 2) * baseY;

            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx - 15, baseY); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(tx, ty); ctx.lineTo(tx + 15, baseY); ctx.stroke();
            if (i < 12) {
                const tNext = (i + 1) / 12;
                const txN = Math.pow(1 - tNext, 2) * rcX + 2 * (1 - tNext) * tNext * (rcX + 140) + Math.pow(tNext, 2) * (rcX + 280);
                const tyN = Math.pow(1 - tNext, 2) * baseY + 2 * (1 - tNext) * tNext * (baseY - 280) + Math.pow(tNext, 2) * baseY;
                ctx.beginPath(); ctx.moveTo(tx, baseY - 20); ctx.lineTo(txN, tyN); ctx.stroke();
            }
        }

        // Rails
        ctx.lineWidth = 6;
        ctx.strokeStyle = '#c23616';
        ctx.beginPath();
        ctx.moveTo(rcX, baseY);
        ctx.quadraticCurveTo(rcX + 140, baseY - 280, rcX + 280, baseY);
        ctx.stroke();

        ctx.lineWidth = 2;
        ctx.strokeStyle = '#ff7675'; // Rail highlight
        ctx.beginPath();
        ctx.moveTo(rcX, baseY);
        ctx.quadraticCurveTo(rcX + 140, baseY - 280, rcX + 280, baseY);
        ctx.stroke();

        const tC_base = (this.time * 0.15) % 1.5 - 0.2;

        for (let i = 0; i < 3; i++) {
            const tC = tC_base - (i * 0.05);
            if (tC < 0 || tC > 1) continue;

            const cartX = Math.pow(1 - tC, 2) * rcX + 2 * (1 - tC) * tC * (rcX + 140) + Math.pow(tC, 2) * (rcX + 280);
            const cartY = Math.pow(1 - tC, 2) * baseY + 2 * (1 - tC) * tC * (baseY - 280) + Math.pow(tC, 2) * baseY;

            const dx = 2 * (1 - tC) * (rcX + 140 - rcX) + 2 * tC * (rcX + 280 - (rcX + 140));
            const dy = 2 * (1 - tC) * (baseY - 280 - baseY) + 2 * tC * (baseY - (baseY - 280));
            const angle = Math.atan2(dy, dx);

            ctx.save();
            ctx.translate(cartX, cartY - 8);
            ctx.rotate(angle);

            ctx.fillStyle = i === 0 ? '#ff4757' : '#1e90ff';
            ctx.beginPath(); ctx.roundRect(-20, -12, 40, 20, 6); ctx.fill();
            ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 2; ctx.stroke();

            ctx.fillStyle = '#f1c40f'; ctx.beginPath(); ctx.arc(-8, -18, 5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#2ed573'; ctx.beginPath(); ctx.arc(8, -18, 5, 0, Math.PI * 2); ctx.fill();

            ctx.restore();
        }

        // --- Circus Tent ---
        const tentX = this.width < 600 ? this.width * 0.15 : this.width * 0.42;
        ctx.fillStyle = '#ff4757';
        ctx.beginPath(); ctx.moveTo(tentX, baseY - 180); ctx.lineTo(tentX - 110, baseY); ctx.lineTo(tentX + 110, baseY); ctx.fill();
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath(); ctx.moveTo(tentX, baseY - 180); ctx.lineTo(tentX - 55, baseY); ctx.lineTo(tentX - 25, baseY); ctx.fill();
        ctx.beginPath(); ctx.moveTo(tentX, baseY - 180); ctx.lineTo(tentX + 55, baseY); ctx.lineTo(tentX + 25, baseY); ctx.fill();

        ctx.fillStyle = '#2f3542';
        ctx.beginPath(); ctx.moveTo(tentX - 20, baseY); ctx.lineTo(tentX + 20, baseY); ctx.lineTo(tentX, baseY - 40); ctx.fill();

        ctx.fillStyle = '#2f3542';
        for (let i = -4; i <= 4; i++) {
            ctx.beginPath(); ctx.arc(tentX + i * 22, baseY - 90 + Math.abs(i) * 18, 14, 0, Math.PI, false); ctx.fill();
        }

        ctx.strokeStyle = '#222'; ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(tentX, baseY - 180); ctx.lineTo(tentX, baseY - 215); ctx.stroke();
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.moveTo(tentX, baseY - 215); ctx.lineTo(tentX + 30, baseY - 200); ctx.lineTo(tentX, baseY - 190); ctx.fill();

        // --- Carousel ---
        const cX = this.width < 600 ? this.width * 0.95 : this.width * 0.58;
        const cW = 160;
        const cH = 90;

        ctx.fillStyle = '#e84118';
        ctx.beginPath(); ctx.moveTo(cX, baseY - cH - 45); ctx.lineTo(cX - cW / 2, baseY - cH); ctx.lineTo(cX + cW / 2, baseY - cH); ctx.fill();
        ctx.fillStyle = '#f5f6fa';
        ctx.beginPath(); ctx.moveTo(cX, baseY - cH - 45); ctx.lineTo(cX - cW / 4, baseY - cH); ctx.lineTo(cX - 15, baseY - cH); ctx.fill();
        ctx.beginPath(); ctx.moveTo(cX, baseY - cH - 45); ctx.lineTo(cX + cW / 4, baseY - cH); ctx.lineTo(cX + 15, baseY - cH); ctx.fill();

        for (let i = 0; i < 8; i++) {
            const sx = cX - cW / 2 + 10 + (i * 20);
            ctx.fillStyle = i % 2 === 0 ? '#e84118' : '#f5f6fa';
            ctx.beginPath(); ctx.arc(sx, baseY - cH, 10, 0, Math.PI, false); ctx.fill();
            ctx.fillStyle = '#f1c40f';
            ctx.beginPath(); ctx.arc(sx, baseY - cH + 5, 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = '#2f3542';
        ctx.fillRect(cX - cW / 2, baseY - 18, cW, 18);
        ctx.fillStyle = '#ff4757';
        ctx.fillRect(cX - cW / 2, baseY - 10, cW, 4);

        for (let i = 0; i < 6; i++) {
            const px = (cX - cW / 2 + 15) + (i * 26);
            ctx.fillStyle = '#dcdde1';
            ctx.fillRect(px, baseY - cH, 4, cH);

            const hBounce = Math.sin(this.time * 2.5 + i) * 18;

            ctx.save();
            ctx.translate(px + 2, baseY - cH / 2 + hBounce);
            ctx.fillStyle = i % 2 === 0 ? '#9b59b6' : '#3498db';
            ctx.beginPath(); ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(-8, -8, 5, 8, -Math.PI / 4, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.ellipse(-12, -14, 6, 4, 0, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#f1c40f';
            ctx.fillRect(-4, -6, 8, 4);
            ctx.restore();
        }

        ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 50); ctx.quadraticCurveTo(this.width / 2, 150 + Math.sin(this.time) * 20, this.width, 50); ctx.stroke();
        for (let i = 1; i < 25; i++) {
            const bT = i / 25;
            const bx = Math.pow(1 - bT, 2) * 0 + 2 * (1 - bT) * bT * (this.width / 2) + Math.pow(bT, 2) * this.width;
            const by = Math.pow(1 - bT, 2) * 50 + 2 * (1 - bT) * bT * (150 + Math.sin(this.time) * 20) + Math.pow(bT, 2) * 50;
            ctx.fillStyle = i % 2 === 0 ? '#ff4757' : '#1e90ff';
            ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 12, by + 25); ctx.lineTo(bx + 12, by + 25); ctx.fill();
            ctx.stroke();
        }
    }

    drawBulb(ctx, x, y, time, offset) {
        const on = Math.sin(time + offset) > 0;
        ctx.fillStyle = on ? '#fff200' : '#7f8c8d';
        ctx.beginPath(); ctx.arc(x, y, 4, 0, Math.PI * 2); ctx.fill();
        if (on) {
            ctx.shadowColor = '#f1c40f';
            ctx.shadowBlur = 8;
            ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
            ctx.beginPath(); ctx.arc(x, y, 2, 0, Math.PI * 2); ctx.fill();
            ctx.shadowBlur = 0;
        }
        ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 1; ctx.stroke();
    }

    drawStrikerTower(ctx) {
        const baseX = this.width < 600 ? this.width / 2 - 120 : this.width / 2 - 90;
        const baseY = this.height - 110;

        // --- High Striker Tower ---
        const tw = 48;

        ctx.strokeStyle = '#4b6584';
        ctx.lineWidth = 3;
        for (let i = 0; i < 10; i++) {
            const y1 = baseY - (i * this.towerHeight / 10);
            const y2 = baseY - ((i + 1) * this.towerHeight / 10);
            ctx.beginPath(); ctx.moveTo(baseX - tw / 2 - 10, y1); ctx.lineTo(baseX + tw / 2 + 10, y2); ctx.stroke();
            ctx.beginPath(); ctx.moveTo(baseX + tw / 2 + 10, y1); ctx.lineTo(baseX - tw / 2 - 10, y2); ctx.stroke();
        }

        const towerGrad = ctx.createLinearGradient(baseX - tw / 2, 0, baseX + tw / 2, 0);
        towerGrad.addColorStop(0, '#a5b1c2');
        towerGrad.addColorStop(0.2, '#d1d8e0');
        towerGrad.addColorStop(0.8, '#778ca3');
        towerGrad.addColorStop(1, '#4b6584');

        ctx.fillStyle = towerGrad;
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 6;
        ctx.beginPath(); ctx.roundRect(baseX - tw / 2, baseY - this.towerHeight, tw, this.towerHeight, 5); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#1e272e';
        ctx.fillRect(baseX - 6, baseY - this.towerHeight + 10, 12, this.towerHeight - 10);

        const puckYCoord = baseY - this.puckY - 15;
        const tubeFill = ctx.createLinearGradient(0, baseY, 0, baseY - this.towerHeight);
        tubeFill.addColorStop(0, '#ff4757');
        tubeFill.addColorStop(0.5, '#feca57');
        tubeFill.addColorStop(1, '#00d2d3');
        ctx.fillStyle = tubeFill;
        ctx.fillRect(baseX - 4, puckYCoord, 8, baseY - puckYCoord);

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.shadowColor = tubeFill;
        ctx.shadowBlur = 15;
        ctx.fillStyle = tubeFill;
        ctx.fillRect(baseX - 2, puckYCoord, 4, baseY - puckYCoord);
        ctx.restore();

        // --- High Striker Connected Signboards (Levels) ---
        towerLevels.forEach(lvl => {
            const y = baseY - (this.towerHeight * lvl.ratio);

            const isReached = this.reachedLevels.has(lvl.id);
            const isTarget = (this.activeTargetLevel === lvl.id);

            const pulse = 0;
            const glowColor = isReached ? '#f1c40f' : (isTarget ? '#00d2d3' : '#34495e');
            const boardColor = isReached || isTarget ? '#e67e22' : '#d35400';
            const innerBorder = isReached || isTarget ? '#f1c40f' : '#e67e22';
            const textColor = isReached || isTarget ? '#fff200' : '#bdc3c7';

            ctx.strokeStyle = glowColor;
            ctx.lineWidth = isReached || isTarget ? 6 : 4;
            ctx.shadowColor = glowColor;
            ctx.shadowBlur = isReached || isTarget ? 15 + pulse : 0;
            ctx.beginPath(); ctx.moveTo(baseX - tw / 2, y); ctx.lineTo(baseX - tw / 2 - 15, y); ctx.stroke();
            ctx.shadowBlur = 0;

            ctx.fillStyle = '#2f3542';
            ctx.fillRect(baseX - tw / 2 - 40, y - 4, 30, 8);

            const boardW = 160 + pulse;
            const boardH = 50 + pulse;
            const boardX = baseX - tw / 2 - (boardW + 25) - pulse / 2;
            const boardY = y - (boardH / 2) - pulse / 2;

            ctx.fillStyle = boardColor;
            ctx.beginPath(); ctx.roundRect(boardX, boardY, boardW, boardH, 8); ctx.fill();
            ctx.strokeStyle = '#2d3436'; ctx.lineWidth = 3; ctx.stroke();

            ctx.strokeStyle = innerBorder; ctx.lineWidth = 2;
            ctx.beginPath(); ctx.roundRect(boardX + 4, boardY + 4, boardW - 8, boardH - 8, 4); ctx.stroke();

            // Animated persistent bulb perimeter for the target level
            if (isTarget) {
                const bTime = this.time * 6;
                const space = 14;
                // Top & Bottom rows
                for (let bx = boardX; bx <= boardX + boardW; bx += space) {
                    this.drawBulb(ctx, bx, boardY, bTime, bx);
                    this.drawBulb(ctx, bx, boardY + boardH, bTime, bx);
                }
                // Side rows
                for (let by = boardY + space; by < boardY + boardH; by += space) {
                    this.drawBulb(ctx, boardX, by, bTime, by);
                    this.drawBulb(ctx, boardX + boardW, by, bTime, by);
                }
            } else {
                // Standard Rivets for non-targets
                ctx.fillStyle = '#b2bec3';
                ctx.beginPath(); ctx.arc(boardX + 10, boardY + 10, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(boardX + boardW - 10, boardY + 10, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(boardX + 10, boardY + boardH - 10, 3, 0, Math.PI * 2); ctx.fill();
                ctx.beginPath(); ctx.arc(boardX + boardW - 10, boardY + boardH - 10, 3, 0, Math.PI * 2); ctx.fill();
            }

            ctx.fillStyle = (isReached || isTarget) ? '#ffffff' : '#bdc3c7';
            ctx.shadowColor = (isReached || isTarget) ? '#000000' : 'transparent';
            ctx.shadowBlur = (isReached || isTarget) ? 10 : 0;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.font = `bold 20px "Outfit", sans-serif`;
            ctx.fillText(lvl.name, boardX + boardW / 2, y + 2);
            ctx.shadowBlur = 0;
        });

        // --- Bell & Clapper ---
        const bellY = baseY - this.towerHeight - 25;

        this.shockwaves.forEach(s => {
            if (s.isBell) {
                ctx.strokeStyle = `rgba(241, 196, 15, ${s.alpha})`;
                ctx.lineWidth = 6;
                ctx.beginPath(); ctx.arc(baseX, bellY, s.r, 0, Math.PI * 2); ctx.stroke();
            }
        });

        const bellGrad = ctx.createRadialGradient(baseX - 10, bellY - 10, 5, baseX, bellY, 35);
        bellGrad.addColorStop(0, '#ffeaa7');
        bellGrad.addColorStop(0.4, '#f1c40f');
        bellGrad.addColorStop(1, '#d35400');

        ctx.fillStyle = bellGrad;
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 4;
        ctx.beginPath(); ctx.arc(baseX, bellY, 35, Math.PI, 0); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#e67e22';
        ctx.beginPath(); ctx.roundRect(baseX - 40, bellY - 4, 80, 8, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#2d3436';
        ctx.beginPath(); ctx.arc(baseX, bellY + 8, 10, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // --- Puck ---
        const stretch = Math.max(1, Math.min(1.8, Math.abs(this.puckVy) / 800));
        const puckW = 36 / stretch;
        const puckH = 20 * stretch;

        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        this.puckTrail.forEach(t => {
            const ratio = t.life;
            const fireGrad = ctx.createRadialGradient(baseX, baseY - t.y - 15, 0, baseX, baseY - t.y - 15, 30 * ratio);
            fireGrad.addColorStop(0, `rgba(255, 165, 0, ${ratio * 0.8})`);
            fireGrad.addColorStop(0.5, `rgba(255, 69, 0, ${ratio * 0.4})`);
            fireGrad.addColorStop(1, `rgba(255, 0, 0, 0)`);
            ctx.fillStyle = fireGrad;
            ctx.beginPath(); ctx.arc(baseX, baseY - t.y - 15, 30 * ratio, 0, Math.PI * 2); ctx.fill();
        });
        ctx.restore();

        const puckMetal = ctx.createLinearGradient(baseX - puckW / 2, 0, baseX + puckW / 2, 0);
        puckMetal.addColorStop(0, '#b2bec3');
        puckMetal.addColorStop(0.5, '#dfe6e9');
        puckMetal.addColorStop(1, '#636e72');

        ctx.fillStyle = puckMetal;
        ctx.strokeStyle = '#2d3436';
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.ellipse(baseX, puckYCoord, puckW / 2, puckH / 2, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#00d2d3';
        ctx.beginPath(); ctx.ellipse(baseX, puckYCoord, puckW / 4, puckH / 4, 0, 0, Math.PI * 2); ctx.fill();

        if (this.puckY > 10 || this.animState === 'RISING') {
            ctx.save();
            ctx.globalCompositeOperation = 'screen';
            ctx.fillStyle = 'rgba(0, 210, 211, 0.6)';
            ctx.beginPath(); ctx.ellipse(baseX, puckYCoord, puckW, puckH * 1.5, 0, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }

        // --- Base Pad ---
        const padW = 120;
        const padH = 35 * this.padScaleY;

        this.shockwaves.forEach(s => {
            if (!s.isBell) {
                ctx.save();
                ctx.translate(baseX, baseY - padH);
                ctx.scale(1, 0.3);
                ctx.strokeStyle = `rgba(255, 255, 255, ${s.alpha})`;
                ctx.lineWidth = s.width || 15;
                ctx.beginPath(); ctx.arc(0, 0, s.r, 0, Math.PI * 2); ctx.stroke();
                ctx.restore();
            }
        });

        const padGrad = ctx.createLinearGradient(0, baseY - padH, 0, baseY);
        padGrad.addColorStop(0, '#ff7675');
        padGrad.addColorStop(1, '#d63031');
        ctx.fillStyle = padGrad;
        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 5;
        ctx.beginPath(); ctx.roundRect(baseX - padW / 2, baseY - padH, padW, padH, 8); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#ff4757';
        ctx.beginPath(); ctx.ellipse(baseX, baseY - padH, 20, 8, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#2d3436';
        ctx.beginPath(); ctx.roundRect(baseX - 80, baseY, 160, 55, 5); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#b2bec3';
        ctx.beginPath(); ctx.arc(baseX - 65, baseY + 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(baseX + 65, baseY + 12, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(baseX - 65, baseY + 42, 4, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(baseX + 65, baseY + 42, 4, 0, Math.PI * 2); ctx.fill();

        ctx.fillStyle = '#f1c40f';
        ctx.fillRect(baseX - 50, baseY + 10, 100, 35); ctx.strokeRect(baseX - 50, baseY + 10, 100, 35);
    }

    drawCharacter(ctx) {
        const gx = this.width < 600 ? this.width / 2 + 130 : this.width / 2 + 100;
        const gy = this.height - 110;

        ctx.strokeStyle = '#2f3542';
        ctx.lineWidth = 4;
        ctx.lineJoin = 'round';
        ctx.lineCap = 'round';

        const isIdle = this.animState === 'IDLE' || this.animState === 'WINDUP_HOLD';
        const breath = isIdle ? Math.sin(this.time * 4) * 2 : 0;

        const restAngle = Math.PI * 0.8;
        const leanAngle = (this.hammerAngle - restAngle) * 0.15;
        
        // Squash and stretch factors
        let squashX = 1.0;
        let squashY = 1.0;
        if (this.animState === 'WINDING' || this.animState === 'WINDING_FULL') {
            const p = Math.min(this.windupTimer / 0.5, 1.0);
            squashX = 1.0 + Math.sin(p * Math.PI) * 0.1;
            squashY = 1.0 - Math.sin(p * Math.PI) * 0.1;
        } else if (this.animState === 'SWINGING' || this.animState === 'SWINGING_FULL') {
            const p = Math.min(this.swingTimer / 0.12, 1.0);
            squashX = 1.0 - Math.sin(p * Math.PI) * 0.15;
            squashY = 1.0 + Math.sin(p * Math.PI) * 0.15;
        }

        // Shadow 
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath(); ctx.ellipse(gx, gy, 45 * squashX, 12 * squashY, 0, 0, Math.PI * 2); ctx.fill();

        ctx.save();
        ctx.translate(gx, gy);
        ctx.scale(squashX, squashY);
        ctx.translate(-gx, -gy);

        ctx.save();
        ctx.translate(gx, gy - 60);
        ctx.rotate(leanAngle);
        ctx.translate(-gx, -(gy - 60));

        // --- Phase-based Colors ---
        const colors = [
            { main: '#34495e', light: '#7f8c8d', dark: '#2c3e50' }, // Crown
            { main: '#b7950b', light: '#f1c40f', dark: '#9a7d0a' }, // Wisdom
            { main: '#1f618d', light: '#3498db', dark: '#1a5276' }, // Understanding
            { main: '#943126', light: '#e74c3c', dark: '#7b241c' }, // Small Face
            { main: '#196f3d', light: '#2ecc71', dark: '#145a32' }  // Kingdom
        ][this.purificationStep] || { main: '#943126', light: '#e74c3c', dark: '#7b241c' };

        // Legs (Trousers)
        ctx.fillStyle = colors.dark;
        ctx.beginPath(); ctx.roundRect(gx - 20, gy - 65, 16, 45, 8); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(gx + 6, gy - 65, 16, 45, 8); ctx.fill(); ctx.stroke();

        ctx.fillStyle = '#1e272e'; // Shoes stay dark
        ctx.beginPath(); ctx.roundRect(gx - 26, gy - 25, 26, 25, 10); ctx.fill(); ctx.stroke();
        ctx.beginPath(); ctx.roundRect(gx, gy - 25, 26, 25, 10); ctx.fill(); ctx.stroke();

        // --- Body (Color based on Phase) ---
        const bodyGrad = ctx.createLinearGradient(gx - 50, gy - 130, gx + 30, gy - 130);
        bodyGrad.addColorStop(0, colors.dark);
        bodyGrad.addColorStop(0.5, colors.main);
        bodyGrad.addColorStop(1, colors.dark);
        ctx.fillStyle = bodyGrad;

        ctx.beginPath();
        ctx.moveTo(gx - 18, gy - 65 + breath); // Left waist
        ctx.bezierCurveTo(gx - 55, gy - 75 + breath, gx - 55, gy - 135 + breath, gx - 15, gy - 135 + breath); // Left side
        ctx.bezierCurveTo(gx, gy - 140 + breath, gx + 25, gy - 130 + breath, gx + 25, gy - 110 + breath); // Top/Right shoulder
        ctx.bezierCurveTo(gx + 30, gy - 90 + breath, gx + 15, gy - 70 + breath, gx + 8, gy - 65 + breath); // Right side
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Yellow sash/stripe
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath();
        ctx.moveTo(gx - 15, gy - 135 + breath);
        ctx.bezierCurveTo(gx, gy - 120 + breath, gx + 10, gy - 90 + breath, gx + 8, gy - 65 + breath);
        ctx.lineTo(gx, gy - 65 + breath);
        ctx.bezierCurveTo(gx + 5, gy - 90 + breath, gx - 5, gy - 120 + breath, gx - 25, gy - 132 + breath);
        ctx.fill();

        // Thick Belt
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.roundRect(gx - 25, gy - 70 + breath, 40, 16, 8); ctx.fill(); ctx.stroke();

        // Big Buckle
        ctx.fillStyle = '#f1c40f';
        ctx.beginPath(); ctx.roundRect(gx - 12, gy - 74 + breath, 24, 24, 4); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#111';
        ctx.fillRect(gx - 4, gy - 68 + breath, 8, 12);

        // --- Head & Face ---
        const hy = gy + breath;

        // Better Head Graduation
        const headGrad = ctx.createRadialGradient(gx - 10, hy - 140, 5, gx - 10, hy - 140, 35);
        headGrad.addColorStop(0, '#ffeaa7');
        headGrad.addColorStop(1, '#e1b12c');
        ctx.fillStyle = headGrad;

        ctx.beginPath();
        ctx.moveTo(gx + 5, hy - 140);
        ctx.lineTo(gx - 15, hy - 155);
        ctx.bezierCurveTo(gx - 30, hy - 155, gx - 35, hy - 140, gx - 30, hy - 125);
        ctx.bezierCurveTo(gx - 25, hy - 110, gx - 10, hy - 115, gx, hy - 125);
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        // Feather on Hat
        ctx.fillStyle = '#ff4757';
        ctx.beginPath();
        ctx.moveTo(gx + 8, hy - 165);
        ctx.quadraticCurveTo(gx + 30, hy - 190, gx + 40, hy - 170);
        ctx.quadraticCurveTo(gx + 35, hy - 160, gx + 8, hy - 160);
        ctx.fill(); ctx.stroke();

        // Ear
        ctx.beginPath(); ctx.arc(gx + 5, hy - 135, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Hair
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.moveTo(gx + 10, hy - 145);
        ctx.bezierCurveTo(gx + 15, hy - 175, gx - 20, hy - 180, gx - 25, hy - 160); // pompadour top
        ctx.bezierCurveTo(gx - 15, hy - 165, gx + 5, hy - 155, gx + 10, hy - 145); // swoop back
        ctx.fill(); ctx.stroke();

        // Big Cartoon Nose
        ctx.fillStyle = '#e67e22';
        ctx.beginPath(); ctx.arc(gx - 35, hy - 135, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Eye & Eyelid
        const isBlinking = this.blinkTimer < 0;
        if (isBlinking) {
            ctx.beginPath(); ctx.moveTo(gx - 28, hy - 144); ctx.lineTo(gx - 18, hy - 144); ctx.stroke();
        } else {
            ctx.fillStyle = '#fff';
            ctx.beginPath(); ctx.ellipse(gx - 22, hy - 144, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
            ctx.fillStyle = '#3498db';
            const lookOff = (this.animState === 'SWINGING' || this.animState === 'SWINGING_FULL') ? -1.5 : 1.5;
            ctx.beginPath(); ctx.arc(gx - 22 + lookOff, hy - 144, 2.5, 0, Math.PI * 2); ctx.fill();
            ctx.fillStyle = '#111';
            ctx.beginPath(); ctx.arc(gx - 22 + lookOff, hy - 144, 1.5, 0, Math.PI * 2); ctx.fill();
        }

        // Expressive Eyebrow
        ctx.lineWidth = 5;
        if (this.animState === 'SWINGING' || this.animState === 'SWINGING_FULL') {
            ctx.beginPath(); ctx.moveTo(gx - 12, hy - 150); ctx.lineTo(gx - 30, hy - 145); ctx.stroke(); // Angry
        } else {
            ctx.beginPath(); ctx.moveTo(gx - 15, hy - 152); ctx.lineTo(gx - 30, hy - 154); ctx.stroke(); // Relaxed
        }
        ctx.lineWidth = 4;

        // Huge Swooping Mustache
        ctx.fillStyle = '#2f3542';
        ctx.beginPath();
        ctx.moveTo(gx - 15, hy - 128); // under nose right
        ctx.quadraticCurveTo(gx - 45, hy - 125, gx - 50, hy - 140); // outer curl
        ctx.quadraticCurveTo(gx - 40, hy - 130, gx - 25, hy - 120); // inner
        ctx.closePath();
        ctx.fill(); ctx.stroke();

        ctx.restore(); // Restore Lean transformation

        // --- ARM & HAMMER ---
        const pivotOffsetX = -20;
        const pivotOffsetY = -120 + breath;
        const rotCos = Math.cos(leanAngle);
        const rotSin = Math.sin(leanAngle);
        const shoulderX = gx + (pivotOffsetX * rotCos - pivotOffsetY * rotSin);
        const shoulderY = (gy - 60) + (pivotOffsetX * rotSin + pivotOffsetY * rotCos) + 60;

        ctx.lineWidth = 4;
        ctx.save();
        ctx.translate(shoulderX, shoulderY);
        ctx.rotate(this.hammerAngle);

        // Cartoon Arm (Color based on Phase)
        ctx.fillStyle = colors.main;

        // Forearm
        ctx.beginPath(); ctx.roundRect(30, -12, 45, 24, 12); ctx.fill(); ctx.stroke();
        // Bicep
        ctx.beginPath(); ctx.roundRect(10, -15, 35, 30, 15); ctx.fill(); ctx.stroke();
        // Shoulder
        ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

        // Wristband
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.roundRect(65, -14, 15, 28, 4); ctx.fill(); ctx.stroke();

        // Hammer Handle
        ctx.fillStyle = '#c0392b';
        ctx.fillRect(80, -6, 120, 12); ctx.strokeRect(80, -6, 120, 12);

        // Motion Blur during swing
        if (this.animState === 'SWINGING' || this.animState === 'SWINGING_FULL') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.beginPath(); ctx.moveTo(200, -45); ctx.lineTo(150, -80); ctx.lineTo(150, 20); ctx.lineTo(200, 45); ctx.fill();
        }

        // Classic Circus Mallet
        const woodGrad = ctx.createRadialGradient(210, 0, 5, 210, 0, 60);
        woodGrad.addColorStop(0, '#f39c12');
        woodGrad.addColorStop(0.5, '#e67e22');
        woodGrad.addColorStop(1, '#d35400');
        ctx.fillStyle = woodGrad;

        ctx.beginPath(); ctx.roundRect(180, -50, 60, 100, 15); ctx.fill(); ctx.stroke();

        // Painted Red Stripes
        ctx.fillStyle = '#c0392b';
        ctx.beginPath(); ctx.roundRect(180, -50, 60, 20, { tl: 15, tr: 15, bl: 0, br: 0 }); ctx.fill();
        ctx.strokeRect(180, -50, 60, 20);
        ctx.beginPath(); ctx.roundRect(180, 30, 60, 20, { tl: 0, tr: 0, bl: 15, br: 15 }); ctx.fill();
        ctx.strokeRect(180, 30, 60, 20);

        ctx.restore();
    }

    drawParticles(ctx) {
        ctx.save();
        this.impactParticles.forEach(p => {
            ctx.globalAlpha = p.life;
            ctx.fillStyle = p.color;
            ctx.save();
            ctx.translate(p.x, p.y);
            ctx.rotate(p.rot || 0);
            
            if (p.type === 'star') {
                ctx.beginPath();
                for (let i = 0; i < 5; i++) {
                    ctx.lineTo(Math.cos((i * 0.8) * Math.PI) * p.size, Math.sin((i * 0.8) * Math.PI) * p.size);
                }
                ctx.closePath();
                ctx.fill();
            } else {
                ctx.beginPath(); ctx.arc(0, 0, p.size, 0, Math.PI * 2); ctx.fill();
            }
            ctx.restore();
        });
        
        this.confetti.forEach(c => {
            ctx.save();
            ctx.translate(c.x, c.y);
            ctx.rotate(c.rot);
            ctx.fillStyle = c.color;
            ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
            ctx.restore();
        });
        ctx.restore();
    }

    drawBAM(ctx) {
        if (this.bamScale <= 0) return;

        ctx.save();
        const x = this.width / 2 - 140;
        const y = this.height - 140;

        ctx.translate(x, y);
        ctx.rotate(-Math.PI / 6);
        ctx.scale(this.bamScale, this.bamScale);

        ctx.font = '90px "Bangers", cursive';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 20;
        ctx.lineJoin = 'round';
        ctx.strokeText("BAM!", 0, 0);

        ctx.strokeStyle = '#e67e22';
        ctx.lineWidth = 10;
        ctx.strokeText("BAM!", 0, 0);

        ctx.fillStyle = '#f1c40f';
        ctx.fillText("BAM!", 0, 0);

        ctx.restore();
    }

    drawFloatingTexts(ctx) {
        this.floatingTexts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.life;
            ctx.fillStyle = t.color;
            ctx.font = 'bold 44px "Outfit", sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        });
    }

    drawCinematicEffects(ctx) {
        const cx = this.width / 2;
        const cy = this.height / 2;
        const r = Math.max(cx, cy) * 1.5;
        const gradient = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, r);
        gradient.addColorStop(0, 'rgba(0,0,0,0)');
        gradient.addColorStop(1, 'rgba(0,0,0,0.85)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, this.width, this.height);

        ctx.fillStyle = '#000';
        const barHeight = this.height * 0.08;
        ctx.fillRect(0, 0, this.width, barHeight);
        ctx.fillRect(0, this.height - barHeight, this.width, barHeight);
    }
}
