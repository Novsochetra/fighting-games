# Steel & Dust

A 2D pixel-art melee brawler, inspired by Metal Slug's stages but with weapons instead of guns.
Plain JavaScript and Canvas, native ES modules, no build step.

Open it from the arcade home page, or go straight to `games/steel-and-dust/` on the dev server
(`npm run dev` at the repo root).

## Controls

| Action              | Keyboard                                                                                              | Touch                                                                  | Gamepad         |
| ------------------- | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------- | --------------- |
| Move                | ← → or A D                                                                                            | the stick in the bottom-left corner (or a floating stick, in Settings) | stick or d-pad  |
| Jump                | ↑ / W / Space (hold ← or → to jump that way)                                                          | JUMP                                                                   | A               |
| Dash (invincible)   | Shift, or tap ← → twice; once more in the air. Hold the other way to turn, or dash again to dash back | DASH                                                                   | B               |
| Light attack        | J or Z                                                                                                | ATTACK (hold to keep the combo going)                                  | X               |
| Heavy attack        | tap K or X                                                                                            | HEAVY                                                                  | Y               |
| Charge attack       | hold K, let go (level 1 after 0.4 s, max after 1.1 s)                                                 | hold HEAVY                                                             | hold Y          |
| Launcher            | ↓ + K, or ↑ + K to launch and jump after the enemy                                                    | stick up or down + HEAVY                                               | stick + Y       |
| Low sweep           | ↓ + J                                                                                                 | stick down + ATTACK                                                    | stick down + X  |
| Rising strike       | ↑ + J together                                                                                        | stick up + ATTACK                                                      | stick up + X    |
| Air pogo            | in the air, ↓ + J                                                                                     | in the air, stick down + ATTACK                                        | stick down + X  |
| Air dive            | in the air, ↓ + K                                                                                     | in the air, stick down + HEAVY                                         | stick down + Y  |
| Dash attack         | J during a dash (K for a sliding launcher)                                                            | ATTACK during a dash                                                   | X during a dash |
| Ultimate            | L or U when the ULT bar is full                                                                       | ULT                                                                    | RB or RT        |
| Pause               | P or Esc                                                                                              | II                                                                     | Start           |
| Full screen / sound | F / M                                                                                                 | menu                                                                   | menu            |

Menus work with the arrow keys and Enter (Esc goes back), with a gamepad (A / B), or by touch.

## Settings

Saved in the browser: music and sound volume, difficulty (Easy, Normal, Hard), auto-aim (attacks turn toward the nearest raider, on by default on touch screens), hold ATTACK to combo, screen shake (off / low / full), flashes, damage numbers, touch controls (auto / on / off), joystick (fixed in the corner, floating under your thumb, or hidden), hide with a gamepad (on by default: the touch controls step aside while you play with a gamepad and come back on a touch), button size, vibration, and **Training tools**. With Training tools on, 1–4 swap weapons, 0 fills the ULT bar, H shows hitboxes and frame data, and the pause menu has a weapon switch.

## What's in it

