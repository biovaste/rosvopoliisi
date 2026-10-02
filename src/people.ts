// People drawn in SVG: rosvot, townspeople and the police driver.
// Looks (skin tone, hair, gender) are chosen independently and uniformly for
// everyone, so no look is tied to being a rosvo, a townsperson or the police.

import { OUT, cuffsSvg, type ItemKind } from './art';
import type { BuildingKind } from './buildings';

export const SKINS = ['#fde3cf', '#f2c4a0', '#dba67c', '#b87a4e', '#8c5636', '#5f3b26'];
const HAIR_COLORS = ['#1f1612', '#3b2417', '#6b3f1f', '#a9622a', '#d9a64a', '#8a8a8a'];
const BLUSH = '#f08a8a';

export type HairStyle = 'short' | 'spiky' | 'curly' | 'bald' | 'ponytail' | 'long' | 'buns' | 'bob' | 'braids';
const FEMALE_HAIR: HairStyle[] = ['ponytail', 'long', 'buns', 'bob', 'curly', 'braids'];
const MALE_HAIR: HairStyle[] = ['short', 'spiky', 'curly', 'bald', 'braids'];

export interface Look {
  skin: string;
  hair: HairStyle;
  hairColor: string;
  female: boolean;
  mustache: boolean;
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
  };
}

/** n looks with distinct skin tones and a mix of genders. */
export function randomLooks(n: number): Look[] {
  const skins = shuffle(SKINS);
  const genders = shuffle([true, false, Math.random() < 0.5, Math.random() < 0.5, true, false]);
  return Array.from({ length: n }, (_, i) => randomLook(skins[i % skins.length], genders[i % genders.length]));
}

// ---------- Heads (head centre 60,58 in a 120-wide box) ----------

function hairBack(l: Look): string {
  const c = l.hairColor;
  const s = `fill="${c}" stroke="${OUT}" stroke-width="4"`;
  switch (l.hair) {
    case 'long':
      return `<path d="M26 60 Q18 18 60 20 Q102 18 94 60 L100 104 Q60 114 20 104Z" ${s}/>`;
    case 'ponytail':
      return `<path d="M90 44 Q118 50 110 96 Q100 74 88 66Z" ${s}/>`;
    case 'buns':
      return `<circle cx="30" cy="30" r="14" ${s}/><circle cx="90" cy="30" r="14" ${s}/>`;
    case 'bob':
      return `<path d="M22 80 Q14 18 60 18 Q106 18 98 80 Q88 86 84 76 L36 76 Q32 86 22 80Z" ${s}/>`;
    case 'curly':
      return `<g ${s}>${[
        [30, 40],
        [40, 24],
        [60, 18],
        [80, 24],
        [90, 40],
        [94, 58],
        [26, 58],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="17"/>`)
        .join('')}</g><g fill="${c}">${[
        [30, 40],
        [40, 24],
        [60, 18],
        [80, 24],
        [90, 40],
        [94, 58],
        [26, 58],
      ]
        .map(([x, y]) => `<circle cx="${x}" cy="${y}" r="15"/>`)
        .join('')}</g>`;
    case 'braids':
      return `<path d="M30 60 Q24 84 30 104 M90 60 Q96 84 90 104" stroke="${OUT}" stroke-width="13" stroke-linecap="round" fill="none"/>
        <path d="M30 60 Q24 84 30 104 M90 60 Q96 84 90 104" stroke="${c}" stroke-width="7" stroke-linecap="round" stroke-dasharray="7 3" fill="none"/>`;
    default:
      return '';
  }
}

function hairFront(l: Look): string {
  const c = l.hairColor;
  const s = `fill="${c}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"`;
  switch (l.hair) {
    case 'bald':
      return '';
    case 'spiky':
      return `<path d="M28 52 L30 30 L40 38 L46 20 L56 34 L64 16 L72 34 L82 22 L84 38 L92 32 L92 52 Q76 38 60 42 Q44 38 28 52Z" ${s}/>`;
    case 'curly':
      return `<path d="M28 50 Q30 26 60 26 Q90 26 92 50 Q86 40 78 44 Q72 36 64 42 Q58 34 50 42 Q42 36 36 46 Q32 42 28 50Z" ${s}/>`;
    case 'short':
      return `<path d="M28 52 Q30 22 60 24 Q90 22 92 52 Q80 36 60 40 Q40 36 28 52Z" ${s}/>`;
    case 'bob':
      return `<path d="M28 56 Q28 24 60 24 Q92 24 92 56 Q78 38 60 44 L56 36 Q44 42 28 56Z" ${s}/>`;
    default:
      return `<path d="M28 54 Q30 24 60 24 Q90 24 92 54 Q84 36 66 40 Q62 34 58 40 Q40 36 28 54Z" ${s}/>`;
  }
}

/** Skull, ears and hair. Face features are layered on top by the caller. */
function headBase(l: Look, faceInner: string, hatSvg = ''): string {
  return `${hairBack(l)}
    <circle cx="28" cy="60" r="7" fill="${l.skin}" stroke="${OUT}" stroke-width="4"/>
    <circle cx="92" cy="60" r="7" fill="${l.skin}" stroke="${OUT}" stroke-width="4"/>
    <ellipse cx="60" cy="58" rx="32" ry="30" fill="${l.skin}" stroke="${OUT}" stroke-width="4"/>
    ${hairFront(l)}
    ${faceInner}
    ${hatSvg}`;
}

const blinkDelay = () => `style="animation-delay:${(Math.random() * 4).toFixed(2)}s"`;

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

function rosvoHat(c: Costume): string {
  const s = `fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"`;
  switch (c.hat) {
    case 'beanie':
      return `<path d="M30 42 Q60 0 90 42 Z" ${s}/><rect x="27" y="36" width="66" height="12" rx="6" ${s}/>
        <circle cx="60" cy="12" r="8" fill="#fff" stroke="${OUT}" stroke-width="4"/>`;
    case 'bowler':
      return `<ellipse cx="60" cy="40" rx="42" ry="8" ${s}/><path d="M34 40 Q34 8 60 8 Q86 8 86 40 Z" ${s}/>`;
    case 'cap':
      return `<path d="M30 40 Q32 12 60 12 Q88 12 90 40 Z" ${s}/><path d="M84 38 Q104 36 108 44 L86 44 Z" ${s}/>`;
    default:
      return '';
  }
}

