(async () => {
  'use strict';
  const $=id=>document.getElementById(id);
  const strings={
    tw:{title:'空氣曲棍球-1',you:'海獺',menu:'設定',settings:'比賽設定',difficulty:'CPU難度',levels:['初級','中級','高手'],language:'語言',sound:'擊球音效',rules:'拖曳海獺，在自己的半場推擊金色冰球。也可以用方向鍵或WASD移動，按空白鍵開球。先進5球獲勝；切換難度會開新局。',best:'最佳連勝',current:'目前連勝',again:'再來一局',back:'回球桌',start:'開球',pause:'暫停',goal:'海獺進球！',cpuGoal:'海豹進球！',win:'海獺獲勝！',lose:'海豹獲勝！',ready:'拖曳海獺擊球，先進5球獲勝。',live:'斜推冰球，可借側牆反彈射門。',tip:'方向鍵或拖曳球槌，先進5球獲勝。',finish:'比賽結束',surface:'空氣曲棍球桌',loading:'正在準備球桌…',failed:'球桌圖片載入失敗，請重新整理。'},
    en:{title:'Air Hockey 1',you:'Otter',menu:'Settings',settings:'Match settings',difficulty:'CPU level',levels:['Rookie','Club','Expert'],language:'Language',sound:'Sound effects',rules:'Drag the otter around your half to strike the gold puck. You can also move with the arrows or WASD and serve with Space. First to five wins. Changing level starts a new match.',best:'Best streak',current:'Win streak',again:'Play again',back:'Back to rink',start:'Face off',pause:'Pause',goal:'Otter scores!',cpuGoal:'Seal scores!',win:'Otter wins!',lose:'Seal wins!',ready:'Drag the otter to shoot. First to five.',live:'Try a bank shot off the side rail.',tip:'Drag or use the arrow keys. First to five.',finish:'Final score',surface:'Air hockey table',loading:'Preparing the rink…',failed:'Rink artwork could not load. Please reload.'},
    ko:{title:'에어하키-1',you:'해달',menu:'설정',settings:'경기 설정',difficulty:'CPU 난이도',levels:['초급','중급','고급'],language:'언어',sound:'타격 효과음',rules:'우리 진영에서 해달을 드래그해 금색 퍽을 치세요. 방향키나 WASD로 움직이고 스페이스바로 시작할 수도 있어요. 먼저 5골을 넣으면 승리해요. 난이도를 바꾸면 새 경기가 시작돼요.',best:'최다 연승',current:'현재 연승',again:'한 판 더',back:'경기로',start:'시작',pause:'일시정지',goal:'해달 득점!',cpuGoal:'물범 득점!',win:'해달 승리!',lose:'물범 승리!',ready:'해달을 드래그해 슛! 먼저 5골을 넣으세요.',live:'옆 벽을 맞혀 뱅크 슛을 노려 보세요.',tip:'드래그나 방향키로 움직이세요. 5골 선승!',finish:'경기 종료',surface:'에어하키 테이블',loading:'경기장 준비 중…',failed:'이미지를 불러올 수 없어요. 새로고침해 주세요.'}
  };
  const storage='floe_airhockey_v1';
  let saved={};
  try{saved=JSON.parse(localStorage.getItem(storage))||{};}catch{}
  const game=AirHockey.makeGame(2,[0,1,2].includes(saved.level)?saved.level:1), s=game.s;
  const stats={current:Number(saved.current)||0,best:Number(saved.best)||0};
  let sound=saved.sound!==false;
  function save(){try{localStorage.setItem(storage,JSON.stringify({...stats,level:s.level,sound}));}catch{}}
  const rink=$('rink'), menu=$('options'), keys=new Set(), lex=()=>strings[ArcadeI18n.getLang()];
  let table, paused=false, pointer=null, audio, lastTone=0;
  function audioReady(){
    if(!sound)return;
    try{audio??=new AudioContext();if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}
  }
  function tone(type,side){
    if(!sound||!audio||audio.state!=='running')return;
    const time=audio.currentTime;
    if(type==='bank'&&time-lastTone<.045)return;
    lastTone=time;
    const goal=type==='goal', f=goal?(side===0?523:392):type==='hit'?620:330;
    const oscillator=audio.createOscillator(), gain=audio.createGain();
    oscillator.type=goal?'triangle':'sine';
    oscillator.frequency.setValueAtTime(f,time);oscillator.frequency.exponentialRampToValueAtTime(goal?f*1.5:f*.38,time+(goal?.20:.07));
    gain.gain.setValueAtTime(.0001,time);gain.gain.exponentialRampToValueAtTime(goal?.14:.095,time+.003);gain.gain.exponentialRampToValueAtTime(.0001,time+(goal?.31:.09));
    oscillator.connect(gain).connect(audio.destination);oscillator.start(time);oscillator.stop(time+(goal?.32:.10));
  }
  function update(){
    const t=lex(), over=s.phase==='over', ready=s.phase==='ready';
    document.title=t.title;
    for(const [id,v] of Object.entries({title:t.title,you:t.you,menuText:t.menu,settingsTitle:t.settings,difficultyText:t.difficulty,languageText:t.language,soundText:t.sound,rules:t.rules,restart:t.again,back:t.back,record:t.current+' '+stats.current+'   ·   '+t.best+' '+stats.best,own:s.score[0],away:s.score[1],action:over?t.again:ready?t.start:t.pause,hint:over?t.finish:ready?(matchMedia('(pointer:coarse)').matches?t.ready:t.tip):t.live})){
      $(id).textContent=v;
    }
    $('language').value=ArcadeI18n.getLang();$('sound').checked=sound;
    [...$('difficulty').options].forEach((option,i)=>option.textContent=t.levels[i]);
    rink.setAttribute('aria-label',t.surface);
    const call=over?(s.lastGoal===0?t.win:t.lose):s.phase==='faceoff'?(s.lastGoal===0?t.goal:t.cpuGoal):'';
    $('notice').hidden=!call;$('notice').textContent=call;
  }
  function event(kind,side){
    table.effect(kind,s);
    if(kind!=='drop')tone(kind,side);
    if(kind==='goal'&&s.phase==='over'){
      stats.current=side===0?stats.current+1:0;stats.best=Math.max(stats.best,stats.current);save();
    }
    if(kind==='goal'||kind==='drop')update();
  }
  function serve(){if(s.phase!=='ready')return;audioReady();game.drop();update();}
  function restart(){
    // Abandoning a live match breaks the current streak. Opening settings alone preserves it.
    if(s.phase==='playing'||s.phase==='faceoff')stats.current=0;
    s.level=Number($('difficulty').value);save();game.reset();table.clear();update();
  }
  function openMenu(){
    if(menu.open)return;
    keys.clear();pointer=null;paused=true;$('difficulty').value=s.level;menu.showModal();
  }
  function action(){
    audioReady();
    if(s.phase==='over'){restart();serve();}
    else if(s.phase==='ready')serve();
    else openMenu();
  }
  $('hint').textContent=lex().loading;$('action').disabled=true;$('menu').disabled=true;
  let art;
  try{
    art=Object.fromEntries(await Promise.all(['otter','seal','puck','fjord'].map(async name=>{
      const img=new Image();img.src='./assets/airhockey/'+name+'.webp';await img.decode();return [name,img];
    })));
  }catch{$('hint').textContent=lex().failed;return;}
  table=createAirTable(rink,art);
  const resize=()=>{game.resize(table.resize());table.draw(s,0,0);};
  resize();new ResizeObserver(resize).observe(rink);
  $('action').disabled=$('menu').disabled=false;
  $('difficulty').value=s.level;
  ArcadeI18n.onChange(update,true);
  const syncTitle=()=>{document.title=lex().title;};
  window.addEventListener('message',e=>{if(e.data?.type==='ARCADE_SET_LANG')syncTitle();});
  window.addEventListener('storage',e=>{if(e.key==='arcade_lang_v1')syncTitle();});
  $('language').onchange=e=>ArcadeI18n.setLang(e.target.value);
  $('sound').onchange=e=>{sound=e.target.checked;audioReady();save();};
  $('menu').onclick=openMenu;$('action').onclick=action;
  $('back').onclick=()=>menu.close();
  $('restart').onclick=()=>{restart();menu.close();serve();};
  menu.addEventListener('close',()=>{
    if(Number($('difficulty').value)!==s.level)restart();
    paused=false;update();rink.focus({preventScroll:true});
  });
  function aim(e){
    const a=rink.getBoundingClientRect(), p=table.inverse(e.clientX-a.left,e.clientY-a.top);
    s.target.x=p.x;s.target.y=p.y;
  }
  rink.addEventListener('pointerdown',e=>{
    if(pointer!==null||paused||e.button!==0||s.phase==='over')return;
    pointer=e.pointerId;rink.setPointerCapture(pointer);rink.focus({preventScroll:true});serve();aim(e);
  });
  rink.addEventListener('pointermove',e=>{if(e.pointerId===pointer)aim(e);});
  rink.addEventListener('lostpointercapture',()=>{pointer=null;});
  const movement=['arrowleft','arrowright','arrowup','arrowdown','a','d','w','s'];
  window.addEventListener('keydown',e=>{
    if(menu.open||e.altKey||e.ctrlKey||e.metaKey)return;
    const key=e.key.toLowerCase();
    if(key==='escape'){openMenu();return;}
    if(key===' ' && (e.target===rink||e.target===document.body)){e.preventDefault();if(!e.repeat)action();return;}
    if(movement.includes(key)){e.preventDefault();keys.add(key);serve();}
  });
  window.addEventListener('keyup',e=>keys.delete(e.key.toLowerCase()));
  window.addEventListener('blur',()=>{keys.clear();pointer=null;});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&(s.phase==='playing'||s.phase==='faceoff'))openMenu();});
  let before=0,acc=0,spin=0;
  function frame(now){
    const dt=Math.min(.05,(now-(before||now))/1000);before=now;
    if(!paused){
      if(keys.size){
        const dx=Number(keys.has('arrowright')||keys.has('d'))-Number(keys.has('arrowleft')||keys.has('a'));
        const dy=Number(keys.has('arrowdown')||keys.has('s'))-Number(keys.has('arrowup')||keys.has('w'));
        const wide=table.bounds().wide;
        s.target.x=s.player.x+(wide?dy:dx)*dt*1.95;s.target.y=s.player.y+(wide?-dx:dy)*dt*1.95;
      }
      acc+=dt;
      while(acc>=AirHockey.STEP){game.step(event);acc-=AirHockey.STEP;}
      if(s.phase==='playing')spin=(spin+dt*(s.puck.vx*2+s.puck.vy*1.3))%(Math.PI*2);
    }
    table.draw(s,paused?0:dt,spin);requestAnimationFrame(frame);
  }
  // Read-only snapshot for accessibility/QA, with positions in visible canvas CSS pixels.
  window.render_game_to_text=()=>JSON.stringify({phase:s.phase,paused,level:s.level,score:s.score,hits:s.hits,banks:s.banks,time:s.time,stats,
    field:table.bounds(),player:table.point(s.player.x,s.player.y),cpu:table.point(s.cpu.x,s.cpu.y),puck:table.point(s.puck.x,s.puck.y)});
  requestAnimationFrame(frame);
})();
