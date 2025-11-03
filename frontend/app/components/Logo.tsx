'use client';

import React from 'react';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'color' | 'white';
}

export default function Logo({ size = 'md', variant = 'color' }: LogoProps) {
  const sizes = {
    sm: 32,
    md: 48,
    lg: 64,
  };

  const dimension = sizes[size];

  // Brand Colors
  const coralRed = variant === 'white' ? '#FFFFFF' : '#FF4444';
  const royalBlue = variant === 'white' ? '#FFFFFF' : '#2563EB';
  const navyBlue = variant === 'white' ? '#FFFFFF' : '#0A1E3D';

  return (
    <svg
      width={dimension}
      height={dimension}
      viewBox="0 0 100 100"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top Left - Coral Red outline with inner circle */}
      <g>
        <circle
          cx="30"
          cy="30"
          r="18"
          stroke={coralRed}
          strokeWidth="3"
          fill="none"
        />
        <circle cx="30" cy="30" r="8" fill={coralRed} />
      </g>

      {/* Top Right - Royal Blue filled with white center */}
      <g>
        <circle cx="70" cy="30" r="18" fill={royalBlue} />
        <circle
          cx="70"
          cy="30"
          r="8"
          fill={variant === 'white' ? navyBlue : '#FFFFFF'}
        />
      </g>

      {/* Bottom Left - Navy Blue outline with inner circle */}
      <g>
        <circle
          cx="30"
          cy="70"
          r="18"
          stroke={navyBlue}
          strokeWidth="3"
          fill="none"
        />
        <circle cx="30" cy="70" r="8" fill={navyBlue} />
      </g>

      {/* Bottom Right - Coral Red filled with white center */}
      <g>
        <circle cx="70" cy="70" r="18" fill={coralRed} />
        <circle
          cx="70"
          cy="70"
          r="8"
          fill={variant === 'white' ? navyBlue : '#FFFFFF'}
        />
      </g>
    </svg>
  );
}
