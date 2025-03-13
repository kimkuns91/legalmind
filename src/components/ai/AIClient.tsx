'use client';

import { useActions, useUIState } from 'ai/rsc';
import { useEffect, useRef, useState } from 'react';

import { ClientMessage } from '@/actions/ai/types';
import { Message } from '@/components/ai/Message';
import { generateId } from 'ai';
import { useScrollToBottom } from '@/components/ai/UseScrollToBottom';

// Allow streaming responses up to 60 seconds
export const maxDuration = 60;

interface AiClientProps {
  roomId: string;
}

const AiClient: React.FC<AiClientProps> = ({ roomId }) => {
  const [conversation, setConversation] = useUIState();
  const [input, setInput] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const { sendMessage } = useActions();
  const inputRef = useRef<HTMLInputElement>(null);
  const [messagesContainerRef, messagesEndRef] = useScrollToBottom<HTMLDivElement>();
  const initialMessageSentRef = useRef(false);

  // 초기 메시지 처리 및 AI 응답 요청
  useEffect(() => {
    const handleInitialMessage = async () => {
      const storedMessage = localStorage.getItem('initialMessage');
      if (!storedMessage) return;

      try {
        const initialMessage = JSON.parse(storedMessage);
        localStorage.removeItem('initialMessage');

        // 초기 메시지가 AI 응답이 필요한 경우에만 처리
        if (initialMessage.needsResponse) {
          const userMessage: ClientMessage = {
            id: initialMessage.id,
            role: 'user',
            display: (
              <Message key={initialMessage.id} role="user" content={initialMessage.content} />
            ),
          };
          setConversation([userMessage]);

          // AI 응답 요청
          setIsSubmitting(true);
          const response = await sendMessage(initialMessage.content, roomId);
          if (response) {
            setConversation((messages: ClientMessage[]) => [
              ...messages,
              response as ClientMessage,
            ]);
          }
        }
      } catch (error) {
        console.error('초기 메시지 처리 중 오류:', error);
      } finally {
        setIsSubmitting(false);
      }
    };

    if (!initialMessageSentRef.current) {
      initialMessageSentRef.current = true;
      handleInitialMessage();
    }
  }, [roomId, sendMessage, setConversation]);

  // 스크롤 조정
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [roomId, conversation.length, messagesEndRef]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!input.trim() || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const userMessage: ClientMessage = {
        id: generateId(),
        role: 'user',
        display: <Message key={generateId()} role="user" content={input} />,
      };

      setConversation((messages: ClientMessage[]) => [...messages, userMessage]);
      const userInput = input.trim();
      setInput('');

      const response = await sendMessage(userInput, roomId);
      if (response) {
        setConversation((messages: ClientMessage[]) => [...messages, response as ClientMessage]);
      }
    } catch (error) {
      console.error('메시지 전송 중 오류 발생:', error);
      const errorMessage: ClientMessage = {
        id: generateId(),
        role: 'assistant',
        display: (
          <Message
            key={generateId()}
            role="assistant"
            content="메시지 전송 중 오류가 발생했습니다. 다시 시도해주세요."
          />
        ),
      };
      setConversation((messages: ClientMessage[]) => [...messages, errorMessage]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="from-background to-muted flex h-dvh flex-col bg-gradient-to-b">
      {/* 메시지 영역 */}
      <div
        ref={messagesContainerRef}
        className="scrollbar flex-1 space-y-6 overflow-y-auto px-4 py-6"
      >
        <div className="mx-auto w-full max-w-3xl space-y-6">
          {conversation.map((message: ClientMessage) => (
            <div key={message.id} className="border-border flex flex-col gap-1 border-b p-2">
              {message.display}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* 입력 영역 - 하단에 고정 */}
      <div className="border-border bg-card border-t p-4 shadow-lg">
        <div className="mx-auto max-w-3xl">
          <form className="relative flex items-center" onSubmit={handleSubmit}>
            <input
              ref={inputRef}
              className="border-input bg-background text-foreground focus:ring-ring w-full rounded-full border px-4 py-3 pr-12 focus:ring-2 focus:outline-none"
              placeholder="메시지를 입력하세요..."
              value={input}
              onChange={event => setInput(event.target.value)}
              disabled={isSubmitting}
              aria-label="메시지 입력"
            />
            <button
              type="submit"
              className="text-muted-foreground hover:text-primary absolute right-3 rounded-full p-1.5 focus:outline-none disabled:opacity-50"
              disabled={!input.trim() || isSubmitting}
              aria-label="메시지 전송"
            >
              {isSubmitting ? (
                <svg
                  className="h-5 w-5 animate-spin"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
          </form>
          <p className="text-muted-foreground mt-2 text-center text-xs">
            법률마인드 AI는 법률 정보 제공을 위한 도구이며, 전문적인 법률 자문을 대체할 수 없습니다.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AiClient;
