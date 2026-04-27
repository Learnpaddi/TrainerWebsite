# MongoDB → Firebase Firestore Migration TODO

## Phase 1: Backend Dependencies & Config
- [x] 1. Update `server/package.json` (remove mongoose/bcryptjs/jsonwebtoken, add firebase-admin)
- [x] 2. Create `server/src/config/firebase.js`
- [x] 3. Update `server/src/config/env.js`
- [x] 4. Delete `server/src/config/db.js`

## Phase 2: Remove Mongoose Models
- [x] 5. Delete `server/src/models/User.js`
- [x] 6. Delete `server/src/models/Course.js`
- [x] 7. Delete `server/src/models/Enrollment.js`

## Phase 3: Refactor Auth Layer
- [x] 8. Update `server/src/utils/auth.js`
- [x] 9. Update `server/src/middleware/auth.js`
- [x] 10. Update `server/src/controllers/authController.js`

## Phase 4: Refactor Controllers to Firestore
- [x] 11. Update `server/src/controllers/courseController.js`
- [x] 12. Update `server/src/controllers/enrollmentController.js`
- [x] 13. Update `server/src/controllers/examController.js`
- [x] 14. Update `server/src/controllers/paymentController.js`

## Phase 5: Bootstrap & Seeding
- [x] 15. Update `server/src/server.js`
- [x] 16. Update `server/src/scripts/seed.js`

## Phase 6: Frontend Learning API Alignment
- [x] 17. Update `src/features/learning/api/client.ts`
- [x] 18. Update `src/features/learning/lib/storage.ts`

## Phase 7: Cleanup & Validation
- [x] 19. Install server dependencies
- [x] 20. Verify no remaining MongoDB references
- [x] 21. All syntax checks passed

