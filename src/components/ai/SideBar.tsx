'use client';

import IconLink from './IconLink';
import Logo from '@/components/common/Logo';
import { MdHome } from 'react-icons/md';
import RecentConsultations from './RecentConsultations';
import UserControlBar from './UserControlBar';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface ISideBarProps {
  isSidebarVisible: boolean;
}

export default function SideBar({ isSidebarVisible }: ISideBarProps) {
  const theme = useTheme();
  return (
    <aside
      className={cn(
        'fixed top-0 left-0 z-40 h-screen',
        'transition-transform duration-300 ease-in-out',
        'bg-background border-border border-r',
        'flex w-full flex-col md:w-64',
        isSidebarVisible ? 'translate-x-0' : '-translate-x-full md:-translate-x-64'
      )}
    >
      <div className={cn('px-2 py-6', 'border-border border-b')}>
        {/* 로고 */}
        <div className="mb-6 w-2/3 pl-4">
          <Logo
            href="/ai"
            fullWidth
            width={140}
            height={60}
            className="mb-4"
            light={theme.theme === 'dark'}
          />
        </div>
        <IconLink href="/ai" icon={<MdHome className="text-lg" />} text="채팅 홈" />
      </div>
      <div className="px-6 py-4">
        <p className="text-primary text-sm font-semibold">대화 내역</p>
      </div>

      {/* 대화내역 - flex-grow를 통해 가용 공간 채우기 */}
      <div className="flex flex-grow overflow-hidden">
        <RecentConsultations />
      </div>

      {/* 하단 로그인 바 */}
      <UserControlBar />
    </aside>
  );
}
