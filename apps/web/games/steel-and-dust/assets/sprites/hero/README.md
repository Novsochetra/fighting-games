# Hero sprites: Moss Shade

Generated with PixelLab (character `cc048154-e5ab-4e97-8b1b-53f5390bc28c`, "Variant 1 - Moss Shade"), east-facing animations only.

- Every strip is one row of 128×80 frames, facing right, with the feet at x=64, y=76.
- `hero.json` lists each animation's file, frame count, whether it loops, and its code in `SPRITE_PROMPT.md` (S01–S22).
- Frame counts follow what PixelLab produced, so some differ from the spec (for example `jump` has 8 frames and `land` has 4). Read the counts from `hero.json` instead of hard-coding them.

## Run (`hero_run.png`)

S22, eight frames that loop, two strides with a flight phase: the PixelLab v3 animation "run_v2"
(east), started from his dash's lean (dash_v2 frame 3), its 92×88 frames placed at (+12, +2) so his
hips sit at x=64, the stance foot of frames 1 and 2 lowered 2 px onto the feet line. He runs in his
dash's crouch, lower than he walks. The game plays it while a dash held to its end runs on.

## Ultimate (`hero_ult.png`)

Thornwood Requiem: nine 128×80 frames in the same format, from the PixelLab v3 animation
"ult_thornwood" (east). It has a single row and no weapon rows: every Shade calls up its own blade
for its ultimate, whatever weapon it holds. The game draws `arsenal/hero_ult.png`, the same strip
dressed in moss by the bake (below).

## Weapon variants (`arsenal/`)

The game draws the hero from `arsenal/hero_<anim>.png`, which `tools/bake_hero_weapons.py` builds from these sword strips. Each arsenal strip has the same frames in four rows, 80 px apart: sword (unchanged), fists, spear, axe. Keep these sword strips as the source and re-run the script after changing them. The blade's glow is taken away out to 2.3 px either side of its line, his body is mended where it lay across him, and most frames have their grip and tip set by hand in `OWN_OVERRIDES['moss']`, which win over the original `OVERRIDES`. Where nothing beside the blade can mend him (a shin it lay along, an outline at his fist), the entry draws the pixels back by hand (`paint`), takes stray ones away (`clear`) or recolours a whole box with the swing (`tint`).

## Moss (`tools/shade_fx/moss.py`)

The bake then dresses every row of every arsenal strip, and the ultimate, in the old grove, following
the character's PixelLab design (gallery `92d494b3-b82b-5bc5-b437-4c3b1ff5a804`): the hood and the
black face with its green eyes are left exactly as drawn (`moss_head.py` finds the head in every pose
and keeps a guard round it), the moss on the front shoulder plate is thickened in dark greens with one
olive tip (`moss_shoulder.py`), the cloak's trailing edge turns dark green and its hem breaks into dark
mossy strands, a dark leaf and a dim spore drift off it every third frame, and the blade gets a faint
haze. Its colours are the design's dark greens: #0a1a09 #172e11 #264528 #274e1a #296225 and olive
#557f14.
