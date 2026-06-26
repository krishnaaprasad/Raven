# Technical Design Document

## Overview

Phase 1 of the Business ERP Dashboard. This design covers the data models, API endpoints, calculation logic, and frontend components needed to implement the enhanced CEO Dashboard, Expense Management module, and automated P&L engine.

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Frontend (React)                     │
├──────────────────┬──────────────────────────────────┤
│  /admin          │  /admin/expenses                  │
│  (CEO Dashboard) │  (Expense CRUD + Charts)          │
└────────┬─────────┴──────────┬───────────────────────┘
         │                     │
         ▼                     ▼
┌────────────────────────────────────────────────────┐
│              API Layer (Next.js App Router)          │
├────────────────────────────────────────────────────┤
│  GET  /api/admin/pnl?period=YYYY-MM                │
│  GET  /api/admin/pnl/monthly (last 6 months)       │
│  GET  /api/admin/dashboard-stats (enhanced)        │
│  GET  /api/admin/expenses                          │
│  POST /api/admin/expenses                          │
│  PATCH /api/admin/expenses/[id]                    │
│  DELETE /api/admin/expenses/[id]                   │
│  GET  /api/admin/business-config                   │
│  PATCH /api/admin/business-config                  │
└────────────────────┬───────────────────────────────┘
                     │
                     ▼
┌────────────────────────────────────────────────────┐
│              MongoDB Collections                    │
├────────────────────────────────────────────────────┤
│  products (+ oil_cost, packaging_cost, total_cost) │
│  orders (existing — read only for calculations)    │
│  expenses (NEW)                                    │
│  business_configs (NEW — capital, settings)        │
│  stock_logs (existing)                             │
└────────────────────────────────────────────────────┘
```

## Data Models

### 1. Product Model Extension (Existing)

Add cost fields to the VariantSchema:

```javascript
const VariantSchema = new mongoose.Schema({
  size: { type: String, required: true },
  price: { type: Number, required: true },
  mrp: { type: Number, required: true },
  stock: { type: Number, default: 0 },
  // NEW: Cost tracking
  oil_cost: { type: Number, default: 0 },
  packaging_cost: { type: Number, default: 0 },
  other_cost: { type: Number, default: 0 },
  total_cost: { type: Number, default: 0 }, // oil + packaging + other
});
```

### 2. Expense Model (NEW)

```javascript
// models/Expense.js
const ExpenseSchema = new mongoose.Schema({
  date: { type: Date, required: true },
  category: {
    type: String,
    enum: ["Software/App", "Branding/Design", "Packaging", "Marketing", "Shipping", "Operations", "Other"],
    required: true,
  },
  description: { type: String, required: true },
  amount: { type: Number, required: true, min: 0.01 },
  payment_mode: {
    type: String,
    enum: ["Cash", "UPI", "Bank Transfer", "Card"],
    default: "UPI",
  },
  notes: { type: String, default: "" },
  deleted: { type: Boolean, default: false },
}, { timestamps: true });

ExpenseSchema.index({ date: -1 });
ExpenseSchema.index({ category: 1, date: -1 });
```

### 3. BusinessConfig Model (NEW)

```javascript
// models/BusinessConfig.js
const BusinessConfigSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now },
});

