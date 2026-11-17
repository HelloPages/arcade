/* Original Mothwood Cadence simulation. Fixed 120Hz; no DOM, assets or borrowed game code. */
(function(root){'use strict';
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function create(seed=111800,mode='stroll',w=390,h=844){return{seed:seed>>>0,mode,w,h,status:'playing',time:0,beat:0,lastBeat:-1,score:0,combo:0,maxCombo:0,energy:0,quiet:0,maxQuiet:0,quietSeconds:0,lastEvent:0,freeze:0,shake:0,feedback:'跟著光點，敲出你的節奏',feedbackUntil:3,phaseSeen:[],p:{x:w*.19,y:h*.48,hp:mode==='stroll'?14:7,maxHP:mode==='stroll'?14:7,inv:1,cd:0,dashCD:0,dash:0,vx:0,vy:0},boss:null,enemies:[{x:w*.62,y:h*.48,hp:12,age:0,id:0}],shots:[],hazards:[],sparks:[],nextEnemy:1.4,enemyId:1,nextBossShot:0,stats:{shots:0,hits:0,perfect:0,dashes:0,reflects:0,bursts:0,damage:0,kills:0,firstHit:null}};}
function rng(s){s.seed=(s.seed*1664525+1013904223)>>>0;return s.seed/4294967296;}
function event(s){s.maxQuiet=Math.max(s.maxQuiet,s.time-s.lastEvent);s.lastEvent=s.time;}
function flash(s,x,y,color='#d9e951',n=7){for(let i=0;i<n;i++)s.sparks.push({x,y,vx:(rng(s)-.5)*200,vy:(rng(s)-.5)*200,t:.32,color});}
function feedback(s,text){s.feedback=text;s.feedbackUntil=s.time+1.15;}
function hurt(s){if(s.p.inv>0)return;s.p.hp--;s.p.inv=1.15;s.combo=0;s.stats.damage++;s.shake=.14;flash(s,s.p.x,s.p.y,'#c74638');event(s);feedback(s,'擦傷了・衝刺可以擋下飛針');}
function bossHit(s,n,x,y){let b=s.boss;if(!b)return;b.hp=Math.max(0,b.hp-n);b.hurt=.12;s.stats.hits++;s.score+=Math.round(n*9);if(s.stats.firstHit===null)s.stats.firstHit=s.time;flash(s,x,y);event(s);s.freeze=.025;s.shake=.05;}
function step(s,a={},dt=1/120){if(s.status!=='playing')return;s.time+=dt;s.beat=s.time*2;const stopped=s.freeze>0;
 const p=s.p,w=s.w,h=s.h,scale=Math.min(1,w/700);p.cd-=dt;p.dashCD-=dt;p.inv-=dt;p.dash-=dt;s.shake=Math.max(0,s.shake-dt);s.freeze=Math.max(0,s.freeze-dt);
 // Beat clock keeps ticking during the 18-25ms hit-stop; movement and collision freeze.
 if(stopped)return;
 const x=clamp(a.x||0,-1,1),y=clamp(a.y||0,-1,1),len=Math.hypot(x,y)||1;
 if(a.dash&&p.dashCD<=0){p.dash=.22;p.dashCD=.85;p.inv=Math.max(p.inv,.36);p.vx=(x||y?x/len:1)*650*scale;p.vy=(x||y?y/len:0)*650*scale;s.stats.dashes++;feedback(s,'穿葉・無敵反射');event(s);}
 p.x=clamp(p.x+(p.dash>0?p.vx:x/Math.max(1,len)*260*scale)*dt,32,w*.65);p.y=clamp(p.y+(p.dash>0?p.vy:y/Math.max(1,len)*260*scale)*dt,92,h-120);
 if(a.fire&&p.cd<=0){p.cd=.255;s.stats.shots++;const gap=Math.abs(s.beat-Math.round(s.beat))*.5,perfect=gap<=.105;if(perfect){s.combo++;s.maxCombo=Math.max(s.combo,s.maxCombo);s.energy=Math.min(12,s.energy+1);s.stats.perfect++;s.score+=10*Math.min(10,s.combo);feedback(s,'合拍 ×'+s.combo);}else{s.combo=Math.max(0,s.combo-1);}
 s.shots.push({x:p.x+20,y:p.y,vx:700*scale+120,vy:0,power:perfect?11:6,perfect});event(s);}
 if(a.burst&&s.energy>=12){s.energy=0;s.stats.bursts++;s.hazards=[];p.hp=Math.min(p.maxHP,p.hp+2);p.inv=.8;s.shake=.18;feedback(s,'滿奏・清場回復');for(const e of s.enemies){s.score+=100;flash(s,e.x,e.y);s.stats.kills++;}s.enemies=[];if(s.boss)bossHit(s,35,s.boss.x,s.boss.y);event(s);}
 if(s.time>=s.nextEnemy&&s.time<12){s.nextEnemy+=1.25;s.enemies.push({x:w+35,y:130+rng(s)*Math.max(60,h-310),hp:12,age:0,id:s.enemyId++});event(s);}
 for(const e of s.enemies){e.age+=dt;e.x-=100*scale*dt;e.y+=Math.sin(e.age*3+e.id)*22*dt;if(e.age>1.2&&!e.fired){e.fired=true;const angle=Math.atan2(p.y-e.y,p.x-e.x);s.hazards.push({x:e.x,y:e.y,vx:Math.cos(angle)*135*scale,vy:Math.sin(angle)*135*scale,age:0});}if(Math.hypot(e.x-p.x,e.y-p.y)<29){hurt(s);e.hp=0;}}
 if(s.time>=12&&!s.boss){s.boss={x:w*.84,y:h*.45,hp:s.mode==='stroll'?380:520,maxHP:s.mode==='stroll'?380:520,phase:1,hurt:0,pattern:0,next:12.7,tell:0,beamY:0};s.nextBossShot=s.time+.9;feedback(s,'鼓角君主・第一樂章');event(s);}
 if(s.boss){const b=s.boss;b.hurt=Math.max(0,b.hurt-dt);const phase=b.hp>b.maxHP*2/3?1:b.hp>b.maxHP/3?2:3;if(b.phase!==phase){b.phase=phase;s.hazards=[];feedback(s,['','一・單音追針','二・扇葉和弦','三・鼓角終奏'][phase]);event(s);}if(!s.phaseSeen.includes(phase))s.phaseSeen.push(phase);
 b.y=clamp(h*.46+Math.sin((s.time-12)*(.65+phase*.12))*Math.min(h*.20,150),140,h-190);
 if(s.time>=s.nextBossShot){s.nextBossShot=s.time+(phase===1?1.1:phase===2?.95:.75);const base=Math.atan2(p.y-b.y,p.x-b.x),n=phase===1?1:phase===2?3:5;for(let i=0;i<n;i++){let angle=base+(i-(n-1)/2)*.25;s.hazards.push({x:b.x-25,y:b.y,vx:Math.cos(angle)*(145+phase*17)*scale,vy:Math.sin(angle)*(145+phase*17)*scale,age:0});}b.pattern++;event(s);}
 if(b.phase>=2&&s.time>=b.next&&b.tell===0){b.beamY=p.y;b.tell=.9;b.next=s.time+5;feedback(s,'紅色細線即將掃過・移開或衝刺');event(s);}
 if(b.tell>0){b.tell-=dt;if(b.tell<=0){if(Math.abs(p.y-b.beamY)<22)hurt(s);flash(s,p.x,b.beamY,'#c74638',14);b.tell=0;event(s);}}
 if(Math.hypot(p.x-b.x,p.y-b.y)<(w<600?47:67))hurt(s);
 }
 for(const shot of s.shots){shot.x+=shot.vx*dt;shot.y+=shot.vy*dt;for(const e of s.enemies){if(!shot.dead&&e.hp>0&&Math.hypot(e.x-shot.x,e.y-shot.y)<30){e.hp-=shot.power;shot.dead=true;s.stats.hits++;if(s.stats.firstHit===null)s.stats.firstHit=s.time;s.score+=50;flash(s,e.x,e.y);s.freeze=.018;event(s);if(e.hp<=0){s.stats.kills++;s.score+=100;}}}if(!shot.dead&&s.boss&&Math.hypot(s.boss.x-shot.x,s.boss.y-shot.y)<(w<600?53:74)){bossHit(s,shot.power,shot.x,shot.y);shot.dead=true;}}
 for(const z of s.hazards){z.x+=z.vx*dt;z.y+=z.vy*dt;z.age+=dt;if(p.dash>0&&Math.hypot(z.x-p.x,z.y-p.y)<65){z.dead=true;s.stats.reflects++;s.score+=80;s.energy=Math.min(12,s.energy+1);s.shots.push({x:p.x+20,y:p.y,vx:650*scale+160,vy:0,power:12,perfect:true});flash(s,z.x,z.y);event(s);}else if(Math.hypot(z.x-p.x,z.y-p.y)<18){hurt(s);z.dead=true;}}
 s.enemies=s.enemies.filter(e=>e.hp>0&&e.x>-50);s.shots=s.shots.filter(z=>!z.dead&&z.x<w+80);s.hazards=s.hazards.filter(z=>!z.dead&&z.x>-45&&z.x<w+80&&z.y>-20&&z.y<h+20&&z.age<10);
 for(const z of s.sparks){z.x+=z.vx*dt;z.y+=z.vy*dt;z.t-=dt;}s.sparks=s.sparks.filter(z=>z.t>0);
 s.quiet=s.time-s.lastEvent;s.maxQuiet=Math.max(s.maxQuiet,s.quiet);if(s.quiet>5)s.quietSeconds+=dt;
 if(p.hp<=0||s.time>=95){s.status='lost';feedback(s,p.hp<=0?'鼓翼需要歇一口氣':'巡行時間已到');}else if(s.boss&&s.boss.hp<=0){s.status='won';s.score+=p.hp*100+Math.max(0,Math.round((95-s.time)*20));}
}
const api={create,step};if(typeof module!=='undefined')module.exports=api;else root.MossEngine=api;
})(typeof globalThis!=='undefined'?globalThis:this);
