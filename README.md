# Steel & Dust

A 2D pixel-art melee brawler prototype, inspired by Metal Slug's stages but with weapons instead of guns. It's written in plain JavaScript and Canvas, in a single `index.html` with no build step.

## Run it

Play it online at **https://novsochetra.github.io/fighting-games/**, or serve the folder and open `index.html` in a browser.

The page is just the game: a 16:9 screen that fills the window, with a title menu (Play, How to play, Settings, Full screen), a pause menu, and game over and stage clear screens. On a phone, Play also switches to full screen and landscape where the browser allows it. On iPhone, use *Add to Home Screen* to play full screen.

## Controls

| Action | Keyboard | Touch | Gamepad |
| --- | --- | --- | --- |
| Move | ← → or A D | drag on the left half | stick or d-pad |
| Jump | ↑ / W / Space (hold ← or → to jump that way) | JUMP | A |
| Dash (invincible) | Shift, or tap ← → twice; once more in the air | DASH | B |
| Light attack | J or Z | ATTACK (hold to keep the combo going) | X |
| Heavy attack | tap K or X | HEAVY | Y |
| Charge attack | hold K, let go (level 1 after 0.4 s, max after 1.1 s) | hold HEAVY | hold Y |
| Launcher | ↓ + K, or ↑ + K to launch and jump after the enemy | stick up or down + HEAVY | stick + Y |
| Air dive | in the air, ↓ + K | in the air, stick down + HEAVY | stick down + Y |
| Dash attack | J during a dash (K for a sliding launcher) | ATTACK during a dash | X during a dash |
| Ultimate | L or U when the ULT bar is full | ULT | RB or RT |
| Pause | P or Esc | II | Start |
| Full screen / sound | F / M | menu | menu |

Menus work with the arrow keys and Enter (Esc goes back), with a gamepad (A / B), or by touch.

## Settings

Saved in the browser: music and sound volume, difficulty (Easy, Normal, Hard), auto-aim (attacks turn toward the nearest raider, on by default on touch screens), hold ATTACK to combo, screen shake (off / low / full), flashes, damage numbers, touch controls (auto / on / off), button size, vibration, and **Training tools**. With Training tools on, 1–4 swap weapons, 0 fills the ULT bar, H shows hitboxes and frame data, and the pause menu has a weapon switch.

## What's in it

- **4 weapons:** Fists (unbreakable), Sword, Spear, Axe, each drawn in the hero's hands with its own smear colour (gold, green, ice, ember). Weapons drop from crates and break after a set number of hits, with a warning when they start to crack.
- **Combo chains**, each with the same structure:
  - `J J J J` ground string
  - `J J K` launcher branch
  - `↑+K` launcher
  - `Air J J K`, ending in a spike that bounces the enemy off the ground
  - `Air ↓+K` dive
  - `↓+K` launcher, and `↑+K` to launch and follow the enemy up
- **Charge attacks:** hold K for level 1 or max. Every weapon has its own pair: Burst Straight and Tiger Rush (fists), Iai Rush and Crescent Moon, a slash wave (sword), Comet Lunge and Cyclone, which pulls enemies in (spear), Earthsplitter and Cataclysm, which launches every grounded enemy (axe). Holding K at the end of a string charges straight out of it.
- **Ultimate, Shade Requiem:** hits and damage taken fill the ULT bar. When it's full, time freezes, the hero teleports through every enemy on screen for eight cuts, then launches them all with a screen-wide slash. The hero is invincible throughout.
- **Juggles** with decay, one ground bounce and one wall bounce per juggle.
- **3 zones** of raiders that arrive in waves, plus a boss (Warden Ox) with armor, a charge attack and a shockwave slam.
- **Game feel:** hitstop, screen shake, a zoom punch and camera kick on big hits, impact rings and speed lines, damage numbers sized by damage, a combo timer and combo results, a red vignette when hurt or low on health, red wind-up flashes on raiders, red danger zones under the boss's slams and charges, off-screen enemy arrows, pickup beams, KO bursts, footstep dust, and slow motion on the final KO.
- **Music:** a small synthesized soundtrack (title, battle and boss tracks), no audio files.
- **First-time tips** for new players (moving, crates, weapons, launchers, dashing, the ultimate), shown once each.

## How it's built

- **Fixed timestep.** Game logic runs at exactly 60 ticks per second, and rendering is separate. Frame data stays exact on any monitor.
- **Data-driven moves.** Every move is defined in the `WEAPONS` and `EMOVES` tables near the top of the script. Charge timing is `CH0`/`CH1`/`CH2` and the ultimate's numbers are in `ULT`:

  ```js
  // mv(name, startup, active, recovery, damage, hitbox[x,y,w,h], knockback[x,y], extras)
  L1: mv('Jab', 4, 2, 9, 4, [4,-28,14,7], [1.0,0], { next:{ L:'L2', K:'K1' }, ... })
  ```

  To balance the game, edit these numbers. `next` defines which move a buffered press cancels into during recovery.
- **Input buffer.** A press is remembered for 8 frames.
- **Attack tokens.** Only two enemies attack at once; the rest circle at a distance.
- **Hero sprites.** The player is the Moss Shade, drawn from the PixelLab sprite strips in `assets/sprites/hero/` (see `hero.json`). The game logic runs at 384×216 and the canvas is 768×432, so the world is drawn at 2× and the hero at its native sprite resolution. Each attack's strike frame is shown while its hitbox is active (`HERO_MOVES`).
- **Weapon variants.** PixelLab drew every animation with the sword, so `tools/bake_hero_weapons.py` builds the other weapons from those frames: it finds the blade in each frame, erases it, recolours the slash smear, and draws a spear or an axe along the same grip line (fists get the blade removed). The result is `assets/sprites/hero/arsenal/`, one strip per animation with four rows: sword, fists, spear, axe. Frames the detector gets wrong are fixed by hand in the script's `OVERRIDES`. Rebuild with `pip install numpy scipy pillow && python3 tools/bake_hero_weapons.py`.
- **Procedural pixel art.** Enemies are still drawn from a small skeleton (torso, arms, legs, weapon angle). Each move has a wind-up pose `W` and a strike pose `S`, and the same skeleton still drives hitboxes for the player.

## Porting to Godot later

| Here | Godot |
| --- | --- |
| `WEAPONS` / `EMOVES` tables | Resource files |
| `state` strings | an enum plus a `match` block |
| `tick()` | `_physics_process` at 60 Hz |
| `box()` hitboxes on active frames | Area2D shapes switched on during active frames |

## Deploy

Every push to `main` publishes `index.html` and `assets/` (sprites, icons and the web app manifest) to GitHub Pages via `.github/workflows/pages.yml`.
