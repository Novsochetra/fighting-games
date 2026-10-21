#!/usr/bin/env python3
"""Write the select-screen card loops of the Bokator fighter and the Angkor Warrior.

    python3 tools/hero_cards/bake.py            # both heroes
    python3 tools/hero_cards/bake.py bokator    # one

Takes the hero's drawn card frames, `card/pose.png` and `card/idle.png` (cut from a sheet by
`cut.py`), lays the light he stands in over them (`aura.py`) and writes `card_pose.png` (the middle
card) and `card_idle.png` (the side cards) beside them, each six 128x112 frames on one row. It
never writes its inputs, and the same inputs always give the same files.
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from hero_cards import aura  # noqa: E402
from hero_cards.sheet import frames_in, hero_file, save_strip  # noqa: E402

HEROES = ('bokator', 'angkor')
LOOPS = {'card_pose.png': 'pose', 'card_idle.png': 'idle'}


def art_of(hero, card):
    return frames_in(hero_file(hero, os.path.join('card', f'{card}.png')))


def bake(hero):
    for name, card in LOOPS.items():
        print('wrote', save_strip(aura.dress(hero, art_of(hero, card)), hero, name))


if __name__ == '__main__':
    for hero in sys.argv[1:] or HEROES:
        if hero not in HEROES:
            sys.exit(f'unknown hero {hero!r}; pick from {", ".join(HEROES)}')
        bake(hero)
