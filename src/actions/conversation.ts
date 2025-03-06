'use server';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

/**
 * 새로운 대화를 생성하는 서버 액션
 * @param initialMessage 사용자의 초기 메시지
 * @returns 생성된 대화의 ID
 */
export async function createConversation(initialMessage: string) {
  try {
    // 현재 인증된 사용자 정보 가져오기
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new Error('인증되지 않은 사용자입니다.');
    }

    const userId = session.user.id;

    // 새로운 대화 생성
    const conversation = await prisma.conversation.create({
      data: {
        title: initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : ''), // 메시지의 앞부분을 제목으로 사용
        userId,
        messages: {
          create: {
            content: initialMessage,
            role: 'user',
            userId,
          },
        },
      },
    });

    // 캐시 갱신
    revalidatePath('/ai');
    revalidatePath(`/ai/${conversation.id}`);

    return { conversationId: conversation.id };
  } catch (error) {
    console.error('대화 생성 중 오류 발생:', error);
    throw new Error('대화를 생성하는 중 오류가 발생했습니다.');
  }
}

/**
 * 대화 생성 서버 액션
 * @param initialMessage 사용자의 초기 메시지
 * @returns 생성된 대화의 URL
 */
export async function createConversationAndRedirect(initialMessage: string) {
  try {
    // 대화 생성
    const { conversationId } = await createConversation(initialMessage);

    // 리다이렉트 URL 반환
    return { redirectUrl: `/ai/${conversationId}` };
  } catch (error) {
    console.error('대화 생성 중 오류 발생:', error);
    throw new Error('대화를 생성하는 중 오류가 발생했습니다.');
  }
}
