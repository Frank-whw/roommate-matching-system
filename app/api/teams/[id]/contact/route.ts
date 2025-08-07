import { getUser, getTeamWithMembersContact } from '@/lib/db/queries';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const currentUser = await getUser();
    if (!currentUser) {
      return Response.json({ error: '未授权访问' }, { status: 401 });
    }

    const teamId = parseInt(params.id);
    if (isNaN(teamId)) {
      return Response.json({ error: '无效的队伍ID' }, { status: 400 });
    }

    // 获取队伍信息（包含联系信息，仅限队伍成员）
    const teamWithMembers = await getTeamWithMembersContact(teamId, currentUser.id);
    if (!teamWithMembers) {
      return Response.json({ error: '队伍不存在或无权访问' }, { status: 404 });
    }

    return Response.json(teamWithMembers);
  } catch (error) {
    console.error('Error in team contact API:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}