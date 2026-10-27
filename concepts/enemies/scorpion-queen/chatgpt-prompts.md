# Scorpion Queen: ChatGPT prompts for a redraw

Prompts for ChatGPT image generation that redraw the Scorpion Queen, the boss of mission 5 (Ember
Woods, "Hive Heart"), who comes back in mission 10's Inner Keep. Her sheet is
`apps/web/games/steel-and-dust/assets/sprites/enemies/queen.png`. Run them in **one chat**, in
order: prompt 1 settles her design, and every later prompt attaches the picture you keep from it.

## Why the prompts ask for what they ask

What is wrong with the current sheet, and what the prompts ask for instead:

- **She vanishes into her own stage.** Black and gold chitin with orange glow, on Ember Woods'
  orange, gold and maroon sunset. The prompts ask for cool blue-black chitin, gold only as trim,
  royal violet, and a venom-green sting and eyes: the game's own poison color (`venom` in
  `src/art/fx-colors.js`), so she stands out on every warm stage and her sting reads as poison.
- **The queen is a speck.** Her human half is about 20 of the sprite's 88 px, riding on the
  scorpion's back, so her face is a smudge in play. Her torso now grows out of the front of the
  scorpion like a centaur's, close to half the sprite's height, with a big crown and hair.
- **Noise.** A gold stripe on every segment of every leg and of the tail. The prompts ask for big
  flat chitin plates, three tones a material, and gold only on the crown, collar, pincer rims and
  the base of the sting.
- **She changes size and shape between moves.** Her attack frames are 75 to 101 px wide, and her
  swarm frames stand taller than her idle. Every prompt attaches her design and asks for the same
  size and ground line, and every move starts and ends in her idle stance.
- **Smears.** A loose pale pincer arc floats ahead of her in the attack's strike frame. The prompts
  forbid smears and arcs; only the dirt and glow a prompt names are drawn.
- **ChatGPT's pixel art** has an uneven grid, two to three times too coarse (see
  `concepts/stages/angkor-wat/chatgpt-prompts.md`). The prompts ask for clean, flat cel-shaded art,
  which is then shrunk to her stance, folded into one palette and outlined, as every boss sheet is
  (`assets/sprites/enemies/README.md`).
- **The background is cyan**, not magenta: magenta would key out her violet hair, and she has no
  cyan.

The game measures her hitboxes on the art (`queen` in `src/data/enemies/boss-bodies.js`), so her
layout stays: her human body stands over her feet at the front, the scorpion's body runs back from
them, the tail arcs up over her, and the pincers strike low, ahead of her.

## Her palette

