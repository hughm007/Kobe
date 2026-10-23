const {chromium}=require('playwright');const fs=require('fs');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1920}});
fs.mkdirSync('out/post',{recursive:true});fs.mkdirSync('out/preview',{recursive:true});
for(const f of fs.readdirSync('out/html').sort()){const [id,mode]=f.replace('.html','').split('_');
await p.goto('file://'+process.cwd()+'/out/html/'+f,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);
await p.screenshot({path:`out/${mode}/tripnerd-story-${id}.jpg`,type:'jpeg',quality:mode==='post'?92:80});}
await b.close();})();
