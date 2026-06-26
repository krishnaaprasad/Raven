# Requirements Document

## Introduction

Phase 1 of a Business ERP Dashboard for Raven Fragrance's existing Next.js admin panel. This module replaces the manual Excel-based tracking (Raven Tracker v2.xlsx) with a live CEO Dashboard showing P&L metrics, an Expense Management module for recording and categorizing business expenses, and automated Monthly P&L generation. The system calculates COGS from per-SKU cost data stored in the database, aggregates revenue from existing orders, and combines both with expenses to produce real-time profitability insights.

## Glossary

- **Dashboard_Module**: The enhanced CEO Dashboard page at `/admin` that displays financial KPIs, revenue breakdowns, stock alerts, and receivables information
- **Expense_Module**: The admin page at `/admin/expenses` for creating, listing, filtering, and visualizing business expenses
- **PnL_Engine**: The backend calculation service that computes Profit & Loss statements from orders, SKU costs, and expenses
- **SKU_Cost**: The cost-of-goods data (oil cost, packaging cost, total unit cost) stored per product variant in the database
- **COGS**: Cost of Goods Sold — calculated as SKU_Cost multiplied by units sold for each product variant
- **Gross_Profit**: Total Revenue minus COGS
- **Net_Profit**: Gross_Profit minus total Expenses
- **Receivable**: A bulk or D2C order amount where payment_status is PENDING
- **Overdue_Payment**: A Receivable where the order age exceeds 30 days from creation
- **Cash_In**: Total amount collected from orders with payment_status equal to PAID
- **Capital_Invested**: The total founder investment amount stored as a configuration value
- **Recovery_Percentage**: The ratio of Net_Profit to Capital_Invested expressed as a percentage
- **Expense_Category**: One of the predefined classifications for expenses: Software/App, Branding/Design, Packaging, Marketing, Shipping, Operations, Other
- **Period**: A calendar month used for aggregating financial data (format: YYYY-MM)

## Requirements

### Requirement 1: SKU Cost Storage

**User Story:** As an admin, I want to store per-SKU cost breakdowns in the database, so that COGS can be calculated automatically from order data.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL provide fields to store oil_cost, packaging_cost, and total_cost per product variant in the Product model
2. WHEN an admin updates SKU_Cost values for a product variant, THE Dashboard_Module SHALL persist the updated costs to the database
3. THE Dashboard_Module SHALL display the current SKU_Cost for each product variant on the product edit page
4. IF a product variant has no SKU_Cost defined, THEN THE PnL_Engine SHALL treat the unit cost as zero and flag the variant as missing cost data

### Requirement 2: Revenue Calculation

**User Story:** As an admin, I want to see total revenue from all sales channels combined, so that I understand overall business performance.

#### Acceptance Criteria

1. THE PnL_Engine SHALL calculate Total Revenue as the sum of totalAmount from all orders where payment_status equals PAID and deleted equals false
2. WHEN a Period filter is applied, THE PnL_Engine SHALL include only orders with createdAt within the selected Period
3. THE Dashboard_Module SHALL display Total Revenue for the current month and provide comparison with the previous month
4. THE PnL_Engine SHALL calculate revenue breakdown by SKU by summing (price multiplied by quantity) for each cartItem across paid orders

### Requirement 3: COGS Calculation

**User Story:** As an admin, I want COGS calculated automatically from SKU costs and units sold, so that I can track product-level profitability.

#### Acceptance Criteria

1. THE PnL_Engine SHALL calculate COGS for a Period as the sum of (SKU_Cost.total_cost multiplied by quantity) for each cartItem in paid, non-deleted orders within that Period
2. WHEN a cartItem references a product variant with no SKU_Cost, THE PnL_Engine SHALL use zero cost and include the item in a missing-cost-data warning list
3. THE Dashboard_Module SHALL display total COGS for the current month

### Requirement 4: Profit Metrics Display

