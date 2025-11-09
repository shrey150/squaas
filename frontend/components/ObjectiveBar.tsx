"use client";

import styles from '@/styles/fantasy-ui.module.css';

interface ObjectiveBarProps {
  objective: string;
  dangerLevel?: string;
}

export default function ObjectiveBar({ objective, dangerLevel = 'none' }: ObjectiveBarProps) {
  if (!objective) return null;

  const bgStyle = dangerLevel === 'high' 
    ? 'bg-gradient-to-b from-red-900/90 to-red-950/90' 
    : dangerLevel === 'low'
    ? 'bg-gradient-to-b from-yellow-900/90 to-yellow-950/90'
    : styles.leatherTexture;

  const borderStyle = dangerLevel === 'high' ? 'border-red-700' : dangerLevel === 'low' ? 'border-yellow-700' : 'border-bronze';

  return (
    <div className="fixed top-8 left-1/2 -translate-x-1/2 z-20">
      <div className={`${bgStyle} relative px-32 py-14 min-w-[600px] max-w-[1100px] transition-all duration-500`}>
        {/* Decorative border elements */}
        <div className={`absolute inset-0 border-2 ${borderStyle} pointer-events-none`} style={{ 
          boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.8), 0 4px 8px rgba(0, 0, 0, 0.6)'
        }} />
        
        {/* Center ornament */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <svg width="50" height="25" viewBox="0 0 40 20">
            <path 
              d="M0,20 L10,5 L20,0 L30,5 L40,20 L30,18 L20,15 L10,18 Z" 
              fill="#C9A961" 
              stroke="#8B6F47" 
              strokeWidth="1"
            />
          </svg>
        </div>

        {/* Objective text */}
        <div className="relative text-center">
          <br />
          <div className="text-base tracking-widest mb-3" style={{ 
            color: '#C9A961', 
            fontFamily: 'var(--font-cinzel)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)'
          }}>
            CURRENT OBJECTIVE
          </div>
          <div className={`${styles.goldText} text-5xl`}>
            {objective}
          </div>
          <br />
        </div>

        {/* Bottom decorative line */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3/4 h-0.5 bg-gradient-to-r from-transparent via-bronze to-transparent opacity-60" />
      </div>
    </div>
  );
}

