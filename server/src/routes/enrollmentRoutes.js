import { Router } from 'express';
import { completeCourse, enroll } from '../controllers/enrollmentController.js';
import { requireAuth } from '../middleware/auth.js';

export const enrollmentRouter = Router();

enrollmentRouter.post('/enroll', requireAuth, enroll);
enrollmentRouter.post('/complete-course', requireAuth, completeCourse);
