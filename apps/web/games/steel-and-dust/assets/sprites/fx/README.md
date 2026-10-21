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

The workbench effects are saved in the PixelLab account's My effects under those ids, so they can be
opened, retuned with their sliders and exported again. The stag strip had its ground-shadow line
removed. The ice holds frames 4–7 while a raider stays frozen.
