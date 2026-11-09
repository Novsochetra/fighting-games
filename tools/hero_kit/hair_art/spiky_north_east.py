"""The hero's spiky hair from behind and to his left (see spiky_back.py); the twin has the sweep
on the other side, for the mirrored north-west."""

from hair_art.spiky_back import SHEENED, back_locks
from locks import band

LOCKS = back_locks(shift=-1)

TWIN_LOCKS = back_locks(shift=-1, swept_right=False)

SHEEN = band((49, 24), (11, 9), 1.6, left_of=50)

SHEENED = SHEENED

TWIN_SHEENED = SHEENED
