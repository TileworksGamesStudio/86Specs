/**
 * SPEC CARDS — COMPLETE GAME ENGINE & KNOWLEDGE ARCHITECTURE
 * Mobile-First Cocktail Specification Engine with Robust LocalStorage Persistence.
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. LOCAL STORAGE PERSISTENCE ENGINE
     ========================================================================== */
  const STORAGE_KEY = "speccards_app_data_v1";

  const defaultStorageData = {
    version: 1,
    sound: "on",
    preferredMode: "classic",
    highScore: 0,
    bestStreak: 0,
    totalCompleted: 0,
    correctCount: 0,
    totalAttempts: 0
  };

  function loadStoredState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return { ...defaultStorageData };
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) return { ...defaultStorageData };
      return { ...defaultStorageData, ...parsed };
    } catch {
      return { ...defaultStorageData };
    }
  }

  function saveStoredState(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* Private mode fallback */
    }
  }

  const persistentData = loadStoredState();

  /* ==========================================================================
     2. SYNTHETIC AUDIO ENGINE (Web Audio API)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = persistentData.sound === "off";
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume().catch(() => {});
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      persistentData.sound = this.muted ? "off" : "on";
      saveStoredState(persistentData);
      return this.muted;
    }

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sine";
        osc.frequency.setValueAtTime(620, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
      } catch {}
    }

    playCorrect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          osc.type = "triangle";
          osc.frequency.setValueAtTime(freq, t + idx * 0.055);
          gain.gain.setValueAtTime(0, t);
          gain.gain.setValueAtTime(0.14, t + idx * 0.055);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.055 + 0.3);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + idx * 0.055);
          osc.stop(t + idx * 0.055 + 0.32);
        });
      } catch {}
    }

    playWrong() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      try {
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(145, t);
        osc.frequency.exponentialRampToValueAtTime(85, t + 0.22);
        gain.gain.setValueAtTime(0.16, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.22);
      } catch {}
    }
  }

  const audio = new SoundEngine();

  /* ==========================================================================
     3. SVG GLASSWARE ATLAS
     ========================================================================== */
  const GLASS_SVGS = {
    Coupe: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M6 14 C12 28 36 28 42 14 Z" />
      <line x1="24" y1="26" x2="24" y2="40" />
      <line x1="15" y1="40" x2="33" y2="40" />
    </svg>`,
    Rocks: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="10,10 38,10 35,40 13,40" />
      <line x1="14" y1="20" x2="34" y2="20" stroke-dasharray="2 2" opacity="0.6"/>
    </svg>`,
    Highball: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="14,8 34,8 32,42 16,42" />
      <line x1="15" y1="18" x2="33" y2="18" stroke-dasharray="2 2" opacity="0.6"/>
    </svg>`,
    Martini: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="6,12 42,12 24,28" />
      <line x1="24" y1="28" x2="24" y2="40" />
      <line x1="14" y1="40" x2="34" y2="40" />
    </svg>`,
    "Nick & Nora": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M12 12 C12 24 36 24 36 12 Z" />
      <line x1="24" y1="24" x2="24" y2="40" />
      <line x1="16" y1="40" x2="32" y2="40" />
    </svg>`
  };

  /* ==========================================================================
     4. COCKTAIL DATASET LIBRARY
     ========================================================================== */
  const SPEC_DATASET = [
    {
      id: "whiskey-sour",
      name: "Whiskey Sour",
      family: "Sour",
      era: "1860s • American Classic",
      baseSpirit: "Bourbon or Rye Whiskey",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Shake (Dry Shake first)",
      garnish: "Angostura Drops & Lemon Twist",
      footnote: "Egg white requires a dry shake (no ice) to build protein emulsion prior to chilling.",
      spec: [
        { measure: "2.0 oz", name: "Bourbon or Rye Whiskey", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Rich Simple Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "1 dash", name: "Egg White (Optional)", role: "Textural Agent" }
      ],
      challenge: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Restore the missing core base spirit:",
        correctAnswer: "Bourbon or Rye Whiskey",
        options: [
          "Bourbon or Rye Whiskey",
          "London Dry Gin",
          "Blanco Tequila",
          "Aged Dark Rum"
        ],
        hint: "This spirit provides the oak tannins and proof necessary to balance fresh lemon.",
        diagnosis: "Bourbon or rye whiskey supplies the proof and barrel sweetness necessary to balance 0.75 oz lemon and rich simple syrup."
      }
    },
    {
      id: "negroni",
      name: "Negroni",
      family: "Bitter / Aperitivo",
      era: "1919 • Caffè Casoni, Florence",
      baseSpirit: "London Dry Gin",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Stir Thoroughly",
      garnish: "Expressed Orange Peel",
      footnote: "Equal-part construction relying on thermal chilling and controlled dilution over dense ice.",
      spec: [
        { measure: "1.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Campari", role: "Bitter Aperitif" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" }
      ],
      challenge: {
        type: "measure",
        targetIndex: 1,
        prompt: "Specify the canonical pour measure for Campari:",
        correctAnswer: "1.0 oz",
        options: ["1.0 oz", "0.5 oz", "1.5 oz", "2.0 oz"],
        hint: "The classic Negroni is built on strict equal-parts harmony.",
        diagnosis: "A canonical Negroni demands equal parts (1.0 oz each) of gin, Campari, and sweet vermouth."
      }
    },
    {
      id: "old-fashioned",
      name: "Old Fashioned",
      family: "Old Fashioned",
      era: "1880s • Pendennis Club / Louisville",
      baseSpirit: "Rye or Bourbon Whiskey",
      glass: "Rocks",
      ice: "Large Clear Cube",
      method: "Stir Thoroughly",
      garnish: "Expressed Orange & Brandied Cherry",
      footnote: "The primogenitor formula: spirit, sugar, water (ice dilution), and aromatic bitters.",
      spec: [
        { measure: "2.0 oz", name: "Rye or Bourbon Whiskey", role: "Base Spirit" },
        { measure: "1 barspoon", name: "Demerara Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "2 dashes", name: "Angostura Aromatic Bitters", role: "Bitter Accent" }
      ],
      challenge: {
        type: "method",
        targetIndex: -1,
        prompt: "Specify the proper technique and service parameter:",
        correctAnswer: "Stir Thoroughly",
        options: [
          "Stir Thoroughly",
          "Hard Shake & Fine Strain",
          "Build in Glass & Top with Soda",
          "Muddle & Flash Blend"
        ],
        hint: "Spirit-forward drinks without citrus juices require gentle stirring to prevent cloudiness.",
        diagnosis: "Stirring gently incorporates cold dilution without chipping ice or introducing aeration."
      }
    },
    {
      id: "margarita",
      name: "Margarita",
      family: "Daisy",
      era: "1930s • Mexican Classic",
      baseSpirit: "Blanco Tequila (100% Agave)",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Hard Shake",
      garnish: "Lime Wheel & Half-Salt Rim",
      footnote: "A classic Daisy: spirit, citrus acid, and an orange liqueur cordial modifier.",
      spec: [
        { measure: "2.0 oz", name: "Blanco Tequila", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth (FLAW)", role: "Modifier Error" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      challenge: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Sweet Red Vermouth",
        correctIngredientName: "Cointreau / Orange Liqueur",
        prompt: "DIAGNOSTIC AUDIT: Identify the deliberate recipe violation:",
        correctAnswer: "Modifier Flaw: Replace Sweet Vermouth with Cointreau",
        options: [
          "Modifier Flaw: Replace Sweet Vermouth with Cointreau",
          "Base Spirit Flaw: Should be London Dry Gin",
          "Glassware Flaw: Must be served in a Champagne Flute",
          "Service Flaw: Method should be stirred over crushed ice"
        ],
        hint: "A Daisy cocktail balances citrus with an orange liqueur, never fortified wine.",
        diagnosis: "The Margarita is an agave Daisy; it requires orange liqueur (Cointreau or triple sec) as the sweetener."
      }
    },
    {
      id: "dry-martini",
      name: "Dry Martini",
      family: "Martini",
      era: "Turn of 20th Century • American Classic",
      baseSpirit: "London Dry Gin",
      glass: "Martini",
      ice: "None (Pre-chilled Stemware)",
      method: "Stir Thoroughly",
      garnish: "Lemon Twist or Castelvetrano Olive",
      footnote: "Stirring protects botanical clarity and produces a dense, crystal-clear spirit texture.",
      spec: [
        { measure: "2.5 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Dry French Vermouth", role: "Fortified Modifier" },
        { measure: "1 dash", name: "Orange Bitters", role: "Aromatic Accent" }
      ],
      challenge: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Specify the fortified wine modifier that completes the Dry Martini:",
        correctAnswer: "Dry French Vermouth",
        options: [
          "Dry French Vermouth",
          "Sweet Red Vermouth",
          "Green Chartreuse",
          "Maraschino Liqueur"
        ],
        hint: "This dry aromatized wine from France softens juniper proof without adding dark sugar.",
        diagnosis: "Dry French vermouth imparts herbal acidity to round out gin without masking its crisp botanical profile."
      }
    }
  ];

  /* ==========================================================================
     5. APPLICATION STATE
     ========================================================================== */
  const state = {
    currentView: "menu", // "menu" or "gameplay"
    mode: persistentData.preferredMode || "classic",
    currentTicketIndex: 0,
    totalTickets: SPEC_DATASET.length,
    activeChallenge: null,
    selectedConfidence: "certain",
    shiftScore: 0,
    streak: 0,
    answered: false,
    shiftFinished: false
  };

  /* ==========================================================================
     6. DOM ELEMENT REPOSITORY
     ========================================================================== */
  const DOM = {
    // Views
    mainMenuView: document.getElementById("mainMenuView"),
    gameplayView: document.getElementById("gameplayView"),

    // Menu Elements
    menuRankBadge: document.getElementById("menuRankBadge"),
    menuAccuracyPill: document.getElementById("menuAccuracyPill"),
    menuHighscoreVal: document.getElementById("menuHighscoreVal"),
    menuBestStreakVal: document.getElementById("menuBestStreakVal"),
    menuCertifiedVal: document.getElementById("menuCertifiedVal"),
    btnStartClassic: document.getElementById("btnStartClassic"),
    btnStartRepair: document.getElementById("btnStartRepair"),
    btnStartFamily: document.getElementById("btnStartFamily"),
    btnMenuOpenCodex: document.getElementById("btnMenuOpenCodex"),
    btnMenuSoundToggle: document.getElementById("btnMenuSoundToggle"),
    menuSoundIcon: document.getElementById("menuSoundIcon"),
    menuSoundLabel: document.getElementById("menuSoundLabel"),

    // Gameplay Header / HUD
    btnBackToMenu: document.getElementById("btnBackToMenu"),
    streakVal: document.getElementById("streakVal"),
    scoreVal: document.getElementById("scoreVal"),
    btnAudioToggle: document.getElementById("btnAudioToggle"),
    iconSoundOn: document.getElementById("iconSoundOn"),
    iconSoundOff: document.getElementById("iconSoundOff"),
    btnOpenMenu: document.getElementById("btnOpenMenu"),
    modeTabs: document.querySelectorAll(".mode-tab"),
    modeBadge: document.getElementById("modeBadge"),
    roundCounter: document.getElementById("roundCounter"),
    diffBadge: document.getElementById("diffBadge"),

    // Spec Card
    specCard: document.getElementById("specCard"),
    cardFamily: document.getElementById("cardFamily"),
    cardTitle: document.getElementById("cardTitle"),
    cardEra: document.getElementById("cardEra"),
    glassSvgSlot: document.getElementById("glassSvgSlot"),
    cardGlassCaption: document.getElementById("cardGlassCaption"),
    ingredientList: document.getElementById("ingredientList"),
    paramMethodVal: document.getElementById("paramMethodVal"),
    paramIceVal: document.getElementById("paramIceVal"),
    paramGarnishVal: document.getElementById("paramGarnishVal"),
    paramMethodCell: document.getElementById("paramMethodCell"),
    footnoteText: document.getElementById("footnoteText"),

    // Interaction Deck
    deckPrompt: document.getElementById("deckPrompt"),
    btnHint: document.getElementById("btnHint"),
    choiceMatrix: document.getElementById("choiceMatrix"),
    confidenceBar: document.getElementById("confidenceBar"),
    confButtons: document.querySelectorAll(".conf-btn"),
    diagnosisTray: document.getElementById("diagnosisTray"),
    diagBadge: document.getElementById("diagBadge"),
    diagPoints: document.getElementById("diagPoints"),
    diagReason: document.getElementById("diagReason"),
    btnNextTicket: document.getElementById("btnNextTicket"),
    btnNextText: document.getElementById("btnNextText"),

    // Modal Drawer
    modalBackdrop: document.getElementById("modalBackdrop"),
    btnCloseModal: document.getElementById("btnCloseModal"),
    subnavButtons: document.querySelectorAll(".subnav-btn"),
    modalPanes: document.querySelectorAll(".modal-pane"),
    codexSearch: document.getElementById("codexSearch"),
    codexGrid: document.getElementById("codexGrid"),
    stMasteryRank: document.getElementById("stMasteryRank"),
    stTotalPassed: document.getElementById("stTotalPassed"),
    stAccuracy: document.getElementById("stAccuracy"),
    stBestStreak: document.getElementById("stBestStreak"),
    familyMeterList: document.getElementById("familyMeterList"),
    glassAtlasGrid: document.getElementById("glassAtlasGrid"),
    guideFamiliesList: document.getElementById("guideFamiliesList"),
    btnResetProgress: document.getElementById("btnResetProgress")
  };

  /* ==========================================================================
     7. VIEW SWITCHING & NAVIGATION
     ========================================================================== */
  function showView(viewName) {
    state.currentView = viewName;
    if (viewName === "menu") {
      DOM.gameplayView.classList.add("hidden-view");
      DOM.gameplayView.classList.remove("active-view");
      DOM.mainMenuView.classList.remove("hidden-view");
      DOM.mainMenuView.classList.add("active-view");
      updateMenuSummary();
    } else {
      DOM.mainMenuView.classList.add("hidden-view");
      DOM.mainMenuView.classList.remove("active-view");
      DOM.gameplayView.classList.remove("hidden-view");
      DOM.gameplayView.classList.add("active-view");
    }
  }

  function startShiftMode(modeName) {
    audio.playClick();
    state.mode = modeName;
    persistentData.preferredMode = modeName;
    saveStoredState(persistentData);

    state.currentTicketIndex = 0;
    state.shiftScore = 0;
    state.streak = 0;
    state.shiftFinished = false;
    DOM.btnNextText.textContent = "NEXT TICKET";

    if (modeName === "repair") {
      state.currentTicketIndex = 3; // Direct to diagnostic Margarita ticket
    } else {
      state.currentTicketIndex = 0;
    }

    // Sync mode tabs UI
    DOM.modeTabs.forEach(tab => {
      const isMatch = tab.dataset.mode === modeName;
      tab.classList.toggle("active", isMatch);
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    showView("gameplay");
    renderTicket();
  }

  /* ==========================================================================
     8. GAME ENGINE & TICKET RENDERING
     ========================================================================== */
  function renderTicket() {
    state.answered = false;
    DOM.diagnosisTray.classList.add("hidden");
    DOM.choiceMatrix.classList.remove("hidden");
    DOM.confidenceBar.classList.remove("hidden");
    DOM.btnHint.disabled = false;

    // Trigger card enter animation
    DOM.specCard.classList.remove("card-enter");
    void DOM.specCard.offsetWidth;
    DOM.specCard.classList.add("card-enter");

    const cocktail = SPEC_DATASET[state.currentTicketIndex];
    state.activeChallenge = cocktail;

    // Masthead
    DOM.cardFamily.textContent = `${cocktail.family} FAMILY`;
    DOM.cardTitle.textContent = cocktail.name;
    DOM.cardEra.textContent = cocktail.era;

    // Glassware
    DOM.cardGlassCaption.textContent = cocktail.glass;
    DOM.glassSvgSlot.innerHTML = GLASS_SVGS[cocktail.glass] || GLASS_SVGS["Coupe"];

    // Parameters
    DOM.paramMethodCell.classList.remove("is-blank-target");
    if (cocktail.challenge.type === "method") {
      DOM.paramMethodCell.classList.add("is-blank-target");
      DOM.paramMethodVal.innerHTML = `<span class="blank-slot" style="min-width:58px; height:14px;"></span>`;
    } else {
      DOM.paramMethodVal.textContent = cocktail.method.toUpperCase();
    }

    DOM.paramIceVal.textContent = cocktail.ice.toUpperCase();
    DOM.paramGarnishVal.textContent = cocktail.garnish.toUpperCase();
    DOM.footnoteText.textContent = cocktail.footnote;

    // Ingredients List
    DOM.ingredientList.innerHTML = "";
    cocktail.spec.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "spec-item";

      const isTarget = (cocktail.challenge.targetIndex === idx);
      const isTroubleshoot = (cocktail.challenge.type === "troubleshoot" && isTarget);

      if (isTroubleshoot) {
        li.classList.add("is-flawed-target");
      } else if (isTarget && cocktail.challenge.type !== "method") {
        li.classList.add("is-blank-target");
      }

      const measureSpan = document.createElement("span");
      measureSpan.className = "spec-measure";
      if (isTarget && cocktail.challenge.type === "measure") {
        measureSpan.innerHTML = `<span class="blank-slot" style="min-width:42px;"></span>`;
      } else {
        measureSpan.textContent = item.measure;
      }

      const nameRoleWrap = document.createElement("div");
      nameRoleWrap.className = "spec-name-role";

      const nameSpan = document.createElement("span");
      nameSpan.className = "spec-name";

      if (isTroubleshoot) {
        nameSpan.textContent = cocktail.challenge.flawIngredientDisplay;
      } else if (isTarget && cocktail.challenge.type === "ingredient") {
        nameSpan.innerHTML = `<span class="blank-slot"></span>`;
      } else {
        nameSpan.textContent = item.name;
      }

      const roleSpan = document.createElement("span");
      roleSpan.className = "spec-role-tag";
      roleSpan.textContent = item.role;

      nameRoleWrap.appendChild(nameSpan);
      nameRoleWrap.appendChild(roleSpan);

      li.appendChild(measureSpan);
      li.appendChild(nameRoleWrap);
      DOM.ingredientList.appendChild(li);
    });

    DOM.deckPrompt.textContent = cocktail.challenge.prompt;
    renderChoices(cocktail.challenge.options);
    updateHUD();
  }

  function renderChoices(options) {
    DOM.choiceMatrix.innerHTML = "";
    options.forEach((optText, index) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.type = "button";
      btn.dataset.choice = optText;

      const label = document.createElement("span");
      label.className = "choice-text";
      label.textContent = optText;

      const kbd = document.createElement("span");
      kbd.className = "choice-kbd";
      kbd.textContent = `${index + 1}`;

      btn.appendChild(label);
      btn.appendChild(kbd);

      btn.addEventListener("click", () => handleAnswer(optText, btn));
      DOM.choiceMatrix.appendChild(btn);
    });
  }

  function updateHUD() {
    DOM.roundCounter.textContent = `TICKET #${state.currentTicketIndex + 1} / ${state.totalTickets}`;
    DOM.streakVal.textContent = state.streak;
    DOM.scoreVal.textContent = state.shiftScore;

    if (state.mode === "repair") {
      DOM.modeBadge.textContent = "TROUBLESHOOT";
    } else if (state.mode === "family") {
      DOM.modeBadge.textContent = "FAMILY DRILL";
    } else {
      DOM.modeBadge.textContent = "CLASSIC SHIFT";
    }

    if (state.streak >= 8) DOM.diffBadge.textContent = "GRANDMASTER";
    else if (state.streak >= 4) DOM.diffBadge.textContent = "MIXOLOGIST";
    else if (state.streak >= 2) DOM.diffBadge.textContent = "SENIOR";
    else DOM.diffBadge.textContent = "APPRENTICE";
  }

  /* ==========================================================================
     9. ANSWER EVALUATION & FEEDBACK
     ========================================================================== */
  function handleAnswer(chosenText, chosenButton) {
    if (state.answered) return;
    state.answered = true;
    persistentData.totalAttempts++;

    const currentChallenge = state.activeChallenge.challenge;
    const isCorrect = (chosenText === currentChallenge.correctAnswer);

    const buttons = DOM.choiceMatrix.querySelectorAll(".choice-btn");
    buttons.forEach(b => (b.disabled = true));

    let confMultiplier = 1.0;
    if (state.selectedConfidence === "certain") confMultiplier = 1.5;
    if (state.selectedConfidence === "guess") confMultiplier = 0.5;

    if (isCorrect) {
      audio.playCorrect();
      chosenButton.classList.add("is-correct");

      state.streak++;
      if (state.streak > persistentData.bestStreak) {
        persistentData.bestStreak = state.streak;
      }
      persistentData.correctCount++;
      persistentData.totalCompleted++;

      const basePoints = 100;
      const streakBonus = (state.streak - 1) * 25;
      const pointsEarned = Math.round((basePoints + streakBonus) * confMultiplier);
      state.shiftScore += pointsEarned;

      if (state.shiftScore > persistentData.highScore) {
        persistentData.highScore = state.shiftScore;
      }

      fillCardBlank(currentChallenge);

      DOM.diagBadge.className = "diag-badge correct";
      DOM.diagBadge.textContent = "SPEC CERTIFIED ✓";
      DOM.diagPoints.textContent = `+${pointsEarned} PTS (${state.selectedConfidence.toUpperCase()})`;
      DOM.diagReason.textContent = currentChallenge.diagnosis;
    } else {
      audio.playWrong();
      chosenButton.classList.add("is-wrong");

      buttons.forEach(b => {
        if (b.dataset.choice === currentChallenge.correctAnswer) {
          b.classList.add("is-correct");
        }
      });

      state.streak = 0;
      fillCardBlank(currentChallenge);

      DOM.diagBadge.className = "diag-badge wrong";
      DOM.diagBadge.textContent = "SPEC VIOLATION ✕";
      DOM.diagPoints.textContent = "+0 PTS (STREAK RESET)";
      DOM.diagReason.textContent = `Accurate spec: "${currentChallenge.correctAnswer}". ${currentChallenge.diagnosis}`;
    }

    saveStoredState(persistentData);
    updateHUD();
    DOM.diagnosisTray.classList.remove("hidden");
    DOM.btnNextTicket.focus();
  }

  function fillCardBlank(challenge) {
    if (challenge.type === "ingredient") {
      const el = DOM.ingredientList.querySelector(".is-blank-target .spec-name");
      if (el) el.textContent = challenge.correctAnswer;
    } else if (challenge.type === "measure") {
      const el = DOM.ingredientList.querySelector(".is-blank-target .spec-measure");
      if (el) el.textContent = challenge.correctAnswer;
    } else if (challenge.type === "method") {
      DOM.paramMethodVal.textContent = challenge.correctAnswer.toUpperCase();
    } else if (challenge.type === "troubleshoot") {
      const el = DOM.ingredientList.querySelector(".is-flawed-target .spec-name");
      if (el) el.textContent = `${challenge.correctIngredientName} (CORRECTED)`;
    }
  }

  function advanceNextTicket() {
    audio.playClick();

    if (state.shiftFinished) {
      showView("menu");
      return;
    }

    state.currentTicketIndex++;
    if (state.currentTicketIndex >= state.totalTickets) {
      completeShift();
    } else {
      renderTicket();
    }
  }

  function completeShift() {
    state.shiftFinished = true;
    audio.playCorrect();

    DOM.diagnosisTray.classList.remove("hidden");
    DOM.choiceMatrix.classList.add("hidden");
    DOM.confidenceBar.classList.add("hidden");

    DOM.diagBadge.className = "diag-badge correct";
    DOM.diagBadge.textContent = "SERVICE COMPLETE ★";
    DOM.diagPoints.textContent = `SHIFT SCORE: ${state.shiftScore}`;
    DOM.diagReason.textContent = `Shift complete! Career statistics updated. High Score: ${persistentData.highScore} PTS.`;

    DOM.btnNextText.textContent = "RETURN TO MENU";
    DOM.btnNextTicket.focus();
  }

  /* ==========================================================================
     10. MENU SUMMARY & CODEX / STATS RENDERING
     ========================================================================== */
  function updateMenuSummary() {
    const total = persistentData.totalAttempts;
    const correct = persistentData.correctCount;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    DOM.menuAccuracyPill.textContent = `${pct}% ACCURACY`;
    DOM.menuHighscoreVal.textContent = persistentData.highScore;
    DOM.menuBestStreakVal.textContent = persistentData.bestStreak;
    DOM.menuCertifiedVal.textContent = persistentData.totalCompleted;

    let rank = "BARBACK APPRENTICE";
    if (persistentData.totalCompleted >= 20 && pct >= 80) rank = "GRANDMASTER MIXOLOGIST";
    else if (persistentData.totalCompleted >= 10) rank = "SENIOR BARTENDER";
    else if (persistentData.totalCompleted >= 5) rank = "WORKING BARTENDER";
    DOM.menuRankBadge.textContent = rank;

    const isMuted = audio.muted;
    DOM.menuSoundIcon.textContent = isMuted ? "🔇" : "🔊";
    DOM.menuSoundLabel.textContent = `SOUND: ${isMuted ? "OFF" : "ON"}`;
  }

  function renderCodex(query = "") {
    DOM.codexGrid.innerHTML = "";
    const filterTerm = query.trim().toLowerCase();

    const matched = SPEC_DATASET.filter(c => {
      return (
        c.name.toLowerCase().includes(filterTerm) ||
        c.family.toLowerCase().includes(filterTerm) ||
        c.baseSpirit.toLowerCase().includes(filterTerm)
      );
    });

    if (matched.length === 0) {
      const emptyMsg = document.createElement("p");
      emptyMsg.style.color = "var(--tx-muted)";
      emptyMsg.style.fontSize = "0.8rem";
      emptyMsg.textContent = "No matching cocktail specifications found.";
      DOM.codexGrid.appendChild(emptyMsg);
      return;
    }

    matched.forEach(c => {
      const item = document.createElement("div");
      item.className = "codex-item";
      const specSummary = c.spec.map(s => `${s.measure} ${s.name}`).join(" • ");

      item.innerHTML = `
        <div class="codex-top">
          <span class="codex-name">${c.name}</span>
          <span class="codex-fam">${c.family}</span>
        </div>
        <div class="codex-formula">${specSummary}</div>
        <div class="codex-notes">${c.method} • ${c.glass} • ${c.garnish}</div>
      `;
      DOM.codexGrid.appendChild(item);
    });
  }

  function renderStats() {
    const total = persistentData.totalAttempts;
    const correct = persistentData.correctCount;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    DOM.stTotalPassed.textContent = persistentData.totalCompleted;
    DOM.stAccuracy.textContent = `${pct}%`;
    DOM.stBestStreak.textContent = persistentData.bestStreak;

    let rank = "Barback Apprentice";
    if (persistentData.totalCompleted >= 20 && pct >= 80) rank = "Grandmaster Mixologist";
    else if (persistentData.totalCompleted >= 10) rank = "Senior Bartender";
    else if (persistentData.totalCompleted >= 5) rank = "Working Bartender";
    DOM.stMasteryRank.textContent = rank;

    const families = ["Sour", "Bitter / Aperitivo", "Old Fashioned", "Daisy", "Martini"];
    DOM.familyMeterList.innerHTML = "";

    families.forEach(fam => {
      const progressPct = total > 0 ? Math.min(100, Math.round((correct / total) * 100)) : 0;
      const row = document.createElement("div");
      row.className = "fam-meter-row";
      row.innerHTML = `
        <div class="fam-meter-info">
          <span>${fam}</span>
          <span>${progressPct}%</span>
        </div>
        <div class="fam-track">
          <div class="fam-fill" style="width: ${progressPct}%;"></div>
        </div>
      `;
      DOM.familyMeterList.appendChild(row);
    });
  }

  function renderAtlas() {
    DOM.glassAtlasGrid.innerHTML = "";
    Object.keys(GLASS_SVGS).forEach(glassName => {
      const card = document.createElement("div");
      card.className = "glass-card";
      card.innerHTML = `
        <div class="glass-svg-wrap" style="width:34px; height:38px;">${GLASS_SVGS[glassName]}</div>
        <span class="glass-card-name">${glassName}</span>
        <span class="glass-card-desc">Chilled Stemware</span>
      `;
      DOM.glassAtlasGrid.appendChild(card);
    });

    const FAMILY_DEFINITIONS = [
      { name: "The Sour", desc: "2 oz Spirit + 0.75 oz Citrus Acid + 0.75 oz Sweetener. Emulsified with optional egg white." },
      { name: "The Daisy", desc: "A sour sweetened by a cordial or orange liqueur (e.g. Cointreau in the Margarita)." },
      { name: "The Old Fashioned", desc: "Spirit-forward: 2 oz Spirit + Demerara or Sugar + Aromatic Bitters stirred over dense ice." },
      { name: "The Aperitivo / Equal Parts", desc: "Equal parts harmony of spirit, bitter aperitif, and vermouth (e.g. Negroni 1:1:1 formula)." },
      { name: "The Martini", desc: "High-proof spirit tempered by dry aromatized wine (e.g. 5:1 Dry Gin to French Vermouth)." }
    ];

    DOM.guideFamiliesList.innerHTML = "";
    FAMILY_DEFINITIONS.forEach(item => {
      const box = document.createElement("div");
      box.className = "guide-fam-box";
      box.innerHTML = `
        <div class="guide-fam-head">${item.name}</div>
        <div class="guide-fam-body">${item.desc}</div>
      `;
      DOM.guideFamiliesList.appendChild(box);
    });
  }

  function openModal() {
    audio.playClick();
    renderCodex();
    renderStats();
    renderAtlas();
    DOM.modalBackdrop.classList.remove("hidden");
    DOM.modalBackdrop.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    audio.playClick();
    DOM.modalBackdrop.classList.add("hidden");
    DOM.modalBackdrop.setAttribute("aria-hidden", "true");
  }

  /* ==========================================================================
     11. KEYBOARD & CONTROLS BINDING
     ========================================================================== */
  function triggerHint() {
    if (state.answered || !state.activeChallenge) return;
    audio.playClick();
    DOM.btnHint.disabled = true;
    DOM.deckPrompt.textContent = `HINT: ${state.activeChallenge.challenge.hint}`;
  }

  function handleKeyboard(e) {
    if (!DOM.modalBackdrop.classList.contains("hidden")) {
      if (e.key === "Escape") closeModal();
      return;
    }

    if (state.currentView === "gameplay") {
      if (e.key >= "1" && e.key <= "4") {
        const idx = parseInt(e.key, 10) - 1;
        const buttons = DOM.choiceMatrix.querySelectorAll(".choice-btn");
        if (buttons[idx] && !buttons[idx].disabled) {
          buttons[idx].click();
        }
      } else if (e.key === "Enter" || e.key === " ") {
        if (!DOM.diagnosisTray.classList.contains("hidden")) {
          e.preventDefault();
          advanceNextTicket();
        }
      } else if (e.key.toLowerCase() === "h") {
        triggerHint();
      }
    }
  }

  function setupConfidenceControls() {
    DOM.confButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        DOM.confButtons.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-checked", "false");
        });
        btn.classList.add("active");
        btn.setAttribute("aria-checked", "true");
        state.selectedConfidence = btn.dataset.conf;
      });
    });
  }

  function bindEvents() {
    // Menu Buttons
    DOM.btnStartClassic.addEventListener("click", () => startShiftMode("classic"));
    DOM.btnStartRepair.addEventListener("click", () => startShiftMode("repair"));
    DOM.btnStartFamily.addEventListener("click", () => startShiftMode("family"));
    DOM.btnMenuOpenCodex.addEventListener("click", openModal);

    DOM.btnMenuSoundToggle.addEventListener("click", () => {
      const isMuted = audio.toggleMute();
      DOM.iconSoundOn.classList.toggle("hidden", isMuted);
      DOM.iconSoundOff.classList.toggle("hidden", !isMuted);
      updateMenuSummary();
      if (!isMuted) audio.playClick();
    });

    // Gameplay Controls
    DOM.btnBackToMenu.addEventListener("click", () => {
      audio.playClick();
      showView("menu");
    });

    DOM.btnNextTicket.addEventListener("click", advanceNextTicket);
    DOM.btnHint.addEventListener("click", triggerHint);
    window.addEventListener("keydown", handleKeyboard);

    DOM.btnAudioToggle.addEventListener("click", () => {
      const isMuted = audio.toggleMute();
      DOM.iconSoundOn.classList.toggle("hidden", isMuted);
      DOM.iconSoundOff.classList.toggle("hidden", !isMuted);
      updateMenuSummary();
      if (!isMuted) audio.playClick();
    });

    if (audio.muted) {
      DOM.iconSoundOn.classList.add("hidden");
      DOM.iconSoundOff.classList.remove("hidden");
    }

    // Modal Drawer Controls
    DOM.btnOpenMenu.addEventListener("click", openModal);
    DOM.btnCloseModal.addEventListener("click", closeModal);
    DOM.modalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.modalBackdrop) closeModal();
    });

    DOM.subnavButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        DOM.subnavButtons.forEach(b => {
          b.classList.remove("active");
          b.setAttribute("aria-selected", "false");
        });
        DOM.modalPanes.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        btn.setAttribute("aria-selected", "true");
        const targetPane = document.getElementById(btn.dataset.pane);
        if (targetPane) targetPane.classList.add("active");
      });
    });

    DOM.codexSearch.addEventListener("input", (e) => {
      renderCodex(e.target.value);
    });

    // Mode Navigation Tabs in Gameplay
    DOM.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        startShiftMode(tab.dataset.mode);
      });
    });

    // Reset Progress Action
    DOM.btnResetProgress.addEventListener("click", () => {
      localStorage.removeItem(STORAGE_KEY);
      persistentData.highScore = 0;
      persistentData.bestStreak = 0;
      persistentData.totalCompleted = 0;
      persistentData.correctCount = 0;
      persistentData.totalAttempts = 0;
      saveStoredState(persistentData);

      updateMenuSummary();
      renderStats();
      closeModal();
    });

    setupConfidenceControls();
  }

  function init() {
    bindEvents();
    showView("menu");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();