// Pickups: corn (+25), golden feather (shield), golden drumstick (+250), pumpkin pie (+100).
import { GROUND_Y, mulberry } from './config.js';

export function createPickups() { return { list: [], nextAt: 420, rng: mulberry(987654) }; }

export function updatePickups(pk, dt, distM, speed) {
  if (distM * 9 + 1280 > pk.nextAt) {
    const r = pk.rng();
    const kind = r < 0.55 ? 'corn' : r < 0.75 ? 'pie' : r < 0.9 ? 'feather' : 'drumstick';
    const n = kind === 'corn' ? 3 : 1;
    for (let i = 0; i < n; i++) {
      const y = kind === 'feather' ? GROUND_Y - 250 : (pk.rng() < 0.5 ? GROUND_Y - 90 : GROUND_Y - 190);
      pk.list.push({ kind, x: 1280 + 120 + i * 56, y, t: pk.rng() * 6, taken: false });
    }
    pk.nextAt += 520 + pk.rng() * 420;
  }
  for (const p of pk.list) { p.t += dt; p.x -= speed * dt; }
  pk.list = pk.list.filter((p) => p.x > -80 && !p.taken);
}

export function pickupBox(p) { return { x: p.x - 26, y: p.y - 26, w: 52, h: 52 }; }

export function drawPickup(ctx, p, time) {
  const bob = Math.sin(p.t * 4) * 6;
  ctx.save(); ctx.translate(p.x, p.y + bob);
  if (p.kind === 'corn') {
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.ellipse(0, 0, 13, 20, 0.3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4a900';
    for (let i = -1; i <= 1; i++) { ctx.beginPath(); ctx.arc(i * 5, -6, 3, 0, Math.PI * 2); ctx.fill(); ctx.beginPath(); ctx.arc(i * 5, 4, 3, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#4e9b2d';
    ctx.beginPath(); ctx.moveTo(-12, 8); ctx.quadraticCurveTo(-20, 22, -8, 20); ctx.closePath(); ctx.fill();
  } else if (p.kind === 'pie') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.ellipse(0, 4, 22, 10, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#e86a17';
    ctx.beginPath(); ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(0, -2, 4, 0, Math.PI * 2); ctx.fill();
  } else if (p.kind === 'feather') {
    ctx.fillStyle = 'rgba(255,215,0,.25)';
    ctx.beginPath(); ctx.arc(0, 0, 30 + Math.sin(time * 5) * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd700';
    ctx.beginPath(); ctx.ellipse(0, 0, 9, 22, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8dc'; ctx.beginPath(); ctx.ellipse(-3, -6, 4, 12, 0.4, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b8860b'; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(0, 20); ctx.lineTo(6, 30); ctx.stroke();
  } else if (p.kind === 'drumstick') {
    ctx.fillStyle = 'rgba(255,215,0,.25)';
    ctx.beginPath(); ctx.arc(0, 0, 32 + Math.sin(time * 5) * 3, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#c97b2d';
    ctx.beginPath(); ctx.ellipse(0, -4, 16, 20, 0.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff8dc';
    ctx.beginPath(); ctx.arc(-14, 16, 6, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(-6, 20, 6, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd700'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('+250', 0, -30);
  }
  ctx.restore();
}
