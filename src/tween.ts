// Tiny requestAnimationFrame tween helpers. Only transform/opacity are animated.

export type Ease = (t: number) => number;

export const ease = {
  linear: (t: number) => t,
  inOut: (t: number) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  back: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
};

/** Runs fn(t) for t in [0,1] over `ms`, resolving when done. */
export function tween(ms: number, fn: (t: number) => void, e: Ease = ease.inOut): Promise<void> {
  return new Promise((resolve) => {
    const start = performance.now();
    const step = (now: number) => {
      const raw = Math.min(1, (now - start) / ms);
      fn(e(raw));
      if (raw < 1) requestAnimationFrame(step);
      else resolve();
    };
    requestAnimationFrame(step);
  });
}

export const wait = (ms: number): Promise<void> => new Promise((r) => setTimeout(r, ms));

export const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** A positioned element anchored at a point (ax, ay inside the element). */
export class Sprite {
  x = 0;
  y = 0;
  scale = 1;
  rot = 0;
  flip = false;

  constructor(
    public el: HTMLElement,
    public ax: number,
    public ay: number,
  ) {}

  at(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this.render();
  }

  render(): this {
    const sx = this.flip ? -this.scale : this.scale;
    this.el.style.transform = `translate3d(${(this.x - this.ax).toFixed(1)}px,${(this.y - this.ay).toFixed(1)}px,0) rotate(${this.rot.toFixed(1)}deg) scale(${sx.toFixed(3)},${this.scale.toFixed(3)})`;
    return this;
  }

  show(on = true): this {
    this.el.style.opacity = on ? '1' : '0';
    return this;
  }

  /** Move to (x,y) over ms with an optional hop height. */
  moveTo(x: number, y: number, ms: number, hop = 0, e: Ease = ease.inOut): Promise<void> {
    const x0 = this.x;
    const y0 = this.y;
    return tween(
      ms,
      (t) => {
        this.x = lerp(x0, x, t);
        this.y = lerp(y0, y, t) - Math.sin(Math.PI * t) * hop;
        this.render();
      },
      e,
    );
  }
}
