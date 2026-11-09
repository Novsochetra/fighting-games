"""The hero from the front: the reference's body from the collar down, cleaned, under a bald head
drawn by hand with the reference's face, so every hairstyle sits on the same skull."""

from bake import body_rows
from letters import RAMP_LETTERS
from reference.front import face_rows
from render import FACINGS
from reference.front import rows as reference_rows

HEAD = [
    (44, 17, 'oooooooooo'),
    (42, 18, 'ooLLLLLLSSSSoo'),
    (41, 19, 'oLLLLLLLSSSSSsso'),
    (40, 20, 'oLLLLLLLLSSSSSSsso'),
    (39, 21, 'oLLLLLLLLSSSSSSSSsso'),
    (39, 22, 'oLLLLLLLSSSSSSSSSsso'),
    (38, 23, 'oLLLLLLSSSSSSSSSSSSsso'),
    (38, 24, 'oLLLLLSSSSSSSSSSSSSsso'),
    (38, 25, 'oLLLLSSSSSSSSSSSSSSsso'),
    (38, 26, 'oLLLSSSSSSSSSSSSSSSsso'),
    (38, 27, 'oLLSSSSSSSSSSSSSSSSsso'),
    (38, 28, 'oLSSSSSSSSSSSSSSSSSsso'),
    (38, 29, 'oSSSSSSSSSSSSSSSSSSsso'),
    (38, 30, 'oSSSSSSSSSSSSSSSSSSsso'),
    (38, 31, 'oSSSSSSSSSSSSSSSSSSsso'),
    (38, 32, 'oLSSSSSSSSSSSSSSSSSsso'),
    (38, 33, 'oLSSSSSSSSSSSSSSSSSsso'),
    (38, 34, 'oLSSSSSSSSSSSSSSSSSsso'),
    (38, 35, 'oSSSSSSSSSSSSSSSSSSsso'),
    (39, 36, 'oSSSSSSSSSSSSSSSSsso'),
    (40, 37, 'oSSSSSSSSSSSSSSsso'),
    (42, 38, 'oSSSSSSSSSSsso'),
    (43, 39, 'oosSSSSSssoo'),
    (38, 40, '.....ooSSSSSssoo......'),
]

COLLAR = [
    (36, 41, 'ooooooooooo' + 'ssss' + 'oooooooooooo'),
    (34, 42, 'oorTTTTRRTTsSSSSssTTRRTTTTroo'),
    (43, 43, 'TTsSSSSSssTT'),
    (44, 44, 'rTTSSssTTr'),
    (45, 45, 'rTTssTTr'),
    (46, 46, 'rTTTTr'),
]

BROWS = [
    (38, 30, 'oSggggSSSSSSSSSSggggSo'),
    (36, 31, 'oooooss' + 'ggggg' + 'SS' + 'ggggg' + 'sss' + 'ooooo'),
]

# The reference is drawn a pixel left of the canvas's centre line, where every other direction stands.
SHIFT = 1

FIXES = [
    (49, 71, 'o'), (50, 71, 'o'), (50, 72, 'o'), (50, 73, 'o'), (50, 74, 'o'), (50, 75, 'o'),
    (39, 83, 's'), (57, 83, 's'),
]


RESHADED = {ramp: RAMP_LETTERS[ramp] for ramp in ('skin', 'shirt', 'shorts', 'socks')}
BODY_FROM = 44


def clean_shading(rows):
    """The reference's own shading is speckled; under its outlines and details, each pixel of skin,
    shirt, shorts and sock takes the shade the fitted 3D body gives that spot, so light falls in
    clean shapes from the upper left, as in every other direction."""
    lit = body_rows(FACINGS['south'])

    for y in range(BODY_FROM, len(rows)):
        for x in range(len(rows[y]) - SHIFT):
            mine, theirs = rows[y][x], lit[y][x + SHIFT]

            for letters in RESHADED.values():
                if mine in letters and theirs in letters:
                    rows[y][x] = theirs

    return rows


def drawn_rows():
    rows = reference_rows()

    for x, y, run in HEAD + FIXES:
        rows[y][x:x + len(run)] = run

    rows = face_rows(rows)

    for x, y, run in BROWS + COLLAR:
        rows[y][x:x + len(run)] = run

    rows = clean_shading(rows)

    return [['.'] * SHIFT + row[:-SHIFT] for row in rows]
