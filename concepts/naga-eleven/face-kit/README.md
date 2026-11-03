# Naga Eleven: the face kit

The faces a duel shows (the versus card and the cut-ins) are put together from parts: a face in a
mood, a hairstyle and maybe a band or a hat, painted in the player's own skin, hair, eyes and kit.
ChatGPT painted the parts as pixel art on magenta, six to a sheet (`chatgpt/`), and
`tools/face_kit/bake.py` turns the sheets into the game's data,
`apps/web/games/naga-eleven/src/art/face-kit/`:

```bash
python3 tools/face_kit/bake.py
```

`tools/face_kit/sheets.py` says which cell of which sheet is what, and the block size each sheet is
read at. `python3 tools/face_kit/bake.py --measure` prints every cell's skull radius: a new sheet's
block size is right when its skulls come out near 18.6.

## The sheets

Each sheet is three cells across and two down, numbered 1 to 6 row by row.

| sheet                                              | cells                                                                                              |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `hero-takes`                                       | six takes of the bald hero face; take 1 is the kit's hero                                          |
| `bases`                                            | the friend, the ace and the wall, two takes each; 1, 2 and 6 are kept                              |
| `moods-hero`, `-friend`, `-ace`, `-wall`, `-child` | shout, grin, hurt, angry, surprised, calm                                                          |
| `moods-adult`                                      | the same moods at 45; the stern cell 4 is also his neutral face                                    |
| `hair-1`                                           | spiky, crop, side part, curtains, curly, swept                                                     |
| `hair-2`                                           | buzz, bowl, long back, mohawk, bedhead, top knot                                                   |
| `hair-3`                                           | afro, twists, cornrows, shoulder length, slicked back, receding                                    |
| `gear`                                             | headband, sweatband, cap, beanie, glasses and an earring (the last two not kept: too thin to read) |

## How they were asked for

ChatGPT ignores colour codes and redraws a face whenever it is asked for a new one, so the prompts
ask for what it does keep, and the bake sorts the pixels by where they lie:

- Every new sheet attaches the face it builds on (a copy of `hero-takes` cell 1, enlarged 8 times
  on magenta) and says: _the same size, the same position, the same pixel size, the same magenta
  background; only the hair (or the expression) changes_.
- New faces keep the skull: _keep exactly the size and position of the skull, the ears, the angle;
  change only the face_. That is what lets every hairstyle fit every face.
- Hair is asked for in **silver-white and light grey**, so it stands apart from the outline and the
  game paints it any colour. Hats and bands are asked for in **bright green**, which nothing else
  in a face uses.
- `facial-*` are single pictures, each the adult's stern face (`moods-adult` cell 4) with one
  style painted on by the edit tool: stubble, moustache, beard, goatee, sideburns. They are worn
  only on the faces with that jaw, the adult and the wall he was drawn from.
- Facial hair follows the jaw, so it cannot be painted on one face and worn by another: draw it
  with ChatGPT's edit tool on the face that wears it (brush only where it grows), never as a new
  picture.

A sheet prompt, for the hairstyles:

```
The attached image is a bald pixel-art head. Make a sheet of 6 cells, 3 across and 2 down,
each a copy of this EXACT head: same face, same size, same position, same pixel size, same
magenta background. Only add HAIR, a different style in each cell.
Draw ALL hair in SILVER-WHITE and light grey (the game recolours it later). Hard square
pixels, no blur, no soft edges. Do not change the face, ears, neck or shirt.
1. ... 6. ...
No text, no borders between cells other than thin lines.
```
