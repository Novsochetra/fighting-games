# Screenshots

Frames of the game itself, for the arcade's home page: `game.json` names one as its `screenshot`,
which the home page shows on the game's card, its library tile and its details sheet.

| File             | Size    | What it shows                                                                    |
| ---------------- | ------- | -------------------------------------------------------------------------------- |
| `angkor-wat.png` | 768×432 | Bokator's heavy strike and his tiger spirit at the Naga Causeway, Mission 11, at dusk |

A frame is the game canvas read straight off the page (`canvas.toDataURL`) at its own 768×432, the
world's 384×216 drawn at 2×, so nothing is scaled. To take one again, play the game in a browser
with a saved run at the mission you want: `sd_run` in `localStorage`, for example
`{"mission":10,"score":48250,"playTime":1500,"continues":0,"lives":5,"ultMeter":200}`, and every
hint in `sd_hints` marked seen so no tip covers the fight.
