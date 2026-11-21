'use strict';
(async()=>{
 const q=new URLSearchParams(location.search),locale=q.get('locale')||'en-US',slide=Number(q.get('slide')||1);
 const bounds=await (await fetch('frame-bounds.json')).json();
 const all=await (await fetch('copy.json')).json(); const copy=all[locale];document.documentElement.lang=locale;
 document.body.className=`s${slide} ${['zh','zh-TW','ja','ko'].includes(copy.lang)?'cjk':''}`;
 document.getElementById('title').textContent=copy.slides[slide-1][0];document.getElementById('subtitle').textContent=copy.slides[slide-1][1];
 const scene=document.getElementById('scene');
 function ui(name){const d=document.createElement('div');d.className='ui';d.innerHTML=`<img src="${locale}/ui/${name}.png">`;scene.append(d)}
 function pet(id,row,col=0,scale=2,x,y,cropped=true){
  const b=cropped?bounds[`${id}:${row}:${col}`]:{x:0,y:0,width:192,height:208};
  const d=document.createElement('div');d.className='pet';Object.assign(d.dataset,{pet:id,row,column:col,scale,cropped});
  Object.assign(d.style,{width:b.width*scale+'px',height:b.height*scale+'px',backgroundImage:`url('../../agenthalo/pets/${id}/spritesheet.webp')`,backgroundSize:`${1536*scale}px ${2288*scale}px`,backgroundPosition:`-${(192*col+b.x)*scale}px -${(208*row+b.y)*scale}px`});
  if(x!==undefined){d.style.left=x+'px';d.style.top=y+'px'}scene.append(d);
 }
 function shadow(x,y,w=300){const d=document.createElement('div');d.className='ground';if(x!==undefined)Object.assign(d.style,{left:x+'px',top:y+'px',width:w+'px',height:'18px'});scene.append(d)}
 if(slide===1){ui('hud');shadow();pet('halo',0,0,2.5)}
 if(slide===2){ui('bubble');shadow();pet('halo',6,0,2,undefined,undefined,false)}
 if(slide===3){
  ui('theme');const pets=[['halo',0,0],['fox',3,1],['panda',4,3],['octopus',3,0],['cat',4,0],['bunny',3,1],['dragon',0,0],['penguin',4,1],['axolotl',6,0],['wukong',3,2]];
  pets.forEach(([id,r,c],i)=>{const b=bounds[`${id}:${r}:${c}`],center=100+(i%5)*148,y=i<5?400:650;const x=Math.round(center-b.width/2);shadow(center-52,y+162,104);pet(id,r,c,1,x,y)});
 }
 if(slide===4){ui('sound');shadow();pet('halo',8)}
 if(slide===5){ui('agents');shadow();pet('halo',0)}
 await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));
 await Promise.all([...document.querySelectorAll('.pet')].map(p=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=p.style.backgroundImage.slice(5,-2)})));window.canvasReady=true;
})().catch(e=>{window.canvasError=String(e)});
