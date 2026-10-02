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

