/* 晴空海島：晶獸彈跳祭。原創實作；Pang 公開重製版僅作靜態機制研究。 */
(() => {
  'use strict';
  const $ = id => document.getElementById(id), W = 390, H = 844, FLOOR = 614;
  const embedded = new URLSearchParams(location.search).get('embed') === '1';
  document.body.classList.toggle('embedded', embedded);
  const canvas = $('scene'), ctx = canvas.getContext('2d');
  const state = {mode:'loading',round:1,lives:3,score:0,best:0,time:60,t:0,auto:true,shot:0,skill:0,freeze:0,invulnerable:0,transition:0,popped:0,shots:0,splits:0};
  try {state.best = Number(localStorage.getItem('sunny-pang-best')) || 0;} catch {}
  const player = {x:195,y:FLOOR,target:null}, keys = new Set();
  let enemies = [], beams = [], particles = [], sprites = [], background, ready = false, last = 0, manualUntil = 0, activePointer = null;
  let nextId = 1, viewport = {scaleX:1,scaleY:1}, shootHeld = false;
  const sizes = [23,36,52], stages = ['珊瑚灣 · 晴空海岸','水晶礁 · 海風迴廊','皇冠島 · 珊瑚王庭'];

  // 只移除與圖集邊界連通的白色；保留服飾、眼睛等內部白色。
  function extractQuadrantSprite(image, index) {
    const tile = document.createElement('canvas');
    tile.width = Math.floor(image.width/2); tile.height = Math.floor(image.height/2);
    const c = tile.getContext('2d',{willReadFrequently:true});
    c.drawImage(image,index%2*tile.width,Math.floor(index/2)*tile.height,tile.width,tile.height,0,0,tile.width,tile.height);
    const im = c.getImageData(0,0,tile.width,tile.height), d = im.data, count=tile.width*tile.height;
    const seen = new Uint8Array(count), queue = new Int32Array(count); let head=0,tail=0;
    const white = p => Math.min(d[p*4],d[p*4+1],d[p*4+2]) > 242 && Math.max(d[p*4],d[p*4+1],d[p*4+2])-Math.min(d[p*4],d[p*4+1],d[p*4+2]) < 14;
    function add(p){if(!seen[p] && white(p)){seen[p]=1;queue[tail++]=p;}}
    for(let x=0;x<tile.width;x++){add(x);add(count-tile.width+x);}
    for(let y=0;y<tile.height;y++){add(y*tile.width);add(y*tile.width+tile.width-1);}
    while(head<tail){const p=queue[head++],x=p%tile.width,y=Math.floor(p/tile.width); d[p*4+3]=0;
      if(x>0)add(p-1);if(x<tile.width-1)add(p+1);if(y>0)add(p-tile.width);if(y<tile.height-1)add(p+tile.width);
    }
    // 羽化與背景相鄰的抗鋸齒像素，同時避免整個角色半透明。
    let minX=tile.width,minY=tile.height,maxX=0,maxY=0;
    for(let p=0;p<count;p++){if(seen[p])continue;const x=p%tile.width,y=Math.floor(p/tile.width);
      const adjacent=(x>0&&seen[p-1])||(x<tile.width-1&&seen[p+1])||(y>0&&seen[p-tile.width])||(y<tile.height-1&&seen[p+tile.width]);
      if(adjacent){const whiteness=Math.min(d[p*4],d[p*4+1],d[p*4+2]);d[p*4+3]=Math.round(255*Math.max(.16,Math.min(1,(255-whiteness)/38)));}
      if(d[p*4+3]>32){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);}
    }
    c.putImageData(im,0,0);
    if(maxX<=minX||maxY<=minY)throw Error('精靈去背失敗');
    const out=document.createElement('canvas'),sourceW=maxX-minX+1,sourceH=maxY-minY+1;out.height=Math.min(300,sourceH);out.width=Math.round(sourceW*out.height/sourceH);
    const oc=out.getContext('2d');oc.imageSmoothingQuality='high';oc.drawImage(tile,minX,minY,sourceW,sourceH,0,0,out.width,out.height);
    return out;
  }
  function image(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(Error('素材載入失敗'));img.src=url;});}
  async function load(){try{
    const loaded=await Promise.all([image('./assets/pang_bg.jpg'),image('./assets/pang_sprites.png'),image('./assets/pang_cover.jpg')]);
    background=loaded[0];sprites=[0,1,2,3].map(i=>extractQuadrantSprite(loaded[1],i));ready=true;state.mode='ready';
    $('load-status').textContent='海島已就緒，出發吧！';$('start').textContent='出發！守護珊瑚灣';$('start').disabled=false;render();
  }catch(e){state.mode='error';$('load-status').textContent='海島素材載入失敗，請重試。';$('start').disabled=false;$('start').textContent='重新載入素材';}}
  function resizeViewport(){const rect=canvas.getBoundingClientRect();viewport={scaleX:rect.width/W,scaleY:rect.height/H};const dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(rect.width*dpr);canvas.height=Math.round(rect.height*dpr);ctx.setTransform(canvas.width/W,0,0,canvas.height/H,0,0);ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';render();}
  new ResizeObserver(resizeViewport).observe($('game'));
  function enemy(size,x,y,dir,boss=false){return {id:nextId++,size,x,y,vx:dir*(65+(2-size)*23),vy:-160,r:boss?61:sizes[size],hp:boss?6:1,boss,hit:0};}
  function startRound(){enemies=[];beams=[];particles=[];player.x=195;player.target=null;state.time=60;state.shot=.2;state.freeze=0;state.invulnerable=2;state.transition=0;
    if(state.round===1)enemies.push(enemy(2,105,245,1),enemy(1,285,340,-1));
    else if(state.round===2)enemies.push(enemy(2,90,255,1),enemy(2,292,330,-1),enemy(0,192,420,1));
    else {enemies.push(enemy(2,195,285,1,true));$('cutin').classList.remove('show');void $('cutin').offsetWidth;$('cutin').classList.add('show');}
    state.mode='playing';$('island-label').textContent=stages[state.round-1];$('overlay').hidden=true;updateHud();
  }
  function start(){if(!ready){load();return;}keys.clear();shootHeld=false;Object.assign(state,{round:1,lives:3,score:0,t:0,skill:0,popped:0,shots:0,splits:0});startRound();}
  function popup(text,x,y){const e=document.createElement('span');e.className='damage';e.textContent=text;e.style.left=x/W*100+'%';e.style.top=y/H*100+'%';$('popups').append(e);e.addEventListener('animationend',()=>e.remove());setTimeout(()=>e.remove(),1000);}
  function shoot(){if(state.mode!=='playing'||state.shot>0||beams.length>=3)return;beams.push({x:player.x,y:FLOOR-45,age:0});state.shot=.42;state.shots++;}
  function skill(){if(state.mode!=='playing'||state.skill>0)return;state.freeze=3.2;state.skill=10;popup('潮汐凍結',195,365);updateHud();}
  function burst(x,y){for(let i=0;i<12;i++)particles.push({x,y,vx:Math.cos(i*2.4)*90,vy:Math.sin(i*2.4)*90,life:.6,color:['#fff6a1','#ff9e99','#5be8e3'][i%3]});}
  function hit(target){target.hp--;target.hit=.18;state.score+=target.boss?150:(3-target.size)*100;popup(target.boss?'晶光命中！':`+${(3-target.size)*100}`,target.x,target.y-30);burst(target.x,target.y);
    if(target.hp<=0){enemies=enemies.filter(e=>e!==target);state.popped++;if(target.size>0){state.splits++;const y=Math.min(target.y,FLOOR-sizes[target.size-1]-50);for(const dir of [-1,1]){const child=enemy(target.size-1,Math.max(45,Math.min(345,target.x+dir*18)),y,dir);child.vy=-225;enemies.push(child);}}}
  }
  function finish(won){state.mode=won?'won':'lost';keys.clear();shootHeld=false;player.target=null;if(state.score>state.best){state.best=state.score;try{localStorage.setItem('sunny-pang-best',state.best);}catch{}}
    showPanel(won?'珊瑚灣守護成功！':'再試一次，海風正好',won?'三座海島都恢復平靜了！':'晶獸的路線多變，試著提早左右閃避。',`本次積分 ${state.score.toLocaleString()} · 最高 ${state.best.toLocaleString()}`,'再來一場');updateHud();
  }
  function showPanel(title,desc,status,button){$('overlay').hidden=false;$('cover').hidden=true;$('tags').hidden=true;$('keyboard').hidden=true;$('panel-title').textContent=title;$('description').textContent=desc;$('load-status').textContent=status;$('start').textContent=button;$('eyebrow').textContent='晴空海島 · 晶獸彈跳祭';$('restart').hidden=true;}
  function pause(){if(state.mode==='playing'){state.mode='paused';keys.clear();shootHeld=false;player.target=null;showPanel('海風休息時間','晶獸正在等你，準備好就繼續冒險。',`第 ${state.round} 座海島 · 剩餘 ${Math.ceil(state.time)} 秒`,'繼續冒險');$('restart').hidden=false;}}
  function resume(){if(state.mode==='paused'){state.mode='playing';$('overlay').hidden=true;last=performance.now();}}
  function update(dt){if(state.mode!=='playing')return;state.t+=dt;state.time=Math.max(0,state.time-dt);state.shot=Math.max(0,state.shot-dt);state.skill=Math.max(0,state.skill-dt);state.freeze=Math.max(0,state.freeze-dt);state.invulnerable=Math.max(0,state.invulnerable-dt);
    if(state.time<=0){finish(false);return;}
    const direction=(keys.has('right')?1:0)-(keys.has('left')?1:0);player.x=Math.max(26,Math.min(W-26,player.x+direction*250*dt));
    if(player.target!==null&&!direction){const distance=player.target-player.x;player.x+=Math.sign(distance)*Math.min(Math.abs(distance),310*dt);}
    if(state.auto||shootHeld)shoot();
    for(const e of enemies){const speed=state.freeze>0?0:1;e.hit=Math.max(0,e.hit-dt);e.vy+=540*dt*speed;e.x+=e.vx*dt*speed;e.y+=e.vy*dt*speed;
      const rx=e.r*viewport.scaleY/viewport.scaleX;
      if(e.x<rx){e.x=rx;e.vx=Math.abs(e.vx);}if(e.x>W-rx){e.x=W-rx;e.vx=-Math.abs(e.vx);}
      if(e.y>FLOOR-e.r){e.y=FLOOR-e.r;e.vy=-(e.boss?415:275+e.size*62);}
      if(e.y<150+e.r){e.y=150+e.r;e.vy=Math.abs(e.vy);}
      if(state.invulnerable===0&&Math.hypot((e.x-player.x)*viewport.scaleX/viewport.scaleY*.9,e.y-(FLOOR-29))<e.r+14){state.lives--;state.invulnerable=2;popup('小心晶獸！',player.x,FLOOR-100);if(state.lives<=0){finish(false);return;}}
    }
    for(const b of beams){b.y-=740*dt;b.age+=dt;const target=enemies.find(e=>Math.abs(e.x-b.x)<(e.r*.77+5)*viewport.scaleY/viewport.scaleX&&e.y+e.r>=b.y&&e.y-e.r<FLOOR-38);if(target){hit(target);b.age=9;}}
    beams=beams.filter(b=>b.y>135&&b.age<1.1);
    for(const p of particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=140*dt;p.life-=dt;}particles=particles.filter(p=>p.life>0);
    if(enemies.length===0){state.transition+=dt;if(state.transition>.75){if(state.round===3){finish(true);return;}state.round++;state.score+=500;state.lives=Math.min(3,state.lives+1);startRound();}}
  }
  function text(id,value){const el=$(id);if(el.textContent!==String(value))el.textContent=value;}
  function updateHud(){text('score',state.score.toLocaleString());text('best',state.best.toLocaleString());text('lives',state.lives);text('round',`0${state.round} / 03`);text('time',Math.ceil(state.time)+' 秒');text('cooldown',state.skill>0?Math.ceil(state.skill)+' 秒':'準備就緒');const disabled=state.skill>0;if($('skill').disabled!==disabled)$('skill').disabled=disabled;const boss=enemies.find(e=>e.boss);if($('boss-meter').hidden!==!boss)$('boss-meter').hidden=!boss;if(boss){text('boss-health',`${boss.hp} / 6`);const width=boss.hp/6*100+'%';if($('boss-fill').style.width!==width)$('boss-fill').style.width=width;}text('hint',state.freeze>0?'潮汐凍結中！把握機會迎擊':'左右滑動閃避 · '+(state.auto?'自動發射魚叉':'點擊晶光魚叉發射'));}
  function sprite(index,x,y,height,phase,flash=false){const img=sprites[index];if(!img)return;const bounce=Math.sin(state.t*4+phase);ctx.save();ctx.translate(x,y+bounce*2);ctx.scale((1+bounce*.025)*viewport.scaleY/viewport.scaleX,1-bounce*.025);ctx.globalAlpha=flash?.6:1;const width=height*img.width/img.height;ctx.drawImage(img,-width/2,-height,width,height);ctx.restore();}
  function shadow(x,y,width,alpha){ctx.save();ctx.fillStyle=`rgba(15,115,124,${alpha})`;ctx.filter='blur(3px)';ctx.beginPath();ctx.ellipse(x,y,width*viewport.scaleY/viewport.scaleX,5,0,0,Math.PI*2);ctx.fill();ctx.restore();}
  function render(){ctx.clearRect(0,0,W,H);if(background)ctx.drawImage(background,0,0,W,H);else{const g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,'#c2f4ff');g.addColorStop(1,'#fff1c4');ctx.fillStyle=g;ctx.fillRect(0,0,W,H);}if(!ready)return;
    if(state.mode==='ready'){shadow(195,FLOOR+2,29,.16);sprite(0,195,FLOOR,134,0);return;}
    for(const e of enemies){shadow(e.x,FLOOR+1,e.r*.7,.09);sprite(e.boss?3:e.size===0?1:2,e.x,e.y+e.r,e.r*2.1,e.id,e.hit>0);if(state.freeze>0){ctx.save();ctx.strokeStyle='#efffff';ctx.lineWidth=2;ctx.setLineDash([3,5]);ctx.beginPath();ctx.ellipse(e.x,e.y,e.r+5,e.r+6,0,0,Math.PI*2);ctx.stroke();ctx.restore();}}
    for(const b of beams){ctx.save();const g=ctx.createLinearGradient(b.x-4,0,b.x+4,0);g.addColorStop(0,'#00c2cd');g.addColorStop(.5,'#fff7ac');g.addColorStop(1,'#00c2cd');ctx.strokeStyle=g;ctx.lineWidth=5;ctx.lineCap='round';ctx.shadowColor='#fff09c';ctx.shadowBlur=9;ctx.beginPath();ctx.moveTo(b.x,FLOOR-42);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.beginPath();ctx.moveTo(b.x-8,b.y+9);ctx.lineTo(b.x,b.y-4);ctx.lineTo(b.x+8,b.y+9);ctx.stroke();ctx.restore();}
    shadow(player.x,FLOOR+2,26,.18);sprite(0,player.x,FLOOR,134,0,state.invulnerable>0&&Math.floor(state.t*10)%2===0);
    for(const p of particles){ctx.save();ctx.globalAlpha=Math.max(0,p.life/.6);ctx.fillStyle=p.color;ctx.translate(p.x,p.y);ctx.rotate(state.t*3);ctx.fillRect(-2,-2,4,4);ctx.restore();}
  }
  $('start').onclick=()=>state.mode==='paused'?resume():start();$('restart').onclick=start;$('pause').onclick=pause;$('skill').onclick=skill;
  $('auto').onclick=()=>{state.auto=!state.auto;$('auto').textContent='自動發射 '+(state.auto?'開':'關');$('auto').setAttribute('aria-pressed',String(state.auto));updateHud();};
  function bindHold(id,on,off){const el=$(id);el.addEventListener('pointerdown',e=>{e.preventDefault();el.setPointerCapture(e.pointerId);on();});for(const event of ['pointerup','pointercancel','lostpointercapture'])el.addEventListener(event,off);}
  bindHold('left',()=>keys.add('left'),()=>keys.delete('left'));bindHold('right',()=>keys.add('right'),()=>keys.delete('right'));bindHold('fire',()=>{shootHeld=true;shoot();},()=>shootHeld=false);
  function target(e){const rect=canvas.getBoundingClientRect();player.target=Math.max(26,Math.min(W-26,(e.clientX-rect.left)/viewport.scaleX));}
  canvas.addEventListener('pointerdown',e=>{if(state.mode!=='playing')return;activePointer=e.pointerId;canvas.setPointerCapture(e.pointerId);target(e);});canvas.addEventListener('pointermove',e=>{if(e.pointerId===activePointer)target(e);});for(const event of ['pointerup','pointercancel','lostpointercapture'])canvas.addEventListener(event,()=>{activePointer=null;player.target=null;});
  function fullscreen(){if(embedded){parent.postMessage({type:'TOGGLE_IMMERSIVE_FS',active:true},location.origin);return;}const next=!document.body.classList.contains('fullscreen');document.body.classList.toggle('fullscreen',next);if(next)document.documentElement.requestFullscreen?.().catch(()=>{});else if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});resizeViewport();}
  $('fullscreen').onclick=fullscreen;$('exit-fullscreen').onclick=fullscreen;document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement)document.body.classList.remove('fullscreen');resizeViewport();});
  addEventListener('message',e=>{if(e.source===parent&&e.origin===location.origin&&e.data?.type==='PARENT_FS_STATE')document.body.classList.toggle('parent-fullscreen',Boolean(e.data.value));});
  addEventListener('keydown',e=>{const key=e.key.toLowerCase();if(['arrowleft','arrowright',' ','arrowup'].includes(key))e.preventDefault();if(key==='arrowleft'||key==='a')keys.add('left');if(key==='arrowright'||key==='d')keys.add('right');if(key===' '){shootHeld=true;shoot();}if(!e.repeat&&key==='p')state.mode==='paused'?resume():pause();if(!e.repeat&&key==='f')fullscreen();if(!e.repeat&&key==='e')skill();if(key==='escape')document.body.classList.remove('fullscreen');});
  addEventListener('keyup',e=>{const key=e.key.toLowerCase();if(key==='arrowleft'||key==='a')keys.delete('left');if(key==='arrowright'||key==='d')keys.delete('right');if(key===' ')shootHeld=false;});
  addEventListener('blur',()=>{keys.clear();shootHeld=false;player.target=null;activePointer=null;});document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});
  window.render_game_to_text=()=>JSON.stringify({coordinates:'原點左上，x向右、y向下；390×844，地面y=614',mode:state.mode,assetsReady:ready,round:state.round,lives:state.lives,score:state.score,best:state.best,time:+state.time.toFixed(2),player:{x:+player.x.toFixed(1),y:player.y},enemies:enemies.map(e=>({id:e.id,size:e.size,x:+e.x.toFixed(1),y:+e.y.toFixed(1),hp:e.hp,boss:e.boss})),beams:beams.length,auto:state.auto,freeze:+state.freeze.toFixed(2),cooldown:+state.skill.toFixed(2),popped:state.popped,shots:state.shots,splits:state.splits,viewport});
  window.advanceTime=ms=>{manualUntil=performance.now()+150;for(let i=0;i<Math.ceil(ms/(1000/120));i++)update(1/120);updateHud();render();};
  // 只有測試網址才開放固定情境，正式操作不會啟用。
  if(new URLSearchParams(location.search).get('qa')==='1')window.pangQA={scenario(name){start();state.auto=false;state.invulnerable=0;if(name==='split'){enemies=[enemy(2,195,360,1)];enemies[0].vx=0;enemies[0].vy=0;}if(name==='lose'){state.lives=1;enemies=[enemy(0,195,FLOOR-25,1)];enemies[0].vx=0;}if(name==='boss'){state.round=3;startRound();}if(name==='win'||name==='next'){state.round=name==='win'?3:1;enemies=[enemy(0,195,360,1)];enemies[0].vx=0;enemies[0].vy=0;}if(name==='timeout')state.time=.01;updateHud();render();}};
  let lastRenderedMode;
  function frame(now){const dt=Math.min((now-last)/1000||0,.033);last=now;if(now>manualUntil){let remaining=dt;while(remaining>0){const step=Math.min(remaining,1/120);update(step);remaining-=step;}}if(state.mode==='playing'||lastRenderedMode!==state.mode){updateHud();render();lastRenderedMode=state.mode;}requestAnimationFrame(frame);}
  updateHud();resizeViewport();load();requestAnimationFrame(frame);
})();
