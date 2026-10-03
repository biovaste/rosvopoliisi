// Fire mode round: fire starts -> tap the alarm -> truck rolls out -> drag it
// along the roads to the fire -> tap the hose -> water the flames -> saved ->
// truck drives home. Three fires light the station's three lamps and earn a
// sticker, then the time of day moves on.

import { stickerSvg } from '../art';
import { sfx, sprayStart, sprayStop } from '../audio';
import { confetti, hearts, hideHint, ripple, showHint, sparkle } from '../fx';
import type { Pt } from '../layout';
import { ownerSvg, pick, randomLook, type Role } from '../people';
import { FIRE_HELMET, showEndScreen, timeIsUp } from '../session';
import { TIMES, state } from '../state';
import { Sprite, ease, tween, wait } from '../tween';
import { flameSvg } from './art';
import { ALARM, GARAGE_IN, HOUSES, LAMPS, SHELF, STATION, STATION_EXIT, roadPath, snapToRoad, type House } from './layout';
import { FZ, type FireScene } from './scene';

export type FirePhase = 'start' | 'calm' | 'alarm' | 'rollout' | 'drive' | 'parking' | 'hose' | 'spray' | 'saved' | 'home' | 'celebrating' | 'ended';

interface Flame {
  el: HTMLElement;
  x: number;
  y: number;
  k: number;
  hp: number;
  /** Shown size (grows in when the flame appears). */
  grow: number;
  out: boolean;
}

interface Resident {
  s: Sprite;
}

const fs = {
  phase: 'start' as FirePhase,
  busy: false,
  /** Fires put out in this level (0..3). */
  done: 0,
  house: null as House | null,
  flames: [] as Flame[],
  burned: new Set<number>(),
  residents: [] as Resident[],
  /** Truck route still to drive, and who holds the truck. */
  path: [] as Pt[],
  dragId: null as number | null,
  /** Water is flowing to this point. */
  sprayAt: null as Pt | null,
  sprayUntil: 0,
  pointerDown: false,
};

let scene: FireScene;
let smokeTimer = 0;
let crackleTimer = 0;
let arrive: (() => void) | null = null;

const SCALE_FF = 0.5;
const SCALE_PERSON = 0.45;
const TRUCK_SPEED = 520;
/** How close the truck has to come to the parking spot to snap in. */
const PARK_RADIUS = 90;
const SPLASH_R = 62;
const FLAMES = [2, 3, 4, 5];
const DPS = [85, 75, 68, 62];
const REGROW = [0, 0, 6, 10];

const tier = () => Math.min(state.cycle, 3);

function setPhase(p: FirePhase): void {
  fs.phase = p;
  document.body.dataset.fire = p;
}

export function initFire(s: FireScene): void {
  scene = s;
  setTime('day');
  setPhase('start');
}

function setTime(t: (typeof TIMES)[number]): void {
  state.time = t;
  document.body.dataset.time = t;
}

export function beginFire(): void {
  state.cycle = 0;
  state.startedAt = performance.now();
  state.lastInput = performance.now();
  void startLevel();
}

async function startLevel(): Promise<void> {
  fs.done = 0;
  fs.burned.clear();
  scene.lamps.forEach((l) => l.classList.remove('on'));
  // The painters came: sooty houses are clean again.
  scene.houses.forEach((h) => h.el.classList.remove('sooty'));
  await wait(1500);
  void startFire();
}

// ---------- Fire starts ----------

function pickHouse(): House {
  const t = tier();
  const rows = t === 0 ? [1] : t === 1 ? [1, 2] : [0, 1, 2];
  const ok = HOUSES.filter((h) => rows.includes(h.row) && !fs.burned.has(h.id));
  // At the first level prefer houses close to the station.
  if (t === 0) ok.sort((a, b) => a.x0 - b.x0);
  return (t === 0 ? ok.slice(0, 2)[Math.floor(Math.random() * Math.min(2, ok.length))] : pick(ok)) ?? HOUSES[5];
}

