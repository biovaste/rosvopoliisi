// Builds the fire-mode town. Like the police town, everything is in one layer
// sorted by z-index = the y of an element's bottom edge. Fire, smoke and water
// are drawn above everything (houses never overlap between rows, so this is safe).

import { handSvg } from '../art';
import type { FxHost } from '../fx';
import { firefighterHead, firefighterSvg, type Look } from '../people';
import { Sprite } from '../tween';
import * as art from './art';
import { ALARM, GARAGE, GARAGE_IN, H, HOUSES, LAMPS, SHELF, STATION, W, type House } from './layout';

export const FZ = { tint: 4000, smoke: 4050, fire: 4100, hose: 3500, water: 4200, bubble: 4300, shelf: 5000, fx: 6000, hand: 7000 };

export interface HouseView {
  house: House;
  el: HTMLElement;
}

export interface FireScene extends FxHost {
  root: HTMLElement;
  stage: HTMLElement;
  houses: HouseView[];
  door: HTMLElement;
  alarm: HTMLElement;
  lamps: HTMLElement[];
  truck: Sprite;
  firefighter: Sprite;
  /** Layer for flames and smoke. */
  fire: HTMLElement;
  /** Hose outline and fill (same path). */
  hose: SVGPathElement[];
  water: SVGPathElement;
  waterCore: SVGPathElement;
  splash: HTMLElement;
  bubble: HTMLElement;
  shelf: HTMLElement;
}

function div(cls: string, parent: HTMLElement, html = ''): HTMLDivElement {
  const d = document.createElement('div');
  d.className = cls;
  d.innerHTML = html;
  parent.appendChild(d);
  return d;
}

function place(el: HTMLElement, x: number, y: number, z: number): HTMLElement {
  el.style.transform = `translate3d(${x}px,${y}px,0)`;
  el.style.zIndex = String(Math.round(z));
  return el;
}

/** Trees in the gaps between houses and in the park: x, bottom y, radius, colour. */
const TREES: [number, number, number, string][] = [
  [235, 286, 22, '#5aac44'],
  [465, 286, 27, '#4e9f3d'],
  [729, 286, 22, '#6cbf4a'],
  [957, 286, 20, '#5aac44'],
  [1190, 286, 20, '#4e9f3d'],
  [64, 676, 26, '#4e9f3d'],
  [326, 708, 22, '#6cbf4a'],
  [250, 800, 30, '#5aac44'],
  [602, 800, 18, '#6cbf4a'],
  [1018, 800, 20, '#4e9f3d'],
  [862, 470, 16, '#6cbf4a'],
];

