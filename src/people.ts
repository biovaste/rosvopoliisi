// People drawn in SVG: rosvot, townspeople, the dog and the police officer.
// Looks (skin tone, hair, gender, body shape) are chosen independently and
// uniformly for everyone, so no look is tied to being a rosvo, a townsperson
// or the police. Everyone is built from the same parts (head, hair, limbs,
// hands, body, legs) in one soft "storybook" style.

import { OUT, cuffsSvg, type ItemKind } from './art';
import { tone, uid } from './draw';
import type { BuildingKind } from './buildings';

export const SKINS = ['#fde3cf', '#f2c4a0', '#dba67c', '#b87a4e', '#8c5636', '#5f3b26'];
const HAIR_COLORS = ['#1f1612', '#3b2417', '#6b3f1f', '#a9622a', '#d9a64a', '#8a8a8a'];
const BLUSH = '#f08a8a';
const SW = 3.5;

export type HairStyle = 'short' | 'spiky' | 'curly' | 'bald' | 'ponytail' | 'long' | 'buns' | 'bob' | 'braids';
const FEMALE_HAIR: HairStyle[] = ['ponytail', 'long', 'buns', 'bob', 'curly', 'braids'];
const MALE_HAIR: HairStyle[] = ['short', 'spiky', 'curly', 'bald', 'braids'];

export interface Look {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  female: boolean;
  mustache: boolean;
  /** Body width tweak (-4 slim .. +8 round). */
  build: number;
  /** Body height tweak (-8 short .. +8 tall). */
  height: number;
}

