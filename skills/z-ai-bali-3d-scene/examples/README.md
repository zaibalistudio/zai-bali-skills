# Example: scene skeleton

`scene.html` is a deliberately plain skeleton (floor, desk, glowing screen, spot light, 3-point camera path). It shows the contract, not the look: `window.render(t)` returns a PNG for time `t`.
`render.mjs` steps time frame by frame. Tested with `puppeteer-core` and `chrome-headless-shell` on a server without a GPU.

```bash
npm i puppeteer-core three            # then copy three/build/three.module.js (+ three.core.js) next to scene.html
node render.mjs /path/to/chrome-headless-shell out 30 9 0.3,4.5,8.9   # 3 control frames
node render.mjs /path/to/chrome-headless-shell out 30 9               # all 270 frames
ffmpeg -framerate 30 -i out/f_%05d.png -vf scale=1080:1920:flags=lanczos -c:v libx264 -pix_fmt yuv420p silent.mp4
python3 ../scripts/audio.py a.wav --dur 9 --whoosh 6 --clicks 1,1.3,1.6
ffmpeg -i a.wav -af loudnorm=I=-16:TP=-1.5:LRA=11 a_norm.wav
ffmpeg -i silent.mp4 -i a_norm.wav -c:v copy -c:a aac -b:a 192k -shortest final.mp4
```
