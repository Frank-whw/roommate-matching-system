import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
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
          
          <div className="space-y-4 sm:space-y-6">
            <p className="text-lg sm:text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto leading-relaxed font-normal tracking-wide">
              寻找合适的室友，共同开启大学生活
            </p>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-normal tracking-wide">
              为ECNU数据专业新生提供基础的生活习惯和学习偏好匹配服务
            </p>
          </div>
          
          <div className="pt-4 sm:pt-6">
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
          </div>
        </div>
      </section>
    </main>
  );
}