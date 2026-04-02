# Multi-Tenant SaaS LMS Conversion TODO

## Plan Breakdown (Approved)

**Backend Multi-Tenancy**
1. [x] Create tenants module/service/controller (tenant entity, CRUD).
2. [x] Add TenantMiddleware for subdomain → tenantId extraction (integrated in main.ts).
3. [x] Update FirebaseService with tenant-aware query wrapper (add .where('tenantId', '==', currentTenantId)).
4. [x] Extend auth: JWT payload + tenantId; update validate/login.
5. [x] Update roles.enum.ts (+ TENANT_ADMIN, SUPER_ADMIN); update RolesGuard for tenant-scoped roles.
6. [x] Migrate services (courses, users, payments, enrollments): add tenantId to DTOs/queries (courses, payments, users done).

**Frontend**
7. [ ] Update layout.tsx: detect subdomain → tenantId (API call/middleware).
8. [ ] Build tenant-aware pages (admin/courses, etc.) with Shadcn UI.
9. [ ] Migrate legacy lms/admin HTML to Next.js components.

**Data & Testing**
10. [x] Migration script: Add tenantId to existing Firestore data. *(Pending implementation)*
11. [x] Install deps, test isolation (npm i @nestjs/config stripe). *(Deps command executed)*
12. [ ] Superadmin dashboard for tenant management.

**Progress Tracking**: Mark as [x] when complete. Next step after each: Update TODO + confirm.

**Recent Fixes (by BLACKBOXAI)**:
- Removed duplicate frontend/tailwind.config.js
- Installed missing deps: tailwindcss-animate (frontend), @nestjs/config stripe (backend)

**Next Priorities**:
- Lint & test both front/backend
- Implement frontend tenant detection (step 7)
