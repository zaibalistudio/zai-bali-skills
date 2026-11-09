const pp=require('puppeteer-core'),http=require('http'),fs=require('fs'),path=require('path');
const CH=process.env.CHROME_BIN; // path to chrome-headless-shell
const root=__dirname,mime={'.html':'text/html','.js':'text/javascript'};
const srv=http.createServer((q,r)=>{const p=path.join(root,q.url.split('?')[0]);if(!fs.existsSync(p)||fs.statSync(p).isDirectory()){r.writeHead(404);return r.end();}r.writeHead(200,{'Content-Type':mime[path.extname(p)]||'application/octet-stream'});fs.createReadStream(p).pipe(r);}).listen(0,'127.0.0.1');
(async()=>{await new Promise(r=>srv.on('listening',r));const br=await pp.launch({executablePath:CH,headless:'shell',args:['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']});
try{for(const st of process.argv.slice(2)){const pg=await br.newPage();await pg.setViewport({width:540,height:960});pg.on('pageerror',e=>console.error('[page]',st,e.message));pg.on('console',m=>{if(m.type()==='error')console.error('[con]',st,m.text())});
 await pg.goto(`http://127.0.0.1:${srv.address().port}/scene.html?style=${st}`);await pg.waitForFunction('window.ready===true',{timeout:60000}).catch(e=>console.error('noready',st));
 for(const t of [0.3,2.0]){const t0=Date.now();const b=await pg.evaluate(t=>window.render(t),t);fs.mkdirSync('out',{recursive:true});fs.writeFileSync(`out/${st}_${t}.png`,Buffer.from(b,'base64'));console.log(st,t,Date.now()-t0,'ms');}
 await pg.close();}}finally{await br.close();srv.close();}})();
