import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { getUser } from '@/lib/db/queries';
import { SWRConfig } from 'swr';
import Header from '@/components/header-responsive';
import { ThemeProvider } from '@/contexts/theme-context';
import { RealtimeProvider } from '@/contexts/realtime-context';
import { ToastContainer } from '@/components/realtime/toast-notification';
import { siteConfig } from '@/lib/config';

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
        <ThemeProvider>
          <RealtimeProvider options={{ interval: 30000, enabled: true }}>
            <SWRConfig
              value={{
                fallback: {
                  // We do NOT await here
                  // Only components that read this data will suspend
                  '/api/user': getUser()
                }
              }}
            >
              <div className="flex flex-col min-h-screen">
                <Header />
                <main className="flex-1">
                  {children}
                </main>
                <ToastContainer />
              </div>
            </SWRConfig>
          </RealtimeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
