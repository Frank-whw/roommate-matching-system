'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Settings,
  Trash2,
  Edit,
  Crown,
  UserMinus,
  MoreHorizontal,
} from 'lucide-react';
import Link from 'next/link';
import { disbandTeam, leaveTeam } from '@/app/teams/actions';
import { useRouter } from 'next/navigation';

interface TeamManagementActionsProps {
  teamId: number;
  teamName: string;
  isLeader: boolean;
}

export function TeamManagementActions({ teamId, teamName, isLeader }: TeamManagementActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleDisbandTeam = async () => {
    if (!confirm(`确定要解散队伍 "${teamName}" 吗？此操作不可撤销！`)) {
      return;
    }

    setIsProcessing(true);
    try {
      const result = await disbandTeam({ teamId });
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        router.push('/teams');
        router.refresh();
      }
    } catch (error) {
      console.error('解散队伍失败:', error);
      alert('解散队伍失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isLeader) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="ml-auto" disabled={isProcessing}>
          <Settings className="w-4 h-4" />
          <span className="sr-only">管理</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={handleDisbandTeam} className="text-red-600" disabled={isProcessing}>
          <Trash2 className="w-4 h-4 mr-2" />
          {isProcessing ? '解散中...' : '解散队伍'}
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href={`/teams/${teamId}/edit`}>
            <Edit className="w-4 h-4 mr-2" />
            编辑队伍信息
          </Link>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// 普通成员退出队伍组件
interface LeaveTeamButtonProps {
  teamId: number;
  teamName: string;
  isLeader: boolean;
}

export function LeaveTeamButton({ teamId, teamName, isLeader }: LeaveTeamButtonProps) {
  const [isProcessing, setIsProcessing] = useState(false);
  const router = useRouter();

  const handleLeaveTeam = async () => {
    if (isLeader) {
      if (!confirm(`您是队长，退出队伍将解散整个队伍。确定要退出队伍 "${teamName}" 吗？`)) {
        return;
      }
    } else {
      if (!confirm(`确定要退出队伍 "${teamName}" 吗？`)) {
        return;
      }
    }

    setIsProcessing(true);
    try {
      const result = await leaveTeam({ teamId });
      if (result.error) {
        alert(result.error);
      } else {
        alert(result.message);
        router.push('/teams');
        router.refresh();
      }
    } catch (error) {
      console.error('退出队伍失败:', error);
      alert('退出队伍失败，请重试');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleLeaveTeam}
      disabled={isProcessing}
      className="text-red-600 border-red-200 hover:bg-red-50 hover:border-red-300"
    >
      {isProcessing ? '退出中...' : '退出队伍'}
    </Button>
  );
}

interface MemberManagementActionsProps {
  memberId: number;
  memberName: string;
  isLeader: boolean;
  isCurrentUser: boolean;
  teamId: number;
}

export function MemberManagementActions({ 
  memberId, 
  memberName, 
  isLeader, 
  isCurrentUser,
  teamId
}: MemberManagementActionsProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleTransferLeadership = async () => {
    if (!confirm(`确定要将队长权限转移给 ${memberName || '该成员'} 吗？`)) {
      return;
    }
    // TODO: 实现转移队长权限的逻辑
    alert('转移队长权限功能待实现');
  };

  const handleRemoveMember = async () => {
    if (!confirm(`确定要移除成员 ${memberName || '该成员'} 吗？`)) {
      return;
    }
    // TODO: 实现移除成员的逻辑
    alert('移除成员功能待实现');
  };

  if (!isLeader || isCurrentUser) {
    return null;
  }

  return (
    <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" disabled={isProcessing}>
            <MoreHorizontal className="w-4 h-4" />
            <span className="sr-only">打开菜单</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>成员操作</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleTransferLeadership} disabled={isProcessing}>
            <Crown className="w-4 h-4 mr-2" />
            设为队长
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={handleRemoveMember} 
            className="text-red-600"
            disabled={isProcessing}
          >
            <UserMinus className="w-4 h-4 mr-2" />
            移除成员
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}