async function startFire(): Promise<void> {
  setPhase('calm');
  fs.busy = true;
  const h = pickHouse();
  fs.house = h;
  fs.burned.add(h.id);
  await wait(1200);

  // Smoke first, then flames; the residents come out to the sidewalk.
  startSmoke();
  sfx.crackle();
  crackleTimer = window.setInterval(() => {
    if (fs.flames.some((f) => !f.out)) sfx.crackle();
  }, 2600);
  void residentsOut(h);
  const spots = h.fires.slice(0, FLAMES[tier()]);
  for (const p of spots) {
    addFlame(p);
    await wait(500);
  }

  // The bell bubble and the pulsing alarm button ask for help.
  const top = Math.min(...spots.map((p) => p.y)) - 70;
  scene.bubble.style.transform = `translate3d(${(h.x0 + h.x1) / 2 - 40}px,${top - 80}px,0)`;
  scene.bubble.classList.add('on');
  scene.alarm.classList.add('ready');
  fs.busy = false;
  setPhase('alarm');
  state.lastInput = performance.now();
}

function addFlame(p: Pt & { k: number }): void {
  const el = document.createElement('div');
  el.className = 'flame';
  el.innerHTML = flameSvg();
  el.style.animationDelay = `-${(Math.random() * 0.6).toFixed(2)}s`;
  scene.fire.appendChild(el);
  const f: Flame = { el, x: p.x, y: p.y, k: p.k, hp: 100, grow: 0, out: false };
  fs.flames.push(f);
  void tween(700, (t) => {
    f.grow = t;
    drawFlame(f);
  }, ease.back);
}

function drawFlame(f: Flame): void {
  const s = f.k * f.grow * (0.3 + 0.7 * (f.hp / 100));
  f.el.style.transform = `translate3d(${(f.x - 30).toFixed(1)}px,${(f.y - 76).toFixed(1)}px,0) scale(${s.toFixed(3)})`;
}

const flameCentre = (f: Flame): Pt => ({ x: f.x, y: f.y - 36 * f.k * (0.3 + 0.7 * (f.hp / 100)) });

function startSmoke(): void {
  window.clearInterval(smokeTimer);
  smokeTimer = window.setInterval(() => {
    const live = fs.flames.filter((f) => !f.out);
    if (!live.length) return;
    const f = pick(live);
    puff('smoke', { x: f.x + (Math.random() - 0.5) * 20, y: f.y - 60 * f.k });
  }, 380);
}

function stopSmoke(): void {
  window.clearInterval(smokeTimer);
  window.clearInterval(crackleTimer);
}

function puff(cls: 'smoke' | 'steam', p: Pt): void {
  const d = document.createElement('div');
  d.className = `puff ${cls}`;
  d.style.left = `${p.x}px`;
  d.style.top = `${p.y}px`;
  d.style.setProperty('--dx', `${((Math.random() - 0.3) * 60).toFixed(0)}px`);
  d.style.zIndex = String(FZ.smoke);
  scene.stage.appendChild(d);
  d.addEventListener('animationend', () => d.remove());
}

// ---------- Residents ----------

const RES_ROLES: Role[] = ['kid', 'kid2', 'elder', 'fancy', 'gardener', 'postie', 'baker', 'worker'];

async function residentsOut(h: House): Promise<void> {
  const cx = (h.x0 + h.x1) / 2;
  const roles = [pick(RES_ROLES), pick(['cat', 'dog', 'kid', 'kid2'] as Role[])];
  const spots = [h.wait, { x: h.wait.x - 40, y: h.wait.y + 4 }];
  roles.forEach((role, i) => {
    const el = document.createElement('div');
    el.className = 'actor owner fres sad enter';
    el.innerHTML = `<div class="actor-inner">${ownerSvg(role, randomLook())}</div>`;
    scene.stage.appendChild(el);
    const s = new Sprite(el, 60, 200);
    s.depthZ = true;
    s.scale = SCALE_PERSON * (role === 'cat' || role === 'dog' ? 0.8 : 1);
    const from = doorstep(h);
    s.at(from.x, from.y);
    fs.residents.push({ s });
    void (async () => {
      await wait(300 + i * 400);
      await walk(s, spots[i], 160);
      // Turn to watch the house.
      s.flip = spots[i].x > cx;
      s.render();
    })();
  });
}

