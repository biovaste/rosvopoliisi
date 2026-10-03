// SVG art for the fire mode, drawn from high up: front walls face the viewer,
// roofs are seen from above. Same soft storybook style as the police town.

import { OUT, tone, vgrad, wob } from '../draw';
import { LANE_END, LANE_X, ROAD_HALF, STATION, STREET_Y, GARAGE, WALK, W, type House } from './layout';

const o = (k = 1) => `stroke="${OUT}" stroke-width="${(3.5 * k).toFixed(1)}" stroke-linejoin="round"`;

// ---------- Ground ----------

/** Grass, roads, sidewalks, crossings and the park, as one picture. */
export function groundSvg(): string {
  const ext = 1200;
  const asphalt = '#6f7378';
  const walk = '#d9d2c3';
  const parts: string[] = [];
  // Sidewalks first (they sit under the asphalt).
  for (const y of STREET_Y) parts.push(`<rect x="${-ext}" y="${y - ROAD_HALF - WALK}" width="${W + 2 * ext}" height="${2 * (ROAD_HALF + WALK)}" fill="${walk}"/>`);
  for (const x of LANE_X) parts.push(`<rect x="${x - ROAD_HALF - WALK}" y="${STREET_Y[0]}" width="${2 * (ROAD_HALF + WALK)}" height="${LANE_END + 60 - STREET_Y[0]}" fill="${walk}"/>`);
  // Driveway in front of the garage.
  parts.push(`<rect x="${GARAGE.x0 - 6}" y="${STATION.base - 2}" width="${GARAGE.x1 - GARAGE.x0 + 12}" height="${STREET_Y[1] - STATION.base}" fill="#c9c1b0"/>`);
  // Asphalt.
  for (const y of STREET_Y) parts.push(`<rect x="${-ext}" y="${y - ROAD_HALF}" width="${W + 2 * ext}" height="${2 * ROAD_HALF}" fill="${asphalt}"/>`);
  for (const x of LANE_X) parts.push(`<rect x="${x - ROAD_HALF}" y="${STREET_Y[0]}" width="${2 * ROAD_HALF}" height="${LANE_END + 60 - STREET_Y[0]}" fill="${asphalt}"/>`);
  // Kerb lines.
  const kerb = (x1: number, y1: number, x2: number, y2: number) => `<path d="M${x1} ${y1} L${x2} ${y2}" stroke="#a9a397" stroke-width="3"/>`;
  for (const y of STREET_Y) {
    parts.push(kerb(-ext, y - ROAD_HALF, W + ext, y - ROAD_HALF), kerb(-ext, y + ROAD_HALF, W + ext, y + ROAD_HALF));
  }
  // Centre dashes, skipping the crossings.
  const dash = (d: string) => `<path d="${d}" stroke="#f7f3e8" stroke-width="4" stroke-dasharray="22 18" stroke-linecap="round"/>`;
  for (const y of STREET_Y) parts.push(dash(`M${-ext} ${y} H${W + ext}`));
  for (const x of LANE_X) parts.push(dash(`M${x} ${STREET_Y[0] + ROAD_HALF + 10} V${STREET_Y[1] - ROAD_HALF - 10} M${x} ${STREET_Y[1] + ROAD_HALF + 10} V${LANE_END + 60}`));
  // Zebra crossings next to the corners.
  for (const x of LANE_X)
    for (const y of STREET_Y) {
      for (let i = 0; i < 5; i++) parts.push(`<rect x="${x + ROAD_HALF + 8}" y="${y - ROAD_HALF + 4 + i * 10.4}" width="22" height="6" rx="2" fill="#f7f3e8" opacity=".9"/>`);
    }
  // Grass tufts and flowers scattered on the lawns (fixed pattern).
  const tufts: string[] = [];
  for (let i = 0; i < 70; i++) {
    const x = ((i * 0.618034) % 1) * 1180 + 10;
    const y = 130 + ((i * 0.381966 * 7) % 1) * 660;
    if (STREET_Y.some((sy) => Math.abs(y - sy) < 50) || LANE_X.some((lx) => Math.abs(x - lx) < 50 && y > 330)) continue;
    tufts.push(i % 5 === 0 ? `<circle cx="${x.toFixed(0)}" cy="${y.toFixed(0)}" r="4" fill="${['#fff59d', '#f8bbd0', '#ffffff'][i % 3]}" stroke="${OUT}" stroke-width="1.2"/>` : `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l-3 -7 M${x.toFixed(0)} ${y.toFixed(0)} l0 -9 M${x.toFixed(0)} ${y.toFixed(0)} l3 -7" stroke="#4e8f2f" stroke-width="2" stroke-linecap="round"/>`);
  }
  return `<svg viewBox="0 0 ${W} 800" width="${W}" height="800" style="overflow:visible">
    <rect x="${-ext}" y="110" width="${W + 2 * ext}" height="${800 + ext}" fill="#8cc152"/>
    <path d="M${-ext} 118 H${W + ext} V140 H${-ext}Z" fill="#7fb547"/>
    ${tufts.join('')}
    ${parts.join('')}
    ${parkSvg()}
  </svg>`;
}