// Keys:
// "capital_invested" → 143450
// "founders" → [{ name: "Nikhil", amount: 37450 }, ...]
```

## API Endpoints

### Enhanced Dashboard Stats

**GET /api/admin/dashboard-stats** (modify existing)

Returns all existing fields PLUS:
```json
{
  // Existing fields...
  "totalSales": 5350,
  "salesChange": -12.5,
  
  // NEW P&L fields
  "cogs": 3728,
  "grossProfit": 1622,
  "grossMargin": 30.3,
  "totalExpenses": 4000,
  "netProfit": -2378,
  "netMargin": -44.5,
  
  // Cash flow
  "cashIn": 5350,
  "pendingReceivables": 4810,
  "netCashFlow": 1350,
  
  // Capital
  "capitalInvested": 143450,
  "recoveryPercentage": -7.2,
  
  // Units & SKU
  "unitsSoldToday": 0,
  "unitsSoldWeek": 2,
  "unitsSoldMonth": 11,
  "bestSellingSkuMonth": { "name": "REBEL", "units": 3 },
  
  // Revenue by SKU
  "revenueBysku": [
    { "name": "REBEL", "units": 3, "revenue": 1950 },
    { "name": "OUD INTENSE", "units": 2, "revenue": 1700 }
  ],
  
  // Overdue
  "overduePayments": [
    { "orderId": "#001", "customer": "Nitin Mahadik", "amount": 1040, "daysOverdue": 97 }
  ],
  
  // Low stock
  "lowStockItems": [
    { "name": "REBEL", "size": "50", "stock": 0 },
    { "name": "MYSTIQUE", "size": "50", "stock": 4 }
  ],
  
  // Missing cost warnings
  "missingCostWarnings": []
}
```

### P&L Engine

**GET /api/admin/pnl?period=2026-06**

```json
{
  "period": "2026-06",
  "revenue": 5350,
  "cogs": 3728,
  "grossProfit": 1622,
  "grossMargin": 30.3,
  "expenses": 0,
  "expensesByCategory": {},
  "netProfit": 1622,
  "netMargin": 30.3,
  "unitsSold": 8,
  "warnings": []
}
```

**GET /api/admin/pnl/monthly**

Returns array of last 6 months P&L data for comparison table and charts.

### Expenses CRUD

**GET /api/admin/expenses?page=1&limit=20&category=&from=&to=**
**POST /api/admin/expenses** — Create expense
**PATCH /api/admin/expenses/[id]** — Update expense
**DELETE /api/admin/expenses/[id]** — Soft delete expense

### Business Config

**GET /api/admin/business-config**
**PATCH /api/admin/business-config** — Update capital, settings

## P&L Calculation Logic

```javascript
async function calculatePnL(period) {
  const { startDate, endDate } = getMonthRange(period);
  
  // 1. Revenue: sum totalAmount from PAID orders in period
  const revenueAgg = await Order.aggregate([
    { $match: { payment_status: "PAID", deleted: { $ne: true }, createdAt: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: null, total: { $sum: "$totalAmount" } } }
  ]);
  const revenue = revenueAgg[0]?.total || 0;
  
  // 2. COGS: for each cartItem in paid orders, lookup product variant total_cost
  const orders = await Order.find({
    payment_status: "PAID", deleted: { $ne: true },
    createdAt: { $gte: startDate, $lt: endDate }
  });
  
  let cogs = 0;
  const warnings = [];
  
  for (const order of orders) {
    for (const item of order.cartItems) {
      const product = await Product.findOne({ slug: item.slug });
      const variant = product?.variants?.find(v => v.size === item.size);
      const unitCost = variant?.total_cost || 0;
      
      if (!unitCost && product) warnings.push(`${product.name} (${item.size}) missing cost`);
      
      cogs += unitCost * item.quantity;
    }
  }
  
  // 3. Expenses: sum from Expense model in period
  const expenseAgg = await Expense.aggregate([
    { $match: { deleted: { $ne: true }, date: { $gte: startDate, $lt: endDate } } },
    { $group: { _id: "$category", total: { $sum: "$amount" } } }
  ]);
  
  const expensesByCategory = {};
  let totalExpenses = 0;
  expenseAgg.forEach(e => { expensesByCategory[e._id] = e.total; totalExpenses += e.total; });
  
  // 4. Calculate profits
  const grossProfit = revenue - cogs;
  const netProfit = grossProfit - totalExpenses;
  const grossMargin = revenue > 0 ? (grossProfit / revenue) * 100 : 0;
  const netMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;
  
  return { period, revenue, cogs, grossProfit, grossMargin, totalExpenses, expensesByCategory, netProfit, netMargin, warnings };
}
```

## Frontend Components

### Enhanced Dashboard Page (`/admin`)

```
┌─────────────────────────────────────────────────────────┐
│  Dashboard Header: "Business Overview" + Period Selector │
├─────────────────────────────────────────────────────────┤
│  KPI Row 1: Revenue | COGS | Gross Profit | Net Profit  │
├─────────────────────────────────────────────────────────┤
│  KPI Row 2: Cash In | Receivables | Expenses | Capital  │
├───────────────────────────────────┬─────────────────────┤
│  Monthly P&L Comparison Table     │  Revenue by SKU     │
│  (6 months, auto-calculated)      │  (bar chart)        │
├───────────────────────────────────┼─────────────────────┤
│  Net Margin Trend (line chart)    │  Overdue Payments   │
│                                   │  Low Stock Alerts   │
├───────────────────────────────────┴─────────────────────┤
│  Revenue Chart (existing, kept)                          │
│  Marquee Manager (existing, kept)                        │
└─────────────────────────────────────────────────────────┘
```

### Expense Page (`/admin/expenses`)

```
┌─────────────────────────────────────────────────────────┐
│  Header: "Expenses" + "Add Expense" button              │
├─────────────────────────────────────────────────────────┤
│  Stats: This Month | Last Month | Total (All Time)      │
├─────────────────────────────────────────────────────────┤
│  Filters: Category | Date Range | Search                │
├─────────────────────────────────────────────────────────┤
│  Expense Trend Chart (6 months bar chart)               │
├─────────────────────────────────────────────────────────┤
│  Expense Table (dark header, consistent design)         │
│  Date | Category | Description | Amount | Mode | Actions│
├─────────────────────────────────────────────────────────┤
│  Pagination                                             │
└─────────────────────────────────────────────────────────┘
```

### Add/Edit Expense Modal

Fields: Date, Category (dropdown), Description (text), Amount (number), Payment Mode (dropdown), Notes (optional textarea)

## File Structure (New Files)

```
models/
  Expense.js                          (NEW)
  BusinessConfig.js                   (NEW)

