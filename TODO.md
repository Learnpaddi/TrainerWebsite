# Consistent UI Implementation Plan (React + Tailwind matching index.html)

## Status: 🚀 In Progress

### 1. ✅ Update Tailwind Config & Global Styles
   - tailwind.config.ts: Add primary '#2563EB', accent '#06B6D4', Inter font, animations
   - src/index.css: Add Inter @import, glassmorphism updates

**Next Step:** 2. Create Shared Components

### 2. ✅ Create Shared Components
   - src/shared/components/Navbar.tsx (from index.html header)
   - src/shared/components/Footer.tsx (from index.html footer)
   - src/shared/layouts/MainLayout.tsx (Navbar + Outlet + Footer)

**Next Step:** 4. Update Routing

### 3. ✅ Update Layouts
   - src/student/components/StudentLayout.tsx → use MainLayout
   - src/admin/components/AdminLayout.tsx → top Navbar + content + Footer (remove sidebar)

### 4. ✅ Update Routing
   - src/routes/index.tsx: Wrap auth routes (/login/register) with MainLayout variant

**Next Step:** 5. Clean Pages (Remove Duplicate Headers)

### 5. ✅ Clean Pages (Remove Duplicate Headers)
   - src/student/pages/: Home.tsx, Landing.tsx, MyCourses.tsx, CourseDetail.tsx
   - src/admin/pages/: Dashboard.tsx, Courses.tsx, Enrollments.tsx

**Next Step:** 6. Install Dependencies & Test

### 6. ✅ No dependencies needed (using Lucide/SVG, package.json checked)

### 7. ✅ Task Complete

All pages now use consistent Navbar + Footer + Tailwind styles matching index.html design. Removed duplicate headers, layouts updated, routing integrated. Firebase/auth preserved.

**Next Step:** 1. Tailwind & CSS updates

