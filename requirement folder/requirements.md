# E-commerce Web Application Requirements (As-Is)

## 1. Product overview and goals
This application is a full-stack e-commerce system (React + Vite frontend, Express + Prisma + MySQL backend) for browsing products, managing customer accounts, placing orders, and operating core admin workflows.

### Goals
- Provide a Vietnamese-language online shopping experience.
- Support end-to-end customer journey: discovery -> cart -> checkout -> order tracking.
- Provide admin operations for product/order/coupon/user management and business analytics.
- Maintain data consistency for stock, orders, coupons, and loyalty points.

## 2. Actors and roles
### 2.1 Guest
- Browse product catalog, product detail, and related products.
- Search/filter/sort products.
- Add items to local cart.
- Register or login.

### 2.2 Authenticated User (Customer)
- All Guest capabilities.
- Manage profile and password.
- Manage delivery addresses.
- Manage wishlist.
- Checkout and place orders.
- View order history and cancel eligible orders.
- Submit/update product reviews (only for purchased products).

### 2.3 Admin
- All user capabilities (except customer-only constraints where applicable).
- Access admin dashboard and analytics.
- Manage products (create/update/hide).
- Manage coupons (create/update/delete/activate/deactivate).
- View and update order/payment statuses.
- Manage users (change role, delete non-admin users).
- Upload product images.
- Manage categories through protected category APIs.

## 3. Functional requirements
### 3.1 Authentication and authorization
- FR-AUTH-01: System shall allow registration with fullName, email, password, optional phone.
- FR-AUTH-02: Password minimum length shall be 6 characters.
- FR-AUTH-03: System shall authenticate by email/password and return JWT.
- FR-AUTH-04: JWT shall include user id/email/role and expire after 7 days.
- FR-AUTH-05: Protected APIs shall require `Authorization: Bearer <token>`.
- FR-AUTH-06: Admin APIs shall require role `ADMIN`.
- FR-AUTH-07: Authenticated users shall view/update profile and change password.

### 3.2 Products
- FR-PROD-01: System shall list active products with pagination.
- FR-PROD-02: Product listing shall support search, category filter, min/max price, minimum rating, featured flag, and sorting.
- FR-PROD-03: Product detail shall be retrievable by slug or id and include related products.
- FR-PROD-04: Product response shall include normalized numeric money fields and review/wishlist metadata.
- FR-PROD-05: Admin shall create/update products.
- FR-PROD-06: Product delete action shall hide product from storefront (soft delete).

### 3.3 Categories
- FR-CAT-01: System shall provide public category listing.
- FR-CAT-02: Admin shall create/update/delete categories via protected APIs.
- FR-CAT-03: Category deletion shall be blocked if products exist in that category.

### 3.4 Cart
- FR-CART-01: Cart shall be managed client-side and persisted in local storage.
- FR-CART-02: Users shall add/remove items and update quantity.
- FR-CART-03: Quantity shall not be less than 1 and add-to-cart shall cap by stock at add time.

### 3.5 Checkout and orders
- FR-ORD-01: Checkout shall require authenticated user and at least one shipping address.
- FR-ORD-02: Checkout shall validate product existence and stock availability.
- FR-ORD-03: System shall calculate subtotal, shipping fee, coupon discount, and total.
- FR-ORD-04: Shipping fee rule shall be threshold-based (>=1,000,000 free; >=500,000: 15,000; else 30,000).
- FR-ORD-05: System shall create order, order items, decrement stock, increment coupon usage, and add loyalty points in one transaction.
- FR-ORD-06: Order code shall be generated in `SNxxxxxx` format.
- FR-ORD-07: Customers shall view own order history.
- FR-ORD-08: Customers shall cancel only orders in `PENDING` or `CONFIRMED`; cancellation shall restock items.
- FR-ORD-09: Admin shall view all orders and update order/payment statuses.

### 3.6 Coupons
- FR-CPN-01: System shall expose active coupons for customers.
- FR-CPN-02: Coupon validation shall check active flag, validity dates, usage limit, and minimum order value.
- FR-CPN-03: Coupons shall support percent and fixed discount types, with optional max discount cap.
- FR-CPN-04: Admin shall manage coupons (create/update/delete).

