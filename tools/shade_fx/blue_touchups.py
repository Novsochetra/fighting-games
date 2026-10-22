"""Hand-set pixels for the frames where no rule can tell a crowded mote, fused twinkle or stray fleck."""

ICE = (143, 208, 255)
PALE = (216, 236, 255)
WHITE = (255, 255, 255)
DEEP = (42, 95, 200)
SEAM = (20, 127, 210)
BLACK = (0, 0, 0)
CLEAR = (0, 0, 0, 0)

TOUCHUPS = {
    ('land', 0): [(51, 38, None), (48, 40, None), (49, 43, None)],
    ('dash', 2): [(52, 45, None), (44, 52, None)],
    ('juggle', 1): [(44, 39, None), (49, 35, ICE)],
    ('juggle', 2): [(43, 39, None)],
    ('juggle', 3): [(49, 35, ICE)],
    ('getup', 0): [(38, 66, None), (40, 68, None)],
    ('ko', 2): [(37, 59, None), (38, 58, None), (38, 59, None), (38, 60, None), (39, 59, None),
                (35, 59, ICE), (37, 59, ICE), (36, 58, ICE), (36, 60, ICE), (36, 59, WHITE)],
    ('win', 0): [(51, 45, None)],
    ('slash2', 0): [(50, 42, None)],
    ('thrust', 3): [(32, 65, ICE), (32, 66, ICE), (33, 65, PALE)],
    ('rising_dragon', 0): [(50, 71, None), (49, 71, None), (51, 71, None), (50, 72, None),
                           (49, 74, ICE), (51, 74, ICE), (50, 73, ICE), (50, 75, ICE),
                           (50, 74, WHITE), (48, 45, None)],
    ('air_slash', 1): [(76, 31, None), (77, 32, None)],
    ('air_slash', 2): [(62, 33, SEAM)],
    ('air_slash', 3): [(62, 33, SEAM)],
    ('air_rising_cut', 2): [(69, 26, BLACK), (69, 27, BLACK), (69, 28, BLACK)],
    ('air_rising_cut', 3): [(69, 26, BLACK), (69, 27, BLACK), (69, 28, BLACK)],
    ('meteor_slash', 0): [(48, 46, None)],
    ('plunge', 0): [(54, 73, DEEP), (54, 74, DEEP), (55, 74, DEEP), (56, 74, DEEP), (57, 74, DEEP)],
    ('ult', 0): [(50, 41, None), (49, 51, None)],
    ('ult', 7): [(29, 47, None), (31, 51, None)],
    ('ult', 8): [(31, 49, None), (28, 53, None)],
}


def touch_up(frame):
    for x, y, colour in TOUCHUPS.get((frame.strip, frame.index), ()):
        for row in frame.rows:
            row[y, x] = CLEAR if colour is None else (*colour, 255)
