// Obstacles: oven, floating carving knife, fence, haystack (jump or hide), rolling
// pumpkin, sticky pie trap, hanging knife (zone 3). Spawned by distance, scaled by zone.
import { GROUND_Y, mulberry } from './config.js';

const KINDS = ['oven', 'knife', 'fence', 'hay', 'pumpkin', 'pietrap', 'hangknife'];
export function kindsForZone(zi) {
  if (zi === 0) return ['oven', 'knife', 'fence', 'hay', 'pumpkin'];
  if (zi === 1) return ['oven', 'knife', 'fence', 'hay', 'pumpkin', 'pietrap'];
  return ['oven', 'knife', 'fence', 'hay', 'pumpkin', 'pietrap', 'hangknife'];
}

export function createObstacles() { return { list: [], nextAt: 260, rng: mulberry(1234567) }; }

export function updateObstacles(ob, dt, distM, speed, zi) {
  const kinds = kindsForZone(zi);
  if (distM * 9 + 1280 > ob.nextAt) {
    const kind = kinds[Math.floor(ob.rng() * kinds.length)];
    const x = 1280 + 120;
    const o = { kind, x, passed: false, t: 0, slow: false };
    if (kind === 'pumpkin') o.vx = 120 + ob.rng() * 80;
    if (kind === 'knife') o.bob = ob.rng() * 6;
    ob.list.push(o);
    const gap = 340 + ob.rng() * 260 - Math.min(120, zi * 50);
    ob.nextAt += gap;
  }
  for (const o of ob.list) {
    o.t += dt;
    o.x -= speed * dt;
    if (o.kind === 'pumpkin') o.x -= (o.vx || 120) * dt;
    if (o.kind === 'knife') o.y = GROUND_Y - 150 + Math.sin(o.t * 3 + o.bob) * 26;
  }
  ob.list = ob.list.filter((o) => o.x > -260);
}

export function obstacleBox(o) {
  switch (o.kind) {
    case 'oven': return { x: o.x - 52, y: GROUND_Y - 118, w: 104, h: 118 };
    case 'knife': return { x: o.x - 62, y: (o.y || GROUND_Y - 150) - 14, w: 124, h: 28 };
    case 'fence': return { x: o.x - 46, y: GROUND_Y - 84, w: 92, h: 84 };
    case 'hay': return { x: o.x - 58, y: GROUND_Y - 96, w: 116, h: 96 };
    case 'pumpkin': return { x: o.x - 34, y: GROUND_Y - 66, w: 68, h: 66 };
    case 'pietrap': return { x: o.x - 56, y: GROUND_Y - 26, w: 112, h: 26 };
    case 'hangknife': return { x: o.x - 16, y: GROUND_Y - 210, w: 32, h: 210 };
    default: return { x: o.x, y: GROUND_Y - 50, w: 50, h: 50 };
  }
}
export function isHideSpot(o) { return o.kind === 'hay'; }