/** Where residents come out: the front door (row 2 houses: the back garden, facing street 2). */
function doorstep(h: House): Pt {
  const cx = (h.x0 + h.x1) / 2;
  return h.row === 2 ? { x: cx, y: h.roofTop - 6 } : { x: cx, y: h.base + 4 };
}

async function walk(s: Sprite, p: Pt, speed: number): Promise<void> {
  const ms = Math.max(200, (Math.hypot(p.x - s.x, p.y - s.y) / speed) * 1000);
  if (Math.abs(p.x - s.x) > 3) s.flip = p.x < s.x;
  s.el.classList.add('walking');
  await s.moveTo(p.x, p.y, ms, 0, ease.linear);
  s.el.classList.remove('walking');
}

async function residentsHome(h: House): Promise<void> {
  const list = fs.residents;
  fs.residents = [];
  await Promise.all(
    list.map(async ({ s }, i) => {
      await wait(i * 300);
      await walk(s, doorstep(h), 160);
      s.el.classList.add('leave');
      await wait(900);
      s.el.remove();
    }),
  );
}

// ---------- Alarm and truck ----------

async function pressAlarm(): Promise<void> {
  fs.busy = true;
  setPhase('rollout');
  scene.alarm.classList.remove('ready');
  scene.alarm.classList.add('pressed');
  scene.bubble.classList.remove('on');
  sfx.bell();
  sparkle(scene, ALARM, 10);
  await wait(900);
  scene.alarm.classList.remove('pressed');
  // The garage door rolls up and the truck comes out with lights and siren.
  scene.door.classList.add('open');
  const t = scene.truck;
  setView('front', false);
  t.zFix = STATION.base + 1;
  t.at(GARAGE_IN.x, GARAGE_IN.y).show(true);
  t.el.classList.add('flash');
  await wait(700);
  sfx.fireSiren();
  await t.moveTo(STATION_EXIT.x, STATION_EXIT.y, 800, 0, ease.inOut);
  t.zFix = null;
  t.render();
  scene.door.classList.remove('open');
  fs.busy = false;
  setPhase('drive');
  state.lastInput = performance.now();
}

type View = 'side' | 'front' | 'back';

function setView(v: View, flip: boolean): void {
  const t = scene.truck;
  if (t.el.dataset.view !== v) t.el.dataset.view = v;
  const f = v === 'side' && flip;
  if (t.flip !== f) {
    t.flip = f;
    t.render();
  }
}

/** Moves the truck along fs.path; called every frame. */
function driveStep(dt: number): void {
  const t = scene.truck;
  let left = TRUCK_SPEED * dt;
  let moved = false;
  while (left > 0 && fs.path.length) {
    const p = fs.path[0];
    const dx = p.x - t.x;
    const dy = p.y - t.y;
    const len = Math.hypot(dx, dy);
    if (len > 0.5) {
      if (Math.abs(dx) > Math.abs(dy)) setView('side', dx < 0);
      else setView(dy > 0 ? 'front' : 'back', false);
    }
    if (len <= left) {
      t.x = p.x;
      t.y = p.y;
      left -= len;
      fs.path.shift();
    } else {
      t.x += (dx / len) * left;
      t.y += (dy / len) * left;
      left = 0;
    }
    moved = true;
  }
  t.el.classList.toggle('moving', moved);
  if (moved) t.render();
  if (!fs.path.length && arrive) {
    const a = arrive;
    arrive = null;
    a();
  }
  if (moved && fs.phase === 'drive' && fs.house && Math.hypot(t.x - fs.house.curb.x, t.y - fs.house.curb.y) < PARK_RADIUS) void park();
}

