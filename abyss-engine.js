/* Original 120 Hz action simulation. Browser and AGEFO replay share these rules. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.Abyss=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
 const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
 function create({width=600,height=960,seed=1115,difficulty='cruise'}={}){
  const s={version:1,width,height,seed:seed>>>0,difficulty,status:'playing',time:0,spawn:0,next:0,uid:1,score:0,combo:0,comboTime:0,maxCombo:0,charge:100,dashCD:0,pulseFX:0,shake:0,hitstop:0,shots:[],bullets:[],enemies:[],particles:[],trails:[],boss:null,phaseSeen:[],notice:'01 / 沉船航道・拖曳潛航，衝刺切彈',noticeUntil:5,events:[],lastEvent:0,deadAir:0,autoFire:true,stats:{shots:0,hits:0,kills:0,dashes:0,parries:0,pulses:0,hurt:0,damage:0},player:{x:width*.5,y:height*.77,vx:0,vy:0,hp:difficulty==='deep'?6:10,maxHP:difficulty==='deep'?6:10,inv:1,dash:0,dx:0,dy:-1,angle:-Math.PI/2,cooldown:0},fireWas:false,dashWas:false,pulseWas:false};
  s.random=()=>{s.seed=(1664525*s.seed+1013904223)>>>0;return s.seed/4294967296;};return s;
 }
 function event(s,type,data={}){s.lastEvent=s.time;s.events.push({t:+s.time.toFixed(3),type,...data});if(s.events.length>300)s.events.shift();}
 function burst(s,x,y,color,n=12){for(let i=0;i<n;i++){const a=s.random()*Math.PI*2,v=35+s.random()*200;s.particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:.3+s.random()*.5,max:.8,color});}}
 function spawnEnemy(s){const kind=s.spawn%4===3?'rammer':s.spawn%3===1?'fan':'gunner';const x=60+s.random()*(s.width-120);s.enemies.push({id:s.uid++,kind,x,y:-55,baseX:x,age:0,hp:kind==='rammer'?24:19,shoot:1.1+s.random()*.65,angle:Math.PI/2,r:23,slash:-1});s.spawn++;event(s,'spawn',{kind});}
 function enemyBullet(s,x,y,a,speed=200){const slow=s.difficulty==='deep'?1.2:.85;s.bullets.push({x,y,vx:Math.cos(a)*speed*slow,vy:Math.sin(a)*speed*slow,r:5,life:8});event(s,'enemy-shot');}
 function kill(s,e){if(e.hp>0||e.dead)return;e.dead=true;s.stats.kills++;s.combo++;s.comboTime=3;s.maxCombo=Math.max(s.maxCombo,s.combo);s.score+=100*Math.min(8,1+Math.floor(s.combo/4));s.charge=clamp(s.charge+8,0,100);if(s.stats.kills%7===0){s.player.hp=Math.min(s.player.maxHP,s.player.hp+1);event(s,'repair');}burst(s,e.x,e.y,'#c98050',19);s.shake=.15;s.hitstop=.035;event(s,'kill',{id:e.id});}
 function hurtEnemy(s,e,damage){if(e.dead)return;e.hp-=damage;s.stats.hits++;s.stats.damage+=damage;s.charge=clamp(s.charge+.8,0,100);burst(s,e.x,e.y,'#eee4c8',3);if(e===s.boss){s.hitstop=Math.max(s.hitstop,.012);if(e.hp<=0){e.dead=true;s.score+=3000;s.status='won';burst(s,e.x,e.y,'#c98050',80);event(s,'won');}}else kill(s,e);}
 function damagePlayer(s){const p=s.player;if(p.inv>0||s.status!=='playing')return;p.hp--;p.inv=1.2;s.combo=0;s.shake=.35;s.hitstop=.08;s.stats.hurt++;burst(s,p.x,p.y,'#eee4c8',15);event(s,'hurt',{hp:p.hp});if(p.hp<=0){s.status='lost';event(s,'lost');}}
 function step(s,input={},dt=1/120){
  if(s.status!=='playing')return;s.time+=dt;const p=s.player;
  for(const k of ['dashCD','pulseFX','shake','hitstop'])s[k]=Math.max(0,s[k]-dt);
  p.inv=Math.max(0,p.inv-dt);p.dash=Math.max(0,p.dash-dt);p.cooldown-=dt;s.charge=Math.min(100,s.charge+dt*2.6);
  s.comboTime-=dt;if(s.comboTime<=0)s.combo=0;
  let ix=clamp(input.x||0,-1,1),iy=clamp(input.y||0,-1,1);let m=Math.hypot(ix,iy);if(m>1){ix/=m;iy/=m;}
  if(m>.08){p.dx=ix/(m>1?1:m);p.dy=iy/(m>1?1:m);}
  if(input.dash&&!s.dashWas&&s.dashCD<=0){p.dash=.23;p.inv=Math.max(p.inv,.33);s.dashCD=1.35;s.stats.dashes++;event(s,'dash');burst(s,p.x,p.y,'#eee4c8',8);}
  if(input.pulse&&!s.pulseWas&&s.charge>=99.9){s.charge=0;s.pulseFX=.65;s.shake=.24;s.stats.pulses++;s.stats.parries+=s.bullets.length;s.bullets=[];for(const e of s.enemies)hurtEnemy(s,e,130);if(s.boss)hurtEnemy(s,s.boss,145);p.inv=Math.max(p.inv,.65);event(s,'pulse');}
  s.dashWas=!!input.dash;s.pulseWas=!!input.pulse;
  const speed=340;
  if(p.dash>0){p.vx=p.dx*1050;p.vy=p.dy*1050;s.trails.push({x:p.x,y:p.y,angle:p.angle,life:.23});}else{const blend=1-Math.exp(-dt*16);p.vx+=(ix*speed-p.vx)*blend;p.vy+=(iy*speed-p.vy)*blend;}
  const motion=s.hitstop>0?.3:1;p.x=clamp(p.x+p.vx*dt*motion,28,s.width-28);p.y=clamp(p.y+p.vy*dt*motion,65,s.height-36);
  const targets=s.enemies.filter(e=>!e.dead&&e.y>0);if(s.boss&&!s.boss.dead)targets.push(s.boss);let target=targets.sort((a,b)=>distance(a,p)-distance(b,p))[0];
  if(Number.isFinite(input.aimX)&&Number.isFinite(input.aimY))target={x:input.aimX,y:input.aimY};
  p.angle=target?Math.atan2(target.y-p.y,target.x-p.x):-Math.PI/2;
  if((input.fire??s.autoFire)&&p.cooldown<=0){p.cooldown=.16;s.stats.shots++;const a=p.angle;s.shots.push({x:p.x+Math.cos(a)*32,y:p.y+Math.sin(a)*32,vx:Math.cos(a)*890+p.vx*.18,vy:Math.sin(a)*890+p.vy*.18,life:2.3,r:5});event(s,'shot');}
  // Three distinct approach waves, followed by a persistent, damage-driven three-phase boss.
  if(s.time<30){s.next-=dt;if(s.next<=0){spawnEnemy(s);s.next=s.time<10?1.2:s.time<20?.95:.75;}}
  if(s.time>=10&&s.time<10+dt){s.notice='02 / 水壓斷層・扇形彈幕';s.noticeUntil=s.time+3;}
  if(s.time>=20&&s.time<20+dt){s.notice='03 / 機械墓園・衝撞警戒';s.noticeUntil=s.time+3;}
  if(s.time>=30&&!s.boss){s.boss={id:s.uid++,x:s.width*.5,y:-130,hp:1200,maxHP:1200,r:83,age:0,phase:0,shoot:1.7,beamTimer:5,beam:null,slash:-1};s.notice='斷層守衛甦醒・三態裝甲';s.noticeUntil=s.time+4;event(s,'boss-spawn');}
  for(const e of s.enemies){e.age+=dt;if(e.dead)continue;
   if(e.kind==='rammer'){const a=Math.atan2(p.y-e.y,p.x-e.x);e.angle=a;e.x+=Math.cos(a)*100*dt;e.y+=Math.sin(a)*100*dt;}else{e.y+=dt*(e.age<1.8?108:47);e.x=clamp(e.baseX+Math.sin(e.age*1.5+e.id)*58,25,s.width-25);e.angle=Math.atan2(p.y-e.y,p.x-e.x);}
   e.shoot-=dt;if(e.shoot<0&&e.y>30){e.shoot=e.kind==='fan'?1.9:1.6;const a=Math.atan2(p.y-e.y,p.x-e.x);for(let i=-(e.kind==='fan'?1:0);i<=(e.kind==='fan'?1:0);i++)enemyBullet(s,e.x,e.y,a+i*.28,178);}
   if(distance(e,p)<(p.dash>0?78:34)){if(p.dash>0){if(e.slash!==s.stats.dashes){e.slash=s.stats.dashes;hurtEnemy(s,e,35);}}else damagePlayer(s);}
  }
  s.enemies=s.enemies.filter(e=>!e.dead&&e.y<s.height+90&&e.age<19);
  const b=s.boss;
  if(b&&!b.dead){b.age+=dt;b.y+=((150+Math.sin(b.age*.8)*32)-b.y)*dt*1.6;b.x=s.width*.5+Math.sin(b.age*.65)*Math.min(160,s.width*.24);
   const phase=b.hp>800?1:b.hp>400?2:3;
   if(phase!==b.phase){b.phase=phase;s.phaseSeen.push(phase);s.notice=['','守衛 I・追蹤魚雷','守衛 II・旋流散射','守衛 III・高壓切割'][phase];s.noticeUntil=s.time+2.5;event(s,'boss-phase',{phase});}
   b.shoot-=dt;if(b.shoot<=0){b.shoot=[0,.85,.7,.58][phase];const aim=Math.atan2(p.y-b.y,p.x-b.x);if(phase===1){for(let i=-1;i<=1;i++)enemyBullet(s,b.x,b.y+35,aim+i*.18,215);}else{const n=phase===2?9:13;for(let i=0;i<n;i++)enemyBullet(s,b.x,b.y,Math.PI*2*i/n+b.age*.45,phase===3?235:205);}}
   if(phase>=2){b.beamTimer-=dt;if(b.beamTimer<=0&&!b.beam){b.beam={angle:Math.atan2(p.y-b.y,p.x-b.x),age:0};b.beamTimer=phase===3?3.2:4.4;event(s,'beam-warning');}}
   if(b.beam){b.beam.age+=dt;if(b.beam.age>1.05&&b.beam.age<1.4){const a=b.beam.angle,dx=p.x-b.x,dy=p.y-b.y;const along=dx*Math.cos(a)+dy*Math.sin(a),across=Math.abs(-dx*Math.sin(a)+dy*Math.cos(a));if(along>0&&across<25)damagePlayer(s);}if(b.beam.age>=1.5)b.beam=null;}
   if(distance(p,b)<(p.dash>0?155:105)){if(p.dash>0){if(b.slash!==s.stats.dashes){b.slash=s.stats.dashes;hurtEnemy(s,b,42);}}else damagePlayer(s);}
  }
  for(const q of s.shots){q.x+=q.vx*dt*motion;q.y+=q.vy*dt*motion;q.life-=dt;for(const e of [...s.enemies,...(b&&!b.dead?[b]:[])])if(!e.dead&&distance(q,e)<e.r+q.r){q.life=-1;hurtEnemy(s,e,7);break;}}
  for(const q of s.bullets){q.x+=q.vx*dt*motion;q.y+=q.vy*dt*motion;q.life-=dt;const d=distance(q,p);if(p.dash>0&&d<73){q.life=-1;s.stats.parries++;s.charge=Math.min(100,s.charge+1.8);burst(s,q.x,q.y,'#c98050',3);event(s,'parry');}else if(d<17){q.life=-1;damagePlayer(s);}}
  const visible=q=>q.life>0&&q.x>-100&&q.x<s.width+100&&q.y>-100&&q.y<s.height+100;
  s.shots=s.shots.filter(visible);s.bullets=s.bullets.filter(visible);
  for(const q of s.particles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;}s.particles=s.particles.filter(q=>q.life>0).slice(-500);
  for(const q of s.trails)q.life-=dt;s.trails=s.trails.filter(q=>q.life>0).slice(-40);
  if(s.time-s.lastEvent>5)s.deadAir+=dt;
 }
 function view(s){return{status:s.status,time:+s.time.toFixed(3),width:s.width,height:s.height,player:{...s.player},score:s.score,combo:s.combo,maxCombo:s.maxCombo,charge:s.charge,dashCD:s.dashCD,autoFire:s.autoFire,enemies:s.enemies.map(({id,x,y,hp,kind})=>({id,x,y,hp,kind})),bullets:s.bullets.map(({x,y,vx,vy})=>({x,y,vx,vy})),boss:s.boss?{x:s.boss.x,y:s.boss.y,hp:s.boss.hp,phase:s.boss.phase,beam:s.boss.beam}:null,phaseSeen:[...s.phaseSeen],stats:{...s.stats},deadAir:s.deadAir,lastEvent:s.lastEvent};}
 return{create,step,view};
});
