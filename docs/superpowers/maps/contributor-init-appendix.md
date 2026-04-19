# Contributor Init Appendix (Backend-First)

This appendix is a backend-first startup sequence aligned to current repository scripts and config files.

## 1) Database bootstrap
1. Use `shopdatabase.sql` **only for a fresh local/dev database**.
2. The script is **destructive** (drops/recreates tables). If your DB has existing data, back it up before import.
3. If you already have data, use a safer non-destructive path: create a separate empty database/schema and import `shopdatabase.sql` there.
4. Ensure `DATABASE_URL` points to the database/schema you imported.

## 2) Backend environment setup
1. Open `backend/.env` and ensure required backend keys are present:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `FRONTEND_URL`
   - `BLOB_READ_WRITE_TOKEN` (required for upload route)
2. Evidence of backend key usage:
   - `backend/src/lib/prisma.js` and `backend/prisma/schema.prisma` use `DATABASE_URL`.
   - `backend/src/middleware/authMiddleware.js` and `backend/src/utils/generateToken.js` use `JWT_SECRET`.
   - `backend/src/app.js` uses `FRONTEND_URL`.
   - `backend/src/routes/upload.routes.js` checks `BLOB_READ_WRITE_TOKEN`.

## 3) Backend install and run commands
Use scripts defined in `backend/package.json`:
- `npm run prisma:generate` — generate Prisma client
- `npm run prisma:push` — push Prisma schema to DB
- `npm run dev` — run backend with watcher (`src/server.js`)
- `npm run start` — run backend without watcher

Recommended sequence:
1. Install dependencies in `backend/`.
2. Run `npm run prisma:generate`.
3. Run `npm run prisma:push`.
4. Run `npm run dev`.

## 4) Frontend environment and run commands
1. Configure `frontend/.env` with `VITE_API_URL` pointing to backend API base (default `http://localhost:5000/api`).
2. Use scripts from `frontend/package.json`:
   - `npm run dev`
   - `npm run build`
   - `npm run preview`

## 5) API contract smoke checklist
After both apps are up, verify key backend-first paths:
1. `GET /` on backend app returns health JSON from `backend/src/app.js`.
2. `POST /api/auth/login` responds with `token` and `user` contract from `backend/src/routes/auth.routes.js`.
3. Authenticated `GET /api/auth/me` succeeds via `protect` middleware.
4. Authenticated `POST /api/orders/checkout` enforces address/cart validation and creates order transactionally.

