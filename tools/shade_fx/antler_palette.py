"""The Antler Spirit Shade's ghost fire: a cold teal flame that burns palest where it is hottest."""
from .paint import hx

WHITE = hx('#f0fffb')
PALE = hx('#c8fff0')
GLOW = hx('#9dffe6')
TEAL = hx('#3fe0c0')
MID = hx('#1f9f8a')
DEEP = hx('#0f5a50')
ABYSS = hx('#083530')

# see-through glow, only ever laid on empty pixels
HAZE = hx('#3fe0c0', 120)
MIST = hx('#1f9f8a', 80)

# what a pixel burns with by how far into the flame it lies, hottest first
FLAME = [PALE, GLOW, TEAL, MID, DEEP]
