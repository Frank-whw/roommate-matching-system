'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createTeam } from '@/app/teams/actions';
import { useRouter } from 'next/navigation';
import { 
  Users,
  Crown,
  MapPin,
  FileText,
  AlertCircle
} from 'lucide-react';

export function CreateTeamForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const data = {
      name: formData.get('name') as string,
      description: formData.get('description') as string,
      dormArea: formData.get('dormArea') as string,
      requirements: formData.get('requirements') as string,
      maxMembers: parseInt(formData.get('maxMembers') as string) || 4,
    };

    try {
      const result = await createTeam(data);
      
      if (result.error) {
        setError(result.error);
      } else {
        // 创建成功，跳转到队伍页面
        router.push('/teams');
        router.refresh();
      }
    } catch (error) {
      console.error('创建队伍失败:', error);
      setError('创建队伍失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <span className="text-red-700 dark:text-red-200">{error}</span>
          </div>
        </div>
      )}

      {/* 队伍名称 */}
      <div>
        <Label htmlFor="name" className="flex items-center">
          <Crown className="w-4 h-4 mr-2" />
          队伍名称 <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={100}
          placeholder="例如：学霸联盟、夜猫子小队..."
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          队伍名称将显示在队伍列表中，建议简洁有特色
        </p>
      </div>

      {/* 队伍描述 */}
      <div>
        <Label htmlFor="description" className="flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          队伍描述
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="介绍您的队伍文化、氛围和特色..."
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          详细的描述有助于吸引合适的室友加入
        </p>
      </div>

      {/* 宿舍区域偏好 */}
      <div>
        <Label htmlFor="dormArea" className="flex items-center">
          <MapPin className="w-4 h-4 mr-2" />
          期望宿舍区域
        </Label>
        <Input
          id="dormArea"
          name="dormArea"
          placeholder="例如：东区、西区、南区..."
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          填写您希望的宿舍区域，帮助匹配附近的室友
        </p>
      </div>

      {/* 最大成员数 */}
      <div>
        <Label htmlFor="maxMembers" className="flex items-center">
          <Users className="w-4 h-4 mr-2" />
          队伍规模
        </Label>
        <Select name="maxMembers" defaultValue="4">
          <SelectTrigger className="mt-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="2">2人队伍</SelectItem>
            <SelectItem value="3">3人队伍</SelectItem>
            <SelectItem value="4">4人队伍</SelectItem>
          </SelectContent>
        </Select>
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          包括您在内的队伍总人数
        </p>
      </div>

      {/* 招募要求 */}
      <div>
        <Label htmlFor="requirements" className="flex items-center">
          <FileText className="w-4 h-4 mr-2" />
          招募要求
        </Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={3}
          placeholder="例如：作息规律、保持安静、共同维护卫生..."
          className="mt-1"
        />
        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          明确您的期望，帮助筛选合适的队友
        </p>
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center justify-end space-x-4 pt-6 border-t">
        <Button 
          type="button" 
          variant="outline" 
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          取消
        </Button>
        <Button 
          type="submit" 
          disabled={isSubmitting}
          className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {isSubmitting ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              创建中...
            </>
          ) : (
            <>
              <Crown className="w-4 h-4 mr-2" />
              创建队伍
            </>
          )}
        </Button>
      </div>

      {/* 创建提醒 */}
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <div className="flex items-start">
          <AlertCircle className="w-5 h-5 text-blue-500 mr-2 mt-0.5" />
          <div className="text-sm text-blue-700 dark:text-blue-200">
            <p className="font-medium mb-1">创建后您将成为队长</p>
            <p>您可以管理队伍成员、审核加入申请，并在任何时候修改队伍信息。</p>
          </div>
        </div>
      </div>
    </form>
  );
}