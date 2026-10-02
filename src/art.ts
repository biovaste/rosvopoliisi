// SVG art for items and small props. Everything is drawn in code.

import { OUT, tone, vgrad, wob } from './draw';

export { OUT };


// ---------- Items ----------

export type ItemKind = 'cake' | 'ball' | 'flowers' | 'bone' | 'icecream' | 'teddy' | 'gold' | 'gem' | 'jewels' | 'parcel' | 'watering';

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
    case 'parcel':
      return s(`<path d="${wob([[14, 30], [86, 30], [86, 88], [14, 88]], 1.2)}" fill="#d9a066" stroke="${OUT}" stroke-width="4"/>
        <path d="M14 30 L30 14 L100 14 L86 30Z" fill="#e8b97c" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M86 30 L100 14 L100 72 L86 88Z" fill="#c38a52" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M50 30 V88 M14 58 H86" stroke="#e53935" stroke-width="6"/>
        <path d="M40 24 Q50 10 50 30 Q50 10 60 24" fill="none" stroke="#e53935" stroke-width="4"/>`);
    case 'watering':
      return s(`<path d="M24 40 L76 40 L72 88 L28 88Z" fill="#4db6ac" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
        <path d="M74 52 L96 30" stroke="${OUT}" stroke-width="10" stroke-linecap="round"/><path d="M74 52 L96 30" stroke="#4db6ac" stroke-width="5" stroke-linecap="round"/>
        <ellipse cx="97" cy="28" rx="6" ry="4" fill="#80cbc4" stroke="${OUT}" stroke-width="2.5" transform="rotate(-45 97 28)"/>
        <path d="M30 40 Q50 6 70 40" fill="none" stroke="${OUT}" stroke-width="5"/>
        <path d="M32 56 H68" stroke="#fff" stroke-width="3" opacity=".5"/>`);
  }
}

// ---------- Scenery props ----------


/** Jail cell window drawn over the station picture: dark back, face layer, bars. */
export function jailWindowBack(): string {
  return `<svg viewBox="0 0 76 90" preserveAspectRatio="none"><rect x="0" y="0" width="76" height="90" fill="#35343c"/></svg>`;
}
export function jailWindowBars(): string {
  return `<svg viewBox="0 0 76 90" preserveAspectRatio="none">
    ${[8, 22, 38, 54, 68].map((x) => `<path d="M${x} 0 V90" stroke="${OUT}" stroke-width="7"/><path d="M${x} 0 V90" stroke="#8d8f9c" stroke-width="3.5"/>`).join('')}
    <rect x="1.5" y="1.5" width="73" height="87" fill="none" stroke="${OUT}" stroke-width="3"/>
  </svg>`;
}

