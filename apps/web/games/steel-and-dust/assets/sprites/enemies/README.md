# Enemy sprites

Thirty-one enemies. Twenty-eight were designed and animated with PixelLab; the two temple bosses
and the Scorpion Queen were drawn new by an image model (Boss kits, below), the temple bosses having first been recolors of two of them. The first sixteen came from one batch of 64×64 side-view concepts
(`concepts/enemies/` at the repo root, `01` to `16`), and their three bosses were redrawn at 96×96
first. The thirteen added with the missions (`17` to `29`: seven bosses at 96×96, six raiders at
64×64) were drawn with Create Image (Pro), styled after the first batch.

Each strip is a PixMiniMax animation of the concept, facing right, generated on a frame the size of
the sheet's frame with the concept standing on the feet line, so the strips need no resizing. Every
strip but `ko` is pinned back to the concept's feet where the model drifted, and the sheets are
indexed PNGs.

Each PNG holds one enemy, one row per strip. `src/data/enemies/enemy-sprites.js` gives the frame size,
the feet position and each strip's row, frame count and strike frame:

| Strip    | Frames | What it shows                                                        |
| -------- | ------ | -------------------------------------------------------------------- |
| `idle`   | 4      | breathing loop                                                       |
| `walk`   | 8      | walk loop                                                            |
| `attack` | 9      | frame 0 is the stance, then the wind-up, the strike and the recovery |
| `hurt`   | 4      | recoil and recover                                                   |
| `ko`     | 9      | 0 stands, 1-4 fly backward, 5-8 land and lie still                   |
| `lunge`  | 9      | Red Cutter only: crouch, then a running lunge                        |
| `slam`   | 9      | bosses: wind-up and a strike into the ground                         |
| `charge` | 8      | bosses: a running loop                                               |

Regular enemies use 128×80 frames with the feet at x=64, y=76; bosses use 192×112 with the feet at
x=96, y=108.

## Packed sheets

The game does not load these grid sheets: most of every cell is empty, and a browser keeps every
pixel of a sheet it draws, so the grid sheets would take 251 MB once unpacked (the Naga Raja's
alone 42 MB). It loads `packed/`, where each frame is cut to its paint with a clear pixel round it
and identical frames are kept once, in the sheet's own palette (40 MB for all 31). After changing a
sheet here, run

    python3 tools/pack_enemy_sheets.py

which rewrites `packed/` and `src/data/enemies/atlas/` (where each piece sits in its cell);
`test/unit/data/enemy-atlas.test.js` fails until you do. Hit splashes and flashes the model painted onto hurt and knock-out frames were removed.
Where a generated knock-out landed early or late, its frames were picked to fit the 1-4 / 5-8 split.

## Boss kits

A boss with a kit of its own (`docs/boss-kits.md`) has more rows under the seven above, one per move
of its own, named as the move is. Each plays on the move's own timeline (`frameAt`), so its strike
frame only has to lie inside the strip. A boulder or a mace held overhead does not fit a 192×112 frame, so `colossus.png` and `ironhorn.png`
have 192×160 frames with the feet at y = 156: their first seven rows are the old ones moved 48px down. The Cobra's tail laid
along the floor reaches past a 192px frame, so `cobra.png` has 256×112 frames with the feet at x = 128: its first seven rows
are the old ones moved 32px right. The Gnoll's club raised high in his leap does not fit either, so `gnoll.png` has 192×160 frames too, and so does `djinn.png`, for the storm over the Djinn's raised hands. The Queen's sting reaches far ahead and her tail stabs straight up as she
bursts out, so `queen.png` has 256×160 frames with the feet at x = 128, y = 156, and so does `furnace.png`, for the flail swung overhead and swept far along the floor, and `pharaoh.png`, for the sun over his staff and the staff thrust far ahead. They are drawn by an image model, then lifted off their
background, cut into frames, shrunk to the boss's idle height, stood on the feet line and folded
into the sheet's own palette.

