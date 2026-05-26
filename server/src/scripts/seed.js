import { prisma } from '../config/database.js';
import { demoCourses } from '../utils/seedCourses.js';
import { seedDemoUsers } from '../utils/seedUsers.js';

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

async function seed() {
  const seededUsers = await seedDemoUsers(prisma);

  for (const course of demoCourses) {
    await seedCourse(course);
  }

  console.log(`Seeded ${seededUsers} user(s).`);
  console.log(`Seeded ${demoCourses.length} course(s).`);
}

seed()
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
