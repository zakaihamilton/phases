export const drawParticles = (ctx, engine) => {
    const { impactParticles, confetti } = engine;

    ctx.save();
    impactParticles.forEach(p => {
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

    confetti.forEach(c => {
        ctx.save();
        ctx.translate(c.x, c.y);
        ctx.rotate(c.rot);
        ctx.fillStyle = c.color;
        ctx.fillRect(-c.size / 2, -c.size / 4, c.size, c.size / 2);
        ctx.restore();
    });
    ctx.restore();
};

export const drawBAM = (ctx, engine) => {
    const { width, height, bamScale } = engine;
    if (bamScale <= 0) return;

    ctx.save();
    const x = width / 2 - 140;
    const y = height - 140;

    ctx.translate(x, y);
    ctx.rotate(-Math.PI / 6);
    ctx.scale(bamScale, bamScale);

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
};

export const drawFloatingTexts = (ctx, engine) => {
    const { floatingTexts } = engine;
    floatingTexts.forEach(t => {
        ctx.save();
        ctx.globalAlpha = t.life;
        ctx.fillStyle = t.color;
        ctx.font = 'bold 44px "Outfit", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

export const drawCinematicEffects = (ctx, engine) => {
    const { width, height, vignetteIntensity } = engine;

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(cx, cy) * 1.5;

    const intensity = 0.4 + (vignetteIntensity * 0.45);
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.3, cx, cy, r);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, `rgba(0,0,0,${intensity})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    ctx.fillStyle = '#000';
    const barHeight = height * 0.06;
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);
    ctx.restore();
};