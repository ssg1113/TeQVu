'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export interface LogoProps {
  variant?: 'icon' | 'horizontal' | 'full';
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showTagline?: boolean;
  className?: string;
  linkToHome?: boolean;
  priority?: boolean;
}

const sizeConfig = {
  xs: {
    iconSize: 26,
    textClass: 'text-sm font-black',
    taglineClass: 'text-[8px]',
    fullSize: 80,
  },
  sm: {
    iconSize: 34,
    textClass: 'text-base font-black',
    taglineClass: 'text-[9px]',
    fullSize: 110,
  },
  md: {
    iconSize: 42,
    textClass: 'text-xl font-black',
    taglineClass: 'text-[10px]',
    fullSize: 150,
  },
  lg: {
    iconSize: 52,
    textClass: 'text-2xl font-black',
    taglineClass: 'text-xs',
    fullSize: 200,
  },
  xl: {
    iconSize: 68,
    textClass: 'text-3xl font-black',
    taglineClass: 'text-sm',
    fullSize: 260,
  },
};

export function Logo({
  variant = 'horizontal',
  size = 'md',
  showTagline = true,
  className = '',
  linkToHome = false,
  priority = false,
}: LogoProps) {
  const conf = sizeConfig[size];

  const content = (() => {
    if (variant === 'icon') {
      return (
        <div
          className={`relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform ${className}`}
          style={{ width: conf.iconSize, height: conf.iconSize }}
        >
          <Image
            src="/logo-emblem.png"
            alt="TeQVu Icon"
            width={conf.iconSize}
            height={conf.iconSize}
            priority={priority}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
      );
    }

    if (variant === 'full') {
      return (
        <div className={`flex flex-col items-center text-center group ${className}`}>
          <div className="relative" style={{ width: conf.fullSize, height: conf.fullSize }}>
            {/* Light mode full logo */}
            <Image
              src="/logo.png"
              alt="TeQVu"
              width={conf.fullSize}
              height={conf.fullSize}
              priority={priority}
              className="w-full h-full object-contain dark:hidden group-hover:scale-105 transition-transform drop-shadow-md"
            />
            {/* Dark mode full logo (with luminous white text) */}
            <Image
              src="/logo-white.png"
              alt="TeQVu"
              width={conf.fullSize}
              height={conf.fullSize}
              priority={priority}
              className="w-full h-full object-contain hidden dark:block group-hover:scale-105 transition-transform drop-shadow-md"
            />
          </div>
        </div>
      );
    }

    // Default: 'horizontal'
    return (
      <div className={`flex items-center gap-2.5 group ${className}`}>
        <div
          className="relative flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform"
          style={{ width: conf.iconSize, height: conf.iconSize }}
        >
          <Image
            src="/logo-emblem.png"
            alt="TeQVu Logo"
            width={conf.iconSize}
            height={conf.iconSize}
            priority={priority}
            className="w-full h-full object-contain drop-shadow-md"
          />
        </div>
        <div className="flex flex-col">
          <span
            className={`tracking-tight leading-none ${conf.textClass} text-slate-900 dark:text-white flex items-center`}
          >
            <span>Te</span>
            <span className="bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">
              Q
            </span>
            <span>Vu</span>
          </span>
          {showTagline && (
            <span
              className={`hidden sm:inline font-mono tracking-wider uppercase text-slate-500 dark:text-slate-400 mt-0.5 leading-none ${conf.taglineClass}`}
            >
              What&apos;s Next in Tech
            </span>
          )}
        </div>
      </div>
    );
  })();

  if (linkToHome) {
    return (
      <Link href="/" className="inline-flex items-center focus:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 rounded-lg">
        {content}
      </Link>
    );
  }

  return content;
}
