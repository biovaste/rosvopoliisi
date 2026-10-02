// SVG art generators. Everything is drawn in code.

const OUT = '#2b2b3a';

export interface Costume {
  stripe: string;
  hat: 'beanie' | 'bowler' | 'cap' | 'none';
  hatColor: string;
  mask: string;
  mustache: boolean;
  skin: string;
  sack: string;
}

const STRIPES = ['#2b2b3a', '#d6453d', '#2f6fd6', '#7a3fc4', '#1d8a5a'];
const HATS: Costume['hat'][] = ['beanie', 'bowler', 'cap', 'none'];
const HAT_COLORS = ['#2b2b3a', '#e0722c', '#3b8fd9', '#c43f7d', '#3a9b54'];
const MASKS = ['#2b2b3a', '#3b4bb3', '#8a2f8a'];
const SKINS = ['#f6c9a4', '#e0a77e', '#b97d55', '#f9d7bd'];
const SACKS = ['#c9a36a', '#b9b9c9', '#d8b878'];

const pick = <T,>(a: readonly T[]): T => a[Math.floor(Math.random() * a.length)];

export function randomCostume(avoid?: Costume[]): Costume {
  let c: Costume;
  let guard = 0;
  do {
    c = {
      stripe: pick(STRIPES),
      hat: pick(HATS),
      hatColor: pick(HAT_COLORS),
      mask: pick(MASKS),
      mustache: Math.random() < 0.5,
      skin: pick(SKINS),
      sack: pick(SACKS),
    };
    guard++;
  } while (guard < 10 && avoid?.some((a) => a.stripe === c.stripe && a.hat === c.hat));
  return c;
}

function hat(c: Costume): string {
  switch (c.hat) {
    case 'beanie':
      return `<path d="M30 42 Q60 0 90 42 Z" fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"/>
        <rect x="27" y="36" width="66" height="12" rx="6" fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"/>
        <circle cx="60" cy="12" r="8" fill="#fff" stroke="${OUT}" stroke-width="4"/>`;
    case 'bowler':
      return `<ellipse cx="60" cy="40" rx="42" ry="8" fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"/>
        <path d="M34 40 Q34 8 60 8 Q86 8 86 40 Z" fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"/>`;
    case 'cap':
      return `<path d="M30 40 Q32 12 60 12 Q88 12 90 40 Z" fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"/>
        <path d="M84 38 Q104 36 108 44 L86 44 Z" fill="${c.hatColor}" stroke="${OUT}" stroke-width="4"/>`;
    default:
      return `<path d="M34 34 Q40 18 52 26 Q58 14 68 24 Q80 16 86 34" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>`;
  }
}

/** Head only (used for peeking and jail windows). viewBox 0 0 120 100. */
export function rosvoHead(c: Costume, faceExtra = ''): string {
  return `
  <g class="head">
    <ellipse cx="60" cy="58" rx="32" ry="30" fill="${c.skin}" stroke="${OUT}" stroke-width="4"/>
    <circle cx="28" cy="60" r="7" fill="${c.skin}" stroke="${OUT}" stroke-width="4"/>
    <circle cx="92" cy="60" r="7" fill="${c.skin}" stroke="${OUT}" stroke-width="4"/>
    <path d="M30 50 Q60 40 90 50 L88 62 Q74 66 62 58 Q60 56 58 58 Q46 66 32 62 Z" fill="${c.mask}"/>
    <g class="eyes-sly">
      <ellipse cx="46" cy="55" rx="7" ry="6" fill="#fff"/>
      <ellipse cx="74" cy="55" rx="7" ry="6" fill="#fff"/>
      <circle cx="49" cy="55" r="3.5" fill="${OUT}"/>
      <circle cx="77" cy="55" r="3.5" fill="${OUT}"/>
      <path d="M48 76 Q60 84 74 74" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
    </g>
    <g class="eyes-sorry">
      <ellipse cx="46" cy="56" rx="7" ry="7" fill="#fff"/>
      <ellipse cx="74" cy="56" rx="7" ry="7" fill="#fff"/>
      <circle cx="46" cy="58" r="3.5" fill="${OUT}"/>
      <circle cx="74" cy="58" r="3.5" fill="${OUT}"/>
      <path d="M38 44 L52 48 M82 44 L68 48" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M50 80 Q60 74 70 80" fill="none" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
      <ellipse cx="36" cy="70" rx="6" ry="3.5" fill="#f08a8a" opacity=".8"/>
      <ellipse cx="84" cy="70" rx="6" ry="3.5" fill="#f08a8a" opacity=".8"/>
    </g>
    ${c.mustache ? `<path d="M46 72 Q53 66 60 71 Q67 66 74 72 Q67 76 60 73 Q53 76 46 72Z" fill="#5a3a22"/>` : ''}
    ${hat(c)}
    ${faceExtra}
  </g>`;
}

