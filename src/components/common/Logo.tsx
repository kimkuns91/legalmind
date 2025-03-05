'use client';

import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface ILogoProps {
  href?: string;
  className?: string;
  width?: number;
  height?: number;
  fullWidth?: boolean;
  light?: boolean;
}

export default function Logo({
  href = '/',
  className,
  width = 40,
  height = 40,
  fullWidth = false,
  light = false,
}: ILogoProps) {
  const logoContent = (
    <div className={cn('flex items-center', fullWidth && 'w-full justify-center', className)}>
      <Image
        src={light ? '/images/full-logo-light.png' : '/images/full-logo.png'}
        alt="LegalMind 로고"
        width={width}
        height={height}
        className="object-contain"
        priority
      />
    </div>
  );

  if (href) {
    return (
      <Link href={href} className={fullWidth ? 'block w-full' : ''}>
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
