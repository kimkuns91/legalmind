'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';

import { FaUser } from 'react-icons/fa';
import { IoSend } from 'react-icons/io5';
import ReactMarkdown from 'react-markdown';
import { RiRobot2Fill } from 'react-icons/ri';
import { cn } from '@/lib/utils';

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
  const [newMessage, setNewMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 자동 높이 조절 (textarea)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

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

  // Enter 키로 제출, Shift+Enter로 줄바꿈
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as unknown as FormEvent);
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

  return (
    <div className="flex h-full w-full flex-col bg-gray-50 dark:bg-gray-900">
      {/* 대화 제목 */}
      <div className="border-b bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-gray-800">
        <h1 className="text-xl font-semibold text-gray-800 dark:text-gray-100">
          {conversation.title}
        </h1>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto">
        <motion.div
          className="mx-auto max-w-3xl px-4 py-6"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-500 dark:text-gray-400">
                <RiRobot2Fill className="mx-auto mb-3 h-12 w-12 text-gray-300 dark:text-gray-600" />
                <p className="text-lg font-medium">대화를 시작해보세요</p>
                <p className="mt-1">법률 관련 질문을 입력하시면 AI가 답변해 드립니다.</p>
              </div>
            </div>
          ) : (
            messages.map(message => (
              <motion.div
                key={message.id}
                variants={messageVariants}
                className={cn('mb-6', message.role === 'user' ? 'ml-12' : 'mr-12')}
              >
                {/* 메시지 헤더 (아이콘 + 이름) */}
                <div
                  className={cn(
                    'mb-2 flex items-center',
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  {message.role !== 'user' && (
                    <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                      <RiRobot2Fill className="h-5 w-5" />
                    </div>
                  )}
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {message.role === 'user' ? '사용자' : '법률 AI'}
                  </span>
                  {message.role === 'user' && (
                    <div className="ml-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 text-white">
                      <FaUser className="h-4 w-4" />
                    </div>
                  )}
                </div>

                {/* 메시지 내용 */}
                <div
                  className={cn(
                    'rounded-2xl p-4 shadow-sm',
                    message.role === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-800 dark:bg-gray-800 dark:text-gray-100'
                  )}
                >
                  <div className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>{message.content}</ReactMarkdown>
                  </div>
                  <div
                    className={cn(
                      'mt-2 text-right text-xs',
                      message.role === 'user' ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'
                    )}
                  >
                    {new Date(message.createdAt).toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} />

          {/* 로딩 표시기 */}
          {isSubmitting && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mr-12 mb-6">
              <div className="mb-2 flex items-center">
                <div className="mr-2 flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300">
                  <RiRobot2Fill className="h-5 w-5" />
                </div>
                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  법률 AI
                </span>
              </div>
              <div className="rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800">
                <div className="flex items-center space-x-1">
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0 }}
                    className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.2 }}
                    className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"
                  />
                  <motion.div
                    animate={{ y: [0, -5, 0] }}
                    transition={{ repeat: Infinity, duration: 1, delay: 0.4 }}
                    className="h-2 w-2 rounded-full bg-gray-400 dark:bg-gray-500"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* 오류 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-auto mb-2 w-full max-w-3xl px-4"
          >
            <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="mr-2 h-5 w-5 text-red-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                {error}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 메시지 입력 폼 */}
      <div className="border-t bg-white p-4 dark:border-gray-700 dark:bg-gray-800">
        <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
          <div className="relative rounded-xl border bg-white shadow-sm dark:border-gray-700 dark:bg-gray-900">
            <textarea
              ref={inputRef}
              className="w-full resize-none rounded-xl border-0 bg-transparent py-3 pr-12 pl-4 text-gray-900 placeholder:text-gray-400 focus:ring-0 focus:outline-none dark:text-white"
              placeholder="메시지를 입력하세요..."
              value={newMessage}
              onChange={e => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={isSubmitting}
              rows={1}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={isSubmitting || !newMessage.trim()}
              className={cn(
                'absolute right-2 bottom-2 rounded-lg bg-blue-600 p-2 text-white transition-colors',
                isSubmitting || !newMessage.trim()
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-blue-700'
              )}
            >
              <IoSend className="h-5 w-5" />
            </motion.button>
          </div>
          <p className="mt-2 text-center text-xs text-gray-500 dark:text-gray-400">
            Enter 키를 눌러 전송하거나 Shift+Enter로 줄바꿈을 할 수 있습니다.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
