// Town art in a warm, hand-drawn storybook style: slightly wobbly outlines,
// tiled roofs, shutters, flower boxes and soft shading. All drawn in code.

import { OUT, rnd, wob, type P } from './draw';

const rect = (x: number, y: number, w: number, h: number): P[] => [
  [x, y],
  [x + w, y],
  [x + w, y + h],
  [x, y + h],
];

let uid = 0;
const id = (p: string) => `${p}${++uid}`;

/** Wavy roof tiles clipped to a shape. */
function tiles(clipD: string, x0: number, y0: number, x1: number, y1: number, color: string): string {
  const cid = id('rt');
  let rows = '';
  for (let y = y0 + 12; y < y1; y += 14) {
    let d = `M${x0} ${y}`;
    for (let x = x0; x < x1; x += 16) d += ` q8 7 16 0`;
    rows += `<path d="${d}" fill="none" stroke="${color}" stroke-width="2.5"/>`;
  }
  return `<clipPath id="${cid}"><path d="${clipD}"/></clipPath><g clip-path="url(#${cid})" opacity=".55">${rows}</g>`;
}

function window2(x: number, y: number, w: number, h: number, shutter?: string): string {
  const sh = shutter
    ? `<path d="${wob(rect(x - 12, y, 11, h), 0.8)}" fill="${shutter}" stroke="${OUT}" stroke-width="2.5"/>
       <path d="${wob(rect(x + w + 1, y, 11, h), 0.8)}" fill="${shutter}" stroke="${OUT}" stroke-width="2.5"/>`
    : '';
  const glass = (fill: string, cls: string) =>
    `<path class="${cls}" d="${wob(rect(x, y, w, h), 1)}" fill="${fill}" stroke="${OUT}" stroke-width="3"/>`;
  return `${sh}${glass('#bfe3f5', 'win')}${glass('#ffd970', 'win-lit')}
    <path d="M${x + w / 2} ${y} V${y + h} M${x} ${y + h / 2} H${x + w}" stroke="${OUT}" stroke-width="2.2"/>
    <path d="M${x + 4} ${y + h / 2 - 4} L${x + w / 2 - 4} ${y + 4}" stroke="#fff" stroke-width="2.5" opacity=".6"/>`;
}

function flowerBox(x: number, y: number, w: number): string {
  const blooms = Array.from({ length: Math.floor(w / 9) }, (_, i) => {
    const c = ['#f06292', '#ffd54f', '#ba68c8', '#ff8a65'][i % 4];
    return `<circle cx="${x + 5 + i * 9}" cy="${y - 3 - (i % 2) * 3}" r="4.2" fill="${c}" stroke="${OUT}" stroke-width="1.2"/>`;
  }).join('');
  return `<path d="M${x - 2} ${y - 2} q${w / 2} -10 ${w + 4} 0" fill="#7cb342" stroke="${OUT}" stroke-width="1.5"/>${blooms}
    <path d="${wob(rect(x - 3, y, w + 6, 10), 0.6)}" fill="#a1694a" stroke="${OUT}" stroke-width="2.5"/>`;
}

function door(x: number, y: number, w: number, h: number, color: string): string {
  return `<path d="M${x} ${y + h} V${y + w / 2} Q${x} ${y} ${x + w / 2} ${y} Q${x + w} ${y} ${x + w} ${y + w / 2} V${y + h}Z" fill="${color}" stroke="${OUT}" stroke-width="3"/>
    <path d="M${x + 6} ${y + h - 6} V${y + w / 2 + 2} M${x + w - 6} ${y + h - 6} V${y + w / 2 + 2}" stroke="${OUT}" stroke-width="1.5" opacity=".35"/>
    <circle cx="${x + w - 8}" cy="${y + h * 0.6}" r="3" fill="#ffd54f" stroke="${OUT}" stroke-width="1.2"/>
    <path d="${wob(rect(x - 6, y + h, w + 12, 7), 0.5)}" fill="#bcaaa4" stroke="${OUT}" stroke-width="2.5"/>`;
}

