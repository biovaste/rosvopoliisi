// SVG art for items and small props. Everything is drawn in code.

import { OUT, Pen, SW, out, shade, shine, tone, uid, vgrad, wob } from './draw';

export { OUT };


// ---------- Items ----------
// Drawn in the same soft "storybook" style as the people: round outlines,
// top-lit gradient fills from a Pen, a dark crescent on the lower right and a
// white shine on the upper left. Each call makes fresh gradient ids, so the
// same item can be on screen several times at once.

export type ItemKind = 'cake' | 'ball' | 'flowers' | 'bone' | 'icecream' | 'teddy' | 'gold' | 'gem' | 'jewels' | 'parcel' | 'watering' | 'yarn' | 'toolbox';

/** A four-pointed twinkle. */
const sparkle = (x: number, y: number, r: number) => {
  const k = r * 0.2;
  return `<path d="M${x} ${y - r} Q${x + k} ${y - k} ${x + r} ${y} Q${x + k} ${y + k} ${x} ${y + r} Q${x - k} ${y + k} ${x - r} ${y} Q${x - k} ${y - k} ${x} ${y - r}Z" fill="#fffbe0" ${out(0.4)}/>`;
};
/** Soft shadow on the ground under an item. */
const ground = (cx: number, cy: number, rx: number) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="4.5" fill="#000" opacity=".12"/>`;
/** A small round thing with a gradient, outline and a glint (cherry, pearl, pad). */
const bead = (p: Pen, x: number, y: number, r: number, c: string, k = 0.5) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.fill(c, 0.3, -0.15)}" ${out(k)}/><circle cx="${x - r * 0.35}" cy="${y - r * 0.38}" r="${(r * 0.3).toFixed(1)}" fill="#fff" opacity=".75"/>`;

function cake(p: Pen): string {
  const sprinkles = [
    [28, 48, '#ffd54f', 30],
    [40, 53, '#64b5f6', -20],
    [60, 53, '#81c784', 40],
    [72, 48, '#fff', -35],
    [50, 50, '#ffd54f', 80],
  ] as const;
  return `${ground(50, 91, 38)}
    <path d="M16 52 V80 Q16 90 50 90 Q84 90 84 80 V52Z" fill="${p.fill('#f2c27e')}" ${out()}/>
    <path d="M16 68 Q50 78 84 68 V74 Q50 84 16 74Z" fill="#fff4e0" ${out(0.45)}/>
    <circle cx="30" cy="80" r="2.6" fill="#e8577a"/><circle cx="50" cy="83" r="2.6" fill="#e8577a"/><circle cx="70" cy="80" r="2.6" fill="#e8577a"/>
    ${shade('M70 58 Q84 56 84 62 V80 Q84 89 62 90 Q78 80 70 58Z')}
    <path d="M14 51 Q14 38 50 38 Q86 38 86 51 Q86 57 81 57 Q77 66 72 58 Q65 62 59 58 Q53 68 46 58 Q39 63 33 58 Q27 66 22 57 Q14 57 14 51Z" fill="${p.fill('#f78fb6')}" ${out()}/>
    ${shine('M22 47 Q26 42 38 41')}
    ${sprinkles.map(([x, y, c, a]) => `<path d="M${x - 2.4} ${y} H${x + 2.4}" stroke="${c}" stroke-width="2.6" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`).join('')}
    ${bead(p, 33, 44, 5.5, '#e53935')}${bead(p, 67, 44, 5.5, '#e53935')}
    <rect x="45.5" y="18" width="9" height="29" rx="3" fill="${p.fill('#7ec8f0')}" ${out(0.7)}/>
    <path d="M46.5 27 L53.5 23 M46.5 35 L53.5 31 M46.5 43 L53.5 39" stroke="#fff" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M50 18 V14" stroke="${OUT}" stroke-width="2" stroke-linecap="round"/>
    <path d="M50 1 Q58 9 56.5 13.5 Q55 18 50 18 Q45 18 43.5 13.5 Q42 9 50 1Z" fill="${p.fill('#ffcf3d')}" ${out(0.65)}/>
    <path d="M50 8.5 Q53.5 12.5 52.5 14.5 Q51.5 16 50 16 Q48.5 16 47.5 14.5 Q46.5 12.5 50 8.5Z" fill="#ff8a3d"/>`;
}

