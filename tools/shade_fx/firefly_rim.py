"""The swarm behind the Firefly Shade lights his cloak's trailing edge, just inside its outline."""
from .firefly_palette import CLOAK_LIT
from .paint import luma, rows_between, shifted, side_edge

# from below his hood down to the hem
RIM_TOP = 0.2
RIM_BOTTOM = 0.97
OUTLINE_DARK = 0.04


def rim_of(frame):
    scene = frame.extra['firefly']
    top, bottom = scene.box[0], scene.box[1]
    edge = shifted(side_edge(frame.body, -1, 0), 1, 0)
    cloth = scene.cloth & scene.open & (luma(frame.sword) >= OUTLINE_DARK)
    span = bottom - top
    return rows_between(edge & cloth, top + int(RIM_TOP * span), top + int(RIM_BOTTOM * span))


def light_rim(frames):
    for frame in frames:
        rim = rim_of(frame)
        for row in frame.rows:
            row[rim] = CLOAK_LIT
