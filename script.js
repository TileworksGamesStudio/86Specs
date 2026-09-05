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

      // Merge defaults safely
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
    Collins: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
      <polygon points="15,6 33,6 31,42 17,42" />
      <line x1="16" y1="16" x2="32" y2="16" stroke-dasharray="2 2" opacity="0.6"/>
    </svg>`
  };

  /* ==========================================================================
     4. COMPREHENSIVE COCKTAIL DATABASE
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
      method: "Shake (Dry Shake first)",
      garnish: "Angostura Drops & Lemon Twist",
      footnote: "Dry shaking without ice emulsifies the egg white proteins prior to cold dilution.",
      spec: [
        { measure: "2.0 oz", name: "Bourbon or Rye Whiskey", role: "Base Spirit" },
        { measure: "0.75 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
        { measure: "0.75 oz", name: "Rich Simple Syrup (2:1)", role: "Sweet Modifier" },
        { measure: "1 dash", name: "Egg White (Optional)", role: "Textural Agent" }
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
      ice: "Large Clear Cube",
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
      method: "Hard Shake",
      garnish: "Lime Wheel & Half-Salt Rim",
      footnote: "A classic Daisy: spirit, citrus acid, and an orange liqueur modifier.",
      spec: [
        { measure: "2.0 oz", name: "Blanco Tequila", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Cointreau / Triple Sec", role: "Orange Cordial Modifier" },
        { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" }
      ],
      modes: {
        classic: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Identify the cordial modifier that defines the Margarita as a Daisy:",
          correctAnswer: "Cointreau / Triple Sec",
          options: ["Cointreau / Triple Sec", "Maraschino Liqueur", "Sweet Vermouth", "Creme de Violette"],
          hint: "A Daisy cocktail swaps out plain syrup for a citrus-flavored liqueur.",
          diagnosis: "A Daisy structure pairs spirit with fresh citrus and an orange liqueur like Cointreau."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 1,
          flawIngredientDisplay: "Bottled Sour Mix & Sweet Vermouth (FLAW)",
          correctIngredientName: "Fresh Lime Juice & Cointreau",
          prompt: "RECIPE AUDIT: Identify the fatal modifier violation in this spec:",
          correctAnswer: "Artificial sour mix and vermouth replace fresh lime and orange liqueur",
          options: [
            "Artificial sour mix and vermouth replace fresh lime and orange liqueur",
            "Tequila must be replaced with London Dry Gin",
            "Margaritas must never have salt on the rim",
            "A Margarita should be stirred in a beaker"
          ],
          hint: "The modifier and acid must be fresh lime juice and triple sec.",
          diagnosis: "Bottled mix introduces artificial preservatives. Real Margaritas require 100% agave tequila, fresh lime, and orange liqueur."
        },
        family: {
          type: "ingredient",
          targetIndex: 0,
          prompt: "Which spirit grounds the canonical Margarita Daisy formula?",
          correctAnswer: "Blanco Tequila (100% Agave)",
          options: ["Blanco Tequila (100% Agave)", "Cognac", "London Dry Gin", "White Rum"],
          hint: "An unaged agave spirit with herbal, peppery vegetal notes.",
          diagnosis: "Blanco tequila provides the vegetal agave backbone for the citrus and triple sec."
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
      method: "Stir Thoroughly",
      garnish: "Lemon Twist or Castelvetrano Olive",
      footnote: "Stirring protects botanical clarity and produces a dense, crystal-clear texture without aeration.",
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
          hint: "This dry aromatized wine softens juniper proof without dark sugar.",
          diagnosis: "Dry French vermouth imparts herbal acidity to round out high-proof gin without masking botanicals."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: -1,
          flawIngredientDisplay: "Violently Shaken until Frothy & Broken Ice Chips (FLAW)",
          correctIngredientName: "Gently Stirred to Velvety Clarity",
          prompt: "RECIPE AUDIT: Identify the technique error on this classic Martini ticket:",
          correctAnswer: "Shaking creates unwanted ice shards and cloudy aeration",
          options: [
            "Shaking creates unwanted ice shards and cloudy aeration",
            "A Martini should never contain gin",
            "Vermouth must be boiled in a copper pan first",
            "The glass should be warmed under hot water"
          ],
          hint: "Unless explicitly ordered 'bruised', a classic gin martini should be stirred.",
          diagnosis: "Shaking aerates the spirit and fills the drink with micro-ice shards, destroying silky clarity."
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
      garnish: "Lime Wheel (or none)",
      footnote: "The purest expression of the sour: sugar cane spirit, lime acid, and sucrose.",
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
          hint: "A clean, lightly aged and filtered sugarcane distillate.",
          diagnosis: "White rum provides clean grass and tropical notes that marry with fresh lime and sucrose."
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
      method: "Shake Citrus & Syrup, Top with Club Soda",
      garnish: "Lemon Wheel & Maraschino Cherry",
      footnote: "An elongated sour: spirit, citrus, sugar, topped with effervescent soda water.",
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
          hint: "Unflavored carbonated mineral water provides effervescence without added sweetness.",
          diagnosis: "Club soda lengthens the sour into a tall, refreshing highball without adding residual sugar."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 3,
          flawIngredientDisplay: "Club Soda Shaken Inside Tin with Ice (FLAW)",
          correctIngredientName: "Club Soda Poured Gently as Top",
          prompt: "RECIPE AUDIT: Identify the bartender technique disaster on this Collins ticket:",
          correctAnswer: "Shaking carbonated soda inside a sealed shaker causes pressure explosion",
          options: [
            "Shaking carbonated soda inside a sealed shaker causes pressure explosion",
            "Gin cannot be mixed with lemon juice",
            "Tom Collins must be served warm",
            "Lemon wheel must be flambéed"
          ],
          hint: "Never shake carbonated liquids in a tin.",
          diagnosis: "Effervescent toppers must always be built on top after shaking the sour core, never shaken in the tin."
        },
        family: {
          type: "measure",
          targetIndex: 0,
          prompt: "Specify the standard spirit pour for a tall Collins:",
          correctAnswer: "2.0 oz",
          options: ["2.0 oz", "0.5 oz", "3.5 oz", "1.0 oz"],
          hint: "Full 2 oz base spirit provides punch that withstands club soda dilution.",
          diagnosis: "2.0 oz base spirit ensures botanical presence survives lengthening with soda."
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
      method: "Stir Thoroughly",
      garnish: "Brandied Cherry",
      footnote: "The 2:1 formula: American whiskey balanced by Italian vermouth and aromatic bitters.",
      spec: [
        { measure: "2.0 oz", name: "Rye Whiskey", role: "Base Spirit" },
        { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
        { measure: "2 dashes", name: "Angostura Bitters", role: "Aromatic Accent" }
      ],
      modes: {
        classic: {
          type: "measure",
          targetIndex: 1,
          prompt: "Specify the classic pour of sweet vermouth in a standard Manhattan:",
          correctAnswer: "1.0 oz",
          options: ["1.0 oz", "0.25 oz", "2.0 oz", "0.5 oz"],
          hint: "Standard 2:1 whiskey to vermouth ratio.",
          diagnosis: "The canonical Manhattan formula follows 2 parts rye (2.0 oz) to 1 part sweet vermouth (1.0 oz)."
        },
        repair: {
          type: "troubleshoot",
          targetIndex: 0,
          flawIngredientDisplay: "Vodka 2.0 oz (FLAW)",
          correctIngredientName: "Rye Whiskey 2.0 oz",
          prompt: "RECIPE AUDIT: Identify the base spirit flaw on this Manhattan ticket:",
          correctAnswer: "Vodka has no oak tannins or spice to support sweet vermouth",
          options: [
            "Vodka has no oak tannins or spice to support sweet vermouth",
            "Manhattans must only be made with dark rum",
            "Sweet vermouth is illegal in New York",
            "Bitters must be omitted completely"
          ],
          hint: "A Manhattan requires the barrel age and spicy rye grains of American whiskey.",
          diagnosis: "Rye whiskey provides spicy proof and oak tannins to balance sweet fortified vermouth."
        },
        family: {
          type: "ingredient",
          targetIndex: 1,
          prompt: "Identify the fortified wine modifier in the Manhattan:",
          correctAnswer: "Sweet Red Vermouth",
          options: ["Sweet Red Vermouth", "Dry French Vermouth", "Triple Sec", "Apricot Brandy"],
          hint: "An Italian Torino vermouth with botanical caramel notes.",
          diagnosis: "Sweet vermouth introduces acidity, herbal complexity, and sweetness to 2 oz rye."
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
    // Filter cocktails that have a challenge defined for this specific mode
    const available = COCKTAIL_DATABASE.filter(c => c.modes && c.modes[modeName]);
    // Shuffle tickets for variety
    const shuffled = [...available].sort(() => Math.random() - 0.5);
    // Return standard 5 tickets
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

    // Reset buttons
    DOM.btnNextText.textContent = "NEXT TICKET";
    DOM.btnReplayShift.classList.add("hidden");

    // Sync mode tabs UI
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

    // Trigger card enter animation
    DOM.specCard.classList.remove("card-enter");
    void DOM.specCard.offsetWidth;
    DOM.specCard.classList.add("card-enter");

    const cocktail = state.tickets[state.currentTicketIndex];
    state.activeCocktail = cocktail;
    const challenge = cocktail.modes[state.mode];
    state.activeChallenge = challenge;

    // Reset container scroll position so top is always immediately seen
    DOM.specBody.scrollTop = 0;

    // Masthead
    DOM.cardFamily.textContent = `${cocktail.family.toUpperCase()} FAMILY`;
    DOM.cardTitle.textContent = cocktail.name;
    DOM.cardEra.textContent = cocktail.era;

    // Glassware
    DOM.cardGlassCaption.textContent = cocktail.glass;
    DOM.glassSvgSlot.innerHTML = GLASS_SVGS[cocktail.glass] || GLASS_SVGS["Coupe"];

    // Parameters
    DOM.paramMethodCell.classList.remove("is-blank-target");
    if (challenge.type === "method") {
      DOM.paramMethodCell.classList.add("is-blank-target");
      DOM.paramMethodVal.innerHTML = `<span class="blank-slot" style="min-width:60px; height:14px;"></span>`;
    } else {
      DOM.paramMethodVal.textContent = cocktail.method.toUpperCase();
    }

    DOM.paramIceVal.textContent = cocktail.ice.toUpperCase();
    DOM.paramGarnishVal.textContent = cocktail.garnish.toUpperCase();
    DOM.footnoteText.textContent = cocktail.footnote;

    // Ingredients
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
     9. ANSWER EVALUATION & PROGRESSION ENGINE
     ========================================================================== */
  function handleAnswer(chosenText, chosenButton) {
    if (state.answered) return;
    state.answered = true;

    persistentData.totalAttempts++;

    const cocktail = state.activeCocktail;
    const challenge = state.activeChallenge;
    const isCorrect = (chosenText === challenge.correctAnswer);

    // Track family mastery per cocktail category
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
      const el = DOM.ingredientList.querySelector(".is-flawed-target .spec-name");
      if (el) el.textContent = `${challenge.correctIngredientName || challenge.correctAnswer} (AUDITED)`;
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
     11. USER CONTROLS, KEYBOARD & EVENT BINDINGS
     ========================================================================== */
  function triggerHint() {
    if (state.answered || !state.activeChallenge) return;
    audio.playClick();
    DOM.btnHint.disabled = true;
    DOM.deckPrompt.textContent = `HINT: ${state.activeChallenge.hint}`;
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
    // Menu Launchers
    DOM.btnStartClassic.addEventListener("click", () => startShiftMode("classic"));
    DOM.btnStartRepair.addEventListener("click", () => startShiftMode("repair"));
    DOM.btnStartFamily.addEventListener("click", () => startShiftMode("family"));
    DOM.btnMenuOpenCodex.addEventListener("click", openModal);

    DOM.btnMenuSoundToggle.addEventListener("click", () => {
      audio.toggleMute();
      updateMenuSummary();
      if (!audio.muted) audio.playClick();
    });

    // Gameplay HUD Actions
    DOM.btnBackToMenu.addEventListener("click", () => {
      audio.playClick();
      showView("menu");
    });

    DOM.btnNextTicket.addEventListener("click", advanceNextTicket);
    DOM.btnReplayShift.addEventListener("click", replayCurrentShift);
    DOM.btnHint.addEventListener("click", triggerHint);
    window.addEventListener("keydown", handleKeyboard);

    DOM.btnAudioToggle.addEventListener("click", () => {
      audio.toggleMute();
      updateMenuSummary();
      if (!audio.muted) audio.playClick();
    });

    // Gameplay Mode Tabs
    DOM.modeTabs.forEach(tab => {
      tab.addEventListener("click", () => {
        startShiftMode(tab.dataset.mode);
      });
    });

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

    // Stored Progress Reset
    DOM.btnResetProgress.addEventListener("click", () => {
      if (!window.confirm("Reset all bartender career stats, streak, and family records?")) {
        return;
      }
      localStorage.removeItem(STORAGE_KEY);
      persistentData.highScore = 0;
      persistentData.bestStreak = 0;
      persistentData.totalCompleted = 0;
      persistentData.correctCount = 0;
      persistentData.totalAttempts = 0;
      Object.keys(persistentData.familyMastery).forEach(k => {
        persistentData.familyMastery[k] = { attempts: 0, correct: 0 };
      });
      saveStoredState(persistentData);

      state.shiftScore = 0;
      state.streak = 0;
      updateHUD();
      updateMenuSummary();
      renderStats();
      closeModal();
    });

    setupConfidenceControls();
  }

  function init() {
    bindEvents();
    updateMenuSummary();
    showView("menu");
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
