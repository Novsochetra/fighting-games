# Painted forests

The six forests of missions 1 to 6, two layers each, made with PixelLab Create Image (Pro) from the
concept paintings in `concepts/stages/mission-01/` at the repo root (each used as the reference).
Every layer is 216 rows tall, the height of the view, and tiles sideways.

| Folder            | Mission          | Concept           | `back.png` | `near.png` |
| ----------------- | ---------------- | ----------------- | ---------- | ---------- |
| `pine-ridge/`     | 1 Pine Ridge     | `b_pine_dawn`     | 620 wide   | 768 wide   |
| `old-grove/`      | 2 Old Grove      | `a_old_grove`     | 320 wide   | 384 wide   |
| `bamboo-pass/`    | 3 Bamboo Pass    | `f_bamboo_grove`  | 320 wide   | 768 wide   |
| `raider-camp/`    | 4 Raider Camp    | `e_raider_camp`   | 576 wide   | 384 wide   |
| `ember-woods/`    | 5 Ember Woods    | `c_autumn_dusk`   | 640 wide   | 768 wide   |
| `firefly-hollow/` | 6 Firefly Hollow | `d_firefly_night` | 576 wide   | 768 wide   |

- `back.png` is the far plate: the sky, the sun or moon and the distant forest, with no trunks or
  road. Made with `tools/backdrop_layers.py`: `unframe` (Pro sometimes paints a white frame), `shift`
  where the sun or moon sat near an edge, then `overlap` to dither the two ends into each other.
  Pine Ridge also had a painted step in its mist inpainted away and its lowest rows flattened with
  `fogfloor`.
- `near.png` is the strip of trunks, bamboo or camp pieces just behind the road, on transparency.
  Made with `near`, which rolls each painting so a see-through gap sits on its edges, sets its base
  just under the road's edge and hazes it a little toward the forest's mist. Pine Ridge joins two
  paintings; the Old Grove's canopy ran over its edges, so that seam was inpainted first.
- The campfire's embers and smoke are drawn in code at the fire in `raider-camp/near.png`
  (`src/data/backdrops/`).

The forests keep their road clear of loose props: the near strips already dress it, and props drawn
on their own never sat in the painted light. The palisade that closes each forest road
(`../sprites/props/palisade.png`) and the plank deck of the platforms (`../sprites/platforms/`) are
Pro sprites drawn at half scale like the fighters. `ground.png` in each folder is the road's
cross-section (turf, earth, roots), keyed and tiled with `ground` and laid along the hills.

## Second pass: seams, one sun per screen, cliffs

The far plates and near strips were reworked after looking at every forest in the browser with two
tiles side by side, and every road got a cliff face. All of it is reproducible with
`tools/backdrop_layers.py`; the PixelLab originals were kept with the work notes.

- **Far plate seams.** `overlap` had left a 64-column ordered-dither crossfade at the start of every
  plate, which read as a ghosted, blocky patch (the Ember Woods sun halo was cut by it). `unblend`
  sorts each pixel of that band back to the end it came from (the Bayer pattern says which), fills
  the gaps from its neighbours and joins the two ends along the least visible seam: all six plates.
  Firefly Hollow (column 191) and Raider Camp (column 192, its camp floor) also had a hard cut where
  `shift` had joined the painting's own ends; `join` lays the two sides 32 columns over each other
  and switches along the least visible seam (both plates 288 wide). Inpainting the dither with
  PixelLab was tried first and only copied the dither, so it was not used.
- **One sun or moon per screen.** A plate narrower than the view showed its sun twice. Each plate
  with a sun or moon is now the plate followed by a copy without it (`back.png` twice as wide): Pine
  Ridge, Ember Woods and Firefly Hollow had the sun or moon and its rings inpainted away with
  PixelLab Inpaint on a 256-wide crop centred on it ("dawn sky in flat bands, no sun", "dusk sky,
  no sun", "night sky, no moon"); Raider Camp's flat disc was painted out with its own sky bands.
  Ember Woods is rolled by 112 so its halo sits inside its own half. The Pine Ridge halo stub at the
  top edge was rounded off.
- **Near strips.** Raider Camp's strip is `sink` 6 rows, so its tents and crates stand on the road's
  far edge instead of on the plate's yard (its fire emitters moved down with it); a warm dust `mist`
  now hangs over the yard. Old Grove (`#b8ccaa`, 0.38) and Firefly Hollow (`#6e6fa6`, 0.34) got
  `groundhaze` from row 70 to 176, a ground mist that keeps their dark trunk bases from swallowing
  the fighters. Bamboo Pass, Ember Woods and Firefly Hollow passed their trunks at one even rhythm;
  `vary` joins each strip with a copy that leaves one trunk or clump out (768 wide).
- **Cliffs.** `cliff.png` (12x64) in every folder is the face of a step whose high ground is on the
  left, drawn down each sheer step (`src/render/scene/cliff-faces.js`). One PixelLab Create Image
  (Pro) call at 16x64 with a crop of the Pine Ridge cross-section as the style image gave 16
  candidate faces (earth, stones, roots, strata, stacked stones); `cliff` picks one per forest,
  repaints it in that forest's earth by brightness rank, darkens it as a face turned from the light,
  crumbles its outer edge and leaves its top clear so the road's own turf rolls over it:

  | Folder            | Candidate         | Arguments after `<ground.png>` (left width skip depth turf lip shade) |
  | ----------------- | ----------------- | --------------------------------------------------------------------- |
  | `pine-ridge/`     | 0 stones, roots   | `2 12 14 64 11 4 0.8`                                                 |
  | `old-grove/`      | 4 dense roots     | `2 12 14 64 10 4 0.8`                                                 |
  | `bamboo-pass/`    | 5 layered strata  | `2 12 14 64 7 3 0.8`                                                  |
  | `raider-camp/`    | 6 pebble pack     | `2 12 14 64 5 3 0.8`                                                  |
  | `ember-woods/`    | 12 roots          | `2 12 16 64 12 5 0.8`                                                 |
  | `firefly-hollow/` | 13 stacked stones | `1 12 1 18 14 11 0.8` (the colours of its paving, a retaining wall)   |

- **Decks.** `../sprites/platforms/planks.png` is a PixelLab Create Image (Pro) trestle (160x48,
  the old deck as the style image): a thick plank walkway on two posts with a nailed cross brace,
  so it no longer reads as a little gate from a distance. Its brace was run 12 rows further down
  into the posts, so the last row, which the legs repeat down to the ground, is the two posts alone.
