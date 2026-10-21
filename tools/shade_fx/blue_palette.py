"""The Blue Shade's frost colours, palest first, and the few see-through ones for mist and bloom."""
from .paint import hx

WHITE = hx('#ffffff')
FROST = hx('#eef8ff')
PALE = hx('#d8ecff')
ICE = hx('#8fd0ff')
BLUE = hx('#5aa8ff')
DEEP = hx('#2a5fc8')
NAVY = hx('#16306a')
ABYSS = hx('#0a1430')
# the lit edge of his mask, as the frames draw it
MASK_EDGE = hx('#29adff')
# the brightest eye is the pale of the eyes set in the dark, never a pure white that outshines them
ICY_EYES = (DEEP, ICE, PALE)
ICY_EYE_CUTS = (0.3, 0.6)

MIST_THICK = hx('#d8ecff', 140)
MIST_THIN = hx('#8fd0ff', 80)
BLOOM = hx('#5aa8ff', 120)