function shade(clipD: string, x: number, y: number, w: number, h: number): string {
  const cid = id('sh');
  return `<clipPath id="${cid}"><path d="${clipD}"/></clipPath>
    <g clip-path="url(#${cid})"><rect x="${x + w * 0.78}" y="${y}" width="${w * 0.3}" height="${h}" fill="#3a2c2a" opacity=".1"/>
    <rect x="${x}" y="${y}" width="${w}" height="8" fill="#3a2c2a" opacity=".12"/></g>`;
}

function smoke(x: number, y: number): string {
  return `<g class="smoke">${[0, 1, 2]
    .map((i) => `<circle class="puff p${i}" cx="${x}" cy="${y}" r="${7 + i * 2}" fill="#fff" opacity=".8"/>`)
    .join('')}</g>`;
}

// ---------- Buildings ----------

export type BuildingKind = 'bakery' | 'bank' | 'jewelry' | 'home';

export interface BuildingLook {
  kind: BuildingKind;
  wall: string;
  roof: string;
  trim: string;
}

export const BUILDING_W = 180;

/** Height of each building (bottom is at the sidewalk) and its chimney, if any. */
export function buildingGeom(kind: BuildingKind): { h: number; wallTop: number; chimney: { x: number; top: number } | null } {
  switch (kind) {
    case 'bakery':
      return { h: 220, wallTop: 92, chimney: { x: 132, top: 2 } };
    case 'home':
      return { h: 230, wallTop: 100, chimney: { x: 48, top: 8 } };
    case 'bank':
      return { h: 230, wallTop: 62, chimney: null };
    case 'jewelry':
      return { h: 205, wallTop: 58, chimney: null };
  }
}

function gable(w: number, peak: number, eave: number, roof: string): string {
  const d = wob(
    [
      [-10, eave],
      [w / 2, peak],
      [w + 10, eave],
      [w + 4, eave + 10],
      [-4, eave + 10],
    ],
    2,
  );
  return `<path d="${d}" fill="${roof}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>${tiles(d, -10, peak, w + 10, eave + 10, OUT)}
    <path d="M${w / 2 - 30} ${peak + 26} L${w / 2} ${peak + 4}" stroke="#fff" stroke-width="3" opacity=".35" stroke-linecap="round"/>`;
}

function awning(x: number, y: number, w: number, c: string): string {
  const n = Math.round(w / 20);
  const sw = w / n;
  return Array.from({ length: n }, (_, i) => {
    const sx = x + i * sw;
    return `<path d="M${sx} ${y} h${sw} v16 q${-sw / 2} 9 ${-sw} 0Z" fill="${i % 2 ? '#fff' : c}" stroke="${OUT}" stroke-width="2.2" stroke-linejoin="round"/>`;
  }).join('');
}

function signBoard(cx: number, cy: number, inner: string): string {
  return `<g transform="translate(${cx} ${cy})"><path d="${wob(rect(-30, -15, 60, 30), 1)}" fill="#fff8e7" stroke="${OUT}" stroke-width="3"/>${inner}</g>`;
}

