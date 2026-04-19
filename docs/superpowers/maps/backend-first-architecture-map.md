# Backend-First Layered Architecture Map

Primary evidence index: `docs/superpowers/maps/backend-first-evidence-index.md`

## Layer A: Entrypoints and Runtime Surface

### Observed facts
- `backend/src/server.js` starts the Express app on `process.env.PORT || 5000`.
- `backend/src/app.js` is the composition root: dotenv load, CORS config, JSON parser, health endpoint, route mounting.
- `backend/api/index.js` exports the same app for serverless runtime.
- `backend/vercel.json` rewrites `/(.*)` to `/api/index.js`, making API routing app-centric in deployment.

## Layer B: Cross-Cutting Middleware

### Observed facts
- Global middleware in `backend/src/app.js`: CORS allowlist from `FRONTEND_URL` + localhost fallback, JSON body limit `10mb`.
- `backend/src/middleware/authMiddleware.js` enforces Bearer token and verifies JWT secret before protected handlers run.
- `backend/src/middleware/roleMiddleware.js` enforces admin role after auth middleware has populated `req.user`.

## Layer C: Route Domain Layer

### Observed facts
- Route modules are mounted under explicit prefixes in `backend/src/app.js`:
  - `/api/auth`, `/api/addresses`, `/api/categories`, `/api/coupons`, `/api/orders`
  - `/api/products`, `/api/reviews`, `/api/upload`, `/api/users`, `/api/wishlist`
- Domain handlers in `backend/src/routes/*.js` directly perform Prisma operations; no service/repository layer exists between route and data layer.
- Guarding pattern is route-local: `protect`/`isAdmin` is added per endpoint in each route module.

## Layer D: Data Layer

### Observed facts
- `backend/prisma/schema.prisma` defines relational model for users, catalog, coupons, orders, reviews, wishlist, and addresses.
- `backend/prisma/schema.prisma` also defines enum constraints (`UserRole`, `OrderStatus`, `PaymentMethod`, `PaymentStatus`).
- `backend/src/lib/prisma.js` keeps a singleton Prisma client and reuses it via `globalThis` outside production.

## Layer E: Utility Layer

### Observed facts
- `backend/src/utils/generateToken.js` centralizes token payload and expiration.
- `backend/src/utils/helpers.js` centralizes normalization/parsing and order code formatting.
- `backend/src/utils/order.js` centralizes shipping/coupon arithmetic used by checkout logic.

## Cross-Layer Dependency Edges

### Observed edges
- Entrypoints -> app bootstrap -> route modules:
  - `backend/src/server.js` -> `backend/src/app.js` -> `backend/src/routes/*.js`
  - `backend/api/index.js` -> `backend/src/app.js` -> `backend/src/routes/*.js`
- Route modules -> data layer:
  - `backend/src/routes/*.js` -> `backend/src/lib/prisma.js` -> `backend/prisma/schema.prisma`
- Route modules -> utility layer:
  - `backend/src/routes/auth.routes.js` -> `backend/src/utils/generateToken.js`, `backend/src/utils/helpers.js`
  - `backend/src/routes/order.routes.js` -> `backend/src/utils/order.js`, `backend/src/utils/helpers.js`
- Frontend client coupling:
  - `frontend/src/context/ShopContext.jsx` -> `frontend/src/api/client.js` -> `/api/*` route contracts mounted in `backend/src/app.js`

## Key Module Internals

### Module internals: `backend/src/app.js`
- Responsibility: central runtime composition and route surface declaration.
- Key dependencies: `express`, `cors`, `dotenv`, all route modules.
- Coupling hotspots: every API path prefix is hardcoded here; route-domain discoverability depends on this single file.

### Module internals: `backend/src/routes/order.routes.js`
- Responsibility: checkout transaction, customer order lifecycle, admin order lifecycle, analytics payload generation.
- Key dependencies: auth/role middleware, Prisma transaction APIs, coupon/order helper utilities.
- Coupling hotspots:
  - Mixed responsibilities in one route file (checkout + admin ops + analytics).
  - Relies on schema enums and field names from `backend/prisma/schema.prisma`.
  - Uses transformed product/coupon fields that can drift from schema naming.

