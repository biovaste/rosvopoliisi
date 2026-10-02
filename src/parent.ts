// Parent corner button: hold for 3 seconds to open mute / fullscreen panel.

import { isMuted, setMuted, sfx } from './audio';
import { state } from './state';

const HOLD_MS = 3000;

const ICON_SOUND_ON = `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M10 24 H22 L36 12 V52 L22 40 H10Z" fill="#fff"/><path d="M44 22 Q52 32 44 42 M50 16 Q62 32 50 48" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/></svg>`;
const ICON_SOUND_OFF = `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M10 24 H22 L36 12 V52 L22 40 H10Z" fill="#fff"/><path d="M44 24 L58 40 M58 24 L44 40" stroke="#ff8a80" stroke-width="6" stroke-linecap="round"/></svg>`;
const ICON_FS = `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M8 22 V8 H22 M42 8 H56 V22 M56 42 V56 H42 M22 56 H8 V42" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_FS_EXIT = `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M22 8 V22 H8 M56 22 H42 V8 M42 56 V42 H56 M8 42 H22 V56" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const ICON_CLOSE = `<svg viewBox="0 0 64 64" width="56" height="56"><path d="M16 16 L48 48 M48 16 L16 48" stroke="#fff" stroke-width="7" stroke-linecap="round"/></svg>`;

type FsDoc = Document & { webkitFullscreenElement?: Element; webkitExitFullscreen?: () => void };
type FsEl = HTMLElement & { webkitRequestFullscreen?: () => void };

function isFullscreen(): boolean {
  const d = document as FsDoc;
  return !!(d.fullscreenElement || d.webkitFullscreenElement);
}

function toggleFullscreen(): void {
  const d = document as FsDoc;
  const root = document.documentElement as FsEl;
  try {
    if (isFullscreen()) {
      if (d.exitFullscreen) void d.exitFullscreen();
      else d.webkitExitFullscreen?.();
    } else if (root.requestFullscreen) {
      void root.requestFullscreen().catch(() => undefined);
    } else root.webkitRequestFullscreen?.();
  } catch {
    /* fullscreen not available */
  }
}

export function initParent(app: HTMLElement): void {
  const btn = document.createElement('div');
  btn.className = 'parent-btn';
  btn.innerHTML = `<div class="parent-fill"></div><svg viewBox="0 0 40 40" width="30" height="30"><rect x="9" y="18" width="22" height="16" rx="3" fill="#fff"/><path d="M13 18 V13 a7 7 0 0 1 14 0 V18" fill="none" stroke="#fff" stroke-width="4"/></svg>`;
  app.appendChild(btn);

  const panel = document.createElement('div');
  panel.className = 'parent-panel';
  panel.innerHTML = `<div class="pp-box">
    <button class="pp-btn pp-mute" aria-label="sound"></button>
    <button class="pp-btn pp-fs" aria-label="fullscreen"></button>
    <button class="pp-btn pp-close" aria-label="close">${ICON_CLOSE}</button>
  </div>`;
  app.appendChild(panel);
  const mute = panel.querySelector('.pp-mute') as HTMLElement;
  const fs = panel.querySelector('.pp-fs') as HTMLElement;
  const refresh = () => {
    mute.innerHTML = isMuted() ? ICON_SOUND_OFF : ICON_SOUND_ON;
    fs.innerHTML = isFullscreen() ? ICON_FS_EXIT : ICON_FS;
  };
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('webkitfullscreenchange', refresh);

  fs.addEventListener('pointerup', () => {
    fs.classList.remove('pressed');
    toggleFullscreen();
    window.setTimeout(refresh, 300);
  });

  let timer = 0;
  let holdId: number | null = null;
  const cancel = () => {
    window.clearTimeout(timer);
    holdId = null;
    btn.classList.remove('holding');
  };
  btn.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    if (holdId !== null) return;
    holdId = e.pointerId;
    btn.classList.add('holding');
    timer = window.setTimeout(() => {
      cancel();
      refresh();
      state.panelOpen = true;
      panel.classList.add('open');
      sfx.pickup();
    }, HOLD_MS);
  });
  const end = (e: PointerEvent) => {
    if (e.pointerId === holdId) cancel();
  };
  window.addEventListener('pointerup', end);
  window.addEventListener('pointercancel', end);

  const close = () => {
    panel.classList.remove('open');
    state.panelOpen = false;
    state.lastInput = performance.now();
  };
  panel.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
    e.preventDefault();
    const t = (e.target as HTMLElement).closest('button');
    if (!t) return close();
    if (t === mute) {
      setMuted(!isMuted());
      sfx.tap();
    } else if (t === fs) {
      // Fullscreen needs a user activation, which touch only grants on pointerup.
      fs.classList.add('pressed');
      sfx.tap();
      return;
    } else close();
    refresh();
    window.setTimeout(refresh, 300);
  });
}
