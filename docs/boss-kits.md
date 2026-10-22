# Boss kits (plan)

A design for giving each of the twelve bosses its own movement, two skills and an ultimate. Each
boss is built one at a time, as its art comes in. This file tracks the plan; `architecture.md`
describes what is actually built.

## Where we are

- Every boss runs the same brain (`src/sim/brains/enemy/boss.js`): swipe or slam up close, a rare
  charge from far away, walk otherwise. Same three moves, same numbers (`raider-moves.js`). Only
  health, speed, reach and size differ, so all twelve fight the same way.
- Every boss sheet has the same strips: `idle 4, walk 8, attack 9, hurt 4, ko 9, slam 9, charge 8`.
- The Naga Raja is a recolor of the Cobra Matriarch, and the Bayon Guardian, the last boss of the
  game, is a recolor of the Rust Colossus.
- Several bosses come back as mid-bosses (Khan on road 6, Colossus on 8, Cobra on 9, Ironhorn and
  Queen on 10, Djinn on 11, Pharaoh and Ox on 12).

## Rules every kit follows

- **Movement personality.** Each boss moves its own way (duelist, bulldozer, bull, slitherer,
  burrower, pack hunter, floater, juggernaut, illusionist, warden, glider, colossus). This is what
  the player feels first.
- **Basic attack** stays (the `attack` strip, the boss's swipe).
- **Two skills** replace the shared slam and charge, each with its own wind-up the player can read.
- **One ultimate**, first at 40% health, then at most every 25 s. The world dims, the name is called
  out (as the Shades' techniques are), the danger is marked on the ground before it lands, and there
  is always a way out with what the hero has: jump, dash, walk away, or hit the boss first. The hero
  cannot crouch, so nothing asks for a duck.
- **Phase two at 50% health**: a little faster, shorter cooldowns, and one twist per boss.
- **A punish window** after the big moves (the boss is stuck, dazed or overheated), so learning the
  fight pays.
- **Mid-boss version** of a returning boss uses the movement and skills but no ultimate.
- Built as data plus small modules: a kit per boss in `src/data/enemies/boss-kits/`, the brain picks
  from the kit, and each skill reuses what exists where it can (shots, bombs, shockwaves, blink,
  reinforcements, the fissure, burn, danger zones, the technique call-out).

## The twelve

| #   | Boss            | Road              | Moves like                                   | Skill 1                                                                    | Skill 2                                                                   | Ultimate                                                                                                                                   | Phase 2 twist                               |
| --- | --------------- | ----------------- | -------------------------------------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------- |
| 1   | Gravel Khan     | Pine Ridge        | duelist: steps back, feints, dashes in       | **Crescent Dash**: a sword glint, then a slash dash across the screen      | **War Horn**: calls two raiders and guards while they come                | **Khan's Tempest**: three crescent waves skim the ground, one after another; jump each                                                     | the dash comes twice in a row               |
| 2   | Rust Colossus   | Old Grove         | bulldozer: slow, never steps back            | **Boulder Lob**: tears up a rock and lobs it; it breaks into shards        | **Spike Line**: stomps, stone spikes rise in a row toward the hero        | **Landslide**: leaps, lands, boulders fall on shadows marked on the ground for 4 s                                                         | the spike line runs both ways               |
| 3   | Ironhorn        | Bamboo Pass       | bull: paws the ground, long straight runs    | **Horn Rush**: runs to the screen edge; misses hit the wall, he's dazed    | **Mace Uppercut**: anti-air, launches a hero who jumps over him           | **Stampede**: three rushes back and forth, each faster, wall hits drop bamboo; dazed 2 s after                                             | two rushes chained without pause            |
| 4   | Cobra Matriarch | Raider Camp       | slitherer: keeps mid range, backs off        | **Venom Spit**: three globs in an arc, poison puddles for 4 s              | **Coil Lash**: long tail sweep along the floor; jump it                   | **Hypnotic Gaze**: the hood flares; face her when the flash fires and the hero is stunned, then she lunges. Walk away from her to break it | puddles last longer, spit fires 5           |
| 5   | Scorpion Queen  | Ember Woods       | burrower: scuttles sideways, digs under      | **Burrow Ambush**: dives, a mound tracks the hero, bursts up with a sting  | **Tail Sting**: long overhead stab that poisons                           | **Hive Swarm**: ember wasps fly across the screen in lanes, high and low, for 5 s                                                          | burrows twice before surfacing              |
| 6   | Gnoll Packlord  | Firefly Hollow    | pack hunter: fast, hops back and forth       | **Pack Call**: howls, two hounds come in from both sides                   | **Leaping Maul**: high pounce on a shadow under the hero, small shockwave | **Blood Frenzy**: eyes glow red, five lunges across the screen with afterimages; heals a little on each hit                                | calls three hounds                          |
| 7   | Storm Djinn     | Sandstorm Pass    | floater: hovers, blinks away when closed in  | **Thunder Fist**: punch fires a lightning bolt along the floor             | **Dust Devil**: a tornado drifts at the hero, pulls in and launches       | **Eye of the Storm**: rises, the storm whites out, lightning strikes marked spots in three waves, then one big strike                      | two dust devils at once                     |
| 8   | Furnace Knight  | Iron Works        | juggernaut: slow guard-up walk, vents steam  | **Fire Flail**: sweeping flail leaves burning ground                       | **Slag Pot**: lobs molten slag, leaves a lava pool                        | **Meltdown**: opens the chest furnace, a flame beam sweeps the arena (jump it); then overheats, armor off, takes double damage for 3 s     | burning ground lasts longer                 |
| 9   | Sand Pharaoh    | Mirage Temple     | illusionist: glides, blinks end to end       | **Mirage Clones**: two copies cast with him; a clone pops when hit         | **Scarab Carpet**: a wave of scarabs crawls along the floor; jump it      | **Curse of the Sun**: the hero is cursed; break three canopic jars around the arena in 6 s or the curse goes off                           | clones also fire                            |
| 10  | Warden Ox       | Warden's Fortress | warden: methodical, blocks                   | **Chain Hook**: chain pulls the hero in, then an axe chop                  | **Guard Counter**: a parry stance (glint); hit him and he counters        | **Executioner's Round**: spins across the screen twice, then a leaping cleave that splits the ground (the fissure, in red)                 | guards more often, chops twice              |
| 11  | Naga Raja       | Angkor Wat        | glider: rears up, glides on the stone        | **Tidal Coil**: a wave of moat water rolls along the floor; jump it        | **Seven Heads**: seven hoods strike in turn, low and high                 | **Rainbow Naga**: a spirit naga crosses the sky, sweeps the floor twice, then dives on a marked spot                                       | waves come in pairs                         |
| 12  | Bayon Guardian  | Bayon             | colossus: three phases, crumbles and reforms | **Stone Gaze**: one face turns, a gold beam; standing in it slows to stone | **Fig Roots**: roots burst up under the hero, then along the floor        | **Four Faces**: four giant stone faces at the screen edges fire gold beams in turn with gaps to stand in                                   | at 50% crumbles and reforms faster, glowing |

## Art each boss needs

### Body strips

Three new rows, appended under the seven rows the sheet already has, in the same frame size:

| Strip    | Frames | What it shows                                                     |
| -------- | ------ | ----------------------------------------------------------------- |
| `skill1` | 8-10   | frame 0 the stance, a clear wind-up, the action, the recovery     |
| `skill2` | 8-10   | same                                                              |
| `ult`    | 12     | a big wind-up pose (held while the world dims), release, recovery |

The Naga Raja and the Bayon Guardian should get their own full sheets (all ten rows), drawn new,
not recolored: a seven-headed naga king, and a four-faced Bayon stone guardian.

### Effect strips

Drawn apart from the body, one row each, in `assets/sprites/fx/boss/`. Sizes are in sheet pixels
(the hero sprites' resolution, twice the game's pixels).

| Boss     | Effects (frames, frame size)                                                                                                             |
| -------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| Khan     | crescent wave (6, 96x64), sword glint (4, 32x32), dash dust trail (6, 64x32)                                                             |
| Colossus | boulder spin (4, 48x48), shard burst (6, 64x64), stone spike rising (8, 48x96)                                                           |
| Ironhorn | wall impact burst (6, 96x96), daze stars loop (4, 48x24), falling bamboo (4, 32x160)                                                     |
| Cobra    | venom glob (4, 24x24), poison puddle loop (6, 64x24), hypnotic flash (8, 128x128)                                                        |
| Queen    | burrow mound loop (4, 64x32), emerge burst (6, 96x96), ember wasp loop (4, 32x32)                                                        |
| Gnoll    | howl ring (6, 96x96), landing bone burst (6, 96x64), red eye trail (4, 32x16)                                                            |
| Djinn    | lightning bolt loop (4, 96x32), tornado loop (8, 96x160), lightning strike (6, 64x432)                                                   |
| Furnace  | burning ground loop (6, 64x48), lava pool loop (6, 96x32), flame beam segment loop (4, 64x48) and head (4, 64x64), steam vent (6, 48x96) |
| Pharaoh  | scarab crawl (4, 32x16), canopic jar (1, 48x64) and jar break (6, 64x64), curse mark loop (4, 32x32), mirage shimmer (6, 96x112)         |
| Ox       | chain hook (1, 32x32), parry glint (4, 48x48), red axe spin (6, 160x112)                                                                 |
| Naga     | water wave loop (6, 128x80), splash (6, 96x64), spirit naga head (6, 192x128) and body segment (1, 64x64)                                |
| Guardian | gold gaze beam segment loop (4, 64x48), fig root burst (8, 64x128), giant stone face (4, 256x256), rubble burst (6, 128x96)              |

## Prompt rules for generated art

Image models often get the size wrong. Every prompt for this game should carry these lines exactly:

```
STRICT OUTPUT RULES (do not break any):
1. One PNG, canvas exactly {W} x {H} pixels. Not larger, not smaller, not rescaled.
2. One horizontal row of exactly {N} frames. Each frame is exactly {FW} x {FH} pixels,
   frame i starts at x = i * {FW}. No gaps, borders, grid lines, labels, numbers or text.
3. Real transparent background (alpha = 0). Do NOT paint a checkerboard, white or colored background.
4. Pixel art: hard pixel edges, no anti-aliasing, no blur, no gradients, no glow halos,
   at most 32 colors, 1px dark outline, light from the top left.
5. Side view, the character faces RIGHT in every frame.
6. Same character, same size, same proportions and palette in every frame; match the reference image.
7. The feet stand on the same line in every frame: y = {FEET_Y}, centred at x = {FEET_X} inside the frame.
   (Feet that leave the ground in a jump frame are fine; the line is where the ground is.)
8. Nothing crosses outside its own frame. No ground shadow (the game draws its own).
9. Effects (projectiles, waves, beams) are NOT drawn in the body strip unless asked; they are separate files.
```

Body strips: `FW x FH = 192 x 112`, `FEET_X = 96`, `FEET_Y = 108`, `W = N x 192`, `H = 112`.
Effect strips: the frame size from the table above, `W = N x FW`, `H = FH`; for an effect, replace
rules 5 to 7 with "centred in every frame, the anchor at the bottom centre for things on the ground".

Whatever comes in is cleaned before it goes in the sheet: lifted off its background, cut into
frames, shrunk to the boss's size, stood on the feet line and folded into the sheet's palette. Small mistakes are fixed there; the rules keep them
small.

What came back for Khan, and what the cleaning had to fix (worth asking for in the next prompts):

- Every image was 2000x667, whatever size was asked for; the tool scales by the boss's idle height,
  so the size matters less than the figure being the same size in every frame.
- Three of five had a checkerboard painted in as the background. The tool keys out a light grey
  one, but a real transparent PNG is safer: grey is also the color of steel.
- Frames are not evenly spaced and long blades reach over the next frame's legs, so each strip
  needs its cut lines picked by eye. Asking for wide gaps between frames saves
  that step.
- The images came through chat as WebP, which leaves faint noise; the original PNG is better.

## Order

1. **Gravel Khan**: done. The first boss the player meets, and the one that built the shared parts
   (kit data, the brain picking skills, extra strips in a sheet, the ultimate with its dim and
   call-out, phase two, the mid-boss version). His War Horn plays only when no raider stands with
   him, and the dash's dust trail was left out: the gravel the waves throw up was enough.
2. Then down the road, 2 to 12. Naga Raja and Bayon Guardian wait for their new sheets.
