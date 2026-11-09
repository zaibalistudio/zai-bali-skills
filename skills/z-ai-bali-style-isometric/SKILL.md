---
name: z-ai-bali-style-isometric
description: Isometric miniature-world look in three.js - orthographic camera (true isometric 35.264 deg or game 2:1 at 30 deg), flat face-shaded boxes with three fixed lights, bevel edges, squash-on-landing formula, tiles dropping into place. Use when the user wants isometric, diorama, "изометрия", a system or process shown as little rooms or blocks. Not for perspective cinematic scenes.
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Style: Isometric

> Unofficial community skill. Not affiliated with Anthropic.

## Recipe
1. **Camera**: `OrthographicCamera`, frustum height 10 (as in the public skill `threejs-fundamentals`). Position along `(1,1,1)` for true isometric (elevation `atan(1/sqrt2)` = 35.264 deg). For the 2:1 game look use elevation 30 deg (screen math: `x' = (x-y)*0.866*S`, `y' = (x+y)*0.5*S - z*S`, the same as the 2D catalogue). 35.264 and 30 are our own derivation; the angles are **not given** in the public skill.
2. **Face shading**: Lambert material plus three fixed directional lights: top 2.2 (+y), left 1.5 (+z face), right 0.6 (+x face, darkest) plus ambient 0.35. The catalogue uses top = base, left = -16 percent, right = -34 percent.
3. **Light edge**: a thin white line at 35 percent opacity on the two front top edges (`EdgesGeometry` or a bevel).
4. **Motion**: tiles drop from z+8 with `dz = (1-p^2)*8`, then **land squash** `sq = exp(-land*9) * sin(land*26) * 0.16` (catalogue values); labels on speech-bubble plates; outro: tiles sink with ease-in, last the centre.
5. **Perspective off, depth cues on**: floor shadows are crisp, from the upper left, offset by height; no bloom, no DOF.

## Code (tested, see `examples/zb-styles.js`)
```js
const cam = S.isoCamera(W, H, 10, /*game 2:1*/ true);
S.isoLights(scene);
const m = new THREE.MeshLambertMaterial({ color });
mesh.scale.y = 1 + S.landSquash(land);   // squash; compensate x/z with 1/sqrt
```

## Basis
Projection, face shades, bevel line, squash formula: `yasinozmeen/animasyon-stil-katalogu` (stiller/izometrik/anim.html), idea and numbers only, no code copied (no LICENSE in repo). Ortho camera set-up: `CloudAI-X/threejs-skills` (MIT).

## Checklist
- [ ] Parallel edges stay parallel (no perspective camera by mistake).
- [ ] Three clearly different face tones on every box.
- [ ] Floor plane is larger than the frame (else a hexagon appears at the edges; we hit this in our test).
