# Changelog

All notable changes are listed here. Format: [Keep a Changelog](https://keepachangelog.com), versioning: [SemVer](https://semver.org).

## [0.1.0] - 2026-11-08
### Added
- `z-ai-bali-3d-scene`: workflow and rules for cinematic 3D clips in code, a render skeleton (`examples/`), a stdlib sound synthesizer.
- `z-ai-bali-hook-score`: offline Russian hook scorer (5 checks) and 26 rewrite formulas.
- `z-ai-bali-voice-direction`: tags, pacing and settings for ElevenLabs-style voice acting, with evidence labels.
- `z-ai-bali-hit-research`: manual hit-research process, "went viral" detector, hit card and weekly templates.
- Five look packs for the 3D scene skill: `z-ai-bali-style-isometric`, `z-ai-bali-style-anime-cel`, `z-ai-bali-style-blueprint-matrix`, `z-ai-bali-style-paper-cut`, `z-ai-bali-style-clay`.
- Plugin and marketplace manifests; README with banner, demo GIF and skill cards.

### Verified
- JSON manifests parse; each `SKILL.md` has a valid front matter and a description under 1024 characters.
- `hookscore_ru.py` runs on sample input; `audio.py` writes a WAV; the 3D render skeleton produced control frames in headless Chromium without a GPU.

### Not verified
- Installation through `/plugin marketplace add` (nothing is published yet).
- Trigger accuracy of the descriptions on real user phrases.
- Voice tags by ear; hook-score on non-Russian text.
