'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, CheckCircle, User, Heart, Clock, Home, Brain, MessageSquare } from 'lucide-react';
import { InputField, TextareaField, SelectField } from '@/components/ui/form-field';
import { ErrorDisplay } from '@/components/ui/error-display';
import { useFormValidation } from '@/lib/validation/client';
import { profileSchemas } from '@/lib/validation/schemas';
import { useFormSubmit } from '@/hooks/use-api';

interface EnhancedProfileFormProps {
  user: any;
  hasProfile: boolean;
  initialProfile?: any;
}

export function EnhancedProfileForm({ user, hasProfile, initialProfile }: EnhancedProfileFormProps) {
  const [formData, setFormData] = useState({
    // 基本信息
    wechatId: initialProfile?.wechatId || '',
    gender: initialProfile?.gender || '',
    age: initialProfile?.age || '',
    
    // 作息习惯
    sleepTime: initialProfile?.sleepTime || '',
    wakeTime: initialProfile?.wakeTime || '',
    studyHabit: initialProfile?.studyHabit || '',
    
    // 生活习惯
    lifestyle: initialProfile?.lifestyle || '',
    cleanliness: initialProfile?.cleanliness || '',
    mbti: initialProfile?.mbti || '',
    
    // 室友期待和兴趣
    roommateExpectations: initialProfile?.roommateExpectations || '',
    hobbies: initialProfile?.hobbies || '',
    dealBreakers: initialProfile?.dealBreakers || '',
    
    // 个人简介
    bio: initialProfile?.bio || ''
  });

  // 表单验证
  const validation = useFormValidation(profileSchemas.updateProfile);
  
  // API调用
  const { submit, loading, error } = useFormSubmit({
    onSuccess: (data) => {
      // 成功后可以刷新页面或显示成功消息
      window.location.reload();
    }
  });

  // 字段变更处理
  const handleFieldChange = (field: string, value: string | number) => {
    const newValue = typeof value === 'number' ? value : value;
    setFormData(prev => ({ ...prev, [field]: newValue }));
    validation.validateField(field, newValue);
  };

  // 表单提交
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 数据类型转换和清理
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age.toString()) : undefined,
      // 空字符串转为undefined
      wechatId: formData.wechatId || undefined,
      gender: formData.gender || undefined,
      sleepTime: formData.sleepTime || undefined,
      wakeTime: formData.wakeTime || undefined,
      studyHabit: formData.studyHabit || undefined,
      lifestyle: formData.lifestyle || undefined,
      cleanliness: formData.cleanliness || undefined,
      mbti: formData.mbti || undefined,
      roommateExpectations: formData.roommateExpectations || undefined,
      hobbies: formData.hobbies || undefined,
      dealBreakers: formData.dealBreakers || undefined,
      bio: formData.bio || undefined
    };

    // 客户端验证
    const validationResult = validation.validateForm(submitData);
    if (!validationResult.isValid) {
      return;
    }

    // 提交到API
    await submit('/api/profile', submitData, 'PUT');
  };

  // 计算完成进度
  const requiredFields = [
    formData.wechatId, formData.gender, formData.age,
    formData.sleepTime, formData.wakeTime, formData.studyHabit,
    formData.lifestyle, formData.cleanliness, formData.mbti,
    formData.roommateExpectations, formData.hobbies
  ];
  const completedFields = requiredFields.filter(field => field !== '').length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  const genderOptions = [
    { value: 'male', label: '男' },
    { value: 'female', label: '女' },
    { value: 'other', label: '其他' }
  ];

  const studyHabitOptions = [
    { value: 'early_bird', label: '早起型' },
    { value: 'night_owl', label: '夜猫子型' },
    { value: 'flexible', label: '灵活型' }
  ];

  const lifestyleOptions = [
    { value: 'quiet', label: '安静型' },
    { value: 'social', label: '社交型' },
    { value: 'balanced', label: '平衡型' }
  ];

  const cleanlinessOptions = [
    { value: 'very_clean', label: '非常整洁' },
    { value: 'clean', label: '比较整洁' },
    { value: 'moderate', label: '一般整洁' }
  ];

  const mbtiOptions = [
    { value: 'INTJ', label: 'INTJ - 建筑师' },
    { value: 'INTP', label: 'INTP - 逻辑学家' },
    { value: 'ENTJ', label: 'ENTJ - 指挥官' },
    { value: 'ENTP', label: 'ENTP - 辩论家' },
    { value: 'INFJ', label: 'INFJ - 提倡者' },
    { value: 'INFP', label: 'INFP - 调停者' },
    { value: 'ENFJ', label: 'ENFJ - 主人公' },
    { value: 'ENFP', label: 'ENFP - 竞选者' },
    { value: 'ISTJ', label: 'ISTJ - 物流师' },
    { value: 'ISFJ', label: 'ISFJ - 守护者' },
    { value: 'ESTJ', label: 'ESTJ - 总经理' },
    { value: 'ESFJ', label: 'ESFJ - 执政官' },
    { value: 'ISTP', label: 'ISTP - 鉴赏家' },
    { value: 'ISFP', label: 'ISFP - 探险家' },
    { value: 'ESTP', label: 'ESTP - 企业家' },
    { value: 'ESFP', label: 'ESFP - 表演者' }
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 完成进度显示 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium">资料完成进度</span>
          <span className="text-sm text-gray-500">{completionPercentage}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          完善个人资料有助于找到更匹配的室友
        </p>
      </div>

      {/* 错误显示 */}
      <ErrorDisplay error={error} onDismiss={() => {}} />

      {/* 个人资料 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            个人资料
          </CardTitle>
          <CardDescription>
            请填写您的详细信息，这将帮助系统为您匹配合适的室友
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 基本信息 */}
          <div className="space-y-4">
            <InputField
              label="微信号"
              value={formData.wechatId}
              onChange={(value) => handleFieldChange('wechatId', value)}
              placeholder="请输入微信号"
              error={validation.errors.wechatId}
              description="方便室友联系您"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="性别"
                value={formData.gender}
                onChange={(value) => handleFieldChange('gender', value)}
                options={genderOptions}
                error={validation.errors.gender}
                required
              />

              <InputField
                label="年龄"
                type="number"
                value={formData.age}
                onChange={(value) => handleFieldChange('age', value)}
                placeholder="请输入年龄"
                min={16}
                max={35}
                error={validation.errors.age}
              />
            </div>
          </div>

          {/* 作息时间 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputField
                label="睡觉时间"
                type="time"
                value={formData.sleepTime}
                onChange={(value) => handleFieldChange('sleepTime', value)}
                error={validation.errors.sleepTime}
                description="例如：23:00"
              />

              <InputField
                label="起床时间"
                type="time"
                value={formData.wakeTime}
                onChange={(value) => handleFieldChange('wakeTime', value)}
                error={validation.errors.wakeTime}
                description="例如：07:00"
              />
            </div>

            <SelectField
              label="学习习惯"
              value={formData.studyHabit}
              onChange={(value) => handleFieldChange('studyHabit', value)}
              options={studyHabitOptions}
              error={validation.errors.studyHabit}
              description="您更偏向什么时候学习"
            />
          </div>

          {/* 生活方式 */}
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <SelectField
                label="生活方式"
                value={formData.lifestyle}
                onChange={(value) => handleFieldChange('lifestyle', value)}
                options={lifestyleOptions}
                error={validation.errors.lifestyle}
              />

              <SelectField
                label="整洁程度"
                value={formData.cleanliness}
                onChange={(value) => handleFieldChange('cleanliness', value)}
                options={cleanlinessOptions}
                error={validation.errors.cleanliness}
              />
            </div>

            <SelectField
              label="MBTI性格类型"
              value={formData.mbti}
              onChange={(value) => handleFieldChange('mbti', value)}
              options={mbtiOptions}
              placeholder="请选择您的MBTI类型"
              error={validation.errors.mbti}
              description="如果不确定，可以在网上进行MBTI测试"
            />
          </div>

          {/* 详细描述 */}
          <div className="space-y-4">
            <TextareaField
              label="室友期待"
              value={formData.roommateExpectations}
              onChange={(value) => handleFieldChange('roommateExpectations', value)}
              placeholder="描述您对室友的期待，例如：希望室友作息规律，爱干净..."
              rows={3}
              maxLength={1000}
              error={validation.errors.roommateExpectations}
            />

            <TextareaField
              label="兴趣爱好"
              value={formData.hobbies}
              onChange={(value) => handleFieldChange('hobbies', value)}
              placeholder="分享您的兴趣爱好，例如：阅读、运动、看电影、编程..."
              rows={3}
              maxLength={500}
              error={validation.errors.hobbies}
            />

            <TextareaField
              label="不可接受的行为"
              value={formData.dealBreakers}
              onChange={(value) => handleFieldChange('dealBreakers', value)}
              placeholder="描述您绝对不能接受的室友行为，例如：吸烟、大声喧哗..."
              rows={3}
              maxLength={500}
              error={validation.errors.dealBreakers}
            />

            <TextareaField
              label="个人简介"
              value={formData.bio}
              onChange={(value) => handleFieldChange('bio', value)}
              placeholder="简单介绍一下自己的性格、专业、生活状态等..."
              rows={4}
              maxLength={500}
              error={validation.errors.bio}
            />
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-end space-x-4">
        <Button
          type="submit"
          className="px-8"
          disabled={loading || completionPercentage < 50}
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
              保存中...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              {hasProfile ? '更新资料' : '保存资料'}
            </>
          )}
        </Button>
      </div>

      {completionPercentage < 50 && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
          <p className="text-sm text-yellow-800 dark:text-yellow-200">
            <strong>提示：</strong>请至少完成50%的资料填写才能保存。当前完成度：{completionPercentage}%
          </p>
        </div>
      )}
    </form>
  );
}