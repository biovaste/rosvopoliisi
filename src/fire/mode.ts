// Boots the fire mode: builds the town, scales it to the screen and routes
// single-pointer input to the game (same rules as the police mode).

import './fire.css';
import { updateHint } from '../fx';
import { randomLook } from '../people';
import { fitStage } from '../scene';
import { state } from '../state';
import { beginFire, fireDebug, fireFrame, fireHint, firePhase, initFire, onDown, onMove, onUp } from './game';
import { SKY_CROP } from './layout';
import { buildFireScene, placeFireShelf } from './scene';

export function bootFire(app: HTMLElement): void {
  document.body.dataset.mode = 'fire';
  const scene = buildFireScene(app, randomLook());
  initFire(scene);

  let view = fitStage(scene.stage, SKY_CROP);
  placeFireShelf(scene.shelf, view);
  const refit = () => {
    view = fitStage(scene.stage, SKY_CROP);
    placeFireShelf(scene.shelf, view);
  };
  window.addEventListener('resize', refit);
  window.addEventListener('orientationchange', () => setTimeout(refit, 200));

  const toLogical = (e: PointerEvent) => ({ x: (e.clientX - view.ox) / view.scale, y: (e.clientY - view.oy) / view.scale });
  const idle = () => firePhase() === 'start' || firePhase() === 'ended';

  let active: number | null = null;
  scene.root.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    if (idle() || state.panelOpen || active !== null) return;
    active = e.pointerId;
    onDown(toLogical(e), e.pointerId);
  });
  window.addEventListener('pointermove', (e) => {
    if (e.pointerId === active) onMove(toLogical(e), e.pointerId);
  });
  const release = (e: PointerEvent) => {
    if (e.pointerId !== active) return;
    active = null;
    onUp(toLogical(e), e.pointerId);
  };
  window.addEventListener('pointerup', release);
  window.addEventListener('pointercancel', release);

  const frame = (now: number) => {
    fireFrame(now);
    updateHint(scene, now);
    if (!state.hintOn && !idle() && now - state.lastInput > 10000) {
      fireHint();
      if (!state.hintOn) state.lastInput = now - 8000;
    }
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);

  const toClient = (p: { x: number; y: number } | null) => (p ? { x: p.x * view.scale + view.ox, y: p.y * view.scale + view.oy } : null);
  (window as unknown as { __fire: unknown }).__fire = {
    state: () => fireDebug().state,
    targets: () => Object.fromEntries(Object.entries(fireDebug().targets).map(([k, v]) => [k, toClient(v)])),
    setLimit: (min: number) => {
      state.limitMin = min;
    },
  };

  beginFire();
}
