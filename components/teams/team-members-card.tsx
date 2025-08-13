'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger 
} from '@/components/ui/dropdown-menu';
import { TeamMemberContact } from './team-member-contact';

interface Member {
  id: number;
  user: any;
  profile: any;
  membership: any;
  contactInfo?: any;
}

interface TeamMembersCardProps {
  members: Member[];
  currentUserId: number;
  onRemoveMember?: (id: number) => void;
  onSetLeader?: (id: number) => void;
  onAddMember?: () => void;
}

export function TeamMembersCard({
  members,
  currentUserId,
  onRemoveMember,
  onSetLeader,
  onAddMember,
}: TeamMembersCardProps) {
  const [showAddModal, setShowAddModal] = useState(false);

  return (
    <Card className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-lg">队伍成员</h3>
        <Button size="sm" onClick={() => setShowAddModal(true)}>
          添加成员
        </Button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {members.map((member) => (
          <div key={member.id} className="relative group">
            <Link
              href={`/users/${member.user.id}`}
              className="block hover:bg-gray-50 dark:hover:bg-gray-800 rounded transition"
              prefetch={false}
            >
              <TeamMemberContact
                member={member}
                isCurrentUser={member.user.id === currentUserId}
              />
            </Link>
            {/* 管理操作入口 */}
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button size="icon" variant="ghost">⋮</Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuItem onClick={() => {/* 弹窗展示详情 */}}>
                    查看详情
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onRemoveMember && onRemoveMember(member.id)}
                    disabled={member.user.id === currentUserId}
                  >
                    移除成员
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={() => onSetLeader && onSetLeader(member.id)}
                    disabled={member.membership.role === 'leader'}
                  >
                    设为队长
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        ))}
      </div>
      {/* 添加成员弹窗 */}
      {showAddModal && (
        <div>
          {/* 这里放添加成员的表单Modal */}
        </div>
      )}
    </Card>
  );
}