export function carSvg(driverHead: string): string {
  const body = vgrad('#f4f6fa', 0.4, -0.12);
  const wheel = (cx: number) => `<g class="wheel" style="transform-origin:${cx}px 112px">
      <circle cx="${cx}" cy="112" r="22" fill="${OUT}"/><circle cx="${cx}" cy="112" r="17" fill="#3b3d48"/>
      <circle cx="${cx}" cy="112" r="10" fill="#cfd8dc" stroke="${OUT}" stroke-width="2"/>
      <path d="M${cx - 9} 112 H${cx + 9} M${cx} 103 V121" stroke="${OUT}" stroke-width="3"/>
      <path d="M${cx - 14} 102 A17 17 0 0 1 ${cx + 2} 95" stroke="#fff" stroke-width="2.5" fill="none" opacity=".35"/></g>`;
  const shape = 'M14 96 Q12 66 40 62 L72 30 Q80 22 96 22 L170 22 Q184 22 192 32 L218 62 Q248 66 248 96 L248 110 L14 110Z';
  return `<svg viewBox="0 0 260 140" width="260" height="140">
    <defs>${body.def}
      <clipPath id="cw-rear"><path d="M84 36 L124 36 L124 62 L60 62Z"/></clipPath>
      <clipPath id="cw-front"><path d="M134 36 L176 36 L202 62 L134 62Z"/></clipPath>
      <clipPath id="car-body"><path d="${shape}"/></clipPath>
    </defs>
    <ellipse cx="131" cy="132" rx="122" ry="9" fill="#000" opacity=".18"/>
    <path d="${shape}" fill="${body.fill}"/>
    <g clip-path="url(#car-body)">
      <rect x="10" y="76" width="244" height="20" fill="#2f5aa8"/><rect x="10" y="76" width="244" height="5" fill="#5d86d4"/>
      <rect x="10" y="98" width="244" height="14" fill="#000" opacity=".12"/>
      <path d="M44 66 Q120 58 214 66" stroke="#fff" stroke-width="4" fill="none" opacity=".8"/>
    </g>
    <path d="${shape}" fill="none" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M84 36 L124 36 L124 62 L60 62Z" fill="#a9d8f2"/>
    <path d="M134 36 L176 36 L202 62 L134 62Z" fill="#a9d8f2"/>
    <g clip-path="url(#cw-rear)"><g class="riders"></g></g>
    <g clip-path="url(#cw-front)"><g class="driver" transform="translate(140 24) scale(.46)">${driverHead}</g></g>
    <path d="M84 36 L124 36 L124 62 L60 62Z" fill="none" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M134 36 L176 36 L202 62 L134 62Z" fill="none" stroke="${OUT}" stroke-width="4" stroke-linejoin="round"/>
    <path d="M92 40 L100 40 L84 58 L76 58Z M144 40 L152 40 L140 58 L136 58Z" fill="#fff" opacity=".5"/>
    <path d="M128 64 V108" stroke="${OUT}" stroke-width="2.5" opacity=".5"/><rect x="134" y="70" width="12" height="4" rx="2" fill="${OUT}" opacity=".6"/>
    <g transform="translate(104 88)"><path d="M0 -10 L3 -3 L10 -3 L4 2 L6 9 L0 5 L-6 9 L-4 2 L-10 -3 L-3 -3Z" fill="#ffd54f" stroke="${OUT}" stroke-width="2"/></g>
    <rect x="236" y="98" width="18" height="8" rx="3" fill="#b0bec5" stroke="${OUT}" stroke-width="2.5"/>
    <rect x="8" y="98" width="16" height="8" rx="3" fill="#b0bec5" stroke="${OUT}" stroke-width="2.5"/>
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

const leafMarks = (pts: number[][], c: string) =>
  pts.map(([x, y]) => `<path d="M${x} ${y} q5 6 10 0" stroke="${c}" stroke-width="2.5" fill="none" stroke-linecap="round"/>`).join('');


/** Market stall back (posts and awning), 190 x 200. The counter is a separate hiding object. */

export function bushSvg(c = '#4caf50'): string {
  const g = vgrad(c, 0.22, -0.22);
  const blobs = [
    [40, 82, 34],
    [76, 56, 38],
    [118, 50, 40],
    [156, 70, 34],
    [100, 86, 40],
    [170, 92, 26],
    [26, 98, 22],
  ];
  const outline = blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r + 3.5}" fill="${OUT}"/>`).join('');
  const fill = blobs.map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${g.fill}"/>`).join('');
  return `<svg viewBox="0 0 200 120" width="200" height="120">
    <defs>${g.def}</defs>
    <ellipse cx="100" cy="116" rx="96" ry="7" fill="#1b3a10" opacity=".22"/>
    <path d="M8 118 L192 118 L186 100 L14 100Z" fill="${OUT}"/>
    ${outline}<rect x="12" y="96" width="176" height="20" fill="${tone(c, -0.25)}"/>${fill}
    <path d="M128 60 Q176 66 170 110 L120 112 Q150 96 128 60Z" fill="#000" opacity=".1"/>
    <circle cx="70" cy="44" r="14" fill="#fff" opacity=".2"/><circle cx="112" cy="34" r="10" fill="#fff" opacity=".2"/>
    ${leafMarks([[50, 74], [96, 70], [140, 82], [70, 96], [120, 100], [160, 64]], tone(c, -0.35))}
    ${[[56, 64], [126, 54], [104, 92], [150, 88]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5.5" fill="#e53935" stroke="${OUT}" stroke-width="1.5"/><circle cx="${x - 1.5}" cy="${y - 1.5}" r="1.6" fill="#fff"/>`).join('')}
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



export function barrelSvg(): string {
  return `<svg viewBox="0 0 120 140" width="120" height="140">
    <path d="M18 20 Q8 76 18 134 L102 134 Q112 76 102 20Z" fill="#a1694a" stroke="${OUT}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M14 44 H106 M12 104 H108" stroke="#546e7a" stroke-width="8"/>
    <ellipse cx="60" cy="20" rx="42" ry="9" fill="#bf8a63" stroke="${OUT}" stroke-width="5"/>
  </svg>`;
}





