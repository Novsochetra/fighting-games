# Naga Eleven: the hero kit

The new main character, redrawn pixel by pixel from the reference sprite, as a kit: one body and
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
| `body/`         | the body, kit and face every player shares         | 3D blockout, then the face by hand   |
| the number      | the shirt number, any one or two digits            | a pixel font, printed on the shirt   |
| `scars/<name>/` | cheek slash, split brow, eye scar, nose bridge     | by hand, in the skin's own shades    |
| `hair/<style>/` | spiky (the hero's), buzz, mohawk, bowl             | spiky by hand; the others in 3D      |
| `gear/<name>/`  | wristbands, captain band, headband, keeper gloves… | 3D; earrings and the plaster by hand |

## Directions

All eight directions are drawn, each lit from the upper left. South, south-east, east, north-east
and north are drawn by hand over the 3D blockout. South-west, west and north-west are rendered in 3D
on their own, and their hand-drawn parts (the faces, the hair's locks, the scars) are carried across
from their counterpart with the sides swapped and lit again from the upper left (`mirror.py`). A
part on one side of him (a scar, the sweep of the hero's hair) is drawn for its counterpart from the
other side, as a twin (`TWIN_LOCKS`, `TWIN_SCARS`), so it stays on its own side as he turns.

## How the art is made

- `reference.png` is the hero as designed. The front is that drawing: `tools/hero_kit/reference/`
  reads its body into the kit's letters by region, takes its hair into the hair layer, and
  `body_art/south.py` puts it under a bald head drawn by hand with the reference's face, so every
  hairstyle sits on one skull.
- The back (`body_art/north.py`) is the front's body turned round and repainted where the back
  differs; its hair is the reference's turned round, with locks falling to the nape over the face.
- `model.py` builds the hero from rounded shapes in 3D, fitted to the reference's silhouette.
  `render.py` looks at it through the game's camera (from the south and above, the ground squashed
  by a quarter) and `pixel.py` turns it into the reference's flat shades and outlines, for the
  three-quarter and side views. `regions.py` puts the kit's trims on it, so they agree in every
  direction.
- `body_art/<direction>.py` holds what is drawn by hand over the 3D views: the faces in the
  reference's style, the fists, the boots, the shirt's folds.
- `hair_art/<style>_<direction>.py` draws a hairstyle as locks, polygons painted with a stripe lit
  along each lock, a dark side and a blue sheen. The mohawk's crest is drawn over the 3D head of
  `shaved`.
- `marks_art.py` holds the scars, the earrings and the plaster.
- `looks.py` holds the sample players and the swatches the inspector offers.
