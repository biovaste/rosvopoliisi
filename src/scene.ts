// Builds the town scene. Everything lives in one depth-sorted layer: an element's
// z-index is the y of its bottom edge, so nearer things are drawn on top.

import * as art from './art';
import { backdropSvg, chimneySpotSvg, treeSvg } from './buildings';
import { SKY, TILES, propArt, vanArt } from './images';
import { BASE_Y, CAR, CELLS, H, LAMPS, NEAR_LAMP, SHELF, SPOTS, STATION, W, peekH, peekW, placeBuilding, type Placed, type SpotDef } from './layout';
import { policeHead } from './people';
import { town } from './town';
import { Sprite } from './tween';

export interface SpotView {
  def: SpotDef;
  box: HTMLElement;
  peeker: HTMLElement;
  inner: HTMLElement;
  /** Holds the stolen item poking out of this spot. */
  stash: HTMLElement;
}

export interface WindowView {
  face: HTMLElement;
}

export interface Scene {
  root: HTMLElement;
  stage: HTMLElement;
  spots: SpotView[];
  windows: WindowView[];
  car: HTMLElement;
  carSprite: Sprite;
  /** Group in the back window where caught rosvot ride. */
  riders: SVGGElement;
  /** SVG transform for the i-th rider's head, or null if there is no room for it. */
  riderAt: (i: number) => string | null;
  fx: HTMLElement;
  shelf: HTMLElement;
  hand: Sprite;
  /** Glow drawn over lost loot that grows while nobody touches the screen. */
  halo: HTMLElement;
}

export const Z = { tint: 4000, shelf: 5000, fx: 6000, hand: 7000, drag: 3000, loot: 2900 };

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

function picture(stage: HTMLElement, p: Placed, z: number): void {
  const img = document.createElement('img');
  img.className = 'prop building';
  img.src = p.art.url;
  img.width = p.art.w;
  img.height = p.art.h;
  img.alt = '';
  stage.appendChild(img);
  place(img, p.x, p.y, z);
}

function spotObject(def: SpotDef): string {
  switch (def.kind) {
    case 'chimney':
      return chimneySpotSvg();
    case 'tree':
      return treeSvg(def.far ? town.backTree : town.nearTree);
    case 'mailbox':
      return art.mailboxSvg();
    case 'slide':
      return art.slideSvg();
    case 'tunnel':
      return art.tunnelSvg();
    case 'bush':
      return art.bushSvg(town.bush);
    case 'planter':
      return art.planterSvg();
    case 'crates':
      return art.crateSvg();
    case 'sacks':
      return art.sacksSvg();
    case 'stall':
      return art.stallCounterSvg();
    case 'roof':
      return '';
  }
}

