import './style.css';
import { playButtonSvg, rotateSvg } from './art';
import { randomCostumes, rosvoHead } from './people';
import { sfx, unlockAudio } from './audio';
import { updateHint } from './fx';
import { begin, hintFor, initGame, onDown, onMove, onUp, targets } from './game';
import { initActors } from './actors';
import { initParent } from './parent';
import { initPolice } from './police';
import { buildScene, fitStage } from './scene';
import { setPhase, state } from './state';

const app = document.getElementById('app') as HTMLElement;
const scene = buildScene(app);
initActors(scene.stage);
initPolice(scene);
initGame(scene);
initParent(app);

let view = fitStage(scene.stage);
const refit = () => {
  view = fitStage(scene.stage);
};
window.addEventListener('resize', refit);
window.addEventListener('orientationchange', () => setTimeout(refit, 200));

const toLogical = (e: PointerEvent) => ({ x: (e.clientX - view.ox) / view.scale, y: (e.clientY - view.oy) / view.scale });

// ---------- Start screen ----------

const start = document.createElement('div');
start.className = 'start';
start.innerHTML = `<div class="start-peek"><svg viewBox="0 0 120 100" width="180" height="150">${rosvoHead(randomCostumes(1)[0])}</svg></div>
  <div class="play">${playButtonSvg()}</div>`;
app.appendChild(start);

const rotate = document.createElement('div');
rotate.className = 'rotate';
rotate.innerHTML = rotateSvg();
app.appendChild(rotate);

setPhase('start');

start.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (!(e.target as HTMLElement).closest('.play')) return;
  unlockAudio();
  sfx.catch();
  start.classList.add('gone');
  setTimeout(() => start.remove(), 600);
  begin();
});

// ---------- Game input (single pointer only) ----------

let active: number | null = null;

scene.root.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (state.phase === 'start' || state.panelOpen) return;
  if (active !== null) return; // ignore extra touches (resting palm etc.)
  active = e.pointerId;
  onDown(toLogical(e), e.pointerId);
});

window.addEventListener('pointermove', (e) => {
  if (e.pointerId !== active) return;
  onMove(toLogical(e), e.pointerId);
});

const release = (e: PointerEvent) => {
  unlockAudio();
  if (e.pointerId !== active) return;
  active = null;
  onUp(toLogical(e), e.pointerId);
};
window.addEventListener('pointerup', release);
window.addEventListener('pointercancel', release);

// No context menu, no gestures, no scrolling.
for (const ev of ['contextmenu', 'gesturestart', 'gesturechange', 'selectstart', 'dragstart']) {
  document.addEventListener(ev, (e) => e.preventDefault());
}
document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });

// ---------- Per-frame ----------

function frame(now: number): void {
  updateHint(scene, now);
  if (!state.hintOn && state.phase !== 'start' && now - state.lastInput > 10000) {
    hintFor();
    if (!state.hintOn) state.lastInput = now - 8000; // try again shortly
  }
  requestAnimationFrame(frame);
}
requestAnimationFrame(frame);

// Test/debug hook: read-only view of the game.
const toClient = (p: { x: number; y: number } | null) =>
  p ? { x: p.x * view.scale + view.ox, y: p.y * view.scale + view.oy } : null;
(window as unknown as { __rosvo: unknown }).__rosvo = {
  state: () => ({ phase: state.phase, busy: state.busy, jailed: state.jailed, cycle: state.cycle, time: state.time, stickers: state.stickers, misses: state.misses, still: state.still, hint: state.hintOn, moving: state.moving, itemOut: state.itemOut, npcs: state.owners.length, tier: Math.min(state.cycle, 3) }),
  targets: () => {
    const t = targets();
    return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, toClient(v)]));
  },
};
