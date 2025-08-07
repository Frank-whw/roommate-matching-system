import { getUser, getUserContactInfo } from '@/lib/db/queries';

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

    const targetUserId = parseInt(params.id);
    if (isNaN(targetUserId)) {
      return Response.json({ error: '无效的用户ID' }, { status: 400 });
    }

    // 获取联系信息（仅限队友）
    const contactInfo = await getUserContactInfo(currentUser.id, targetUserId);
    if (!contactInfo) {
      return Response.json({ error: '无权访问该用户的联系信息' }, { status: 403 });
    }

    return Response.json(contactInfo);
  } catch (error) {
    console.error('Error in contact info API:', error);
    return Response.json({ error: '服务器内部错误' }, { status: 500 });
  }
}