/** Full-body rosvo. viewBox 0 0 120 200. */
export function rosvoSvg(c: Costume): string {
  const stripes = [0, 1, 2, 3]
    .map((i) => `<rect x="30" y="${104 + i * 16}" width="60" height="8" fill="${c.stripe}"/>`)
    .join('');
  return `<svg viewBox="0 0 120 200" width="120" height="200" class="rosvo-svg">
    <g class="legs">
      <rect class="leg l" x="40" y="160" width="14" height="30" rx="6" fill="#3d3d52" stroke="${OUT}" stroke-width="3"/>
      <rect class="leg r" x="66" y="160" width="14" height="30" rx="6" fill="#3d3d52" stroke="${OUT}" stroke-width="3"/>
      <ellipse cx="45" cy="192" rx="12" ry="6" fill="${OUT}"/>
      <ellipse cx="75" cy="192" rx="12" ry="6" fill="${OUT}"/>
    </g>
    <g class="arms-down">
      <rect x="18" y="104" width="14" height="44" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3"/>
      <rect x="88" y="104" width="14" height="44" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3"/>
      <circle cx="25" cy="150" r="8" fill="${c.skin}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="95" cy="150" r="8" fill="${c.skin}" stroke="${OUT}" stroke-width="3"/>
    </g>
    <g class="arms-up">
      <rect x="14" y="62" width="14" height="46" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3" transform="rotate(-12 21 108)"/>
      <rect x="92" y="62" width="14" height="46" rx="7" fill="#fff" stroke="${OUT}" stroke-width="3" transform="rotate(12 99 108)"/>
      <circle cx="13" cy="60" r="8" fill="${c.skin}" stroke="${OUT}" stroke-width="3"/>
      <circle cx="107" cy="60" r="8" fill="${c.skin}" stroke="${OUT}" stroke-width="3"/>
    </g>
    <rect x="28" y="96" width="64" height="70" rx="16" fill="#fff" stroke="${OUT}" stroke-width="4"/>
    <clipPath id="b${c.stripe.slice(1)}"><rect x="30" y="98" width="60" height="66" rx="14"/></clipPath>
    <g clip-path="url(#b${c.stripe.slice(1)})">${stripes}</g>
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

// ---------- Items ----------

export type ItemKind = 'cake' | 'ball' | 'flowers' | 'bone' | 'icecream' | 'teddy';

export function itemSvg(kind: ItemKind): string {
  const s = (inner: string) => `<svg viewBox="0 0 100 100" width="100" height="100">${inner}</svg>`;
  switch (kind) {
    case 'cake':
      return s(`<rect x="16" y="46" width="68" height="40" rx="6" fill="#f7d7a8" stroke="${OUT}" stroke-width="4"/>
        <path d="M16 54 Q24 64 32 54 Q40 64 50 54 Q58 64 66 54 Q74 64 84 54 L84 46 L16 46Z" fill="#f48fb1" stroke="${OUT}" stroke-width="4"/>
        <rect x="46" y="22" width="8" height="24" rx="3" fill="#7ec8f0" stroke="${OUT}" stroke-width="3"/>
        <path d="M50 8 Q58 16 50 22 Q42 16 50 8Z" fill="#ffc531" stroke="${OUT}" stroke-width="3"/>
        <circle cx="30" cy="70" r="4" fill="#e53935"/><circle cx="50" cy="74" r="4" fill="#e53935"/><circle cx="70" cy="70" r="4" fill="#e53935"/>`);
    case 'ball':
      return s(`<circle cx="50" cy="52" r="36" fill="#ffd54f" stroke="${OUT}" stroke-width="4"/>
        <path d="M14 52 Q50 30 86 52" fill="none" stroke="#e53935" stroke-width="8"/>
        <path d="M50 16 Q36 52 50 88" fill="none" stroke="#1e88e5" stroke-width="8"/>
        <circle cx="50" cy="52" r="36" fill="none" stroke="${OUT}" stroke-width="4"/>`);
    case 'flowers':
      return s(`<path d="M50 90 L46 50 M50 90 L30 46 M50 90 L70 46" stroke="#3a9b54" stroke-width="5"/>
        ${[
          [30, 40, '#f06292'],
          [50, 30, '#ffca28'],
          [70, 40, '#ba68c8'],
        ]
          .map(
            ([x, y, c]) =>
              `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288]
                .map((a) => `<circle cx="0" cy="-10" r="8" fill="${c}" stroke="${OUT}" stroke-width="2.5" transform="rotate(${a})"/>`)
                .join('')}<circle r="6" fill="#fff59d" stroke="${OUT}" stroke-width="2.5"/></g>`,
          )
          .join('')}
        <path d="M30 70 L70 70 L60 94 L40 94Z" fill="#90caf9" stroke="${OUT}" stroke-width="4"/>`);
    case 'bone':
      return s(`<g transform="rotate(-20 50 50)"><path d="M26 42 a10 10 0 1 1 6 -14 L68 28 a10 10 0 1 1 6 14 a10 10 0 1 1 -6 14 L32 56 a10 10 0 1 1 -6 -14Z" fill="#fff8e1" stroke="${OUT}" stroke-width="4" transform="translate(0 8)"/></g>`);
    case 'icecream':
      return s(`<path d="M32 50 L50 94 L68 50Z" fill="#e0a85a" stroke="${OUT}" stroke-width="4"/>
        <path d="M38 58 L60 58 M42 70 L58 70" stroke="#b07a35" stroke-width="3"/>
        <circle cx="38" cy="44" r="15" fill="#f8bbd0" stroke="${OUT}" stroke-width="4"/>
        <circle cx="62" cy="44" r="15" fill="#c5e1a5" stroke="${OUT}" stroke-width="4"/>
        <circle cx="50" cy="28" r="15" fill="#fff3e0" stroke="${OUT}" stroke-width="4"/>
        <circle cx="50" cy="12" r="6" fill="#e53935" stroke="${OUT}" stroke-width="3"/>`);
    case 'teddy':
      return s(`<circle cx="28" cy="24" r="11" fill="#b5835a" stroke="${OUT}" stroke-width="4"/>
        <circle cx="72" cy="24" r="11" fill="#b5835a" stroke="${OUT}" stroke-width="4"/>
        <ellipse cx="50" cy="72" rx="26" ry="22" fill="#b5835a" stroke="${OUT}" stroke-width="4"/>
        <circle cx="50" cy="40" r="24" fill="#b5835a" stroke="${OUT}" stroke-width="4"/>
        <ellipse cx="50" cy="48" rx="10" ry="8" fill="#e8c9a6"/>
        <circle cx="50" cy="45" r="4" fill="${OUT}"/>
        <circle cx="41" cy="36" r="3.5" fill="${OUT}"/><circle cx="59" cy="36" r="3.5" fill="${OUT}"/>
        <path d="M40 64 L50 70 L60 64 L50 58Z" fill="#e53935" stroke="${OUT}" stroke-width="2"/>`);
  }
}

// ---------- Townspeople ----------

export type OwnerKind = 'baker' | 'kid' | 'grandma' | 'dog' | 'vendor' | 'girl';

export const OWNER_ITEM: Record<OwnerKind, ItemKind> = {
  baker: 'cake',
  kid: 'ball',
  grandma: 'flowers',
  dog: 'bone',
  vendor: 'icecream',
  girl: 'teddy',
};

function faces(cx: number, cy: number): string {
  return `<g class="face-happy">
      <path d="M${cx - 13} ${cy - 2} q4 -6 8 0 M${cx + 5} ${cy - 2} q4 -6 8 0" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx - 12} ${cy + 8} Q${cx} ${cy + 22} ${cx + 12} ${cy + 8} Z" fill="#c2185b" stroke="${OUT}" stroke-width="3"/>
    </g>
    <g class="face-calm">
      <circle cx="${cx - 9}" cy="${cy - 2}" r="3.5" fill="${OUT}"/><circle cx="${cx + 9}" cy="${cy - 2}" r="3.5" fill="${OUT}"/>
      <path d="M${cx - 8} ${cy + 10} Q${cx} ${cy + 16} ${cx + 8} ${cy + 10}" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
    </g>
    <g class="face-sad">
      <circle cx="${cx - 9}" cy="${cy - 1}" r="3.5" fill="${OUT}"/><circle cx="${cx + 9}" cy="${cy - 1}" r="3.5" fill="${OUT}"/>
      <path d="M${cx - 16} ${cy - 7} L${cx - 6} ${cy - 11} M${cx + 16} ${cy - 7} L${cx + 6} ${cy - 11}" stroke="${OUT}" stroke-width="3" stroke-linecap="round"/>
      <path d="M${cx - 8} ${cy + 14} Q${cx} ${cy + 7} ${cx + 8} ${cy + 14}" fill="none" stroke="${OUT}" stroke-width="3.5" stroke-linecap="round"/>
      <path d="M${cx - 12} ${cy + 3} q-3 7 0 9 q3 -2 0 -9" fill="#64b5f6"/>
    </g>`;
}

function person(opts: { skin: string; shirt: string; legs: string; hair: string; head?: string; scale?: number }): string {
  const { skin, shirt, legs, hair, head = '' } = opts;
  return `<svg viewBox="0 0 120 200" width="120" height="200">
    <rect x="40" y="150" width="15" height="40" rx="6" fill="${legs}" stroke="${OUT}" stroke-width="3"/>
    <rect x="65" y="150" width="15" height="40" rx="6" fill="${legs}" stroke="${OUT}" stroke-width="3"/>
    <ellipse cx="46" cy="192" rx="12" ry="6" fill="${OUT}"/><ellipse cx="74" cy="192" rx="12" ry="6" fill="${OUT}"/>
    <g class="arms">
      <rect x="16" y="98" width="14" height="44" rx="7" fill="${shirt}" stroke="${OUT}" stroke-width="3" transform="rotate(-20 23 100)"/>
      <rect x="90" y="98" width="14" height="44" rx="7" fill="${shirt}" stroke="${OUT}" stroke-width="3" transform="rotate(20 97 100)"/>
    </g>
    <rect x="28" y="92" width="64" height="66" rx="18" fill="${shirt}" stroke="${OUT}" stroke-width="4"/>
    <circle cx="60" cy="58" r="32" fill="${skin}" stroke="${OUT}" stroke-width="4"/>
    ${hair}
    ${faces(60, 60)}
    ${head}
  </svg>`;
}

export function ownerSvg(kind: OwnerKind): string {
  switch (kind) {
    case 'baker':
      return person({
        skin: '#f6c9a4',
        shirt: '#ffffff',
        legs: '#5d6d7e',
        hair: '',
        head: `<path d="M34 34 Q26 10 44 12 Q50 -2 64 8 Q80 0 84 14 Q98 14 88 34 Z" fill="#fff" stroke="${OUT}" stroke-width="4"/>
          <rect x="34" y="28" width="52" height="10" fill="#fff" stroke="${OUT}" stroke-width="4"/>
          <path d="M48 76 Q54 70 60 75 Q66 70 72 76" fill="none" stroke="#6d4c41" stroke-width="5" stroke-linecap="round"/>`,
      });
    case 'kid':
      return person({
        skin: '#e0a77e',
        shirt: '#43a047',
        legs: '#1e88e5',
        hair: `<path d="M28 54 Q30 20 60 22 Q92 20 92 54 Q80 34 60 38 Q40 34 28 54Z" fill="#3e2723"/>`,
        head: `<path d="M30 38 Q32 18 60 18 Q88 18 90 38Z" fill="#e53935" stroke="${OUT}" stroke-width="4"/><path d="M30 38 L8 40 L10 34 L30 32Z" fill="#e53935" stroke="${OUT}" stroke-width="3"/>`,
      });
    case 'grandma':
      return person({
        skin: '#f9d7bd',
        shirt: '#9575cd',
        legs: '#7e57c2',
        hair: `<circle cx="60" cy="22" r="14" fill="#e0e0e0" stroke="${OUT}" stroke-width="3"/><path d="M28 56 Q28 26 60 26 Q92 26 92 56 Q86 38 60 38 Q34 38 28 56Z" fill="#e0e0e0" stroke="${OUT}" stroke-width="3"/>`,
        head: `<circle cx="51" cy="58" r="10" fill="none" stroke="${OUT}" stroke-width="2.5"/><circle cx="69" cy="58" r="10" fill="none" stroke="${OUT}" stroke-width="2.5"/>`,
      });
    case 'vendor':
      return person({
        skin: '#b97d55',
        shirt: '#ffb74d',
        legs: '#455a64',
        hair: '',
        head: `<path d="M30 36 Q32 14 60 14 Q88 14 90 36Z" fill="#fff" stroke="${OUT}" stroke-width="4"/><rect x="28" y="30" width="64" height="8" fill="#f06292" stroke="${OUT}" stroke-width="3"/>`,
      });
    case 'girl':
      return person({
        skin: '#f6c9a4',
        shirt: '#f06292',
        legs: '#f8bbd0',
        hair: `<path d="M28 60 Q24 22 60 22 Q96 22 92 60 Q84 34 60 36 Q36 34 28 60Z" fill="#ff8f00"/><circle cx="24" cy="44" r="10" fill="#ff8f00"/><circle cx="96" cy="44" r="10" fill="#ff8f00"/>`,
      });
    case 'dog':
      return `<svg viewBox="0 0 120 200" width="120" height="200">
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
}

