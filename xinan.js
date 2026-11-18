(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const meritEl = document.getElementById("meritCount");
  const btnSound = document.getElementById("btnSound");
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
    bg: "./assets/xinan-temple-bg-portrait-hd.webp?v=20261118_hd2k_v8",
    bgDesktop: "./assets/xinan-temple-bg-desktop-hd.webp?v=20261118_hd2k_v8",
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
    "3畝_normal": "./assets/office-fullbody-webp/3畝_normal.webp?v=20261118_hd2k_v8",
    "3畝_happy": "./assets/office-fullbody-webp/3畝_happy.webp?v=20261118_hd2k_v8",
    "3畝_hurt_cry": "./assets/office-fullbody-webp/3畝_hurt_cry.webp?v=20261118_hd2k_v8",
    "3畝_innocent": "./assets/office-fullbody-webp/3畝_innocent.webp?v=20261118_hd2k_v8",
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
  const preferDesktopBg = window.innerWidth > window.innerHeight;
  const immediateKeys = [
    preferDesktopBg ? "bgDesktop" : "bg",
    "weapon-slipper",
    "Tony_normal", "Tony_happy", "Tony_hurt_cry", "Tony_innocent"
  ];
  immediateKeys.forEach(loadImg);
  setTimeout(() => {
    Object.keys(assetUrls).forEach(k => {
      if (!imgs[k]) loadImg(k);
    });
  }, 80);

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

  // --- 粒子與飄字 ---
  const particles = [];
  const floatTexts = [];
  let shake = 0;

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
    floatTexts.push({ x, y, text, color, size: Math.min(18, size), life: 2.3, maxLife: 2.3 });
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
      villainFly = 1;
      setCharMood("happy", 1.8);
      addMerit(15);
      playWeaponSound(selectedWeapon.id, true);
      playBellSound(392);
      spawnBurst(altarX, altarY - 15, "#ffd466", 34, 340);
      spawnBurst(altarX, altarY - 15, selectedWeapon.color, 22, 260);
      const heavyWord = selectedScenario.fullBody
        ? `${selectedScenario.label} 慶祝達標！`
        : `${selectedWeapon.label}鎮煞重擊！`;
      spawnFloatText(altarX, altarY - 95, heavyWord, "#ffd466", 25);
      renderControls();
    } else {
      slapCombo += 1;
      slapCharge = Math.min(10, slapCharge + 1);
      setCharMood("hurt_cry", 0.9);
      addMerit(selectedWeapon.power);
      playWeaponSound(selectedWeapon.id, false);
      spawnBurst(altarX, altarY - 10, selectedWeapon.color, 14, 210);
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

  function launchBlessing() {
    const wishText = customWishLabel.trim() || selectedBless.label;
    playBellSound(660);
    addMerit(10);
    risingProps.push({
      x: vw * 0.5,
      y: vh * 0.57,
      vx: (Math.random() - 0.5) * 20,
      vy: -82 - Math.random() * 20,
      scale: 1,
      wobble: Math.random() * Math.PI * 2,
      sprite: selectedBless.sprite,
      age: 0
    });
    spawnBurst(vw * 0.5, vh * 0.56, selectedBless.color, 22, 200);
    spawnFloatText(vw * 0.5, vh * 0.42, `「${wishText}」祈福昇空！`, "#ffd980", 22);
  }

  // =========================================================
  // 3. 問卦（完整竹籤筒＋靈籤抽出＋完整紅木聖筊）
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
    playWoodClack();
    setTimeout(playWoodClack, 180);
    setTimeout(playWoodClack, 360);
    renderControls();
  }

  function throwBlocks() {
    if (oracleStep !== "drawn") return;
    oracleStep = "throwing";
    oracleTimer = 0.9;
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

    if (mode === "slap") {
      slapScenarios.forEach(s => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip-btn" + (selectedScenario.id === s.id && !customTargetLabel ? " active" : "");
        b.textContent = s.label;
        b.onclick = () => { selectedScenario = s; customTargetLabel = ""; renderControls(); };
        chipsRow.appendChild(b);
      });
      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 10;
      inp.className = "custom-input";
      inp.placeholder = "自訂小人...";
      inp.value = customTargetLabel;
      inp.oninput = () => {
        customTargetLabel = inp.value;
        chipsRow.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      };
      chipsRow.appendChild(inp);

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
      ultBtn.className = "rect-btn " + (slapCharge >= 10 ? "gold-btn" : "");
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
          theaterTimer = 2.8;
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
        chipsRow.appendChild(b);
      });
      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 10;
      inp.className = "custom-input";
      inp.placeholder = "輸入心願...";
      inp.value = customWishLabel;
      inp.oninput = () => {
        customWishLabel = inp.value;
        chipsRow.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      };
      chipsRow.appendChild(inp);

      const blessBtn = document.createElement("button");
      blessBtn.type = "button";
      blessBtn.id = "btnPrimaryAction";
      blessBtn.className = "rect-btn gold-btn";
      blessBtn.textContent = selectedBless.action;
      blessBtn.onclick = launchBlessing;
      actionRow.appendChild(blessBtn);
    } else if (mode === "oracle") {
      const tip = document.createElement("span");
      tip.style.fontSize = "12px";
      tip.style.background = "rgba(20,17,26,0.78)";
      tip.style.padding = "4px 10px";
      tip.style.borderRadius = "6px";
      tip.textContent = oracleStep === "ready"
        ? "點擊「誠心求籤」或輕點神壇籤筒"
        : oracleStep === "drawn"
          ? "靈籤已出！請點擊「擲筊解籤」"
          : oracleStep === "done"
            ? "聖筊應許！可再求下一籤"
            : oracleStep === "shaking" ? "誠心搖籤中..." : "聖筊落下中...";
      chipsRow.appendChild(tip);

      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btnPrimaryAction";
      btn.className = "rect-btn " + (oracleStep === "drawn" ? "gold-btn" : "primary-btn");
      btn.textContent = oracleStep === "drawn" ? "擲筊解籤" : "誠心求籤";
      btn.disabled = oracleStep === "shaking" || oracleStep === "throwing";
      btn.onclick = () => {
        if (oracleStep === "ready" || oracleStep === "done") shakeOracle();
        else if (oracleStep === "drawn") throwBlocks();
      };
      actionRow.appendChild(btn);
    }
  }

  document.querySelectorAll(".mode-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      mode = btn.dataset.mode;
      document.querySelectorAll(".mode-btn").forEach(b => b.classList.toggle("active", b === btn));
      resultCard.classList.add("hidden");
      oracleStep = "ready";
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
    const bg = (isWide && imgs.bgDesktop && imgs.bgDesktop.complete && imgs.bgDesktop.naturalWidth > 0)
      ? imgs.bgDesktop
      : imgs.bg;
    if (bg && bg.complete && bg.naturalWidth > 0) {
      const scale = Math.max(vw / bg.naturalWidth, vh / bg.naturalHeight) * 1.02;
      const dw = bg.naturalWidth * scale;
      const dh = bg.naturalHeight * scale;
      const dx = (vw - dw) * 0.5 + Math.sin(t * 0.35) * 5;
      const dy = (vh - dh) * 0.5 + Math.cos(t * 0.25) * 4;
      ctx.drawImage(bg, dx, dy, dw, dh);
      // 供桌石台頂面中段 Y 座標（直式 0.675 / 橫式 0.665）
      bgTableSurfaceY = dy + dh * (isWide ? 0.665 : 0.675);
      const grad = ctx.createRadialGradient(vw * 0.5, vh * 0.54, vh * 0.14, vw * 0.5, vh * 0.54, Math.max(vw, vh) * 0.85);
      grad.addColorStop(0, "rgba(20,16,24,0.03)");
      grad.addColorStop(1, "rgba(12,10,16,0.44)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);
    } else {
      bgTableSurfaceY = vh * 0.66;
      ctx.fillStyle = "#191521";
      ctx.fillRect(0, 0, vw, vh);
    }

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

    // 1. 打小人舞台
    if (mode === "slap") {
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

      const vImg = selectedScenario.fullBody
        ? getActiveFullBodySprite(selectedScenario.charKey)
        : imgs[selectedScenario.sprite];
      // 所有全身角色依該角色 normal 站姿的實際不透明高度統一縮放，保證每個人大小完全一致且切換坐/跪姿不變大顆
      const isWide = vw > vh;
      const dockEl = document.querySelector(".bottom-dock");
      const dockTop = dockEl ? dockEl.getBoundingClientRect().top : (vh - 125);
      const hudEl = document.querySelector(".top-hud");
      const hudBottom = hudEl ? hudEl.getBoundingClientRect().bottom : 58;
      const safeSpan = Math.max(220, dockTop - hudBottom - 70);
      const vSize = isWide ? Math.min(285, safeSpan * 0.64) : Math.min(235, safeSpan * 0.56);
      const scaleX = 1 + villainSquash * 0.14;
      const scaleY = 1 - villainSquash * 0.14;
      const flyY = villainFly > 0 ? -Math.sin(villainFly * Math.PI) * 120 : 0;
      const wobble = villainDizzy > 0 ? Math.sin(t * 28) * 0.08 : Math.sin(t * 2.5) * 0.02;

      // 隨機劇場自動輪演：持續演超爆笑辦公室＋螢幕銷售劇情＋三不五十自動打幾下
      if (autoTheater && resultCard.classList.contains("hidden")) {
        theaterTimer -= dt;
        if (theaterTimer <= 0) {
          theaterTimer = 3.0 + Math.random() * 1.4;
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

      // 腳底穩穩踩在背景供桌石台頂面上，絕不懸空；陰影固定貼在供桌平面
      const feetBaseY = Math.min(dockTop - 22, Math.max(hudBottom + vSize + 64, bgTableSurfaceY + 14));
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

        const moodFace = moodNow === "hurt_cry" ? "(＞﹏＜) 哭泣" : moodNow === "innocent" ? "(・_・;) 無辜" : moodNow === "happy" ? "(＾▽＾) 歡樂" : "(•̀ᴗ•́) 一般";
        ctx.font = "bold 18px 'Noto Serif TC', serif";
        ctx.fillStyle = "#ffd980";
        ctx.fillText(moodFace, 0, -h * 0.44);
      }
      ctx.restore();

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
        ctx.translate(wxPos, wyPos);
        ctx.rotate(wRot);
        if (weaponHeavy && weaponAnim > 0) {
          ctx.shadowColor = "#ffd466";
          ctx.shadowBlur = 28;
        }
        const aspect = wImg.naturalWidth / wImg.naturalHeight;
        ctx.drawImage(wImg, -wSize * aspect * 0.5, -wSize * 0.5, wSize * aspect, wSize);
        ctx.restore();
      }
    }

    // 2. 祈福舞台（4 種專屬祈福道具）
    if (mode === "bless") {
      const pImg = imgs[selectedBless.sprite];
      const pSize = Math.min(215, propBase * 0.41);
      const wishText = customWishLabel.trim() || selectedBless.label;
      if (pImg && pImg.complete && pImg.naturalWidth > 0) {
        const aspect = pImg.naturalWidth / pImg.naturalHeight;
        const bob = Math.sin(t * 2.4) * 6;
        ctx.save();
        ctx.translate(altarX, altarY + bob);
        ctx.shadowColor = selectedBless.color;
        ctx.shadowBlur = 22;
        ctx.drawImage(pImg, -pSize * aspect * 0.5, -pSize * 0.5, pSize * aspect, pSize);
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(253, 246, 232, 0.94)";
        ctx.strokeStyle = "#972819";
        ctx.lineWidth = 1.5;
        const lw = ctx.measureText(wishText).width + 24;
        ctx.beginPath();
        ctx.roundRect(-Math.max(54, lw * 0.5), pSize * 0.46, Math.max(108, lw), 26, 6);
        ctx.fill();
        ctx.stroke();
        ctx.fillStyle = "#972819";
        ctx.font = "bold 14px 'Noto Serif TC', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(wishText, 0, pSize * 0.46 + 13);
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
          const h = pSize * rp.scale;
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

    // 3. 問卦舞台（完整竹籤筒 + 靈籤抽出 + 完整聖筊）
    if (mode === "oracle") {
      if (oracleStep === "shaking") {
        oracleTimer -= dt;
        if (oracleTimer <= 0) {
          oracleStep = "drawn";
          drawnFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
          playBellSound(587);
          spawnBurst(altarX - 45, altarY - 95, "#ffd466", 18, 170);
          spawnFloatText(altarX, altarY - 135, "靈籤已出！請擲筊", "#ffe699", 21);
          renderControls();
        }
      } else if (oracleStep === "throwing") {
        oracleTimer -= dt;
        if (oracleTimer <= 0) {
          oracleStep = "done";
          addMerit(10);
          playBellSound(784);
          spawnBurst(altarX + 60, altarY + 35, "#ffd466", 24, 220);
          showResult(
            drawnFortune.grade,
            drawnFortune.title,
            drawnFortune.body,
            "聖筊應許 ・ 心安 +10"
          );
          renderControls();
        }
      }

      const tImg = imgs["oracle-tube"];
      const sImg = imgs["oracle-stick"];
      const bImg = imgs["oracle-blocks"];
      const cImg = imgs["oracle-censer"];

      // 背後小香爐裝飾
      if (cImg && cImg.complete && cImg.naturalWidth > 0) {
        const ch = Math.min(110, propBase * 0.22);
        const ca = cImg.naturalWidth / cImg.naturalHeight;
        ctx.save();
        ctx.translate(altarX, altarY - 52);
        ctx.drawImage(cImg, -ch * ca * 0.5, -ch * 0.5, ch * ca, ch);
        ctx.restore();
      }

      const tubeH = Math.min(220, propBase * 0.42);
      const shakeRot = oracleStep === "shaking" ? Math.sin(t * 36) * 0.22 : Math.sin(t * 1.5) * 0.02;
      const shakeY = oracleStep === "shaking" ? Math.abs(Math.sin(t * 28)) * -18 : 0;

      // 抽出的靈籤（位於籤筒上方）
      if ((oracleStep === "drawn" || oracleStep === "throwing" || oracleStep === "done") && sImg && sImg.complete && sImg.naturalWidth > 0) {
        const stickH = Math.min(130, propBase * 0.25);
        const sa = sImg.naturalWidth / sImg.naturalHeight;
        ctx.save();
        ctx.translate(altarX - 50, altarY - tubeH * 0.55 + Math.sin(t * 3) * 4);
        ctx.rotate(-0.35);
        ctx.shadowColor = "#ffd466";
        ctx.shadowBlur = 16;
        ctx.drawImage(sImg, -stickH * sa * 0.5, -stickH * 0.5, stickH * sa, stickH);
        ctx.restore();
      }

      // 完整竹籤筒
      if (tImg && tImg.complete && tImg.naturalWidth > 0) {
        const aspect = tImg.naturalWidth / tImg.naturalHeight;
        ctx.save();
        ctx.translate(altarX - 52, altarY + 12 + shakeY);
        ctx.rotate(shakeRot);
        ctx.drawImage(tImg, -tubeH * aspect * 0.5, -tubeH * 0.5, tubeH * aspect, tubeH);
        ctx.restore();
      }

      // 完整一對紅木聖筊（絕不裁切分割）
      if (bImg && bImg.complete && bImg.naturalWidth > 0) {
        const bH = Math.min(115, propBase * 0.22);
        const aspect = bImg.naturalWidth / bImg.naturalHeight;
        const tossY = oracleStep === "throwing" ? -Math.sin((1 - oracleTimer / 0.9) * Math.PI) * 135 : 0;
        const tossRot = oracleStep === "throwing" ? (1 - oracleTimer / 0.9) * Math.PI * 6 : 0;
        ctx.save();
        ctx.translate(altarX + 66, altarY + 46 + tossY);
        ctx.rotate(tossRot);
        ctx.drawImage(bImg, -bH * aspect * 0.5, -bH * 0.5, bH * aspect, bH);
        ctx.restore();
      }
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

      // 自動依畫布寬度換行（最多 2 行），確保超大字體不溢出
      const maxBubbleW = Math.min(vw - 24, isWideScr ? 540 : 350);
      const maxTextW = maxBubbleW - 32;
      const lines = [];
      let cur = "";
      for (const ch of ft.text) {
        if (ctx.measureText(cur + ch).width > maxTextW && cur.length > 0) {
          lines.push(cur);
          cur = ch;
        } else {
          cur += ch;
        }
      }
      if (cur) lines.push(cur);

      const lineH = fontPx + 7;
      const longestW = Math.max(...lines.map(l => ctx.measureText(l).width));
      const bw = Math.min(maxBubbleW, Math.max(150, longestW + 34));
      const bh = lines.length * lineH + 18;
      const tailH = 12;
      const hudB = (document.querySelector(".top-hud")?.getBoundingClientRect().bottom || 58) + 12;
      const targetAnchorX = mode === "slap" ? activeCharCenterX : ft.x;
      const targetBottomY = mode === "slap" ? (activeCharTopY - 16) : (ft.y - 12);
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




