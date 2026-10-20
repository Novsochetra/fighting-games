# Platform sprites

The decks fighters jump onto, one PNG per kind in `src/data/platform-sprites.js`, each 160 wide and
drawn at half scale like the fighters (80 world px). `topY` is the row a fighter stands on; each
half of the last row is stretched down to the ground under its leg, so that row holds only a clean
cross-section of the two legs. This is the temple roads' deck and how it was made.

| Sprite | Road | `topY` | `legs` | Made with |
| --- | --- | --- | --- | --- |
| `lintel.png` | temple roads | 3 | `[12, 67]` | Create Image (Pro) with `planks.png` as the style image (job `5f09366b`, second of four candidates): a sandstone slab with a lotus-petal frieze and moss on two carved pillar capitals. The last two rows were redrawn by hand as square shafts with a recessed panel, which repeat into the pillars |
