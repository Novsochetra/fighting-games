# Angkor Wat: ChatGPT prompts for the new road

Three prompts for ChatGPT image generation that repaint mission 11's road
(`apps/web/games/steel-and-dust/assets/backdrops/angkor-wat/`). Run them in **one chat**, in order,
so the style and palette carry over. Prompt 3 is optional.

## Why the prompts ask for what they ask

- The view is 384x216. The far plate drifts only about 230 px over the whole 4956 px road
  (parallax 0.05), so it reads as one panorama about 610x216, roughly 3:1. ChatGPT paints 3:2, so
  the prompt keeps everything inside the middle half of the height and the top and bottom quarters
  are cropped away.
- Fighters are about 36 px tall and stand on row 184, in front of the moat. The bank and water
  behind them must stay calm and mid-value, or they disappear.
- ChatGPT's "pixel art" has an uneven pixel grid that is two to three times too coarse for the
  plate. The prompts ask for clean, flat-shaded art instead; the bake turns it into true 1 px pixel
  art in the road's own dawn palette.
- Fixes for the old plate: one sun without bullseye rings and no second moon, palms in uneven
  clusters instead of an even row, a softened reflection instead of a squashed mirror, and a near
  strip with a few tall accents and low balustrade runs between them.

## Prompt 1: far plate (`back.png`)

```
Create a wide background for a side-scrolling fighting game: Angkor Wat at sunrise, seen from far across its moat. Landscape 3:2.

STYLE
Clean 2D game background art: crisp hard-edged shapes, flat cel shading with 3 to 4 flat tones per material, strong silhouettes and clear depth layers. No soft airbrush gradients, no photo texture, no film grain, no blur, no depth of field, no lens flare. Do NOT pixelate it; keep the shapes large and clean.

PALETTE (dawn)
Sky from deep indigo and plum at the top, through dusty rose and coral, to warm gold and pale cream at the horizon. The temple and trees in cool purples and muted olive greens, never pure black. Warm gold rim light only on edges that face the sun.

COMPOSITION (the image will be cropped to a 3:1 strip, so keep to these heights)
- Top quarter: open sky only, a soft gradient with a few thin cloud streaks. Nothing important here.
- Middle half: the whole scene. The tip of the central tower sits about one third of the way down. The far stone bank of the moat is one straight, level line a little below the middle, about 58% of the way down.
- Bottom quarter: calm moat water only.
- The temple is centered and spans about half the image width: the classic five lotus-bud towers, the central one clearly the tallest, the corner towers lower and partly overlapping, and the long, low colonnaded outer gallery with its entrance gate in the middle.
- The sun is just rising behind the central tower, slightly to its right and partly hidden by it, with soft golden rays fanning up behind the towers. One sun only: no moon, no second light, no concentric halo rings.
- Sugar palms (tall thin trunks, round fan crowns) in uneven clusters of two or three at different heights, more on the left than on the right. A dense jungle treeline behind and between them, low near the temple and rising toward both edges. Nothing cut in half by the left or right edge.
- Below the bank, the moat reflects the temple and sky: a softened, rippled, slightly darker reflection, not a perfect mirror, with a thin band of pale pink morning mist lying on the water and a few patches of lily pads near the bank.
- Atmospheric depth: the farthest shapes are the palest and least saturated; the temple is a mid-value purple silhouette with warm rim light; the palms and treeline are the darkest values, but still clearly lighter than black.
- The bank and the water must stay calm, mid-value and low in detail: small characters fight in front of them and must stay readable.
- Not mirror-symmetric: vary the clouds, the palm clusters and the treeline height from left to right.

DO NOT include: people, animals, boats, text, logos, a signature, a frame or border, UI, or anything in the foreground (no road, ground, railings, rocks or plants). This is only the far background layer.
```

## Prompt 2: near props (`near.png`)