/** Rosvo head, viewBox 0 0 120 100. Shows sly or sorry face via CSS classes. */
export function rosvoHead(c: Costume): string {
  const l = c.look;
  const face = `
    <path d="M30 50 Q60 40 90 50 L88 62 Q74 66 62 58 Q60 56 58 58 Q46 66 32 62 Z" fill="${c.mask}"/>
    <g class="eyes-sly"><g class="blink" ${blinkDelay()}>
      <ellipse cx="46" cy="55" rx="7" ry="6" fill="#fff"/><ellipse cx="74" cy="55" rx="7" ry="6" fill="#fff"/>
      <circle cx="49" cy="55" r="3.5" fill="${OUT}"/><circle cx="77" cy="55" r="3.5" fill="${OUT}"/></g>
      <path d="M48 76 Q60 84 74 74" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g class="eyes-sorry">
      <ellipse cx="46" cy="56" rx="7" ry="7" fill="#fff"/><ellipse cx="74" cy="56" rx="7" ry="7" fill="#fff"/>
      <circle cx="46" cy="58" r="3.5" fill="${OUT}"/><circle cx="74" cy="58" r="3.5" fill="${OUT}"/>
      <path d="M38 44 L52 48 M82 44 L68 48" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 80 Q60 74 70 80" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="36" cy="70" rx="6" ry="3.5" fill="${BLUSH}" opacity=".8"/>
      <ellipse cx="84" cy="70" rx="6" ry="3.5" fill="${BLUSH}" opacity=".8"/>
    </g>
    ${l.female ? `<path d="M38 49 l-4 -4 M40 47 l-2 -5 M80 49 l4 -4 M78 47 l2 -5" stroke="${OUT}" stroke-width="2.5" stroke-linecap="round"/>` : ''}
    ${l.mustache ? `<path d="M46 72 Q53 66 60 71 Q67 66 74 72 Q67 76 60 73 Q53 76 46 72Z" fill="${l.hairColor}" stroke="${OUT}" stroke-width="1.5"/>` : ''}`;
  return `<g class="head">${headBase(l, face, rosvoHat(c))}</g>`;
}

