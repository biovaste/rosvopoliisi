// Logical scene coordinates. The stage is 1200x800 and is scaled to fit the screen.
// Things further up the screen are further away and drawn smaller (see depth()).

import type { BuildingKind } from './buildings';
import { BUILDING_ART, propArt, roofAt, vanArt, type BuildingArt, type TileArt } from './images';
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

/** Centre x of the four building slots (left to right). */
/** Buildings stand side by side (slightly overlapping) from the station to the right edge. */
export const SLOT_CX: number[] = (() => {
  let x = 350;
  return town.buildings.map((b) => {
    const w = BUILDING_ART[b.kind].w;
    const c = x + w / 2;
    x += w - 6;
    return c;
  });
})();

export interface Placed {
  art: BuildingArt;
  x: number;
  y: number;
}

/** Where a building's picture is drawn (top-left) in its slot. */
export function placeBuilding(kind: BuildingKind, slot: number): Placed {
  const art = BUILDING_ART[kind];
  return { art, x: SLOT_CX[slot] - art.w / 2, y: BASE_Y - art.h };
}

/** Feet position at a building's door. */
export function doorOf(kind: BuildingKind): Pt {
  const i = town.buildings.findIndex((b) => b.kind === kind);
  const p = placeBuilding(kind, i);
  return { x: p.x + p.art.door * p.art.w, y: 500 };
}

// ---------- Police station ----------

const stationArt = BUILDING_ART.station;
export const STATION: Placed = { art: stationArt, x: 15, y: BASE_Y - stationArt.h };
export const DOOR: Pt = { x: STATION.x + stationArt.door * stationArt.w, y: 472 };
/** Jail cell windows (rects in scene coordinates). */
export const CELLS = (stationArt.cells ?? []).map((c) => ({ x: STATION.x + c.x, y: STATION.y + c.y, w: c.w, h: c.h }));
export const WINDOWS: Pt[] = CELLS.map((c) => ({ x: c.x + c.w / 2, y: c.y + c.h / 2 }));
/** Police car, top-left corner of its 260x140 drawing (wheels on the street). */
const van = vanArt();
/** Police car / van: top-left corner and size (wheels on the street at y 585). */
export const CAR = van ? { x: 36, y: 585 - van.h, w: van.w, h: van.h } : { x: 40, y: 451, w: 260, h: 134 };
/** Where rosvot climb in (the back) and where the officer gets in (the driver's door). */
export const CAR_BACK: Pt = { x: CAR.x + CAR.w * 0.25, y: 592 };
export const CAR_DOOR: Pt = { x: CAR.x + CAR.w * 0.72, y: 594 };
export const OFFICER_IDLE: Pt = { x: 336, y: 600 };
export const JAIL_TARGET: Pt = { x: 180, y: 400 };
export const JAIL_RADIUS = 220;
export const OWNER_RADIUS = 160;

// ---------- Hiding spots ----------

export type SpotKind = 'chimney' | 'tree' | 'roof' | 'mailbox' | 'slide' | 'tunnel' | 'bush' | 'planter' | 'crates' | 'sacks' | 'barrels';
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
  /** Generated picture used for the object, if any. */
  art?: TileArt;
  /** Where the peek point sits across the object (0 left .. 1 right). */
  ax: number;
}

export const PEEK_W = 130;
export const PEEK_H = 150;

function spot(kind: SpotKind, use: SpotUse, x: number, bottom: number, w: number, h: number, clip: number, z = bottom, os = 1): SpotDef {
  const top = bottom - h;
  const far = bottom < 600;
  const landY = far ? 640 : clamp(bottom + 6, 640, 796);
  return { kind, use, x, top, w, h, clip, s: depth(far ? 470 : bottom - 10), z, far, land: { x: clamp(x, 420, 1100), y: landY }, os, ax: 0.5 };
}

function chimneySpots(): SpotDef[] {
  const out: SpotDef[] = [];
  town.buildings.forEach((b, i) => {
    if (b.kind !== 'home' && b.kind !== 'bakery') return;
    const p = placeBuilding(b.kind, i);
    const rx = p.art.w * 0.7;
    const top = p.y + roofAt(p.art, rx) - 50;
    const x = p.x + rx;
    const s = spot('chimney', 'both', x, top + 80, 60, 80, 12, 300);
    s.s = 0.56;
    s.far = true;
    s.land = { x: clamp(x, 420, 1100), y: 640 };
    out.push(s);
  });
  return out;
}

/** Swaps a spot's drawn object for a generated picture (if present), keeping its bottom edge. */
function withArt(d: SpotDef, name: string, clipFrac: number, ax = 0.5, os = 1): SpotDef {
  const a = propArt(name);
  if (!a) return d;
  const w = a.w * os;
  const h = a.h * os;
  return { ...d, art: { ...a, w, h }, w, h, top: d.top + d.h - h, clip: clipFrac * h, ax, os: 1 };
}

