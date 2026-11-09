"""The letters the hero's grids are written in: each names a ramp and a shade, dark to light, so a
player's colours repaint the same art shade for shade."""

OUTLINE = 'o'
EMPTY = '.'

RAMP_LETTERS = {
    'skin': 'xsSL',
    'shirt': 'drRP',
    'trim': 'tTY',
    'shorts': 'cbBC',
    'stripe': 'vV',
    'socks': 'efFG',
    'boots': 'muUW',
    'sole': 'nN',
    'hair': 'ghHJ',
    'eyes': 'kiE',
    'gear': '1234',
    'metal': '567',
}

LETTERS = {letter: (ramp, shade) for ramp, letters in RAMP_LETTERS.items() for shade, letter in enumerate(letters)}


def letter_for(ramp, shade):
    letters = RAMP_LETTERS[ramp]

    return letters[max(0, min(shade, len(letters) - 1))]
