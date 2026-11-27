// Parallax world: layered dusk sky, sun, barn + windmill, trees, fences, hay, pumpkins,
// foreground corn stalks, falling leaves and textured ground. Seeded so shots are stable.
import { W, H, GROUND_Y, mulberry } from './config.js';

export function createWorld(seed = 42) {
  const rng = mulberry(seed);
  const clouds = [], trees = [], fences = [], corns = [], pumpkins = [], hays = [], leaves = [];
  for (let i = 0; i < 9; i++) clouds.push({ x: rng() * 2600, y: 40 + rng() * 130, s: 0.7 + rng() * 0.9, v: 6 + rng() * 10 });
  for (let i = 0; i < 26; i++) trees.push({ x: i * 260 + rng() * 120, s: 0.8 + rng() * 0.7 });
  for (let i = 0; i < 40; i++) fences.push({ x: i * 130 + rng() * 40 });
  for (let i = 0; i < 34; i++) corns.push({ x: i * 150 + rng() * 70, h: 150 + rng() * 90, lean: (rng() - 0.5) * 0.3 });
  for (let i = 0; i < 18; i++) pumpkins.push({ x: i * 420 + rng() * 200, s: 0.7 + rng() * 0.8 });
  for (let i = 0; i < 12; i++) hays.push({ x: i * 700 + rng() * 300 });
  for (let i = 0; i < 46; i++) leaves.push({ x: rng() * W, y: rng() * 480, s: 0.6 + rng() * 0.9, ph: rng() * 6, vy: 26 + rng() * 30, vx: 14 + rng() * 26, col: i % 3 });
  return { clouds, trees, fences, corns, pumpkins, hays, leaves, scroll: 0 };
}

const LEAF_COLS = ['#e86a17', '#ffd23f', '#c0392b'];

