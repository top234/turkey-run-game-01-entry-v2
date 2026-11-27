// Farmer Otis — chases from behind, closes in on stumbles, gets confused by hiding.
import { GROUND_Y, TUNING } from './config.js';

export function createFarmer() {
  return { gap: TUNING.farmerBaseGap, runPhase: 0, confused: 0, sprint: false, lookDir: 1, lookT: 0 };
}

export function updateFarmer(f, dt, speed, turkeyHidden, nearEnd) {
  f.runPhase += dt * (9 + speed / 55);
  if (turkeyHidden) {
    f.confused = Math.max(f.confused, 0.9);
    f.lookT -= dt; if (f.lookT <= 0) { f.lookDir *= -1; f.lookT = 0.45; }
  }
  if (f.confused > 0) { f.confused -= dt; return; }
  // drift back toward base gap when Pip runs clean; sprint in last 200 m
  const target = nearEnd ? TUNING.farmerBaseGap * 0.62 : TUNING.farmerBaseGap;
  f.gap += (target - f.gap) * Math.min(1, dt * 0.55);
  f.sprint = nearEnd;
}
export function farmerStumble(f) { f.gap = Math.max(96, f.gap - TUNING.stumbleFarmerGain); }
export function farmerX(f, turkeyX) { return turkeyX - f.gap; }

// Draw Otis: tall farmer, red plaid shirt, straw hat, overalls, running with dust puffs.
export function drawFarmer(ctx, f, x, time) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  const swing = Math.sin(f.runPhase) * 24;
  const confused = f.confused > 0;
  // dust puffs at feet
  ctx.fillStyle = 'rgba(214,178,120,.55)';
  for (let i = 0; i < 3; i++) {
    const p = ((time * 1.4 + i * 0.33) % 1);
    ctx.beginPath(); ctx.arc(-14 + i * 12 - p * 26, -6 - p * 22, 5 + p * 9, 0, Math.PI * 2); ctx.fill();
  }
  // legs (overalls)
  ctx.strokeStyle = '#3a5a8c'; ctx.lineWidth = 11; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(-6, -58); ctx.lineTo(-6 + swing * 0.5, 0); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(8, -58); ctx.lineTo(8 - swing * 0.5, 0); ctx.stroke();
  // body: red plaid shirt
  ctx.fillStyle = '#c0392b';
  ctx.beginPath(); ctx.ellipse(0, -102, 34, 48, 0.06, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,.55)'; ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(-30, -118); ctx.lineTo(30, -118); ctx.moveTo(-32, -96); ctx.lineTo(32, -96); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-8, -146); ctx.lineTo(-8, -58); ctx.moveTo(10, -146); ctx.lineTo(10, -58); ctx.stroke();
  // arms pumping
  ctx.strokeStyle = '#c0392b'; ctx.lineWidth = 9;
  ctx.beginPath(); ctx.moveTo(-26, -128); ctx.lineTo(-44, -96 + swing * 0.4); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(26, -128); ctx.lineTo(44, -96 - swing * 0.4); ctx.stroke();
  // head + straw hat
  ctx.fillStyle = '#f2c89b'; ctx.beginPath(); ctx.arc(4, -168, 21, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8c15a';
  ctx.beginPath(); ctx.ellipse(4, -182, 34, 9, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(4, -190, 20, 12, 0, Math.PI, 0); ctx.fill();
  ctx.fillStyle = '#7a5a1e'; ctx.fillRect(-16, -190, 40, 5);
  // angry eyes + moustache
  ctx.fillStyle = '#1a1a1a';
  const ex = confused ? 0 : (f.lookDir || 1) * 2;
  ctx.beginPath(); ctx.arc(-2 + ex, -170, 3, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(12 + ex, -170, 3, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#5a3a1a'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(-4, -156); ctx.quadraticCurveTo(6, -150, 16, -156); ctx.stroke();
  if (confused) {
    ctx.fillStyle = '#fff'; ctx.strokeStyle = '#222'; ctx.lineWidth = 3;
    ctx.font = 'bold 30px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('?', 4, -222); ctx.strokeText('?', 4, -222);
  }
  ctx.restore();
}
