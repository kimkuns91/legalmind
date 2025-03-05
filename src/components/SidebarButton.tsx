import { IoArrowBackOutline, IoArrowForwardOutline } from 'react-icons/io5';

import { TbMinusVertical } from 'react-icons/tb';
import { cn } from '@/lib/utils';

interface SideBarButtonProps {
  isSidebarVisible: boolean;
  toggleSidebar: () => void;
}

const SideBarButton: React.FC<SideBarButtonProps> = ({ isSidebarVisible, toggleSidebar }) => {
  return (
    <button
      className={cn(
        'hidden md:flex',
        'group text-foreground absolute top-1/2 left-2 -translate-y-1/2 transform cursor-pointer items-center'
      )}
      onClick={toggleSidebar}
    >
      <TbMinusVertical className="text-2xl" />
      {isSidebarVisible ? (
        <IoArrowBackOutline className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      ) : (
        <IoArrowForwardOutline className="opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      )}
    </button>
  );
};

export default SideBarButton;
