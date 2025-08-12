import { notFound, redirect } from 'next/navigation';
import { eq, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { teams, teamMembers } from '@/lib/db/schema';
import { getCurrentUser } from '@/lib/db/queries';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EditTeamForm } from '@/components/teams/edit-team-form';
import { Edit, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface EditTeamPageProps {
  params: {
    id: string;
  };
}

export default async function EditTeamPage({ params }: EditTeamPageProps) {
  const { user } = await getCurrentUser();
  
  if (!user) {
    redirect('/login');
  }

  const teamId = parseInt(params.id);
  if (isNaN(teamId)) {
    notFound();
  }

  // 获取队伍信息并检查当前用户是否为队长
  const teamData = await db
    .select({
      team: teams,
      membership: teamMembers,
    })
    .from(teams)
    .innerJoin(teamMembers, and(
      eq(teamMembers.teamId, teams.id),
      eq(teamMembers.userId, user.users.id),
      eq(teamMembers.isLeader, true)
    ))
    .where(eq(teams.id, teamId))
    .limit(1);

  if (teamData.length === 0) {
    // 用户不是该队伍的队长或队伍不存在
    notFound();
  }

  const team = teamData[0].team;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 dark:from-gray-900 dark:via-blue-900/20 dark:to-purple-900/20">
      <div className="container mx-auto px-4 py-8">
        {/* 页面标题 */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/teams/${team.id}`}>
                <ArrowLeft className="w-4 h-4 mr-2" />
                返回队伍详情
              </Link>
            </Button>
          </div>
          
          <div className="text-center">
            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              编辑队伍信息
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              修改队伍的基本信息，让更多合适的室友找到你们
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 主要内容 - 编辑表单 */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Edit className="w-5 h-5 mr-2" style={{ fill: 'none', stroke: 'currentColor' }} />
                  编辑队伍信息
                </CardTitle>
                <CardDescription>
                  修改队伍基本信息，更新后的信息会立即生效
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EditTeamForm team={team} />
              </CardContent>
            </Card>
          </div>

          {/* 侧边栏 - 提示信息 */}
          <div className="space-y-6">
            {/* 编辑权限说明 */}
            <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-blue-900 dark:text-blue-100">
                  编辑权限
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-blue-800 dark:text-blue-200 space-y-2">
                  <li>• 只有队长可以编辑队伍信息</li>
                  <li>• 修改后的信息会立即对所有用户可见</li>
                  <li>• 队伍成员数量无法通过编辑修改</li>
                </ul>
              </CardContent>
            </Card>

            {/* 编辑建议 */}
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg text-green-900 dark:text-green-100">
                  编辑建议
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="text-sm text-green-800 dark:text-green-200 space-y-2">
                  <li>• 队伍名称要简洁有特色</li>
                  <li>• 描述要突出队伍文化和氛围</li>
                  <li>• 招募要求要明确具体</li>
                  <li>• 定期更新信息保持活跃度</li>
                </ul>
              </CardContent>
            </Card>

            {/* 当前队伍信息 */}
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="text-lg">
                  当前队伍信息
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0 space-y-3">
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">队伍名称</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{team.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">成员数量</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{team.currentMembers}/{team.maxMembers}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-300">队伍状态</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {team.status === 'recruiting' ? '招募中' : team.status === 'full' ? '已满员' : '已解散'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: EditTeamPageProps) {
  const teamId = parseInt(params.id);
  if (isNaN(teamId)) {
    return {
      title: '队伍不存在',
    };
  }

  const team = await db
    .select({ name: teams.name })
    .from(teams)
    .where(eq(teams.id, teamId))
    .limit(1);

  if (team.length === 0) {
    return {
      title: '队伍不存在',
    };
  }

  return {
    title: `编辑队伍 - ${team[0].name}`,
    description: `编辑队伍 ${team[0].name} 的基本信息`,
  };
}