// ---------- Scenery ----------

export function houseSvg(wall: string, roof: string, door: string, extra = ''): string {
  return `<svg viewBox="0 0 220 230" width="220" height="230">
    <path d="M6 96 L110 14 L214 96Z" fill="${roof}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="22" y="92" width="176" height="134" fill="${wall}" stroke="${OUT}" stroke-width="5"/>
    <rect x="88" y="150" width="44" height="76" rx="6" fill="${door}" stroke="${OUT}" stroke-width="4"/>
    <circle cx="124" cy="190" r="4" fill="#ffd54f"/>
    <g class="win"><rect x="38" y="120" width="40" height="40" rx="4" fill="#bfe7ff" stroke="${OUT}" stroke-width="4"/>
    <rect x="142" y="120" width="40" height="40" rx="4" fill="#bfe7ff" stroke="${OUT}" stroke-width="4"/></g>
    <g class="win-lit"><rect x="38" y="120" width="40" height="40" rx="4" fill="#ffe082" stroke="${OUT}" stroke-width="4"/>
    <rect x="142" y="120" width="40" height="40" rx="4" fill="#ffe082" stroke="${OUT}" stroke-width="4"/></g>
    <path d="M58 120 V160 M38 140 H78 M162 120 V160 M142 140 H182" stroke="${OUT}" stroke-width="3"/>
    ${extra}
  </svg>`;
}

