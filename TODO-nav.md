# LearnPaddi Navigation Fix - TODO

## Status: [In Progress]

## Plan Summary
Current: Hash routing (`#/dashboard`). Task: Query/HTML files (`dashboard.html`, `courses.html`). Strategy: **Hybrid** - Query params for courses/lessons, standalone HTML for pages.

## Steps

### 1. [✅] Create missing files
- [✅] lms/courses.html (public courses list)
- [✅] lms/register.html (split from auth.html)
- [✅] lms/login.html
- lms/profile.html
- lms/quiz.html
- lms/lesson.html

### 2. [ ] Update navigation in all pages
- Root index.html: CTA → lms/courses.html, login → lms/login.html
- lms/index.html → lms/courses.html
- Headers: consistent nav bar with query links
- Buttons: onclick → `window.location = 'course.html?id=...`

### 3. [ ] Fix app.js router (hybrid)
- Keep hash for auth/dashboard
- Query params for course/lesson (`?id=`, `?courseId=&lessonId=`)

### 4. [ ] Update course.html, dashboard.html
- Links: `course.html?id=${courseId}`
- Lessons: `lesson.html?courseId=...&lessonId=...`
- Quiz: `quiz.html?courseId=...`

### 5. [ ] Add footer to lms pages
- Common footer HTML

### 6. [ ] Test flow
- index.html → courses.html → course.html → lesson.html → quiz.html → certificate.html → dashboard.html → logout

### 7. [ ] Complete

**Next Step: Update navigation headers across pages**
