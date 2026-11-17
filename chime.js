(()=>{'use strict';
 const $=id=>document.getElementById(id),canvas=$('arena'),ctx=canvas.getContext('2d',{alpha:false}),E=ChimeEngine,seed=Number(new URLSearchParams(location.search).get('seed'))||111700;
 let w=innerWidth,h=innerHeight,dpr=1,state=null,previous=0,acc=0,audio=false,ac=null,best=0,ended=false,stickId=null,stickOrigin=null,ready=false;
 const input={x:0,y:0,attack:false,dodge:false,burst:false},keys=new Set(),held=new Map(),frames=[],latencies=[],assets={},loading=[];
 const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
 const embedded=new URLSearchParams(location.search).get('embed')==='1';if(embedded)document.body.classList.add('embed');
 try{best=Number(localStorage.getItem('rea-chime-best-v1'))||0;}catch{}
 $('best').textContent='最高分'+String(best).padStart(6,'0');
 for(const role of ['player','guard'])for(const pose of ['idle','punch','step','hurt']){let img=new Image();img.src=`assets/chime-${role}-${pose}.webp`;assets[role+'-'+pose]=img;loading.push(img.decode());}
 const bg=new Image();bg.src='assets/chime-arena.webp';loading.push(bg.decode());
 let cached=document.createElement('canvas');
 function resize(){const ow=w,oh=h;w=innerWidth;h=innerHeight;dpr=Math.min(devicePixelRatio||1,2);canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr);canvas.style.width=w+'px';canvas.style.height=h+'px';cached.width=canvas.width;cached.height=canvas.height;
  if(ready){const c=cached.getContext('2d'),s=Math.max(cached.width/bg.width,cached.height/bg.height);c.drawImage(bg,(cached.width-bg.width*s)/2,(cached.height-bg.height*s)/2,bg.width*s,bg.height*s);c.fillStyle='#d8cde21c';c.fillRect(0,0,cached.width,cached.height);}
  if(state){state.player.x*=w/ow;state.player.y*=h/oh;state.boss.x*=w/ow;state.boss.y*=h/oh;state.width=w;state.height=h;if(state.status==='playing')pause();}
 }
 window.addEventListener('resize',resize);resize();
 function clearInputs(){keys.clear();held.clear();Object.assign(input,{x:0,y:0,attack:false,dodge:false,burst:false});stickId=null;stickOrigin=null;$('knob').style.transform='';document.querySelectorAll('.held').forEach(b=>b.classList.remove('held'));}
 function show(which){$('screen').hidden=false;for(const id of ['intro','paused','ending'])$(id).hidden=id!==which;document.body.classList.remove('playing');}
 function start(){clearInputs();state=E.create(seed,$('difficulty').value,w,h);ended=false;oldHits=0;oldPhase=1;frames.length=0;latencies.length=0;acc=0;$('screen').hidden=true;$('hud').hidden=false;$('touch').hidden=false;$('pause').hidden=false;document.body.classList.add('playing');$('callout').textContent='靠近守衛，按住出拳';setTimeout(()=>{if(state?.status==='playing')$('callout').textContent='';},2100);if(audio)tone(440,.12);}
 function pause(){if(state?.status!=='playing')return;state.status='paused';clearInputs();show('paused');$('touch').hidden=true;$('resume').focus();}
 function resume(){if(state?.status!=='paused')return;state.status='playing';clearInputs();$('screen').hidden=true;$('touch').hidden=false;document.body.classList.add('playing');acc=0;}
 function home(){clearInputs();state=null;$('hud').hidden=true;$('touch').hidden=true;$('pause').hidden=true;$('callout').textContent='';show('intro');$('start').focus();}
 function tone(freq,duration=.06){if(!audio)return;try{ac??=new (window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();const o=ac.createOscillator(),g=ac.createGain();o.type='triangle';o.frequency.setValueAtTime(freq,ac.currentTime);o.frequency.exponentialRampToValueAtTime(freq*.55,ac.currentTime+duration);g.gain.setValueAtTime(.065,ac.currentTime);g.gain.exponentialRampToValueAtTime(.001,ac.currentTime+duration);o.connect(g);g.connect(ac.destination);o.start();o.stop(ac.currentTime+duration);}catch{}}
 $('start').onclick=start;$('pause').onclick=pause;$('resume').onclick=resume;$('restart').onclick=start;$('again').onclick=start;$('home').onclick=home;$('end-home').onclick=home;
 $('sound').onclick=()=>{audio=!audio;$('sound').textContent='音效：'+(audio?'開':'關');if(audio)tone(660,.1);};
 $('fullscreen').onclick=async()=>{try{if(!document.fullscreenElement)await document.documentElement.requestFullscreen();else await document.exitFullscreen();}catch{}};
 document.addEventListener('visibilitychange',()=>{if(document.hidden)pause();});window.addEventListener('blur',()=>{if(!document.fullscreenElement)pause();});
 function markInput(){latencies.push({t:performance.now(),delay:null});if(latencies.length>200)latencies.shift();}
 window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' ','j','k','l','w','a','s','d','p','escape'].includes(k)){e.preventDefault();if((k==='p'||k==='escape')&&!e.repeat){state?.status==='paused'?resume():pause();return;}keys.add(k);if(!e.repeat)markInput();}});
 window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
 for(const id of ['attack','dodge','burst']){const b=$(id);b.addEventListener('pointerdown',e=>{if(state?.status!=='playing')return;e.preventDefault();b.setPointerCapture(e.pointerId);held.set(e.pointerId,id);b.classList.add('held');markInput();});const release=e=>{held.delete(e.pointerId);b.classList.remove('held');};b.addEventListener('pointerup',release);b.addEventListener('pointercancel',release);b.addEventListener('lostpointercapture',release);}
 $('stick').addEventListener('pointerdown',e=>{if(stickId!==null||state?.status!=='playing')return;e.preventDefault();$('stick').setPointerCapture(e.pointerId);stickId=e.pointerId;const r=$('stick').getBoundingClientRect();stickOrigin={x:r.x+r.width/2,y:r.y+r.height/2};moveStick(e);markInput();});
 function moveStick(e){if(e.pointerId!==stickId||!stickOrigin)return;let dx=e.clientX-stickOrigin.x,dy=e.clientY-stickOrigin.y,n=Math.hypot(dx,dy);if(n>35){dx*=35/n;dy*=35/n;}input.x=dx/35;input.y=dy/35;$('knob').style.transform=`translate(${dx}px,${dy}px)`;}
 $('stick').addEventListener('pointermove',moveStick);for(const type of ['pointerup','pointercancel','lostpointercapture'])$('stick').addEventListener(type,e=>{if(e.pointerId===stickId){stickId=null;stickOrigin=null;input.x=0;input.y=0;$('knob').style.transform='';}});
 function command(){return{x:stickId!==null?input.x:(keys.has('arrowright')||keys.has('d')?1:0)-(keys.has('arrowleft')||keys.has('a')?1:0),y:stickId!==null?input.y:(keys.has('arrowdown')||keys.has('s')?1:0)-(keys.has('arrowup')||keys.has('w')?1:0),attack:keys.has('j')||[...held.values()].includes('attack'),dodge:keys.has('k')||keys.has(' ')||[...held.values()].includes('dodge'),burst:keys.has('l')||[...held.values()].includes('burst')};}
 function figure(role,p,large=false){const s=Math.min(w,h)<500?1:1.18,sz=(large?159:134)*s,pose=p.hit>0||p.inv>.85&&p.hp<p.maxHp?'hurt':p.attack>0||role==='guard'&&p.mode==='recover'?'punch':(role==='player'?Math.abs(p.pose):p.mode==='stalk'?Math.abs(Math.sin(state.time*6)):0)>.55?'step':'idle',img=assets[role+'-'+pose];ctx.save();ctx.translate(p.x,p.y);ctx.scale(p.face,1);if(role==='player'&&p.inv>0&&Math.floor(state.time*20)%2===0)ctx.globalAlpha=.55;ctx.drawImage(img,-sz/2,-sz*.75,sz,sz*360/420);ctx.restore();}
 function polygon(x,y,r,n,angle=0){ctx.beginPath();for(let i=0;i<n;i++){const a=angle+i*Math.PI*2/n;ctx.lineTo(x+Math.cos(a)*r,y+Math.sin(a)*r);}ctx.closePath();}
 function draw(){ctx.setTransform(1,0,0,1,0,0);if(ready)ctx.drawImage(cached,0,0);else{ctx.fillStyle='#c9bdcf';ctx.fillRect(0,0,canvas.width,canvas.height);}ctx.setTransform(dpr,0,0,dpr,0,0);if(!state)return;
  const s=state,p=s.player,b=s.boss;ctx.save();if(s.shake>0&&!reduced)ctx.translate(Math.sin(s.time*111)*s.shake*.35,Math.cos(s.time*97)*s.shake*.35);
  if(b.mode==='windup'){
   const progress=1-b.timer/b.warning;ctx.fillStyle='#6c3b8035';ctx.strokeStyle='#6c3b80';ctx.lineWidth=2;ctx.setLineDash([8,5]);
   if(b.phase===1){polygon(b.tx,b.ty,77,8,Math.PI/8);ctx.fill();ctx.stroke();}else{const a=Math.atan2(b.ty-b.y,b.tx-b.x),reach=Math.min(Math.hypot(b.tx-b.x,b.ty-b.y)+40,215);ctx.save();ctx.translate(b.x,b.y);ctx.rotate(a);ctx.fillRect(0,-35,reach,70);ctx.strokeRect(0,-35,reach,70);ctx.restore();}
   ctx.setLineDash([]);ctx.fillStyle='#52325f';ctx.font='bold 11px sans-serif';ctx.textAlign='center';ctx.fillText(b.phase===1?'重拳預警':'衝拳預警',b.x,b.y-100);ctx.fillRect(b.x-28,b.y-92,56*progress,3);
  }
  // Theatre floor markers are directional flourishes, never character substitutes.
  ctx.strokeStyle='#69547160';ctx.lineWidth=1;for(const f of [p,b]){ctx.beginPath();ctx.moveTo(f.x-22,f.y+23);ctx.lineTo(f.x,f.y+28);ctx.lineTo(f.x+22,f.y+23);ctx.stroke();}
  const list=[['player',p,false],['guard',b,true]].sort((a,c)=>a[1].y-c[1].y);for(const item of list)figure(...item);
  if(p.attack>0){const a=Math.atan2(b.y-p.y,b.x-p.x);ctx.strokeStyle='#f8f4ff';ctx.lineWidth=4;ctx.beginPath();ctx.arc(p.x,p.y-15,58,a-.75,a+.55);ctx.stroke();}
  if(p.dodge>0){ctx.strokeStyle='#eeebf5b0';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(p.x-p.dx*65,p.y-p.dy*65);ctx.lineTo(p.x-p.dx*24,p.y-p.dy*24);ctx.stroke();}
  for(const q of s.projectiles){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.angle);ctx.fillStyle='#57335f';ctx.strokeStyle='#eee5f8';ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(14,0);ctx.lineTo(-9,-5);ctx.lineTo(-4,0);ctx.lineTo(-9,5);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore();}
  for(const e of s.effects){ctx.save();ctx.globalAlpha=Math.min(1,e.life*5);ctx.translate(e.x,e.y);ctx.rotate(e.angle);ctx.strokeStyle=e.kind==='burst'?'#f5ecff':'#f9f4ff';ctx.lineWidth=e.kind==='burst'?5:3;let r=e.kind==='burst'?(1-e.life/.5)*260:e.kind==='slam'?75:30;for(let i=0;i<8;i++){let a=i*Math.PI/4;ctx.beginPath();ctx.moveTo(Math.cos(a)*r*.4,Math.sin(a)*r*.4);ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r);ctx.stroke();}if(e.kind==='burst'){polygon(0,0,r,12,s.time);ctx.stroke();}ctx.restore();}
  ctx.restore();
 }
 let oldHits=0,oldPhase=1;
 function updateHUD(){const s=state,p=s.player,b=s.boss;$('hp').textContent=p.hp;$('healthbar').style.width=p.hp/p.maxHp*100+'%';$('bossbar').style.width=b.hp/b.maxHp*100+'%';$('score').textContent=String(s.score).padStart(6,'0');$('phase').textContent=['','守衛Ⅰ・重拳','守衛Ⅱ・衝拳','守衛Ⅲ・飛針'][b.phase];$('combo').textContent=s.combo>1?s.combo+'連擊':'保持步伐';$('charge').textContent=s.energy+'／8';$('burst').disabled=s.energy<8;$('dodge').classList.toggle('cooldown',p.dodgeCD>0);
  if(s.stats.hits!==oldHits){tone(s.combo%3===0?135:240);oldHits=s.stats.hits;}if(b.phase!==oldPhase){$('callout').textContent=['','','第二幕・留意衝拳','終幕・閃避飛針'][b.phase];const thisState=s;setTimeout(()=>{if(state===thisState)$('callout').textContent='';},1500);tone(330,.18);oldPhase=b.phase;}
  if(s.status==='won'||s.status==='lost'){if(ended)return;ended=true;clearInputs();$('callout').textContent='';$('touch').hidden=true;best=Math.max(best,s.score);try{localStorage.setItem('rea-chime-best-v1',String(best));}catch{}$('best').textContent='最高分'+String(best).padStart(6,'0');$('result-label').textContent=s.status==='won'?'終幕・三態突破':'幕落・再接再厲';$('result-title').textContent=s.status==='won'?'鐘樓為你喝采':'調整步伐，再上場';$('result-detail').textContent=s.status==='won'?'你拆解了重拳、衝拳與飛針。':s.player.hp<=0?'先離開預警區，再回身連擊。':'鐘聲已響滿一百秒。試著靠近連擊，集氣破鐘。';$('result-score').textContent=String(s.score).padStart(6,'0');$('result-combo').textContent=`最高${s.bestCombo}連擊・${s.time.toFixed(1)}秒・命中${s.stats.hits}次`;show('ending');$('again').focus();}
 }
 function frame(now){const delta=previous?now-previous:16.67;previous=now;if(state?.status==='playing'){
   if(delta<200){frames.push(delta);if(frames.length>3600)frames.shift();}acc+=Math.min(delta/1000,.05);let cmd=command();while(acc>=1/120){E.step(state,cmd,1/120);acc-=1/120;}for(const l of latencies)if(l.delay===null)l.delay=now-l.t;updateHUD();
  }else acc=0;draw();requestAnimationFrame(frame);
 }
 window.render_game_to_text=()=>JSON.stringify(state?{...state,events:state.events.slice(-20),frameStats:stats(frames),inputLatency:stats(latencies.map(x=>x.delay).filter(x=>x!==null)),best}: {status:'cover',ready,best,version:'chime-20261117-1'});
 function stats(a){if(!a.length)return{n:0};let b=[...a].sort((x,y)=>x-y);return{n:b.length,mean:+(b.reduce((x,y)=>x+y,0)/b.length).toFixed(3),p95:+b[Math.floor((b.length-1)*.95)].toFixed(3),max:+b.at(-1).toFixed(3),over33:b.filter(x=>x>33.4).length};}
 Promise.all(loading).then(()=>{ready=true;resize();$('start').disabled=false;requestAnimationFrame(frame);}).catch(()=>{$('start').disabled=true;$('start').textContent='素材載入失敗，請重新整理';});$('start').disabled=true;
})();