function ball(p: Pen): string {
  const id = uid('bc');
  const [px, py] = [45, 46];
  const colors = ['#ef5350', '#fff8ee', '#42a5f5', '#fff8ee', '#ffd54f', '#fff8ee'];
  const at = (a: number, r: number) => [px + Math.cos((a * Math.PI) / 180) * r, py + Math.sin((a * Math.PI) / 180) * r].map((v) => v.toFixed(1)).join(' ');
  // Coloured wedges are wider than the white ones between them.
  const starts = [-75, 5, 45, 125, 165, 245, 285];
  const wedges = colors
    .map((c, i) => {
      const [a0, a1] = [starts[i], starts[i + 1]];
      return `<path d="M${px} ${py} Q${at(a0 + 8, 40)} ${at(a0, 80)} L${at(a1, 80)} Q${at(a1 + 8, 40)} ${px} ${py}Z" fill="${p.fill(c, 0.1, -0.1)}"/>`;
    })
    .join('');
  const seams = starts.slice(0, 6).map((a) => `M${px} ${py} Q${at(a + 8, 40)} ${at(a, 80)}`).join(' ');
  return `${ground(50, 92, 30)}
    <clipPath id="${id}"><circle cx="50" cy="52" r="36"/></clipPath>
    <g clip-path="url(#${id})">${wedges}
      <path d="${seams}" fill="none" stroke="${OUT}" stroke-width="1.6" opacity=".45"/>
      ${shade('M86 52 A36 36 0 0 1 14 52 Q20 80 50 82 Q80 80 86 52Z', 0.12)}
      <path d="M78 22 A36 36 0 0 1 82 76 Q92 46 78 22Z" fill="#000" opacity=".08"/>
    </g>
    <circle cx="${px}" cy="${py}" r="5.5" fill="#fff8ee" ${out(0.5)}/>
    <circle cx="50" cy="52" r="36" fill="none" ${out()}/>
    ${shine('M21 46 Q22 32 34 24', 3.5)}<circle cx="27" cy="58" r="2.2" fill="#fff" opacity=".5"/>`;
}

function flowers(p: Pen): string {
  const flower = (x: number, y: number, r: number, c: string) => {
    const f = p.fill(c, 0.22, -0.1);
    const petals = [0, 72, 144, 216, 288]
      .map((a) => `<circle cx="0" cy="${-r}" r="${r * 0.82}" fill="${f}" ${out(0.55)} transform="rotate(${a})"/>`)
      .join('');
    const inner = [0, 72, 144, 216, 288].map((a) => `<circle cx="0" cy="${-r}" r="${r * 0.82 - 1}" fill="${f}" transform="rotate(${a})"/>`).join('');
    return `<g transform="translate(${x} ${y})">${petals}${inner}
      <circle r="${r * 0.62}" fill="${p.fill('#ffd54f', 0.3, -0.15)}" ${out(0.5)}/><circle cx="${-r * 0.2}" cy="${-r * 0.22}" r="${r * 0.18}" fill="#fff" opacity=".7"/></g>`;
  };
  const stems = 'M50 76 Q30 56 28 40 M50 76 L50 24 M50 76 Q70 56 72 40 M50 76 Q40 56 38 22 M50 76 Q62 56 64 22';
  return `${ground(50, 94, 18)}
    <path d="${stems}" fill="none" stroke="${OUT}" stroke-width="7" stroke-linecap="round"/>
    <path d="${stems}" fill="none" stroke="#4caf50" stroke-width="3.5" stroke-linecap="round"/>
    <path d="M44 60 Q24 58 16 44 Q34 42 46 56Z" fill="${p.fill('#5cb860')}" ${out(0.6)}/>
    <path d="M56 60 Q76 58 84 44 Q66 42 54 56Z" fill="${p.fill('#5cb860')}" ${out(0.6)}/>
    ${flower(38, 22, 7, '#fff3f6')}${flower(64, 22, 7, '#ffb74d')}
    ${flower(26, 40, 8.5, '#f06292')}${flower(74, 40, 8.5, '#ba68c8')}${flower(50, 30, 9.5, '#ef5350')}
    <path d="M24 56 Q50 66 76 56 L57 93 Q50 96 43 93Z" fill="${p.fill('#8fd0f5')}" ${out()}/>
    <path d="M24 56 Q50 66 76 56 L72 64 Q50 72 28 64Z" fill="#fff" opacity=".35"/>
    ${shade('M64 62 L76 56 L57 93 Q54 94.5 52 95 Q62 78 64 62Z', 0.12)}
    ${shine('M33 66 L44 87')}
    <path d="M50 80 Q36 70 35 78 Q35 86 50 80Z M50 80 Q64 70 65 78 Q65 86 50 80Z" fill="${p.fill('#f06292')}" ${out(0.55)}/>
    <path d="M48 82 L43 92 L47 91 M52 82 L57 92 L53 91" fill="none" stroke="#f06292" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <circle cx="50" cy="80" r="3.6" fill="#e04a7d" ${out(0.5)}/>`;
}

