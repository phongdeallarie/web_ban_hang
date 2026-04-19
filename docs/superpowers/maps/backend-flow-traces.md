# Backend Flow Traces (Evidence-Backed)

Primary architecture map: `docs/superpowers/maps/backend-first-architecture-map.md`  
Evidence index: `docs/superpowers/maps/backend-first-evidence-index.md`

## 1) Auth Lifecycle Trace

### Trigger -> middleware -> handler -> data -> response
1. Trigger: frontend calls auth endpoints through `apiFetch` wrappers.
   - Evidence: `frontend/src/context/ShopContext.jsx` (`login`, `register`, `refreshProfile`), `frontend/src/api/client.js`.
2. Middleware path: protected profile/password endpoints pass `protect`.
   - Evidence: `backend/src/routes/auth.routes.js` (`/me`, `/change-password`), `backend/src/middleware/authMiddleware.js`.
3. Handler logic:
   - Register hashes password, checks unique email, creates user, signs JWT.
   - Login verifies password hash, signs JWT.
   - Profile/password handlers read/update authenticated user.
   - Evidence: `backend/src/routes/auth.routes.js`, `backend/src/utils/generateToken.js`.
4. Prisma operations:
   - `user.findUnique`, `user.create`, `user.update`, address include in profile read.
   - Evidence: `backend/src/routes/auth.routes.js`, `backend/src/lib/prisma.js`.
5. Response contract:
   - Register/login return `{ token, user, message }`.
   - `/me` returns profile snapshot including addresses.
   - Evidence: `backend/src/routes/auth.routes.js`.

### Inferred risk
- Token and profile shape are consumed directly in `ShopContext`; contract drift affects session bootstrapping paths.

## 2) Order Lifecycle Trace

### Trigger -> middleware -> handler -> data -> response
1. Trigger: checkout and order actions called by frontend context methods.
   - Evidence: `frontend/src/context/ShopContext.jsx` (`checkout`, `refreshOrders`, `cancelOrder`).
2. Middleware path:
   - Customer flows require `protect`.
   - Admin list/status/analytics require `protect` + `isAdmin`.
   - Evidence: `backend/src/routes/order.routes.js`, `backend/src/middleware/authMiddleware.js`, `backend/src/middleware/roleMiddleware.js`.
3. Handler logic:
   - Checkout validates cart/address/coupon, computes shipping + discount, writes order/items, decrements stock, increments coupon usage and loyalty points in one transaction.
   - Cancel path updates order status and restocks items.
   - Admin paths support filtering, status transitions, and analytics aggregation.
   - Evidence: `backend/src/routes/order.routes.js`, `backend/src/utils/order.js`, `backend/src/utils/helpers.js`.
4. Prisma operations:
   - `order.create/update/findMany/findFirst/findUnique/count`
   - `product.findMany/update`, `coupon.findUnique/update`, `user.findUnique/update`
   - Transactional writes via `$transaction`.
   - Evidence: `backend/src/routes/order.routes.js`, `backend/src/lib/prisma.js`.
5. Response contract:
   - Checkout returns created order (serialized numerics) and awarded points.
   - Customer/admin list endpoints return order collections.
   - Status/cancel endpoints return success messages.
   - Evidence: `backend/src/routes/order.routes.js`.

### Inferred risk
- Checkout handler combines validation, pricing, inventory mutation, loyalty update, and response shaping in one module, which increases regression surface.

## 3) Catalog Lifecycle Trace

### Trigger -> middleware -> handler -> data -> response
1. Trigger:
   - Public product/category reads from frontend pages via shared API client.
   - Admin catalog writes use protected endpoints.
   - Evidence: `frontend/src/api/client.js`, `backend/src/app.js` route mounts.
2. Middleware path:
   - Public list/detail endpoints are unguarded.
   - Product/category writes require `protect` + `isAdmin`.
   - Evidence: `backend/src/routes/product.routes.js`, `backend/src/routes/category.routes.js`.
3. Handler logic:
   - Product list/detail endpoints filter/paginate/sort and serialize response fields.
   - Product create/update compute slug, normalize optional fields, soft-hide via `active=false` on delete.
   - Category create/update/delete perform simple validation and referential checks.
   - Evidence: `backend/src/routes/product.routes.js`, `backend/src/routes/category.routes.js`.
4. Prisma operations:
   - Product `findMany/findFirst/create/update/count`
   - Category `findMany/create/update/delete`
   - Category delete guard via `product.count`.
   - Evidence: `backend/src/routes/product.routes.js`, `backend/src/routes/category.routes.js`, `backend/src/lib/prisma.js`.
5. Response contract:
   - Product responses are normalized by `serializeProduct`.
   - Category endpoints return direct Prisma objects plus messages for write ops.
   - Evidence: `backend/src/routes/product.routes.js`, `backend/src/routes/category.routes.js`.

### Inferred risk
- Catalog handlers translate schema fields (`imageUrl`, `description`) to UI aliases (`image`, `detail`) inline; dual naming increases coupling overhead across backend and frontend.

