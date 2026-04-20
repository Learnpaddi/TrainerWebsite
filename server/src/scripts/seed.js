import { connectDatabase } from '../config/db.js';
import { Course } from '../models/Course.js';
import { demoCourses } from '../utils/seedCourses.js';

async function seed() {
  await connectDatabase();

  for (const course of demoCourses) {
    await Course.updateOne(
      { title: course.title },
      { $set: course },
      { upsert: true },
    );
  }

  console.log(`Seeded ${demoCourses.length} course(s).`);
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seeding failed:', error);
  process.exit(1);
});
