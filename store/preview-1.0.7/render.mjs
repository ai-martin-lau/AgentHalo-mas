#!/usr/bin/env node
// No dependencies. Node >=22, Chrome headless, ffmpeg/ffprobe, Python + Pillow.
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath, pathToFileURL} from 'node:url';
import {spawn, execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {once} from 'node:events';
import {createHash} from 'node:crypto';
const dir=path.dirname(fileURLToPath(import.meta.url));
const repo=path.resolve(dir,'../..'), app=path.join(repo,'agenthalo');
const work=path.join(dir,'.work');
const require=createRequire(import.meta.url);
const {i18n}=require(path.join(app,'src/i18n.js'));
const pets=['halo','fox','panda','octopus','cat','bunny','dragon','penguin','axolotl','wukong'];
const chrome=process.env.CHROME_BIN || '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const args=process.argv.slice(2), stills=args.includes('--stills');
const locales=args.filter(s=>!s.startsWith('--'));
if(!locales.length) locales.push('en-US','zh-Hans','zh-Hant','ja','ko','es-ES');
await fs.mkdir(work,{recursive:true});
const read=rel=>fs.readFile(path.join(app,rel),'utf8');
const assetUrl=rel=>pathToFileURL(path.join(app,rel)).href;
const freeze='<style>*,*::before,*::after{animation:none!important;transition:none!important;caret-color:transparent!important} :root{color-scheme:light}</style>';
const hudCss=(await read('src/session-hud.html')).match(/<style>([\s\S]*?)<\/style>/)[1];
const bubbleSource=await read('src/bubble.html');
const sourcePaths=['src/session-hud.html','src/session-hud-renderer.js','src/bubble.html','src/bubble.css','src/bubble-renderer.js','src/bubble-format.js','src/i18n.js','assets/icon.png','assets/icons/agents/claude-code.png',...pets.map(p=>`pets/${p}/spritesheet.webp`),'pets/halo/sounds/confirm.mp3','pets/halo/sounds/complete.mp3'];
const hashes={};for(const p of sourcePaths) hashes['agenthalo/'+p]=createHash('sha256').update(await fs.readFile(path.join(app,p))).digest('hex');
await fs.writeFile(path.join(dir,'source-manifest.json'),JSON.stringify(hashes,null,2)+'\n');
class CDP {
  constructor(ws){this.ws=ws;this.id=0;this.pending=new Map();this.errors=[];
    ws.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=this.pending.get(m.id);this.pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}else if(m.method==='Runtime.exceptionThrown')this.errors.push(m.params.exceptionDetails);});
  }
  call(method,params={},sessionId){return new Promise((resolve,reject)=>{const id=++this.id;this.pending.set(id,{resolve,reject});this.ws.send(JSON.stringify({id,method,params,...(sessionId?{sessionId}:{})}));});}
}
const browser=spawn(chrome,['--headless=new','--disable-gpu','--remote-debugging-port=0',`--user-data-dir=${path.join(work,'chrome-profile')}`,'--no-first-run','--no-default-browser-check','--disable-background-networking','--disable-component-update','--disable-sync','--disable-extensions','--disable-features=Translate','--mute-audio','--allow-file-access-from-files','--hide-scrollbars','--force-color-profile=srgb','--window-size=1920,1080','about:blank'],{stdio:['ignore','ignore','pipe']});
let stderr='';
const wsUrl=await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('Chrome endpoint timeout: '+stderr)),20000);
  browser.stderr.on('data',b=>{stderr+=b;const m=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});
  browser.on('exit',code=>{clearTimeout(timer);reject(Error('Chrome exited '+code));});
});
const ws=new WebSocket(wsUrl);await once(ws,'open');const cdp=new CDP(ws);
try {
  const {targetId}=await cdp.call('Target.createTarget',{url:'about:blank'});
  const {sessionId}=await cdp.call('Target.attachToTarget',{targetId,flatten:true});
  const call=(m,p)=>cdp.call(m,p,sessionId);
  const evaluate=async expression=>{const r=await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  await call('Runtime.enable');await call('Page.enable');
  await call('Emulation.setDeviceMetricsOverride',{width:1920,height:1080,deviceScaleFactor:1,mobile:false});
  await call('Emulation.setEmulatedMedia',{features:[{name:'prefers-color-scheme',value:'light'},{name:'prefers-reduced-motion',value:'reduce'}]});
  for(const locale of locales){
    const config=JSON.parse(await fs.readFile(path.join(dir,'locales',locale+'.json'),'utf8'));
    if(config.locale!==locale||config.captions?.length!==5||!i18n[config.appLanguage])throw Error('Invalid locale config '+locale);
    const dict=i18n[config.appLanguage];
    config.states={thinking:dict.sessionThinking,working:dict.sessionBadgeRunning,done:dict.sessionBadgeDone};
    config.pets=pets;config.assets=assetUrl('')+'/';
    const hud=`<!doctype html><meta charset="utf-8"><style>${hudCss}</style>${freeze}<div class="hud"><div class="row row-unfocusable"><div class="left"><span id="dot" class="dot dot-running"></span><img class="agent-icon" src="${assetUrl('assets/icons/agents/claude-code.png')}"><span id="title" class="title"></span></div><span class="right"><span id="bell" class="completion-bell unread-bell" style="display:none"><svg width="11" height="11" viewBox="0 0 24 24" fill="currentColor"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg></span><span id="state" class="state-chip chip-thinking"></span></span></div></div><script>document.getElementById('title').textContent=${JSON.stringify(config.task)};<\/script>`;
    // Use exact bubble DOM/CSS/renderer with an inert local bridge, as in 1.0.6 screenshots.
    const data={lang:config.appLanguage,toolName:'Bash',toolInput:{command:'npm test'},suggestions:[],presentation:{expanded:false},interaction:{intent:'tool-approval',capabilities:{}}};
    const bridge=`<script>window.bubbleAPI={onPermissionShow:cb=>cb(${JSON.stringify(data)}),onPermissionHide:()=>{},onPresentation:()=>{},decide:()=>{},reportHeight:()=>{},setExpanded:()=>{},setImeEditing:()=>{},setCompositionActive:()=>{}};<\/script>`;
    let bubble=bubbleSource.replace(/<meta http-equiv="Content-Security-Policy"[^>]*>/,'').replace('</head>',freeze+'</head>');
    bubble=bubble.replace('href="bubble.css"',`href="${assetUrl('src/bubble.css')}"`).replace('<script src="bubble-format.js">',bridge+`<script src="${assetUrl('src/bubble-format.js')}">`).replace('src="bubble-renderer.js"',`src="${assetUrl('src/bubble-renderer.js')}"`);
    const hudPath=path.join(work,locale+'-hud.html'),bubblePath=path.join(work,locale+'-bubble.html');
    await fs.writeFile(hudPath,hud);await fs.writeFile(bubblePath,bubble);
    config.hudUrl=pathToFileURL(hudPath).href;config.bubbleUrl=pathToFileURL(bubblePath).href;
    await call('Page.navigate',{url:pathToFileURL(path.join(dir,'preview.html')).href});
    for(let attempt=0;attempt<100;attempt++){
      if(await evaluate('typeof window.initialize === "function"'))break;
      await new Promise(r=>setTimeout(r,50));
    }
    await evaluate(`window.initialize(${JSON.stringify(config)})`);
    const capture=async t=>{
      await evaluate(`window.renderAt(${t}); new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(()=>resolve(true))))`);
      const r=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:false,optimizeForSpeed:true});return Buffer.from(r.data,'base64');
    };
    // Out-of-order seeks and identical hashes check that pixels depend only on t.
    const a=await capture(5.5);await capture(12.8);const b=await capture(5.5);
    if(!a.equals(b)){await fs.writeFile(path.join(work,'determinism-a.png'),a);await fs.writeFile(path.join(work,'determinism-b.png'),b);throw Error('Non-deterministic frame '+locale);}
    const acceptance=await evaluate(`(()=>{
      const times=[0,.5,1,2,2.7,4.8,5.5,6.6,7.3,7.8,7.98,8.95,9,9.0666666667,9.2333333333,9.3,9.3666666667,9.5333333333,9.6,10.5,12.4,12.95,13.55,14.5,16.1,16.4];
      const samples=times.map(t=>window.renderAt(t));
      const heroFrames=[0,.5,1,2].map(t=>{window.renderAt(t);return document.getElementById('hero').toDataURL();});
      const firstSegmentOpen=heroFrames.every(x=>x===heroFrames[0]);
      const layout=config.friendLayout;
      const rect=el=>{const b=el.getBoundingClientRect();return {x:b.x,y:b.y,width:b.width,height:b.height,right:b.right,bottom:b.bottom};};
      const overlaps=(a,b)=>a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y;
      const captionChecks=config.captions.map((text,i)=>{
        const t=[.8,3,5.5,10,12.8][i];window.renderAt(t);
        const el=document.getElementById('caption'),b=rect(el),lineHeight=parseFloat(getComputedStyle(el).lineHeight);
        const range=document.createRange();range.selectNodeContents(el);const ink=rect(range);
        const subjects=i===4?[...document.querySelectorAll('#friends canvas')]:[document.getElementById('other'),document.getElementById('hud'),document.getElementById('hero')];
        return {text,bounds:b,inkBounds:ink,lines:Math.round(b.height/lineHeight),inside:ink.x>=0&&ink.right<=1920&&ink.y>=0&&ink.bottom<=1080,overlap:subjects.some(other=>overlaps(b,rect(other)))};
      });
      const hd=document.getElementById('hud').contentDocument;
      const taskChecks=[.8,3,9.3].map(t=>{
        window.renderAt(t);const el=hd.getElementById('title');return {t,text:el.textContent,clipped:el.scrollWidth>el.clientWidth,bounds:rect(el)};
      });
      window.renderAt(15);const tagline=rect(document.getElementById('tagline'));
      const fullDisplaySeconds=[1.95,1.9,3.5,2.3,2.5,1.6];
      const ok=firstSegmentOpen&&samples.find(s=>s.t===8.95).editorOpacity===.6
        &&Math.abs(samples.find(s=>s.t===9.3).hudScale-1.04)<1e-8
        &&samples.find(s=>s.t===9.6).hudScale===1
        &&Math.abs(layout.left-layout.right)<1e-8&&layout.height===200
        &&captionChecks.every(c=>c.inside&&!c.overlap)&&taskChecks.every(c=>!c.clipped)
        &&tagline.bottom<=1080&&tagline.y>600;
      if(!ok)throw Error('Acceptance regression: '+JSON.stringify({captionChecks,taskChecks,tagline,samples}));
      return {duration:16.5,spriteFrameSeconds:.12,firstSegmentOpen,editorCodeLines:document.querySelectorAll('.code-line').length,
        trafficLights:document.querySelectorAll('.traffic-light').length,friendsSource:'idle row 0, frame 0',
        deterministicScreenshot:true,fullDisplaySeconds,captionChecks,taskChecks,tagline,samples};
    })()`);
    await fs.writeFile(path.join(dir,locale+'-acceptance.json'),JSON.stringify(acceptance,null,2)+'\n');
    const qa=await evaluate(`(()=>{const d=document.getElementById('bubble').contentDocument;return {states:config.states,permission:d.querySelector('.header-title').textContent,allow:d.getElementById('btnAllow').textContent,deny:d.getElementById('btnDeny').textContent,command:d.getElementById('compactBlock').textContent,bubbleHeight:d.getElementById('card').getBoundingClientRect().height,allowTarget:config.allowTarget};})()`);
    console.log(locale,JSON.stringify(qa));
    await fs.writeFile(path.join(work,locale+'-ui-check.json'),JSON.stringify(qa,null,2));
    if(stills){
      for(const t of [0,1,3,5.5,7.3,8.95,9,9.0666666667,9.2333333333,9.3,9.3666666667,9.5333333333,9.6,10.5,12.8,15])await fs.writeFile(path.join(work,`${locale}-${t}.png`),await capture(t));
      console.log(locale+' stills ready');continue;
    }
    const output=path.join(dir,`AgentHalo-preview-${locale}.mp4`);
    const filter='[2:a]aresample=48000,aformat=channel_layouts=stereo,adelay=4800|4800[c];[3:a]aresample=48000,aformat=channel_layouts=stereo,adelay=9000|9000[d];[1:a][c][d]amix=inputs=3:duration=first:normalize=0[a]';
    const ffargs=['-y','-hide_banner','-loglevel','warning','-f','image2pipe','-framerate','30','-vcodec','png','-i','pipe:0','-f','lavfi','-i','anullsrc=r=48000:cl=stereo', '-i',path.join(app,'pets/halo/sounds/confirm.mp3'),'-i',path.join(app,'pets/halo/sounds/complete.mp3'),'-filter_complex',filter,'-map','0:v','-map','[a]','-t','16.5','-c:v','libx264','-preset','medium','-crf','18','-pix_fmt','yuv420p','-r','30','-fps_mode','cfr','-color_primaries','bt709','-color_trc','bt709','-colorspace','bt709','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-movflags','+faststart',output];
    const ff=spawn('ffmpeg',ffargs,{stdio:['pipe','ignore','pipe']});let fferr='';ff.stderr.on('data',b=>fferr+=b);
    const completed=new Promise((resolve,reject)=>{ff.on('error',reject);ff.on('close',code=>code===0?resolve():reject(Error('ffmpeg '+code+' '+fferr)));});
    for(let n=0;n<495;n++){
      const frame=await capture(n/30);
      if(!ff.stdin.write(frame))await once(ff.stdin,'drain');
      if(n%90===0)console.log(`${locale}: ${n}/495 frames`);
    }
    ff.stdin.end();await completed;
    const probe=JSON.parse(execFileSync('ffprobe',['-v','error','-show_streams','-show_format','-of','json',output],{encoding:'utf8'}));
    await fs.writeFile(path.join(dir,locale+'-ffprobe.json'),JSON.stringify(probe,null,2)+'\n');
    console.log(locale+' rendered: '+probe.format.size+' bytes');
  }
  if(cdp.errors.length)throw Error('Browser errors: '+JSON.stringify(cdp.errors));
} finally {
  await cdp.call('Browser.close').catch(()=>{});ws.close();
  if(browser.exitCode===null)await once(browser,'exit');
}
