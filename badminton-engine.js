(() => {
  'use strict';
  const drag = 1.35, gravity = 1.72, net = .265, tick = 1 / 120;
  const clamp = (value, low, high) => Math.max(low, Math.min(high, value));
  const decay = seconds => -Math.expm1(-drag * seconds) / drag;
  function flight(ball, time) {
    const integral = decay(time);
    return {x:ball.x + ball.vx * integral, z:ball.z + (ball.vz + gravity / drag) * integral - gravity * time / drag,
      vx:ball.vx * Math.exp(-drag * time), vz:(ball.vz + gravity / drag) * Math.exp(-drag * time) - gravity / drag};
  }
  function landing(ball) {
    let low = 0, high = 3;
    for (let count = 0; count < 12; count++) { const mid = (low + high) / 2; if (flight(ball, mid).z > 0) low = mid; else high = mid; }
    return flight(ball, high).x;
  }
  const athlete = position => ({x:position,target:position,energy:1,pose:'ready',anim:0});
  function match(level = 0, rng = Math.random) {
    const state = {phase:'serve',score:[0,0],server:0,player:athlete(.21),cpu:athlete(.78),level,ball:null,turn:0,rally:0,maxRally:0,peak:0,clock:0,delay:0,buffer:null,reaction:0,aim:.75,event:0,label:'',winner:-1,lastShot:'',lastSide:-1};
    const actor = side => side ? state.cpu : state.player;
    function point(side, reason) {
      state.score[side]++; state.server=side; state.winner=side; state.event++; state.label=reason; state.buffer=null;
      state.phase=state.score[side]>=7 && state.score[side]-state.score[1-side]>=2?'over':'point'; state.delay=1.05;
    }
    function stroke(side, kind, charge=0, serving=false) {
      const who=actor(side), dir=side?-1:1, incoming=state.ball;
      const height=serving?.28:incoming.z;
      const start=serving?who.x+dir*.032:incoming.x;
      const high=kind==='smash' && !serving && height>=.33;
      const dive=!serving && height<.16;
      const shot=serving?'serve':high?'smash':dive?'dive':kind==='smash'?'clear':kind;
      let dest=kind==='drop' && !dive?.594:.895;
      const defender=actor(1-side).x;
      if(high)dest=(side?1-defender:defender)>.75?.64:.94;
      const offset=!serving?clamp((start-who.x)*dir,-.1,.1):0;
      const target=(side?1-dest:dest)+dir*offset*.27+(rng()-.5)*(side?.079:.039);
      let time=high?.43:kind==='drop' && !dive?.99:1.64+charge*.12;
      if (serving) time=1.47;
      let integral=decay(time), vx=(target-start)/integral;
      let vz=(gravity*time/drag-height)/integral-gravity/drag;
      for(let tries=0;tries<24;tries++){
        const netTime=-Math.log(1-drag*(.5-start)/vx)/drag;
        if(flight({x:start,z:height,vx,vz},netTime).z>net+.025)break;
        time+=.045; integral=decay(time);vx=(target-start)/integral;vz=(gravity*time/drag-height)/integral-gravity/drag;
      }
      state.ball={x:start,z:height,vx,vz}; state.turn=1-side; state.lastSide=side; state.lastShot=shot; state.rally++; state.maxRally=Math.max(state.maxRally,state.rally);
      state.aim=landing(state.ball); state.reaction=(.28-state.level*.075)+rng()*.12; state.buffer=null;
      who.energy=Math.max(.12,who.energy-(dive?.34:high?.23:.065));
      state.readOffset=(rng()-.5)*(.20-state.level*.045+(1-state.cpu.energy)*.27);
      who.anim=dive?.46:.34; who.pose=shot; state.event++; state.label=shot;
      if(high) state.peak=Math.max(state.peak,Math.round(3.6*Math.hypot(vx*13.4,vz*6.4)));
    }
    function serve() {
      if(state.phase!=='serve')return false;
      state.phase='play'; state.winner=-1; stroke(state.server,'clear',0,true); return true;
    }
    function canHit(side,kind) {
      const ball=state.ball, who=actor(side);
      if(!ball || state.turn!==side || (side?ball.x<.505:ball.x>.495))return false;
      const reach=(ball.z<.17?.126:.105)*(side?.71+.29*who.energy:1);
      return Math.abs(ball.x-who.x)<=reach && ball.z>(.016) && ball.z<=(kind==='smash'?.595:.43);
    }
    function input(kind,charge=0) {
      if(state.phase==='serve')return serve();
      if(state.phase!=='play'||state.turn!==0)return false;
      if(canHit(0,kind)){stroke(0,kind,charge);return true;}
      state.buffer={kind,charge,left:.29}; return false;
    }
    function move(who,target,speed,dt) {
      const delta=clamp(target-who.x,-speed*dt,speed*dt);
      who.x+=delta; who.energy=clamp(who.energy+dt*.105-Math.abs(delta)*.68,.12,1); who.anim=Math.max(0,who.anim-dt);
    }
    function step(dt,axis=0) {
      if(state.phase==='over')return;
      state.clock+=dt;
      if(state.phase==='point'){
        if((state.delay-=dt)<=0){state.phase='serve';state.rally=0;state.ball=null;state.cpu.x=state.cpu.target=.78;state.player.x=state.player.target=.21;state.delay=.75;}
        return;
      }
      if(axis)state.player.target=clamp(state.player.x+axis*dt*.78,.045,.47);
      move(state.player,state.player.target,.77,dt);
      if(state.phase==='serve'){if(state.server && (state.delay-=dt)<=0)serve();return;}
      state.reaction-=dt;
      if(state.turn===1 && state.reaction<=0)state.cpu.target=clamp(state.aim+state.readOffset,.53,.955);
      if(state.turn===0)state.cpu.target=.755;
      move(state.cpu,state.cpu.target,(.31+state.level*.095)*(.60+state.cpu.energy*.40),dt);
      const prev=state.ball;state.ball=flight(prev,dt);const ball=state.ball;
      if((prev.x-.5)*(ball.x-.5)<=0 && ball.z<=net){point(state.turn,'net');return;}
      if(ball.z<=0){const inside=ball.x>=.018&&ball.x<=.982;const side=inside?(ball.x<.5?1:0):state.turn;point(side,inside?'floor':'out');return;}
      if(state.turn===1 && state.reaction<=0 && ball.vz<.08){
        const smash=ball.z>.36 && state.cpu.energy>.36 && state.rally>2 && (state.level===2 || state.rally%4===0);
        const kind=smash?'smash':state.player.x<.235?'drop':'clear';
        if(canHit(1,kind))stroke(1,kind);
      } else if(state.turn===0 && state.buffer){const queued=state.buffer;queued.left-=dt;if(canHit(0,queued.kind))stroke(0,queued.kind,queued.charge);else if(queued.left<=0)state.buffer=null;}
    }
    return {state,serve,input,step,target(value){state.player.target=clamp(value,.045,.47);}};
  }
  globalThis.MapleMatch={match,flight,landing,tick,net};
})();
