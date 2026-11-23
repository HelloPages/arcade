(() => {
  const canvas = document.getElementById("stage");
  const ctx = canvas.getContext("2d");

  const meritEl = document.getElementById("meritCount");
  const btnSound = document.getElementById("btnSound");
  const btnScene = document.getElementById("btnScene");
  const btnAuto = document.getElementById("btnAuto");
  const chipsRow = document.getElementById("chipsRow");
  const weaponRow = document.getElementById("weaponRow");
  const actionRow = document.getElementById("actionRow");
  const sidePropRail = document.getElementById("sidePropRail");
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
    "weapon-slipper": "./assets/v2/weapon-slipper.webp?v=20261122_real_flipflop_v1",
    "weapon-stool": "./assets/v2/weapon-stool.webp?v=20261122_tw_giant_v1",
    "weapon-zapper": "./assets/v2/weapon-zapper.webp?v=20261122_tw_giant_v1",
    "weapon-cooker": "./assets/v2/weapon-cooker.webp?v=20261122_tw_giant_v1",
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
    "Shrimp_normal": "./assets/office-fullbody-webp/Shrimp_normal.webp?v=20261122_nomole_v1",
    "Shrimp_happy": "./assets/office-fullbody-webp/Shrimp_happy.webp?v=20261122_nomole_v1",
    "Shrimp_hurt_cry": "./assets/office-fullbody-webp/Shrimp_hurt_cry.webp?v=20261122_nomole_v1",
    "Shrimp_innocent": "./assets/office-fullbody-webp/Shrimp_innocent.webp?v=20261122_nomole_v1",
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
    "weapon-slipper", "weapon-stool", "weapon-zapper", "weapon-cooker",
    "Tony_normal", "Tony_happy", "Tony_hurt_cry", "Tony_innocent"
  ];
  immediateKeys.forEach(loadImg);
  if (imgs[bgKey]) {
    imgs[bgKey].addEventListener("load", () => setTimeout(preloadRestCast, 120), { once: true });
    imgs[bgKey].addEventListener("error", () => setTimeout(preloadRestCast, 120), { once: true });
  }
  setTimeout(preloadRestCast, 1200);

  // --- 復古電玩 8-bit Chiptune BGM ＋ 零延遲跟手打擊音效引擎（統一經由 masterGain + AnalyserNode 輸出）---
  const soundUnlockPill = document.getElementById("soundUnlockPill");
  let audioCtx = null;
  let masterGain = null;
  let audioAnalyser = null;
  let audioPcmBuf = null;
  let noiseBuffer = null;
  let soundOn = true;
  let bgmTimerId = null;
  let bgmNextNoteTime = 0;
  let bgmStep = 0;
  let bgmRunning = false;
  let audioUnlocked = false;
  let lastAudioError = "";

  function audioOut(ac) {
    return masterGain || ac.destination;
  }

  function isAudioActuallyRunning() {
    return !!(soundOn && audioCtx && audioCtx.state === "running");
  }

  function syncSoundUI() {
    const running = isAudioActuallyRunning();
    if (btnSound) {
      btnSound.textContent = !soundOn ? "🔇" : (running ? "🔊" : "🔈");
      btnSound.setAttribute("aria-label", !soundOn ? "靜音" : (running ? "音效開" : "點一下開聲音"));
    }
    if (soundUnlockPill) {
      // 僅在「使用者未靜音，但瀏覽器尚未解鎖或背景切回待解鎖」時顯示輕量一次開聲提示
      const needTap = soundOn && !running;
      soundUnlockPill.classList.toggle("hidden", !needTap);
    }
  }

  function ensureAudio() {
    if (!soundOn) return null;
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) {
        audioCtx = new AC();
        masterGain = audioCtx.createGain();
        masterGain.gain.setValueAtTime(1.0, audioCtx.currentTime);
        audioAnalyser = audioCtx.createAnalyser();
        audioAnalyser.fftSize = 256;
        audioPcmBuf = new Float32Array(audioAnalyser.fftSize);
        masterGain.connect(audioAnalyser);
        audioAnalyser.connect(audioCtx.destination);
        audioCtx.onstatechange = () => {
          if (audioCtx && audioCtx.state === "running") {
            audioUnlocked = true;
            if (soundOn && !document.hidden) startRetroBgm();
          } else {
            stopRetroBgm();
          }
          syncSoundUI();
        };
      }
    }
    if (audioCtx && !noiseBuffer) {
      const len = Math.floor(audioCtx.sampleRate * 0.18);
      noiseBuffer = audioCtx.createBuffer(1, len, audioCtx.sampleRate);
      const data = noiseBuffer.getChannelData(0);
      for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    }
    return audioCtx;
  }

  function measureAudioOutput() {
    if (!audioAnalyser || !audioPcmBuf || !audioCtx || audioCtx.state !== "running") {
      return { rms: 0, peak: 0 };
    }
    audioAnalyser.getFloatTimeDomainData(audioPcmBuf);
    let sumSq = 0, peak = 0;
    for (let i = 0; i < audioPcmBuf.length; i++) {
      const v = Math.abs(audioPcmBuf[i]);
      sumSq += v * v;
      if (v > peak) peak = v;
    }
    return {
      rms: +Math.sqrt(sumSq / audioPcmBuf.length).toFixed(5),
      peak: +peak.toFixed(5)
    };
  }

  // 朗朗上口 144 BPM 復古街機五聲道喜氣旋律（64 步八分音符循環，A段俏皮＋B段高潮）
  const NOTE_HZ = {
    C3: 130.81, D3: 146.83, E3: 164.81, F3: 174.61, G3: 196.00, A3: 220.00, B3: 246.94,
    C4: 261.63, D4: 293.66, E4: 329.63, F4: 349.23, G4: 392.00, A4: 440.00, B4: 493.88,
    C5: 523.25, D5: 587.33, E5: 659.25, F5: 698.46, G5: 783.99, A5: 880.00, B5: 987.77, C6: 1046.50, D6: 1174.66
  };
  const BGM_LEAD = [
    "G5", null, "E5", "G5", "A5", null, "G5", "E5",
    "D5", "E5", "G5", null, "E5", null, "C5", null,
    "E5", null, "G5", "A5", "C6", null, "A5", "G5",
    "E5", "G5", "A5", null, "G5", null, null, null,
    "C6", null, "A5", "G5", "A5", "C6", "D6", null,
    "C6", "A5", "G5", "E5", "G5", null, "A5", null,
    "G5", "E5", "D5", "E5", "G5", "A5", "G5", "E5",
    "D5", null, "E5", "D5", "C5", null, null, null
  ];
  const BGM_BASS = [
    "C3", null, "G3", null, "A3", null, "G3", null,
    "F3", null, "C4", null, "G3", null, "D3", null,
    "C3", null, "G3", null, "A3", null, "E3", null,
    "F3", null, "G3", null, "C3", null, "G3", null,
    "F3", null, "C4", null, "G3", null, "D4", null,
    "A3", null, "E3", null, "G3", null, "D3", null,
    "F3", null, "G3", null, "E3", null, "A3", null,
    "D3", null, "G3", null, "C3", null, "G3", null
  ];

  // 5 聲道豐富復古電玩 BGM（主旋律方波＋合聲方波＋16分音符琶音＋彈跳低音＋完整8-bit鼓組）
  const BGM_HARM = [
    "E5", null, "C5", "E5", "F5", null, "E5", "C5",
    "B4", "C5", "E5", null, "C5", null, "G4", null,
    "C5", null, "E5", "F5", "A5", null, "F5", "E5",
    "C5", "E5", "F5", null, "E5", null, null, null,
    "A5", null, "F5", "E5", "F5", "A5", "B5", null,
    "A5", "F5", "E5", "C5", "E5", null, "F5", null,
    "E5", "C5", "B4", "C5", "E5", "F5", "E5", "C5",
    "B4", null, "C5", "B4", "G4", null, null, null
  ];
  const BGM_CHORDS = [
    ["C4", "E4", "G4", "C5"],
    ["A3", "C4", "E4", "A4"],
    ["F3", "A3", "C4", "F4"],
    ["G3", "B3", "D4", "G4"]
  ];
  const COMBO_PENTATONIC = [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50, 1174.66, 1318.51];

  function scheduleBgmStep(ac, step, time) {
    const stepDur = 60 / 144 / 2; // 144 BPM 八分音符 (~0.208s)
    const leadNote = BGM_LEAD[step % BGM_LEAD.length];
    const harmNote = BGM_HARM[step % BGM_HARM.length];
    const bassNote = BGM_BASS[step % BGM_BASS.length];
    const chord = BGM_CHORDS[Math.floor((step % 16) / 4)];

    // 1. 8-bit 方波主旋律（柔和退居背景，不搶打擊音效風采）
    if (leadNote && NOTE_HZ[leadNote]) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(NOTE_HZ[leadNote], time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(0.017, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0005, time + stepDur * 0.92);
      osc.connect(g).connect(audioOut(ac));
      osc.start(time);
      osc.stop(time + stepDur * 0.95);
    }

    // 2. 復古街機三度／六度合聲（輕柔襯底）
    if (harmNote && NOTE_HZ[harmNote]) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "square";
      osc.frequency.setValueAtTime(NOTE_HZ[harmNote], time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(0.007, time + 0.014);
      g.gain.exponentialRampToValueAtTime(0.0004, time + stepDur * 0.85);
      osc.connect(g).connect(audioOut(ac));
      osc.start(time);
      osc.stop(time + stepDur * 0.88);
    }

    // 3. 16 分音符閃亮電玩琶音（輕盈點綴）
    for (let sub = 0; sub < 2; sub++) {
      const arpKey = chord[(step * 2 + sub) % chord.length];
      if (NOTE_HZ[arpKey]) {
        const at = time + sub * (stepDur * 0.5);
        const osc = ac.createOscillator();
        const g = ac.createGain();
        osc.type = mode === "slap" ? "triangle" : "sine";
        osc.frequency.setValueAtTime(NOTE_HZ[arpKey] * 2, at);
        g.gain.setValueAtTime(0.0001, at);
        g.gain.linearRampToValueAtTime(0.007, at + 0.008);
        g.gain.exponentialRampToValueAtTime(0.0004, at + stepDur * 0.46);
        osc.connect(g).connect(audioOut(ac));
        osc.start(at);
        osc.stop(at + stepDur * 0.48);
      }
    }

    // 4. 復古三角波彈跳低音
    if (bassNote && NOTE_HZ[bassNote]) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(NOTE_HZ[bassNote], time);
      g.gain.setValueAtTime(0.0001, time);
      g.gain.linearRampToValueAtTime(0.034, time + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0008, time + stepDur * 1.45);
      osc.connect(g).connect(audioOut(ac));
      osc.start(time);
      osc.stop(time + stepDur * 1.5);
    }

    // 5. 輕量 8-bit 街機鼓組
    if (step % 4 === 0) {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(142, time);
      osc.frequency.exponentialRampToValueAtTime(42, time + 0.075);
      g.gain.setValueAtTime(0.030, time);
      g.gain.exponentialRampToValueAtTime(0.0008, time + 0.085);
      osc.connect(g).connect(audioOut(ac));
      osc.start(time);
      osc.stop(time + 0.09);
    } else if (step % 4 === 2 && noiseBuffer) {
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer;
      const bp = ac.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.setValueAtTime(2400, time);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.013, time);
      g.gain.exponentialRampToValueAtTime(0.0004, time + 0.065);
      src.connect(bp).connect(g).connect(audioOut(ac));
      src.start(time);
      src.stop(time + 0.07);
    }
    if (step % 2 === 1 && noiseBuffer) {
      const src = ac.createBufferSource();
      src.buffer = noiseBuffer;
      const filt = ac.createBiquadFilter();
      filt.type = "highpass";
      filt.frequency.setValueAtTime(6800, time);
      const g = ac.createGain();
      g.gain.setValueAtTime(0.007, time);
      g.gain.exponentialRampToValueAtTime(0.0004, time + 0.032);
      src.connect(filt).connect(g).connect(audioOut(ac));
      src.start(time);
      src.stop(time + 0.036);
    }
    if (step % 16 === 0) {
      const bell = ac.createOscillator();
      const bg = ac.createGain();
      bell.type = "sine";
      bell.frequency.setValueAtTime(1567.98, time);
      bg.gain.setValueAtTime(0.009, time);
      bg.gain.exponentialRampToValueAtTime(0.0003, time + 0.22);
      bell.connect(bg).connect(audioOut(ac));
      bell.start(time);
      bell.stop(time + 0.24);
    }
  }

  function startRetroBgm() {
    if (!soundOn || document.hidden) return;
    const ac = ensureAudio();
    if (!ac) return;
    // 嚴格檢查：僅在 AudioContext 真正處於 running 才設 bgmRunning = true，絕不假設已啟動！
    if (ac.state !== "running") {
      syncSoundUI();
      return;
    }
    if (masterGain) masterGain.gain.setValueAtTime(1.0, ac.currentTime);
    if (bgmRunning && bgmTimerId) {
      syncSoundUI();
      return;
    }
    bgmRunning = true;
    bgmNextNoteTime = ac.currentTime + 0.03;
    const stepDur = 60 / 144 / 2;
    // 立刻排程第一個音符，確保解鎖當下零延遲發聲
    scheduleBgmStep(ac, bgmStep, bgmNextNoteTime);
    bgmNextNoteTime += stepDur;
    bgmStep = (bgmStep + 1) % BGM_LEAD.length;

    bgmTimerId = setInterval(() => {
      if (!soundOn || !audioCtx || audioCtx.state !== "running" || document.hidden) {
        stopRetroBgm();
        syncSoundUI();
        return;
      }
      if (bgmNextNoteTime < audioCtx.currentTime - 0.25) {
        bgmNextNoteTime = audioCtx.currentTime + 0.02;
      }
      while (bgmNextNoteTime < audioCtx.currentTime + 0.14) {
        scheduleBgmStep(audioCtx, bgmStep, bgmNextNoteTime);
        bgmNextNoteTime += stepDur;
        bgmStep = (bgmStep + 1) % BGM_LEAD.length;
      }
    }, 45);
    syncSoundUI();
  }

  function stopRetroBgm() {
    bgmRunning = false;
    if (bgmTimerId) {
      clearInterval(bgmTimerId);
      bgmTimerId = null;
    }
  }

  // 第一次互動即自動解鎖並開啟復古電玩 BGM；離開分頁／切換網頁／跳出視窗立刻停止音樂！
  function pauseAudioOnLeave() {
    stopRetroBgm();
    if (audioCtx && masterGain) {
      try { masterGain.gain.setValueAtTime(0, audioCtx.currentTime); } catch {}
    }
    if (audioCtx && audioCtx.state === "running") {
      audioCtx.suspend().catch(err => { lastAudioError = String(err || ""); });
    }
    syncSoundUI();
  }
  function resumeAudioOnReturn() {
    if (document.hidden || !soundOn || !audioUnlocked) {
      syncSoundUI();
      return;
    }
    const ac = ensureAudio();
    if (!ac) { syncSoundUI(); return; }
    if (masterGain) masterGain.gain.setValueAtTime(1.0, ac.currentTime);
    if (ac.state === "running") {
      startRetroBgm();
    } else {
      ac.resume().then(() => {
        if (!document.hidden && soundOn && ac.state === "running") {
          audioUnlocked = true;
          startRetroBgm();
        }
        syncSoundUI();
      }).catch(err => {
        lastAudioError = String(err || "");
        syncSoundUI();
      });
    }
  }
  function unlockAudioOnGesture(e) {
    // 若點的是喇叭鈕或開聲提示鈕，交由按鈕自身 click handler 精確處理，避免 pointerdown 先跑造成 click 誤切靜音！
    if (e && e.target && e.target.closest && (e.target.closest("#btnSound") || e.target.closest("#soundUnlockPill"))) {
      return;
    }
    if (!soundOn || document.hidden) return;
    const ac = ensureAudio();
    if (!ac) return;
    if (masterGain) masterGain.gain.setValueAtTime(1.0, ac.currentTime);
    if (ac.state === "running") {
      audioUnlocked = true;
      startRetroBgm();
      syncSoundUI();
      return;
    }
    ac.resume().then(() => {
      if (!document.hidden && soundOn && ac.state === "running") {
        audioUnlocked = true;
        startRetroBgm();
      }
      syncSoundUI();
    }).catch(err => {
      lastAudioError = String(err || "");
      syncSoundUI();
    });
  }
  window.addEventListener("pointerdown", unlockAudioOnGesture, { passive: true, capture: true });
  window.addEventListener("touchend", unlockAudioOnGesture, { passive: true, capture: true });
  window.addEventListener("click", unlockAudioOnGesture, { passive: true, capture: true });
  window.addEventListener("keydown", unlockAudioOnGesture, { passive: true, capture: true });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) pauseAudioOnLeave();
    else resumeAudioOnReturn();
  });
  window.addEventListener("pagehide", pauseAudioOnLeave);
  window.addEventListener("beforeunload", pauseAudioOnLeave);
  window.addEventListener("blur", pauseAudioOnLeave);
  window.addEventListener("focus", resumeAudioOnReturn);

  // 零延遲瞬發噪音衝擊層（讓每次點擊跟手爆脆！）
  function playImpactCrack(ac, now, freq = 1800, dur = 0.055, vol = 0.24) {
    if (!noiseBuffer) return;
    const src = ac.createBufferSource();
    src.buffer = noiseBuffer;
    const bp = ac.createBiquadFilter();
    bp.type = "bandpass";
    bp.frequency.setValueAtTime(freq, now);
    bp.Q.setValueAtTime(1.2, now);
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, now);
    g.gain.exponentialRampToValueAtTime(0.001, now + dur);
    src.connect(bp).connect(g).connect(audioOut(ac));
    src.start(now);
    src.stop(now + dur + 0.01);
  }

  function playWeaponSound(weaponId, heavy = false) {
    const ac = ensureAudio();
    if (!ac) return;
    const now = ac.currentTime;

    // 1. 超強力瞬發打擊脆響＋拳拳到肉低頻重擊層（BGM 退後、打擊衝擊力大幅加強！）
    playImpactCrack(ac, now, weaponId === "zapper" ? 3600 : weaponId === "cooker" ? 2400 : 1550, heavy ? 0.14 : 0.075, heavy ? 0.58 : 0.44);
    const punch = ac.createOscillator();
    const pg = ac.createGain();
    punch.type = "sine";
    punch.frequency.setValueAtTime(195, now);
    punch.frequency.exponentialRampToValueAtTime(44, now + 0.11);
    pg.gain.setValueAtTime(heavy ? 0.55 : 0.36, now);
    pg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
    punch.connect(pg).connect(audioOut(ac));
    punch.start(now); punch.stop(now + 0.13);

    const comboHz = COMBO_PENTATONIC[slapCombo % COMBO_PENTATONIC.length];
    const chime = ac.createOscillator();
    const cg = ac.createGain();
    chime.type = "triangle";
    chime.frequency.setValueAtTime(comboHz, now);
    cg.gain.setValueAtTime(0.18, now);
    cg.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    chime.connect(cg).connect(audioOut(ac));
    chime.start(now); chime.stop(now + 0.15);

    // 2. 各台式武器專屬復古電玩多層次打擊聲（全面加強音量與存在感）
    if (heavy) {
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, idx) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "square";
        o.frequency.setValueAtTime(f, now + idx * 0.025);
        g.gain.setValueAtTime(0.22, now + idx * 0.025);
        g.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.025 + 0.28);
        o.connect(g).connect(audioOut(ac));
        o.start(now + idx * 0.025);
        o.stop(now + idx * 0.025 + 0.30);
      });
      return;
    }

    if (weaponId === "zapper") {
      [1320, 880, 1760].forEach((f, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.type = "sawtooth";
        o.frequency.setValueAtTime(f, now + i * 0.020);
        o.frequency.exponentialRampToValueAtTime(f * 0.35, now + i * 0.020 + 0.052);
        g.gain.setValueAtTime(0.28, now + i * 0.020);
        g.gain.exponentialRampToValueAtTime(0.001, now + i * 0.020 + 0.058);
        o.connect(g).connect(audioOut(ac));
        o.start(now + i * 0.020); o.stop(now + i * 0.020 + 0.062);
      });
    } else if (weaponId === "cooker") {
      // 經典紅電鍋從天而降砸頭：超重低音砸頭＋超大聲清脆金屬「噹！！」＋蒸氣嘶嘶
      const thud = ac.createOscillator();
      const tg = ac.createGain();
      thud.type = "triangle";
      thud.frequency.setValueAtTime(220, now);
      thud.frequency.exponentialRampToValueAtTime(52, now + 0.11);
      tg.gain.setValueAtTime(0.46, now);
      tg.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      thud.connect(tg).connect(audioOut(ac));
      thud.start(now); thud.stop(now + 0.13);

      [1318.5, 2637.0].forEach((f, i) => {
        const ding = ac.createOscillator();
        const dg = ac.createGain();
        ding.type = "sine";
        ding.frequency.setValueAtTime(f, now + 0.012);
        dg.gain.setValueAtTime(i === 0 ? 0.42 : 0.20, now + 0.012);
        dg.gain.exponentialRampToValueAtTime(0.001, now + 0.52);
        ding.connect(dg).connect(audioOut(ac));
        ding.start(now + 0.012); ding.stop(now + 0.54);
      });
      if (noiseBuffer) {
        const hiss = ac.createBufferSource();
        hiss.buffer = noiseBuffer;
        const hp = ac.createBiquadFilter();
        hp.type = "highpass";
        hp.frequency.setValueAtTime(4200, now + 0.04);
        const hg = ac.createGain();
        hg.gain.setValueAtTime(0.11, now + 0.04);
        hg.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        hiss.connect(hp).connect(hg).connect(audioOut(ac));
        hiss.start(now + 0.04); hiss.stop(now + 0.23);
      }
    } else if (weaponId === "stool") {
      const o1 = ac.createOscillator();
      const g1 = ac.createGain();
      o1.type = "square";
      o1.frequency.setValueAtTime(360, now);
      o1.frequency.exponentialRampToValueAtTime(84, now + 0.12);
      g1.gain.setValueAtTime(0.38, now);
      g1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      o1.connect(g1).connect(audioOut(ac));
      o1.start(now); o1.stop(now + 0.14);

      const o2 = ac.createOscillator();
      const g2 = ac.createGain();
      o2.type = "triangle";
      o2.frequency.setValueAtTime(580, now + 0.032);
      o2.frequency.exponentialRampToValueAtTime(170, now + 0.11);
      g2.gain.setValueAtTime(0.32, now + 0.032);
      g2.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      o2.connect(g2).connect(audioOut(ac));
      o2.start(now + 0.032); o2.stop(now + 0.125);
    } else {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.type = "triangle";
      o.frequency.setValueAtTime(460, now);
      o.frequency.exponentialRampToValueAtTime(62, now + 0.095);
      g.gain.setValueAtTime(0.48, now);
      g.gain.exponentialRampToValueAtTime(0.001, now + 0.11);
      o.connect(g).connect(audioOut(ac));
      o.start(now); o.stop(now + 0.115);

      const boing = ac.createOscillator();
      const bg = ac.createGain();
      boing.type = "sine";
      boing.frequency.setValueAtTime(250, now + 0.03);
      boing.frequency.exponentialRampToValueAtTime(560, now + 0.12);
      bg.gain.setValueAtTime(0.18, now + 0.03);
      bg.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      boing.connect(bg).connect(audioOut(ac));
      boing.start(now + 0.03); boing.stop(now + 0.135);
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
    gain.connect(audioOut(ac));
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
    osc.frequency.setValueAtTime(660, now);
    osc.frequency.exponentialRampToValueAtTime(240, now + 0.055);
    gain.gain.setValueAtTime(0.14, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
    osc.connect(gain).connect(audioOut(ac));
    osc.start(now); osc.stop(now + 0.07);
  }

  function explicitEnableSound() {
    soundOn = true;
    const ac = ensureAudio();
    if (!ac) { syncSoundUI(); return; }
    if (masterGain) masterGain.gain.setValueAtTime(1.0, ac.currentTime);
    if (ac.state === "running") {
      audioUnlocked = true;
      startRetroBgm();
      playWoodClack();
      syncSoundUI();
      return;
    }
    ac.resume().then(() => {
      if (!document.hidden && soundOn && ac.state === "running") {
        audioUnlocked = true;
        startRetroBgm();
        playWoodClack();
      }
      syncSoundUI();
    }).catch(err => {
      lastAudioError = String(err || "");
      syncSoundUI();
    });
  }

  btnSound.addEventListener("click", (e) => {
    e.stopPropagation();
    // 關鍵修正：若目前未靜音但瀏覽器尚未解鎖 AudioContext（例如首次點按或背景返回待解鎖），
    // 點按喇叭應「明確解鎖開聲」而不是把 soundOn 反向切成靜音！
    if (!soundOn || !audioCtx || audioCtx.state !== "running") {
      explicitEnableSound();
      return;
    }
    soundOn = false;
    stopRetroBgm();
    if (audioCtx && masterGain) {
      try { masterGain.gain.setValueAtTime(0, audioCtx.currentTime); } catch {}
    }
    syncSoundUI();
  });

  if (soundUnlockPill) {
    soundUnlockPill.addEventListener("click", (e) => {
      e.stopPropagation();
      explicitEnableSound();
    });
  }
  syncSoundUI();

  // --- 狀態 ---
  const STORAGE_KEY = "xinan_temple_merit_v1";
  let merit = Number(localStorage.getItem(STORAGE_KEY) || "0") || 0;
  function addMerit(n) {
    merit += n;
    localStorage.setItem(STORAGE_KEY, String(merit));
    meritEl.textContent = String(merit);
    if (typeof renderMeritLedCanvas === "function") renderMeritLedCanvas();
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
  let partyCannonTimer = 1.6;

  const CONFETTI_COLORS = ["#ffdc16", "#ff327b", "#15f6b7", "#24bdff", "#ff7535", "#faefff", "#a66aff"];
  const FUN_ICONS = {
    slap: ["🩴", "🪑", "⚡", "🍚", "🧋", "🧧", "🪙", "🎉", "😂", "💖", "⭐", "✨"],
    bless: ["🏮", "🧧", "🪙", "🌸", "🎐", "✨", "💖", "🍊", "🎉", "🌈"],
    oracle: ["🎋", "🧧", "🪙", "✨", "⭐", "🏮", "💖", "🎉", "🎊"]
  };

  function spawnShockwave(x, y, color = "#ffd466", maxR = 110, lineW = 4) {
    shockwaves.push({ x, y, color, r: 12, maxR, lineW, life: 0.42, maxLife: 0.42 });
  }

  const GOD_GHOST_HUMOR_I18N = {
    tw: [
      "土地公廣播：「買了啦！我土地廟都換 4K OLED 監視器了！」",
      "財神爺路過：「雙螢幕買下去，業績直接飛升成仙！」",
      "月老提醒：「別打了，再打我就把你跟加班綁紅線喔！」",
      "黑白無常回報：「報告神明，他的薪水還在路上塞車！」",
      "灶神開示：「珍奶全糖去冰，喝完再敲十下藍白拖！」",
      "文昌帝君：「簡報第 18 版終於過關，拜託別再改字體！」",
      "門神偷瞄：「誰偷喝珍奶？我從門縫都看得一清二楚！」",
      "媽祖微笑：「心安指數爆表！今日免排隊 VIP 優先保佑！」",
      "鍾馗拍桌：「水逆小鬼抓去面壁，大家準時下班吃宵夜！」",
      "財神爺撒紅包：「笑得這麼開心，先賞你 +30 香火壓壓驚！」"
    ],
    en: [
      "Earth God PSA: \"Just buy it! Even my shrine runs dual 4K OLEDs now!\"",
      "God of Wealth: \"Dual monitors unlocked—watch your KPIs ascend!\"",
      "Matchmaker Deity: \"Keep bonking and I'll tie your red string to overtime!\"",
      "Underworld Patrol: \"Update: your raise is still stuck in rush-hour traffic!\"",
      "Kitchen God: \"Nothing a full-sugar boba tea and ten slipper bonks can't fix!\"",
      "God of Exams: \"Deck v18 approved! Nobody touch the fonts!\"",
      "Door Guardian: \"I saw who drank the office boba through the door crack!\"",
      "Mazu smiles: \"Max zen vibes! VIP express blessing granted today!\"",
      "Zhong Kui: \"Mercury retrograde grounded—clock out on time for late-night snacks!\"",
      "God of Wealth tosses a red envelope: \"Bonus +30 Zen for that big grin!\""
    ],
    ko: [
      "토지신 안내: \"질러요! 우리 사당도 4K OLED 듀얼 모니터로 바꿨다니까요!\"",
      "재물신 한마디: \"듀얼 모니터 들이면 실적도 하늘로 승천합니다!\"",
      "인연의 신 경고: \"계속 때리면 야근이랑 붉은 실로 묶어버린다?!\"",
      "저승사자 보고: \"신령님, 이분 월급 인상이 아직 퇴근길 정체 중입니다!\"",
      "부엌신 비법: \"달달한 버블티 한 잔 마시고 슬리퍼 10연타면 끝!\"",
      "학문의 신: \"발표자료 18번째 수정본 최종 통과! 제발 폰트만은 건드리지 마!\"",
      "문지기 신: \"누가 몰래 버블티 마셨는지 문틈으로 다 봤어요!\"",
      "마조 여신 미소: \"평온 지수 만점! 오늘 VIP 고속 축복권 발급!\"",
      "종규 일갈: \"수성 역행 귀신은 벽 보고 반성 중! 다들 칼퇴하고 야식 드세요!\"",
      "재물신 세뱃돈 투척: \"웃는 얼굴이 보기 좋아서 평온 +30 보너스!\""
    ]
  };
  let deityBannerText = "";
  let deityBannerTimer = 0;

  // =========================================================================
  // 演唱會手舉牌「圓點 LED 矩陣字」核心引擎（官方 TakWolf Fusion Pixel 12px zh_tw）
  // 將 12px 點陣字模的每個亮格繪成一顆顆獨立發光的圓形 LED 燈珠，燈珠間保留清晰暗隙
  // =========================================================================
  const ledCache = new Map();
  let ledFontReady = false;
  const ledSampleCanvas = document.createElement("canvas");
  const ledSampleCtx = ledSampleCanvas.getContext("2d", { willReadFrequently: true });

  function sampleLedBitmap(text) {
    const str = String(text || "");
    if (!str) return { cols: 0, rows: 12, bits: new Uint8Array(0) };
    const fontStr = `12px 'FusionPixel12', 'Noto Sans TC', monospace`;
    ledSampleCtx.font = fontStr;
    const estW = Math.max(16, Math.ceil(ledSampleCtx.measureText(str).width) + 8);
    const estH = 16;
    if (ledSampleCanvas.width < estW) ledSampleCanvas.width = estW;
    if (ledSampleCanvas.height < estH) ledSampleCanvas.height = estH;
    ledSampleCtx.clearRect(0, 0, estW, estH);
    ledSampleCtx.font = fontStr;
    ledSampleCtx.textBaseline = "top";
    ledSampleCtx.textAlign = "left";
    ledSampleCtx.fillStyle = "#ffffff";
    ledSampleCtx.fillText(str, 2, 2);

    const imgData = ledSampleCtx.getImageData(0, 0, estW, estH).data;
    let minX = estW, maxX = -1, minY = estH, maxY = -1;
    for (let y = 0; y < estH; y++) {
      for (let x = 0; x < estW; x++) {
        if (imgData[(y * estW + x) * 4 + 3] >= 100) {
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }
    }
    if (maxX < minX) return { cols: 0, rows: 12, bits: new Uint8Array(0) };
    const cols = maxX - minX + 1;
    const rows = Math.max(12, maxY - minY + 1);
    const yOff = Math.max(0, minY);
    const bits = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      const sy = yOff + y;
      if (sy >= estH) continue;
      for (let x = 0; x < cols; x++) {
        const sx = minX + x;
        if (imgData[(sy * estW + sx) * 4 + 3] >= 100) {
          bits[y * cols + x] = 1;
        }
      }
    }
    return { cols, rows, bits };
  }

  function getLedTextSprite(text, opts = {}) {
    const pitch = opts.pitch || 2.2;
    const color = opts.color || "#ffe875";
    const glow = opts.glow || "rgba(255, 206, 72, 0.42)";
    const dimDot = opts.dimDot !== false;
    const pad = opts.pad != null ? opts.pad : 3;
    const key = `${ledFontReady ? "F" : "B"}|${text}|${pitch}|${color}|${glow}|${dimDot ? 1 : 0}|${pad}`;
    if (ledCache.has(key)) return ledCache.get(key);

    const bm = sampleLedBitmap(text);
    if (bm.cols === 0) return null;
    const cssW = Math.ceil(bm.cols * pitch + pad * 2);
    const cssH = Math.ceil(bm.rows * pitch + pad * 2);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(cssW * dpr));
    c.height = Math.max(1, Math.ceil(cssH * dpr));
    const g = c.getContext("2d");
    g.scale(dpr, dpr);

    // 1. 暗色未點亮 LED 燈座底陣列（讓燈板質感更立體、燈珠間距一目了然）
    const rDot = pitch * 0.34;
    if (dimDot) {
      g.fillStyle = "rgba(255, 255, 255, 0.055)";
      for (let y = 0; y < bm.rows; y++) {
        const cy = pad + (y + 0.5) * pitch;
        for (let x = 0; x < bm.cols; x++) {
          const cx = pad + (x + 0.5) * pitch;
          g.beginPath();
          g.arc(cx, cy, rDot * 0.85, 0, Math.PI * 2);
          g.fill();
        }
      }
    }

    // 2. 柔光外暈（適度發光，不糊字）
    g.fillStyle = glow;
    for (let y = 0; y < bm.rows; y++) {
      const cy = pad + (y + 0.5) * pitch;
      for (let x = 0; x < bm.cols; x++) {
        if (!bm.bits[y * bm.cols + x]) continue;
        const cx = pad + (x + 0.5) * pitch;
        g.beginPath();
        g.arc(cx, cy, rDot * 1.48, 0, Math.PI * 2);
        g.fill();
      }
    }

    // 3. 實心明亮圓形 LED 燈珠（明確圓點＋間隙）
    g.fillStyle = color;
    for (let y = 0; y < bm.rows; y++) {
      const cy = pad + (y + 0.5) * pitch;
      for (let x = 0; x < bm.cols; x++) {
        if (!bm.bits[y * bm.cols + x]) continue;
        const cx = pad + (x + 0.5) * pitch;
        g.beginPath();
        g.arc(cx, cy, rDot, 0, Math.PI * 2);
        g.fill();
      }
    }

    // 4. 燈珠中心高光點（呈現演唱會手舉牌 LED 亮點感）
    g.fillStyle = "rgba(255, 255, 255, 0.78)";
    const rHi = Math.max(0.35, rDot * 0.38);
    for (let y = 0; y < bm.rows; y++) {
      const cy = pad + (y + 0.5) * pitch - rDot * 0.16;
      for (let x = 0; x < bm.cols; x++) {
        if (!bm.bits[y * bm.cols + x]) continue;
        const cx = pad + (x + 0.5) * pitch - rDot * 0.16;
        g.beginPath();
        g.arc(cx, cy, rHi, 0, Math.PI * 2);
        g.fill();
      }
    }

    const res = { canvas: c, width: cssW, height: cssH, cols: bm.cols, rows: bm.rows };
    if (ledCache.size > 140) ledCache.clear();
    ledCache.set(key, res);
    return res;
  }

  function renderBrandLedCanvas(label) {
    const c = document.getElementById("ledBrandCanvas");
    if (!c) return;
    const text = label || (typeof xt === "function" ? xt().brand : "心安宮") || "心安宮";
    const sp = getLedTextSprite(text, {
      pitch: 2.2,
      color: "#ffe46b",
      glow: "rgba(255, 198, 56, 0.45)",
      dimDot: true,
      pad: 2
    });
    if (!sp) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.max(1, Math.ceil(sp.width * dpr));
    c.height = Math.max(1, Math.ceil(sp.height * dpr));
    c.style.width = `${sp.width}px`;
    c.style.height = `${sp.height}px`;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(sp.canvas, 0, 0);
  }

  function renderMeritLedCanvas() {
    const c = document.getElementById("meritLedCanvas");
    if (!c) return;
    const lbl = (typeof xt === "function" ? xt().merit : "心安") || "心安";
    const text = `${lbl} ${merit}`;
    const sp = getLedTextSprite(text, {
      pitch: 1.55,
      color: "#ffe875",
      glow: "rgba(255, 206, 68, 0.45)",
      dimDot: true,
      pad: 1
    });
    if (!sp) return;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.width = Math.max(1, Math.ceil(sp.width * dpr));
    c.height = Math.max(1, Math.ceil(sp.height * dpr));
    c.style.width = `${sp.width}px`;
    c.style.height = `${sp.height}px`;
    const g = c.getContext("2d");
    g.clearRect(0, 0, c.width, c.height);
    g.drawImage(sp.canvas, 0, 0);
  }

  function renderDomLedLabel(el, text, opts = {}) {
    if (!el) return;
    const str = String(text || "");
    el.setAttribute("aria-label", str);
    el.dataset.ledText = str;
    el.dataset.ledPitch = String(opts.pitch || 1.35);
    el.dataset.ledColor = opts.color || "#ffe880";
    el.dataset.ledGlow = opts.glow || "rgba(255, 204, 68, 0.42)";
    const sp = getLedTextSprite(str, {
      pitch: opts.pitch || 1.35,
      color: opts.color || "#ffe880",
      glow: opts.glow || "rgba(255, 204, 68, 0.42)",
      dimDot: opts.dimDot !== false,
      pad: 1
    });
    if (!sp) {
      el.textContent = str;
      return;
    }
    let cv = el.querySelector(":scope > canvas.led-ui-canvas");
    if (!cv) {
      el.textContent = "";
      cv = document.createElement("canvas");
      cv.className = "led-ui-canvas";
      el.appendChild(cv);
    }
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    cv.width = Math.max(1, Math.ceil(sp.width * dpr));
    cv.height = Math.max(1, Math.ceil(sp.height * dpr));
    cv.style.width = `${sp.width}px`;
    cv.style.height = `${sp.height}px`;
    const g = cv.getContext("2d");
    g.clearRect(0, 0, cv.width, cv.height);
    g.drawImage(sp.canvas, 0, 0);
  }

  function refreshAllLedDomLabels() {
    renderBrandLedCanvas();
    renderMeritLedCanvas();
    document.querySelectorAll("[data-led-text]").forEach(el => {
      renderDomLedLabel(el, el.dataset.ledText, {
        pitch: parseFloat(el.dataset.ledPitch) || 1.35,
        color: el.dataset.ledColor || "#ffe880",
        glow: el.dataset.ledGlow || "rgba(255, 204, 68, 0.42)"
      });
    });
  }

  if (document.fonts && document.fonts.load) {
    document.fonts.load("12px 'FusionPixel12'").then(() => {
      ledFontReady = document.fonts.check("12px 'FusionPixel12'");
      ledCache.clear();
      refreshAllLedDomLabels();
    }).catch(() => {});
    document.fonts.ready.then(() => {
      ledFontReady = document.fonts.check("12px 'FusionPixel12'");
      ledCache.clear();
      refreshAllLedDomLabels();
    }).catch(() => {});
  }

  function showDeityBanner(text, duration = 3.6) {
    deityBannerText = text;
    deityBannerTimer = duration;
  }

  function maybeTriggerDeityCameo(force = false) {
    if (!force && Math.random() > 0.28) return;
    const list = GOD_GHOST_HUMOR_I18N[getXinanLang()] || GOD_GHOST_HUMOR_I18N.tw;
    const line = list[Math.floor(Math.random() * list.length)];
    deityBannerText = line;
    deityBannerTimer = 3.6;
    if (line.includes("+30")) {
      addMerit(30);
      playBellSound(880);
      spawnFestiveShower(mode, 1.8);
    }
  }

  function spawnAmbientDrop(modeKey = mode) {
    if (funDrops.length > 155) return;
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
    { id: "slipper", label: "巨型藍白拖", sprite: "weapon-slipper", color: "#5cc8ff", power: 2, stamp: { tw: "啪啦！！", en: "MEGA SMACK!", ko: "찰싹!!" } },
    { id: "stool", label: "辦桌紅椅", sprite: "weapon-stool", color: "#ff4d4d", power: 4, stamp: { tw: "哐噹！！", en: "STOOL BONK!", ko: "쾅!!" } },
    { id: "zapper", label: "阿嬤電蚊拍", sprite: "weapon-zapper", color: "#ffe047", power: 3, stamp: { tw: "滋滋啪！！", en: "BZZZT ZAP!", ko: "찌릿!!" } },
    { id: "cooker", label: "經典紅電鍋", sprite: "weapon-cooker", color: "#ff7043", power: 4, stamp: { tw: "噹！熟了！", en: "DING! DONE!", ko: "땡! 다됐다!" } }
  ];

  // 預設啟動就是「偷泥」+「藍白拖」
  let selectedScenario = slapScenarios.find(s => s.id === "tony");
  let customTargetLabel = "";
  let selectedWeapon = weapons[0];
  let slapCombo = 0;
  let slapCharge = 0; // 0..10
  let weaponAnim = 0;
  let weaponHeavy = false;
  let weaponStampTimer = 0;
  let weaponStampText = "";
  let impactFlashTimer = 0;
  const sakuraPetals = Array.from({ length: 18 }, () => ({
    x: Math.random(),
    y: Math.random(),
    vx: -0.015 - Math.random() * 0.025,
    vy: 0.028 + Math.random() * 0.036,
    size: 5 + Math.random() * 5.5,
    rot: Math.random() * Math.PI * 2,
    vrot: (Math.random() - 0.5) * 2.4,
    phase: Math.random() * Math.PI * 2,
    gold: Math.random() < 0.35
  }));
  let villainSquash = 0;
  let villainDizzy = 0;
  let villainFly = 0;
  let charMood = "normal"; // "normal" | "happy" | "hurt_cry" | "innocent"
  let charMoodTimer = 0;
  let forceMoodForTest = null;
  let autoTheater = true;
  let theaterTimer = 1.6;
  let theaterBeat = 0;

  // --- 心安宮 TW / EN / KO 本土化語系字典（非逐字直譯）---
  const XINAN_I18N = {
    tw: {
      brand: "心安宮",
      seal: "殿",
      merit: "心安",
      modeSlap: "打小人",
      modeBless: "祈福",
      modeOracle: "問卦",
      sceneBtn: "換景",
      autoOn: "自動:演",
      autoOff: "自動:停",
      swapPrefix: "換:",
      slapCta: (w) => `${w}連擊！`,
      ultReady: "鎮煞重擊！",
      ultCharge: (c) => `重擊 ${c}/10`,
      blessCta: (n) => `為 ${n} 放祈福 ↗`,
      oracleStep1: (n) => `① 為 ${n} 誠心搖籤`,
      oracleStep2: (n) => `② 為 ${n} 擲聖筊解籤`,
      oracleShaking: (n) => `為 ${n} 誠心搖籤中...`,
      oracleThrowing: "聖筊高拋落下中...",
      closeResult: "收下祝福",
      bannerAutoOn: "🎬 自動劇情重新開演！隨時點畫面即可接手",
      bannerAutoOff: "🖐️ 已暫停自動劇情，換你親自開玩！",
      bannerScene: (lbl) => `🏮 已切換場景：${lbl}`,
      names: { three_mu: "3畝", kenny: "肯尼", judy: "啾底", tony: "偷泥", shrimp: "蝦婷", junior: "學妹", sara: "沙拉" },
      weapons: { slipper: "巨型藍白拖", stool: "辦桌紅椅", zapper: "阿嬤電蚊拍", cooker: "經典紅電鍋" },
      blessings: { lantern: "平安天燈", wealth: "招財進寶", career: "貴人相助", health: "健康平安" },
      scenes: { sunny: "櫻花廟埕", office: "歡樂螢幕間", festival: "廟口嘉年華", skylantern: "天燈雲海台", oraclehall: "金龍問卦殿", night: "暮色雕龍殿" }
    },
    en: {
      brand: "Lucky Zen Shrine",
      seal: "✦",
      merit: "Zen",
      modeSlap: "Bonk!",
      modeBless: "Bless",
      modeOracle: "Oracle",
      sceneBtn: "Scene",
      autoOn: "Auto: ON",
      autoOff: "Auto: OFF",
      swapPrefix: "Swap:",
      slapCta: (w) => `${w} Bonk!`,
      ultReady: "MEGA BONK!",
      ultCharge: (c) => `Ult ${c}/10`,
      blessCta: (n) => `Bless ${n} ↗`,
      oracleStep1: (n) => `① Shake Lot for ${n}`,
      oracleStep2: (n) => `② Toss Blocks`,
      oracleShaking: (n) => `Shaking lot for ${n}...`,
      oracleThrowing: "Tossing lucky blocks...",
      closeResult: "Claim Blessing",
      bannerAutoOn: "🎬 Auto-comedy resumed! Tap anywhere to take over.",
      bannerAutoOff: "🖐️ Auto-show paused — you're in full control!",
      bannerScene: (lbl) => `🏮 Stage switched: ${lbl}`,
      names: { three_mu: "3Mu", kenny: "Kenny", judy: "Judy", tony: "Tony", shrimp: "Shrimp", junior: "Junior", sara: "Sara" },
      weapons: { slipper: "Mega Slipper", stool: "Red Stool", zapper: "Bug Zapper", cooker: "Rice Cooker" },
      blessings: { lantern: "Sky Lantern", wealth: "Jackpot", career: "Promotion", health: "Good Vibes" },
      scenes: { sunny: "Blossom Courtyard", office: "Monitor Showroom", festival: "Temple Carnival", skylantern: "Lantern Terrace", oraclehall: "Dragon Oracle Hall", night: "Twilight Shrine" }
    },
    ko: {
      brand: "마음안심궁",
      seal: "궁",
      merit: "평온",
      modeSlap: "액땜",
      modeBless: "기원",
      modeOracle: "운세",
      sceneBtn: "배경",
      autoOn: "자동:켜짐",
      autoOff: "자동:꺼짐",
      swapPrefix: "교체:",
      slapCta: (w) => `${w} 연타!`,
      ultReady: "초강력 액땜!",
      ultCharge: (c) => `필살 ${c}/10`,
      blessCta: (n) => `${n} 복 빌어주기 ↗`,
      oracleStep1: (n) => `① ${n} 운세 뽑기`,
      oracleStep2: (n) => `② 신점 산통 던지기`,
      oracleShaking: (n) => `${n} 점괘 흔드는 중...`,
      oracleThrowing: "산통이 날아오르는 중...",
      closeResult: "복 받기",
      bannerAutoOn: "🎬 자동 코미디가 다시 시작됩니다! 터치하면 즉시 직접 조작.",
      bannerAutoOff: "🖐️ 자동 모드 일시정지 — 이제 직접 플레이하세요!",
      bannerScene: (lbl) => `🏮 배경 전환: ${lbl}`,
      names: { three_mu: "3무", kenny: "케니", judy: "주디", tony: "토니", shrimp: "슈림프", junior: "후배", sara: "사라" },
      weapons: { slipper: "초대형 슬리퍼", stool: "빨간 의자", zapper: "전기 모기채", cooker: "빨간 밥솥" },
      blessings: { lantern: "소원 풍등", wealth: "재물운", career: "귀인운", health: "건강운" },
      scenes: { sunny: "벚꽃 사당 마당", office: "즐거운 모니터 룸", festival: "사당 축제 광장", skylantern: "풍등 구름 전망대", oraclehall: "황금용 운세전", night: "황혼 용조각전" }
    }
  };

  function getXinanLang() {
    return (window.ArcadeI18n && window.ArcadeI18n.getLang()) || "tw";
  }
  function xt() {
    return XINAN_I18N[getXinanLang()] || XINAN_I18N.tw;
  }
  function getLocalizedCharName(s) {
    return (xt().names && xt().names[s.id]) || s.label;
  }
  function getLocalizedWeaponName(w) {
    return (xt().weapons && xt().weapons[w.id]) || w.label;
  }
  function getLocalizedBlessName(b) {
    return (xt().blessings && xt().blessings[b.id]) || b.label;
  }
  function getLocalizedSceneName(id) {
    return (xt().scenes && xt().scenes[id]) || (SCENE_DEFS[id]?.label || "");
  }

  function applyXinanStaticChrome() {
    const t = xt();
    const seal = document.querySelector(".brand-seal");
    renderBrandLedCanvas(t.brand);
    renderMeritLedCanvas();
    if (seal) seal.textContent = t.seal;
    const mSlap = document.querySelector('.mode-btn[data-mode="slap"]');
    const mBless = document.querySelector('.mode-btn[data-mode="bless"]');
    const mOracle = document.querySelector('.mode-btn[data-mode="oracle"]');
    if (mSlap) renderDomLedLabel(mSlap, t.modeSlap, { pitch: 1.32, color: mSlap.classList.contains("active") ? "#fff5b8" : "#ffd978" });
    if (mBless) renderDomLedLabel(mBless, t.modeBless, { pitch: 1.32, color: mBless.classList.contains("active") ? "#fff5b8" : "#ffd978" });
    if (mOracle) renderDomLedLabel(mOracle, t.modeOracle, { pitch: 1.32, color: mOracle.classList.contains("active") ? "#fff5b8" : "#ffd978" });
    if (btnScene) renderDomLedLabel(btnScene, t.sceneBtn, { pitch: 1.32, color: "#ffe596" });
    if (btnCloseResult) renderDomLedLabel(btnCloseResult, t.closeResult, { pitch: 1.5, color: "#fff5c0" });
    syncAutoBtn();
  }

  function syncAutoBtn() {
    if (!btnAuto) return;
    const t = xt();
    btnAuto.classList.toggle("auto-on", autoTheater);
    renderDomLedLabel(btnAuto, autoTheater ? t.autoOn : t.autoOff, {
      pitch: 1.25,
      color: autoTheater ? "#ffe875" : "#ffd790"
    });
  }

  function stopAutoOnUserAction() {
    if (!autoTheater) return;
    autoTheater = false;
    syncAutoBtn();
  }

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

  let lastLayoutBoxes = { weapon: null, bubble: null, charTopY: 0, deityActive: false };

  function performSlap(heavy = false) {
    if (!resultCard.classList.contains("hidden")) return;
    if (heavy && slapCharge < 10) return;

    weaponAnim = 1;
    weaponHeavy = heavy;
    impactFlashTimer = heavy ? 0.24 : 0.14;
    villainSquash = heavy ? 1.12 : 0.78;
    villainDizzy = heavy ? 2.4 : 0.95;
    shake = heavy ? 22 : ((selectedWeapon.id === "stool" || selectedWeapon.id === "cooker") ? 13 : 9);
    weaponStampTimer = heavy ? 0.75 : 0.52;
    weaponStampText = (selectedWeapon.stamp && (selectedWeapon.stamp[getXinanLang()] || selectedWeapon.stamp.tw)) || "啪啦！！";

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
      if (slapCombo % 5 === 0) maybeTriggerDeityCameo(true);
      else maybeTriggerDeityCameo(false);
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
    maybeTriggerDeityCameo(false);
    const blessLine = !customWishLabel.trim() && selectedScenario.blessLine
      ? `${selectedScenario.blessLine}（${wishText}）`
      : `為${targetName}祈求「${wishText}」心想事成！`;
    spawnFloatText(vw * 0.5, activeCharTopY - 18, blessLine, "#ffd980", 21);
  }

  // =========================================================
  // 3. 問卦（完整竹籤筒＋靈籤抽出＋完整紅木聖筊，對當前角色問卦）
  // =========================================================
  const fortunes = [
    { grade: "上上籤", title: "財神敲門・卡刷不斷", body: "財神爺說你今天手氣旺到連自動販賣機都會多掉一罐，買螢幕直接遇到神價！" },
    { grade: "大吉籤", title: "土地公按讚・小人退散", body: "土地公已幫你把衰運丟進資源回收桶並清空，今日宜喝珍奶、不宜加班！" },
    { grade: "爆笑吉籤", title: "月老手滑・貴人暴走", body: "月老原本要牽紅線，結果手滑牽到一張大訂單，貴人正騎著藍白拖火速趕來！" },
    { grade: "特吉籤", title: "文昌加冕・簡報免改", body: "文昌帝君親筆批示：今天交出去的提案一次過關，主管連標點符號都不會改！" },
    { grade: "神明認證", title: "灶神加菜・滿血復活", body: "灶神開示：沒什麼事是一杯全糖珍奶解決不了的；如果有，那就加一顆布丁！" },
    { grade: "超吉籤", title: "鍾馗代班・水逆清空", body: "鍾馗已經把電腦當機小鬼抓去面壁思過，今天系統順到像剛買 240Hz 新螢幕！" },
    { grade: "上吉籤", title: "媽祖護航・準時閃人", body: "媽祖賜你下班加速光環，六點一到自動隱身，沒人敢在電梯口攔你開會！" },
    { grade: "福星籤", title: "黑白無常・幫你喊讚", body: "黑白無常路過表示你的肝很健康，但還是建議今天早點睡，明天繼續賺大錢！" }
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
    if (weaponRow) weaponRow.innerHTML = "";
    actionRow.innerHTML = "";
    const t = xt();

    // 左側直排道具快選欄（打小人／祈福／問卦道具直接排左邊，一個一個點就換！）
    if (sidePropRail) {
      sidePropRail.innerHTML = "";
      if (mode === "slap") {
        weapons.forEach(w => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "prop-rail-btn" + (selectedWeapon.id === w.id ? " active" : "");
          const lbl = getLocalizedWeaponName(w).replace(/^巨型|^阿嬤|^經典|^辦桌/, "");
          btn.innerHTML = `<img src="${assetUrls[w.sprite]}" alt="${lbl}"><span>${lbl}</span>`;
          btn.onclick = () => {
            stopAutoOnUserAction();
            selectedWeapon = w;
            playWoodClack();
            spawnFestiveShower("slap", 0.55);
            renderControls();
          };
          sidePropRail.appendChild(btn);
        });
      } else if (mode === "bless") {
        blessScenarios.forEach(b => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "prop-rail-btn" + (selectedBless.id === b.id ? " active" : "");
          const lbl = getLocalizedBlessName(b);
          btn.innerHTML = `<img src="${assetUrls[b.sprite]}" alt="${lbl}"><span>${lbl.slice(0, 4)}</span>`;
          btn.onclick = () => {
            stopAutoOnUserAction();
            selectedBless = b;
            playBellSound(587);
            spawnFestiveShower("bless", 0.55);
            renderControls();
          };
          sidePropRail.appendChild(btn);
        });
      } else if (mode === "oracle") {
        const lang = getXinanLang();
        const oracleItems = [
          {
            id: "shake",
            sprite: "oracle-tube",
            label: lang === "en" ? "Shake" : lang === "ko" ? "흔들기" : "搖籤筒",
            active: oracleStep === "ready" || oracleStep === "shaking" || oracleStep === "done",
            onClick: () => { stopAutoOnUserAction(); shakeOracle(); }
          },
          {
            id: "blocks",
            sprite: "oracle-blocks",
            label: lang === "en" ? "Blocks" : lang === "ko" ? "산통" : "擲聖筊",
            active: oracleStep === "drawn" || oracleStep === "throwing",
            onClick: () => {
              stopAutoOnUserAction();
              if (oracleStep === "drawn") throwBlocks();
              else shakeOracle();
            }
          }
        ];
        oracleItems.forEach(item => {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "prop-rail-btn" + (item.active ? " active" : "");
          btn.innerHTML = `<img src="${assetUrls[item.sprite]}" alt="${item.label}"><span>${item.label}</span>`;
          btn.onclick = item.onClick;
          sidePropRail.appendChild(btn);
        });
      }
    }

    // 第 1 排角色列：7 位角色單排等寬 7 格（圓點 LED 燈珠字）
    slapScenarios.forEach(s => {
      const b = document.createElement("button");
      b.type = "button";
      const isAct = selectedScenario.id === s.id && !customTargetLabel;
      b.className = "chip-btn" + (isAct ? " active" : "");
      renderDomLedLabel(b, getLocalizedCharName(s), {
        pitch: 1.32,
        color: isAct ? "#fff6b0" : "#ffd980"
      });
      b.onclick = () => { stopAutoOnUserAction(); selectedScenario = s; customTargetLabel = ""; renderControls(); };
      chipsRow.appendChild(b);
    });

    // 同步左側道具欄短字為圓點 LED
    if (sidePropRail) {
      sidePropRail.querySelectorAll(".prop-rail-btn span").forEach(sp => {
        const txt = sp.textContent || "";
        if (txt) renderDomLedLabel(sp, txt, { pitch: 1.15, color: sp.closest(".active") ? "#fff5a8" : "#ffe196", dimDot: false });
      });
    }

    const targetName = customTargetLabel || getLocalizedCharName(selectedScenario);

    if (mode === "slap") {
      const wLabel = getLocalizedWeaponName(selectedWeapon);
      const wCycle = document.createElement("button");
      wCycle.type = "button";
      wCycle.className = "rect-btn cycle-nudge";
      renderDomLedLabel(wCycle, `${t.swapPrefix}${wLabel}`, { pitch: 1.28, color: "#ffe594" });
      wCycle.onclick = () => {
        stopAutoOnUserAction();
        const idx = weapons.findIndex(w => w.id === selectedWeapon.id);
        selectedWeapon = weapons[(idx + 1) % weapons.length];
        playWoodClack();
        renderControls();
      };
      actionRow.appendChild(wCycle);

      const slapBtn = document.createElement("button");
      slapBtn.type = "button";
      slapBtn.id = "btnPrimaryAction";
      slapBtn.className = "rect-btn primary-btn cta-alive";
      renderDomLedLabel(slapBtn, t.slapCta(wLabel), { pitch: 1.32, color: "#fff6b8", glow: "rgba(255, 224, 102, 0.52)" });
      slapBtn.onclick = () => { stopAutoOnUserAction(); performSlap(false); };
      actionRow.appendChild(slapBtn);

      const ultBtn = document.createElement("button");
      ultBtn.type = "button";
      ultBtn.id = "btnUltimateSlap";
      ultBtn.className = "rect-btn " + (slapCharge >= 10 ? "gold-btn ult-ready" : "");
      renderDomLedLabel(ultBtn, slapCharge >= 10 ? t.ultReady : t.ultCharge(slapCharge), {
        pitch: 1.28,
        color: slapCharge >= 10 ? "#fff69e" : "#f0cb82"
      });
      ultBtn.disabled = slapCharge < 10;
      ultBtn.onclick = () => { stopAutoOnUserAction(); performSlap(true); };
      actionRow.appendChild(ultBtn);
    } else if (mode === "bless") {
      const bLabel = getLocalizedBlessName(selectedBless);
      const bCycle = document.createElement("button");
      bCycle.type = "button";
      bCycle.className = "rect-btn cycle-nudge";
      renderDomLedLabel(bCycle, `${t.swapPrefix}${bLabel}`, { pitch: 1.32, color: "#ffe594" });
      bCycle.onclick = () => {
        stopAutoOnUserAction();
        const idx = blessScenarios.findIndex(s => s.id === selectedBless.id);
        selectedBless = blessScenarios[(idx + 1) % blessScenarios.length];
        playBellSound(587);
        renderControls();
      };
      actionRow.appendChild(bCycle);

      const blessBtn = document.createElement("button");
      blessBtn.type = "button";
      blessBtn.id = "btnPrimaryAction";
      blessBtn.className = "rect-btn gold-btn cta-alive";
      renderDomLedLabel(blessBtn, t.blessCta(targetName), { pitch: 1.38, color: "#fff6b0" });
      blessBtn.onclick = () => { stopAutoOnUserAction(); launchBlessing(); };
      actionRow.appendChild(blessBtn);
    } else if (mode === "oracle") {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.id = "btnPrimaryAction";
      btn.className = "rect-btn " + (oracleStep === "drawn" ? "gold-btn ult-ready cta-alive" : "primary-btn cta-alive");
      const oTxt = oracleStep === "drawn"
        ? t.oracleStep2(targetName)
        : oracleStep === "shaking"
          ? t.oracleShaking(targetName)
          : oracleStep === "throwing"
            ? t.oracleThrowing
            : t.oracleStep1(targetName);
      renderDomLedLabel(btn, oTxt, { pitch: 1.4, color: "#fff6b0" });
      btn.disabled = oracleStep === "shaking" || oracleStep === "throwing";
      btn.onclick = () => {
        stopAutoOnUserAction();
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
    if (btnScene) renderDomLedLabel(btnScene, xt().sceneBtn, { pitch: 1.32, color: "#ffe596" });
    loadImg(def.keyP);
    loadImg(def.keyD);
  }

  function setModeUI(nextMode, isUser = false) {
    if (isUser) stopAutoOnUserAction();
    mode = nextMode;
    document.querySelectorAll(".mode-btn[data-mode]").forEach(b => b.classList.toggle("active", b.dataset.mode === nextMode));
    resultCard.classList.add("hidden");
    floatTexts.length = 0;
    particles.length = 0;
    shockwaves.length = 0;
    comboBadgeTimer = 0;
    oracleStep = "ready";
    pickModeScene(mode, false);
    spawnFestiveShower(mode, 1.05);
    renderControls();
  }

  if (btnScene) {
    btnScene.textContent = xt().sceneBtn;
    btnScene.addEventListener("click", () => {
      stopAutoOnUserAction();
      pickModeScene(mode, true);
      spawnFestiveShower(mode, 1.0);
      showDeityBanner(xt().bannerScene(getLocalizedSceneName(activeSceneId)));
    });
  }

  if (btnAuto) {
    syncAutoBtn();
    btnAuto.addEventListener("click", () => {
      autoTheater = !autoTheater;
      syncAutoBtn();
      if (soundOn && !isAudioActuallyRunning()) explicitEnableSound();
      if (autoTheater) {
        resultCard.classList.add("hidden");
        if (oracleStep === "done") oracleStep = "ready";
        theaterTimer = 0.25;
        showDeityBanner(xt().bannerAutoOn);
      } else {
        showDeityBanner(xt().bannerAutoOff);
      }
      renderControls();
    });
  }

  applyXinanStaticChrome();
  if (window.ArcadeI18n) {
    window.ArcadeI18n.onChange(() => {
      applyXinanStaticChrome();
      floatTexts.length = 0;
      deityBannerTimer = 0;
      renderControls();
    });
  }

  document.querySelectorAll(".mode-btn[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      setModeUI(btn.dataset.mode, true);
    });
  });

  canvas.addEventListener("pointerdown", () => {
    stopAutoOnUserAction();
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
      stopAutoOnUserAction();
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

    // 動態金色斜射聖光束（讓神壇畫面充滿生命力與層次感）
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 4; i++) {
      const rayX = vw * (0.16 + i * 0.23) + Math.sin(t * 0.45 + i * 1.4) * 24;
      const rayW = Math.min(95, vw * 0.16);
      const rayGrad = ctx.createLinearGradient(rayX, 0, rayX + 70, vh * 0.72);
      const alpha = (0.045 + 0.022 * Math.sin(t * 1.2 + i * 1.8));
      rayGrad.addColorStop(0, `rgba(255, 240, 185, ${alpha})`);
      rayGrad.addColorStop(1, "rgba(255, 220, 140, 0)");
      ctx.fillStyle = rayGrad;
      ctx.beginPath();
      ctx.moveTo(rayX - rayW * 0.3, 0);
      ctx.lineTo(rayX + rayW * 0.5, 0);
      ctx.lineTo(rayX + rayW * 1.15, vh * 0.75);
      ctx.lineTo(rayX - rayW * 0.1, vh * 0.75);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();

    // 左右上角輕輕搖曳的喜氣紅金燈籠（不擋 HUD 與角色，增加宮廟慶典立體感）
    ctx.save();
    const hudSafeY = (document.querySelector(".top-hud")?.getBoundingClientRect().bottom || 54) + 6;
    for (const side of [-1, 1]) {
      const lx = side < 0 ? 22 : vw - 22;
      const sway = Math.sin(t * 1.65 + side) * 0.08;
      ctx.save();
      ctx.translate(lx, hudSafeY);
      ctx.rotate(sway);
      // 吊繩
      ctx.strokeStyle = "#ffd980";
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(0, -10);
      ctx.lineTo(0, 6);
      ctx.stroke();
      // 暖光暈
      const lg = ctx.createRadialGradient(0, 20, 2, 0, 20, 32);
      lg.addColorStop(0, `rgba(255, 190, 80, ${0.30 + 0.08 * Math.sin(t * 3 + side)})`);
      lg.addColorStop(1, "rgba(255, 140, 40, 0)");
      ctx.fillStyle = lg;
      ctx.beginPath();
      ctx.arc(0, 20, 32, 0, Math.PI * 2);
      ctx.fill();
      // 燈籠主體
      ctx.fillStyle = "#d92b1e";
      ctx.strokeStyle = "#ffd980";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.ellipse(0, 20, 12, 15, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // 金色上下帽與流蘇
      ctx.fillStyle = "#f2be54";
      ctx.fillRect(-6, 4, 12, 3.5);
      ctx.fillRect(-5, 33, 10, 3);
      ctx.strokeStyle = "#ff8a3d";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, 36);
      ctx.lineTo(Math.sin(t * 3.2 + side) * 3, 48);
      ctx.stroke();
      ctx.restore();
    }
    ctx.restore();

    // 飛舞櫻花花瓣與金箔星點（持續動態視差氛圍）
    sakuraPetals.forEach(p => {
      p.x += p.vx * 0.016 + Math.sin(t * 1.5 + p.phase) * 0.0007;
      p.y += p.vy * 0.016;
      p.rot += p.vrot * 0.016;
      if (p.y > 1.04) { p.y = -0.04; p.x = Math.random(); }
      if (p.x < -0.05) p.x = 1.05;
      ctx.save();
      ctx.translate(p.x * vw, p.y * vh);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.gold ? "rgba(255, 224, 118, 0.72)" : "rgba(255, 186, 206, 0.74)";
      ctx.beginPath();
      ctx.ellipse(0, 0, p.size, p.size * 0.52, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

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

    // 全自動劇情導演（預設自動輪演打小人、祈福、問卦三大模式；一旦人為介入立刻停止）
    if (autoTheater && resultCard.classList.contains("hidden")) {
      if (mode === "oracle" && (oracleStep === "shaking" || oracleStep === "throwing")) {
        // 等待搖籤或擲筊動畫自然播完
      } else {
        theaterTimer -= dt;
        if (theaterTimer <= 0) {
          if (mode === "oracle" && oracleStep === "drawn") {
            throwBlocks();
            theaterTimer = 2.0;
          } else {
            const pool = slapScenarios;
            const beat = theaterBeat % 7;
            theaterBeat += 1;
            const theaterLinesByLang = {
              tw: [
                "買了啦！這台 4K OLED 黑到像老闆的良心！",
                "240Hz 滑到滑鼠自己離家出走！買了啦！",
                "雙螢幕買下去，摸魚看起來像在盯大盤！",
                "這螢幕色彩準到修圖完全不用開濾鏡！",
                "今天不買明天漲價，卡拿出來刷下去！",
                "護眼低藍光，加班到半夜眼睛還在發亮！"
              ],
              en: [
                "Just buy it! This 4K OLED is darker than the boss's conscience!",
                "240Hz so smooth my mouse ran away on its own!",
                "Go dual monitors—slacking off looks like Wall Street trading!",
                "Colors so accurate you can retire every photo filter!",
                "Price goes up tomorrow—swipe that card right now!",
                "Eye-care low blue light: midnight crunch with zero eye strain!"
              ],
              ko: [
                "질러요! 이 4K OLED 블랙은 팀장님 속마음보다 깊어요!",
                "240Hz 너무 부드러워서 마우스가 혼자 가출했대요!",
                "듀얼 모니터 쓰면 딴짓해도 주식 차트 보는 줄 알아요!",
                "색감이 너무 정확해서 보정 필터가 필요 없어요!",
                "오늘 안 사면 내일 올라요—지금 당장 카드 꺼내세요!",
                "시력 보호 저블루라이트! 야근해도 눈이 반짝반짝!"
              ]
            };
            const curLang = getXinanLang();
            const curName = getLocalizedCharName(selectedScenario);
            const evPool = curLang === "tw"
              ? [...theaterLinesByLang.tw, ...selectedScenario.officeEvents]
              : (theaterLinesByLang[curLang] || theaterLinesByLang.en);

            if (beat === 0) {
              if (mode !== "slap") setModeUI("slap", false);
              selectedScenario = pool[Math.floor(Math.random() * pool.length)];
              customTargetLabel = "";
              const ev = evPool[Math.floor(Math.random() * evPool.length)];
              spawnFloatText(vw * 0.5, activeCharTopY - 22, `${getLocalizedCharName(selectedScenario)}：${ev}`, "#2b1a10", 21);
              setCharMood(Math.random() < 0.5 ? "happy" : "innocent", 1.2);
              renderControls();
              theaterTimer = 3.2;
            } else if (beat === 1) {
              if (mode !== "slap") setModeUI("slap", false);
              selectedWeapon = weapons[Math.floor(Math.random() * weapons.length)];
              renderControls();
              performSlap(false);
              theaterTimer = 2.8;
            } else if (beat === 2) {
              if (mode !== "slap") setModeUI("slap", false);
              performSlap(slapCharge >= 10);
              theaterTimer = 3.2;
            } else if (beat === 3) {
              setModeUI("bless", false);
              selectedScenario = pool[Math.floor(Math.random() * pool.length)];
              customTargetLabel = "";
              selectedBless = blessScenarios[Math.floor(Math.random() * blessScenarios.length)];
              renderControls();
              launchBlessing();
              theaterTimer = 3.4;
            } else if (beat === 4) {
              if (mode !== "bless") setModeUI("bless", false);
              selectedBless = blessScenarios[Math.floor(Math.random() * blessScenarios.length)];
              renderControls();
              launchBlessing();
              theaterTimer = 3.4;
            } else if (beat === 5) {
              setModeUI("oracle", false);
              selectedScenario = pool[Math.floor(Math.random() * pool.length)];
              customTargetLabel = "";
              renderControls();
              shakeOracle();
              theaterTimer = 1.4;
            } else {
              setModeUI("slap", false);
              selectedScenario = pool[Math.floor(Math.random() * pool.length)];
              customTargetLabel = "";
              const ev = evPool[Math.floor(Math.random() * evPool.length)];
              spawnFloatText(vw * 0.5, activeCharTopY - 22, `${getLocalizedCharName(selectedScenario)}：${ev}`, "#2b1a10", 21);
              setCharMood("happy", 1.2);
              renderControls();
              theaterTimer = 3.2;
            }
          }
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

      // 台式搞笑武器揮擊：縮小並調整待機／落點位置，待機與打擊瞬間都不遮住人物臉部！
      // 同步記錄 activeWeaponBox 供角色對話泡泡避讓，確保紅電鍋（頭頂垂直重砸）與側揮武器絕不被對話框蓋住！
      let activeWeaponBox = null;
      const wImg = imgs[selectedWeapon.sprite];
      if (wImg && wImg.complete && wImg.naturalWidth > 0) {
        const swing = weaponAnim > 0
          ? (weaponAnim > 0.78 ? 1.0 : Math.pow(weaponAnim / 0.78, 1.55))
          : 0;
        const isOverheadDrop = selectedWeapon.id === "cooker";
        const idleSize = isOverheadDrop
          ? Math.min(102, propBase * 0.25)
          : Math.min(104, propBase * 0.25);
        const hitSize = isOverheadDrop
          ? Math.min(144, propBase * 0.35) * (weaponHeavy ? 1.12 : 1.0)
          : Math.min(148, propBase * 0.35) * (weaponHeavy ? 1.14 : 1.0);
        const wSize = idleSize + (hitSize - idleSize) * swing;
        let wxPos, wyPos, wRot, comicScaleX, comicScaleY;

        if (isOverheadDrop) {
          // 經典紅電鍋：懸浮在角色頭頂正上方蓄勢，點擊瞬間垂直狠狠往下砸頭頂（不遮臉，且對話泡泡退讓至電鍋上方！）
          const topStartY = Math.max(hudBottom + 56, activeCharTopY - idleSize * 0.64);
          const headHitY = activeCharTopY - 8;
          wxPos = altarX;
          wyPos = topStartY + (headHitY - topStartY) * swing;
          wRot = Math.sin(t * 2.6) * 0.06 * (1 - swing);
          comicScaleX = 1 + swing * (weaponHeavy ? 0.22 : 0.16);
          comicScaleY = 1 - swing * (weaponHeavy ? 0.16 : 0.11);
        } else {
          // 藍白拖／紅塑膠椅／電蚊拍：待機持握在人物右下方肩側，揮擊敲在右頰邊緣，整張臉始終清楚可見！
          const restX = Math.min(vw - idleSize * 0.50, altarX + Math.max(108, vSize * 0.58));
          const restY = altarY + vSize * 0.05;
          const hitX = Math.min(vw - hitSize * 0.42, altarX + Math.max(66, vSize * 0.38));
          const hitY = altarY - vSize * 0.06;
          wxPos = restX + (hitX - restX) * swing;
          wyPos = restY + (hitY - restY) * swing;
          wRot = 0.42 - swing * 1.10 + Math.sin(t * 3.1) * 0.05 * (1 - swing);
          comicScaleX = 1 + swing * (weaponHeavy ? 0.18 : 0.12);
          comicScaleY = 1 - swing * 0.08;
        }

        const aspect = wImg.naturalWidth / wImg.naturalHeight;
        const bobY = Math.sin(t * 2.8) * 4 * (1 - swing);
        const drawW = wSize * aspect * comicScaleX;
        const drawH = wSize * comicScaleY;
        activeWeaponBox = {
          id: selectedWeapon.id,
          isOverhead: isOverheadDrop,
          left: Math.round(wxPos - drawW * 0.5),
          right: Math.round(wxPos + drawW * 0.5),
          top: Math.round(wyPos + bobY - drawH * 0.5),
          bottom: Math.round(wyPos + bobY + drawH * 0.5)
        };
        lastLayoutBoxes.weapon = activeWeaponBox;
        lastLayoutBoxes.charTopY = Math.round(activeCharTopY);

        ctx.save();
        if (swing > 0.10) {
          if (isOverheadDrop) {
            // 垂直天降砸頭漫畫速度線
            ctx.strokeStyle = weaponHeavy ? `rgba(255, 212, 102, ${swing * 0.9})` : `rgba(255, 245, 210, ${swing * 0.72})`;
            ctx.lineWidth = weaponHeavy ? 7 : 4.5;
            ctx.lineCap = "round";
            for (const dx of [-46, -18, 18, 46]) {
              ctx.beginPath();
              ctx.moveTo(altarX + dx, wyPos - wSize * 0.78);
              ctx.lineTo(altarX + dx, wyPos - wSize * 0.16);
              ctx.stroke();
            }
          } else {
            ctx.beginPath();
            ctx.arc(altarX + vSize * 0.34, altarY - vSize * 0.06, vSize * 0.38, -1.05, 0.45);
            ctx.strokeStyle = weaponHeavy ? `rgba(255, 212, 102, ${swing * 0.88})` : `rgba(255, 240, 190, ${swing * 0.62})`;
            ctx.lineWidth = weaponHeavy ? 14 : 9;
            ctx.lineCap = "round";
            ctx.stroke();
          }
        }
        ctx.translate(wxPos, wyPos + bobY);
        ctx.rotate(wRot);
        ctx.scale(comicScaleX, comicScaleY);
        ctx.shadowColor = weaponHeavy ? "#ffd466" : "rgba(0,0,0,0.34)";
        ctx.shadowBlur = weaponHeavy ? 26 : 12;
        ctx.shadowOffsetY = weaponHeavy ? 0 : 6;
        ctx.drawImage(wImg, -wSize * aspect * 0.5, -wSize * 0.5, wSize * aspect, wSize);
        ctx.restore();
      } else {
        lastLayoutBoxes.weapon = null;
      }

      // 誇張漫畫撞擊集中線＋暖金閃光（每一下敲擊都有超爽街機打擊爆發感）
      if (impactFlashTimer > 0) {
        impactFlashTimer = Math.max(0, impactFlashTimer - dt);
        const k = Math.min(1, impactFlashTimer / 0.14);
        ctx.save();
        ctx.globalAlpha = k * (weaponHeavy ? 0.65 : 0.42);
        const cx = vw * 0.5;
        const cy = altarY - vSize * 0.25;
        const maxR = Math.hypot(vw, vh) * 0.65;
        ctx.strokeStyle = weaponHeavy ? "#ffe066" : "#fff8e1";
        ctx.lineWidth = weaponHeavy ? 3.5 : 2.2;
        for (let i = 0; i < 20; i++) {
          const ang = (Math.PI * 2 * i) / 20 + (weaponHeavy ? 0.12 : 0);
          ctx.beginPath();
          ctx.moveTo(cx + Math.cos(ang) * (maxR * 0.56), cy + Math.sin(ang) * (maxR * 0.56));
          ctx.lineTo(cx + Math.cos(ang) * maxR, cy + Math.sin(ang) * maxR);
          ctx.stroke();
        }
        ctx.restore();
      }

      // 爆笑漫畫撞擊擬聲字：發光圓點 LED 矩陣招牌（移至腳邊／供桌前緣並嚴格限於畫面內，絕不遮擋跳起後的臉部！）
      if (weaponStampTimer > 0 && weaponStampText) {
        weaponStampTimer = Math.max(0, weaponStampTimer - dt);
        const p = Math.min(1, weaponStampTimer / 0.25);
        const popScale = 0.90 + Math.sin(Math.min(1, (0.55 - weaponStampTimer) * 5) * Math.PI * 0.5) * 0.18;
        const stampLed = getLedTextSprite(weaponStampText, {
          pitch: weaponHeavy ? 2.15 : 1.85,
          color: selectedWeapon.color || "#ffe047",
          glow: "rgba(255, 224, 71, 0.52)",
          dimDot: false,
          pad: 3
        });
        if (stampLed) {
          const sw = stampLed.width + 14;
          const sh = stampLed.height + 10;
          const dockTop = (document.querySelector(".bottom-dock")?.getBoundingClientRect().top || (vh - 125));
          // 放在人物腳底下方、供桌前緣偏左（避開右下角連擊牌與人物跳起變形後的臉部），並完整鎖在畫面內
          const stampX = Math.max(sw * 0.5 + 14, Math.min(vw - sw * 0.5 - 14, altarX - 24));
          const stampY = Math.min(dockTop - sh * 0.5 - 12, feetBaseY + 24) - (1 - p) * 8;
          ctx.save();
          ctx.globalAlpha = p;
          ctx.translate(stampX, stampY);
          ctx.rotate(-0.06);
          ctx.scale(popScale, popScale);
          ctx.fillStyle = "rgba(24, 10, 18, 0.92)";
          ctx.strokeStyle = selectedWeapon.color || "#ffe047";
          ctx.lineWidth = 2.4;
          ctx.beginPath();
          ctx.roundRect(-sw * 0.5, -sh * 0.5, sw, sh, 10);
          ctx.fill();
          ctx.stroke();
          ctx.drawImage(stampLed.canvas, -stampLed.width * 0.5, -stampLed.height * 0.5, stampLed.width, stampLed.height);
          ctx.restore();
        }
      }

      // 右下方連擊印記：發光圓點 LED 矩陣招牌（置於底欄上方右側，永不與頂部神明／角色泡泡重疊）
      if (comboBadgeTimer > 0 && slapCombo >= 2) {
        comboBadgeTimer = Math.max(0, comboBadgeTimer - dt);
        const dockTop = (document.querySelector(".bottom-dock")?.getBoundingClientRect().top || (vh - 125));
        const pop = 1 + Math.min(0.14, villainSquash * 0.14);
        const comboLed = getLedTextSprite(`連擊 ×${slapCombo}`, {
          pitch: 1.75,
          color: "#ffe46b",
          glow: "rgba(255, 198, 56, 0.50)",
          dimDot: true,
          pad: 3
        });
        ctx.save();
        ctx.globalAlpha = Math.min(1, comboBadgeTimer / 0.35);
        ctx.translate(vw - 12, dockTop - 26);
        ctx.scale(pop, pop);
        if (comboLed) {
          const cw = comboLed.width + 14;
          const ch = comboLed.height + 10;
          ctx.fillStyle = "rgba(28, 10, 16, 0.94)";
          ctx.strokeStyle = "#ffd966";
          ctx.lineWidth = 2.2;
          ctx.beginPath();
          ctx.roundRect(-cw, -ch * 0.5, cw, ch, 9);
          ctx.fill();
          ctx.stroke();
          ctx.drawImage(comboLed.canvas, -cw + 7, -comboLed.height * 0.5, comboLed.width, comboLed.height);
        }
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
          setCharMood("happy", 2.5);
          addMerit(10);
          playBellSound(784);
          spawnBurst(blocksX, propBaseY - 24, "#ffd466", 24, 220);
          spawnShockwave(blocksX, propBaseY - 12, "#ffd466", 110, 4);
          spawnFestiveShower("oracle", 2.0);
          if (autoTheater) {
            oracleStep = "ready";
            theaterTimer = 3.8;
            spawnFloatText(vw * 0.5, activeCharTopY - 22, `【${drawnFortune.grade}】${targetName}：${drawnFortune.title}！`, "#2b1a10", 21);
            showDeityBanner(`🎋 ${drawnFortune.grade}・${drawnFortune.title}：${drawnFortune.body}`);
          } else {
            oracleStep = "done";
            showResult(
              drawnFortune.grade,
              `【${targetName}】${drawnFortune.title}`,
              drawnFortune.body,
              `為 ${targetName} 聖筊應許 ・ 心安 +10`
            );
          }
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

    // 尾牙抽獎級超歡樂不斷落下可愛小圖示＋雙側定時慶典彩砲迸發！
    ambientDropTimer -= dt;
    if (ambientDropTimer <= 0) {
      ambientDropTimer = 0.14 + Math.random() * 0.14;
      spawnAmbientDrop(mode);
      if (Math.random() < 0.45) spawnAmbientDrop(mode);
    }
    partyCannonTimer -= dt;
    if (partyCannonTimer <= 0) {
      partyCannonTimer = 2.4 + Math.random() * 1.1;
      spawnFestiveShower(mode, 0.85);
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

    // 偵測是否需要錯時避讓：考慮「頭頂武器（紅電鍋）」與「跳起後角色頭頂」，確保角色泡泡絕不遮武器、且不與頂部神明泡泡碰撞！
    const topHudBottom = (document.querySelector(".top-hud")?.getBoundingClientRect().bottom || 58) + 14;
    const overheadWeapon = (mode === "slap" && lastLayoutBoxes.weapon && lastLayoutBoxes.weapon.isOverhead)
      ? lastLayoutBoxes.weapon
      : null;
    const bubbleAnchorBottom = overheadWeapon
      ? Math.min(activeCharTopY - 18, overheadWeapon.top - 12)
      : (activeCharTopY - 18);

    let suppressDeityForOverlap = false;
    const activeFloat = floatTexts.length > 0 ? floatTexts[floatTexts.length - 1] : null;
    if (deityBannerTimer > 0 && deityBannerText && activeFloat) {
      // 估計神明泡泡高度（約 104px）＋ 角色泡泡含名牌與尾巴高度（約 106px）＋ 安全間距 28px
      const neededStackH = 104 + 28 + 106;
      const availH = (bubbleAnchorBottom + 6) - (topHudBottom + 10);
      if (availH < neededStackH) suppressDeityForOverlap = true;
    }

    // 讀取左側 HTML 道具欄（sidePropRail）實際外框，避免角色長台詞泡泡與名牌被道具欄蓋住
    const railRect = sidePropRail ? sidePropRail.getBoundingClientRect() : null;
    lastLayoutBoxes.bubble = null;

    for (let i = floatTexts.length - 1; i >= 0; i--) {
      const ft = floatTexts[i];
      ft.life -= dt;
      if (ft.life <= 0) { floatTexts.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.min(1, ft.life / 0.3);
      const isWideScr = vw > vh;
      const tailH = 16;
      const minSafeTop = (deityBannerTimer > 0 && !suppressDeityForOverlap)
        ? (topHudBottom + 138)
        : (topHudBottom + 20);
      const targetBottomY = bubbleAnchorBottom;
      // 判斷角色泡泡預計垂直範圍是否與左側道具欄重疊；若有重疊，按道具欄實際右緣＋雲弧外凸安全間距重算左界與可用寬度
      const estTop = Math.max(minSafeTop, targetBottomY - 115);
      const estBot = targetBottomY;
      const overlapsRail = !!(railRect && railRect.width > 0 && estBot >= railRect.top - 10 && (estTop - 18) <= railRect.bottom + 10);
      const safeLeft = overlapsRail ? Math.ceil(railRect.right) + 12 : 14;
      const safeRight = vw - 14;
      const availW = Math.max(168, safeRight - safeLeft);
      const ledPitch = isWideScr ? 2.25 : (availW < 310 ? 1.72 : 1.92);
      const maxBubbleW = Math.min(availW, isWideScr ? 540 : 352);
      const maxCharsPerLine = Math.max(7, Math.floor((maxBubbleW - 38) / (12 * ledPitch)));

      // 平衡折行：先按扣除道具欄後的實際可用寬度折行，優先於標點後斷行並確保每行完整不截字
      const chars = Array.from(ft.text || "");
      const lines = [];
      if (chars.length <= maxCharsPerLine) {
        lines.push(ft.text);
      } else {
        let bestIdx = Math.ceil(chars.length / 2);
        let bestScore = Infinity;
        for (let idx = 3; idx <= chars.length - 3; idx++) {
          if (idx > maxCharsPerLine || (chars.length - idx) > maxCharsPerLine) continue;
          const prevCh = chars[idx - 1];
          const punctBonus = /[！，。？：、]/.test(prevCh) ? -5 : 0;
          const score = Math.abs(idx - (chars.length - idx)) + punctBonus;
          if (score < bestScore) {
            bestScore = score;
            bestIdx = idx;
          }
        }
        if (bestScore < Infinity) {
          lines.push(chars.slice(0, bestIdx).join("").trim());
          lines.push(chars.slice(bestIdx).join("").trim());
        } else {
          let pos = 0;
          while (pos < chars.length) {
            let end = Math.min(chars.length, pos + maxCharsPerLine);
            if (end < chars.length) {
              for (let k = end; k > pos + Math.floor(maxCharsPerLine * 0.55); k--) {
                if (/[！，。？：、]/.test(chars[k - 1])) { end = k; break; }
              }
            }
            lines.push(chars.slice(pos, end).join("").trim());
            pos = end;
          }
        }
      }

      const lineSprites = lines.map(ln => getLedTextSprite(ln, {
        pitch: ledPitch,
        color: "#ffe97a",
        glow: "rgba(255, 204, 68, 0.45)",
        dimDot: true,
        pad: 2
      })).filter(Boolean);

      const lineGap = 4;
      const contentW = lineSprites.length ? Math.max(...lineSprites.map(s => s.width)) : 140;
      const contentH = lineSprites.reduce((sum, s) => sum + s.height, 0) + Math.max(0, lineSprites.length - 1) * lineGap;
      const bw = Math.min(maxBubbleW, Math.max(156, contentW + 34));
      const bh = Math.max(46, contentH + 24);
      const targetAnchorX = activeCharCenterX;
      const by = Math.max(minSafeTop, targetBottomY - bh - tailH);
      const bx = Math.max(safeLeft, Math.min(safeRight - bw, targetAnchorX - bw * 0.5));
      const tailX = Math.max(bx + 26, Math.min(bx + bw - 26, targetAnchorX));
      const bounce = Math.sin(t * 5.2) * 2.2;
      lastLayoutBoxes.bubble = {
        left: Math.round(bx),
        right: Math.round(bx + bw),
        top: Math.round(by - 17),
        bottom: Math.round(by + bh + tailH)
      };

      // 繪製活潑「漫畫雲朵造型說話泡泡」（非制式方框！波浪雲朵輪廓＋彎曲對話尾巴＋說話角色表情名牌）
      ctx.save();
      ctx.translate(0, bounce);
      ctx.beginPath();
      const topBumps = Math.max(4, Math.round(bw / 46));
      const sideBumps = Math.max(2, Math.round(bh / 32));
      // 上緣波浪雲弧
      ctx.moveTo(bx + 14, by + 4);
      for (let b = 0; b < topBumps; b++) {
        const x1 = bx + 14 + ((bw - 28) * (b + 0.5)) / topBumps;
        const x2 = bx + 14 + ((bw - 28) * (b + 1)) / topBumps;
        ctx.quadraticCurveTo(x1, by - 9, x2, by + 4);
      }
      // 右緣波浪雲弧
      for (let b = 0; b < sideBumps; b++) {
        const y1 = by + 4 + ((bh - 8) * (b + 0.5)) / sideBumps;
        const y2 = by + 4 + ((bh - 8) * (b + 1)) / sideBumps;
        ctx.quadraticCurveTo(bx + bw + 9, y1, bx + bw - 14, y2);
      }
      // 下緣波浪雲弧（中間留出彎曲漫畫對話尾巴）
      ctx.quadraticCurveTo(bx + bw - 26, by + bh + 8, tailX + 13, by + bh - 2);
      ctx.quadraticCurveTo(tailX + 7, by + bh + tailH * 0.72, tailX - 2, by + bh + tailH);
      ctx.quadraticCurveTo(tailX - 4, by + bh + tailH * 0.42, tailX - 12, by + bh - 2);
      ctx.quadraticCurveTo(bx + 26, by + bh + 8, bx + 14, by + bh - 4);
      // 左緣波浪雲弧
      for (let b = sideBumps - 1; b >= 0; b--) {
        const y1 = by + 4 + ((bh - 8) * (b + 0.5)) / sideBumps;
        const y2 = by + 4 + ((bh - 8) * b) / sideBumps;
        ctx.quadraticCurveTo(bx - 9, y1, bx + 14, y2);
      }
      ctx.closePath();

      // 深色演唱會 LED 燈板底＋金邊雙重漫畫外框
      ctx.shadowColor = "rgba(0,0,0,0.42)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#1a0e18";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "#ffd966";
      ctx.lineWidth = 4.5;
      ctx.stroke();
      ctx.strokeStyle = "#2b1208";
      ctx.lineWidth = 1.8;
      ctx.stroke();

      // 左上角說話者表情名牌（圓點 LED 燈珠角色名＋表情，一眼看出是誰在講話！）
      const speakerEmoji = mode === "slap" ? (weaponAnim > 0.15 ? "😵" : "😆") : (mode === "bless" ? "🙏" : "🎋");
      const speakerPlain = mode === "slap"
        ? ((selectedScenario && selectedScenario.label) || "3畝")
        : (mode === "bless" ? "心安祈福" : "心安廟公");
      const nameLed = getLedTextSprite(speakerPlain, {
        pitch: 1.4,
        color: "#fff8c8",
        glow: "rgba(255, 224, 110, 0.45)",
        dimDot: false,
        pad: 1
      });
      const tagW = Math.min(156, (nameLed ? nameLed.width : 48) + 34);
      const tagH = 24;
      const tagX = bx + 16;
      const tagY = by - 17;
      ctx.fillStyle = mode === "slap" ? "#4e100c" : "#4a2c08";
      ctx.strokeStyle = "#ffe28a";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 12);
      ctx.fill();
      ctx.stroke();
      ctx.font = "13px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(speakerEmoji, tagX + 14, tagY + tagH * 0.5 + 0.5);
      if (nameLed) {
        ctx.drawImage(nameLed.canvas, tagX + 25, tagY + (tagH - nameLed.height) * 0.5, nameLed.width, nameLed.height);
      }

      // 泡泡內繪製發光「圓點 LED 矩陣字」劇情文字
      let curY = by + (bh - contentH) * 0.5;
      for (const sp of lineSprites) {
        const drawW = Math.min(sp.width, bw - 26);
        const drawH = sp.height * (drawW / sp.width);
        ctx.drawImage(sp.canvas, bx + (bw - drawW) * 0.5, curY, drawW, drawH);
        curY += drawH + lineGap;
      }
      ctx.restore();
      ctx.restore();
    }

    // 神鬼幽默突發劇情：最上方「活潑不規則漫畫雲朵說話泡泡」（若與跳起角色泡泡空間衝突則自動錯時暫避，永不重疊！）
    if (deityBannerTimer > 0 && deityBannerText && !suppressDeityForOverlap) {
      deityBannerTimer = Math.max(0, deityBannerTimer - dt);
      const hudB = (document.querySelector(".top-hud")?.getBoundingClientRect().bottom || 58) + 14;
      const isWideScr = vw > vh;
      const ledPitch = isWideScr ? 2.05 : 1.78;
      const maxBubbleW = Math.min(vw - 24, isWideScr ? 540 : 358);

      // 拆出神明說話者前綴（例如「文昌帝君：「...」」→ 名牌「文昌帝君」＋多行台詞）
      let deitySpeaker = "眾神廣播";
      let bodyText = String(deityBannerText || "").trim();
      const colonIdx = bodyText.indexOf("：");
      if (colonIdx > 0 && colonIdx <= 10) {
        deitySpeaker = bodyText.slice(0, colonIdx).replace(/^[^\u4e00-\u9fffA-Za-z0-9]+/, "").trim() || "眾神廣播";
        bodyText = bodyText.slice(colonIdx + 1).trim();
      }
      bodyText = bodyText.replace(/^[「『"]+|[」』"]+$/g, "").trim() || deityBannerText;

      const maxCharsPerLine = Math.max(9, Math.floor((maxBubbleW - 44) / (12 * ledPitch)));
      const chars = Array.from(bodyText);
      const dLines = [];
      if (chars.length <= maxCharsPerLine) {
        dLines.push(bodyText);
      } else {
        let pos = 0;
        while (pos < chars.length && dLines.length < 3) {
          let end = Math.min(chars.length, pos + maxCharsPerLine);
          if (end < chars.length) {
            // 優先於標點後折行，讓每行自然易讀
            for (let k = end; k > pos + Math.floor(maxCharsPerLine * 0.55); k--) {
              if (/[！，。？：、]/.test(chars[k - 1])) { end = k; break; }
            }
          }
          dLines.push(chars.slice(pos, end).join("").trim());
          pos = end;
        }
      }

      const dSprites = dLines.map(ln => getLedTextSprite(ln, {
        pitch: ledPitch,
        color: "#ffe875",
        glow: "rgba(255, 204, 68, 0.45)",
        dimDot: true,
        pad: 2
      })).filter(Boolean);

      const lineGap = 4;
      const contentW = dSprites.length ? Math.max(...dSprites.map(s => s.width)) : 160;
      const contentH = dSprites.reduce((sum, s) => sum + s.height, 0) + Math.max(0, dSprites.length - 1) * lineGap;
      const bw = Math.min(maxBubbleW, Math.max(196, contentW + 40));
      const bh = Math.max(46, contentH + 26);
      const bx = vw * 0.5 - bw * 0.5;
      // 嚴格留在頂部牌匾下方、且不壓到人物臉部
      const maxTopY = Math.max(hudB, activeCharTopY - bh - 26);
      const by = Math.min(hudB + 10, maxTopY);
      const bob = Math.sin(t * 4.2) * 1.8;

      ctx.save();
      ctx.globalAlpha = Math.min(1, deityBannerTimer / 0.35);
      ctx.translate(0, bob);

      // 不規則活潑漫畫說話雲朵輪廓＋指向廟頂的彎曲說話尾巴
      const tailX = bx + bw * 0.54;
      const topN = Math.max(4, Math.round(bw / 52));
      const sideN = Math.max(2, Math.round(bh / 30));
      ctx.beginPath();
      ctx.moveTo(bx + 14, by + 4);
      for (let i = 0; i < topN; i++) {
        const x1 = bx + 14 + ((bw - 28) * (i + 0.5)) / topN;
        const x2 = bx + 14 + ((bw - 28) * (i + 1)) / topN;
        const bulge = i % 2 === 0 ? -10 : -7;
        if (i === Math.floor(topN * 0.5)) {
          // 頂部指向廟宇飛簷的漫畫對話小尾巴（看得出是上方神明在喊話！）
          ctx.lineTo(tailX - 8, by + 1);
          ctx.quadraticCurveTo(tailX - 2, by - 14, tailX + 7, by - 16);
          ctx.quadraticCurveTo(tailX + 4, by - 4, tailX + 10, by + 2);
          ctx.quadraticCurveTo(x2 - 8, by - 6, x2, by + 4);
        } else {
          ctx.quadraticCurveTo(x1, by + bulge, x2, by + 4);
        }
      }
      for (let i = 0; i < sideN; i++) {
        const y1 = by + 4 + ((bh - 8) * (i + 0.5)) / sideN;
        const y2 = by + 4 + ((bh - 8) * (i + 1)) / sideN;
        ctx.quadraticCurveTo(bx + bw + (i % 2 === 0 ? 10 : 7), y1, bx + bw - 14, y2);
      }
      for (let i = topN - 1; i >= 0; i--) {
        const x1 = bx + 14 + ((bw - 28) * (i + 0.5)) / topN;
        const x2 = bx + 14 + ((bw - 28) * i) / topN;
        ctx.quadraticCurveTo(x1, by + bh + (i % 2 === 0 ? 9 : 6), x2, by + bh - 4);
      }
      for (let i = sideN - 1; i >= 0; i--) {
        const y1 = by + 4 + ((bh - 8) * (i + 0.5)) / sideN;
        const y2 = by + 4 + ((bh - 8) * i) / sideN;
        ctx.quadraticCurveTo(bx - (i % 2 === 0 ? 10 : 7), y1, bx + 14, y2);
      }
      ctx.closePath();

      ctx.shadowColor = "rgba(0,0,0,0.44)";
      ctx.shadowBlur = 10;
      ctx.shadowOffsetY = 4;
      ctx.fillStyle = "#1d0c14";
      ctx.fill();
      ctx.shadowBlur = 0;
      ctx.shadowOffsetY = 0;
      ctx.strokeStyle = "#ffd966";
      ctx.lineWidth = 4;
      ctx.stroke();
      ctx.strokeStyle = "#7a1b10";
      ctx.lineWidth = 1.6;
      ctx.stroke();

      // 左上角神明圓點 LED 名牌（🏮 文昌帝君／門神偷瞄／財神爺等）
      const deityNameLed = getLedTextSprite(deitySpeaker, {
        pitch: 1.35,
        color: "#fff7c2",
        glow: "rgba(255, 218, 96, 0.45)",
        dimDot: false,
        pad: 1
      });
      const tagW = Math.min(168, (deityNameLed ? deityNameLed.width : 64) + 34);
      const tagH = 23;
      const tagX = bx + 16;
      const tagY = by - 15;
      ctx.fillStyle = "#7d1910";
      ctx.strokeStyle = "#ffe38e";
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(tagX, tagY, tagW, tagH, 11);
      ctx.fill();
      ctx.stroke();
      ctx.font = "12px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("🏮", tagX + 14, tagY + tagH * 0.5 + 0.5);
      if (deityNameLed) {
        ctx.drawImage(deityNameLed.canvas, tagX + 25, tagY + (tagH - deityNameLed.height) * 0.5, deityNameLed.width, deityNameLed.height);
      }

      // 繪製多行清晰不擠壓的圓點 LED 燈珠劇情台詞
      let curY = by + (bh - contentH) * 0.5 + 1;
      for (const sp of dSprites) {
        const dw = Math.min(sp.width, bw - 26);
        const dh = sp.height * (dw / sp.width);
        ctx.drawImage(sp.canvas, bx + (bw - dw) * 0.5, curY, dw, dh);
        curY += dh + lineGap;
      }
      ctx.restore();
    }

    ctx.restore();
    requestAnimationFrame(frame);
  }

  // 單一整合測試與診斷介面（涵蓋狀態、實際音訊波形輸出、武器與泡泡邊界、LED 字形與互動）
  window.__xinanDebug = {
    getVersion: () => "v_08:15:00",
    setMood: (m) => { forceMoodForTest = m; },
    setWeapon: (id) => {
      const found = weapons.find(w => w.id === id);
      if (found) { selectedWeapon = found; renderControls(); }
    },
    getState: () => ({
      mode,
      autoTheater,
      bgmRunning,
      soundOn,
      audioUnlocked,
      ctxState: audioCtx ? audioCtx.state : "none",
      weapon: selectedWeapon.id,
      scenario: selectedScenario.id,
      mood: forceMoodForTest || charMood,
      merit,
      slapCombo,
      slapCharge
    }),
    getAudioStatus: () => ({
      soundOn,
      audioUnlocked,
      ctxState: audioCtx ? audioCtx.state : "none",
      bgmRunning,
      bgmStep,
      autoTheater,
      soundBtnIcon: btnSound ? btnSound.textContent : "",
      unlockPillVisible: !!(soundUnlockPill && !soundUnlockPill.classList.contains("hidden")),
      lastAudioError,
      ...measureAudioOutput()
    }),
    getLayoutBoxes: () => ({ ...lastLayoutBoxes }),
    isLedFontLoaded: () => !!(document.fonts && document.fonts.check("12px 'FusionPixel12'")),
    testLedGlyphs: (text) => {
      const chars = Array.from(String(text || ""));
      return chars.map(ch => {
        const bm = sampleLedBitmap(ch);
        let lit = 0;
        for (let i = 0; i < bm.bits.length; i++) lit += bm.bits[i];
        return { char: ch, cols: bm.cols, rows: bm.rows, lit };
      });
    },
    triggerSlap: () => {
      if (typeof performSlap === "function") performSlap(false);
    },
    triggerHeavySlap: () => {
      slapCharge = 10;
      if (typeof performSlap === "function") performSlap(true);
    },
    showTestBanner: (txt) => showDeityBanner(txt || "文昌帝君：「簡報第 18 版終於過關，拜託別再改字體！」", 8)
  };
  refreshAllLedDomLabels();
  syncSoundUI();
  requestAnimationFrame(frame);
})();




