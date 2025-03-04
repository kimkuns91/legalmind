import ForgotPasswordForm from "@/components/auth/ForgotPasswordForm";
import Image from "next/image";
import Link from "next/link";
import { cn } from "@/lib/utils";

export default function ForgotPasswordPage() {
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
          비밀번호를 잊으셨나요?
        </h1>
        <p
          className={cn(
            "text-sm text-center mb-10",
            "text-muted-foreground dark:text-gray-400"
          )}
        >
          가입하신 이메일 주소를 입력하시면 <br />비밀번호 재설정 링크를 보내드립니다
        </p>

        {/* 비밀번호 찾기 폼 */}
        <div className="w-full px-4 sm:px-0">
          <ForgotPasswordForm />
        </div>
      </div>
    </div>
  );
}
