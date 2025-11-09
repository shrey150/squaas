"use client";

import { useState } from 'react';
import styles from '@/styles/fantasy-ui.module.css';

interface PanicButtonProps {
  onPanic?: () => void;
  onResolve?: () => void;
}

export default function PanicButton({ onPanic, onResolve }: PanicButtonProps) {
  const [isPanicMode, setIsPanicMode] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [cooldown, setCooldown] = useState(false);

  const handleClick = async () => {
    if (cooldown) return;

    setIsProcessing(true);
    setCooldown(true);

    try {
      // Get backend URL from env or default to localhost
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787/ws';
      const backendUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');

      if (!isPanicMode) {
        // Activate panic mode
        const response = await fetch(`${backendUrl}/api/danger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            danger_level: 'high',
            boss_fight_active: true,
            boss_name: 'EMERGENCY THREAT DETECTED'
          }),
        });

        if (response.ok) {
          console.log('Panic mode activated!');
          setIsPanicMode(true);
          onPanic?.();
        } else {
          console.error('Failed to activate panic mode');
        }
      } else {
        // Deactivate panic mode (resolve)
        const response = await fetch(`${backendUrl}/api/danger`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            danger_level: 'none',
            boss_fight_active: false,
            boss_name: null
          }),
        });

        if (response.ok) {
          console.log('Panic mode resolved!');
          setIsPanicMode(false);
          onResolve?.();
        } else {
          console.error('Failed to resolve panic mode');
        }
      }
    } catch (error) {
      console.error('Error toggling panic mode:', error);
    } finally {
      setIsProcessing(false);
      
      // 2 second cooldown
      setTimeout(() => {
        setCooldown(false);
      }, 2000);
    }
  };

  // Different styles based on panic mode
  const buttonStyles = isPanicMode ? {
    bgGradient: 'bg-gradient-to-b from-blue-600 to-blue-800',
    borderColor: 'border-blue-900',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(0,100,255,0.8)]',
    boxShadow: cooldown 
      ? 'inset 0 0 20px rgba(0, 0, 0, 0.8), 0 4px 15px rgba(0, 0, 0, 0.6)'
      : 'inset 0 0 20px rgba(0, 50, 139, 0.9), 0 0 25px rgba(0, 100, 255, 0.7), 0 4px 15px rgba(0, 0, 0, 0.8)',
    borderPingColor: 'border-blue-400',
    labelColor: 'text-blue-200',
    label: '✓ ALL CLEAR ✓',
    mainText: cooldown ? 'WAIT...' : 'RESOLVE',
    cooldownText: 'text-blue-200',
  } : {
    bgGradient: 'bg-gradient-to-b from-red-600 to-red-800',
    borderColor: 'border-red-900',
    hoverShadow: 'hover:shadow-[0_0_30px_rgba(255,0,0,0.8)]',
    boxShadow: cooldown 
      ? 'inset 0 0 20px rgba(0, 0, 0, 0.8), 0 4px 15px rgba(0, 0, 0, 0.6)'
      : 'inset 0 0 20px rgba(139, 0, 0, 0.9), 0 0 25px rgba(255, 0, 0, 0.7), 0 4px 15px rgba(0, 0, 0, 0.8)',
    borderPingColor: 'border-red-400',
    labelColor: 'text-yellow-300',
    label: '⚠️ EMERGENCY ⚠️',
    mainText: cooldown ? 'WAIT...' : 'PANIC',
    cooldownText: 'text-red-200',
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40">
      <button
        onClick={handleClick}
        disabled={cooldown}
        className={`
          ${styles.metalBorder}
          relative px-8 py-4 
          ${buttonStyles.bgGradient}
          border-4 ${buttonStyles.borderColor}
          rounded-lg
          transition-all duration-300
          ${cooldown ? 'opacity-50 cursor-not-allowed' : `active:scale-95 ${buttonStyles.hoverShadow}`}
          ${isProcessing ? 'animate-pulse' : ''}
        `}
        style={{
          boxShadow: buttonStyles.boxShadow,
          textShadow: '2px 2px 4px rgba(0, 0, 0, 1)',
        }}
      >
        {/* Warning stripes decoration (only in panic mode) */}
        {!isPanicMode && (
          <div className="absolute inset-0 overflow-hidden rounded-lg opacity-20 pointer-events-none">
            <div className="absolute inset-0" style={{
              background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, #000 10px, #000 20px)'
            }} />
          </div>
        )}

        {/* Button text */}
        <div className="relative flex flex-col items-center gap-1">
          <div className={`text-xs tracking-widest ${buttonStyles.labelColor} font-bold`} style={{
            fontFamily: 'var(--font-cinzel)',
          }}>
            {buttonStyles.label}
          </div>
          <div className="text-2xl font-black tracking-wider text-white" style={{
            fontFamily: 'var(--font-cinzel)',
          }}>
            {buttonStyles.mainText}
          </div>
          {cooldown && (
            <div className={`text-[10px] ${buttonStyles.cooldownText}`}>
              Wait 2 seconds...
            </div>
          )}
        </div>

        {/* Pulsing border */}
        {!cooldown && (
          <div className={`absolute inset-0 border-2 ${buttonStyles.borderPingColor} rounded-lg animate-ping opacity-75 pointer-events-none`} />
        )}
      </button>
    </div>
  );
}

