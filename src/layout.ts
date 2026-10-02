// Logical scene coordinates. The stage is 1200x800 and is scaled to fit the screen.

import { town, type FrontKind } from './town';

export const W = 1200;
export const H = 800;
export const GROUND_Y = 470;

export interface Pt {
  x: number;
  y: number;
}

export type SpotKind = 'chimney' | 'tree' | 'bush' | 'bin' | 'crate' | 'barrel';

export interface SpotDef {
  kind: SpotKind;
  /** Centre x of the hiding object. */
  x: number;
  /** Top of the hiding object. */
  top: number;
  w: number;
  h: number;
  /** How far below the object's top the rosvo is clipped. */
  clip: number;
  /** Rendered behind buildings (true) or in the foreground. */
  back: boolean;
  /** Where the caught rosvo lands (feet). */
  land: Pt;
}

export const PEEK_W = 130;
export const PEEK_H = 150;

const FRONT_SIZES: Record<FrontKind, { w: number; h: number; clip: number }> = {
  bush: { w: 200, h: 120, clip: 50 },
  bin: { w: 130, h: 150, clip: 28 },
  crate: { w: 150, h: 130, clip: 30 },
  barrel: { w: 120, h: 140, clip: 22 },
};
const FRONT_X = [400, 640, 940];
const FRONT_BOTTOM = 790;

/** Hiding spots: two chimneys and a tree at the back, three objects in front (vary per session). */
export const SPOTS: SpotDef[] = [
  { kind: 'chimney', x: 500, top: 250, w: 80, h: 90, clip: 12, back: true, land: { x: 520, y: 740 } },
  { kind: 'tree', x: 680, top: 170, w: 200, h: 300, clip: 52, back: true, land: { x: 640, y: 740 } },
  { kind: 'chimney', x: 820, top: 250, w: 80, h: 90, clip: 12, back: true, land: { x: 800, y: 740 } },
  ...town.front.map((kind, i) => {
    const z = FRONT_SIZES[kind];
    return { kind, x: FRONT_X[i], top: FRONT_BOTTOM - z.h + (kind === 'bush' ? 2 : -4), ...z, back: false, land: { x: FRONT_X[i], y: 770 } };
  }),
];

/** The rosvo's feet position when fully peeking out of a spot. */
export function peekFeet(s: SpotDef): Pt {
  return { x: s.x, y: s.top + s.clip - PEEK_H + 200 };
}

/** Generous tap rectangle for a hiding spot. */
export function spotRect(s: SpotDef): { x0: number; y0: number; x1: number; y1: number } {
  const half = Math.max(PEEK_W, s.w) / 2 + 10;
  return {
    x0: s.x - half,
    x1: s.x + half,
    y0: s.top + s.clip - PEEK_H - 10,
    y1: s.top + Math.min(s.h, 150),
  };
}

/** Owner slots (feet). */
export const OWNER_SLOTS: Pt[] = [
  { x: 470, y: 618 },
  { x: 770, y: 628 },
  { x: 1070, y: 618 },
];

export const STATION = { x: 20, y: 160, w: 300, h: 320 };
export const DOOR: Pt = { x: 170, y: 476 };
export const CAR = { x: 40, y: 470 };
export const JAIL_TARGET: Pt = { x: 170, y: 420 };
export const JAIL_RADIUS = 300;
export const OWNER_RADIUS = 175;

/** Jail window centres. */
export const WINDOWS: Pt[] = [
  { x: 88, y: 311 },
  { x: 170, y: 311 },
  { x: 252, y: 311 },
];

export const SHELF = { x: 920, y: 18, w: 250, h: 120 };

export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);
