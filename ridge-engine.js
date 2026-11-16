/* Original Snowline race engine. No external code or assets. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory();else root.Ridge=factory();})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
 function create(seed=1116,mode='tour'){
  return {seed:seed>>>0,mode,status:'playing',time:0,distance:0,x:0,velocity:0,speed:100,hp:mode==='expert'?5:9,score:0,combo:0,comboTime:0,inv:1.2,dash:0,dashCD:0,jump:0,jumpCD:0,freeze:0,shake:0,spawn:.8,objects:[],nextId:1,boss:null,phaseSeen:[],events:[],lastProgress:0,maxQuiet:0,stats:{dashes:0,jumps:0,ram:0,overtakes:0,near:0,hits:0,bossHits:0},previous:{dash:false,jump:false}};
 }
 function rand(s){s.seed=(Math.imul(s.seed,1664525)+1013904223)>>>0;return s.seed/4294967296;}
 function event(s,type){s.events.push({time:+s.time.toFixed(3),type});if(s.events.length>300)s.events.shift();s.maxQuiet=Math.max(s.maxQuiet,s.time-s.lastProgress);s.lastProgress=s.time;}
 function score(s,n,type){s.combo++;s.comboTime=4;s.score+=n*Math.min(5,1+Math.floor(s.combo/4));event(s,type);}
 function harm(s){if(s.inv>0||s.dash>0)return; s.hp--;s.inv=1.5;s.speed*=.65;s.combo=0;s.freeze=.065;s.shake=.3;s.stats.hits++;event(s,'collision');if(s.hp<=0){s.status='lost';event(s,'lost');}}
 function step(s,input,dt){
  if(s.status!=='playing'||!Number.isFinite(dt)||dt<=0)return;
  dt=Math.min(dt,1/60);s.time+=dt;
  for(const k of ['inv','dash','dashCD','jumpCD','comboTime','shake'])s[k]=Math.max(0,s[k]-dt);
  if(s.jump>0)s.jump=Math.max(0,s.jump-dt);
  if(s.comboTime<=0)s.combo=0;
  const pressDash=!!input.dash&&!s.previous.dash,pressJump=!!input.jump&&!s.previous.jump;
  s.previous={dash:!!input.dash,jump:!!input.jump};
  if(pressDash&&s.dashCD<=0){s.dash=.7;s.inv=Math.max(s.inv,.75);s.dashCD=1.9;s.stats.dashes++;event(s,'boost');}
  if(pressJump&&s.jumpCD<=0&&s.jump<=0){s.jump=.85;s.jumpCD=1.25;s.stats.jumps++;event(s,'jump');}
  if(s.freeze>0){s.freeze=Math.max(0,s.freeze-dt);return;}
  const steer=clamp(Number(input.steer)||0,-1,1),curve=Math.sin(s.distance/620)*.42+Math.sin(s.distance/270)*.12;
  s.velocity+=(steer*2.6-s.velocity)*Math.min(1,dt*12);
  s.x=clamp(s.x+(s.velocity-curve*.24)*dt,-1.08,1.08);
  const target=s.dash>0?245:input.brake?72:Math.abs(s.x)>1?82:145;
  s.speed+=(target-s.speed)*Math.min(1,dt*4);s.distance+=s.speed*dt;
  s.spawn-=dt;
  if(s.spawn<=0){
   s.spawn=s.boss?.85:1.15+rand(s)*.6;const r=rand(s),kind=r<.42?'bike':r<.78?'barrier':'ramp';
   s.objects.push({id:s.nextId++,kind,x:(rand(s)*1.6-.8),base:0,z:360,speed:kind==='bike'?48+rand(s)*20:0,age:0,passed:false});event(s,'traffic');
  }
  if(!s.boss&&s.distance>1500){s.boss={hp:9,maxHP:9,phase:1,x:0,gap:150,age:0,attack:2.5,warning:0,lane:0,recover:0};s.phaseSeen.push(1);event(s,'boss-arrival');}
  const b=s.boss;
  if(b&&b.hp>0){
   b.age+=dt;b.recover=Math.max(0,b.recover-dt);
   const phase=b.hp>6?1:b.hp>3?2:3;if(phase!==b.phase){b.phase=phase;s.phaseSeen.push(phase);event(s,'boss-phase');}
   b.x=Math.sin(b.age*(.55+b.phase*.16))*(.43+b.phase*.045);
   b.gap=clamp(b.gap+(118+b.phase*3-s.speed)*dt,18,300);
   b.attack-=dt;
   if(b.attack<=0){b.attack=3.3-b.phase*.35;b.warning=1.1;b.lane=s.x;event(s,'boss-warning');}
   if(b.warning>0){b.warning-=dt;if(b.warning<=0){s.objects.push({id:s.nextId++,kind:'ice',x:clamp(b.lane,-.9,.9),z:195,speed:0,age:0,passed:false});if(b.phase===3)s.objects.push({id:s.nextId++,kind:'barrier',x:-clamp(b.lane,-.75,.75),z:270,speed:0,age:0,passed:false});event(s,'boss-attack');}}
   if(b.gap<72&&Math.abs(s.x-b.x)<.27&&s.dash>0&&b.recover<=0){
    b.hp--;b.gap=155;b.recover=1.5;s.freeze=.075;s.shake=.25;s.stats.bossHits++;score(s,300,'boss-ram');
    if(b.hp<=0){s.status='won';s.score+=Math.round(s.hp*250+Math.max(0,100-s.time)*20);event(s,'won');}
   }else if(b.gap<26&&Math.abs(s.x-b.x)<.29&&s.dash<=0&&b.recover<=0){harm(s);b.gap=110;b.recover=1;}
  }
  for(const o of s.objects){
   o.age+=dt;o.z-=(s.speed-o.speed)*dt;if(o.kind==='bike')o.x=clamp(o.x+Math.sin(o.age*2+o.id)*dt*.12,-.85,.85);
   if(!o.passed&&o.z<=18){
    o.passed=true;const dx=Math.abs(o.x-s.x),width=o.kind==='bike'?.23:o.kind==='ramp'?.28:.26;
    if(dx<width){
     if(o.kind==='ramp'){s.jump=.85;s.stats.jumps++;score(s,120,'ramp');}
     else if(s.dash>0){s.stats.ram++;s.freeze=.035;s.shake=.12;score(s,160,'ram');}
     else if(s.jump>0&&o.kind!=='bike'){score(s,130,'cleared');}
     else harm(s);
    }else if(dx<width+.2){s.stats.near++;score(s,150,'near-miss');}else{s.stats.overtakes++;score(s,70,'overtake');}
   }
  }
  s.objects=s.objects.filter(o=>o.z>-60);
  if(s.time>125&&s.status==='playing'){s.status='lost';event(s,'timeout');}
 }
 function view(s){return JSON.parse(JSON.stringify(s));}
 return {create,step,view};
});
