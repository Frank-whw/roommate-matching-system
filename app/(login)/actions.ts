'use server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import {
  User,
  users,
  activityLogs,
  type NewUser,
  type NewActivityLog,
  ActivityType,
} from '@/lib/db/schema';
import { 
  comparePasswords, 
  hashPassword, 
  setSession,
  validateStudentId,
  validateEducationalEmail,
  validatePassword,
  generateEmailVerificationToken,
  signEmailVerificationToken
} from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getUser, getUserByStudentId, getUserByEmail, createUser, logActivity } from '@/lib/db/queries';
import {
  validatedAction,
  validatedActionWithUser
} from '@/lib/auth/middleware';
import { sendEmailVerification } from '@/lib/email';
import { authConfig } from '@/lib/config';

// 学号格式验证zod schema
const studentIdSchema = z.string()
  .regex(/^102\d55014\d{2}$/, '学号格式不正确，应为102*55014**格式');

// 教育邮箱验证zod schema  
const educationalEmailSchema = z.string()
  .email('请输入有效的邮箱地址')
  .refine((email) => validateEducationalEmail(email), {
    message: '请使用教育邮箱（如：xxx@edu.cn）'
  });

// 密码强度验证zod schema
const passwordSchema = z.string()
  .min(8, '密码至少需要8位')
  .max(100, '密码不能超过100位')
  .refine((password) => {
    const validation = validatePassword(password);
    return validation.isValid;
  }, (password) => ({
    message: validatePassword(password).errors.join('，')
  }));

// 用户注册schema
const signUpSchema = z.object({
  studentId: studentIdSchema,
  email: educationalEmailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  name: z.string().min(1, '请输入姓名').max(50, '姓名不能超过50个字符'),
  agreeToTerms: z.boolean().refine((val) => val === true, {
    message: '请同意用户协议和隐私政策'
  })
}).refine((data) => data.password === data.confirmPassword, {
  message: '两次输入的密码不一致',
  path: ['confirmPassword'],
});

// 用户登录schema（支持学号或邮箱登录）
const signInSchema = z.object({
  identifier: z.string().min(1, '请输入学号或邮箱'),
  password: z.string().min(1, '请输入密码')
});

export const signUp = validatedAction(signUpSchema, async (data) => {
  const { studentId, email, password, name } = data;

  try {
    // 检查学号是否已被注册
    const existingUserByStudentId = await getUserByStudentId(studentId);
    if (existingUserByStudentId) {
      return {
        error: '该学号已被注册',
        field: 'studentId'
      };
    }

    // 检查邮箱是否已被注册
    const existingUserByEmail = await getUserByEmail(email);
    if (existingUserByEmail) {
      return {
        error: '该邮箱已被注册',
        field: 'email'
      };
    }

    // 创建密码哈希
    const passwordHash = await hashPassword(password);

    // 生成邮箱验证令牌
    const verificationToken = generateEmailVerificationToken();
    const verificationExpires = new Date(Date.now() + authConfig.emailVerificationExpiresIn);

    // 创建新用户
    const newUser: NewUser = {
      studentId,
      email,
      passwordHash,
      name,
      isActive: true,
      isEmailVerified: false,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: verificationExpires
    };

    const createdUser = await createUser(newUser);

    if (!createdUser) {
      return {
        error: '注册失败，请重试',
      };
    }

    // 生成JWT邮箱验证令牌
    const jwtVerificationToken = await signEmailVerificationToken(email, studentId);

    // 发送验证邮件
    const emailSent = await sendEmailVerification(email, jwtVerificationToken, studentId);
    if (!emailSent) {
      console.warn('验证邮件发送失败，但用户已创建');
    }

    // 记录活动日志
    await logActivity(createdUser.id, ActivityType.SIGN_UP);

    return {
      success: true,
      message: `注册成功！验证邮件已发送至 ${email}，请在10分钟内完成邮箱验证。`,
      userId: createdUser.id
    };

  } catch (error) {
    console.error('注册过程出错:', error);
    return {
      error: '注册失败，请重试',
    };
  }
});

export const signIn = validatedAction(signInSchema, async (data) => {
  const { identifier, password } = data;

  try {
    let user = null;

    // 判断是学号还是邮箱
    if (validateStudentId(identifier)) {
      user = await getUserByStudentId(identifier);
    } else {
      user = await getUserByEmail(identifier);
    }

    if (!user) {
      return {
        error: '学号/邮箱或密码错误',
      };
    }

    // 检查账户状态
    if (!user.isActive) {
      return {
        error: '账户已被禁用，请联系管理员',
      };
    }

    // 验证密码
    const isPasswordValid = await comparePasswords(password, user.passwordHash);
    if (!isPasswordValid) {
      return {
        error: '学号/邮箱或密码错误',
      };
    }

    // 检查邮箱验证状态
    if (!user.isEmailVerified) {
      return {
        error: '请先完成邮箱验证，查看您的邮箱中的验证邮件',
        needEmailVerification: true,
        userId: user.id
      };
    }

    // 设置会话和记录登录
    await Promise.all([
      setSession({
        ...user,
        studentId: user.studentId,
        isEmailVerified: user.isEmailVerified
      }),
      logActivity(user.id, ActivityType.SIGN_IN)
    ]);

    // 重定向到主页
    redirect('/');

  } catch (error) {
    console.error('登录过程出错:', error);
    return {
      error: '登录失败，请重试',
    };
  }
});

