"use client";

import { FaRegClock } from "react-icons/fa";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { getRecentConsultations } from "@/actions/consultations";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

// 로그인이 필요한 경우 표시할 컴포넌트
const LoginRequired = () => {
  return (
    <div className="flex flex-col space-y-3 flex-grow overflow-y-auto">
      <Link
        href="/login"
        className="bg-[#121212] rounded-md flex items-center justify-center py-32 h-full hover:bg-zinc-900/50 transition-colors duration-200"
      >
        <p className="text-zinc-300 text-sm font-medium text-center">
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
    <div className="flex flex-col space-y-3 flex-grow overflow-y-auto">
      <div className="rounded-md flex items-center justify-center py-32 h-full">
        <p className="text-zinc-500 text-sm font-medium text-center">
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

  // React Query를 사용하여 최근 상담 내역 가져오기
  const { data, isLoading, error } = useQuery({
    queryKey: ["recentConsultations"],
    queryFn: async () => {
      const result = await getRecentConsultations(5);
      if (result.error) {
        throw new Error(result.error);
      }
      return result.conversations;
    },
    enabled: status === "authenticated", // 로그인된 경우에만 쿼리 실행
  });

  // 로그인되지 않은 경우 로그인이 필요한 컴포넌트 표시
  if (status === "unauthenticated") {
    return <LoginRequired />;
  }

  // 로딩 중이거나 인증 확인 중인 경우
  if (isLoading || status === "loading") {
    return (
      <div className="flex flex-col space-y-3 flex-grow overflow-y-auto p-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="bg-[#121212] rounded-md p-4 animate-pulse">
            <div className="h-4 w-3/4 bg-zinc-800 rounded mb-2"></div>
            <div className="h-3 w-1/2 bg-zinc-800 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  // 에러가 발생한 경우 에러 메시지 표시
  if (error) {
    return (
      <div className="bg-zinc-900 p-4 rounded-md border border-red-800">
        <p className="text-red-400 text-sm">
          {error instanceof Error
            ? error.message
            : "상담 내역을 불러오는 중 오류가 발생했습니다."}
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
    <div className="flex flex-col space-y-3 flex-grow overflow-y-auto p-4">
      {data.map((conversation) => (
        <div
          key={conversation.id}
          onClick={() => router.push(`/chat/${conversation.id}`)}
          className={cn(
            "bg-[#121212] p-4 rounded-md",
            "hover:bg-zinc-900 cursor-pointer",
            "transition-colors duration-200"
          )}
        >
          <h3 className="font-medium text-white mb-1 line-clamp-1">
            {conversation.title}
          </h3>
          {conversation.messages[0] && (
            <p className="text-sm text-zinc-400 line-clamp-1 mb-2">
              {conversation.messages[0].content}
            </p>
          )}
          <div className="flex items-center text-xs text-zinc-500">
            <FaRegClock className="mr-1" />
            <span>
              {new Date(conversation.updatedAt).toLocaleDateString("ko-KR", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      ))}

      <Link
        href="/chat"
        className={cn(
          "px-6 py-3 rounded-full text-sm font-medium text-center mt-2",
          "bg-green-500 text-black hover:bg-green-400",
          "transition-colors duration-200"
        )}
      >
        새 상담 시작하기
      </Link>
    </div>
  );
};

export default RecentConsultations;
