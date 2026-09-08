/**
 * ============================================================================
 * COCKTAIL SPECS CARD CHALLENGE — GAME & PLATFORM ENGINE
 * File: script.js
 * ============================================================================
 * 
 * Architectural Highlights:
 * - Dedicated Main Menu Screen with standard hierarchy: TODAY > VAULT > HOME > SOUND.
 * - Deterministic Calendar Engine: 8 SEPTEMBER 2026 is Day 0 (Day #1).
 *   On Day 0, Today is puzzle #1 and Vault contains zero historical items.
 *   On Day 1, Today is puzzle #2 and Vault contains Day 0.
 * - Append-Protected Scheduling: Stable date-to-puzzle assignment preserves past shifts.
 * - Future Puzzle Privacy: Future days and content are strictly inaccessible.
 * - SVG Garnish Background: Botanical gold line art with subtle floating motion & lower light.
 *   Density automatically throttled (2–5 in Menu, 1–2 in active Gameplay).
 * - Web Audio API Synthetic Sound Engine (no external media files).
 * - Versioned LocalStorage with graceful corrupted-data recovery.
 * - Mobile-first touch drop & keyboard-accessible tab navigation.
 */

(function () {
  "use strict";

  // --- 1. CONSTANTS & SPECIFICATION CONTRACT ---
  const STORAGE_KEY = "cocktail_specs_data_v1";
  const STORAGE_VERSION = 1;
  const MAX_ATTEMPTS = 4;
  const SLOTS_COUNT = 5;

  // Day 0 Canonical Epoch: 8 September 2026 (Section 65–67)
  const EPOCH_DATE_STR = "2026-09-08T00:00:00Z";

  // --- 2. SYNTHETIC AUDIO ENGINE (Web Audio API) ---
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.enabled = true;
    }

    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) {
          this.ctx = new AudioCtx();
        }
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    playTileTap() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playLockSuccess() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.09, now + i * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.28);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + i * 0.06);
        osc.stop(now + i * 0.06 + 0.3);
      });
    }

    playMiss() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.18);
    }

    playVictoryChord() {
      if (!this.enabled) return;
      this.init();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.08);
        osc.stop(now + idx * 0.08 + 0.65);
      });
    }
  }

  const audio = new SoundEngine();

  // --- 3. DETERMINISTIC DAILY SCHEDULING (Section 65–78) ---
  /**
   * Calculates the current day index relative to Day 0 (8 Sept 2026).
   * Pre-launch preview environments safely default to Day 0 (First puzzle, empty vault).
   */
  function getCurrentDayIndex() {
    const epochDate = new Date(EPOCH_DATE_STR);
    const now = new Date();
    const todayLocalMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const epochMidnight = new Date(epochDate.getUTCFullYear(), epochDate.getUTCMonth(), epochDate.getUTCDate());
    const diffMs = todayLocalMidnight.getTime() - epochMidnight.getTime();
    const dayDiff = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    return Math.max(0, dayDiff);
  }

  /**
   * Deterministically retrieves the puzzle for a given day index.
   * Uses persistent history to prevent retroactive remapping when new puzzles are appended.
   */
  function getPuzzleForDay(dayIndex, persistentHistory = {}) {
  if (!COCKTAIL_PUZZLES || COCKTAIL_PUZZLES.length === 0) return null;
  const puzzles = COCKTAIL_PUZZLES;

    // 1. Check if this day index already has an assigned puzzle ID recorded
    if (persistentHistory && persistentHistory[dayIndex]) {
      const assignedId = persistentHistory[dayIndex];
      const found = puzzles.find(p => p.id === assignedId);
      if (found) return found;
    }

    // 2. Stable fallback assignment
    const puzzleIdx = dayIndex % puzzles.length;
    return puzzles[puzzleIdx];
  }

  // --- 4. PERSISTENT STORAGE MANAGER ---
  function loadStorageData() {
    const fallback = {
      version: STORAGE_VERSION,
      soundEnabled: true,
      stats: {
        played: 0,
        won: 0,
        currentStreak: 0,
        maxStreak: 0,
        distribution: { 1: 0, 2: 0, 3: 0, 4: 0 }
      },
      dailyScheduleMap: {}, // dayIndex -> puzzleId
      puzzleHistory: {}     // puzzleId -> progress record
    };

    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      const parsed = JSON.parse(raw);
      if (!parsed || parsed.version !== STORAGE_VERSION) {
        return Object.assign(fallback, parsed || {});
      }
      return Object.assign(fallback, parsed);
    } catch (e) {
      console.warn("Notice: LocalStorage read failed or corrupted. Starting fresh profile.", e);
      return fallback;
    }
  }

  function saveStorageData(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn("Notice: Unable to save to localStorage.", e);
    }
  }

  // Global Application State
  const AppState = {
    store: loadStorageData(),
    currentDay: getCurrentDayIndex(),
    activePuzzle: null,
    activeDayIndex: 0,
    isVaultMode: false,
    selectedSlot: 0,
    currentDraft: [null, null, null, null, null],
    lockedSlots: [false, false, false, false, false],
    attemptsUsed: 0,
    isCompleted: false,
    isWon: false,
    historyGrid: []
  };

  audio.enabled = AppState.store.soundEnabled;

  // Lock today's puzzle identity in dailyScheduleMap for historical stability
  (function lockTodaySchedule() {
    const todayP = getPuzzleForDay(AppState.currentDay, AppState.store.dailyScheduleMap);
    if (todayP) {
      AppState.store.dailyScheduleMap[AppState.currentDay] = todayP.id;
      saveStorageData(AppState.store);
    }
  })();

  // --- 5. DOM ELEMENT REFERENCES ---
  const DOM = {
    // Header & Views
    platformHeader: document.getElementById("platform-header"),
    btnBackToMenu: document.getElementById("btn-back-to-menu"),
    navStatsBtn: document.getElementById("nav-stats-btn"),
    navHelpBtn: document.getElementById("nav-help-btn"),
    navSoundBtn: document.getElementById("nav-sound-btn"),
    soundIcon: document.getElementById("sound-icon"),
    
    // Screens
    viewMenu: document.getElementById("view-menu"),
    viewGame: document.getElementById("view-game"),
    viewVault: document.getElementById("view-vault"),

    // Main Menu Elements
    menuTodayCard: document.getElementById("menu-today-card"),
    menuTodayBadge: document.getElementById("menu-today-badge"),
    menuTodayDayNumber: document.getElementById("menu-today-day-number"),
    menuTodayStatusBadge: document.getElementById("menu-today-status-badge"),
    menuTodayCocktailName: document.getElementById("menu-today-cocktail-name"),
    menuTodayCocktailClue: document.getElementById("menu-today-cocktail-clue"),
    menuTodayActionText: document.getElementById("menu-today-action-text"),
    menuShakersIndicator: document.getElementById("menu-shakers-indicator"),
    menuBtnVault: document.getElementById("menu-btn-vault"),
    menuVaultCountBadge: document.getElementById("menu-vault-count-badge"),
    menuBtnStats: document.getElementById("menu-btn-stats"),
    menuBtnHelp: document.getElementById("menu-btn-help"),
    menuBtnSound: document.getElementById("menu-btn-sound"),
    menuSoundIcon: document.getElementById("menu-sound-icon"),
    menuSoundLabel: document.getElementById("menu-sound-label"),

    // Active Game Elements
    puzzleDayBadge: document.getElementById("puzzle-day-badge"),
    puzzleCategoryBadge: document.getElementById("puzzle-category-badge"),
    puzzleDiffBadge: document.getElementById("puzzle-difficulty-badge"),
    ticketNumber: document.getElementById("ticket-number"),
    cocktailEra: document.getElementById("cocktail-era"),
    cocktailName: document.getElementById("cocktail-name"),
    cocktailClue: document.getElementById("cocktail-historical-clue"),
    shakerTokens: document.getElementById("shaker-tokens"),
    slotsGrid: document.getElementById("spec-slots-grid"),
    slots: document.querySelectorAll(".spec-slot"),
    barRailTiles: document.getElementById("bar-rail-tiles"),
    hintBox: document.getElementById("bartender-hint-box"),
    hintText: document.getElementById("bartender-hint-text"),
    btnClearDraft: document.getElementById("btn-clear-draft"),
    btnSubmitSpec: document.getElementById("btn-submit-spec"),

    // Vault Elements
    vaultList: document.getElementById("vault-list"),
    btnVaultBackMenu: document.getElementById("btn-vault-back-menu"),

    // Result Modal Elements
    modalResult: document.getElementById("modal-result"),
    btnCloseResult: document.getElementById("btn-close-result"),
    resultStatusBadge: document.getElementById("result-status-badge"),
    modalResultTitle: document.getElementById("modal-result-title"),
    resultCocktailName: document.getElementById("result-cocktail-name"),
    shareGridPreview: document.getElementById("share-grid-preview"),
    authoritativeSpecsList: document.getElementById("authoritative-specs-list"),
    loreBodyText: document.getElementById("lore-body-text"),
    loreCurriculumCategory: document.getElementById("lore-curriculum-category"),
    btnShareResult: document.getElementById("btn-share-result"),
    btnResultMenu: document.getElementById("btn-result-menu"),
    btnResultVault: document.getElementById("btn-result-vault"),

    // Help & Stats Modals
    modalHelp: document.getElementById("modal-help"),
    btnCloseHelp: document.getElementById("btn-close-help"),
    btnHelpStart: document.getElementById("btn-help-start"),
    modalStats: document.getElementById("modal-stats"),
    btnCloseStats: document.getElementById("btn-close-stats"),
    btnStatsClose: document.getElementById("btn-stats-close"),
    statPlayed: document.getElementById("stat-played"),
    statWinRate: document.getElementById("stat-win-rate"),
    statCurrentStreak: document.getElementById("stat-current-streak"),
    statMaxStreak: document.getElementById("stat-max-streak"),
    statsDistribution: document.getElementById("stats-distribution"),

    // Ambient & Toast
    garnishContainer: document.getElementById("garnish-container"),
    toastRegion: document.getElementById("toast-region")
  };

  // --- 6. ANIMATED GARNISH BACKGROUND SYSTEM (Section 27–36) ---
  const GARNISH_SVGS = [
    // 1. Mint Sprig
    `<svg viewBox="0 0 64 64" fill="none" stroke="#E5C158" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M32 58 C32 40 32 20 32 6" />
      <path d="M32 38 C20 36 12 28 14 18 C24 16 30 26 32 38 Z" />
      <path d="M22 28 C26 26 28 24 30 22" />
      <path d="M32 30 C44 28 52 20 50 10 C40 8 34 18 32 30 Z" />
      <path d="M42 20 C38 18 36 16 34 14" />
      <path d="M32 18 C26 12 28 4 32 2 C36 4 38 12 32 18 Z" />
    </svg>`,

    // 2. Citrus Spiral Twist
    `<svg viewBox="0 0 64 64" fill="none" stroke="#E5C158" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 14 C24 2 46 6 50 20 C54 34 32 38 24 44 C16 50 24 60 38 58 C48 56 54 46 52 38" />
      <path d="M16 18 C26 8 44 10 46 22 C48 32 32 36 26 42" stroke-dasharray="2 2" opacity="0.6" />
    </svg>`,

    // 3. Citrus Wheel
    `<svg viewBox="0 0 64 64" fill="none" stroke="#E5C158" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <circle cx="32" cy="32" r="28" />
      <circle cx="32" cy="32" r="23" stroke-dasharray="2 3" opacity="0.7" />
      <circle cx="32" cy="32" r="4" />
      <path d="M32 8 L32 28 M32 36 L32 56 M8 32 L28 32 M36 32 L56 32" />
      <path d="M15 15 L29 29 M35 35 L49 49 M49 15 L35 29 M29 35 L15 49" />
    </svg>`,

    // 4. Olive Pick
    `<svg viewBox="0 0 64 64" fill="none" stroke="#E5C158" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="10" y1="54" x2="54" y2="10" />
      <circle cx="56" cy="8" r="3" fill="#E5C158" />
      <ellipse cx="28" cy="36" rx="9" ry="14" transform="rotate(-45 28 36)" />
      <circle cx="28" cy="36" r="3" fill="#E5C158" />
    </svg>`,

    // 5. Cherries with Stem
    `<svg viewBox="0 0 64 64" fill="none" stroke="#E5C158" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 42 C14 42 12 50 18 56 C24 62 32 56 30 48 C28 42 24 42 22 42 Z" />
      <path d="M44 38 C36 38 34 46 40 52 C46 58 54 52 52 44 C50 38 46 38 44 38 Z" />
      <path d="M24 42 C26 28 36 18 42 8" />
      <path d="M44 38 C42 26 40 16 42 8" />
      <path d="M42 8 C48 10 56 12 54 18 C50 18 46 14 42 8 Z" />
    </svg>`,

    // 6. Rosemary Sprig
    `<svg viewBox="0 0 64 64" fill="none" stroke="#E5C158" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
      <line x1="16" y1="56" x2="48" y2="8" />
      <line x1="22" y1="46" x2="14" y2="40" />
      <line x1="26" y1="42" x2="36" y2="46" />
      <line x1="30" y1="34" x2="20" y2="28" />
      <line x1="34" y1="30" x2="44" y2="34" />
      <line x1="38" y1="22" x2="28" y2="16" />
      <line x1="42" y1="18" x2="52" y2="22" />
    </svg>`
  ];

  class GarnishManager {
    constructor(container) {
      this.container = container;
      this.activeElements = new Set();
      this.timer = null;
      this.isGameMode = false;
      this.reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    }

    start() {
      if (this.reducedMotion) return;
      this.scheduleNext();
    }

    setGameMode(isGame) {
      this.isGameMode = isGame;
      if (isGame) {
        document.body.classList.add("game-active-mode");
      } else {
        document.body.classList.remove("game-active-mode");
      }
    }

    scheduleNext() {
      // Menu target: 2–5 visible. Game target: 1–2 visible (Section 30 & 35)
      const maxCount = this.isGameMode ? 2 : 4;
      const interval = this.isGameMode 
        ? Math.floor(Math.random() * 6000 + 7000) 
        : Math.floor(Math.random() * 3000 + 2500);

      this.timer = setTimeout(() => {
        if (this.activeElements.size < maxCount) {
          this.spawnGarnish();
        }
        this.scheduleNext();
      }, interval);
    }

    spawnGarnish() {
      const svgCode = GARNISH_SVGS[Math.floor(Math.random() * GARNISH_SVGS.length)];
      const el = document.createElement("div");
      el.className = "floating-garnish";
      el.innerHTML = svgCode;

      const size = Math.floor(Math.random() * 22 + 46); // 46px to 68px
      const leftPercent = Math.floor(Math.random() * 84 + 6); // 6% to 90%
      const durationSec = Math.floor(Math.random() * 12 + 18); // 18s to 30s
      const rotationDeg = Math.floor(Math.random() * 120 - 60);

      el.style.width = `${size}px`;
      el.style.height = `${size}px`;
      el.style.left = `${leftPercent}%`;
      el.style.bottom = "-80px";
      el.style.transform = `rotate(${rotationDeg}deg)`;

      // Upward floating animation
      const anim = el.animate([
        { transform: `translate(0, 0) rotate(${rotationDeg}deg)`, opacity: 0 },
        { opacity: 0.38, offset: 0.15 },
        { opacity: 0.45, offset: 0.45 },
        { transform: `translate(${(Math.random() - 0.5) * 60}px, -115vh) rotate(${rotationDeg + 45}deg)`, opacity: 0 }
      ], {
        duration: durationSec * 1000,
        easing: "cubic-bezier(0.25, 1, 0.5, 1)"
      });

      this.container.appendChild(el);
      this.activeElements.add(el);

      anim.onfinish = () => {
        el.remove();
        this.activeElements.delete(el);
      };
    }
  }

  const garnishes = new GarnishManager(DOM.garnishContainer);
  garnishes.start();

  // --- 7. TOAST NOTIFICATION SYSTEM ---
  function showToast(message, duration = 2800) {
    const toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    DOM.toastRegion.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transition = "opacity 200ms ease";
      setTimeout(() => toast.remove(), 200);
    }, duration);
  }

  // --- 8. SCREEN NAVIGATION ROUTER ---
  function showScreen(screenId) {
    DOM.viewMenu.classList.add("hidden");
    DOM.viewGame.classList.add("hidden");
    DOM.viewVault.classList.add("hidden");

    if (screenId === "menu") {
      DOM.viewMenu.classList.remove("hidden");
      DOM.platformHeader.classList.add("hidden");
      garnishes.setGameMode(false);
      renderMainMenu();
    } else if (screenId === "game") {
      DOM.viewGame.classList.remove("hidden");
      DOM.platformHeader.classList.remove("hidden");
      garnishes.setGameMode(true);
    } else if (screenId === "vault") {
      DOM.viewVault.classList.remove("hidden");
      DOM.platformHeader.classList.remove("hidden");
      garnishes.setGameMode(false);
      renderVaultView();
    }
    window.scrollTo(0, 0);
  }

  // --- 9. MAIN MENU CONTROLLER (Section 12–15) ---
  function renderMainMenu() {
    const todayPuzzle = getPuzzleForDay(AppState.currentDay, AppState.store.dailyScheduleMap);
    if (!todayPuzzle) return;

    const record = AppState.store.puzzleHistory[todayPuzzle.id];
    DOM.menuTodayDayNumber.textContent = `DAY #${AppState.currentDay + 1}`;
    DOM.menuTodayCocktailName.textContent = todayPuzzle.name;
    DOM.menuTodayCocktailClue.textContent = `"${todayPuzzle.clue}"`;

    // Render Shakers Indicator in Menu
    const attempts = record ? record.attemptsUsed : 0;
    const miniShakers = DOM.menuShakersIndicator.querySelectorAll(".mini-shaker");
    miniShakers.forEach((icon, i) => {
      if (i < attempts) {
        icon.classList.add("lost");
      } else {
        icon.classList.remove("lost");
      }
    });

    if (record && record.completed) {
      if (record.won) {
        DOM.menuTodayStatusBadge.textContent = "SPEC APPROVED ✓";
        DOM.menuTodayStatusBadge.className = "badge gold-badge";
        DOM.menuTodayActionText.textContent = "VIEW SHIFT REPORT";
      } else {
        DOM.menuTodayStatusBadge.textContent = "RECIPE 86'D ✗";
        DOM.menuTodayStatusBadge.className = "badge diff-badge";
        DOM.menuTodayActionText.textContent = "REVIEW MASTER SPEC";
      }
    } else if (record && record.attemptsUsed > 0) {
      DOM.menuTodayStatusBadge.textContent = `IN PROGRESS (${MAX_ATTEMPTS - record.attemptsUsed} REMAINING)`;
      DOM.menuTodayStatusBadge.className = "badge tag-badge";
      DOM.menuTodayActionText.textContent = "RESUME SERVICE";
    } else {
      DOM.menuTodayStatusBadge.textContent = "READY FOR SERVICE";
      DOM.menuTodayStatusBadge.className = "badge diff-badge";
      DOM.menuTodayActionText.textContent = "START SERVICE";
    }

    // Vault count badge: Past released days strictly < currentDay
    const vaultCount = Math.max(0, AppState.currentDay);
    DOM.menuVaultCountBadge.textContent = `${vaultCount} SHIFT${vaultCount === 1 ? "" : "S"}`;
  }

  // --- 10. PUZZLE SETUP & BOARD RENDERING ---
  function loadPuzzle(puzzle, dayIndex, isVault = false) {
    AppState.activePuzzle = puzzle;
    AppState.activeDayIndex = dayIndex;
    AppState.isVaultMode = isVault;
    AppState.selectedSlot = 0;

    // Load past progress
    const record = AppState.store.puzzleHistory[puzzle.id];
    if (record) {
      AppState.isCompleted = record.completed;
      AppState.isWon = record.won;
      AppState.attemptsUsed = record.attemptsUsed;
      AppState.lockedSlots = record.lockedSlots.slice();
      AppState.currentDraft = record.draftSlots ? record.draftSlots.slice() : [null, null, null, null, null];
      AppState.historyGrid = record.historyGrid ? record.historyGrid.slice() : [];
    } else {
      AppState.isCompleted = false;
      AppState.isWon = false;
      AppState.attemptsUsed = 0;
      AppState.lockedSlots = [false, false, false, false, false];
      AppState.currentDraft = [null, null, null, null, null];
      AppState.historyGrid = [];
    }

    // Update Meta Headers
    DOM.puzzleDayBadge.textContent = `DAY #${dayIndex + 1}`;
    DOM.puzzleCategoryBadge.textContent = puzzle.curriculumCategory.split(":")[1]?.trim() || "COCKTAIL";
    DOM.puzzleDiffBadge.textContent = puzzle.difficulty.toUpperCase();
    DOM.ticketNumber.textContent = String(dayIndex + 1).padStart(3, "0");
    DOM.cocktailEra.textContent = puzzle.era || "Savoy Canon";
    DOM.cocktailName.textContent = puzzle.name;
    DOM.cocktailClue.textContent = `"${puzzle.clue}"`;

    renderShakers();
    renderSlots();
    renderBarRail();

    // Tasting Log Hint (Unlocked at attempt 2+)
    if (AppState.attemptsUsed >= 2 || AppState.isCompleted) {
      DOM.hintBox.classList.remove("hidden");
      DOM.hintText.textContent = puzzle.hint;
    } else {
      DOM.hintBox.classList.add("hidden");
    }

    updateControlButtons();
    showScreen("game");
  }

  function renderShakers() {
    const remaining = Math.max(0, MAX_ATTEMPTS - AppState.attemptsUsed);
    const icons = DOM.shakerTokens.querySelectorAll(".shaker-icon");
    icons.forEach((icon, i) => {
      if (i < AppState.attemptsUsed) {
        icon.classList.add("lost");
        icon.setAttribute("title", `Shaker ${i + 1} (Used)`);
      } else {
        icon.classList.remove("lost");
        icon.setAttribute("title", `Shaker ${i + 1} (Ready)`);
      }
    });

    const submitSubtext = DOM.btnSubmitSpec.querySelector(".btn-subtext");
    if (submitSubtext) {
      submitSubtext.textContent = AppState.isCompleted 
        ? "(SPEC COMPLETED)"
        : `(${remaining} ATTEMPTS REMAINING)`;
    }
  }

  function renderSlots() {
    DOM.slots.forEach((slotEl, idx) => {
      slotEl.classList.remove("selected", "locked");
      const isLocked = AppState.lockedSlots[idx];
      const drafted = AppState.currentDraft[idx];
      const holder = slotEl.querySelector(".slot-content-holder");
      holder.innerHTML = "";

      if (isLocked) {
        slotEl.classList.add("locked");
        const correctTarget = AppState.activePuzzle.targetSlots[idx];
        const span = document.createElement("span");
        span.className = "slotted-tile-view";
        span.textContent = correctTarget.component;
        holder.appendChild(span);
        slotEl.setAttribute("aria-label", `Slot ${idx + 1}: ${correctTarget.type}. Locked correct: ${correctTarget.component}`);
      } else if (drafted) {
        const span = document.createElement("span");
        span.className = "slotted-tile-view";
        span.textContent = drafted.text;
        holder.appendChild(span);
        slotEl.setAttribute("aria-label", `Slot ${idx + 1}: Filled with ${drafted.text}. Click to remove.`);
      } else {
        const ph = document.createElement("span");
        ph.className = "slot-placeholder";
        ph.textContent = `Tap to assign ${AppState.activePuzzle.targetSlots[idx].type}`;
        holder.appendChild(ph);
        slotEl.setAttribute("aria-label", `Slot ${idx + 1}: Empty. Tap to select.`);
      }

      if (!AppState.isCompleted && !isLocked && idx === AppState.selectedSlot) {
        slotEl.classList.add("selected");
      }
    });
  }

  function renderBarRail() {
    DOM.barRailTiles.innerHTML = "";
    const pool = AppState.activePuzzle.barRailPool;

    const placedTileIds = new Set();
    AppState.currentDraft.forEach(t => {
      if (t) placedTileIds.add(t.id);
    });

    pool.forEach(tile => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "rail-tile";
      btn.dataset.tileId = tile.id;

      const cat = document.createElement("span");
      cat.className = "rail-tile-category";
      cat.textContent = tile.category;

      const label = document.createElement("span");
      label.textContent = tile.text;

      btn.appendChild(cat);
      btn.appendChild(label);

      if (placedTileIds.has(tile.id)) {
        btn.classList.add("used");
        btn.setAttribute("aria-disabled", "true");
        btn.tabIndex = -1;
      } else {
        btn.addEventListener("click", () => handleTileSelection(tile));
      }

      DOM.barRailTiles.appendChild(btn);
    });
  }

  function updateControlButtons() {
    if (AppState.isCompleted) {
      DOM.btnSubmitSpec.disabled = false;
      DOM.btnSubmitSpec.querySelector(".btn-text").textContent = "VIEW SHIFT REPORT";
      DOM.btnClearDraft.style.display = "none";
    } else {
      DOM.btnSubmitSpec.disabled = false;
      DOM.btnSubmitSpec.querySelector(".btn-text").textContent = "TEST SPECIFICATION";
      DOM.btnClearDraft.style.display = "inline-block";
    }
  }

  // --- 11. GAMEPLAY INTERACTIONS ---
  function selectSlot(slotIndex) {
    if (AppState.isCompleted) return;
    if (AppState.lockedSlots[slotIndex]) {
      const nextUnlocked = AppState.lockedSlots.findIndex(l => !l);
      if (nextUnlocked !== -1) AppState.selectedSlot = nextUnlocked;
    } else {
      AppState.selectedSlot = slotIndex;
    }
    renderSlots();
  }

  function handleTileSelection(tile) {
    if (AppState.isCompleted) return;
    audio.playTileTap();

    if (AppState.lockedSlots[AppState.selectedSlot]) {
      const nextAvailable = AppState.lockedSlots.findIndex(l => !l);
      if (nextAvailable === -1) return;
      AppState.selectedSlot = nextAvailable;
    }

    AppState.currentDraft[AppState.selectedSlot] = tile;

    // Advance to next unassigned and unlocked slot
    let nextSlot = -1;
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
        nextSlot = i;
        break;
      }
    }
    if (nextSlot !== -1) {
      AppState.selectedSlot = nextSlot;
    }

    renderSlots();
    renderBarRail();
  }

  function handleSlotClick(slotIndex) {
    if (AppState.isCompleted) return;
    if (AppState.lockedSlots[slotIndex]) {
      showToast("This slot is already authenticated and locked.");
      return;
    }

    if (AppState.currentDraft[slotIndex]) {
      audio.playTileTap();
      AppState.currentDraft[slotIndex] = null;
      AppState.selectedSlot = slotIndex;
      renderSlots();
      renderBarRail();
      return;
    }

    selectSlot(slotIndex);
  }

  function clearUnlockedDraft() {
    if (AppState.isCompleted) return;
    audio.playTileTap();
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i]) {
        AppState.currentDraft[i] = null;
      }
    }
    const firstUnlocked = AppState.lockedSlots.findIndex(l => !l);
    AppState.selectedSlot = firstUnlocked !== -1 ? firstUnlocked : 0;
    renderSlots();
    renderBarRail();
    showToast("Draft slots cleared.");
  }

  function submitSpecification() {
    if (AppState.isCompleted) {
      openResultModal();
      return;
    }

    // Require all 5 slots to be populated
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
        showToast("Fill all 5 specification slots before testing.");
        const missingSlotEl = DOM.slots[i];
        missingSlotEl.classList.add("miss-flash");
        setTimeout(() => missingSlotEl.classList.remove("miss-flash"), 420);
        return;
      }
    }

    AppState.attemptsUsed++;
    let newlyMatchedCount = 0;
    const attemptRoundResult = [];

    // Evaluate each slot against the canonical spec
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (AppState.lockedSlots[i]) {
        attemptRoundResult.push("hit");
        continue;
      }

      const placedTile = AppState.currentDraft[i];
      if (placedTile && placedTile.correctSlot === i) {
        AppState.lockedSlots[i] = true;
        newlyMatchedCount++;
        attemptRoundResult.push("hit");
      } else {
        attemptRoundResult.push("miss");
        AppState.currentDraft[i] = null;
        const slotEl = DOM.slots[i];
        slotEl.classList.add("miss-flash");
        setTimeout(() => slotEl.classList.remove("miss-flash"), 450);
      }
    }

    AppState.historyGrid.push(attemptRoundResult);

    if (newlyMatchedCount > 0) {
      audio.playLockSuccess();
    } else {
      audio.playMiss();
    }

    renderShakers();
    renderSlots();
    renderBarRail();

    const areAllLocked = AppState.lockedSlots.every(l => l === true);

    // WIN
    if (areAllLocked) {
      AppState.isCompleted = true;
      AppState.isWon = true;
      audio.playVictoryChord();
      saveGameProgress();
      recordStats(true, AppState.attemptsUsed);
      setTimeout(openResultModal, 700);
      return;
    }

    // LOSS (Exhausted attempts)
    if (AppState.attemptsUsed >= MAX_ATTEMPTS) {
      AppState.isCompleted = true;
      AppState.isWon = false;
      audio.playMiss();
      AppState.lockedSlots = [true, true, true, true, true];
      renderSlots();
      saveGameProgress();
      recordStats(false, AppState.attemptsUsed);
      setTimeout(openResultModal, 750);
      return;
    }

    // Hint unlock on attempt 2
    if (AppState.attemptsUsed >= 2) {
      DOM.hintBox.classList.remove("hidden");
      DOM.hintText.textContent = AppState.activePuzzle.hint;
      showToast("Tasting hint unlocked in Bartender Log!");
    } else {
      showToast(`Spec tested: ${newlyMatchedCount} correct slots locked.`);
    }

    const firstFree = AppState.lockedSlots.findIndex(l => !l);
    if (firstFree !== -1) AppState.selectedSlot = firstFree;
    renderSlots();

    saveGameProgress();
  }

  // --- 12. PERSISTENCE & STATS ---
  function saveGameProgress() {
    const puzzleId = AppState.activePuzzle.id;
    AppState.store.puzzleHistory[puzzleId] = {
      completed: AppState.isCompleted,
      won: AppState.isWon,
      attemptsUsed: AppState.attemptsUsed,
      lockedSlots: AppState.lockedSlots.slice(),
      draftSlots: AppState.currentDraft.slice(),
      historyGrid: AppState.historyGrid.slice(),
      updatedAt: Date.now()
    };
    saveStorageData(AppState.store);
  }

  function recordStats(won, attempts) {
    if (AppState.isVaultMode) return; // Daily stats apply to today's scheduled challenge

    const stats = AppState.store.stats;
    stats.played++;
    if (won) {
      stats.won++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.maxStreak) {
        stats.maxStreak = stats.currentStreak;
      }
      if (stats.distribution[attempts] !== undefined) {
        stats.distribution[attempts]++;
      }
    } else {
      stats.currentStreak = 0;
    }
    saveStorageData(AppState.store);
  }

  // --- 13. RESULT MODAL & SOCIAL SHARING ---
  function openResultModal() {
    const p = AppState.activePuzzle;
    DOM.resultCocktailName.textContent = p.name;

    if (AppState.isWon) {
      DOM.resultStatusBadge.textContent = "SPEC APPROVED ✓";
      DOM.resultStatusBadge.className = "badge gold-badge";
      DOM.modalResultTitle.textContent = "SERVICE CERTIFIED";
    } else {
      DOM.resultStatusBadge.textContent = "RECIPE 86'D ✗";
      DOM.resultStatusBadge.className = "badge diff-badge";
      DOM.modalResultTitle.textContent = "SHIFT RETIRED";
    }

    // Build Visual Attempt Dots Grid (NYT Style)
    DOM.shareGridPreview.innerHTML = "";
    AppState.historyGrid.forEach(round => {
      const row = document.createElement("div");
      row.className = "share-grid-row";
      round.forEach(state => {
        const dot = document.createElement("span");
        dot.className = `share-dot ${state === "hit" ? "hit" : "miss"}`;
        row.appendChild(dot);
      });
      DOM.shareGridPreview.appendChild(row);
    });

    // Populate Canonical Specs List
    DOM.authoritativeSpecsList.innerHTML = "";
    p.targetSlots.forEach(slot => {
      const li = document.createElement("li");
      const st = document.createElement("strong");
      st.textContent = slot.type + ":";
      const val = document.createElement("span");
      val.textContent = slot.component;
      li.appendChild(st);
      li.appendChild(val);
      DOM.authoritativeSpecsList.appendChild(li);
    });

    // Populate Lore & Curriculum
    DOM.loreBodyText.textContent = p.lore;
    DOM.loreCurriculumCategory.textContent = `Curriculum: ${p.curriculumCategory}`;

    DOM.modalResult.classList.remove("hidden");
  }

  function generateShareSnippet() {
    const dayDisplay = AppState.activeDayIndex + 1;
    const scoreText = AppState.isWon ? `${AppState.attemptsUsed}/${MAX_ATTEMPTS}` : "X/4";
    let text = `🍸 COCKTAIL SPECS CARD #${dayDisplay} — ${scoreText}\n`;

    AppState.historyGrid.forEach(round => {
      const rowEmoji = round.map(s => (s === "hit" ? "🟩" : "⬛")).join("");
      text += `${rowEmoji}\n`;
    });

    text += `Test your bar knowledge: https://tileworksgamesstudio.github.io/86/`;
    return text;
  }

  function handleShare() {
    const snippet = generateShareSnippet();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet)
        .then(() => showToast("Shift report copied to clipboard!"))
        .catch(() => fallbackPromptShare(snippet));
    } else {
      fallbackPromptShare(snippet);
    }
  }

  function fallbackPromptShare(text) {
    window.prompt("Copy your specs report:", text);
  }

  // --- 14. VAULT ARCHIVE CONTROLLER (Section 18 & 19) ---
  function renderVaultView() {
    DOM.vaultList.innerHTML = "";
    const pastDaysCount = AppState.currentDay;

    if (pastDaysCount === 0) {
      // Day 0 baseline state: Vault is empty (Section 66)
      const emptyDiv = document.createElement("div");
      emptyDiv.className = "vault-empty-notice";
      emptyDiv.innerHTML = `
        <span class="vault-empty-icon" aria-hidden="true">🗝️</span>
        <h3>THE VAULT OPENS TOMORROW</h3>
        <p>Day #1 is currently active behind the bar. Historical shifts will be preserved here starting on Day #2.</p>
      `;
      DOM.vaultList.appendChild(emptyDiv);
      return;
    }

    // Render released historical puzzles strictly < currentDay
    for (let day = pastDaysCount - 1; day >= 0; day--) {
      const puzzle = getPuzzleForDay(day, AppState.store.dailyScheduleMap);
      if (!puzzle) continue;

      const record = AppState.store.puzzleHistory[puzzle.id];
      const card = document.createElement("div");
      card.className = "vault-card";
      card.tabIndex = 0;
      card.setAttribute("role", "button");

      const left = document.createElement("div");
      left.className = "vault-card-left";

      const dayLabel = document.createElement("span");
      dayLabel.className = "vault-card-day";
      dayLabel.textContent = `DAY #${day + 1} • ${puzzle.curriculumCategory.split(":")[1]?.trim() || "COCKTAIL"}`;

      const name = document.createElement("h3");
      name.className = "vault-card-name";
      name.textContent = puzzle.name;

      left.appendChild(dayLabel);
      left.appendChild(name);

      const right = document.createElement("div");
      const statusSpan = document.createElement("span");
      statusSpan.className = "vault-card-status";

      if (record && record.completed) {
        if (record.won) {
          statusSpan.classList.add("cleared");
          statusSpan.textContent = `PASSED (${record.attemptsUsed}/4)`;
        } else {
          statusSpan.classList.add("attempted");
          statusSpan.textContent = "FAILED (X/4)";
        }
      } else {
        statusSpan.classList.add("unplayed");
        statusSpan.textContent = "UNPLAYED";
      }

      right.appendChild(statusSpan);
      card.appendChild(left);
      card.appendChild(right);

      const launchVaultPuzzle = () => {
        loadPuzzle(puzzle, day, true);
      };

      card.addEventListener("click", launchVaultPuzzle);
      card.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          launchVaultPuzzle();
        }
      });

      DOM.vaultList.appendChild(card);
    }
  }

  // --- 15. STATISTICS CONTROLLER ---
  function openStatsModal() {
    const s = AppState.store.stats;
    DOM.statPlayed.textContent = s.played;
    const winRate = s.played > 0 ? Math.round((s.won / s.played) * 100) : 0;
    DOM.statWinRate.textContent = `${winRate}%`;
    DOM.statCurrentStreak.textContent = s.currentStreak;
    DOM.statMaxStreak.textContent = s.maxStreak;

    DOM.statsDistribution.innerHTML = "";
    const maxVal = Math.max(1, ...Object.values(s.distribution));

    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const val = s.distribution[i] || 0;
      const pct = Math.max(8, Math.round((val / maxVal) * 100));

      const row = document.createElement("div");
      row.className = "dist-row";

      const label = document.createElement("span");
      label.style.width = "18px";
      label.style.fontWeight = "700";
      label.textContent = i;

      const barWrap = document.createElement("div");
      barWrap.className = "dist-bar-wrap";

      const bar = document.createElement("div");
      bar.className = "dist-bar";
      bar.style.width = `${pct}%`;
      bar.textContent = val;

      if (AppState.isWon && AppState.attemptsUsed === i) {
        bar.classList.add("highlight");
      }

      barWrap.appendChild(bar);
      row.appendChild(label);
      row.appendChild(barWrap);
      DOM.statsDistribution.appendChild(row);
    }

    DOM.modalStats.classList.remove("hidden");
  }

  // --- 16. MIDNIGHT ROLLOVER MONITOR (Section 76) ---
  function setupMidnightRollover() {
    function checkRollover() {
      const liveDay = getCurrentDayIndex();
      if (liveDay !== AppState.currentDay) {
        AppState.currentDay = liveDay;
        const hasUnfinishedDraft = AppState.attemptsUsed > 0 && !AppState.isCompleted;
        if (!hasUnfinishedDraft && !AppState.isVaultMode) {
          const nextPuzzle = getPuzzleForDay(liveDay, AppState.store.dailyScheduleMap);
          AppState.store.dailyScheduleMap[liveDay] = nextPuzzle.id;
          saveStorageData(AppState.store);
          loadPuzzle(nextPuzzle, liveDay, false);
          showToast("A new daily cocktail spec has arrived behind the bar!");
        }
      }
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "visible") checkRollover();
    });
    setInterval(checkRollover, 60000);
  }

  // --- 17. ACCESSIBILITY & KEYBOARD CONTROLS ---
  function setupKeyboardControls() {
    window.addEventListener("keydown", (e) => {
      // Escape closes open modals
      if (!DOM.modalResult.classList.contains("hidden") ||
          !DOM.modalHelp.classList.contains("hidden") ||
          !DOM.modalStats.classList.contains("hidden")) {
        if (e.key === "Escape") {
          DOM.modalResult.classList.add("hidden");
          DOM.modalHelp.classList.add("hidden");
          DOM.modalStats.classList.add("hidden");
        }
        return;
      }

      // Slot navigation in active game
      if (!DOM.viewGame.classList.contains("hidden")) {
        if (e.key >= "1" && e.key <= "5") {
          const slotIdx = parseInt(e.key, 10) - 1;
          selectSlot(slotIdx);
        } else if (e.key === "Enter") {
          submitSpecification();
        } else if (e.key === "Backspace" || e.key === "Delete") {
          if (AppState.currentDraft[AppState.selectedSlot]) {
            handleSlotClick(AppState.selectedSlot);
          }
        }
      }
    });
  }

  // --- 18. INITIALIZATION & EVENT BINDINGS ---
  function toggleSound() {
    audio.enabled = !audio.enabled;
    AppState.store.soundEnabled = audio.enabled;
    saveStorageData(AppState.store);
    
    const icon = audio.enabled ? "🔊" : "🔇";
    DOM.soundIcon.textContent = icon;
    DOM.menuSoundIcon.textContent = icon;
    DOM.menuSoundLabel.textContent = audio.enabled ? "SOUND" : "MUTED";
    DOM.navSoundBtn.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
    
    showToast(`Sound: ${audio.enabled ? "ON" : "MUTED"}`);
    if (audio.enabled) audio.playTileTap();
  }

  function bindUIEvents() {
    // Main Menu Navigation
    DOM.menuTodayCard.addEventListener("click", () => {
      const todayPuzzle = getPuzzleForDay(AppState.currentDay, AppState.store.dailyScheduleMap);
      loadPuzzle(todayPuzzle, AppState.currentDay, false);
    });

    DOM.menuTodayCard.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        DOM.menuTodayCard.click();
      }
    });

    DOM.menuBtnVault.addEventListener("click", () => showScreen("vault"));
    DOM.menuBtnStats.addEventListener("click", openStatsModal);
    DOM.menuBtnHelp.addEventListener("click", () => DOM.modalHelp.classList.remove("hidden"));
    DOM.menuBtnSound.addEventListener("click", toggleSound);

    // Platform Top Bar Navigation
    DOM.btnBackToMenu.addEventListener("click", () => showScreen("menu"));
    DOM.btnVaultBackMenu.addEventListener("click", () => showScreen("menu"));
    DOM.navStatsBtn.addEventListener("click", openStatsModal);
    DOM.navHelpBtn.addEventListener("click", () => DOM.modalHelp.classList.remove("hidden"));
    DOM.navSoundBtn.addEventListener("click", toggleSound);

    // Blueprint Slots Interaction
    DOM.slots.forEach(slotEl => {
      const idx = parseInt(slotEl.dataset.slot, 10);
      slotEl.addEventListener("click", () => handleSlotClick(idx));
      slotEl.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          handleSlotClick(idx);
        }
      });
    });

    // Game Action Buttons
    DOM.btnClearDraft.addEventListener("click", clearUnlockedDraft);
    DOM.btnSubmitSpec.addEventListener("click", submitSpecification);

    // Modals
    DOM.btnCloseResult.addEventListener("click", () => DOM.modalResult.classList.add("hidden"));
    DOM.btnShareResult.addEventListener("click", handleShare);
    DOM.btnResultMenu.addEventListener("click", () => {
      DOM.modalResult.classList.add("hidden");
      showScreen("menu");
    });
    DOM.btnResultVault.addEventListener("click", () => {
      DOM.modalResult.classList.add("hidden");
      showScreen("vault");
    });

    DOM.btnCloseHelp.addEventListener("click", () => DOM.modalHelp.classList.add("hidden"));
    DOM.btnHelpStart.addEventListener("click", () => DOM.modalHelp.classList.add("hidden"));
    DOM.btnCloseStats.addEventListener("click", () => DOM.modalStats.classList.add("hidden"));
    DOM.btnStatsClose.addEventListener("click", () => DOM.modalStats.classList.add("hidden"));
  }

  function initApp() {
    bindUIEvents();
    setupKeyboardControls();
    setupMidnightRollover();

    // Sync sound state
    const soundIcon = audio.enabled ? "🔊" : "🔇";
    DOM.soundIcon.textContent = soundIcon;
    DOM.menuSoundIcon.textContent = soundIcon;
    DOM.menuSoundLabel.textContent = audio.enabled ? "SOUND" : "MUTED";

    // Initial Screen is the Dedicated Main Menu (Section 12)
    showScreen("menu");

    // First time visitor prompt
    if (AppState.store.stats.played === 0 && Object.keys(AppState.store.puzzleHistory).length === 0) {
      setTimeout(() => DOM.modalHelp.classList.remove("hidden"), 300);
    }
  }

  // Launch on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initApp);
  } else {
    initApp();
  }

})();