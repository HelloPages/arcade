(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const meritEl = document.getElementById("meritCount");
  const btnSound = document.getElementById("btnSound");
  const chipsRow = document.getElementById("chipsRow");
  const actionRow = document.getElementById("actionRow");
  const resultCard = document.getElementById("resultCard");
  const resultBadge = document.getElementById("resultBadge");
  const resultTitle = document.getElementById("resultTitle");
  const resultBody = document.getElementById("resultBody");
  const resultSub = document.getElementById("resultSub");
  const btnCloseResult = document.getElementById("btnCloseResult");

  // --- 資源載入 ---
  const assetUrls = {
    bg: "./assets/xinan-temple-bg.jpg",
    slipper: "./assets/xinan-slipper.png",
    villain: "./assets/xinan-villain.png",
    lantern: "./assets/xinan-lantern.png",
    tube: "./assets/xinan-fortune-tube.png",
    blocks: "./assets/xinan-moon-blocks.png"
  };
  const imgs = {};
  for (const [k, src] of Object.entries(assetUrls)) {
    const im = new Image();
    im.src = src;
    imgs[k] = im;
  }

  // --- Web Audio 合成音效（零外部依賴） ---
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
  function playSlapSound(heavy = false) {
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = heavy ? "sawtooth" : "triangle";
    osc.frequency.setValueAtTime(heavy ? 180 : 280, now);
    osc.frequency.exponentialRampToValueAtTime(heavy ? 45 : 65, now + (heavy ? 0.22 : 0.12));
    gain.gain.setValueAtTime(heavy ? 0.35 : 0.22, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + (heavy ? 0.24 : 0.13));
    osc.connect(gain).connect(ac.destination);
    osc.start(now);
    osc.stop(now + (heavy ? 0.25 : 0.14));
  }
  function playBellSound(freq = 528) {
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;
    const osc = ac.createOscillator();
    const osc2 = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = "sine";
    osc2.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc2.frequency.setValueAtTime(freq * 1.5, now);
    gain.gain.setValueAtTime(0.18, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.9);
    osc.connect(gain);
    osc2.connect(gain);
    gain.connect(ac.destination);
    osc.start(now);
    osc2.start(now);
    osc.stop(now + 0.95);
    osc2.stop(now + 0.95);
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
    osc.start(now);
    osc.stop(now + 0.09);
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
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(vw * dpr);
    canvas.height = Math.round(vh * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  window.addEventListener("resize", resize);
  resize();

  // --- 粒子與飄字系統 ---
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
  function spawnFloatText(x, y, text, color = "#ffe59e", size = 22) {
    floatTexts.push({ x, y, text, color, size, life: 0.9, maxLife: 0.9 });
  }

  // --- 背景香煙與星火 ---
  const embers = Array.from({ length: 24 }, () => ({
    x: Math.random(),
    y: Math.random(),
    r: 1.2 + Math.random() * 2.2,
    vy: 0.02 + Math.random() * 0.04,
    phase: Math.random() * Math.PI * 2
  }));

  // =========================================================
  // 1. 打小人狀態
  // =========================================================
  const slapTargets = ["拖延症", "水逆退散", "豬隊友", "加班煩惱", "口舌是非"];
  let selectedTarget = slapTargets[0];
  let slapCombo = 0;
  let slapCharge = 0; // 0..10
  let slipperAnim = 0; // 0..1
  let slipperHeavy = false;
  let villainSquash = 0;
  let villainDizzy = 0;
  let villainFly = 0;

  function performSlap(heavy = false) {
    if (resultCard && !resultCard.classList.contains("hidden")) return;
    if (heavy && slapCharge < 10) return;

    slipperAnim = 1;
    slipperHeavy = heavy;
    villainSquash = heavy ? 1.0 : 0.65;
    villainDizzy = heavy ? 2.2 : 0.8;
    shake = heavy ? 18 : 8;

    const altarX = vw * 0.5;
    const altarY = vh * 0.60;

    if (heavy) {
      slapCharge = 0;
      slapCombo += 5;
      villainFly = 1;
      addMerit(15);
      playSlapSound(true);
      playBellSound(392);
      spawnBurst(altarX, altarY - 20, "#ffd466", 34, 340);
      spawnBurst(altarX, altarY - 20, "#ff5c42", 22, 260);
      spawnFloatText(altarX, altarY - 90, "鎮煞重擊！小人退散！", "#ffd466", 26);
      renderControls();
    } else {
      slapCombo += 1;
      slapCharge = Math.min(10, slapCharge + 1);
      addMerit(2);
      playSlapSound(false);
      spawnBurst(altarX, altarY - 10, "#ffbe55", 14, 210);
      const words = ["啪！", "打走霉運！", "退散！", "順心！", `${slapCombo} 連擊！`];
      spawnFloatText(
        altarX + (Math.random() - 0.5) * 90,
        altarY - 80,
        words[slapCombo % words.length],
        "#ffe7a3",
        21
      );
      if (slapCharge === 10) renderControls();
    }
  }

  // =========================================================
  // 2. 祈福天燈狀態
  // =========================================================
  const wishChips = ["平安健康", "財運亨通", "事業順遂", "貴人相助", "心想事成"];
  let selectedWish = wishChips[0];
  const risingLanterns = [];

  function launchLantern() {
    const wishText = selectedWish.trim() || "平安健康";
    playBellSound(660);
    addMerit(10);
    risingLanterns.push({
      x: vw * 0.5,
      y: vh * 0.62,
      vx: (Math.random() - 0.5) * 18,
      vy: -78 - Math.random() * 22,
      scale: 1,
      wobble: Math.random() * Math.PI * 2,
      wish: wishText,
      age: 0
    });
    spawnBurst(vw * 0.5, vh * 0.60, "#ffcf70", 20, 180);
    spawnFloatText(vw * 0.5, vh * 0.45, `「${wishText}」祈福升空！`, "#ffd980", 22);
  }

  // =========================================================
  // 3. 問卦靈籤狀態
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
  let biaoResult = "";

  function shakeOracle() {
    if (oracleStep === "shaking" || oracleStep === "throwing") return;
    oracleStep = "shaking";
    oracleTimer = 1.05;
    playWoodClack();
    setTimeout(playWoodClack, 180);
    setTimeout(playWoodClack, 360);
    renderControls();
  }

  function throwBlocks() {
    if (oracleStep !== "drawn") return;
    oracleStep = "throwing";
    oracleTimer = 0.95;
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
    actionRow.innerHTML = "";

    if (mode === "slap") {
      slapTargets.forEach(t => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip-btn" + (selectedTarget === t ? " active" : "");
        b.textContent = t;
        b.onclick = () => { selectedTarget = t; renderControls(); };
        chipsRow.appendChild(b);
      });
      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 10;
      inp.className = "custom-input";
      inp.placeholder = "自訂小人...";
      inp.value = slapTargets.includes(selectedTarget) ? "" : selectedTarget;
      inp.oninput = () => {
        selectedTarget = inp.value.trim() || slapTargets[0];
        chipsRow.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      };
      chipsRow.appendChild(inp);

      const slapBtn = document.createElement("button");
      slapBtn.type = "button";
      slapBtn.id = "btnPrimaryAction";
      slapBtn.className = "rect-btn primary-btn";
      slapBtn.textContent = "藍白拖連擊！";
      slapBtn.onclick = () => performSlap(false);
      actionRow.appendChild(slapBtn);

      const ultBtn = document.createElement("button");
      ultBtn.type = "button";
      ultBtn.id = "btnUltimateSlap";
      ultBtn.className = "rect-btn " + (slapCharge >= 10 ? "gold-btn" : "");
      ultBtn.textContent = slapCharge >= 10 ? "黃金鎮煞重擊！" : `蓄力 (${slapCharge}/10)`;
      ultBtn.disabled = slapCharge < 10;
      ultBtn.onclick = () => performSlap(true);
      actionRow.appendChild(ultBtn);
    } else if (mode === "bless") {
      wishChips.forEach(w => {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "chip-btn" + (selectedWish === w ? " active" : "");
        b.textContent = w;
        b.onclick = () => { selectedWish = w; renderControls(); };
        chipsRow.appendChild(b);
      });
      const inp = document.createElement("input");
      inp.type = "text";
      inp.maxLength = 10;
      inp.className = "custom-input";
      inp.placeholder = "輸入心願...";
      inp.value = wishChips.includes(selectedWish) ? "" : selectedWish;
      inp.oninput = () => {
        selectedWish = inp.value.trim() || wishChips[0];
        chipsRow.querySelectorAll(".chip-btn").forEach(c => c.classList.remove("active"));
      };
      chipsRow.appendChild(inp);

      const blessBtn = document.createElement("button");
      blessBtn.type = "button";
      blessBtn.id = "btnPrimaryAction";
      blessBtn.className = "rect-btn gold-btn";
      blessBtn.textContent = "點燃祈福天燈 ↗";
      blessBtn.onclick = launchLantern;
      actionRow.appendChild(blessBtn);
    } else if (mode === "oracle") {
      const tip = document.createElement("span");
      tip.style.fontSize = "12px";
      tip.style.background = "rgba(20,17,26,0.75)";
      tip.style.padding = "4px 10px";
      tip.style.borderRadius = "6px";
      tip.textContent = oracleStep === "ready"
        ? "點擊「誠心求籤」或輕點籤筒"
        : oracleStep === "drawn"
          ? "已抽出靈籤！請擲筊確認"
          : oracleStep === "done"
            ? "求籤完成！可收下祝福或再求一籤"
            : oracleStep === "shaking" ? "誠心搖籤中..." : "擲筊落下中...";
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

  // 直接點擊畫布也可互動
  canvas.addEventListener("pointerdown", () => {
    if (!resultCard.classList.contains("hidden")) return;
    if (mode === "slap") performSlap(false);
    else if (mode === "bless") launchLantern();
    else if (mode === "oracle") {
      if (oracleStep === "ready" || oracleStep === "done") shakeOracle();
      else if (oracleStep === "drawn") throwBlocks();
    }
  });

  window.addEventListener("keydown", e => {
    if (e.code === "Space" && document.activeElement.tagName !== "INPUT") {
      e.preventDefault();
      if (mode === "slap") performSlap(false);
      else if (mode === "bless") launchLantern();
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
  function drawBackground(t) {
    const bg = imgs.bg;
    if (bg && bg.complete && bg.naturalWidth > 0) {
      const scale = Math.max(vw / bg.naturalWidth, vh / bg.naturalHeight) * 1.04;
      const dw = bg.naturalWidth * scale;
      const dh = bg.naturalHeight * scale;
      const dx = (vw - dw) * 0.5 + Math.sin(t * 0.35) * 6;
      const dy = (vh - dh) * 0.5 + Math.cos(t * 0.25) * 4;
      ctx.drawImage(bg, dx, dy, dw, dh);
      // 柔和暗角突顯前景神壇與道具
      const grad = ctx.createRadialGradient(vw * 0.5, vh * 0.55, vh * 0.12, vw * 0.5, vh * 0.55, Math.max(vw, vh) * 0.8);
      grad.addColorStop(0, "rgba(20,16,24,0.05)");
      grad.addColorStop(1, "rgba(12,10,16,0.58)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, vw, vh);
    } else {
      ctx.fillStyle = "#191521";
      ctx.fillRect(0, 0, vw, vh);
    }

    // 浮動金塵星火
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
    const altarY = vh * 0.59;
    const propBase = Math.min(vw, vh);

    // 1. 打小人舞台
    if (mode === "slap") {
      if (slipperAnim > 0) slipperAnim = Math.max(0, slipperAnim - dt * 4.2);
      if (villainSquash > 0) villainSquash = Math.max(0, villainSquash - dt * 3.2);
      if (villainDizzy > 0) villainDizzy = Math.max(0, villainDizzy - dt);
      if (villainFly > 0) villainFly = Math.max(0, villainFly - dt * 1.6);

      // 小人紙偶
      const vImg = imgs.villain;
      const vSize = Math.min(220, propBase * 0.42);
      const scaleX = 1 + villainSquash * 0.35;
      const scaleY = 1 - villainSquash * 0.45;
      const flyY = villainFly > 0 ? -Math.sin(villainFly * Math.PI) * 140 : 0;
      const wobble = villainDizzy > 0 ? Math.sin(t * 28) * 0.14 : Math.sin(t * 2.5) * 0.03;

      ctx.save();
      ctx.translate(altarX, altarY + flyY);
      ctx.rotate(wobble);
      ctx.scale(scaleX, scaleY);
      // 投影
      ctx.fillStyle = "rgba(0,0,0,0.32)";
      ctx.beginPath();
      ctx.ellipse(0, vSize * 0.44, vSize * 0.34, vSize * 0.09, 0, 0, Math.PI * 2);
      ctx.fill();

      if (vImg && vImg.complete && vImg.naturalWidth > 0) {
        const aspect = vImg.naturalWidth / vImg.naturalHeight;
        const h = vSize;
        const w = h * aspect;
        ctx.drawImage(vImg, -w * 0.5, -h * 0.5, w, h);
      }
      ctx.restore();

      // 小人標籤牌
      ctx.save();
      ctx.font = "bold 16px 'Noto Serif TC', serif";
      const labelW = ctx.measureText(selectedTarget).width + 26;
      ctx.fillStyle = "rgba(248,241,228,0.92)";
      ctx.strokeStyle = "#972819";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(altarX - labelW * 0.5, altarY + vSize * 0.46, labelW, 30, 6);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#2b211a";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(selectedTarget, altarX, altarY + vSize * 0.46 + 15);
      ctx.restore();

      // 藍白拖動態揮擊
      const sImg = imgs.slipper;
      if (sImg && sImg.complete && sImg.naturalWidth > 0) {
        const sSize = Math.min(200, propBase * 0.38) * (slipperHeavy ? 1.25 : 1);
        const swing = slipperAnim > 0 ? Math.sin(slipperAnim * Math.PI) : 0;
        const sxPos = altarX + 100 - swing * 95;
        const syPos = altarY - 120 + swing * 105;
        const sRot = 0.45 - swing * 1.15;

        ctx.save();
        ctx.translate(sxPos, syPos);
        ctx.rotate(sRot);
        if (slipperHeavy && slipperAnim > 0) {
          ctx.shadowColor = "#ffd466";
          ctx.shadowBlur = 28;
        }
        const aspect = sImg.naturalWidth / sImg.naturalHeight;
        ctx.drawImage(sImg, -sSize * aspect * 0.5, -sSize * 0.5, sSize * aspect, sSize);
        ctx.restore();
      }
    }

    // 2. 祈福天燈舞台
    if (mode === "bless") {
      // 神壇上待點燃的天燈
      const lImg = imgs.lantern;
      const lSize = Math.min(210, propBase * 0.40);
      if (lImg && lImg.complete && lImg.naturalWidth > 0) {
        const aspect = lImg.naturalWidth / lImg.naturalHeight;
        const bob = Math.sin(t * 2.4) * 6;
        ctx.save();
        ctx.translate(altarX, altarY + bob);
        ctx.shadowColor = "rgba(255, 190, 85, 0.55)";
        ctx.shadowBlur = 24;
        ctx.drawImage(lImg, -lSize * aspect * 0.5, -lSize * 0.5, lSize * aspect, lSize);
        // 願望貼條
        ctx.shadowBlur = 0;
        ctx.fillStyle = "rgba(253, 246, 232, 0.92)";
        ctx.beginPath();
        ctx.roundRect(-52, -16, 104, 28, 5);
        ctx.fill();
        ctx.fillStyle = "#972819";
        ctx.font = "bold 14px 'Noto Serif TC', serif";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(selectedWish, 0, -2);
        ctx.restore();
      }

      // 升空中的天燈群
      for (let i = risingLanterns.length - 1; i >= 0; i--) {
        const ln = risingLanterns[i];
        ln.age += dt;
        ln.x += (ln.vx + Math.sin(t * 2 + ln.wobble) * 14) * dt;
        ln.y += ln.vy * dt;
        ln.scale = Math.max(0.28, 1 - ln.age * 0.14);
        if (lImg && lImg.complete) {
          const aspect = lImg.naturalWidth / lImg.naturalHeight;
          const h = lSize * ln.scale;
          ctx.save();
          ctx.globalAlpha = Math.max(0, 1 - ln.age / 5.5);
          ctx.translate(ln.x, ln.y);
          ctx.rotate(Math.sin(t * 3 + ln.wobble) * 0.05);
          ctx.shadowColor = "rgba(255, 190, 85, 0.7)";
          ctx.shadowBlur = 18;
          ctx.drawImage(lImg, -h * aspect * 0.5, -h * 0.5, h * aspect, h);
          ctx.restore();
        }
        if (ln.y < -160 || ln.age > 5.5) risingLanterns.splice(i, 1);
      }
    }

    // 3. 問卦靈籤舞台
    if (mode === "oracle") {
      if (oracleStep === "shaking") {
        oracleTimer -= dt;
        if (oracleTimer <= 0) {
          oracleStep = "drawn";
          drawnFortune = fortunes[Math.floor(Math.random() * fortunes.length)];
          playBellSound(587);
          spawnBurst(altarX, altarY - 90, "#ffd466", 18, 170);
          spawnFloatText(altarX, altarY - 120, "靈籤已出！請擲筊", "#ffe699", 21);
          renderControls();
        }
      } else if (oracleStep === "throwing") {
        oracleTimer -= dt;
        if (oracleTimer <= 0) {
          oracleStep = "done";
          biaoResult = "聖筊應許";
          addMerit(10);
          playBellSound(784);
          spawnBurst(altarX, altarY + 30, "#ffd466", 24, 220);
          showResult(
            drawnFortune.grade,
            drawnFortune.title,
            drawnFortune.body,
            `${biaoResult} ・ 心安 +10`
          );
          renderControls();
        }
      }

      const tImg = imgs.tube;
      const bImg = imgs.blocks;
      const tubeH = Math.min(230, propBase * 0.44);
      const shakeRot = oracleStep === "shaking" ? Math.sin(t * 36) * 0.22 : Math.sin(t * 1.5) * 0.02;
      const shakeY = oracleStep === "shaking" ? Math.abs(Math.sin(t * 28)) * -18 : 0;

      if (tImg && tImg.complete && tImg.naturalWidth > 0) {
        const aspect = tImg.naturalWidth / tImg.naturalHeight;
        ctx.save();
        ctx.translate(altarX - 42, altarY + shakeY);
        ctx.rotate(shakeRot);
        ctx.drawImage(tImg, -tubeH * aspect * 0.5, -tubeH * 0.5, tubeH * aspect, tubeH);
        ctx.restore();
      }

      if (bImg && bImg.complete && bImg.naturalWidth > 0) {
        const bSize = Math.min(130, propBase * 0.25);
        const aspect = bImg.naturalWidth / bImg.naturalHeight;
        const tossY = oracleStep === "throwing" ? -Math.sin((1 - oracleTimer / 0.95) * Math.PI) * 130 : 0;
        const tossRot = oracleStep === "throwing" ? (1 - oracleTimer / 0.95) * Math.PI * 6 : 0;
        ctx.save();
        ctx.translate(altarX + 68, altarY + 45 + tossY);
        ctx.rotate(tossRot);
        ctx.drawImage(bImg, -bSize * aspect * 0.5, -bSize * 0.5, bSize * aspect, bSize);
        ctx.restore();
      }
    }

    // 粒子與飄字更新繪製
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
      ft.y -= 48 * dt;
      if (ft.life <= 0) { floatTexts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life / 0.35);
      ctx.font = `800 ${ft.size}px 'Noto Serif TC', serif`;
      ctx.textAlign = "center";
      ctx.strokeStyle = "rgba(20,12,8,0.85)";
      ctx.lineWidth = 4;
      ctx.strokeText(ft.text, ft.x, ft.y);
      ctx.fillStyle = ft.color;
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
})();

