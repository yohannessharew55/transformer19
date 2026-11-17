# Transformer19 — 100K Trading Execution Cockpit & Journal

> **Operator: Yohannes Sharew**  
> *48-Week Systematic Execution Blueprint & Compounding Matrix*

A high-performance trading cockpit and execution journal designed for gold (XAU/USD) and forex traders. Integrates live TradingView charting, 48-week compounding execution roadmap, forensic sticky-note trade journaling, risk/lot size calculators, mental state logging, and the Tri AI Trading Command Officer powered by Google Gemini.

---

## ⚡ Core Systems

1. **48-Week Execution Matrix**:
   - Structured quarters (Foundation, Acceleration, Institutional, Harvest).
   - Daily session breakdown with sequential protocols and running equity targets.
   - Monthly 20% bank sweeps to guarantee physical capital extraction.

2. **Daily Trading Journal**:
   - Tactile sticky note system for pre-market planning, session reflections, and post-trade forensics.
   - Tagging by setup category, mistakes, sessions, and outcomes.

3. **Live Analytics & Growth**:
   - Equity curve tracking, realized P&L, win/loss distribution, profit factor.
   - Interactive Chart.js compounding curve comparison.

4. **Tri AI Command Officer (`/api/chat`)**:
   - Context-aware trading partner powered by Gemini models.
   - Provides risk assessments, discipline reminders, and strategy feedback.

5. **Local ACID Persistence**:
   - High-throughput LibSQL / SQLite engine in `cockpit.db` with WAL mode.

---

## 🚀 Running Locally

```bash
npm install
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.
