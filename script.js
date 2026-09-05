/**
 * SPEC CARDS — COMPLETE BUG-FIXED GAME ENGINE
 * Vanilla browser-native JavaScript. Zero external dependencies.
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. LOCAL STORAGE PERSISTENCE WRAPPER
     ========================================================================== */
  const Storage = {
    get(key, fallback = null) {
      try {
        const val = localStorage.getItem(key);
        return val !== null ? val : fallback;
      } catch {
        return fallback;
      }
    },
    set(key, val) {
      try {
        localStorage.setItem(key, String(val));
      } catch {
        /* Storage blocked */
      }
    },
    remove(key) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* Storage blocked */
      }
    }
  };

  /* ==========================================================================
     2. SYNTHETIC AUDIO ENGINE
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = Storage.get("speccards_sound", "on") === "off";
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
      Storage.set("speccards_sound", this.muted ? "off" : "on");
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
     4. CANONICAL DATASET
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
        hint: "This spirit provides the oak tannins and proof necessary to counterbalance tart lemon juice.",
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
        hint: "The classic Negroni is built on strict equal-parts harmony between spirit, aperitif, and vermouth.",
        diagnosis: "A canonical Negroni demands equal parts (1.0 oz each) of gin, Campari, and sweet vermouth to achieve bitter-sweet equilibrium."
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
        hint: "Spirit-forward cocktails without citrus juices require gentle stirring to prevent aeration and cloudiness.",
        diagnosis: "Stirring gently incorporates cold dilution without chipping ice or introducing oxygen bubbles, preserving a silky texture."
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
        hint: "A Daisy cocktail always balances citrus with an orange liqueur, never fortified wine.",
        diagnosis: "The Margarita is an agave Daisy; it requires orange liqueur (Cointreau or triple sec) as the aromatic sweetener, not sweet vermouth."
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
        prompt: "Specify the fortified wine modifier that completes the 5:1 Dry Martini:",
        correctAnswer: "Dry French Vermouth",
        options: [
          "Dry French Vermouth",
          "Sweet Red Vermouth",
          "Green Chartreuse",
          "Maraschino Liqueur"
        ],
        hint: "This dry aromatized wine from France softens juniper proof without contributing dark botanical sugars.",
        diagnosis: "Dry French vermouth imparts herbal acidity to round out high-proof gin without masking its crisp botanical profile."
      }
    }
  ];

  /* ==========================================================================
     5. STATE & DOM REPOSITORY
     ========================================================================== */
  const state = {
    view: "menu",
    mode: "classic",
    currentTicketIndex: parseInt(Storage.get("speccards_ticket", "0"), 10) || 0,
    totalTickets: SPEC_DATASET.length,
    activeChallenge: null,
    selectedConfidence: "certain",
    bestScore: parseInt(Storage.get("speccards_bestscore", "0"), 10) || 0,
    shiftScore: 0,
    streak: 0,
    bestStreak: parseInt(Storage.get("speccards_beststreak", "0"), 10) || 0,
    totalCompleted: parseInt(Storage.get("speccards_completed", "0"), 10) || 0,
    correctCount: parseInt(Storage.get("speccards_correct", "0"), 10) || 0,
    totalAttempts: parseInt(Storage.get("speccards_attempts", "0"), 10) || 0,
    answered: false,
    shiftFinished: false
  };

  if (state.currentTicketIndex >= SPEC_DATASET.length || state.currentTicketIndex < 0) {
    state.currentTicketIndex = 0;
  }

  const audio = new SoundEngine();

  let DOM = {};

  function cacheDOM() {
    DOM = {
      viewMenu: document.getElementById("viewMenu"),
      viewGame: document.getElementById("viewGame"),
      qstatScore: document.getElementById("qstatScore"),
      qstatAccuracy: document.getElementById("qstatAccuracy"),
      btnOpenCodexFromMenu: document.getElementById("btnOpenCodexFromMenu"),
      btnOpenSettingsFromMenu: document.getElementById("btnOpenSettingsFromMenu"),
      btnReturnMenu: document.getElementById("btnReturnMenu"),
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
      btnResetProgress: document.getElementById("btnResetProgress"),
      btnSettingAudioToggle: document.getElementById("btnSettingAudioToggle")
    };
  }

  /* ==========================================================================
     6. VIEW SWITCHING & RENDERING PIPELINE
     ========================================================================== */
  function switchView(viewName) {
    state.view = viewName;
    if (viewName === "menu") {
      DOM.viewMenu.classList.add("active");
      DOM.viewGame.classList.remove("active");
      updateMenuStats();
    } else {
      DOM.viewMenu.classList.remove("active");
      DOM.viewGame.classList.add("active");
      renderTicket();
    }
  }

  function updateMenuStats() {
    DOM.qstatScore.textContent = state.bestScore;
    const pct = state.totalAttempts > 0 ? Math.round((state.correctCount / state.totalAttempts) * 100) : 0;
    DOM.qstatAccuracy.textContent = `${pct}%`;
  }

  function renderTicket() {
    state.answered = false;
    DOM.diagnosisTray.classList.add("hidden");
    DOM.choiceMatrix.classList.remove("hidden");
    DOM.confidenceBar.classList.remove("hidden");
    DOM.btnHint.disabled = false;

    DOM.specCard.classList.remove("card-enter");
    void DOM.specCard.offsetWidth;
    DOM.specCard.classList.add("card-enter");

    const cocktail = SPEC_DATASET[state.currentTicketIndex] || SPEC_DATASET[0];
    state.activeChallenge = cocktail;

    DOM.cardFamily.textContent = `${cocktail.family} FAMILY`;
    DOM.cardTitle.textContent = cocktail.name;
    DOM.cardEra.textContent = cocktail.era;

    DOM.cardGlassCaption.textContent = cocktail.glass;
    DOM.glassSvgSlot.innerHTML = GLASS_SVGS[cocktail.glass] || GLASS_SVGS["Coupe"];

    DOM.paramMethodCell.classList.remove("is-blank-target");
    if (cocktail.challenge.type === "method") {
      DOM.paramMethodCell.classList.add("is-blank-target");
      DOM.paramMethodVal.innerHTML = `<span class="blank-slot" style="min-width:60px; height:14px;" aria-label="Blank method"></span>`;
    } else {
      DOM.paramMethodVal.textContent = cocktail.method.toUpperCase();
    }

    DOM.paramIceVal.textContent = cocktail.ice.toUpperCase();
    DOM.paramGarnishVal.textContent = cocktail.garnish.toUpperCase();
    DOM.footnoteText.textContent = cocktail.footnote;

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
        measureSpan.innerHTML = `<span class="blank-slot" style="min-width:42px;" aria-label="Blank measure"></span>`;
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
        nameSpan.innerHTML = `<span class="blank-slot" aria-label="Blank ingredient name"></span>`;
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
     7. ANSWER EVALUATION & FEEDBACK
     ========================================================================== */
  function handleAnswer(chosenText, chosenButton) {
    if (state.answered) return;
    state.answered = true;
    state.totalAttempts++;

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
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
        Storage.set("speccards_beststreak", state.bestStreak);
      }
      state.correctCount++;
      state.totalCompleted++;

      const basePoints = 100;
      const streakBonus = (state.streak - 1) * 25;
      const pointsEarned = Math.round((basePoints + streakBonus) * confMultiplier);
      state.shiftScore += pointsEarned;

      if (state.shiftScore > state.bestScore) {
        state.bestScore = state.shiftScore;
        Storage.set("speccards_bestscore", state.bestScore);
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

    Storage.set("speccards_completed", state.totalCompleted);
    Storage.set("speccards_correct", state.correctCount);
    Storage.set("speccards_attempts", state.totalAttempts);

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
      state.shiftFinished = false;
      state.currentTicketIndex = 0;
      state.shiftScore = 0;
      DOM.btnNextText.textContent = "NEXT TICKET";
      renderTicket();
      return;
    }

    state.currentTicketIndex++;
    if (state.currentTicketIndex >= state.totalTickets) {
      completeShift();
    } else {
      Storage.set("speccards_ticket", state.currentTicketIndex);
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
    DOM.diagPoints.textContent = `FINAL SCORE: ${state.shiftScore}`;
    DOM.diagReason.textContent = `Shift complete with ${state.correctCount} specifications certified across all cocktail families. Bartender intuition calibrated.`;

    DOM.btnNextText.textContent = "START NEW SHIFT";
    DOM.btnNextTicket.focus();
  }

  /* ==========================================================================
     8. HINTS & CONFIDENCE CONTROLS
     ========================================================================== */
  function triggerHint() {
    if (state.answered || !state.activeChallenge) return;
    audio.playClick();
    DOM.btnHint.disabled = true;
    DOM.deckPrompt.textContent = `HINT: ${state.activeChallenge.challenge.hint}`;
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

  /* ==========================================================================
     9. MODAL CODEX, STATS & ATLAS VIEWS
     ========================================================================== */
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
    const total = state.totalAttempts;
    const correct = state.correctCount;
    const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

    DOM.stTotalPassed.textContent = state.totalCompleted;
    DOM.stAccuracy.textContent = `${pct}%`;
    DOM.stBestStreak.textContent = state.bestStreak;

    let rank = "Barback Apprentice";
    if (state.totalCompleted >= 20 && pct >= 80) rank = "Grandmaster Mixologist";
    else if (state.totalCompleted >= 10) rank = "Senior Bartender";
    else if (state.totalCompleted >= 5) rank = "Working Bartender";
    DOM.stMasteryRank.textContent = rank;

    const families = ["Sour", "Bitter / Aperitivo", "Old Fashioned", "Daisy", "Martini"];
    DOM.familyMeterList.innerHTML = "";

    families.forEach(fam => {
      const hasCompleted = state.totalCompleted > 0;
      const progressPct = hasCompleted ? Math.min(100, Math.round((state.correctCount / Math.max(1, state.totalAttempts)) * 100)) : 0;

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
        <div class="glass-svg-wrap" style="width:28px; height:30px;">${GLASS_SVGS[glassName]}</div>
        <span class="glass-card-name">${glassName}</span>
        <span class="glass-card-desc">Chilled Presentation</span>
      `;
      DOM.glassAtlasGrid.appendChild(card);
    });

    const FAMILY_DEFINITIONS = [
      { name: "The Sour", desc: "Core formula: 2 oz Spirit + 0.75 oz Citrus Acid + 0.75 oz Sweetener. Emulsified with egg white for silky texture." },
      { name: "The Daisy", desc: "A sour sweetened by a cordial or liqueur (e.g. Cointreau in the Margarita)." },
      { name: "The Old Fashioned", desc: "Spirit-forward construction: 2 oz Spirit + Demerara or Sugar Cube + Aromatic Bitters gently stirred over dense ice." },
      { name: "The Aperitivo / Equal Parts", desc: "Equal parts harmony of spirit, bitter aperitif, and vermouth (e.g. Negroni 1:1:1 formula)." },
      { name: "The Martini", desc: "High-proof spirit tempered by dry fortified wine (e.g. 5:1 Dry Gin to French Vermouth), stirred for glass clarity." }
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

  function openModal(defaultPane = "paneCodex") {
    audio.playClick();
    renderCodex();
    renderStats();
    renderAtlas();

    DOM.subnavButtons.forEach(btn => {
      const active = (btn.dataset.pane === defaultPane);
      btn.classList.toggle("active", active);
      btn.setAttribute("aria-selected", active ? "true" : "false");
    });

    DOM.modalPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === defaultPane);
    });

    DOM.modalBackdrop.classList.remove("hidden");
    DOM.modalBackdrop.setAttribute("aria-hidden", "false");
  }

  function closeModal() {
    audio.playClick();
    DOM.modalBackdrop.classList.add("hidden");
    DOM.modalBackdrop.setAttribute("aria-hidden", "true");
  }

  /* ==========================================================================
     10. KEYBOARD NAVIGATION
     ========================================================================== */
  function handleKeyboard(e) {
    if (!DOM.modalBackdrop.classList.contains("hidden")) {
      if (e.key === "Escape") closeModal();
      return;
    }

    if (state.view === "game") {
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

  /* ==========================================================================
     11. EVENT BINDINGS & INITIALIZATION
     ========================================================================== */
  function bindEvents() {
    document.querySelectorAll(".menu-mode-card").forEach(card => {
      card.addEventListener("click", () => {
        audio.playClick();
        state.mode = card.dataset.mode;
        state.shiftFinished = false;
        DOM.btnNextText.textContent = "NEXT TICKET";

        if (state.mode === "repair") {
          state.currentTicketIndex = 3;
        } else if (state.mode === "family") {
          state.currentTicketIndex = 0;
        } else {
          state.currentTicketIndex = 0;
        }

        DOM.modeTabs.forEach(t => {
          const active = (t.dataset.mode === state.mode);
          t.classList.toggle("active", active);
          t.setAttribute("aria-selected", active ? "true" : "false");
        });

        switchView("game");
      });
    });

    if (DOM.btnOpenCodexFromMenu) DOM.btnOpenCodexFromMenu.addEventListener("click", () => openModal("paneCodex"));
    if (DOM.btnOpenSettingsFromMenu) DOM.btnOpenSettingsFromMenu.addEventListener("click", () => openModal("paneSettings"));
    if (DOM.btnReturnMenu) DOM.btnReturnMenu.addEventListener("click", () => {
      audio.playClick();
      switchView("menu");
    });

    if (DOM.btnNextTicket) DOM.btnNextTicket.addEventListener("click", advanceNextTicket);
    if (DOM.btnHint) DOM.btnHint.addEventListener("click", triggerHint);
    window.addEventListener("keydown", handleKeyboard);

    const updateAudioUI = () => {
      if (DOM.iconSoundOn) DOM.iconSoundOn.classList.toggle("hidden", audio.muted);
      if (DOM.iconSoundOff) DOM.iconSoundOff.classList.toggle("hidden", !audio.muted);
      if (DOM.btnSettingAudioToggle) DOM.btnSettingAudioToggle.textContent = audio.muted ? "MUTED" : "ENABLED";
    };

    if (DOM.btnAudioToggle) {
      DOM.btnAudioToggle.addEventListener("click", () => {
        audio.toggleMute();
        updateAudioUI();
        if (!audio.muted) audio.playClick();
      });
    }

    if (DOM.btnSettingAudioToggle) {
      DOM.btnSettingAudioToggle.addEventListener("click", () => {
        audio.toggleMute();
        updateAudioUI();
        if (!audio.muted) audio.playClick();
      });
    }

    updateAudioUI();

    if (DOM.btnOpenMenu) DOM.btnOpenMenu.addEventListener("click", () => openModal("paneCodex"));
    if (DOM.btnCloseModal) DOM.btnCloseModal.addEventListener("click", closeModal);
    if (DOM.modalBackdrop) {
      DOM.modalBackdrop.addEventListener("click", (e) => {
        if (e.target === DOM.modalBackdrop) closeModal();
      });
    }

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

    if (DOM.codexSearch) {
      DOM.codexSearch.addEventListener("input", (e) => {
        renderCodex(e.target.value);
      });
    }

    DOM.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        audio.playClick();
        DOM.modeTabs.forEach(t => {
          t.classList.remove("active");
          t.setAttribute("aria-selected", "false");
        });
        tab.classList.add("active");
        tab.setAttribute("aria-selected", "true");

        state.mode = tab.dataset.mode;
        state.shiftFinished = false;
        DOM.btnNextText.textContent = "NEXT TICKET";

        if (state.mode === "repair") {
          state.currentTicketIndex = 3;
        } else if (state.mode === "family") {
          state.currentTicketIndex = 0;
        } else {
          state.currentTicketIndex = 0;
        }

        renderTicket();
      });
    });

    if (DOM.btnResetProgress) {
      DOM.btnResetProgress.addEventListener("click", () => {
        Storage.remove("speccards_completed");
        Storage.remove("speccards_correct");
        Storage.remove("speccards_attempts");
        Storage.remove("speccards_beststreak");
        Storage.remove("speccards_bestscore");
        Storage.remove("speccards_ticket");

        state.totalCompleted = 0;
        state.correctCount = 0;
        state.totalAttempts = 0;
        state.bestStreak = 0;
        state.streak = 0;
        state.bestScore = 0;
        state.currentTicketIndex = 0;

        renderStats();
        updateHUD();
        closeModal();
        switchView("menu");
      });
    }

    setupConfidenceControls();
  }

  function init() {
    cacheDOM();
    bindEvents();
    switchView("menu");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();