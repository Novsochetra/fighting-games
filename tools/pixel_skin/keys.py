"""The keys of a pixel skin, cut out of a sheet ChatGPT painted on magenta, three by two: the d-pad,
a round key up and pressed, a pill key up and pressed. Each is read on square blocks (a key's shape
shows) and a pressed key stands on its key's canvas, so it shows as painted, a touch smaller."""
import numpy as np

from pixel_skin.grid import read_region
from pixel_skin.pieces import centred_on, folded, save

KEY_COLOURS = 24
# each key's cell in the sheet, by column and row, and the key whose canvas it shares
KEYS = {
    'dpad': ((0, 0), 'dpad'),
    'key-round': ((1, 0), 'key-round'),
    'key-round-pressed': ((2, 0), 'key-round'),
    'key-pill': ((0, 1), 'key-pill'),
    'key-pill-pressed': ((1, 1), 'key-pill'),
}
SQUARE = {'dpad', 'key-round'}
# the sheet's cells are parted by thin lines
CELL_INSET = 12
# how far into a key's edge the magenta blended into it reaches
FRINGE_DEPTH = 2


def touching(mask):
    near = mask.copy()
    near[1:] |= mask[:-1]
    near[:-1] |= mask[1:]
    near[:, 1:] |= mask[:, :-1]
    near[:, :-1] |= mask[:, 1:]

    return near


def keyed(sheet):
    """The sheet with its magenta made clear, and the magenta blended into a key's edge: only
    where it touches the magenta, as the grey handheld's red keys have a pink highlight inside"""
    red, green, blue = (sheet[..., channel].astype(int) for channel in range(3))
    clear = (red > 170) & (blue > 170) & (green < 100)
    fringe = (red > green + 30) & (blue > green + 30)

    for _ in range(FRINGE_DEPTH):
        clear |= fringe & touching(clear)

    out = sheet.copy()
    out[..., 3] = np.where(clear, 0, 255)

    return out


def key_art(sheet, column, row):
    height, width = sheet.shape[0] // 2, sheet.shape[1] // 3
    left, top = column * width + CELL_INSET, row * height + CELL_INSET
    cell = sheet[top : top + height - 2 * CELL_INSET, left : left + width - 2 * CELL_INSET]
    ys, xs = np.nonzero(cell[..., 3])
    box = (left + xs.min(), top + ys.min(), left + xs.max() + 1, top + ys.max() + 1)

    return read_region(sheet, box, square=True)


def bake_keys(sheet, out_dir):
    sheet = keyed(sheet)
    arts = dict(zip(KEYS, folded([key_art(sheet, *cell) for cell, _ in KEYS.values()], KEY_COLOURS)))

    for name, (_, canvas_of) in KEYS.items():
        shared = [art.shape[:2] for key, art in arts.items() if KEYS[key][1] == canvas_of]
        height, width = np.max(shared, axis=0)

        if canvas_of in SQUARE:
            height = width = max(height, width)

        save(centred_on(arts[name], width, height), f'{out_dir}/{name}.png')
