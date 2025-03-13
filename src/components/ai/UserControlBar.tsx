'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { FaCog, FaMoon, FaSun, FaUser } from 'react-icons/fa';
import { signOut, useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

import { IoLogOutOutline } from 'react-icons/io5';
import Link from 'next/link';
import { Switch } from '@/components/ui/switch';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';

export default function UserControlBar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  // 클라이언트 사이드에서만 테마 관련 기능 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const handleLogout = async () => {
    await signOut();
  };

  // 로그인 상태가 아닌 경우 로그인 버튼 표시
  if (status === 'unauthenticated') {
    return (
      <div className="border-border mt-auto border-t p-4">
        <Link
          href={`/login?callbackUrl=${encodeURIComponent('/ai')}`}
          className="bg-primary text-primary-foreground hover:bg-primary/90 flex w-full items-center justify-center gap-2 rounded-lg p-3 transition-colors"
        >
          <FaUser className="text-sm" />
          <span className="font-medium">로그인</span>
        </Link>
      </div>
    );
  }
  // 로딩 중인 경우 스켈레톤 UI 표시
  if (status === 'loading' || !mounted) {
    return (
      <div className="border-border mt-auto border-t p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-muted h-8 w-8 animate-pulse rounded-full"></div>
            <div className="space-y-2">
              <div className="bg-muted h-4 w-20 animate-pulse rounded"></div>
              <div className="bg-muted h-3 w-16 animate-pulse rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 상태인 경우 사용자 정보와 컨트롤 메뉴 표시
  return (
    <div className="border-border mt-auto border-t p-4">
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex cursor-pointer items-center gap-2 outline-none">
            <div className="bg-primary text-primary-foreground flex h-8 w-8 items-center justify-center rounded-full">
              {session?.user?.name?.[0] || 'U'}
            </div>
            <div className="text-sm">
              <p className="text-foreground font-medium">{session?.user?.name || '사용자'}</p>
              <p className="text-muted-foreground max-w-[120px] truncate text-xs">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="bg-background w-56 cursor-pointer">
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2"
              onClick={() => router.push('/mypage')}
            >
              <FaUser className="text-sm" />
              <span>프로필</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              className="flex cursor-pointer items-center gap-2"
              onClick={() => router.push('/settings')}
            >
              <FaCog className="text-sm" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="flex items-center justify-between" onClick={toggleTheme}>
                <div className="flex items-center gap-2">
                  {theme === 'dark' ? (
                    <FaMoon className="text-sm" />
                  ) : (
                    <FaSun className="text-primary text-sm" />
                  )}
                  <span className="text-sm">다크 모드</span>
                </div>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-primary cursor-pointer"
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive-foreground flex cursor-pointer items-center gap-2"
              onClick={handleLogout}
            >
              <IoLogOutOutline className="text-sm" />
              <span>로그아웃</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
