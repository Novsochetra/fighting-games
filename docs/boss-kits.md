# Boss kits (plan)

A design for giving each of the twelve bosses its own movement, two skills and an ultimate. Each
boss is built one at a time, as its art comes in. This file tracks the plan; `architecture.md`
describes what is actually built.

## Where we are

- Every boss runs the same brain (`src/sim/brains/enemy/boss.js`): swipe or slam up close, a rare
  charge from far away, walk otherwise. Same three moves, same numbers (`raider-moves.js`). Only
  health, speed, reach and size differ, so all twelve fight the same way.
- Every boss towers over the hero, drawn at its `scale`: the Khan, Djinn and Pharaoh about twice
  the hero's height; the Furnace Knight, Ironhorn, Gnoll, Cobra and Naga about two and a half times;
  the Colossus, Queen and Ox about three times; the Bayon Guardian the biggest of all.
- Every boss sheet has the same strips: `idle 4, walk 8, attack 9, hurt 4, ko 9, slam 9, charge 8`.
- The Naga Raja is a recolor of the Cobra Matriarch. The Bayon Guardian, the last boss of the game,
  has his own sheet now (see 12 below).
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
| Naga     | done: `tide` (8), `splash` (7), `serpentRise` (8), `spiritNaga` (7), `nagaBolt` (4)                                                      |
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
   him, and the dash's dust trail was left out: the gravel the waves throw up was enough. His
   knock-out, slam and Crescent Dash rows were cut off at the frame's edges and were redrawn; the
   new art fits his 192×112 frames, so his sheet kept its size.
2. **Rust Colossus**: done. His sheet has taller frames (192×160) so the boulder held overhead
   fits. The landing spot of every boulder is marked with the same blinking red bar as the lanes. His slam row
   had its raised fists cut off at the frame's top and was redrawn.

3. **Ironhorn**: done. Taller frames too (the mace swung overhead). The stars GPT drew into the
   Dazed strip were keyed out and are drawn from the stars effect instead, so they also circle him
   after the Stampede. Every wall hit, not only the Stampede's, knocks a bamboo stalk down.
4. **Cobra Matriarch**: done. Her sheet has wider frames (256×112) so the tail laid along the
   floor fits. GPT drew the Gaze strip on black, with a light green glow round her and frames
   touching, so the tool floods black in from the edges, peels the glow and takes per-row cut
   lines. The new colors are picked from spread-out seeds so her glowing eyes keep their own
   entries. Each glob's landing spot is marked as it leaves her mouth, and puddles are drawn under
   the fighters' feet. Her knock-out, slam
   and charge rows were cut off at the frame's edges and were redrawn.

5. **Scorpion Queen**: done. Her sheet has frames both wider and taller (256×160): the sting
   stabs far ahead and the tail stabs straight up as she bursts out. GPT gave real transparent
   PNGs this time; the travelling mound is its own loop, cut at her scale onto the end of her
   burrow row, so the mound is simply her while she is under. Out of reach while under, she
   surfaces in a separate move with a red mark under it; the phase-two second dive only shakes the
   mound and sprays sand, with no red, so the player learns which stop is real. The swarm's two
   waves (from behind her, then from behind the hero) never fly at the same time, so a low and a
   high wasp can never reach the hero together. The poison never takes the last of a life. Her first seven rows were later drawn again in the style of her skill rows (a light painted
   checker keyed out), each strip scaled to the same body size as her Tail Sting stance and stood on
   her feet line, every frame laid over the one before; the skill rows were slid to match, so
   nothing jumps when a move starts or ends.
6. **Gnoll Packlord**: done. Taller frames (192×160) for the club raised high in the leap. He
   leaps for real, through the air, onto a spot marked under the hero as he takes off (only that
   spot is marked, not the ground under him), and lands with the bone burst and a small
   shockwave. The Pack Call sends hounds rather than the road's raiders. His frenzy turns at the
   walls with a skid instead of Ironhorn's crash and bamboo, and ends with him staggering back into
   the arena to pant. The frenzy strip's third lunge (frame 8) was drawn tangled in the frame
   before it, so its timeline loops frames 4-7 and leaves frame 8 out. His swipe,
   knock-out and slam rows were cut off at the frame's edges and were redrawn (the swipe's raised
   club ran off the top of the new image and its spike was given back its point); the Leaping
   Maul's two airborne frames were lifted off the frame's bottom edge and its landing club rests
   on the feet line, and the unused frenzy frame was cleared.

