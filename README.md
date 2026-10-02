# Poliisi ja rosvo

A touch game for a 4-year-old, made for a tablet held in landscape. The child is
a police officer who catches silly rosvot, takes them to jail and gives the
stolen things back to their owners.

The game uses Vite and TypeScript with no game engine. Everything is drawn as
inline SVG and every sound is synthesised with the Web Audio API, so there are
no external assets or network requests.

## How it plays

1. A rosvo steals something (cake, ball, gold, gems, jewellery and more), stashes
   the loot in one place, and hides somewhere else.
2. Tap the rosvo to catch it. Rosvot sometimes dash between hiding spots, and
   they can be caught on the run. Later rounds have more dashing.
3. Drag the caught rosvo to the jail or police car.
4. Find the glowing loot and drag it to its owner. Owners stand in different
   places each round, and the thought bubble shows a faded picture of the
   missing item.
5. When the jail is full: siren, confetti and a sticker. The rosvot say sorry
   and the police car drives them away. Then the time of day moves on.

The town (buildings, colours, tree, hiding objects, decorations and the police
officer) is re-rolled on every page load. Skin tone, hair and gender are chosen
the same random way for rosvot, townspeople and the police. Each round's three
rosvot always have different skin tones and a mix of genders.

## Run locally

```sh
npm install
npm run dev        # dev server on http://localhost:5173 (also listens on your LAN)
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ on http://localhost:4173 (also on your LAN)
```

## Play on a tablet over wifi

1. Connect the computer and the tablet to the same wifi.
2. Run `npm run dev` (or `npm run build && npm run preview`). Vite prints a
   `Network:` address such as `http://192.168.1.23:5173/`.
3. Open that address in Safari or Chrome on the tablet and hold it in landscape.
4. To make it feel like an app, use Safari's Share button, then *Add to Home
   Screen*.

If the tablet can't connect, allow Node through the computer's firewall.

## Parent controls

Hold the small lock button in the top-left corner for 3 seconds to open the
panel with the mute and fullscreen buttons.

## End-to-end test

```sh
npm run build && npx vite preview --port 4173 &
npm run test:e2e
```

The test uses touch emulation at 1024x768 and plays two full cycles, covering
misses, the idle hint, drops that float back, a resting palm during a drag,
the celebration, the parent panel and portrait mode. It fails on any console
error. It needs Playwright's Chromium (`npx playwright install chromium`).

## Code layout

- `src/main.ts`: boot, stage scaling, single-pointer input routing
- `src/state.ts`: the single game-state object and its phases
- `src/game.ts`: the steal / catch / jail / return / celebrate loop
- `src/scene.ts`: builds the town DOM
- `src/art.ts`: SVG drawings of items and scenery
- `src/people.ts`: rosvot, townspeople and the police officer
- `src/town.ts`: the per-session random town
- `src/audio.ts`: Web Audio sound effects
- `src/fx.ts`: ripples, confetti, sparkles and the hint hand
- `src/parent.ts`: hold-to-open parent panel
- `src/layout.ts`, `src/tween.ts`: coordinates and rAF tweens
