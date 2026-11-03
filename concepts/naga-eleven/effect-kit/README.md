# Naga Eleven: the effect kit

The effects a skill shows on the pitch are drawn once and painted in each move's own colours, so a
new move costs a choice of parts, not a drawing. ChatGPT painted each effect as six frames on
magenta (`chatgpt/`), in key colours: its main shape in greys, its trim in bright green, its core
in bright blue. `tools/effect_kit/bake.py` reads each sheet back at the size it was painted and
turns every pixel into a code of the pitch's effects (`o` the outline, `d m l h` the greys, `y g G`
the greens, `r e E` the blues), which a move's look (`LOOK_ART`) colours as it draws:

```bash
python3 tools/effect_kit/bake.py
```

| sheet    | where it plays                                    |
| -------- | ------------------------------------------------- |
| `comet`  | the head of a shot's streak                       |
| `spiral` | the head of the `spiral` trail (Samba Rocket)     |
| `helix`  | the head of the `helix` trail (Moon Relay)        |
| `ribbon` | the head of a pass's ribbon                       |
| `motes`  | the `motes` aura, round a player charging a skill |
| `blaze`  | the `flame` aura                                  |
| `star`   | the `burst` impact, where a shot is struck        |
| `shock`  | the `ring` impact, on the grass                   |

The prompts are in the session that made them: each asked for a 3 by 2 sheet of one effect's six
frames, attached a piece of the game's pixel art for the style, and named the key colours in words
(ChatGPT ignores colour codes).
