# Hero sprites: Moss Shade

Generated with PixelLab (character `cc048154-e5ab-4e97-8b1b-53f5390bc28c`, "Variant 1 - Moss Shade"), east-facing animations only.

- Every strip is one row of 128×80 frames, facing right, with the feet at x=64, y=76.
- `hero.json` lists each animation's file, frame count, whether it loops, and its code in `SPRITE_PROMPT.md` (S01–S21).
- Frame counts follow what PixelLab produced, so some differ from the spec (for example `jump` has 8 frames and `land` has 4). Read the counts from `hero.json` instead of hard-coding them.

## Ultimate (`hero_ult.png`)

Thornwood Requiem: nine 128×80 frames in the same format, from the PixelLab v3 animation
"ult_thornwood" (east). It has a single row and no copy in `arsenal/`: every Shade calls up its own
blade for its ultimate, whatever weapon it holds.

## Weapon variants (`arsenal/`)

The game draws the hero from `arsenal/hero_<anim>.png`, which `tools/bake_hero_weapons.py` builds from these sword strips. Each arsenal strip has the same frames in four rows, 80 px apart: sword (unchanged), fists, spear, axe. Keep these sword strips as the source and re-run the script after changing them.
