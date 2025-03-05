'use client';

import * as Yup from 'yup';

import { ErrorMessage, Field, FieldInputProps, Form, Formik, FormikHelpers } from 'formik';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

interface IForgotPasswordValues {
  email: string;
}

const ForgotPasswordForm = () => {
  const router = useRouter();
  const t = useTranslations('ForgotPasswordForm');
  const [isLoading, setIsLoading] = useState(false);

  const ForgotPasswordSchema = Yup.object().shape({
    email: Yup.string().email(t('validation.emailInvalid')).required(t('validation.emailRequired')),
  });

  const handleForgotPassword = async (
    values: IForgotPasswordValues,
    { setSubmitting }: FormikHelpers<IForgotPasswordValues>
  ) => {
    try {
      setIsLoading(true);

      // TODO: 실제 비밀번호 찾기 로직 구현
      // 현재는 임시로 성공 메시지만 표시

      // 성공 메시지 표시
      toast.success(t('validation.resetEmailSent'));

      // 로그인 페이지로 리다이렉트
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error(t('validation.resetFailed'));
      }
    } finally {
      setIsLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="w-full">
        {/* 비밀번호 찾기 폼 */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <Formik
            initialValues={{ email: '' }}
            validationSchema={ForgotPasswordSchema}
            onSubmit={handleForgotPassword}
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
                          'h-12 bg-transparent',
                          'border-gray-300 dark:border-gray-700',
                          'text-foreground dark:text-white',
                          'placeholder:text-muted-foreground dark:placeholder:text-gray-500',
                          'focus:ring-primary/50 focus:ring-2'
                        )}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="email"
                    component="div"
                    className="text-sm text-red-500 dark:text-red-400"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting || isLoading}
                  className={cn(
                    'bg-primary hover:bg-primary/90 h-12 w-full dark:bg-gray-800 dark:hover:bg-gray-700',
                    'text-primary-foreground cursor-pointer font-medium dark:text-white',
                    'shadow-sm transition-all duration-200 hover:shadow-md',
                    'text-sm sm:text-base'
                  )}
                >
                  {isSubmitting || isLoading ? (
                    <span className="flex items-center justify-center">
                      <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></span>
                      처리 중...
                    </span>
                  ) : (
                    t('resetButton')
                  )}
                </Button>
              </Form>
            )}
          </Formik>
        </motion.div>

        {/* 로그인 및 회원가입 링크 */}
        <motion.div
          className="text-muted-foreground mt-6 text-center text-sm dark:text-gray-400"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          <div className="flex justify-center space-x-4">
            <Link
              href="/login"
              className={cn(
                'hover:text-foreground cursor-pointer dark:hover:text-white',
                'transition-colors duration-200'
              )}
            >
              로그인
            </Link>
            <span>|</span>
            <Link
              href="/signup"
              className={cn(
                'hover:text-foreground cursor-pointer dark:hover:text-white',
                'transition-colors duration-200'
              )}
            >
              회원가입
            </Link>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ForgotPasswordForm;
