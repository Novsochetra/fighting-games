# Art for the arcade

What the arcade's home page shows for the game, named by `game.json`. The game never loads these,
so no offline save keeps them.

The banner and the poster are key art, not the game's screen: the home page lays its carousel,
title and buttons over them, so they paint the night market from behind the stall (the awning,
the stools and their customers, the counter) with none of the game's buttons. They are drawn from
the game's own styles and figures by `tools/kit-luy-key-art/`; paint them again after the stall's
look changes:

```bash
NODE_PATH=$(npm root -g) node tools/kit-luy-key-art/render.js
```

The screenshot is the game itself in a browser at 2×, in Khmer with Khmer numerals (`kit_luy` in
`localStorage`: `{"settings":{"lang":"km","numerals":"khmer"}}`), saved as a JPEG.

| File                  | Size      | `game.json`  | What it shows                                                      |
| --------------------- | --------- | ------------ | ------------------------------------------------------------------ |
| `banner.jpg`          | 1920×1080 | `banner`     | the market at night held sideways: a full row of stools, money and a bill at the counter's ends |
| `poster.jpg`          | 720×1560  | `poster`     | the market held upright, painted in a 360×780 window, the stools higher so a phone's frost leaves them sharp |
| `counting-change.jpg` | 960×540   | `screenshot` | the eighth customer's bill half-way down its fuse, 6,000 counted onto the cloth, seven right in a row and all three trust stamps; taken at 960×540 and scaled down |

The money in the game is game pieces, not banknotes: nothing here may show a riel banknote.
