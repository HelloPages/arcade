(() => {
  "use strict";

  const VERSION_STAMP = "v_23:45";
  const canvas = document.getElementById("candyCanvas");
  const ctx = canvas.getContext("2d");
  const boardStage = document.getElementById("boardStage");
  const boardFrame = document.getElementById("boardFrame");

  const levelLabel = document.getElementById("levelLabel");
  const movesPill = document.getElementById("movesPill");
  const movesLbl = document.getElementById("movesLbl");
  const movesVal = document.getElementById("movesVal");
  const scoreLbl = document.getElementById("scoreLbl");
  const scoreVal = document.getElementById("scoreVal");
  const goalStrip = document.getElementById("goalStrip");
  const tipBanner = document.getElementById("tipBanner");
  const btnHint = document.getElementById("btnHint");
  const btnSound = document.getElementById("btnSound");
  const btnRestart = document.getElementById("btnRestart");
  const btnFs = document.getElementById("btnFs");

  const resultModal = document.getElementById("resultModal");
  const modalStars = document.getElementById("modalStars");
  const modalTitle = document.getElementById("modalTitle");
  const modalDesc = document.getElementById("modalDesc");
  const modalStats = document.getElementById("modalStats");
  const btnNextLevel = document.getElementById("btnNextLevel");
  const btnRetryLevel = document.getElementById("btnRetryLevel");

  // --- 多語系 (TW / EN / KO) ---
  const COPY = {
    tw: {
      level: n => `第 ${n} 關`,
      moves: "步數",
      score: "分數",
      hint: "💡 提示",
      soundOn: "🔊 音效開",
      soundOff: "🔇 靜音",
      restart: "↻ 重玩",
      fsEnter: "⛶ 全螢幕",
      fsExit: "✕ 退出",
      tipStart: "單指滑動或點兩顆相鄰糖果，連成 3 顆以上就能消除！",
      tipInvalid: "這兩顆換了還消不掉喔，試試別的位置！",
      tipShuffle: "沒有可走的步了，自動洗牌中！",
      tipSpecialStripe: "✨ 合成條紋糖！交換就能整排掃光！",
      tipSpecialWrap: "💥 合成包裝炸彈糖！周圍 3×3 雙重爆破！",
      tipSpecialBomb: "🌈 合成彩虹彩球！跟任何糖果交換全色清除！",
      cheers: ["Sweet!", "Tasty!", "Delicious!", "Divine!", "Super Sweet!"],
      goalScore: v => `分數 ${v}`,
      goalFrost: v => `糖霜 ${v}`,
      winTitle: n => `第 ${n} 關過關！`,
      winDesc: "手氣超順！剩餘步數已換算額外加分！",
      loseTitle: "步數用完囉！",
      loseDesc: "差一點點就過關了，再試一次一定行！",
      nextBtn: "下一關 ↗",
      retryBtn: "再玩一次",
      stats: (sc, best) => `本關得分：${sc.toLocaleString()} ｜ 最高分：${best.toLocaleString()}`,
      candyNames: ["草莓", "檸檬", "藍莓", "薄荷", "葡萄", "橘子"]
    },
    en: {
      level: n => `Lv.${n}`,
      moves: "Moves",
      score: "Score",
      hint: "💡 Hint",
      soundOn: "🔊 Sound",
      soundOff: "🔇 Muted",
      restart: "↻ Retry",
      fsEnter: "⛶ Full",
      fsExit: "✕ Exit",
      tipStart: "Swipe or tap two adjacent candies to match 3 or more!",
      tipInvalid: "No match there — try another swap!",
      tipShuffle: "No moves left — auto shuffling!",
      tipSpecialStripe: "✨ Striped Candy! Clears a full row or column!",
      tipSpecialWrap: "💥 Wrapped Candy! Blasts a 3×3 area!",
      tipSpecialBomb: "🌈 Color Bomb! Swap with any candy to zap that color!",
      cheers: ["Sweet!", "Tasty!", "Delicious!", "Divine!", "Sugar Crush!"],
      goalScore: v => `Score ${v}`,
      goalFrost: v => `Frost ${v}`,
      winTitle: n => `Level ${n} Clear!`,
      winDesc: "Awesome! Leftover moves turned into bonus points!",
      loseTitle: "Out of Moves!",
      loseDesc: "So close! Give it another try!",
      nextBtn: "Next Level ↗",
      retryBtn: "Play Again",
      stats: (sc, best) => `Score: ${sc.toLocaleString()} | Best: ${best.toLocaleString()}`,
      candyNames: ["Berry", "Lemon", "Blue", "Mint", "Grape", "Orange"]
    },
    ko: {
      level: n => `${n}단계`,
      moves: "횟수",
      score: "점수",
      hint: "💡 힌트",
      soundOn: "🔊 소리 켜짐",
      soundOff: "🔇 음소거",
      restart: "↻ 다시",
      fsEnter: "⛶ 전체",
      fsExit: "✕ 닫기",
      tipStart: "한 손가락으로 밀거나 인접한 두 캔디를 눌러 3개 이상 맞추세요!",
      tipInvalid: "맞춰지지 않아요! 다른 캔디를 바꿔 보세요!",
      tipShuffle: "움직일 수 있는 수가 없어 자동 섞기 중!",
      tipSpecialStripe: "✨ 줄무늬 캔디 완성! 한 줄 전체 제거!",
      tipSpecialWrap: "💥 포장 폭탄 캔디! 주변 3×3 폭발!",
      tipSpecialBomb: "🌈 무지개 볼 완성! 원하는 색 전체 제거!",
      cheers: ["Sweet!", "Tasty!", "Delicious!", "Divine!", "Super Combo!"],
      goalScore: v => `점수 ${v}`,
      goalFrost: v => `프로스팅 ${v}`,
      winTitle: n => `${n}단계 클리어!`,
      winDesc: "멋져요! 남은 이동 횟수가 보너스 점수로 전환되었어요!",
      loseTitle: "이동 횟수 종료!",
      loseDesc: "아쉬워요! 다시 도전해 보세요!",
      nextBtn: "다음 단계 ↗",
      retryBtn: "다시 하기",
      stats: (sc, best) => `점수: ${sc.toLocaleString()} | 최고: ${best.toLocaleString()}`,
      candyNames: ["딸기", "레몬", "블루", "민트", "포도", "오렌지"]
    }
  };
  function getLang() {
    return (window.ArcadeI18n && window.ArcadeI18n.getLang()) || "tw";
  }
  function T() {
    return COPY[getLang()] || COPY.tw;
  }

  // --- 內嵌大廳模式隱藏重複全螢幕鍵 ---
  const isLobbyEmbed = (() => {
    try {
      const sp = new URLSearchParams(location.search);
      if (sp.get("embed") !== "1") return false;
      return window.self !== window.top;
    } catch { return false; }
  })();
  if (isLobbyEmbed && btnFs) btnFs.classList.add("hidden");

  // --- 6 種高辨識度造型糖果配色 ---
  const CANDY_STYLES = [
    { id: 0, name: "heart",   main: "#ff3b6b", light: "#ff9bb5", dark: "#b5123d", rim: "#7c0b2a" }, // 紅草莓愛心
    { id: 1, name: "star",    main: "#ffc414", light: "#fff199", dark: "#d97706", rim: "#854d0e" }, // 黃檸檬星星
    { id: 2, name: "diamond", main: "#2596ff", light: "#a8e0ff", dark: "#1d4ed8", rim: "#1e3a8a" }, // 藍莓菱鑽
    { id: 3, name: "drop",    main: "#16c978", light: "#a7f3d0", dark: "#047857", rim: "#064e3b" }, // 薄荷水滴
    { id: 4, name: "grape",   main: "#9f4dff", light: "#dfc4ff", dark: "#6d28d9", rim: "#4c1d95" }, // 紫葡萄軟糖
    { id: 5, name: "swirl",   main: "#ff7b1c", light: "#ffd099", dark: "#c2410c", rim: "#7c2d12" }  // 橘子旋渦糖
  ];

  // --- 關卡設計（前 3 關超容易上手、有成就感，後續豐富變化） ---
  const LEVELS = [
    { size: 7, colors: 5, moves: 20, targetScore: 650, collect: [{ color: 0, count: 10 }], frost: [] },
    { size: 7, colors: 5, moves: 22, targetScore: 950, collect: [{ color: 1, count: 12 }, { color: 2, count: 12 }], frost: [] },
    { size: 7, colors: 5, moves: 22, targetScore: 1100, collect: [], frost: [[2,2],[2,3],[2,4],[3,2],[3,3],[3,4],[4,2],[4,3],[4,4]] },
    { size: 8, colors: 5, moves: 24, targetScore: 1500, collect: [{ color: 3, count: 16 }, { color: 4, count: 16 }], frost: [] },
    { size: 8, colors: 6, moves: 25, targetScore: 1800, collect: [], frost: [[1,1],[1,6],[2,2],[2,5],[3,3],[3,4],[4,3],[4,4],[5,2],[5,5],[6,1],[6,6]] },
    { size: 8, colors: 6, moves: 25, targetScore: 2200, collect: [{ color: 0, count: 18 }, { color: 5, count: 18 }], frost: [[3,3],[3,4],[4,3],[4,4]] },
    { size: 8, colors: 6, moves: 26, targetScore: 2600, collect: [{ color: 2, count: 20 }], frost: [[2,1],[2,2],[2,5],[2,6],[5,1],[5,2],[5,5],[5,6],[3,3],[3,4],[4,3],[4,4]] },
    { size: 8, colors: 6, moves: 28, targetScore: 3200, collect: [{ color: 1, count: 22 }, { color: 3, count: 22 }], frost: [[1,3],[1,4],[3,1],[4,1],[3,6],[4,6],[6,3],[6,4]] }
  ];
  function getLevelConfig(lv) {
    if (lv <= LEVELS.length) return LEVELS[lv - 1];
    const base = LEVELS[(lv - 1) % LEVELS.length];
    return {
      size: 8,
      colors: 6,
      moves: Math.max(22, 27 - Math.floor((lv - 8) * 0.5)),
      targetScore: 2800 + (lv - 8) * 500,
      collect: [{ color: lv % 6, count: 20 + (lv - 8) * 2 }, { color: (lv + 2) % 6, count: 18 + (lv - 8) * 2 }],
      frost: base.frost
    };
  }

  // --- Web Audio 柔和可愛糖果合成音效 ---
  let ac = null;
  let soundOn = true;
  function getAC() {
    if (!soundOn) return null;
    if (!ac) {
      const C = window.AudioContext || window.webkitAudioContext;
      if (C) ac = new C();
    }
    if (ac && ac.state === "suspended") ac.resume().catch(() => {});
    return ac;
  }
  function playTone(freq, dur = 0.11, type = "sine", vol = 0.11, slideTo = null) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, now);
    if (slideTo) o.frequency.exponentialRampToValueAtTime(slideTo, now + dur);
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    o.connect(g).connect(a.destination);
    o.start(now);
    o.stop(now + dur + 0.015);
  }
  const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5, 1174.66, 1318.5];
  function sfxSwap() { playTone(380, 0.075, "triangle", 0.09, 540); }
  function sfxInvalid() { playTone(260, 0.12, "sine", 0.10, 175); }
  function sfxPop(comboIdx) {
    const f = SCALE[Math.min(SCALE.length - 1, Math.max(0, comboIdx))];
    playTone(f, 0.13, "sine", 0.13, f * 1.18);
    playTone(f * 1.5, 0.09, "triangle", 0.06);
  }
  function sfxSpecial() {
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.14, "triangle", 0.11), i * 42);
    });
  }
  function sfxWin() {
    [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) => {
      setTimeout(() => playTone(f, 0.22, "triangle", 0.13), i * 80);
    });
  }

  // --- 超取樣離屏高解析糖果精靈快取（每個造型鮮明可愛、零鋸齒） ---
  const SPRITE_SZ = 128;
  const candySprites = [];
  let colorBombSprite = null;

  function buildCandySprites() {
    candySprites.length = 0;
    for (const st of CANDY_STYLES) {
      const c = document.createElement("canvas");
      c.width = SPRITE_SZ;
      c.height = SPRITE_SZ;
      const g = c.getContext("2d");
      const cx = SPRITE_SZ * 0.5, cy = SPRITE_SZ * 0.5, r = SPRITE_SZ * 0.39;

      g.save();
      g.translate(cx, cy);
      // 柔和底影
      g.fillStyle = "rgba(74, 35, 64, 0.16)";
      g.beginPath();
      g.ellipse(0, r * 0.92, r * 0.72, r * 0.20, 0, 0, Math.PI * 2);
      g.fill();

      const grad = g.createRadialGradient(-r * 0.32, -r * 0.36, r * 0.1, 0, 0, r * 1.15);
      grad.addColorStop(0, st.light);
      grad.addColorStop(0.55, st.main);
      grad.addColorStop(1, st.dark);

      g.fillStyle = grad;
      g.strokeStyle = st.rim;
      g.lineWidth = 4.5;
      g.lineJoin = "round";

      if (st.name === "heart") {
        // 紅草莓愛心
        g.beginPath();
        g.moveTo(0, r * 0.88);
        g.bezierCurveTo(-r * 1.15, r * 0.22, -r * 1.05, -r * 0.88, 0, -r * 0.36);
        g.bezierCurveTo(r * 1.05, -r * 0.88, r * 1.15, r * 0.22, 0, r * 0.88);
        g.closePath();
        g.fill();
        g.stroke();
        // 可愛小草莓籽與小綠葉
        g.fillStyle = "#ffe6ec";
        [[-16, -2], [14, -4], [0, 18], [-10, 26], [12, 24]].forEach(([sx, sy]) => {
          g.beginPath(); g.ellipse(sx, sy, 3.2, 4.8, 0.2, 0, Math.PI * 2); g.fill();
        });
        g.fillStyle = "#34d399";
        g.beginPath(); g.ellipse(-10, -r * 0.62, 11, 5.5, -0.35, 0, Math.PI * 2); g.fill();
        g.beginPath(); g.ellipse(10, -r * 0.62, 11, 5.5, 0.35, 0, Math.PI * 2); g.fill();
      } else if (st.name === "star") {
        // 黃檸檬五角胖星星
        g.beginPath();
        const spikes = 5, outer = r * 1.04, inner = r * 0.56;
        for (let i = 0; i < spikes * 2; i++) {
          const ang = -Math.PI / 2 + (Math.PI * i) / spikes;
          const rad = i % 2 === 0 ? outer : inner;
          const x = Math.cos(ang) * rad, y = Math.sin(ang) * rad;
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
        g.fill();
        g.stroke();
      } else if (st.name === "diamond") {
        // 藍莓圓角水晶菱鑽
        g.beginPath();
        g.moveTo(0, -r * 1.02);
        g.quadraticCurveTo(r * 0.98, -r * 0.12, r * 0.94, 0);
        g.quadraticCurveTo(r * 0.98, r * 0.12, 0, r * 1.02);
        g.quadraticCurveTo(-r * 0.98, r * 0.12, -r * 0.94, 0);
        g.quadraticCurveTo(-r * 0.98, -r * 0.12, 0, -r * 1.02);
        g.closePath();
        g.fill();
        g.stroke();
        // 內菱形切面亮光
        g.strokeStyle = "rgba(255,255,255,0.52)";
        g.lineWidth = 3;
        g.beginPath();
        g.moveTo(0, -r * 0.56); g.lineTo(r * 0.52, 0); g.lineTo(0, r * 0.56); g.lineTo(-r * 0.52, 0); g.closePath();
        g.stroke();
      } else if (st.name === "drop") {
        // 薄荷圓潤水滴糖
        g.beginPath();
        g.moveTo(0, -r * 1.02);
        g.bezierCurveTo(r * 0.92, -r * 0.15, r * 1.02, r * 0.96, 0, r * 0.96);
        g.bezierCurveTo(-r * 1.02, r * 0.96, -r * 0.92, -r * 0.15, 0, -r * 1.02);
        g.closePath();
        g.fill();
        g.stroke();
      } else if (st.name === "grape") {
        // 紫葡萄軟糖六角枕頭
        g.beginPath();
        for (let i = 0; i < 6; i++) {
          const a = -Math.PI / 6 + (Math.PI * 2 * i) / 6;
          const x = Math.cos(a) * r * 0.95, y = Math.sin(a) * r * 0.95;
          if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
        g.fill();
        g.stroke();
        // 內層果凍亮框
        g.strokeStyle = "rgba(255,255,255,0.35)";
        g.lineWidth = 3.5;
        g.beginPath();
        g.arc(0, 0, r * 0.54, 0, Math.PI * 2);
        g.stroke();
      } else {
        // 橘子旋渦棒棒糖果
        g.beginPath();
        g.arc(0, 0, r * 0.94, 0, Math.PI * 2);
        g.fill();
        g.stroke();
        g.strokeStyle = "rgba(255, 250, 235, 0.85)";
        g.lineWidth = 6.5;
        g.lineCap = "round";
        g.beginPath();
        for (let t = 0; t < Math.PI * 3.1; t += 0.18) {
          const sr = t * 3.6;
          const sx = Math.cos(t) * sr, sy = Math.sin(t) * sr;
          if (t === 0) g.moveTo(sx, sy); else g.lineTo(sx, sy);
        }
        g.stroke();
      }

      // 統一果凍高光點（Q 彈晶透感）
      g.fillStyle = "rgba(255, 255, 255, 0.72)";
      g.beginPath();
      g.ellipse(-r * 0.28, -r * 0.34, r * 0.25, r * 0.13, -0.55, 0, Math.PI * 2);
      g.fill();
      g.fillStyle = "rgba(255, 255, 255, 0.45)";
      g.beginPath();
      g.arc(-r * 0.44, -r * 0.14, r * 0.08, 0, Math.PI * 2);
      g.fill();
      g.restore();

      candySprites.push(c);
    }

    // 彩虹彩球精靈（五連線超級糖果）
    const bc = document.createElement("canvas");
    bc.width = SPRITE_SZ; bc.height = SPRITE_SZ;
    const bg = bc.getContext("2d");
    bg.save();
    bg.translate(SPRITE_SZ * 0.5, SPRITE_SZ * 0.5);
    const rr = SPRITE_SZ * 0.40;
    const g2 = bg.createRadialGradient(-14, -16, 4, 0, 0, rr);
    g2.addColorStop(0, "#8d5524");
    g2.addColorStop(0.55, "#4a2511");
    g2.addColorStop(1, "#261006");
    bg.fillStyle = g2;
    bg.strokeStyle = "#fff5d6";
    bg.lineWidth = 4;
    bg.beginPath();
    bg.arc(0, 0, rr, 0, Math.PI * 2);
    bg.fill();
    bg.stroke();
    const sprCols = ["#ff3b6b", "#ffc414", "#2596ff", "#16c978", "#c084fc", "#ff7b1c", "#ffffff"];
    for (let i = 0; i < 14; i++) {
      const ang = (Math.PI * 2 * i) / 14 + (i % 2) * 0.22;
      const dist = (i % 3 === 0 ? 0.28 : 0.62) * rr;
      bg.fillStyle = sprCols[i % sprCols.length];
      bg.beginPath();
      bg.arc(Math.cos(ang) * dist, Math.sin(ang) * dist, 6.2, 0, Math.PI * 2);
      bg.fill();
    }
    bg.fillStyle = "rgba(255,255,255,0.65)";
    bg.beginPath();
    bg.ellipse(-15, -18, 12, 6, -0.5, 0, Math.PI * 2);
    bg.fill();
    bg.restore();
    colorBombSprite = bc;
  }
  buildCandySprites();

  // --- 遊戲核心狀態 ---
  let currentLevel = 1;
  let bestScore = Number(localStorage.getItem("candy_match1_best") || "0") || 0;
  let cfg = getLevelConfig(1);
  let N = cfg.size;
  let grid = [];        // N x N of { color, special: null|'stripeH'|'stripeV'|'wrapped'|'color', x, y, scale, alpha }
  let frostGrid = [];   // N x N of 0 | 1 (糖霜格)
  let movesLeft = cfg.moves;
  let score = 0;
  let collected = {};   // color -> count
  let frostLeft = 0;

  // 狀態機："idle" | "swapping" | "reverting" | "resolving" | "falling" | "shuffling" | "win" | "lose"
  let phase = "idle";
  let animT = 0;
  let swapCtx = null;   // { r1, c1, r2, c2, dur }
  let selected = null;  // { r, c }
  let hintPair = null;  // [{r,c},{r,c}]
  let idleTime = 0;
  let comboCount = 0;
  let tipResetTimer = 0;

  const particles = [];
  const beams = [];     // { x1, y1, x2, y2, color, life, maxLife, width }
  const floatTexts = [];
  let boardShake = 0;

  let boardPx = 320;
  let cellPx = 40;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function setTip(text, isCombo = false, holdSec = 2.4) {
    tipBanner.textContent = text;
    tipBanner.classList.toggle("combo", isCombo);
    tipResetTimer = holdSec;
  }

  function resizeBoard() {
    const availW = boardStage.clientWidth || window.innerWidth - 16;
    const availH = boardStage.clientHeight || 340;
    const raw = Math.floor(Math.min(availW - 14, availH - 12, 480));
    boardPx = Math.max(210, raw);
    cellPx = boardPx / N;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.style.width = `${boardPx}px`;
    canvas.style.height = `${boardPx}px`;
    canvas.width = Math.round(boardPx * dpr);
    canvas.height = Math.round(boardPx * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    // 同步靜止糖果座標
    if (phase === "idle") {
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (grid[r] && grid[r][c]) {
            grid[r][c].x = c;
            grid[r][c].y = r;
          }
        }
      }
    }
  }
  window.addEventListener("resize", resizeBoard);
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(resizeBoard).observe(boardStage);
  }

  function randColor() {
    return Math.floor(Math.random() * cfg.colors);
  }
  function makeCandy(r, c, color = randColor(), special = null) {
    return { color, special, x: c, y: r, scale: 1, alpha: 1 };
  }

  function createInitialBoard() {
    grid = Array.from({ length: N }, () => Array(N).fill(null));
    frostGrid = Array.from({ length: N }, () => Array(N).fill(0));
    frostLeft = 0;
    for (const [fr, fc] of cfg.frost) {
      if (fr < N && fc < N) {
        frostGrid[fr][fc] = 1;
        frostLeft++;
      }
    }
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        let col;
        let tries = 0;
        do {
          col = randColor();
          tries++;
        } while (
          tries < 20 &&
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
    N = cfg.size;
    movesLeft = cfg.moves;
    score = 0;
    collected = {};
    cfg.collect.forEach(item => { collected[item.color] = 0; });
    selected = null;
    hintPair = null;
    idleTime = 0;
    comboCount = 0;
    phase = "idle";
    swapCtx = null;
    particles.length = 0;
    beams.length = 0;
    floatTexts.length = 0;
    resultModal.classList.add("hidden");
    createInitialBoard();
    resizeBoard();
    updateHud();
    setTip(T().tipStart, false, 999);
  }

  function updateHud() {
    const t = T();
    levelLabel.textContent = t.level(currentLevel);
    movesLbl.textContent = t.moves;
    scoreLbl.textContent = t.score;
    movesVal.textContent = String(movesLeft);
    scoreVal.textContent = String(score);
    movesPill.classList.toggle("low", movesLeft <= 5 && phase !== "win");

    btnHint.textContent = t.hint;
    btnSound.textContent = soundOn ? t.soundOn : t.soundOff;
    btnSound.classList.toggle("muted", !soundOn);
    btnRestart.textContent = t.restart;
    if (btnFs) btnFs.textContent = document.fullscreenElement ? t.fsExit : t.fsEnter;

    // 渲染過關目標列
    goalStrip.innerHTML = "";
    for (const item of cfg.collect) {
      const cur = Math.min(item.count, collected[item.color] || 0);
      const done = cur >= item.count;
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (done ? " done" : "");
      const st = CANDY_STYLES[item.color];
      const cname = t.candyNames[item.color] || "";
      chip.innerHTML = `<span class="goal-dot" style="background:${st.main}"></span><span>${cname} ${cur}/${item.count}</span>`;
      goalStrip.appendChild(chip);
    }
    if (cfg.frost.length > 0) {
      const totalF = cfg.frost.length;
      const clearedF = totalF - frostLeft;
      const done = frostLeft <= 0;
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (done ? " done" : "");
      chip.innerHTML = `<span class="goal-dot" style="background:#f9a8d4"></span><span>${t.goalFrost(`${clearedF}/${totalF}`)}</span>`;
      goalStrip.appendChild(chip);
    }
    if (cfg.targetScore > 0) {
      const done = score >= cfg.targetScore;
      const chip = document.createElement("div");
      chip.className = "goal-chip" + (done ? " done" : "");
      chip.innerHTML = `<span>★ ${t.goalScore(`${Math.min(score, cfg.targetScore)}/${cfg.targetScore}`)}</span>`;
      goalStrip.appendChild(chip);
    }
  }

  function isGoalComplete() {
    if (score < cfg.targetScore) return false;
    if (frostLeft > 0) return false;
    for (const item of cfg.collect) {
      if ((collected[item.color] || 0) < item.count) return false;
    }
    return true;
  }

  // --- 尋找所有連線群組（支援 3/4/5/L/T 特殊糖果合成） ---
  function findMatchGroups() {
    const hRuns = [];
    const vRuns = [];

    for (let r = 0; r < N; r++) {
      let c = 0;
      while (c < N) {
        const cell = grid[r][c];
        if (!cell || cell.special === "color") { c++; continue; }
        let end = c + 1;
        while (end < N && grid[r][end] && grid[r][end].special !== "color" && grid[r][end].color === cell.color) end++;
        if (end - c >= 3) {
          const cells = [];
          for (let k = c; k < end; k++) cells.push({ r, c: k });
          hRuns.push({ dir: "h", color: cell.color, cells });
        }
        c = end;
      }
    }
    for (let c = 0; c < N; c++) {
      let r = 0;
      while (r < N) {
        const cell = grid[r][c];
        if (!cell || cell.special === "color") { r++; continue; }
        let end = r + 1;
        while (end < N && grid[end][c] && grid[end][c].special !== "color" && grid[end][c].color === cell.color) end++;
        if (end - r >= 3) {
          const cells = [];
          for (let k = r; k < end; k++) cells.push({ r: k, c });
          vRuns.push({ dir: "v", color: cell.color, cells });
        }
        r = end;
      }
    }

    // 合併相交且同色的水平／垂直連線（判斷 L/T 包裝糖或 5 連線彩虹球）
    const allRuns = [...hRuns, ...vRuns];
    const used = new Array(allRuns.length).fill(false);
    const groups = [];
    for (let i = 0; i < allRuns.length; i++) {
      if (used[i]) continue;
      used[i] = true;
      const comp = [allRuns[i]];
      const keySet = new Set(allRuns[i].cells.map(p => `${p.r},${p.c}`));
      let changed = true;
      while (changed) {
        changed = false;
        for (let j = 0; j < allRuns.length; j++) {
          if (used[j] || allRuns[j].color !== allRuns[i].color) continue;
          if (allRuns[j].cells.some(p => keySet.has(`${p.r},${p.c}`))) {
            used[j] = true;
            comp.push(allRuns[j]);
            allRuns[j].cells.forEach(p => keySet.add(`${p.r},${p.c}`));
            changed = true;
          }
        }
      }
      const uniqueCells = [...keySet].map(s => {
        const [r, c] = s.split(",").map(Number);
        return { r, c };
      });
      const maxLen = Math.max(...comp.map(x => x.cells.length));
      const hasH = comp.some(x => x.dir === "h");
      const hasV = comp.some(x => x.dir === "v");
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
      if (a.special === "color" || b.special === "color") return true;
      if (a.special && b.special) return true;
      if (a.color === b.color) return false;
      grid[r1][c1] = b; grid[r2][c2] = a;
      const ok = findMatchGroups().length > 0;
      grid[r1][c1] = a; grid[r2][c2] = b;
      return ok;
    };
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (c + 1 < N && testSwap(r, c, r, c + 1)) moves.push([{ r, c }, { r, c: c + 1 }]);
        if (r + 1 < N && testSwap(r, c, r + 1, c)) moves.push([{ r, c }, { r: r + 1, c }]);
      }
    }
    return moves;
  }

  function shuffleBoardImmediate() {
    const flat = [];
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c]) flat.push(grid[r][c]);
      }
    }
    for (let attempt = 0; attempt < 25; attempt++) {
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }
      let idx = 0;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const item = flat[idx++];
          item.x = c; item.y = r; item.scale = 1; item.alpha = 1;
          grid[r][c] = item;
        }
      }
      if (findMatchGroups().length === 0 && findValidMoves().length > 0) return;
    }
    // 保底直接重產一組有解盤面
    createInitialBoard();
  }

  // --- 粒子與特效 ---
  function spawnBurst(r, c, colorHex, count = 9) {
    const cx = (c + 0.5) * cellPx;
    const cy = (r + 0.5) * cellPx;
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const spd = 75 + Math.random() * 145;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(a) * spd,
        vy: Math.sin(a) * spd - 25,
        r: 3 + Math.random() * 4,
        color: i % 3 === 0 ? "#ffffff" : colorHex,
        life: 0.36 + Math.random() * 0.24,
        maxLife: 0.6
      });
    }
  }
  function spawnBeam(r1, c1, r2, c2, color = "#ffffff", width = 12) {
    beams.push({
      x1: (c1 + 0.5) * cellPx,
      y1: (r1 + 0.5) * cellPx,
      x2: (c2 + 0.5) * cellPx,
      y2: (r2 + 0.5) * cellPx,
      color, width, life: 0.28, maxLife: 0.28
    });
  }
  function spawnFloat(r, c, text, color = "#fff6b0") {
    floatTexts.push({
      x: Math.max(36, Math.min(boardPx - 36, (c + 0.5) * cellPx)),
      y: Math.max(24, (r + 0.3) * cellPx),
      text, color, life: 0.85, maxLife: 0.85
    });
  }

  // --- 觸發消除與連鎖特殊糖果 ---
  function collectClearSet(initialList) {
    const toClear = new Set();
    const queue = [];
    const addCell = (r, c) => {
      if (r < 0 || r >= N || c < 0 || c >= N || !grid[r][c]) return;
      const k = `${r},${c}`;
      if (!toClear.has(k)) {
        toClear.add(k);
        queue.push({ r, c });
      }
    };
    initialList.forEach(p => addCell(p.r, p.c));

    while (queue.length > 0) {
      const { r, c } = queue.shift();
      const cell = grid[r][c];
      if (!cell || !cell.special) continue;
      if (cell.special === "stripeH") {
        spawnBeam(r, 0, r, N - 1, CANDY_STYLES[cell.color].light, cellPx * 0.42);
        for (let cc = 0; cc < N; cc++) addCell(r, cc);
        boardShake = Math.max(boardShake, 6);
      } else if (cell.special === "stripeV") {
        spawnBeam(0, c, N - 1, c, CANDY_STYLES[cell.color].light, cellPx * 0.42);
        for (let rr = 0; rr < N; rr++) addCell(rr, c);
        boardShake = Math.max(boardShake, 6);
      } else if (cell.special === "wrapped") {
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) addCell(r + dr, c + dc);
        }
        spawnBurst(r, c, "#ffd166", 18);
        boardShake = Math.max(boardShake, 9);
      } else if (cell.special === "color") {
        const targetCol = randColor();
        for (let rr = 0; rr < N; rr++) {
          for (let cc = 0; cc < N; cc++) {
            if (grid[rr][cc] && grid[rr][cc].color === targetCol) {
              spawnBeam(r, c, rr, cc, CANDY_STYLES[targetCol].light, 7);
              addCell(rr, cc);
            }
          }
        }
        boardShake = Math.max(boardShake, 11);
      }
    }
    return [...toClear].map(k => {
      const [r, c] = k.split(",").map(Number);
      return { r, c };
    });
  }

  function applyClearAndGravity(cellsToClear, spawns = []) {
    comboCount++;
    const mult = 1 + (comboCount - 1) * 0.5;
    let gained = 0;
    let sumR = 0, sumC = 0;

    for (const { r, c } of cellsToClear) {
      const cell = grid[r][c];
      if (!cell) continue;
      const colStyle = CANDY_STYLES[cell.color] || CANDY_STYLES[0];
      spawnBurst(r, c, colStyle.main, cell.special ? 14 : 8);
      if (collected[cell.color] !== undefined) collected[cell.color]++;
      if (frostGrid[r][c] > 0) {
        frostGrid[r][c] = 0;
        frostLeft = Math.max(0, frostLeft - 1);
        spawnBurst(r, c, "#fbcfe8", 10);
        gained += 50;
      }
      gained += Math.round((cell.special ? 60 : 25) * mult);
      sumR += r; sumC += c;
      grid[r][c] = null;
    }

    // 生成新合成的特殊糖果
    for (const sp of spawns) {
      grid[sp.r][sp.c] = makeCandy(sp.r, sp.c, sp.color, sp.special);
      grid[sp.r][sp.c].scale = 1.32;
      spawnBurst(sp.r, sp.c, "#fff5a5", 14);
    }

    score += gained;
    if (score > bestScore) {
      bestScore = score;
      localStorage.setItem("candy_match1_best", String(bestScore));
    }
    if (cellsToClear.length > 0) {
      const avgR = sumR / cellsToClear.length;
      const avgC = sumC / cellsToClear.length;
      spawnFloat(avgR, avgC, comboCount > 1 ? `+${gained} ×${comboCount}` : `+${gained}`, comboCount > 1 ? "#ffe66d" : "#ffffff");
    }

    if (spawns.length > 0) {
      sfxSpecial();
      const sType = spawns[0].special;
      setTip(sType === "color" ? T().tipSpecialBomb : sType === "wrapped" ? T().tipSpecialWrap : T().tipSpecialStripe, true, 2.6);
    } else {
      sfxPop(comboCount - 1);
      if (comboCount >= 2) {
        const cheers = T().cheers;
        setTip(`${cheers[Math.min(cheers.length - 1, comboCount - 2)]} 連鎖 ×${comboCount}`, true, 2.0);
      }
    }

    // 自然重力掉落補位
    for (let c = 0; c < N; c++) {
      let writeR = N - 1;
      for (let r = N - 1; r >= 0; r--) {
        if (grid[r][c]) {
          const item = grid[r][c];
          if (writeR !== r) {
            grid[writeR][c] = item;
            grid[r][c] = null;
          }
          writeR--;
        }
      }
      let dropIdx = 1;
      for (let r = writeR; r >= 0; r--) {
        const nc = makeCandy(r, c, randColor(), null);
        nc.y = -dropIdx * 1.05;
        dropIdx++;
        grid[r][c] = nc;
      }
    }

    updateHud();
    phase = "falling";
    animT = 0;
  }

  function handleSpecialSwapCombo(r1, c1, r2, c2) {
    const a = grid[r1][c1], b = grid[r2][c2];
    if (!a || !b) return false;
    const isColorA = a.special === "color";
    const isColorB = b.special === "color";

    if (isColorA && isColorB) {
      // 雙彩虹彩球：全盤清空！
      const all = [];
      for (let r = 0; r < N; r++) for (let c = 0; c < N; c++) if (grid[r][c]) all.push({ r, c });
      spawnBeam(r1, c1, 0, 0, "#ffe066", 14);
      spawnBeam(r1, c1, N - 1, N - 1, "#ff7eb3", 14);
      boardShake = 14;
      sfxSpecial();
      applyClearAndGravity(all, []);
      return true;
    }
    if (isColorA || isColorB) {
      const bombPos = isColorA ? { r: r1, c: c1 } : { r: r2, c: c2 };
      const other = isColorA ? b : a;
      const targetColor = other.color;
      const extraSpecial = other.special;
      const seeds = [{ r: r1, c: c1 }, { r: r2, c: c2 }];
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const cell = grid[r][c];
          if (cell && cell.color === targetColor) {
            if (extraSpecial === "stripeH" || extraSpecial === "stripeV") {
              cell.special = (r + c) % 2 === 0 ? "stripeH" : "stripeV";
            } else if (extraSpecial === "wrapped") {
              cell.special = "wrapped";
            }
            spawnBeam(bombPos.r, bombPos.c, r, c, CANDY_STYLES[targetColor].light, 7);
            seeds.push({ r, c });
          }
        }
      }
      grid[bombPos.r][bombPos.c].special = null; // 避免遞迴再隨機觸發
      sfxSpecial();
      boardShake = 12;
      applyClearAndGravity(collectClearSet(seeds), []);
      return true;
    }
    if (a.special && b.special) {
      const seeds = [{ r: r1, c: c1 }, { r: r2, c: c2 }];
      const isWrapA = a.special === "wrapped";
      const isWrapB = b.special === "wrapped";
      if (isWrapA && isWrapB) {
        // 5×5 超級爆炸
        for (let dr = -2; dr <= 2; dr++) for (let dc = -2; dc <= 2; dc++) {
          if (r2 + dr >= 0 && r2 + dr < N && c2 + dc >= 0 && c2 + dc < N) seeds.push({ r: r2 + dr, c: c2 + dc });
        }
      } else if (isWrapA || isWrapB) {
        // 巨型三排＋三列十字雷射
        for (let d = -1; d <= 1; d++) {
          if (r2 + d >= 0 && r2 + d < N) {
            spawnBeam(r2 + d, 0, r2 + d, N - 1, "#ffd166", cellPx * 0.42);
            for (let cc = 0; cc < N; cc++) seeds.push({ r: r2 + d, c: cc });
          }
          if (c2 + d >= 0 && c2 + d < N) {
            spawnBeam(0, c2 + d, N - 1, c2 + d, "#ffd166", cellPx * 0.42);
            for (let rr = 0; rr < N; rr++) seeds.push({ r: rr, c: c2 + d });
          }
        }
      } else {
        // 雙條紋：十字整排＋整列
        spawnBeam(r2, 0, r2, N - 1, "#ffffff", cellPx * 0.45);
        spawnBeam(0, c2, N - 1, c2, "#ffffff", cellPx * 0.45);
        for (let i = 0; i < N; i++) { seeds.push({ r: r2, c: i }); seeds.push({ r: i, c: c2 }); }
      }
      sfxSpecial();
      boardShake = 12;
      applyClearAndGravity(collectClearSet(seeds), []);
      return true;
    }
    return false;
  }

  function resolveCurrentMatches(pivotA = null, pivotB = null) {
    const groups = findMatchGroups();
    if (groups.length === 0) return false;
    const seeds = [];
    const spawns = [];
    for (const g of groups) {
      g.cells.forEach(p => seeds.push(p));
      if (g.spawnSpecial) {
        let pos = g.cells[Math.floor(g.cells.length / 2)];
        if (pivotB && g.cells.some(p => p.r === pivotB.r && p.c === pivotB.c)) pos = pivotB;
        else if (pivotA && g.cells.some(p => p.r === pivotA.r && p.c === pivotA.c)) pos = pivotA;
        spawns.push({ r: pos.r, c: pos.c, color: g.color, special: g.spawnSpecial });
      }
    }
    const expanded = collectClearSet(seeds);
    applyClearAndGravity(expanded, spawns);
    return true;
  }

  function trySwap(r1, c1, r2, c2) {
    if (phase !== "idle") return;
    if (r2 < 0 || r2 >= N || c2 < 0 || c2 >= N) return;
    if (Math.abs(r1 - r2) + Math.abs(c1 - c2) !== 1) return;
    selected = null;
    hintPair = null;
    idleTime = 0;
    comboCount = 0;
    sfxSwap();
    swapCtx = { r1, c1, r2, c2, dur: 0.14 };
    phase = "swapping";
    animT = 0;
  }

  function showEndModal(won) {
    const t = T();
    phase = won ? "win" : "lose";
    if (won) {
      const bonus = movesLeft * 60;
      score += bonus;
      if (score > bestScore) {
        bestScore = score;
        localStorage.setItem("candy_match1_best", String(bestScore));
      }
      updateHud();
      sfxWin();
      const stars = movesLeft >= 8 ? "★★★" : movesLeft >= 3 ? "★★☆" : "★☆☆";
      modalStars.textContent = stars;
      modalTitle.textContent = t.winTitle(currentLevel);
      modalDesc.textContent = t.winDesc;
      btnNextLevel.classList.remove("hidden");
    } else {
      modalStars.textContent = "🍬";
      modalTitle.textContent = t.loseTitle;
      modalDesc.textContent = t.loseDesc;
      btnNextLevel.classList.add("hidden");
    }
    modalStats.textContent = t.stats(score, bestScore);
    btnNextLevel.textContent = t.nextBtn;
    btnRetryLevel.textContent = t.retryBtn;
    resultModal.classList.remove("hidden");
  }

  // --- 單指滑動＋點兩顆交換（靈敏防誤觸） ---
  let dragStart = null;
  function getCellFromPointer(e) {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const c = Math.floor(x / (rect.width / N));
    const r = Math.floor(y / (rect.height / N));
    if (r < 0 || r >= N || c < 0 || c >= N) return null;
    return { r, c, x, y };
  }

  canvas.addEventListener("pointerdown", e => {
    getAC();
    if (phase !== "idle") return;
    const hit = getCellFromPointer(e);
    if (!hit) return;
    dragStart = { r: hit.r, c: hit.c, x: e.clientX, y: e.clientY, swiped: false };
    try { canvas.setPointerCapture(e.pointerId); } catch {}
  });

  canvas.addEventListener("pointermove", e => {
    if (!dragStart || dragStart.swiped || phase !== "idle") return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    const thresh = Math.max(15, cellPx * 0.28);
    if (Math.hypot(dx, dy) >= thresh) {
      dragStart.swiped = true;
      let nr = dragStart.r, nc = dragStart.c;
      if (Math.abs(dx) > Math.abs(dy)) nc += dx > 0 ? 1 : -1;
      else nr += dy > 0 ? 1 : -1;
      if (nr >= 0 && nr < N && nc >= 0 && nc < N) {
        trySwap(dragStart.r, dragStart.c, nr, nc);
      }
      dragStart = null;
    }
  });

  canvas.addEventListener("pointerup", e => {
    if (!dragStart) return;
    const start = dragStart;
    dragStart = null;
    if (start.swiped || phase !== "idle") return;
    if (!selected) {
      selected = { r: start.r, c: start.c };
      playTone(460, 0.05, "sine", 0.06);
    } else if (selected.r === start.r && selected.c === start.c) {
      selected = null;
    } else if (Math.abs(selected.r - start.r) + Math.abs(selected.c - start.c) === 1) {
      trySwap(selected.r, selected.c, start.r, start.c);
    } else {
      selected = { r: start.r, c: start.c };
      playTone(460, 0.05, "sine", 0.06);
    }
  });
  canvas.addEventListener("pointercancel", () => { dragStart = null; });

  // --- 按鈕事件 ---
  btnHint.addEventListener("click", () => {
    getAC();
    if (phase !== "idle") return;
    const moves = findValidMoves();
    if (moves.length > 0) {
      hintPair = moves[0];
      playTone(720, 0.09, "triangle", 0.08, 920);
    }
  });
  btnSound.addEventListener("click", () => {
    soundOn = !soundOn;
    updateHud();
    if (soundOn) playTone(660, 0.08, "sine", 0.08);
  });
  btnRestart.addEventListener("click", () => {
    getAC();
    startLevel(currentLevel);
  });
  btnNextLevel.addEventListener("click", () => startLevel(currentLevel + 1));
  btnRetryLevel.addEventListener("click", () => startLevel(currentLevel));
  if (btnFs) {
    btnFs.addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });
    document.addEventListener("fullscreenchange", () => { updateHud(); setTimeout(resizeBoard, 60); });
  }
  window.addEventListener("arcade-lang-change", () => updateHud());

  // --- 繪製糖果與特殊效果 ---
  function drawCandyCell(cell, now) {
    const cx = (cell.x + 0.5) * cellPx;
    const cy = (cell.y + 0.5) * cellPx;
    const sz = cellPx * 0.88 * cell.scale;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.globalAlpha = cell.alpha;

    if (cell.special === "wrapped") {
      // 包裝糖外光暈＋閃爍方包
      const p = 1 + Math.sin(now * 0.01) * 0.06;
      ctx.fillStyle = "rgba(255, 245, 195, 0.52)";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-sz * 0.52 * p, -sz * 0.52 * p, sz * 1.04 * p, sz * 1.04 * p, 9);
      ctx.fill();
      ctx.stroke();
    }

    if (cell.special === "color") {
      const pulse = 1 + Math.sin(now * 0.008) * 0.05;
      ctx.rotate(Math.sin(now * 0.003) * 0.16);
      ctx.drawImage(colorBombSprite, -sz * 0.52 * pulse, -sz * 0.52 * pulse, sz * 1.04 * pulse, sz * 1.04 * pulse);
    } else {
      const sp = candySprites[cell.color] || candySprites[0];
      ctx.drawImage(sp, -sz * 0.5, -sz * 0.5, sz, sz);

      if (cell.special === "stripeH" || cell.special === "stripeV") {
        ctx.save();
        ctx.strokeStyle = "rgba(255, 255, 255, 0.92)";
        ctx.lineWidth = Math.max(2.6, cellPx * 0.085);
        ctx.lineCap = "round";
        for (const off of [-0.22, 0, 0.22]) {
          ctx.beginPath();
          if (cell.special === "stripeH") {
            ctx.moveTo(-sz * 0.34, off * sz);
            ctx.lineTo(sz * 0.34, off * sz);
          } else {
            ctx.moveTo(off * sz, -sz * 0.34);
            ctx.lineTo(off * sz, sz * 0.34);
          }
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    ctx.restore();
  }

  // --- 主迴圈 ---
  let lastT = performance.now();
  function tick(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    if (boardShake > 0) boardShake = Math.max(0, boardShake - dt * 36);
    if (tipResetTimer > 0 && tipResetTimer < 900) {
      tipResetTimer -= dt;
      if (tipResetTimer <= 0 && phase === "idle") {
        tipBanner.textContent = T().tipStart;
        tipBanner.classList.remove("combo");
      }
    }

    // 狀態更新
    if (phase === "swapping" && swapCtx) {
      animT += dt;
      const t = Math.min(1, animT / swapCtx.dur);
      const ease = 1 - Math.pow(1 - t, 2);
      const { r1, c1, r2, c2 } = swapCtx;
      const a = grid[r1][c1], b = grid[r2][c2];
      if (a && b) {
        a.x = c1 + (c2 - c1) * ease;
        a.y = r1 + (r2 - r1) * ease;
        b.x = c2 + (c1 - c2) * ease;
        b.y = r2 + (r1 - r2) * ease;
      }
      if (t >= 1) {
        grid[r1][c1] = b; grid[r2][c2] = a;
        if (a) { a.x = c2; a.y = r2; }
        if (b) { b.x = c1; b.y = r1; }

        if (handleSpecialSwapCombo(r1, c1, r2, c2)) {
          movesLeft = Math.max(0, movesLeft - 1);
          updateHud();
        } else if (resolveCurrentMatches({ r: r1, c: c1 }, { r: r2, c: c2 })) {
          movesLeft = Math.max(0, movesLeft - 1);
          updateHud();
        } else {
          // 無效交換：回彈且不扣步數！
          sfxInvalid();
          setTip(T().tipInvalid, false, 1.8);
          phase = "reverting";
          animT = 0;
        }
      }
    } else if (phase === "reverting" && swapCtx) {
      animT += dt;
      const t = Math.min(1, animT / swapCtx.dur);
      const { r1, c1, r2, c2 } = swapCtx;
      const a = grid[r2][c2], b = grid[r1][c1];
      if (a && b) {
        a.x = c2 + (c1 - c2) * t;
        a.y = r2 + (r1 - r2) * t;
        b.x = c1 + (c2 - c1) * t;
        b.y = r1 + (r2 - r1) * t;
      }
      if (t >= 1) {
        grid[r1][c1] = a; grid[r2][c2] = b;
        if (a) { a.x = c1; a.y = r1; }
        if (b) { b.x = c2; b.y = r2; }
        swapCtx = null;
        phase = "idle";
      }
    } else if (phase === "falling") {
      let moving = false;
      const fallSpd = 12.5;
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          const cell = grid[r][c];
          if (!cell) continue;
          cell.x = c;
          if (cell.y < r) {
            cell.y = Math.min(r, cell.y + fallSpd * dt);
            if (cell.y < r) moving = true;
            else cell.scale = 1.12; // 落地微 Q 彈
          }
          if (cell.scale > 1) cell.scale = Math.max(1, cell.scale - dt * 2.2);
        }
      }
      if (!moving) {
        if (!resolveCurrentMatches()) {
          // 盤面穩定 → 判斷勝負或自動洗牌
          if (isGoalComplete()) {
            showEndModal(true);
          } else if (movesLeft <= 0) {
            showEndModal(false);
          } else if (findValidMoves().length === 0) {
            phase = "shuffling";
            animT = 0;
            setTip(T().tipShuffle, true, 2.2);
            sfxSwap();
          } else {
            phase = "idle";
            idleTime = 0;
          }
        }
      }
    } else if (phase === "shuffling") {
      animT += dt;
      if (animT >= 0.45) {
        shuffleBoardImmediate();
        phase = "idle";
        idleTime = 0;
      }
    } else if (phase === "idle") {
      idleTime += dt;
      if (idleTime >= 4.5 && !hintPair) {
        const moves = findValidMoves();
        if (moves.length > 0) hintPair = moves[0];
      }
      for (let r = 0; r < N; r++) {
        for (let c = 0; c < N; c++) {
          if (grid[r][c] && grid[r][c].scale > 1) {
            grid[r][c].scale = Math.max(1, grid[r][c].scale - dt * 2.4);
          }
        }
      }
    }

    // 粒子／光束／飄字更新
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 260 * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = beams.length - 1; i >= 0; i--) {
      beams[i].life -= dt;
      if (beams[i].life <= 0) beams.splice(i, 1);
    }
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      floatTexts[i].life -= dt;
      floatTexts[i].y -= 34 * dt;
      if (floatTexts[i].life <= 0) floatTexts.splice(i, 1);
    }

    // === 繪製 ===
    ctx.save();
    ctx.clearRect(0, 0, boardPx, boardPx);
    if (boardShake > 0) {
      ctx.translate((Math.random() - 0.5) * boardShake, (Math.random() - 0.5) * boardShake);
    }

    // 1. 雙色粉彩棋盤格＋糖霜層
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const x = c * cellPx, y = r * cellPx;
        ctx.fillStyle = (r + c) % 2 === 0 ? "rgba(255, 241, 248, 0.94)" : "rgba(248, 224, 238, 0.92)";
        ctx.fillRect(x, y, cellPx, cellPx);
        if (frostGrid[r][c] > 0) {
          ctx.fillStyle = "rgba(255, 180, 218, 0.72)";
          ctx.beginPath();
          ctx.roundRect(x + 2, y + 2, cellPx - 4, cellPx - 4, 7);
          ctx.fill();
          ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
          ctx.lineWidth = 2;
          ctx.stroke();
        }
      }
    }

    // 2. 選中框與提示脈衝框
    if (selected && phase === "idle") {
      ctx.strokeStyle = "#ec4899";
      ctx.lineWidth = 3;
      ctx.fillStyle = "rgba(255, 192, 224, 0.35)";
      ctx.beginPath();
      ctx.roundRect(selected.c * cellPx + 2, selected.r * cellPx + 2, cellPx - 4, cellPx - 4, 8);
      ctx.fill();
      ctx.stroke();
    }
    if (hintPair && phase === "idle") {
      const pulse = 0.45 + Math.sin(now * 0.009) * 0.35;
      ctx.strokeStyle = `rgba(245, 158, 11, ${pulse + 0.2})`;
      ctx.lineWidth = 3;
      for (const p of hintPair) {
        ctx.beginPath();
        ctx.roundRect(p.c * cellPx + 3, p.r * cellPx + 3, cellPx - 6, cellPx - 6, 8);
        ctx.stroke();
      }
    }

    // 3. 糖果精靈
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c]) drawCandyCell(grid[r][c], now);
      }
    }

    // 4. 條紋／彩虹光束
    for (const b of beams) {
      const a = Math.max(0, b.life / b.maxLife);
      ctx.save();
      ctx.globalAlpha = a;
      ctx.strokeStyle = b.color;
      ctx.lineWidth = b.width * a;
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(b.x1, b.y1);
      ctx.lineTo(b.x2, b.y2);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = b.width * a * 0.42;
      ctx.stroke();
      ctx.restore();
    }

    // 5. 糖果爆破粒子
    for (const p of particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. 飄分與連擊字
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const f of floatTexts) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life / 0.35);
      ctx.font = "900 16px sans-serif";
      ctx.strokeStyle = "#5b1a42";
      ctx.lineWidth = 3.5;
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(tick);
  }

  // --- QA 驗證介面 ---
  window.__CANDY_QA__ = {
    version: VERSION_STAMP,
    getState() {
      return {
        version: VERSION_STAMP,
        level: currentLevel,
        size: N,
        movesLeft,
        score,
        phase,
        validMoves: findValidMoves(),
        boardPx,
        cellPx
      };
    },
    swap(r1, c1, r2, c2) { trySwap(r1, c1, r2, c2); },
    forceShuffle() { phase = "shuffling"; animT = 0; setTip(T().tipShuffle, true, 2.0); },
    spawnDemoSpecials() {
      if (N >= 5) {
        grid[2][2].special = "stripeH";
        grid[2][3].special = "wrapped";
        grid[3][3].special = "color";
      }
    }
  };

  startLevel(1);
  requestAnimationFrame(tick);
})();