/** Building SVG, 180 wide. `chimneyIsSpot` leaves the chimney out (it is drawn as a hiding spot). */
export function buildingSvg(b: BuildingLook, chimneyIsSpot: boolean): string {
  const g = buildingGeom(b.kind);
  const W = BUILDING_W;
  const H = g.h;
  const wallD = wob(rect(4, g.wallTop, W - 8, H - g.wallTop - 4), 1.6);
  let body = '';
  switch (b.kind) {
    case 'home': {
      body = `${gable(W, 4, g.wallTop + 4, b.roof)}
        <path d="${wallD}" fill="${b.wall}" stroke="${OUT}" stroke-width="3.5"/>
        ${shade(wallD, 4, g.wallTop, W - 8, H)}
        <circle cx="${W / 2}" cy="${g.wallTop - 26}" r="12" fill="#bfe3f5" stroke="${OUT}" stroke-width="3"/>
        <circle class="win-lit" cx="${W / 2}" cy="${g.wallTop - 26}" r="12" fill="#ffd970" stroke="${OUT}" stroke-width="3"/>
        ${window2(26, g.wallTop + 22, 34, 34, b.trim)}${window2(W - 60, g.wallTop + 22, 34, 34, b.trim)}
        ${flowerBox(24, g.wallTop + 58, 38)}${flowerBox(W - 62, g.wallTop + 58, 38)}
        ${door(W / 2 - 20, H - 66, 40, 58, b.trim)}`;
      break;
    }
    case 'bakery': {
      body = `${gable(W, 6, g.wallTop + 2, b.roof)}
        <path d="${wallD}" fill="${b.wall}" stroke="${OUT}" stroke-width="3.5"/>
        ${shade(wallD, 4, g.wallTop, W - 8, H)}
        ${signBoard(W / 2, g.wallTop - 26, `<path d="M-20 4 Q-8 -12 2 0 Q12 -12 22 4 Q10 12 2 6 Q-8 12 -20 4Z" fill="#e0a85a" stroke="${OUT}" stroke-width="2"/>`)}
        ${awning(12, g.wallTop + 18, W - 24, b.trim)}
        <path d="${wob(rect(18, g.wallTop + 44, 70, 54), 1)}" fill="#bfe3f5" stroke="${OUT}" stroke-width="3" class="win"/>
        <path d="${wob(rect(18, g.wallTop + 44, 70, 54), 1)}" fill="#ffd970" stroke="${OUT}" stroke-width="3" class="win-lit"/>
        <path d="M24 ${g.wallTop + 92} h58" stroke="${OUT}" stroke-width="2.5"/>
        <ellipse cx="38" cy="${g.wallTop + 84}" rx="12" ry="7" fill="#d9944a" stroke="${OUT}" stroke-width="2"/>
        <ellipse cx="66" cy="${g.wallTop + 84}" rx="12" ry="7" fill="#e8b46a" stroke="${OUT}" stroke-width="2"/>
        <path d="M44 ${g.wallTop + 72} q8 -12 16 0Z" fill="#f48fb1" stroke="${OUT}" stroke-width="2"/>
        ${door(W - 66, H - 70, 42, 62, '#8d5a3b')}`;
      break;
    }
    case 'bank': {
      const pd = wob(
        [
          [-4, g.wallTop + 2],
          [W / 2, 10],
          [W + 4, g.wallTop + 2],
        ],
        1.5,
      );
      const cols = [22, 62, 104, 144]
        .map((x) => `<path d="${wob(rect(x, g.wallTop + 24, 14, H - g.wallTop - 44), 0.6)}" fill="#f5f0e6" stroke="${OUT}" stroke-width="2.5"/>`)
        .join('');
      body = `<path d="${pd}" fill="${b.roof}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
        <circle cx="${W / 2}" cy="${g.wallTop - 18}" r="14" fill="#ffca28" stroke="${OUT}" stroke-width="3"/>
        <path d="M${W / 2 - 5} ${g.wallTop - 18} h10 M${W / 2} ${g.wallTop - 26} v16" stroke="${OUT}" stroke-width="2.5"/>
        <path d="${wallD}" fill="${b.wall}" stroke="${OUT}" stroke-width="3.5"/>
        ${shade(wallD, 4, g.wallTop, W - 8, H)}
        <path d="${wob(rect(0, g.wallTop + 6, W, 14), 0.8)}" fill="#ece3d0" stroke="${OUT}" stroke-width="3"/>
        ${cols}
        ${door(W / 2 - 22, H - 74, 44, 66, '#6d4c41')}
        <path d="${wob(rect(-4, H - 12, W + 8, 10), 0.6)}" fill="#d7ccc8" stroke="${OUT}" stroke-width="3"/>`;
      break;
    }
    case 'jewelry': {
      body = `<path d="${wob(rect(-4, g.wallTop - 34, W + 8, 40), 1.2)}" fill="${b.roof}" stroke="${OUT}" stroke-width="3.5"/>
        ${signBoard(W / 2, g.wallTop - 14, `<path d="M-10 -6 L-5 -11 L5 -11 L10 -6 L0 8Z" fill="#4fc3f7" stroke="${OUT}" stroke-width="2"/>`)}
        <path d="${wallD}" fill="${b.wall}" stroke="${OUT}" stroke-width="3.5"/>
        ${shade(wallD, 4, g.wallTop, W - 8, H)}
        ${awning(10, g.wallTop + 14, W - 20, b.trim)}
        <path d="${wob(rect(16, g.wallTop + 42, 74, 60), 1)}" fill="#bfe3f5" stroke="${OUT}" stroke-width="3" class="win"/>
        <path d="${wob(rect(16, g.wallTop + 42, 74, 60), 1)}" fill="#ffd970" stroke="${OUT}" stroke-width="3" class="win-lit"/>
        <path d="M22 ${g.wallTop + 92} h62" stroke="${OUT}" stroke-width="2.5"/>
        <circle cx="36" cy="${g.wallTop + 84}" r="6" fill="none" stroke="#ffca28" stroke-width="3"/>
        <path d="M52 ${g.wallTop + 80} l6 -6 l6 6 l-6 8Z" fill="#e57373" stroke="${OUT}" stroke-width="1.5"/>
        <path d="M70 ${g.wallTop + 78} l4 4 l-4 4 l-4 -4Z" fill="#fff" class="twinkle"/>
        ${door(W - 64, H - 70, 40, 62, '#4a2f5e')}`;
      break;
    }
  }
  const chim =
    g.chimney && !chimneyIsSpot
      ? `${chimneySvgInner(g.chimney.x - 24, g.chimney.top)}${smoke(g.chimney.x, g.chimney.top - 6)}`
      : '';
  return `<svg viewBox="-12 -40 ${W + 24} ${H + 40}" width="${W + 24}" height="${H + 40}">${chim}${body}</svg>`;
}

