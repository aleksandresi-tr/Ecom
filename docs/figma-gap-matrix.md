# Figma Reanalysis Gap Matrix

This matrix is the canonical checklist for the latest board reanalysis.  
Status values: `Present`, `Partial`, `Missing`.

| Area | Requirement | Status | Target files |
|---|---|---|---|
| Auth | Credentials login screen | Present | `app/[locale]/login/page.tsx`, `lib/auth.ts`, `app/api/auth/[...nextauth]/route.ts` |
| Auth | Protected listings route | Present | `middleware.ts`, `app/[locale]/listings/page.tsx` |
| Auth | Role-based admin route guard | Present | `middleware.ts`, `app/[locale]/admin/page.tsx` |
| Admin | Admin dashboard with user management | Present | `app/[locale]/admin/page.tsx`, `app/api/admin/users/route.ts`, `app/api/admin/users/[id]/route.ts` |
| Admin | Listing moderation controls | Present | `app/[locale]/admin/page.tsx`, `app/api/admin/listings/route.ts` |
| Data model | User + role persistence | Present | `prisma/schema.prisma`, `prisma/seed.ts` |
| Listings board | Sortable references/record table | Present | `components/ListingsTable.tsx` |
| Listings board | Quick add with hierarchical location | Present | `components/ListingsWorkspace.tsx`, `lib/location-hierarchy.ts` |
| Detail panel | Editable listing fields | Present | `components/ListingDetailPanel.tsx`, `app/api/listings/[id]/route.ts` |
| Localization | Auth/admin copy in ka/en | Present | `messages/en.json`, `messages/ka.json` |
| API security | Mutation endpoints protected | Present | `app/api/topics/route.ts`, `app/api/listings/route.ts`, `app/api/listings/[id]/route.ts` |
| Zero-miss check | Full frame-by-frame parity from board | Partial | Requires visual QA pass in browser against live UI |