function bone(): string {
  const shapes = `<circle cx="27" cy="42" r="10"/><circle cx="27" cy="58" r="10"/><circle cx="73" cy="42" r="10"/><circle cx="73" cy="58" r="10"/><rect x="27" y="42" width="46" height="16"/>`;
  return `${ground(50, 84, 34)}
    <g transform="rotate(-24 50 50)">
      <g fill="${OUT}" stroke="${OUT}" stroke-width="${SW * 2}" stroke-linejoin="round">${shapes}</g>
      <g fill="#fbecd0">${shapes}</g>
      ${shade('M30 66 Q50 60 70 66 Q72 68 73 68 Q82 68 83 58 Q84 66 76 69 Q68 70 66 64 Q50 61 34 64 Q30 70 24 68 Q30 68 30 66Z', 0.1)}
      ${shade('M80 50 Q85 54 82 62 Q78 66 74 67 Q81 62 80 50Z', 0.1)}
      ${shine('M20 38 Q21 33 27 32')}${shine('M66 37 Q67 33 72 32', 2.5)}${shine('M36 46 H62', 2.5)}
    </g>`;
}

function icecream(p: Pen): string {
  const id = uid('ic');
  const coneD = 'M30 54 L50 96 L70 54Z';
  const waffle = [0, 1, 2, 3, 4, 5].map((i) => `M${20 + i * 9} 50 L${44 + i * 9} 98 M${80 - i * 9} 50 L${56 - i * 9} 98`).join(' ');
  const sprinkles = [
    [36, 46, '#ffd54f', 30],
    [46, 50, '#64b5f6', -30],
    [58, 46, '#fff', 60],
    [64, 51, '#81c784', -10],
  ] as const;
  return `${ground(50, 97, 10)}
    <clipPath id="${id}"><path d="${coneD}"/></clipPath>
    <path d="${coneD}" fill="${p.fill('#e3a857')}"/>
    <g clip-path="url(#${id})"><path d="${waffle}" stroke="#b5772f" stroke-width="2.2"/>${shade('M60 54 L70 54 L50 96Z', 0.12)}</g>
    <path d="${coneD}" fill="none" ${out()}/>
    <path d="M26 52 Q22 32 50 31 Q78 32 74 52 Q70 59 64 54 Q60 63 54 56 Q48 61 44 56 Q38 62 34 55 Q30 58 26 52Z" fill="${p.fill('#f8a5c2')}" ${out()}/>
    ${shade('M64 36 Q76 40 74 52 Q70 59 64 54 Q72 48 64 36Z')}
    ${sprinkles.map(([x, y, c, a]) => `<path d="M${x - 2.2} ${y} H${x + 2.2}" stroke="${c}" stroke-width="2.4" stroke-linecap="round" transform="rotate(${a} ${x} ${y})"/>`).join('')}
    <path d="M31 33 Q28 14 50 13 Q72 14 69 33 Q63 38 56 35 Q50 39 44 35 Q37 38 31 33Z" fill="${p.fill('#a8e6cf')}" ${out()}/>
    ${shade('M60 17 Q71 21 69 33 Q64 37 59 35 Q66 28 60 17Z')}
    ${shine('M36 26 Q37 19 45 17')}${shine('M31 46 Q32 40 38 37', 2.5)}
    <path d="M53 7 Q55 2 61 1" fill="none" stroke="${OUT}" stroke-width="2.2" stroke-linecap="round"/>
    ${bead(p, 51, 10, 6, '#e53935', 0.6)}`;
}

