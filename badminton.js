(() => {
  'use strict';
  const copy={
    tw:{title:'羽球-1',you:'你',menu:'暫停',break:'場邊休息',opponent:'對手',again:'再來一局',resume:'繼續',clear:'高遠球',drop:'小球',smash:'跳殺',dive:'飛身救球',serve:'發球',ready:'先拿7分，領先2分獲勝',tipsP:'你在近場。上下拖曳跑位，點下方按鈕擊球。',tipsL:'你在左場。拖曳或按← →跑位，Z高遠球、X小球、C跳殺。',pServe:'換你發球',cServe:'CPU發球',win:'你贏了！',lose:'CPU獲勝',match:'連勝',best:'最佳',rally:'最長回合',speed:'最快殺球',on:'音效：開',off:'音效：關',net:'掛網',floor:'落地得分',out:'出界',near:'往網前',far:'退後場',left:'往左',right:'往右',court:'羽球場',levels:['校隊新秀','甲組主將','球館教練']},
    en:{title:'Badminton 1',you:'You',menu:'Pause',break:'Courtside',opponent:'Opponent',again:'Rematch',resume:'Resume',clear:'Clear',drop:'Drop',smash:'Smash',dive:'Dive save',serve:'Serve',ready:'First to 7 · win by 2',tipsP:'You play the near end. Drag up or down to move, then tap a shot.',tipsL:'You play on the left. Drag or use ← → to move. Z: clear, X: drop, C: smash.',pServe:'Your serve',cServe:'CPU serves',win:'You win!',lose:'CPU wins',match:'Streak',best:'Best',rally:'Longest rally',speed:'Top smash',on:'Sound: on',off:'Sound: off',net:'Into the net',floor:'Shuttle down',out:'Out',near:'Move to net',far:'Move back',left:'Move left',right:'Move right',court:'Badminton court',levels:['Club rookie','League ace','Head coach']},
    ko:{title:'배드민턴-1',you:'나',menu:'일시정지',break:'작전 타임',opponent:'상대',again:'다시 한 판',resume:'계속하기',clear:'클리어',drop:'드롭',smash:'스매시',dive:'다이빙 수비',serve:'서브',ready:'7점 선취 · 2점 차 승리',tipsP:'아래쪽이 내 코트예요. 위아래로 드래그해 이동하고 버튼을 눌러 치세요.',tipsL:'왼쪽이 내 코트예요. 드래그하거나 ← →로 이동하세요. Z 클리어, X 드롭, C 스매시.',pServe:'내 서브',cServe:'CPU 서브',win:'이겼어요!',lose:'CPU 승리',match:'연승',best:'최고',rally:'최장 랠리',speed:'최고 스매시',on:'효과음 켜짐',off:'효과음 꺼짐',net:'네트에 걸렸어요',floor:'셔틀콕 착지',out:'아웃',near:'네트 쪽으로',far:'뒤쪽으로',left:'왼쪽으로',right:'오른쪽으로',court:'배드민턴 코트',levels:['동호회 신입','리그 에이스','전담 코치']}
  };
  const get=id=>document.getElementById(id), canvas=get('court'),renderer=mapleRenderer(canvas),dialog=get('settings'),selector=get('level'),keys=new Set(),directions=new Map(),charges=new Map();
  const saveKey='maple-hall-singles-v1'; let saved={level:0,streak:0,best:0,sound:true};
  try{const data=JSON.parse(localStorage.getItem(saveKey));if(data){for(const key of ['streak','best'])if(Number.isInteger(data[key])&&data[key]>=0)saved[key]=data[key];if([0,1,2].includes(data.level))saved.level=data.level;if(typeof data.sound==='boolean')saved.sound=data.sound;}}catch{}
  const save=()=>{try{localStorage.setItem(saveKey,JSON.stringify(saved));}catch{}};
  let game=MapleMatch.match(saved.level),audio,noise,lastTime=0,accum=0,event=-1,overRecorded=false,noticeUntil=0,signature='',dragId=null;
  let words=copy[ArcadeI18n.getLang()]; selector.value=String(saved.level);
  const snap=()=>{const state=game.state;return {phase:state.phase,paused:dialog.open,score:[...state.score],server:state.server,level:state.level,turn:state.turn,rally:state.rally,maxRally:state.maxRally,peak:state.peak,clock:state.clock,ball:state.ball?{...state.ball}:null,landing:state.aim,player:state.player.x,cpu:state.cpu.x,shot:state.lastShot,lastSide:state.lastSide,event:state.event,streak:saved.streak,coords:'depth 0=player baseline, 0.5=net, 1=CPU baseline; height above floor'};};
  window.render_game_to_text=()=>JSON.stringify(snap());
  function initAudio(){if(!saved.sound)return;try{if(!audio){audio=new AudioContext();noise=audio.createBuffer(1,Math.floor(audio.sampleRate*.075),audio.sampleRate);const samples=noise.getChannelData(0);for(let index=0;index<samples.length;index++)samples[index]=(Math.random()*2-1)*(1-index/samples.length)**3;}if(audio.state==='suspended')audio.resume().catch(()=>{});}catch{}}
  function hitSound(){if(!saved.sound||!audio||!noise||audio.state!=='running')return;const source=audio.createBufferSource(),gain=audio.createGain(),filter=audio.createBiquadFilter();filter.type='bandpass';filter.frequency.value=game.state.lastShot==='smash'?2100:1250;gain.gain.value=.47;source.buffer=noise;source.connect(filter).connect(gain).connect(audio.destination);source.start();}
  function reset(){if(game.state.phase!=='over' && (game.state.score.some(Boolean)||game.state.phase==='play'))saved.streak=0;saved.level=Number(selector.value);save();game=MapleMatch.match(saved.level);event=-1;overRecorded=false;noticeUntil=0;accum=0;signature='';if(dialog.open)dialog.close();update();}
  function start(){initAudio();if(game.state.phase==='over')reset();else game.serve();update();}
  function buttons(){const portrait=renderer.portrait();for(const button of document.querySelectorAll('[data-step]')){const back=button.dataset.step==='-1';button.textContent=portrait?(back?'▼':'▲'):(back?'◀':'▶');button.ariaLabel=words[portrait?(back?'far':'near'):(back?'left':'right')];}canvas.ariaLabel=words.court;}
  function update(force=false){const state=game.state;
    if(document.title!==words.title)document.title=words.title;
    if(event!==state.event){event=state.event;noticeUntil=state.clock+.56;if(state.phase==='play')hitSound();}
    if(state.phase==='over'&&!overRecorded){overRecorded=true;saved.streak=state.winner===0?saved.streak+1:0;saved.best=Math.max(saved.best,saved.streak);save();}
    const key=[ArcadeI18n.getLang(),state.phase,event,state.clock<noticeUntil,dialog.open,saved.sound,renderer.portrait()].join('/');if(!force&&signature===key)return;signature=key;
    get('playerScore').textContent=state.score[0];get('cpuScore').textContent=state.score[1];const first=state.score[0]+state.score[1]===0;
    get('prompt').hidden=!(state.phase==='over'||(state.phase==='serve'&&!state.server));
    get('headline').textContent=state.phase==='over'?words[state.winner===0?'win':'lose']:first?words.ready:words.pServe;
    get('detail').textContent=state.phase==='over'?`${state.score.join(' : ')} · ${words.rally} ${state.maxRally} · ${words.match} ${saved.streak}`:words[renderer.portrait()?'tipsP':'tipsL'];
    get('serve').textContent=state.phase==='over'?words.again:words.serve;
    get('call').textContent=state.phase==='point'?`${state.winner===0?words.you:'CPU'} +1 · ${words[state.label]}`:state.phase==='serve'&&state.server?words.cServe:state.phase==='play'&&state.clock<noticeUntil?`${words[state.label]} · ${state.rally}`:'';
    get('records').textContent=`${words.match} ${saved.streak} · ${words.best} ${saved.best} · ${words.rally} ${state.maxRally} · ${words.speed} ${state.peak} km/h`;
    get('audio').textContent=words[saved.sound?'on':'off'];buttons();}
  function localize(lang){words=copy[lang]||copy.tw;document.title=words.title;document.querySelectorAll('[data-copy]').forEach(item=>item.textContent=words[item.dataset.copy]);document.querySelectorAll('[data-shot]').forEach(item=>item.textContent=words[item.dataset.shot]);Array.from(selector.options).forEach((option,index)=>option.textContent=words.levels[index]);update(true);}
  function releaseAll(){keys.clear();directions.clear();charges.clear();dragId=null;document.querySelectorAll('.down').forEach(element=>element.classList.remove('down'));}
  function pause(){releaseAll();if(!dialog.open){selector.value=String(game.state.level);dialog.showModal();}update(true);}
  get('pause').onclick=pause;get('serve').onclick=start;get('audio').onclick=()=>{saved.sound=!saved.sound;initAudio();save();update(true);};get('restart').onclick=reset;selector.onchange=reset;
  dialog.addEventListener('close',()=>{lastTime=0;accum=0;canvas.focus({preventScroll:true});});window.addEventListener('blur',releaseAll);document.addEventListener('visibilitychange',()=>{if(document.hidden && game.state.phase==='play')pause();});
  function strike(kind,charge){initAudio();if(!dialog.open)game.input(kind,charge);update();}
  document.querySelectorAll('nav button').forEach(button=>{
    const end=(evt,cancel)=>{directions.delete(evt.pointerId);button.classList.remove('down');const down=charges.get(evt.pointerId);charges.delete(evt.pointerId);if(down&&!cancel)strike(button.dataset.shot,Math.min(1,(performance.now()-down)/410));};
    button.onpointerdown=evt=>{evt.preventDefault();initAudio();button.setPointerCapture(evt.pointerId);button.classList.add('down');if(button.dataset.step)directions.set(evt.pointerId,Number(button.dataset.step));else charges.set(evt.pointerId,performance.now());};button.onpointerup=evt=>end(evt,false);button.onpointercancel=evt=>end(evt,true);
    button.onclick=evt=>{if(evt.detail===0){if(button.dataset.shot)strike(button.dataset.shot,0);else game.target(game.state.player.x+Number(button.dataset.step)*.075);}};
  });
  const drag=evt=>{const rect=canvas.getBoundingClientRect();game.target(renderer.depth(evt.clientX-rect.left,evt.clientY-rect.top));};
  canvas.onpointerdown=evt=>{initAudio();canvas.focus();dragId=evt.pointerId;canvas.setPointerCapture(dragId);if(game.state.phase==='serve')start();else drag(evt);};canvas.onpointermove=evt=>{if(evt.pointerId===dragId)drag(evt);};canvas.onpointerup=canvas.onpointercancel=()=>{dragId=null;};
  const shotKeys={KeyZ:'clear',KeyX:'drop',KeyC:'smash'};
  window.addEventListener('keydown',evt=>{if(evt.code==='KeyP'&&!evt.repeat){evt.preventDefault();dialog.open?dialog.close():pause();return;}if(dialog.open||!(evt.code.startsWith('Arrow')||evt.code in shotKeys||evt.code==='Space'))return;evt.preventDefault();keys.add(evt.code);if(evt.repeat)return;if(evt.code==='Space')game.state.phase==='play'?strike('clear',0):start();else if(shotKeys[evt.code])strike(shotKeys[evt.code],0);});window.addEventListener('keyup',evt=>keys.delete(evt.code));
  ArcadeI18n.onChange(localize,true);
  function frame(now){const elapsed=lastTime?Math.min(.065,(now-lastTime)/1000):0;lastTime=now;if(!dialog.open){accum+=elapsed;const axis=Math.sign([...directions.values()].reduce((sum,dir)=>sum+dir,0)+Number(keys.has('ArrowRight')||keys.has('ArrowUp'))-Number(keys.has('ArrowLeft')||keys.has('ArrowDown')));while(accum>=MapleMatch.tick){game.step(MapleMatch.tick,axis);accum-=MapleMatch.tick;}}renderer.draw(game.state);update();requestAnimationFrame(frame);}requestAnimationFrame(frame);
})();
