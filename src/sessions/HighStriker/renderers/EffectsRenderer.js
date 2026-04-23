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

export const drawShockwaves = (ctx, engine) => {
    const { shockwaves, width, height } = engine;
    const baseX = width / 2 - 90;
    const baseY = height - 120;

    ctx.save();
    shockwaves.forEach(s => {
        ctx.strokeStyle = s.isBell ? '#f1c40f' : '#fff';
        ctx.lineWidth = s.width || 2;
        ctx.globalAlpha = s.alpha;
        
        ctx.shadowBlur = 15 * s.alpha;
        ctx.shadowColor = ctx.strokeStyle;

        ctx.beginPath();
        if (s.isBell) {
            // Bell shockwave at the top
            const bellY = (height - 120) - engine.towerHeight;
            ctx.arc(baseX + 66, bellY, s.r, 0, Math.PI * 2);
        } else {
            // Impact shockwave at bottom
            ctx.arc(baseX, baseY, s.r, 0, Math.PI * 2);
        }
        ctx.stroke();
    });
    ctx.restore();
};

export const drawPuckTrail = (ctx, engine) => {
    const { puckTrail, width, height, displayStep } = engine;
    const baseX = width / 2 - 24;
    const baseY = height - 110;

    const colors = engine.interpolatePhaseColors(displayStep);

    ctx.save();
    puckTrail.forEach((t, i) => {
        const y = baseY - t.y;
        const alpha = t.life * 0.4;
        const size = 20 * t.life;
        
        const grad = ctx.createRadialGradient(baseX, y, 0, baseX, y, size);
        grad.addColorStop(0, colors.light.replace('rgb', 'rgba').replace(')', `, ${alpha})`));
        grad.addColorStop(1, 'transparent');
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(baseX, y, size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.restore();
};

export const drawSpeedLines = (ctx, engine) => {
    const { puckVy, width, height, animState } = engine;
    if (animState !== 'RISING' || Math.abs(puckVy) < 800) return;

    const intensity = Math.min((Math.abs(puckVy) - 800) / 1000, 1.0);
    ctx.save();
    ctx.strokeStyle = `rgba(255, 255, 255, ${0.2 * intensity})`;
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 20; i++) {
        const x = Math.random() * width;
        const h = 100 + Math.random() * 300;
        const y = Math.random() * height;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x, y + h);
        ctx.stroke();
    }
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
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 10;
        ctx.fillText(t.text, t.x, t.y);
        ctx.restore();
    });
};

export const drawFlash = (ctx, engine) => {
    const { flashAlpha, flashColor, width, height } = engine;
    if (flashAlpha <= 0) return;

    ctx.save();
    ctx.globalAlpha = flashAlpha;
    ctx.fillStyle = flashColor || '#fff';
    ctx.fillRect(0, 0, width, height);
    ctx.restore();
};

export const drawCinematicEffects = (ctx, engine) => {
    const { width, height, vignetteIntensity, shake } = engine;

    const cx = width / 2;
    const cy = height / 2;
    const r = Math.max(cx, cy) * 1.5;

    // Enhanced Vignette with slight color tint
    const intensity = 0.4 + (vignetteIntensity * 0.5);
    const gradient = ctx.createRadialGradient(cx, cy, r * 0.2, cx, cy, r);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(0.8, `rgba(0,0,0,${intensity * 0.5})`);
    gradient.addColorStop(1, `rgba(20,0,0,${intensity})`);

    ctx.save();
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);

    // Letterbox bars
    ctx.fillStyle = '#000';
    const barHeight = height * 0.07;
    ctx.fillRect(0, 0, width, barHeight);
    ctx.fillRect(0, height - barHeight, width, barHeight);

    // Chromatic Aberration simulation on edges when shaking
    if (shake > 5) {
        ctx.globalCompositeOperation = 'screen';
        ctx.strokeStyle = 'rgba(255, 0, 0, 0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(2, 2, width - 4, height - 4);
        ctx.strokeStyle = 'rgba(0, 0, 255, 0.3)';
        ctx.strokeRect(-2, -2, width + 4, height + 4);
    }

    ctx.restore();
};