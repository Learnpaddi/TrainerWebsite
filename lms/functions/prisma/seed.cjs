const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const courses = [
  {
    id: 'react-production-ui',
    title: 'React Production UI',
    description: 'Read practical lessons on component design, forms, state, and accessible interfaces before writing the final exam.',
    price: 0,
    lessons: [
      { title: 'Read: Component boundaries and reuse', duration: '12 min' },
      { title: 'Read: Accessible form workflows', duration: '14 min' },
      { title: 'Read: State, loading, and error handling', duration: '16 min' },
    ],
    exam: {
      title: 'React Production UI Exam',
      duration: 20,
      passingScore: 70,
      questions: [
        {
          id: 'react-q1',
          prompt: 'Which approach best separates display logic from data loading in React?',
          options: ['Container plus presentational components', 'Direct DOM edits inside render', 'Duplicating fetch calls in every button', 'Storing all UI state in CSS'],
          correctAnswerIndex: 0,
        },
        {
          id: 'react-q2',
          prompt: 'Why should every form input have a clear label?',
          options: ['It disables validation', 'It improves accessibility and usability', 'It makes APIs faster', 'It removes the need for state'],
          correctAnswerIndex: 1,
        },
        {
          id: 'react-q3',
          prompt: 'What should a production UI show when an API request fails?',
          options: ['Nothing', 'A useful error state and recovery action', 'Only a console log', 'A hidden spinner forever'],
          correctAnswerIndex: 1,
        },
        {
          id: 'react-q4',
          prompt: 'Which value is safest to use as a stable React list key?',
          options: ['Array index for changing lists', 'A random number each render', 'A unique database id', 'The current timestamp'],
          correctAnswerIndex: 2,
        },
      ],
    },
  },
  {
    id: 'node-api-foundations',
    title: 'Node API Foundations',
    description: 'Read how secure APIs are structured with auth middleware, controllers, validation, and persistence.',
    price: 1499,
    lessons: [
      { title: 'Read: Express route boundaries', duration: '11 min' },
      { title: 'Read: Auth middleware and user context', duration: '13 min' },
      { title: 'Read: Database writes and audit trails', duration: '15 min' },
    ],
    exam: {
      title: 'Node API Foundations Exam',
      duration: 18,
      passingScore: 75,
      questions: [
        {
          id: 'node-q1',
          prompt: 'What should authentication middleware do before a protected controller runs?',
          options: ['Compile CSS', 'Verify the token and attach user context', 'Delete old logs', 'Randomize database tables'],
          correctAnswerIndex: 1,
        },
        {
          id: 'node-q2',
          prompt: 'Why should exam submission scoring run on the server?',
          options: ['So answer keys stay private', 'So the UI can skip validation', 'So users can edit scores locally', 'So no database is needed'],
          correctAnswerIndex: 0,
        },
        {
          id: 'node-q3',
          prompt: 'Which record is most useful for an exam audit trail?',
          options: ['Only the page color', 'Attempt id, answers, score, timestamp, and proctoring events', 'Only the browser width', 'Only the course title'],
          correctAnswerIndex: 1,
        },
        {
          id: 'node-q4',
          prompt: 'What is the purpose of a unique enrollment per user and course?',
          options: ['To prevent duplicate access state', 'To hide all progress', 'To make payment optional always', 'To skip course completion'],
          correctAnswerIndex: 0,
        },
      ],
    },
  },
  {
    id: 'cloud-prisma-deployment',
    title: 'Cloud Prisma Deployment',
    description: 'Read deployment notes for Prisma, PostgreSQL, Firebase Functions, and production environment variables.',
    price: 999,
    lessons: [
      { title: 'Read: Prisma schema and generated clients', duration: '10 min' },
      { title: 'Read: Cloud Function database connections', duration: '12 min' },
      { title: 'Read: Production secrets and deploy checks', duration: '14 min' },
    ],
    exam: {
      title: 'Cloud Prisma Deployment Exam',
      duration: 16,
      passingScore: 75,
      questions: [
        {
          id: 'cloud-q1',
          prompt: 'Where should a production PostgreSQL connection string be stored?',
          options: ['Hard-coded in React', 'In a secure server environment variable', 'In public CSS', 'Inside browser localStorage'],
          correctAnswerIndex: 1,
        },
        {
          id: 'cloud-q2',
          prompt: 'Why generate Prisma Client during the functions build?',
          options: ['To create icons', 'To match TypeScript queries to the schema', 'To disable database writes', 'To remove migrations'],
          correctAnswerIndex: 1,
        },
        {
          id: 'cloud-q3',
          prompt: 'What does `prisma db push` do?',
          options: ['Synchronizes the database schema for prototyping', 'Deploys Firebase Hosting', 'Starts the browser camera', 'Creates a PDF certificate'],
          correctAnswerIndex: 0,
        },
        {
          id: 'cloud-q4',
          prompt: 'Which runtime should own secure exam writes?',
          options: ['Client-side JavaScript only', 'Cloud Functions or another trusted backend', 'The user browser console', 'Static HTML'],
          correctAnswerIndex: 1,
        },
      ],
    },
  },
];

async function main() {
  for (const course of courses) {
    await prisma.course.upsert({
      where: { id: course.id },
      create: {
        id: course.id,
        title: course.title,
        description: course.description,
        price: course.price,
        examAvailable: true,
        lessons: course.lessons,
        exams: {
          create: {
            title: course.exam.title,
            duration: course.exam.duration,
            passingScore: course.exam.passingScore,
            questions: course.exam.questions,
          },
        },
      },
      update: {
        title: course.title,
        description: course.description,
        price: course.price,
        examAvailable: true,
        lessons: course.lessons,
      },
    });

    await prisma.exam.upsert({
      where: { courseId: course.id },
      create: {
        courseId: course.id,
        title: course.exam.title,
        duration: course.exam.duration,
        passingScore: course.exam.passingScore,
        questions: course.exam.questions,
      },
      update: {
        title: course.exam.title,
        duration: course.exam.duration,
        passingScore: course.exam.passingScore,
        questions: course.exam.questions,
      },
    });
  }

  console.log(`Seeded ${courses.length} Prisma course(s) with exams.`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
