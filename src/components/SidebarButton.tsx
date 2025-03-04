"use client";

import { IoArrowBackOutline, IoArrowForwardOutline } from "react-icons/io5";

import { cn } from "@/lib/utils";

interface ISideBarButtonProps {
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

export default function SideBarButton({
  isSidebarVisible,
  toggleSidebar,
}: ISideBarButtonProps) {
  return (
    <button
      onClick={toggleSidebar}
      className={cn(
        "absolute top-4 left-4 z-50",
        "md:flex hidden items-center justify-center",
        "w-8 h-8 rounded-full",
        "bg-primary text-primary-foreground",
        "hover:bg-primary/90 transition-colors"
      )}
      aria-label={isSidebarVisible ? "사이드바 닫기" : "사이드바 열기"}
    >
      {isSidebarVisible ? (
        <IoArrowBackOutline className="w-4 h-4" />
      ) : (
        <IoArrowForwardOutline className="w-4 h-4" />
      )}
    </button>
  );
} 