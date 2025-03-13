import { ITextContent, ServerMessage } from './types';

import { CoreMessage } from 'ai';
import { ReactNode } from 'react';
import { TextStreamMessage } from '@/components/ai/Message';
import { createStreamableValue } from 'ai/rsc';

export interface StreamProps {
  textStream: string;
}

export function createMessageStream() {
  const textStream = createStreamableValue('');
  const textComponent = <TextStreamMessage textStream={textStream.value} />;
  return { textStream, textComponent };
}

export interface StreamHandlerParams {
  content: string;
  done: boolean;
}

export interface StreamResult {
  value: ReactNode;
}

// ServerMessage를 CoreMessage로 변환하는 유틸리티 함수
export function serverMessageToCoreMessage(message: ServerMessage): CoreMessage {
  return {
    role: message.role === 'tool' ? 'assistant' : message.role,
    content: Array.isArray(message.content)
      ? message.content
          .filter((item): item is ITextContent => item.type === 'text')
          .map(item => item.text)
          .join('\n')
      : message.content,
  };
}
