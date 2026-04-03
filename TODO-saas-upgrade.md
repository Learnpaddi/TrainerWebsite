# Modern SaaS LMS Upgrade (Udemy-style)

## Status: 🚀 In Progress

### 1. ✅ Core UI Components
   - src/shared/ui/CourseCard.tsx (reusable cards w/ rating/progress)
   - src/shared/ui/StarRating.tsx
   - src/shared/ui/SearchInput.tsx
   - src/shared/ui/Breadcrumb.tsx
   - src/shared/ui/ThemeToggle.tsx

**Next Step:** 2. Dark Mode + Global Polish

### 2. ✅ Dark Mode + Global Polish
   - tailwind.config.ts (darkMode: 'class')
   - src/index.css (dark vars)
   - Navbar: Add theme toggle

**Next Step:** 3. Upgrade Student Pages

### 3. [ ] Upgrade Student Pages
   - Landing.tsx: Hero carousel, search/filter courses
   - Home.tsx: Enhanced dashboard w/ recent activity
   - MyCourses.tsx: Tabs/filter (in-progress/completed), search
   - CourseDetail.tsx: Sidebar lessons, progress, instructor

### 4. [ ] Upgrade Admin Pages
   - Dashboard.tsx: Charts (recharts), analytics
   - Courses.tsx: Table/grid w/ actions
   - Enrollments.tsx: Student list/table

### 5. [ ] Animations/Loading
   - Skeletons for loading states
   - Framer Motion for cards/transitions

### 6. [ ] Test
   - npm run dev
   - Test dark/light, responsive, functionality

**Next Step:** 1. Core UI Components

