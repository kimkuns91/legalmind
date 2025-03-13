import { getRecentConsultations } from '@/actions/consultations';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useSession } from 'next-auth/react';

export const useRecentConsultations = (limit: number = 5) => {
  const { status } = useSession();

  return useInfiniteQuery({
    queryKey: ['recentConsultations', limit] as const,
    initialPageParam: 1,
    queryFn: async ({ pageParam }) => {
      const result = await getRecentConsultations(limit, ((pageParam as number) - 1) * limit);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.conversations;
    },
    getNextPageParam: (lastPage, allPages) => {
      // 마지막 페이지의 데이터가 limit보다 작으면 더 이상 데이터가 없음
      return lastPage.length === limit ? allPages.length + 1 : undefined;
    },
    enabled: status === 'authenticated', // 로그인된 경우에만 쿼리 실행
  });
};
