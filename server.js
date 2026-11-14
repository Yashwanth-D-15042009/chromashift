import express from 'express';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const root=path.dirname(fileURLToPath(import.meta.url)), file=path.join(root,'scores.json'), app=express(), port=process.env.PORT||3000;
app.use(express.json()); app.use(express.static(path.join(root,'public')));
async function scores(){try{return JSON.parse(await fs.readFile(file,'utf8'))}catch{await fs.writeFile(file,'[]');return[]}}
app.get('/api/health',(q,r)=>r.json({ok:true,service:'chromashift'}));
app.get('/api/scores',async(q,r)=>{let a=await scores();a.sort((x,y)=>y.score-x.score);r.json({scores:a.slice(0,10)})});
app.post('/api/scores',async(q,r)=>{let name=String(q.body?.playerName||'Anonymous').replace(/[^a-zA-Z0-9 _-]/g,'').slice(0,20)||'Anonymous',score=Number(q.body?.score);if(!Number.isInteger(score)||score<0||score>1e7)return r.status(400).json({error:'Invalid score'});let a=await scores(),entry={playerName:name,score,createdAt:new Date().toISOString()};a.push(entry);await fs.writeFile(file,JSON.stringify(a.slice(-100),null,2));r.status(201).json({score:entry})});
app.get('*',(q,r)=>r.sendFile(path.join(root,'public','index.html')));app.listen(port,()=>console.log(`Chromashift running at http://localhost:${port}`));