function teddy(p: Pen): string {
  const fur = p.fill('#c08a5b');
  const light = p.fill('#f0d2ab', 0.2, -0.08);
  const stitch = `fill="none" stroke="${OUT}" stroke-width="1.3" stroke-dasharray="2.4 2.4" stroke-linecap="round" opacity=".55"`;
  return `${ground(50, 95, 32)}
    <circle cx="31" cy="22" r="9.5" fill="${fur}" ${out()}/><circle cx="69" cy="22" r="9.5" fill="${fur}" ${out()}/>
    <circle cx="31.5" cy="22.5" r="4.6" fill="${light}"/><circle cx="68.5" cy="22.5" r="4.6" fill="${light}"/>
    <ellipse cx="50" cy="72" rx="23" ry="19" fill="${fur}" ${out()}/>
    <ellipse cx="50" cy="75" rx="12" ry="11" fill="${light}"/>
    <ellipse cx="50" cy="75" rx="9" ry="8" ${stitch}/>
    ${shade('M64 58 Q76 66 72 80 Q66 90 54 91 Q70 80 64 58Z')}
    <ellipse cx="25" cy="66" rx="7.5" ry="11.5" fill="${fur}" ${out()} transform="rotate(25 25 66)"/>
    <ellipse cx="75" cy="66" rx="7.5" ry="11.5" fill="${fur}" ${out()} transform="rotate(-25 75 66)"/>
    <ellipse cx="32" cy="87" rx="10.5" ry="8.5" fill="${fur}" ${out()}/><ellipse cx="68" cy="87" rx="10.5" ry="8.5" fill="${fur}" ${out()}/>
    <ellipse cx="32" cy="87.5" rx="5.5" ry="4.5" fill="${light}"/><ellipse cx="68" cy="87.5" rx="5.5" ry="4.5" fill="${light}"/>
    <circle cx="50" cy="37" r="21" fill="${fur}" ${out()}/>
    ${shade('M62 22 Q74 30 70 44 Q65 55 52 58 Q68 48 62 22Z')}
    ${shine('M33 30 Q35 22 43 19')}
    <path d="M50 16 V22" ${stitch}/>
    <ellipse cx="50" cy="45" rx="10.5" ry="8" fill="${light}" ${out(0.45)}/>
    <ellipse cx="37" cy="44" rx="4" ry="2.6" fill="#f08a8a" opacity=".55"/><ellipse cx="63" cy="44" rx="4" ry="2.6" fill="#f08a8a" opacity=".55"/>
    <circle cx="42" cy="34" r="3" fill="${OUT}"/><circle cx="58" cy="34" r="3" fill="${OUT}"/>
    <circle cx="41" cy="33" r="1" fill="#fff"/><circle cx="57" cy="33" r="1" fill="#fff"/>
    <path d="M45.5 41 Q50 39 54.5 41 Q53 45.5 50 45.5 Q47 45.5 45.5 41Z" fill="${OUT}"/>
    <path d="M50 45.5 V48 M46 48 Q50 51.5 54 48" fill="none" stroke="${OUT}" stroke-width="1.8" stroke-linecap="round"/>
    <path d="M50 58 L40 52.5 Q38 58 40 63.5Z M50 58 L60 52.5 Q62 58 60 63.5Z" fill="${p.fill('#e53935')}" ${out(0.55)}/>
    <circle cx="50" cy="58" r="3.4" fill="#d32f2f" ${out(0.5)}/>`;
}

function gold(p: Pen): string {
  const bar = (x: number, y: number) =>
    `<path d="M${x + 5} ${y} H${x + 31} L${x + 36} ${y + 7} V${y + 17} H${x} V${y + 7}Z" fill="${p.fill('#f7b818', 0.15, -0.15)}" ${out()}/>
    <path d="M${x + 5} ${y} H${x + 31} L${x + 36} ${y + 7} H${x}Z" fill="${p.fill('#ffe27a', 0.3, -0.05)}" ${out(0.5)}/>
    ${shade(`M${x + 27} ${y + 8.5} H${x + 34.3} V${y + 15.3} H${x + 27}Z`, 0.09)}
    ${shine(`M${x + 8} ${y + 3.5} H${x + 22}`, 2.5)}`;
  const coin = (x: number, y: number, r: number) =>
    `<circle cx="${x}" cy="${y}" r="${r}" fill="${p.fill('#f7b818', 0.2, -0.15)}" ${out()}/>
    <circle cx="${x}" cy="${y}" r="${r - 4}" fill="none" stroke="#d48f0a" stroke-width="2"/>
    <path d="M${x} ${y - 4} L${x + 1.3} ${y - 1.2} L${x + 4} ${y - 1} L${x + 2} ${y + 1} L${x + 2.6} ${y + 4} L${x} ${y + 2.4} L${x - 2.6} ${y + 4} L${x - 2} ${y + 1} L${x - 4} ${y - 1} L${x - 1.3} ${y - 1.2}Z" fill="#fff3c0"/>
    ${shine(`M${x - r + 4} ${y - 2} Q${x - r + 5} ${y - r + 5} ${x - 2} ${y - r + 3}`, 2.2)}`;
  return `${ground(50, 87, 42)}
    ${bar(13, 66)}${bar(51, 66)}${bar(32, 49)}
    ${coin(84, 74, 11)}
    <ellipse cx="22" cy="88" rx="12" ry="5" fill="#d48f0a" ${out(0.7)}/><ellipse cx="22" cy="85" rx="12" ry="5" fill="${p.fill('#ffd54f', 0.3, -0.1)}" ${out(0.7)}/>
    ${sparkle(80, 40, 8)}${sparkle(18, 50, 5.5)}${sparkle(64, 36, 4)}`;
}

