/**
 * SPEC CARDS — COMPLETE GAME ENGINE & COCKTAIL KNOWLEDGE ARCHITECTURE
 * Fully continuous state, navigation, per-family tracking, and persistence engine.
 */

(function () {
  "use strict";

  /* ==========================================================================
     1. ROBUST LOCALSTORAGE PERSISTENCE ENGINE
     ========================================================================== */
  const STORAGE_KEY = "speccards_app_data_v2";

  const defaultStorageData = {
    version: 2,
    sound: "on",
    preferredMode: "classic",
    highScore: 0,
    bestStreak: 0,
    totalCompleted: 0,
    correctCount: 0,
    totalAttempts: 0,
    familyMastery: {
      "Sour": { attempts: 0, correct: 0 },
      "Daisy": { attempts: 0, correct: 0 },
      "Old Fashioned": { attempts: 0, correct: 0 },
      "Bitter / Aperitivo": { attempts: 0, correct: 0 },
      "Martini": { attempts: 0, correct: 0 },
      "Highball / Collins": { attempts: 0, correct: 0 }
    }
  };

  function loadStoredState() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return JSON.parse(JSON.stringify(defaultStorageData));
      const parsed = JSON.parse(raw);
      if (typeof parsed !== "object" || parsed === null) {
        return JSON.parse(JSON.stringify(defaultStorageData));
      }

      return {
        ...defaultStorageData,
        ...parsed,
        familyMastery: {
          ...defaultStorageData.familyMastery,
          ...(parsed.familyMastery || {})
        }
      };
    } catch {
      return JSON.parse(JSON.stringify(defaultStorageData));
    }
  }

  function saveStoredState(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch {
      /* In-memory fallback */
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
        osc.frequency.exponentialRampToValueAtTime(180, this.ctx.currentTime + 0.04);
        gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, this.ctx.currentTime + 0.04);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start();
        osc.stop(this.ctx.currentTime + 0.04);
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
          osc.frequency.setValueAtTime(freq, t + idx * 0.05);
          gain.gain.setValueAtTime(0, t);
          gain.gain.setValueAtTime(0.12, t + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.05 + 0.28);
          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t + idx * 0.05);
          osc.stop(t + idx * 0.05 + 0.3);
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
        osc.frequency.exponentialRampToValueAtTime(80, t + 0.2);
        gain.gain.setValueAtTime(0.14, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(t);
        osc.stop(t + 0.2);
      } catch {}
    }
  }

  const audio = new SoundEngine();

  /* ==========================================================================
     3. SVG GLASSWARE ATLAS
     ========================================================================== */
  const GLASS_SVGS = {
    Coupe: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <path d="M6 14 C12 28 36 28 42 14 Z" /> <line x1="24" y1="26" x2="24" y2="40" /> <line x1="15" y1="40" x2="33" y2="40" /> </svg>`,
    Rocks: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="10,10 38,10 35,40 13,40" /> <line x1="14" y1="20" x2="34" y2="20" stroke-dasharray="2 2" opacity="0.6"/> </svg>`,
    Highball: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="14,8 34,8 32,42 16,42" /> <line x1="15" y1="18" x2="33" y2="18" stroke-dasharray="2 2" opacity="0.6"/> </svg>`,
    Martini: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="6,12 42,12 24,28" /> <line x1="24" y1="28" x2="24" y2="40" /> <line x1="14" y1="40" x2="34" y2="40" /> </svg>`,
    "Nick & Nora": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 12 C12 24 36 24 36 12 Z" /> <line x1="24" y1="24" x2="24" y2="40" /> <line x1="16" y1="40" x2="32" y2="40" /> </svg>`,
    Collins: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="15,6 33,6 31,42 17,42" /> <line x1="16" y1="16" x2="32" y2="16" stroke-dasharray="2 2" opacity="0.6"/> </svg>`,
    "Champagne Flute": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <path d="M18 6 L30 6 L28 26 C28 30 24 32 24 32 C24 32 20 30 20 26 Z" /> <line x1="24" y1="32" x2="24" y2="42" /> <line x1="17" y1="42" x2="31" y2="42" /> </svg>`,
    "Julep Cup": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="12,12 36,12 33,40 15,40" /> <line x1="10" y1="12" x2="38" y2="12" /> <line x1="13" y1="40" x2="35" y2="40" stroke-width="2.6" /> </svg>`,
    Snifter: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <path d="M16 10 C12 18 10 24 10 29 C10 36 16 38 24 38 C32 38 38 36 38 29 C38 24 36 18 32 10 Z" /> <line x1="24" y1="38" x2="24" y2="42" /> <line x1="18" y1="42" x2="30" y2="42" /> </svg>`
  };

  /* ==========================================================================
     4. COMPREHENSIVE COCKTAIL DATABASE
     ========================================================================== */
  // >>> KEEP YOUR COCKTAIL_DATABASE ARRAY HERE <<<

  /* ==========================================================================
     4. COMPREHENSIVE COCKTAIL DATABASE (33 HIGH-DETAIL CANONICAL SPECS)
     ========================================================================== */
  const COCKTAIL_DATABASE = [
    {
      id: "whiskey-sour",
      name: "Whiskey Sour",
      family: "Sour",
      era: "1860s • American Classic",
      baseSpirit: "Bourbon or Rye Whiskey",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Dry Shake, then Shake with Ice",
      garnish: "Angostura Drops & Lemon Twist",
      footnote: "Dry shaking without ice emulsifies the egg white proteins prior to cold dilution.",
      spec: [
        { measure: "2.0 oz", name: "Bourbon or Rye Whiskey", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Rich Simple Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "0.5 oz", name: "Egg White (Optional)", role: "Textural Agent" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Specify the core base spirit required for the Whiskey Sour:",
          correctAnswer: "Bourbon or Rye Whiskey",
          options: ["Bourbon or Rye Whiskey", "London Dry Gin", "Blanco Tequila", "Aged Rum"],
          hint: "Provides the barrel proof and oak tannins necessary to balance tart lemon.",
          diagnosis: "Bourbon or rye whiskey supplies the proof and vanilla-oak structure to balance 0.75 oz lemon and rich syrup."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Bottled Sweet & Sour Powder Mix (FLAW)",
          correctIngredientName: "Fresh Lemon Juice & Simple Syrup",
          prompt: "RECIPE AUDIT: Identify the fatal flaw ruining this Whiskey Sour spec:",
          correctAnswer: "Powdered sour mix ruins natural citrus brightness and foaming texture",
          options: [
            "Powdered sour mix ruins natural citrus brightness and foaming texture",
            "Bourbon must never be combined with citrus",
            "Egg whites must be cooked prior to mixing",
            "Whiskey Sours must be served hot in a mug"
          ],
          hint: "Commercial powdered mixes introduce synthetic preservatives and chemical astringency.",
          diagnosis: "Fresh lemon juice balanced with pure sucrose is mandatory; commercial sour powders destroy natural acidity and foam."
        },
        family: {
          type: "measure",
          targetIndex: 1,
          prompt: "Identify the canonical acid pour in the standard 2:0.75:0.75 Sour template:",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "0.25 oz", "1.25 oz", "1.5 oz"],
          hint: "The golden sour ratio balances 2 oz spirit with equal parts acid and 2:1 sugar.",
          diagnosis: "Standard craft sour ratio employs 0.75 oz fresh citrus to temper 2.0 oz 80-100 proof spirit."
        }
      }
    },
    {
      id: "negroni",
      name: "Negroni",
      family: "Bitter / Aperitivo",
      era: "1919 • Florence, Italy",
      baseSpirit: "London Dry Gin",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Stir Thoroughly",
      garnish: "Expressed Orange Peel",
      footnote: "Equal-parts construction relying on chilling and controlled thermal dilution over dense ice.",
      spec: [
        { measure: "1.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Campari", role: "Bitter Aperitif" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" }
      ],
      modes: {
        classic: {
          type: "measure",
          targetIndex: 1,
          prompt: "Specify the canonical pour measure for Campari in a classic Negroni:",
          correctAnswer: "1.0 oz",
          options: ["1.0 oz", "0.5 oz", "1.5 oz", "2.0 oz"],
          hint: "The classic Negroni is built on strict equal-parts harmony.",
          diagnosis: "A canonical Negroni demands equal parts (1.0 oz each) of gin, Campari, and sweet vermouth."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Campari 2.0 oz (FLAW)",
          correctIngredientName: "Campari (Equal Parts 1.0 oz)",
          prompt: "RECIPE AUDIT: Identify the flaw that breaks Negroni harmony:",
          correctAnswer: "Over-Bitter: Campari is poured at 2.0 oz instead of 1.0 oz",
          options: [
            "Over-Bitter: Campari is poured at 2.0 oz instead of 1.0 oz",
            "Base Spirit: Should use peated Scotch whisky",
            "Service Method: Must be shaken with crushed ice",
            "Glassware: Must be served in a Champagne flute"
          ],
          hint: "Look at the proportions—the aperitif overpoweringly exceeds the gin and vermouth.",
          diagnosis: "Equal parts is essential to the Negroni. Doubling the bitter modifier masks the botanicals and destroys balance."
        },
        family: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which aromatized wine completes the Negroni 1:1:1 formula?",
          correctAnswer: "Sweet Red Vermouth",
          options: ["Sweet Red Vermouth", "Dry French Vermouth", "Fino Sherry", "Ruby Port"],
          hint: "This Italian Torino vermouth provides sweetness and herbal bitterness.",
          diagnosis: "Sweet red (Torino) vermouth balances the assertive gentian bitterness of Campari and the dry juniper of gin."
        }
      }
    },
    {
      id: "old-fashioned",
      name: "Old Fashioned",
      family: "Old Fashioned",
      era: "1880s • Pendennis Club / Louisville",
      baseSpirit: "Rye or Bourbon Whiskey",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Stir Thoroughly",
      garnish: "Expressed Orange & Brandied Cherry",
      footnote: "The primogenitor cocktail: spirit, sugar, water (ice dilution), and aromatic bitters.",
      spec: [
        { measure: "2.0 oz", name: "Rye or Bourbon Whiskey", role: "Base Spirit" },
        { measure: "1 barspoon", name: "Demerara Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "2 dashes", name: "Angostura Aromatic Bitters", role: "Bitter Accent" }
      ],
      modes: {
        classic: {
          type: "method",
          targetIndex: -1,
          prompt: "Specify the proper technique and service parameter for an Old Fashioned:",
          correctAnswer: "Stir Thoroughly",
          options: [
            "Stir Thoroughly",
            "Hard Shake & Fine Strain",
            "Build in Glass & Top with Club Soda",
            "Muddle Citrus Flesh & Flash Blend"
          ],
          hint: "Spirit-forward drinks without citrus juice require gentle stirring to prevent cloudiness.",
          diagnosis: "Stirring gently incorporates cold dilution without chipping ice or introducing aerated bubbles."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Muddled Maraschino Cherry & Orange Slice in Pint Glass (FLAW)",
          correctIngredientName: "Demerara Syrup & Expressed Citrus Peel",
          prompt: "RECIPE AUDIT: Identify the Prohibition-era flaw distorting the classic Old Fashioned:",
          correctAnswer: "Muddling fruit pulp creates an over-diluted fruit compote",
          options: [
            "Muddling fruit pulp creates an over-diluted fruit compote",
            "Rye whiskey is too spicy and should be replaced by vodka",
            "Bitters should never be used in an Old Fashioned",
            "It must be served boiling hot in a mug"
          ],
          hint: "Muddling fruit slices with granulated sugar was an old trick to mask bathtub whiskey.",
          diagnosis: "Craft practice avoids pulverizing fruit pulp into the drink. Expressing oils over the glass provides clean aroma without muddy fruit residue."
        },
        family: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "What indispensable accent bridges the whiskey and sweetener in this family?",
          correctAnswer: "Aromatic Bitters (Angostura)",
          options: [
            "Aromatic Bitters (Angostura)",
            "Heavy Whipping Cream",
            "Fresh Lime Juice",
            "Sparkling Mineral Water"
          ],
          hint: "Bitters are defined as the seasoning that makes an Old Fashioned a 'cocktail'.",
          diagnosis: "Bitters tie together the proof of the spirit and the richness of the sugar."
        }
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
      method: "Hard Shake & Double Strain",
      garnish: "Lime Wheel & Half-Salt Rim",
      footnote: "A classic Daisy: spirit, citrus acid, and an orange liqueur modifier.",
      spec: [
        { measure: "2.0 oz", name: "Blanco Tequila", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Cointreau / Orange Liqueur", role: "Orange Cordial Modifier" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Identify the orange cordial modifier that defines the Margarita as a Daisy:",
          correctAnswer: "Cointreau / Orange Liqueur",
          options: ["Cointreau / Orange Liqueur", "Maraschino Liqueur", "Sweet Vermouth", "Crème de Violette"],
          hint: "A Daisy cocktail swaps plain simple syrup for a fruit cordial or liqueur.",
          diagnosis: "A Daisy template balances base spirit with fresh citrus and an orange liqueur like Cointreau."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Bottled Sweet & Sour Margarita Mix (FLAW)",
          correctIngredientName: "Fresh Lime Juice",
          prompt: "RECIPE AUDIT: Identify the chemical shortcut compromising this Margarita:",
          correctAnswer: "Commercial sour mix replaces real freshly squeezed lime juice",
          options: [
            "Commercial sour mix replaces real freshly squeezed lime juice",
            "Tequila must be substituted with unaged rum",
            "Salt should never touch glassware rims",
            "Margaritas are traditionally stirred in a beaker"
          ],
          hint: "The acid must originate entirely from cold-pressed fresh citrus fruit.",
          diagnosis: "Bottled mixes introduce artificial citric acid powders and preservatives that mask agave terroir."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which spirit provides the herbaceous, vegetal backbone of the Margarita?",
          correctAnswer: "Blanco Tequila",
          options: ["Blanco Tequila", "Cognac", "London Dry Gin", "White Rum"],
          hint: "An unaged blue agave distillate from Jalisco.",
          diagnosis: "Blanco tequila provides clean, peppery agave character that sings alongside lime and triple sec."
        }
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
      method: "Stir Thoroughly & Strain",
      garnish: "Lemon Twist or Castelvetrano Olive",
      footnote: "Stirring protects botanical clarity and produces a silky, crystal-clear texture without aeration.",
      spec: [
        { measure: "2.5 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Dry French Vermouth", role: "Fortified Modifier" },
        { measure: "1 dash", name: "Orange Bitters", role: "Aromatic Accent" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Specify the fortified wine modifier that completes the Dry Martini:",
          correctAnswer: "Dry French Vermouth",
          options: ["Dry French Vermouth", "Sweet Red Vermouth", "Green Chartreuse", "Maraschino Liqueur"],
          hint: "This dry, herbal aromatized wine softens juniper proof without adding sugar.",
          diagnosis: "Dry French vermouth imparts herbal acidity to round out high-proof gin without cloying sweetness."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Violently Shaken until Frothy with Ice Shards (FLAW)",
          correctIngredientName: "Gently Stirred to Velvety Clarity",
          prompt: "RECIPE AUDIT: Identify the technique error on this classic Martini ticket:",
          correctAnswer: "Shaking creates unwanted ice shards and cloudy aeration",
          options: [
            "Shaking creates unwanted ice shards and cloudy aeration",
            "A Martini should never contain gin",
            "Vermouth must be boiled in a copper pan first",
            "The glass should be warmed under hot water"
          ],
          hint: "Spirit-forward cocktails without juice should remain crystal-clear and un-aerated.",
          diagnosis: "Shaking introduces air bubbles, clouds the drink, and breaks tiny ice chips that over-dilute the palate."
        },
        family: {
          type: "measure",
          targetIndex: 1,
          prompt: "What is the standard ratio of dry vermouth to 2.5 oz gin in a balanced 5:1 Dry Martini?",
          correctAnswer: "0.5 oz",
          options: ["0.5 oz", "1.5 oz", "2.0 oz", "0.0 oz (None)"],
          hint: "5 parts gin (2.5 oz) to 1 part dry vermouth.",
          diagnosis: "A 5:1 proportion translates to 2.5 oz gin and 0.5 oz dry vermouth."
        }
      }
    },
    {
      id: "daiquiri",
      name: "Daiquiri",
      family: "Sour",
      era: "1898 • Daiquiri, Cuba",
      baseSpirit: "White Rum",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Hard Shake & Fine Strain",
      garnish: "Dehydrated Lime Wheel",
      footnote: "The purest expression of the sour: sugar cane distillate, crisp lime acid, and sucrose.",
      spec: [
        { measure: "2.0 oz", name: "White Rum", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Rich Simple Syrup (2:1)", role: "Sweet Modifier" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Identify the base spirit that defines the Cuban Daiquiri:",
          correctAnswer: "White Rum",
          options: ["White Rum", "Bourbon Whiskey", "Blanco Tequila", "Mezcal"],
          hint: "A clean, lightly aged and charcoal-filtered sugarcane distillate.",
          diagnosis: "White rum provides clean grassy and cane sugar notes that marry with fresh lime and sucrose."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Industrial Frozen Strawberry Slush Puree (FLAW)",
          correctIngredientName: "Rich Simple Syrup (2:1)",
          prompt: "RECIPE AUDIT: Identify the deviation from authentic Daiquiri spec:",
          correctAnswer: "Synthetic strawberry slush replaces the classic 3-ingredient balance",
          options: [
            "Synthetic strawberry slush replaces the classic 3-ingredient balance",
            "White rum should be swapped for spiced rum",
            "Daiquiris should be served in a ceramic tiki mug",
            "Lime juice must be heated before shaking"
          ],
          hint: "A true classic Daiquiri is never an electric-blender fruit slush.",
          diagnosis: "The authentic classic Daiquiri is a shaken coupe cocktail of rum, lime, and simple syrup."
        },
        family: {
          type: "measure",
          targetIndex: 2,
          prompt: "In a 2:0.75:0.75 Cuban Sour ratio, what measure of rich syrup balances 0.75 oz lime?",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "0.25 oz", "1.5 oz", "2.0 oz"],
          hint: "Equal parts balance with the 0.75 oz fresh lime.",
          diagnosis: "0.75 oz of 2:1 simple syrup provides the exact density needed to balance 0.75 oz lime juice."
        }
      }
    },
    {
      id: "tom-collins",
      name: "Tom Collins",
      family: "Highball / Collins",
      era: "1870s • Jerry Thomas Classic",
      baseSpirit: "Old Tom or London Dry Gin",
      glass: "Collins",
      ice: "Column Ice Spears",
      method: "Shake Core, Strain over Ice, Top with Club Soda",
      garnish: "Lemon Wheel & Maraschino Cherry",
      footnote: "An elongated sour: botanical spirit, citrus, sugar, topped with effervescent carbonated water.",
      spec: [
        { measure: "2.0 oz", name: "Old Tom or London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Simple Syrup", role: "Sweet Modifier" },
        { measure: "2.5 oz", name: "Club Soda", role: "Effervescent Lengthener" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which lengthener transforms a gin sour into a Tom Collins?",
          correctAnswer: "Club Soda",
          options: ["Club Soda", "Tonic Water", "Ginger Beer", "Champagne"],
          hint: "Unflavored carbonated water provides effervescence without altering sugar balance.",
          diagnosis: "Club soda lengthens the sour into a tall, refreshing highball without adding sweetness."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Club Soda Shaken Inside Sealed Tin with Ice (FLAW)",
          correctIngredientName: "Club Soda Poured Gently as Top",
          prompt: "RECIPE AUDIT: Identify the technique hazard on this Collins ticket:",
          correctAnswer: "Shaking carbonated soda inside a sealed shaker causes violent pressure release",
          options: [
            "Shaking carbonated soda inside a sealed shaker causes violent pressure release",
            "Gin cannot be mixed with lemon juice",
            "Tom Collins must be served boiling warm",
            "Lemon wheels must be caramelized"
          ],
          hint: "Never shake carbonated liquids inside a cocktail shaker.",
          diagnosis: "Effervescent toppers must always be built on top after shaking the sour core, never shaken in the tin."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "Specify the standard spirit pour for a classic Collins build:",
          correctAnswer: "2.0 oz",
          options: ["2.0 oz", "0.5 oz", "3.5 oz", "1.0 oz"],
          hint: "Full base spirit pour ensures botanical presence survives soda dilution.",
          diagnosis: "2.0 oz base spirit ensures gin botanicals remain distinct after adding club soda."
        }
      }
    },
    {
      id: "manhattan",
      name: "Manhattan",
      family: "Old Fashioned",
      era: "1870s • Manhattan Club, NYC",
      baseSpirit: "Rye Whiskey",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Stir Thoroughly & Strain",
      garnish: "Brandied Cherry",
      footnote: "The classic 2:1 formula: American rye whiskey balanced by Italian vermouth and aromatic bitters.",
      spec: [
        { measure: "2.0 oz", name: "Rye Whiskey", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
        { measure: "2 dashes", name: "Angostura Bitters", role: "Aromatic Accent" }
      ],
      modes: {
        classic: {
          type: "measure",
          targetIndex: 1,
          prompt: "Specify the classic pour of sweet vermouth in a standard 2:1 Manhattan:",
          correctAnswer: "1.0 oz",
          options: ["1.0 oz", "0.25 oz", "2.0 oz", "0.5 oz"],
          hint: "Standard 2:1 rye-to-vermouth architectural ratio.",
          diagnosis: "The canonical Manhattan formula pairs 2 parts rye (2.0 oz) with 1 part sweet vermouth (1.0 oz)."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 0,
          flawIngredientDisplay: "Neutral Grain Vodka 2.0 oz (FLAW)",
          correctIngredientName: "Rye Whiskey 2.0 oz",
          prompt: "RECIPE AUDIT: Identify the base spirit flaw on this Manhattan ticket:",
          correctAnswer: "Neutral vodka lacks the barrel oak and rye grain spice needed to carry vermouth",
          options: [
            "Neutral vodka lacks the barrel oak and rye grain spice needed to carry vermouth",
            "Manhattans must only be made with dark rum",
            "Sweet vermouth is illegal in Manhattan builds",
            "Bitters must be omitted completely"
          ],
          hint: "A Manhattan requires the barrel age and spicy grain bill of American rye whiskey.",
          diagnosis: "Rye whiskey provides the high proof and spicy tannins necessary to balance sweet vermouth."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Identify the fortified wine modifier in the standard Manhattan:",
          correctAnswer: "Sweet Red Vermouth",
          options: ["Sweet Red Vermouth", "Dry French Vermouth", "Triple Sec", "Apricot Brandy"],
          hint: "An Italian Torino vermouth bringing caramel and botanical complexity.",
          diagnosis: "Sweet red vermouth introduces herbal depth and round sucrose to temper high-proof whiskey."
        }
      }
    },
    {
      id: "sazerac",
      name: "Sazerac",
      family: "Old Fashioned",
      era: "1850s • New Orleans Classic",
      baseSpirit: "Rye Whiskey",
      glass: "Rocks",
      ice: "None (Served Neat Chilled)",
      method: "Stir Whiskey & Bitters; Strain into Absinthe-Rinsed Glass",
      garnish: "Expressed Lemon Peel (Discarded)",
      footnote: "The absinthe rinse lines the chilled glass with anethole aromas without overwhelming the whiskey.",
      spec: [
        { measure: "2.0 oz", name: "Rye Whiskey", role: "Base Spirit" },
        { measure: "1 barspoon", name: "Demerara Syrup", role: "Sweet Modifier" },
        { measure: "3 dashes", name: "Peychaud's Bitters", role: "Anise/Floral Bitters" },
        { measure: "1 rinse", name: "Absinthe", role: "Aromatic Glass Rinse" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which specific bitters are essential to an authentic New Orleans Sazerac?",
          correctAnswer: "Peychaud's Bitters",
          options: ["Peychaud's Bitters", "Orange Bitters", "Celery Bitters", "Walnut Bitters"],
          hint: "Bright red, gentian-and-anise bitters created by Antoine Peychaud.",
          diagnosis: "Peychaud's bitters impart bright floral anise notes and the signature ruby hue."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "1.0 oz Absinthe Poured Directly into Shaker (FLAW)",
          correctIngredientName: "Absinthe Glass Rinse (Discarded)",
          prompt: "RECIPE AUDIT: Identify the severe flavor flaw in this Sazerac preparation:",
          correctAnswer: "Excess absinthe drowns out the rye whiskey and bitters",
          options: [
            "Excess absinthe drowns out the rye whiskey and bitters",
            "Sazeracs should be made with dry gin",
            "Glass must be packed with warm tap water",
            "Peychaud's bitters should be swapped for chocolate syrup"
          ],
          hint: "Absinthe should only coat the interior glass wall as an aromatic wash.",
          diagnosis: "Absinthe has tremendous flavor intensity; pouring a full ounce overpowers the drink completely."
        },
        family: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which anise spirit is swirled and discarded to coat the chilled rocks glass?",
          correctAnswer: "Absinthe",
          options: ["Absinthe", "Chartreuse", "Campari", "Sambuca"],
          hint: "Wormwood and fennel based spirit with high ABV and powerful aromatics.",
          diagnosis: "An absinthe wash provides an aromatic frame without dominating the palate."
        }
      }
    },
    {
      id: "mai-tai",
      name: "Mai Tai",
      family: "Daisy",
      era: "1944 • Trader Vic, Oakland",
      baseSpirit: "Aged Jamaican & Martinique Rums",
      glass: "Rocks",
      ice: "Crushed Ice",
      method: "Short Shake & Dump onto Crushed Ice",
      garnish: "Fresh Mint Sprig & Spent Lime Half",
      footnote: "Created to showcase aged rum; orgeat provides rich nutty almond sweetness and mouthfeel.",
      spec: [
        { measure: "2.0 oz", name: "Blended Aged Rum", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Orange Curaçao", role: "Citrus Liqueur" },
        { measure: "0.5 oz", name: "Orgeat Syrup", role: "Almond Emulsion" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which almond syrup emulsion gives the Mai Tai its distinctive rich mouthfeel?",
          correctAnswer: "Orgeat Syrup",
          options: ["Orgeat Syrup", "Grenadine", "Falernum", "Honey Syrup"],
          hint: "A French almond, sugar, and orange flower water emulsion.",
          diagnosis: "Orgeat supplies creamy almond sweetness and floral complexity essential to the 1944 Trader Vic formula."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Pineapple Juice 4.0 oz & Grenadine Float (FLAW)",
          correctIngredientName: "Fresh Lime Juice & Orange Curaçao",
          prompt: "RECIPE AUDIT: Identify the tourist resort corruption of the 1944 Mai Tai spec:",
          correctAnswer: "Commercial fruit juice blend replaces the clean lime, curacao, and orgeat profile",
          options: [
            "Commercial fruit juice blend replaces the clean lime, curacao, and orgeat profile",
            "Rum is never used in Polynesian drinks",
            "Mai Tais must be served warm without ice",
            "Mint sprig should be muddled into paste"
          ],
          hint: "The original Mai Tai contains zero pineapple or orange juice.",
          diagnosis: "Adding pineapple juice and grenadine is an artificial resort shortcut that dilutes the aged rum profile."
        },
        family: {
          type: "measure",
          targetIndex: 3,
          prompt: "What is the proper measure of fresh lime juice in a canonical 1944 Mai Tai?",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "0.25 oz", "1.5 oz", "2.0 oz"],
          hint: "Balances the combined sweetness of curaçao and orgeat.",
          diagnosis: "0.75 oz lime juice cuts through the rich nutty syrups and proof of the aged rum."
        }
      }
    },
    {
      id: "french-75",
      name: "French 75",
      family: "Highball / Collins",
      era: "1915 • New York Bar, Paris",
      baseSpirit: "London Dry Gin",
      glass: "Champagne Flute",
      ice: "None / Served Up",
      method: "Shake Gin, Citrus, & Sugar; Strain into Flute; Top with Champagne",
      garnish: "Long Lemon Twist",
      footnote: "Named after the French 75mm field gun for its clean, explosive kick.",
      spec: [
        { measure: "1.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.5 oz", name: "Simple Syrup", role: "Sweet Modifier" },
        { measure: "3.0 oz", name: "Brut Champagne", role: "Effervescent Lengthener" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which sparkling wine provides dry effervescence in a classic French 75?",
          correctAnswer: "Brut Champagne",
          options: ["Brut Champagne", "Sweet Asti Spumante", "Ginger Ale", "Club Soda"],
          hint: "Dry French sparkling wine crafted via traditional bottle fermentation.",
          diagnosis: "Brut Champagne provides dry acidity and fine carbonation that elevates the gin and citrus core."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Champagne Shaken Directly Inside Shaker Tin (FLAW)",
          correctIngredientName: "Champagne Topped Gently After Straining",
          prompt: "RECIPE AUDIT: Identify the physical technique disaster here:",
          correctAnswer: "Shaking sparkling wine destroys bubbles and risks violent tin separation",
          options: [
            "Shaking sparkling wine destroys bubbles and risks violent tin separation",
            "Gin must never touch citrus",
            "Flute glass must be coated in salt",
            "Syrup should be replaced with brown gravy"
          ],
          hint: "Effervescent ingredients should never be agitated in a sealed shaker.",
          diagnosis: "Carbonated wine should always be topped over the chilled base to preserve effervescence and avoid messes."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "Specify the balanced gin base measurement in a classic flute French 75:",
          correctAnswer: "1.0 oz",
          options: ["1.0 oz", "2.5 oz", "0.25 oz", "3.0 oz"],
          hint: "Keeps room for 3 oz of brut champagne in a standard flute.",
          diagnosis: "1.0 oz gin provides crisp botanical proof while leaving proper headspace for Champagne."
        }
      }
    },
    {
      id: "aviation",
      name: "Aviation",
      family: "Sour",
      era: "1916 • Hugo Ensslin Classic",
      baseSpirit: "London Dry Gin",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Hard Shake & Fine Strain",
      garnish: "Brandied Cherry in Bottom",
      footnote: "Crème de violette imparts an ethereal sky-blue hue and delicate floral aromatics.",
      spec: [
        { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Maraschino Liqueur", role: "Stone-Fruit Modifier" },
        { measure: "0.25 oz", name: "Crème de Violette", role: "Floral Modifier" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which botanical liqueur grants the Aviation its signature pale violet hue?",
          correctAnswer: "Crème de Violette",
          options: ["Crème de Violette", "Blue Curaçao", "Crème de Menthe", "Galliano"],
          hint: "A delicate floral liqueur infused with alpine violet petals.",
          diagnosis: "Crème de violette provides subtle floral aromatics and the sky-blue color reminiscent of dawn flight."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Crème de Violette 1.5 oz (FLAW)",
          correctIngredientName: "Crème de Violette 0.25 oz (A Quarter Ounce)",
          prompt: "RECIPE AUDIT: Identify the modifier proportion error in this ticket:",
          correctAnswer: "Excess Crème de Violette creates a soapy, potpourri-like profile",
          options: [
            "Excess Crème de Violette creates a soapy, potpourri-like profile",
            "Gin must be substituted with scotch",
            "Aviation cocktails should be served over crushed ice",
            "Lemon juice should be boiled with cloves"
          ],
          hint: "Violette is exceptionally potent and must be metered in dashes or a quarter ounce.",
          diagnosis: "More than a quarter ounce of violette completely overwhelms the gin botanicals with soapy floral tones."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which cherry cordial imparts earthy, herbal stone-fruit dryness?",
          correctAnswer: "Maraschino Liqueur",
          options: ["Maraschino Liqueur", "Cherry Heering", "Grenadine", "Amaretto"],
          hint: "Distilled from sour Marasca cherries, including their crushed pits.",
          diagnosis: "Maraschino liqueur provides bone-dry herbal cherry and nutty pit flavors that bridge gin and citrus."
        }
      }
    },
    {
      id: "last-word",
      name: "The Last Word",
      family: "Sour",
      era: "1920s • Detroit Athletic Club",
      baseSpirit: "London Dry Gin",
      glass: "Nick & Nora",
      ice: "None / Served Up",
      method: "Hard Shake & Double Strain",
      garnish: "Brandied Cherry",
      footnote: "A legendary 1:1:1:1 formula rediscovery by Murray Stenson at Seattle's Zig Zag Café.",
      spec: [
        { measure: "0.75 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Green Chartreuse", role: "Herbal Modifier" },
        { measure: "0.75 oz", name: "Maraschino Liqueur", role: "Stone-Fruit Modifier" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which 110-proof French herbal liqueur defines The Last Word?",
          correctAnswer: "Green Chartreuse",
          options: ["Green Chartreuse", "Yellow Chartreuse", "Bénédictine", "Absinthe"],
          hint: "Monastic liqueur macerated with 130 botanicals.",
          diagnosis: "Green Chartreuse contributes 55% ABV proof and intense alpine herbal notes."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Fresh Lemon Juice 1.5 oz (FLAW)",
          correctIngredientName: "Fresh Lime Juice 0.75 oz (Equal Parts)",
          prompt: "RECIPE AUDIT: Identify the formula deviation breaking this drink:",
          correctAnswer: "Incorrect citrus type and doubled volume breaks the 1:1:1:1 harmony",
          options: [
            "Incorrect citrus type and doubled volume breaks the 1:1:1:1 harmony",
            "Maraschino should be swapped for maple syrup",
            "Green Chartreuse must be boiled first",
            "Last Word drinks must be topped with ginger beer"
          ],
          hint: "The Last Word is strictly equal parts (0.75 oz each) and uses lime, not lemon.",
          diagnosis: "Equal parts lime juice is required; lemon changes the acid profile, and doubling it overpowers the spirits."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "What is the equal pour measure for all 4 ingredients in The Last Word?",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "1.5 oz", "0.25 oz", "1.25 oz"],
          hint: "Classic four-part harmony yields a 3.0 oz pre-shake volume.",
          diagnosis: "Four equal parts of 0.75 oz create the ideal balance between proof, acid, and herbal sugars."
        }
      }
    },
    {
      id: "corpse-reviver-no-2",
      name: "Corpse Reviver No. 2",
      family: "Sour",
      era: "1930 • Harry Craddock, Savoy Hotel",
      baseSpirit: "London Dry Gin",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Shake Hard & Strain into Absinthe-Rinsed Glass",
      garnish: "Lemon Twist",
      footnote: "'Four of these taken in swift succession will un-revive the corpse again.'",
      spec: [
        { measure: "0.75 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Cointreau", role: "Orange Modifier" },
        { measure: "0.75 oz", name: "Lillet Blanc / Cocchi Americano", role: "Aromatized Wine" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "1 rinse", name: "Absinthe", role: "Aromatic Accent" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which quinquina/aromatized wine modifier balances the citrus in this recipe?",
          correctAnswer: "Lillet Blanc / Cocchi Americano",
          options: ["Lillet Blanc / Cocchi Americano", "Dry Vermouth", "Sweet Vermouth", "Dubonnet Rouge"],
          hint: "Originally called for Kina Lillet; Cocchi Americano preserves the original cinchona bitterness.",
          diagnosis: "Lillet Blanc or Cocchi Americano rounds out the sharp citrus with herbal wine sweetness and gentle cinchona bark bitterness."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 4,
          flawIngredientDisplay: "1.0 oz Absinthe Poured in Shaker Tin (FLAW)",
          correctIngredientName: "Absinthe Glass Rinse (Discarded)",
          prompt: "RECIPE AUDIT: Identify the execution flaw on this Corpse Reviver ticket:",
          correctAnswer: "Absinthe should only coat the glass, not drown the equal-parts sour core",
          options: [
            "Absinthe should only coat the glass, not drown the equal-parts sour core",
            "Gin should be swapped for heavy stout beer",
            "Cointreau is forbidden in classic European recipes",
            "Glass must be packed with crushed sea salt"
          ],
          hint: "Absinthe is intended strictly as an aromatic rinse on the coupe walls.",
          diagnosis: "Pouring a full ounce of absinthe inside the tin destroys the delicate 1:1:1:1 balance."
        },
        family: {
          type: "measure",
          targetIndex: 3,
          prompt: "Specify the lemon juice pour in this classic equal-parts recipe:",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "1.5 oz", "0.25 oz", "1.0 oz"],
          hint: "Equal parts with the gin, Cointreau, and aromatized wine.",
          diagnosis: "0.75 oz of lemon juice perfectly cuts through the Cointreau and wine modifier."
        }
      }
    },
    {
      id: "mint-julep",
      name: "Mint Julep",
      family: "Old Fashioned",
      era: "Early 1800s • American South",
      baseSpirit: "Kentucky Bourbon Whiskey",
      glass: "Julep Cup",
      ice: "Pebble or Crushed Ice Mound",
      method: "Gently Press Mint in Syrup, Add Bourbon, Churn with Crushed Ice",
      garnish: "Abundant Fresh Mint Bouquet & Powdered Sugar",
      footnote: "Metallic cup conducts cold rapidly, forming an exterior frost coat that locks in temperature.",
      spec: [
        { measure: "2.5 oz", name: "Kentucky Straight Bourbon", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Rich Turbinado Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "8-10 leaves", name: "Fresh Spearmint", role: "Aromatic Herb" }
      ],
      modes: {
        classic: {
          type: "method",
          targetIndex: -1,
          prompt: "What is the proper treatment of mint leaves when building a Julep?",
          correctAnswer: "Gently press mint to express oils without shredding or bruising stems",
          options: [
            "Gently press mint to express oils without shredding or bruising stems",
            "Muddle mint aggressively into fine shreds",
            "Boil mint in bourbon over high heat",
            "Puree mint in an electric blender with ice"
          ],
          hint: "Aggressive muddling tears the plant cell walls and releases bitter chlorophyll.",
          diagnosis: "Pressing the leaves extracts aromatic essential oils from surface veins without releasing astringent chlorophyll."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 0,
          flawIngredientDisplay: "London Dry Gin 2.5 oz (FLAW)",
          correctIngredientName: "Kentucky Straight Bourbon 2.5 oz",
          prompt: "RECIPE AUDIT: Identify the base spirit failure in this Southern classic:",
          correctAnswer: "Bourbon whiskey is the canonical foundation of the Kentucky Mint Julep",
          options: [
            "Bourbon whiskey is the canonical foundation of the Kentucky Mint Julep",
            "Mint must be substituted with oregano",
            "A Julep must be served in a warm ceramic mug",
            "Turbinado syrup must be substituted with honey"
          ],
          hint: "Think Churchill Downs and the Kentucky Derby.",
          diagnosis: "The Mint Julep is historically rooted in rich, oaky Kentucky straight bourbon."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which raw sugar syrup pairs best with bourbon's barrel oak profile?",
          correctAnswer: "Rich Turbinado / Demerara Syrup",
          options: ["Rich Turbinado / Demerara Syrup", "Grenadine", "Agave Nectar", "Raspberry Syrup"],
          hint: "Unrefined cane sugar with high molasses content.",
          diagnosis: "Turbinado or demerara syrups offer molasses depth that amplifies bourbon char and caramel."
        }
      }
    },
    {
      id: "gimlet",
      name: "Gimlet",
      family: "Sour",
      era: "1920s • Royal Navy Classic",
      baseSpirit: "London Dry Gin or Navy Strength Gin",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Hard Shake & Fine Strain",
      garnish: "Lime Wheel",
      footnote: "Historically concocted with lime cordial to prevent scurvy among British sailors.",
      spec: [
        { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Rich Simple Syrup", role: "Sweet Modifier" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Specify the botanical spirit grounding the classic naval Gimlet:",
          correctAnswer: "London Dry Gin",
          options: ["London Dry Gin", "Bourbon Whiskey", "Tequila Blanco", "Dark Rum"],
          hint: "Juniper-led spirit historically rationed in the British Royal Navy.",
          diagnosis: "London Dry Gin provides the sharp pine and coriander spice that cuts through the sweetened lime juice."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Bottled Commercial Preserved Lime Cordial (FLAW)",
          correctIngredientName: "Fresh Lime Juice & Rich Simple Syrup",
          prompt: "RECIPE AUDIT: Identify the flaw common in historic Gimlet specs:",
          correctAnswer: "Old-style artificial preserved cordial delivers a flat, cloying sweetness",
          options: [
            "Old-style artificial preserved cordial delivers a flat, cloying sweetness",
            "Gin must be replaced with vodka",
            "Drink must be stirred in a copper vessel",
            "Gimlets must be topped with soda water"
          ],
          hint: "Modern craft bartending prefers fresh lime juice and syrup over preserved cordial.",
          diagnosis: "Commercial shelf-stable cordial contains high-fructose corn syrup and artificial preservatives; fresh lime ensures crisp balance."
        },
        family: {
          type: "measure",
          targetIndex: 1,
          prompt: "In a balanced craft Gimlet, what measure of lime juice balances 0.75 oz simple syrup?",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "0.25 oz", "1.5 oz", "2.0 oz"],
          hint: "Equal parts balance against the sweet syrup.",
          diagnosis: "A 2:0.75:0.75 sour balance prevents the gin from tasting overly sharp or overly sugary."
        }
      }
    },
    {
      id: "sidecar",
      name: "Sidecar",
      family: "Daisy",
      era: "1920s • Ritz Hotel, Paris",
      baseSpirit: "Cognac / French Brandy",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Shake Hard & Double Strain",
      garnish: "Orange Peel & Optional Sugared Rim",
      footnote: "The definitive brandy sour: grape brandy elevated with triple sec and fresh lemon.",
      spec: [
        { measure: "2.0 oz", name: "Cognac or Armagnac", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Cointreau / Triple Sec", role: "Orange Liqueur Modifier" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which French oak-aged grape spirit anchors the classic Sidecar?",
          correctAnswer: "Cognac or Armagnac",
          options: ["Cognac or Armagnac", "London Dry Gin", "White Rum", "Bourbon Whiskey"],
          hint: "Distilled wine aged in French Limousin oak casks.",
          diagnosis: "Cognac provides rich dried fruit, spice, and wood tones that bridge with citrus."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Fresh Grapefruit Juice 2.0 oz (FLAW)",
          correctIngredientName: "Fresh Lemon Juice 0.75 oz",
          prompt: "RECIPE AUDIT: Identify the acid component error:",
          correctAnswer: "Grapefruit juice lacks the acidity required to balance orange liqueur",
          options: [
            "Grapefruit juice lacks the acidity required to balance orange liqueur",
            "Cognac must never be shaken with citrus",
            "Sidecars must be served warm in an Irish Coffee mug",
            "Cointreau should be swapped for crème de menthe"
          ],
          hint: "Sidecars require the sharp citric acid profile of fresh lemons.",
          diagnosis: "Grapefruit has insufficient citric acid to cut through the proof and sugar of Cointreau and brandy; lemon is required."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which orange modifier defines the Sidecar within the Daisy template?",
          correctAnswer: "Cointreau / Triple Sec",
          options: ["Cointreau / Triple Sec", "Maraschino Liqueur", "Sweet Vermouth", "Campari"],
          hint: "A dry, clear orange peel liqueur.",
          diagnosis: "Triple sec or Cointreau provides sweet citrus oils that sweeten the brandy without muddying color."
        }
      }
    },
    {
      id: "boulevardier",
      name: "Boulevardier",
      family: "Bitter / Aperitivo",
      era: "1927 • Erskine Gwynne, Paris",
      baseSpirit: "Bourbon or Rye Whiskey",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Stir Thoroughly & Strain",
      garnish: "Expressed Orange Peel",
      footnote: "The whiskey-lover's Negroni: swaps gin for American whiskey, offering rounder vanilla-oak warmth.",
      spec: [
        { measure: "1.25 oz", name: "Bourbon or Rye Whiskey", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Campari", role: "Bitter Aperitif" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which spirit replaces gin to turn a Negroni into a Boulevardier?",
          correctAnswer: "Bourbon or Rye Whiskey",
          options: ["Bourbon or Rye Whiskey", "Blanco Tequila", "Dark Rum", "Apple Brandy"],
          hint: "American whiskey aged in charred new oak containers.",
          diagnosis: "Whiskey introduces vanilla, oak char, and caramel that warm up the bitter gentian notes of Campari."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Hard Shaken with Crushed Ice in Pint Glass (FLAW)",
          correctIngredientName: "Stirred Gently with Dense Ice Cube",
          prompt: "RECIPE AUDIT: Identify the technique error destroying drink texture:",
          correctAnswer: "Shaking spirits and aromatized wines creates cloudy aeration and over-dilution",
          options: [
            "Shaking spirits and aromatized wines creates cloudy aeration and over-dilution",
            "Bourbon should never touch Campari",
            "Sweet vermouth must be distilled twice before service",
            "Drink must be served boiling hot"
          ],
          hint: "Drinks composed entirely of spirits, bitters, and wines should be stirred.",
          diagnosis: "Stirring produces a dense, glossy texture and prevents rapid melting of ice shards."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which Italian amaro provides the red hue and bitter gentian profile?",
          correctAnswer: "Campari",
          options: ["Campari", "Aperol", "Fernet Branca", "Cynar"],
          hint: "Vibrant red Italian aperitivo with notes of bitter orange and gentian.",
          diagnosis: "Campari's crisp bitterness cuts through sweet vermouth and high-proof whiskey."
        }
      }
    },
    {
      id: "clover-club",
      name: "Clover Club",
      family: "Sour",
      era: "1890s • Bellevue-Stratford Hotel, Philadelphia",
      baseSpirit: "London Dry Gin",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Dry Shake, then Shake Hard with Ice & Double Strain",
      garnish: "Fresh Raspberries or Lemon Twist",
      footnote: "Named after the Philadelphia men's club; raspberry syrup provides fruit acids and vibrant pink tint.",
      spec: [
        { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Raspberry Syrup", role: "Fruit/Sweet Modifier" },
        { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.5 oz", name: "Dry Vermouth", role: "Wine Modifier" },
        { measure: "1 dash", name: "Egg White", role: "Textural Agent" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which fruit syrup creates the signature pink color and tart berry profile?",
          correctAnswer: "Raspberry Syrup",
          options: ["Raspberry Syrup", "Grenadine", "Blackberry Liqueur", "Strawberry Puree"],
          hint: "Macerated fresh red raspberries with pure cane sugar.",
          diagnosis: "Raspberry syrup delivers vibrant natural acid, berry aroma, and pastel pink foam."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 4,
          flawIngredientDisplay: "Egg White Omitted & Shaken Without Emulsification (FLAW)",
          correctIngredientName: "Egg White Added and Dry Shaken",
          prompt: "RECIPE AUDIT: Identify the textural failure in this Clover Club:",
          correctAnswer: "Omitting the egg white eliminates the velvety, meringue head",
          options: [
            "Omitting the egg white eliminates the velvety, meringue head",
            "Gin must be swapped for peated Scotch",
            "Dry vermouth must be boiled with cinnamon",
            "Glass rim must be encrusted with coarse black pepper"
          ],
          hint: "A Clover Club is defined by its thick, cloud-like foam crown.",
          diagnosis: "Egg white provides albumen proteins that trap air microbubbles, creating a dense, silky foam head."
        },
        family: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which dry aromatized wine is included in historic Clover Club recipes to dry out the palate?",
          correctAnswer: "Dry Vermouth",
          options: ["Dry Vermouth", "Sweet Vermouth", "Port Wine", "Marsala"],
          hint: "French style pale vermouth.",
          diagnosis: "Dry vermouth tempers the sweetness of the raspberry syrup and keeps the gin botanicals bright."
        }
      }
    },
    {
      id: "moscow-mule",
      name: "Moscow Mule",
      family: "Highball / Collins",
      era: "1941 • Cock 'n Bull / Smirnoff, Hollywood",
      baseSpirit: "Vodka",
      glass: "Julep Cup",
      ice: "Crushed Ice",
      method: "Build over Ice in Copper Mug, Stir Gently",
      garnish: "Lime Wheel & Fresh Mint Sprig",
      footnote: "The cocktail that introduced vodka to mid-century America; copper cup rapidly creates a frosty rim.",
      spec: [
        { measure: "2.0 oz", name: "Vodka", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "4.0 oz", name: "Spicy Ginger Beer", role: "Spicy Lengthener" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which effervescent lengthener provides the pungent kick in a Mule?",
          correctAnswer: "Spicy Ginger Beer",
          options: ["Spicy Ginger Beer", "Ginger Ale", "Club Soda", "Tonic Water"],
          hint: "Brewed, spicy, fermented or carbonated ginger soda.",
          diagnosis: "Ginger beer contains real ginger root heat, which cuts through citrus and alcohol."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Sweet Ginger Ale (FLAW)",
          correctIngredientName: "Spicy Craft Ginger Beer",
          prompt: "RECIPE AUDIT: Identify the common soda gun substitution flaw:",
          correctAnswer: "Ginger ale is too sweet and lacks the fiery bite of brewed ginger beer",
          options: [
            "Ginger ale is too sweet and lacks the fiery bite of brewed ginger beer",
            "Vodka should be swapped for smoky mezcal",
            "Mules should only be served warm",
            "Lime juice must be heated"
          ],
          hint: "Ginger ale produces a watery, overly sweet profile without heat.",
          diagnosis: "Ginger beer supplies cloudy, peppery capsicum/gingerol heat necessary to balance the lime."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "What spirit family was popularized in the USA through the creation of the Mule?",
          correctAnswer: "Vodka",
          options: ["Vodka", "Bourbon", "Gin", "Tequila"],
          hint: "Neutral grain spirit heavily promoted by Smirnoff in the 1940s.",
          diagnosis: "The Moscow Mule was explicitly engineered to move cases of Smirnoff vodka in California."
        }
      }
    },
    {
      id: "dark-n-stormy",
      name: "Dark 'n Stormy",
      family: "Highball / Collins",
      era: "Post-WWI • Bermuda",
      baseSpirit: "Goslings Black Seal Rum",
      glass: "Highball",
      ice: "Rocks",
      method: "Build Ginger Beer & Lime over Ice, Float Dark Rum on Top",
      garnish: "Lime Wheel",
      footnote: "Goslings owns the trademark; the dense, molasses-heavy dark rum floats like a storm cloud atop ginger beer.",
      spec: [
        { measure: "2.0 oz", name: "Goslings Black Seal Rum", role: "Base Spirit (Float)" },
        { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "4.0 oz", name: "Ginger Beer", role: "Spicy Lengthener" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which trademarked Bermudian black rum is canonically required for a Dark 'n Stormy?",
          correctAnswer: "Goslings Black Seal Rum",
          options: ["Goslings Black Seal Rum", "White Overproof Rum", "Spiced Rum", "Agave Reposado"],
          hint: "Molasses-heavy, dark Bermudian rum.",
          diagnosis: "Goslings Black Seal provides the distinctive treacle, caramel, and molasses profile that defines the drink."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 0,
          flawIngredientDisplay: "Clear Light Rum Stirred In (FLAW)",
          correctIngredientName: "Black Seal Rum Floated on Top",
          prompt: "RECIPE AUDIT: Identify the visual and textural failure:",
          correctAnswer: "Light rum destroys both the molasses spice profile and the stormy cloud visual",
          options: [
            "Light rum destroys both the molasses spice profile and the stormy cloud visual",
            "Ginger beer should be replaced with milk",
            "Lime should never be served with rum",
            "Cocktail must be blended with crushed nuts"
          ],
          hint: "The cocktail requires dark rum floated on top to emulate a storm cloud over turbulent seas.",
          diagnosis: "Light rum lacks the density and dark molasses weight needed to float atop ginger beer and create the cloud effect."
        },
        family: {
          type: "method",
          targetIndex: -1,
          prompt: "How is the rum added to create the signature stormy appearance?",
          correctAnswer: "Gently floated on top of the ginger beer",
          options: [
            "Gently floated on top of the ginger beer",
            "Vigorously shaken in a tin",
            "Boiled in a copper pan",
            "Whisked with an electric mixer"
          ],
          hint: "Poured carefully over a barspoon so it rests on surface density.",
          diagnosis: "Floating the dark rum on top creates the dramatic visual division between pale ginger beer and dark rum."
        }
      }
    },
    {
      id: "espresso-martini",
      name: "Espresso Martini",
      family: "Martini",
      era: "1983 • Dick Bradsell, London",
      baseSpirit: "Vodka",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Violent Hard Shake with Ice & Double Strain",
      garnish: "Three Espresso Beans (Health, Wealth, Happiness)",
      footnote: "Requires freshly pulled hot espresso; temperature contrast and oils produce a dense crema foam head.",
      spec: [
        { measure: "1.5 oz", name: "Vodka", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Fresh Hot Espresso", role: "Coffee Foundation" },
        { measure: "0.75 oz", name: "Coffee Liqueur", role: "Sweet Modifier" },
        { measure: "0.25 oz", name: "Rich Simple Syrup", role: "Sweet Balance" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "What form of coffee is required to achieve the signature dense crema foam?",
          correctAnswer: "Fresh Hot Espresso",
          options: ["Fresh Hot Espresso", "Cold Drip Coffee", "Instant Powder Water", "Decaf Filter Coffee"],
          hint: "Freshly pulled with pressurized hot water, rich in emulsified coffee oils.",
          diagnosis: "Fresh espresso oils emulsify under hard shaking with ice to create the rich crema foam layer."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Stirred Gently in Beaker and Strained Flat (FLAW)",
          correctIngredientName: "Violently Shaken to Form Thick Crema Head",
          prompt: "RECIPE AUDIT: Identify the technique error on this ticket:",
          correctAnswer: "Stirring fails to aerate coffee lipids, leaving the cocktail flat and lifeless",
          options: [
            "Stirring fails to aerate coffee lipids, leaving the cocktail flat and lifeless",
            "Vodka must be swapped for absinthe",
            "Coffee beans should be crushed into coarse gravel inside glass",
            "Drink must be served in a ceramic coffee mug"
          ],
          hint: "An Espresso Martini demands a thick, pale brown crema layer.",
          diagnosis: "Violent aeration during the shake is mandatory to whip the coffee oils and syrup into a tight foam crown."
        },
        family: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which modifier reinforces roasted coffee notes while contributing sweetness?",
          correctAnswer: "Coffee Liqueur",
          options: ["Coffee Liqueur", "Triple Sec", "Blue Curaçao", "Crème de Menthe"],
          hint: "Liqueur made with rum or neutral spirit macerated with roasted coffee beans.",
          diagnosis: "Coffee liqueur provides sweetness and rich roasted bean flavors to round out espresso acidity."
        }
      }
    },
    {
      id: "bramble",
      name: "Bramble",
      family: "Sour",
      era: "1984 • Dick Bradsell, Fred's Club, London",
      baseSpirit: "London Dry Gin",
      glass: "Rocks",
      ice: "Mounded Crushed Ice",
      method: "Shake Gin, Lemon, Syrup; Strain over Crushed Ice; Bleed Mûre Over Top",
      garnish: "Fresh Blackberry & Lemon Half-Wheel",
      footnote: "Bleeding the dark blackberry liqueur over crushed ice creates a stunning gradient effect resembling a bramble bush.",
      spec: [
        { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.5 oz", name: "Simple Syrup", role: "Sweet Modifier" },
        { measure: "0.5 oz", name: "Crème de Mûre", role: "Blackberry Float" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which French fruit liqueur is drizzled over crushed ice to crown the Bramble?",
          correctAnswer: "Crème de Mûre",
          options: ["Crème de Mûre", "Crème de Cassis", "Chambord", "Grenadine"],
          hint: "A rich, dark French blackberry liqueur.",
          diagnosis: "Crème de Mûre introduces rich tart-sweet blackberry aromatics that bleed through the sour ice mound."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Crème de Mûre Shaken Inside Tin with Lemon and Gin (FLAW)",
          correctIngredientName: "Crème de Mûre Drizzled Over Packed Crushed Ice",
          prompt: "RECIPE AUDIT: Identify the presentation flaw on this Bramble ticket:",
          correctAnswer: "Shaking the mûre inside the tin destroys the signature bleeding gradient effect",
          options: [
            "Shaking the mûre inside the tin destroys the signature bleeding gradient effect",
            "Gin must be replaced with tequila",
            "Drink must be served completely hot",
            "Crushed ice should be replaced with warm tap water"
          ],
          hint: "The dark blackberry liqueur must cascade slowly down from the peak of the crushed ice.",
          diagnosis: "Bleeding the blackberry liqueur over crushed ice gives the cocktail its distinctive ombre visual."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which spirit style forms the crisp botanical base of the Bramble?",
          correctAnswer: "London Dry Gin",
          options: ["London Dry Gin", "Bourbon Whiskey", "White Rum", "Mezcal"],
          hint: "Juniper-rich spirit that balances berry and citrus.",
          diagnosis: "London Dry Gin delivers crisp pine and citrus botanical notes that frame the blackberry cordial."
        }
      }
    },
    {
      id: "penicillin",
      name: "Penicillin",
      family: "Sour",
      era: "2005 • Sam Ross, Milk & Honey, NYC",
      baseSpirit: "Blended Scotch Whisky",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Shake Blended Scotch, Lemon, Honey-Ginger; Strain; Float Peated Scotch",
      garnish: "Candied Ginger Slice",
      footnote: "Honey-ginger syrup provides spicy soothing sweetness; peated Islay Scotch float delivers an aromatic smoke bomb.",
      spec: [
        { measure: "2.0 oz", name: "Blended Scotch Whisky", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Honey-Ginger Syrup (3:1)", role: "Sweet & Spicy Modifier" },
        { measure: "0.25 oz", name: "Peated Islay Single Malt Scotch", role: "Aromatic Float" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which whisky style is floated on top to give the Penicillin its smoky aroma?",
          correctAnswer: "Peated Islay Single Malt Scotch",
          options: ["Peated Islay Single Malt Scotch", "Bourbon Whiskey", "Irish Grain Whiskey", "Canadian Rye"],
          hint: "Heavily smoked Scottish single malt malted over peat fires.",
          diagnosis: "Peated Islay Scotch delivers medicinal, iodine smoke aromas on the nose before each sip."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Refined White Sugar Syrup (FLAW)",
          correctIngredientName: "Spicy Fresh Ginger-Honey Syrup",
          prompt: "RECIPE AUDIT: Identify the flavor shortcut weakening this Penicillin:",
          correctAnswer: "Plain sugar syrup lacks the vital ginger heat and floral wildflower honey depth",
          options: [
            "Plain sugar syrup lacks the vital ginger heat and floral wildflower honey depth",
            "Scotch must be substituted with light vodka",
            "Lemon juice should be boiled with mint",
            "Drink must be built warm in a teacup"
          ],
          hint: "Penicillin requires the medicinal warmth of fresh ginger root juice combined with honey.",
          diagnosis: "Honey-ginger syrup is essential; plain simple syrup leaves the cocktail flat and removes its core personality."
        },
        family: {
          type: "measure",
          targetIndex: 3,
          prompt: "Specify the float volume of smoky peated whisky needed on the surface:",
          correctAnswer: "0.25 oz",
          options: ["0.25 oz", "1.5 oz", "2.0 oz", "0.0 oz (Omit)"],
          hint: "A gentle barspoon-drizzle float to coat the top.",
          diagnosis: "A 0.25 oz float delivers maximum smoky aromatics without overpowering the palate."
        }
      }
    },
    {
      id: "ramos-gin-fizz",
      name: "Ramos Gin Fizz",
      family: "Highball / Collins",
      era: "1888 • Henry C. Ramos, New Orleans",
      baseSpirit: "Old Tom or London Dry Gin",
      glass: "Collins",
      ice: "None / Chilled Glass",
      method: "Dry Shake 5 mins, Wet Shake Hard, Strain, Rest in Glass, Upward Soda Push",
      garnish: "Orange Blossom Mist",
      footnote: "Creates an impenetrable foam pillar that rises dramatically above the rim of the glass.",
      spec: [
        { measure: "2.0 oz", name: "Old Tom or London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Simple Syrup", role: "Sweet Modifier" },
        { measure: "1.0 oz", name: "Heavy Cream", role: "Dairy Emulsion" },
        { measure: "1.0 oz", name: "Club Soda", role: "Effervescent Lift" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 4,
          prompt: "Which dairy ingredient gives the Ramos its thick, decadent mouthfeel?",
          correctAnswer: "Heavy Cream",
          options: ["Heavy Cream", "Whole Milk", "Condensed Milk", "Almond Milk"],
          hint: "High-fat dairy that whips into a rich foam with citrus and egg albumen.",
          diagnosis: "Heavy cream provides the high butterfat content necessary to achieve a velvety soufflé foam."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Quick 5-second Lazy Shake with Ice and Strained Immediately (FLAW)",
          correctIngredientName: "Exhaustive Dry Shake & Wet Shake to Create Rigid Soufflé Head",
          prompt: "RECIPE AUDIT: Identify the catastrophic technique failure on this Ramos ticket:",
          correctAnswer: "Insufficient shaking fails to emulsify heavy cream and egg white into a rigid soufflé",
          options: [
            "Insufficient shaking fails to emulsify heavy cream and egg white into a rigid soufflé",
            "Gin must be replaced with tequila",
            "Citrus juice is strictly forbidden in New Orleans fizzes",
            "Drink must be served in an open shallow saucer"
          ],
          hint: "The Ramos requires long, vigorous agitation to build a stable foam tower.",
          diagnosis: "Cream and egg white require extensive agitation to bond and rise over the rim of the glass without collapsing."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "What spirit style anchors the Ramos Gin Fizz?",
          correctAnswer: "Old Tom or London Dry Gin",
          options: ["Old Tom or London Dry Gin", "Bourbon", "White Rum", "Tequila"],
          hint: "A botanical, juniper-forward spirit.",
          diagnosis: "Gin cuts through the rich dairy fats with pine, citrus, and coriander aromatics."
        }
      }
    },
    {
      id: "paloma",
      name: "Paloma",
      family: "Highball / Collins",
      era: "1950s • Don Javier Delgado Corona, Tequila, Mexico",
      baseSpirit: "Blanco or Reposado Tequila",
      glass: "Collins",
      ice: "Column Ice Spears",
      method: "Build Tequila, Lime & Pinch of Salt over Ice; Top with Grapefruit Soda",
      garnish: "Grapefruit Wedge & Salted Rim",
      footnote: "Mexico's most popular tequila highball; tart grapefruit soda cuts through vegetal agave.",
      spec: [
        { measure: "2.0 oz", name: "Blanco or Reposado Tequila", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
        { measure: "1 pinch", name: "Sea Salt", role: "Flavor Enhancer" },
        { measure: "4.0 oz", name: "Grapefruit Soda", role: "Citrus Lengthener" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which Mexican carbonated soda is canonical in an authentic Paloma?",
          correctAnswer: "Grapefruit Soda",
          options: ["Grapefruit Soda", "Cola", "Lemon-Lime Soda", "Tonic Water"],
          hint: "Fizzy citrus soda made with pink or white grapefruit.",
          diagnosis: "Grapefruit soda provides bittersweet effervescence that balances tequila's earthy agave tones."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Sea Salt Omitted Completely (FLAW)",
          correctIngredientName: "Pinch of Salt Built into Glass",
          prompt: "RECIPE AUDIT: Identify the seasoning flaw in this Paloma build:",
          correctAnswer: "Omitting salt prevents grapefruit bitterness from softening into fruit sweetness",
          options: [
            "Omitting salt prevents grapefruit bitterness from softening into fruit sweetness",
            "Tequila must be replaced with scotch",
            "Palomas must be boiled and served hot",
            "Drink must be garnished with grated cheddar cheese"
          ],
          hint: "Sodium ions suppress bitterness and elevate tart citrus flavors.",
          diagnosis: "Salt suppresses the astringent bitter edges of grapefruit while amplifying crisp agave sweetness."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which blue agave spirit anchors the Paloma?",
          correctAnswer: "Blanco or Reposado Tequila",
          options: ["Blanco or Reposado Tequila", "White Rum", "Bourbon Whiskey", "London Dry Gin"],
          hint: "Distillate produced in Jalisco, Mexico.",
          diagnosis: "Tequila delivers vegetal, peppery agave qualities that harmonize with bitter citrus soda."
        }
      }
    },
    {
      id: "blood-and-sand",
      name: "Blood and Sand",
      family: "Sour",
      era: "1930 • Savoy Cocktail Book",
      baseSpirit: "Scotch Whisky",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Hard Shake & Fine Strain",
      garnish: "Expressed Orange Peel & Brandied Cherry",
      footnote: "Named after Rudolph Valentino's 1922 bullfighter movie; four equal parts of smoke, sweet, cherry, and citrus.",
      spec: [
        { measure: "0.75 oz", name: "Blended Scotch Whisky", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
        { measure: "0.75 oz", name: "Cherry Heering Liqueur", role: "Cherry Cordial" },
        { measure: "0.75 oz", name: "Fresh Orange Juice", role: "Fruit Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which rich Danish cherry liqueur is canonical in a Blood and Sand?",
          correctAnswer: "Cherry Heering Liqueur",
          options: ["Cherry Heering Liqueur", "Maraschino Liqueur", "Kirschwasser", "Amaretto"],
          hint: "Deep ruby liqueur made from steeped Danish cherries and spices.",
          diagnosis: "Cherry Heering provides deep garnet color and rich cherry sweetness to balance Scotch smoke."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Bottled Pasteurized Sweet Orange Juice (FLAW)",
          correctIngredientName: "Freshly Squeezed Acidic Orange Juice",
          prompt: "RECIPE AUDIT: Identify the fruit juice mistake spoiling this balance:",
          correctAnswer: "Bottled orange juice is overly sweet and lacks fresh citric acidity",
          options: [
            "Bottled orange juice is overly sweet and lacks fresh citric acidity",
            "Scotch should be swapped for unaged grappa",
            "Drink must be served in a copper beer stein",
            "Sweet vermouth must be replaced with dark beer"
          ],
          hint: "Orange juice already has low acidity; pasteurized versions make the drink cloying.",
          diagnosis: "Freshly squeezed juice provides bright acidity and fresh pulp oils essential to cutting through vermouth and cherry liqueur."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "What is the proportion of each ingredient in the classic 4-part Blood and Sand formula?",
          correctAnswer: "0.75 oz (Equal Parts)",
          options: ["0.75 oz (Equal Parts)", "1.5 oz spirit to 0.5 oz modifiers", "0.25 oz each", "2.0 oz spirit to dashes of modifiers"],
          hint: "Classic equal-parts quartet.",
          diagnosis: "The drink relies on an equal 0.75 oz quartet of Scotch, vermouth, cherry liqueur, and orange juice."
        }
      }
    },
    {
      id: "vieux-carre",
      name: "Vieux Carré",
      family: "Old Fashioned",
      era: "1938 • Walter Bergeron, Hotel Monteleone, New Orleans",
      baseSpirit: "Rye Whiskey & Cognac",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Stir Thoroughly with Dense Ice & Strain",
      garnish: "Lemon Twist & Brandied Cherry",
      footnote: "Named after the French Quarter; a split-base masterpiece combining French brandy and American rye.",
      spec: [
        { measure: "0.75 oz", name: "Rye Whiskey", role: "Spicy Grain Base" },
        { measure: "0.75 oz", name: "Cognac", role: "Fruity Grape Base" },
        { measure: "0.75 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
        { measure: "1 barspoon", name: "Bénédictine D.O.M.", role: "Herbal Honey Modifier" },
        { measure: "1 dash", name: "Peychaud's Bitters", role: "Anise Bitters" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 3,
          prompt: "Which herbal French honey liqueur is vital to the Vieux Carré profile?",
          correctAnswer: "Bénédictine D.O.M.",
          options: ["Bénédictine D.O.M.", "Chartreuse", "Drambuie", "Galliano"],
          hint: "Herbal elixir produced by monks featuring saffron, honey, and botanicals.",
          diagnosis: "Bénédictine provides rich honey sweetness and herbal aromatics that bridge rye and cognac."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Tequila Blanco 0.75 oz (FLAW)",
          correctIngredientName: "Cognac (French Brandy) 0.75 oz",
          prompt: "RECIPE AUDIT: Identify the base spirit violation:",
          correctAnswer: "Tequila violates the historic French-American split base of Cognac and Rye",
          options: [
            "Tequila violates the historic French-American split base of Cognac and Rye",
            "Bénédictine should never be consumed cold",
            "Peychaud's bitters are forbidden in New Orleans cocktails",
            "Drink must be topped with sparkling water"
          ],
          hint: "The Vieux Carré honors New Orleans' French heritage via Cognac.",
          diagnosis: "Cognac delivers rich grape tannins and fruit that balance rye whiskey's dry grain spice."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which American whiskey style provides grain spice to the Vieux Carré base?",
          correctAnswer: "Rye Whiskey",
          options: ["Rye Whiskey", "Vodka", "White Rum", "Corn Whiskey"],
          hint: "High-rye mashbill whiskey from the American Northeast.",
          diagnosis: "Rye whiskey supplies sharp pepper and oak to balance sweet vermouth and Bénédictine."
        }
      }
    },
    {
      id: "brandy-crusta",
      name: "Brandy Crusta",
      family: "Daisy",
      era: "1850s • Joseph Santini, New Orleans",
      baseSpirit: "Cognac / French Brandy",
      glass: "Nick & Nora",
      ice: "None / Served Up",
      method: "Shake Hard & Strain into Sugar-Crusted Glass with Curled Lemon Jacket",
      garnish: "Full Lemon Peel Lining Rim & Sugar Crust",
      footnote: "The precursor to the Sidecar and Margarita; notable for the entire pared peel of a lemon lining the glass.",
      spec: [
        { measure: "2.0 oz", name: "Cognac", role: "Base Spirit" },
        { measure: "0.25 oz", name: "Cointreau / Triple Sec", role: "Orange Modifier" },
        { measure: "0.25 oz", name: "Maraschino Liqueur", role: "Stone-Fruit Modifier" },
        { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which stone-fruit liqueur pairs with Cointreau in the classic Crusta modifier blend?",
          correctAnswer: "Maraschino Liqueur",
          options: ["Maraschino Liqueur", "Cassis", "Peach Schnapps", "Apricot Cordial"],
          hint: "Dry sour marasca cherry liqueur.",
          diagnosis: "Maraschino liqueur gives the Crusta its signature dry, floral cherry-stone undertone."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 0,
          flawIngredientDisplay: "Neutral Vodka 2.0 oz (FLAW)",
          correctIngredientName: "Cognac / Aged Brandy 2.0 oz",
          prompt: "RECIPE AUDIT: Identify the base spirit failure:",
          correctAnswer: "Neutral vodka lacks the rich grape character and barrel aging of aged Cognac",
          options: [
            "Neutral vodka lacks the rich grape character and barrel aging of aged Cognac",
            "Lemon juice should never touch sugar rims",
            "Maraschino liqueur must be boiled",
            "Bitters are strictly prohibited in Crustas"
          ],
          hint: "Santini originally formulated the drink using high-grade French grape brandy.",
          diagnosis: "Cognac provides wood tannins and dried stone fruit that balance lemon juice and maraschino liqueur."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which orange modifier qualifies the Crusta as a Daisy ancestor?",
          correctAnswer: "Cointreau / Triple Sec",
          options: ["Cointreau / Triple Sec", "Campari", "Sweet Vermouth", "Crème de Menthe"],
          hint: "Clear orange peel triple sec liqueur.",
          diagnosis: "Triple sec provides the citrus cordial sweetening element defining the Daisy lineage."
        }
      }
    },
    {
      id: "pisco-sour",
      name: "Pisco Sour",
      family: "Sour",
      era: "1920s • Victor Morris, Lima, Peru",
      baseSpirit: "Pisco (Peruvian Grape Distillate)",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Dry Shake, Wet Shake Hard & Double Strain",
      garnish: "3 Drops Angostura Bitters on Foam",
      footnote: "Unaged South American grape spirit delivers floral, earthy brightness held aloft by an egg white cap.",
      spec: [
        { measure: "2.0 oz", name: "Pisco", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Fresh Key Lime Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Simple Syrup", role: "Sweet Modifier" },
        { measure: "0.5 oz", name: "Egg White", role: "Textural Agent" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "What is Pisco, the mandatory base spirit of this classic sour?",
          correctAnswer: "Unaged South American grape brandy",
          options: [
            "Unaged South American grape brandy",
            "Fermented blue agave distillate",
            "Smoked Scottish barley spirit",
            "Sugarcane molasses spirit"
          ],
          hint: "Distilled from fermented grape must in copper pot stills without oak aging.",
          diagnosis: "Pisco is an aromatic, unaged grape distillate with vibrant floral and fruit notes."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Angostura Bitters Shaken Inside Tin with Spirit and Citrus (FLAW)",
          correctIngredientName: "Angostura Dropped Artfully on Top of Foam",
          prompt: "RECIPE AUDIT: Identify the garnish technique error:",
          correctAnswer: "Shaking bitters inside turns the white foam a muddy brown and loses aromatic nose",
          options: [
            "Shaking bitters inside turns the white foam a muddy brown and loses aromatic nose",
            "Pisco must be warmed before shaking",
            "Egg white must be replaced with warm milk",
            "Lime juice must be left out"
          ],
          hint: "Bitters provide an aromatic barrier against the sulfur smell of egg white on the foam surface.",
          diagnosis: "Dropping bitters onto the dense foam delivers aromatics to the nose while preserving the drink's stark white appearance."
        },
        family: {
          type: "measure",
          targetIndex: 1,
          prompt: "What is the standard tart lime measurement in an authentic Peruvian spec?",
          correctAnswer: "1.0 oz",
          options: ["1.0 oz", "0.25 oz", "2.0 oz", "0.5 oz"],
          hint: "Peruvian Pisco Sours run slightly more tart than American whiskey sours.",
          diagnosis: "1.0 oz tart lime juice matches Pisco's high proof and floral profile."
        }
      }
    },
    {
      id: "singapore-sling",
      name: "Singapore Sling",
      family: "Highball / Collins",
      era: "1915 • Ngiam Tong Boon, Raffles Hotel",
      baseSpirit: "London Dry Gin",
      glass: "Collins",
      ice: "Rocks",
      method: "Shake Hard with Ice & Strain into Glass over Ice; Top with Soda Splash",
      garnish: "Pineapple Spear, Brandied Cherry & Mint Sprig",
      footnote: "Created so colonial women could discreetly drink alcohol masquerading as fruit punch at the Long Bar.",
      spec: [
        { measure: "1.5 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.5 oz", name: "Cherry Heering", role: "Cherry Modifier" },
        { measure: "0.25 oz", name: "Bénédictine", role: "Herbal Modifier" },
        { measure: "4.0 oz", name: "Fresh Pineapple Juice", role: "Fruit Lengthener" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which French herbal liqueur gives the Singapore Sling its herbal undertone?",
          correctAnswer: "Bénédictine",
          options: ["Bénédictine", "Chartreuse", "Campari", "Anisette"],
          hint: "Complex herbal liqueur infused with honey, angelica, and myrrh.",
          diagnosis: "Bénédictine grounds the tropical fruit profile with rich herbal complexity."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Industrial Canned Corn-Syrup Punch Mix (FLAW)",
          correctIngredientName: "Fresh Pineapple Juice Shaken to Froth",
          prompt: "RECIPE AUDIT: Identify the modifier shortcut ruining this Sling:",
          correctAnswer: "Artificial red punch mix completely destroys the pineapple foam and complex profile",
          options: [
            "Artificial red punch mix completely destroys the pineapple foam and complex profile",
            "Gin must be replaced with warm scotch",
            "Sling drinks should never be served cold",
            "Cherry Heering should be swapped for soy sauce"
          ],
          hint: "Fresh pineapple juice creates a velvety, natural foam head when shaken hard.",
          diagnosis: "Real pineapple juice contains bromelain enzymes that froth into a creamy head while providing balanced fruit acidity."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which dark cherry liqueur gives the Sling its foundational rosy color?",
          correctAnswer: "Cherry Heering",
          options: ["Cherry Heering", "Maraschino Liqueur", "Crème de Violette", "Aperol"],
          hint: "Danish spiced dark cherry liqueur.",
          diagnosis: "Cherry Heering contributes the signature dark cherry and spice profile."
        }
      }
    },
    {
      id: "vesper",
      name: "Vesper",
      family: "Martini",
      era: "1953 • Ian Fleming, Casino Royale",
      baseSpirit: "Gin & Vodka",
      glass: "Martini",
      ice: "None / Chilled Stemware",
      method: "Shake Hard until Ice Cold & Fine Strain",
      garnish: "Large Thin Lemon Peel",
      footnote: "James Bond's original creation: 'Three measures of Gordon's, one of vodka, half a measure of Kina Lillet.'",
      spec: [
        { measure: "2.25 oz", name: "London Dry Gin", role: "Botanical Base" },
        { measure: "0.75 oz", name: "100-Proof Grain Vodka", role: "Neutral Proof Base" },
        { measure: "0.5 oz", name: "Cocchi Americano or Lillet Blanc", role: "Bitter Quinquina Modifier" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Why is Cocchi Americano preferred today over modern Lillet Blanc in a Vesper?",
          correctAnswer: "Cocchi preserves the original bitter quinine (cinchona) bite lost in modern Lillet",
          options: [
            "Cocchi preserves the original bitter quinine (cinchona) bite lost in modern Lillet",
            "Cocchi Americano is bright neon purple",
            "Lillet Blanc contains 90% sugar by volume",
            "Cocchi Americano is distilled from blue agave"
          ],
          hint: "Kina Lillet was reformulated in 1986 to remove bitter quinine bark.",
          diagnosis: "Cocchi Americano contains the original quinine bitterness of vintage Kina Lillet, balancing the high alcohol proof."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Tequila Blanco 0.75 oz (FLAW)",
          correctIngredientName: "Grain Vodka 0.75 oz",
          prompt: "RECIPE AUDIT: Identify the ingredient violation on this Bond ticket:",
          correctAnswer: "Tequila violates James Bond's exact grain vodka specification",
          options: [
            "Tequila violates James Bond's exact grain vodka specification",
            "Vesper cocktails must be served boiling hot",
            "Gin must never be shaken with ice",
            "Lemon peel must be flambéed in butter"
          ],
          hint: "Bond specifically specifies grain vodka in Casino Royale.",
          diagnosis: "High-proof grain vodka thins the gin's botanical weight while elevating overall proof and chilling capacity."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "What is the gin-to-vodka-to-quinquina ratio specified in Casino Royale?",
          correctAnswer: "3 : 1 : 0.5 (2.25 oz : 0.75 oz : 0.5 oz)",
          options: [
            "3 : 1 : 0.5 (2.25 oz : 0.75 oz : 0.5 oz)",
            "1 : 1 : 1 (Equal Parts)",
            "4 : 2 : 1",
            "2 : 2 : 2"
          ],
          hint: "Three measures of Gordon's, one of vodka, half of Kina Lillet.",
          diagnosis: "This exact 3:1:0.5 ratio yields a potent, cold, and razor-sharp drink."
        }
      }
    },
    {
      id: "aperol-spritz",
      name: "Aperol Spritz",
      family: "Bitter / Aperitivo",
      era: "1950s • Veneto, Italy",
      baseSpirit: "Aperol",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Build Ice, Add Prosecco, Follow with Aperol, Top with Soda Splash",
      garnish: "Half Orange Wheel & Castelvetrano Olive",
      footnote: "The classic 3-2-1 formula: 3 parts Prosecco, 2 parts Aperol, 1 splash of soda to preserve sparkling lift.",
      spec: [
        { measure: "3.0 oz", name: "Dry Prosecco D.O.C.", role: "Effervescent Wine Base" },
        { measure: "2.0 oz", name: "Aperol", role: "Bitter-Sweet Aperitivo" },
        { measure: "1.0 oz", name: "Club Soda", role: "Mineral Effervescence" }
      ],
      modes: {
        classic: {
          type: "measure",
          targetIndex: 0,
          prompt: "What is the standard Venetian 3-2-1 proportion for the Prosecco pour?",
          correctAnswer: "3.0 oz Prosecco",
          options: ["3.0 oz Prosecco", "1.0 oz Prosecco", "5.0 oz Prosecco", "0.5 oz Prosecco"],
          hint: "3 parts sparkling wine to 2 parts bitter aperitif.",
          diagnosis: "3 parts Prosecco provides the crisp, dry effervescent body that keeps Aperol refreshing."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Violently Shaken in Cocktail Shaker with Ice (FLAW)",
          correctIngredientName: "Built Gently in Chilled Glass with Dense Ice",
          prompt: "RECIPE AUDIT: Identify the service execution error:",
          correctAnswer: "Shaking in a tin destroys the effervescence of Prosecco and club soda",
          options: [
            "Shaking in a tin destroys the effervescence of Prosecco and club soda",
            "Aperol must be cooked in an oven first",
            "Spritzes should never contain ice",
            "Prosecco must be replaced with warm stout"
          ],
          hint: "Never shake carbonated sparkling wine and soda in a cocktail shaker.",
          diagnosis: "Spritzes are always built directly in a stem glass to preserve sparkle and aromatics."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which Italian amaro provides the vibrant orange hue, gentian, and rhubarb notes?",
          correctAnswer: "Aperol",
          options: ["Aperol", "Campari", "Fernet Branca", "Cynar"],
          hint: "Lower ABV (11%) bitter-sweet Italian aperitivo.",
          diagnosis: "Aperol provides bright orange, gentian, and rhubarb notes at a sessionable alcohol proof."
        }
      }
    },
    {
      id: "paper-plane",
      name: "Paper Plane",
      family: "Sour",
      era: "2008 • Sam Ross, The Violet Hour, Chicago",
      baseSpirit: "Bourbon Whiskey",
      glass: "Nick & Nora",
      ice: "None / Served Up",
      method: "Shake Hard with Ice & Fine Strain",
      garnish: "Miniature Paper Airplane on Rim",
      footnote: "Modern riff on the Last Word formula using amaro, Aperol, and bourbon.",
      spec: [
        { measure: "0.75 oz", name: "Bourbon Whiskey", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Aperol", role: "Bitter-Sweet Aperitif" },
        { measure: "0.75 oz", name: "Amaro Nonino Quintessentia", role: "Grappa-Based Herbal Amaro" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Which grappa-based amaro is mandatory for the authentic Paper Plane profile?",
          correctAnswer: "Amaro Nonino Quintessentia",
          options: ["Amaro Nonino Quintessentia", "Campari", "Fernet Branca", "Jägermeister"],
          hint: "An elegant Italian amaro aged in oak barrels with alpine herbs and mountain gentian.",
          diagnosis: "Amaro Nonino supplies notes of orange peel, dried fruit, and gentian bitterness on an aged grape distillate base."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Campari 1.5 oz (FLAW)",
          correctIngredientName: "Aperol 0.75 oz (Equal Parts)",
          prompt: "RECIPE AUDIT: Identify the modifier mistake unbalancing this spec:",
          correctAnswer: "Campari is too bitter and heavy, breaking the delicate balance of Nonino and lemon",
          options: [
            "Campari is too bitter and heavy, breaking the delicate balance of Nonino and lemon",
            "Bourbon should be replaced with white gin",
            "Lemon juice must be heated to boiling",
            "Drink must be served in a copper mug"
          ],
          hint: "The recipe requires Aperol's sweeter, lower-proof profile.",
          diagnosis: "Campari's intense gentian bitterness overpowers the fragile alpine notes of Amaro Nonino; Aperol is non-negotiable."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "What is the architectural proportion across all four ingredients?",
          correctAnswer: "0.75 oz (Equal Parts)",
          options: ["0.75 oz (Equal Parts)", "1.5 oz spirit to 0.5 oz modifiers", "0.25 oz each", "2.0 oz base to dashes of bitter"],
          hint: "Inherited directly from the Last Word structural family.",
          diagnosis: "The Paper Plane relies on strict equal parts (0.75 oz each) of bourbon, Aperol, Amaro Nonino, and lemon juice."
        }
      }
    },
    {
      id: "bees-knees",
      name: "Bee's Knees",
      family: "Sour",
      era: "1920s • Prohibition Classic",
      baseSpirit: "London Dry Gin",
      glass: "Coupe",
      ice: "None / Served Up",
      method: "Shake Hard with Ice & Double Strain",
      garnish: "Lemon Twist",
      footnote: "Wildflower honey and lemon masked the pungent aroma of crude 'bathtub gin' during Prohibition.",
      spec: [
        { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Honey Syrup (3:1 Honey to Water)", role: "Sweet Modifier" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 2,
          prompt: "Why must honey be diluted with water into a syrup before shaking?",
          correctAnswer: "Raw honey seizes and solidifies into a rock upon contact with cocktail ice",
          options: [
            "Raw honey seizes and solidifies into a rock upon contact with cocktail ice",
            "Honey is illegal to serve raw in bars",
            "Water increases the alcohol content of honey",
            "To make the drink turn neon green"
          ],
          hint: "Cold temperatures cause pure honey to stick to the bottom of the tin.",
          diagnosis: "Diluting honey with warm water (3:1) ensures it stays liquid and integrates into cold cocktails."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 2,
          flawIngredientDisplay: "Refined White Sugar Simple Syrup (FLAW)",
          correctIngredientName: "Wildflower Honey Syrup (3:1)",
          prompt: "RECIPE AUDIT: Identify the flavor substitution error:",
          correctAnswer: "Plain simple syrup turns this into a Gin Sour, losing floral honey complexity",
          options: [
            "Plain simple syrup turns this into a Gin Sour, losing floral honey complexity",
            "Gin must be replaced with warm scotch",
            "Lemon juice should be boiled with cloves",
            "Bee's Knees must be topped with hot tea"
          ],
          hint: "The name literally references the honey product produced by bees.",
          diagnosis: "Wildflower honey provides floral and beeswax aromatics that distinguish this cocktail from a standard Gin Sour."
        },
        family: {
          type: "measure",
          targetIndex: 1,
          prompt: "Specify the lemon juice pour that balances 0.75 oz honey syrup:",
          correctAnswer: "0.75 oz",
          options: ["0.75 oz", "0.25 oz", "1.5 oz", "2.0 oz"],
          hint: "Standard golden ratio sour balancing acid to sweet.",
          diagnosis: "0.75 oz lemon provides crisp acidity to balance the richness of rich honey syrup."
        }
      }
    },
    {
      id: "jungle-bird",
      name: "Jungle Bird",
      family: "Sour",
      era: "1978 • Aviary Bar, Kuala Lumpur Hilton",
      baseSpirit: "Blackstrap or Dark Rum",
      glass: "Rocks",
      ice: "Large Clear Ice Cube",
      method: "Shake Hard with Ice to Emulsify Pineapple; Strain over Fresh Ice",
      garnish: "Pineapple Fronds & Orchid Flower",
      footnote: "A rare tropical cocktail pairing dark molasses rum with Italian red bitter amaro.",
      spec: [
        { measure: "1.5 oz", name: "Blackstrap or Dark Jamaican Rum", role: "Molasses Base Spirit" },
        { measure: "0.75 oz", name: "Campari", role: "Bitter Aperitif Modifier" },
        { measure: "1.5 oz", name: "Fresh Pineapple Juice", role: "Foaming Tropical Element" },
        { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Which red Italian amaro introduces bold bitterness to this tropical rum drink?",
          correctAnswer: "Campari",
          options: ["Campari", "Aperol", "Fernet Branca", "Suze"],
          hint: "Bitter gentian and citrus aperitivo usually found in Negronis.",
          diagnosis: "Campari's assertive bitterness cuts through the heavy molasses of blackstrap rum and sweet pineapple juice."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 0,
          flawIngredientDisplay: "Vodka 1.5 oz (FLAW)",
          correctIngredientName: "Blackstrap or Dark Jamaican Rum 1.5 oz",
          prompt: "RECIPE AUDIT: Identify the base spirit failure:",
          correctAnswer: "Vodka lacks the rich molasses, caramel, and funk to stand up to Campari",
          options: [
            "Vodka lacks the rich molasses, caramel, and funk to stand up to Campari",
            "Pineapple juice must be cooked into a paste",
            "Campari is strictly prohibited in tropical drinks",
            "Jungle Birds must only be served warm"
          ],
          hint: "A heavy, dark molasses rum is required to counterbalance Campari.",
          diagnosis: "Blackstrap or funky pot-still dark rum supplies the caramel weight needed to match Campari's intense bitterness."
        },
        family: {
          type: "measure",
          targetIndex: 2,
          prompt: "What is the measure of fresh pineapple juice needed to create a rich foam head?",
          correctAnswer: "1.5 oz",
          options: ["1.5 oz", "0.25 oz", "4.0 oz", "0.0 oz"],
          hint: "Equal in volume to the base rum.",
          diagnosis: "1.5 oz of pineapple juice creates a creamy foam layer when shaken and softens the bitter edge."
        }
      }
    }
  ];

  /* ==========================================================================
     5. APPLICATION STATE ARCHITECTURE
     ========================================================================== */
  const state = {
    currentView: "menu", // "menu" | "gameplay"
    mode: persistentData.preferredMode || "classic",
    tickets: [],
    currentTicketIndex: 0,
    totalTickets: 5,
    activeCocktail: null,
    activeChallenge: null,
    selectedConfidence: "certain",
    shiftScore: 0,
    streak: 0,
    answered: false,
    shiftFinished: false
  };

  /* ==========================================================================
     6. DOM ELEMENT CACHE
     ========================================================================== */
  const DOM = {
    // Views
    mainMenuView: document.getElementById("mainMenuView"),
    gameplayView: document.getElementById("gameplayView"),

    // Menu Hub
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

    // Active Station Header / HUD
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
    specBody: document.getElementById("specBody"),
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
    btnReplayShift: document.getElementById("btnReplayShift"),

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
     7. VIEW NAVIGATION & TRANSITIONS
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

  function generateTicketDeck(modeName) {
    const available = COCKTAIL_DATABASE.filter(c => c.modes && c.modes[modeName]);
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 5);
  }

  function startShiftMode(modeName) {
    audio.playClick();
    state.mode = modeName;
    persistentData.preferredMode = modeName;
    saveStoredState(persistentData);

    state.tickets = generateTicketDeck(modeName);
    state.totalTickets = state.tickets.length;
    state.currentTicketIndex = 0;
    state.shiftScore = 0;
    state.streak = 0;
    state.shiftFinished = false;

    DOM.btnNextText.textContent = "NEXT TICKET";
    DOM.btnReplayShift.classList.add("hidden");

    DOM.modeTabs.forEach(tab => {
      const isMatch = (tab.dataset.mode === modeName);
      tab.classList.toggle("active", isMatch);
      tab.setAttribute("aria-selected", isMatch ? "true" : "false");
    });

    showView("gameplay");
    renderTicket();
  }

  /* ==========================================================================
     8. SPECIFICATION TICKET RENDERING
     ========================================================================== */
  function renderTicket() {
    state.answered = false;
    DOM.diagnosisTray.classList.add("hidden");
    DOM.choiceMatrix.classList.remove("hidden");
    DOM.confidenceBar.classList.remove("hidden");
    DOM.btnHint.disabled = false;

    DOM.specCard.classList.remove("card-enter");
    void DOM.specCard.offsetWidth;
    DOM.specCard.classList.add("card-enter");

    const cocktail = state.tickets[state.currentTicketIndex];
    state.activeCocktail = cocktail;
    const challenge = cocktail.modes[state.mode];
    state.activeChallenge = challenge;

    DOM.specBody.scrollTop = 0;

    DOM.cardFamily.textContent = `${cocktail.family.toUpperCase()} FAMILY`;
    DOM.cardTitle.textContent = cocktail.name;
    DOM.cardEra.textContent = cocktail.era;

    DOM.cardGlassCaption.textContent = cocktail.glass;
    DOM.glassSvgSlot.innerHTML = GLASS_SVGS[cocktail.glass] || GLASS_SVGS["Coupe"];

    // Render Technique & Troubleshoot Technique Flags
    DOM.paramMethodCell.classList.remove("is-blank-target", "is-flawed-target");
    if (challenge.type === "method") {
      DOM.paramMethodCell.classList.add("is-blank-target");
      DOM.paramMethodVal.innerHTML = `<span class="blank-slot" style="min-width:60px; height:14px;"></span>`;
    } else if (challenge.type === "troubleshoot" && challenge.targetIndex === -1) {
      DOM.paramMethodCell.classList.add("is-flawed-target");
      DOM.paramMethodVal.textContent = (challenge.flawIngredientDisplay || "TECHNIQUE FLAW").toUpperCase();
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

      const isTarget = (challenge.targetIndex === idx);
      const isTroubleshoot = (challenge.type === "troubleshoot" && isTarget);

      if (isTroubleshoot) {
        li.classList.add("is-flawed-target");
      } else if (isTarget && challenge.type !== "method") {
        li.classList.add("is-blank-target");
      }

      const measureSpan = document.createElement("span");
      measureSpan.className = "spec-measure";
      if (isTarget && challenge.type === "measure") {
        measureSpan.innerHTML = `<span class="blank-slot" style="min-width:44px;"></span>`;
      } else {
        measureSpan.textContent = item.measure;
      }

      const nameRoleWrap = document.createElement("div");
      nameRoleWrap.className = "spec-name-role";

      const nameSpan = document.createElement("span");
      nameSpan.className = "spec-name";

      if (isTroubleshoot && challenge.flawIngredientDisplay) {
        nameSpan.textContent = challenge.flawIngredientDisplay;
      } else if (isTarget && challenge.type === "ingredient") {
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

    DOM.deckPrompt.textContent = challenge.prompt;
    renderChoices(challenge.options);
    updateHUD();
  }

  function renderChoices(options) {
    DOM.choiceMatrix.innerHTML = "";
    const shuffledOptions = [...options];
    for (let index = shuffledOptions.length - 1; index > 0; index -= 1) {
      const swapIndex = Math.floor(Math.random() * (index + 1));
      [shuffledOptions[index], shuffledOptions[swapIndex]] = [
        shuffledOptions[swapIndex],
        shuffledOptions[index]
      ];
    }

    shuffledOptions.forEach((optText, index) => {
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
     9. ANSWER EVALUATION & PROGRESSION ENGINE
     ========================================================================== */
  function handleAnswer(chosenText, chosenButton) {
    if (state.answered) return;
    state.answered = true;

    persistentData.totalAttempts++;

    const cocktail = state.activeCocktail;
    const challenge = state.activeChallenge;
    const isCorrect = (chosenText === challenge.correctAnswer);

    const famKey = cocktail.family;
    if (persistentData.familyMastery[famKey]) {
      persistentData.familyMastery[famKey].attempts++;
      if (isCorrect) {
        persistentData.familyMastery[famKey].correct++;
      }
    }

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

      fillCardBlank(challenge, true);

      DOM.diagBadge.className = "diag-badge correct";
      DOM.diagBadge.textContent = "SPEC CERTIFIED ✓";
      DOM.diagPoints.textContent = `+${pointsEarned} PTS (${state.selectedConfidence.toUpperCase()})`;
      DOM.diagReason.textContent = challenge.diagnosis;
    } else {
      audio.playWrong();
      chosenButton.classList.add("is-wrong");

      buttons.forEach(b => {
        if (b.dataset.choice === challenge.correctAnswer) {
          b.classList.add("is-correct");
        }
      });

      state.streak = 0;
      fillCardBlank(challenge, false);

      DOM.diagBadge.className = "diag-badge wrong";
      DOM.diagBadge.textContent = "SPEC VIOLATION ✕";
      DOM.diagPoints.textContent = "+0 PTS (STREAK RESET)";
      DOM.diagReason.textContent = `Accurate spec: "${challenge.correctAnswer}". ${challenge.diagnosis}`;
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
      if (challenge.targetIndex === -1) {
        DOM.paramMethodVal.textContent = `${challenge.correctIngredientName || state.activeCocktail.method} (AUDITED)`.toUpperCase();
      } else {
        const el = DOM.ingredientList.querySelector(".is-flawed-target .spec-name");
        if (el) el.textContent = `${challenge.correctIngredientName || challenge.correctAnswer} (AUDITED)`;
      }
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
    DOM.diagBadge.textContent = "SHIFT COMPLETE ★";
    DOM.diagPoints.textContent = `FINAL SCORE: ${state.shiftScore}`;
    DOM.diagReason.textContent = `Shift tickets verified! Career statistics and family knowledge updated. High Score: ${persistentData.highScore} PTS.`;

    DOM.btnNextText.textContent = "RETURN TO MENU";
    DOM.btnReplayShift.classList.remove("hidden");
    DOM.btnNextTicket.focus();
  }

  function replayCurrentShift() {
    audio.playClick();
    startShiftMode(state.mode);
  }

  function handleHint() {
    if (state.answered || !state.activeChallenge) return;
    audio.playClick();
    DOM.btnHint.disabled = true;
    DOM.deckPrompt.textContent = `💡 CLUE: ${state.activeChallenge.hint}`;

    const wrongButtons = Array.from(DOM.choiceMatrix.querySelectorAll(".choice-btn")).filter(
      btn => btn.dataset.choice !== state.activeChallenge.correctAnswer
    );
    if (wrongButtons.length > 0) {
      const eliminated = wrongButtons[Math.floor(Math.random() * wrongButtons.length)];
      eliminated.disabled = true;
      eliminated.style.opacity = "0.35";
      eliminated.style.textDecoration = "line-through";
    }
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
    if (persistentData.totalCompleted >= 25 && pct >= 80) rank = "GRANDMASTER MIXOLOGIST";
    else if (persistentData.totalCompleted >= 12 && pct >= 70) rank = "SENIOR BARTENDER";
    else if (persistentData.totalCompleted >= 5) rank = "WORKING BARTENDER";
    DOM.menuRankBadge.textContent = rank;

    const isMuted = audio.muted;
    DOM.menuSoundIcon.textContent = isMuted ? "🔇" : "🔊";
    DOM.menuSoundLabel.textContent = `SOUND: ${isMuted ? "OFF" : "ON"}`;
    DOM.iconSoundOn.classList.toggle("hidden", isMuted);
    DOM.iconSoundOff.classList.toggle("hidden", !isMuted);
  }

  function renderCodex(query = "") {
    DOM.codexGrid.innerHTML = "";
    const filterTerm = query.trim().toLowerCase();

    const matched = COCKTAIL_DATABASE.filter(c => {
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
      emptyMsg.style.padding = "10px 0";
      emptyMsg.textContent = "No matching cocktail specifications found in atlas.";
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
    if (persistentData.totalCompleted >= 25 && pct >= 80) rank = "Grandmaster Mixologist";
    else if (persistentData.totalCompleted >= 12 && pct >= 70) rank = "Senior Bartender";
    else if (persistentData.totalCompleted >= 5) rank = "Working Bartender";
    DOM.stMasteryRank.textContent = rank;

    DOM.familyMeterList.innerHTML = "";
    const families = Object.keys(persistentData.familyMastery);

    families.forEach(fam => {
      const fStat = persistentData.familyMastery[fam];
      const famPct = fStat.attempts > 0 ? Math.round((fStat.correct / fStat.attempts) * 100) : 0;

      const row = document.createElement("div");
      row.className = "fam-meter-row";
      row.innerHTML = `
        <div class="fam-meter-info">
          <span>${fam}</span>
          <span>${fStat.correct}/${fStat.attempts} (${famPct}%)</span>
        </div>
        <div class="fam-track">
          <div class="fam-fill" style="width: ${famPct}%;"></div>
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
        <div class="glass-svg-wrap" style="width:32px; height:36px;">${GLASS_SVGS[glassName]}</div>
        <span class="glass-card-name">${glassName}</span>
        <span class="glass-card-desc">Prescribed Stemware</span>
      `;
      DOM.glassAtlasGrid.appendChild(card);
    });

    const FAMILY_DEFINITIONS = [
      { name: "The Sour (2 : 0.75 : 0.75)", desc: "2 oz Spirit + 0.75 oz Fresh Citrus + 0.75 oz Sweetener. Shaken hard for aeration and emulsification." },
      { name: "The Daisy (Citrus + Cordial)", desc: "A sour sweetened by a cordial or orange liqueur (e.g. Cointreau in the Margarita, Sidecar, or Corpse Reviver)." },
      { name: "The Old Fashioned (Spirit Forward)", desc: "2 oz Spirit + Demerara or Rich Syrup + Aromatic Bitters stirred gently over dense ice to velvet chill." },
      { name: "The Aperitivo / Equal Parts (1 : 1 : 1)", desc: "Equal parts harmony of spirit, bitter gentian aperitif, and vermouth (e.g. Negroni, Boulevardier)." },
      { name: "The Martini (High-Proof + Fortified)", desc: "High-proof spirit tempered by dry aromatized wine (e.g. 5:1 Dry Gin to French Vermouth)." },
      { name: "The Highball & Collins (Lengthened Sour)", desc: "Base spirit and citrus lengthened by effervescent club soda over clear column ice spears." }
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
    renderCodex(DOM.codexSearch.value || "");
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

  function switchModalPane(paneId) {
    audio.playClick();
    DOM.subnavButtons.forEach(btn => {
      const match = (btn.dataset.pane === paneId);
      btn.classList.toggle("active", match);
      btn.setAttribute("aria-selected", match ? "true" : "false");
    });
    DOM.modalPanes.forEach(pane => {
      pane.classList.toggle("active", pane.id === paneId);
    });
  }

  function resetCareerData() {
    if (confirm("Reset all saved high scores, streaks, and family mastery statistics?")) {
      localStorage.removeItem(STORAGE_KEY);
      Object.assign(persistentData, JSON.parse(JSON.stringify(defaultStorageData)));
      saveStoredState(persistentData);
      renderStats();
      updateMenuSummary();
      audio.playClick();
    }
  }

  /* ==========================================================================
     11. EVENT LISTENERS SETUP
     ========================================================================== */
  function setupEventListeners() {
    // Mode launches
    DOM.btnStartClassic.addEventListener("click", () => startShiftMode("classic"));
    DOM.btnStartRepair.addEventListener("click", () => startShiftMode("repair"));
    DOM.btnStartFamily.addEventListener("click", () => startShiftMode("family"));

    // Gameplay tabs
    DOM.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => startShiftMode(tab.dataset.mode));
    });

    // Navigation back to menu
    DOM.btnBackToMenu.addEventListener("click", () => {
      audio.playClick();
      showView("menu");
    });

    // Audio toggles
    const handleAudioToggle = () => {
      audio.toggleMute();
      updateMenuSummary();
    };
    DOM.btnAudioToggle.addEventListener("click", handleAudioToggle);
    DOM.btnMenuSoundToggle.addEventListener("click", handleAudioToggle);

    // Modal triggers
    DOM.btnOpenMenu.addEventListener("click", openModal);
    DOM.btnMenuOpenCodex.addEventListener("click", openModal);
    DOM.btnCloseModal.addEventListener("click", closeModal);
    DOM.modalBackdrop.addEventListener("click", (e) => {
      if (e.target === DOM.modalBackdrop) closeModal();
    });

    // Modal tabs
    DOM.subnavButtons.forEach(btn => {
      btn.addEventListener("click", () => switchModalPane(btn.dataset.pane));
    });

    // Codex live search
    DOM.codexSearch.addEventListener("input", (e) => {
      renderCodex(e.target.value);
    });

    // Reset progress
    DOM.btnResetProgress.addEventListener("click", resetCareerData);

    // Confidence radio selector
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

    // Shift progress buttons
    DOM.btnNextTicket.addEventListener("click", advanceNextTicket);
    DOM.btnReplayShift.addEventListener("click", replayCurrentShift);
    DOM.btnHint.addEventListener("click", handleHint);

    // Keyboard Shortcuts
    window.addEventListener("keydown", (e) => {
      if (DOM.modalBackdrop && !DOM.modalBackdrop.classList.contains("hidden")) {
        if (e.key === "Escape") closeModal();
        return;
      }

      if (state.currentView !== "gameplay") return;

      if (!state.answered) {
        if (["1", "2", "3", "4"].includes(e.key)) {
          const index = parseInt(e.key, 10) - 1;
          const buttons = DOM.choiceMatrix.querySelectorAll(".choice-btn");
          if (buttons[index] && !buttons[index].disabled) {
            buttons[index].click();
          }
        } else if (e.key.toLowerCase() === "h") {
          if (!DOM.btnHint.disabled) DOM.btnHint.click();
        }
      } else {
        if (e.key === "Enter" || e.key === " ") {
          // Prevent double fire if an on-screen button is actively focused
          if (e.target && e.target.tagName === "BUTTON") return;
          e.preventDefault();
          advanceNextTicket();
        }
      }
    });
  }

  // Application bootstrap
  function init() {
    updateMenuSummary();
    setupEventListeners();
  }

  init();
})();
