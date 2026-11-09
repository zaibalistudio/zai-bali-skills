# Render harness (frame-by-frame, no GPU)

Contents: contract, launch flags, speed, verification.

## Contract
- `scene.html` sets `window.ready = true` after assets load and exposes `window.render(t)`; it returns a base64 PNG for time `t` seconds. No state carried between calls.
- The harness opens one page, calls `render(i / fps)` for each frame, writes PNGs, then closes the browser in `finally`.
- Working code: `examples/scene.html` and `examples/render.mjs`.

## Launch flags that matter without a GPU
`--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`. If Chromium fails with a missing `.so` (for example `libnspr4`), tell the user which library is missing; do not install system packages without asking.

## Speed levers
| Lever | Effect |
|---|---|
| Render at 0.5 scale, upscale in the final shader | about 3-4x faster |
| Shadow map 1024 instead of 2048 | noticeable on SwiftShader |
| DOF samples 16 instead of 32 | linear |
| Fur layers 14 instead of 30 | barely visible at 540x960 |

Measure three frames first: `time (frames x seconds per frame)` gives the estimate to show the user.

## Verification commands
```bash
ffprobe -v error -show_entries stream=r_frame_rate,duration -of default=nw=1 final.mp4
ffmpeg -i final.mp4 -af ebur128=peak=true -f null - 2>&1 | tail -12     # I and True peak
ffmpeg -i final.mp4 -vf "select='not(mod(n,45))',tile=6x1" -frames:v 1 tiles.png   # flicker check
```
