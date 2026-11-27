// Pip the turkey — the player. Big on screen (~150px tall), squash & stretch, run cycle.
import { GROUND_Y, TUNING } from './config.js';

export function createTurkey() {
  return {
    x: 400, y: GROUND_Y, vy: 0, w: 96, h: 150,
    jumps: 0, sliding: 0, dashing: 0, dashCd: 0, hiding: 0, hidden: false,
    shield: false, invuln: 0, runPhase: 0, squash: 1, dead: false,
    groundY: GROUND_Y,
  };
}

export function updateTurkey(t, dt, input, speed, sfx) {
  if (t.dashCd > 0) t.dashCd -= dt;
  if (t.invuln > 0) t.invuln -= dt;
  if (t.hiding > 0) { t.hiding -= dt; if (t.hiding <= 0) t.hidden = false; }
  const onGround = t.y >= t.groundY - 0.5;
  if (onGround) { t.y = t.groundY; t.vy = 0; t.jumps = 0; }
  // jump / double jump (edge-triggered by main via input.consume)
  if (input.consume(['Space', 'ArrowUp', 'KeyW', 'Pointer'])) {
    if (onGround) { t.vy = TUNING.jumpVel; t.jumps = 1; t.squash = 0.72; sfx.jump(); }
    else if (t.jumps < 2) { t.vy = TUNING.doubleJumpVel; t.jumps = 2; t.squash = 0.8; sfx.doubleJump(); }
  }
  // slide
  if (input.downAny(['ArrowDown', 'KeyS']) && onGround && t.sliding <= 0) {
    t.sliding = TUNING.slideTime; sfx.slide();
  }
  if (t.sliding > 0) t.sliding -= dt;
  // dash
  if (input.consume(['ShiftLeft', 'ShiftRight']) && t.dashCd <= 0) {
    t.dashing = TUNING.dashTime; t.dashCd = TUNING.dashCooldown; sfx.dash();
  }
  if (t.dashing > 0) t.dashing -= dt;
  // hold Down near a haystack/corn to hide — main.js sets t.wantHide
  if (t.wantHide && onGround && input.downAny(['ArrowDown', 'KeyS']) && !t.hidden) {
    t.hidden = true; t.hiding = TUNING.hideTime; sfx.gobble();
  }
  t.wantHide = false;
  // physics
  t.vy += TUNING.gravity * dt;
  t.y += t.vy * dt;
  if (t.y > t.groundY) { t.y = t.groundY; t.vy = 0; if (t.squash < 1) t.squash = 1.18; }
  t.runPhase += dt * (10 + speed / 60);
  t.squash += (1 - t.squash) * Math.min(1, dt * 10);
  return onGround;
}

export function turkeyBox(t) {
  if (t.sliding > 0) return { x: t.x - 52, y: t.y - 62, w: 116, h: 62 };
  if (t.hidden) return { x: t.x - 40, y: t.y - 60, w: 80, h: 60 };
  return { x: t.x - 44, y: t.y - t.h * t.squash, w: 88, h: t.h * t.squash };
}

// Draw Pip: big brown turkey, fanned tail, red wattle, orange beak, running legs.
export function drawTurkey(ctx, t, time) {
  ctx.save();
  ctx.translate(t.x, t.y);
  const sq = t.squash;
  ctx.scale(1 / Math.sqrt(sq), sq);
  if (t.invuln > 0 && Math.floor(time * 14) % 2 === 0) ctx.globalAlpha = 0.45;
  const legSwing = Math.sin(t.runPhase) * (t.y >= t.groundY - 1 ? 26 : 8);
  const air = t.y < t.groundY - 2;
  // tail fan (behind body)
  ctx.save(); ctx.translate(-34, -96); ctx.rotate(-0.25 + Math.sin(t.runPhase * 0.5) * 0.05);
  for (let i = -2; i <= 2; i++) {
    ctx.save(); ctx.rotate(i * 0.32);
    ctx.fillStyle = i % 2 === 0 ? '#8a5a2b' : '#6b421e';
    ctx.beginPath(); ctx.ellipse(0, -34, 13, 36, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e8a13c';
    ctx.beginPath(); ctx.ellipse(0, -58, 8, 12, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  ctx.restore();
  // legs
  ctx.strokeStyle = '#e8912d'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  const l1 = air ? 14 : legSwing, l2 = air ? -6 : -legSwing;
  ctx.beginPath(); ctx.moveTo(-8, -34); ctx.lineTo(-8 + l1 * 0.5, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(10, -34); ctx.lineTo(10 + l2 * 0.5, 0); ctx.stroke();
  // body
  const bodyGrad = ctx.createLinearGradient(0, -130, 0, -20);
  bodyGrad.addColorStop(0, '#a9713d'); bodyGrad.addColorStop(1, '#6e4420');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath(); ctx.ellipse(0, -78, 52, 58, -0.08, 0, Math.PI * 2); ctx.fill();
  // wing
  ctx.fillStyle = '#7d4f24';
  ctx.beginPath(); ctx.ellipse(-6, -72, 34, 26, -0.5 + Math.sin(t.runPhase) * 0.12, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5d3a18'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-30, -88); ctx.quadraticCurveTo(-12, -70, -30, -52); ctx.stroke();
  // head + neck
  ctx.fillStyle = '#8a5a2b';
  ctx.beginPath(); ctx.ellipse(38, -118, 16, 30, 0.25, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#a9713d';
  ctx.beginPath(); ctx.arc(48, -146, 24, 0, Math.PI * 2); ctx.fill();
  // beak
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath(); ctx.moveTo(66, -150); ctx.lineTo(92, -142); ctx.lineTo(66, -136); ctx.closePath(); ctx.fill();
  // wattle (red, bobbing)
  ctx.fillStyle = '#d7263d';
  ctx.beginPath(); ctx.ellipse(58, -128, 7, 12 + Math.sin(time * 9) * 2, 0.2, 0, Math.PI * 2); ctx.fill();
  // snood
  ctx.fillStyle = '#e63946';
  ctx.beginPath(); ctx.ellipse(72, -158, 5, 9, 0.5, 0, Math.PI * 2); ctx.fill();
  // eye
  ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(54, -152, 7, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#1a1a1a'; ctx.beginPath(); ctx.arc(56, -152, 3.5, 0, Math.PI * 2); ctx.fill();
  // golden shield ring
  if (t.shield) {
    ctx.strokeStyle = 'rgba(255,215,0,.9)'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.arc(0, -80, 96 + Math.sin(time * 5) * 4, 0, Math.PI * 2); ctx.stroke();
    ctx.fillStyle = 'rgba(255,215,0,.9)';
    ctx.font = 'bold 26px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('✦', 0, -186);
  }
  if (t.hidden) {
    ctx.fillStyle = 'rgba(20,20,20,.55)';
    ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('shhh…', 0, -190);
  }
  ctx.restore();
}
