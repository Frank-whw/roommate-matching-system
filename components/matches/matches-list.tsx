import { eq, or, and } from 'drizzle-orm';
import { db } from '@/lib/db/drizzle';
import { matches, users, userProfiles } from '@/lib/db/schema';
import { MatchCard } from './match-card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { 
  Heart,
  Search,
  ArrowRight
} from 'lucide-react';
import Link from 'next/link';

interface MatchesListProps {
  currentUserId?: number;
}

export async function MatchesList({ currentUserId }: MatchesListProps) {
  if (!currentUserId) {
    return (
      <Alert>
        <Heart className="h-4 w-4" />
        <AlertDescription>
          请先登录以查看匹配列表
        </AlertDescription>
      </Alert>
    );
  }

  try {
    // 查询用户的所有匹配，并关联匹配用户的信息
    const userMatches = await db
      .select({
        match: matches,
        matchedUser: users,
        matchedUserProfile: userProfiles
      })
      .from(matches)
      .innerJoin(
        users, 
        or(
          and(
            eq(matches.user1Id, currentUserId),
            eq(users.id, matches.user2Id)
          ),
          and(
            eq(matches.user2Id, currentUserId),
            eq(users.id, matches.user1Id)
          )
        )
      )
      .leftJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(
        and(
          or(
            eq(matches.user1Id, currentUserId),
            eq(matches.user2Id, currentUserId)
          ),
          eq(matches.status, 'matched') // 只显示活跃的匹配
        )
      )
      .orderBy(matches.createdAt); // 按创建时间排序

    if (userMatches.length === 0) {
      return (
        <div className="text-center py-12">
          <div className="flex flex-col items-center space-y-4">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center">
              <Heart className="w-8 h-8 text-gray-400" />
            </div>
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                还没有匹配
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                去匹配广场寻找您的理想室友吧！<br />
                当您和其他用户互相点赞时，就会产生匹配。
              </p>
              <Button asChild>
                <Link href="/explore">
                  <Search className="w-4 h-4 mr-2" />
                  去匹配广场
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            找到 {userMatches.length} 个匹配
          </p>
        </div>
        
        {userMatches.map(({ match, matchedUser, matchedUserProfile }) => (
          <MatchCard
            key={match.id}
            match={match}
            matchedUser={matchedUser}
            matchedUserProfile={matchedUserProfile}
            currentUserId={currentUserId}
          />
        ))}
      </div>
    );

  } catch (error) {
    console.error('获取匹配列表时出错:', error);
    return (
      <Alert className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
        <AlertDescription className="text-red-800 dark:text-red-200">
          加载匹配列表时出现错误，请刷新页面重试
        </AlertDescription>
      </Alert>
    );
  }
}