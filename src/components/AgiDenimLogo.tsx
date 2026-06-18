import React from 'react';

interface AgiDenimLogoProps {
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  theme?: 'light' | 'dark';
  hideText?: boolean;
}

export const AgiDenimLogo: React.FC<AgiDenimLogoProps> = ({
  className = '',
  size = 'md',
  theme = 'light',
  hideText = false,
}) => {
  // Size classes for the icon mark
  const iconSizes = {
    xs: { width: 'w-8', height: 'h-6' },
    sm: { width: 'w-12', height: 'h-10' },
    md: { width: 'w-20', height: 'h-16' },
    lg: { width: 'w-28', height: 'h-24' },
    xl: { width: 'w-40', height: 'h-32' },
  };

  const selectedSize = iconSizes[size];

  // Colors based on theme
  const brandTextColor = theme === 'dark' ? 'text-white' : 'text-slate-900';
  const subTextColor = theme === 'dark' ? 'text-slate-350' : 'text-slate-500';

  return (
    <div className={`flex flex-col items-center justify-center select-none ${className}`} id="agi-denim-logo-brand">
      {/* BRAND MARK SVG */}
      <div className={`${selectedSize.width} ${selectedSize.height}`}>
        <svg
          viewBox="0 0 100 80"
          className="w-full h-full"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Rounded diagonal parallel lines/pills */}
          {/* Bar 1 (leftmost, tallest) - goes from lower-left to upper-right */}
          <line
            x1="30"
            y1="55"
            x2="52"
            y2="11"
            stroke="url(#blueGradient1)"
            strokeWidth="7"
            strokeLinecap="round"
          />
          {/* Bar 2 */}
          <line
            x1="41.5"
            y1="55"
            x2="59.5"
            y2="21"
            stroke="url(#blueGradient2)"
            strokeWidth="6.2"
            strokeLinecap="round"
          />
          {/* Bar 3 */}
          <line
            x1="53"
            y1="55"
            x2="67"
            y2="30"
            stroke="url(#skyGradient)"
            strokeWidth="5.4"
            strokeLinecap="round"
          />
          {/* Bar 4 */}
          <line
            x1="64.5"
            y1="55"
            x2="74.5"
            y2="38"
            stroke="url(#lightSkyGradient)"
            strokeWidth="4.6"
            strokeLinecap="round"
          />
          {/* Bar 5 (Dot on right) */}
          <circle cx="76" cy="55" r="3" fill="#67e8f9" />

          <defs>
            <linearGradient id="blueGradient1" x1="30" y1="55" x2="52" y2="11" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0284c7" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
            <linearGradient id="blueGradient2" x1="41.5" y1="55" x2="59.5" y2="21" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#0ba5e9" />
              <stop offset="100%" stopColor="#67e8f9" />
            </linearGradient>
            <linearGradient id="skyGradient" x1="53" y1="55" x2="67" y2="30" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#38bdf8" />
              <stop offset="100%" stopColor="#a5f3fc" />
            </linearGradient>
            <linearGradient id="lightSkyGradient" x1="64.5" y1="55" x2="74.5" y2="38" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#bae6fd" />
              <stop offset="100%" stopColor="#38bdf8" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* TYPOGRAPHY TEXT */}
      {!hideText && (
        <div className="text-center mt-1">
          <h2
            className={`font-sans font-black tracking-[0.08em] leading-none uppercase ${brandTextColor} ${
              size === 'xs' ? 'text-[9px]' : size === 'sm' ? 'text-[11px]' : size === 'md' ? 'text-[15px]' : size === 'lg' ? 'text-[22px]' : 'text-[32px]'
            }`}
          >
            AGI DENIM
          </h2>
          <p
            className={`font-sans tracking-[0.34em] font-medium leading-none uppercase select-none ${subTextColor} ${
              size === 'xs' ? 'text-[5px] mt-[1px]' : size === 'sm' ? 'text-[6px] mt-[1px]' : size === 'md' ? 'text-[9px] mt-1' : size === 'lg' ? 'text-[12px] mt-1' : 'text-[16px] mt-1.5'
            }`}
          >
            ARTISTIC
          </p>
        </div>
      )}
    </div>
  );
};
