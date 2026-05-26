const http = require('http');
const fs = require('fs');
const path = require('path');
const ROOT = __dirname;
const DB = path.join(ROOT,'results.json');
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.png':'image/png','.json':'application/json; charset=utf-8'};
function readBody(req){return new Promise(resolve=>{let d='';req.on('data',c=>d+=c);req.on('end',()=>resolve(d));});}
function readResults(){try{return JSON.parse(fs.readFileSync(DB,'utf8'))}catch{return []}}
function writeResults(v){fs.writeFileSync(DB,JSON.stringify(v,null,2));}
http.createServer(async (req,res)=>{
  const url=decodeURIComponent(req.url.split('?')[0]);
  if(url==='/api/results'){
    res.setHeader('Content-Type','application/json; charset=utf-8');
    if(req.method==='GET') return res.end(JSON.stringify(readResults()));
    if(req.method==='POST'){const body=JSON.parse(await readBody(req)||'{}'); const list=readResults(); list.unshift(body); writeResults(list); return res.end(JSON.stringify(body));}
    if(req.method==='PUT'){const body=JSON.parse(await readBody(req)||'[]'); writeResults(Array.isArray(body)?body:[]); return res.end(JSON.stringify({ok:true}));}
  }
  let file=path.join(ROOT, url==='/'?'index.html':url);
  if(!file.startsWith(ROOT)) {res.writeHead(403); return res.end('Forbidden');}
  fs.readFile(file,(err,data)=>{ if(err){res.writeHead(404); return res.end('Not found');} res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream'); res.end(data); });
}).listen(3000,()=>console.log('Buka: http://localhost:3000'));
