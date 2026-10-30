# Skin art

The art the touch skins (`src/data/skins/`) draw: their shells and their controls. Players never
bring their own.

## Clear

The five Clear skins (`styles/skin-clear.css`): the insides of a handheld seen through its
see-through plastic, the light on that plastic, and its keys. ChatGPT painted them, our own, with
no text or logos: the board and the light in grey on pure black, the keys in grey on a transparent
sheet. `tools/clear_skin_art.py` baked them to these files:

| File                           | What                     | Painted at | Baked to |
| ------------------------------ | ------------------------ | ---------- | -------- |
| `clear/insides-landscape.webp` | the board, sideways      | 1536×1024  | 1024×683 |
| `clear/insides-portrait.webp`  | the board, upright       | 1024×1536  | 682×1023 |
| `clear/gloss-landscape.webp`   | the light, sideways      | 1536×1024  | 720×439  |
| `clear/gloss-portrait.webp`    | the same light, upright  | (turned)   | 439×720  |
| `clear/dpad.webp`              | the d-pad                | 399×394    | 403×403  |
| `clear/key-round*.webp`        | a round key, up, pressed | 259×267    | 271×271  |
| `clear/key-pill*.webp`         | a pill key, up, pressed  | 384×168    | 386×170  |

The shell lays the board and the light over its plastic with a screen blend, so the black drops
out and only the light is left, and each colour's tint over the board colours it. One set of art
serves all five colours. Under the tint, the board shrunk to 1024 looks the same as at full size,
even on a 3× phone, at half the bytes.

The gloss painting had a thin outline round its edge. Stretched over each screen's shape, its
corners would bend, so the bake cuts inside it. The painting's highlights were faint (about 40 of
255) and did not show under the tint, so the bake brightens them to 200. Upright, the game's screen
sits at the top and would hide the light the sideways painting puts there, so the upright gloss is
the same light turned a quarter clockwise.

The keys were painted grey on a transparent sheet, three by two: the d-pad, a round key up and
pressed, a pill key up and pressed. The bake cuts out each; a pressed key keeps its key's canvas, so
it shows a touch smaller and flatter, as painted. The sheet's keys were at alpha 252 with specks of
alpha 1 to 3 over the empty sheet, so the bake makes the keys solid and drops the specks, then
leaves them 82% opaque: each shell's plastic shows through and tints them its own colour, as one set
of keys serves all five. Every move is a round key, unless a player picks a pill for it, key by
key, on the Skins screen (`pills` in `clear.js`), shaped as their art is (`aspect: 0.44`).
The d-pad's arms are 37.5% of it across, where the pad's own arms are a third, so the shade on a
held arm is sized to the art's (`styles/skin-clear.css`).

None of this holds the title: the menus never draw it, so it comes once the menu art is in
(`SKIN_ART`, `src/data/ui-art.js`).

To bake them again from new paintings:

```bash
python3 tools/clear_skin_art.py insides board-sideways.png apps/web/games/steel-and-dust/assets/skins/clear/insides-landscape.webp 1024
python3 tools/clear_skin_art.py insides board-upright.png apps/web/games/steel-and-dust/assets/skins/clear/insides-portrait.webp 682
python3 tools/clear_skin_art.py gloss gloss.png apps/web/games/steel-and-dust/assets/skins/clear/gloss-landscape.webp apps/web/games/steel-and-dust/assets/skins/clear/gloss-portrait.webp 720
python3 tools/clear_skin_art.py keys keys.png apps/web/games/steel-and-dust/assets/skins/clear
```

## Pixel skins

