# Enemy sprites

Sixteen enemies, designed and animated with PixelLab: the designs came from one batch of 64×64
side-view concepts (`concepts/enemies/` at the repo root), and each strip is a PixMiniMax animation of
that concept, facing right. The three bosses were redrawn at 96×96 first.

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
x=96, y=108. Hit splashes the model painted onto hurt and knock-out frames were removed.
