// Game logic: the catch -> jail -> return -> celebrate loop.

import * as art from './art';
import { sfx } from './audio';
import { confetti, hearts, hideHint, showHint, sparkle, ripple } from './fx';
import {
  DOOR,
  JAIL_RADIUS,
  JAIL_TARGET,
  OWNER_RADIUS,
  OWNER_SLOTS,
  PEEK_H,
  SHELF,
  SPOTS,
  WINDOWS,
  dist,
  peekFeet,
  spotRect,
  type Pt,
} from './layout';
import type { Scene } from './scene';
import { TIMES, setPhase, state } from './state';
import { Sprite, ease, tween, wait } from './tween';

let scene: Scene;

interface OwnerView {
  el: HTMLElement;
  sprite: Sprite;
  bubble: HTMLElement;
  item: Sprite;
}
let ownerViews: OwnerView[] = [];
let rosvo: Sprite;
let peekTimer = 0;

const ALL_OWNERS: art.OwnerKind[] = ['baker', 'kid', 'grandma', 'dog', 'vendor', 'girl'];

function shuffle<T>(a: T[]): T[] {
  const r = a.slice();
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

function el(cls: string, html = ''): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = html;
  scene.actors.appendChild(d);
  return d;
}

export function initGame(s: Scene): void {
  scene = s;
  const r = el('rosvo actor');
  r.innerHTML = `<div class="actor-inner"></div><div class="sack"></div>`;
  rosvo = new Sprite(r, 60, 200);
  rosvo.at(1400, 700).show(false);
  setTime('day');
}

// ---------- Cycle setup ----------

function setTime(t: (typeof TIMES)[number]): void {
  state.time = t;
  document.body.dataset.time = t;
}

function buildOwners(): void {
  for (const v of ownerViews) {
    v.el.remove();
    v.item.el.remove();
  }
  const kinds = shuffle(ALL_OWNERS).slice(0, 3);
  state.owners = kinds.map((kind, slot) => ({ kind, item: art.OWNER_ITEM[kind], slot, robbed: false }));
  ownerViews = state.owners.map((o) => {
    const p = OWNER_SLOTS[o.slot];
    const e = el(`owner actor ${o.kind}`, `<div class="actor-inner">${art.ownerSvg(o.kind)}</div>`);
    const bubble = document.createElement('div');
    bubble.className = 'bubble';
    bubble.innerHTML = `<div class="bubble-inner">${art.itemSvg(o.item)}</div>`;
    e.appendChild(bubble);
    const sprite = new Sprite(e, 60, 200).at(p.x, p.y);
    const itemEl = el('item actor', `<div class="actor-inner">${art.itemSvg(o.item)}</div>`);
    const item = new Sprite(itemEl, 50, 50);
    item.scale = 0.8;
    item.at(...handPos(o.slot));
    return { el: e, sprite, bubble, item };
  });
}

function handPos(slot: number): [number, number] {
  const p = OWNER_SLOTS[slot];
  return [p.x, p.y - 62];
}

async function startCycle(): Promise<void> {
  state.jailed = 0;
  state.costumes = [];
  for (let i = 0; i < 3; i++) state.costumes.push(art.randomCostume(state.costumes));
  buildOwners();
  state.order = shuffle([0, 1, 2]);
  for (const v of ownerViews) {
    v.el.classList.add('enter');
    v.item.el.classList.add('enter');
  }
  await wait(700);
  for (const v of ownerViews) {
    v.el.classList.remove('enter');
    v.item.el.classList.remove('enter');
  }
  void startRobbery();
}

export function begin(): void {
  state.cycle = 0;
  state.lastInput = performance.now();
  void startCycle();
}

// ---------- Robbery ----------

