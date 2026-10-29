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
of keys serves all five. Every move is a round key, unless a player picks a pill for DASH or ULT,
key by key, on the Skins screen (`pills` in `clear.js`), shaped as their art is (`aspect: 0.44`).
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
