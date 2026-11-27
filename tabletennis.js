(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const strings = {
    tw: {title:"桌球-1",you:"你",menu:"設定",court:"桌球球桌",serve:"發球",receive:"接發球",hit:"揮拍",again:"再來一局",resume:"繼續",opponent:"對手",language:"語言",levels:["入門","進階","高手"],ready:"點球桌發球",cpuReady:"CPU發球",rally:"回合",won:"你得分",lost:"CPU得分",win:"你贏了",loss:"CPU獲勝",hint:"點一下快攻，往上滑拉弧圈，斜滑打側旋。",manual:"滑動跟球，放開揮拍。鍵盤用← →移動、空白鍵擊球。",rules:"搶7分，須領先2分。每2分交換發球，6平後每分交換。入門會自動跟球，進階與高手要自己移拍。",best:"最長對打",streak:"目前連勝",loop:"弧圈",hook:"側旋",respond:"現在回擊",wait:"等球彈起"},
    en: {title:"Table Tennis 1",you:"You",menu:"Settings",court:"Table tennis court",serve:"Serve",receive:"Receive",hit:"Swing",again:"Play again",resume:"Resume",opponent:"Opponent",language:"Language",levels:["Rookie","Club","Ace"],ready:"Tap the table to serve",cpuReady:"CPU to serve",rally:"Rally",won:"Your point",lost:"CPU point",win:"You win",loss:"CPU wins",hint:"Tap to drive. Swipe up to loop or diagonally for sidespin.",manual:"Move to the ball and release to hit. Keyboard: arrows to move, Space to swing.",rules:"First to 7, win by 2. Serve changes every 2 points, then every point at 6-all. Rookie tracks the ball for you. Move your paddle on Club and Ace.",best:"Longest rally",streak:"Win streak",loop:"Loop",hook:"Sidespin",respond:"Hit now",wait:"Wait for the bounce"},
    ko: {title:"탁구-1",you:"나",menu:"설정",court:"탁구대",serve:"서브",receive:"리시브",hit:"스윙",again:"한 판 더",resume:"계속",opponent:"상대",language:"언어",levels:["입문","중급","고수"],ready:"탁구대를 눌러 서브",cpuReady:"CPU 서브",rally:"랠리",won:"내 득점",lost:"CPU 득점",win:"승리!",loss:"CPU 승리",hint:"톡 누르면 속공, 위로 밀면 드라이브, 비스듬히 밀면 횡회전!",manual:"공을 따라 움직인 뒤 손을 떼서 치세요. 키보드는 방향키로 이동하고 스페이스로 쳐요.",rules:"7점 선취, 2점 차로 승리해요. 2점마다 서브를 바꾸고 6대6부터는 1점마다 바꿔요. 입문에서는 자동으로 공을 따라가요. 중급부터는 직접 움직이세요.",best:"최장 랠리",streak:"현재 연승",loop:"드라이브",hook:"횡회전",respond:"지금 치세요",wait:"바운드를 기다리세요"}
  };
  const canvas=$("court"),settings=$("settings"),graphics=new PrintCourt(canvas);
  const key="arcade.tabletennis.1";
  let saved={};
  try {saved=JSON.parse(localStorage.getItem(key))||{};} catch {}
  const store=()=>{try{localStorage.setItem(key,JSON.stringify(saved));}catch{}};
  const validLevel=n=>[0,1,2].includes(n)?n:0;
  let m=new TableTennisMatch(validLevel(saved.level)),lang,copy,paused=false,flash="",flashUntil=0;
  let gesture=null,audio=null,lastTime=0,accum=0,stopFor=0;
  const held=new Set();
  const bounded=n=>Math.max(-1,Math.min(1,n));
  function show(id,txt){if($(id).textContent!==txt)$(id).textContent=txt;}
  function unlock(){
    try{
      if(!audio)audio=new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==="suspended")audio.resume().catch(()=>{});
    }catch{}
  }
  function sound(type){
    if(audio?.state!=="running")return;
    const bounce=type==="bounce",end=type==="match"||type==="point";
    const oscillator=audio.createOscillator(),gain=audio.createGain(),now=audio.currentTime;
    oscillator.type=end?"sine":"triangle";
    oscillator.frequency.setValueAtTime(end?(m.winner==="player"?620:340):bounce?640:1070,now);
    oscillator.frequency.exponentialRampToValueAtTime(end?(m.winner==="player"?880:190):bounce?235:380,now+.045);
    gain.gain.setValueAtTime(bounce?.065:.10,now);gain.gain.exponentialRampToValueAtTime(.001,now+(end?.20:.058));
    oscillator.connect(gain);gain.connect(audio.destination);oscillator.start(now);oscillator.stop(now+.21);
    oscillator.onended=()=>{oscillator.disconnect();gain.disconnect();};
  }
  function scoreRecords(){
    const r=saved["tier"+m.level]||{};
    return {best:Number(r.best)||0,streak:Number(r.streak)||0};
  }
  function refresh(){
    const ready=m.phase==="ready",over=m.phase==="over",incoming=m.receiver==="player";
    show("playerScore",String(m.player));show("cpuScore",String(m.cpu));
    show("action",over?copy.again:ready?(m.server==="player"?copy.serve:copy.receive):copy.hit);
    let call="";
    if(ready)call=m.server==="player"?copy.ready:copy.cpuReady;
    else if(over)call=m.winner==="player"?copy.win:copy.loss;
    else if(m.phase==="point")call=m.winner==="player"?copy.won:copy.lost;
    else if(flash && m.clock<flashUntil)call=copy[flash];
    else if(m.rally>=2)call=copy.rally+" ×"+m.rally;
    show("call",call);
    show("hint",m.phase==="flight" && incoming ? (m.bounces?copy.respond:copy.wait) : (m.level===0?copy.hint:copy.manual));
  }
  function applyLang(l){
    lang=l;copy=strings[l]||strings.tw;document.title=copy.title;
    for(const id of ["title","you","menu","opponent"])show(id,copy[id]);
    for(const [id,k] of [["settingsTitle","menu"],["languageLabel","language"],["instructions","rules"],["restart","again"],["resume","resume"]])show(id,copy[k]);
    Array.from($("level").options).forEach((o,i)=>o.textContent=copy.levels[i]);
    $("level").value=m.level;$("language").value=l;canvas.setAttribute("aria-label",copy.court);
    const r=scoreRecords();show("records",copy.best+" · "+Math.max(m.bestRally,r.best)+"　/　"+copy.streak+" · "+r.streak);
    refresh();
  }
  ArcadeI18n.onChange(applyLang,true);
  // The portal can repeat an already-applied language by both storage and postMessage.
  // Its shared listener restores the original title even when no change callback fires.
  function syncTitle(){document.title=strings[ArcadeI18n.getLang()].title;}
  window.addEventListener("message",e=>{if(e.data?.type==="ARCADE_SET_LANG")syncTitle();});
  window.addEventListener("storage",e=>{if(e.key==="arcade_lang_v1")syncTitle();});
  function drain(){
    for(const event of m.events.splice(0)){
      sound(event);
      if(event==="bounce")graphics.bounce(m.ball);
      if(event==="loop"||event==="hook"){flash=event;flashUntil=m.clock+.38;}
      if(["drive","loop","hook"].includes(event))stopFor=.018;
      if(event==="match"||event==="point"){
        const r=scoreRecords();r.best=Math.max(r.best,m.bestRally);
        if(event==="match")r.streak=m.winner==="player"?r.streak+1:0;
        saved["tier"+m.level]=r;store();
      }
    }
  }
  function restart(level=m.level){
    m=new TableTennisMatch(level);held.clear();gesture=null;flash="";stopFor=accum=0;
    graphics.trail=[];graphics.rings=[];applyLang(lang);
  }
  function act(aim,spin=0,lift=0){
    if(paused)return;
    unlock();
    if(m.phase==="over")restart();
    else m.action(aim,spin,lift);
    drain();refresh();
  }
  function openMenu(){
    paused=true;held.clear();gesture=null;applyLang(lang);settings.showModal();
  }
  $("menu").onclick=openMenu;
  $("resume").onclick=()=>settings.close();
  settings.addEventListener("close",()=>{paused=false;lastTime=0;accum=0;canvas.focus({preventScroll:true});});
  $("level").onchange=()=>{saved.level=validLevel(Number($("level").value));store();restart(saved.level);};
  $("restart").onclick=()=>{restart();settings.close();};
  $("language").onchange=()=>ArcadeI18n.setLang($("language").value);
  $("action").onclick=()=>act(m.aim);
  function lane(x){const r=canvas.getBoundingClientRect();return bounded(((x-r.left)/r.width-.5)*2.1);}
  canvas.addEventListener("pointerdown",e=>{
    if(paused||gesture||e.button!==0)return;
    unlock();canvas.focus({preventScroll:true});
    canvas.setPointerCapture(e.pointerId);m.aim=lane(e.clientX);
    gesture={id:e.pointerId,x:e.clientX,y:e.clientY};
  });
  canvas.addEventListener("pointermove",e=>{
    if(paused||(gesture && e.pointerId!==gesture.id))return;
    if(gesture||e.pointerType==="mouse")m.aim=lane(e.clientX);
  });
  canvas.addEventListener("pointerup",e=>{
    if(!gesture||e.pointerId!==gesture.id)return;
    const dx=(e.clientX-gesture.x)/Math.min(canvas.clientWidth*.21,130);
    const dy=(gesture.y-e.clientY)/Math.min(canvas.clientHeight*.18,110);
    m.aim=lane(e.clientX);gesture=null;
    act(bounded(m.aim*.85+dx*.28),bounded(dx),Math.max(0,bounded(dy)));
  });
  canvas.addEventListener("pointercancel",()=>{gesture=null;});
  window.addEventListener("keydown",e=>{
    if(paused||!["ArrowLeft","ArrowRight","Space","KeyP"].includes(e.code))return;
    if(e.target.closest("button,select")&&e.code==="Space")return;
    e.preventDefault();held.add(e.code);
    if(e.code==="KeyP"&&!e.repeat)openMenu();
    if(e.code==="Space"&&!e.repeat){
      const dir=Number(held.has("ArrowRight"))-Number(held.has("ArrowLeft"));
      act(bounded(m.aim+dir*.28),dir*.78,dir?.48:0);
    }
  });
  window.addEventListener("keyup",e=>held.delete(e.code));
  window.addEventListener("blur",()=>{held.clear();gesture=null;});
  document.addEventListener("visibilitychange",()=>{
    lastTime=0;accum=0;
    if(document.hidden && !paused && m.phase==="flight")openMenu();
  });
  function draw(now){
    const dt=lastTime?Math.min(.065,(now-lastTime)/1000):0;lastTime=now;
    if(!paused&&!document.hidden){
      if(stopFor>0)stopFor-=dt;
      else accum+=dt;
      const dx=Number(held.has("ArrowRight"))-Number(held.has("ArrowLeft"));
      while(accum>=1/120){
        m.aim=bounded(m.aim+dx*.018);m.step(1/120);drain();accum-=1/120;
      }
      refresh();graphics.draw(m,dt);
    }
    requestAnimationFrame(draw);
  }
  window.render_game_to_text=()=>JSON.stringify({phase:m.phase,receiver:m.receiver,bounces:m.bounces||0,rally:m.rally,
    player:m.player,cpu:m.cpu,server:m.server,level:m.level,paused,shot:m.lastShot,ball:m.ball,playerX:m.playerX,bestRally:m.bestRally});
  requestAnimationFrame(draw);
})();
