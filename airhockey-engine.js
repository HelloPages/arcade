/* Coordinates use table widths. y = 0 faces the CPU goal in either orientation. */
(() => {
  'use strict';
  const STEP = 1 / 720;
  const MALLET = .088, PUCK = .038, POST = .012, MOUTH = .25;
  const clamp = (value, lo, hi) => Math.max(lo, Math.min(hi, value));
  const body = () => ({x: .5, y: 0, vx: 0, vy: 0});
  const tiers = [
    {speed:.78, delay:.20, aim:.30, reach:.34},
    {speed:1.48, delay:.081, aim:.075, reach:.46},
    {speed:2.0, delay:.037, aim:.025, reach:.42}
  ];

  function makeGame(length = 2, level = 1, random = Math.random) {
    const s = {length, level, player:body(), cpu:body(), puck:body(), target:body(), cpuTarget:body(),
      score:[0,0], phase:'ready', faceoff:0, lastGoal:-1, idle:0, think:0, lunge:0,
      aim:.5, hits:[0,0], banks:0, time:0};
    function setFaceoff(side) {
      Object.assign(s.player, {x:.5, y:s.length-.19, vx:0, vy:0});
      Object.assign(s.cpu, {x:.5, y:.19, vx:0, vy:0});
      Object.assign(s.target, s.player);
      Object.assign(s.cpuTarget, s.cpu);
      Object.assign(s.puck, {x:.5, y:side === 0 ? s.length-.46 : .46, vx:0, vy:0});
      s.think = s.lunge = s.idle = s.pinned = 0;
      s.anchorX=s.puck.x; s.anchorY=s.puck.y; s.lastHit=[-1,-1]; s.lastBank=-1;
    }
    function drop() {
      s.phase = 'playing';
      s.puck.vy = s.puck.y > s.length/2 ? .24 : -.30;
      s.puck.vx = (random()-.5)*.13;
    }
    function reset() {
      s.score = [0,0]; s.hits = [0,0]; s.banks = s.time = 0; s.lastGoal = -1;
      s.phase = 'ready'; setFaceoff(0);
    }
    function resize(next) {
      if (next === s.length) return;
      const ratio = next/s.length;
      for (const b of [s.player,s.cpu,s.target,s.cpuTarget,s.puck]) b.y *= ratio;
      s.length = next;
      if (s.phase === 'ready') setFaceoff(0);
    }
    function move(b, tx, ty, speed, low, high) {
      const dx = clamp(tx, MALLET, 1-MALLET)-b.x;
      const dy = clamp(ty, low, high)-b.y;
      const f = Math.min(1/STEP, speed/Math.max(.000001,Math.hypot(dx,dy)));
      b.vx=dx*f; b.vy=dy*f; b.x+=b.vx*STEP; b.y+=b.vy*STEP;
    }
    function decide() {
      const p=s.puck, c=s.cpu, target=s.cpuTarget, tier=tiers[s.level];
      const error = (random()-.5)*tier.aim;
      if(s.level===2 && p.vy<-.55 && p.y>.20 && (p.y-.15)/-p.vy<.65){
        const projected=p.x+p.vx*(.15-p.y)/p.vy;
        const folded=((projected%2)+2)%2;
        target.x=clamp(folded>1?2-folded:folded,.22,.78);
        target.y=.14; s.lunge=0; return;
      }
      if (s.lunge>0) return;
      if (p.y<s.length*tier.reach && p.vy<.8) {
        // Approach from behind the puck, then commit to the shot for a short window.
        if (c.y < p.y-.042 && Math.abs(c.x-p.x)<.16) {
          const lane = s.player.x < .5 ? .68 : .32;
          target.x=p.x+(lane-p.x)*.28+error; target.y=p.y+.25;
          s.lunge=.23;
        } else if(s.level>0 && c.y>=p.y-.025 && Math.abs(c.x-p.x)<.14){
          // Skirt the puck to regain its goal side without tapping it into our own net.
          const flank=p.x<.27?1:p.x>.73?-1:(c.x>=p.x?1:-1);
          target.x=p.x+flank*.18; target.y=c.y+.025;
        } else {
          target.x=p.x+error*.3; target.y=Math.max(MALLET,p.y-.15);
        }
      } else {
        const eta = p.vy < -.10 ? clamp((.19-p.y)/p.vy,0,1.2) : 0;
        const raw=(p.x+p.vx*eta+2)%2;
        const predicted=raw>1?2-raw:raw;
        target.x=clamp(.5+(predicted-.5)*(.65+s.level*.15)+error,.20,.80);
        target.y=.16+Math.min(.12,Math.abs(target.x-.5)*.30);
      }
    }
    function step(emit) {
      if (s.phase==='faceoff') {
        s.faceoff-=STEP;
        if (s.faceoff<=0) {setFaceoff(1-s.lastGoal); drop(); emit('drop');}
        return;
      }
      if (s.phase!=='playing') return;
      const p=s.puck, L=s.length, mid=L/2;
      s.time+=STEP; s.think-=STEP; s.lunge-=STEP; s.idle+=STEP;
      if (s.think<=0) {decide(); s.think=tiers[s.level].delay;}
      move(s.player,s.target.x,s.target.y,3.85,mid+MALLET*.4,L-MALLET);
      move(s.cpu,s.cpuTarget.x,s.cpuTarget.y,tiers[s.level].speed,MALLET,mid-MALLET*.4);
      p.x+=p.vx*STEP; p.y+=p.vy*STEP;
      const damping=1-.095*STEP;
      p.vx*=damping; p.vy*=damping;
      function bank() {
        if(s.time-s.lastBank<.042)return;
        s.lastBank=s.time; s.banks++; emit('bank');
      }
      function impact(b, r, side) {
        const dx=p.x-b.x, dy=p.y-b.y, dist=Math.hypot(dx,dy), sum=PUCK+r;
        if (dist>=sum) return;
        const nx=dist>1e-8?dx/dist:0, ny=dist>1e-8?dy/dist:(side===0?-1:1);
        p.x=b.x+nx*(sum+.00001); p.y=b.y+ny*(sum+.00001);
        const approach=(p.vx-b.vx)*nx+(p.vy-b.vy)*ny;
        if (approach>=0) return;
        const impulse=-1.91*approach;
        p.vx+=impulse*nx; p.vy+=impulse*ny;
        if (-approach<.04) return;
        if (side!==null) {
          if(s.time-s.lastHit[side]<.055)return;
          s.lastHit[side]=s.time; s.hits[side]++; s.idle=0; emit('hit',side);
        } else bank();
      }
      impact(s.player,MALLET,0); impact(s.cpu,MALLET,1);
      for (const y of [0,L]) for (const x of [MOUTH,1-MOUTH]) impact({x,y,vx:0,vy:0},POST,null);
      if (p.x<PUCK || p.x>1-PUCK) {
        const audible=Math.abs(p.vx)>.05;
        p.x=clamp(p.x,PUCK,1-PUCK); p.vx=(p.x===PUCK?1:-1)*Math.abs(p.vx)*.96;
        if(audible)bank();
      }
      if (p.x<=MOUTH || p.x>=1-MOUTH) {
        if (p.y<PUCK || p.y>L-PUCK) {
          const audible=Math.abs(p.vy)>.05;
          p.y=clamp(p.y,PUCK,L-PUCK); p.vy=(p.y===PUCK?1:-1)*Math.abs(p.vy)*.96;
          if(audible)bank();
        }
      }
      const speed=Math.hypot(p.vx,p.vy);
      const atRail=p.x<.13||p.x>.87||p.y<.13||p.y>L-.13;
      if(!atRail||Math.hypot(p.x-s.anchorX,p.y-s.anchorY)>.105){
        s.pinned=0; s.anchorX=p.x; s.anchorY=p.y;
      }else s.pinned+=STEP;
      if(s.pinned>1.45){
        // A dead puck wedged between striker and rail is returned to that side for a faceoff.
        setFaceoff(p.y>mid?0:1); drop(); emit('drop'); return;
      }
      if (speed>3.65) {p.vx*=3.65/speed; p.vy*=3.65/speed;}
      if (p.y < -PUCK || p.y > L+PUCK) {
        s.lastGoal=p.y<0?0:1; s.score[s.lastGoal]++;
        s.phase=s.score[s.lastGoal]>=5?'over':'faceoff'; s.faceoff=1.05;
        emit('goal',s.lastGoal); return;
      }
      // Return a stranded puck to play, including endless side-to-side banks.
      if (s.idle>6.5 && (speed<.32 || Math.abs(p.vy)<.16)) {
        p.vx=(.5-p.x)*.45; p.vy=p.y>mid?-.70:.70; s.idle=0;
      }
    }
    reset();
    return {s,drop,step,reset,resize};
  }
  const api={makeGame,STEP,MALLET,PUCK,POST,MOUTH,clamp};
  if (typeof module!=='undefined' && module.exports) module.exports=api;
  else window.AirHockey=api;
})();
