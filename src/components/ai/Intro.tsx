'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

import { FaArrowRight } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { createConversationAndRedirect } from '@/actions/conversation';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface IntroProps {
  userId?: string;
}

const Intro = ({ userId }: IntroProps) => {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 클라이언트 사이드에서만 테마 관련 기능 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  // userId가 나중에 사용될 예정이므로 일단 로그만 남겨둠
  useEffect(() => {
    if (userId) {
      console.log('User ID for future use:', userId);
    }
  }, [userId]);

  // 폼 제출 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!message.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 서버 액션 호출하여 대화 생성 및 URL 받기
      const result = await createConversationAndRedirect(message);

      // 서버 액션에서 반환된 URL로 리다이렉트
      if (result?.redirectUrl) {
        window.location.href = result.redirectUrl;
      }
      setMessage('');
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : '대화를 생성하는 중 오류가 발생했습니다.');
      console.error('대화 생성 중 오류:', err);
    }
  };

  // Enter 키로 제출, Shift+Enter로 줄바꿈
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
    }
  };

  // 자동 높이 조절 (textarea)
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const minHeight = 96; // 4줄 기본 높이 (1.5em * 4 = 6em = 96px)
      const maxHeight = 192; // 8줄 최대 높이 (1.5em * 8 = 12em = 192px)
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(Math.max(minHeight, scrollHeight), maxHeight)}px`;
    }
  }, [message]);

  // 애니메이션 변수 정의
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: 'spring', stiffness: 100 },
    },
  };

  const buttonVariants = {
    rest: { scale: 1 },
    hover: { scale: 1.1 },
    tap: { scale: 0.95 },
  };

  // 테마에 따른 그림자 효과 설정
  const lightShadow = {
    initial: { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)' },
    hover: { boxShadow: '0 8px 15px rgba(0, 0, 0, 0.15)' },
  };

  const darkShadow = {
    initial: { boxShadow: '0 4px 6px rgba(0, 0, 0, 0.3)' },
    hover: { boxShadow: '0 8px 15px rgba(0, 0, 0, 0.5)' },
  };

  // 마운트 되기 전에는 기본 UI 반환
  if (!mounted) {
    return (
      <div className="flex min-h-screen w-full items-center justify-center">
        <div className="flex w-full max-w-[600px] flex-col items-center justify-center px-4 py-6">
          <div className="bg-muted mb-8 h-8 w-3/4 animate-pulse rounded"></div>
          <div className="bg-muted mb-4 h-40 w-full animate-pulse rounded-2xl"></div>
          <div className="bg-muted mt-6 h-4 w-2/3 animate-pulse rounded"></div>
          <div className="bg-muted mt-2 h-4 w-1/2 animate-pulse rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className="flex min-h-screen w-full items-center justify-center"
    >
      <div className="flex w-full max-w-[600px] flex-col px-4 py-12">
        <motion.h2
          variants={itemVariants}
          className="mb-8 text-2xl leading-snug font-semibold md:text-3xl"
        >
          어렵고 멀기만 했던 법률 지식 <br />
          <span className="text-[#F58733]">해주세요</span>가 있으니깐 걱정없어요
        </motion.h2>

        <motion.form variants={itemVariants} className="mb-4 w-full" onSubmit={handleSubmit}>
          <motion.div
            initial={theme === 'dark' ? darkShadow.initial : lightShadow.initial}
            whileHover={theme === 'dark' ? darkShadow.hover : lightShadow.hover}
            transition={{ duration: 0.3 }}
            className={cn(
              'flex flex-col rounded-2xl border px-4 py-4',
              'bg-input border-muted',
              'dark:border-gray-700 dark:bg-gray-800'
            )}
          >
            <textarea
              ref={textareaRef}
              className="text-foreground placeholder:text-muted-foreground flex-1 resize-none overflow-hidden bg-transparent p-2 focus:outline-none"
              placeholder="해주세요 법률 전문가에게 법률 상담을 해보세요."
              value={message}
              onChange={e => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
            />
            <div className="flex items-end justify-end">
              <motion.button
                type="submit"
                variants={buttonVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
                disabled={isSubmitting || !message.trim()}
                className={cn(
                  'ml-4 cursor-pointer p-2 transition-all duration-200',
                  'rounded-full bg-[#F58733] text-sm text-white',
                  (isSubmitting || !message.trim()) && 'cursor-not-allowed opacity-50'
                )}
              >
                <FaArrowRight />
              </motion.button>
            </div>
          </motion.div>
        </motion.form>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300"
          >
            {error}
          </motion.div>
        )}

        <motion.span
          variants={itemVariants}
          className="text-muted-foreground mt-6 text-sm font-semibold md:text-base"
        >
          * 면책조항: 해주세요 법률 전문가의 법률 정보 제공은 법적 효력을 가지지 않습니다.
          <br />
          법률적 해결은 변호사와 상담하시기 바랍니다.
        </motion.span>

        <motion.span
          variants={itemVariants}
          className="text-muted-foreground mt-2 text-sm font-semibold md:text-base"
        >
          *문의에 대한 법률정보 검토 및 추천외에 개인정보 이용 및 활용하지 않습니다.
        </motion.span>
      </div>
    </motion.div>
  );
};

export default Intro;
