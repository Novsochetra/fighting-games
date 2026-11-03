# Naga Eleven: the new-style pitch player (trial)

A trial of a sharper, anime-style footballer on the pitch, not yet in the game. ChatGPT drew him
facing the camera (`../pitch-boy-front.webp`, take 2). His pixels were snapped to the pitch
sprites' kit colours (`src/art/sprite-kit.js`). PixelLab then turned him into eight directions and
ran him south and east with its `running-6-frames` template, for 3 generations.

| file                       | what                                                      |
| -------------------------- | --------------------------------------------------------- |
| `pixellab/rotation-*.png`  | PixelLab's eight directions, 64×64                        |
| `pixellab/run-*-[0-5].png` | its run, south and east, as it drew it                    |
| `run-trial.png`            | the game's `run.png` with those two rows swapped, snapped |

```bash
python3 tools/pitch_trial/snap_run.py
```

The snap does three things:

- It moves every pixel to the nearest kit colour, so each team recolours him shade for shade.
- It warms PixelLab's pale side-on skin back to the kit's skin.
- It moves his soles to row 60, where the current run's soles are.

To play it, copy `run-trial.png` over `apps/web/games/naga-eleven/assets/sprites/run.png` and run
`npm run dev`. Then put the original back with `git checkout`.

What a full set would need:

- the other three drawn directions of the run,
- idle, kick, slide, dive, fall and celebrate in five directions each, about 35 generations,
- a pass over the forward fist, which PixelLab painted in the shirt's red on two east frames.
