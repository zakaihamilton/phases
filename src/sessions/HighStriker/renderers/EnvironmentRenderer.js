export const drawEnvironment = (ctx, engine) => {
    const { width, height, time, grass, clouds, birds, balloons } = engine;
    const gradient = ctx.createLinearGradient(0, 0, 0, height * 0.6);
    gradient.addColorStop(0, '#0abde3');
    gradient.addColorStop(1, '#c8d6e5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height * 0.6);

    ctx.save();
    const sunX = width * 0.85;
    const sunY = height * 0.25;

    ctx.globalCompositeOperation = 'screen';
    const sunGrad = ctx.createRadialGradient(sunX, sunY, 30, sunX, sunY, 200);
    sunGrad.addColorStop(0, 'rgba(255, 255, 255, 1)');
    sunGrad.addColorStop(0.2, 'rgba(253, 203, 110, 0.8)');
    sunGrad.addColorStop(1, 'rgba(253, 203, 110, 0)');
    ctx.fillStyle = sunGrad;
    ctx.beginPath(); ctx.arc(sunX, sunY, 200, 0, Math.PI * 2); ctx.fill();

    ctx.translate(sunX, sunY);
    ctx.rotate(time * 0.05);
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
    ctx.fillRect(0, height * 0.6, width, height * 0.4);
    ctx.fillStyle = '#1dd1a1';
    ctx.fillRect(0, height * 0.6, width, 15);

    const baseY = height * 0.6;

    ctx.fillStyle = '#01a3a4';
    grass.forEach(g => {
        if (g.x > width + 50) return;
        const tilt = Math.sin(time * 2.5 + g.off) * 8;
        ctx.beginPath();
        ctx.moveTo(g.x, baseY + 4);
        ctx.quadraticCurveTo(g.x + tilt / 2, baseY - g.h / 2, g.x + tilt, baseY - g.h);
        ctx.lineTo(g.x + tilt + 3, baseY - g.h);
        ctx.quadraticCurveTo(g.x + 3 + tilt / 2, baseY - g.h / 2, g.x + 8, baseY + 4);
        ctx.fill();

        ctx.fillStyle = '#1dd1a1';
        ctx.beginPath();
        ctx.moveTo(g.x + 2, baseY + 4);
        ctx.quadraticCurveTo(g.x + tilt / 2 + 2, baseY - g.h / 3, g.x + tilt + 1, baseY - g.h / 2);
        ctx.lineTo(g.x + tilt + 2, baseY - g.h / 2);
        ctx.fill();

        if (g.off % 7 < 0.2) {
            ctx.fillStyle = g.off % 14 < 0.1 ? '#ff7675' : '#74b9ff';
            ctx.beginPath();
            ctx.arc(g.x + tilt + 1, baseY - g.h - 2, 3, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.fillStyle = '#01a3a4';
    });

    clouds.forEach(c => {
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
    birds.forEach(b => {
        if (b.x < -50 || b.x > width + 50) return;
        const flap = Math.sin(time * 10 + b.off) * 15 * b.scale;

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

    balloons.forEach(b => {
        if (b.x > width + 100) return;
        const by = b.y + Math.sin(time + b.offset) * 15;
        const scale = b.scale || 1.0;
        const bx = b.x;

        ctx.save();
        ctx.translate(bx, by);
        ctx.scale(scale, scale);

        ctx.strokeStyle = '#576574';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(-10, 20); ctx.lineTo(-12, 40);
        ctx.moveTo(10, 20); ctx.lineTo(12, 40);
        ctx.moveTo(-4, 25); ctx.lineTo(-4, 40);
        ctx.moveTo(4, 25); ctx.lineTo(4, 40);
        ctx.stroke();

        const colors = [b.color, '#ffffffdd', b.color];
        for (let i = 0; i < 3; i++) {
            ctx.fillStyle = colors[i];
            ctx.beginPath();
            const xOff = (i - 1) * 12;
            const w = i === 1 ? 14 : 22;
            ctx.ellipse(xOff, 0, w, 35, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.strokeStyle = 'rgba(0,0,0,0.1)';
            ctx.stroke();
        }

        const envelopeGrad = ctx.createRadialGradient(-10, -15, 5, 0, 0, 45);
        envelopeGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
        envelopeGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = envelopeGrad;
        ctx.beginPath();
        ctx.ellipse(0, 0, 32, 35, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = b.color;
        ctx.beginPath();
        ctx.moveTo(-18, 10);
        ctx.quadraticCurveTo(0, 35, 18, 10);
        ctx.fill();

        ctx.fillStyle = 'rgba(255, 159, 67, 0.4)';
        ctx.beginPath();
        ctx.arc(0, 32, 6, 0, Math.PI * 2);
        ctx.fill();

        const basketGrad = ctx.createLinearGradient(-12, 40, 12, 40);
        basketGrad.addColorStop(0, '#84817a');
        basketGrad.addColorStop(0.5, '#aaa69d');
        basketGrad.addColorStop(1, '#84817a');
        ctx.fillStyle = basketGrad;
        ctx.strokeStyle = '#222f3e';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.roundRect(-12, 40, 24, 16, 4);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(0,0,0,0.15)';
        ctx.beginPath(); ctx.moveTo(-12, 45); ctx.lineTo(12, 45); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(-12, 51); ctx.lineTo(12, 51); ctx.stroke();

        ctx.restore();
    });
};

export const drawFlora = (ctx, engine) => {
    const { width, height, time, trees, flowers } = engine;
    const baseY = height * 0.6;

    trees.forEach(t => {
        if (t.x < -100 || t.x > width + 100) return;

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

    flowers.forEach(f => {
        if (f.x < 0 || f.x > width) return;

        const wave = Math.sin(time * 2 + f.x) * 3;

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
};

export const drawPedestrians = (ctx, engine) => {
    const { width, height, time, pedestrians } = engine;
    const baseY = height * 0.6 + 15;

    pedestrians.forEach(p => {
        if (p.x < -100 || p.x > width + 100) return;

        const bob = Math.abs(Math.sin(time * 8 + p.off)) * 6 * p.scale;
        ctx.save();
        ctx.translate(p.x, baseY - bob);
        ctx.scale(p.scale, p.scale);

        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-8, -25, 16, 25, 6);
        ctx.fill();

        ctx.fillStyle = '#ffeaa7';
        ctx.beginPath();
        ctx.arc(0, -32, 6, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
    });
};

export const drawMidground = (ctx, engine) => {
    drawPedestrians(ctx, engine);
    const { width, height, time } = engine;
    const baseY = height * 0.6;

    // --- Ferris Wheel ---
    const fwX = width < 600 ? width * 1.1 : width * 0.82;
    const fwY = baseY - 130;
    const fwR = 120;
    const fwRot = time * 0.3;

    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 12;
    ctx.beginPath(); ctx.moveTo(fwX, fwY); ctx.lineTo(fwX + 60, baseY); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(fwX, fwY); ctx.lineTo(fwX - 60, baseY); ctx.stroke();

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.lineWidth = 15;
    ctx.beginPath(); ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2); ctx.stroke();
    ctx.restore();

    ctx.strokeStyle = '#747d8c';
    ctx.lineWidth = 8;
    ctx.beginPath(); ctx.arc(fwX, fwY, fwR, 0, Math.PI * 2); ctx.stroke();
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(fwX, fwY, fwR - 30, 0, Math.PI * 2); ctx.stroke();

    ctx.strokeStyle = 'rgba(87, 101, 116, 0.5)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 12; i++) {
        const angle = fwRot + (i * Math.PI / 6);
        ctx.beginPath();
        ctx.moveTo(fwX, fwY);
        ctx.lineTo(fwX + Math.cos(angle) * fwR, fwY + Math.sin(angle) * fwR);
        ctx.stroke();

        const lightOn = (Math.floor(time * 4) + i) % 3 === 0;
        if (lightOn) {
            ctx.save();
            ctx.fillStyle = i % 2 === 0 ? '#f1c40f' : '#ff4757';
            ctx.shadowColor = ctx.fillStyle;
            ctx.shadowBlur = 10;
            ctx.beginPath(); ctx.arc(fwX + Math.cos(angle) * fwR, fwY + Math.sin(angle) * fwR, 5, 0, Math.PI * 2); ctx.fill();
            ctx.restore();
        }
    }

    for (let i = 0; i < 12; i++) {
        const angle = fwRot + (i * Math.PI / 6);
        const cx = fwX + Math.cos(angle) * fwR;
        const cy = fwY + Math.sin(angle) * fwR;

        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(0);

        ctx.fillStyle = i % 2 === 0 ? '#ff6b81' : '#1e90ff';
        ctx.beginPath(); ctx.roundRect(-18, 0, 36, 42, 8); ctx.fill();
        ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 3; ctx.stroke();

        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fillRect(-14, 8, 28, 18);

        ctx.fillStyle = '#feca57';
        ctx.beginPath(); ctx.moveTo(-22, 0); ctx.lineTo(22, 0); ctx.lineTo(0, -18); ctx.fill(); ctx.stroke();

        ctx.strokeStyle = '#576574'; ctx.lineWidth = 2;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -10); ctx.stroke();

        ctx.restore();
    }

    const hubGrad = ctx.createRadialGradient(fwX, fwY, 5, fwX, fwY, 30);
    hubGrad.addColorStop(0, '#f1c40f');
    hubGrad.addColorStop(1, '#e67e22');
    ctx.fillStyle = hubGrad;
    ctx.beginPath(); ctx.arc(fwX, fwY, 20, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#2f3542'; ctx.lineWidth = 4; ctx.stroke();

    for (let i = 0; i < 8; i++) {
        const a = fwRot * 2 + (i * Math.PI / 4);
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.arc(fwX + Math.cos(a) * 12, fwY + Math.sin(a) * 12, 3, 0, Math.PI * 2); ctx.fill();
    }

    // --- Drop Tower ---
    const dtX = width < 600 ? width * 0.05 : width * 0.28;
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

    const dropCycle = (time * 0.3) % 1.0;
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
    const rcX = width < 600 ? width * -0.8 : width * 0.08;
    ctx.lineCap = 'butt';

    ctx.strokeStyle = '#5c3a21';
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

    ctx.lineWidth = 6;
    ctx.strokeStyle = '#c23616';
    ctx.beginPath();
    ctx.moveTo(rcX, baseY);
    ctx.quadraticCurveTo(rcX + 140, baseY - 280, rcX + 280, baseY);
    ctx.stroke();

    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ff7675';
    ctx.beginPath();
    ctx.moveTo(rcX, baseY);
    ctx.quadraticCurveTo(rcX + 140, baseY - 280, rcX + 280, baseY);
    ctx.stroke();

    const tC_base = (time * 0.15) % 1.5 - 0.2;

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
    const tentX = width < 600 ? width * 0.15 : width * 0.42;
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
    const cX = width < 600 ? width * 0.95 : width * 0.58;
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

        const hBounce = Math.sin(time * 2.5 + i) * 18;

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
    ctx.beginPath(); ctx.moveTo(0, 50); ctx.quadraticCurveTo(width / 2, 150 + Math.sin(time) * 20, width, 50); ctx.stroke();
    for (let i = 1; i < 25; i++) {
        const bT = i / 25;
        const bx = Math.pow(1 - bT, 2) * 0 + 2 * (1 - bT) * bT * (width / 2) + Math.pow(bT, 2) * width;
        const by = Math.pow(1 - bT, 2) * 50 + 2 * (1 - bT) * bT * (150 + Math.sin(time) * 20) + Math.pow(bT, 2) * 50;
        ctx.fillStyle = i % 2 === 0 ? '#ff4757' : '#1e90ff';
        ctx.beginPath(); ctx.moveTo(bx, by); ctx.lineTo(bx - 12, by + 25); ctx.lineTo(bx + 12, by + 25); ctx.fill();
        ctx.stroke();
    }
};