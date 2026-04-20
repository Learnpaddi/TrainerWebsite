# LearnPaddi Firebase Exam System

This project now uses a Firebase-native exam and certificate flow for LearnPaddi:

1. User enrolls in a course.
2. Course completion marks the enrollment as `completed: true`.
3. Completed enrollments appear in the exam portal in real time.
4. Free courses unlock the exam immediately.
5. Paid courses require successful payment first.
6. A secure callable function starts the exam and randomizes questions per attempt.
7. A secure callable function scores the exam and writes `score`, `passed`, and `certificateId`.
8. A Firestore trigger generates the PDF certificate, stores it in Cloud Storage, writes `certificateUrl`, and sends the certificate email.

## Firestore Collections

`users/{userId}`

```json
{
  "uid": "uid",
  "name": "Learner Name",
  "email": "learner@example.com",
  "role": "student",
  "certificates": ["LP-ABC1234567"]
}
```

`courses/{courseId}`

```json
{
  "title": "React Mastery",
  "price": 1499,
  "examAvailable": true
}
```

`exams/{courseId}`

```json
{
  "courseId": "react-mastery",
  "duration": 30,
  "passingScore": 75,
  "questions": [
    {
      "id": "q1",
      "question": "What does JSX compile to?",
      "options": ["HTML", "JavaScript function calls", "CSS", "JSON"],
      "correctAnswer": "JavaScript function calls"
    }
  ]
}
```

`enrollments/{userId}_{courseId}`

```json
{
  "userId": "uid",
  "courseId": "react-mastery",
  "progress": 100,
  "completed": true,
  "paymentStatus": "success",
  "examAttempted": true,
  "score": 84,
  "passed": true,
  "certificateId": "LP-ABC1234567",
  "certificateUrl": "https://storage.googleapis.com/...",
  "examResult": {
    "correctAnswers": 21,
    "totalQuestions": 25,
    "attemptedAt": "2026-04-20T12:00:00.000Z",
    "submissionReason": "manual",
    "violationCount": 1,
    "autoSubmitted": false
  }
}
```

`certificates/{certificateId}`

```json
{
  "certificateId": "LP-ABC1234567",
  "userId": "uid",
  "courseId": "react-mastery",
  "courseTitle": "React Mastery",
  "userName": "Learner Name",
  "score": 84,
  "completionDate": "2026-04-20T12:00:00.000Z",
  "certificateUrl": "https://storage.googleapis.com/...",
  "verificationUrl": "https://learnpaddi.in/verify-certificate?code=LP-ABC1234567"
}
```

## Frontend Integration

Core frontend files:

- `src/pages/student/ExaminationPortal.tsx`
- `src/student/pages/Certificates.tsx`
- `src/pages/student/CertificateView.tsx`
- `src/pages/public/CertificateVerification.tsx`
- `src/services/firebase/examService.ts`
- `src/features/exam/useSecureExamSession.ts`

Course completion helper:

- `markEnrollmentCompleted(userId, courseId, progress)` in `src/services/firebase/examService.ts`

Hook this into your lesson-tracking flow when the learner reaches 100% progress.

## Anti-Cheating Controls

Implemented on the frontend exam session:

- `visibilitychange` tab-switch detection
- fullscreen enforcement via `fullscreenchange`
- blocked right-click, copy, and paste
- blocked `F12`, `Ctrl/Cmd + Shift + I/J/C`, and `Ctrl/Cmd + C/V/U/S/P`
- countdown timer with auto-submit
- randomized question order returned by Cloud Functions
- one-attempt lock unless `adminRetakeAllowed == true`

Violation policy:

- each tab switch or fullscreen exit increments the violation count
- after 3 violations, the exam auto-submits

## Security Rules

Protected by `lms/firestore.rules`:

- users can only read their own enrollments
- student writes to enrollments are limited to progress and completion fields
- students cannot write:
  - `score`
  - `passed`
  - `certificateId`
  - `certificateUrl`
  - `examAttempted`
- certificates are read-only to learners and never writable by clients

## Storage Layout

Generated certificates are stored at:

`certificates/{userId}/{certificateId}.pdf`

Protected by `lms/storage.rules` so only the owner can read directly through Firebase Storage auth. Public sharing happens through the signed URL written by Cloud Functions.

## Firebase Config

Frontend env vars:

```bash
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
```

Optional local Functions emulator config:

```bash
firebase use <project-id>
```

## Functions Config

Set Razorpay and SMTP secrets before deploying:

```bash
firebase functions:config:set \
  razorpay.key_id="rzp_live_xxx" \
  razorpay.key_secret="xxx" \
  smtp.host="smtp.yourprovider.com" \
  smtp.port="587" \
  smtp.secure="false" \
  smtp.user="no-reply@learnpaddi.in" \
  smtp.pass="smtp-password" \
  smtp.from="LearnPaddi <no-reply@learnpaddi.in>"
```

## Local Build

Frontend:

```bash
npm run build
```

Functions:

```bash
cd lms/functions
npm run build
```

## Deploy

From the `lms/` directory:

```bash
firebase deploy --only firestore:rules
firebase deploy --only storage
firebase deploy --only functions
firebase deploy --only hosting
```

Or deploy all Firebase resources:

```bash
firebase deploy
```

## Production Notes

- Keep exam answer keys only in `exams` documents and never send them to the client.
- Use the callable start/submit functions as the only exam entry points.
- Keep `certificateUrl` and result fields server-owned.
- If you want admin retakes, set `adminRetakeAllowed: true` on the enrollment from an admin-only tool or Admin SDK script.
- The current certificate PDF includes a watermark and a verification URL. QR code generation is not included in this pass.
