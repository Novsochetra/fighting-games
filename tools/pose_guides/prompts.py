"""Writes chatgpt-prompts.md beside the guides: how to use them, and one prompt per strip."""

from stage import ANCHOR, FRAME, GUIDE_SCALE as SCALE

FACING_WORDS = {
    'south': 'facing the camera (toward the bottom of the screen)',
    'south-east': 'facing down and to the right, three-quarter front view',
    'east': 'facing right, side view',
    'north-east': 'facing up and to the right, three-quarter back view',
    'north': 'facing away from the camera (toward the top of the screen), back view',
}

INTRO = """# Naga Eleven: pose guides for ChatGPT

Drawn by `python3 tools/pose_guides/make.py`; change a pose in `tools/pose_guides/animations/`, run
`python3 tools/pose_guides/check.py` (every frame stands on the feet line inside the game's frame)
and draw them again. The poses are our own, not traced from the old sheets. Each animation folder
holds:

- `<direction>.png`: **the strip to attach**, its frames left to right, {scale}x the game's size,
- `sheet.png`: every direction at once, to check the animation,
- `<direction>.gif`: the strip played at the game's speed.

## Reading a guide

- **Red and orange are his right leg and arm; blue and cyan his left.** A limb drawn over another
  is nearer the camera.
- The dots on the head are his eyes: they show where he looks. No dots: we see the back of his head.
- The green line is the feet line: his soles stand on it, nothing goes below it.
- The pale grey ball is a guide only. **The game draws the ball itself: never draw it in a sprite.**
- The camera is the game's: from the south and a little above, a standing player 58 px tall.

## How to use

1. Start a chat and attach a **character reference**: one clean frame of the footballer
   (`apps/web/games/naga-eleven/assets/sprites/idle.png`, cut one frame, or a design sheet).
2. Attach the guide strip, e.g. `run/east.png`, and paste that strip's prompt below.
3. Check the result: same frame count, one row, feet on the line, nothing cut off, flat pixels.
4. One direction per chat message. Do `east` first: it is the clearest, then use the good `east`
   result as an extra reference for `south-east` and `north-east`, then `south` and `north`.
   West-facing rows are the east ones mirrored by the game: never draw them.

## Rules every prompt carries

The game recolours the player shade for shade, so the colours must stay close to these (a bake step
snaps them to exact values afterward):

| part   | shades, dark to light                  |
| ------ | -------------------------------------- |
| shirt  | #4d061d #89122a #bd1f23 #db3128        |
| shorts | #59677a #8596a7 #abbeca #ebf3f8        |
| socks  | #1a1a61 #383789 #4e58ae                |
| skin   | #68201d #90412e #bf7448 #da8661        |
| hair   | #100f0f #2d2c2d #56555b                |

Boots, outline, eyes and teeth: near black.

---
"""

RULES = """RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- {frames} frames in ONE row, left to right, no gaps, each frame {width}x{height} px
  (the whole image {total}x{height}), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a {small_w}x{small_h} grid and enlarged exactly {scale}x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text."""


def prompt(animation, direction):
    frame = animation.get('frame', FRAME)
    width, height = frame[0] * SCALE, frame[1] * SCALE
    count = len(animation['frames'])
    beats = '\n'.join(f'{index + 1}. {beat}' for index, beat in enumerate(animation['beats']))
    rules = RULES.format(frames=count, width=width, height=height, total=width * count,
                         small_w=frame[0], small_h=frame[1], scale=SCALE)
    loop = 'It loops: the last frame leads back into the first.' if animation['loop'] else 'It plays once.'

    return f"""### {animation['name']} · {direction}

Attach: the character reference and `{animation['name']}/{direction}.png`. Save as
`{animation['name']}-{direction}.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: {animation['describe']}.
In every frame he is {FACING_WORDS[direction]}. {loop}

FRAMES
{beats}

{rules}
```
"""


def document(animations):
    parts = [INTRO.format(scale=SCALE)]

    for animation in animations:
        frame = animation.get('frame', FRAME)
        anchor = animation.get('anchor', ANCHOR)
        parts.append(f"## {animation['name']}\n\n{len(animation['frames'])} frames at "
                     f"{animation['fps']} fps, frame {frame[0]}x{frame[1]}, feet at "
                     f"x={anchor[0]} y={anchor[1]}; directions: {', '.join(animation['directions'])}.\n")
        parts += [prompt(animation, direction) for direction in animation['directions']]

    return '\n'.join(parts)
