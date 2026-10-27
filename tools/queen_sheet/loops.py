"""Hold the Scorpion Queen's body still through her idle, walk and charge loops."""

import numpy as np

# ChatGPT redrew her whole body in every pose of a loop, so a loop played back shimmers; each loop
# keeps its first pose's body above the split, lifted by the bob, over each pose's own legs (the
# idle over the first pose's legs too: she breathes, her legs stay planted)
SPLIT = 128
LOOPS = {
    'idle': {'bob': [0, 1, 2, 1], 'legs': False},
    'walk': {'bob': [0, 1, 1, 0, 0, 1, 1, 0], 'legs': True},
    'charge': {'bob': [0, 1, 1, 0, 0, 1, 1, 0], 'legs': True},
}


def lifted(frame, bob):
    result = frame.copy()
    if bob:
        result[:SPLIT - bob] = frame[bob:SPLIT]
    return result


def steadied(frames, loop):
    first = frames[0]
    held = []
    for frame, bob in zip(frames, loop['bob']):
        body = lifted(first, bob)
        if loop['legs']:
            body[SPLIT:] = frame[SPLIT:]
        held.append(body)
    return held