/** Full-body rosvo. viewBox 0 0 120 200. */
export function rosvoSvg(c: Costume): string {
  const id = `b${Math.random().toString(36).slice(2, 8)}`;
  const stripes = [0, 1, 2, 3].map((i) => `<rect x="30" y="${104 + i * 16}" width="60" height="8" fill="${c.stripe}"/>`).join('');
  const skin = c.look.skin;
  return `<svg viewBox="0 0 120 200" width="120" height="200" class="rosvo-svg">
    <ellipse class="shadow" cx="60" cy="194" rx="42" ry="8" fill="#000" opacity=".15"/>
    <g class="legs">
      <rect class="leg l" x="40" y="160" width="14" height="30" rx="6" fill="#3d3d52" stroke="${OUT}" stroke-width="3"/>
      <rect class="leg r" x="66" y="160" width="14" height="30" rx="6" fill="#3d3d52" stroke="${OUT}" stroke-width="3"/>
      <ellipse cx="45" cy="192" rx="12" ry="6" fill="${OUT}"/><ellipse cx="75" cy="192" rx="12" ry="6" fill="${OUT}"/>
    </g>
    <g class="arms-down">
      <rect x="18" y="104" width="14" height="44" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="104" width="14" height="44" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3"/>
      <circle cx="25" cy="150" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="95" cy="150" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
    </g>
    <g class="arms-up">
      <rect x="14" y="62" width="14" height="46" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3" transform="rotate(-12 21 108)"/>
      <rect x="92" y="62" width="14" height="46" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3" transform="rotate(12 99 108)"/>
      <circle cx="13" cy="60" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="107" cy="60" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
    </g>
    <rect x="28" y="96" width="64" height="70" rx="16" fill="#fff" stroke="${OUT}" stroke-width="4"/>
    <clipPath id="${id}"><rect x="30" y="98" width="60" height="66" rx="14"/></clipPath>
    <g clip-path="url(#${id})">${stripes}</g>
    <path d="M30 140 Q60 150 90 140" fill="none" stroke="${OUT}" stroke-width="3" opacity=".25"/>
    <g class="arms-cuffed">
      <rect x="22" y="104" width="13" height="36" rx="6.5" fill="#fff" stroke="${OUT}" stroke-width="3" transform="rotate(-38 28 106)"/>
      <rect x="85" y="104" width="13" height="36" rx="6.5" fill="#fff" stroke="${OUT}" stroke-width="3" transform="rotate(38 92 106)"/>
      <circle cx="50" cy="134" r="7.5" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="70" cy="134" r="7.5" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
      ${cuffsSvg()}
    </g>
    <g transform="translate(0 6)">${rosvoHead(c)}</g>
  </svg>`;
}

export function sackSvg(c: Costume): string {
  return `<svg viewBox="0 0 80 80" width="80" height="80">
    <path d="M16 36 Q10 74 40 76 Q70 74 64 36 Q52 26 40 30 Q28 26 16 36Z" fill="${c.sack}" stroke="${OUT}" stroke-width="4"/>
    <path d="M30 28 L40 16 L50 28" fill="${c.sack}" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M28 30 Q40 36 52 30" fill="none" stroke="${OUT}" stroke-width="4"/>
    <path d="M32 52 a8 8 0 1 0 16 0 a8 8 0 1 0 -16 0 M40 44 v16" fill="none" stroke="${OUT}" stroke-width="3" opacity=".5"/>
  </svg>`;
}

// ---------- Townspeople ----------

export type Role = 'baker' | 'kid' | 'kid2' | 'elder' | 'dog' | 'vendor' | 'jeweler' | 'banker' | 'fancy' | 'postie' | 'gardener';
export const ROLES: Role[] = ['baker', 'kid', 'kid2', 'elder', 'dog', 'vendor', 'jeweler', 'banker', 'fancy', 'postie', 'gardener'];

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
};

function faces(cx: number, cy: number): string {
  return `<g class="face-happy">
      <path d="M${cx - 13} ${cy - 2} q4 -6 8 0 M${cx + 5} ${cy - 2} q4 -6 8 0" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx - 12} ${cy + 8} Q${cx} ${cy + 22} ${cx + 12} ${cy + 8} Z" fill="#c2185b" stroke="${OUT}" stroke-width="3"/>
    </g>
    <g class="face-calm">
      <g class="blink" ${blinkDelay()}><circle cx="${cx - 9}" cy="${cy - 2}" r="3.5" fill="${OUT}"/><circle cx="${cx + 9}" cy="${cy - 2}" r="3.5" fill="${OUT}"/></g>
      <path d="M${cx - 8} ${cy + 10} Q${cx} ${cy + 16} ${cx + 8} ${cy + 10}" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <g class="face-sad">
      <circle cx="${cx - 9}" cy="${cy - 1}" r="3.5" fill="${OUT}"/><circle cx="${cx + 9}" cy="${cy - 1}" r="3.5" fill="${OUT}"/>
      <path d="M${cx - 16} ${cy - 7} L${cx - 6} ${cy - 11} M${cx + 16} ${cy - 7} L${cx + 6} ${cy - 11}" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx - 8} ${cy + 14} Q${cx} ${cy + 7} ${cx + 8} ${cy + 14}" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx - 12} ${cy + 3} q-3 7 0 9 q3 -2 0 -9" fill="#64b5f6"/>
    </g>
    <ellipse cx="${cx - 18}" cy="${cy + 8}" rx="5" ry="3" fill="${BLUSH}" opacity=".5"/>
    <ellipse cx="${cx + 18}" cy="${cy + 8}" rx="5" ry="3" fill="${BLUSH}" opacity=".5"/>`;
}

