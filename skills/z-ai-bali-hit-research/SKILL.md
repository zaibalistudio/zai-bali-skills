---
name: z-ai-bali-hit-research
description: Guides manual research of short-video hits (Reels, Shorts, TikTok) in the user's own browser or phone at human speed - three browsing modes, a "went viral" detector with explicit thresholds, a one-card-per-hit analysis template, a weekly summary, and a fast-reaction rule for fresh trends. Use when the user wants to find what works in their niche, analyse a competitor's hit, or turn a viral video into an original idea. No login automation, no scraping, no auto-likes or auto-comments; the person browses, the skill structures and analyses. Triggers (RU) - "разведка рилсов", "что залетает в нише", "разбери хит", "найди референсы", "карточка хита".
license: MIT
metadata:
  brand: Z.AI BALI
  version: 0.1.0
---

# Z.AI BALI · Hit Research

> Unofficial community skill. Not affiliated with Anthropic or Meta.

Finds what works, explains why, and turns it into an **original** idea. The person does the browsing; the skill keeps the process honest and the notes useful.

## When to use
- The user wants references for a niche, or asks "what is going viral in X".
- The user pastes a link or metrics of a hit and wants it broken down.
- Not for downloading other people's videos, copying scripts, or any automation of an account.

## Hard limits
- No scraping, no logins handed to the agent, no bots driving an account.
- No auto-likes, auto-comments, auto-follows or mass messages. They break platform rules and risk the account.
- Do not copy another creator's script or footage. Extract the mechanism, then write your own.
- If the platform shows a warning, stop browsing for 48 hours.

## Three browsing modes (10-15 minutes each, at most two sessions a day)
- **A. Search:** search niche keywords; read the Top and Reels results.
- **B. Feed:** the personalised feed; it also teaches the algorithm your niche.
- **C. Watch-list:** 15-20 creators of the niche; read what is new and what jumped in the last 3 days.

## "Went viral" detector
A video becomes a reference if **any** holds:
- views are 10x the creator's follower count; or
- views at least 100,000; or
- likes at least 5,000; or
- comments at least likes (a keyword-for-a-freebie mechanic); or
- creator under 5,000 followers and at least 20,000 views (most valuable: the format worked, not the audience).

**Fast trend** (act the same day): a video at most 3 days old with 20,000+ views, or creator under 5,000 followers with 10,000+ views.

## One card per hit
Copy `templates/hit-card.md` and fill: author, link, numbers (likes, comments, views), duration, hook in the first 3 seconds, format, mechanic, keyword/CTA, sound, **what we take / what we do not**, repeatability (1-5), effort. Mark each number as read from the screen or estimated.

## Reaction rule
Fresh hit found -> same day: card, then an original sketch "on the wave" (not a copy): script under 2 hours, self-critique 8/10 or higher, assemble, owner approves. At most one rush piece a day; the rest wait in the queue.

## Weekly summary (once a week)
Top 5 hits, 3 mechanics, 3 ideas for pieces, what worked for us (check at 24 and 48 hours), what to simplify. See `templates/weekly.md`.

## Example
Input: "Here is a Reel: 240k views, creator has 3k followers, hook 'I deleted my CRM and nothing broke'."
Output: detector says yes (creator under 5k, 240k views); a filled card: hook = confession + surprise in 6 words; mechanic = before/after on screen; take = the confession shape; do not take = the CRM story itself; repeatability 4; idea = an original confession from the user's own experience.

## Checklist before saying "done"
- [ ] Every number on a card says whether it was read from the screen or estimated.
- [ ] "What we take / what we do not" is filled; the idea is original, not a copy.
- [ ] No automation of any account was proposed or run.
- [ ] No more than two sessions a day were suggested; warnings were respected.
- [ ] A log of already-reviewed links exists, so nothing is analysed twice.
