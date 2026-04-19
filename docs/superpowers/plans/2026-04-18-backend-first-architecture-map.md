# Backend-First Architecture Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Produce a backend-first deep architecture map with module internals, data-flow traces, and prioritized hotspots, plus a concise initialization appendix.

**Architecture:** Build documentation artifacts from repository evidence using a layered model: entrypoints -> middleware -> routes -> data layer -> utilities, then add flow traces and risk register. Keep claims evidence-backed (file-level references) and separate observed behavior from inferred risk.

**Tech Stack:** Markdown docs, Git, Node.js repo context (Express, Prisma, React/Vite), ripgrep/search tooling.

---

### Task 1: Prepare evidence inventory

**Files:**
- Create: `docs/superpowers/maps/backend-first-evidence-index.md`
- Modify: `docs/superpowers/specs/2026-04-18-backend-first-architecture-map-design.md` (reference links section only, if needed)
- Test: N/A (documentation task)

- [ ] **Step 1: Create evidence index skeleton**

```markdown
# Backend-First Evidence Index

## Backend runtime and bootstrapping
- backend/src/server.js
- backend/src/app.js
- backend/api/index.js
- backend/vercel.json

## Middleware and guards
- backend/src/middleware/authMiddleware.js
- backend/src/middleware/roleMiddleware.js

## Route domains
- backend/src/routes/*.js

## Data layer
- backend/prisma/schema.prisma
- backend/src/lib/prisma.js

## Frontend coupling checkpoints
- frontend/src/api/client.js
- frontend/src/context/ShopContext.jsx
```

- [ ] **Step 2: Verify all listed files exist**

Run:
```bash
rg --files backend frontend
```
Expected: output includes all files listed in the evidence index.

- [ ] **Step 3: Populate evidence index with one-line purpose per file**

```markdown
- backend/src/server.js — local HTTP entrypoint, binds app to PORT.
- backend/src/app.js — middleware setup and route mounting.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/maps/backend-first-evidence-index.md
git commit -m "docs: add backend architecture evidence index"
```

### Task 2: Write layered backend architecture map

**Files:**
- Create: `docs/superpowers/maps/backend-first-architecture-map.md`
- Modify: `docs/superpowers/maps/backend-first-evidence-index.md` (cross-links only)
- Test: N/A (documentation task)

- [ ] **Step 1: Write Layer A and Layer B sections**

```markdown
## Layer A: Entrypoints and Runtime Surface
- backend/src/server.js
- backend/src/app.js
- backend/api/index.js
- backend/vercel.json

## Layer B: Cross-Cutting Middleware
- authMiddleware.js
- roleMiddleware.js
- app-level CORS/json setup
```

- [ ] **Step 2: Write Layer C, D, E sections with dependency edges**

```markdown
Routes -> Prisma client -> Prisma schema models
Routes -> utils (token/order helpers)
Frontend API client -> backend /api routes
```

- [ ] **Step 3: Add key module internals subsection**

```markdown
### Module internals: backend/src/routes/order.routes.js
- Responsibility:
- Key dependencies:
- Coupling hotspots:
```

- [ ] **Step 4: Verify no unsupported claims**

Run:
```bash
rg "TODO|TBD|maybe|probably" docs/superpowers/maps/backend-first-architecture-map.md
```
Expected: no matches.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/maps/backend-first-architecture-map.md docs/superpowers/maps/backend-first-evidence-index.md
git commit -m "docs: add backend-first layered architecture map"
```

### Task 3: Add deep data-flow traces

**Files:**
- Modify: `docs/superpowers/maps/backend-first-architecture-map.md`
- Create: `docs/superpowers/maps/backend-flow-traces.md`
- Test: N/A (documentation task)

- [ ] **Step 1: Add auth lifecycle trace**

```markdown
trigger -> middleware path -> route handler -> prisma ops -> response contract
```

- [ ] **Step 2: Add order lifecycle trace**

```markdown
checkout request -> auth guard -> order route -> stock/order persistence -> response
```

- [ ] **Step 3: Add catalog lifecycle trace**

```markdown
admin/product route -> validation path -> prisma write -> list/detail read paths
```

- [ ] **Step 4: Validate trace references**

Run:
```bash
rg "backend/src/routes|backend/prisma/schema.prisma|backend/src/lib/prisma.js" docs/superpowers/maps/backend-flow-traces.md
```
Expected: each flow cites at least one concrete backend file path.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/maps/backend-flow-traces.md docs/superpowers/maps/backend-first-architecture-map.md
git commit -m "docs: add backend flow trace documentation"
```

### Task 4: Build hotspot register and init appendix

**Files:**
- Create: `docs/superpowers/maps/backend-hotspot-register.md`
- Create: `docs/superpowers/maps/contributor-init-appendix.md`
- Modify: `README.md` (only if minor clarifying links are approved)
- Test: N/A (documentation task)

- [ ] **Step 1: Add hotspot table with severity and evidence**

```markdown
| Hotspot | Category | Severity | Evidence | Impact |
|---|---|---|---|---|
| Coupon schema/route mismatch | Runtime break | High | backend/prisma/schema.prisma, backend/src/routes/coupon.routes.js | Request failures |
```

- [ ] **Step 2: Add investigation order notes (no fixes)**

```markdown
1. Validate schema-route field alignment
2. Validate enum compatibility
3. Validate required-field write paths
```

- [ ] **Step 3: Write contributor init appendix**

```markdown
1. Import shopdatabase.sql
2. Configure backend/.env
3. Run backend scripts
4. Configure frontend/.env
5. Run frontend scripts
```

- [ ] **Step 4: Verify appendix matches repo scripts**

Run:
```bash
rg "\"dev\"|\"start\"|\"prisma:generate\"|\"prisma:push\"" backend/package.json frontend/package.json
```
Expected: commands in appendix align with package scripts.

- [ ] **Step 5: Commit**

```bash
git add docs/superpowers/maps/backend-hotspot-register.md docs/superpowers/maps/contributor-init-appendix.md
git commit -m "docs: add hotspot register and contributor init appendix"
```

### Task 5: Final consistency pass and handoff

**Files:**
- Modify: `docs/superpowers/maps/backend-first-evidence-index.md`
- Modify: `docs/superpowers/maps/backend-first-architecture-map.md`
- Modify: `docs/superpowers/maps/backend-flow-traces.md`
- Modify: `docs/superpowers/maps/backend-hotspot-register.md`
- Modify: `docs/superpowers/maps/contributor-init-appendix.md`
- Test: N/A (documentation task)

- [ ] **Step 1: Check internal consistency across all docs**

Run:
```bash
rg "maxDiscount|maxDiscountValue|slug|PaymentMethod" docs/superpowers/maps
```
Expected: terminology is consistent and intentionally explained when mismatches are observed.

- [ ] **Step 2: Check ambiguity/placeholder leakage**

Run:
```bash
rg "TODO|TBD|implement later|appropriate error handling|edge cases" docs/superpowers/maps
```
Expected: no matches.

- [ ] **Step 3: Ensure every hotspot has evidence path**

```markdown
Each hotspot row includes at least one backend file path.
```

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/maps
git commit -m "docs: finalize backend-first architecture exploration package"
```
