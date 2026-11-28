(() => {
  "use strict";
  const $ = id => document.getElementById(id);
  const strings = {
    tw: {
      title:"桌球-1", you:"你", menu:"設定", court:"桌球球桌", serve:"發球", receive:"接發球", hit:"揮拍",
      again:"再來一局", resume:"繼續", opponent:"對手", language:"語言",
      levels:["入門","中級","高手"],
      ready:"點我方球桌發球（按住可蓄力）", cpuReady:"CPU發球，準備對位接球",
      rally:"回合", won:"你得分", lost:"CPU得分", win:"你贏了", loss:"CPU獲勝",
      hint:"點我方桌面對位擊球；按住或上滑增加虛擬力道，過強會出界！",
      manual:"點來球落點準時回擊；按住時間＋短滑動映射虛擬力道（紅區過強易出界）。",
      rules:"預設中級。搶7分領先2分勝。點我方桌面即移動球拍對位擊球，太早、太晚或沒對到球會揮空失分；按壓時間／短滑動映射虛擬力道，過強會出界失分。",
      best:"最長對打", streak:"目前連勝",
      loop:"弧圈", hook:"側旋", overpower:"過強重扣!",
      early:"太早揮拍!", late:"太晚沒接到!", position:"位置偏掉揮空!", out:"出界失分!", net:"掛網失分!",
      respond:"等球彈起對位點球!", wait:"看準落點準備接球"
    },
    en: {
      title:"Table Tennis 1", you:"You", menu:"Settings", court:"Table tennis court", serve:"Serve", receive:"Receive", hit:"Swing",
      again:"Play again", resume:"Resume", opponent:"Opponent", language:"Language",
      levels:["Rookie","Medium","Ace"],
      ready:"Tap your half to serve (hold for power)", cpuReady:"CPU serves — tap ball spot",
      rally:"Rally", won:"Your point", lost:"CPU point", win:"You win", loss:"CPU wins",
      hint:"Tap your table side where the ball is; hold/swipe sets virtual power (red = out!).",
      manual:"Tap exact ball spot on bounce; hold time + short swipe maps virtual power (red risks out).",
      rules:"Default Medium. First to 7 (win by 2). Tap your legal half to strike at that exact spot; early, late, or off-spot swings whiff. Hold duration/short swipe maps virtual power — overpowering sends the ball out.",
      best:"Longest rally", streak:"Win streak",
      loop:"Loop", hook:"Sidespin", overpower:"Overpower!",
      early:"Too early!", late:"Too late!", position:"Missed spot!", out:"Out of bounds!", net:"Net fault!",
      respond:"Tap ball spot now!", wait:"Track the bounce"
    },
    ko: {
      title:"탁구-1", you:"나", menu:"설정", court:"탁구대", serve:"서브", receive:"리시브", hit:"스윙",
      again:"한 판 더", resume:"계속", opponent:"상대", language:"언어",
      levels:["입문","중급","고수"],
      ready:"내 코트를 눌러 서브(길게 눌러 파워)", cpuReady:"CPU 서브 — 공 위치 탭",
      rally:"랠리", won:"내 득점", lost:"CPU 득점", win:"승리!", loss:"CPU 승리",
      hint:"내 코트에서 공 위치를 탭해 타격! 길게 누르거나 밀면 가상 파워(빨강은 아웃).",
      manual:"바운드 후 공 위치를 정확히 탭하세요. 누른 시간/짧은 스와이프로 가상 파워 조절.",
      rules:"기본 중급. 7점 선취(2점 차). 내 코트 탭 위치로 라켓이 이동해 타격하며, 너무 이르거나 늦거나 빗나가면 실점합니다. 과도한 파워는 아웃 실점입니다.",
      best:"최장 랠리", streak:"현재 연승",
      loop:"드라이브", hook:"횡회전", overpower:"파워 초과!",
      early:"너무 빨라요!", late:"너무 늦었어요!", position:"빗나갔어요!", out:"아웃 실점!", net:"네트 실점!",
      respond:"지금 공 위치를 탭!", wait:"바운드를 기다리세요"
    }
  };

  const canvas=$("court"), settings=$("settings"), graphics=new PrintCourt(canvas);
  const key="arcade.tabletennis.2";
  let saved={};
  try { saved=JSON.parse(localStorage.getItem(key))||{}; } catch {}
  const store=()=>{ try{ localStorage.setItem(key,JSON.stringify(saved)); }catch{} };
  const validLevel=n=>[0,1,2].includes(n)?n:1; // 預設中級 (1)

  let m=new TableTennisMatch(validLevel(saved.level)), lang, copy, paused=false, flash="", flashUntil=0;
  let gesture=null, audio=null, lastTime=0, accum=0, stopFor=0;
  const held=new Set();
  const bounded=(n, lo=-1, hi=1)=>Math.max(lo,Math.min(hi,n));

  function show(id,txt){ if($(id).textContent!==txt) $(id).textContent=txt; }
  function unlock(){
    try{
      if(!audio) audio=new (window.AudioContext||window.webkitAudioContext)();
      if(audio.state==="suspended") audio.resume().catch(()=>{});
    }catch{}
  }
  function sound(type){
    if(audio?.state!=="running") return;
    const bounce=type==="bounce", end=type==="match"||type==="point", whiff=type==="whiff";
    const oscillator=audio.createOscillator(), gain=audio.createGain(), now=audio.currentTime;
    oscillator.type = end ? "sine" : whiff ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(end?(m.winner==="player"?620:340):whiff?240:bounce?640:1070, now);
    oscillator.frequency.exponentialRampToValueAtTime(end?(m.winner==="player"?880:190):whiff?130:bounce?235:380, now+.055);
    gain.gain.setValueAtTime(whiff?.05:bounce?.065:.10, now);
    gain.gain.exponentialRampToValueAtTime(.001, now+(end?.20:.065));
    oscillator.connect(gain); gain.connect(audio.destination);
    oscillator.start(now); oscillator.stop(now+.22);
    oscillator.onended=()=>{ oscillator.disconnect(); gain.disconnect(); };
  }
  function scoreRecords(){
    const r=saved["tier"+m.level]||{};
    return { best:Number(r.best)||0, streak:Number(r.streak)||0 };
  }
  function refresh(){
    const ready=m.phase==="ready", over=m.phase==="over", incoming=m.receiver==="player";
    show("playerScore",String(m.player)); show("cpuScore",String(m.cpu));
    show("action", over?copy.again:ready?(m.server==="player"?copy.serve:copy.receive):copy.hit);
    let call="";
    if(ready) call=m.server==="player"?copy.ready:copy.cpuReady;
    else if(over) call=m.winner==="player"?copy.win:copy.loss;
    else if(m.phase==="point") {
      if(m.lastMissReason==="out") call=copy.out;
      else if(m.lastMissReason==="net") call=copy.net;
      else call=m.winner==="player"?copy.won:copy.lost;
    }
    else if(flash && m.clock<flashUntil) call=copy[flash]||flash;
    else if(m.rally>=2) call=copy.rally+" ×"+m.rally;
    show("call",call);
    show("hint", m.phase==="flight" && incoming ? (m.bounces?copy.respond:copy.wait) : copy.manual);
  }
  function applyLang(l){
    lang=l; copy=strings[l]||strings.tw; document.title=copy.title;
    for(const id of ["title","you","menu","opponent"]) show(id,copy[id]);
    for(const [id,k] of [["settingsTitle","menu"],["languageLabel","language"],["instructions","rules"],["restart","again"],["resume","resume"]]) show(id,copy[k]);
    Array.from($("level").options).forEach((o,i)=>o.textContent=copy.levels[i]);
    $("level").value=m.level; $("language").value=l; canvas.setAttribute("aria-label",copy.court);
    const r=scoreRecords(); show("records",copy.best+" · "+Math.max(m.bestRally,r.best)+"　/　"+copy.streak+" · "+r.streak);
    refresh();
  }
  ArcadeI18n.onChange(applyLang,true);
  function syncTitle(){ document.title=strings[ArcadeI18n.getLang()].title; }
  window.addEventListener("message",e=>{ if(e.data?.type==="ARCADE_SET_LANG") syncTitle(); });
  window.addEventListener("storage",e=>{ if(e.key==="arcade_lang_v1") syncTitle(); });

  function drain(){
    for(const event of m.events.splice(0)){
      sound(event);
      if(event==="bounce") graphics.bounce(m.ball);
      if(event==="whiff" && m.lastWhiff){
        graphics.markWhiff(m.lastWhiff.x, m.lastWhiff.y);
        flash = m.lastWhiff.reason || "position";
        flashUntil = m.clock + .45;
      }
      if(["drive","loop","hook","overpower","serve"].includes(event)){
        if(m.lastContact) graphics.markHit(m.lastContact.x, m.lastContact.y);
        if(event==="loop"||event==="hook"||event==="overpower"){ flash=event; flashUntil=m.clock+.42; }
        if(event!=="serve") stopFor=.018;
      }
      if(event==="match"||event==="point"){
        const r=scoreRecords(); r.best=Math.max(r.best,m.bestRally);
        if(event==="match") r.streak=m.winner==="player"?r.streak+1:0;
        saved["tier"+m.level]=r; store();
      }
    }
  }
  function restart(level=m.level){
    m=new TableTennisMatch(level); held.clear(); gesture=null; graphics.chargeUi=null; flash=""; stopFor=accum=0;
    graphics.trail=[]; graphics.rings=[]; applyLang(lang);
  }
  function computeVirtualPower(downTime, dyPx){
    const holdSec = Math.max(0, (performance.now() - downTime) / 1000);
    const holdPwr = .42 + Math.min(.88, holdSec * 1.18);
    const swipeBoost = Math.max(0, dyPx / 160) * .52;
    return bounded(holdPwr + swipeBoost, .25, 1.42);
  }
  function actAt(tapX, tapY, spin=0, lift=0, power=.62){
    if(paused) return;
    unlock();
    if(m.phase==="over") restart();
    else m.action(tapX, tapY, spin, lift, power);
    drain(); refresh();
  }
  function openMenu(){
    paused=true; held.clear(); gesture=null; graphics.chargeUi=null; applyLang(lang); settings.showModal();
  }
  $("menu").onclick=openMenu;
  $("resume").onclick=()=>settings.close();
  settings.addEventListener("close",()=>{ paused=false; lastTime=0; accum=0; canvas.focus({preventScroll:true}); });
  $("level").onchange=()=>{ saved.level=validLevel(Number($("level").value)); store(); restart(saved.level); };
  $("restart").onclick=()=>{ restart(); settings.close(); };
  $("language").onchange=()=>ArcadeI18n.setLang($("language").value);
  $("action").onclick=()=>actAt(m.playerX, m.playerY, 0, 0, .64);

  canvas.addEventListener("pointerdown",e=>{
    if(paused||gesture||e.button!==0) return;
    unlock(); canvas.focus({preventScroll:true});
    const pt = graphics.unproject(e.clientX, e.clientY);
    if (!pt.legal) return; // 點到對手半場不觸發非法位移
    canvas.setPointerCapture(e.pointerId);
    m.setPaddlePos(pt.x, pt.y);
    gesture = { id: e.pointerId, x: e.clientX, y: e.clientY, tapX: pt.x, tapY: pt.y, downTime: performance.now() };
    graphics.chargeUi = { x: pt.x, y: pt.y, power: .42 };
  });
  canvas.addEventListener("pointermove",e=>{
    if(paused || (gesture && e.pointerId!==gesture.id)) return;
    const pt = graphics.unproject(e.clientX, e.clientY);
    if(gesture){
      const dyPx = gesture.y - e.clientY;
      const pwr = computeVirtualPower(gesture.downTime, dyPx);
      if (pt.legal) { m.setPaddlePos(pt.x, pt.y); gesture.tapX = pt.x; gesture.tapY = pt.y; }
      graphics.chargeUi = { x: gesture.tapX, y: gesture.tapY, power: pwr };
    } else if (e.pointerType === "mouse" && pt.legal) {
      m.setPaddlePos(pt.x, pt.y);
    }
  });
  canvas.addEventListener("pointerup",e=>{
    if(!gesture||e.pointerId!==gesture.id) return;
    const dx = (e.clientX - gesture.x) / Math.min(canvas.clientWidth * .24, 130);
    const dyPx = gesture.y - e.clientY;
    const dy = dyPx / Math.min(canvas.clientHeight * .18, 110);
    const pwr = computeVirtualPower(gesture.downTime, dyPx);
    const tx = gesture.tapX, ty = gesture.tapY;
    gesture = null;
    graphics.chargeUi = null;
    actAt(tx, ty, bounded(dx), Math.max(0, bounded(dy)), pwr);
  });
  canvas.addEventListener("pointercancel",()=>{ gesture=null; graphics.chargeUi=null; });

  window.addEventListener("keydown",e=>{
    if(paused||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","Space","KeyP"].includes(e.code)) return;
    if(e.target.closest("button,select")&&e.code==="Space") return;
    e.preventDefault(); held.add(e.code);
    if(e.code==="KeyP"&&!e.repeat) openMenu();
    if(e.code==="Space"&&!e.repeat){
      const dir=Number(held.has("ArrowRight"))-Number(held.has("ArrowLeft"));
      actAt(m.playerX, m.playerY, dir*.72, dir?.42:0, .68);
    }
  });
  window.addEventListener("keyup",e=>held.delete(e.code));
  window.addEventListener("blur",()=>{ held.clear(); gesture=null; graphics.chargeUi=null; });
  document.addEventListener("visibilitychange",()=>{
    lastTime=0; accum=0;
    if(document.hidden && !paused && m.phase==="flight") openMenu();
  });

  function draw(now){
    const dt=lastTime?Math.min(.065,(now-lastTime)/1000):0; lastTime=now;
    if(!paused&&!document.hidden){
      if(gesture){
        graphics.chargeUi = { x: gesture.tapX, y: gesture.tapY, power: computeVirtualPower(gesture.downTime, 0) };
      }
      if(stopFor>0) stopFor-=dt;
      else accum+=dt;
      const dx=Number(held.has("ArrowRight"))-Number(held.has("ArrowLeft"));
      const dy=Number(held.has("ArrowUp"))-Number(held.has("ArrowDown"));
      while(accum>=1/120){
        if(dx||dy) m.setPaddlePos(m.playerX+dx*.018, m.playerY+dy*.014);
        m.step(1/120); drain(); accum-=1/120;
      }
      refresh(); graphics.draw(m,dt);
    }
    requestAnimationFrame(draw);
  }
  window.render_game_to_text=()=>JSON.stringify({
    phase:m.phase, receiver:m.receiver, bounces:m.bounces||0, rally:m.rally,
    player:m.player, cpu:m.cpu, server:m.server, level:m.level, paused,
    shot:m.lastShot, missReason:m.lastMissReason, ball:m.ball,
    playerX:m.playerX, playerY:m.playerY, lastContact:m.lastContact, bestRally:m.bestRally
  });
  requestAnimationFrame(draw);
})();
