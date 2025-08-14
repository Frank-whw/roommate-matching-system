import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '隐私政策 - RoomieSync',
  description: 'RoomieSync室友匹配系统隐私政策',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-transparent py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">隐私政策</h1>
          
          <div className="prose prose-lg max-w-none">
            <h2 className="text-2xl font-semibold text-gray-800 mb-4">1. 信息收集</h2>
            <p className="mb-6">
              我们收集以下信息以提供室友匹配服务：
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>学号、用户名、性别、生活习惯、兴趣爱好、MBTI等基本信息</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">2. 信息使用</h2>
            <p className="mb-6">
              收集的信息仅用于以下目的：
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>提供室友匹配和推荐服务</li>
              <li>改善系统功能和用户体验</li>
              <li>发送系统通知和重要信息</li>
              <li>维护平台安全和防范滥用</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">3. 信息保护</h2>
            <p className="mb-6">
              我们采用以下措施保护您的个人信息：
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>使用HTTPS加密传输所有数据</li>
              <li>数据库密码加密存储</li>
              <li>定期安全审计和漏洞检查</li>
              <li>限制员工访问个人信息</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">4. 信息共享</h2>
            <p className="mb-6">
              我们承诺：
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>不会向第三方出售您的个人信息</li>
              <li>仅在获得您同意后与其他用户共享匹配信息</li>
              <li>除法律要求外，不会向外部机构披露您的信息</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">5. 用户权利</h2>
            <p className="mb-6">
              您拥有以下权利：
            </p>
            <ul className="list-disc list-inside mb-6 space-y-2">
              <li>随时查看、修改或删除个人资料</li>
              <li>控制信息的可见性和共享范围</li>
              <li>申请导出个人数据</li>
              <li>要求删除账户和所有相关数据</li>
            </ul>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">6. Cookies使用</h2>
            <p className="mb-6">
              我们使用Cookies来维护登录状态、记住用户偏好和改善网站性能。
              您可以在浏览器中禁用Cookies，但这可能影响部分功能的正常使用。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">7. 政策更新</h2>
            <p className="mb-6">
              我们可能会不定期更新本隐私政策。重要变更将通过邮件或系统通知告知用户。
              继续使用服务即表示您接受更新后的政策。
            </p>

            <h2 className="text-2xl font-semibold text-gray-800 mb-4">8. 联系我们</h2>
            <p className="mb-6">
              如对本隐私政策有任何疑问或需要行使相关权利，请通过系统消息或邮件联系我们。
            </p>

            <div className="bg-green-50 p-6 rounded-lg mt-8">
              <p className="text-sm text-gray-600">
                本隐私政策最后更新时间：{new Date().toLocaleDateString('zh-CN')}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}