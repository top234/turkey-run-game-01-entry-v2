// All screen drawing: world + entities + HUD + title/pause/end screens.
import { W, H, GROUND_Y, GOAL_M, zoneAt } from './config.js';
import { drawWorld } from './world.js';
import { drawTurkey } from './turkey.js';
import { drawFarmer, farmerX } from './farmer.js';
import { drawObstacle } from './obstacles.js';
import { drawPickup } from './pickups.js';

export function drawFrame(ctx, S) {
  ctx.save();
  if (S.shake > 0) ctx.translate((Math.random() - 0.5) * S.shake, (Math.random() - 0.5) * S.shake);
  const zone = zoneAt(S.distM);
  drawWorld(ctx, S.world, zone, S.distPx, S.time, S.dt, S.zoneIdx);
  // speed lines
  if (S.speed > 430 && S.state === 'play') {
    ctx.strokeStyle = 'rgba(255,255,255,.35)'; ctx.lineWidth = 3;
    for (let i = 0; i < 8; i++) {
      const y = 90 + ((i * 97 + Math.floor(S.time * 900)) % 460);
      const x = 900 + ((i * 211) % 340);
      ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 70, y); ctx.stroke();
    }
  }
  // pickups behind obstacles
  for (const p of S.pickups.list) drawPickup(ctx, p, S.time);
  for (const o of S.obstacles.list) drawObstacle(ctx, o, S.time, S.zoneIdx);
  // feather burst particles
  for (const pt of S.particles) {
    ctx.fillStyle = pt.color;
    ctx.beginPath(); ctx.arc(pt.x, pt.y, pt.r, 0, Math.PI * 2); ctx.fill();
  }
  // farmer + turkey (farmer behind)
  const fx = farmerX(S.farmer, S.turkey.x);
  drawFarmer(ctx, S.farmer, fx, S.time);
  if (S.state !== 'caught') drawTurkey(ctx, S.turkey, S.time);
  // danger pulse when Otis is very close
  if (S.state === 'play' && S.farmer.gap < 150) {
    const a = 0.16 + 0.12 * Math.sin(S.time * 10);
    ctx.strokeStyle = `rgba(214,38,61,${a.toFixed(3)})`; ctx.lineWidth = 26;
    ctx.strokeRect(0, 0, W, H);
    ctx.fillStyle = '#ff2e4d'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('OTIS IS CLOSE!', W / 2, 152);
  }
  // zone banner
  if (S.bannerT > 0) {
    const a = Math.min(1, S.bannerT);
    ctx.globalAlpha = a;
    ctx.fillStyle = 'rgba(0,0,0,.45)'; ctx.fillRect(0, 210, W, 110);
    ctx.fillStyle = '#ffd166'; ctx.font = 'bold 54px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText(zone.name, W / 2, 268);
    ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif';
    ctx.fillText(zone.sub, W / 2, 302);
    ctx.globalAlpha = 1;
  }
  if (S.state === 'play' || S.state === 'pause') drawHUD(ctx, S);
  if (S.state === 'title') drawTitle(ctx, S);
  if (S.state === 'pause') drawPause(ctx, S);
  if (S.state === 'caught') drawCaught(ctx, S);
  if (S.state === 'escaped') drawEscaped(ctx, S);
  // hide hint
  if (S.state === 'play' && S.hideHintT > 0) {
    ctx.fillStyle = '#fff'; ctx.font = 'bold 22px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('Hold DOWN to HIDE in the hay!', W / 2, 140);
  }
  ctx.restore();
}

