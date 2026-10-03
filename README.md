# Poliisi ja rosvo

A touch game for a 4-year-old, made for a tablet held in landscape. The child is
a police officer who catches silly rosvot, takes them to jail and gives the
stolen things back to their owners.

The game uses Vite and TypeScript with no game engine. Everything is drawn as
inline SVG and every sound is synthesised with the Web Audio API, so there are
no external assets or network requests.

The start screen has two play buttons: blue for *Poliisi ja rosvo* and red for
the fire brigade mode (*Palokunta*, an MVP; see
[docs/firefighters.md](docs/firefighters.md) for its design, mechanics and the
artwork it still needs).

## How it plays

1. A rosvo steals something from a townsperson (cake, ball, gold, a gem,
   jewellery, a parcel and more). It stashes the loot in one place and hides
   somewhere else.
2. Tap the rosvo to catch it. Rosvot sometimes dash between hiding spots, and
   they can be caught on the run.
3. A police officer runs over and puts on handcuffs. Drag the pair to the
   police station; the officer escorts the rosvo in.
4. Find the glowing loot and drag it back to its owner. The thought bubble
   shows a faded picture of what is missing.
5. When the three cells are full: siren, confetti and a sticker. The rosvot say
   sorry and the officer drives them away. Then the time of day moves on and
   the next level starts.

**The town.** A police station with jail cells, a bakery, a bank, a jewellery
shop and a home line the street. There is a playground and a market in front.
Building order and colours, trees and fences change on every page load.

**Townspeople.** Each level has 5 to 7 townspeople. The baker, banker,
jeweller and elder always stand at their own building's door. Everyone else
appears at random places, strolls around, and sometimes leaves while a
newcomer arrives. Any of them can be robbed, in any order.

**Hiding spots.** There are 13. Some are for rosvot only (station roof, slide,
market stall), some for loot only (mailbox, flower planter, sacks), and some
for both.

**Difficulty by level:**
- Rosvot peek out less and for shorter times.
- Loot pokes out less.
- Rosvot dash more often.
- Rooftop, chimney and back-tree spots unlock.

The gentle help is unchanged: after 2 misses the rosvo holds still and
wiggles, and after 10 seconds without a touch a hint hand appears. While the
child looks for the stolen loot, a glow around it grows over those 10 seconds
before the hand points at it.

**Looks.** Skin tone, hair and gender are chosen the same random way for
rosvot, townspeople and the police officer.

## Run locally

```sh
npm install
npm run dev        # dev server on http://localhost:5173 (also listens on your LAN)
npm run build      # type-check + production build into dist/
npm run preview    # serve dist/ on http://localhost:4173 (also on your LAN)
```

## Screens

The game is made for tablets in landscape and also works on phones:
- **4:3 iPads:** see the whole town.
- **Wider screens** (16:10 tablets, phones): zoom in by trimming some sky from
  the top, so characters and hiding spots stay as large as possible.
- **Sticker shelf:** moves down to stay visible.
- **Wide phones:** the street, grass and painted sky continue past the edges.

## Play on a tablet over wifi

1. Connect the computer and the tablet to the same wifi.
2. Run `npm run dev` (or `npm run build && npm run preview`). Vite prints a
   `Network:` address such as `http://192.168.1.23:5173/`.
3. Open that address in Safari or Chrome on the tablet and hold it in landscape.
4. To make it feel like an app, use Safari's Share button, then *Add to Home
   Screen*.

If the tablet can't connect, allow Node through the computer's firewall.

## Parent controls

- **Session length:** on the start screen, hold the clock button in the bottom
  right corner for 2 seconds. Pick unlimited (∞) or 5, 10, 15, 20 or 30
  minutes; the clock faces show the time as a filled wedge, with no text. The
  choice is remembered on the device. When the time is up, the current level
  is still played to the end, then an end screen shows the stickers earned.
  Holding the corner button there for 3 seconds starts a new session.
- **Sound and fullscreen:** during play, hold the small lock button in the top
  left corner for 3 seconds to open the panel with mute and fullscreen.

## Artwork

The sky, buildings, ground textures, trees, bush, crates and slide are
AI-generated images. Characters,
hiding objects, items and the car are drawn in code, because they animate,
change colours and hide a peeking rosvo.

The original images are in `art-src/`. `tools/prepare_art.py` turns them into
small WebP files in `src/assets/art/`, about 350 KB in total. It also writes
`src/art-meta.json` with sizes, roof lines (where the chimney hiding spots go),
door positions and the jail-cell windows:

```sh
pip install pillow numpy
python3 tools/prepare_art.py
```

Art that hasn't been made yet falls back automatically: the code-drawn
street, or the day sky with a colour filter for evening and night. To add a
missing picture, save it as `art-src/sky-evening.jpg`,
`art-src/sky-night.jpg` or `art-src/tile-street.jpg` and run the script.

## End-to-end test

```sh
npm run build && npx vite preview --port 4173 &
npm run test:e2e                      # iPad size (1024x768)
VW=844 VH=390 npm run test:e2e        # phone size
```

The fire mode has its own test, which plays a whole level (three fires):

```sh
npm run test:fire                     # iPad size
VW=844 VH=390 npm run test:fire       # phone size
```

The police test uses touch emulation at 1024x768 and plays two full cycles, covering
misses, the idle hint, drops that float back, a resting palm during a drag,
the celebration, the parent panel and portrait mode. It fails on any console
error. It needs Playwright's Chromium (`npx playwright install chromium`).

## Code layout

- `src/main.ts`: boot, stage scaling, single-pointer input routing
- `src/state.ts`: the single game-state object and its phases
- `src/game.ts`: the steal / catch / escort / return / celebrate loop and difficulty tiers
- `src/scene.ts`: builds the depth-sorted town
- `src/images.ts`, `tools/prepare_art.py`: generated artwork and its metadata
- `src/buildings.ts`, `src/draw.ts`: code-drawn chimneys, trees and the ground layer
- `src/npcs.ts`: townspeople spawning, strolling and coming and going
- `src/police.ts`: the officer (cuffing, escorting, driving)
- `src/actors.ts`: depth-scaled walking for characters
- `src/art.ts`: SVG drawings of items and small props
- `src/people.ts`: rosvot, townspeople and the police officer
- `src/town.ts`: the per-session random town settings
- `src/audio.ts`: Web Audio sound effects
- `src/fx.ts`: ripples, confetti, sparkles and the hint hand
- `src/parent.ts`: hold-to-open parent panel
- `src/layout.ts`, `src/tween.ts`: coordinates and rAF tweens
- `src/fire/`: the fire brigade mode (town layout and road network, artwork,
  scene, game loop, boot), described in `docs/firefighters.md`
