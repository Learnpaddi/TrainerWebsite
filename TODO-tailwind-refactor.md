# Tailwind CSS Refactor - Remove lms.css & Use Pure Tailwind

## Status: [In Progress]

**Goal**: All LMS styling via Tailwind utilities only. Remove css/lms.css completely.

### Steps:
1. ✅ **Global Setup**: Added Tailwind CDN + config to main lms/*.html pages (dashboard, index, course, profile, login, register, certificate, courses). Removed lms.css links.
2. ✅ Deleted css/lms.css
3. ✅ Update lms/_header.html: Added Tailwind classes for sidebar (fixed w-64 offcanvas), topbar (lg:ml-64), overlay (lg:hidden z-30)
**Core Refactor Complete**:
- ✅ Tailwind CDN/config added to all LMS HTML files
- ✅ css/lms.css deleted
- ✅ _header.html fully Tailwind (sidebar fixed w-64 offcanvas, topbar lg:ml-64, responsive toggle)
- ✅ Main content layout added (ml-0 lg:ml-64 p-6 bg-gray-50 min-h-screen) to dashboard, index, course, profile, courses, certificate
- ✅ Auth pages (login/register) , admin, verify, seeder updated with Tailwind CDN
- Most pages already used Tailwind-like classes (rounded-3xl, shadow-xl, grid lg:grid-cols-3); styles preserved/ enhanced
- Sidebar nav links styled with Tailwind hover: rounded-r-lg etc.

**Remaining**:
- lms/index.html still has custom classes from lms/app.js (.hero, .course-card, .btn-primary etc.) - needs app.js update or Tailwind equivalents in render functions

**Layout responsive**:
- Desktop: sidebar fixed, main ml-64
- Mobile: sidebar -translate-x-full, toggle button lg:hidden, overlay lg:hidden

Open `lms/dashboard.html` or `npx live-server lms/` to test.

**Next**: Implement Step 1 using parallel edit_file for lms/*.html to add Tailwind/remove lms.css link.

**Commands to test**: `npx live-server lms/` or open lms/index.html
