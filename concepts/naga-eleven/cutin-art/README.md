# Naga Eleven: the cut-in art

The big pictures a duel's cut-ins play, painted by ChatGPT on magenta in key colours so the game
paints them in each player's own: kits in greys, hair in silver-white, the move's light in bright
green.

```bash
python3 tools/cutin_art/bake.py
```

| sheet              | what                                                             | in the game                        |
| ------------------ | ---------------------------------------------------------------- | ---------------------------------- |
| `strike`           | Sochetra's kick in five frames, and his face shouting            | his shot cut-ins (the five frames) |
| `strike-reference` | the same kick in Cambodia's colours, the style the others copied | none: the reference                |
| `ball`             | the ball flying at the camera                                    | not yet                            |
| `defenders`        | two defenders blown away by a shot                               | not yet                            |
| `net`              | the net ripping                                                  | not yet                            |

ChatGPT painted the strike's hair, kit, boots and ball in the same few greys, so the bake tells
them apart by where they lie: `tools/cutin_art/bake.py` names the hair's box and the ball's and
the lifted boots' boxes in each frame. Its pixels become the portraits' letters
(`src/render/portraits/legend.js`), painted in the colours Sochetra's portrait has in that match.
