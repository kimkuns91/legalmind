"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { FaCog, FaMoon, FaSun, FaUser } from "react-icons/fa";
import { signOut, useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { IoLogOutOutline } from "react-icons/io5";
import Link from "next/link";
import { Switch } from "@/components/ui/switch";
import { useTheme } from "next-themes";

export default function UserControlBar() {
  const { data: session, status } = useSession();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // 클라이언트 사이드에서만 테마 관련 기능 사용
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/" });
  };

  // 로그인 상태가 아닌 경우 로그인 버튼 표시
  if (status === "unauthenticated") {
    return (
      <div className="mt-auto p-4 border-t border-border">
        <Link
          href="/login"
          className="flex items-center justify-center gap-2 w-full p-3 bg-green-500 text-black rounded-lg hover:bg-green-400 transition-colors"
        >
          <FaUser className="text-sm" />
          <span className="font-medium">로그인</span>
        </Link>
      </div>
    );
  }

  // 로딩 중인 경우 스켈레톤 UI 표시
  if (status === "loading" || !mounted) {
    return (
      <div className="mt-auto p-4 border-t border-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-muted animate-pulse"></div>
            <div className="space-y-2">
              <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
              <div className="h-3 w-16 bg-muted rounded animate-pulse"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // 로그인 상태인 경우 사용자 정보와 컨트롤 메뉴 표시
  return (
    <div className="mt-auto p-4 border-t border-border">
      <div className="flex items-center justify-between">
        <DropdownMenu>
          <DropdownMenuTrigger className="flex items-center gap-2 outline-none cursor-pointer">
            <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-black">
              {session?.user?.name?.[0] || "U"}
            </div>
            <div className="text-sm">
              <p className="font-medium text-foreground">{session?.user?.name || "사용자"}</p>
              <p className="text-xs text-muted-foreground truncate max-w-[120px]">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-56 cursor-pointer">
            <DropdownMenuItem className="flex items-center gap-2">
              <FaUser className="text-sm" />
              <span>프로필</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <FaCog className="text-sm" />
              <span>설정</span>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <div className="p-2">
              <div className="flex items-center justify-between" onClick={toggleTheme}>
                <div className="flex items-center gap-2">
                  {theme === "dark" ? (
                    <FaMoon className="text-sm" />
                  ) : (
                    <FaSun className="text-sm text-orange-500" />
                  )}
                  <span className="text-sm">다크 모드</span>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                  className="data-[state=checked]:bg-green-500 cursor-pointer"
                />
              </div>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              className="flex items-center gap-2 text-red-500 dark:text-red-400"
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