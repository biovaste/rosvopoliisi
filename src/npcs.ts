// Townspeople: 5-7 per level. Some live in a building and stand at its door
// (baker, banker, jeweller, elder); the rest stand at random free spots, stroll
// around, and now and then leave while someone new arrives.

import { itemSvg } from './art';
import { makeActor, stand, walkTo } from './actors';
import { FREE_POINTS, depth, dist, doorOf, onBench, type Pt } from './layout';
import { ROLES, ROLE_HOME, ROLE_ITEM, ownerSvg, randomLooks, shuffle, type Role } from './people';
import { state, type Owner } from './state';
import type { Sprite } from './tween';

export interface NpcView {
  sprite: Sprite;
  bubble: HTMLElement;
  item: Sprite;
}

const views = new Map<number, NpcView>();
let nextId = 1;

export const view = (o: Owner): NpcView => views.get(o.id) as NpcView;
export const ownerById = (id: number): Owner | undefined => state.owners.find((o) => o.id === id);

/** Where an owner holds their item. */
export function handPos(o: Owner): Pt {
  const lift = (lifts.get(o.id) ?? 0) * depth(o.pos.y) * o.size;
  return { x: o.pos.x, y: o.pos.y - 62 * depth(o.pos.y) * o.size - lift };
}

/** How far above the feet point the bench seat is (px). */
const SEAT_H = 44;
/** How far a sitting person is lifted (figure units), by owner id. */
const lifts = new Map<number, number>();

/**
 * People (not pets) who stop at the bench sit on it: the whole figure is lifted
 * so the hips rest on the seat, and short legs (children) dangle.
 */
function syncSeat(o: Owner): void {
  const el = view(o).sprite.el;
  const hip = Number(el.querySelector<SVGElement>('svg[data-hip]')?.dataset.hip);
  const sit = !o.walking && !!hip && onBench(o.pos);
  const lift = sit ? Math.max(0, SEAT_H / (depth(o.pos.y) * o.size) - (196 - hip)) : 0;
  lifts.set(o.id, lift);
  el.classList.toggle('sitting', sit);
  el.style.setProperty('--lift', `${lift.toFixed(1)}px`);
  el.style.setProperty('--hip', `${hip || 150}px`);
}

function freePoints(): Pt[] {
  return FREE_POINTS.filter((p) => !state.owners.some((o) => dist(o.pos, p) < 60));
}

function syncItem(o: Owner): void {
  const v = view(o);
  if (o.robbed) return;
  const h = handPos(o);
  v.item.scale = 0.8 * depth(o.pos.y) * Math.max(0.9, o.size);
  v.item.zAdd = o.pos.y - h.y + 2;
  v.item.at(h.x, h.y);
}

function create(role: Role, look: Owner['look'], pos: Pt): Owner {
  const size = role === 'kid' || role === 'kid2' ? 0.84 : role === 'dog' ? 0.8 : role === 'cat' ? 0.66 : 0.94 + Math.random() * 0.12;
  const o: Owner = { id: nextId++, role, look, item: ROLE_ITEM[role], pos: { ...pos }, home: !!ROLE_HOME[role], size, robbed: false, done: false, walking: false };
  const sprite = makeActor(`owner ${role}`, `<div class="actor-inner">${ownerSvg(role, look)}</div>`);
  const bubble = document.createElement('div');
  bubble.className = pos.x > 950 ? 'bubble left' : 'bubble';
  bubble.innerHTML = `<div class="bubble-inner">${itemSvg(o.item)}</div>`;
  sprite.el.appendChild(bubble);
  stand(sprite, pos, size);
  const item = makeActor('item', `<div class="actor-inner">${itemSvg(o.item)}</div>`, 50, 50);
  views.set(o.id, { sprite, bubble, item });
  state.owners.push(o);
  syncSeat(o);
  syncItem(o);
  return o;
}

