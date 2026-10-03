# Palokunta: the firefighter game mode

A second game mode next to *Poliisi ja rosvo*. Same audience (a 4-year-old on
a landscape tablet), same rules of thumb: no text, no failing, one finger,
big targets, gentle help after 10 seconds of nothing.

## 1. Concept

The child is the fire brigade of a small town. A fire starts in one of the
houses, the child raises the alarm, drives the fire truck out of the station,
steers it through the streets to the fire and puts the fire out with the hose.
The people come out, cheer, and the truck goes home.

Fire is scary in real life, so here it stays friendly:

- Flames have faces only at a glance (round, soft shapes, warm colours), smoke
  is grey and puffy, never black.
- Nobody is ever inside a burning room: the residents (and their cat or dog)
  are already out on the sidewalk, worried but safe, when the child arrives.
- A fire never spreads to another house and never destroys anything. If the
  child waits, the fire just keeps flickering.
- Afterwards the house is a bit sooty, and is clean again by the next level
  (the "painters came").

## 2. The town and the camera

The police game shows one street from the side. The fire game needs to show a
route, so the camera moves up: a high, frontal "storybook map" view. Front
walls of buildings face the viewer and roofs are seen from above, like a
Richard Scarry or classic top-down RPG town. There is no perspective scaling:
everything keeps the same size wherever it is, which keeps targets
predictable for small fingers.

```
 y   0 ┌──────────── sky, hills, far trees (may be cut off on phones) ────────────┐
   120 │  ▲house  ▲house   ▲house   ▲house  ▲house      row A (faces street 1)    │
   330 ╞══════════════════════ street 1 ═══════════════════════════════════════════╡
       │  FIRE STATION   ║   ▲house ▲house   ║   ▲house ▲house   row B             │
   590 ╞════════════════ street 2 ═══════════╬═══════════════════╬═══════════════════╡
       │  park, pond     ║   ▲house ▲house   ║   ▲house ▲house   row C             │
   800 └─────────────────╨───────────────────╨───────────────────────────────────┘
                      lane 1               lane 2
```

- Two long streets and two cross lanes make six blocks.
- 13 houses in three rows, plus the fire station and a park.
- Vehicles show their side when they drive left/right and their front or
  back when they drive down/up. Houses only ever show their front wall and
  roof, so they never need turning.
- On wide screens (phones, 16:10 tablets) up to 110 px of sky is trimmed from
  the top, exactly like the police game trims its sky.

## 3. One round (one fire)

| # | What happens | What the child does | Feedback |
|---|---|---|---|
| 1 | **Calm.** People stroll, birds fly. After a few seconds smoke curls out of one house, then a small flame appears in a window. The residents hurry out onto the sidewalk. | Nothing yet. | Crackle sound, a bell bubble above the house. |
| 2 | **Alarm.** The big red alarm button on the station wall starts to pulse. | **Tap the alarm.** | Alarm bell, the station's light spins, the garage door rolls up. |
| 3 | **Truck out.** The truck rolls out of the garage onto street 2 by itself, siren on. | — | Two-tone siren, flashing lights. |
| 4 | **Drive.** The truck waits, bouncing gently. | **Drag the truck.** It follows the finger but stays on the roads, turning at corners by itself (the nearest point on a road to the finger is the goal; the truck takes the shortest way there). | Engine hum. When it gets close to the burning house it snaps into the parking spot. |
| 5 | **Hose.** The firefighter hops out. The hose reel on the truck wiggles. | **Tap the hose.** | The firefighter grabs the nozzle and steps to the sidewalk; the hose unrolls from the truck. |
| 6 | **Water.** | **Touch the fire.** While the finger is down, water arcs from the nozzle to the finger. Flames under the water shrink and go out with a hiss and a puff of steam. | Splash at the finger, spray sound, sizzle per flame. |
| 7 | **Saved.** Smoke stops, the residents cheer (hearts), one lamp on the station lights up. | — | Cheer. |
| 8 | **Home.** The firefighter rolls up the hose, the truck drives back to the station by itself, the door closes. | — | Short horn. |

Three fires make a level. When the third station lamp lights up: siren,
confetti and a sticker for the shelf, then the time of day moves on (day →
evening → night), just like three rosvot in jail.

### Gentle help (same rules as the police game)

- 10 s without a touch: a hand shows the next move (tap the alarm, drag the
  truck along the road to the fire, tap the hose reel, drag over the
  biggest flame).
- Letting go of the truck anywhere is fine: it just stops there and can be
  picked up again. Nothing floats back, nothing is lost.
- Water does not have to be aimed precisely: the splash covers about a
  flame's width, and a single tap gives a short burst.

### Difficulty by level

