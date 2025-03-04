"use client";

import { IoMenu } from "react-icons/io5";
import Link from "next/link";
import Logo from "@/components/common/Logo";
import { useState } from "react";

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-border">
      <Logo href="/dashboard" />
      <button
        className="p-2 rounded-lg hover:bg-accent"
        aria-label="메뉴 열기"
        onClick={toggleMenu}
      >
        <IoMenu className="w-6 h-6" />
      </button>

      {isMenuOpen && (
        <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
          <div className="fixed left-0 top-0 h-full w-[250px] bg-background p-6 shadow-lg">
            <div className="flex justify-between items-center mb-6">
              <Logo href="/dashboard" />
              <button 
                onClick={toggleMenu}
                className="p-2 rounded-full hover:bg-accent"
              >
                ✕
              </button>
            </div>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="p-2 rounded-lg hover:bg-accent"
                onClick={toggleMenu}
              >
                대시보드
              </Link>
              <Link
                href="/ai"
                className="p-2 rounded-lg hover:bg-accent"
                onClick={toggleMenu}
              >
                AI 상담
              </Link>
              <Link
                href="/history"
                className="p-2 rounded-lg hover:bg-accent"
                onClick={toggleMenu}
              >
                상담 내역
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