interface Outfit {
  shirt: string;
  legs: string;
  hat?: string;
  extra?: string;
  /** Overrides for the look (e.g. grey hair for elders). */
  hairColor?: string;
}

function outfit(role: Role): Outfit {
  switch (role) {
    case 'baker':
      return {
        shirt: '#ffffff',
        legs: '#5d6d7e',
        hat: `<path d="M34 34 Q26 10 44 12 Q50 -2 64 8 Q80 0 84 14 Q98 14 88 34 Z" fill="#fff" stroke="${OUT}" stroke-width="4"/>
          <rect x="34" y="28" width="52" height="10" fill="#fff" stroke="${OUT}" stroke-width="4"/>`,
        extra: `<path d="M40 120 H80 V150 Q60 156 40 150Z" fill="#f5f5f5" stroke="${OUT}" stroke-width="3"/>`,
      };
    case 'kid':
      return {
        shirt: '#43a047',
        legs: '#1e88e5',
        hat: `<path d="M30 38 Q32 18 60 18 Q88 18 90 38Z" fill="#e53935" stroke="${OUT}" stroke-width="4"/><path d="M30 38 L8 40 L10 34 L30 32Z" fill="#e53935" stroke="${OUT}" stroke-width="3"/>`,
      };
    case 'kid2':
      return { shirt: '#f06292', legs: '#ffd54f' };
    case 'elder':
      return {
        shirt: '#9575cd',
        legs: '#7e57c2',
        hairColor: '#d9d9d9',
        extra: `<circle cx="51" cy="58" r="10" fill="none" stroke="${OUT}" stroke-width="2.5"/><circle cx="69" cy="58" r="10" fill="none" stroke="${OUT}" stroke-width="2.5"/><path d="M61 58 h-2" stroke="${OUT}" stroke-width="2.5"/>`,
      };
    case 'vendor':
      return {
        shirt: '#ffb74d',
        legs: '#455a64',
        hat: `<path d="M30 36 Q32 14 60 14 Q88 14 90 36Z" fill="#fff" stroke="${OUT}" stroke-width="4"/><rect x="28" y="30" width="64" height="8" fill="#f06292" stroke="${OUT}" stroke-width="3"/>`,
      };
    case 'jeweler':
      return {
        shirt: '#26a69a',
        legs: '#37474f',
        extra: `<path d="M50 96 L60 108 L70 96" fill="#fff" stroke="${OUT}" stroke-width="3"/><circle cx="60" cy="112" r="4" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/>`,
      };
    case 'banker':
      return {
        shirt: '#34495e',
        legs: '#2c3e50',
        extra: `<path d="M48 94 L60 104 L72 94 L66 130 L54 130Z" fill="#fff"/><path d="M57 102 L63 102 L66 124 L60 130 L54 124Z" fill="#e53935" stroke="${OUT}" stroke-width="2"/>`,
      };
    case 'fancy':
      return {
        shirt: '#ab47bc',
        legs: '#6a1b9a',
        extra: `${[44, 52, 60, 68, 76].map((x, i) => `<circle cx="${x}" cy="${100 + (i === 2 ? 6 : i % 2 ? 4 : 0)}" r="4" fill="#fff" stroke="${OUT}" stroke-width="1.5"/>`).join('')}`,
      };
    case 'postie':
      return {
        shirt: '#ffb300',
        legs: '#1e3a5f',
        hat: `<path d="M30 36 Q32 12 60 12 Q88 12 90 36Z" fill="#1e3a5f" stroke="${OUT}" stroke-width="4"/><path d="M84 34 Q104 32 106 40 L86 40Z" fill="#1e3a5f" stroke="${OUT}" stroke-width="3"/>`,
        extra: `<path d="M34 96 L86 146" stroke="#6d4c41" stroke-width="6"/>`,
      };
    case 'gardener':
      return {
        shirt: '#7cb342',
        legs: '#5d4037',
        hat: `<ellipse cx="60" cy="34" rx="44" ry="9" fill="#f3d27a" stroke="${OUT}" stroke-width="3.5"/><path d="M36 34 Q38 12 60 12 Q82 12 84 34Z" fill="#f3d27a" stroke="${OUT}" stroke-width="3.5"/>`,
        extra: `<path d="M38 112 H82 V156 H38Z" fill="#a1887f" stroke="${OUT}" stroke-width="3"/>`,
      };
    case 'dog':
      return { shirt: '', legs: '' };
  }
}

