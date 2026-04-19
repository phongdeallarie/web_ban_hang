# Backend-First Architecture Map Design

**Date:** 2026-04-18  
**Scope:** Deep codebase exploration map with backend-first emphasis, including module internals, dependency flow, and risk hotspots.

## 1. Problem and Goal

The repository has frontend, backend, and database assets, but contributors need a deeper architecture map centered on backend internals before implementation planning.  
The goal is to provide a backend-first map that makes runtime behavior, module boundaries, and high-risk coupling points explicit.

## 2. Output Definition

The deliverable contains four blocks:

1. **Layered backend architecture map**
2. **Key module internals and boundaries**
3. **Risk and hotspot register**
4. **Contributor orientation add-on**

Every statement must be tied to concrete repository evidence.

## 3. Layered Architecture Model

### Layer A: Entrypoints and Runtime Surface
- `backend/src/server.js`: local runtime entry (`PORT` fallback behavior).
- `backend/api/index.js`: serverless entry for Vercel.
- `backend/src/app.js`: app bootstrap, middleware stack, route mounting.
- `backend/vercel.json`: rewrite behavior for deployment.

### Layer B: Cross-Cutting Middleware
- CORS + JSON parser in app bootstrap.
- JWT auth middleware (`authMiddleware.js`) for protected routes.
- Role middleware (`roleMiddleware.js`) for admin-only flows.

### Layer C: Route Domain Layer
- Route modules under `backend/src/routes/*` define feature slices:
  - auth, users, addresses, products, categories, coupons, reviews, wishlist, orders, upload.
- Route files currently combine request handling and direct Prisma operations.

### Layer D: Data Layer
- Prisma schema (`backend/prisma/schema.prisma`) defines DB models and enums.
- Prisma client singleton (`backend/src/lib/prisma.js`) centralizes DB client lifecycle.

### Layer E: Utility Layer
- `generateToken.js`, `helpers.js`, and order helpers under `utils/` provide shared behavior.

## 4. Deep Flow Tracing Design

The map will trace each target flow using:
**trigger -> middleware path -> handler logic -> Prisma operations -> response contract**

Primary flows:
- **Auth lifecycle:** register/login/me/password path and token propagation.
- **Order lifecycle:** checkout, order creation, status changes, admin-facing order operations.
- **Catalog lifecycle:** category/product CRUD and expected consumer usage path.

## 5. Key Module Internals Strategy

For critical modules, include:
- Primary responsibility
- Key dependencies (inbound and outbound)
- Coupling points (where failures spread)
- Internal complexity indicators (size, mixed concerns, direct DB coupling)

Priority modules:
- `backend/src/app.js`
- `backend/src/routes/order.routes.js`
- `backend/src/routes/auth.routes.js`
- `backend/src/routes/coupon.routes.js`
- `backend/src/routes/category.routes.js`
- `backend/prisma/schema.prisma`
- `backend/src/lib/prisma.js`
- `frontend/src/context/ShopContext.jsx` (cross-layer client coupling checkpoint)

## 6. Risk and Hotspot Register Design

Hotspots are categorized as:
- **Runtime break risk**
- **Data integrity risk**
- **Security/configuration risk**
- **Maintainability risk**

Known initial hotspots from exploration:
- Coupon schema/route field mismatch (`maxDiscountValue` vs route field usage).
- Category `slug` requirement vs route write behavior.
- Payment-method constraints that may drift between route and schema.
- Large route/context files indicating concentrated responsibilities.

Each hotspot entry will include:
- Evidence location
- Why it is risky
- Potential impact scope
- Recommended investigation order (not implementation steps)

## 7. Error-Handling and Reliability View

The map explicitly documents current patterns:
- Route-level `try/catch` handling.
- Limited centralized validation/error normalization.
- Mixed response message conventions.

This section distinguishes:
- **Observed current behavior** (evidence-backed)
- **Risk inference** (explicitly labeled)

## 8. Testing and Validation of the Mapping Output

To validate map quality:
- Every architecture/risk claim must reference files.
- No speculative remediation tasks are included in this document.
- Sections must stay internally consistent across routes, schema, and deployment runtime.
- Contradictions discovered during mapping are documented as explicit open questions.

## 9. Boundaries and Non-Goals

In scope:
- Architecture understanding and risk-oriented exploration map.

Out of scope:
- Refactors, code changes, or bug fixes.
- Adding new runtime behavior.

## 10. Open Questions to Resolve During Execution

- Which toolchain versions (Node/MySQL) are the supported baseline?
- Is SQL import intended as primary DB bootstrap over Prisma migration flow?
- Are demo accounts guaranteed, and if so where are seeds managed?
- Should Windows-first setup wording replace Unix-centric copy commands in docs?

