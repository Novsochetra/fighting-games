# Steel & Dust: Sprite Prompts (one at a time)

Each block below is one request for your pixel-art tool. Paste them **one at a time**, save the result with the file name shown, and send the PNGs back. Frame timing, hit frames and hitboxes are handled in the game code, so you only need the images.

## How to use

1. **Attach the reference image to every request.**
   - Sable prompts: attach `sable_reference.png`, the 4×4 sheet of 16 poses you already have.
   - Enemy prompts: first make the enemy's reference sheet (R00, C00 or W00), then attach it to that enemy's other prompts.
2. **Paste one block** (everything inside the gray box).
3. **Check it** against the checklist below, then **save it with the exact file name** in the block's title.
4. **Send me the PNGs.** A few at a time is fine; start with `sable_idle` and `sable_walk`.

## Checklist for every result

- [ ] Facing **right**, side view (not facing the viewer)
- [ ] Correct number of frames, in **one row**, left to right, no gaps
- [ ] Image width = frames × frame width (example: 6 frames × 128 = 768 px wide)
- [ ] Feet in the same spot in every frame
- [ ] Nothing cut off at the frame edges
- [ ] Transparent background (no checkerboard painted in)
- [ ] Hard pixels, no blur

If the tool can only output large images, ask it to draw at the real size and then enlarge exactly 4× with nearest-neighbor. I can shrink it back cleanly.

## Sizes at a glance

| Asset | Frame size | Feet position | Character height |
| --- | --- | --- | --- |
| Sable, Raider, Cutter | 128×80 | x=64, y=76 | about 58 px (Raider and Cutter about 56) |
| Warden Ox (boss) | 192×112 | x=96, y=108 | about 84 px |
| Effects | 64×64 | centered | – |
| Crate | 48×48 | x=24, y=46 | – |
| Pickup icons | 24×24 | centered | – |

The game screen will be 480×270 to fit this character size.

---

# Part 1: Sable with the sword (do these first)

Order: S01 → S02 first, then the attacks S12–S21, then the rest (S22, the run, came last).

### S01 · `sable_idle.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: idle, 6 frames, looping.
Relaxed fighting stance, glowing sword held low in front. Slow breathing:
shoulders rise and fall 1 px. Cape and coat tails sway gently.
Frame 6 must flow smoothly back into frame 1.
```

### S02 · `sable_walk.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: walk forward, 8 frames, looping.
Walking in place (the game moves him), in his fighting stance, sword low.
Full walk cycle: contact, down, pass, up, for each leg. Body bobs 1 px.
Cape and coat tails trail behind and swing with each step.
```

### S03 · `sable_jump.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: jump, 4 frames, drawn in place (the game moves him up and down).
1-2: rising. Knees tucked, sword arm back, cape streaming down behind.
3-4: falling. Legs extending to land, cape lifting up behind.
```

### S04 · `sable_land.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: landing, 2 frames.
1: deep squash, knees bent, coat flared out.
2: rising back toward the idle stance.
```

### S05 · `sable_dash.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: dash (fast dodge forward), 4 frames.
Very low forward lean, almost horizontal, sword held back along his body,
cape and coat stretched straight out behind him. Frame 4 starts to straighten up.
```

### S06 · `sable_hurt.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: hurt (hit from the front), 3 frames.
1: head and chest snap backward, arms flung back, eyes squeezed (glow flickers).
2: staggering back on one foot.
3: recovering toward the stance.
```

### S07 · `sable_juggle.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: knocked into the air, 3 frames, looping.
Tumbling helplessly backward in the air, limbs loose, cape flailing.
Draw him in mid-air; keep his body center around y=50.
```

### S08 · `sable_down.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: lying on the ground, 2 frames.
Lying flat on his back, head toward the LEFT, feet toward the right,
body resting on the line y=76. Sword still in hand.
1: impact with the ground (slight bounce, cape spread).
2: lying still.
```

### S09 · `sable_getup.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: get up, 5 frames.
1: lying on his back (head to the left), same as the down pose.
2: pushing up on one elbow.
3: kneeling.
4: rising.
5: back in the fighting stance.
```

### S10 · `sable_ko.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: defeated, 4 frames.
1: thrown backward through the air.
2: hitting the ground.
3: small bounce.
4: lying still on his back (head to the left), eye glow faded out.
```

### S11 · `sable_win.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: victory pose, 4 frames, looping.
Standing tall, glowing sword raised straight up, cape blowing in the wind.
The sword glow pulses brighter and dimmer across the 4 frames.
```

## Sable sword attacks

Every attack follows: **wind-up → strike (with a smear) → follow-through → settle**. Draw the smear on the sword and arm only; the game adds sparks and trails.

### S12 · `sable_slash1.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: first combo slash, 5 frames.
1: wind-up, sword raised up and back over his shoulder.
2: start of the swing.
3: STRIKE: diagonal slash down and forward, sword reaching far in front,
   with a cyan smear arc along the swing path.
