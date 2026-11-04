# Naga Eleven: the pitch player's states, for ChatGPT

The pitch player's animations redrawn by ChatGPT in the new style (`../../pitch-boy-front.webp`),
at exactly the size the game draws him. Each pose sheet here is the game's own frames on a pixel
grid, in the cells ChatGPT fills.

```bash
python3 tools/pitch_trial/pose_sheets.py
```

## The sizes

| what           | size                                                                   |
| -------------- | ---------------------------------------------------------------------- |
| one frame      | 64 × 62 px                                                             |
| feet (anchor)  | x 32, soles on row 60 (the anchor is row 61, just under them)          |
| standing       | 58 px tall, head top on row 3                                          |
| width          | about 29 px facing the camera, 17 px side on                           |
| head           | rows 3–17, about 15 px, so the player is about 4 heads tall            |
| shirt          | rows 19–35                                                             |
| shorts         | rows 36–46                                                             |
| legs and socks | rows 47–54                                                             |
| boots          | rows 55–60                                                             |
| on the sheets  | one game pixel is a 6 × 6 square, so a cell is 384 × 372; 12 px gaps   |
| on the grid    | top green line: head top (row 3); bottom green line: soles; blue: x 32 |

## The animations

The game draws five directions and mirrors the other three, so west, south-west and north-west
are never drawn.

| animation | frames | speed  | directions                     | pose sheets                                    |
| --------- | ------ | ------ | ------------------------------ | ---------------------------------------------- |
| idle      | 1      | –      | south, south-east, east, NE, N | `pose-idle`                                    |
| run       | 6      | 12 fps | all five                       | `pose-run-<direction>`                         |
| kick      | 3      | 12 fps | south, south-east, east, NE    | `pose-kick-south-southeast`, `-east-northeast` |
| slide     | 3      | 12 fps | all five                       | `pose-slide-…` (three sheets)                  |
| fall      | 4      | 7 fps  | all five                       | `pose-fall-<direction>`                        |
| dive      | 8      | 14 fps | east (the keeper)              | `pose-dive-east-1`, `-2`                       |
| celebrate | 8      | 10 fps | south                          | `pose-celebrate-1`, `-2`                       |

The directions in words: south faces the camera; south-east faces down and to the right; east is
side on, facing right; north-east faces away and to the right; north is the back.

## The prompt

Attach three images, in this order:

1. `size-reference.png`: the new-style boy on the left, the current player on the right, both at
   the game's size.
2. The pose sheet.
3. `../../pitch-boy-front.webp`, for his face and hair.

Paste the prompt, then the sheet's line from the list after it.

```text
Redraw every pose in the second image as pixel art of the boy on the LEFT of the first image:
the same spiky black hair, big anime eyes, red short-sleeved shirt, white shorts, navy socks,
white boots and warm brown skin. The third image shows his face and hair closer.

Keep the second image's layout exactly: the same cells in the same places, the same dark grey gaps
between them, and a flat magenta background (pure #FF00FF) in every cell. Each cell is one game
frame of 64 by 62 pixels, drawn 6 times larger: one game pixel is one solid 6 by 6 square of the
grid.

In every cell:
- he does the same thing, facing the same way, as the pose already in that cell, and replaces it
- he is the same size as that pose: standing, he is 58 pixels tall, his hair touching the top
  green line and his soles on the bottom green line
- his feet are centred on the blue line, unless the pose is in the air or on the ground
- a 1-pixel black outline goes all around him
- every pixel is one solid 6 by 6 square in one flat colour: no anti-aliasing, no blur, no
  gradients, no soft shading, no glow
- nothing else is in the cell: no ground, no shadow, no ball, no lines, no text, and no grid

Use only these colours:
- outline: pure black
- shirt: four reds, from a deep wine red in the shadows to a bright warm red in the light
- shorts: white, shaded with pale blue-grey
- socks: navy blue, with two lighter blues for the light
- skin: warm brown, four shades from dark brown to light tan
- hair: black, with dark grey and grey for the light
- boots: white, shaded with light grey
- eyes: a cream white

This sheet:
```

The sheet's line:

| pose sheet                   | line to paste after "This sheet:"                                                                                                                                       |
| ---------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pose-idle`                  | He stands still, ready, in five directions: facing the camera, facing down-right, side on facing right, facing up-right, and his back. The sixth cell stays empty.      |
| `pose-run-south`             | Six frames of a sprinting loop facing the camera, the last leading back into the first.                                                                                 |
| `pose-run-south-east`        | Six frames of a sprinting loop facing down and to the right, the last leading back into the first.                                                                      |
| `pose-run-east`              | Six frames of a sprinting loop side on, facing right, the last leading back into the first.                                                                             |
| `pose-run-north-east`        | Six frames of a sprinting loop facing away and to the right, the last leading back into the first.                                                                      |
| `pose-run-north`             | Six frames of a sprinting loop, his back to us, the last leading back into the first.                                                                                   |
| `pose-kick-south-southeast`  | A hard kick with the right foot in three frames, back-swing, strike, follow-through: top row facing the camera, bottom row facing down-right.                           |
| `pose-kick-east-northeast`   | A hard kick with the right foot in three frames, back-swing, strike, follow-through: top row side on facing right, bottom row facing up-right.                          |
| `pose-slide-south-southeast` | A sliding tackle in three frames, dropping onto his hip, sliding with one leg out, the leg stretched full: top row facing the camera, bottom row facing down-right.     |
| `pose-slide-east-northeast`  | A sliding tackle in three frames, dropping onto his hip, sliding with one leg out, the leg stretched full: top row side on facing right, bottom row facing up-right.    |
| `pose-slide-north`           | A sliding tackle in three frames, dropping onto his hip, sliding with one leg out, the leg stretched full, his back to us. The bottom row stays empty.                  |
| `pose-fall-<direction>`      | Brought down in four frames: dropping onto his hip, sliding on the grass, legs out, then pushing back up to run on; facing as the poses face.                           |
| `pose-dive-east-1`           | The keeper's dive to his right in frames 1 to 4 of 8, side on facing right: standing set, pushing off, launching with arms out, flying stretched out.                   |
| `pose-dive-east-2`           | The keeper's dive in frames 5 to 8 of 8, side on facing right: flying flat, coming down, landing on his front, lying stretched out on the grass, arms reaching.         |
| `pose-celebrate-1`           | A goal celebration facing the camera in frames 1 to 4 of 8: standing, crouching to jump, rising with a shout and fists clenched, in the air with both arms up in a V.   |
| `pose-celebrate-2`           | The goal celebration facing the camera in frames 5 to 8 of 8: still in the air, arms up, shouting, landing with fists clenched, standing proud with fists by his chest. |

Ask for one sheet a chat at a time. If he comes back too big or off the lines, use the edit tool
on that cell and say "make him exactly as tall as the green lines".
