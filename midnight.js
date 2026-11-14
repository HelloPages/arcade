(() => {
  'use strict';
  const E=MidnightEngine,$=id=>document.getElementById(id),params=new URLSearchParams(location.search);
  const KEY='rea-midnight-v1',chapters=[['第一站 · 初行','燈火初上','先找到月亮與時鐘，再讓列車回到月台。'],['第二站 · 夜巡','長廊迴聲','走過更曲折的長廊，找回夜色中的秩序。'],['第三站 · 終點','歸途有光','最後一段路，讓八片光影各就各位。']];
  let saved=null,storage=true;try{saved=JSON.parse(localStorage.getItem(KEY));}catch(e){storage=false;}
  let best=Array.isArray(saved?.best)?saved.best.map(x=>Number.isInteger(x)&&x>=0?x:null):[null,null,null];
  let state={board:E.GOAL,level:0,moves:0,history:[],hints:0,seed:Number(params.get('seed'))||Date.now()>>>0,mode:'cover'},selected=0,numbers=true,hinted=null,worker=null,requestBoard=null,loaded=false,lastFocus=null;
  const events=[];function record(type,extra={}){events.push({type,at:Math.round(performance.now()),...extra});if(events.length>3000)events.shift();}
  function say(text){$('status').textContent=text;}
  function save(){try{const active=state.mode!=='cover'&&state.mode!=='won'?{...state,mode:'paused'}:null;localStorage.setItem(KEY,JSON.stringify({best,active}));}catch(e){storage=false;}$('save-status').textContent=storage?'進度自動保存在此瀏覽器':'無法保存進度；仍可在此頁繼續遊玩';}
  let suppressClickUntil=0;
  const tiles=[];for(let n=1;n<=8;n++){const b=document.createElement('button');b.className='tile';b.dataset.tile=n;b.innerHTML='<span>'+n+'</span>';b.style.backgroundPosition=((n-1)%3*50)+'% '+(Math.floor((n-1)/3)*50)+'%';b.onclick=()=>{if(performance.now()>suppressClickUntil)move(n);};$('board').append(b);tiles.push(b);}
  const gap=document.createElement('div');gap.className='gap-label';gap.textContent='空格';$('board').append(gap);
  function paint(){
    const z=state.board.indexOf('0'),can=E.adjacent(z);tiles.forEach((b,i)=>{const pos=state.board.indexOf(String(i+1)),ok=can.includes(pos);
      b.style.left=`calc(${pos%3} * (100% / 3))`;b.style.top=`calc(${Math.floor(pos/3)} * (100% / 3))`;
      b.classList.toggle('movable',ok);b.classList.toggle('hinted',hinted===i+1);b.setAttribute('aria-label',`第 ${i+1} 片${ok?'，可移動':'，不在空格旁'}`);b.setAttribute('aria-disabled',String(!ok||state.mode!=='playing'));
    });gap.style.left=(z%3*100/3)+'%';gap.style.top=(Math.floor(z/3)*100/3)+'%';$('board').classList.toggle('no-numbers',!numbers);$('board').classList.toggle('complete',state.board===E.GOAL);
    $('moves').textContent=String(state.moves).padStart(3,'0');$('placed').textContent=state.board.split('').filter((x,i)=>x!=='0'&&+x===i+1).length+' / 8';$('best').textContent=best[state.level]??'—';
    $('undo').disabled=!state.history.length;$('hint').disabled=!!requestBoard;const c=chapters[state.level];$('chapter-label').textContent=c[0];$('chapter-title').textContent=c[1];$('chapter-story').textContent=c[2];
  }
  function openModal(kicker,title,text,actions,reference=false){lastFocus=document.activeElement;$('dialog-kicker').textContent=kicker;$('dialog-title').textContent=title;$('dialog-text').textContent=text;$('reference-image').hidden=!reference;$('dialog-actions').replaceChildren();for(const [label,fn] of actions){const b=document.createElement('button');b.textContent=label;b.onclick=()=>{closeModal();fn();};$('dialog-actions').append(b);}if(!$('modal').open)$('modal').showModal();}
  function closeModal(){if($('modal').open)$('modal').close();if(lastFocus?.isConnected)lastFocus.focus();}
  function cancelHint(){requestBoard=null;if(worker){worker.terminate();worker=null;}hinted=null;}
  function start(level=selected,restore=null){cancelHint();if(restore)state={...restore,mode:'playing'};else{state={board:E.shuffle(state.seed+level*104729,level),level,moves:0,history:[],hints:0,seed:state.seed,mode:'playing'};}
    $('cover').hidden=true;$('journey').hidden=false;$('board').classList.add('instant');paint();void $('board').offsetWidth;$('board').classList.remove('instant');say('點擊空格旁的亮角圖塊。目標是 1–8 排好、空格在右下。');record('start',{level:state.level,board:state.board});save();$('pause').focus();}
  function move(n){if(state.mode!=='playing')return false;const i=state.board.indexOf(String(n)),z=state.board.indexOf('0');if(!E.adjacent(z).includes(i)){say('這片還不能移動，請選空格旁的亮角圖塊。');record('invalid',{tile:n});return false;}
    state.history.push(state.board);state.board=E.swap(state.board,i,z);state.moves++;hinted=null;record('move',{tile:n,board:state.board});paint();say('已移動第 '+n+' 片。'+(state.board===E.GOAL?'月台影像完成。':'繼續讓圖塊歸位。'));
    if(state.board===E.GOAL){state.mode='won';best[state.level]=Math.min(best[state.level]??Infinity,state.moves);paint();save();record('win',{level:state.level,moves:state.moves,hints:state.hints});
      const final=state.level===2;openModal('車票已驗印 · '+String(state.level+1).padStart(2,'0'),final?'旅程圓滿抵達':'月台，重新完整',`以 ${state.moves} 步拼回月台，使用 ${state.hints} 次提示。${final?'午夜特快即將啟程，謝謝你陪這一夜走到終點。':'下一段旅程將有更深的打散，仍然沒有時間壓力。'}`,
      [[final?'再訪第一站':'前往下一站',()=>{state.seed++;start(final?0:state.level+1);} ],['回車站',home]],true);
    }else save();return true;
  }
  function undo(){if(state.mode!=='playing'||!state.history.length)return;state.board=state.history.pop();state.moves=Math.max(0,state.moves-1);hinted=null;record('undo');paint();save();say('已復原上一步，可以重新選擇。');}
  function resume(){state.mode='playing';paint();say('列車仍在等你。繼續拼回月台。');record('resume');save();}
  function pause(){if(state.mode!=='playing')return;state.mode='paused';paint();save();record('pause');openModal('列車暫候','歇一會，再出發','拼圖與步數已保留，沒有倒數。', [['繼續旅程',resume],['回車站',home]]);}
  function home(){cancelHint();if(state.mode==='playing'||state.mode==='paused'){state.mode='paused';save();saved={best,active:JSON.parse(JSON.stringify(state))};$('resume-save').hidden=false;}else{$('resume-save').hidden=true;}state.mode='cover';$('journey').hidden=true;$('cover').hidden=false;$('start').focus();record('home');}
  $('start').onclick=()=>{if(loaded)start();};
  document.querySelectorAll('[data-level]').forEach(b=>b.onclick=()=>{selected=+b.dataset.level;document.querySelectorAll('[data-level]').forEach(x=>x.classList.toggle('selected',x===b));});
  $('resume-save').onclick=()=>{if(saved?.active)start(saved.active.level,saved.active);};$('undo').onclick=undo;$('pause').onclick=pause;$('home').onclick=home;
  $('restart').onclick=()=>{if(state.mode!=='playing')return;state.mode='paused';paint();openModal('本站重新排列','換一張車票？','這局步數會重新計算，最佳紀錄仍保留。',[['重新排列',()=>{state.seed++;start(state.level);}],['保留這局',resume]]);};
  $('reference').onclick=()=>{if(state.mode!=='playing')return;state.mode='reference';paint();openModal('月台全景','原圖對照','月亮在左上、時鐘在右上，列車佔據右下方。拼完時右下仍留空格。',[['回到拼圖',resume]],true);};
  $('numbers').onclick=()=>{numbers=!numbers;$('numbers').textContent='數字：'+(numbers?'開':'關');$('numbers').setAttribute('aria-pressed',String(numbers));paint();};
  $('hint').onclick=()=>{if(state.mode!=='playing'||requestBoard)return;requestBoard=state.board;paint();say('車站正在查閱下一步…');
    try{worker??=new Worker('midnight-worker.js');worker.onmessage=({data})=>{requestBoard=null;if(data.board===state.board&&data.path?.length){hinted=data.path[0];state.hints++;record('hint',{tile:hinted});paint();say('下一步：移動第 '+hinted+' 片（虛線框）。提示不會替你移動。');save();}else{paint();say('局面已改變，請再按提示。');}};worker.onerror=()=>{cancelHint();paint();say('提示暫時無法載入。可用復原，或重新排列。');};worker.postMessage({board:state.board});}catch(e){cancelHint();paint();say('此瀏覽器無法使用提示，可用復原或重新排列。');}
  };
  $('modal').addEventListener('cancel',e=>{e.preventDefault();if(state.mode==='won')return;closeModal();resume();});
  document.addEventListener('keydown',e=>{if(e.target.closest('button,a,summary')&&['Enter',' '].includes(e.key))return;if($('modal').open)return;if(e.key.toLowerCase()==='p'){e.preventDefault();pause();return;}if(state.mode!=='playing')return;const k=e.key.toLowerCase();if(k==='z'){e.preventDefault();undo();}else if(k==='h'){e.preventDefault();$('hint').click();}else if(e.key.startsWith('Arrow')){e.preventDefault();const z=state.board.indexOf('0'),offset={ArrowUp:3,ArrowDown:-3,ArrowLeft:1,ArrowRight:-1}[e.key],i=z+offset;if(E.adjacent(z).includes(i))move(+state.board[i]);}});
  let drag=null;$('board').addEventListener('pointerdown',e=>{if(state.mode!=='playing')return;const tile=e.target.closest('[data-tile]');if(tile)drag={x:e.clientX,y:e.clientY,n:+tile.dataset.tile};});
  $('board').addEventListener('pointerup',e=>{if(!drag)return;const d=drag;drag=null;const dx=e.clientX-d.x,dy=e.clientY-d.y;if(Math.hypot(dx,dy)<22)return;suppressClickUntil=performance.now()+400;const i=state.board.indexOf(String(d.n)),z=state.board.indexOf('0'),horizontal=Math.abs(dx)>Math.abs(dy);if(E.adjacent(z).includes(i)&&(horizontal?Math.sign(dx)===Math.sign(z%3-i%3)&&(z/3|0)===(i/3|0):Math.sign(dy)===Math.sign((z/3|0)-(i/3|0))&&z%3===i%3)){e.preventDefault();move(d.n);}});
  $('board').addEventListener('pointercancel',()=>drag=null);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&state.mode==='playing')pause();});
  if(params.get('embed')==='1')$('fullscreen').hidden=true;
  $('fullscreen').onclick=()=>{if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else document.documentElement.requestFullscreen?.().catch(()=>say('此瀏覽器不支援全螢幕，仍可正常遊玩。'));};
  const active=saved?.active;
  if(active&&E.solvable(active.board)&&active.board!==E.GOAL&&Number.isInteger(active.level)&&active.level>=0&&active.level<=2&&Number.isInteger(active.moves)&&active.moves>=0&&Array.isArray(active.history)&&active.history.length<=10000&&active.history.every(E.solvable)&&Number.isFinite(active.seed)&&Number.isFinite(active.hints))$('resume-save').hidden=false;else if(saved)saved.active=null;
  Promise.all(['assets/midnight-scene.webp','assets/midnight-cover.webp'].map(src=>{const i=new Image();i.src=src;return i.decode();})).then(()=>{loaded=true;$('start').disabled=false;$('start').textContent='領取車票，開始旅程';$('load-status').textContent='不倒數、不催促。每個局面都有解。';}).catch(()=>{$('load-status').textContent='版畫載入失敗，請重新載入頁面後再試。';});
  // Read-only observability: no way to inject state, score or completion.
  window.render_game_to_text=()=>JSON.stringify({...state,historyLength:state.history.length,history:undefined,best:[...best],hinted,numbers,loaded,events:events.slice(-30)});
  record('ready');
})();
