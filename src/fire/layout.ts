// Fire mode town, seen from high up: front walls face the viewer, roofs are
// seen from above, and nothing gets smaller with distance. The stage is the
// same 1200x800 as the police town.

import { pick, shuffle } from '../people';
import type { Pt } from '../layout';

export const W = 1200;
export const H = 800;
/** Up to this much sky may be cut off the top on wide screens. */
export const SKY_CROP = 110;
/** Top of the town (below the sky band). */
export const GROUND_Y = 120;

// ---------- Roads ----------

export const ROAD_HALF = 28;
export const WALK = 12;
/** Streets run across, lanes run down from street 1. */
export const STREET_Y = [330, 590];
export const LANE_X = [400, 800];
export const LANE_END = 790;

/** Station garage door (centre x) and where the truck waits inside. */
export const GARAGE_X = 210;
export const GARAGE_IN: Pt = { x: GARAGE_X, y: 546 };

const NODES: Pt[] = [
  { x: 40, y: 330 }, // 0
  { x: 400, y: 330 }, // 1
  { x: 800, y: 330 }, // 2
  { x: 1160, y: 330 }, // 3
  { x: 40, y: 590 }, // 4
  { x: GARAGE_X, y: 590 }, // 5 station exit
  { x: 400, y: 590 }, // 6
  { x: 800, y: 590 }, // 7
  { x: 1160, y: 590 }, // 8
  { x: 400, y: 770 }, // 9
  { x: 800, y: 770 }, // 10
];
const EDGES: [number, number][] = [
  [0, 1], [1, 2], [2, 3],
  [4, 5], [5, 6], [6, 7], [7, 8],
  [1, 6], [6, 9],
  [2, 7], [7, 10],
];
export const STATION_EXIT = NODES[5];
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

// ---------- Houses ----------

export type Shape = 'gable' | 'tall' | 'wide';

export interface House {
  id: number;
  /** Row 0 is the back row (street 1), row 1 faces street 2, row 2 is below street 2. */
  row: number;
  x0: number;
  x1: number;
  /** Bottom of the front wall. */
  base: number;
  /** Height of the front wall. */
  wallH: number;
  /** Top (back edge) of the roof. */
  roofTop: number;
  shape: Shape;
  wall: string;
  roof: string;
  door: string;
  /** Where the truck parks for this house, on the road. */
  curb: Pt;
  /** Where the firefighter stands with the hose (feet). */
  stand: Pt;
  /** Where the residents watch from (feet). */
  wait: Pt;
  /** Where flames can be (bottom centre of the flame) and how big. */
  fires: (Pt & { k: number })[];
}

const WALLS = ['#f6d36b', '#f4a7a0', '#9fd3e8', '#c7e59a', '#f7c59f', '#d9c2f0', '#fff1c9', '#a8e0c8'];
const ROOFS = ['#c0504d', '#5b7fb8', '#7a5a48', '#4f8a5b', '#8a5aa0', '#d07a3a'];
const DOORS = ['#7b4a2e', '#2f5aa8', '#c0392b', '#2e7d32'];

interface Lot {
  row: number;
  cx: number;
  w: number;
}

const LOTS: Lot[] = [
  { row: 0, cx: 120, w: 170 },
  { row: 0, cx: 345, w: 160 },
  { row: 0, cx: 600, w: 190 },
  { row: 0, cx: 845, w: 165 },
  { row: 0, cx: 1075, w: 180 },
  { row: 1, cx: 528, w: 128 },
  { row: 1, cx: 676, w: 124 },
  { row: 1, cx: 936, w: 140 },
  { row: 1, cx: 1100, w: 140 },
  { row: 2, cx: 528, w: 128 },
  { row: 2, cx: 676, w: 124 },
  { row: 2, cx: 936, w: 140 },
  { row: 2, cx: 1100, w: 140 },
];

const ROW = [
  { base: 290, wallH: 62, roofTop: 150, curbY: STREET_Y[0], standY: 300 },
  { base: 548, wallH: 64, roofTop: 392, curbY: STREET_Y[1], standY: 560 },
  { base: 790, wallH: 64, roofTop: 650, curbY: STREET_Y[1], standY: 626 },
];

function makeHouses(): House[] {
  const walls = shuffle(WALLS);
  return LOTS.map((l, id) => {
    const r = ROW[l.row];
    const shape = pick(['gable', 'tall', 'wide'] as Shape[]);
    const x0 = l.cx - l.w / 2;
    const x1 = l.cx + l.w / 2;
    const wallTop = r.base - r.wallH;
    // The truck parks just beside the house (left if there is room) so it doesn't hide the front,
    // and the firefighter stands between the truck and the house.
    const left = x0 - 60 >= 70;
    const curb = { x: left ? x0 - 60 : x1 + 60, y: r.curbY };
    const stand = { x: curb.x + (left ? 118 : -118), y: r.standY };
    // The residents watch from across the street (row 2 houses: from the far side of street 2).
    const wait = { x: Math.min(1170, l.cx + 34), y: l.row === 2 ? r.curbY - 32 : r.curbY + 38 };
    const fires = [
      { x: l.cx - l.w * 0.26, y: wallTop + r.wallH * 0.62, k: 1 },
      { x: l.cx + l.w * 0.26, y: wallTop + r.wallH * 0.62, k: 1 },
      { x: l.cx, y: wallTop - (wallTop - r.roofTop) * 0.2, k: 1.25 },
      { x: l.cx - l.w * 0.26, y: wallTop - (wallTop - r.roofTop) * 0.55, k: 1.1 },
      { x: l.cx + l.w * 0.26, y: wallTop - (wallTop - r.roofTop) * 0.55, k: 1.1 },
    ];
    return {
      id,
      row: l.row,
      x0,
      x1,
      base: r.base,
      wallH: r.wallH,
      roofTop: r.roofTop,
      shape,
      wall: walls[id % walls.length],
      roof: pick(ROOFS),
      door: pick(DOORS),
      curb,
      stand,
      wait,
      fires,
    };
  });
}

export const HOUSES: House[] = makeHouses();

// ---------- Fire station ----------

export const STATION = { x0: 20, x1: 350, base: 548, wallH: 122, roofTop: 392 };
export const ALARM: Pt = { x: 78, y: 486 };
export const ALARM_R = 30;
/** The three progress lamps above the garage door. */
export const LAMPS: Pt[] = [0, 1, 2].map((i) => ({ x: GARAGE_X - 44 + i * 44, y: STATION.base - STATION.wallH + 22 }));
export const GARAGE = { x0: GARAGE_X - 62, x1: GARAGE_X + 62, top: STATION.base - 94 };

/** Sticker shelf, top right (y moves down on wide screens). */
export const SHELF = { x: 920, y: 14, w: 250, h: 120 };