4: follow-through, sword low in front.
5: settling back toward the stance.
```

### S13 · `sable_slash2.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: second combo slash (return cut), 5 frames.
Starts with the sword low in front (where slash 1 ended).
1-2: sword dips low and back.
3: STRIKE: upward slash in front of him, from low to high,
   with a cyan smear arc.
4: sword high, follow-through.
5: settling toward the stance.
```

### S14 · `sable_spin_slash.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: spin slash (third combo hit), 6 frames.
1: winds up, turning his back slightly, sword behind him.
2: spinning, back to the camera for a moment, cape whipping around.
3: STRIKE: a wide horizontal slash in front at chest height,
   with a long cyan smear arc.
4-5: follow-through, cape wrapping around him.
6: settling toward the stance.
```

### S15 · `sable_thrust.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: piercing thrust (combo finisher), 6 frames.
1-2: crouches and draws the sword back at waist height, point forward, coiling.
3: STRIKE: explosive lunge, front leg far forward, back leg straight,
   arm and sword fully extended straight ahead at chest height,
   cyan streak lines behind the blade. The sword tip must stay inside the frame.
4: holding the lunge.
5-6: pulling back toward the stance.
```

### S16 · `sable_rising_dragon.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: rising dragon (launcher that knocks enemies into the air), 6 frames.
1-2: crouches very low, sword low behind him near the ground.
3: STRIKE: explodes upward, huge upward slash in front of him from ground
   to above his head, body stretched tall, up on his toes,
   with a tall cyan smear arc.
4: sword pointing straight up, coat and cape flying up.
5-6: coming back down toward the stance.
```

### S17 · `sable_cleave.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: cleave (heavy attack), 7 frames.
1-3: big slow wind-up, both hands on the sword, raised high behind his head,
     leaning back. Make this wind-up clearly readable.
4: STRIKE: huge two-handed overhead chop down in front of him,
   knees bent, with a big cyan smear arc.
5: blade near the ground in front, small impact.
6-7: lifting the sword and returning to the stance.
```

### S18 · `sable_air_slash.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: air slash (attacking while jumping), 4 frames.
He is in the air: knees bent, no ground contact. Keep his body center around y=50.
1: sword raised up and back.
2: STRIKE: diagonal slash down and forward, with a cyan smear arc.
3: follow-through, sword low in front.
4: recovering, still in the air.
```

### S19 · `sable_air_rising_cut.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: air rising cut (second air attack), 4 frames.
He is in the air: knees bent, no ground contact. Keep his body center around y=50.
1: sword low in front.
2: STRIKE: upward slash in front of him, with a cyan smear arc.
3: sword high.
4: recovering, still in the air.
```

### S20 · `sable_meteor_slash.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: meteor slash (air attack that smashes enemies down), 5 frames.
He is in the air. Keep his body center around y=50.
1-2: both hands on the sword, raised high above his head, body arched back.
3: STRIKE: massive downward slash in front of him, body folding forward,
   with a big cyan smear arc pointing down.
4: sword pointing down below him.
5: recovering, still in the air.
```

### S21 · `sable_plunge.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: plunge (diving straight down with the sword), 3 frames.
1: in the air, sword flipped to point straight down, gripped with both hands.
2: diving: body vertical, sword pointing straight down below his feet,
   cape and coat streaming upward. This frame is held while falling.
