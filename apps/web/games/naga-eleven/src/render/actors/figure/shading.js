// light falls from the top left: a surface turned to it takes the light shade, one turned away
// the shade, and the far side of the body one step darker again
const LIGHT = { x: -0.72, y: -0.69 };
const STEPS = [0.32, -0.32, -0.8];

export function shadeFor(normal, far) {
  const lit = normal.x * LIGHT.x + normal.y * LIGHT.y;
  const step = STEPS.findIndex((edge) => lit > edge);
  const shade = step === -1 ? 0 : 3 - step;

  return far ? Math.max(0, shade - 1) : shade;
}
