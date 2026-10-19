# Steel & Dust

A 2D pixel-art melee brawler prototype, inspired by Metal Slug's stages but with weapons instead of guns. It's written in plain JavaScript and Canvas, in a single `index.html` with no build step.

## Run it

Play it online at **https://novsochetra.github.io/fighting-games/**, or open `index.html` in a browser. Press **Enter** or click the screen to start.

## Controls

| Action | Keys |
| --- | --- |
| Move | ← → or A D |
| Jump | ↑ / W (hold ← or → to jump that way) |
| Dash (invincible) | tap ← or → twice; once more in the air |
| Light attack | J or Z |
| Heavy attack | tap K or X |
| Charge attack | hold K, let go (level 1 after 0.4 s, max after 1.1 s) |
| Launcher | ↓ + K, or ↑ + K to launch and jump after the enemy |
| Air dive | in the air, ↓ + K |
| Dash attack | J during a dash (K for a sliding launcher) |
| Ultimate | L or U when the ULT bar is full |
| Pause | P or Esc |
| Hitbox and frame data view | H |
| Practice | 1 2 3 4 swap weapons, 0 fills the ULT bar |
| Sound | M |

Space and Shift still work as keyboard shortcuts for jump and dash.

On phones and tablets a touch pad appears: an analog stick on the left (push up to jump, flick the same way twice to dash) and J, K and ULT buttons on the right.

## What's in it

- **4 weapons:** Fists (unbreakable), Sword, Spear, Axe. Weapons drop from crates and break after a set number of hits.
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
- **Game feel:** hitstop, screen shake, hit flashes, impact sparks, weapon trails, and slow motion on the final KO.

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
- **Hero sprites.** The player is the Moss Shade, drawn from the PixelLab sprite strips in `assets/sprites/hero/` (see `hero.json`). The game logic runs at 384×216 and the canvas is 768×432, so the world is drawn at 2× and the hero at its native sprite resolution. Each attack's strike frame is shown while its hitbox is active (`HERO_MOVES`). For now every weapon uses the sword animations.
- **Procedural pixel art.** Enemies are still drawn from a small skeleton (torso, arms, legs, weapon angle). Each move has a wind-up pose `W` and a strike pose `S`, and the same skeleton still drives hitboxes for the player.

## Porting to Godot later

| Here | Godot |
| --- | --- |
| `WEAPONS` / `EMOVES` tables | Resource files |
| `state` strings | an enum plus a `match` block |
| `tick()` | `_physics_process` at 60 Hz |
| `box()` hitboxes on active frames | Area2D shapes switched on during active frames |

## Deploy

Every push to `main` publishes `index.html` and `assets/` to GitHub Pages via `.github/workflows/pages.yml`.