async function startRobbery(): Promise<void> {
  setPhase('stealing');
  state.busy = true;
  state.misses = 0;
  state.still = false;
  const n = state.jailed;
  state.victim = state.order[n];
  const owner = state.owners[state.victim];
  const ov = ownerViews[state.victim];
  const costume = state.costumes[n];

  const inner = rosvo.el.querySelector('.actor-inner') as HTMLElement;
  inner.innerHTML = art.rosvoSvg(costume);
  (rosvo.el.querySelector('.sack') as HTMLElement).innerHTML = art.sackSvg(costume);
  rosvo.el.className = 'rosvo actor walking';
  rosvo.scale = 1;
  rosvo.rot = 0;

  // Sneak in from the right edge, behind the owner.
  const slot = OWNER_SLOTS[owner.slot];
  const fromRight = owner.slot !== 0 || Math.random() < 0.5;
  rosvo.flip = fromRight;
  rosvo.at(fromRight ? 1320 : -120, slot.y + 30).show(true);
  sfx.sneak();
  const standX = slot.x + (fromRight ? 95 : -95);
  await rosvo.moveTo(standX, slot.y + 30, 1500, 0, ease.linear);

  // Grab!
  rosvo.el.classList.remove('walking');
  sfx.grab();
  owner.robbed = true;
  ov.el.classList.add('sad');
  ov.item.moveTo(rosvo.x, rosvo.y - 60, 250, 40);
  await wait(260);
  ov.item.show(false);
  rosvo.el.classList.add('has-sack');
  sfx.giggle();
  await wait(250);

  // Run to a hiding spot.
  state.spot = pickSpot();
  const spot = SPOTS[state.spot];
  const pf = peekFeet(spot);
  rosvo.flip = pf.x < rosvo.x;
  rosvo.el.classList.add('walking', 'running');
  const hop = spot.back ? 220 : 40;
  await rosvo.moveTo(pf.x, pf.y, 1100, hop);
  rosvo.el.classList.remove('walking', 'running', 'has-sack');
  rosvo.show(false);
  ov.bubble.classList.add('on');

  setPeeker(state.spot, costume, true);
  state.busy = false;
  setPhase('hiding');
  state.lastInput = performance.now();
  schedulePeek(true);
}

function pickSpot(): number {
  let i: number;
  do i = Math.floor(Math.random() * SPOTS.length);
  while (i === state.spot || i === state.lastSpot);
  state.lastSpot = state.spot;
  return i;
}

function setPeeker(idx: number, costume: art.Costume, up: boolean): void {
  scene.spots.forEach((sv, i) => {
    if (i === idx) {
      sv.inner.innerHTML = art.rosvoSvg(costume);
      sv.peeker.classList.add('active');
      sv.peeker.classList.toggle('up', up);
      sv.peeker.classList.toggle('still', state.still);
    } else {
      sv.peeker.classList.remove('active', 'up', 'still');
      sv.inner.innerHTML = '';
    }
  });
}

function peekerView() {
  return scene.spots[state.spot];
}

function schedulePeek(up: boolean): void {
  window.clearTimeout(peekTimer);
  if (state.phase !== 'hiding') return;
  const pv = peekerView();
  pv.peeker.classList.toggle('up', up || state.still || state.hintOn);
  if (state.still) {
    pv.peeker.classList.add('still');
    return;
  }
  const ms = up ? 2400 + Math.random() * 1200 : 800 + Math.random() * 500;
  peekTimer = window.setTimeout(() => schedulePeek(!up), ms);
}

// ---------- Input ----------

export function onDown(p: Pt, pointerId: number): void {
  state.lastInput = performance.now();
  if (state.hintOn) {
    state.hintOn = false;
    hideHint(scene);
  }
  if (state.busy || state.drag) {
    ripple(scene, p, false);
    sfx.tap();
    return;
  }
  switch (state.phase) {
    case 'hiding':
      return tapWhileHiding(p);
    case 'caught':
      if (dist(p, { x: rosvo.x, y: rosvo.y - 100 }) < 130) {
        startDrag('rosvo', p, pointerId);
      } else {
        ripple(scene, p, false);
        sfx.tap();
        nudge(rosvo.el);
      }
      return;
    case 'returning': {
      const item = ownerViews[state.victim].item;
      if (dist(p, item) < 110) startDrag('item', p, pointerId);
      else {
        ripple(scene, p, false);
        sfx.tap();
        nudge(item.el);
      }
      return;
    }
    default:
      ripple(scene, p, false);
      sfx.tap();
  }
}

