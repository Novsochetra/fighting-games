# Steel & Dust

A 2D pixel-art melee brawler prototype, inspired by Metal Slug's stages but with weapons instead of guns. It's written in plain JavaScript and Canvas, in a single `index.html` with no build step.

## Run it

Open `index.html` in a browser. Press **Enter** or click the screen to start.

## Controls

| Action | Keys |
| --- | --- |
| Move | ← → or A D |
| Jump | Space or C |
| Light attack | J or Z |
| Heavy attack | K or X |
| Launcher | hold ↑ / W + K |
| Air dive | in the air, hold ↓ / S + K |
| Dash (invincible) | L or Shift |
| Jump after a launcher hits | Space |
| Pause | P or Esc |
| Hitbox and frame data view | H |
| Practice weapon swap | 1 2 3 4 |
| Sound | M |

Touch controls appear on phones and tablets.

## What's in it

- **4 weapons:** Fists (unbreakable), Sword, Spear, Axe. Weapons drop from crates and break after a set number of hits.
- **Combo chains**, each with the same structure:
  - `J J J J` ground string
  - `J J K` launcher branch
  - `↑+K` launcher
  - `Air J J K`, ending in a spike that bounces the enemy off the ground
  - `Air ↓+K` dive
- **Juggles** with decay, one ground bounce and one wall bounce per juggle.
- **3 zones** of raiders that arrive in waves, plus a boss (Warden Ox) with armor, a charge attack and a shockwave slam.
- **Game feel:** hitstop, screen shake, hit flashes, impact sparks, weapon trails, a scarf with secondary motion, and slow motion on the final KO.

## How it's built

- **Fixed timestep.** Game logic runs at exactly 60 ticks per second, and rendering is separate. Frame data stays exact on any monitor.
- **Data-driven moves.** Every move is defined in the `WEAPONS` and `EMOVES` tables near the top of the script:

  ```js
  // mv(name, startup, active, recovery, damage, hitbox[x,y,w,h], knockback[x,y], extras)
  L1: mv('Jab', 4, 2, 9, 4, [4,-28,14,7], [1.0,0], { next:{ L:'L2', K:'K1' }, ... })
  ```

  To balance the game, edit these numbers. `next` defines which move a buffered press cancels into during recovery.
- **Input buffer.** A press is remembered for 8 frames.
- **Attack tokens.** Only two enemies attack at once; the rest circle at a distance.
- **Procedural pixel art.** Characters are drawn from a small skeleton (torso, arms, legs, weapon angle) at 384×216 and scaled up with nearest-neighbor. Each move has a wind-up pose `W` and a strike pose `S`. Real Aseprite sprites can replace the drawing later without changing the frame data.

## Porting to Godot later

| Here | Godot |
| --- | --- |
| `WEAPONS` / `EMOVES` tables | Resource files |
| `state` strings | an enum plus a `match` block |
| `tick()` | `_physics_process` at 60 Hz |
| `box()` hitboxes on active frames | Area2D shapes switched on during active frames |
