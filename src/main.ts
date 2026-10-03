import './style.css';
import { playButtonSvg, rotateSvg } from './art';
import { fireButtonSvg } from './fire/art';
import { firefighterHead, randomCostumes, randomLook, rosvoHead } from './people';
import { sfx, unlockAudio } from './audio';
import { updateHint } from './fx';
import { begin, hintFor, initGame, onDown, onMove, onUp, targets, updateShine } from './game';
import { initSessionPicker } from './session';
import { initActors } from './actors';
import { initParent } from './parent';
import { initPolice } from './police';
import { buildScene, fitStage, placeShelf } from './scene';
import { setPhase, state } from './state';

const app = document.getElementById('app') as HTMLElement;
const scene = buildScene(app);
initActors(scene.stage);
initPolice(scene);
initGame(scene);
initParent(app);

let view = fitStage(scene.stage);
placeShelf(scene.shelf, view);
const refit = () => {
  view = fitStage(scene.stage);
  placeShelf(scene.shelf, view);
};
window.addEventListener('resize', refit);
window.addEventListener('orientationchange', () => setTimeout(refit, 200));

const toLogical = (e: PointerEvent) => ({ x: (e.clientX - view.ox) / view.scale, y: (e.clientY - view.oy) / view.scale });

// ---------- Start screen ----------

const start = document.createElement('div');
start.className = 'start';
// Two game modes: police (rosvo peeking over a blue play button) and fire brigade (firefighter over a red one).
start.innerHTML = `<div class="modes">
  <div class="mode"><div class="start-peek"><svg viewBox="0 0 120 100" width="180" height="150">${rosvoHead(randomCostumes(1)[0])}</svg></div>
    <div class="play">${playButtonSvg()}</div></div>
  <div class="mode"><div class="start-peek"><svg viewBox="0 0 120 100" width="180" height="150">${firefighterHead(randomLook())}</svg></div>
    <div class="play play-fire">${fireButtonSvg()}</div></div>
</div>`;
app.appendChild(start);
initSessionPicker(start);

const rotate = document.createElement('div');
rotate.className = 'rotate';
rotate.innerHTML = rotateSvg();
app.appendChild(rotate);

setPhase('start');

/** Which game is being played; the police town is built at boot and dropped if the fire mode is chosen. */
let mode: 'police' | 'fire' | null = null;

start.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  const btn = (e.target as HTMLElement).closest('.play');
  if (!btn || state.phase !== 'start' || mode) return;
  unlockAudio();
  sfx.catch();
  start.classList.add('gone');
  setTimeout(() => start.remove(), 600);
  if (btn.classList.contains('play-fire')) {
    mode = 'fire';
    scene.root.remove();
    void import('./fire/mode').then((m) => m.bootFire(app));
  } else {
    mode = 'police';
    begin();
  }
});

// ---------- Game input (single pointer only) ----------

let active: number | null = null;

scene.root.addEventListener('pointerdown', (e) => {
  e.preventDefault();
  if (state.phase === 'start' || state.phase === 'ended' || state.panelOpen) return;
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
document.addEventListener(
  'touchmove',
  (e) => {
    if (e.cancelable) e.preventDefault();
  },
  { passive: false },
);

// ---------- Per-frame ----------

function frame(now: number): void {
  if (mode === 'fire') return;
  updateHint(scene, now);
  updateShine(now);
  if (!state.hintOn && state.phase !== 'start' && state.phase !== 'ended' && now - state.lastInput > 10000) {
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
  setLimit: (min: number) => {
    state.limitMin = min;
  },
  halo: () => Number(scene.halo.style.opacity || 0),
  targets: () => {
    const t = targets();
    return Object.fromEntries(Object.entries(t).map(([k, v]) => [k, toClient(v)]));
  },
};
