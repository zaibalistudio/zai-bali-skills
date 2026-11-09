// node render.mjs <chromium-binary> <out-dir> [fps=30] [dur=9] [shots=comma,list]
// Needs: npm i puppeteer-core ; three.module.js next to scene.html. One browser, closed in finally.
import puppeteer from 'puppeteer-core'; import http from 'http'; import fs from 'fs'; import path from 'path';
const [, , bin, out, fps = '30', dur = '9', shots = ''] = process.argv;
const root = path.dirname(new URL(import.meta.url).pathname); fs.mkdirSync(out, { recursive: true });
const mime = { '.html': 'text/html', '.js': 'text/javascript', '.mjs': 'text/javascript' };
const srv = http.createServer((q, r) => { const p = path.join(root, q.url.split('?')[0].replace(/^\/$/, '/scene.html'));
  if (!p.startsWith(root) || !fs.existsSync(p)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'Content-Type': mime[path.extname(p)] || 'application/octet-stream' }); fs.createReadStream(p).pipe(r); }).listen(0, '127.0.0.1');
await new Promise(r => srv.on('listening', r));
const br = await puppeteer.launch({ executablePath: bin, headless: 'shell', args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
try {
  const pg = await br.newPage(); await pg.setViewport({ width: 540, height: 960 });
  pg.on('pageerror', e => console.error('[page]', e.message));
  await pg.goto(`http://127.0.0.1:${srv.address().port}/`); await pg.waitForFunction('window.ready===true', { timeout: 60000 });
  const times = shots ? shots.split(',').map(Number) : Array.from({ length: Math.round(+dur * +fps) }, (_, i) => i / +fps);
  for (const [i, t] of times.entries()) { const b64 = await pg.evaluate(t => window.render(t), t);
    fs.writeFileSync(path.join(out, shots ? `shot_${t}.png` : `f_${String(i).padStart(5, '0')}.png`), Buffer.from(b64, 'base64')); }
  console.log('frames:', times.length);
} finally { await br.close(); srv.close(); }
// then: ffmpeg -framerate 30 -i out/f_%05d.png -vf scale=1080:1920:flags=lanczos -c:v libx264 -pix_fmt yuv420p silent.mp4
