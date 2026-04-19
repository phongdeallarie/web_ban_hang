# Copilot Instructions for `web_ban_hang`

## Build, test, and lint commands

This repository has two Node.js apps and no monorepo runner at root.

| Area | Command | Notes |
| --- | --- | --- |
| Backend dev server | `cd backend && npm run dev` | Runs `node --watch src/server.js` on port `5000` by default. |
| Backend production start | `cd backend && npm start` | Starts `src/server.js`. |
| Prisma client generation | `cd backend && npx prisma generate` | Also runs on `npm install` via `postinstall`. |
| Prisma schema push | `cd backend && npm run prisma:push` | Pushes Prisma schema to MySQL. |
| Frontend dev server | `cd frontend && npm run dev` | Vite app on port `5173`. |
| Frontend build | `cd frontend && npm run build` | Production build with Vite. |
| Frontend preview | `cd frontend && npm run preview` | Preview built assets. |

Automated test and lint scripts are currently **not configured** in `backend/package.json` or `frontend/package.json`, so there is no project-defined command for full test suite, lint, or single-test execution yet.

## High-level architecture

- The app is a classic split frontend/backend setup:
  - `frontend/`: React + Vite SPA
  - `backend/`: Express API + Prisma + MySQL
- Frontend talks to backend via `VITE_API_URL` (default `http://localhost:5000/api`).
- Backend mounts all business endpoints under `/api/*` in `src/app.js` and uses Prisma models in `backend/prisma/schema.prisma`.

### Backend request flow

1. `src/server.js` starts Express from `src/app.js`.
2. `src/app.js` sets CORS/JSON middleware, then mounts route modules (`auth`, `products`, `orders`, `categories`, `coupons`, `addresses`, `reviews`, `wishlist`, `users`, `upload`).
3. Route files in `src/routes/*.routes.js` contain most business logic directly (validation, Prisma queries, response shaping).
4. Authentication and authorization are middleware-based:
   - `protect` (`src/middleware/authMiddleware.js`) verifies Bearer JWT.
   - `isAdmin` (`src/middleware/roleMiddleware.js`) gates admin-only endpoints.
5. Shared helpers are in `src/utils` (`normalizeText`, parsing helpers, order fee/discount logic, order code formatting).
6. Prisma client singleton lives in `src/lib/prisma.js` and is reused across routes.

### Frontend data and UI flow

1. `src/main.jsx` wraps app with `BrowserRouter` and `ShopProvider`.
2. `src/context/ShopContext.jsx` is the central state/service layer:
   - auth state
   - cart state
   - wishlist/orders/categories bootstrap
   - checkout/profile actions
   - toast notifications
3. `src/api/client.js` is the canonical HTTP helper (`apiFetch`) that attaches `Authorization` from localStorage token and throws normalized API errors.
4. `src/App.jsx` defines route composition with guards:
   - `ProtectedRoute` for authenticated pages
   - `AdminRoute` for `/admin`
5. `src/pages/AdminPage.jsx` is a single large admin surface combining analytics plus CRUD for products/coupons/orders/users.

## Key conventions in this codebase

- **Language/UX convention:** User-facing and API error/success messages are Vietnamese; preserve this for consistency.
- **Route-centric backend style:** Keep logic close to routes (no separate controller/service abstraction currently).
- **Auth pattern:** Protected endpoints use `protect`; admin actions stack `protect, isAdmin`.
- **Input normalization:** Route handlers commonly sanitize/normalize text and numeric/date inputs via helper utilities before DB writes.
- **Product soft-delete behavior:** Deleting a product sets `active = false` (it is hidden from storefront instead of hard-deleted).
- **Response shaping for product/order money fields:** Prisma decimals are converted to JS numbers before returning to frontend (see product/order serializers).
- **Frontend API usage convention:** Use `src/api/client.js` (`apiFetch`, `setToken`) for new API calls; this is what active pages/context use.
- **Frontend state ownership:** Shared app state belongs in `ShopContext` rather than scattered per-page global stores.
- **Persistence keys in active flow:** Current app uses `shop_token`, `shop_user`, `shop_cart` in localStorage through context/client helpers.

## Environment setup essentials

- Backend `.env` expects: `DATABASE_URL`, `JWT_SECRET`, `FRONTEND_URL`, optional `BLOB_READ_WRITE_TOKEN` for image upload.
- Frontend `.env` expects: `VITE_API_URL`.
- Local DB bootstrap is expected via `shopdatabase.sql` (per repository README).