function gem(p: Pen): string {
  const outline = 'M22 36 L34 17 H66 L78 36 L50 89Z';
  return `${ground(50, 93, 16)}
    <path d="${outline}" fill="${p.fill('#4fc3f7', 0.3, -0.25)}"/>
    <path d="M22 36 L34 17 L40 36Z" fill="#fff" opacity=".35"/>
    <path d="M34 17 H66 L60 36 H40Z" fill="#fff" opacity=".5"/>
    <path d="M66 17 L78 36 H60Z" fill="#000" opacity=".08"/>
    <path d="M22 36 H40 L50 89Z" fill="#fff" opacity=".22"/>
    <path d="M60 36 H78 L50 89Z" fill="#000" opacity=".16"/>
    <path d="M22 36 H78 M34 17 L40 36 L50 89 M66 17 L60 36 L50 89" fill="none" ${out(0.5)}/>
    <path d="${outline}" fill="none" ${out()}/>
    ${shine('M28 32 L34 23', 2.5)}${shine('M44 22 H52', 2.5)}${shine('M32 42 L42 62', 2.5)}
    ${sparkle(82, 16, 8.5)}${sparkle(15, 60, 5.5)}${sparkle(81, 62, 4.5)}`;
}

function jewels(p: Pen): string {
  const pearls = Array.from({ length: 13 }, (_, i) => {
    const a = (i / 12) * Math.PI;
    return [50 + Math.cos(a) * 33, 12 + Math.sin(a) * 50];
  });
  const pearl = p.fill('#fff6ea', 0.4, -0.12);
  return `${ground(50, 94, 30)}
    <path d="M83 12 A33 50 0 0 1 17 12" fill="none" stroke="${OUT}" stroke-width="1.6"/>
    ${pearls.map(([x, y]) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="5.4" fill="${pearl}" ${out(0.5)}/><circle cx="${(x - 1.8).toFixed(1)}" cy="${(y - 1.8).toFixed(1)}" r="1.5" fill="#fff"/>`).join('')}
    <path d="M50 92 Q35 82 36 73 Q37 66 43.5 66.5 Q48 67 50 71.5 Q52 67 56.5 66.5 Q63 66 64 73 Q65 82 50 92Z" fill="${p.fill('#e53950', 0.25, -0.2)}" ${out()}/>
    ${shade('M60 69 Q65 74 62 81 Q58 87 51 91 Q60 80 60 69Z', 0.12)}
    ${shine('M40 74 Q40 70 44 69.5', 2.5)}
    <circle cx="50" cy="66" r="3.4" fill="${p.fill('#ffca28', 0.3, -0.15)}" ${out(0.5)}/>
    <circle cx="17" cy="82" r="8" fill="none" stroke="${OUT}" stroke-width="7"/><circle cx="17" cy="82" r="8" fill="none" stroke="#ffca28" stroke-width="3.2"/>
    <path d="M14 73.5 Q16 71 17 71 Q18 71 20 73.5" fill="none" stroke="#fff3c0" stroke-width="1.4" stroke-linecap="round"/>
    <path d="M11 70 L14 65 H20 L23 70 L17 77Z" fill="${p.fill('#64b5f6', 0.3, -0.2)}" ${out(0.5)}/>
    <path d="M14 65 L16 70 H11 M20 65 L18 70 H23" fill="none" stroke="#fff" stroke-width="1.2" opacity=".6"/>
    ${sparkle(84, 74, 7)}${sparkle(50, 40, 4.5)}`;
}

function parcel(p: Pen): string {
  const rib = '#e53935';
  const ribbon = p.fill(rib, 0.2, -0.15);
  return `${ground(52, 92, 40)}
    <path d="M14 40 H70 V90 H14Z" fill="${p.fill('#d9a066')}" ${out()}/>
    <path d="M70 40 L86 25 V75 L70 90Z" fill="${p.fill('#b98049', 0.1, -0.15)}" ${out()}/>
    <path d="M14 40 L30 25 H86 L70 40Z" fill="${p.fill('#ecc08a', 0.2, -0.05)}" ${out()}/>
    ${shine('M18 46 V82')}
    <path d="M38.5 40 H45.5 V90 H38.5Z M14 61 H70 V68 H14Z" fill="${ribbon}" ${out(0.45)}/>
    <path d="M70 61 L86 46 V53 L70 68Z" fill="${tone(rib, -0.2)}" ${out(0.45)}/>
    <path d="M38.5 40 L54.5 25 H61.5 L45.5 40Z" fill="${ribbon}" ${out(0.45)}/>
    <path d="M23 82 L32 82 M23 77 L29 77" stroke="${OUT}" stroke-width="1.6" stroke-linecap="round" opacity=".35"/>
    <path d="M49 32 Q33 14 28 24 Q25 34 49 32Z M51 32 Q67 14 72 24 Q75 34 51 32Z" fill="${ribbon}" ${out(0.6)}/>
    <path d="M47 31 Q36 22 33 26 M53 31 Q64 22 67 26" fill="none" stroke="#000" stroke-width="1.6" opacity=".18" stroke-linecap="round"/>
    <path d="M47 34 L40 44 L44.5 43 L45 47 L50 36Z M53 34 L60 44 L55.5 43 L55 47 L50 36Z" fill="${ribbon}" ${out(0.5)}/>
    <ellipse cx="50" cy="32" rx="5" ry="4.2" fill="${p.fill(rib, 0.25, -0.15)}" ${out(0.6)}/>
    ${shine('M32 24 Q32 21 35 20', 2)}`;
}

function watering(p: Pen): string {
  const body = p.fill('#4db6ac', 0.18, -0.15);
  const handle = 'M58 44 Q58 18 38 20 Q16 23 24 68';
  return `${ground(50, 93, 34)}
    <path d="${handle}" fill="none" stroke="${OUT}" stroke-width="${7 + SW * 2}" stroke-linecap="round"/>
    <path d="${handle}" fill="none" stroke="#3fa196" stroke-width="7" stroke-linecap="round"/>
    ${shine('M28 36 Q30 25 40 23', 2.5)}
    <path d="M68 72 L84 38 L91 43 L72 84Z" fill="${body}" ${out()}/>
    <g transform="rotate(36 88 39)"><rect x="79" y="33" width="16" height="11" rx="4" fill="${p.fill('#80cbc4', 0.2, -0.15)}" ${out(0.8)}/>
      <circle cx="93" cy="36.5" r="1" fill="${OUT}"/><circle cx="93" cy="40.5" r="1" fill="${OUT}"/></g>
    <path d="M28 48 Q28 41 35 41 H67 Q74 41 74 48 L75 84 Q75 91 68 91 H34 Q27 91 27 84Z" fill="${body}" ${out()}/>
    <ellipse cx="44" cy="44.5" rx="10" ry="3" fill="#2f7f77" ${out(0.5)}/>
    <path d="M27.6 53 H74.4" stroke="#000" stroke-width="3" opacity=".12"/>
    ${shade('M64 44 Q74 46 74 60 L74 84 Q73 90 65 90 Q70 70 64 44Z', 0.12)}
    ${shine('M33 58 V82', 3.5)}
    <g transform="translate(51 70)">${[0, 72, 144, 216, 288].map((a) => `<ellipse cx="0" cy="-6" rx="3.6" ry="5.4" fill="#fff8ee" ${out(0.35)} transform="rotate(${a})"/>`).join('')}
      <circle r="3" fill="#ffd54f" ${out(0.35)}/></g>
    <path d="M93 53 Q96 58 93 60 Q90 58 93 53Z M86 57 Q89 62 86 64 Q83 62 86 57Z" fill="#7cc8f2" ${out(0.35)}/>`;
}

function yarn(p: Pen): string {
  const id = uid('yc');
  const c = '#ec6fa0';
  const dark = tone(c, -0.3);
  const needle = (d: string) =>
    `<path d="${d}" stroke="${OUT}" stroke-width="6.5" stroke-linecap="round"/><path d="${d}" stroke="#d6dde2" stroke-width="3" stroke-linecap="round"/>`;
  const thread = 'M70 74 Q88 76 87 86 Q86 94 96 92';
  const wraps = [
    'M14 46 Q46 30 76 50', 'M16 60 Q46 42 78 64', 'M22 74 Q48 56 74 78',
    'M30 24 Q24 54 38 84', 'M46 22 Q38 54 52 86', 'M62 26 Q54 56 66 82',
  ].join(' ');
  return `${ground(48, 89, 30)}
    ${needle('M58 32 L78 8')}${needle('M64 36 L90 20')}
    <circle cx="78" cy="8" r="4.2" fill="${p.fill('#ffca28', 0.3, -0.15)}" ${out(0.5)}/><circle cx="90" cy="20" r="4.2" fill="${p.fill('#64b5f6', 0.3, -0.15)}" ${out(0.5)}/>
    <clipPath id="${id}"><circle cx="46" cy="56" r="30"/></clipPath>
    <circle cx="46" cy="56" r="30" fill="${p.fill(c, 0.2, -0.15)}"/>
    <g clip-path="url(#${id})">
      <path d="${wraps}" fill="none" stroke="${dark}" stroke-width="2.4" stroke-linecap="round"/>
      <path d="${wraps}" fill="none" stroke="#fff" stroke-width="1.2" opacity=".35" transform="translate(-1.5 -1.5)"/>
      ${shade('M76 56 A30 30 0 0 1 16 56 Q22 80 46 82 Q70 80 76 56Z', 0.12)}
    </g>
    <circle cx="46" cy="56" r="30" fill="none" ${out()}/>
    <path d="${thread}" fill="none" stroke="${OUT}" stroke-width="${3 + SW * 1.4}" stroke-linecap="round"/>
    <path d="${thread}" fill="none" stroke="${c}" stroke-width="3" stroke-linecap="round"/>
    ${shine('M24 44 Q27 34 37 29', 3.5)}`;
}

function toolbox(p: Pen): string {
  const red = p.fill('#e5463f', 0.18, -0.15);
  const steel = p.fill('#b0bec5', 0.3, -0.15);
  const handle = 'M38 40 Q38 24 50 24 Q62 24 62 40';
  return `${ground(50, 92, 42)}
    <rect x="20" y="16" width="11" height="26" rx="4.5" fill="${p.fill('#ffca28', 0.25, -0.15)}" ${out(0.7)}/>
    <path d="M23.5 21 V36 M27.5 21 V36" stroke="#000" stroke-width="1.6" opacity=".18" stroke-linecap="round"/>
    <path d="M74 42 V28" stroke="${OUT}" stroke-width="${6 + SW * 1.4}" stroke-linecap="round"/><path d="M74 42 V28" stroke="#b0bec5" stroke-width="6" stroke-linecap="round"/>
    <path d="M67 26 Q66 17 70.5 15 V21 H77.5 V15 Q82 17 81 26 Q79 31 74 31 Q69 31 67 26Z" fill="${steel}" ${out(0.7)}/>
    <path d="${handle}" fill="none" stroke="${OUT}" stroke-width="${6 + SW * 2}" stroke-linecap="round"/>
    <path d="${handle}" fill="none" stroke="#78909c" stroke-width="6" stroke-linecap="round"/>
    ${shine('M41 34 Q42 28 48 27', 2)}
    <path d="M12 48 H88 V84 Q88 91 81 91 H19 Q12 91 12 84Z" fill="${red}" ${out()}/>
    ${shade('M76 52 H88 V84 Q88 91 81 91 H64 Q78 82 76 52Z', 0.12)}
    <path d="M9 44 Q9 38 15 38 H85 Q91 38 91 44 V52 Q91 55 88 55 H12 Q9 55 9 52Z" fill="${red}" ${out()}/>
    ${shine('M15 43 H58', 2.5)}${shine('M18 62 V82')}
    <path d="M14 70 H86" stroke="#000" stroke-width="2.5" opacity=".12"/>
    <rect x="43" y="50" width="14" height="12" rx="3" fill="${steel}" ${out(0.6)}/>
    <circle cx="50" cy="56" r="1.8" fill="${OUT}"/>`;
}

const ITEM_DRAW: Record<ItemKind, (p: Pen) => string> = { cake, ball, flowers, bone, icecream, teddy, gold, gem, jewels, parcel, watering, yarn, toolbox };

export function itemSvg(kind: ItemKind): string {
  const p = new Pen();
  const inner = ITEM_DRAW[kind](p);
  return `<svg viewBox="0 0 100 100" width="100" height="100">${p.flush()}${inner}</svg>`;
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


/** Two wooden barrels on the market cobbles, 116 x 100. */
export function barrelsSvg(): string {
  const barrel = (x: number, y: number, w: number, h: number, c: string) => {
    const g = vgrad(c, 0.18, -0.25);
    const r = w * 0.12;
    return `<g><defs>${g.def}</defs>
      <path d="M${x + r} ${y} H${x + w - r} Q${x + w + r} ${y + h / 2} ${x + w - r} ${y + h} H${x + r} Q${x - r} ${y + h / 2} ${x + r} ${y}Z" fill="${g.fill}" stroke="${OUT}" stroke-width="3.5"/>
      <path d="M${x + w * 0.35} ${y + 2} Q${x + w * 0.3} ${y + h / 2} ${x + w * 0.35} ${y + h - 2} M${x + w * 0.65} ${y + 2} Q${x + w * 0.7} ${y + h / 2} ${x + w * 0.65} ${y + h - 2}" stroke="${OUT}" stroke-width="1.6" fill="none" opacity=".3"/>
      <path d="M${x - r * 0.55} ${y + h * 0.28} H${x + w + r * 0.55} M${x - r * 0.55} ${y + h * 0.72} H${x + w + r * 0.55}" stroke="#6d6a75" stroke-width="6"/>
      <path d="M${x - r * 0.55} ${y + h * 0.28} H${x + w + r * 0.55} M${x - r * 0.55} ${y + h * 0.72} H${x + w + r * 0.55}" stroke="${OUT}" stroke-width="1.5" opacity=".5"/>
      <ellipse cx="${x + w / 2}" cy="${y + 1}" rx="${w / 2 - r}" ry="5" fill="${tone(c, 0.15)}" stroke="${OUT}" stroke-width="3"/>
      <path d="M${x + w * 0.2} ${y + h * 0.4} Q${x + w * 0.18} ${y + h * 0.55} ${x + w * 0.22} ${y + h * 0.62}" stroke="#fff" stroke-width="3" fill="none" opacity=".35" stroke-linecap="round"/></g>`;
  };
  const apples = [[30, 18, '#e53935'], [42, 14, '#ffca28'], [36, 9, '#ef5350']]
    .map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="7" fill="${c}" stroke="${OUT}" stroke-width="2"/><circle cx="${Number(x) - 2}" cy="${Number(y) - 2}" r="2" fill="#fff" opacity=".6"/>`)
    .join('');
  return `<svg viewBox="0 0 116 100" width="116" height="100" style="overflow:visible">
    <ellipse cx="58" cy="96" rx="58" ry="6" fill="#000" opacity=".18"/>
    ${barrel(62, 30, 46, 66, '#b9773f')}${barrel(8, 22, 54, 76, '#c8874f')}${apples}
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

/** Handcuffs, 40 x 20, drawn at the rosvo's wrists. The rings stay at 50,132 and 70,132. */
export function cuffsSvg(): string {
  const ring = (x: number) => `<circle cx="${x}" cy="132" r="7" fill="none" stroke="${OUT}" stroke-width="6.5"/><circle cx="${x}" cy="132" r="7" fill="none" stroke="#cfd8dc" stroke-width="3.2"/>
    <path d="M${x - 6.6} 129.6 A7 7 0 0 1 ${x - 1.2} 125.1" fill="none" stroke="#fff" stroke-width="1.6" stroke-linecap="round" opacity=".8"/>
    <path d="M${x + 6.6} 134.4 A7 7 0 0 1 ${x + 1.2} 138.9" fill="none" stroke="#78909c" stroke-width="1.6" stroke-linecap="round"/>`;
  return `<g class="cuffs">${ring(50)}${ring(70)}
    <ellipse cx="58.3" cy="132" rx="2.4" ry="1.7" fill="none" stroke="${OUT}" stroke-width="2.6"/><ellipse cx="61.7" cy="132" rx="2.4" ry="1.7" fill="none" stroke="${OUT}" stroke-width="2.6"/>
    <ellipse cx="58.3" cy="132" rx="2.4" ry="1.7" fill="none" stroke="#b0bec5" stroke-width="1.1"/><ellipse cx="61.7" cy="132" rx="2.4" ry="1.7" fill="none" stroke="#b0bec5" stroke-width="1.1"/></g>`;
}