The pixel skins (`src/data/skins/pixel.js`, painted by `styles/skin-pixel.css` from what each
skin's own stylesheet names, `styles/skin-<skin>.css`) are handhelds ChatGPT painted as pixel art,
our own, with no text or logos: the shell held sideways (1536×1024), the shell held upright
(1024×1536) and a sheet of keys on flat magenta, three by two as Clear's. `tools/pixel_skin/bake.py`
reads each back at the size it was painted: ChatGPT's blocks drift across a painting (Sandstone's
were 6.6 to 6.9 px sideways and 7.8 to 8 upright), so every region (a grip, a band, a key) is read
on a grid of its own, the whole number of blocks across it that best meets its colour changes,
one colour from the middle of each, folded into a palette of 32 shared by the shell's pieces. A
key is read on square blocks, one size both ways, as its shape shows: read each way on its own,
Sandstone's round key, painted 290 by 295 px, came out 36 by 39 pixels, an oval. A painting whose
blocks are no one size (Retro Grey's LED is blocks of 6.5 px, its keys 10) is read as painted
instead, `--block 2` making every 2 by 2 px one pixel: any one grid would square some of it off. The
skins draw them a whole pixel of the art at a time (`image-rendering: pixelated`), a few hundred
bytes to a few KB each.

A phone is never the painting's shape, and stretched, the art's pixels would not stay square. So
the shell is laid from long pieces anchored to the screen's edges, and where one lies over another
its edge fades out in an ordered dither four pixels deep, which disappears into the grain:

| File                                  | What                                                       |
| ------------------------------------- | ---------------------------------------------------------- |
| `<skin>/landscape-left.png`, `-right` | a grip, from the top down, carried on by plain stone       |
| `<skin>/landscape-left-foot.png`, …   | the grip's lower third, its corner ornaments, on the bottom |
| `<skin>/landscape-top.png`, `-bottom` | a band 14 grips long, its ornament in the window's middle  |
| `<skin>/portrait-crown.png`          | the rim above and beside the window, all the screen shows   |
| `<skin>/portrait-body.png`           | the emblem under the window, carried on by plain stone      |
| `<skin>/portrait-foot.png`           | the bottom corners and band, on the bottom                  |
| `<skin>/key-*.png`, `<skin>/dpad.png` | the keys, a pressed key on its key's canvas               |

Held sideways each grip is as wide as the shell beside the game's screen, which sets the size of
the art's pixel for the bands too (`--pixel-grip-pixels`, the grips' width in the art, and
`--pixel-band-pixels`, the bands' length). Upright the
game's screen is wider than the painting's window, so the painting's own trim under the window is
dropped, the screen has a trim of its own (`--shadow-pixel-bezel`) and the body hangs under it
(`--pixel-chin`). The plain stone that carries a grip or the body on is a stretch of the painting
clear of its moss and emblem, ending where the foot starts, so the two meet as painted
(`GRIP_SEGMENT`, `BODY_SEGMENT`).

For a new skin, ask for a painting laid out as the bake cuts it: grips 40 of 192 pixels wide with
their ornaments inside the corners and only even texture between them, bands 8 pixels tall with
one ornament in the middle, the window flat black; upright, the window from 4% to 96% of the width
with nothing beside it, the emblem under it, only even texture down to the bottom corners. Then
bake it, add it to `PIXEL_SKINS` and give it a stylesheet naming its art:

```bash
python3 tools/pixel_skin/bake.py landscape shell-sideways.png apps/web/games/steel-and-dust/assets/skins/<skin>
python3 tools/pixel_skin/bake.py portrait shell-upright.png apps/web/games/steel-and-dust/assets/skins/<skin>
python3 tools/pixel_skin/bake.py keys keys.png apps/web/games/steel-and-dust/assets/skins/<skin>
```

### Sandstone

Carved Angkor sandstone with bronze trim and moss in its corners, a lotus on each band and a lotus
and temple tower under the window upright. Its grips are 46 pixels across; upright the game's
screen has the window's bronze trim (`--shadow-sandstone-bezel`). Its bands are 644 pixels long.

### Retro Grey

Grey plastic, a purple bezel round the screen, red round keys and grey pills slanting 19 degrees,
as a 1989 handheld's start and select. Its painting had an LED, two screws and a speaker grille on
the plastic, where the d-pad and the keys stand, and they showed round them, so the bake covers
each with plain plastic from beside it, the plainest neighbour of its size (`--clear`, a box of the
painting each). Baked as
painted (`--block 2`, its grips 116 of those pixels across and its bands 1624 long). Its bezel
belongs to the window (`--frame`, the window taken out over the colour round the black to where it
ends): left in the grips, it made their inner 46 px purple, and the d-pad, HEAVY and the pills
stood on it. So held sideways the game sits in the bezel's purple (`--pixel-window`), and upright
the bake leaves out the bezel's outline under the window too (`--trim 5`), as
`--shadow-retro-bezel` draws the bezel round the game's screen, deeper under it. Its keys read on
10 px blocks. A slanting pill's key is the pill along itself, 34 by 14 pixels, turned as it slants
(`--pixel-pill-tilt`), so its label, ring and touch lie along it, and its art is turned back level
under the label at the size of the art's box (`--pixel-pill-art-*`).

```bash
python3 tools/pixel_skin/bake.py landscape shell-sideways.png apps/web/games/steel-and-dust/assets/skins/retro --block 2 --frame --clear 43,60,100,119 --clear 42,891,170,943 --clear 1325,764,1516,966
python3 tools/pixel_skin/bake.py portrait shell-upright.png apps/web/games/steel-and-dust/assets/skins/retro --block 2 --frame --trim 5 --clear 48,1417,200,1476 --clear 734,1258,996,1510
python3 tools/pixel_skin/bake.py keys keys.png apps/web/games/steel-and-dust/assets/skins/retro
```
