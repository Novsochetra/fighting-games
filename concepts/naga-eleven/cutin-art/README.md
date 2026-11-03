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
| `ball`             | the ball flying at the camera                                    | the finale, first                  |
| `defenders`        | two defenders blown away by a shot                               | a field duel's PAST HIM!           |
| `net`              | the net ripping                                                  | the finale, second                 |
| `keeper`           | the keeper ready, diving, knocked back, flung, in the net, dazed | the finale, last (frames 3 to 6)   |

The finale plays after a star's special or a combo scores, between the save cam and the word: the
ball at the camera, the net tearing, the keeper flung back into it and left dazed.

ChatGPT painted the players' hair, kits, boots and ball in the same few greys, so the bake tells
them apart by where they lie: `tools/cutin_art/figures.py` names the hair's box and the ball's and
the lifted boots' boxes in each frame. The ball and the net are painted like the effects and read
back in their codes. Its pixels become the portraits' letters
(`src/render/portraits/legend.js`), painted in the colours Sochetra's portrait has in that match.