export function buildFireScene(app: HTMLElement, look: Look): FireScene {
  const root = div('game fire-game', app);
  const stage = div('stage', root);
  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;

  div('sky day', stage);
  div('sky evening', stage);
  div('sky night', stage);
  const sky = div('skybits', stage);
  const clouds = div('clouds', sky);
  for (let i = 0; i < 3; i++) {
    div(
      `cloud c${i}`,
      clouds,
      `<svg viewBox="0 0 170 74" width="140" height="61"><path d="M20 64 Q0 64 6 46 Q10 30 32 34 Q40 8 72 14 Q94 0 114 20 Q146 12 152 38 Q170 46 158 64Z" fill="#fff" stroke="#3a2c2a" stroke-width="2.5" opacity=".95"/></svg>`,
    );
  }
  place(div('prop fire-hills', stage, art.hillsSvg()), 0, 0, 3);
  place(div('prop', stage, art.groundSvg()), 0, 0, 2);

  // Houses.
  const houses: HouseView[] = HOUSES.map((house) => {
    const b = art.houseBox(house);
    const el = place(div('prop fhouse', stage, art.houseSvg(house)), b.x, b.y, house.base);
    return { house, el };
  });

  // Fire station: building, garage door, alarm button and progress lamps.
  const sb = art.stationBox();
  place(div('prop', stage, art.stationSvg()), sb.x, sb.y, STATION.base);
  const door = place(div('garage-door', stage, art.garageDoorSvg()), GARAGE.x0, GARAGE.top, STATION.base + 2);
  const alarm = place(div('alarm', stage, `<div class="alarm-ring"></div>${art.alarmSvg()}`), ALARM.x - 40, ALARM.y - 40, STATION.base + 3);
  const lamps = LAMPS.map((p) => place(div('flamp', stage, art.lampSvg()), p.x - 18, p.y - 18, STATION.base + 3));

  for (const [x, y, r, c] of TREES) place(div('prop', stage, art.treeSvg(r, c)), x - r - 6, y - (r * 2 + 30) + 6, y);

  for (const t of ['evening', 'night']) div(`tint ${t}`, stage).style.zIndex = String(FZ.tint);

  // Fire truck: three views in one box, anchored at the middle of its wheels.
  const head = firefighterHead(look);
  const truckEl = div('prop truck', stage, `<div class="tv side">${art.truckSideSvg(head)}</div><div class="tv front">${art.truckFrontSvg(head)}</div><div class="tv back">${art.truckBackSvg()}</div>`);
  truckEl.dataset.view = 'front';
  const truck = new Sprite(truckEl, 90, 96);
  truck.depthZ = true;
  truck.at(GARAGE_IN.x, GARAGE_IN.y);
  truck.zFix = STATION.base + 1;
  truck.render();

  const ffEl = div('actor firefighter', stage, `<div class="actor-inner">${firefighterSvg(look)}</div>`);
  const firefighter = new Sprite(ffEl, 60, 200);
  firefighter.depthZ = true;
  firefighter.scale = 0.42;
  firefighter.at(GARAGE_IN.x, GARAGE_IN.y).show(false);

  const fire = div('fire-layer', stage);
  fire.style.zIndex = String(FZ.fire);

  const hoseLayer = div('hose-layer', stage, `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path class="hose-out" fill="none"/><path class="hose-in" fill="none"/></svg>`);
  hoseLayer.style.zIndex = String(FZ.hose);
  const waterLayer = div(
    'water-layer',
    stage,
    `<svg viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><path class="water" fill="none"/><path class="water-core" fill="none"/></svg>`,
  );
  waterLayer.style.zIndex = String(FZ.water);
  const splash = div('splash', stage, Array.from({ length: 6 }, (_, i) => `<i style="--a:${i * 60}deg"></i>`).join(''));
  splash.style.zIndex = String(FZ.water + 1);

  const bubble = div('bell-bubble', stage, art.bellBubbleSvg());
  bubble.style.zIndex = String(FZ.bubble);

  const shelf = place(div('shelf', stage), SHELF.x, SHELF.y, FZ.shelf);
  const plank = (y: number) => `<svg viewBox="0 0 250 30" width="250" height="30" style="margin-top:${y}px">
    <rect x="0" y="2" width="250" height="10" rx="4" fill="#a1887f" stroke="#3a2c2a" stroke-width="3"/>
    <path d="M20 12 L30 24 M230 12 L220 24" stroke="#6d4c41" stroke-width="4"/></svg>`;
  shelf.innerHTML = `<div class="shelf-row r1">${plank(52)}</div><div class="shelf-row r2">${plank(108)}</div>`;

  const fx = div('fx', stage);
  fx.style.zIndex = String(FZ.fx);
  const handEl = div('hand', stage, `<div class="hand-inner">${handSvg()}</div>`);
  handEl.style.zIndex = String(FZ.hand);
  const hand = new Sprite(handEl, 40, 4);

  const hosePaths = hoseLayer.querySelectorAll('path');
  const waterPaths = waterLayer.querySelectorAll('path');
  return {
    root,
    stage,
    houses,
    door,
    alarm,
    lamps,
    truck,
    firefighter,
    fire,
    hose: [...hosePaths] as SVGPathElement[],
    water: waterPaths[0] as SVGPathElement,
    waterCore: waterPaths[1] as SVGPathElement,
    splash,
    bubble,
    shelf,
    fx,
    hand,
  };
}

/** Keeps the sticker shelf just inside the top of the visible area. */
export function placeFireShelf(shelf: HTMLElement, view: { scale: number; oy: number }): void {
  const visibleTop = Math.max(0, -view.oy / view.scale);
  SHELF.y = Math.round(visibleTop + 14);
  shelf.style.transform = `translate3d(${SHELF.x}px,${SHELF.y}px,0)`;
}