7. **Storm Djinn**: done. Taller frames (192×160) for the storm over his raised hands. Crowded,
   he slips away in a small dust devil to the side of the hero with more room, at most every 4 s.
   The Thunder Fist's bolt leaves his fist and dives to run along the floor at shin height. A dust
   devil pulls slower than the hero walks, so walking away (or a dash through it) gets out, and it
   blows out after throwing someone. The storm's middle wave leaves the hero's own spot clear, so a
   hero who ran from the first wave is caught by it; every strike's spot crackles while it gathers. His knock-out and
   slam rows were cut off at the frame's edges and were redrawn.

8. **Furnace Knight**: done. His sheet has frames both wider and taller (256×160): the flail
   whirls overhead and sweeps far along the floor. The flail and pot strips came with a painted
   checkerboard, also shut inside the flail's fiery arcs, so the keying also clears closed pockets
   made of the two checker greys and peels the grey fringe off the arcs. The Meltdown image drew each
   beam frame's flame over the next frame's body, so only its first firing frame is used and the
   beam is drawn as lances, grown out of the flame in his chest, diving to a hero's waist and
   flying level there; he
   leans into each shot and stands blazing between them. In place of one sweeping beam (a beam the hero
   cannot crouch under would be unfair), it is three lances at a hero's waist, each a beat after the
   furnace roars, to jump. He overheats as soon as the last lance has gone, so no hit can knock
   him out of it, and while overheated each hit lands for double where he stands. Burning ground and
   lava only burn a hero on the ground and hop them out, so nobody is juggled in the flames. His
   swipe, knock-out and slam rows from his first sheet were cut off at its edges, so they were
   redrawn. The Slag Pot leaves his fist as the throwing frame
   thrusts it forward. No boss draws the raiders' white weapon trail any more: each boss sheet
   draws its own swing arc, and the trail ran along a weapon the sprite did not hold there.
9. **Sand Pharaoh**: done. His sheet has frames both wider and taller (256×160): the sun rises far
   over his staff and the staff thrusts far ahead. The first images came with a painted
   checkerboard, scarabs drawn over his feet and a beam drawn over the next frame's body, so the
   body strips were drawn again on real transparency, with no effects in them; the jar, the eye and
   the scarab came through the checker cleaning. Frames touch in the new images, so they are split
   by connected pieces rather than cut lines, shrunk so the stance matches his idle frame, stood on
   his idle feet line and held in place by the back heel (by the staff's orb while only sand is
   left). Where the scarabs leave, where the bolts leave, where the sun bursts and where the curse
   flashes are read from the art and locked by a test. Crowded, he dissolves and steps out at the
   far end (`mirageBlink`, out of reach while only sand is left). The Mirage Clones step him out at
   one of three spots across the arena, his copies at the others, none on the hero; the copies
   move as he moves, are a shade thinner and waver now and then, and pop at one blow. The Curse of
   the Sun counts down over the hero's head in the sun's eye; the scarabs bite only feet on the
   ground. In phase two his copies thrust their staffs and fire mirage bolts low along the floor.
10. **Naga Raja**: done, ahead of the Warden Ox. Her sheet is new and her own, not the Cobra
    recolor. Her 384×240 frames are drawn half as fine again as the other sheets (`density` 1.5), and
    at scale 1.5, so she stands sharp at about two and a quarter times the hero's
    height; her reach, her effects and every point read from her art grow with her. She glides in smooth bursts over the stone and glides back from a hero who
    crowds her (`glider`). Her slash and her coil slam are her close moves; the slam bursts with moat
    water. The Tidal Coil crashes her coil down and rolls a wave from its front along the floor (jump
    it); in phase two two waves come, one after the other. The Seven Heads spit seven water nagas
    from her mouths in turn: low pairs a jump clears, then high pairs that fly over a standing hero,
    spaced so a hero who jumped has landed first. The Rainbow Naga gathers the rainbow in her
    raised hand, sends a spirit naga sweeping along the floor from behind her and then one from
    behind the hero (jump each), then bursts a serpent of water up on a spot marked under the hero
    (walk off it), and leaves her spent and open for a while. The images came on black or a painted
    dark checker, with water, glow and beams drawn over her body and frames touching: they were keyed,
    split along winding seams (a dagger tip that touched the next frame's tail stays with its own
    frame), and the water, rocks and glow were peeled off her. Her slash, slam and three skill strips
    were then drawn again body-only on white, and an orb of rainbow light gathers over her raised
    hand and follows it from frame to frame before the spirits come; the ultimate's name is called
    higher (`calloutUp`) so the orb does not cover it.
