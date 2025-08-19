// 客户端表单验证工具

import { z } from 'zod';
import { FormError, ValidationResult } from '@/lib/errors/types';

// 验证单个字段
export function validateField(
  value: any,
  schema: z.ZodSchema,
  fieldName: string
): FormError | null {
  try {
    schema.parse(value);
    return null;
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      return {
        field: fieldName,
        message: firstError.message,
        code: firstError.code
      };
    }
    return {
      field: fieldName,
      message: '验证失败',
      code: 'validation_error'
    };
  }
}

// 验证整个表单
export function validateFormData<T>(
  data: T,
  schema: z.ZodSchema<T>
): ValidationResult {
  try {
    schema.parse(data);
    return {
      isValid: true,
      errors: []
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: FormError[] = error.errors.map(err => ({
        field: err.path.join('.'),
        message: err.message,
        code: err.code
      }));
      
      return {
        isValid: false,
        errors
      };
    }
    
    return {
      isValid: false,
      errors: [{
        field: 'form',
        message: '表单验证失败',
        code: 'form_error'
      }]
    };
  }
}

// 实时验证Hook
import { useState, useCallback } from 'react';

export function useFormValidation<T>(schema: z.ZodSchema<T>) {
  const [errors, setErrors] = useState<Record<string, FormError>>({});
  const [isValid, setIsValid] = useState<boolean>(false);

  const validateField = useCallback((fieldName: string, value: any) => {
    try {
      // 尝试创建一个部分对象来验证单个字段
      const partialData = { [fieldName]: value };
      if (typeof (schema as any).partial === 'function') {
        (schema as any).partial().parse(partialData);
      } else {
        // 如果没有 partial 方法，直接验证整个表单
        return;
      }
      
      // 验证成功，移除错误
      setErrors(prev => {
        const { [fieldName]: removed, ...rest } = prev;
        return rest;
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        const firstError = error.errors[0];
        if (firstError.path.includes(fieldName)) {
          setErrors(prev => ({
            ...prev,
            [fieldName]: {
              field: fieldName,
              message: firstError.message,
              code: firstError.code
            }
          }));
        }
      }
    }
  }, [schema]);

  const validateForm = useCallback((data: T) => {
    const result = validateFormData(data, schema);
    
    if (result.isValid) {
      setErrors({});
      setIsValid(true);
    } else {
      const errorMap: Record<string, FormError> = {};
      result.errors.forEach(error => {
        errorMap[error.field] = error;
      });
      setErrors(errorMap);
      setIsValid(false);
    }
    
    return result;
  }, [schema]);

  const clearErrors = useCallback(() => {
    setErrors({});
    setIsValid(false);
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setErrors(prev => {
      const { [fieldName]: removed, ...rest } = prev;
      return rest;
    });
  }, []);

  return {
    errors,
    isValid,
    validateField,
    validateForm,
    clearErrors,
    clearFieldError,
    hasErrors: Object.keys(errors).length > 0
  };
}

// 密码强度检查
export function checkPasswordStrength(password: string) {
  const checks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /\d/.test(password),
    special: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
  };

  const score = Object.values(checks).filter(Boolean).length;
  
  let strength: 'weak' | 'medium' | 'strong' = 'weak';
  if (score >= 4) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    score,
    strength,
    checks,
    suggestions: [
      !checks.length && '至少8个字符',
      !checks.uppercase && '包含大写字母',
      !checks.lowercase && '包含小写字母',
      !checks.number && '包含数字',
      !checks.special && '包含特殊字符（推荐）'
    ].filter(Boolean)
  };
}

// 学号格式检查
export function checkStudentIdFormat(studentId: string) {
  const pattern = /^10255501(\d{3})$/;
  const match = studentId.match(pattern);
  
  if (!match) {
    return {
      isValid: false,
      message: '学号格式错误，应为10255501XXX格式',
      suggestions: ['请检查学号格式', '确保为11位数字', '以10255501开头']
    };
  }

  return {
    isValid: true,
    message: '学号格式正确'
  };
}

// 微信号格式检查
export function checkWechatIdFormat(wechatId: string) {
  if (!wechatId) {
    return { isValid: true, message: '' }; // 可选字段
  }

  const pattern = /^[a-zA-Z][a-zA-Z0-9_-]{5,19}$/;
  
  if (!pattern.test(wechatId)) {
    return {
      isValid: false,
      message: '微信号格式不正确',
      suggestions: [
        '以字母开头',
        '6-20位字符',
        '只能包含字母、数字、下划线、连字符'
      ]
    };
  }

  return {
    isValid: true,
    message: '微信号格式正确'
  };
}

// 时间格式检查
export function checkTimeFormat(time: string) {
  if (!time) {
    return { isValid: true, message: '' }; // 可选字段
  }

  const pattern = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  
  if (!pattern.test(time)) {
    return {
      isValid: false,
      message: '时间格式不正确',
      suggestions: ['格式应为HH:mm', '例如：08:30、23:00']
    };
  }

  return {
    isValid: true,
    message: '时间格式正确'
  };
}