# Effect sprites

The Shades' signature and ultimate effects, made with PixelLab, and the bosses' effects. Each PNG is one row of frames, drawn
at the hero sprites' resolution; `src/data/fx-sprites.js` gives each strip's frame size, frame count,
ticks per frame and anchor (the pixel that sits on the ground, or on the effect's centre).

The bosses' effects are pixel art too: the ones an image model drew, shrunk to thousands of colors,
were each mapped onto a 16-color palette of their own, their noise merged into flat clusters and
the solid shapes in them outlined (the Bayon Guardian's pillar, roots and rubble, already drawn by
hand, and the Cobra's flat puddle were kept). A regression test keeps every boss effect under 32
colors.

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
| `crescent.png` | 6 × 96×64   | Gravel Khan: Khan's Tempest's waves skimming the road (loops) | ChatGPT image, keyed out, shrunk and cut into frames |
| `glint.png`   | 4 × 32×32    | Gravel Khan: the glint on his blade before the Crescent Dash | ChatGPT image, shrunk and cut into frames |
| `boulder.png` | 4 × 56×56 | Rust Colossus: a boulder lobbed or falling (loops) | ChatGPT image, shrunk and cut into frames |
| `shards.png` | 6 × 64×64 | Rust Colossus: a boulder breaking on the ground | ChatGPT image, shrunk and cut into frames |
| `spike.png` | 8 × 64×96 | Rust Colossus: a stone spike bursting up and crumbling | ChatGPT image, shrunk and cut into frames |
| `impact.png` | 6 × 104×104 | Ironhorn: a rush smashing into the wall | ChatGPT image, shrunk and cut into frames |
| `bamboo.png` | 4 × 160×168 | Ironhorn: a bamboo stalk toppling into the arena | ChatGPT image, shrunk and cut into frames |
| `stars.png` | 4 × 56×32 | Ironhorn: stars circling his dazed head (loops); the Cobra's held hero | ChatGPT image, shrunk and cut into frames |
| `glob.png` | 4 × 44×20 | Cobra Matriarch: a venom glob flying (loops) | ChatGPT image, shrunk and cut into frames |
| `puddle.png` | 6 × 80×40 | Cobra Matriarch: a poison puddle bubbling (loops) | stand-in ellipses, to be replaced by the ChatGPT strip |
| `hypnosis.png` | 8 × 128×80 | Cobra Matriarch: the Hypnotic Gaze's rings and flash | ChatGPT image, shrunk and cut into frames; the fading rings kept down to a quarter's opacity |
| `wasp.png` | 4 × 56×48 | Scorpion Queen: an ember wasp of the Hive Swarm flying (loops) | ChatGPT image, shrunk and cut into frames |
| `eruption.png` | 6 × 144×144 | Scorpion Queen: the earth bursting up behind her as she surfaces | ChatGPT image, shrunk and cut into frames |
| `howl.png` | 6 × 112×112 | Gnoll Packlord: the Pack Call's rings spreading from his throat | ChatGPT image (three effects on one sheet), split into rows, shrunk and cut into frames |
| `bones.png` | 6 × 144×72 | Gnoll Packlord: bones and earth bursting where the Leaping Maul lands | the same sheet's second row |
| `redeye.png` | 4 × 56×16 | Gnoll Packlord: the red streak his eyes leave in the Blood Frenzy | the same sheet's third row, drawn flying left and mirrored as he lunges |
| `zap.png` | 4 × 120×56 | Storm Djinn: the Thunder Fist's bolt, a loop, its head on the anchor | ChatGPT image, drawn flying left, so mirrored before it was shrunk and cut into frames |
| `tornado.png` | 8 × 136×160 | Storm Djinn: a dust devil rising (0-2), spinning (3-5, a loop) and blowing away (6-7); small, his whirl as he slips away | ChatGPT image, shrunk and cut into frames, folded to 255 colors |
| `blaze.png` | 6 × 80×64 | Furnace Knight: the ground his Fire Flail sets burning, lit (0), burning (1-4, a loop), dying down (5) | ChatGPT image, shrunk and cut into frames, folded to 255 colors |
| `slag.png` | 4 × 96×64 | Furnace Knight: the Slag Pot tumbling through the air | ChatGPT image, shrunk and cut into frames |
| `lava.png` | 6 × 112×72 | Furnace Knight: the lava pool bursting up as the pot breaks (1-4), then smouldering (0 and 5) | ChatGPT image, shrunk and cut into frames, folded to 255 colors |
| `beam.png` | 4 × 160×72 | Furnace Knight: a Meltdown flame lance, a loop, its tip on the anchor | ChatGPT image, drawn flying left, so mirrored before it was shrunk and cut into frames |
| `flare.png` | 4 × 128×96 | Furnace Knight: fire bursting from his open chest as a lance leaves it, and before, as the furnace roars | ChatGPT image, shrunk and cut into frames, folded to 255 colors |
| `steam.png` | 6 × 80×128 | Furnace Knight: steam venting from the ground at his back as he walks, and on both sides while he is overheated | ChatGPT image, shrunk and cut into frames, folded to 255 colors |
| `scarab.png` | 4 × 48×24 | Sand Pharaoh: a scarab of the Scarab Carpet crawling (loops); five drawn as the carpet, a back row a step behind | ChatGPT image, the painted checker keyed out, shrunk and cut into frames, held on the eye |
| `canopic.png` | 6 × 80×64 | Sand Pharaoh: a canopic jar of the Curse of the Sun standing (0) and breaking (1-5) | the same, held on the jar's foot |
| `curse.png` | 4 × 48×48 | Sand Pharaoh: the sun's eye over the cursed hero (loops, quicker as the curse nears) | the same |
| `sunfall.png` | 6 × 96×160 | Sand Pharaoh: the curse going off, a column of sunlight slamming down on the hero | the same, held on the column; blue squares left in the column were painted out in its gold |
| `gazePillar.png` | 8 × 104×210 | Bayon Guardian: the Stone Gaze's gold pillar bursting up, burning (2-5) and winding away | ChatGPT image, the painted checker keyed out, shrunk and held on the pillar's foot; then redrawn by hand: the holes in its core filled white-hot, the fringe peeled, the glow banded on one 9-step gold ramp (15 colors) and the rocks in his mossy stone, outlined |
| `figRoot.png` | 8 × 96×104 | Bayon Guardian: a fig root bursting up from cracked road (0), rising (1-3), striking (4), recoiling (5), its veins flaring as it cracks (6) and breaking to a falling stump (7) | drawn in code, pixel by pixel: three braided bark strands with jagged gold veins, side roots, a mossy rubble foot and stone chips, held on the root's foot |
| `rockBurst.png` | 8 × 104×140 | Bayon Guardian: rubble and dust bursting up as he crumbles and as a stone face crumbles | ChatGPT image drawn again with wide gaps, the painted checker keyed out; the rocks put in his mossy stone and outlined, the dust redrawn as one cloud of round clumps, lit on top and shaded beneath in 6 warm tones |
| `stoneFace.png` | 8 × 144×216 | Bayon Guardian: a giant stone face in profile rising out of rubble (0-3), glaring (4), breathing gold (5), cracking (6) and crumbling (7) | ChatGPT image drawn with wide gaps, the painted checker keyed out, a hole in its glowing mouth filled; frames 3, 5 and 6 rebuilt on frame 4 so the face, rubble and floating rocks stay put (only the eyes, the open jaw and the cracks change), the others aligned to it, the grey halo removed and every frame outlined |
| `mirageBolt.png` | 4 × 48×24 | Sand Pharaoh: a mirage bolt a copy fires below half health (loops), its orb on the anchor | ChatGPT image on real transparency, shrunk and cut into frames |
| `tide.png` | 8 × 95×99 | Naga Raja: the Tidal Coil's wave of moat water rising (0-1), rolling on its curl (2-4, a loop) and breaking (5-7), on the road at the anchor | ChatGPT image on a painted dark checker: every neutral grey keyed out, shrunk and cut into frames; the grey-blue of the checker left in the spray taken out (recoloured to water where it lay inside it), and the square ends of the water along the road tapered |
| `splash.png` | 7 × 78×99 | Naga Raja: moat water bursting up where her coil crashes and where the rising serpent breaks out | Same |
| `serpentRise.png` | 8 × 192×195 | Naga Raja: the Rainbow Naga's serpent of water bursting up out of its marked spot and falling back | Same; its first frame, which floated over the spot with its bottom cut off, is frame 1's serpent rising out of three splash crowns |
| `spiritNaga.png` | 7 × 134×108 | Naga Raja: a spirit naga of water taking shape (0-2), sweeping (3-4, a loop) and coming apart (5-6), held by its crown on the anchor | Same; each frame placed by the gold of its crown, so the head stays put while the water churns behind |
| `rainbowOrb.png` | 8 × 104×104 | Naga Raja: the rainbow orb gathering over her raised hand (0-2), spinning (3-6, a loop) and bursting (7), held by its middle | ChatGPT image, a 4×2 grid on a painted light checker: only colored pixels kept, plus the white core at each swirl's middle |
| `nagaBolt.png` | 4 × 65×53 | Naga Raja: the small water naga each of her Seven Heads spits, taking shape (0-1) and darting (2-3) | Frames 1-4 of the spirit naga's image, shrunk smaller |
| `thunder.png` | 8 × 232×352 | Storm Djinn: the Eye of the Storm's lightning striking a marked spot, then the sand it throws up | ChatGPT image, shrunk and cut into frames, folded to 255 colors |
| `hook.png` | 1 × 56×32 | Warden Ox: the Chain Hook's hook, its ring on the anchor; turned along the chain as it flies, level round a caught hero | ChatGPT image on real transparency, shrunk to his frames' scale |
| `chain.png` | 1 × 48×12 | Warden Ox: four links of the chain, laid end to end from his fist to the hook | cut from the chain in his own throwing frame, shrunk so it repeats every 12 px |
| `parry.png` | 4 × 96×96 | Warden Ox: the gold burst of a parried blow; small, the glint on his hammer as he sets his guard | ChatGPT image, the painted checker keyed out, shrunk and cut into frames |
| `axeWhirl.png` | 6 × 176×144 | Warden Ox: the red whirl round him in the Executioner's Round, winding up (0), spinning (1-4, a loop) and dying away (5), drawn behind him | ChatGPT image, the painted checker and the axe at its middle keyed out, shrunk and cut into frames; the steel and white edges the axe left, and loose fragments inside the ring, were taken out |
| `keg.png` | 3 × 39×62 | Raider Camp: a powder keg, unlit (0), its fuse burning (1) and flashing white just before it blows (2) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --colors 32 --groups 2,1` |
| `blast.png` | 8 × 79×69 | Raider Camp: a powder keg blowing up, drawn at twice the sprites' density | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --colors 32 --common-grid --untint` |
| `moatWater.png` | 4 × 60×42 | Angkor Wat: the surface of the moat in the causeway's breach, a seamless tile looping through its 4 frames | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --colors 24 --common-grid --keep-edges --inset 1` |
| `deadTree.png` | 4 × 169×117 | Forests: a dead pine standing (0), leaning as it gives way (1), falling (2) and lying felled beside its stump (3), held by the stump and drawn at twice the sprites' density | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --colors 24 --cuts 400,820,1200 --cell 4.94,4.94 --anchor-left-run --anchor-rows 3`, then each frame shifted to put its stump on one column |
| `campfire.png` | 6 × 52×96 | Raider Camp: a campfire on the road, a 6-frame flicker loop, each fire on its own beat | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid --untint` |
| `hammerHead.png` | 1 × 101×85 | Iron Works: a drop hammer's head, its striking face glowing, held by the middle of that face | ChatGPT image on magenta (the head and its piston side by side), baked with `tools/bake_magenta_sheet.py --common-grid` and cut apart |
| `hammerPipe.png` | 1 × 53×143 | Iron Works: the drop hammer's piston and guide rails, laid end to end from its head up out of the view | the same image, the other half |
| `hornetNest.png` | 4 × 89×72 | Forests: a hornets' nest hanging from its branch (0), swaying as it is struck (1), cracking as it falls (2) and broken open on the road (3) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid --cuts 500,980,1420` |
| `hornet.png` | 4 × 49×39 | Forests: one hornet of a swarm, its wings beating through 4 frames | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid` |
| `quicksand.png` | 6 × 60×20 | Sandstorm Pass: a patch of quicksand on the road, its sand swirling in a 6-frame loop | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --cell 5.55,5.55` |
| `slagVent.png` | 10 × 46×119 | Iron Works: a slag vent's grate cold (0), glowing (1-2), erupting (3-7) and dying down (8-9) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --cell 4.05,4.05` |
| `conveyor.png` | 6 × 80×48 | Iron Works: four segments of a conveyor belt (0-3), the drive-wheel end (4) and the far end (5) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid` |
| `furnaceMouth.png` | 4 × 82×75 | Iron Works: a brick furnace at the end of a belt, its mouth burning in a 4-frame loop | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --cell 6.07,6.07 --cuts 517,998,1480` |
| `spikeTrap.png` | 5 × 78×44 | Mirage Temple: a spike tile flat (0), puffing dust (1), spikes half up (2), fully up (3) and sinking back (4) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid` |
| `templeBoulder.png` | 4 × 94×91 | Mirage Temple: a carved boulder rolling, a quarter turn a frame | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid` |
| `crackedFloor.png` | 4 × 102×58 | Bayon: a gallery floor slab whole (0), cracking (1), breaking up (2) and fallen through (3) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid` |
| `faceTower.png` | 4 × 92×128 | Bayon: a face tower standing (0), cracking (1), coming apart (2), and one falling stone of it (3) | ChatGPT image on magenta, baked with `tools/bake_magenta_sheet.py --common-grid` |

The workbench effects are saved in the PixelLab account's My effects under those ids, so they can be
opened, retuned with their sliders and exported again. The lion's leap frames play once over every bound, from push-off to
reaching for the ground, so more leap frames added to the end of `lion.png` (and its `frames` count in
`src/data/fx-sprites.js`) make every bound smoother with no code change. The pounce impact was
exported as a 4×3 grid and cut into one row, its two blank closing frames dropped; the strike, awaken,
gather, sever and rubble strips were cut the same way, their blank closing frame dropped; the gather
strip keeps only its burning frames (its gathering motes are particles in the game). The stag strip had its ground-shadow line
removed. The ice holds frames 4–7 while a raider stays frozen. The feathers fly right from the hit and are
mirrored when the strike goes left.
