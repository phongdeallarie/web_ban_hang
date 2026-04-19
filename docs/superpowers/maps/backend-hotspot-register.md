# Backend Hotspot Register

Scope: evidence-backed backend hotspots only.  
Related map: `docs/superpowers/maps/backend-first-architecture-map.md`

| Hotspot | Category | Severity | Observed evidence | Inferred impact |
|---|---|---|---|---|
| Coupon model/route field mismatch (`maxDiscountValue` vs `maxDiscount`) | Runtime break / Data integrity | High | `backend/prisma/schema.prisma` defines `Coupon.maxDiscountValue`; `backend/src/routes/coupon.routes.js` writes/updates `maxDiscount`; `backend/src/utils/order.js` reads `coupon.maxDiscount` | Coupon create/update or discount calculation can fail or silently ignore intended cap values. |
| Category write path omits required schema field (`slug`) | Runtime break | High | `backend/prisma/schema.prisma` requires `Category.slug` (non-null, unique); `backend/src/routes/category.routes.js` create/update only send `name` | Category write operations can fail at runtime when schema constraints are enforced. |
| Payment method intake diverges from persisted enum | Data contract drift | Medium | `backend/src/routes/order.routes.js` accepts `MOMO`/`VNPAY` inputs but maps persisted value to `COD`/`BANK_TRANSFER`; `backend/prisma/schema.prisma` enum `PaymentMethod` allows only `COD`/`BANK_TRANSFER` | Upstream callers may think non-enum payment methods are stored distinctly while persistence collapses them. |
| Order item serialization uses non-schema product field aliases | Data quality | Medium | `backend/src/routes/order.routes.js` reads `product.finalPrice` and `product.image`; `backend/prisma/schema.prisma` product model stores `price` and `imageUrl`; `backend/src/routes/product.routes.js` is where aliasing to `image`/`finalPrice` is done | Checkout snapshots can persist empty/incorrect display fields when alias assumptions drift. |
| High-responsibility concentration in order route module | Maintainability / Regression risk | Medium | `backend/src/routes/order.routes.js` contains checkout, cancellation, admin list/status, analytics aggregation in one file | Future changes in one concern can unintentionally affect others; test/debug blast radius is large. |

## Investigation Order (no fixes, triage only)
1. Validate schema-to-route write alignment for `Category` and `Coupon` fields first (highest runtime-failure probability).
2. Validate checkout payment-method semantics against intended business behavior and enum constraints.
3. Validate order snapshot field naming consistency (`imageUrl`/`image`, `price`/`finalPrice`) across checkout and catalog serializers.
4. After correctness triage, consider decomposition boundaries inside `order.routes.js` to reduce future regression radius.

