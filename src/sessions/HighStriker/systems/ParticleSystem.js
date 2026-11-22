/**
 * Manages transient visual effects state (impact particles, confetti, shockwaves,
 * floating texts, and puck trail) for HighStriker.
 */
export default class ParticleSystem {
  constructor() {
    this.impactParticles = [];
    this.shockwaves = [];
    this.floatingTexts = [];
    this.puckTrail = [];
    this.confetti = [];
  }

  resetTrail() {
    this.puckTrail = [];
  }

  spawnImpactBurst(width, height) {
    this.shockwaves.push({ r: 10, alpha: 1.0, width: 30 });
    this.shockwaves.push({ r: 5, alpha: 0.8, width: 15 });

    this.floatingTexts.push({
      x: width / 2 - 100,
      y: height - 250,
      text: "CLANG!",
      life: 1.2,
      color: "#ff4757",
    });

    const colors = ["#ff9f43", "#feca57", "#fff", "#ff4757", "#00d2d3"];
    for (let i = 0; i < 120; i++) {
      const ang = Math.random() * Math.PI * 2;
      const vel = 400 + Math.random() * 1500;
      this.impactParticles.push({
        x: width / 2 - 90,
        y: height - 120,
        vx: Math.cos(ang) * vel,
        vy: -Math.abs(Math.sin(ang) * vel) - 300,
        life: 1.5 + Math.random() * 1.0,
        size: 5 + Math.random() * 10,
        color: colors[Math.floor(Math.random() * colors.length)],
        type: Math.random() > 0.5 ? "star" : "circle",
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 15,
      });
    }
  }

  spawnBellShockwave() {
    this.shockwaves.push({ r: 20, alpha: 1.0, isBell: true, width: 40 });
  }

  spawnConfetti(width, height) {
    const colors = ["#ff4757", "#2ed573", "#1e90ff", "#feca57", "#ff9ff3"];
    for (let i = 0; i < 200; i++) {
      this.confetti.push({
        x: Math.random() * width,
        y: Math.random() * (height * 0.4),
        vx: (Math.random() - 0.5) * 400,
        vy: 50 + Math.random() * 400,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 12,
        size: 10 + Math.random() * 12,
        color: colors[Math.floor(Math.random() * colors.length)],
      });
    }
  }

  spawnLevelBurst(width, height, towerHeight, ratio) {
    const baseX = width / 2 - 90;
    const baseY = height - 110;
    const y = baseY - towerHeight * ratio;

    for (let i = 0; i < 35; i++) {
      this.impactParticles.push({
        x: baseX - 24,
        y,
        vx: (Math.random() - 0.5) * 800,
        vy: (Math.random() - 0.5) * 800,
        life: 0.8 + Math.random() * 0.5,
        color: Math.random() > 0.5 ? "#00d2d3" : "#f1c40f",
        size: 3 + Math.random() * 5,
      });
    }
  }

  update(dt, { time, gravity, height, puckY, puckVy }) {
    for (let i = this.floatingTexts.length - 1; i >= 0; i--) {
      const t = this.floatingTexts[i];
      t.y -= dt * 60;
      t.life -= dt;
      if (t.life <= 0) this.floatingTexts.splice(i, 1);
    }

    for (const p of this.impactParticles) {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += gravity * 0.6 * dt;
      p.life -= dt * 0.8;
      if (p.rot !== undefined) p.rot += p.vrot * dt;
    }
    this.impactParticles = this.impactParticles.filter((p) => p.life > 0);

    for (const c of this.confetti) {
      c.x += c.vx * dt + Math.sin(time * 2.5 + c.y * 0.01) * 60 * dt;
      c.y += c.vy * dt;
      c.rot += c.vrot * dt;
    }
    this.confetti = this.confetti.filter((c) => c.y < height + 50);

    for (const s of this.shockwaves) {
      s.r += dt * 900;
      s.alpha -= dt * 2.0;
    }
    this.shockwaves = this.shockwaves.filter((s) => s.alpha > 0);

    if (puckY > 5 || puckVy > 0) {
      this.puckTrail.push({ y: puckY, life: 1.0 });
    }
    for (const t of this.puckTrail) {
      t.life -= dt * 5;
    }
    this.puckTrail = this.puckTrail.filter((t) => t.life > 0);
  }
}
