(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const meritEl = document.getElementById("meritCount");
  const btnSound = document.getElementById("btnSound");
  const btnScene = document.getElementById("btnScene");
  const chipsRow = document.getElementById("chipsRow");
  const weaponRow = document.getElementById("weaponRow");
  const actionRow = document.getElementById("actionRow");
  const resultCard = document.getElementById("resultCard");
  const resultBadge = document.getElementById("resultBadge");
  const resultTitle = document.getElementById("resultTitle");
  const resultBody = document.getElementById("resultBody");
  const resultSub = document.getElementById("resultSub");
  const btnCloseResult = document.getElementById("btnCloseResult");

  // --- 高精細去背圖檔載入（WebP 輕量高速版 + 優先載入當前角色與對應解析度背景）---
  const assetUrls = {
    bg: "./assets/xinan-temple-bg-portrait-sunny.webp?v=20261121_sunny_v1",
    bgDesktop: "./assets/xinan-temple-bg-desktop-sunny.webp?v=20261121_sunny_v1",
    bgNight: "./assets/xinan-temple-bg-portrait-hd.webp?v=20261118_hd2k_v8",
    bgNightDesktop: "./assets/xinan-temple-bg-desktop-hd.webp?v=20261118_hd2k_v8",
    sceneOffice: "./assets/xinan-scene-office.webp?v=20261122_party_v1",
    sceneFestival: "./assets/xinan-scene-festival.webp?v=20261122_party_v1",
    sceneSkylantern: "./assets/xinan-scene-skylantern.webp?v=20261122_party_v1",
    sceneOraclehall: "./assets/xinan-scene-oraclehall.webp?v=20261122_party_v1",
    "weapon-slipper": "./assets/v2/weapon-slipper.webp",
    "weapon-clog": "./assets/v2/weapon-clog.webp",
    "weapon-mallet": "./assets/v2/weapon-mallet.webp",
    "weapon-fan": "./assets/v2/weapon-fan.webp",
    "bless-lantern": "./assets/v2/bless-lantern.webp",
    "bless-ingot": "./assets/v2/bless-ingot.webp",
    "bless-lotus": "./assets/v2/bless-lotus.webp",
    "bless-omamori": "./assets/v2/bless-omamori.webp",
    "oracle-tube": "./assets/v2/oracle-tube.webp",
    "oracle-blocks": "./assets/v2/oracle-blocks.webp",
    "oracle-stick": "./assets/v2/oracle-stick.webp",
    "oracle-censer": "./assets/v2/oracle-censer.webp",
    "3畝_normal": "./assets/office-fullbody-webp/3畝_normal.webp?v=20261121_3mu_v2",
    "3畝_happy": "./assets/office-fullbody-webp/3畝_happy.webp?v=20261121_3mu_v2",
    "3畝_hurt_cry": "./assets/office-fullbody-webp/3畝_hurt_cry.webp?v=20261121_3mu_v2",
    "3畝_innocent": "./assets/office-fullbody-webp/3畝_innocent.webp?v=20261121_3mu_v2",
    "Kenny_normal": "./assets/office-fullbody-webp/Kenny_normal.webp?v=20261118_hd2k_v8",
    "Kenny_happy": "./assets/office-fullbody-webp/Kenny_happy.webp?v=20261118_hd2k_v8",
    "Kenny_hurt_cry": "./assets/office-fullbody-webp/Kenny_hurt_cry.webp?v=20261118_hd2k_v8",
    "Kenny_innocent": "./assets/office-fullbody-webp/Kenny_innocent.webp?v=20261118_hd2k_v8",
    "Judy_normal": "./assets/office-fullbody-webp/Judy_normal.webp?v=20261118_hd2k_v8",
    "Judy_happy": "./assets/office-fullbody-webp/Judy_happy.webp?v=20261118_hd2k_v8",
    "Judy_hurt_cry": "./assets/office-fullbody-webp/Judy_hurt_cry.webp?v=20261118_hd2k_v8",
    "Judy_innocent": "./assets/office-fullbody-webp/Judy_innocent.webp?v=20261118_hd2k_v8",
    "Tony_normal": "./assets/office-fullbody-webp/Tony_normal.webp?v=20261118_hd2k_v8",
    "Tony_happy": "./assets/office-fullbody-webp/Tony_happy.webp?v=20261118_hd2k_v8",
    "Tony_hurt_cry": "./assets/office-fullbody-webp/Tony_hurt_cry.webp?v=20261118_hd2k_v8",
    "Tony_innocent": "./assets/office-fullbody-webp/Tony_innocent.webp?v=20261118_hd2k_v8",
    "Shrimp_normal": "./assets/office-fullbody-webp/Shrimp_normal.webp?v=20261118_hd2k_v8",
    "Shrimp_happy": "./assets/office-fullbody-webp/Shrimp_happy.webp?v=20261118_hd2k_v8",
    "Shrimp_hurt_cry": "./assets/office-fullbody-webp/Shrimp_hurt_cry.webp?v=20261118_hd2k_v8",
    "Shrimp_innocent": "./assets/office-fullbody-webp/Shrimp_innocent.webp?v=20261118_hd2k_v8",
    "Junior_normal": "./assets/office-fullbody-webp/Junior_normal.webp?v=20261118_hd2k_v8",
    "Junior_happy": "./assets/office-fullbody-webp/Junior_happy.webp?v=20261118_hd2k_v8",
    "Junior_hurt_cry": "./assets/office-fullbody-webp/Junior_hurt_cry.webp?v=20261118_hd2k_v8",
    "Junior_innocent": "./assets/office-fullbody-webp/Junior_innocent.webp?v=20261118_hd2k_v8",
    "Sara_normal": "./assets/office-fullbody-webp/Sara_normal.webp?v=20261118_hd2k_v8",
    "Sara_happy": "./assets/office-fullbody-webp/Sara_happy.webp?v=20261118_hd2k_v8",
    "Sara_hurt_cry": "./assets/office-fullbody-webp/Sara_hurt_cry.webp?v=20261118_hd2k_v8",
    "Sara_innocent": "./assets/office-fullbody-webp/Sara_innocent.webp?v=20261118_hd2k_v8"
  };
  const imgs = {};
  const opaqueBoxCache = {};
  function getOpaqueBox(img) {
    const key = img.getAttribute("src") || img.src;
    if (opaqueBoxCache[key]) return opaqueBoxCache[key];
    const cw = img.naturalWidth;
    const ch = img.naturalHeight;
    if (!cw || !ch) return null;
    try {
      const oc = document.createElement("canvas");
      oc.width = cw;
      oc.height = ch;
      const octx = oc.getContext("2d");
      octx.drawImage(img, 0, 0);
      const data = octx.getImageData(0, 0, cw, ch).data;
      let minX = cw, minY = ch, maxX = -1, maxY = -1;
      for (let y = 0; y < ch; y += 2) {
        const row = y * cw * 4;
        for (let x = 0; x < cw; x += 2) {
          if (data[row + x * 4 + 3] > 16) {
            if (x < minX) minX = x;
            if (x > maxX) maxX = x;
            if (y < minY) minY = y;
            if (y > maxY) maxY = y;
          }
        }
      }
      if (maxX >= minX && maxY >= minY) {
        const box = {
          x: Math.max(0, minX - 2),
          y: Math.max(0, minY - 2),
          w: Math.min(cw, maxX + 3) - Math.max(0, minX - 2),
          h: Math.min(ch, maxY + 3) - Math.max(0, minY - 2)
        };
        opaqueBoxCache[key] = box;
        return box;
      }
    } catch {}
    return { x: 0, y: 0, w: cw, h: ch };
  }
  function loadImg(k) {
    if (imgs[k]) return imgs[k];
    const im = new Image();
    im.decoding = "async";
    im.src = assetUrls[k];
    imgs[k] = im;
    return im;
  }
  let restPreloaded = false;
  function preloadRestCast() {
    if (restPreloaded) return;
    restPreloaded = true;
    Object.keys(assetUrls).forEach(k => {
      if (!imgs[k]) loadImg(k);
    });
  }
  const preferDesktopBg = window.innerWidth > window.innerHeight;
  const bgKey = preferDesktopBg ? "bgDesktop" : "bg";
  const immediateKeys = [
    bgKey,
    "weapon-slipper",
    "Tony_normal", "Tony_happy", "Tony_hurt_cry", "Tony_innocent"
  ];
  immediateKeys.forEach(loadImg);
  if (imgs[bgKey]) {
    imgs[bgKey].addEventListener("load", () => setTimeout(preloadRestCast, 120), { once: true });
    imgs[bgKey].addEventListener("error", () => setTimeout(preloadRestCast, 120), { once: true });
  }
  setTimeout(preloadRestCast, 1200);

  // --- Web Audio 合成音效 ---
  let audioCtx = null;
  let soundOn = true;
  function ensureAudio() {
    if (!soundOn) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) audioCtx = new AC();
    }
    if (audioCtx && audioCtx.state === "suspended") audioCtx.resume().catch(() => {});
    return audioCtx;
  }
  function playWeaponSound(weaponId, heavy = false) {
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    if (weaponId === "mallet" || heavy) {
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(42, now + 0.22);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.24);
      osc.connect(gain).connect(ac.destination);
      osc.start(now); osc.stop(now + 0.25);
    } else if (weaponId === "clog") {
      osc.type = "square";
      osc.frequency.setValueAtTime(420, now);
      osc.frequency.exponentialRampToValueAtTime(130, now + 0.11);
      gain.gain.setValueAtTime(0.20, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain).connect(ac.destination);
      osc.start(now); osc.stop(now + 0.13);
    } else if (weaponId === "fan") {
      osc.type = "sine";
      osc.frequency.setValueAtTime(720, now);
      osc.frequency.exponentialRampToValueAtTime(240, now + 0.14);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain).connect(ac.destination);
      osc.start(now); osc.stop(now + 0.16);
    } else {
      osc.type = "triangle";
      osc.frequency.setValueAtTime(290, now);
      osc.frequency.exponentialRampToValueAtTime(68, now + 0.12);
      gain.gain.setValueAtTime(0.24, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain).connect(ac.destination);
      osc.start(now); osc.stop(now + 0.14);
    }
  }
  function playBellSound(freq = 528) {
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine"; osc2.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.5, now);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(gain); osc2.connect(gain);
    gain.connect(ac.destination);
    osc.start(now); osc2.start(now);
    osc.stop(now + 0.95); osc2.stop(now + 0.95);
  }
  function playWoodClack() {
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "square";
    osc.frequency.setValueAtTime(640, now);
    osc.frequency.exponentialRampToValueAtTime(220, now + 0.07);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
    osc.connect(gain).connect(ac.destination);
    osc.start(now); osc.stop(now + 0.09);
  }

  btnSound.addEventListener("click", () => {
    soundOn = !soundOn;
    btnSound.textContent = soundOn ? "音效開" : "靜音";
  });

  // --- 狀態 ---
  const STORAGE_KEY = "xinan_temple_merit_v1";
  let merit = Number(localStorage.getItem(STORAGE_KEY) || "0") || 0;
  function addMerit(n) {
    merit += n;
    localStorage.setItem(STORAGE_KEY, String(merit));
    meritEl.textContent = String(merit);
  }
  meritEl.textContent = String(merit);

  let mode = "slap"; // "slap" | "bless" | "oracle"
  let vw = window.innerWidth;
  let vh = window.innerHeight;
  let dpr = Math.min(window.devicePixelRatio || 1, 2);

  function resize() {
    vw = window.innerWidth;
    vh = window.innerHeight;
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
  }
  window.addEventListener("resize", resize);
  resize();

  // --- 粒子、衝擊波、尾牙級可愛爆笑物件雨與飄字 ---
  const particles = [];
  const shockwaves = [];
  const funDrops = [];
  const floatTexts = [];
  let shake = 0;
  let comboBadgeTimer = 0;
  let ambientDropTimer = 0;

  const CONFETTI_COLORS = ["#ffdc16", "#ff327b", "#15f6b7", "#24bdff", "#ff7535", "#faefff", "#a66aff"];
  const FUN_ICONS = {
    slap: ["🧋", "🖥️", "🩴", "🪙", "☕", "🧧", "⭐", "😂", "💖", "🎉"],
    bless: ["🌸", "🏮", "🪙", "🧧", "🎐", "✨", "💖", "🍊", "🎉"],
    oracle: ["🪙", "🎋", "🧧", "✨", "⭐", "🏮", "💖", "🎉"]
  };

  function spawnShockwave(x, y, color = "#ffd466", maxR = 110, lineW = 4) {
    shockwaves.push({ x, y, color, r: 12, maxR, lineW, life: 0.42, maxLife: 0.42 });
  }

  function spawnAmbientDrop(modeKey = mode) {
    if (funDrops.length > 95) return;
    const isConfetti = Math.random() < 0.48;
    const pool = FUN_ICONS[modeKey] || FUN_ICONS.slap;
    funDrops.push({
      kind: isConfetti ? "confetti" : "icon",
      icon: isConfetti ? "" : pool[Math.floor(Math.random() * pool.length)],
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      x: 18 + Math.random() * (vw - 36),
      y: -24,
      vx: (Math.random() - 0.5) * 44,
      vy: 68 + Math.random() * 88,
      gravity: 18,
      size: isConfetti ? (7 + Math.random() * 6) : (20 + Math.random() * 12),
      rot: Math.random() * Math.PI * 2,
      vrot: (Math.random() - 0.5) * 5.2,
      sway: Math.random() * 6.28,
      life: 6.5,
      maxLife: 6.5
    });
  }

  // 仿尾牙抽獎雙側禮炮煙火＋角色後方爆笑物件噴泉
  function spawnFestiveShower(modeKey = mode, intensity = 1) {
    const pool = FUN_ICONS[modeKey] || FUN_ICONS.slap;
    const count = Math.min(34, Math.round(12 * intensity));
    const origins = [
      { x: vw * 0.14, y: vh * 0.58, dir: 1 },
      { x: vw * 0.86, y: vh * 0.58, dir: -1 },
      { x: vw * 0.50, y: Math.min(vh * 0.62, bgTableSurfaceY - 30), dir: 0 }
    ];
    for (let i = 0; i < count; i++) {
      if (funDrops.length > 130) funDrops.shift();
      const org = origins[i % origins.length];
      const isConfetti = i % 2 === 0;
      const vx = org.dir === 0
        ? (Math.random() - 0.5) * 320
        : org.dir * (95 + Math.random() * 190);
      const vy = -(260 + Math.random() * 260) * (intensity > 1 ? 1.15 : 1);
      funDrops.push({
        kind: isConfetti ? "confetti" : "icon",
        icon: isConfetti ? "" : pool[Math.floor(Math.random() * pool.length)],
        color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
        x: org.x + (Math.random() - 0.5) * 26,
        y: org.y + (Math.random() - 0.5) * 20,
        vx,
        vy,
        gravity: 430,
        size: isConfetti ? (8 + Math.random() * 6) : (22 + Math.random() * 12),
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 9.0,
        sway: Math.random() * 6.28,
        life: 3.4 + Math.random() * 1.2,
        maxLife: 4.6
      });
    }
  }

  function spawnBurst(x, y, color, count = 16, speed = 220) {
    for (let i = 0; i < count; i++) {
      const a = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const v = speed * (0.4 + Math.random() * 0.7);
      particles.push({
        x, y,
        vx: Math.cos(a) * v,
        vy: Math.sin(a) * v - 40,
        life: 0.45 + Math.random() * 0.35,
        maxLife: 0.8,
        size: 3 + Math.random() * 4,
        color
      });
    }
  }
  function spawnFloatText(x, y, text, color = "#ffe59e", size = 18) {
    floatTexts.length = 0;
    floatTexts.push({ x, y, text, color, size: Math.min(22, size), life: 4.8, maxLife: 4.8 });
  }

  const embers = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1.2 + Math.random() * 2.2,
    vy: 0.02 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2
  }));

  // =========================================================
  // 1. 打小人（正式七人固定順序：3畝、肯尼、啾底、偷泥、蝦婷、學妹、沙拉）
  //    預設啟動對象：偷泥 + 藍白拖
  // =========================================================
  const slapScenarios = [
    {
      id: "three_mu", label: "3畝", charKey: "3畝", fullBody: true, assetStatus: "approved", color: "#2b4d78",
      officeEvents: [
        "買了啦！這台 OLED 黑到像老闆的良心！",
        "誰偷喝我珍奶？出來跟藍白拖單挑！",
        "4K 雙螢幕架好，摸魚都看起來像在盯大盤！"
      ],
      blessLine: "3畝相挺：業績長紅！"
    },
    {
      id: "kenny", label: "肯尼", charKey: "Kenny", fullBody: true, assetStatus: "approved", color: "#36506b",
      officeEvents: [
        "240Hz 順到滑鼠自己離家出走啦！",
        "系統沒掛啦，是你的瀏覽器還在睡！",
        "老闆喊加班？我先把螢幕轉直看電影！"
      ],
      blessLine: "肯尼救火：系統穩穩過關！"
    },
    {
      id: "judy", label: "啾底", charKey: "Judy", fullBody: true, assetStatus: "approved", color: "#8e4a6d",
      officeEvents: [
        "月底對帳對到懷疑人生，快買護眼螢幕！",
        "會議室被搶走？我直接坐供桌上開會！",
        "今天不買明天漲價，卡刷下去就對了！"
      ],
      blessLine: "啾底加油：對帳一次全過！"
    },
    {
      id: "tony", label: "偷泥", charKey: "Tony", fullBody: true, assetStatus: "approved", color: "#c85a32",
      officeEvents: [
        "這台色準準到修圖完全不用開濾鏡！",
        "急單又來了！功勞算我的，鍋算電腦的！",
        "買了啦！大螢幕配藍白拖才是辦公室標配！"
      ],
      blessLine: "偷泥支援：急單順利出貨！"
    },
    {
      id: "shrimp", label: "蝦婷", charKey: "Shrimp", fullBody: true, assetStatus: "approved", color: "#b84452",
      officeEvents: [
        "客人問哪台最香？指這台曲面電競螢幕就對了！",
        "今天業績破表，全員原地升級 32 吋 4K！",
        "買了啦！這台不帶回家晚上睡不著！"
      ],
      blessLine: "蝦婷祈願：門市人潮爆滿！"
    },
    {
      id: "junior", label: "學妹", charKey: "Junior", fullBody: true, assetStatus: "approved", color: "#4a7a6e",
      officeEvents: [
        "簡報改到第 18 版了，學長姐救命呀！",
        "換這台超寬螢幕，Excel 終於不用左右狂拉！",
        "買了啦！低藍光護眼才能再戰三百頁 PPT！"
      ],
      blessLine: "學妹祈福：提案一次過關！"
    },
    {
      id: "sara", label: "沙拉", charKey: "Sara", fullBody: true, assetStatus: "approved", color: "#26242c",
      officeEvents: [
        "進度條卡在 99%？拖出去先敲三下木屐！",
        "240Hz 打報告手速自動加倍，不信買一台！",
        "買了啦！這台掛牆上連神明都說讚！"
      ],
      blessLine: "沙拉祝願：團隊默契滿分！"
    }
  ];
  const weapons = [
    { id: "slipper", label: "藍白拖", sprite: "weapon-slipper", color: "#6ec6ff", power: 2 },
    { id: "clog", label: "紅木屐", sprite: "weapon-clog", color: "#ff7256", power: 3 },
    { id: "mallet", label: "虎頭鎚", sprite: "weapon-mallet", color: "#ffd466", power: 4 },
    { id: "fan", label: "桃木扇", sprite: "weapon-fan", color: "#79e6b2", power: 3 }
  ];

  // 預設啟動就是「偷泥」+「藍白拖」
  let selectedScenario = slapScenarios.find(s => s.id === "tony");
  let customTargetLabel = "";
  let selectedWeapon = weapons[0];
  let slapCombo = 0;
  let slapCharge = 0; // 0..10
  let weaponAnim = 0;
  let weaponHeavy = false;
  let villainSquash = 0;
  let villainDizzy = 0;
  let villainFly = 0;
  let charMood = "normal"; // "normal" | "happy" | "hurt_cry" | "innocent"
  let charMoodTimer = 0;
  let forceMoodForTest = null;
  let autoTheater = true;
  let theaterTimer = 2.4;
  let theaterSlapCountdown = 2;

  function updateFsPadding() {
    const inEmbed = location.search.includes("embed=1");
    const maybeFs = inEmbed && (!!document.fullscreenElement || window.innerHeight >= (window.screen?.height || 9999) - 90);
    document.body.classList.toggle("in-fs", maybeFs);
  }
  window.addEventListener("resize", updateFsPadding);
  document.addEventListener("fullscreenchange", updateFsPadding);
  updateFsPadding();

  function setCharMood(nextMood, duration = 1.2) {
    charMood = nextMood;
    charMoodTimer = duration;
  }

  function getActiveFullBodySprite(charKey) {
    const mood = forceMoodForTest || charMood || "normal";
    return imgs[`${charKey}_${mood}`] || imgs[`${charKey}_normal`];
  }

  window.__xinanDebug = {
    setMood: (m) => { forceMoodForTest = m; },
    getState: () => ({
      scenario: selectedScenario.id,
      mood: forceMoodForTest || charMood,
      merit,
      slapCombo,
      slapCharge
    })
  };

  function performSlap(heavy = false) {
    if (!resultCard.classList.contains("hidden")) return;
    if (heavy && slapCharge < 10) return;

    weaponAnim = 1;
    weaponHeavy = heavy;
    villainSquash = heavy ? 1.0 : 0.65;
    villainDizzy = heavy ? 2.2 : 0.85;
    shake = heavy ? 18 : (selectedWeapon.id === "mallet" ? 11 : 7);

    const altarX = vw * 0.5;
    const altarY = vh * 0.56;

    if (heavy) {
      slapCharge = 0;
      slapCombo += 5;
      comboBadgeTimer = 2.6;
      villainFly = 1;
      setCharMood("happy", 1.8);
      addMerit(15);
      playWeaponSound(selectedWeapon.id, true);
      playBellSound(392);
      spawnBurst(altarX, altarY - 15, "#ffd466", 34, 340);
      spawnBurst(altarX, altarY - 15, selectedWeapon.color, 22, 260);
      spawnShockwave(altarX, altarY - 10, "#ffd466", 190, 6);
      spawnShockwave(altarX, altarY - 10, "#ff7256", 130, 4);
      spawnFestiveShower("slap", 2.0);
      const heavyWord = selectedScenario.fullBody
        ? `${selectedScenario.label} 慶祝達標！`
        : `${selectedWeapon.label}鎮煞重擊！`;
      spawnFloatText(altarX, altarY - 95, heavyWord, "#ffd466", 25);
      renderControls();
    } else {
      slapCombo += 1;
      comboBadgeTimer = 2.2;
      slapCharge = Math.min(10, slapCharge + 1);
      setCharMood("hurt_cry", 0.9);
      addMerit(selectedWeapon.power);
      playWeaponSound(selectedWeapon.id, false);
      spawnBurst(altarX, altarY - 10, selectedWeapon.color, 14, 210);
      spawnShockwave(altarX, altarY - 12, selectedWeapon.color, 95, 3.5);
      spawnFestiveShower("slap", 0.85);
      const sharedOfficePool = [
        "買了啦！這台 OLED 黑到像老闆的良心！",
        "240Hz 滑到滑鼠直接離家出走！買了啦！",
        "雙螢幕架好，摸魚都看起來像在盯大盤！",
        "這台色準準到修圖不用開濾鏡！刷卡！",
        "Type-C 一線通，桌面整齊到神明想借用！",
        "曲面電競螢幕買回家，加班都變打電動！",
        "店長偷偷說最後一台，不買晚上睡不著！",
        "老闆喊加班？我先把螢幕轉直追劇！",
        "護眼抗藍光，連看 18 版簡報都不流淚！",
        "會議室又被搶走，我直接坐供桌上開會！",
        "功勞算我的，鍋算舊螢幕解析度太低！",
        "搶資源大作戰！藍白拖先給他巴下去！"
      ];
      const words = selectedScenario.fullBody
        ? [sharedOfficePool[Math.floor(Math.random() * sharedOfficePool.length)], ...selectedScenario.officeEvents]
        : ["啪！", "打走霉運！", "退散！", "順心！", `${slapCombo} 連擊！`];
      spawnFloatText(
        altarX + (Math.random() - 0.5) * 90,
        altarY - 85,
        words[slapCombo % words.length],
        "#ffe7a3",
        21
      );
      if (slapCharge === 10) renderControls();
    }
  }

  // =========================================================
  // 2. 祈福（4 種不同祈福情境與專屬道具）
  // =========================================================
  const blessScenarios = [
    { id: "omamori", label: "平安健康", sprite: "bless-omamori", color: "#ff8c66", action: "祈求平安御守 ↗" },
    { id: "ingot", label: "財運亨通", sprite: "bless-ingot", color: "#ffd859", action: "點亮聚寶金燈 ↗" },
    { id: "lantern", label: "事業順遂", sprite: "bless-lantern", color: "#ffae52", action: "放飛祈福天燈 ↗" },
    { id: "lotus", label: "心想事成", sprite: "bless-lotus", color: "#ff9ec4", action: "點燃蓮花心燈 ↗" }
  ];
  let selectedBless = blessScenarios[0];
  let customWishLabel = "";
  const risingProps = [];

  function getTargetName() {
    return customTargetLabel.trim() || selectedScenario.label;
  }

  function launchBlessing() {
    const targetName = getTargetName();
    const wishText = customWishLabel.trim() || selectedBless.label;
    setCharMood("happy", 2.2);
    playBellSound(660);
    addMerit(10);
    risingProps.push({
      x: vw * 0.5,
      y: Math.min(vh * 0.56, bgTableSurfaceY - 40),
      vx: (Math.random() - 0.5) * 26,
      vy: -88 - Math.random() * 20,
      scale: 0.95,
      wobble: Math.random() * Math.PI * 2,
      sprite: selectedBless.sprite,
      age: 0
    });
    spawnBurst(vw * 0.5, bgTableSurfaceY - 65, selectedBless.color, 26, 220);
    spawnShockwave(vw * 0.5, bgTableSurfaceY - 20, "#ffd466", 150, 4);
    spawnFestiveShower("bless", 1.8);
    const blessLine = !customWishLabel.trim() && selectedScenario.blessLine
      ? `${selectedScenario.blessLine}（${wishText}）`
      : `為${targetName}祈求「${wishText}」心想事成！`;
    spawnFloatText(vw * 0.5, activeCharTopY - 18, blessLine, "#ffd980", 21);
  }

  // =========================================================
  // 3. 問卦（完整竹籤筒＋靈籤抽出＋完整紅木聖筊，對當前角色問卦）
  // =========================================================
  const fortunes = [
    { grade: "上上籤", title: "旭日東昇・貴人扶搖", body: "心中所慮將隨春風散去，放手推進最重要的一件事，自有助力水到渠成。" },
    { grade: "大吉籤", title: "松風入懷・財運漸開", body: "穩住節奏便是最好策略，近期會有意料之外的好消息與實質回報。" },
    { grade: "上吉籤", title: "雲開見月・思路澄明", body: "先前卡住的難題即將鬆動，照直覺選最簡單順手的那條路走即可。" },
    { grade: "中吉籤", title: "靜水流深・步步生蓮", body: "不必急於一時勝負，先照顧好作息與精神，機會自然站到你這邊。" },
    { grade: "吉籤", title: "竹影清風・小人遠離", body: "瑣碎干擾已過高峰，專注當下能掌握的事，心情安穩即是大福。" }
  ];
  let oracleStep = "ready"; // "ready" | "shaking" | "drawn" | "throwing" | "done"
  let oracleTimer = 0;
  let drawnFortune = null;

  function shakeOracle() {
    if (oracleStep === "shaking" || oracleStep === "throwing") return;
    oracleStep = "shaking";
    oracleTimer = 1.0;
    setCharMood("innocent", 1.8);
    playWoodClack();
    setTimeout(playWoodClack, 180);
    setTimeout(playWoodClack, 360);
    spawnFloatText(vw * 0.5, activeCharTopY - 18, `${getTargetName()}：誠心祈求神明賜支好籤！`, "#ffe699", 21);
    renderControls();
  }

  function throwBlocks() {
    if (oracleStep !== "drawn") return;
    oracleStep = "throwing";
    oracleTimer = 0.9;
    setCharMood("innocent", 1.2);
    playWoodClack();
    setTimeout(playWoodClack, 220);
    renderControls();
  }

  function showResult(badge, title, body, sub) {
    resultBadge.textContent = badge;
    resultTitle.textContent = title;
    resultBody.textContent = body;
    resultSub.textContent = sub;
    resultCard.classList.remove("hidden");
  }
  btnCloseResult.addEventListener("click", () => {
    resultCard.classList.add("hidden");
    if (mode === "oracle" && oracleStep === "done") {
      oracleStep = "ready";
      renderControls();
    }
  });

  // =========================================================
  // 控制列渲染
  // =========================================================
  function renderControls() {
    chipsRow.innerHTML = "";
    weaponRow.innerHTML = "";
    actionRow.innerHTML = "";

    // 三儀合一：任何模式皆常駐 7 位角色＋自訂選角列，隨時可對選定角色打小人、祈福或問卦
    slapScenarios.forEach(s => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chip-btn" + (selectedScenario.id === s.id && !customTargetLabel ? " active" : "");
      b.textContent = s.label;
      b.onclick = () => { selectedScenario = s; customTargetLabel = ""; renderControls(); };
      chipsRow.appendChild(b);
    });
    const targetInp = document.createElement("input");
    targetInp.type = "text";
    targetInp.maxLength = 10;
    targetInp.className = "custom-input";
    targetInp.placeholder = "自訂對象...";
    targetInp.value = customTargetLabel;
    targetInp.oninput = () => {
      customTargetLabel = targetInp.value;
      chipsRow.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
    };
    chipsRow.appendChild(targetInp);

    const targetName = getTargetName();

    if (mode === "slap") {
      weapons.forEach(w => {
        const wb = document.createElement("button");
        wb.type = "button";
        wb.className = "chip-btn weapon-chip" + (selectedWeapon.id === w.id ? " active" : "");
        wb.textContent = w.label;
        wb.onclick = () => { selectedWeapon = w; renderControls(); };
        weaponRow.appendChild(wb);
      });

      const slapBtn = document.createElement("button");
      slapBtn.type = "button";
      slapBtn.id = "btnPrimaryAction";
      slapBtn.className = "rect-btn primary-btn";
      slapBtn.textContent = `${selectedWeapon.label}連擊！`;
      slapBtn.onclick = () => performSlap(false);
      actionRow.appendChild(slapBtn);

      const ultBtn = document.createElement("button");
      ultBtn.type = "button";
      ultBtn.id = "btnUltimateSlap";
      ultBtn.className = "rect-btn " + (slapCharge >= 10 ? "gold-btn ult-ready" : "");
      ultBtn.textContent = slapCharge >= 10 ? "鎮煞重擊！" : `重擊 (${slapCharge}/10)`;
      ultBtn.disabled = slapCharge < 10;
      ultBtn.onclick = () => performSlap(true);
      actionRow.appendChild(ultBtn);

      const randBtn = document.createElement("button");
      randBtn.type = "button";
      randBtn.id = "btnRandomOffice";
      randBtn.className = "rect-btn " + (autoTheater ? "gold-btn" : "");
      randBtn.textContent = autoTheater ? "劇場:演中" : "隨機劇場";
      randBtn.onclick = () => {
        autoTheater = !autoTheater;
        if (autoTheater) {
          const pool = slapScenarios;
          selectedScenario = pool[Math.floor(Math.random() * pool.length)];
          customTargetLabel = "";
          const ev = selectedScenario.officeEvents[Math.floor(Math.random() * selectedScenario.officeEvents.length)];
          spawnFloatText(vw * 0.5, vh * 0.34, `${selectedScenario.label}：${ev}`, "#ffd980", 19);
          setCharMood("innocent", 1.1);
          theaterTimer = 4.6;
        }
        renderControls();
      };
      actionRow.appendChild(randBtn);
    } else if (mode === "bless") {
      blessScenarios.forEach(s => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip-btn" + (selectedBless.id === s.id && !customWishLabel ? " active" : "");
        b.textContent = s.label;
        b.onclick = () => { selectedBless = s; customWishLabel = ""; renderControls(); };
        weaponRow.appendChild(b);
      });
      const wishInp = document.createElement("input");
      wishInp.type = "text";
      wishInp.maxLength = 14;
      wishInp.className = "custom-input full-span";
      wishInp.placeholder = `替「${targetName}」輸入專屬心願（留空則用上方祈願）...`;
      wishInp.value = customWishLabel;
      wishInp.oninput = () => {
        customWishLabel = wishInp.value;
        weaponRow.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      };
      weaponRow.appendChild(wishInp);

      const blessBtn = document.createElement("button");
      blessBtn.type = "button";
      blessBtn.id = "btnPrimaryAction";
      blessBtn.className = "rect-btn gold-btn";
      blessBtn.textContent = `為 ${targetName} ${selectedBless.action}`;
      blessBtn.onclick = launchBlessing;
      actionRow.appendChild(blessBtn);
    } else if (mode === "oracle") {
      const guide = document.createElement("div");
      guide.className = "oracle-guide";
      const s1 = oracleStep === "ready" || oracleStep === "shaking";
      const s2 = oracleStep === "drawn" || oracleStep === "throwing";
      const s3 = oracleStep === "done";
      const msg = oracleStep === "ready"
        ? `為「${targetName}」求籤，點擊按鈕或神壇`
        : oracleStep === "drawn"
          ? `靈籤已出！為「${targetName}」擲筊解籤`
          : oracleStep === "done"
            ? `聖筊應許！可再為「${targetName}」求籤`
            : oracleStep === "shaking" ? `為「${targetName}」誠心搖籤中...` : "聖筊高拋落下中...";
      guide.innerHTML =
        `<div class="oracle-steps">` +
        `<span class="oracle-step ${s1 ? "active" : ""}">① 搖籤</span><span>›</span>` +
        `<span class="oracle-step ${s2 ? "active" : ""}">② 擲筊</span><span>›</span>` +
        `<span class="oracle-step ${s3 ? "active" : ""}">③ 解籤</span>` +
        `</div><span class="oracle-msg">${msg}</span>`;
      weaponRow.appendChild(guide);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btnPrimaryAction";
      btn.className = "rect-btn " + (oracleStep === "drawn" ? "gold-btn ult-ready" : "primary-btn");
      btn.textContent = oracleStep === "drawn" ? `為 ${targetName} 擲筊解籤` : `為 ${targetName} 誠心求籤`;
      btn.disabled = oracleStep === "shaking" || oracleStep === "throwing";
      btn.onclick = () => {
        if (oracleStep === "ready" || oracleStep === "done") shakeOracle();
        else if (oracleStep === "drawn") throwBlocks();
      };
      actionRow.appendChild(btn);
    }
  }

  // --- 三大模式專屬多場景隨機輪替系統 ---
  const SCENE_DEFS = {
    sunny: { keyP: "bg", keyD: "bgDesktop", ratioP: 0.688, ratioD: 0.765, night: false, label: "櫻花廟埕" },
    office: { keyP: "sceneOffice", keyD: "sceneOffice", ratioP: 0.715, ratioD: 0.715, night: false, label: "歡樂螢幕間" },
    festival: { keyP: "sceneFestival", keyD: "sceneFestival", ratioP: 0.755, ratioD: 0.755, night: false, label: "廟口嘉年華" },
    skylantern: { keyP: "sceneSkylantern", keyD: "sceneSkylantern", ratioP: 0.718, ratioD: 0.718, night: false, label: "天燈雲海台" },
    oraclehall: { keyP: "sceneOraclehall", keyD: "sceneOraclehall", ratioP: 0.735, ratioD: 0.735, night: false, label: "金龍問卦殿" },
    night: { keyP: "bgNight", keyD: "bgNightDesktop", ratioP: 0.675, ratioD: 0.665, night: true, label: "暮色雕龍殿" }
  };
  const MODE_SCENES = {
    slap: ["sunny", "office", "festival"],
    bless: ["skylantern", "sunny", "festival"],
    oracle: ["oraclehall", "sunny", "night"]
  };
  let activeSceneId = MODE_SCENES.slap[Math.floor(Math.random() * MODE_SCENES.slap.length)];

  function pickModeScene(targetMode, cycleNext = false) {
    const list = MODE_SCENES[targetMode] || MODE_SCENES.slap;
    if (cycleNext) {
      const idx = list.indexOf(activeSceneId);
      activeSceneId = list[(idx + 1) % list.length];
    } else {
      const candidates = list.filter(s => s !== activeSceneId);
      activeSceneId = (candidates.length ? candidates : list)[Math.floor(Math.random() * (candidates.length || list.length))];
    }
    const def = SCENE_DEFS[activeSceneId] || SCENE_DEFS.sunny;
    if (btnScene) btnScene.textContent = def.label;
    loadImg(def.keyP);
    loadImg(def.keyD);
  }
  if (btnScene) {
    btnScene.textContent = (SCENE_DEFS[activeSceneId] || SCENE_DEFS.sunny).label;
    btnScene.addEventListener("click", () => {
      pickModeScene(mode, true);
      spawnFestiveShower(mode, 1.0);
    });
  }

  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.toggle("active", b === btn));
      resultCard.classList.add("hidden");
      floatTexts.length = 0;
      particles.length = 0;
      shockwaves.length = 0;
      comboBadgeTimer = 0;
      oracleStep = "ready";
      pickModeScene(mode, false);
      spawnFestiveShower(mode, 1.1);
      renderControls();
    });
  });

  canvas.addEventListener("pointerdown", () => {
    if (!resultCard.classList.contains("hidden")) return;
    if (mode === "slap") performSlap(false);
    else if (mode === "bless") launchBlessing();
    else if (mode === "oracle") {
      if (oracleStep === "ready" || oracleStep === "done") shakeOracle();
      else if (oracleStep === "drawn") throwBlocks();
    }
  });

  window.addEventListener("keydown", e => {
    if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      if (mode === "slap") performSlap(false);
      else if (mode === "bless") launchBlessing();
      else if (mode === "oracle") {
        if (oracleStep === "ready" || oracleStep === "done") shakeOracle();
        else if (oracleStep === "drawn") throwBlocks();
      }
    }
  });

  renderControls();

  // =========================================================
  // 主迴圈 (60fps)
  // =========================================================
  let lastT = performance.now();
  let bgTableSurfaceY = vh * 0.66;
  let activeCharTopY = vh * 0.36;
  let activeCharCenterX = vw * 0.5;

  function drawBackground(t) {
    const isWide = vw > vh;
    const sc = SCENE_DEFS[activeSceneId] || SCENE_DEFS.sunny;
    const primaryKey = isWide ? sc.keyD : sc.keyP;
    const fallbackKey = isWide ? "bgDesktop" : "bg";
    const bg = (imgs[primaryKey] && imgs[primaryKey].complete && imgs[primaryKey].naturalWidth > 0)
      ? imgs[primaryKey]
      : (imgs[fallbackKey] && imgs[fallbackKey].complete && imgs[fallbackKey].naturalWidth > 0 ? imgs[fallbackKey] : imgs.bg);
    if (bg && bg.complete && bg.naturalWidth > 0) {
      const scale = Math.max(vw / bg.naturalWidth, vh / bg.naturalHeight) * 1.02;
      const dw = bg.naturalWidth * scale;
      const dh = bg.naturalHeight * scale;
      const dx = (vw - dw) * 0.5 + Math.sin(t * 0.35) * 5;
      const dy = (vh - dh) * 0.5 + Math.cos(t * 0.25) * 4;
      ctx.drawImage(bg, dx, dy, dw, dh);
      // 依當前場景精準對齊供桌／台面頂緣
      const ratio = isWide ? sc.ratioD : sc.ratioP;
      bgTableSurfaceY = dy + dh * ratio;
      // 明亮陽光暖光呼吸（夜間場景則為暖燈籠光）
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const glowPulse = 0.06 + 0.03 * Math.sin(t * 2.0);
      const glowCenter = ctx.createRadialGradient(vw * 0.5, dy + dh * (sc.night ? 0.44 : 0.28), 10, vw * 0.5, dy + dh * (sc.night ? 0.44 : 0.28), Math.min(vw, vh) * 0.52);
      glowCenter.addColorStop(0, sc.night ? `rgba(255, 196, 92, ${glowPulse * 1.3})` : `rgba(255, 244, 196, ${glowPulse})`);
      glowCenter.addColorStop(1, "rgba(255, 220, 140, 0)");
      ctx.fillStyle = glowCenter;
      ctx.fillRect(0, 0, vw, vh);
      ctx.restore();

      const grad = ctx.createRadialGradient(vw * 0.5, vh * 0.5, vh * 0.22, vw * 0.5, vh * 0.5, Math.max(vw, vh) * 0.92);
      grad.addColorStop(0, "rgba(255,250,235,0)");
      grad.addColorStop(1, sc.night ? "rgba(12,10,16,0.42)" : "rgba(42,26,18,0.14)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);
    } else {
      bgTableSurfaceY = vh * 0.68;
      ctx.fillStyle = "#191521";
      ctx.fillRect(0, 0, vw, vh);
    }

    // 嫋嫋動態香煙絲帶（左右兩側）
    ctx.save();
    for (const side of [-1, 1]) {
      const baseX = vw * 0.5 + side * Math.min(vw * 0.34, 240);
      const baseY = bgTableSurfaceY - 24;
      ctx.beginPath();
      ctx.moveTo(baseX, baseY);
      for (let step = 1; step <= 6; step++) {
        const sy = baseY - step * 34;
        const sx = baseX + Math.sin(t * 1.4 + step * 0.9 + side) * (10 + step * 3);
        ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = "rgba(246, 232, 206, 0.08)";
      ctx.lineWidth = 10;
      ctx.lineCap = "round";
      ctx.stroke();
    }
    ctx.restore();

    embers.forEach(e => {
      e.y -= e.vy * 0.016;
      if (e.y < -0.05) { e.y = 1.05; e.x = Math.random(); }
      const ex = (e.x + Math.sin(t + e.phase) * 0.015) * vw;
      const ey = e.y * vh;
      ctx.fillStyle = `rgba(255, 214, 128, ${0.28 + 0.25 * Math.sin(t * 2 + e.phase)})`;
      ctx.beginPath();
      ctx.arc(ex, ey, e.r, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function frame(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;
    const t = now * 0.001;

    if (shake > 0) shake = Math.max(0, shake - dt * 55);
    const sx = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const sy = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    ctx.save();
    ctx.translate(sx, sy);
    drawBackground(t);

    const altarX = vw * 0.5;
    const altarY = vh * 0.55;
    const propBase = Math.min(vw, vh);
    const isWide = vw > vh;
    const dockEl = document.querySelector(".bottom-dock");
    const dockTop = dockEl ? dockEl.getBoundingClientRect().top : (vh - 155);
    const hudEl = document.querySelector(".top-hud");
    const hudBottom = hudEl ? hudEl.getBoundingClientRect().bottom : 58;
    const safeSpan = Math.max(210, dockTop - hudBottom - 66);
    const vSize = isWide ? Math.min(278, safeSpan * 0.62) : Math.min(228, safeSpan * 0.55);
    const feetBaseY = Math.min(dockTop - 20, Math.max(hudBottom + vSize + 60, bgTableSurfaceY + 12));

    if (weaponAnim > 0) weaponAnim = Math.max(0, weaponAnim - dt * 4.2);
    if (villainSquash > 0) villainSquash = Math.max(0, villainSquash - dt * 3.2);
    if (villainDizzy > 0) villainDizzy = Math.max(0, villainDizzy - dt);
    if (villainFly > 0) villainFly = Math.max(0, villainFly - dt * 1.6);
    if (charMoodTimer > 0) {
      charMoodTimer -= dt;
      if (charMoodTimer <= 0) {
        if (charMood === "hurt_cry") setCharMood("innocent", 1.25);
        else charMood = "normal";
      }
    }

    // 隨機劇場自動輪演（打小人模式持續演爆笑劇情＋三不五十自動打幾下）
    if (mode === "slap" && autoTheater && resultCard.classList.contains("hidden")) {
      theaterTimer -= dt;
      if (theaterTimer <= 0) {
        theaterTimer = 4.6 + Math.random() * 1.4;
        theaterSlapCountdown -= 1;
        if (theaterSlapCountdown <= 0) {
          theaterSlapCountdown = 2 + Math.floor(Math.random() * 2);
          performSlap(false);
        } else {
          const pool = slapScenarios;
          selectedScenario = pool[Math.floor(Math.random() * pool.length)];
          customTargetLabel = "";
          const theaterMonitorLines = [
            "買了啦！這台 4K OLED 黑到像老闆的良心！",
            "240Hz 滑到滑鼠自己離家出走！買了啦！",
            "雙螢幕買下去，摸魚看起來像在盯大盤！",
            "這螢幕色彩準到修圖完全不用開濾鏡！",
            "今天不買明天漲價，卡拿出來刷下去！",
            "護眼低藍光，加班到半夜眼睛還在發亮！"
          ];
          const evPool = [...theaterMonitorLines, ...selectedScenario.officeEvents];
          const ev = evPool[Math.floor(Math.random() * evPool.length)];
          spawnFloatText(vw * 0.5, activeCharTopY - 22, `${selectedScenario.label}：${ev}`, "#2b1a10", 21);
          setCharMood(Math.random() < 0.45 ? "happy" : "innocent", 1.15);
          renderControls();
        }
      }
    }

    // 祈福模式：角色腳下旋轉金色祈福陣法雙環（畫在角色底層）
    if (mode === "bless") {
      ctx.save();
      ctx.translate(altarX, feetBaseY);
      ctx.scale(1, 0.28);
      ctx.rotate(t * 0.65);
      ctx.strokeStyle = "rgba(231, 184, 92, 0.78)";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([14, 8]);
      ctx.beginPath();
      ctx.arc(0, 0, vSize * 0.56, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      ctx.strokeStyle = "rgba(255, 224, 148, 0.52)";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(0, 0, vSize * 0.42, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 三儀合一核心舞台：選定角色永遠穩站青石供桌正中央，與打小人／祈福／問卦即時互動
    {
      const vImg = selectedScenario.fullBody
        ? getActiveFullBodySprite(selectedScenario.charKey)
        : imgs[selectedScenario.sprite];
      const scaleX = 1 + villainSquash * 0.14;
      const scaleY = 1 - villainSquash * 0.14;
      const flyY = villainFly > 0 ? -Math.sin(villainFly * Math.PI) * 120 : 0;
      const wobble = villainDizzy > 0 ? Math.sin(t * 28) * 0.08 : Math.sin(t * 2.4) * 0.018;
      activeCharCenterX = altarX;

      ctx.save();
      ctx.translate(altarX, feetBaseY);
      ctx.fillStyle = "rgba(0,0,0,0.42)";
      ctx.beginPath();
      ctx.ellipse(0, 2, vSize * 0.27, vSize * 0.065, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.translate(altarX, feetBaseY + flyY);
      ctx.rotate(wobble);
      ctx.scale(scaleX, scaleY);
      if (mode === "bless") {
        ctx.shadowColor = selectedBless.color;
        ctx.shadowBlur = 18;
      }

      if (vImg && vImg.complete && vImg.naturalWidth > 0) {
        const box = getOpaqueBox(vImg) || { x: 0, y: 0, w: vImg.naturalWidth, h: vImg.naturalHeight };
        const normImg = imgs[`${selectedScenario.charKey}_normal`];
        const normBox = (normImg && normImg.complete && normImg.naturalWidth > 0) ? getOpaqueBox(normImg) : null;
        const refH = normBox ? normBox.h : Math.max(box.h, vImg.naturalHeight * 0.84);
        const pxScale = vSize / refH;
        const h = Math.min(vSize * 1.06, box.h * pxScale);
        const w = h * (box.w / box.h);
        activeCharTopY = feetBaseY + flyY - h;
        ctx.drawImage(vImg, box.x, box.y, box.w, box.h, -w * 0.5, -h, w, h);

        // 3畝為七分半身原圖：在下緣前方繪製立體祥雲＋喜氣紅金雲紋座台自然承托，徹底消除硬切直線！
        if (selectedScenario.id === "three_mu") {
          ctx.save();
          ctx.shadowBlur = 0;
          const cw = Math.max(w * 0.72, 118);
          // 柔和暖白粉金祥雲團（自然包覆褲緣不硬切）
          const puffs = [
            { x: -cw * 0.42, y: -6, r: 22 },
            { x: -cw * 0.18, y: -12, r: 27 },
            { x: cw * 0.08, y: -13, r: 26 },
            { x: cw * 0.34, y: -8, r: 23 },
            { x: cw * 0.48, y: -2, r: 17 },
            { x: -cw * 0.52, y: -1, r: 16 }
          ];
          // 外層暖金微邊
          ctx.fillStyle = "#f7d58b";
          for (const p of puffs) {
            ctx.beginPath();
            ctx.arc(p.x, p.y + 2, p.r + 2.5, 0, Math.PI * 2);
            ctx.fill();
          }
          // 內層奶白柔雲
          const cg = ctx.createLinearGradient(0, -34, 0, 14);
          cg.addColorStop(0, "#fffdf7");
          cg.addColorStop(1, "#fde8c8");
          ctx.fillStyle = cg;
          for (const p of puffs) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
            ctx.fill();
          }
          // 中央喜氣紅金迷你福紋飾牌
          const pw = 64, ph = 20;
          ctx.fillStyle = "#c83e2b";
          ctx.strokeStyle = "#f3c769";
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(-pw * 0.5, -14, pw, ph, 6);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = "#fff5d6";
          ctx.font = "800 11px 'Noto Serif TC', serif";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText("✦ 福 ✦", 0, -4);
          ctx.restore();
        }
      } else if (selectedScenario.fullBody) {
        activeCharTopY = feetBaseY + flyY - vSize * 0.92;
        const moodNow = forceMoodForTest || charMood || "normal";
        const w = vSize * 0.68;
        const h = vSize * 0.92;
        ctx.fillStyle = selectedScenario.color || "#3a3545";
        ctx.strokeStyle = moodNow === "hurt_cry" ? "#ff6b57" : "#e7b85c";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.roundRect(-w * 0.5, -h, w, h, 14);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = "#fff6e5";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.font = "800 32px 'Noto Serif TC', serif";
        ctx.fillText(selectedScenario.label, 0, -h * 0.68);
      }
      ctx.restore();
    }

    // 1. 打小人法器與連擊印記
    if (mode === "slap") {

      // 人物下方不再顯示多餘名字標籤牌，保持手機與桌面神壇乾淨清爽

      // 武器動態揮擊：待機與換道具時停靠在角色右上方外側，絕不遮擋人物
      const wImg = imgs[selectedWeapon.sprite];
      if (wImg && wImg.complete && wImg.naturalWidth > 0) {
        const swing = weaponAnim > 0 ? Math.sin(weaponAnim * Math.PI) : 0;
        const idleSize = Math.min(112, propBase * 0.24);
        const hitSize = Math.min(185, propBase * 0.36) * (weaponHeavy ? 1.2 : 1);
        const wSize = idleSize + (hitSize - idleSize) * swing;
        const restX = Math.min(vw - idleSize * 0.68, altarX + Math.max(122, vSize * 0.55));
        const restY = altarY - vSize * 0.34;
        const wxPos = restX + (altarX + 18 - restX) * swing;
        const wyPos = restY + (altarY - vSize * 0.14 - restY) * swing;
        const wRot = 0.28 - swing * 1.05;

        ctx.save();
        if (swing > 0.12) {
          // 揮擊弧形光軌（Swing Trail）
          ctx.beginPath();
          ctx.arc(altarX + 24, altarY - vSize * 0.18, vSize * 0.52, -0.95, 0.25);
          ctx.strokeStyle = weaponHeavy ? `rgba(255, 212, 102, ${swing * 0.72})` : `rgba(255, 240, 200, ${swing * 0.45})`;
          ctx.lineWidth = weaponHeavy ? 14 : 8;
          ctx.lineCap = "round";
          ctx.stroke();
        }
        ctx.translate(wxPos, wyPos + Math.sin(t * 2.8) * 3 * (1 - swing));
        ctx.rotate(wRot);
        if (weaponHeavy && weaponAnim > 0) {
          ctx.shadowColor = "#ffd466";
          ctx.shadowBlur = 28;
        }
        const aspect = wImg.naturalWidth / wImg.naturalHeight;
        ctx.drawImage(wImg, -wSize * aspect * 0.5, -wSize * 0.5, wSize * aspect, wSize);
        ctx.restore();
      }

      // 右上方連擊印記（不擋角色與泡泡）
      if (comboBadgeTimer > 0 && slapCombo >= 2) {
        comboBadgeTimer = Math.max(0, comboBadgeTimer - dt);
        const hudB = (document.querySelector(".top-hud")?.getBoundingClientRect().bottom || 58) + 14;
        const pop = 1 + Math.min(0.18, villainSquash * 0.16);
        ctx.save();
        ctx.globalAlpha = Math.min(1, comboBadgeTimer / 0.35);
        ctx.translate(vw - 16, hudB + 22);
        ctx.scale(pop, pop);
        ctx.textAlign = "right";
        ctx.textBaseline = "middle";
        ctx.font = "900 13px ui-monospace, sans-serif";
        ctx.fillStyle = "#f9e4b4";
        ctx.fillText("COMBO", 0, -11);
        ctx.font = "900 26px 'Noto Serif TC', serif";
        ctx.strokeStyle = "#2b160c";
        ctx.lineWidth = 4;
        ctx.strokeText(`×${slapCombo}`, 0, 11);
        ctx.fillStyle = "#ffd466";
        ctx.fillText(`×${slapCombo}`, 0, 11);
        ctx.restore();
      }
    }

    // 2. 祈福互動層（守護聖物懸浮在角色右上方外側＋祈福升空特效）
    if (mode === "bless") {
      const pImg = imgs[selectedBless.sprite];
      const pSize = Math.min(110, propBase * 0.24);
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        const aspect = pImg.naturalWidth / pImg.naturalHeight;
        const bob = Math.sin(t * 2.6) * 6;
        const px = Math.min(vw - pSize * 0.65, altarX + Math.max(118, vSize * 0.56));
        const py = feetBaseY - vSize * 0.66 + bob;
        ctx.save();
        ctx.translate(px, py);
        ctx.shadowColor = selectedBless.color;
        ctx.shadowBlur = 22;
        ctx.drawImage(pImg, -pSize * aspect * 0.5, -pSize * 0.5, pSize * aspect, pSize);
        ctx.restore();
      }

      for (let i = risingProps.length - 1; i >= 0; i--) {
        const rp = risingProps[i];
        rp.age += dt;
        rp.x += (rp.vx + Math.sin(t * 2 + rp.wobble) * 14) * dt;
        rp.y += rp.vy * dt;
        rp.scale = Math.max(0.28, 1 - rp.age * 0.14);
        const rImg = imgs[rp.sprite];
        if (rImg && rImg.complete && rImg.naturalWidth > 0) {
          const aspect = rImg.naturalWidth / rImg.naturalHeight;
          const h = Math.min(150, propBase * 0.30) * rp.scale;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - rp.age / 5.5);
          ctx.translate(rp.x, rp.y);
          ctx.rotate(Math.sin(t * 3 + rp.wobble) * 0.05);
          ctx.shadowColor = "rgba(255, 200, 95, 0.7)";
          ctx.shadowBlur = 18;
          ctx.drawImage(rImg, -h * aspect * 0.5, -h * 0.5, h * aspect, h);
          ctx.restore();
        }
        if (rp.y < -160 || rp.age > 5.5) risingProps.splice(i, 1);
      }
    }

    // 3. 問卦互動層（竹籤筒置於角色左前、紅木聖筊置於角色右前，不擋人物）
    if (mode === "oracle") {
      const targetName = getTargetName();
      const tubeH = Math.min(138, propBase * 0.28);
      const sideOffset = Math.min(vw * 0.32, Math.max(110, vSize * 0.54));
      const tubeX = altarX - sideOffset;
      const blocksX = altarX + sideOffset;
      const propBaseY = feetBaseY + 6;

      if (oracleStep === "shaking") {
        oracleTimer -= dt;
        if (oracleTimer <= 0) {
          oracleStep = "drawn";
          drawnFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
          playBellSound(587);
          spawnBurst(tubeX, propBaseY - tubeH, "#ffd466", 18, 170);
          spawnShockwave(tubeX, propBaseY - tubeH * 0.8, "#ffd466", 85, 3);
          spawnFloatText(vw * 0.5, activeCharTopY - 18, `${targetName}：靈籤已出！快來擲筊解籤！`, "#ffe699", 21);
          renderControls();
        }
      } else if (oracleStep === "throwing") {
        oracleTimer -= dt;
        if (oracleTimer <= 0) {
          oracleStep = "done";
          setCharMood("happy", 2.5);
          addMerit(10);
          playBellSound(784);
          spawnBurst(blocksX, propBaseY - 24, "#ffd466", 24, 220);
          spawnShockwave(blocksX, propBaseY - 12, "#ffd466", 110, 4);
          spawnFestiveShower("oracle", 2.0);
          showResult(
            drawnFortune.grade,
            `【${targetName}】${drawnFortune.title}`,
            drawnFortune.body,
            `為 ${targetName} 聖筊應許 ・ 心安 +10`
          );
          renderControls();
        }
      }

      const tImg = imgs["oracle-tube"];
      const sImg = imgs["oracle-stick"];
      const bImg = imgs["oracle-blocks"];
      const shakeRot = oracleStep === "shaking" ? Math.sin(t * 36) * 0.22 : 0;
      const shakeY = oracleStep === "shaking" ? Math.abs(Math.sin(t * 28)) * -14 : 0;

      // 抽出之靈籤
      if ((oracleStep === "drawn" || oracleStep === "throwing" || oracleStep === "done") && sImg && sImg.complete && sImg.naturalWidth > 0) {
        const stickH = Math.min(96, propBase * 0.20);
        const sa = sImg.naturalWidth / sImg.naturalHeight;
        ctx.save();
        ctx.translate(tubeX + 6, propBaseY - tubeH - 12 + Math.sin(t * 3.2) * 5);
        ctx.rotate(-0.26);
        ctx.shadowColor = "#ffd466";
        ctx.shadowBlur = 16;
        ctx.drawImage(sImg, -stickH * sa * 0.5, -stickH * 0.5, stickH * sa, stickH);
        ctx.restore();
      }

      // 左前：竹籤筒
      if (tImg && tImg.complete && tImg.naturalWidth > 0) {
        const aspect = tImg.naturalWidth / tImg.naturalHeight;
        const tw = tubeH * aspect;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.40)";
        ctx.beginPath();
        ctx.ellipse(tubeX, propBaseY, tw * 0.42, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(tubeX, propBaseY + shakeY);
        ctx.rotate(shakeRot);
        ctx.drawImage(tImg, -tw * 0.5, -tubeH, tw, tubeH);
        ctx.restore();
      }

      // 右前：紅木聖筊
      if (bImg && bImg.complete && bImg.naturalWidth > 0) {
        const bH = Math.min(82, propBase * 0.17);
        const aspect = bImg.naturalWidth / bImg.naturalHeight;
        const bw = bH * aspect;
        const tossY = oracleStep === "throwing" ? -Math.sin((1 - oracleTimer / 0.9) * Math.PI) * 145 : 0;
        const tossRot = oracleStep === "throwing" ? (1 - oracleTimer / 0.9) * Math.PI * 6 : 0;
        ctx.save();
        ctx.fillStyle = "rgba(0,0,0,0.38)";
        ctx.beginPath();
        ctx.ellipse(blocksX, propBaseY, bw * 0.36, 7, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.translate(blocksX, propBaseY - bH * 0.48 + tossY);
        ctx.rotate(tossRot);
        ctx.drawImage(bImg, -bw * 0.5, -bH * 0.5, bw, bH);
        ctx.restore();
      }
    }

    // 衝擊波光環
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const sw = shockwaves[i];
      sw.life -= dt;
      if (sw.life <= 0) { shockwaves.splice(i, 1); continue; }
      const prog = 1 - sw.life / sw.maxLife;
      const curR = sw.r + (sw.maxR - sw.r) * (1 - Math.pow(1 - prog, 2));
      ctx.save();
      ctx.globalAlpha = Math.max(0, (1 - prog) * 0.82);
      ctx.strokeStyle = sw.color;
      ctx.lineWidth = sw.lineW * (1 - prog * 0.5);
      ctx.beginPath();
      ctx.arc(sw.x, sw.y, curR, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }

    // 持續飄落可愛爆笑主題物件＋尾牙七彩旋轉彩帶雨
    ambientDropTimer -= dt;
    if (ambientDropTimer <= 0) {
      ambientDropTimer = 0.24 + Math.random() * 0.22;
      spawnAmbientDrop(mode);
    }
    for (let i = funDrops.length - 1; i >= 0; i--) {
      const d = funDrops[i];
      d.life -= dt;
      d.vy += d.gravity * dt;
      d.x += (d.vx + Math.sin(t * 2.6 + d.sway) * 26) * dt;
      d.y += d.vy * dt;
      d.rot += d.vrot * dt;
      if (d.life <= 0 || d.y > vh + 40) { funDrops.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(0.95, d.life / 0.5);
      ctx.translate(d.x, d.y);
      ctx.rotate(d.rot);
      if (d.kind === "confetti") {
        ctx.fillStyle = d.color;
        ctx.scale(1, Math.cos(t * 7 + d.sway));
        ctx.fillRect(-d.size * 0.55, -d.size * 0.32, d.size * 1.1, d.size * 0.64);
      } else {
        ctx.font = `${Math.round(d.size)}px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(d.icon, 0, 0);
      }
      ctx.restore();
    }

    // 粒子與飄字
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += 420 * dt;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = Math.max(0, p.life / p.maxLife);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const ft = floatTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) { floatTexts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life / 0.3);
      const isWideScr = vw > vh;
      const fontPx = isWideScr ? 22 : 19;
      ctx.font = `800 ${fontPx}px 'Noto Serif TC', 'PingFang TC', sans-serif`;

      // 平衡雙行折行：避免折行後第二行只剩 1-3 個字，優先在標點後斷行且上下寬度對稱
      const maxBubbleW = Math.min(vw - 24, isWideScr ? 540 : 350);
      const maxTextW = maxBubbleW - 34;
      const fullW = ctx.measureText(ft.text).width;
      const lines = [];
      if (fullW <= maxTextW) {
        lines.push(ft.text);
      } else {
        const chars = Array.from(ft.text);
        let bestIdx = Math.ceil(chars.length / 2);
        let bestScore = Infinity;
        for (let idx = 2; idx <= chars.length - 2; idx++) {
          const l1 = chars.slice(0, idx).join("");
          const l2 = chars.slice(idx).join("");
          const w1 = ctx.measureText(l1).width;
          const w2 = ctx.measureText(l2).width;
          if (w1 > maxTextW || w2 > maxTextW) continue;
          const prevCh = chars[idx - 1];
          const punctBonus = /[！，。？：、]/.test(prevCh) ? -45 : 0;
          const score = Math.abs(w1 - w2) + punctBonus;
          if (score < bestScore) {
            bestScore = score;
            bestIdx = idx;
          }
        }
        if (bestScore < Infinity) {
          lines.push(chars.slice(0, bestIdx).join("").trim());
          lines.push(chars.slice(bestIdx).join("").trim());
        } else {
          let cur = "";
          for (const ch of chars) {
            if (ctx.measureText(cur + ch).width > maxTextW && cur.length > 0) {
              lines.push(cur);
              cur = ch;
            } else cur += ch;
          }
          if (cur) lines.push(cur);
        }
      }

      const lineH = fontPx + 7;
      const longestW = Math.max(...lines.map(l => ctx.measureText(l).width));
      const bw = Math.min(maxBubbleW, Math.max(150, longestW + 34));
      const bh = lines.length * lineH + 18;
      const tailH = 12;
      const hudB = (document.querySelector(".top-hud")?.getBoundingClientRect().bottom || 58) + 12;
      const targetAnchorX = activeCharCenterX;
      const targetBottomY = activeCharTopY - 16;
      const by = Math.max(hudB, targetBottomY - bh - tailH);
      const bx = Math.max(12, Math.min(vw - bw - 12, targetAnchorX - bw * 0.5));
      const tailX = Math.max(bx + 22, Math.min(bx + bw - 22, targetAnchorX));
      const r = 14;

      // 繪製帶小尾巴的圓角矩形漫畫對話泡泡框
      ctx.shadowColor = "rgba(0,0,0,0.45)";
      ctx.shadowBlur = 12;
      ctx.shadowOffsetY = 4;
      ctx.beginPath();
      ctx.moveTo(bx + r, by);
      ctx.lineTo(bx + bw - r, by);
      ctx.quadraticCurveTo(bx + bw, by, bx + bw, by + r);
      ctx.lineTo(bx + bw, by + bh - r);
      ctx.quadraticCurveTo(bx + bw, by + bh, bx + bw - r, by + bh);
      ctx.lineTo(tailX + 10, by + bh);
      ctx.lineTo(tailX, by + bh + tailH);
      ctx.lineTo(tailX - 10, by + bh);
      ctx.lineTo(bx + r, by + bh);
      ctx.quadraticCurveTo(bx, by + bh, bx, by + bh - r);
      ctx.lineTo(bx, by + r);
      ctx.quadraticCurveTo(bx, by, bx + r, by);
      ctx.closePath();

      ctx.fillStyle = "#fffaf0";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "#2b1a10";
      ctx.lineWidth = 3;
      ctx.stroke();

      ctx.fillStyle = "#2b1a10";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      const startY = by + bh * 0.5 - ((lines.length - 1) * lineH) * 0.5;
      lines.forEach((ln, idx) => {
        ctx.fillText(ln, bx + bw * 0.5, startY + idx * lineH, bw - 22);
      });
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();




