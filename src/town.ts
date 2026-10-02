// The town is re-rolled on every page load: buildings, colours, tree, hiding
// objects and decorations change between play sessions.

import type { BuildingKind, BuildingLook, TreeStyle } from './art';
import { pick, randomLook, shuffle, type Look } from './people';

export type FrontKind = 'bush' | 'bin' | 'crate' | 'barrel';

export interface Town {
  buildings: BuildingLook[];
  tree: TreeStyle;
  front: FrontKind[];
  bushColors: string[];
  flowers: { x: number; colors: string[] }[];
  fence: boolean;
  police: Look;
}

const WALLS = ['#ffe0b2', '#c8e6c9', '#fff3e0', '#e1f5fe', '#f8bbd0', '#fff9c4', '#d1c4e9', '#ffccbc'];
const ROOFS = ['#e57373', '#7986cb', '#ffb74d', '#4db6ac', '#a1887f', '#ba68c8', '#f06292'];
const DOORS = ['#8d6e63', '#5d4037', '#6d4c41', '#c62828', '#1565c0', '#2e7d32'];
const FLOWER_COLORS = ['#f06292', '#ffd54f', '#ba68c8', '#ff8a65', '#ffffff', '#64b5f6'];

export function makeTown(): Town {
  const kinds: BuildingKind[] = shuffle(['bakery', 'shop', 'cafe', 'bank', 'house', 'house'] as BuildingKind[]).slice(0, 3);
  const walls = shuffle(WALLS);
  const roofs = shuffle(ROOFS);
  const front = shuffle(['bush', 'bush', 'bin', 'crate', 'barrel'] as FrontKind[]).slice(0, 3);
  return {
    buildings: kinds.map((kind, i) => ({ kind, wall: walls[i], roof: roofs[i], door: pick(DOORS) })),
    tree: pick(['apple', 'birch', 'autumn'] as TreeStyle[]),
    front,
    bushColors: shuffle(['#66bb6a', '#43a047', '#7cb342', '#4caf50']),
    flowers: shuffle([340, 560, 860, 1110])
      .slice(0, 2 + Math.floor(Math.random() * 2))
      .map((x) => ({ x, colors: shuffle(FLOWER_COLORS).slice(0, 4) })),
    fence: Math.random() < 0.6,
    police: randomLook(),
  };
}

export const town: Town = makeTown();
