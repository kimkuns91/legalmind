'use client';

import { FiCheck, FiCopy } from 'react-icons/fi';
import { ICaseLaw, IMessageContent } from '@/interface';
import { StreamableValue, useStreamableValue } from 'ai/rsc';

import { BotIcon } from './Icons';
import CaseLaws from './CaseLaws';
import { Markdown } from './Markdown';
import { cn } from '@/lib/utils';
import { generateId } from 'ai';
import { useState } from 'react';

interface MessageProps {
  role: 'user' | 'assistant' | 'tool';
  content: string | IMessageContent[] | IMessageContent;
}

// 스트리밍 메시지 컴포넌트
export const TextStreamMessage = ({ textStream }: { textStream: StreamableValue }) => {
  const [text] = useStreamableValue(textStream);
  const messageId = generateId();

  return (
    <div className="flex w-full flex-row gap-4 rounded-lg px-4 py-2 first-of-type:pt-4">
      <div className="bg-accent text-accent-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm">
        <BotIcon />
      </div>
      <div className="flex w-full max-w-[85%] flex-col gap-1">
        <div className="bg-secondary text-foreground flex flex-col gap-4 rounded-2xl p-4 shadow-sm">
          <Markdown id={messageId}>{text}</Markdown>
        </div>
      </div>
    </div>
  );
};

// 일반 메시지 컴포넌트
export const Message: React.FC<MessageProps> = ({ role, content }) => {
  const isUser = role === 'user';
  const [isCopied, setIsCopied] = useState(false);

  // 텍스트 추출 함수
  const extractText = (content: string | IMessageContent[] | IMessageContent): string => {
    if (typeof content === 'string') {
      return content;
    }
    if (Array.isArray(content)) {
      return content
        .filter(item => item.type === 'text')
        .map(item => (item as { text: string }).text)
        .join('\n');
    }
    if (content && typeof content === 'object' && 'type' in content) {
      if (content.type === 'text' && 'text' in content) {
        return content.text;
      }
    }
    return '';
  };

  // 복사 기능
  const handleCopy = async () => {
    const textToCopy = extractText(content);
    try {
      await navigator.clipboard.writeText(textToCopy);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  // 컨텐츠 렌더링 로직
  const renderContent = () => {
    const renderText = (text: string) => (
      <div className={cn('text-foreground flex flex-col gap-4')}>
        <Markdown id={generateId()}>{text}</Markdown>
      </div>
    );

    // 문자열인 경우 JSON 파싱 시도
    if (typeof content === 'string') {
      try {
        const parsedContent = JSON.parse(content);
        if (Array.isArray(parsedContent)) {
          return parsedContent.map((item, index) => {
            if (item.type === 'text') {
              return (
                <div key={index} className="mb-2 last:mb-0">
                  {renderText(item.text)}
                </div>
              );
            } else if (
              item.type === 'tool-result' &&
              item.toolName === 'get-case-laws-by-keyword' &&
              Array.isArray(item.result)
            ) {
              // decisionDate를 Date 객체로 변환
              const processedResults = item.result.map((result: ICaseLaw) => ({
                ...result,
                decisionDate: new Date(result.decisionDate),
              }));
              return <CaseLaws key={index} results={processedResults} />;
            }
            return null;
          });
        }
        // 단일 객체인 경우
        if (parsedContent.type === 'text') {
          return renderText(parsedContent.text);
        }
      } catch {
        // JSON 파싱 실패 시 일반 텍스트로 처리
        return renderText(content);
      }
    }

    // 배열인 경우 (IMessageContent[])
    if (Array.isArray(content)) {
      return content.map((item, index) => {
        if (item.type === 'text') {
          return (
            <div key={index} className="mb-2 last:mb-0">
              {renderText(item.text)}
            </div>
          );
        } else if (
          item.type === 'tool-result' &&
          item.toolName === 'get-case-laws-by-keyword' &&
          Array.isArray(item.result)
        ) {
          // decisionDate를 Date 객체로 변환
          const processedResults = item.result.map((result: ICaseLaw) => ({
            ...result,
            decisionDate: new Date(result.decisionDate),
          }));
          return <CaseLaws key={index} results={processedResults} />;
        }
        return null;
      });
    }

    // 객체인 경우 (단일 IMessageContent)
    if (content && typeof content === 'object' && 'type' in content) {
      if (content.type === 'text' && 'text' in content) {
        return renderText(content.text);
      } else if (
        content.type === 'tool-result' &&
        content.toolName === 'get-case-laws-by-keyword' &&
        'result' in content &&
        Array.isArray(content.result)
      ) {
        // decisionDate를 Date 객체로 변환
        const processedResults = content.result.map((result: ICaseLaw) => ({
          ...result,
          decisionDate: new Date(result.decisionDate),
        }));
        return <CaseLaws results={processedResults} />;
      }
    }

    // 기타 경우
    return <div>지원되지 않는 메시지 형식입니다.</div>;
  };

  return (
    <div
      className={cn(
        'flex w-full flex-row gap-4 rounded-lg px-4 py-2 first-of-type:pt-4',
        isUser && 'justify-end'
      )}
    >
      {!isUser && (
        <div className="bg-accent text-accent-foreground flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full shadow-sm">
          <BotIcon />
        </div>
      )}
      <div className={cn('flex flex-col gap-1', isUser ? 'max-w-[85%]' : 'w-full max-w-[85%]')}>
        <div
          className={cn(
            'group relative flex flex-col gap-4 rounded-2xl p-4 shadow-sm',
            isUser
              ? 'bg-primary/10 text-foreground backdrop-blur-sm'
              : 'bg-secondary text-foreground'
          )}
        >
          {renderContent()}
          {!isUser && (
            <div className="border-border/50 mt-2 flex items-center justify-end border-t pt-2">
              <button
                onClick={handleCopy}
                className="text-muted-foreground hover:bg-secondary-foreground/10 hover:text-foreground flex items-center gap-1.5 rounded-md px-2 py-1 text-xs transition-colors"
                aria-label="메시지 복사"
              >
                {isCopied ? (
                  <>
                    <FiCheck className="h-3.5 w-3.5" />
                    <span>복사됨</span>
                  </>
                ) : (
                  <>
                    <FiCopy className="h-3.5 w-3.5" />
                    <span>복사하기</span>
                  </>
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
