// Visual effects: touch ripples, confetti, sparkles and the hint hand.

import type { Pt } from './layout';
import type { Scene } from './scene';
import { lerp } from './tween';

const COLORS = ['#ffd54f', '#f06292', '#64b5f6', '#81c784', '#ba68c8', '#ff8a65', '#ffffff'];

function spawn(fx: HTMLElement, cls: string, x: number, y: number): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  d.style.transform = `translate3d(${x}px,${y}px,0)`;
  fx.appendChild(d);
  return d;
}

/** Immediate feedback ring at a touch point. */
export function ripple(scene: Scene, p: Pt, good = true): void {
  const holder = spawn(scene.fx, 'ripple-at', p.x, p.y);
  const r = document.createElement('div');
  r.className = good ? 'ripple' : 'ripple soft';
  holder.appendChild(r);
  r.addEventListener('animationend', () => holder.remove());
}

export function sparkle(scene: Scene, p: Pt, n = 8): void {
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2;
    const d = spawn(scene.fx, 'spark', p.x, p.y);
    d.style.background = COLORS[i % COLORS.length];
    const dx = Math.cos(a) * 90;
    const dy = Math.sin(a) * 90;
    const anim = d.animate(
      [
        { transform: `translate3d(${p.x}px,${p.y}px,0) scale(1)`, opacity: 1 },
        { transform: `translate3d(${p.x + dx}px,${p.y + dy}px,0) scale(0.3)`, opacity: 0 },
      ],
      { duration: 600, easing: 'cubic-bezier(.2,.8,.4,1)' },
    );
    anim.onfinish = () => d.remove();
  }
}

export function confetti(scene: Scene): void {
  for (let i = 0; i < 70; i++) {
    const x = Math.random() * 1200;
    const d = spawn(scene.fx, 'confetti', x, -40);
    d.style.background = COLORS[i % COLORS.length];
    const drift = (Math.random() - 0.5) * 300;
    const rot = (Math.random() - 0.5) * 1440;
    const anim = d.animate(
      [
        { transform: `translate3d(${x}px,-60px,0) rotate(0deg)`, opacity: 1 },
        { transform: `translate3d(${x + drift}px,860px,0) rotate(${rot}deg)`, opacity: 1 },
      ],
      { duration: 2200 + Math.random() * 1600, delay: Math.random() * 500, easing: 'cubic-bezier(.3,.5,.6,1)' },
    );
    anim.onfinish = () => d.remove();
  }
}

export function hearts(scene: Scene, p: Pt): void {
  const d = spawn(scene.fx, 'heart', p.x - 22, p.y);
  d.innerHTML = `<svg viewBox="0 0 50 46" width="44" height="40"><path d="M25 44 Q2 28 3 14 Q4 2 15 2 Q22 2 25 10 Q28 2 35 2 Q46 2 47 14 Q48 28 25 44Z" fill="#f06292" stroke="#2b2b3a" stroke-width="3"/></svg>`;
  const anim = d.animate(
    [
      { transform: `translate3d(${p.x - 22}px,${p.y}px,0) scale(.4)`, opacity: 0 },
      { transform: `translate3d(${p.x - 22}px,${p.y - 40}px,0) scale(1.1)`, opacity: 1, offset: 0.3 },
      { transform: `translate3d(${p.x - 22}px,${p.y - 110}px,0) scale(1)`, opacity: 0 },
    ],
    { duration: 1600, easing: 'ease-out' },
  );
  anim.onfinish = () => d.remove();
}

// ---------- Hint hand ----------

export type HintKind = { type: 'tap'; at: Pt } | { type: 'drag'; from: Pt; to: Pt };

let hint: HintKind | null = null;
let hintStart = 0;

export function showHint(scene: Scene, h: HintKind): void {
  hint = h;
  hintStart = performance.now();
  scene.hand.scale = 1;
  scene.hand.el.style.opacity = '';
  scene.hand.el.classList.add('on');
  scene.hand.el.classList.toggle('tapping', h.type === 'tap');
}

export function hideHint(scene: Scene): void {
  hint = null;
  scene.hand.el.style.opacity = '';
  scene.hand.el.classList.remove('on', 'tapping');
}

/** Called every frame. */
export function updateHint(scene: Scene, now: number): void {
  if (!hint) return;
  if (hint.type === 'tap') {
    scene.hand.at(hint.at.x, hint.at.y);
    return;
  }
  // Drag: press, slide, release, pause.
  const period = 2400;
  const t = ((now - hintStart) % period) / period;
  const k = t < 0.15 ? 0 : t > 0.75 ? 1 : (t - 0.15) / 0.6;
  const e = k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2;
  scene.hand.scale = t < 0.12 || t > 0.8 ? 1 : 0.88;
  scene.hand.at(lerp(hint.from.x, hint.to.x, e), lerp(hint.from.y, hint.to.y, e));
  scene.hand.el.style.opacity = t > 0.9 ? '0' : '1';
}
