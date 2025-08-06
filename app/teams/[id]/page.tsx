import { redirect, notFound } from 'next/navigation';
import Link from 'next/link';
import { getCurrentUser, getTeamWithMembers, getUserTeam } from '@/lib/db/queries';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { joinTeam } from '@/app/teams/actions';
import { 
  ArrowLeft,
  Crown,
  Users,
  MapPin,
  Calendar,
  FileText,
  UserPlus,
  MessageCircle,
  Eye,
  User,
  GraduationCap,
  Mail,
  IdCard,
  Sparkles
} from 'lucide-react';

interface TeamDetailsPageProps {
  params: Promise<{ id: string }>;
}

export default async function TeamDetailsPage({ params }: TeamDetailsPageProps) {
  const { user: currentUser } = await getCurrentUser();
  
  if (!currentUser) {
    redirect('/sign-in');
  }

  const { id } = await params;
  const teamId = parseInt(id);
  
  if (isNaN(teamId)) {
    notFound();
  }

  const team = await getTeamWithMembers(teamId);
  
  if (!team) {
    notFound();
  }

  // 检查用户是否已在队伍中
  const userTeam = await getUserTeam(currentUser.users.id);
  const canJoin = !userTeam;

  const formatDate = (dateString: Date) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return '今天创建';
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}天前创建`;
    }
  };

  const leader = team.members.find(member => member.membership.isLeader);
  const regularMembers = team.members.filter(member => !member.membership.isLeader);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-6xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* 返回按钮 */}
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/teams" className="inline-flex items-center">
              <ArrowLeft className="w-4 h-4 mr-2" />
              返回队伍广场
            </Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 左侧：队伍基本信息 */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full flex items-center justify-center">
                    <Users className="w-10 h-10 text-white" />
                  </div>
                  
                  <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    {team.name}
                  </h1>
                  
                  <div className="flex justify-center space-x-2 mb-4">
                    <Badge 
                      variant="outline" 
                      className="bg-green-50 dark:bg-green-900/30 border-green-200 dark:border-green-800 text-green-700 dark:text-green-300"
                    >
                      {team.status === 'recruiting' ? '招募中' : '已满员'}
                    </Badge>
                    <Badge variant="outline">
                      队伍 #{team.id}
                    </Badge>
                  </div>

                  <div className="text-center mb-4">
                    <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                      {team.maxMembers - team.members.length}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      剩余位置
                    </div>
                  </div>
                </div>

                {/* 队伍统计 */}
                <div className="space-y-3 text-sm mb-6">
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">当前成员</span>
                    <span className="font-medium">{team.members.length}/{team.maxMembers}</span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-gray-500 dark:text-gray-400">创建时间</span>
                    <span className="font-medium">{formatDate(team.createdAt)}</span>
                  </div>

                  {/* 暂时移除dormArea，因为teams表中没有这个字段 */}
                </div>

                {/* 进度条 */}
                <div className="mb-6">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-500 dark:text-gray-400">队伍成员</span>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {team.members.length}/{team.maxMembers}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                    <div 
                      className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(team.members.length / team.maxMembers) * 100}%` }}
                    />
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="space-y-3">
                  {canJoin ? (
                    <Button 
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
                      onClick={async () => {
                        const message = prompt('请输入申请留言（可选）:');
                        if (message !== null) {
                          const result = await joinTeam({
                            teamId: team.id,
                            message: message || '',
                          });
                          if (result.error) {
                            alert(result.error);
                          } else {
                            alert(result.message);
                            window.location.reload();
                          }
                        }
                      }}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      申请加入
                    </Button>
                  ) : (
                    <Button variant="outline" className="w-full" disabled>
                      <UserPlus className="w-4 h-4 mr-2" />
                      已在队伍中
                    </Button>
                  )}
                  
                  <Button variant="outline" className="w-full" asChild>
                    <Link href={`/matches?teamId=${team.id}`}>
                      <MessageCircle className="w-4 h-4 mr-2" />
                      联系队长
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 右侧：详细信息 */}
          <div className="lg:col-span-2 space-y-6">
            {/* 队伍描述 */}
            {team.description && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    队伍介绍
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {team.description}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 招募要求 */}
            {team.requirements && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <FileText className="w-5 h-5 mr-2" />
                    招募要求
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {team.requirements}
                  </p>
                </CardContent>
              </Card>
            )}

            {/* 队伍成员 */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  队伍成员 ({team.members.length}/{team.maxMembers})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* 队长 */}
                  {leader && (
                    <div className="p-4 bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Link href={`/users/${leader.user.id}`} className="block hover:opacity-80 transition-opacity">
                            <Avatar className="w-12 h-12">
                              <AvatarImage 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(leader.user.name || leader.user.email)}&background=f59e0b&color=fff`} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white">
                                {leader.user.name ? leader.user.name.substring(0, 2) : leader.user.email.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                          <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center">
                            <Crown className="w-3 h-3 text-white" />
                          </div>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Link 
                              href={`/users/${leader.user.id}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {leader.user.name || '队长' + leader.user.id}
                            </Link>
                            <Crown className="w-4 h-4 text-yellow-500" />
                            <Badge variant="outline" className="text-xs bg-yellow-50 border-yellow-200 text-yellow-700">
                              队长
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            学生
                          </div>
                          
                          {leader.profile?.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                              {leader.profile.bio}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/users/${leader.user.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 普通成员 */}
                  {regularMembers.map((member) => (
                    <div key={member.user.id} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="relative">
                          <Link href={`/users/${member.user.id}`} className="block hover:opacity-80 transition-opacity">
                            <Avatar className="w-12 h-12">
                              <AvatarImage 
                                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(member.user.name || member.user.email)}&background=3b82f6&color=fff`} 
                              />
                              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-500 text-white">
                                {member.user.name ? member.user.name.substring(0, 2) : member.user.email.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                          </Link>
                        </div>
                        
                        <div className="flex-1">
                          <div className="flex items-center space-x-2">
                            <Link 
                              href={`/users/${member.user.id}`}
                              className="font-medium text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                            >
                              {member.user.name || '成员' + member.user.id}
                            </Link>
                            <Badge variant="outline" className="text-xs">
                              成员
                            </Badge>
                          </div>
                          
                          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            学生
                          </div>
                          
                          {member.profile?.bio && (
                            <p className="text-sm text-gray-600 dark:text-gray-300 mt-2 line-clamp-2">
                              {member.profile.bio}
                            </p>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <Button variant="outline" size="sm" asChild>
                            <Link href={`/users/${member.user.id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}

                  {/* 空位提示 */}
                  {team.members.length < team.maxMembers && (
                    <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 text-center">
                      <Users className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-500 dark:text-gray-400 text-sm">
                        还有 {team.maxMembers - team.members.length} 个空位等待新成员加入
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}