# Implementation Tasks

## Task 1: Create Expense and BusinessConfig Models
- [x] Create `models/Expense.js` with schema: date, category (enum), description, amount, payment_mode, notes, deleted
- [x] Add indexes on `{ date: -1 }` and `{ category: 1, date: -1 }`
- [x] Create `models/BusinessConfig.js` with schema: key (unique), value (Mixed), updatedAt
- [x] Verify both models compile without errors

**Requirements:** R11, R6

## Task 2: Extend Product Variant Schema with Cost Fields
- [x] Add `oil_cost`, `packaging_cost`, `other_cost`, `total_cost` (all Number, default 0) to VariantSchema in `models/Product.js`
- [x] Ensure backward compatibility (existing products without costs default to 0)
- [ ] Update product edit page (`EditProductClient.jsx`) to show/edit cost fields per variant
- [ ] Update product add page (`AddProductClient.jsx`) to include cost fields
- [ ] Update admin products API PATCH handler to persist cost fields

**Requirements:** R1

## Task 3: Create Business Config API
- [x] Create `app/api/admin/business-config/route.js` with GET and PATCH
- [x] GET returns all config entries (capital_invested, founders list)
- [x] PATCH accepts { key, value } to upsert a config entry
- [ ] Create seed script or initial PATCH to set capital_invested = 143450

**Requirements:** R6

## Task 4: Create Expenses CRUD API
- [x] Create `app/api/admin/expenses/route.js` with GET (paginated, filtered) and POST (create)
- [x] GET supports query params: page, limit, category, from, to
- [x] GET returns { expenses, total, page, pages, totalAmount }
- [x] POST validates: amount > 0, category in enum, date not future, required fields present
- [x] Create `app/api/admin/expenses/[id]/route.js` with PATCH (edit) and DELETE (soft delete)
- [x] DELETE sets `deleted: true` (soft delete)

**Requirements:** R11, R12, R16

## Task 5: Create P&L Engine API
- [x] Create `app/api/admin/pnl/route.js` — GET with ?period=YYYY-MM
- [x] Implement revenue calculation: sum totalAmount from PAID non-deleted orders in period
- [x] Implement COGS calculation: for each cartItem, lookup product variant total_cost × quantity
- [x] Implement expense aggregation: sum from Expense model grouped by category
- [x] Calculate grossProfit, netProfit, grossMargin, netMargin
- [x] Return warnings array for items with missing cost data
- [x] Create `app/api/admin/pnl/monthly/route.js` — returns last 6 months P&L array

**Requirements:** R2, R3, R4, R15

## Task 6: Enhance Dashboard Stats API
- [ ] Modify `app/api/admin/dashboard-stats/route.js` to include:
  - COGS, grossProfit, netProfit, margins for current month
  - totalExpenses for current month
  - cashIn, pendingReceivables, netCashFlow
  - capitalInvested, recoveryPercentage
  - unitsSoldToday, unitsSoldWeek, unitsSoldMonth
  - bestSellingSkuMonth
  - revenueBysku (array sorted by revenue desc)
  - overduePayments (orders with payment_status PENDING, age > 30 days)
  - lowStockItems (variants with stock ≤ 5)
  - missingCostWarnings

**Requirements:** R2, R3, R4, R5, R6, R7, R8, R9, R10

## Task 7: Build Expense Management Page UI
- [ ] Create `app/(admin)/admin/expenses/page.jsx`
- [ ] Add "Expenses" link to AdminSidebar (with Receipt/Wallet icon)
- [ ] Build stats row: This Month total, Last Month total, All Time total
- [ ] Build filter bar: Category dropdown, Date range, Search
- [ ] Build expense table with dark header, consistent design
- [ ] Build Add/Edit Expense modal (date, category, description, amount, payment_mode)
- [ ] Build delete confirmation
- [ ] Build expense trend bar chart (last 6 months)
- [ ] Add pagination

**Requirements:** R11, R12, R13, R14, R16, R17, R18

## Task 8: Build Enhanced CEO Dashboard
- [ ] Modify `app/(admin)/admin/page.js` to use new enhanced stats
- [ ] Create `PnlCards.jsx` — row of P&L KPI cards (Revenue, COGS, Gross Profit, Net Profit with margins)
- [ ] Create second row: Cash In, Receivables, Expenses, Capital Recovery
- [ ] Create `MonthlyPnlTable.jsx` — 6-month comparison table with % changes
- [ ] Create `SkuRevenueChart.jsx` — bar chart showing revenue by product
- [ ] Create `OverduePayments.jsx` — list of overdue orders (first 5)
- [ ] Keep existing RevenueChart and MarqueeManager components
- [ ] Show units sold today/week/month and best selling SKU
- [ ] Show low stock alerts
- [ ] Show missing cost warnings (if any)

**Requirements:** R2, R3, R4, R5, R6, R7, R8, R9, R10, R17, R18

## Task 9: Monthly P&L Comparison View
- [ ] Fetch `/api/admin/pnl/monthly` data on dashboard
- [ ] Render month-by-month table: Revenue, COGS, Gross Profit, Expenses, Net Profit, Net Margin
- [ ] Color-code positive/negative values (green/red)
- [ ] Add Net Margin trend line chart across 6 months

**Requirements:** R7, R15

## Task 10: Seed Initial Data
- [ ] Create one-time API or script to set product variant costs:
  - REB: total_cost=466 (oil=376, packaging=90)
  - MYS: total_cost=453 (oil=363, packaging=90)
  - OLI: total_cost=570 (oil=480, packaging=90)
  - OUD: total_cost=535 (oil=445, packaging=90)
  - LUC: total_cost=513 (oil=423, packaging=90)
- [ ] Set BusinessConfig capital_invested = 143450
- [ ] Seed existing expenses from Excel (optional, can be entered manually)

**Requirements:** R1, R6

## Task 11: Mobile Responsiveness
- [ ] Ensure PnL cards stack in single column on mobile (< 640px)
- [ ] Ensure expense table converts to card layout on mobile
- [ ] Ensure monthly P&L table scrolls horizontally on mobile
- [ ] Test all charts render correctly on small screens

**Requirements:** R17

## Task 12: Integration Testing
- [ ] Verify COGS calculation matches Excel values for known orders
- [ ] Verify expense totals aggregate correctly
- [ ] Verify monthly comparison percentages are accurate
- [ ] Verify overdue payment detection (age > 30 days)
- [ ] Verify low stock alerts match inventory page data
- [ ] Run `npm run build` and confirm no errors

**Requirements:** All
