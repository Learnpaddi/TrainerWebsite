# LMS Redirection Feature Implementation Plan

## Status: [IN PROGRESS] 

### Step 1: [✅ COMPLETE] Create `src/student/pages/Landing.tsx`
- New public landing page with "Start LMS Learning" button → `/lms`
- Extract hero/featured from Home.tsx
- Use Tailwind/Lucide matching existing style

### Step 2: [✅ COMPLETE] Update `src/routes/index.tsx`
- `/` → `Landing.tsx` (public)
- `/lms` → `Home.tsx` (protected requireRole="student")
- `/lms/course/:id` → `CourseDetail.tsx` (protected)
- `/courses` → `Landing.tsx`

### Step 3: [✅ COMPLETE] Transform `src/student/pages/Home.tsx` to LMS Dashboard
- Remove marketing hero
- Add dashboard content (enrolled courses, progress)
- LMS-focused layout with back to landing

### Step 4: [PENDING] Update `src/student/pages/CourseDetail.tsx`
- Back link → `/lms`
- Ensure protection via routes

### Step 5: [PENDING] Test & Verify
- SPA navigation: landing → /lms (no reload)
- Auth protection
- Course detail routing

### Step 6: [PENDING] Update TODO.md & Complete

**Next Action**: Implement Step 3 (Transform Home.tsx to LMS Dashboard)

