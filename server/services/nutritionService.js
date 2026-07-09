/**
 * Comprehensive nutrition database (per 100g values)
 * Fields: calories(kcal), protein(g), carbs(g), fat(g), fiber(g), sugar(g),
 *         sodium(mg), vitaminA(µg), vitaminC(mg), vitaminD(µg), vitaminB12(µg),
 *         iron(mg), calcium(mg), potassium(mg)
 */
const NUTRITION_DB = {
  // ── GRAINS & CARBS ──
  'basmati rice':        { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, sugar: 0,   sodium: 1,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 0.2, calcium: 10,  potassium: 35  },
  'white rice':          { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, sugar: 0,   sodium: 1,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 0.2, calcium: 10,  potassium: 35  },
  'brown rice':          { calories: 111, protein: 2.6, carbs: 23.0, fat: 0.9, fiber: 1.8, sugar: 0,   sodium: 5,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 0.5, calcium: 10,  potassium: 79  },
  'rice':                { calories: 130, protein: 2.7, carbs: 28.2, fat: 0.3, fiber: 0.4, sugar: 0,   sodium: 1,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 0.2, calcium: 10,  potassium: 35  },
  'fried rice':          { calories: 163, protein: 3.5, carbs: 27.0, fat: 4.5, fiber: 0.7, sugar: 1.2, sodium: 400, vitaminA: 12,  vitaminC: 2,  vitaminD: 0,   vitaminB12: 0,   iron: 0.8, calcium: 12,  potassium: 80  },
  'biryani':             { calories: 160, protein: 6.0, carbs: 25.0, fat: 4.5, fiber: 0.8, sugar: 0.5, sodium: 350, vitaminA: 15,  vitaminC: 2,  vitaminD: 0,   vitaminB12: 0.2, iron: 1.0, calcium: 20,  potassium: 120 },
  'roti':                { calories: 297, protein: 9.0, carbs: 56.0, fat: 3.7, fiber: 4.5, sugar: 0.5, sodium: 5,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 3.0, calcium: 30,  potassium: 210 },
  'chapati':             { calories: 297, protein: 9.0, carbs: 56.0, fat: 3.7, fiber: 4.5, sugar: 0.5, sodium: 5,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 3.0, calcium: 30,  potassium: 210 },
  'naan bread':          { calories: 310, protein: 8.9, carbs: 52.0, fat: 7.3, fiber: 2.0, sugar: 3.0, sodium: 510, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 2.5, calcium: 50,  potassium: 120 },
  'naan':                { calories: 310, protein: 8.9, carbs: 52.0, fat: 7.3, fiber: 2.0, sugar: 3.0, sodium: 510, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 2.5, calcium: 50,  potassium: 120 },
  'paratha':             { calories: 300, protein: 7.5, carbs: 45.0, fat: 10.0, fiber: 3.0, sugar: 0.5, sodium: 15, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 2.8, calcium: 25,  potassium: 180 },
  'puri':                { calories: 385, protein: 7.5, carbs: 48.0, fat: 18.0, fiber: 2.0, sugar: 0.5, sodium: 250, vitaminA: 0,  vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 2.5, calcium: 20,  potassium: 120 },
  'pasta':               { calories: 158, protein: 5.8, carbs: 31.0, fat: 0.9, fiber: 1.8, sugar: 0.6, sodium: 6,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 1.3, calcium: 7,   potassium: 44  },
  'spaghetti':           { calories: 158, protein: 5.8, carbs: 31.0, fat: 0.9, fiber: 1.8, sugar: 0.6, sodium: 6,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 1.3, calcium: 7,   potassium: 44  },
  'bread':               { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7, sugar: 5.0, sodium: 491, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 3.0, calcium: 100, potassium: 130 },
  'white bread':         { calories: 265, protein: 9.0, carbs: 49.0, fat: 3.2, fiber: 2.7, sugar: 5.0, sodium: 491, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 3.0, calcium: 100, potassium: 130 },
  'oats':                { calories: 389, protein: 17.0, carbs: 66.0, fat: 7.0, fiber: 10.6, sugar: 0, sodium: 2,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 4.7, calcium: 54,  potassium: 429 },
  'oatmeal':             { calories: 71,  protein: 2.5, carbs: 12.0, fat: 1.5, fiber: 1.7, sugar: 0.1, sodium: 49,  vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 0.7, calcium: 10,  potassium: 61  },
  'quinoa':              { calories: 120, protein: 4.4, carbs: 21.3, fat: 1.9, fiber: 2.8, sugar: 0.9, sodium: 7,   vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 1.5, calcium: 17,  potassium: 172 },
  'idli':                { calories: 58,  protein: 2.0, carbs: 11.5, fat: 0.5, fiber: 0.5, sugar: 0.2, sodium: 150, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 0.5, calcium: 12,  potassium: 50  },
  'dosa':                { calories: 168, protein: 4.0, carbs: 28.0, fat: 4.5, fiber: 1.0, sugar: 0.3, sodium: 250, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 0,   iron: 1.0, calcium: 15,  potassium: 70  },
  'upma':                { calories: 155, protein: 4.5, carbs: 28.0, fat: 3.5, fiber: 2.0, sugar: 0.5, sodium: 350, vitaminA: 5,   vitaminC: 2,  vitaminD: 0,   vitaminB12: 0,   iron: 1.2, calcium: 20,  potassium: 120 },
  'poha':                { calories: 130, protein: 2.5, carbs: 27.0, fat: 1.5, fiber: 0.8, sugar: 0.3, sodium: 200, vitaminA: 5,   vitaminC: 5,  vitaminD: 0,   vitaminB12: 0,   iron: 1.5, calcium: 15,  potassium: 80  },

  // ── PROTEINS ──
  'chicken breast':      { calories: 165, protein: 31.0, carbs: 0,   fat: 3.6, fiber: 0, sugar: 0, sodium: 74,  vitaminA: 9,   vitaminC: 0,  vitaminD: 0.1, vitaminB12: 0.3, iron: 1.0, calcium: 15,  potassium: 256 },
  'grilled chicken breast': { calories: 165, protein: 31.0, carbs: 0, fat: 3.6, fiber: 0, sugar: 0, sodium: 74, vitaminA: 9,  vitaminC: 0,  vitaminD: 0.1, vitaminB12: 0.3, iron: 1.0, calcium: 15,  potassium: 256 },
  'chicken':             { calories: 165, protein: 31.0, carbs: 0,   fat: 3.6, fiber: 0, sugar: 0, sodium: 74,  vitaminA: 9,   vitaminC: 0,  vitaminD: 0.1, vitaminB12: 0.3, iron: 1.0, calcium: 15,  potassium: 256 },
  'butter chicken':      { calories: 150, protein: 14.0, carbs: 7.0, fat: 7.5, fiber: 1.0, sugar: 3.5, sodium: 380, vitaminA: 50, vitaminC: 8, vitaminD: 0, vitaminB12: 0.5, iron: 1.5, calcium: 40,  potassium: 280 },
  'chicken tikka masala':{ calories: 155, protein: 15.0, carbs: 7.0, fat: 8.0, fiber: 1.0, sugar: 4.0, sodium: 400, vitaminA: 60, vitaminC: 10, vitaminD: 0, vitaminB12: 0.5, iron: 1.8, calcium: 45, potassium: 290 },
  'tandoori chicken':    { calories: 180, protein: 27.0, carbs: 3.0, fat: 6.5, fiber: 0.5, sugar: 1.5, sodium: 350, vitaminA: 30, vitaminC: 5, vitaminD: 0.1, vitaminB12: 0.4, iron: 1.2, calcium: 20, potassium: 260 },
  'beef':                { calories: 250, protein: 26.0, carbs: 0,   fat: 15.0, fiber: 0, sugar: 0, sodium: 72, vitaminA: 0,   vitaminC: 0,  vitaminD: 0,   vitaminB12: 2.1, iron: 2.7, calcium: 12,  potassium: 318 },
  'fish':                { calories: 136, protein: 24.0, carbs: 0,   fat: 4.0, fiber: 0, sugar: 0, sodium: 61,  vitaminA: 30,  vitaminC: 0,  vitaminD: 5.0, vitaminB12: 3.2, iron: 0.8, calcium: 35,  potassium: 430 },
  'salmon':              { calories: 208, protein: 20.0, carbs: 0,   fat: 13.4, fiber: 0, sugar: 0, sodium: 59, vitaminA: 47,  vitaminC: 3,  vitaminD: 9.4, vitaminB12: 3.2, iron: 0.8, calcium: 9,   potassium: 363 },
  'tuna':                { calories: 144, protein: 30.0, carbs: 0,   fat: 1.0, fiber: 0, sugar: 0, sodium: 47,  vitaminA: 18,  vitaminC: 0,  vitaminD: 0,   vitaminB12: 2.5, iron: 1.0, calcium: 9,   potassium: 313 },
  'egg':                 { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0, sugar: 1.1, sodium: 124, vitaminA: 149, vitaminC: 0, vitaminD: 1.1, vitaminB12: 0.9, iron: 1.8, calcium: 56, potassium: 138 },
  'eggs':                { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0, sugar: 1.1, sodium: 124, vitaminA: 149, vitaminC: 0, vitaminD: 1.1, vitaminB12: 0.9, iron: 1.8, calcium: 56, potassium: 138 },
  'boiled egg':          { calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, fiber: 0, sugar: 1.1, sodium: 124, vitaminA: 149, vitaminC: 0, vitaminD: 1.1, vitaminB12: 0.9, iron: 1.8, calcium: 56, potassium: 138 },
  'paneer':              { calories: 265, protein: 18.0, carbs: 3.4, fat: 20.0, fiber: 0, sugar: 0, sodium: 27,  vitaminA: 185, vitaminC: 0,  vitaminD: 0.2, vitaminB12: 0.4, iron: 0.2, calcium: 480, potassium: 55 },
  'paneer tikka':        { calories: 300, protein: 20.0, carbs: 6.0, fat: 21.0, fiber: 0.5, sugar: 2.0, sodium: 350, vitaminA: 150, vitaminC: 5, vitaminD: 0.2, vitaminB12: 0.4, iron: 0.5, calcium: 450, potassium: 100 },
  'tofu':                { calories: 76,  protein: 8.0, carbs: 1.9, fat: 4.8, fiber: 0.3, sugar: 0.6, sodium: 7,   vitaminA: 0,   vitaminC: 0.1, vitaminD: 0, vitaminB12: 0,  iron: 1.5, calcium: 350, potassium: 121 },
  'lentils':             { calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2,  vitaminA: 1,   vitaminC: 1.5, vitaminD: 0, vitaminB12: 0,  iron: 3.3, calcium: 19,  potassium: 369 },
  'dal':                 { calories: 116, protein: 9.0, carbs: 20.0, fat: 0.4, fiber: 7.9, sugar: 1.8, sodium: 2,  vitaminA: 1,   vitaminC: 1.5, vitaminD: 0, vitaminB12: 0,  iron: 3.3, calcium: 19,  potassium: 369 },
  'dal tadka':           { calories: 115, protein: 7.5, carbs: 16.0, fat: 3.0, fiber: 5.0, sugar: 1.5, sodium: 300, vitaminA: 20,  vitaminC: 4,  vitaminD: 0,   vitaminB12: 0,   iron: 2.5, calcium: 30,  potassium: 350 },
  'dal makhani':         { calories: 150, protein: 8.0, carbs: 18.0, fat: 5.0, fiber: 6.0, sugar: 2.0, sodium: 350, vitaminA: 30,  vitaminC: 5,  vitaminD: 0,   vitaminB12: 0.1, iron: 3.0, calcium: 60,  potassium: 400 },
  'rajma':               { calories: 127, protein: 8.7, carbs: 22.8, fat: 0.5, fiber: 6.4, sugar: 0.3, sodium: 240, vitaminA: 0,   vitaminC: 2,  vitaminD: 0,   vitaminB12: 0,   iron: 2.2, calcium: 50,  potassium: 420 },
  'chole':               { calories: 164, protein: 8.9, carbs: 27.0, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 400, vitaminA: 5,   vitaminC: 1,  vitaminD: 0,   vitaminB12: 0,   iron: 2.9, calcium: 57,  potassium: 291 },
  'chickpeas':           { calories: 164, protein: 8.9, carbs: 27.0, fat: 2.6, fiber: 7.6, sugar: 4.8, sodium: 7,   vitaminA: 5,   vitaminC: 1,  vitaminD: 0,   vitaminB12: 0,   iron: 2.9, calcium: 57,  potassium: 291 },

  // ── VEGETABLES ──
  'mixed salad':         { calories: 20,  protein: 1.5, carbs: 3.5, fat: 0.3, fiber: 1.5, sugar: 2.0, sodium: 20,  vitaminA: 120, vitaminC: 15, vitaminD: 0,   vitaminB12: 0,   iron: 0.8, calcium: 35,  potassium: 220 },
  'salad':               { calories: 20,  protein: 1.5, carbs: 3.5, fat: 0.3, fiber: 1.5, sugar: 2.0, sodium: 20,  vitaminA: 120, vitaminC: 15, vitaminD: 0,   vitaminB12: 0,   iron: 0.8, calcium: 35,  potassium: 220 },
  'broccoli':            { calories: 34,  protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33,  vitaminA: 77,  vitaminC: 89, vitaminD: 0,   vitaminB12: 0,   iron: 0.7, calcium: 47,  potassium: 316 },
  'steamed broccoli':    { calories: 34,  protein: 2.8, carbs: 7.0, fat: 0.4, fiber: 2.6, sugar: 1.7, sodium: 33,  vitaminA: 77,  vitaminC: 89, vitaminD: 0,   vitaminB12: 0,   iron: 0.7, calcium: 47,  potassium: 316 },
  'spinach':             { calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79,  vitaminA: 469, vitaminC: 28, vitaminD: 0,   vitaminB12: 0,   iron: 2.7, calcium: 99,  potassium: 558 },
  'palak':               { calories: 23,  protein: 2.9, carbs: 3.6, fat: 0.4, fiber: 2.2, sugar: 0.4, sodium: 79,  vitaminA: 469, vitaminC: 28, vitaminD: 0,   vitaminB12: 0,   iron: 2.7, calcium: 99,  potassium: 558 },
  'palak paneer':        { calories: 190, protein: 11.0, carbs: 7.0, fat: 13.0, fiber: 2.0, sugar: 2.0, sodium: 300, vitaminA: 250, vitaminC: 20, vitaminD: 0.1, vitaminB12: 0.3, iron: 2.0, calcium: 280, potassium: 350 },
  'potato':              { calories: 77,  protein: 2.0, carbs: 17.5, fat: 0.1, fiber: 2.2, sugar: 0.8, sodium: 6,   vitaminA: 0,   vitaminC: 20, vitaminD: 0,   vitaminB12: 0,   iron: 0.8, calcium: 12,  potassium: 421 },
  'tomato':              { calories: 18,  protein: 0.9, carbs: 3.9, fat: 0.2, fiber: 1.2, sugar: 2.6, sodium: 5,   vitaminA: 42,  vitaminC: 14, vitaminD: 0,   vitaminB12: 0,   iron: 0.3, calcium: 10,  potassium: 237 },
  'onion':               { calories: 40,  protein: 1.1, carbs: 9.3, fat: 0.1, fiber: 1.7, sugar: 4.2, sodium: 4,   vitaminA: 0,   vitaminC: 7,  vitaminD: 0,   vitaminB12: 0,   iron: 0.2, calcium: 23,  potassium: 146 },
  'carrot':              { calories: 41,  protein: 0.9, carbs: 10.0, fat: 0.2, fiber: 2.8, sugar: 4.7, sodium: 69,  vitaminA: 835, vitaminC: 6,  vitaminD: 0,   vitaminB12: 0,   iron: 0.3, calcium: 33,  potassium: 320 },
  'cucumber':            { calories: 15,  protein: 0.7, carbs: 3.6, fat: 0.1, fiber: 0.5, sugar: 1.7, sodium: 2,   vitaminA: 5,   vitaminC: 2,  vitaminD: 0,   vitaminB12: 0,   iron: 0.3, calcium: 16,  potassium: 147 },
  'capsicum':            { calories: 31,  protein: 1.0, carbs: 6.0, fat: 0.3, fiber: 2.1, sugar: 4.2, sodium: 4,   vitaminA: 157, vitaminC: 128, vitaminD: 0,  vitaminB12: 0,   iron: 0.4, calcium: 7,   potassium: 211 },
  'peas':                { calories: 81,  protein: 5.4, carbs: 14.5, fat: 0.4, fiber: 5.1, sugar: 5.7, sodium: 5,   vitaminA: 38,  vitaminC: 40, vitaminD: 0,   vitaminB12: 0,   iron: 1.5, calcium: 25,  potassium: 244 },
  'corn':                { calories: 86,  protein: 3.2, carbs: 19.0, fat: 1.2, fiber: 2.7, sugar: 3.2, sodium: 15,  vitaminA: 11,  vitaminC: 6,  vitaminD: 0,   vitaminB12: 0,   iron: 0.5, calcium: 2,   potassium: 270 },

  // ── FRUITS ──
  'apple':               { calories: 52,  protein: 0.3, carbs: 14.0, fat: 0.2, fiber: 2.4, sugar: 10.4, sodium: 1,  vitaminA: 3,   vitaminC: 5,  vitaminD: 0,   vitaminB12: 0,   iron: 0.1, calcium: 6,   potassium: 107 },
  'banana':              { calories: 89,  protein: 1.1, carbs: 23.0, fat: 0.3, fiber: 2.6, sugar: 12.2, sodium: 1,  vitaminA: 3,   vitaminC: 9,  vitaminD: 0,   vitaminB12: 0,   iron: 0.3, calcium: 5,   potassium: 358 },
  'mango':               { calories: 60,  protein: 0.8, carbs: 15.0, fat: 0.4, fiber: 1.6, sugar: 13.7, sodium: 1,  vitaminA: 54,  vitaminC: 36, vitaminD: 0,   vitaminB12: 0,   iron: 0.2, calcium: 11,  potassium: 168 },
  'orange':              { calories: 47,  protein: 0.9, carbs: 12.0, fat: 0.1, fiber: 2.4, sugar: 9.4, sodium: 0,   vitaminA: 11,  vitaminC: 53, vitaminD: 0,   vitaminB12: 0,   iron: 0.1, calcium: 40,  potassium: 181 },
  'grapes':              { calories: 69,  protein: 0.7, carbs: 18.0, fat: 0.2, fiber: 0.9, sugar: 15.5, sodium: 2,  vitaminA: 3,   vitaminC: 11, vitaminD: 0,   vitaminB12: 0,   iron: 0.4, calcium: 10,  potassium: 191 },
  'watermelon':          { calories: 30,  protein: 0.6, carbs: 7.6, fat: 0.2, fiber: 0.4, sugar: 6.2, sodium: 1,   vitaminA: 28,  vitaminC: 8,  vitaminD: 0,   vitaminB12: 0,   iron: 0.2, calcium: 7,   potassium: 112 },
  'strawberry':          { calories: 32,  protein: 0.7, carbs: 7.7, fat: 0.3, fiber: 2.0, sugar: 4.9, sodium: 1,   vitaminA: 1,   vitaminC: 59, vitaminD: 0,   vitaminB12: 0,   iron: 0.4, calcium: 16,  potassium: 153 },

  // ── DAIRY ──
  'milk':                { calories: 61,  protein: 3.2, carbs: 4.8, fat: 3.3, fiber: 0, sugar: 5.1, sodium: 43,  vitaminA: 46,  vitaminC: 0,  vitaminD: 1.2, vitaminB12: 0.4, iron: 0.1, calcium: 113, potassium: 150 },
  'curd':                { calories: 61,  protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46,  vitaminA: 27,  vitaminC: 0,  vitaminD: 0.1, vitaminB12: 0.4, iron: 0.1, calcium: 121, potassium: 155 },
  'yogurt':              { calories: 61,  protein: 3.5, carbs: 4.7, fat: 3.3, fiber: 0, sugar: 4.7, sodium: 46,  vitaminA: 27,  vitaminC: 0,  vitaminD: 0.1, vitaminB12: 0.4, iron: 0.1, calcium: 121, potassium: 155 },
  'raita':               { calories: 45,  protein: 2.5, carbs: 4.0, fat: 2.0, fiber: 0.3, sugar: 3.5, sodium: 180, vitaminA: 10,  vitaminC: 2,  vitaminD: 0.1, vitaminB12: 0.3, iron: 0.1, calcium: 100, potassium: 130 },
  'cheese':              { calories: 402, protein: 25.0, carbs: 1.3, fat: 33.0, fiber: 0, sugar: 0.5, sodium: 621, vitaminA: 265, vitaminC: 0,  vitaminD: 0.6, vitaminB12: 1.1, iron: 0.7, calcium: 721, potassium: 98  },
  'butter':              { calories: 717, protein: 0.9, carbs: 0.1, fat: 81.0, fiber: 0, sugar: 0.1, sodium: 11,  vitaminA: 684, vitaminC: 0,  vitaminD: 1.5, vitaminB12: 0.2, iron: 0.0, calcium: 24,  potassium: 24  },

  // ── SNACKS & FAST FOOD ──
  'pizza':               { calories: 266, protein: 11.0, carbs: 33.0, fat: 10.0, fiber: 2.3, sugar: 3.6, sodium: 598, vitaminA: 50, vitaminC: 2, vitaminD: 0, vitaminB12: 0.5, iron: 2.5, calcium: 188, potassium: 172 },
  'burger':              { calories: 295, protein: 17.0, carbs: 24.0, fat: 14.0, fiber: 1.3, sugar: 5.0, sodium: 497, vitaminA: 20, vitaminC: 1, vitaminD: 0, vitaminB12: 1.0, iron: 2.5, calcium: 80,  potassium: 220 },
  'samosa':              { calories: 308, protein: 5.5, carbs: 35.0, fat: 16.0, fiber: 3.0, sugar: 1.0, sodium: 400, vitaminA: 10, vitaminC: 5, vitaminD: 0, vitaminB12: 0,   iron: 1.5, calcium: 30,  potassium: 200 },
  'pakora':              { calories: 280, protein: 7.0, carbs: 30.0, fat: 15.0, fiber: 3.0, sugar: 1.0, sodium: 450, vitaminA: 20, vitaminC: 5, vitaminD: 0, vitaminB12: 0,   iron: 1.8, calcium: 40,  potassium: 180 },
  'chips':               { calories: 536, protein: 7.0, carbs: 53.0, fat: 35.0, fiber: 3.8, sugar: 0.5, sodium: 525, vitaminA: 0,  vitaminC: 9, vitaminD: 0, vitaminB12: 0,   iron: 1.0, calcium: 17,  potassium: 1642},
  'french fries':        { calories: 312, protein: 3.4, carbs: 41.0, fat: 15.0, fiber: 3.8, sugar: 0.3, sodium: 210, vitaminA: 0,  vitaminC: 6, vitaminD: 0, vitaminB12: 0,   iron: 0.7, calcium: 11,  potassium: 579 },

  // ── BEVERAGES ──
  'tea':                 { calories: 2,   protein: 0,   carbs: 0.4, fat: 0,   fiber: 0, sugar: 0, sodium: 3,  vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, iron: 0, calcium: 0, potassium: 37  },
  'chai':                { calories: 40,  protein: 1.5, carbs: 5.5, fat: 1.5, fiber: 0, sugar: 5.0, sodium: 30, vitaminA: 20, vitaminC: 0, vitaminD: 0, vitaminB12: 0.1, iron: 0.1, calcium: 60, potassium: 80 },
  'coffee':              { calories: 2,   protein: 0.3, carbs: 0,   fat: 0,   fiber: 0, sugar: 0, sodium: 5,  vitaminA: 0, vitaminC: 0, vitaminD: 0, vitaminB12: 0, iron: 0.1, calcium: 5, potassium: 50  },
  'orange juice':        { calories: 45,  protein: 0.7, carbs: 10.0, fat: 0.2, fiber: 0.2, sugar: 8.4, sodium: 1, vitaminA: 5, vitaminC: 50, vitaminD: 0, vitaminB12: 0, iron: 0.2, calcium: 11, potassium: 200 },
  'lassi':               { calories: 70,  protein: 3.5, carbs: 9.0, fat: 2.5, fiber: 0, sugar: 8.5, sodium: 60, vitaminA: 30, vitaminC: 1, vitaminD: 0.1, vitaminB12: 0.3, iron: 0.1, calcium: 130, potassium: 180 },
};

