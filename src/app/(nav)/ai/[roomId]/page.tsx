import AiClient from '@/components/ai/AIClient';
import { Suspense } from 'react';

// 로딩 컴포넌트
const Loading = () => (
  <div className="flex h-dvh items-center justify-center">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
  </div>
);

interface RoomIdPageProps {
  params: Promise<{ roomId: string }>;
}

export default async function RoomIdPage({ params }: RoomIdPageProps) {
  const resolvedParams = await params;
  const roomId = resolvedParams.roomId;

  return (
    <Suspense fallback={<Loading />}>
      <AiClient roomId={roomId} />
    </Suspense>
  );
}
