# Platform sprites

The decks fighters jump onto, one PNG per kind in `src/data/platform-sprites.js`. Each is 160×40,
drawn at half scale like the fighters (80 world px wide). `topY` is the row a fighter stands on;
each half of the last row is stretched down to the ground under its leg, so that row holds only a
clean cross-section of the two legs.

| Sprite       | Road         | `topY` | `legs`     | Made with                                                                                                                                                                                                                                                                                            |
| ------------ | ------------ | ------ | ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `planks.png` | forests      | 7      | `[11, 68]` | Create Image (Pro)                                                                                                                                                                                                                                                                                   |
| `ledge.png`  | temple roads | 3      | `[12, 67]` | Create Image (Pro) with `planks.png` as the style image (job `5f09366b`, second of four candidates): a sandstone slab with a lotus-petal frieze and moss on two carved pillar capitals. The last two rows were redrawn by hand as square shafts with a recessed panel, which repeat into the pillars |
