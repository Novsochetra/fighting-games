# Prop sprites

The walls set on a painted road, one PNG per kind in `src/data/prop-sprites.js`, drawn at half
scale like the fighters; `feetX`, `feetY` is the pixel set on the road. A road's closing wall stands
whole on screen at its end, and its way in, the last road's wall broken open, stands at its start
with its left edge on the road's edge. These are the temple roads' pieces and how they were made.

| Sprite | Where | `feetX`, `feetY` | Made with |
| --- | --- | --- | --- |
| `temple-gate.png` | closes Angkor Wat and the Bayon | 70, 110 | Create Image (Pro) with `palisade.png` as the style image (job `d77cda6b`, first of four candidates): a weathered sandstone wall with an apsara relief and a many-headed stone naga rearing at its left end; it stands whole on screen at the end of the road |
| `warden-gate-broken.png` | Angkor Wat's way in | 20, 202 | Edit (Pro Flash) of `warden-gate.png`, smashed open (job `54db7833`). The towers were kept from the gate and only columns 44-152 (doors, battlements, rubble) taken from the edit; then snapped to the gate's palette, the door planks set back to its red-brown wood, and a little dawn light added from the right (a warm rim on right- and top-facing edges, a wash growing to the right). It stands at the start of the road, whole on screen to the right of its feet |
| `temple-gate-broken.png` | the Bayon's way in | 16, 110 | Edit (Pro) of `temple-gate.png`, smashed open (job `31061809`): the naga, the cornice and the left of the relief wall still stand, the rest lies in blocks at its foot and the breach is see-through. Given a little dusk light (x0.92/0.87/0.96, 0.12 toward `#6a5288`, a warm `#ca7d56` rim on the edges facing the sun to its right). It stands at the start of the road, whole on screen to the right of its feet |
