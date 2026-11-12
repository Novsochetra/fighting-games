# Art for the arcade

What the arcade's home page shows for the game, named by `game.json`. The game never loads these,
so no offline save keeps them. Each is the game itself in a browser, saved as a JPEG, in Khmer and
Khmer numerals (`kit_luy` in `localStorage`: `{"settings":{"lang":"km","numerals":"khmer"}}`).

| File                    | Size      | `game.json`  | What it shows                                                        |
| ----------------------- | --------- | ------------ | -------------------------------------------------------------------- |
| `banner.jpg`            | 1920×1080 | `banner`     | the title's name and pig over the market, without its buttons        |
| `poster.jpg`            | 720×1560  | `poster`     | the same, held upright                                               |
| `change-for-a-note.jpg` | 960×540   | `screenshot` | a change question on level 3, the ×3 stamp on and coins in the air   |

To take them again:

- `banner.jpg`: a 960×540 window at 2×, the title screen with `.title-actions`, `.stats` and
  `.rank` hidden and the pig at 168×154.
- `poster.jpg`: the same in a 360×780 window at 2×.
- `change-for-a-note.jpg`: a 960×540 window at 2×, only − in the mix, twelve right answers in,
  caught a quarter of a second after the last; scaled down to 960×540.
