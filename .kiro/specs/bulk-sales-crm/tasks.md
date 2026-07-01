# Implementation Tasks

## Task 1: Create Bulk Sales Models
- [ ] Create `models/BulkClient.js` — name, company, phone, email, gst, address, city, state, creditLimit, notes, deleted
- [ ] Create `models/BulkInvoice.js` — invoiceNumber, clientId, clientName, invoiceDate, dueDate, lineItems, subtotal, shipping, totalDiscount, totalAmount, totalCogs, grossProfit, amountPaid, paymentStatus, stockDeducted, notes, deleted
- [ ] Create `models/BulkPayment.js` — invoiceId, clientId, amount, paymentDate, paymentMode, reference, notes, deleted
- [ ] Create `models/BulkInvoiceCounter.js` — prefix, seq (for RVN-B001 numbering)
- [ ] Update `models/StockLog.js` — add "BULK_SALE" and "BULK_SALE_CANCELLED" to type enum

## Task 2: Bulk Client API
- [ ] Create `app/api/admin/bulk-sales/clients/route.js` — GET (list with outstanding) + POST (create)
- [ ] Create `app/api/admin/bulk-sales/clients/[id]/route.js` — PATCH (edit) + DELETE (soft delete with guard)
- [ ] GET returns clients with computed outstanding balance from BulkInvoice aggregation
- [ ] DELETE rejects if client has unpaid invoices

## Task 3: Bulk Invoice API
- [ ] Create `app/api/admin/bulk-sales/invoices/route.js` — GET (list, filter by client/status/date) + POST (create with stock deduction)
- [ ] POST: auto-generate invoice number, calculate totals, capture unitCost from Product, deduct stock via StockLog
- [ ] Create `app/api/admin/bulk-sales/invoices/[id]/route.js` — GET (single) + PATCH (update) + DELETE (cancel with stock restore)
- [ ] DELETE: only if amountPaid === 0, restore stock via StockLog "BULK_SALE_CANCELLED"

## Task 4: Bulk Payment API
- [ ] Create `app/api/admin/bulk-sales/payments/route.js` — GET (list by invoice/client) + POST (record payment)
- [ ] POST: validate amount <= remaining balance, update invoice amountPaid and paymentStatus
- [ ] Create `app/api/admin/bulk-sales/payments/[id]/route.js` — DELETE (reverse payment, recalculate invoice)

## Task 5: Receivables API
- [ ] Create `app/api/admin/bulk-sales/receivables/route.js` — GET returns totalOutstanding, totalOverdue, agingBuckets, clientBreakdown
- [ ] Aging buckets: current (0-30), 30-60, 60-90, 90+ days

## Task 6: Bulk Invoice PDF
- [ ] Create `app/api/admin/bulk-sales/invoices/[id]/pdf/route.js` — reuse existing generateInvoice + invoiceHTML pattern
- [ ] Adapt template for bulk: show client details, invoice number, due date, line items with SKU/discount

## Task 7: Bulk Sales Admin UI — Client Page
- [ ] Create `app/(admin)/admin/bulk-sales/clients/page.jsx`
- [ ] Client table (dark header), search, add/edit modal, outstanding per client
- [ ] Add "Bulk Sales" to AdminSidebar with HandCoins icon

## Task 8: Bulk Sales Admin UI — Invoice Page
- [ ] Create `app/(admin)/admin/bulk-sales/page.jsx`
- [ ] Invoice list with filters (client, status, date range)
- [ ] Create Invoice modal: select client, add line items (product picker, qty, price, discount), due date
- [ ] Payment status badges, download PDF button

## Task 9: Bulk Sales Admin UI — Payments & Receivables
- [ ] Payment recording modal from invoice detail
- [ ] Receivables tab/section with aging chart and client breakdown
- [ ] Overdue highlighting

## Task 10: Dashboard Integration
- [ ] Modify dashboard-stats API to include bulk revenue + COGS in P&L
- [ ] Modify PnL monthly API to include bulk data
- [ ] Show bulk overdue in OverduePayments component
- [ ] Update total revenue = D2C + Bulk

## Task 11: Testing & Validation
- [ ] Verify stock deduction on bulk invoice creation
- [ ] Verify stock restoration on invoice cancellation
- [ ] Verify partial payment flow (pending → partial → received)
- [ ] Verify receivables aging calculation
- [ ] Run npm run build
