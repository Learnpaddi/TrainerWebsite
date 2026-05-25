import { db } from '../config/firebase.js';
import { demoCourses } from '../utils/seedCourses.js';

async function seed() {
  const batch = db.batch();
  let seededCount = 0;

  for (const course of demoCourses) {
    const existing = await db.collection('courses').where('title', '==', course.title).limit(1).get();
    const ref = existing.empty ? db.collection('courses').doc() : existing.docs[0].ref;
    batch.set(ref, {
      ...course,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }, { merge: true });
    seededCount++;
  }

  await batch.commit();
  console.log(`Seeded ${seededCount} course(s).`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});

