// PARDON ME! — The Great Turkey Escape: loop + state machine.
// States: title -> play <-> pause -> caught | escaped. Staged ?shot= scenes render frozen.
import { W, H, GROUND_Y, GOAL_M, TUNING, SCORES, zoneAt } from './config.js';
import { createInput, JUMP_KEYS, SLIDE_KEYS, DASH_KEYS, PAUSE_KEYS, MUTE_KEYS, RESTART_KEYS, START_KEYS } from './input.js';
import { createAudio } from './audio.js';
import { createTurkey, updateTurkey, turkeyBox, drawTurkey } from './turkey.js';
import { createFarmer, updateFarmer, farmerStumble, farmerX } from './farmer.js';
import { createObstacles, updateObstacles, obstacleBox, isHideSpot } from './obstacles.js';
import { createPickups, updatePickups, pickupBox } from './pickups.js';
import { createWorld } from './world.js';
import { drawFrame } from './render.js';
import { parseShot, applyShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const sfx = createAudio();
const shot = parseShot();

function freshState() {
  return {
    state: 'title', time: 0, dt: 0.016,
    distM: 0, distPx: 0, score: 0, lives: 3, combo: 0, comboT: 0,
    speed: TUNING.baseSpeed, zoneIdx: 0, bannerT: 0, shake: 0,
    hideHintT: 0, bestM: 0, bestScore: 0, slowT: 0, alarmT: 0, heartT: 0,
    turkey: createTurkey(), farmer: createFarmer(),
    obstacles: createObstacles(), pickups: createPickups(),
    world: createWorld(42), particles: [],
  };
}
let S = freshState();
try {
  S.bestM = Number(localStorage.getItem('pardonme.bestM') || 0);
  S.bestScore = Number(localStorage.getItem('pardonme.bestScore') || 0);
} catch { /* storage may be unavailable; bests just start at 0 */ }

function saveBest() {
  try {
    localStorage.setItem('pardonme.bestM', String(Math.floor(Math.max(S.bestM, S.distM))));
    localStorage.setItem('pardonme.bestScore', String(Math.floor(Math.max(S.bestScore, S.score))));
  } catch { /* ignore */ }
}

const input = createInput(canvas, (code) => {
  sfx.unlock();
  if (MUTE_KEYS.includes(code)) { const m = sfx.toggleMute(); statusEl.textContent = m ? 'Muted' : 'Sound on'; return; }
  if (S.state === 'title' && START_KEYS.includes(code)) { startRun(); return; }
  if ((S.state === 'caught' || S.state === 'escaped') && (RESTART_KEYS.includes(code) || code === 'Pointer' || code === 'Enter' || code === 'Space')) { startRun(); return; }
  if (S.state === 'play' && PAUSE_KEYS.includes(code)) { S.state = 'pause'; sfx.click(); return; }
  if (S.state === 'pause' && (PAUSE_KEYS.includes(code) || code === 'Pointer')) { S.state = 'play'; sfx.click(); return; }
  if (S.state === 'play' && RESTART_KEYS.includes(code)) { startRun(); return; }
});

function startRun() {
  const bestM = S.bestM, bestScore = S.bestScore;
  S = freshState();
  S.bestM = bestM; S.bestScore = bestScore;
  S.state = 'play'; S.bannerT = 2.2;
  sfx.gobble(); sfx.zone();
  statusEl.textContent = 'Run! Pip is escaping Farmer Otis.';
  input.flush();
}

function overlap(a, b) { return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y; }

function burst(x, y, color, n = 16) {
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2, v = 80 + Math.random() * 220;
    S.particles.push({ x, y, vx: Math.cos(a) * v, vy: Math.sin(a) * v - 80, r: 3 + Math.random() * 5, life: 0.7, color });
  }
}

function stumble(o) {
  if (S.turkey.shield) {
    S.turkey.shield = false; S.turkey.invuln = 1.2;
    burst(S.turkey.x, S.turkey.y - 90, '#ffd700', 20);
    sfx.shield(); statusEl.textContent = 'Shield saved Pip!';
    o.passed = true; return;
  }
  S.lives -= 1; S.combo = 0; S.shake = 14; S.turkey.invuln = 1.4;
  farmerStumble(S.farmer);
  burst(S.turkey.x, S.turkey.y - 90, '#a9713d', 22);
  sfx.stumble(); sfx.alarm();
  if (S.lives <= 0) {
    S.state = 'caught'; saveBest(); sfx.caught();
    statusEl.textContent = 'Caught! Farmer Otis got Pip.';
  } else {
    statusEl.textContent = 'Ouch! Pip stumbled — Otis is closer. ' + S.lives + ' hearts left.';
  }
  o.passed = true;
}

