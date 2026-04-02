# LMS Refactoring TODO
Status: In Progress

## Approved Plan Steps:

### 1. Setup root configs ✅
- Created root `vite.config.ts`
- Created root `tailwind.config.ts`
- Created root `tsconfig.json`

- Create root `vite.config.ts` (merged from lms-admin)
- Create root `tailwind.config.ts` (move)
- Create root `tsconfig.json` (app)
- Update paths/aliases for @src, @admin, @student, @shared

### 2. Migrate folders ✅
- Moved lms-admin/src/* → src/admin/
- Move lms-student/src/* → src/student/pages/
- Extract static HTML content → src/student/pages/*.jsx (AboutUs, Contact, Careers, Help, etc.)
- Ensure src/shared/ intact

### 3. Implement routing [PENDING]
- Create src/routes/ with index.tsx, AdminRoutes.tsx, StudentRoutes.tsx, AuthGuard
- Update src/admin/App.tsx for routing
- Single root index.html as Vite entry

### 4. Fix imports & role guards [PENDING]
- Update all imports to new aliases
- Add Firebase Auth guards (/admin/* requires isAdmin)

### 5. Cleanup [PENDING]
- Delete lms-admin/, lms-student/, lms/, admin/, frontend/, backend/
- Delete migrated static HTMLs
- Test: npm run dev, check admin/student routes

### 6. Dependencies & test [PENDING]
- Install missing: react-router-dom, react-firebase-hooks/auth
- Test Firebase CRUD, routing, role protection

### 7. Final verification [PENDING]
- Run preview
- Check scalability
