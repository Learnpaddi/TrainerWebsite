import app from './app.js';
import { prisma } from './config/database.js';
import { env } from './config/env.js';
import { demoCourses } from './utils/seedCourses.js';
import { seedDemoUsers } from './utils/seedUsers.js';

async function seedCourse(course) {
  const existingCourse = await prisma.course.findFirst({ where: { title: course.title } });
  const courseRecord = await prisma.course.upsert({
    where: { id: existingCourse?.id || '__new_course__' },
    update: {
      description: course.description,
      price: course.price,
      examAvailable: course.examAvailable,
      lessons: course.lessons,
    },
    create: {
      title: course.title,
      description: course.description,
      price: course.price,
      examAvailable: course.examAvailable,
      lessons: course.lessons,
    },
  });

  if (course.exam) {
    await prisma.exam.upsert({
      where: { courseId: courseRecord.id },
      update: {
        title: course.exam.title,
        duration: course.exam.timeLimitMinutes,
        passingScore: course.exam.passingScore,
        questions: course.exam.questions,
      },
      create: {
        courseId: courseRecord.id,
        title: course.exam.title,
        duration: course.exam.timeLimitMinutes,
        passingScore: course.exam.passingScore,
        questions: course.exam.questions,
      },
    });
  }
}

async function bootstrap() {
  const userCount = await prisma.user.count();
  if (userCount === 0) {
    const seededUsers = await seedDemoUsers(prisma);
    console.log(`Seeded ${seededUsers} user(s) into the database.`);
  }

  const courseCount = await prisma.course.count();

  if (courseCount === 0) {
    for (const course of demoCourses) {
      await seedCourse(course);
    }
    console.log(`Seeded ${demoCourses.length} course(s) into the database.`);
  }

  app.listen(env.port, () => {
    console.log(`LearnPaddi API listening on http://localhost:${env.port}`);
  });
}

bootstrap().catch((error) => {
  console.error('Server startup failed:', error);
  process.exit(1);
});
