import { towerLevels } from '../data';

const drawBulb = (ctx, x, y, time, offset) => {
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
};

export const drawStrikerTower = (ctx, engine) => {
    const { width, height, towerHeight, puckY, animState, reachedLevels, activeTargetLevel, time, shockwaves, puckTrail, padScaleY, puckVy } = engine;

    const baseX = width < 600 ? width / 2 - 120 : width / 2 - 90;
    const baseY = height - 110;
    const tw = 48;

    ctx.strokeStyle = '#4b6584';
    ctx.lineWidth = 3;
    for (let i = 0; i < 10; i++) {
        const y1 = baseY - (i * towerHeight / 10);
        const y2 = baseY - ((i + 1) * towerHeight / 10);
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
    ctx.beginPath(); ctx.roundRect(baseX - tw / 2, baseY - towerHeight, tw, towerHeight, 5); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#1e272e';
    ctx.fillRect(baseX - 6, baseY - towerHeight + 10, 12, towerHeight - 10);

    const puckYCoord = baseY - puckY - 15;
    const tubeFill = ctx.createLinearGradient(0, baseY, 0, baseY - towerHeight);
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

    towerLevels.forEach(lvl => {
        const y = baseY - (towerHeight * lvl.ratio);

        const isReached = reachedLevels.has(lvl.id);
        const isTarget = (activeTargetLevel === lvl.id);

        const pulse = 0;
        const glowColor = isReached ? '#f1c40f' : (isTarget ? '#00d2d3' : '#34495e');
        const phaseMainColors = ['#196f3d', '#943126', '#1f618d', '#b7950b', '#34495e'];
        const phaseLightColors = ['#2ecc71', '#e74c3c', '#3498db', '#f1c40f', '#7f8c8d'];

        const boardColor = phaseMainColors[lvl.id];
        const innerBorder = phaseLightColors[lvl.id];
        const textColor = '#ffffff';

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

        if (isTarget) {
            const bTime = time * 6;
            const space = 14;
            for (let bx = boardX; bx <= boardX + boardW; bx += space) {
                drawBulb(ctx, bx, boardY, bTime, bx);
                drawBulb(ctx, bx, boardY + boardH, bTime, bx);
            }
            for (let by = boardY + space; by < boardY + boardH; by += space) {
                drawBulb(ctx, boardX, by, bTime, by);
                drawBulb(ctx, boardX + boardW, by, bTime, by);
            }
        } else {
            ctx.fillStyle = '#b2bec3';
            ctx.beginPath(); ctx.arc(boardX + 10, boardY + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(boardX + boardW - 10, boardY + 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(boardX + 10, boardY + boardH - 10, 3, 0, Math.PI * 2); ctx.fill();
            ctx.beginPath(); ctx.arc(boardX + boardW - 10, boardY + boardH - 10, 3, 0, Math.PI * 2); ctx.fill();
        }

        ctx.fillStyle = textColor;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = (isReached || isTarget) ? 8 : 0;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.font = `bold 20px "Outfit", sans-serif`;
        ctx.fillText(lvl.name, boardX + boardW / 2, y + 2);
        ctx.shadowBlur = 0;
    });

    const bellY = baseY - towerHeight - 25;

    shockwaves.forEach(s => {
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

    const stretch = Math.max(1, Math.min(1.8, Math.abs(puckVy) / 800));
    const puckW = 36 / stretch;
    const puckH = 20 * stretch;

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    puckTrail.forEach(t => {
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

    if (puckY > 10 || animState === 'RISING') {
        ctx.save();
        ctx.globalCompositeOperation = 'screen';
        ctx.fillStyle = 'rgba(0, 210, 211, 0.6)';
        ctx.beginPath(); ctx.ellipse(baseX, puckYCoord, puckW, puckH * 1.5, 0, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
    }

    const padW = 120;
    const padH = 35 * padScaleY;

    shockwaves.forEach(s => {
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
};