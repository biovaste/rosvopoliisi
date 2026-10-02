// Code-drawn parts of the town: chimneys, trees and the ground layer. Buildings,
// sky and ground textures are generated images (see images.ts).

import { OUT, wob, type P } from './draw';
import type { TileArt } from './images';

const rect = (x: number, y: number, w: number, h: number): P[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];


/** Wavy roof tiles clipped to a shape. */
export type BuildingKind = 'bakery' | 'bank' | 'jewelry' | 'home';

/** Chimney used as a hiding spot (60 x 80). */
export function chimneySpotSvg(): string {
  return `<svg viewBox="0 0 60 80" width="60" height="80">
    <path d="${wob(rect(6, 10, 48, 70), 1)}" fill="#b0614f" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M6 30 H54 M6 50 H54 M28 10 V30 M18 30 V50 M40 50 V70" stroke="#7b3a32" stroke-width="2"/>
    <path d="${wob(rect(0, 0, 60, 14), 1)}" fill="#8d4339" stroke="${OUT}" stroke-width="3.5"/>
  </svg>`;
}

// ---------- Trees and backdrop ----------

export type TreeStyle = 'apple' | 'round' | 'autumn';

/** Fluffy storybook tree, 200 x 300 (trunk bottom at 300). */
export function treeSvg(style: TreeStyle): string {
  const leaf = style === 'autumn' ? '#f2a23a' : style === 'apple' ? '#5aac44' : '#4e9f3d';
  const dark = style === 'autumn' ? '#d9822b' : '#3f8a32';
  const light = style === 'autumn' ? '#ffc766' : '#7cc05a';
  const blob = (cx: number, cy: number, r: number, c: string) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}"/>`;
  const canopy = [
    [60, 120, 46],
    [100, 80, 54],
    [142, 118, 46],
    [100, 140, 56],
    [56, 156, 36],
    [146, 158, 36],
  ];
  const outline = canopy.map(([x, y, r]) => blob(x, y, r + 3.5, OUT)).join('');
  const fill = canopy.map(([x, y, r]) => blob(x, y, r, leaf)).join('');
  const fruit =
    style === 'apple'
      ? [
          [70, 110],
          [128, 96],
          [118, 150],
          [60, 160],
          [150, 140],
          [96, 70],
        ]
          .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="7" fill="#e53935" stroke="${OUT}" stroke-width="2"/><path d="M${x} ${y - 7} l2 -4" stroke="#5d4037" stroke-width="2"/>`)
          .join('')
      : `<path d="M60 120 q10 -10 20 0 M118 92 q10 -10 20 0 M104 156 q10 -10 20 0" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 200 300" width="200" height="300">
    <ellipse cx="100" cy="294" rx="64" ry="9" fill="#2e4a1e" opacity=".18"/>
    <path d="M84 300 Q90 230 86 170 L114 170 Q110 230 118 300Z" fill="#8d6040" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M96 210 q6 22 0 44 M106 262 q-4 14 0 28" stroke="${OUT}" stroke-width="2" fill="none" opacity=".3"/>
    <path d="M100 196 L72 172 M102 200 L130 176" stroke="#8d6040" stroke-width="8" stroke-linecap="round"/>
    ${outline}${fill}
    ${blob(138, 140, 34, dark).replace('/>', ' opacity=".35"/>')}
    ${blob(80, 82, 24, light).replace('/>', ' opacity=".55"/>')}${blob(52, 120, 16, light).replace('/>', ' opacity=".45"/>')}
    ${fruit}
  </svg>`;
}

const ASPHALT = '#7a7f8e';

function fill(id: string, tile: TileArt | null, fallback: string, k = 1): { def: string; paint: string } {
  if (!tile) return { def: '', paint: fallback };
  const w = tile.w * k;
  const h = tile.h * k;
  return {
    def: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}"><image href="${tile.url}" width="${w}" height="${h}"/></pattern>`,
    paint: `url(#${id})`,
  };
}

/**
 * The ground layer drawn over the sky picture: the winding road, the street,
 * sidewalks, lawn, playground sand and market paving. 1200 x 800.
 */
export function backdropSvg(t: { grass: TileArt | null; sand: TileArt | null; sidewalk: TileArt | null; street: TileArt | null }): string {
  const grass = fill('pg', t.grass, '#7cc35a');
  const sand = fill('ps', t.sand, '#f1d9a6');
  const walk = fill('pw', t.sidewalk, '#e8d8b8', 0.32);
  const plaza = fill('pp', t.sidewalk, '#dcc7a1', 0.55);
  const street = fill('pa', t.street, ASPHALT, 0.6);
  const edge = `stroke="${OUT}" stroke-width="3"`;
  return `<svg viewBox="0 0 1200 800" width="1200" height="800" style="overflow:visible">
    <defs>${grass.def}${sand.def}${walk.def}${plaza.def}${street.def}</defs>
    <path d="M628 414 Q612 440 636 462 Q668 488 650 505 L560 505 Q598 482 596 458 Q588 436 620 414Z" fill="${street.paint}" ${edge}/>
    <path d="${wob(rect(-60, 470, 1320, 35), 1)}" fill="${walk.paint}" ${edge}/>
    <path d="${wob(rect(-60, 505, 1320, 82), 1)}" fill="${street.paint}" ${edge}/>
    <path d="M-60 546 H1260" stroke="#fff" stroke-width="5" stroke-dasharray="34 26" opacity=".85"/>
    <path d="${wob(rect(-60, 587, 1320, 28), 1)}" fill="${walk.paint}" ${edge}/>
    <path d="M-60 615 H1260 V840 H-60Z" fill="${grass.paint}"/>
    <path d="M-60 615 H1260" ${edge}/>
    <path d="M20 650 Q200 618 390 650 Q420 730 380 800 L20 800Z" fill="${sand.paint}" ${edge}/>
    <path d="M800 640 Q1000 618 1260 636 L1260 820 L780 820 Q760 720 800 640Z" fill="${plaza.paint}" ${edge}/>
    <path d="M430 615 Q560 700 520 800 L610 800 Q640 700 520 615Z" fill="${plaza.paint}" ${edge}/>
  </svg>`;
}
