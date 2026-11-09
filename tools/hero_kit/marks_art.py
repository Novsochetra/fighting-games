"""Hand-drawn marks too small to model: scars, in the skin's own shades so they take any skin, and
small gear (earrings, a plaster). Each is {direction: [(x, y, run)]}; a direction it is hidden
from is left out.

A scar on one side of the face has a twin on the other side, drawn for south-east, east and
north-east: south-west, west and north-west are drawn from it with its sides swapped, so the scar
stays on its own cheek.
"""

SCARS = {
    'cheek-slash': {
        'south': [(41, 36, 'Lx'), (42, 37, 'Lx'), (43, 38, 'Lx')],
        'south-east': [(43, 36, 'Lx'), (44, 37, 'Lx'), (45, 38, 'Lx')],
        'east': [(51, 36, 'Lx'), (52, 37, 'Lx'), (53, 38, 'Lx')],
    },
    'split-brow': {
        'south': [(56, 28, 'x'), (56, 29, 'x'), (56, 30, 'L'), (56, 31, 'L')],
        'south-east': [(56, 28, 'x'), (56, 29, 'x'), (56, 30, 'L'), (56, 31, 'L')],
    },
    'eye-scar': {
        'south': [(45, 27, 'xL'), (45, 28, 'xL'), (45, 29, 'x'), (45, 30, 'L'), (45, 31, 'L'),
                  (45, 36, 'x'), (45, 37, 'xL'), (45, 38, 'x')],
        'south-east': [(47, 27, 'xL'), (47, 28, 'xL'), (47, 29, 'x'), (47, 30, 'L'), (47, 31, 'L'),
                       (47, 36, 'x'), (47, 37, 'xL'), (47, 38, 'x')],
        'east': [(56, 27, 'xL'), (56, 28, 'xL'), (56, 29, 'x'), (56, 30, 'L'), (56, 31, 'L'),
                 (56, 36, 'x'), (56, 37, 'x')],
    },
    'nose-bridge': {
        'south': [(48, 34, 'Lxxx')],
        'south-east': [(50, 34, 'Lxx')],
        'east': [(59, 33, 'xx')],
    },
}

TWIN_SCARS = {
    'cheek-slash': {'south-east': [(57, 36, 'xL'), (56, 37, 'xL'), (55, 38, 'xL')]},
    'split-brow': {
        'south-east': [(46, 28, 'x'), (46, 29, 'x'), (46, 30, 'L'), (46, 31, 'L')],
        'east': [(56, 28, 'x'), (56, 29, 'x'), (56, 30, 'L'), (56, 31, 'L')],
    },
    'eye-scar': {
        'south-east': [(55, 27, 'xL'), (55, 28, 'xL'), (55, 29, 'x'), (55, 30, 'L'), (55, 31, 'L'),
                       (55, 36, 'x'), (55, 37, 'x'), (55, 38, 'x')],
    },
}

TWINNED = ('cheek-slash', 'split-brow', 'eye-scar')

GEAR = {
    'earrings': {
        'south': [(37, 36, '7'), (37, 37, '5'), (62, 36, '7'), (62, 37, '5')],
        'south-east': [(40, 36, '7'), (40, 37, '5')],
        'east': [(46, 37, '7'), (46, 38, '5')],
        'north-east': [(58, 36, '7'), (58, 37, '5')],
        'north': [(37, 36, '7'), (37, 37, '5'), (62, 36, '7'), (62, 37, '5')],
    },
    'nose-plaster': {
        'south': [(48, 34, '34443'), (48, 35, '23332')],
        'south-east': [(51, 34, '3443'), (51, 35, '2332')],
        'east': [(59, 33, '443'), (59, 34, '332')],
    },
}
