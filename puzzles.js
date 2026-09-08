/**
 * ============================================================================
 * COCKTAIL SPECS CARD CHALLENGE — PUZZLE CONTENT DATABASE
 * File: puzzles.js
 * ============================================================================
 * 
 * CONTRACT & ARCHITECTURE:
 * - This file is the CONTENT DATABASE. It contains no DOM or engine code.
 * - Adding a new puzzle is as simple as adding an object to COCKTAIL_PUZZLES.
 * - Each puzzle defines an authentic cocktail specification verified against
 *   canonical bar reference works (IBA, Savoy, St. John, Difford's, Embury).
 * - Slots represent the 5 universal specs components:
 *     0: Base Spirit & Measure
 *     1: Modifier / Fortified & Measure
 *     2: Citrus / Sweetener / Accent & Measure
 *     3: Technique & Ice Preparation
 *     4: Glassware & Garnish
 * - All historical and technical data conforms to the Master 32-Category
 *   Cocktail Curriculum.
 */

// Stable Reference Epoch for deterministic daily calendar mapping
const PUZZLE_EPOCH = "2025-01-01T00:00:00Z";

const COCKTAIL_PUZZLES = [
  {
    id: "spec-001",
    name: "THE OLD FASHIONED",
    era: "c. 1880s • Louisville / New York",
    curriculumCategory: "Level 1: Cocktail Families (The Ancestral)",
    difficulty: "Beginner",
    clue: "The primordial American cocktail: spirit, sugar, water, and aromatic bitters, built directly over ice.",
    
    // The 5 Canonical Target Slots
    targetSlots: [
      {
        slotIndex: 0,
        type: "BASE SPIRIT",
        component: "2.0 oz (60ml) Rye or Bourbon Whiskey"
      },
      {
        slotIndex: 1,
        type: "MODIFIER / SWEETENER",
        component: "1 Demerara Sugar Cube (or 1 barspoon 2:1 Rich Syrup)"
      },
      {
        slotIndex: 2,
        type: "BALANCE & ACCENTS",
        component: "2–3 Dashes Angostura Aromatic Bitters & Splash of Water"
      },
      {
        slotIndex: 3,
        type: "TECHNIQUE & ICE",
        component: "Built in Glass, Stirred Gently over One Large Clear Rock"
      },
      {
        slotIndex: 4,
        type: "GLASSWARE & GARNISH",
        component: "Heavy Rocks / Double Old Fashioned Glass with Expressed Orange Peel"
      }
    ],

    // Curated Bar Rail Supply (5 correct + 5 authentic distractors)
    barRailPool: [
      { id: "t-101", text: "2.0 oz (60ml) Rye or Bourbon Whiskey", category: "SPIRIT", correctSlot: 0 },
      { id: "t-102", text: "1 Demerara Sugar Cube (or 1 barspoon 2:1 Rich Syrup)", category: "SWEETENER", correctSlot: 1 },
      { id: "t-103", text: "2–3 Dashes Angostura Aromatic Bitters & Splash of Water", category: "BITTERS", correctSlot: 2 },
      { id: "t-104", text: "Built in Glass, Stirred Gently over One Large Clear Rock", category: "TECHNIQUE", correctSlot: 3 },
      { id: "t-105", text: "Heavy Rocks / Double Old Fashioned Glass with Expressed Orange Peel", category: "SERVICE", correctSlot: 4 },
      // Distractors
      { id: "t-106", text: "2.0 oz (60ml) London Dry Gin", category: "SPIRIT", correctSlot: null },
      { id: "t-107", text: "0.75 oz Sweet Vermouth & Maraschino", category: "MODIFIER", correctSlot: null },
      { id: "t-108", text: "Hard Shaken with Ice and Double Strained", category: "TECHNIQUE", correctSlot: null },
      { id: "t-109", text: "Chilled Coupe Glass with Maraschino Cherry & Sugar Rim", category: "SERVICE", correctSlot: null },
      { id: "t-110", text: "3 Dashes Peychaud's Bitters & Absinthe Spritz", category: "BITTERS", correctSlot: null }
    ],

    hint: "Never shake an Old Fashioned. Dilution occurs deliberately in the glass over heavy-density ice.",
    lore: "Defined in 1806 as a stimulating liquor composed of spirits of any kind, sugar, water, and bitters. In the 1880s, patrons requested the drink 'the old-fashioned way' to push back against complex modern European liqueurs."
  },

  {
    id: "spec-002",
    name: "CORPSE REVIVER NO. 2",
    era: "1930 • Harry Craddock, Savoy London",
    curriculumCategory: "Level 2: Liqueurs & Cordials",
    difficulty: "Medium",
    clue: "An equal-parts Savoy Hotel morning reviver designed to 'rouse the dead' with botanical citrus vibrancy.",
    
    targetSlots: [
      {
        slotIndex: 0,
        type: "BASE SPIRIT",
        component: "0.75 oz (22.5ml) London Dry Gin"
      },
      {
        slotIndex: 1,
        type: "MODIFIER / FORTIFIED",
        component: "0.75 oz Cointreau & 0.75 oz Lillet Blanc (or Cocchi Americano)"
      },
      {
        slotIndex: 2,
        type: "BALANCE & ACCENTS",
        component: "0.75 oz (22.5ml) Fresh Lemon Juice & 1 Dash Absinthe Rinse"
      },
      {
        slotIndex: 3,
        type: "TECHNIQUE & ICE",
        component: "Vigorously Shaken with Cubed Ice, Fine Strained Up"
      },
      {
        slotIndex: 4,
        type: "GLASSWARE & GARNISH",
        component: "Chilled Coupe with Expressed Lemon Peel (Absinthe Rinsed Bowl)"
      }
    ],

    barRailPool: [
      { id: "t-201", text: "0.75 oz (22.5ml) London Dry Gin", category: "SPIRIT", correctSlot: 0 },
      { id: "t-202", text: "0.75 oz Cointreau & 0.75 oz Lillet Blanc (or Cocchi Americano)", category: "MODIFIER", correctSlot: 1 },
      { id: "t-203", text: "0.75 oz (22.5ml) Fresh Lemon Juice & 1 Dash Absinthe Rinse", category: "ACID/RINSE", correctSlot: 2 },
      { id: "t-204", text: "Vigorously Shaken with Cubed Ice, Fine Strained Up", category: "TECHNIQUE", correctSlot: 3 },
      { id: "t-205", text: "Chilled Coupe with Expressed Lemon Peel (Absinthe Rinsed Bowl)", category: "SERVICE", correctSlot: 4 },
      // Distractors
      { id: "t-206", text: "1.5 oz Cognac & 0.75 oz Sweet Vermouth", category: "SPIRIT", correctSlot: null },
      { id: "t-207", text: "0.75 oz Fresh Lime Juice & Demerara Syrup", category: "ACID", correctSlot: null },
      { id: "t-208", text: "Stirred in Mixing Glass with Cracked Ice for 45 Seconds", category: "TECHNIQUE", correctSlot: null },
      { id: "t-209", text: "Highball Glass Packed with Crushed Ice and Mint Bouquet", category: "SERVICE", correctSlot: null },
      { id: "t-210", text: "0.75 oz Campari & 0.75 oz Sweet Vermouth", category: "MODIFIER", correctSlot: null }
    ],

    hint: "This classic belongs to the Savoy equal-parts canon. Lemon provides the acid—not lime—paired with an aniseed rinse.",
    lore: "Immortalized by Harry Craddock in the 1930 Savoy Cocktail Book with the warning: 'Four of these taken in swift succession will unrevive the corpse again.' Lillet Blanc substituted Kina Lillet after reformulation in 1986."
  },

  {
    id: "spec-003",
    name: "THE LAST WORD",
    era: "c. 1915 • Detroit Athletic Club",
    curriculumCategory: "Level 2: Botanicals & Aromatics",
    difficulty: "Easy",
    clue: "The legendary equal-parts prohibition harmony of herbaceous alpine monk liqueur and pungent sour cherry.",
    
    targetSlots: [
      {
        slotIndex: 0,
        type: "BASE SPIRIT",
        component: "0.75 oz (22.5ml) London Dry Gin"
      },
      {
        slotIndex: 1,
        type: "HERBAL MODIFIER",
        component: "0.75 oz (22.5ml) Green Chartreuse (55% ABV)"
      },
      {
        slotIndex: 2,
        type: "BALANCE & LIQUEUR",
        component: "0.75 oz (22.5ml) Luxardo Maraschino & 0.75 oz Fresh Lime Juice"
      },
      {
        slotIndex: 3,
        type: "TECHNIQUE & ICE",
        component: "Hard Shaken with Ice, Double Strained to Remove Shards"
      },
      {
        slotIndex: 4,
        type: "GLASSWARE & GARNISH",
        component: "Chilled Nick & Nora or Coupe Glass with Brandied Cherry"
      }
    ],

    barRailPool: [
      { id: "t-301", text: "0.75 oz (22.5ml) London Dry Gin", category: "SPIRIT", correctSlot: 0 },
      { id: "t-302", text: "0.75 oz (22.5ml) Green Chartreuse (55% ABV)", category: "MODIFIER", correctSlot: 1 },
      { id: "t-303", text: "0.75 oz (22.5ml) Luxardo Maraschino & 0.75 oz Fresh Lime Juice", category: "BALANCE", correctSlot: 2 },
      { id: "t-304", text: "Hard Shaken with Ice, Double Strained to Remove Shards", category: "TECHNIQUE", correctSlot: 3 },
      { id: "t-305", text: "Chilled Nick & Nora or Coupe Glass with Brandied Cherry", category: "SERVICE", correctSlot: 4 },
      // Distractors
      { id: "t-306", text: "0.75 oz Yellow Chartreuse & Dry Vermouth", category: "MODIFIER", correctSlot: null },
      { id: "t-307", text: "0.75 oz Fresh Lemon Juice & Rich Simple Syrup", category: "BALANCE", correctSlot: null },
      { id: "t-308", text: "2.0 oz Blanco Tequila & 0.5 oz Mezcal", category: "SPIRIT", correctSlot: null },
      { id: "t-309", text: "Stirred over Ice Block & Strained into Rocks Glass", category: "TECHNIQUE", correctSlot: null },
      { id: "t-310", text: "Collins Glass with Club Soda and Cucumber Ribbon", category: "SERVICE", correctSlot: null }
    ],

    hint: "Green Chartreuse's intense 130 botanicals require fresh lime juice—not lemon—to pierce through its sweetness.",
    lore: "Invented during WWI at the Detroit Athletic Club by vaudeville entertainer Frank Fogarty. Rediscovered in 2004 by Murray Stenson at Seattle's Zig Zag Café, sparking the modern craft cocktail revival."
  },

  {
    id: "spec-004",
    name: "OAXACA OLD FASHIONED",
    era: "2007 • Phil Ward, Death & Co NYC",
    curriculumCategory: "Level 3: Specs, Ratios & Balance",
    difficulty: "Hard",
    clue: "The modern classic that introduced split-base agave cocktail construction to world bar culture.",
    
    targetSlots: [
      {
        slotIndex: 0,
        type: "BASE SPIRIT",
        component: "1.5 oz (45ml) Reposado Tequila"
      },
      {
        slotIndex: 1,
        type: "SMOKY ACCENT SPIRIT",
        component: "0.5 oz (15ml) Del Maguey Vida (or Artisanal Espadín Mezcal)"
      },
      {
        slotIndex: 2,
        type: "SWEETENER & BITTERS",
        component: "1 Barspoon (0.17 oz) Agave Nectar (1:1) & 2 Dashes Angostura"
      },
      {
        slotIndex: 3,
        type: "TECHNIQUE & ICE",
        component: "Stirred with Ice for 30 Seconds, Strained over Fresh Ice Rock"
      },
      {
        slotIndex: 4,
        type: "GLASSWARE & GARNISH",
        component: "Double Rocks Glass with Flamed Orange Peel (Expressed & Discarded)"
      }
    ],

    barRailPool: [
      { id: "t-401", text: "1.5 oz (45ml) Reposado Tequila", category: "SPIRIT", correctSlot: 0 },
      { id: "t-402", text: "0.5 oz (15ml) Del Maguey Vida (or Artisanal Espadín Mezcal)", category: "MODIFIER", correctSlot: 1 },
      { id: "t-403", text: "1 Barspoon (0.17 oz) Agave Nectar (1:1) & 2 Dashes Angostura", category: "SWEETENER", correctSlot: 2 },
      { id: "t-404", text: "Stirred with Ice for 30 Seconds, Strained over Fresh Ice Rock", category: "TECHNIQUE", correctSlot: 3 },
      { id: "t-405", text: "Double Rocks Glass with Flamed Orange Peel (Expressed & Discarded)", category: "SERVICE", correctSlot: 4 },
      // Distractors
      { id: "t-406", text: "2.0 oz Blanco Tequila (100% Blue Agave)", category: "SPIRIT", correctSlot: null },
      { id: "t-407", text: "0.75 oz Lime Juice & 0.5 oz Cointreau", category: "BALANCE", correctSlot: null },
      { id: "t-408", text: "0.5 oz Pimento Dram (Allspice Liqueur)", category: "MODIFIER", correctSlot: null },
      { id: "t-409", text: "Shaken with Pebble Ice and Poured Dirty", category: "TECHNIQUE", correctSlot: null },
      { id: "t-410", text: "Chilled Coupe with Half-Salt Rim and Lime Wheel", category: "SERVICE", correctSlot: null }
    ],

    hint: "Notice the 3:1 split base: oak-aged Reposado carries the weight, while Mezcal provides an aromatic smoky whisper.",
    lore: "Created by Phil Ward at New York's Death & Co in 2007. It popularized both the 3:1 ratio split-base technique and the flaming of essential citrus oils over agave spirits."
  },

  {
    id: "spec-005",
    name: "THE SAZERAC",
    era: "c. 1838 / 1870 • Antoine Peychaud, New Orleans",
    curriculumCategory: "Level 4: History & Origins",
    difficulty: "Expert",
    clue: "The official cocktail of New Orleans: an intricate dual-glass ritual of rye whiskey, creole bitters, and anise.",
    
    targetSlots: [
      {
        slotIndex: 0,
        type: "BASE SPIRIT",
        component: "2.0 oz (60ml) Straight Rye Whiskey (or Cognac split)"
      },
      {
        slotIndex: 1,
        type: "AROMATIC RINSE",
        component: "1 Barspoon (0.2 oz) Herbsaint or French Absinthe Rinse"
      },
      {
        slotIndex: 2,
        type: "SWEETENER & BITTERS",
        component: "1 White Sugar Cube muddled with 3 Dashes Peychaud's & 1 Dash Angostura"
      },
      {
        slotIndex: 3,
        type: "TECHNIQUE & ICE",
        component: "Stirred with Ice in Mixing Glass, Strained Neat into Rinsed Tumbler (No Ice)"
      },
      {
        slotIndex: 4,
        type: "GLASSWARE & GARNISH",
        component: "Chilled Old Fashioned Tumbler with Expressed Lemon Peel (Discarded)"
      }
    ],

    barRailPool: [
      { id: "t-501", text: "2.0 oz (60ml) Straight Rye Whiskey (or Cognac split)", category: "SPIRIT", correctSlot: 0 },
      { id: "t-502", text: "1 Barspoon (0.2 oz) Herbsaint or French Absinthe Rinse", category: "RINSE", correctSlot: 1 },
      { id: "t-503", text: "1 White Sugar Cube muddled with 3 Dashes Peychaud's & 1 Dash Angostura", category: "BITTERS", correctSlot: 2 },
      { id: "t-504", text: "Stirred with Ice in Mixing Glass, Strained Neat into Rinsed Tumbler (No Ice)", category: "TECHNIQUE", correctSlot: 3 },
      { id: "t-505", text: "Chilled Old Fashioned Tumbler with Expressed Lemon Peel (Discarded)", category: "SERVICE", correctSlot: 4 },
      // Distractors
      { id: "t-506", text: "2.0 oz Bourbon Whiskey & 0.5 oz Maple Syrup", category: "SPIRIT", correctSlot: null },
      { id: "t-507", text: "0.75 oz Sweet Vermouth & 2 Dashes Orange Bitters", category: "MODIFIER", correctSlot: null },
      { id: "t-508", text: "Built in Glass with Crushed Ice and Served with Straw", category: "TECHNIQUE", correctSlot: null },
      { id: "t-509", text: "Nick & Nora Glass with Brandied Cherry", category: "SERVICE", correctSlot: null },
      { id: "t-510", text: "4 Dashes Fee Brothers Celery Bitters", category: "BITTERS", correctSlot: null }
    ],

    hint: "Served NEAT in a pre-chilled rocks glass. The lemon peel's oils are expressed over the drink then discarded—never dropped into the glass.",
    lore: "Named after Sazerac de Forge et Fils Cognac, originally used in the French Quarter before phylloxera devastated French vineyards in the 1870s, prompting American bartenders to switch to Maryland/Pennsylvania rye whiskey."
  }
];

// Content Integrity Validation
(function validatePuzzleSchema() {
  if (!Array.isArray(COCKTAIL_PUZZLES) || COCKTAIL_PUZZLES.length === 0) {
    console.error("FATAL: COCKTAIL_PUZZLES array is missing or empty.");
    return;
  }
  const seenIds = new Set();
  COCKTAIL_PUZZLES.forEach((p, idx) => {
    if (!p.id || seenIds.has(p.id)) {
      console.warn(`Warning: Puzzle at index ${idx} has invalid or duplicate id '${p.id}'.`);
    }
    seenIds.add(p.id);
    if (!p.targetSlots || p.targetSlots.length !== 5) {
      console.warn(`Warning: Puzzle '${p.id}' does not define exactly 5 target slots.`);
    }
    if (!p.barRailPool || p.barRailPool.length < 5) {
      console.warn(`Warning: Puzzle '${p.id}' does not have enough bar rail tiles.`);
    }
  });
})();