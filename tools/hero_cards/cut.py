#!/usr/bin/env python3
"""Cut a sheet of a Khmer fighter's frames, drawn on magenta, into his select card's art.

    python3 tools/hero_cards/cut.py bokator pose SHEET.png            # every frame, in order
    python3 tools/hero_cards/cut.py bokator idle SHEET.png 0,2,3,4,5,6

Each frame is lifted off the magenta, shrunk by the one scale that makes the first picked frame as
tall as the art it replaces (frame 0 of `card_win.png` for the middle card's `pose`, row 0 of
`arsenal/hero_idle.png` for the side cards' `idle`) in one short palette shared by all its frames,
its dark line closed with that art's outline colour, and set with its feet where that art's feet
are. The frames go to `heroes/<hero>/card/<loop>.png`, the art `bake.py` dresses for the card.
"""
import os
import sys

import numpy as np
from PIL import Image

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hero_cards.keying import split_frames  # noqa: E402
from hero_cards.sheet import frame_of, hero_file, strip_of  # noqa: E402
from hero_cards.shrink import (despeckled, feet_of, height_of, outlined, palette_of, shrink,  # noqa: E402
                               stand, steadied)

REFERENCE = {'pose': ('card_win.png', 0), 'idle': ('arsenal/hero_idle.png', 0)}


def darkest(palette):
    return np.append(palette[palette.sum(1).argmin()], 255).astype(np.uint8)


def cut(hero, loop, sheet_path, picks):
    reference = frame_of(hero, *REFERENCE[loop])
    sheet = np.array(Image.open(sheet_path).convert('RGBA'))
    drawn = split_frames(sheet)
    chosen = [drawn[index] for index in picks] if picks else drawn
    scale = height_of(reference) / height_of(chosen[0])
    palette = palette_of(chosen)
    ink, feet = darkest(reference[reference[..., 3] > 0][:, :3].astype(int)), feet_of(reference)
    frames = steadied([stand(outlined(despeckled(shrink(frame, scale, palette)), ink), feet)
                       for frame in chosen])
    path = hero_file(hero, os.path.join('card', f'{loop}.png'))
    os.makedirs(os.path.dirname(path), exist_ok=True)
    Image.fromarray(strip_of(frames)).save(path, optimize=True)
    print(f'{len(drawn)} frames on the sheet, wrote {len(frames)} at scale {scale:.3f} to {path}')


if __name__ == '__main__':
    hero, loop, sheet_path = sys.argv[1:4]
    picks = [int(index) for index in sys.argv[4].split(',')] if len(sys.argv) > 4 else None
    cut(hero, loop, sheet_path, picks)
