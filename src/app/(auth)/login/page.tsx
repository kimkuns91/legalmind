import Image from 'next/image';
import Link from 'next/link';
import SignInForm from '@/components/auth/SignInForm';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <div className="from-background to-background/80 flex min-h-screen items-center justify-center bg-gradient-to-b p-4 transition-colors duration-300 dark:from-black dark:to-gray-900">
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* 로고 */}
        <Link href="/" className="mb-8 transition-transform duration-300 hover:scale-105">
          <Image
            src="/images/logo.png"
            alt="LegalMind Logo"
            width={240}
            height={80}
            className="cursor-pointer rounded-xl"
          />
        </Link>

        {/* 제목과 설명 */}
        <h1
          className={cn(
            'mb-2 text-center text-2xl font-bold md:text-3xl',
            'text-foreground dark:text-white'
          )}
        >
          어렵고 멀기만 했던 법률 지식
        </h1>
        <h2
          className={cn(
            'mb-6 text-center text-2xl font-bold md:text-3xl',
            'text-foreground dark:text-white'
          )}
        >
          이제는 걱정없어요
        </h2>
        <p className={cn('mb-10 text-center text-sm', 'text-muted-foreground dark:text-gray-400')}>
          법률 질문에 대한 지능적인 답변과 서류 자동화 서비스
        </p>

        {/* 로그인 폼 */}
        <div className="w-full px-4 sm:px-0">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