// 重新发送验证邮件
const resendVerificationSchema = z.object({
  email: educationalEmailSchema
});

export const resendVerificationEmail = validatedAction(resendVerificationSchema, async (data) => {
  const { email } = data;

  try {
    const user = await getUserByEmail(email);
    if (!user) {
      return {
        error: '用户不存在'
      };
    }

    if (user.isEmailVerified) {
      return {
        error: '该邮箱已完成验证'
      };
    }

    // 检查是否在冷却时间内
    const lastTokenTime = user.emailVerificationExpires?.getTime() || 0;
    const cooldownTime = 60000; // 1分钟冷却时间
    if (Date.now() - (lastTokenTime - authConfig.emailVerificationExpiresIn) < cooldownTime) {
      return {
        error: '发送过于频繁，请稍后再试'
      };
    }

    // 生成新的验证令牌
    const jwtVerificationToken = await signEmailVerificationToken(email, user.studentId);

    // 发送验证邮件
    const emailSent = await sendEmailVerification(email, jwtVerificationToken, user.studentId);
    if (!emailSent) {
      return {
        error: '验证邮件发送失败，请重试'
      };
    }

    return {
      success: true,
      message: `验证邮件已重新发送至 ${email}，请查收`
    };

  } catch (error) {
    console.error('重发验证邮件出错:', error);
    return {
      error: '发送失败，请重试'
    };
  }
});

// 验证邮箱
const verifyEmailSchema = z.object({
  token: z.string().min(1, 'token不能为空')
});

export const verifyEmail = validatedAction(verifyEmailSchema, async (data) => {
  const { token } = data;

  try {
    // 验证JWT令牌
    const { verifyEmailVerificationToken } = await import('@/lib/auth/session');
    const tokenData = await verifyEmailVerificationToken(token);

    if (!tokenData) {
      return {
        error: '验证链接无效或已过期，请重新申请验证邮件'
      };
    }

    // 查找用户
    const user = await getUserByEmail(tokenData.email);
    if (!user) {
      return {
        error: '用户不存在'
      };
    }

    // 检查学号是否匹配
    if (user.studentId !== tokenData.studentId) {
      return {
        error: '验证信息不匹配'
      };
    }

    if (user.isEmailVerified) {
      return {
        success: true,
        message: '邮箱已完成验证，请登录',
        alreadyVerified: true
      };
    }

    // 更新验证状态
    const { updateUserEmailVerification } = await import('@/lib/db/queries');
    await updateUserEmailVerification(user.id, true);

    // 记录活动日志
    await logActivity(user.id, ActivityType.EMAIL_VERIFIED);

    return {
      success: true,
      message: '邮箱验证成功！现在可以登录了',
      verified: true
    };

  } catch (error) {
    console.error('邮箱验证出错:', error);
    return {
      error: '验证失败，请重试'
    };
  }
});

export async function signOut() {
  try {
    const user = await getUser();
    if (user) {
      await logActivity(user.id, ActivityType.SIGN_OUT);
    }
    (await cookies()).delete('session');
    redirect('/login');
  } catch (error) {
    console.error('登出出错:', error);
    (await cookies()).delete('session');
    redirect('/login');
  }
}

// 密码更新功能
const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, '请输入当前密码'),
  newPassword: passwordSchema,
  confirmPassword: z.string()
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: '两次输入的新密码不一致',
  path: ['confirmPassword'],
});

export const updatePassword = validatedActionWithUser(
  updatePasswordSchema,
  async (data, _, user) => {
    const { currentPassword, newPassword } = data;

    try {
      // 验证当前密码
      const isCurrentPasswordValid = await comparePasswords(
        currentPassword,
        user.passwordHash
      );

      if (!isCurrentPasswordValid) {
        return {
          error: '当前密码错误'
        };
      }

      // 哈希新密码
      const newPasswordHash = await hashPassword(newPassword);

      // 更新密码
      await db
        .update(users)
        .set({ 
          passwordHash: newPasswordHash,
          updatedAt: new Date()
        })
        .where(eq(users.id, user.id));

      // 记录活动日志
      await logActivity(user.id, ActivityType.UPDATE_PASSWORD);

      return {
        success: true,
        message: '密码更新成功'
      };

    } catch (error) {
      console.error('密码更新出错:', error);
      return {
        error: '密码更新失败，请重试'
      };
    }
  }
);

// 删除账户功能
const deleteAccountSchema = z.object({
  password: z.string().min(1, '请输入密码确认'),
  confirmDelete: z.boolean().refine((val) => val === true, {
    message: '请确认删除账户'
  })
});

export const deleteAccount = validatedActionWithUser(
  deleteAccountSchema,
  async (data, _, user) => {
    const { password } = data;

    try {
      // 验证密码
      const isPasswordValid = await comparePasswords(password, user.passwordHash);
      if (!isPasswordValid) {
        return {
          error: '密码错误'
        };
      }

      // 软删除用户（设置deletedAt）
      await db
        .update(users)
        .set({ 
          deletedAt: new Date(),
          isActive: false
        })
        .where(eq(users.id, user.id));

      // 记录活动日志
      await logActivity(user.id, ActivityType.DELETE_ACCOUNT);

      // 清除会话
      (await cookies()).delete('session');

      redirect('/');

    } catch (error) {
      console.error('删除账户出错:', error);
      return {
        error: '删除账户失败，请重试'
      };
    }
  }
);