'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { generateAiResponse, sendMessage } from '@/actions/chat';

import { BiCheck } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import { MdOutlineContentCopy } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import { RiRobot2Fill } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { readStreamableValue } from 'ai/rsc';

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
  const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
  const [localMessages, setLocalMessages] = useState<IMessage[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef<boolean>(true);
  const hasSetInitialMessagesRef = useRef<boolean>(false);

  // 컴포넌트가 마운트될 때 서버에서 받은 메시지로 초기화
  useEffect(() => {
    console.log('서버에서 받은 메시지:', messages);

    // 메시지가 있을 때만 상태 업데이트
    if (messages && messages.length > 0) {
      // 초기 메시지 설정이 아직 되지 않았을 때만 설정
      if (!hasSetInitialMessagesRef.current) {
        console.log('초기 메시지 설정');
        setLocalMessages(messages);
        hasSetInitialMessagesRef.current = true;
      }

      // 첫 로드 시 사용자 메시지만 있고 AI 응답이 없는 경우 자동으로 AI 응답 요청
      if (initialLoadRef.current) {
        initialLoadRef.current = false;

        const userMessages = messages.filter(msg => msg.role === 'user');
        const aiMessages = messages.filter(msg => msg.role === 'assistant');

        console.log('사용자 메시지 수:', userMessages.length);
        console.log('AI 메시지 수:', aiMessages.length);

        if (userMessages.length > aiMessages.length) {
          console.log('AI 응답 요청 시작');
          // AI 응답 요청
          handleInitialResponse();
        }
      }
    } else {
      console.log('메시지가 없거나 빈 배열입니다.');
      if (!hasSetInitialMessagesRef.current) {
        setLocalMessages([]);
        hasSetInitialMessagesRef.current = true;
      }
    }
  }, [messages]);

  // 메시지 목록이 업데이트될 때마다 스크롤을 맨 아래로 이동
  useEffect(() => {
    console.log('렌더링 중인 메시지:', localMessages);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [localMessages]);

  // 자동 높이 조절 (textarea)
  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = `${Math.min(inputRef.current.scrollHeight, 120)}px`;
    }
  }, [newMessage]);

  // 자동 AI 응답 요청 핸들러 (첫 로드 시)
  const handleInitialResponse = async () => {
    try {
      setIsSubmitting(true);

      // AI 응답 메시지 준비 (로딩 상태)
      const aiMessage: IMessage = {
        id: Date.now().toString(), // 임시 ID
        content: '',
        role: 'assistant',
        createdAt: new Date(),
        userId: '', // 서버에서 설정됨
        conversationId: conversation.id,
      };

      // 메시지 목록에 AI 메시지 추가 (빈 상태로)
      setLocalMessages(prevMessages => [...prevMessages, aiMessage]);

      // AI 응답 생성 요청 (사용자 메시지는 이미 저장되어 있음)
      const streamValue = await generateAiResponse(conversation.id);

      // 스트림에서 텍스트 읽기
      let accumulatedResponse = '';
      let isFirstChunk = true;

      try {
        for await (const delta of readStreamableValue(streamValue)) {
          // 첫 번째 청크가 도착하면 로딩 상태 해제
          if (isFirstChunk) {
            setIsSubmitting(false);
            isFirstChunk = false;
          }

          accumulatedResponse = delta;

          // AI 메시지 업데이트
          aiMessage.content = accumulatedResponse;

          // 로컬 메시지 상태 업데이트 - 최신 상태를 기반으로 업데이트
          setLocalMessages(prevMessages => {
            // 마지막 메시지(AI 메시지)를 제외한 모든 메시지
            const messagesWithoutLastAi = prevMessages.slice(0, prevMessages.length - 1);
            // 업데이트된 AI 메시지 추가
            return [...messagesWithoutLastAi, { ...aiMessage }];
          });

          // 스크롤을 맨 아래로 이동
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (streamError) {
        console.error('스트림 읽기 중 오류:', streamError);
        setError('응답을 받는 중 오류가 발생했습니다.');
        setIsSubmitting(false);
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : '메시지를 전송하는 중 오류가 발생했습니다.');
      console.error('메시지 전송 중 오류:', err);
    }
  };

  // 메시지 전송 핸들러
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (!newMessage.trim() || isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      // 사용자 메시지를 UI에 즉시 추가
      const userMessage: IMessage = {
        id: Date.now().toString(), // 임시 ID
        content: newMessage,
        role: 'user',
        createdAt: new Date(),
        userId: '', // 서버에서 설정됨
        conversationId: conversation.id,
      };

      // 메시지 목록에 사용자 메시지 추가 - 최신 상태 사용
      setLocalMessages(prevMessages => [...prevMessages, userMessage]);

      // 입력창 초기화
      setNewMessage('');

      // AI 응답 메시지 준비 (로딩 상태)
      const aiMessage: IMessage = {
        id: (Date.now() + 1).toString(), // 임시 ID
        content: '',
        role: 'assistant',
        createdAt: new Date(),
        userId: '', // 서버에서 설정됨
        conversationId: conversation.id,
      };

      // 메시지 목록에 AI 메시지 추가 (빈 상태로)
      setLocalMessages(prevMessages => [...prevMessages, aiMessage]);

      // 메시지 전송 및 스트림 받기
      const streamValue = await sendMessage(conversation.id, newMessage);

      // 스트림에서 텍스트 읽기
      let accumulatedResponse = '';
      let isFirstChunk = true;

      try {
        for await (const delta of readStreamableValue(streamValue)) {
          // 첫 번째 청크가 도착하면 로딩 상태 해제
          if (isFirstChunk) {
            setIsSubmitting(false);
            isFirstChunk = false;
          }

          accumulatedResponse = delta;

          // AI 메시지 업데이트
          aiMessage.content = accumulatedResponse;

          // 로컬 메시지 상태 업데이트 - 최신 상태를 기반으로 업데이트
          setLocalMessages(prevMessages => {
            // 마지막 메시지(AI 메시지)를 제외한 모든 메시지
            const messagesWithoutLastAi = prevMessages.slice(0, prevMessages.length - 1);
            // 업데이트된 AI 메시지 추가
            return [...messagesWithoutLastAi, { ...aiMessage }];
          });

          // 스크롤을 맨 아래로 이동
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }
      } catch (streamError) {
        console.error('스트림 읽기 중 오류:', streamError);
        setError('응답을 받는 중 오류가 발생했습니다.');
        setIsSubmitting(false);
      }
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

  // 메시지 복사 기능
  const copyMessageToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      },
      err => {
        console.error('메시지 복사 실패:', err);
      }
    );
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
    <div className="bg-background text-foreground flex h-full w-full flex-col">
      {/* 대화 제목 */}
      <div className="border-border bg-card border-b p-4 shadow-sm">
        <h1 className="text-card-foreground text-xl font-semibold">{conversation.title}</h1>
      </div>

      {/* 메시지 목록 */}
      <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
        <motion.div
          className="mx-auto w-full max-w-4xl"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {localMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center py-20">
              <div className="text-muted-foreground text-center">
                <RiRobot2Fill className="text-muted-foreground/60 mx-auto mb-3 h-16 w-16" />
                <p className="text-xl font-medium">대화를 시작해보세요</p>
                <p className="mt-2">법률 관련 질문을 입력하시면 AI가 답변해 드립니다.</p>
              </div>
            </div>
          ) : (
            localMessages.map((message, index) => (
              <motion.div
                key={`${message.id}-${index}`}
                variants={messageVariants}
                className={cn(
                  'group border-border w-full border-b',
                  message.role === 'user' ? 'bg-background' : 'bg-card'
                )}
              >
                <div className="mx-auto flex w-full max-w-4xl p-4 md:px-8 md:py-6">
                  {/* 아이콘 */}
                  <div className="mr-4 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full">
                    {message.role === 'user' ? (
                      <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
                        <FaUser className="h-4 w-4" />
                      </div>
                    ) : (
                      <div className="bg-chart-1 flex h-8 w-8 items-center justify-center rounded-full text-white">
                        <RiRobot2Fill className="h-5 w-5" />
                      </div>
                    )}
                  </div>

                  {/* 메시지 내용 */}
                  <div className="flex-1 overflow-hidden">
                    <div className="text-muted-foreground mb-1 text-sm font-medium">
                      {message.role === 'user' ? '사용자' : '해주세요 AI'}
                    </div>
                    <div className="prose prose-invert dark:prose-invert max-w-none">
                      {message.content ? (
                        <ReactMarkdown>{message.content}</ReactMarkdown>
                      ) : message.role === 'assistant' && isSubmitting ? (
                        <div className="flex items-center space-x-2">
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
                            className="bg-muted-foreground/60 h-2 w-2 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: 'easeInOut',
                              delay: 0.2,
                            }}
                            className="bg-muted-foreground/60 h-2 w-2 rounded-full"
                          />
                          <motion.div
                            animate={{ opacity: [0.4, 1, 0.4] }}
                            transition={{
                              repeat: Infinity,
                              duration: 1.5,
                              ease: 'easeInOut',
                              delay: 0.4,
                            }}
                            className="bg-muted-foreground/60 h-2 w-2 rounded-full"
                          />
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* 메시지 액션 버튼 */}
                  <div className="ml-2 flex items-start opacity-0 transition-opacity group-hover:opacity-100">
                    <button
                      onClick={() => copyMessageToClipboard(message.content, message.id)}
                      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground rounded p-1"
                      aria-label="메시지 복사"
                      title="메시지 복사"
                      disabled={!message.content}
                    >
                      {copiedMessageId === message.id ? (
                        <BiCheck className="h-5 w-5 text-green-500" />
                      ) : (
                        <MdOutlineContentCopy className="h-5 w-5" />
                      )}
                    </button>
                    <button
                      className="text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-1 rounded p-1"
                      aria-label="더 보기"
                      title="더 보기"
                    >
                      <FiMoreHorizontal className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))
          )}
          <div ref={messagesEndRef} className="h-4" />
        </motion.div>
      </div>

      {/* 오류 메시지 */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="mx-auto mb-2 w-full max-w-4xl px-4"
          >
            <div className="bg-destructive/20 text-destructive-foreground border-destructive/50 rounded-md border p-3 text-sm">
              <div className="flex">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="text-destructive mr-2 h-5 w-5"
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
      <div className="border-border bg-card border-t p-4">
        <form onSubmit={handleSubmit} className="mx-auto max-w-4xl">
          <div className="border-input bg-background relative rounded-xl border shadow-sm">
            <textarea
              ref={inputRef}
              className="text-foreground placeholder:text-muted-foreground w-full resize-none rounded-xl border-0 bg-transparent py-3 pr-12 pl-4 focus:ring-0 focus:outline-none"
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
                'bg-chart-1 absolute right-2 bottom-2 rounded-lg p-2 text-white transition-colors',
                isSubmitting || !newMessage.trim()
                  ? 'cursor-not-allowed opacity-50'
                  : 'hover:bg-chart-1/90'
              )}
            >
              <IoSend className="h-5 w-5" />
            </motion.button>
          </div>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            Enter 키를 눌러 전송하거나 Shift+Enter로 줄바꿈을 할 수 있습니다.
          </p>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;
