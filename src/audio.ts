// All sounds are synthesised with the Web Audio API. No audio files.

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let muted = false;

export function unlockAudio(): void {
  if (!ctx) {
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = muted ? 0 : 0.55;
    master.connect(ctx.destination);
  }
  if (ctx.state === 'suspended') void ctx.resume();
  // A silent blip fully unlocks iOS Safari.
  const b = ctx.createBuffer(1, 1, 22050);
  const s = ctx.createBufferSource();
  s.buffer = b;
  s.connect(ctx.destination);
  s.start(0);
}

export function setMuted(m: boolean): void {
  muted = m;
  if (master && ctx) master.gain.setTargetAtTime(m ? 0 : 0.55, ctx.currentTime, 0.02);
}

export function isMuted(): boolean {
  return muted;
}

interface ToneOpts {
  type?: OscillatorType;
  freq: number;
  to?: number;
  at?: number;
  dur: number;
  vol?: number;
  attack?: number;
}

function tone(o: ToneOpts): void {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + (o.at ?? 0);
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = o.type ?? 'sine';
  osc.frequency.setValueAtTime(o.freq, t0);
  if (o.to) osc.frequency.exponentialRampToValueAtTime(o.to, t0 + o.dur);
  const v = o.vol ?? 0.3;
  const a = o.attack ?? 0.01;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(v, t0 + a);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + o.dur);
  osc.connect(g);
  g.connect(master);
  osc.start(t0);
  osc.stop(t0 + o.dur + 0.05);
}

function noise(at: number, dur: number, vol: number, freq: number): void {
  if (!ctx || !master) return;
  const t0 = ctx.currentTime + at;
  const len = Math.floor(ctx.sampleRate * dur);
  const buf = ctx.createBuffer(1, len, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const f = ctx.createBiquadFilter();
  f.type = 'bandpass';
  f.frequency.value = freq;
  const g = ctx.createGain();
  g.gain.setValueAtTime(vol, t0);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  src.connect(f);
  f.connect(g);
  g.connect(master);
  src.start(t0);
}

const NOTE = (n: number): number => 440 * Math.pow(2, (n - 69) / 12);

export const sfx = {
  tap(): void {
    tone({ type: 'sine', freq: 660, to: 880, dur: 0.09, vol: 0.18 });
  },
  catch(): void {
    tone({ type: 'square', freq: 300, to: 900, dur: 0.18, vol: 0.12 });
    tone({ type: 'sine', freq: 900, to: 450, at: 0.16, dur: 0.25, vol: 0.2 });
    tone({ type: 'triangle', freq: NOTE(76), at: 0.05, dur: 0.15, vol: 0.15 });
  },
  miss(): void {
    tone({ type: 'sine', freq: 500, to: 180, dur: 0.25, vol: 0.22 });
    noise(0, 0.15, 0.08, 1800);
  },
  giggle(): void {
    for (let i = 0; i < 4; i++) tone({ type: 'triangle', freq: 700 + (i % 2) * 120, at: i * 0.08, dur: 0.07, vol: 0.12 });
  },
  sneak(): void {
    [0, 0.25, 0.5, 0.75].forEach((t, i) =>
      tone({ type: 'triangle', freq: NOTE(i % 2 ? 55 : 52), at: t, dur: 0.12, vol: 0.14 }),
    );
  },
  grab(): void {
    noise(0, 0.12, 0.15, 2500);
    tone({ type: 'sine', freq: 400, to: 800, at: 0.02, dur: 0.12, vol: 0.15 });
  },
  pickup(): void {
    tone({ type: 'sine', freq: 520, to: 780, dur: 0.12, vol: 0.18 });
  },
  floatBack(): void {
    tone({ type: 'sine', freq: 600, to: 350, dur: 0.4, vol: 0.14, attack: 0.05 });
  },
  clang(): void {
    tone({ type: 'square', freq: 220, dur: 0.35, vol: 0.08 });
    tone({ type: 'triangle', freq: 880, dur: 0.5, vol: 0.18 });
    tone({ type: 'sine', freq: 1320, at: 0.02, dur: 0.4, vol: 0.1 });
    noise(0, 0.08, 0.2, 3000);
  },
  cheer(): void {
    [72, 76, 79, 84].forEach((n, i) => tone({ type: 'triangle', freq: NOTE(n), at: i * 0.09, dur: 0.22, vol: 0.2 }));
    tone({ type: 'sine', freq: NOTE(88), at: 0.36, dur: 0.4, vol: 0.12 });
  },
  siren(): void {
    if (!ctx || !master) return;
    const t0 = ctx.currentTime;
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = 'triangle';
    for (let i = 0; i < 6; i++) {
      osc.frequency.setValueAtTime(i % 2 ? 587 : 784, t0 + i * 0.35);
    }
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.exponentialRampToValueAtTime(0.16, t0 + 0.05);
    g.gain.setValueAtTime(0.16, t0 + 1.95);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + 2.15);
    osc.connect(g);
    g.connect(master);
    osc.start(t0);
    osc.stop(t0 + 2.2);
  },
  fanfare(): void {
    const seq = [67, 72, 76, 79, 76, 79, 84];
    seq.forEach((n, i) => tone({ type: 'square', freq: NOTE(n), at: 0.1 + i * 0.12, dur: 0.18, vol: 0.07 }));
    seq.forEach((n, i) => tone({ type: 'triangle', freq: NOTE(n), at: 0.1 + i * 0.12, dur: 0.2, vol: 0.14 }));
  },
  sorry(): void {
    tone({ type: 'sine', freq: NOTE(67), dur: 0.3, vol: 0.18 });
    tone({ type: 'sine', freq: NOTE(64), at: 0.28, dur: 0.45, vol: 0.18 });
  },
  sticker(): void {
    [84, 88, 91, 96].forEach((n, i) => tone({ type: 'sine', freq: NOTE(n), at: i * 0.06, dur: 0.18, vol: 0.12 }));
  },
  cuff(): void {
    noise(0, 0.05, 0.25, 4000);
    tone({ type: 'square', freq: 1800, dur: 0.05, vol: 0.06 });
    noise(0.12, 0.05, 0.25, 4500);
    tone({ type: 'square', freq: 2100, at: 0.12, dur: 0.05, vol: 0.06 });
    tone({ type: 'triangle', freq: NOTE(79), at: 0.25, dur: 0.2, vol: 0.12 });
  },
  hint(): void {
    tone({ type: 'sine', freq: NOTE(81), dur: 0.15, vol: 0.08 });
    tone({ type: 'sine', freq: NOTE(86), at: 0.15, dur: 0.2, vol: 0.08 });
  },
};
