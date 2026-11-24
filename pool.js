(() => {
  'use strict';

  const { Match, STEP, RADIUS, MIN_POWER, clamp, distance } = window.PoolEngine;
  const $ = id => document.getElementById(id);
  const canvas = $('table');
  const renderer = new window.PoolRenderer(canvas);
  const i18n = window.ArcadeI18n;
  const embed = new URLSearchParams(location.search).get('embed') === '1';
  document.body.classList.toggle('embedded', embed);

  const copy = {
    tw: {
      title: '撞球-1', table: '撞球桌', you: '你', spin: '旋球', power: '力道', break: '開球', shoot: '出桿', pause: '暫停',
      mute: '靜音', unmute: '開啟聲音', fullscreen: '全螢幕', exitFull: '離開全螢幕', opponent: 'CPU難度', rookie: '初級', club: '中級', pro: '高手',
      resume: '繼續', rematch: '再來一局', language: '語言', close: '關閉', center: '置中', contact: '母球擊點',
      spinGuide: '上推跟球，下拉回帶，左右加塞。', guide: '先進4球獲勝。點球桌瞄準，再按住球桿往後拉蓄力（放開或往前推桿即可出球），也可直接拖下方力道條按出桿。犯規後對手可自由擺白球。',
      breakHint: '點球桌瞄準，拖球桿往後拉或按開球', aim: '輪到你・拉球桿或按出桿', cpu: 'CPU瞄準中', rolling: '球路進行中', place: '點空位擺白球',
      scratch: '白球落袋・對手自由球', miss: '白球未碰球・對手自由球', noRail: '未碰庫也未進球・對手自由球', turn: '換手',
      point: '進球・繼續出桿', combo: '連進{n}球', tiebreak: '3比3・下一球定勝負',
      won: '你贏了', lost: 'CPU獲勝', streak: '連勝{n}場', best: '最佳{n}場',
    },
    en: {
      title: 'Pool-1', table: 'Pool table', you: 'YOU', spin: 'Spin', power: 'Power', break: 'Break', shoot: 'Shoot', pause: 'Pause',
      mute: 'Mute', unmute: 'Unmute', fullscreen: 'Fullscreen', exitFull: 'Exit fullscreen', opponent: 'CPU difficulty', rookie: 'Rookie', club: 'Club', pro: 'Expert',
      resume: 'Resume', rematch: 'Rematch', language: 'Language', close: 'Close', center: 'Center', contact: 'Cue ball contact point',
      spinGuide: 'Top for follow, bottom for draw, left or right for side spin.', guide: 'First to pocket four balls wins. Tap to aim, then pull the cue stick back and release (or push forward) to shoot. Fouls give the opponent ball in hand.',
      breakHint: 'Tap to aim, pull cue stick or press Break', aim: 'Your turn · pull cue or Shoot', cpu: 'CPU is lining up a shot', rolling: 'Balls in play', place: 'Tap an open spot for the cue ball',
      scratch: 'Scratch · opponent has ball in hand', miss: 'No ball hit · opponent has ball in hand', noRail: 'No cushion or pocket · opponent has ball in hand', turn: 'Turn over',
      point: 'Pocketed · shoot again', combo: '{n} balls in a row', tiebreak: '3–3 · next ball wins',
      won: 'You win', lost: 'CPU wins', streak: '{n} win streak', best: 'Best {n}',
    },
    ko: {
      title: '포켓볼-1', table: '포켓볼 테이블', you: '나', spin: '회전', power: '세기', break: '브레이크', shoot: '치기', pause: '일시정지',
      mute: '음소거', unmute: '소리 켜기', fullscreen: '전체 화면', exitFull: '전체 화면 종료', opponent: 'CPU 난이도', rookie: '초급', club: '중급', pro: '고급',
      resume: '계속하기', rematch: '한 판 더', language: '언어', close: '닫기', center: '가운데', contact: '흰 공의 타점',
      spinGuide: '위는 밀어치기, 아래는 끌어치기, 좌우는 옆회전입니다.', guide: '공을 먼저 4개 넣으면 이깁니다. 테이블을 눌러 조준한 뒤 큐대를 뒤로 당겼다 놓거나 앞으로 밀어 치세요. 파울이 나면 상대가 흰 공을 놓을 수 있습니다.',
      breakHint: '조준 후 큐대를 뒤로 당기거나 브레이크', aim: '내 차례 · 큐대 당겨 치기', cpu: 'CPU 조준 중', rolling: '공이 굴러가는 중', place: '빈 곳을 눌러 흰 공 놓기',
      scratch: '흰 공이 들어갔습니다 · 상대 프리볼', miss: '공을 맞히지 못했습니다 · 상대 프리볼', noRail: '쿠션과 포켓을 놓쳤습니다 · 상대 프리볼', turn: '차례 교대',
      point: '득점 · 한 번 더', combo: '{n}개 연속 득점', tiebreak: '3 대 3 · 다음 득점으로 승부',
      won: '승리', lost: 'CPU 승리', streak: '{n}연승', best: '최고 {n}연승',
    },
  };
  i18n.enableAutoDom([[copy.tw.title, { en: copy.en.title, ko: copy.ko.title }]]);

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(`arcade_pool_${key}`)) ?? fallback; } catch { return fallback; }
  }

  function save(key, value) {
    try { localStorage.setItem(`arcade_pool_${key}`, JSON.stringify(value)); } catch { /* Storage is optional. */ }
  }

  class Sound {
    constructor(muted) {
      this.muted = muted;
      this.lastImpact = -1;
      this.nextBeat = 0;
      this.beat = 0;
    }

    wake() {
      try {
        if (!this.context) {
          const Audio = window.AudioContext || window.webkitAudioContext;
          if (!Audio) return;
          this.context = new Audio();
          this.music = this.context.createGain();
          this.fx = this.context.createGain();
          this.music.connect(this.context.destination);
          this.fx.connect(this.context.destination);
          this.noise = this.context.createBuffer(1, this.context.sampleRate * 0.1, this.context.sampleRate);
          const samples = this.noise.getChannelData(0);
          for (let i = 0; i < samples.length; i++) samples[i] = (Math.random() * 2 - 1) * (1 - i / samples.length) ** 3;
        }
        if (this.context.state === 'suspended') this.context.resume().catch(() => {});
        this.setMuted(this.muted);
      } catch { /* Gameplay remains available without audio. */ }
    }

    setMuted(muted) {
      this.muted = muted;
      if (!this.context) return;
      this.fx.gain.setTargetAtTime(muted ? 0 : 0.85, this.context.currentTime, 0.014);
      this.music.gain.setTargetAtTime(muted ? 0 : 0.27, this.context.currentTime, 0.014);
    }

    note(bus, hz, at, length, peak, type = 'triangle', down = 1) {
      const osc = this.context.createOscillator();
      const gain = this.context.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(hz, at);
      if (down !== 1) osc.frequency.exponentialRampToValueAtTime(hz * down, at + length);
      gain.gain.setValueAtTime(0.0001, at);
      gain.gain.exponentialRampToValueAtTime(peak, at + 0.004);
      gain.gain.exponentialRampToValueAtTime(0.0001, at + length);
      osc.connect(gain).connect(bus);
      osc.start(at);
      osc.stop(at + length + 0.006);
    }

    play(event, value) {
      if (!this.context || this.muted) return;
      const now = this.context.currentTime;
      if (event === 'impact' || event === 'stroke' || event === 'rail') {
        if (event === 'impact' && now - this.lastImpact < 0.022) return;
        if (event === 'impact') this.lastImpact = now;
        const hard = event === 'impact';
        const peak = hard ? clamp(value / 3900, 0.026, 0.26) : event === 'stroke' ? 0.135 : 0.06;
        this.note(this.fx, hard ? 1280 : event === 'stroke' ? 620 : 250, now, 0.042, peak, 'triangle', 0.55);
        const noise = this.context.createBufferSource();
        const gain = this.context.createGain();
        const filter = this.context.createBiquadFilter();
        noise.buffer = this.noise;
        filter.type = hard ? 'highpass' : 'lowpass';
        filter.frequency.value = hard ? 1500 : 1060;
        gain.gain.value = peak * 0.7;
        noise.connect(filter).connect(gain).connect(this.fx);
        noise.start(now);
      } else if (event === 'pocket') {
        this.note(this.fx, 158, now, 0.15, 0.28, 'sine', 0.42);
        if (value) this.note(this.fx, 587, now + 0.033, 0.13, 0.05);
      } else if (event === 'end') {
        (value ? [392, 349, 262] : [523, 659, 784, 1047]).forEach((hz, index) => this.note(this.fx, hz, now + index * 0.09, 0.24, 0.12));
      }
    }

    tick() {
      if (!this.context || this.context.state !== 'running' || this.muted) return;
      const now = this.context.currentTime;
      if (this.nextBeat < now - 0.2) this.nextBeat = now + 0.025;
      if (this.nextBeat > now + 0.09) return;
      const beat = this.beat++ % 32;
      const bass = [110, 87.31, 98, 82.41][Math.floor(beat / 8)];
      const melody = [440, 0, 523.25, 587.33, 659.25, 0, 523.25, 0, 349.23, 0, 440, 523.25, 587.33, 0, 440, 0,
        392, 0, 493.88, 587.33, 698.46, 0, 587.33, 0, 415.30, 0, 493.88, 659.25, 587.33, 523.25, 440, 0];
      if (beat % 2 === 0) this.note(this.music, bass * (beat % 8 === 4 ? 1.5 : 1), this.nextBeat, 0.31, 0.16);
      if (melody[beat]) this.note(this.music, melody[beat], this.nextBeat, 0.18, 0.056, beat % 4 ? 'triangle' : 'square');
      this.nextBeat += beat % 2 === 0 ? 0.32 : 0.22;
    }
  }

  const storedLevel = Number(read('level', 0));
  let level = [0, 1, 2].includes(storedLevel) ? storedLevel : 0;
  const streaks = read('streaks', {});
  let record = streaks[level] || { streak: 0, best: 0 };
  const sound = new Sound(Boolean(read('mute', false)));
  let match;
  let frameTime = 0;
  let debt = 0;
  let settle = 0;
  let virtual = false;
  let paused = false;
  let pointer = null;
  let placement = null;
  let statusOverride = null;
  let lastStatus = '';
  let spin = { x: 0, y: 0 };
  let lang = i18n.getLang();

  const t = (key, value) => copy[lang][key].replace('{n}', value ?? '');
  const power = () => Number($('power').value) / 100;

  function setPower(value) {
    $('power').value = Math.round(value * 100);
    $('power-value').value = `${$('power').value}%`;
  }

  function updateSpin(next) {
    const scale = Math.max(Math.hypot(next.x, next.y), 1);
    spin = { x: next.x / scale, y: next.y / scale };
    $('spin-dot').style.left = `${50 + spin.x * 37}%`;
    $('spin-dot').style.top = `${50 - spin.y * 37}%`;
  }

  function updateLabels() {
    document.title = t('title');
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t(el.dataset.copy); });
    $('language').value = lang;
    for (const [id, label] of [['table', 'table'], ['pause', 'pause'], ['mute', sound.muted ? 'unmute' : 'mute'],
      ['fullscreen', document.fullscreenElement ? 'exitFull' : 'fullscreen'], ['spin-close', 'close'], ['spin-pad', 'contact']]) {
      $(id).setAttribute('aria-label', t(label));
      if ($(id).tagName === 'BUTTON') $(id).title = t(label);
    }
  }

  function updateHUD() {
    for (const [index, id] of ['player-score', 'cpu-score'].entries()) {
      const side = $(id);
      const next = String(match.score[index]);
      if (side.querySelector('strong').textContent !== next) side.querySelector('strong').textContent = next;
      side.classList.toggle('current', index === match.turn && match.phase !== 'end');
    }
    const playable = match.phase === 'aim' && !match.ballInHand && !paused;
    $('shoot').disabled = $('power').disabled = $('spin').disabled = !playable;
    const shotLabel = t(match.shots === 0 ? 'break' : 'shoot');
    if ($('shoot').textContent !== shotLabel) $('shoot').textContent = shotLabel;
    $('mute').setAttribute('aria-pressed', String(sound.muted));
    const phaseLabel = match.phase === 'rolling' ? 'rolling' : match.phase === 'cpu' ? 'cpu'
      : match.ballInHand ? 'place' : match.break ? 'breakHint' : 'aim';
    const message = statusOverride && statusOverride.until > performance.now()
      ? `${t(statusOverride.key, statusOverride.value)}${match.ballInHand && !match.turn ? ` · ${t('place')}` : ''}` : t(phaseLabel);
    if (lastStatus !== message) {
      $('status').textContent = message;
      lastStatus = message;
    }
    $('status').hidden = match.phase === 'end';
    const ended = match.phase === 'end';
    $('overlay').hidden = !paused && !ended;
    for (const selector of ['table', 'pause', 'spin', 'power', 'shoot']) $(selector).inert = paused || ended;
    if (paused || ended) {
      $('panel-title').textContent = t(ended ? match.winner ? 'lost' : 'won' : 'pause');
      $('result-score').hidden = !ended;
      $('result-score').textContent = match.score.join(' – ');
      $('streak').textContent = `${t('streak', record.streak)} · ${t('best', record.best)}`;
      $('resume').hidden = $('guide').hidden = ended;
      $('rematch').classList.toggle('primary', ended);
    }
  }

  function notice(key, value) {
    statusOverride = { key, value, until: performance.now() + 2250 };
  }

  function onEvent(kind, value, point) {
    sound.play(kind, value);
    if (kind === 'stroke') {
      renderer.effect('stroke', match.cue);
      statusOverride = null;
    } else if (kind === 'pocket') {
      renderer.effect('pocket', point);
      if (value && !match.turn) notice('point');
    } else if (kind === 'point') {
      notice(value > 1 ? 'combo' : 'point', value);
    } else if (kind === 'end') {
      record.streak = value ? 0 : record.streak + 1;
      record.best = Math.max(record.best, record.streak);
      streaks[match.level] = record;
      save('streaks', streaks);
      queueMicrotask(() => $('rematch').focus({ preventScroll: true }));
    } else if (['scratch', 'miss', 'noRail', 'tiebreak', 'turn'].includes(kind)) {
      notice(kind);
    }
    if (kind === 'stroke' || kind === 'pocket' || kind === 'end') settle = 0.02;
  }

  function size() {
    const { width, height } = canvas.getBoundingClientRect();
    if (width < 80 || height < 140) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const rect = { x: 9, y: 44, width: width - 18, height: height - 89 };
    const scale = Math.min(rect.width, rect.height) / 490;
    const worldWidth = rect.width / scale;
    const worldHeight = rect.height / scale;
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    if (match) match.resize(worldWidth, worldHeight);
    else match = new Match(worldWidth, worldHeight, level, Math.random, onEvent);
    pointer = placement = null;
    renderer.resize(rect, match.table, dpr);
    draw(0);
  }

  function toggleSpin(open) {
    $('spin-panel').hidden = !open;
    $('spin').setAttribute('aria-expanded', String(open));
  }

  function shoot(strength = power()) {
    if (match.phase !== 'aim' || paused || match.ballInHand) return;
    sound.wake();
    toggleSpin(false);
    if (match.shoot(match.angle, strength, spin)) {
      setPower(0.56);
      updateHUD();
    }
  }

  function restart() {
    match.level = level;
    record = streaks[level] || { streak: 0, best: 0 };
    match.reset();
    paused = false;
    pointer = placement = statusOverride = null;
    renderer.effects.length = 0;
    toggleSpin(false);
    updateSpin({ x: 0, y: 0 });
    setPower(0.86);
    sound.wake();
    updateHUD();
    canvas.focus({ preventScroll: true });
  }

  function pause(next) {
    if (match.phase === 'end') return;
    paused = next;
    pointer = placement = null;
    toggleSpin(false);
    updateHUD();
    (paused ? $('resume') : canvas).focus({ preventScroll: true });
  }

  function canvasPoint(event) {
    const dom = canvas.getBoundingClientRect();
    return { x: (event.clientX - dom.left - renderer.rect.x) / renderer.scale,
      y: (event.clientY - dom.top - renderer.rect.y) / renderer.scale };
  }

  function isOnCueStick(point) {
    const vx = point.x - match.cue.x;
    const vy = point.y - match.cue.y;
    const bx = -Math.cos(match.angle);
    const by = -Math.sin(match.angle);
    const proj = vx * bx + vy * by;
    const perp = Math.abs(vx * (-by) + vy * bx);
    return (proj >= RADIUS * 0.5 && proj <= 275 && perp <= 26);
  }

  canvas.addEventListener('pointerdown', event => {
    if (!event.isPrimary || event.button !== 0 || paused || match.phase !== 'aim') return;
    sound.wake();
    toggleSpin(false);
    const point = canvasPoint(event);
    const onBall = distance(point, match.cue) < RADIUS + 16;
    const onStick = !match.ballInHand && isOnCueStick(point);
    pointer = {
      id: event.pointerId,
      cue: onBall || onStick,
      stick: onStick && !onBall,
      start: point,
      pulled: false,
      lastBack: 0,
      maxBack: 0,
      peakPower: power(),
      angle: match.angle,
      struck: false
    };
    canvas.setPointerCapture(event.pointerId);
    if (match.ballInHand) placement = point;
    else if (!pointer.cue) match.angle = Math.atan2(point.y - match.cue.y, point.x - match.cue.x);
  });

  canvas.addEventListener('pointermove', event => {
    const point = canvasPoint(event);
    if (!pointer || pointer.id !== event.pointerId) {
      if (event.pointerType === 'mouse' && match.ballInHand && match.phase === 'aim') placement = point;
      return;
    }
    if (pointer.struck) return;
    if (match.ballInHand) {
      placement = point;
      return;
    }
    if (!pointer.cue) {
      match.angle = Math.atan2(point.y - match.cue.y, point.x - match.cue.x);
      return;
    }
    if (pointer.stick) {
      // 直接抓球桿身往後拉蓄力（鎖定瞄準角度不抖動），同步即時更新下方力道條與百分比數值；
      // 支援「拉後放開出桿」或「拉後順手往前推桿撞球」兩種直覺操作！
      const bx = -Math.cos(pointer.angle);
      const by = -Math.sin(pointer.angle);
      const back = (point.x - pointer.start.x) * bx + (point.y - pointer.start.y) * by;
      const forwardPush = pointer.lastBack - back;
      pointer.lastBack = back;
      if (back > 6 || pointer.pulled) {
        pointer.pulled = true;
        const clampedBack = Math.max(0, back);
        if (clampedBack > pointer.maxBack) {
          pointer.maxBack = clampedBack;
          pointer.peakPower = clamp(clampedBack / 138, MIN_POWER, 1);
        }
        const liveStrength = clamp(clampedBack / 138, MIN_POWER, 1);
        setPower(liveStrength);
        // 若已明顯往後拉蓄力（> 26px），接著順手往前推桿過起點（forwardPush > 5）即直接推桿出球！
        if (pointer.maxBack > 26 && back <= 4 && forwardPush > 5) {
          pointer.struck = true;
          setPower(pointer.peakPower);
          shoot(pointer.peakPower);
          return;
        }
      }
    } else {
      // 抓白球反向拖曳（既有手感完整保留，同步即時更新力道數值）
      const length = distance(point, match.cue);
      if (length > 18 || pointer.pulled) {
        pointer.pulled = true;
        if (length > 6) match.angle = Math.atan2(match.cue.y - point.y, match.cue.x - point.x);
        setPower(clamp((length - 12) / 132, MIN_POWER, 1));
      }
    }
  });

  function release(event, cancelled) {
    if (!pointer || pointer.id !== event.pointerId) return;
    const previous = pointer;
    pointer = null;
    if (previous.struck) return;
    if (cancelled) {
      placement = null;
      match.angle = previous.angle;
      return;
    }
    if (match.ballInHand) {
      if (match.placeCue(canvasPoint(event))) {
        placement = statusOverride = null;
        updateHUD();
      }
    } else if (previous.stick) {
      if (previous.pulled && previous.lastBack > 14) shoot(power());
    } else if (previous.pulled && distance(canvasPoint(event), match.cue) > 24) shoot();
  }

  canvas.addEventListener('pointerup', event => release(event, false));
  canvas.addEventListener('pointercancel', event => release(event, true));
  $('shoot').addEventListener('click', () => shoot());
  $('pause').addEventListener('click', () => pause(true));
  $('resume').addEventListener('click', () => pause(false));
  $('rematch').addEventListener('click', restart);
  $('power').addEventListener('input', () => setPower(power()));
  $('language').addEventListener('change', event => i18n.setLang(event.target.value));
  $('mute').addEventListener('click', () => {
    sound.wake();
    sound.setMuted(!sound.muted);
    save('mute', sound.muted);
    updateLabels();
    updateHUD();
  });
  $('difficulty').value = String(level);
  $('difficulty').addEventListener('change', event => {
    level = Number(event.target.value);
    save('level', level);
    if (match.phase !== 'end') {
      match.level = level;
      record = streaks[level] || { streak: 0, best: 0 };
      updateHUD();
    }
  });
  $('spin').addEventListener('click', () => toggleSpin($('spin-panel').hidden));
  $('spin-close').addEventListener('click', () => { toggleSpin(false); $('spin').focus(); });
  $('spin-reset').addEventListener('click', () => updateSpin({ x: 0, y: 0 }));
  const spinPad = $('spin-pad');
  for (const action of ['pointerdown', 'pointermove']) spinPad.addEventListener(action, event => {
    if (action === 'pointerdown') spinPad.setPointerCapture(event.pointerId);
    if (!spinPad.hasPointerCapture(event.pointerId)) return;
    const rect = spinPad.getBoundingClientRect();
    updateSpin({ x: (event.clientX - rect.left - rect.width / 2) / 32, y: (rect.top + rect.height / 2 - event.clientY) / 32 });
  });
  spinPad.addEventListener('keydown', event => {
    const dir = { ArrowUp: [0, 1], ArrowDown: [0, -1], ArrowLeft: [-1, 0], ArrowRight: [1, 0] }[event.key];
    if (!dir) return;
    event.preventDefault();
    updateSpin({ x: spin.x + 0.1 * dir[0], y: spin.y + 0.1 * dir[1] });
  });

  function fullscreen() {
    if (embed) return;
    const request = document.fullscreenElement ? document.exitFullscreen() : $('match').requestFullscreen?.();
    request?.catch(() => {});
  }

  $('fullscreen').addEventListener('click', fullscreen);
  document.addEventListener('fullscreenchange', updateLabels);
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && !$('spin-panel').hidden) { toggleSpin(false); $('spin').focus(); return; }
    if (event.key === 'Escape' && !document.fullscreenElement || event.key.toLowerCase() === 'p' && !event.repeat) pause(!paused);
    if (event.key.toLowerCase() === 'f' && !event.repeat) fullscreen();
    if (paused || event.target !== canvas || match.phase !== 'aim') return;
    if (match.ballInHand) {
      const nudge = { ArrowUp: [0, -10], ArrowDown: [0, 10], ArrowLeft: [-10, 0], ArrowRight: [10, 0] }[event.key];
      if (nudge) {
        event.preventDefault();
        placement ??= match.openSpot(true);
        placement.x = clamp(placement.x + nudge[0], RADIUS, match.table.width - RADIUS);
        placement.y = clamp(placement.y + nudge[1], RADIUS, match.table.height - RADIUS);
      } else if (event.code === 'Space') {
        event.preventDefault();
        if (match.placeCue(placement ?? match.openSpot(true))) placement = statusOverride = null;
      }
      return;
    }
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      match.angle += (event.key === 'ArrowLeft' ? -1 : 1) * (event.shiftKey ? 0.008 : 0.034);
    } else if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
      event.preventDefault();
      setPower(clamp(power() + (event.key === 'ArrowUp' ? 0.03 : -0.03), MIN_POWER, 1));
    } else if (event.code === 'Space') { event.preventDefault(); shoot(); }
  });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden && match.phase !== 'end' && !paused) pause(true);
  });
  i18n.onChange(next => { lang = next; updateLabels(); updateHUD(); });

  function draw(dt) {
    renderer.draw(match, power(), Boolean(pointer?.pulled), placement, dt);
  }

  function simulate(dt) {
    if (paused || match.phase === 'end') return;
    debt += dt;
    while (debt >= STEP - 1e-8) {
      if (settle > 0) settle -= STEP;
      else match.update(STEP);
      debt -= STEP;
    }
  }

  function frame(now) {
    const dt = Math.min((now - (frameTime || now)) / 1000, 0.08);
    frameTime = now;
    if (!virtual) simulate(dt);
    if (!paused && match.phase !== 'end' && !document.hidden) sound.tick();
    updateHUD();
    draw(paused ? 0 : dt);
    requestAnimationFrame(frame);
  }

  window.advanceTime = ms => {
    virtual = true;
    simulate(Math.max(0, Math.min(ms, 30000)) / 1000);
    updateHUD();
    draw(0);
  };

  window.render_game_to_text = () => JSON.stringify({
    phase: paused ? 'paused' : match.phase, turn: match.turn, score: match.score, shots: match.shots, level: match.level,
    clock: match.clock, combo: match.combo, winner: match.winner, ballInHand: match.ballInHand, suddenDeath: match.suddenDeath,
    table: { ...renderer.rect, scale: renderer.scale, worldWidth: match.table.width, worldHeight: match.table.height },
    balls: match.balls.filter(b => b.inPlay).map(({ id, x, y, vx, vy }) => ({ id, x, y, vx, vy })),
    pockets: match.table.pockets, spin, power: power(), muted: sound.muted, language: lang,
    cpuTarget: match.plan?.target ?? null,
  });

  size();
  updateLabels();
  updateHUD();
  new ResizeObserver(size).observe(canvas);
  requestAnimationFrame(frame);
})();