### 3.7 Wishlist
- FR-WISH-01: Authenticated users shall view wishlist.
- FR-WISH-02: Wishlist toggle endpoint shall add/remove by `(userId, productId)` uniqueness.

### 3.8 Reviews
- FR-REV-01: System shall list reviews by product.
- FR-REV-02: Only authenticated users with prior eligible purchase shall create/update own review.
- FR-REV-03: Rating range shall be 1..5.
- FR-REV-04: Review owner or admin shall delete review.
- FR-REV-05: Product rating and ratingCount shall be recalculated after review changes.

### 3.9 Profile and addresses
- FR-PROF-01: User profile shall include loyalty points and address list.
- FR-ADDR-01: Users shall CRUD own addresses only.
- FR-ADDR-02: System shall maintain one default address; first address becomes default automatically.
- FR-ADDR-03: If default address is deleted, another existing address shall be set as default.

### 3.10 Admin operations and analytics
- FR-ADM-01: Admin dashboard shall show KPIs and charts (revenue, orders, users, stock risk, category/customer/product breakdowns).
- FR-ADM-02: Admin shall upload product images; only image files up to 5MB are allowed.
- FR-ADM-03: Admin shall manage user role transitions between CUSTOMER and ADMIN.
- FR-ADM-04: System shall prevent deletion of admin accounts.

## 4. Non-functional requirements
### 4.1 Security
- Passwords shall be hashed with bcrypt.
- JWT-based authentication and role-based authorization shall protect restricted operations.
- Input normalization/parsing shall be applied in route handling.
- CORS shall allow configured frontend origins.

### 4.2 Performance
- Product and admin order listing shall use pagination.
- Catalog and analytics queries shall use indexed DB fields (per Prisma schema indexes).
- Frontend shall load bootstrap data asynchronously and cache key state in memory/local storage.

### 4.3 Reliability and consistency
- Critical checkout/cancel operations shall be transactional for inventory/order integrity.
- API shall return structured error messages for client handling.
- Address defaulting and rating synchronization shall preserve domain consistency.

### 4.4 Usability
- User-facing flows shall provide toast feedback for success/failure.
- Checkout and profile flows shall be integrated into a single customer experience.
- Admin dashboard shall provide visual reporting and quick operational actions.

### 4.5 Localization
- Current UX and API messages shall be Vietnamese-oriented.
- Currency/date formatting shall align with Vietnamese locale in active UI flows.

## 5. Key business rules and constraints inferred from code
1. Product deletion is soft delete (`active=false`), not hard delete.
2. Only active products are visible to customers.
3. Review submission requires prior purchase of the reviewed product.
4. Coupon applicability depends on active flag, time window, usage limit, and minimum order value.
5. Order cancellation is allowed only before shipping completion (`PENDING`/`CONFIRMED`).
6. Cancelling orders restores inventory; paid cancelled orders may become `REFUNDED`.
7. Loyalty points increase on successful checkout (`floor(total/10000)`).
8. Category cannot be deleted when linked products exist.
9. Exactly one default address is maintained per user (with fallback behavior).
10. Admin users cannot be deleted.
11. Image upload requires admin role, image MIME type, 5MB limit, and blob token availability.
12. Frontend presents MOMO/VNPAY options, but backend persists payment method as COD or BANK_TRANSFER.

## 6. Assumptions and out-of-scope
### Assumptions
- MySQL database is provisioned and schema is synchronized with backend expectations.
- Frontend and backend environment variables are configured correctly.
- This specification reflects implemented behavior, including current limitations.

### Out-of-scope (current implementation)
- Guest checkout (checkout currently requires login).
- Full online payment gateway processing for MOMO/VNPAY callback lifecycle.
- Advanced returns/exchanges workflow beyond order cancellation.
- Multi-language UI beyond current Vietnamese-first messaging.
- Automated test/lint pipelines (not currently configured in package scripts).
