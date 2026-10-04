// SVG art for the fire mode. The buildings, trees, props, ground textures
// and sky are the police town's generated pictures (see scene.ts); this file
// draws the roads around them, the fire station, the truck, and the fire.

import { OUT, vgrad } from '../draw';
import { TILES } from '../images';
import { GARAGE, LANE_END, LANE_X, PARK, ROAD_HALF, STATION, STREET_Y, WALK, W } from './layout';

const o = (k = 1) => `stroke="${OUT}" stroke-width="${(3.5 * k).toFixed(1)}" stroke-linejoin="round"`;

// ---------- Ground ----------

/** A texture fill from a generated tile (k = size), or a flat colour without one. */
function texture(id: string, tile: { url: string; w: number; h: number } | null, k: number, color: string): { def: string; fill: string } {
  if (!tile) return { def: '', fill: color };
  const w = tile.w * k;
  const h = tile.h * k;
  return {
    def: `<pattern id="${id}" patternUnits="userSpaceOnUse" width="${w}" height="${h}"><image href="${tile.url}" width="${w}" height="${h}" preserveAspectRatio="none"/></pattern>`,
    fill: `url(#${id})`,
  };
}

/** Grass, roads, sidewalks, crossings and the park, as one picture. */
export function groundSvg(): string {
  const ext = 1200;
  const grass = texture('fg-grass', TILES.grass, 0.5, '#8cc152');
  const asphalt = texture('fg-street', TILES.street, 0.6, '#6f7378');
  const walk = texture('fg-walk', TILES.sidewalk, 0.3, '#d9d2c3');
  const sand = texture('fg-sand', TILES.sand, 0.4, '#f1d38a');
  const parts: string[] = [];
  const laneH = LANE_END + 60 - STREET_Y[0];
  // Sidewalks first (they sit under the asphalt).
  for (const y of STREET_Y) parts.push(`<rect x="${-ext}" y="${y - ROAD_HALF - WALK}" width="${W + 2 * ext}" height="${2 * (ROAD_HALF + WALK)}" fill="${walk.fill}"/>`);
  for (const x of LANE_X) parts.push(`<rect x="${x - ROAD_HALF - WALK}" y="${STREET_Y[0]}" width="${2 * (ROAD_HALF + WALK)}" height="${laneH}" fill="${walk.fill}"/>`);
  // Driveway in front of the garage.
  parts.push(`<rect x="${GARAGE.x0 - 6}" y="${STATION.base - 2}" width="${GARAGE.x1 - GARAGE.x0 + 12}" height="${STREET_Y[1] - STATION.base}" fill="${walk.fill}"/>`);
  // Asphalt.
  for (const y of STREET_Y) parts.push(`<rect x="${-ext}" y="${y - ROAD_HALF}" width="${W + 2 * ext}" height="${2 * ROAD_HALF}" fill="${asphalt.fill}"/>`);
  for (const x of LANE_X) parts.push(`<rect x="${x - ROAD_HALF}" y="${STREET_Y[0]}" width="${2 * ROAD_HALF}" height="${laneH}" fill="${asphalt.fill}"/>`);
  // Kerb lines.
  for (const y of STREET_Y)
    for (const e of [-1, 1]) parts.push(`<path d="M${-ext} ${y + e * ROAD_HALF} H${W + ext}" stroke="#8d877c" stroke-width="3"/>`);
  for (const x of LANE_X)
    for (const e of [-1, 1])
      parts.push(`<path d="M${x + e * ROAD_HALF} ${STREET_Y[0] + ROAD_HALF} V${STREET_Y[1] - ROAD_HALF} M${x + e * ROAD_HALF} ${STREET_Y[1] + ROAD_HALF} V${LANE_END + 60}" stroke="#8d877c" stroke-width="3"/>`);
  // Centre dashes, skipping the crossings.
  const dash = (d: string) => `<path d="${d}" stroke="#f7f3e8" stroke-width="4" stroke-dasharray="22 18" stroke-linecap="round" opacity=".9"/>`;
  for (const y of STREET_Y) parts.push(dash(`M${-ext} ${y} H${W + ext}`));
  for (const x of LANE_X) parts.push(dash(`M${x} ${STREET_Y[0] + ROAD_HALF + 10} V${STREET_Y[1] - ROAD_HALF - 10} M${x} ${STREET_Y[1] + ROAD_HALF + 10} V${LANE_END + 60}`));
  // Zebra crossings next to the corners.
  for (const x of LANE_X)
    for (const y of STREET_Y)
      for (let i = 0; i < 5; i++) parts.push(`<rect x="${x + ROAD_HALF + 8}" y="${y - ROAD_HALF + 4 + i * 10.4}" width="22" height="6" rx="2" fill="#f7f3e8" opacity=".9"/>`);
  return `<svg viewBox="0 0 ${W} 800" width="${W}" height="800" style="overflow:visible">
    <defs>${grass.def}${asphalt.def}${walk.def}${sand.def}</defs>
    <rect x="${-ext}" y="${STREET_Y[0]}" width="${W + 2 * ext}" height="${800 + ext}" fill="${grass.fill}"/>
    ${parts.join('')}
    ${parkSvg(sand.fill)}
  </svg>`;
}

