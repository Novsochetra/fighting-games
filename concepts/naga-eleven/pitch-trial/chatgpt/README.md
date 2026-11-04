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

| animation | frames | speed  | directions                           | pose sheets                                    |
| --------- | ------ | ------ | ------------------------------------ | ---------------------------------------------- |
| idle      | 1      | –      | south, south-east, east, NE, N       | `pose-idle`                                    |
| run       | 6      | 12 fps | all five                             | `pose-run-<direction>`                         |
| kick      | 3      | 12 fps | south, south-east, east, NE          | `pose-kick-south-southeast`, `-east-northeast` |
| slide     | 3      | 12 fps | all five                             | `pose-slide-…` (three sheets)                  |
| fall      | 4      | 7 fps  | all five; frames 1–3 are the slide's | `pose-fall-getting-up` (frame 4 only)          |
| dive      | 8      | 14 fps | east (the keeper)                    | `pose-dive-east-1`, `-2`                       |
| celebrate | 8      | 10 fps | south                                | `pose-celebrate-1`, `-2`                       |

The directions in words: south faces the camera; south-east faces down and to the right; east is
side on, facing right; north-east faces away and to the right; north is the back.

## The prompts

`PROMPTS.md` holds one whole prompt per sheet: one chat per sheet, three images attached
(`size-reference.png`, the pose sheet, `../../pitch-boy-front.webp`), then that sheet's prompt. If
he comes back too big or off the lines, use the edit tool on that cell and say "make him exactly
as tall as the green lines".