function step(dt) {
  S.time += dt;
  if (S.bannerT > 0) S.bannerT -= dt;
  if (S.shake > 0) S.shake = Math.max(0, S.shake - dt * 40);
  if (S.hideHintT > 0) S.hideHintT -= dt;
  if (S.comboT > 0) { S.comboT -= dt; if (S.comboT <= 0) S.combo = 0; }
  // particles always animate
  for (const p of S.particles) { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 500 * dt; p.life -= dt; }
  S.particles = S.particles.filter((p) => p.life > 0);
  if (S.state !== 'play') return;

  const zi = Math.min(2, Math.floor(S.distM / 500));
  if (zi !== S.zoneIdx) {
    S.zoneIdx = zi; S.bannerT = 2.4; sfx.zone();
    statusEl.textContent = 'Now entering ' + zoneAt(S.distM).name;
  }
  // speed: rises with distance, dash bursts, pie trap slows
  let target = Math.min(TUNING.maxSpeed, TUNING.baseSpeed + S.distM * TUNING.speedPerMetre);
  if (S.turkey.dashing > 0) target = TUNING.dashSpeed;
  if (S.slowT > 0) { S.slowT -= dt; target *= 0.55; }
  S.speed += (target - S.speed) * Math.min(1, dt * 3);
  const dx = S.speed * dt;
  S.distPx += dx;
  S.distM += dx / TUNING.pxPerMetre;
  S.score += dx / TUNING.pxPerMetre * SCORES.metre * (1 + S.combo * 0.1);

  // hide hint: a haystack is near and Pip is on the ground
  const nearHay = S.obstacles.list.find((o) => isHideSpot(o) && o.x > S.turkey.x - 40 && o.x < S.turkey.x + 260);
  if (nearHay && S.turkey.y >= GROUND_Y - 1) { S.hideHintT = 0.4; S.turkey.wantHide = true; }
  const onGround = updateTurkey(S.turkey, dt, input, S.speed, sfx);
  void onGround;
  updateFarmer(S.farmer, dt, S.speed, S.turkey.hidden, S.distM > GOAL_M - 200);
  updateObstacles(S.obstacles, dt, S.distM, S.speed, S.zoneIdx);
  updatePickups(S.pickups, dt, S.distM, S.speed);

  // farmer heartbeat + alarm when very close
  if (S.farmer.gap < 150) {
    S.heartT -= dt;
    if (S.heartT <= 0) { S.heartT = 0.55; sfx.heartbeat(); }
  }

  // pickups
  const tb = turkeyBox(S.turkey);
  for (const p of S.pickups.list) {
    if (!p.taken && overlap(tb, pickupBox(p))) {
      p.taken = true; S.combo += 1; S.comboT = 4;
      const mult = 1 + (S.combo - 1) * 0.1;
      if (p.kind === 'corn') { S.score += SCORES.corn * mult; sfx.pickup(); }
      if (p.kind === 'pie') { S.score += SCORES.pie * mult; sfx.pickup(); }
      if (p.kind === 'drumstick') { S.score += SCORES.drumstick * mult; sfx.drumstick(); burst(p.x, p.y, '#ffd700', 18); }
      if (p.kind === 'feather') { S.turkey.shield = true; sfx.shield(); }
      statusEl.textContent = 'Picked up ' + p.kind + '! Combo x' + S.combo + '.';
    }
  }

  // obstacles
  for (const o of S.obstacles.list) {
    if (o.passed) continue;
    if (isHideSpot(o) && S.turkey.hidden) { o.passed = true; continue; } // hidden: Otis walks past
    if (o.kind === 'pietrap' && overlap(tb, obstacleBox(o))) {
      o.passed = true; S.slowT = 1.6; S.combo = 0; sfx.stumble();
      statusEl.textContent = 'Sticky pie! Pip is slowed down.';
      continue;
    }
    if (S.turkey.invuln > 0) continue;
    if (overlap(tb, obstacleBox(o))) stumble(o);
  }

  // goal
  if (S.distM >= GOAL_M) {
    S.state = 'escaped'; saveBest(); sfx.fanfare(); sfx.gobble();
    statusEl.textContent = 'Escaped! Pip reached the Safe Coop.';
  }
}

// Staged screenshot mode: render the frozen scene every frame, no loop logic.
if (shot) {
  applyShot(S, shot);
  drawFrame(ctx, S);
  // keep rendering (leaves drift) but never advance gameplay
  setInterval(() => { S.time += 0.05; S.dt = 0.05; drawFrame(ctx, S); }, 50);
} else {
  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - last) / 1000 || 0.016);
    last = now; S.dt = dt;
    step(dt);
    drawFrame(ctx, S);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}
