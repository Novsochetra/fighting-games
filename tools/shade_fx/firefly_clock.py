"""When each frame of a strip shows, as a beat of the loop the game plays it in.

Most looping strips play every frame round and round. The game plays the win strip's first frame
once and then loops frames 1 to 3 (`winFrame` in src/sim/hero-animation.js), while the select
screen's middle card loops all four. So the win loop is three beats long and its first frame sits
half a beat before the second, between the last frame and the first: the swarm steps evenly from the
last frame to the second in the game, and in half steps through the first frame on the card.
"""
from dataclasses import dataclass

ONE_SHOT_FRAMES = 6
LEAD_IN = {'win': 1}


# `at` is how far into the loop the frame shows, `length` how many beats the loop has; a strip that
# plays once still turns its swarm and blinks its fireflies as if it looped every six frames
@dataclass(frozen=True)
class Beat:
    at: float
    length: int
    loops: bool


def beat_of(frame):
    if not frame.loops:
        return Beat(at=frame.index, length=ONE_SHOT_FRAMES, loops=False)
    lead = LEAD_IN.get(frame.strip, 0)
    length = frame.count - lead
    if frame.index >= lead:
        return Beat(at=frame.index - lead, length=length, loops=True)
    return Beat(at=length - 1 + (frame.index + 1) / (lead + 1), length=length, loops=True)


def on_beat(frame):
    return beat_of(frame).at == int(beat_of(frame).at)


# the frames on the loop's whole beats, in the order they play
def loop_of(frames):
    return sorted((frame for frame in frames if on_beat(frame)), key=lambda frame: beat_of(frame).at)


# the frame shown just before this one, and how many beats back it is
def shown_before(frames, frame):
    beat = beat_of(frame)
    whole = int(beat.at)
    if whole != beat.at:
        return loop_of(frames)[whole], beat.at - whole
    if not beat.loops:
        return (frames[frame.index - 1] if frame.index else frame), 1
    return loop_of(frames)[(whole - 1) % beat.length], 1


# how many beats a particle born on beat `birth` has lived when this frame shows
def age_at(frame, birth):
    beat = beat_of(frame)
    return (beat.at - birth) % beat.length if beat.loops else beat.at - birth
