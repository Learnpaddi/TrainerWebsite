import { hashPassword } from './auth.js';

export const demoUsers = [
  {
    name: 'LearnPaddi Admin',
    email: 'admin@learnpaddi.com',
    password: 'Admin@12345',
    role: 'trainer',
  },
  {
    name: 'Demo User',
    email: 'user@learnpaddi.com',
    password: 'User@12345',
    role: 'student',
  },
];

export async function seedUser(prisma, user) {
  return prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      role: user.role,
      passwordHash: await hashPassword(user.password),
    },
    create: {
      name: user.name,
      email: user.email,
      role: user.role,
      passwordHash: await hashPassword(user.password),
    },
  });
}

export async function seedDemoUsers(prisma) {
  for (const user of demoUsers) {
    await seedUser(prisma, user);
  }

  return demoUsers.length;
}
