# GigShield — Parametric Insurance for Grocery Delivery Partners

> **DEVTrails 2026 | Phase 1: Ideation & Foundation**  
> **Persona: Grocery & Q-Commerce (Zepto, Blinkit, Swiggy Instamart)**

## 🎯 Problem Statement

India's 8+ million gig delivery workers in grocery and Q-Commerce face **30-60% income loss** during environmental disruptions — heavy monsoon rains, extreme heat waves, and hazardous air quality. Traditional insurance requires manual claims, takes weeks to process, and doesn't cover income loss.

**GigShield** solves this with **instant, automated parametric payouts** triggered by real-time environmental data. No claims. No paperwork. No delays.

## 🔑 Key Features

| Feature | Description |
|---------|-------------|
| **Parametric Triggers** | Automated payouts when Rain >10mm/hr, Heat Index >45°C, or AQI >300 |
| **Instant Settlement** | Payouts processed in <2 minutes — zero manual claims |
| **Weekly Premiums** | ₹49-99/week plans matching gig worker pay cycles |
| **AI Predictions** | ML model predicts income loss 7 days ahead |
| **Platform Verification** | Confirms delivery partner was online during disruption |

## 📊 Parametric Triggers

| Trigger | Threshold | Payout |
|---------|-----------|--------|
| 🌧️ Heavy Rainfall | >10 mm/hr | 60% of daily avg income |
| 🌡️ Extreme Heat | Heat Index >45°C | 50% of daily avg income |
| 💨 Hazardous AQI | >300 AQI | 40% of daily avg income |
| ⚠️ Combined (2+) | Multiple triggers | 80% of daily avg income |

## 💰 Financial Model

- **Weekly Premium**: ₹49 (low risk) — ₹99 (high risk)
- **Max Weekly Payout**: ₹2,000 per partner
- **Pool Funding**: Partner premiums + 30% platform co-pay
- **Coverage**: Loss of income ONLY (not health/accident/vehicle)

## 🏗️ Tech Stack

- **Frontend**: Vanilla HTML/CSS/JS with Chart.js
- **Design**: Dark mode, glassmorphism, responsive
- **Data**: Simulated Weather, AQI, and Platform Activity APIs
- **AI/ML**: Gradient Boosted Trees + LSTM (simulated)

## 🚀 How to Run

1. Open `index.html` in any modern browser
2. Navigate between Dashboard, Persona, Triggers, Financial, and AI tabs
3. Use the **Disruption Simulator** to test automated payouts

## 📁 Project Structure

```
├── index.html    # Main SPA entry point
├── styles.css    # Premium dark-theme design system
├── app.js        # Application logic, charts, interactions
├── data.js       # Mock data layer & business logic
└── README.md     # This file
```

## 👥 Target Persona

**Grocery/Q-Commerce Delivery Partners** working on platforms like Zepto, Blinkit, and Swiggy Instamart. These partners:
- Earn ₹700-900/day on average
- Complete 15-20 deliveries per day
- Work 6 days a week, 12+ hours/day
- Have zero income safety net during disruptions

---

*Built for DEVTrails 2026 — Guidewire Insurance Hackathon*
