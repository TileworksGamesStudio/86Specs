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
Coupe: <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <path d="M6 14 C12 28 36 28 42 14 Z" /> <line x1="24" y1="26" x2="24" y2="40" /> <line x1="15" y1="40" x2="33" y2="40" /> </svg>,
Rocks: <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="10,10 38,10 35,40 13,40" /> <line x1="14" y1="20" x2="34" y2="20" stroke-dasharray="2 2" opacity="0.6"/> </svg>,
Highball: <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="14,8 34,8 32,42 16,42" /> <line x1="15" y1="18" x2="33" y2="18" stroke-dasharray="2 2" opacity="0.6"/> </svg>,
Martini: <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="6,12 42,12 24,28" /> <line x1="24" y1="28" x2="24" y2="40" /> <line x1="14" y1="40" x2="34" y2="40" /> </svg>,
"Nick & Nora": <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <path d="M12 12 C12 24 36 24 36 12 Z" /> <line x1="24" y1="24" x2="24" y2="40" /> <line x1="16" y1="40" x2="32" y2="40" /> </svg>,
Collins: <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"> <polygon points="15,6 33,6 31,42 17,42" /> <line x1="16" y1="16" x2="32" y2="16" stroke-dasharray="2 2" opacity="0.6"/> </svg>
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
I want this back with more glasses
like
Rocks Glass (Single Old Fashioned): A short, sturdy tumbler used for neat spirits, spirits on the rocks, and classic short cocktails like the Negroni.Double Old Fashioned Glass: A larger version of the rocks glass with a heavier base, ideal for muddled drinks, large ice spheres, or cocktails like the Old Fashioned.Glencairn Glass: A tulip-shaped glass specifically engineered to concentrate aromas, primarily used for neat scotch and single malt whiskeys.Snifter: A short-stemmed glass with a wide bottom and narrow top, designed to hold aged spirits like brandy or cognac while capturing the bouquet.Julep Cup: A traditional metallic cup (usually silver or pewter) that frosts over quickly, used exclusively for the Mint Julep.Tall Glasses (Highballs & Long Drinks)Highball Glass: A tall, straight-sided cylindrical glass used for simple, fizzy spirit-and-mixer drinks like a Gin & Tonic or Scotch and Soda.Collins Glass: Narrower and slightly taller than a highball glass, used for carbonated long drinks like the Tom Collins, Mojito, or Paloma.Hurricane Glass: A tall, curved, lamp-shade-shaped glass used for large, fruity tropical drinks and its namesake cocktail, the Hurricane.Tiki Mug: Ceramic, heavily stylized drinking vessels shaped like tropical deities or marine life, used for complex, multi-ingredient rum cocktails.Zombie Glass: A very tall, ultra-narrow glass originally designed to fit the exact volume of the classic zombie cocktail while controlling dilution.Pint Glass: A standard utilitarian glass used mostly for draft beer, but also frequently used in bars to serve cider, water, or simple long drinks.Stemmed Glasses (Served "Up")Martini Glass: The classic, V-shaped stemmed glass designed to keep chilled cocktails cold by preventing hand contact, used for Martinis and Cosmopolitans.Coupe Glass: A stemmed glass with a broad, shallow bowl originally made for Champagne, now highly popular for shaken cocktails served without ice.Nick & Nora Glass: A small, stemmed glass with a rounded, bell-shaped bowl that makes it easier to sip from and less prone to spilling than a martini glass.Champagne Flute: A tall, narrow stemmed glass designed to preserve the carbonation and bubbles of sparkling wine cocktails like the French 75.Champagne Tulip: Similar to a flute but with a wider bowl and narrower rim to better express aromas while holding effervescence.Wobble / Absinthe Glass: A thick, reservoir-bottomed stemmed glass designed specifically for the traditional preparation of absinthe with water and sugar.Margarita Glass: A variation of the coupe featuring a double-tiered bowl with a wide rim, perfect for holding a salted or sugared edge.Poco Grande Glass: Similar to a hurricane glass but resting on a distinct stem, frequently used for blended frozen drinks like Piña Coladas.White Wine Glass: A stemmed glass with a medium, U-shaped bowl used for white wines and lighter wine-based aperitifs.Red Wine Glass: A larger stemmed glass with a wider, rounder bowl designed to aerate full-bodied red wines or build wine spritzers.Specialty Glasses (Hot, Layered, & Specialty Pours)Irish Coffee Glass: A stemmed, heat-resistant glass featuring a sturdy handle, used for hot cocktails like Irish Coffee or Hot Toddies.Georgian / Toddy Mug: A thick-walled, clear glass mug used for warm winter cocktails and spiced mulled drinks.Cordial / Pousse-Café Glass: A tiny, narrow stemmed glass used for serving straight liqueurs, digestifs, or visually distinct layered shots.Shot Glass: A small, heavy-bottomed glass meant for holding exactly 1 to 2 ounces of spirits intended to be consumed in a single gulp.
And can we add 50 deatiled calssic cocktails in full detail like seen herer
now wmake the js script again witht hese updates and adds
returning just the glasswear and cocktail portion of the js script
Model 10:46 PM
ThinkingThoughts
Expand to view model thoughts

chevron_right
```javascript
/* ==========================================================================
   1. EXPANDED GLASSWARE VECTOR ASSETS (GLASS_SVGS)
   ========================================================================== */
const GLASS_SVGS = {
  // --- Tumblers & Neat Vessels ---
  Rocks: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="11,12 37,12 34,40 14,40" />
    <line x1="14" y1="36" x2="34" y2="36" opacity="0.4"/>
    <line x1="13" y1="20" x2="35" y2="20" stroke-dasharray="2 2" opacity="0.6"/>
  </svg>`,

  "Double Old Fashioned": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="9,10 39,10 36,41 12,41" />
    <line x1="12" y1="36" x2="36" y2="36" stroke-width="3" opacity="0.5"/>
    <line x1="11" y1="20" x2="37" y2="20" stroke-dasharray="2 2" opacity="0.6"/>
  </svg>`,

  Glencairn: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 10 C17 10 13 22 13 27 C13 33 18 36 24 36 C30 36 35 33 35 27 C35 22 31 10 31 10" />
    <path d="M21 36 L19 41 L29 41 L27 36" />
  </svg>`,

  Snifter: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M16 10 C12 18 10 24 10 29 C10 36 16 38 24 38 C32 38 38 36 38 29 C38 24 36 18 32 10 Z" />
    <line x1="24" y1="38" x2="24" y2="42" />
    <line x1="18" y1="42" x2="30" y2="42" />
  </svg>`,

  "Julep Cup": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="12,12 36,12 33,40 15,40" />
    <line x1="10" y1="12" x2="38" y2="12" />
    <line x1="13" y1="40" x2="35" y2="40" stroke-width="2.6" />
    <line x1="14" y1="16" x2="34" y2="16" opacity="0.4" />
  </svg>`,

  // --- Tall Glasses (Highballs & Long Drinks) ---
  Highball: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="14,8 34,8 32,42 16,42" />
    <line x1="15" y1="18" x2="33" y2="18" stroke-dasharray="2 2" opacity="0.6"/>
    <line x1="16" y1="38" x2="32" y2="38" opacity="0.4"/>
  </svg>`,

  Collins: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="15,6 33,6 31,42 17,42" />
    <line x1="16" y1="16" x2="32" y2="16" stroke-dasharray="2 2" opacity="0.6"/>
    <line x1="17" y1="39" x2="31" y2="39" opacity="0.4"/>
  </svg>`,

  Hurricane: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M17 6 C17 14 13 22 13 28 C13 36 20 38 24 38 C28 38 35 36 35 28 C35 22 31 14 31 6 Z" />
    <line x1="24" y1="38" x2="24" y2="42" />
    <line x1="18" y1="42" x2="30" y2="42" />
  </svg>`,

  "Tiki Mug": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="15" y="8" width="18" height="34" rx="2" />
    <line x1="15" y1="14" x2="33" y2="14" />
    <circle cx="20" cy="20" r="1.5" fill="currentColor" />
    <circle cx="28" cy="20" r="1.5" fill="currentColor" />
    <path d="M19 28 Q24 32 29 28" />
    <line x1="15" y1="36" x2="33" y2="36" />
  </svg>`,

  Zombie: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="16,4 32,4 30,44 18,44" />
    <line x1="17" y1="12" x2="31" y2="12" stroke-dasharray="2 2" opacity="0.6" />
    <line x1="18" y1="40" x2="30" y2="40" opacity="0.4" />
  </svg>`,

  Pint: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="13,8 35,8 31,42 17,42" />
    <line x1="13.5" y1="14" x2="34.5" y2="14" opacity="0.4" />
    <line x1="16" y1="38" x2="32" y2="38" opacity="0.4" />
  </svg>`,

  // --- Stemmed Glasses (Served "Up") ---
  Martini: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="6,12 42,12 24,28" />
    <line x1="24" y1="28" x2="24" y2="40" />
    <line x1="14" y1="40" x2="34" y2="40" />
  </svg>`,

  Coupe: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M6 14 C12 28 36 28 42 14 Z" />
    <line x1="24" y1="26" x2="24" y2="40" />
    <line x1="15" y1="40" x2="33" y2="40" />
  </svg>`,

  "Nick & Nora": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 12 C12 24 36 24 36 12 Z" />
    <line x1="24" y1="24" x2="24" y2="40" />
    <line x1="16" y1="40" x2="32" y2="40" />
  </svg>`,

  "Champagne Flute": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 6 L30 6 L28 26 C28 30 24 32 24 32 C24 32 20 30 20 26 Z" />
    <line x1="24" y1="32" x2="24" y2="42" />
    <line x1="17" y1="42" x2="31" y2="42" />
  </svg>`,

  "Champagne Tulip": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 8 C15 16 15 22 20 28 C22 30 24 31 24 31 C24 31 26 30 28 28 C33 22 33 16 30 8 Z" />
    <line x1="24" y1="31" x2="24" y2="42" />
    <line x1="17" y1="42" x2="31" y2="42" />
  </svg>`,

  "Absinthe Glass": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M14 10 L34 10 L30 24 C28 26 26 26 26 28 C26 30 28 32 28 34 L20 34 C20 32 22 30 22 28 C22 26 20 26 18 24 Z" />
    <line x1="24" y1="34" x2="24" y2="42" />
    <line x1="16" y1="42" x2="32" y2="42" />
  </svg>`,

  Margarita: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M7 10 L41 10 L35 18 C31 21 28 20 28 25 L20 25 C20 20 17 21 13 18 Z" />
    <line x1="24" y1="25" x2="24" y2="40" />
    <line x1="16" y1="40" x2="32" y2="40" />
  </svg>`,

  "Poco Grande": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M18 10 C18 16 14 22 14 26 C14 32 19 34 24 34 C29 34 34 32 34 26 C34 22 30 16 30 10 Z" />
    <line x1="24" y1="34" x2="24" y2="42" />
    <line x1="18" y1="42" x2="30" y2="42" />
  </svg>`,

  "White Wine": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 10 C15 22 20 28 24 28 C28 28 33 22 33 10 Z" />
    <line x1="24" y1="28" x2="24" y2="41" />
    <line x1="17" y1="41" x2="31" y2="41" />
  </svg>`,

  "Red Wine": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 12 C12 24 18 30 24 30 C30 30 36 24 36 12 C36 12 32 12 24 12 C16 12 12 12 12 12 Z" />
    <line x1="24" y1="30" x2="24" y2="41" />
    <line x1="16" y1="41" x2="32" y2="41" />
  </svg>`,

  // --- Specialty Glasses (Hot, Layered, & Specialized) ---
  "Irish Coffee": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M15 8 L31 8 L29 28 C29 32 27 34 24 34 C21 34 19 32 19 28 Z" />
    <path d="M30 14 C34 14 36 16 36 20 C36 24 32 25 29 25" />
    <line x1="24" y1="34" x2="24" y2="40" />
    <line x1="17" y1="40" x2="31" y2="40" />
  </svg>`,

  "Toddy Mug": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="13" y="10" width="18" height="28" rx="2" />
    <path d="M31 16 C36 16 38 18 38 23 C38 28 35 30 31 30" />
    <line x1="11" y1="40" x2="33" y2="40" stroke-width="2.6" />
  </svg>`,

  Cordial: `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M20 12 L28 12 L27 24 C27 26 24 28 24 28 C24 28 21 26 21 24 Z" />
    <line x1="24" y1="28" x2="24" y2="40" />
    <line x1="18" y1="40" x2="30" y2="40" />
  </svg>`,

  "Shot Glass": `<svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="14,12 34,12 31,40 17,40" />
    <line x1="17" y1="34" x2="31" y2="34" stroke-width="3" opacity="0.5"/>
  </svg>`
};