3: landing: crouched, sword stabbed into the ground in front of him.
```

### S22 · `sable_run.png`

```
[Attach the Sable reference sheet]
Make a pixel-art animation strip of SABLE. Match the attached reference exactly:
same design, colors and pixel style.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- Character about 58 px tall, same size as the reference.
- Face hidden in hood shadow with two small glowing cyan eyes, in every frame.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: run, 8 frames, looping.
Running in place (the game moves him), a fast sprint out of the dash.
Torso leaned forward, knees high, both feet off the ground between strides.
Sword held low in the front hand, angled back and down, clear of the hood.
Cape and coat tails stream out behind him. Body bobs 2 px.
Frame 8 must flow smoothly back into frame 1.
```

---

# Part 2: Other weapons (later, optional)

Only do this after Part 1 works in the game. Each weapon needs its own full set: the same S01–S11 strips with the weapon swapped, plus its attacks.

To make one, copy any Part 1 block, keep the RULES, and change:

1. **File name:** replace `sable_` with `sable_spear_`, `sable_axe_` or `sable_fists_`.
2. **Weapon line:** add this right after the RULES:
   - Spear: `He holds a long spear (about 40 px) instead of the sword: dark wooden shaft, steel head with a glowing cyan edge, small red tassel.`
   - Axe: `He holds a one-handed battle axe instead of the sword: dark wooden handle, wide steel head with a glowing cyan edge. At rest it sits on his shoulder.`
   - Fists: `He has no weapon. His fists are wrapped in brown leather gloves with cyan knuckle glow.`
3. **Attacks:** use the matching moves from this table, with the same frame count and strike frame as the sword move in the same row:

| Sword move (Part 1) | Spear | Axe | Fists |
| --- | --- | --- | --- |
| slash1 | poke (straight thrust) | chop (overhead) | jab |
| slash2 | low poke | side hack (horizontal) | cross punch |
| spin_slash | wide sweep | overhead (heavier) | hook |
| thrust | whirlwind (spear spinning around him, frames 2–5 loop) | whirling axe (frames 2–5 loop) | spin kick |
| rising_dragon | vault lift | lumberjack lift | rising knee |
| cleave | lunge (long thrust, steps far forward) | ground smash (slams the ground) | roundhouse kick |
| air_slash | air poke | air chop | air kick |
| air_rising_cut | air swing | air hack | air punch |
| meteor_slash | hammer down | skull splitter | axe kick (heel down) |
| plunge | javelin drop | meteor drop | dive kick (diagonal) |

---

# Part 3: Enemies

Make each enemy's reference sheet first (R00, C00, W00), then attach it to that enemy's strips. Attach the **Sable reference too** so the pixel style matches.

### R00 · `raider_reference.png`

```
[Attach the Sable reference sheet as a STYLE reference only]
Design a new enemy character for the same game, in exactly the same pixel-art
style, outline weight and color approach as the attached sheet.

ENEMY: RAIDER, a desert bandit foot soldier.
Khaki desert uniform with a brown belt, sand-colored turban, cloth wrapped over
the lower face (only the eyes show, small white glints), dark boots, bare fists
with taped knuckles. Scrappy, medium build, a little shorter than Sable
(about 56 px tall).

Output: a 4x4 sheet of 16 different poses (idle, walking, punching, getting hit,
falling), each in a 128x80 px frame, feet centered at x=64, y=76.
Side view facing RIGHT in every pose. Transparent background, hard pixels.
```

Then make the Raider strips with this template. Copy it once per row of the table below:

```
[Attach raider_reference.png and the Sable reference sheet]
Make a pixel-art animation strip of the RAIDER. Match raider_reference.png exactly.

RULES
- Side view, facing RIGHT in every frame.
- Frame size 128x80 px. Feet centered at x=64, boot soles on y=76, in every frame.
- About 56 px tall, same size as the reference.
- Transparent background, hard pixels, nothing touching the frame edges.
- Output one PNG: all frames in a single row, left to right, no gaps.

