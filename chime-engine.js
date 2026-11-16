/* Original clockwork arena duel. No dependency or commercial game code. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.ChimeEngine=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(seed=111700,mode='stroll',width=390,height=844){
  let z=(seed>>>0)||1;z=Math.imul(z^(z>>>16),0x45d9f3b);z=Math.imul(z^(z>>>16),0x45d9f3b);z^=z>>>16;const variation=(z>>>0)/4294967296;
  return {version:'chime-20261117-1',seed:seed>>>0,rng:z>>>0,mode,width,height,status:'playing',time:0,score:0,combo:0,bestCombo:0,comboLife:0,energy:0,hitstop:0,shake:0,lastProgress:0,maxQuiet:0,quietSeconds:0,events:[],phaseSeen:[1],projectiles:[],effects:[],
   player:{x:width*.44,y:height*.58,hp:mode==='stroll'?12:7,maxHp:mode==='stroll'?12:7,face:1,dx:0,dy:0,inv:1,attack:0,attackCD:0,dodge:0,dodgeCD:0,burstCD:0,pose:0},
   boss:{x:width*.44+55+variation*25,y:Math.max(160,height*.58-70-variation*15),hp:mode==='duel'?192:144,maxHp:mode==='duel'?192:144,phase:1,mode:'stalk',timer:1.6+variation*.4,warning:0,tx:0,ty:0,originX:0,originY:0,face:-1,hit:0,attackNo:0},
   stats:{hits:0,misses:0,dodges:0,evades:0,damage:0,bursts:0,inputs:0,firstHit:null,attacks:0}};
 }
 function event(s,type,data={}){s.maxQuiet=Math.max(s.maxQuiet,s.time-s.lastProgress);s.lastProgress=s.time;s.events.push({t:+s.time.toFixed(3),type,...data});if(s.events.length>240)s.events.shift();}
 function bounds(s,p){p.x=clamp(p.x,30,s.width-30);p.y=clamp(p.y,155,s.height-162);}
 function hurt(s){const p=s.player;if(p.inv>0)return false;p.hp--;p.inv=1.05;s.combo=0;s.comboLife=0;s.shake=7;s.hitstop=.045;s.stats.damage++;event(s,'hurt');return true;}
 function strike(s,amount,kind){const b=s.boss;if(b.hp<=0)return;b.hp=Math.max(0,b.hp-amount);b.hit=.16;s.score+=amount*25+s.combo*7;s.energy=Math.min(8,s.energy+1);s.combo++;s.comboLife=2.7;s.bestCombo=Math.max(s.bestCombo,s.combo);s.stats.hits++;s.hitstop=.035;s.shake=kind==='burst'?8:3;if(s.stats.firstHit===null)s.stats.firstHit=s.time;event(s,'hit',{amount,kind});s.effects.push({x:b.x,y:b.y,life:.24,kind:'hit',angle:Math.atan2(b.y-s.player.y,b.x-s.player.x)});}
 function lineDistance(px,py,ax,ay,bx,by){let dx=bx-ax,dy=by-ay,t=clamp(((px-ax)*dx+(py-ay)*dy)/(dx*dx+dy*dy||1),0,1);return Math.hypot(px-ax-t*dx,py-ay-t*dy);}
 function step(s,input,dt){
  if(s.status!=='playing')return;
  const p=s.player,b=s.boss;
  s.time+=dt;s.shake=Math.max(0,s.shake-dt*35);
  for(const k of ['inv','attack','attackCD','dodge','dodgeCD','burstCD'])p[k]=Math.max(0,p[k]-dt);
  b.hit=Math.max(0,b.hit-dt);s.comboLife=Math.max(0,s.comboLife-dt);if(!s.comboLife)s.combo=0;
  s.effects=s.effects.filter(e=>(e.life-=dt)>0);
  if(s.hitstop>0){s.hitstop-=dt;return;}
  let mx=clamp(input.x||0,-1,1),my=clamp(input.y||0,-1,1),norm=Math.hypot(mx,my);if(norm>1){mx/=norm;my/=norm;}
  if(input.dodge&&p.dodgeCD<=0){let a=Math.atan2(b.y-p.y,b.x-p.x);p.dx=norm>.08?mx:-Math.cos(a);p.dy=norm>.08?my:-Math.sin(a);p.dodge=.22;p.inv=Math.max(p.inv,.52);p.dodgeCD=1.15;s.stats.dodges++;s.stats.inputs++;event(s,'dodge');}
  if(p.dodge>0){p.x+=p.dx*420*dt;p.y+=p.dy*420*dt;}else{p.x+=mx*205*dt;p.y+=my*205*dt;}
  bounds(s,p);p.face=b.x>=p.x?1:-1;p.pose=norm>.1?Math.sin(s.time*14):0;
  if(input.attack&&p.attackCD<=0){p.attack=.19;p.attackCD=.34;s.stats.attacks++;s.stats.inputs++;let d=Math.hypot(b.x-p.x,b.y-p.y);if(d<111){strike(s,s.combo%3===2?8:4,'punch');}else{s.stats.misses++;s.effects.push({x:p.x,y:p.y,life:.16,kind:'swing',angle:Math.atan2(b.y-p.y,b.x-p.x)});}}
  if(input.burst&&s.energy>=8&&p.burstCD<=0){s.energy=0;p.burstCD=1;p.inv=Math.max(p.inv,.7);s.stats.bursts++;s.stats.inputs++;s.projectiles=[];p.hp=Math.min(p.maxHp,p.hp+1);if(Math.hypot(b.x-p.x,b.y-p.y)<310)strike(s,16,'burst');s.effects.push({x:p.x,y:p.y,life:.5,kind:'burst',angle:0});event(s,'burst');}
  const phase=b.hp>b.maxHp*2/3?1:b.hp>b.maxHp/3?2:3;
  if(phase!==b.phase){b.phase=phase;s.phaseSeen.push(phase);event(s,'phase',{phase});b.timer=Math.min(b.timer,.8);}
  b.face=p.x>=b.x?1:-1;
  if(b.mode==='stalk'){
   const a=Math.atan2(p.y-b.y,p.x-b.x),dist=Math.hypot(p.x-b.x,p.y-b.y);
   // Footwork matters: guard circles and retreats; holding punch in place cannot clear the duel.
   const spacing=145+b.phase*10,side=((s.seed+b.attackNo)%2?1:-1),retreat=dist<spacing?-1:dist>spacing+24?1:0;
   b.x+=(Math.cos(a)*retreat*(80+b.phase*12)-Math.sin(a)*side*60)*dt;
   b.y+=(Math.sin(a)*retreat*(80+b.phase*12)+Math.cos(a)*side*60)*dt;bounds(s,b);
   b.timer-=dt;if(b.timer<=0){b.mode='windup';b.warning=b.phase===1?1.0:b.phase===2?.88:.78;b.timer=b.warning;b.tx=p.x;b.ty=p.y;b.originX=b.x;b.originY=b.y;b.attackNo++;event(s,'telegraph',{phase:b.phase});}
  }else if(b.mode==='windup'){
   b.timer-=dt;
   if(b.timer<=0){
    b.mode='recover';b.timer=b.phase===1?.85:.65;
    if(b.phase>=2){const dx=b.tx-b.x,dy=b.ty-b.y,d=Math.hypot(dx,dy)||1,reach=Math.min(d+40,215),nx=b.x+dx/d*reach,ny=b.y+dy/d*reach;if(lineDistance(p.x,p.y,b.x,b.y,nx,ny)<42){if(!hurt(s))s.stats.evades++;}b.x=nx;b.y=ny;bounds(s,b);}
    else if(Math.hypot(p.x-b.x,p.y-b.y)<185&&Math.hypot(p.x-b.tx,p.y-b.ty)<78){if(!hurt(s))s.stats.evades++;}
    if(b.phase===3){const a=Math.atan2(p.y-b.y,p.x-b.x);for(let i=-1;i<=1;i++)s.projectiles.push({x:b.x,y:b.y,vx:Math.cos(a+i*.42)*155,vy:Math.sin(a+i*.42)*155,life:2.2,angle:a+i*.42});}
    s.effects.push({x:b.x,y:b.y,life:.32,kind:'slam',angle:0});event(s,'boss-attack');
   }
  }else{b.timer-=dt;if(b.timer<=0){b.mode='stalk';b.timer=b.phase===1?1.05:.65;}}
  for(const q of s.projectiles){q.x+=q.vx*dt;q.y+=q.vy*dt;q.life-=dt;if(Math.hypot(q.x-p.x,q.y-p.y)<25){if(!hurt(s))s.stats.evades++;q.life=0;}}
  s.projectiles=s.projectiles.filter(q=>q.life>0&&q.x>-30&&q.x<s.width+30&&q.y>60&&q.y<s.height-95);
  const quiet=s.time-s.lastProgress;s.maxQuiet=Math.max(s.maxQuiet,quiet);if(quiet>5)s.quietSeconds+=dt;
  if(b.hp<=0){s.status='won';s.score+=Math.max(0,Math.round((100-s.time)*12))+p.hp*100;event(s,'won');}
  else if(p.hp<=0||s.time>=100){s.status='lost';event(s,'lost',{reason:p.hp<=0?'damage':'timeout'});}
 }
 return {create,step,lineDistance};
});