11. **Warden Ox**: done, after the Naga Raja and the Bayon Guardian. His sheet moved to the big frame (256×160): the axe rises far over his head
    and the counter thrusts far ahead; his first seven rows were set into it with his feet where they
    stood. The chain and guard strips came on real transparency; the axe whirl and the parry burst
    on a painted checkerboard, keyed by their colors, and the axe at the whirl's middle keyed out
    with it, so the whirl is drawn behind him round his own axe. The chain and hook drawn beyond his
    fist on the throwing and pulling frames were cut away: the game draws the chain from the fist of
    the frame he is drawn on to the hook, link by link from a strip cut out of his own chain, so it
    reaches wherever the hook is. The hook flies at the hero's waist (jump it) and drags a hero it catches to
    where his chop lands; a missed hook reels back. The Guard Counter glints gold on his hammer
    (it does not blink red: he is not striking); a blow on it bursts in gold, the striker reels,
    and his counter lands. The Executioner's Round spins him to the arena's wall and back, a red
    whirl round him, then he leaps at the hero and cleaves the road: a red crack runs off both ways
    at a steady pace, and a hero standing where it passes is thrown up (jump it). Where the chain
    leaves his fist, where the glint shines, where the whirl spins and where the axe splits the
    road are read from the art and locked by a test. In phase two he guards more often and his
    hook ends in two chops, the first only staggering.
12. **Bayon Guardian** (12): done, ahead of the Warden Ox, as his art came first. His own sheet, a
    mossy four-faced temple golem with gold veins, has frames both wider and taller (256×160) for
    his arms raised in the ritual and the roots round him. The images came on a painted checker
    (the punch on white); white-hot eyes, cracks and the beam's core are as light as the checker, so
    the light patches enclosed by gold glow were put back after keying. Frames touch in the punch
    and ritual strips, so each frame was grown out from its feet through its own body, with a cut
    line drawn by hand where two hands overlap. Every strip is shrunk so his head is drawn as big as in his idle frame (matched picture
    to picture at many sizes: a strip that starts in a crouch, sized by its height, drew him up to
    13% bigger), stood two sheet pixels under the feet line and held by the back heel (by both feet in
    the idle loop, by the front foot once he lies in the knock-out). At his size his straight punch
    passes over a standing hero, so it is his anti-air (`swipe`, only at a hero in the air) and the
    slam is his blow up close. The Stone Gaze draws a ray from his eyes down to the marked spot and
    a gold pillar bursts there; it leaves the hero `stoned`, walking at under half pace. The Fig
    Roots run along the floor, then burst under where the hero stood, its spot cracking first. The
    Four Faces rise at the screen's edges, left, right, left, right, while he glows gold; each
    glares, its reach marked
    red on the floor, then breathes a beam at a hero's waist for 24 ticks, short enough to clear in
    one jump, across 60% of the arena, so the far side is safe. The beam is drawn in code a
    screen pixel at a time (`face-beam.js`, `beam-flares.js`): a waving gold body with a white-hot
    core, pulses of light running out along it, forks of lightning crackling round it, a turning
    flare in the mouth, a star at the tip and its light on the road; it shoots out over its first
    ticks, and the hit grows with it. A tiled strip cut from the image and a PixelLab beam were both
    tried and looked flat beside it. At half health
    he crumbles to rubble (out of reach) and plays the strip back to stand again with a gold rim,
    sparks at each footfall; his gaze then raises three pillars and his roots run both ways. The
    first stone face and rock burst images had frames drawn over each other, so both were drawn
    again with wide gaps (the prompts asked for 20 px clear round every frame): the face looks
    across the arena in profile, opens its mouth with no beam drawn, then cracks and crumbles where
    it stands, its rubble sunk deep enough into the road that its mouth breathes at a hero's waist.
    The ritual strip's frame 2 drew its raised hand hidden behind the next frame's, so frame 1 holds
    in its place; its frames 4-6 were drawn bigger than the rest and are shrunk one by one, and
    its frames 7-8, drawn smaller and turned to the viewer, are left out (frame 6's prayer holds); a redrawn ritual came out about a fifth slimmer than his walk, so the first one
    stays, matching his bulk.
