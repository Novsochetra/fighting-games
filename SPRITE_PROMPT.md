# Sprite Request: Steel & Dust (2D pixel-art melee brawler)

You are making pixel-art sprite sheets for a side-scrolling melee brawler. The style is detailed, lively 1990s arcade pixel art, in the spirit of Metal Slug: generous animation, squash and stretch, and secondary motion. **All characters must be original designs, not copies of Metal Slug or any other game's characters.**

The game runs at 60 frames per second and plays sprites at roughly 8 to 15 sprite frames per second. Attacks are timed in code, so the frame counts below matter.

---

## 1. Global rules (apply to every sheet)

- **Cell size:**
  - Kai, the Raider and the Cutter: **96×64 px**
  - Warden Ox (boss): **128×96 px**
  - Effects and props: **32×32 px**
  - Pickup icons: **16×16 px**
- **Character height:** about **40 px** standing for Kai and the raiders, about **54 px** for the boss.
- **Anchor point:** feet centered at the bottom of the cell, at **(48, 60)** for 96×64 cells and **(64, 92)** for 128×96 cells. The anchor must be in the same place on **every frame**, or the character will jitter in game.
- **Facing right only.** The game mirrors sprites for facing left.
- **Pixel rules:**
  - Hard-edged pixels only: no anti-aliasing, blur, gradients or soft shadows.
  - A 1 px dark outline in **#140f1a** around each character.
  - Light comes from the **top-left**.
  - **Transparent background.**
  - One consistent pixel size throughout: no mixed resolutions and no scaled-up pixels inside a sheet.
- **Layout:** one animation per **row**, frames ordered **left to right**, with no gaps between cells.
- **Do not bake in effects.** No screen shake, white hit flashes, slash trails, motion blur or freeze frames; the game adds these in code. A **smear frame** drawn on the body or weapon during a strike is welcome, because it is part of the animation.
- **Attack structure:** every attack goes **anticipation (wind-up) → strike frame (with smear) → follow-through → settle back to guard**. The wind-up should read clearly from a distance.

---

## 2. Deliverables

For each sheet, deliver:

1. A **PNG** sprite sheet.
2. A **JSON** file in this format:

```json
{
  "sheet": "kai_fists.png",
  "cell": [96, 64],
  "anchor": [48, 60],
  "rows": [
    { "name": "idle",  "row": 0, "frames": 6, "loop": true },
    { "name": "L1",    "row": 12, "frames": 4, "loop": false, "hitFrame": 1 },
    { "name": "L4",    "row": 15, "frames": 8, "loop": false, "hitFrame": 3, "loopRange": [3, 5] }
  ]
}
```

- `hitFrame`: index of the frame where the attack connects. Required for every attack row.
- `loopRange`: only for attacks with a loopable middle section (spin attacks, charges, dives).

Sheets to deliver, in priority order:

1. `kai_fists`
2. `kai_sword`
3. `kai_spear`
4. `kai_axe`
5. `raider`
6. `cutter`
7. `warden_ox`
8. `fx_props`

---

## 3. Main character: Kai

**Look:** a lean desert wanderer with a teal jacket, dark navy pants, brown boots and a red headband. A **long red scarf** trails behind him and should move on every frame as secondary motion. His fighting stance is confident and slightly forward-leaning.

**Palette:**

| Part | Main | Shadow |
| --- | --- | --- |
| Skin | #eab48c | #b97f5e |
| Hair | #2a1d1a | |
| Headband | #d8432f | |
| Jacket | #2f7f7c | #1f5652 |
| Pants | #2c2f4a | #1d1f33 |
| Boots | #4a3326 | #33231a |
| Scarf | #e04a33 | #a3301f |
| Gloves | #f2e0c0 | |
| Steel (weapons) | #dfe6ef | #8c98a8 |
| Wood (handles) | #7b4e2c | |
| Gold (sword guard) | #d9a441 | |

Make **one sheet per weapon**: fists, sword, spear and axe. Kai holds the weapon in every pose, so all rows are repeated on each sheet.

**Weapons:**

- **Sword:** about 15 px blade, gold crossguard.
- **Spear:** about 29 px long with a steel head and a small red tassel.
- **Axe:** about 13 px handle with a wide single-bit head. At rest it sits on his shoulder.

### 3a. Shared rows (every Kai sheet, in this order)

| Row | Name | Frames | Loop | Description |
| --- | --- | --- | --- | --- |
| 0 | idle | 6 | yes | Fighting stance, breathing, scarf waving |
| 1 | walk | 8 | yes | Walk forward in stance (played backward for walking back) |
| 2 | jump_rise | 2 | no | Knees tucked, going up |
| 3 | jump_fall | 2 | no | Legs extending, coming down |
| 4 | land | 2 | no | Squash on landing |
| 5 | dash | 4 | no | Low, fast forward lean (dodge move) |
| 6 | hurt | 3 | no | Hit from the front, head and torso snap back |
| 7 | juggle | 3 | yes | Tumbling helplessly in the air after a launch |
| 8 | down | 2 | no | Lying on his back |
| 9 | getup | 5 | no | Getting up from lying on his back |
| 10 | ko | 4 | no | Knocked flying, bounces once, lies still |
| 11 | win | 4 | yes | Victory pose, weapon or fist raised |

### 3b. Attack rows (rows 12 to 22 on every Kai sheet)

