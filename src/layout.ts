// Logical scene coordinates. The stage is 1200x800 and is scaled to fit the screen.
// Things further up the screen are further away and drawn smaller (see depth()).

import { buildingGeom, type BuildingKind } from './buildings';
import { town } from './town';

export const W = 1200;
export const H = 800;

export interface Pt {
  x: number;
  y: number;
}

export const dist = (a: Pt, b: Pt): number => Math.hypot(a.x - b.x, a.y - b.y);
export const clamp = (v: number, a: number, b: number): number => Math.max(a, Math.min(b, v));

/** Scale for a character whose feet are at y. */
export const depth = (y: number): number => clamp(0.6 + (y - 480) * 0.00135, 0.6, 1.04);

/** Bottom of the building row (the back sidewalk). */
export const BASE_Y = 470;

// ---------- Buildings ----------

export const SLOT_X = [345, 705, 890, 1070];

const DOOR_X: Record<BuildingKind, number> = { home: 90, bakery: 135, bank: 90, jewelry: 136 };

export function buildingTop(kind: BuildingKind): number {
  return BASE_Y - buildingGeom(kind).h;
}

/** Feet position at a building's door. */
export function doorOf(kind: BuildingKind): Pt {
  const i = town.buildings.findIndex((b) => b.kind === kind);
  return { x: SLOT_X[i] + DOOR_X[kind], y: 500 };
}

// ---------- Police station ----------

export const STATION = { x: 20, y: BASE_Y - 270 };
export const DOOR: Pt = { x: 180, y: 472 };
/** Cell window centres. */
export const WINDOWS: Pt[] = [90, 180, 270].map((x) => ({ x, y: STATION.y + 141 }));
/** Police car, top-left corner of its 260x140 drawing (wheels on the street). */
export const CAR = { x: 40, y: 451 };
export const OFFICER_IDLE: Pt = { x: 336, y: 600 };
export const JAIL_TARGET: Pt = { x: 180, y: 400 };
export const JAIL_RADIUS = 240;
export const OWNER_RADIUS = 160;

// ---------- Hiding spots ----------

export type SpotKind = 'chimney' | 'tree' | 'roof' | 'mailbox' | 'slide' | 'tunnel' | 'bush' | 'planter' | 'crates' | 'sacks' | 'stall';
/** Who may use a spot: a hiding rosvo, a stash of loot, or both. */
export type SpotUse = 'both' | 'rosvo' | 'stash';

export interface SpotDef {
  kind: SpotKind;
  use: SpotUse;
  /** Centre x of the hiding object. */
  x: number;
  /** Top of the hiding object. */
  top: number;
  w: number;
  h: number;
  /** How far below the object's top the rosvo or loot is clipped. */
  clip: number;
  /** Scale of the rosvo / loot at this depth. */
  s: number;
  /** Stacking order of the object (the peek box sits just behind it). */
  z: number;
  /** Near or far (far spots only unlock at later levels). */
  far: boolean;
  /** Where the caught rosvo lands (feet). */
  land: Pt;
  /** Scale of the object drawing (w, h and clip are already scaled). */
  os: number;
}

export const PEEK_W = 130;
export const PEEK_H = 150;

function spot(kind: SpotKind, use: SpotUse, x: number, bottom: number, w: number, h: number, clip: number, z = bottom, os = 1): SpotDef {
  const top = bottom - h;
  const far = bottom < 600;
  const landY = far ? 640 : clamp(bottom + 6, 640, 796);
  return { kind, use, x, top, w, h, clip, s: depth(far ? 470 : bottom - 10), z, far, land: { x: clamp(x, 300, 1100), y: landY }, os };
}

function chimneySpots(): SpotDef[] {
  const out: SpotDef[] = [];
  town.buildings.forEach((b, i) => {
    const g = buildingGeom(b.kind);
    if (!g.chimney || i === 3) return;
    const x = SLOT_X[i] + g.chimney.x;
    const top = buildingTop(b.kind) + g.chimney.top - 4;
    const s = spot('chimney', 'both', x, top + 80, 60, 80, 12, 300);
    s.s = 0.56;
    s.far = true;
    s.land = { x: clamp(x, 300, 1100), y: 640 };
    out.push(s);
  });
  return out;
}

const backTree = spot('tree', 'both', 887, 460, 200, 300, 40, 290);
backTree.s = 0.55;
const roof = spot('roof', 'rosvo', 250, STATION.y + 30, 0, 0, 8, 299);
roof.s = 0.58;
roof.far = true;

export const SPOTS: SpotDef[] = [
  ...chimneySpots(),
  backTree,
  roof,
  spot('mailbox', 'stash', 548, 500, 60, 90, 22),
  spot('slide', 'rosvo', 150, 770, 220, 170, 40),
  spot('tunnel', 'both', 330, 790, 170, 96, 30),
  spot('bush', 'both', 500, 795, 200, 120, 50),
  spot('tree', 'both', 670, 712, 150, 225, 38, 712, 0.75),
  spot('planter', 'stash', 790, 795, 120, 76, 26),
  spot('crates', 'both', 900, 760, 160, 140, 30),
  spot('sacks', 'stash', 1010, 798, 130, 84, 30),
  spot('stall', 'rosvo', 1110, 750, 190, 96, 22),
];

export const peekW = (s: SpotDef): number => PEEK_W * s.s;
export const peekH = (s: SpotDef): number => PEEK_H * s.s;

/** The rosvo's feet position when fully peeking out of a spot. */
export function peekFeet(s: SpotDef): Pt {
  return { x: s.x, y: s.top + s.clip - peekH(s) + 200 * s.s };
}

/** Tap rectangle for a hiding spot: the peek area plus the top of the object, at least 100 px. */
export function spotRect(s: SpotDef): { x0: number; y0: number; x1: number; y1: number } {
  const half = Math.max(50, peekW(s) / 2 + 8, Math.min(s.w, 160) / 2);
  const y0 = s.top + s.clip - peekH(s) - 8;
  const y1 = Math.max(y0 + 100, s.top + Math.min(s.h, 110));
  return { x0: s.x - half, x1: s.x + half, y0, y1 };
}

// ---------- Where townspeople stand ----------

/** Places a townsperson without a home building may stand (feet). */
export const FREE_POINTS: Pt[] = [
  { x: 450, y: 604 },
  { x: 560, y: 606 },
  { x: 770, y: 604 },
  { x: 1000, y: 606 },
  { x: 70, y: 720 },
  { x: 250, y: 676 },
  { x: 700, y: 770 },
  { x: 960, y: 688 },
  { x: 690, y: 500 },
  { x: 1170, y: 640 },
];

export const SHELF = { x: 920, y: 14, w: 250, h: 120 };
