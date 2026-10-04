// Fire mode town, seen from high up: buildings and trees face the viewer
// (like a classic top-down game), roads are seen from above, and nothing gets
// smaller with distance. The stage is the same 1200x800 as the police town.
// The plan is rolled once per session, like the police town.

import { buildingArt, type BuildingArt } from '../images';
import { pick, shuffle } from '../people';
import type { Pt } from '../layout';

export const W = 1200;
export const H = 800;
/** Up to this much sky may be cut off the top on wide screens. */
export const SKY_CROP = 110;

// ---------- Town plan (new every session) ----------
//
// Three rows of buildings and two streets across. Two lanes run down from
// street 1, at positions picked per session, and cut rows 1 and 2 into three
// blocks each. One block of row 1 holds the fire station, one block of row 2
// is the park, and the rest are split into house plots.

export const ROAD_HALF = 28;
export const WALK = 12;
/** Streets run across, lanes run down from street 1. */
export const STREET_Y = [330, 590];
export const LANE_END = 790;

/** Lane positions to choose from: each leaves at least one block wide enough for the station. */
const LANE_PLANS = [
  [400, 800],
  [360, 780],
  [440, 820],
  [380, 840],
  [420, 760],
];
export const LANE_X: number[] = pick(LANE_PLANS);

export interface Block {
  x0: number;
  x1: number;
}
const BLOCKS: Block[] = [
  { x0: 20, x1: LANE_X[0] - ROAD_HALF - WALK },
  { x0: LANE_X[0] + ROAD_HALF + WALK, x1: LANE_X[1] - ROAD_HALF - WALK },
  { x0: LANE_X[1] + ROAD_HALF + WALK, x1: 1180 },
];
const bw = (b: Block) => b.x1 - b.x0;

/** The fire station is 330 wide; it goes in a row 1 block that fits it. */
const STATION_W = 330;
const stationBlock = pick(BLOCKS.filter((b) => bw(b) >= STATION_W + 6));
/** The park takes one block below street 2. */
export const PARK: Block = pick(BLOCKS);

export const STATION = (() => {
  const x0 = Math.round(stationBlock.x0 + (bw(stationBlock) - STATION_W) / 2);
  return { x0, x1: x0 + STATION_W, base: 548, wallH: 122, roofTop: 392 };
})();

/** Station garage door (centre x) and where the truck waits inside. */
export const GARAGE_X = STATION.x0 + 190;
export const GARAGE_IN: Pt = { x: GARAGE_X, y: 546 };

// The road network: points along each street and lane, joined in order.
const NODES: Pt[] = [];
const EDGES: [number, number][] = [];
const node = (x: number, y: number): number => {
  const i = NODES.findIndex((n) => n.x === x && n.y === y);
  if (i >= 0) return i;
  NODES.push({ x, y });
  return NODES.length - 1;
};
const chain = (pts: [number, number][]) => {
  const ids = pts.map(([x, y]) => node(x, y));
  for (let i = 1; i < ids.length; i++) EDGES.push([ids[i - 1], ids[i]]);
};
chain([40, ...LANE_X, 1160].map((x) => [x, STREET_Y[0]]));
chain([40, GARAGE_X, ...LANE_X, 1160].sort((a, b) => a - b).map((x) => [x, STREET_Y[1]]));
for (const x of LANE_X) chain([[x, STREET_Y[0]], [x, STREET_Y[1]], [x, LANE_END - 20]]);

export const STATION_EXIT: Pt = NODES[node(GARAGE_X, STREET_Y[1])];
export const ROAD_NODES = NODES;
export const ROAD_EDGES = EDGES;

const d = (a: Pt, b: Pt) => Math.hypot(a.x - b.x, a.y - b.y);

/** Nearest point on the road network to p, and the edge it lies on. */
export function snapToRoad(p: Pt): { pt: Pt; edge: number } {
  let best = { pt: NODES[0], edge: 0 };
  let bd = Infinity;
  EDGES.forEach(([i, j], e) => {
    const a = NODES[i];
    const b = NODES[j];
    const vx = b.x - a.x;
    const vy = b.y - a.y;
    const t = Math.max(0, Math.min(1, ((p.x - a.x) * vx + (p.y - a.y) * vy) / (vx * vx + vy * vy)));
    const q = { x: a.x + vx * t, y: a.y + vy * t };
    const dd = d(p, q);
    if (dd < bd) {
      bd = dd;
      best = { pt: q, edge: e };
    }
  });
  return best;
}

/**
 * Shortest way along the roads from `from` to `to` (both on the network), as
 * the list of points to drive through, ending at `to`.
 */
