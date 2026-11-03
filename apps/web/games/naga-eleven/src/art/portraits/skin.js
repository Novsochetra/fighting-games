// light from the top left: each ramp warms toward gold in the light and cools toward red-violet in shade
const ramp = (skinLight, skin, skinShade, skinDeep) => ({ skinLight, skin, skinShade, skinDeep });

export const SKINS = {
  khmer: ramp('#dba373', '#b97b4c', '#8d5236', '#5a2f2a'),
  khmerLight: ramp('#e6b384', '#c68b5a', '#985d3d', '#62352d'),
  khmerDeep: ramp('#c68f5f', '#9e6641', '#75432f', '#4a2526'),
  eastAsian: ramp('#f6d6ae', '#e0ae84', '#b57a5d', '#7a4a42'),
  persian: ramp('#e8b78c', '#c88d62', '#985f40', '#62372e'),
  brazilian: ramp('#c98c5c', '#a1683f', '#76452e', '#4a2823'),
  german: ramp('#fadcc4', '#e8b799', '#c08770', '#86544d'),
};
