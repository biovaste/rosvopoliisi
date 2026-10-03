// Generated artwork (see tools/prepare_art.py). Images are 2x; sizes are logical px.
// Files are picked up automatically, so art that has not been made yet simply
// falls back to the code-drawn version.

import meta from './art-meta.json';

const files = import.meta.glob('./assets/art/*.webp', { eager: true, import: 'default' }) as Record<string, string>;
const url = (name: string): string | undefined => files[`./assets/art/${name}.webp`];

export interface BuildingArt {
  url: string;
  w: number;
  h: number;
  /** Door centre as a fraction of the width. */
  door: number;
  /** Top of the building every 2 px across (for placing chimneys). */
  roof: number[];
  cells?: { x: number; y: number; w: number; h: number }[];
}

type Kind = 'home' | 'bakery' | 'bank' | 'jewelry' | 'station';
const B = meta.buildings as Record<Kind, Omit<BuildingArt, 'url'>>;

export const BUILDING_ART = Object.fromEntries(
  (Object.keys(B) as Kind[]).map((k) => [k, { ...B[k], url: url(k) ?? '' }]),
) as Record<Kind, BuildingArt>;

/** Roof height (from the top of the image) at logical x. */
export function roofAt(a: BuildingArt, x: number): number {
  const i = Math.max(0, Math.min(a.roof.length - 1, Math.round(x / 2)));
  return a.roof[i];
}

export interface TileArt {
  url: string;
  w: number;
  h: number;
}

const T = meta.tiles as Record<string, { w: number; h: number }>;
const tileArt = (name: string): TileArt | null => (T[name] && url(`tile-${name}`) ? { url: url(`tile-${name}`) as string, ...T[name] } : null);

export const TILES = {
  grass: tileArt('grass'),
  sand: tileArt('sand'),
  sidewalk: tileArt('sidewalk'),
  street: tileArt('street'),
};

const S = meta.skies as Record<string, { w: number; h: number }>;
const skyArt = (name: string): TileArt | null => (S[name] && url(name) ? { url: url(name) as string, ...S[name] } : null);

type Rect = { x: number; y: number; w: number; h: number };
const P = (meta as { props?: Record<string, { w: number; h: number } & Record<string, unknown>> }).props ?? {};

export interface VanArt extends TileArt {
  cab: Rect;
  rear: Rect;
  lights: Rect;
}

/** The police van picture with its window and light-bar positions, if present. */
export function vanArt(): VanArt | null {
  const v = P.van as unknown as VanArt | undefined;
  const u = url('van');
  return v && u && v.cab ? { ...v, url: u } : null;
}

/** Generated hiding-spot props (trees, bush, crates, slide), if present. */
export function propArt(name: string): TileArt | null {
  return P[name] && url(name) ? { url: url(name) as string, ...P[name] } : null;
}

export const SKY = { day: skyArt('sky-day'), evening: skyArt('sky-evening'), night: skyArt('sky-night') };
