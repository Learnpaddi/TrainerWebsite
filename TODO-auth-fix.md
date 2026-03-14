# Authentication Flow Fix - Progress Tracker

## Status: [In Progress]

### Breakdown of Approved Plan:

1. **✅** Update lms/firebase.js: Add redirect to /login.html in logout()
2. **✅** Update lms/_header.html: Use firebase.logout() universally, remove inline handlers
3. **✅** lms/index.html: Remove duplicate auth checks and custom logoutUser
4. **✅** lms/dashboard.html: Remove duplicate auth checks 
5. **✅** lms/courses.html: No duplicates (clean)
6. **✅** lms/course.html: Remove duplicate auth checks
7. **✅** lms/certificate.html: No duplicates (clean)
8. **✅** lms/profile.html: Remove duplicate auth checks and custom logout
9. **✅** lms/login.html & register.html: Self-redirects correct (absolute root)
10. **✅** lms/app.js: Delegated logout kept (calls firebase.logout correct)
11. **✅** All LMS pages protected by guard.js + firebase.logout() redirects /login.html
12. **✅** Complete

**Notes:** All LMS pages include guard.js (protects /lms/* → /login.html). Root login → /lms/index.html correct.

Updated on each completed step.