export function buildScene(app: HTMLElement): Scene {
  const root = div('game', app);
  const stage = div('stage', root);
  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;

  // Sky layers extend beyond the stage so letterboxing never shows.
  div('sky day', stage);
  div('sky evening', stage);
  div('sky night', stage);
  div('ground-ext', stage);
  // Painted sky panoramas, cross-faded by time of day. Without a dedicated
  // evening/night picture the day one is shown with a colour filter.
  const skyArt = div('sky-art', stage);
  stage.classList.toggle('art-sky', !!SKY.day);
  stage.classList.toggle('art-evening', !!SKY.evening);
  stage.classList.toggle('art-night', !!SKY.night);
  if (SKY.day) {
    for (const t of ['day', 'evening', 'night'] as const) {
      const art = SKY[t] ?? SKY.day;
      // The picture plus mirrored copies on both sides, so wide screens never see its edges.
      for (const side of [-1, 0, 1]) {
        const img = document.createElement('img');
        img.className = `sky-img ${t}${SKY[t] ? '' : ' filtered'}`;
        img.src = art.url;
        img.width = art.w;
        img.height = art.h;
        const x = (W - art.w) / 2 + side * art.w;
        img.style.transform = `translate3d(${x}px,0,0)${side ? ' scaleX(-1)' : ''}`;
        img.alt = '';
        skyArt.appendChild(img);
      }
    }
  }
  const sky = div('skybits', stage);
  div('sun', sky, `<svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="44" fill="#ffd54f" stroke="#f9a825" stroke-width="6"/></svg>`);
  div('moon', sky, `<svg viewBox="0 0 120 120" width="120" height="120"><path d="M70 18 A42 42 0 1 0 100 82 A34 34 0 1 1 70 18Z" fill="#fff9c4" stroke="#f9e79f" stroke-width="3"/></svg>`);
  const stars = div('stars', sky);
  for (let i = 0; i < 30; i++) {
    const s = div('star', stars);
    const x = ((i * 0.618034) % 1) * 1300 - 50;
    const y = ((i * 0.381966 * 7) % 1) * 200 - 130;
    s.style.transform = `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`;
    s.style.animationDelay = `${(i % 7) * 0.4}s`;
  }
  for (let i = 0; i < 3; i++) {
    div(
      `bird b${i}`,
      sky,
      `<svg viewBox="0 0 40 20" width="${30 - i * 5}" height="${15 - i * 2}"><path class="wing" d="M2 10 Q10 0 20 10 Q30 0 38 10" fill="none" stroke="#3a2c2a" stroke-width="3" stroke-linecap="round"/></svg>`,
    );
  }
  const clouds = div('clouds', sky);
  for (let i = 0; i < 4; i++) {
    div(
      `cloud c${i}`,
      clouds,
      `<svg viewBox="0 0 170 74" width="170" height="74"><path d="M20 64 Q0 64 6 46 Q10 30 32 34 Q40 8 72 14 Q94 0 114 20 Q146 12 152 38 Q170 46 158 64Z" fill="#fff" stroke="#3a2c2a" stroke-width="2.5" opacity=".95"/></svg>`,
    );
  }

  place(div('prop backdrop', stage, backdropSvg(TILES)), 0, 0, 2);

  // Police station with jail cells; the cell windows are layered over the picture.
  picture(stage, STATION, BASE_Y);
  const windows: WindowView[] = CELLS.map((c) => {
    const w = place(div('jailwin', stage), c.x, c.y, BASE_Y + 1);
    w.style.width = `${c.w}px`;
    w.style.height = `${c.h}px`;
    div('jw-back', w, art.jailWindowBack());
    const face = div('jw-face', w);
    div('jw-bars', w, art.jailWindowBars());
    return { face };
  });

  // The building row.
  // The wide bank sits slightly behind its neighbours so they overlap its edges.
  town.buildings.forEach((b, i) => picture(stage, placeBuilding(b.kind, i), BASE_Y - (b.kind === 'bank' ? 2 : i === 3 ? 1 : 0)));

  // Street furniture.
  for (const x of LAMPS) lamp(stage, x, 502);
  lamp(stage, NEAR_LAMP.x, NEAR_LAMP.y, NEAR_LAMP.k);
  const bench = propArt('bench');
  // The bench sits on the lawn by the sidewalk, between the playground and the bush.
  if (bench) picture(stage, { art: { ...bench, door: 0, roof: [] }, x: 506, y: 656 - bench.h }, 656);
  else place(div('prop', stage, art.benchSvg()), 12, 686, 736);
  place(div('prop', stage, art.stallBackSvg()), 1015, 548, 600);
  if (town.fence) {
    const fence = propArt('fence');
    if (fence) {
      picture(stage, { art: { ...fence, door: 0, roof: [] }, x: 664, y: 622 - fence.h }, 621);
    } else {
      place(div('prop', stage, art.fenceSvg(140)), 392, 574, 619);
      place(div('prop', stage, art.fenceSvg(96)), 1104, 578, 619);
    }
  }

  // Hiding spots.
  const spots: SpotView[] = SPOTS.map((def) => {
    const box = place(div('peekbox', stage), def.x - peekW(def) / 2, def.top + def.clip - peekH(def), def.z - 1);
    box.style.width = `${peekW(def)}px`;
    box.style.height = `${peekH(def)}px`;
    box.style.setProperty('--s', def.s.toFixed(3));
    const peeker = div('peeker', box);
    const inner = div('peeker-inner', peeker);
    const stash = div('stash', box);
    const html = def.art ? '' : spotObject(def);
    if (def.art) {
      const img = document.createElement('img');
      img.className = `prop building spot-obj ${def.kind}`;
      img.src = def.art.url;
      img.width = def.art.w;
      img.height = def.art.h;
      img.alt = '';
      stage.appendChild(img);
      place(img, def.x - def.ax * def.w, def.top, def.z);
    } else if (html) {
      const obj = place(div(`prop spot-obj ${def.kind}`, stage, html), def.x - def.w / 2, def.top, def.z);
      if (def.os !== 1) {
        obj.style.transformOrigin = '0 0';
        obj.style.transform += ` scale(${def.os})`;
      }
    }
    return { def, box, peeker, inner, stash };
  });

  // Time-of-day tint over the whole town.
  for (const t of ['evening', 'night']) div(`tint ${t}`, stage).style.zIndex = String(Z.tint);

  const { car, riderAt } = buildCar(stage);
  const carSprite = new Sprite(car, 0, 0);
  carSprite.depthZ = true;
  carSprite.zAdd = CAR.h;
  carSprite.at(CAR.x, CAR.y);

  const shelf = place(div('shelf', stage), SHELF.x, SHELF.y, Z.shelf);
  // The shelf appears with the first sticker; the second plank only once the first row is full.
  const plank = (y: number) => `<svg viewBox="0 0 250 30" width="250" height="30" style="margin-top:${y}px">
    <rect x="0" y="2" width="250" height="10" rx="4" fill="#a1887f" stroke="#3a2c2a" stroke-width="3"/>
    <path d="M20 12 L30 24 M230 12 L220 24" stroke="#6d4c41" stroke-width="4"/></svg>`;
  shelf.innerHTML = `<div class="shelf-row r1">${plank(52)}</div><div class="shelf-row r2">${plank(108)}</div>`;

  const halo = div('loot-halo', stage, '<div class="halo-glow"></div><div class="halo-rays"></div>');
  halo.style.zIndex = String(Z.loot - 1);

  const fx = div('fx', stage);
  fx.style.zIndex = String(Z.fx);

  const handEl = div('hand', stage, `<div class="hand-inner">${art.handSvg()}</div>`);
  handEl.style.zIndex = String(Z.hand);
  const hand = new Sprite(handEl, 40, 4);

  return { root, stage, spots, windows, car, carSprite, riders: car.querySelector('.riders') as SVGGElement, riderAt, fx, shelf, hand, halo };
}