function drawHUD(ctx, S) {
  const zone = zoneAt(S.distM);
  ctx.fillStyle = 'rgba(20,10,4,.62)';
  roundRect(ctx, 14, 12, 660, 86, 12); ctx.fill();
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('SCORE ' + Math.floor(S.score), 30, 48);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 24px sans-serif';
  ctx.fillText(Math.floor(S.distM) + ' m', 30, 82);
  ctx.fillStyle = '#ffb703'; ctx.font = '20px sans-serif';
  ctx.fillText('SPEED ' + Math.round(S.speed / 10) + ' km/h', 300, 48);
  ctx.fillStyle = S.combo > 1 ? '#ff5d8f' : '#fff';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(S.combo > 1 ? 'COMBO x' + S.combo : 'COMBO x1', 300, 82);
  // hearts, spaced evenly inside the HUD panel
  ctx.font = '34px sans-serif';
  for (let i = 0; i < 3; i++) {
    ctx.fillStyle = i < S.lives ? '#ff2e4d' : 'rgba(255,255,255,.35)';
    ctx.fillText(i < S.lives ? '♥' : '♡', 560 + i * 38, 52);
  }
  // zone chip
  ctx.fillStyle = 'rgba(20,10,4,.62)';
  roundRect(ctx, W - 250, 12, 236, 40, 10); ctx.fill();
  ctx.fillStyle = zone.accent; ctx.font = 'bold 20px sans-serif'; ctx.textAlign = 'center';
  ctx.fillText('◆ ' + zone.name, W - 132, 40);
  // progress bar to Safe Coop
  const bw = 420, bx = W - bw - 14, by = 62;
  ctx.fillStyle = 'rgba(20,10,4,.62)'; roundRect(ctx, bx - 6, by - 6, bw + 12, 26, 10); ctx.fill();
  ctx.fillStyle = 'rgba(255,255,255,.25)'; roundRect(ctx, bx, by, bw, 14, 7); ctx.fill();
  ctx.fillStyle = '#7ee081'; roundRect(ctx, bx, by, bw * Math.min(1, S.distM / GOAL_M), 14, 7); ctx.fill();
  ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'right';
  ctx.fillText('SAFE COOP ' + GOAL_M + ' m', bx + bw, by + 34);
  ctx.fillStyle = '#ffd700'; ctx.font = '20px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText('⌂', bx + bw * Math.min(1, S.distM / GOAL_M) - 8, by - 2);
  // dash cooldown
  const d = Math.max(0, S.turkey.dashCd);
  ctx.fillStyle = 'rgba(20,10,4,.62)'; roundRect(ctx, 14, 108, 190, 30, 8); ctx.fill();
  ctx.fillStyle = d <= 0 ? '#7ee081' : '#ffb703'; ctx.font = 'bold 16px sans-serif'; ctx.textAlign = 'left';
  ctx.fillText(d <= 0 ? 'DASH READY [Shift]' : 'DASH … ' + d.toFixed(1) + 's', 26, 129);
  if (S.turkey.shield) {
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 18px sans-serif';
    ctx.fillText('✦ SHIELD', 220, 129);
  }
  ctx.textAlign = 'left';
}

function panel(ctx, x, y, w, h) {
  ctx.fillStyle = 'rgba(24,10,2,.82)';
  roundRect(ctx, x, y, w, h, 18); ctx.fill();
  ctx.strokeStyle = '#ffd166'; ctx.lineWidth = 3;
  roundRect(ctx, x, y, w, h, 18); ctx.stroke();
}
function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
}

function drawTitle(ctx, S) {
  ctx.fillStyle = 'rgba(20,8,2,.45)'; ctx.fillRect(0, 0, W, H);
  panel(ctx, 190, 56, 900, 600);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 74px sans-serif';
  ctx.fillText('PARDON ME!', W / 2, 150);
  ctx.fillStyle = '#fff'; ctx.font = 'bold 30px sans-serif';
  ctx.fillText('— The Great Turkey Escape —', W / 2, 192);
  ctx.fillStyle = '#ffe8b0'; ctx.font = '20px sans-serif';
  ctx.fillText('Pip the turkey is on the Thanksgiving menu tonight.', W / 2, 238);
  ctx.fillText('Farmer Otis is right behind him. Run 1500 m to the Safe Coop!', W / 2, 266);
  ctx.fillStyle = '#fff'; ctx.font = '20px sans-serif';
  ctx.fillText('SPACE / ↑ / W — jump (twice = double jump)      ↓ / S — slide / hide in hay', W / 2, 322);
  ctx.fillText('SHIFT — dash      P — pause      M — mute      R — restart', W / 2, 352);
  ctx.fillText('Corn +25 · Pumpkin pie +100 · Golden drumstick +250 · Golden feather = shield', W / 2, 382);
  ctx.fillText('Ovens, carving knives, fences, rolling pumpkins and sticky pie traps ahead.', W / 2, 412);
  ctx.fillStyle = '#7ee081'; ctx.font = 'bold 30px sans-serif';
  const blink = 0.65 + 0.35 * Math.sin(S.time * 4);
  ctx.globalAlpha = blink;
  ctx.fillText('Press ENTER or CLICK to START', W / 2, 486);
  ctx.globalAlpha = 1;
  ctx.fillStyle = '#ffb703'; ctx.font = '18px sans-serif';
  ctx.fillText('Best distance: ' + Math.floor(S.bestM) + ' m   ·   Best score: ' + Math.floor(S.bestScore), W / 2, 530);
  ctx.fillText('A free original game — no downloads, no sign-in, plays offline.', W / 2, 600);
}

