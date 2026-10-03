// Session length (chosen by an adult on the start screen) and the end screen.
// No text: durations are shown as clock faces with a filled wedge; unlimited is ∞.

import { stickerSvg } from './art';
import { sfx } from './audio';
import { setPhase, state } from './state';

export const CHOICES = [0, 5, 10, 15, 20, 30];
const KEY = 'rosvopoliisi.minutes';
const HOLD_MS = 2000;

export function loadMinutes(): number {
  try {
    const v = Number(localStorage.getItem(KEY));
    return CHOICES.includes(v) ? v : 0;
  } catch {
    return 0;
  }
}

function saveMinutes(m: number): void {
  try {
    localStorage.setItem(KEY, String(m));
  } catch {
    /* storage unavailable: the choice lasts for this visit only */
  }
}

/** Clock face showing m minutes as a wedge (out of 60); 0 shows an infinity loop. */
export function clockSvg(m: number, size = 64): string {
  const face = `<circle cx="32" cy="32" r="28" fill="#fff8ec" stroke="#3a2c2a" stroke-width="4"/>`;
  if (m === 0) {
    return `<svg viewBox="0 0 64 64" width="${size}" height="${size}">${face}
      <path d="M32 32 C26 22 14 22 14 32 C14 42 26 42 32 32 C38 22 50 22 50 32 C50 42 38 42 32 32Z" fill="none" stroke="#2f5aa8" stroke-width="5" stroke-linejoin="round"/></svg>`;
  }
  const a = (m / 60) * Math.PI * 2;
  const x = 32 + 24 * Math.sin(a);
  const y = 32 - 24 * Math.cos(a);
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const t = (i / 12) * Math.PI * 2;
    return `<path d="M${32 + 24 * Math.sin(t)} ${32 - 24 * Math.cos(t)} L${32 + 20 * Math.sin(t)} ${32 - 20 * Math.cos(t)}" stroke="#3a2c2a" stroke-width="2" opacity=".5"/>`;
  }).join('');
  return `<svg viewBox="0 0 64 64" width="${size}" height="${size}">${face}
    <path d="M32 32 L32 8 A24 24 0 ${m > 30 ? 1 : 0} 1 ${x.toFixed(2)} ${y.toFixed(2)}Z" fill="#f2a23a" stroke="#3a2c2a" stroke-width="2.5" stroke-linejoin="round"/>
    ${ticks}<circle cx="32" cy="32" r="3" fill="#3a2c2a"/></svg>`;
}

/** Adds the hold-to-open session clock to the start screen. */
export function initSessionPicker(start: HTMLElement): void {
  state.limitMin = loadMinutes();
  const btn = document.createElement('div');
  btn.className = 'session-btn';
  btn.innerHTML = `<div class="parent-fill"></div><div class="session-icon">${clockSvg(state.limitMin, 44)}</div>`;
  start.appendChild(btn);

  const picker = document.createElement('div');
  picker.className = 'session-picker';
  picker.innerHTML = CHOICES.map((m) => `<button class="session-choice" data-m="${m}">${clockSvg(m)}</button>`).join('');
  start.appendChild(picker);
  const mark = () =>
    picker.querySelectorAll<HTMLElement>('.session-choice').forEach((b) => b.classList.toggle('on', Number(b.dataset.m) === state.limitMin));

  let timer = 0;
  let holding: number | null = null;
  const cancel = () => {
    window.clearTimeout(timer);
    holding = null;
    btn.classList.remove('holding');
  };
  btn.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    holding = e.pointerId;
    btn.classList.add('holding');
    timer = window.setTimeout(() => {
      cancel();
      mark();
      picker.classList.add('open');
      sfx.pickup();
    }, HOLD_MS);
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId === holding) cancel();
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  picker.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const b = (e.target as HTMLElement).closest<HTMLElement>('.session-choice');
    if (b) {
      state.limitMin = Number(b.dataset.m);
      saveMinutes(state.limitMin);
      (btn.querySelector('.session-icon') as HTMLElement).innerHTML = clockSvg(state.limitMin, 44);
      sfx.tap();
    }
    picker.classList.remove('open');
  });
}

/** True once the chosen time has run out (checked at the end of each level). */
export function timeIsUp(now = performance.now()): boolean {
  return state.limitMin > 0 && now - state.startedAt >= state.limitMin * 60000;
}

/** Shows the stickers earned this session. Holding the corner button starts a new session. */
export function showEndScreen(app: HTMLElement): void {
  setPhase('ended');
  const end = document.createElement('div');
  end.className = 'end-screen';
  const n = state.stickers;
  end.innerHTML = `<div class="end-hat"><svg viewBox="0 0 120 80" width="150" height="100">
      <path d="M14 56 Q16 14 60 12 Q104 14 106 56Z" fill="#2f5aa8" stroke="#3a2c2a" stroke-width="5"/>
      <rect x="8" y="50" width="104" height="18" rx="8" fill="#1f3f7a" stroke="#3a2c2a" stroke-width="5"/>
      <path d="M60 20 l7 14 h15 l-12 9 l5 15 l-15 -9 l-15 9 l5 -15 l-12 -9 h15Z" fill="#ffd54f" stroke="#3a2c2a" stroke-width="3"/></svg></div>
    <div class="end-stickers">${Array.from({ length: n }, (_, i) => `<div class="end-sticker" style="animation-delay:${(0.4 + i * 0.35).toFixed(2)}s">${stickerSvg(i)}</div>`).join('')}</div>
    <div class="session-btn end-restart"><div class="parent-fill"></div><svg viewBox="0 0 40 40" width="30" height="30"><path d="M30 20 A10 10 0 1 1 26 12" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round"/><path d="M22 8 L30 10 L27 18" fill="none" stroke="#fff" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/></svg></div>`;
  app.appendChild(end);
  for (let i = 0; i < n; i++) window.setTimeout(() => sfx.sticker(), 400 + i * 350);
  window.setTimeout(() => sfx.fanfare(), 400 + n * 350);

  const restart = end.querySelector('.end-restart') as HTMLElement;
  let timer = 0;
  restart.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    e.stopPropagation();
    restart.classList.add('holding');
    timer = window.setTimeout(() => location.reload(), 3000);
  });
  const stop = () => {
    window.clearTimeout(timer);
    restart.classList.remove('holding');
  };
  restart.addEventListener('pointerup', stop);
  restart.addEventListener('pointercancel', stop);
  end.addEventListener('pointerdown', (e) => e.preventDefault());
}
