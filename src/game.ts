// Game logic: steal -> hide (and move) -> catch + cuff -> escort to jail ->
// find loot -> return -> celebrate. Difficulty rises with each level (tier()).

import * as art from './art';
import { makeActor, stand, walkTo } from './actors';
import { sfx } from './audio';
import { confetti, hearts, hideHint, ripple, showHint, sparkle } from './fx';
import { CAR, DOOR, JAIL_RADIUS, JAIL_TARGET, OWNER_RADIUS, SHELF, SPOTS, WINDOWS, clamp, depth, dist, peekFeet, peekH, spotRect, type Pt, type SpotDef } from './layout';
import { fadeOutCrowd, handPos, ownerById, pickVictim, spawnCrowd, swapSomeone, syncItem, view, wander } from './npcs';
import { randomCostumes, rosvoHead, rosvoSvg, sackSvg, shuffle, type Costume } from './people';
import { backToIdle, cuff, driveAway, escortIn, follow, intoCar, officer, outOfCar } from './police';
import { Z, type Scene } from './scene';
import { TIMES, setPhase, state, tier, type Owner } from './state';
import { Sprite, ease, tween, wait } from './tween';

let scene: Scene;
let rosvo: Sprite;
let peekTimer = 0;
let townTimer = 0;
/** Bumped to cancel a rosvo's run between spots. */
let moveGen = 0;

// Per-tier tuning: how much of the rosvo / loot shows, peek timing, how often rosvot dash.
const PEEK_OFF = [0, 30, 52, 66];
const LOOT_SHOW = [72, 54, 40, 30];
const UP_MS = [2400, 2000, 1700, 1500];
const DOWN_MS = [800, 1000, 1250, 1450];
const MOVE_CHANCE = [0.25, 0.35, 0.45, 0.55];

export function initGame(s: Scene): void {
  scene = s;
  rosvo = makeActor('rosvo', `<div class="actor-inner"></div><div class="sack"></div>`);
  rosvo.at(1400, 700).show(false);
  setTime('day');
}

const costume = (): Costume => state.costumes[state.jailed];
const victim = (): Owner => ownerById(state.victim) as Owner;

function setTime(t: (typeof TIMES)[number]): void {
  state.time = t;
  document.body.dataset.time = t;
}

// ---------- Cycle ----------

async function startCycle(): Promise<void> {
  state.jailed = 0;
  state.costumes = randomCostumes(3);
  spawnCrowd(5 + (state.cycle % 3));
  scheduleTown();
  await wait(800);
  void startRobbery();
}

export function begin(): void {
  state.cycle = 0;
  state.lastInput = performance.now();
  void startCycle();
}

/** Townspeople stroll around every few seconds. */
function scheduleTown(): void {
  window.clearTimeout(townTimer);
  townTimer = window.setTimeout(
    () => {
      if (state.phase !== 'celebrating' && state.phase !== 'start') void wander();
      scheduleTown();
    },
    4000 + Math.random() * 4000,
  );
}

// ---------- Robbery ----------

function spotOk(i: number, forStash: boolean): boolean {
  const s = SPOTS[i];
  if (s.use !== 'both' && s.use !== (forStash ? 'stash' : 'rosvo')) return false;
  if (i === state.spot || i === state.lastSpot || i === state.stashSpot) return false;
  // Far spots (rooftops, chimneys, the back tree) unlock at later levels.
  if (s.far && tier() < (forStash ? 2 : 1)) return false;
  return true;
}

function pickSpot(forStash = false): number {
  const ok = SPOTS.map((_, i) => i).filter((i) => spotOk(i, forStash));
  const i = shuffle(ok)[0] ?? SPOTS.findIndex((s, j) => s.use !== 'stash' && j !== state.stashSpot);
  if (!forStash) state.lastSpot = state.spot;
  return i;
}

/** Centre of the stashed loot. */
function stashPoint(): Pt {
  const s = SPOTS[state.stashSpot];
  return { x: s.x, y: s.top - LOOT_SHOW[tier()] * s.s + 50 * s.s };
}

async function runTo(p: Pt, hop: number, alive?: () => boolean): Promise<void> {
  await walkTo(rosvo, p, { run: true, speed: 480, hop, ease: ease.inOut, alive });
}

const hopFor = (a: SpotDef | null, b: SpotDef): number => (a?.far || b.far ? 160 : 30);

