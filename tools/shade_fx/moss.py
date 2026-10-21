"""The moss Shade's look, after his PixelLab design: his hood and face left bare as drawn, dark moss
with olive tips on his shoulders, his cloak's trailing edge going dark green and its hem breaking
into dark mossy strands, now and then a dark leaf or a dim spore falling off it, and a faint haze
beside his blade."""
import numpy as np
from .moss_drift import spores
from .moss_glow import blade_of, bloom
from .moss_growth import growth, hem_lumps
from .moss_shape import shapes_of


# a pixel a weapon row drew differently (a spear across him, the gap a blade left) keeps its weapon,
# and moss grown out past his outline never covers his blade
def lay_over(frame, overlay, plain, hero):
    painted = overlay[..., 3] > 0
    for row in frame.rows:
        target = painted & np.all(row == plain, axis=-1) & (hero | (row[..., 3] == 0))
        row[target] = overlay[target]


# on a looping strip a hem strand hanging in the frames either side of one hangs in it too, so none
# blinks out for the one frame his hem's trim dips below its cloth
def kept_strands(frames, shapes):
    if not frames[0].loops:
        return [set() for _ in frames]
    hung = [hem_lumps(frame, shape) for frame, shape in zip(frames, shapes)]
    return [hung[i - 1] & hung[(i + 1) % len(hung)] for i in range(len(hung))]


def dress_strip(frames):
    shapes = shapes_of(frames)
    plains = [frame.sword.copy() for frame in frames]
    blades = [blade_of(frame, shape, plain) for frame, shape, plain in zip(frames, shapes, plains)]
    kept = kept_strands(frames, shapes)
    for frame, shape, plain, keep in zip(frames, shapes, plains, kept):
        lay_over(frame, growth(frame, shape, keep), plain, shape.hero)
    spores(frames, shapes)
    for frame, shape, blade in zip(frames, shapes, blades):
        bloom(frame, shape, blade)
