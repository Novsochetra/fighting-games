"""Where, in each frame read back, a figure's hair is, and the ball and the boots.

ChatGPT painted the hair, the kit, the boots and the ball in the same few greys, so only where they
lie tells them apart. Boxes are (x, y, right, bottom) in the frame's own pixels; `white` is how
light a grey outside the hair must be to stay white (gloves, boots, trim) and not take the kit's
colours; `boot_rows` are the frame's lowest rows, the boots on the ground.
"""

FIGURES = {
    'strike': {
        'block': 4.8,
        'white': 215,
        'boot_rows': 12,
        'frames': [
            {'hair': [(20, 0, 64, 19)], 'gear': [(48, 76, 68, 96), (0, 76, 14, 90)]},
            {'hair': [(34, 0, 74, 19)], 'gear': [(52, 72, 74, 95), (0, 74, 16, 90)]},
            {'hair': [(26, 0, 66, 19)], 'gear': [(55, 74, 76, 97), (0, 40, 20, 54)]},
            {'hair': [(20, 0, 62, 18)], 'gear': [(57, 64, 78, 86), (46, 72, 64, 86)]},
            {'hair': [(14, 0, 60, 19)], 'gear': [(63, 42, 82, 61)]},
        ],
    },
    # front on: ready, the dive's catch, knocked back, flung, in the net, dazed
    'keeper': {
        'block': 5.0,
        'white': 170,
        'boot_rows': 0,
        'frames': [
            {'hair': [(25, 0, 56, 17)]},
            {'hair': [(28, 11, 54, 29)], 'gear': [(58, 0, 79, 19)]},
            {'hair': [(11, 5, 31, 21), (11, 20, 23, 25)], 'gear': [(64, 0, 82, 18)]},
            {'hair': [(8, 0, 30, 16)]},
            {'hair': [(22, 36, 45, 55)]},
            {'hair': [(10, 16, 42, 34)]},
        ],
    },
    # side on: two of them running in, lunging, lifted by the shot, spinning, flung, down
    'defenders': {
        'block': 5.0,
        'white': 200,
        'boot_rows': 0,
        'frames': [
            {'hair': [(18, 0, 40, 13), (59, 0, 82, 13)]},
            {'hair': [(17, 0, 39, 13), (55, 0, 77, 13)]},
            {'hair': [(0, 0, 17, 15), (73, 0, 95, 15)]},
            {'hair': [(0, 8, 16, 27), (78, 18, 94, 36)]},
            {'hair': [(4, 0, 22, 13), (73, 2, 92, 17)]},
            {'hair': [(2, 1, 21, 16), (81, 6, 97, 25)]},
        ],
    },
}