**User Story:** As an admin, I want to see gross profit, gross margin, net profit, and net margin on the dashboard, so that I can assess business health at a glance.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display Gross_Profit calculated as Total Revenue minus COGS
2. THE Dashboard_Module SHALL display Gross Margin percentage calculated as (Gross_Profit divided by Total Revenue) multiplied by 100
3. THE Dashboard_Module SHALL display Net_Profit calculated as Gross_Profit minus total Expenses for the Period
4. THE Dashboard_Module SHALL display Net Margin percentage calculated as (Net_Profit divided by Total Revenue) multiplied by 100
5. WHEN Total Revenue for a Period equals zero, THE Dashboard_Module SHALL display margin percentages as zero rather than producing a division error

### Requirement 5: Cash Flow and Receivables

**User Story:** As an admin, I want to see cash collected versus pending receivables, so that I can manage cash flow and follow up on payments.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display Cash_In as the total amount from orders where payment_status equals PAID within the selected Period
2. THE Dashboard_Module SHALL display Pending Receivables as the total amount from non-deleted orders where payment_status equals PENDING
3. THE Dashboard_Module SHALL display Net Cash Flow calculated as Cash_In minus total Expenses for the Period
4. THE Dashboard_Module SHALL display a list of Overdue_Payment orders showing order ID, customer name, amount, and days overdue
5. WHEN an Overdue_Payment list contains more than five entries, THE Dashboard_Module SHALL display the first five with a link to view all

### Requirement 6: Capital and Recovery Tracking

**User Story:** As an admin, I want to track capital invested and recovery percentage, so that founders can see return on investment.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL store Capital_Invested as a configurable value in the database
2. THE Dashboard_Module SHALL display Capital_Invested on the CEO dashboard
3. THE Dashboard_Module SHALL display Recovery_Percentage calculated as (cumulative Net_Profit divided by Capital_Invested) multiplied by 100
4. WHEN Capital_Invested equals zero, THE Dashboard_Module SHALL display Recovery_Percentage as zero

### Requirement 7: Monthly Comparison

**User Story:** As an admin, I want to compare this month's metrics with last month's, so that I can identify trends.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display percentage change between current Period and previous Period for Total Revenue, COGS, Gross_Profit, Expenses, and Net_Profit
2. WHEN the previous Period value is zero, THE Dashboard_Module SHALL display the change as the current value without percentage calculation
3. THE Dashboard_Module SHALL indicate positive changes with a green indicator and negative changes with a red indicator

### Requirement 8: Revenue by SKU Breakdown

**User Story:** As an admin, I want to see revenue contribution by each SKU, so that I understand product performance.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display a breakdown of revenue by product for the current Period
2. THE Dashboard_Module SHALL sort the SKU revenue breakdown in descending order by revenue amount
3. THE Dashboard_Module SHALL display each SKU entry with product name, units sold, and revenue amount

### Requirement 9: Units Sold Metrics

**User Story:** As an admin, I want to see units sold today, this week, and this month, along with the best-selling SKU, so that I can track sales velocity.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display total units sold today, this week, and this month from paid non-deleted orders
2. THE Dashboard_Module SHALL identify and display the best-selling SKU for the current month based on total quantity sold
3. WHEN no orders exist for a time period, THE Dashboard_Module SHALL display zero units sold

### Requirement 10: Low Stock Alerts on Dashboard

**User Story:** As an admin, I want low stock alerts visible on the CEO dashboard, so that I can reorder inventory proactively.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL display product variants where stock is less than or equal to the reorder threshold of 5 units
2. THE Dashboard_Module SHALL show product name, variant size, and current stock level for each low-stock item
3. WHEN no variants are below the reorder threshold, THE Dashboard_Module SHALL display a confirmation message indicating stock levels are healthy

### Requirement 11: Expense Creation

**User Story:** As an admin, I want to record business expenses with date, category, description, amount, and payment mode, so that all expenditures are tracked digitally.

#### Acceptance Criteria

