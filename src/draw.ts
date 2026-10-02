// Shared drawing helpers: outline colour and hand-drawn wobbly shapes.

export const OUT = '#3a2c2a';

let seed = 7;
export const rnd = () => {
  seed = (seed * 16807) % 2147483647;
  return seed / 2147483647;
};

export type P = [number, number];

/** A closed polygon whose edges bow very slightly, like a hand-drawn line. */
export function wob(pts: P[], amp = 1.6): string {
  let d = `M${pts[0][0].toFixed(1)} ${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const len = Math.hypot(b[0] - a[0], b[1] - a[1]) || 1;
    const k = (rnd() * 2 - 1) * amp * Math.min(1, len / 60);
    const cx = (a[0] + b[0]) / 2 + (-(b[1] - a[1]) / len) * k;
    const cy = (a[1] + b[1]) / 2 + ((b[0] - a[0]) / len) * k;
    d += ` Q${cx.toFixed(1)} ${cy.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`;
  }
  return d + 'Z';
}


let uidN = 0;
/** Unique id for SVG defs (gradients, clip paths). */
export const uid = (p: string): string => `${p}${(++uidN).toString(36)}`;

/** Lightens (amt > 0) or darkens (amt < 0) a #rrggbb colour. */
export function tone(hex: string, amt: number): string {
  const n = parseInt(hex.slice(1), 16);
  const f = (c: number) => Math.round(amt > 0 ? c + (255 - c) * amt : c * (1 + amt));
  const r = f((n >> 16) & 255);
  const g = f((n >> 8) & 255);
  const b = f(n & 255);
  return `#${((1 << 24) | (r << 16) | (g << 8) | b).toString(16).slice(1)}`;
}

/** A vertical gradient (light at the top, darker at the bottom) and its fill reference. */
export function vgrad(base: string, light = 0.25, dark = -0.18): { def: string; fill: string } {
  const id = uid('g');
  return {
    def: `<linearGradient id="${id}" x1="0" y1="0" x2="0.35" y2="1"><stop offset="0" stop-color="${tone(base, light)}"/><stop offset="1" stop-color="${tone(base, dark)}"/></linearGradient>`,
    fill: `url(#${id})`,
  };
}
