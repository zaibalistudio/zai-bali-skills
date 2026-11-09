---
name: z-ai-bali-style-paper-cut
description: Layered paper-cut diorama in three.js - flat shapes extruded 3 cm with a bevel, grain bump texture, layers 1-1.5 units apart in Z with REAL cast shadows between them, slow camera slide that creates true parallax. Use when the user wants paper cut, cardboard layers, paper collage, "бумажный коллаж", storybook look. Not for realistic 3D.
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Style: Paper cut

> Unofficial community skill. Not affiliated with Anthropic.

## Recipe
1. **Pieces**: a `THREE.Shape` extruded `depth 0.03` with a tiny bevel (`0.004`, 1 segment): the cut edge catches light, like the "rim" in the 2D catalogue (light tone first, main colour shifted 2 px).
2. **Grain**: a 512 px canvas bump: 1400 tiny curved fibres (dark 7 percent, light 9 percent) and soft specks; repeat 3x, `bumpScale` 1.2, roughness 0.95.
3. **Layers**: back to front at z = -5.2 (sun), -4, -2.4, -0.9, 0.6 ... 1 to 1.6 units apart. Each layer is one `Mesh` per piece.
4. **Shadows**: a low raking DirectionalLight (position about (-6, 4, 5)), `shadow.radius` 5, **shadow camera widened to ±12**, ambient only 0.3. Shadow softness grows with the gap between layers. Real shadows replace manual drop shadows.
5. **Camera**: slides on x by up to 0.8 over the shot (`Math.sin(t*0.6)*0.8`) and looks at the middle layer: parallax comes for free.
6. **Entrance**: layers slide in from below, back to front, 0.15 s apart, with ease-out; at the end they sink front to back (as in the catalogue).
7. Small windows or lamps: a warm point light **just behind** the layer in front.

## Code (tested, see `examples/zb-styles.js`)
```js
S.paperLights(scene);
const hills = S.paperPiece(waveShape, 0x5f8a6a, -2.4);   // Shape, colour, z
scene.add(hills);
```

## Basis
Layer order, edge rim, grain fibres and soft-blur shadows per layer: public 2D catalogue `yasinozmeen/animasyon-stil-katalogu` (stiller/kagit-kesik/anim.html), idea only (no LICENSE in repo). Hyperframes presets (`cobalt-grid` and others) are HTML design tokens, not a paper shader. A ready paper-cut three.js skill was **not found**; this one is ours.

## Checklist
- [ ] A visible soft shadow on each lower layer; shadow stays inside the shadow camera.
- [ ] Layer edges show a thin light lip; no z-fighting between neighbouring layers (gap at least 0.3).
- [ ] Camera slide is slow (under 1 unit per 6 s) and eased.
