import { Router } from 'express';
import { canAccessCourseExam, startExam, submitExam } from '../controllers/examController.js';
import { requireAuth } from '../middleware/auth.js';

export const examRouter = Router();

examRouter.get('/can-access-exam', requireAuth, canAccessCourseExam);
examRouter.get('/exam/:courseId', requireAuth, startExam);
examRouter.post('/exam/:courseId/submit', requireAuth, submitExam);