export const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function shuffle<T>(a: readonly T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export function randomLook(skin = pick(SKINS), female = Math.random() < 0.5): Look {
  return {
    skin,
    female,
    hair: pick(female ? FEMALE_HAIR : MALE_HAIR),
    hairColor: pick(HAIR_COLORS.slice(0, 5)),
    mustache: !female && Math.random() < 0.35,
    build: Math.round(Math.random() * 12 - 4),
    height: Math.round(Math.random() * 16 - 8),
  };
}

/** n looks with distinct skin tones and a mix of genders. */
export function randomLooks(n: number): Look[] {
  const skins = shuffle(SKINS);
  const genders = shuffle([true, false, Math.random() < 0.5, Math.random() < 0.5, true, false]);
  return Array.from({ length: n }, (_, i) => randomLook(skins[i % skins.length], genders[i % genders.length]));
}

// ---------- Drawing parts ----------

/** Collects gradient defs for one drawing and holds the shared part drawers. */
class Pen {
  private defs: string[] = [];

  /** A soft top-lit gradient fill for a base colour. */
  fill(base: string): string {
    const id = uid('pg');
    this.defs.push(
      `<linearGradient id="${id}" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${tone(base, 0.16)}"/><stop offset="1" stop-color="${tone(base, -0.12)}"/></linearGradient>`,
    );
    return `url(#${id})`;
  }
  /** The defs collected so far, emptied, ready to put in front of the drawing. */
  flush(): string {
    const d = this.defs.length ? `<defs>${this.defs.join('')}</defs>` : '';
    this.defs = [];
    return d;
  }
}

const out = (k = 1) => `stroke="${OUT}" stroke-width="${(SW * k).toFixed(1)}" stroke-linejoin="round"`;
const shade = (d: string, a = 0.1) => `<path d="${d}" fill="#000" opacity="${a}"/>`;
const shine = (d: string, w = 3) =>
  `<path d="${d}" fill="none" stroke="#fff" stroke-width="${w}" stroke-linecap="round" opacity=".45"/>`;
const blinkDelay = () => `style="animation-delay:${(Math.random() * 4).toFixed(2)}s"`;

/** A bendy arm: an outlined round-capped stroke, optionally striped. */
function limb(d: string, color: string, stripe?: string): string {
  let r = `<path d="${d}" fill="none" stroke="${OUT}" stroke-width="${10 + SW * 2}" stroke-linecap="round"/>
    <path d="${d}" fill="none" stroke="${color}" stroke-width="10" stroke-linecap="round"/>`;
  if (stripe) r += `<path d="${d}" fill="none" stroke="${stripe}" stroke-width="10" stroke-dasharray="5 7" stroke-dashoffset="-4"/>`;
  return r;
}

/** Mitten hand with a thumb at (x+tx, y+ty). */
function hand(p: Pen, x: number, y: number, tx: number, ty: number, skin: string): string {
  return `<ellipse cx="${x + tx}" cy="${y + ty}" rx="3.8" ry="4.6" fill="${skin}" ${out(0.75)}/>
    <ellipse cx="${x}" cy="${y}" rx="8" ry="8.5" fill="${p.fill(skin)}" ${out(0.85)}/>`;
}

/** Body outline with sloped shoulders. `k` widens it, a round body gets a belly. */
function torsoPath(k: number): string {
  const L = (x: number) => x - k;
  const R = (x: number) => x + k;
  const b = Math.max(0, k - 2) * 0.6;
  return `M${L(46)} 95 Q60 91 ${R(74)} 95 Q${R(87)} 97 ${R(91)} 107 Q${R(93)} 114 ${R(92)} 124 L${R(93 + b)} 150 Q${R(93)} 166 60 166 Q${L(27)} 166 ${L(27 - b)} 150 L${L(28)} 124 Q${L(27)} 114 ${L(29)} 107 Q${L(33)} 97 ${L(46)} 95Z`;
}

/** Body filled with `color` plus an optional pattern clipped to it, soft side shading and a rim light. */
function torso(p: Pen, k: number, color: string, pattern = ''): string {
  const d = torsoPath(k);
  const id = uid('tc');
  const R = (x: number) => x + k;
  return `<clipPath id="${id}"><path d="${d}"/></clipPath>
    <path d="${d}" fill="${p.fill(color)}"/>
    <g clip-path="url(#${id})">${pattern}
      <path d="M${R(70)} 92 Q${R(98)} 116 ${R(86)} 170 H120 V88Z" fill="#000" opacity=".06"/>
      <path d="M${R(76)} 92 Q${R(100)} 118 ${R(90)} 170 H120 V88Z" fill="#000" opacity=".07"/>
      <path d="M0 156 Q60 166 120 156 V172 H0Z" fill="#000" opacity=".08"/>
    </g>
    <path d="${d}" fill="none" ${out()}/>
    ${shine(`M${29 - k} 113 Q${29 - k} 103 ${40 - k} 98`)}
    <path d="M49 95 Q60 102 71 95" fill="none" stroke="${OUT}" stroke-width="2.5" stroke-linecap="round" opacity=".45"/>`;
}

/** Two legs (`.leg.l` / `.leg.r`, hinged at the top) with shoes, from y=top down to the feet. */
function legs(p: Pen, k: number, top: number, color: string, shoe = '#2a2230'): string {
  const lx = -k * 0.4;
  const leg = (x: number, s: number) =>
    `M${x + lx * s} ${top} H${x + 14 + lx * s} L${x + 13} 184 Q${x + 7} 187 ${x + 1} 184Z`;
  return `<g class="legs">
    <g class="leg l"><path d="${leg(41, 1)}" fill="${p.fill(color)}" ${out(0.85)}/>
      <path d="M33 192 Q32 181 44 181 H52 Q57 181 57 188 Q57 196 50 196 H37 Q33 196 33 192Z" fill="${shoe}" ${out(0.85)}/>
      ${shine('M37 186 Q40 183.5 46 183.5', 2)}</g>
    <g class="leg r"><path d="${leg(65, -1)}" fill="${p.fill(color)}" ${out(0.85)}/>
      <path d="M87 192 Q88 181 76 181 H68 Q63 181 63 188 Q63 196 70 196 H83 Q87 196 87 192Z" fill="${shoe}" ${out(0.85)}/>
      ${shine('M74 183.5 Q80 183.5 83 186', 2)}</g>
  </g>`;
}

const groundShadow = (k: number) => `<ellipse class="shadow" cx="60" cy="194" rx="${42 + k}" ry="8" fill="#000" opacity=".15"/>`;

/** Arms hanging at the sides, in front of the body. */
function armsDown(p: Pen, k: number, sleeve: string, skin: string, stripe?: string): string {
  return `${limb(`M${36 - k} 104 Q${27 - k} 120 ${29 - k} 139`, sleeve, stripe)}${hand(p, 29 - k, 146, 7, -3, skin)}
    ${limb(`M${84 + k} 104 Q${93 + k} 120 ${91 + k} 139`, sleeve, stripe)}${hand(p, 91 + k, 146, -7, -3, skin)}`;
}

/** A figure in a 120x200 box: shadow and legs stay on the ground, everything else rises by `t`. */
function figure(p: Pen, k: number, t: number, legsSvg: string, upper: string, cls = ''): string {
  return `<svg viewBox="0 0 120 200" width="120" height="200"${cls ? ` class="${cls}"` : ''}>${p.flush()}
    ${groundShadow(k)}${legsSvg}
    <g transform="translate(0 ${-t})">${upper}</g>
  </svg>`;
}

// ---------- Heads (head centre 60,58 in a 120-wide box) ----------

function hairBack(p: Pen, l: Look): string {
  const c = l.hairColor;
  const s = `fill="${p.fill(c)}" ${out()}`;
  switch (l.hair) {
    case 'long':
      return `<path d="M26 60 Q18 18 60 20 Q102 18 94 60 Q97 78 101 90 Q94 98 86 92 L34 92 Q26 98 19 90 Q23 78 26 60Z" ${s}/>
        <path d="M28 70 Q26 80 25 88 M92 70 Q94 80 95 88" fill="none" stroke="${tone(c, -0.3)}" stroke-width="2.5" stroke-linecap="round"/>`;
    case 'ponytail':
      return `<path d="M90 44 Q118 50 110 96 Q100 74 88 66Z" ${s}/>`;
    case 'buns':
      return `<circle cx="30" cy="30" r="14" ${s}/><circle cx="90" cy="30" r="14" ${s}/>`;
    case 'bob':
      return `<path d="M22 80 Q14 18 60 18 Q106 18 98 80 Q88 86 84 76 L36 76 Q32 86 22 80Z" ${s}/>`;
    case 'curly': {
      const pts = [[30, 40], [40, 24], [60, 18], [80, 24], [90, 40], [94, 58], [26, 58]];
      return `<g fill="${c}" ${out()}>${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="16"/>`).join('')}</g>
        <g fill="${c}">${pts.map(([x, y]) => `<circle cx="${x}" cy="${y}" r="${16 - SW / 2}"/>`).join('')}</g>`;
    }
    case 'braids':
      return `<path d="M30 60 Q24 84 30 104 M90 60 Q96 84 90 104" stroke="${OUT}" stroke-width="${7 + SW * 2}" stroke-linecap="round" fill="none"/>
        <path d="M30 60 Q24 84 30 104 M90 60 Q96 84 90 104" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-dasharray="7 3" fill="none"/>`;
    default:
      return '';
  }
}

function hairFront(p: Pen, l: Look): string {
  const s = `fill="${p.fill(l.hairColor)}" ${out()}`;
  const sh = shine('M40 34 Q48 29 56 29', 2.5);
  switch (l.hair) {
    case 'bald':
      return '';
    case 'spiky':
      return `<path d="M28 52 L30 30 L40 38 L46 20 L56 34 L64 16 L72 34 L82 22 L84 38 L92 32 L92 52 Q76 38 60 42 Q44 38 28 52Z" ${s}/>`;
    case 'curly':
      return `<path d="M28 50 Q30 26 60 26 Q90 26 92 50 Q86 40 78 44 Q72 36 64 42 Q58 34 50 42 Q42 36 36 46 Q32 42 28 50Z" ${s}/>`;
    case 'short':
      return `<path d="M28 52 Q30 22 60 24 Q90 22 92 52 Q80 36 60 40 Q40 36 28 52Z" ${s}/>${sh}`;
    case 'bob':
      return `<path d="M28 56 Q28 24 60 24 Q92 24 92 56 Q78 38 60 44 L56 36 Q44 42 28 56Z" ${s}/>${sh}`;
    default:
      return `<path d="M28 54 Q30 24 60 24 Q90 24 92 54 Q84 36 66 40 Q62 34 58 40 Q40 36 28 54Z" ${s}/>${sh}`;
  }
}

/** Gold hoop earrings, shown for female looks. */
const earrings = (l: Look) =>
  l.female
    ? [25, 95]
        .map(
          (x) =>
            `<circle cx="${x}" cy="73" r="3.6" fill="none" stroke="${OUT}" stroke-width="5"/><circle cx="${x}" cy="73" r="3.6" fill="none" stroke="#f2c14e" stroke-width="2.4"/>`,
        )
        .join('')
    : '';

/** Skull, ears, neck and hair. Face features are layered on top by the caller. */
function headBase(p: Pen, l: Look, face: string, hat = ''): string {
  const skin = l.skin;
  const inner = tone(skin, -0.28);
  return `${hairBack(p, l)}
    <ellipse cx="26" cy="61" rx="7" ry="8" fill="${skin}" ${out()}/><path d="M25 57 q4 4 0 8" fill="none" stroke="${inner}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="94" cy="61" rx="7" ry="8" fill="${skin}" ${out()}/><path d="M95 57 q-4 4 0 8" fill="none" stroke="${inner}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M52 80 H68 V95 Q60 99 52 95Z" fill="${skin}" ${out(0.85)}/>
    <path d="M52 82 H68 V88 Q60 92 52 88Z" fill="${tone(skin, -0.22)}" opacity=".6"/>
    <ellipse cx="60" cy="58" rx="34" ry="31" fill="${p.fill(skin)}" ${out()}/>
    ${shade('M88 44 Q98 74 70 88 Q84 82 90 66 Q92 54 88 44Z')}
    <ellipse cx="43" cy="42" rx="10" ry="6" fill="#fff" opacity=".28" transform="rotate(-25 43 42)"/>
    ${hairFront(p, l)}
    ${earrings(l)}
    ${face}
    ${hat}`;
}

/** Eyelashes at the outer top corner of eyes centred at xl and xr with radius r. */
function lashes(l: Look, xl: number, xr: number, cy: number, r: number): string {
  if (!l.female) return '';
  const n = Math.max(4, r * 0.75);
  const pair = (x: number, s: number) =>
    `M${x - s * r * 0.85} ${cy - r * 0.4} l${-s * n * 0.7} ${-n * 0.75} M${x - s * r * 0.5} ${cy - r * 0.8} l${-s * n * 0.45} ${-n * 0.85}`;
  return `<path d="${pair(xl, 1)} ${pair(xr, -1)}" stroke="${OUT}" stroke-width="${r > 6 ? 2.6 : 2}" stroke-linecap="round"/>`;
}

// ---------- Rosvo ----------

export interface Costume {
  look: Look;
  stripe: string;
  hat: 'beanie' | 'bowler' | 'cap' | 'none';
  hatColor: string;
  mask: string;
  sack: string;
}

const STRIPES = ['#2b2b3a', '#d6453d', '#2f6fd6', '#7a3fc4', '#1d8a5a', '#e07a1f'];
const HATS: Costume['hat'][] = ['beanie', 'bowler', 'cap', 'none'];
const HAT_COLORS = ['#2b2b3a', '#e0722c', '#3b8fd9', '#c43f7d', '#3a9b54', '#f2c14e'];
const MASKS = ['#2b2b3a', '#3b4bb3', '#8a2f8a', '#1f7a7a'];
const SACKS = ['#c9a36a', '#b9b9c9', '#d8b878'];

/** Three rosvo costumes for one cycle: distinct skins, mixed genders, varied clothes. */
export function randomCostumes(n: number): Costume[] {
  const looks = randomLooks(n);
  const stripes = shuffle(STRIPES);
  const hats = shuffle(HATS);
  return looks.map((look, i) => ({
    look,
    stripe: stripes[i],
    hat: hats[i % hats.length],
    hatColor: pick(HAT_COLORS),
    mask: pick(MASKS),
    sack: pick(SACKS),
  }));
}

function rosvoHat(p: Pen, c: Costume): string {
  const base = c.hatColor;
  const s = `fill="${p.fill(base)}" ${out()}`;
  const rib = tone(base, -0.28);
  switch (c.hat) {
    case 'beanie':
      return `<path d="M28 42 Q30 8 60 8 Q90 8 92 42Z" ${s}/>
        <path d="M45 13 Q42 26 42 38 M60 9 V38 M75 13 Q78 26 78 38" fill="none" stroke="${rib}" stroke-width="2" opacity=".7"/>
        ${shine('M38 22 Q44 14 52 12')}
        <rect x="25" y="35" width="70" height="13" rx="6.5" fill="${p.fill(tone(base, -0.08))}" ${out()}/>
        <path d="M33 38 v7 M41 38 v7 M49 38 v7 M57 38 v7 M65 38 v7 M73 38 v7 M81 38 v7 M89 38 v6" stroke="${rib}" stroke-width="2"/>
        <circle cx="60" cy="10" r="9" fill="#fff" ${out()}/><path d="M56 8 q2 -3 5 -2" fill="none" stroke="#cfd8dc" stroke-width="2"/>`;
    case 'bowler':
      return `<ellipse cx="60" cy="41" rx="42" ry="8" fill="${p.fill(tone(base, -0.1))}" ${out()}/>
        <path d="M34 41 Q32 8 60 8 Q88 8 86 41Z" ${s}/>
        <path d="M34.5 33 Q60 37 85.5 33 L86 40 Q60 44 34 40Z" fill="${tone(base, -0.4)}"/>
        ${shine('M42 22 Q45 13 54 11')}`;
    case 'cap':
      return `<path d="M28 42 Q30 10 60 10 Q90 10 92 42Z" ${s}/>
        <path d="M60 11 Q57 26 60 40" fill="none" stroke="${rib}" stroke-width="2"/>
        <path d="M86 39 Q108 34 113 45 Q100 48 86 46Z" fill="${p.fill(tone(base, -0.12))}" ${out()}/>
        <circle cx="60" cy="11" r="3.5" fill="${tone(base, -0.2)}" ${out(0.6)}/>
        ${shine('M38 26 Q42 17 50 15')}`;
    default:
      return '';
  }
}

function rosvoHeadParts(p: Pen, c: Costume): string {
  const l = c.look;
  const m = c.mask;
  const face = `
    <path d="M24 55 Q14 49 9 55 Q15 59 24 61Z" fill="${m}" ${out(0.75)}/>
    <path d="M23 52 Q60 36 97 52 L95 64 Q80 72 64 63 Q60 60 56 63 Q40 72 25 64 Z" fill="${m}" ${out()}/>
    ${shine('M31 50 Q44 43 56 44', 2.5)}
    <path d="M58 65 q4 5 -1 8" fill="none" stroke="${tone(l.skin, -0.35)}" stroke-width="2.5" stroke-linecap="round"/>
    <ellipse cx="34" cy="74" rx="6" ry="3.5" fill="${BLUSH}" opacity=".45"/>
    <ellipse cx="86" cy="74" rx="6" ry="3.5" fill="${BLUSH}" opacity=".45"/>
    <g class="eyes-sly"><g class="blink" ${blinkDelay()}>
      <ellipse cx="45" cy="56" rx="9" ry="8.5" fill="#fff" ${out(0.7)}/><ellipse cx="75" cy="56" rx="9" ry="8.5" fill="#fff" ${out(0.7)}/>
      <circle cx="48.5" cy="57.5" r="4.6" fill="${OUT}"/><circle cx="78.5" cy="57.5" r="4.6" fill="${OUT}"/>
      <circle cx="50" cy="55.5" r="1.8" fill="#fff"/><circle cx="80" cy="55.5" r="1.8" fill="#fff"/>
      <path d="M35 56 Q35 46 45 47 Q55 47 55 54 Q45 49.5 35 56Z" fill="${m}" ${out(0.6)}/>
      <path d="M85 56 Q85 46 75 47 Q65 47 65 54 Q75 49.5 85 56Z" fill="${m}" ${out(0.6)}/></g>
      <path d="M47 75 Q58 84 73 73" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M71 70 q4 1 3 5" fill="none" stroke="${OUT}" stroke-width="2.5" stroke-linecap="round"/>
    </g>
    <g class="eyes-sorry">
      <ellipse cx="45" cy="57" rx="9" ry="9" fill="#fff" ${out(0.7)}/><ellipse cx="75" cy="57" rx="9" ry="9" fill="#fff" ${out(0.7)}/>
      <circle cx="45" cy="60" r="5" fill="${OUT}"/><circle cx="75" cy="60" r="5" fill="${OUT}"/>
      <circle cx="47" cy="57.5" r="2" fill="#fff"/><circle cx="77" cy="57.5" r="2" fill="#fff"/>
      <circle cx="43.5" cy="62" r="1" fill="#fff"/><circle cx="73.5" cy="62" r="1" fill="#fff"/>
      <path d="M35 59 Q34 47 47 47.5 Z" fill="${m}"/><path d="M85 59 Q86 47 73 47.5 Z" fill="${m}"/>
      <path d="M49 81 Q54 76 60 80 Q66 76 71 81" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M32 67 q-4 8 0 10 q4 -2 0 -10" fill="#64b5f6" stroke="#3d8bd1" stroke-width="1"/>
      <ellipse cx="34" cy="75" rx="6.5" ry="4" fill="${BLUSH}" opacity=".7"/>
      <ellipse cx="86" cy="75" rx="6.5" ry="4" fill="${BLUSH}" opacity=".7"/>
    </g>
    ${l.female ? `<path d="M35 55 Q44 47.5 54 52.5 M65 52.5 Q76 47.5 85 55" fill="none" stroke="${OUT}" stroke-width="3.2" stroke-linecap="round"/>${lashes(l, 45, 75, 56, 9)}` : ''}
    ${l.mustache ? `<path d="M46 72 Q53 66 60 71 Q67 66 74 72 Q67 76 60 73 Q53 76 46 72Z" fill="${l.hairColor}" ${out(0.5)}/>` : ''}`;
  return `<g class="head">${headBase(p, l, face, rosvoHat(p, c))}</g>`;
}

/** Rosvo head, viewBox 0 0 120 100. Shows sly or sorry face via CSS classes. */
export function rosvoHead(c: Costume): string {
  const p = new Pen();
  const h = rosvoHeadParts(p, c);
  return p.flush() + h;
}

/** Full-body rosvo. viewBox 0 0 120 200. */
export function rosvoSvg(c: Costume): string {
  const p = new Pen();
  const l = c.look;
  const k = l.build;
  const t = l.height;
  const skin = l.skin;
  const stripes = [0, 1, 2, 3]
    .map((i) => {
      const y = 110 + i * 15;
      return `<path d="M0 ${y} Q60 ${y + 8} 120 ${y} V${y + 8} Q60 ${y + 16} 0 ${y + 8}Z" fill="${c.stripe}"/>`;
    })
    .join('');
  const upper = `${torso(p, k, '#ffffff', stripes)}
    <g class="arms-down">${armsDown(p, k, '#fff', skin, c.stripe)}</g>
    <g class="arms-up">
      ${limb(`M${36 - k} 104 Q${21 - k} 94 ${17 - k} 70`, '#fff', c.stripe)}${hand(p, 16 - k, 62, 7, 2, skin)}
      ${limb(`M${84 + k} 104 Q${99 + k} 94 ${103 + k} 70`, '#fff', c.stripe)}${hand(p, 104 + k, 62, -7, 2, skin)}
    </g>
    <g class="arms-cuffed">
      ${limb(`M${36 - k} 105 Q${36 - k} 124 46 131`, '#fff', c.stripe)}${hand(p, 50, 134, 0, -6, skin)}
      ${limb(`M${84 + k} 105 Q${84 + k} 124 74 131`, '#fff', c.stripe)}${hand(p, 70, 134, 0, -6, skin)}
      ${cuffsSvg()}
    </g>
    <g transform="translate(0 6)">${rosvoHeadParts(p, c)}</g>`;
  return figure(p, k, t, legs(p, k, 154 - t, '#3d3d52'), upper, 'rosvo-svg');
}

export function sackSvg(c: Costume): string {
  const p = new Pen();
  const f = p.fill(c.sack);
  return `<svg viewBox="0 0 80 80" width="80" height="80">${p.flush()}
    <path d="M16 36 Q10 74 40 76 Q70 74 64 36 Q52 26 40 30 Q28 26 16 36Z" fill="${f}" ${out(1.15)}/>
    ${shade('M50 34 Q66 44 62 64 Q56 74 44 75 Q60 62 50 34Z', 0.12)}
    <path d="M30 28 L40 16 L50 28" fill="${f}" ${out(1.15)}/>
    <path d="M28 30 Q40 36 52 30" fill="none" ${out(1.15)}/>
    <path d="M32 52 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M40 44 v16" fill="none" stroke="${OUT}" stroke-width="3" opacity=".5"/>
    ${shine('M22 46 Q22 38 28 35')}
  </svg>`;
}

// ---------- Townspeople ----------

export type Role = 'baker' | 'kid' | 'kid2' | 'elder' | 'dog' | 'cat' | 'vendor' | 'jeweler' | 'banker' | 'fancy' | 'postie' | 'gardener' | 'worker';
export const ROLES: Role[] = ['baker', 'kid', 'kid2', 'elder', 'dog', 'cat', 'vendor', 'jeweler', 'banker', 'fancy', 'postie', 'gardener', 'worker'];

/** Roles that always appear at the door of their own building. Others stand anywhere. */
export const ROLE_HOME: Partial<Record<Role, BuildingKind>> = {
  baker: 'bakery',
  banker: 'bank',
  jeweler: 'jewelry',
  elder: 'home',
};

export const ROLE_ITEM: Record<Role, ItemKind> = {
  baker: 'cake',
  kid: 'ball',
  kid2: 'teddy',
  elder: 'flowers',
  dog: 'bone',
  vendor: 'icecream',
  jeweler: 'gem',
  banker: 'gold',
  fancy: 'jewels',
  postie: 'parcel',
  gardener: 'watering',
  cat: 'yarn',
  worker: 'toolbox',
};

/** Shiny oval eyes at (cx-9, cx+9): open (blinking), or a worried look. */
function eyes(cx: number, cy: number, worried = false): string {
  const dy = worried ? 1 : 0;
  return [cx - 9, cx + 9]
    .map(
      (x) =>
        `<ellipse cx="${x}" cy="${cy + dy}" rx="3.8" ry="4.8" fill="${OUT}"/><circle cx="${x + 1.3}" cy="${cy - 1.6 + dy}" r="1.5" fill="#fff"/>`,
    )
    .join('');
}

/** Calm, happy and sad faces; CSS shows one. The nose is shared. */
function faces(cx: number, cy: number, skin?: string): string {
  const nose = skin
    ? `<path d="M${cx - 1} ${cy + 3} q4 4 -1 6" fill="none" stroke="${tone(skin, -0.35)}" stroke-width="2.5" stroke-linecap="round"/>`
    : '';
  return `${nose}<g class="face-happy">
      <path d="M${cx - 13} ${cy - 1} q4 -6 8 0 M${cx + 5} ${cy - 1} q4 -6 8 0" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx - 12} ${cy + 10} Q${cx} ${cy + 24} ${cx + 12} ${cy + 10} Z" fill="#c2185b" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
      <path d="M${cx - 5} ${cy + 17} Q${cx} ${cy + 13} ${cx + 5} ${cy + 17}" fill="#f48fb1"/>
    </g>
    <g class="face-calm">
      <g class="blink" ${blinkDelay()}>${eyes(cx, cy - 1)}</g>
      <path d="M${cx - 8} ${cy + 12} Q${cx} ${cy + 18} ${cx + 8} ${cy + 12}" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <g class="face-sad">
      ${eyes(cx, cy - 1, true)}
      <path d="M${cx - 16} ${cy - 8} L${cx - 6} ${cy - 12} M${cx + 16} ${cy - 8} L${cx + 6} ${cy - 12}" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx - 8} ${cy + 16} Q${cx} ${cy + 9} ${cx + 8} ${cy + 16}" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx - 13} ${cy + 4} q-4 8 0 10 q4 -2 0 -10" fill="#64b5f6" stroke="#3d8bd1" stroke-width="1"/>
    </g>
    <ellipse cx="${cx - 20}" cy="${cy + 10}" rx="6" ry="3.5" fill="${BLUSH}" opacity=".45"/>
    <ellipse cx="${cx + 20}" cy="${cy + 10}" rx="6" ry="3.5" fill="${BLUSH}" opacity=".45"/>`;
}

interface Outfit {
  shirt: string;
  legs: string;
  shoe?: string;
  hat?: string;
  /** Drawn on the body. */
  extra?: string;
  /** Drawn on the face (glasses). */
  face?: string;
  /** Overrides for the look (e.g. grey hair for elders). */
  hairColor?: string;
  /** Children are short and slim. */
  child?: boolean;
}

function outfit(p: Pen, role: Role): Outfit {
  const s = (c: string, k = 1) => `fill="${p.fill(c)}" ${out(k)}`;
  switch (role) {
    case 'baker':
      return {
        shirt: '#ffffff',
        legs: '#5d6d7e',
        hat: `<path d="M34 34 Q24 10 44 12 Q50 -2 64 8 Q80 0 84 14 Q98 14 88 34 Z" ${s('#ffffff')}/>
          <path d="M48 14 Q50 24 48 30 M66 10 Q68 22 66 30" fill="none" stroke="#cfd8dc" stroke-width="2.5" stroke-linecap="round"/>
          <rect x="33" y="28" width="54" height="11" rx="3" ${s('#f5f5f5')}/>`,
        extra: `<path d="M40 118 Q60 114 80 118 L82 152 Q60 160 38 152Z" ${s('#f5f5f5', 0.85)}/>
          <path d="M48 128 H72" stroke="#cfd8dc" stroke-width="2.5" stroke-linecap="round"/>`,
      };
    case 'kid':
      return {
        shirt: '#43a047',
        legs: '#1e88e5',
        child: true,
        hat: `<path d="M28 42 Q30 14 60 14 Q90 14 92 42Z" ${s('#e53935')}/>
          <path d="M34 39 Q14 36 8 44 Q20 47 34 45Z" ${s('#c62828')}/>
          ${shine('M40 28 Q44 20 52 18')}`,
      };
    case 'kid2':
      return {
        shirt: '#f06292',
        legs: '#ffd54f',
        child: true,
        extra: `<circle cx="60" cy="122" r="7" ${s('#fff59d', 0.7)}/><circle cx="60" cy="122" r="2.5" fill="#f9a825"/>`,
      };
    case 'elder':
      return {
        shirt: '#9575cd',
        legs: '#7e57c2',
        shoe: '#5d4037',
        hairColor: '#d9d9d9',
        face: `<circle cx="51" cy="58" r="10" fill="#fff" fill-opacity=".15" stroke="${OUT}" stroke-width="2.5"/><circle cx="69" cy="58" r="10" fill="#fff" fill-opacity=".15" stroke="${OUT}" stroke-width="2.5"/><path d="M61 58 h-2 M41 56 L28 54 M79 56 L92 54" stroke="${OUT}" stroke-width="2.5"/>`,
        extra: `${[0, 1, 2].map((i) => `<circle cx="60" cy="${110 + i * 14}" r="2.6" fill="#ede7f6" stroke="${OUT}" stroke-width="1.5"/>`).join('')}`,
      };
    case 'vendor':
      return {
        shirt: '#ffb74d',
        legs: '#455a64',
        hat: `<path d="M28 40 Q30 14 60 14 Q90 14 92 40Z" ${s('#ffffff')}/><rect x="26" y="33" width="68" height="9" rx="3" ${s('#f06292', 0.85)}/>`,
        extra: `<path d="M40 118 Q60 114 80 118 L82 150 Q60 158 38 150Z" ${s('#f8bbd0', 0.85)}/>
          <path d="M38 126 Q60 132 82 126 M38 138 Q60 144 82 138" fill="none" stroke="#fff" stroke-width="3" opacity=".8"/>`,
      };
    case 'jeweler':
      return {
        shirt: '#26a69a',
        legs: '#37474f',
        extra: `<path d="M50 95 L60 107 L70 95" fill="#fff" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/><circle cx="60" cy="114" r="4.5" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/>`,
        face: `<circle cx="69" cy="58" r="8" fill="#b3e5fc" fill-opacity=".35" stroke="${OUT}" stroke-width="2.5"/><path d="M77 58 L92 56" stroke="${OUT}" stroke-width="2"/>`,
      };
    case 'banker':
      return {
        shirt: '#34495e',
        legs: '#2c3e50',
        extra: `<path d="M47 94 L60 106 L73 94 L66 132 L54 132Z" fill="#fff"/><path d="M57 102 L63 102 L66 126 L60 132 L54 126Z" fill="#e53935" stroke="${OUT}" stroke-width="2"/>
          <path d="M47 94 L56 118 M73 94 L64 118" stroke="${OUT}" stroke-width="2.5" opacity=".6"/>`,
      };
    case 'fancy':
      return {
        shirt: '#ab47bc',
        legs: '#6a1b9a',
        extra: `${[44, 52, 60, 68, 76].map((x, i) => `<circle cx="${x}" cy="${100 + (i === 2 ? 6 : i % 2 ? 4 : 0)}" r="4" fill="#fff" stroke="${OUT}" stroke-width="1.5"/>`).join('')}`,
      };
    case 'postie':
      return {
        shirt: '#ff6b1a',
        legs: '#1e3a5f',
        hat: `<path d="M28 40 Q30 12 60 12 Q90 12 92 40Z" ${s('#1e3a5f')}/>
          <path d="M86 37 Q108 32 112 43 Q100 46 86 44Z" ${s('#16304f')}/>${shine('M40 26 Q44 18 52 16')}
          <circle cx="60" cy="24" r="5" fill="#ff6b1a" ${out(0.6)}/>`,
        // Mail bag on a strap, with a letter peeking out.
        extra: `<path d="M34 98 L88 150" stroke="${OUT}" stroke-width="9" stroke-linecap="round"/><path d="M34 98 L88 150" stroke="#8d6e63" stroke-width="5" stroke-linecap="round"/>
          <path d="M74 140 h18 v10 h-18Z" fill="#fff" ${out(0.6)} transform="rotate(-8 83 145)"/>
          <path d="M70 144 h36 v26 q-18 6 -36 0Z" ${s('#1e3a5f')}/>
          <path d="M70 152 q18 8 36 0" fill="none" stroke="${OUT}" stroke-width="2.5"/>`,
      };
    case 'gardener':
      return {
        shirt: '#7cb342',
        legs: '#5d4037',
        shoe: '#4e342e',
        hat: `<ellipse cx="60" cy="36" rx="45" ry="9" ${s('#f3d27a')}/><path d="M36 36 Q38 12 60 12 Q82 12 84 36Z" ${s('#f3d27a')}/>
          <path d="M36.5 30 Q60 34 83.5 30 L84 35 Q60 39 36 35Z" fill="#7cb342"/>`,
        extra: `<path d="M38 112 Q60 108 82 112 V156 Q60 162 38 156Z" ${s('#a1887f', 0.85)}/>
          <rect x="52" y="128" width="16" height="12" rx="2" fill="#8d6e63" stroke="${OUT}" stroke-width="2"/>`,
      };
    case 'worker':
      return {
        shirt: '#ff9800',
        legs: '#3e4f63',
        hat: `<path d="M24 38 Q26 6 60 6 Q94 6 96 38Z" fill="#ffd600" stroke="${OUT}" stroke-width="4"/>
          <rect x="18" y="34" width="84" height="9" rx="4" fill="#ffd600" stroke="${OUT}" stroke-width="3.5"/>
          <path d="M60 8 V34" stroke="${OUT}" stroke-width="2.5" opacity=".4"/><path d="M36 22 Q42 12 52 10" stroke="#fff" stroke-width="3" fill="none" opacity=".6"/>`,
        // High-visibility vest stripes.
        extra: `<path d="M30 120 H90 M30 134 H90" stroke="#e0e0e0" stroke-width="6"/><path d="M30 120 H90 M30 134 H90" stroke="${OUT}" stroke-width="1" opacity=".3"/>
          <path d="M46 94 V156 M74 94 V156" stroke="#e0e0e0" stroke-width="5"/>`,
      };
    case 'dog':
    case 'cat':
      return { shirt: '', legs: '' };
  }
}

export function ownerSvg(role: Role, look: Look): string {
  if (role === 'dog') return dogSvg();
  if (role === 'cat') return catSvg();
  const p = new Pen();
  const o = outfit(p, role);
  const l: Look = o.hairColor ? { ...look, hairColor: o.hairColor } : look;
  const k = o.child ? -3 : l.build;
  const t = o.child ? -14 : l.height;
  const face = `${faces(60, 60, l.skin)}${lashes(l, 51, 69, 59, 4.4)}${l.mustache && !o.child ? `<path d="M48 70 Q54 65 60 69 Q66 65 72 70 Q66 74 60 71 Q54 74 48 70Z" fill="${l.hairColor}" ${out(0.5)}/>` : ''}${o.face ?? ''}`;
  const upper = `${torso(p, k, o.shirt)}
    ${o.extra ?? ''}
    <g class="arms">${armsDown(p, k, o.shirt, l.skin)}</g>
    <g class="head" style="animation-delay:-${(Math.random() * 6).toFixed(1)}s" transform="translate(0 6)">${headBase(p, l, face, o.hat ?? '')}</g>`;
  return figure(p, k, t, legs(p, k, 154 - t, o.legs, o.shoe), upper);
}

const CAT_FUR = ['#f2a65a', '#9e9e9e', '#4a4a4a', '#e8d9c4'];

function catSvg(): string {
  const fur = pick(CAT_FUR);
  const dark = tone(fur, -0.25);
  const stripes = fur === '#f2a65a' || fur === '#9e9e9e';
  return `<svg viewBox="0 0 120 200" width="120" height="200">
    <ellipse class="shadow" cx="60" cy="194" rx="40" ry="7" fill="#000" opacity=".18"/>
    <path class="tail" d="M84 182 Q118 176 112 140 Q108 120 98 126" fill="none" stroke="${OUT}" stroke-width="13" stroke-linecap="round"/>
    <path class="tail" d="M84 182 Q118 176 112 140 Q108 120 98 126" fill="none" stroke="${fur}" stroke-width="7" stroke-linecap="round"/>
    <path d="M30 192 Q24 130 60 124 Q96 130 90 192Z" fill="${fur}" stroke="${OUT}" stroke-width="4"/>
    ${stripes ? `<path d="M40 150 q8 4 14 0 M66 150 q8 4 14 0 M38 168 q8 4 14 0 M68 168 q8 4 14 0" stroke="${dark}" stroke-width="4" fill="none" stroke-linecap="round"/>` : ''}
    <ellipse cx="60" cy="168" rx="14" ry="20" fill="#fff" opacity=".55"/>
    <ellipse cx="46" cy="190" rx="10" ry="6" fill="${fur}" stroke="${OUT}" stroke-width="3"/><ellipse cx="74" cy="190" rx="10" ry="6" fill="${fur}" stroke="${OUT}" stroke-width="3"/>
    <path d="M30 96 L34 58 L54 80Z M90 96 L86 58 L66 80Z" fill="${fur}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M36 88 L37 68 L48 80Z M84 88 L83 68 L72 80Z" fill="#f8bbd0"/>
    <ellipse cx="60" cy="100" rx="32" ry="28" fill="${fur}" stroke="${OUT}" stroke-width="4"/>
    ${stripes ? `<path d="M52 74 l2 10 M60 72 v10 M68 74 l-2 10" stroke="${dark}" stroke-width="3.5" stroke-linecap="round"/>` : ''}
    <path d="M56 106 h8 l-4 5Z" fill="#f48fb1" stroke="${OUT}" stroke-width="1.5"/>
    <path d="M30 104 h18 M30 112 l18 -3 M90 104 h-18 M90 112 l-18 -3" stroke="${OUT}" stroke-width="1.6" opacity=".6"/>
    <rect x="40" y="124" width="40" height="7" rx="3.5" fill="#42a5f5" stroke="${OUT}" stroke-width="2"/>
    ${faces(60, 98)}
  </svg>`;
}

function dogSvg(): string {
  const p = new Pen();
  const fur = '#d7a86e';
  const ear = '#8d6e63';
  const f = p.fill(fur);
  const legPath = (x: number) => `<path d="M${x} 150 H${x + 14} L${x + 13} 186 Q${x + 7} 190 ${x + 1} 186Z" fill="${f}" ${out(0.85)}/>
    <ellipse cx="${x + 7}" cy="188" rx="9" ry="5" fill="${tone(fur, 0.25)}" ${out(0.85)}/>`;
  const body = `
    ${groundShadow(4)}
    ${legPath(30)}${legPath(76)}
    <path class="tail" d="M92 130 Q116 110 108 92" fill="none" stroke="${OUT}" stroke-width="${8 + SW * 2}" stroke-linecap="round"/>
    <path class="tail" d="M92 130 Q116 110 108 92" fill="none" stroke="${fur}" stroke-width="8" stroke-linecap="round"/>
    <ellipse cx="60" cy="140" rx="38" ry="28" fill="${f}" ${out()}/>
    ${shade('M78 116 Q102 134 90 160 Q76 170 60 168 Q88 150 78 116Z')}
    <ellipse cx="58" cy="146" rx="20" ry="14" fill="#f3e0c4" opacity=".8"/>
    ${shine('M30 132 Q32 120 44 115')}
    <ellipse cx="60" cy="84" rx="33" ry="30" fill="${f}" ${out()}/>
    ${shade('M84 66 Q96 90 74 110 Q90 92 84 66Z')}
    <ellipse cx="44" cy="68" rx="9" ry="6" fill="#fff" opacity=".28" transform="rotate(-25 44 68)"/>
    <ellipse cx="27" cy="82" rx="10" ry="22" fill="${p.fill(ear)}" ${out()} transform="rotate(15 27 82)"/>
    <ellipse cx="93" cy="82" rx="10" ry="22" fill="${p.fill(ear)}" ${out()} transform="rotate(-15 93 82)"/>
    <ellipse cx="74" cy="72" rx="9" ry="8" fill="${tone(fur, -0.25)}" opacity=".6"/>
    <ellipse cx="60" cy="99" rx="15" ry="11" fill="#f3e0c4"/>
    <ellipse cx="60" cy="93" rx="7.5" ry="5.5" fill="${OUT}"/><ellipse cx="58" cy="91.5" rx="2.5" ry="1.5" fill="#fff" opacity=".6"/>
    <rect x="35" y="111" width="50" height="9" rx="4.5" fill="${p.fill('#e53935')}" ${out(0.7)}/>
    <circle cx="60" cy="124" r="5" fill="#ffd54f" ${out(0.6)}/>
    ${faces(60, 76)}`;
  return `<svg viewBox="0 0 120 200" width="120" height="200">${p.flush()}${body}</svg>`;
}

// ---------- Police ----------

function policeCap(p: Pen): string {
  return `<path d="M26 38 Q28 6 60 8 Q92 6 94 38Z" fill="${p.fill('#2f5aa8')}" ${out()}/>
    ${shine('M38 24 Q42 14 52 12')}
    <rect x="23" y="33" width="74" height="11" rx="4" fill="${p.fill('#1f3f7a')}" ${out()}/>
    <path d="M30 44 Q60 52 90 44" fill="#16305e" ${out(0.8)}/>
    <path d="M60 14 l4 8 h8 l-6 5 l2 8 l-8 -5 l-8 5 l2 -8 l-6 -5 h8Z" fill="#ffd54f" stroke="${OUT}" stroke-width="1.5" stroke-linejoin="round"/>`;
}

function policeFace(l: Look): string {
  return `<g class="blink" ${blinkDelay()}>${eyes(60, 57)}</g>
    <path d="M59 62 q4 4 -1 6" fill="none" stroke="${tone(l.skin, -0.35)}" stroke-width="2.5" stroke-linecap="round"/>
    <path d="M48 71 Q60 81 72 71" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
    ${lashes(l, 51, 69, 57, 4.4)}
    ${l.mustache ? `<path d="M48 69 Q54 64 60 68 Q66 64 72 69 Q66 73 60 70 Q54 73 48 69Z" fill="${l.hairColor}" ${out(0.5)}/>` : ''}
    <ellipse cx="40" cy="69" rx="6" ry="3.5" fill="${BLUSH}" opacity=".45"/><ellipse cx="80" cy="69" rx="6" ry="3.5" fill="${BLUSH}" opacity=".45"/>`;
}

/** Police officer's head for the car's front window. viewBox 0 0 120 100. */
export function policeHead(l: Look): string {
  const p = new Pen();
  const h = headBase(p, l, policeFace(l), policeCap(p));
  return p.flush() + h;
}

/** Full-body police officer. viewBox 0 0 120 200. `.escorting` shows the arm that holds the rosvo. */
export function officerSvg(l: Look): string {
  const p = new Pen();
  const k = l.build;
  const t = l.height;
  const blue = '#3d6fc4';
  const skin = l.skin;
  const upper = `${torso(p, k, blue)}
    <path d="M60 96 V160" stroke="${OUT}" stroke-width="2" opacity=".35"/>
    ${[112, 128].map((y) => `<circle cx="60" cy="${y}" r="2.2" fill="#ffd54f" stroke="${OUT}" stroke-width="1.2"/>`).join('')}
    <path d="M${40 - k} 112 h14 v10 h-14Z M${66 + k} 112 h14 v10 h-14Z" fill="${tone(blue, -0.12)}" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>
    <path d="M${28 - k} 142 Q60 150 ${92 + k} 142 V151 Q60 159 ${28 - k} 151Z" fill="#1f2f4f" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>
    <rect x="54" y="143" width="12" height="10" rx="2" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/>
    <path d="M60 14 l4 8 h8 l-6 5 l2 8 l-8 -5 l-8 5 l2 -8 l-6 -5 h8Z" fill="#ffd54f" stroke="${OUT}" stroke-width="2" stroke-linejoin="round" transform="translate(${47 - k} 98) scale(.6) translate(-60 -24)"/>
    <rect x="${72 + k}" y="102" width="9" height="13" rx="2" fill="#263238" stroke="${OUT}" stroke-width="1.8"/><path d="M${78 + k} 102 v-5" stroke="${OUT}" stroke-width="2" stroke-linecap="round"/>
    ${limb(`M${36 - k} 104 Q${27 - k} 120 ${29 - k} 139`, blue)}${hand(p, 29 - k, 146, 7, -3, skin)}
    <g class="arm-rest">${limb(`M${84 + k} 104 Q${93 + k} 120 ${91 + k} 139`, blue)}${hand(p, 91 + k, 146, -7, -3, skin)}</g>
    <g class="arm-escort">${limb(`M${84 + k} 104 Q${108 + k} 112 130 ${118 + t}`, blue)}${hand(p, 136, 120 + t, -4, -7, skin)}</g>
    <g transform="translate(0 6)">${headBase(p, l, policeFace(l), policeCap(p))}</g>`;
  return figure(p, k, t, legs(p, k, 154 - t, '#1f2f4f'), upper);
}

// ---------- Firefighter ----------

function fireHelmet(p: Pen): string {
  return `<path d="M22 44 Q22 4 60 4 Q98 4 98 44Z" fill="${p.fill('#d8322a')}" ${out()}/>
    <path d="M60 6 V42" stroke="${tone('#d8322a', -0.3)}" stroke-width="5"/>
    ${shine('M34 26 Q38 14 50 10')}
    <path d="M14 42 Q60 34 106 42 Q108 50 100 50 Q60 44 20 50 Q12 50 14 42Z" fill="${p.fill('#b3241d')}" ${out()}/>
    <path d="M52 14 h16 v14 l-8 6 l-8 -6Z" fill="#ffd54f" stroke="${OUT}" stroke-width="2" stroke-linejoin="round"/>`;
}

/** Firefighter's head for the truck's cab window. viewBox 0 0 120 100. */
export function firefighterHead(l: Look): string {
  const p = new Pen();
  const h = headBase(p, l, policeFace(l), fireHelmet(p));
  return p.flush() + h;
}

/** Full-body firefighter. viewBox 0 0 120 200. `.hose` shows the arms holding the nozzle forward. */
export function firefighterSvg(l: Look): string {
  const p = new Pen();
  const k = l.build;
  const t = l.height;
  const coat = '#2c3e66';
  const lime = '#e6f04a';
  const glove = '#3a2c2a';
  const stripes = `<path d="M${28 - k} 132 H${92 + k} M${28 - k} 146 H${92 + k}" stroke="${lime}" stroke-width="7"/>
    <path d="M${28 - k} 132 H${92 + k} M${28 - k} 146 H${92 + k}" stroke="#bfc4c9" stroke-width="2.5"/>`;
  const upper = `${torso(p, k, coat, stripes)}
    <path d="M60 96 V164" stroke="${OUT}" stroke-width="2.5" opacity=".45"/>
    ${[110, 122].map((y) => `<rect x="56" y="${y}" width="8" height="5" rx="1.5" fill="#bfc4c9" stroke="${OUT}" stroke-width="1.2"/>`).join('')}
    <g class="arm-rest">${limb(`M${36 - k} 104 Q${27 - k} 120 ${29 - k} 139`, coat, undefined)}${hand(p, 29 - k, 146, 7, -3, glove)}
      ${limb(`M${84 + k} 104 Q${93 + k} 120 ${91 + k} 139`, coat)}${hand(p, 91 + k, 146, -7, -3, glove)}</g>
    <g class="arm-hose">
      <path d="M94 124 L126 108" stroke="${OUT}" stroke-width="14" stroke-linecap="round"/>
      <path d="M94 124 L126 108" stroke="#8d939a" stroke-width="8" stroke-linecap="round"/>
      <path d="M118 112 L134 104" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/>
      <path d="M118 112 L134 104" stroke="#ffca28" stroke-width="5" stroke-linecap="round"/>
      ${limb(`M${36 - k} 104 Q${60} 132 ${92} 124`, coat)}${hand(p, 96, 122, -4, -6, glove)}
      ${limb(`M${84 + k} 104 Q${104} 118 ${112} 114`, coat)}${hand(p, 114, 113, -4, -6, glove)}
    </g>
    <g transform="translate(0 6)">${headBase(p, l, policeFace(l), fireHelmet(p))}</g>`;
  return figure(p, k, t, legs(p, k, 154 - t, coat, '#1b1b1b'), upper);
}
