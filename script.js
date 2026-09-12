(function () {
  "use strict";

  const CONFIG = {
    puzzleCsvPath: './puzzles.csv',
    anchorReleaseDate: '2026-09-08',
    releaseTimeZone: 'Europe/London'
  };

  const STORAGE_KEY = "cocktail_specs_data_v2";
  const MAX_ATTEMPTS = 4;
  const SLOTS_COUNT = 5;

  class SoundEngine {
    constructor() { this.ctx = null; this.enabled = true; }
    init() {
      if (!this.ctx) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx) this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") this.ctx.resume();
    }
    playTileTap() {
      if (!this.enabled) return; this.init(); if (!this.ctx) return;
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.type = "sine"; osc.frequency.setValueAtTime(440, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(880, this.ctx.currentTime + 0.04);
      gain.gain.setValueAtTime(0.08, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.05);
    }
    playLockSuccess() {
      if (!this.enabled) return; this.init(); if (!this.ctx) return;
      const now = this.ctx.currentTime;
      [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = "triangle"; osc.frequency.setValueAtTime(freq, now + i * 0.06);
        gain.gain.setValueAtTime(0.09, now + i * 0.06); gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.28);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now + i * 0.06); osc.stop(now + i * 0.06 + 0.3);
      });
    }
    playMiss() {
      if (!this.enabled) return; this.init(); if (!this.ctx) return;
      const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
      osc.type = "sawtooth"; osc.frequency.setValueAtTime(160, this.ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, this.ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime); gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.18);
      osc.connect(gain); gain.connect(this.ctx.destination); osc.start(); osc.stop(this.ctx.currentTime + 0.18);
    }
    playVictoryChord() {
      if (!this.enabled) return; this.init(); if (!this.ctx) return;
      const now = this.ctx.currentTime; const notes = [440, 554.37, 659.25, 880, 1108.73];
      notes.forEach((freq, idx) => {
        const osc = this.ctx.createOscillator(); const gain = this.ctx.createGain();
        osc.type = "sine"; osc.frequency.setValueAtTime(freq, now + idx * 0.08);
        gain.gain.setValueAtTime(0.12, now + idx * 0.08); gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.6);
        osc.connect(gain); gain.connect(this.ctx.destination); osc.start(now + idx * 0.08); osc.stop(now + idx * 0.08 + 0.65);
      });
    }
  }
  const audio = new SoundEngine();

  function loadStorageData() {
    const fallback = {
      soundEnabled: true,
      stats: { played: 0, won: 0, currentStreak: 0, maxStreak: 0, distribution: { 1: 0, 2: 0, 3: 0, 4: 0 } },
      puzzleHistory: {}
    };
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return fallback;
      return Object.assign(fallback, JSON.parse(raw));
    } catch (e) {
      return fallback;
    }
  }

  function saveStorageData(data) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); } catch (e) {}
  }

  const AppState = {
    store: loadStorageData(),
    ukDate: null,
    vault: [],
    current: null,
    future: [],
    activePuzzle: null,
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

  const DOM = {
    app: document.getElementById("app"),
    errorScreen: document.getElementById("error-screen"),
    errorMessage: document.getElementById("error-message"),
    btnRetry: document.getElementById("btn-retry"),
    platformHeader: document.getElementById("platform-header"),
    btnBackToMenu: document.getElementById("btn-back-to-menu"),
    navStatsBtn: document.getElementById("nav-stats-btn"),
    navHelpBtn: document.getElementById("nav-help-btn"),
    navSoundBtn: document.getElementById("nav-sound-btn"),
    soundIcon: document.getElementById("sound-icon"),
    viewMenu: document.getElementById("view-menu"),
    viewGame: document.getElementById("view-game"),
    viewVault: document.getElementById("view-vault"),
    menuTodayCard: document.getElementById("menu-today-card"),
    menuTodayDayNumber: document.getElementById("menu-today-day-number"),
    menuTodayStatusBadge: document.getElementById("menu-today-status-badge"),
    menuTodayCocktailName: document.getElementById("menu-today-cocktail-name"),
    menuTodayActionText: document.getElementById("menu-today-action-text"),
    menuShakersIndicator: document.getElementById("menu-shakers-indicator"),
    menuBtnVault: document.getElementById("menu-btn-vault"),
    menuVaultCountBadge: document.getElementById("menu-vault-count-badge"),
    menuBtnStats: document.getElementById("menu-btn-stats"),
    menuBtnHelp: document.getElementById("menu-btn-help"),
    menuBtnSound: document.getElementById("menu-btn-sound"),
    menuSoundIcon: document.getElementById("menu-sound-icon"),
    menuSoundLabel: document.getElementById("menu-sound-label"),
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
    vaultList: document.getElementById("vault-list"),
    btnVaultBackMenu: document.getElementById("btn-vault-back-menu"),
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
    garnishContainer: document.getElementById("garnish-container"),
    toastRegion: document.getElementById("toast-region")
  };

  const GARNISH_SVGS = [
    `<svg viewBox="0 0 64 64" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M32 58 C32 40 32 20 32 6" /><path d="M32 38 C20 36 12 28 14 18 C24 16 30 26 32 38 Z" /><path d="M22 28 C26 26 28 24 30 22" /><path d="M32 30 C44 28 52 20 50 10 C40 8 34 18 32 30 Z" /><path d="M42 20 C38 18 36 16 34 14" /><path d="M32 18 C26 12 28 4 32 2 C36 4 38 12 32 18 Z" /></svg>`,
    `<svg viewBox="0 0 64 64" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 14 C24 2 46 6 50 20 C54 34 32 38 24 44 C16 50 24 60 38 58 C48 56 54 46 52 38" /><path d="M16 18 C26 8 44 10 46 22 C48 32 32 36 26 42" stroke-dasharray="2 2" opacity="0.6" /></svg>`,
    `<svg viewBox="0 0 64 64" fill="none" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="32" cy="32" r="28" /><circle cx="32" cy="32" r="23" stroke-dasharray="2 3" opacity="0.7" /><circle cx="32" cy="32" r="4" /><path d="M32 8 L32 28 M32 36 L32 56 M8 32 L28 32 M36 32 L56 32" /><path d="M15 15 L29 29 M35 35 L49 49 M49 15 L35 29 M29 35 L15 49" /></svg>`
  ];

  class GarnishManager {
    constructor(container) { this.container = container; this.activeElements = new Set(); this.timer = null; }
    start() { if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return; this.scheduleNext(); }
    scheduleNext() {
      this.timer = setTimeout(() => {
        if (this.activeElements.size < 2) this.spawnGarnish();
        this.scheduleNext();
      }, Math.floor(Math.random() * 6000 + 4000));
    }
    spawnGarnish() {
      const el = document.createElement("div"); el.className = "floating-garnish";
      el.innerHTML = GARNISH_SVGS[Math.floor(Math.random() * GARNISH_SVGS.length)];
      const size = Math.floor(Math.random() * 22 + 46); const leftPercent = Math.floor(Math.random() * 84 + 6);
      const durationSec = Math.floor(Math.random() * 12 + 18); const rotationDeg = Math.floor(Math.random() * 120 - 60);
      el.style.width = `${size}px`; el.style.height = `${size}px`; el.style.left = `${leftPercent}%`; el.style.bottom = "-80px"; el.style.transform = `rotate(${rotationDeg}deg)`;
      const anim = el.animate([
        { transform: `translate(0, 0) rotate(${rotationDeg}deg)`, opacity: 0 },
        { opacity: 0.15, offset: 0.15 }, { opacity: 0.2, offset: 0.45 },
        { transform: `translate(${(Math.random() - 0.5) * 60}px, -115vh) rotate(${rotationDeg + 45}deg)`, opacity: 0 }
      ], { duration: durationSec * 1000, easing: "cubic-bezier(0.25, 1, 0.5, 1)" });
      this.container.appendChild(el); this.activeElements.add(el);
      anim.onfinish = () => { el.remove(); this.activeElements.delete(el); };
    }
  }

  function showToast(message, duration = 2800) {
    const toast = document.createElement("div"); toast.className = "toast"; toast.textContent = message;
    DOM.toastRegion.appendChild(toast);
    setTimeout(() => { toast.style.opacity = "0"; toast.style.transition = "opacity 200ms ease"; setTimeout(() => toast.remove(), 200); }, duration);
  }

  function parseCSV(text) {
    const rows = []; let row = []; let inQuotes = false; let val = '';
    for (let i = 0; i < text.length; i++) {
      const c = text[i]; const next = text[i+1];
      if (c === '"' && inQuotes && next === '"') { val += '"'; i++; }
      else if (c === '"') { inQuotes = !inQuotes; }
      else if (c === ',' && !inQuotes) { row.push(val); val = ''; }
      else if ((c === '\n' || (c === '\r' && next === '\n')) && !inQuotes) {
        if (c === '\r') i++;
        row.push(val); rows.push(row); row = []; val = '';
      } else { val += c; }
    }
    if (val !== '' || text[text.length-1] === ',') row.push(val);
    if (row.length > 0) rows.push(row);
    return rows;
  }

  function getDayDifference(dateStr, anchorStr) {
    const d1 = new Date(dateStr + "T00:00:00Z");
    const d2 = new Date(anchorStr + "T00:00:00Z");
    return Math.max(1, Math.floor((d1 - d2) / (1000 * 60 * 60 * 24)) + 1);
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  function constructPuzzleObject(p) {
    const targetSlots = [];
    const barRailPool = [];
    for (let i = 1; i <= 5; i++) {
      targetSlots.push({
        slotIndex: i - 1,
        type: p[`slot_${i}_type`],
        component: p[`slot_${i}_text`]
      });
      barRailPool.push({
        id: `t-${p.puzzle_id}-c${i}`,
        text: p[`slot_${i}_text`],
        category: p[`slot_${i}_category`],
        correctSlot: i - 1
      });
      barRailPool.push({
        id: `t-${p.puzzle_id}-d${i}`,
        text: p[`distractor_${i}_text`],
        category: p[`distractor_${i}_category`],
        correctSlot: null
      });
    }
    shuffleArray(barRailPool);
    return {
      id: p.puzzle_id,
      release_date: p.release_date,
      name: p.name,
      era: p.era,
      curriculumCategory: p.category,
      difficulty: p.difficulty,
      clue: p.clue,
      hint: p.hint,
      lore: p.lore,
      targetSlots,
      barRailPool,
      dayNumber: getDayDifference(p.release_date, CONFIG.anchorReleaseDate)
    };
  }

  async function loadApplication() {
    try {
      const csvRes = await fetch(CONFIG.puzzleCsvPath, { cache: 'no-store' });
      if (!csvRes.ok) throw new Error("Puzzle data could not be loaded.");
      const csvText = await csvRes.text();
      const rows = parseCSV(csvText);
      if (rows.length < 2) throw new Error("Puzzle data could not be loaded.");
      
      const headers = rows[0].map(h => h.trim());
      if (headers[0] !== 'release_date') throw new Error("Puzzle data could not be loaded.");
      
      const rawPuzzles = [];
      for (let i = 1; i < rows.length; i++) {
        if (rows[i].length !== headers.length) continue;
        const obj = {};
        headers.forEach((h, idx) => obj[h] = rows[i][idx].trim());
        rawPuzzles.push(obj);
      }

      const url = window.location.href.split('#')[0] + (window.location.href.includes('?') ? '&' : '?') + 'cb=' + Date.now();
      const timeRes = await fetch(url, { method: 'GET', cache: 'no-store' });
      const dateHeader = timeRes.headers.get('Date');
      if (!dateHeader) throw new Error("Today's puzzle could not be verified.");
      const absoluteTime = new Date(dateHeader);
      if (isNaN(absoluteTime.getTime())) throw new Error("Today's puzzle could not be verified.");

      const formatter = new Intl.DateTimeFormat('en-GB', {
        timeZone: CONFIG.releaseTimeZone,
        year: 'numeric', month: '2-digit', day: '2-digit'
      });
      const parts = formatter.formatToParts(absoluteTime);
      const y = parts.find(p => p.type === 'year').value;
      const m = parts.find(p => p.type === 'month').value;
      const d = parts.find(p => p.type === 'day').value;
      AppState.ukDate = `${y}-${m}-${d}`;

      let todayCandidates = [];
      for (const p of rawPuzzles) {
        if (!p.release_date || !p.puzzle_id) continue;
        const puzzleObj = constructPuzzleObject(p);
        if (p.release_date < AppState.ukDate) AppState.vault.push(puzzleObj);
        else if (p.release_date === AppState.ukDate) todayCandidates.push(puzzleObj);
        else AppState.future.push(puzzleObj);
      }

      if (todayCandidates.length === 1) {
        AppState.current = todayCandidates[0];
      } else if (todayCandidates.length > 1) {
        throw new Error("Today's puzzle is not available.");
      } else {
        throw new Error("Today's puzzle is not available.");
      }

      AppState.vault.sort((a, b) => b.release_date.localeCompare(a.release_date));
      
      DOM.errorScreen.classList.add('hidden');
      DOM.app.classList.remove('hidden');
      
      const garnishes = new GarnishManager(DOM.garnishContainer);
      garnishes.start();

      syncSoundUI();
      bindEvents();
      showScreen("menu");

    } catch (e) {
      DOM.app.classList.add('hidden');
      DOM.errorScreen.classList.remove('hidden');
      DOM.errorMessage.textContent = e.message;
    }
  }

  function showScreen(screenId) {
    DOM.viewMenu.classList.add("hidden");
    DOM.viewGame.classList.add("hidden");
    DOM.viewVault.classList.add("hidden");
    
    if (screenId === "menu") {
      DOM.viewMenu.classList.remove("hidden");
      DOM.platformHeader.classList.add("hidden");
      renderMainMenu();
    } else if (screenId === "game") {
      DOM.viewGame.classList.remove("hidden");
      DOM.platformHeader.classList.remove("hidden");
    } else if (screenId === "vault") {
      DOM.viewVault.classList.remove("hidden");
      DOM.platformHeader.classList.remove("hidden");
      renderVaultView();
    }
    window.scrollTo(0, 0);
  }

  function renderMainMenu() {
    const p = AppState.current;
    if (!p) return;
    const record = AppState.store.puzzleHistory[p.id];
    
    DOM.menuTodayDayNumber.textContent = `DAY #${p.dayNumber}`;
    DOM.menuTodayCocktailName.textContent = p.name;

    const attempts = record ? record.attemptsUsed : 0;
    const miniShakers = DOM.menuShakersIndicator.querySelectorAll(".mini-shaker");
    miniShakers.forEach((icon, i) => {
      if (i < attempts) icon.classList.add("lost");
      else icon.classList.remove("lost");
    });

    if (record && record.completed) {
      if (record.won) {
        DOM.menuTodayStatusBadge.textContent = "PASSED ✓";
        DOM.menuTodayStatusBadge.className = "badge gold-badge";
        DOM.menuTodayActionText.textContent = "VIEW REPORT";
      } else {
        DOM.menuTodayStatusBadge.textContent = "FAILED ✗";
        DOM.menuTodayStatusBadge.className = "badge diff-badge";
        DOM.menuTodayActionText.textContent = "VIEW SPEC";
      }
    } else if (record && record.attemptsUsed > 0) {
      DOM.menuTodayStatusBadge.textContent = `IN PROGRESS`;
      DOM.menuTodayStatusBadge.className = "badge tag-badge";
      DOM.menuTodayActionText.textContent = "RESUME";
    } else {
      DOM.menuTodayStatusBadge.textContent = "READY";
      DOM.menuTodayStatusBadge.className = "badge diff-badge";
      DOM.menuTodayActionText.textContent = "PLAY";
    }

    DOM.menuVaultCountBadge.textContent = `${AppState.vault.length} SHIFT${AppState.vault.length === 1 ? "" : "S"}`;
  }

  function loadPuzzle(puzzle, isVault = false) {
    AppState.activePuzzle = puzzle;
    AppState.isVaultMode = isVault;
    AppState.selectedSlot = 0;

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

    DOM.puzzleDayBadge.textContent = `DAY #${puzzle.dayNumber}`;
    DOM.puzzleCategoryBadge.textContent = puzzle.curriculumCategory || "COCKTAIL";
    DOM.puzzleDiffBadge.textContent = puzzle.difficulty.toUpperCase();
    DOM.ticketNumber.textContent = String(puzzle.dayNumber).padStart(3, "0");
    DOM.cocktailEra.textContent = puzzle.era || "";
    DOM.cocktailName.textContent = puzzle.name;
    DOM.cocktailClue.textContent = `"${puzzle.clue}"`;

    renderShakers();
    renderSlots();
    renderBarRail();

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
      if (i < AppState.attemptsUsed) icon.classList.add("lost");
      else icon.classList.remove("lost");
    });
    const txt = DOM.btnSubmitSpec.querySelector(".btn-text");
    if (txt) {
      txt.textContent = AppState.isCompleted ? "VIEW REPORT" : `TEST`;
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
        const span = document.createElement("span"); span.className = "slotted-tile-view"; span.textContent = correctTarget.component;
        holder.appendChild(span);
      } else if (drafted) {
        const span = document.createElement("span"); span.className = "slotted-tile-view"; span.textContent = drafted.text;
        holder.appendChild(span);
      } else {
        const ph = document.createElement("span"); ph.className = "slot-placeholder"; ph.textContent = `Select`;
        holder.appendChild(ph);
      }
      if (!AppState.isCompleted && !isLocked && idx === AppState.selectedSlot) slotEl.classList.add("selected");
    });
  }

  function renderBarRail() {
    DOM.barRailTiles.innerHTML = "";
    const pool = AppState.activePuzzle.barRailPool;
    const placedTileIds = new Set();
    AppState.currentDraft.forEach(t => { if (t) placedTileIds.add(t.id); });

    pool.forEach(tile => {
      const btn = document.createElement("button"); btn.type = "button"; btn.className = "rail-tile";
      const cat = document.createElement("span"); cat.className = "rail-tile-category"; cat.textContent = tile.category;
      const label = document.createElement("span"); label.textContent = tile.text;
      btn.appendChild(cat); btn.appendChild(label);
      if (placedTileIds.has(tile.id)) {
        btn.classList.add("used"); btn.setAttribute("aria-disabled", "true"); btn.tabIndex = -1;
      } else {
        btn.addEventListener("click", () => handleTileSelection(tile));
      }
      DOM.barRailTiles.appendChild(btn);
    });
  }

  function updateControlButtons() {
    if (AppState.isCompleted) {
      DOM.btnSubmitSpec.querySelector(".btn-text").textContent = "VIEW REPORT";
      DOM.btnClearDraft.style.display = "none";
    } else {
      DOM.btnSubmitSpec.querySelector(".btn-text").textContent = "TEST";
      DOM.btnClearDraft.style.display = "inline-block";
    }
  }

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
    let nextSlot = -1;
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) { nextSlot = i; break; }
    }
    if (nextSlot !== -1) AppState.selectedSlot = nextSlot;
    renderSlots(); renderBarRail();
  }

  function handleSlotClick(slotIndex) {
    if (AppState.isCompleted) return;
    if (AppState.lockedSlots[slotIndex]) { showToast("This slot is already authenticated and locked."); return; }
    if (AppState.currentDraft[slotIndex]) {
      audio.playTileTap(); AppState.currentDraft[slotIndex] = null; AppState.selectedSlot = slotIndex;
      renderSlots(); renderBarRail(); return;
    }
    selectSlot(slotIndex);
  }

  function clearUnlockedDraft() {
    if (AppState.isCompleted) return;
    audio.playTileTap();
    for (let i = 0; i < SLOTS_COUNT; i++) { if (!AppState.lockedSlots[i]) AppState.currentDraft[i] = null; }
    const firstUnlocked = AppState.lockedSlots.findIndex(l => !l);
    AppState.selectedSlot = firstUnlocked !== -1 ? firstUnlocked : 0;
    renderSlots(); renderBarRail(); showToast("Draft cleared.");
  }

  function submitSpecification() {
    if (AppState.isCompleted) { openResultModal(); return; }
    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (!AppState.lockedSlots[i] && !AppState.currentDraft[i]) {
        showToast("Fill all 5 slots before testing.");
        const missingSlotEl = DOM.slots[i];
        missingSlotEl.classList.add("miss-flash");
        setTimeout(() => missingSlotEl.classList.remove("miss-flash"), 420);
        return;
      }
    }

    AppState.attemptsUsed++;
    let newlyMatchedCount = 0;
    const attemptRoundResult = [];

    for (let i = 0; i < SLOTS_COUNT; i++) {
      if (AppState.lockedSlots[i]) { attemptRoundResult.push("hit"); continue; }
      const placedTile = AppState.currentDraft[i];
      if (placedTile && placedTile.correctSlot === i) {
        AppState.lockedSlots[i] = true; newlyMatchedCount++; attemptRoundResult.push("hit");
      } else {
        attemptRoundResult.push("miss"); AppState.currentDraft[i] = null;
        const slotEl = DOM.slots[i]; slotEl.classList.add("miss-flash");
        setTimeout(() => slotEl.classList.remove("miss-flash"), 450);
      }
    }

    AppState.historyGrid.push(attemptRoundResult);
    if (newlyMatchedCount > 0) audio.playLockSuccess(); else audio.playMiss();
    renderShakers(); renderSlots(); renderBarRail();

    const areAllLocked = AppState.lockedSlots.every(l => l === true);
    if (areAllLocked) {
      AppState.isCompleted = true; AppState.isWon = true; audio.playVictoryChord();
      saveGameProgress(); recordStats(true, AppState.attemptsUsed);
      setTimeout(openResultModal, 700); return;
    }

    if (AppState.attemptsUsed >= MAX_ATTEMPTS) {
      AppState.isCompleted = true; AppState.isWon = false; audio.playMiss();
      AppState.lockedSlots = [true, true, true, true, true]; renderSlots();
      saveGameProgress(); recordStats(false, AppState.attemptsUsed);
      setTimeout(openResultModal, 750); return;
    }

    if (AppState.attemptsUsed >= 2) {
      DOM.hintBox.classList.remove("hidden");
      DOM.hintText.textContent = AppState.activePuzzle.hint;
    }
    const firstFree = AppState.lockedSlots.findIndex(l => !l);
    if (firstFree !== -1) AppState.selectedSlot = firstFree;
    renderSlots(); saveGameProgress();
  }

  function saveGameProgress() {
    AppState.store.puzzleHistory[AppState.activePuzzle.id] = {
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
    if (AppState.isVaultMode) return;
    const stats = AppState.store.stats;
    stats.played++;
    if (won) {
      stats.won++; stats.currentStreak++;
      if (stats.currentStreak > stats.maxStreak) stats.maxStreak = stats.currentStreak;
      if (stats.distribution[attempts] !== undefined) stats.distribution[attempts]++;
    } else {
      stats.currentStreak = 0;
    }
    saveStorageData(AppState.store);
  }

  function openResultModal() {
    const p = AppState.activePuzzle;
    DOM.resultCocktailName.textContent = p.name;
    if (AppState.isWon) {
      DOM.resultStatusBadge.textContent = "PASSED ✓"; DOM.resultStatusBadge.className = "badge gold-badge";
      DOM.modalResultTitle.textContent = "APPROVED";
    } else {
      DOM.resultStatusBadge.textContent = "FAILED ✗"; DOM.resultStatusBadge.className = "badge diff-badge";
      DOM.modalResultTitle.textContent = "RETIRED";
    }
    DOM.shareGridPreview.innerHTML = "";
    AppState.historyGrid.forEach(round => {
      const row = document.createElement("div"); row.className = "share-grid-row";
      round.forEach(state => {
        const dot = document.createElement("span"); dot.className = `share-dot ${state === "hit" ? "hit" : "miss"}`; row.appendChild(dot);
      });
      DOM.shareGridPreview.appendChild(row);
    });

    DOM.authoritativeSpecsList.innerHTML = "";
    p.targetSlots.forEach(slot => {
      const li = document.createElement("li"); const st = document.createElement("strong"); st.textContent = slot.type + ":";
      const val = document.createElement("span"); val.textContent = slot.component;
      li.appendChild(st); li.appendChild(val); DOM.authoritativeSpecsList.appendChild(li);
    });
    DOM.loreBodyText.textContent = p.lore; DOM.loreCurriculumCategory.textContent = p.curriculumCategory;
    DOM.modalResult.classList.remove("hidden");
  }

  function generateShareSnippet() {
    const dayDisplay = AppState.activePuzzle.dayNumber;
    const scoreText = AppState.isWon ? `${AppState.attemptsUsed}/${MAX_ATTEMPTS}` : "X/4";
    let text = `🍸 COCKTAIL SPECS CARD #${dayDisplay} — ${scoreText}\n`;
    AppState.historyGrid.forEach(round => { text += `${round.map(s => (s === "hit" ? "🟩" : "⬛")).join("")}\n`; });
    text += `Test your bar knowledge: https://tileworksgamesstudio.github.io/86/`;
    return text;
  }

  function handleShare() {
    const snippet = generateShareSnippet();
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(snippet).then(() => showToast("Report copied to clipboard!")).catch(() => window.prompt("Copy report:", snippet));
    } else { window.prompt("Copy report:", snippet); }
  }

  function renderVaultView() {
    DOM.vaultList.innerHTML = "";
    if (AppState.vault.length === 0) {
      const emptyDiv = document.createElement("div"); emptyDiv.className = "vault-empty-notice";
      emptyDiv.innerHTML = `<span style="font-size: 2.2rem; display:block; margin-bottom:8px;" aria-hidden="true">🗝️</span><h3>EMPTY</h3><p>Past shifts will appear here.</p>`;
      DOM.vaultList.appendChild(emptyDiv); return;
    }
    AppState.vault.forEach(puzzle => {
      const record = AppState.store.puzzleHistory[puzzle.id];
      const card = document.createElement("div"); card.className = "vault-card"; card.tabIndex = 0; card.setAttribute("role", "button");
      const left = document.createElement("div"); left.style.display = "flex"; left.style.flexDirection = "column"; left.style.gap = "3px";
      const dayLabel = document.createElement("span"); dayLabel.className = "vault-card-day"; dayLabel.textContent = `DAY #${puzzle.dayNumber}`;
      const name = document.createElement("h3"); name.className = "vault-card-name"; name.textContent = puzzle.name;
      left.appendChild(dayLabel); left.appendChild(name);
      const statusSpan = document.createElement("span"); statusSpan.className = "vault-card-status";
      if (record && record.completed) {
        if (record.won) { statusSpan.classList.add("cleared"); statusSpan.textContent = `PASSED (${record.attemptsUsed}/4)`; }
        else { statusSpan.classList.add("attempted"); statusSpan.textContent = "FAILED (X/4)"; }
      } else { statusSpan.classList.add("unplayed"); statusSpan.textContent = "UNPLAYED"; }
      card.appendChild(left); card.appendChild(statusSpan);
      const launch = () => loadPuzzle(puzzle, true);
      card.addEventListener("click", launch);
      card.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); launch(); } });
      DOM.vaultList.appendChild(card);
    });
  }

  function openStatsModal() {
    const s = AppState.store.stats;
    DOM.statPlayed.textContent = s.played;
    DOM.statWinRate.textContent = `${s.played > 0 ? Math.round((s.won / s.played) * 100) : 0}%`;
    DOM.statCurrentStreak.textContent = s.currentStreak;
    DOM.statMaxStreak.textContent = s.maxStreak;
    DOM.statsDistribution.innerHTML = "";
    const maxVal = Math.max(1, ...Object.values(s.distribution));
    for (let i = 1; i <= MAX_ATTEMPTS; i++) {
      const val = s.distribution[i] || 0; const pct = Math.max(8, Math.round((val / maxVal) * 100));
      const row = document.createElement("div"); row.className = "dist-row";
      const label = document.createElement("span"); label.style.width = "18px"; label.style.fontWeight = "700"; label.textContent = i;
      const barWrap = document.createElement("div"); barWrap.className = "dist-bar-wrap";
      const bar = document.createElement("div"); bar.className = "dist-bar"; bar.style.width = `${pct}%`; bar.textContent = val;
      if (AppState.isWon && AppState.attemptsUsed === i && !AppState.isVaultMode) bar.classList.add("highlight");
      barWrap.appendChild(bar); row.appendChild(label); row.appendChild(barWrap); DOM.statsDistribution.appendChild(row);
    }
    DOM.modalStats.classList.remove("hidden");
  }

  function toggleSound() {
    audio.enabled = !audio.enabled; AppState.store.soundEnabled = audio.enabled; saveStorageData(AppState.store);
    syncSoundUI(); showToast(`Sound: ${audio.enabled ? "ON" : "MUTED"}`);
    if (audio.enabled) audio.playTileTap();
  }

  function syncSoundUI() {
    const icon = audio.enabled ? "🔊" : "🔇";
    DOM.soundIcon.textContent = icon; DOM.menuSoundIcon.textContent = icon;
    DOM.menuSoundLabel.textContent = audio.enabled ? "SOUND" : "MUTED";
    DOM.navSoundBtn.setAttribute("aria-pressed", audio.enabled ? "true" : "false");
  }

  function bindEvents() {
    DOM.btnRetry.addEventListener("click", () => window.location.reload());
    DOM.menuTodayCard.addEventListener("click", () => { if(AppState.current) loadPuzzle(AppState.current, false); });
    DOM.menuTodayCard.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); DOM.menuTodayCard.click(); } });
    DOM.menuBtnVault.addEventListener("click", () => showScreen("vault"));
    DOM.menuBtnStats.addEventListener("click", openStatsModal);
    DOM.menuBtnHelp.addEventListener("click", () => DOM.modalHelp.classList.remove("hidden"));
    DOM.menuBtnSound.addEventListener("click", toggleSound);
    DOM.btnBackToMenu.addEventListener("click", () => showScreen("menu"));
    DOM.btnVaultBackMenu.addEventListener("click", () => showScreen("menu"));
    DOM.navStatsBtn.addEventListener("click", openStatsModal);
    DOM.navHelpBtn.addEventListener("click", () => DOM.modalHelp.classList.remove("hidden"));
    DOM.navSoundBtn.addEventListener("click", toggleSound);
    DOM.slots.forEach(slotEl => {
      const idx = parseInt(slotEl.dataset.slot, 10);
      slotEl.addEventListener("click", () => handleSlotClick(idx));
      slotEl.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); handleSlotClick(idx); } });
    });
    DOM.btnClearDraft.addEventListener("click", clearUnlockedDraft);
    DOM.btnSubmitSpec.addEventListener("click", submitSpecification);
    DOM.btnCloseResult.addEventListener("click", () => DOM.modalResult.classList.add("hidden"));
    DOM.btnShareResult.addEventListener("click", handleShare);
    DOM.btnResultMenu.addEventListener("click", () => { DOM.modalResult.classList.add("hidden"); showScreen("menu"); });
    DOM.btnResultVault.addEventListener("click", () => { DOM.modalResult.classList.add("hidden"); showScreen("vault"); });
    DOM.btnCloseHelp.addEventListener("click", () => DOM.modalHelp.classList.add("hidden"));
    DOM.btnHelpStart.addEventListener("click", () => DOM.modalHelp.classList.add("hidden"));
    DOM.btnCloseStats.addEventListener("click", () => DOM.modalStats.classList.add("hidden"));
    DOM.btnStatsClose.addEventListener("click", () => DOM.modalStats.classList.add("hidden"));

    window.addEventListener("keydown", (e) => {
      if (!DOM.modalResult.classList.contains("hidden") || !DOM.modalHelp.classList.contains("hidden") || !DOM.modalStats.classList.contains("hidden")) {
        if (e.key === "Escape") { DOM.modalResult.classList.add("hidden"); DOM.modalHelp.classList.add("hidden"); DOM.modalStats.classList.add("hidden"); } return;
      }
      if (!DOM.viewGame.classList.contains("hidden")) {
        if (e.key >= "1" && e.key <= "5") { selectSlot(parseInt(e.key, 10) - 1); }
        else if (e.key === "Enter") { submitSpecification(); }
        else if (e.key === "Backspace" || e.key === "Delete") { if (AppState.currentDraft[AppState.selectedSlot]) handleSlotClick(AppState.selectedSlot); }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", loadApplication);
})();