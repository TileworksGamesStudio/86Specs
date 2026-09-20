/**
 * SEQUENCE — COCKTAIL LOUNGE UNIVERSAL PUZZLE ENGINE
 * Integrated with the Cocktail Lounge Universal Design Transformation Bible.
 * Features 12 botanical and mixology garnish vector assets, bottom-to-top flight,
 * authoritative daily release, and tactile brass & crystal interface.
 */

(function () {
  "use strict";

  // ==========================================================================
  // 1. CONSTANTS & CONFIGURATION
  // ==========================================================================
  const STORAGE_KEY = "cocktail_tileworks_sequence_state_v2";
  const HOME_URL = "https://tileworksgamesstudio.github.io/86/";
  const MAX_ATTEMPTS = 4;
  const SLOTS_COUNT = 5;
  const CANONICAL_TIMEZONE = "Europe/London";

  // 12 Ultra-Premium Vector Garnish Icons (Cocktail Lounge Signature Family)
  const GARNISH_SVGS = [
    // 1: Orange Twist
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M8 38C10 24 24 10 38 12C44 13 42 22 34 24C22 27 18 36 28 40C34 42 40 38 42 34" stroke="#FFA733" stroke-width="4" stroke-linecap="round"/>
      <path d="M10 36C12 25 24 13 36 14C41 15 39 21 33 23" stroke="#FFF1BE" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    // 2: Lemon Twist
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 40C11 25 22 10 36 10C42 10 42 18 35 22C24 28 22 38 32 40C38 41 42 36 43 32" stroke="#FFD84D" stroke-width="3.2" stroke-linecap="round"/>
      <path d="M14 38C13 26 23 12 35 12" stroke="#FFFBE6" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`,
    // 3: Lime Wheel
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="#7CB342" stroke-width="3" fill="rgba(46, 125, 50, 0.2)"/>
      <circle cx="24" cy="24" r="16" stroke="#AED581" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="3" fill="#DCEDC8"/>
      <line x1="24" y1="8" x2="24" y2="21" stroke="#AED581" stroke-width="1.2"/>
      <line x1="24" y1="27" x2="24" y2="40" stroke="#AED581" stroke-width="1.2"/>
      <line x1="8" y1="24" x2="21" y2="24" stroke="#AED581" stroke-width="1.2"/>
      <line x1="27" y1="24" x2="40" y2="24" stroke="#AED581" stroke-width="1.2"/>
      <line x1="12.7" y1="12.7" x2="21.9" y2="21.9" stroke="#AED581" stroke-width="1.2"/>
      <line x1="26.1" y1="26.1" x2="35.3" y2="35.3" stroke="#AED581" stroke-width="1.2"/>
      <line x1="35.3" y1="12.7" x2="26.1" y2="21.9" stroke="#AED581" stroke-width="1.2"/>
      <line x1="21.9" y1="26.1" x2="12.7" y2="35.3" stroke="#AED581" stroke-width="1.2"/>
    </svg>`,
    // 4: Grapefruit Wheel
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="#FF7043" stroke-width="3" fill="rgba(239, 83, 80, 0.25)"/>
      <circle cx="24" cy="24" r="16" stroke="#FFAB91" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="3" fill="#FFE0B2"/>
      <line x1="24" y1="8" x2="24" y2="40" stroke="#FFAB91" stroke-width="1.2"/>
      <line x1="8" y1="24" x2="40" y2="24" stroke="#FFAB91" stroke-width="1.2"/>
      <line x1="12.7" y1="12.7" x2="35.3" y2="35.3" stroke="#FFAB91" stroke-width="1.2"/>
      <line x1="35.3" y1="12.7" x2="12.7" y2="35.3" stroke="#FFAB91" stroke-width="1.2"/>
    </svg>`,
    // 5: Blood Orange Wheel
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="#E64A19" stroke-width="3.2" fill="rgba(183, 28, 28, 0.35)"/>
      <circle cx="24" cy="24" r="16" stroke="#FF8A65" stroke-width="1.5"/>
      <circle cx="24" cy="24" r="3" fill="#FFCCBC"/>
      <line x1="24" y1="8" x2="24" y2="40" stroke="#FF8A65" stroke-width="1.2"/>
      <line x1="8" y1="24" x2="40" y2="24" stroke="#FF8A65" stroke-width="1.2"/>
      <line x1="12.7" y1="12.7" x2="35.3" y2="35.3" stroke="#FF8A65" stroke-width="1.2"/>
      <line x1="35.3" y1="12.7" x2="12.7" y2="35.3" stroke="#FF8A65" stroke-width="1.2"/>
    </svg>`,
    // 6: Dehydrated Citrus Wheel
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="24" cy="24" r="20" stroke="#8D6E63" stroke-width="3" fill="rgba(109, 76, 65, 0.25)"/>
      <circle cx="24" cy="24" r="16" stroke="#BCAAA4" stroke-dasharray="3 2" stroke-width="1.2"/>
      <circle cx="24" cy="24" r="3" fill="#D7CCC8"/>
      <line x1="24" y1="8" x2="24" y2="40" stroke="#A1887F" stroke-width="1.2"/>
      <line x1="8" y1="24" x2="40" y2="24" stroke="#A1887F" stroke-width="1.2"/>
      <line x1="12.7" y1="12.7" x2="35.3" y2="35.3" stroke="#A1887F" stroke-width="1.2"/>
      <line x1="35.3" y1="12.7" x2="12.7" y2="35.3" stroke="#A1887F" stroke-width="1.2"/>
    </svg>`,
    // 7: Cocktail Cherry
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M26 26C34 16 38 8 36 6C34 4 28 10 24 22" stroke="#8D6E63" stroke-width="2" stroke-linecap="round"/>
      <circle cx="22" cy="30" r="12" fill="#B71C1C" stroke="#D32F2F" stroke-width="2"/>
      <path d="M16 26C18 24 22 24 24 25" stroke="#FF8A80" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    // 8: Double Cherry
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18 28C22 16 26 8 28 6C30 8 34 18 36 30" stroke="#795548" stroke-width="2" stroke-linecap="round"/>
      <circle cx="16" cy="32" r="9" fill="#B71C1C" stroke="#D32F2F" stroke-width="1.8"/>
      <circle cx="34" cy="34" r="8" fill="#880E4F" stroke="#C2185B" stroke-width="1.8"/>
      <path d="M13 29C15 27 18 27 19 28" stroke="#FF8A80" stroke-width="1.5" stroke-linecap="round"/>
    </svg>`,
    // 9: Mint Sprig
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M24 42C24 30 24 16 24 6" stroke="#4CAF50" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 26C16 24 10 16 12 10C18 8 22 18 24 26Z" fill="#66BB6A" stroke="#2E7D32" stroke-width="1.2"/>
      <path d="M24 22C32 20 38 12 36 6C30 4 26 14 24 22Z" fill="#81C784" stroke="#388E3C" stroke-width="1.2"/>
      <path d="M24 34C18 32 14 26 16 22C20 20 23 28 24 34Z" fill="#4CAF50" stroke="#1B5E20" stroke-width="1.2"/>
    </svg>`,
    // 10: Rosemary Sprig
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 42C22 30 26 18 28 6" stroke="#5D4037" stroke-width="1.8" stroke-linecap="round"/>
      <path d="M22 30L12 24" stroke="#558B2F" stroke-width="2" stroke-linecap="round"/>
      <path d="M24 26L34 20" stroke="#689F38" stroke-width="2" stroke-linecap="round"/>
      <path d="M25 20L15 14" stroke="#558B2F" stroke-width="2" stroke-linecap="round"/>
      <path d="M27 16L37 10" stroke="#689F38" stroke-width="2" stroke-linecap="round"/>
      <path d="M28 10L24 4" stroke="#7CB342" stroke-width="2" stroke-linecap="round"/>
    </svg>`,
    // 11: Green Olive
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="24" cy="24" rx="14" ry="18" fill="#689F38" stroke="#8BC34A" stroke-width="2" transform="rotate(-15 24 24)"/>
      <circle cx="24" cy="17" r="4.5" fill="#D32F2F" stroke="#E57373" stroke-width="1"/>
      <ellipse cx="19" cy="26" rx="2" ry="5" fill="#DCEDC8" opacity="0.6" transform="rotate(-15 19 26)"/>
    </svg>`,
    // 12: Cucumber Ribbon
    `<svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M10 38C12 24 34 32 36 18C38 8 26 6 18 10C10 14 20 28 34 36" stroke="#81C784" stroke-width="3" stroke-linecap="round"/>
      <path d="M10 38C12 24 34 32 36 18" stroke="#2E7D32" stroke-width="1.2" stroke-linecap="round"/>
    </svg>`
  ];

  // ==========================================================================
  // 2. AUTHORITATIVE DAILY RELEASE ENGINE
  // ==========================================================================
  const DailyReleaseEngine = {
    synchronized: false,
    authoritativeOffsetMs: 0,

    async synchronize() {
      const endpoints = [
        async () => {
          const res = await fetch("https://worldtimeapi.org/api/timezone/Etc/UTC", { cache: "no-store" });
          if (!res.ok) throw new Error("WTA");
          const json = await res.json();
          return new Date(json.utc_datetime).getTime();
        },
        async () => {
          const res = await fetch("https://timeapi.io/api/time/current/zone?timeZone=UTC", { cache: "no-store" });
          if (!res.ok) throw new Error("TA");
          const json = await res.json();
          return new Date(json.dateTime).getTime();
        },
        async () => {
          const res = await fetch("puzzles.csv", { method: "HEAD", cache: "no-store" });
          const dateHeader = res.headers.get("Date");
          if (!dateHeader) throw new Error("Header Date");
          return new Date(dateHeader).getTime();
        }
      ];

      for (const fn of endpoints) {
        try {
          const remoteTimeMs = await Promise.race([
            fn(),
            new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 3200))
          ]);
          if (!isNaN(remoteTimeMs) && remoteTimeMs > 0) {
            this.authoritativeOffsetMs = remoteTimeMs - performance.now();
            this.synchronized = true;
            return true;
          }
        } catch (e) {
          // Continue to fallback
        }
      }

      this.synchronized = false;
      return false;
    },

    getNow() {
      if (this.synchronized) {
        return new Date(performance.now() + this.authoritativeOffsetMs);
      }
      return new Date();
    },

    getCanonicalReleaseDate() {
      const now = this.getNow();
      try {
        const formatter = new Intl.DateTimeFormat("en-CA", {
          timeZone: CANONICAL_TIMEZONE,
          year: "numeric",
          month: "2-digit",
          day: "2-digit"
        });
        return formatter.format(now);
      } catch (e) {
        return now.toISOString().slice(0, 10);
      }
    }
  };

  // ==========================================================================
  // 3. APPLICATION STATE
  // ==========================================================================
  const AppState = {
    puzzles: [],
    todayPuzzle: null,
    activePuzzle: null,
    isArchiveMode: false,
    selectedSlot: 0,
    currentDraft: [null, null, null, null, null],
    lockedSlots: [false, false, false, false, false],
    attemptsUsed: 0,
    isCompleted: false,
    isWon: false,
    historyGrid: [],
    store: loadStorage()
  };

  // ==========================================================================
  // 4. DOM REFERENCES
  // ==========================================================================
  const DOM = {
    btnHeaderHome: document.getElementById("btn-header-home"),
    btnHeaderBack: document.getElementById("btn-header-back"),
    headerTitle: document.getElementById("header-title"),
    
    // Views
    viewMenu: document.getElementById("view-menu"),
    viewGame: document.getElementById("view-game"),
    viewVault: document.getElementById("view-vault"),
    viewSettings: document.getElementById("view-settings"),
    
    // Main Menu
    btnMenuPlay: document.getElementById("btn-menu-play"),
    btnPlayLabel: document.getElementById("btn-play-label"),
    menuPlaySub: document.getElementById("menu-play-sub"),
    menuTodayDate: document.getElementById("menu-today-date"),
    btnMenuVault: document.getElementById("btn-menu-vault"),
    menuVaultCount: document.getElementById("menu-vault-count"),
    btnMenuSettings: document.getElementById("btn-menu-settings"),
    btnMenuRules: document.getElementById("btn-menu-rules"),
    
    // Utilities
    btnUtilStats: document.getElementById("btn-util-stats"),
    btnUtilShare: document.getElementById("btn-util-share"),
    btnUtilPlus: document.getElementById("btn-util-plus"),
    
    // Game Board
    gameTitleBadge: document.getElementById("game-title-badge"),
    gameAttemptsBadge: document.getElementById("game-attempts-badge"),
    gameClue: document.getElementById("game-clue"),
    hintBox: document.getElementById("hint-box"),
    hintText: document.getElementById("hint-text"),
    slotsContainer: document.getElementById("slots-container"),
    slots: document.querySelectorAll(".slot-tile"),
    itemsPool: document.getElementById("items-pool"),
    btnClearPool: document.getElementById("btn-clear-pool"),
    btnSubmit: document.getElementById("btn-submit"),
    
    // Vault & Settings
    vaultList: document.getElementById("vault-list"),
    btnAnimOn: document.getElementById("btn-anim-on"),
    btnAnimOff: document.getElementById("btn-anim-off"),
    
    // Overlays & Panels
    panelRulesOverlay: document.getElementById("panel-rules-overlay"),
    sidePanelRules: document.getElementById("side-panel-rules"),
    backdropRules: document.getElementById("backdrop-rules"),
    btnCloseRules: document.getElementById("btn-close-rules"),
    btnRulesConfirm: document.getElementById("btn-rules-confirm"),
    
    // Modals
    modalStats: document.getElementById("modal-stats"),
    btnCloseStats: document.getElementById("btn-close-stats"),
    statPlayed: document.getElementById("stat-played"),
    statWinRate: document.getElementById("stat-win-rate"),
    statStreak: document.getElementById("stat-streak"),
    statMaxStreak: document.getElementById("stat-max-streak"),
    statsDistribution: document.getElementById("stats-distribution"),
    
    modalResult: document.getElementById("modal-result"),
    btnCloseResult: document.getElementById("btn-close-result"),
    resultTitle: document.getElementById("result-title"),
    resultSubtitle: document.getElementById("result-subtitle"),
    resultGrid: document.getElementById("result-grid"),
    resultSolutionList: document.getElementById("result-solution-list"),
    resultNotes: document.getElementById("result-notes"),
    btnShare: document.getElementById("btn-share"),
    btnResultVault: document.getElementById("btn-result-vault"),
    btnResultMenu: document.getElementById("btn-result-menu"),
    
    // Atmosphere
    toast: document.getElementById("toast"),
    bgFloatingIcons: document.getElementById("bg-floating-icons")
  };

  // ==========================================================================
  // 5. STORAGE SYSTEM
  // ==========================================================================
  function loadStorage() {
    const fallback = {
      version: 2,
      settings: { anim: true },
      stats: { played: 0, won: 0, currentStreak: 0, maxStreak: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0 } },
      history: {}
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      return {
        version: 2,
        settings: Object.assign({}, fallback.settings, parsed.settings || {}),
        stats: Object.assign({}, fallback.stats, parsed.stats || {}),
        history: parsed.history || {}
      };
    } catch (e) {
      return fallback;
    }
  }

  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.store));
    } catch (e) {
      // Graceful fallback
    }
  }

  // ==========================================================================
  // 6. CSV PARSER & UTILITIES
  // ==========================================================================
  function parseCSV(text) {
    const rows = [];
    let row = [];
    let val = "";
    let inQuotes = false;
    for (let i = 0; i < text.length; i++) {
      const c = text[i];
      const next = text[i + 1];
      if (c === '"' && inQuotes && next === '"') {
        val += '"';
        i++;
      } else if (c === '"') {
        inQuotes = !inQuotes;
      } else if (c === "," && !inQuotes) {
        row.push(val.trim());
        val = "";
      } else if ((c === "\n" || (c === "\r" && next === "\n")) && !inQuotes) {
        if (c === "\r") i++;
        row.push(val.trim());
        rows.push(row);
        row = [];
        val = "";
      } else {
        val += c;
      }
    }
    if (val !== "" || (row.length > 0 && text[text.length - 1] === ",")) {
      row.push(val.trim());
    }
    if (row.length > 0) rows.push(row);
    return rows;
  }

  function shuffle(arr) {
    const res = arr.slice();
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = res[i];
      res[i] = res[j];
      res[j] = tmp;
    }
    return res;
  }

  // ==========================================================================
  // 7. TOAST NOTIFICATIONS
  // ==========================================================================
  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    DOM.toast.textContent = msg;
    DOM.toast.classList.remove("hidden");
    toastTimer = setTimeout(() => {
      DOM.toast.classList.add("hidden");
    }, 2400);
  }

  // ==========================================================================
  // 8. NAVIGATION ROUTING
  // ==========================================================================
  function showView(viewId) {
    DOM.viewMenu.classList.add("hidden");
    DOM.viewGame.classList.add("hidden");
    DOM.viewVault.classList.add("hidden");
    DOM.viewSettings.classList.add("hidden");

    if (viewId === "menu") {
      DOM.btnHeaderBack.classList.add("hidden");
      DOM.btnHeaderHome.classList.remove("hidden");
      DOM.headerTitle.textContent = "SEQUENCE";
      DOM.viewMenu.classList.remove("hidden");
      renderMenu();
    } else {
      DOM.btnHeaderHome.classList.add("hidden");
      DOM.btnHeaderBack.classList.remove("hidden");

      if (viewId === "game") {
        DOM.headerTitle.textContent = "SEQUENCE";
        DOM.viewGame.classList.remove("hidden");
      } else if (viewId === "vault") {
        DOM.headerTitle.textContent = "VAULT";
        DOM.viewVault.classList.remove("hidden");
        renderVault();
      } else if (viewId === "settings") {
        DOM.headerTitle.textContent = "SETTINGS";
        DOM.viewSettings.classList.remove("hidden");
        renderSettings();
      }
    }
    window.scrollTo(0, 0);
  }

  // ==========================================================================
  // 9. HOW TO PLAY: STRICT RIGHT-TO-LEFT ENTRANCE
  // ==========================================================================
  function openHowToPlay() {
    DOM.panelRulesOverlay.classList.remove("hidden");
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        DOM.panelRulesOverlay.classList.add("active");
        DOM.sidePanelRules.focus();
      });
    });
  }

  function closeHowToPlay() {
    DOM.panelRulesOverlay.classList.remove("active");
    setTimeout(() => {
      DOM.panelRulesOverlay.classList.add("hidden");
    }, 420);
  }

  // ==========================================================================
  // 10. ATMOSPHERIC GARNISH FLIGHT SYSTEM (6-9 VISIBLE, BOTTOM TO TOP)
  // ==========================================================================
  function initFloatingGarnishes() {
    DOM.bgFloatingIcons.innerHTML = "";
    // Target 8 concurrent rising garnishes for continuous lounge atmosphere
    const count = 8;
    const depths = ["depth-bg", "depth-mid", "depth-fg"];

    for (let i = 0; i < count; i++) {
      const el = document.createElement("div");
      const depth = depths[i % 3];
      el.className = `floating-garnish ${depth}`;
      el.innerHTML = GARNISH_SVGS[i % GARNISH_SVGS.length];

      const left = Math.floor(Math.random() * 88) + 6;
      // Staggered long unhurried flight times
      const duration = depth === "depth-bg" ? 24 + Math.random() * 8 : depth === "depth-mid" ? 18 + Math.random() * 6 : 14 + Math.random() * 4;
      const delay = -(Math.random() * duration);
      const drift = Math.floor(Math.random() * 44) - 22;
      const rot = Math.floor(Math.random() * 90) - 45;

      el.style.left = `${left}%`;
      el.style.animationDuration = `${duration}s`;
      el.style.animationDelay = `${delay}s`;
      el.style.setProperty("--drift", `${drift}px`);
      el.style.setProperty("--rot", `${rot}deg`);

      DOM.bgFloatingIcons.appendChild(el);
    }
    applyAnimationSetting();
  }

  function applyAnimationSetting() {
    const isEnabled = AppState.store.settings.anim;
    if (isEnabled) {
      document.body.classList.remove("anim-paused");
      DOM.btnAnimOn.classList.add("active");
      DOM.btnAnimOn.setAttribute("aria-pressed", "true");
      DOM.btnAnimOff.classList.remove("active");
      DOM.btnAnimOff.setAttribute("aria-pressed", "false");
    } else {
      document.body.classList.add("anim-paused");
      DOM.btnAnimOff.classList.add("active");
      DOM.btnAnimOff.setAttribute("aria-pressed", "true");
      DOM.btnAnimOn.classList.remove("active");
      DOM.btnAnimOn.setAttribute("aria-pressed", "false");
    }
  }

  function setAnimationSetting(on) {
    AppState.store.settings.anim = on;
    saveStorage();
    applyAnimationSetting();
  }

  // ==========================================================================
  // 11. INITIALIZATION & DATA LOADING
  // ==========================================================================
  async function init() {
    DOM.btnHeaderHome.setAttribute("href", HOME_URL);
    bindEvents();
    initFloatingGarnishes();

    await DailyReleaseEngine.synchronize();

    try {
      const res = await fetch("puzzles.csv");
      if (!res.ok) throw new Error("Network CSV missing");
      const text = await res.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("Malformed CSV");

      const header = rows[0];
      const rawList = [];
      for (let i = 1; i < rows.length; i++) {
        const r = rows[i];
        if (r.length < header.length) continue;
        const p = {};
        header.forEach((k, idx) => (p[k] = r[idx]));
        rawList.push(p);
      }

      AppState.puzzles = rawList.map((p) => {
        const slots = [];
        const pool = [];
        for (let s = 1; s <= SLOTS_COUNT; s++) {
          const name = p[`slot_${s}_name`] || `Stage ${s}`;
          const answer = p[`slot_${s}_answer`] || `Answer ${s}`;
          const decoy = p[`slot_${s}_decoy`] || `Decoy ${s}`;
          slots.push({ slotIndex: s - 1, name, answer });
          pool.push({ id: `${p.date}-c-${s}`, text: answer, slotIndex: s - 1 });
          pool.push({ id: `${p.date}-d-${s}`, text: decoy, slotIndex: null });
        }
        return {
          date: p.date,
          title: p.title || "Sequence Challenge",
          clue: p.clue || "Determine the authentic sequence.",
          hint: p.hint || "Carefully observe the chronological tier.",
          notes: p.notes || "",
          slots,
          pool
        };
      });

      AppState.puzzles.sort((a, b) => a.date.localeCompare(b.date));

      const canonicalToday = DailyReleaseEngine.getCanonicalReleaseDate();
      let available = AppState.puzzles.filter((p) => p.date <= canonicalToday);
      if (available.length === 0) available = [AppState.puzzles[0]];

      AppState.todayPuzzle = available[available.length - 1];
      showView("menu");
    } catch (err) {
      createFallbackPuzzle();
      showView("menu");
    }
  }

  function createFallbackPuzzle() {
    const today = DailyReleaseEngine.getCanonicalReleaseDate();
    const fallback = {
      date: today,
      title: "Botanical Distillation Process",
      clue: "Arrange the traditional stages of spirit infusion and finishing in order.",
      hint: "Maceration starts the process; barrel resting completes the maturation.",
      notes: "The artisanal distillation cycle progresses from botanical infusion through heart collection.",
      slots: [
        { slotIndex: 0, name: "Stage I", answer: "Maceration" },
        { slotIndex: 1, name: "Stage II", answer: "Vaporization" },
        { slotIndex: 2, name: "Stage III", answer: "Condensation" },
        { slotIndex: 3, name: "Stage IV", answer: "Heart Cut" },
        { slotIndex: 4, name: "Stage V", answer: "Cask Maturation" }
      ],
      pool: [
        { id: "fb-c-1", text: "Maceration", slotIndex: 0 },
        { id: "fb-d-1", text: "Carbonation", slotIndex: null },
        { id: "fb-c-2", text: "Vaporization", slotIndex: 1 },
        { id: "fb-d-2", text: "Centrifuging", slotIndex: null },
        { id: "fb-c-3", text: "Condensation", slotIndex: 2 },
        { id: "fb-d-3", text: "Freeze Drying", slotIndex: null },
        { id: "fb-c-4", text: "Heart Cut", slotIndex: 3 },
        { id: "fb-d-4", text: "Pasteurization", slotIndex: null },
        { id: "fb-c-5", text: "Cask Maturation", slotIndex: 4 },
        { id: "fb-d-5", text: "Cold Press", slotIndex: null }
      ]
    };
    AppState.puzzles = [fallback];
    AppState.todayPuzzle = fallback;
  }

  // ==========================================================================
  // 12. MENU RENDERING
  // ==========================================================================
  function renderMenu() {
    const today = AppState.todayPuzzle;
    if (!today) return;

    DOM.menuTodayDate.textContent = today.date;
    DOM.btnPlayLabel.textContent = "Play Sequence";

    const record = AppState.store.history[today.date];
    if (record && record.completed) {
      DOM.menuPlaySub.textContent = record.won ? `Solved (${record.attemptsUsed}/${MAX_ATTEMPTS})` : "Completed (Unsolved)";
    } else if (record && record.attemptsUsed > 0) {
      DOM.menuPlaySub.textContent = `Resume (${record.attemptsUsed}/${MAX_ATTEMPTS} attempts)`;
    } else {
      DOM.menuPlaySub.textContent = "Daily Challenge";
    }

    const past = AppState.puzzles.filter((p) => p.date < today.date);
    DOM.menuVaultCount.textContent = past.length;
  }

  // ==========================================================================
  // 13. GAMEPLAY ENGINE
  // ==========================================================================
  function startPuzzle(puzzle, isArchive = false) {
    AppState.activePuzzle = puzzle;
    AppState.isArchiveMode = isArchive;
    AppState.selectedSlot = 0;

    const record = AppState.store.history[puzzle.date];
    if (record) {
      AppState.isCompleted = !!record.completed;
      AppState.isWon = !!record.won;
      AppState.attemptsUsed = record.attemptsUsed || 0;
      AppState.lockedSlots = Array.isArray(record.lockedSlots) ? record.lockedSlots.slice() : [false, false, false, false, false];
      AppState.currentDraft = Array.isArray(record.draft) ? record.draft.slice() : [null, null, null, null, null];
      AppState.historyGrid = Array.isArray(record.historyGrid) ? record.historyGrid.slice() : [];
    } else {
      AppState.isCompleted = false;
      AppState.isWon = false;
      AppState.attemptsUsed = 0;
      AppState.lockedSlots = [false, false, false, false, false];
      AppState.currentDraft = [null, null, null, null, null];
      AppState.historyGrid = [];
    }

    DOM.gameTitleBadge.textContent = `${puzzle.title} (${puzzle.date})`;
    DOM.gameClue.textContent = puzzle.clue;

    if (!puzzle.shuffledPool) {
      puzzle.shuffledPool = shuffle(puzzle.pool);
    }

    const firstFree = AppState.lockedSlots.findIndex((l) => !l);
    AppState.selectedSlot = firstFree !== -1 ? firstFree : 0;

    renderGameStatus();
    renderSlots();
    renderPool();
    showView("game");
  }

  function renderGameStatus() {
    const remaining = MAX_ATTEMPTS - AppState.attemptsUsed;
    DOM.gameAttemptsBadge.textContent = `Attempts: ${remaining} / ${MAX_ATTEMPTS}`;

    const hintAvailable = AppState.attemptsUsed >= 2 || AppState.isCompleted;
    if (hintAvailable) {
      DOM.hintBox.classList.remove("hidden");
      DOM.hintText.textContent = AppState.activePuzzle.hint;
    } else {
      DOM.hintBox.classList.add("hidden");
    }

    if (AppState.isCompleted) {
      DOM.btnSubmit.textContent = "View Summary";
      DOM.btnClearPool.classList.add("hidden");
    } else {
      DOM.btnSubmit.textContent = "Submit Sequence";
      DOM.btnClearPool.classList.remove("hidden");
    }
  }

  function renderSlots() {
    DOM.slots.forEach((el, idx) => {
      const slotDef = AppState.activePuzzle.slots[idx];
      el.querySelector(".slot-label").textContent = slotDef.name;
      el.classList.remove("active", "locked");

      const valHolder = el.querySelector(".slot-value");
      valHolder.innerHTML = "";

      if (AppState.lockedSlots[idx]) {
        el.classList.add("locked");
        el.setAttribute("aria-label", `Slot ${idx + 1}: Locked correct, ${slotDef.answer}`);
        el.setAttribute("aria-pressed", "true");
        valHolder.textContent = slotDef.answer;
      } else if (AppState.currentDraft[idx]) {
        const item = AppState.currentDraft[idx];
        el.setAttribute("aria-label", `Slot ${idx + 1}: ${item.text}. Tap to remove.`);
        el.setAttribute("aria-pressed", idx === AppState.selectedSlot ? "true" : "false");
        valHolder.textContent = item.text;
      } else {
        el.setAttribute("aria-label", `Slot ${idx + 1}: Empty`);
        el.setAttribute("aria-pressed", idx === AppState.selectedSlot ? "true" : "false");
        valHolder.innerHTML = '<span class="placeholder">Select slot to fill</span>';
      }

      if (!AppState.isCompleted && !AppState.lockedSlots[idx] && idx === AppState.selectedSlot) {
        el.classList.add("active");
      }
    });
  }

  function renderPool() {
    DOM.itemsPool.innerHTML = "";
    const placedIds = new Set(AppState.currentDraft.filter(Boolean).map((t) => t.id));

    AppState.activePuzzle.shuffledPool.forEach((item) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "item-tile";
      btn.textContent = item.text;

      if (placedIds.has(item.id)) {
        btn.classList.add("used");
        btn.setAttribute("aria-disabled", "true");
        btn.tabIndex = -1;
      } else {
        btn.setAttribute("aria-label", `Place ${item.text}`);
        btn.addEventListener("click", () => handleTileClick(item));
      }
      DOM.itemsPool.appendChild(btn);
    });
  }

  function handleTileClick(item) {
    if (AppState.isCompleted) return;

    let target = AppState.selectedSlot;
    if (AppState.lockedSlots[target] || AppState.currentDraft[target]) {
      target = -1;
      for (let i = 0; i < SLOTS_COUNT; i++) {
        if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
          target = i;
          break;
        }
      }
    }
    if (target === -1) target = AppState.selectedSlot;
    if (AppState.lockedSlots[target]) return;

    AppState.currentDraft[target] = item;

    // Advance to next unfilled slot
    let next = -1;
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
        next = i;
        break;
      }
    }
    AppState.selectedSlot = next !== -1 ? next : target;

    renderSlots();
    renderPool();
  }

  function handleSlotClick(idx) {
    if (AppState.isCompleted || AppState.lockedSlots[idx]) return;

    if (AppState.currentDraft[idx]) {
      AppState.currentDraft[idx] = null;
      AppState.selectedSlot = idx;
    } else {
      AppState.selectedSlot = idx;
    }
    renderSlots();
    renderPool();
  }

  function clearDraft() {
    if (AppState.isCompleted) return;
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i]) AppState.currentDraft[i] = null;
    }
    const firstFree = AppState.lockedSlots.findIndex((l) => !l);
    AppState.selectedSlot = firstFree !== -1 ? firstFree : 0;
    renderSlots();
    renderPool();
  }

  function submitAttempt() {
    if (AppState.isCompleted) {
      openResultModal();
      return;
    }

    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
        showToast("Fill all 5 sequence slots before submitting.");
        return;
      }
    }

    AppState.attemptsUsed++;
    const rowResult = [];

    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (AppState.lockedSlots[i]) {
        rowResult.push("hit");
        continue;
      }
      const item = AppState.currentDraft[i];
      if (item && item.slotIndex === i) {
        AppState.lockedSlots[i] = true;
        rowResult.push("hit");
      } else {
        AppState.currentDraft[i] = null;
        rowResult.push("miss");
        const slotEl = DOM.slots[i];
        slotEl.classList.add("incorrect-flash");
        setTimeout(() => slotEl.classList.remove("incorrect-flash"), 450);
      }
    }

    AppState.historyGrid.push(rowResult);

    const isAllCorrect = AppState.lockedSlots.every(Boolean);
    if (isAllCorrect) {
      AppState.isCompleted = true;
      AppState.isWon = true;
      saveProgress();
      recordStats(true, AppState.attemptsUsed);
      renderGameStatus();
      renderSlots();
      renderPool();
      setTimeout(openResultModal, 450);
      return;
    }

    if (AppState.attemptsUsed >= MAX_ATTEMPTS) {
      AppState.isCompleted = true;
      AppState.isWon = false;
      AppState.lockedSlots = [true, true, true, true, true];
      saveProgress();
      recordStats(false, AppState.attemptsUsed);
      renderGameStatus();
      renderSlots();
      renderPool();
      setTimeout(openResultModal, 450);
      return;
    }

    const nextFree = AppState.lockedSlots.findIndex((l) => !l);
    AppState.selectedSlot = nextFree !== -1 ? nextFree : 0;
    saveProgress();
    renderGameStatus();
    renderSlots();
    renderPool();
  }

  function saveProgress() {
    AppState.store.history[AppState.activePuzzle.date] = {
      completed: AppState.isCompleted,
      won: AppState.isWon,
      attemptsUsed: AppState.attemptsUsed,
      lockedSlots: AppState.lockedSlots.slice(),
      draft: AppState.currentDraft.slice(),
      historyGrid: AppState.historyGrid.slice()
    };
    saveStorage();
  }

  function recordStats(won, attempts) {
    if (AppState.isArchiveMode) return;
    const s = AppState.store.stats;
    s.played++;
    if (won) {
      s.won++;
      s.currentStreak++;
      if (s.currentStreak > s.maxStreak) s.maxStreak = s.currentStreak;
      if (s.dist[attempts] !== undefined) s.dist[attempts]++;
    } else {
      s.currentStreak = 0;
    }
    saveStorage();
  }

  // ==========================================================================
  // 14. VAULT & SETTINGS RENDERING
  // ==========================================================================
  function renderVault() {
    DOM.vaultList.innerHTML = "";
    const canonicalToday = DailyReleaseEngine.getCanonicalReleaseDate();
    const past = AppState.puzzles.filter((p) => p.date < canonicalToday);

    if (past.length === 0) {
      DOM.vaultList.innerHTML = '<p class="status-caption">No prior challenges in the vault.</p>';
      return;
    }

    past.slice().reverse().forEach((puzzle) => {
      const record = AppState.store.history[puzzle.date];
      const item = document.createElement("div");
      item.className = "vault-item";
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");

      let status = "Not Started";
      let isSolved = false;
      if (record && record.completed) {
        status = record.won ? `Solved (${record.attemptsUsed}/${MAX_ATTEMPTS})` : "Unsolved";
        isSolved = record.won;
      }

      item.innerHTML = `
        <div>
          <div class="vault-item-title">${puzzle.title}</div>
          <div class="status-caption">${puzzle.date}</div>
        </div>
        <span class="badge ${isSolved ? "badge-accent" : ""}">${status}</span>
      `;

      const selectVaultPuzzle = () => startPuzzle(puzzle, true);
      item.addEventListener("click", selectVaultPuzzle);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          selectVaultPuzzle();
        }
      });

      DOM.vaultList.appendChild(item);
    });
  }

  function renderSettings() {
    applyAnimationSetting();
  }

  // ==========================================================================
  // 15. MODALS: STATS & RESULTS
  // ==========================================================================
  function openStatsModal() {
    const s = AppState.store.stats;
    DOM.statPlayed.textContent = s.played;
    DOM.statWinRate.textContent = `${s.played > 0 ? Math.round((s.won / s.played) * 100) : 0}%`;
    DOM.statStreak.textContent = s.currentStreak;
    DOM.statMaxStreak.textContent = s.maxStreak;

    DOM.statsDistribution.innerHTML = "";
    const maxVal = Math.max(1, ...Object.values(s.dist));
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const count = s.dist[i] || 0;
      const pct = Math.max(14, Math.round((count / maxVal) * 100));

      const row = document.createElement("div");
      row.className = "dist-row";
      row.innerHTML = `
        <span style="width:16px;font-weight:700;font-family:var(--font-serif);">${i}</span>
        <div class="dist-bar-bg">
          <div class="dist-bar-fill" style="width:${pct}%">${count}</div>
        </div>
      `;
      DOM.statsDistribution.appendChild(row);
    }
    DOM.modalStats.classList.remove("hidden");
  }

  function openResultModal() {
    const p = AppState.activePuzzle;
    DOM.resultTitle.textContent = AppState.isWon ? "Sequence Mastered" : "Sequence Complete";
    DOM.resultSubtitle.textContent = `${p.title} (${p.date})`;

    DOM.resultGrid.innerHTML = "";
    AppState.historyGrid.forEach((row) => {
      const rowEl = document.createElement("div");
      rowEl.className = "result-grid-row";
      row.forEach((cell) => {
        const cellEl = document.createElement("div");
        cellEl.className = `result-grid-cell ${cell}`;
        rowEl.appendChild(cellEl);
      });
      DOM.resultGrid.appendChild(rowEl);
    });

    DOM.resultSolutionList.innerHTML = "";
    p.slots.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${s.name}:</strong> ${s.answer}`;
      DOM.resultSolutionList.appendChild(li);
    });

    DOM.resultNotes.textContent = p.notes || "";
    DOM.modalResult.classList.remove("hidden");
  }

  // ==========================================================================
  // 16. SHARING SYSTEM
  // ==========================================================================
  function handleShareAction() {
    const url = window.location.href;
    const title = "Sequence Puzzle";
    const text = "Discover the correct sequence of five elements!";

    if (navigator.share) {
      navigator.share({ title, text, url }).catch(() => {});
    } else if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(url)
        .then(() => showToast("Lounge link copied."))
        .catch(() => showToast("Unable to copy link."));
    } else {
      showToast("Sharing not supported on this browser.");
    }
  }

  function handleResultShare() {
    const p = AppState.activePuzzle;
    const score = AppState.isWon ? `${AppState.attemptsUsed}/${MAX_ATTEMPTS}` : "X/4";
    let shareText = `Sequence ${p.date} — ${score}\n`;
    AppState.historyGrid.forEach((row) => {
      shareText += row.map((cell) => (cell === "hit" ? "🥃" : "⬛")).join("") + "\n";
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(shareText)
        .then(() => showToast("Score copied to clipboard!"))
        .catch(() => showToast("Unable to copy score."));
    } else {
      showToast("Clipboard unavailable.");
    }
  }

  // ==========================================================================
  // 17. EVENT BINDING
  // ==========================================================================
  function bindEvents() {
    DOM.btnHeaderBack.addEventListener("click", () => showView("menu"));

    // Menu Navigation
    DOM.btnMenuPlay.addEventListener("click", () => startPuzzle(AppState.todayPuzzle, false));
    DOM.btnMenuVault.addEventListener("click", () => showView("vault"));
    DOM.btnMenuSettings.addEventListener("click", () => showView("settings"));
    DOM.btnMenuRules.addEventListener("click", openHowToPlay);

    // Utilities
    DOM.btnUtilStats.addEventListener("click", openStatsModal);
    DOM.btnUtilShare.addEventListener("click", handleShareAction);
    DOM.btnUtilPlus.addEventListener("click", () => {
      showToast("Tileworks Nocturne collection.");
    });

    // Settings
    DOM.btnAnimOn.addEventListener("click", () => setAnimationSetting(true));
    DOM.btnAnimOff.addEventListener("click", () => setAnimationSetting(false));

    // Side Panel
    DOM.btnCloseRules.addEventListener("click", closeHowToPlay);
    DOM.btnRulesConfirm.addEventListener("click", closeHowToPlay);
    DOM.backdropRules.addEventListener("click", closeHowToPlay);

    // Gameplay Board
    DOM.slots.forEach((el) => {
      const idx = parseInt(el.dataset.slot, 10);
      el.addEventListener("click", () => handleSlotClick(idx));
      el.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSlotClick(idx);
        }
      });
    });

    DOM.btnClearPool.addEventListener("click", clearDraft);
    DOM.btnSubmit.addEventListener("click", submitAttempt);

    // Modals
    DOM.btnCloseStats.addEventListener("click", () => DOM.modalStats.classList.add("hidden"));
    DOM.btnCloseResult.addEventListener("click", () => DOM.modalResult.classList.add("hidden"));
    DOM.btnResultMenu.addEventListener("click", () => {
      DOM.modalResult.classList.add("hidden");
      showView("menu");
    });
    DOM.btnResultVault.addEventListener("click", () => {
      DOM.modalResult.classList.add("hidden");
      showView("vault");
    });
    DOM.btnShare.addEventListener("click", handleResultShare);

    [DOM.modalStats, DOM.modalResult].forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) backdrop.classList.add("hidden");
      });
    });

    // Pause / Resume Optimization
    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") {
        DailyReleaseEngine.synchronize();
      }
    });
  }

  // Boot on DOM Ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();