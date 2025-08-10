'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { joinTeam } from '@/app/teams/actions';
import { UserPlus } from 'lucide-react';

interface JoinTeamButtonProps {
  teamId: number;
  canJoin: boolean;
}

export function JoinTeamButton({ teamId, canJoin }: JoinTeamButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleJoinTeam = async () => {
    if (!canJoin) return;
    
    const message = prompt('请输入申请理由（可选）:');
    if (message === null) return; // 用户取消了
    
    setIsLoading(true);
    try {
      const result = await joinTeam({
        teamId,
        message: message || '',
      });
      
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        window.location.reload();
      }
    } catch (error) {
      console.error('申请加入队伍失败:', error);
      alert('申请失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  if (!canJoin) {
    return (
      <Button 
        variant="outline" 
        className="w-full border-white/50 dark:border-gray-700/70 text-gray-600 dark:text-gray-300 bg-white/70 dark:bg-gray-800/70 backdrop-blur-md cursor-not-allowed" 
        disabled
      >
        <UserPlus className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
        已在队伍中
      </Button>
    );
  }

  return (
    <Button 
      className="w-full bg-blue-600/95 hover:bg-blue-700/95 text-white shadow-lg hover:shadow-xl transition-all duration-200 rounded-lg font-medium backdrop-blur-md"
      onClick={handleJoinTeam}
      disabled={isLoading}
    >
      <UserPlus className="w-4 h-4 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
      {isLoading ? '申请中...' : '申请加入'}
    </Button>
  );
}