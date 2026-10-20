# Enemy sprites

Twenty-nine enemies, designed and animated with PixelLab. The first sixteen came from one batch of
64×64 side-view concepts (`concepts/enemies/` at the repo root, `01` to `16`), and their three bosses
were redrawn at 96×96 first. The thirteen added with the missions (`17` to `29`: seven bosses at
96×96, six raiders at 64×64) were drawn with Create Image (Pro), styled after the first batch.

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
