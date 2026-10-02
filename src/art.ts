// SVG art generators for items and scenery. Everything is drawn in code.

export const OUT = '#2b2b3a';

// ---------- Items ----------

export type ItemKind = 'cake' | 'ball' | 'flowers' | 'bone' | 'icecream' | 'teddy' | 'gold' | 'gem' | 'jewels';

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
    case 'gold':
      return s(`<ellipse cx="50" cy="88" rx="40" ry="7" fill="#000" opacity=".12"/>
        ${[
          [14, 62],
          [50, 62],
          [32, 38],
        ]
          .map(
            ([x, y]) => `<g transform="translate(${x} ${y})"><path d="M0 24 L6 4 L32 4 L38 24Z" fill="#ffca28" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
              <path d="M8 8 L28 8" stroke="#fff8e1" stroke-width="3" stroke-linecap="round"/><path d="M4 20 L34 20" stroke="#f9a825" stroke-width="3"/></g>`,
          )
          .join('')}
        <path d="M82 20 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3Z" fill="#fff"/>`);
    case 'gem':
      return s(`<path d="M24 34 L36 16 L64 16 L76 34 L50 88Z" fill="#4fc3f7" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M24 34 H76 M36 16 L44 34 L50 88 M64 16 L56 34 L50 88 M44 34 L50 16 L56 34" fill="none" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>
        <path d="M30 32 L38 20 L44 32Z" fill="#e1f5fe"/>
        <path d="M84 14 l3 7 l7 3 l-7 3 l-3 7 l-3 -7 l-7 -3 l7 -3Z M16 58 l2 5 l5 2 l-5 2 l-2 5 l-2 -5 l-5 -2 l5 -2Z" fill="#fff"/>`);
    case 'jewels':
      return s(`<path d="M14 54 L86 54 L80 88 L20 88Z" fill="#c2185b" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M14 54 L22 30 L78 30 L86 54" fill="#f48fb1" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M26 54 Q50 82 74 54" fill="none" stroke="#fff" stroke-width="5" stroke-dasharray="1 7" stroke-linecap="round"/>
        <circle cx="50" cy="70" r="6" fill="#e53935" stroke="${OUT}" stroke-width="2.5"/>
        <circle cx="36" cy="36" r="7" fill="none" stroke="#ffca28" stroke-width="4"/><path d="M33 28 l3 -5 l3 5Z" fill="#81d4fa" stroke="${OUT}" stroke-width="1.5"/>
        <circle cx="64" cy="42" r="5" fill="#ab47bc" stroke="${OUT}" stroke-width="2"/>`);
  }
}

// ---------- Scenery ----------

export type BuildingKind = 'house' | 'bakery' | 'shop' | 'cafe' | 'bank';

export interface BuildingLook {
  kind: BuildingKind;
  wall: string;
  roof: string;
  door: string;
}

/** Picture sign for a building (no text). */
function sign(kind: BuildingKind): string {
  const box = (inner: string) =>
    `<g transform="translate(110 108)"><rect x="-38" y="-16" width="76" height="32" rx="12" fill="#fff" stroke="${OUT}" stroke-width="3"/>${inner}</g>`;
  switch (kind) {
    case 'bakery':
      return box(`<path d="M-22 4 Q-10 -12 0 0 Q10 -12 22 4 Q10 12 0 6 Q-10 12 -22 4Z" fill="#e0a85a" stroke="${OUT}" stroke-width="2.5"/>`);
    case 'shop':
      return box(`<circle cx="-10" cy="0" r="9" fill="#e53935" stroke="${OUT}" stroke-width="2"/><circle cx="10" cy="0" r="9" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/>`);
    case 'cafe':
      return box(`<path d="M-12 -8 H8 V4 Q8 10 -2 10 Q-12 10 -12 4Z" fill="#8d6e63" stroke="${OUT}" stroke-width="2.5"/><path d="M8 -4 Q16 -4 14 2 Q12 6 8 4" fill="none" stroke="${OUT}" stroke-width="2.5"/>`);
    case 'bank':
      return box(`<path d="M-14 -4 Q-14 -10 0 -10 Q14 -10 14 -4 L14 8 L-14 8Z" fill="#ffca28" stroke="${OUT}" stroke-width="2.5"/><path d="M-4 -2 h8 M0 -6 v12" stroke="${OUT}" stroke-width="2"/>`);
    default:
      return `<circle cx="110" cy="68" r="12" fill="#bfe7ff" stroke="${OUT}" stroke-width="4"/><circle cx="110" cy="68" r="12" class="win-lit" fill="#ffe082" stroke="${OUT}" stroke-width="4"/>`;
  }
}

