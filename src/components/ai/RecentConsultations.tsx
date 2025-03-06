'use client';

import { FaRegClock } from 'react-icons/fa';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { getRecentConsultations } from '@/actions/consultations';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// 로그인이 필요한 경우 표시할 컴포넌트
const LoginRequired = () => {
  return (
    <div className="flex flex-grow flex-col space-y-3 overflow-y-auto">
      <Link
        href="/login"
        className="flex h-full items-center justify-center rounded-md bg-[#121212] py-32 transition-colors duration-200 hover:bg-zinc-900/50"
      >
        <p className="text-center text-sm font-medium text-zinc-300">
          대화 내역을 보려면
          <br /> 로그인이 필요합니다.
        </p>
      </Link>
    </div>
  );
};

// 상담 내역이 없을 때 표시할 컴포넌트
const EmptyConsultations = () => {
  return (
    <div className="flex flex-grow flex-col space-y-3 overflow-y-auto">
      <div className="flex h-full items-center justify-center rounded-md py-32">
        <p className="text-center text-sm font-medium text-zinc-500">아직 상담 내역이 없습니다.</p>
      </div>
    </div>
  );
};

// 최근 상담 내역 컴포넌트
const RecentConsultations = () => {
  const { status } = useSession();
  const router = useRouter();

  // React Query를 사용하여 최근 상담 내역 가져오기
  const { data, isLoading, error } = useQuery({
    queryKey: ['recentConsultations'],
    queryFn: async () => {
      const result = await getRecentConsultations(5);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.conversations;
    },
    enabled: status === 'authenticated', // 로그인된 경우에만 쿼리 실행
  });

  // 로그인되지 않은 경우 로그인이 필요한 컴포넌트 표시
  if (status === 'unauthenticated') {
    return <LoginRequired />;
  }

  // 로딩 중이거나 인증 확인 중인 경우
  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-grow flex-col space-y-3 overflow-y-auto p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse rounded-md bg-[#121212] p-4">
            <div className="mb-2 h-4 w-3/4 rounded bg-zinc-800"></div>
            <div className="h-3 w-1/2 rounded bg-zinc-800"></div>
          </div>
        ))}
      </div>
    );
  }

  // 에러가 발생한 경우 에러 메시지 표시
  if (error) {
    return (
      <div className="rounded-md border border-red-800 bg-zinc-900 p-4">
        <p className="text-sm text-red-400">
          {error instanceof Error ? error.message : '상담 내역을 불러오는 중 오류가 발생했습니다.'}
        </p>
      </div>
    );
  }

  // 상담 내역이 없는 경우
  if (!data || data.length === 0) {
    return <EmptyConsultations />;
  }

  // 상담 내역 목록 표시
  return (
    <div className="flex flex-grow flex-col space-y-3 overflow-y-auto p-4">
      {data.map(conversation => (
        <div
          key={conversation.id}
          onClick={() => router.push(`/ai/${conversation.id}`)}
          className={cn(
            'rounded-md bg-[#121212] p-4',
            'cursor-pointer hover:bg-zinc-900',
            'transition-colors duration-200'
          )}
        >
          <h3 className="mb-1 line-clamp-1 font-medium text-white">{conversation.title}</h3>
          {conversation.messages[0] && (
            <p className="mb-2 line-clamp-1 text-sm text-zinc-400">
              {conversation.messages[0].content}
            </p>
          )}
          <div className="flex items-center text-xs text-zinc-500">
            <FaRegClock className="mr-1" />
            <span>
              {new Date(conversation.updatedAt).toLocaleDateString('ko-KR', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecentConsultations;
