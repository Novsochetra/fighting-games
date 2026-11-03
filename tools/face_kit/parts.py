"""Turn labelled cells into the kit's parts: letter grids in the portraits' own letters
(apps/web/games/naga-eleven/src/render/portraits/legend.js), each with the point that sits on the
top of the skull, so any hair or hat lines up on any face.
"""
from label import groups_of, light

EIGHT = [(dx, dy) for dx in (-1, 0, 1) for dy in (-1, 0, 1) if dx or dy]

SKIN = '4321'
HAIR = 'kghH'
SHIRT = 'DCBA'
GEAR = 'GFEW'
# how far under the top of the skull its width is read, to find the middle of the head
SKULL_DEPTH = 10
# ChatGPT paints the silver hair mostly light; read evenly, black hair came out its blue-grey
# highlight all over, so the hair's shades lean dark and the highlight keeps to the tips
HAIR_LEAN = 1.6


def shade(px, point, low, high, letters, lean=1.0):
    share = max(0.0, (light(px[point]) - low) / max(1, high - low)) ** lean
    return letters[max(0, min(len(letters) - 1, int(share * len(letters))))]


def range_of(px, points):
    values = [light(px[k]) for k in points] or [0]
    return min(values), max(values)


def calibrate(cell):
    return {'skin': range_of(cell['px'], cell['skin']), 'shirt': range_of(cell['px'], cell['shirt'])}


def face_letters(cell, ranges):
    px, letters = cell['px'], {}
    hair_range = range_of(px, cell['hair'])
    for point in px:
        letters[point] = face_letter(cell, point, ranges, hair_range)
    return letters


def face_letter(cell, point, ranges, hair_range):
    px = cell['px']
    if point in cell['outline']:
        return 'O'
    named = {'eyes': 'w', 'teeth': 't', 'mouth': 'm'}
    for part, letter in named.items():
        if point in cell[part]:
            return letter
    if point in cell['iris']:
        return 'i' if light(px[point]) < 60 else 'l'
    if point in cell['hair']:
        return shade(px, point, *hair_range, HAIR, HAIR_LEAN)
    if point in cell['shirt']:
        return shade(px, point, *ranges['shirt'], SHIRT)
    return shade(px, point, *ranges['skin'], SKIN)


def rimmed(cell, points):
    rim = {k for k in cell['outline'] if k not in points and any(
        (k[0] + dx, k[1] + dy) in points for dx in (-1, 0, 1) for dy in (-1, 0, 1))}
    return {k: 'O' for k in rim}


def hair_letters(cell):
    low_high = range_of(cell['px'], cell['hair'])
    return {**rimmed(cell, cell['hair']),
            **{k: shade(cell['px'], k, *low_high, HAIR, HAIR_LEAN) for k in cell['hair']}}


# a stud a few pixels wide has nearly one shade, which read over the whole ramp came out its
# darkest and vanished on dark skin; read over at least this much light, its shine stays bright
GEAR_SPAN = 60


def gear_letters(cell):
    px = cell['px']
    green = {k for k, p in px.items() if p[1] > p[0] + 40 and p[1] > p[2] + 40}
    low, high = range_of(px, green)
    low_high = (min(low, high - GEAR_SPAN), high)
    return {**rimmed(cell, green), **{k: shade(px, k, *low_high, GEAR) for k in green}}


# a stubble's dots stay dots; a moustache or a beard keeps the outline painted round it
SOLID = 20


def touches(group, points):
    return any((x + dx, y + dy) in points for x, y in group for dx, dy in EIGHT)


def facial_letters(cell):
    """The grey under the eyes; on a stern shut mouth no white is teeth, so a moustache or a goatee
    the labels took for teeth is kept, and the collar, grey too, is told apart by meeting the shirt."""
    px = cell['px']
    eyes_bottom = max((y for _, y in cell['eyes']), default=cell['size'][1] // 2)
    grey = {k for k, p in px.items() if k not in cell['outline'] and k not in cell['shirt']
            and p[0] <= p[2] + 25 and light(p) > 110 and k[1] > eyes_bottom + 1}
    groups = [g for g in groups_of(grey, EIGHT) if not touches(g, cell['shirt'])]
    grey = set().union(*groups or [set()])
    low_high = range_of(px, grey)
    solid = set().union(*[g for g in groups if len(g) >= SOLID] or [set()])
    return {**rimmed(cell, solid), **{k: shade(px, k, *low_high, HAIR, HAIR_LEAN) for k in grey}}


def skull_anchor(letters):
    top = min(y for _, y in letters)
    row = [x for x, y in letters if y == top + SKULL_DEPTH]
    return (min(row) + max(row)) / 2, top


def shirt_anchor(cell):
    bottom = max(y for _, y in cell['shirt'])
    row = [x for x, y in cell['shirt'] if y >= bottom - 2]
    return (min(row) + max(row)) / 2, bottom


def sheet_offset(bald_cell, bald_letters):
    sx, sy = skull_anchor(bald_letters)
    ax, ay = shirt_anchor(bald_cell)
    return sx - ax, sy - ay


def layer_anchor(cell, offset):
    ax, ay = shirt_anchor(cell)
    return ax + offset[0], ay + offset[1]