export function crateSvg(): string {
  const wood = vgrad('#d9a066', 0.2, -0.2);
  const box = (x: number, y: number, w: number, h: number) => {
    const p = wob([[x, y], [x + w, y], [x + w, y + h], [x, y + h]], 1);
    return `<g>
    <path d="${p}" fill="${wood.fill}" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M${x + 3} ${y + h / 3} H${x + w - 3} M${x + 3} ${(y + (2 * h) / 3).toFixed(1)} H${x + w - 3}" stroke="#9c6a36" stroke-width="2.5"/>
    <path d="M${x + 12} ${y + 10} q10 4 22 0 M${x + w - 34} ${y + h / 3 + 10} q10 4 20 0 M${x + 16} ${(y + (2 * h) / 3 + 10).toFixed(1)} q10 -4 20 0" stroke="#b07a40" stroke-width="2" fill="none"/>
    <path d="M${x + 8} ${y + 6} L${x + w - 8} ${y + h - 6}" stroke="#8a5a2b" stroke-width="7" stroke-linecap="round"/>
    <path d="M${x + 8} ${y + 6} L${x + w - 8} ${y + h - 6}" stroke="#c48a50" stroke-width="3" stroke-linecap="round"/>
    ${[[x + 6, y + 6], [x + w - 6, y + 6], [x + 6, y + h - 6], [x + w - 6, y + h - 6]].map(([a, b]) => `<circle cx="${a}" cy="${b}" r="2.2" fill="${OUT}"/>`).join('')}
    <path d="M${x + 3} ${y + 3} H${x + w - 3}" stroke="#fff" stroke-width="2.5" opacity=".35"/>
    <path d="${p}" fill="none" stroke="${OUT}" stroke-width="3.5"/></g>`;
  };
  return `<svg viewBox="0 0 160 140" width="160" height="140">
    <defs>${wood.def}</defs>
    <ellipse cx="80" cy="136" rx="80" ry="7" fill="#000" opacity=".18"/>
    ${box(40, 4, 74, 62)}${box(2, 66, 78, 70)}${box(80, 66, 76, 70)}
    <path d="M42 64 H112" stroke="#000" stroke-width="4" opacity=".12"/>
  </svg>`;
}