export function stationSvg(): string {
  // 300 x 320. Jail windows are separate elements layered on top.
  return `<svg viewBox="0 0 300 320" width="300" height="320">
    <rect x="10" y="60" width="280" height="256" fill="#5c8fd6" stroke="${OUT}" stroke-width="5"/>
    <rect x="0" y="40" width="300" height="30" rx="6" fill="#2f5aa8" stroke="${OUT}" stroke-width="5"/>
    <g transform="translate(150 22)">
      <path d="M0 -24 L7 -8 L24 -7 L11 4 L15 21 L0 12 L-15 21 L-11 4 L-24 -7 L-7 -8Z" fill="#ffd54f" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    </g>
    <rect x="24" y="96" width="252" height="110" rx="10" fill="#3d6fbf" stroke="${OUT}" stroke-width="4"/>
    <rect x="112" y="226" width="76" height="90" rx="8" fill="#2f5aa8" stroke="${OUT}" stroke-width="4"/>
    <circle cx="176" cy="272" r="5" fill="#ffd54f"/>
    <rect x="128" y="236" width="44" height="30" rx="4" fill="#bfe7ff" stroke="${OUT}" stroke-width="3"/>
    <g class="win"><rect x="30" y="232" width="56" height="44" rx="4" fill="#bfe7ff" stroke="${OUT}" stroke-width="4"/><rect x="214" y="232" width="56" height="44" rx="4" fill="#bfe7ff" stroke="${OUT}" stroke-width="4"/></g>
    <g class="win-lit"><rect x="30" y="232" width="56" height="44" rx="4" fill="#ffe082" stroke="${OUT}" stroke-width="4"/><rect x="214" y="232" width="56" height="44" rx="4" fill="#ffe082" stroke="${OUT}" stroke-width="4"/></g>
  </svg>`;
}

