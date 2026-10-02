// Helpers for characters that walk around the town with depth scaling.

import { depth, dist, type Pt } from './layout';
import { Sprite, ease, tween, type Ease } from './tween';

let layer: HTMLElement;

export function initActors(stage: HTMLElement): void {
  layer = stage;
}

/** Creates a depth-sorted character sprite anchored at its feet (or centre for items). */
export function makeActor(cls: string, html: string, ax = 60, ay = 200): Sprite {
  const d = document.createElement('div');
  d.className = `actor ${cls}`;
  d.innerHTML = html;
  layer.appendChild(d);
  const s = new Sprite(d, ax, ay);
  s.depthZ = true;
  return s;
}

/** Puts a character at p with the right size for that depth. */
export function stand(s: Sprite, p: Pt, k = 1): Sprite {
  s.scale = depth(p.y) * k;
  return s.at(p.x, p.y);
}

export interface WalkOpts {
  speed?: number;
  hop?: number;
  run?: boolean;
  ease?: Ease;
  /** Size multiplier on top of depth (items are smaller than people). */
  k?: number;
  alive?: () => boolean;
  onStep?: () => void;
}

/** Walks (or runs) a character to p, scaling with depth and facing the way it goes. */
export async function walkTo(s: Sprite, p: Pt, o: WalkOpts = {}): Promise<void> {
  const speed = o.speed ?? (o.run ? 520 : 220);
  const ms = Math.max(250, (dist(s, p) / speed) * 1000);
  if (Math.abs(p.x - s.x) > 4) s.flip = p.x < s.x;
  s.el.classList.add('walking');
  if (o.run) s.el.classList.add('running');
  const k = o.k ?? 1;
  const x0 = s.x;
  const y0 = s.y;
  await tween(
    ms,
    (t) => {
      s.x = x0 + (p.x - x0) * t;
      const y = y0 + (p.y - y0) * t;
      s.y = y - Math.sin(Math.PI * t) * (o.hop ?? 0);
      s.scale = depth(y) * k;
      s.render();
      o.onStep?.();
    },
    o.ease ?? ease.linear,
    o.alive,
  );
  s.el.classList.remove('walking', 'running');
}
