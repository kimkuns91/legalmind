import { notFound, redirect } from 'next/navigation';

import ChatInterface from '@/components/ai/ChatInterface';
import { auth } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

interface AiPageProps {
  params: { roomId: string };
}

export default async function AiPage({ params }: AiPageProps) {
  const { roomId } = params;

  // 사용자 인증 확인
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    redirect('/login?callbackUrl=/ai/' + roomId);
  }

  const userId = session.user.id;

  try {
    // 대화 정보 가져오기
    const conversation = await prisma.conversation.findUnique({
      where: {
        id: roomId,
        userId: userId, // 현재 사용자의 대화만 접근 가능
      },
      include: {
        messages: {
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    // 대화가 존재하지 않으면 404 페이지로 이동
    if (!conversation) {
      notFound();
    }

    return (
      <div className="flex h-screen w-full flex-col">
        <ChatInterface conversation={conversation} messages={conversation.messages} />
      </div>
    );
  } catch (error) {
    console.error('대화 정보를 가져오는 중 오류 발생:', error);
    return (
      <div className="flex h-full w-full items-center justify-center">
        <div className="rounded-lg bg-red-50 p-6 text-red-500 dark:bg-red-900/20 dark:text-red-300">
          <h2 className="mb-2 text-lg font-semibold">오류가 발생했습니다</h2>
          <p>대화 정보를 불러오는 중 문제가 발생했습니다. 다시 시도해 주세요.</p>
        </div>
      </div>
    );
  }
}
