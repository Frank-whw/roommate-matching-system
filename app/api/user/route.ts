import { getUser } from '@/lib/db/queries';

// 强制动态渲染
export const dynamic = 'force-dynamic';

export async function GET() {
  const user = await getUser();
  return Response.json(user);
}
