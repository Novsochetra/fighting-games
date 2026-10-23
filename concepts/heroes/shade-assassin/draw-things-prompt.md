# Shade Assassin: Draw Things prompt

Prompts for Draw Things that draw the new Shade's base pose: standing, facing right, sword held
low, at the same size as the other five Shades. The game's animation strips are made from this one
frame afterwards, the way the Ember Shade's were made from its concept sprite.

## Size

| Where               | Canvas     | Feet centre | Feet line (soles) | Top of hood | Height    |
| ------------------- | ---------- | ----------- | ----------------- | ----------- | --------- |
| In the game         | 128 × 80   | x = 64      | row 76            | row 16      | about 60  |
| In Draw Things (8×) | 1024 × 640 | x = 512     | y = 616           | y = 128     | about 490 |

The existing Shades measure 57 to 62 px tall and 34 to 56 px wide in their idle frames, so the new
one should be 455 to 495 px tall and about 270 to 450 px wide (sword included) on the 8× canvas.
Shrinking the 1024 × 640 picture 8× lands it exactly on the game's 128 × 80 frame.

- `size-guide.png`: the canvas with the feet line, the top of the hood, the feet centre and the
  Moss Shade's idle pose as a ghost. Look at it; do not feed it to Draw Things (the lines would be
  drawn in).
- `init-silhouette.png`: the same canvas with only the Moss Shade's silhouette on flat green. Load
  it as the starting image, so the assassin comes out in the right place at the right size.
- `shade-reference.png`: the Blue Shade's idle frame at 8× on flat green, for a model that takes
  reference images (FLUX.2 in the Moodboard): it copies the size, place and pixel style from it.

## FLUX.2 [klein] in Draw Things

FLUX.2 redraws a reference image well, so give it a Shade at the right size and ask for a new one.

1. **Model:** FLUX.2 [klein] 4B, then **Try recommended settings** under it.
2. **LoRA:** Disabled.
3. **Image Size:** 1024 × 640. If that exact size is not offered, the nearest landscape size will do:
   the cut scales by body height.
4. **Strength:** Text to Image, 100 %.
5. **Moodboard:** add `shade-reference.png`.
6. **Negative prompt:** leave it empty; the distilled FLUX models do not use it.
7. Paste the prompt below, set the count on the generate button to 4 and generate.

```
Redraw the character in the reference image as a new hero, the Shade Assassin. Keep exactly the same canvas, the same pixel-art style and pixel size, the same side view facing right, the same pose, the same position and the same height: the top of the hood and the soles of the feet stay exactly where they are, and the flat green background stays exactly the same.

Turn the character into a slim, agile shadow assassin: a deep hood over a pitch-black faceless face with two small glowing violet eyes, a dark cloth mask over the lower face, tight wrapped charcoal leather armor with thin glowing violet trim, bandage-wrapped forearms and shins, soft dark boots. Replace the long cape with a short tattered black cloak and two long scarf tails trailing behind. Replace the sword with one short straight sword held low in the same hand, pointing forward and down, its edge glowing violet with a pale lilac core.

Use only these colors on the character: near-black #0e0b12, deep plum #231a2e, dusk purple #3b2a4d, muted mauve #5c4470, dull grey-violet #6e6478 for the bandages, violet glow #9b5cff and pale lilac #e2ccff. No green and no blue on the character. Hard square pixels, a dark outline, flat shading, no blur, no anti-aliasing, no ground, no shadow, no text.
```

If it copies the Blue Shade or ignores the reference, empty the Moodboard, drag
`init-silhouette.png` onto the canvas, switch Strength to **Image to Image at 75 %** and use the
full-sentence prompt below instead.

## Draw Things settings for SDXL or FLUX.1

- **Image size:** 1024 × 640.
- **Model:** an SDXL model with a pixel-art LoRA (for example Pixel Art XL, at 0.8 to 1.0), or
  FLUX.1 [dev]. Use the matching prompt below.
- **Starting image:** put `init-silhouette.png` on the canvas, **Strength 70 to 80 %**. Lower keeps
  the size and pose closer to the silhouette; higher gives the model more freedom and can drift.
- **SDXL:** about 30 steps, text guidance about 7. **FLUX.1 [dev]:** about 20 to 28 steps, guidance
  about 3.5 (it ignores the negative prompt).
