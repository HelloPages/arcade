(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const scoreVal = document.getElementById("scoreVal");
  const stageVal = document.getElementById("stageVal");
  const lblScore = document.getElementById("lblScore");
  const hpBar = document.getElementById("hpBar");
  const progressFill = document.getElementById("progressFill");
  const progressRunner = document.getElementById("progressRunner");
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
      stages: ["辦公室雲空", "恐龍水上樂園", "星光珍奶夜市"],
      weapons: { popcorn: "爆米花砲", rainbow: "彩虹光束", boba: "追蹤波霸" },
      switchWpn: "換武器",
      shieldReady: "泡泡盾",
      shieldOn: "無敵中",
      bombLabel: "爆辣",
      bossNames: ["👑 巨無霸主管旋轉椅", "🦖 暴龍泳圈大王", "👑 珍奶貓皇空中母艦"],
      phase: (n) => `階段 ${n}`,
      bossWarn: (name) => `⚠ ${name} 登場！！ ⚠`,
      stageClearTitle: (s) => `🎉 第 ${s} 關 過關！STAGE CLEAR! 🎉`,
      stageNextSub: (s, name) => `🚀 下一關：第 ${s} 關《${name}》登場！`,
      stageIntro: (s, name) => `✨ 第 ${s} 關《${name}》開飛！按住棒棒糖操縱柴柴！ ✨`,
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
      quipsByEnemy: {
        copier: ["卡紙啦！請補 A4！", "公文滿天飛！", "影印機暴走啦！"],
        chair: ["頭好暈喔～！", "滑輪失控啦！", "誰偷轉我椅子！"],
        ptero: ["翼龍要下班了！", "俯衝搶零食！", "翅膀抽筋啦！"],
        dinoegg: ["蛋殼破啦！", "小暴龍出動！", "別敲我蛋頭！"],
        toaster: ["吐司烤焦啦！", "奶油噴出來了！"],
        catufo: ["柴柴太兇了吧！", "我要加薪啦！"]
      },
      bossQuips: [
        ["週末來加班喔！", "簡報第 18 版重做！", "旋轉椅加速！"],
        ["手太短按不到按鈕！", "游泳圈漏氣啦！", "暴龍大口咬！"],
        ["敢打翻朕的珍奶？！", "加珍珠不用錢喔！", "全糖去冰狂射！"]
      ],
      overBadge: "柴柴累翻了",
      overTitle: "差一點就通關啦！",
      restart: "再飛一局 ↗",
      summary: (sc, st, k) => `總分 ${sc.toLocaleString()}\n到達第 ${st} 關 ・ 擊破搞笑敵人 ${k} 個`
    },
    en: {
      score: "SCORE",
      stages: ["Office Chaos Sky", "Dino Waterpark", "Boba Night Market"],
      weapons: { popcorn: "Popcorn", rainbow: "Rainbow", boba: "Boba Homing" },
      switchWpn: "Weapon",
      shieldReady: "Bubble",
      shieldOn: "SHIELD!",
      bombLabel: "Chili",
      bossNames: ["👑 Executive Swivel Boss", "🦖 Floatie T-Rex King", "👑 King Boba-Cat Carrier"],
      phase: (n) => `PHASE ${n}`,
      bossWarn: (name) => `⚠ ${name} INCOMING! ⚠`,
      stageClearTitle: (s) => `🎉 STAGE ${s} CLEAR! 🎉`,
      stageNextSub: (s, name) => `🚀 NEXT: STAGE ${s} — ${name}!`,
      stageIntro: (s, name) => `✨ STAGE ${s}: ${name}! Drag the Lollipop to fly! ✨`,
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
      quipsByEnemy: {
        copier: ["PC LOAD LETTER!", "Paper jam panic!", "Urgent memos!"],
        chair: ["So dizzy!!", "Spinning out!", "Wheelies!"],
        ptero: ["Clocking out!", "Snack dive!", "Wing cramp!"],
        dinoegg: ["Shell cracked!", "Baby Rex loose!", "Don't scramble me!"],
        toaster: ["Burnt toast!", "Extra butter!"],
        catufo: ["Shiba too OP!", "I need a raise!"]
      },
      bossQuips: [
        ["Weekend overtime!", "Redo deck v18!", "Turbo swivel!"],
        ["Tiny arms can't reach!", "My duckie floatie!", "Rex chomp!"],
        ["Who spilled my boba?!", "Extra pearls!", "Full-sugar barrage!"]
      ],
      overBadge: "SHIBA NAP TIME",
      overTitle: "So close to victory!",
      restart: "Fly Again ↗",
      summary: (sc, st, k) => `Score ${sc.toLocaleString()}\nStage ${st} • Defeated ${k} silly foes`
    },
    ko: {
      score: "점수",
      stages: ["오피스 구름하늘", "공룡 워터파크", "별빛 버블티 야시장"],
      weapons: { popcorn: "팝콘포", rainbow: "무지개빔", boba: "유도 버블" },
      switchWpn: "무기교체",
      shieldReady: "버블방패",
      shieldOn: "무적 중",
      bombLabel: "매운폭탄",
      bossNames: ["👑 초대형 팀장 회전의자", "🦖 튜브 티라노 대왕", "👑 버블티 냥이 모함"],
      phase: (n) => `페이즈 ${n}`,
      bossWarn: (name) => `⚠ ${name} 출격!! ⚠`,
      stageClearTitle: (s) => `🎉 스테이지 ${s} 클리어! 🎉`,
      stageNextSub: (s, name) => `🚀 다음 스테이지 ${s}: ${name}!`,
      stageIntro: (s, name) => `✨ 스테이지 ${s}《${name}》막대사탕을 잡아 조종하세요! ✨`,
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
      quipsByEnemy: {
        copier: ["종이 걸렸다!", "결재 서류 폭탄!", "복사기 폭주!"],
        chair: ["어지러워요~!", "바퀴 브레이크 고장!"],
        ptero: ["익룡 칼퇴근!", "간식 급강하!"],
        dinoegg: ["알이 깨졌다!", "아기 공룡 출동!"],
        toaster: ["토스트 다 탔어!", "버터 발사!"],
        catufo: ["시바견 너무 세!", "월급 올려줘!"]
      },
      bossQuips: [
        ["주말 출근이다!", "보고서 다시 써!", "회전의자 풀파워!"],
        ["팔이 짧아 버튼이 안 닿아!", "오리 튜브 터지겠다!", "티라노 돌진!"],
        ["감히 짐의 버블티를?!", "펄 추가 무료다!", "크루아상 포 발사!"]
      ],
      overBadge: "시바견 휴식 시간",
      overTitle: "클리어가 코앞이었는데!",
      restart: "다시 출격 ↗",
      summary: (sc, st, k) => `점수 ${sc.toLocaleString()}\n스테이지 ${st} ・ 격추 ${k}개`
    }
  };

  function lang() { return (window.ArcadeI18n && window.ArcadeI18n.getLang()) || "tw"; }
  function tx() { return I18N[lang()] || I18N.tw; }

  // --- 美術圖檔載入 ---
  const V = "20261122_lollipop_v1";
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

  // =========================================================
  // 5 聲道超歡樂多關卡復古電玩 BGM ＋ 過關慶祝樂曲 ＋ 即時跟手音效
  // =========================================================
  let ac = null;
  let noiseBuf = null;
  let soundOn = true;
  let audioUnlocked = false;
  let bgmTimer = null;
  let bgmNext = 0;
  let bgmStep = 0;
  let bgmRunning = false;
  let activeTrackKey = "stage1"; // "stage1" | "stage2" | "stage3" | "boss" | "clear"

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
    A2: 110.00, Bb2: 116.54, B2: 123.47,
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, Fs3: 185.00, G3: 196.00, A3: 220.00, Bb3: 233.08, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, Fs4: 369.99, G4: 392.00, A4: 440.00, Bb4: 466.16, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, Fs5: 739.99, G5: 783.99, A5: 880.00, Bb5: 932.33, B5: 987.77,
    C6: 1046.50, D6: 1174.66, E6: 1318.51
  };

  // 四套完整可聽出明顯差異的 5 聲道復古街機曲目（A+B 樂句變化、主旋律＋和聲＋16分琶音＋低音＋鼓組）
  const TRACKS = {
    stage1: { // C大調 150 BPM：輕快辦公室甜點雲空（超洗腦陽光復古街機）
      bpm: 150,
      lead: [
        "G5", null, "E5", "G5", "A5", null, "G5", "E5",  "C5", "D5", "E5", "G5", "A5", null, "G5", null,
        "F5", null, "E5", "D5", "E5", "G5", "C6", null,  "B5", "A5", "G5", "F5", "E5", null, "D5", null,
        "E5", "G5", "C6", null, "B5", "A5", "G5", "E5",  "F5", "A5", "D6", null, "C6", "B5", "A5", "G5",
        "E5", "G5", "A5", "C6", "D6", null, "C6", "A5",  "G5", "E5", "D5", "E5", "C5", null, null, null
      ],
      harm: [
        "E5", null, "C5", "E5", "F5", null, "E5", "C5",  "G4", "B4", "C5", "E5", "F5", null, "E5", null,
        "D5", null, "C5", "B4", "C5", "E5", "G5", null,  "G5", "F5", "E5", "D5", "C5", null, "B4", null,
        "C5", "E5", "G5", null, "G5", "F5", "E5", "C5",  "D5", "F5", "A5", null, "A5", "G5", "F5", "E5",
        "C5", "E5", "F5", "A5", "B5", null, "A5", "F5",  "E5", "C5", "B4", "C5", "G4", null, null, null
      ],
      bass: [
        "C3", null, "G3", null, "A3", null, "E3", null,  "C3", null, "G3", null, "A3", null, "G3", null,
        "F3", null, "C4", null, "C3", null, "G3", null,  "G3", null, "D4", null, "G3", null, "D3", null,
        "C3", null, "G3", null, "A3", null, "E3", null,  "F3", null, "C4", null, "G3", null, "D4", null,
        "A3", null, "E3", null, "F3", null, "C4", null,  "G3", null, "D3", null, "C3", null, "G3", null
      ],
      chords: [["C4","E4","G4","C5"],["A3","C4","E4","A4"],["F3","A3","C4","F4"],["G3","B3","D4","G4"]]
    },
    stage2: { // F大調 156 BPM：恐龍水上樂園（俏皮切分海島冒險感！）
      bpm: 156,
      lead: [
        "F5", "A5", "C6", null, "Bb5", "A5", "G5", "F5",  "G5", null, "A5", "Bb5", "C6", null, "A5", null,
        "D6", null, "C6", "Bb5", "A5", "G5", "F5", "A5",  "G5", "F5", "E5", "G5", "C5", null, null, null,
        "A5", null, "Bb5", "C6", "D6", null, "C6", "A5",  "Bb5", "A5", "G5", "F5", "G5", null, "A5", null,
        "C6", "A5", "F5", "A5", "Bb5", "G5", "E5", "G5",  "F5", "G5", "A5", "C6", "F5", null, null, null
      ],
      harm: [
        "C5", "F5", "A5", null, "G5", "F5", "E5", "C5",  "E5", null, "F5", "G5", "A5", null, "F5", null,
        "Bb5", null, "A5", "G5", "F5", "E5", "C5", "F5",  "E5", "D5", "C5", "E5", "G4", null, null, null,
        "F5", null, "G5", "A5", "Bb5", null, "A5", "F5",  "G5", "F5", "E5", "C5", "E5", null, "F5", null,
        "A5", "F5", "C5", "F5", "G5", "E5", "C5", "E5",  "C5", "E5", "F5", "A5", "C5", null, null, null
      ],
      bass: [
        "F3", null, "C4", null, "D3", null, "A3", null,  "Bb2", null, "F3", null, "C3", null, "G3", null,
        "Bb2", null, "F3", null, "F3", null, "C4", null,  "C3", null, "G3", null, "C3", null, "G3", null,
        "D3", null, "A3", null, "Bb2", null, "F3", null,  "G3", null, "D4", null, "C3", null, "G3", null,
        "F3", null, "A3", null, "Bb2", null, "C3", null,  "F3", null, "C4", null, "F3", null, "C3", null
      ],
      chords: [["F4","A4","C5","F5"],["D4","F4","A4","D5"],["Bb3","D4","F4","Bb4"],["C4","E4","G4","C5"]]
    },
    stage3: { // G大調 162 BPM：星光珍奶夜市嘉年華（喜氣洋洋五聲嘉年華旋律！）
      bpm: 162,
      lead: [
        "D5", "G5", "A5", "B5", "D6", null, "B5", "A5",  "G5", "A5", "B5", "G5", "E5", null, "D5", null,
        "E5", "G5", "A5", "B5", "A5", "G5", "E5", "G5",  "A5", null, "B5", "A5", "G5", null, null, null,
        "D6", null, "B5", "D6", "E6", null, "D6", "B5",  "A5", "B5", "D6", "B5", "A5", null, "G5", null,
        "E5", "G5", "A5", "B5", "D6", "B5", "A5", "G5",  "A5", "B5", "A5", "Fs5", "G5", null, null, null
      ],
      harm: [
        "B4", "D5", "Fs5", "G5", "B5", null, "G5", "Fs5", "D5", "Fs5", "G5", "D5", "C5", null, "B4", null,
        "C5", "E5", "Fs5", "G5", "Fs5", "E5", "C5", "E5", "Fs5", null, "G5", "Fs5", "D5", null, null, null,
        "B5", null, "G5", "B5", "C6", null, "B5", "G5",  "Fs5", "G5", "B5", "G5", "Fs5", null, "D5", null,
        "C5", "E5", "Fs5", "G5", "B5", "G5", "Fs5", "D5", "Fs5", "G5", "Fs5", "D5", "D5", null, null, null
      ],
      bass: [
        "G3", null, "D4", null, "E3", null, "B3", null,  "C3", null, "G3", null, "D3", null, "A3", null,
        "C3", null, "G3", null, "E3", null, "B3", null,  "D3", null, "A3", null, "G3", null, "D3", null,
        "G3", null, "D4", null, "C3", null, "G3", null,  "D3", null, "A3", null, "E3", null, "B3", null,
        "C3", null, "G3", null, "D3", null, "A3", null,  "D3", null, "Fs3", null, "G3", null, "D3", null
      ],
      chords: [["G4","B4","D5","G5"],["E4","G4","B4","E5"],["C4","E4","G4","C5"],["D4","Fs4","A4","D5"]]
    },
    boss: { // 170 BPM 頭目熱血搞笑對決曲（緊湊推進＋小調轉大調英雄感！）
      bpm: 170,
      lead: [
        "D5", "F5", "A5", "D6", "C6", "Bb5", "A5", "G5",  "A5", null, "F5", "G5", "A5", null, "D5", null,
        "Bb5", "A5", "G5", "F5", "G5", "A5", "Bb5", "C6", "A5", null, "G5", "F5", "E5", null, "A5", null,
        "D6", null, "C6", "D6", "E6", "D6", "C6", "A5",   "Bb5", "C6", "D6", "Bb5", "A5", null, "G5", null,
        "F5", "G5", "A5", "Bb5", "C6", "Bb5", "A5", "G5", "A5", null, "E5", "A5", "D6", null, null, null
      ],
      harm: [
        "A4", "D5", "F5", "A5", "G5", "F5", "E5", "D5",   "F5", null, "D5", "E5", "F5", null, "A4", null,
        "G5", "F5", "E5", "D5", "E5", "F5", "G5", "A5",   "F5", null, "E5", "D5", "C5", null, "E5", null,
        "A5", null, "G5", "A5", "C6", "A5", "G5", "F5",   "G5", "A5", "Bb5", "G5", "F5", null, "E5", null,
        "D5", "E5", "F5", "G5", "A5", "G5", "F5", "E5",   "F5", null, "C5", "E5", "A5", null, null, null
      ],
      bass: [
        "D3", "D3", "A3", "D3", "C3", "C3", "G3", "C3",   "Bb2", "Bb2", "F3", "Bb2", "A2", "A2", "E3", "A2",
        "G3", "G3", "D4", "G3", "F3", "F3", "C4", "F3",   "E3", "E3", "B3", "E3", "A2", "A2", "E3", "A2",
        "D3", "D3", "A3", "D3", "C3", "C3", "G3", "C3",   "Bb2", "Bb2", "F3", "Bb2", "A2", "A2", "G3", "A2",
        "Bb2", "Bb2", "F3", "Bb2", "C3", "C3", "G3", "C3","A2", "A2", "E3", "A2", "D3", null, "A2", null
      ],
      chords: [["D4","F4","A4","D5"],["C4","E4","G4","C5"],["Bb3","D4","F4","Bb4"],["A3","C4","E4","A4"]]
    }
  };

  function getDesiredTrackKey() {
    if (stageClearTimer > 0) return "clear";
    if (boss) return "boss";
    const idx = (stageNum - 1) % 3;
    return idx === 0 ? "stage1" : idx === 1 ? "stage2" : "stage3";
  }

  function playStageClearFanfare() {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime + 0.02;
    const notes = [
      ["C5", 0.00, 0.12], ["E5", 0.12, 0.12], ["G5", 0.24, 0.12], ["C6", 0.36, 0.28],
      ["A5", 0.68, 0.14], ["B5", 0.82, 0.14], ["C6", 0.96, 0.55]
    ];
    notes.forEach(([k, off, dur]) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "square"; o.frequency.setValueAtTime(HZ[k], now + off);
      g.gain.setValueAtTime(0.06, now + off);
      g.gain.exponentialRampToValueAtTime(0.0008, now + off + dur);
      o.connect(g).connect(a.destination);
      o.start(now + off); o.stop(now + off + dur + 0.02);
      const h = a.createOscillator(), hg = a.createGain();
      h.type = "triangle"; h.frequency.setValueAtTime(HZ[k] * 0.5, now + off);
      hg.gain.setValueAtTime(0.07, now + off);
      hg.gain.exponentialRampToValueAtTime(0.0008, now + off + dur);
      h.connect(hg).connect(a.destination);
      h.start(now + off); h.stop(now + off + dur + 0.02);
    });
  }

  function scheduleBgm(a, st, t) {
    const desired = getDesiredTrackKey();
    if (desired === "clear") return;
    if (desired !== activeTrackKey) {
      activeTrackKey = desired;
      bgmStep = 0;
    }
    const tr = TRACKS[activeTrackKey] || TRACKS.stage1;
    const dur = 60 / tr.bpm / 2;
    const idx = st % tr.lead.length;
    const m = tr.lead[idx];
    const h = tr.harm[idx];
    const b = tr.bass[idx];
    const ch = tr.chords[Math.floor((idx % 16) / 4)];

    // 1. 主旋律（清脆方波）
    if (m && HZ[m]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "square"; o.frequency.setValueAtTime(HZ[m], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.032, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0006, t + dur * 0.90);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + dur * 0.94);
    }
    // 2. 三度／六度和聲（立體飽滿復古電玩感）
    if (h && HZ[h]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "square"; o.frequency.setValueAtTime(HZ[h], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.014, t + 0.012);
      g.gain.exponentialRampToValueAtTime(0.0004, t + dur * 0.85);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + dur * 0.88);
    }
    // 3. 16 分音符閃耀琶音
    for (let sub = 0; sub < 2; sub++) {
      const ak = ch[(idx * 2 + sub) % ch.length];
      if (HZ[ak]) {
        const at = t + sub * (dur * 0.5);
        const o = a.createOscillator(), g = a.createGain();
        o.type = "triangle"; o.frequency.setValueAtTime(HZ[ak] * 2, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(0.014, at + 0.006);
        g.gain.exponentialRampToValueAtTime(0.0004, at + dur * 0.45);
        o.connect(g).connect(a.destination);
        o.start(at); o.stop(at + dur * 0.48);
      }
    }
    // 4. 彈跳低音
    if (b && HZ[b]) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle"; o.frequency.setValueAtTime(HZ[b], t);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.linearRampToValueAtTime(0.052, t + 0.008);
      g.gain.exponentialRampToValueAtTime(0.0008, t + dur * 1.35);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + dur * 1.4);
    }
    // 5. 完整復古鼓組（底鼓＋軍鼓＋小镲）
    if (idx % 4 === 0) {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "sine";
      o.frequency.setValueAtTime(145, t);
      o.frequency.exponentialRampToValueAtTime(42, t + 0.07);
      g.gain.setValueAtTime(0.045, t);
      g.gain.exponentialRampToValueAtTime(0.0008, t + 0.08);
      o.connect(g).connect(a.destination);
      o.start(t); o.stop(t + 0.085);
    } else if (idx % 4 === 2 && noiseBuf) {
      const s = a.createBufferSource(); s.buffer = noiseBuf;
      const bp = a.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.setValueAtTime(2400, t);
      const g = a.createGain();
      g.gain.setValueAtTime(0.022, t);
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.06);
      s.connect(bp).connect(g).connect(a.destination);
      s.start(t); s.stop(t + 0.065);
    }
    if (idx % 2 === 1 && noiseBuf) {
      const s = a.createBufferSource(); s.buffer = noiseBuf;
      const hp = a.createBiquadFilter(); hp.type = "highpass"; hp.frequency.setValueAtTime(7000, t);
      const g = a.createGain();
      g.gain.setValueAtTime(0.011, t);
      g.gain.exponentialRampToValueAtTime(0.0004, t + 0.028);
      s.connect(hp).connect(g).connect(a.destination);
      s.start(t); s.stop(t + 0.032);
    }
  }

  function startBgm() {
    if (!soundOn || bgmRunning || document.hidden) return;
    const a = getAC();
    if (!a) return;
    bgmRunning = true;
    bgmNext = a.currentTime + 0.04;
    bgmTimer = setInterval(() => {
      if (!soundOn || !ac || ac.state !== "running") return;
      const tr = TRACKS[activeTrackKey] || TRACKS.stage1;
      const dur = 60 / tr.bpm / 2;
      while (bgmNext < ac.currentTime + 0.14) {
        scheduleBgm(ac, bgmStep, bgmNext);
        bgmNext += dur;
        bgmStep += 1;
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

  // 即時跟手射擊／命中／擊破音效（清晰透亮、不被音樂蓋過）
  function sfxShoot(type) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = type === "rainbow" ? "sawtooth" : type === "boba" ? "triangle" : "square";
    o.frequency.setValueAtTime(type === "rainbow" ? 840 : type === "boba" ? 560 : 700, now);
    o.frequency.exponentialRampToValueAtTime(210, now + 0.048);
    g.gain.setValueAtTime(0.068, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.052);
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + 0.056);
  }
  function sfxHitTick() {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator(), g = a.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(980, now);
    o.frequency.exponentialRampToValueAtTime(420, now + 0.028);
    g.gain.setValueAtTime(0.08, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.032);
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + 0.035);
  }
  function sfxBoom(big = false) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    if (noiseBuf) {
      const s = a.createBufferSource(); s.buffer = noiseBuf;
      const g = a.createGain();
      g.gain.setValueAtTime(big ? 0.42 : 0.22, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + (big ? 0.26 : 0.10));
      s.connect(g).connect(a.destination);
      s.start(now); s.stop(now + (big ? 0.28 : 0.11));
    }
    const o = a.createOscillator(), g = a.createGain();
    o.type = "triangle";
    o.frequency.setValueAtTime(big ? 175 : 270, now);
    o.frequency.exponentialRampToValueAtTime(36, now + (big ? 0.36 : 0.13));
    g.gain.setValueAtTime(big ? 0.38 : 0.20, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (big ? 0.38 : 0.14));
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + (big ? 0.40 : 0.15));
  }
  function sfxPickup() {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    [523.25, 659.25, 783.99, 1046.5].forEach((f, i) => {
      const o = a.createOscillator(), g = a.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(f, now + i * 0.042);
      g.gain.setValueAtTime(0.20, now + i * 0.042);
      g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.042 + 0.14);
      o.connect(g).connect(a.destination);
      o.start(now + i * 0.042); o.stop(now + i * 0.042 + 0.15);
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

  const WEAPONS = [
    { id: "popcorn", itemKey: "item-popcorn", color: "#ff9f1c" },
    { id: "rainbow", itemKey: "item-rainbow", color: "#ff5ec4" },
    { id: "boba", itemKey: "item-boba", color: "#9b5de5" }
  ];
  const TREASURES = {
    popcorn: { img: "item-popcorn", glow: "#ffd166" },
    rainbow: { img: "item-rainbow", glow: "#ff70d9" },
    boba:    { img: "item-boba",    glow: "#b388ff" },
    chili:   { img: "item-chili",   glow: "#ff5e5b" },
    cake:    { img: "item-cake",    glow: "#ff85a1" },
    bubble:  { img: "item-bubble",  glow: "#48cae4" }
  };

  let gameOver = false;
  let score = 0;
  let kills = 0;
  let stageNum = 1;
  let waveNum = 1;
  let waveTimer = 0;
  let stageClearTimer = 0;
  let stageClearJustFinished = 0;
  let bgScroll = 0;
  let prevStageIdx = 0;
  let bgFade = 1;
  let shake = 0;
  let bombFlash = 0;
  let bannerTitle = "";
  let bannerSub = "";
  let bannerTimer = 0;
  let hitTickCd = 0;

  const HERO_SIZE = 74;
  const LOLLIPOP_LEN = 82; // 糖棒長度（棒棒糖頭位於飛機尾端正後方 82 CSS px）
  const LOLLIPOP_R = 23;   // 彩色棒棒糖頭半徑

  const player = {
    x: vw * 0.5, y: vh * 0.68, tx: vw * 0.5, ty: vh * 0.68,
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

  // 取得四邊邊界（上緣受限時優先完整顯示整架柴犬飛機！）
  function getPlayerBounds() {
    const hudEl = document.querySelector(".hud-top");
    const hudB = hudEl ? hudEl.getBoundingClientRect().bottom : 74;
    const botEl = document.querySelector(".hud-bottom");
    const botTop = botEl ? botEl.getBoundingClientRect().top : (vh - 56);
    const halfW = HERO_SIZE * 0.54;
    const halfH = HERO_SIZE * 0.54;
    return {
      minX: Math.max(38, halfW + 4),
      maxX: Math.min(vw - 38, vw - halfW - 4),
      minY: Math.max(82, hudB + halfH + 8),
      maxY: Math.min(vh - LOLLIPOP_LEN - 26, botTop - LOLLIPOP_LEN - 10)
    };
  }
  function clampPlayerTarget() {
    const b = getPlayerBounds();
    player.tx = Math.max(b.minX, Math.min(b.maxX, player.tx));
    player.ty = Math.max(b.minY, Math.min(b.maxY, player.ty));
  }

  // 計算棒棒糖頭實際螢幕位置（不計入飛機受傷判定！）
  function getLollipopHeadPos() {
    const lx = player.x - player.tilt * 34;
    const ly = Math.min(vh - 28, player.y + LOLLIPOP_LEN);
    return { x: lx, y: ly };
  }

  // =========================================================
  // 真實互動「棒棒糖把手」拖曳操控（重握不跳位、四邊可操作、零受傷判定）
  // =========================================================
  let activePointerId = null;
  let lollipopGrabbed = false;
  let grabOffsetX = 0; // 紀錄手指相對於棒棒糖頭的偏移量，確保重握完全不跳位！
  let grabOffsetY = 0;

  canvas.addEventListener("pointerdown", e => {
    activePointerId = e.pointerId;
    try { canvas.setPointerCapture(e.pointerId); } catch (_) {}
    const head = getLollipopHeadPos();
    const distToCandy = Math.hypot(e.clientX - head.x, e.clientY - head.y);
    lollipopGrabbed = true;

    if (distToCandy <= 64) {
      // 直接抓到棒棒糖頭：記錄微調偏移，跟手零跳位！
      grabOffsetX = head.x - e.clientX;
      grabOffsetY = head.y - e.clientY;
    } else if (e.pointerType === "touch") {
      // 寬容手勢：在畫面其他地方重新落指也不會瞬移跳位，採相對拖曳跟手！
      grabOffsetX = head.x - e.clientX;
      grabOffsetY = head.y - e.clientY;
    } else {
      // 滑鼠點擊直接以棒棒糖頭對準游標拖曳
      grabOffsetX = 0;
      grabOffsetY = 0;
      player.tx = e.clientX;
      player.ty = e.clientY - LOLLIPOP_LEN;
      clampPlayerTarget();
    }
  });

  canvas.addEventListener("pointermove", e => {
    if (activePointerId !== null && e.pointerId !== activePointerId) return;
    if (activePointerId === null) {
      if (e.pointerType !== "mouse" || e.buttons === 0) return;
    }
    const desiredCandyX = e.clientX + grabOffsetX;
    const desiredCandyY = e.clientY + grabOffsetY;
    player.tx = desiredCandyX;
    player.ty = desiredCandyY - LOLLIPOP_LEN;
    clampPlayerTarget();
  });

  function releasePointer(e) {
    if (activePointerId !== null && e && e.pointerId !== undefined && e.pointerId !== activePointerId) return;
    activePointerId = null;
    lollipopGrabbed = false;
  }
  window.addEventListener("pointerup", releasePointer);
  window.addEventListener("pointercancel", releasePointer);

  const keys = {};
  window.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (e.code === "KeyX" || e.code === "Space") triggerBomb();
    if (e.code === "KeyC" || e.code === "ShiftLeft") triggerShield();
    if (e.code === "KeyQ") { player.wpnIdx = (player.wpnIdx + 1) % WEAPONS.length; renderHud(); }
  });
  window.addEventListener("keyup", e => { keys[e.code] = false; });

  function renderHud() {
    const t = tx();
    lblScore.textContent = t.score;
    scoreVal.textContent = String(score).padStart(6, "0");
    const stIdx = (stageNum - 1) % 3;
    const stName = t.stages[stIdx];
    stageVal.textContent = `${stageNum}-${Math.min(4, waveNum)} ${stName}`;

    // 糖果軌道關卡進度條（1~3波推進到 80%，頭目戰 100% 皇冠！）
    const pct = boss ? 100 : Math.min(92, Math.max(12, Math.round(((waveNum - 1) / 3) * 84 + 12)));
    progressFill.style.width = pct + "%";
    progressRunner.style.left = pct + "%";

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
    bossNameEl.textContent = t.bossNames[stIdx];
    if (boss) bossPhaseEl.textContent = t.phase(boss.phase);
  }

  if (window.ArcadeI18n) window.ArcadeI18n.onChange(() => renderHud());

  function spawnBoom(x, y, color = "#ffd166", count = 16, big = false) {
    sfxBoom(big);
    if (big) shake = Math.max(shake, 16);
    shockwaves.push({ x, y, r: 8, maxR: big ? 135 : 52, color, life: big ? 0.44 : 0.25, maxLife: big ? 0.44 : 0.25 });
    const palette = [color, "#fffdf5", "#ffd84d", "#ff5768", "#38e0a8", "#34c6ff"];
    for (let i = 0; i < count; i++) {
      const a = Math.random() * Math.PI * 2;
      const sp = (big ? 95 : 55) + Math.random() * (big ? 250 : 145);
      particles.push({
        x, y, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp,
        r: (big ? 4.5 : 3) + Math.random() * 4.5,
        color: palette[i % palette.length],
        life: 0.34 + Math.random() * 0.36, maxLife: 0.70
      });
    }
  }

  function spawnPickup(x, y, forcedType = null) {
    const r = Math.random();
    const type = forcedType || (r < 0.24 ? "popcorn" : r < 0.46 ? "rainbow" : r < 0.68 ? "boba" : r < 0.80 ? "chili" : r < 0.90 ? "cake" : "bubble");
    pickups.push({ x: Math.max(36, Math.min(vw - 36, x)), y, vy: 82, type, phase: Math.random() * 6.28 });
  }

  function spawnQuip(x, y, text) {
    if (quips.length >= 2) quips.shift();
    quips.push({ x: Math.max(92, Math.min(vw - 92, x)), y: Math.max(110, y), text, life: 1.75, maxLife: 1.75 });
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
      spawnBoom(e.x, e.y, "#ff5768", 14, false);
      score += e.score;
      kills += 1;
      if (Math.random() < 0.45) spawnPickup(e.x, e.y);
      enemies.splice(i, 1);
    }
    if (boss) {
      boss.hp -= 125;
      boss.hitFlash = 0.25;
      spawnBoom(boss.x, boss.y, "#ff5768", 26, true);
    }
    bannerTitle = tx().chiliShout;
    bannerSub = "";
    bannerTimer = 1.6;
    renderHud();
  }

  function triggerShield() {
    if (gameOver || player.shieldCd > 0 || player.shieldTime > 0) return;
    player.shieldTime = 4.4;
    player.shieldCd = 10.5;
    sfxPickup();
    floatTexts.push({ x: player.x, y: player.y - 38, text: tx().bubbleShout, color: "#00b4d8", life: 1.15, maxLife: 1.15 });
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
    stageClearTimer = 0; prevStageIdx = 0; bgFade = 1;
    player.x = vw * 0.5; player.y = Math.min(vh * 0.68, getPlayerBounds().maxY);
    player.tx = player.x; player.ty = player.y;
    player.hp = player.maxHp; player.wpnIdx = 0; player.wpnLv = 1; player.bombs = 3;
    player.shieldTime = 0; player.shieldCd = 0; player.invuln = 1.2;
    pBullets.length = 0; eBullets.length = 0; enemies.length = 0;
    pickups.length = 0; particles.length = 0; shockwaves.length = 0;
    floatTexts.length = 0; quips.length = 0; boss = null;
    bossHud.classList.add("hidden");
    endModal.classList.add("hidden");
    bannerTitle = tx().stageIntro(1, tx().stages[0]);
    bannerSub = "";
    bannerTimer = 2.6;
    spawnPickup(vw * 0.5, vh * 0.24, "popcorn");
    renderHud();
  }
  btnRestart.addEventListener("click", resetGame);

  function damagePlayer() {
    if (player.invuln > 0 || player.shieldTime > 0 || gameOver) return;
    player.hp -= 1;
    player.invuln = 1.5;
    player.wpnLv = Math.max(1, player.wpnLv - 1);
    shake = 14;
    spawnBoom(player.x, player.y, "#ff5768", 18, false);
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
      const count = Math.min(6, lv + 1);
      for (let i = 0; i < count; i++) {
        const spread = (i - (count - 1) / 2) * 0.14;
        pBullets.push({
          kind: "popcorn", x: player.x + spread * 46, y: player.y - 26,
          vx: Math.sin(spread) * 560, vy: -Math.cos(spread) * 620,
          r: 7 + lv * 0.5, dmg: 10 + lv * 2
        });
      }
      player.fireCd = 0.145;
    } else if (w.id === "rainbow") {
      const lanes = lv >= 4 ? [-18, 0, 18] : lv >= 2 ? [-12, 12] : [0];
      lanes.forEach(dx => {
        pBullets.push({
          kind: "rainbow", x: player.x + dx, y: player.y - 32,
          vx: 0, vy: -860, r: 8 + lv, dmg: 16 + lv * 3
        });
      });
      player.fireCd = 0.13;
    } else {
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

  // =========================================================
  // 創意搞笑主題敵人＋多變化隨機隊形（不同關卡有完全不同敵人與行為！）
  // =========================================================
  function makeEnemy(kind, x, y, vx, vy) {
    const baseHp = kind === "copier" ? 56 : kind === "toaster" ? 52 : kind === "dinoegg" ? 44 : kind === "chair" ? 30 : 26;
    return {
      kind, x, y, vx, vy,
      hp: baseHp + stageNum * 10,
      maxHp: baseHp + stageNum * 10,
      size: (kind === "copier" || kind === "toaster") ? 64 : (kind === "ptero" ? 62 : 52),
      score: (kind === "copier" || kind === "toaster") ? 360 : 180,
      phase: Math.random() * 6.28,
      rot: 0,
      hatched: false,
      fireCd: 0.75 + Math.random() * 0.85,
      hitFlash: 0
    };
  }

  function spawnWave() {
    if (stageClearTimer > 0) return;
    const stIdx = (stageNum - 1) % 3;
    if (waveNum <= 3) {
      // 隨機挑選 4 種進場隊形（V字編隊／左右夾擊俯衝／斜線突襲／中路重裝護衛）
      const pattern = Math.floor(Math.random() * 4);
      const pools = [
        ["copier", "chair", "catufo", "toaster"],     // 關卡 1：辦公室暴走團
        ["ptero", "dinoegg", "toaster", "catufo"],    // 關卡 2：恐龍水上樂園
        ["catufo", "copier", "ptero", "chair"]        // 關卡 3：星光夜市大亂鬥
      ];
      const pool = pools[stIdx];
      const count = 4 + waveNum + Math.min(3, stageNum);

      if (pattern === 0) {
        // V 字編隊
        for (let i = 0; i < count; i++) {
          const k = pool[i % pool.length];
          const norm = (i / Math.max(1, count - 1)) - 0.5;
          enemies.push(makeEnemy(k, vw * (0.5 + norm * 0.78), -50 - Math.abs(norm) * 140, 0, k === "copier" ? 72 : 108));
        }
      } else if (pattern === 1) {
        // 左右兩側俯衝進場（翼龍／旋轉椅超適合！）
        for (let i = 0; i < count; i++) {
          const left = i % 2 === 0;
          const k = stIdx === 1 ? "ptero" : stIdx === 0 ? "chair" : pool[i % pool.length];
          enemies.push(makeEnemy(k, left ? -30 : vw + 30, 80 + i * 42, left ? 125 : -125, 68));
        }
      } else if (pattern === 2) {
        // 交錯波浪伏擊
        for (let i = 0; i < count; i++) {
          const k = pool[(i + waveNum) % pool.length];
          enemies.push(makeEnemy(k, 48 + Math.random() * (vw - 96), -48 - i * 64, (Math.random() - 0.5) * 40, 96));
        }
      } else {
        // 重裝核心＋兩翼護衛
        const heavy = stIdx === 0 ? "copier" : stIdx === 1 ? "dinoegg" : "toaster";
        enemies.push(makeEnemy(heavy, vw * 0.5, -60, 0, 66));
        for (let i = 0; i < count - 1; i++) {
          const side = i % 2 === 0 ? -1 : 1;
          const k = pool[(i + 1) % pool.length];
          enemies.push(makeEnemy(k, vw * 0.5 + side * (75 + Math.floor(i / 2) * 52), -95 - i * 44, side * -18, 102));
        }
      }
      waveNum += 1;
      renderHud();
    } else if (!boss) {
      const bossKinds = ["boss_chair", "boss_dino", "boss_boba"];
      const bKind = bossKinds[stIdx];
      boss = {
        kind: bKind,
        x: vw * 0.5, y: -115, targetY: Math.min(195, vh * 0.25),
        hp: 520 + stageNum * 220, maxHp: 520 + stageNum * 220,
        phase: 1, size: Math.min(188, vw * 0.46),
        fireCd: 0.85, quipCd: 2.8, hitFlash: 0, spin: 0
      };
      bossHud.classList.remove("hidden");
      bannerTitle = tx().bossWarn(tx().bossNames[stIdx]);
      bannerSub = "";
      bannerTimer = 2.2;
      renderHud();
    }
  }

  function triggerStageClear() {
    if (!boss) return;
    spawnBoom(boss.x, boss.y, "#ffd84d", 48, true);
    // 過關雙側慶典彩砲！
    for (let k = 0; k < 28; k++) {
      const left = k % 2 === 0;
      particles.push({
        x: left ? 14 : vw - 14, y: vh * 0.72,
        vx: (left ? 1 : -1) * (120 + Math.random() * 210),
        vy: -260 - Math.random() * 240,
        r: 4 + Math.random() * 4,
        color: ["#ff5768", "#ffd84d", "#38e0a8", "#34c6ff", "#c084fc"][k % 5],
        life: 1.4 + Math.random() * 0.6, maxLife: 2.0
      });
    }
    spawnPickup(boss.x - 44, boss.y, "cake");
    spawnPickup(boss.x, boss.y - 12, "chili");
    spawnPickup(boss.x + 44, boss.y, "bubble");
    score += 2000 * stageNum;
    kills += 1;
    boss = null;
    eBullets.length = 0;
    bossHud.classList.add("hidden");

    const clearedStage = stageNum;
    prevStageIdx = (stageNum - 1) % 3;
    stageNum += 1;
    waveNum = 1;
    waveTimer = 0;
    bgFade = 0;
    stageClearTimer = 3.0;
    stageClearJustFinished = clearedStage;
    playStageClearFanfare();
    const nextName = tx().stages[(stageNum - 1) % 3];
    bannerTitle = tx().stageClearTitle(clearedStage);
    bannerSub = tx().stageNextSub(stageNum, nextName);
    bannerTimer = 3.0;
    renderHud();
  }

  window.__cuteplaneDebug = {
    getState: () => ({
      score, kills, stageNum, waveNum, bgmRunning, soundOn,
      activeTrackKey, stageClearTimer,
      pickups: pickups.length, enemies: enemies.length,
      enemyKinds: [...new Set(enemies.map(e => e.kind))],
      boss: boss ? boss.kind : null,
      hp: player.hp, wpn: WEAPONS[player.wpnIdx].id,
      playerX: Math.round(player.x), playerY: Math.round(player.y),
      lollipopHead: getLollipopHeadPos(),
      bounds: getPlayerBounds()
    }),
    spawnShowcase: (stageTarget) => {
      if (stageTarget) {
        prevStageIdx = (stageNum - 1) % 3;
        stageNum = stageTarget;
        bgFade = 1;
      }
      enemies.length = 0;
      eBullets.length = 0;
      pickups.length = 0;
      boss = null;
      bossHud.classList.add("hidden");
      const stIdx = (stageNum - 1) % 3;
      if (stIdx === 0) {
        enemies.push(makeEnemy("copier", vw * 0.28, vh * 0.30, 0, 20));
        enemies.push(makeEnemy("chair", vw * 0.72, vh * 0.34, 0, 20));
        eBullets.push({ x: vw * 0.34, y: vh * 0.44, vx: 0, vy: 35, r: 7, kind: "memo" });
        eBullets.push({ x: vw * 0.64, y: vh * 0.47, vx: 0, vy: 35, r: 7, kind: "pink" });
        spawnQuip(vw * 0.28, vh * 0.23, tx().quipsByEnemy.copier[0]);
      } else if (stIdx === 1) {
        enemies.push(makeEnemy("ptero", vw * 0.26, vh * 0.30, 10, 15));
        const egg = makeEnemy("dinoegg", vw * 0.72, vh * 0.34, 0, 15);
        egg.hatched = true;
        enemies.push(egg);
        eBullets.push({ x: vw * 0.42, y: vh * 0.46, vx: 0, vy: 35, r: 7, kind: "toast" });
        eBullets.push({ x: vw * 0.58, y: vh * 0.48, vx: 0, vy: 35, r: 7, kind: "pink" });
        spawnQuip(vw * 0.72, vh * 0.26, tx().quipsByEnemy.dinoegg[1]);
      } else {
        boss = { kind: "boss_boba", x: vw * 0.5, y: vh * 0.24, targetY: vh * 0.24, hp: 400, maxHp: 800, phase: 2, size: Math.min(182, vw * 0.46), fireCd: 2, quipCd: 3, hitFlash: 0, spin: 0 };
        bossHud.classList.remove("hidden");
        eBullets.push({ x: vw * 0.35, y: vh * 0.43, vx: 0, vy: 35, r: 7, kind: "boba" });
        eBullets.push({ x: vw * 0.65, y: vh * 0.43, vx: 0, vy: 35, r: 7, kind: "pink" });
      }
      ["popcorn", "rainbow", "boba", "chili", "cake", "bubble"].forEach((tp, i) => {
        pickups.push({ x: vw * (0.18 + (i % 3) * 0.32), y: vh * (0.40 + Math.floor(i / 3) * 0.13), vy: 8, type: tp, phase: i });
      });
      renderHud();
    },
    triggerBossClearDemo: () => {
      if (!boss) {
        const stIdx = (stageNum - 1) % 3;
        boss = { kind: ["boss_chair", "boss_dino", "boss_boba"][stIdx], x: vw * 0.5, y: vh * 0.24, targetY: vh * 0.24, hp: 10, maxHp: 500, phase: 3, size: 170, fireCd: 2, quipCd: 3, hitFlash: 0, spin: 0 };
      }
      boss.hp = 0;
      triggerStageClear();
    }
  };

  // =========================================================
  // 主題造型繪製函式：漫畫雲朵氣泡、創意敵人、頭目、棒棒糖把手
  // =========================================================
  function drawCloudBubble(x, y, text, subText = "", fill = "#fffdf5", stroke = "#3a1f12") {
    ctx.save();
    ctx.font = "900 13px 'Microsoft JhengHei', sans-serif";
    const w1 = ctx.measureText(text).width;
    ctx.font = "800 11.5px 'Microsoft JhengHei', sans-serif";
    const w2 = subText ? ctx.measureText(subText).width : 0;
    const bw = Math.min(vw - 24, Math.max(120, Math.max(w1, w2) + 38));
    const bh = subText ? 56 : 36;
    const cx = Math.max(bw * 0.5 + 10, Math.min(vw - bw * 0.5 - 10, x));
    const cy = y;

    // 雲朵外圈（重疊圓弧形成可愛蓬鬆雲朵，絕非單調方框！）
    const puffs = [
      { dx: -bw * 0.38, dy: 0, r: bh * 0.44 },
      { dx: -bw * 0.16, dy: -bh * 0.14, r: bh * 0.48 },
      { dx: bw * 0.16, dy: -bh * 0.14, r: bh * 0.48 },
      { dx: bw * 0.38, dy: 0, r: bh * 0.44 },
      { dx: -bw * 0.22, dy: bh * 0.14, r: bh * 0.42 },
      { dx: bw * 0.22, dy: bh * 0.14, r: bh * 0.42 }
    ];
    // 先畫深色描邊層
    ctx.fillStyle = stroke;
    puffs.forEach(p => {
      ctx.beginPath();
      ctx.arc(cx + p.dx, cy + p.dy, p.r + 3, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillRect(cx - bw * 0.36, cy - bh * 0.44 - 3, bw * 0.72, bh * 0.88 + 6);
    // 再填內層奶油白雲朵
    ctx.fillStyle = fill;
    puffs.forEach(p => {
      ctx.beginPath();
      ctx.arc(cx + p.dx, cy + p.dy, p.r, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.fillRect(cx - bw * 0.36, cy - bh * 0.44, bw * 0.72, bh * 0.88);

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "#2b1810";
    ctx.font = "900 13px 'Microsoft JhengHei', sans-serif";
    ctx.fillText(text, cx, subText ? cy - 9 : cy, bw - 22);
    if (subText) {
      ctx.fillStyle = "#c2410c";
      ctx.font = "900 11.5px 'Microsoft JhengHei', sans-serif";
      ctx.fillText(subText, cx, cy + 11, bw - 22);
    }
    ctx.restore();
  }

  function drawCreativeEnemy(e, t) {
    ctx.save();
    ctx.translate(e.x, e.y);
    ctx.shadowColor = "rgba(32, 18, 12, 0.48)";
    ctx.shadowBlur = 8;
    if (e.hitFlash > 0) ctx.filter = "brightness(1.75)";

    if (e.kind === "copier") {
      // 暴走影印機（震動＋閃爍紅燈＋張嘴噴公文！）
      const jib = Math.sin(t * 42 + e.phase) * 2.5;
      ctx.translate(jib, 0);
      ctx.fillStyle = "#e2e8f0";
      ctx.strokeStyle = "#231814";
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(-28, -24, 56, 48, 8);
      ctx.fill(); ctx.stroke();
      // 上蓋掃描玻璃
      ctx.fillStyle = "#7dd3fc";
      ctx.fillRect(-20, -18, 40, 12);
      ctx.strokeRect(-20, -18, 40, 12);
      // 閃爍卡紙紅燈
      ctx.fillStyle = Math.floor(t * 10) % 2 === 0 ? "#ff2e4c" : "#ffd166";
      ctx.beginPath(); ctx.arc(17, -12, 4, 0, Math.PI * 2); ctx.fill();
      // 怒氣眼睛與出紙嘴
      ctx.fillStyle = "#231814";
      ctx.beginPath(); ctx.arc(-9, 3, 4, 0, Math.PI * 2); ctx.arc(9, 3, 4, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(-14, 12, 28, 10);
      ctx.strokeRect(-14, 12, 28, 10);
    } else if (e.kind === "chair") {
      // 瘋狂旋轉辦公椅（五爪滑輪＋鮮紅坐墊旋轉！）
      ctx.rotate(e.rot);
      ctx.strokeStyle = "#231814";
      ctx.lineWidth = 3.5;
      for (let i = 0; i < 5; i++) {
        const a = (Math.PI * 2 * i) / 5;
        ctx.beginPath(); ctx.moveTo(0, 0); ctx.lineTo(Math.cos(a) * 26, Math.sin(a) * 26); ctx.stroke();
        ctx.fillStyle = "#475569";
        ctx.beginPath(); ctx.arc(Math.cos(a) * 26, Math.sin(a) * 26, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      }
      ctx.fillStyle = "#ff4d6d";
      ctx.beginPath(); ctx.arc(0, 0, 17, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fffdf5";
      ctx.beginPath(); ctx.arc(-5, -4, 3.5, 0, Math.PI * 2); ctx.arc(5, -4, 3.5, 0, Math.PI * 2); ctx.fill();
    } else if (e.kind === "ptero") {
      // 暴衝翼龍（拍動大翅膀＋可愛尖嘴！）
      const flap = Math.sin(t * 18 + e.phase) * 10;
      ctx.fillStyle = "#34d399";
      ctx.strokeStyle = "#1c2b22";
      ctx.lineWidth = 3;
      // 雙翼
      ctx.beginPath();
      ctx.moveTo(0, -6);
      ctx.quadraticCurveTo(-24, -18 + flap, -34, 4 + flap);
      ctx.lineTo(-10, 10);
      ctx.lineTo(10, 10);
      ctx.lineTo(34, 4 + flap);
      ctx.quadraticCurveTo(24, -18 + flap, 0, -6);
      ctx.closePath();
      ctx.fill(); ctx.stroke();
      // 頭冠與橘色大嘴
      ctx.fillStyle = "#fb923c";
      ctx.beginPath(); ctx.moveTo(-7, 6); ctx.lineTo(0, 26); ctx.lineTo(7, 6); ctx.closePath(); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#fff";
      ctx.beginPath(); ctx.arc(-6, 0, 4.5, 0, Math.PI * 2); ctx.arc(6, 0, 4.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#1c2b22";
      ctx.beginPath(); ctx.arc(-6, 1, 2, 0, Math.PI * 2); ctx.arc(6, 1, 2, 0, Math.PI * 2); ctx.fill();
    } else if (e.kind === "dinoegg") {
      // 滾滾恐龍蛋（受損過半會破殼蹦出暴走小暴龍！）
      ctx.rotate(Math.sin(t * 10 + e.phase) * 0.18);
      ctx.fillStyle = "#fef3c7";
      ctx.strokeStyle = "#2b1810";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.ellipse(0, 0, 20, 25, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#34d399";
      ctx.beginPath(); ctx.arc(-7, -7, 5, 0, Math.PI * 2); ctx.arc(8, 5, 6, 0, Math.PI * 2); ctx.fill();
      if (e.hatched) {
        // 破殼蹦出小暴龍臉！
        ctx.fillStyle = "#22c55e";
        ctx.beginPath(); ctx.arc(0, -14, 13, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-4, -15, 3.5, 0, Math.PI * 2); ctx.arc(4, -15, 3.5, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#1c2b22";
        ctx.beginPath(); ctx.arc(-4, -15, 1.8, 0, Math.PI * 2); ctx.arc(4, -15, 1.8, 0, Math.PI * 2); ctx.fill();
      }
    } else {
      const im = imgs[e.kind === "toaster" ? "enemy2" : "enemy1"];
      if (im && im.complete && im.naturalWidth > 0) {
        const asp = im.naturalWidth / im.naturalHeight;
        ctx.drawImage(im, -e.size * asp * 0.5, -e.size * 0.5, e.size * asp, e.size);
      }
    }
    ctx.restore();
  }

  function drawCreativeBoss(b, t) {
    ctx.save();
    ctx.translate(b.x, b.y + Math.sin(t * 3) * 4);
    ctx.shadowColor = "rgba(28, 14, 10, 0.58)";
    ctx.shadowBlur = 12;
    if (b.hitFlash > 0) ctx.filter = "brightness(1.75)";

    if (b.kind === "boss_chair") {
      // 關卡 1 頭目：巨無霸主管旋轉椅・總監號
      ctx.rotate(Math.sin(t * 2.4) * 0.12);
      ctx.fillStyle = "#b91c1c";
      ctx.strokeStyle = "#2b1208";
      ctx.lineWidth = 4;
      // 豪華寬大椅背與扶手砲
      ctx.beginPath(); ctx.roundRect(-72, -56, 144, 92, 24); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#f59e0b";
      ctx.beginPath(); ctx.roundRect(-88, -16, 22, 58, 10); ctx.roundRect(66, -16, 22, 58, 10); ctx.fill(); ctx.stroke();
      // 主管西裝領帶＋怒眼
      ctx.fillStyle = "#fffdf5";
      ctx.beginPath(); ctx.arc(-22, -8, 14, 0, Math.PI * 2); ctx.arc(22, -8, 14, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.fillStyle = "#2b1208";
      ctx.beginPath(); ctx.arc(-20, -6, 6, 0, Math.PI * 2); ctx.arc(20, -6, 6, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#ffd84d";
      ctx.beginPath(); ctx.moveTo(-24, -56); ctx.lineTo(-14, -78); ctx.lineTo(0, -64); ctx.lineTo(14, -78); ctx.lineTo(24, -56); ctx.closePath(); ctx.fill(); ctx.stroke();
    } else if (b.kind === "boss_dino") {
      // 關卡 2 頭目：暴龍泳圈大王（戴墨鏡＋套超大黃色小鴨泳圈！）
      ctx.strokeStyle = "#1c2b22";
      ctx.lineWidth = 4;
      // 黃色游泳圈
      ctx.fillStyle = "#ffd84d";
      ctx.beginPath(); ctx.ellipse(0, 12, 82, 46, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 綠色胖暴龍頭身
      ctx.fillStyle = "#22c55e";
      ctx.beginPath(); ctx.ellipse(0, -10, 56, 48, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      // 酷炫墨鏡
      ctx.fillStyle = "#1e293b";
      ctx.beginPath(); ctx.roundRect(-38, -26, 32, 18, 6); ctx.roundRect(6, -26, 32, 18, 6); ctx.fill(); ctx.stroke();
      // 大白牙笑嘴
      ctx.fillStyle = "#fffdf5";
      ctx.beginPath(); ctx.arc(0, 8, 22, 0, Math.PI); ctx.fill(); ctx.stroke();
    } else if (imgs.boss.complete && imgs.boss.naturalWidth > 0) {
      const asp = imgs.boss.naturalWidth / imgs.boss.naturalHeight;
      ctx.drawImage(imgs.boss, -b.size * asp * 0.5, -b.size * 0.5, b.size * asp, b.size);
    }
    ctx.restore();
  }

  // 繪製連接飛機尾端的「真實互動棒棒糖操控把手」
  function drawLollipopHandle(t) {
    const tailX = player.x;
    const tailY = player.y + 30;
    const head = getLollipopHeadPos();
    const gripScale = lollipopGrabbed ? 1.14 : (1.0 + Math.sin(t * 4.5) * 0.04);

    ctx.save();
    // 1. 粉白條紋糖棒（從飛機尾端接到棒棒糖頭）
    ctx.strokeStyle = "#3a1f12";
    ctx.lineWidth = 9;
    ctx.lineCap = "round";
    ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(head.x, head.y); ctx.stroke();

    ctx.strokeStyle = "#fffdf5";
    ctx.lineWidth = 5.5;
    ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(head.x, head.y); ctx.stroke();

    ctx.strokeStyle = "#ff7aa2";
    ctx.lineWidth = 4;
    ctx.setLineDash([6, 6]);
    ctx.beginPath(); ctx.moveTo(tailX, tailY); ctx.lineTo(head.x, head.y); ctx.stroke();
    ctx.setLineDash([]);

    // 2. 彩色棒棒糖頭（按住拖曳把手！）
    ctx.translate(head.x, head.y);
    ctx.scale(gripScale, gripScale);
    if (lollipopGrabbed) {
      ctx.strokeStyle = "rgba(255, 255, 255, 0.85)";
      ctx.lineWidth = 3;
      ctx.beginPath(); ctx.arc(0, 0, LOLLIPOP_R + 7, 0, Math.PI * 2); ctx.stroke();
    }
    // 糖果底圓＋深色外框
    ctx.fillStyle = "#ff5789";
    ctx.strokeStyle = "#3a1f12";
    ctx.lineWidth = 3.2;
    ctx.beginPath(); ctx.arc(0, 0, LOLLIPOP_R, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
    // 旋轉雙色螺旋糖紋（超可愛！）
    ctx.save();
    ctx.rotate(t * (lollipopGrabbed ? 4.5 : 1.8));
    const swirlColors = ["#ffd84d", "#fffdf5", "#48cae4"];
    for (let s = 0; s < 3; s++) {
      ctx.rotate((Math.PI * 2) / 3);
      ctx.strokeStyle = swirlColors[s];
      ctx.lineWidth = 4.2;
      ctx.lineCap = "round";
      ctx.beginPath();
      for (let a = 0; a < 2.6; a += 0.2) {
        const rr = a * 7.2;
        if (a === 0) ctx.moveTo(0, 0);
        else ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
      }
      ctx.stroke();
    }
    ctx.restore();
    // 糖果亮面高光點
    ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
    ctx.beginPath(); ctx.ellipse(-7, -8, 6, 3.2, -0.6, 0, Math.PI * 2); ctx.fill();
    ctx.restore();
  }

  // --- 清淡乾淨柔和粉彩背景繪製（完全撤掉灰濁深色遮罩！）---
  const PASTEL_STAGES = [
    { filter: "saturate(0.60) contrast(0.84) brightness(1.07)", wash: "rgba(214, 242, 255, 0.16)" }, // 關卡1：清爽淡藍奶油
    { filter: "saturate(0.62) contrast(0.85) brightness(1.05)", wash: "rgba(205, 252, 240, 0.15)" }, // 關卡2：清透薄荷水藍
    { filter: "saturate(0.76) contrast(0.90) brightness(1.02)", wash: "rgba(232, 214, 255, 0.08)" }  // 關卡3：柔和星光薰衣草
  ];

  function drawBgLayer(img, alpha, stageIdx) {
    if (!img || !img.complete || img.naturalWidth <= 0 || alpha <= 0) return;
    const cfg = PASTEL_STAGES[stageIdx % 3];
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.filter = cfg.filter;
    const scale = Math.max(vw / img.naturalWidth, vh / img.naturalHeight);
    const dw = img.naturalWidth * scale;
    const dh = img.naturalHeight * scale;
    const dx = (vw - dw) * 0.5;
    const cycle = dh * 2;
    const off = bgScroll % cycle;
    for (let k = -1; k <= 1; k++) {
      const yA = off + k * cycle - dh;
      if (yA < vh && yA + dh > 0) ctx.drawImage(img, dx, yA, dw, dh);
      const yB = off + k * cycle;
      if (yB < vh && yB + dh > 0) {
        ctx.save(); ctx.translate(0, yB + dh); ctx.scale(1, -1);
        ctx.drawImage(img, dx, 0, dw, dh);
        ctx.restore();
      }
    }
    ctx.restore();
  }

  resetGame();

  // --- 主迴圈 (60fps) ---
  let lastT = performance.now();
  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const t = now * 0.001;

    if (!gameOver) {
      const kSpd = 380;
      if (keys.ArrowLeft || keys.KeyA) player.tx -= kSpd * dt;
      if (keys.ArrowRight || keys.KeyD) player.tx += kSpd * dt;
      if (keys.ArrowUp || keys.KeyW) player.ty -= kSpd * dt;
      if (keys.ArrowDown || keys.KeyS) player.ty += kSpd * dt;
      clampPlayerTarget();

      const dx = player.tx - player.x;
      const dy = player.ty - player.y;
      const followRate = lollipopGrabbed ? 28 : 20;
      player.x += dx * Math.min(1, dt * followRate);
      player.y += dy * Math.min(1, dt * followRate);
      player.tilt = Math.max(-0.22, Math.min(0.22, dx * 0.006));

      if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
      if (hitTickCd > 0) hitTickCd = Math.max(0, hitTickCd - dt);
      if (player.shieldTime > 0) {
        player.shieldTime = Math.max(0, player.shieldTime - dt);
        if (player.shieldTime === 0) renderHud();
      }
      if (player.shieldCd > 0) {
        const prevS = Math.ceil(player.shieldCd);
        player.shieldCd = Math.max(0, player.shieldCd - dt);
        if (Math.ceil(player.shieldCd) !== prevS) renderHud();
      }

      if (stageClearTimer > 0) {
        stageClearTimer = Math.max(0, stageClearTimer - dt);
      } else {
        player.fireCd -= dt;
        if (player.fireCd <= 0) firePlayerWeapon();

        if (enemies.length === 0 && !boss) {
          waveTimer += dt;
          if (waveTimer >= 0.85) {
            waveTimer = 0;
            spawnWave();
          }
        }
      }

      // 更新玩家子彈
      for (let i = pBullets.length - 1; i >= 0; i--) {
        const b = pBullets[i];
        if (b.homing) {
          let tgt = boss || null, bestD = Infinity;
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
        b.x += b.vx * dt; b.y += b.vy * dt;
        if (b.y < -40 || b.y > vh + 40 || b.x < -40 || b.x > vw + 40) { pBullets.splice(i, 1); continue; }

        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.size * 0.44 + b.r) {
            e.hp -= b.dmg; e.hitFlash = 0.08; hit = true;
            if (hitTickCd <= 0) { sfxHitTick(); hitTickCd = 0.06; }
            if (e.kind === "dinoegg" && !e.hatched && e.hp < e.maxHp * 0.55) {
              e.hatched = true;
              spawnQuip(e.x, e.y - 26, tx().quipsByEnemy.dinoegg[1]);
            }
            if (e.hp <= 0) {
              spawnBoom(e.x, e.y, "#ffd84d", 14, false);
              score += e.score; kills += 1;
              if (Math.random() < 0.36) spawnPickup(e.x, e.y);
              if (Math.random() < 0.30) {
                const ql = tx().quipsByEnemy[e.kind] || tx().quipsByEnemy.catufo;
                spawnQuip(e.x, e.y - 18, ql[Math.floor(Math.random() * ql.length)]);
              }
              enemies.splice(j, 1);
              renderHud();
            }
            break;
          }
        }
        if (!hit && boss && Math.hypot(b.x - boss.x, b.y - boss.y) < boss.size * 0.44 + b.r) {
          boss.hp -= b.dmg; boss.hitFlash = 0.06; hit = true; score += 10;
          if (hitTickCd <= 0) { sfxHitTick(); hitTickCd = 0.06; }
          bossFill.style.width = Math.max(0, (boss.hp / boss.maxHp) * 100) + "%";
        }
        if (hit) pBullets.splice(i, 1);
      }

      // 更新頭目
      if (boss) {
        if (boss.y < boss.targetY) boss.y += 120 * dt;
        else boss.x = vw * 0.5 + Math.sin(t * (1.25 + boss.phase * 0.35)) * Math.min(125, vw * 0.27);
        if (boss.hitFlash > 0) boss.hitFlash = Math.max(0, boss.hitFlash - dt);

        const ratio = boss.hp / boss.maxHp;
        const newPhase = ratio < 0.35 ? 3 : ratio < 0.7 ? 2 : 1;
        const bIdx = (stageNum - 1) % 3;
        if (newPhase !== boss.phase) {
          boss.phase = newPhase;
          spawnBoom(boss.x, boss.y, "#ff70d9", 22, true);
          const bq = tx().bossQuips[bIdx];
          spawnQuip(boss.x, boss.y - 52, bq[Math.floor(Math.random() * bq.length)]);
          renderHud();
        }
        boss.quipCd -= dt;
        if (boss.quipCd <= 0) {
          boss.quipCd = 3.8;
          const bq = tx().bossQuips[bIdx];
          spawnQuip(boss.x, boss.y - 52, bq[Math.floor(Math.random() * bq.length)]);
        }
        boss.fireCd -= dt;
        if (boss.fireCd <= 0 && boss.y >= boss.targetY - 10) {
          const count = 5 + boss.phase * 2;
          for (let i = 0; i < count; i++) {
            const ang = Math.PI * 0.22 + (Math.PI * 0.56 * i) / (count - 1) + Math.sin(t * 2) * 0.14;
            eBullets.push({
              x: boss.x, y: boss.y + 34,
              vx: Math.cos(ang) * (168 + boss.phase * 22),
              vy: Math.sin(ang) * (168 + boss.phase * 22),
              r: 7, kind: bIdx === 0 ? "memo" : bIdx === 1 ? "toast" : (i % 2 === 0 ? "boba" : "pink")
            });
          }
          boss.fireCd = Math.max(0.60, 1.15 - boss.phase * 0.17);
        }
        if (boss.hp <= 0) triggerStageClear();
      }

      // 更新敵人（各類型有專屬動作與彈幕）
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.kind === "chair") {
          e.rot += 9.5 * dt;
          e.x += Math.sin(t * 4.2 + e.phase) * 95 * dt + e.vx * dt;
        } else if (e.kind === "ptero") {
          e.x += e.vx * dt + Math.sin(t * 5 + e.phase) * 55 * dt;
        } else {
          e.x += Math.sin(t * 3 + e.phase) * (e.kind === "catufo" ? 75 : 28) * dt + e.vx * dt;
        }
        e.y += e.vy * dt;
        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
        e.fireCd -= dt;
        if (e.fireCd <= 0 && e.y > 42 && e.y < vh * 0.62) {
          const ang = Math.atan2(player.y - e.y, player.x - e.x);
          if (e.kind === "copier") {
            // 暴走影印機：一次扇形噴 3 張公文彈！
            for (const da of [-0.25, 0, 0.25]) {
              eBullets.push({ x: e.x, y: e.y + 20, vx: Math.cos(ang + da) * 185, vy: Math.sin(ang + da) * 185, r: 7, kind: "memo" });
            }
            e.fireCd = 1.65;
          } else {
            eBullets.push({
              x: e.x, y: e.y + 18,
              vx: Math.cos(ang) * (e.hatched ? 230 : 195),
              vy: Math.sin(ang) * (e.hatched ? 230 : 195),
              r: 6.5, kind: e.kind === "toaster" ? "toast" : "pink"
            });
            e.fireCd = e.hatched ? 0.95 : 1.55;
          }
        }
        // 只判定飛機本體核心（棒棒糖把手完全不增加受傷判定！）
        if (Math.hypot(e.x - player.x, e.y - player.y) < e.size * 0.38 + 13) {
          damagePlayer();
          spawnBoom(e.x, e.y, "#ff5768", 12, false);
          enemies.splice(i, 1);
          continue;
        }
        if (e.y > vh + 80 || e.x < -120 || e.x > vw + 120) enemies.splice(i, 1);
      }

      // 更新敵彈（只判定飛機本體核心，不判定棒棒糖把手！）
      for (let i = eBullets.length - 1; i >= 0; i--) {
        const eb = eBullets[i];
        eb.x += eb.vx * dt; eb.y += eb.vy * dt;
        if (eb.y < -30 || eb.y > vh + 30 || eb.x < -30 || eb.x > vw + 30) { eBullets.splice(i, 1); continue; }
        if (Math.hypot(eb.x - player.x, eb.y - player.y) < eb.r + (player.shieldTime > 0 ? 38 : 10)) {
          if (player.shieldTime > 0) {
            spawnBoom(eb.x, eb.y, "#48cae4", 6, false);
            eBullets.splice(i, 1);
          } else {
            eBullets.splice(i, 1);
            damagePlayer();
          }
        }
      }

      // 更新 6 款實繪寶物
      for (let i = pickups.length - 1; i >= 0; i--) {
        const pk = pickups[i];
        pk.y += pk.vy * dt;
        pk.x += Math.sin(t * 4 + pk.phase) * 30 * dt;
        if (Math.hypot(pk.x - player.x, pk.y - player.y) < 42) {
          sfxPickup();
          const tCopy = tx().pickups;
          if (pk.type === "chili") player.bombs = Math.min(6, player.bombs + 1);
          else if (pk.type === "cake") player.hp = Math.min(player.maxHp, player.hp + 1);
          else if (pk.type === "bubble") player.shieldTime = Math.max(player.shieldTime, 4.5);
          else {
            const idx = WEAPONS.findIndex(w => w.id === pk.type);
            if (player.wpnIdx === idx) player.wpnLv = Math.min(5, player.wpnLv + 1);
            else { player.wpnIdx = idx; player.wpnLv = Math.min(5, Math.max(2, player.wpnLv)); }
          }
          floatTexts.push({ x: player.x, y: player.y - 36, text: tCopy[pk.type] || "UP!", color: "#fffdf5", life: 1.15, maxLife: 1.15 });
          spawnBoom(pk.x, pk.y, TREASURES[pk.type]?.glow || "#ffd84d", 10, false);
          renderHud();
          pickups.splice(i, 1);
          continue;
        }
        if (pk.y > vh + 50) pickups.splice(i, 1);
      }
    }

    bgScroll += 100 * dt;
    if (bgFade < 1) bgFade = Math.min(1, bgFade + dt * 0.75);
    if (shake > 0) shake = Math.max(0, shake - dt * 52);
    if (bombFlash > 0) bombFlash = Math.max(0, bombFlash - dt * 1.8);
    if (bannerTimer > 0) bannerTimer = Math.max(0, bannerTimer - dt);

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i]; p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      shockwaves[i].life -= dt;
      if (shockwaves[i].life <= 0) shockwaves.splice(i, 1);
    }
    for (let i = floatTexts.length - 1; i >= 0; i--) {
      floatTexts[i].life -= dt; floatTexts[i].y -= 36 * dt;
      if (floatTexts[i].life <= 0) floatTexts.splice(i, 1);
    }
    for (let i = quips.length - 1; i >= 0; i--) {
      quips[i].life -= dt; quips[i].y -= 14 * dt;
      if (quips[i].life <= 0) quips.splice(i, 1);
    }

    // --- 繪製 ---
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    // 1. 清淡乾淨柔和粉彩背景（完全沒有灰灰壓暗遮罩！）
    const bgKeys = ["bg1", "bg2", "bg3"];
    const curIdx = (stageNum - 1) % 3;
    if (bgFade < 1) drawBgLayer(imgs[bgKeys[prevStageIdx]], 1, prevStageIdx);
    drawBgLayer(imgs[bgKeys[curIdx]], bgFade, curIdx);
    ctx.fillStyle = PASTEL_STAGES[curIdx].wash;
    ctx.fillRect(0, 0, vw, vh);

    // 2. 6 款實繪寶物（鮮豔實色＋深色投影輪廓）
    for (const pk of pickups) {
      const def = TREASURES[pk.type] || TREASURES.popcorn;
      const im = imgs[def.img];
      ctx.save();
      ctx.translate(pk.x, pk.y + Math.sin(t * 6 + pk.phase) * 3);
      ctx.rotate(Math.sin(t * 3.5 + pk.phase) * 0.14);
      ctx.shadowColor = "rgba(35, 18, 10, 0.55)";
      ctx.shadowBlur = 6;
      if (im && im.complete && im.naturalWidth > 0) {
        const s = 48, asp = im.naturalWidth / im.naturalHeight;
        const w = asp >= 1 ? s : s * asp, h = asp >= 1 ? s / asp : s;
        ctx.drawImage(im, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();
    }

    // 3. 鮮豔實色玩家子彈（粗深色外框，最亮背景區也清晰無比！）
    for (const b of pBullets) {
      ctx.save();
      ctx.translate(b.x, b.y);
      if (b.kind === "rainbow") {
        const colors = ["#ff3864", "#ffbe0b", "#10b981", "#0ea5e9", "#9333ea"];
        ctx.fillStyle = colors[Math.floor((now * 0.02) % colors.length)];
        ctx.strokeStyle = "#1f0e2e";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.roundRect(-b.r * 0.55, -17, b.r * 1.1, 34, 6); ctx.fill(); ctx.stroke();
      } else if (b.kind === "boba") {
        ctx.fillStyle = "#3b1b0e";
        ctx.strokeStyle = "#ffbe0b";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, b.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fff";
        ctx.beginPath(); ctx.arc(-2.5, -2.5, 2.5, 0, Math.PI * 2); ctx.fill();
      } else {
        ctx.fillStyle = "#ffca28";
        ctx.strokeStyle = "#2b1206";
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.arc(0, 0, b.r + 0.5, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#fffdf5";
        ctx.beginPath(); ctx.arc(-2, -2, Math.max(2.2, b.r * 0.35), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // 4. 創意搞笑敵人與頭目
    for (const e of enemies) drawCreativeEnemy(e, t);
    if (boss) drawCreativeBoss(boss, t);

    // 5. 高對比實色敵彈（含暴走影印機公文彈＋深色實框高飽和危險彈！）
    for (const eb of eBullets) {
      ctx.save();
      ctx.translate(eb.x, eb.y);
      if (eb.kind === "memo") {
        ctx.rotate(t * 7 + eb.x);
        ctx.fillStyle = "#fffdf5";
        ctx.strokeStyle = "#d90429";
        ctx.lineWidth = 2.6;
        ctx.beginPath(); ctx.roundRect(-8, -10, 16, 20, 3); ctx.fill(); ctx.stroke();
        ctx.fillStyle = "#ef233c";
        ctx.fillRect(-4, -5, 8, 2.5);
        ctx.fillRect(-4, 0, 8, 2.5);
      } else {
        ctx.fillStyle = "#1f0510";
        ctx.beginPath(); ctx.arc(0, 0, eb.r + 3.2, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = eb.kind === "toast" ? "#ff6d00" : "#ff0054";
        ctx.beginPath(); ctx.arc(0, 0, eb.r + 1.0, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#ffffff";
        ctx.beginPath(); ctx.arc(0, 0, Math.max(2.6, eb.r * 0.42), 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();
    }

    // 6. 棒棒糖真實互動把手（畫在飛機底層，連接飛機尾端）＋ 柴犬英雄戰機
    if (!gameOver) {
      drawLollipopHandle(t);
      if (player.invuln <= 0 || Math.floor(now / 70) % 2 === 0) {
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);
        ctx.fillStyle = "#ff7b00";
        ctx.strokeStyle = "#3a1608";
        ctx.lineWidth = 2.2;
        ctx.beginPath(); ctx.ellipse(0, 32, 8, 11 + Math.sin(t * 45) * 3.5, 0, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        if (imgs.hero.complete && imgs.hero.naturalWidth > 0) {
          ctx.shadowColor = "rgba(35, 18, 10, 0.58)";
          ctx.shadowBlur = 8;
          const s = HERO_SIZE, asp = imgs.hero.naturalWidth / imgs.hero.naturalHeight;
          ctx.drawImage(imgs.hero, -s * asp * 0.5, -s * 0.5, s * asp, s);
        }
        if (player.shieldTime > 0) {
          ctx.shadowBlur = 0;
          ctx.strokeStyle = `hsla(${(now * 0.25) % 360}, 95%, 52%, 0.95)`;
          ctx.lineWidth = 4.5;
          ctx.fillStyle = "rgba(72, 202, 228, 0.22)";
          ctx.beginPath(); ctx.arc(0, 0, 45 + Math.sin(t * 10) * 2, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 7. 爆炸粒子與衝擊波
    for (const sw of shockwaves) {
      const p = 1 - sw.life / sw.maxLife;
      ctx.save(); ctx.globalAlpha = Math.max(0, 1 - p);
      ctx.strokeStyle = sw.color; ctx.lineWidth = 4.5 * (1 - p * 0.6);
      ctx.beginPath(); ctx.arc(sw.x, sw.y, sw.r + (sw.maxR - sw.r) * p, 0, Math.PI * 2); ctx.stroke();
      ctx.restore();
    }
    for (const p of particles) {
      ctx.save(); ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color; ctx.strokeStyle = "#2b1810"; ctx.lineWidth = 1.4;
      ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); ctx.stroke();
      ctx.restore();
    }

    // 8. 漫畫雲朵敵人對話泡
    for (const q of quips) {
      ctx.save(); ctx.globalAlpha = Math.min(1, q.life / 0.35);
      drawCloudBubble(q.x, q.y, q.text);
      ctx.restore();
    }

    // 9. 吃寶飄浮文字
    for (const f of floatTexts) {
      ctx.save(); ctx.globalAlpha = Math.min(1, f.life / 0.35);
      ctx.font = "900 15px 'Microsoft JhengHei', sans-serif";
      ctx.textAlign = "center"; ctx.lineWidth = 4.5; ctx.strokeStyle = "#2b1810";
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color; ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    // 10. 爆辣清場閃光與過關／進關雲朵慶祝大橫幅！
    if (bombFlash > 0) {
      ctx.fillStyle = `rgba(255, 224, 130, ${bombFlash * 0.5})`;
      ctx.fillRect(0, 0, vw, vh);
    }
    if (bannerTimer > 0 && bannerTitle) {
      ctx.save(); ctx.globalAlpha = Math.min(1, bannerTimer / 0.35);
      drawCloudBubble(vw * 0.5, vh * 0.36, bannerTitle, bannerSub, stageClearTimer > 0 ? "#fff5b8" : "#fffdf5", "#3a1f12");
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();
