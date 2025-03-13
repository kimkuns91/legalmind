'use client';

import { FaRegClock } from 'react-icons/fa';
import { IConversation } from '@/interface';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import { useRecentConsultations } from '@/hooks/useRecentConsultations';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// 로그인이 필요한 경우 표시할 컴포넌트
const LoginRequired = () => {
  return (
    <div className="flex flex-grow flex-col space-y-3 overflow-y-auto">
      <Link
        href="/login"
        className="bg-card hover:bg-muted flex h-full items-center justify-center rounded-md py-32 transition-colors duration-200"
      >
        <p className="text-muted-foreground text-center text-sm font-medium">
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
        <p className="text-muted-foreground text-center text-sm font-medium">
          아직 상담 내역이 없습니다.
        </p>
      </div>
    </div>
  );
};

// 최근 상담 내역 컴포넌트
const RecentConsultations = () => {
  const { status } = useSession();
  const router = useRouter();
  const { data, isLoading, error, fetchNextPage, hasNextPage, isFetchingNextPage } =
    useRecentConsultations();

  // Intersection Observer 설정
  const { ref, inView } = useInView({
    threshold: 0,
  });

  // 스크롤이 하단에 도달하면 다음 페이지 로드
  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // 로그인되지 않은 경우 로그인이 필요한 컴포넌트 표시
  if (status === 'unauthenticated') {
    return <LoginRequired />;
  }

  // 로딩 중이거나 인증 확인 중인 경우
  if (isLoading || status === 'loading') {
    return (
      <div className="flex flex-grow flex-col space-y-3 overflow-y-auto p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="bg-card animate-pulse rounded-md p-4">
            <div className="bg-muted mb-2 h-4 w-3/4 rounded"></div>
            <div className="bg-muted h-3 w-1/2 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // 에러가 발생한 경우 에러 메시지 표시
  if (error) {
    return (
      <div className="border-destructive bg-card rounded-md border p-4">
        <p className="text-destructive text-sm">
          {error instanceof Error ? error.message : '상담 내역을 불러오는 중 오류가 발생했습니다.'}
        </p>
      </div>
    );
  }

  // 상담 내역이 없는 경우
  if (!data?.pages[0] || data.pages[0].length === 0) {
    return <EmptyConsultations />;
  }

  // 상담 내역 목록 표시
  return (
    <div className="scrollbar flex flex-grow flex-col space-y-3 overflow-y-auto p-4">
      {data.pages.map((page: IConversation[]) =>
        page.map((conversation: IConversation) => (
          <div
            key={conversation.id}
            onClick={() => router.push(`/ai/${conversation.id}`)}
            className={cn(
              'bg-card rounded-md p-4',
              'hover:bg-muted cursor-pointer',
              'transition-colors duration-200'
            )}
          >
            <h3 className="text-foreground mb-1 line-clamp-1 font-medium">{conversation.title}</h3>
            <div className="text-muted-foreground flex items-center text-xs">
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
        ))
      )}

      {/* 무한 스크롤 트리거 */}
      <div ref={ref} className="h-10">
        {isFetchingNextPage && (
          <div className="flex items-center justify-center py-4">
            <div className="border-muted border-t-primary h-6 w-6 animate-spin rounded-full border-2"></div>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentConsultations;
