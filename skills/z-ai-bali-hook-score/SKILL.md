---
name: z-ai-bali-hook-score
description: Scores and rewrites the first line (hook) of a short video or Reel. Runs an offline Russian-language scorer on five text checks (length, specificity, stakes, front-loading, addressing the viewer), flags weak openers, and rewrites hooks using a library of 26 formulas. Use when the user shares hook or title drafts, asks which opener is stronger, or wants new hook options for a Reel, Short or TikTok. It filters weak hooks; it does not predict views. Triggers (RU) - "оцени хук", "проверь заход ролика", "придумай хук для рилса", "какой первый кадр сильнее", "хук слабый?".
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Hook Score

> Unofficial community skill. Not affiliated with Anthropic or Meta.

The first two seconds decide whether a viewer stays. This skill scores a spoken hook offline and helps rewrite it. It never calls a network, an API, or a social platform.

## When to use
- The user pastes one or more hook/title drafts (Russian text) and wants them ranked.
- The user needs fresh hook options for a topic.
- Not for predicting reach. The scorer rejects weak hooks; it cannot tell a good hook from a great one.

## How to run
1. Collect hooks into a text file, one per line. Optional label: `A|hook text`.
2. Run `python3 scripts/hookscore_ru.py hooks.txt` (Python 3, standard library only).
3. Read the output: overall score 0-100, a verdict, the weakest check, and flags.
4. Rewrite every `WEAK` hook with a formula from `reference/formulas.md`, score again, show before and after.

Output line: `score VERDICT label text | weakest: CHECK=value flags`.

## The five checks
| Check | Passes when |
|---|---|
| LEN | 4-11 words, up to about 70 characters |
| SPEC | contains a number or a proper name |
| STAKE | names a loss, ban, money, risk, "nobody", "never" and similar |
| FRONT | the payload (number, stake, name) appears in the first 3 words |
| ADDR | speaks to "you" or opens with an imperative ("stop", "check") |

Verdicts: `STRONG` (score 70+, every check 55+, no flags), `OK` (50+), `WEAK` (below 50). Flags: greeting, preamble ("in this video"), hashtag in the hook.

## Rules for the hook itself
- Two lines per video: a **spoken** hook (about 2 s, 5-12 words) and an **on-screen** hook (6 words or fewer, about 1 s).
- No greeting, no preamble. Start mid-action when possible.
- Use a real number. Never invent statistics or earnings; a hook with a made-up figure is worse than a plain one.
- The first frame is also a hook: show the result or the problem, not a logo.
- The hook must work with the sound off.

## Example
Input (`hooks.txt`):
```
A|Привет всем, сегодня я расскажу вам про нейросети
B|Я потерял 400 евро на одной ошибке в боте
```
Output:
```
 81.4 STRONG    B Я потерял 400 евро на одной ошибке в боте  | weakest: ADDR=70
 13.2 WEAK      A Привет всем, сегодня я расскажу вам про нейросети  | weakest: FRONT=0 greeting in hook
```
Rewrite of A with formula 1 ("cost confession"): "Одна ошибка в боте стоила мне 400 евро" - then score it again.

## Checklist before handing hooks back
- [ ] Every hook was scored by the script in this session, not estimated by eye.
- [ ] Each `WEAK` hook has at least one rewritten variant and a new score.
- [ ] No invented numbers, names, earnings or client results.
- [ ] Spoken and on-screen versions are both provided.
- [ ] The user was told plainly: the score is a filter, not a forecast.

## Details (one level deep)
- `reference/formulas.md` - 26 hook formulas with Russian templates and an example for each.
- `scripts/hookscore_ru.py` - the scorer. Russian word lists only; for other languages, ask the user before trusting it.
