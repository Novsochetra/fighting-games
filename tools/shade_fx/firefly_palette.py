"""The Firefly Shade's colors: warm firefly light and its fading trails, the cloth it lights, and
the cyan of his eyes and blade.
"""
from .paint import hx

WHITE_HOT = hx('#fffbe0')
SPARK = hx('#fff3a6')
GLOW = hx('#ffe066')
LIME = hx('#c9e04a')
GLOW_DIM = hx('#c9a23a')

# glow that only ever lands on empty pixels, at the faded end of a firefly's trail
TRAIL_FADE = hx('#c9a23a', 120)
TRAIL_FAINT = hx('#c9a23a', 60)

# the hooded cloak where a resting firefly lights it
CLOAK_LIT = hx('#3c5a1e')
CLOAK_WARM = hx('#5f7a24')

EYE_CORE = hx('#e8fdff')
EYE = hx('#4fd8ff')
EYE_SPILL = hx('#12405a')
BLADE_BLOOM = hx('#4fd8ff', 120)

# what a firefly shows at each brightness, from dim to flaring: its core, the cross of glow round
# it, its trail; at no brightness it has blinked out
LEVELS = {
    1: (LIME, None, (TRAIL_FADE,)),
    2: (SPARK, GLOW_DIM, (GLOW_DIM, TRAIL_FADE, TRAIL_FAINT)),
    3: (WHITE_HOT, GLOW, (GLOW_DIM, GLOW_DIM, TRAIL_FADE, TRAIL_FAINT)),
}
