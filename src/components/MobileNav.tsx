'use client';

import { IoMenu } from 'react-icons/io5';
import Link from 'next/link';
import Logo from '@/components/common/Logo';
import { useState } from 'react';

export default function MobileNav() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <div className="border-border flex items-center justify-between border-b p-4">
      <Logo href="/dashboard" />
      <button
        className="hover:bg-accent rounded-lg p-2"
        aria-label="메뉴 열기"
        onClick={toggleMenu}
      >
        <IoMenu className="h-6 w-6" />
      </button>

      {isMenuOpen && (
        <div className="bg-background/80 fixed inset-0 z-50 backdrop-blur-sm">
          <div className="bg-background fixed top-0 left-0 h-full w-[250px] p-6 shadow-lg">
            <div className="mb-6 flex items-center justify-between">
              <Logo href="/dashboard" />
              <button onClick={toggleMenu} className="hover:bg-accent rounded-full p-2">
                ✕
              </button>
            </div>
            <nav className="flex flex-col space-y-3">
              <Link
                href="/dashboard"
                className="hover:bg-accent rounded-lg p-2"
                onClick={toggleMenu}
              >
                대시보드
              </Link>
              <Link href="/ai" className="hover:bg-accent rounded-lg p-2" onClick={toggleMenu}>
                AI 상담
              </Link>
              <Link href="/history" className="hover:bg-accent rounded-lg p-2" onClick={toggleMenu}>
                상담 내역
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