/** Pond, sandbox and a sand path in the park block (trees and benches are pictures). */
function parkSvg(sand: string): string {
  const x0 = PARK.x0;
  const w = PARK.x1 - PARK.x0;
  const px = (f: number) => x0 + f * w;
  return `<path d="M${px(0.1)} 760 Q${px(0.5)} 700 ${px(0.95)} 676" stroke="${OUT}" stroke-width="26" fill="none" stroke-linecap="round" opacity=".5"/>
    <path d="M${px(0.1)} 760 Q${px(0.5)} 700 ${px(0.95)} 676" stroke="${sand}" stroke-width="22" fill="none" stroke-linecap="round"/>
    <path d="M${px(0.1)} 716 C${px(0.1)} 684 ${px(0.3)} 672 ${px(0.42)} 678 C${px(0.56)} 684 ${px(0.66)} 700 ${px(0.6)} 726 C${px(0.55)} 750 ${px(0.32)} 758 ${px(0.2)} 748 C${px(0.12)} 742 ${px(0.1)} 730 ${px(0.1)} 716Z" fill="#7cc6ea" ${o()}/>
    <path d="M${px(0.2)} 696 Q${px(0.35)} 684 ${px(0.5)} 692" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
    <ellipse cx="${px(0.4)}" cy="724" rx="12" ry="5" fill="#5aac44" ${o(0.6)}/>
    <rect x="${px(0.7)}" y="732" width="62" height="44" rx="8" fill="${sand}" stroke="#a1774a" stroke-width="6"/>
    <circle cx="${px(0.7) + 18}" cy="754" r="5" fill="#e53935" ${o(0.5)}/><path d="M${px(0.7) + 36} 750 l10 -8 l4 10Z" fill="#42a5f5" ${o(0.5)}/>`;
}

