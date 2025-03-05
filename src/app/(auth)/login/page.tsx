import Image from 'next/image';
import Link from 'next/link';
import SignInForm from '@/components/auth/SignInForm';
import { cn } from '@/lib/utils';

export default function LoginPage() {
  return (
    <div className="from-background to-background/80 flex min-h-screen items-center justify-center bg-gradient-to-b p-4 transition-all duration-300 dark:from-gray-950 dark:to-gray-900">
      <div className="border-border bg-card w-full max-w-md rounded-xl border p-6 shadow-sm transition-all duration-300 dark:border-gray-800 dark:bg-gray-900/50 dark:shadow-lg">
        {/* 로고 */}
        <Link
          href="/"
          className="mb-8 flex justify-center transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/images/logo.png"
            alt="Logo"
            width={200}
            height={70}
            className="cursor-pointer rounded-xl"
          />
        </Link>

        {/* 제목과 설명 */}
        <h1
          className={cn(
            'mb-2 text-center text-2xl font-bold md:text-3xl',
            'text-foreground dark:text-gray-100'
          )}
        >
          어렵고 멀기만 했던 법률 지식
        </h1>
        <h2
          className={cn(
            'mb-6 text-center text-2xl font-bold md:text-3xl',
            'text-foreground dark:text-gray-100'
          )}
        >
          이제는 걱정없어요
        </h2>
        <p className={cn('mb-8 text-center text-sm', 'text-muted-foreground dark:text-gray-400')}>
          법률 질문에 대한 지능적인 답변과 서류 자동화 서비스
        </p>

        {/* 로그인 폼 */}
        <div className="w-full">
          <SignInForm />
        </div>
      </div>
    </div>
  );
}
