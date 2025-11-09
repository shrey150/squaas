"use client";

import { useEffect, useState } from 'react';
import styles from '@/styles/fantasy-ui.module.css';

interface MobileBossBarProps {
  bossName: string | null;
  isActive: boolean;
}

export default function MobileBossBar({ bossName, isActive }: MobileBossBarProps) {
  const [health, setHealth] = useState(100);
  const [showBar, setShowBar] = useState(false);

  useEffect(() => {
    if (isActive && bossName) {
      setShowBar(true);
      setHealth(100); // Reset health when boss appears
    } else {
      // Fade out after a delay
      const timer = setTimeout(() => setShowBar(false), 1000);
      return () => clearTimeout(timer);
    }
  }, [isActive, bossName]);

  if (!showBar || !bossName) return null;

  return (
    <div className={`w-full px-4 mt-4 ${isActive ? 'animate-pulse-slow' : ''}`}>
      {/* Boss Name Plate */}
      <div className={`${styles.leatherTexture} relative px-4 py-2 mb-2`}>
        <div className="absolute inset-0 border-2 border-red-700 pointer-events-none" style={{ 
          boxShadow: 'inset 0 0 15px rgba(139, 0, 0, 0.8), 0 0 10px rgba(255, 0, 0, 0.6)'
        }} />
        
        <div className="relative text-center">
          <div className="text-[10px] tracking-widest text-red-400 mb-0.5" style={{ 
            fontFamily: 'var(--font-cinzel)',
            textShadow: '1px 1px 3px rgba(0, 0, 0, 0.9)'
          }}>
            BOSS ENCOUNTER
          </div>
          <div className={`${styles.goldText} text-lg`} style={{ color: '#ff4444' }}>
            {bossName}
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="relative">
        {/* Background */}
        <div className="h-8 bg-black border-2 border-red-900 rounded overflow-hidden" style={{
          boxShadow: 'inset 0 0 15px rgba(0, 0, 0, 0.9), 0 0 10px rgba(255, 0, 0, 0.5)'
        }}>
          {/* Health Fill */}
          <div 
            className="h-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 transition-all duration-500 relative"
            style={{ 
              width: `${health}%`,
              boxShadow: 'inset 0 2px 8px rgba(255, 100, 100, 0.6)'
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>

        {/* Health Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-base tracking-wider" style={{
            fontFamily: 'var(--font-cinzel)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1)'
          }}>
            {Math.round(health)}%
          </span>
        </div>
      </div>

      {/* Decorative Corners - smaller for mobile */}
      <svg className="absolute -top-3 left-3 w-6 h-6 opacity-80" viewBox="0 0 24 24">
        <path d="M0,12 Q0,0 12,0 L9,3 Q6,6 6,9 L0,12" fill="#8B0000" stroke="#FF0000" strokeWidth="1" />
      </svg>
      <svg className="absolute -top-3 right-3 w-6 h-6 opacity-80" viewBox="0 0 24 24">
        <path d="M24,12 Q24,0 12,0 L15,3 Q18,6 18,9 L24,12" fill="#8B0000" stroke="#FF0000" strokeWidth="1" />
      </svg>
    </div>
  );
}

