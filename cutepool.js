(() => {
  'use strict';

  const canvas = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  const $ = id => document.getElementById(id);
  const i18n = window.ArcadeI18n;

  const isLobbyEmbed = (() => {
    try {
      const sp = new URLSearchParams(location.search);
      if (sp.get('embed') !== '1') return false;
      try { return window.self !== window.top; } catch { return true; }
    } catch { return false; }
  })();
  document.body.classList.toggle('embedded', isLobbyEmbed);

  // --- 多語字典（繁中 / EN / KO）---
  const COPY = {
    tw: {
      title: '糖果撞球', you: '你', spin: '旋球', power: '力道', break: '開球！', shoot: '出桿！',
      opponent: 'CPU 難度', rookie: '可愛初級', club: '活力中級', pro: '糖果高手',
      language: '語言', resume: '繼續玩', rematch: '再來一局', center: '置中',
      spinGuide: '上推跟球・下拉回帶・左右加塞',
      guide: '先進 4 球獲勝！點桌面瞄準，直接按住糖果球桿往後拉蓄力（放開或往前推桿即可出球），進袋連擊還有星光驚喜！',
      breakHint: '點球桌瞄準，拉糖果球桿或按開球！',
      aim: '輪到你・拉球桿或按出桿！',
      cpu: '可愛 CPU 思考中...',
      rolling: '糖果球滾動中！',
      place: '自由球！點空位擺放柴犬白球',
      scratch: '白球掉進星星袋啦！對手獲得自由球',
      miss: '沒碰到糖果球・對手獲得自由球',
      turn: '換對方出桿！',
      point: '進袋得分！繼續出桿 ✨',
      combo: '太神啦！連進 {n} 球 🌟',
      bumperOn: '⭐ 彈跳星機關：開啟（撞到會彈跳！）',
      bumperOff: '⭐ 彈跳星機關：關閉（純淨桌面）',
      themeSwitched: '🎨 已切換球桌：{n}',
      won: '🎉 糖果冠軍是你！',
      lost: '🍬 CPU 險勝一局！',
      pause: '暫停休息',
      streak: '連勝 {n} 場',
      best: '最佳 {n} 場'
    },
    en: {
      title: 'Candy Pool', you: 'YOU', spin: 'Spin', power: 'Power', break: 'Break!', shoot: 'Shoot!',
      opponent: 'CPU Level', rookie: 'Sweet Rookie', club: 'Bouncy Club', pro: 'Candy Pro',
      language: 'Language', resume: 'Resume', rematch: 'Play Again', center: 'Center',
      spinGuide: 'Top: follow · Bottom: draw · Sides: curve',
      guide: 'First to pocket 4 candy balls wins! Tap to aim, then pull the candy cue stick back and release (or push forward) to shoot!',
      breakHint: 'Tap to aim, pull the candy cue or Break!',
      aim: 'Your turn · pull cue stick or Shoot!',
      cpu: 'Cute CPU lining up...',
      rolling: 'Candy balls rolling!',
      place: 'Ball in hand! Tap an open spot',
      scratch: 'Cue ball pocketed! Opponent gets ball in hand',
      miss: 'Missed! Opponent gets ball in hand',
      turn: 'CPU turn!',
      point: 'Sweet shot! Shoot again ✨',
      combo: 'MEGA COMBO ×{n}! 🌟',
      bumperOn: '⭐ Bouncy Stars: ON!',
      bumperOff: '⭐ Bouncy Stars: OFF (Classic)',
      themeSwitched: '🎨 Table Theme: {n}',
      won: '🎉 Candy Champion!',
      lost: '🍬 CPU Won This Round!',
      pause: 'Paused',
      streak: '{n} win streak',
      best: 'Best {n}'
    },
    ko: {
      title: '캔디 포켓볼', you: '나', spin: '회전', power: '세기', break: '브레이크!', shoot: '치기!',
      opponent: 'CPU 난이도', rookie: '귀염 초급', club: '통통 중급', pro: '캔디 고수',
      language: '언어', resume: '계속하기', rematch: '한 판 더', center: '가운데',
      spinGuide: '위: 밀어치기 · 아래: 끌어치기 · 좌우: 회전',
      guide: '캔디 공 4개를 먼저 넣으면 승리! 테이블을 눌러 조준하고 캔디 큐대를 뒤로 당겼다 놓거나 앞으로 밀어 치세요!',
      breakHint: '조준 후 캔디 큐대를 당기거나 브레이크!',
      aim: '내 차례 · 큐대 당겨 치기!',
      cpu: '귀여운 CPU 조준 중...',
      rolling: '캔디 공 굴러가는 중!',
      place: '프리볼! 빈 곳에 시바 흰 공 놓기',
      scratch: '흰 공이 빠졌어요! 상대 프리볼',
      miss: '빗나갔어요! 상대 프리볼',
      turn: '상대 차례!',
      point: '나이스 샷! 한 번 더 ✨',
      combo: '대박! {n}연속 득점 🌟',
      bumperOn: '⭐ 통통 별 범퍼: 켜짐!',
      bumperOff: '⭐ 통통 별 범퍼: 꺼짐',
      themeSwitched: '🎨 테이블 테마: {n}',
      won: '🎉 캔디 챔피언 승리!',
      lost: '🍬 CPU가 이겼어요!',
      pause: '일시정지',
      streak: '{n}연승',
      best: '최고 {n}연승'
    }
  };

  let lang = (i18n && i18n.getLang && i18n.getLang()) || 'tw';
  if (!COPY[lang]) lang = 'tw';
  const t = (k, val) => (COPY[lang][k] || COPY.tw[k] || k).replace('{n}', val ?? '');

  // --- 3 款繽紛多彩糖果球桌主題 ---
  const THEMES = [
    {
      id: 'mint',
      name: { tw: '薄荷蘇打桌', en: 'Mint Soda', ko: '민트 소다' },
      pageBg: '#e2fbf4',
      feltA: '#7ef0d6',
      feltB: '#4cd3b8',
      feltDot: 'rgba(255, 255, 255, 0.22)',
      railOuter: '#ff8fab',
      railStripe: '#ffe5ec',
      cushion: '#2fb89f',
      pocketOuter: '#ffd13b',
      pocketInner: '#2e1625',
      lineCol: 'rgba(255, 255, 255, 0.55)'
    },
    {
      id: 'strawberry',
      name: { tw: '草莓奶油桌', en: 'Strawberry Cream', ko: '딸기 크림' },
      pageBg: '#ffeaf2',
      feltA: '#ffb8d1',
      feltB: '#f78fb3',
      feltDot: 'rgba(255, 255, 255, 0.24)',
      railOuter: '#ffd166',
      railStripe: '#fff4cc',
      cushion: '#e66794',
      pocketOuter: '#72efdd',
      pocketInner: '#361324',
      lineCol: 'rgba(255, 255, 255, 0.58)'
    },
    {
      id: 'starlight',
      name: { tw: '星空馬卡龍桌', en: 'Starlight Macaron', ko: '별빛 마카롱' },
      pageBg: '#ede6ff',
      feltA: '#a78bfa',
      feltB: '#7c5ce6',
      feltDot: 'rgba(255, 245, 190, 0.26)',
      railOuter: '#6ee7b7',
      railStripe: '#d1fae5',
      cushion: '#6042c7',
      pocketOuter: '#fde047',
      pocketInner: '#1e1038',
      lineCol: 'rgba(255, 245, 200, 0.52)'
    }
  ];

  // --- 非真實比例：放大 Q 彈可愛大球與大袋口 ---
  const BALL_R = 23;       // 可愛大球（寫實撞球的 ~1.7 倍大！）
  const POCKET_R = 35;     // 寬鬆好進的星星甜甜圈袋口
  const BUMPER_R = 22;     // 彈跳星機關半徑
  const STROKE_W = 2.4;    // 全遊戲前景物件統一描邊粗細！
  const INK = '#3a1f12';
  const MIN_POWER = 0.12;
  const MAX_SPEED = 1120;
  const WIN_SCORE = 4;

  const BALL_STYLES = [
    { id: 0, name: 'shiba',  color: '#fff8ec', shade: '#f3d5a5', cheek: '#ff9ebb', face: 'shiba' },
    { id: 1, name: 'berry',  color: '#ff5c8a', shade: '#d62e60', cheek: '#ffb3c6', face: 'wink' },
    { id: 2, name: 'lemon',  color: '#ffd13b', shade: '#e09f1f', cheek: '#ff8fa3', face: 'star' },
    { id: 3, name: 'soda',   color: '#38bdf8', shade: '#0284c7', cheek: '#ff9ebb', face: 'cat' },
    { id: 4, name: 'grape',  color: '#b36bff', shade: '#7e3af2', cheek: '#ffb3c6', face: 'happy' },
    { id: 5, name: 'peach',  color: '#ff924c', shade: '#e05a1b', cheek: '#ffd166', face: 'grin' },
    { id: 6, name: 'matcha', color: '#34d399', shade: '#059669', cheek: '#ff9ebb', face: 'sweet' }
  ];

  // --- 歡樂 Web Audio 合成音效（清脆木琴／泡泡撞擊／彈跳星 Boing／進袋和弦）---
  class CuteSound {
    constructor() {
      this.ctx = null;
      this.muted = false;
    }
    wake() {
      if (this.muted) return;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
    }
    tone(freq, dur, type = 'triangle', vol = 0.14, slide = 0) {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, now);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      osc.connect(g).connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + dur + 0.02);
    }
    playStroke(p) { this.tone(240 + p * 180, 0.11, 'triangle', 0.18, 120); }
    playHit(v) { this.tone(360 + Math.min(400, v * 0.45), 0.075, 'sine', Math.min(0.16, 0.04 + v * 0.0002), -90); }
    playRail() { this.tone(190, 0.08, 'triangle', 0.10, -40); }
    playBumper() { this.tone(520, 0.18, 'sine', 0.18, 360); }
    playPocket(combo = 1) {
      const notes = [523.25, 659.25, 783.99, 1046.5];
      notes.forEach((n, i) => setTimeout(() => this.tone(n * (1 + (combo - 1) * 0.08), 0.16, 'triangle', 0.14), i * 55));
    }
    playScratch() { this.tone(320, 0.24, 'sawtooth', 0.09, -180); }
    playWin() { [523, 659, 784, 1046, 1318].forEach((n, i) => setTimeout(() => this.tone(n, 0.22, 'triangle', 0.16), i * 85)); }
  }
  const sound = new CuteSound();

  // --- 遊戲狀態 ---
  let themeIdx = 0;
  let bumpersOn = true;
  let diffLevel = 0; // 0, 1, 2
  let paused = false;
  let spin = { x: 0, y: 0 };
  let streak = 0, bestStreak = 0;
  let statusOverride = null;

  const world = {
    w: 460,
    h: 740,
    vertical: true,
    pockets: [],
    bumpers: [],
    balls: [],
    cue: null,
    turn: 0,        // 0 = player, 1 = cpu
    score: [0, 0],
    phase: 'aim',   // 'aim' | 'rolling' | 'cpu' | 'end'
    winner: -1,
    angle: -Math.PI / 2,
    ballInHand: false,
    shots: 0,
    combo: 0,
    turnPocketed: 0,
    turnFirstHit: false,
    turnScratched: false,
    cpuTimer: 0,
    cpuPlan: null
  };

  // 視覺特效與娛樂互動陣列（粒子、星星光環、飄字、高速星塵拖尾、場上幸運驚喜星、巨無霸袋口回合）
  const effects = [];
  const sparkles = [];
  const floaters = [];
  const trails = [];
  let luckyStar = null;
  let bigPocketTurns = 0;

  const QUIPS = {
    tw: {
      playerScore: ['🐶「漂亮！糖果球乖乖進袋！」', '🐶「手感發燙啦！再進一顆！」', '🐶「太甜了！柴柴開掛中 ✨」'],
      cpuScore: ['🐱「哼哼，機器貓計算零誤差！」', '🐱「這顆葡萄切球漂亮吧？」'],
      cpuTurn: ['🐱「輪到我囉～看我的紫電球桿！」', '🐱「瞄準中…準備好接招了嗎？」'],
      scratch: ['🐶「嗚哇！柴犬白球掉進星星袋啦！」', '🐱「哈哈！謝謝送我自由球～」'],
      luckyBig: ['🌟 吃到幸運星！袋口變超大（持續2回合）！'],
      luckyBumper: ['⭐ BOING！被可愛星星彈飛啦！']
    },
    en: {
      playerScore: ['🐶 "Sweet shot! Candy pocketed!"', '🐶 "On fire! Keep rolling ✨"'],
      cpuScore: ['🐱 "Purr-fect calculation!"', '🐱 "Watch my Robo-Cat cue!"'],
      cpuTurn: ['🐱 "My turn! Purple lightning cue ready!"'],
      scratch: ['🐶 "Oops! Shiba cue ball fell in!"'],
      luckyBig: ['🌟 Lucky Star! GIANT POCKETS for 2 turns!'],
      luckyBumper: ['⭐ BOING! Star bounce!']
    },
    ko: {
      playerScore: ['🐶 "나이스 샷! 캔디 공 쏙!"', '🐶 "완전 달콤해! 한 번 더 ✨"'],
      cpuScore: ['🐱 "후훗, 로보냥 완벽 계산!"'],
      cpuTurn: ['🐱 "내 차례! 보라 번개 큐대 출격!"'],
      scratch: ['🐶 "으악! 시바 흰 공이 빠졌어!"'],
      luckyBig: ['🌟 행운의 별! 2턴 동안 포켓 초대형 확장!'],
      luckyBumper: ['⭐ 통통! 별 범퍼 대반격!']
    }
  };
  function randomQuip(kind) {
    const pool = (QUIPS[lang] && QUIPS[lang][kind]) || QUIPS.tw[kind] || [];
    return pool.length ? pool[Math.floor(Math.random() * pool.length)] : '';
  }
  function showRawNotice(text, ms = 2200) {
    if (!text) return;
    statusOverride = { text, until: performance.now() + ms };
    updateHUD();
  }
  function spawnLuckyStar() {
    if (!bumpersOn) { luckyStar = null; return; }
    for (let tries = 0; tries < 24; tries++) {
      const lx = 75 + Math.random() * (world.w - 150);
      const ly = 95 + Math.random() * (world.h - 190);
      const pt = { x: lx, y: ly };
      if (world.balls.every(b => !b.inPlay || dist(pt, b) > BALL_R * 2.8) &&
          world.bumpers.every(bm => dist(pt, bm) > bm.r + 36)) {
        luckyStar = { x: lx, y: ly, r: 18, phase: Math.random() * 6.28 };
        return;
      }
    }
  }

  // 視口與轉換
  let viewRect = { x: 20, y: 80, w: 350, h: 640 };
  let viewScale = 1;
  let dpr = 1;
  let pointer = null;
  let placement = null;

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }
  function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }
  function getPower() { return Number($('powerRange').value) / 100; }
  function setPower(v) {
    const pct = Math.round(clamp(v, MIN_POWER, 1) * 100);
    $('powerRange').value = String(pct);
    $('powerVal').value = `${pct}%`;
    $('powerVal').textContent = `${pct}%`;
  }

  function showNotice(key, val, ms = 2200) {
    statusOverride = { text: t(key, val), until: performance.now() + ms };
    updateHUD();
  }

  function spawnPopBurst(x, y, color, big = false) {
    effects.push({ x, y, r: BALL_R * 0.7, maxR: big ? 84 : 52, color, age: 0, maxAge: 0.42 });
    const n = big ? 16 : 8;
    for (let i = 0; i < n; i++) {
      const a = (Math.PI * 2 * i) / n + Math.random() * 0.4;
      const spd = (big ? 160 : 95) * (0.5 + Math.random() * 0.8);
      sparkles.push({
        x, y, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd,
        r: big ? 6.5 : 4.5, color: i % 2 === 0 ? color : '#ffd13b',
        age: 0, maxAge: 0.48 + Math.random() * 0.2
      });
    }
  }

  function spawnFloater(x, y, text, color = '#ff477e') {
    floaters.push({ x, y, text, color, age: 0, maxAge: 1.05 });
  }

  // --- 建立桌台與擺球 ---
  function buildTableGeometry() {
    const w = world.w, h = world.h;
    const v = world.vertical;
    const pad = 10;
    world.pockets = v ? [
      { x: pad, y: pad }, { x: w - pad, y: pad },
      { x: pad - 4, y: h * 0.5 }, { x: w - pad + 4, y: h * 0.5 },
      { x: pad, y: h - pad }, { x: w - pad, y: h - pad }
    ] : [
      { x: pad, y: pad }, { x: w * 0.5, y: pad - 4 }, { x: w - pad, y: pad },
      { x: pad, y: h - pad }, { x: w * 0.5, y: h - pad + 4 }, { x: w - pad, y: h - pad }
    ];
    // 兩顆可愛彈跳星機關（位於中段兩側安全不擋開球線的位置）
    world.bumpers = v ? [
      { x: w * 0.22, y: h * 0.52, r: BUMPER_R, pulse: 0, color: '#ffd13b' },
      { x: w * 0.78, y: h * 0.52, r: BUMPER_R, pulse: 0, color: '#ff85a2' }
    ] : [
      { x: w * 0.50, y: h * 0.22, r: BUMPER_R, pulse: 0, color: '#ffd13b' },
      { x: w * 0.50, y: h * 0.78, r: BUMPER_R, pulse: 0, color: '#ff85a2' }
    ];
  }

  function resetMatch() {
    buildTableGeometry();
    const w = world.w, h = world.h, v = world.vertical;
    world.balls = [];
    // 柴犬母球
    const cuePos = v ? { x: w * 0.5, y: h * 0.78 } : { x: w * 0.22, y: h * 0.5 };
    const cue = {
      id: 0, x: cuePos.x, y: cuePos.y, vx: 0, vy: 0, inPlay: true,
      squash: 0, squashAng: 0, dizzy: 0, blink: Math.random() * 4
    };
    world.cue = cue;
    world.balls.push(cue);

    // 6 顆可愛糖果球排成可愛三角形
    const apex = v ? { x: w * 0.5, y: h * 0.30 } : { x: w * 0.70, y: h * 0.5 };
    const gap = BALL_R * 2.12;
    const rows = [[1], [2, 3], [4, 5, 6]];
    rows.forEach((row, rIdx) => {
      row.forEach((id, cIdx) => {
        const offsetAlong = -rIdx * gap * 0.88;
        const offsetAcross = (cIdx - (row.length - 1) * 0.5) * gap;
        const bx = v ? apex.x + offsetAcross : apex.x - offsetAlong;
        const by = v ? apex.y + offsetAlong : apex.y + offsetAcross;
        world.balls.push({
          id, x: bx, y: by, vx: 0, vy: 0, inPlay: true,
          squash: 0, squashAng: 0, dizzy: 0, blink: Math.random() * 4
        });
      });
    });

    world.turn = 0;
    world.score = [0, 0];
    world.phase = 'aim';
    world.winner = -1;
    world.angle = v ? -Math.PI / 2 : 0;
    world.ballInHand = false;
    world.shots = 0;
    world.combo = 0;
    world.turnPocketed = 0;
    world.turnFirstHit = false;
    world.turnScratched = false;
    world.cpuPlan = null;
    paused = false;
    pointer = null;
    placement = null;
    statusOverride = null;
    setPower(0.80);
    setSpin({ x: 0, y: 0 });
    bigPocketTurns = 0;
    trails.length = 0;
    spawnLuckyStar();
    updateHUD();
  }

  function resize() {
    const bw = window.innerWidth;
    const bh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(bw * dpr);
    canvas.height = Math.round(bh * dpr);

    const vertical = bh >= bw * 0.92;
    const topSafe = bw < 780 ? 132 : 94;
    const botSafe = 82;
    const sideSafe = 18;
    const availW = Math.max(180, bw - sideSafe * 2);
    const availH = Math.max(240, bh - topSafe - botSafe);

    const newW = vertical ? 460 : 740;
    const newH = vertical ? 740 : 460;
    const changedOrient = (world.vertical !== vertical) || world.balls.length === 0;
    world.vertical = vertical;
    world.w = newW;
    world.h = newH;

    const scale = Math.min(availW / (newW + 44), availH / (newH + 44));
    viewScale = scale;
    const drawW = newW * scale;
    const drawH = newH * scale;
    viewRect = {
      x: (bw - drawW) * 0.5,
      y: topSafe + (availH - drawH) * 0.5,
      w: drawW,
      h: drawH
    };

    if (changedOrient) resetMatch();
    else buildTableGeometry();
  }

  function canPlaceCue(pt) {
    if (pt.x < BALL_R + 12 || pt.x > world.w - BALL_R - 12 || pt.y < BALL_R + 12 || pt.y > world.h - BALL_R - 12) return false;
    for (const b of world.balls) {
      if (b.id !== 0 && b.inPlay && dist(pt, b) < BALL_R * 2.15) return false;
    }
    if (bumpersOn) {
      for (const bm of world.bumpers) {
        if (dist(pt, bm) < BALL_R + bm.r + 8) return false;
      }
    }
    return true;
  }

  function fireShot(angle, strength, spinVal) {
    if (world.phase !== 'aim' && world.phase !== 'cpu') return;
    const s = clamp(strength, MIN_POWER, 1);
    const spd = 210 + s * (MAX_SPEED - 210);
    world.cue.vx = Math.cos(angle) * spd;
    world.cue.vy = Math.sin(angle) * spd;
    // 簡單可愛旋球效果（前推加速／回帶減速／左右微彎）
    world.cue.spinX = spinVal.x * s * 220;
    world.cue.spinY = spinVal.y * s * 200;
    world.cue.squash = 0.28;
    world.cue.squashAng = angle;
    world.phase = 'rolling';
    world.shots += 1;
    world.turnPocketed = 0;
    world.turnFirstHit = false;
    world.turnScratched = false;
    statusOverride = null;
    sound.playStroke(s);
    spawnPopBurst(world.cue.x, world.cue.y, '#ffd13b', false);
    updateHUD();
  }

  // --- 瞄準預測（幽靈球＋目標切球線）---
  function computeFirstContact(origin, angle) {
    const dx = Math.cos(angle), dy = Math.sin(angle);
    let bestT = 9999;
    let bestBall = null;
    for (const b of world.balls) {
      if (b.id === 0 || !b.inPlay) continue;
      const rx = b.x - origin.x, ry = b.y - origin.y;
      const proj = rx * dx + ry * dy;
      if (proj <= 0) continue;
      const perpSq = rx * rx + ry * ry - proj * proj;
      const minD = BALL_R * 2;
      if (perpSq < minD * minD) {
        const hitT = proj - Math.sqrt(minD * minD - perpSq);
        if (hitT > 0 && hitT < bestT) {
          bestT = hitT;
          bestBall = b;
        }
      }
    }
    if (!bestBall) return null;
    const gx = origin.x + dx * bestT;
    const gy = origin.y + dy * bestT;
    const nx = bestBall.x - gx, ny = bestBall.y - gy;
    const nl = Math.hypot(nx, ny) || 1;
    return { t: bestT, ghost: { x: gx, y: gy }, target: bestBall, dir: { x: nx / nl, y: ny / nl } };
  }

  // --- 可愛 CPU 思考與出桿 ---
  function planCpuShot() {
    const targets = world.balls.filter(b => b.id !== 0 && b.inPlay);
    if (!targets.length) return { angle: 0, power: 0.6 };
    let best = null;
    for (const tb of targets) {
      for (const pk of world.pockets) {
        const tx = pk.x - tb.x, ty = pk.y - tb.y;
        const tl = Math.hypot(tx, ty) || 1;
        const gx = tb.x - (tx / tl) * (BALL_R * 2);
        const gy = tb.y - (ty / tl) * (BALL_R * 2);
        const ang = Math.atan2(gy - world.cue.y, gx - world.cue.x);
        const cx = Math.cos(ang), cy = Math.sin(ang);
        const align = cx * (tx / tl) + cy * (ty / tl);
        if (align <= 0.15) continue;
        const score = align * 120 - dist(tb, pk) * 0.08 - dist(world.cue, tb) * 0.05;
        if (!best || score > best.score) {
          best = { angle: ang, power: clamp(0.45 + dist(world.cue, pk) / 1100, 0.42, 0.90), score };
        }
      }
    }
    if (!best) {
      const tb = targets[0];
      best = { angle: Math.atan2(tb.y - world.cue.y, tb.x - world.cue.x), power: 0.72 };
    }
    // 依難度加入可愛誤差
    const err = diffLevel === 0 ? 0.14 : diffLevel === 1 ? 0.065 : 0.02;
    best.angle += (Math.random() - 0.5) * err * 2;
    return best;
  }

  // --- 物理更新 ---
  function stepPhysics(dt) {
    const sub = 4;
    const sdt = dt / sub;
    let moving = false;

    for (let s = 0; s < sub; s++) {
      for (const b of world.balls) {
        if (!b.inPlay) continue;
        // 微微旋球弧線（僅母球）
        if (b.id === 0 && (b.spinX || b.spinY)) {
          const sp = Math.hypot(b.vx, b.vy);
          if (sp > 20) {
            const nx = -b.vy / sp, ny = b.vx / sp;
            b.vx += nx * (b.spinX || 0) * sdt * 0.45;
            b.vy += ny * (b.spinX || 0) * sdt * 0.45;
            b.vx += (b.vx / sp) * (b.spinY || 0) * sdt * 0.35;
            b.vy += (b.vy / sp) * (b.spinY || 0) * sdt * 0.35;
            b.spinX *= Math.pow(0.18, sdt);
            b.spinY *= Math.pow(0.18, sdt);
          }
        }

        b.x += b.vx * sdt;
        b.y += b.vy * sdt;

        // 柔和桌布阻尼
        const damp = Math.pow(0.42, sdt);
        b.vx *= damp;
        b.vy *= damp;
        const spdNow = Math.hypot(b.vx, b.vy);
        if (spdNow < 9) { b.vx = 0; b.vy = 0; }
        else {
          moving = true;
          if (s === 0 && spdNow > 240 && Math.random() < 0.55) {
            const stTrail = BALL_STYLES[b.id] || BALL_STYLES[1];
            trails.push({ x: b.x, y: b.y, r: 5 + Math.random() * 4, color: stTrail.color, age: 0, maxAge: 0.34 });
          }
        }

        // 場上幸運驚喜星收集（觸發巨無霸大袋口！）
        if (bumpersOn && luckyStar && dist(b, luckyStar) < BALL_R + luckyStar.r) {
          const lx = luckyStar.x, ly = luckyStar.y;
          luckyStar = null;
          bigPocketTurns = 2;
          sound.playWin();
          spawnPopBurst(lx, ly, '#ffd13b', true);
          spawnFloater(lx, ly - 18, 'BIG POCKETS! 🌟', '#ff477e');
          showRawNotice(randomQuip('luckyBig'), 2600);
        }

        // 進袋檢測（先於牆壁反彈；巨無霸袋口啟動時袋口額外加大 +11px！）
        const activePocketR = POCKET_R + (bigPocketTurns > 0 ? 11 : 0);
        let pocketed = false;
        for (const pk of world.pockets) {
          if (dist(b, pk) < activePocketR) {
            pocketed = true;
            if (b.id === 0) {
              b.inPlay = false; b.vx = 0; b.vy = 0;
              world.turnScratched = true;
              sound.playScratch();
              spawnPopBurst(pk.x, pk.y, '#ff5c8a', true);
            } else {
              b.inPlay = false; b.vx = 0; b.vy = 0;
              world.turnPocketed += 1;
              world.score[world.turn] += 1;
              world.combo += 1;
              sound.playPocket(world.combo);
              const st = BALL_STYLES[b.id] || BALL_STYLES[1];
              spawnPopBurst(pk.x, pk.y, st.color, true);
              spawnFloater(pk.x, pk.y - 12, world.combo > 1 ? `+1 ×${world.combo}!` : '+1 ✨', st.color);
            }
            break;
          }
        }
        if (pocketed) continue;

        // 四邊彈性糖果護欄
        if (b.x < BALL_R) { b.x = BALL_R; b.vx = Math.abs(b.vx) * 0.88; b.squash = 0.22; b.squashAng = 0; sound.playRail(); }
        if (b.x > world.w - BALL_R) { b.x = world.w - BALL_R; b.vx = -Math.abs(b.vx) * 0.88; b.squash = 0.22; b.squashAng = 0; sound.playRail(); }
        if (b.y < BALL_R) { b.y = BALL_R; b.vy = Math.abs(b.vy) * 0.88; b.squash = 0.22; b.squashAng = Math.PI * 0.5; sound.playRail(); }
        if (b.y > world.h - BALL_R) { b.y = world.h - BALL_R; b.vy = -Math.abs(b.vy) * 0.88; b.squash = 0.22; b.squashAng = Math.PI * 0.5; sound.playRail(); }

        // 可愛彈跳星機關碰撞（Boing!）
        if (bumpersOn) {
          for (const bm of world.bumpers) {
            const dx = b.x - bm.x, dy = b.y - bm.y;
            const d = Math.hypot(dx, dy);
            const minD = BALL_R + bm.r;
            if (d < minD && d > 0.001) {
              const nx = dx / d, ny = dy / d;
              b.x = bm.x + nx * minD;
              b.y = bm.y + ny * minD;
              const vn = b.vx * nx + b.vy * ny;
              const boost = Math.max(240, Math.abs(vn) * 1.18);
              b.vx = b.vx - vn * nx + nx * boost;
              b.vy = b.vy - vn * ny + ny * boost;
              bm.pulse = 1;
              b.squash = 0.30;
              b.squashAng = Math.atan2(ny, nx);
              b.dizzy = 0.7;
              sound.playBumper();
              spawnPopBurst(bm.x, bm.y, bm.color, false);
              spawnFloater(bm.x, bm.y - 24, 'BOING! ⭐', '#ff8c42');
            }
          }
        }
      }

      // 球與球彈性碰撞
      for (let i = 0; i < world.balls.length; i++) {
        const a = world.balls[i];
        if (!a.inPlay) continue;
        for (let j = i + 1; j < world.balls.length; j++) {
          const b = world.balls[j];
          if (!b.inPlay) continue;
          const dx = b.x - a.x, dy = b.y - a.y;
          const d = Math.hypot(dx, dy);
          const minD = BALL_R * 2;
          if (d < minD && d > 0.001) {
            const nx = dx / d, ny = dy / d;
            const overlap = (minD - d) * 0.5;
            a.x -= nx * overlap; a.y -= ny * overlap;
            b.x += nx * overlap; b.y += ny * overlap;
            const rvx = b.vx - a.vx, rvy = b.vy - a.vy;
            const vn = rvx * nx + rvy * ny;
            if (vn < 0) {
              const imp = -vn * 0.94;
              a.vx -= imp * nx; a.vy -= imp * ny;
              b.vx += imp * nx; b.vy += imp * ny;
              if (a.id === 0 || b.id === 0) world.turnFirstHit = true;
              const ang = Math.atan2(ny, nx);
              a.squash = Math.min(0.28, Math.abs(vn) * 0.0005); a.squashAng = ang;
              b.squash = Math.min(0.28, Math.abs(vn) * 0.0005); b.squashAng = ang;
              if (Math.abs(vn) > 150) { a.dizzy = 0.65; b.dizzy = 0.65; }
              sound.playHit(Math.abs(vn));
            }
          }
        }
      }
    }

    if (!moving && world.phase === 'rolling') {
      finishTurn();
    }
  }

  function finishTurn() {
    if (bigPocketTurns > 0) bigPocketTurns -= 1;
    if (bumpersOn && !luckyStar && Math.random() < 0.55) spawnLuckyStar();
    // 檢查勝負（先進 4 球或桌上無目標球時高分者勝）
    const remaining = world.balls.filter(b => b.id !== 0 && b.inPlay).length;
    if (world.score[0] >= WIN_SCORE || world.score[1] >= WIN_SCORE || remaining === 0) {
      world.phase = 'end';
      world.winner = world.score[0] >= world.score[1] ? 0 : 1;
      if (world.winner === 0) {
        streak += 1;
        bestStreak = Math.max(bestStreak, streak);
        sound.playWin();
      } else {
        streak = 0;
      }
      updateHUD();
      return;
    }

    // 犯規處理：白球落袋或沒撞到任何球 -> 換人＋自由球
    if (world.turnScratched || !world.turnFirstHit) {
      world.combo = 0;
      const nextTurn = 1 - world.turn;
      world.turn = nextTurn;
      if (!world.cue.inPlay) {
        world.cue.inPlay = true;
        world.cue.x = world.vertical ? world.w * 0.5 : world.w * 0.25;
        world.cue.y = world.vertical ? world.h * 0.76 : world.h * 0.5;
      }
      if (nextTurn === 0) {
        world.phase = 'aim';
        world.ballInHand = true;
        showNotice(world.turnScratched ? 'scratch' : 'miss');
      } else {
        world.phase = 'cpu';
        world.ballInHand = false;
        world.cpuTimer = 0;
        world.cpuPlan = planCpuShot();
        showNotice(world.turnScratched ? 'scratch' : 'miss');
      }
      updateHUD();
      return;
    }

    // 有進袋 -> 繼續出桿！
    if (world.turnPocketed > 0) {
      if (world.turn === 0) {
        world.phase = 'aim';
        if (world.combo > 1) showNotice('combo', world.combo);
        else showRawNotice(randomQuip('playerScore'));
      } else {
        world.phase = 'cpu';
        world.cpuTimer = 0;
        world.cpuPlan = planCpuShot();
        showRawNotice(randomQuip('cpuScore'));
      }
      updateHUD();
      return;
    }

    // 沒進袋 -> 換手
    world.combo = 0;
    world.turn = 1 - world.turn;
    if (world.turn === 0) {
      world.phase = 'aim';
      showNotice('aim');
    } else {
      world.phase = 'cpu';
      world.cpuTimer = 0;
      world.cpuPlan = planCpuShot();
      showRawNotice(randomQuip('cpuTurn'));
    }
    updateHUD();
  }

  // --- 繪製可愛多彩糖果球桌與 Q 彈球體（全前景統一 2.4px 描邊）---
  function drawStar(cx, cy, spikes, outerR, innerR, rot = -Math.PI / 2) {
    ctx.beginPath();
    for (let i = 0; i < spikes * 2; i++) {
      const r = i % 2 === 0 ? outerR : innerR;
      const a = rot + (Math.PI * i) / spikes;
      const x = cx + Math.cos(a) * r;
      const y = cy + Math.sin(a) * r;
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    }
    ctx.closePath();
  }

  function drawCuteBall(b, tNow) {
    const st = BALL_STYLES[b.id] || BALL_STYLES[1];
    const spd = Math.hypot(b.vx, b.vy);
    const isDizzy = b.dizzy > 0 || spd > 380;
    const isBlinking = !isDizzy && ((tNow + b.blink) % 3.8 > 3.66);

    ctx.save();
    ctx.translate(b.x, b.y);
    // 柔和落地陰影
    ctx.fillStyle = 'rgba(58, 31, 18, 0.22)';
    ctx.beginPath();
    ctx.ellipse(3, 5, BALL_R * 0.96, BALL_R * 0.86, 0, 0, Math.PI * 2);
    ctx.fill();

    // 果凍彈性變形
    if (b.squash > 0.01) {
      ctx.rotate(b.squashAng);
      ctx.scale(1 - b.squash * 0.55, 1 + b.squash * 0.55);
      ctx.rotate(-b.squashAng);
    }

    // 球體主色漸層
    const g = ctx.createRadialGradient(-BALL_R * 0.32, -BALL_R * 0.35, BALL_R * 0.12, 0, 0, BALL_R);
    g.addColorStop(0, '#ffffff');
    g.addColorStop(0.24, st.color);
    g.addColorStop(0.84, st.color);
    g.addColorStop(1, st.shade);
    ctx.fillStyle = g;
    ctx.strokeStyle = INK;
    ctx.lineWidth = STROKE_W;
    ctx.beginPath();
    ctx.arc(0, 0, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // 柴犬白球加兩隻超可愛小尖耳
    if (b.id === 0) {
      ctx.fillStyle = '#f6c27b';
      ctx.strokeStyle = INK;
      ctx.lineWidth = STROKE_W;
      for (const dir of [-1, 1]) {
        ctx.beginPath();
        ctx.moveTo(dir * 10, -16);
        ctx.lineTo(dir * 18, -25);
        ctx.lineTo(dir * 18, -11);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
      }
    }

    // 糖果亮面高光
    ctx.fillStyle = 'rgba(255, 255, 255, 0.68)';
    ctx.beginPath();
    ctx.ellipse(-BALL_R * 0.34, -BALL_R * 0.42, 6.2, 3.2, -0.55, 0, Math.PI * 2);
    ctx.fill();

    // 可愛腮紅
    ctx.fillStyle = st.cheek;
    ctx.globalAlpha = 0.72;
    ctx.beginPath(); ctx.ellipse(-9.5, 3.5, 4.2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.ellipse(9.5, 3.5, 4.2, 2.5, 0, 0, Math.PI * 2); ctx.fill();
    ctx.globalAlpha = 1;

    // 可愛眼睛與表情
    ctx.strokeStyle = INK;
    ctx.fillStyle = INK;
    ctx.lineWidth = 2.2;
    ctx.lineCap = 'round';
    if (isDizzy) {
      // > < 暈暈可愛臉
      ctx.beginPath();
      ctx.moveTo(-9, -4); ctx.lineTo(-5, -1); ctx.lineTo(-9, 2);
      ctx.moveTo(9, -4); ctx.lineTo(5, -1); ctx.lineTo(9, 2);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 6, 3.2, 0, Math.PI * 2); ctx.stroke();
    } else if (isBlinking) {
      ctx.beginPath();
      ctx.moveTo(-9.5, -1); ctx.lineTo(-4.5, -1);
      ctx.moveTo(4.5, -1); ctx.lineTo(9.5, -1);
      ctx.stroke();
      ctx.beginPath(); ctx.arc(0, 3.5, 3.8, 0.15, Math.PI - 0.15); ctx.stroke();
    } else {
      // 亮晶晶大眼
      ctx.beginPath(); ctx.arc(-6.5, -2, 3.1, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(6.5, -2, 3.1, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath(); ctx.arc(-7.4, -3.1, 1.2, 0, Math.PI * 2); ctx.fill();
      ctx.beginPath(); ctx.arc(5.6, -3.1, 1.2, 0, Math.PI * 2); ctx.fill();
      // 可愛微笑
      ctx.beginPath(); ctx.arc(0, 3, 4.2, 0.15, Math.PI - 0.15); ctx.stroke();
    }

    // 底部可愛小號碼圓徽章（非母球）
    if (b.id > 0) {
      ctx.fillStyle = '#fffdf7';
      ctx.strokeStyle = INK;
      ctx.lineWidth = 1.8;
      ctx.beginPath(); ctx.arc(0, 14.5, 6.6, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = INK;
      ctx.font = '900 9.5px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(String(b.id), 0, 15);
    }

    ctx.restore();
  }

  function drawCandyCueStick(angle, pullPx, isPulling, isCpu = false) {
    ctx.save();
    ctx.translate(world.cue.x, world.cue.y);
    ctx.rotate(angle);
    const tip = -BALL_R - 10 - pullPx;
    const len = 248;
    const butt = tip - len;

    // 拉桿蓄力發光提示外框
    if (isPulling) {
      ctx.strokeStyle = isCpu ? 'rgba(167, 139, 250, 0.85)' : 'rgba(255, 224, 90, 0.85)';
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.roundRect(butt - 4, -11, len + 8, 22, 10);
      ctx.stroke();
    }

    // 柔和陰影
    ctx.fillStyle = 'rgba(58, 31, 18, 0.22)';
    ctx.beginPath();
    ctx.roundRect(butt + 2, 2, len, 11, 5);
    ctx.fill();

    // 雙方球桿明顯區分：
    // 玩家＝草莓粉白條紋糖果魔杖＋薄荷藍握把＋金色星星尾飾
    // CPU＝葡萄紫×閃電黃機器貓球桿＋深紫科技握把＋紫金菱鑽尾飾
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(butt, -8);
    ctx.lineTo(tip - 2, -4);
    ctx.lineTo(tip - 2, 4);
    ctx.lineTo(butt, 8);
    ctx.closePath();
    ctx.fillStyle = isCpu ? '#3b1d6e' : '#fff9f0';
    ctx.fill();
    ctx.save();
    ctx.clip();
    ctx.fillStyle = isCpu ? '#fde047' : '#ff6b9d';
    for (let sx = butt - 10; sx < tip; sx += 24) {
      ctx.beginPath();
      ctx.moveTo(sx, -12);
      ctx.lineTo(sx + (isCpu ? 8 : 10), -12);
      ctx.lineTo(sx + (isCpu ? 16 : 18), 12);
      ctx.lineTo(sx + 8, 12);
      ctx.closePath();
      ctx.fill();
    }
    ctx.fillStyle = isCpu ? '#1e1b4b' : '#38bdf8';
    ctx.fillRect(butt, -10, 62, 20);
    ctx.fillStyle = isCpu ? '#38e8ff' : '#ffd13b';
    ctx.fillRect(butt + 60, -10, 8, 20);
    ctx.fillStyle = isCpu ? '#e2e8f0' : '#ffd13b';
    ctx.fillRect(tip - 13, -6, 8, 12);
    ctx.fillStyle = isCpu ? '#a855f7' : '#ff477e';
    ctx.fillRect(tip - 5, -6, 5, 12);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(butt, -8);
    ctx.lineTo(tip - 2, -4);
    ctx.lineTo(tip - 2, 4);
    ctx.lineTo(butt, 8);
    ctx.closePath();
    ctx.strokeStyle = INK;
    ctx.lineWidth = STROKE_W;
    ctx.stroke();

    // 尾飾造型也不同：玩家金色五角星 vs CPU 紫青科技菱鑽
    if (isCpu) {
      ctx.fillStyle = '#38e8ff';
      ctx.beginPath();
      ctx.moveTo(butt - 13, 0); ctx.lineTo(butt - 2, -10);
      ctx.lineTo(butt + 7, 0); ctx.lineTo(butt - 2, 10);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
    } else {
      ctx.fillStyle = '#ffd13b';
      drawStar(butt - 2, 0, 5, 11, 5.2, 0);
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();
  }

  function render(tNow, dt) {
    const theme = THEMES[themeIdx];
    const bw = canvas.width / dpr;
    const bh = canvas.height / dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    // 外圍柔和糖果粉彩底色＋斜紋裝飾
    ctx.fillStyle = theme.pageBg;
    ctx.fillRect(0, 0, bw, bh);

    ctx.save();
    ctx.translate(viewRect.x, viewRect.y);
    ctx.scale(viewScale, viewScale);

    // 1. 糖果條紋外框
    const railPad = 22;
    ctx.fillStyle = 'rgba(58, 31, 18, 0.18)';
    ctx.beginPath();
    ctx.roundRect(-railPad + 5, -railPad + 7, world.w + railPad * 2, world.h + railPad * 2, 26);
    ctx.fill();

    ctx.fillStyle = theme.railOuter;
    ctx.strokeStyle = INK;
    ctx.lineWidth = STROKE_W * 1.1;
    ctx.beginPath();
    ctx.roundRect(-railPad, -railPad, world.w + railPad * 2, world.h + railPad * 2, 24);
    ctx.fill();
    ctx.stroke();

    // 護欄內緣條紋點綴
    ctx.strokeStyle = theme.railStripe;
    ctx.lineWidth = 5;
    ctx.setLineDash([16, 14]);
    ctx.beginPath();
    ctx.roundRect(-railPad + 9, -railPad + 9, world.w + railPad * 2 - 18, world.h + railPad * 2 - 18, 17);
    ctx.stroke();
    ctx.setLineDash([]);

    // 2. 彩色可愛桌布
    const fg = ctx.createLinearGradient(0, 0, world.w, world.h);
    fg.addColorStop(0, theme.feltA);
    fg.addColorStop(1, theme.feltB);
    ctx.fillStyle = fg;
    ctx.strokeStyle = theme.cushion;
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.roundRect(0, 0, world.w, world.h, 14);
    ctx.fill();
    ctx.stroke();

    // 桌布淡淡點點糖果紋理
    ctx.fillStyle = theme.feltDot;
    for (let gy = 36; gy < world.h - 24; gy += 48) {
      for (let gx = 36; gx < world.w - 24; gx += 48) {
        ctx.beginPath();
        ctx.arc(gx + ((gy / 48) % 2) * 16, gy, 3.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // 桌布開球虛線與中央星標
    ctx.strokeStyle = theme.lineCol;
    ctx.lineWidth = 2;
    ctx.setLineDash([7, 7]);
    ctx.beginPath();
    if (world.vertical) {
      ctx.moveTo(28, world.h * 0.78); ctx.lineTo(world.w - 28, world.h * 0.78);
    } else {
      ctx.moveTo(world.w * 0.22, 28); ctx.lineTo(world.w * 0.22, world.h - 28);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. 超可愛星星甜甜圈大袋口（巨無霸袋口啟動時自動發光膨脹！）
    const drawPocketR = POCKET_R + (bigPocketTurns > 0 ? 10 : 0);
    for (const pk of world.pockets) {
      ctx.fillStyle = bigPocketTurns > 0 ? '#fde047' : theme.pocketOuter;
      ctx.strokeStyle = INK;
      ctx.lineWidth = STROKE_W;
      ctx.beginPath(); ctx.arc(pk.x, pk.y, drawPocketR + 5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

      ctx.fillStyle = theme.pocketInner;
      ctx.beginPath(); ctx.arc(pk.x, pk.y, drawPocketR - 3, 0, Math.PI * 2); ctx.fill();

      // 袋口小星星裝飾
      ctx.fillStyle = bigPocketTurns > 0 ? 'rgba(255, 230, 100, 0.72)' : 'rgba(255, 240, 170, 0.35)';
      drawStar(pk.x, pk.y, 5, bigPocketTurns > 0 ? 15 : 11, 5, tNow * (bigPocketTurns > 0 ? 2.2 : 0.6));
      ctx.fill();
    }

    // 4a. 場上可收集「幸運驚喜星」（巨無霸袋口道具）
    if (bumpersOn && luckyStar) {
      const bob = Math.sin(tNow * 5 + luckyStar.phase) * 3;
      ctx.save();
      ctx.translate(luckyStar.x, luckyStar.y + bob);
      ctx.fillStyle = 'rgba(255, 224, 102, 0.32)';
      ctx.beginPath(); ctx.arc(0, 0, luckyStar.r + 7 + Math.sin(tNow * 7) * 2, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = '#fff59d';
      ctx.strokeStyle = INK;
      ctx.lineWidth = STROKE_W;
      drawStar(0, 0, 5, luckyStar.r, luckyStar.r * 0.5, tNow * 1.4);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#ff477e';
      ctx.font = '900 11px sans-serif';
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('★', 0, 1);
      ctx.restore();
    }

    // 4b. 高速糖果球星塵拖尾
    for (let i = trails.length - 1; i >= 0; i--) {
      const tr = trails[i];
      tr.age += dt;
      if (tr.age >= tr.maxAge) { trails.splice(i, 1); continue; }
      const p = 1 - tr.age / tr.maxAge;
      ctx.save();
      ctx.globalAlpha = p * 0.45;
      ctx.fillStyle = tr.color;
      ctx.beginPath(); ctx.arc(tr.x, tr.y, tr.r * p, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // 4. 可愛彈跳星機關（開啟時）
    if (bumpersOn) {
      for (const bm of world.bumpers) {
        bm.pulse = Math.max(0, bm.pulse - dt * 4);
        const sc = 1 + bm.pulse * 0.26;
        ctx.save();
        ctx.translate(bm.x, bm.y);
        ctx.scale(sc, sc);
        ctx.fillStyle = bm.color;
        ctx.strokeStyle = INK;
        ctx.lineWidth = STROKE_W;
        drawStar(0, 0, 5, bm.r + 4, bm.r * 0.56, tNow * 0.45);
        ctx.fill();
        ctx.stroke();
        // 彈跳星笑臉
        ctx.fillStyle = INK;
        ctx.beginPath(); ctx.arc(-4.5, -1, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.beginPath(); ctx.arc(4.5, -1, 2.2, 0, Math.PI * 2); ctx.fill();
        ctx.strokeStyle = INK; ctx.lineWidth = 1.8;
        ctx.beginPath(); ctx.arc(0, 2.5, 3, 0.2, Math.PI - 0.2); ctx.stroke();
        ctx.restore();
      }
    }

    // 5. 彩虹虛線瞄準軌跡＋幽靈球預覽（輪到玩家或 CPU 瞄準時）
    if (world.cue.inPlay && !world.ballInHand && (world.phase === 'aim' || world.phase === 'cpu')) {
      const contact = computeFirstContact(world.cue, world.angle);
      const dx = Math.cos(world.angle), dy = Math.sin(world.angle);
      const endPt = contact ? contact.ghost : { x: world.cue.x + dx * 320, y: world.cue.y + dy * 320 };

      ctx.strokeStyle = '#fffdf7';
      ctx.lineWidth = 3.2;
      ctx.setLineDash([8, 8]);
      ctx.beginPath();
      ctx.moveTo(world.cue.x + dx * (BALL_R + 4), world.cue.y + dy * (BALL_R + 4));
      ctx.lineTo(endPt.x, endPt.y);
      ctx.stroke();
      ctx.setLineDash([]);

      if (contact) {
        // 可愛幽靈球虛線圓
        ctx.strokeStyle = '#fffdf7';
        ctx.lineWidth = 2.4;
        ctx.beginPath(); ctx.arc(contact.ghost.x, contact.ghost.y, BALL_R, 0, Math.PI * 2); ctx.stroke();
        // 目標球飛出方向線
        ctx.strokeStyle = '#ffd13b';
        ctx.lineWidth = 3.4;
        ctx.setLineDash([6, 6]);
        ctx.beginPath();
        ctx.moveTo(contact.target.x, contact.target.y);
        ctx.lineTo(contact.target.x + contact.dir.x * 135, contact.target.y + contact.dir.y * 135);
        ctx.stroke();
        ctx.setLineDash([]);
      }
    }

    // 6. 繪製全部 Q 彈糖果球
    for (const b of world.balls) {
      if (!b.inPlay) continue;
      b.squash = Math.max(0, b.squash - dt * 2.8);
      b.dizzy = Math.max(0, b.dizzy - dt);
      drawCuteBall(b, tNow);
    }

    // 自由球擺放預覽
    if (world.ballInHand && placement) {
      const ok = canPlaceCue(placement);
      ctx.save();
      ctx.globalAlpha = ok ? 0.82 : 0.35;
      ctx.fillStyle = ok ? '#fff8ec' : '#ff5c8a';
      ctx.strokeStyle = INK;
      ctx.lineWidth = STROKE_W;
      ctx.beginPath(); ctx.arc(placement.x, placement.y, BALL_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // 7. 繪製可愛糖果球桿（輪到玩家或 CPU 瞄準）
    if (world.cue.inPlay && !world.ballInHand && (world.phase === 'aim' || world.phase === 'cpu')) {
      const isPulling = !!(pointer && pointer.pulled);
      const pullPx = world.phase === 'aim'
        ? (isPulling ? getPower() * 62 : 0)
        : Math.sin(Math.PI * Math.min(1, world.cpuTimer / 0.85)) * 38;
      drawCandyCueStick(world.angle, pullPx, isPulling, world.phase === 'cpu');
    }

    // 8. 進袋與撞擊星光特效
    for (let i = effects.length - 1; i >= 0; i--) {
      const e = effects[i];
      e.age += dt;
      if (e.age >= e.maxAge) { effects.splice(i, 1); continue; }
      const p = e.age / e.maxAge;
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.strokeStyle = e.color;
      ctx.lineWidth = 4 * (1 - p * 0.5);
      ctx.beginPath(); ctx.arc(e.x, e.y, e.r + (e.maxR - e.r) * p, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    for (let i = sparkles.length - 1; i >= 0; i--) {
      const sp = sparkles[i];
      sp.age += dt;
      if (sp.age >= sp.maxAge) { sparkles.splice(i, 1); continue; }
      sp.x += sp.vx * dt; sp.y += sp.vy * dt;
      sp.vx *= 0.94; sp.vy *= 0.94;
      ctx.save();
      ctx.globalAlpha = 1 - sp.age / sp.maxAge;
      ctx.fillStyle = sp.color;
      drawStar(sp.x, sp.y, 5, sp.r, sp.r * 0.48, sp.age * 5);
      ctx.fill();
      ctx.restore();
    }
    for (let i = floaters.length - 1; i >= 0; i--) {
      const f = floaters[i];
      f.age += dt;
      if (f.age >= f.maxAge) { floaters.splice(i, 1); continue; }
      const p = f.age / f.maxAge;
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.font = '900 18px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#fffdf7';
      ctx.strokeText(f.text, f.x, f.y - p * 34);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y - p * 34);
      ctx.restore();
    }

    ctx.restore();
  }

  // --- 手指／滑鼠直覺操作（支援抓糖果球桿往後拉蓄力＋即時更新力道＋放開或順手前推出桿！）---
  function toWorld(ev) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (ev.clientX - rect.left - viewRect.x) / viewScale,
      y: (ev.clientY - rect.top - viewRect.y) / viewScale
    };
  }

  function isOnCueStick(pt) {
    const vx = pt.x - world.cue.x;
    const vy = pt.y - world.cue.y;
    const bx = -Math.cos(world.angle);
    const by = -Math.sin(world.angle);
    const proj = vx * bx + vy * by;
    const perp = Math.abs(vx * (-by) + vy * bx);
    return proj >= BALL_R * 0.5 && proj <= 290 && perp <= 32;
  }

  canvas.addEventListener('pointerdown', ev => {
    if (!ev.isPrimary || ev.button !== 0 || paused || world.phase !== 'aim') return;
    sound.wake();
    toggleSpin(false);
    const pt = toWorld(ev);
    if (world.ballInHand) {
      placement = pt;
      pointer = { id: ev.pointerId, mode: 'place' };
      canvas.setPointerCapture(ev.pointerId);
      return;
    }
    const onBall = dist(pt, world.cue) < BALL_R + 14;
    const onStick = isOnCueStick(pt);
    pointer = {
      id: ev.pointerId,
      mode: onStick ? 'stick' : (onBall ? 'ball' : 'aim'),
      start: pt,
      angle: world.angle,
      pulled: false,
      lastBack: 0,
      maxBack: 0,
      peakPower: getPower(),
      struck: false
    };
    canvas.setPointerCapture(ev.pointerId);
    if (pointer.mode === 'aim') {
      world.angle = Math.atan2(pt.y - world.cue.y, pt.x - world.cue.x);
    }
  });

  canvas.addEventListener('pointermove', ev => {
    const pt = toWorld(ev);
    if (!pointer || pointer.id !== ev.pointerId) {
      if (world.ballInHand && world.phase === 'aim') placement = pt;
      return;
    }
    if (pointer.struck) return;
    if (pointer.mode === 'place') {
      placement = pt;
      return;
    }
    if (pointer.mode === 'aim') {
      world.angle = Math.atan2(pt.y - world.cue.y, pt.x - world.cue.x);
      return;
    }
    if (pointer.mode === 'stick') {
      const bx = -Math.cos(pointer.angle);
      const by = -Math.sin(pointer.angle);
      const back = (pt.x - pointer.start.x) * bx + (pt.y - pointer.start.y) * by;
      const forwardPush = pointer.lastBack - back;
      pointer.lastBack = back;
      if (back > 6 || pointer.pulled) {
        pointer.pulled = true;
        const clampedBack = Math.max(0, back);
        if (clampedBack > pointer.maxBack) {
          pointer.maxBack = clampedBack;
          pointer.peakPower = clamp(clampedBack / 145, MIN_POWER, 1);
        }
        setPower(clamp(clampedBack / 145, MIN_POWER, 1));
        if (pointer.maxBack > 28 && back <= 5 && forwardPush > 5) {
          pointer.struck = true;
          setPower(pointer.peakPower);
          fireShot(world.angle, pointer.peakPower, spin);
        }
      }
    } else if (pointer.mode === 'ball') {
      const len = dist(pt, world.cue);
      if (len > 20 || pointer.pulled) {
        pointer.pulled = true;
        if (len > 8) world.angle = Math.atan2(world.cue.y - pt.y, world.cue.x - pt.x);
        setPower(clamp((len - 14) / 140, MIN_POWER, 1));
      }
    }
  });

  function onPointerEnd(ev, cancelled) {
    if (!pointer || pointer.id !== ev.pointerId) return;
    const prev = pointer;
    pointer = null;
    if (prev.struck) return;
    if (cancelled) { placement = null; return; }
    if (prev.mode === 'place') {
      const pt = toWorld(ev);
      if (canPlaceCue(pt)) {
        world.cue.x = pt.x; world.cue.y = pt.y;
        world.ballInHand = false;
        placement = null;
        statusOverride = null;
        updateHUD();
      }
      return;
    }
    if (prev.mode === 'stick' && prev.pulled && prev.lastBack > 14) {
      fireShot(world.angle, getPower(), spin);
    } else if (prev.mode === 'ball' && prev.pulled && dist(toWorld(ev), world.cue) > 26) {
      fireShot(world.angle, getPower(), spin);
    }
  }
  canvas.addEventListener('pointerup', ev => onPointerEnd(ev, false));
  canvas.addEventListener('pointercancel', ev => onPointerEnd(ev, true));

  // --- UI 綁定 ---
  function setSpin(next) {
    const mag = Math.max(1, Math.hypot(next.x, next.y));
    spin = { x: next.x / mag, y: next.y / mag };
    $('spinDot').style.left = `${50 + spin.x * 36}%`;
    $('spinDot').style.top = `${50 - spin.y * 36}%`;
  }
  function toggleSpin(open) {
    $('spinPanel').hidden = !open;
    $('btnSpin').setAttribute('aria-expanded', String(open));
  }

  function applyCopy() {
    document.title = `撞球-2｜${t('title')}`;
    document.querySelectorAll('[data-copy]').forEach(el => {
      el.textContent = t(el.dataset.copy);
    });
    $('selLang').value = lang;
    updateHUD();
  }

  function updateHUD() {
    $('playerScore').querySelector('b').textContent = String(world.score[0]);
    $('cpuScore').querySelector('b').textContent = String(world.score[1]);
    $('playerScore').classList.toggle('active', world.turn === 0 && world.phase !== 'end');
    $('cpuScore').classList.toggle('active', world.turn === 1 && world.phase !== 'end');
    const pPips = document.querySelectorAll('#playerPips span');
    pPips.forEach((sp, i) => sp.classList.toggle('lit', i < world.score[0]));
    const cPips = document.querySelectorAll('#cpuPips span');
    cPips.forEach((sp, i) => sp.classList.toggle('lit', i < world.score[1]));

    const playable = world.phase === 'aim' && !world.ballInHand && !paused;
    $('btnShoot').disabled = !playable;
    $('powerRange').disabled = !playable;
    $('btnSpin').disabled = !playable;
    $('btnShoot').textContent = t(world.shots === 0 ? 'break' : 'shoot');
    $('btnBumper').classList.toggle('on', bumpersOn);
    $('btnSound').textContent = sound.muted ? '🔇' : '🔊';
    $('btnSound').setAttribute('aria-pressed', String(sound.muted));

    const now = performance.now();
    const defaultMsg = world.phase === 'rolling' ? t('rolling')
      : world.phase === 'cpu' ? t('cpu')
      : world.ballInHand ? t('place')
      : world.shots === 0 ? t('breakHint') : t('aim');
    $('statusBar').textContent = (statusOverride && statusOverride.until > now) ? statusOverride.text : defaultMsg;
    $('statusBar').hidden = world.phase === 'end';

    const ended = world.phase === 'end';
    $('modalOverlay').hidden = !paused && !ended;
    if (paused || ended) {
      $('modalTitle').textContent = ended ? t(world.winner === 0 ? 'won' : 'lost') : t('pause');
      $('modalScore').hidden = !ended;
      $('modalScore').textContent = `${world.score[0]} : ${world.score[1]}`;
      $('modalStreak').textContent = `${t('streak', streak)} · ${t('best', bestStreak)}`;
      $('btnResume').hidden = ended;
    }
  }

  $('btnShoot').addEventListener('click', () => {
    if (world.phase !== 'aim' || paused || world.ballInHand) return;
    sound.wake();
    toggleSpin(false);
    fireShot(world.angle, getPower(), spin);
  });
  $('powerRange').addEventListener('input', () => setPower(getPower()));
  $('btnSpin').addEventListener('click', () => toggleSpin($('spinPanel').hidden));
  $('btnSpinClose').addEventListener('click', () => toggleSpin(false));
  $('btnSpinReset').addEventListener('click', () => setSpin({ x: 0, y: 0 }));

  const spinPad = $('spinPad');
  let spinDragging = false;
  function updateSpinFromEvent(ev) {
    const r = spinPad.getBoundingClientRect();
    setSpin({
      x: ((ev.clientX - r.left) / r.width - 0.5) * 2,
      y: -((ev.clientY - r.top) / r.height - 0.5) * 2
    });
  }
  spinPad.addEventListener('pointerdown', ev => { spinDragging = true; spinPad.setPointerCapture(ev.pointerId); updateSpinFromEvent(ev); });
  spinPad.addEventListener('pointermove', ev => { if (spinDragging) updateSpinFromEvent(ev); });
  spinPad.addEventListener('pointerup', () => { spinDragging = false; });

  $('btnTheme').addEventListener('click', () => {
    sound.wake();
    themeIdx = (themeIdx + 1) % THEMES.length;
    showNotice('themeSwitched', THEMES[themeIdx].name[lang] || THEMES[themeIdx].name.tw);
  });
  $('btnBumper').addEventListener('click', () => {
    sound.wake();
    bumpersOn = !bumpersOn;
    showNotice(bumpersOn ? 'bumperOn' : 'bumperOff');
  });
  $('btnSound').addEventListener('click', () => {
    sound.muted = !sound.muted;
    if (!sound.muted) sound.wake();
    updateHUD();
  });
  $('btnPause').addEventListener('click', () => { paused = !paused; toggleSpin(false); updateHUD(); });
  $('btnResume').addEventListener('click', () => { paused = false; updateHUD(); });
  $('btnRematch').addEventListener('click', () => { sound.wake(); resetMatch(); });
  $('selDiff').addEventListener('change', e => { diffLevel = Number(e.target.value) || 0; });
  $('selLang').addEventListener('change', e => {
    lang = e.target.value;
    if (i18n && i18n.setLang) i18n.setLang(lang);
    applyCopy();
  });
  $('btnFs').addEventListener('click', () => {
    const fsEl = document.fullscreenElement || document.webkitFullscreenElement;
    if (fsEl) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
    else (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)?.call(document.documentElement)?.catch?.(() => {});
  });
  document.addEventListener('fullscreenchange', () => {
    $('btnFs').textContent = (document.fullscreenElement || document.webkitFullscreenElement) ? '✕' : '⛶';
  });

  if (i18n && i18n.onChange) {
    i18n.onChange(next => { if (COPY[next]) { lang = next; applyCopy(); } });
  }

  window.addEventListener('resize', resize);
  resize();
  applyCopy();

  // --- 主迴圈 ---
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - lastT) / 1000);
    lastT = now;

    if (!paused) {
      if (world.phase === 'rolling') {
        stepPhysics(dt);
      } else if (world.phase === 'cpu') {
        world.cpuTimer += dt;
        if (world.cpuPlan) {
          // 平滑轉向 CPU 目標角度
          const diff = Math.atan2(Math.sin(world.cpuPlan.angle - world.angle), Math.cos(world.cpuPlan.angle - world.angle));
          world.angle += diff * Math.min(1, dt * 8);
          if (world.cpuTimer >= 0.92) {
            fireShot(world.cpuPlan.angle, world.cpuPlan.power, { x: 0, y: 0 });
          }
        }
      }
    }

    render(now / 1000, dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
