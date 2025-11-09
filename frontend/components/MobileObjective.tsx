"use client";

import styles from '@/styles/fantasy-ui.module.css';

interface MobileObjectiveProps {
  objective: string;
  dangerLevel?: string;
}

export default function MobileObjective({ objective, dangerLevel = 'none' }: MobileObjectiveProps) {
  if (!objective) return null;

  const bgStyle = dangerLevel === 'high' 
    ? 'bg-gradient-to-b from-red-900/90 to-red-950/90' 
    : dangerLevel === 'low'
    ? 'bg-gradient-to-b from-yellow-900/90 to-yellow-950/90'
    : styles.leatherTexture;

  const borderStyle = dangerLevel === 'high' ? 'border-red-700' : dangerLevel === 'low' ? 'border-yellow-700' : 'border-bronze';

  return (
    <div className="w-full px-4 mt-4">
      <div className={`${bgStyle} relative px-6 py-3 transition-all duration-500`}>
        {/* Decorative border */}
        <div className={`absolute inset-0 border-2 ${borderStyle} pointer-events-none`} style={{ 
          boxShadow: 'inset 0 0 10px rgba(0, 0, 0, 0.8), 0 2px 6px rgba(0, 0, 0, 0.6)'
        }} />
        
        {/* Objective text */}
        <div className="relative text-center">
          <div className="text-[10px] tracking-widest mb-0.5" style={{ 
            color: '#C9A961', 
            fontFamily: 'var(--font-cinzel)',
            textShadow: '1px 1px 2px rgba(0, 0, 0, 0.9)'
          }}>
            OBJECTIVE
          </div>
          <div className={`${styles.goldText} text-base leading-tight`}>
            {objective}
          </div>
        </div>
      </div>
    </div>
  );
}

