# Enemy sprites

Thirty-one enemies. Twenty-nine were designed and animated with PixelLab; the two temple bosses are
recolors of two of them (below). The first sixteen came from one batch of 64×64 side-view concepts
(`concepts/enemies/` at the repo root, `01` to `16`), and their three bosses were redrawn at 96×96
first. The thirteen added with the missions (`17` to `29`: seven bosses at 96×96, six raiders at
64×64) were drawn with Create Image (Pro), styled after the first batch.

Each strip is a PixMiniMax animation of the concept, facing right, generated on a frame the size of
the sheet's frame with the concept standing on the feet line, so the strips need no resizing. Every
strip but `ko` is pinned back to the concept's feet where the model drifted, and the sheets are
indexed PNGs.

Each PNG holds one enemy, one row per strip. `src/data/enemies/enemy-sprites.js` gives the frame size,
the feet position and each strip's row, frame count and strike frame:

| Strip    | Frames | What it shows                                                        |
| -------- | ------ | -------------------------------------------------------------------- |
| `idle`   | 4      | breathing loop                                                       |
| `walk`   | 8      | walk loop                                                            |
| `attack` | 9      | frame 0 is the stance, then the wind-up, the strike and the recovery |
| `hurt`   | 4      | recoil and recover                                                   |
| `ko`     | 9      | 0 stands, 1-4 fly backward, 5-8 land and lie still                   |
| `lunge`  | 9      | Red Cutter only: crouch, then a running lunge                        |
| `slam`   | 9      | bosses: wind-up and a strike into the ground                         |
| `charge` | 8      | bosses: a running loop                                               |

Regular enemies use 128×80 frames with the feet at x=64, y=76; bosses use 192×112 with the feet at
x=96, y=108. Hit splashes and flashes the model painted onto hurt and knock-out frames were removed.
Where a generated knock-out landed early or late, its frames were picked to fit the 1-4 / 5-8 split.

The two bosses of the temple roads are palette swaps of finished sheets, so they keep every frame,
the strips and the strike frames of their source. A short Python (PIL) script rewrote each indexed
sheet's palette, mapping every entry by hue band and lightness onto a new ramp, so the shading
ramps keep their order and the outlines, blades and transparency stay as they were:

| Sheet          | From           | Recolor                                                                                                                                                        |
| -------------- | -------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `naga.png`     | `cobra.png`    | Naga Raja: green scales to deep jade and emerald with turquoise highlights, the rust-red hood to gold over dark bronze, a richer gold belly, a turquoise slash |
| `guardian.png` | `colossus.png` | Bayon Guardian: rust to cool grey-green sandstone, a few speckled rust shades to moss, the bright rust highlights and the red eye to a warm gold glow          |
| `ironhorn.png` | `hornRush` 10 (paws, runs, skids), `uppercut` 8, `dazed` 6 (a loop; the stars are `fx/stars.png`), `stampede` 12 (rears, stomps, runs, skids) |

## Boss kits

A boss with a kit of its own (`docs/boss-kits.md`) has more rows under the seven above, one per move
of its own, named as the move is. Each plays on the move's own timeline (`frameAt`), so its strike
frame only has to lie inside the strip. A boulder or a mace held overhead does not fit a 192×112 frame, so `colossus.png` and `ironhorn.png`
have 192×160 frames with the feet at y = 156: their first seven rows are the old ones moved 48px down. They are drawn by an image model, then lifted off their
background, cut into frames, shrunk to the boss's idle height, stood on the feet line and folded
into the sheet's own palette.

| Sheet      | Rows added                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `khan.png` | `warHorn` 8 (blows a ram's horn), `crescentDash` 10 (crouch, lunge, slash), `tempest` 12 (three low swings) |
| `colossus.png` | `boulderLob` 10 (tears up a boulder, hurls it), `spikeLine` 8 (a stomp), `landslide` 12 (pounds the ground twice, roars) |
