# Naga Eleven: pose guides for ChatGPT

Drawn by `python3 tools/pose_guides/make.py`; change a pose in `tools/pose_guides/animations/`, run
`python3 tools/pose_guides/check.py` (every frame stands on the feet line inside the game's frame)
and draw them again. The poses are our own, not traced from the old sheets. Each animation folder
holds:

- `<direction>.png`: **the strip to attach**, its frames left to right, 4x the game's size,
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

## idle

4 frames at 6 fps, frame 64x62, feet at x=32 y=61; directions: south, south-east, east, north-east, north.

### idle · south

Attach: the character reference and `idle/south.png`. Save as
`idle-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a ready stance on the balls of his feet, knees soft, breathing: he sinks a little and rises back.
In every frame he is facing the camera (toward the bottom of the screen). It loops: the last frame leads back into the first.

FRAMES
1. up
2. sinking
3. lowest
4. rising

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### idle · south-east

Attach: the character reference and `idle/south-east.png`. Save as
`idle-south-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a ready stance on the balls of his feet, knees soft, breathing: he sinks a little and rises back.
In every frame he is facing down and to the right, three-quarter front view. It loops: the last frame leads back into the first.

FRAMES
1. up
2. sinking
3. lowest
4. rising

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### idle · east

Attach: the character reference and `idle/east.png`. Save as
`idle-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a ready stance on the balls of his feet, knees soft, breathing: he sinks a little and rises back.
In every frame he is facing right, side view. It loops: the last frame leads back into the first.

FRAMES
1. up
2. sinking
3. lowest
4. rising

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### idle · north-east

Attach: the character reference and `idle/north-east.png`. Save as
`idle-north-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a ready stance on the balls of his feet, knees soft, breathing: he sinks a little and rises back.
In every frame he is facing up and to the right, three-quarter back view. It loops: the last frame leads back into the first.

FRAMES
1. up
2. sinking
3. lowest
4. rising

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### idle · north

Attach: the character reference and `idle/north.png`. Save as
`idle-north.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a ready stance on the balls of his feet, knees soft, breathing: he sinks a little and rises back.
In every frame he is facing away from the camera (toward the top of the screen), back view. It loops: the last frame leads back into the first.

FRAMES
1. up
2. sinking
3. lowest
4. rising

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## run

6 frames at 12 fps, frame 64x62, feet at x=32 y=61; directions: south, south-east, east, north-east, north.

### run · south

Attach: the character reference and `run/south.png`. Save as
`run-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sprint: leaning forward, arms pumping at a right angle opposite the legs, both feet off the grass on frames 3 and 6.
In every frame he is facing the camera (toward the bottom of the screen). It loops: the last frame leads back into the first.

FRAMES
1. right foot lands
2. right leg takes weight
3. right foot pushes off, flight
4. left foot lands
5. left leg takes weight
6. left foot pushes off, flight

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 6 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1536x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### run · south-east

Attach: the character reference and `run/south-east.png`. Save as
`run-south-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sprint: leaning forward, arms pumping at a right angle opposite the legs, both feet off the grass on frames 3 and 6.
In every frame he is facing down and to the right, three-quarter front view. It loops: the last frame leads back into the first.

FRAMES
1. right foot lands
2. right leg takes weight
3. right foot pushes off, flight
4. left foot lands
5. left leg takes weight
6. left foot pushes off, flight

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 6 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1536x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### run · east

Attach: the character reference and `run/east.png`. Save as
`run-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sprint: leaning forward, arms pumping at a right angle opposite the legs, both feet off the grass on frames 3 and 6.
In every frame he is facing right, side view. It loops: the last frame leads back into the first.

FRAMES
1. right foot lands
2. right leg takes weight
3. right foot pushes off, flight
4. left foot lands
5. left leg takes weight
6. left foot pushes off, flight

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 6 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1536x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### run · north-east

Attach: the character reference and `run/north-east.png`. Save as
`run-north-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sprint: leaning forward, arms pumping at a right angle opposite the legs, both feet off the grass on frames 3 and 6.
In every frame he is facing up and to the right, three-quarter back view. It loops: the last frame leads back into the first.

FRAMES
1. right foot lands
2. right leg takes weight
3. right foot pushes off, flight
4. left foot lands
5. left leg takes weight
6. left foot pushes off, flight

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 6 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1536x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### run · north

Attach: the character reference and `run/north.png`. Save as
`run-north.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sprint: leaning forward, arms pumping at a right angle opposite the legs, both feet off the grass on frames 3 and 6.
In every frame he is facing away from the camera (toward the top of the screen), back view. It loops: the last frame leads back into the first.

FRAMES
1. right foot lands
2. right leg takes weight
3. right foot pushes off, flight
4. left foot lands
5. left leg takes weight
6. left foot pushes off, flight

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 6 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1536x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## kick

4 frames at 12 fps, frame 64x62, feet at x=32 y=61; directions: south, south-east, east, north-east, north.

### kick · south

Attach: the character reference and `kick/south.png`. Save as
`kick-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a shot with the right foot: the left foot planted beside the ball, the right leg swings through, the left arm out wide for balance.
In every frame he is facing the camera (toward the bottom of the screen). It plays once.

FRAMES
1. left foot plants, right leg cocked back
2. right instep meets the ball
3. follow-through, right leg high, up on the left toe
4. right foot comes down

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### kick · south-east

Attach: the character reference and `kick/south-east.png`. Save as
`kick-south-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a shot with the right foot: the left foot planted beside the ball, the right leg swings through, the left arm out wide for balance.
In every frame he is facing down and to the right, three-quarter front view. It plays once.

FRAMES
1. left foot plants, right leg cocked back
2. right instep meets the ball
3. follow-through, right leg high, up on the left toe
4. right foot comes down

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### kick · east

Attach: the character reference and `kick/east.png`. Save as
`kick-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a shot with the right foot: the left foot planted beside the ball, the right leg swings through, the left arm out wide for balance.
In every frame he is facing right, side view. It plays once.

FRAMES
1. left foot plants, right leg cocked back
2. right instep meets the ball
3. follow-through, right leg high, up on the left toe
4. right foot comes down

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### kick · north-east

Attach: the character reference and `kick/north-east.png`. Save as
`kick-north-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a shot with the right foot: the left foot planted beside the ball, the right leg swings through, the left arm out wide for balance.
In every frame he is facing up and to the right, three-quarter back view. It plays once.

FRAMES
1. left foot plants, right leg cocked back
2. right instep meets the ball
3. follow-through, right leg high, up on the left toe
4. right foot comes down

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### kick · north

Attach: the character reference and `kick/north.png`. Save as
`kick-north.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a shot with the right foot: the left foot planted beside the ball, the right leg swings through, the left arm out wide for balance.
In every frame he is facing away from the camera (toward the top of the screen), back view. It plays once.

FRAMES
1. left foot plants, right leg cocked back
2. right instep meets the ball
3. follow-through, right leg high, up on the left toe
4. right foot comes down

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## slide

3 frames at 12 fps, frame 64x62, feet at x=32 y=61; directions: south, south-east, east, north-east, north.

### slide · south

Attach: the character reference and `slide/south.png`. Save as
`slide-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sliding tackle: he drops onto his left hip and slides feet first, the right leg straight out along the grass, the left leg folded under him.
In every frame he is facing the camera (toward the bottom of the screen). It plays once.

FRAMES
1. drops, right leg shooting forward
2. full slide on the grass, left hand behind him
3. right foot hooks up through the ball

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 3 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 768x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### slide · south-east

Attach: the character reference and `slide/south-east.png`. Save as
`slide-south-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sliding tackle: he drops onto his left hip and slides feet first, the right leg straight out along the grass, the left leg folded under him.
In every frame he is facing down and to the right, three-quarter front view. It plays once.

FRAMES
1. drops, right leg shooting forward
2. full slide on the grass, left hand behind him
3. right foot hooks up through the ball

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 3 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 768x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### slide · east

Attach: the character reference and `slide/east.png`. Save as
`slide-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sliding tackle: he drops onto his left hip and slides feet first, the right leg straight out along the grass, the left leg folded under him.
In every frame he is facing right, side view. It plays once.

FRAMES
1. drops, right leg shooting forward
2. full slide on the grass, left hand behind him
3. right foot hooks up through the ball

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 3 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 768x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### slide · north-east

Attach: the character reference and `slide/north-east.png`. Save as
`slide-north-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sliding tackle: he drops onto his left hip and slides feet first, the right leg straight out along the grass, the left leg folded under him.
In every frame he is facing up and to the right, three-quarter back view. It plays once.

FRAMES
1. drops, right leg shooting forward
2. full slide on the grass, left hand behind him
3. right foot hooks up through the ball

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 3 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 768x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### slide · north

Attach: the character reference and `slide/north.png`. Save as
`slide-north.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a sliding tackle: he drops onto his left hip and slides feet first, the right leg straight out along the grass, the left leg folded under him.
In every frame he is facing away from the camera (toward the top of the screen), back view. It plays once.

FRAMES
1. drops, right leg shooting forward
2. full slide on the grass, left hand behind him
3. right foot hooks up through the ball

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 3 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 768x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## fall

4 frames at 7 fps, frame 64x62, feet at x=32 y=61; directions: south, south-east, east, north-east, north.

### fall · south

Attach: the character reference and `fall/south.png`. Save as
`fall-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: tackled: he trips, falls on his front, lands on his hands and pushes back up to one knee.
In every frame he is facing the camera (toward the bottom of the screen). It plays once.

FRAMES
1. tripped, right leg swept back, arms flung
2. falling forward, hands reaching for the grass
3. down on his front, head up
4. up on his left knee, right foot planted

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### fall · south-east

Attach: the character reference and `fall/south-east.png`. Save as
`fall-south-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: tackled: he trips, falls on his front, lands on his hands and pushes back up to one knee.
In every frame he is facing down and to the right, three-quarter front view. It plays once.

FRAMES
1. tripped, right leg swept back, arms flung
2. falling forward, hands reaching for the grass
3. down on his front, head up
4. up on his left knee, right foot planted

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### fall · east

Attach: the character reference and `fall/east.png`. Save as
`fall-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: tackled: he trips, falls on his front, lands on his hands and pushes back up to one knee.
In every frame he is facing right, side view. It plays once.

FRAMES
1. tripped, right leg swept back, arms flung
2. falling forward, hands reaching for the grass
3. down on his front, head up
4. up on his left knee, right foot planted

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### fall · north-east

Attach: the character reference and `fall/north-east.png`. Save as
`fall-north-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: tackled: he trips, falls on his front, lands on his hands and pushes back up to one knee.
In every frame he is facing up and to the right, three-quarter back view. It plays once.

FRAMES
1. tripped, right leg swept back, arms flung
2. falling forward, hands reaching for the grass
3. down on his front, head up
4. up on his left knee, right foot planted

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### fall · north

Attach: the character reference and `fall/north.png`. Save as
`fall-north.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: tackled: he trips, falls on his front, lands on his hands and pushes back up to one knee.
In every frame he is facing away from the camera (toward the top of the screen), back view. It plays once.

FRAMES
1. tripped, right leg swept back, arms flung
2. falling forward, hands reaching for the grass
3. down on his front, head up
4. up on his left knee, right foot planted

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 4 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 1024x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## dive

8 frames at 14 fps, frame 64x62, feet at x=32 y=61; directions: east.

### dive · east

Attach: the character reference and `dive/east.png`. Save as
`dive-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: the keeper's dive, seen from the side: set, load, spring off his left foot, fly flat with both gloves stretched out, land on his chest and gather the ball in.
In every frame he is facing right, side view. It plays once.

FRAMES
1. set, gloves ready
2. loads, deep crouch
3. springs off the left foot
4. rising, arms reaching
5. full stretch, flat in the air
6. coming down
7. lands on his chest, gloves on the grass
8. gathers in, knees drawn

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 8 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 2048x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## celebrate

8 frames at 10 fps, frame 64x62, feet at x=32 y=61; directions: south.

### celebrate · south

Attach: the character reference and `celebrate/south.png`. Save as
`celebrate-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a goal celebration facing the camera: he crouches, springs up with both arms thrown up in a V, lands and pumps both fists, shouting.
In every frame he is facing the camera (toward the bottom of the screen). It loops: the last frame leads back into the first.

FRAMES
1. stands, fists clenched
2. crouches to jump
3. rising, fists by his face
4. off the ground, arms up
5. top of the jump, knees tucked
6. coming down, arms up
7. lands, fists pumped
8. chest out, roaring

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 8 frames in ONE row, left to right, no gaps, each frame 256x248 px
  (the whole image 2048x248), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x62 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

## throw

2 frames at 1 fps, frame 64x74, feet at x=32 y=73; directions: south, south-east, east, north-east, north.

### throw · south

Attach: the character reference and `throw/south.png`. Save as
`throw-south.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a throw-in, both feet on the grass: the ball held behind his head in both hands, then thrown, arms reaching forward.
In every frame he is facing the camera (toward the bottom of the screen). It plays once.

FRAMES
1. ball behind his head, back arched
2. thrown, arms forward, back toe dragging

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 2 frames in ONE row, left to right, no gaps, each frame 256x296 px
  (the whole image 512x296), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x74 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### throw · south-east

Attach: the character reference and `throw/south-east.png`. Save as
`throw-south-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a throw-in, both feet on the grass: the ball held behind his head in both hands, then thrown, arms reaching forward.
In every frame he is facing down and to the right, three-quarter front view. It plays once.

FRAMES
1. ball behind his head, back arched
2. thrown, arms forward, back toe dragging

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 2 frames in ONE row, left to right, no gaps, each frame 256x296 px
  (the whole image 512x296), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x74 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### throw · east

Attach: the character reference and `throw/east.png`. Save as
`throw-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a throw-in, both feet on the grass: the ball held behind his head in both hands, then thrown, arms reaching forward.
In every frame he is facing right, side view. It plays once.

FRAMES
1. ball behind his head, back arched
2. thrown, arms forward, back toe dragging

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 2 frames in ONE row, left to right, no gaps, each frame 256x296 px
  (the whole image 512x296), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x74 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### throw · north-east

Attach: the character reference and `throw/north-east.png`. Save as
`throw-north-east.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a throw-in, both feet on the grass: the ball held behind his head in both hands, then thrown, arms reaching forward.
In every frame he is facing up and to the right, three-quarter back view. It plays once.

FRAMES
1. ball behind his head, back arched
2. thrown, arms forward, back toe dragging

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 2 frames in ONE row, left to right, no gaps, each frame 256x296 px
  (the whole image 512x296), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x74 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```

### throw · north

Attach: the character reference and `throw/north.png`. Save as
`throw-north.png`.

```
[Attach the character reference and the pose guide]
Make a pixel-art animation strip of this football player: a throw-in, both feet on the grass: the ball held behind his head in both hands, then thrown, arms reaching forward.
In every frame he is facing away from the camera (toward the top of the screen), back view. It plays once.

FRAMES
1. ball behind his head, back arched
2. thrown, arms forward, back toe dragging

RULES
- Follow the attached pose guide exactly: one sprite per guide frame, the same pose, the same
  body angle, the same limb in front. Red/orange limbs are his RIGHT arm and leg, blue/cyan his
  LEFT. Do not copy the guide's colours, its grey ball, its lines or its stick-figure look.
- The same boy as the character reference: same face, hair, kit, proportions and pixel style.
- 2 frames in ONE row, left to right, no gaps, each frame 256x296 px
  (the whole image 512x296), every frame the same size.
- Boot soles on the guide's feet line in every frame (a frame in the air is drawn above it).
  Nothing touches or crosses a frame's edge.
- Pixel art drawn on a 64x74 grid and enlarged exactly 4x with nearest-neighbour:
  hard square pixels, a 1-pixel dark outline, light from the top left, 3 or 4 shades per colour,
  no blur, no anti-aliasing, no gradients.
- Transparent background. No ball, no shadow, no grass, no text.
```
