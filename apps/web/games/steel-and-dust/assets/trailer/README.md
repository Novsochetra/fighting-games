# Trailer

The game's promotional video, which `game.json` names as its `trailer`: the arcade plays it beside
Play (the hero's Trailer button and the details sheet). It is not part of the game, so no offline
save keeps it (`assets/trailer/` is left out of `offline.json`).

| File          | Size   | Length | What it shows                                                                                        |
| ------------- | ------ | ------ | ---------------------------------------------------------------------------------------------------- |
| `trailer.mp4` | 9.1 MB | 30 s   | The title over Angkor and the hero select, then all seven heroes, the twelve missions and the bosses |

The cut, second by second:

| From   | What                                                                                                                |
| ------ | ------------------------------------------------------------------------------------------------------------------- |
| 0:00   | The intro: "It ends at Angkor.", the title, the hero select landing on Bokator                                      |
| 0:06.6 | Bokator across the Naga Causeway at Angkor Wat, Pounding the Lion in slow motion                                    |
| 0:09.6 | SEVEN HEROES: the other six heroes' ultimates, from Absolute Zero to Thousand Cuts                                  |
| 0:14.1 | TWELVE MISSIONS: every mission's own title card, Mission 1 Pine Ridge to Mission 12 Bayon, a third of a second each |
| 0:18.1 | TWELVE BOSSES: the Furnace Knight, the Sand Pharaoh, the Naga Raja, then the Bayon Guardian                         |
| 0:23.1 | A flurry of the hardest hits, a cut to black                                                                        |
| 0:25.1 | The title again, and PLAY NOW                                                                                       |

## How it was made

The first 6.6 seconds are the intro made for the game. The rest is the game itself, recorded at 768×432
in Chromium (tab capture, with the game's own sound, while an autopilot drove `window.__steelAndDust`
through each mission with Training tools on), then cut, framed and graded frame by frame: every camera
move scales the pixels up by whole multiples first, so they stay square as the camera pushes in. The
section lines are set in the game's Silkscreen (`assets/fonts/`).

The sound is the intro's own, carried through the whole trailer (it is in A minor, as the game's
songs are, with a 120 BPM pulse in its hero select that the cuts follow): its title reveal opens each
section and the end card, its rising sweep leads into them, bars of its hero-select pulse run under
the heroes and the bosses, and its select burst lands on the hits, at half speed (an octave down) for
the slow motion and the bosses, and stepping up the A minor scale through the flurry. The game's own
hits sit underneath, and the mix is at −14 LUFS.

The file here is the web copy, made from the 1080p master for phones on a data plan:

```bash
ffmpeg -i master.mp4 -vf scale=1280:720:flags=lanczos -c:v libx264 -profile:v high -level 4.1 \
  -preset slower -crf 28 -pix_fmt yuv420p -g 120 -c:a aac -b:a 128k -movflags +faststart trailer.mp4
```

MP4 with H.264 and AAC is the one kind every phone the arcade runs on plays; `+faststart` puts the
index first, so it starts playing before it has all come down.