/** Pond, sandbox and paths in the park (bottom left block). Trees are separate props. */
function parkSvg(): string {
  return `<path d="${wob([[40, 690], [120, 660], [230, 668], [290, 708], [250, 760], [130, 772], [52, 742]], 4)}" fill="#7cc6ea" ${o()}/>
    <path d="M80 700 Q140 680 210 690" stroke="#fff" stroke-width="4" fill="none" opacity=".6" stroke-linecap="round"/>
    <ellipse cx="170" cy="726" rx="16" ry="6" fill="#5aac44" ${o(0.6)}/>
    <rect x="290" y="732" width="56" height="44" rx="6" fill="#f1d38a" ${o()}/>
    <rect x="286" y="728" width="64" height="52" rx="8" fill="none" stroke="#a1774a" stroke-width="5"/>
    <circle cx="310" cy="752" r="5" fill="#e53935" ${o(0.5)}/><path d="M326 748 l10 -8 l4 10Z" fill="#42a5f5" ${o(0.5)}/>`;
}

/** Sky band with hills and a row of far trees along the top. */
export function hillsSvg(): string {
  const trees = Array.from({ length: 26 }, (_, i) => {
    const x = -60 + i * 52 + (i % 3) * 7;
    const r = 15 + (i % 4) * 3;
    return `<circle cx="${x}" cy="${118 - r * 0.6}" r="${r}" fill="${i % 2 ? '#5f9e3c' : '#6dab45'}" stroke="${OUT}" stroke-width="2.5"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} 140" width="${W}" height="140" style="overflow:visible">
    <path d="M-1200 120 Q-900 40 -600 92 Q-300 30 0 86 Q220 30 430 80 Q640 26 860 78 Q1040 36 1200 84 Q1500 40 2400 90 V140 H-1200Z" fill="#9dcf6a" stroke="${OUT}" stroke-width="3"/>
    ${trees}</svg>`;
}

// ---------- Trees ----------

export function treeSvg(r: number, color: string): string {
  const w = r * 2 + 12;
  const h = r * 2 + 30;
  const c = vgrad(color, 0.22, -0.15);
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}"><defs>${c.def}</defs>
    <ellipse cx="${w / 2}" cy="${h - 6}" rx="${r * 0.8}" ry="6" fill="#000" opacity=".15"/>
    <rect x="${w / 2 - 6}" y="${h - 30}" width="12" height="24" rx="4" fill="#8d6e63" ${o(0.8)}/>
    <path d="${wob(
      Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * Math.PI * 2;
        const rr = r * (i % 2 ? 0.92 : 1);
        return [w / 2 + Math.cos(a) * rr, r + 6 + Math.sin(a) * rr] as [number, number];
      }),
      3,
    )}" fill="${c.fill}" ${o()}/>
    <ellipse cx="${w / 2 - r * 0.35}" cy="${r * 0.6}" rx="${r * 0.3}" ry="${r * 0.18}" fill="#fff" opacity=".25"/>
  </svg>`;
}

// ---------- Houses ----------

/** Window with a frame and curtains, top-left at (x, y). */
function win(x: number, y: number, w: number, h: number): string {
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#bfe6f7" ${o(0.8)}/>
    <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${OUT}" stroke-width="2"/>
    <path d="M${x + 2} ${y + 2} Q${x + w * 0.3} ${y + h * 0.5} ${x + 3} ${y + h - 2} M${x + w - 2} ${y + 2} Q${x + w * 0.7} ${y + h * 0.5} ${x + w - 3} ${y + h - 2}" stroke="#fff" stroke-width="2" fill="none" opacity=".7"/>
    <rect class="win-glow" x="${x + 2}" y="${y + 2}" width="${w - 4}" height="${h - 4}" fill="#ffd54f"/>`;
}

