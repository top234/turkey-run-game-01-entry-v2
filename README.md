# PARDON ME! — The Great Turkey Escape

[![make.fun bounty](https://make.fun/badge/turkey-run-game-01.svg)](https://make.fun/c/turkey-run-game-01)
[![rank](https://make.fun/badge/turkey-run-game-01/top234/turkey-run-game-01-entry-v2/rank.svg)](https://make.fun/c/turkey-run-game-01)
[![reward](https://make.fun/badge/turkey-run-game-01/top234/turkey-run-game-01-entry-v2/reward.svg)](https://make.fun/c/turkey-run-game-01)

Pip the turkey is on the Thanksgiving menu tonight — and Farmer Otis is right behind him.
Run 1500 metres through the Farmyard, the Cornfield and the Kitchen Yard to reach the Safe
Coop. A complete, original 2D canvas runner: hand-drawn vector art (no external assets),
synthesised WebAudio sounds (no audio files), three lives, combos, dash, double jump and
haystack hiding — all offline, no sign-in, no network requests.

## How to play

Serve the game (`node serve.ts`, then open http://localhost:8080) or open `game/index.html`
from any static server.

- **Space / ↑ / W** — jump (press twice for a double jump); **click** also jumps
- **↓ / S** — slide under carving knives; hold **↓** near a haystack to **hide** from Otis
- **Shift** — dash (short cooldown)
- **P** — pause · **M** — mute · **R** — restart · **Enter** — start

Dodge ovens, fences, rolling pumpkins, hanging knives and sticky pie traps. Grab corn
(+25), pumpkin pie (+100), golden drumsticks (+250) and golden feathers (a shield that
absorbs one hit). Every stumble brings Otis closer — three stumbles and you are caught.
Reach 1500 m and Pip is safe.

## Screenshots

Four real renders of the game's own code (`?shot=title|play|hazard|escaped`):

1. `1-title.jpg` — title screen
2. `2-run.jpg` — mid-run in the Cornfield, Otis closing in
3. `3-hazard.jpg` — Kitchen Yard: oven, hanging knife and pickups in one frame
4. `4-escaped.jpg` — ESCAPED! at the golden Safe Coop

## Files

- `game/index.html`, `game/style.css` — page + styles
- `game/src/config.js` — tuning + the three zones
- `game/src/input.js` — keyboard / mouse input
- `game/src/audio.js` — synthesised sound effects
- `game/src/turkey.js` — Pip, the player
- `game/src/farmer.js` — Farmer Otis, the chasing AI
- `game/src/obstacles.js` — ovens, knives, fences, hay, pumpkins, pie traps
- `game/src/pickups.js` — corn, pie, golden feather, golden drumstick
- `game/src/world.js` — parallax autumn world (barn, windmill, corn, falling leaves)
- `game/src/render.js` — drawing + HUD + title/pause/end screens
- `game/src/shots.js` — deterministic `?shot=` staging for screenshots
- `game/src/main.js` — game loop + state machine
- `main.ts` — the make.fun hand-in program (Node 22, stdlib only)
- `serve.ts` — tiny static server for local play

## License

MIT — see `LICENSE`.
