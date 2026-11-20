(() => {
  'use strict';
  const engine = window.Solar;
  const node = name => document.getElementById(name);
  const canvas = node('battlefield');
  const paint = canvas.getContext('2d', { alpha: false });
  const cover = node('cover');
  const modal = node('modal');
  const controls = node('controls');
  const embedded = new URLSearchParams(location.search).get('embed') === '1';
  const touch = matchMedia('(pointer: coarse)');
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const keys = new Set();
  const fingers = new Map();
  const buffered = new Map();
  const sprites = Object.fromEntries(['desert', 'run-a', 'run-b', 'jump', 'walker', 'drone', 'boss'].map(name => {
    const image = new Image(); image.src = `assets/solar-${name}.webp`; return [name, image];
  }));
  const sections = ['01 / 03　越過鹽原', '02 / 03　突破輸電線', '日爐守衛・震波', '日爐守衛・散射', '日爐守衛・過載'];
  let armorHTML = '';
  for (let index = 0; index < engine.armor; index++) armorHTML += '<i></i>';
  node('hearts').innerHTML = armorHTML;
  const armorPips = [...node('hearts').children];
  let mode = 'cover', scale = 1, width = 390, height = 800, deck = 630, ratio = 1;
  let game, particles = [], last = 0, carry = 0, shake = 0, muted = true, audio, best = 0;
  let previousHUD = '', first = 0, lastCost = 0;
  try { best = Number(localStorage.getItem('rea-solar-record-v1')) || 0; } catch { best = 0; }

  function resize() {
    const bounds = canvas.getBoundingClientRect();
    ratio = Math.min(1.65, devicePixelRatio || 1);
    canvas.width = Math.round(bounds.width * ratio);
    canvas.height = Math.round(bounds.height * ratio);
    scale = Math.min(1.35, Math.max(.82, bounds.height / 780), bounds.width / 358);
    width = bounds.width / scale;
    height = bounds.height / scale;
    deck = height - ((touch.matches || bounds.width < 620) ? 108 : 80) / scale;
    if (game) {
      const stretch = width / game.width;
      for (const body of [game.player, game.boss, ...game.enemies, ...game.rounds, ...game.foes]) if (body) body.x *= stretch;
      game.width = width;
    }
    if (mode === 'playing' || mode === 'pause') controls.hidden = !(touch.matches || bounds.width < 620);
    draw();
  }

  function sound(type) {
    if (muted || !audio || audio.state !== 'running') return;
    const tone = { shot: [280, 100, .05, .024], hit: [182, 110, .045, .035], dash: [95, 390, .15, .085],
      jump: [145, 300, .11, .055], boom: [102, 29, .26, .16], damage: [165, 42, .23, .13], alarm: [230, 510, .33, .09] }[type];
    if (!tone) return;
    const time = audio.currentTime;
    const voice = audio.createOscillator();
    const gain = audio.createGain();
    voice.type = type === 'shot' || type === 'hit' ? 'triangle' : 'sawtooth';
    voice.frequency.setValueAtTime(tone[0], time);
    voice.frequency.exponentialRampToValueAtTime(tone[1], time + tone[2]);
    gain.gain.setValueAtTime(tone[3], time);
    gain.gain.exponentialRampToValueAtTime(.0001, time + tone[2]);
    voice.connect(gain).connect(audio.destination);
    voice.start(time); voice.stop(time + tone[2]);
  }

  function clearInputs() {
    keys.clear(); fingers.clear(); buffered.clear();
    controls.querySelectorAll('.held').forEach(button => button.classList.remove('held'));
  }

  function start() {
    clearInputs(); game = engine.create(width); particles = []; carry = shake = 0; previousHUD = '';
    mode = 'playing'; first = performance.now(); cover.hidden = modal.hidden = true;
    resize(); updateHUD(); node('pause').focus({ preventScroll: true }); node('pause').blur();
  }

  function showResult(next) {
    mode = next; clearInputs(); controls.hidden = true; modal.hidden = false;
    const paused = next === 'pause';
    if (!paused && game.score > best) {
      best = game.score;
      try { localStorage.setItem('rea-solar-record-v1', String(best)); } catch { }
    }
    node('result-kicker').textContent = paused ? '西境輸電線' : '任務結算';
    node('result-title').textContent = paused ? '任務暫停' : next === 'won' ? '日爐已熄火' : '裝甲耗盡';
    node('result-text').textContent = paused ? '方向鍵移動，空白鍵跳躍，Z或Shift衝刺。' : `本次戰績 ${game.score.toLocaleString('zh-TW')}\n最高戰績 ${best.toLocaleString('zh-TW')}`;
    node('resume').textContent = paused ? '繼續出擊' : '再打一場';
    node('resume').focus({ preventScroll: true });
  }

  function togglePause() {
    if (mode === 'playing') showResult('pause');
    else if (mode === 'pause') {
      clearInputs(); mode = 'playing'; modal.hidden = true; carry = 0; resize(); node('pause').blur();
    }
  }

  node('start').onclick = start;
  node('pause').onclick = togglePause;
  node('resume').onclick = () => mode === 'pause' ? togglePause() : start();
  node('return').onclick = () => { mode = 'cover'; modal.hidden = true; cover.hidden = false; node('start').focus(); };
  node('fullscreen').hidden = embedded || !document.fullscreenEnabled;
  node('fullscreen').onclick = () => {
    const action = document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen();
    action.catch(() => {});
  };
  node('audio').onclick = async () => {
    if (muted && !audio && window.AudioContext) audio = new AudioContext();
    if (!audio) return;
    try {
      if (muted) await audio.resume();
      else await audio.suspend();
      muted = audio.state !== 'running';
      node('audio').textContent = muted ? '音效關' : '音效開';
      node('audio').setAttribute('aria-pressed', String(!muted));
      if (!muted) sound('dash');
    } catch { }
  };
  const keyMap = { ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right', ArrowUp: 'jump', Space: 'jump', KeyW: 'jump', KeyZ: 'dash', ShiftLeft: 'dash', ShiftRight: 'dash' };
  window.addEventListener('keydown', event => {
    if (event.code === 'Escape' || event.code === 'KeyP') { if (!event.repeat) togglePause(); return; }
    if (mode === 'cover' && event.code === 'Enter' && event.target === document.body) { start(); return; }
    if (mode !== 'playing' || !keyMap[event.code]) return;
    if (event.target instanceof HTMLButtonElement && event.code === 'Space') return;
    event.preventDefault(); keys.add(event.code);
    if (!event.repeat) buffer(keyMap[event.code]);
  });
  window.addEventListener('keyup', event => keys.delete(event.code));
  window.addEventListener('blur', clearInputs);
  document.addEventListener('visibilitychange', () => { if (document.hidden && mode === 'playing') showResult('pause'); });
  function buffer(name) {
    if (name === 'jump' || name === 'dash') buffered.set(name, performance.now() + 90);
  }
  for (const button of controls.querySelectorAll('[data-input]')) {
    button.addEventListener('pointerdown', event => {
      if (mode !== 'playing') return;
      button.setPointerCapture(event.pointerId);
      fingers.set(event.pointerId, button.dataset.input); buffer(button.dataset.input); button.classList.add('held'); event.preventDefault();
    });
    for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) button.addEventListener(type, event => {
      fingers.delete(event.pointerId);
      if (![...fingers.values()].includes(button.dataset.input)) button.classList.remove('held');
    });
    button.addEventListener('keydown', event => {
      if (!['Space', 'Enter'].includes(event.code)) return;
      event.preventDefault(); event.stopPropagation(); fingers.set(button, button.dataset.input);
      if (!event.repeat) buffer(button.dataset.input);
    });
    button.addEventListener('keyup', () => fingers.delete(button));
    button.addEventListener('blur', () => fingers.delete(button));
  }

  function updateHUD() {
    const section = game.boss ? game.phase + 1 : game.phase - 1;
    const status = `${game.health}/${game.score}/${game.streak}/${section}`;
    if (status !== previousHUD) {
      previousHUD = status;
      armorPips.forEach((pip, index) => pip.classList.toggle('empty', index >= game.health));
      node('hearts').setAttribute('aria-label', `裝甲${game.health}格`);
      node('score').textContent = String(game.score).padStart(6, '0');
      node('combo').textContent = game.streak > 1 ? `${game.streak}連擊` : '';
      node('section').textContent = sections[section];
    }
    node('progress').value = game.boss ? Math.max(0, game.boss.hp / engine.bossArmor) : game.time / engine.duration;
  }

  function sprite(name, x, y, size, flip = false, opacity = 1) {
    const image = sprites[name];
    if (!image.complete || !image.naturalWidth) return;
    const breadth = size * image.naturalWidth / image.naturalHeight;
    paint.save(); paint.globalAlpha = opacity;
    paint.translate(x, y); if (flip) paint.scale(-1, 1);
    paint.drawImage(image, -breadth / 2, -size, breadth, size); paint.restore();
  }

  function line(x1, y1, x2, y2, color, weight = 1) {
    paint.strokeStyle = color; paint.lineWidth = weight; paint.beginPath(); paint.moveTo(x1, y1); paint.lineTo(x2, y2); paint.stroke();
  }

  function rect(x, y, wide, tall, color) { paint.fillStyle = color; paint.fillRect(x, y, wide, tall); }

  function environment(distance) {
    const backdrop = sprites.desert;
    rect(0, 0, width, height, '#d8836b');
    if (backdrop.complete && backdrop.naturalWidth) {
      const base = Math.max(width / backdrop.naturalWidth, height / backdrop.naturalHeight) * 1.035;
      const frameWidth = backdrop.naturalWidth * base, frameHeight = backdrop.naturalHeight * base;
      const drift = Math.sin(distance / 1600) * Math.min(135, (frameWidth - width) * .46);
      paint.drawImage(backdrop, (width - frameWidth) * .5 - drift, (height - frameHeight) * .5, frameWidth, frameHeight);
    }
    const offset = (distance * .94) % 104;
    rect(0, deck - 5, width, 11, '#432f29');
    rect(0, deck - 4, width, 4, '#ffcd78');
    rect(0, deck + 6, width, 15, '#ab563a');
    rect(0, deck + 21, width, 4, '#3e3630');
    rect(0, deck + 25, width, 13, '#b86847');
    rect(0, deck + 38, width, 5, '#6e3e31');
    for (let post = -104 - offset; post < width + 104; post += 104) {
      rect(post, deck + 2, 63, 3, '#ef9f64');
      rect(post + 69, deck + 7, 14, 14, '#493730');
      for (let slot = 0; slot < 4; slot++) rect(post + 15 + slot * 8, deck + 29, 5, 4, '#52372e');
      line(post + 70, deck + 42, post + 36, height, '#633c32', 5);
      line(post + 76, deck + 42, post + 59, height, '#e29465', 3);
    }
    rect(0, height - 79 / scale, width, 79 / scale, '#3c2b2455');
  }

  function draw() {
    if (!canvas.width) return;
    const factor = ratio * scale;
    paint.setTransform(factor, 0, 0, factor, 0, 0);
    environment(game?.distance || 0);
    if (!game) return;
    const offset = reduced.matches ? 0 : Math.sin(game.time * 160) * shake;
    paint.translate(offset, 0);
    for (const round of game.foes) {
      if (round.kind === 'strike') {
        const active = round.age > .72;
        rect(round.x - 27, deck - (active ? 207 : 9), 54, active ? 207 : 9, active ? '#ae2d2bcc' : '#c9372a99');
        for (let stripe = -24; stripe < 23; stripe += 12) line(round.x + stripe, deck - 5, round.x + stripe + 8, deck - 13, '#ffe487', 3);
      } else if (round.kind === 'wave') {
        line(round.x - 14, deck - 4, round.x, deck - 39, '#7f201d', 7);
        line(round.x, deck - 39, round.x + 14, deck - 4, '#ffe4a7', 4);
      } else {
        line(round.x - round.vx * .036, deck - round.y + round.vy * .036, round.x, deck - round.y, '#812a23', 7);
        line(round.x - round.vx * .02, deck - round.y + round.vy * .02, round.x, deck - round.y, '#ffd259', 3);
      }
    }
    for (const opponent of game.boss ? [game.boss] : game.enemies) {
      if (opponent.hp <= 0) continue;
      const boss = opponent.kind === 'boss';
      const down = boss ? (game.phase === 2 ? opponent.y - 50 : 0) : opponent.kind === 'walker' ? Math.sin(opponent.age * 23) * 3 : opponent.y - 16;
      sprite(opponent.kind, opponent.x, deck - down, boss ? 166 : opponent.kind === 'walker' ? 61 : 43, false, opponent.flash > 0 ? .74 : 1);
      if (boss && opponent.fire < .36) {
        const ray = 12 + Math.sin(opponent.age * 30) * 4;
        line(opponent.x - 30 - ray, deck - 100 - down, opponent.x - 30 + ray, deck - 100 - down, '#fff2b1', 5);
        line(opponent.x - 30, deck - 100 - down - ray, opponent.x - 30, deck - 100 - down + ray, '#f57538', 3);
      }
    }
    const pilot = game.player;
    const pose = pilot.y > 1 ? 'jump' : Math.floor(game.time * 13) % 2 ? 'run-a' : 'run-b';
    if (pilot.dash > 0 && !reduced.matches) {
      sprite(pose, pilot.x - pilot.facing * 56, deck - pilot.y, 64, pilot.facing < 0, .25);
      sprite(pose, pilot.x - pilot.facing * 32, deck - pilot.y, 64, pilot.facing < 0, .54);
    }
    if (pilot.grace <= 0 || reduced.matches || Math.floor(game.time * 17) % 2) sprite(pose, pilot.x, deck - pilot.y, 65, (pilot.dash > 0 ? pilot.facing : pilot.aim || pilot.facing) < 0);
    for (const round of game.rounds) {
      const tail = round.x - Math.sign(round.vx) * (round.charged ? 28 : 14);
      line(tail, deck - round.y, round.x, deck - round.y, '#284b47', round.charged ? 8 : 4);
      line(tail, deck - round.y, round.x, deck - round.y, '#e8ffe0', round.charged ? 5 : 2);
    }
    for (const spark of particles) {
      paint.globalAlpha = Math.min(1, spark.life * 5);
      line(spark.x - spark.vx * .025, deck - spark.y + spark.vy * .025, spark.x, deck - spark.y, spark.color, spark.size);
    }
    paint.globalAlpha = 1;
  }

  function effects(delta) {
    const effects = { shot: [2, 165, .09], hit: [6, 190, .18], jump: [7, 80, .23], dash: [13, 190, .31],
      boom: [29, 255, .48], damage: [18, 205, .34], alarm: [17, 160, .45], burst: [10, 160, .18] };
    for (const event of game.events.splice(0)) {
      sound(event.type);
      const [count, velocity, life] = effects[event.type];
      if (event.type === 'boom' || event.type === 'damage') shake = event.type === 'boom' ? 7 : 5;
      for (let index = 0; index < (reduced.matches ? Math.ceil(count / 3) : count); index++) {
        const angle = Math.random() * Math.PI * 2, speed = velocity * (.2 + Math.random() * .8);
        particles.push({ x: event.x, y: event.y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed,
          life: life * (.45 + Math.random() * .55), color: ['#fff5b7', '#ffb042', '#a93428'][index % 3], size: count > 15 ? 3 : 2 });
      }
    }
    shake = Math.max(0, shake - delta * 23);
    for (const spark of particles) { spark.x += spark.vx * delta; spark.y += spark.vy * delta; spark.vy -= 220 * delta; spark.life -= delta; }
    particles = particles.filter(spark => spark.life > 0);
  }

  function frame(time) {
    const elapsed = last ? Math.min(.05, (time - last) / 1000) : 0;
    last = time;
    if (mode === 'playing') {
      const began = performance.now();
      carry += elapsed;
      for (const [name, expires] of buffered) if (expires < time) buffered.delete(name);
      const input = Object.fromEntries([...Array.from(keys, key => keyMap[key]), ...fingers.values(), ...buffered.keys()].map(name => [name, true]));
      while (carry >= engine.tick) { engine.step(game, input); carry -= engine.tick; }
      effects(elapsed); updateHUD(); draw();
      lastCost = performance.now() - began;
      if (game.state !== 'playing') showResult(game.state);
    }
    requestAnimationFrame(frame);
  }

  window.render_game_to_text = () => JSON.stringify({ mode, width, height, ground: deck, timer: game?.time || 0,
    player: game?.player, health: game?.health, score: game?.score, phase: game?.phase, boss: game?.boss,
    projectiles: game?.foes, enemies: game?.enemies, shots: game?.shotCount || 0, cost: lastCost, startup: first });
  addEventListener('resize', resize); touch.addEventListener('change', resize); resize();
  sprites.desert.addEventListener('load', () => { if (mode === 'cover') draw(); });
  requestAnimationFrame(frame);
})();
