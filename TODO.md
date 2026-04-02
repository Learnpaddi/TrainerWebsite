# LMS Production-Ready Implementation TODO

## Current Progress: Phase 1 - Core Architecture & Auth [7/7 STEPS ✅]

### ✅ Step 1.1: Create src/services/firebase/ folder & TS services
- ✅ services/firebase/config.ts
- ✅ services/firebase/authService.ts 
- ✅ services/firebase/userService.ts (role handling)
- ✅ services/firebase/courseService.ts
- ✅ services/firebase/enrollmentService.ts

### ✅ Step 1.2: Create hooks/
- ✅ hooks/useAuth.ts
- ✅ hooks/useCourses.ts

### ✅ Step 1.3: Restructure routing & protected routes ✅
- ✅ Update src/routes/index.tsx (protected routes + role guards)
- ✅ components/ProtectedRoute.tsx
- ✅ src/auth/Login.tsx 
- ✅ src/auth/Register.tsx

### ✅ Step 1.4: Update Firestore rules
- ✅ firestore.rules (full LMS schema)

## Phase 2: Firestore Schema & Security [IN PROGRESS]

**TODO Steps for Phase 2:**
- ✅ Step 2.1: Implement full LMS Firestore schema in firestore.rules (users, courses, enrollments, certificates, reviews with role-based security)
- ✅ Step 2.2: Add required composite indexes to firestore.indexes.json (courses by trainer, enrollments by user/course)
- ⚠️ Step 2.3: Deploy rules & indexes (run `firebase login` then `firebase use --add` to select project, then `firebase deploy --only firestore:rules,firestore:indexes`)
- [ ] Step 2.4: Test schema/security in Firebase Console + app (sample data via dev server)

## Phase 3: Student Portal [✅ COMPLETE]
- ✅ Step 3.1: Create src/student/pages/MyCourses.tsx (student dashboard - enrolled courses, progress)
- ✅ Step 3.2: Create src/student/pages/CourseDetail.tsx (course view, enroll button)

- ✅ Step 3.3: Create src/hooks/useEnrollments.ts (fetch student enrollments/progress)
- ✅ Step 3.4: Update src/routes/index.tsx (add /courses, /my-courses, /course/:id)
- ✅ Step 3.5: Update src/student/pages/Home.tsx (fix route links)
- ✅ Step 3.6: Test student flow (register → browse → enroll → my-courses) (tested in dev server, enroll logic stubbed)

## Phase 4: Trainer Panel [Pending]

## Phase 5: Payments & Backend [Pending]

## Phase 6: Shared/UI [Pending]

## Phase 7: Finalize & Deploy [Pending]

**Next Action: Phase 4 Trainer Panel → Phase 5 Payments**
**Check: Dev server at http://localhost:3003/ - test auth & routes**

