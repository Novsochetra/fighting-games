# Prop sprites

The walls that close a painted road, one PNG per kind in `src/data/prop-sprites.js`, drawn at half
scale like the fighters. Each hangs from its left end at the road's end (`feetX`, `feetY` is the
pixel set on the road, a couple of rows above the bottom so the grass sinks in), so only its left
40 or so columns are on screen.

| Sprite            | Road         | `feetX`, `feetY` | Made with                                                                                                                                                                                                                       |
| ----------------- | ------------ | ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `palisade.png`    | forests      | 16, 110          | Create Image (Pro)                                                                                                                                                                                                              |
| `temple-gate.png` | temple roads | 16, 110          | Create Image (Pro) with `palisade.png` as the style image (job `d77cda6b`, first of four candidates): a weathered sandstone wall with an apsara relief and a many-headed stone naga rearing at its left end, the part on screen |
