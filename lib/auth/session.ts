import { compare, hash } from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { NewUser } from '@/lib/db/schema';
import { authConfig } from '@/lib/config';
import crypto from 'crypto';

const key = new TextEncoder().encode(process.env.AUTH_SECRET);
const SALT_ROUNDS = 10;

export async function hashPassword(password: string) {
  return hash(password, SALT_ROUNDS);
}

export async function comparePasswords(
  plainTextPassword: string,
  hashedPassword: string
) {
  return compare(plainTextPassword, hashedPassword);
}

type SessionData = {
  user: { 
    id: number;
    studentId?: string;
    isEmailVerified?: boolean;
  };
  expires: string;
};

type EmailVerificationToken = {
  email: string;
  studentId: string;
  expires: number;
};

type PasswordSetupToken = {
  email: string;
  studentId: string;
  expires: number;
};

export async function signToken(payload: SessionData) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(authConfig.sessionExpiresIn)
    .sign(key);
}

export async function verifyToken(input: string) {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ['HS256'],
  });
  return payload as SessionData;
}

export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    if (!session) return null;
    return await verifyToken(session);
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}

export async function setSession(user: NewUser & { studentId?: string; isEmailVerified?: boolean }) {
  try {
    const expiresInOneDay = new Date(Date.now() + 24 * 60 * 60 * 1000);
    const session: SessionData = {
      user: { 
        id: user.id!,
        studentId: user.studentId,
        isEmailVerified: user.isEmailVerified
      },
      expires: expiresInOneDay.toISOString(),
    };
    const encryptedSession = await signToken(session);
    const cookieStore = await cookies();
    cookieStore.set('session', encryptedSession, {
      expires: expiresInOneDay,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
    });
  } catch (error) {
    console.error('Error in setSession:', error);
    throw error;
  }
}

// 生成邮箱验证令牌
export function generateEmailVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// 验证学号格式
export function validateStudentId(studentId: string): boolean {
  return authConfig.studentIdPattern.test(studentId);
}

// 验证教育邮箱格式
export function validateEducationalEmail(email: string): boolean {
  const emailLower = email.toLowerCase();
  return authConfig.allowedEmailDomains.some(domain => emailLower.endsWith(domain));
}

// 验证密码强度
export function validatePassword(password: string): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  const { passwordRequirements } = authConfig;

  if (password.length < passwordRequirements.minLength) {
    errors.push(`密码长度至少需要${passwordRequirements.minLength}位`);
  }

  if (passwordRequirements.requireUppercase && !/[A-Z]/.test(password)) {
    errors.push('密码需要包含至少一个大写字母');
  }

  if (passwordRequirements.requireLowercase && !/[a-z]/.test(password)) {
    errors.push('密码需要包含至少一个小写字母');
  }

  if (passwordRequirements.requireNumbers && !/\d/.test(password)) {
    errors.push('密码需要包含至少一个数字');
  }

  if (passwordRequirements.requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('密码需要包含至少一个特殊字符');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// 生成邮箱验证JWT令牌
export async function signEmailVerificationToken(email: string, studentId: string): Promise<string> {
  const payload: EmailVerificationToken = {
    email,
    studentId,
    expires: Date.now() + authConfig.emailVerificationExpiresIn
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expires / 1000))
    .sign(key);
}

// 验证邮箱验证JWT令牌
export async function verifyEmailVerificationToken(token: string): Promise<EmailVerificationToken | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    
    const tokenData = payload as unknown as EmailVerificationToken;
    
    // 检查是否过期
    if (Date.now() > tokenData.expires) {
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.error('邮箱验证令牌验证失败:', error);
    return null;
  }
}

// 检查邮箱验证令牌是否过期
export function isEmailVerificationTokenExpired(expiresAt: Date): boolean {
  return Date.now() > expiresAt.getTime();
}

// 生成设置密码JWT令牌
export async function signPasswordSetupToken(email: string, studentId: string): Promise<string> {
  const payload: PasswordSetupToken = {
    email,
    studentId,
    expires: Date.now() + authConfig.emailVerificationExpiresIn
  };

  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(Math.floor(payload.expires / 1000))
    .sign(key);
}

// 验证设置密码JWT令牌
export async function verifyPasswordSetupToken(token: string): Promise<PasswordSetupToken | null> {
  try {
    const { payload } = await jwtVerify(token, key, {
      algorithms: ['HS256'],
    });
    
    const tokenData = payload as unknown as PasswordSetupToken;
    
    // 检查是否过期
    if (Date.now() > tokenData.expires) {
      return null;
    }
    
    return tokenData;
  } catch (error) {
    console.error('设置密码令牌验证失败:', error);
    return null;
  }
}
