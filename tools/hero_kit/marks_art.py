"""Hand-drawn marks too small to model: scars, in the skin's own shades so they take any skin, and
small gear (earrings, a plaster). Each is {direction: [(x, y, run)]}; a direction it is hidden
from is left out."""

SCARS = {
    'cheek-slash': {
        'south': [(42, 32, 'Lx'), (43, 33, 'Lx'), (44, 34, 'Lx')],
        'south-east': [(43, 32, 'Lx'), (44, 33, 'Lx'), (45, 34, 'Lx')],
        'east': [(51, 32, 'Lx'), (52, 33, 'Lx'), (53, 34, 'Lx')],
    },
    'split-brow': {
        'south': [(55, 23, 'x'), (55, 24, 'x'), (55, 25, 'L'), (55, 26, 'L')],
        'south-east': [(54, 23, 'x'), (54, 24, 'x'), (54, 25, 'L'), (54, 26, 'L')],
    },
    'eye-scar': {
        'south': [(44, 22, 'xL'), (44, 23, 'xL'), (44, 24, 'x'), (44, 25, 'L'), (44, 26, 'L'),
                  (44, 32, 'x'), (44, 33, 'xL'), (44, 34, 'x')],
        'south-east': [(46, 22, 'xL'), (46, 23, 'xL'), (46, 24, 'x'), (46, 25, 'L'), (46, 26, 'L'),
                       (46, 32, 'x'), (46, 33, 'xL'), (46, 34, 'x')],
        'east': [(57, 22, 'xL'), (57, 23, 'xL'), (57, 24, 'x'), (57, 26, 'L'), (57, 27, 'L'),
                 (57, 32, 'x'), (57, 33, 'x')],
    },
    'nose-bridge': {
        'south': [(47, 31, 'Lxxxx'), (52, 31, 'L')],
        'south-east': [(49, 31, 'Lxxxx')],
        'east': [(59, 30, 'xx')],
    },
}

GEAR = {
    'earrings': {
        'south': [(37, 32, '7'), (37, 33, '5'), (62, 32, '7'), (62, 33, '5')],
        'south-east': [(38, 32, '7'), (38, 33, '5')],
        'east': [(46, 34, '7'), (46, 35, '5')],
        'north-east': [(58, 34, '7'), (58, 35, '5')],
        'north': [(38, 33, '7'), (38, 34, '5'), (61, 33, '7'), (61, 34, '5')],
    },
    'nose-plaster': {
        'south': [(47, 31, '344443'), (47, 32, '233332')],
        'south-east': [(49, 31, '34443'), (49, 32, '23332')],
        'east': [(58, 30, '443'), (58, 31, '332')],
    },
}