ANIMATION: [paste the name, frame count and description from the table]
```

| File | Frames | Description |
| --- | --- | --- |
| `raider_idle.png` | 4 | Fists up, bouncing on his feet. Loops. |
| `raider_walk.png` | 6 | Walking forward with fists up. Loops. |
| `raider_punch.png` | 5 | 1–2: big readable wind-up, arm pulled far back (hold it). 3: STRIKE, straight punch. 4–5: recover. |
| `raider_hurt.png` | 2 | Head snaps back. |
| `raider_juggle.png` | 3 | Tumbling in the air, body center around y=50. Loops. |
| `raider_down.png` | 2 | Lying on his back, head to the left, on the line y=76. |
| `raider_getup.png` | 4 | From lying down back to standing. |
| `raider_ko.png` | 4 | Thrown backward, hits the ground, bounces, lies still. |

### C00 · `cutter_reference.png`

```
[Attach the Sable reference sheet as a STYLE reference only]
Design a new enemy character for the same game, in exactly the same pixel-art
style, outline weight and color approach as the attached sheet.

ENEMY: CUTTER, a fast knife-wielding bandit.
Deep red hood and red cloth mask (only the eyes show, small white glints),
blue-gray tunic, dark pants, dark boots, a short curved knife in the front hand.
Lean and quick, about 56 px tall.

Output: a 4x4 sheet of 16 different poses (idle, walking, stabbing, lunging,
getting hit, falling), each in a 128x80 px frame, feet centered at x=64, y=76.
Side view facing RIGHT in every pose. Transparent background, hard pixels.
```

Cutter strips: use the Raider template above with `CUTTER` and `cutter_reference.png`.

| File | Frames | Description |
| --- | --- | --- |
| `cutter_idle.png` | 4 | Low crouched stance, knife forward. Loops. |
| `cutter_walk.png` | 6 | Stalking forward. Loops. |
| `cutter_stab.png` | 5 | 1–2: draws the knife back (readable). 3: STRIKE, fast stab forward. 4–5: recover. |
| `cutter_lunge.png` | 6 | 1–2: crouches low. 3–5: running lunge with the knife out (these frames loop). 6: stops. |
| `cutter_hurt.png` | 2 | Head snaps back. |
| `cutter_juggle.png` | 3 | Tumbling in the air, body center around y=50. Loops. |
| `cutter_down.png` | 2 | Lying on his back, head to the left. |
| `cutter_getup.png` | 4 | From lying down back to standing. |
| `cutter_ko.png` | 4 | Thrown backward, hits the ground, bounces, lies still. |

### W00 · `warden_ox_reference.png`

```
[Attach the Sable reference sheet as a STYLE reference only]
Design a BOSS character for the same game, in exactly the same pixel-art
style, outline weight and color approach as the attached sheet.

BOSS: WARDEN OX, a huge bull-headed brute who guards the desert fortress.
Bull head with thick curved horns, glowing yellow eyes and a gold nose ring.
Bulky dark-red armor, a pale blue chest plate, thick brown arms,
dark pants and heavy boots. Carries a massive war hammer with a steel head.
Slow, heavy and intimidating. About 84 px tall (much bigger than Sable).