| Row | Name | Fists | Sword | Spear | Axe | Frames |
| --- | --- | --- | --- | --- | --- | --- |
| 12 | L1 | Jab | Slash (diagonal down-forward) | Poke (straight thrust) | Chop (overhead down) | 4–5 |
| 13 | L2 | Cross (rear-hand punch) | Return Cut (upward slash) | Low Poke | Side Hack (horizontal) | 5 |
| 14 | L3 | Hook | Spin Slash (full turn) | Wide Sweep (big arc) | Overhead (heavier chop) | 5–6 |
| 15 | L4 | Spin Kick (finisher) | Piercing Thrust (lunging stab) | Whirlwind (spear spinning around him, loopable middle) | Whirling Axe (spinning, loopable middle) | 6–8 |
| 16 | LLK | Rising Knee (launcher) | Rising Dragon (big upward slash) | Vault Lift (sweeps the enemy upward) | Lumberjack Lift (upward heave) | 6 |
| 17 | K1 | Roundhouse kick | Cleave (big two-handed overhead) | Lunge (long-range thrust, steps far forward) | Ground Smash (slams into the ground, rocks fly) | 6–7 |
| 18 | UK | Uppercut | Sky Cut (upward) | Skyward Lift | Uppercleave | 6 |
| 19 | AL | Air Kick | Air Slash | Air Poke | Air Chop | 4 |
| 20 | AL2 | Air Punch | Air Rising Cut | Air Swing | Air Hack | 4 |
| 21 | AK | Axe Kick (heel slams down) | Meteor Slash (downward) | Hammer Down (spear smashes down) | Skull Splitter (axe smashes down) | 5 |
| 22 | ADK | Dive Kick (diagonal down) | Plunge (sword pointing straight down) | Javelin Drop (spear pointing down-forward) | Meteor Drop (axe down) | 3: wind-up, dive (held), landing |

**Notes on the attacks:**

- **L1 to L4** chain into a four-hit combo, so each one should end close to the guard pose for clean chaining.
- **Launchers** (LLK and UK) end with Kai's body stretched upward.
- **Air rows** (AL, AL2, AK) are drawn in the air, with legs bent and no ground contact.
- **Whirlwind and Whirling Axe:** the middle frames should loop seamlessly.

---

## 4. Enemies (original desert raiders)

### Raider (`raider`, 96×64)

**Look:** khaki uniform (#8f8650, shadow #68623a), sand-colored cloth turban and face mask (#d9c79a), white eye glints, dark boots, bare fists. Medium build, scrappy.

| Row | Name | Frames | Notes |
| --- | --- | --- | --- |
| 0 | idle | 4 | Loop |
| 1 | walk | 6 | Loop |
| 2 | punch | 5 | Long, readable wind-up (held for 2 frames), then a straight punch. `hitFrame` = 3 |
| 3 | hurt | 2 | |
| 4 | juggle | 3 | Loop |
| 5 | down | 2 | |
| 6 | getup | 4 | |
| 7 | ko | 4 | |

### Cutter (`cutter`, 96×64)

**Look:** the same body as the Raider, but with a blue-gray uniform (#6c7f8f, shadow #4b5a66), a red mask and turban (#b0473a), and a short knife.

Same rows as the Raider, except row 2 is replaced by two rows (the rows after them move down by one):

| Row | Name | Frames | Notes |
| --- | --- | --- | --- |
| 2 | stab | 5 | Quick knife thrust. `hitFrame` = 3 |
| 3 | lunge | 6 | Crouches, then runs forward with the knife out; loopable middle |

### Warden Ox (boss, `warden_ox`, 128×96)

**Look:** a huge armored brute with a dark red armor tunic (#7a2f2f), a pale steel chest plate (#b8b2a4), a steel helmet with small horns, glowing yellow eyes (#ffd36b), a heavy spiked wooden club, and bulky arms. He should feel slow and heavy.

| Row | Name | Frames | Notes |
| --- | --- | --- | --- |
| 0 | idle | 4 | Loop, heavy breathing |
| 1 | walk | 6 | Loop, stomping |
| 2 | swipe | 6 | Horizontal club swing. `hitFrame` = 3 |
| 3 | slam | 7 | Big overhead into the ground. Long wind-up (3 frames). `hitFrame` = 4 |
| 4 | charge | 6 | Shoulder-first running charge; loopable middle |
| 5 | hurt | 2 | |
| 6 | juggle | 3 | |
| 7 | down | 2 | |
| 8 | getup | 5 | |
| 9 | ko | 5 | |

---

## 5. Effects and props (`fx_props`, 32×32 cells)

| Row | Name | Frames | Notes |
| --- | --- | --- | --- |
| 0 | hit_spark_small | 4 | White core with a yellow starburst |
| 1 | hit_spark_big | 5 | Larger starburst for heavy hits |
| 2 | blade_spark | 4 | Thin, sharp cyan-white streaks for blade hits |
| 3 | dust_puff | 5 | Sand-colored (#e2b57d) |
| 4 | land_dust | 4 | Low, wide puff for landings |
| 5 | shockwave | 6 | Jagged rocks bursting out of the ground and settling |
| 6 | crate | 1 | Wooden supply crate, about 16×15 px |
| 7 | crate_break | 4 | Crate splintering apart |

**Pickup icons (16×16 each, one row):** sword, spear, axe, ration can (a small tin with a red label).
