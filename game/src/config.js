// PARDON ME! — tuning + zones. All distances in metres, screen in px (1280x720).
export const W = 1280, H = 720, GROUND_Y = 604;
export const GOAL_M = 1500;
export const ZONES = [
  { from: 0,    to: 500,  name: 'FARMYARD',   sub: 'Golden dawn — run, Pip, run!',
    skyTop: '#ffb347', skyMid: '#ff8c42', skyBot: '#e86a33',
    sun: '#fff3b0', hillFar: '#c97b2d', hillNear: '#8a4b16', ground: '#7a4a1e', groundDark: '#5d3410',
    accent: '#ffd166', fog: 'rgba(255,190,90,.10)' },
  { from: 500,  to: 1000, name: 'CORNFIELD',  sub: 'Tall corn, deep orange — stay low, stay hidden',
    skyTop: '#ff7b2d', skyMid: '#e85d1f', skyBot: '#b83a12',
    sun: '#ffe08a', hillFar: '#a34d12', hillNear: '#6e2f08', ground: '#6b3d14', groundDark: '#4a2708',
    accent: '#ffb703', fog: 'rgba(255,140,40,.12)' },
  { from: 1000, to: 1500, name: 'KITCHEN YARD', sub: 'Violet dusk — the ovens are lit. 500 m to safety!',
    skyTop: '#5b2a86', skyMid: '#8e3b76', skyBot: '#e2603f',
    sun: '#ffd9a0', hillFar: '#5e2a4d', hillNear: '#3c1a30', ground: '#4a2a1a', groundDark: '#331a10',
    accent: '#ff9e5e', fog: 'rgba(140,60,140,.14)' },
];
export function zoneAt(m) { return ZONES[Math.min(2, Math.floor(m / 500))]; }
export const TUNING = {
  baseSpeed: 300,        // px/s world scroll at start
  maxSpeed: 560,
  speedPerMetre: 0.12,   // px/s gained per metre travelled
  gravity: 2600,
  jumpVel: -880,
  doubleJumpVel: -780,
  slideTime: 0.55,
  dashSpeed: 950, dashTime: 0.28, dashCooldown: 2.2,
  hideTime: 1.6,
  pxPerMetre: 9,
  stumbleFarmerGain: 46, // px closer per stumble
  farmerBaseGap: 210,    // px behind Pip when calm
  farmerCatchGap: 78,    // px -> caught if lives run out handled separately
};
export const SCORES = { corn: 25, pie: 100, drumstick: 250, metre: 1 };
export function mulberry(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