export function drawWorld(ctx, world, zone, distPx, time, dt, zi) {
  const g = GROUND_Y;
  // sky
  const sky = ctx.createLinearGradient(0, 0, 0, g);
  sky.addColorStop(0, zone.skyTop); sky.addColorStop(0.55, zone.skyMid); sky.addColorStop(1, zone.skyBot);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, g);
  // sun (low, warm)
  ctx.fillStyle = zone.sun;
  ctx.beginPath(); ctx.arc(1050, 150, 52, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = 'rgba(255,240,180,.35)';
  ctx.beginPath(); ctx.arc(1050, 150, 74, 0, Math.PI * 2); ctx.fill();
  // clouds drift
  ctx.fillStyle = 'rgba(255,235,200,.75)';
  for (const c of world.clouds) {
    const x = (((c.x - distPx * 0.05 - time * c.v) % 2600) + 2600) % 2600 - 300;
    ctx.beginPath(); ctx.ellipse(x, c.y, 70 * c.s, 20 * c.s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(x + 46 * c.s, c.y + 8, 46 * c.s, 15 * c.s, 0, 0, Math.PI * 2); ctx.fill();
  }
  // far hills
  ctx.fillStyle = zone.hillFar;
  ctx.beginPath(); ctx.moveTo(0, 470);
  for (let x = 0; x <= W; x += 80) ctx.lineTo(x, 470 - Math.sin((x + distPx * 0.12) * 0.004) * 46 - 20);
  ctx.lineTo(W, g); ctx.lineTo(0, g); ctx.closePath(); ctx.fill();
  // barn + windmill (mid layer, scrolls slowly)
  const barnX = (((420 - distPx * 0.22) % 2400) + 2400) % 2400 - 400;
  drawBarn(ctx, barnX, g, zone);
  const millX = (((1500 - distPx * 0.22) % 2400) + 2400) % 2400 - 400;
  drawWindmill(ctx, millX, g, time, zone);
  // trees
  for (const t of world.trees) {
    const x = (((t.x - distPx * 0.35) % 6800) + 6800) % 6800 - 300;
    drawTree(ctx, x, g, t.s, zone);
  }
  // near hill
  ctx.fillStyle = zone.hillNear;
  ctx.beginPath(); ctx.moveTo(0, 540);
  for (let x = 0; x <= W; x += 80) ctx.lineTo(x, 540 - Math.sin((x + distPx * 0.3) * 0.006) * 22 - 8);
  ctx.lineTo(W, g); ctx.lineTo(0, g); ctx.closePath(); ctx.fill();
  // mid fence + pumpkins + hay bales
  for (const f of world.fences) {
    const x = (((f.x - distPx * 0.6) % 5200) + 5200) % 5200 - 200;
    ctx.fillStyle = '#7a4a1e'; ctx.fillRect(x, g - 52, 8, 52); ctx.fillRect(x + 62, g - 52, 8, 52);
    ctx.fillRect(x - 6, g - 46, 84, 8); ctx.fillRect(x - 6, g - 26, 84, 8);
  }
  for (const p of world.pumpkins) {
    const x = (((p.x - distPx * 0.6) % 7600) + 7600) % 7600 - 300;
    ctx.fillStyle = '#e86a17';
    ctx.beginPath(); ctx.ellipse(x, g - 16 * p.s, 26 * p.s, 20 * p.s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#3d7a1e'; ctx.fillRect(x - 2, g - 40 * p.s, 5, 10);
  }
  for (const h of world.hays) {
    const x = (((h.x - distPx * 0.6) % 8400) + 8400) % 8400 - 300;
    ctx.fillStyle = '#d9a441';
    ctx.beginPath(); ctx.ellipse(x, g - 22, 44, 24, 0, 0, Math.PI * 2); ctx.fill();
  }
  // ground
  const gg = ctx.createLinearGradient(0, g, 0, H);
  gg.addColorStop(0, zone.ground); gg.addColorStop(1, zone.groundDark);
  ctx.fillStyle = gg; ctx.fillRect(0, g, W, H - g);
  ctx.fillStyle = 'rgba(0,0,0,.25)'; ctx.fillRect(0, g, W, 5);
  // ground texture: pebbles + grass tufts scrolling at full speed
  ctx.fillStyle = 'rgba(0,0,0,.28)';
  for (let i = 0; i < 60; i++) {
    const x = (((i * 173 + 40 - distPx) % 1400) + 1400) % 1400 - 60;
    const y = g + 14 + ((i * 47) % 92);
    ctx.beginPath(); ctx.ellipse(x, y, 7, 3.5, 0, 0, Math.PI * 2); ctx.fill();
  }
  ctx.strokeStyle = 'rgba(120,190,60,.5)'; ctx.lineWidth = 2;
  for (let i = 0; i < 26; i++) {
    const x = (((i * 211 + 90 - distPx) % 1400) + 1400) % 1400 - 60;
    const y = g + 8 + ((i * 53) % 100);
    ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x - 4, y - 9); ctx.moveTo(x + 3, y); ctx.lineTo(x + 7, y - 8); ctx.stroke();
  }
  // speed lines when fast
  // (drawn by render.js)
  // falling leaves (foreground of sky, behind gameplay)
  for (const l of world.leaves) {
    l.y += l.vy * dt; l.x -= l.vx * dt + Math.sin(time * 2 + l.ph) * 22 * dt;
    if (l.y > g) { l.y = -12; l.x = 200 + ((l.x * 7 + 640) % 1100); }
    if (l.x < -20) l.x = W + 10;
    ctx.save(); ctx.translate(l.x, l.y); ctx.rotate(Math.sin(time * 3 + l.ph) * 0.9);
    ctx.fillStyle = LEAF_COLS[l.col];
    ctx.beginPath(); ctx.ellipse(0, 0, 7 * l.s, 4 * l.s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }
  // foreground corn stalks (tall in zone 2, shorter elsewhere) — frame the action
  const cornH = zi === 1 ? 1 : 0.55;
  for (const c of world.corns) {
    const x = (((c.x - distPx) % 5100) + 5100) % 5100 - 200;
    drawCornStalk(ctx, x, H, c.h * cornH, c.lean, zi);
  }
  // warm fog wash
  ctx.fillStyle = zone.fog; ctx.fillRect(0, 0, W, H);
}

function drawBarn(ctx, x, g, zone) {
  ctx.save(); ctx.translate(x, g);
  ctx.fillStyle = '#a93226';
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(110, -150); ctx.lineTo(110, 0); ctx.lineTo(0, 0); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(0, -150); ctx.lineTo(55, -200); ctx.lineTo(110, -150); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#7e241b'; ctx.fillRect(0, -150, 110, 10);
  ctx.fillStyle = '#f5e6c8'; ctx.fillRect(38, -72, 34, 72);
  ctx.strokeStyle = '#f5e6c8'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(38, -72); ctx.lineTo(72, 0); ctx.moveTo(72, -72); ctx.lineTo(38, 0); ctx.stroke();
  ctx.fillStyle = '#ffd166'; ctx.fillRect(14, -128, 22, 22); ctx.fillRect(74, -128, 22, 22);
  ctx.restore();
}
function drawWindmill(ctx, x, g, time, zone) {
  ctx.save(); ctx.translate(x, g);
  ctx.fillStyle = '#8a6a3b';
  ctx.beginPath(); ctx.moveTo(-16, 0); ctx.lineTo(-8, -170); ctx.lineTo(8, -170); ctx.lineTo(16, 0); ctx.closePath(); ctx.fill();
  ctx.save(); ctx.translate(0, -170); ctx.rotate(time * 0.7);
  ctx.fillStyle = '#e8dcc0';
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(10, -14); ctx.lineTo(52, -58); ctx.lineTo(44, -8); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
  ctx.fillStyle = '#5d3a18'; ctx.beginPath(); ctx.arc(0, -170, 9, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function drawTree(ctx, x, g, s, zone) {
  ctx.save(); ctx.translate(x, g); ctx.scale(s, s);
  ctx.fillStyle = '#5d3410'; ctx.fillRect(-7, -90, 14, 90);
  ctx.fillStyle = ziColor(zone);
  ctx.beginPath(); ctx.arc(0, -120, 46, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(-34, -96, 30, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(34, -96, 30, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
}
function ziColor(zone) { return zone.name === 'KITCHEN YARD' ? '#7a3a5e' : (zone.name === 'CORNFIELD' ? '#c96a1e' : '#d98a2b'); }
function drawCornStalk(ctx, x, baseY, h, lean, zi) {
  ctx.save(); ctx.translate(x, baseY); ctx.rotate(lean);
  ctx.strokeStyle = '#3f7a26'; ctx.lineWidth = 7; ctx.lineCap = 'round';
  ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -h); ctx.stroke();
  ctx.fillStyle = '#4e9b2d';
  ctx.beginPath(); ctx.ellipse(-16, -h * 0.55, 20, 8, -0.6, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(16, -h * 0.7, 20, 8, 0.6, 0, Math.PI * 2); ctx.fill();
  if (zi === 1) {
    ctx.fillStyle = '#ffd23f';
    ctx.beginPath(); ctx.ellipse(6, -h * 0.82, 8, 16, 0.15, 0, Math.PI * 2); ctx.fill();
  }
  ctx.restore();
}
