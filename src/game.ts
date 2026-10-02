// Game logic: steal -> hide (and move) -> catch -> jail -> find loot -> return -> celebrate.

import * as art from './art';
import { sfx } from './audio';
import { confetti, hearts, hideHint, showHint, sparkle, ripple } from './fx';
import {
  CAR,
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
import { ROLES, ROLE_ITEM, ownerSvg, randomCostumes, randomLooks, rosvoHead, rosvoSvg, sackSvg, shuffle, type Costume } from './people';
import type { Scene } from './scene';
import { TIMES, setPhase, state, type Owner } from './state';
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
/** Bumped to cancel a rosvo's run between spots. */
let moveGen = 0;

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

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

const costume = (): Costume => state.costumes[state.jailed];
const victim = (): Owner => state.owners[state.victim];
const victimView = (): OwnerView => ownerViews[state.victim];

// ---------- Cycle setup ----------

function setTime(t: (typeof TIMES)[number]): void {
  state.time = t;
  document.body.dataset.time = t;
}

function handPos(o: Owner): [number, number] {
  return [o.pos.x, o.pos.y - 62];
}

function buildOwners(): void {
  for (const v of ownerViews) {
    v.el.remove();
    v.item.el.remove();
  }
  const roles = shuffle(ROLES).slice(0, 3);
  const looks = randomLooks(3);
  // Owners stand in different places every cycle.
  const slots = shuffle(OWNER_SLOTS).map((p) => ({ x: p.x + (Math.random() - 0.5) * 70, y: p.y + (Math.random() - 0.5) * 16 }));
  slots.sort((a, b) => a.x - b.x);
  state.owners = roles.map((role, i) => ({ role, look: looks[i], item: ROLE_ITEM[role], pos: slots[i], robbed: false }));
  ownerViews = state.owners.map((o) => {
    const e = el(`owner actor ${o.role}`, `<div class="actor-inner">${ownerSvg(o.role, o.look)}</div>`);
    const bubble = document.createElement('div');
    bubble.className = o.pos.x > 950 ? 'bubble left' : 'bubble';
    bubble.innerHTML = `<div class="bubble-inner">${art.itemSvg(o.item)}</div>`;
    e.appendChild(bubble);
    const sprite = new Sprite(e, 60, 200).at(o.pos.x, o.pos.y);
    const item = new Sprite(el('item actor', `<div class="actor-inner">${art.itemSvg(o.item)}</div>`), 50, 50);
    item.scale = 0.8;
    item.at(...handPos(o));
    return { el: e, sprite, bubble, item };
  });
}

async function startCycle(): Promise<void> {
  state.jailed = 0;
  state.costumes = randomCostumes(3);
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

function pickSpot(): number {
  let i: number;
  do i = Math.floor(Math.random() * SPOTS.length);
  while (i === state.spot || i === state.lastSpot || i === state.stashSpot);
  state.lastSpot = state.spot;
  return i;
}

function stashPoint(): Pt {
  const s = SPOTS[state.stashSpot];
  return { x: s.x, y: s.top - 20 };
}

async function runTo(p: Pt, ms: number, hop: number, alive?: () => boolean): Promise<void> {
  rosvo.flip = p.x < rosvo.x;
  rosvo.el.classList.add('walking', 'running');
  await rosvo.moveTo(p.x, p.y, ms, hop, ease.inOut, alive);
  rosvo.el.classList.remove('walking', 'running');
}

async function startRobbery(): Promise<void> {
  setPhase('stealing');
  state.busy = true;
  state.misses = 0;
  state.still = false;
  state.moving = false;
  state.itemOut = false;
  state.victim = state.order[state.jailed];
  const owner = victim();
  const ov = victimView();
  const c = costume();

  (rosvo.el.querySelector('.actor-inner') as HTMLElement).innerHTML = rosvoSvg(c);
  (rosvo.el.querySelector('.sack') as HTMLElement).innerHTML = sackSvg(c);
  rosvo.el.className = 'rosvo actor walking';
  rosvo.scale = 1;
  rosvo.rot = 0;

  // Sneak in from the nearest edge.
  const fromRight = owner.pos.x > 600 || Math.random() < 0.4;
  rosvo.flip = fromRight;
  rosvo.at(fromRight ? 1320 : -120, owner.pos.y + 30).show(true);
  sfx.sneak();
  await rosvo.moveTo(owner.pos.x + (fromRight ? 95 : -95), owner.pos.y + 30, 1500, 0, ease.linear);

  // Grab!
  rosvo.el.classList.remove('walking');
  sfx.grab();
  owner.robbed = true;
  ov.el.classList.add('sad');
  void ov.item.moveTo(rosvo.x, rosvo.y - 60, 250, 40);
  await wait(260);
  ov.item.show(false);
  rosvo.el.classList.add('has-sack');
  sfx.giggle();
  await wait(250);
  ov.bubble.classList.add('on');

  // Stash the loot in one place...
  state.stashSpot = -1;
  state.stashSpot = pickSpot();
  const stash = SPOTS[state.stashSpot];
  await runTo(peekFeet(stash), 1000, stash.back ? 200 : 40);
  const sv = scene.spots[state.stashSpot];
  sv.stash.innerHTML = art.itemSvg(owner.item);
  sv.stash.classList.add('on');
  rosvo.el.classList.remove('has-sack');
  sfx.grab();
  await wait(300);

  // ...and hide somewhere else.
  state.spot = pickSpot();
  const spot = SPOTS[state.spot];
  await runTo(peekFeet(spot), 1000, spot.back || stash.back ? 200 : 40);
  rosvo.show(false);

  setPeeker(state.spot, c, true);
  state.busy = false;
  setPhase('hiding');
  state.lastInput = performance.now();
  schedulePeek(true);
}

function setPeeker(idx: number, c: Costume, up: boolean): void {
  scene.spots.forEach((sv, i) => {
    if (i === idx) {
      sv.inner.innerHTML = rosvoSvg(c);
      sv.peeker.classList.add('active');
      sv.peeker.classList.toggle('up', up);
      sv.peeker.classList.toggle('still', state.still);
    } else {
      sv.peeker.classList.remove('active', 'up', 'still');
      sv.inner.innerHTML = '';
    }
  });
}

const peekerView = () => scene.spots[state.spot];

/** Later cycles: the rosvo is more likely to run to a new spot. */
const moveChance = () => Math.min(0.6, 0.3 + 0.1 * state.cycle);

function schedulePeek(up: boolean): void {
  window.clearTimeout(peekTimer);
  if (state.phase !== 'hiding' || state.moving) return;
  const pv = peekerView();
  pv.peeker.classList.toggle('up', up || state.still || state.hintOn);
  if (state.still) {
    pv.peeker.classList.add('still');
    return;
  }
  const ms = up ? 2400 + Math.random() * 1200 : 800 + Math.random() * 500;
  peekTimer = window.setTimeout(() => {
    if (up && !state.hintOn && !state.busy && Math.random() < moveChance()) void sneakMove();
    else schedulePeek(!up);
  }, ms);
}

/** The rosvo runs, in plain sight, to another hiding spot. It can be caught on the way. */
async function sneakMove(): Promise<void> {
  const gen = ++moveGen;
  const alive = () => gen === moveGen && state.phase === 'hiding';
  const pv = peekerView();
  pv.peeker.classList.remove('up');
  await wait(260);
  if (!alive()) return;
  const fromSpot = SPOTS[state.spot];
  const from = peekFeet(fromSpot);
  pv.peeker.classList.remove('active');
  pv.inner.innerHTML = '';
  state.spot = pickSpot();
  state.moving = true;
  const to = SPOTS[state.spot];
  rosvo.el.className = 'rosvo actor';
  rosvo.at(from.x, from.y).show(true);
  sfx.sneak();
  await runTo(peekFeet(to), 1500, fromSpot.back || to.back ? 200 : 40, alive);
  if (!alive()) return;
  rosvo.show(false);
  state.moving = false;
  setPeeker(state.spot, costume(), false);
  await wait(60);
  schedulePeek(true);
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
      if (dist(p, { x: rosvo.x, y: rosvo.y - 100 }) < 130) startDrag('rosvo', p, pointerId);
      else missFeedback(p, rosvo.el);
      return;
    case 'returning':
      if (!state.itemOut) {
        if (dist(p, stashPoint()) < 120) {
          pullOutLoot();
          startDrag('item', p, pointerId);
        } else missFeedback(p, scene.spots[state.stashSpot].stash);
      } else if (dist(p, victimView().item) < 110) startDrag('item', p, pointerId);
      else missFeedback(p, victimView().item.el);
      return;
    default:
      ripple(scene, p, false);
      sfx.tap();
  }
}

function missFeedback(p: Pt, e: HTMLElement): void {
  ripple(scene, p, false);
  sfx.tap();
  e.classList.remove('nudge');
  void e.offsetWidth;
  e.classList.add('nudge');
}

function tapWhileHiding(p: Pt): void {
  if (state.moving) {
    if (dist(p, { x: rosvo.x, y: rosvo.y - 100 }) < 140) {
      ripple(scene, p, true);
      moveGen++;
      state.moving = false;
      void catchRosvo({ x: rosvo.x, y: rosvo.y }, true);
      return;
    }
    ripple(scene, p, false);
    sfx.miss();
    state.misses++;
    if (state.misses >= 2) state.still = true;
    return;
  }
  const r = spotRect(SPOTS[state.spot]);
  if (p.x >= r.x0 && p.x <= r.x1 && p.y >= r.y0 && p.y <= r.y1) {
    ripple(scene, p, true);
    void catchRosvo(peekFeet(SPOTS[state.spot]), false);
    return;
  }
  // Miss: duck and reappear elsewhere.
  ripple(scene, p, false);
  sfx.miss();
  state.misses++;
  if (state.misses >= 3) {
    missFeedback(p, peekerView().peeker);
    return;
  }
  void relocate();
}

async function relocate(): Promise<void> {
  moveGen++;
  state.busy = true;
  window.clearTimeout(peekTimer);
  peekerView().peeker.classList.remove('up');
  await wait(450);
  state.spot = pickSpot();
  if (state.misses >= 2) state.still = true;
  setPeeker(state.spot, costume(), false);
  state.busy = false;
  await wait(60);
  sfx.giggle();
  schedulePeek(true);
}

async function catchRosvo(from: Pt, onTheRun: boolean): Promise<void> {
  state.busy = true;
  moveGen++;
  window.clearTimeout(peekTimer);
  sfx.catch();
  const pv = peekerView();
  pv.peeker.classList.remove('active', 'up', 'still');
  pv.inner.innerHTML = '';

  // Pop out with hands up.
  rosvo.el.className = 'rosvo actor caught';
  rosvo.flip = false;
  rosvo.at(from.x, from.y).show(true);
  sparkle(scene, { x: from.x, y: from.y - 150 });
  const land = onTheRun ? { x: clamp(from.x, 380, 1000), y: 760 } : SPOTS[state.spot].land;
  await rosvo.moveTo(land.x, land.y, 650, 120, ease.inOut);
  state.rosvoRest = { ...land };
  state.busy = false;
  setPhase('caught');
  state.lastInput = performance.now();
}

function pullOutLoot(): void {
  const sv = scene.spots[state.stashSpot];
  sv.stash.classList.remove('on', 'glow');
  sv.stash.innerHTML = '';
  const def = SPOTS[state.stashSpot];
  const item = victimView().item;
  item.scale = 1;
  item.at(def.x, def.top - 20).show(true);
  item.el.classList.add('glow');
  state.itemOut = true;
  state.itemRest = { x: def.x, y: def.back ? 690 : 700 };
}

function startDrag(what: 'rosvo' | 'item', p: Pt, pointerId: number): void {
  const s = what === 'rosvo' ? rosvo : victimView().item;
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
  const s = d.what === 'rosvo' ? rosvo : victimView().item;
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
  if (dist({ x: rosvo.x, y: rosvo.y - 100 }, JAIL_TARGET) > JAIL_RADIUS) {
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
  face.innerHTML = `<svg viewBox="0 0 120 100" width="76" height="64">${rosvoHead(state.costumes[n])}</svg>`;
  face.classList.add('on', 'sorry');
  state.jailed++;
  scene.car.classList.add('flash');
  window.setTimeout(() => scene.car.classList.remove('flash'), 1200);
  sparkle(scene, win, 10);
  await wait(400);

  // Now find the loot.
  scene.spots[state.stashSpot].stash.classList.add('glow');
  state.busy = false;
  setPhase('returning');
  state.lastInput = performance.now();
}

async function dropItem(): Promise<void> {
  const ov = victimView();
  const owner = victim();
  ov.item.el.classList.remove('dragging');
  if (dist(ov.item, { x: owner.pos.x, y: owner.pos.y - 100 }) > OWNER_RADIUS) {
    state.busy = true;
    sfx.floatBack();
    await ov.item.moveTo(state.itemRest.x, state.itemRest.y, 700, 30, ease.out);
    state.busy = false;
    return;
  }
  state.busy = true;
  const [hx, hy] = handPos(owner);
  ov.item.el.classList.remove('glow');
  void tween(300, (t) => {
    ov.item.scale = 1 - 0.2 * t;
    ov.item.render();
  });
  await ov.item.moveTo(hx, hy, 300, 0, ease.out);
  owner.robbed = false;
  state.stashSpot = -1;
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
  await awardSticker();

  // The rosvot say sorry and the police drive them away.
  await rosvotToCar();
  await driveAway();
  scene.car.classList.remove('flash');

  // Time moves on: day -> evening -> night -> day.
  state.cycle++;
  setTime(TIMES[state.cycle % TIMES.length]);
  for (const v of ownerViews) {
    v.el.classList.add('leave');
    v.item.el.classList.add('leave');
  }
  await wait(1200);
  void startCycle();
}

async function awardSticker(): Promise<void> {
  const n = state.stickers++;
  const st = document.createElement('div');
  st.className = 'sticker';
  st.innerHTML = art.stickerSvg(n);
  scene.fx.appendChild(st);
  const sp = new Sprite(st, 50, 50);
  sp.scale = 0;
  sp.at(600, 360);
  await tween(
    600,
    (t) => {
      sp.scale = 2.2 * t;
      sp.rot = (1 - t) * -40;
      sp.render();
    },
    ease.back,
  );
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
  scene.shelf.querySelector(`[data-slot="${slot}"]`)?.remove();
  st.dataset.slot = String(slot);
  scene.shelf.appendChild(st);
  sp.at(tx - SHELF.x, ty - SHELF.y);
  sparkle(scene, { x: tx, y: ty }, 8);
}

async function rosvotToCar(): Promise<void> {
  const sprites: Sprite[] = [];
  for (let i = 0; i < 3; i++) {
    const e = el('rosvo actor caught released');
    e.innerHTML = `<div class="actor-inner">${rosvoSvg(state.costumes[i])}</div>`;
    const s = new Sprite(e, 60, 200);
    s.scale = 0.6;
    s.at(DOOR.x, DOOR.y).show(false);
    sprites.push(s);
  }
  // Out of the jail, one by one.
  for (let i = 0; i < 3; i++) {
    scene.windows[i].face.classList.remove('on');
    const s = sprites[i];
    s.show(true);
    s.el.classList.add('walking');
    void tween(700, (t) => {
      s.scale = 0.6 + 0.4 * t;
      s.render();
    });
    void s.moveTo(380 + i * 120, 740, 900, 20).then(() => s.el.classList.remove('walking'));
    await wait(300);
  }
  await wait(800);
  // Sorry!
  sfx.sorry();
  for (const s of sprites) {
    s.el.classList.add('bow');
    hearts(scene, { x: s.x, y: s.y - 210 });
  }
  await wait(1500);
  // Hop into the back of the police car.
  const riders = scene.car.querySelector('.riders') as SVGGElement;
  riders.setAttribute('class', 'riders sorry');
  riders.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = sprites[i];
    s.el.classList.remove('bow');
    s.flip = true;
    const x0 = s.x;
    const y0 = s.y;
    const tx = CAR.x + 95;
    const ty = CAR.y + 70;
    await tween(450, (t) => {
      s.x = x0 + (tx - x0) * t;
      s.y = y0 + (ty - y0) * t - Math.sin(Math.PI * t) * 90;
      s.scale = 1 - 0.65 * t;
      s.render();
    });
    s.el.remove();
    riders.insertAdjacentHTML('beforeend', `<g transform="translate(${56 + i * 18} 28) scale(.32)">${rosvoHead(state.costumes[i])}</g>`);
    sfx.pickup();
  }
  await wait(300);
}

async function driveAway(): Promise<void> {
  const car = scene.carSprite;
  sfx.siren();
  scene.car.classList.add('driving');
  await car.moveTo(1350, CAR.y, 2600, 0, (t) => t * t);
  (scene.car.querySelector('.riders') as SVGGElement).innerHTML = '';
  car.at(-320, CAR.y);
  await wait(400);
  await car.moveTo(CAR.x, CAR.y, 1500, 0, ease.out);
  scene.car.classList.remove('driving');
}

// ---------- Hints ----------

export function hintFor(): void {
  if (state.busy || state.drag || state.panelOpen || state.moving) return;
  if (state.phase === 'hiding') {
    const pf = peekFeet(SPOTS[state.spot]);
    showHint(scene, { type: 'tap', at: { x: pf.x + 10, y: pf.y - 200 + PEEK_H / 2 } });
    peekerView().peeker.classList.add('up');
  } else if (state.phase === 'caught') {
    showHint(scene, { type: 'drag', from: { x: rosvo.x, y: rosvo.y - 100 }, to: JAIL_TARGET });
  } else if (state.phase === 'returning') {
    const [hx, hy] = handPos(victim());
    const it = victimView().item;
    showHint(scene, { type: 'drag', from: state.itemOut ? { x: it.x, y: it.y } : stashPoint(), to: { x: hx, y: hy } });
  } else return;
  state.hintOn = true;
  sfx.hint();
}

/** Debug/test hook: logical positions of the current targets. */
export function targets(): Record<string, Pt | null> {
  const ov = ownerViews[state.victim];
  const pf = peekFeet(SPOTS[state.spot]);
  const hidden = state.phase === 'hiding' && !state.moving;
  return {
    rosvo: hidden ? { x: pf.x, y: pf.y - 200 + PEEK_H / 2 } : { x: rosvo.x, y: rosvo.y - 100 },
    jail: JAIL_TARGET,
    item: !ov ? null : state.itemOut || state.stashSpot < 0 ? { x: ov.item.x, y: ov.item.y } : stashPoint(),
    owner: ov ? { x: ov.sprite.x, y: ov.sprite.y - 100 } : null,
  };
}
