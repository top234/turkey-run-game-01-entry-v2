// Keyboard + mouse/touch input. Edge-triggered actions queue up for main.js to consume.
export function createInput(canvas, onAction) {
  const keys = {};
  const pressed = new Set(); // edge queue, consumed by main loop
  function key(e) { return e.code || e.key; }
  window.addEventListener('keydown', (e) => {
    const k = key(e);
    if (['Space','ArrowUp','ArrowDown','KeyW','KeyS','ShiftLeft','ShiftRight','KeyP','KeyM','KeyR','Enter'].includes(k)) e.preventDefault();
    if (!e.repeat) { keys[k] = true; pressed.add(k); if (onAction) onAction(k); }
  });
  window.addEventListener('keyup', (e) => { keys[key(e)] = false; });
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    pressed.add('Pointer');
    if (onAction) onAction('Pointer');
  });
  window.addEventListener('blur', () => { for (const k in keys) keys[k] = false; });
  return {
    down(k) { return !!keys[k]; },
    downAny(list) { return list.some((k) => !!keys[k]); },
    // consume one queued press of any of these codes
    consume(list) {
      for (const k of list) if (pressed.has(k)) { pressed.delete(k); return k; }
      return null;
    },
    flush() { pressed.clear(); },
  };
}
export const JUMP_KEYS = ['Space', 'ArrowUp', 'KeyW', 'Pointer'];
export const SLIDE_KEYS = ['ArrowDown', 'KeyS'];
export const DASH_KEYS = ['ShiftLeft', 'ShiftRight'];
export const PAUSE_KEYS = ['KeyP'];
export const MUTE_KEYS = ['KeyM'];
export const RESTART_KEYS = ['KeyR'];
export const START_KEYS = ['Enter', 'Space', 'Pointer'];