export function lampSvg(): string {
  return `<svg viewBox="0 0 60 260" width="60" height="260">
    <circle class="glow" cx="30" cy="34" r="34" fill="#fff59d" opacity=".55"/>
    <path d="M18 256 h24 l-4 -12 h-16Z" fill="#2e4a3e" stroke="${OUT}" stroke-width="2.5"/>
    <rect x="25" y="52" width="10" height="194" rx="4" fill="#3e5f50" stroke="${OUT}" stroke-width="3"/>
    <rect x="27" y="56" width="3" height="186" fill="#fff" opacity=".25"/>
    <path d="M22 120 h16 M23 200 h14" stroke="${OUT}" stroke-width="4" stroke-linecap="round"/>
    <path d="M30 54 q-14 -2 -14 -12" stroke="${OUT}" stroke-width="3" fill="none"/><path d="M30 54 q14 -2 14 -12" stroke="${OUT}" stroke-width="3" fill="none"/>
    <path d="M16 46 L44 46 L40 22 L20 22Z" fill="#fff4b8" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
    <path d="M30 22 V46" stroke="${OUT}" stroke-width="2"/>
    <path d="M14 22 L46 22 L30 8Z" fill="#3e5f50" stroke="${OUT}" stroke-width="3" stroke-linejoin="round"/>
    <circle cx="30" cy="6" r="3" fill="${OUT}"/>
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

export function slideSvg(): string {
  const slide = vgrad('#ba68c8', 0.25, -0.2);
  const post = vgrad('#42a5f5', 0.25, -0.2);
  return `<svg viewBox="0 0 220 170" width="220" height="170">
    <defs>${slide.def}${post.def}</defs>
    <ellipse cx="116" cy="166" rx="104" ry="7" fill="#000" opacity=".16"/>
    <path d="M30 168 V40 M70 168 V40" stroke="${OUT}" stroke-width="12" stroke-linecap="round"/>
    <path d="M30 168 V40 M70 168 V40" stroke="${post.fill}" stroke-width="7" stroke-linecap="round"/>
    <path d="M28 168 V44 M68 168 V44" stroke="#fff" stroke-width="2" opacity=".45"/>
    ${[72, 100, 128, 156].map((y) => `<path d="M30 ${y} H70" stroke="${OUT}" stroke-width="7"/><path d="M30 ${y} H70" stroke="#ffd54f" stroke-width="3.5"/>`).join('')}
    <path d="${wob([[20, 32], [82, 32], [82, 48], [20, 48]], 1)}" fill="#ef5350" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M24 36 H78" stroke="#fff" stroke-width="2.5" opacity=".4"/>
    <path d="M28 32 V8 M74 32 V8" stroke="${OUT}" stroke-width="4"/><path d="M24 10 Q51 -4 78 10" stroke="#ef5350" stroke-width="7" fill="none"/>
    <path d="M24 10 Q51 -4 78 10" stroke="${OUT}" stroke-width="2" fill="none" opacity=".5"/>
    <path d="M78 40 Q120 46 150 110 Q164 150 214 156 L212 170 Q150 168 134 120 Q112 64 78 56Z" fill="${slide.fill}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M84 50 Q118 58 140 112 Q152 146 200 156" stroke="#fff" stroke-width="4" fill="none" opacity=".45" stroke-linecap="round"/>
    <path d="M80 56 Q112 70 132 120 Q148 162 212 168" stroke="#000" stroke-width="5" fill="none" opacity=".12"/>
  </svg>`;
}


export function tunnelSvg(): string {
  const body = vgrad('#4fc3f7', 0.3, -0.2);
  return `<svg viewBox="0 0 170 96" width="170" height="96">
    <defs>${body.def}</defs>
    <ellipse cx="85" cy="92" rx="84" ry="7" fill="#000" opacity=".16"/>
    <path d="M20 92 Q14 22 74 16 L140 16 Q156 54 140 92Z" fill="${body.fill}" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M52 20 Q46 56 52 92 M84 16 Q78 54 84 92 M114 16 Q108 54 114 92" stroke="${OUT}" stroke-width="11"/>
    <path d="M52 20 Q46 56 52 92 M84 16 Q78 54 84 92 M114 16 Q108 54 114 92" stroke="#ffd54f" stroke-width="7"/>
    <path d="M36 34 Q60 22 130 22" stroke="#fff" stroke-width="5" fill="none" opacity=".45" stroke-linecap="round"/>
    <path d="M24 84 H140" stroke="#000" stroke-width="8" opacity=".12"/>
    <ellipse cx="140" cy="54" rx="22" ry="38" fill="#ffd54f" stroke="${OUT}" stroke-width="3.5"/>
    <ellipse cx="142" cy="56" rx="13" ry="28" fill="#2b2140"/>
    <ellipse cx="146" cy="60" rx="7" ry="18" fill="#000" opacity=".35"/>
  </svg>`;
}


export function planterSvg(): string {
  const pot = vgrad('#c0694f', 0.18, -0.22);
  const leaves = [10, 30, 52, 74, 96, 112]
    .map((x, i) => `<path d="M${x} 30 q${i % 2 ? 8 : -8} -14 ${i % 2 ? 2 : -2} -24 q${i % 2 ? -10 : 10} 10 ${i % 2 ? -2 : 2} 24Z" fill="#5aa04a" stroke="${OUT}" stroke-width="1.5"/>`)
    .join('');
  const flower = (x: number, y: number, c: string) =>
    `<g transform="translate(${x} ${y})">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6" rx="4" ry="6" fill="${c}" stroke="${OUT}" stroke-width="1.3" transform="rotate(${a})"/>`).join('')}<circle r="3.4" fill="#ffd54f" stroke="${OUT}" stroke-width="1.2"/></g>`;
  return `<svg viewBox="0 0 120 76" width="120" height="76">
    <defs>${pot.def}</defs>
    <ellipse cx="60" cy="74" rx="56" ry="4" fill="#000" opacity=".18"/>
    ${leaves}
    ${flower(18, 16, '#f06292')}${flower(40, 10, '#fff')}${flower(62, 16, '#ba68c8')}${flower(84, 10, '#ffd54f')}${flower(104, 18, '#ff8a65')}
    <path d="${wob([[2, 28], [118, 28], [108, 74], [12, 74]], 1.2)}" fill="${pot.fill}" stroke="${OUT}" stroke-width="3.5"/>
    <path d="${wob([[0, 26], [120, 26], [120, 38], [0, 38]], 0.8)}" fill="#d98a6c" stroke="${OUT}" stroke-width="3"/>
    <path d="M6 30 H114" stroke="#fff" stroke-width="2.5" opacity=".35"/>
    <path d="M30 48 q8 6 16 0 M70 56 q8 6 16 0" stroke="${OUT}" stroke-width="2" fill="none" opacity=".25"/>
  </svg>`;
}