| Tier | Flames | Where fires start | Flames regrow when not watered |
|---|---|---|---|
| 0 | 2 | near the station (row B, street 2) | no |
| 1 | 3 | anywhere on street 2 | no |
| 2 | 4 | anywhere, also the back row | slowly |
| 3 | 5 | anywhere | a bit faster |

## 4. Continuity

- **Inside a level:** the station's three lamps show progress (like the jail
  cells). Houses that burned stay sooty until the next level. A house never
  burns twice in a level.
- **Between levels:** time of day changes and the street lamps come on in the
  evening; fires glow nicely at night.
- **Across the session:** stickers go to the same shelf, the same parent
  session timer ends the game after the level in progress, the same end
  screen shows the stickers.
- **The town:** house colours, roof colours and which lot has which house
  shape are rolled on every page load, as in the police town. The station and
  roads stay put so the route can be learned.
- **The firefighter** gets a random look from the same pool as everyone else
  (skin, hair, gender), and stays the same for the whole session.
- **Mode choice:** the start screen gets two big pictures: the rosvo with the
  police play button, and a flame with the fire play button. The parent clock
  stays in the corner and applies to both.

Later ideas (not in the MVP): a cat stuck in a tree that needs the ladder; a
grill or bonfire that is "not a fire to put out" (teaches calm); the police
van and the fire truck meeting at an intersection; refilling the tank from a
hydrant; the truck washing itself at the station at the end of a level.

## 5. Graphical assets

The police game uses AI-generated pictures for big static things (sky,
buildings, ground textures, trees, props) and code-drawn SVG for anything that
animates or changes colour. The side-view pictures don't work from above, so
the fire mode needs its own set. The MVP draws **everything in SVG** in the
same storybook style (soft colours, `#3a2c2a` outlines) and can swap in
pictures later through the same `art-src/` → `tools/prepare_art.py` pipeline.

### Needed for the MVP (all code-drawn now)

| Asset | Kind | Notes |
|---|---|---|
| Ground: grass, asphalt, sidewalk, lane markings, crossings | static | top-down; one SVG backdrop |
| Sky band, hills, far tree line | static | three times of day via tints |
| House, front wall + roof from above, 3 shapes | static, recoloured | windows, door, chimney; soot overlay |
| Fire station: brick front, garage door, tower, 3 progress lamps, alarm button | static + animated door/lamps | |
| Fire truck: side, front and back views | animated | ladder, hose reel, flashing lights |
| Firefighter: standing, holding the nozzle | animated | helmet, reflective coat |
| Residents, cat, dog | reuse | from the police game's people drawings, scaled down |
| Flame (3 sizes via scale) | animated | CSS flicker |
| Smoke puff, steam puff, water arc, splash | animated | CSS / SVG |
| Hose line | dynamic | SVG path from reel to nozzle |
| Trees and bushes from above, pond, playground, benches | static | park and gaps between houses |
| Start-screen fire button | static | flame + helmet |

### Pictures worth generating later (in priority order)

1. **Fire station** (front + roof from above, garage door as a separate
   layer so it can roll up): it is always on screen and sets the look.
2. **3–4 house pictures** from above (front wall + roof), neutral wall
   colour so code can tint them, plus a soot overlay.
3. **Ground tiles** from above: grass, asphalt, sidewalk (the police ones
   are side-on and stretched, they don't read right from above).
4. **Trees and bushes from above**, park props (pond, sandbox, bench).
5. **Fire truck** in three views (side, front, back) with separate light and
   window rectangles like the police van's metadata.
6. **Sky band** with hills for the top edge, three times of day.

Characters, flames, water and smoke should stay code-drawn: they animate,
change size continuously and need to match the existing character style.

## 6. MVP scope

In:

- Mode choice on the start screen; the police game is unchanged.
- The town layout above, 13 houses, the station, the park.
- The full round (fire → alarm → truck out → drive along roads → park → hose →
  water → saved → truck home), three fires per level, sticker, time of day.
- Idle hints for every step, single-pointer input, the parent controls.
- An end-to-end test that plays a level with touch emulation.

Out (for now): generated pictures, residents strolling around between fires,
regrowing flames tuned by feel, the later ideas in section 4.

## 7. Code layout

- `src/fire/layout.ts`: town geometry, the road network and path finding
- `src/fire/art.ts`: SVG for the ground, houses, station, truck, flames
- `src/fire/scene.ts`: builds the depth-sorted town
- `src/fire/game.ts`: the round, difficulty, input and hints
- `src/fire/mode.ts`: boot, stage scaling, input routing, test hook
- `src/fire/fire.css`: styles for the fire mode
- `src/people.ts`: `firefighterSvg()` next to the police officer