function awning(kind: BuildingKind, color: string): string {
  if (kind === 'house' || kind === 'bank') return '';
  const stripes = [0, 1, 2, 3, 4, 5, 6, 7]
    .map((i) => `<path d="M${30 + i * 20} 134 h20 v14 q-10 8 -20 0Z" fill="${i % 2 ? '#fff' : color}" stroke="${OUT}" stroke-width="2.5"/>`)
    .join('');
  return stripes;
}

export function buildingSvg(b: BuildingLook): string {
  const shop = b.kind !== 'house';
  const winY = shop ? 156 : 120;
  const win = (fill: string) =>
    shop
      ? `<rect x="34" y="${winY}" width="48" height="44" rx="4" fill="${fill}" stroke="${OUT}" stroke-width="4"/><rect x="138" y="${winY}" width="48" height="44" rx="4" fill="${fill}" stroke="${OUT}" stroke-width="4"/>`
      : `<rect x="38" y="120" width="40" height="40" rx="4" fill="${fill}" stroke="${OUT}" stroke-width="4"/><rect x="142" y="120" width="40" height="40" rx="4" fill="${fill}" stroke="${OUT}" stroke-width="4"/>`;
  const panes = shop
    ? `<path d="M58 ${winY} V${winY + 44} M162 ${winY} V${winY + 44}" stroke="${OUT}" stroke-width="3"/>`
    : `<path d="M58 120 V160 M38 140 H78 M162 120 V160 M142 140 H182" stroke="${OUT}" stroke-width="3"/>
       <rect x="34" y="160" width="48" height="10" rx="3" fill="#8d6e63" stroke="${OUT}" stroke-width="3"/><rect x="138" y="160" width="48" height="10" rx="3" fill="#8d6e63" stroke="${OUT}" stroke-width="3"/>
       <circle cx="44" cy="158" r="5" fill="#f06292"/><circle cx="58" cy="157" r="5" fill="#ffd54f"/><circle cx="72" cy="158" r="5" fill="#f06292"/>
       <circle cx="148" cy="158" r="5" fill="#ba68c8"/><circle cx="162" cy="157" r="5" fill="#fff"/><circle cx="176" cy="158" r="5" fill="#ba68c8"/>`;
  const shingles = [0, 1, 2]
    .map((i) => `<path d="M${40 - i * 12} ${50 + i * 16} L${180 + i * 12} ${50 + i * 16}" stroke="${OUT}" stroke-width="2" opacity=".18"/>`)
    .join('');
  return `<svg viewBox="0 0 220 230" width="220" height="230">
    <path d="M6 96 L110 14 L214 96Z" fill="${b.roof}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    ${shingles}
    <rect x="22" y="92" width="176" height="134" fill="${b.wall}" stroke="${OUT}" stroke-width="5"/>
    <rect x="160" y="95" width="35" height="128" fill="#000" opacity=".07"/>
    <rect x="25" y="95" width="170" height="10" fill="#000" opacity=".08"/>
    <rect x="88" y="150" width="44" height="76" rx="6" fill="${b.door}" stroke="${OUT}" stroke-width="4"/>
    <rect x="96" y="160" width="28" height="20" rx="3" fill="#000" opacity=".12"/>
    <circle cx="124" cy="192" r="4" fill="#ffd54f" stroke="${OUT}" stroke-width="1.5"/>
    <g class="win">${win('#bfe7ff')}</g>
    <g class="win-lit">${win('#ffe082')}</g>
    ${panes}
    ${awning(b.kind, b.roof)}
    ${sign(b.kind)}
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

/** Police car facing right. Driver and passenger heads sit behind the windows. */
export function carSvg(driverHead: string): string {
  const wheel = (cx: number) => `<g class="wheel" style="transform-origin:${cx}px 112px">
      <circle cx="${cx}" cy="112" r="22" fill="${OUT}"/><circle cx="${cx}" cy="112" r="10" fill="#cfd8dc"/>
      <path d="M${cx - 9} 112 H${cx + 9} M${cx} 103 V121" stroke="${OUT}" stroke-width="3"/></g>`;
  return `<svg viewBox="0 0 260 140" width="260" height="140">
    <defs>
      <clipPath id="cw-rear"><path d="M84 36 L124 36 L124 62 L60 62Z"/></clipPath>
      <clipPath id="cw-front"><path d="M134 36 L176 36 L202 62 L134 62Z"/></clipPath>
    </defs>
    <ellipse cx="131" cy="132" rx="120" ry="9" fill="#000" opacity=".15"/>
    <path d="M14 96 Q12 66 40 62 L72 30 Q80 22 96 22 L170 22 Q184 22 192 32 L218 62 Q248 66 248 96 L248 110 L14 110Z" fill="#ffffff"/>
    <rect x="14" y="76" width="234" height="20" fill="#2f5aa8"/>
    <path d="M14 96 Q12 66 40 62 L72 30 Q80 22 96 22 L170 22 Q184 22 192 32 L218 62 Q248 66 248 96 L248 110 L14 110Z" fill="none" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M84 36 L124 36 L124 62 L60 62Z" fill="#bfe7ff"/>
    <path d="M134 36 L176 36 L202 62 L134 62Z" fill="#bfe7ff"/>
    <g clip-path="url(#cw-rear)"><g class="riders"></g></g>
    <g clip-path="url(#cw-front)"><g transform="translate(140 24) scale(.46)">${driverHead}</g></g>
    <path d="M84 36 L124 36 L124 62 L60 62Z" fill="none" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M134 36 L176 36 L202 62 L134 62Z" fill="none" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M92 40 L100 40 L84 58 L76 58Z M144 40 L152 40 L140 58 L136 58Z" fill="#fff" opacity=".5"/>
    <g transform="translate(118 86)"><path d="M0 -10 L3 -3 L10 -3 L4 2 L6 9 L0 5 L-6 9 L-4 2 L-10 -3 L-3 -3Z" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/></g>
    ${wheel(66)}${wheel(196)}
    <rect x="236" y="70" width="14" height="10" rx="3" fill="#fff59d" stroke="${OUT}" stroke-width="3"/>
    <rect x="10" y="72" width="10" height="10" rx="3" fill="#ef5350" stroke="${OUT}" stroke-width="3"/>
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
    <path d="M150 64 Q192 76 186 114 L118 114 Q162 100 150 64Z" fill="#000" opacity=".1"/>
    <path d="M44 72 Q50 50 72 48 M92 36 Q106 24 122 32" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".3"/>
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

export type TreeStyle = 'apple' | 'birch' | 'autumn';

export function treeSvg(style: TreeStyle): string {
  const leaf = style === 'birch' ? '#7cb342' : style === 'autumn' ? '#f39c33' : '#43a047';
  const trunk = style === 'birch' ? '#f5f5f5' : '#8d6e63';
  const marks =
    style === 'birch'
      ? `<path d="M88 200 h10 M104 230 h10 M90 262 h12 M100 182 h8" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>`
      : `<path d="M96 200 q4 20 0 40 M106 250 q-4 14 0 30" stroke="${OUT}" stroke-width="2.5" fill="none" opacity=".3"/>`;
  const fruit =
    style === 'apple'
      ? `<circle cx="70" cy="96" r="8" fill="#e53935" stroke="${OUT}" stroke-width="2"/><circle cx="130" cy="80" r="8" fill="#e53935" stroke="${OUT}" stroke-width="2"/><circle cx="120" cy="140" r="8" fill="#e53935" stroke="${OUT}" stroke-width="2"/><circle cx="56" cy="146" r="8" fill="#e53935" stroke="${OUT}" stroke-width="2"/>`
      : style === 'autumn'
        ? `<path d="M60 110 l6 -8 l6 8 l-6 8Z M130 120 l6 -8 l6 8 l-6 8Z M100 70 l6 -8 l6 8 l-6 8Z" fill="#e65100"/>`
        : `<path d="M60 120 q10 -10 20 0 M120 90 q10 -10 20 0 M100 150 q10 -10 20 0" stroke="#558b2f" stroke-width="4" fill="none" stroke-linecap="round"/>`;
  return `<svg viewBox="0 0 200 300" width="200" height="300">
    <ellipse cx="100" cy="296" rx="60" ry="8" fill="#000" opacity=".15"/>
    <path d="M80 300 L86 160 L114 160 L120 300Z" fill="${trunk}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    ${marks}
    <path d="M30 170 Q-6 140 26 104 Q10 54 60 46 Q80 0 124 22 Q176 18 172 70 Q206 100 178 146 Q170 186 120 176 Q100 196 76 180 Q50 190 30 170Z" fill="${leaf}" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M150 60 Q180 100 160 150 Q130 176 100 170 Q150 140 150 60Z" fill="#000" opacity=".08"/>
    <path d="M50 70 Q60 52 82 52" stroke="#fff" stroke-width="6" fill="none" stroke-linecap="round" opacity=".35"/>
    ${fruit}
  </svg>`;
}

export function barrelSvg(): string {
  return `<svg viewBox="0 0 120 140" width="120" height="140">
    <path d="M18 20 Q8 76 18 134 L102 134 Q112 76 102 20Z" fill="#a1694a" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M14 44 H106 M12 104 H108" stroke="#546e7a" stroke-width="8"/>
    <path d="M40 22 Q34 76 40 132 M80 22 Q86 76 80 132" stroke="${OUT}" stroke-width="2.5" fill="none" opacity=".35"/>
    <ellipse cx="60" cy="20" rx="42" ry="9" fill="#bf8a63" stroke="${OUT}" stroke-width="5"/>
  </svg>`;
}

export function hillsSvg(): string {
  return `<svg viewBox="0 0 1600 260" width="1600" height="260">
    <path d="M0 260 Q160 80 380 150 Q560 40 800 140 Q1040 60 1220 150 Q1420 70 1600 160 L1600 260Z" fill="#a5d6a7"/>
    <path d="M0 260 Q260 150 520 200 Q760 130 1000 200 Q1260 150 1600 210 L1600 260Z" fill="#81c784"/>
  </svg>`;
}

export function fenceSvg(w: number): string {
  const n = Math.floor(w / 26);
  const posts = Array.from({ length: n }, (_, i) => `<path d="M${6 + i * 26} 44 V10 l8 -8 l8 8 V44Z" fill="#fff" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>`).join('');
  return `<svg viewBox="0 0 ${w} 48" width="${w}" height="48"><rect x="0" y="18" width="${w}" height="8" fill="#fff" stroke="${OUT}" stroke-width="3"/>${posts}</svg>`;
}

export function flowersSvg(colors: string[]): string {
  return `<svg viewBox="0 0 120 50" width="120" height="50">${colors
    .map((c, i) => {
      const x = 14 + i * 24;
      return `<path d="M${x} 48 V24" stroke="#388e3c" stroke-width="4"/><path d="M${x} 38 q-10 -2 -10 -10 q8 0 10 8" fill="#66bb6a"/>
        <circle cx="${x}" cy="20" r="9" fill="${c}" stroke="${OUT}" stroke-width="2.5"/><circle cx="${x}" cy="20" r="3.5" fill="#fff59d"/>`;
    })
    .join('')}</svg>`;
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
