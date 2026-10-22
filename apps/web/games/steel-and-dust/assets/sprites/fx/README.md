# Effect sprites

The Shades' signature and ultimate effects, made with PixelLab. Each PNG is one row of frames, drawn
at the hero sprites' resolution; `src/data/fx-sprites.js` gives each strip's frame size, frame count,
ticks per frame and anchor (the pixel that sits on the ground, or on the effect's centre).

| Strip         | Frames  | Used for                                            | Made with                                                                     |
| ------------- | ------- | --------------------------------------------------- | ----------------------------------------------------------------------------- |
| `thorns.png`  | 14 × 93×131  | Moss: finisher brambles, Thornwood Requiem      | VFX workbench, "Thornwood Eruption" (`c14f520c-1ef0-4a69-bf56-a40ccb7cff79`)    |
| `firefly.png` | 6 × 20×20    | Firefly: homing fireflies, Swarm Nova's swarm   | VFX workbench, "Firefly Mote" (`996eb627-46e7-4a25-8578-c4d7cce0813c`)          |
| `nova.png`    | 16 × 144×165 | Firefly: Swarm Nova's burst                     | VFX workbench, "Swarm Nova" (`e64ba22e-66b3-428c-9294-170cbb41dc58`)            |
| `stag.png`    | 8 × 96×80    | Antler Spirit: rams and Spirit Stampede         | Pixen image (`177fc142-2900-4797-b444-a2c987340aed`), PixMiniMax gallop (`4df8c2ac-41e4-40e8-aa50-3dde4bdd0ce5`, frames 1–8) |
| `ice.png`     | 14 × 70×99   | Blue: freezing hits and Absolute Zero           | VFX workbench, "Absolute Zero Ice" (`b19c2f70-6320-4e2a-8edc-d2219f8cf8ef`)     |
| `shatter.png` | 10 × 113×136 | Blue: the ice shattering                        | VFX workbench, "Absolute Zero Shatter" (`0297f9a5-46c0-40e6-acf6-0d0c8d02df61`) |
| `pillar.png`  | 12 × 81×111  | Ember: finisher flame pillars, Phoenix Pyre's waves | VFX workbench, "Ember Pillar" (`47c0176a-bc4f-451f-9f2d-e882768bfde1`)        |
| `burn.png`    | 8 × 48×64    | Ember: flames on a burning raider (loops)        | VFX workbench, "Ember Burn" (`4813b8ef-ffac-4f4c-8a0a-1bd7e9a2e07c`)          |
| `phoenix.png` | 6 × 128×96   | Ember: Phoenix Pyre's firebird (loops)           | Pixen image (`95d5d481-7be4-4346-9ec0-6b4994bf0370`), PixMiniMax flap (`5a9556a1-3365-4e22-8e86-93bc4b76a7b7`, frames 0–5) |
| `inferno.png` | 16 × 244×180 | Ember: Phoenix Pyre's closing blast             | VFX workbench, "Ember Inferno" (`19ad017d-a6db-4be5-b869-d3aa7136bfe5`)       |
| `lion.png`    | 6 × 216×155  | Bokator: the golden lion (3 frames rising, 3 leaping) | ChatGPT image sheet on black: the body solid with its dark lines, only the glow round it see-through |
| `feathers.png` | 8 × 66×70   | Ember: feathers where a spear hit lands         | VFX workbench, "Phoenix Feathers" (`d2f23d08-4f1d-46c8-ae4f-270b3608ada3`)    |
| `pounce.png`  | 8 × 202×127  | Bokator: the ground breaking under his slam and the lion's pounce | VFX workbench, "Lion Pounce Impact" (`5b6ed44c-958d-4c1c-b3a4-6b9a6d0250b4`) |
| `strike.png`  | 7 × 67×53    | Bokator: Pounding the Lion's blows and his echoes striking again | VFX workbench, "Lion Fist Strike" (`848a0eee-7e9e-463c-8064-dd5f05585558`) |
| `awaken.png`  | 10 × 60×100  | Bokator: an echo flaring into gold as a lion rises out of it | VFX workbench, "Lion Awakening" (`e3e52c54-dbb8-4788-a737-f008bebabba1`) |
| `gather.png`  | 8 × 67×84    | Bokator: the gold flame he coils in before the rush, drawn behind him | VFX workbench, "Lion Breath Gather" (`9fd9cbe6-9ed9-4200-9d51-4ece36c6f546`), frames 5–12 |
| `sever.png`   | 7 × 55×55    | Angkor Warrior: Thousand Cuts' cuts landing, a crescent sweeping away from him | VFX workbench, "Bayon Sever" (`82e5a97e-a33c-498b-ac6d-8d16c66dc303`) |
| `rubble.png`  | 11 × 105×92  | Angkor Warrior: his sandstone carvings crumbling | VFX workbench, "Sandstone Crumble" (`dce5b391-7fdc-4752-bdbf-b3ebc7721860`) |

The workbench effects are saved in the PixelLab account's My effects under those ids, so they can be
opened, retuned with their sliders and exported again. The lion's leap frames play once over every bound, from push-off to
reaching for the ground, so more leap frames added to the end of `lion.png` (and its `frames` count in
`src/data/fx-sprites.js`) make every bound smoother with no code change. The pounce impact was
exported as a 4×3 grid and cut into one row, its two blank closing frames dropped; the strike, awaken,
gather, sever and rubble strips were cut the same way, their blank closing frame dropped; the gather
strip keeps only its burning frames (its gathering motes are particles in the game). The stag strip had its ground-shadow line
removed. The ice holds frames 4–7 while a raider stays frozen. The feathers fly right from the hit and are
mirrored when the strike goes left.