/** A barred jail window, viewBox 0 0 76 90. Face layer sits behind the bars. */
export function jailWindowBack(): string {
  return `<svg viewBox="0 0 76 90" width="76" height="90"><rect x="2" y="2" width="72" height="86" rx="10" fill="#1f2d4d" stroke="${OUT}" stroke-width="4"/></svg>`;
}
export function jailWindowBars(): string {
  return `<svg viewBox="0 0 76 90" width="76" height="90">
    <path d="M20 4 V86 M38 4 V86 M56 4 V86" stroke="#9aa5b8" stroke-width="6" stroke-linecap="round"/>
    <path d="M20 4 V86 M38 4 V86 M56 4 V86" stroke="${OUT}" stroke-width="2" opacity=".4"/>
    <rect x="2" y="2" width="72" height="86" rx="10" fill="none" stroke="${OUT}" stroke-width="5"/>
  </svg>`;
}

export function carSvg(): string {
  return `<svg viewBox="0 0 260 140" width="260" height="140">
    <path d="M14 96 Q12 66 40 62 L72 30 Q80 22 96 22 L170 22 Q184 22 192 32 L218 62 Q248 66 248 96 L248 110 L14 110Z" fill="#ffffff" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <rect x="14" y="76" width="234" height="20" fill="#2f5aa8"/>
    <path d="M14 96 Q12 66 40 62 L72 30 Q80 22 96 22 L170 22 Q184 22 192 32 L218 62 Q248 66 248 96 L248 110 L14 110Z" fill="none" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M84 36 L124 36 L124 62 L60 62Z" fill="#bfe7ff" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M134 36 L176 36 L202 62 L134 62Z" fill="#bfe7ff" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <g transform="translate(118 86)"><path d="M0 -10 L3 -3 L10 -3 L4 2 L6 9 L0 5 L-6 9 L-4 2 L-10 -3 L-3 -3Z" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/></g>
    <circle cx="66" cy="112" r="22" fill="${OUT}"/><circle cx="66" cy="112" r="9" fill="#cfd8dc"/>
    <circle cx="196" cy="112" r="22" fill="${OUT}"/><circle cx="196" cy="112" r="9" fill="#cfd8dc"/>
    <rect x="236" y="70" width="14" height="10" rx="3" fill="#fff59d" stroke="${OUT}" stroke-width="3"/>
    <rect x="104" y="8" width="54" height="16" rx="6" fill="#455a64" stroke="${OUT}" stroke-width="4"/>
  </svg>`;
}

