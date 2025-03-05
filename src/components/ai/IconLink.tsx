import Link from "next/link";
import { MdChevronRight } from "react-icons/md";
import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface IconLinkProps {
  href: string;
  icon: ReactNode;
  text: string;
}

const IconLink: React.FC<IconLinkProps> = ({ href, icon, text }) => {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center justify-between",
        "rounded",
        "py-3 px-4",
        "hover:bg-zinc-800",
        "cursor-pointer",
        "transition-colors duration-200"
      )}
    >
      <div className={cn("flex items-center")}>
        <span className="text-foreground">{icon}</span>
        <p className="text-base text-foreground ml-3">{text}</p>
      </div>
      <MdChevronRight className="text-zinc-500" />
    </Link>
  );
};

export default IconLink;
