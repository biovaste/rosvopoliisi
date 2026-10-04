# Art prompts for the fire mode

Prompts for the pictures the fire mode still draws in code, written to match
the police game's generated art in `art-src/` (houses, shops, van, trees).

## How to get a matching style

- **Use reference images if the generator allows it.** Attaching
  `art-src/home.jpg` (for buildings) or `art-src/van.jpg` (for the truck) as a
  style reference does more for consistency than any wording.
- Put the **style block** in front of every prompt, unchanged.
- Generate at 1024 px or more on the long side, and pick the result whose
  outline weight and colours look closest to the existing pictures.
- Save each picture as a **JPG with the given file name in `art-src/`**, then
  run `python3 tools/prepare_art.py` (it needs Pillow and numpy). The script
  removes the white background, crops and scales.

## Style block

> Children's storybook illustration in a soft hand-drawn style: clean
> dark-brown ink outlines of even weight (not black), warm cheerful colours,
> gentle painterly shading with a light paper texture, a cosy Nordic
> small-town look. Straight-on front view: a flat elevation with no
> perspective, no tilt and no three-quarter angle. A single object, centred
> and fully visible with a wide margin on every side, on a plain pure white
> background. No ground, no grass, no cast shadow, no people, no animals, no
> text, letters, numbers or logos, no watermark.

The white background and "nothing touching the edges" matter: the script cuts
the picture out by flood-filling white from the borders.

## 1. Fire station: `firestation.jpg` and `garage-door.jpg`

The garage door rolls up in the game, so the station is drawn with the
garage **open** and the door comes as a second picture.

**`firestation.jpg`** (landscape, about 6:5)

> A small two-storey fire station in red brick with white stone trim and a
> grey slate roof. On the left, a slim square tower one storey taller than
> the building, with a bronze bell hanging in an open arch at the top. In the
> middle-right, one wide garage opening for a fire engine, wide open, showing
> a plain dark empty interior: no door, no vehicle, nothing inside. Above
> the garage opening, a row of three small round empty lamp sockets. To the
> left of the garage, a small wooden side door and a plain white wall panel
> at child height (an alarm button is added later). Two windows with white
> frames on the upper floor to the right. A round emblem on the tower
> showing a simple red flame on a gold shield. A low stone foundation along
> the bottom.

**`garage-door.jpg`** (landscape, about 4:3)

> A closed roll-up garage door for a fire station, seen straight on: bright
> red horizontal slats with thin dark grooves, a row of four small
> rectangular windows across the upper third, a white frame. Just the door
> as a flat rectangle.

Tip: generate the door after the station and say "same red and outline as
the attached picture", attaching the station picture.

## 2. Fire truck: `firetruck.jpg`, `firetruck-front.jpg`, `firetruck-back.jpg`

The firefighter's head is drawn by the code inside the cab window (as with
the police van), so the windows must be empty.

**`firetruck.jpg`** (side view, about 5:2)

> A friendly red fire engine seen exactly from the side, facing right. A
> short rounded cab at the front (right) with one large side window, clear
> and empty, with nobody inside. A long equipment body behind it with
> silver roller-shutter lockers, a white stripe along the side, and a large
> round yellow hose reel with a coiled hose mounted on the side near the
> rear. A silver ladder lying flat along the roof. A blue light bar on the
> cab roof. Three black wheels with silver hubs. Chunky, rounded toy-like
> proportions, matching a cartoon police van.

**`firetruck-front.jpg`** (front view, about 1:1)

> The same red fire engine seen exactly from the front: a wide windscreen,
> clear and empty with nobody inside, a blue light bar on the roof, round
> headlights, a silver grille, a chunky silver bumper, the two front
> wheels visible below.

**`firetruck-back.jpg`** (back view, about 1:1)

> The same red fire engine seen exactly from behind: two tall silver
> roller-shutter doors, the end of the silver ladder at the top, a small
> blue light on the roof, red tail lights in the lower corners, a step
> board, the two rear wheels visible below.

Tip: generate the side view first, then attach it when generating the front
and back views ("the same truck as the attached picture, seen from the
front").

## 3. More homes: `home2.jpg` … `home6.jpg`

These plug in by themselves once processed: the town then repeats fewer
homes. Keep the same layout as `home.jpg`, because the flames are placed by
fractions of the picture: **two upper windows side by side in the middle of
the upper floor, the front door in the middle of the ground floor, a gabled
roof.** Portrait, about 5:6.

> **home2:** A traditional Finnish red wooden house (falu red board walls)
> with white corner boards and white window frames, two storeys, a dark
> grey roof, two windows side by side on the upper floor, a white front door
> with a small porch roof in the middle of the ground floor, a low stone
> foundation.

> **home3:** A pale yellow wooden two-storey house with white trim, a red
> clay-tile gabled roof with a small chimney, two windows side by side on
> the upper floor with flower boxes, a green front door with three stone
> steps in the middle of the ground floor, a low stone foundation.

> **home4:** A light blue two-storey town house with white trim and a grey
> slate gabled roof with one small dormer window, two windows side by side on
> the upper floor, a dark blue front door with a fanlight in the middle of
> the ground floor, a low stone foundation.

> **home5:** A white plastered two-storey cottage with a moss-green gabled
> roof, green window shutters and climbing pink roses beside the door, two
> windows side by side on the upper floor, a wooden front door in the middle
> of the ground floor, a low stone foundation.

> **home6:** A mint-green wooden two-storey house with cream trim, a brown
> gabled roof with a round attic window, two windows side by side on the
> upper floor, a red front door under a little canopy in the middle of the
> ground floor, a low stone foundation.

If a door ends up off-centre, set its `door` value (fraction of the width) in
`BUILDINGS` in `tools/prepare_art.py`.

## 4. Optional extras

**`pond.jpg`** (landscape, about 2:1). This one breaks the "front view"
rule on purpose, because a pond only reads from above:

> A small oval garden pond seen from high above at a steep angle, light
> blue water with soft white ripples, two green lily pads, a few reeds and
> round grey stones around the edge.

**`sandbox.jpg`** (landscape, about 3:2)

> A small square wooden sandbox seen from high above at a steep angle,
> pale sand inside, a red bucket and a blue spade.

**`hydrant.jpg`** (portrait, about 1:2), for a later "refill the tank" idea:

> A short, chunky red fire hydrant with a silver cap and two side outlets.

## After generating

- **Homes:** run the script and they appear in the game.
- **Station, door and truck:** run the script, then they need a little
  wiring: the positions of the garage opening and lamp sockets, the truck's
  cab window, light bar and hose reel have to be measured, like the police
  van's in `tools/prepare_art.py`. Ask for it once the pictures are in
  `art-src/`.
