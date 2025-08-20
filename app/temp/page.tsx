import { TempRegister } from './temp-register'

export default function TempPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">临时注册</h1>
          <p className="text-gray-600">
            使用临时注册快速创建账户
          </p>
        </div>
        <TempRegister />
      </div>
    </div>
  )
}