- Make 4 to 8 seeds, zoom out until the figure is thumb-sized and keep the one that still reads.
  Lock that seed if you want to try small changes to the prompt.

## Prompt (SDXL)

```
pixel art sprite of a hooded shadow assassin for a 16-bit side-scrolling beat 'em up, full body, strict side view facing right, slim agile build, low ready stance with knees bent and both feet flat on the ground, deep hood over a pitch-black faceless face with two small glowing violet eyes, dark cloth mask over the lower face, tight wrapped charcoal leather armor with thin glowing violet trim, bandage-wrapped forearms and shins, soft dark boots, short tattered black cloak and two long scarf tails trailing behind, one short straight sword with a glowing violet edge held low in the front hand pointing forward and down, near-black and deep plum colors with violet glow accents, crisp dark outline, flat cel shading, limited palette, hard pixel edges, single character centered, whole body in frame with empty space above the hood, plain solid flat chroma key green background
```

## Negative prompt (SDXL)

```
front view, three-quarter view, facing left, facing the viewer, back view, turnaround, sprite sheet, multiple characters, two swords, dagger in each hand, reverse grip, bow, gun, cropped, cut off feet, cut off head, close-up, portrait, ground, floor, cast shadow, scenery, gradient background, green clothing, green glow, blurry, soft focus, anti-aliasing, smooth shading, 3d render, realistic, photo, text, watermark, signature, border, frame, extra limbs, extra fingers
```

## Prompt (FLUX or another model that reads full sentences)

```
A pixel art game sprite of a hooded shadow assassin for a 16-bit side-scrolling beat 'em up. One character only, in a strict side view, facing right, full body, standing in a low ready stance with knees bent and both feet flat on the ground.

Look: slim and agile. A deep hood hides a pitch-black, faceless face with two small glowing violet eyes; a dark cloth mask covers the lower face. Tight wrapped charcoal leather armor with thin glowing violet trim, bandage-wrapped forearms and shins, soft dark boots. A short tattered black cloak and two long scarf tails trail behind. One short straight sword is held low in the front hand, pointing forward and down, its edge glowing violet with a pale lilac core. Colors: near-black #0e0b12, deep plum #231a2e, dusk purple #3b2a4d, muted mauve #5c4470, dull grey-violet #6e6478 bandages, violet glow #9b5cff and pale lilac #e2ccff.

Style: crisp 1-pixel dark outline, flat cel shading, a small limited palette, hard pixel edges, no blur, no anti-aliasing.

Framing: the image is 1024 x 640. The assassin stands in the middle, the centre of the feet on the vertical middle line of the image. The top of the hood is one fifth of the way down from the top edge; the soles of the feet are just above the bottom edge, with a thin strip of background under them. Nothing touches any edge.

Background: one flat, solid chroma-key green (#00FF00), with no ground, no shadow, no gradient and no texture. No green anywhere on the character. No text, watermark or border.
```

## Check the result

- [ ] Strict side view, facing **right**.
- [ ] Soles on the feet line (y = 616), top of the hood near y = 128, feet centred on x = 512.
- [ ] The whole figure, sword and cloak tips included, inside the canvas with a little green round it.
- [ ] One sword, in the front hand, held low.
- [ ] Flat green background with no ground or shadow, and no green on the assassin.

Send the full 1024 × 640 PNG as it comes out; do not shrink it yourself.

## Why the prompt asks for what it asks

- **Green, not magenta:** the Khmer fighters' sheets were drawn on magenta, but a bright violet glow
  is close enough to magenta to be keyed out with it.
- **One sword, held low in the front hand:** every Shade stands like this, and
  `tools/bake_hero_weapons.py` finds that blade to build the fists, spear and axe rows. Two blades
  or a reverse-grip dagger would break the bake.
- **Hood, black face, glowing eyes, trailing cloth:** the look all Shades share; violet is the one
  glow the roster does not have yet (green Moss, lime Firefly, teal Antler Spirit, blue, Ember orange).
- **8×:** pixel-art LoRAs such as Pixel Art XL are made to be shrunk 8× with nearest neighbour, and
  1024 × 640 is the 128 × 80 frame at exactly 8×. The shrink, one palette and the 1-px outline are
  done afterwards, as for the Bokator fighter, so Draw Things' pixels need not sit on a perfect grid.