function remove(o: Owner): void {
  const v = view(o);
  v.sprite.el.remove();
  v.item.el.remove();
  views.delete(o.id);
  lifts.delete(o.id);
  state.owners = state.owners.filter((x) => x !== o);
}

function placeFor(role: Role, taken: Pt[]): Pt | null {
  const home = ROLE_HOME[role];
  if (home) return doorOf(home);
  const free = shuffle(FREE_POINTS.filter((p) => !taken.some((t) => dist(t, p) < 60)));
  return free[0] ?? null;
}

/** Clears the town and places n townspeople. */
export function spawnCrowd(n: number): void {
  for (const o of [...state.owners]) remove(o);
  const roles = shuffle(ROLES).slice(0, n);
  const looks = randomLooks(n);
  const taken: Pt[] = [];
  roles.forEach((role, i) => {
    const p = placeFor(role, taken);
    if (!p) return;
    taken.push(p);
    const o = create(role, looks[i], p);
    view(o).sprite.el.classList.add('enter');
    view(o).item.el.classList.add('enter');
  });
  window.setTimeout(() => {
    for (const o of state.owners) {
      view(o).sprite.el.classList.remove('enter');
      view(o).item.el.classList.remove('enter');
    }
  }, 700);
}

export function fadeOutCrowd(): void {
  for (const o of state.owners) {
    view(o).sprite.el.classList.add('leave');
    view(o).item.el.classList.add('leave');
  }
}

async function walkOwner(o: Owner, to: Pt): Promise<void> {
  const v = view(o);
  o.walking = true;
  syncSeat(o);
  v.bubble.className = to.x > 950 ? 'bubble left' : 'bubble';
  await walkTo(v.sprite, to, {
    k: o.size,
    onStep: () => {
      o.pos = { x: v.sprite.x, y: v.sprite.y };
      syncItem(o);
    },
  });
  o.pos = { ...to };
  v.sprite.flip = false;
  v.sprite.render();
  o.walking = false;
  syncSeat(o);
  syncItem(o);
}

/** A free-standing townsperson strolls to another free spot. */
export async function wander(): Promise<void> {
  const movers = state.owners.filter((o) => !o.home && !o.walking && !o.robbed && o.id !== state.victim);
  const free = freePoints();
  if (!movers.length || !free.length) return;
  const o = shuffle(movers)[0];
  const to = shuffle(free).sort((a, b) => dist(a, o.pos) - dist(b, o.pos))[0];
  await walkOwner(o, to);
}

/** Someone who has not been robbed leaves and a newcomer takes their place. */
export async function swapSomeone(): Promise<void> {
  const leavers = state.owners.filter((o) => !o.walking && !o.robbed && !o.done && o.id !== state.victim);
  if (!leavers.length) return;
  const o = shuffle(leavers)[0];
  const v = view(o);
  if (o.home) {
    v.sprite.el.classList.add('leave');
    v.item.el.classList.add('leave');
    await new Promise((r) => setTimeout(r, 900));
  } else {
    await walkOwner(o, { x: o.pos.x < 600 ? -140 : 1340, y: Math.max(560, o.pos.y) });
  }
  remove(o);

  const present = new Set(state.owners.map((x) => x.role));
  const role = shuffle(ROLES.filter((r) => !present.has(r)))[0];
  if (!role) return;
  const p = placeFor(role, state.owners.map((x) => x.pos));
  if (!p) return;
  const look = randomLooks(1)[0];
  if (ROLE_HOME[role]) {
    const n = create(role, look, p);
    view(n).sprite.el.classList.add('enter');
    view(n).item.el.classList.add('enter');
    return;
  }
  const edge = { x: p.x < 600 ? -140 : 1340, y: Math.max(560, p.y) };
  const n = create(role, look, edge);
  await walkOwner(n, p);
}

/** A random townsperson who still has their item and has not been robbed this cycle. */
export function pickVictim(): Owner | undefined {
  const c = state.owners.filter((o) => !o.done && !o.robbed && !o.walking);
  return shuffle(c)[0];
}

export { syncItem };