/** Window with a frame and curtains, top-left at (x, y). */
function win(x: number, y: number, w: number, h: number): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#bfe6f7" ${o(0.8)}/>
    <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${OUT}" stroke-width="2"/>
    <path d="M${x + 2} ${y + 2} Q${x + w * 0.3} ${y + h * 0.5} ${x + 3} ${y + h - 2} M${x + w - 2} ${y + 2} Q${x + w * 0.7} ${y + h * 0.5} ${x + w - 3} ${y + h - 2}" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
    <rect class="win-glow" x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="#ffd54f"/>`;
}

// ---------- Fire station ----------

export function stationBox(): { x: number; y: number; w: number; h: number } {
  return { x: STATION.x0 - 12, y: STATION.roofTop - 70, w: STATION.x1 - STATION.x0 + 24, h: STATION.base - STATION.roofTop + 78 };
}

export function stationSvg(): string {
  const b = stationBox();
  const X = (x: number) => x - b.x;
  const Y = (y: number) => y - b.y;
  const x0 = X(STATION.x0);
  const x1 = X(STATION.x1);
  const base = Y(STATION.base);
  const wallTop = base - STATION.wallH;
  const top = Y(STATION.roofTop);
  const brick = vgrad('#c8463d', 0.12, -0.12);
  const bricks: string[] = [];
  for (let y = wallTop + 10; y < base - 4; y += 12) bricks.push(`<path d="M${x0 + 2} ${y} H${x1 - 2}" stroke="#9e3029" stroke-width="1.5" opacity=".45"/>`);
  // The tower on the left with a round window and a bell.
  const tx0 = x0 + 12;
  const tx1 = x0 + 110;
  const tTop = top - 46;
  const tWall = wallTop - 30;
  const gx0 = X(GARAGE.x0);
  const gx1 = X(GARAGE.x1);
  const gTop = Y(GARAGE.top);
  return `<svg viewBox="0 0 ${b.w} ${b.h}" width="${b.w}" height="${b.h}"><defs>${brick.def}</defs>
    <ellipse cx="${(x0 + x1) / 2}" cy="${base + 3}" rx="${(x1 - x0) / 2 + 10}" ry="6" fill="#000" opacity=".14"/>
    <rect x="${x0 - 8}" y="${top}" width="${x1 - x0 + 16}" height="${wallTop - top + 4}" rx="4" fill="#9aa3ab" ${o()}/>
    <rect x="${x0 + 150}" y="${top + 8}" width="34" height="16" rx="3" fill="#b9c1c8" ${o(0.7)}/>
    <rect x="${x0 + 230}" y="${top + 12}" width="22" height="14" rx="3" fill="#b9c1c8" ${o(0.7)}/>
    <rect x="${x0}" y="${wallTop}" width="${x1 - x0}" height="${STATION.wallH}" fill="${brick.fill}" ${o()}/>
    ${bricks.join('')}
    <rect x="${tx0 - 8}" y="${tTop}" width="${tx1 - tx0 + 16}" height="${tWall - tTop + 4}" rx="4" fill="#7d8790" ${o()}/>
    <rect x="${tx0}" y="${tWall}" width="${tx1 - tx0}" height="${wallTop - tWall + 2}" fill="#b23a32" ${o()}/>
    <path d="M${tx0 + 24} ${tWall + 6} h50 v24 h-50Z" fill="#ffd54f" ${o(0.7)}/>
    <path d="M${(tx0 + tx1) / 2} ${tWall + 9} q-10 0 -11 14 h22 q-1 -14 -11 -14Z" fill="#b8860b" ${o(0.6)}/>
    <rect x="${gx0 - 8}" y="${gTop - 8}" width="${gx1 - gx0 + 16}" height="${base - gTop + 8}" rx="6" fill="#e9e3d6" ${o()}/>
    <rect x="${gx0}" y="${gTop}" width="${gx1 - gx0}" height="${base - gTop}" fill="#3a3436"/>
    ${win(x1 - 54, wallTop + 22, 34, 30)}${win(x1 - 54, wallTop + 70, 34, 30)}
    <rect x="${x0 + 18}" y="${base - 30}" width="24" height="30" rx="3" fill="#7b4a2e" ${o(0.7)}/>
  </svg>`;
}

/** The garage door: horizontal slats with a window strip. Rolls up from the bottom. */
export function garageDoorSvg(): string {
  const w = GARAGE.x1 - GARAGE.x0;
  const h = STATION.base - GARAGE.top;
  const slats = Array.from({ length: 6 }, (_, i) => `<path d="M2 ${(i + 1) * (h / 7)} H${w - 2}" stroke="#9e3029" stroke-width="2.5"/>`).join('');
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
    <rect x="0" y="0" width="${w}" height="${h}" fill="#e2574c" ${o()}/>
    ${slats}
    ${[0, 1, 2, 3].map((i) => `<rect x="${10 + i * ((w - 20) / 4)}" y="${h / 7 + 4}" width="${(w - 20) / 4 - 6}" height="${h / 7 - 6}" rx="2" fill="#bfe6f7" ${o(0.5)}/>`).join('')}
  </svg>`;
}

/** The big red alarm button with a bell, for the station wall. */
export function alarmSvg(): string {
  return `<svg viewBox="0 0 80 80" width="80" height="80">
    <rect x="6" y="6" width="68" height="68" rx="14" fill="#f2f2f2" ${o()}/>
    <circle cx="40" cy="40" r="25" fill="#e53935" ${o()}/>
    <circle cx="40" cy="40" r="18" fill="#ff6f60"/>
    <path d="M40 26 q-10 0 -11 16 l-4 6 h30 l-4 -6 q-1 -16 -11 -16Z" fill="#ffd54f" ${o(0.6)}/>
    <circle cx="40" cy="51" r="3.5" fill="#ffd54f" ${o(0.5)}/>
  </svg>`;
}

/** Round lamp above the garage: dark until a fire is out. */
export function lampSvg(): string {
  return `<svg viewBox="0 0 36 36" width="36" height="36">
    <circle cx="18" cy="18" r="14" fill="#5d4037" ${o(0.8)}/>
    <circle class="lamp-on" cx="18" cy="18" r="10" fill="#ffd54f"/>
    <path class="lamp-on" d="M18 11 l2.2 4.5 l5 .6 l-3.7 3.4 l1 5 l-4.5 -2.5 l-4.5 2.5 l1 -5 l-3.7 -3.4 l5 -.6Z" fill="#fff8d0"/>
  </svg>`;
}

