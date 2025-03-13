import { AI, AIState } from '@/actions/ai/ai';

import { ServerMessage } from '@/actions/ai/types';
import { getConversation } from '@/actions/conversation';
import { notFound } from 'next/navigation';

interface AiLayoutProps {
  children: React.ReactNode;
  params: Promise<{ roomId: string }>;
}

export default async function AiLayout({ children, params }: AiLayoutProps) {
  const resolvedParams = await params;
  const roomId = resolvedParams.roomId;

  const savedMessages: ServerMessage[] = await getConversation(roomId);

  if (!savedMessages || savedMessages.length === 0) {
    return notFound();
  }
  // 타입 단언을 사용하여 타입 호환성 문제 해결
  const initialAIState: AIState = {
    chatId: roomId,
    messages: savedMessages,
  };
  console.log('initialAIState', initialAIState);
  return (
    <AI initialAIState={initialAIState} initialUIState={[]}>
      {children}
    </AI>
  );
}
