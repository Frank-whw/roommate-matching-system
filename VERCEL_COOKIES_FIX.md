# Vercel Cookies 错误修复说明

## 问题描述

在 Vercel 部署时遇到以下错误：

```
Dynamic server usage: Route /api/profile couldn't be rendered statically because it used `cookies`.
Dynamic server usage: Route /api/realtime/check-updates couldn't be rendered statically because it used `cookies`.
```

## 根本原因

在 Next.js 14 App Router 中，使用 `cookies()` 函数的 API 路由需要正确处理异步上下文，否则会导致静态渲染错误。

## 修复内容

### 1. 修复 `lib/db/queries.ts` 中的 cookies 调用

**修复前：**
```typescript
export async function getCurrentUser() {
  const sessionCookie = (await cookies()).get('session');
  // ...
}
```

**修复后：**
```typescript
export async function getCurrentUser() {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('session');
    // ...
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return { user: null, session: null };
  }
}
```

### 2. 修复 `lib/auth/session.ts` 中的 cookies 调用

**修复前：**
```typescript
export async function getSession() {
  const session = (await cookies()).get('session')?.value;
  // ...
}
```

**修复后：**
```typescript
export async function getSession() {
  try {
    const cookieStore = await cookies();
    const session = cookieStore.get('session')?.value;
    // ...
  } catch (error) {
    console.error('Error in getSession:', error);
    return null;
  }
}
```

### 3. 修复 `app/(login)/actions.ts` 中的 cookies 调用

**修复前：**
```typescript
(await cookies()).delete('session');
```

**修复后：**
```typescript
const cookieStore = await cookies();
cookieStore.delete('session');
```

### 4. 更新 API 路由参数

确保所有 API 路由函数都正确接收 `NextRequest` 参数：

```typescript
// 修复前
export async function GET() {

// 修复后
export async function GET(request: NextRequest) {
```

### 5. 更新 `next.config.js`

添加配置确保 API 路由正确处理动态渲染：

```javascript
const nextConfig = {
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-store, max-age=0'
          }
        ]
      }
    ];
  }
};
```

## 验证结果

运行 `npm run build` 后，所有 API 路由都正确显示为动态渲染（ƒ 标记）：

```
├ ƒ /api/profile                        0 B                0 B
├ ƒ /api/realtime/check-updates          0 B                0 B
├ ƒ /api/user                            0 B                0 B
// ... 其他 API 路由
```

## 最佳实践

1. **正确的异步上下文处理**：始终将 `cookies()` 调用包装在 try-catch 块中
2. **一致的 cookieStore 使用**：使用 `const cookieStore = await cookies()` 而不是直接调用
3. **API 路由参数**：确保所有 API 路由函数都接收正确的参数
4. **动态渲染配置**：确保所有使用 cookies 的 API 路由都有 `export const dynamic = 'force-dynamic';`

## 部署建议

修复完成后，可以安全地重新部署到 Vercel。这些修复确保了：

- ✅ 所有 API 路由正确处理动态渲染
- ✅ Cookies 在正确的异步上下文中被访问
- ✅ 错误处理更加健壮
- ✅ 与 Next.js 14 App Router 完全兼容