"""The hero's spiky hair from behind (see spiky_back.py)."""

from hair_art.spiky_back import SHEENED, back_locks
from locks import band

LOCKS = back_locks()

SHEEN = band((50, 24), (11, 9), 1.6, left_of=52)

SHEENED = SHEENED