Output: a 4x4 sheet of 16 different poses (idle, walking, swinging the hammer,
slamming the ground, charging, getting hit, falling), each in a 192x112 px frame,
feet centered at x=96, y=108. Side view facing RIGHT in every pose.
Transparent background, hard pixels.
```

Warden Ox strips: same template, but with `WARDEN OX`, `warden_ox_reference.png`, **frame size 192x112 px, feet at x=96, y=108, about 84 px tall**.

| File | Frames | Description |
| --- | --- | --- |
| `warden_ox_idle.png` | 4 | Heavy breathing, hammer resting on his shoulder. Loops. |
| `warden_ox_walk.png` | 6 | Slow stomping walk. Loops. |
| `warden_ox_swipe.png` | 6 | 1–2: hammer pulled back. 3: STRIKE, horizontal swing. 4–6: recover. |
| `warden_ox_slam.png` | 7 | 1–3: long wind-up, hammer raised high above his head (very readable). 4: STRIKE, slams the ground. 5–7: lifting the hammer. |
| `warden_ox_charge.png` | 6 | 1: lowers his head. 2–5: shoulder-first running charge (these frames loop). 6: stops. |
| `warden_ox_hurt.png` | 2 | Flinches. |
| `warden_ox_juggle.png` | 3 | Knocked into the air, body center around y=70. Loops. |
| `warden_ox_down.png` | 2 | Lying on his back, head to the left. |
| `warden_ox_getup.png` | 5 | From lying down back to standing. |
| `warden_ox_ko.png` | 5 | Staggers, falls backward, hits the ground, lies still. |

---

# Part 4: Effects, crate and pickups

Effects template. Copy once per row of the table below:

```
[Attach the Sable reference sheet as a STYLE reference only]
Make a pixel-art visual effect animation strip for the same game,
in the same pixel-art style and colors as the attached sheet.

RULES
- Frame size 64x64 px, effect centered in each frame.
- Transparent background, hard pixels, no blur or soft glow.
- Output one PNG: all frames in a single row, left to right, no gaps.

EFFECT: [paste the name, frame count and description from the table]
```

| File | Frames | Description |
| --- | --- | --- |
| `fx_hit_small.png` | 4 | Small impact: white core with a yellow 4-point star burst, shrinking away. |
| `fx_hit_big.png` | 5 | Big impact: larger white and yellow star burst with extra rays. |
| `fx_blade_hit.png` | 4 | Blade impact: thin cyan and white crescent slash streak, facing right. |
| `fx_dust.png` | 5 | Small sand-colored dust puff, rising and fading. |
| `fx_land_dust.png` | 4 | Low, wide sand puff spreading left and right along the bottom of the frame. |
| `fx_shockwave.png` | 6 | Jagged sand-colored rock spikes bursting out of the ground (bottom of the frame) and sinking back down. |

### P01 · `crate.png`

```
[Attach the Sable reference sheet as a STYLE reference only]
Make pixel-art props for the same game, in the same pixel-art style.
Frame size 48x48 px. Transparent background, hard pixels.
Output one PNG with 5 frames in a single row, left to right, no gaps.

1: a wooden supply crate (about 30x28 px), sitting on the bottom of the frame,
   centered, with cross planks and metal corners.
2-5: the crate breaking apart: cracking, then splintering into flying planks
   and fragments that fall and scatter.
```

### P02 · `pickups.png`

```
[Attach the Sable reference sheet as a STYLE reference only]
Make pixel-art pickup icons for the same game, in the same pixel-art style.
Each icon in its own 24x24 px frame, centered. Transparent background, hard pixels.
Output one PNG with 4 frames in a single row, left to right, no gaps.

1: Sable's sword: glowing cyan blade, dark hilt, drawn diagonally.
2: spear: dark wooden shaft, steel head with a cyan edge, diagonal.
3: battle axe: dark wooden handle, steel head with a cyan edge, diagonal.
4: ration: a small tin can with a red label (restores health).
```

---

## Progress tracker

| Done | File | | Done | File |
| --- | --- | --- | --- | --- |
| ☐ | sable_idle | | ☐ | raider_reference |
| ☐ | sable_walk | | ☐ | raider_idle … raider_ko (8) |
| ☐ | sable_jump | | ☐ | cutter_reference |
| ☐ | sable_land | | ☐ | cutter_idle … cutter_ko (9) |
| ☐ | sable_dash | | ☐ | warden_ox_reference |
| ☐ | sable_hurt | | ☐ | warden_ox_idle … warden_ox_ko (10) |
| ☐ | sable_juggle | | ☐ | fx (6 strips) |
| ☐ | sable_down | | ☐ | crate |
| ☐ | sable_getup | | ☐ | pickups |
| ☐ | sable_ko | | | |
| ☐ | sable_win | | | |
| ☐ | sable_run | | | |
| ☐ | sable_slash1 … sable_plunge (10 attacks) | | | |
