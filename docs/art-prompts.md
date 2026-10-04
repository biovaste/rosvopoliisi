# Art prompts for the fire mode

Copy-paste prompts for the pictures the fire mode still draws in code, plus
more buildings for variety. Every block is complete: the subject first,
then the shared style, written to match the police game's generated art in
`art-src/`.

## How to use

1. **Attach a reference image if the generator allows it**, as noted under
   each prompt (`art-src/home.jpg` for buildings, `art-src/van.jpg` for the
   truck). It does more for a matching style than any wording.
2. Generate at 1024 px or more on the long side, in the shape given. Pick
   the result whose outlines and colours look closest to the existing
   pictures.
3. Save it as a **JPG with the given file name in `art-src/`**.
4. Run `python3 tools/prepare_art.py` (needs Pillow and numpy). It removes
   the white background, crops and scales. That is why every prompt asks for
   a pure white background with nothing touching the edges.

What happens next:

- **Homes and the new buildings** (school, library, store, hospital,
  kindergarten) appear in the game by themselves. If a door ends up
  off-centre, set its `door` value (fraction of the width) in `BUILDINGS`
  in `tools/prepare_art.py`.
- **The fire station, garage door and truck** need a small wiring step:
  measuring the garage opening, lamp sockets, cab window, light bar and hose
  reel, like the police van's. Ask for it once the pictures are in
  `art-src/`.
- The police station and the hospital never catch fire in the game.

## 1. Fire station

### `firestation.jpg`

Shape: landscape, about 6:5.
_Reference image to attach: `art-src/home.jpg`_

```text
A small two-storey fire station in red brick with white stone trim and a grey slate roof. On the left, a slim square tower one storey taller than the building, with a bronze bell hanging in an open arch at the top. In the middle-right, one wide garage opening for a fire engine, wide open, showing a plain dark empty interior: no door, no vehicle, nothing inside. Above the garage opening, a row of three small round empty lamp sockets. To the left of the garage, a small wooden side door and a plain white wall panel at child height. Two windows with white frames on the upper floor to the right. A round emblem on the tower showing a simple red flame on a gold shield. A low stone foundation along the bottom. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `garage-door.jpg`

Shape: landscape, about 4:3.
_Reference image to attach: your `firestation.jpg`_

```text
A closed roll-up garage door for a fire station: bright red horizontal slats with thin dark grooves, a row of four small rectangular windows across the upper third, a white frame. Just the door, as a flat rectangle, in the same red and outline style as the attached fire station. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

## 2. Fire truck

The firefighter's head is drawn by the code inside the windows, so they must be empty.

### `firetruck.jpg`

Shape: wide, about 5:2.
_Reference image to attach: `art-src/van.jpg`_

```text
A friendly red fire engine seen exactly from the side, facing right. A short rounded cab at the front (right) with one large side window, clear and empty, with nobody inside. A long equipment body behind it with silver roller-shutter lockers, a white stripe along the side, and a large round yellow hose reel with a coiled hose mounted on the side near the rear. A silver ladder lying flat along the roof. A blue light bar on the cab roof. Three black wheels with silver hubs. Chunky, rounded toy-like proportions, matching the attached cartoon police van. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `firetruck-front.jpg`

Shape: square.
_Reference image to attach: your `firetruck.jpg`_

```text
The same red fire engine as the attached picture, seen exactly from the front: a wide windscreen, clear and empty with nobody inside, a blue light bar on the roof, round headlights, a silver grille, a chunky silver bumper, the two front wheels visible below. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `firetruck-back.jpg`

Shape: square.
_Reference image to attach: your `firetruck.jpg`_

```text
The same red fire engine as the attached picture, seen exactly from behind: two tall silver roller-shutter doors, the end of the silver ladder at the top, a small blue light on the roof, red tail lights in the lower corners, a step board, the two rear wheels visible below. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

## 3. Town buildings

Flames are placed by position in the picture, so every building keeps the same layout: the entrance in the middle of the ground floor and upper-floor windows on the left and right.

### `school.jpg`

Shape: landscape, about 6:5.
_Reference image to attach: `art-src/home.jpg`_

```text
A friendly small-town primary school: a long yellow two-storey building with white window frames and a red tiled roof, a small clock tower with a bell in the middle of the roof, wide double doors with a little canopy in the middle, rows of tall windows with colourful children's paper drawings taped inside, a bicycle rack beside the entrance. Two storeys. The main entrance in the middle of the ground floor. Upper-floor windows on the left and on the right. A low stone foundation along the bottom. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `library.jpg`

Shape: about 1:1.
_Reference image to attach: `art-src/home.jpg`_

