// Deterministic staging for screenshots: ?shot=title|play|hazard|escaped&seed=N
// renders that exact scene from the game's own code. No gameplay input needed.
import { mulberry } from './config.js';

export function parseShot() {
  const q = new URLSearchParams(location.search);
  const shot = q.get('shot');
  if (!shot) return null;
  const seed = Number(q.get('seed') || '7');
  return { shot, seed: Number.isFinite(seed) ? seed : 7, rng: mulberry(Number.isFinite(seed) ? seed : 7) };
}

// Build a frozen state for the requested shot, then main.js renders it.
export function applyShot(S, spec) {
  const { shot, rng } = spec;
  if (shot === 'title') {
    S.state = 'title'; S.time = 1.9; // sin(4*1.9)~+1: START prompt at full brightness S.distM = 0; S.zoneIdx = 0; S.distPx = 0;
    S.turkey.x = 400; S.turkey.y = 604;
    S.farmer.gap = 230;
    return;
  }
  if (shot === 'escaped') {
    S.state = 'escaped'; S.time = 1.0; S.distM = 1500; S.zoneIdx = 2; S.distPx = 1500 * 9;
    S.score = 12450; S.bestScore = 12450; S.bestM = 1500; S.lives = 2;
    S.turkey.x = 400; S.turkey.y = 604;
    return;
  }
  // play / hazard: dense mid-run action, zone 2 cornfield or zone 3 kitchen yard
  const zi = shot === 'hazard' ? 2 : 1;
  S.state = 'play'; S.zoneIdx = zi;
  S.distM = zi === 1 ? 720 : 1180; S.distPx = S.distM * 9; S.time = 2.4;
  S.score = zi === 1 ? 3850 : 9120; S.lives = zi === 1 ? 3 : 2; S.combo = zi === 1 ? 4 : 7;
  S.speed = 480;
  S.turkey.x = 400; S.turkey.y = 560; S.turkey.vy = -220; S.turkey.runPhase = 3;
  S.farmer.gap = shot === 'hazard' ? 108 : 150; // Otis close behind
  S.farmer.runPhase = 2;
  // staged obstacles + pickups, all visible in one frame
  S.obstacles.list = [];
  S.pickups.list = [];
  const kinds = zi === 1
    ? [{ kind: 'hay', x: 640 }, { kind: 'pumpkin', x: 880 }, { kind: 'knife', x: 1060, y: 470, t: 0.5, bob: 1 }, { kind: 'fence', x: 1220 }]
    : [{ kind: 'oven', x: 700 }, { kind: 'hangknife', x: 920, t: 0.4 }, { kind: 'knife', x: 1080, y: 470, t: 0.8, bob: 2 }, { kind: 'pietrap', x: 1180 }];
  for (const k of kinds) S.obstacles.list.push({ ...k, passed: false, slow: false, vx: 140 });
  const picks = zi === 1
    ? [{ kind: 'corn', x: 560, y: 520, t: 0 }, { kind: 'corn', x: 616, y: 520, t: 0 }, { kind: 'feather', x: 980, y: 360, t: 1 }]
    : [{ kind: 'drumstick', x: 800, y: 420, t: 0 }, { kind: 'pie', x: 1000, y: 520, t: 1 }, { kind: 'corn', x: 1140, y: 520, t: 0 }];
  for (const p of picks) S.pickups.list.push({ ...p, taken: false });
  void rng;
}
