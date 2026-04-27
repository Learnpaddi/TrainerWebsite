# CORS Fix for startCourseExam — Task Tracker

## Steps
- [x] Analyze repository and identify root cause
- [x] Create comprehensive edit plan
- [x] Get user approval for plan
- [x] Step 1: Add `@types/cors` to `lms/functions/package.json`
- [x] Step 2: Convert `startCourseExam` to `onRequest` with explicit CORS in `lms/functions/src/index.ts`
- [x] Step 3: Update frontend `startCourseExam` in `src/services/firebase/examService.ts` to use `fetch`
- [x] Step 4: Install dependencies and verify build
- [x] Step 5: Summarize changes and provide testing steps

