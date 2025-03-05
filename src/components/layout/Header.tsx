"use client";

import { LuMenu, LuSearch, LuX } from "react-icons/lu";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { cn } from "@/lib/utils";
import { navItems } from "@/constants";
import { usePathname } from "next/navigation";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  // 스크롤 이벤트 감지하여 헤더 스타일 변경
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // 모바일 메뉴 토글
  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300 bg-white",
        isScrolled ? "shadow-sm border-gray-100" : ""
      )}
    >
      <div className="container mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* 로고 */}
          <div className="flex-shrink-0">
            <Logo href="/" width={150} height={36} className="py-1" />
          </div>

          {/* 데스크탑 네비게이션 */}
          <nav className="hidden md:flex space-x-1 lg:space-x-4">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "px-3 py-2 text-sm font-medium transition-colors hover:text-[#F58733]",
                  pathname === item.href ? "text-[#F58733]" : "text-gray-700"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* 검색창 및 로그인/회원가입 버튼 */}
          <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
            <div className="relative">
              <LuSearch className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
              <Input
                type="search"
                placeholder="검색어를 입력해주세요"
                className="w-[180px] lg:w-[300px] pl-8 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-[#F58733]"
              />
            </div>
            <Button
              variant="outline"
              size="sm"
              className="text-sm font-medium border-gray-200 hover:bg-gray-50 hover:text-[#F58733]"
            >
              로그인
            </Button>
            <Button
              size="sm"
              className="text-sm font-medium bg-[#F58733] text-white hover:bg-[#E07722]"
            >
              회원가입
            </Button>
          </div>

          {/* 모바일 메뉴 버튼 */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#F58733] hover:bg-gray-50 focus:outline-none"
            >
              {isMobileMenuOpen ? (
                <LuX className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <LuMenu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 모바일 메뉴 */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navItems.map((item, index) => (
              <Link
                key={index}
                href={item.href}
                className={cn(
                  "block px-3 py-2 rounded-md text-base font-medium",
                  pathname === item.href
                    ? "text-[#F58733] bg-[#F58733]/10"
                    : "text-gray-700 hover:bg-gray-50 hover:text-[#F58733]"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <div className="pt-4 pb-3 border-t border-gray-200">
              <div className="relative mt-3 px-3">
                <LuSearch className="absolute left-5 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  type="search"
                  placeholder="검색어를 입력해주세요"
                  className="w-full pl-8 rounded-full bg-gray-50 border-gray-200 focus-visible:ring-[#F58733]"
                />
              </div>
              <div className="mt-4 flex space-x-3 px-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-sm font-medium border-gray-200 hover:bg-gray-50 hover:text-[#F58733]"
                >
                  로그인
                </Button>
                <Button
                  size="sm"
                  className="flex-1 text-sm font-medium bg-[#F58733] text-white hover:bg-[#E07722]"
                >
                  회원가입
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
