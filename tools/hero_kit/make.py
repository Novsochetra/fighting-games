"""Rebuilds the whole hero kit in order: the body, the hairstyles, the gear, the hand-drawn marks,
then kit.json and the inspector page."""

from pathlib import Path

import bake_gear
import bake_hair
import body_draw
import export
import hair_draw
import marks_draw
import scalp
from hair_art import spiky
from render import FACINGS

DRAWN_HAIR = sorted({path.stem.split('_')[0] for path in (Path(__file__).parent / 'hair_art').glob('[a-z]*_*.py')})


def main():
    body_draw.main([])
    bake_hair.main([])
    scalp.main()

    for style in DRAWN_HAIR:
        for direction in FACINGS:
            if hair_draw.has_art(style, direction):
                hair_draw.draw(style, direction)

    spiky.main()

    bake_gear.main([])
    marks_draw.main()
    export.main()


if __name__ == '__main__':
    main()
