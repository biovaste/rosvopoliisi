// All game state lives in this one plain object.

import type { ItemKind } from './art';
import type { Costume, Look, Role } from './people';
import type { Pt } from './layout';

export type Phase =
  | 'start' // waiting for the play button
  | 'stealing' // a rosvo grabs an item and runs to hide (cutscene)
  | 'hiding' // rosvo peeks out, waiting for a tap
  | 'caught' // rosvo caught, waiting to be dragged to jail
  | 'carrying' // child is dragging the rosvo
  | 'returning' // child finds the stashed item and returns it to its owner
  | 'celebrating'; // jail is full

export type TimeOfDay = 'day' | 'evening' | 'night';
export const TIMES: TimeOfDay[] = ['day', 'evening', 'night'];

export interface Owner {
  role: Role;
  look: Look;
  item: ItemKind;
  /** Where the owner stands this cycle (feet). */
  pos: Pt;
  /** True once the item has been stolen and not yet returned. */
  robbed: boolean;
}

export interface Drag {
  pointerId: number;
  what: 'rosvo' | 'item';
  /** Offset from finger to sprite anchor. */
  dx: number;
  dy: number;
}

export interface State {
  phase: Phase;
  /** True while a scripted animation runs; taps only give feedback. */
  busy: boolean;
  cycle: number;
  time: TimeOfDay;
  owners: Owner[];
  costumes: Costume[];
  /** Index into owners for the current robbery. */
  victim: number;
  /** Order in which owners get robbed this cycle. */
  order: number[];
  /** How many rosvot are in jail (0..3). */
  jailed: number;
  spot: number;
  lastSpot: number;
  /** Spot where the current rosvo stashed the loot. */
  stashSpot: number;
  /** The loot has been pulled out of its stash. */
  itemOut: boolean;
  /** The rosvo is running between hiding spots (still catchable). */
  moving: boolean;
  misses: number;
  /** Rosvo holds still and wiggles (after 2 misses). */
  still: boolean;
  /** Where the caught rosvo / dropped item rest. */
  rosvoRest: Pt;
  itemRest: Pt;
  drag: Drag | null;
  stickers: number;
  lastInput: number;
  hintOn: boolean;
  panelOpen: boolean;
}

export const state: State = {
  phase: 'start',
  busy: false,
  cycle: 0,
  time: 'day',
  owners: [],
  costumes: [],
  victim: 0,
  order: [],
  jailed: 0,
  spot: 0,
  lastSpot: -1,
  stashSpot: -1,
  itemOut: false,
  moving: false,
  misses: 0,
  still: false,
  rosvoRest: { x: 0, y: 0 },
  itemRest: { x: 0, y: 0 },
  drag: null,
  stickers: 0,
  lastInput: 0,
  hintOn: false,
  panelOpen: false,
};

export function setPhase(p: Phase): void {
  state.phase = p;
  document.body.dataset.phase = p;
}
