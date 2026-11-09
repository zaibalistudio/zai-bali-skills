---
name: z-ai-bali-style-anime-cel
description: Anime / cel-shaded look for a three.js scene in code - 3-step toon lighting with a nearest-filtered gradient map, constant-width ink outline via an inverted hull, hard rim light and animation on twos (12 fps). Use when the user wants anime, cel shading, cartoon-outline 3D, "аниме", "мультяшный контур" on characters or props. Not for realistic or clay looks.
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Style: Anime cel-shading

> Unofficial community skill. Not affiliated with Anthropic.

## Recipe
1. **Toon steps**: `MeshToonMaterial` with a `gradientMap` DataTexture, **NearestFilter** (Linear blurs the steps). Public skill `CloudAI-X/threejs-skills` (threejs-materials) shows 2 steps, `[120, 200]`. We use 3 steps, values 0.35, 0.68, 1.0, so shadow has a mid and a core tone.
2. **Ink outline**: a second mesh with the same geometry, `side: BackSide`, vertices pushed along the normal **in clip space** so line width stays constant in pixels (3 px at 960 px height). Colour is a very dark purple (0x1a1020), not pure black.
3. **Light**: one hard directional key plus ambient 0.6. Add a thin **rim** (Fresnel step) in a cool colour for the anime "back light".
4. **Pose on twos**: character animates at 12 fps (`animeTime(t, 12)`), camera smooth. Hold key poses 3-4 frames.
5. **Colour**: flat saturated fills; shadows are a hue shift (to violet/blue), not just darker.

## Code (tested, see `examples/zb-styles.js`)
```js
const grad = S.celGradient(3);
const mat = S.celMaterial(0xe5483a, grad);
const body = new THREE.Mesh(geo, mat); scene.add(body);
S.celOutline(body, 3, 0x1a1020, H);            // 3 px ink line
const tt = S.animeTime(t, 12);                  // pose on twos
```
Alternative from the public skill: `OutlinePass` with `edgeStrength` 3 and `hiddenEdgeColor` 0x190a05 (screen-space, needs an EffectComposer). The inverted hull is cheaper without a GPU and gives a uniform line.

## Checklist
- [ ] Outline is closed and constant width at all distances; no gaps at hard edges (use smooth normals or split meshes).
- [ ] Exactly 3 visible tone steps; no gradients on skin or cloth.
- [ ] Eyes have a white highlight, drawn as a small emissive sphere, not lit by the key.
- [ ] Poses are held on twos; no in-betweens that look like interpolation.
- [ ] Not found in public skills: a complete anime character setup. Faces and hair are authored per project.
