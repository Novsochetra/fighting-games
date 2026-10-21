"""Dress a Shade's baked strips in its element, the way the Ember Shade's frames burn.

`tools/bake_hero_weapons.py` hands every baked strip (four weapon rows) through `dress`, and the
Shade's ultimate through `dress_ult`, before it saves them. Each Shade's look is a module of its
own here (`moss.py`, `firefly.py`, `antler.py`, `blue.py`) with a `dress_strip(frames)` that changes
`frame.rows` in place; a hero without one is saved as baked.
"""
import importlib
import numpy as np
from PIL import Image
from .frames import frames_of, strip_of

DRESSED = ('moss', 'firefly', 'antler', 'blue')
ULT_META = {'frames': 9, 'loop': False}


def recipe(hero):
    return importlib.import_module(f'{__name__}.{hero}') if hero in DRESSED else None


def dress(hero, strips, meta, smear_mask, glow_mask):
    look = recipe(hero)
    if look is None:
        return strips
    out = {}
    for name, strip in strips.items():
        frames = frames_of(name, strip, meta['animations'][name], 4, smear_mask, glow_mask)
        look.dress_strip(frames)
        out[name] = strip_of(frames)
    return out


def dress_ult(hero, path, smear_mask, glow_mask):
    look = recipe(hero)
    if look is None:
        return None
    strip = np.array(Image.open(path).convert('RGBA'))
    frames = frames_of('ult', strip, ULT_META, 1, smear_mask, glow_mask)
    look.dress_strip(frames)
    return strip_of(frames)
