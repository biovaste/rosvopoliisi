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
  id: number;
  role: Role;
  look: Look;
  item: ItemKind;
  /** Where the owner stands (feet). */
  pos: Pt;
  /** Lives in a building and always stands at its door. */
  home: boolean;
  /** The item is currently stolen. */
  robbed: boolean;
  /** Already robbed (and helped) this cycle. */
  done: boolean;
  walking: boolean;
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
  /** Id of the owner robbed in the current round. */
  victim: number;
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
  victim: -1,
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

/** Difficulty tier: 0 for the first level, up to 3. Rosvot and loot get better hidden. */
export const tier = (): number => Math.min(state.cycle, 3);

export function setPhase(p: Phase): void {
  state.phase = p;
  document.body.dataset.phase = p;
}