```text
A cosy town library: a pale green two-storey building with cream stone trim and a dark grey roof, tall arched windows full of bookshelves, a wooden double door in the middle under a small porch with two columns, a hanging sign shaped like an open book (no writing), a bench and potted plants by the door. Two storeys. The main entrance in the middle of the ground floor. Upper-floor windows on the left and on the right. A low stone foundation along the bottom. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `store.jpg`

Shape: about 1:1.
_Reference image to attach: `art-src/home.jpg`_

```text
A small corner grocery store: a light blue building with white trim and a flat roof, a wide glass shop window on the ground floor showing fruit crates, bread and milk bottles, a green and white striped awning, a glass door in the middle, a hanging sign with a simple shopping basket picture (no writing), crates of apples and oranges outside. Two storeys. The main entrance in the middle of the ground floor. Upper-floor windows on the left and on the right. A low stone foundation along the bottom. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `hospital.jpg`

Shape: landscape, about 6:5.
_Reference image to attach: `art-src/home.jpg`_

```text
A small friendly town hospital: a white two-storey building with soft blue trim and a light grey roof, many windows with blue frames, automatic glass doors in the middle under a wide canopy, a round sign above the entrance with a simple red heart on white (no cross, no writing), a little ambulance bay on one side without any vehicle. Two storeys. The main entrance in the middle of the ground floor. Upper-floor windows on the left and on the right. A low stone foundation along the bottom. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `kindergarten.jpg`

Shape: landscape, about 5:4.
_Reference image to attach: `art-src/home.jpg`_

```text
A cheerful kindergarten: a small wooden building painted bright orange with white trim and a green roof, round porthole windows, a big friendly painted sun and a rainbow on the wall, colourful handprints near the door, a bright red front door in the middle with a small canopy, flower boxes under the windows, a small rocking horse beside the door. Two storeys. The main entrance in the middle of the ground floor. Upper-floor windows on the left and on the right. A low stone foundation along the bottom. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

## 4. More homes

These keep the layout of `home.jpg`: two upper windows side by side in the middle of the upper floor, the front door in the middle of the ground floor, and a gabled roof.

### `home2.jpg`

Shape: portrait, about 5:6.
_Reference image to attach: `art-src/home.jpg`_

```text
A traditional Finnish red wooden house (falu red board walls) with white corner boards and white window frames, two storeys, a dark grey gabled roof, two windows side by side in the middle of the upper floor, a white front door with a small porch roof in the middle of the ground floor, a low stone foundation. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `home3.jpg`

Shape: portrait, about 5:6.
_Reference image to attach: `art-src/home.jpg`_

```text
A pale yellow wooden two-storey house with white trim, a red clay-tile gabled roof with a small chimney, two windows side by side in the middle of the upper floor with flower boxes, a green front door with three stone steps in the middle of the ground floor, a low stone foundation. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `home4.jpg`

Shape: portrait, about 5:6.
_Reference image to attach: `art-src/home.jpg`_

```text
A light blue two-storey town house with white trim and a grey slate gabled roof with one small dormer window, two windows side by side in the middle of the upper floor, a dark blue front door with a fanlight in the middle of the ground floor, a low stone foundation. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `home5.jpg`

Shape: portrait, about 5:6.
_Reference image to attach: `art-src/home.jpg`_

```text
A white plastered two-storey cottage with a moss-green gabled roof, green window shutters and climbing pink roses beside the door, two windows side by side in the middle of the upper floor, a wooden front door in the middle of the ground floor, a low stone foundation. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `home6.jpg`

Shape: portrait, about 5:6.
_Reference image to attach: `art-src/home.jpg`_

```text
A mint-green wooden two-storey house with cream trim, a brown gabled roof with a round attic window, two windows side by side in the middle of the upper floor, a red front door under a little canopy in the middle of the ground floor, a low stone foundation. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

## 5. Park and extras (optional)

The pond and sandbox break the front-view rule on purpose: they only read from above.

### `pond.jpg`

Shape: wide, about 2:1.
```text
A small oval garden pond: light blue water with soft white ripples, two green lily pads, a few reeds at one end and round grey stones around the edge. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Seen from high above at a steep angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No grass around it, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `sandbox.jpg`

Shape: landscape, about 3:2.
```text
A small square wooden sandbox with pale sand inside, a red bucket and a blue spade. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Seen from high above at a steep angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No grass around it, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```

### `hydrant.jpg`

Shape: portrait, about 1:2. For a later "refill the tank" idea.
```text
A short, chunky red fire hydrant with a silver cap and two side outlets. Children's storybook illustration in a soft hand-drawn style: clean dark-brown ink outlines of even weight (not black), warm cheerful colours, gentle painterly shading with a light paper texture, a cosy Nordic small-town look. Straight-on flat elevation with no perspective, no tilt and no three-quarter angle. A single object, centred and fully visible with a wide margin on every side, on a plain pure white background. No ground, no grass, no cast shadow, no people, no animals, no text, letters, numbers or logos, no watermark.
```
