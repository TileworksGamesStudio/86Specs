(function () {
  "use strict";

  // Configuration Constants
  const STORAGE_KEY = "universal_sequence_puzzle_state_v1";
  const HOME_URL = "https://tileworksgamesstudio.github.io/86/"; // REPLACE_WITH_HOME_URL: Destination provided by project owner
  const MAX_ATTEMPTS = 4;
  const SLOTS_COUNT = 5;

  // Application State
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

  // DOM Elements Cache
  const DOM = {
    headerBackBtn: document.getElementById("header-back-btn"),
    headerTitle: document.getElementById("header-title"),
    btnStats: document.getElementById("btn-stats"),
    btnRules: document.getElementById("btn-rules"),
    viewMenu: document.getElementById("view-menu"),
    viewGame: document.getElementById("view-game"),
    viewVault: document.getElementById("view-vault"),
    menuTodayDate: document.getElementById("menu-today-date"),
    menuTodayTitle: document.getElementById("menu-today-title"),
    menuTodayStatus: document.getElementById("menu-today-status"),
    btnPlayToday: document.getElementById("btn-play-today"),
    menuArchiveCount: document.getElementById("menu-archive-count"),
    btnViewVault: document.getElementById("btn-view-vault"),
    btnNavHome: document.getElementById("btn-nav-home"),
    gameDateBadge: document.getElementById("game-date-badge"),
    gameAttemptsBadge: document.getElementById("game-attempts-badge"),
    hintStatusIndicator: document.getElementById("hint-status-indicator"),
    hintStatusText: document.getElementById("hint-status-text"),
    slots: document.querySelectorAll(".slot"),
    gameClue: document.getElementById("game-clue"),
    hintBox: document.getElementById("hint-box"),
    hintText: document.getElementById("hint-text"),
    itemsPool: document.getElementById("items-pool"),
    btnClear: document.getElementById("btn-clear"),
    btnSubmit: document.getElementById("btn-submit"),
    vaultList: document.getElementById("vault-list"),
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
    modalRules: document.getElementById("modal-rules"),
    btnCloseRules: document.getElementById("btn-close-rules"),
    btnRulesOk: document.getElementById("btn-rules-ok"),
    modalStats: document.getElementById("modal-stats"),
    btnCloseStats: document.getElementById("btn-close-stats"),
    statPlayed: document.getElementById("stat-played"),
    statWinRate: document.getElementById("stat-win-rate"),
    statStreak: document.getElementById("stat-streak"),
    statMaxStreak: document.getElementById("stat-max-streak"),
    statsDistribution: document.getElementById("stats-distribution"),
    toast: document.getElementById("toast"),
    garnishCanvas: document.getElementById("garnish-canvas")
  };

  /* ==========================================================================
     LIGHTWEIGHT WEB AUDIO SYNTHESIZER (Luxury Lounge Sound Palette)
     ========================================================================== */
  const SoundSystem = (function () {
    let ctx = null;
    let isMuted = false;

    function getContext() {
      if (!ctx && (window.AudioContext || window.webkitAudioContext)) {
        try {
          const AudioCtx = window.AudioContext || window.webkitAudioContext;
          ctx = new AudioCtx();
        } catch (e) {
          ctx = null;
        }
      }
      if (ctx && ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      return ctx;
    }

    function playTone(freq, duration, type, gainLevel, decay) {
      if (isMuted) return;
      try {
        const audio = getContext();
        if (!audio) return;
        const osc = audio.createOscillator();
        const gain = audio.createGain();
        osc.type = type || "sine";
        osc.frequency.setValueAtTime(freq, audio.currentTime);

        gain.gain.setValueAtTime(gainLevel || 0.04, audio.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, audio.currentTime + (decay || duration));

        osc.connect(gain);
        gain.connect(audio.destination);

        osc.start();
        osc.stop(audio.currentTime + (decay || duration));
      } catch (err) {
        // Fail silently to avoid breaking execution
      }
    }

    return {
      tap: function () {
        playTone(1840, 0.05, "sine", 0.02, 0.05);
      },
      place: function () {
        playTone(980, 0.08, "triangle", 0.03, 0.08);
      },
      hit: function () {
        playTone(1320, 0.12, "sine", 0.04, 0.15);
        setTimeout(() => playTone(1760, 0.18, "sine", 0.03, 0.22), 60);
      },
      miss: function () {
        playTone(280, 0.15, "triangle", 0.04, 0.18);
      },
      win: function () {
        playTone(880, 0.16, "sine", 0.04, 0.25);
        setTimeout(() => playTone(1174.66, 0.2, "sine", 0.04, 0.3), 110);
        setTimeout(() => playTone(1760, 0.35, "sine", 0.05, 0.45), 230);
      }
    };
  })();

  /* ==========================================================================
     ANIMATED FLOATING COCKTAIL GARNISH ENGINE (12 Distinct Icons)
     ========================================================================== */
  const GarnishEngine = (function () {
    let canvas, ctx;
    let width, height;
    let particles = [];
    let animId = null;
    const MAX_PARTICLES = 16;
    let isReducedMotion = false;

    // 12 Distinct Cocktail Garnish Renderers
    const garnishes = [
      // 1. Orange Twist
      function drawOrangeTwist(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0.3, Math.PI * 1.5);
        ctx.bezierCurveTo(6, -12, 16, 2, 4, 15);
        ctx.lineWidth = 2.4;
        ctx.stroke();
      },
      // 2. Lemon Twist
      function drawLemonTwist(ctx) {
        ctx.beginPath();
        ctx.moveTo(-12, -10);
        ctx.bezierCurveTo(2, -18, 14, -6, 2, 6);
        ctx.bezierCurveTo(-10, 14, 6, 18, 12, 10);
        ctx.lineWidth = 2.2;
        ctx.stroke();
      },
      // 3. Lime Wheel
      function drawLimeWheel(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.lineWidth = 1.8;
        ctx.stroke();
        for (let i = 0; i < 6; i++) {
          const ang = (i * Math.PI) / 3;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * 11, Math.sin(ang) * 11);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      },
      // 4. Lemon Wheel
      function drawLemonWheel(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 14, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 11, 0, Math.PI * 2);
        ctx.lineWidth = 0.8;
        ctx.stroke();
        for (let i = 0; i < 8; i++) {
          const ang = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(Math.cos(ang) * 10, Math.sin(ang) * 10);
          ctx.lineWidth = 0.9;
          ctx.stroke();
        }
      },
      // 5. Dehydrated Orange Wheel
      function drawDehydratedOrange(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 13, 0, Math.PI * 2);
        ctx.lineWidth = 2.5;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 5, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 7; i++) {
          const a = (i * Math.PI * 2) / 7;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 5, Math.sin(a) * 5);
          ctx.lineTo(Math.cos(a) * 11, Math.sin(a) * 11);
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      },
      // 6. Dehydrated Lemon Wheel
      function drawDehydratedLemon(ctx) {
        ctx.beginPath();
        ctx.arc(0, 0, 12, 0, Math.PI * 2);
        ctx.lineWidth = 1.8;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(0, 0, 3, 0, Math.PI * 2);
        ctx.fill();
        for (let i = 0; i < 8; i++) {
          const a = (i * Math.PI) / 4;
          ctx.beginPath();
          ctx.moveTo(Math.cos(a) * 3, Math.sin(a) * 3);
          ctx.lineTo(Math.cos(a) * 10, Math.sin(a) * 10);
          ctx.lineWidth = 0.8;
          ctx.stroke();
        }
      },
      // 7. Cocktail Cherry
      function drawCherry(ctx) {
        ctx.beginPath();
        ctx.arc(0, 4, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -3);
        ctx.bezierCurveTo(4, -10, 10, -14, 14, -16);
        ctx.lineWidth = 1.6;
        ctx.stroke();
      },
      // 8. Maraschino Cherry Pair
      function drawCherryPair(ctx) {
        ctx.beginPath();
        ctx.arc(-6, 6, 6, 0, Math.PI * 2);
        ctx.arc(6, 7, 5.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-6, 0);
        ctx.quadraticCurveTo(-4, -12, 2, -16);
        ctx.moveTo(6, 1);
        ctx.quadraticCurveTo(4, -12, 2, -16);
        ctx.lineWidth = 1.4;
        ctx.stroke();
      },
      // 9. Mint Sprig
      function drawMintSprig(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 14);
        ctx.lineTo(0, -12);
        ctx.lineWidth = 1.4;
        ctx.stroke();
        // Leaf pairs
        function drawLeaf(x, y, scaleX, scaleY) {
          ctx.beginPath();
          ctx.ellipse(x, y, 6 * scaleX, 3 * scaleY, Math.PI / 4, 0, Math.PI * 2);
          ctx.fill();
        }
        drawLeaf(-6, 2, 1, 0.8);
        drawLeaf(6, 0, 1, 0.8);
        drawLeaf(-5, -6, 0.8, 0.7);
        drawLeaf(5, -8, 0.8, 0.7);
      },
      // 10. Rosemary Sprig
      function drawRosemary(ctx) {
        ctx.beginPath();
        ctx.moveTo(0, 16);
        ctx.lineTo(0, -16);
        ctx.lineWidth = 1.5;
        ctx.stroke();
        for (let y = 10; y >= -12; y -= 5) {
          ctx.beginPath();
          ctx.moveTo(0, y);
          ctx.lineTo(-7, y - 6);
          ctx.moveTo(0, y - 2);
          ctx.lineTo(7, y - 8);
          ctx.lineWidth = 1.1;
          ctx.stroke();
        }
      },
      // 11. Green Olive with Cocktail Pick
      function drawOlive(ctx) {
        ctx.beginPath();
        ctx.ellipse(0, 2, 7, 10, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.beginPath();
        ctx.ellipse(0, 0, 2.5, 4, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(0, -14);
        ctx.lineTo(0, 16);
        ctx.lineWidth = 1.2;
        ctx.stroke();
      },
      // 12. Cucumber Ribbon
      function drawCucumberRibbon(ctx) {
        ctx.beginPath();
        ctx.moveTo(-14, -10);
        ctx.bezierCurveTo(-6, -16, 6, -6, 14, -10);
        ctx.lineTo(12, 10);
        ctx.bezierCurveTo(4, 6, -8, 16, -16, 10);
        ctx.closePath();
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }
    ];

    function createParticle(initialY) {
      const depthTier = Math.random();
      let scale, speed, alpha, blur;

      if (depthTier < 0.45) {
        // Distant
        scale = 0.55 + Math.random() * 0.25;
        speed = 0.18 + Math.random() * 0.22;
        alpha = 0.08 + Math.random() * 0.08;
        blur = 2;
      } else if (depthTier < 0.82) {
        // Middle
        scale = 0.8 + Math.random() * 0.3;
        speed = 0.35 + Math.random() * 0.35;
        alpha = 0.14 + Math.random() * 0.12;
        blur = 0.5;
      } else {
        // Near
        scale = 1.1 + Math.random() * 0.35;
        speed = 0.55 + Math.random() * 0.4;
        alpha = 0.22 + Math.random() * 0.16;
        blur = 0;
      }

      return {
        iconIndex: Math.floor(Math.random() * garnishes.length),
        x: Math.random() * width,
        y: initialY !== undefined ? initialY : height + 30 + Math.random() * 40,
        scale,
        speed,
        baseAlpha: alpha,
        rotation: Math.random() * Math.PI * 2,
        rotSpeed: (Math.random() - 0.5) * 0.008,
        swayOffset: Math.random() * Math.PI * 2,
        swaySpeed: 0.01 + Math.random() * 0.015,
        swayAmp: 0.6 + Math.random() * 0.9,
        blur
      };
    }

    function resize() {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }

    function init() {
      canvas = DOM.garnishCanvas;
      if (!canvas) return;
      ctx = canvas.getContext("2d");
      resize();
      window.addEventListener("resize", resize, { passive: true });

      const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
      isReducedMotion = mql.matches;
      mql.addEventListener("change", (e) => {
        isReducedMotion = e.matches;
      });

      const count = isReducedMotion ? 6 : MAX_PARTICLES;
      particles = [];
      for (let i = 0; i < count; i++) {
        particles.push(createParticle(Math.random() * height));
      }

      loop();
    }

    function loop() {
      if (!ctx) return;
      ctx.clearRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        if (!isReducedMotion) {
          p.y -= p.speed;
          p.rotation += p.rotSpeed;
          p.swayOffset += p.swaySpeed;
          p.x += Math.sin(p.swayOffset) * p.swayAmp * 0.4;

          if (p.y < -40) {
            particles[idx] = createParticle();
          }
        }

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.scale(p.scale, p.scale);

        ctx.strokeStyle = `rgba(220, 130, 50, ${p.baseAlpha})`;
        ctx.fillStyle = `rgba(180, 80, 25, ${p.baseAlpha * 0.65})`;
        ctx.shadowColor = "rgba(225, 120, 30, 0.45)";
        ctx.shadowBlur = p.blur ? p.blur * 4 : 4;

        garnishes[p.iconIndex](ctx);
        ctx.restore();
      });

      animId = requestAnimationFrame(loop);
    }

    return { init };
  })();

  // Safe Storage Management (Section 28-32)
  function loadStorage() {
    const fallback = {
      version: 1,
      stats: { played: 0, won: 0, currentStreak: 0, maxStreak: 0, dist: { 1: 0, 2: 0, 3: 0, 4: 0 } },
      history: {}
    };
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return fallback;
      const parsed = JSON.parse(data);
      if (!parsed || typeof parsed !== "object") return fallback;
      return {
        version: parsed.version || 1,
        stats: Object.assign({}, fallback.stats, parsed.stats || {}),
        history: parsed.history || {}
      };
    } catch (err) {
      return fallback;
    }
  }

  function saveStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(AppState.store));
    } catch (e) {
      // Storage quota or disabled fallback
    }
  }

  // Robust CSV Parser
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

  function formatLocalYYYYMMDD(date) {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, "0");
    const d = String(date.getDate()).padStart(2, "0");
    return `${y}-${m}-${d}`;
  }

  let toastTimer = null;
  function showToast(msg) {
    if (toastTimer) clearTimeout(toastTimer);
    DOM.toast.textContent = msg;
    DOM.toast.classList.remove("hidden");
    toastTimer = setTimeout(() => {
      DOM.toast.classList.add("hidden");
    }, 2400);
  }

  // Navigation Controller (Section 2, 7)
  function showView(viewId) {
    DOM.viewMenu.classList.add("hidden");
    DOM.viewGame.classList.add("hidden");
    DOM.viewVault.classList.add("hidden");

    if (viewId === "menu") {
      DOM.headerBackBtn.classList.add("hidden");
      DOM.headerTitle.textContent = "SEQUENCE";
      DOM.viewMenu.classList.remove("hidden");
      renderMenu();
    } else if (viewId === "game") {
      DOM.headerBackBtn.classList.remove("hidden");
      DOM.headerTitle.textContent = AppState.activePuzzle.title;
      DOM.viewGame.classList.remove("hidden");
    } else if (viewId === "vault") {
      DOM.headerBackBtn.classList.remove("hidden");
      DOM.headerTitle.textContent = "VAULT";
      DOM.viewVault.classList.remove("hidden");
      renderVault();
    }
    window.scrollTo(0, 0);
  }

  // Application Initialization
  async function init() {
    DOM.btnNavHome.setAttribute("href", HOME_URL);
    GarnishEngine.init();

    try {
      const res = await fetch("puzzles.csv");
      if (!res.ok) throw new Error("Unable to load puzzles source.");
      const text = await res.text();
      const rows = parseCSV(text);
      if (rows.length < 2) throw new Error("Dataset is empty or malformed.");

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
          const name = p[`slot_${s}_name`] || `Step ${s}`;
          const answer = p[`slot_${s}_answer`] || `Answer ${s}`;
          const decoy = p[`slot_${s}_decoy`] || `Decoy ${s}`;
          slots.push({ slotIndex: s - 1, name, answer });
          pool.push({ id: `${p.date}-c-${s}`, text: answer, slotIndex: s - 1 });
          pool.push({ id: `${p.date}-d-${s}`, text: decoy, slotIndex: null });
        }
        return {
          date: p.date,
          title: p.title || "Sequence Challenge",
          clue: p.clue || "Determine the proper sequence.",
          hint: p.hint || "Review the step names and logical progression.",
          notes: p.notes || "",
          slots,
          pool
        };
      });

      AppState.puzzles.sort((a, b) => a.date.localeCompare(b.date));

      const todayStr = formatLocalYYYYMMDD(new Date());
      let available = AppState.puzzles.filter((p) => p.date <= todayStr);
      if (available.length === 0) available = [AppState.puzzles[0]];

      AppState.todayPuzzle = available[available.length - 1];

      bindEvents();
      showView("menu");
    } catch (err) {
      // Graceful fallback for offline / server preview
      createFallbackPuzzle();
      bindEvents();
      showView("menu");
    }
  }

  function createFallbackPuzzle() {
    const today = formatLocalYYYYMMDD(new Date());
    const fallback = {
      date: today,
      title: "Classic Cocktail Build",
      clue: "Order the standard stages of an Old Fashioned preparation.",
      hint: "The sugar and bitters must be married before spirits and ice enter the glass.",
      notes: "Traditional method for an Old Fashioned in high-end cocktail hospitality.",
      slots: [
        { slotIndex: 0, name: "1st Step", answer: "Sugar Cube & Bitters" },
        { slotIndex: 1, name: "2nd Step", answer: "Muddle & Dissolve" },
        { slotIndex: 2, name: "3rd Step", answer: "Rye or Bourbon" },
        { slotIndex: 3, name: "4th Step", answer: "Large Clear Ice" },
        { slotIndex: 4, name: "5th Step", answer: "Express Orange Twist" }
      ],
      pool: [
        { id: "fb-c-1", text: "Sugar Cube & Bitters", slotIndex: 0 },
        { id: "fb-d-1", text: "Shake Vigorously", slotIndex: null },
        { id: "fb-c-2", text: "Muddle & Dissolve", slotIndex: 1 },
        { id: "fb-d-2", text: "Crushed Ice Fill", slotIndex: null },
        { id: "fb-c-3", text: "Rye or Bourbon", slotIndex: 2 },
        { id: "fb-d-3", text: "Top with Club Soda", slotIndex: null },
        { id: "fb-c-4", text: "Large Clear Ice", slotIndex: 3 },
        { id: "fb-d-4", text: "Add Simple Syrup", slotIndex: null },
        { id: "fb-c-5", text: "Express Orange Twist", slotIndex: 4 },
        { id: "fb-d-5", text: "Rim with Salt", slotIndex: null }
      ]
    };
    AppState.puzzles = [fallback];
    AppState.todayPuzzle = fallback;
  }

  // Menu View Controller (Section 3, 4, 5)
  function renderMenu() {
    const today = AppState.todayPuzzle;
    if (!today) return;

    DOM.menuTodayDate.textContent = today.date;
    DOM.menuTodayTitle.textContent = today.title;

    const record = AppState.store.history[today.date];
    if (record && record.completed) {
      DOM.menuTodayStatus.textContent = record.won
        ? `Status: Solved (${record.attemptsUsed}/${MAX_ATTEMPTS} attempts)`
        : "Status: Completed (Unsolved)";
      DOM.btnPlayToday.textContent = "Review Result";
    } else if (record && record.attemptsUsed > 0) {
      DOM.menuTodayStatus.textContent = `Status: In Progress (${record.attemptsUsed}/${MAX_ATTEMPTS} attempts)`;
      DOM.btnPlayToday.textContent = "Resume Daily Puzzle";
    } else {
      DOM.menuTodayStatus.textContent = "Status: Ready to play";
      DOM.btnPlayToday.textContent = "Play Daily Puzzle";
    }

    const pastPuzzles = AppState.puzzles.filter((p) => p.date < today.date);
    DOM.menuArchiveCount.textContent = `${pastPuzzles.length} puzzle${pastPuzzles.length === 1 ? "" : "s"}`;
  }

  // Gameplay Setup
  function startPuzzle(puzzle, isArchive = false) {
    SoundSystem.tap();
    AppState.activePuzzle = puzzle;
    AppState.isArchiveMode = isArchive;
    AppState.selectedSlot = 0;

    const record = AppState.store.history[puzzle.date];
    if (record) {
      AppState.isCompleted = !!record.completed;
      AppState.isWon = !!record.won;
      AppState.attemptsUsed = record.attemptsUsed || 0;
      AppState.lockedSlots = Array.isArray(record.lockedSlots)
        ? record.lockedSlots.slice()
        : [false, false, false, false, false];
      AppState.currentDraft = Array.isArray(record.draft)
        ? record.draft.slice()
        : [null, null, null, null, null];
      AppState.historyGrid = Array.isArray(record.historyGrid)
        ? record.historyGrid.slice()
        : [];
    } else {
      AppState.isCompleted = false;
      AppState.isWon = false;
      AppState.attemptsUsed = 0;
      AppState.lockedSlots = [false, false, false, false, false];
      AppState.currentDraft = [null, null, null, null, null];
      AppState.historyGrid = [];
    }

    DOM.gameDateBadge.textContent = puzzle.date;
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

  // Render Status & Feedback
  function renderGameStatus() {
    const left = MAX_ATTEMPTS - AppState.attemptsUsed;
    DOM.gameAttemptsBadge.textContent = `Attempts: ${left} / ${MAX_ATTEMPTS}`;

    const hintAvailable = AppState.attemptsUsed >= 2 || AppState.isCompleted;
    if (hintAvailable) {
      DOM.hintBox.classList.remove("hidden");
      DOM.hintText.textContent = AppState.activePuzzle.hint;
      DOM.hintStatusIndicator.classList.remove("hidden");
    } else {
      DOM.hintBox.classList.add("hidden");
      DOM.hintStatusIndicator.classList.add("hidden");
    }

    if (AppState.isCompleted) {
      DOM.btnSubmit.textContent = "View Summary";
      DOM.btnClear.classList.add("hidden");
    } else {
      DOM.btnSubmit.textContent = "Submit Sequence";
      DOM.btnClear.classList.remove("hidden");
    }
  }

  function renderSlots() {
    DOM.slots.forEach((el, idx) => {
      const slotDef = AppState.activePuzzle.slots[idx];
      el.querySelector(".slot-name").textContent = slotDef.name;
      el.classList.remove("active", "locked");

      const valHolder = el.querySelector(".slot-value");
      valHolder.innerHTML = "";

      if (AppState.lockedSlots[idx]) {
        el.classList.add("locked");
        valHolder.textContent = slotDef.answer;
      } else if (AppState.currentDraft[idx]) {
        valHolder.textContent = AppState.currentDraft[idx].text;
      } else {
        valHolder.innerHTML = '<span class="placeholder">Awaiting placement</span>';
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
      } else {
        btn.addEventListener("click", () => handleTileClick(item));
      }
      DOM.itemsPool.appendChild(btn);
    });
  }

  // Interactions (Sections 16-18)
  function handleTileClick(item) {
    if (AppState.isCompleted) return;

    SoundSystem.place();

    let target = AppState.selectedSlot;
    if (AppState.lockedSlots[target]) {
      target = AppState.lockedSlots.findIndex((l) => !l);
    }
    if (target === -1) return;

    AppState.currentDraft[target] = item;

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

    SoundSystem.tap();

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
    SoundSystem.tap();
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
      SoundSystem.tap();
      openResultModal();
      return;
    }

    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
        SoundSystem.miss();
        showToast("Fill all 5 slots before submitting.");
        return;
      }
    }

    AppState.attemptsUsed++;
    const rowResult = [];
    let hadHit = false;

    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (AppState.lockedSlots[i]) {
        rowResult.push("hit");
        continue;
      }
      const item = AppState.currentDraft[i];
      if (item && item.slotIndex === i) {
        AppState.lockedSlots[i] = true;
        rowResult.push("hit");
        hadHit = true;
      } else {
        AppState.currentDraft[i] = null;
        rowResult.push("miss");
        const slotEl = DOM.slots[i];
        slotEl.classList.add("incorrect-flash");
        setTimeout(() => slotEl.classList.remove("incorrect-flash"), 500);
      }
    }

    if (hadHit) {
      SoundSystem.hit();
    } else {
      SoundSystem.miss();
    }

    AppState.historyGrid.push(rowResult);

    const won = AppState.lockedSlots.every(Boolean);
    if (won) {
      SoundSystem.win();
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
      SoundSystem.miss();
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

  // Modals & Details
  function openResultModal() {
    const p = AppState.activePuzzle;
    DOM.resultTitle.textContent = AppState.isWon ? "Sequence Perfected" : "Challenge Concluded";
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

  function openStatsModal() {
    SoundSystem.tap();
    const s = AppState.store.stats;
    DOM.statPlayed.textContent = s.played;
    DOM.statWinRate.textContent = `${s.played > 0 ? Math.round((s.won / s.played) * 100) : 0}%`;
    DOM.statStreak.textContent = s.currentStreak;
    DOM.statMaxStreak.textContent = s.maxStreak;

    DOM.statsDistribution.innerHTML = "";
    const maxVal = Math.max(1, ...Object.values(s.dist));
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const count = s.dist[i] || 0;
      const pct = Math.max(10, Math.round((count / maxVal) * 100));

      const row = document.createElement("div");
      row.className = "dist-row";
      row.innerHTML = `
        <span style="width:16px;font-weight:700;color:var(--c-gold-metallic);">${i}</span>
        <div class="dist-bar-bg">
          <div class="dist-bar-fill" style="width:${pct}%">${count}</div>
        </div>
      `;
      DOM.statsDistribution.appendChild(row);
    }
    DOM.modalStats.classList.remove("hidden");
  }

  // Vault Screen (Section 5)
  function renderVault() {
    DOM.vaultList.innerHTML = "";
    const past = AppState.puzzles.filter((p) => p.date < AppState.todayPuzzle.date);
    if (past.length === 0) {
      DOM.vaultList.innerHTML = '<p class="status-text" style="text-align:center;padding:24px;">No vintage puzzles in the vault cellar yet.</p>';
      return;
    }

    past.slice().reverse().forEach((puzzle) => {
      const record = AppState.store.history[puzzle.date];
      const item = document.createElement("div");
      item.className = "vault-item";
      item.setAttribute("role", "button");
      item.setAttribute("tabindex", "0");

      let status = "Cellar Reserve";
      if (record && record.completed) {
        status = record.won ? `Solved (${record.attemptsUsed}/${MAX_ATTEMPTS})` : "Archived";
      }

      item.innerHTML = `
        <div>
          <div class="vault-item-title">${puzzle.title}</div>
          <div class="status-text">${puzzle.date}</div>
        </div>
        <span class="badge ${record && record.completed && record.won ? "badge-accent" : ""}">${status}</span>
      `;

      const onSelect = () => startPuzzle(puzzle, true);
      item.addEventListener("click", onSelect);
      item.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onSelect();
        }
      });

      DOM.vaultList.appendChild(item);
    });
  }

  function copyShareSnippet() {
    SoundSystem.tap();
    const p = AppState.activePuzzle;
    const score = AppState.isWon ? `${AppState.attemptsUsed}/${MAX_ATTEMPTS}` : "X/4";
    let text = `Sequence ${p.date} — ${score}\n`;
    AppState.historyGrid.forEach((row) => {
      text += row.map((cell) => (cell === "hit" ? "✦" : "✧")).join(" ") + "\n";
    });

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => showToast("Tasting results copied to clipboard."));
    } else {
      showToast("Clipboard unavailable.");
    }
  }

  // Universal Navigation & Event Binding
  function bindEvents() {
    DOM.headerBackBtn.addEventListener("click", () => {
      SoundSystem.tap();
      showView("menu");
    });

    DOM.btnPlayToday.addEventListener("click", () => startPuzzle(AppState.todayPuzzle, false));
    DOM.btnViewVault.addEventListener("click", () => {
      SoundSystem.tap();
      showView("vault");
    });

    DOM.btnStats.addEventListener("click", openStatsModal);
    DOM.btnRules.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalRules.classList.remove("hidden");
    });

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

    DOM.btnClear.addEventListener("click", clearDraft);
    DOM.btnSubmit.addEventListener("click", submitAttempt);

    DOM.btnCloseResult.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalResult.classList.add("hidden");
    });
    DOM.btnResultMenu.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalResult.classList.add("hidden");
      showView("menu");
    });
    DOM.btnResultVault.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalResult.classList.add("hidden");
      showView("vault");
    });
    DOM.btnShare.addEventListener("click", copyShareSnippet);

    DOM.btnCloseRules.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalRules.classList.add("hidden");
    });
    DOM.btnRulesOk.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalRules.classList.add("hidden");
    });

    DOM.btnCloseStats.addEventListener("click", () => {
      SoundSystem.tap();
      DOM.modalStats.classList.add("hidden");
    });

    [DOM.modalResult, DOM.modalRules, DOM.modalStats].forEach((backdrop) => {
      backdrop.addEventListener("click", (e) => {
        if (e.target === backdrop) {
          SoundSystem.tap();
          backdrop.classList.add("hidden");
        }
      });
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();