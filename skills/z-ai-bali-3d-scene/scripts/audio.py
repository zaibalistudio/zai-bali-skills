#!/usr/bin/env python3
"""Tiny synth for a 3D-scene clip: drone pad + room noise + key clicks + one whoosh.
Pure Python stdlib. Usage: python3 audio.py out.wav [--dur 9] [--whoosh 6.0] [--clicks 0.8,1.1,1.5]
Then normalise: ffmpeg -i out.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 final.wav
"""
import argparse, math, random, struct, wave

SR = 44100


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("out")
    ap.add_argument("--dur", type=float, default=9.0)
    ap.add_argument("--whoosh", type=float, default=6.0, help="time of the camera push-in peak, s")
    ap.add_argument("--clicks", default="", help="comma-separated key-click times, s")
    a = ap.parse_args()
    rnd = random.Random(7)  # fixed seed: same sound every run
    n = int(a.dur * SR)
    clicks = [float(x) for x in a.clicks.split(",") if x.strip()]
    chord = [110.0, 164.81, 196.0, 246.94, 329.63]  # Am9-ish pad
    lp = 0.0
    wh_lp = [0.0, 0.0]
    L, R = [], []
    for i in range(n):
        t = i / SR
        env = min(1.0, t / 1.5) * min(1.0, (a.dur - t) / 1.5)  # fade in/out
        pad_l = pad_r = 0.0
        for k, f in enumerate(chord):
            lfo = 0.6 + 0.4 * math.sin(2 * math.pi * (0.05 + 0.013 * k) * t + k)
            pad_l += math.sin(2 * math.pi * f * 0.998 * t) * lfo
            pad_r += math.sin(2 * math.pi * f * 1.002 * t) * lfo
        pad_l *= 0.035 * env
        pad_r *= 0.035 * env
        lp += 0.02 * (rnd.uniform(-1, 1) - lp)  # low-passed room noise
        room = lp * 0.25 * env
        w = 0.0
        dw = t - a.whoosh
        if abs(dw) < 0.9:
            g = math.exp(-(dw / 0.4) ** 2)
            x = rnd.uniform(-1, 1)
            c = 0.04 + 0.35 * (1 / (1 + math.exp(-dw * 3)))  # sweeping cutoff, low to high
            wh_lp[0] += c * (x - wh_lp[0])
            wh_lp[1] += c * (wh_lp[0] - wh_lp[1])
            w = (wh_lp[0] - wh_lp[1]) * g * 1.4
        ck = 0.0
        for ct in clicks:
            d = t - ct
            if 0 <= d < 0.03:
                ck += rnd.uniform(-1, 1) * math.exp(-d * 180) * 0.35
        L.append(pad_l + room + w + ck)
        R.append(pad_r + room + w * 0.9 + ck)
    peak = max(max(map(abs, L)), max(map(abs, R)), 1e-9)
    g = 0.7 / peak
    with wave.open(a.out, "wb") as f:
        f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR)
        f.writeframes(b"".join(struct.pack("<hh", int(l * g * 32767), int(r * g * 32767)) for l, r in zip(L, R)))
    print("wrote", a.out, a.dur, "s")


if __name__ == "__main__":
    main()
