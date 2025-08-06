import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Manrope } from 'next/font/google';
import { siteConfig } from '@/lib/config';
import { RealtimeProvider } from '@/contexts/realtime-context';

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
        <RealtimeProvider>
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              {children}
            </main>
          </div>
        </RealtimeProvider>
      </body>
    </html>
  );
}