/** Where a house's picture goes (top-left) and how big it is. */
export function houseBox(h: House): { x: number; y: number; w: number; h: number } {
  return { x: h.x0 - 16, y: h.roofTop - 40, w: h.x1 - h.x0 + 32, h: h.base - h.roofTop + 48 };
}

export function houseSvg(h: House): string {
  const b = houseBox(h);
  const X = (x: number) => x - b.x;
  const Y = (y: number) => y - b.y;
  const x0 = X(h.x0);
  const x1 = X(h.x1);
  const cx = (x0 + x1) / 2;
  const base = Y(h.base);
  const wallH = h.shape === 'tall' ? h.wallH * 1.45 : h.wallH;
  const wallTop = base - wallH;
  const top = Y(h.roofTop);
  const wall = vgrad(h.wall, 0.15, -0.1);
  const roof = h.roof;
  const ov = 9;
  const defs = [wall.def];
  let roofSvg = '';
  if (h.shape === 'gable') {
    const gh = 18;
    roofSvg = `<path d="M${x0 - ov} ${wallTop + 4} L${x0 - ov} ${top + 6} Q${x0 - ov} ${top} ${x0} ${top} H${cx} V${wallTop - gh}Z" fill="${tone(roof, 0.12)}" ${o()}/>
      <path d="M${x1 + ov} ${wallTop + 4} L${x1 + ov} ${top + 6} Q${x1 + ov} ${top} ${x1} ${top} H${cx} V${wallTop - gh}Z" fill="${tone(roof, -0.12)}" ${o()}/>
      ${[0.25, 0.5, 0.75].map((t) => `<path d="M${x0 - ov + 4} ${top + (wallTop - top) * t} L${cx - 3} ${top + (wallTop - gh - top) * t}" stroke="${tone(roof, -0.3)}" stroke-width="2" opacity=".6"/>`).join('')}
      ${[0.25, 0.5, 0.75].map((t) => `<path d="M${x1 + ov - 4} ${top + (wallTop - top) * t} L${cx + 3} ${top + (wallTop - gh - top) * t}" stroke="${tone(roof, -0.4)}" stroke-width="2" opacity=".6"/>`).join('')}
      <path d="M${x0} ${wallTop} L${cx} ${wallTop - gh} L${x1} ${wallTop}Z" fill="${wall.fill}" ${o()}/>
      <circle cx="${cx}" cy="${wallTop - gh * 0.45}" r="5" fill="#bfe6f7" ${o(0.6)}/>`;
  } else if (h.shape === 'tall') {
    const inset = (x1 - x0) * 0.22;
    const flatT = top + (wallTop - top) * 0.3;
    const flatB = top + (wallTop - top) * 0.62;
    roofSvg = `<path d="M${x0 - ov} ${wallTop + 4} L${x0 - ov} ${top} H${x1 + ov} V${wallTop + 4}Z" fill="${tone(roof, -0.08)}" ${o()}/>
      <path d="M${x0 - ov} ${top} L${x0 + inset} ${flatT} H${x1 - inset} L${x1 + ov} ${top}Z" fill="${tone(roof, 0.18)}" ${o(0.7)}/>
      <path d="M${x0 - ov} ${top} L${x0 + inset} ${flatT} V${flatB} L${x0 - ov} ${wallTop + 4}Z" fill="${tone(roof, 0.06)}" ${o(0.7)}/>
      <path d="M${x1 + ov} ${top} L${x1 - inset} ${flatT} V${flatB} L${x1 + ov} ${wallTop + 4}Z" fill="${tone(roof, -0.2)}" ${o(0.7)}/>
      <rect x="${x0 + inset}" y="${flatT}" width="${x1 - x0 - 2 * inset}" height="${flatB - flatT}" fill="${tone(roof, 0.1)}" ${o(0.7)}/>`;
  } else {
    const ridge = top + (wallTop - top) * 0.42;
    roofSvg = `<path d="M${x0 - ov} ${top + 4} Q${x0 - ov} ${top} ${x0 - ov + 4} ${top} H${x1 + ov - 4} Q${x1 + ov} ${top} ${x1 + ov} ${top + 4} V${ridge} H${x0 - ov}Z" fill="${tone(roof, 0.16)}" ${o()}/>
      <path d="M${x0 - ov} ${ridge} H${x1 + ov} V${wallTop + 4} H${x0 - ov}Z" fill="${tone(roof, -0.06)}" ${o()}/>
      ${[0.33, 0.66].map((t) => `<path d="M${x0 - ov + 3} ${ridge + (wallTop - ridge) * t} H${x1 + ov - 3}" stroke="${tone(roof, -0.3)}" stroke-width="2" opacity=".6"/>`).join('')}
      <path d="M${x0 - ov + 3} ${top + (ridge - top) * 0.5} H${x1 + ov - 3}" stroke="${tone(roof, -0.15)}" stroke-width="2" opacity=".5"/>`;
  }
  // Chimney on the roof.
  const chx = x0 + (x1 - x0) * 0.72;
  const chy = top + (wallTop - top) * 0.3;
  const chimney = `<rect x="${chx - 9}" y="${chy - 22}" width="18" height="28" rx="2" fill="#b5654a" ${o(0.8)}/><rect x="${chx - 12}" y="${chy - 26}" width="24" height="7" rx="2" fill="#8d4a36" ${o(0.8)}/>`;
  // Front wall: windows and a door (two rows of windows for tall houses).
  const ww = Math.min(26, (x1 - x0) * 0.18);
  const wh = Math.min(24, h.wallH * 0.38);
  const rowY = [base - h.wallH * 0.82];
  if (h.shape === 'tall') rowY.unshift(wallTop + 10);
  const doorW = 24;
  const doorX = cx - doorW / 2;
  const doorH = h.wallH * 0.62;
  const windows = rowY.map((y) => win(x0 + (x1 - x0) * 0.12, y, ww, wh) + win(x1 - (x1 - x0) * 0.12 - ww, y, ww, wh)).join('');
  const soot = `<g class="soot">${[0.22, 0.78].map((t) => `<ellipse cx="${x0 + (x1 - x0) * t}" cy="${base - h.wallH * 0.8}" rx="${ww * 0.9}" ry="${wh}" fill="#3b3330" opacity=".45"/>`).join('')}
    <ellipse cx="${cx}" cy="${(top + wallTop) / 2}" rx="${(x1 - x0) * 0.4}" ry="${(wallTop - top) * 0.32}" fill="#3b3330" opacity=".35"/></g>`;
  return `<svg viewBox="0 0 ${b.w} ${b.h}" width="${b.w}" height="${b.h}"><defs>${defs.join('')}</defs>
    <ellipse cx="${cx}" cy="${base + 3}" rx="${(x1 - x0) / 2 + 10}" ry="6" fill="#000" opacity=".14"/>
    ${chimney}
    <rect x="${x0}" y="${wallTop}" width="${x1 - x0}" height="${wallH}" fill="${wall.fill}" ${o()}/>
    <path d="M${x0 + 3} ${base - 6} H${x1 - 3}" stroke="${tone(h.wall, -0.2)}" stroke-width="5" opacity=".5"/>
    ${roofSvg}
    ${windows}
    <rect x="${doorX}" y="${base - doorH}" width="${doorW}" height="${doorH}" rx="4" fill="${h.door}" ${o(0.8)}/>
    <circle cx="${doorX + doorW - 6}" cy="${base - doorH / 2}" r="2.2" fill="#ffd54f"/>
    <path d="M${doorX - 4} ${base} h${doorW + 8}" stroke="${OUT}" stroke-width="3"/>
    ${soot}
  </svg>`;
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
