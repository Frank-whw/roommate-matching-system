'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { updateTeam } from '@/app/teams/actions';
import { useRouter } from 'next/navigation';
import { 
  Users,
  Crown,
  FileText,
  AlertCircle
} from 'lucide-react';

interface Team {
  id: number;
  name: string;
  description: string | null;
  requirements: string | null;
}

interface EditTeamFormProps {
  team: Team;
}

export function EditTeamForm({ team }: EditTeamFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [description, setDescription] = useState(team.description || '');
  const [requirements, setRequirements] = useState(team.requirements || '');
  const router = useRouter();

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError('');

    const formData = new FormData(event.currentTarget);
    const data = {
      teamId: team.id,
      name: formData.get('name') as string,
      description: description.trim() || undefined,
      requirements: requirements.trim() || undefined,
    };

    try {
      const result = await updateTeam(data);
      
      if (result.error) {
        setError(result.error);
      } else {
        // 更新成功，跳转回队伍详情页面
        router.push(`/teams/${team.id}`);
        router.refresh();
      }
    } catch (error) {
      console.error('更新队伍失败:', error);
      setError('更新队伍失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-100/80 dark:bg-red-900/30 border border-red-300/80 dark:border-red-700/80 rounded-xl p-4 backdrop-blur-md">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
            <span className="text-red-800 dark:text-red-200 font-medium">{error}</span>
          </div>
        </div>
      )}

      {/* 队伍名称 */}
      <div className="bg-white/80 dark:bg-gray-900/70 border border-white/40 dark:border-gray-700/60 rounded-xl p-6 backdrop-blur-2xl shadow-lg">
        <Label htmlFor="name" className="flex items-center text-gray-900 dark:text-white font-semibold">
          <Crown className="w-4 h-4 mr-2 text-blue-600" style={{ fill: 'none', stroke: 'currentColor' }} />
          队伍名称 <span className="text-red-500 ml-1">*</span>
        </Label>
        <Input
          id="name"
          name="name"
          required
          maxLength={100}
          defaultValue={team.name}
          placeholder="例如：学霸联盟、夜猫子小队..."
          className="mt-3 border-white/50 dark:border-gray-700/70 focus:border-blue-500 focus:ring-blue-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
        />
        <p className="text-xs text-gray-600 dark:text-gray-300 mt-2">
          队伍名称将显示在队伍列表中，建议简洁有特色
        </p>
      </div>

      {/* 队伍描述 */}
      <div className="bg-white/80 dark:bg-gray-900/70 border border-white/40 dark:border-gray-700/60 rounded-xl p-6 backdrop-blur-2xl shadow-lg">
        <Label htmlFor="description" className="flex items-center text-gray-900 dark:text-white font-semibold">
          <FileText className="w-4 h-4 mr-2 text-blue-600" style={{ fill: 'none', stroke: 'currentColor' }} />
          队伍描述
        </Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          maxLength={100}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="介绍您的队伍文化、氛围和特色..."
          className="mt-3 border-white/50 dark:border-gray-700/70 focus:border-blue-500 focus:ring-blue-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            详细的描述有助于吸引合适的室友加入
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {description.length}/100
          </p>
        </div>
      </div>

      {/* 招募要求 */}
      <div className="bg-white/80 dark:bg-gray-900/70 border border-white/40 dark:border-gray-700/60 rounded-xl p-6 backdrop-blur-2xl shadow-lg">
        <Label htmlFor="requirements" className="flex items-center text-gray-900 dark:text-white font-semibold">
          <FileText className="w-4 h-4 mr-2 text-blue-600" style={{ fill: 'none', stroke: 'currentColor' }} />
          招募要求
        </Label>
        <Textarea
          id="requirements"
          name="requirements"
          rows={4}
          maxLength={100}
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          placeholder="说明您希望招募什么样的室友，例如：作息时间、生活习惯、学习态度等..."
          className="mt-3 border-white/50 dark:border-gray-700/70 focus:border-blue-500 focus:ring-blue-500 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
        />
        <div className="flex justify-between items-center mt-2">
          <p className="text-xs text-gray-600 dark:text-gray-300">
            明确的要求有助于找到更合适的室友
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {requirements.length}/100
          </p>
        </div>
      </div>

      {/* 队伍信息提示 */}
      <div className="bg-blue-100/80 dark:bg-blue-900/30 border border-blue-300/60 dark:border-blue-700/60 rounded-xl p-6 backdrop-blur-2xl">
        <div className="flex items-start">
          <Users className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-3 mt-0.5" style={{ fill: 'none', stroke: 'currentColor' }} />
          <div>
            <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-2">
              编辑提示
            </h4>
            <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
              <li>• 队伍最多4人，包括队长</li>
              <li>• 只有队长可以编辑队伍信息</li>
              <li>• 修改后的信息会立即生效</li>
              <li>• 队伍成员数量无法修改</li>
            </ul>
          </div>
        </div>
      </div>

      {/* 提交按钮 */}
      <div className="flex items-center justify-end space-x-4 pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          className="border-white/50 dark:border-gray-700/70 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md"
        >
          取消
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-600/95 hover:bg-blue-700/95 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg px-8 py-2 font-medium backdrop-blur-md"
        >
          {isSubmitting ? '保存中...' : '保存修改'}
        </Button>
      </div>
    </form>
  );
}