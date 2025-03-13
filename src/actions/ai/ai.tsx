import { createAI, getAIState } from 'ai/rsc';

import { Message } from '@/components/ai/Message';
import { ReactNode } from 'react';
import { ServerMessage } from './types';
import { auth } from '@/lib/auth';
import { generateId } from 'ai';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { sendMessage } from './chat';

export type UIState = Array<ReactNode>;

export type AIState = {
  chatId: string;
  messages: Array<ServerMessage>;
};

export const AI = createAI<AIState, UIState>({
  initialAIState: {
    chatId: generateId(),
    messages: [],
  },
  initialUIState: [],
  actions: {
    sendMessage,
  },
  onSetAIState: async ({ state, done }: { state: AIState; done: boolean }) => {
    'use server';

    console.log('============');
    console.log('onSetAIState 호출');
    console.log('============');
    if (done) {
      // save to database
      // 사용자 인증 확인
      const session = await auth();

      if (!session?.user) {
        redirect('/login');
      }

      const lastMessage = state.messages[state.messages.length - 1];

      console.log('============');
      console.log('DB에 저장 시도');
      console.log('============');
      // DB에 저장
      await prisma.message.create({
        data: {
          role: lastMessage.role || 'assistant',
          conversationId: state.chatId,
          content: JSON.stringify(lastMessage.content),
          userId: session.user.id,
        },
      });
      console.log('============');
      console.log('DB에 저장 완료');
      console.log('============');
    }
  },

  onGetUIState: async () => {
    'use server';

    try {
      const { messages } = getAIState();
      console.log('messages :', messages);

      return messages.map(({ role, content }: ServerMessage) => {
        let parsedContent;

        try {
          // 이미 객체/배열인 경우
          if (typeof content === 'object' && content !== null) {
            parsedContent = content;
          }
          // 문자열인 경우
          else if (typeof content === 'string') {
            try {
              // JSON 파싱 시도
              parsedContent = JSON.parse(content);

              // 파싱된 결과가 배열이고 text 타입만 있는 경우 텍스트 추출
              if (
                Array.isArray(parsedContent) &&
                parsedContent.every(item => item.type === 'text')
              ) {
                parsedContent = parsedContent.map(item => item.text).join('\n');
              }
            } catch {
              // JSON 파싱 실패 시 원본 문자열 사용
              parsedContent = content;
            }
          }
          // 그 외의 경우
          else {
            parsedContent = content;
          }
        } catch (e) {
          console.error('메시지 파싱 오류:', e);
          parsedContent = content;
        }

        return {
          id: generateId(),
          role,
          display: <Message key={generateId()} role={role} content={parsedContent} />,
        };
      });
    } catch (error) {
      console.error('Error loading conversation:', error);
      return [];
    }
  },
});
