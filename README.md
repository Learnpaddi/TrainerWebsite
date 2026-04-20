# LearnPaddi Course Enrollment + Exam Feature

This repository now includes a complete full-stack learning feature for `learnpaddi.in`:

- React + Tailwind frontend flow under `src/features/learning`
- Node.js + Express + MongoDB backend under `server`
- JWT authentication for protected APIs
- Enrollment, course completion, payment gating, and exam access rules
- Razorpay integration with a built-in mock payment fallback for local development

**Feature routes**

- `/learn/auth`
- `/learn/dashboard`
- `/learn/course/:courseId`
- `/learn/exam/:courseId`

**Folder Structure**

```text
.
├── server
│   ├── src
│   │   ├── config
│   │   ├── controllers
│   │   ├── middleware
│   │   ├── models
│   │   ├── routes
│   │   ├── scripts
│   │   ├── services
│   │   ├── utils
│   │   ├── app.js
│   │   └── server.js
│   ├── .env.example
│   └── package.json
├── src
│   ├── features
│   │   └── learning
│   │       ├── api
│   │       ├── components
│   │       ├── context
│   │       ├── hooks
│   │       ├── lib
│   │       ├── pages
│   │       └── types.ts
│   ├── App.tsx
│   └── main.tsx
└── .env.example
```

**Implemented Backend APIs**

The backend exposes all required endpoints and a few supporting auth endpoints:

- `POST /auth/register`
- `POST /auth/login`
- `GET /auth/me`
- `POST /enroll`
- `GET /course/:id`
- `POST /complete-course`
- `POST /create-order`
- `POST /verify-payment`
- `GET /can-access-exam`
- `GET /exam/:courseId`
- `POST /exam/:courseId/submit`
- `GET /courses`
- `GET /me/enrollments`

The same routes are also available under `/api/v1/*` for versioned access.

**Business Logic**

- Users must enroll before course progress or payment can be tracked.
- Exam access requires:
  - course exam to exist
  - enrollment to exist
  - course completion to be true
  - successful payment if the course price is greater than `0`
- Free course:
  - completion unlocks exam immediately
- Paid course:
  - completion is required first
  - then payment must verify successfully before exam can start

**Database Models**

`User`
- `name`
- `email`
- `passwordHash`
- `role`

`Course`
- `title`
- `description`
- `price`
- `examAvailable`
- `lessons`
- `exam`

`Enrollment`
- `userId`
- `courseId`
- `progress`
- `completed`
- `paymentStatus`
- `paymentOrderId`
- `paymentId`
- `paymentSignature`
- `amountPaid`
- `examResult`

**Environment Setup**

1. Frontend env

Create `.env` in the repo root:

```bash
cp .env.example .env
```

Available values:

```env
VITE_LEARNING_API_URL=http://localhost:5000/api/v1
VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

2. Backend env

Create `server/.env`:

```bash
cp server/.env.example server/.env
```

Available values:

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/learnpaddi
JWT_SECRET=change-this-super-secret-key
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
RAZORPAY_KEY_ID=rzp_test_your_key_id
RAZORPAY_KEY_SECRET=your_test_key_secret
MOCK_PAYMENT=true
```

**Razorpay Test Keys Setup**

Use Razorpay test credentials from the Razorpay dashboard:

- `RAZORPAY_KEY_ID=rzp_test_...`
- `RAZORPAY_KEY_SECRET=...`

For local development:

- leave `MOCK_PAYMENT=true` to use the mock payment path without real checkout
- set `MOCK_PAYMENT=false` and provide Razorpay test keys to use actual Razorpay checkout

The frontend checkout script is loaded dynamically when the paid-course flow is triggered.

**Install and Run**

1. Install frontend dependencies

```bash
npm install
```

2. Install backend dependencies

```bash
cd server
npm install
cd ..
```

3. Start MongoDB locally

Example with a local MongoDB server:

```bash
mongod
```

4. Seed demo courses

```bash
npm run server:seed
```

5. Run backend

```bash
npm run server:dev
```

6. Run frontend

```bash
npm run dev
```

**Demo Flow**

1. Open `/learn/auth`
2. Register a learner account
3. Open a course from `/learn/dashboard`
4. Click `Enroll`
5. Click `Mark Course Complete`
6. For a free course:
   exam button becomes `Start Exam`
7. For a paid course:
   button becomes `Pay to Unlock Exam`
8. Complete payment
9. Start the timed MCQ exam
10. Submit and review the computed score

**Notes**

- The feature is isolated so it can coexist with the existing Firebase-based LMS work already in this repository.
- Backend route protection is JWT-based.
- Exam start and submission are both validated server-side.
- If Razorpay is not configured, the mock payment flow keeps development and QA unblocked.
