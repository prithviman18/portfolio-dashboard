# 📊 Portfolio Dashboard – Full Stack Assignment

A real-time stock portfolio dashboard built using **Next.js (App Router)** that aggregates live market data, computes portfolio and sector-level metrics, and visualizes performance with charts. The application is designed to be resilient to third-party API failures and usable even during non-market hours.

---

## 🚀 Live Demo & Repository

- **Deployed App:** _Add Vercel / Netlify link_
- **GitHub Repo:** _Add GitHub link_
- **Loom Walkthrough:** _Add Loom link_

---

## 🧩 Tech Stack

### Frontend
- Next.js 13+ (App Router)
- React
- TypeScript
- Tailwind CSS
- Recharts

### Backend
- Next.js API Routes
- In-memory caching
- Yahoo Finance API
- Screener.in scraping

### Deployment
- Vercel

---

## 🏗️ Architecture Overview

Client → API Route → Cache → External APIs → Response

---

## 🔄 Data Flow

1. Client requests `/api/portfolio`
2. Server checks in-memory cache
3. If cache valid → return cached data
4. If cache expired:
   - Fetch Yahoo Finance data
   - Fetch Screener data
   - Merge + compute metrics
5. Cache result and return response
6. Client computes sector & portfolio summaries

---

## 🧠 Key Features

- Real-time portfolio tracking (auto-refresh every 15s)
- Sector-wise grouping and P&L aggregation
- Interactive charts per sector
- Derived financial metrics
- Optimized rendering using memoization
- Graceful API failure handling

---

## 🧪 Testing Live Market Data During Non-Market Hours

### Problem
Market prices remain static outside trading hours, making it difficult to test UI updates and refresh logic.

### Solution
A mock price simulation layer was introduced:
- Uses live API data as base
- Applies ±0.5% random fluctuation during non-market hours
- Enabled only in non-production environments

This allowed verification of:
- Auto-refresh behavior
- Gain/Loss recalculations
- Sector-level updates

---

## 🗂️ Caching Strategy

- In-memory cache with TTL
- Reduces API calls
- Improves performance
- Prevents rate-limit issues

Each cache entry stores:
- Data value
- Timestamp

---

## 🚦 Rate Limit Handling

- Cache minimizes repeat API calls
- `Promise.allSettled()` allows partial API failures
- Fallback logic ensures UI stability

---

## ⚙️ Performance Optimizations

- `useMemo` used for derived sector and portfolio calculations
- Prevents unnecessary recomputation on re-renders

---

## 🧩 Challenges Faced

### 1. Testing during non-market hours
Solved using controlled mock price simulation.

### 2. Yahoo Finance authorization issues
Handled with defensive checks and Screener fallback.

### 3. Partial API failures
Solved using `Promise.allSettled()`.

### 4. Frequent re-renders due to auto-refresh
Optimized using memoization.

### 5. Deployment sync issues
Resolved by reconnecting GitHub repository in Vercel.

---

## 🛠️ Running Locally

```bash
git clone <repo-url>
cd portfolio-dashboard
npm install
npm run dev
```

---

## 📄 Future Improvements

- Redis-based caching
- WebSocket live updates
- Historical charts
- User authentication

---

## 👤 Author

**Prithvi Manoj**  
Full Stack Developer
