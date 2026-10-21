"""The Antler Spirit Shade's look: a ghost whose cloak burns away into cold teal spirit fire.

Its cloak's trailing edge and hem burn dark teal to pale mint and break into wisps that rise and
curl off behind it, ghost flames lick up off its antler tips, soul motes drift round it, and its
runes, eyes and blade glow brighter.
"""
import numpy as np
from .antler_cloak import burn_cloak, lick
from .antler_drift import draw_drift
from .antler_flames import burn_antlers
from .antler_glow import glow_out, glow_runes
from .antler_heat import boil_fields, heat_of
from .antler_wisps import drift


# where a weapon row shows the hero himself, as the bladeless fists row does; effects painted over
# him leave the blade, spear, axe and every smear on top
def bare_rows(frame):
    if len(frame.rows) == 1:
        return [np.ones(frame.body.shape, bool)]
    plain = frame.rows[1]
    return [np.all(row == plain, axis=-1) for row in frame.rows]


# nothing may touch the frame's outermost pixels: the game crops and mirrors frames on them
def keep_margin(frame, plain):
    for row, before in zip(frame.rows, plain):
        for edge in (np.s_[0, :], np.s_[-1, :], np.s_[:, 0], np.s_[:, -1]):
            row[edge] = before[edge]


def burn(frame, fields):
    frame.extra['bare'] = bare_rows(frame)
    heat = heat_of(frame, fields)
    burn_cloak(frame, heat)
    glow_runes(frame)
    lick(frame, heat)
    burn_antlers(frame)


def dress_strip(frames):
    plain = [[row.copy() for row in frame.rows] for frame in frames]
    fields = boil_fields(frames)
    for frame in frames:
        burn(frame, fields)
    draw_drift(frames, drift(frames))
    for frame, before in zip(frames, plain):
        glow_out(frame)
        keep_margin(frame, before)
