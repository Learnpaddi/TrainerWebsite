import { Router } from 'express';
import { getCourseById, listCourses, listMyEnrollments } from '../controllers/courseController.js';
import { requireAuth } from '../middleware/auth.js';

export const courseRouter = Router();

courseRouter.get('/courses', listCourses);
courseRouter.get('/course/:id', requireAuth, getCourseById);
courseRouter.get('/me/enrollments', requireAuth, listMyEnrollments);