```
Using the same style, palette and dawn light as the previous image, make a sheet of separate props for the same game level: the ruined stone causeway in front of Angkor Wat. Landscape 3:2.

BACKGROUND
One flat, solid pure magenta (#FF00FF) behind everything. No shadows, gradients, ground or texture on it, and no magenta or pink anywhere on the props.

LAYOUT
Two rows. Flat side view with no perspective. In each row every prop stands on the same invisible level baseline, with at most a few blades of grass at its foot. Leave wide magenta gaps: no prop overlaps or touches another prop or the edge of the image.

LIGHT AND MATERIAL
The low sun is behind the props and to the right: warm gold rim light on their top and right edges, cool violet-grey shadow on the faces toward the viewer. Weathered grey-tan sandstone with patches of moss and lichen.

PROPS (heights relative to the lion statue = 1)
Row 1:
1. The end of a naga balustrade: a seven-headed naga cobra hood rearing up from a low stone rail, facing left. Height 1.2.
2. A straight run of the naga balustrade: the naga's scaled body as a long horizontal rail on short carved posts, both ends alike so it can repeat. Height 0.4, width 3.
3. A sitting singha guardian lion on a small plinth, facing left. Height 1.
4. A Cambodian spirit house on a short post, with three burning incense sticks and a flower offering in front of it. Height 1.
Row 2:
5. A ruined sandstone gateway: two square pillars and a carved lintel with an apsara frieze, fallen blocks on top, a strangler fig root creeping down one pillar. Height 2.5.
6. A small frangipani tree with cream-yellow blossoms beside a banana plant with broad, torn leaves. Height 2.
7. A broken pillar stump and two fallen carved blocks with a worn apsara relief. Height 0.6.
8. A low clump of ferns and jungle undergrowth. Height 0.5.

DO NOT include: people, text, a frame, sky, the temple, or a road or ground strip.
```

## Prompt 3 (optional): the road's cross-section (`ground.png`)

```
Same style, palette and light. A side-view cross-section of the road the fighters walk on, as one horizontal strip on a flat, solid pure magenta (#FF00FF) background. Landscape 3:2. The strip runs the full width and is about one third of the image tall, centered.

From top to bottom: a thin fringe of short grass and tiny ferns poking above the surface; the walking surface, worn flat sandstone paving slabs seen edge-on with a level top line; one course of rough reddish laterite blocks; then dark reddish earth with a few roots and buried stones, darker toward the bottom. The left and right ends must match so the strip can repeat. Flat side view, no perspective, no top-down view.
```

## The strangler fig (a perch for raiders)

Asked for later, in a new chat, with four pictures attached: the road as it is, its ruins and
plants with roots from another road, a dense crown from another road, and a layout guide (160x188,
the crown solid where a raider hides, the trunk and stones in the middle 48 px).

```
Pixel art game asset for a 2D side-scrolling beat 'em up. Draw a huge strangler fig tree growing out
of fallen sandstone temple blocks, its pale roots gripping and splitting the stones, like Ta Prohm at
Angkor. A broad, rounded, dense crown of small leaves; inside it, a block 44 px wide and 52 px tall
must be solid leaves. A few thin aerial roots hang from the crown's underside. Seen straight from the
side. Hard pixels only. The sun rises behind and to the left: warm golden rims on the upper-left
edges, the rest muted and hazy. Leaves #3c2a33 #463740 #524b47 #635d48 #756144 #867050, rims #af874a
#ca9659; stone and roots #533736 #5f454d #604a5e #6a4d47 #745757 #7d5649 #957451. Background: one flat
solid magenta #FF00FF.
```

It came back as pixel art on a drawn grey and white checkerboard instead of magenta, at about six
pixels to its cell but not on one even grid, with a whole ruined shrine at its foot: `fig.webp`.

## Fixing a result in the same chat

- Temple too big or too high: "Make the temple smaller and lower, with more empty sky above it and
  the moat bank a little below the middle."
- Bullseye sun: "Remove the rings around the sun; one soft glow with rays behind the towers."
- Even palms: "Group the palms in two or three uneven clusters instead of an even row."
- Props touching: "Spread the props out with wide magenta gaps; nothing may touch."

## The results

The paintings these prompts gave are in `chatgpt/` beside this file (`back.webp`,
`near-props.webp`, `ground.webp`, and later `fig.webp`). How they were baked into the road, command by command, is in the
Angkor Wat section of `apps/web/games/steel-and-dust/assets/backdrops/README.md`.