function nudge(e: HTMLElement): void {
  e.classList.remove('nudge');
  void e.offsetWidth;
  e.classList.add('nudge');
}

function tapWhileHiding(p: Pt): void {
  const r = spotRect(SPOTS[state.spot]);
  if (p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1) {
    ripple(scene, p, true);
    void catchRosvo();
    return;
  }
  // Miss: duck and reappear elsewhere.
  ripple(scene, p, false);
  sfx.miss();
  state.misses++;
  if (state.misses >= 3) {
    // Already holding still; just wiggle harder.
    nudge(peekerView().peeker);
    return;
  }
  void relocate();
}

async function relocate(): Promise<void> {
  state.busy = true;
  window.clearTimeout(peekTimer);
  peekerView().peeker.classList.remove('up');
  await wait(450);
  state.spot = pickSpot();
  if (state.misses >= 2) state.still = true;
  setPeeker(state.spot, state.costumes[state.jailed], false);
  state.busy = false;
  await wait(60);
  sfx.giggle();
  schedulePeek(true);
}

async function catchRosvo(): Promise<void> {
  state.busy = true;
  window.clearTimeout(peekTimer);
  sfx.catch();
  const spot = SPOTS[state.spot];
  const pv = peekerView();
  const pf = peekFeet(spot);
  pv.peeker.classList.remove('active', 'up', 'still');
  pv.inner.innerHTML = '';

  // Pop out with hands up.
  rosvo.el.className = 'rosvo actor caught';
  rosvo.flip = false;
  rosvo.at(pf.x, pf.y).show(true);
  sparkle(scene, { x: pf.x, y: pf.y - 150 });
  const land = spot.land;
  await rosvo.moveTo(land.x, land.y, 650, 120, ease.inOut);
  state.rosvoRest = { ...land };

  // The stolen item tumbles out next to it.
  const ov = ownerViews[state.victim];
  const dir = land.x > 700 ? -1 : 1;
  state.itemRest = { x: land.x + dir * 125, y: land.y - 50 };
  ov.item.scale = 1;
  ov.item.at(land.x, land.y - 120).show(true);
  ov.item.el.classList.add('lying');
  void ov.item.moveTo(state.itemRest.x, state.itemRest.y, 500, 80);
  await wait(500);
  state.busy = false;
  setPhase('caught');
  state.lastInput = performance.now();
}

function startDrag(what: 'rosvo' | 'item', p: Pt, pointerId: number): void {
  const s = what === 'rosvo' ? rosvo : ownerViews[state.victim].item;
  state.drag = { pointerId, what, dx: s.x - p.x, dy: s.y - p.y };
  s.el.classList.add('dragging');
  sfx.pickup();
  ripple(scene, p, true);
  if (what === 'rosvo') setPhase('carrying');
}

export function onMove(p: Pt, pointerId: number): void {
  const d = state.drag;
  if (!d || d.pointerId !== pointerId) return;
  state.lastInput = performance.now();
  const s = d.what === 'rosvo' ? rosvo : ownerViews[state.victim].item;
  s.at(p.x + d.dx, p.y + d.dy);
}

export function onUp(p: Pt, pointerId: number): void {
  const d = state.drag;
  if (!d || d.pointerId !== pointerId) return;
  onMove(p, pointerId);
  state.drag = null;
  if (d.what === 'rosvo') void dropRosvo();
  else void dropItem();
}

