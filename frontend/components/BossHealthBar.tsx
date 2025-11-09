"use client";

import { useEffect, useState } from 'react';
import styles from '@/styles/fantasy-ui.module.css';

interface BossHealthBarProps {
  bossName: string | null;
  isActive: boolean;
}

export default function BossHealthBar({ bossName, isActive }: BossHealthBarProps) {
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
    <div className={`fixed top-20 left-1/2 -translate-x-1/2 z-30 w-[800px] ${isActive ? 'animate-pulse-slow' : ''}`}>
      {/* Boss Name Plate */}
      <div className={`${styles.leatherTexture} relative px-8 py-3 mb-2`}>
        <div className="absolute inset-0 border-2 border-red-700 pointer-events-none" style={{ 
          boxShadow: 'inset 0 0 20px rgba(139, 0, 0, 0.8), 0 0 15px rgba(255, 0, 0, 0.6)'
        }} />
        
        <div className="relative text-center">
          <div className="text-sm tracking-widest text-red-400 mb-1" style={{ 
            fontFamily: 'var(--font-cinzel)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.9)'
          }}>
            BOSS ENCOUNTER
          </div>
          <div className={`${styles.goldText} text-2xl`} style={{ color: '#ff4444' }}>
            {bossName}
          </div>
        </div>
      </div>

      {/* Health Bar */}
      <div className="relative">
        {/* Background */}
        <div className="h-10 bg-black border-2 border-red-900 rounded overflow-hidden" style={{
          boxShadow: 'inset 0 0 20px rgba(0, 0, 0, 0.9), 0 0 15px rgba(255, 0, 0, 0.5)'
        }}>
          {/* Health Fill */}
          <div 
            className="h-full bg-gradient-to-r from-red-700 via-red-600 to-red-500 transition-all duration-500 relative"
            style={{ 
              width: `${health}%`,
              boxShadow: 'inset 0 2px 10px rgba(255, 100, 100, 0.6)'
            }}
          >
            {/* Shine effect */}
            <div className="absolute inset-0 bg-gradient-to-b from-white/20 to-transparent" />
          </div>
        </div>

        {/* Health Text */}
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-white font-bold text-lg tracking-wider" style={{
            fontFamily: 'var(--font-cinzel)',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 1)'
          }}>
            {Math.round(health)}%
          </span>
        </div>
      </div>

      {/* Decorative Corners */}
      <svg className="absolute -top-4 -left-4 w-8 h-8 opacity-80" viewBox="0 0 32 32">
        <path d="M0,16 Q0,0 16,0 L12,4 Q8,8 8,12 L0,16" fill="#8B0000" stroke="#FF0000" strokeWidth="1" />
      </svg>
      <svg className="absolute -top-4 -right-4 w-8 h-8 opacity-80" viewBox="0 0 32 32">
        <path d="M32,16 Q32,0 16,0 L20,4 Q24,8 24,12 L32,16" fill="#8B0000" stroke="#FF0000" strokeWidth="1" />
      </svg>
    </div>
  );
}