export function carLights(): string {
  return `<svg viewBox="0 0 54 16" width="54" height="16">
    <rect class="l-red" x="2" y="2" width="24" height="12" rx="5" fill="#ff1744"/>
    <rect class="l-blue" x="28" y="2" width="24" height="12" rx="5" fill="#2979ff"/>
  </svg>`;
}

export function bushSvg(c = '#4caf50'): string {
  return `<svg viewBox="0 0 200 120" width="200" height="120">
    <path d="M10 116 Q0 70 36 66 Q40 26 80 34 Q100 6 128 30 Q170 22 170 62 Q204 70 190 116Z" fill="${c}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="60" cy="72" r="5" fill="#e53935"/><circle cx="130" cy="58" r="5" fill="#e53935"/><circle cx="104" cy="92" r="5" fill="#e53935"/>
  </svg>`;
}

export function binSvg(): string {
  return `<svg viewBox="0 0 130 150" width="130" height="150">
    <path d="M18 40 L28 146 L102 146 L112 40Z" fill="#78909c" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M46 56 L50 132 M65 56 V132 M84 56 L80 132" stroke="#546e7a" stroke-width="5" stroke-linecap="round"/>
    <rect x="8" y="26" width="114" height="18" rx="8" fill="#90a4ae" stroke="${OUT}" stroke-width="5"/>
    <rect x="52" y="14" width="26" height="14" rx="6" fill="#90a4ae" stroke="${OUT}" stroke-width="4"/>
  </svg>`;
}