function chimneySvgInner(x: number, y: number): string {
  return `<g transform="translate(${x} ${y})">
    <path d="${wob(rect(4, 8, 40, 64), 1)}" fill="#b0614f" stroke="${OUT}" stroke-width="3"/>
    <path d="M4 26 H44 M4 44 H44 M22 8 V26 M14 26 V44 M32 44 V62" stroke="#7b3a32" stroke-width="2"/>
    <path d="${wob(rect(0, 0, 48, 12), 1)}" fill="#8d4339" stroke="${OUT}" stroke-width="3"/>
  </g>`;
}

/** Chimney used as a hiding spot (60 x 80). */
export function chimneySpotSvg(): string {
  return `<svg viewBox="0 0 60 80" width="60" height="80">
    <path d="${wob(rect(6, 10, 48, 70), 1)}" fill="#b0614f" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M6 30 H54 M6 50 H54 M28 10 V30 M18 30 V50 M40 50 V70" stroke="#7b3a32" stroke-width="2"/>
    <path d="${wob(rect(0, 0, 60, 14), 1)}" fill="#8d4339" stroke="${OUT}" stroke-width="3.5"/>
  </svg>`;
}

// ---------- Police station ----------

/** Police station with jail, 320 x 270. Cell windows are layered on top separately. */
export function stationSvg(): string {
  const W = 320;
  const wallD = wob(rect(10, 70, W - 20, 196), 1.8);
  const roofD = wob(
    [
      [0, 76],
      [40, 22],
      [W - 40, 22],
      [W, 76],
    ],
    2,
  );
  const stones = Array.from({ length: 22 }, () => {
    const x = 20 + rnd() * (W - 60);
    const y = 80 + rnd() * 170;
    return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} h${(14 + rnd() * 12).toFixed(0)}" stroke="${OUT}" stroke-width="2" opacity=".18" stroke-linecap="round"/>`;
  }).join('');
  return `<svg viewBox="0 0 ${W} 270" width="${W}" height="270">
    <path d="${roofD}" fill="#3b6fc4" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    ${tiles(roofD, 0, 22, W, 76, OUT)}
    <path d="${wob(rect(W / 2 - 14, 0, 28, 24), 1)}" fill="#e3f2fd" stroke="${OUT}" stroke-width="3"/>
    <path class="beacon" d="${wob(rect(W / 2 - 9, 4, 18, 16), 0.6)}" fill="#42a5f5"/>
    <path d="${wallD}" fill="#d9dde3" stroke="${OUT}" stroke-width="3.5"/>
    ${stones}
    ${shade(wallD, 10, 70, W - 20, 196)}
    <path d="${wob(rect(26, 92, W - 52, 98), 1.5)}" fill="#c3c9d2" stroke="${OUT}" stroke-width="3"/>
    <g transform="translate(${W / 2} 220)">
      <path d="M0 -26 L8 -9 L26 -8 L12 4 L16 22 L0 13 L-16 22 L-12 4 L-26 -8 L-8 -9Z" fill="#ffd54f" stroke="${OUT}" stroke-width="3" stroke-linejoin="round" transform="translate(-70 0) scale(.8)"/>
    </g>
    ${door(W / 2 - 26, 200, 52, 64, '#2f5aa8')}
    <path d="M${W / 2} 210 V262" stroke="${OUT}" stroke-width="2.5"/>
    ${window2(W - 74, 206, 40, 32)}
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

function pine(x: number, y: number, s: number, c: string): string {
  return `<g transform="translate(${x} ${y}) scale(${s})">
    <rect x="-4" y="-6" width="8" height="12" fill="#6d4c41"/>
    <path d="M0 -70 L18 -40 L10 -40 L24 -14 L14 -14 L28 6 L-28 6 L-14 -14 L-24 -14 L-10 -40 L-18 -40Z" fill="${c}" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>
  </g>`;
}

function farHouse(x: number, y: number, wall: string, roof: string): string {
  return `<g transform="translate(${x} ${y})"><path d="M-14 0 V-16 H14 V0Z" fill="${wall}" stroke="${OUT}" stroke-width="2"/>
    <path d="M-18 -14 L0 -30 L18 -14Z" fill="${roof}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>
    <rect x="-4" y="-10" width="7" height="7" fill="#bfe3f5" stroke="${OUT}" stroke-width="1.2"/></g>`;
}

/**
 * The static backdrop: hills, far village and windmill, the winding road and the
 * streets, sidewalks, playground sand and market paving. 1200 x 800.
 */
export function backdropSvg(): string {
  const hills = `
    <path d="M-40 300 Q120 170 300 236 Q430 150 600 214 Q760 140 900 210 Q1060 150 1240 220 L1240 340 L-40 340Z" fill="#a8d88a" stroke="${OUT}" stroke-width="2.5" opacity=".95"/>
    <path d="M-40 330 Q160 240 360 290 Q520 230 700 284 Q900 230 1240 290 L1240 400 L-40 400Z" fill="#8cc96b" stroke="${OUT}" stroke-width="2.5"/>`;
  const pines = [
    [40, 270, 0.9],
    [74, 262, 1.1],
    [110, 276, 0.8],
    [1130, 250, 1],
    [1166, 262, 0.85],
    [430, 232, 0.6],
    [452, 236, 0.7],
    [1010, 214, 0.55],
  ]
    .map(([x, y, s]) => pine(x, y, s, '#3f8a46'))
    .join('');
  const village = [
    farHouse(820, 228, '#fff3e0', '#e57373'),
    farHouse(852, 234, '#e3f2fd', '#7986cb'),
    farHouse(300, 246, '#fff9c4', '#ff8a65'),
    farHouse(330, 250, '#f8bbd0', '#8d6e63'),
  ].join('');
  const windmill = `<g transform="translate(960 230)">
    <path d="M-14 0 L-9 -46 L9 -46 L14 0Z" fill="#f5e6c8" stroke="${OUT}" stroke-width="2.5"/>
    <path d="M-11 -44 L0 -58 L11 -44Z" fill="#c0634f" stroke="${OUT}" stroke-width="2.5"/>
    <g class="blades" style="transform-origin:0px -42px">
      <path d="M0 -42 L-4 -82 L4 -82Z M0 -42 L40 -46 L40 -38Z M0 -42 L4 -2 L-4 -2Z M0 -42 L-40 -38 L-40 -46Z" fill="#fff8e1" stroke="${OUT}" stroke-width="2"/>
    </g>
    <circle cy="-42" r="4" fill="${OUT}"/></g>`;
  // Winding road from the far hills down between the buildings to the main street.
  const road = `
    <path d="M630 300 Q600 340 640 380 Q690 430 650 505 L560 505 Q610 430 600 390 Q580 340 622 300Z" fill="#7a7f8e" stroke="${OUT}" stroke-width="3"/>
    <path d="M626 312 Q612 345 632 372 M640 392 Q660 430 628 470" stroke="#fff" stroke-width="3" stroke-dasharray="8 10" fill="none" opacity=".8"/>`;
  const streetY = 505;
  const street = `
    <path d="${wob(rect(-40, 470, 1280, 35), 1)}" fill="#e8d8b8" stroke="${OUT}" stroke-width="3"/>
    ${Array.from({ length: 40 }, (_, i) => `<path d="M${-30 + i * 32} 472 v31" stroke="#c9b48c" stroke-width="2"/>`).join('')}
    <path d="${wob(rect(-40, streetY, 1280, 82), 1)}" fill="#7a7f8e" stroke="${OUT}" stroke-width="3"/>
    <path d="M-40 546 H1240" stroke="#fff" stroke-width="5" stroke-dasharray="34 26" opacity=".85"/>
    <path d="M-40 512 H1240" stroke="#5d6270" stroke-width="3" opacity=".5"/>
    <path d="${wob(rect(-40, 587, 1280, 28), 1)}" fill="#e8d8b8" stroke="${OUT}" stroke-width="3"/>
    ${Array.from({ length: 40 }, (_, i) => `<path d="M${-20 + i * 32} 589 v24" stroke="#c9b48c" stroke-width="2"/>`).join('')}`;
  const near = `
    <path d="M-40 615 H1240 V840 H-40Z" fill="#7cc35a"/>
    <path d="M20 650 Q200 618 390 650 Q420 730 380 800 L20 800Z" fill="#f1d9a6" stroke="${OUT}" stroke-width="3"/>
    <path d="M800 640 Q1000 618 1240 636 L1240 820 L780 820 Q760 720 800 640Z" fill="#dcc7a1" stroke="${OUT}" stroke-width="3"/>
    ${Array.from({ length: 30 }, (_, i) => {
      const x = 812 + (i % 6) * 70 + (Math.floor(i / 6) % 2) * 35;
      const y = 660 + Math.floor(i / 6) * 34;
      return `<path d="M${x} ${y} h46" stroke="#b9a37d" stroke-width="2" opacity=".7"/>`;
    }).join('')}
    <path d="M430 615 Q560 700 520 800 L610 800 Q640 700 520 615Z" fill="#e8d8b8" stroke="${OUT}" stroke-width="3"/>
    ${Array.from({ length: 26 }, () => {
      const x = 400 + rnd() * 400;
      const y = 640 + rnd() * 150;
      return `<path d="M${x.toFixed(0)} ${y.toFixed(0)} l3 -9 l3 9 l3 -7" stroke="#4e9f3d" stroke-width="2.5" fill="none" stroke-linecap="round"/>`;
    }).join('')}`;
  return `<svg viewBox="0 0 1200 800" width="1200" height="800" style="overflow:visible">
    ${hills}${village}${windmill}${pines}
    <path d="M-40 380 Q300 330 600 360 Q900 330 1240 370 L1240 480 L-40 480Z" fill="#9ed27c" stroke="${OUT}" stroke-width="2.5"/>
    ${road}${street}${near}
  </svg>`;
}