### Module internals: `backend/src/routes/auth.routes.js`
- Responsibility: credential registration/login, profile retrieval/update, password change.
- Key dependencies: bcrypt hashing, JWT generation, auth middleware, user/address Prisma access.
- Coupling hotspots: token payload contract is coupled to `protect` middleware and frontend token usage paths.

### Module internals: `backend/src/routes/coupon.routes.js`
- Responsibility: public validation/active coupon discovery and admin coupon lifecycle.
- Key dependencies: helper parsing functions + Prisma coupon model.
- Coupling hotspots: request-field naming in create/update handlers must align with Prisma coupon model fields.

### Module internals: `backend/src/routes/category.routes.js`
- Responsibility: category listing and admin category lifecycle.
- Key dependencies: auth/role middleware + Prisma category/product tables.
- Coupling hotspots: create/update writes only `name`; schema-level required fields must remain aligned.

### Module internals: `backend/prisma/schema.prisma`
- Responsibility: declares the canonical data contract (models, relations, enums, constraints) used by all Prisma operations.
- Dependencies:
  - Consumed by Prisma Client generation (`backend/package.json` scripts `prisma:generate`, `prisma:push`).
  - Read at runtime through queries issued via `backend/src/lib/prisma.js` in route modules.
- Coupling points:
  - Route field names and enum literals in `backend/src/routes/*.js` must stay aligned with model fields and enums.
  - Frontend-visible payloads depend indirectly on schema choices because route serializers map Prisma records to API responses.
- Complexity indicators:
  - Contains multiple bounded domains in one schema (accounts, catalog, couponing, order lifecycle, reviews, wishlist, addressing).
  - Defines 4 enums and 10 models with many relations and indexes, increasing schema-change blast radius.

### Module internals: `backend/src/lib/prisma.js`
- Responsibility: creates and exports the shared Prisma client instance for backend runtime.
- Dependencies:
  - `@prisma/client` (`PrismaClient`) for DB access.
  - `process.env.NODE_ENV` to decide global reuse behavior.
- Coupling points:
  - Every route module importing `{ prisma }` depends on this singleton behavior for connection lifecycle.
  - Logging level and client initialization policy here affects all data-access paths globally.
- Complexity indicators:
  - Small code footprint but high centrality: one change affects all query and transaction flows.
  - Environment-aware global caching introduces runtime-mode branching (production vs non-production behavior).

### Module internals: `frontend/src/context/ShopContext.jsx` (cross-layer checkpoint)
- Responsibility: central client-side orchestration for auth session, cart, wishlist, order actions, and initial API hydration.
- Dependencies:
  - `frontend/src/api/client.js` for all HTTP calls and token propagation.
  - Backend route contracts from `backend/src/app.js` mounts and route payloads (`/auth`, `/orders`, `/wishlist`, `/categories`).
- Coupling points:
  - Assumes specific backend response shapes (for example `token`, `user`, order collections, message fields).
  - Session bootstrap and checkout success paths are tightly tied to backend auth/order endpoint behavior.
- Complexity indicators:
  - High responsibility concentration in a single context module (state storage + async orchestration + UI notifications).
  - Multiple cross-route async paths (`initialize`, `login`, `checkout`, `refreshOrders`) increase contract-drift sensitivity.

## Reliability View (Observed vs Inferred)

### Observed facts
- Most route handlers use route-local `try/catch` and return JSON error payloads with localized message text.
- Error normalization is not centralized; response shapes are route-specific.
- Validation is performed inline inside handlers, not through shared validator middleware.

### Inferred risks
- Inconsistent validation/error shapes increase integration friction for frontend consumers.
- Direct route-to-Prisma coupling raises change impact when schema fields or enums evolve.

