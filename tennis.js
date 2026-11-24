(() => {
  'use strict';

  const canvas = document.getElementById('court');
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

  // --- 多語字典（TW / EN / KO）---
  const COPY = {
    tw: {
      title: '網球-1', you: '你', serve: '發球', drive: '抽球', driveSub: '強抽',
      drop: '小球', dropSub: '切球', smash: '殺球', smashSub: '高壓',
      opponent: 'CPU 難度', rookie: '初級・俱樂部', club: '中級・巡迴賽', pro: '高手・大滿貫',
      language: '語言', resume: '繼續比賽', rematch: '再來一局',
      guide: '先得 7 分獲勝（6-6 需領先 2 分）。拖曳球場下方走位，抓準球彈起時機按「抽球」打斜線或直線，按「小球」放網前，高球時按「殺球」！',
      serveHint: '拖曳下方走位・按「發球」開打！',
      cpuServe: 'CPU 準備發球...',
      rallying: '多拍對抽中！抓準落點光圈回擊',
      perfect: 'PERFECT! 爆速抽球 🔥',
      smashHit: 'SMASH!! 雷霆殺球 ⚡',
      dropHit: 'DROP SHOT! 精準網前小球 🎯',
      youPoint: '得分！漂亮制勝球 ✨',
      cpuPoint: 'CPU 拿下這一分',
      outCall: '出界！OUT',
      netCall: '掛網！NET',
      deuce: 'DEUCE 搶分！需領先 2 分獲勝',
      won: '🏆 大滿貫冠軍是你！',
      lost: '🎾 CPU 拿下這場比賽',
      pause: '比賽暫停',
      surfaceChanged: '場地切換：{n}',
      stats: '最長來回 {r} 拍 · 最快球速 {s} km/h · 連勝 {w}'
    },
    en: {
      title: 'Tennis-1', you: 'YOU', serve: 'Serve', drive: 'Drive', driveSub: 'Topspin',
      drop: 'Drop', dropSub: 'Slice', smash: 'Smash', smashSub: 'Power',
      opponent: 'CPU Level', rookie: 'Club Rookie', club: 'Tour Pro', pro: 'Grand Slam',
      language: 'Language', resume: 'Resume', rematch: 'Play Again',
      guide: 'First to 7 points wins (win by 2 at 6-6). Drag the lower court to move, tap Drive on the bounce for cross-court or down-the-line, Drop for net touch, Smash on high balls!',
      serveHint: 'Drag to move · Press Serve to start!',
      cpuServe: 'CPU preparing to serve...',
      rallying: 'Rally on! Time your swing on the ring',
      perfect: 'PERFECT! Blazing Drive 🔥',
      smashHit: 'SMASH!! Overhead Winner ⚡',
      dropHit: 'DROP SHOT! Soft Net Touch 🎯',
      youPoint: 'POINT YOU! Clean Winner ✨',
      cpuPoint: 'Point CPU',
      outCall: 'OUT!',
      netCall: 'NET!',
      deuce: 'DEUCE! Win by 2 points',
      won: '🏆 Grand Slam Champion!',
      lost: '🎾 CPU Wins the Match',
      pause: 'Paused',
      surfaceChanged: 'Court: {n}',
      stats: 'Max Rally {r} · Top Speed {s} km/h · Streak {w}'
    },
    ko: {
      title: '테니스-1', you: '나', serve: '서브', drive: '드라이브', driveSub: '강타',
      drop: '드롭샷', dropSub: '슬라이스', smash: '스매시', smashSub: '강스매시',
      opponent: 'CPU 난이도', rookie: '초급 · 클럽', club: '중급 · 투어', pro: '고수 · 그랜드슬램',
      language: '언어', resume: '계속하기', rematch: '한 판 더',
      guide: '7점 선취 승리(6-6 듀스 시 2점 차). 하단을 드래그해 이동하고, 바운드 타이밍에 맞춰 드라이브・드롭샷・스매시로 승부하세요!',
      serveHint: '하단 드래그 이동 · 서브 버튼으로 시작!',
      cpuServe: 'CPU 서브 준비 중...',
      rallying: '랠리 진행 중! 낙하 링에 맞춰 스윙',
      perfect: 'PERFECT! 초고속 드라이브 🔥',
      smashHit: 'SMASH!! 강력한 스매시 ⚡',
      dropHit: 'DROP SHOT! 절묘한 네트 앞 드롭 🎯',
      youPoint: '득점! 멋진 위너 샷 ✨',
      cpuPoint: 'CPU 득점',
      outCall: '아웃! OUT',
      netCall: '네트! NET',
      deuce: '듀스! 2점 차로 승리하세요',
      won: '🏆 그랜드슬램 우승!',
      lost: '🎾 CPU 승리',
      pause: '일시정지',
      surfaceChanged: '코트 변경: {n}',
      stats: '최장 랠리 {r}회 · 최고 구속 {s} km/h · 연승 {w}'
    }
  };

  let lang = (i18n && i18n.getLang && i18n.getLang()) || 'tw';
  if (!COPY[lang]) lang = 'tw';
  const t = (k, val) => (COPY[lang][k] || COPY.tw[k] || k).replace('{n}', val ?? '');

  // --- 3 座大滿貫特色球場（紅土／草地／夜場藍硬地）---
  const SURFACES = [
    {
      id: 'clay',
      name: { tw: '紅土球場', en: 'Roland Clay', ko: '클레이 코트' },
      outerA: '#1d4d3a', outerB: '#123326',
      courtA: '#d46b42', courtB: '#b94f28',
      dust: '#e68c63', line: '#fcf8ef',
      bounceRest: 0.78, speedMul: 0.96
    },
    {
      id: 'grass',
      name: { tw: '溫網草地', en: 'Center Grass', ko: '잔디 코트' },
      outerA: '#183d29', outerB: '#0f271a',
      courtA: '#3f9653', courtB: '#327d43',
      dust: '#a7e3a2', line: '#ffffff',
      bounceRest: 0.74, speedMul: 1.05
    },
    {
      id: 'hard',
      name: { tw: '夜場藍硬地', en: 'Night Hardcourt', ko: '나이트 하드' },
      outerA: '#1d2d44', outerB: '#0f172a',
      courtA: '#2a6cb5', courtB: '#1e508c',
      dust: '#93c5fd', line: '#f8fafc',
      bounceRest: 0.80, speedMul: 1.02
    }
  ];

  // --- 3D 球場邏輯座標系（單位：標準化球場座標）---
  // x: -1.0 (左邊線) .. +1.0 (右邊線)
  // y:  0.0 (CPU底線) .. 0.5 (球網) .. 1.0 (玩家底線)
  // z:  0.0 (地面) .. 向上高度（球網高 NET_Z = 0.22）
  const NET_Y = 0.50;
  const NET_Z = 0.22;
  const GRAVITY = 2.65;

  // --- Web Audio 網球合成音效（零延遲拍弦擊球／紅土彈跳／殺球爆音／觀眾歡呼）---
  class TennisSound {
    constructor() { this.ctx = null; this.muted = false; }
    wake() {
      if (this.muted) return;
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) this.ctx = new AC();
      }
      if (this.ctx && this.ctx.state === 'suspended') this.ctx.resume().catch(() => {});
    }
    tone(freq, dur, type = 'triangle', vol = 0.16, slide = 0) {
      if (this.muted || !this.ctx || this.ctx.state !== 'running') return;
      const now = this.ctx.currentTime;
      const o = this.ctx.createOscillator();
      const g = this.ctx.createGain();
      o.type = type;
      o.frequency.setValueAtTime(freq, now);
      if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), now + dur);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.linearRampToValueAtTime(vol, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0005, now + dur);
      o.connect(g).connect(this.ctx.destination);
      o.start(now); o.stop(now + dur + 0.02);
    }
    hit(power = 0.7, smash = false) {
      this.tone(smash ? 180 : 260, smash ? 0.14 : 0.08, 'triangle', smash ? 0.24 : 0.18, smash ? -110 : -140);
      this.tone(smash ? 640 : 480 + power * 180, 0.055, 'sine', 0.12, -200);
    }
    bounce() { this.tone(155, 0.06, 'sine', 0.11, -70); }
    point(win) {
      const notes = win ? [523, 659, 784] : [330, 262];
      notes.forEach((f, i) => setTimeout(() => this.tone(f, 0.14, 'triangle', 0.14), i * 70));
    }
    matchWin() { [523, 659, 784, 1046].forEach((f, i) => setTimeout(() => this.tone(f, 0.20, 'triangle', 0.16), i * 95)); }
  }
  const sound = new TennisSound();

  // --- 遊戲狀態 ---
  let surfaceIdx = 0;
  let diffLevel = 0;
  let paused = false;
  let vw = window.innerWidth, vh = window.innerHeight, dpr = 1;
  let hitStop = 0;
  let screenShake = 0;
  let toastOverride = null;

  const state = {
    phase: 'serve', // 'serve' | 'rally' | 'pointOver' | 'end'
    server: 0,      // 0 = player, 1 = cpu
    score: [0, 0],
    winner: -1,
    rally: 0,
    maxRally: 0,
    lastSpeedKmh: 0,
    topSpeedKmh: 0,
    streak: 0,
    pointTimer: 0,
    cpuServeTimer: 0,
    player: { x: 0, y: 0.94, tx: 0, ty: 0.94, swing: 0, swingSide: 1, swingKind: 'drive' },
    cpu:    { x: 0, y: 0.06, tx: 0, ty: 0.06, swing: 0, swingSide: 1 },
    ball: {
      active: false, x: 0, y: 0.90, z: 0.24,
      vx: 0, vy: 0, vz: 0,
      lastHitter: 0, bouncesOnSide: 0,
      trail: [], kind: 'drive'
    }
  };

  const dustPuffs = [];
  const callouts = [];
  const keys = {};

  function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

  function showToast(key, val, ms = 1800) {
    toastOverride = { text: t(key, val), until: performance.now() + ms };
    updateHUD();
  }

  function spawnCallout(wx, wy, text, color = '#ffe066') {
    callouts.push({ wx, wy, text, color, age: 0, maxAge: 0.95 });
  }

  function spawnDust(wx, wy, count = 8) {
    const col = SURFACES[surfaceIdx].dust;
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 0.06 + Math.random() * 0.14;
      dustPuffs.push({
        wx, wy, vx: Math.cos(a) * s, vy: Math.sin(a) * s * 0.6,
        r: 3 + Math.random() * 5, col, age: 0, maxAge: 0.42 + Math.random() * 0.18
      });
    }
  }

  // --- 2.5D 透視投影：將球場邏輯座標 (wx, wy, wz) 映射到全版螢幕像素 ---
  // 確保 390x844 與 1280x720 / 1440x900 球場主體佔可見視野 85%+！
  function getCourtMetrics() {
    const topY = Math.max(54, vh * 0.105);
    const botY = vh - Math.max(66, vh * 0.09);
    const maxBotHalfW = Math.min(vw * 0.455, (botY - topY) * 0.56);
    const topHalfW = maxBotHalfW * 0.60;
    return { cx: vw * 0.5, topY, botY, topHalfW, botHalfW: maxBotHalfW };
  }

  function project(wx, wy, wz = 0) {
    const m = getCourtMetrics();
    // 透視深度非線性壓縮，讓近端寬廣好操控、遠端立體感十足
    const depth = Math.pow(clamp(wy, -0.25, 1.25), 1.12);
    const syGround = m.topY + (m.botY - m.topY) * depth;
    const halfW = m.topHalfW + (m.botHalfW - m.topHalfW) * depth;
    const sx = m.cx + wx * halfW;
    const zScale = halfW * 0.62;
    return { x: sx, y: syGround - wz * zScale, groundY: syGround, scale: halfW / m.botHalfW };
  }

  function screenToCourt(px, py) {
    const m = getCourtMetrics();
    const tY = clamp((py - m.topY) / Math.max(1, m.botY - m.topY), 0.52, 1.08);
    const wy = Math.pow(tY, 1 / 1.12);
    const halfW = m.topHalfW + (m.botHalfW - m.topHalfW) * tY;
    const wx = clamp((px - m.cx) / Math.max(1, halfW), -1.12, 1.12);
    return { wx, wy: clamp(wy, 0.58, 1.05) };
  }

  // --- 預估球體下一次落地點 (wx, wy) 供光圈顯示與 CPU 移動 ---
  function predictLanding() {
    const b = state.ball;
    if (!b.active) return null;
    // 解 z + vz*t - 0.5*g*t^2 = 0
    const disc = b.vz * b.vz + 2 * GRAVITY * Math.max(0, b.z);
    if (disc < 0) return null;
    const tLand = (b.vz + Math.sqrt(disc)) / GRAVITY;
    return { x: b.x + b.vx * tLand, y: b.y + b.vy * tLand, t: tLand };
  }

  // --- 發球與重開回合 ---
  function setupPoint(nextServer) {
    state.server = nextServer;
    state.phase = 'serve';
    state.rally = 0;
    state.cpuServeTimer = 0.72;
    state.player.x = nextServer === 0 ? 0.22 : 0;
    state.player.tx = state.player.x;
    state.player.y = 0.96;
    state.player.ty = 0.96;
    state.cpu.x = nextServer === 1 ? -0.22 : 0;
    state.cpu.tx = state.cpu.x;
    state.cpu.y = 0.04;
    state.cpu.ty = 0.04;

    const b = state.ball;
    b.active = false;
    b.trail = [];
    b.bouncesOnSide = 0;
    b.x = nextServer === 0 ? state.player.x + 0.06 : state.cpu.x - 0.06;
    b.y = nextServer === 0 ? 0.92 : 0.08;
    b.z = 0.22;
    b.vx = 0; b.vy = 0; b.vz = 0;
    updateHUD();
  }

  function resetMatch() {
    state.score = [0, 0];
    state.winner = -1;
    state.maxRally = 0;
    state.lastSpeedKmh = 0;
    state.topSpeedKmh = 0;
    paused = false;
    toastOverride = null;
    setupPoint(0);
    updateHUD();
  }

  function launchShot(hitter, kind, aimOffset = 0, isPerfect = false) {
    const b = state.ball;
    const surf = SURFACES[surfaceIdx];
    const fromPlayer = hitter === 0;
    const actor = fromPlayer ? state.player : state.cpu;

    // 計算目標落點（依早／準／晚擊球時機與球種決定角度與深度）
    const targetY = fromPlayer
      ? (kind === 'drop' ? 0.36 : (kind === 'smash' ? 0.22 : 0.10))
      : (kind === 'drop' ? 0.64 : (kind === 'smash' ? 0.78 : 0.88));
    let targetX = clamp(aimOffset, -0.88, 0.88);
    if (kind === 'serve') {
      targetX = fromPlayer ? (actor.x > 0 ? -0.45 : 0.45) : (actor.x < 0 ? 0.45 : -0.45);
    }

    const baseFlight = kind === 'smash' ? 0.46 : (kind === 'drop' ? 0.74 : (kind === 'serve' ? 0.56 : (isPerfect ? 0.52 : 0.64)));
    const flightT = baseFlight / surf.speedMul;

    b.active = true;
    b.lastHitter = hitter;
    b.bouncesOnSide = 0;
    b.kind = kind;
    b.vx = (targetX - b.x) / flightT;
    b.vy = (targetY - b.y) / flightT;
    // 確保球高能順利越過網（NET_Z = 0.22），殺球則貼網急墜
    const peakBoost = kind === 'drop' ? 0.34 : (kind === 'smash' ? 0.04 : 0.14);
    b.vz = (0 - b.z + 0.5 * GRAVITY * flightT * flightT) / flightT + peakBoost;

    // 速度顯示（km/h）
    const kmh = Math.round((kind === 'smash' ? 196 : kind === 'serve' ? 174 : kind === 'drop' ? 78 : isPerfect ? 168 : 132) + Math.random() * 14);
    state.lastSpeedKmh = kmh;
    if (kmh > state.topSpeedKmh) state.topSpeedKmh = kmh;
    state.rally += 1;
    if (state.rally > state.maxRally) state.maxRally = state.rally;

    actor.swing = 1.0;
    actor.swingSide = b.x >= actor.x ? 1 : -1;
    actor.swingKind = kind;
    sound.hit(isPerfect ? 1 : 0.7, kind === 'smash' || isPerfect);

    if (fromPlayer && (isPerfect || kind === 'smash')) {
      hitStop = 0.036;
      screenShake = kind === 'smash' ? 8 : 5;
      spawnCallout(b.x, b.y, kind === 'smash' ? 'SMASH! ⚡' : 'PERFECT! 🔥', kind === 'smash' ? '#ffe066' : '#ffcf56');
      showToast(kind === 'smash' ? 'smashHit' : 'perfect', null, 1100);
    } else if (fromPlayer && kind === 'drop') {
      spawnCallout(b.x, b.y, 'DROP 🎯', '#a7f3d0');
      showToast('dropHit', null, 1000);
    }
    state.phase = 'rally';
    updateHUD();
  }

  function tryPlayerSwing(kind) {
    if (paused || state.phase === 'end' || state.phase === 'pointOver') return;
    sound.wake();
    // 玩家發球
    if (state.phase === 'serve') {
      if (state.server === 0) {
        state.ball.x = state.player.x + 0.05;
        state.ball.y = state.player.y - 0.04;
        state.ball.z = 0.42;
        launchShot(0, 'serve', -state.player.x * 1.4, true);
      }
      return;
    }
    // 揮拍動作（即使沒打到也顯示揮拍回饋）
    state.player.swing = 1.0;
    const b = state.ball;
    if (!b.active || b.lastHitter === 0) return;

    const dx = b.x - state.player.x;
    const dy = b.y - state.player.y;
    const reachX = 0.34;
    const reachY = 0.24;
    if (Math.abs(dx) <= reachX && Math.abs(dy) <= reachY && b.z < 0.85) {
      // 時機判定：dy < -0.05 早打(斜線)、|dy| <= 0.06 準時(Perfect!)、dy > 0.05 晚打(直線)
      const isPerfect = Math.abs(dy) <= 0.075 && Math.abs(dx) <= 0.22;
      const canSmash = kind === 'smash' && b.z > 0.26;
      const actualKind = canSmash ? 'smash' : (kind === 'smash' ? 'drive' : kind);
      let aimX;
      if (dy < -0.04) aimX = state.player.x > 0 ? -0.76 : 0.76; // 早打大斜線
      else if (dy > 0.05) aimX = state.player.x > 0 ? 0.68 : -0.68; // 晚打直線
      else aimX = (state.cpu.x > 0 ? -0.74 : 0.74); // 準時攻擊對手空檔！
      launchShot(0, actualKind, aimX, isPerfect);
    }
  }

  function awardPoint(winnerIdx, reasonKey) {
    if (state.phase === 'pointOver' || state.phase === 'end') return;
    state.score[winnerIdx] += 1;
    state.ball.active = false;
    sound.point(winnerIdx === 0);

    const [p, c] = state.score;
    const wonMatch = (p >= 7 || c >= 7) && Math.abs(p - c) >= 2;
    if (wonMatch) {
      state.phase = 'end';
      state.winner = p > c ? 0 : 1;
      if (state.winner === 0) { state.streak += 1; sound.matchWin(); }
      else state.streak = 0;
      updateHUD();
      return;
    }

    state.phase = 'pointOver';
    state.pointTimer = 1.25;
    if (p >= 6 && c >= 6 && p === c) showToast('deuce', null, 1500);
    else showToast(reasonKey || (winnerIdx === 0 ? 'youPoint' : 'cpuPoint'), null, 1400);
    spawnCallout(0, 0.5, winnerIdx === 0 ? '+1 YOU!' : '+1 CPU', winnerIdx === 0 ? '#d9ff3b' : '#ffb4a2');
    updateHUD();
  }

  // --- 物理與 AI 更新 ---
  function update(dt) {
    if (paused) return;
    if (hitStop > 0) { hitStop = Math.max(0, hitStop - dt); return; }
    if (screenShake > 0) screenShake = Math.max(0, screenShake - dt * 28);

    // 鍵盤移動
    const kSpd = 1.25;
    if (keys.ArrowLeft || keys.KeyA) state.player.tx -= kSpd * dt;
    if (keys.ArrowRight || keys.KeyD) state.player.tx += kSpd * dt;
    if (keys.ArrowUp || keys.KeyW) state.player.ty -= kSpd * 0.7 * dt;
    if (keys.ArrowDown || keys.KeyS) state.player.ty += kSpd * 0.7 * dt;
    state.player.tx = clamp(state.player.tx, -1.08, 1.08);
    state.player.ty = clamp(state.player.ty, 0.62, 1.05);

    // 玩家平滑移動（受真實跑速上限，流暢不瞬移）
    const pMove = Math.min(1, dt * 11);
    state.player.x += (state.player.tx - state.player.x) * pMove;
    state.player.y += (state.player.ty - state.player.y) * pMove;
    state.player.swing = Math.max(0, state.player.swing - dt * 4.5);
    state.cpu.swing = Math.max(0, state.cpu.swing - dt * 4.5);

    // 局間等待
    if (state.phase === 'pointOver') {
      state.pointTimer -= dt;
      if (state.pointTimer <= 0) {
        const totalPts = state.score[0] + state.score[1];
        setupPoint(Math.floor(totalPts / 2) % 2);
      }
      return;
    }

    // CPU 發球倒數
    if (state.phase === 'serve' && state.server === 1) {
      state.cpuServeTimer -= dt;
      if (state.cpuServeTimer <= 0) {
        state.ball.x = state.cpu.x - 0.04;
        state.ball.y = state.cpu.y + 0.04;
        state.ball.z = 0.42;
        launchShot(1, 'serve', 0, false);
      }
      return;
    }

    // 3D 網球飛行、彈跳與邊界規則
    const b = state.ball;
    if (state.phase === 'rally' && b.active) {
      const prevY = b.y;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.vz -= GRAVITY * dt;
      b.z += b.vz * dt;
      b.trail.push({ x: b.x, y: b.y, z: b.z });
      if (b.trail.length > 12) b.trail.shift();

      // 過網檢測
      if ((prevY < NET_Y && b.y >= NET_Y) || (prevY > NET_Y && b.y <= NET_Y)) {
        if (b.z < NET_Z * 0.72) {
          // 掛網！
          awardPoint(1 - b.lastHitter, 'netCall');
          return;
        }
      }

      // 落地彈跳檢測
      if (b.z <= 0) {
        b.z = 0;
        const surf = SURFACES[surfaceIdx];
        b.vz = Math.abs(b.vz) * surf.bounceRest;
        b.vx *= 0.90;
        b.vy *= 0.90;
        sound.bounce();
        spawnDust(b.x, b.y, 9);

        const inX = Math.abs(b.x) <= 1.04;
        const onPlayerSide = b.y >= NET_Y;
        const inY = b.y >= -0.02 && b.y <= 1.04;

        if (b.bouncesOnSide === 0) {
          // 第一跳必須落在對手場內，否則出界
          const validHalf = (b.lastHitter === 0 && !onPlayerSide) || (b.lastHitter === 1 && onPlayerSide);
          if (!inX || !inY || !validHalf) {
            awardPoint(1 - b.lastHitter, 'outCall');
            return;
          }
          b.bouncesOnSide = 1;
        } else {
          // 兩跳未救起 -> 擊球方得分！
          awardPoint(b.lastHitter, b.lastHitter === 0 ? 'youPoint' : 'cpuPoint');
          return;
        }
      }

      // 飛離畫面深處
      if (b.y < -0.35 || b.y > 1.38 || Math.abs(b.x) > 1.65) {
        if (b.bouncesOnSide >= 1) awardPoint(b.lastHitter);
        else awardPoint(1 - b.lastHitter, 'outCall');
        return;
      }

      // CPU AI 走位與回擊（受真實速度上限限制，依 3 階難度調整反應與精準度）
      const cpuSpd = diffLevel === 0 ? 0.78 : (diffLevel === 1 ? 1.02 : 1.24);
      const land = predictLanding();
      if (b.lastHitter === 0 && b.vy < 0 && land) {
        state.cpu.tx = clamp(land.x, -1.04, 1.04);
        state.cpu.ty = clamp(Math.min(0.28, Math.max(0.03, land.y - 0.04)), 0.03, 0.34);
      } else {
        state.cpu.tx = 0;
        state.cpu.ty = 0.08;
      }
      const cdx = state.cpu.tx - state.cpu.x;
      const cdy = state.cpu.ty - state.cpu.y;
      const cdist = Math.hypot(cdx, cdy);
      if (cdist > 0.005) {
        const step = Math.min(cdist, cpuSpd * dt);
        state.cpu.x += (cdx / cdist) * step;
        state.cpu.y += (cdy / cdist) * step;
      }

      // CPU 擊球判定
      if (b.lastHitter === 0 && b.vy < 0 && b.y < 0.38 &&
          Math.abs(b.x - state.cpu.x) < 0.28 && Math.abs(b.y - state.cpu.y) < 0.16 && b.z < 0.70) {
        const err = diffLevel === 0 ? 0.34 : (diffLevel === 1 ? 0.16 : 0.06);
        const openSide = state.player.x > 0 ? -0.68 : 0.68;
        const aimX = clamp(openSide + (Math.random() - 0.5) * err * 2, -0.86, 0.86);
        const cpuKind = (diffLevel >= 1 && Math.random() < 0.18) ? 'drop' : 'drive';
        launchShot(1, cpuKind, aimX, diffLevel === 2 && Math.random() < 0.35);
      }
    }

    // 殺球按鈕高亮提示
    const smashReady = state.phase === 'rally' && b.active && b.lastHitter === 1 && b.y > 0.52 && b.z > 0.26;
    $('btnSmash').classList.toggle('smash-ready', smashReady);
  }

  // --- 繪製 2.5D 紅土大滿貫球場、角色與 3D 網球 ---
  function drawPlayerSprite(actor, isPlayer) {
    const p = project(actor.x, actor.y, 0);
    const sc = p.scale;
    const h = 58 * sc;
    ctx.save();
    ctx.translate(p.x, p.y);

    // 地面橢圓陰影
    ctx.fillStyle = 'rgba(15, 24, 18, 0.32)';
    ctx.beginPath(); ctx.ellipse(0, 2, 18 * sc, 7 * sc, 0, 0, Math.PI * 2); ctx.fill();

    // 雙腿
    ctx.strokeStyle = '#f2c7a4';
    ctx.lineWidth = Math.max(3, 5.5 * sc);
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-6 * sc, -h * 0.32); ctx.lineTo(-8 * sc, -2);
    ctx.moveTo(6 * sc, -h * 0.32); ctx.lineTo(8 * sc, -2);
    ctx.stroke();

    // 球衣（玩家＝典雅奶油白×海軍藍；CPU＝深松綠×金條）
    ctx.fillStyle = isPlayer ? '#fbf7ee' : '#174d38';
    ctx.strokeStyle = '#18201b';
    ctx.lineWidth = Math.max(1.5, 2.2 * sc);
    ctx.beginPath();
    ctx.roundRect(-12 * sc, -h * 0.72, 24 * sc, h * 0.42, 6 * sc);
    ctx.fill(); ctx.stroke();

    // 領口裝飾線
    ctx.fillStyle = isPlayer ? '#1e3a5f' : '#e6b84c';
    ctx.fillRect(-10 * sc, -h * 0.62, 20 * sc, 4 * sc);

    // 頭部＋運動頭帶
    ctx.fillStyle = '#f2c7a4';
    ctx.beginPath(); ctx.arc(0, -h * 0.88, 10.5 * sc, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.fillStyle = isPlayer ? '#c95d36' : '#e6b84c';
    ctx.fillRect(-10 * sc, -h * 0.94, 20 * sc, 3.8 * sc);

    // 網球拍（含流暢揮拍弧線殘影）
    const sw = actor.swing;
    const side = actor.swingSide || 1;
    const rAng = side * (0.45 - sw * 1.9);
    ctx.save();
    ctx.translate(side * 12 * sc, -h * 0.56);
    ctx.rotate(rAng);
    if (sw > 0.15) {
      ctx.strokeStyle = actor.swingKind === 'smash' ? `rgba(255, 224, 102, ${sw * 0.8})` : `rgba(255, 255, 255, ${sw * 0.65})`;
      ctx.lineWidth = 4 * sc;
      ctx.beginPath(); ctx.arc(0, 0, 26 * sc, -0.7, 0.7); ctx.stroke();
    }
    ctx.strokeStyle = '#2d3748';
    ctx.lineWidth = Math.max(2, 3.2 * sc);
    ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(0, -18 * sc); ctx.stroke();
    ctx.strokeStyle = isPlayer ? '#e63946' : '#f4d37a';
    ctx.fillStyle = 'rgba(255,255,255,0.22)';
    ctx.beginPath(); ctx.ellipse(0, -27 * sc, 9 * sc, 12 * sc, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  function render(dt) {
    const surf = SURFACES[surfaceIdx];
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.save();
    if (screenShake > 0) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // 1. 場館外圍擋板與地面
    const bgGrad = ctx.createLinearGradient(0, 0, 0, vh);
    bgGrad.addColorStop(0, surf.outerB);
    bgGrad.addColorStop(0.28, surf.outerA);
    bgGrad.addColorStop(1, surf.outerB);
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, vw, vh);

    // 2. 2.5D 透視主球場（佔可視畫面 85%+！）
    const tl = project(-1.0, 0.0), tr = project(1.0, 0.0);
    const bl = project(-1.0, 1.0), br = project(1.0, 1.0);
    const cGrad = ctx.createLinearGradient(0, tl.y, 0, bl.y);
    cGrad.addColorStop(0, surf.courtB);
    cGrad.addColorStop(0.5, surf.courtA);
    cGrad.addColorStop(1, surf.courtB);

    // 球場外圍發球區邊界
    const otl = project(-1.24, -0.10), otr = project(1.24, -0.10);
    const obl = project(-1.24, 1.12), obr = project(1.24, 1.12);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.14)';
    ctx.beginPath(); ctx.moveTo(otl.x, otl.y); ctx.lineTo(otr.x, otr.y); ctx.lineTo(obr.x, obr.y); ctx.lineTo(obl.x, obl.y); ctx.closePath(); ctx.fill();

    // 主球場材質
    ctx.fillStyle = cGrad;
    ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y); ctx.closePath(); ctx.fill();

    // 溫網草地細緻割草紋／紅土粉感線條
    ctx.save();
    ctx.beginPath(); ctx.moveTo(tl.x, tl.y); ctx.lineTo(tr.x, tr.y); ctx.lineTo(br.x, br.y); ctx.lineTo(bl.x, bl.y); ctx.closePath(); ctx.clip();
    for (let s = 0; s < 10; s++) {
      if (s % 2 === 0) continue;
      const y0 = s / 10, y1 = (s + 1) / 10;
      const a = project(-1.05, y0), b2 = project(1.05, y0), c2 = project(1.05, y1), d2 = project(-1.05, y1);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.045)';
      ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b2.x, b2.y); ctx.lineTo(c2.x, c2.y); ctx.lineTo(d2.x, d2.y); ctx.closePath(); ctx.fill();
    }
    ctx.restore();

    // 清晰白色粉筆球場標線（單打邊線、雙打邊線、發球線、中線）
    const line = (x1, y1, x2, y2, w = 2.6) => {
      const p1 = project(x1, y1), p2 = project(x2, y2);
      ctx.strokeStyle = surf.line;
      ctx.lineWidth = w;
      ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.stroke();
    };
    line(-1, 0, 1, 0, 2.8);
    line(-1, 1, 1, 1, 3.2);
    line(-1, 0, -1, 1, 2.8);
    line(1, 0, 1, 1, 2.8);
    line(-0.78, 0, -0.78, 1, 2.0);
    line(0.78, 0, 0.78, 1, 2.0);
    line(-0.78, 0.24, 0.78, 0.24, 2.0);
    line(-0.78, 0.76, 0.78, 0.76, 2.0);
    line(0, 0.24, 0, 0.76, 2.0);

    // 3. 落點預告光圈（來球往玩家側飛時，清楚顯示落點與擊球時機！）
    if (state.phase === 'rally' && state.ball.active && state.ball.vy > 0) {
      const land = predictLanding();
      if (land && land.y >= NET_Y && land.y <= 1.15 && Math.abs(land.x) <= 1.25) {
        const lp = project(land.x, land.y, 0);
        const pulse = 1 + Math.sin(performance.now() * 0.015) * 0.14;
        ctx.strokeStyle = '#d9ff3b';
        ctx.lineWidth = 2.6;
        ctx.beginPath();
        ctx.ellipse(lp.x, lp.y, 16 * lp.scale * pulse, 8 * lp.scale * pulse, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    // 4. 繪製遠端 CPU 選手
    drawPlayerSprite(state.cpu, false);

    // 5. 繪製 2.5D 立體球網（含網柱與白色上緣網帶）
    const nlG = project(-1.08, NET_Y, 0), nrG = project(1.08, NET_Y, 0);
    const nlT = project(-1.08, NET_Y, NET_Z), nrT = project(1.08, NET_Y, NET_Z);
    ctx.fillStyle = 'rgba(0, 0, 0, 0.20)';
    ctx.beginPath(); ctx.moveTo(nlG.x, nlG.y + 4); ctx.lineTo(nrG.x, nrG.y + 4); ctx.lineTo(nrG.x, nrG.y + 10); ctx.lineTo(nlG.x, nlG.y + 10); ctx.closePath(); ctx.fill();
    ctx.fillStyle = 'rgba(25, 34, 30, 0.34)';
    ctx.beginPath(); ctx.moveTo(nlT.x, nlT.y); ctx.lineTo(nrT.x, nrT.y); ctx.lineTo(nrG.x, nrG.y); ctx.lineTo(nlG.x, nlG.y); ctx.closePath(); ctx.fill();
    // 網格線
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.26)';
    ctx.lineWidth = 1;
    for (let i = 1; i < 18; i++) {
      const f = i / 18;
      ctx.beginPath();
      ctx.moveTo(nlT.x + (nrT.x - nlT.x) * f, nlT.y);
      ctx.lineTo(nlG.x + (nrG.x - nlG.x) * f, nlG.y);
      ctx.stroke();
    }
    // 白色網帶與兩側鐵柱
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 4;
    ctx.beginPath(); ctx.moveTo(nlT.x, nlT.y); ctx.lineTo(nrT.x, nrT.y); ctx.stroke();
    ctx.strokeStyle = '#222b26';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(nlT.x, nlT.y - 2); ctx.lineTo(nlG.x, nlG.y + 2);
    ctx.moveTo(nrT.x, nrT.y - 2); ctx.lineTo(nrG.x, nrG.y + 2);
    ctx.stroke();

    // 6. 紅土彈跳粉塵粒子
    for (let i = dustPuffs.length - 1; i >= 0; i--) {
      const d = dustPuffs[i];
      d.age += dt;
      if (d.age >= d.maxAge) { dustPuffs.splice(i, 1); continue; }
      d.wx += d.vx * dt; d.wy += d.vy * dt;
      const dp = project(d.wx, d.wy, 0);
      ctx.save();
      ctx.globalAlpha = (1 - d.age / d.maxAge) * 0.65;
      ctx.fillStyle = d.col;
      ctx.beginPath(); ctx.arc(dp.x, dp.y, d.r * dp.scale, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    }

    // 7. 繪製 3D 網球（地面陰影＋速度光軌＋螢光黃網球本體）
    const b = state.ball;
    const bp = project(b.x, b.y, b.z);
    const shadowScale = Math.max(0.45, 1 - b.z * 0.55);
    ctx.fillStyle = 'rgba(15, 24, 18, 0.36)';
    ctx.beginPath();
    ctx.ellipse(bp.x, bp.groundY, 8 * bp.scale * shadowScale, 4 * bp.scale * shadowScale, 0, 0, Math.PI * 2);
    ctx.fill();

    if (b.active && b.trail.length > 1) {
      for (let i = 1; i < b.trail.length; i++) {
        const tp = project(b.trail[i].x, b.trail[i].y, b.trail[i].z);
        const f = i / b.trail.length;
        ctx.fillStyle = b.kind === 'smash' ? `rgba(255, 200, 60, ${f * 0.55})` : `rgba(217, 255, 59, ${f * 0.42})`;
        ctx.beginPath(); ctx.arc(tp.x, tp.y, (3 + 5 * f) * tp.scale, 0, Math.PI * 2); ctx.fill();
      }
    }
    const ballRad = Math.max(5.5, 8.5 * bp.scale);
    ctx.fillStyle = '#d9ff3b';
    ctx.strokeStyle = '#1b2b18';
    ctx.lineWidth = 1.8;
    ctx.beginPath(); ctx.arc(bp.x, bp.y, ballRad, 0, Math.PI * 2); ctx.fill(); ctx.stroke();

    // 8. 繪製前景玩家選手
    drawPlayerSprite(state.player, true);

    // 9. 場上擊球判定飄字
    for (let i = callouts.length - 1; i >= 0; i--) {
      const c = callouts[i];
      c.age += dt;
      if (c.age >= c.maxAge) { callouts.splice(i, 1); continue; }
      const p = c.age / c.maxAge;
      const cp = project(c.wx, c.wy, 0.25);
      ctx.save();
      ctx.globalAlpha = 1 - p;
      ctx.font = '900 18px "Microsoft JhengHei", sans-serif';
      ctx.textAlign = 'center';
      ctx.lineWidth = 4;
      ctx.strokeStyle = '#10241b';
      ctx.strokeText(c.text, cp.x, cp.y - p * 36);
      ctx.fillStyle = c.color;
      ctx.fillText(c.text, cp.x, cp.y - p * 36);
      ctx.restore();
    }

    ctx.restore();
  }

  // --- 操作與 HUD ---
  let dragId = null;
  canvas.addEventListener('pointerdown', ev => {
    if (!ev.isPrimary || paused) return;
    sound.wake();
    dragId = ev.pointerId;
    canvas.setPointerCapture(ev.pointerId);
    const pt = screenToCourt(ev.clientX, ev.clientY);
    state.player.tx = pt.wx;
    state.player.ty = pt.wy;
    if (state.phase === 'serve' && state.server === 0) tryPlayerSwing('drive');
  });
  canvas.addEventListener('pointermove', ev => {
    if (dragId !== ev.pointerId || paused) return;
    const pt = screenToCourt(ev.clientX, ev.clientY);
    state.player.tx = pt.wx;
    state.player.ty = pt.wy;
  });
  canvas.addEventListener('pointerup', ev => { if (dragId === ev.pointerId) dragId = null; });
  canvas.addEventListener('pointercancel', ev => { if (dragId === ev.pointerId) dragId = null; });

  window.addEventListener('keydown', ev => {
    keys[ev.code] = true;
    if (ev.code === 'Space' || ev.code === 'KeyJ') { ev.preventDefault(); tryPlayerSwing('drive'); }
    else if (ev.code === 'KeyK') { ev.preventDefault(); tryPlayerSwing('drop'); }
    else if (ev.code === 'KeyL') { ev.preventDefault(); tryPlayerSwing('smash'); }
    else if (ev.code === 'Escape') { paused = !paused; updateHUD(); }
  });
  window.addEventListener('keyup', ev => { keys[ev.code] = false; });

  $('btnDrive').addEventListener('click', () => tryPlayerSwing('drive'));
  $('btnDrop').addEventListener('click', () => tryPlayerSwing('drop'));
  $('btnSmash').addEventListener('click', () => tryPlayerSwing('smash'));

  $('btnSurface').addEventListener('click', () => {
    sound.wake();
    surfaceIdx = (surfaceIdx + 1) % SURFACES.length;
    showToast('surfaceChanged', SURFACES[surfaceIdx].name[lang] || SURFACES[surfaceIdx].name.tw);
  });
  $('btnSound').addEventListener('click', () => {
    sound.muted = !sound.muted;
    if (!sound.muted) sound.wake();
    updateHUD();
  });
  $('btnMenu').addEventListener('click', () => { paused = !paused; updateHUD(); });
  $('btnResume').addEventListener('click', () => { paused = false; updateHUD(); });
  $('btnRematch').addEventListener('click', () => { sound.wake(); resetMatch(); });
  $('selDiff').addEventListener('change', e => { diffLevel = Number(e.target.value) || 0; });
  $('selLang').addEventListener('change', e => {
    lang = e.target.value;
    if (i18n && i18n.setLang) i18n.setLang(lang);
    applyCopy();
  });
  $('btnFs').addEventListener('click', () => {
    const fs = document.fullscreenElement || document.webkitFullscreenElement;
    if (fs) (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)?.catch?.(() => {});
    else (document.documentElement.requestFullscreen || document.documentElement.webkitRequestFullscreen)?.call(document.documentElement)?.catch?.(() => {});
  });
  document.addEventListener('fullscreenchange', () => {
    $('btnFs').textContent = (document.fullscreenElement || document.webkitFullscreenElement) ? '✕' : '⛶';
  });

  function applyCopy() {
    document.title = `${t('title')}｜紅土大滿貫對決`;
    document.querySelectorAll('[data-copy]').forEach(el => { el.textContent = t(el.dataset.copy); });
    $('selLang').value = lang;
    updateHUD();
  }

  function updateHUD() {
    $('pScoreBox').querySelector('b').textContent = String(state.score[0]);
    $('cScoreBox').querySelector('b').textContent = String(state.score[1]);
    $('pScoreBox').classList.toggle('active', state.server === 0);
    $('cScoreBox').classList.toggle('active', state.server === 1);
    $('rallyPill').textContent = state.rally > 0 ? `${state.lastSpeedKmh} km/h · ×${state.rally}` : `${state.lastSpeedKmh} km/h`;
    $('driveLabel').textContent = (state.phase === 'serve' && state.server === 0) ? t('serve') : t('drive');
    $('btnSound').textContent = sound.muted ? '✕' : '♪';
    $('btnSound').setAttribute('aria-pressed', String(sound.muted));

    const now = performance.now();
    const defToast = state.phase === 'serve'
      ? (state.server === 0 ? t('serveHint') : t('cpuServe'))
      : t('rallying');
    $('statusToast').textContent = (toastOverride && toastOverride.until > now) ? toastOverride.text : defToast;
    $('statusToast').hidden = state.phase === 'end';

    const ended = state.phase === 'end';
    $('modalOverlay').hidden = !paused && !ended;
    if (paused || ended) {
      $('modalTitle').textContent = ended ? t(state.winner === 0 ? 'won' : 'lost') : t('pause');
      $('modalScore').hidden = !ended;
      $('modalScore').textContent = `${state.score[0]} - ${state.score[1]}`;
      $('modalStats').textContent = t('stats')
        .replace('{r}', state.maxRally)
        .replace('{s}', state.topSpeedKmh)
        .replace('{w}', state.streak);
      $('btnResume').hidden = ended;
    }
  }

  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
  }
  window.addEventListener('resize', resize);
  if (i18n && i18n.onChange) {
    i18n.onChange(next => { if (COPY[next]) { lang = next; applyCopy(); } });
  }

  resize();
  resetMatch();
  applyCopy();

  // 診斷介面（供自動化驗收檢查球場比例與狀態）
  window.__tennisDebug = {
    getState: () => ({ phase: state.phase, score: [...state.score], rally: state.rally, surface: SURFACES[surfaceIdx].id, version: 'v_09:45' }),
    getCourtCoverage: () => {
      const m = getCourtMetrics();
      const courtH = m.botY - m.topY;
      const courtArea = ((m.topHalfW + m.botHalfW) * courtH);
      return { canvasRatio: +(canvas.getBoundingClientRect().width * canvas.getBoundingClientRect().height / (vw * vh)).toFixed(4), courtHeightRatio: +(courtH / vh).toFixed(4), courtArea: Math.round(courtArea) };
    }
  };

  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min(0.033, (now - lastT) / 1000);
    lastT = now;
    update(dt);
    render(dt);
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
