#!/usr/bin/env python3
"""Z.AI BALI hook-score (Russian). Offline, text only, no network, standard library only. MIT.
Five checks: LEN (4-11 words), SPEC (numbers / proper names), STAKE (loss, ban, money, "nobody"...),
FRONT (payload inside the first words), ADDR (talks to "you").
Usage: python3 hookscore_ru.py hooks.txt   (one hook per line, either "label|text" or just text)
This is a FILTER for weak hooks, not a view predictor. Written from scratch; no third-party code."""
import re, sys, statistics

W = re.compile(r"[\w'’-]+", re.U)
NUMW = set("ноль один одна одно два две три четыре пять шесть семь восемь девять десять двадцать тридцать сорок пятьдесят сто сотня тысяча тысяч миллион втрое вдвое".split()) | \
       {"сто", "двести", "триста", "семьдесят", "восемьдесят", "девяносто", "шестьдесят",
       "одиннадцать", "двенадцать", "тринадцать", "четырнадцать", "пятнадцать", "шестнадцать", "семнадцать", "восемнадцать", "девятнадцать"}
STAKE = set("""потерял потеряла потеряли пропал пропала пропало пропали нельзя нет ноль провал провалил не ни неправда неправдой
остановили кончился кончилась закончился сломал сломалась сломался украл потеря потерял ошибка ошибку чужой чужим чужая зря
врёт врала выдумал обман бесплатно деньги рубль доллар евро штраф бан заблокировала заблокировал заблокирована лимит
стёрлось удалил удалила удалили слив утечка опасно риск секрет никто никогда""".split())
WEAKOPEN = ("привет", "здравствуйте", "сегодня", "итак", "всем", "друзья", "в этом", "в данном", "давайте", "хочу рассказать", "расскажу")
IMPER = set("стоп хватит смотри смотрите представь представьте проверь проверьте узнай не".split())
YOU = re.compile(r"\b(ты|тебе|тебя|твой|твоя|твои|твоё|вы|вам|вас|ваш|ваша|ваши)\b", re.I)
ME = re.compile(r"\b(я|мой|моя|мои|моё|меня|мне|мы|наш)\b", re.I)
DEAL = [(re.compile(r"(?i)\bв этом (видео|ролике)\b|\bсейчас (покажу|расскажу)\b"), "preamble: cut it"),
        (re.compile(r"(?i)^\s*(привет|здравствуйте|всем)"), "greeting in hook"),
        (re.compile(r"#\w"), "hashtag in hook")]

def words(t): return W.findall(re.sub(r"(?<=\d),(?=\d)", "", t))
def cl(x): return max(0.0, min(100.0, x))

def run(t):
    w = words(t); low = [x.lower().strip("'’") for x in w]; n = len(w)
    s_len = 100 if 4 <= n <= 11 else cl(100 - (4 - n) * 20) if n < 4 else cl(100 - (n - 11) * 11)
    if len(t) > 70: s_len -= 12
    nums = [i for i, x in enumerate(w) if re.search(r"\d", x) or x.lower() in NUMW]
    props = [i for i, x in enumerate(w) if i and x[:1].isupper() and not t[:max(0, t.find(x))].rstrip().endswith((".", "?", "!", "—", "«", "„"))]
    hits = len(nums) + len(props)
    s_spec = 15 if hits == 0 else cl(45 + hits * 30)
    st = [x for x in low if x in STAKE]; k = len(set(st))
    s_stk = {0: 20, 1: 70}.get(k, 100)
    pay = next((i for i, x in enumerate(low) if x in STAKE or x in NUMW or re.search(r"\d", x) or (i and w[i][:1].isupper() and i in props)), None)
    base = 30 if pay is None else 100 if pay <= 3 else 70 if pay <= 6 else 40
    pen = 30 if any(t.lower().lstrip(" «„\"").startswith(o) for o in WEAKOPEN) else 0
    s_fr = cl(base - pen)
    if YOU.search(t): s_ad = 100
    elif low and low[0] in IMPER: s_ad = 90
    elif ME.search(t): s_ad = 70
    else: s_ad = 35
    sc = [cl(s_len), s_spec, s_stk, s_fr, s_ad]
    flags = [m for p, m in DEAL if p.search(t)]
    ov = cl(statistics.mean(sc) * 0.6 + min(sc) * 0.4 - 15 * len(flags))
    v = "STRONG" if ov >= 70 and min(sc) >= 55 and not flags else "OK" if ov >= 50 else "WEAK"
    names = ["LEN", "SPEC", "STAKE", "FRONT", "ADDR"]
    return ov, v, dict(zip(names, map(round, sc))), flags

if __name__ == "__main__":
    rows = []
    for line in open(sys.argv[1], encoding="utf-8"):
        line = line.strip()
        if not line: continue
        lab, _, txt = line.partition("|") if "|" in line else ("", "", line)
        ov, v, sc, fl = run(txt)
        rows.append((ov, lab, txt, v, sc, fl))
    for ov, lab, txt, v, sc, fl in sorted(rows, reverse=True):
        weak = min(sc, key=sc.get)
        print(f"{ov:5.1f} {v:6} {lab:>4} {txt[:60]}  | weakest: {weak}={sc[weak]} {' '.join(fl)}")
