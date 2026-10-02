// The police officer: waits by the car, runs over to cuff a caught rosvo,
// escorts it while the child drags, and drives the police car.

import { makeActor, stand, walkTo } from './actors';
import { sfx } from './audio';
import { CAR, DOOR, OFFICER_IDLE, depth, type Pt } from './layout';
import { officerSvg } from './people';
import type { Scene } from './scene';
import { town } from './town';
import { Sprite, ease, tween, wait } from './tween';

export let officer: Sprite;
let scene: Scene;

/** Officer stands this far to the left of the rosvo (scaled by depth). */
const SIDE = 74;

export function initPolice(s: Scene): void {
  scene = s;
  officer = makeActor('officer', `<div class="actor-inner">${officerSvg(town.police)}</div>`);
  stand(officer, OFFICER_IDLE);
  officer.flip = true;
  officer.render();
}

export function escortPos(rosvo: Sprite): Pt {
  return { x: rosvo.x - SIDE * depth(rosvo.y), y: rosvo.y + 1 };
}

/** Keeps the officer at the rosvo's side (while dragging). */
export function follow(rosvo: Sprite): void {
  const p = escortPos(rosvo);
  officer.scale = depth(rosvo.y);
  officer.flip = false;
  officer.at(p.x, p.y);
}

/** Runs to the rosvo and puts the handcuffs on. */
export async function cuff(rosvo: Sprite): Promise<void> {
  officer.el.classList.remove('escorting');
  await walkTo(officer, escortPos(rosvo), { run: true, speed: 600 });
  officer.flip = false;
  officer.render();
  await wait(120);
  sfx.cuff();
  rosvo.el.classList.add('cuffed');
  officer.el.classList.add('escorting');
  await wait(250);
}

/** Both walk in through the police station door. */
export async function escortIn(rosvo: Sprite): Promise<void> {
  const door = { x: DOOR.x + 30, y: DOOR.y + 20 };
  await Promise.all([
    walkTo(rosvo, door, { speed: 420 }),
    walkTo(officer, { x: door.x - SIDE * depth(door.y), y: door.y }, { speed: 420 }),
  ]);
  await Promise.all([fadeShrink(rosvo), fadeShrink(officer)]);
  officer.el.classList.remove('escorting');
}

async function fadeShrink(s: Sprite): Promise<void> {
  const k = s.scale;
  await tween(300, (t) => {
    s.scale = k * (1 - 0.3 * t);
    s.el.style.opacity = String(1 - t);
    s.render();
  });
  s.el.style.opacity = '0';
}

export async function backToIdle(): Promise<void> {
  officer.el.style.opacity = '1';
  stand(officer, { x: DOOR.x + 30, y: DOOR.y + 20 });
  await walkTo(officer, OFFICER_IDLE);
  officer.flip = true;
  officer.render();
}

export async function intoCar(): Promise<void> {
  officer.el.classList.remove('escorting');
  await walkTo(officer, { x: CAR.x + 200, y: CAR.y + 140 });
  await fadeShrink(officer);
  scene.car.classList.add('driver-in');
}

export async function outOfCar(): Promise<void> {
  scene.car.classList.remove('driver-in');
  officer.el.style.opacity = '1';
  stand(officer, { x: CAR.x + 200, y: CAR.y + 140 });
  await walkTo(officer, OFFICER_IDLE);
  officer.flip = true;
  officer.render();
}

/** Drives off along the street with the rosvot in the back, and comes back empty. */
export async function driveAway(): Promise<void> {
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