All twelve boss sheets are then finished as pixel art, so they sit beside the raiders: a row the
image model drew came out a shrunk painting (some 250 colors, over half its pixels matching no
neighbour). Rows already drawn as pixel art (a few dozen colors, few lone pixels) are kept as they
are and their colors seed a small sheet palette; the other rows are mapped onto it (14 to 40 more
colors picked by k-means in Lab), grey left from a background is taken into the glow round it,
lone pixels close in color to their neighbours are merged into flat clusters, and the body gets a
one-pixel dark outline. Fire, glows, sparks and thin streaks keep their own colour to the edge: an
edge pixel mostly surrounded by glow is never outlined, the grey a background left round a glow
is dropped from its edge and recoloured inside it, and the charred lump the image model left in
the Furnace Knight's sweep along the road (`fireFlail` 6, behind his back foot) was cut out. His
flames (`attack`, `ko`, `slam`, `fireFlail`, `slagPot`, `meltdown`) were streaked with washed-out
white and peach where the image model blended a pale smear over its background: every such pixel
inside a flame, and the background grey left there, takes the colour of his own fire ramp for its
brightness (dark red to pale yellow, two steps darker on a flame's edge) before the sheet is
outlined, so the outline sees it as fire; `fx/lava.png` was burned the same way. A regression test keeps
every boss sheet under 100 colors with under 0.3 of its pixels alone.

| Sheet      | Rows added                                                                                       |
| ---------- | ------------------------------------------------------------------------------------------------ |
| `khan.png` | his `ko` and `slam` rows redrawn, his first sheet's being cut off at its edges; `warHorn` 8 (blows a ram's horn), `crescentDash` 10 (crouch, lunge, slash; redrawn, its blade was cut off at the right), `tempest` 12 (three low swings) |
| `colossus.png` | his `slam` row redrawn, his first sheet's having its raised fists cut off at the top; `boulderLob` 10 (tears up a boulder, hurls it), `spikeLine` 8 (a stomp), `landslide` 12 (pounds the ground twice, roars) |
| `ironhorn.png` | `hornRush` 10 (paws, runs, skids), `uppercut` 8, `dazed` 6 (a loop; the stars are `fx/stars.png`), `stampede` 12 (rears, stomps, runs, skids) |
| `cobra.png` | her `ko`, `slam` and `charge` rows redrawn, her first sheet's being cut off at its edges (her palette was full, so colors in her old rows less than 5 levels apart were merged to make room); `venomSpit` 8 (rears back, spits), `coilLash` 10 (whips the tail round and along the floor), `hypnoticGaze` 12 (rises, hood flared, eyes glowing and flashing, lunges) |
| `gnoll.png` | his `attack`, `ko` and `slam` rows redrawn, his first sheet's being cut off at its edges; `packCall` 8 (crouches, howls at the sky), `leapingMaul` 10 (crouches, leaps with the club overhead, smashes it down), `bloodFrenzy` 12 (hunches with red eyes, cackles, lunges; frame 8 is unused and left empty, see `docs/boss-kits.md`) |
| `djinn.png` | his `ko` and `slam` rows redrawn, his first sheet's being cut off at its edges (his palette was full, so colors in his old rows less than 5 levels apart were merged to make room); `thunderFist` 8 (fists crackling, a punch trailing lightning), `dustDevil` 8 (whips sand round himself, pushes it out), `eyeOfStorm` 12 (raises his arms into a storm, drives lightning down) |
| `furnace.png` | his `attack` (swipe), `ko` and `slam` rows redrawn too, his first sheet's being cut off at its edges (the `ko` row's last lying frame is used twice); `fireFlail` 10 (whirls the flail overhead, sweeps it along the floor), `slagPot` 8 (lifts a pot of slag over his head, hurls it; the flying pot was keyed out, it is `fx/slag.png`), `meltdown` 10 (opens the chest furnace, fires, blazes between lances, then red hot and cooling; the image's later beam frames were drawn over each other's bodies, so only the first firing frame is kept, its flame trimmed to a ragged tip, the blazing frame is used twice and the lances are `fx/beam.png`) |
| `pharaoh.png` | `mirage` 9 (raises the staff, dissolves into a spiral of gold sand, steps out of it crouched, stands; the copies pop on its frames 3-5), `scarabCarpet` 8 (raises the staff, thrusts it low, the orb pulsing; the scarabs are `fx/scarab.png`), `curseOfSun` 12 (raises the staff in gold ribbons, the sun over it pulsing, 4-7 a loop, then points the orb at the hero; 7 repeats 5, so the sun sways back over his staff rather than jumping as the loop starts again). His first seven rows were drawn again after his skill art by an image model (his skill frames and each old strip as the pose to follow), the frames shrunk to his stance height (80 pixels from head to soles), folded into the colors of his skill rows and stood on his feet line: by the middle of his feet, by his head in `walk` and `charge`. The `attack` 5 arc and the `slam` 5-7 burst are his old ones moved onto the new frames (the burst rising from the staff's foot, kept off the orb); `ko` 1-4 fly at the heights of his old fall and `ko` 8 repeats 7 |
| `ox.png` | his first seven rows set into the big frame (256×160) with their feet where they stood; `chainHook` 9 (swings the chain overhead and throws it, the hammer at his side; drags the hero in with the hammer held across him, raises it over his shoulder, the frame `execution` 1 is, and chops), `guardCounter` 8 (raises the hammer across his chest, 2-3 the held guard, 3 the same as 2 so the hammer never blinks away; the counter thrust, slams it down, stands), `execution` 12 (raises the hammer, spins with it, 4-6 a loop, leaps with it overhead, drives it into the road, wrenches it free). The image model drew his weapon as a hammer in some frames, a bearded or double-bitted axe in others and not at all in a few: every head was redrawn as the block hammer of his first rows, and the three rows were dropped a pixel onto his feet line. The fist and knee cut flat in `chainHook` 4-5 were rounded off, the slit keyed through his neck in `hurt` 0 was closed, the lying `ko` frames rest on the road, and the smear of his `attack` 5 ends in the hammer's head |
| `guardian.png` | all ten rows his own, drawn new (a mossy four-faced temple golem with gold veins), in 256×160 frames: the seven shared rows (his `attack` a straight punch, his `slam` both fists into the road) and `stoneGaze` 8 (eyes kindling and flaring), `figRoots` 8 (fists into the ground, gold-veined roots bursting round him), `fourFaces` 12 (raises his arms as gold climbs him from the feet, 4-5 a glowing loop, lowers them into prayer as the gold drains, stands), `crumble` 8 (falls to rubble; played back to reform). The image model drew each strip at its own size, place and idea of his body, so he jumped and changed as his moves began; the sheet was then reworked pixel by pixel round one stance (the old `stoneGaze` frame 0, moved to where his idle stood): every strip scaled and shifted onto it, every move starting and ending on that very frame, `idle` rebuilt from it (a 2px breath and a pulse of his veins), the `walk` given its upper body over the old legs with a heavy bob and swinging fists, the other strips' heads, fists and planted feet replaced by its own where they had drifted, and `fourFaces` 1-10 animated from it with PixMiniMax (the first draw had turned him into a slim figure) and gilded in code. Straight cuts of other frames' bodies, specks and smears were removed, and every frame was finished the same way: a contrast curve, his veins kindled, the silhouette tidied and a 1px dark outline. Folded into one 255-color palette (no color moved more than 10 levels) |
| `naga.png` | drawn new, not recolored, and half as fine again as the other sheets (`density` 1.5, so she stays sharp drawn big): all ten rows are hers, in 384×240 frames with the feet at x = 192, y = 236, each strip shrunk from the source images so its stance stands as tall as her idle (129 px) and laid over the frame before by its coil. Her `attack` (slash; the arc is in frame 4) and `slam` rows were redrawn body-only; `tidalCoil` 9 (leans back, rears up, crashes her coil flat, rises), `sevenHeads` 8 (fans her hoods, strikes forward in frames 4 and 5, in turn; in those two frames her face turns left), `rainbowNaga` 12 (raises her empty hand, rises with both arms up, 4-7 a loop, points her dagger, sags); the water, the orb and the spirits are `fx/` strips. Her five redrawn strips lost the grey matte left round their outline and along the road, and the white trapped between hoods and arms; her `idle` is now four of her move stances (`attack` 0 and 8, `slam` 8 and 0) breathing, so she no longer changes shape as a move starts, and `tidalCoil` 7-8 are full-size frames (`slam` 7, `attack` 0) instead of ones drawn a tenth small; the kris is back in her hand in `sevenHeads` 1 and `rainbowNaga` 10. Her `walk`, `hurt`, `ko` and `charge` were drawn again by an image model after her stance (her first design's spire crown and pale hood gone), shrunk so her head, shoulders and hood match her stance, folded into her new strips' colors and stood on her ground line: `walk` by her upper body, `hurt` and `charge` by the front of her coil, `ko` 2-4 at the heights of her old fall and `ko` 8 repeating 7; `hurt` is frames 1, 2, 7 and 8 of a nine-frame image (2-3 the near-identical sag her Spent rocks on), and a mauve charm the model put in her empty hand in `walk` was painted back to her skin |
| `queen.png` | all eleven rows hers, drawn new by ChatGPT (a queen's body growing from the front of an obsidian scorpion, violet hair, a venom-green sting, so she stands out on her own orange stage) from the prompts and images in `concepts/enemies/scorpion-queen/`, and baked by `tools/queen_sheet/bake.py`: the seven shared rows, `burrow` 12 (digs in until only the stinger shows, 0-7; then her mound tunnelling, a loop, 8-11), `emerge` 8 (bursts up, stinger stabbing straight up), `tailSting` 9 (whips the tail over her head and stabs ahead), `hiveSwarm` 12 (rears, shrieks, eyes and stinger blazing venom green, 5-7 a loop, slams the pincers down). Each strip is shrunk so its stance stands as tall as her idle and lined up by her planted rear legs (the thrown, lying, dug-in and bursting poses where ChatGPT drew them beside the strip's stance). ChatGPT kept her strikes close to her body, so the claw of `attack` 3-4 and the tail of `tailSting` 4-5 are drawn out to the reach her blows have in the game; and it redrew her whole body in every pose, so her `idle`, `walk` and `charge` keep their first frame's body over each frame's own legs instead of shimmering: each frame's legs are moved under that body and joined to it along the path through her waist where the two drawings agree, so no line shows there (the `idle` breathes 1-2 px from below the hand on her hip, over planted legs). Folded into one 84-color palette |
