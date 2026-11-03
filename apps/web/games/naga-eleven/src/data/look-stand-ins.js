// A new move names the look it is planned with (README "Skills and combos"); until that look is
// drawn (src/render/duel/looks/) and heard (src/audio/cues/looks.js) it borrows one that is.
// Delete a line as its look lands: test/unit/data/moves.test.js fails on a stand-in for a look
// that exists
export const LOOK_STAND_INS = {};
