// Synthesised WebAudio SFX — no audio files, everything generated.
export function createAudio() {
  let ctx = null, muted = false, master = null;
  function ensure() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
      master = ctx.createGain(); master.gain.value = 0.35; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  function tone(freq, dur, type = 'sine', vol = 0.5, slideTo = null, delay = 0) {
    if (muted) return; const c = ensure(); if (!c) return;
    const t0 = c.currentTime + delay;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t0);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(Math.max(20, slideTo), t0 + dur);
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(vol, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + dur + 0.05);
  }
  function noise(dur, vol = 0.4, freq = 1200, delay = 0) {
    if (muted) return; const c = ensure(); if (!c) return;
    const t0 = c.currentTime + delay;
    const len = Math.floor(c.sampleRate * dur);
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const src = c.createBufferSource(); src.buffer = buf;
    const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = freq;
    const g = c.createGain(); g.gain.value = vol;
    src.connect(f); f.connect(g); g.connect(master); src.start(t0);
  }
  return {
    unlock() { ensure(); },
    toggleMute() { muted = !muted; return muted; },
    get muted() { return muted; },
    jump() { tone(280, 0.16, 'square', 0.22, 620); },
    doubleJump() { tone(420, 0.14, 'square', 0.2, 900); },
    slide() { noise(0.18, 0.25, 900); },
    dash() { noise(0.22, 0.35, 2600); tone(180, 0.2, 'sawtooth', 0.15, 520); },
    pickup() { tone(880, 0.09, 'sine', 0.35); tone(1320, 0.12, 'sine', 0.3, null, 0.07); },
    drumstick() { [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'triangle', 0.35, null, i * 0.07)); },
    shield() { tone(392, 0.2, 'triangle', 0.3, 784); },
    gobble() { // two low gobbles: "gob-gobble"
      tone(180, 0.09, 'sawtooth', 0.3, 120); tone(170, 0.09, 'sawtooth', 0.3, 110, 0.11);
      tone(190, 0.12, 'sawtooth', 0.28, 110, 0.24);
    },
    stumble() { noise(0.25, 0.5, 500); tone(220, 0.3, 'sawtooth', 0.3, 70); },
    alarm() { tone(660, 0.12, 'square', 0.18, 660); tone(520, 0.12, 'square', 0.18, 520, 0.14); },
    heartbeat() { tone(90, 0.1, 'sine', 0.6, 60); tone(80, 0.12, 'sine', 0.5, 55, 0.16); },
    zone() { [392, 523, 659].forEach((f, i) => tone(f, 0.16, 'triangle', 0.3, null, i * 0.09)); },
    fanfare() { [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, 0.3, 'triangle', 0.35, null, i * 0.11)); },
    caught() { [392, 330, 262, 196].forEach((f, i) => tone(f, 0.35, 'sawtooth', 0.25, null, i * 0.18)); },
    click() { tone(700, 0.05, 'square', 0.2); },
  };
}