1. WHEN an admin submits a new expense, THE Expense_Module SHALL store the expense with date, category, description, amount, and payment_mode fields
2. THE Expense_Module SHALL validate that amount is a positive number greater than zero
3. THE Expense_Module SHALL validate that category is one of the predefined Expense_Category values
4. THE Expense_Module SHALL validate that date is not a future date
5. IF any required field is missing from the expense submission, THEN THE Expense_Module SHALL return a validation error identifying the missing fields
6. THE Expense_Module SHALL support payment_mode values of Cash, UPI, Bank Transfer, and Card

### Requirement 12: Expense Listing and Filtering

**User Story:** As an admin, I want to view all expenses with filters for category and date range, so that I can analyze spending patterns.

#### Acceptance Criteria

1. THE Expense_Module SHALL display expenses in a paginated list sorted by date in descending order
2. WHEN a category filter is applied, THE Expense_Module SHALL show only expenses matching the selected Expense_Category
3. WHEN a date range filter is applied, THE Expense_Module SHALL show only expenses with dates within the specified range
4. THE Expense_Module SHALL display each expense entry with date, category, description, amount, and payment_mode
5. THE Expense_Module SHALL display the total amount of currently filtered expenses

### Requirement 13: Monthly Expense Totals

**User Story:** As an admin, I want to see total expenses aggregated by month, so that I can compare spending across periods.

#### Acceptance Criteria

1. THE Expense_Module SHALL display monthly expense totals for at least the last 6 months
2. THE Expense_Module SHALL break down monthly totals by Expense_Category
3. THE Dashboard_Module SHALL display the current month total expenses as a KPI card

### Requirement 14: Expense Trends Visualization

**User Story:** As an admin, I want to see expense trends as a chart, so that I can visually identify spending patterns.

#### Acceptance Criteria

1. THE Expense_Module SHALL display a bar or line chart showing monthly expense totals for the last 6 months
2. THE Expense_Module SHALL allow toggling the chart between total expenses and per-category view
3. WHEN expense data is unavailable for a month, THE Expense_Module SHALL display zero for that month in the chart

### Requirement 15: Monthly P&L Auto-Generation

**User Story:** As an admin, I want the system to auto-generate monthly P&L statements, so that I can review profitability month over month without manual calculation.

#### Acceptance Criteria

1. THE PnL_Engine SHALL generate a P&L statement for any requested Period containing Revenue, COGS, Gross_Profit, total Expenses (with category breakdown), and Net_Profit
2. THE Dashboard_Module SHALL display a month-by-month P&L comparison table for at least the last 6 months
3. THE Dashboard_Module SHALL display Net Margin trend as a line chart across months
4. WHEN a Period has incomplete data (missing SKU costs for sold items), THE PnL_Engine SHALL display the P&L with a warning indicator noting estimated values

### Requirement 16: Expense Editing and Deletion

**User Story:** As an admin, I want to edit or delete recorded expenses, so that I can correct mistakes in expense tracking.

#### Acceptance Criteria

1. WHEN an admin edits an expense, THE Expense_Module SHALL update the stored record with the new values
2. WHEN an admin deletes an expense, THE Expense_Module SHALL remove the expense from the active list
3. THE Expense_Module SHALL require confirmation before deleting an expense

### Requirement 17: Mobile Responsiveness

**User Story:** As an admin, I want the dashboard and expense pages to work on mobile devices, so that I can check business metrics on the go.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL render KPI cards in a single-column layout on screens narrower than 640px
2. THE Expense_Module SHALL render the expense list in a card-based layout on screens narrower than 640px
3. THE Dashboard_Module SHALL maintain readability of all financial figures on mobile viewports without horizontal scrolling

### Requirement 18: Design Consistency

**User Story:** As an admin, I want the new pages to match the existing admin panel design, so that the experience feels cohesive.

#### Acceptance Criteria

1. THE Dashboard_Module SHALL use the existing admin panel color scheme: dark table headers (#1b180d), gold accents (#b28c34), cream backgrounds (#f5f1e6), and border color (#e7e1cf)
2. THE Expense_Module SHALL use rounded cards with the same border and shadow styles as existing admin pages
3. THE Dashboard_Module SHALL integrate into the existing admin sidebar navigation without altering current menu items
