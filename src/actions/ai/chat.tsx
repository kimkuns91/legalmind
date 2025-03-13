import { CoreMessage, generateObject } from 'ai';
import { IMessageContent, ITextContent } from '@/interface';

import { AI } from './ai';
import { ClientMessage } from './types';
import { ServerMessage } from './types';
import { anthropic } from '@ai-sdk/anthropic';
import { auth } from '@/lib/auth';
import { getMutableAIState } from 'ai/rsc';
import { handleCaseMode } from './caselaw';
import { handleDocumentMode } from './document';
import { handleGeneralMode } from './general';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

// ServerMessage를 CoreMessage로 변환하는 유틸리티 함수
function serverMessageToCoreMessage(msg: ServerMessage): CoreMessage {
  // content가 배열인 경우 텍스트 내용만 추출
  const content =
    typeof msg.content === 'string'
      ? msg.content
      : msg.content
          .filter(item => item.type === 'text')
          .map(item => (item as ITextContent).text)
          .join('\n');

  return {
    role: msg.role === 'tool' ? 'assistant' : msg.role,
    content: content,
  };
}

export const sendMessage = async (message: string, roomId: string): Promise<ClientMessage> => {
  'use server';

  const session = await auth();

  if (!session?.user) {
    throw new Error('Unauthorized');
  }

  const userId = session.user.id;
  const history = getMutableAIState<typeof AI>('messages');

  // 사용자 메시지를 MessageContent 배열로 변환
  const userMessageContent: IMessageContent[] = [
    {
      type: 'text',
      text: message,
    },
  ];

  // 기존 메시지 가져오기
  const existingMessage = await prisma.message.findFirst({
    where: {
      conversationId: roomId,
      content: {
        equals: JSON.stringify(userMessageContent),
      },
      role: 'user',
    },
  });

  // 메시지가 없는 경우에만 저장
  if (!existingMessage) {
    try {
      await prisma.message.create({
        data: {
          role: 'user',
          conversationId: roomId,
          content: JSON.stringify(userMessageContent),
          userId,
        },
      });
    } catch (error) {
      console.error('메시지 저장 중 오류 발생:', error);
    }
  }

  history.update([
    ...(history.get() as ServerMessage[]),
    {
      role: 'user',
      content: userMessageContent,
    },
  ]);

  const analysisResult = await generateObject({
    model: anthropic('claude-3-7-sonnet-20250219'),
    system: `당신은 사용자의 메시지에서 법률 문서 생성 요청 또는 판례 찾기 요청을 감지하는 AI입니다.
            사용자의 요청을 분석하여 다음 세 가지 중 하나로 분류하세요:
            1. 일반 법률 질문
            2. 법률 문서 생성 요청
            3. 판례 찾기 요청

            다음 형식으로 JSON 응답을 제공하세요:
            {
              "requestType": "general" | "document" | "case",
              "isDocumentRequest": true/false,
              "isCaseLookup": true/false,
              "caseKeywords": ["키워드1", "키워드2"],
              "confidence": 0-100
            }`,
    messages: (history.get() as ServerMessage[]).slice(-5).map(serverMessageToCoreMessage),
    schema: z.object({
      requestType: z.enum(['general', 'document', 'case']),
      isDocumentRequest: z.boolean(),
      isCaseLookup: z.boolean(),
      caseKeywords: z.array(z.string()),
      confidence: z.number().min(0).max(100),
    }),
    temperature: 0.3,
    maxTokens: 2000,
  });

  console.log('유저 메세지 분석 결과 : ', analysisResult.object);

  const { requestType, caseKeywords, confidence } = analysisResult.object;

  if (requestType === 'document' && confidence > 70) {
    return await handleDocumentMode(history);
  } else if (requestType === 'case' && confidence > 70) {
    return await handleCaseMode(history, caseKeywords);
  } else {
    return await handleGeneralMode(history);
  }
};