/**
 * Fuzzy-match a food name to the database
 */
function findNutrition(foodName) {
  const name = foodName.toLowerCase().trim();
  
  // Exact match
  if (NUTRITION_DB[name]) return NUTRITION_DB[name];
  
  // Partial match (find best)
  let best = null, bestScore = 0;
  for (const key of Object.keys(NUTRITION_DB)) {
    const score = calcMatchScore(name, key);
    if (score > bestScore) { bestScore = score; best = key; }
  }
  
  if (bestScore > 0.4) return NUTRITION_DB[best];
  
  // Generic fallback by category keywords
  if (/rice|biryani/.test(name)) return NUTRITION_DB['rice'];
  if (/chicken/.test(name)) return NUTRITION_DB['chicken'];
  if (/bread|naan|roti|chapati/.test(name)) return NUTRITION_DB['roti'];
  if (/dal|lentil/.test(name)) return NUTRITION_DB['dal'];
  if (/vegetable|sabzi|curry/.test(name)) return NUTRITION_DB['mixed salad'];
  if (/salad/.test(name)) return NUTRITION_DB['mixed salad'];
  if (/fruit/.test(name)) return NUTRITION_DB['apple'];
  if (/milk|curd|yogurt/.test(name)) return NUTRITION_DB['yogurt'];
  if (/egg/.test(name)) return NUTRITION_DB['egg'];
  
  // Default generic food entry
  return { calories: 120, protein: 4.0, carbs: 18.0, fat: 3.5, fiber: 1.5, sugar: 2.0, sodium: 150, vitaminA: 10, vitaminC: 5, vitaminD: 0, vitaminB12: 0, iron: 0.5, calcium: 20, potassium: 150 };
}

function calcMatchScore(query, key) {
  if (key === query) return 1;
  if (key.includes(query) || query.includes(key)) return 0.8;
  const qWords = query.split(' ');
  const kWords = key.split(' ');
  const common = qWords.filter(w => kWords.includes(w) && w.length > 2);
  return common.length / Math.max(qWords.length, kWords.length);
}

/**
 * Enrich food items with nutrition data scaled to portion size
 */
function enrichFoodsWithNutrition(foods) {
  return foods.map(food => {
    const per100g = findNutrition(food.name);
    const factor = (food.portion_g || 100) / 100;
    const nutrition = {};
    Object.entries(per100g).forEach(([k, v]) => {
      nutrition[k] = Math.round(v * factor * 10) / 10;
    });
    return { ...food, nutrition };
  });
}

module.exports = { enrichFoodsWithNutrition, findNutrition, NUTRITION_DB };
