'use client';

import { useEffect, useState } from 'react';

import MobileNav from '@/components/MobileNav';
import SideBar from '@/components/ai/SideBar';
import SideBarButton from '@/components/SidebarButton';
import { cn } from '@/lib/utils';

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const [isSidebarVisible, setIsSidebarVisible] = useState(true);
  const [mounted, setMounted] = useState(false);

  const toggleSidebar = () => {
    setIsSidebarVisible(!isSidebarVisible);
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className={cn('bg-background max-h-screen min-h-screen w-full', 'flex md:flex-col')}>
      {/* desktop sidebar */}
      <SideBar isSidebarVisible={isSidebarVisible} />
      <div
        className={cn(
          'relative flex-1',
          'bg-secondary',
          'transition-all duration-300 ease-in-out',
          isSidebarVisible ? 'ml-0 md:ml-64' : 'ml-0',
          'border-border border-l'
        )}
      >
        <SideBarButton isSidebarVisible={isSidebarVisible} toggleSidebar={toggleSidebar} />
        {/* mobile nav */}
        <div className="md:hidden">
          <MobileNav />
        </div>
        {children}
      </div>
    </div>
  );
}
