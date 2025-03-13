'use client';

import * as Yup from 'yup';

import { ErrorMessage, Field, FieldInputProps, Form, Formik, FormikHelpers } from 'formik';
import { loginWithCredentials, loginWithGoogle, loginWithKakao } from '@/actions/auth';

import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { RiKakaoTalkFill } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface ISignInValues {
  email: string;
  password: string;
}

interface LoginResult {
  success: boolean;
  message?: string;
  error?: string;
  email?: string;
}

interface SignInFormProps {
  callbackUrl?: string;
}

const SignInForm = ({ callbackUrl }: SignInFormProps) => {
  const router = useRouter();
  const t = useTranslations('SignInForm');
  const [isLoading, setIsLoading] = useState(false);

  const SignInSchema = Yup.object().shape({
    email: Yup.string().email(t('validation.emailInvalid')).required(t('validation.emailRequired')),
    password: Yup.string().required(t('validation.passwordRequired')),
  });

  const handleSignIn = async (
    values: ISignInValues,
    { setSubmitting }: FormikHelpers<ISignInValues>
  ) => {
    try {
      const result = (await loginWithCredentials(values.email, values.password)) as LoginResult;

      if (!result.success) {
        toast.error(result.message || result.error || t('validation.loginFailed'));
        return;
      }

      toast.success(t('validation.loginSuccess'));
      router.push(callbackUrl || '/');
    } catch (error) {
      console.error('Login error:', error);
      toast.error(t('validation.loginFailed'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithGoogle(callbackUrl);
    } catch (error) {
      if (!(error as { digest?: string })?.digest?.includes('NEXT_REDIRECT')) {
        toast.error(t('validation.googleLoginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleKakaoSignIn = async () => {
    try {
      setIsLoading(true);
      await loginWithKakao(callbackUrl);
    } catch (error) {
      if (!(error as { digest?: string })?.digest?.includes('NEXT_REDIRECT')) {
        toast.error(t('validation.kakaoLoginFailed'));
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full"
    >
      {/* 소셜 로그인 버튼 */}
      <motion.div
        className="mb-4 flex flex-col space-y-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <Button
          type="button"
          onClick={handleKakaoSignIn}
          disabled={isLoading}
          className={cn(
            'h-11 w-full bg-[#FEE500] font-medium text-black hover:bg-[#FDD835]',
            'flex cursor-pointer items-center justify-center',
            'shadow-sm transition-all duration-200 hover:shadow-md',
            'text-sm sm:text-base'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              로그인 중...
            </span>
          ) : (
            <>
              <RiKakaoTalkFill className="mr-2 h-5 w-5" />
              <span>카카오 계정으로 로그인</span>
            </>
          )}
        </Button>

        <Button
          type="button"
          variant="outline"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
          className={cn(
            'border-input bg-background text-foreground h-11 w-full border font-medium',
            'hover:bg-accent hover:text-accent-foreground dark:border-gray-700 dark:bg-gray-800/50 dark:text-gray-100',
            'dark:hover:bg-gray-800 dark:hover:text-white',
            'flex cursor-pointer items-center justify-center',
            'shadow-sm transition-all duration-200 hover:shadow-md',
            'text-sm sm:text-base'
          )}
        >
          {isLoading ? (
            <span className="flex items-center justify-center">
              <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
              로그인 중...
            </span>
          ) : (
            <>
              <FcGoogle className="mr-2 h-5 w-5" />
              <span>구글 계정으로 로그인</span>
            </>
          )}
        </Button>
      </motion.div>

      {/* 또는 구분선 */}
      <motion.div
        className="relative my-6 flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3, duration: 0.5 }}
      >
        <div className="border-border absolute w-full border-t dark:border-gray-700"></div>
        <div className="bg-card text-muted-foreground relative px-4 text-sm dark:bg-gray-900/50 dark:text-gray-400">
          또는
        </div>
      </motion.div>

      {/* 이메일 로그인 폼 */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.5 }}
      >
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={SignInSchema}
          onSubmit={handleSignIn}
        >
          {({ isSubmitting }) => (
            <Form className="space-y-4">
              <div className="space-y-2">
                <Field name="email">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <Input
                      {...field}
                      type="email"
                      placeholder={t('email')}
                      className={cn(
                        'bg-background/50 h-11 dark:bg-gray-800/30',
                        'border-input focus:border-primary dark:border-gray-700 dark:focus:border-gray-500',
                        'text-foreground placeholder:text-muted-foreground dark:text-gray-100 dark:placeholder:text-gray-500',
                        'focus:ring-primary/20 focus:ring-2'
                      )}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="email"
                  component="div"
                  className="text-destructive text-sm dark:text-red-400"
                />
              </div>

              <div className="space-y-2">
                <Field name="password">
                  {({ field }: { field: FieldInputProps<string> }) => (
                    <Input
                      {...field}
                      type="password"
                      placeholder={t('password')}
                      className={cn(
                        'bg-background/50 h-11 dark:bg-gray-800/30',
                        'border-input focus:border-primary dark:border-gray-700 dark:focus:border-gray-500',
                        'text-foreground placeholder:text-muted-foreground dark:text-gray-100 dark:placeholder:text-gray-500',
                        'focus:ring-primary/20 focus:ring-2'
                      )}
                    />
                  )}
                </Field>
                <ErrorMessage
                  name="password"
                  component="div"
                  className="text-destructive text-sm dark:text-red-400"
                />
              </div>

              <div className="flex justify-end">
                <Link
                  href="/forgot-password"
                  className={cn(
                    'text-muted-foreground hover:text-foreground text-sm dark:text-gray-400 dark:hover:text-gray-200',
                    'cursor-pointer transition-colors duration-200'
                  )}
                >
                  {t('forgotPassword')}
                </Link>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className={cn(
                  'bg-primary text-primary-foreground hover:bg-primary/90 h-11 w-full',
                  'dark:bg-primary/90 dark:text-primary-foreground dark:hover:bg-primary/80',
                  'cursor-pointer font-medium shadow-sm transition-all duration-200 hover:shadow-md',
                  'text-sm sm:text-base'
                )}
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center">
                    <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                    로그인 중...
                  </span>
                ) : (
                  t('emailLogin')
                )}
              </Button>
            </Form>
          )}
        </Formik>
      </motion.div>

      {/* 회원가입 링크 */}
      <motion.div
        className="text-muted-foreground mt-6 text-center text-sm dark:text-gray-400"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
      >
        <div className="flex justify-center space-x-4">
          <Link
            href="/signup"
            className={cn(
              'hover:text-foreground cursor-pointer dark:hover:text-gray-200',
              'transition-colors duration-200'
            )}
          >
            회원가입
          </Link>
          <span className="text-muted-foreground/60 dark:text-gray-600">|</span>
          <Link
            href="/forgot-password"
            className={cn(
              'hover:text-foreground cursor-pointer dark:hover:text-gray-200',
              'transition-colors duration-200'
            )}
          >
            비밀번호 찾기
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SignInForm;
