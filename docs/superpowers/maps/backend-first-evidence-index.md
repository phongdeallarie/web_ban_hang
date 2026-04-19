# Backend-First Evidence Index

This index is the source-of-truth evidence list for backend mapping artifacts:
- `backend-first-architecture-map.md`
- `backend-flow-traces.md`
- `backend-hotspot-register.md`
- `contributor-init-appendix.md`

## Backend runtime and bootstrapping
- `backend/src/server.js` — local HTTP entrypoint; binds `app` to `PORT` with fallback `5000`.
- `backend/src/app.js` — initializes dotenv, CORS/JSON middleware, health route, and mounts all `/api/*` domains.
- `backend/api/index.js` — Vercel/serverless entry that re-exports the Express app.
- `backend/vercel.json` — rewrites all incoming paths to `api/index.js` and sets max function duration.

## Middleware and guards
- `backend/src/middleware/authMiddleware.js` — Bearer token extraction + JWT verification + `req.user` attachment.
- `backend/src/middleware/roleMiddleware.js` — admin authorization gate for protected admin routes.

## Route domains
- `backend/src/routes/auth.routes.js` — register/login/profile/password endpoints with bcrypt + JWT issuance.
- `backend/src/routes/order.routes.js` — checkout, customer order history, cancel path, admin order ops, analytics.
- `backend/src/routes/product.routes.js` — catalog listing/detail, admin product CRUD, product response shaping.
- `backend/src/routes/category.routes.js` — category list and admin category CRUD.
- `backend/src/routes/coupon.routes.js` — coupon validate/active endpoints and admin coupon CRUD.
- `backend/src/routes/review.routes.js` — product review lifecycle and product rating synchronization.
- `backend/src/routes/address.routes.js` — customer address CRUD and default-address handling.
- `backend/src/routes/users.routes.js` — admin user list, role update, and delete.
- `backend/src/routes/wishlist.routes.js` — customer wishlist read/toggle/delete operations.
- `backend/src/routes/upload.routes.js` — admin image upload pipeline to Vercel Blob via multer memory storage.

## Data layer
- `backend/prisma/schema.prisma` — canonical DB models, relations, and enums used by Prisma client.
- `backend/src/lib/prisma.js` — Prisma singleton creation/reuse strategy across requests.

## Shared backend utilities
- `backend/src/utils/generateToken.js` — JWT signing contract (`id`, `email`, `role`, 7d expiry).
- `backend/src/utils/helpers.js` — normalization/parsing helpers and order code formatter used across routes.
- `backend/src/utils/order.js` — shipping-fee and coupon-discount calculations used in checkout flow.

## Frontend coupling checkpoints (active backend consumers)
- `frontend/src/api/client.js` — API base URL resolution + auth header injection for backend calls.
- `frontend/src/context/ShopContext.jsx` — app initialization/login/checkout actions that call backend route surface.

## Legacy/non-runtime frontend checkpoint
- `frontend/src/api.js` — alternate fetch wrapper/token storage module; not used by `ShopContext` runtime flow in current app bootstrap.

