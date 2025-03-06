'use server';

import { auth } from '@/lib/auth';
import { createStreamableValue } from 'ai/rsc';
import { openai } from '@ai-sdk/openai';
import { prisma } from '@/lib/prisma';
import { streamText } from 'ai';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * 메시지 전송 및 AI 응답 생성 Server Action
 * @param conversationId 대화 ID
 * @param message 사용자 메시지
 * @returns 스트림 객체
 */
export async function sendMessage(conversationId: string, message: string) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  try {
    // 사용자 메시지 저장
    await prisma.message.create({
      data: {
        content: message,
        role: 'user',
        conversationId,
        userId,
      },
    });

    // 대화 내역 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    // 스트림 생성
    const stream = createStreamableValue();

    // 비동기 함수로 AI 응답 생성 및 스트림 업데이트
    (async () => {
      try {
        // 대화 내용을 OpenAI 메시지 형식으로 변환
        const messages: ChatMessage[] = conversation.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // AI 응답 스트리밍
        const { textStream } = await streamText({
          model: openai('gpt-4-turbo'),
          system:
            '당신은 법률 전문가입니다. 사용자의 법률 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.',
          messages,
        });

        let fullResponse = '';

        // 스트림에서 텍스트 읽기
        for await (const text of textStream) {
          fullResponse += text;
          stream.update(fullResponse);
        }

        // 응답이 완료되면 DB에 저장
        await prisma.message.create({
          data: {
            content: fullResponse,
            role: 'assistant',
            conversationId,
            userId,
          },
        });

        // 대화 업데이트 시간 갱신
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        stream.done();
      } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        stream.error(new Error('AI 응답을 생성하는 중 오류가 발생했습니다.'));
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('메시지 전송 중 오류 발생:', error);
    throw new Error('메시지를 전송하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대화 목록 조회 Server Action
 * @returns 사용자의 대화 목록
 */
export async function getConversations() {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  return prisma.conversation.findMany({
    where: { userId: session.user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      messages: {
        take: 1,
        orderBy: { createdAt: 'desc' },
      },
    },
  });
}

/**
 * 특정 대화 조회 Server Action
 * @param conversationId 대화 ID
 * @returns 특정 대화 정보와 메시지 목록
 */
export async function getConversation(conversationId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  return prisma.conversation.findUnique({
    where: {
      id: conversationId,
      userId: session.user.id,
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
  });
}

/**
 * AI 응답만 생성하는 Server Action (사용자 메시지는 이미 저장되어 있음)
 * @param conversationId 대화 ID
 * @returns 스트림 객체
 */
export async function generateAiResponse(conversationId: string) {
  'use server';

  const session = await auth();
  if (!session?.user?.id) throw new Error('인증되지 않은 사용자입니다.');

  const userId = session.user.id;

  try {
    // 대화 내역 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!conversation) {
      throw new Error('대화를 찾을 수 없습니다.');
    }

    // 스트림 생성
    const stream = createStreamableValue();

    // 비동기 함수로 AI 응답 생성 및 스트림 업데이트
    (async () => {
      try {
        // 대화 내용을 OpenAI 메시지 형식으로 변환
        const messages: ChatMessage[] = conversation.messages.map(msg => ({
          role: msg.role as 'user' | 'assistant',
          content: msg.content,
        }));

        // AI 응답 스트리밍
        const { textStream } = await streamText({
          model: openai('gpt-4-turbo'),
          system:
            '당신은 법률 전문가입니다. 사용자의 법률 관련 질문에 정확하고 도움이 되는 답변을 제공하세요.',
          messages,
        });

        let fullResponse = '';

        // 스트림에서 텍스트 읽기
        for await (const text of textStream) {
          fullResponse += text;
          stream.update(fullResponse);
        }

        // 응답이 완료되면 DB에 저장
        await prisma.message.create({
          data: {
            content: fullResponse,
            role: 'assistant',
            conversationId,
            userId,
          },
        });

        // 대화 업데이트 시간 갱신
        await prisma.conversation.update({
          where: { id: conversationId },
          data: { updatedAt: new Date() },
        });

        stream.done();
      } catch (error) {
        console.error('AI 응답 생성 중 오류 발생:', error);
        stream.error(new Error('AI 응답을 생성하는 중 오류가 발생했습니다.'));
      }
    })();

    return stream.value;
  } catch (error) {
    console.error('AI 응답 생성 중 오류 발생:', error);
    throw new Error('AI 응답을 생성하는 중 오류가 발생했습니다.');
  }
}