export function roadPath(from: Pt, to: Pt): Pt[] {
  const a = snapToRoad(from);
  const b = snapToRoad(to);
  if (a.edge === b.edge) return [b.pt];
  const n = NODES.length;
  const dist = new Array(n).fill(Infinity);
  const prev = new Array(n).fill(-1);
  const done = new Array(n).fill(false);
  for (const i of EDGES[a.edge]) dist[i] = d(a.pt, NODES[i]);
  for (;;) {
    let u = -1;
    for (let i = 0; i < n; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
    if (u < 0) break;
    done[u] = true;
    for (const [i, j] of EDGES) {
      const v = i === u ? j : j === u ? i : -1;
      if (v < 0) continue;
      const nd = dist[u] + d(NODES[u], NODES[v]);
      if (nd < dist[v]) {
        dist[v] = nd;
        prev[v] = u;
      }
    }
  }
  const [e0, e1] = EDGES[b.edge];
  const end = dist[e0] + d(NODES[e0], b.pt) <= dist[e1] + d(NODES[e1], b.pt) ? e0 : e1;
  const out: Pt[] = [b.pt];
  for (let v = end; v >= 0; v = prev[v]) out.unshift(NODES[v]);
  return out;
}

// ---------- Buildings ----------

/** The police town's buildings, reused as pictures. `police` is the police station (it never burns). */
export type Kind = 'home' | 'bakery' | 'bank' | 'jewelry' | 'police';

export interface House {
  id: number;
  /** Row 0 is the back row (street 1), row 1 faces street 2, row 2 is below street 2. */
  row: number;
  kind: Kind;
  /** The picture. */
  art: BuildingArt;
  /** Picture extents: left, right, top and bottom (the bottom stands on the sidewalk). */
  x0: number;
  x1: number;
  top: number;
  base: number;
  /** Colour variation for repeated homes (a CSS filter) and mirroring. */
  filter: string;
  flip: boolean;
  burnable: boolean;
  /** Front door (feet), where residents come out. */
  door: Pt;
  /** Where the truck parks for this house, on the road. */
  curb: Pt;
  /** Where the firefighter stands with the hose (feet). */
  stand: Pt;
  /** Where the residents watch from (feet). */
  wait: Pt;
  /** Where flames can be (bottom centre of the flame) and how big. */
  fires: (Pt & { k: number })[];
}

/** Flame spots per picture, as fractions of its width and height: upper windows first, then the roof.
 * Extra home pictures use the `home` spots, so they should keep two upper windows in about the same place. */
const FIRE_SPOTS: Record<Exclude<Kind, 'police'>, [number, number, number][]> = {
  home: [[0.38, 0.47, 1], [0.68, 0.47, 1], [0.5, 0.2, 1.2], [0.25, 0.3, 1], [0.78, 0.3, 1]],
  bakery: [[0.43, 0.45, 1], [0.72, 0.45, 1], [0.58, 0.16, 1.2], [0.3, 0.3, 1], [0.86, 0.3, 1]],
  bank: [[0.23, 0.52, 1], [0.85, 0.52, 1], [0.5, 0.2, 1.3], [0.45, 0.52, 1], [0.64, 0.52, 1]],
  jewelry: [[0.4, 0.45, 1], [0.72, 0.45, 1], [0.55, 0.18, 1.2], [0.3, 0.22, 1], [0.84, 0.22, 1]],
};

/** Gentle colour changes so repeated homes don't look identical. */
const HOME_TINTS = ['none', 'hue-rotate(28deg)', 'hue-rotate(-32deg) saturate(1.1)', 'hue-rotate(70deg) saturate(.85)', 'hue-rotate(190deg) saturate(.6) brightness(1.05)', 'saturate(.75) brightness(1.06)'];

interface Plot {
  row: number;
  x0: number;
  x1: number;
}

const ROW = [
  { base: 290, roofTop: 132, curbY: STREET_Y[0], standY: 300 },
  { base: 548, roofTop: 376, curbY: STREET_Y[1], standY: 560 },
  { base: 790, roofTop: 636, curbY: STREET_Y[1], standY: 626 },
];

/** Splits a block into plots about `size` wide. */
function plots(row: number, b: Block, size: number): Plot[] {
  const n = Math.max(1, Math.round(bw(b) / size));
  const w = bw(b) / n;
  return Array.from({ length: n }, (_, i) => ({ row, x0: b.x0 + i * w, x1: b.x0 + (i + 1) * w }));
}

function makeHouses(): House[] {
  const lots: Plot[] = [
    ...plots(0, { x0: 20, x1: 1180 }, 230),
    ...BLOCKS.filter((b) => b !== stationBlock).flatMap((b) => plots(1, b, 165)),
    ...BLOCKS.filter((b) => b !== PARK).flatMap((b) => plots(2, b, 165)),
  ];
  // The police station stands in the back row; each shop appears once, the rest are homes.
  const kinds: Kind[] = lots.map(() => 'home');
  const back = shuffle(lots.map((l, i) => (l.row === 0 ? i : -1)).filter((i) => i >= 0));
  kinds[back[0]] = 'police';
  const others = shuffle(lots.map((_, i) => i).filter((i) => i !== back[0]));
  (['bakery', 'bank', 'jewelry'] as Kind[]).forEach((k, j) => (kinds[others[j]] = k));
  const tints = shuffle(HOME_TINTS);
  // Homes cycle through every home picture there is; only repeats get a colour change.
  const homePics = shuffle(['home', 'home2', 'home3', 'home4', 'home5', 'home6'].map(buildingArt).filter((a): a is BuildingArt => !!a));
  let homes = 0;

  return lots.map((l, id) => {
    const kind = kinds[id];
    const r = ROW[l.row];
    const repeat = kind === 'home' && homes >= homePics.length;
    const art = kind === 'home' ? homePics[homes++ % homePics.length] : (buildingArt(kind === 'police' ? 'station' : kind) as BuildingArt);
    const s = Math.min((l.x1 - l.x0 - 14) / art.w, (r.base - r.roofTop) / art.h);
    const w = art.w * s;
    const h = art.h * s;
    const cx = (l.x0 + l.x1) / 2;
    const x0 = cx - w / 2;
    const x1 = cx + w / 2;
    const top = r.base - h;
    const flip = kind === 'home' && Math.random() < 0.5;
    const fx = (f: number) => x0 + (flip ? 1 - f : f) * w;
    // The truck parks just beside the house (left if there is room) so it doesn't hide the front,
    // and the firefighter stands between the truck and the house.
    const left = x0 - 50 >= 70;
    const curb = { x: left ? x0 - 50 : x1 + 50, y: r.curbY };
    const stand = { x: curb.x + (left ? 118 : -118), y: r.standY };
    // The residents watch from across the street (row 2 houses: from the far side of street 2).
    const wait = { x: Math.min(1170, cx + 34), y: l.row === 2 ? r.curbY - 32 : r.curbY + 38 };
    const k = s / 0.62;
    const fires = kind === 'police' ? [] : FIRE_SPOTS[kind].map(([a, b, kk]) => ({ x: fx(a), y: top + b * h, k: kk * k }));
    return {
      id,
      row: l.row,
      kind,
      art,
      x0,
      x1,
      top,
      base: r.base,
      filter: repeat ? tints[id % tints.length] : 'none',
      flip,
      burnable: kind !== 'police',
      // Row 2 houses face away from street 2: their people come round from the back garden.
      door: l.row === 2 ? { x: cx, y: top - 6 } : { x: fx(art.door), y: r.base + 4 },
      curb,
      stand,
      wait,
      fires,
    };
  });
}

export const HOUSES: House[] = makeHouses();

// ---------- Trees and street furniture ----------

export interface Prop {
  name: string;
  /** Bottom centre and size multiplier. */
  x: number;
  y: number;
  k: number;
}

/** Trees and bushes in the gaps between buildings, and the park's trees, benches and fence. */
function makeProps(): Prop[] {
  const out: Prop[] = [];
  const trees = ['tree-apple', 'tree-birch', 'tree-autumn', 'tree-apple', 'bush'];
  for (const row of [0, 1, 2]) {
    const hs = HOUSES.filter((h) => h.row === row).sort((a, b) => a.x0 - b.x0);
    for (let i = 1; i < hs.length; i++) {
      const gap = hs[i].x0 - hs[i - 1].x1;
      if (gap < 34) continue;
      const name = pick(trees);
      out.push({ name, x: (hs[i].x0 + hs[i - 1].x1) / 2, y: ROW[row].base - 4, k: name === 'bush' ? 0.32 : name === 'tree-birch' ? 0.36 : 0.3 });
    }
  }
  const pw = bw(PARK);
  out.push(
    { name: 'tree-apple', x: PARK.x0 + 40, y: 690, k: 0.34 },
    { name: 'tree-birch', x: PARK.x1 - 36, y: 712, k: 0.4 },
    { name: 'tree-autumn', x: PARK.x0 + pw * 0.62, y: 798, k: 0.34 },
    { name: 'bench', x: PARK.x0 + pw * 0.3, y: 792, k: 0.4 },
    { name: 'fence', x: PARK.x0 + 50, y: 656, k: 0.45 },
    { name: 'fence', x: PARK.x1 - 50, y: 656, k: 0.45 },
  );
  // Street lamps on the corners, lit in the evening.
  for (const x of LANE_X) for (const y of STREET_Y) out.push({ name: 'lamp', x: x - 48, y: y - 30, k: 0.32 });
  return out;
}

export const PROPS: Prop[] = makeProps();

// ---------- Fire station ----------

export const ALARM: Pt = { x: STATION.x0 + 58, y: 486 };
/** The three progress lamps above the garage door. */
export const LAMPS: Pt[] = [0, 1, 2].map((i) => ({ x: GARAGE_X - 44 + i * 44, y: STATION.base - STATION.wallH + 22 }));
export const GARAGE = { x0: GARAGE_X - 62, x1: GARAGE_X + 62, top: STATION.base - 94 };

/** Sticker shelf, top right (y moves down on wide screens). */
export const SHELF = { x: 920, y: 14, w: 250, h: 120 };
