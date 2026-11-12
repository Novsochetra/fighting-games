# គិតលុយ (Kit Luy)

Quick mental maths in Khmer riel: a sum comes up on a banknote, four amounts stand under it, and the
clock is running. Plain JavaScript, native ES modules, run as they are written on the dev server;
the arcade's build joins them into one bundle (`apps/web/arcade/build-steps/bundle-game.js`).

Open it from the arcade home page, or go straight to `games/kit-luy/` on the dev server
(`npm run dev` at the repo root).

## How it plays

- A run starts with 25 seconds. A right answer pays riel and gives time back, less on each level;
  a wrong one costs 4 seconds and shows which answer was right.
- Five right answers in a row multiply the pay, up to ×5, and an answer inside 2 seconds earns a
  bonus. Six right answers raise the level, and with it the prices.
- The four sums are riel as a market uses it: adding two prices (Total), the change from a note
  (Change), buying several (Buy many) and sharing a bill (Share out). The chips on the title take
  a sum out of the mix, to practise the others.
- Every run's earnings go into the piggy bank, and the savings raise the player's rank, from
  Student to Tycoon.

## Controls

| Action         | Touch or mouse | Keyboard                       |
| -------------- | -------------- | ------------------------------ |
| Pick an answer | press it       | 1, 2, 3, 4 (or the number pad) |
| Pause, go on   | II             | Esc or P                       |
| Menus          | tap            | Tab and Enter; Esc steps back  |

Settings holds Sound, Music, Vibration (on phones that can), Language (ខ្មែរ or English) and
Numerals (១២៣ or 123). A new player starts in Khmer where the browser reads Khmer.

## Layout

| Folder          | Job                                                                  |
| --------------- | -------------------------------------------------------------------- |
| `src/data/`     | tuning, levels, the riel, ranks, both languages, sounds and the tune |
| `src/art/`      | the canvas colours and the pixel art (the pig, the coin)             |
| `src/sim/`      | the run: questions, choices, scoring, records; no DOM, no clock      |
| `src/app/`      | the screens' flow, and what shows and sounds each thing a run does   |
| `src/ui/`       | the page's views: HUD, question, menus, results, the two canvases    |
| `src/render/`   | paints the market, the pig and the effects on a 2D context           |
| `src/fx/`       | the effects' motion: coins, sparks, notes, the pig's moods           |
| `src/audio/`    | synthesized sounds and the tune (Web Audio)                          |
| `src/input/`    | presses, keys, the hidden-tab pause                                  |
| `src/platform/` | the save in `localStorage`, the phone's buzz                         |

"Game: គិតលុយ" in `docs/architecture.md` tells the rest.

## Changing the balance

`src/data/tuning.js` holds the clock, the pay and the pauses, and `src/data/levels.js` each level's
prices. A change to either changes the recorded runs in `test/regression/fixtures/`: record them
again with `npm run test:regression -- -u` and read the diff.
