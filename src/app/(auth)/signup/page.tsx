import Logo from '@/components/common/Logo';
import SignUpForm from '@/components/auth/SignUpForm';
import { cn } from '@/lib/utils';

export default function SignUpPage() {
  return (
    <div className="from-background to-background/80 flex min-h-screen items-center justify-center bg-gradient-to-b p-4 transition-colors duration-300 dark:from-black dark:to-gray-900">
      <div className="flex w-full max-w-sm flex-col items-center">
        {/* 로고 */}
        <div className="flex items-center justify-center py-8">
          <Logo width={240} height={80} light />
        </div>

        {/* 제목과 설명 */}
        <h1
          className={cn(
            'mb-2 text-center text-2xl font-bold md:text-3xl',
            'text-foreground dark:text-white'
          )}
        >
          법률 전문가와 함께하는
        </h1>
        <h2
          className={cn(
            'mb-6 text-center text-2xl font-bold md:text-3xl',
            'text-foreground dark:text-white'
          )}
        >
          스마트한 법률 서비스
        </h2>
        <p className={cn('mb-10 text-center text-sm', 'text-muted-foreground dark:text-gray-400')}>
          회원가입 후 다양한 법률 서비스를 이용해보세요
        </p>

        {/* 회원가입 폼 */}
        <div className="w-full px-4 sm:px-0">
          <SignUpForm />
        </div>
      </div>
    </div>
  );
}