async function startRobbery(): Promise<void> {
  setPhase('stealing');
  state.busy = true;
  state.misses = 0;
  state.still = false;
  state.moving = false;
  state.itemOut = false;
  state.stashSpot = -1;

  // Sometimes someone leaves town and a newcomer arrives between robberies.
  if (state.jailed > 0 && Math.random() < 0.5) await swapSomeone();

  let o = pickVictim();
  while (!o) {
    await wait(300);
    o = pickVictim();
  }
  state.victim = o.id;
  const v = view(o);
  const c = costume();

  (rosvo.el.querySelector('.actor-inner') as HTMLElement).innerHTML = rosvoSvg(c);
  (rosvo.el.querySelector('.sack') as HTMLElement).innerHTML = sackSvg(c);
  rosvo.el.className = 'actor rosvo';
  rosvo.rot = 0;
  rosvo.el.style.opacity = '';

  // Sneak in from the nearest side, along the street.
  const fromRight = o.pos.x > 600;
  const s = depth(o.pos.y);
  stand(rosvo, { x: fromRight ? 1320 : -120, y: Math.max(560, o.pos.y + 4) }).show(true);
  sfx.sneak();
  await walkTo(rosvo, { x: o.pos.x + (fromRight ? 80 : -80) * s, y: o.pos.y + 4 }, { speed: 300 });

  // Grab!
  sfx.grab();
  o.robbed = true;
  v.sprite.el.classList.add('sad');
  void v.item.moveTo(rosvo.x, rosvo.y - 60 * s, 250, 40);
  await wait(260);
  v.item.show(false);
  rosvo.el.classList.add('has-sack');
  sfx.giggle();
  await wait(250);
  v.bubble.classList.add('on');

  // Stash the loot in one place...
  state.stashSpot = pickSpot(true);
  const stash = SPOTS[state.stashSpot];
  await runTo(peekFeet(stash), hopFor(null, stash));
  putLoot(o);
  rosvo.el.classList.remove('has-sack');
  sfx.grab();
  await wait(300);

  // ...and hide somewhere else.
  state.spot = pickSpot();
  const spot = SPOTS[state.spot];
  await runTo(peekFeet(spot), hopFor(stash, spot));
  rosvo.show(false);

  setPeeker(state.spot, c, true);
  state.busy = false;
  setPhase('hiding');
  state.lastInput = performance.now();
  schedulePeek(true);
}

function putLoot(o: Owner): void {
  const sv = scene.spots[state.stashSpot];
  const def = SPOTS[state.stashSpot];
  const show = LOOT_SHOW[tier()];
  // Loot sits in the peek box, behind the object, with `show` px poking out.
  const y = peekH(def) - def.clip - show * def.s;
  sv.stash.style.transform = `translate3d(${(sv.box.offsetWidth - 100 * def.s) / 2}px,${y}px,0) scale(${def.s})`;
  sv.stash.innerHTML = art.itemSvg(o.item);
  sv.stash.classList.add('on');
  sv.stash.classList.toggle('twinkle', tier() < 2);
}

function setPeeker(idx: number, c: Costume, up: boolean): void {
  scene.spots.forEach((sv, i) => {
    if (i === idx) {
      sv.inner.innerHTML = rosvoSvg(c);
      sv.peeker.classList.add('active');
      sv.peeker.classList.toggle('up', up);
      sv.peeker.classList.toggle('still', state.still);
      sv.peeker.style.setProperty('--off', `${state.still ? 0 : PEEK_OFF[tier()]}px`);
    } else {
      sv.peeker.classList.remove('active', 'up', 'still');
      sv.inner.innerHTML = '';
    }
  });
}

const peekerView = () => scene.spots[state.spot];

