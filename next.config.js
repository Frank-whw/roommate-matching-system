/** @type {import('next').NextConfig} */
const nextConfig = {
  // Minimal configuration
  experimental: {
    serverComponentsExternalPackages: ['bcryptjs']
  },
  // 确保 API 路由正确处理动态渲染
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

module.exports = nextConfig;