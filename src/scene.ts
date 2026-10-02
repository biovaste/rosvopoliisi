// Builds the static town scene and exposes element references.

import * as art from './art';
import { CAR, H, PEEK_H, PEEK_W, SHELF, SPOTS, STATION, W, WINDOWS, type SpotDef } from './layout';
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
  actors: HTMLElement;
  fx: HTMLElement;
  shelf: HTMLElement;
  hand: Sprite;
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
  el.style.zIndex = String(z);
  return el;
}

export function buildScene(app: HTMLElement): Scene {
  const root = div('game', app);
  const stage = div('stage', root);
  stage.style.width = `${W}px`;
  stage.style.height = `${H}px`;

  // Sky and ground extend well beyond the stage so letterboxing never shows.
  div('sky', stage);
  div('ground', stage);
  div('road', stage);
  const sky = div('skybits', stage);
  div('sun', sky, `<svg viewBox="0 0 120 120" width="120" height="120"><circle cx="60" cy="60" r="44" fill="#ffd54f" stroke="#f9a825" stroke-width="6"/></svg>`);
  div('moon', sky, `<svg viewBox="0 0 120 120" width="120" height="120"><path d="M70 18 A42 42 0 1 0 100 82 A34 34 0 1 1 70 18Z" fill="#fff9c4" stroke="#f9e79f" stroke-width="3"/></svg>`);
  const stars = div('stars', sky);
  for (let i = 0; i < 26; i++) {
    const s = div('star', stars);
    const x = ((i * 0.618034) % 1) * 1300 - 50;
    const y = ((i * 0.381966 * 7) % 1) * 230 - 130;
    s.style.transform = `translate3d(${x.toFixed(0)}px,${y.toFixed(0)}px,0)`;
    s.style.animationDelay = `${(i % 7) * 0.4}s`;
  }
  const clouds = div('clouds', sky);
  for (let i = 0; i < 3; i++) {
    div(
      `cloud c${i}`,
      clouds,
      `<svg viewBox="0 0 160 70" width="160" height="70"><path d="M20 60 Q0 60 6 44 Q10 28 32 32 Q40 8 70 14 Q92 0 110 20 Q140 14 146 36 Q162 44 150 60Z" fill="#fff" opacity=".9"/></svg>`,
    );
  }

  // Background buildings.
  place(div('prop', stage, art.stationSvg()), STATION.x, STATION.y, 4);
  place(div('prop', stage, art.hillsSvg()), -200, 290, 1);
  const [b0, b1, b2] = town.buildings;
  place(div('prop', stage, art.buildingSvg(b0)), 330, 250, 4);
  place(div('prop', stage, art.buildingSvg(b1)), 710, 250, 4);
  place(div('prop small-house', stage, art.buildingSvg(b2)), 980, 290, 3);
  if (town.fence) {
    place(div('prop', stage, art.fenceSvg(150)), 556, 432, 5);
    place(div('prop', stage, art.fenceSvg(52)), 930, 432, 5);
  }
  for (const f of town.flowers) place(div('prop', stage, art.flowersSvg(f.colors)), f.x - 60, 500, 5);
  place(div('prop lamp', stage, art.lampSvg()), 300, 380, 4);
  place(div('prop lamp', stage, art.lampSvg()), 1140, 380, 4);

  // Hiding spots.
  const spots: SpotView[] = SPOTS.map((def, i) => {
    const zBox = def.back ? 2 : 9;
    const box = place(div('peekbox', stage), def.x - PEEK_W / 2, def.top + def.clip - PEEK_H, zBox);
    box.style.width = `${PEEK_W}px`;
    box.style.height = `${PEEK_H}px`;
    const peeker = div('peeker', box);
    const inner = div('peeker-inner', peeker);
    const stash = div('stash', box);
    stash.style.transform = `translate3d(${(PEEK_W - 100) / 2}px,${PEEK_H - def.clip - 70}px,0)`;
    const objHtml =
      def.kind === 'tree'
        ? art.treeSvg(town.tree)
        : def.kind === 'bush'
          ? art.bushSvg(town.bushColors[i % town.bushColors.length])
          : def.kind === 'bin'
            ? art.binSvg()
            : def.kind === 'crate'
              ? art.crateSvg()
              : def.kind === 'barrel'
                ? art.barrelSvg()
                : chimneySvg();
    place(div(`prop spot-obj ${def.kind}`, stage, objHtml), def.x - def.w / 2, def.top, zBox + 1);
    return { def, box, peeker, inner, stash };
  });

  // Jail windows.
  const windows: WindowView[] = WINDOWS.map((p) => {
    const w = place(div('jailwin', stage), p.x - 38, p.y - 45, 5);
    div('jw-back', w, art.jailWindowBack());
    const face = div('jw-face', w);
    div('jw-bars', w, art.jailWindowBars());
    return { face };
  });

  // Time-of-day tint over the background.
  div('tint evening', stage);
  div('tint night', stage);

  const car = div('prop car', stage, art.carSvg(policeHead(town.police)));
  car.style.zIndex = '7';
  div('car-lights', car, art.carLights());
  const carSprite = new Sprite(car, 0, 0).at(CAR.x, CAR.y);

  const actors = div('actors', stage);
  actors.style.zIndex = '12';

  const shelf = place(div('shelf', stage), SHELF.x, SHELF.y, 15);
  shelf.innerHTML = `<svg viewBox="0 0 250 120" width="250" height="120">
    <rect x="0" y="54" width="250" height="10" rx="4" fill="#a1887f" stroke="#2b2b3a" stroke-width="3"/>
    <rect x="0" y="110" width="250" height="10" rx="4" fill="#a1887f" stroke="#2b2b3a" stroke-width="3"/>
    <path d="M20 64 L30 76 M230 64 L220 76 M20 120 L30 132 M230 120 L220 132" stroke="#6d4c41" stroke-width="4"/></svg>`;

  const fx = div('fx', stage);
  fx.style.zIndex = '30';

  const handEl = div('hand', stage, `<div class="hand-inner">${art.handSvg()}</div>`);
  handEl.style.zIndex = '25';
  const hand = new Sprite(handEl, 40, 4);

  return { root, stage, spots, windows, car, carSprite, actors, fx, shelf, hand };
}

function chimneySvg(): string {
  return `<svg viewBox="0 0 80 90" width="80" height="90">
    <rect x="4" y="12" width="72" height="78" fill="#a1544a" stroke="#2b2b3a" stroke-width="5"/>
    <path d="M4 36 H76 M4 60 H76 M30 12 V36 M54 36 V60 M30 60 V90" stroke="#7b3a32" stroke-width="3"/>
    <rect x="0" y="2" width="80" height="16" rx="4" fill="#8d4339" stroke="#2b2b3a" stroke-width="5"/>
  </svg>`;
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
