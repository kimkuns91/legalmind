'use client';

import { FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { IConversation, IMessage } from '@/interface';
import { generateAiResponse, sendMessage } from '@/actions';

import { BiCheck } from 'react-icons/bi';
import { FaUser } from 'react-icons/fa';
import { FiMoreHorizontal } from 'react-icons/fi';
import { IoSend } from 'react-icons/io5';
import Loading from '../common/Loading';
import { MdOutlineContentCopy } from 'react-icons/md';
import ReactMarkdown from 'react-markdown';
import { RiRobot2Fill } from 'react-icons/ri';
import { cn } from '@/lib/utils';
import { readStreamableValue } from 'ai/rsc';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';
import { useRouter } from 'next/navigation';

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
  const router = useRouter();

  // 자동 AI 응답 요청 핸들러 (첫 로드 시)
  const handleInitialResponse = useCallback(async () => {
    try {
      setIsSubmitting(true);

      // AI 응답 메시지 준비 (로딩 상태)
      const aiMessage: IMessage = {
        id: Date.now().toString(), // 임시 ID
        content: '응답을 생성하고 있습니다...',
        role: 'assistant',
        createdAt: new Date(),
        userId: '', // 서버에서 설정됨
        conversationId: conversation.id,
      };

      // 메시지 목록에 AI 메시지 추가 (로딩 상태로)
      setLocalMessages(prevMessages => [...prevMessages, aiMessage]);

      // AI 응답 생성 요청 (사용자 메시지는 이미 저장되어 있음)
      const streamValue = await generateAiResponse(conversation.id);

      // 스트림 값이 객체이고 success 속성만 있는 경우 (비스트리밍 응답)
      if (streamValue && typeof streamValue === 'object' && 'success' in streamValue) {
        setIsSubmitting(false);
        return;
      }

      // 스트림 처리
      let accumulatedResponse = '';
      let isFirstChunk = true;

      try {
        for await (const delta of readStreamableValue(streamValue)) {
          // 첫 번째 청크가 도착하면 로딩 상태 해제
          if (isFirstChunk) {
            setIsSubmitting(false);
            isFirstChunk = false;
          }

          // delta가 undefined일 수 있으므로 체크
          if (delta !== undefined && delta !== null) {
            // 새 청크를 누적 응답에 할당 (이전 응답을 덮어쓰지 않고 새 응답으로 설정)
            accumulatedResponse = delta as string;

            console.log(
              '스트림 청크 받음:',
              typeof delta === 'string' ? delta.substring(0, 50) + '...' : '비문자열 데이터'
            );

            // AI 메시지 업데이트
            aiMessage.content = accumulatedResponse;

            // 다운로드 링크가 포함된 메시지인지 확인
            const hasDownloadLink = accumulatedResponse.includes('다운로드 링크');

            console.log(
              '스트림 업데이트 받음:',
              hasDownloadLink ? '다운로드 링크 포함' : '일반 메시지',
              accumulatedResponse.substring(0, 50) + '...'
            );

            // 로컬 메시지 상태 업데이트 - 최신 상태를 기반으로 업데이트
            setLocalMessages(prevMessages => {
              // 마지막 메시지(AI 메시지)를 제외한 모든 메시지
              const messagesWithoutLastAi = prevMessages.slice(0, prevMessages.length - 1);
              // 업데이트된 AI 메시지 추가 (깊은 복사를 통해 새 객체 생성)
              return [...messagesWithoutLastAi, { ...aiMessage, content: accumulatedResponse }];
            });

            // 다운로드 링크가 포함된 메시지라면 스크롤을 즉시 아래로 이동하고 새로고침
            if (hasDownloadLink) {
              console.log('다운로드 링크 감지됨, 화면 새로고침 예약');
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

                // 다운로드 링크가 포함된 메시지를 받으면 즉시 새로고침
                setTimeout(() => {
                  console.log('다운로드 링크 감지로 인한 화면 새로고침');
                  router.refresh();
                }, 500);
              }, 100);
            }

            // 스크롤을 맨 아래로 이동
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // 스트림 처리가 완료되면 최종 메시지로 업데이트
        console.log('스트림 처리 완료, 최종 응답:', accumulatedResponse.substring(0, 50) + '...');

        // 최종 메시지 상태 업데이트
        setLocalMessages(prevMessages => {
          // 마지막 메시지(AI 메시지)를 제외한 모든 메시지
          const messagesWithoutLastAi = prevMessages.slice(0, prevMessages.length - 1);
          // 최종 AI 메시지 추가
          return [
            ...messagesWithoutLastAi,
            {
              ...aiMessage,
              content: accumulatedResponse,
              id: Date.now().toString(), // 새 ID 할당하여 React가 변경을 감지하도록 함
            },
          ];
        });

        // 스트림 처리 완료 후 서버에서 최신 메시지를 가져오기 위해 새로고침
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } catch (error) {
        console.error('스트림 처리 중 오류 발생:', error);
        setIsSubmitting(false);
      }
    } catch (err) {
      setIsSubmitting(false);
      setError(err instanceof Error ? err.message : '메시지를 전송하는 중 오류가 발생했습니다.');
      console.error('메시지 전송 중 오류:', err);
    }
  }, [conversation.id, setLocalMessages, setIsSubmitting, router]);

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
  }, [messages, handleInitialResponse]);

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

  // 메시지가 로딩 중인지 확인하는 함수
  const isMessageLoading = (message: IMessage) => {
    const documentGenerationPhrases = [
      '문서 생성을 시작합니다',
      '잠시만 기다려주세요',
      '생성 중입니다',
      '작성을 시작합니다',
    ];

    return documentGenerationPhrases.some(phrase => message.content.includes(phrase));
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
        content: '응답을 생성하고 있습니다...',
        role: 'assistant',
        createdAt: new Date(),
        userId: '', // 서버에서 설정됨
        conversationId: conversation.id,
      };

      // 메시지 목록에 AI 메시지 추가 (로딩 상태로)
      setLocalMessages(prevMessages => [...prevMessages, aiMessage]);

      // 메시지 전송 및 스트림 받기
      const streamValue = await sendMessage(conversation.id, newMessage);

      // 스트림 값이 객체이고 success 속성만 있는 경우 (비스트리밍 응답)
      if (streamValue && typeof streamValue === 'object' && 'success' in streamValue) {
        setIsSubmitting(false);
        return;
      }

      // 스트림 처리
      let accumulatedResponse = '';
      let isFirstChunk = true;

      try {
        for await (const delta of readStreamableValue(streamValue)) {
          // 첫 번째 청크가 도착하면 로딩 상태 해제
          if (isFirstChunk) {
            setIsSubmitting(false);
            isFirstChunk = false;
          }

          // delta가 undefined일 수 있으므로 체크
          if (delta !== undefined && delta !== null) {
            // 새 청크를 누적 응답에 할당 (이전 응답을 덮어쓰지 않고 새 응답으로 설정)
            accumulatedResponse = delta as string;

            console.log(
              '스트림 청크 받음:',
              typeof delta === 'string' ? delta.substring(0, 50) + '...' : '비문자열 데이터'
            );

            // AI 메시지 업데이트
            aiMessage.content = accumulatedResponse;

            // 다운로드 링크가 포함된 메시지인지 확인
            const hasDownloadLink = accumulatedResponse.includes('다운로드 링크');

            console.log(
              '스트림 업데이트 받음:',
              hasDownloadLink ? '다운로드 링크 포함' : '일반 메시지',
              accumulatedResponse.substring(0, 50) + '...'
            );

            // 로컬 메시지 상태 업데이트 - 최신 상태를 기반으로 업데이트
            setLocalMessages(prevMessages => {
              // 마지막 메시지(AI 메시지)를 제외한 모든 메시지
              const messagesWithoutLastAi = prevMessages.slice(0, prevMessages.length - 1);
              // 업데이트된 AI 메시지 추가 (깊은 복사를 통해 새 객체 생성)
              return [...messagesWithoutLastAi, { ...aiMessage, content: accumulatedResponse }];
            });

            // 다운로드 링크가 포함된 메시지라면 스크롤을 즉시 아래로 이동하고 새로고침
            if (hasDownloadLink) {
              console.log('다운로드 링크 감지됨, 화면 새로고침 예약');
              setTimeout(() => {
                messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

                // 다운로드 링크가 포함된 메시지를 받으면 즉시 새로고침
                setTimeout(() => {
                  console.log('다운로드 링크 감지로 인한 화면 새로고침');
                  router.refresh();
                }, 500);
              }, 100);
            }

            // 스크롤을 맨 아래로 이동
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
          }
        }

        // 스트림 처리가 완료되면 최종 메시지로 업데이트
        console.log('스트림 처리 완료, 최종 응답:', accumulatedResponse.substring(0, 50) + '...');

        // 최종 메시지 상태 업데이트
        setLocalMessages(prevMessages => {
          // 마지막 메시지(AI 메시지)를 제외한 모든 메시지
          const messagesWithoutLastAi = prevMessages.slice(0, prevMessages.length - 1);
          // 최종 AI 메시지 추가
          return [
            ...messagesWithoutLastAi,
            {
              ...aiMessage,
              content: accumulatedResponse,
              id: Date.now().toString(), // 새 ID 할당하여 React가 변경을 감지하도록 함
            },
          ];
        });

        // 스트림 처리 완료 후 서버에서 최신 메시지를 가져오기 위해 새로고침
        setTimeout(() => {
          router.refresh();
        }, 1000);
      } catch (error) {
        console.error('스트림 처리 중 오류 발생:', error);
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

  // 메시지 복사 핸들러
  const copyMessageToClipboard = (content: string, messageId: string) => {
    navigator.clipboard.writeText(content).then(
      () => {
        setCopiedMessageId(messageId);
        setTimeout(() => setCopiedMessageId(null), 2000);
      },
      err => {
        console.error('클립보드 복사 중 오류:', err);
      }
    );
  };

  return (
    <div className="flex h-full flex-col">
      {/* 채팅 메시지 영역 */}
      <div ref={chatContainerRef} className="flex-1 overflow-y-auto p-4 md:p-6">
        <div className="mx-auto max-w-4xl">
          {localMessages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center text-gray-500">
                <p>대화를 시작하세요.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {localMessages.map(message => (
                <div
                  key={message.id}
                  className={cn(
                    'flex items-start gap-4 rounded-lg p-4',
                    message.role === 'user'
                      ? 'bg-blue-50 dark:bg-blue-950/30'
                      : 'bg-gray-50 dark:bg-gray-800/30'
                  )}
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
                    {message.role === 'user' ? (
                      <FaUser className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                    ) : (
                      <RiRobot2Fill className="h-5 w-5 text-blue-500 dark:text-blue-400" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    {isMessageLoading(message) ? (
                      <div
                        className={cn(
                          'flex flex-col space-y-2 rounded-md p-3',
                          message.content.includes('문서') || message.content.includes('생성')
                            ? 'bg-blue-50 dark:bg-blue-900/20'
                            : 'bg-gray-50 dark:bg-gray-800/20'
                        )}
                      >
                        <div className="flex items-center space-x-3">
                          <Loading
                            size={
                              message.content.includes('문서') || message.content.includes('생성')
                                ? 50
                                : 40
                            }
                          />
                          <span
                            className={cn(
                              'font-medium',
                              message.content.includes('문서') || message.content.includes('생성')
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-gray-600 dark:text-gray-400'
                            )}
                          >
                            {message.content.includes('문서') || message.content.includes('생성')
                              ? '문서를 생성하고 있습니다'
                              : 'AI가 응답을 생성하고 있습니다'}
                          </span>
                        </div>
                        <div className="ml-12 text-sm text-gray-500 dark:text-gray-400">
                          {message.content.includes('문서') || message.content.includes('생성')
                            ? '문서 생성이 완료되면 다운로드 링크가 제공됩니다. 잠시만 기다려주세요...'
                            : '잠시만 기다려주세요...'}
                        </div>
                      </div>
                    ) : (
                      <div className="prose prose-sm dark:prose-invert prose-p:leading-relaxed prose-pre:p-0 break-words">
                        <ReactMarkdown
                          remarkPlugins={[remarkGfm]}
                          rehypePlugins={[rehypeRaw, rehypeSanitize]}
                          components={{
                            a: ({ href, children, ...props }) => (
                              <a
                                href={href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-500 hover:underline"
                                {...props}
                              >
                                {children}
                              </a>
                            ),
                          }}
                        >
                          {message.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => copyMessageToClipboard(message.content, message.id)}
                        className="inline-flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                        disabled={isMessageLoading(message)}
                      >
                        {copiedMessageId === message.id ? (
                          <>
                            <BiCheck className="h-4 w-4" />
                            <span>복사됨</span>
                          </>
                        ) : (
                          <>
                            <MdOutlineContentCopy className="h-4 w-4" />
                            <span>복사</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* 입력 영역 */}
      <div className="border-t bg-white p-4 md:p-6 dark:border-gray-800 dark:bg-gray-950">
        <div className="mx-auto max-w-4xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="relative">
              <textarea
                ref={inputRef}
                value={newMessage}
                onChange={e => setNewMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="메시지를 입력하세요..."
                className="min-h-[80px] w-full resize-none rounded-lg border border-gray-300 bg-white p-3 pr-12 shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none dark:border-gray-700 dark:bg-gray-900 dark:text-white dark:focus:border-blue-400 dark:focus:ring-blue-400"
                disabled={isSubmitting}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newMessage.trim()}
                className="absolute right-3 bottom-3 flex h-9 w-9 items-center justify-center rounded-full bg-blue-500 text-white transition-colors hover:bg-blue-600 disabled:bg-gray-300 dark:disabled:bg-gray-700"
              >
                {isSubmitting ? (
                  <FiMoreHorizontal className="h-5 w-5 animate-pulse" />
                ) : (
                  <IoSend className="h-5 w-5" />
                )}
              </button>
            </div>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-500 dark:bg-red-900/20 dark:text-red-300">
                {error}
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;
