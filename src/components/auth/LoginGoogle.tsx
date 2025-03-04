"use client";

import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";
import { useTranslations } from "next-intl";

interface LoginGoogleProps {
  handleGoogleLogin: () => Promise<void>;
  isLoading: boolean;
}

const LoginGoogle = ({ handleGoogleLogin, isLoading }: LoginGoogleProps) => {
  const t = useTranslations("SignInForm");

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="flex w-full items-center justify-center gap-2 rounded-lg border border-input bg-background py-3 h-12 text-foreground transition-colors hover:bg-accent hover:text-accent-foreground cursor-pointer"
    >
      <FcGoogle className="h-5 w-5" />
      <span>{t("googleLogin")}</span>
    </Button>
  );
};

export default LoginGoogle; 