# Specification

## Summary
**Goal:** Add a customer details checkout form and an Orders tab in the admin panel so orders with delivery information are captured and viewable.

**Planned changes:**
- Extend the backend `main.mo` with an `Order` type that includes customer name, email, phone, delivery address, ordered items, total, and timestamp; add `placeOrder` update and `getOrders` query functions with stable storage.
- Replace the simulated checkout in `CheckoutPage.tsx` with a multi-step flow: a customer details form (Full Name, Email, Phone, Street Address, City, Postcode) with inline validation, followed by a confirmation screen showing delivery address after successful order placement.
- Add `usePlaceOrder` mutation hook and `useOrders` query hook in `useQueries.ts` wired to the backend functions.
- Add an "Orders" tab to `AdminPage.tsx` (alongside Products and Sponsors) that displays all orders with customer details, line items, totals, and timestamps, styled in the existing dark gaming theme.

**User-visible outcome:** Customers are prompted for their delivery details during checkout, and admins can view all placed orders (with full customer and item details) in a new Orders tab in the admin panel.