export function sacksSvg(): string {
  const sack = (x: number, y: number, s: number, c: string) => {
    const g = vgrad(c, 0.18, -0.25);
    return `<g transform="translate(${x} ${y}) scale(${s})"><defs>${g.def}</defs>
    <path d="M6 20 Q0 58 34 60 Q68 58 62 20 Q50 10 34 14 Q18 10 6 20Z" fill="${g.fill}" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M12 30 l6 6 M22 40 l6 6 M40 28 l6 6 M48 42 l6 6 M14 48 l6 6" stroke="${OUT}" stroke-width="1.6" opacity=".25"/>
    <path d="M20 14 L34 2 L48 14" fill="${tone(c, 0.1)}" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M22 15 Q34 20 46 15" stroke="#8d6e63" stroke-width="4" fill="none"/>
    <path d="M12 24 Q20 18 28 20" stroke="#fff" stroke-width="3" fill="none" opacity=".35"/></g>`;
  };
  return `<svg viewBox="0 0 130 84" width="130" height="84">
    <ellipse cx="65" cy="80" rx="64" ry="6" fill="#000" opacity=".18"/>
    ${sack(4, 22, 0.95, '#d8b878')}${sack(62, 18, 1, '#c9a36a')}${sack(32, 8, 0.85, '#e0c48c')}
  </svg>`;
}


export function mailboxSvg(): string {
  const box = vgrad('#1e88e5', 0.25, -0.2);
  return `<svg viewBox="0 0 60 90" width="60" height="90">
    <defs>${box.def}</defs>
    <rect x="26" y="40" width="8" height="50" fill="#8d6040" stroke="${OUT}" stroke-width="2.5"/>
    <path d="M4 44 V18 Q4 4 30 4 Q56 4 56 18 V44Z" fill="${box.fill}" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M10 18 Q12 9 26 8" stroke="#fff" stroke-width="3" fill="none" opacity=".5" stroke-linecap="round"/>
    <path d="M14 24 H46" stroke="${OUT}" stroke-width="4.5" stroke-linecap="round"/>
    <path d="M4 38 H56" stroke="#000" stroke-width="5" opacity=".15"/>
    <path d="M56 14 V-6 L72 -2 L56 2" fill="#e53935" stroke="${OUT}" stroke-width="2.5"/>
  </svg>`;
}


export function stallBackSvg(): string {
  const stripes = Array.from({ length: 8 }, (_, i) => `<path d="M${6 + i * 22.5} 28 h22.5 v26 q-11 12 -22.5 0Z" fill="${i % 2 ? '#fff6ec' : '#e53935'}" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/>`).join('');
  return `<svg viewBox="0 0 190 200" width="190" height="200">
    <path d="M14 50 V196 M176 50 V196" stroke="${OUT}" stroke-width="11"/><path d="M14 50 V196 M176 50 V196" stroke="#a1694a" stroke-width="6"/>
    <path d="M12 52 V196 M174 52 V196" stroke="#fff" stroke-width="1.5" opacity=".35"/>
    <path d="${wob([[0, 30], [95, 2], [190, 30]], 1)}" fill="#e53935" stroke="${OUT}" stroke-width="3.5" stroke-linejoin="round"/>
    <path d="M20 24 L95 6" stroke="#fff" stroke-width="3" opacity=".4" stroke-linecap="round"/>
    ${stripes}
    <path d="M6 52 Q95 64 184 52" stroke="#000" stroke-width="6" fill="none" opacity=".1"/>
  </svg>`;
}