// ---------- Fire truck ----------

/** Truck seen from the side, facing right. 180x100, wheels touch y 96. */
export function truckSideSvg(driver: string): string {
  const red = vgrad('#e53935', 0.18, -0.14);
  return `<svg viewBox="0 0 180 100" width="180" height="100"><defs>${red.def}</defs>
    <ellipse cx="90" cy="96" rx="86" ry="6" fill="#000" opacity=".18"/>
    <path d="M8 36 H126 V84 H8Z" fill="${red.fill}" ${o()}/>
    <path d="M126 30 H150 Q164 30 170 48 L174 64 V84 H126Z" fill="${red.fill}" ${o()}/>
    <path d="M132 36 H150 Q158 36 162 50 L164 58 H132Z" fill="#bfe6f7" ${o(0.8)}/>
    <g transform="translate(130 33) scale(.27)">${driver}</g>
    <path d="M132 36 H150 Q158 36 162 50 L164 58 H132Z" fill="#fff" opacity=".2"/>
    <rect x="14" y="44" width="34" height="26" rx="3" fill="#cfd8dc" ${o(0.7)}/>
    <rect x="54" y="44" width="34" height="26" rx="3" fill="#cfd8dc" ${o(0.7)}/>
    <path d="M18 57 H44 M58 57 H84" stroke="${OUT}" stroke-width="2" opacity=".5"/>
    <path d="M8 74 H174" stroke="#f5f5f5" stroke-width="5"/>
    <path d="M8 74 H174" stroke="${OUT}" stroke-width="1" opacity=".3"/>
    <g class="ladder"><rect x="4" y="20" width="132" height="10" rx="3" fill="#cfd8dc" ${o(0.7)}/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${12 + i * 13} 21 V29" stroke="${OUT}" stroke-width="2"/>`).join('')}
      <path d="M128 30 V36 M16 30 V36" stroke="${OUT}" stroke-width="3"/></g>
    <g class="reel"><circle cx="106" cy="57" r="14" fill="#fff59d" ${o(0.8)}/>
      <circle cx="106" cy="57" r="9" fill="none" stroke="#c49b2a" stroke-width="4"/>
      <circle cx="106" cy="57" r="3" fill="${OUT}"/></g>
    <rect x="166" y="66" width="10" height="7" rx="2" fill="#ffd54f" ${o(0.6)}/>
    <rect x="4" y="66" width="6" height="8" rx="2" fill="#ff7043" ${o(0.6)}/>
    <g class="lights"><rect x="136" y="23" width="22" height="9" rx="4" fill="#42a5f5" ${o(0.7)}/></g>
    ${[34, 76, 150].map((x) => `<circle cx="${x}" cy="86" r="11" fill="#263238" ${o(0.8)}/><circle cx="${x}" cy="86" r="4.5" fill="#cfd8dc"/>`).join('')}
  </svg>`;
}

/** Truck seen from the front (driving down the screen). 100x100, wheels touch y 96. */
export function truckFrontSvg(driver: string): string {
  const red = vgrad('#e53935', 0.18, -0.14);
  return `<svg viewBox="0 0 100 100" width="100" height="100"><defs>${red.def}</defs>
    <ellipse cx="50" cy="96" rx="46" ry="6" fill="#000" opacity=".18"/>
    <rect x="6" y="80" width="18" height="16" rx="4" fill="#263238" ${o(0.8)}/><rect x="76" y="80" width="18" height="16" rx="4" fill="#263238" ${o(0.8)}/>
    <path d="M10 22 Q10 14 18 14 H82 Q90 14 90 22 V86 H10Z" fill="${red.fill}" ${o()}/>
    <path d="M18 24 H82 V50 H18Z" fill="#bfe6f7" ${o(0.8)}/>
    <g transform="translate(36 26) scale(.24)">${driver}</g>
    <path d="M18 24 H82 V50 H18Z" fill="#fff" opacity=".2"/>
    <rect x="30" y="58" width="40" height="18" rx="3" fill="#cfd8dc" ${o(0.7)}/>
    <path d="M34 63 H66 M34 68 H66 M34 73 H66" stroke="${OUT}" stroke-width="1.5" opacity=".5"/>
    <circle cx="20" cy="66" r="6" fill="#fff59d" ${o(0.7)}/><circle cx="80" cy="66" r="6" fill="#fff59d" ${o(0.7)}/>
    <rect x="6" y="80" width="88" height="7" rx="3" fill="#cfd8dc" ${o(0.7)}/>
    <g class="lights"><rect x="26" y="6" width="48" height="10" rx="5" fill="#42a5f5" ${o(0.7)}/></g>
  </svg>`;
}

/** Truck seen from behind (driving up the screen). 100x100, wheels touch y 96. */
export function truckBackSvg(): string {
  const red = vgrad('#e53935', 0.18, -0.14);
  return `<svg viewBox="0 0 100 100" width="100" height="100"><defs>${red.def}</defs>
    <ellipse cx="50" cy="96" rx="46" ry="6" fill="#000" opacity=".18"/>
    <rect x="6" y="80" width="18" height="16" rx="4" fill="#263238" ${o(0.8)}/><rect x="76" y="80" width="18" height="16" rx="4" fill="#263238" ${o(0.8)}/>
    <path d="M10 20 Q10 14 16 14 H84 Q90 14 90 20 V86 H10Z" fill="${red.fill}" ${o()}/>
    <rect x="18" y="24" width="30" height="50" rx="3" fill="#cfd8dc" ${o(0.7)}/><rect x="52" y="24" width="30" height="50" rx="3" fill="#cfd8dc" ${o(0.7)}/>
    <path d="M24 30 V68 M30 30 V68 M36 30 V68 M42 30 V68" stroke="${OUT}" stroke-width="1.5" opacity=".4"/>
    <rect x="34" y="8" width="32" height="10" rx="3" fill="#cfd8dc" ${o(0.6)}/>
    <rect x="12" y="74" width="10" height="8" rx="2" fill="#ff7043" ${o(0.6)}/><rect x="78" y="74" width="10" height="8" rx="2" fill="#ff7043" ${o(0.6)}/>
    <g class="lights"><rect x="40" y="2" width="20" height="8" rx="4" fill="#42a5f5" ${o(0.6)}/></g>
  </svg>`;
}

// ---------- Fire, smoke, water ----------

/** A friendly flame, 60x80, anchored at the bottom centre (30, 76). */
export function flameSvg(): string {
  return `<svg viewBox="0 0 60 80" width="60" height="80">
    <ellipse cx="30" cy="76" rx="20" ry="5" fill="#ff6f00" opacity=".35"/>
    <g class="fl fl1"><path d="M30 4 Q42 22 50 36 Q58 54 48 68 Q40 78 30 78 Q18 78 11 68 Q2 54 10 38 Q14 46 20 46 Q16 28 30 4Z" fill="#f4511e" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/></g>
    <g class="fl fl2"><path d="M30 24 Q40 38 44 50 Q48 64 40 71 Q34 76 30 76 Q22 76 18 70 Q12 60 18 50 Q22 56 26 54 Q24 40 30 24Z" fill="#ffa726"/></g>
    <g class="fl fl3"><path d="M30 44 Q36 54 38 60 Q40 70 34 73 Q30 75 27 73 Q21 70 23 62 Q25 56 30 44Z" fill="#ffee58"/></g>
  </svg>`;
}

/** Bell bubble shown over the burning house until the alarm is pressed. */
export function bellBubbleSvg(): string {
  return `<svg viewBox="0 0 80 80" width="80" height="80">
    <path d="M40 4 Q74 4 74 36 Q74 64 46 66 L40 78 L34 66 Q6 64 6 36 Q6 4 40 4Z" fill="#fff" ${o()}/>
    <path d="M40 16 q-12 0 -13 18 l-5 8 h36 l-5 -8 q-1 -18 -13 -18Z" fill="#e53935" ${o(0.7)}/>
    <circle cx="40" cy="47" r="4" fill="#e53935" ${o(0.6)}/>
    <path d="M18 18 l-6 -4 M62 18 l6 -4 M14 32 h-6 M66 32 h6" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
  </svg>`;
}

/** Start-screen button for the fire mode: red with a flame and a play triangle. */
export function fireButtonSvg(): string {
  return `<svg viewBox="0 0 240 240" width="240" height="240">
    <circle cx="120" cy="120" r="110" fill="#c62828" stroke="${OUT}" stroke-width="8"/>
    <circle cx="120" cy="120" r="92" fill="#e53935"/>
    <path d="M94 70 L178 120 L94 170Z" fill="#fff" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>
  </svg>`;
}
