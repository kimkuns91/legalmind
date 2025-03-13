'use server';

import { IConversation, IMessage } from '@/interface';

import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

/**
 * 사용자의 최근 상담 내역을 가져오는 서버 액션
 * @param limit 가져올 상담 내역의 최대 개수 (기본값: 5)
 * @param skip 건너뛸 상담 내역의 개수 (기본값: 0)
 * @returns 최근 상담 내역 배열 또는 에러 객체
 */
export async function getRecentConsultations(
  limit: number = 5,
  skip: number = 0
): Promise<{ conversations: IConversation[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { error: '로그인이 필요합니다.', conversations: [] };
    }

    const conversations = await prisma.conversation.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
          take: 1,
        },
      },
      orderBy: {
        updatedAt: 'desc',
      },
      take: limit,
      skip: skip,
    });

    // Prisma 결과를 IConversation 타입으로 변환
    const typedConversations: IConversation[] = conversations.map(conv => ({
      ...conv,
      messages: conv.messages.map(msg => ({
        ...msg,
        role: msg.role as 'user' | 'assistant',
      })) as IMessage[],
    }));

    return { conversations: typedConversations };
  } catch (error) {
    console.error('상담 내역 조회 중 오류:', error);
    return { error: '상담 내역을 불러오는 중 오류가 발생했습니다.', conversations: [] };
  }
}

/**
 * 특정 상담의 상세 정보를 가져오는 서버 액션
 * @param conversationId 상담 ID
 * @returns 상담 상세 정보 또는 에러 객체
 */
export async function getConsultationDetail(conversationId: string) {
  try {
    // 현재 인증된 사용자 정보 가져오기
    const session = await auth();

    // 인증되지 않은 경우 에러 반환
    if (!session || !session.user || !session.user.id) {
      return { error: '인증되지 않은 사용자입니다.' };
    }

    // 특정 상담의 상세 정보 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: conversationId,
        userId: session.user.id, // 본인의 상담만 조회 가능
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!conversation) {
      return { error: '상담 내역을 찾을 수 없습니다.' };
    }

    return { conversation };
  } catch (error) {
    console.error('상담 상세 정보 조회 중 오류 발생:', error);
    return { error: '상담 상세 정보를 불러오는 중 오류가 발생했습니다.' };
  }
}
