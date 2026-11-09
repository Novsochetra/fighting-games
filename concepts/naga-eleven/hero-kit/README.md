# Naga Eleven: the hero kit

The new main character, redrawn pixel by pixel from the reference sprite, as a kit: one body and
face that every player shares, and the layers that tell players apart. Open `inspector.html` in a
browser to turn him through all eight directions, swap every part and colour, and read any pixel's
layer, ramp, shade and colour.

```bash
python3 tools/hero_kit/make.py
```

## The layers

Each layer is a grid of letters, one text row per pixel row on a 100 × 112 canvas, soles on row 109
and the body centred between columns 49 and 50. A letter names a ramp and a shade, dark to light
(`tools/hero_kit/letters.py`), so a player's colours repaint the same art shade for shade. They stack
in this order:

| layer           | what                                               | how it is made                       |
| --------------- | -------------------------------------------------- | ------------------------------------ |
| `body/`         | the body, kit and face every player shares         | 3D blockout, then the face by hand   |
| the number      | the shirt number, any one or two digits            | a pixel font, printed on the shirt   |
| `scars/<name>/` | cheek slash, split brow, eye scar, nose bridge     | by hand, in the skin's own shades    |
| `hair/<style>/` | spiky (the hero's), buzz, mohawk, bowl             | spiky by hand; the others in 3D      |
| `gear/<name>/`  | wristbands, captain band, headband, keeper gloves… | 3D; earrings and the plaster by hand |

## Directions

Five directions are drawn (`south`, `south-east`, `east`, `north-east`, `north`); west,
south-west and north-west are their mirrors. The number is printed after mirroring, so it never
reads backwards. A scar changes cheek in a mirrored direction, as everything else does.

## How the art is made

- `model.py` builds the hero from rounded shapes in 3D, matched to the reference's proportions.
  `render.py` looks at it through the game's camera (from the south and above, the ground squashed
  by a quarter) and `pixel.py` turns that into ramp shades and outlines. This keeps him the same
  size and build in every direction.
- `regions.py` puts the kit's details on the 3D body (the V-neck's trim, the cuffs, the stripes
  down the shorts, the sock tops, the boots' flash and soles), so they line up in every direction.
- `body_art/<direction>.py` holds what is drawn by hand over that: the faces (front, three-quarter
  and profile), the fists and the boots.
- `hair_art/spiky_<direction>.py` draws the hero's hair as locks: polygons painted with a lit edge,
  a base, a dark underside and a blue sheen, outlined against the background.
- `marks_art.py` holds the scars, the earrings and the plaster.
- `looks.py` holds the sample players and the swatches the inspector offers.
