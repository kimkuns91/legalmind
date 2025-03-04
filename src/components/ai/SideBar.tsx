"use client";

import IconLink from "./IconLink";
import Logo from "@/components/common/Logo";
import { MdHome } from "react-icons/md";
import RecentConsultations from "./RecentConsultations";
import UserControlBar from "./UserControlBar";
import { cn } from "@/lib/utils";

interface ISideBarProps {
  isSidebarVisible: boolean;
}

export default function SideBar({ isSidebarVisible }: ISideBarProps) {
  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen",
        "transition-transform duration-300 ease-in-out",
        "bg-background border-r border-border",
        "md:w-64 w-full",
        isSidebarVisible
          ? "translate-x-0"
          : "-translate-x-full md:-translate-x-64"
      )}
    >
      <div className={cn("px-2 py-6", "border-b border-border")}>
        {/* 로고 */}
        <div className="pl-4 mb-6 w-2/3">
          <Logo href="/ai" fullWidth width={150} height={60} className="mb-4" />
        </div>
        <IconLink
          href="/ai"
          icon={<MdHome className="text-lg" />}
          text="채팅 홈"
        />
      </div>
      <div className="py-4 px-6">
        <p className="text-primary text-sm font-semibold">대화 내역</p>
      </div>
      {/* 대화내역 */}
      <RecentConsultations />

      {/* 하단 로그인 바 */}
      <UserControlBar />
    </aside>
  );
}