export function ownerSvg(role: Role, look: Look): string {
  if (role === 'dog') return dogSvg();
  const o = outfit(role);
  const l: Look = o.hairColor ? { ...look, hairColor: o.hairColor } : look;
  const skin = l.skin;
  return `<svg viewBox="0 0 120 200" width="120" height="200">
    <ellipse class="shadow" cx="60" cy="194" rx="42" ry="8" fill="#000" opacity=".15"/>
    <rect class="leg l" x="40" y="150" width="15" height="40" rx="6" fill="${o.legs}" stroke="${OUT}" stroke-width="3"/>
    <rect class="leg r" x="65" y="150" width="15" height="40" rx="6" fill="${o.legs}" stroke="${OUT}" stroke-width="3"/>
    <ellipse cx="46" cy="192" rx="12" ry="6" fill="${OUT}"/><ellipse cx="74" cy="192" rx="12" ry="6" fill="${OUT}"/>
    <g class="arms">
      <rect x="16" y="98" width="14" height="44" rx="7" fill="${o.shirt}" stroke="${OUT}" stroke-width="3" transform="rotate(-20 23 100)"/>
      <rect x="90" y="98" width="14" height="44" rx="7" fill="${o.shirt}" stroke="${OUT}" stroke-width="3" transform="rotate(20 97 100)"/>
      <circle cx="38" cy="140" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="82" cy="140" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
    </g>
    <rect x="28" y="92" width="64" height="66" rx="18" fill="${o.shirt}" stroke="${OUT}" stroke-width="4"/>
    <path d="M30 140 Q60 150 90 140" fill="none" stroke="${OUT}" stroke-width="3" opacity=".2"/>
    ${o.extra && role !== 'elder' ? o.extra : ''}
    <g transform="translate(0 2)">${headBase(l, faces(60, 60), (role === 'elder' ? o.extra : '') + (o.hat ?? ''))}</g>
  </svg>`;
}

function dogSvg(): string {
  return `<svg viewBox="0 0 120 200" width="120" height="200">
    <ellipse class="shadow" cx="60" cy="194" rx="46" ry="8" fill="#000" opacity=".15"/>
    <rect x="30" y="150" width="14" height="40" rx="6" fill="#d7a86e" stroke="${OUT}" stroke-width="3"/>
    <rect x="76" y="150" width="14" height="40" rx="6" fill="#d7a86e" stroke="${OUT}" stroke-width="3"/>
    <path class="tail" d="M92 130 Q116 110 108 92" fill="none" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/>
    <path class="tail" d="M92 130 Q116 110 108 92" fill="none" stroke="#d7a86e" stroke-width="6" stroke-linecap="round"/>
    <ellipse cx="60" cy="140" rx="38" ry="28" fill="#d7a86e" stroke="${OUT}" stroke-width="4"/>
    <ellipse cx="60" cy="84" rx="32" ry="30" fill="#d7a86e" stroke="${OUT}" stroke-width="4"/>
    <ellipse cx="28" cy="80" rx="10" ry="22" fill="#8d6e63" stroke="${OUT}" stroke-width="4" transform="rotate(15 28 80)"/>
    <ellipse cx="92" cy="80" rx="10" ry="22" fill="#8d6e63" stroke="${OUT}" stroke-width="4" transform="rotate(-15 92 80)"/>
    <ellipse cx="60" cy="98" rx="14" ry="10" fill="#f3e0c4"/>
    <ellipse cx="60" cy="92" rx="7" ry="5" fill="${OUT}"/>
    <rect x="36" y="112" width="48" height="8" rx="4" fill="#e53935" stroke="${OUT}" stroke-width="2.5"/>
    ${faces(60, 76)}
  </svg>`;
}

