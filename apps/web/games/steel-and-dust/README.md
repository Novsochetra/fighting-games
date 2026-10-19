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

Saved in the browser: music and sound volume, difficulty (Easy, Normal, Hard), auto-aim (attacks turn toward the nearest raider, on by default on touch screens), hold ATTACK to combo, screen shake (off / low / full), flashes, damage numbers, touch controls (auto / on / off), joystick (fixed in the corner, or floating under your thumb), button size, vibration, and **Training tools**. With Training tools on, 1–4 swap weapons, 0 fills the ULT bar, H shows hitboxes and frame data, and the pause menu has a weapon switch.

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
- **Ultimate, Shade Requiem:** hits and damage taken fill the ULT bar. When it's full, time freezes, the hero teleports through every enemy on screen for eight cuts, then launches them all with a screen-wide slash. The hero is invincible throughout.
- **Juggles** with decay, one ground bounce and one wall bounce per juggle.
- **3 zones** of raiders that arrive in waves, plus a boss (Warden Ox) with armor, a charge attack and a shockwave slam.
- **5 enemy types:** Raiders and Cutters up close, **Slingers** (from zone 2) that keep their distance and throw knives you can jump, dash through or hit back, and **Bulwarks** (zone 3) whose shield blocks light hits from the front until a heavy, charged, launching or diving hit, or a hit from behind, breaks the guard.
- **Game feel:** hitstop, screen shake, a zoom punch and camera kick on big hits, impact rings and speed lines, damage numbers sized by damage, a combo timer and combo results, a red vignette when hurt or low on health, red wind-up flashes on raiders, red danger zones under the boss's slams and charges, off-screen enemy arrows, pickup beams, KO bursts, footstep dust, and slow motion on the final KO.
- **Sound:** every effect and the soundtrack (title, battle and boss tracks) are synthesized, no audio files. Combat sounds (swings, hits, shouts) are built sample by sample once, a few takes each, when the sound starts, and then play as one buffer each, so a fast combo costs almost nothing. Each weapon has its own swing and hit. A hit is a sharp crack, a two-band slap near 1.2 kHz and 400 Hz, and a body of struck resonant modes pitched where phone speakers can play it, plus the weapon's own voice: knuckles, a slicing blade that rings, a spear's wooden shaft knocking, an axe crunching through bone. A swing is air plus a thin whistle and starts early, so its peak lands on the strike. The dash is a scuff and thump from the feet, a whoomp of air and the cloak snapping (the air dash has no feet in it). Combat sounds are panned to where they happen on screen, swings and dashes sweep the way they travel, and the hero's hits rise a little in pitch as a combo grows. Effects have their own gentle compressor, so hits keep their punch and do not pump the music. Shouts come from a small voice synth: a glottal pulse through vowel formants, with breath, a rasp and a crackle at the end. Raiders grunt when hit and give a Metal Slug style scream when they go down; the boss roars. How to play → Sounds plays every sound and every take. Sounds fired at the same moment are merged, and each kind has a cap on how many play at once. Everything runs through a small room reverb, a soft top-end roll-off and a compressor.
- **First-time tips** for new players (moving, crates, weapons, launchers, dashing, knives, shields, the ultimate), shown once each.

## How it's built

- **Modules by job.** `src/data/` holds the tuning tables, `src/sim/` the 60 Hz simulation,
  `src/render/` the canvas drawing, `src/audio/` the synthesized sound, `src/input/` and `src/ui/`
  the browser side, and `src/main.js` wires them together. See `docs/architecture.md` at the repo root.
- **Fixed timestep.** Game logic runs at exactly 60 ticks per second (`src/boot/fixed-step.js`), and
  rendering is separate. Frame data stays exact on any monitor.
- **Data-driven moves.** Every move is a `defineMove({ name, frames: [startup, active, recovery], damage,
hitbox, knockback, ... })` entry in `src/data/weapons/<weapon>/` or `src/data/enemies/enemy-moves.js`:

  ```js
  L1: defineMove({ name: 'Jab', frames: [4, 2, 9], damage: 4, hitbox: [4, -28, 14, 7], knockback: [1, 0],
    next: { light: 'L2', heavy: 'K1' }, forward: 0.6, windup: { ... }, strike: { ... } }),
  ```

  To balance the game, edit these numbers. `next` defines which move a buffered press cancels into
  during recovery. Charge timing is `CHARGE_TAP` / `CHARGE_LEVEL1` / `CHARGE_MAX` in `src/config.js`,
  and the ultimate's numbers are in `src/data/ultimate.js`.

- **Input buffer.** A press is remembered for 8 ticks (`src/sim/input/read-input.js`).
- **Attack tokens.** Only two raiders attack at once; the rest circle at a distance.
- **Hero sprites.** The player is the Moss Shade, drawn from the PixelLab sprite strips in
  `assets/sprites/hero/` (see `hero.json`). The world is simulated at 384×216 and drawn at 2×, the hero
  at its native sprite resolution. Each attack's strike frame is shown while its hitbox is active
  (`src/data/hero-sprites.js`).
- **Weapon variants.** PixelLab drew every animation with the sword, so `tools/bake_hero_weapons.py`
  builds the other weapons from those frames into `assets/sprites/hero/arsenal/`, one strip per animation
  with four rows: sword, fists, spear, axe. Rebuild with `pip install numpy scipy pillow && python3 tools/bake_hero_weapons.py`.
- **Procedural pixel art.** Enemies are drawn from a small skeleton (`src/sim/pose/`, `src/render/fighters/`).
  Each move has a wind-up pose and a strike pose.
- **Behavior lock.** `test/regression/` replays two long bot-played runs and checks every 30th tick and
  every rendered frame against recorded fixtures, so a refactor cannot change the game by accident.

## Porting to Godot later

| Here                                               | Godot                                          |
| -------------------------------------------------- | ---------------------------------------------- |
| `src/data/weapons/` and `src/data/enemies/` tables | Resource files                                 |
| `state` strings                                    | an enum plus a `match` block                   |
| `tick(game)` in `src/sim/tick.js`                  | `_physics_process` at 60 Hz                    |
| `attackBox()` hitboxes on active frames            | Area2D shapes switched on during active frames |