/* ==========================================================================
   2. COMPREHENSIVE 50 CLASSIC COCKTAIL DATABASE (COCKTAIL_DATABASE)
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
        hint: "Provides barrel oak tannins and proof to support tart fresh lemon juice.",
        diagnosis: "Bourbon or rye whiskey supplies the proof and vanilla-oak structure necessary to balance 0.75 oz lemon and syrup."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Bottled Sweet and Sour Powder Mix (FLAW)",
        correctIngredientName: "Fresh Lemon Juice & Simple Syrup",
        prompt: "RECIPE AUDIT: Identify the fatal flaw ruining this Whiskey Sour spec:",
        correctAnswer: "Artificial powdered sour mix ruins natural citrus brightness and silky mouthfeel",
        options: [
          "Artificial powdered sour mix ruins natural citrus brightness and silky mouthfeel",
          "Bourbon should never be paired with citrus",
          "Egg whites must always be boiled before incorporation",
          "Whiskey Sours must only be served warm in a ceramic mug"
        ],
        hint: "Commercial powdered mixes introduce synthetic preservatives and chemical astringency.",
        diagnosis: "Fresh lemon juice balanced with pure sucrose is mandatory; commercial sour powders mask spirit nuances and destroy foam stability."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "Identify the canonical acid pour in the standard 2:0.75:0.75 Sour template:",
        correctAnswer: "0.75 oz",
        options: ["0.75 oz", "0.25 oz", "1.25 oz", "1.5 oz"],
        hint: "The balanced craft sour balances 2.0 oz spirit against equal parts citrus and rich sweetener.",
        diagnosis: "Standard craft sour architecture relies on 0.75 oz fresh citrus juice to temper 2.0 oz base spirit."
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
        hint: "The classic Negroni is built upon strict equal-parts harmony.",
        diagnosis: "A canonical Negroni demands equal parts (1.0 oz each) of gin, Campari, and sweet vermouth."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Campari 2.5 oz (FLAW)",
        correctIngredientName: "Campari (Equal Parts 1.0 oz)",
        prompt: "RECIPE AUDIT: Identify the flaw that completely unbalances this Negroni:",
        correctAnswer: "Over-Bitter: Campari heavily overpowers the gin and vermouth botanicals",
        options: [
          "Over-Bitter: Campari heavily overpowers the gin and vermouth botanicals",
          "Base Spirit: London Dry Gin is strictly prohibited in Negronis",
          "Service Method: It must be whipped in an electric blender with dairy cream",
          "Glassware: Must be served exclusively in a fluted champagne glass"
        ],
        hint: "Look at the proportions—the bitter Italian amaro dwarfs the other two ingredients.",
        diagnosis: "Equal-parts proportioning is the backbone of the Negroni. Doubling the bitter modifier destroys aromatic balance."
      },
      family: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which aromatized wine completes the Negroni 1:1:1 formula?",
        correctAnswer: "Sweet Red Vermouth",
        options: ["Sweet Red Vermouth", "Dry French Vermouth", "Fino Sherry", "Ruby Port"],
        hint: "This Torino-style vermouth balances gentian bitterness with sugar and botanicals.",
        diagnosis: "Sweet red vermouth balances both the assertive bitterness of Campari and the dry botanical pine of gin."
      }
    }
  },
  {
    id: "old-fashioned",
    name: "Old Fashioned",
    family: "Old Fashioned",
    era: "1880s • Pendennis Club / Louisville",
    baseSpirit: "Rye or Bourbon Whiskey",
    glass: "Double Old Fashioned",
    ice: "Large Clear Ice Cube",
    method: "Stir Thoroughly",
    garnish: "Expressed Orange Peel & Brandied Cherry",
    footnote: "The primogenitor cocktail: spirit, sugar, water (controlled dilution), and aromatic bitters.",
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
        correctAnswer: "Stir Thoroughly with Dense Ice",
        options: [
          "Stir Thoroughly with Dense Ice",
          "Hard Shake & Fine Strain",
          "Build in Glass & Top with Club Soda",
          "Muddle Citrus Flesh & Flash Blend"
        ],
        hint: "Spirit-forward drinks without fruit juice require gentle stirring to preserve clarity and texture.",
        diagnosis: "Stirring gently incorporates cold dilution without chipping ice or introducing aerated micro-bubbles."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Muddled Maraschino Cherry & Orange Slice in Pint Glass (FLAW)",
        correctIngredientName: "Demerara Syrup & Expressed Citrus Peel",
        prompt: "RECIPE AUDIT: Identify the Prohibition-era shortcut distorting this Old Fashioned:",
        correctAnswer: "Muddling fruit pulp creates an over-diluted fruit compote",
        options: [
          "Muddling fruit pulp creates an over-diluted fruit compote",
          "Rye whiskey is far too dry and must be replaced by vodka",
          "Bitters should never be used in an Old Fashioned",
          "It must be served boiling hot in a mug"
        ],
        hint: "Muddling fruit slices was popularized to mask the taste of poor-quality bootleg spirits.",
        diagnosis: "Modern craft standard avoids pulverizing fruit pulp into the drink. Expressing oils over the glass provides clean aroma without muddy fruit residue."
      },
      family: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "What indispensable accent bridges the whiskey and sweetener in this family?",
        correctAnswer: "Angostura Aromatic Bitters",
        options: ["Angostura Aromatic Bitters", "Heavy Cream", "Fresh Lime Juice", "Sparkling Water"],
        hint: "Bitters are defined as the seasoning that makes an Old Fashioned a genuine cocktail.",
        diagnosis: "Bitters tie together the fiery proof of the spirit and the rich body of the sucrose."
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
        flawIngredientDisplay: "Bottled Sweet and Sour Margarita Mix (FLAW)",
        correctIngredientName: "Fresh Lime Juice",
        prompt: "RECIPE AUDIT: Identify the chemical shortcut that compromises this spec:",
        correctAnswer: "Commercial neon sour mix replaces real freshly squeezed lime juice",
        options: [
          "Commercial neon sour mix replaces real freshly squeezed lime juice",
          "Tequila must be substituted with unaged rum",
          "Salt should never touch glassware rim under any circumstances",
          "Margaritas are traditionally stirred in a mixing glass"
        ],
        hint: "The acid must originate entirely from cold-pressed fresh citrus fruit.",
        diagnosis: "Bottled mixes introduce citric acid powders, artificial dyes, and preservatives that destroy agave aromatics."
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
        flawIngredientDisplay: "Violently Shaken until Frothy with Broken Ice Shards (FLAW)",
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
    ice: "Spear or Long Cubes",
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
        flawIngredientDisplay: "Vodka 2.0 oz (FLAW)",
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
    family: "Tiki / Daisy",
    era: "1944 • Trader Vic, Oakland",
    baseSpirit: "Aged Jamaican & Martinique Rums",
    glass: "Double Old Fashioned",
    ice: "Crushed Ice",
    method: "Short Shake & Dump onto Crushed Ice",
    garnish: "Fresh Mint Sprig & Spent Lime Half (Island & Palm Tree)",
    footnote: "Created to showcase 17-year-old J. Wray & Nephew rum; orgeat provides nutty almond sweetness.",
    spec: [
      { measure: "2.0 oz", name: "Blended Aged Rum", role: "Base Spirit" },
      { measure: "0.5 oz", name: "Orange Curaçao", role: "Citrus Liqueur" },
      { measure: "0.5 oz", name: "Orgeat Syrup", role: "Almond Emulsion" },
      { measure: "0.25 oz", name: "Rich Simple Syrup", role: "Sweet Balance" },
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
        targetIndex: 4,
        prompt: "What is the proper measure of fresh lime juice in a canonical 1944 Mai Tai?",
        correctAnswer: "0.75 oz",
        options: ["0.75 oz", "0.25 oz", "1.5 oz", "2.0 oz"],
        hint: "Balances the combined sweetness of curaçao, orgeat, and rock candy syrup.",
        diagnosis: "0.75 oz lime juice cuts through the rich nutty syrups and proof of the aged rum."
      }
    }
  },
  {
    id: "french-75",
    name: "French 75",
    family: "Highball / Sparkling Sour",
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
        flawIngredientDisplay: "Champagne Shaken in Shaker Tin (FLAW)",
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
    family: "Equal Parts / Sour",
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
    family: "Equal Parts / Sour",
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
    family: "Julep",
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
    footnote: "Historically concocted with Rose's lime cordial to prevent scurvy among British sailors.",
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
    family: "Buck / Highball",
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
    family: "Buck / Highball",
    era: "Post-WWI • Bermuda",
    baseSpirit: "Goslings Black Seal Rum",
    glass: "Highball",
    ice: "Cubed Ice",
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
    family: "Modern Classic",
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
      { measure: "0.75 oz", name: "Coffee Liqueur (Kahlúa / Mr Black)", role: "Sweet Modifier" },
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
    family: "Sour / Modern Classic",
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
    family: "Sour / Modern Classic",
    era: "2005 • Sam Ross, Milk & Honey, NYC",
    baseSpirit: "Blended Scotch Whisky",
    glass: "Rocks",
    ice: "Large Clear Ice Cube",
    method: "Shake Blended Scotch, Lemon, Honey-Ginger; Strain; Float Peated Scotch",
    garnish: "Candied Candied Ginger Slice",
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
    family: "Fizz",
    era: "1888 • Henry C. Ramos, New Orleans",
    baseSpirit: "Old Tom or London Dry Gin",
    glass: "Collins",
    ice: "None / Chilled Glass",
    method: "Dry Shake 5 mins, Wet Shake Hard, Strain, Rest in Glass, Upward Soda Push",
    garnish: "Orange Blossom Mist",
    footnote: "Ramos employed lines of 'shaker boys' to shake for 12 minutes; creates an impenetrable foam pillar that rises above the rim.",
    spec: [
      { measure: "2.0 oz", name: "Old Tom or London Dry Gin", role: "Base Spirit" },
      { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.75 oz", name: "Simple Syrup", role: "Sweet Modifier" },
      { measure: "1.0 oz", name: "Heavy Cream", role: "Dairy Emulsion" },
      { measure: "1 egg", name: "Egg White", role: "Protein Foam" },
      { measure: "3 drops", name: "Orange Flower Water", role: "Floral Accent" },
      { measure: "1.0 oz", name: "Club Soda", role: "Effervescent Lift" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 6,
        prompt: "Which botanical essence gives the Ramos Gin Fizz its signature floral scent?",
        correctAnswer: "Orange Flower Water",
        options: ["Orange Flower Water", "Rose Water", "Vanilla Extract", "Almond Extract"],
        hint: "A distilled citrus blossom hydrosol used sparingly in drops.",
        diagnosis: "Orange flower water imparts the ethereal floral aroma that cuts through heavy cream and egg white."
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
        targetIndex: 4,
        prompt: "Which dairy ingredient gives the Ramos its thick, decadent mouthfeel?",
        correctAnswer: "Heavy Cream",
        options: ["Heavy Cream", "Whole Milk", "Condensed Milk", "Almond Milk"],
        hint: "High-fat dairy that whips into a rich foam with citrus and egg albumen.",
        diagnosis: "Heavy cream provides the high butterfat content necessary to achieve a velvety soufflé foam."
      }
    }
  },
  {
    id: "paloma",
    name: "Paloma",
    family: "Highball",
    era: "1950s • Don Javier Delgado Corona, Tequila, Mexico",
    baseSpirit: "Blanco or Reposado Tequila",
    glass: "Collins",
    ice: "Highball Cubes",
    method: "Build Tequila, Lime & Pinch of Salt over Ice; Top with Grapefruit Soda",
    garnish: "Grapefruit Wedge & Salted Rim",
    footnote: "Mexico's most popular tequila highball; tart grapefruit soda cuts through vegetal agave.",
    spec: [
      { measure: "2.0 oz", name: "Blanco or Reposado Tequila", role: "Base Spirit" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "1 pinch", name: "Sea Salt", role: "Flavor Enhancer" },
      { measure: "4.0 oz", name: "Grapefruit Soda (Jarritos / Squirt)", role: "Citrus Lengthener" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "Which Mexican carbonated soda is canonical in an authentic Paloma?",
        correctAnswer: "Grapefruit Soda (Jarritos / Squirt)",
        options: ["Grapefruit Soda (Jarritos / Squirt)", "Cola", "Lemon-Lime Soda", "Tonic Water"],
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
    id: "zombie",
    name: "Zombie",
    family: "Tiki",
    era: "1934 • Donn Beach, Hollywood",
    baseSpirit: "Jamaican, Puerto Rican & Overproof Rums",
    glass: "Zombie",
    ice: "Crushed Ice",
    method: "Flash Blend with Crushed Ice 5 Seconds & Strain into Tall Chimney Glass",
    garnish: "Mint Sprig, Cinnamon Stick & Grapefruit Moon",
    footnote: "Donn Beach limited patrons to two per evening due to its potent multi-rum punch.",
    spec: [
      { measure: "1.5 oz", name: "Puerto Rican Gold Rum", role: "Light Aged Rum" },
      { measure: "1.5 oz", name: "Aged Jamaican Rum", role: "Funky Pot Still Rum" },
      { measure: "1.0 oz", name: "151-Proof Demerara Rum", role: "Overproof Float" },
      { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.5 oz", name: "Donn's Mix (Cinnamon Syrup + Grapefruit)", role: "Spiced Citrus Syrup" },
      { measure: "0.5 oz", name: "Falernum", role: "Clove & Lime Cordial" },
      { measure: "1 barspoon", name: "Grenadine", role: "Pomegranate Richness" },
      { measure: "1 dash", name: "Absinthe", role: "Herbal Accent" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 4,
        prompt: "What is the formulation of Donn Beach's secret 'Donn's Mix'?",
        correctAnswer: "2 parts Fresh Grapefruit Juice to 1 part Cinnamon Syrup",
        options: [
          "2 parts Fresh Grapefruit Juice to 1 part Cinnamon Syrup",
          "Equal parts Orange Juice and Honey",
          "Pineapple juice mixed with Tabasco",
          "Passionfruit puree and dark molasses"
        ],
        hint: "A balance of tart citrus and baker's spice.",
        diagnosis: "Donn's Mix balances tart grapefruit juice with warm cinnamon syrup."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "151-Proof Rum Replaced with Vodka (FLAW)",
        correctIngredientName: "151-Proof Overproof Demerara Rum",
        prompt: "RECIPE AUDIT: Identify the base flaw breaking this legendary Tiki spec:",
        correctAnswer: "Vodka lacks the intense molasses, smoke, and proof of overproof Demerara rum",
        options: [
          "Vodka lacks the intense molasses, smoke, and proof of overproof Demerara rum",
          "Zombie drinks must never contain rum",
          "All ice should be eliminated and served hot",
          "Absinthe must be swapped for blue curaçao"
        ],
        hint: "The Zombie is famous for utilizing overproof dark Guyana rum.",
        diagnosis: "Hamilton or Lemon Hart 151 overproof rum contributes the heavy caramel and punch the cocktail is famed for."
      },
      family: {
        type: "ingredient",
        targetIndex: 5,
        prompt: "Which spiced Caribbean liqueur contributes clove, ginger, and lime peel tones?",
        correctAnswer: "Falernum",
        options: ["Falernum", "Allspice Dram", "Cointreau", "Benedictine"],
        hint: "Bajan liqueur flavored with almonds, ginger, cloves, and lime.",
        diagnosis: "Falernum adds exotic spice and lime zest sweetness foundational to complex tiki architecture."
      }
    }
  },
  {
    id: "blood-and-sand",
    name: "Blood and Sand",
    family: "Equal Parts",
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
    family: "Old Fashioned / Manhattan",
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
      { measure: "1 dash", name: "Angostura Bitters", role: "Aromatic Bitters" },
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
        targetIndex: 5,
        prompt: "Which pair of bitters is split equally in the Vieux Carré?",
        correctAnswer: "Angostura and Peychaud's Bitters",
        options: [
          "Angostura and Peychaud's Bitters",
          "Orange and Celery Bitters",
          "Grapefruit and Mint Bitters",
          "Chocolate and Walnut Bitters"
        ],
        hint: "One aromatic Trinidad bitter, one bright New Orleans anise bitter.",
        diagnosis: "Splitting Angostura and Peychaud's provides both deep clove-cinnamon warmth and floral anise brightness."
      }
    }
  },
  {
    id: "brandy-crusta",
    name: "Brandy Crusta",
    family: "Crusta / Daisy",
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
      { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
      { measure: "1 barspoon", name: "Rich Simple Syrup", role: "Sweet Balance" },
      { measure: "2 dashes", name: "Angostura Bitters", role: "Aromatic Accent" }
    ],
    modes: {
      classic: {
        type: "garnish",
        targetIndex: -1,
        prompt: "What is the defining visual presentation of a classic Crusta?",
        correctAnswer: "An unbroken spiral lemon peel lining the glass interior with a wide sugar rim",
        options: [
          "An unbroken spiral lemon peel lining the glass interior with a wide sugar rim",
          "A skewer of olives and onions",
          "A flaming rosemary sprig",
          "A whole egg floating on the surface"
        ],
        hint: "A continuous cut peel that coats the inner rim with citrus oil.",
        diagnosis: "The Crusta is named for its continuous sugar-crusted rim and coiled whole lemon peel jacket."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 0,
        flawIngredientDisplay: "Vodka 2.0 oz (FLAW)",
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
        targetIndex: 2,
        prompt: "Which stone-fruit liqueur pairs with Cointreau in the classic Crusta modifier blend?",
        correctAnswer: "Maraschino Liqueur",
        options: ["Maraschino Liqueur", "Creme de Cassis", "Peach Schnapps", "Apricot Cordial"],
        hint: "Dry sour marasca cherry liqueur.",
        diagnosis: "Maraschino liqueur gives the Crusta its signature dry, floral cherry-stone undertone."
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
      { measure: "1 egg", name: "Egg White", role: "Textural Agent" }
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
    family: "Sling / Highball",
    era: "1915 • Ngiam Tong Boon, Raffles Hotel",
    baseSpirit: "London Dry Gin",
    glass: "Hurricane",
    ice: "Cubed Ice",
    method: "Shake Hard with Ice & Strain into Glass over Ice; Top with Soda Splash",
    garnish: "Pineapple Spear, Brandied Cherry & Mint Sprig",
    footnote: "Created so colonial women could discreetly drink alcohol masquerading as fruit punch at the Long Bar.",
    spec: [
      { measure: "1.5 oz", name: "London Dry Gin", role: "Base Spirit" },
      { measure: "0.5 oz", name: "Cherry Heering", role: "Cherry Modifier" },
      { measure: "0.25 oz", name: "Cointreau", role: "Citrus Modifier" },
      { measure: "0.25 oz", name: "Bénédictine", role: "Herbal Modifier" },
      { measure: "4.0 oz", name: "Fresh Pineapple Juice", role: "Fruit Lengthener" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "1 barspoon", name: "Grenadine", role: "Rich Red Hue" },
      { measure: "1 dash", name: "Angostura Bitters", role: "Aromatic Accent" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "Which French herbal liqueur gives the Singapore Sling its herbal undertone?",
        correctAnswer: "Bénédictine",
        options: ["Bénédictine", "Chartreuse", "Campari", "Anisette"],
        hint: "Complex herbal liqueur infused with honey, angelica, and myrrh.",
        diagnosis: "Bénédictine grounds the tropical fruit profile with rich herbal complexity."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 4,
        flawIngredientDisplay: "Industrial Canned Corn-Syrup Punch Mix (FLAW)",
        correctIngredientName: "Fresh Pineapple Juice Shaken to Froth",
        prompt: "RECIPE AUDIT: Identify the modifier shortcut ruining this Sling:",
        correctAnswer: "Artificial red punch mix completely destroys the pineapple foam and complex liqueurs",
        options: [
          "Artificial red punch mix completely destroys the pineapple foam and complex liqueurs",
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
        options: ["Cherry Heering", "Maraschino Liqueur", "Creme de Violette", "Aperol"],
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
    family: "Spritz / Aperitivo",
    era: "1950s • Veneto, Italy",
    baseSpirit: "Aperol",
    glass: "White Wine",
    ice: "Abundant Cubed Ice",
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
        correctIngredientName: "Built Gently in Chilled Wine Glass with Dense Ice",
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
    id: "caipirinha",
    name: "Caipirinha",
    family: "Muddled / Sour",
    era: "1918 • São Paulo, Brazil",
    baseSpirit: "Cachaça",
    glass: "Double Old Fashioned",
    ice: "Crushed Ice",
    method: "Muddle Whole Lime Chunks with Sugar, Add Cachaça & Ice, Shake/Dump",
    garnish: "Spent Lime Wedges in Glass",
    footnote: "Brazil's national cocktail; uses fresh sugarcane juice spirit and expresses essential oils from lime rind.",
    spec: [
      { measure: "2.0 oz", name: "Cachaça", role: "Sugarcane Spirit Base" },
      { measure: "1 whole", name: "Fresh Lime (Cut into 8 wedges)", role: "Acid & Bitter Citrus Oils" },
      { measure: "2 barspoons", name: "Granulated White Cane Sugar", role: "Abrasive Sweetener" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "What is Cachaça, the soul of Brazil's national cocktail?",
        correctAnswer: "Distillate made directly from fresh unrefined sugarcane juice",
        options: [
          "Distillate made directly from fresh unrefined sugarcane juice",
          "Molasses rum aged 12 years in bourbon barrels",
          "Corn whiskey distilled in pot stills",
          "Agave spirit roasted in underground pits"
        ],
        hint: "Distilled directly from raw fermented cane juice, giving it grassy, funky terroir.",
        diagnosis: "Cachaça is distilled from raw cane juice rather than molasses, imparting fresh grassy and vegetal tones."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Refined Liquid Corn Syrup (FLAW)",
        correctIngredientName: "Granulated Pure Cane Sugar",
        prompt: "RECIPE AUDIT: Identify the muddling failure:",
        correctAnswer: "Granulated sugar crystals are required to sand and express oils from the lime peel",
        options: [
          "Granulated sugar crystals are required to sand and express oils from the lime peel",
          "Cachaça must be replaced with vodka",
          "Limes must be peeled and boiled",
          "Drink must be served in a hot mug"
        ],
        hint: "Granular sugar acts as an abrasive against the lime skin during muddling.",
        diagnosis: "Abrasive sugar granules rupture the oil glands in lime skins, infusing the drink with fragrant citrus oil."
      },
      family: {
        type: "method",
        targetIndex: -1,
        prompt: "How are the limes incorporated into the glass?",
        correctAnswer: "Muddled flesh-side and skin-side down with sugar crystals",
        options: [
          "Muddled flesh-side and skin-side down with sugar crystals",
          "Juiced with an electric squeezer and skins discarded",
          "Boiled in a saucepan",
          "Dehydrated into powders"
        ],
        hint: "The entire fruit chunk remains in the glass for rustic service.",
        diagnosis: "Muddling lime chunks directly in the serving vessel captures both the tart juice and fragrant peel oils."
      }
    }
  },
  {
    id: "bellini",
    name: "Bellini",
    family: "Sparkling / Fruit",
    era: "1948 • Giuseppe Cipriani, Harry's Bar, Venice",
    baseSpirit: "Prosecco",
    glass: "Champagne Flute",
    ice: "None / Served Chilled",
    method: "Gently Fold White Peach Puree with Chilled Prosecco",
    garnish: "Peach Slice",
    footnote: "Named for the pink glow found in paintings by 15th-century Venetian artist Giovanni Bellini.",
    spec: [
      { measure: "2.0 oz", name: "White Peach Puree", role: "Fruit Puree Base" },
      { measure: "4.0 oz", name: "Dry Italian Prosecco", role: "Effervescent Wine" },
      { measure: "2 drops", name: "Raspberry Juice (Optional)", role: "Rosy Tint" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which specific fruit puree is canonical in Harry's Bar Bellini?",
        correctAnswer: "Fresh White Peach Puree",
        options: ["Fresh White Peach Puree", "Yellow Canned Peaches in Syrup", "Apple Juice Concentrate", "Mango Puree"],
        hint: "Delicate Italian white peaches, not heavy yellow peaches.",
        diagnosis: "White peaches provide delicate floral aromatics and a pale pink hue when pureed with skins intact."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Blended in Electric Blender with Crushed Ice (FLAW)",
        correctIngredientName: "Gently Folded with Cold Prosecco in Flute",
        prompt: "RECIPE AUDIT: Identify the texture flaw destroying this cocktail:",
        correctAnswer: "Electric blending turns the wine flat and produces a slushy mess",
        options: [
          "Electric blending turns the wine flat and produces a slushy mess",
          "Prosecco should be replaced with warm brandy",
          "Peach puree must be cooked into a dark jam",
          "Glass must be rimmed with coarse sea salt"
        ],
        hint: "The sparkling wine must be handled gently to retain tight carbonation.",
        diagnosis: "High-speed blending destroys delicate effervescence; gentle folding keeps the bubbles intact."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which Italian sparkling wine provides effervescence in a classic Bellini?",
        correctAnswer: "Dry Italian Prosecco",
        options: ["Dry Italian Prosecco", "Sweet Asti Spumante", "Red Lambrusco", "Champagne Brut Nature"],
        hint: "Veneto sparkling wine crafted via the Charmat method.",
        diagnosis: "Prosecco offers crisp green apple and pear notes that cradle sweet white peach puree."
      }
    }
  },
  {
    id: "grasshopper",
    name: "Grasshopper",
    family: "Dessert / Flip",
    era: "1918 • Tujague's, New Orleans",
    baseSpirit: "Crème de Menthe & Crème de Cacao",
    glass: "Coupe",
    ice: "None / Served Up",
    method: "Shake Hard with Ice until Frosted & Double Strain",
    garnish: "Fresh Mint Leaf or Grated Dark Chocolate",
    footnote: "A decadent equal-parts after-dinner classic resembling melted mint chocolate chip ice cream.",
    spec: [
      { measure: "1.0 oz", name: "Green Crème de Menthe", role: "Peppermint Cordial & Color" },
      { measure: "1.0 oz", name: "White Crème de Cacao", role: "Chocolate Cordial" },
      { measure: "1.0 oz", name: "Heavy Cream", role: "Dairy Body" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which green mint liqueur provides both peppermint punch and color?",
        correctAnswer: "Green Crème de Menthe",
        options: ["Green Crème de Menthe", "Absinthe", "Chartreuse", "Midori"],
        hint: "Vibrant emerald liqueur flavored with clean peppermint oils.",
        diagnosis: "Green crème de menthe imparts crisp cooling peppermint oils and the signature grass-green hue."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Skim Watery Milk (FLAW)",
        correctIngredientName: "Rich Heavy Cream",
        prompt: "RECIPE AUDIT: Identify the mouthfeel failure:",
        correctAnswer: "Skim milk yields a watery, thin texture that curdles and separates easily",
        options: [
          "Skim milk yields a watery, thin texture that curdles and separates easily",
          "Menthe must be replaced with Scotch whisky",
          "Cocktail must be served boiling hot in an iron mug",
          "Crème de cacao is strictly prohibited in New Orleans"
        ],
        hint: "The Grasshopper requires high butterfat to achieve its velvety dessert texture.",
        diagnosis: "Heavy cream provides the luxurious, velvety mouthfeel required to carry sweet cordials."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the canonical ratio between the mint, chocolate, and cream elements?",
        correctAnswer: "1 : 1 : 1 (Equal Parts)",
        options: ["1 : 1 : 1 (Equal Parts)", "3 : 1 : 0.5", "2 : 1 : 0.5", "4 : 1 : 1"],
        hint: "Strict tripartite symmetry.",
        diagnosis: "A 1:1:1 balance between mint liqueur, cacao liqueur, and heavy cream creates seamless dessert harmony."
      }
    }
  },
  {
    id: "irish-coffee",
    name: "Irish Coffee",
    family: "Hot / Coffee",
    era: "1943 • Joe Sheridan, Foynes, Ireland",
    baseSpirit: "Irish Whiskey",
    glass: "Irish Coffee",
    ice: "None / Served Piping Hot",
    method: "Stir Hot Coffee & Demerara; Add Whiskey; Float Lightly Whipped Cream",
    garnish: "Freshly Grated Nutmeg",
    footnote: "Drink the hot, sweetened whiskey-coffee through the cool, unsweetened layer of heavy cream.",
    spec: [
      { measure: "1.5 oz", name: "Irish Whiskey", role: "Base Spirit" },
      { measure: "4.0 oz", name: "Fresh Rich Hot Drip Coffee", role: "Hot Beverage Foundation" },
      { measure: "0.5 oz", name: "Demerara Sugar Syrup (2:1)", role: "Sweet Modifier" },
      { measure: "1.0 oz", name: "Heavy Cream (Lightly Hand-Whipped)", role: "Cold Cream Float" }
    ],
    modes: {
      classic: {
        type: "method",
        targetIndex: 3,
        prompt: "How must the cream be prepared and floated atop an Irish Coffee?",
        correctAnswer: "Lightly aerated to pourable viscosity, gently floated across a warm barspoon",
        options: [
          "Lightly aerated to pourable viscosity, gently floated across a warm barspoon",
          "Whipped into stiff peaks and blasted from an aerosol can",
          "Boiled in a copper pot with whiskey",
          "Stirred vigorously into the hot coffee until incorporated"
        ],
        hint: "The cream must stay afloat without sinking, yet remain liquid enough to drink through.",
        diagnosis: "Lightly whipped, pourable cream floats cleanly over hot coffee, creating the classic hot/cold sensory contrast."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 3,
        flawIngredientDisplay: "Cream Stirred Directly into Hot Coffee (FLAW)",
        correctIngredientName: "Cream Floated on Surface to Sip Through",
        prompt: "RECIPE AUDIT: Identify the service execution disaster:",
        correctAnswer: "Stirring cream ruins the thermal contrast of sipping hot coffee through cold cream",
        options: [
          "Stirring cream ruins the thermal contrast of sipping hot coffee through cold cream",
          "Irish whiskey must be substituted with mezcal",
          "Coffee must be served iced",
          "Demerara sugar is banned in Ireland"
        ],
        hint: "An authentic Irish Coffee is never served mixed like a café latte.",
        diagnosis: "The sensory magic relies on sipping piping hot, sweetened whiskey-coffee through a cool, unsweetened cream blanket."
      },
      family: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which whiskey category is essential for historic authenticity?",
        correctAnswer: "Triple-Distilled Irish Whiskey",
        options: ["Triple-Distilled Irish Whiskey", "Smoky Islay Scotch", "High-Proof Rye", "Bourbon"],
        hint: "Smooth, triple-distilled whiskey from Ireland.",
        diagnosis: "Irish whiskey offers light vanilla and grain smoothness that complements roasted coffee beans without harsh wood astringency."
      }
    }
  },
  {
    id: "paper-plane",
    name: "Paper Plane",
    family: "Equal Parts / Modern Classic",
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
    id: "hanky-panky",
    name: "Hanky Panky",
    family: "Martini / Sweet",
    era: "1903 • Ada Coleman, Savoy Hotel, London",
    baseSpirit: "London Dry Gin",
    glass: "Coupe",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Fine Strain",
    garnish: "Expressed Orange Peel",
    footnote: "Created by legendary bar tender Ada 'Coley' Coleman for actor Sir Charles Hawtrey.",
    spec: [
      { measure: "1.5 oz", name: "London Dry Gin", role: "Base Spirit" },
      { measure: "1.5 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
      { measure: "2 dashes", name: "Fernet-Branca", role: "Bitter Amaro Accent" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which intensely bitter, mentholated amaro defines the Hanky Panky?",
        correctAnswer: "Fernet-Branca",
        options: ["Fernet-Branca", "Campari", "Aperol", "Cointreau"],
        hint: "Milanese amaro packed with myrrh, saffron, chamomile, and mint.",
        diagnosis: "Two dashes of Fernet-Branca infuse the sweet gin-vermouth base with bitter menthol and earthy root spices."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "1.5 oz Fernet-Branca (FLAW)",
        correctIngredientName: "2 Dashes Fernet-Branca",
        prompt: "RECIPE AUDIT: Identify the over-measurement error on this ticket:",
        correctAnswer: "Pouring a full 1.5 oz of Fernet makes the drink overwhelmingly bitter and medicinal",
        options: [
          "Pouring a full 1.5 oz of Fernet makes the drink overwhelmingly bitter and medicinal",
          "Gin must never be combined with vermouth",
          "Hanky Pankys must be blended with crushed bananas",
          "Sweet vermouth must be replaced with vinegar"
        ],
        hint: "Fernet is a seasoning agent measured in dashes, not full ounces.",
        diagnosis: "Fernet-Branca possesses enormous flavor concentration; more than a couple of dashes will obliterate the gin botanicals."
      },
      family: {
        type: "measure",
        targetIndex: 0,
        prompt: "What is the ratio between London Dry Gin and Sweet Vermouth in Coley's recipe?",
        correctAnswer: "1 : 1 (Equal Parts 1.5 oz each)",
        options: ["1 : 1 (Equal Parts 1.5 oz each)", "5 : 1 Dry Martini Ratio", "3 : 1 Ratio", "4 : 1 Ratio"],
        hint: "Equal parts spirit to fortified wine.",
        diagnosis: "Equal measures of gin and sweet vermouth create a soft, round foundation for the assertive bitters."
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
    family: "Tiki / Bitter Sour",
    era: "1978 • Aviary Bar, Kuala Lumpur Hilton",
    baseSpirit: "Blackstrap or Dark Rum",
    glass: "Double Old Fashioned",
    ice: "Crushed or Cubed Ice",
    method: "Shake Hard with Ice to Emulsify Pineapple; Strain over Fresh Ice",
    garnish: "Pineapple Fronds & Orchid Flower",
    footnote: "A rare tropical cocktail pairing dark molasses rum with Italian red bitter amaro.",
    spec: [
      { measure: "1.5 oz", name: "Blackstrap or Dark Jamaican Rum", role: "Molasses Base Spirit" },
      { measure: "0.75 oz", name: "Campari", role: "Bitter Aperitif Modifier" },
      { measure: "1.5 oz", name: "Fresh Pineapple Juice", role: "Foaming Tropical Element" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.5 oz", name: "Demerara Syrup (2:1)", role: "Sweet Modifier" }
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
  },
  {
    id: "black-russian",
    name: "Black Russian",
    family: "Duo",
    era: "1949 • Gustave Tops, Hotel Metropole, Brussels",
    baseSpirit: "Vodka",
    glass: "Rocks",
    ice: "Cubed Ice",
    method: "Build over Ice in Rocks Glass & Stir Gently",
    garnish: "None or Brandied Cherry",
    footnote: "Created in honor of the American ambassador to Luxembourg during the Cold War.",
    spec: [
      { measure: "2.0 oz", name: "Vodka", role: "Base Spirit" },
      { measure: "1.0 oz", name: "Coffee Liqueur (Kahlúa)", role: "Sweet Coffee Modifier" }
    ],
    modes: {
      classic: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the classic proportion of coffee liqueur to 2.0 oz vodka in a Black Russian?",
        correctAnswer: "1.0 oz",
        options: ["1.0 oz", "0.25 oz", "2.0 oz", "0.5 oz"],
        hint: "Standard 2:1 spirit-to-liqueur duo formula.",
        diagnosis: "A 2:1 ratio provides enough sweetness to carry the neutral vodka without becoming overly sticky."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Topped with Heavy Cream (FLAW)",
        correctIngredientName: "Served Neat/Clean without Any Dairy (Black Russian)",
        prompt: "RECIPE AUDIT: Identify the family identity violation:",
        correctAnswer: "Adding cream turns a Black Russian into a White Russian",
        options: [
          "Adding cream turns a Black Russian into a White Russian",
          "Vodka should be swapped for smoky mezcal",
          "Coffee liqueur is illegal in Belgium",
          "Black Russians must be served piping hot in an insulated thermos"
        ],
        hint: "A Black Russian is strictly a two-ingredient duo cocktail devoid of dairy.",
        diagnosis: "Dairy cream defines the White Russian; a true Black Russian remains clear, dark, and dairy-free."
      },
      family: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which base spirit gives the drink its Cold War thematic moniker?",
        correctAnswer: "Vodka",
        options: ["Vodka", "Bourbon", "Gin", "White Rum"],
        hint: "Neutral grain spirit associated historically with Eastern Europe.",
        diagnosis: "Vodka is the defining spirit of the Russian-themed cocktail series from the mid-20th century."
      }
    }
  },
  {
    id: "white-russian",
    name: "White Russian",
    family: "Trio / Cream",
    era: "1960s • American Classic",
    baseSpirit: "Vodka",
    glass: "Rocks",
    ice: "Cubed Ice",
    method: "Build Vodka and Coffee Liqueur over Ice; Float Heavy Cream on Top",
    garnish: "None",
    footnote: "Immortalized in pop culture by The Big Lebowski; floating the cream creates an ombre layered effect.",
    spec: [
      { measure: "2.0 oz", name: "Vodka", role: "Base Spirit" },
      { measure: "1.0 oz", name: "Coffee Liqueur", role: "Sweet Coffee Modifier" },
      { measure: "1.0 oz", name: "Heavy Cream", role: "Dairy Float" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which dairy component yields the rich layered float in a classic White Russian?",
        correctAnswer: "Heavy Cream",
        options: ["Heavy Cream", "Non-fat Skim Milk", "Sour Cream", "Sweetened Condensed Milk"],
        hint: "High-fat dairy that rests on top of dense coffee liqueur.",
        diagnosis: "Heavy cream has the butterfat density to float atop the spirits and slowly cascade downward."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Warm Skim Milk Stirred Vigorously (FLAW)",
        correctIngredientName: "Cold Heavy Cream Floated Gently Across Barspoon",
        prompt: "RECIPE AUDIT: Identify the presentation and mouthfeel error:",
        correctAnswer: "Warm skim milk creates a watery, muddy brown mix lacking rich mouthfeel",
        options: [
          "Warm skim milk creates a watery, muddy brown mix lacking rich mouthfeel",
          "Vodka must be swapped for Irish cream",
          "Glass must be encrusted with coarse celery salt",
          "Drink must be served in a highball with tonic water"
        ],
        hint: "Skim milk does not have the viscosity to float and dilutes the coffee profile.",
        diagnosis: "Skim milk lacks the butterfat needed for rich texture and immediately turns the drink a dull brown."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which liqueur supplies the roasted coffee profile and sweetness?",
        correctAnswer: "Coffee Liqueur",
        options: ["Coffee Liqueur", "Triple Sec", "Amaretto", "Blue Curaçao"],
        hint: "Rich coffee and vanilla bean liqueur.",
        diagnosis: "Coffee liqueur provides the rich sweetness and coffee base essential to the drink."
      }
    }
  },
  {
    id: "pina-colada",
    name: "Piña Colada",
    family: "Tiki / Blended",
    era: "1954 • Ramón 'Monchito' Marrero, Caribe Hilton, Puerto Rico",
    baseSpirit: "White Rum",
    glass: "Poco Grande",
    ice: "Crushed Ice",
    method: "Flash Blend with Crushed Ice 15 Seconds & Pour into Chilled Glass",
    garnish: "Pineapple Wedge & Maraschino Cherry",
    footnote: "Puerto Rico's official national beverage; coconut cream and pineapple juice whip into a frosty tropical treat.",
    spec: [
      { measure: "2.0 oz", name: "White Rum", role: "Base Spirit" },
      { measure: "1.5 oz", name: "Cream of Coconut (Coco López)", role: "Sweet Coconut Modifier" },
      { measure: "2.0 oz", name: "Fresh Pineapple Juice", role: "Fruit Element" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Balance" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which sweetened coconut product was invented specifically for the Piña Colada?",
        correctAnswer: "Cream of Coconut (Coco López)",
        options: ["Cream of Coconut (Coco López)", "Unsweetened Coconut Water", "Coconut Milk in a Can", "Desiccated Coconut Powder"],
        hint: "A thick, heavily sweetened emulsified coconut paste.",
        diagnosis: "Cream of coconut provides the high sugar and fat content necessary to blend into a stable frosty texture."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 3,
        flawIngredientDisplay: "Fresh Lime Juice Omitted Completely (FLAW)",
        correctIngredientName: "Fresh Lime Juice Added for Balance",
        prompt: "RECIPE AUDIT: Identify the balancing oversight in this build:",
        correctAnswer: "Omitting lime juice leaves the drink cloying, flat, and overly sweet",
        options: [
          "Omitting lime juice leaves the drink cloying, flat, and overly sweet",
          "White rum must be replaced with London dry gin",
          "Piña Coladas should never contain fruit juice",
          "Drink must be served boiling hot in an iron skillet"
        ],
        hint: "A half-ounce of tart lime juice cuts through the rich cream of coconut.",
        diagnosis: "A touch of lime juice cuts through the sugar and fat of Coco López, brightening the pineapple notes."
      },
      family: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which spirit style forms the traditional base of the Puerto Rican Piña Colada?",
        correctAnswer: "Light Puerto Rican White Rum",
        options: ["Light Puerto Rican White Rum", "Smoky Islay Scotch", "London Dry Gin", "Bourbon Whiskey"],
        hint: "Clean, light sugarcane rum from Puerto Rico.",
        diagnosis: "Light Puerto Rican rum allows coconut and pineapple flavors to shine without heavy oak dominance."
      }
    }
  },
  {
    id: "gin-fizz",
    name: "Gin Fizz",
    family: "Fizz",
    era: "1870s • Jerry Thomas Classic",
    baseSpirit: "London Dry Gin",
    glass: "Highball",
    ice: "None / Served Cold & Pristine",
    method: "Shake Gin, Citrus & Syrup Violently; Strain into Chilled Glass; Top with Soda",
    garnish: "Lemon Twist (Optional)",
    footnote: "Unlike a Collins, a true Gin Fizz is traditionally served without ice in the glass to maintain tight carbonation.",
    spec: [
      { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
      { measure: "1.0 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
      { measure: "0.75 oz", name: "Simple Syrup", role: "Sweet Modifier" },
      { measure: "2.5 oz", name: "Chilled Club Soda", role: "Effervescent Lift" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "Which ingredient provides the carbonated lift defining the Fizz family?",
        correctAnswer: "Chilled Club Soda",
        options: ["Chilled Club Soda", "Champagne", "Ginger Ale", "Tonic Water"],
        hint: "Highly carbonated unflavored water.",
        diagnosis: "Club soda provides pure effervescence without adding sugars that would disrupt the sour ratio."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Built with Melting Warm Tap Ice in Warm Pint Glass (FLAW)",
        correctIngredientName: "Strained into Pre-Chilled Glass with Cold Chilled Soda (No Ice)",
        prompt: "RECIPE AUDIT: Identify the temperature and carbonation failure:",
        correctAnswer: "Warm ice melts instantly, flattening the fizz into watery citrus water",
        options: [
          "Warm ice melts instantly, flattening the fizz into watery citrus water",
          "Gin must be boiled before shaking",
          "Lemon juice should be substituted with orange juice",
          "Syrup is strictly forbidden in fizzes"
        ],
        hint: "A fizz requires maximum chill to preserve effervescence.",
        diagnosis: "Chilled stemware and cold club soda preserve carbonation; warm ice rapidly dilutes and flattens the drink."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "Specify the lemon juice pour in a crisp 2:1:0.75 Gin Fizz:",
        correctAnswer: "1.0 oz",
        options: ["1.0 oz", "0.25 oz", "2.0 oz", "0.5 oz"],
        hint: "Slightly more tart than a standard sour to cut through club soda.",
        diagnosis: "1.0 oz lemon juice ensures crisp, refreshing acidity remains vibrant after adding club soda."
      }
    }
  },
  {
    id: "southside",
    name: "Southside",
    family: "Sour / Julep Hybrid",
    era: "1910s • Southside Sportsman's Club, Long Island",
    baseSpirit: "London Dry Gin",
    glass: "Coupe",
    ice: "None / Served Up",
    method: "Shake Gin, Lime, Syrup & Mint Leaves Hard with Ice; Fine Strain",
    garnish: "Single Mint Leaf Floated Flat on Foam",
    footnote: "The gin counterpart to the Mojito or Daiquiri; fine straining catches small mint fragments for a clean sip.",
    spec: [
      { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.75 oz", name: "Simple Syrup", role: "Sweet Modifier" },
      { measure: "6-8 leaves", name: "Fresh Spearmint", role: "Herbaceous Element" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "Which fresh garden herb defines the crisp aroma of the Southside?",
        correctAnswer: "Fresh Spearmint",
        options: ["Fresh Spearmint", "Rosemary", "Basil", "Thyme"],
        hint: "Refreshing green garden mint.",
        diagnosis: "Spearmint adds cooling menthol aromatics that highlight gin's pine and juniper notes."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Mint Pulverized into Shreds and Left Floating Without Fine Straining (FLAW)",
        correctIngredientName: "Shaken Whole and Double Strained Through Fine Mesh",
        prompt: "RECIPE AUDIT: Identify the texture and presentation flaw:",
        correctAnswer: "Unstrained mint shreds stick to the drinker's teeth and turn bitter quickly",
        options: [
          "Unstrained mint shreds stick to the drinker's teeth and turn bitter quickly",
          "Gin must be replaced with bourbon",
          "Southsides must be served steaming hot",
          "Lime juice must be fermented for six months"
        ],
        hint: "Fine straining removes pulverized plant matter from the finished coupe.",
        diagnosis: "Double straining with a fine-mesh strainer removes torn mint flakes, ensuring an elegant, smooth drink."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the standard citrus measurement in a balanced Southside?",
        correctAnswer: "0.75 oz",
        options: ["0.75 oz", "0.25 oz", "1.5 oz", "2.0 oz"],
        hint: "Follows classic 2:0.75:0.75 craft sour balance.",
        diagnosis: "0.75 oz fresh lime juice provides crisp acid to cut through sweet syrup and herbal mint."
      }
    }
  },
  {
    id: "martinez",
    name: "Martinez",
    family: "Martini / Ancestral",
    era: "1880s • O.H. Byron / Jerry Thomas Classic",
    baseSpirit: "Old Tom Gin",
    glass: "Nick & Nora",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Strain",
    garnish: "Orange Twist & Brandied Cherry",
    footnote: "The direct ancestor of the Dry Martini; features sweet Old Tom gin, sweet vermouth, and maraschino liqueur.",
    spec: [
      { measure: "1.5 oz", name: "Old Tom Gin", role: "Botanical Sweet Base" },
      { measure: "1.5 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
      { measure: "1 barspoon", name: "Maraschino Liqueur", role: "Stone-Fruit Modifier" },
      { measure: "2 dashes", name: "Boker's or Angostura Bitters", role: "Aromatic Accent" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which historic gin style is canonical for an authentic 19th-century Martinez?",
        correctAnswer: "Old Tom Gin",
        options: ["Old Tom Gin", "London Dry Gin", "Navy Strength Gin", "Sloe Gin"],
        hint: "A lightly sweetened, maltier gin style popular in Victorian England.",
        diagnosis: "Old Tom gin offers richer body and subtle sweetness that bridges with sweet vermouth and maraschino."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Dry French White Vermouth 1.5 oz (FLAW)",
        correctIngredientName: "Sweet Red Vermouth (Torino) 1.5 oz",
        prompt: "RECIPE AUDIT: Identify the historic specification error:",
        correctAnswer: "The historic Martinez requires rich sweet red vermouth, not dry vermouth",
        options: [
          "The historic Martinez requires rich sweet red vermouth, not dry vermouth",
          "Maraschino liqueur must be swapped for orange juice",
          "Martinez cocktails must be blended with crushed ice",
          "Bitters should be replaced with hot mustard"
        ],
        hint: "19th-century recipes call for Italian (sweet red) vermouth.",
        diagnosis: "Sweet vermouth gives the Martinez its amber hue and rounds out the botanicals of Old Tom gin."
      },
      family: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which cherry cordial accents the Martinez formula?",
        correctAnswer: "Maraschino Liqueur",
        options: ["Maraschino Liqueur", "Cherry Heering", "Grenadine", "Amaretto"],
        hint: "Bone-dry sour marasca cherry liqueur with floral, nutty complexity.",
        diagnosis: "A barspoon of maraschino provides delicate cherry-pit bitterness that ties together gin and sweet vermouth."
      }
    }
  },
  {
    id: "hemingway-daiquiri",
    name: "Hemingway Daiquiri",
    family: "Sour",
    era: "1930s • Constantino Ribalaigua Vert, El Floridita, Havana",
    baseSpirit: "White Rum",
    glass: "Coupe",
    ice: "None / Served Up",
    method: "Shake Hard with Ice & Double Strain",
    garnish: "Lime Wheel & Floating Maraschino Cherry",
    footnote: "Created for Ernest Hemingway; swaps out sugar for grapefruit and maraschino liqueur.",
    spec: [
      { measure: "2.0 oz", name: "White Rum", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.5 oz", name: "Fresh Grapefruit Juice", role: "Citrus Modifier" },
      { measure: "0.5 oz", name: "Maraschino Liqueur", role: "Stone-Fruit Sweetener" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which citrus juice pairs with lime in the Hemingway special formula?",
        correctAnswer: "Fresh Grapefruit Juice",
        options: ["Fresh Grapefruit Juice", "Orange Juice", "Pineapple Juice", "Lemon Juice"],
        hint: "Tart, slightly bitter pink or white citrus juice.",
        diagnosis: "Grapefruit juice provides bittersweet complexity that balances rum without relying on refined sugar."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 3,
        flawIngredientDisplay: "1.0 oz Refined Simple Syrup (FLAW)",
        correctIngredientName: "Maraschino Liqueur 0.5 oz (No Added Cane Syrup)",
        prompt: "RECIPE AUDIT: Identify the deviation from Hemingway's preferred dry profile:",
        correctAnswer: "Simple syrup ruins the austere, bone-dry profile created for Hemingway",
        options: [
          "Simple syrup ruins the austere, bone-dry profile created for Hemingway",
          "White rum should be replaced with peated scotch",
          "Cocktail must be served in a ceramic tiki mug",
          "Lime juice must be boiled before shaking"
        ],
        hint: "Hemingway was diabetic and preferred his drinks dry, sweetened only by a touch of maraschino liqueur.",
        diagnosis: "Maraschino liqueur provides the sole sweetening agent; adding simple syrup ruins the dry balance."
      },
      family: {
        type: "measure",
        targetIndex: 0,
        prompt: "What is the primary white rum base measurement?",
        correctAnswer: "2.0 oz",
        options: ["2.0 oz", "0.5 oz", "3.5 oz", "1.0 oz"],
        hint: "A solid 2.0 oz foundation to carry tart citrus and maraschino.",
        diagnosis: "2.0 oz white rum provides the proof to balance two citrus juices and dry maraschino."
      }
    }
  },
  {
    id: "hot-toddy",
    name: "Hot Toddy",
    family: "Hot / Ancestral",
    era: "18th Century • Scottish / British Classic",
    baseSpirit: "Scotch Whisky or Bourbon",
    glass: "Toddy Mug",
    ice: "None / Served Piping Hot",
    method: "Build Spirits, Honey & Lemon in Warm Mug; Top with Boiling Water; Stir",
    garnish: "Lemon Wheel Studded with Whole Cloves & Cinnamon Stick",
    footnote: "Traditional winter remedy; hot water opens spirit aromatics while steam delivers honey and citrus relief.",
    spec: [
      { measure: "2.0 oz", name: "Scotch Whisky or Bourbon", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Honey Syrup or Raw Honey", role: "Soothing Sweetener" },
      { measure: "0.5 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
      { measure: "4.0 oz", name: "Boiling Hot Water", role: "Thermal Lengthener" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "What constitutes the hot thermal base of a traditional Toddy?",
        correctAnswer: "Boiling Hot Water",
        options: ["Boiling Hot Water", "Warm Whole Milk", "Hot Apple Cider", "Black Coffee"],
        hint: "Pure hot water that opens spirit aromatics without masking spirit character.",
        diagnosis: "Boiling water dilutes and warms the spirit, unlocking bouquet aromatics and soothing the throat."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Chilled with Crushed Ice in a Rocks Glass (FLAW)",
        correctIngredientName: "Built with Boiling Water in a Pre-Heated Mug",
        prompt: "RECIPE AUDIT: Identify the catastrophic temperature failure:",
        correctAnswer: "A Hot Toddy must be served piping hot in a thick mug, never iced",
        options: [
          "A Hot Toddy must be served piping hot in a thick mug, never iced",
          "Whiskey must be replaced with vodka",
          "Lemon juice should be substituted with vinegar",
          "Honey is illegal in hot drinks"
        ],
        hint: "The name literally contains the word 'Hot'.",
        diagnosis: "The drink's medicinal and comforting qualities depend entirely on being served steaming hot."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which sweetener is traditionally favored for its throat-soothing qualities?",
        correctAnswer: "Raw Honey / Honey Syrup",
        options: ["Raw Honey / Honey Syrup", "Corn Syrup", "Grenadine", "Maple Syrup"],
        hint: "Natural nectar collected by bees, renowned for soothing coats.",
        diagnosis: "Honey coats the throat and provides rich floral sweetness that complements warm whiskey."
      }
    }
  },
  {
    id: "champagne-cocktail",
    name: "Champagne Cocktail",
    family: "Sparkling / Ancestral",
    era: "1860s • Jerry Thomas Classic",
    baseSpirit: "Brut Champagne",
    glass: "Champagne Flute",
    ice: "None / Served Chilled",
    method: "Drop Bitters-Soaked Sugar Cube into Flute, Add Cognac, Top Slowly with Champagne",
    garnish: "Lemon Twist",
    footnote: "The sugar cube dissolves slowly in the flute bottom, generating a continuous fountain of micro-bubbles.",
    spec: [
      { measure: "4.0 oz", name: "Brut Champagne", role: "Sparkling Wine Base" },
      { measure: "0.33 oz", name: "Cognac (Optional Accent)", role: "Fortified Spirit Accent" },
      { measure: "1 whole", name: "White Sugar Cube", role: "Nucleation Site & Sweetener" },
      { measure: "2 dashes", name: "Angostura Bitters", role: "Aromatic Bitter Seasoning" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "What functional role does the sugar cube play in the flute bottom?",
        correctAnswer: "Provides nucleation points for continuous effervescent bubble release",
        options: [
          "Provides nucleation points for continuous effervescent bubble release",
          "Keeps the glass cold without ice",
          "Absorbs excess alcohol proof",
          "Turns the wine into a thick gel"
        ],
        hint: "The rough granular surface constantly releases carbon dioxide gas.",
        diagnosis: "The rough surface of the sugar cube creates nucleation sites that produce a rising fountain of bubbles."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "1.0 oz Liquid Corn Syrup Poured in Flute (FLAW)",
        correctIngredientName: "Angostura-Soaked Solid Sugar Cube",
        prompt: "RECIPE AUDIT: Identify the structural flaw in this build:",
        correctAnswer: "Liquid syrup dissolves instantly and creates zero visual effervescent fountain effect",
        options: [
          "Liquid syrup dissolves instantly and creates zero visual effervescent fountain effect",
          "Champagne must be boiled first",
          "Bitters should never touch sparkling wine",
          "Drink must be served in an earthenware bowl"
        ],
        hint: "A solid sugar cube is mandatory for the effervescent theater of the cocktail.",
        diagnosis: "A solid sugar cube is essential to anchor the bottom of the flute and release bubbles over time."
      },
      family: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "Which bitters are saturated directly into the sugar cube?",
        correctAnswer: "Angostura Aromatic Bitters",
        options: ["Angostura Aromatic Bitters", "Celery Bitters", "Orange Bitters", "Mint Bitters"],
        hint: "Aromatic gentian bitters with notes of clove and cinnamon.",
        diagnosis: "Angostura bitters soak into the sugar cube, slowly flavoring each sip of dry champagne."
      }
    }
  },
  {
    id: "amaretto-sour",
    name: "Amaretto Sour",
    family: "Sour / Modern Classic",
    era: "1970s / Jeffrey Morgenthaler Spec (2012)",
    baseSpirit: "Amaretto & Cask-Proof Bourbon",
    glass: "Rocks",
    ice: "Large Clear Ice Cube",
    method: "Dry Shake, Wet Shake Hard & Fine Strain",
    garnish: "Lemon Twist & Brandied Cherry",
    footnote: "Morgenthaler solved the 'sickly sweet' 1970s problem by adding cask-proof bourbon to support the almond liqueur.",
    spec: [
      { measure: "1.5 oz", name: "Amaretto Liqueur", role: "Sweet Almond Base" },
      { measure: "0.75 oz", name: "Cask-Proof Bourbon (100+ proof)", role: "Proof & Tannin Backbone" },
      { measure: "1.0 oz", name: "Fresh Lemon Juice", role: "Sour Element" },
      { measure: "1 barspoon", name: "Rich Simple Syrup", role: "Sweet Balance" },
      { measure: "0.5 oz", name: "Egg White", role: "Textural Foaming Agent" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Why did Jeffrey Morgenthaler introduce cask-proof bourbon into the classic Amaretto Sour?",
        correctAnswer: "To provide high proof and dry barrel tannins that cut through sweet liqueur",
        options: [
          "To provide high proof and dry barrel tannins that cut through sweet liqueur",
          "Because amaretto was outlawed in bars",
          "To turn the cocktail crystal clear",
          "To eliminate the need for lemon juice"
        ],
        hint: "Amaretto alone lacks sufficient ABV and wood dryness to balance its sugar.",
        diagnosis: "High-proof bourbon supplies alcohol structure and oak tannins that anchor amaretto's sweetness."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Bottled Sweet and Sour Powder Mix (FLAW)",
        correctIngredientName: "Fresh Lemon Juice & Rich Simple Syrup",
        prompt: "RECIPE AUDIT: Identify the 1970s disco-era flaw:",
        correctAnswer: "Bottled sour mix creates an artificial, syrupy mess that ruins amaretto aromatics",
        options: [
          "Bottled sour mix creates an artificial, syrupy mess that ruins amaretto aromatics",
          "Amaretto should never be mixed with citrus",
          "Egg white must be scrambled over high heat",
          "Bourbon should be replaced with grain alcohol"
        ],
        hint: "Real citrus juice is required to cut through almond liqueur.",
        diagnosis: "Bottled sour mix adds artificial chemicals; freshly squeezed lemon juice is required for clean balance."
      },
      family: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which Italian liqueur gives the cocktail its sweet almond and apricot kernel character?",
        correctAnswer: "Amaretto Liqueur",
        options: ["Amaretto Liqueur", "Sambuca", "Campari", "Frangelico"],
        hint: "Sweet amber liqueur made from apricot stones or almonds.",
        diagnosis: "Amaretto delivers sweet marzipan, almond, and stone-fruit notes."
      }
    }
  },
  {
    id: "tipperary",
    name: "Tipperary",
    family: "Manhattan / Irish",
    era: "1916 • Hugo Ensslin / Savoy Cocktail Book",
    baseSpirit: "Irish Whiskey",
    glass: "Nick & Nora",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Fine Strain",
    garnish: "Expressed Orange Peel",
    footnote: "'It's a long way to Tipperary, but worth the journey.' Irish whiskey enriched with herbal Chartreuse.",
    spec: [
      { measure: "1.5 oz", name: "Irish Whiskey", role: "Base Spirit" },
      { measure: "1.0 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
      { measure: "0.5 oz", name: "Green Chartreuse", role: "Herbal Modifier" },
      { measure: "2 dashes", name: "Angostura Bitters", role: "Aromatic Bitters" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which French alpine herbal liqueur elevates the Tipperary into greatness?",
        correctAnswer: "Green Chartreuse",
        options: ["Green Chartreuse", "Yellow Chartreuse", "Sambuca", "Crème de Menthe"],
        hint: "Potent 110-proof monastic herbal liqueur.",
        diagnosis: "Green Chartreuse provides herbal punch and proof that elevates smooth Irish whiskey."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Violently Shaken with Crushed Ice (FLAW)",
        correctIngredientName: "Stirred to Silky Clarity with Dense Ice",
        prompt: "RECIPE AUDIT: Identify the technique violation:",
        correctAnswer: "Shaking spirits and fortified vermouth creates cloudy aeration and unwanted ice shards",
        options: [
          "Shaking spirits and fortified vermouth creates cloudy aeration and unwanted ice shards",
          "Irish whiskey must never touch sweet vermouth",
          "Green Chartreuse must be boiled before pouring",
          "Drink must be served in an open beer mug"
        ],
        hint: "Spirit-forward drinks without citrus should always be stirred.",
        diagnosis: "Stirring protects velvety clarity and preserves the drink's rich ruby appearance."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which fortified wine balances the spirit and herbal liqueur?",
        correctAnswer: "Sweet Red Vermouth",
        options: ["Sweet Red Vermouth", "Dry French Vermouth", "White Port", "Fino Sherry"],
        hint: "Italian sweet vermouth bringing botanical sweetness.",
        diagnosis: "Sweet vermouth bridges smooth Irish whiskey with the intense botanicals of Green Chartreuse."
      }
    }
  },
  {
    id: "monkey-gland",
    name: "Monkey Gland",
    family: "Sour / Ancestral",
    era: "1920s • Harry MacElhone, Harry's New York Bar, Paris",
    baseSpirit: "London Dry Gin",
    glass: "Coupe",
    ice: "None / Served Up",
    method: "Shake Hard with Ice & Fine Strain into Absinthe-Rinsed Glass",
    garnish: "Expressed Orange Peel",
    footnote: "Named after Dr. Voronoff's eccentric 1920s rejuvenation surgeries; absinthe rinse cuts orange sweetness.",
    spec: [
      { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
      { measure: "1.0 oz", name: "Fresh Orange Juice", role: "Citrus Element" },
      { measure: "1 barspoon", name: "Real Grenadine", role: "Pomegranate Sweetener" },
      { measure: "1 rinse", name: "Absinthe", role: "Aromatic Glass Rinse" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 3,
        prompt: "Which aromatic rinse gives the Monkey Gland its complex herbal finish?",
        correctAnswer: "Absinthe",
        options: ["Absinthe", "Chartreuse", "Campari", "Scotch"],
        hint: "Anise and wormwood spirit used to coat the glass.",
        diagnosis: "An absinthe rinse provides an anise frame that cuts through sweet orange juice."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Artificial Red Dye High-Fructose Cherry Syrup (FLAW)",
        correctIngredientName: "Authentic Pomegranate Grenadine",
        prompt: "RECIPE AUDIT: Identify the syrup shortcut ruining this classic:",
        correctAnswer: "Artificial cherry syrup lacks the tart tannic acidity of real pomegranate grenadine",
        options: [
          "Artificial cherry syrup lacks the tart tannic acidity of real pomegranate grenadine",
          "Gin must be replaced with vodka",
          "Orange juice must be heated to boiling",
          "Absinthe must be omitted under French law"
        ],
        hint: "Authentic grenadine is made exclusively from tart pomegranate fruit juice.",
        diagnosis: "Real grenadine provides pomegranate acidity and tannins; artificial neon cherry syrup ruins balance."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "Specify the fresh orange juice pour in a balanced Monkey Gland:",
        correctAnswer: "1.0 oz",
        options: ["1.0 oz", "3.0 oz", "0.25 oz", "4.0 oz"],
        hint: "Keeps citrus from drowning the 2.0 oz gin base.",
        diagnosis: "1.0 oz fresh orange juice provides fruit flavor without making the drink taste like morning juice."
      }
    }
  },
  {
    id: "corpse-reviver-no-1",
    name: "Corpse Reviver No. 1",
    family: "Ancestral / Manhattan Riff",
    era: "1930 • Savoy Cocktail Book",
    baseSpirit: "Cognac & Calvados",
    glass: "Nick & Nora",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Strain",
    garnish: "Lemon Twist",
    footnote: "'To be taken before 11 a.m., or whenever steam and energy are needed.' An all-fruit-distillate classic.",
    spec: [
      { measure: "1.0 oz", name: "Cognac", role: "Grape Brandy Base" },
      { measure: "1.0 oz", name: "Calvados / Apple Brandy", role: "Apple Brandy Base" },
      { measure: "0.5 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which French apple brandy splits the base with Cognac in No. 1?",
        correctAnswer: "Calvados / Apple Brandy",
        options: ["Calvados / Apple Brandy", "London Dry Gin", "White Rum", "Tequila Blanco"],
        hint: "Norman oak-aged apple and pear distillate.",
        diagnosis: "Calvados introduces rich baked apple and spice notes that meld with grape-based Cognac."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Shaken with Lemon Juice and Cointreau (FLAW)",
        correctIngredientName: "Stirred Spirit-Forward with Sweet Vermouth (No. 1 Spec)",
        prompt: "RECIPE AUDIT: Identify the identity confusion on this ticket:",
        correctAnswer: "Bartender confused Corpse Reviver No. 1 with Corpse Reviver No. 2",
        options: [
          "Bartender confused Corpse Reviver No. 1 with Corpse Reviver No. 2",
          "Calvados is strictly forbidden in hotel bars",
          "Cognac must be replaced with neutral grain alcohol",
          "Drink must be served in a copper beer stein"
        ],
        hint: "No. 1 is stirred with brandy and vermouth; No. 2 is shaken with gin, citrus, and absinthe.",
        diagnosis: "Corpse Reviver No. 1 is a stirred brandy Manhattan variant; No. 2 is an equal-parts gin-citrus sour."
      },
      family: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which fortified wine completes the Corpse Reviver No. 1 trinity?",
        correctAnswer: "Sweet Red Vermouth",
        options: ["Sweet Red Vermouth", "Dry Vermouth", "Fino Sherry", "White Port"],
        hint: "Italian sweet vermouth providing botanical sweetness.",
        diagnosis: "Sweet vermouth rounds out the oak tannins of the two brandies."
      }
    }
  },
  {
    id: "americano",
    name: "Americano",
    family: "Highball / Aperitivo",
    era: "1860s • Gaspare Campari, Milan",
    baseSpirit: "Campari & Sweet Vermouth",
    glass: "Highball",
    ice: "Dense Cubed Ice",
    method: "Build over Ice in Glass, Top with Soda & Gently Lift with Barspoon",
    garnish: "Half Orange Slice & Lemon Wheel",
    footnote: "Originally named 'Milano-Torino'; renamed Americano due to its popularity among American tourists during Prohibition.",
    spec: [
      { measure: "1.5 oz", name: "Campari", role: "Bitter Aperitif" },
      { measure: "1.5 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
      { measure: "2.5 oz", name: "Chilled Club Soda", role: "Effervescent Lengthener" }
    ],
    modes: {
      classic: {
        type: "measure",
        targetIndex: 0,
        prompt: "What is the ratio between Campari and Sweet Vermouth in an Americano?",
        correctAnswer: "1 : 1 (Equal Parts 1.5 oz each)",
        options: ["1 : 1 (Equal Parts 1.5 oz each)", "3 : 1 Ratio", "1 : 3 Ratio", "4 : 1 Ratio"],
        hint: "Strict equal-parts Milano-Torino base.",
        diagnosis: "Equal 1.5 oz measures create harmony between bitter Campari and herbal sweet vermouth."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Tonic Water Poured Instead of Club Soda (FLAW)",
        correctIngredientName: "Unflavored Crisp Club Soda",
        prompt: "RECIPE AUDIT: Identify the carbonated modifier flaw:",
        correctAnswer: "Sweetened tonic water adds unnecessary sugar and competing quinine bitterness",
        options: [
          "Sweetened tonic water adds unnecessary sugar and competing quinine bitterness",
          "Campari must be boiled before service",
          "Americanos should never contain ice",
          "Vermouth must be replaced with scotch"
        ],
        hint: "The drink requires unflavored sparkling soda, not sweet quinine tonic.",
        diagnosis: "Club soda provides effervescence without adding sugar, allowing the botanicals to shine."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which city's sweet vermouth tradition gave the drink its original 'Milano-Torino' name?",
        correctAnswer: "Torino (Sweet Red Vermouth)",
        options: ["Torino (Sweet Red Vermouth)", "Paris", "London", "Madrid"],
        hint: "Piedmontese city renowned for sweet red herbal vermouth.",
        diagnosis: "Sweet vermouth represents Torino; Campari represents Milan (Milano-Torino)."
      }
    }
  },
  {
    id: "cosmopolitan",
    name: "Cosmopolitan",
    family: "Daisy / Modern Classic",
    era: "1988 • Toby Cecchini, The Odeon, NYC",
    baseSpirit: "Citron Vodka",
    glass: "Martini",
    ice: "None / Served Up",
    method: "Shake Hard with Ice & Double Strain",
    garnish: "Flamed Orange Twist",
    footnote: "Cecchini standardized the recipe using Absolut Citron, Cointreau, and ocean spray cranberry for a pale pink blush.",
    spec: [
      { measure: "1.5 oz", name: "Citron Vodka", role: "Citrus Spirit Base" },
      { measure: "0.75 oz", name: "Cointreau", role: "Orange Liqueur Modifier" },
      { measure: "0.75 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.5 oz", name: "Cranberry Juice (Cocktail blend)", role: "Color & Tart Modifier" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which flavored vodka was used by Toby Cecchini to formulate the definitive 1988 Cosmo?",
        correctAnswer: "Citron (Lemon-Infused) Vodka",
        options: ["Citron (Lemon-Infused) Vodka", "Vanilla Vodka", "Plain Unflavored Vodka", "Pepper Vodka"],
        hint: "Absolut Citron was newly released in 1988.",
        diagnosis: "Citron vodka provides clean lemon peel oils that integrate with fresh lime juice."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 3,
        flawIngredientDisplay: "Cranberry Juice 4.0 oz (FLAW)",
        correctIngredientName: "Cranberry Juice 0.5 oz (Just for Blush Pink Color)",
        prompt: "RECIPE AUDIT: Identify the resort-style over-pour on this ticket:",
        correctAnswer: "Over-pouring cranberry drowns the citrus vodka and turns the drink a dark red fruit punch",
        options: [
          "Over-pouring cranberry drowns the citrus vodka and turns the drink a dark red fruit punch",
          "Vodka should be replaced with dark Jamaican rum",
          "Cosmos must be served in an Old Fashioned glass with crushed ice",
          "Lime juice must be eliminated entirely"
        ],
        hint: "A true Cosmopolitan should be pale translucent pink, not opaque red.",
        diagnosis: "Cranberry juice should be used sparingly (0.5 oz) for tartness and a pale pink blush."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which orange cordial balances lime and cranberry in the Cosmopolitan Daisy spec?",
        correctAnswer: "Cointreau",
        options: ["Cointreau", "Blue Curaçao", "Crème de Cacao", "Maraschino Liqueur"],
        hint: "Crisp French triple sec orange liqueur.",
        diagnosis: "Cointreau supplies pure orange peel oils that balance fresh lime and cranberry."
      }
    }
  },
  {
    id: "french-connection",
    name: "French Connection",
    family: "Duo",
    era: "1970s • Classic French Duo",
    baseSpirit: "Cognac",
    glass: "Rocks",
    ice: "Large Clear Ice Cube",
    method: "Build over Ice in Rocks Glass & Stir Gently",
    garnish: "Expressed Orange Peel (Optional)",
    footnote: "Named after the 1971 Gene Hackman film; pairs French grape brandy with Italian almond amaretto.",
    spec: [
      { measure: "1.5 oz", name: "Cognac", role: "French Grape Base" },
      { measure: "1.0 oz", name: "Amaretto Liqueur", role: "Sweet Almond Modifier" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which French oak-aged grape spirit anchors the French Connection?",
        correctAnswer: "Cognac",
        options: ["Cognac", "London Dry Gin", "Tequila Reposado", "Bourbon"],
        hint: "Aged brandy from the Cognac region of France.",
        diagnosis: "Cognac provides wood tannins and dried fruit that balance rich almond amaretto."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Hard Shaken with Lemon Juice and Egg White (FLAW)",
        correctIngredientName: "Stirred Gently over Ice as a Spirit-Forward Duo",
        prompt: "RECIPE AUDIT: Identify the style confusion on this ticket:",
        correctAnswer: "The French Connection is a stirred spirit duo, not a shaken egg-white sour",
        options: [
          "The French Connection is a stirred spirit duo, not a shaken egg-white sour",
          "Cognac must never touch ice",
          "Amaretto is illegal in France",
          "Drink must be served in an insulated coffee mug"
        ],
        hint: "A duo consists simply of a spirit and a liqueur stirred over ice.",
        diagnosis: "The French Connection is a spirit-forward duo built over ice; adding citrus and egg white turns it into an Amaretto Sour."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the balanced pour of amaretto to 1.5 oz Cognac?",
        correctAnswer: "1.0 oz",
        options: ["1.0 oz", "0.25 oz", "2.5 oz", "0.0 oz"],
        hint: "A 1.5:1 ratio keeps the amaretto from overwhelming the brandy.",
        diagnosis: "1.0 oz amaretto sweetens and flavors 1.5 oz Cognac without drowning its oak character."
      }
    }
  },
  {
    id: "godfather",
    name: "The Godfather",
    family: "Duo",
    era: "1970s • American Classic",
    baseSpirit: "Scotch Whisky",
    glass: "Rocks",
    ice: "Large Clear Ice Cube",
    method: "Build over Ice in Rocks Glass & Stir Gently",
    garnish: "Expressed Orange Peel",
    footnote: "Supposedly favored by Marlon Brando; combines Scottish smoky malt with Italian amaretto.",
    spec: [
      { measure: "2.0 oz", name: "Blended Scotch Whisky", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Amaretto Liqueur", role: "Almond Sweetener" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which whisky style forms the core of The Godfather?",
        correctAnswer: "Blended Scotch Whisky",
        options: ["Blended Scotch Whisky", "Kentucky Bourbon", "White Rum", "Vodka"],
        hint: "Smoky, peaty, or malted Scottish grain whisky.",
        diagnosis: "Scotch whisky supplies grain smoke and malt that cut through sweet almond amaretto."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Blue Curaçao 1.5 oz (FLAW)",
        correctIngredientName: "Amaretto Liqueur 0.75 oz",
        prompt: "RECIPE AUDIT: Identify the modifier error:",
        correctAnswer: "Blue Curaçao turns the drink neon blue and lacks the required sweet almond profile",
        options: [
          "Blue Curaçao turns the drink neon blue and lacks the required sweet almond profile",
          "Scotch must be replaced with warm tap water",
          "Godfather drinks must be topped with hot black coffee",
          "Drink must be served in an absinthe fountain"
        ],
        hint: "The Godfather's signature flavor is Italian almond amaretto.",
        diagnosis: "Amaretto is the non-negotiable partner to Scotch in this iconic duo."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "Specify the amaretto pour to balance 2.0 oz Scotch without becoming cloying:",
        correctAnswer: "0.75 oz",
        options: ["0.75 oz", "2.0 oz", "0.1 oz", "3.0 oz"],
        hint: "Modern palates prefer a 2:0.75 or 2:0.5 ratio over equal parts.",
        diagnosis: "0.75 oz amaretto balances 2.0 oz Scotch without tipping into syrupy sweetness."
      }
    }
  },
  {
    id: "rusty-nail",
    name: "Rusty Nail",
    family: "Duo",
    era: "1960s • 21 Club, New York",
    baseSpirit: "Scotch Whisky",
    glass: "Rocks",
    ice: "Large Clear Ice Cube",
    method: "Build over Ice in Rocks Glass & Stir Thoroughly",
    garnish: "Expressed Lemon Peel",
    footnote: "Rat Pack favorite combining Scottish whisky with Drambuie (heather honey and herb Scotch liqueur).",
    spec: [
      { measure: "2.0 oz", name: "Blended Scotch Whisky", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Drambuie Liqueur", role: "Honey-Heather Modifier" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which Scotch-based honey and heather liqueur is required for a Rusty Nail?",
        correctAnswer: "Drambuie Liqueur",
        options: ["Drambuie Liqueur", "Bénédictine", "Cointreau", "Galliano"],
        hint: "Legendary Scottish liqueur crafted from aged malt whisky, heather honey, herbs, and spices.",
        diagnosis: "Drambuie provides heather honey, clove, and herb sweetness that melds seamlessly with Scotch."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Plain Simple Syrup (FLAW)",
        correctIngredientName: "Drambuie (Heather Honey & Herb Liqueur)",
        prompt: "RECIPE AUDIT: Identify the modifier shortcut destroying this cocktail:",
        correctAnswer: "Plain syrup lacks the herbal, spiced honey character of authentic Drambuie",
        options: [
          "Plain syrup lacks the herbal, spiced honey character of authentic Drambuie",
          "Scotch must be substituted with white tequila",
          "Rusty Nails must be served boiling hot in an iron mug",
          "The glass must be rimmed with coarse kosher salt"
        ],
        hint: "A Rusty Nail is defined specifically by the marriage of Scotch and Drambuie.",
        diagnosis: "Drambuie is irreplaceable; its aged Scotch base, honey, and botanicals are what make it a Rusty Nail."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the modern balanced pour of Drambuie against 2.0 oz Scotch?",
        correctAnswer: "0.75 oz",
        options: ["0.75 oz", "2.0 oz (Equal Parts)", "0.1 oz", "3.0 oz"],
        hint: "The 1960s 1:1 ratio is modernized today to 2:0.75 for improved dryness.",
        diagnosis: "0.75 oz Drambuie provides balanced sweetness without overwhelming the base whisky."
      }
    }
  },
  {
    id: "palmetto",
    name: "Palmetto",
    family: "Manhattan Riff",
    era: "1890s • American Classic",
    baseSpirit: "Aged Dark Rum",
    glass: "Nick & Nora",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Strain",
    garnish: "Expressed Orange Peel",
    footnote: "The rum drinker's Manhattan; aged rum marries beautifully with Italian sweet vermouth.",
    spec: [
      { measure: "1.5 oz", name: "Aged Dark Rum", role: "Molasses & Oak Base" },
      { measure: "1.5 oz", name: "Sweet Red Vermouth", role: "Fortified Modifier" },
      { measure: "2 dashes", name: "Orange Bitters", role: "Citrus Bitters" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which spirit replaces rye whiskey to transform a Manhattan into a Palmetto?",
        correctAnswer: "Aged Dark Rum",
        options: ["Aged Dark Rum", "Blanco Tequila", "Dry Gin", "Vodka"],
        hint: "Oak-aged sugarcane distillate with notes of molasses and spice.",
        diagnosis: "Aged dark rum contributes molasses richness and barrel oak that pair gracefully with sweet vermouth."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Hard Shaken with Ice until Frothy (FLAW)",
        correctIngredientName: "Stirred to Silky Clarity with Dense Ice",
        prompt: "RECIPE AUDIT: Identify the technique violation:",
        correctAnswer: "Shaking spirits and aromatized wine creates cloudy aeration and ruins silky texture",
        options: [
          "Shaking spirits and aromatized wine creates cloudy aeration and ruins silky texture",
          "Dark rum must never touch sweet vermouth",
          "Orange bitters are toxic when chilled",
          "Drink must be served in a tall hurricane glass"
        ],
        hint: "Spirit-and-vermouth cocktails should always be stirred for clarity and weight.",
        diagnosis: "Stirring produces a crystal-clear, dense drink without introducing ice chips or froth."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the classic equal-parts measure of sweet vermouth in a 1:1 Palmetto?",
        correctAnswer: "1.5 oz",
        options: ["1.5 oz", "0.25 oz", "3.0 oz", "0.5 oz"],
        hint: "Equal parts with the 1.5 oz rum base.",
        diagnosis: "An equal parts 1.5 oz build highlights both the aged rum and the herbal qualities of the vermouth."
      }
    }
  },
  {
    id: "gibson",
    name: "Gibson",
    family: "Martini",
    era: "1900s • Players Club, NYC",
    baseSpirit: "London Dry Gin",
    glass: "Martini",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Strain",
    garnish: "Pickled Cocktail Onion",
    footnote: "A dry martini made savory by replacing the traditional olive or lemon twist with a pickled cocktail onion.",
    spec: [
      { measure: "2.5 oz", name: "London Dry Gin", role: "Botanical Base" },
      { measure: "0.5 oz", name: "Dry French Vermouth", role: "Fortified Modifier" },
      { measure: "1 whole", name: "Pickled Cocktail Onion", role: "Savory Garnish" }
    ],
    modes: {
      classic: {
        type: "garnish",
        targetIndex: 2,
        prompt: "Which savory garnish uniquely distinguishes a Gibson from a standard Dry Martini?",
        correctAnswer: "Pickled Cocktail Onion",
        options: ["Pickled Cocktail Onion", "Castelvetrano Olive", "Lemon Peel", "Brandied Cherry"],
        hint: "Small pearl onion preserved in savory brine.",
        diagnosis: "The pickled cocktail onion introduces savory umami and allium brine that defines the Gibson."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 2,
        flawIngredientDisplay: "Sweet Maraschino Cherry Dropped In (FLAW)",
        correctIngredientName: "Savory Pickled Cocktail Pearl Onion",
        prompt: "RECIPE AUDIT: Identify the garnish blunder on this Gibson ticket:",
        correctAnswer: "A sweet cherry destroys the savory dry botanical profile of the Gibson",
        options: [
          "A sweet cherry destroys the savory dry botanical profile of the Gibson",
          "Gin must be replaced with bourbon",
          "Dry vermouth must be boiled in a skillet",
          "The cocktail must be carbonated with baking soda"
        ],
        hint: "A Gibson is strictly defined by its savory pickled onion garnish.",
        diagnosis: "A pickled pearl onion is mandatory; sweet garnishes clash with the dry vermouth and gin."
      },
      family: {
        type: "measure",
        targetIndex: 1,
        prompt: "What is the dry vermouth measure in a crisp 5:1 Gibson build?",
        correctAnswer: "0.5 oz",
        options: ["0.5 oz", "1.5 oz", "2.0 oz", "0.0 oz (Omit)"],
        hint: "Pairs with 2.5 oz of London Dry Gin.",
        diagnosis: "0.5 oz dry vermouth rounds out high-proof gin without masking botanical clarity."
      }
    }
  },
  {
    id: "alaska",
    name: "Alaska",
    family: "Martini Riff",
    era: "1910s • Savoy Cocktail Book",
    baseSpirit: "London Dry Gin",
    glass: "Nick & Nora",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Strain",
    garnish: "Lemon Twist",
    footnote: "Pairs gin with honeyed Yellow Chartreuse and orange bitters for an alpine, herbaceous profile.",
    spec: [
      { measure: "2.0 oz", name: "London Dry Gin", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Yellow Chartreuse", role: "Herbal Honey Modifier" },
      { measure: "2 dashes", name: "Orange Bitters", role: "Citrus Bitters" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which milder, saffron-infused Chartreuse is used in an Alaska?",
        correctAnswer: "Yellow Chartreuse",
        options: ["Yellow Chartreuse", "Green Chartreuse", "Bénédictine", "Galliano"],
        hint: "Milder 86-proof monastic liqueur featuring honey and saffron.",
        diagnosis: "Yellow Chartreuse brings sweet honey, saffron, and alpine herbs that soften gin botanicals."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Green Chartreuse 1.5 oz (FLAW)",
        correctIngredientName: "Yellow Chartreuse 0.75 oz",
        prompt: "RECIPE AUDIT: Identify the herbal modifier mistake:",
        correctAnswer: "Green Chartreuse is too sharp and high-proof, overwhelming the delicate gin botanicals",
        options: [
          "Green Chartreuse is too sharp and high-proof, overwhelming the delicate gin botanicals",
          "Gin must be replaced with tequila",
          "Orange bitters are illegal in Alaska cocktails",
          "Drink must be blended with vanilla ice cream"
        ],
        hint: "The Alaska specifically requires the softer, honey-forward profile of Yellow Chartreuse.",
        diagnosis: "Green Chartreuse's intense 110-proof bite dominates; Yellow Chartreuse offers rounder honey-saffron balance."
      },
      family: {
        type: "method",
        targetIndex: -1,
        prompt: "How is this all-spirit botanical cocktail prepared?",
        correctAnswer: "Stirred thoroughly with dense ice and strained",
        options: [
          "Stirred thoroughly with dense ice and strained",
          "Hard shaken until frothy and cloudy",
          "Blended in an electric blender with crushed ice",
          "Built in a beer mug and warmed"
        ],
        hint: "Clear, spirit-forward drinks with no fruit juice should be stirred.",
        diagnosis: "Stirring preserves clarity, density, and allows the herbal aromatics to open up cleanly."
      }
    }
  },
  {
    id: "ti-punch",
    name: "Ti' Punch",
    family: "Ancestral / Sour",
    era: "19th Century • Martinique & Guadeloupe",
    baseSpirit: "Rhum Agricole Blanc",
    glass: "Rocks",
    ice: "Optional / Served Room Temp or One Cube",
    method: "Cut Lime Disc with Flesh; Squeeze & Drop in Glass with Cane Syrup; Add Rhum; Swizzle",
    garnish: "Spent Lime Disc (Bois Chélé)",
    footnote: "'Chacun prépare sa propre mort' (Each prepares their own death)—guests traditionally pour their own rum.",
    spec: [
      { measure: "2.0 oz", name: "Rhum Agricole Blanc (50-55% ABV)", role: "Fresh Cane Juice Base" },
      { measure: "1 barspoon", name: "Sirop de Canne (Cane Syrup)", role: "Sweet Modifier" },
      { measure: "1 disc", name: "Fresh Lime Peel with Juice Flesh", role: "Citrus Oil & Acid" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "What makes Rhum Agricole unique compared to industrial molasses rums?",
        correctAnswer: "Distilled directly from fresh unrefined sugarcane juice",
        options: [
          "Distillate made directly from fresh unrefined sugarcane juice",
          "Aged 20 years in charred white oak barrels",
          "Flavored with artificial coconut and spices",
          "Distilled from fermented potatoes and corn"
        ],
        hint: "French AOC rum crafted from freshly crushed sugar cane juice.",
        diagnosis: "Rhum Agricole is pressed from raw sugar cane, yielding grassy, earthy, and terroir-driven flavors."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: -1,
        flawIngredientDisplay: "Hard Shaken with Crushed Ice in a Shaker and Fine Strained (FLAW)",
        correctIngredientName: "Built Directly in the Glass at Room Temp or with One Ice Cube",
        prompt: "RECIPE AUDIT: Identify the cultural preparation violation:",
        correctAnswer: "Shaking and over-diluting destroys the aromatic punch of high-proof agricole rhum",
        options: [
          "Shaking and over-diluting destroys the aromatic punch of high-proof agricole rhum",
          "Rhum Agricole must be boiled in a tea kettle",
          "Lime must be peeled and thrown away",
          "Sirop de canne must be substituted with maple syrup"
        ],
        hint: "Ti' Punch is traditionally built at ambient room temperature in the French Antilles.",
        diagnosis: "Ti' Punch is swizzled directly in the glass to showcase the raw strength and aromatics of the rhum."
      },
      family: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which unrefined sweetener is canonical in Martinique?",
        correctAnswer: "Sirop de Canne (Raw Cane Syrup)",
        options: ["Sirop de Canne (Raw Cane Syrup)", "Molasses", "Agave Nectar", "Corn Syrup"],
        hint: "Concentrated fresh sugar cane juice syrup.",
        diagnosis: "Sirop de canne complements the grassy notes of Rhum Agricole without introducing caramel flavors."
      }
    }
  },
  {
    id: "corn-n-oil",
    name: "Corn 'n' Oil",
    family: "Swizzle / Tropical",
    era: "1920s • Barbados Classic",
    baseSpirit: "Barbados Aged Rum & Blackstrap Rum",
    glass: "Rocks",
    ice: "Crushed Ice",
    method: "Swizzle Aged Rum, Falernum & Lime Juice with Crushed Ice; Float Blackstrap Rum",
    garnish: "Lime Wheel",
    footnote: "The blackstrap rum floating atop golden falernum and rum resembles motor oil over corn liquor.",
    spec: [
      { measure: "1.5 oz", name: "Aged Barbados Rum", role: "Base Spirit" },
      { measure: "0.75 oz", name: "Velvet Falernum", role: "Spiced Lime-Clove Modifier" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "0.5 oz", name: "Blackstrap Rum (Float)", role: "Molasses 'Oil' Layer" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which Bajan liqueur provides the clove, almond, and lime oil notes in this build?",
        correctAnswer: "Velvet Falernum",
        options: ["Velvet Falernum", "Allspice Dram", "Cointreau", "Bénédictine"],
        hint: "Barbadian clove and lime liqueur.",
        diagnosis: "Velvet Falernum supplies the spice and sweetness that define authentic Bajan cocktails."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 3,
        flawIngredientDisplay: "Blackstrap Rum Stirred In Uniformly (FLAW)",
        correctIngredientName: "Blackstrap Rum Floated on Top like 'Oil'",
        prompt: "RECIPE AUDIT: Identify the visual and service presentation error:",
        correctAnswer: "Failing to float the dark rum ruins the namesake 'Corn 'n' Oil' visual contrast",
        options: [
          "Failing to float the dark rum ruins the namesake 'Corn 'n' Oil' visual contrast",
          "Rum must be replaced with vodka",
          "Lime juice must be boiled before service",
          "Cocktail must be strained into a warm tea saucer"
        ],
        hint: "The dark molasses rum must sit on top like an oil slick.",
        diagnosis: "Floating the dark rum on top creates the dark slick over the golden drink that gives it its name."
      },
      family: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which island's rum heritage grounds the authentic Corn 'n' Oil?",
        correctAnswer: "Barbados (Bajan Rum)",
        options: ["Barbados (Bajan Rum)", "Puerto Rico", "Cuba", "Mexico"],
        hint: "Distilled at historic distilleries like Mount Gay or Foursquare.",
        diagnosis: "Barbadian pot and column distilled aged rum provides the golden character the drink is built upon."
      }
    }
  },
  {
    id: "el-diablo",
    name: "El Diablo",
    family: "Buck / Highball",
    era: "1946 • Trader Vic's Food and Drink",
    baseSpirit: "Blanco or Reposado Tequila",
    glass: "Collins",
    ice: "Highball Cubes",
    method: "Shake Tequila, Lime & Crème de Cassis; Strain over Ice; Top with Ginger Beer",
    garnish: "Lime Wedge & Candied Ginger",
    footnote: "A vibrant Mexican buck: earthy agave balanced with spicy ginger beer and dark blackcurrant liqueur.",
    spec: [
      { measure: "1.5 oz", name: "Blanco or Reposado Tequila", role: "Base Spirit" },
      { measure: "0.5 oz", name: "Crème de Cassis", role: "Blackcurrant Modifier" },
      { measure: "0.5 oz", name: "Fresh Lime Juice", role: "Sour Element" },
      { measure: "3.0 oz", name: "Spicy Ginger Beer", role: "Spicy Lengthener" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 1,
        prompt: "Which French blackcurrant liqueur gives El Diablo its deep berry hue?",
        correctAnswer: "Crème de Cassis",
        options: ["Crème de Cassis", "Crème de Mûre", "Grenadine", "Chambord"],
        hint: "Burgundian blackcurrant cordial used in a Kir.",
        diagnosis: "Crème de Cassis delivers rich berry sweetness that pairs with fiery ginger beer."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 3,
        flawIngredientDisplay: "Ginger Beer Shaken Inside Sealed Shaker Tin (FLAW)",
        correctIngredientName: "Ginger Beer Topped Over Strained Base",
        prompt: "RECIPE AUDIT: Identify the physical technique error on this ticket:",
        correctAnswer: "Shaking carbonated ginger beer inside a shaker causes violent pressure eruptions",
        options: [
          "Shaking carbonated ginger beer inside a shaker causes violent pressure eruptions",
          "Tequila must be replaced with gin",
          "El Diablo cocktails must be served warm",
          "Cassis must be substituted with red hot sauce"
        ],
        hint: "Carbonated sodas should never be shaken in a sealed tin.",
        diagnosis: "Fizzy sodas must always be poured as a lengthener over the strained cocktail base."
      },
      family: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which blue agave spirit anchors El Diablo?",
        correctAnswer: "Blanco or Reposado Tequila",
        options: ["Blanco or Reposado Tequila", "White Rum", "Bourbon", "London Dry Gin"],
        hint: "Jalisco blue agave distillate.",
        diagnosis: "Tequila provides earthy, vegetal character that cuts through sweet cassis and spicy ginger beer."
      }
    }
  },
  {
    id: "chrysanthemum",
    name: "Chrysanthemum",
    family: "Aperitif / Low-ABV",
    era: "1916 • Hugo Ensslin, Recipes for Mixed Drinks",
    baseSpirit: "Dry French Vermouth",
    glass: "Nick & Nora",
    ice: "None / Served Up",
    method: "Stir Thoroughly with Dense Ice & Strain",
    garnish: "Expressed Orange Twist",
    footnote: "A low-ABV masterwork where dry vermouth acts as the primary base rather than a supporting modifier.",
    spec: [
      { measure: "2.0 oz", name: "Dry French Vermouth", role: "Fortified Base" },
      { measure: "1.0 oz", name: "Bénédictine D.O.M.", role: "Herbal Honey Modifier" },
      { measure: "3 dashes", name: "Absinthe", role: "Aromatic Anise Accent" }
    ],
    modes: {
      classic: {
        type: "ingredient",
        targetIndex: 0,
        prompt: "Which fortified wine serves as the primary base spirit in this low-ABV classic?",
        correctAnswer: "Dry French Vermouth",
        options: ["Dry French Vermouth", "London Dry Gin", "Vodka", "Sweet Red Vermouth"],
        hint: "Herbaceous, crisp dry white aromatized wine.",
        diagnosis: "Dry French vermouth acts as the full 2.0 oz foundation, keeping the cocktail light and complex."
      },
      repair: {
        type: "troubleshoot",
        targetIndex: 1,
        flawIngredientDisplay: "Bénédictine 2.5 oz (FLAW)",
        correctIngredientName: "Bénédictine 1.0 oz",
        prompt: "RECIPE AUDIT: Identify the proportion error ruining this Chrysanthemum:",
        correctAnswer: "Over-pouring Bénédictine turns the cocktail into a cloying, syrupy mess",
        options: [
          "Over-pouring Bénédictine turns the cocktail into a cloying, syrupy mess",
          "Dry vermouth must be replaced with gin",
          "Absinthe must be omitted under international law",
          "The cocktail must be served boiling hot in an iron mug"
        ],
        hint: "Bénédictine is high in sugar and must be balanced by dry vermouth.",
        diagnosis: "Bénédictine is intensely sweet; more than 1.0 oz overwhelms the dry vermouth base."
      },
      family: {
        type: "ingredient",
        targetIndex: 2,
        prompt: "Which high-proof anise spirit adds aromatics to the Chrysanthemum?",
        correctAnswer: "Absinthe",
        options: ["Absinthe", "Campari", "Blue Curaçao", "Cointreau"],
        hint: "Herbal wormwood and anise spirit used in dashes.",
        diagnosis: "Three dashes of absinthe provide an aromatic anise lift that brightens the herbal profile."
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

  function handleHint() {
    if (state.answered || !state.activeChallenge) return;
    audio.playClick();
    DOM.btnHint.disabled = true;
    DOM.deckPrompt.textContent = `💡 CLUE: ${state.activeChallenge.hint}`;

    // Eliminate one incorrect option as visual assistance
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
