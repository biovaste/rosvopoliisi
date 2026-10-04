// Finnish voice lines: pre-generated clips in assets/voice/<slot>/<key>-<n>.mp3
// (see tools/make_voice.py). Each character gets a voice slot that matches
// their role and gender. A line without clips is silently skipped, so the game
// plays the same with no voice files at all.

import { audioOut, duck } from './audio';
import type { Costume, Look, Role } from './people';
import type { Owner } from './state';

const urls = import.meta.glob('./assets/voice/*/*.mp3', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

/** slot -> line key -> clip urls */
const clips = new Map<string, Map<string, string[]>>();
for (const [path, url] of Object.entries(urls)) {
  const m = /\/voice\/([^/]+)\/(.+)-\d+\.mp3$/.exec(path);
  if (!m) continue;
  let lines = clips.get(m[1]);
  if (!lines) clips.set(m[1], (lines = new Map()));
  lines.set(m[2], [...(lines.get(m[2]) ?? []), url]);
}

const VOICE_GAIN = 1.5;
/** A queued line is dropped if it would start this much later than asked. */
const MAX_DELAY = 2500;

// ---------- Casting ----------

export const officerVoice = (l: Look): string => (l.female ? 'officer-f' : 'officer-m');

const rosvoSlots = new WeakMap<Costume, string>();
/** Gives the rosvot of one cycle different voices where possible. */
export function castRosvot(cs: Costume[]): void {
  const next = { f: Math.random() < 0.5 ? 1 : 2, m: Math.random() < 0.5 ? 1 : 2 };
  for (const c of cs) {
    const g = c.look.female ? 'f' : 'm';
    rosvoSlots.set(c, `rosvo-${g}${next[g]}`);
    next[g] = 3 - next[g];
  }
}
export const rosvoVoice = (c: Costume): string => rosvoSlots.get(c) ?? (c.look.female ? 'rosvo-f1' : 'rosvo-m1');

const ownerSlots = new Map<number, string | null>();
let adultTurn = 0;
function slotFor(role: Role, l: Look): string | null {
  if (role === 'dog' || role === 'cat') return null;
  if (role === 'kid') return 'kid1';
  if (role === 'kid2') return 'kid2';
  if (role === 'elder') return l.female ? 'elder-f' : 'elder-m';
  adultTurn = (adultTurn % 2) + 1;
  return `adult-${l.female ? 'f' : 'm'}${adultTurn}`;
}
export function ownerVoice(o: Owner): string | null {
  if (!ownerSlots.has(o.id)) ownerSlots.set(o.id, slotFor(o.role, o.look));
  return ownerSlots.get(o.id) ?? null;
}

// ---------- Loading ----------

const buffers = new Map<string, Promise<AudioBuffer | null>>();

function load(url: string): Promise<AudioBuffer | null> {
  let p = buffers.get(url);
  if (!p) {
    p = fetch(url)
      .then((r) => r.arrayBuffer())
      .then((b) => {
        const out = audioOut();
        if (!out) throw new Error('no audio yet');
        return out.ctx.decodeAudioData(b);
      })
      .catch(() => {
        buffers.delete(url); // try again later, e.g. once audio is unlocked
        return null;
      });
    buffers.set(url, p);
  }
  return p;
}

/** Fetches and decodes every clip of these voices so lines start without delay. */
export function preloadVoices(slots: (string | null)[]): void {
  for (const s of slots) {
    for (const list of clips.get(s ?? '')?.values() ?? []) for (const u of list) void load(u);
  }
}

// ---------- Playing ----------

interface Pending {
  url: string;
  priority: number;
  until: number;
}

let playing: { src: AudioBufferSourceNode; priority: number } | null = null;
let queue: Pending[] = [];
const lastUrl = new Map<string, string>();

function pick(slot: string, key: string): string | null {
  const list = clips.get(slot)?.get(key);
  if (!list?.length) return null;
  const id = `${slot}/${key}`;
  const options = list.length > 1 ? list.filter((u) => u !== lastUrl.get(id)) : list;
  const url = options[Math.floor(Math.random() * options.length)];
  lastUrl.set(id, url);
  return url;
}

async function start(p: Pending): Promise<void> {
  const out = audioOut();
  const buf = await load(p.url);
  if (!out || !buf || performance.now() > p.until) return next();
  if (playing) {
    // Something else started while this one was loading.
    if (p.priority <= playing.priority) return void queue.unshift(p);
    playing.src.onended = null;
    playing.src.stop();
  }
  const src = out.ctx.createBufferSource();
  src.buffer = buf;
  const g = out.ctx.createGain();
  g.gain.value = VOICE_GAIN;
  src.connect(g);
  g.connect(out.master);
  src.onended = () => {
    playing = null;
    next();
  };
  playing = { src, priority: p.priority };
  duck(true);
  src.start();
}

function next(): void {
  const now = performance.now();
  queue = queue.filter((q) => q.until > now);
  const q = queue.shift();
  if (q) void start(q);
  else if (!playing) duck(false);
}

/**
 * Says a line in a voice. One voice speaks at a time: a higher priority cuts
 * the current line short, otherwise the line waits its turn (briefly).
 */
export function say(key: string, slot: string | null, priority = 1): void {
  if (!slot || !audioOut()) return;
  const url = pick(slot, key);
  if (!url) return;
  const p = { url, priority, until: performance.now() + MAX_DELAY };
  if (playing && priority <= playing.priority) {
    queue.push(p);
    queue.sort((a, b) => b.priority - a.priority);
    queue.length = Math.min(queue.length, 3);
    return;
  }
  void start(p);
}
