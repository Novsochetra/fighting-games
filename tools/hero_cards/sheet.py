"""Reading a frame out of a strip and writing a loop of frames as a strip."""
import os
import numpy as np
from PIL import Image

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
HEROES = os.path.join(ROOT, 'apps/web/games/steel-and-dust/assets/sprites/heroes')
FW, FH = 128, 112
FRAMES = 6


def hero_file(hero, name):
    return os.path.join(HEROES, hero, name)


def frame_of(hero, name, index, row=0):
    strip = np.array(Image.open(hero_file(hero, name)).convert('RGBA'))
    return strip[row * FH:(row + 1) * FH, index * FW:(index + 1) * FW].copy()


def strip_of(frames):
    return np.concatenate(frames, axis=1)


def save_strip(frames, hero, name):
    path = hero_file(hero, name)
    Image.fromarray(strip_of(frames), 'RGBA').save(path, optimize=True)
    return path


def frames_in(path):
    strip = np.array(Image.open(path).convert('RGBA'))
    return [strip[:, i * FW:(i + 1) * FW] for i in range(strip.shape[1] // FW)]
