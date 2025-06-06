import React from "react";

interface LanternLogoProps {
  size?: number;
  className?: string;
}

export function LanternLogo({ size = 32, className = "" }: LanternLogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Lantern Top Cap */}
      <rect
        x="12"
        y="4"
        width="8"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* Hanging String */}
      <line
        x1="16"
        y1="2"
        x2="16"
        y2="4"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
      
      {/* Main Lantern Body */}
      <path
        d="M10 8 C10 7 11 6 12 6 L20 6 C21 6 22 7 22 8 L22 22 C22 24 20 26 18 26 L14 26 C12 26 10 24 10 22 Z"
        fill="currentColor"
        opacity="0.9"
      />
      
      {/* Lantern Ribs/Lines */}
      <line
        x1="10"
        y1="10"
        x2="22"
        y2="10"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="10"
        y1="14"
        x2="22"
        y2="14"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="10"
        y1="18"
        x2="22"
        y2="18"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      <line
        x1="10"
        y1="22"
        x2="22"
        y2="22"
        stroke="currentColor"
        strokeWidth="0.5"
        opacity="0.4"
      />
      
      {/* Inner Light/Glow */}
      <ellipse
        cx="16"
        cy="16"
        rx="4"
        ry="6"
        fill="currentColor"
        opacity="0.3"
      />
      
      {/* Bottom Cap */}
      <rect
        x="12"
        y="26"
        width="8"
        height="2"
        rx="1"
        fill="currentColor"
        opacity="0.8"
      />
      
      {/* Bottom Tassel */}
      <line
        x1="16"
        y1="28"
        x2="16"
        y2="30"
        stroke="currentColor"
        strokeWidth="1"
        opacity="0.6"
      />
    </svg>
  );
}