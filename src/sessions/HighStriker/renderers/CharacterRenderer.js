export const drawCharacter = (ctx, engine) => {
    const { width, height, time, animState, blinkTimer, eyeLookX, eyeLookY, windupTimer, swingTimer, hammerAngle, displayStep } = engine;
    const gx = width < 600 ? width / 2 + 130 : width / 2 + 100;
    const gy = height - 110;

    const colors = engine.interpolatePhaseColors(displayStep);

    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 4;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';

    const isIdle = animState === 'IDLE' || animState === 'WINDUP_HOLD';
    const breath = isIdle ? Math.sin(time * 4) * 2.5 : 0;
    const sway = isIdle ? Math.sin(time * 1.5) * 4 : 0;
    const footTap = isIdle && (time % 6 < 2) ? Math.max(0, Math.sin(time * 12)) * 4 : 0;

    const restAngle = Math.PI * 0.8;
    const leanAngle = (hammerAngle - restAngle) * 0.15 + (isIdle ? Math.sin(time * 2) * 0.02 : 0);

    let squashX = 1.0;
    let squashY = 1.0;
    if (animState === 'WINDING' || animState === 'WINDING_FULL') {
        const p = Math.min(windupTimer / 0.5, 1.0);
        squashX = 1.0 + Math.sin(p * Math.PI) * 0.1;
        squashY = 1.0 - Math.sin(p * Math.PI) * 0.1;
    } else if (animState === 'SWINGING' || animState === 'SWINGING_FULL') {
        const p = Math.min(swingTimer / 0.12, 1.0);
        squashX = 1.0 - Math.sin(p * Math.PI) * 0.15;
        squashY = 1.0 + Math.sin(p * Math.PI) * 0.15;
    }

    ctx.fillStyle = 'rgba(0,0,0,0.3)';
    ctx.beginPath(); ctx.ellipse(gx, gy, 45 * squashX, 12 * squashY, 0, 0, Math.PI * 2); ctx.fill();

    ctx.save();
    ctx.translate(gx + sway, gy);
    ctx.scale(squashX, squashY);
    ctx.translate(-(gx + sway), -gy);

    ctx.save();
    ctx.translate(gx + sway, gy - 60);

    const shakeMag = animState === 'WINDUP_HOLD' || animState === 'WINDUP_FULL' ? Math.sin(time * 60) * 1.5 : 0;
    ctx.translate(shakeMag, 0);

    ctx.rotate(leanAngle);
    ctx.translate(-gx, -(gy - 60));

    ctx.save();
    ctx.globalCompositeOperation = 'screen';
    ctx.shadowColor = colors.main;
    ctx.shadowBlur = 15 + Math.sin(time * 5) * 5;
    ctx.globalAlpha = 0.3 + Math.sin(time * 3) * 0.1;
    ctx.beginPath();
    ctx.roundRect(gx - 25, gy - 135 + breath, 50, 75, 25);
    ctx.fill();
    ctx.restore();

    const braceX = (animState === 'SWINGING' || animState === 'SWINGING_FULL') ? 10 : 0;
    ctx.fillStyle = colors.dark;
    ctx.beginPath(); ctx.roundRect(gx - 20 - braceX, gy - 65, 16, 45, 8); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(gx + 6 + braceX, gy - 65, 16, 45, 8); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#1e272e';
    ctx.beginPath(); ctx.roundRect(gx - 26 - braceX, gy - 25 - footTap, 26, 25, 10); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(gx + braceX, gy - 25, 26, 25, 10); ctx.fill(); ctx.stroke();

    const bodyGrad = ctx.createLinearGradient(gx - 50, gy - 130, gx + 30, gy - 130);
    bodyGrad.addColorStop(0, colors.dark);
    bodyGrad.addColorStop(0.5, colors.main);
    bodyGrad.addColorStop(1, colors.dark);
    ctx.fillStyle = bodyGrad;

    ctx.beginPath();
    ctx.moveTo(gx - 18, gy - 65 + breath);
    ctx.bezierCurveTo(gx - 55, gy - 75 + breath, gx - 55, gy - 135 + breath, gx - 15, gy - 135 + breath);
    ctx.bezierCurveTo(gx, gy - 140 + breath, gx + 25, gy - 130 + breath, gx + 25, gy - 110 + breath);
    ctx.bezierCurveTo(gx + 30, gy - 90 + breath, gx + 15, gy - 70 + breath, gx + 8, gy - 65 + breath);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath();
    ctx.moveTo(gx - 15, gy - 135 + breath);
    ctx.bezierCurveTo(gx, gy - 120 + breath, gx + 10, gy - 90 + breath, gx + 8, gy - 65 + breath);
    ctx.lineTo(gx, gy - 65 + breath);
    ctx.bezierCurveTo(gx + 5, gy - 90 + breath, gx - 5, gy - 120 + breath, gx - 25, gy - 132 + breath);
    ctx.fill();

    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.roundRect(gx - 25, gy - 70 + breath, 40, 16, 8); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#f1c40f';
    ctx.beginPath(); ctx.roundRect(gx - 12, gy - 74 + breath, 24, 24, 4); ctx.fill(); ctx.stroke();
    ctx.fillStyle = '#111';
    ctx.fillRect(gx - 4, gy - 68 + breath, 8, 12);

    const hy = gy + breath;

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

    const featherBounce = Math.sin(time * 8 + (squashY - 1) * 10) * 5;
    ctx.fillStyle = '#ff4757';
    ctx.beginPath();
    ctx.moveTo(gx + 8, hy - 165);
    ctx.quadraticCurveTo(gx + 30, hy - 190 + featherBounce, gx + 40, hy - 170 + featherBounce);
    ctx.quadraticCurveTo(gx + 35, hy - 160, gx + 8, hy - 160);
    ctx.fill(); ctx.stroke();

    ctx.beginPath(); ctx.arc(gx + 5, hy - 135, 6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.moveTo(gx + 10, hy - 145);
    ctx.bezierCurveTo(gx + 15, hy - 175, gx - 20, hy - 180, gx - 25, hy - 160);
    ctx.bezierCurveTo(gx - 15, hy - 165, gx + 5, hy - 155, gx + 10, hy - 145);
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#e67e22';
    ctx.beginPath(); ctx.arc(gx - 35, hy - 135, 8, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    const isBlinking = blinkTimer < 0;
    if (isBlinking) {
        ctx.beginPath(); ctx.moveTo(gx - 28, hy - 144); ctx.lineTo(gx - 18, hy - 144); ctx.stroke();
    } else {
        ctx.fillStyle = '#fff';
        ctx.beginPath(); ctx.ellipse(gx - 22, hy - 144, 5, 7, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = '#3498db';
        ctx.beginPath(); ctx.arc(gx - 22 + eyeLookX, hy - 144 + eyeLookY, 2.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#111';
        ctx.beginPath(); ctx.arc(gx - 22 + eyeLookX, hy - 144 + eyeLookY, 1.5, 0, Math.PI * 2); ctx.fill();
    }

    ctx.lineWidth = 5;
    if (animState === 'SWINGING' || animState === 'SWINGING_FULL') {
        ctx.beginPath(); ctx.moveTo(gx - 12, hy - 150); ctx.lineTo(gx - 30, hy - 145); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(gx - 15, hy - 152); ctx.lineTo(gx - 30, hy - 154); ctx.stroke();
    }
    ctx.lineWidth = 4;

    ctx.fillStyle = '#2f3542';
    ctx.beginPath();
    ctx.moveTo(gx - 15, hy - 128);
    ctx.quadraticCurveTo(gx - 45, hy - 125, gx - 50, hy - 140);
    ctx.quadraticCurveTo(gx - 40, hy - 130, gx - 25, hy - 120);
    ctx.closePath();
    ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#444';
    ctx.strokeStyle = '#2f3542';
    ctx.lineWidth = 2;
    if (animState === 'SWINGING' || animState === 'SWINGING_FULL') {
        ctx.beginPath(); ctx.ellipse(gx - 35, hy - 118, 4, 6, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    } else if (isIdle) {
        ctx.beginPath(); ctx.arc(gx - 35, hy - 122, 6, 0.4, Math.PI - 0.4); ctx.stroke();
    } else {
        ctx.beginPath(); ctx.moveTo(gx - 40, hy - 120); ctx.lineTo(gx - 30, hy - 120); ctx.stroke();
    }

    ctx.restore();

    const pivotOffsetX = -20 + (isIdle ? sway * 0.2 : 0);
    const pivotOffsetY = -120 + breath;
    const rotCos = Math.cos(leanAngle);
    const rotSin = Math.sin(leanAngle);
    const shoulderX = gx + (pivotOffsetX * rotCos - pivotOffsetY * rotSin);
    const shoulderY = (gy - 60) + (pivotOffsetX * rotSin + pivotOffsetY * rotCos) + 60;

    ctx.lineWidth = 4;
    ctx.save();
    ctx.translate(shoulderX, shoulderY);
    ctx.rotate(hammerAngle);

    ctx.fillStyle = colors.main;

    ctx.beginPath(); ctx.roundRect(30, -12, 45, 24, 12); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.roundRect(10, -15, 35, 30, 15); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, 20, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#111';
    ctx.beginPath(); ctx.roundRect(65, -14, 15, 28, 4); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#c0392b';
    ctx.fillRect(80, -6, 120, 12); ctx.strokeRect(80, -6, 120, 12);

    if (animState === 'SWINGING' || animState === 'SWINGING_FULL') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.beginPath(); ctx.moveTo(200, -45); ctx.lineTo(150, -80); ctx.lineTo(150, 20); ctx.lineTo(200, 45); ctx.fill();
    }

    const woodGrad = ctx.createRadialGradient(210, 0, 5, 210, 0, 60);
    woodGrad.addColorStop(0, '#f39c12');
    woodGrad.addColorStop(0.5, '#e67e22');
    woodGrad.addColorStop(1, '#d35400');
    ctx.fillStyle = woodGrad;

    ctx.beginPath(); ctx.roundRect(180, -50, 60, 100, 15); ctx.fill(); ctx.stroke();

    ctx.fillStyle = '#c0392b';
    ctx.beginPath(); ctx.roundRect(180, -50, 60, 20, { tl: 15, tr: 15, bl: 0, br: 0 }); ctx.fill();
    ctx.strokeRect(180, -50, 60, 20);
    ctx.beginPath(); ctx.roundRect(180, 30, 60, 20, { tl: 0, tr: 0, bl: 15, br: 15 }); ctx.fill();
    ctx.strokeRect(180, 30, 60, 20);

    ctx.restore();
    ctx.restore();
};