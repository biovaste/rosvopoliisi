// Builds the fire-mode town. Like the police town, everything is in one layer
// sorted by z-index = the y of an element's bottom edge. Fire, smoke and water
// are drawn above everything (houses never overlap between rows, so this is safe).

import { handSvg } from '../art';
import type { FxHost } from '../fx';
import { firefighterHead, firefighterSvg, type Look } from '../people';
import { Sprite } from '../tween';
import * as art from './art';
import { SKY, propArt } from '../images';
import { ALARM, GARAGE, GARAGE_IN, H, HOUSES, LAMPS, PROPS, SHELF, STATION, W, type House } from './layout';

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

export function buildFireScene(app: HTMLElement, look: Look): FireScene {
  const root = div('game fire-game', app);
  const stage = div('stage', root);
  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;

  div('sky day', stage);
  div('sky evening', stage);
  div('sky night', stage);
  skyPanorama(stage);
  place(div('prop', stage, art.groundSvg()), 0, 0, 2);

  // Buildings: the police town's pictures, with a soot layer that shows after a fire.
  const houses: HouseView[] = HOUSES.map((house) => {
    const w = house.x1 - house.x0;
    const h = house.base - house.top;
    const soot = house.fires
      .slice(0, 3)
      .map((f) => `<i style="left:${(f.x - house.x0 - 26 * f.k).toFixed(0)}px;top:${(f.y - house.top - 44 * f.k).toFixed(0)}px;width:${(52 * f.k).toFixed(0)}px;height:${(52 * f.k).toFixed(0)}px"></i>`)
      .join('');
    const el = place(
      div('prop fhouse', stage, `<img src="${house.art.url}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" alt="" style="filter:${house.filter};${house.flip ? 'transform:scaleX(-1)' : ''}"><div class="soot">${soot}</div>`),
      house.x0,
      house.top,
      house.base,
    );
    return { house, el };
  });

  // Trees, bushes, benches, fences and street lamps.
  for (const p of PROPS) {
    const a = propArt(p.name);
    if (!a) continue;
    const w = a.w * p.k;
    const h = a.h * p.k;
    const el = place(div(`prop fprop ${p.name}`, stage, `<img src="${a.url}" width="${w.toFixed(1)}" height="${h.toFixed(1)}" alt="">`), p.x - w / 2, p.y - h, p.y);
    if (p.name === 'lamp') el.insertAdjacentHTML('beforeend', `<div class="lamp-glow" style="left:${(w / 2 - 22).toFixed(0)}px;top:${(h * 0.17 - 22).toFixed(0)}px"></div>`);
  }

  // Fire station: building, garage door, alarm button and progress lamps.
  const sb = art.stationBox();
  place(div('prop', stage, art.stationSvg()), sb.x, sb.y, STATION.base);
  const door = place(div('garage-door', stage, art.garageDoorSvg()), GARAGE.x0, GARAGE.top, STATION.base + 2);
  const alarm = place(div('alarm', stage, `<div class="alarm-ring"></div>${art.alarmSvg()}`), ALARM.x - 40, ALARM.y - 40, STATION.base + 3);
  const lamps = LAMPS.map((p) => place(div('flamp', stage, art.lampSvg()), p.x - 18, p.y - 18, STATION.base + 3));

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

/**
 * The police town's painted landscape (sky, hills and meadow) as the background
 * of everything behind street 1. Mirrored copies on both sides cover wide screens; evening and
 * night pictures cross-fade in (or the day one with a colour filter).
 */
function skyPanorama(stage: HTMLElement): void {
  const sky = div('sky-art', stage);
  if (!SKY.day) return;
  for (const t of ['day', 'evening', 'night'] as const) {
    const a = SKY[t] ?? SKY.day;
    for (const side of [-1, 0, 1]) {
      const img = document.createElement('img');
      img.className = `sky-img ${t}${SKY[t] ? '' : ' filtered'}`;
      img.src = a.url;
      img.width = a.w;
      img.height = a.h;
      img.alt = '';
      const x = (W - a.w) / 2 + side * a.w;
      img.style.transform = `translate3d(${x}px,${SKY_TOP}px,0)${side ? ' scaleX(-1)' : ''}`;
      sky.appendChild(img);
    }
  }
}

/**
 * Where the sky picture's top goes: its bottom (the flat meadow) reaches
 * street 1, so the back row of buildings stands on the painted landscape.
 */
const SKY_TOP = 300 - 560;

/** Keeps the sticker shelf just inside the top of the visible area. */
export function placeFireShelf(shelf: HTMLElement, view: { scale: number; oy: number }): void {
  const visibleTop = Math.max(0, -view.oy / view.scale);
  SHELF.y = Math.round(visibleTop + 14);
  shelf.style.transform = `translate3d(${SHELF.x}px,${SHELF.y}px,0)`;
}
