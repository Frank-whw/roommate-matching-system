import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { siteConfig } from '@/lib/config';
import { RealtimeProvider } from '@/contexts/realtime-context';
import { ThemeProvider } from '@/contexts/theme-context';
import { ToastProvider } from '@/hooks/use-toast-notifications';
import ResponsiveHeader from '@/components/header-responsive';
import BottomNav from '@/components/navigation/bottom-nav';
import LoadingIndicator from '@/components/navigation/loading-indicator';
import ErrorFilter from '@/components/error-filter';
import { Suspense } from 'react';

export const metadata: Metadata = {
  title: siteConfig.title,
  description: siteConfig.description
};

export const viewport: Viewport = {
  maximumScale: 1
};

const manrope = Manrope({ subsets: ['latin'] });

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${manrope.className}`}
    >
      <body className="min-h-[100dvh] bg-background text-foreground">
        <ErrorFilter />
        <ThemeProvider>
          <ToastProvider>
            <RealtimeProvider>
              <div className="flex flex-col min-h-screen">
                <LoadingIndicator />
                <Suspense fallback={<div className="h-16 bg-background border-b" />}>
                  <ResponsiveHeader />
                </Suspense>
                <main className="flex-1 pb-16 md:pb-0">
                  {children}
                </main>
                <BottomNav />
              </div>
            </RealtimeProvider>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}