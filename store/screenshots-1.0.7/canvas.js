'use strict';
(async()=>{
 const q=new URLSearchParams(location.search),locale=q.get('locale')||'en-US',slide=Number(q.get('slide')||1);
 const all=await (await fetch('copy.json')).json(); const copy=all[locale];document.documentElement.lang=locale;
 document.body.className=`s${slide} ${['zh','zh-TW','ja','ko'].includes(copy.lang)?'cjk':''}`;
 document.getElementById('title').textContent=copy.slides[slide-1][0];document.getElementById('subtitle').textContent=copy.slides[slide-1][1];
 const scene=document.getElementById('scene');
 function ui(name){const d=document.createElement('div');d.className='ui';d.innerHTML=`<img src="${locale}/ui/${name}.png">`;scene.append(d)}
 function pet(id,row,col=0,scale=2,x,y){const d=document.createElement('div');d.className='pet';d.dataset.pet=id;d.dataset.row=row;d.dataset.column=col;d.dataset.scale=scale;
 Object.assign(d.style,{width:192*scale+'px',height:208*scale+'px',backgroundImage:`url('../../agenthalo/pets/${id}/spritesheet.webp')`,backgroundSize:`${1536*scale}px ${2288*scale}px`,backgroundPosition:`-${192*col*scale}px -${208*row*scale}px`});if(x!==undefined){d.style.left=x+'px';d.style.top=y+'px'}scene.append(d)}
 function shadow(x,y,w=300){const d=document.createElement('div');d.className='ground';if(x!==undefined)Object.assign(d.style,{left:x+'px',top:y+'px',width:w+'px',height:'18px'});scene.append(d)}
 if(slide===1){ui('hud');shadow();pet('halo',0)}
 if(slide===2){ui('bubble');shadow();pet('halo',6)}
 if(slide===3){ui('theme');const pets=[['halo',0,0],['fox',3,2],['panda',4,3],['octopus',7,2],['cat',8,0],['bunny',3,2],['dragon',0,0],['penguin',4,3],['axolotl',6,0],['wukong',3,2]];pets.forEach(([id,r,c],i)=>{const x=110+(i%5)*250,y=i<5?490:686;shadow(x+28,y+195,132);pet(id,r,c,1,x,y)})}
 if(slide===4){ui('sound');shadow();pet('halo',8)}
 if(slide===5){ui('agents');shadow();pet('halo',0)}
 await document.fonts.ready;await Promise.all([...document.images].map(i=>i.decode()));
 await Promise.all([...document.querySelectorAll('.pet')].map(p=>new Promise((resolve,reject)=>{const i=new Image();i.onload=resolve;i.onerror=reject;i.src=p.style.backgroundImage.slice(5,-2)})));window.canvasReady=true;
})().catch(e=>{window.canvasError=String(e)});