/** How much sky may be cut off the top on wide screens (phones), in logical px. */
const SKY_CROP = 150;

/**
 * Scales the stage to the window. 4:3 tablets see the whole town; wider screens
 * (16:10 tablets, phones) zoom in by trimming up to SKY_CROP of sky from the top,
 * so the playing area stays as large as possible. Returns the transform.
 */
export function fitStage(stage: HTMLElement): { scale: number; ox: number; oy: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / W, vh / (H - SKY_CROP));
  const ox = (vw - W * scale) / 2;
  const oy = H * scale <= vh ? (vh - H * scale) / 2 : vh - H * scale;
  stage.style.transform = `translate3d(${ox}px,${oy}px,0) scale(${scale})`;
  return { scale, ox, oy };
}

/** Keeps the sticker shelf just inside the top of the visible area. */
export function placeShelf(shelf: HTMLElement, view: { scale: number; oy: number }): void {
  const visibleTop = Math.max(0, -view.oy / view.scale);
  SHELF.y = Math.round(visibleTop + 14);
  shelf.style.transform = `translate3d(${SHELF.x}px,${SHELF.y}px,0)`;
}

/** The police van picture (or the drawn car) with driver and passenger windows and flashing lights. */
function buildCar(stage: HTMLElement): { car: HTMLElement; riderAt: (i: number) => string | null } {
  const car = div('prop car', stage);
  const body = div('car-body', car);
  const van = vanArt();
  if (!van) {
    body.innerHTML = art.carSvg(policeHead(town.police));
    div('car-lights', car, art.carLights());
    return { car, riderAt: (i) => (i < 3 ? `translate(${56 + i * 18} 28) scale(.32)` : null) };
  }
  const { cab, rear, lights } = van;
  const rect = (r: typeof cab) => `<rect x="${r.x}" y="${r.y}" width="${r.w}" height="${r.h}" rx="3"/>`;
  const img = document.createElement('img');
  img.src = van.url;
  img.width = van.w;
  img.height = van.h;
  img.alt = '';
  img.className = 'van-img';
  body.appendChild(img);
  body.insertAdjacentHTML(
    'beforeend',
    `<svg class="van-overlay" viewBox="0 0 ${van.w} ${van.h}" width="${van.w}" height="${van.h}">
      <defs><clipPath id="van-cab">${rect(cab)}</clipPath><clipPath id="van-rear">${rect(rear)}</clipPath></defs>
      <g clip-path="url(#van-cab)"><g class="driver" transform="translate(${cab.x + 2} ${cab.y + 6}) scale(.36)">${policeHead(town.police)}</g></g>
      <g clip-path="url(#van-rear)"><g class="riders"></g></g>
      <g fill="#fff" opacity=".22">${rect(cab)}${rect(rear)}</g>
    </svg>`,
  );
  const glow = div('car-lights van-lights', car);
  glow.style.transform = `translate3d(${lights.x}px,${lights.y - 14}px,0)`;
  glow.style.width = `${lights.w}px`;
  glow.innerHTML = '<div class="l-red"></div><div class="l-blue"></div>';
  // The back window fits two sheepish faces; the third rosvo rides out of sight.
  return { car, riderAt: (i) => (i < 2 ? `translate(${rear.x - 2 + i * 24} ${rear.y + 8}) scale(.27)` : null) };
}

/** Street lamp on a sidewalk (picture if present, k = size), with a glow that lights up in the evening. */
function lamp(stage: HTMLElement, cx: number, bottom: number, k = 1): void {
  const pic = propArt('lamp');
  if (!pic) {
    place(div('prop lamp', stage, art.lampSvg()), cx - 30, bottom - 258, bottom);
    return;
  }
  const a = { w: pic.w * k, h: pic.h * k };
  const el = place(div('prop lamp', stage), cx - a.w / 2, bottom - a.h, bottom);
  el.innerHTML = `<img src="${pic.url}" width="${a.w}" height="${a.h}" alt=""><div class="glow lamp-glow" style="left:${a.w / 2 - 40}px;top:${a.h * 0.17 - 40}px"></div>`;
}