export function drawObstacle(ctx, o, time, zi) {
  const g = GROUND_Y;
  ctx.save(); ctx.translate(o.x, 0);
  if (o.kind === 'oven') {
    ctx.fillStyle = '#2b2b30';
    ctx.fillRect(-52, g - 118, 104, 118);
    ctx.fillStyle = '#3d3d44'; ctx.fillRect(-58, g - 128, 116, 12);
    ctx.fillStyle = '#ff7b1c';
    ctx.beginPath(); ctx.ellipse(0, g - 62, 34, 26, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd166';
    ctx.beginPath(); ctx.ellipse(0, g - 62, 20, 15, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd166';
    for (let i = -1; i <= 1; i++) {
      const fl = 10 + Math.sin(time * 9 + i * 2) * 4;
      ctx.beginPath(); ctx.moveTo(i * 18 - 6, g - 84); ctx.quadraticCurveTo(i * 18, g - 84 - fl - 8, i * 18 + 6, g - 84); ctx.fill();
    }
    ctx.fillStyle = '#888'; ctx.fillRect(-40, g - 112, 80, 8);
    ctx.fillStyle = '#ff5d3a'; ctx.beginPath(); ctx.arc(34, g - 108, 5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 15px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('OVEN!', 0, g - 140);
  } else if (o.kind === 'knife') {
    const y = o.y || g - 150;
    ctx.save(); ctx.translate(0, y); ctx.rotate(Math.sin(o.t * 3) * 0.08);
    ctx.fillStyle = '#dfe6ee';
    ctx.beginPath(); ctx.moveTo(-62, -6); ctx.lineTo(18, -12); ctx.lineTo(62, 0); ctx.lineTo(18, 12); ctx.lineTo(-62, 6); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = '#9aa5b1'; ctx.lineWidth = 2; ctx.stroke();
    ctx.fillStyle = '#6b421e'; ctx.fillRect(-62, -8, -14, 16);
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('SLIDE!', 0, -24);
    ctx.restore();
  } else if (o.kind === 'fence') {
    ctx.fillStyle = '#8a5a2b';
    ctx.fillRect(-46, g - 84, 10, 84); ctx.fillRect(36, g - 84, 10, 84); ctx.fillRect(-8, g - 84, 10, 84);
    ctx.fillRect(-52, g - 78, 104, 12); ctx.fillRect(-52, g - 46, 104, 12);
    ctx.fillStyle = '#a9713d';
    ctx.beginPath(); ctx.moveTo(-51, g - 84); ctx.lineTo(-41, g - 96); ctx.lineTo(-31, g - 84); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.moveTo(31, g - 84); ctx.lineTo(41, g - 96); ctx.lineTo(51, g - 84); ctx.closePath(); ctx.fill();
  } else if (o.kind === 'hay') {
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.ellipse(0, g - 48, 60, 48, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b07f22'; ctx.lineWidth = 3;
    for (let i = -2; i <= 2; i++) {
      ctx.beginPath(); ctx.arc(0, g - 48, 26 + Math.abs(i) * 10, 0.3 + i * 0.25, Math.PI - 0.3 - i * 0.25); ctx.stroke();
    }
    ctx.fillStyle = '#fff'; ctx.font = 'bold 14px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('HIDE ↓', 0, g - 108);
  } else if (o.kind === 'pumpkin') {
    const roll = (o.t * 6) % (Math.PI * 2);
    ctx.save(); ctx.translate(0, g - 33); ctx.rotate(roll);
    ctx.fillStyle = '#e86a17';
    ctx.beginPath(); ctx.ellipse(0, 0, 34, 30, 0, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = '#b84d0c'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(-14, 0, 0, 30); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(0, -30); ctx.quadraticCurveTo(14, 0, 0, 30); ctx.stroke();
    ctx.fillStyle = '#3d7a1e'; ctx.fillRect(-3, -38, 6, 12);
    ctx.restore();
  } else if (o.kind === 'pietrap') {
    ctx.fillStyle = '#c98a4b';
    ctx.beginPath(); ctx.ellipse(0, g - 10, 56, 14, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#a3541e';
    ctx.beginPath(); ctx.ellipse(0, g - 14, 44, 9, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = 'bold 13px sans-serif'; ctx.textAlign = 'center';
    ctx.fillText('STICKY PIE!', 0, g - 34);
  } else if (o.kind === 'hangknife') {
    ctx.strokeStyle = '#caa96a'; ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(0, -40); ctx.lineTo(0, g - 210); ctx.stroke();
    ctx.save(); ctx.translate(0, g - 150); ctx.rotate(Math.sin(o.t * 2.2) * 0.16);
    ctx.fillStyle = '#dfe6ee';
    ctx.beginPath(); ctx.moveTo(-12, -70); ctx.lineTo(12, -70); ctx.lineTo(16, 60); ctx.lineTo(0, 78); ctx.lineTo(-16, 60); ctx.closePath(); ctx.fill();
    ctx.fillStyle = '#6b421e'; ctx.fillRect(-12, -88, 24, 20);
    ctx.restore();
  }
  ctx.restore();
}
