import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { authRouter } from './routes/authRoutes.js';
import { courseRouter } from './routes/courseRoutes.js';
import { enrollmentRouter } from './routes/enrollmentRoutes.js';
import { paymentRouter } from './routes/paymentRoutes.js';
import { examRouter } from './routes/examRoutes.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';

const app = express();

app.use(
  cors({
    origin: env.clientUrl,
    credentials: true,
  }),
);
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({
    success: true,
    message: 'LearnPaddi learning API is running.',
  });
});

const routers = [authRouter, courseRouter, enrollmentRouter, paymentRouter, examRouter];

routers.forEach((router) => {
  app.use('/api/v1', router);
  app.use(router);
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
