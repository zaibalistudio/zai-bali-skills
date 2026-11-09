---
name: z-ai-bali-style-clay
description: Plasticine / claymation look for a three.js scene rendered in code - soft diffuse clay material with a procedural fingerprint-and-pit bump map, no hard specular, wide soft shadows, and 12 fps stop-motion "boil" wobble. Use when the user wants clay, plasticine, claymation, "пластилин", a cute handmade stop-motion feel on 3D characters or objects. Not for flat 2D or realistic scenes.
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Style: Clay (plasticine)

> Unofficial community skill. Not affiliated with Anthropic. Pairs with `z-ai-bali-3d-scene` (camera, render harness, sound).

## What makes it read as clay (and not as "rubber toy")
1. **Surface**: `MeshStandardMaterial`, roughness about 0.85, metalness 0, plus a procedural **bump map** (random pits and bumps and short elliptical "fingerprint" arcs). `bumpScale` 4 at 512 px texture repeated 2x. Too high (7) looks like stucco.
2. **Light**: one warm key (about 5000 K) from upper left with `shadow.radius` 8 (PCFSoftShadowMap), a warm hemisphere fill. No sharp highlights.
3. **Boil**: stop-motion jitter. Time is quantised to 12 fps, and the vertex shader pushes each vertex along its normal by `sin(dot(position, vec3(7.1,5.3,6.2)) + step*37) * 0.012`. The silhouette trembles a little on every "frame", like real hand-moved clay.
4. **Pose on twos**: animate the character on 12 fps too (`Math.floor(t*12)/12`) while the camera stays smooth at 30 fps.
5. **Squash and stretch**: scale Y down and X/Z up by the same volume (`sx = 1/sqrt(sy)`) on landings, with a decaying sine.

## Code (tested, see `examples/zb-styles.js`)
```js
import * as S from './zb-styles.js';
const bump = S.clayBump();                         // draw once
const mats = [];                                   // collect clay materials
const clay = (c) => { const m = S.clayMaterial(c, bump); mats.push(m); return m; };
S.clayLights(scene);                               // key + hemisphere, soft shadows
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
window.render = (t) => { S.setClayTime(mats, t);   // boil at 12 fps
  /* pose = f(Math.floor(t*12)/12) */ renderer.render(scene, cam); return ...; };
```

## Basis
- Layer recipe (inner shadow at bottom-right, light inner glow at top-left, thin rim light, soft radial specular, fingerprint texture shifting each step, contact shadow under the object) is how the public 2D catalogue `yasinozmeen/animasyon-stil-katalogu` (stiller/kil/anim.html) builds clay on canvas. We borrowed the idea and the layer order, not its code (the repo has no LICENSE file). The three.js version, the bump texture, and the boil shader are our own.
- Not found in any public skill we reviewed: a ready clay shader for three.js.

## Checklist
- [ ] Fingerprint bump is visible at 540x960 but not noisy; no shiny plastic highlights.
- [ ] Contact shadow under each object; objects do not float.
- [ ] Boil is subtle (silhouette moves under 1.5 percent), does not read as flicker. Compare 6 neighbouring frames.
- [ ] Tested one frame in about 0.2 to 1.3 s with SwiftShader at 540x960 on our server.
- [ ] Nothing published; the user decides.