function driveTo(p: Pt): Promise<void> {
  fs.path = roadPath(scene.truck, p);
  return new Promise((r) => (arrive = r));
}

async function park(): Promise<void> {
  const h = fs.house as House;
  setPhase('parking');
  fs.busy = true;
  fs.dragId = null;
  scene.truck.el.classList.remove('dragging');
  sfx.horn();
  await driveTo(h.curb);
  setView('side', false);
  scene.truck.el.classList.remove('moving');
  await wait(300);

  // The firefighter hops out of the cab and goes to the sidewalk by the house.
  const ff = scene.firefighter;
  ff.el.classList.remove('hose');
  ff.scale = SCALE_FF;
  ff.at(scene.truck.x + 66, h.curb.y + 2).show(true);
  await walk(ff, h.stand, 200);
  ff.flip = (h.x0 + h.x1) / 2 < ff.x;
  ff.render();
  scene.truck.el.classList.add('reel-ready');
  fs.busy = false;
  setPhase('hose');
  state.lastInput = performance.now();
}

const reelPos = (): Pt => ({ x: scene.truck.x + 16, y: scene.truck.y - 39 });

function nozzle(): Pt {
  const ff = scene.firefighter;
  return { x: ff.x + (ff.flip ? -1 : 1) * 74 * ff.scale, y: ff.y - 96 * ff.scale };
}

function hands(): Pt {
  const ff = scene.firefighter;
  return { x: ff.x + (ff.flip ? -1 : 1) * 36 * ff.scale, y: ff.y - 78 * ff.scale };
}