/** Police officer's head for the car's front window. viewBox 0 0 120 100. */
export function policeHead(l: Look): string {
  const face = `<g class="blink" ${blinkDelay()}><circle cx="51" cy="58" r="3.5" fill="${OUT}"/><circle cx="69" cy="58" r="3.5" fill="${OUT}"/></g>
    <path d="M50 70 Q60 78 70 70" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>`;
  const cap = `<path d="M26 36 Q30 6 60 8 Q90 6 94 36Z" fill="#2f5aa8" stroke="${OUT}" stroke-width="4"/>
    <rect x="24" y="32" width="72" height="10" rx="4" fill="#1f3f7a" stroke="${OUT}" stroke-width="4"/>
    <path d="M60 14 l4 8 h8 l-6 5 l2 8 l-8 -5 l-8 5 l2 -8 l-6 -5 h8Z" fill="#ffd54f" stroke="${OUT}" stroke-width="1.5"/>`;
  return headBase(l, face, cap);
}

/** Full-body police officer. viewBox 0 0 120 200. `.escorting` shows the arm that holds the rosvo. */
export function officerSvg(l: Look): string {
  const skin = l.skin;
  const cap = `<path d="M26 36 Q30 6 60 8 Q90 6 94 36Z" fill="#2f5aa8" stroke="${OUT}" stroke-width="4"/>
    <rect x="24" y="32" width="72" height="10" rx="4" fill="#1f3f7a" stroke="${OUT}" stroke-width="4"/>
    <path d="M60 14 l4 8 h8 l-6 5 l2 8 l-8 -5 l-8 5 l2 -8 l-6 -5 h8Z" fill="#ffd54f" stroke="${OUT}" stroke-width="1.5"/>`;
  return `<svg viewBox="0 0 120 200" width="120" height="200">
    <ellipse class="shadow" cx="60" cy="194" rx="42" ry="8" fill="#000" opacity=".15"/>
    <rect class="leg l" x="40" y="150" width="15" height="40" rx="6" fill="#1f2f4f" stroke="${OUT}" stroke-width="3"/>
    <rect class="leg r" x="65" y="150" width="15" height="40" rx="6" fill="#1f2f4f" stroke="${OUT}" stroke-width="3"/>
    <ellipse cx="46" cy="192" rx="12" ry="6" fill="${OUT}"/><ellipse cx="74" cy="192" rx="12" ry="6" fill="${OUT}"/>
    <rect x="16" y="98" width="14" height="46" rx="7" fill="#3d6fc4" stroke="${OUT}" stroke-width="3" transform="rotate(-10 23 100)"/>
    <circle cx="30" cy="144" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/>
    <g class="arm-rest"><rect x="90" y="98" width="14" height="46" rx="7" fill="#3d6fc4" stroke="${OUT}" stroke-width="3" transform="rotate(10 97 100)"/>
      <circle cx="90" cy="144" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/></g>
    <g class="arm-escort"><rect x="90" y="100" width="14" height="44" rx="7" fill="#3d6fc4" stroke="${OUT}" stroke-width="3" transform="rotate(-62 97 104)"/>
      <circle cx="136" cy="120" r="8" fill="${skin}" stroke="${OUT}" stroke-width="3"/></g>
    <rect x="28" y="92" width="64" height="66" rx="18" fill="#3d6fc4" stroke="${OUT}" stroke-width="4"/>
    <path d="M60 94 V156" stroke="${OUT}" stroke-width="2" opacity=".35"/>
    <rect x="28" y="140" width="64" height="9" fill="#1f2f4f"/>
    <path d="M42 110 l4 8 h8 l-6 5 l2 8 l-8 -5 l-8 5 l2 -8 l-6 -5 h8Z" fill="#ffd54f" stroke="${OUT}" stroke-width="1.5" transform="translate(-4 -4) scale(.9)"/>
    <g transform="translate(0 2)">${headBase(l, `<g class="blink" ${blinkDelay()}><circle cx="51" cy="58" r="3.5" fill="${OUT}"/><circle cx="69" cy="58" r="3.5" fill="${OUT}"/></g>
      <path d="M48 70 Q60 80 72 70" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <ellipse cx="42" cy="68" rx="5" ry="3" fill="${BLUSH}" opacity=".5"/><ellipse cx="78" cy="68" rx="5" ry="3" fill="${BLUSH}" opacity=".5"/>`, cap)}</g>
  </svg>`;
}