async function dropRosvo(): Promise<void> {
  rosvo.el.classList.remove('dragging');
  const centre = { x: rosvo.x, y: rosvo.y - 100 };
  if (dist(centre, JAIL_TARGET) > JAIL_RADIUS) {
    state.busy = true;
    sfx.floatBack();
    await rosvo.moveTo(state.rosvoRest.x, state.rosvoRest.y, 700, 30, ease.out);
    state.busy = false;
    setPhase('caught');
    return;
  }
  state.busy = true;
  const n = state.jailed;
  const win = WINDOWS[n];
  // Into the jail window, shrinking.
  const x0 = rosvo.x;
  const y0 = rosvo.y;
  await tween(550, (t) => {
    rosvo.x = x0 + (win.x - x0) * t;
    rosvo.y = y0 + (win.y + 40 - y0) * t - Math.sin(Math.PI * t) * 60;
    rosvo.scale = 1 - 0.6 * t;
    rosvo.render();
  });
  rosvo.show(false);
  rosvo.scale = 1;
  sfx.clang();
  const face = scene.windows[n].face;
  face.innerHTML = `<svg viewBox="0 0 120 100" width="76" height="64">${art.rosvoHead(state.costumes[n])}</svg>`;
  face.classList.add('on', 'sorry');
  state.jailed++;
  scene.car.classList.add('flash');
  window.setTimeout(() => scene.car.classList.remove('flash'), 1200);
  sparkle(scene, win, 10);
  await wait(400);

  const ov = ownerViews[state.victim];
  ov.item.el.classList.add('glow');
  state.busy = false;
  setPhase('returning');
  state.lastInput = performance.now();
}

async function dropItem(): Promise<void> {
  const ov = ownerViews[state.victim];
  ov.item.el.classList.remove('dragging');
  const target = { x: OWNER_SLOTS[state.owners[state.victim].slot].x, y: OWNER_SLOTS[state.owners[state.victim].slot].y - 100 };
  if (dist(ov.item, target) > OWNER_RADIUS) {
    state.busy = true;
    sfx.floatBack();
    await ov.item.moveTo(state.itemRest.x, state.itemRest.y, 700, 30, ease.out);
    state.busy = false;
    return;
  }
  state.busy = true;
  const [hx, hy] = handPos(state.owners[state.victim].slot);
  ov.item.el.classList.remove('glow', 'lying');
  void tween(300, (t) => {
    ov.item.scale = 1 - 0.2 * t;
    ov.item.render();
  });
  await ov.item.moveTo(hx, hy, 300, 0, ease.out);
  state.owners[state.victim].robbed = false;
  ov.bubble.classList.remove('on');
  ov.el.classList.remove('sad');
  ov.el.classList.add('happy');
  sfx.cheer();
  sparkle(scene, { x: hx, y: hy - 60 }, 12);
  hearts(scene, { x: hx, y: hy - 150 });
  await wait(1400);
  ov.el.classList.remove('happy');

  if (state.jailed >= 3) void celebrate();
  else void startRobbery();
}

// ---------- Celebration ----------

async function celebrate(): Promise<void> {
  setPhase('celebrating');
  state.busy = true;
  sfx.siren();
  scene.car.classList.add('flash');
  confetti(scene);
  await wait(400);
  sfx.fanfare();

  // A sticker for the shelf.
  const n = state.stickers++;
  const st = document.createElement('div');
  st.className = 'sticker';
  st.innerHTML = art.stickerSvg(n);
  scene.fx.appendChild(st);
  const sp = new Sprite(st, 50, 50);
  sp.scale = 0;
  sp.at(600, 360);
  await tween(600, (t) => {
    sp.scale = 2.2 * t;
    sp.rot = (1 - t) * -40;
    sp.render();
  }, ease.back);
  await wait(800);
  const slot = n % 10;
  const tx = SHELF.x + 30 + (slot % 5) * 48;
  const ty = SHELF.y + 32 + Math.floor(slot / 5) * 56;
  sfx.sticker();
  await tween(800, (t) => {
    sp.scale = 2.2 - 1.75 * t;
    sp.x = 600 + (tx - 600) * t;
    sp.y = 360 + (ty - 360) * t - Math.sin(Math.PI * t) * 120;
    sp.render();
  });
  // Keep it on the shelf (replace an old one in the same slot).
  const old = scene.shelf.querySelector(`[data-slot="${slot}"]`);
  old?.remove();
  st.dataset.slot = String(slot);
  scene.shelf.appendChild(st);
  sp.at(tx - SHELF.x, ty - SHELF.y);
  sparkle(scene, { x: tx, y: ty }, 8);
  scene.car.classList.remove('flash');

  // The rosvot say sorry and are released.
  await releaseRosvot();

  // Time moves on: day -> evening -> night -> day.
  state.cycle++;
  setTime(TIMES[state.cycle % TIMES.length]);
  for (const v of ownerViews) {
    v.el.classList.add('leave');
    v.item.el.classList.add('leave');
  }
  await wait(1400);
  void startCycle();
}