export function treeSvg(): string {
  return `<svg viewBox="0 0 200 300" width="200" height="300">
    <path d="M80 300 L86 160 L114 160 L120 300Z" fill="#8d6e63" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M30 170 Q-6 140 26 104 Q10 54 60 46 Q80 0 124 22 Q176 18 172 70 Q206 100 178 146 Q170 186 120 176 Q100 196 76 180 Q50 190 30 170Z" fill="#43a047" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <circle cx="70" cy="96" r="7" fill="#ff7043"/><circle cx="130" cy="80" r="7" fill="#ff7043"/><circle cx="120" cy="140" r="7" fill="#ff7043"/>
  </svg>`;
}

export function crateSvg(): string {
  return `<svg viewBox="0 0 150 130" width="150" height="130">
    <rect x="6" y="20" width="138" height="106" rx="6" fill="#d7a86e" stroke="${OUT}" stroke-width="5"/>
    <path d="M6 54 H144 M6 92 H144" stroke="${OUT}" stroke-width="4"/>
    <path d="M20 26 L130 120" stroke="#b07a35" stroke-width="8" stroke-linecap="round"/>
    <rect x="6" y="20" width="138" height="106" rx="6" fill="none" stroke="${OUT}" stroke-width="5"/>
  </svg>`;
}

