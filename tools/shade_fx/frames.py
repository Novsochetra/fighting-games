"""One frame of a strip, every weapon row of it, and what the effects need to know about it."""
from dataclasses import dataclass, field
import numpy as np
from scipy import ndimage as nd

FW = 128
EIGHT = np.ones((3, 3), bool)
LOOSE_SPECK = 24


@dataclass
class Frame:
    strip: str
    index: int
    count: int
    loops: bool
    # one RGBA array per weapon row (sword, fists, spear, axe), a single one for the ultimate;
    # every effect is drawn the same into each, so the hero looks the same whatever he holds
    rows: list
    # the hero himself: no blade, no slash smear, no loose sparks
    body: np.ndarray
    # the Shade's own glow in the sword row: blade, smear, eyes, trim and runes
    glow: np.ndarray
    smear: np.ndarray
    extra: dict = field(default_factory=dict)

    @property
    def height(self):
        return self.rows[0].shape[0]

    @property
    def sword(self):
        return self.rows[0]


def without_specks(mask, smallest=LOOSE_SPECK):
    labels, count = nd.label(mask, structure=EIGHT)
    if count == 0:
        return mask
    sizes = np.bincount(labels.ravel())
    sizes[0] = 0
    return (sizes >= smallest)[labels]


# the fists row has the blade taken out and its gaps filled with what lies beside it, so its
# outline less the sword row's smear is the hero alone
def body_of(sword, bladeless, smear):
    solid = (bladeless[..., 3] > 0) & ~smear
    return without_specks(nd.binary_fill_holes(solid))


def split_rows(strip, rows):
    height = strip.shape[0] // rows
    return [strip[row * height:(row + 1) * height] for row in range(rows)]


def frames_of(name, strip, meta, rows, smear_mask, glow_mask):
    count = meta['frames']
    frames = []
    for index in range(count):
        cut = strip[:, index * FW:(index + 1) * FW].copy()
        parts = split_rows(cut, rows)
        sword = parts[0]
        smear = smear_mask(sword)
        bladeless = parts[1] if rows > 1 else sword
        frames.append(Frame(
            strip=name, index=index, count=count, loops=bool(meta.get('loop')),
            rows=parts, body=body_of(sword, bladeless, smear),
            glow=glow_mask(sword), smear=smear,
        ))
    return frames


def strip_of(frames):
    rows = len(frames[0].rows)
    return np.concatenate(
        [np.concatenate([frame.rows[row] for frame in frames], axis=1) for row in range(rows)], axis=0)
