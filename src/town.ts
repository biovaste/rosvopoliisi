// The town is re-rolled on every page load: building order, tree types,
// fences and the police officer change between sessions.

import type { BuildingKind, TreeStyle } from './buildings';
import { pick, randomLook, shuffle, type Look } from './people';

export interface Town {
  /** Buildings in the four back-row slots, left to right. */
  buildings: { kind: BuildingKind }[];
  backTree: TreeStyle;
  nearTree: TreeStyle;
  bush: string;
  fence: boolean;
  police: Look;
}

export function makeTown(): Town {
  const kinds = shuffle(['bakery', 'bank', 'jewelry', 'home'] as BuildingKind[]);
  // The last slot runs off the right edge, so keep a centre-door building there.
  if (kinds[3] === 'bakery' || kinds[3] === 'jewelry') {
    const j = kinds.findIndex((k) => k === 'home' || k === 'bank');
    [kinds[3], kinds[j]] = [kinds[j], kinds[3]];
  }
  return {
    buildings: kinds.map((kind) => ({ kind })),
    backTree: pick(['apple', 'round', 'autumn'] as TreeStyle[]),
    nearTree: pick(['apple', 'round', 'autumn'] as TreeStyle[]),
    bush: pick(['#5aac44', '#4e9f3d', '#6cbf4a']),
    fence: Math.random() < 0.7,
    police: randomLook(),
  };
}

export const town: Town = makeTown();