function schedulePeek(up: boolean): void {
  window.clearTimeout(peekTimer);
  if (state.phase !== 'hiding' || state.moving) return;
  const pv = peekerView();
  const full = state.still || state.hintOn;
  pv.peeker.style.setProperty('--off', `${full ? 0 : PEEK_OFF[tier()]}px`);
  pv.peeker.classList.toggle('up', up || full);
  if (state.still) {
    pv.peeker.classList.add('still');
    return;
  }
  const t = tier();
  const ms = up ? UP_MS[t] * (1 + Math.random() * 0.5) : DOWN_MS[t] * (1 + Math.random() * 0.6);
  peekTimer = window.setTimeout(() => {
    if (up && !state.hintOn && !state.busy && Math.random() < MOVE_CHANCE[t]) void sneakMove();
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
  rosvo.el.className = 'actor rosvo';
  stand(rosvo, from).show(true);
  sfx.sneak();
  await runTo(peekFeet(to), hopFor(fromSpot, to), alive);
  if (!alive()) return;
  rosvo.show(false);
  state.moving = false;
  setPeeker(state.spot, costume(), false);
  await wait(60);
  schedulePeek(true);
}

// ---------- Input ----------

const rosvoCentre = (): Pt => ({ x: rosvo.x, y: rosvo.y - 100 * rosvo.scale });

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
    case 'caught': {
      const near = dist(p, rosvoCentre()) < 130 || dist(p, { x: officer.x, y: officer.y - 100 * officer.scale }) < 110;
      if (near) startDrag('rosvo', p, pointerId);
      else missFeedback(p, rosvo.el);
      return;
    }
    case 'returning': {
      const item = view(victim()).item;
      if (!state.itemOut) {
        if (dist(p, stashPoint()) < 120) {
          pullOutLoot();
          startDrag('item', p, pointerId);
        } else missFeedback(p, scene.spots[state.stashSpot].stash);
      } else if (dist(p, item) < 110) startDrag('item', p, pointerId);
      else missFeedback(p, item.el);
      return;
    }
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
    if (dist(p, rosvoCentre()) < 140) {
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

  // Pop out with hands up, then the officer comes running with the handcuffs.
  rosvo.el.className = 'actor rosvo caught';
  rosvo.flip = false;
  stand(rosvo, from).show(true);
  rosvo.scale = SPOTS[state.spot].s;
  rosvo.render();
  sparkle(scene, { x: from.x, y: from.y - 150 * rosvo.scale });
  const land = onTheRun ? { x: clamp(from.x, 420, 1100), y: clamp(from.y, 640, 790) } : SPOTS[state.spot].land;
  await walkTo(rosvo, land, { hop: 110, speed: 700, ease: ease.inOut });
  rosvo.flip = false;
  rosvo.render();
  state.rosvoRest = { ...land };
  await cuff(rosvo);
  state.busy = false;
  setPhase('caught');
  state.lastInput = performance.now();
}

function pullOutLoot(): void {
  const sv = scene.spots[state.stashSpot];
  const p = stashPoint();
  sv.stash.classList.remove('on', 'glow', 'twinkle');
  sv.stash.innerHTML = '';
  const def = SPOTS[state.stashSpot];
  const item = view(victim()).item;
  item.scale = def.s;
  item.zAdd = 50;
  item.at(p.x, p.y).show(true);
  item.el.classList.add('glow');
  state.itemOut = true;
  state.itemRest = def.far ? { x: def.land.x, y: 600 } : { x: def.x, y: Math.min(def.top + def.h * 0.5, 740) };
}

function startDrag(what: 'rosvo' | 'item', p: Pt, pointerId: number): void {
  const s = what === 'rosvo' ? rosvo : view(victim()).item;
  state.drag = { pointerId, what, dx: s.x - p.x, dy: s.y - p.y };
  s.el.classList.add('dragging');
  s.zFix = Z.drag;
  if (what === 'rosvo') {
    officer.zFix = Z.drag - 1;
    officer.el.classList.add('walking');
  }
  sfx.pickup();
  ripple(scene, p, true);
  if (what === 'rosvo') setPhase('carrying');
}

export function onMove(p: Pt, pointerId: number): void {
  const d = state.drag;
  if (!d || d.pointerId !== pointerId) return;
  state.lastInput = performance.now();
  if (d.what === 'rosvo') {
    const y = clamp(p.y + d.dy, 470, 800);
    rosvo.scale = depth(y);
    rosvo.at(p.x + d.dx, y);
    follow(rosvo);
  } else {
    const it = view(victim()).item;
    it.scale = depth(p.y + d.dy + 60);
    it.at(p.x + d.dx, p.y + d.dy);
  }
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
  rosvo.zFix = null;
  officer.zFix = null;
  officer.el.classList.remove('walking');
  state.busy = true;
  if (dist(rosvoCentre(), JAIL_TARGET) > JAIL_RADIUS) {
    sfx.floatBack();
    await walkTo(rosvo, state.rosvoRest, { speed: 500, ease: ease.out, onStep: () => follow(rosvo) });
    rosvo.flip = false;
    follow(rosvo);
    state.busy = false;
    setPhase('caught');
    return;
  }
  // Escorted into the station.
  await escortIn(rosvo);
  rosvo.show(false);
  rosvo.el.style.opacity = '';
  const n = state.jailed;
  sfx.clang();
  const face = scene.windows[n].face;
  face.innerHTML = `<svg viewBox="0 0 120 100" width="76" height="64">${rosvoHead(state.costumes[n])}</svg>`;
  face.classList.add('on', 'sorry');
  state.jailed++;
  scene.car.classList.add('flash');
  window.setTimeout(() => scene.car.classList.remove('flash'), 1200);
  sparkle(scene, WINDOWS[n], 10);
  void backToIdle();
  await wait(300);

  // Now find the loot.
  scene.spots[state.stashSpot].stash.classList.add('glow');
  state.busy = false;
  setPhase('returning');
  state.lastInput = performance.now();
}

async function dropItem(): Promise<void> {
  const o = victim();
  const v = view(o);
  v.item.el.classList.remove('dragging');
  v.item.zFix = null;
  if (dist(v.item, { x: o.pos.x, y: o.pos.y - 100 * depth(o.pos.y) }) > OWNER_RADIUS) {
    state.busy = true;
    sfx.floatBack();
    await v.item.moveTo(state.itemRest.x, state.itemRest.y, 700, 30, ease.out);
    v.item.scale = depth(state.itemRest.y + 60);
    v.item.render();
    state.busy = false;
    return;
  }
  state.busy = true;
  const h = handPos(o);
  v.item.el.classList.remove('glow');
  await v.item.moveTo(h.x, h.y, 300, 0, ease.out);
  o.robbed = false;
  o.done = true;
  syncItem(o);
  state.stashSpot = -1;
  v.bubble.classList.remove('on');
  v.sprite.el.classList.remove('sad');
  v.sprite.el.classList.add('happy');
  sfx.cheer();
  sparkle(scene, { x: h.x, y: h.y - 60 }, 12);
  hearts(scene, { x: h.x, y: h.y - 150 * depth(o.pos.y) });
  await wait(1400);
  v.sprite.el.classList.remove('happy');
  state.victim = -1;

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

  // The rosvot say sorry, hop into the police car and the officer drives them away.
  await rosvotToCar();
  await intoCar();
  await driveAway();
  scene.car.classList.remove('flash');
  await outOfCar();

  // Time moves on: day -> evening -> night -> day.
  state.cycle++;
  setTime(TIMES[state.cycle % TIMES.length]);
  fadeOutCrowd();
  await wait(1100);
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
  const out = { x: DOOR.x + 30, y: DOOR.y + 24 };
  for (let i = 0; i < 3; i++) {
    const s = makeActor('rosvo caught released', `<div class="actor-inner">${rosvoSvg(state.costumes[i])}</div>`);
    stand(s, out).show(false);
    sprites.push(s);
  }
  for (let i = 0; i < 3; i++) {
    scene.windows[i].face.classList.remove('on');
    const s = sprites[i];
    s.show(true);
    void walkTo(s, { x: 340 + i * 110, y: 640 }, { speed: 260 });
    await wait(350);
  }
  await wait(1200);
  sfx.sorry();
  for (const s of sprites) {
    s.el.classList.add('bow');
    hearts(scene, { x: s.x, y: s.y - 210 * s.scale });
  }
  await wait(1500);
  const riders = scene.car.querySelector('.riders') as SVGGElement;
  riders.setAttribute('class', 'riders sorry');
  riders.innerHTML = '';
  for (let i = 0; i < 3; i++) {
    const s = sprites[i];
    s.el.classList.remove('bow');
    await walkTo(s, { x: CAR.x + 110, y: CAR.y + 130 }, { hop: 70, speed: 500 });
    s.el.remove();
    riders.insertAdjacentHTML('beforeend', `<g transform="translate(${56 + i * 18} 28) scale(.32)">${rosvoHead(state.costumes[i])}</g>`);
    sfx.pickup();
  }
  await wait(300);
}

// ---------- Hints ----------

export function hintFor(): void {
  if (state.busy || state.drag || state.panelOpen || state.moving) return;
  if (state.phase === 'hiding') {
    const s = SPOTS[state.spot];
    const pf = peekFeet(s);
    showHint(scene, { type: 'tap', at: { x: pf.x + 10, y: pf.y - 200 * s.s + peekH(s) / 2 } });
    peekerView().peeker.style.setProperty('--off', '0px');
    peekerView().peeker.classList.add('up');
  } else if (state.phase === 'caught') {
    showHint(scene, { type: 'drag', from: rosvoCentre(), to: JAIL_TARGET });
  } else if (state.phase === 'returning') {
    const it = view(victim()).item;
    showHint(scene, { type: 'drag', from: state.itemOut ? { x: it.x, y: it.y } : stashPoint(), to: handPos(victim()) });
  } else return;
  state.hintOn = true;
  sfx.hint();
}

/** Debug/test hook: logical positions of the current targets. */
export function targets(): Record<string, Pt | null> {
  const o = ownerById(state.victim);
  const s = SPOTS[state.spot];
  const pf = peekFeet(s);
  const hidden = state.phase === 'hiding' && !state.moving;
  const item = o ? view(o).item : null;
  return {
    rosvo: hidden ? { x: pf.x, y: pf.y - 200 * s.s + peekH(s) / 2 } : rosvoCentre(),
    jail: JAIL_TARGET,
    item: !item ? null : state.itemOut || state.stashSpot < 0 ? { x: item.x, y: item.y } : stashPoint(),
    owner: o ? { x: o.pos.x, y: o.pos.y - 100 * depth(o.pos.y) } : null,
    officer: { x: officer.x, y: officer.y - 100 * officer.scale },
  };
}
