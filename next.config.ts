import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
  // Edge Runtime에서 지원되지 않는 Node.js API를 사용하는 bcryptjs 관련 경고 무시
  // Next.js 15에서는 experimental.serverComponentsExternalPackages가 serverExternalPackages로 변경됨
  serverExternalPackages: ['bcryptjs', 'puppeteer'],
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb',
      allowedOrigins: ['*'],
    },
  },
};
export default withNextIntl(nextConfig);
