# Z.AI BALI · Skills v0.1.0

First public release: nine skills for Claude Code.

## What's new
- **3D Scene in Code** - cinematic 3D clips with three.js in headless Chromium without a GPU, a camera and light playbook, a render skeleton and a sound synthesizer. About 1.5 s per frame on 4 CPU cores.
- **Hook Score** - an offline scorer for Russian short-video hooks (5 checks) and 26 rewrite formulas. A filter for weak hooks, not a view predictor.
- **Voice Direction** - tags, pauses and settings for ElevenLabs-style voice acting; each claim labelled doc, tested or hypothesis.
- **Five look packs** - `z-ai-bali-style-isometric`, `-anime-cel`, `-blueprint-matrix`, `-paper-cut`, `-clay`: style recipes for the 3D scene skill, each with its own example scene.
- **Hit Research** - a manual process for finding and analysing viral short videos in your own browser; no login, no scraping, no automation of accounts.

## Install
```text
/plugin marketplace add zaibalistudio/zai-bali-skills
/plugin install zai-bali@zai-bali-skills
```

## Verified
JSON manifests parse; front matter and description lengths checked; the hook scorer, the sound script and the 3D render skeleton were run on the build machine.

## Not verified
Plugin installation from the published repository; trigger accuracy on real phrases; voice tags by ear; hook-score outside Russian.

Unofficial. Not affiliated with Anthropic, Meta or ElevenLabs. MIT.