const backTree = withArt(spot('tree', 'both', (SLOT_CX[1] + SLOT_CX[2]) / 2, 452, 200, 300, 40, 290), `tree-${town.backTree}`, 0.1);
backTree.s = 0.55;
const roof = spot('roof', 'rosvo', STATION.x + 70, STATION.y + roofAt(stationArt, 55) + 10, 0, 0, 8, 299);
roof.s = 0.58;
roof.far = true;

// ---------- Street furniture ----------

/** Where two neighbouring buildings meet (centre of their overlap). */
const seam = (i: number): number => {
  const a = placeBuilding(town.buildings[i].kind, i);
  return a.x + a.art.w - 3;
};
/** Street lamps on the back sidewalk stand in the gaps between houses (bottom at y 502). */
export const LAMPS: number[] = [seam(0), seam(2)];
/** A bigger lamp on the near sidewalk, across the street. */
export const NEAR_LAMP: Pt & { k: number } = { x: nearLampX(), y: 613, k: 1.2 };

/** Between the small tree and the market spot, and never in front of a door (it would hide the person there). */
function nearLampX(): number {
  const doors = town.buildings.map((b) => doorOf(b.kind).x);
  for (const x of [900, 880, 920, 864, 940, 950]) if (doors.every((d) => Math.abs(x - d) >= 52)) return x;
  return 900;
}

/** Mailbox spot on the back sidewalk: varies per session but never by a lamp or a door. */
function mailboxX(): number {
  const avoid = [...LAMPS.map((x) => [x, 80]), ...town.buildings.map((b) => [doorOf(b.kind).x, b.kind === 'bank' ? 90 : 60])];
  const ok: number[] = [];
  for (let x = 380; x <= 1140; x += 20) if (avoid.every(([a, r]) => Math.abs(x - a) >= r)) ok.push(x);
  return ok.length ? ok[Math.floor(Math.random() * ok.length)] : SLOT_CX[0] - 62;
}

const MAILBOX_X = mailboxX();
/** Centre x of the small tree on the lawn (its crown hides anyone standing behind it). */
const NEAR_TREE_X = 742;

/** Two places on the back sidewalk, clear of lamps, the mailbox, doors and the small tree's crown. */
function backPoints(): Pt[] {
  const avoid = [...LAMPS.map((x) => [x, 60]), [MAILBOX_X, 60], ...town.buildings.map((b) => [doorOf(b.kind).x, 70])];
  const ok: number[] = [];
  for (let x = 400; x <= 1140; x += 20) {
    if (Math.abs(x - NEAR_TREE_X) < 115) continue;
    if (avoid.every(([a, r]) => Math.abs(x - a) >= r)) ok.push(x);
  }
  const out: number[] = [];
  for (const x of ok.sort(() => Math.random() - 0.5)) if (out.length < 2 && out.every((o) => Math.abs(o - x) >= 140)) out.push(x);
  return out.map((x) => ({ x, y: 500 }));
}

export const SPOTS: SpotDef[] = [
  ...chimneySpots(),
  backTree,
  roof,
  withArt(spot('mailbox', 'stash', MAILBOX_X, 500, 60, 90, 22), 'mailbox', 0.12),
  // Playground: the slide in front, the tunnel at the back of the sandpit.
  withArt(spot('slide', 'rosvo', 92, 776, 220, 170, 40), 'slide', 0.3, 0.3, 0.9),
  withArt(spot('tunnel', 'both', 386, 708, 170, 96, 30), 'tunnel', 0.12, 0.5, 0.83),
  // Lawn: bush in front, the small tree further back.
  withArt(spot('bush', 'both', 588, 795, 200, 120, 50), 'bush', 0.4, 0.5, 0.85),
  propArt('tree-birch')
    ? withArt(spot('tree', 'both', NEAR_TREE_X, 712, 150, 225, 38, 712, 0.75), 'tree-birch', 0.08)
    : withArt(spot('tree', 'both', NEAR_TREE_X, 712, 150, 225, 38, 712, 0.75), `tree-${town.nearTree}`, 0.1, 0.5, 0.73),
  // Market square: small things on the cobbles (planter, crates, sacks, barrels).
  withArt(spot('planter', 'stash', 852, 795, 120, 76, 26), 'planter', 0.3),
  withArt(spot('crates', 'both', 962, 735, 160, 140, 30, 735), 'crates', 0.07),
  withArt(spot('sacks', 'stash', 1062, 798, 130, 84, 30), 'sacks', 0.35),
  withArt(spot('barrels', 'both', 1140, 704, 116, 100, 24), 'barrels', 0.25),
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
  { x: 1110, y: 604 },
  { x: 1000, y: 606 },
  { x: 424, y: 774 },
  { x: 700, y: 770 },
  { x: 812, y: 724 },
  ...backPoints(),
  { x: 1162, y: 782 },
];

/** Seat on the bench: a townsperson standing here sits down. */
export const BENCH_SEAT: Pt = { x: 581, y: 664 };
FREE_POINTS.push(BENCH_SEAT);
export const onBench = (p: Pt): boolean => dist(p, BENCH_SEAT) < 2;

/** Sticker shelf (y moves down on wide screens where the top of the sky is cut off). */
export const SHELF = { x: 920, y: 14, w: 250, h: 120 };
