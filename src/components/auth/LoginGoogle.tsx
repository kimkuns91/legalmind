'use client';

import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { useTranslations } from 'next-intl';

interface LoginGoogleProps {
  handleGoogleLogin: () => Promise<void>;
  isLoading: boolean;
}

const LoginGoogle = ({ handleGoogleLogin, isLoading }: LoginGoogleProps) => {
  const t = useTranslations('SignInForm');

  return (
    <Button
      type="button"
      variant="outline"
      onClick={handleGoogleLogin}
      disabled={isLoading}
      className="border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground flex h-12 w-full cursor-pointer items-center justify-center gap-2 rounded-lg border py-3 transition-colors"
    >
      <FcGoogle className="h-5 w-5" />
      <span>{t('googleLogin')}</span>
    </Button>
  );
};

export default LoginGoogle;
