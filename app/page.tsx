import { Button } from '@/components/ui/button';
import { ArrowRight, Info } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function HomePage() {
  return (
    <main className="homepage-hero">
      <section className="py-12 sm:py-16 lg:py-20 text-center px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto space-y-8 sm:space-y-10">
          <div className="space-y-2 sm:space-y-3">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              欢迎来到
              <span className="block text-primary mt-2 sm:mt-3">{siteConfig.name}</span>
            </h1>
          </div>
          
          {/* 平台通告 */}
          <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mx-auto max-w-3xl">
            <div className="flex items-start space-x-3">
              <Info className="h-6 w-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-left space-y-4">
                <h3 className="font-semibold text-blue-900 dark:text-blue-100 text-lg">
                  平台使用通告
                </h3>
                <div className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed space-y-3">
                  <p>
                    <strong>亲爱的同学们，</strong>
                  </p>
                  <p>
                    因学校信息办需至 8 月 29 日才能完成教育邮箱的统一激活，届时宿舍系统已关闭，平台也无法在宿舍系统关闭前完成必要的调整与重新启用。为此，平台将暂时仅保留“信息展示”功能，大家仍可继续使用，提前认识身边的同学。
                  </p>
                  <p>
                    对于未能在关键时刻帮助大家选择心仪室友，我深感抱歉，也深知辜负了大家的期待。从底层架构到业务实现，平台经历了多轮迭代与测试，我原本对平台功能充满信心，也满怀期待地邀请大家使用。在此，衷心感谢学长学姐、学院老师的支持，以及参与建设的每一位同学与朋友。
                  </p>
                  <p>
                    虽然未能如愿，但我由衷祝愿大家都能遇见合适的室友，开启美好的大学四年时光。短期内平台将暂停进一步开发，我也会休整一段时间，感谢大家的理解与包容。
                  </p>
                  <p>
                    再次感谢你们的支持 万分抱歉
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4 sm:space-y-6">
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal tracking-wide">
              寻找合适的室友，共同开启大学生活
            </p>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal tracking-wide">
              为ECNU数据专业新生提供基础的生活习惯和学习偏好匹配服务
            </p>
          </div>
          
          <div className="pt-4 sm:pt-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
              <Button
                asChild
                size="lg"
                className="text-base sm:text-lg rounded-full px-8 sm:px-10 py-3 sm:py-4 h-auto shadow-lg hover:shadow-xl transition-all duration-300 group font-medium"
              >
                <a href="/sign-up">
                  开始匹配
                  <ArrowRight className="ml-2 h-5 w-5 sm:h-6 sm:w-6 transition-transform group-hover:translate-x-1" style={{ fill: 'none', stroke: 'currentColor' }} />
                </a>
              </Button>
              
              <Button
                asChild
                variant="outline"
                size="lg"
                className="text-base sm:text-lg rounded-full px-8 sm:px-10 py-3 sm:py-4 h-auto shadow-md hover:shadow-lg transition-all duration-300 group font-medium border-2"
              >
                <a href="/temp">
                  🚀 新生临时注册
                </a>
              </Button>
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 max-w-md mx-auto">
              💡 教育邮箱还未开通？先用临时注册，抢先体验匹配功能
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}