async function releaseRosvot(): Promise<void> {
  const sprites: Sprite[] = [];
  for (let i = 0; i < 3; i++) {
    const e = el('rosvo actor caught released');
    e.innerHTML = `<div class="actor-inner">${art.rosvoSvg(state.costumes[i])}</div>`;
    const s = new Sprite(e, 60, 200);
    s.scale = 0.6;
    s.at(DOOR.x, DOOR.y).show(false);
    sprites.push(s);
  }
  for (let i = 0; i < 3; i++) {
    const face = scene.windows[i].face;
    face.classList.remove('on');
    const s = sprites[i];
    s.show(true);
    s.el.classList.add('walking');
    const x = 430 + i * 150;
    void tween(700, (t) => {
      s.scale = 0.6 + 0.4 * t;
      s.render();
    });
    void s.moveTo(x, 760, 900, 20).then(() => s.el.classList.remove('walking'));
    await wait(300);
  }
  await wait(800);
  // Bow and say sorry.
  sfx.sorry();
  for (const s of sprites) {
    s.el.classList.add('bow');
    hearts(scene, { x: s.x, y: s.y - 210 });
  }
  await wait(1500);
  for (const s of sprites) s.el.classList.remove('bow', 'caught');
  // Wave goodbye and walk off.
  for (const s of sprites) {
    s.el.classList.add('walking', 'waving');
    s.flip = false;
  }
  await Promise.all(sprites.map((s, i) => s.moveTo(1350 + i * 60, 760, 1800 + i * 200, 0, ease.linear)));
  for (const s of sprites) s.el.remove();
}

// ---------- Hints & per-frame ----------

export function hintFor(): void {
  if (state.busy || state.drag || state.panelOpen) return;
  if (state.phase === 'hiding') {
    const s = SPOTS[state.spot];
    const pf = peekFeet(s);
    showHint(scene, { type: 'tap', at: { x: pf.x + 10, y: pf.y - 200 + PEEK_H / 2 } });
    peekerView().peeker.classList.add('up');
  } else if (state.phase === 'caught') {
    showHint(scene, { type: 'drag', from: { x: rosvo.x, y: rosvo.y - 100 }, to: { x: JAIL_TARGET.x, y: JAIL_TARGET.y } });
  } else if (state.phase === 'returning') {
    const ov = ownerViews[state.victim];
    const [hx, hy] = handPos(state.owners[state.victim].slot);
    showHint(scene, { type: 'drag', from: { x: ov.item.x, y: ov.item.y }, to: { x: hx, y: hy } });
  } else return;
  state.hintOn = true;
  sfx.hint();
}

/** Debug/test hook: logical positions of the current targets. */
export function targets(): Record<string, Pt | null> {
  const ov = ownerViews[state.victim];
  const s = SPOTS[state.spot];
  const pf = peekFeet(s);
  return {
    rosvo: state.phase === 'hiding' ? { x: pf.x, y: pf.y - 200 + PEEK_H / 2 } : { x: rosvo.x, y: rosvo.y - 100 },
    jail: JAIL_TARGET,
    item: ov ? { x: ov.item.x, y: ov.item.y } : null,
    owner: ov ? { x: ov.sprite.x, y: ov.sprite.y - 100 } : null,
  };
}
