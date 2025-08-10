import { db } from './drizzle';
import { users } from './schema';
import { hashPassword } from '@/lib/auth/session';
import { generateEmailFromStudentId } from './queries';

async function seed() {
  const studentId = '1020055014001';
  const email = generateEmailFromStudentId(studentId);
  const password = 'Admin123';
  const passwordHash = await hashPassword(password);

  const [user] = await db
    .insert(users)
    .values([
      {
        studentId: studentId,
        passwordHash: passwordHash,
        name: 'Test User',
        isActive: true,
        isEmailVerified: true, // 直接设为已验证，方便测试
      },
    ])
    .returning();

  console.log('Initial user created with:');
  console.log('Student ID:', studentId);
  console.log('Email:', email);
  console.log('Password:', password);
  console.log('Seed data created successfully.');
}

seed()
  .catch((error) => {
    console.error('Seed process failed:', error);
    process.exit(1);
  })
  .finally(() => {
    console.log('Seed process finished. Exiting...');
    process.exit(0);
  });