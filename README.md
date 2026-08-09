# 🥗 NutriScan — Futuristic AI-Powered Nutrition App & Game Arcade

NutriScan is a full-stack, AI progressive web application designed to track nutrition, analyze meals, and turn health consistency into an addictive gamified experience. Built with an Apple-level glassmorphism design system, clean white + emerald green (`#00f5a0`) + deep onyx black styling, smooth micro-interactions, and powered by Google Gemini Vision AI.

---

## ✨ 10 Core Screens & Feature Suite

### 1. 📸 AI AR Camera Scanner (`/scanner`)
- **Neural Vision AR Camera Overlay**: Full-screen scanning laser reticle with 3D bounding box ingredient detection.
- **Real-Time Confidence Score**: Instant 98.4% precision detection rating with ingredient segmentation (Salmon, Quinoa, Asparagus).
- **Macro & Micro Ticker**: Real-time calorie estimation, protein, carbs, fats, fiber, vitamins breakdown, and hydration impact rating.
- **Mode Switcher**: Easily switch between Food Scan, Refrigerator Scan, and Restaurant Menu Scan modes.

### 2. 📊 Futuristic Dashboard & AI Health Score (`/dashboard`)
- **Hero Calorie Liquid Ring**: Dynamic radial gauge showing calorie intake vs. remaining allowance.
- **Macro Ring Arcs**: High-precision SVG progress arcs for Protein, Carbs, Fats, and Fiber.
- **Hydration Tracker**: Water fluid height animation with quick `+250ml` glass log buttons.
- **AI Health Score Badge**: Live 94/100 health score with pulsing emerald aura and personalized nutrition alerts.
- **Streak & Weight Progress Widget**: 🔥 14-day streak indicator, BMI metrics (-2.4 kg progress), and quick floating scan button.

### 3. 🥗 Meal Details & Interactive Portion Slider (`/meal-details`)
- **Food Photo Hero View**: High-resolution image card with zoom and scan metadata.
- **Interactive Portion Slider**: Adjust weight from 50g to 800g; dynamically scales calories, protein, carbs, fats, fiber, sugars, and sodium in real time.
- **Glycemic Index (GI) Gauge**: Low GI (38) classification with slow & steady energy release explanation.
- **Allergen & Safety Badges**: Gluten-Free, Dairy-Free, Nut-Free, and Low FODMAP indicators.
- **Micronutrient Grid**: Detailed breakdown of Vitamin A, C, D, B12, Iron, Calcium, Potassium, Magnesium, and Zinc.
- **Actionable AI Digestion Tips**: Custom AI health suggestions (e.g., pairing citrus with non-heme iron).

### 4. 🤖 AI Smart Coach & Voice Assistant (`/coach`)
- **Conversational AI Nutrition Advisor**: Natural language chat powered by Gemini AI with full awareness of your nutrition history.
- **Voice Assistant Mode**: Live voice mode with animated audio frequency wave bars and microphone recording state.
- **Suggested AI Prompts**: Quick pills ("Post-workout meal?", "2000 kcal keto plan", "Is avocado good for keto?").
- **Voice Speech Synthesis (TTS)**: Spoken AI feedback for hands-free meal planning.

### 5. 🧊 Refrigerator Content Scanner & AI Chef (`/fridge`)
- **Fridge Photo AI Scan**: Automatic ingredient tagger (Eggs, Spinach, Chicken Breast, Greek Yogurt, Peppers, Mushrooms).
- **Remaining Daily Macro Caps**: Custom slider controls for target calorie limits and minimum protein goals.
- **AI Recipe Generator**: Instant step-by-step recipe generation with difficulty ratings, cook times, and 1-click meal logging.

### 6. 📜 Restaurant Menu Scanner & Green Choices (`/menu`)
- **Restaurant Menu OCR Photo Scanner**: Scan any digital or paper menu.
- **Target Goal Filters**: Filter menu items by *High Protein (>35g)*, *Low Carb / Keto (<15g)*, and *Calorie Deficit (<500 kcal)*.
- **Green Pick Overlays**: Highlights the healthiest choices in emerald green and flags ultra-processed high-sodium options with warnings.

### 7. 📝 Nutrition Timeline & Mood Feed (`/history`)
- **Photo Meal Stream**: Visual chronological log of all scanned meals with date filtering.
- **Mood & Energy Level Tracker**: Log post-meal feelings (⚡ Energized, 😴 Sluggish, 😊 Satisfied).
- **Exercise & Water Sync**: Consolidated view of daily calories burned vs. consumed.