export function stallCounterSvg(): string {
  const wood = vgrad('#c8874f', 0.15, -0.22);
  const fruit = (x: number, y: number, c: string) =>
    `<circle cx="${x}" cy="${y}" r="9" fill="${c}" stroke="${OUT}" stroke-width="2.2"/><circle cx="${x - 3}" cy="${y - 3}" r="2.5" fill="#fff" opacity=".6"/><path d="M${x} ${y - 9} l2 -4" stroke="#5d4037" stroke-width="2"/>`;
  return `<svg viewBox="0 0 190 96" width="190" height="96">
    <defs>${wood.def}</defs>
    <ellipse cx="95" cy="92" rx="94" ry="5" fill="#000" opacity=".18"/>
    <path d="${wob([[6, 18], [184, 18], [184, 92], [6, 92]], 1.4)}" fill="${wood.fill}" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M6 44 H184 M6 68 H184" stroke="#9c6235" stroke-width="3"/>
    <path d="M24 32 q14 4 28 0 M110 56 q14 -4 30 0 M60 80 q12 4 24 0" stroke="#a96d3c" stroke-width="2" fill="none"/>
    <path d="${wob([[0, 8], [190, 8], [190, 22], [0, 22]], 1)}" fill="#e0a66a" stroke="${OUT}" stroke-width="3.5"/>
    <path d="M4 11 H186" stroke="#fff" stroke-width="2.5" opacity=".4"/>
    ${fruit(30, 2, '#ff7043')}${fruit(48, 4, '#ffca28')}${fruit(39, -8, '#ff8a65')}
    ${fruit(140, 2, '#9ccc65')}${fruit(158, 4, '#ef5350')}${fruit(149, -8, '#ef5350')}
  </svg>`;
}


export function benchSvg(): string {
  const wood = vgrad('#bf8457', 0.2, -0.2);
  return `<svg viewBox="0 0 140 70" width="140" height="70">
    <defs>${wood.def}</defs>
    <ellipse cx="70" cy="68" rx="66" ry="4" fill="#000" opacity=".18"/>
    <path d="M14 66 V30 M126 66 V30" stroke="${OUT}" stroke-width="8" stroke-linecap="round"/>
    <path d="M14 66 q-8 0 -8 -8 M126 66 q8 0 8 -8" stroke="${OUT}" stroke-width="4" fill="none"/>
    <path d="${wob([[4, 10], [136, 10], [136, 22], [4, 22]], 0.8)}" fill="${wood.fill}" stroke="${OUT}" stroke-width="3"/>
    <path d="${wob([[0, 36], [140, 36], [140, 48], [0, 48]], 0.8)}" fill="${wood.fill}" stroke="${OUT}" stroke-width="3"/>
    <path d="M8 13 H132 M4 39 H136" stroke="#fff" stroke-width="2" opacity=".4"/>
  </svg>`;
}


export function fenceSvg(w: number): string {
  const n = Math.floor(w / 24);
  const posts = Array.from(
    { length: n },
    (_, i) => `<path d="M${4 + i * 24} 42 V10 l7 -7 l7 7 V42Z" fill="#fff8ec" stroke="${OUT}" stroke-width="2.5" stroke-linejoin="round"/><path d="M${14 + i * 24} 12 V40" stroke="#c9b9a0" stroke-width="3"/>`,
  ).join('');
  return `<svg viewBox="0 0 ${w} 46" width="${w}" height="46"><ellipse cx="${w / 2}" cy="44" rx="${w / 2}" ry="3" fill="#000" opacity=".15"/><path d="M0 18 H${w} M0 32 H${w}" stroke="${OUT}" stroke-width="7"/><path d="M0 18 H${w} M0 32 H${w}" stroke="#efe3d0" stroke-width="3.5"/>${posts}</svg>`;
}

/** Handcuffs, 40 x 20, drawn at the rosvo's wrists. */
export function cuffsSvg(): string {
  return `<g class="cuffs"><circle cx="50" cy="132" r="7" fill="none" stroke="${OUT}" stroke-width="6"/><circle cx="50" cy="132" r="7" fill="none" stroke="#cfd8dc" stroke-width="3"/>
    <circle cx="70" cy="132" r="7" fill="none" stroke="${OUT}" stroke-width="6"/><circle cx="70" cy="132" r="7" fill="none" stroke="#cfd8dc" stroke-width="3"/>
    <path d="M57 132 H63" stroke="#90a4ae" stroke-width="3"/></g>`;
}