| Material                              | Shadow to light                    |
| ------------------------------------- | ---------------------------------- |
| Chitin (obsidian with a cool sheen)   | #0f0d18, #24203a, #3e3a62, #7d82c0 |
| Gold trim                             | #7a4a12, #d99a2b, #fbe08a          |
| Royal violet (hair, sash, crown gems) | #3a0d3a, #8a1f7a, #d64fb8, #ff9fe6 |
| Skin                                  | #7a4630, #c27f58, #f0b98c          |
| Venom (sting, eyes, drips)            | #3f7a1a, #8fe03a, #e6ffb0          |
| Dirt (Ember Woods' road)              | #1e0b08, #411b0e, #6d371d, #98572c |

## How to use

1. Paste prompt 1. Regenerate until it passes the checklist, then save it as `queen_ref.png`.
2. For every other prompt, **attach `queen_ref.png`**, paste the block and save the result with the
   file name in its title, in `chatgpt/` beside this file.
3. Order: idle, attack, walk first (they show whether the design holds), then the rest.

Checklist for every result:

- [ ] Facing **right**, exact side view
- [ ] Same design, colors and size as `queen_ref.png` in every pose
- [ ] The right number of poses, in reading order, none touching another
- [ ] Every pose on the same ground line, except poses the prompt puts in the air or underground
- [ ] Flat cyan background: no floor shadow, text, numbers or grid lines
- [ ] Nothing cut off at the edges

## The strips

Pose numbers start at 1. The strike pose is the one the game holds while the hit is out, so it
must be the pose that shows the hit.

| File                   | Strip       | Poses | Strike | Grid     |
| ---------------------- | ----------- | ----- | ------ | -------- |
| `queen_idle.png`       | `idle`      | 4     |        | 2x2, 3:2 |
| `queen_walk.png`       | `walk`      | 8     |        | 4x2, 3:2 |
| `queen_attack.png`     | `attack`    | 9     | 4      | 3x3, 1:1 |
| `queen_hurt.png`       | `hurt`      | 4     |        | 2x2, 3:2 |
| `queen_ko.png`         | `ko`        | 9     |        | 3x3, 1:1 |
| `queen_slam.png`       | `slam`      | 9     | 5      | 3x3, 1:1 |
| `queen_charge.png`     | `charge`    | 8     |        | 4x2, 3:2 |
| `queen_burrow.png`     | `burrow`    | 12    |        | 4x3, 3:2 |
| `queen_emerge.png`     | `emerge`    | 8     | 5      | 4x2, 3:2 |
| `queen_tail_sting.png` | `tailSting` | 9     | 5      | 3x3, 1:1 |
| `queen_hive_swarm.png` | `hiveSwarm` | 12    | 9      | 4x3, 3:2 |
| `wasp.png`             | swarm wasp  | 4     |        | 2x2, 3:2 |

## Prompt 1: her design (`queen_ref.png`)

```
Design a boss for a side-scrolling 2D pixel-art beat 'em up: the SCORPION QUEEN, ruler of a hive in a burning autumn forest. One character, full body. Landscape 3:2.

STYLE
Clean 2D game sprite art: crisp hard edges, flat cel shading with 3 tones per material, a strong readable silhouette, a thin dark outline. Do NOT pixelate it. No painterly texture, no soft gradients, no blur, no glow haze. It will be shrunk to about 90 pixels tall, so keep big shapes and few small details.

VIEW
Exact side view, facing RIGHT, standing still in her idle stance. No perspective, no 3/4 view.

DESIGN
- A centaur-like fusion: a woman's upper body rising from the FRONT of a giant scorpion, where the scorpion's head would be. Her waist joins the scorpion's front plate; the scorpion's long segmented body runs back behind her, to the left.
- Her human half is big: from her waist to the top of her crown is almost half the creature's total height. Upright and proud, chin up. One clawed hand on her hip, the other raised a little forward, commanding.
- Head: a tall spiked gold crown shaped like a scorpion's crest, with one violet gem; long violet-magenta hair swept back; a sharp face; two eyes glowing venom green. It must read at a small size.
- Torso: an obsidian chitin breastplate with a gold collar; bare arms ending in black chitin gauntlets with claw tips.
- Scorpion body: glossy blue-black obsidian chitin in a few BIG smooth plates, with a cool blue-violet sheen on the top edges. Eight legs: the four on the near side clearly drawn, the four on the far side darker and partly hidden. Two big pincers at the front, low, either side of her waist, resting on the ground ahead of her.
- Tail: thick and segmented, rising from the rear in one big arc over her head, ending in a bulb stinger above and a little ahead of her crown. The stinger glows venom green and hangs one green drop.
- A violet sash hangs from her waist over the scorpion's back.
- Gold ONLY on the crown, the collar, a thin rim on the pincers and the base of the stinger. No gold stripes on the legs or the tail.
- Proportions: without the tail she is a little longer than she is tall; with the tail, about as tall as she is long.

PALETTE (only these colors)
Chitin: #0f0d18 shadow, #24203a base, #3e3a62 light, #7d82c0 sheen.
Gold trim: #7a4a12, #d99a2b, #fbe08a.
Royal violet (hair, sash, crown gem): #3a0d3a, #8a1f7a, #d64fb8, #ff9fe6.
Skin: #7a4630, #c27f58, #f0b98c.
Venom (stinger, eyes, drop): #3f7a1a, #8fe03a, #e6ffb0.
No orange, no fire, no red: she must stand out against an orange sunset forest.

BACKGROUND
One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no gradient, no texture. Her legs and pincer tips rest on one invisible level line about 85% of the way down, and the whole creature fits with wide margins.

DO NOT include: text, labels, a name, color swatches, a frame or border, other characters, or effects other than the one venom drop.
```

## Prompts 2 to 12: her strips

Every block starts with the same rules; only the ANIMATION part changes.

### `queen_idle.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: idle, 4 poses, a 2x2 grid, landscape 3:2. A slow breathing loop.
1. The attached stance.
2. Her torso rises a little, the tail sways back a little, the pincers open a crack.
3. The highest point of the breath; the stinger glows a little brighter.
4. Settling back, the pincers closing; flows straight back into pose 1.
The legs never move.
```

### `queen_walk.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: walk, 8 poses, a 4x2 grid, landscape 3:2. A scuttling loop, drawn in place (the game moves her).
The legs step in a ripple from back to front, alternating sides: in every pose some legs are lifted and some planted. Her human half stays upright and level, bobbing very slightly, hair and sash swaying. The tail stays raised in its arc and sways a little with the steps. The pincers are held low and ahead, rocking with the steps. Pose 8 flows straight back into pose 1.
```

### `queen_attack.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: pincer swipe, 9 poses, a 3x3 grid, square 1:1.
1. The attached stance.
2-3. She twists her torso back; the near pincer draws back beside her, wide open.
4. STRIKE: the near pincer snaps forward, low and far, reaching about half her body length ahead of her front legs, at her waist height or lower, claws snapped shut. She leans into it.
5-6. The pincer held out, then pulling back.
7-9. Back to the stance; pose 9 is the same as pose 1.
```

### `queen_hurt.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: hurt, 4 poses, a 2x2 grid, landscape 3:2.
1. Hit from the front: she recoils backward, head thrown back, eyes squeezed shut, the tail jerking back.
2. The deepest recoil: her body pushed back and low, pincers flung open.
3. Recovering, half way back up.
4. Back in the stance, the same as the attached image.
```

### `queen_ko.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: knocked out, 9 poses, a 3x3 grid, square 1:1. She still faces right throughout.
1. The stance.
2-5. Thrown backward (to the left) through the air, above the ground line: 2 lifting off, legs flailing; 3 the highest, tilting back; 4 falling, tipping onto her side; 5 crashing onto the ground line.
6-9. Lying on her side on the ground line, her legs curling in, the tail dropping limp along the ground, her human half slumped forward, eyes closed, the stinger's glow out. Poses 8 and 9 are the same, lying still.
```

### `queen_slam.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: ground slam, 9 poses, a 3x3 grid, square 1:1.
1. The stance.
2-4. She rears up on her back legs, front legs off the ground, both pincers raised high and open, her arms raised with them.
5. STRIKE: both pincers smash down into the ground just ahead of her front legs, all legs planted again. A small burst of dark-brown dirt clods (#1e0b08, #411b0e, #6d371d, #98572c) kicks up where they hit.
6-7. The pincers stay down as the dirt falls.
8-9. Rising back to the stance; pose 9 is the same as pose 1.
```

### `queen_charge.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: running charge, 8 poses, a 4x2 grid, landscape 3:2. A fast loop, drawn in place.
Her body crouched low and lunging forward, both pincers thrust out ahead and open, her torso leaning forward with her arms back, hair and sash streaming behind her. The tail flattens back and lower behind her, stinger pointing forward. The legs scuttle fast in a ripple, wider strides than the walk. Pose 8 flows straight back into pose 1.
```

### `queen_burrow.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: burrow, 12 poses, a 4x3 grid, landscape 3:2. She digs into the ground, then tunnels under it. The ground line is the soil's surface: everything below it is hidden, so she is cut off flat by a mound of loose dirt (#1e0b08, #411b0e, #6d371d, #98572c) sitting on the line.
1. The stance.
2-4. Her pincers and front legs dig, clods of dirt flying back behind her, her body sinking into a growing mound.
5. Only her head, crown and tail show above the mound.
6-8. Sinking further, until only the glowing stinger tip pokes out of a low mound.
9-12. A loop: a low mound of loose dirt moving forward, the stinger tip poking out of it, clods tumbling off its front. Pose 12 flows straight back into pose 9.
```

### `queen_emerge.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: burst out of the ground, 8 poses, a 4x2 grid, landscape 3:2. The ground line is the soil's surface; dirt is loose clods in #1e0b08, #411b0e, #6d371d, #98572c.
1. A low mound of dirt on the ground line with only the glowing stinger tip poking out.
2-3. The mound bulges and cracks, clods jumping off it.
4. The stinger stabs up through the dirt, her crown just showing.
5. STRIKE: she bursts fully out, her tail stabbing straight UP high above her, the stinger at the very top; dirt sprays out on both sides at her feet. The tallest pose of the strip.
6. Landing on all legs, dirt falling around her.
7-8. Back to the stance; pose 8 is the same as the attached image.
```

### `queen_tail_sting.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: tail sting, 9 poses, a 3x3 grid, square 1:1. A poisoned sting over her own head.
1. The stance.
2-4. She leans back; the tail coils back and up, cocked like a spring, the stinger glowing brighter green.
5. STRIKE: the tail whips forward over her head and stabs down ahead of her: the stinger at about her chest height, about half her body length ahead of her front, dripping venom-green drops.
6-7. The stinger held out, then pulling back up.
8-9. Back to the stance; pose 9 is the same as pose 1.
```

### `queen_hive_swarm.png`

```
[Attach queen_ref.png]
Draw an animation of the SCORPION QUEEN in the attached image, as a grid of separate poses. Match the attached image exactly: the same design, colors, proportions, size and style in every pose.

RULES
- Exact side view, facing RIGHT in every pose.
- Clean 2D game sprite art: flat cel shading, 3 tones per material, thin dark outline. Not pixelated, no blur, no soft glow.
- Every pose is the same size as the attached image: never smaller, never bigger, never cropped.
- Every pose stands on a level ground line at the same height in its cell, the near legs planted in the same place, unless the pose says she is in the air or underground.
- Poses in reading order: left to right, then top to bottom. Wide cyan gaps between poses; nothing touches another pose or the edge.
- One flat, solid, pure cyan (#00FFFF) background. No ground, no floor shadow, no text, no numbers, no grid lines or cell borders.
- No motion smears, speed lines or impact flashes; only the effects named below.

ANIMATION: Hive Swarm, her ultimate, 12 poses, a 4x3 grid, landscape 3:2. She calls her wasps.
1. The stance.
2-4. She rears up on her back legs, her arms and both pincers spread wide.
5. Head thrown back, mouth open in a shriek.
6-8. A loop while the swarm flies: still rearing, arms raised, her eyes and stinger blazing venom green with a few small green sparks round the stinger. Pose 8 flows straight back into pose 6.
9. STRIKE: she slams both pincers down into the ground ahead of her, all legs planted, a small burst of dirt clods (#1e0b08, #411b0e, #6d371d, #98572c).
10-12. Rising back to the stance; pose 12 is the same as pose 1.
```

## Prompt 13: her wasp (`wasp.png`)

Her swarm's wasps are orange on her orange stage today. This gives them her colors, so they read
as hers and stand out against the sunset.

```
[Attach queen_ref.png]
Using the same style and palette as the attached Scorpion Queen, draw one of her hive wasps flying, as 4 separate poses in a 2x2 grid, landscape 3:2, on one flat, solid, pure cyan (#00FFFF) background.

- Exact side view, flying RIGHT, body level, legs tucked, a long stinger at the back.
- Body in her obsidian chitin (#0f0d18, #24203a, #3e3a62, #7d82c0) with venom-green bands (#3f7a1a, #8fe03a), a gold rim on the head (#d99a2b), and a stinger glowing venom green (#e6ffb0 tip).
- Wings pale lilac (#ff9fe6 and a lighter tint of it), painted opaque with a darker vein, so they read against an orange sky.
- A wing-beat loop: 1 wings up, 2 wings level, 3 wings down, 4 wings level. The body stays in exactly the same place in all four.
- Clean flat cel shading, thin dark outline, not pixelated, no blur. Each wasp fills most of its cell, the same size in all four, none touching.
- No text, no numbers, no grid lines, no sparks or trails.
```

## Fixing a result in the same chat

- Poses shrink or change shape: "Redraw it with every pose exactly the size and design of the
  attached image, standing on the same ground line."
- Wrong number of poses, or poses merged: "Draw only poses 1 to 6 now, as a 3x2 grid." Then "Now
  poses 7 to 12, the same size and style."
- Turned toward the viewer: "Exact side view, facing right, like the attached image."
- Gold creeping back onto the legs: "Gold only on the crown, collar, pincer rims and stinger base."
- Orange or fire in her: "Remove all orange; use only the listed palette."
- A floor shadow or a ground strip: "No ground and no shadow, only flat cyan behind her."
- Text or numbers under the poses: "Remove all text and numbers."

## The design

The design prompt 1 gave is `chatgpt/queen_ref.webp` beside this file: attach it to every strip
prompt. Shrunk to her 88 px stance it stands 102 px long, the size of her old idle frame, and
stands out on Ember Woods where the old sheet blended in. ChatGPT drew it as rough pixel art
despite the prompt, and her chitin came out indigo rather than near-black; both are fine, since
the shrink redraws every pixel and indigo stays clear of the dark trunks and road.

## The strips

The strips the prompts gave are in `chatgpt/` beside this file, named as in the table above (as
`.webp`). Every one kept the design, the pose count and the strike pose; what ChatGPT got wrong is
put right in the bake:

- It drew her strikes close to her body: her claw swipe and tail sting reached about 60 px ahead of
  her feet, where her blows reach 100 and 90. The claw and the tail are drawn out on the frames the
  blow is out, with a small lunge (`REACH` in `tools/queen_sheet/lay_out.py`), so her hurt box and
  reaches in `src/data/enemies/boss-bodies.js` and her moves' hitboxes stay as they were.
- It redrew her whole body in every pose, so a loop shimmered. Her idle, walk and charge keep
  their first pose's body over each pose's own legs, joined along the path through her waist where
  the two drawings agree, so no line shows there (`tools/queen_sheet/loops.py`).
- It placed each pose a little differently in its cell. Each is lined up by her planted rear legs.

## Baking them into the game

    python3 tools/queen_sheet/bake.py
    python3 tools/pack_enemy_sheets.py

The first writes `queen.png` and `fx/wasp.png` in the game's sprites, the second repacks the sheet
the game loads. Each pose is cut off the cyan, shrunk so its strip's stance stands as tall as her
idle (88 px with the outline), stood on the feet line of her 256x160 frames (x = 128, y = 156),
folded into one 84-color palette with a 1 px dark outline (her venom glows to its edge), and laid
into `queen.png` in the strip order of `src/data/enemies/enemy-sprites.js`; the wasp gets its own
16 colors. To redo a strip, make it again from its prompt, save it over its `.webp` and bake again.
