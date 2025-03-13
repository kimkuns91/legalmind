'use server';

import { IMessageContent } from '@/interface';
import { ServerMessage } from './ai/types';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

// /**
//  * 새로운 대화를 생성하는 서버 액션
//  * @param initialMessage 사용자의 초기 메시지
//  * @returns 생성된 대화의 ID
//  */
// export async function createConversation(initialMessage: string) {
//   try {
//     // 현재 인증된 사용자 정보 가져오기
//     const session = await auth();

//     if (!session || !session.user || !session.user.id) {
//       throw new Error('인증되지 않은 사용자입니다.');
//     }

//     const userId = session.user.id;

//     // 새로운 대화 생성
//     const conversation = await prisma.conversation.create({
//       data: {
//         title: initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : ''), // 메시지의 앞부분을 제목으로 사용
//         userId,
//         messages: {
//           create: {
//             content: initialMessage,
//             role: 'user',
//             userId,
//           },
//         },
//       },
//     });

//     // 캐시 갱신
//     revalidatePath('/ai');
//     revalidatePath(`/ai/${conversation.id}`);

//     return { conversationId: conversation.id };
//   } catch (error) {
//     console.error('대화 생성 중 오류 발생:', error);
//     throw new Error('대화를 생성하는 중 오류가 발생했습니다.');
//   }
// }

/**
 * 대화 생성 서버 액션
 * @param initialMessage 사용자의 초기 메시지
 * @returns 생성된 대화의 URL
 */
export async function createConversationAndRedirect(initialMessage: string) {
  try {
    const session = await auth();

    if (!session || !session.user || !session.user.id) {
      throw new Error('인증되지 않은 사용자입니다.');
    }

    const userId = session.user.id;

    // 초기 메시지 content 생성
    const messageContent: IMessageContent[] = [
      {
        type: 'text',
        text: initialMessage,
      },
    ];

    console.log(initialMessage);
    // 대화와 메시지를 함께 생성
    const conversation = await prisma.conversation.create({
      data: {
        title: initialMessage.slice(0, 50) + (initialMessage.length > 50 ? '...' : ''),
        userId,
        messages: {
          create: {
            content: JSON.stringify(messageContent),
            role: 'user',
            userId,
          },
        },
      },
      include: {
        messages: true,
      },
    });

    // 캐시 갱신
    revalidatePath('/ai');
    revalidatePath(`/ai/${conversation.id}`);

    // AI 응답을 위한 초기 상태만 전달
    const initialClientMessage = {
      id: conversation.messages[0].id,
      role: 'user' as const,
      content: initialMessage,
      needsResponse: true, // AI 응답이 필요함을 표시
    };

    return {
      redirectUrl: `/ai/${conversation.id}`,
      initialMessage: initialClientMessage,
    };
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
export async function getConversation(roomId: string): Promise<ServerMessage[]> {
  'use server';

  // 사용자 인증 확인
  const session = await auth();

  if (!session?.user) {
    redirect('/login');
  }

  try {
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: roomId,
        userId: session.user.id,
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
      throw new Error('대화를 찾을 수 없습니다.');
    }

    const messages: ServerMessage[] = conversation.messages.map(msg => ({
      role: msg.role as 'user' | 'assistant' | 'tool',
      content: msg.content as IMessageContent[] | string,
    }));

    return messages;
  } catch (error) {
    console.error('대화 정보를 가져오는 중 오류 발생:', error);
    return [];
  }
}
