import '@/styles/globals.css';

import { Geist, Geist_Mono } from 'next/font/google';
import { getLocale, getMessages, getTimeZone } from 'next-intl/server';

import type { Metadata } from 'next';
import { Providers } from './providers';
import { cn } from '@/lib/utils';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: '해주세요 | 법률 AI 상담 서비스',
  description:
    '복잡한 법률 문제를 AI가 쉽게 해결해 드립니다. 법률 질문에 대한 정확하고 신속한 답변을 받아보세요.',
  keywords:
    '법률 상담, AI 법률, 법률 조언, 법률 질문, 법률 서비스, 법률 정보, 법률 AI, 인공지능 법률',
  // authors: [{ name: '해주세요 Team' }],
  // creator: '해주세요',
  // publisher: '해주세요',
  // formatDetection: {
  //   telephone: false,
  //   email: false,
  //   address: false,
  // },
  // openGraph: {
  //   type: 'website',
  //   locale: 'ko_KR',
  //   url: 'https://legalmind-ruddy.vercel.app/',
  //   title: '해주세요 | 법률 AI 상담 서비스',
  //   description:
  //     '복잡한 법률 문제를 AI가 쉽게 해결해 드립니다. 법률 질문에 대한 정확하고 신속한 답변을 받아보세요.',
  //   siteName: '해주세요',
  //   images: [
  //     {
  //       url: '/images/og-image.png',
  //       width: 1200,
  //       height: 630,
  //       alt: '해주세요 - 법률 AI 상담 서비스',
  //     },
  //   ],
  // },
  // twitter: {
  //   card: 'summary_large_image',
  //   title: '해주세요 | 법률 AI 상담 서비스',
  //   description:
  //     '복잡한 법률 문제를 AI가 쉽게 해결해 드립니다. 법률 질문에 대한 정확하고 신속한 답변을 받아보세요.',
  //   images: ['/images/twitter-image.png'],
  // },
  // viewport: {
  //   width: 'device-width',
  //   initialScale: 1,
  //   maximumScale: 1,
  // },
  // robots: {
  //   index: true,
  //   follow: true,
  //   googleBot: {
  //     index: true,
  //     follow: true,
  //     'max-image-preview': 'large',
  //     'max-snippet': -1,
  //   },
  // },
  // icons: {
  //   icon: '/favicon.ico',
  //   shortcut: '/favicon-16x16.png',
  //   apple: '/apple-touch-icon.png',
  // },
  // manifest: '/site.webmanifest',
  // metadataBase: new URL('https://legalmind-ruddy.vercel.app/'),
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();
  const timeZone = await getTimeZone();

  return (
    <html lang={locale} suppressHydrationWarning>
      <body
        className={cn(
          'bg-background min-h-screen font-sans antialiased',
          geistSans.variable,
          geistMono.variable
        )}
      >
        <Providers messages={messages} locale={locale} timeZone={timeZone}>
          {children}
        </Providers>
      </body>
    </html>
  );
}
