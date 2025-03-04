import Image from "next/image";
import Link from "next/link";
import SignInForm from "@/components/auth/SignInForm";
import { cn } from "@/lib/utils";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 dark:from-black dark:to-gray-900 p-4 transition-colors duration-300">
      <div className="w-full max-w-sm flex flex-col items-center">
        {/* 로고 */}
        <Link
          href="/"
          className="mb-8 transition-transform duration-300 hover:scale-105"
        >
          <Image
            src="/images/logo.png"
            alt="LegalMind Logo"
            width={240}
            height={80}
            className="rounded-xl cursor-pointer"
          />
        </Link>

        {/* 제목과 설명 */}
        <h1
          className={cn(
            "text-2xl md:text-3xl font-bold text-center mb-2",
            "text-foreground dark:text-white"
          )}
        >
          어렵고 멀기만 했던 법률 지식
        </h1>
        <h2
          className={cn(
            "text-2xl md:text-3xl font-bold text-center mb-6",
            "text-foreground dark:text-white"
          )}
        >
          이제는 걱정없어요
        </h2>
        <p
          className={cn(
            "text-sm text-center mb-10",
            "text-muted-foreground dark:text-gray-400"
          )}
        >
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
