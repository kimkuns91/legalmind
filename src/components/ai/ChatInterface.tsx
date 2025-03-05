'use client';

import { FaArrowRight, FaUser } from 'react-icons/fa';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { RiRobot2Fill } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';
import { useTheme } from 'next-themes';

interface IMessage {
  id: string;
  content: string;
  role: string;
  createdAt: Date;
  userId: string;
  conversationId: string;
}

interface IConversation {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  userId: string;
  messages: IMessage[];
}

interface ChatInterfaceProps {
  conversation: IConversation;
  messages: IMessage[];
}

const ChatInterface = ({ conversation, messages }: ChatInterfaceProps) => {
  const { theme } = useTheme();
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 메시지 전송 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // TODO: 메시지 전송 및 AI 응답 로직 구현
      // 현재는 임시로 콘솔에 로그만 출력
      console.log('메시지 전송:', newMessage);

      setNewMessage('');
      setIsSubmitting(false);
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : '메시지를 전송하는 중 오류가 발생했습니다.');
      console.error('메시지 전송 중 오류:', err);
    }
  };

  // 애니메이션 변수 정의
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const messageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
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

  return (
    <div className="flex h-full w-full flex-col">
      {/* 대화 제목 */}
      <div className="border-b p-4">
        <h1 className="text-xl font-semibold">{conversation.title}</h1>
      </div>

      {/* 메시지 목록 */}
      <motion.div
        className="flex-1 overflow-y-auto p-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {messages.map(message => (
          <motion.div
            key={message.id}
            variants={messageVariants}
            className={cn('mb-4 flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[80%] rounded-lg p-3',
                message.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
              )}
            >
              <div className="mb-1 flex items-center">
                {message.role === 'user' ? (
                  <FaUser className="mr-2" />
                ) : (
                  <RiRobot2Fill className="mr-2" />
                )}
                <span className="text-sm font-semibold">
                  {message.role === 'user' ? '사용자' : '해주세요 AI'}
                </span>
              </div>
              <p className="whitespace-pre-wrap">{message.content}</p>
              <div className="mt-1 text-right text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString()}
              </div>
            </div>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </motion.div>

      {/* 오류 메시지 */}
      {error && (
        <div className="mx-4 mb-2 rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
          {error}
        </div>
      )}

      {/* 메시지 입력 폼 */}
      <form onSubmit={handleSubmit} className="border-t p-4">
        <motion.div
          initial={theme === 'dark' ? darkShadow.initial : lightShadow.initial}
          whileHover={theme === 'dark' ? darkShadow.hover : lightShadow.hover}
          transition={{ duration: 0.3 }}
          className={cn(
            'flex items-center rounded-lg border px-4 py-2',
            'bg-input border-muted',
            'dark:border-gray-700 dark:bg-gray-800'
          )}
        >
          <input
            type="text"
            className="flex-1 bg-transparent p-1 focus:outline-none"
            placeholder="메시지를 입력하세요..."
            value={newMessage}
            onChange={e => setNewMessage(e.target.value)}
            disabled={isSubmitting}
          />
          <motion.button
            type="submit"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            disabled={isSubmitting || !newMessage.trim()}
            className={cn(
              'ml-2 rounded-full bg-[#F58733] p-2 text-white',
              (isSubmitting || !newMessage.trim()) && 'cursor-not-allowed opacity-50'
            )}
          >
            <FaArrowRight />
          </motion.button>
        </motion.div>
      </form>
    </div>
  );
};

export default ChatInterface;
