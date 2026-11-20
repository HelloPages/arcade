(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const scoreVal = document.getElementById("scoreVal");
  const stageVal = document.getElementById("stageVal");
  const hpBar = document.getElementById("hpBar");
  const wpnVal = document.getElementById("wpnVal");
  const bombVal = document.getElementById("bombVal");
  const shieldCdEl = document.getElementById("shieldCd");
  const btnSound = document.getElementById("btnSound");
  const btnFs = document.getElementById("btnFs");
  const btnSwitchWpn = document.getElementById("btnSwitchWpn");
  const btnShield = document.getElementById("btnShield");
  const btnBomb = document.getElementById("btnBomb");
  const bossHud = document.getElementById("bossHud");
  const bossPhaseEl = document.getElementById("bossPhase");
  const bossFill = document.getElementById("bossFill");
  const endModal = document.getElementById("endModal");
  const endBadge = document.getElementById("endBadge");
  const endTitle = document.getElementById("endTitle");
  const endBody = document.getElementById("endBody");
  const btnRestart = document.getElementById("btnRestart");

  // 內嵌大廳模式自動隱藏重複全螢幕鍵
  if (location.search.includes("embed=1")) {
    btnFs.classList.add("hidden");
  } else {
    btnFs.addEventListener("click", () => {
      if (!document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
      else document.exitFullscreen?.().catch(() => {});
    });
  }

  // --- 專屬高畫質去背美術資源 ---
  const imgs = {};
  const assetMap = {
    bg: "./assets/raiden-bg.webp?v=20261120_raiden_v1",
    hero: "./assets/raiden-hero.webp?v=20261120_raiden_v2",
    enemy: "./assets/raiden-enemy.webp?v=20261120_raiden_v2",
    boss: "./assets/raiden-boss.webp?v=20261120_raiden_v2"
  };
  for (const [k, src] of Object.entries(assetMap)) {
    const im = new Image();
    im.decoding = "async";
    im.src = src;
    imgs[k] = im;
  }

  // --- Web Audio 街機合成音效 ---
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
  btnSound.addEventListener("click", () => {
    soundOn = !soundOn;
    btnSound.textContent = soundOn ? "音效開" : "靜音";
  });

  function sfxShoot(type) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = type === "laser" ? "sawtooth" : type === "homing" ? "triangle" : "square";
    o.frequency.setValueAtTime(type === "laser" ? 720 : type === "homing" ? 480 : 620, now);
    o.frequency.exponentialRampToValueAtTime(160, now + 0.055);
    g.gain.setValueAtTime(0.045, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.06);
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + 0.065);
  }
  function sfxBoom(big = false) {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sawtooth";
    o.frequency.setValueAtTime(big ? 140 : 210, now);
    o.frequency.exponentialRampToValueAtTime(32, now + (big ? 0.36 : 0.14));
    g.gain.setValueAtTime(big ? 0.24 : 0.11, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + (big ? 0.38 : 0.15));
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + (big ? 0.4 : 0.16));
  }
  function sfxPowerup() {
    const a = getAC();
    if (!a) return;
    const now = a.currentTime;
    const o = a.createOscillator();
    const g = a.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(520, now);
    o.frequency.exponentialRampToValueAtTime(1180, now + 0.16);
    g.gain.setValueAtTime(0.14, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
    o.connect(g).connect(a.destination);
    o.start(now); o.stop(now + 0.19);
  }

  // --- 畫布尺寸 ---
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

  // --- 遊戲狀態 ---
  const WEAPONS = [
    { id: "vulcan", label: "🔴 烈焰", color: "#ff6644" },
    { id: "laser", label: "🔵 雷射", color: "#4ee8ff" },
    { id: "homing", label: "🟣 追蹤", color: "#d57dff" }
  ];

  let score = 0;
  let hiScore = Number(localStorage.getItem("raiden_ultra_hi") || "0") || 0;
  let stageNum = 1;
  let waveNum = 1;
  let waveTimer = 0;
  let spawnAcc = 0;
  let combo = 0;
  let comboTimer = 0;
  let shake = 0;
  let bgScroll = 0;
  let bombFlash = 0;
  let gameOver = false;
  let bannerText = "空域 1 ・ 雷霆出擊！";
  let bannerTimer = 2.2;

  const player = {
    x: vw * 0.5,
    y: vh * 0.78,
    hp: 6,
    maxHp: 6,
    wpnIdx: 0,
    wpnLv: 1,
    bombs: 3,
    invuln: 1.2,
    shieldTime: 0,
    shieldCd: 0,
    fireCd: 0,
    tilt: 0
  };

  const pBullets = [];
  const eBullets = [];
  const enemies = [];
  const pickups = [];
  const particles = [];
  const shockwaves = [];
  const floatNums = [];
  const clouds = Array.from({ length: 10 }, () => ({
    x: Math.random() * vw,
    y: Math.random() * vh,
    r: 36 + Math.random() * 58,
    speed: 45 + Math.random() * 55,
    alpha: 0.08 + Math.random() * 0.10
  }));
  let boss = null;

  function renderHud() {
    scoreVal.textContent = String(score).padStart(6, "0");
    stageVal.textContent = boss ? `空域 ${stageNum} BOSS` : `空域 ${stageNum}-${waveNum}`;
    const w = WEAPONS[player.wpnIdx];
    wpnVal.textContent = `${w.label} Lv.${player.wpnLv}`;
    wpnVal.style.borderColor = w.color;
    bombVal.textContent = String(player.bombs);
    shieldCdEl.textContent = player.shieldTime > 0 ? "啟動中" : player.shieldCd > 0 ? `${Math.ceil(player.shieldCd)}s` : "就緒";
    hpBar.innerHTML = "";
    for (let i = 0; i < player.maxHp; i++) {
      const pip = document.createElement("span");
      pip.className = "hp-pip" + (i >= player.hp ? " lost" : "");
      hpBar.appendChild(pip);
    }
    if (boss && boss.hp > 0) {
      bossHud.classList.remove("hidden");
      bossFill.style.width = `${Math.max(0, (boss.hp / boss.maxHp) * 100)}%`;
      const ph = boss.hp < boss.maxHp * 0.35 ? 3 : boss.hp < boss.maxHp * 0.7 ? 2 : 1;
      bossPhaseEl.textContent = `PHASE ${ph}`;
    } else {
      bossHud.classList.add("hidden");
    }
  }

  function resetGame() {
    score = 0;
    stageNum = 1;
    waveNum = 1;
    waveTimer = 0;
    spawnAcc = 0;
    combo = 0;
    comboTimer = 0;
    shake = 0;
    bombFlash = 0;
    gameOver = false;
    boss = null;
    pBullets.length = 0;
    eBullets.length = 0;
    enemies.length = 0;
    pickups.length = 0;
    particles.length = 0;
    shockwaves.length = 0;
    floatNums.length = 0;
    player.x = vw * 0.5;
    player.y = vh * 0.78;
    player.hp = player.maxHp;
    player.wpnIdx = 0;
    player.wpnLv = 1;
    player.bombs = 3;
    player.invuln = 1.5;
    player.shieldTime = 0;
    player.shieldCd = 0;
    bannerText = "空域 1 ・ 雷霆出擊！";
    bannerTimer = 2.2;
    endModal.classList.add("hidden");
    renderHud();
  }

  function spawnBoom(x, y, color = "#ffae42", count = 16, big = false) {
    shockwaves.push({ x, y, r: 8, maxR: big ? 130 : 54, color, life: big ? 0.45 : 0.28, maxLife: big ? 0.45 : 0.28 });
    for (let i = 0; i < count; i++) {
      const ang = (Math.PI * 2 * i) / count + Math.random() * 0.4;
      const spd = (big ? 280 : 160) * (0.35 + Math.random() * 0.8);
      particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        r: (big ? 5 : 3) + Math.random() * (big ? 6 : 3.5),
        color: i % 3 === 0 ? "#fff6c2" : i % 2 === 0 ? color : "#ff5232",
        life: (big ? 0.55 : 0.34) + Math.random() * 0.2,
        maxLife: big ? 0.75 : 0.54
      });
    }
  }

  function triggerBomb() {
    if (gameOver || player.bombs <= 0) return;
    player.bombs -= 1;
    player.invuln = Math.max(player.invuln, 2.0);
    bombFlash = 0.85;
    shake = 22;
    sfxBoom(true);
    shockwaves.push({ x: player.x, y: player.y, r: 20, maxR: Math.max(vw, vh) * 0.9, color: "#5ce1ff", life: 0.6, maxLife: 0.6 });
    shockwaves.push({ x: player.x, y: player.y, r: 10, maxR: Math.max(vw, vh) * 0.7, color: "#ffd45a", life: 0.5, maxLife: 0.5 });
    eBullets.length = 0;
    for (let i = enemies.length - 1; i >= 0; i--) {
      const e = enemies[i];
      e.hp -= 45;
      spawnBoom(e.x, e.y, "#5ce1ff", 14, false);
      if (e.hp <= 0) {
        addKillScore(e.score, e.x, e.y);
        enemies.splice(i, 1);
      }
    }
    if (boss) {
      boss.hp -= 55;
      boss.hitFlash = 0.25;
      spawnBoom(boss.x, boss.y, "#5ce1ff", 28, true);
    }
    renderHud();
  }

  function triggerShield() {
    if (gameOver || player.shieldCd > 0 || player.shieldTime > 0) return;
    player.shieldTime = 4.2;
    player.shieldCd = 11.0;
    sfxPowerup();
    shockwaves.push({ x: player.x, y: player.y, r: 16, maxR: 92, color: "#5ce1ff", life: 0.35, maxLife: 0.35 });
    renderHud();
  }

  function addKillScore(pts, x, y) {
    combo += 1;
    comboTimer = 2.4;
    const mult = Math.min(5, 1 + Math.floor(combo / 6));
    const gain = pts * mult;
    score += gain;
    if (score > hiScore) {
      hiScore = score;
      localStorage.setItem("raiden_ultra_hi", String(hiScore));
    }
    floatNums.push({ x, y, text: mult > 1 ? `+${gain} ×${mult}` : `+${gain}`, life: 0.8, maxLife: 0.8, color: mult > 1 ? "#ffd45a" : "#ffffff" });
    renderHud();
  }

  function firePlayer() {
    const w = WEAPONS[player.wpnIdx].id;
    const lv = player.wpnLv;
    sfxShoot(w);
    if (w === "vulcan") {
      const count = Math.min(7, 2 + lv);
      const spread = 0.10 + lv * 0.015;
      for (let i = 0; i < count; i++) {
        const off = i - (count - 1) * 0.5;
        const ang = -Math.PI * 0.5 + off * spread;
        pBullets.push({
          x: player.x + off * 7,
          y: player.y - 24,
          vx: Math.cos(ang) * 860,
          vy: Math.sin(ang) * 860,
          dmg: 2.0 + lv * 0.25,
          kind: "vulcan",
          r: 5
        });
      }
      player.fireCd = 0.115;
    } else if (w === "laser") {
      const beams = lv >= 4 ? 3 : lv >= 2 ? 2 : 1;
      for (let i = 0; i < beams; i++) {
        const off = (i - (beams - 1) * 0.5) * 18;
        pBullets.push({
          x: player.x + off,
          y: player.y - 30,
          vx: 0,
          vy: -1150,
          dmg: 3.8 + lv * 0.6,
          kind: "laser",
          r: 6 + lv
        });
      }
      player.fireCd = 0.105;
    } else {
      const mCount = Math.min(5, 1 + Math.ceil(lv * 0.8));
      for (let i = 0; i < mCount; i++) {
        const off = (i - (mCount - 1) * 0.5) * 16;
        pBullets.push({
          x: player.x + off,
          y: player.y - 20,
          vx: off * 6,
          vy: -540,
          dmg: 2.8 + lv * 0.45,
          kind: "homing",
          r: 6
        });
      }
      player.fireCd = 0.16;
    }
  }

  function spawnEnemyWave() {
    const mode = waveNum % 3;
    const baseHp = 5 + stageNum * 3;
    if (mode === 1) {
      // V 字高速攔截編隊
      const cx = 60 + Math.random() * (vw - 120);
      for (let i = -1; i <= 1; i++) {
        enemies.push({
          x: Math.max(36, Math.min(vw - 36, cx + i * 58)),
          y: -40 - Math.abs(i) * 34,
          vx: i * 18,
          vy: 145 + stageNum * 15,
          hp: baseHp,
          maxHp: baseHp,
          size: 48,
          fireCd: 0.7 + Math.random() * 0.8,
          kind: "interceptor",
          score: 120,
          hitFlash: 0
        });
      }
    } else if (mode === 2) {
      // 雙翼交叉蛇行機隊
      const fromLeft = Math.random() < 0.5;
      enemies.push({
        x: fromLeft ? 48 : vw - 48,
        y: -40,
        vx: fromLeft ? 78 : -78,
        vy: 120 + stageNum * 12,
        hp: baseHp * 1.4,
        maxHp: baseHp * 1.4,
        size: 56,
        fireCd: 0.65,
        kind: "striker",
        phase: Math.random() * 6,
        score: 180,
        hitFlash: 0
      });
    } else {
      // 重裝砲艇（擊破必掉能量水晶）
      enemies.push({
        x: 70 + Math.random() * (vw - 140),
        y: -60,
        vx: (Math.random() - 0.5) * 40,
        vy: 76 + stageNum * 8,
        hp: baseHp * 2.8,
        maxHp: baseHp * 2.8,
        size: 72,
        fireCd: 0.9,
        kind: "heavy",
        score: 350,
        dropGuaranteed: true,
        hitFlash: 0
      });
    }
  }

  function spawnBoss() {
    const maxHp = 260 + stageNum * 160;
    boss = {
      x: vw * 0.5,
      y: -120,
      targetY: Math.min(185, vh * 0.24),
      vx: 78 + stageNum * 14,
      hp: maxHp,
      maxHp,
      w: Math.min(260, vw * 0.62),
      fireCd: 0.9,
      patternIdx: 0,
      hitFlash: 0
    };
    bannerText = `⚠ WARNING! 空域 ${stageNum} 空中要塞來襲！`;
    bannerTimer = 2.4;
    sfxBoom(true);
    renderHud();
  }

  function maybeDropPickup(x, y, guaranteed = false) {
    if (!guaranteed && Math.random() > 0.24) return;
    const roll = Math.random();
    let type = "vulcan";
    if (roll < 0.28) type = "vulcan";
    else if (roll < 0.56) type = "laser";
    else if (roll < 0.80) type = "homing";
    else if (roll < 0.92) type = "bomb";
    else type = "heal";
    pickups.push({ x, y, vy: 110, type, phase: Math.random() * 6 });
  }

  function damagePlayer() {
    if (player.invuln > 0 || player.shieldTime > 0 || gameOver) return;
    player.hp -= 1;
    player.invuln = 1.6;
    combo = 0;
    shake = 14;
    sfxBoom(true);
    spawnBoom(player.x, player.y, "#ff5544", 22, true);
    renderHud();
    if (player.hp <= 0) {
      gameOver = true;
      endBadge.textContent = "MISSION FAILED";
      endTitle.textContent = "戰機受創撤退";
      endBody.textContent = `最終得分：${score.toLocaleString()}（最高紀錄：${hiScore.toLocaleString()}）\n抵達空域：第 ${stageNum} 空域`;
      endModal.classList.remove("hidden");
    }
  }

  // --- 輸入控制（單指跟手拖曳＋鍵盤＋雙擊放核彈）---
  const keys = {};
  let dragging = false;
  let dragOffX = 0;
  let dragOffY = 0;
  let lastTapT = 0;

  canvas.addEventListener("pointerdown", e => {
    getAC();
    const now = performance.now();
    if (now - lastTapT < 260) triggerBomb();
    lastTapT = now;
    dragging = true;
    const rect = canvas.getBoundingClientRect();
    const px = e.clientX - rect.left;
    const py = e.clientY - rect.top;
    // 手指拖曳時，戰機保持在手指略上方 34px 處不擋視線
    dragOffX = player.x - px;
    dragOffY = player.y - (py - 34);
    if (Math.hypot(dragOffX, dragOffY) > 120) {
      dragOffX = 0;
      dragOffY = 0;
      player.x = Math.max(28, Math.min(vw - 28, px));
      player.y = Math.max(72, Math.min(vh - 70, py - 34));
    }
  });
  window.addEventListener("pointermove", e => {
    if (!dragging || gameOver) return;
    const rect = canvas.getBoundingClientRect();
    const nx = e.clientX - rect.left + dragOffX;
    const ny = e.clientY - rect.top - 34 + dragOffY;
    player.tilt = Math.max(-0.22, Math.min(0.22, (nx - player.x) * 0.015));
    player.x = Math.max(28, Math.min(vw - 28, nx));
    player.y = Math.max(72, Math.min(vh - 70, ny));
  });
  window.addEventListener("pointerup", () => { dragging = false; });

  window.addEventListener("keydown", e => {
    keys[e.code] = true;
    if (e.code === "Space") { e.preventDefault(); triggerBomb(); }
    if (e.code === "ShiftLeft" || e.code === "ShiftRight") triggerShield();
    if (e.code === "KeyQ" || e.code === "Tab") {
      e.preventDefault();
      player.wpnIdx = (player.wpnIdx + 1) % WEAPONS.length;
      renderHud();
    }
  });
  window.addEventListener("keyup", e => { keys[e.code] = false; });

  btnSwitchWpn.addEventListener("click", () => {
    player.wpnIdx = (player.wpnIdx + 1) % WEAPONS.length;
    sfxPowerup();
    renderHud();
  });
  btnBomb.addEventListener("click", triggerBomb);
  btnShield.addEventListener("click", triggerShield);
  btnRestart.addEventListener("click", resetGame);

  // --- 主迴圈 (60fps) ---
  let lastT = performance.now();
  resetGame();

  function loop(now) {
    const dt = Math.min((now - lastT) / 1000, 0.05);
    lastT = now;

    if (!gameOver) {
      // 鍵盤移動
      const spd = 420;
      let dx = 0, dy = 0;
      if (keys.ArrowLeft || keys.KeyA) dx -= 1;
      if (keys.ArrowRight || keys.KeyD) dx += 1;
      if (keys.ArrowUp || keys.KeyW) dy -= 1;
      if (keys.ArrowDown || keys.KeyS) dy += 1;
      if (dx || dy) {
        const len = Math.hypot(dx, dy);
        player.x = Math.max(28, Math.min(vw - 28, player.x + (dx / len) * spd * dt));
        player.y = Math.max(72, Math.min(vh - 70, player.y + (dy / len) * spd * dt));
        player.tilt = dx * 0.16;
      } else if (!dragging) {
        player.tilt *= 0.86;
      }

      if (player.invuln > 0) player.invuln = Math.max(0, player.invuln - dt);
      if (player.shieldTime > 0) {
        player.shieldTime = Math.max(0, player.shieldTime - dt);
        if (player.shieldTime === 0) renderHud();
      }
      if (player.shieldCd > 0) {
        const prev = Math.ceil(player.shieldCd);
        player.shieldCd = Math.max(0, player.shieldCd - dt);
        if (Math.ceil(player.shieldCd) !== prev) renderHud();
      }
      if (comboTimer > 0) {
        comboTimer -= dt;
        if (comboTimer <= 0) combo = 0;
      }
      if (bannerTimer > 0) bannerTimer = Math.max(0, bannerTimer - dt);

      // 自動高速連射
      player.fireCd -= dt;
      if (player.fireCd <= 0) firePlayer();

      // 波次與 Boss 推進
      if (!boss) {
        waveTimer += dt;
        spawnAcc += dt;
        const interval = Math.max(0.75, 1.45 - stageNum * 0.12);
        if (spawnAcc >= interval) {
          spawnAcc = 0;
          spawnEnemyWave();
        }
        if (waveTimer >= 11) {
          waveTimer = 0;
          if (waveNum < 3) {
            waveNum += 1;
            renderHud();
          } else {
            spawnBoss();
          }
        }
      } else {
        // Boss 進場與多階段彈幕
        if (boss.y < boss.targetY) {
          boss.y += 90 * dt;
        } else {
          boss.x += boss.vx * dt;
          if (boss.x < boss.w * 0.42 + 12) { boss.x = boss.w * 0.42 + 12; boss.vx = Math.abs(boss.vx); }
          if (boss.x > vw - boss.w * 0.42 - 12) { boss.x = vw - boss.w * 0.42 - 12; boss.vx = -Math.abs(boss.vx); }
          boss.fireCd -= dt;
          if (boss.fireCd <= 0) {
            const phase = boss.hp < boss.maxHp * 0.35 ? 3 : boss.hp < boss.maxHp * 0.7 ? 2 : 1;
            boss.patternIdx = (boss.patternIdx + 1) % 3;
            if (phase === 1 || boss.patternIdx === 0) {
              // 雙翼主砲瞄準連射
              for (const side of [-1, 1]) {
                const sx = boss.x + side * boss.w * 0.28;
                const sy = boss.y + 38;
                const ang = Math.atan2(player.y - sy, player.x - sx);
                for (let k = -1; k <= 1; k++) {
                  eBullets.push({ x: sx, y: sy, vx: Math.cos(ang + k * 0.18) * 240, vy: Math.sin(ang + k * 0.18) * 240, r: 6, color: "#ff6952" });
                }
              }
              boss.fireCd = 0.85;
            } else {
              // 核心扇形／螺旋火網
              const cnt = phase === 3 ? 12 : 8;
              const baseAng = now * 0.002;
              for (let i = 0; i < cnt; i++) {
                const ang = baseAng + (Math.PI * 2 * i) / cnt;
                eBullets.push({ x: boss.x, y: boss.y + 18, vx: Math.cos(ang) * 210, vy: Math.sin(ang) * 210, r: 6, color: "#ffbd42" });
              }
              boss.fireCd = phase === 3 ? 0.55 : 0.72;
            }
          }
        }
        if (boss.hitFlash > 0) boss.hitFlash = Math.max(0, boss.hitFlash - dt);
      }

      // 更新我方子彈（含追蹤飛彈）
      for (let i = pBullets.length - 1; i >= 0; i--) {
        const b = pBullets[i];
        if (b.kind === "homing") {
          let target = boss;
          let bestD = boss ? Math.hypot(boss.x - b.x, boss.y - b.y) : Infinity;
          for (const e of enemies) {
            const d = Math.hypot(e.x - b.x, e.y - b.y);
            if (d < bestD) { bestD = d; target = e; }
          }
          if (target) {
            const ang = Math.atan2(target.y - b.y, target.x - b.x);
            b.vx += Math.cos(ang) * 1450 * dt;
            b.vy += Math.sin(ang) * 1450 * dt;
            const spd = Math.hypot(b.vx, b.vy);
            if (spd > 680) { b.vx = (b.vx / spd) * 680; b.vy = (b.vy / spd) * 680; }
          }
        }
        b.x += b.vx * dt;
        b.y += b.vy * dt;
        if (b.y < -40 || b.y > vh + 40 || b.x < -40 || b.x > vw + 40) { pBullets.splice(i, 1); continue; }

        // 命中敵機
        let hit = false;
        for (let j = enemies.length - 1; j >= 0; j--) {
          const e = enemies[j];
          if (Math.hypot(b.x - e.x, b.y - e.y) < e.size * 0.48 + b.r) {
            e.hp -= b.dmg;
            e.hitFlash = 0.08;
            hit = true;
            if (e.hp <= 0) {
              sfxBoom(e.kind === "heavy");
              spawnBoom(e.x, e.y, e.kind === "heavy" ? "#ffd45a" : "#ff7e42", e.kind === "heavy" ? 24 : 14, e.kind === "heavy");
              addKillScore(e.score, e.x, e.y);
              maybeDropPickup(e.x, e.y, !!e.dropGuaranteed);
              enemies.splice(j, 1);
            }
            break;
          }
        }
        if (hit) { pBullets.splice(i, 1); continue; }

        // 命中首領
        if (boss && Math.abs(b.x - boss.x) < boss.w * 0.44 && Math.abs(b.y - boss.y) < boss.w * 0.34) {
          boss.hp -= b.dmg;
          boss.hitFlash = 0.06;
          pBullets.splice(i, 1);
          renderHud();
          if (boss.hp <= 0) {
            shake = 26;
            sfxBoom(true);
            for (let k = 0; k < 5; k++) {
              spawnBoom(boss.x + (Math.random() - 0.5) * boss.w * 0.7, boss.y + (Math.random() - 0.5) * 90, "#ffd45a", 22, true);
            }
            addKillScore(3000 * stageNum, boss.x, boss.y);
            maybeDropPickup(boss.x - 36, boss.y, true);
            maybeDropPickup(boss.x + 36, boss.y, true);
            boss = null;
            eBullets.length = 0;
            stageNum += 1;
            waveNum = 1;
            waveTimer = 0;
            bannerText = `★ 要塞擊破！進入空域 ${stageNum} ★`;
            bannerTimer = 2.6;
            renderHud();
          }
        }
      }

      // 更新敵機
      for (let i = enemies.length - 1; i >= 0; i--) {
        const e = enemies[i];
        if (e.kind === "striker") e.x += Math.sin(now * 0.004 + e.phase) * 90 * dt;
        e.x += e.vx * dt;
        e.y += e.vy * dt;
        if (e.hitFlash > 0) e.hitFlash = Math.max(0, e.hitFlash - dt);
        e.fireCd -= dt;
        if (e.fireCd <= 0 && e.y > 40 && e.y < vh * 0.65) {
          const ang = Math.atan2(player.y - e.y, player.x - e.x);
          eBullets.push({ x: e.x, y: e.y + 18, vx: Math.cos(ang) * 230, vy: Math.sin(ang) * 230, r: 5, color: "#ff7256" });
          e.fireCd = e.kind === "heavy" ? 1.15 : 1.65;
        }
        if (Math.hypot(e.x - player.x, e.y - player.y) < e.size * 0.42 + 14) {
          damagePlayer();
          spawnBoom(e.x, e.y, "#ff6644", 12, false);
          enemies.splice(i, 1);
          continue;
        }
        if (e.y > vh + 80 || e.x < -80 || e.x > vw + 80) enemies.splice(i, 1);
      }

      // 更新敵彈
      for (let i = eBullets.length - 1; i >= 0; i--) {
        const eb = eBullets[i];
        eb.x += eb.vx * dt;
        eb.y += eb.vy * dt;
        if (eb.y < -30 || eb.y > vh + 30 || eb.x < -30 || eb.x > vw + 30) { eBullets.splice(i, 1); continue; }
        if (Math.hypot(eb.x - player.x, eb.y - player.y) < eb.r + (player.shieldTime > 0 ? 34 : 10)) {
          if (player.shieldTime > 0) {
            spawnBoom(eb.x, eb.y, "#5ce1ff", 6, false);
            eBullets.splice(i, 1);
          } else {
            eBullets.splice(i, 1);
            damagePlayer();
          }
        }
      }

      // 更新能量水晶掉落
      for (let i = pickups.length - 1; i >= 0; i--) {
        const pk = pickups[i];
        pk.y += pk.vy * dt;
        pk.x += Math.sin(now * 0.005 + pk.phase) * 28 * dt;
        if (Math.hypot(pk.x - player.x, pk.y - player.y) < 34) {
          sfxPowerup();
          if (pk.type === "bomb") {
            player.bombs = Math.min(6, player.bombs + 1);
            floatNums.push({ x: player.x, y: player.y - 24, text: "核彈 +1！", life: 1.0, maxLife: 1.0, color: "#ffd45a" });
          } else if (pk.type === "heal") {
            player.hp = Math.min(player.maxHp, player.hp + 1);
            floatNums.push({ x: player.x, y: player.y - 24, text: "裝甲修復 +1", life: 1.0, maxLife: 1.0, color: "#5ef5a8" });
          } else {
            const idx = WEAPONS.findIndex(w => w.id === pk.type);
            if (player.wpnIdx === idx) player.wpnLv = Math.min(5, player.wpnLv + 1);
            else { player.wpnIdx = idx; player.wpnLv = Math.min(5, Math.max(2, player.wpnLv)); }
            floatNums.push({ x: player.x, y: player.y - 24, text: `${WEAPONS[idx].label} POWER UP!`, life: 1.0, maxLife: 1.0, color: WEAPONS[idx].color });
          }
          renderHud();
          pickups.splice(i, 1);
          continue;
        }
        if (pk.y > vh + 40) pickups.splice(i, 1);
      }
    }

    // 背景與粒子更新
    bgScroll += 115 * dt;
    if (shake > 0) shake = Math.max(0, shake - dt * 52);
    if (bombFlash > 0) bombFlash = Math.max(0, bombFlash - dt * 1.9);

    for (const c of clouds) {
      c.y += c.speed * dt;
      if (c.y - c.r > vh) { c.y = -c.r * 1.2; c.x = Math.random() * vw; }
    }
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.life -= dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.life <= 0) particles.splice(i, 1);
    }
    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const s = shockwaves[i];
      s.life -= dt;
      if (s.life <= 0) shockwaves.splice(i, 1);
    }
    for (let i = floatNums.length - 1; i >= 0; i--) {
      const f = floatNums[i];
      f.life -= dt;
      f.y -= 38 * dt;
      if (f.life <= 0) floatNums.splice(i, 1);
    }

    // === 繪製 ===
    ctx.save();
    if (shake > 0) ctx.translate((Math.random() - 0.5) * shake, (Math.random() - 0.5) * shake);

    // 1. 鏡像無縫縱向捲動高空夕陽海峽背景（零水平接縫）
    const bg = imgs.bg;
    if (bg && bg.complete && bg.naturalWidth > 0) {
      const scale = Math.max(vw / bg.naturalWidth, vh / bg.naturalHeight);
      const dw = bg.naturalWidth * scale;
      const dh = bg.naturalHeight * scale;
      const ox = (vw - dw) * 0.5;
      const cycle = dh * 2;
      const yOff = bgScroll % cycle;
      const drawTile = (y, flipped) => {
        if (y + dh < 0 || y > vh) return;
        ctx.save();
        if (flipped) {
          ctx.translate(0, y + dh);
          ctx.scale(1, -1);
          ctx.drawImage(bg, ox, 0, dw, dh);
        } else {
          ctx.drawImage(bg, ox, y, dw, dh);
        }
        ctx.restore();
      };
      drawTile(yOff - cycle, false);
      drawTile(yOff - dh, true);
      drawTile(yOff, false);
      drawTile(yOff + dh, true);
    } else {
      ctx.fillStyle = "#0a2a44";
      ctx.fillRect(0, 0, vw, vh);
    }

    // 視差高空浮雲
    ctx.save();
    for (const c of clouds) {
      const g = ctx.createRadialGradient(c.x, c.y, 4, c.x, c.y, c.r);
      g.addColorStop(0, `rgba(255, 240, 215, ${c.alpha})`);
      g.addColorStop(1, "rgba(255, 240, 215, 0)");
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // 2. 掉落能量水晶
    for (const pk of pickups) {
      const col = pk.type === "vulcan" ? "#ff5a3c" : pk.type === "laser" ? "#3ee4ff" : pk.type === "homing" ? "#d57dff" : pk.type === "bomb" ? "#ffd45a" : "#5ef5a8";
      const txt = pk.type === "vulcan" ? "V" : pk.type === "laser" ? "L" : pk.type === "homing" ? "H" : pk.type === "bomb" ? "B" : "+";
      ctx.save();
      ctx.translate(pk.x, pk.y);
      ctx.shadowColor = col;
      ctx.shadowBlur = 14;
      ctx.fillStyle = col;
      ctx.beginPath();
      ctx.roundRect(-14, -14, 28, 28, 6);
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 2;
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.fillStyle = "#0c1422";
      ctx.font = "900 16px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(txt, 0, 1);
      ctx.restore();
    }

    // 3. 敵機與巨型首領
    const eImg = imgs.enemy;
    for (const e of enemies) {
      ctx.save();
      ctx.translate(e.x, e.y);
      if (e.hitFlash > 0) ctx.filter = "brightness(2.2)";
      if (eImg && eImg.complete && eImg.naturalWidth > 0) {
        const aspect = eImg.naturalWidth / eImg.naturalHeight;
        ctx.drawImage(eImg, -e.size * aspect * 0.5, -e.size * 0.5, e.size * aspect, e.size);
      } else {
        ctx.fillStyle = "#d93636";
        ctx.beginPath();
        ctx.arc(0, 0, e.size * 0.4, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    if (boss) {
      const bImg = imgs.boss;
      ctx.save();
      ctx.translate(boss.x, boss.y);
      if (boss.hitFlash > 0) ctx.filter = "brightness(1.9)";
      if (bImg && bImg.complete && bImg.naturalWidth > 0) {
        const aspect = bImg.naturalWidth / bImg.naturalHeight;
        const bh = boss.w / aspect;
        ctx.drawImage(bImg, -boss.w * 0.5, -bh * 0.5, boss.w, bh);
      }
      ctx.restore();
    }

    // 4. 我方雷霆戰機
    if (!gameOver) {
      const blink = player.invuln > 0 && Math.floor(now / 70) % 2 === 0;
      if (!blink) {
        const hImg = imgs.hero;
        ctx.save();
        ctx.translate(player.x, player.y);
        ctx.rotate(player.tilt);
        if (hImg && hImg.complete && hImg.naturalWidth > 0) {
          const hh = 74;
          const hw = hh * (hImg.naturalWidth / hImg.naturalHeight);
          ctx.drawImage(hImg, -hw * 0.5, -hh * 0.5, hw, hh);
        }
        if (player.shieldTime > 0) {
          ctx.strokeStyle = "#5ce1ff";
          ctx.lineWidth = 3;
          ctx.fillStyle = "rgba(92, 225, 255, 0.16)";
          ctx.beginPath();
          ctx.arc(0, 0, 44, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
        }
        ctx.restore();
      }
    }

    // 5. 我方子彈與敵彈
    for (const b of pBullets) {
      ctx.save();
      if (b.kind === "laser") {
        ctx.fillStyle = "#5ce1ff";
        ctx.shadowColor = "#5ce1ff";
        ctx.shadowBlur = 12;
        ctx.fillRect(b.x - b.r * 0.45, b.y - 18, b.r * 0.9, 36);
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(b.x - b.r * 0.2, b.y - 16, b.r * 0.4, 32);
      } else if (b.kind === "homing") {
        ctx.fillStyle = "#e09eff";
        ctx.shadowColor = "#c85cff";
        ctx.shadowBlur = 10;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = "#ffd45a";
        ctx.shadowColor = "#ff6644";
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.ellipse(b.x, b.y, 4, 11, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    for (const eb of eBullets) {
      ctx.save();
      ctx.fillStyle = eb.color;
      ctx.shadowColor = eb.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.r * 0.42, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 6. 衝擊波與爆炸粒子
    for (const s of shockwaves) {
      const prog = 1 - s.life / s.maxLife;
      const r = s.r + (s.maxR - s.r) * (1 - Math.pow(1 - prog, 2));
      ctx.save();
      ctx.globalAlpha = Math.max(0, 1 - prog);
      ctx.strokeStyle = s.color;
      ctx.lineWidth = 4 * (1 - prog * 0.5);
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
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

    // 7. 飄分與連擊徽章 + 空域橫幅
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const f of floatNums) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, f.life / 0.3);
      ctx.font = "900 15px sans-serif";
      ctx.strokeStyle = "#081320";
      ctx.lineWidth = 3;
      ctx.strokeText(f.text, f.x, f.y);
      ctx.fillStyle = f.color;
      ctx.fillText(f.text, f.x, f.y);
      ctx.restore();
    }

    if (combo >= 3 && comboTimer > 0) {
      ctx.save();
      ctx.textAlign = "right";
      ctx.font = "900 12px ui-monospace, sans-serif";
      ctx.fillStyle = "#5ce1ff";
      ctx.fillText("COMBO", vw - 14, 78);
      ctx.font = "900 24px sans-serif";
      ctx.strokeStyle = "#081320";
      ctx.lineWidth = 4;
      ctx.strokeText(`×${combo}`, vw - 14, 100);
      ctx.fillStyle = "#ffd45a";
      ctx.fillText(`×${combo}`, vw - 14, 100);
      ctx.restore();
    }

    if (bannerTimer > 0) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, bannerTimer / 0.4);
      const bw = Math.min(vw - 24, 340);
      ctx.fillStyle = "rgba(10, 22, 40, 0.88)";
      ctx.strokeStyle = "#ffd45a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(vw * 0.5 - bw * 0.5, vh * 0.34, bw, 42, 8);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = "#fff6d6";
      ctx.font = "900 16px sans-serif";
      ctx.fillText(bannerText, vw * 0.5, vh * 0.34 + 21);
      ctx.restore();
    }

    if (bombFlash > 0) {
      ctx.fillStyle = `rgba(220, 248, 255, ${bombFlash * 0.55})`;
      ctx.fillRect(0, 0, vw, vh);
    }

    ctx.restore();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
