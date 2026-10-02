// The town is re-rolled on every page load: building order and colours, tree
// types, fences and flowers and the police officer change between sessions.

import type { BuildingKind, BuildingLook, TreeStyle } from './buildings';
import { pick, randomLook, shuffle, type Look } from './people';

export interface Town {
  /** Buildings in the four back-row slots, left to right. */
  buildings: BuildingLook[];
  backTree: TreeStyle;
  nearTree: TreeStyle;
  bush: string;
  fence: boolean;
  police: Look;
}

const WALLS = ['#ffe3b3', '#cde8c4', '#fff4dc', '#d8ecf7', '#f9cfd8', '#fff6b8', '#e3d4f2', '#ffd3bd'];
const ROOFS = ['#e0604f', '#5f7fd1', '#f29a38', '#3fa99a', '#9c6b4e', '#9b59b6', '#e85d8a', '#5aa04a'];
const TRIMS = ['#e53935', '#43a047', '#1e88e5', '#8e24aa', '#f4511e', '#00897b'];

export function makeTown(): Town {
  const kinds = shuffle(['bakery', 'bank', 'jewelry', 'home'] as BuildingKind[]);
  const walls = shuffle(WALLS);
  const roofs = shuffle(ROOFS);
  const trims = shuffle(TRIMS);
  return {
    buildings: kinds.map((kind, i) => ({
      kind,
      wall: kind === 'bank' ? pick(['#f3ead8', '#e8eef2', '#efe4cf']) : walls[i],
      roof: kind === 'bank' ? '#d8cbb0' : roofs[i],
      trim: trims[i],
    })),
    backTree: pick(['apple', 'round', 'autumn'] as TreeStyle[]),
    nearTree: pick(['apple', 'round', 'autumn'] as TreeStyle[]),
    bush: pick(['#5aac44', '#4e9f3d', '#6cbf4a']),
    fence: Math.random() < 0.7,
    police: randomLook(),
  };
}

export const town: Town = makeTown();
