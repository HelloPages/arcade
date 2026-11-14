/* 原創花園推箱子。REA 靜態參考：paskhaver/sokoban 的阻擋、單箱推移與全目標檢查。
   未複製參考程式、關卡或美術；證據與限制見 REA_GARDEN.md。 */
(() => {
 'use strict';
 const $=id=>document.getElementById(id),params=new URLSearchParams(location.search),canvas=$('scene'),ctx=canvas.getContext('2d');
 const levels=[
  {name:'初綻花徑',map:['#######','#  .  #','#  $  #','#  @  #','#     #','#     #','#######']},
  {name:'雙生向日葵',map:['#######','# . . #','# $ $ #','#     #','#  @  #','#     #','#######']},
  {name:'繞過花籬',map:['#######','# . . #','#     #','# $#$ #','#  @  #','#     #','#######']},
  {name:'轉角花事',map:['#######','#  .  #','# .#  #','# $ $ #','#  @  #','#     #','#######']},
  {name:'蝶后的晴日盛典',map:['#######','# . . #','#  .  #','# $ $ #','#  $  #','#  @  #','#######']}
 ];
 const dirs={up:[0,-1],down:[0,1],left:[-1,0],right:[1,0]},labels={up:'往上',down:'往下',left:'往左',right:'往右'};
 const s={mode:'loading',stage:1,moves:0,pushes:0,score:0,best:0,t:0,undoCount:0,hintCount:0,blocked:0};
 let walls=new Set(),goals=[],boxes=[],player=0,history=[],sprites=[],bg,ready=false,gesture=null,last=0,anim=null,cutTimer,viewport={width:390,height:844,scaleX:1,scaleY:1},layout={cell:46,x:34,y:200},hintCell=-1;
 document.body.classList.toggle('embedded',params.get('embed')==='1');
 try{s.best=Number(localStorage.getItem('garden-sunny-best'))||0;}catch{}
 function extractQuadrantSprite(image,index){
  const tile=document.createElement('canvas');tile.width=Math.floor(image.width/2);tile.height=Math.floor(image.height/2);const c=tile.getContext('2d',{willReadFrequently:true});
  c.drawImage(image,index%2*tile.width,Math.floor(index/2)*tile.height,tile.width,tile.height,0,0,tile.width,tile.height);
  const im=c.getImageData(0,0,tile.width,tile.height),d=im.data,n=tile.width*tile.height,seen=new Uint8Array(n),q=new Int32Array(n);let head=0,tail=0;
  const white=i=>Math.min(d[i*4],d[i*4+1],d[i*4+2])>238&&Math.max(d[i*4],d[i*4+1],d[i*4+2])-Math.min(d[i*4],d[i*4+1],d[i*4+2])<20;
  const add=i=>{if(!seen[i]&&white(i)){seen[i]=1;q[tail++]=i;}};for(let x=0;x<tile.width;x++){add(x);add(n-tile.width+x);}for(let y=0;y<tile.height;y++){add(y*tile.width);add(y*tile.width+tile.width-1);}
  while(head<tail){const i=q[head++],x=i%tile.width,y=Math.floor(i/tile.width);d[i*4+3]=0;if(x)add(i-1);if(x+1<tile.width)add(i+1);if(y)add(i-tile.width);if(y+1<tile.height)add(i+tile.width);}
  let x0=tile.width,y0=tile.height,x1=0,y1=0;for(let i=0;i<n;i++){if(seen[i])continue;const x=i%tile.width,y=Math.floor(i/tile.width),edge=(x&&seen[i-1])||(x+1<tile.width&&seen[i+1])||(y&&seen[i-tile.width])||(y+1<tile.height&&seen[i+tile.width]);if(edge)d[i*4+3]=Math.round(255*Math.max(.1,Math.min(1,(255-Math.min(d[i*4],d[i*4+1],d[i*4+2]))/34)));if(d[i*4+3]>30){x0=Math.min(x0,x);y0=Math.min(y0,y);x1=Math.max(x1,x);y1=Math.max(y1,y);}}
  if(x1<=x0||y1<=y0)throw Error('精靈輪廓擷取失敗');c.putImageData(im,0,0);const out=document.createElement('canvas');out.height=280;out.width=Math.round((x1-x0+1)*280/(y1-y0+1));out.getContext('2d').drawImage(tile,x0,y0,x1-x0+1,y1-y0+1,0,0,out.width,280);return out;
 }
 const image=url=>new Promise((resolve,reject)=>{const im=new Image();im.onload=()=>resolve(im);im.onerror=()=>reject(Error('素材載入失敗'));im.src=url;});
 async function load(){s.mode='loading';$('start').disabled=true;try{const a=await Promise.all([image('assets/garden_bg.jpg'),image('assets/garden_sprites.png'),image('assets/garden_cover.jpg')]);bg=a[0];sprites=[0,1,2,3].map(i=>extractQuadrantSprite(a[1],i));$('guardian').src=sprites[3].toDataURL();ready=true;loadLevel(1);s.mode='ready';$('load-status').textContent='陽光已就緒，花園正等著你。';$('start').textContent='走進晴空花園';$('start').disabled=false;hud();render();}catch{ready=false;s.mode='error';$('load-status').textContent='素材載入失敗，請點擊重新載入。';$('start').textContent='重新載入';$('start').disabled=false;}}
 function loadLevel(stage){s.stage=stage;s.moves=0;s.pushes=0;history=[];boxes=[];goals=[];walls=new Set();anim=null;hintCell=-1;levels[stage-1].map.forEach((row,y)=>[...row].forEach((ch,x)=>{const n=y*7+x;if(ch==='#')walls.add(n);if(ch==='.')goals.push(n);if(ch==='$')boxes.push(n);if(ch==='@')player=n;}));resize();setHint('將花盆推到金色花座 · 一次推一盆');}
 function start(){if(!ready){load();return;}clearTimeout(cutTimer);$('cutin').classList.remove('show');Object.assign(s,{mode:'playing',score:0,t:0,undoCount:0,hintCount:0,blocked:0});loadLevel(1);$('overlay').classList.add('hidden');hud();}
 function show(title,description,label){$('heading').textContent=title;$('heading').className='result-title';$('description').textContent=description;$('load-status').textContent=`第 ${s.stage} 座花園 · ${s.moves} 步 · 推盆 ${s.pushes} 次`;$('start').textContent=label;$('overlay').classList.remove('hidden');hud();}
 function pause(){if(s.mode!=='playing')return;s.mode='paused';gesture=null;show('停下來聞聞花香','花盆與園丁會留在原地，想好了再繼續。','繼續佈置');}
 function resume(){s.mode='playing';$('overlay').classList.add('hidden');last=performance.now();hud();}
 function next(){s.mode='playing';loadLevel(s.stage+1);$('overlay').classList.add('hidden');if(s.stage===5){$('cutin').classList.add('show');clearTimeout(cutTimer);cutTimer=setTimeout(()=>$('cutin').classList.remove('show'),2200);}hud();}
 function setHint(t){$('hint').textContent=t;}
 function popup(text){const el=document.createElement('span');el.className='popup';el.textContent=text;el.style.left='50%';el.style.top=(layout.y+layout.cell*3)/viewport.height*100+'%';$('popups').append(el);setTimeout(()=>el.remove(),1100);}
 const onGoals=()=>boxes.filter(n=>goals.includes(n)).length;
 function target(n,dx,dy){const x=n%7+dx,y=Math.floor(n/7)+dy;return x<0||x>=7||y<0||y>=7?-1:y*7+x;}
 function move(dir){if(s.mode!=='playing')return;const[dx,dy]=dirs[dir],n=target(player,dx,dy),bi=boxes.indexOf(n),to=bi>=0?target(n,dx,dy):-1;
  if(n<0||walls.has(n)||(bi>=0&&(to<0||walls.has(to)||boxes.includes(to)))){s.blocked++;setHint('前面有花籬或花盆 · 換個方向試試');return;}
  history.push({player,boxes:[...boxes],moves:s.moves,pushes:s.pushes});const before=onGoals();anim={from:player,to:n,boxFrom:bi>=0?n:-1,boxTo:to,elapsed:0};player=n;s.moves++;hintCell=-1;
  if(bi>=0){boxes[bi]=to;s.pushes++;if(onGoals()>before)popup('盛開！ +100');const corner=(walls.has(target(to,1,0))||walls.has(target(to,-1,0)))&&(walls.has(target(to,0,1))||walls.has(target(to,0,-1)));setHint(corner&&!goals.includes(to)?'這盆卡在角落了 · 按「復原」救回來':'花盆只能推，不能拉 · 先想好站位');}else setHint('繞到花盆後方，再推向金色花座');
  if(onGoals()===goals.length){const earned=Math.max(100,1000-s.moves*10);s.score+=earned;s.mode=s.stage===5?'won':'cleared';if(s.mode==='won'&&s.score>s.best){s.best=s.score;try{localStorage.setItem('garden-sunny-best',s.best);}catch{}}show(s.mode==='won'?'五座花園，全數盛開！':'這座花園盛開了！',`完成佈置，獲得 ${earned} 花園分。`+(s.mode==='won'?'花冠蝶后送上晴日花冠，下次挑戰更少步數！':'下一座花園，多一點小巧思。'),s.mode==='won'?'再遊一次':'下一座花園');}
  hud();render();
 }
 function undo(){if(s.mode!=='playing'||!history.length)return;const old=history.pop();player=old.player;boxes=old.boxes;s.moves=old.moves;s.pushes=old.pushes;s.undoCount++;anim=null;hintCell=-1;setHint('已復原一步 · 花園可以慢慢想');hud();render();}
 function restart(){if(s.mode!=='playing')return;loadLevel(s.stage);popup('重新佈置這座花園');hud();}
 // 有限 BFS 只提供下一步建議，不替玩家移動。每個狀態保留玩家格與排序花盆格。
 function solve(){const key=(p,b)=>p+'|'+[...b].sort((a,b)=>a-b).join(','),q=[{p:player,b:[...boxes],prev:-1,dir:null}],seen=new Set([key(player,boxes)]);let head=0;
  while(head<q.length&&q.length<65000){const cur=q[head],index=head++;if(cur.b.every(n=>goals.includes(n))){const path=[];let j=index;while(q[j].prev>=0){path.push(q[j].dir);j=q[j].prev;}return{path:path.reverse(),examined:head};}
   for(const[dir,[dx,dy]]of Object.entries(dirs)){const n=target(cur.p,dx,dy);if(n<0||walls.has(n))continue;const bi=cur.b.indexOf(n),b=[...cur.b];if(bi>=0){const t=target(n,dx,dy);if(t<0||walls.has(t)||b.includes(t))continue;const corner=(walls.has(target(t,1,0))||walls.has(target(t,-1,0)))&&(walls.has(target(t,0,1))||walls.has(target(t,0,-1)));if(corner&&!goals.includes(t))continue;b[bi]=t;}const k=key(n,b);if(!seen.has(k)){seen.add(k);q.push({p:n,b,prev:index,dir});}}
  }return{path:null,examined:head,limited:q.length>=65000};
 }
 function help(){if(s.mode!=='playing')return;const r=solve();s.hintCount++;if(r.path?.length){const dir=r.path[0];hintCell=target(player,...dirs[dir]);setHint(`花語：先${labels[dir]}一步 · 距離盛開還有 ${r.path.length} 步`);}else{hintCell=-1;setHint(r.limited?'花路有點複雜 · 可先復原幾步再問提示':'這個擺法無法完成 · 按「復原」或「重來本關」');}render();}
 const set=(id,t)=>{if($(id).textContent!==t)$(id).textContent=t;};
 function hud(){set('chapter',`${levels[s.stage-1].name} · ${s.stage} / 5`);set('moves',String(s.moves));set('goals',`花盆 ${onGoals()} / ${goals.length}`);set('score',String(s.score));set('best',`最佳花園分 ${s.best} · 滑動 / 方向鍵 / WASD`);const progress=Math.round(((s.stage-1+onGoals()/goals.length)/5)*100);$('progress').style.width=progress+'%';document.querySelector('[role=progressbar]').setAttribute('aria-valuenow',String(progress));$('undo').disabled=s.mode!=='playing'||!history.length;for(const id of ['pause','help','restart'])$(id).disabled=s.mode!=='playing';document.querySelectorAll('[data-dir]').forEach(b=>b.disabled=s.mode!=='playing');}
 const xy=n=>({x:layout.x+(n%7+.5)*layout.cell,y:layout.y+(Math.floor(n/7)+.5)*layout.cell});
 function sprite(i,x,y,h,phase=0){const im=sprites[i];if(!im)return;const breath=Math.sin(s.t*3+phase)*.018,hop=anim&&i===0?Math.sin(Math.min(1,anim.elapsed/.15)*Math.PI)*layout.cell*.1:0;ctx.save();ctx.translate(x,y-hop);ctx.scale(1+breath,1-breath);ctx.drawImage(im,-h*im.width/im.height/2,-h,h*im.width/im.height,h);ctx.restore();}
 function shadow(x,y,w){ctx.fillStyle='#317b562d';ctx.beginPath();ctx.ellipse(x,y,w,layout.cell*.065,0,0,Math.PI*2);ctx.fill();}
 function render(){const{width:w,height:h}=viewport;ctx.clearRect(0,0,w,h);if(bg)ctx.drawImage(bg,0,0,w,h);if(!ready)return;
  const c=layout.cell;ctx.save();ctx.shadowColor='#27855724';ctx.shadowBlur=22;ctx.fillStyle='#fffdf1e8';ctx.beginPath();ctx.roundRect(layout.x-7,layout.y-7,c*7+14,c*7+14,23);ctx.fill();ctx.restore();
  for(let n=0;n<49;n++){const p=xy(n);if(walls.has(n))continue;ctx.fillStyle=goals.includes(n)?'#ffe6a7e6':((n+Math.floor(n/7))%2?'#f8fff1db':'#e7f4dcd9');ctx.beginPath();ctx.roundRect(p.x-c*.47,p.y-c*.47,c*.94,c*.94,c*.11);ctx.fill();if(goals.includes(n)){ctx.strokeStyle='#d89c38';ctx.lineWidth=2;ctx.setLineDash([4,3]);ctx.stroke();ctx.setLineDash([]);ctx.fillStyle='#bf8523';ctx.font=`700 ${Math.round(c*.22)}px system-ui`;ctx.textAlign='center';ctx.fillText('花座',p.x,p.y+c*.1);}if(hintCell===n){ctx.strokeStyle='#19ad9c';ctx.lineWidth=3;ctx.beginPath();ctx.roundRect(p.x-c*.4,p.y-c*.4,c*.8,c*.8,10);ctx.stroke();}}
  const fraction=anim?Math.min(1,anim.elapsed/.15):1,eased=1-Math.pow(1-fraction,3),objects=[];
  for(const n of walls)objects.push({n,i:2,h:c*.92});for(const n of boxes)objects.push({n,i:1,h:c*.91});objects.push({n:player,i:0,h:c*1.16});objects.sort((a,b)=>a.n-b.n||a.i-b.i);
  for(const o of objects){let p=xy(o.n);if(anim&&((o.i===0)||(o.i===1&&o.n===anim.boxTo))){const a=xy(o.i===0?anim.from:anim.boxFrom);p={x:a.x+(p.x-a.x)*eased,y:a.y+(p.y-a.y)*eased};}const y=p.y+c*.39;shadow(p.x,y,c*(o.i===2?.4:.29));sprite(o.i,p.x,y,o.h,o.n);}
  if(s.stage===5){const p=xy(3);sprite(3,p.x,layout.y-12,c*.85);} }
 function resize(){const r=$('world').getBoundingClientRect(),dpr=Math.min(devicePixelRatio||1,2);viewport={width:r.width,height:r.height,scaleX:r.width/390,scaleY:r.height/844};canvas.width=Math.round(r.width*dpr);canvas.height=Math.round(r.height*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);const top=Math.max(110,document.querySelector('.hud').getBoundingClientRect().bottom-r.top+19),bottom=document.querySelector('.controls').getBoundingClientRect().top-r.top-18,c=Math.min((r.width-32)/7,Math.max(1,bottom-top)/7,68);layout={cell:c,x:(r.width-c*7)/2,y:top+(bottom-top-c*7)/2};render();}
 $('start').onclick=()=>s.mode==='paused'?resume():s.mode==='cleared'?next():start();$('pause').onclick=pause;$('undo').onclick=undo;$('restart').onclick=restart;$('help').onclick=help;document.querySelectorAll('[data-dir]').forEach(b=>b.onclick=()=>move(b.dataset.dir));
 canvas.addEventListener('pointerdown',e=>{if(s.mode!=='playing')return;gesture={id:e.pointerId,x:e.clientX,y:e.clientY};canvas.setPointerCapture(e.pointerId);});canvas.addEventListener('pointerup',e=>{if(!gesture||e.pointerId!==gesture.id)return;const dx=e.clientX-gesture.x,dy=e.clientY-gesture.y;gesture=null;if(Math.max(Math.abs(dx),Math.abs(dy))<18)return;move(Math.abs(dx)>Math.abs(dy)?dx>0?'right':'left':dy>0?'down':'up');});canvas.addEventListener('pointercancel',()=>gesture=null);
 function fullscreen(){const active=!document.body.classList.contains('fullscreen');document.body.classList.toggle('fullscreen',active);if(active)document.documentElement.requestFullscreen?.().catch(()=>{});else if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});resize();}
 $('fullscreen').onclick=fullscreen;$('exit-fullscreen').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('fullscreen');resize();});addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='PARENT_FS_STATE'){document.body.classList.toggle('parent-fullscreen',Boolean(e.data.value));resize();}});
 const mapping={ArrowUp:'up',ArrowDown:'down',ArrowLeft:'left',ArrowRight:'right',w:'up',s:'down',a:'left',d:'right'};addEventListener('keydown',e=>{if(mapping[e.key]){e.preventDefault();move(mapping[e.key]);}if(!e.repeat&&e.key.toLowerCase()==='z')undo();if(!e.repeat&&e.key.toLowerCase()==='h')help();if(!e.repeat&&e.key.toLowerCase()==='r')restart();if(!e.repeat&&e.key.toLowerCase()==='p')s.mode==='paused'?resume():pause();});addEventListener('blur',()=>gesture=null);document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});addEventListener('resize',resize);
 window.render_game_to_text=()=>JSON.stringify({...s,assetsReady:ready,player,boxes:[...boxes],goals:[...goals],walls:[...walls],history:history.length,onGoals:onGoals(),coordinates:'7×7，左上為0，格號=y*7+x；不能拉盆或同時推兩盆',viewport,layout});
 window.advanceTime=ms=>{const dt=Math.min(10000,Math.max(0,ms))/1000;if(s.mode==='playing'){s.t+=dt;if(anim){anim.elapsed+=dt;if(anim.elapsed>.15)anim=null;}}render();};
 new ResizeObserver(resize).observe(document.querySelector('.controls'));new ResizeObserver(resize).observe(document.querySelector('.hud'));
 function frame(now){const dt=Math.min((now-last)/1000||0,.04);last=now;if(s.mode==='playing'){s.t+=dt;if(anim){anim.elapsed+=dt;if(anim.elapsed>.15)anim=null;}render();}requestAnimationFrame(frame);}hud();resize();load();requestAnimationFrame(frame);
})();
