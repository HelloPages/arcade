(() => {
  "use strict";

  const VERSION_STAMP = "v_14:45";
  const appEl = document.getElementById("candy-app");
  const canvas = document.getElementById("candyCanvas");
  const ctx = canvas.getContext("2d");
  const fxBack = document.getElementById("fxBackCanvas");
  const fxBackCtx = fxBack.getContext("2d");
  const fxFront = document.getElementById("fxFrontCanvas");
  const fxFrontCtx = fxFront.getContext("2d");
  const boardStage = document.getElementById("boardStage");

  const levelLabel = document.getElementById("levelLabel");
  const movesPill = document.getElementById("movesPill");
  const movesLbl = document.getElementById("movesLbl");
  const movesVal = document.getElementById("movesVal");
  const scoreLbl = document.getElementById("scoreLbl");
  const scoreVal = document.getElementById("scoreVal");
  const goalStrip = document.getElementById("goalStrip");
  const tipBanner = document.getElementById("tipBanner");
  const btnHint = document.getElementById("btnHint");
  const btnBgm = document.getElementById("btnBgm");
  const btnSound = document.getElementById("btnSound");
  const btnRestart = document.getElementById("btnRestart");
  const btnFs = document.getElementById("btnFs");
  const lblHint = document.getElementById("lblHint");
  const lblBgm = document.getElementById("lblBgm");
  const lblSound = document.getElementById("lblSound");
  const lblRestart = document.getElementById("lblRestart");
  const lblFs = document.getElementById("lblFs");

  const resultModal = document.getElementById("resultModal");
  const modalStars = document.getElementById("modalStars");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalStats = document.getElementById("modalStats");
  const btnNextLevel = document.getElementById("btnNextLevel");
  const btnRetryLevel = document.getElementById("btnRetryLevel");

  // --- 多語系 (TW / EN / KO，全部改搭統一像素圖示、零系統 Emoji) ---
  const COPY = {
    tw: {
      level: n => `第 ${n} 關`,
      moves: "步數",
      score: "分數",
      hint: "提示",
      bgmOn: "音樂",
      bgmOff: "音樂關",
      soundOn: "音效",
      soundOff: "靜音",
      restart: "重玩",
      fsEnter: "全螢幕",
      fsExit: "退出",
      tipStart: "單指滑動或點兩顆相鄰台味點心，連成 3 顆就能歡樂消除！",
      tipShuffle: "沒有可走的步了，自動洗牌中！",
      cheers: ["好甜!", "超讚!", "大吉大利!", "夜市滿貫!", "尾牙狂歡!"],
      goalScore: v => `分數 ${v}`,
      goalFrost: v => `糖霜 ${v}`,
      winTitle: n => `第 ${n} 關大過關！`,
      winDesc: "好運爆棚！剩餘步數已換算成紅包加分！",
      loseTitle: "步數用完囉！",
      loseDesc: "差一點點就大吉過關，再來一局吧！",
      nextBtn: "下一關",
      retryBtn: "再玩一次",
      stats: (sc, best) => `本關得分：${sc.toLocaleString()} ｜ 最高分：${best.toLocaleString()}`,
      candyNames: ["糖葫蘆", "雞蛋糕", "汽水", "小龜粿", "珍奶", "鳳梨酥"]
    },
    en: {
      level: n => `Lv.${n}`,
      moves: "Moves",
      score: "Score",
      hint: "Hint",
      bgmOn: "BGM",
      bgmOff: "Off",
      soundOn: "SFX",
      soundOff: "Off",
      restart: "Retry",
      fsEnter: "Full",
      fsExit: "Exit",
      tipStart: "Swipe or tap two adjacent Taiwanese treats to match 3+!",
      tipShuffle: "No moves left — auto shuffling!",
      cheers: ["Sweet!", "Yummy!", "Lucky!", "Jackpot!", "Party Time!"],
      goalScore: v => `Score ${v}`,
      goalFrost: v => `Frost ${v}`,
      winTitle: n => `Level ${n} Clear!`,
      winDesc: "Jackpot! Leftover moves turned into bonus points!",
      loseTitle: "Out of Moves!",
      loseDesc: "So close! Give it another try!",
      nextBtn: "Next Level",
      retryBtn: "Play Again",
      stats: (sc, best) => `Score: ${sc.toLocaleString()} | Best: ${best.toLocaleString()}`,
      candyNames: ["Tanghulu", "ChickCake", "Soda", "Turtle", "Boba", "Pineapple"]
    },
    ko: {
      level: n => `${n}단계`,
      moves: "횟수",
      score: "점수",
      hint: "힌트",
      bgmOn: "음악",
      bgmOff: "끔",
      soundOn: "효과",
      soundOff: "끔",
      restart: "다시",
      fsEnter: "전체",
      fsExit: "닫기",
      tipStart: "한 손가락으로 밀거나 인접한 대만 간식을 눌러 3개 이상 맞추세요!",
      tipShuffle: "움직일 수 있는 수가 없어 자동 섞기 중!",
      cheers: ["달콤!", "최고!", "대박!", "축제 콤보!", "파티 타임!"],
      goalScore: v => `점수 ${v}`,
      goalFrost: v => `프로스팅 ${v}`,
      winTitle: n => `${n}단계 클리어!`,
      winDesc: "대박! 남은 횟수가 보너스 점수로 전환되었어요!",
      loseTitle: "이동 횟수 종료!",
      loseDesc: "아쉬워요! 다시 도전해 보세요!",
      nextBtn: "다음 단계",
      retryBtn: "다시 하기",
      stats: (sc, best) => `점수: ${sc.toLocaleString()} | 최고: ${best.toLocaleString()}`,
      candyNames: ["탕후루", "계란빵", "사이다", "거북떡", "버블티", "펑리수"]
    }
  };
  function getLang() { return (window.ArcadeI18n && window.ArcadeI18n.getLang()) || "tw"; }
  function T() { return COPY[getLang()] || COPY.tw; }

  const isLobbyEmbed = (() => {
    try {
      const sp = new URLSearchParams(location.search);
      if (sp.get("embed") !== "1") return false;
      return window.self !== window.top;
    } catch { return false; }
  })();
  if (isLobbyEmbed && btnFs) btnFs.classList.add("hidden");

  function syncPortalFsSafeZone() {
    if (!appEl) return;
    let inPortalFs = false;
    if (isLobbyEmbed) {
      try {
        inPortalFs = !!(window.top && window.top.document && window.top.document.body.classList.contains("immersive-fs"));
      } catch {
        inPortalFs = window.innerHeight >= (window.screen?.height || 9999) - 95;
      }
    }
    appEl.classList.toggle("portal-fs-pad", inPortalFs);
  }

  // --- 全套統一高密度超精緻半立體像素真透明台味甜點＋禮物雨精靈 ---
  const PX_VER = "v=20261128_v5";
  const CANDY_META = [
    { id: 0, main: "#ff3b63", light: "#ff9cb2", src: `./assets/px-tw0.webp?${PX_VER}` }, // 糖葫蘆
    { id: 1, main: "#ffc414", light: "#fff099", src: `./assets/px-tw1.webp?${PX_VER}` }, // 雞蛋糕小雞
    { id: 2, main: "#2596ff", light: "#a8e2ff", src: `./assets/px-tw2.webp?${PX_VER}` }, // 彈珠汽水
    { id: 3, main: "#18c574", light: "#a7f3d0", src: `./assets/px-tw3.webp?${PX_VER}` }, // 草仔粿小龜
    { id: 4, main: "#9b4dff", light: "#dfc4ff", src: `./assets/px-tw4.webp?${PX_VER}` }, // 芋頭珍奶杯
    { id: 5, main: "#ff7e1a", light: "#ffd299", src: `./assets/px-tw5.webp?${PX_VER}` }  // 黃金鳳梨酥
  ];
  const loadPxImg = src => { const im = new Image(); im.decoding = "async"; im.src = src; return im; };
  const candyImgs = CANDY_META.map(m => loadPxImg(m.src));
  const bombImg = loadPxImg(`./assets/px-bomb.webp?${PX_VER}`);
  const partyStickers = [
    loadPxImg(`./assets/px-gift-red.webp?${PX_VER}`),
    loadPxImg(`./assets/px-gift-box.webp?${PX_VER}`),
    loadPxImg(`./assets/px-gift-coin.webp?${PX_VER}`),
    loadPxImg(`./assets/px-gift-star.webp?${PX_VER}`),
    loadPxImg(`./assets/px-gift-bubble.webp?${PX_VER}`)
  ];

  // =========================================================================
  // 雙層尾牙級持續禮物雨 ＋ 歡樂彩帶噴泉爆破系統（嚴格上限回收、不掉幀）
  // =========================================================================
  const RIBBON_COLORS = ["#ff4d79", "#ffd447", "#38d9c0", "#7c6cff", "#ff8a3d", "#ff85c0", "#59c9ff"];
  const backDrops = [];   // 背景層常態持續禮物雨
  const frontBursts = []; // 前景層彩炮／噴泉爆破（連鎖、特殊技、過關狂歡）
  let fxW = window.innerWidth, fxH = window.innerHeight;
  let backSpawnAcc = 0;
  let winShowerTimer = 0;

  function resizeFxCanvases() {
    fxW = window.innerWidth;
    fxH = window.innerHeight;
    const d = Math.min(window.devicePixelRatio || 1, 2);
    for (const [cv, g] of [[fxBack, fxBackCtx], [fxFront, fxFrontCtx]]) {
      cv.width = Math.round(fxW * d);
      cv.height = Math.round(fxH * d);
      g.setTransform(d, 0, 0, d, 0, 0);
      g.imageSmoothingEnabled = true;
      g.imageSmoothingQuality = "high";
    }
  }
  window.addEventListener("resize", resizeFxCanvases);
  resizeFxCanvases();

  function spawnBackGiftDrop(randomY = false) {
    if (backDrops.length >= 46) return;
    const depth = 0.55 + Math.random() * 0.50;
    const isRibbon = Math.random() < 0.44;
    backDrops.push({
      kind: isRibbon ? "ribbon" : "sticker",
      stickerIdx: Math.floor(Math.random() * partyStickers.length),
      color: RIBBON_COLORS[Math.floor(Math.random() * RIBBON_COLORS.length)],
      x: Math.random() * fxW,
      y: randomY ? Math.random() * fxH : -32 - Math.random() * 30,
      vx: (Math.random() - 0.5) * 18,
      vy: (34 + Math.random() * 44) * depth,
      size: isRibbon ? (10 + Math.random() * 7) * depth : (22 + Math.random() * 14) * depth,
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 2.8,
      swayPhase: Math.random() * 6.28,
      swayAmp: 12 + Math.random() * 20,
      alpha: 0.48 + depth * 0.36
    });
  }
  // 開場立即鋪滿溫馨流動的禮物雨，打開畫面就有生命力！
  for (let i = 0; i < 24; i++) spawnBackGiftDrop(true);

  // 尾牙抽獎三點噴泉＋雙側彩帶禮炮爆破（連鎖／特殊物件／過關逐級加強！）
  function triggerPartyExplosion(intensity = 1, originX = fxW * 0.5, originY = fxH * 0.52) {
    const MAX_FRONT = 110;
    const count = Math.min(48, Math.round(14 * intensity));
    const launchers = intensity >= 1.6
      ? [
          { x: fxW * 0.08, y: fxH * 0.72, dir: 1 },
          { x: fxW * 0.92, y: fxH * 0.72, dir: -1 },
          { x: fxW * 0.50, y: fxH * 0.86, dir: 0 },
          { x: originX, y: originY, dir: 0 }
        ]
      : [
          { x: originX, y: originY, dir: 0 },
          { x: fxW * 0.12, y: fxH * 0.76, dir: 1 },
          { x: fxW * 0.88, y: fxH * 0.76, dir: -1 }
        ];

    for (let i = 0; i < count; i++) {
      if (frontBursts.length >= MAX_FRONT) frontBursts.shift();
      const org = launchers[i % launchers.length];
      const isRibbon = i % 3 !== 0;
      const vx = org.dir === 0
        ? (Math.random() - 0.5) * (280 + intensity * 120)
        : org.dir * (110 + Math.random() * 210);
      const vy = -(260 + Math.random() * 310) * Math.min(1.45, 0.85 + intensity * 0.25);
      frontBursts.push({
        kind: isRibbon ? "ribbon" : "sticker",
        stickerIdx: Math.floor(Math.random() * partyStickers.length),
        color: RIBBON_COLORS[Math.floor(Math.random() * RIBBON_COLORS.length)],
        x: org.x + (Math.random() - 0.5) * 24,
        y: org.y + (Math.random() - 0.5) * 18,
        vx, vy,
        gravity: isRibbon ? 360 : 450,
        size: isRibbon ? (9 + Math.random() * 7) : (24 + Math.random() * 14),
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 9.5,
        twist: Math.random() * 6.28,
        life: 1.45 + Math.random() * 0.95,
        maxLife: 2.4
      });
    }
  }

  function updateAndDrawFx(dt, now) {
    // 1. 背景層持續禮物雨
    backSpawnAcc += dt;
    if (backSpawnAcc >= 0.34) {
      backSpawnAcc = 0;
      spawnBackGiftDrop(false);
    }
    fxBackCtx.clearRect(0, 0, fxW, fxH);
    for (let i = backDrops.length - 1; i >= 0; i--) {
      const p = backDrops[i];
      p.y += p.vy * dt;
      p.x += (p.vx + Math.sin(now * 0.0018 + p.swayPhase) * p.swayAmp) * dt;
      p.rot += p.vrot * dt;
      if (p.y > fxH + 45) { backDrops.splice(i, 1); continue; }
      fxBackCtx.save();
      fxBackCtx.globalAlpha = p.alpha;
      fxBackCtx.translate(p.x, p.y);
      fxBackCtx.rotate(p.rot);
      if (p.kind === "ribbon") {
        const tw = Math.cos(now * 0.006 + p.swayPhase);
        fxBackCtx.scale(1, Math.max(0.25, Math.abs(tw)));
        fxBackCtx.fillStyle = p.color;
        fxBackCtx.fillRect(-p.size * 0.6, -p.size * 0.3, p.size * 1.2, p.size * 0.6);
      } else {
        const sp = partyStickers[p.stickerIdx];
        if (sp && sp.complete && sp.naturalWidth > 0) fxBackCtx.drawImage(sp, -p.size * 0.5, -p.size * 0.5, p.size, p.size);
      }
      fxBackCtx.restore();
    }

    // 過關持續歡慶噴泉（每 0.9s 補一波，直到點下一關／重玩）
    if (phase === "win") {
      winShowerTimer -= dt;
      if (winShowerTimer <= 0) {
        winShowerTimer = 0.95;
        triggerPartyExplosion(1.4, fxW * (0.2 + Math.random() * 0.6), fxH * 0.65);
      }
    }

    // 2. 前景層歡樂爆破與彩帶噴泉
    fxFrontCtx.clearRect(0, 0, fxW, fxH);
    for (let i = frontBursts.length - 1; i >= 0; i--) {
      const p = frontBursts[i];
      p.life -= dt;
      p.vy += p.gravity * dt;
      p.vx *= 0.99;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vrot * dt;
      if (p.life <= 0 || p.y > fxH + 60) { frontBursts.splice(i, 1); continue; }
      fxFrontCtx.save();
      fxFrontCtx.globalAlpha = Math.min(1, p.life / 0.45);
      fxFrontCtx.translate(p.x, p.y);
      fxFrontCtx.rotate(p.rot);
      if (p.kind === "ribbon") {
        const tw = Math.cos(now * 0.012 + p.twist);
        fxFrontCtx.scale(1, Math.max(0.22, Math.abs(tw)));
        fxFrontCtx.fillStyle = p.color;
        fxFrontCtx.fillRect(-p.size * 0.65, -p.size * 0.32, p.size * 1.3, p.size * 0.64);
      } else {
        const sp = partyStickers[p.stickerIdx];
        if (sp && sp.complete && sp.naturalWidth > 0) fxFrontCtx.drawImage(sp, -p.size * 0.5, -p.size * 0.5, p.size, p.size);
      }
      fxFrontCtx.restore();
    }
  }

  // --- 關卡設計（前幾關輕鬆有成就感） ---
  const LEVELS = [
    { cols: 7, colors: 5, moves: 20, targetScore: 700, collect: [{ color: 0, count: 12 }], frost: "none" },
    { cols: 7, colors: 5, moves: 22, targetScore: 1000, collect: [{ color: 1, count: 14 }, { color: 4, count: 14 }], frost: "none" },
    { cols: 7, colors: 5, moves: 22, targetScore: 1200, collect: [], frost: "center9" },
    { cols: 7, colors: 6, moves: 24, targetScore: 1600, collect: [{ color: 2, count: 16 }, { color: 5, count: 16 }], frost: "none" },
    { cols: 8, colors: 6, moves: 25, targetScore: 2000, collect: [], frost: "diamond" },
    { cols: 8, colors: 6, moves: 26, targetScore: 2400, collect: [{ color: 0, count: 18 }, { color: 3, count: 18 }], frost: "center4" },
    { cols: 8, colors: 6, moves: 27, targetScore: 2800, collect: [{ color: 4, count: 20 }], frost: "corners" },
    { cols: 8, colors: 6, moves: 28, targetScore: 3400, collect: [{ color: 1, count: 22 }, { color: 5, count: 22 }], frost: "diamond" }
  ];
  function getLevelConfig(lv) {
    if (lv <= LEVELS.length) return LEVELS[lv - 1];
    const patterns = ["none", "center9", "diamond", "corners"];
    return {
      cols: 8, colors: 6,
      moves: Math.max(22, 27 - Math.floor((lv - 8) * 0.4)),
      targetScore: 3000 + (lv - 8) * 500,
      collect: [{ color: lv % 6, count: 20 + (lv - 8) * 2 }, { color: (lv + 2) % 6, count: 18 + (lv - 8) * 2 }],
      frost: patterns[lv % patterns.length]
    };
  }

  // =========================================================================
  // 朗朗上口原創復古可愛掌機 BGM（134 BPM，128 步 A - A' - B - C 呼應主旋律）
  // =========================================================================
  let bgmOn = localStorage.getItem("candy_bgm_on") !== "0";
  let sfxOn = localStorage.getItem("candy_sfx_on") !== "0";
  let ac = null, masterBgmGain = null, masterSfxGain = null, bgmFilter = null, bgmAnalyser = null, bgmPcm = null;
  let bgmTimer = null, bgmRunning = false, bgmStep = 0, bgmNextTime = 0, bgmLoopCount = 0, audioUnlocked = false;

  const NOTE_HZ = {
    C3:130.81, D3:146.83, E3:164.81, F3:174.61, G3:196.00, A3:220.00, B3:246.94,
    C4:261.63, D4:293.66, E4:329.63, F4:349.23, G4:392.00, A4:440.00, B4:493.88,
    C5:523.25, D5:587.33, E5:659.25, F5:698.46, G5:783.99, A5:880.00, B5:987.77, C6:1046.50, D6:1174.66, E6:1318.51
  };
  // 超洗腦記憶點主旋律：清楚兩小節呼應樂句（A -> A' -> B 副歌拉高 -> C 回旋收尾接 A）
  const BGM_LEAD = [
    // A 段：朗朗上口跳躍主題「Do-Mi-So-La-So! Mi-Re-Do-Re-Mi!」
    "C5",0,"E5",0,"G5",0,"A5","G5", 0,"E5","D5","C5","D5",0,"E5",0,
    "G5",0,"E5",0,"D5",0,"C5","D5", 0,"E5","G5",0,"E5",0,0,0,
    // A' 段：重複主題並上揚收尾「Do-Mi-So-La-Do6! La-So-Mi-So-La-So!」
    "C5",0,"E5",0,"G5",0,"A5","C6", 0,"A5","G5","E5","G5",0,"A5",0,
    "G5",0,"E5",0,"D5","E5","G5",0, "C5",0,0,0,0,0,0,0,
    // B 段：明亮副歌（F -> G -> Em -> Am，歡樂起飛！）
    "A5",0,"A5",0,"G5",0,"F5",0, "E5",0,"G5",0,"C6",0,"G5",0,
    "F5",0,"A5",0,"G5",0,"E5",0, "D5",0,"E5","F5","G5",0,0,0,
    // C 段：可愛玩具盒回應句，自然導回 A 段首音 C5
    "A5",0,"C6",0,"B5",0,"A5",0, "G5",0,"E5",0,"C5",0,"E5",0,
    "D5",0,"F5",0,"E5",0,"D5",0, "C5",0,"E5",0,"G5",0,0,0
  ];
  // 呼應副旋律（玩具鐘琴在主旋律空拍處輕輕眨眼回應）
  const BGM_BELL = [
    0,0,0,0,0,0,0,0, "C6",0,0,0,0,0,"G5",0,
    0,0,0,0,0,0,0,0, "G5",0,0,0,0,"C6","E6",0,
    0,0,0,0,0,0,0,0, "C6",0,0,0,0,0,"C6",0,
    0,0,0,0,0,0,0,0, 0,"E5","G5","C6",0,"G5",0,0,
    0,0,"C6",0,0,0,"A5",0, 0,0,"C6",0,0,0,"E6",0,
    0,0,"C6",0,0,0,"G5",0, 0,0,0,0,0,"B5","D6",0,
    0,0,0,0,0,0,"C6",0, 0,0,"G5",0,0,0,"G5",0,
    0,0,"A5",0,0,0,"G5",0, 0,"E5","G5","C6",0,0,0,0
  ];
  // 八度跳躍復古貝斯（律動感十足！）
  const BGM_BASS = [
    "C3",0,"C4",0,"G3",0,"C4",0, "A3",0,"A4",0,"E3",0,"A3",0,
    "F3",0,"F4",0,"G3",0,"G4",0, "C3",0,"G3",0,"C4",0,"G3",0,
    "C3",0,"C4",0,"G3",0,"C4",0, "F3",0,"F4",0,"C3",0,"G3",0,
    "D3",0,"A3",0,"G3",0,"D3",0, "C3",0,"G3",0,"C4",0,"G3",0,
    "F3",0,"F4",0,"C4",0,"F4",0, "C3",0,"C4",0,"G3",0,"C4",0,
    "F3",0,"F4",0,"E3",0,"E4",0, "D3",0,"A3",0,"G3",0,"G4",0,
    "F3",0,"F4",0,"G3",0,"G4",0, "E3",0,"E4",0,"A3",0,"E4",0,
    "D3",0,"A3",0,"G3",0,"B3",0, "C3",0,"G3",0,"C4",0,"G3",0
  ];

  function ensureAudio() {
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (!C) return null;
      ac = new C();
      bgmFilter = ac.createBiquadFilter();
      bgmFilter.type = "lowpass";
      bgmFilter.frequency.setValueAtTime(2500, ac.currentTime);
      masterBgmGain = ac.createGain();
      masterBgmGain.gain.setValueAtTime(bgmOn ? 0.54 : 0, ac.currentTime);
      bgmAnalyser = ac.createAnalyser();
      bgmAnalyser.fftSize = 256;
      bgmPcm = new Float32Array(bgmAnalyser.fftSize);
      bgmFilter.connect(masterBgmGain);
      masterBgmGain.connect(bgmAnalyser);
      bgmAnalyser.connect(ac.destination);
      masterSfxGain = ac.createGain();
      masterSfxGain.gain.setValueAtTime(sfxOn ? 0.85 : 0, ac.currentTime);
      masterSfxGain.connect(ac.destination);
    }
    return ac;
  }

  function scheduleBgmStep(a, step, when) {
    const leadNote = BGM_LEAD[step];
    if (leadNote && NOTE_HZ[leadNote]) {
      const hz = NOTE_HZ[leadNote];
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(hz, when);
      g.gain.setValueAtTime(0.001, when);
      g.gain.linearRampToValueAtTime(0.16, when + 0.012);
      g.gain.exponentialRampToValueAtTime(0.001, when + 0.21);
      o.connect(g).connect(bgmFilter); o.start(when); o.stop(when + 0.22);

      const o2 = a.createOscillator(), g2 = a.createGain();
      o2.type = "square"; o2.frequency.setValueAtTime(hz, when);
      g2.gain.setValueAtTime(0.001, when);
      g2.gain.linearRampToValueAtTime(0.03, when + 0.01);
      g2.gain.exponentialRampToValueAtTime(0.001, when + 0.14);
      o2.connect(g2).connect(bgmFilter); o2.start(when); o2.stop(when + 0.15);
    }
    const bellNote = BGM_BELL[step];
    if (bellNote && NOTE_HZ[bellNote]) {
      const oa = a.createOscillator(), ga = a.createGain();
      oa.type = "sine"; oa.frequency.setValueAtTime(NOTE_HZ[bellNote], when);
      ga.gain.setValueAtTime(0.001, when);
      ga.gain.linearRampToValueAtTime(0.068, when + 0.008);
      ga.gain.exponentialRampToValueAtTime(0.001, when + 0.14);
      oa.connect(ga).connect(bgmFilter); oa.start(when); oa.stop(when + 0.15);
    }
    const bassNote = BGM_BASS[step];
    if (bassNote && NOTE_HZ[bassNote]) {
      const ob = a.createOscillator(), gb = a.createGain();
      ob.type = "triangle"; ob.frequency.setValueAtTime(NOTE_HZ[bassNote], when);
      gb.gain.setValueAtTime(0.001, when);
      gb.gain.linearRampToValueAtTime(0.14, when + 0.01);
      gb.gain.exponentialRampToValueAtTime(0.001, when + 0.17);
      ob.connect(gb).connect(bgmFilter); ob.start(when); ob.stop(when + 0.18);
    }
    // 輕快復古節奏（第 0 拍底鼓、第 4 拍清脆小鼓、偶數拍輕響鈸）
    if (step % 8 === 0) {
      const ok = a.createOscillator(), gk = a.createGain();
      ok.type = "sine"; ok.frequency.setValueAtTime(155, when); ok.frequency.exponentialRampToValueAtTime(48, when + 0.065);
      gk.gain.setValueAtTime(0.10, when); gk.gain.exponentialRampToValueAtTime(0.001, when + 0.075);
      ok.connect(gk).connect(bgmFilter); ok.start(when); ok.stop(when + 0.08);
    } else if (step % 8 === 4) {
      const os = a.createOscillator(), gs = a.createGain();
      os.type = "triangle"; os.frequency.setValueAtTime(320, when); os.frequency.exponentialRampToValueAtTime(120, when + 0.045);
      gs.gain.setValueAtTime(0.065, when); gs.gain.exponentialRampToValueAtTime(0.001, when + 0.055);
      os.connect(gs).connect(bgmFilter); os.start(when); os.stop(when + 0.06);
    }
  }

  function startBgm() {
    if (!bgmOn || document.hidden || bgmRunning) return;
    const a = ensureAudio();
    if (!a) return;
    if (a.state === "suspended") {
      a.resume().then(() => { if (bgmOn && !document.hidden) startBgm(); }).catch(() => {});
      return;
    }
    if (masterBgmGain) masterBgmGain.gain.setValueAtTime(0.56, a.currentTime);
    bgmRunning = true;
    bgmNextTime = a.currentTime + 0.03;
    const stepDur = 60 / 134 / 4; // 134 BPM 輕快復古掌機節奏
    if (bgmTimer) clearInterval(bgmTimer);
    bgmTimer = setInterval(() => {
      if (!bgmRunning || !ac || ac.state !== "running" || document.hidden) return;
      if (bgmNextTime < ac.currentTime - 0.25) bgmNextTime = ac.currentTime + 0.02;
      while (bgmNextTime < ac.currentTime + 0.14) {
        scheduleBgmStep(ac, bgmStep, bgmNextTime);
        bgmNextTime += stepDur;
        bgmStep = (bgmStep + 1) % BGM_LEAD.length;
        if (bgmStep === 0) bgmLoopCount++;
      }
    }, 35);
  }
  function stopBgm() { bgmRunning = false; if (bgmTimer) { clearInterval(bgmTimer); bgmTimer = null; } }
  function unlockAudio() {
    const a = ensureAudio();
    if (!a) return;
    audioUnlocked = true;
    if (a.state === "suspended") a.resume().then(() => { if (bgmOn && !document.hidden) startBgm(); }).catch(() => {});
    else if (bgmOn && !document.hidden) startBgm();
  }
  function pauseAllAudioOnLeave() { stopBgm(); if (ac && ac.state === "running") ac.suspend().catch(() => {}); }
  function resumeAudioOnReturn() {
    if (document.hidden || !audioUnlocked) return;
    if (ac && ac.state === "suspended") ac.resume().then(() => { if (bgmOn && !document.hidden) startBgm(); }).catch(() => {});
    else if (bgmOn) startBgm();
  }
  document.addEventListener("visibilitychange", () => { if (document.hidden) pauseAllAudioOnLeave(); else resumeAudioOnReturn(); });
  window.addEventListener("pagehide", pauseAllAudioOnLeave);
  window.addEventListener("blur", pauseAllAudioOnLeave);
  window.addEventListener("focus", resumeAudioOnReturn);

  function playSfx(freq, dur = 0.11, type = "sine", vol = 0.13, slideTo = null) {
    if (!sfxOn) return;
    const a = ensureAudio();
    if (!a) return;
    if (a.state === "suspended") a.resume().catch(() => {});
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, now);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    g.gain.setValueAtTime(vol, now); g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g).connect(masterSfxGain || a.destination);
    o.start(now); o.stop(now + dur + 0.015);
  }
  const POP_SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
  function sfxSwap() { playSfx(390, 0.075, "triangle", 0.11, 560); }
  function sfxInvalid() { playSfx(260, 0.12, "sine", 0.12, 170); }
  function sfxPop(comboIdx) {
    const f = POP_SCALE[Math.min(POP_SCALE.length - 1, Math.max(0, comboIdx))];
    playSfx(f, 0.13, "sine", 0.14, f * 1.2);
    playSfx(f * 1.5, 0.08, "triangle", 0.07);
    if (comboIdx >= 1) {
      // 連鎖附加尾牙清脆金幣雙叮噹！
      setTimeout(() => playSfx(f * 2.0, 0.10, "sine", 0.09), 55);
    }
  }
  function sfxPartyBoom() {
    // 尾牙彩炮歡慶爆破＋六音上行鈴聲
    playSfx(180, 0.12, "triangle", 0.18, 52);
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => setTimeout(() => playSfx(f, 0.15, "triangle", 0.12), i * 38));
  }
  function sfxWin() {
    playSfx(210, 0.14, "triangle", 0.18, 60);
    [523.25, 659.25, 783.99, 1046.5, 1318.5, 1567.98].forEach((f, i) => setTimeout(() => playSfx(f, 0.24, "triangle", 0.14), i * 75));
  }

  // --- 遊戲核心狀態（動態 COLS × ROWS，真滿版且格子嚴格 1:1 正方形） ---
  let currentLevel = 1;
  let bestScore = Number(localStorage.getItem("candy_match1_best") || "0") || 0;
  let cfg = getLevelConfig(1);
  let COLS = cfg.cols, ROWS = 9;
  let grid = [], frostGrid = [];
  let movesLeft = cfg.moves, score = 0, collected = {}, frostLeft = 0, frostTotal = 0;

  let phase = "idle", animT = 0, swapCtx = null, selected = null, pressedCell = null, hintPair = null;
  let idleTime = 0, comboCount = 0, tipResetTimer = 0, tipDismissed = false;

  const particles = [], beams = [], floatTexts = [];
  let boardShake = 0;
  let boardW = 320, boardH = 440, cellPx = 46, dpr = Math.min(window.devicePixelRatio || 1, 2);

  function setTip(text, isCombo = false, holdSec = 2.2) {
    tipBanner.textContent = text;
    tipBanner.classList.remove("collapsed");
    tipBanner.classList.toggle("combo", isCombo);
    tipResetTimer = holdSec;
  }

  function computeIdealGridSize() {
    syncPortalFsSafeZone();
    const availW = Math.max(220, (boardStage.clientWidth || window.innerWidth - 12) - 12);
    const availH = Math.max(220, (boardStage.clientHeight || 360) - 12);
    const cols = cfg.cols;
    const idealRows = Math.floor(availH / (availW / cols));
    const rows = Math.max(7, Math.min(13, idealRows));
    const cell = Math.floor(Math.min(availW / cols, availH / rows));
    return { cols, rows, cell };
  }

  function resizeBoard(allowRebuildRows = false) {
    syncPortalFsSafeZone();
    const availW = Math.max(220, (boardStage.clientWidth || window.innerWidth - 12) - 12);
    const availH = Math.max(220, (boardStage.clientHeight || 360) - 12);
    if (allowRebuildRows) {
      const ideal = computeIdealGridSize();
      COLS = ideal.cols; ROWS = ideal.rows;
    }
    cellPx = Math.max(26, Math.floor(Math.min(availW / COLS, availH / ROWS)));
    boardW = cellPx * COLS;
    boardH = cellPx * ROWS;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.style.width = `${boardW}px`;
    canvas.style.height = `${boardH}px`;
    canvas.width = Math.round(boardW * dpr);
    canvas.height = Math.round(boardH * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    if (phase === "idle") {
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        if (grid[r] && grid[r][c]) { grid[r][c].x = c; grid[r][c].y = r; }
      }
    }
  }
  function handleViewportChange() {
    const canReflowRows = (phase === "idle" && movesLeft === cfg.moves && score === 0);
    if (canReflowRows) {
      const ideal = computeIdealGridSize();
      if (ideal.rows !== ROWS || ideal.cols !== COLS) {
        COLS = ideal.cols; ROWS = ideal.rows;
        createInitialBoard();
      }
    }
    resizeBoard(false);
  }
  window.addEventListener("resize", handleViewportChange);
  if (typeof ResizeObserver !== "undefined") new ResizeObserver(handleViewportChange).observe(boardStage);

  function randColor() { return Math.floor(Math.random() * cfg.colors); }
  function makeCandy(r, c, color = randColor(), special = null) {
    return { color, special, x: c, y: r, sx: 1, sy: 1, alpha: 1, bobSeed: Math.random() * 6.28 };
  }

  function buildFrostPattern(pattern) {
    frostGrid = Array.from({ length: ROWS }, () => Array(COLS).fill(0));
    frostLeft = 0;
    const mr = Math.floor(ROWS / 2), mc = Math.floor(COLS / 2);
    const mark = (r, c) => { if (r >= 0 && r < ROWS && c >= 0 && c < COLS && !frostGrid[r][c]) { frostGrid[r][c] = 1; frostLeft++; } };
    if (pattern === "center9") { for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) mark(mr + dr, mc + dc); }
    else if (pattern === "center4") { mark(mr - 1, mc - 1); mark(mr - 1, mc); mark(mr, mc - 1); mark(mr, mc); }
    else if (pattern === "diamond") { for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (Math.abs(r - mr) + Math.abs(c - mc) === 2) mark(r, c); }
    else if (pattern === "corners") { [[1,1],[1,COLS-2],[ROWS-2,1],[ROWS-2,COLS-2],[mr,mc],[mr-1,mc],[mr+1,mc],[mr,mc-1],[mr,mc+1]].forEach(([r,c]) => mark(r,c)); }
    frostTotal = frostLeft;
  }

  function createInitialBoard() {
    grid = Array.from({ length: ROWS }, () => Array(COLS).fill(null));
    buildFrostPattern(cfg.frost);
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        let col, tries = 0;
        do {
          col = randColor(); tries++;
        } while (
          tries < 24 &&
          ((c >= 2 && grid[r][c - 1].color === col && grid[r][c - 2].color === col) ||
           (r >= 2 && grid[r - 1][c].color === col && grid[r - 2][c].color === col))
        );
        grid[r][c] = makeCandy(r, c, col, null);
      }
    }
    if (findValidMoves().length === 0) shuffleBoardImmediate();
  }

  function startLevel(lv) {
    currentLevel = lv;
    cfg = getLevelConfig(lv);
    movesLeft = cfg.moves;
    score = 0;
    collected = {};
    cfg.collect.forEach(item => { collected[item.color] = 0; });
    selected = null; pressedCell = null; hintPair = null;
    idleTime = 0; comboCount = 0; phase = "idle"; swapCtx = null;
    particles.length = 0; beams.length = 0; floatTexts.length = 0;
    resultModal.classList.add("hidden");

    if (lv === 1 && !tipDismissed) setTip(T().tipStart, false, 999);
    else tipBanner.classList.add("collapsed");
    resizeBoard(true);
    createInitialBoard();
    resizeBoard(false);
    updateHud();
  }

  function updateHud() {
    const t = T();
    levelLabel.textContent = t.level(currentLevel);
    movesLbl.textContent = t.moves; scoreLbl.textContent = t.score;
    movesVal.textContent = String(movesLeft); scoreVal.textContent = String(score);
    movesPill.classList.toggle("low", movesLeft <= 5 && phase !== "win");

    if (lblHint) lblHint.textContent = t.hint;
    if (lblBgm) lblBgm.textContent = bgmOn ? t.bgmOn : t.bgmOff;
    btnBgm.classList.toggle("muted", !bgmOn);
    if (lblSound) lblSound.textContent = sfxOn ? t.soundOn : t.soundOff;
    btnSound.classList.toggle("muted", !sfxOn);
    if (lblRestart) lblRestart.textContent = t.restart;
    if (lblFs) lblFs.textContent = document.fullscreenElement ? t.fsExit : t.fsEnter;

    goalStrip.innerHTML = "";
    for (const item of cfg.collect) {
      const cur = Math.min(item.count, collected[item.color] || 0);
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (cur >= item.count ? " done" : "");
      const cname = t.candyNames[item.color] || "";
      chip.innerHTML = `<img class="goal-icon" src="${CANDY_META[item.color].src}" alt="${cname}"><span>${cname} ${cur}/${item.count}</span>`;
      goalStrip.appendChild(chip);
    }
    if (frostTotal > 0) {
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (frostLeft <= 0 ? " done" : "");
      chip.innerHTML = `<img class="goal-icon" src="./assets/px-ui-frost.webp?${PX_VER}" alt=""><span>${t.goalFrost(`${frostTotal - frostLeft}/${frostTotal}`)}</span>`;
      goalStrip.appendChild(chip);
    }
    if (cfg.targetScore > 0) {
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (score >= cfg.targetScore ? " done" : "");
      chip.innerHTML = `<img class="goal-icon" src="./assets/px-ui-star.webp?${PX_VER}" alt=""><span>${t.goalScore(`${Math.min(score, cfg.targetScore)}/${cfg.targetScore}`)}</span>`;
      goalStrip.appendChild(chip);
    }
  }

  function isGoalComplete() {
    if (score < cfg.targetScore || frostLeft > 0) return false;
    for (const item of cfg.collect) if ((collected[item.color] || 0) < item.count) return false;
    return true;
  }

  function findMatchGroups() {
    const hRuns = [], vRuns = [];
    for (let r = 0; r < ROWS; r++) {
      let c = 0;
      while (c < COLS) {
        const cell = grid[r][c];
        if (!cell || cell.special === "color") { c++; continue; }
        let end = c + 1;
        while (end < COLS && grid[r][end] && grid[r][end].special !== "color" && grid[r][end].color === cell.color) end++;
        if (end - c >= 3) { const cells = []; for (let k = c; k < end; k++) cells.push({ r, c: k }); hRuns.push({ dir: "h", color: cell.color, cells }); }
        c = end;
      }
    }
    for (let c = 0; c < COLS; c++) {
      let r = 0;
      while (r < ROWS) {
        const cell = grid[r][c];
        if (!cell || cell.special === "color") { r++; continue; }
        let end = r + 1;
        while (end < ROWS && grid[end][c] && grid[end][c].special !== "color" && grid[end][c].color === cell.color) end++;
        if (end - r >= 3) { const cells = []; for (let k = r; k < end; k++) cells.push({ r: k, c }); vRuns.push({ dir: "v", color: cell.color, cells }); }
        r = end;
      }
    }
    const allRuns = [...hRuns, ...vRuns], used = new Array(allRuns.length).fill(false), groups = [];
    for (let i = 0; i < allRuns.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      const comp = [allRuns[i]], keySet = new Set(allRuns[i].cells.map(p => `${p.r},${p.c}`));
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < allRuns.length; j++) {
          if (used[j] || allRuns[j].color !== allRuns[i].color) continue;
          if (allRuns[j].cells.some(p => keySet.has(`${p.r},${p.c}`))) {
            used[j] = true; comp.push(allRuns[j]); allRuns[j].cells.forEach(p => keySet.add(`${p.r},${p.c}`)); changed = true;
          }
        }
      }
      const uniqueCells = [...keySet].map(s => { const [r, c] = s.split(",").map(Number); return { r, c }; });
      const maxLen = Math.max(...comp.map(x => x.cells.length));
      const hasH = comp.some(x => x.dir === "h"), hasV = comp.some(x => x.dir === "v");
      let spawnSpecial = null;
      if (maxLen >= 5) spawnSpecial = "color";
      else if (hasH && hasV && uniqueCells.length >= 5) spawnSpecial = "wrapped";
      else if (maxLen === 4) spawnSpecial = comp[0].dir === "h" ? "stripeV" : "stripeH";
      groups.push({ color: allRuns[i].color, cells: uniqueCells, spawnSpecial });
    }
    return groups;
  }

  function findValidMoves() {
    const moves = [];
    const testSwap = (r1, c1, r2, c2) => {
      const a = grid[r1][c1], b = grid[r2][c2];
      if (!a || !b) return false;
      if (a.special === "color" || b.special === "color" || (a.special && b.special)) return true;
      if (a.color === b.color) return false;
      grid[r1][c1] = b; grid[r2][c2] = a;
      const ok = findMatchGroups().length > 0;
      grid[r1][c1] = a; grid[r2][c2] = b;
      return ok;
    };
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      if (c + 1 < COLS && testSwap(r, c, r, c + 1)) moves.push([{ r, c }, { r, c: c + 1 }]);
      if (r + 1 < ROWS && testSwap(r, c, r + 1, c)) moves.push([{ r, c }, { r: r + 1, c }]);
    }
    return moves;
  }

  function shuffleBoardImmediate() {
    const flat = [];
    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) flat.push(grid[r][c]);
    for (let attempt = 0; attempt < 25; attempt++) {
      for (let i = flat.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [flat[i], flat[j]] = [flat[j], flat[i]]; }
      let idx = 0;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const it = flat[idx++]; it.x = c; it.y = r; it.sx = 1; it.sy = 1; it.alpha = 1; grid[r][c] = it;
      }
      if (findMatchGroups().length === 0 && findValidMoves().length > 0) return;
    }
    createInitialBoard();
  }

  function spawnBurst(r, c, colorHex, count = 10) {
    const cx = (c + 0.5) * cellPx, cy = (r + 0.5) * cellPx;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.5, spd = 75 + Math.random() * 145;
      particles.push({
        x: cx, y: cy, vx: Math.cos(a) * spd, vy: Math.sin(a) * spd - 30,
        r: 3 + Math.random() * 3.8, star: i % 3 === 0,
        color: i % 4 === 0 ? "#ffffff" : colorHex, life: 0.36 + Math.random() * 0.25, maxLife: 0.62
      });
    }
  }
  function spawnBeam(r1, c1, r2, c2, color = "#ffffff", width = 14) {
    beams.push({ x1: (c1 + 0.5) * cellPx, y1: (r1 + 0.5) * cellPx, x2: (c2 + 0.5) * cellPx, y2: (r2 + 0.5) * cellPx, color, width, life: 0.30, maxLife: 0.30 });
  }
  function spawnFloat(r, c, text, color = "#fff6b0") {
    floatTexts.push({ x: Math.max(44, Math.min(boardW - 44, (c + 0.5) * cellPx)), y: Math.max(24, (r + 0.3) * cellPx), text, color, life: 0.92, maxLife: 0.92 });
  }

  function collectClearSet(initialList) {
    const toClear = new Set(), queue = [];
    let specialTriggered = false;
    const addCell = (r, c) => {
      if (r < 0 || r >= ROWS || c < 0 || c >= COLS || !grid[r][c]) return;
      const k = `${r},${c}`;
      if (!toClear.has(k)) { toClear.add(k); queue.push({ r, c }); }
    };
    initialList.forEach(p => addCell(p.r, p.c));

    while (queue.length > 0) {
      const { r, c } = queue.shift();
      const cell = grid[r][c];
      if (!cell || !cell.special) continue;
      specialTriggered = true;
      if (cell.special === "stripeH") {
        spawnBeam(r, 0, r, COLS - 1, CANDY_META[cell.color].light, cellPx * 0.44);
        for (let cc = 0; cc < COLS; cc++) addCell(r, cc);
        boardShake = Math.max(boardShake, 6);
      } else if (cell.special === "stripeV") {
        spawnBeam(0, c, ROWS - 1, c, CANDY_META[cell.color].light, cellPx * 0.44);
        for (let rr = 0; rr < ROWS; rr++) addCell(rr, c);
        boardShake = Math.max(boardShake, 6);
      } else if (cell.special === "wrapped") {
        for (let dr = -1; dr <= 1; dr++) for (let dc = -1; dc <= 1; dc++) addCell(r + dr, c + dc);
        spawnBurst(r, c, "#ffd166", 18);
        boardShake = Math.max(boardShake, 9);
      } else if (cell.special === "color") {
        const targetCol = randColor();
        for (let rr = 0; rr < ROWS; rr++) for (let cc = 0; cc < COLS; cc++) {
          if (grid[rr][cc] && grid[rr][cc].color === targetCol) { spawnBeam(r, c, rr, cc, CANDY_META[targetCol].light, 7); addCell(rr, cc); }
        }
        boardShake = Math.max(boardShake, 11);
      }
    }
    return { cells: [...toClear].map(k => { const [r, c] = k.split(",").map(Number); return { r, c }; }), specialTriggered };
  }

  function applyClearAndGravity(cellsToClear, spawns = [], specialTriggered = false) {
    if (!tipDismissed) {
      tipDismissed = true;
      tipBanner.classList.add("collapsed");
      resizeBoard(false);
    }
    comboCount++;
    const mult = 1 + (comboCount - 1) * 0.5;
    let gained = 0, sumR = 0, sumC = 0;

    for (const { r, c } of cellsToClear) {
      const cell = grid[r][c];
      if (!cell) continue;
      const meta = CANDY_META[cell.color] || CANDY_META[0];
      spawnBurst(r, c, meta.main, cell.special ? 15 : 9);
      if (collected[cell.color] !== undefined) collected[cell.color]++;
      if (frostGrid[r][c] > 0) {
        frostGrid[r][c] = 0; frostLeft = Math.max(0, frostLeft - 1);
        spawnBurst(r, c, "#fde68a", 12); gained += 50;
      }
      gained += Math.round((cell.special ? 65 : 25) * mult);
      sumR += r; sumC += c;
      grid[r][c] = null;
    }

    for (const sp of spawns) {
      const nc = makeCandy(sp.r, sp.c, sp.color, sp.special);
      nc.sx = 1.38; nc.sy = 1.38;
      grid[sp.r][sp.c] = nc;
      spawnBurst(sp.r, sp.c, "#fff5a5", 16);
    }

    score += gained;
    if (score > bestScore) { bestScore = score; localStorage.setItem("candy_match1_best", String(bestScore)); }

    const rect = canvas.getBoundingClientRect();
    let ox = fxW * 0.5, oy = fxH * 0.5;
    if (cellsToClear.length > 0) {
      const avgR = sumR / cellsToClear.length, avgC = sumC / cellsToClear.length;
      ox = rect.left + (avgC + 0.5) * (rect.width / COLS);
      oy = rect.top + (avgR + 0.5) * (rect.height / ROWS);
      const label = comboCount >= 2 ? `${T().cheers[Math.min(T().cheers.length - 1, comboCount - 2)]} +${gained}` : `+${gained}`;
      spawnFloat(avgR, avgC, label, comboCount > 1 ? "#ffe66d" : "#ffffff");
    }

    // 尾牙級歡樂爆破節奏：一般消除輕盈噴灑，連鎖／特殊技直接引爆雙側彩炮與禮物噴泉！
    if (specialTriggered || spawns.length > 0) {
      sfxPartyBoom();
      triggerPartyExplosion(Math.min(2.6, 1.55 + comboCount * 0.35), ox, oy);
    } else if (comboCount >= 2) {
      sfxPop(comboCount - 1);
      triggerPartyExplosion(Math.min(2.2, 0.9 + comboCount * 0.35), ox, oy);
    } else {
      sfxPop(0);
      triggerPartyExplosion(0.45, ox, oy);
    }

    // 自然重力掉落
    for (let c = 0; c < COLS; c++) {
      let writeR = ROWS - 1;
      for (let r = ROWS - 1; r >= 0; r--) {
        if (grid[r][c]) {
          const item = grid[r][c];
          if (writeR !== r) { grid[writeR][c] = item; grid[r][c] = null; }
          writeR--;
        }
      }
      let dropIdx = 1;
      for (let r = writeR; r >= 0; r--) {
        const nc = makeCandy(r, c, randColor(), null);
        nc.y = -dropIdx * 1.08; dropIdx++; grid[r][c] = nc;
      }
    }

    updateHud();
    phase = "falling"; animT = 0;
  }

  function handleSpecialSwapCombo(r1, c1, r2, c2) {
    const a = grid[r1][c1], b = grid[r2][c2];
    if (!a || !b) return false;
    const isColorA = a.special === "color", isColorB = b.special === "color";
    if (isColorA && isColorB) {
      const all = [];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) all.push({ r, c });
      spawnBeam(r1, c1, 0, 0, "#ffe066", 14); spawnBeam(r1, c1, ROWS - 1, COLS - 1, "#ff7eb3", 14);
      boardShake = 14;
      applyClearAndGravity(all, [], true);
      return true;
    }
    if (isColorA || isColorB) {
      const bombPos = isColorA ? { r: r1, c: c1 } : { r: r2, c: c2 };
      const other = isColorA ? b : a;
      const targetColor = other.color, extraSpecial = other.special;
      const seeds = [{ r: r1, c: c1 }, { r: r2, c: c2 }];
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell && cell.color === targetColor) {
          if (extraSpecial === "stripeH" || extraSpecial === "stripeV") cell.special = (r + c) % 2 === 0 ? "stripeH" : "stripeV";
          else if (extraSpecial === "wrapped") cell.special = "wrapped";
          spawnBeam(bombPos.r, bombPos.c, r, c, CANDY_META[targetColor].light, 7);
          seeds.push({ r, c });
        }
      }
      grid[bombPos.r][bombPos.c].special = null;
      boardShake = 12;
      const res = collectClearSet(seeds);
      applyClearAndGravity(res.cells, [], true);
      return true;
    }
    if (a.special && b.special) {
      const seeds = [{ r: r1, c: c1 }, { r: r2, c: c2 }];
      const isWrapA = a.special === "wrapped", isWrapB = b.special === "wrapped";
      if (isWrapA && isWrapB) {
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++)
          if (r2 + dr >= 0 && r2 + dr < ROWS && c2 + dc >= 0 && c2 + dc < COLS) seeds.push({ r: r2 + dr, c: c2 + dc });
      } else if (isWrapA || isWrapB) {
        for (let d = -1; d <= 1; d++) {
          if (r2 + d >= 0 && r2 + d < ROWS) { spawnBeam(r2 + d, 0, r2 + d, COLS - 1, "#ffd166", cellPx * 0.42); for (let cc = 0; cc < COLS; cc++) seeds.push({ r: r2 + d, c: cc }); }
          if (c2 + d >= 0 && c2 + d < COLS) { spawnBeam(0, c2 + d, ROWS - 1, c2 + d, "#ffd166", cellPx * 0.42); for (let rr = 0; rr < ROWS; rr++) seeds.push({ r: rr, c: c2 + d }); }
        }
      } else {
        spawnBeam(r2, 0, r2, COLS - 1, "#ffffff", cellPx * 0.45);
        spawnBeam(0, c2, ROWS - 1, c2, "#ffffff", cellPx * 0.45);
        for (let cc = 0; cc < COLS; cc++) seeds.push({ r: r2, c: cc });
        for (let rr = 0; rr < ROWS; rr++) seeds.push({ r: rr, c: c2 });
      }
      boardShake = 12;
      const res = collectClearSet(seeds);
      applyClearAndGravity(res.cells, [], true);
      return true;
    }
    return false;
  }

  function resolveCurrentMatches(pivotA = null, pivotB = null) {
    const groups = findMatchGroups();
    if (groups.length === 0) return false;
    const seeds = [], spawns = [];
    for (const g of groups) {
      g.cells.forEach(p => seeds.push(p));
      if (g.spawnSpecial) {
        let pos = g.cells[Math.floor(g.cells.length / 2)];
        if (pivotB && g.cells.some(p => p.r === pivotB.r && p.c === pivotB.c)) pos = pivotB;
        else if (pivotA && g.cells.some(p => p.r === pivotA.r && p.c === pivotA.c)) pos = pivotA;
        spawns.push({ r: pos.r, c: pos.c, color: g.color, special: g.spawnSpecial });
      }
    }
    const res = collectClearSet(seeds);
    applyClearAndGravity(res.cells, spawns, res.specialTriggered);
    return true;
  }

  function trySwap(r1, c1, r2, c2) {
    if (phase !== "idle") return;
    if (r2 < 0 || r2 >= ROWS || c2 < 0 || c2 >= COLS) return;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    unlockAudio();
    selected = null; pressedCell = null; hintPair = null; idleTime = 0; comboCount = 0;
    sfxSwap();
    swapCtx = { r1, c1, r2, c2, dur: 0.135 };
    phase = "swapping"; animT = 0;
  }

  function showEndModal(won) {
    const t = T();
    phase = won ? "win" : "lose";
    if (won) {
      score += movesLeft * 60;
      if (score > bestScore) { bestScore = score; localStorage.setItem("candy_match1_best", String(bestScore)); }
      updateHud();
      sfxWin();
      triggerPartyExplosion(2.6, fxW * 0.5, fxH * 0.55);
      winShowerTimer = 0.7;
      const nStars = movesLeft >= 8 ? 3 : movesLeft >= 3 ? 2 : 1;
      modalStars.innerHTML = Array.from({ length: nStars }, () => `<img class="modal-star-ico" src="./assets/px-ui-star.webp?${PX_VER}" alt="">`).join("");
      modalTitle.textContent = t.winTitle(currentLevel);
      modalDesc.textContent = t.winDesc;
      btnNextLevel.classList.remove("hidden");
    } else {
      modalStars.innerHTML = `<img class="modal-star-ico" src="./assets/px-tw4.webp?${PX_VER}" alt="">`;
      modalTitle.textContent = t.loseTitle;
      modalDesc.textContent = t.loseDesc;
      btnNextLevel.classList.add("hidden");
    }
    modalStats.textContent = t.stats(score, bestScore);
    btnNextLevel.textContent = t.nextBtn;
    btnRetryLevel.textContent = t.retryBtn;
    resultModal.classList.remove("hidden");
  }

  // --- 單指滑動＋點兩顆交換 ---
  let dragStart = null;
  function getCellFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const c = Math.floor((e.clientX - rect.left) / (rect.width / COLS));
    const r = Math.floor((e.clientY - rect.top) / (rect.height / ROWS));
    if (r < 0 || r >= ROWS || c < 0 || c >= COLS) return null;
    return { r, c };
  }
  canvas.addEventListener("pointerdown", e => {
    unlockAudio();
    if (phase !== "idle") return;
    const hit = getCellFromPointer(e);
    if (!hit) return;
    pressedCell = { r: hit.r, c: hit.c };
    dragStart = { r: hit.r, c: hit.c, x: e.clientX, y: e.clientY, swiped: false };
    try { canvas.setPointerCapture(e.pointerId); } catch {}
  });
  canvas.addEventListener("pointermove", e => {
    if (!dragStart || dragStart.swiped || phase !== "idle") return;
    const dx = e.clientX - dragStart.x, dy = e.clientY - dragStart.y;
    const thresh = Math.max(14, cellPx * 0.27);
    if (Math.hypot(dx, dy) >= thresh) {
      dragStart.swiped = true; pressedCell = null;
      let nr = dragStart.r, nc = dragStart.c;
      if (Math.abs(dx) > Math.abs(dy)) nc += dx > 0 ? 1 : -1;
      else nr += dy > 0 ? 1 : -1;
      if (nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS) trySwap(dragStart.r, dragStart.c, nr, nc);
      dragStart = null;
    }
  });
  canvas.addEventListener("pointerup", () => {
    pressedCell = null;
    if (!dragStart) return;
    const start = dragStart; dragStart = null;
    if (start.swiped || phase !== "idle") return;
    if (!selected) { selected = { r: start.r, c: start.c }; playSfx(470, 0.05, "sine", 0.07); }
    else if (selected.r === start.r && selected.c === start.c) selected = null;
    else if (Math.abs(selected.r - start.r) + Math.abs(selected.c - start.c) === 1) trySwap(selected.r, selected.c, start.r, start.c);
    else { selected = { r: start.r, c: start.c }; playSfx(470, 0.05, "sine", 0.07); }
  });
  canvas.addEventListener("pointercancel", () => { dragStart = null; pressedCell = null; });

  btnHint.addEventListener("click", () => {
    unlockAudio();
    if (phase !== "idle") return;
    const moves = findValidMoves();
    if (moves.length > 0) { hintPair = moves[0]; playSfx(740, 0.09, "triangle", 0.09, 940); }
  });
  btnBgm.addEventListener("click", () => {
    bgmOn = !bgmOn; localStorage.setItem("candy_bgm_on", bgmOn ? "1" : "0");
    if (bgmOn) { unlockAudio(); startBgm(); }
    else { stopBgm(); if (masterBgmGain && ac) masterBgmGain.gain.setValueAtTime(0, ac.currentTime); }
    updateHud();
  });
  btnSound.addEventListener("click", () => {
    sfxOn = !sfxOn; localStorage.setItem("candy_sfx_on", sfxOn ? "1" : "0");
    if (masterSfxGain && ac) masterSfxGain.gain.setValueAtTime(sfxOn ? 0.85 : 0, ac.currentTime);
    updateHud();
    if (sfxOn) playSfx(660, 0.08, "sine", 0.09);
  });
  btnRestart.addEventListener("click", () => { unlockAudio(); startLevel(currentLevel); });
  btnNextLevel.addEventListener("click", () => startLevel(currentLevel + 1));
  btnRetryLevel.addEventListener("click", () => startLevel(currentLevel));
  if (btnFs) {
    btnFs.addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });
    document.addEventListener("fullscreenchange", () => { updateHud(); setTimeout(() => resizeBoard(false), 60); });
  }
  window.addEventListener("arcade-lang-change", () => updateHud());

  function drawCandyCell(cell, r, c, now) {
    const cx = (cell.x + 0.5) * cellPx, cy = (cell.y + 0.5) * cellPx;
    const isPressed = pressedCell && pressedCell.r === r && pressedCell.c === c && phase === "idle";
    const isSel = selected && selected.r === r && selected.c === c && phase === "idle";
    const idleBob = phase === "idle" ? Math.sin(now * 0.0032 + cell.bobSeed) * 1.1 : 0;
    const pressScale = isPressed ? 0.89 : isSel ? 1.08 : 1.0;
    const sz = cellPx * 0.92;

    ctx.save();
    ctx.translate(cx, cy + idleBob);
    ctx.scale(cell.sx * pressScale, cell.sy * pressScale);
    ctx.globalAlpha = cell.alpha;

    if (cell.special === "wrapped") {
      const p = 1 + Math.sin(now * 0.01) * 0.06;
      ctx.save(); ctx.scale(p, p);
      ctx.fillStyle = "rgba(255, 224, 130, 0.58)"; ctx.strokeStyle = "#f59e0b"; ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(-sz * 0.36, 0); ctx.lineTo(-sz * 0.54, -sz * 0.24); ctx.lineTo(-sz * 0.54, sz * 0.24); ctx.closePath();
      ctx.moveTo(sz * 0.36, 0); ctx.lineTo(sz * 0.54, -sz * 0.24); ctx.lineTo(sz * 0.54, sz * 0.24); ctx.closePath();
      ctx.fill(); ctx.stroke();
      ctx.beginPath(); ctx.roundRect(-sz * 0.44, -sz * 0.44, sz * 0.88, sz * 0.88, 10);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }
    if (cell.special === "stripeH" || cell.special === "stripeV") {
      ctx.save();
      ctx.strokeStyle = CANDY_META[cell.color].main;
      ctx.fillStyle = "rgba(255, 255, 255, 0.58)"; ctx.lineWidth = 2.4;
      ctx.beginPath(); ctx.roundRect(-sz * 0.46, -sz * 0.46, sz * 0.92, sz * 0.92, 11);
      ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    if (cell.special === "color") {
      const pulse = 1 + Math.sin(now * 0.008) * 0.055;
      const rg = ctx.createRadialGradient(0, 0, sz * 0.14, 0, 0, sz * 0.56);
      rg.addColorStop(0, "rgba(255,245,170,0.65)");
      rg.addColorStop(0.65, "rgba(255,140,210,0.35)");
      rg.addColorStop(1, "rgba(120,210,255,0)");
      ctx.fillStyle = rg;
      ctx.beginPath(); ctx.arc(0, 0, sz * 0.56 * pulse, 0, Math.PI * 2); ctx.fill();
      if (bombImg.complete && bombImg.naturalWidth > 0) {
        ctx.drawImage(bombImg, -sz * 0.52 * pulse, -sz * 0.52 * pulse, sz * 1.04 * pulse, sz * 1.04 * pulse);
      }
    } else {
      const im = candyImgs[cell.color];
      if (im && im.complete && im.naturalWidth > 0) {
        ctx.drawImage(im, -sz * 0.5, -sz * 0.5, sz, sz);
      } else {
        ctx.fillStyle = CANDY_META[cell.color].main;
        ctx.beginPath(); ctx.arc(0, 0, sz * 0.4, 0, Math.PI * 2); ctx.fill();
      }
      if (cell.special === "stripeH" || cell.special === "stripeV") {
        const a = 0.72 + Math.sin(now * 0.012) * 0.25;
        ctx.fillStyle = `rgba(255, 255, 255, ${a})`;
        ctx.strokeStyle = CANDY_META[cell.color].main; ctx.lineWidth = 1.6;
        const d = sz * 0.42, s = sz * 0.11;
        if (cell.special === "stripeH") {
          ctx.beginPath(); ctx.moveTo(-d - s, 0); ctx.lineTo(-d + s * 0.7, -s); ctx.lineTo(-d + s * 0.7, s); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(d + s, 0); ctx.lineTo(d - s * 0.7, -s); ctx.lineTo(d - s * 0.7, s); ctx.closePath(); ctx.fill(); ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(0, -d - s); ctx.lineTo(-s, -d + s * 0.7); ctx.lineTo(s, -d + s * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
          ctx.beginPath(); ctx.moveTo(0, d + s); ctx.lineTo(-s, d - s * 0.7); ctx.lineTo(s, d - s * 0.7); ctx.closePath(); ctx.fill(); ctx.stroke();
        }
      }
    }
    ctx.restore();
  }

  let lastT = performance.now();
  function tick(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    // 更新與繪製雙層尾牙級禮物雨與前景爆破
    updateAndDrawFx(dt, now);

    if (boardShake > 0) boardShake = Math.max(0, boardShake - dt * 36);
    if (tipResetTimer > 0 && tipResetTimer < 900) {
      tipResetTimer -= dt;
      if (tipResetTimer <= 0 && tipDismissed) { tipBanner.classList.add("collapsed"); resizeBoard(false); }
    }

    if (phase === "swapping" && swapCtx) {
      animT += dt;
      const t = Math.min(1, animT / swapCtx.dur), ease = 1 - Math.pow(1 - t, 2.2);
      const { r1, c1, r2, c2 } = swapCtx;
      const a = grid[r1][c1], b = grid[r2][c2];
      if (a && b) {
        a.x = c1 + (c2 - c1) * ease; a.y = r1 + (r2 - r1) * ease;
        b.x = c2 + (c1 - c2) * ease; b.y = r2 + (r1 - r2) * ease;
      }
      if (t >= 1) {
        grid[r1][c1] = b; grid[r2][c2] = a;
        if (a) { a.x = c2; a.y = r2; } if (b) { b.x = c1; b.y = r1; }
        if (handleSpecialSwapCombo(r1, c1, r2, c2)) { movesLeft = Math.max(0, movesLeft - 1); updateHud(); }
        else if (resolveCurrentMatches({ r: r1, c: c1 }, { r: r2, c: c2 })) { movesLeft = Math.max(0, movesLeft - 1); updateHud(); }
        else { sfxInvalid(); phase = "reverting"; animT = 0; }
      }
    } else if (phase === "reverting" && swapCtx) {
      animT += dt;
      const t = Math.min(1, animT / swapCtx.dur);
      const { r1, c1, r2, c2 } = swapCtx;
      const a = grid[r2][c2], b = grid[r1][c1];
      if (a && b) { a.x = c2 + (c1 - c2) * t; a.y = r2 + (r1 - r2) * t; b.x = c1 + (c2 - c1) * t; b.y = r1 + (r2 - r1) * t; }
      if (t >= 1) {
        grid[r1][c1] = a; grid[r2][c2] = b;
        if (a) { a.x = c1; a.y = r1; } if (b) { b.x = c2; b.y = r2; }
        swapCtx = null; phase = "idle";
      }
    } else if (phase === "falling") {
      let moving = false;
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (!cell) continue;
        cell.x = c;
        if (cell.y < r) {
          cell.y = Math.min(r, cell.y + 13.8 * dt);
          if (cell.y < r) moving = true;
          else { cell.sx = 1.15; cell.sy = 0.86; }
        }
        cell.sx += (1 - cell.sx) * Math.min(1, dt * 14);
        cell.sy += (1 - cell.sy) * Math.min(1, dt * 14);
      }
      if (!moving) {
        if (!resolveCurrentMatches()) {
          if (isGoalComplete()) showEndModal(true);
          else if (movesLeft <= 0) showEndModal(false);
          else if (findValidMoves().length === 0) { phase = "shuffling"; animT = 0; setTip(T().tipShuffle, true, 1.8); sfxSwap(); }
          else { phase = "idle"; idleTime = 0; }
        }
      }
    } else if (phase === "shuffling") {
      animT += dt;
      if (animT >= 0.42) { shuffleBoardImmediate(); phase = "idle"; idleTime = 0; }
    } else if (phase === "idle") {
      idleTime += dt;
      if (idleTime >= 4.5 && !hintPair) { const moves = findValidMoves(); if (moves.length > 0) hintPair = moves[0]; }
      for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
        const cell = grid[r][c];
        if (cell) { cell.sx += (1 - cell.sx) * Math.min(1, dt * 12); cell.sy += (1 - cell.sy) * Math.min(1, dt * 12); }
      }
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 260 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = beams.length - 1; i >= 0; i--) { beams[i].life -= dt; if (beams[i].life <= 0) beams.splice(i, 1); }
    for (let i = floatTexts.length - 1; i >= 0; i--) { const f = floatTexts[i]; f.life -= dt; f.y -= 36 * dt; if (f.life <= 0) floatTexts.splice(i, 1); }

    // === 繪製棋盤 ===
    ctx.save();
    ctx.clearRect(0, 0, boardW, boardH);
    if (boardShake > 0) ctx.translate((Math.random() - 0.5) * boardShake, (Math.random() - 0.5) * boardShake);

    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) {
      const x = c * cellPx, y = r * cellPx;
      ctx.fillStyle = (r + c) % 2 === 0 ? "rgba(255, 245, 248, 0.90)" : "rgba(248, 229, 237, 0.88)";
      ctx.fillRect(x, y, cellPx, cellPx);
      if (frostGrid[r][c] > 0) {
        ctx.fillStyle = "rgba(253, 214, 130, 0.70)";
        ctx.beginPath(); ctx.roundRect(x + 2, y + 2, cellPx - 4, cellPx - 4, 8); ctx.fill();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.92)"; ctx.lineWidth = 2; ctx.stroke();
      }
    }

    if (selected && phase === "idle") {
      ctx.strokeStyle = "#e53e66"; ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(255, 192, 214, 0.38)";
      ctx.beginPath(); ctx.roundRect(selected.c * cellPx + 2, selected.r * cellPx + 2, cellPx - 4, cellPx - 4, 9);
      ctx.fill(); ctx.stroke();
    }
    if (hintPair && phase === "idle") {
      const pulse = 0.45 + Math.sin(now * 0.009) * 0.35;
      ctx.strokeStyle = `rgba(245, 158, 11, ${pulse + 0.25})`; ctx.lineWidth = 3;
      for (const p of hintPair) { ctx.beginPath(); ctx.roundRect(p.c * cellPx + 3, p.r * cellPx + 3, cellPx - 6, cellPx - 6, 9); ctx.stroke(); }
    }

    for (let r = 0; r < ROWS; r++) for (let c = 0; c < COLS; c++) if (grid[r][c]) drawCandyCell(grid[r][c], r, c, now);

    for (const b of beams) {
      const a = Math.max(0, b.life / b.maxLife);
      ctx.save(); ctx.globalAlpha = a;
      ctx.strokeStyle = b.color; ctx.lineWidth = b.width * a; ctx.lineCap = "round";
      ctx.beginPath(); ctx.moveTo(b.x1, b.y1); ctx.lineTo(b.x2, b.y2); ctx.stroke();
      ctx.strokeStyle = "#ffffff"; ctx.lineWidth = b.width * a * 0.42; ctx.stroke();
      ctx.restore();
    }
    for (const p of particles) {
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      if (p.star) {
        ctx.translate(p.x, p.y); ctx.beginPath();
        for (let k = 0; k < 8; k++) {
          const ang = (Math.PI * k) / 4, rad = k % 2 === 0 ? p.r * 1.4 : p.r * 0.55;
          if (k === 0) ctx.moveTo(Math.cos(ang) * rad, Math.sin(ang) * rad); else ctx.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad);
        }
        ctx.closePath(); ctx.fill();
      } else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
      ctx.restore();
    }

    ctx.textAlign = "center"; ctx.textBaseline = "middle";
    for (const f of floatTexts) {
      ctx.save(); ctx.globalAlpha = Math.min(1, f.life / 0.35);
      ctx.font = "900 16px sans-serif";
      ctx.strokeStyle = "#5b1a3a"; ctx.lineWidth = 3.5;
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(tick);
  }

  window.__CANDY_QA__ = {
    version: VERSION_STAMP,
    getState() {
      let bgmRms = 0;
      if (bgmAnalyser && bgmPcm && ac && ac.state === "running") {
        bgmAnalyser.getFloatTimeDomainData(bgmPcm);
        let s = 0; for (let i = 0; i < bgmPcm.length; i++) s += bgmPcm[i] * bgmPcm[i];
        bgmRms = Math.sqrt(s / bgmPcm.length);
      }
      return {
        version: VERSION_STAMP,
        level: currentLevel, cols: COLS, rows: ROWS, boardW, boardH, cellPx,
        movesLeft, score, phase, bgmOn, sfxOn, bgmRunning, bgmStep, bgmLoopCount, bgmRms,
        backDrops: backDrops.length, frontBursts: frontBursts.length,
        spritesLoaded: candyImgs.every(i => i.complete && i.naturalWidth > 0) && bombImg.complete && bombImg.naturalWidth > 0,
        validMoves: findValidMoves()
      };
    },
    swap(r1, c1, r2, c2) { trySwap(r1, c1, r2, c2); },
    triggerBurst(intensity = 2.0) { triggerPartyExplosion(intensity); },
    spawnDemoSpecials() {
      if (ROWS >= 5 && COLS >= 5) {
        grid[2][2].special = "stripeH";
        grid[2][3].special = "wrapped";
        grid[3][3].special = "color";
      }
    }
  };

  startLevel(1);
  requestAnimationFrame(tick);
})();
