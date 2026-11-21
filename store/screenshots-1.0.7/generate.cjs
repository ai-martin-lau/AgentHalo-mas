#!/usr/bin/env node
'use strict';
// Local files only. Never starts Electron, AgentHalo, a GUI browser, or a server.
const fs=require('fs'),path=require('path'),{pathToFileURL}=require('url'),crypto=require('crypto'),{spawnSync}=require('child_process');
const root=__dirname,repo=path.resolve(root,'../..'),app=path.join(repo,'agenthalo');
const copy=JSON.parse(fs.readFileSync(path.join(root,'copy.json')));
function dependency(name,alternatives=[]){for(const p of [process.env.PLAYWRIGHT_CORE_PATH,name,...alternatives].filter(Boolean)){try{return require(p)}catch{}}throw Error(`Missing ${name}. Set PLAYWRIGHT_CORE_PATH to an installed playwright-core directory.`)}
const {chromium}=dependency('playwright-core',['/Users/martin/halo/halotrack/node_modules/playwright-core']);
const asar=require(path.join(app,'node_modules/@electron/asar'));
const prefs=require(path.join(app,'src/prefs'));
const themes=require(path.join(app,'src/theme-metadata')).listThemesWithMetadata({builtinThemesDir:path.join(app,'themes')}).map(t=>({...t,active:t.id==='halo'}));
const petOrder=['halo','fox','panda','octopus','cat','bunny','dragon','penguin','axolotl','wukong'];themes.sort((a,b)=>petOrder.indexOf(a.id)-petOrder.indexOf(b.id));
if(themes.length!==10)throw Error(`Expected 10 themes, got ${themes.length}`);
// Chrome blocks external images inside SVG <img>; embed the unchanged atlas bytes.
// Keep the generated SVG geometry, animation and settings DOM; nearest-neighbor only.
for(const t of themes){const svg=fs.readFileSync(new URL(t.previewFileUrl),'utf8');const atlas=fs.readFileSync(path.join(app,'themes',t.id,'assets/spritesheet.webp'));t.previewFileUrl='data:image/svg+xml;base64,'+Buffer.from(svg.replace('href="spritesheet.webp"','href="data:image/webp;base64,'+atlas.toString('base64')+'"').replaceAll('image-rendering: auto','image-rendering: pixelated')).toString('base64')}
const agents=['claude-code','codex'].map(id=>{const a=require(path.join(app,'agents',id+'.js'));return {id:a.id,name:a.name,eventSource:a.eventSource,capabilities:a.capabilities,cleanupSuggestionExempt:true}});
const {i18n}=require(path.join(app,'src/i18n'));
const archive=path.join(app,'dist/mas-dev-universal/AgentHalo.app/Contents/Resources/app.asar');
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const sourceFiles=fs.readdirSync(path.join(app,'src')).filter(f=>/^(settings|language-picker|shortcut-actions|ui-color-theme|sound-playback|localized-field|session-hud|bubble)/.test(f)&&/\.(js|css|html)$/.test(f));
// Record every relevant source hash, including files excluded from this MAS build.
const packaged=new Set(asar.listPackage(archive).map(p=>p.replace(/^\//,'')));
const sourceComparison=sourceFiles.map(f=>{const rel='src/'+f,b=fs.readFileSync(path.join(app,rel));if(!packaged.has(rel))return {file:rel,sha256:hash(b),packaged:false};const pb=asar.extractFile(archive,rel);return {file:rel,sha256:hash(b),packaged:true,matches:b.equals(pb)}});
if(sourceComparison.some(x=>x.packaged&&!x.matches))throw Error('Packaged renderer differs from source');
const unpacked=archive+'.unpacked';
const assetComparison=petOrder.flatMap(id=>['pets/'+id+'/spritesheet.webp','themes/'+id+'/theme.json'].map(f=>({file:f,sha256:hash(fs.readFileSync(path.join(app,f))),matches:fs.readFileSync(path.join(app,f)).equals(fs.readFileSync(path.join(unpacked,f)))})));
if(assetComparison.some(x=>!x.matches))throw Error('Packaged pet/theme differs from source');
const audit={canvas:{css:[1440,900],deviceScaleFactor:2},uiDeviceScaleFactor:4,sourceComparison,assetComparison,pages:[],slides:[]};
const tmp=path.join(root,'.tmp');fs.mkdirSync(tmp,{recursive:true});process.env.TMPDIR=tmp;
const file=p=>pathToFileURL(p).href;
function fixture({lang,themes,agents,defaults,tab,about}){
 const callbacks=new Set();const snapshot={...defaults,lang,theme:'halo',completionSoundMode:'long',soundVolume:.5,soundMuted:false};
 for(const a of agents)snapshot.agents[a.id]={...snapshot.agents[a.id],enabled:true,integrationInstalled:true};
 const api={webBridgeStoreUrl:'',discordDefaultAppIdPresent:false,getSnapshot:async()=>snapshot,listThemes:async()=>themes,listAgents:async()=>agents,getPetTintOptions:async()=>[],getPetAccessoryOptions:async()=>[],getPetMouthAccessoryOptions:async()=>[],getShortcutFailures:async()=>({}),getTextScaleContext:async()=>({percent:100,effectivePercent:100}),getQuotaSourceCount:async()=>0,getQuotaRingProviders:async()=>[],detectAgentInstallations:async()=>({agents:agents.map(a=>({agentId:a.id,installed:true,confidence:'high'})),customTools:[],customAgents:[],wslSupported:false}),getAboutInfo:async()=>about,isSystemAudioMuted:async()=>false,consumeRequestedTab:()=>null,onChanged:cb=>{callbacks.add(cb);return()=>callbacks.delete(cb)},command:async(action)=>action==='listAuthorizedDirectories'?[]:{status:'ok'},update:async(k,v)=>{snapshot[k]=v;for(const cb of callbacks)cb({changes:{[k]:v},snapshot});return{status:'ok'}}};
 window.settingsAPI=new Proxy(api,{get:(obj,k)=>k in obj?obj[k]:String(k).startsWith('on')?()=>()=>{}:async()=>undefined});
 window.doctor={codexHookHealth:async()=>({status:'ok',healthy:true}),runChecks:async()=>({checks:[]}),getReport:async()=>''};
 document.addEventListener('DOMContentLoaded',()=>{const c=window.ClawdSettingsCore;c.ops.selectTab(new URLSearchParams(location.search).get('tab')||tab,{persist:false})});
}
const about={version:'1.0.7',repoUrl:'https://github.com/ai-martin-lau/AgentHalo-mas',repoLabel:'ai-martin-lau / AgentHalo-mas',issuesUrl:'https://github.com/ai-martin-lau/AgentHalo-mas/issues',licenseUrl:'https://github.com/ai-martin-lau/AgentHalo-mas/blob/main/agenthalo/LICENSE',upstreamUrl:'https://github.com/rullerzhou-afk/clawd-on-desk',license:'AGPL-3.0-only',copyright:'© 2026 Addsum',upstreamCopyright:'© 2026 Ruller_Lulu and contributors'};
const escaped=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function hudHtml(c){const original=fs.readFileSync(path.join(app,'src/session-hud.html'),'utf8'),style=original.match(/<style>([\s\S]*?)<\/style>/)[1];const names=['Claude Code','Codex','Cursor'],ids=['claude-code','codex','cursor-agent'];return `<!doctype html><html lang="${c.lang}"><meta charset="utf-8"><style>${style}</style><body><div class="hud has-pin" id="hud">${c.tasks.map((t,i)=>`<div class="row row-unfocusable"><span class="left"><span class="dot dot-${i===2?'done':'running'}"></span><img class="agent-icon" src="../../../agenthalo/assets/icons/agents/${ids[i]}.png"><span class="title">${escaped(names[i]+' · '+t)}</span></span><span class="right"><span class="state-chip ${i===2?'chip-sweeping':'chip-working'}">${escaped(c.states[i])}</span></span></div>`).join('')}</div></body></html>`}
async function settled(page){await page.evaluate(async()=>{await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()))});await page.waitForTimeout(300)}
async function main(){
 const context=await chromium.launchPersistentContext(path.join(tmp,'profile'),{headless:true,executablePath:process.env.CHROME_PATH||'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',deviceScaleFactor:4,viewport:{width:920,height:700},colorScheme:'light',bypassCSP:true,acceptDownloads:false,env:{...process.env,TMPDIR:tmp},args:['--allow-file-access-from-files','--disable-background-networking','--disable-component-update','--disable-sync','--no-first-run','--hide-scrollbars']});
 context.setDefaultTimeout(15000);context.setDefaultNavigationTimeout(15000);
 await context.route(/^https?:/,route=>route.abort());
 const canvasContext=await context.browser().newContext({viewport:{width:1440,height:900},deviceScaleFactor:2,colorScheme:'light',bypassCSP:true});canvasContext.setDefaultTimeout(15000);await canvasContext.route(/^https?:/,r=>r.abort());
 try{for(const [locale,c]of Object.entries(copy)){
  const dir=path.join(root,locale),uiDir=path.join(dir,'ui');fs.mkdirSync(uiDir,{recursive:true});
  for(const tab of ['theme','general','agents','about']){
   const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.setViewportSize(tab==='theme'?{width:1300,height:900}:tab==='general'?{width:c.lang==='es'?880:800,height:900}:{width:920,height:700});
   await page.addInitScript(fixture,{lang:c.lang,themes,agents,defaults:prefs.getDefaults(),tab,about});
   await page.goto(file(path.join(app,'src/settings.html'))+`?lang=${c.lang}&tab=${tab}`);await page.waitForFunction(()=>window.ClawdSettingsCore?.state.snapshot?.lang&&document.querySelector('#content h1, #content .about-title'));
   if(tab==='theme')await page.waitForFunction(()=>document.querySelectorAll('.theme-card').length===10);
   if(tab==='agents')await page.waitForFunction(()=>document.querySelectorAll('.agent-summary-row').length===2);
   if(tab==='about')await page.waitForFunction(()=>document.querySelector('.about-info-value')?.textContent==='v1.0.7');
   await settled(page);
   const info=await page.evaluate(()=>({lang:ClawdSettingsCore.state.snapshot.lang,tab:ClawdSettingsCore.state.activeTab,text:document.body.innerText,themeCount:document.querySelectorAll('.theme-card').length,activeTheme:document.querySelector('.theme-card.active')?.textContent,completion:document.querySelector('.settings-completion-sound-select')?.textContent}));
   if(errors.length)throw Error(locale+'/'+tab+': '+errors.join('; '));
   if(info.lang!==c.lang||info.tab!==tab)throw Error('Locale/tab mismatch');
   if(tab==='theme')await page.screenshot({path:path.join(uiDir,'theme.png')});
   if(tab==='agents')await page.screenshot({path:path.join(uiDir,'agents.png'),clip:{x:0,y:0,width:920,height:420}});
   if(tab==='about')await page.screenshot({path:path.join(uiDir,'about.png')});
   if(tab==='general'){
    const sound=page.locator('.sound-settings-group');await sound.scrollIntoViewIfNeeded();await settled(page);
    // Crop the actual section, including its heading, completion selector and volume.
    const section=sound.locator('..');
    await page.evaluate(()=>document.querySelector('#content').scrollTop=0);await page.waitForTimeout(100);
    const initialBox=await section.boundingBox();await page.setViewportSize({width:c.lang==='es'?880:800,height:Math.ceil(initialBox.y+initialBox.height+8)});
    await page.evaluate(()=>document.querySelector('#content').scrollTop=0);
    await page.locator('.settings-completion-sound-select .language-picker-trigger').evaluate(e=>e.click());await page.waitForTimeout(250);
    await page.evaluate(()=>document.activeElement?.blur());
    if(!await page.locator('.settings-completion-sound-select').evaluate(e=>e.classList.contains('open-up')))throw Error(locale+' sound menu should open upward');
    const box=await sound.locator('../..').boundingBox(),menu=await page.locator('.settings-completion-sound-select .language-picker-menu').boundingBox();
    const clip={x:box.x,y:Math.min(box.y,menu.y),width:box.width,height:Math.max(box.y+box.height,menu.y+menu.height)-Math.min(box.y,menu.y)};
    await page.screenshot({path:path.join(uiDir,'sound.png'),clip});info.soundBox=clip;info.soundMenuOpen=true;
   }
   audit.pages.push({locale,tab,...info,errors});await page.close();
  }
  const bubble=await context.newPage();const errors=[];bubble.on('pageerror',e=>errors.push(e.message));await bubble.setViewportSize({width:500,height:420});
  await bubble.addInitScript(({lang})=>{window.bubbleAPI=new Proxy({onPermissionShow:cb=>document.addEventListener('DOMContentLoaded',()=>cb({lang,toolName:'Bash',toolInput:{command:'npm test'},sessionFolder:'AgentHalo',sessionShortId:'107',suggestions:[],presentation:{expanded:false},interaction:{intent:'tool-approval',capabilities:{}}}))},{get:(o,k)=>o[k]||(()=>{})})},{lang:c.lang});
  await bubble.goto(file(path.join(app,'src/bubble.html'))+`?lang=${c.lang}`);await bubble.waitForFunction(()=>document.querySelector('#commandBlock')?.textContent.includes('npm test'));await settled(bubble);await bubble.locator('#card').screenshot({path:path.join(uiDir,'bubble.png')});audit.pages.push({locale,tab:'bubble',text:await bubble.locator('body').innerText(),errors});if(errors.length)throw Error(errors.join(';'));await bubble.close();
  fs.writeFileSync(path.join(dir,'hud.html'),hudHtml(c));const hud=await context.newPage();await hud.setViewportSize({width:470,height:112});await hud.goto(file(path.join(dir,'hud.html')));await settled(hud);
  const clipped=await hud.locator('.title').evaluateAll(es=>es.some(e=>e.scrollWidth>e.clientWidth));if(clipped)throw Error(locale+' HUD title overflow');await hud.screenshot({path:path.join(uiDir,'hud.png'),omitBackground:true});await hud.close();
  for(let slide=1;slide<=5;slide++){
   const page=await canvasContext.newPage();await page.setViewportSize({width:1440,height:900});await page.goto(file(path.join(root,'canvas.html'))+`?locale=${locale}&slide=${slide}`);await page.waitForFunction(()=>window.canvasReady||window.canvasError);const err=await page.evaluate(()=>window.canvasError);if(err)throw Error(err);await settled(page);
   const metrics=await page.evaluate(()=>{const h=document.querySelector('h1'),p=document.querySelector('header p');const r=h.getBoundingClientRect(),pr=p.getBoundingClientRect();return{title:h.textContent,subtitle:p.textContent,titleLines:Math.round(r.height/parseFloat(getComputedStyle(h).lineHeight)),titleRight:r.right,subtitleBottom:pr.bottom,pets:[...document.querySelectorAll('.pet')].map(e=>({id:e.dataset.pet,row:e.dataset.row,column:e.dataset.column,scale:e.dataset.scale,imageRendering:getComputedStyle(e).imageRendering}))}});
   if(metrics.titleLines>2||metrics.titleRight>1353||metrics.subtitleBottom>300)throw Error(locale+'/'+slide+' copy overflow '+JSON.stringify(metrics));
   const name=['01-walk-away','02-approve','03-characters','04-quiet','05-privacy'][slide-1];await page.screenshot({path:path.join(dir,name+'.png')});audit.slides.push({locale,name,...metrics});await page.close();console.log(locale+'/'+name);
  }
 }
 fs.writeFileSync(path.join(root,'audit.json'),JSON.stringify(audit,null,2)+'\n');
 }finally{await canvasContext.close();await context.close();fs.rmSync(tmp,{recursive:true,force:true})}
 const result=spawnSync('python3',[path.join(root,'verify.py')],{stdio:'inherit'});if(result.status!==0)throw Error('Image validation failed');
}
main().catch(e=>{console.error(e);process.exitCode=1});
