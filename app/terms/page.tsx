import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '服务条款 - RoomieSync',
  description: 'RoomieSync室友匹配系统服务条款',
};

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">服务条款</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 服务说明</h2>
            <p className="mb-6">
              RoomieSync（室友匹配系统）是为华东师范大学学生提供室友匹配服务的平台。
              通过本系统，学生可以创建个人档案、搜索兼容的室友、组建团队并管理住宿安排。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 用户资格</h2>
            <p className="mb-6">
              本服务仅限华东师范大学在校学生使用。用户必须使用有效的学生邮箱
              （@stu.ecnu.edu.cn）进行注册，并提供真实准确的个人信息。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. 隐私保护</h2>
            <p className="mb-6">
              我们重视您的隐私。所有个人信息仅用于室友匹配服务，不会向第三方透露。
              用户可随时更新或删除个人资料。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. 用户责任</h2>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>提供真实、准确的个人信息</li>
              <li>尊重其他用户，不得发布不当内容</li>
              <li>不得利用系统进行商业活动</li>
              <li>保护自己的账户安全</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 服务限制</h2>
            <p className="mb-6">
              我们保留随时修改、暂停或终止服务的权利。对于因系统维护、升级
              或其他不可抗力因素导致的服务中断，我们不承担责任。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. 联系方式</h2>
            <p className="mb-6">
              如对本服务条款有任何疑问，请联系我们的技术支持团队。
            </p>

            <div className="bg-blue-50 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-600">
                本服务条款最后更新时间：{new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}