- **4 weapons:** Fists (unbreakable), Sword, Spear, Axe, each drawn in the hero's hands with its own smear colour (gold, green, ice, ember). Weapons drop from crates and break after a set number of hits, with a warning when they start to crack.
- **Combo chains**, each with the same structure:
  - `J J J J` ground string, and a fifth `J` that rushes after the knocked-back enemy and launches them
  - `J J K` launcher branch
  - `K K` heavy follow-up (Hurricane Kick, Crossing Cleave, Meteor Lance, Executioner), and `K K K` to finish (Meteor Fist into the wall, Tempest's slash wave, Dragon Tail's hook launcher, Rampage's pull and launch)
  - `↑+J` rising strike that lifts you into the air with the enemy, ready for `Air J J J K`
  - `Air ↓+J` pogo: drop onto an enemy's head and bounce off, up to three times a jump
  - `↓+J` low sweep that trips the enemy and goes under a Bulwark's shield, then `J J J`
  - `↑+K` launcher
  - `Air J J J K`, ending in a spike that bounces the enemy off the ground
  - `Air ↓+K` dive
  - `↓+K` launcher, and `↑+K` to launch and follow the enemy up
- **Charge attacks:** hold K for level 1 or max. Every weapon has its own pair: Burst Straight and Tiger Rush (fists), Iai Rush and Crescent Moon, a slash wave (sword), Comet Lunge and Cyclone, which pulls enemies in (spear), Earthsplitter and Cataclysm, which launches every grounded enemy (axe). Holding K at the end of a string charges straight out of it.
- **A fighting style per Shade:** each Shade reworks every weapon's moves (`src/data/styles/`):
  - **Moss, Grove Guard:** the even weapon timing; string and heavy finishers raise brambles out of the ground ahead that launch raiders.
  - **Firefly, Swarm Dance:** about a quarter faster and a little lighter; the third light hit becomes a three-hit flurry, and finishers loose homing fireflies that sting twice each.
  - **Antler Spirit, Stampede:** slower and a quarter heavier; the third light hit is an armored ram that sends a spirit stag charging ahead, the heavy opener stomps a shockwave, and a max charge sends three stags.
  - **Blue, Frost Iai:** longer reach and slower recovery; heavy cuts freeze raiders solid in ice for extra hits, then the ice shatters and launches them.
  - **Ember, Wildfire:** a little quicker and a little heavier; finishers raise pillars of flame ahead that launch raiders and leave them burning, and the heavy cuts set raiders alight, so they keep losing health for a few seconds. With the spear it fights with spear moves of its own (jabs, a twirl in a ring of fire, a rising stab, an overhead slam, air stabs and a plunge, each trailing phoenix fire), and every hit that lands scatters burning phoenix feathers.
  - **Bokator, Lion's Way:** a little quicker to recover and a tenth heavier, with more weight on every hit; the fourth light hit, the running attack, the third heavy and a max charge send a golden guardian lion leaping over his shoulder to pounce on the raiders ahead (two lions on the max charge). Bare-handed he fights with real Bokator strikes of his own: elbows, knees, a push kick, a flying knee and a downward elbow smash.
  - **Angkor Warrior, Bayon Ranks:** a touch slower to strike, longer in reach and about a sixth heavier, and his heavy opener holds through blows; the fourth light hit and the running attack call a carved soldier of the Bayon's reliefs out of the ground ahead, the third heavy two and a max charge three, each stepping out of the stone in his own shape, thrusting once at the raiders before it and crumbling to sandstone.
- **Four techniques per Shade, on every weapon:** press light after a heavy: `K J`, `K K J`, `K K K J` and `Air K J`. A technique calls out its name in the Shade's colors with a ring of sparks and a blade ring:
  - **Moss:** Root Snare (a low root lash that snares a thrown raider, a bramble bursting under them), Bramble Wall (an armored chop that raises four thorns ahead), Grove Wrath (a launcher that rings the Shade with thorns), Seedfall (a diving plunge that plants two thorns).
  - **Firefly:** Lantern Dash (a four-hit rush in afterimages), Glowstorm (a spinning drive that pulls raiders in and looses fireflies), Swarm Crescendo (darts after the raider and launches it into six fireflies), Firefly Rain (an air whirl that looses four).
  - **Antler Spirit:** Antler Toss (an armored rush that throws the raider back over the Shade's shoulder), Herd Charge (an armored rush with two spirit stags), Earthshaker (a stomp that quakes every grounded raider on screen), Skyfall Antler (a dive that lands in a shockwave and a stag).
  - **Blue:** Hoarfrost Draw (a long-reach draw that freezes), Winter Edge (a spinning flurry that freezes), Shatterpoint (a thrust that shatters ice at once for the shatter hit on top: try `K K K J`, the third heavy freezes them first), Frostfall (an air spike that freezes).
  - **Ember:** Cinder Sweep (a low sweep that sets the raider burning), Flame Wall (an armored chop that raises three flame pillars ahead), Phoenix Rise (a launcher that sets the raider alight and rings the Shade with flame), Meteor Brand (a diving plunge that lands in two flame pillars).
  - **Bokator:** Elbow Crush (an armored overhead elbow that knocks down), Naga Knee (a rising knee launcher), Lion's Pounce (a lunging strike that sends a lion pouncing ahead), Falling Elbow (a diving elbow from the air).
  - **Angkor Warrior:** Gate of Victory (an armored overhead chop that raises a carved soldier ahead), Churning of the Sea (a spinning flurry that pulls raiders in and knocks them down), Bayon March (a marching thrust that stops on the raider it reaches, with two carved soldiers thrusting ahead of him), Terrace of Elephants (a dive from the air that lands in a shockwave).
- **An ultimate per Shade:** hits and damage taken fill the ULT bar. When it's full, time freezes for a cut-in with the Shade's portrait while it plays its own PixelLab ultimate animation, and the hero is invincible throughout:
  - **Thornwood Requiem (Moss):** the blade is planted and waves of brambles burst out to both edges of the screen, then bloom under every raider at once.
  - **Swarm Nova (Firefly):** the Shade rises and looses a swarm of fireflies that hunts every raider, then calls it home and bursts as a golden nova.
  - **Spirit Stampede (Antler Spirit):** herds of spirit stags thunder across the screen from both edges, then the great stag tramples everything.
  - **Absolute Zero (Blue):** time stops; the Shade cuts every raider in passing and freezes it, then sheathes the blade and all the ice shatters at once.
  - **Phoenix Pyre (Ember):** the Shade raises its blade into a column of fire, waves of flame pillars roll out to both edges, then a phoenix bursts from the blade, sweeps low across the field and back, and dives into the middle in an inferno.
  - **Pounding the Lion (Bokator):** he bows in the Bokator salute, slams the ground in a burst of gold and throws every raider up, then a pride of eight golden guardian lions, like the rows of stone lions on Angkor's stairs, rises out of the gold two at a time, spreading out from his sword. Each is its own size and crouches a beat of its own, so they bound off out of step: half cross the field one way, high over the half running the other way, then they pounce on the middle one after another, the big leader last as he pounds the ground again and breaks it open in a pillar of gold.
  - **March of the Bayon (Angkor Warrior):** he raises his dav and its blade blazes while the carved army of the Bayon steps out of the stone across the whole field, one rank thrusting the way he faces and a second the other way, then he leaps and chops and the ground splits under every raider.
- **Juggles** with decay, one ground bounce and one wall bounce per juggle.
- **7 playable heroes:** the Moss, Firefly, Antler Spirit, Blue and Ember Shades, and two Khmer fighters of the Angkor age: Bokator, and the Angkor Warrior, a soldier of the Bayon's battle reliefs with a round shield on his back and a gold dav. Play opens a hero select screen with animated previews, each card naming the hero's style and ultimate; the pick is saved. After a fall, Continue opens the same list as **Continue as**, so you can fight on as any hero, keeping the score, the weapon in hand and the ULT bar.
- **5 lives a run:** shown as hearts on the HUD. Every fall costs one, and a restart or a new mission gives none back. Lose the last one and it is Game over: the run starts again from mission 1. Each Shade has its own PixelLab sprite set and its own glow: sword smear, slash wave, hit sparks, charge glow and a trail of motes around it (a whole swarm for the Firefly Shade).
- **Twelve missions, one long road:** it starts in six painted forests, from sunrise to night (Pine Ridge, Old Grove, Bamboo Pass, Raider Camp, Ember Woods, Firefly Hollow), then leaves the woods for four painted desert roads from dawn to night: **Sandstorm Pass** (a red-rock canyon in a dawn sandstorm), **Iron Works** (the raiders' foundry at a smoggy midday), **Mirage Temple** (a half-buried sun temple at dusk) and **Warden's Fortress** under a blood moon, guarded by the **Warden Ox**. Out of that night the road walks on into two painted temples: **Angkor Wat** at dawn (the five towers against the rising sun across the moat, ending at the **Naga Raja** in the raised sanctuary) and the **Bayon** at dusk, the finale, where the **Bayon Guardian** wakes before the great stone face. Each road walks on from the last: it opens on a piece of the road before it, and from the canyon on, on the last road's gate smashed open behind you (the forest palisade, the raider barricade, the foundry's blast door, the temple door, the Warden's gate, Angkor's naga gate). Each mission has its own boss and raiders in waves; a boss met earlier on a road is a mid-boss. Every boss has armor, a swipe, a charge and a shockwave slam, and marks the ground in red before it hits.
- **Hills, banks and platforms:** every road rises and falls like a Metal Slug stage, with ramps, ledges, temple steps and stairs, sheer banks with real rock, iron or stone faces you jump up, and each road's own decks (plank trestles, canyon scaffolds, iron catwalks, temple slabs, fortress ramparts, sandstone lintels) you can jump onto, stand on, fight from and drop through (down + jump). Everything follows the ground: fighters, crates, pickups, fire pots, shockwaves and summons. Raiders use it as well: raiders that fight up close hop up after you and drop off decks to chase you, and raiders that fight at range climb onto a deck and throw down at you.
- **Living roads:** each road is PixelLab art in layers that scroll at their own speed, and its air keeps moving while you stand still: mist and birds over the pines, light shafts and drifting motes in the grove, falling leaves in the bamboo and the autumn woods, campfire embers and smoke in the raider camp, fireflies at night; a sandstorm that swells and dies with gusts, rolling dust, a dust devil, vultures and tumbleweeds in the canyon; furnace glow, spark showers, chimney smoke, steam bursts, heat shimmer and ash at the iron works; mirage on the horizon, blue brazier fire, trickling sand and bats at the temple; torches, lightning, embers, crimson mist and rippling pennants at the fortress; light shafts from the rising sun, egrets, glints on the moat, butterflies, frangipani petals and incense smoke at Angkor Wat; bats, fire bowls, embers, fireflies and a canopy of fig roots over the fight at the Bayon. Grass, ferns, scrub, chains and spikes in front of the fighters move with it.
- **16 enemies, all drawn from PixelLab sprite sheets:**
  - up close: **Raider** (punches), **Scrap Scavenger** (pipe smash, metal sparks), **Red Cutter** (stab and lunge), **Jackal Runner** (fast, claws and a pouncing rush), **Dune Assassin** (double cut, vanishes and reappears behind you), **Vulture Spearman** (long spear thrust);
  - at range: **Knife Slinger** (knives), **Crossbow Sentry** (slow aim, fast bolt that knocks you down), **Fire-Pot Bomber** (pots lobbed to land where you stand, then a patch of fire), **Mirage Witch** (sand blasts, slips away in a puff of sand when you close in). Knives and bolts can be hit back;
  - tough: **Bulwark** (shield blocks light hits from the front until a heavy, charged, launching or diving hit, or a hit from behind), **Brass Juggernaut** (armor shrugs off small hits, a haymaker that knocks down), **Sand Scorpion** (so low that high slashes pass over it: sweep it or pogo on it).
  - Struck enemies throw off what they are made of: sparks from metal, chips from stone, shards from shell, glowing sand from the witch.
- **Game feel:** hitstop, screen shake, a zoom punch and camera kick on big hits, impact rings and speed lines, damage numbers sized by damage, a combo timer and combo results, a red vignette when hurt or low on health, red wind-up flashes on raiders, red danger zones under the boss's slams and charges, off-screen enemy arrows, pickup beams, KO bursts, footstep dust, and slow motion on the final KO.
- **Sound:** every effect and the soundtrack (title, battle and boss tracks) are synthesized, no audio files. Combat sounds (swings, hits, shouts) are built sample by sample once, a few takes each, when the sound starts, and then play as one buffer each, so a fast combo costs almost nothing. Each weapon has its own swing and hit. A hit is a sharp crack, a two-band slap near 1.2 kHz and 400 Hz, and a body of struck resonant modes pitched where phone speakers can play it, plus the weapon's own voice: knuckles, a slicing blade that rings, a spear's wooden shaft knocking, an axe crunching through bone. A swing is air plus a thin whistle and starts early, so its peak lands on the strike. The dash is a scuff and thump from the feet, a whoomp of air and the cloak snapping (the air dash has no feet in it). Combat sounds are panned to where they happen on screen, swings and dashes sweep the way they travel, and the hero's hits rise a little in pitch as a combo grows. Effects have their own gentle compressor, so hits keep their punch and do not pump the music. Shouts come from a small voice synth: a glottal pulse through vowel formants, with breath, a rasp and a crackle at the end. Raiders grunt when hit and give a Metal Slug style scream when they go down; the boss roars. How to play → Sounds plays every sound and every take. Sounds fired at the same moment are merged, and each kind has a cap on how many play at once. Everything runs through a small room reverb, a soft top-end roll-off and a compressor.
- **First-time tips** for new players (moving, crates, weapons, launchers, dashing, knives, shields, the ultimate), shown once each, and a tips page in How to play that covers every enemy.

## How it's built

- **Modules by job.** `src/data/` holds the tuning tables, `src/sim/` the 60 Hz simulation,
  `src/render/` the canvas drawing, `src/audio/` the synthesized sound, `src/input/` and `src/ui/`
  the browser side, and `src/main.js` wires them together. See `docs/architecture.md` at the repo root.
- **Fixed timestep.** Game logic runs at exactly 60 ticks per second (`src/boot/fixed-step.js`), and
  rendering is separate. Frame data stays exact on any monitor.
- **Data-driven moves.** Every move is a `defineMove({ name, frames: [startup, active, recovery], damage,
hitbox, knockback, ... })` entry in `src/data/weapons/<weapon>/` or `src/data/enemies/moves/`, and every
  enemy type is an entry in `src/data/enemies/types/`:

  ```js
  L1: defineMove({ name: 'Jab', frames: [4, 2, 9], damage: 4, hitbox: [4, -28, 14, 7], knockback: [1, 0],
    next: { light: 'L2', heavy: 'K1' }, forward: 0.6, windup: { ... }, strike: { ... } }),
  ```

  To balance the game, edit these numbers. `next` defines which move a buffered press cancels into
  during recovery. Charge timing is `CHARGE_TAP` / `CHARGE_LEVEL1` / `CHARGE_MAX` in `src/config.js`.
  Each Shade's style (`src/data/styles/<shade>.js`) is a tempo that scales every move plus patches that add
  signatures (`thorns`, `fireflies`, `stags`, `freeze`, `pillars`, `burn`, `lions`, `soldiers`) to chosen moves, plus the Shade's four techniques
  (`src/data/styles/techniques/<shade>.js`, unscaled), and each Shade's ultimate has its timeline and hits
  in `src/data/ultimates/`.

- **Input buffer.** A press is remembered for 8 ticks (`src/sim/input/read-input.js`).
- **Attack tokens.** Only two raiders attack at once; the rest circle at a distance.
- **Hero sprites.** The five Shades are drawn from PixelLab sprite strips (Bokator and the Angkor Warrior from ChatGPT sheets): the Moss Shade in
  `assets/sprites/hero/` (see `hero.json`), the others in `assets/sprites/heroes/<id>/` with the same
  animations and frame counts. `src/data/heroes.js` lists them and `src/art/hero-themes.js` holds each
  one's glow colors. A Shade's strips load the first time it is picked. The world is simulated at 384×216 and drawn at 2×, the hero
  at its native sprite resolution. Each attack's strike frame is shown while its hitbox is active
  (`src/data/hero-sprites.js`).
- **Weapon variants.** PixelLab drew every animation with the sword, so `tools/bake_hero_weapons.py`
  builds the other weapons from those frames into `assets/sprites/hero/arsenal/`, one strip per animation
  with four rows: sword, fists, spear, axe. Rebuild with `pip install numpy scipy pillow && python3 tools/bake_hero_weapons.py`
  (add `firefly`, `antler`, `blue`, `ember`, `bokator` or `angkor` for the other heroes).
- **Enemy sprites.** Each enemy is one PNG in `assets/sprites/enemies/` with a row per strip (idle, walk,
  attack, hurt, knock-out, and a lunge, slam or charge where it has one), described in
  `src/data/enemies/enemy-sprites.js`. `src/sim/enemy-animation.js` picks the frame for each state: the
  wind-up leads to the strike frame, which holds while the hitbox is out, and the knock-out strip doubles
  for juggles, falls and getting up. The enemies' small skeleton (`src/sim/pose/`) still runs, as a
  fallback drawing and for the "!" warning.
- **Behavior lock.** `test/regression/` replays two long bot-played runs and checks every 30th tick and
  every rendered frame against recorded fixtures, so a refactor cannot change the game by accident.

## Porting to Godot later

| Here                                               | Godot                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| `src/data/weapons/` and `src/data/enemies/` tables | Resource files                                 |
| `state` strings                                    | an enum plus a `match` block                   |
| `tick(game)` in `src/sim/tick.js`                  | `_physics_process` at 60 Hz                    |
| `attackBox()` hitboxes on active frames            | Area2D shapes switched on during active frames |
