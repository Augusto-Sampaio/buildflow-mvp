import React from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: number;
  variant?: 'light' | 'dark';
}

export function Logo({ className = '', size = 32 }: LogoProps) {
  return (
    <div className={cn("relative", className)} style={!className.includes('h-') ? { width: size * 4, height: size } : {}}>
      <Image
        src="https://i.imgur.com/RcGMnHJ.png"
        alt="BuildFlow Logo"
        fill
        className="object-contain object-left"
        priority
      />
    </div>
  );
}
