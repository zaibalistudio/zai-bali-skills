---
name: z-ai-bali-style-blueprint-matrix
description: Two line-art looks for a three.js scene via post-processing - engineering blueprint (Sobel edges on normals and depth, white lines on a blue millimetre grid, dimension lines) and Matrix (the subject drawn from falling green glyphs). Use when the user wants blueprint, technical drawing, schematic, "чертёж", "матрица", code rain over a 3D subject. Not for filled, shaded looks.
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Style: Blueprint and Matrix

> Unofficial community skill. Not affiliated with Anthropic.

## Blueprint
1. Render the scene with `scene.overrideMaterial = new THREE.MeshNormalMaterial()` into a render target **with a DepthTexture**.
2. Full-screen shader: **Sobel 3x3** on the normal colour and on linearised depth. `line = smoothstep(0.55, 1.1, edgeNormal) + smoothstep(0.35, 0.9, edgeDepth*0.35)`. Normal edges give creases, depth edges give silhouettes.
3. Paper: radial gradient `#123b75` to `#1f5aa6`, minor grid every 24 px (alpha 0.07), major every 120 px (alpha 0.12), faint blue tint inside the object (0.08). Line colour `#ecf8ff`.
4. **Dimension lines, centre lines and title block are 2D**, drawn over the frame with canvas or SVG: dash `[3,5]` for hidden lines, centre line with a long dash, arrows, text like "12,0 cm". Animate by `stroke-dashoffset` or by path length: lines **draw themselves** with a small pen dot at the tip, as in the public catalogue.
5. Ease for line drawing: `eio2` (quadratic in-out), 0.4 to 0.8 s per line, staggered by 0.05 s.

## Matrix
Post shader on a 14 px cell grid: per-column speed `0.35 + hash*0.9`, bright head with a power-3 tail, glyphs from a 5x7 procedural bit pattern (no font needed), some cells flicker at 8 Hz. **Scene luminance multiplies the brightness (weight 2.6; rain only 0.3)**, so the subject emerges as a glyph silhouette. Hide the floor, otherwise the whole frame is bright. Colours: green `(0, 1, 0.35)`, head almost white.

## Code (tested, see `examples/zb-styles.js`)
```js
scene.overrideMaterial = new THREE.MeshNormalMaterial();
const post = S.makePost(renderer, W, H, S.BLUEPRINT_FRAG, {}, true);  // true = with depth texture
// or S.MATRIX_FRAG with depth=false
window.render = (t) => { post.run(scene, cam, t); return ...; };
```

## Basis
- The "lines draw themselves" and dimension-line approach follow the public 2D catalogue `yasinozmeen/animasyon-stil-katalogu` (stiller/blueprint/anim.html + common.js, a Path class with arc-length tracing). Idea only; no LICENSE file in that repo, so we did not copy code.
- Outline-as-post-process background: `OmarShehata/webgl-outlines` (MIT, 2022, not read in full by us). **Not found in any public skill**: a ready Sobel blueprint shader or a matrix-rain shader. Both here are our own and were rendered and checked by eye.

## Checklist
- [ ] Silhouette AND inner creases are visible; lines about 1.5 px at 540x960.
- [ ] Text on the paper is readable (cyrillic font loaded before the first frame).
- [ ] Matrix: the subject is recognisable from a distance; rain does not hide it.
