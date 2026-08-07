# ⚡ NutriPulse - Calorie Tracker & Macro Dashboard

> **Quantiphi Vibe Coding Assessment Project**  
> A full-stack health-tracking web application that serves as a daily food journal, calculates nutritional intake in real time, manages strict calorie budgets, and visually warns users upon overeating.

---

## 🌟 Key Features

* **⚡ Visual Calorie & Macro Dashboard:**
  * **Daily Calorie Budget Meter:** Large progress bar showing consumed calories vs. daily budget with dynamic status colors:
    * 🟢 **Calming Blue/Green Gradient:** Safe intake zone.
    * 🔴 **Crimson Red Warning:** Budget exceeded zone.
  * **Macronutrient Breakdown:** 3 dedicated progress meters for **Protein**, **Carbohydrates**, and **Fats**.

* **🎯 Dynamic Fitness Goal Toggle:**
  * Instant switching between **Weight Loss** (1,800 kcal), **Maintenance** (2,200 kcal), and **Muscle Gain** (2,800 kcal).
  * **Zero Data Loss:** Updating the goal instantly recalculates progress percentages on the server without erasing previously logged meals.

* **📸 Real Gemini AI Vision Photo Scanner & Custom Food Estimator:**
  * **AI Food Scanner:** Upload any food image file (JPG, PNG, WEBP) to have **Google Gemini AI Vision** identify the dish, estimate portion weight, and calculate macronutrients automatically.
  * **Custom Dish AI Estimator:** Enter any custom dish (e.g. *Paneer Butter Masala*, *Chicken Biryani*) and the backend queries Gemini AI for standard per-100g nutritional breakdowns.
  * **Custom Macro Override:** Optional collapsible inputs for manual per-100g nutrient specification.

* **📋 Daily History Grid & Real-Time Item Deletion:**
  * Interactive meal log showing food name, portion weight, calories, and macros per row.
  * **Trash Icon Delete Button (`🗑️`):** Deleting a meal item sends a real-time request to the server, instantly lowering top progress bars and restoring budget status.

* **⚠️ "Daily Budget Exceeded!" Warning Modal:**
  * When a newly added meal causes total calories to cross the active goal limit, a glassmorphic pop-up modal alerts the user with exact overage stats.

---

## 🏗️ Architecture & Technology Stack

Following strict assessment guidelines, **all business logic, nutrient scaling computations, and aggregate state calculations take place on the server side**, while the frontend handles presentation and user interaction.

```
                  ┌─────────────────────────────────────────┐
                  │          React Frontend (Vite)          │
                  │   - Fitness Goal Toggle                 │
                  │   - Visual Calorie & Macro Dashboard    │
                  │   - Food Logging & Image Upload Form    │
                  │   - Daily Meal History Grid             │
                  └────────────────────┬────────────────────┘
                                       │ REST API Requests
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │          Express.js Backend             │
                  │   - Meal State Store (In-Memory)        │
                  │   - Nutrient Scaling Engine             │
                  │   - Budget Validation Aggregator        │
                  │   - Gemini AI Vision Integration        │
                  └────────────────────┬────────────────────┘
                                       │
                                       ▼
                  ┌─────────────────────────────────────────┐
                  │      Google Gemini AI Vision API        │
                  └─────────────────────────────────────────┘
```

* **Frontend:** React (Vite), Vanilla CSS (Custom Glassmorphic Design System), Google Fonts (Outfit & Inter).
* **Backend:** Node.js, Express.js, Cors, Multer.
* **AI SDK:** `@google/genai` (Gemini 3 Flash & 2.0 Flash fallback).

---

## 🧮 Nutrient Scaling Algorithm

Nutritional values are calculated dynamically relative to a standard 100g baseline using the server-side scaling formula:

$$\text{Nutrient Value} = \frac{\text{Baseline Value (per 100g)} \times \text{Portion Weight (g)}}{100}$$

---

## 📡 REST API Endpoints

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/summary` | Fetches daily summary (totals, targets, percentages, `budgetExceeded` flag). |
| `POST` | `/api/meals` | Logs a meal item and performs server-side nutrient scaling. |
| `DELETE` | `/api/meals/:id` | Deletes a meal item by ID and recalculates totals in real time. |
| `DELETE` | `/api/meals` | Clears all logged meals for the day. |
| `POST` | `/api/goal` | Swaps active fitness goal threshold (`weight_loss`, `maintenance`, `muscle_gain`). |
| `POST` | `/api/scan-image` | Uploads food image file for real Gemini AI vision analysis. |

---

## 🚀 Getting Started

### 1. Clone the Repository
```bash
git clone https://github.com/Sukhreet-kaur/Calory_Intake.git
cd Calory_Intake
```

### 2. Install Dependencies
```bash
npm run install:all
```

### 3. Configure Gemini API Key
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
GEMINI_API_KEY=your_gemini_api_key_here
```

### 4. Run Development Servers
* **Start Express Backend:**
  ```bash
  npm run dev:server
  ```
* **Start React Frontend:**
  ```bash
  npm run dev:client
  ```
* Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 📜 License
Created for the **Quantiphi Vibe Coding Assessment**.
