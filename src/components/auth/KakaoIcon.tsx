import React from 'react';

interface KakaoIconProps {
  className?: string;
}

const KakaoIcon: React.FC<KakaoIconProps> = ({ className }) => {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" className={className}>
      <path
        fill="currentColor"
        d="M12 3C7.03 3 3 6.14 3 10C3 12.08 4.18 13.88 6.04 15.12L5.5 18.68C5.46 18.88 5.54 19.08 5.7 19.2C5.8 19.28 5.92 19.32 6.04 19.32C6.14 19.32 6.24 19.3 6.32 19.24L10.3 16.66C10.86 16.74 11.42 16.78 12 16.78C16.97 16.78 21 13.64 21 9.78C21 5.92 16.97 3 12 3Z"
      />
    </svg>
  );
};

export default KakaoIcon;
