import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cookies } from 'next/headers';
import { verifyToken } from '@/lib/auth/session';

// 需要认证的路由
const protectedRoutes = [
  '/profile',
  '/explore',
  '/matches',
  '/teams'
];

// 只有未认证用户可以访问的路由
const authRoutes = [
  '/sign-in',
  '/sign-up'
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 检查是否是受保护的路由
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // 检查是否是认证路由
  const isAuthRoute = authRoutes.some(route => 
    pathname.startsWith(route)
  );

  try {
    // 获取session
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    
    let isAuthenticated = false;
    if (sessionCookie?.value) {
      try {
        const sessionData = await verifyToken(sessionCookie.value);
        isAuthenticated = !!(sessionData && 
          sessionData.user && 
          new Date(sessionData.expires) > new Date()
        );
      } catch (error) {
        // Token无效，清除cookie
        const response = NextResponse.next();
        response.cookies.delete('session');
        isAuthenticated = false;
      }
    }

    // 如果是受保护的路由但用户未认证
    if (isProtectedRoute && !isAuthenticated) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }

    // 如果是认证路由但用户已认证
    if (isAuthRoute && isAuthenticated) {
      return NextResponse.redirect(new URL('/explore', request.url));
    }

    return NextResponse.next();
    
  } catch (error) {
    console.error('Middleware error:', error);
    
    // 如果是受保护的路由，在出错时重定向到登录
    if (isProtectedRoute) {
      const signInUrl = new URL('/sign-in', request.url);
      signInUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(signInUrl);
    }
    
    return NextResponse.next();
  }
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};