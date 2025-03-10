import { notFound, redirect } from 'next/navigation';

import ChatInterface from '@/components/ai/ChatInterface';
import { auth } from '@/lib/auth';
import { getConversationWithMessages } from '@/actions/chat';

// Next.js 15에서는 params가 Promise 타입이어야 함
type PageProps = {
  params: Promise<{ roomId: string }>;
};

export default async function AiPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { roomId } = resolvedParams;

  console.log('채팅방 ID:', roomId);

  // 사용자 인증 확인
  const session = await auth();

  if (!session || !session.user || !session.user.id) {
    // 인증되지 않은 사용자는 로그인 페이지로 리다이렉트
    redirect('/login?callbackUrl=/ai/' + roomId);
  }

  try {
    // 대화 정보 가져오기 (Server Action 사용)
    const conversation = await getConversationWithMessages(roomId);

    console.log('대화 정보:', {
      id: conversation?.id,
      title: conversation?.title,
      messageCount: conversation?.messages?.length,
    });

    // 메시지 내용 로깅 (디버깅용)
    if (conversation?.messages) {
      console.log(
        '메시지 목록:',
        conversation.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content.substring(0, 50) + (msg.content.length > 50 ? '...' : ''),
        }))
      );
    }

    // 대화가 존재하지 않으면 404 페이지로 이동
    if (!conversation) {
      return notFound();
    }

    return (
      <div className="flex h-full flex-col">
        <ChatInterface conversation={conversation} messages={conversation.messages} />
      </div>
    );
  } catch (error) {
    console.error('대화 정보 조회 중 오류 발생:', error);
    return notFound();
  }
}