export function lampSvg(): string {
  return `<svg viewBox="0 0 60 260" width="60" height="260">
    <circle class="glow" cx="30" cy="30" r="30" fill="#fff59d" opacity=".55"/>
    <rect x="25" y="40" width="10" height="216" rx="4" fill="#546e7a" stroke="${OUT}" stroke-width="3"/>
    <path d="M14 40 L46 40 L40 16 L20 16Z" fill="#455a64" stroke="${OUT}" stroke-width="3"/>
    <circle cx="30" cy="30" r="9" fill="#fff9c4" stroke="${OUT}" stroke-width="3"/>
  </svg>`;
}

export function handSvg(): string {
  return `<svg viewBox="0 0 100 120" width="100" height="120">
    <path d="M40 10 Q40 0 50 0 Q60 0 60 10 L60 50 Q66 42 74 46 Q80 40 86 46 Q94 44 96 54 L96 84 Q96 112 66 116 L52 116 Q34 114 24 96 L8 70 Q4 60 14 58 Q22 58 30 68 L40 78Z"
      fill="#fff" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M60 52 V70 M74 48 V70 M86 50 V72" stroke="${OUT}" stroke-width="3" stroke-linecap="round" opacity=".5"/>
  </svg>`;
}

const STICKER_COLORS = ['#ffd54f', '#f06292', '#64b5f6', '#81c784', '#ba68c8', '#ff8a65'];

export function stickerSvg(n: number): string {
  const c = STICKER_COLORS[n % STICKER_COLORS.length];
  const shape = n % 4;
  let inner: string;
  if (shape === 0) {
    inner = `<path d="M50 6 L62 36 L94 38 L69 58 L78 90 L50 72 L22 90 L31 58 L6 38 L38 36Z" fill="${c}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>`;
  } else if (shape === 1) {
    inner = `<path d="M50 90 Q8 62 10 34 Q12 10 34 10 Q46 10 50 24 Q54 10 66 10 Q88 10 90 34 Q92 62 50 90Z" fill="${c}" stroke="${OUT}" stroke-width="5"/>`;
  } else if (shape === 2) {
    inner = `<path d="M50 6 L88 20 L84 60 Q76 84 50 94 Q24 84 16 60 L12 20Z" fill="${c}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
      <path d="M50 30 L56 44 L71 45 L59 54 L64 69 L50 60 L36 69 L41 54 L29 45 L44 44Z" fill="#fff"/>`;
  } else {
    inner = `<circle cx="50" cy="50" r="42" fill="${c}" stroke="${OUT}" stroke-width="5"/>
      <circle cx="36" cy="42" r="5" fill="${OUT}"/><circle cx="64" cy="42" r="5" fill="${OUT}"/>
      <path d="M32 58 Q50 76 68 58" fill="none" stroke="${OUT}" stroke-width="5" stroke-linecap="round"/>`;
  }
  return `<svg viewBox="0 0 100 100" width="100" height="100"><circle cx="50" cy="50" r="48" fill="#fff" opacity=".9"/>${inner}</svg>`;
}

export function playButtonSvg(): string {
  return `<svg viewBox="0 0 240 240" width="240" height="240">
    <circle cx="120" cy="120" r="110" fill="#2f5aa8" stroke="${OUT}" stroke-width="8"/>
    <circle cx="120" cy="120" r="92" fill="#3d7be0"/>
    <path d="M94 70 L178 120 L94 170Z" fill="#fff" stroke="${OUT}" stroke-width="7" stroke-linejoin="round"/>
  </svg>`;
}

export function rotateSvg(): string {
  return `<svg viewBox="0 0 200 200" width="200" height="200">
    <g class="rot-phone"><rect x="70" y="30" width="60" height="110" rx="10" fill="#fff" stroke="#fff" stroke-width="2"/>
    <rect x="76" y="40" width="48" height="86" rx="4" fill="#7ec8f0"/></g>
    <path d="M40 160 Q100 200 160 160" fill="none" stroke="#ffd54f" stroke-width="8" stroke-linecap="round"/>
    <path d="M150 146 L162 160 L144 168" fill="none" stroke="#ffd54f" stroke-width="8" stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
