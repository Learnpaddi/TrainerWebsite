import app from './app.js';
import { connectDatabase } from './config/db.js';
import { env } from './config/env.js';
import { Course } from './models/Course.js';
import { demoCourses } from './utils/seedCourses.js';

async function bootstrap() {
  await connectDatabase();

  const coursesCount = await Course.countDocuments();
  if (coursesCount === 0) {
    await Course.insertMany(demoCourses);
  }

  app.listen(env.port, () => {
    console.log(`LearnPaddi API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
