'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { UserMinus, Loader2 } from 'lucide-react';

interface LeaveTeamButtonProps {
  teamId: number;
  teamName: string;
}

export function LeaveTeamButton({ teamId, teamName }: LeaveTeamButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLeaveTeam = async () => {
    if (!confirm(`确定要退出队伍「${teamName}」吗？退出后您将无法查看队伍信息和成员联系方式，需要重新申请才能加入。`)) {
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch(`/api/teams/${teamId}/join`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '退出队伍失败');
      }

      alert('已成功退出队伍');
      router.push('/teams');
      router.refresh();
    } catch (error) {
      console.error('退出队伍失败:', error);
      alert(error instanceof Error ? error.message : '退出队伍失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm"
      onClick={handleLeaveTeam}
      disabled={isLoading}
      className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 border-red-200 dark:border-red-800"
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-1 animate-spin" />
          退出中...
        </>
      ) : (
        <>
          <UserMinus className="w-4 h-4 mr-1" />
          退出队伍
        </>
      )}
    </Button>
   );
}