### 8. 📈 Interactive Analytics & Micro Radar (`/analytics`)
- **Recharts Data Visualizations**: 7-day and 30-day calorie trend charts, macro ratio pie charts, micronutrient completion radar, sleep/activity correlation charts, and monthly score progress trajectories.

### 9. 👥 Social, Battles & 8K Report Cards (`/social`)
- **Shareable 8K Report Card Generator**: Exportable digital snapshot card featuring user streak, global rank, total protein, and AI score.
- **1-on-1 Streak Battles**: Challenge friends to maintain daily logging streaks (You vs Friends 🔥 14 vs 12 days).
- **Achievement Badges Wall**: Unlockable badges (*Macro Master*, *Hydration Legend*, *Fiber Titan*, *Century Scanner*).
- **Weekly Community Challenges**: Community goals like *7-Day No Refined Sugar* and *30g Fiber Daily Sprint*.

### 10. 👤 Profile, Wearables & Medical Mode (`/profile`)
- **Body Metric & TDEE Calculator**: BMR and TDEE automatic goal setting based on height, weight, age, and activity level.
- **Connected Health Wearables**: Integration cards for Apple Health, Garmin Connect, and Oura Ring.
- **Medical Tracking Mode**: Toggle special clinical protocols (*Type 1 / Type 2 Diabetic Mode*, *Renal Kidney Protocol*, *DASH Anti-Hypertension Protocol*).
- **Themes & Multilingual Picker**: Seamless theme switching (Dark Onyx / Emerald Light / Cyberpunk) and 9+ languages (English, Spanish, Hindi, French, German, Arabic, etc.).

---

## ⚡ 2027 Breakthrough Innovations

- **🩸 Continuous Glucose & Gut Microbiome Spike Predictor ("Bio-Predictor")**: Predicts glucose curve peaks (`118 mg/dL - Safe Zone`) and digestion velocity without blood needles.
- **🔮 3D Macro Morph & Recipe Swap Engine**: 1-click transformation of high-carb meals into clean 40g+ protein power bowls.
- **📸 AR Neural Laser Reticle**: Futuristic camera HUD overlay with live target lock and bounding box tracking.

---

## 🎮 Health Gamification Arcade (`/game`)

- **🦊 AI Bio-Companion Avatar ("Emerald Spark")**: Live holographic pet living on your Dashboard that evolves through 4 stages (*Baby Sprout 🌿 -> Emerald Spark 🦊 -> Cyber Lynx 🐆 -> Astra Phoenix 🦅*) based on your meal logging consistency.
- **📜 Daily Quest System**: Earn XP and NutriCredits (💎) by completing daily health missions.
- **🎁 Daily Bio-Cube Gacha Loot Unboxing**: Spend NutriCredits to spin the wheel for rare golden pet skins, 2X XP boosters, and meal vouchers.
- **👹 Global Community Boss Raid ("Sugar Kraken")**: 100,000 HP boss raid where every zero-sugar meal logged by players worldwide deals -250 damage to the Sugar Kraken!

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** installed locally (or MongoDB Atlas URI)
- **Google Gemini API Key** (for AI vision features)

### Installation & Setup

```bash
# 1. Clone repository
git clone https://github.com/your-username/nutriscan.git
cd nutriscan

# 2. Install all dependencies
npm run install-all

# 3. Configure environment variables
# Create server/.env file:
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrition-scanner
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key

# 4. Start backend & frontend concurrently
npm run dev
```

Open **http://localhost:5173** in your browser!

---

## 🏗️ Technical Architecture Stack

**Frontend:**
- **React.js (Vite)**
- **Zustand** (Global state management)
- **React Router v6** (Multi-screen navigation)
- **Framer Motion** (Micro-animations, liquid rings, AR reticle)
- **Recharts** (Data visualization, radial gauges & micro radar)
- **Vanilla CSS** (Custom 2027 Glassmorphism Design System)

**Backend:**
- **Node.js & Express** (RESTful API endpoints)
- **MongoDB & Mongoose** (Schemas, user metrics & meal history)
- **Google Generative AI SDK** (Gemini 1.5 Flash Vision API)
- **JWT & Clerk Authentication** (Secure session management)