app/api/admin/
  pnl/
    route.js                          (NEW — single period P&L)
    monthly/route.js                  (NEW — 6 month comparison)
  expenses/
    route.js                          (NEW — GET list + POST create)
    [id]/route.js                     (NEW — PATCH + DELETE)
  business-config/
    route.js                          (NEW — GET + PATCH)
  dashboard-stats/
    route.js                          (MODIFY — add P&L metrics)

app/(admin)/admin/
  page.js                             (MODIFY — enhanced dashboard)
  expenses/
    page.jsx                          (NEW — expense management)
  dashboard/
    PnlCards.jsx                      (NEW — P&L KPI cards)
    MonthlyPnlTable.jsx               (NEW — month comparison)
    SkuRevenueChart.jsx               (NEW — revenue by SKU)
    OverduePayments.jsx               (NEW — overdue list)
  components/
    AdminSidebar.jsx                  (MODIFY — add Expenses link)

models/Product.js                     (MODIFY — add cost fields to variant)
```

## Migration Plan

1. Add cost fields to Product VariantSchema (backward compatible, defaults to 0)
2. Create Expense and BusinessConfig models
3. Seed BusinessConfig with capital_invested = 143450
4. Update Product variants with known costs (REB=466, MYS=453, OLI=570, OUD=535, LUC=513)
5. Build APIs bottom-up: business-config → expenses → pnl → enhanced dashboard-stats
6. Build UI: expense page first (standalone), then enhanced dashboard

## Performance Considerations

- P&L calculations use MongoDB aggregation pipelines (not loading all docs into memory)
- Cache monthly P&L results for past months (they don't change)
- Dashboard stats API combines all queries in parallel with `Promise.all`
- Expense chart data pre-aggregated by the API, not calculated client-side