function drawHose(on: boolean): void {
  const d = on
    ? (() => {
        const a = reelPos();
        const b = hands();
        return `M${a.x.toFixed(1)} ${a.y.toFixed(1)} Q${((a.x + b.x) / 2).toFixed(1)} ${(Math.max(a.y, b.y) + 40).toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
      })()
    : '';
  for (const p of scene.hose) p.setAttribute('d', d);
}

function grabHose(): void {
  scene.truck.el.classList.remove('reel-ready');
  scene.firefighter.el.classList.add('hose');
  drawHose(true);
  sfx.pickup();
  setPhase('spray');
  state.lastInput = performance.now();
}

// ---------- Water ----------

function sprayStep(now: number, dt: number): void {
  const flowing = !!fs.sprayAt && (fs.pointerDown || now < fs.sprayUntil);
  if (!flowing) {
    if (scene.water.getAttribute('d')) {
      scene.water.setAttribute('d', '');
      scene.waterCore.setAttribute('d', '');
      scene.splash.classList.remove('on');
      sprayStop();
    }
  } else {
    const at = fs.sprayAt as Pt;
    const ff = scene.firefighter;
    const flip = at.x < ff.x;
    if (ff.flip !== flip) {
      ff.flip = flip;
      ff.render();
      drawHose(true);
    }
    const n = nozzle();
    const lift = 40 + Math.hypot(at.x - n.x, at.y - n.y) * 0.25;
    const d = `M${n.x.toFixed(1)} ${n.y.toFixed(1)} Q${((n.x + at.x) / 2).toFixed(1)} ${(Math.min(n.y, at.y) - lift).toFixed(1)} ${at.x.toFixed(1)} ${at.y.toFixed(1)}`;
    scene.water.setAttribute('d', d);
    scene.waterCore.setAttribute('d', d);
    scene.splash.style.transform = `translate3d(${at.x.toFixed(1)}px,${at.y.toFixed(1)}px,0)`;
    scene.splash.classList.add('on');
    sprayStart();
  }

  const t = tier();
  for (const f of fs.flames) {
    if (f.out) continue;
    const hit = flowing && Math.hypot(flameCentre(f).x - (fs.sprayAt as Pt).x, flameCentre(f).y - (fs.sprayAt as Pt).y) < SPLASH_R;
    if (hit) f.hp -= DPS[t] * dt;
    else if (fs.phase === 'spray' && f.hp < 100) f.hp = Math.min(100, f.hp + REGROW[t] * dt);
    else continue;
    if (f.hp <= 0) void flameOut(f);
    else drawFlame(f);
  }
}

async function flameOut(f: Flame): Promise<void> {
  f.out = true;
  f.hp = 0;
  sfx.sizzle();
  const c = flameCentre(f);
  for (let i = 0; i < 3; i++) window.setTimeout(() => puff('steam', { x: c.x + (i - 1) * 12, y: c.y }), i * 90);
  f.el.classList.add('gone');
  window.setTimeout(() => f.el.remove(), 500);
  if (fs.flames.every((x) => x.out) && fs.phase === 'spray') void saved();
}

async function saved(): Promise<void> {
  const h = fs.house as House;
  setPhase('saved');
  fs.busy = true;
  fs.sprayAt = null;
  fs.pointerDown = false;
  fs.flames = [];
  stopSmoke();
  await wait(250);
  sprayStop();
  scene.houses[h.id].el.classList.add('sooty');
  sfx.cheer();
  for (const { s } of fs.residents) {
    s.el.classList.remove('sad');
    s.el.classList.add('happy');
    hearts(scene, { x: s.x, y: s.y - 200 * s.scale });
  }
  const lamp = scene.lamps[fs.done];
  lamp.classList.add('on');
  sparkle(scene, LAMPS[fs.done], 10);
  fs.done++;
  await wait(1600);

  // Roll up the hose, back into the truck and home to the station.
  scene.firefighter.el.classList.remove('hose');
  drawHose(false);
  void residentsHome(h);
  await walk(scene.firefighter, { x: scene.truck.x + 66, y: h.curb.y + 2 }, 220);
  scene.firefighter.show(false);
  setPhase('home');
  await wait(200);
  await driveTo(STATION_EXIT);
  setView('back', false);
  scene.door.classList.add('open');
  await wait(500);
  scene.truck.zFix = STATION.base + 1;
  await scene.truck.moveTo(GARAGE_IN.x, GARAGE_IN.y, 800, 0, ease.inOut);
  scene.truck.el.classList.remove('flash');
  scene.door.classList.remove('open');
  await wait(700);
  scene.truck.show(false);
  fs.house = null;

  if (fs.done >= 3) void celebrate();
  else {
    fs.busy = false;
    void startFire();
  }
}

// ---------- Level end ----------

async function celebrate(): Promise<void> {
  setPhase('celebrating');
  fs.busy = true;
  sfx.fireSiren();
  confetti(scene);
  await wait(400);
  sfx.fanfare();
  await awardSticker();
  await wait(1200);
  if (timeIsUp()) {
    setPhase('ended');
    showEndScreen(document.getElementById('app') as HTMLElement, FIRE_HELMET);
    return;
  }
  state.cycle++;
  setTime(TIMES[state.cycle % TIMES.length]);
  fs.busy = false;
  void startLevel();
}

async function awardSticker(): Promise<void> {
  const n = state.stickers++;
  const st = document.createElement('div');
  st.className = 'sticker';
  st.innerHTML = stickerSvg(n);
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
  scene.shelf.classList.add('show');
  if (n >= 5) scene.shelf.classList.add('two');
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

// ---------- Input ----------

const truckCentre = (): Pt => ({ x: scene.truck.x, y: scene.truck.y - 40 });
const near = (a: Pt, b: Pt, r: number) => Math.hypot(a.x - b.x, a.y - b.y) < r;

function soft(p: Pt, el?: HTMLElement): void {
  ripple(scene, p, false);
  sfx.tap();
  if (el) {
    el.classList.remove('nudge');
    void el.offsetWidth;
    el.classList.add('nudge');
  }
}

export function onDown(p: Pt, pointerId: number): void {
  state.lastInput = performance.now();
  if (state.hintOn) {
    state.hintOn = false;
    hideHint(scene);
  }
  if (fs.busy) return soft(p);
  switch (fs.phase) {
    case 'alarm':
      if (near(p, ALARM, 75)) {
        ripple(scene, p, true);
        void pressAlarm();
      } else soft(p, scene.alarm);
      return;
    case 'drive':
      if (near(p, truckCentre(), 110)) {
        fs.dragId = pointerId;
        scene.truck.el.classList.add('dragging');
        ripple(scene, p, true);
        sfx.pickup();
        fs.path = roadPath(scene.truck, snapToRoad(p).pt);
      } else soft(p, scene.truck.el);
      return;
    case 'hose':
      if (near(p, reelPos(), 80) || near(p, { x: scene.firefighter.x, y: scene.firefighter.y - 40 }, 70)) {
        ripple(scene, p, true);
        grabHose();
      } else soft(p, scene.truck.el);
      return;
    case 'spray':
      fs.pointerDown = true;
      fs.sprayAt = p;
      fs.sprayUntil = performance.now() + 400;
      return;
    default:
      soft(p);
  }
}

export function onMove(p: Pt, pointerId: number): void {
  if (fs.phase === 'spray' && fs.pointerDown) {
    state.lastInput = performance.now();
    fs.sprayAt = p;
    return;
  }
  if (fs.dragId !== pointerId || fs.phase !== 'drive') return;
  state.lastInput = performance.now();
  fs.path = roadPath(scene.truck, snapToRoad(p).pt);
}

export function onUp(p: Pt, pointerId: number): void {
  if (fs.pointerDown) {
    fs.pointerDown = false;
    fs.sprayAt = p;
    return;
  }
  if (fs.dragId !== pointerId) return;
  onMove(p, pointerId);
  fs.dragId = null;
  scene.truck.el.classList.remove('dragging');
}

// ---------- Per frame ----------

let last = 0;
export function fireFrame(now: number): void {
  const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
  last = now;
  driveStep(dt);
  if (fs.phase === 'spray' || fs.phase === 'saved') sprayStep(now, dt);
}

// ---------- Hints ----------

export function fireHint(): void {
  if (fs.busy || fs.dragId !== null || fs.pointerDown || state.panelOpen) return;
  const h = fs.house;
  if (fs.phase === 'alarm') showHint(scene, { type: 'tap', at: ALARM });
  else if (fs.phase === 'drive' && h) showHint(scene, { type: 'drag', from: truckCentre(), to: h.curb });
  else if (fs.phase === 'hose') showHint(scene, { type: 'tap', at: reelPos() });
  else if (fs.phase === 'spray') {
    const f = fs.flames.filter((x) => !x.out).sort((a, b) => b.hp - a.hp)[0];
    if (!f) return;
    showHint(scene, { type: 'tap', at: flameCentre(f) });
  } else return;
  state.hintOn = true;
  sfx.hint();
}

export const firePhase = (): FirePhase => fs.phase;

/** Test hook: the game's state and where its targets are (logical coordinates). */
export function fireDebug() {
  const live = fs.flames.filter((f) => !f.out);
  return {
    state: { phase: fs.phase, busy: fs.busy, done: fs.done, cycle: state.cycle, time: state.time, stickers: state.stickers, flames: live.length, house: fs.house?.id ?? -1, hint: state.hintOn, truck: { x: scene.truck.x, y: scene.truck.y } },
    targets: {
      alarm: ALARM,
      truck: truckCentre(),
      curb: fs.house ? fs.house.curb : null,
      reel: reelPos(),
      flame: live[0] ? flameCentre(live[0]) : null,
    },
  };
}
