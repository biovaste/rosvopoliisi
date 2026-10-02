// Builds the town scene. Everything lives in one depth-sorted layer: an element's
// z-index is the y of its bottom edge, so nearer things are drawn on top.

import * as art from './art';
import { backdropSvg, chimneySpotSvg, treeSvg } from './buildings';
import { SKY, TILES } from './images';
import { BASE_Y, CAR, CELLS, H, SHELF, SPOTS, STATION, W, peekH, peekW, placeBuilding, type Placed, type SpotDef } from './layout';
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
  fx: HTMLElement;
  shelf: HTMLElement;
  hand: Sprite;
}

export const Z = { tint: 4000, shelf: 5000, fx: 6000, hand: 7000, drag: 3000 };

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
      const img = document.createElement('img');
      img.className = `sky-img ${t}${SKY[t] ? '' : ' filtered'}`;
      img.src = art.url;
      img.width = art.w;
      img.height = art.h;
      img.style.transform = `translate3d(${(W - art.w) / 2}px,0,0)`;
      img.alt = '';
      skyArt.appendChild(img);
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
  town.buildings.forEach((b, i) => picture(stage, placeBuilding(b.kind, i), BASE_Y - (i === 3 ? 1 : 0)));

  // Street furniture.
  place(div('prop lamp', stage, art.lampSvg()), 506, 244, 502);
  place(div('prop lamp', stage, art.lampSvg()), 1042, 244, 502);
  place(div('prop', stage, art.benchSvg()), 12, 686, 736);
  place(div('prop', stage, art.stallBackSvg()), 1015, 548, 600);
  if (town.fence) {
    place(div('prop', stage, art.fenceSvg(140)), 392, 574, 619);
    place(div('prop', stage, art.fenceSvg(96)), 1104, 578, 619);
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
    const html = spotObject(def);
    if (html) {
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

  const car = div('prop car', stage, art.carSvg(policeHead(town.police)));
  div('car-lights', car, art.carLights());
  const carSprite = new Sprite(car, 0, 0);
  carSprite.depthZ = true;
  carSprite.zAdd = 134;
  carSprite.at(CAR.x, CAR.y);

  const shelf = place(div('shelf', stage), SHELF.x, SHELF.y, Z.shelf);
  shelf.innerHTML = `<svg viewBox="0 0 250 120" width="250" height="120">
    <rect x="0" y="54" width="250" height="10" rx="4" fill="#a1887f" stroke="#3a2c2a" stroke-width="3"/>
    <rect x="0" y="110" width="250" height="10" rx="4" fill="#a1887f" stroke="#3a2c2a" stroke-width="3"/>
    <path d="M20 64 L30 76 M230 64 L220 76 M20 120 L30 132 M230 120 L220 132" stroke="#6d4c41" stroke-width="4"/></svg>`;

  const fx = div('fx', stage);
  fx.style.zIndex = String(Z.fx);

  const handEl = div('hand', stage, `<div class="hand-inner">${art.handSvg()}</div>`);
  handEl.style.zIndex = String(Z.hand);
  const hand = new Sprite(handEl, 40, 4);

  return { root, stage, spots, windows, car, carSprite, fx, shelf, hand };
}

/** Scales the stage to fit the window and returns the transform. */
export function fitStage(stage: HTMLElement): { scale: number; ox: number; oy: number } {
  const vw = window.innerWidth;
  const vh = window.innerHeight;
  const scale = Math.min(vw / W, vh / H);
  const ox = (vw - W * scale) / 2;
  const oy = (vh - H * scale) / 2;
  stage.style.transform = `translate3d(${ox}px,${oy}px,0) scale(${scale})`;
  return { scale, ox, oy };
}
