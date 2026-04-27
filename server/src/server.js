import app from './app.js';
import { db } from './config/firebase.js';
import { env } from './config/env.js';
import { demoCourses } from './utils/seedCourses.js';

async function bootstrap() {
  const coursesSnapshot = await db.collection('courses').limit(1).get();

  if (coursesSnapshot.empty) {
    const batch = db.batch();
    for (const course of demoCourses) {
      const ref = db.collection('courses').doc();
      batch.set(ref, {
        ...course,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    }
    await batch.commit();
    console.log(`Seeded ${demoCourses.length} course(s) into Firestore.`);
  }

  app.listen(env.port, () => {
    console.log(`LearnPaddi API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});

