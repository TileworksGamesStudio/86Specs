/**
 * SPEC CARDS — COMPLETE GAME ENGINE & KNOWLEDGE MODEL
 * Zero external dependencies. Browser-native JavaScript.
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. SYNTHETIC AUDIO ENGINE (Web Audio API)
     ========================================================================== */
  class SoundEngine {
    constructor() {
      this.ctx = null;
      this.muted = localStorage.getItem("speccards_sound") === "off";
    }

    init() {
      if (!this.ctx && (window.AudioContext || window.webkitAudioContext)) {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioCtx();
      }
      if (this.ctx && this.ctx.state === "suspended") {
        this.ctx.resume();
      }
    }

    toggleMute() {
      this.muted = !this.muted;
      localStorage.setItem("speccards_sound", this.muted ? "off" : "on");
      return this.muted;
    }

    playClick() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sine";
      osc.frequency.setValueAtTime(600, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.05);
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.05);
    }

    playCorrect() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      // High harmonic chime
      [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = "triangle";
        osc.frequency.setValueAtTime(freq, t + idx * 0.06);
        gain.gain.setValueAtTime(0, t);
        gain.gain.setValueAtTime(0.15, t + idx * 0.06);
        gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t + idx * 0.06);
        osc.stop(t + idx * 0.06 + 0.4);
      });
    }

    playWrong() {
      if (this.muted) return;
      this.init();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = "sawtooth";
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(90, t + 0.25);
      gain.gain.setValueAtTime(0.18, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(t);
      osc.stop(t + 0.25);
    }
  }

  /* ==========================================================================
     2. SVG ATLAS: GLASSWARE SILHOUETTES
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
    </svg>`,
    Flute: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M18 6 L30 6 L28 28 L24 32 L20 28 Z" />
      <line x1="24" y1="32" x2="24" y2="42" />
      <line x1="17" y1="42" x2="31" y2="42" />
    </svg>`
  };

  /* ==========================================================================
     3. CANONICAL COCKTAIL KNOWLEDGE REPOSITORY
     ========================================================================== */
  const COCKTAIL_DATABASE = [
    {
      id: "whiskey-sour",
      name: "Whiskey Sour",
      family: "Sour",
      baseSpirit: "Bourbon / Rye",
      era: "1860s • American Classic",
      glass: "Coupe",
      ice: "None (Served Up)",
      method: "Shake (Dry Shake optional)",
      garnish: "Angostura Drops & Lemon Twist",
      footnote: "Egg white requires a dry shake (un-iced) to build protein foam before chilling.",
      spec: [
        { measure: "2.0 oz", name: "Bourbon or Rye Whiskey", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Rich Simple Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "1 dash", name: "Egg White or Foamer (Optional)", role: "Textural Agent" }
      ],
      diagnosis: "The core balance requires 2 oz spirit countered by 0.75 oz acid and 0.75 oz sweetener."
    },
    {
      id: "negroni",
      name: "Negroni",
      family: "Bitter / Aperitivo",
      baseSpirit: "London Dry Gin",
      era: "1919 • Florence, Italy (Caffè Casoni)",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Stir",
      garnish: "Expressed Orange Peel",
      footnote: "Equal-part construction relying on thermal chilling and controlled dilution.",
      spec: [
        { measure: "1.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Campari", role: "Bitter Apertif" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" }
      ],
      diagnosis: "The Negroni is strictly an equal parts (1:1:1) stirred cocktail over solid ice."
    },
    {
      id: "old-fashioned",
      name: "Old Fashioned",
      family: "Old Fashioned",
      baseSpirit: "Rye or Bourbon",
      era: "1880s • Pendennis Club / Louisville",
      glass: "Rocks",
      ice: "Large Clear Cube",
      method: "Stir",
      garnish: "Expressed Orange & Cherry",
      footnote: "The primogenitor of cocktails: spirit, sweetener, water (ice dilution), and bitters.",
      spec: [
        { measure: "2.0 oz", name: "Rye or Bourbon Whiskey", role: "Base Spirit" },
        { measure: "1 tsp", name: "Demerara Syrup (or Sugar Cube)", role: "Sweet Modifier" },
        { measure: "2 dashes", name: "Angostura Aromatic Bitters", role: "Bittering Accent" }
      ],
      diagnosis: "An Old Fashioned is never shaken; slow dilution integrates high-proof grain whiskey."
    },
    {
      id: "margarita",
      name: "Margarita",
      family: "Daisy",
      baseSpirit: "Blanco Tequila",
      era: "1930s-1940s • Mexican Classic",
      glass: "Coupe",
      ice: "None or Fresh Rocks",
      method: "Shake",
      garnish: "Lime Wheel & Half-Salt Rim",
      footnote: "A Daisy cocktail: spirit, citrus, and a liqueur sweetener (Triple Sec/Cointreau).",
      spec: [
        { measure: "2.0 oz", name: "Blanco Tequila (100% Agave)", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Cointreau / Orange Liqueur", role: "Sweet Modifier" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      diagnosis: "Cointreau acts as both sweetener and aromatic modifier in the classic Daisy spec."
    },
    {
      id: "daiquiri",
      name: "Classic Daiquiri",
      family: "Sour",
      baseSpirit: "Light Rum",
      era: "1898 • Santiago de Cuba",
      glass: "Coupe",
      ice: "None (Served Up)",
      method: "Hard Shake & Fine Strain",
      garnish: "Lime Wheel or Expressed Coin",
      footnote: "The litmus test of bartender balance: white rum, fresh cane, and crisp lime.",
      spec: [
        { measure: "2.0 oz", name: "White Cuban-Style Rum", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Cane Sugar Syrup (2:1)", role: "Sweet Modifier" }
      ],
      diagnosis: "Shaken vigorously with crushed or cold cubes to achieve microscopic ice crystals."
    },
    {
      id: "dry-martini",
      name: "Dry Martini",
      family: "Martini",
      baseSpirit: "London Dry Gin",
      era: "Turn of 20th Century • Savoy / Knickerbocker",
      glass: "Martini",
      ice: "None (Pre-chilled Glass)",
      method: "Stir Thoroughly",
      garnish: "Lemon Twist or Castelvetrano Olive",
      footnote: "Stirring prevents aeration, creating the silkiest possible spirit-forward texture.",
      spec: [
        { measure: "2.5 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Dry French Vermouth", role: "Fortified Modifier" },
        { measure: "1 dash", name: "Orange Bitters (Traditional)", role: "Aromatic Accent" }
      ],
      diagnosis: "Vermouth softens the proof without clouding the crystal clarity achieved by stirring."
    },
    {
      id: "manhattan",
      name: "Manhattan",
      family: "Manhattan",
      baseSpirit: "Rye Whiskey",
      era: "1870s • Manhattan Club, New York",
      glass: "Nick & Nora",
      ice: "None (Chilled Stemware)",
      method: "Stir",
      garnish: "Brandied Marasca Cherry",
      footnote: "2:1 Rye to Sweet Vermouth formula with aromatic bitters.",
      spec: [
        { measure: "2.0 oz", name: "Rye Whiskey (100 Proof)", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
        { measure: "2 dashes", name: "Angostura Bitters", role: "Bitter Accent" }
      ],
      diagnosis: "The high rye content punches through the round botanical sugars of sweet vermouth."
    },
    {
      id: "corpse-reviver-2",
      name: "Corpse Reviver #2",
      family: "Sour / Daisy",
      baseSpirit: "London Dry Gin",
      era: "1930 • Harry Craddock, Savoy Cocktail Book",
      glass: "Coupe",
      ice: "None (Served Up)",
      method: "Shake",
      garnish: "Absinthe Rinse & Lemon Twist",
      footnote: "'Four taken in swift succession will unrevive the corpse again.' Equal-parts spec.",
      spec: [
        { measure: "0.75 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Cocchi Americano / Kina Lillet", role: "Aromatized Wine" },
        { measure: "0.75 oz", name: "Cointreau / Triple Sec", role: "Sweet Modifier" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "1 rinse", name: "Absinthe", role: "Aromatic Wash" }
      ],
      diagnosis: "The equal-parts harmony relies on absinthe coating the glass interior."
    },
    {
      id: "tom-collins",
      name: "Tom Collins",
      family: "Collins / Fizz",
      baseSpirit: "Old Tom or Dry Gin",
      era: "1876 • Jerry Thomas Bar-Tender's Guide",
      glass: "Highball",
      ice: "Spear or Column Cubes",
      method: "Shake then Top with Soda",
      garnish: "Lemon Wheel & Maraschino Cherry",
      footnote: "Built tall over dense ice and carbonated to refresh.",
      spec: [
        { measure: "2.0 oz", name: "Old Tom or Dry Gin", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.5 oz", name: "Simple Syrup", role: "Sweet Modifier" },
        { measure: "Top", name: "Chilled Club Soda", role: "Carbonated Diluent" }
      ],
      diagnosis: "Carbonated soda must never be shaken in the shaker; always topped in highball glass."
    },
    {
      id: "last-word",
      name: "The Last Word",
      family: "Equal Parts / Daisy",
      baseSpirit: "London Dry Gin",
      era: "1916 • Detroit Athletic Club",
      glass: "Coupe",
      ice: "None (Served Up)",
      method: "Hard Shake",
      garnish: "Brandied Cherry",
      footnote: "Four pungent ingredients in four-way democratic equal balance.",
      spec: [
        { measure: "0.75 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Green Chartreuse", role: "Herbal Liqueur" },
        { measure: "0.75 oz", name: "Maraschino Liqueur (Luxardo)", role: "Sweet Modifier" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      diagnosis: "Chartreuse and Maraschino provide massive sugar; 0.75 oz lime provides the essential acid cut."
    },
    {
      id: "sazerac",
      name: "Sazerac",
      family: "Old Fashioned",
      baseSpirit: "Rye Whiskey & Cognac",
      era: "1850s-1890s • New Orleans",
      glass: "Rocks",
      ice: "None (Chilled Neat)",
      method: "Stir & Discard Absinthe",
      garnish: "Expressed Lemon Peel (Discarded)",
      footnote: "Official cocktail of New Orleans; served without ice in a chilled glass.",
      spec: [
        { measure: "2.0 oz", name: "Rye Whiskey", role: "Base Spirit" },
        { measure: "1 barspoon", name: "Simple Syrup or Sugar Cube", role: "Sweet Modifier" },
        { measure: "3 dashes", name: "Peychaud's Bitters", role: "Anise/Floral Bitters" },
        { measure: "1 rinse", name: "Herbsaint or Absinthe", role: "Aromatic Wash" }
      ],
      diagnosis: "Peychaud's bitters gives the signature gentian-anise hue; lemon oil is expressed and discarded."
    },
    {
      id: "boulevardier",
      name: "Boulevardier",
      family: "Bitter / Manhattan",
      baseSpirit: "Bourbon or Rye",
      era: "1927 • Erskine Gwynne, Paris",
      glass: "Coupe",
      ice: "None or Big Cube in Rocks",
      method: "Stir",
      garnish: "Orange Twist",
      footnote: "The bourbon cousin of the Negroni with a rounded, oak-driven backbone.",
      spec: [
        { measure: "1.5 oz", name: "Bourbon Whiskey", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Campari", role: "Bitter Aperitif" },
        { measure: "1.0 oz", name: "Sweet Vermouth", role: "Fortified Modifier" }
      ],
      diagnosis: "Increasing the whiskey to 1.5 oz anchors the spirit against the assertiveness of Campari."
    },
    {
      id: "penicillin",
      name: "Penicillin",
      family: "Sour / Modern Classic",
      baseSpirit: "Blended Scotch & Islay",
      era: "2005 • Sam Ross, Milk & Honey NYC",
      glass: "Rocks",
      ice: "Large Clear Cube",
      method: "Shake with Float",
      garnish: "Candied Ginger & Islay Float",
      footnote: "Modern classic utilizing honey-ginger syrup and a peaty aromatic float.",
      spec: [
        { measure: "2.0 oz", name: "Blended Scotch Whisky", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Honey-Ginger Syrup", role: "Spiced Sweetener" },
        { measure: "0.25 oz", name: "Peaty Islay Single Malt", role: "Aromatic Float" }
      ],
      diagnosis: "The peated Islay Scotch is gently floated over the cube to capture the nasal aroma."
    },
    {
      id: "espresso-martini",
      name: "Espresso Martini",
      family: "Modern Classic",
      baseSpirit: "Vodka",
      era: "1983 • Dick Bradsell, London",
      glass: "Coupe",
      ice: "None (Served Up)",
      method: "Hard Vigorous Shake",
      garnish: "Three Coffee Beans",
      footnote: "Created at Fred's Club; hard shake creates the dense crema head.",
      spec: [
        { measure: "1.5 oz", name: "Vodka", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Fresh Espresso (Hot/Warm)", role: "Bitter Extract" },
        { measure: "0.75 oz", name: "Coffee Liqueur (Kahlúa)", role: "Sweet Modifier" },
        { measure: "0.25 oz", name: "Simple Syrup", role: "Balance Modifier" }
      ],
      diagnosis: "Fresh espresso oils whip with sugar into a dense, velvety crema when shaken hard."
    },
    {
      id: "sidecar",
      name: "Sidecar",
      family: "Daisy",
      baseSpirit: "Cognac",
      era: "1920s • Ritz Paris or Harry's New York Bar",
      glass: "Coupe",
      ice: "None (Served Up)",
      method: "Shake",
      garnish: "Sugar Rim (Optional) & Orange Twist",
      footnote: "The quintessential brandy daisy that established the 2:0.75:0.75 ratio.",
      spec: [
        { measure: "2.0 oz", name: "Cognac / Fine Brandy", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Cointreau", role: "Orange Modifier" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" }
      ],
      diagnosis: "Cognac's grape distillates require tart lemon and dry curaçao for brightness."
    },
    {
      id: "paloma",
      name: "Paloma",
      family: "Highball",
      baseSpirit: "Tequila Blanco",
      era: "1950s • Don Javier Delgado Corona, Tequila",
      glass: "Highball",
      ice: "Fresh Column Ice",
      method: "Build & Top",
      garnish: "Grapefruit Wedge & Salt Rim",
      footnote: "Mexico's favorite highball; bittersweet grapefruit cuts agave sweetness.",
      spec: [
        { measure: "2.0 oz", name: "Blanco Tequila", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "Top", name: "Grapefruit Soda (Jarritos/Squirt)", role: "Flavored Carbonation" },
        { measure: "1 pinch", name: "Sea Salt", role: "Flavor Enhancer" }
      ],
      diagnosis: "Salt suppresses bitterness and accentuates the vegetal sweetness of agave."
    }
  ];

  /* ==========================================================================
     4. DISTRACTOR POOLS (CONTEXT-AWARE CHOICE GENERATOR)
     ========================================================================== */
  const INGREDIENT_DISTRACTORS = [
    "London Dry Gin", "Bourbon Whiskey", "Rye Whiskey", "Blanco Tequila", 
    "White Cuban-Style Rum", "Cognac / Fine Brandy", "Campari", "Sweet Red Vermouth", 
    "Dry French Vermouth", "Cointreau / Triple Sec", "Green Chartreuse", 
    "Fresh Lemon Juice", "Fresh Lime Juice", "Rich Simple Syrup (2:1)", 
    "Honey-Ginger Syrup", "Angostura Aromatic Bitters", "Club Soda", "Absinthe"
  ];

  const MEASURE_DISTRACTORS = ["0.25 oz", "0.5 oz", "0.75 oz", "1.0 oz", "1.5 oz", "2.0 oz", "2.5 oz"];
  const METHOD_DISTRACTORS = ["Shake", "Stir", "Build & Top", "Hard Shake & Fine Strain", "Muddle & Swizzle"];
  const GLASS_DISTRACTORS = ["Coupe", "Rocks", "Highball", "Martini", "Nick & Nora", "Flute"];

  /* ==========================================================================
     5. STATE MANAGEMENT
     ========================================================================== */
  const state = {
    mode: "classic", // classic, repair, family
    currentTicketIndex: 0,
    totalTicketsInShift: 10,
    currentCocktail: null,
    targetFieldType: null, // "ingredient_name", "measure", "method", "glass", "flaw"
    targetItemIndex: -1,
    correctAnswer: "",
    options: [],
    selectedConfidence: "certain", // certain (1.5x), likely (1.0x), guess (0.5x)
    shiftScore: 0,
    streak: 0,
    bestStreak: parseInt(localStorage.getItem("speccards_beststreak") || "0", 10),
    totalCompleted: parseInt(localStorage.getItem("speccards_completed") || "0", 10),
    correctCount: parseInt(localStorage.getItem("speccards_correct") || "0", 10),
    totalAttempts: parseInt(localStorage.getItem("speccards_attempts") || "0", 10),
    answered: false,
    selectedFamily: "All"
  };

  const audio = new SoundEngine();

  /* ==========================================================================
     6. DOM CACHE
     ========================================================================== */
  const DOM = {
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
    paramIceCell: document.getElementById("paramIceCell"),
    paramGarnishCell: document.getElementById("paramGarnishCell"),
    footnoteText: document.getElementById("footnoteText"),
    cardFootnote: document.getElementById("cardFootnote"),
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
     7. QUESTION GENERATION ENGINE
     ========================================================================== */

  function shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }

  function pickRandomExcept(pool, target, count) {
    const filtered = pool.filter(item => item !== target);
    const shuffled = shuffle(filtered);
    return shuffled.slice(0, count);
  }

  function generateTicket() {
    state.answered = false;
    DOM.diagnosisTray.classList.add("hidden");
    DOM.choiceMatrix.classList.remove("hidden");
    DOM.confidenceBar.classList.remove("hidden");
    DOM.btnHint.disabled = false;
    DOM.btnHint.style.opacity = "1";

    // Card entrance animation
    DOM.specCard.classList.remove("card-enter");
    void DOM.specCard.offsetWidth; // force reflow
    DOM.specCard.classList.add("card-enter");

    // Select cocktail
    let eligible = COCKTAIL_DATABASE;
    if (state.mode === "family" && state.selectedFamily !== "All") {
      eligible = COCKTAIL_DATABASE.filter(c => c.family.toLowerCase().includes(state.selectedFamily.toLowerCase()));
      if (eligible.length === 0) eligible = COCKTAIL_DATABASE;
    }
    const cocktail = eligible[Math.floor(Math.random() * eligible.length)];
    state.currentCocktail = cocktail;

    // Reset blank indicator borders
    DOM.paramMethodCell.classList.remove("is-blank-target");

    // Setup question type depending on game mode
    if (state.mode === "repair") {
      setupRepairMode(cocktail);
    } else {
      setupReconstructMode(cocktail);
    }

    renderCard(cocktail);
    renderChoices();
    updateRoundHUD();
  }

  function setupReconstructMode(cocktail) {
    // Choose what field to blank out:
    // 60% ingredient name, 25% measure, 15% method
    const dice = Math.random();
    if (dice < 0.60) {
      state.targetFieldType = "ingredient_name";
      state.targetItemIndex = Math.floor(Math.random() * cocktail.spec.length);
      state.correctAnswer = cocktail.spec[state.targetItemIndex].name;
      const distractors = pickRandomExcept(INGREDIENT_DISTRACTORS, state.correctAnswer, 3);
      state.options = shuffle([state.correctAnswer, ...distractors]);
      DOM.deckPrompt.textContent = `Identify the missing ${cocktail.spec[state.targetItemIndex].role}:`;
    } else if (dice < 0.85) {
      state.targetFieldType = "measure";
      state.targetItemIndex = Math.floor(Math.random() * cocktail.spec.length);
      state.correctAnswer = cocktail.spec[state.targetItemIndex].measure;
      const distractors = pickRandomExcept(MEASURE_DISTRACTORS, state.correctAnswer, 3);
      state.options = shuffle([state.correctAnswer, ...distractors]);
      DOM.deckPrompt.textContent = `Specify the correct pour for ${cocktail.spec[state.targetItemIndex].name}:`;
    } else {
      state.targetFieldType = "method";
      state.targetItemIndex = -1;
      state.correctAnswer = cocktail.method;
      DOM.paramMethodCell.classList.add("is-blank-target");
      const distractors = pickRandomExcept(METHOD_DISTRACTORS, state.correctAnswer, 3);
      state.options = shuffle([state.correctAnswer, ...distractors]);
      DOM.deckPrompt.textContent = "Specify the proper technique / method:";
    }
  }

  function setupRepairMode(cocktail) {
    // Deliberate mistake injected into either Glass, Method, or an Ingredient
    const flawType = Math.random() < 0.5 ? "glass" : "method";
    state.targetFieldType = "flaw";

    if (flawType === "glass") {
      const wrongGlasses = Object.keys(GLASS_SVGS).filter(g => g !== cocktail.glass);
      const injectedFlaw = wrongGlasses[Math.floor(Math.random() * wrongGlasses.length)];
      state.correctAnswer = `Glass is wrong (shows ${injectedFlaw}, belongs in ${cocktail.glass})`;
      state.options = shuffle([
        state.correctAnswer,
        "Method technique is incorrect",
        "Base spirit ratio is out of balance",
        "Modifier should be replaced"
      ]);
      cocktail._flawedGlass = injectedFlaw;
      delete cocktail._flawedMethod;
    } else {
      const wrongMethods = METHOD_DISTRACTORS.filter(m => m !== cocktail.method);
      const injectedFlaw = wrongMethods[Math.floor(Math.random() * wrongMethods.length)];
      state.correctAnswer = `Method is wrong (shows ${injectedFlaw}, should be ${cocktail.method})`;
      state.options = shuffle([
        state.correctAnswer,
        "Glassware selection is inappropriate",
        "Missing sweet acid counterpoint",
        "Garnish conflicts with aroma"
      ]);
      cocktail._flawedMethod = injectedFlaw;
      delete cocktail._flawedGlass;
    }
    DOM.deckPrompt.textContent = "CRITICAL DIAGNOSIS: Find the deliberate spec flaw:";
  }

  /* ==========================================================================
     8. CARD & UI RENDERING
     ========================================================================== */
  function renderCard(cocktail) {
    DOM.cardFamily.textContent = `${cocktail.family} FAMILY`;
    DOM.cardTitle.textContent = cocktail.name;
    DOM.cardEra.textContent = cocktail.era;

    // Glass display
    const activeGlass = (state.mode === "repair" && cocktail._flawedGlass) ? cocktail._flawedGlass : cocktail.glass;
    DOM.cardGlassCaption.textContent = activeGlass;
    DOM.glassSvgSlot.innerHTML = GLASS_SVGS[activeGlass] || GLASS_SVGS["Coupe"];

    // Ingredient list
    DOM.ingredientList.innerHTML = "";
    cocktail.spec.forEach((item, idx) => {
      const li = document.createElement("li");
      li.className = "spec-item";

      const isTarget = (state.targetItemIndex === idx && (state.targetFieldType === "ingredient_name" || state.targetFieldType === "measure"));

      if (isTarget) {
        li.classList.add("is-blank-target");
      }

      // Measure Slot
      const measureSpan = document.createElement("span");
      measureSpan.className = "spec-measure";
      if (isTarget && state.targetFieldType === "measure") {
        measureSpan.innerHTML = `<span class="blank-slot" aria-label="blank measure"></span>`;
      } else {
        measureSpan.textContent = item.measure;
      }

      // Name & Role Slot
      const textWrap = document.createElement("div");
      textWrap.className = "spec-name-role";

      const nameSpan = document.createElement("span");
      nameSpan.className = "spec-name";
      if (isTarget && state.targetFieldType === "ingredient_name") {
        nameSpan.innerHTML = `<span class="blank-slot" aria-label="blank ingredient name"></span>`;
      } else {
        nameSpan.textContent = item.name;
      }

      const roleSpan = document.createElement("span");
      roleSpan.className = "spec-role-tag";
      roleSpan.textContent = item.role;

      textWrap.appendChild(nameSpan);
      textWrap.appendChild(roleSpan);

      li.appendChild(measureSpan);
      li.appendChild(textWrap);
      DOM.ingredientList.appendChild(li);
    });

    // Service Grid Parameters
    const activeMethod = (state.mode === "repair" && cocktail._flawedMethod) ? cocktail._flawedMethod : cocktail.method;
    if (state.targetFieldType === "method") {
      DOM.paramMethodVal.innerHTML = `<span class="blank-slot" style="min-width:60px; height:16px;"></span>`;
    } else {
      DOM.paramMethodVal.textContent = activeMethod.toUpperCase();
    }

    DOM.paramIceVal.textContent = cocktail.ice.toUpperCase();
    DOM.paramGarnishVal.textContent = cocktail.garnish.toUpperCase();
    DOM.footnoteText.textContent = cocktail.footnote;
  }

  function renderChoices() {
    DOM.choiceMatrix.innerHTML = "";
    state.options.forEach((optText, i) => {
      const btn = document.createElement("button");
      btn.className = "choice-btn";
      btn.setAttribute("role", "button");
      btn.dataset.choice = optText;

      const label = document.createElement("span");
      label.className = "choice-text";
      label.textContent = optText;

      const kbd = document.createElement("span");
      kbd.className = "choice-kbd";
      kbd.textContent = `${i + 1}`;

      btn.appendChild(label);
      btn.appendChild(kbd);

      btn.addEventListener("click", () => handleAnswer(optText, btn));
      DOM.choiceMatrix.appendChild(btn);
    });
  }

  function updateRoundHUD() {
    DOM.roundCounter.textContent = `TICKET #${state.currentTicketIndex + 1} / ${state.totalTicketsInShift}`;
    DOM.streakVal.textContent = state.streak;
    DOM.scoreVal.textContent = state.shiftScore;
    
    // Mode Badge
    if (state.mode === "classic") DOM.modeBadge.textContent = "CLASSIC SHIFT";
    if (state.mode === "repair") DOM.modeBadge.textContent = "TROUBLESHOOT";
    if (state.mode === "family") DOM.modeBadge.textContent = `${state.selectedFamily.toUpperCase()} DRILL`;

    // Bartender Rank Badge based on streak & completed
    if (state.streak >= 12) DOM.diffBadge.textContent = "GRANDMASTER";
    else if (state.streak >= 6) DOM.diffBadge.textContent = "MIXOLOGIST";
    else if (state.streak >= 3) DOM.diffBadge.textContent = "SENIOR BARTENDER";
    else DOM.diffBadge.textContent = "BARTENDER";
  }

  /* ==========================================================================
     9. ANSWER HANDLING, DIAGNOSIS & SCORING
     ========================================================================== */
  function handleAnswer(chosenText, buttonElement) {
    if (state.answered) return;
    state.answered = true;
    state.totalAttempts++;

    // Disable all buttons in matrix
    const buttons = DOM.choiceMatrix.querySelectorAll(".choice-btn");
    buttons.forEach(b => (b.disabled = true));

    const isCorrect = (chosenText === state.correctAnswer);

    // Multipliers for confidence: certain (1.5), likely (1.0), guess (0.5)
    let confMultiplier = 1.0;
    if (state.selectedConfidence === "certain") confMultiplier = 1.5;
    if (state.selectedConfidence === "guess") confMultiplier = 0.5;

    if (isCorrect) {
      audio.playCorrect();
      buttonElement.classList.add("is-correct");

      state.streak++;
      if (state.streak > state.bestStreak) {
        state.bestStreak = state.streak;
        localStorage.setItem("speccards_beststreak", state.bestStreak.toString());
      }
      state.correctCount++;
      state.totalCompleted++;

      const basePoints = 100;
      const streakBonus = (state.streak - 1) * 20;
      const earned = Math.round((basePoints + streakBonus) * confMultiplier);
      state.shiftScore += earned;

      // Fill in blank visual instantly
      fillBlankWithAnswer(state.correctAnswer);

      // Present Diagnosis Tray
      DOM.diagBadge.className = "diag-badge correct";
      DOM.diagBadge.textContent = "SPEC CERTIFIED ✓";
      DOM.diagPoints.textContent = `+${earned} PTS (${state.selectedConfidence.toUpperCase()})`;
      DOM.diagReason.textContent = state.currentCocktail.diagnosis;
    } else {
      audio.playWrong();
      buttonElement.classList.add("is-wrong");

      // Highlight the correct one
      buttons.forEach(b => {
        if (b.dataset.choice === state.correctAnswer) {
          b.classList.add("is-correct");
        }
      });

      state.streak = 0;
      fillBlankWithAnswer(state.correctAnswer);

      DOM.diagBadge.className = "diag-badge wrong";
      DOM.diagBadge.textContent = "SPEC VIOLATION ✕";
      DOM.diagPoints.textContent = "+0 PTS (STREAK RESET)";
      DOM.diagReason.textContent = `Accurate spec requires: "${state.correctAnswer}". ${state.currentCocktail.diagnosis}`;
    }

    // Persist stats
    localStorage.setItem("speccards_completed", state.totalCompleted.toString());
    localStorage.setItem("speccards_correct", state.correctCount.toString());
    localStorage.setItem("speccards_attempts", state.totalAttempts.toString());

    updateRoundHUD();
    DOM.diagnosisTray.classList.remove("hidden");
    DOM.btnNextTicket.focus();
  }

  function fillBlankWithAnswer(answerText) {
    if (state.targetFieldType === "ingredient_name") {
      const el = DOM.ingredientList.querySelector(".is-blank-target .spec-name");
      if (el) el.textContent = answerText;
    } else if (state.targetFieldType === "measure") {
      const el = DOM.ingredientList.querySelector(".is-blank-target .spec-measure");
      if (el) el.textContent = answerText;
    } else if (state.targetFieldType === "method") {
      DOM.paramMethodVal.textContent = answerText.toUpperCase();
    }
  }

  function nextTicket() {
    audio.playClick();
    state.currentTicketIndex++;
    if (state.currentTicketIndex >= state.totalTicketsInShift) {
      finishShift();
    } else {
      generateTicket();
    }
  }

  function finishShift() {
    audio.playCorrect();
    DOM.diagnosisTray.classList.remove("hidden");
    DOM.choiceMatrix.classList.add("hidden");
    DOM.confidenceBar.classList.add("hidden");

    DOM.diagBadge.className = "diag-badge correct";
    DOM.diagBadge.textContent = "SERVICE COMPLETED";
    DOM.diagPoints.textContent = `FINAL SCORE: ${state.shiftScore}`;
    DOM.diagReason.textContent = `Shift complete with ${state.correctCount} correct specs. Your bartender intuition is calibrated.`;

    DOM.btnNextTicket.innerHTML = `<span>START NEW SHIFT</span><span class="kbd-sub">↵ [ENTER]</span>`;
    DOM.btnNextTicket.onclick = () => {
      state.currentTicketIndex = 0;
      state.shiftScore = 0;
      DOM.btnNextTicket.innerHTML = `<span>NEXT TICKET</span><span class="kbd-sub">↵ [ENTER]</span>`;
      DOM.btnNextTicket.onclick = nextTicket;
      generateTicket();
    };
  }

  /* ==========================================================================
     10. HINT & CONFIDENCE MECHANICS
     ========================================================================== */
  function revealHint() {
    if (state.answered) return;
    audio.playClick();
    DOM.btnHint.disabled = true;
    DOM.btnHint.style.opacity = "0.5";

    if (state.targetItemIndex >= 0 && state.currentCocktail.spec[state.targetItemIndex]) {
      const role = state.currentCocktail.spec[state.targetItemIndex].role;
      DOM.deckPrompt.textContent = `HINT: This element functions as the "${role}".`;
    } else {
      DOM.deckPrompt.textContent = `HINT: Note the dilution rate and glass shape: ${state.currentCocktail.glass}.`;
    }
  }

  function setupConfidenceEvents() {
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
     11. CODEX, STATS & ATLAS MODAL
     ========================================================================== */
  function renderCodex(filterText = "") {
    DOM.codexGrid.innerHTML = "";
    const needle = filterText.toLowerCase();

    const matched = COCKTAIL_DATABASE.filter(c => {
      return (
        c.name.toLowerCase().includes(needle) ||
        c.family.toLowerCase().includes(needle) ||
        c.baseSpirit.toLowerCase().includes(needle)
      );
    });

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
    if (state.totalCompleted >= 50 && pct >= 80) rank = "Grandmaster Mixologist";
    else if (state.totalCompleted >= 25) rank = "Senior Bartender";
    else if (state.totalCompleted >= 10) rank = "Working Bartender";
    DOM.stMasteryRank.textContent = rank;

    // Render family bars
    const families = ["Sour", "Old Fashioned", "Daisy", "Bitter / Aperitivo", "Martini", "Highball"];
    DOM.familyMeterList.innerHTML = "";

    families.forEach(fam => {
      // Calculate random/calculated mastery indicator
      const count = COCKTAIL_DATABASE.filter(c => c.family.includes(fam)).length;
      const progressPct = Math.min(100, Math.round((state.totalCompleted / (count * 2 || 1)) * 100));

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
    // Glassware
    DOM.glassAtlasGrid.innerHTML = "";
    Object.keys(GLASS_SVGS).forEach(glassName => {
      const card = document.createElement("div");
      card.className = "glass-card";
      card.innerHTML = `
        <div class="glass-svg-wrap" style="width:36px; height:40px;">${GLASS_SVGS[glassName]}</div>
        <span class="glass-card-name">${glassName}</span>
        <span class="glass-card-desc">Chilling &amp; Presentation</span>
      `;
      DOM.glassAtlasGrid.appendChild(card);
    });

    // Families guide
    const FAMILIES_GUIDE = [
      { name: "The Sour", desc: "Core formula: 2 oz Base Spirit + 0.75 oz Citrus Acid + 0.75 oz Sweetener. Emulsified with egg white for foam." },
      { name: "The Daisy", desc: "A sour sweetened by a cordial or liqueur (e.g. Cointreau in Margarita and Sidecar)." },
      { name: "The Old Fashioned", desc: "Spirit-forward construction: 2 oz Whiskey or Aged Spirit + sugar cube or syrup + aromatic bitters over dense ice." },
      { name: "The Highball / Collins", desc: "A spirit and acid base built tall over dense spear ice and lengthened with fresh carbonated water." },
      { name: "The Equal Parts Aperitivo", desc: "Balanced bitterness and botanical sweetness (e.g. Negroni, Last Word, Boulevardier)." }
    ];

    DOM.guideFamiliesList.innerHTML = "";
    FAMILIES_GUIDE.forEach(f => {
      const box = document.createElement("div");
      box.className = "guide-fam-box";
      box.innerHTML = `
        <div class="guide-fam-head">${f.name}</div>
        <div class="guide-fam-body">${f.desc}</div>
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
     12. KEYBOARD & INPUT SHORTCUTS
     ========================================================================== */
  function handleKeyboard(e) {
    // If modal is open, Escape closes it
    if (!DOM.modalBackdrop.classList.contains("hidden")) {
      if (e.key === "Escape") closeModal();
      return;
    }

    if (e.key >= "1" && e.key <= "4") {
      const idx = parseInt(e.key, 10) - 1;
      const buttons = DOM.choiceMatrix.querySelectorAll(".choice-btn");
      if (buttons[idx] && !buttons[idx].disabled) {
        buttons[idx].click();
      }
    } else if (e.key === "Enter" || e.key === " ") {
      if (!DOM.diagnosisTray.classList.contains("hidden")) {
        e.preventDefault();
        DOM.btnNextTicket.click();
      }
    } else if (e.key.toLowerCase() === "h") {
      DOM.btnHint.click();
    }
  }

  /* ==========================================================================
     13. INITIALIZATION & BINDINGS
     ========================================================================== */
  function bindEvents() {
    DOM.btnNextTicket.addEventListener("click", nextTicket);
    DOM.btnHint.addEventListener("click", revealHint);
    window.addEventListener("keydown", handleKeyboard);

    // Audio Mute toggle
    DOM.btnAudioToggle.addEventListener("click", () => {
      const isMuted = audio.toggleMute();
      DOM.iconSoundOn.classList.toggle("hidden", isMuted);
      DOM.iconSoundOff.classList.toggle("hidden", !isMuted);
      if (!isMuted) audio.playClick();
    });

    // Update sound icons on initial load
    if (audio.muted) {
      DOM.iconSoundOn.classList.add("hidden");
      DOM.iconSoundOff.classList.remove("hidden");
    }

    // Open/close Modal
    DOM.btnOpenMenu.addEventListener("click", openModal);
    DOM.btnCloseModal.addEventListener("click", closeModal);
    DOM.modalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.modalBackdrop) closeModal();
    });

    // Subnav tabs in modal
    DOM.subnavButtons.forEach(btn => {
      btn.addEventListener("click", () => {
        audio.playClick();
        DOM.subnavButtons.forEach(b => b.classList.remove("active"));
        DOM.modalPanes.forEach(p => p.classList.remove("active"));
        btn.classList.add("active");
        const paneId = btn.dataset.pane;
        const targetPane = document.getElementById(paneId);
        if (targetPane) targetPane.classList.add("active");
      });
    });

    // Codex live filter
    DOM.codexSearch.addEventListener("input", (e) => {
      renderCodex(e.target.value);
    });

    // Mode tabs
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
        state.currentTicketIndex = 0;
        generateTicket();
      });
    });

    // Reset progress button
    DOM.btnResetProgress.addEventListener("click", () => {
      if (confirm("Reset all stored cocktail mastery progress?")) {
        localStorage.removeItem("speccards_completed");
        localStorage.removeItem("speccards_correct");
        localStorage.removeItem("speccards_attempts");
        localStorage.removeItem("speccards_beststreak");
        state.totalCompleted = 0;
        state.correctCount = 0;
        state.totalAttempts = 0;
        state.bestStreak = 0;
        state.streak = 0;
        renderStats();
        updateRoundHUD();
        closeModal();
      }
    });

    setupConfidenceEvents();
  }

  function init() {
    bindEvents();
    generateTicket();
  }

  // Fire engine on DOM ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();