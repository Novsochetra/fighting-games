# Naga Eleven: the pitch player's pose guides

A skeleton sized to the game's footballer (58 px tall in a 64 × 62 frame, soles on row 60, feet
centred on x 32), posed by joint angles in 3D and seen through the game's camera, so one pose
agrees with itself in every direction. The poses are our own: the old sheets' are not traced, as
several were drawn wrong. ChatGPT draws the boy over them (`../pitch-trial/chatgpt/`).

```bash
python3 tools/pose_guides/make.py
python3 tools/pose_guides/check.py
python3 tools/pitch_trial/pose_sheets.py
```

`make.py` draws these folders, `check.py` fails if any frame leaves the game's frame or lifts off
the feet line, and `pose_sheets.py` lays the same poses into the magenta cells ChatGPT fills. To
change a pose, edit `tools/pose_guides/animations/<animation>.py` and run all three.

Each animation folder holds:

- `sheet.png`: every direction, labelled, to check the animation at a glance,
- `<direction>.png`: one direction's frames, left to right, 4 times the game's size,
- `<direction>.gif`: those frames played at the game's speed, to check the motion reads.

## Reading a pose

- Red and orange are his right leg and arm; blue and cyan his left.
- A limb drawn over another is nearer the camera.
- The dots on the head are his eyes, where he looks; no dots, we see the back of his head.
- The green line is the feet line: his lowest point is on it unless he is in the air.
- The pale ball only shows what he kicks: the game draws the ball, so a sprite never does.

## The animations

- **idle**, 4 frames at 6 fps, five directions: a ready stance, breathing; the game draws frame 1.
- **run**, 6 frames at 12 fps, five directions: contact, take the weight, push off, for each foot.
- **kick**, 3 frames at 12 fps, five directions: plant and cock, strike, follow-through.
- **slide**, 3 frames at 12 fps, five directions: drop, slide on the left hip, hook the ball.
- **fall**, 4 frames at 7 fps, five directions: trip, fall, down on his front, up on one knee; the
  game draws only frame 4, its first three being the slide's.
- **dive**, 8 frames at 14 fps, east: the keeper sets, loads, springs, flies flat and lands.
- **celebrate**, 8 frames at 10 fps, south: crouch, jump with arms up, land and pump both fists.
- **throw**, 2 frames, five directions: the throw-in, ball behind the head, then thrown.

West, south-west and north-west are the east-side rows mirrored by the game, so they are never
drawn.
