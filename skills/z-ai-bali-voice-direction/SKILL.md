---
name: z-ai-bali-voice-direction
description: Directs text-to-speech voice acting for ElevenLabs v3/v4 style models - places bracket emotion tags, pauses and emphasis, tunes stability and similarity, splits long lines, plans retakes, and labels every claim as documented, tested, or hypothesis. Use when the user writes or fixes a voice-over script, wants a TTS line to sound alive instead of flat, or asks which tags and settings to use. Writes tagged scripts; it does not call the API itself and needs no key. Triggers (RU) - "озвучка", "теги для озвучки", "оживи реплику", "режиссура голоса", "ElevenLabs эмоции".
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Voice Direction

> Unofficial community skill. Not affiliated with Anthropic or ElevenLabs.

A flat read is usually a script problem, not a voice problem. This skill turns plain lines into directed lines: tags, pauses, emphasis, settings, retakes. It produces text only; the user (or their own pipeline) runs the speech API.

## When to use
- A voice-over script sounds robotic and the user wants it more alive.
- The user asks which emotion tags work and how many to use.
- Not for choosing or cloning voices, and not for audio editing.

## Evidence labels (use them in every answer)
- **[doc]** - stated in the provider's documentation.
- **[tested]** - measured by us (duration, API behaviour). We measured length and acceptance by the API, not taste.
- **[hypothesis]** - not verified. Say so, and ask the user to listen.

You can only judge sound by listening. Never claim a line "sounds right"; say what changed and what to listen for.

## What works
- Bracket tags are free text, not a closed list: the closer to what the voice can do, the more reliable. Documented examples: `[laughs] [laughs harder] [whispers] [sighs] [exhales] [sarcastic] [curious] [excited] [crying] [snorts] [mischievously]`; events: `[applause] [gulps]`. [doc]
- Tags can be combined: `[gentle laugh, then sincere]`. Describe the voice, not the noise ("low, restrained"), otherwise it may be read as a sound effect. [doc]
- `...` adds a pause and weight. CAPS add stress (one word per sentence). A dash is a short pause but less stable. [doc]
- SSML `<break>` does not work in v3/v4; many of them break the voice. [doc]
- Non-English: the docs are silent about tags outside English; in our tests Russian lines with English tags did change (acted versions ran 1.0-2.1 s longer than calm ones). What exactly sounds is for the user to judge. [tested]
- `speed` and `style` are ignored by v4 (help center says unavailable; our test: `speed=1.15` gave the same duration). Change tempo with ffmpeg `atempo`. [doc + tested]
- `previous_text` / `next_text` smooth the joins in dialogue; ignored if `previous_request_ids` is passed. `seed` is best-effort, not deterministic. [doc]
- A serious cloned voice obeys playful tags (`[giggles]`) poorly; tags work best when that delivery exists in the voice's training audio. [doc]
- Context-implied emotion is weaker than an explicit tag. A stage direction in text ("she said sadly") **will be read aloud**. Never write it. [doc]

## How to mark a line
Formula: `[emotion tag] words... [reaction tag] ONE_stressed word, the rest.`
- 1-2 tags per line; more becomes mush. Put the tag where the delivery changes.
- Laughter goes **inside** the sentence, not at the end or on its own line. A quiet smile: `[chuckles]`. A burst: `[laughs harder]`, once per piece at most.
- Write numbers as words in the spoken text. Keep the subtitle text free of tags and caps (two fields: `tts` and `text`).
- Lines up to about 60 characters sound livelier. Split long ones by meaning.
- Never repeat the same tag in adjacent lines.

## Settings for v4 (stability and similarity are the working ones)
| Mode | stability | similarity | use for |
|---|---|---|---|
| Even narration | 0.5 | 0.75 | info blocks, numbers |
| Lively dialogue | 0.3-0.4 | 0.75 | default |
| Strong emotion | 0.25-0.3 | 0.7 | 1-2 lines per piece |

Lower stability means more risk of drift and artefacts. [hypothesis: ranges for v4 are not given in the docs; 0.3 was accepted by the API in our test.] Keep speaker boost on. Do not send `style` or `speed`.

## Emotion templates (acceptance by API checked; delivery is for the user to judge)
| Emotion | Template |
|---|---|
| Win | `[excited] Got it! [laughs] ONE hundred twenty-six views!` |
| Smirk | `[chuckles] Okay... [warmly] let's try once more.` |
| Sarcasm | `[sarcastic] Of course... [chuckles] the cover is dark again.` |
| Tired | `[sighs] I checked everything... three times. [exhales] Nothing works.` |
| Whisper / fear | `[whispers] Quiet... [nervous] someone is in the office.` |
| Groan | `[groans] Zero views again... [sarcastic] great.` |
| Surprise | `[surprised] Age? NO: both are eight hours.` |

Give each speaker a default palette (for example, quick and ironic: `[sarcastic] [chuckles] [curious]`; warm: `[warmly] [laughs] [groans]`).

## Pipeline advice
1. Remove dead parameters (`style`, `speed`); tempo only via `atempo`.
2. Fix `seed` per line for repeatability; change it only to re-record a take.
3. Make 2-3 takes of expensive lines (laughs, peaks) with different seeds; the docs themselves advise picking the best.
4. Count tags before assembly: at most one `[laughs]` per two lines.
5. Try text-to-dialogue (one request per scene) if joins between voices are audible. [hypothesis]

## Example
Plain: `Получилось! Сто двадцать шесть просмотров.`
Directed: `[excited] Получилось! [laughs] СТО двадцать шесть просмотров.`
Say what changed: one tag for the win, one for the reaction, one stressed number. Then list what to listen for: does the laugh land inside the phrase, is the stressed word the number.

## Checklist before returning a script
- [ ] At most 2 tags per line; no repeated tag in neighbours.
- [ ] Stress (CAPS) on one word per line at most; numbers written as words.
- [ ] No stage directions in the spoken text.
- [ ] Subtitle text is separate and tag-free.
- [ ] Every claim carries [doc], [tested] or [hypothesis].
- [ ] The user is asked to listen to 1-2 peak lines before the rest are recorded. No key is requested and no API is called by the skill.