function drawPause(ctx, S) {
  ctx.fillStyle = 'rgba(0,0,0,.55)'; ctx.fillRect(0, 0, W, H);
  panel(ctx, 440, 250, 400, 200);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 52px sans-serif';
  ctx.fillText('PAUSED', W / 2, 330);
  ctx.fillStyle = '#fff'; ctx.font = '22px sans-serif';
  ctx.fillText('P or click to keep running', W / 2, 382);
  ctx.fillText(Math.floor(S.distM) + ' m  ·  ' + Math.floor(S.score) + ' pts', W / 2, 414);
}

function drawCaught(ctx, S) {
  ctx.fillStyle = 'rgba(60,0,0,.5)'; ctx.fillRect(0, 0, W, H);
  panel(ctx, 290, 150, 700, 420);
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ff5d5d'; ctx.font = 'bold 84px sans-serif';
  ctx.fillText('CAUGHT!', W / 2, 260);
  ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
  ctx.fillText('Farmer Otis finally got his Thanksgiving dinner…', W / 2, 312);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 28px sans-serif';
  ctx.fillText('Distance: ' + Math.floor(S.distM) + ' m / ' + GOAL_M + ' m', W / 2, 372);
  ctx.fillText('Score: ' + Math.floor(S.score) + '  ·  Best: ' + Math.floor(S.bestScore), W / 2, 412);
  ctx.fillStyle = '#7ee081'; ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Press R or CLICK to run again', W / 2, 486);
}

function drawEscaped(ctx, S) {
  ctx.fillStyle = 'rgba(20,40,10,.45)'; ctx.fillRect(0, 0, W, H);
  panel(ctx, 240, 120, 800, 470);
  // golden coop
  ctx.fillStyle = '#ffd700';
  ctx.beginPath(); ctx.moveTo(400, 300); ctx.lineTo(640, 300); ctx.lineTo(640, 420); ctx.lineTo(400, 420); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#b8860b';
  for (let x = 420; x < 640; x += 28) ctx.fillRect(x, 306, 6, 108);
  ctx.fillStyle = '#ff9f1c';
  ctx.beginPath(); ctx.moveTo(390, 302); ctx.lineTo(520, 232); ctx.lineTo(650, 302); ctx.closePath(); ctx.fill();
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 76px sans-serif';
  ctx.fillText('ESCAPED!', W / 2, 200);
  ctx.fillStyle = '#fff'; ctx.font = '24px sans-serif';
  ctx.fillText('Pip made it to the Safe Coop — no Thanksgiving dinner tonight!', W / 2, 470);
  ctx.fillStyle = '#ffd166'; ctx.font = 'bold 26px sans-serif';
  ctx.fillText('1500 m  ·  Score ' + Math.floor(S.score) + '  ·  Best ' + Math.floor(S.bestScore), W / 2, 512);
  ctx.fillStyle = '#7ee081'; ctx.font = 'bold 24px sans-serif';
  ctx.fillText('Press R or CLICK to run again', W / 2, 552);
}
