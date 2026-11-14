(() => {
  const STORAGE_KEY = "rea-shinobi-v1";
  const ACT_NAMES = ["月下銀杏屋簷", "高空竹林城堞", "天守閣・羅剎鎧"];
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");

  const ui = {
    act: document.getElementById("hud-act"),
    stageName: document.getElementById("hud-stage-name"),
    progress: document.getElementById("hud-progress"),
    hp: document.getElementById("hud-hp"),
    score: document.getElementById("hud-score"),
    combo: document.getElementById("combo-banner"),
    bossBar: document.getElementById("boss-bar"),
    bossHpText: document.getElementById("boss-hp-text"),
    bossHpFill: document.getElementById("boss-hp-fill"),
    padUlti: document.getElementById("pad-ulti"),
    modalStart: document.getElementById("modal-start"),
    modalPause: document.getElementById("modal-pause"),
    modalEnd: document.getElementById("modal-end"),
    pauseStats: document.getElementById("pause-stats"),
    endTitle: document.getElementById("end-title"),
    endDesc: document.getElementById("end-desc"),
    endSummary: document.getElementById("end-summary")
  };

  // 載入原創圖片素材 (背景 + 真實 RGBA 透明 PNG 精靈圖集)
  const assets = {
    bg: new Image(),
    sprites: new Image(),
    ready: false
  };
  let loadedCount = 0;
  function onAssetLoad() {
    loadedCount++;
    if (loadedCount >= 2) assets.ready = true;
  }
  assets.bg.onload = onAssetLoad;
  assets.sprites.onload = onAssetLoad;
  assets.bg.src = "./assets/shinobi-bg.webp";
  assets.sprites.src = "./assets/shinobi-sprites.png";

  let viewW = 390;
  let viewH = 844;
  let dpr = 1;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    viewW = window.innerWidth || 390;
    viewH = window.innerHeight || 844;
    canvas.width = Math.round(viewW * dpr);
    canvas.height = Math.round(viewH * dpr);
  }
  window.addEventListener("resize", resize);
  resize();

  function loadBestScore() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return 0;
      const obj = JSON.parse(raw);
      return Number(obj.bestScore) || 0;
    } catch (e) {
      return 0;
    }
  }
  function saveBestScore(score) {
    try {
      const prev = loadBestScore();
      if (score > prev) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ bestScore: Math.floor(score), updatedAt: Date.now() }));
      }
    } catch (e) {}
  }

  // 遊戲狀態
  const state = {
    mode: "start", // start | playing | paused | win | lose
    act: 1,
    distance: 0,
    actLength: 1900,
    scrollSpeed: 245,
    score: 0,
    bestScore: loadBestScore(),
    combo: 0,
    comboTimer: 0,
    ulti: 35,
    ultiAnimTimer: 0,
    hitStop: 0,
    shake: 0,
    time: 0,
    spawnTimer: 0.7,
    leafTimer: 0,
    player: {
      x: 92,
      y: 0,
      vy: 0,
      hp: 4,
      maxHp: 4,
      jumpsLeft: 2,
      grounded: true,
      sliding: 0,
      dashTimer: 0,
      dashCd: 0,
      invuln: 0,
      shootCd: 0,
      slashTimer: 0,
      animPhase: 0
    },
    rooftops: [],
    afterimages: [],
    shurikens: [],
    enemyBullets: [],
    enemies: [],
    slashes: [],
    particles: [],
    leaves: [],
    popups: [],
    boss: null
  };

  function groundY() {
    return Math.round(viewH * 0.74);
  }

  function initRooftops() {
    state.rooftops = [];
    const base = groundY();
    let rx = -40;
    for (let i = 0; i < 6; i++) {
      const w = 210 + (i % 3) * 70;
      state.rooftops.push({ x: rx, y: base, w, h: viewH - base + 40 });
      rx += w + (i >= 2 ? 64 : 0);
    }
  }

  function resetGame() {
    state.mode = "playing";
    state.act = 1;
    state.distance = 0;
    state.actLength = 1800;
    state.scrollSpeed = 250;
    state.score = 0;
    state.combo = 0;
    state.comboTimer = 0;
    state.ulti = 40;
    state.ultiAnimTimer = 0;
    state.hitStop = 0;
    state.shake = 0;
    state.spawnTimer = 0.6;
    state.afterimages = [];
    state.shurikens = [];
    state.enemyBullets = [];
    state.enemies = [];
    state.slashes = [];
    state.particles = [];
    state.popups = [];
    state.boss = null;

    const p = state.player;
    p.x = Math.min(115, viewW * 0.25);
    p.y = groundY();
    p.vy = 0;
    p.hp = 4;
    p.jumpsLeft = 2;
    p.grounded = true;
    p.sliding = 0;
    p.dashTimer = 0;
    p.dashCd = 0;
    p.invuln = 0;
    p.shootCd = 0;
    p.slashTimer = 0;

    initRooftops();
    ui.modalStart.classList.add("hidden");
    ui.modalPause.classList.add("hidden");
    ui.modalEnd.classList.add("hidden");
    ui.bossBar.classList.remove("active");
    syncHud();
  }

  // 動作指令
  function doJump() {
    if (state.mode !== "playing") return;
    const p = state.player;
    if (p.jumpsLeft > 0) {
      const isDouble = !p.grounded;
      p.vy = isDouble ? -600 : -655;
      p.grounded = false;
      p.sliding = 0;
      p.jumpsLeft--;
      spawnBurst(p.x, p.y - 12, isDouble ? "#fde047" : "#f8fafc", 10);
      // 二段跳翻滾同時朝前方斜下投擲三枚金色手裏劍
      if (isDouble) {
        for (let a = -0.25; a <= 0.25; a += 0.25) {
          spawnShuriken(p.x + 18, p.y - 42, Math.cos(a) * 650, Math.sin(a) * 650, 14);
        }
      }
    }
  }

  function doSlide() {
    if (state.mode !== "playing") return;
    const p = state.player;
    if (p.grounded) {
      p.sliding = 0.45;
      spawnBurst(p.x - 10, p.y, "#cbd5e1", 6);
    } else {
      // 空中急降
      p.vy = Math.max(p.vy, 760);
      p.sliding = 0.35;
    }
  }

  function doDashSlash() {
    if (state.mode !== "playing") return;
    const p = state.player;
    if (p.dashCd > 0) return;
    p.dashTimer = 0.30;
    p.dashCd = 0.55;
    p.invuln = Math.max(p.invuln, 0.35);
    p.slashTimer = 0.26;
    state.slashes.push({ x: p.x + 48, y: p.y - 44, life: 0.22, maxLife: 0.22, r: 64, color: "#ef4444" });
    spawnBurst(p.x + 25, p.y - 40, "#ef4444", 14);
    // 劈碎範圍內敵彈並造成雙倍近戰傷害
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      if (Math.hypot(b.x - (p.x + 44), b.y - (p.y - 42)) < 95) {
        spawnBurst(b.x, b.y, "#fde047", 6);
        state.enemyBullets.splice(i, 1);
        addCombo(1, b.x, b.y, "破彈!");
      }
    }
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (Math.hypot(e.x - (p.x + 54), (e.y - 44) - (p.y - 44)) < 115) {
        damageEnemy(e, i, 34, true);
      }
    }
    if (state.boss && Math.hypot(state.boss.x - (p.x + 60), (state.boss.y - 68) - (p.y - 44)) < 135) {
      damageBoss(38, true);
    }
  }

  function doShoot() {
    if (state.mode !== "playing") return;
    const p = state.player;
    if (p.shootCd > 0) return;
    p.shootCd = 0.16;
    spawnShuriken(p.x + 28, p.y - 44, 720, 0, 12);
    if (state.combo >= 10) {
      spawnShuriken(p.x + 24, p.y - 52, 700, -90, 10);
    }
  }

  function doUlti() {
    if (state.mode !== "playing" || state.ulti < 100) return;
    state.ulti = 0;
    state.ultiAnimTimer = 0.85;
    state.player.invuln = 1.0;
    state.shake = 12;
    state.hitStop = 0.05;
    // 清空敵彈並重創全場敵人與Boss
    state.enemyBullets.forEach(b => spawnBurst(b.x, b.y, "#fde047", 6));
    state.enemyBullets = [];
    for (let k = 0; k < 5; k++) {
      state.slashes.push({
        x: viewW * (0.25 + k * 0.14),
        y: groundY() - 60 - (k % 2) * 90,
        life: 0.42,
        maxLife: 0.42,
        r: 95,
        color: k % 2 === 0 ? "#fde047" : "#ef4444"
      });
    }
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      damageEnemy(state.enemies[i], i, 85, true);
    }
    if (state.boss) {
      damageBoss(95, true);
    }
    addPopup(viewW * 0.5, viewH * 0.35, "奧義・千本櫻龍捲斬！", "#fde047", 20);
    syncHud();
  }

  function spawnShuriken(x, y, vx, vy, dmg) {
    state.shurikens.push({ x, y, vx, vy, dmg, rot: 0 });
  }

  function spawnBurst(x, y, color, count) {
    for (let i = 0; i < count; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 70 + Math.random() * 220;
      state.particles.push({
        x, y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd - 40,
        life: 0.32 + Math.random() * 0.25,
        maxLife: 0.55,
        size: 2.5 + Math.random() * 3.5,
        color
      });
    }
  }

  function addPopup(x, y, text, color = "#fde047", size = 14) {
    state.popups.push({ x, y, text, color, size, life: 0.65, vy: -55 });
  }

  function addCombo(inc, x, y, label) {
    state.combo += inc;
    state.comboTimer = 2.6;
    state.score += (35 + state.combo * 8);
    state.ulti = Math.min(100, state.ulti + 6);
    if (label) addPopup(x, y - 24, label, "#fde047", 15);
  }

  function spawnEnemy() {
    const type = Math.random() < 0.62 ? "samurai" : "flyer";
    if (type === "samurai") {
      // 在前方的屋簷高度生成巡邏武士
      const roof = state.rooftops[state.rooftops.length - 1];
      const ry = roof ? roof.y : groundY();
      state.enemies.push({
        kind: "samurai",
        x: viewW + 46,
        y: ry,
        vx: -(state.scrollSpeed * 0.95 + 45),
        hp: 26 + state.act * 10,
        maxHp: 26 + state.act * 10,
        fireTimer: 0.9 + Math.random() * 0.8,
        flash: 0
      });
    } else {
      state.enemies.push({
        kind: "flyer",
        x: viewW + 44,
        y: groundY() - 125 - Math.random() * 85,
        vx: -(state.scrollSpeed * 0.78 + 75),
        hp: 18 + state.act * 6,
        maxHp: 18 + state.act * 6,
        fireTimer: 0.8 + Math.random() * 0.7,
        phase: Math.random() * 6,
        flash: 0
      });
    }
  }

  function spawnBoss() {
    const maxHp = 420;
    state.boss = {
      x: viewW + 90,
      targetX: viewW - 76,
      y: groundY(),
      vy: 0,
      hp: maxHp,
      maxHp,
      phaseTimer: 1.6,
      attackIdx: 0,
      charging: 0,
      flash: 0
    };
    ui.bossBar.classList.add("active");
    addPopup(viewW * 0.5, viewH * 0.3, "強敵現身：機巧大將軍・羅剎鎧！", "#ef4444", 17);
  }

  function damageEnemy(e, idx, dmg, isSlash) {
    e.hp -= dmg;
    e.flash = 0.12;
    spawnBurst(e.x, e.y - 38, isSlash ? "#ef4444" : "#fde047", isSlash ? 12 : 6);
    if (isSlash) {
      state.hitStop = 0.032;
      state.shake = Math.max(state.shake, 5);
    }
    if (e.hp <= 0) {
      state.enemies.splice(idx, 1);
      addCombo(1, e.x, e.y - 30, isSlash ? `瞬身破敵 +${dmg}` : "擊破!");
      spawnBurst(e.x, e.y - 36, "#f97316", 16);
    } else {
      addPopup(e.x, e.y - 54, `-${dmg}`, isSlash ? "#fca5a5" : "#fef08a", 13);
    }
  }

  function damageBoss(dmg, isSlash) {
    const b = state.boss;
    if (!b) return;
    b.hp = Math.max(0, b.hp - dmg);
    b.flash = 0.1;
    state.score += dmg * 3;
    state.ulti = Math.min(100, state.ulti + 3);
    if (isSlash) {
      state.hitStop = 0.035;
      state.shake = Math.max(state.shake, 6);
    }
    spawnBurst(b.x - 10, b.y - 60, isSlash ? "#ef4444" : "#fde047", isSlash ? 12 : 5);
    if (b.hp <= 0) {
      spawnBurst(b.x, b.y - 70, "#fde047", 40);
      spawnBurst(b.x, b.y - 50, "#ef4444", 35);
      state.boss = null;
      ui.bossBar.classList.remove("active");
      state.score += 1200 + state.player.hp * 250;
      endGame("win");
    }
  }

  function hitPlayer() {
    const p = state.player;
    if (p.invuln > 0) return;
    p.hp--;
    p.invuln = 1.25;
    state.combo = 0;
    state.shake = 9;
    state.hitStop = 0.04;
    spawnBurst(p.x, p.y - 35, "#ef4444", 18);
    addPopup(p.x, p.y - 72, "受創！", "#ef4444", 16);
    syncHud();
    if (p.hp <= 0) {
      endGame("lose");
    }
  }

  function endGame(result) {
    state.mode = result;
    saveBestScore(state.score);
    state.bestScore = Math.max(state.bestScore, Math.floor(state.score));
    ui.endTitle.textContent = result === "win" ? "大獲全勝！天下布武" : "力竭退卻";
    ui.endDesc.textContent = result === "win"
      ? "成功在月夜天守閣斬破機巧大將軍・羅剎鎧！"
      : "忍者在月夜屋簷間力竭，請整裝再次出陣！";
    ui.endSummary.innerHTML = `
      • <b>最終得分</b>：${Math.floor(state.score)}<br>
      • <b>最高紀錄</b>：${state.bestScore}<br>
      • <b>到達幕數</b>：第 ${state.act} 幕（${ACT_NAMES[state.act - 1]}）
    `;
    ui.modalEnd.classList.remove("hidden");
    syncHud();
  }

  // 主更新步驟（最長 1/120 秒子步）
  function step(dt) {
    state.time += dt;

    // 銀杏葉環境粒子永遠保持流動
    state.leafTimer -= dt;
    if (state.leafTimer <= 0) {
      state.leafTimer = 0.24;
      state.leaves.push({
        x: viewW + 10,
        y: Math.random() * viewH * 0.68,
        vx: -80 - Math.random() * 75,
        vy: 30 + Math.random() * 40,
        rot: Math.random() * Math.PI * 2,
        vrot: (Math.random() - 0.5) * 4,
        size: 5 + Math.random() * 4
      });
    }
    for (let i = state.leaves.length - 1; i >= 0; i--) {
      const lf = state.leaves[i];
      lf.x += lf.vx * dt;
      lf.y += lf.vy * dt;
      lf.rot += lf.vrot * dt;
      if (lf.x < -20 || lf.y > viewH + 20) state.leaves.splice(i, 1);
    }

    if (state.mode !== "playing") return;

    if (state.hitStop > 0) {
      state.hitStop -= dt;
      return;
    }

    if (state.shake > 0) state.shake = Math.max(0, state.shake - dt * 28);
    if (state.ultiAnimTimer > 0) state.ultiAnimTimer -= dt;

    if (state.comboTimer > 0) {
      state.comboTimer -= dt;
      if (state.comboTimer <= 0) state.combo = 0;
    }

    const p = state.player;
    if (p.invuln > 0) p.invuln -= dt;
    if (p.shootCd > 0) p.shootCd -= dt;
    if (p.dashCd > 0) p.dashCd -= dt;
    if (p.slashTimer > 0) p.slashTimer -= dt;
    if (p.sliding > 0) p.sliding -= dt;

    const dashMul = p.dashTimer > 0 ? 1.85 : 1.0;
    if (p.dashTimer > 0) {
      p.dashTimer -= dt;
      state.afterimages.push({ x: p.x, y: p.y, life: 0.22, jumping: !p.grounded });
    }
    for (let i = state.afterimages.length - 1; i >= 0; i--) {
      state.afterimages[i].x -= state.scrollSpeed * dt * 0.6;
      state.afterimages[i].life -= dt;
      if (state.afterimages[i].life <= 0) state.afterimages.splice(i, 1);
    }

    // 推進行進與關卡轉換
    const moveDist = state.scrollSpeed * dashMul * dt;
    if (!state.boss) {
      state.distance += moveDist;
      state.score += moveDist * 0.12;
      if (state.act < 3 && state.distance >= state.actLength) {
        state.act++;
        state.distance = 0;
        state.scrollSpeed += 32;
        addPopup(viewW * 0.5, viewH * 0.28, `第 ${state.act} 幕：${ACT_NAMES[state.act - 1]}`, "#fde047", 17);
        if (state.act === 3) {
          spawnBoss();
        }
      } else if (state.act === 3 && !state.boss && state.distance >= 420) {
        spawnBoss();
      }
    }

    // 屋簷滾動與生成
    for (let i = 0; i < state.rooftops.length; i++) {
      state.rooftops[i].x -= moveDist;
    }
    if (state.rooftops.length && state.rooftops[0].x + state.rooftops[0].w < -60) {
      state.rooftops.shift();
    }
    while (state.rooftops.length < 6) {
      const last = state.rooftops[state.rooftops.length - 1];
      const gap = state.boss ? 0 : (state.act === 1 ? 45 : 68);
      const yOffset = state.boss ? 0 : ((Math.random() - 0.5) * (state.act >= 2 ? 64 : 26));
      const nextY = Math.max(viewH * 0.58, Math.min(viewH * 0.80, groundY() + yOffset));
      state.rooftops.push({
        x: last.x + last.w + gap,
        y: nextY,
        w: 220 + Math.random() * 110,
        h: viewH - nextY + 60
      });
    }

    // 主角重力與屋簷立足判定
    const prevY = p.y;
    p.vy += 1550 * dt;
    p.y += p.vy * dt;
    p.grounded = false;
    for (const r of state.rooftops) {
      if (p.x + 14 >= r.x && p.x - 14 <= r.x + r.w) {
        if (prevY <= r.y + 12 && p.y >= r.y && p.vy >= 0) {
          p.y = r.y;
          p.vy = 0;
          p.grounded = true;
          p.jumpsLeft = 2;
          break;
        }
      }
    }
    // 掉出屋簷深淵自動瞬身拉回但扣一格勾玉
    if (p.y > viewH + 40) {
      p.y = groundY() - 90;
      p.vy = -380;
      p.jumpsLeft = 1;
      hitPlayer();
    }

    // 敵人生成
    if (!state.boss) {
      state.spawnTimer -= dt;
      if (state.spawnTimer <= 0) {
        state.spawnTimer = Math.max(0.75, 1.55 - state.act * 0.22);
        spawnEnemy();
      }
    }

    // 手裏劍更新與命中
    for (let i = state.shurikens.length - 1; i >= 0; i--) {
      const s = state.shurikens[i];
      s.x += s.vx * dt;
      s.y += s.vy * dt;
      s.rot += 18 * dt;
      if (s.x > viewW + 40 || s.y < -40 || s.y > viewH + 40) {
        state.shurikens.splice(i, 1);
        continue;
      }
      let hit = false;
      for (let j = state.enemies.length - 1; j >= 0; j--) {
        const e = state.enemies[j];
        if (Math.hypot(s.x - e.x, s.y - (e.y - 38)) < 36) {
          damageEnemy(e, j, s.dmg, false);
          hit = true;
          break;
        }
      }
      if (!hit && state.boss) {
        const b = state.boss;
        if (Math.hypot(s.x - b.x, s.y - (b.y - 68)) < 60) {
          damageBoss(s.dmg, false);
          hit = true;
        }
      }
      if (hit) state.shurikens.splice(i, 1);
    }

    // 敵人移動與攻擊
    for (let i = state.enemies.length - 1; i >= 0; i--) {
      const e = state.enemies[i];
      if (e.flash > 0) e.flash -= dt;
      e.x += e.vx * dt;
      if (e.kind === "flyer") {
        e.phase += dt * 4;
        e.y += Math.sin(e.phase) * 45 * dt;
      }
      e.fireTimer -= dt;
      if (e.fireTimer <= 0 && e.x < viewW - 24 && e.x > p.x + 40) {
        e.fireTimer = 1.45;
        const dx = p.x - e.x;
        const dy = (p.y - 36) - (e.y - 38);
        const len = Math.hypot(dx, dy) || 1;
        state.enemyBullets.push({ x: e.x - 16, y: e.y - 38, vx: (dx / len) * 280, vy: (dy / len) * 280, r: 7 });
      }
      // 碰撞判定（滑鏟時 hitbox 降低）
      const pHitY = p.sliding > 0 ? p.y - 22 : p.y - 40;
      if (Math.hypot(p.x - e.x, pHitY - (e.y - 38)) < 34) {
        if (p.dashTimer > 0) {
          damageEnemy(e, i, 40, true);
        } else {
          hitPlayer();
        }
      }
      if (e.x < -60) state.enemies.splice(i, 1);
    }

    // Boss 動態動作邏輯
    if (state.boss) {
      const b = state.boss;
      if (b.flash > 0) b.flash -= dt;
      if (b.x > b.targetX && b.charging <= 0) {
        b.x = Math.max(b.targetX, b.x - 120 * dt);
      }
      b.phaseTimer -= dt;
      if (b.phaseTimer <= 0) {
        b.attackIdx = (b.attackIdx + 1) % 3;
        if (b.attackIdx === 0) {
          // 扇形三連火彈
          b.phaseTimer = 1.65;
          for (let a = -0.35; a <= 0.35; a += 0.35) {
            state.enemyBullets.push({
              x: b.x - 40, y: b.y - 68,
              vx: -Math.cos(a) * 310, vy: Math.sin(a) * 260, r: 9
            });
          }
        } else if (b.attackIdx === 1) {
          // 衝鋒雙火刃突擊
          b.charging = 0.85;
          b.phaseTimer = 2.1;
          addPopup(b.x, b.y - 125, "羅剎突擊！", "#ef4444", 14);
        } else {
          // 跳躍震波
          b.vy = -520;
          b.phaseTimer = 1.9;
        }
      }
      if (b.charging > 0) {
        b.charging -= dt;
        b.x -= (b.charging > 0.42 ? 320 : -320) * dt;
      } else {
        b.x += (b.targetX - b.x) * Math.min(1, dt * 4);
      }
      b.vy += 1200 * dt;
      b.y += b.vy * dt;
      if (b.y >= groundY()) {
        if (b.vy > 200) {
          state.shake = Math.max(state.shake, 7);
          state.enemyBullets.push({ x: b.x - 30, y: groundY() - 12, vx: -340, vy: 0, r: 10 });
        }
        b.y = groundY();
        b.vy = 0;
      }
      if (Math.hypot(p.x - b.x, (p.y - 40) - (b.y - 62)) < 58 && p.dashTimer <= 0) {
        hitPlayer();
      }
    }

    // 敵彈更新
    for (let i = state.enemyBullets.length - 1; i >= 0; i--) {
      const b = state.enemyBullets[i];
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      const pHitY = p.sliding > 0 ? p.y - 20 : p.y - 40;
      if (Math.hypot(b.x - p.x, b.y - pHitY) < b.r + 14) {
        state.enemyBullets.splice(i, 1);
        hitPlayer();
        continue;
      }
      if (b.x < -30 || b.x > viewW + 40 || b.y < -30 || b.y > viewH + 30) {
        state.enemyBullets.splice(i, 1);
      }
    }

    // 斬擊光弧與粒子
    for (let i = state.slashes.length - 1; i >= 0; i--) {
      state.slashes[i].life -= dt;
      if (state.slashes[i].life <= 0) state.slashes.splice(i, 1);
    }
    for (let i = state.particles.length - 1; i >= 0; i--) {
      const pt = state.particles[i];
      pt.x += pt.vx * dt;
      pt.y += pt.vy * dt;
      pt.vy += 420 * dt;
      pt.life -= dt;
      if (pt.life <= 0) state.particles.splice(i, 1);
    }
    for (let i = state.popups.length - 1; i >= 0; i--) {
      const pop = state.popups[i];
      pop.y += pop.vy * dt;
      pop.life -= dt;
      if (pop.life <= 0) state.popups.splice(i, 1);
    }

    p.animPhase += dt * (p.grounded ? 14 : 9);
  }

  function drawSpriteCell(cellX, cellY, x, y, drawW, drawH, flipX = false, squashY = 1, rot = 0) {
    if (!assets.ready) return;
    const sw = assets.sprites.width / 2;
    const sh = assets.sprites.height / 2;
    ctx.save();
    ctx.translate(x, y);
    if (rot) ctx.rotate(rot);
    ctx.scale(flipX ? -1 : 1, squashY);
    ctx.drawImage(
      assets.sprites,
      cellX * sw + 8, cellY * sh + 8, sw - 16, sh - 16,
      -drawW / 2, -drawH, drawW, drawH
    );
    ctx.restore();
  }

  function render() {
    ctx.save();
    ctx.scale(dpr, dpr);

    // Camera Shake
    if (state.shake > 0) {
      const sx = (Math.random() - 0.5) * state.shake * 2;
      const sy = (Math.random() - 0.5) * state.shake * 2;
      ctx.translate(sx, sy);
    }

    // 1. 浮世繪金月夜色背景 (Parallax 視差微動)
    if (assets.ready) {
      const bgScale = Math.max((viewW + 40) / assets.bg.width, viewH / assets.bg.height);
      const bw = assets.bg.width * bgScale;
      const bh = assets.bg.height * bgScale;
      const panX = -((state.time * 18) % 36);
      ctx.drawImage(assets.bg, (viewW - bw) / 2 + panX * 0.4, (viewH - bh) / 2, bw, bh);
    } else {
      ctx.fillStyle = "#10172c";
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // 奧義施放暗幕閃光
    if (state.ultiAnimTimer > 0) {
      ctx.fillStyle = `rgba(201, 42, 42, ${Math.min(0.35, state.ultiAnimTimer * 0.4)})`;
      ctx.fillRect(0, 0, viewW, viewH);
    }

    // 2. 屋簷瓦片結構（多排瓦當與木樑紋理）
    for (const r of state.rooftops) {
      const grad = ctx.createLinearGradient(0, r.y, 0, r.y + 120);
      grad.addColorStop(0, "#1e293b");
      grad.addColorStop(0.24, "#0f172a");
      grad.addColorStop(1, "#070b14");
      ctx.fillStyle = grad;
      ctx.fillRect(r.x, r.y, r.w, r.h);

      // 屋簷金邊瓦紋
      ctx.fillStyle = "#eab308";
      ctx.fillRect(r.x, r.y, r.w, 4);
      ctx.fillStyle = "#334155";
      for (let tx = r.x + 8; tx < r.x + r.w - 10; tx += 26) {
        ctx.fillRect(tx, r.y + 7, 16, 8);
        ctx.fillStyle = "#1e293b";
        ctx.fillRect(tx + 2, r.y + 19, 12, 18);
        ctx.fillStyle = "#334155";
      }
      // 橫向木樑
      ctx.fillStyle = "#3f2e21";
      ctx.fillRect(r.x, r.y + 42, r.w, 7);
    }

    // 3. 銀杏葉粒子
    for (const lf of state.leaves) {
      ctx.save();
      ctx.translate(lf.x, lf.y);
      ctx.rotate(lf.rot);
      ctx.fillStyle = "#facc15";
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(-lf.size, -lf.size * 0.8);
      ctx.lineTo(lf.size, -lf.size * 0.8);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    // 4. 瞬身殘影拖尾
    for (const af of state.afterimages) {
      ctx.save();
      ctx.globalAlpha = af.life * 2.2;
      drawSpriteCell(af.jumping ? 1 : 0, 0, af.x, af.y, 92, 92, false, 1, 0);
      ctx.restore();
    }

    // 5. 敵人精靈
    for (const e of state.enemies) {
      ctx.fillStyle = "rgba(0,0,0,0.45)";
      ctx.beginPath();
      ctx.ellipse(e.x, e.y, 24, 6, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      if (e.flash > 0) ctx.filter = "brightness(2.2)";
      const bob = Math.sin(state.time * 8 + e.x * 0.05) * 0.04;
      drawSpriteCell(0, 1, e.x, e.y, 96, 96, false, 1 + bob, 0);
      ctx.restore();
    }

    // 6. Boss 羅剎鎧
    if (state.boss) {
      const b = state.boss;
      ctx.fillStyle = "rgba(0,0,0,0.55)";
      ctx.beginPath();
      ctx.ellipse(b.x, groundY(), 46, 10, 0, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      if (b.flash > 0) ctx.filter = "brightness(2.1)";
      const bSquash = 1 + Math.sin(state.time * 6) * 0.03;
      drawSpriteCell(1, 1, b.x, b.y, 154, 154, false, bSquash, 0);
      ctx.restore();
    }

    // 7. 主角忍者（根據地上奔跑 / 空中翻滾切換兩張透明 PNG 動作精靈）
    const p = state.player;
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.beginPath();
    ctx.ellipse(p.x, p.y, p.grounded ? 26 : 16, 6, 0, 0, Math.PI * 2);
    ctx.fill();

    if (!(p.invuln > 0 && Math.floor(p.invuln * 20) % 2 === 1)) {
      const isAir = !p.grounded;
      const runBob = p.grounded ? Math.sin(p.animPhase) * 0.06 : 0;
      const slideSquash = p.sliding > 0 ? 0.62 : (1 + runBob);
      const tilt = p.dashTimer > 0 ? 0.16 : (p.grounded ? 0.06 : (state.time * 6) % (Math.PI * 2));
      drawSpriteCell(isAir ? 1 : 0, 0, p.x, p.y, 98, 98, false, slideSquash, isAir ? Math.sin(state.time * 12) * 0.18 : tilt);
    }

    // 8. 斬擊光弧
    for (const sl of state.slashes) {
      const alpha = sl.life / sl.maxLife;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = sl.color;
      ctx.lineWidth = 10 * alpha;
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, sl.r, -Math.PI * 0.45, Math.PI * 0.45);
      ctx.stroke();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 4 * alpha;
      ctx.beginPath();
      ctx.arc(sl.x, sl.y, sl.r - 4, -Math.PI * 0.35, Math.PI * 0.35);
      ctx.stroke();
      ctx.restore();
    }

    // 9. 手裏劍 & 敵彈
    for (const s of state.shurikens) {
      ctx.save();
      ctx.translate(s.x, s.y);
      ctx.rotate(s.rot);
      ctx.fillStyle = "#fde047";
      ctx.strokeStyle = "#92400e";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const a = (i * Math.PI) / 2;
        ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
        ctx.lineTo(Math.cos(a + 0.4) * 3, Math.sin(a + 0.4) * 3);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    }

    for (const b of state.enemyBullets) {
      ctx.save();
      ctx.fillStyle = "#ef4444";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#fef08a";
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.r * 0.48, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // 10. 火花粒子與跳字
    for (const pt of state.particles) {
      ctx.save();
      ctx.globalAlpha = Math.max(0, pt.life / pt.maxLife);
      ctx.fillStyle = pt.color;
      ctx.fillRect(pt.x - pt.size / 2, pt.y - pt.size / 2, pt.size, pt.size);
      ctx.restore();
    }

    ctx.textAlign = "center";
    for (const pop of state.popups) {
      ctx.save();
      ctx.globalAlpha = Math.min(1, pop.life * 2);
      ctx.font = `900 ${pop.size}px "Noto Serif TC", sans-serif`;
      ctx.strokeStyle = "#090d16";
      ctx.lineWidth = 3;
      ctx.strokeText(pop.text, pop.x, pop.y);
      ctx.fillStyle = pop.color;
      ctx.fillText(pop.text, pop.x, pop.y);
      ctx.restore();
    }

    ctx.restore();
  }

  function syncHud() {
    ui.act.textContent = `第${state.act}幕`;
    ui.stageName.textContent = ACT_NAMES[state.act - 1];
    const pct = state.boss
      ? 100
      : Math.min(100, Math.round((state.distance / state.actLength) * 100));
    ui.progress.style.width = `${pct}%`;

    const stones = ui.hp.querySelectorAll(".magatama");
    stones.forEach((el, idx) => {
      el.classList.toggle("lost", idx >= state.player.hp);
    });

    ui.score.textContent = Math.floor(state.score);

    if (state.combo >= 2) {
      ui.combo.textContent = `連斬 x${state.combo}`;
      ui.combo.classList.add("show");
    } else {
      ui.combo.classList.remove("show");
    }

    if (state.boss) {
      const hpPct = Math.max(0, Math.round((state.boss.hp / state.boss.maxHp) * 100));
      ui.bossHpText.textContent = `${hpPct}%`;
      ui.bossHpFill.style.width = `${hpPct}%`;
    }

    const uPct = Math.floor(state.ulti);
    ui.padUlti.innerHTML = uPct >= 100
      ? `奧義就緒!<span class="sub">E</span>`
      : `奧義 ${uPct}%<span class="sub">E</span>`;
    ui.padUlti.classList.toggle("locked", uPct < 100);
  }

  // 主動畫迴圈
  let lastTs = performance.now();
  let hudTick = 0;
  function loop(now) {
    const rawDt = Math.min(0.05, (now - lastTs) / 1000);
    lastTs = now;
    let rem = rawDt;
    while (rem > 0) {
      const sub = Math.min(rem, 1 / 120);
      step(sub);
      rem -= sub;
    }
    render();
    hudTick += rawDt;
    if (hudTick >= 0.08) {
      hudTick = 0;
      syncHud();
    }
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  // 鍵盤與手機觸控手勢
  window.addEventListener("keydown", (e) => {
    if (e.code === "ArrowUp" || e.code === "KeyW") { e.preventDefault(); doJump(); }
    else if (e.code === "ArrowDown" || e.code === "KeyS") { e.preventDefault(); doSlide(); }
    else if (e.code === "ShiftLeft" || e.code === "ShiftRight" || e.code === "KeyD") { e.preventDefault(); doDashSlash(); }
    else if (e.code === "Space" || e.code === "KeyJ") { e.preventDefault(); doShoot(); }
    else if (e.code === "KeyE") { e.preventDefault(); doUlti(); }
    else if (e.code === "KeyP" || e.code === "Escape") {
      if (state.mode === "playing") pauseGame();
      else if (state.mode === "paused") resumeGame();
    }
  });

  // Canvas 單指滑動手勢（上跳/下鏟/右瞬身/點擊射擊）
  let ptrStart = null;
  canvas.addEventListener("pointerdown", (e) => {
    ptrStart = { x: e.clientX, y: e.clientY, handled: false };
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!ptrStart || ptrStart.handled || state.mode !== "playing") return;
    const dx = e.clientX - ptrStart.x;
    const dy = e.clientY - ptrStart.y;
    if (dy < -28 && Math.abs(dy) > Math.abs(dx)) {
      ptrStart.handled = true;
      doJump();
    } else if (dy > 28 && Math.abs(dy) > Math.abs(dx)) {
      ptrStart.handled = true;
      doSlide();
    } else if (dx > 32 && Math.abs(dx) > Math.abs(dy)) {
      ptrStart.handled = true;
      doDashSlash();
    }
  });
  canvas.addEventListener("pointerup", () => {
    if (ptrStart && !ptrStart.handled && state.mode === "playing") {
      doShoot();
    }
    ptrStart = null;
  });
  canvas.addEventListener("pointercancel", () => { ptrStart = null; });

  function bindBtn(id, fn) {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener("pointerdown", (e) => {
      e.preventDefault();
      e.stopPropagation();
      el.classList.add("pressed");
      fn();
    });
    const rel = () => el.classList.remove("pressed");
    el.addEventListener("pointerup", rel);
    el.addEventListener("pointercancel", rel);
    el.addEventListener("pointerleave", rel);
  }
  bindBtn("pad-jump", doJump);
  bindBtn("pad-slide", doSlide);
  bindBtn("pad-shoot", doShoot);
  bindBtn("pad-dash", doDashSlash);
  bindBtn("pad-ulti", doUlti);

  function pauseGame() {
    if (state.mode !== "playing") return;
    state.mode = "paused";
    ui.pauseStats.textContent = `目前得分：${Math.floor(state.score)}｜最高紀錄：${Math.max(state.bestScore, Math.floor(state.score))}`;
    ui.modalPause.classList.remove("hidden");
  }
  function resumeGame() {
    if (state.mode !== "paused") return;
    state.mode = "playing";
    ui.modalPause.classList.add("hidden");
  }

  document.getElementById("btn-start").addEventListener("click", resetGame);
  document.getElementById("btn-pause").addEventListener("click", () => {
    if (state.mode === "playing") pauseGame();
    else if (state.mode === "paused") resumeGame();
  });
  document.getElementById("btn-resume").addEventListener("click", resumeGame);
  document.getElementById("btn-restart-pause").addEventListener("click", resetGame);
  document.getElementById("btn-replay").addEventListener("click", resetGame);

  document.getElementById("btn-fs")?.addEventListener("click", () => {
    const el = document.documentElement;
    if (!document.fullscreenElement) el.requestFullscreen?.().catch(() => {});
    else document.exitFullscreen?.().catch(() => {});
  });

  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "PARENT_FS_STATE") {
      document.body.classList.toggle("parent-fs", Boolean(e.data.value));
    }
  });

  document.addEventListener("visibilitychange", () => {
    if (document.hidden && state.mode === "playing") pauseGame();
  });

  // 自動化測試與可觀測性鉤子
  window.render_game_to_text = () => ({
    id: "shinobi",
    mode: state.mode,
    act: state.act,
    distance: Math.round(state.distance),
    score: Math.floor(state.score),
    bestScore: state.bestScore,
    hp: state.player.hp,
    combo: state.combo,
    ulti: Math.floor(state.ulti),
    bossHp: state.boss ? state.boss.hp : null,
    enemies: state.enemies.length
  });
  window.advanceTime = (ms) => {
    const steps = Math.max(1, Math.ceil(ms / 16));
    const dt = (ms / 1000) / steps;
    for (let i = 0; i < steps; i++) step(dt);
    syncHud();
    render();
  };
  if (new URLSearchParams(location.search).get("qa") === "1") {
    window.shinobiQA = {
      spawnBoss: () => { state.act = 3; if (!state.boss) spawnBoss(); syncHud(); render(); },
      fillUlti: () => { state.ulti = 100; syncHud(); }
    };
  }
})();
