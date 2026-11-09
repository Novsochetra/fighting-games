# Naga Eleven: the hero kit

The new main character, redrawn pixel by pixel after the reference sprite, as a kit: one body and
face that every player shares, and the layers that tell players apart. Open `inspector.html` in a
browser to turn him through all eight directions, swap every part and colour, and read any pixel's
layer, ramp, shade and colour.

```bash
python3 tools/hero_kit/make.py
```

## The layers

Each layer is a grid of letters, one text row per pixel row on a 100 × 116 canvas, soles on row 109
(a foot toward the camera reaches lower) and the body centred between columns 49 and 50. A letter
names a ramp and a shade, dark to light (`tools/hero_kit/letters.py`), so a player's colours
repaint the same art shade for shade. They stack in this order:

| layer           | what                                               | how it is made                       |
| --------------- | -------------------------------------------------- | ------------------------------------ |
| `body/`         | the body, kit and face every player shares         | 3D blockout, then painted over       |
| the number      | the shirt number, any one or two digits            | a pixel font, printed on the shirt   |
| `scars/<name>/` | cheek slash, split brow, eye scar, nose bridge     | by hand, in the skin's own shades    |
| `hair/<style>/` | spiky (the hero's), buzz, mohawk, bowl             | spiky as clumps; the others in 3D    |
| `gear/<name>/`  | wristbands, captain band, headband, keeper gloves… | 3D; earrings and the plaster by hand |

## Directions

All eight directions are lit from the upper left. South, south-east, east, north-east and north
are painted. South-west, west and north-west are their mirror images lit again: the body's shading
below the head is turned back run by run (`body_draw.py`), the hero's hair is painted from mirrored
clumps, and the hand-drawn marks are carried across with their sides swapped (`mirror.py`). A part on
one side of him (a scar) is drawn for its counterpart from the other side, as a twin (`TWIN_SCARS`),
so it stays on its own side as he turns.

## How the art is made

- `reference.png` is the hero as designed, the target every direction is drawn to.
- `model.py` builds the hero from rounded shapes in 3D. `render.py` looks at it through the game's
  camera and `pixel.py` turns it into flat shades and outlines (`bake.py`). That bake seeded each
  painted direction; `regions.py` puts the kit's trims on it so they agree in every direction.
- `tools/hero_kit/body_art/<direction>.txt` are the painted masters: the bake painted over pixel by
  pixel, with the face, fists, knees, sock cuffs and boots drawn by hand. Edit a master directly to
  change a pixel.
- `selout.py` outlines selectively: black where the figure turns from the light, a dark shade of the
  part's own colour on its lit edges and between parts.
- `hair_art/spiky.py` draws the hero's hair as clumps (`hair_clumps.py`): polygons with a light rim
  on their upper-left edges, a dark one on the lower right, creases where they overlap and a sheen
  band over the lit side of the crown. `hair_art/<style>_<direction>.py` draws the bowl and the
  mohawk's crest as locks (`locks.py`), the crest over the 3D head of `shaved`.
- `marks_art.py` holds the scars, the earrings and the plaster.
- `looks.py` holds the sample players and the swatches the inspector offers.
