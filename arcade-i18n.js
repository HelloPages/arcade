/* Shared Arcade Localization Core (TW / EN / KO) — Idiomatic, non-literal, extensible for all current & future games */
(() => {
  const STORAGE_KEY = "arcade_lang_v1";
  const VALID = ["tw", "en", "ko"];
  const HTML_LANG = { tw: "zh-Hant", en: "en", ko: "ko" };

  function normalizeLang(v) {
    const s = String(v || "").trim().toLowerCase();
    if (s === "zh" || s === "zh-tw" || s === "zh-hant" || s === "tw") return "tw";
    if (s === "en" || s === "en-us" || s === "en-gb") return "en";
    if (s === "ko" || s === "ko-kr" || s === "kr") return "ko";
    return null;
  }

  function detectInitialLang() {
    try {
      const p = new URLSearchParams(location.search).get("lang");
      const fromUrl = normalizeLang(p);
      if (fromUrl) {
        try { localStorage.setItem(STORAGE_KEY, fromUrl); } catch (_) {}
        return fromUrl;
      }
      const saved = normalizeLang(localStorage.getItem(STORAGE_KEY));
      if (saved) return saved;
    } catch (_) {}
    return "tw";
  }

  let currentLang = detectInitialLang();
  const listeners = new Set();

  // Idiomatic shared phrase bank for existing & future games (ordered longest-first when replacing)
  const SHARED_PHRASES = [
    ["霜軌突圍", { en: "Frostline Brawlers", ko: "설원 파이터" }],
    ["雪線硬漢", { en: "Frostline Brawlers", ko: "설원 파이터" }],
    ["鹽原裂日", { en: "Sunburn Runners", ko: "작열의 소금사막" }],
    ["烈日鹽原", { en: "Sunburn Runners", ko: "작열의 소금사막" }],
    ["雷霆空域：蒼穹覺醒", { en: "Thunderwing Aces", ko: "창공의 뇌격기" }],
    ["雷霆空域", { en: "Thunderwing Aces", ko: "창공의 뇌격기" }],
    ["蒼穹雷翼", { en: "Thunderwing Aces", ko: "창공의 뇌격기" }],
    ["心安宮・三儀殿", { en: "Lucky Zen Shrine", ko: "마음안심궁" }],
    ["心安宮", { en: "Lucky Zen Shrine", ko: "마음안심궁" }],
    ["赤焰忍傳：疾風手裏劍", { en: "Crimson Shadow", ko: "붉은 밤의 검객" }],
    ["赤焰忍傳", { en: "Crimson Shadow", ko: "붉은 밤의 검객" }],
    ["夜櫻影刃", { en: "Crimson Shadow", ko: "붉은 밤의 검객" }],
    ["兵蜂：晴空鈴鐺幻想曲", { en: "Skybell Flyers", ko: "하늘방울 비행대" }],
    ["兵蜂・鈴鐺幻想", { en: "Skybell Flyers", ko: "하늘방울 비행대" }],
    ["晴空鈴翼", { en: "Skybell Flyers", ko: "하늘방울 비행대" }],
    ["彩虹泡泡龍：浮空島物語", { en: "Prism Pop Islands", ko: "무지개 구름팡" }],
    ["彩虹泡泡龍", { en: "Prism Pop Islands", ko: "무지개 구름팡" }],
    ["七彩浮雲泡", { en: "Prism Pop Islands", ko: "무지개 구름팡" }],
    ["太空彈珠台：星際軍校生", { en: "Orbit Pinball Club", ko: "은하 핀볼 클럽" }],
    ["太空彈珠台", { en: "Orbit Pinball Club", ko: "은하 핀볼 클럽" }],
    ["星際彈珠王", { en: "Orbit Pinball Club", ko: "은하 핀볼 클럽" }],
    ["決戰亞也子・空中巨艦", { en: "Stormcloud Dreadnought", ko: "뇌운의 거대 전함" }],
    ["雲海巨艦戰", { en: "Stormcloud Dreadnought", ko: "뇌운의 거대 전함" }],
    ["拉包爾海空決戰", { en: "Coral Sea Squadron", ko: "푸른 바다 함대전" }],
    ["碧海艦隊戰", { en: "Coral Sea Squadron", ko: "푸른 바다 함대전" }],
    ["立即出擊", { en: "LAUNCH!", ko: "출격!" }],
    ["單鍵開戰", { en: "PLAY NOW", ko: "바로 시작" }],
    ["開始遊戲", { en: "PLAY", ko: "게임 시작" }],
    ["重新開始", { en: "RESTART", ko: "다시 시작" }],
    ["再玩一次", { en: "PLAY AGAIN", ko: "다시 도전" }],
    ["再來一局", { en: "ONE MORE!", ko: "한 판 더!" }],
    ["繼續遊戲", { en: "RESUME", ko: "계속하기" }],
    ["退出全螢幕", { en: "Exit Fullscreen", ko: "전체화면 종료" }],
    ["全螢幕", { en: "Fullscreen", ko: "전체화면" }],
    ["最高分", { en: "BEST", ko: "최고 점수" }],
    ["目前分數", { en: "SCORE", ko: "점수" }],
    ["分數", { en: "SCORE", ko: "점수" }],
    ["連擊", { en: "COMBO", ko: "콤보" }],
    ["波次", { en: "WAVE", ko: "웨이브" }],
    ["關卡", { en: "STAGE", ko: "스테이지" }],
    ["血量", { en: "HP", ko: "체력" }],
    ["護盾", { en: "SHIELD", ko: "실드" }],
    ["能量", { en: "ENERGY", ko: "에너지" }],
    ["必殺技", { en: "SPECIAL", ko: "필살기" }],
    ["核彈", { en: "BOMB", ko: "폭탄" }],
    ["衝刺", { en: "DASH", ko: "대시" }],
    ["翻滾", { en: "ROLL", ko: "구르기" }],
    ["跳躍", { en: "JUMP", ko: "점프" }],
    ["攻擊", { en: "ATK", ko: "공격" }],
    ["暫停", { en: "PAUSE", ko: "일시정지" }],
    ["音效開", { en: "SFX ON", ko: "소리 켜짐" }],
    ["音效關", { en: "SFX OFF", ko: "소리 꺼짐" }],
    ["靜音", { en: "MUTE", ko: "음소거" }],
    ["音效", { en: "SFX", ko: "효과음" }],
    ["勝利", { en: "VICTORY!", ko: "승리!" }],
    ["過關", { en: "CLEAR!", ko: "클리어!" }],
    ["任務完成", { en: "MISSION CLEAR!", ko: "미션 클리어!" }],
    ["遊戲結束", { en: "GAME OVER", ko: "게임 오버" }],
    ["挑戰失敗", { en: "DEFEAT", ko: "도전 실패" }],
    ["關閉", { en: "Close", ko: "닫기" }],
    ["說明", { en: "Guide", ko: "가이드" }],
    ["設定", { en: "Options", ko: "설정" }],
    ["武器", { en: "WEAPON", ko: "무기" }],
    ["等級", { en: "LV", ko: "레벨" }],
    ["速度", { en: "SPD", ko: "속도" }],
    ["火力", { en: "PWR", ko: "화력" }],
    ["生命", { en: "LIFE", ko: "라이프" }],
    ["首領", { en: "BOSS", ko: "보스" }],
    ["自動", { en: "AUTO", ko: "자동" }]
  ];

  let autoDomEnabled = false;
  let customPhrases = [];

  function translateTextString(orig, lang) {
    if (!orig || lang === "tw") return orig;
    let out = orig;
    const all = customPhrases.length ? [...customPhrases, ...SHARED_PHRASES] : SHARED_PHRASES;
    for (let i = 0; i < all.length; i++) {
      const [twKey, map] = all[i];
      if (out.includes(twKey) && map && map[lang]) {
        out = out.split(twKey).join(map[lang]);
      }
    }
    return out;
  }

  function walkAndTranslate(root, lang) {
    if (!root) return;
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const p = node.parentElement;
        if (!p) return NodeFilter.FILTER_REJECT;
        const tag = p.tagName;
        if (tag === "SCRIPT" || tag === "STYLE" || tag === "NOSCRIPT") return NodeFilter.FILTER_REJECT;
        if (p.closest && p.closest("[data-i18n-skip]")) return NodeFilter.FILTER_REJECT;
        if (!node.nodeValue || !node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let n;
    while ((n = walker.nextNode())) {
      if (n.__arcadeOrigText === undefined) {
        n.__arcadeOrigText = n.nodeValue;
      }
      const next = translateTextString(n.__arcadeOrigText, lang);
      if (n.nodeValue !== next) n.nodeValue = next;
    }
  }

  function applyDocumentLang() {
    document.documentElement.lang = HTML_LANG[currentLang] || "zh-Hant";
    document.documentElement.dataset.arcadeLang = currentLang;
    if (document.title) {
      if (document.__arcadeOrigTitle === undefined) document.__arcadeOrigTitle = document.title;
      document.title = translateTextString(document.__arcadeOrigTitle, currentLang);
    }
    if (autoDomEnabled && document.body) {
      walkAndTranslate(document.body, currentLang);
    }
  }

  function setLang(next, opts = {}) {
    const norm = normalizeLang(next);
    if (!norm) return currentLang;
    const changed = norm !== currentLang;
    currentLang = norm;
    try { localStorage.setItem(STORAGE_KEY, currentLang); } catch (_) {}
    applyDocumentLang();
    if (changed || opts.force) {
      listeners.forEach(fn => {
        try { fn(currentLang); } catch (_) {}
      });
    }
    if (opts.broadcastIframe) {
      try {
        opts.broadcastIframe.contentWindow?.postMessage({ type: "ARCADE_SET_LANG", lang: currentLang }, "*");
      } catch (_) {}
    }
    return currentLang;
  }

  window.addEventListener("message", (e) => {
    if (e.data && e.data.type === "ARCADE_SET_LANG") {
      setLang(e.data.lang);
    }
  });

  window.addEventListener("storage", (e) => {
    if (e.key === STORAGE_KEY && e.newValue) {
      setLang(e.newValue);
    }
  });

  const api = {
    VALID,
    getLang: () => currentLang,
    setLang,
    pick: (obj, fallback = "") => {
      if (!obj || typeof obj !== "object") return fallback;
      return obj[currentLang] ?? obj.tw ?? obj.en ?? fallback;
    },
    onChange: (fn, invokeNow = false) => {
      listeners.add(fn);
      if (invokeNow) {
        try { fn(currentLang); } catch (_) {}
      }
      return () => listeners.delete(fn);
    },
    enableAutoDom: (extraPairs = []) => {
      autoDomEnabled = true;
      if (Array.isArray(extraPairs) && extraPairs.length) {
        customPhrases = extraPairs;
      }
      if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", applyDocumentLang, { once: true });
      } else {
        applyDocumentLang();
      }
    },
    refreshAutoDom: () => {
      if (autoDomEnabled && document.body) walkAndTranslate(document.body, currentLang);
    }
  };

  window.ArcadeI18n = api;

  // Automatically enable lossless phrase localization on standalone game pages (not index portal which manages its own rich i18n)
  if (!document.documentElement.hasAttribute("data-arcade-portal")) {
    api.enableAutoDom();
  } else {
    applyDocumentLang();
  }
})();
