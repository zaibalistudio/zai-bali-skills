---
name: z-ai-bali-3d-scene
description: Builds a cinematic 3D room or object video in code - three.js rendered in headless Chromium without a GPU (SwiftShader), a smooth multi-point camera path, key/rim/fill light, dust, depth of field, bloom, and synthesized sound, muxed with ffmpeg. Use when the user wants a 3D video, a camera fly-through, a cinematic room or product shot, or depth instead of flat infographics. Not for 2D cartoons or footage of real people. Triggers (RU) - "3D-ролик", "пролёт камеры", "3D-сцена кодом", "сделай комнату в 3D", "кинематографичный ролик без GPU".
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · 3D Scene in Code

> Unofficial community skill. Not affiliated with Anthropic.

A frame is a pure function of time. You write one `scene.html`, a tiny render loop steps time frame by frame, and ffmpeg turns the PNGs into a video. No GPU, no API keys, no network.

## When to use
- The user wants depth, a moving camera, light and shadow instead of flat graphics.
- A room, desk, product or character "diorama" for a vertical (9:16) or wide video.
- Not for 2D cartoons, screen recordings, or videos with real people.

## Requirements
Node 20+, headless Chromium (or `chrome-headless-shell`), `puppeteer-core`, ffmpeg, Python 3 (stdlib only, for sound). Tell the user exactly what is missing before starting. Do not install anything silently.

Before rendering, check load: `cat /proc/loadavg`. If it is above the core count minus one, wait. Run one browser at a time and close it in a `finally` block.

## Workflow
1. **Check dependencies** (`node -v`, `ffmpeg -version`, a Chromium binary). Report gaps.
2. **Write the scene** as `scene.html` exposing `window.render(t)`; it must be stateless. Accumulated state makes frames flicker. See `reference/render-harness.md`.
3. **Render 4-6 control frames** (`--shots 0.3,3,6,8.5`) and show them to the user. Fix before the full render.
4. **Render the clip** (270 frames for 9 s at 30 fps). Keep the browser in one process, one page.
5. **Make the sound** (`scripts/audio.py`): drone pad, room noise, key clicks, one whoosh. Normalise to -16 LUFS, peak below -1.5 dBFS.
6. **Mux** with ffmpeg, then verify with `ffprobe` (fps, duration) and `ebur128` (loudness), not by eye.

## Rules by area

### Camera
- 3-4 key points (position, target, FOV) through a centripetal `CatmullRomCurve3`, one curve for position and one for target.
- Time to curve parameter with ease-in-out (cubic mixed with smoothstep). No stops in the middle.
- One verb per shot: orbit, push-in, settle. At most 4 shots per 10 seconds.
- FOV 40-48 for vertical video. Narrow it to 36-40 on the push-in; it compresses depth and feels cinematic.
- Handheld feel is about 0.3 percent: a sum of two sines of different frequency on x/y/z and roll. Never `Math.random()`.
- Depth-of-field focus follows the subject of each shot, with a smoothstep between focus points, not the screen centre.

### Light
- Key: a warm SpotLight (about 3000 K). Window blinds are a black-and-white slat texture on `spot.map`, not real geometry. Set `normalBias` about 0.04 to stop light leaking on thin edges.
- Rim: a weak warm DirectionalLight from behind-side. Fill: a cool Hemisphere light at 0.5 or less, so shadows go blue-violet, not black.
- Lamps and screens are emissive materials with a value above 1 (3-6) so bloom picks them up. Keep a real point light from a screen at 0.02 or less.
- ACES tone mapping and gamma in the final pass; render targets in HalfFloat. Grade: warm mids, teal shadows, vignette, fresh film grain every frame.
- God rays: radial blur of the bright window mask (48 samples) plus additive dust points in the beam. The window must be brighter than the lamp, otherwise rays start at the lamp.

### Motion
- Secondary animation everywhere: breathing, sway, 1 percent lamp flicker.
- Springs and overshoot are for events (a text pop, a hop), never for the camera.
- On-screen typing follows a schedule file shared with the sound track, so clicks match letters to the frame.

### Sound (pure Python)
- Layers: drone pad (slow LFOs, detuned channels), room noise, key clicks, whoosh.
- Whoosh = band-passed noise sweeping 350 to 3200 Hz, peaking at the push-in, never before the move starts or after it ends.
- Loudness: measure with `ffmpeg -af ebur128`, apply gain to -16 LUFS, then a limiter.

### Speed without a GPU
- Render the scene at half resolution and upscale in the final shader (540x960 to 1080x1920).
- Expensive: shadow-map size, DOF sample count, full-size rendering. Cheap: bloom at 1/4-1/8 resolution, dust.
- Our measurement on 4 CPU cores with SwiftShader: about 1.5 s per frame, so a 9 s clip (270 frames) takes about 7 minutes. Your hardware will differ; measure three frames first and tell the user the estimate.

### Characters in the scene
A flat image plane (billboard) is obvious the moment the camera orbits. Use real meshes in the same scene, with the same light and shadows: set `castShadow`/`receiveShadow`, put feet on a surface with `Box3`, and compute the pose as a function of time. Fur can be shells on `MeshStandardMaterial` with `onBeforeCompile` (discard by hash); 14 layers look the same as 30 at 540x960.

## Examples
**Request:** "Make a 9-second 3D clip of a cosy desk at night, camera slowly pushing toward the laptop."
**Plan the skill follows:** scene with desk, lamp, window blinds, laptop; 3 camera key points (wide, mid, push-in); warm key + cool fill; 6 control frames; full render; synthesized sound; ffprobe check.

**Request (RU):** "Сделай 3D-ролик про рабочее место, камера плавно подъезжает к экрану."
**Ответ:** пересказать план по-русски, показать 6 контрольных кадров, только потом полный рендер.

## Checklist before saying "done"
- [ ] No flicker between neighbouring frames (tile 6 frames, compare). Grain is the only thing that changes.
- [ ] Blind stripes are visible on wall and floor; shadows are soft, no "pixel dots" on thin edges.
- [ ] The subject of each shot is sharp; foreground is blurred; no halos on silhouettes.
- [ ] Lamps and screens glow without blowing out the frame; on-screen text is readable.
- [ ] No emoji or burned-in subtitles unless the user asked for them.
- [ ] fps and duration confirmed with `ffprobe`; loudness about -16 LUFS and peak below -1.5 dBFS confirmed with `ebur128`.
- [ ] Nothing was published or uploaded. Publishing is the user's decision.

## Details (one level deep)
- `reference/render-harness.md` - minimal frame-by-frame renderer (puppeteer-core + ffmpeg).
- `scripts/audio.py` - drone + clicks + whoosh synthesizer (stdlib only).
- `examples/` - a plain scene skeleton and render script (see `examples/README.md`).
