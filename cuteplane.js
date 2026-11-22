(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const scoreVal = document.getElementById("scoreVal");
  const stageVal = document.getElementById("stageVal");
  const lblScore = document.getElementById("lblScore");
  const hpBar = document.getElementById("hpBar");
  const wpnIcon = document.getElementById("wpnIcon");
  const wpnText = document.getElementById("wpnText");
  const btnSound = document.getElementById("btnSound");
  const btnFs = document.getElementById("btnFs");
  const btnSwitchWpn = document.getElementById("btnSwitchWpn");
  const btnWpnImg = document.getElementById("btnWpnImg");
  const btnWpnTxt = document.getElementById("btnWpnTxt");
  const btnShield = document.getElementById("btnShield");
  const shieldCdEl = document.getElementById("shieldCd");
  const btnBomb = document.getElementById("btnBomb");
  const bombVal = document.getElementById("bombVal");
  const bombTxt = document.getElementById("bombTxt");
  const bossHud = document.getElementById("bossHud");
  const bossNameEl = document.getElementById("bossName");
  const bossPhaseEl = document.getElementById("bossPhase");
  const bossFill = document.getElementById("bossFill");
  const endModal = document.getElementById("endModal");
  const endBadge = document.getElementById("endBadge");
  const endTitle = document.getElementById("endTitle");
  const endBody = document.getElementById("endBody");
  const btnRestart = document.getElementById("btnRestart");

  if (location.search.includes("embed=1")) {
    btnFs.classList.add("hidden");
  } else {
    btnFs.addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });
  }

  // --- TW / EN / KO 本土化語系 ---
  const I18N = {
    tw: {
      score: "分數",
      stages: ["甜點雲海", "珊瑚樂園", "星光夜市"],
      weapons: { popcorn: "爆米花砲", rainbow: "彩虹光束", boba: "追蹤波霸" },
      switchWpn: "換武器",
      shieldReady: "泡泡盾",
      shieldOn: "無敵中",
      bombLabel: "爆辣",
      bossName: "👑 珍奶貓皇空中母艦",
      phase: (n) => `階段 ${n}`,
      bossWarn: "⚠ 珍奶貓皇母艦駕到！保護你的珍奶！ ⚠",
      stageClear: (s, name) => `🎉 貓皇落跑！前進空域 ${s}：${name} 🎉`,
      chiliShout: "🌶️ 爆辣辣椒全屏清場！！",
      bubbleShout: "🫧 七彩泡泡護盾展開！",
      pickups: {
        popcorn: "🍿 爆米花散射 UP!",
        rainbow: "🌈 彩虹光束 UP!",
        boba: "🧋 追蹤波霸 UP!",
        chili: "🌶️ 爆辣大招 +1!",
        cake: "🍰 草莓蛋糕回血 +1!",
        bubble: "🫧 無敵泡泡盾啟動!"
      },
      enemyQuips: ["吐司烤焦啦！", "別打我珍奶！", "柴柴太兇了吧！", "我要加薪啦！", "救命啊好可愛！", "全糖去冰狂射！"],
      bossQuips: ["敢打翻朕的珍奶？！", "加珍珠不用錢喔！", "可頌砲全彈發射！", "朕的皇冠歪了啦！"],
      overBadge: "柴柴累翻了",
      overTitle: "差一點就喝到珍奶了！",
      restart: "再飛一局 ↗",
      summary: (sc, st, k) => `總分 ${sc.toLocaleString()}\n到達空域 ${st} ・ 擊落搞笑敵機 ${k} 架`
    },
    en: {
      score: "SCORE",
      stages: ["Dessert Clouds", "Coral Waterpark", "Sky Night Market"],
      weapons: { popcorn: "Popcorn", rainbow: "Rainbow", boba: "Boba Homing" },
      switchWpn: "Weapon",
      shieldReady: "Bubble",
      shieldOn: "SHIELD!",
      bombLabel: "Chili",
      bossName: "👑 King Boba-Cat Carrier",
      phase: (n) => `PHASE ${n}`,
      bossWarn: "⚠ KING BOBA-CAT INCOMING! ⚠",
      stageClear: (s, name) => `🎉 STAGE ${s}: ${name}! 🎉`,
      chiliShout: "🌶️ MEGA SPICY CHILI BLAST!!",
      bubbleShout: "🫧 RAINBOW BUBBLE SHIELD!",
      pickups: {
        popcorn: "🍿 POPCORN SPREAD UP!",
        rainbow: "🌈 RAINBOW LASER UP!",
        boba: "🧋 HOMING BOBA UP!",
        chili: "🌶️ SPICY BOMB +1!",
        cake: "🍰 CAKE HEAL +1!",
        bubble: "🫧 BUBBLE SHIELD ON!"
      },
      enemyQuips: ["My toast burned!", "Not my boba!", "Shiba too OP!", "I need a raise!", "Too cute to dodge!"],
      bossQuips: ["Who spilled my boba?!", "Extra pearls for you!", "Croissant cannons FIRE!", "My crown slipped!"],
      overBadge: "SHIBA NAP TIME",
      overTitle: "So close to the boba!",
      restart: "Fly Again ↗",
      summary: (sc, st, k) => `Score ${sc.toLocaleString()}\nStage ${st} • Defeated ${k} silly foes`
    },
    ko: {
      score: "점수",
      stages: ["디저트 구름왕국", "산호 워터파크", "별빛 야시장"],
      weapons: { popcorn: "팝콘포", rainbow: "무지개빔", boba: "유도 버블" },
      switchWpn: "무기교체",
      shieldReady: "버블방패",
      shieldOn: "무적 중",
      bombLabel: "매운폭탄",
      bossName: "👑 버블티 냥이 황제 모함",
      phase: (n) => `페이즈 ${n}`,
      bossWarn: "⚠ 버블티 냥이 황제 출격! ⚠",
      stageClear: (s, name) => `🎉 스테이지 ${s}: ${name}! 🎉`,
      chiliShout: "🌶️ 초강력 청양고추 폭격!!",
      bubbleShout: "🫧 무지개 비눗방울 실드!",
      pickups: {
        popcorn: "🍿 팝콘 연사 UP!",
        rainbow: "🌈 무지개 빔 UP!",
        boba: "🧋 유도 버블 UP!",
        chili: "🌶️ 매운 폭탄 +1!",
        cake: "🍰 딸기케이크 회복 +1!",
        bubble: "🫧 무적 버블 실드!"
      },
      enemyQuips: ["토스트 다 탔어!", "내 버블티 건드리지 마!", "시바견 너무 세잖아!", "칼퇴 시켜줘!"],
      bossQuips: ["감히 짐의 버블티를?!", "펄 추가 무료다!", "크루아상 포 발사!", "왕관이 삐뚤어졌잖아!"],
      overBadge: "시바견 휴식 시간",
      overTitle: "버블티가 코앞이었는데!",
      restart: "다시 출격 ↗",
      summary: (sc, st, k) => `점수 ${sc.toLocaleString()}\n스테이지 ${st} ・ 격추 ${k}대`
    }
  };

  function lang() {
    return (window.ArcadeI18n && window.ArcadeI18n.getLang()) || "tw";
  }
  function tx() {
    return I18N[lang()] || I18N.tw;
  }

  // --- 專屬高精細去背圖檔（含 6 款實繪寶物＋3 關卡多變手繪背景）---
  const V = "20261122_cuteplane_v1";
  const assetMap = {
    bg1: `./assets/cuteplane/bg-stage1.webp?v=${V}`,
    bg2: `./assets/cuteplane/bg-stage2.webp?v=${V}`,
    bg3: `./assets/cuteplane/bg-stage3.webp?v=${V}`,
    hero: `./assets/cuteplane/hero.webp?v=${V}`,
    enemy1: `./assets/cuteplane/enemy1.webp?v=${V}`,
    enemy2: `./assets/cuteplane/enemy2.webp?v=${V}`,
    boss: `./assets/cuteplane/boss.webp?v=${V}`,
    "item-popcorn": `./assets/cuteplane/item-popcorn.webp?v=${V}`,
    "item-rainbow": `./assets/cuteplane/item-rainbow.webp?v=${V}`,
    "item-boba": `./assets/cuteplane/item-boba.webp?v=${V}`,
    "item-chili": `./assets/cuteplane/item-chili.webp?v=${V}`,
    "item-cake": `./assets/cuteplane/item-cake.webp?v=${V}`,
    "item-bubble": `./assets/cuteplane/item-bubble.webp?v=${V}`
  };
  const imgs = {};
  for (const [k, src] of Object.entries(assetMap)) {
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    imgs[k] = im;
  }

  // --- 輕柔歡樂復古 8-bit BGM ＋ 超跟手爆脆音效（離開網頁立刻停音！）---
  let ac = null;
  let noiseBuf = null;
  let soundOn = true;
  let audioUnlocked = false;
  let bgmTimer = null;
  let bgmNext = 0;
  let bgmStep = 0;
  let bgmRunning = false;

  function getAC() {
    if (!soundOn) return null;
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) ac = new C();
    }
    if (ac && ac.state === "suspended") ac.resume().catch(() => {});
    if (ac && !noiseBuf) {
      const n = Math.floor(ac.sampleRate * 0.16);
      noiseBuf = ac.createBuffer(1, n, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < n; i++) d[i] = Math.random() * 2 - 1;
    }
    return ac;
  }

  const HZ = {
    C3: 130.81, F3: 174.61, G3: 196.00, A3: 220.00, C4: 261.63, D4: 293.66, E4: 329.63,
    F4: 349.23, G4: 392.00, A4: 440.00, C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46,
    G5: 783.99, A5: 880.00, C6: 1046.50
  };
  const MEL = [
    "C5", "E5", "G5", null, "A5", "G5", "E5", "C5",
    "D5", "F5", "A5", null, "G5", null, "E5", null,
    "C5", "E5", "G5", "A5", "C6", null, "A5", "G5",
    "E5", "D5", "C5", "D5", "E5", null, null, null
  ];
  const BAS = [
    "C3", null, "G3", null, "A3", null, "G3", null,
    "F3", null, "C4", null, "G3", null, "C3", null,
    "C3", null, "G3", null, "F3", null, "A3", null,
    "G3", null, "F3", null, "C3", null, "G3", null
  ];

  function scheduleBgm(a, st, t) {
    const dur = 60 / 150 / 2;
    const m = MEL[st % MEL.length];
    const b = BAS[st % BAS.length];
    if (m && HZ[m]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "square"; o.frequency.setValueAtTime(HZ[m], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.015, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0004, t + dur * 0.9);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + dur * 0.94);
    }
    if (b && HZ[b]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(HZ[b], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.028, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0006, t + dur * 1.4);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + dur * 1.45);
    }
  }

  function startBgm() {
    if (!soundOn || bgmRunning || document.hidden) return;
    const a = getAC();
    if (!a) return;
    bgmRunning = true;
    bgmNext = a.currentTime + 0.04;
    const dur = 60 / 150 / 2;
    bgmTimer = setInterval(() => {
      if (!soundOn || !ac || ac.state !== "running") return;
      while (bgmNext < ac.currentTime + 0.14) {
        scheduleBgm(ac, bgmStep, bgmNext);
        bgmNext += dur;
        bgmStep = (bgmStep + 1) % MEL.length;
      }
    }, 45);
  }
  function stopBgm() {
    bgmRunning = false;
    if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; }
  }
  function pauseOnLeave() {
    stopBgm();
    if (ac && ac.state === "running") ac.suspend().catch(() => {});
  }
  function resumeOnReturn() {
    if (document.hidden || !soundOn || !audioUnlocked) return;
    const a = getAC();
    if (a && a.state === "suspended") a.resume().then(() => { if (!document.hidden && soundOn) startBgm(); }).catch(() => {});
    else if (a) startBgm();
  }
  function unlockAudio() {
    audioUnlocked = true;
    if (!soundOn || document.hidden) return;
    const a = getAC();
    if (a && a.state === "suspended") a.resume().then(() => { if (!document.hidden && soundOn) startBgm(); }).catch(() => {});
    else if (a) startBgm();
  }
  window.addEventListener("pointerdown", unlockAudio, { passive: true });
  window.addEventListener("keydown", unlockAudio, { passive: true });
  document.addEventListener("visibilitychange", () => document.hidden ? pauseOnLeave() : resumeOnReturn());
  window.addEventListener("pagehide", pauseOnLeave);
  window.addEventListener("beforeunload", pauseOnLeave);
  window.addEventListener("blur", pauseOnLeave);
  window.addEventListener("focus", resumeOnReturn);

  btnSound.addEventListener("click", () => {
    soundOn = !soundOn;
    btnSound.textContent = soundOn ? "🔊" : "🔇";
    if (soundOn) unlockAudio();
    else stopBgm();
  });

  function sfxShoot(type) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type === "rainbow" ? "sawtooth" : type === "boba" ? "triangle" : "square";
    o.frequency.setValueAtTime(type === "rainbow" ? 780 : type === "boba" ? 520 : 660, now);
    o.frequency.exponentialRampToValueAtTime(190, now + 0.05);
    g.gain.setValueAtTime(0.055, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + 0.06);
  }
  function sfxBoom(big = false) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    if (noiseBuf) {
      const s = a.createBufferSource();
      s.buffer = noiseBuf;
      const g = a.createGain();
      g.gain.setValueAtTime(big ? 0.34 : 0.16, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (big ? 0.24 : 0.09));
      s.connect(g).connect(a.destination);
      s.start(now); s.stop(now + (big ? 0.25 : 0.10));
    }
    const o = a.createOscillator(), g = a.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(big ? 160 : 250, now);
    o.frequency.exponentialRampToValueAtTime(36, now + (big ? 0.34 : 0.12));
    g.gain.setValueAtTime(big ? 0.32 : 0.16, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (big ? 0.36 : 0.13));
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + (big ? 0.38 : 0.14));
  }
  function sfxPickup() {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, now + i * 0.045);
      g.gain.setValueAtTime(0.16, now + i * 0.045);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.045 + 0.14);
      o.connect(g).connect(a.destination);
      o.start(now + i * 0.045); o.stop(now + i * 0.045 + 0.15);
    });
  }

  // --- 畫布尺寸 ---
  let vw = window.innerWidth, vh = window.innerHeight, dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }
  window.addEventListener("resize", resize);
  resize();

  // --- 3 大武器定義（對應 3 款實繪寶物圖示）---
  const WEAPONS = [
    { id: "popcorn", itemKey: "item-popcorn", color: "#ff9f1c" },
    { id: "rainbow", itemKey: "item-rainbow", color: "#ff5ec4" },
    { id: "boba", itemKey: "item-boba", color: "#9b5de5" }
  ];

  // --- 6 款實繪寶物設定（零 ABCD 文字方框！）---
  const TREASURES = {
    popcorn: { img: "item-popcorn", glow: "#ffd166" },
    rainbow: { img: "item-rainbow", glow: "#ff70d9" },
    boba:    { img: "item-boba",    glow: "#b388ff" },
    chili:   { img: "item-chili",   glow: "#ff5e5b" },
    cake:    { img: "item-cake",    glow: "#ff85a1" },
    bubble:  { img: "item-bubble",  glow: "#64dfdf" }
  };

  let gameOver = false;
  let score = 0;
  let kills = 0;
  let stageNum = 1;
  let waveNum = 1;
  let waveTimer = 0;
  let bgScroll = 0;
  let prevStageIdx = 0;
  let bgFade = 1;
  let shake = 0;
  let bombFlash = 0;
  let bannerText = "";
  let bannerTimer = 0;

  const player = {
    x: vw * 0.5, y: vh * 0.78, tx: vw * 0.5, ty: vh * 0.78,
    hp: 5, maxHp: 5, wpnIdx: 0, wpnLv: 1, bombs: 3,
    shieldTime: 0, shieldCd: 0, invuln: 0, fireCd: 0, tilt: 0
  };

  const pBullets = [];
  const eBullets = [];
  const enemies = [];
  const pickups = [];
  const particles = [];
  const shockwaves = [];
  const floatTexts = [];
  const quips = [];
  let boss = null;

  // 視差前景雲朵與星光
  const clouds = Array.from({ length: 10 }, () => ({
    x: Math.random() * vw,
    y: Math.random() * vh,
    r: 36 + Math.random() * 58,
    speed: 38 + Math.random() * 44,
    alpha: 0.14 + Math.random() * 0.14
  }));
  const sparkles = Array.from({ length: 24 }, () => ({
    x: Math.random() * vw,
    y: Math.random() * vh,
    r: 2 + Math.random() * 3,
    speed: 48 + Math.random() * 60,
    phase: Math.random() * 6.28
  }));

  function renderHud() {
    const t = tx();
    lblScore.textContent = t.score;
    scoreVal.textContent = String(score).padStart(6, "0");
    const stName = t.stages[(stageNum - 1) % t.stages.length];
    stageVal.textContent = `${stageNum}-${waveNum} ${stName}`;
    hpBar.innerHTML = "";
    for (let i = 0; i < player.maxHp; i++) {
      const s = document.createElement("span");
      s.className = "hp-heart" + (i >= player.hp ? " lost" : "");
      s.textContent = "❤️";
      hpBar.appendChild(s);
    }
    const w = WEAPONS[player.wpnIdx];
    wpnIcon.src = assetMap[w.itemKey];
    wpnText.textContent = `${t.weapons[w.id]} Lv.${player.wpnLv}`;
    btnWpnImg.src = assetMap[w.itemKey];
    btnWpnTxt.textContent = t.switchWpn;
    bombTxt.innerHTML = `${t.bombLabel} ×<b id="bombVal">${player.bombs}</b>`;
    shieldCdEl.textContent = player.shieldTime > 0
      ? t.shieldOn
      : (player.shieldCd > 0 ? `${Math.ceil(player.shieldCd)}s` : t.shieldReady);
    bossNameEl.textContent = t.bossName;
    if (boss) bossPhaseEl.textContent = t.phase(boss.phase);
  }

  if (window.ArcadeI18n) {
    window.ArcadeI18n.onChange(() => renderHud());
  }

  function spawnBoom(x, y, color = "#ffd166", count = 16, big = false) {
    sfxBoom(big);
    if (big) shake = Math.max(shake, 16);
    shockwaves.push({ x, y, r: 8, maxR: big ? 130 : 48, color, life: big ? 0.42 : 0.24, maxLife: big ? 0.42 : 0.24 });
    const palette = [color, "#fffaf0", "#ffd859", "#ff5e6c", "#64dfdf"];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (big ? 90 : 50) + Math.random() * (big ? 240 : 140);
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: (big ? 4 : 2.5) + Math.random() * 4.5,
        color: palette[i % palette.length],
        life: 0.32 + Math.random() * 0.35, maxLife: 0.67
      });
    }
  }

  function spawnPickup(x, y, forcedType = null) {
    const keys = ["popcorn", "rainbow", "boba", "chili", "cake", "bubble"];
    const r = Math.random();
    const type = forcedType || (r < 0.24 ? "popcorn" : r < 0.46 ? "rainbow" : r < 0.68 ? "boba" : r < 0.80 ? "chili" : r < 0.90 ? "cake" : "bubble");
    pickups.push({ x, y, vy: 82, type, phase: Math.random() * 6.28 });
  }

  function spawnQuip(x, y, text) {
    if (quips.length >= 2) quips.shift();
    quips.push({ x: Math.max(84, Math.min(vw - 84, x)), y: Math.max(96, y), text, life: 1.5, maxLife: 1.5 });
  }

  function triggerBomb() {
    if (gameOver || player.bombs <= 0) return;
    player.bombs -= 1;
    bombFlash = 1.0;
    shake = 22;
    sfxBoom(true);
    eBullets.length = 0;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      spawnBoom(e.x, e.y, "#ff5e6c", 14, false);
      score += e.score;
      kills += 1;
      if (Math.random() < 0.45) spawnPickup(e.x, e.y);
      enemies.splice(i, 1);
    }
    if (boss) {
      boss.hp -= 120;
      boss.hitFlash = 0.25;
      spawnBoom(boss.x, boss.y, "#ff5e6c", 26, true);
    }
    bannerText = tx().chiliShout;
    bannerTimer = 1.6;
    renderHud();
  }

  function triggerShield() {
    if (gameOver || player.shieldCd > 0 || player.shieldTime > 0) return;
    player.shieldTime = 4.2;
    player.shieldCd = 11.0;
    sfxPickup();
    floatTexts.push({ x: player.x, y: player.y - 34, text: tx().bubbleShout, color: "#64dfdf", life: 1.1, maxLife: 1.1 });
    renderHud();
  }

  btnSwitchWpn.addEventListener("click", () => {
    player.wpnIdx = (player.wpnIdx + 1) % WEAPONS.length;
    sfxPickup();
    renderHud();
  });
  btnShield.addEventListener("click", triggerShield);
  btnBomb.addEventListener("click", triggerBomb);

  function resetGame() {
    gameOver = false;
    score = 0; kills = 0; stageNum = 1; waveNum = 1; waveTimer = 0;
    prevStageIdx = 0; bgFade = 1;
    player.x = vw * 0.5; player.y = vh * 0.78; player.tx = player.x; player.ty = player.y;
    player.hp = player.maxHp; player.wpnIdx = 0; player.wpnLv = 1; player.bombs = 3;
    player.shieldTime = 0; player.shieldCd = 0; player.invuln = 1.2;
    pBullets.length = 0; eBullets.length = 0; enemies.length = 0;
    pickups.length = 0; particles.length = 0; shockwaves.length = 0;
    floatTexts.length = 0; quips.length = 0; boss = null;
    bossHud.classList.add("hidden");
    endModal.classList.add("hidden");
    // 開局 1 秒就送玩家一顆實繪寶物，馬上體驗爽快吃寶升級！
    spawnPickup(vw * 0.5, vh * 0.22, "popcorn");
    renderHud();
  }
  btnRestart.addEventListener("click", resetGame);

  // --- 操作（單指拖曳跟手 + 鍵盤）---
  let pointerActive = false;
  canvas.addEventListener("pointerdown", e => {
    pointerActive = true;
    const offset = e.pointerType === "touch" ? 44 : 0;
    player.tx = e.clientX;
    player.ty = Math.max(68, e.clientY - offset);
  });
  canvas.addEventListener("pointermove", e => {
    if (!pointerActive && e.pointerType !== "mouse") return;
    if (e.pointerType === "mouse" && e.buttons === 0) return;
    const offset = e.pointerType === "touch" ? 44 : 0;
    player.tx = e.clientX;
    player.ty = Math.max(68, e.clientY - offset);
  });
  window.addEventListener("pointerup", () => { pointerActive = false; });

  const keys = {};
  window.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (e.code === "KeyX" || e.code === "Space") triggerBomb();
    if (e.code === "KeyC" || e.code === "ShiftLeft") triggerShield();
    if (e.code === "KeyQ") { player.wpnIdx = (player.wpnIdx + 1) % WEAPONS.length; renderHud(); }
  });
  window.addEventListener("keyup", e => { keys[e.code] = false; });

  function damagePlayer() {
    if (player.invuln > 0 || player.shieldTime > 0 || gameOver) return;
    player.hp -= 1;
    player.invuln = 1.5;
    player.wpnLv = Math.max(1, player.wpnLv - 1);
    shake = 14;
    spawnBoom(player.x, player.y, "#ff5e6c", 18, false);
    renderHud();
    if (player.hp <= 0) {
      gameOver = true;
      const t = tx();
      endBadge.textContent = t.overBadge;
      endTitle.textContent = t.overTitle;
      endBody.textContent = t.summary(score, stageNum, kills);
      btnRestart.textContent = t.restart;
      endModal.classList.remove("hidden");
    }
  }

  function firePlayerWeapon() {
    const w = WEAPONS[player.wpnIdx];
    const lv = player.wpnLv;
    sfxShoot(w.id);
    if (w.id === "popcorn") {
      // 奶油爆米花散射機砲
      const count = Math.min(6, lv + 1);
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 0.14;
        pBullets.push({
          kind: "popcorn", x: player.x + spread * 46, y: player.y - 26,
          vx: Math.sin(spread) * 560, vy: -Math.cos(spread) * 620,
          r: 7 + lv * 0.5, dmg: 10 + lv * 2
        });
      }
      player.fireCd = 0.14;
    } else if (w.id === "rainbow") {
      // 彩虹冰棒光束砲
      const lanes = lv >= 4 ? [-18, 0, 18] : lv >= 2 ? [-12, 12] : [0];
      lanes.forEach(dx => {
        pBullets.push({
          kind: "rainbow", x: player.x + dx, y: player.y - 32,
          vx: 0, vy: -860, r: 8 + lv, dmg: 16 + lv * 3
        });
      });
      player.fireCd = 0.125;
    } else {
      // 追蹤波霸飛彈
      const count = Math.min(4, Math.ceil((lv + 1) / 2));
      for (let i = 0; i < count; i++) {
        const dx = (i - (count - 1) / 2) * 26;
        pBullets.push({
          kind: "boba", x: player.x + dx, y: player.y - 20,
          vx: dx * 3.5, vy: -460, r: 8, dmg: 15 + lv * 3, homing: true
        });
      }
      player.fireCd = 0.19;
    }
  }

  function spawnWave() {
    if (waveNum <= 3) {
      const cnt = 4 + waveNum + stageNum;
      for (let i = 0; i < cnt; i++) {
        const heavy = i % 3 === 2;
        enemies.push({
          kind: heavy ? "toaster" : "catufo",
          x: 42 + ((vw - 84) * ((i + 0.5) / cnt)),
          y: -46 - i * 48,
          vx: 0, vy: heavy ? 74 : 112,
          hp: (heavy ? 52 : 24) + stageNum * 12,
          maxHp: (heavy ? 52 : 24) + stageNum * 12,
          size: heavy ? 68 : 54,
          score: heavy ? 350 : 150,
          phase: Math.random() * 6.28,
          fireCd: 0.7 + Math.random() * 0.9,
          hitFlash: 0
        });
      }
      waveNum += 1;
      renderHud();
    } else if (!boss) {
      boss = {
        x: vw * 0.5, y: -110, targetY: Math.min(185, vh * 0.24),
        hp: 580 + stageNum * 260, maxHp: 580 + stageNum * 260,
        phase: 1, size: Math.min(196, vw * 0.48),
        fireCd: 0.8, quipCd: 3.0, hitFlash: 0
      };
      bossHud.classList.remove("hidden");
      bannerText = tx().bossWarn;
      bannerTimer = 2.2;
      renderHud();
    }
  }

  window.__cuteplaneDebug = {
    getState: () => ({ score, kills, stageNum, waveNum, bgmRunning, soundOn, pickups: pickups.length, enemies: enemies.length, boss: !!boss, hp: player.hp, wpn: WEAPONS[player.wpnIdx].id }),
    spawnAllTreasures: () => {
      pickups.length = 0;
      const types = ["popcorn", "rainbow", "boba", "chili", "cake", "bubble"];
      types.forEach((tp, i) => {
        const col = i % 3, row = Math.floor(i / 3);
        pickups.push({
          x: vw * (0.24 + col * 0.26),
          y: vh * (0.30 + row * 0.16),
          vy: 14, type: tp, phase: i * 1.1
        });
      });
    },
    setStage: (n) => {
      prevStageIdx = (stageNum - 1) % 3;
      stageNum = n;
      bgFade = 1;
      renderHud();
    }
  };

  resetGame();

  // --- 主迴圈 (60fps) ---
  let lastT = performance.now();
  function drawBgLayer(img, alpha) {
    if (!img || !img.complete || img.naturalWidth <= 0 || alpha <= 0) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    const scale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (vw - dw) * 0.5;
    const cycle = dh * 2;
    const off = bgScroll % cycle;
    // 鏡像無縫雙磚捲動（徹底消除上下接縫線！）
    for (let k = -1; k <= 1; k++) {
      const yA = off + k * cycle - dh;
      if (yA < vh && yA + dh > 0) {
        ctx.drawImage(img, dx, yA, dw, dh);
      }
      const yB = off + k * cycle;
      if (yB < vh && yB + dh > 0) {
        ctx.save();
        ctx.translate(0, yB + dh);
        ctx.scale(1, -1);
        ctx.drawImage(img, dx, 0, dw, dh);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const t = now * 0.001;

    if (!gameOver) {
      // 鍵盤移動
      const kSpd = 380;
      if (keys.ArrowLeft || keys.KeyA) player.tx -= kSpd * dt;
      if (keys.ArrowRight || keys.KeyD) player.tx += kSpd * dt;
      if (keys.ArrowUp || keys.KeyW) player.ty -= kSpd * dt;
      if (keys.ArrowDown || keys.KeyS) player.ty += kSpd * dt;
      player.tx = Math.max(30, Math.min(vw - 30, player.tx));
      player.ty = Math.max(70, Math.min(vh - 64, player.ty));

      const dx = player.tx - player.x;
      const dy = player.ty - player.y;
      player.x += dx * Math.min(1, dt * 16);
      player.y += dy * Math.min(1, dt * 16);
      player.tilt = Math.max(-0.22, Math.min(0.22, dx * 0.006));

      if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
      if (player.shieldTime > 0) {
        player.shieldTime = Math.max(0, player.shieldTime - dt);
        if (player.shieldTime === 0) renderHud();
      }
      if (player.shieldCd > 0) {
        const prevS = Math.ceil(player.shieldCd);
        player.shieldCd = Math.max(0, player.shieldCd - dt);
        if (Math.ceil(player.shieldCd) !== prevS) renderHud();
      }

      player.fireCd -= dt;
      if (player.fireCd <= 0) firePlayerWeapon();

      // 波次推進
      if (enemies.length === 0 && !boss) {
        waveTimer += dt;
        if (waveTimer >= 0.9) {
          waveTimer = 0;
          spawnWave();
        }
      }

      // 更新玩家子彈
      for (let i = pBullets.length - 1; i >= 0; i--) {
        const b = pBullets[i];
        if (b.homing) {
          let tgt = boss || null;
          let bestD = Infinity;
          for (const e of enemies) {
            const d = Math.hypot(e.x - b.x, e.y - b.y);
            if (d < bestD) { bestD = d; tgt = e; }
          }
          if (tgt) {
            const ang = Math.atan2(tgt.y - b.y, tgt.x - b.x);
            b.vx += (Math.cos(ang) * 560 - b.vx) * Math.min(1, dt * 7);
            b.vy += (Math.sin(ang) * 560 - b.vy) * Math.min(1, dt * 7);
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < -40 || b.y > vh + 40 || b.x < -40 || b.x > vw + 40) { pBullets.splice(i, 1); continue; }

        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.size * 0.44 + b.r) {
            e.hp -= b.dmg;
            e.hitFlash = 0.08;
            hit = true;
            if (e.hp <= 0) {
              spawnBoom(e.x, e.y, "#ffd166", 14, false);
              score += e.score;
              kills += 1;
              if (Math.random() < 0.34) spawnPickup(e.x, e.y);
              if (Math.random() < 0.24) {
                const ql = tx().enemyQuips;
                spawnQuip(e.x, e.y - 16, ql[Math.floor(Math.random() * ql.length)]);
              }
              enemies.splice(j, 1);
              renderHud();
            }
            break;
          }
        }
        if (!hit && boss && Math.hypot(b.x - boss.x, b.y - boss.y) < boss.size * 0.44 + b.r) {
          boss.hp -= b.dmg;
          boss.hitFlash = 0.06;
          hit = true;
          score += 10;
          bossFill.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + "%";
        }
        if (hit) pBullets.splice(i, 1);
      }

      // 更新首領（珍奶貓皇空中母艦）
      if (boss) {
        if (boss.y < boss.targetY) boss.y += 120 * dt;
        else boss.x = vw * 0.5 + Math.sin(t * (1.2 + boss.phase * 0.35)) * Math.min(130, vw * 0.28);
        if (boss.hitFlash > 0) boss.hitFlash = Math.max(0, boss.hitFlash - dt);

        const ratio = boss.hp / boss.maxHp;
        const newPhase = ratio < 0.35 ? 3 : ratio < 0.7 ? 2 : 1;
        if (newPhase !== boss.phase) {
          boss.phase = newPhase;
          spawnBoom(boss.x, boss.y, "#ff70d9", 22, true);
          const bq = tx().bossQuips;
          spawnQuip(boss.x, boss.y - 48, bq[Math.floor(Math.random() * bq.length)]);
          renderHud();
        }
        boss.quipCd -= dt;
        if (boss.quipCd <= 0) {
          boss.quipCd = 4.2;
          const bq = tx().bossQuips;
          spawnQuip(boss.x, boss.y - 48, bq[Math.floor(Math.random() * bq.length)]);
        }
        boss.fireCd -= dt;
        if (boss.fireCd <= 0 && boss.y >= boss.targetY - 10) {
          const count = 5 + boss.phase * 2;
          for (let i = 0; i < count; i++) {
            const ang = Math.PI * 0.22 + (Math.PI * 0.56 * i) / (count - 1) + Math.sin(t * 2) * 0.14;
            eBullets.push({
              x: boss.x, y: boss.y + 34,
              vx: Math.cos(ang) * (170 + boss.phase * 24),
              vy: Math.sin(ang) * (170 + boss.phase * 24),
              r: 7, kind: i % 2 === 0 ? "boba" : "pink"
            });
          }
          boss.fireCd = Math.max(0.58, 1.15 - boss.phase * 0.18);
        }
        if (boss.hp <= 0) {
          spawnBoom(boss.x, boss.y, "#ffd859", 40, true);
          // 爆出三個超可愛實繪寶物當戰利品！
          spawnPickup(boss.x - 42, boss.y, "cake");
          spawnPickup(boss.x, boss.y - 14, "chili");
          spawnPickup(boss.x + 42, boss.y, "bubble");
          score += 2000 * stageNum;
          kills += 1;
          boss = null;
          eBullets.length = 0;
          bossHud.classList.add("hidden");
          prevStageIdx = (stageNum - 1) % 3;
          stageNum += 1;
          bgFade = 0;
          waveNum = 1;
          waveTimer = 0;
          const nextName = tx().stages[(stageNum - 1) % 3];
          bannerText = tx().stageClear(stageNum, nextName);
          bannerTimer = 2.6;
          renderHud();
        }
      }

      // 更新敵機
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        e.x += Math.sin(t * 3.2 + e.phase) * (e.kind === "catufo" ? 78 : 34) * dt;
        e.y += e.vy * dt;
        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
        e.fireCd -= dt;
        if (e.fireCd <= 0 && e.y > 40 && e.y < vh * 0.62) {
          const ang = Math.atan2(player.y - e.y, player.x - e.x);
          eBullets.push({
            x: e.x, y: e.y + 18,
            vx: Math.cos(ang) * 205, vy: Math.sin(ang) * 205,
            r: 6, kind: e.kind === "toaster" ? "toast" : "pink"
          });
          e.fireCd = e.kind === "toaster" ? 1.25 : 1.75;
        }
        if (Math.hypot(e.x - player.x, e.y - player.y) < e.size * 0.4 + 14) {
          damagePlayer();
          spawnBoom(e.x, e.y, "#ff70d9", 12, false);
          enemies.splice(i, 1);
          continue;
        }
        if (e.y > vh + 80) enemies.splice(i, 1);
      }

      // 更新敵彈
      for (let i = eBullets.length - 1; i >= 0; i--) {
        const eb = eBullets[i];
        eb.x += eb.vx * dt;
        eb.y += eb.vy * dt;
        if (eb.y < -30 || eb.y > vh + 30 || eb.x < -30 || eb.x > vw + 30) { eBullets.splice(i, 1); continue; }
        if (Math.hypot(eb.x - player.x, eb.y - player.y) < eb.r + (player.shieldTime > 0 ? 38 : 11)) {
          if (player.shieldTime > 0) {
            spawnBoom(eb.x, eb.y, "#64dfdf", 6, false);
            eBullets.splice(i, 1);
          } else {
            eBullets.splice(i, 1);
            damagePlayer();
          }
        }
      }

      // 更新 6 款實繪寶物掉落（無 ABCD 外框！）
      for (let i = pickups.length - 1; i >= 0; i--) {
        const pk = pickups[i];
        pk.y += pk.vy * dt;
        pk.x += Math.sin(t * 4 + pk.phase) * 32 * dt;
        if (Math.hypot(pk.x - player.x, pk.y - player.y) < 42) {
          sfxPickup();
          const tCopy = tx().pickups;
          if (pk.type === "chili") {
            player.bombs = Math.min(6, player.bombs + 1);
          } else if (pk.type === "cake") {
            player.hp = Math.min(player.maxHp, player.hp + 1);
          } else if (pk.type === "bubble") {
            player.shieldTime = Math.max(player.shieldTime, 4.5);
          } else {
            const idx = WEAPONS.findIndex(w => w.id === pk.type);
            if (player.wpnIdx === idx) player.wpnLv = Math.min(5, player.wpnLv + 1);
            else { player.wpnIdx = idx; player.wpnLv = Math.min(5, Math.max(2, player.wpnLv)); }
          }
          floatTexts.push({
            x: player.x, y: player.y - 34,
            text: tCopy[pk.type] || "POWER UP!",
            color: (TREASURES[pk.type] && TREASURES[pk.type].glow) || "#ffd859",
            life: 1.15, maxLife: 1.15
          });
          spawnBoom(pk.x, pk.y, (TREASURES[pk.type]?.glow) || "#ffd859", 10, false);
          renderHud();
          pickups.splice(i, 1);
          continue;
        }
        if (pk.y > vh + 50) pickups.splice(i, 1);
      }
    }

    // 背景與粒子更新
    bgScroll += 105 * dt;
    if (bgFade < 1) bgFade = Math.min(1, bgFade + dt * 0.9);
    if (shake > 0) shake = Math.max(0, shake - dt * 52);
    if (bombFlash > 0) bombFlash = Math.max(0, bombFlash - dt * 1.8);
    if (bannerTimer > 0) bannerTimer = Math.max(0, bannerTimer - dt);

    for (const c of clouds) {
      c.y += c.speed * dt;
      if (c.y - c.r > vh) { c.y = -c.r * 1.3; c.x = Math.random() * vw; }
    }
    for (const s of sparkles) {
      s.y += s.speed * dt;
      if (s.y > vh + 10) { s.y = -10; s.x = Math.random() * vw; }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) shockwaves.splice(i, 1);
    }
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const f = floatTexts[i];
      f.life -= dt;
      f.y -= 36 * dt;
      if (f.life <= 0) floatTexts.splice(i, 1);
    }
    for (let i = quips.length - 1; i >= 0; i--) {
      quips[i].life -= dt;
      quips[i].y -= 16 * dt;
      if (quips[i].life <= 0) quips.splice(i, 1);
    }

    // --- 繪製 ---
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    // 1. 三大關卡手繪豐富捲軸背景（過關平滑交錯淡入！）
    const bgKeys = ["bg1", "bg2", "bg3"];
    const curIdx = (stageNum - 1) % 3;
    if (bgFade < 1) drawBgLayer(imgs[bgKeys[prevStageIdx]], 1);
    drawBgLayer(imgs[bgKeys[curIdx]], bgFade);

    // 2. 關卡氛圍視差雲與閃亮星點
    for (const c of clouds) {
      ctx.fillStyle = curIdx === 2
        ? `rgba(255, 224, 150, ${c.alpha * 0.45})`
        : `rgba(255, 255, 255, ${c.alpha})`;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
    for (const s of sparkles) {
      const a = 0.35 + 0.4 * Math.sin(t * 4 + s.phase);
      ctx.fillStyle = curIdx === 2 ? `rgba(255, 232, 130, ${a})` : `rgba(255, 255, 255, ${a})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }

    // 3. 6 款細緻實繪寶物（純圖示＋柔和旋轉星芒光環，完全沒有 ABCD 文字方框！）
    for (const pk of pickups) {
      const def = TREASURES[pk.type] || TREASURES.popcorn;
      const im = imgs[def.img];
      const bob = Math.sin(t * 6 + pk.phase) * 3;
      const rot = Math.sin(t * 3.5 + pk.phase) * 0.14;
      ctx.save();
      ctx.translate(pk.x, pk.y + bob);
      // 柔和外光環
      const rg = ctx.createRadialGradient(0, 0, 6, 0, 0, 32);
      rg.addColorStop(0, def.glow + "cc");
      rg.addColorStop(1, def.glow + "00");
      ctx.fillStyle = rg;
      ctx.beginPath();
      ctx.arc(0, 0, 32, 0, Math.PI * 2);
      ctx.fill();
      ctx.rotate(rot);
      if (im && im.complete && im.naturalWidth > 0) {
        const s = 48;
        const asp = im.naturalWidth / im.naturalHeight;
        const w = asp >= 1 ? s : s * asp;
        const h = asp >= 1 ? s / asp : s;
        ctx.drawImage(im, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
    }

    // 4. 玩家子彈（奶油爆米花／彩虹光束／波霸珍珠）
    for (const b of pBullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      if (b.kind === "rainbow") {
        const colors = ["#ff5e6c", "#ffd859", "#2cd49c", "#25b4ff", "#a855f7"];
        const col = colors[Math.floor((now * 0.02) % colors.length)];
        ctx.fillStyle = col;
        ctx.shadowColor = col;
        ctx.shadowBlur = 12;
        ctx.beginPath();
        ctx.roundRect(-b.r * 0.5, -16, b.r, 32, 5);
        ctx.fill();
      } else if (b.kind === "boba") {
        ctx.fillStyle = "#3b1f12";
        ctx.strokeStyle = "#ffd859";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath();
        ctx.arc(-2.5, -2.5, 2.2, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#fff3b0";
        ctx.strokeStyle = "#d97706";
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(0, 0, b.r, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 5. 敵機（貓咪幽浮／吐司轟炸機）
    for (const e of enemies) {
      const im = imgs[e.kind === "toaster" ? "enemy2" : "enemy1"];
      ctx.save();
      ctx.translate(e.x, e.y);
      if (e.hitFlash > 0) ctx.filter = "brightness(1.8)";
      if (im && im.complete && im.naturalWidth > 0) {
        const asp = im.naturalWidth / im.naturalHeight;
        const w = e.size * asp, h = e.size;
        ctx.drawImage(im, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
    }

    // 6. 首領（珍奶貓皇空中母艦）
    if (boss && imgs.boss.complete && imgs.boss.naturalWidth > 0) {
      ctx.save();
      ctx.translate(boss.x, boss.y + Math.sin(t * 3) * 4);
      if (boss.hitFlash > 0) ctx.filter = "brightness(1.75)";
      const asp = imgs.boss.naturalWidth / imgs.boss.naturalHeight;
      const w = boss.size * asp, h = boss.size;
      ctx.drawImage(imgs.boss, -w * 0.5, -h * 0.5, w, h);
      ctx.restore();
    }

    // 7. 敵彈（珍珠彈／草莓彈／奶油吐司彈）
    for (const eb of eBullets) {
      ctx.save();
      ctx.translate(eb.x, eb.y);
      ctx.fillStyle = eb.kind === "boba" ? "#2e160c" : eb.kind === "toast" ? "#f59e0b" : "#ff5e9c";
      ctx.strokeStyle = "#fffaf0";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, eb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    // 8. 柴犬英雄戰機＋推進火焰＋七彩泡泡盾
    if (!gameOver && (player.invuln <= 0 || Math.floor(now / 70) % 2 === 0)) {
      ctx.save();
      ctx.translate(player.x, player.y);
      ctx.rotate(player.tilt);
      // 尾焰
      ctx.fillStyle = "#ff9f1c";
      ctx.beginPath();
      ctx.ellipse(0, 34, 8, 12 + Math.sin(t * 45) * 4, 0, 0, Math.PI * 2);
      ctx.fill();
      if (imgs.hero.complete && imgs.hero.naturalWidth > 0) {
        const s = 74;
        const asp = imgs.hero.naturalWidth / imgs.hero.naturalHeight;
        ctx.drawImage(imgs.hero, -s * asp * 0.5, -s * 0.5, s * asp, s);
      }
      if (player.shieldTime > 0) {
        ctx.strokeStyle = `hsla(${(now * 0.25) % 360}, 95%, 70%, 0.9)`;
        ctx.lineWidth = 4;
        ctx.fillStyle = "rgba(100, 223, 223, 0.16)";
        ctx.beginPath();
        ctx.arc(0, 0, 44 + Math.sin(t * 10) * 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
      }
      ctx.restore();
    }

    // 9. 爆炸粒子與衝擊波
    for (const sw of shockwaves) {
      const p = 1 - sw.life / sw.maxLife;
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - p);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = 4 * (1 - p * 0.6);
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, sw.r + (sw.maxR - sw.r) * p, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 10. 搞笑敵機對話小氣泡
    for (const q of quips) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, q.life / 0.35);
      ctx.font = "900 12px 'Microsoft JhengHei', sans-serif";
      const tw = ctx.measureText(q.text).width + 18;
      ctx.fillStyle = "#fffaf0";
      ctx.strokeStyle = "#3a2216";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(q.x - tw * 0.5, q.y - 14, tw, 26, 7);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2b1a12";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(q.text, q.x, q.y - 1);
      ctx.restore();
    }

    // 11. 吃寶飄浮文字
    for (const f of floatTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life / 0.35);
      ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "center";
      ctx.lineWidth = 4;
      ctx.strokeStyle = "#2b1a12";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    // 12. 爆辣清場閃光與頂部橫幅
    if (bombFlash > 0) {
      ctx.fillStyle = `rgba(255, 210, 120, ${bombFlash * 0.52})`;
      ctx.fillRect(0, 0, vw, vh);
    }
    if (bannerTimer > 0 && bannerText) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, bannerTimer / 0.35);
      ctx.font = "900 14px 'Microsoft JhengHei', sans-serif";
      const bw = Math.min(vw - 20, ctx.measureText(bannerText).width + 28);
      ctx.fillStyle = "rgba(255, 94, 108, 0.94)";
      ctx.strokeStyle = "#fffaf0";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(vw * 0.5 - bw * 0.5, vh * 0.38, bw, 36, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fffaf0";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(bannerText, vw * 0.5, vh * 0.38 + 18, bw - 14);
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
