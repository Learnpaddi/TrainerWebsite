# LearnPaddi LMS - Complete Setup Guide

## 🚀 Quick Start (Updated for 50 Demo Courses!)

1. **Generate Demo Data**:
   ```
   1. Open lms/seeder.html
   2. Click 🚀 \"Generate 50 Demo Courses\"
   3. Wait ~30s → ✅ 50 courses across 10 categories created!
   4. Check Firebase Console (learnpaddi-1aee9) → Firestore → courses
   ```

2. **Test LMS**:
   ```
   lms/index.html → Browse courses
   Register/Login → Dashboard → Enroll → course.html?id=demo-...
   Admin: lms/admin.html (admin@learnpaddi.in)
   ```

## 📋 Firestore Structure (Generated)
```
courses/demo-web-development-1
├── courseId: \"demo-web-development-1\"
├── title: \"HTML & CSS Fundamentals\"
├── category: \"Web Development\"
├── modules: 3 modules × 3 lessons each
├── quiz: 5 questions
├── thumbnail: picsum.photos/seed/.../600/400
└── certificateEnabled: true
```

## 🎯 Features Ready
- ✅ 50 realistic courses (10 categories)
- ✅ Full course viewer (lms/course.html) with lessons/quizzes
- ✅ Admin dashboard (add/edit/delete)
- ✅ Enrollment & progress tracking
- ✅ Responsive Tailwind UI

## 🔧 Test Commands
```bash
# Serve locally (VS Code Live Server)
# Or Firebase Hosting: firebase deploy
```

**Demo system complete! Ready for LMS testing.**
