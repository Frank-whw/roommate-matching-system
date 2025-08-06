'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  User, 
  Heart,
  Clock,
  Home,
  Brain,
  MessageSquare,
  Loader2,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { updateProfile } from '@/app/profile/actions';

interface ProfileFormProps {
  user: any;
  hasProfile: boolean;
  initialProfile: any;
}

export function ProfileForm({ user, hasProfile, initialProfile }: ProfileFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [formData, setFormData] = useState({
    // 基本信息
    nickname: initialProfile?.nickname || '',
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

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage(null);

    // 转换数据类型
    const submitData = {
      ...formData,
      age: formData.age ? parseInt(formData.age) : undefined,
    // 移除空字符串，让验证器处理为 undefined
      nickname: formData.nickname || undefined,
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

    try {
      const result = await updateProfile(submitData);
      
      if (result?.error) {
        setMessage({ type: 'error', text: result.error });
      } else {
        setMessage({ 
          type: 'success', 
          text: result?.message || '个人资料已成功更新！' 
        });
      }
    } catch (error) {
      console.error('提交表单时出错:', error);
      setMessage({ type: 'error', text: '更新失败，请重试' });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 计算完成进度
  const requiredFields = [
    formData.nickname, formData.wechatId, formData.gender, formData.age,
    formData.sleepTime, formData.wakeTime, formData.studyHabit,
    formData.lifestyle, formData.cleanliness, formData.mbti,
    formData.roommateExpectations, formData.hobbies
  ];
  const completedFields = requiredFields.filter(field => field !== '').length;
  const completionPercentage = Math.round((completedFields / requiredFields.length) * 100);

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* 状态消息 */}
      {message && (
        <Alert className={message.type === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
          {message.type === 'success' ? (
            <CheckCircle className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <AlertDescription className={message.type === 'success' ? 'text-green-800' : 'text-red-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

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
          ></div>
        </div>
      </div>

      {/* 基本信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="w-5 h-5 mr-2" />
            基本信息
          </CardTitle>
          <CardDescription>
            请填写您的基本个人信息
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="nickname">昵称</Label>
              <Input
                id="nickname"
                type="text"
                placeholder="请输入您的昵称，比如：Frank"
                value={formData.nickname}
                onChange={(e) => handleInputChange('nickname', e.target.value)}
                maxLength={50}
              />
            </div>

            <div>
              <Label htmlFor="wechatId">微信号</Label>
              <Input
                id="wechatId"
                type="text"
                placeholder="请输入您的微信号"
                value={formData.wechatId}
                onChange={(e) => handleInputChange('wechatId', e.target.value)}
                maxLength={100}
              />
            </div>
            
            <div>
              <Label htmlFor="gender">性别</Label>
              <Select value={formData.gender} onValueChange={(value) => handleInputChange('gender', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择性别" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">男</SelectItem>
                  <SelectItem value="female">女</SelectItem>
                  <SelectItem value="other">其他</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="age">年龄</Label>
              <Input
                id="age"
                type="number"
                placeholder="请输入年龄"
                value={formData.age}
                onChange={(e) => handleInputChange('age', e.target.value)}
                min="16"
                max="35"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 作息习惯 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clock className="w-5 h-5 mr-2" />
            作息习惯
          </CardTitle>
          <CardDescription>
            您的日常作息时间和学习习惯
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="sleepTime">睡觉时间</Label>
              <Input
                id="sleepTime"
                type="time"
                value={formData.sleepTime}
                onChange={(e) => handleInputChange('sleepTime', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="wakeTime">起床时间</Label>
              <Input
                id="wakeTime"
                type="time"
                value={formData.wakeTime}
                onChange={(e) => handleInputChange('wakeTime', e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="studyHabit">学习习惯</Label>
              <Select value={formData.studyHabit} onValueChange={(value) => handleInputChange('studyHabit', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择学习习惯" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="library">常在图书馆</SelectItem>
                  <SelectItem value="dormitory">常在寝室</SelectItem>
                  <SelectItem value="flexible">灵活</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 生活习惯 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Home className="w-5 h-5 mr-2" />
            生活习惯
          </CardTitle>
          <CardDescription>
            您的生活方式和性格特征
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
            <div>
              <Label htmlFor="lifestyle">生活方式</Label>
              <Select value={formData.lifestyle} onValueChange={(value) => handleInputChange('lifestyle', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择生活方式" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="quiet">安静型</SelectItem>
                  <SelectItem value="social">社交型</SelectItem>
                  <SelectItem value="balanced">平衡型</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="cleanliness">清洁习惯</Label>
              <Select value={formData.cleanliness} onValueChange={(value) => handleInputChange('cleanliness', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择清洁习惯" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="extremely_clean">极爱干净</SelectItem>
                  <SelectItem value="regularly_tidy">定期收拾</SelectItem>
                  <SelectItem value="acceptable">过得去就行</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="mbti">MBTI性格类型</Label>
              <Select value={formData.mbti} onValueChange={(value) => handleInputChange('mbti', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="请选择MBTI类型" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="INTJ">INTJ - 建筑师</SelectItem>
                  <SelectItem value="INTP">INTP - 逻辑学家</SelectItem>
                  <SelectItem value="ENTJ">ENTJ - 指挥官</SelectItem>
                  <SelectItem value="ENTP">ENTP - 辩论家</SelectItem>
                  <SelectItem value="INFJ">INFJ - 提倡者</SelectItem>
                  <SelectItem value="INFP">INFP - 调停者</SelectItem>
                  <SelectItem value="ENFJ">ENFJ - 主人公</SelectItem>
                  <SelectItem value="ENFP">ENFP - 竞选者</SelectItem>
                  <SelectItem value="ISTJ">ISTJ - 物流师</SelectItem>
                  <SelectItem value="ISFJ">ISFJ - 守护者</SelectItem>
                  <SelectItem value="ESTJ">ESTJ - 总经理</SelectItem>
                  <SelectItem value="ESFJ">ESFJ - 执政官</SelectItem>
                  <SelectItem value="ISTP">ISTP - 鉴赏家</SelectItem>
                  <SelectItem value="ISFP">ISFP - 探险家</SelectItem>
                  <SelectItem value="ESTP">ESTP - 企业家</SelectItem>
                  <SelectItem value="ESFP">ESFP - 娱乐家</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 室友期待与兴趣 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Heart className="w-5 h-5 mr-2" />
            室友期待与兴趣
          </CardTitle>
          <CardDescription>
            描述您对室友的期待和您的兴趣爱好
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="roommateExpectations">室友期待</Label>
            <Textarea
              id="roommateExpectations"
              placeholder="描述您希望室友具备的特质，如：作息规律、爱干净、好相处等..."
              value={formData.roommateExpectations}
              onChange={(e) => handleInputChange('roommateExpectations', e.target.value)}
              maxLength={1000}
              rows={3}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.roommateExpectations.length}/1000
            </div>
          </div>
          
          <div>
            <Label htmlFor="hobbies">兴趣爱好</Label>
            <Textarea
              id="hobbies"
              placeholder="分享您的兴趣爱好，如：读书、运动、音乐、游戏等..."
              value={formData.hobbies}
              onChange={(e) => handleInputChange('hobbies', e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.hobbies.length}/500
            </div>
          </div>
          
          <div>
            <Label htmlFor="dealBreakers">不可接受的行为</Label>
            <Textarea
              id="dealBreakers"
              placeholder="描述您不能容忍的室友行为，如：不爱干净、经常带朋友回宿舍等..."
              value={formData.dealBreakers}
              onChange={(e) => handleInputChange('dealBreakers', e.target.value)}
              maxLength={500}
              rows={3}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.dealBreakers.length}/500
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 个人简介 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <MessageSquare className="w-5 h-5 mr-2" />
            个人简介
          </CardTitle>
          <CardDescription>
            简短介绍一下自己
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="bio">个人简介</Label>
            <Textarea
              id="bio"
              placeholder="用简短的话介绍一下自己，让其他人更了解您..."
              value={formData.bio}
              onChange={(e) => handleInputChange('bio', e.target.value)}
              maxLength={500}
              rows={4}
            />
            <div className="text-right text-sm text-gray-500 mt-1">
              {formData.bio.length}/500
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 提交按钮 */}
      <div className="flex justify-stretch sm:justify-end">
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="w-full sm:w-auto px-6 sm:px-8"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              保存中...
            </>
          ) : (
            <>
              <CheckCircle className="w-4 h-4 mr-2" />
              保存资料
            </>
          )}
        </Button>
      </div>
    </form>
  );
}