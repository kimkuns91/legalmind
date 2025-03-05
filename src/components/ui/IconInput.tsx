'use client';

import { ReactNode, forwardRef } from 'react';

import { cn } from '@/lib/utils';

interface IconInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: ReactNode;
}

const IconInput = forwardRef<HTMLInputElement, IconInputProps>(
  ({ className, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && <div className="absolute top-1/2 left-3 -translate-y-1/2">{icon}</div>}
        <input
          className={cn(
            'border-input bg-background ring-offset-background placeholder:text-muted-foreground focus-visible:ring-ring flex h-10 w-full rounded-md border px-3 py-2 text-sm file:border-0 file:bg-transparent file:text-sm file:font-medium focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
            icon && 'pl-10',
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    );
  }
);

IconInput.displayName = 'IconInput';

export default IconInput;
