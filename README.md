# 🥗 NutriScan

NutriScan is a full-stack, AI-powered progressive web application designed to help you track your daily nutrition effortlessly. By leveraging Google Gemini Vision AI, NutriScan allows you to simply snap a photo of your food, and it automatically identifies the meal, estimates portion sizes, and provides a detailed macro and micro nutritional breakdown.

## ✨ Key Features

- **📸 AI Food Recognition**: Upload or snap a photo of your meal. The app uses Google Gemini 1.5 Flash to identify food items, estimate portions (in grams), and provide confidence scores.
- **📊 Comprehensive Dashboard**: Track your daily calories, protein, carbs, fat, and fiber with dynamic, interactive radial progress rings.
- **🖨️ PDF Report Generation**: Export beautiful, print-ready PDF reports of your daily nutrition summary with a single click.
- **🌍 Multilingual Support**: Fully translated into English, Hindi, Spanish, French, German, Arabic, Portuguese, Japanese, and Chinese.
- **⚖️ Advanced Health Tools**: Built-in BMI calculator, TDEE (Total Daily Energy Expenditure) estimator, and automatic macronutrient goal setting based on your body metrics (supporting both Feet and Centimeters).
- **🌙 Dark/Light Themes**: A sleek, premium glassmorphism design system that supports seamless transitions between dark and light modes.
- **💧 Hydration Tracking**: Log your daily water intake with quick-add buttons and visual progress tracking.
- **📈 Analytics & History**: View a 7-day calorie trend chart, track consecutive day streaks, and export your entire meal history to a CSV file.
- **🔔 Notifications & Reminders**: Configurable browser notifications to remind you to log your meals.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+ installed
- **MongoDB** installed locally (or MongoDB Atlas URI)
- **Google Gemini API Key** (for AI vision features)

### Installation

**Option 1: Quick Setup (Windows)**
Simply double-click `setup.bat` in the root folder to install all dependencies automatically.

**Option 2: Manual Setup**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### Running the App

**Option 1: Using Batch Files (Windows)**
1. Double-click `start-server.bat` to launch the backend API on port 5000.
2. Double-click `start-client.bat` to launch the Vite frontend on port 5173.

**Option 2: Using Terminal**
```bash
# Terminal 1 — Backend
cd server
npm run dev

# Terminal 2 — Frontend  
cd client
npm run dev
```
Then, open **http://localhost:5173** in your web browser.

> ⚠️ **Note:** MongoDB must be running before starting the backend server. Run `mongod` in a terminal or start MongoDB Compass.

---

## 🏗️ Architecture Stack

**Frontend:**
- **React.js (Vite)**
- **Zustand** (Global state management)
- **React Router v6** (Navigation)
- **Framer Motion** (Micro-animations and transitions)
- **Recharts** (Data visualization & radial rings)
- **i18next** (Internationalization)
- **Vanilla CSS** (Custom glassmorphism design system)

**Backend:**
- **Node.js & Express** (RESTful API)
- **MongoDB & Mongoose** (Database schemas & models)
- **Google Generative AI SDK** (Gemini Vision API integration)
- **JSON Web Tokens (JWT)** (Secure authentication)
- **Multer** (Image upload handling)

---

## 🔑 Core API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login and receive JWT token |
| GET | `/api/auth/me` | Fetch authenticated user data |
| POST | `/api/meals/scan` | **AI food recognition** (accepts image/jpeg, image/png) |
| POST | `/api/meals` | Save a confirmed meal to the database |
| GET | `/api/meals` | Fetch complete meal history |
| GET | `/api/meals/today` | Fetch today's logged meals |
| DELETE | `/api/meals/:id` | Delete a specific meal entry |
| GET | `/api/dashboard/today` | Fetch today's aggregated nutrition summary |
| GET | `/api/dashboard/weekly` | Fetch 7-day trend data for charts |
| GET | `/api/dashboard/stats` | Fetch all-time stats and current day streak |

---

## 🥗 Built-in Nutrition Database

NutriScan includes a fallback built-in database of 80+ common foods for blazing fast lookup and offline development. It covers:
- **Global Cuisine**: Chicken, salmon, pasta, pizza, salads, fruits, and dairy.
- **Indian Cuisine**: Rice, roti, dal, biryani, butter chicken, paneer, samosa, chai, and lassi.
- **Detailed Metrics**: Every item includes per-100g values for calories, protein, carbs, fat, fiber, sugar, sodium, vitamins (A/C/D/B12), iron, calcium, and potassium.

## ⚙️ Environment Variables (`server/.env`)

Create a `.env` file in the `server` directory with the following variables:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/nutrition-scanner
JWT_SECRET=your_super_secret_jwt_key
GEMINI_API_KEY=your_google_gemini_api_key
CLIENT_URL=http://localhost:5173
```
