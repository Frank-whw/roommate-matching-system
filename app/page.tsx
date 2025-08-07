import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { siteConfig } from '@/lib/config';

export default function HomePage() {
  return (
    <main className="flex-1 flex items-center justify-center">
      <section className="py-20 text-center">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold text-foreground tracking-tight sm:text-5xl md:text-6xl">
            欢迎来到
            <span className="block text-primary">{siteConfig.name}</span>
          </h1>
          <p className="mt-6 text-xl text-muted-foreground max-w-2xl mx-auto">
            寻找合适的室友，共同开启大学生活
          </p>
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl mx-auto">
            为ECNU数据专业新生提供基础的生活习惯和学习偏好匹配服务
          </p>
          <div className="mt-8">
            <Button
              asChild
              size="lg"
              className="text-lg rounded-full px-8 py-3"
            >
              <a href="/sign-up">
                开始匹配
                <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
          </div>
        </div>
      </section>
    </main>
  );
}