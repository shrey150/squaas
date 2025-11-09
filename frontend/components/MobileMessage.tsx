"use client";

import { useEffect, useState } from 'react';
import { Message } from '@/types/game-state';
import styles from '@/styles/fantasy-ui.module.css';

interface MobileMessageProps {
  message: Message;
}

export default function MobileMessage({ message }: MobileMessageProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [currentText, setCurrentText] = useState('');

  useEffect(() => {
    if (message.visible && message.text) {
      setCurrentText(message.text);
      setIsVisible(true);
      setIsFadingOut(false);

      if (message.timeoutMs > 0) {
        // Start fade out animation before hiding
        const fadeTimer = setTimeout(() => {
          setIsFadingOut(true);
        }, message.timeoutMs);

        // Actually hide after fade animation completes (500ms animation duration)
        const hideTimer = setTimeout(() => {
          setIsVisible(false);
          setIsFadingOut(false);
        }, message.timeoutMs + 500);

        return () => {
          clearTimeout(fadeTimer);
          clearTimeout(hideTimer);
        };
      }
    } else {
      setIsFadingOut(true);
      setTimeout(() => {
        setIsVisible(false);
        setIsFadingOut(false);
      }, 500);
    }
  }, [message.visible, message.text, message.timeoutMs]);

  if (!isVisible && !isFadingOut) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none px-4">
      <div 
        className={`${styles.parchmentTexture} ${!isFadingOut ? styles.fadeInScale : styles.fadeOutScale} relative px-8 py-6 max-w-sm w-full`}
      >
        {/* Ornate border */}
        <div className="absolute inset-0 border-2 pointer-events-none" style={{
          borderImage: 'linear-gradient(135deg, #8B6F47 0%, #C9A961 25%, #8B6F47 50%, #C9A961 75%, #8B6F47 100%) 1',
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.9), inset 0 0 15px rgba(0, 0, 0, 0.3)'
        }} />

        {/* Corner decorations - smaller for mobile */}
        <svg className="absolute -top-4 -left-4 w-8 h-8" viewBox="0 0 32 32">
          <path d="M0,16 Q0,0 16,0 L12,6 Q6,6 6,12 L0,16" fill="#8B6F47" stroke="#C9A961" strokeWidth="1.5" />
        </svg>
        <svg className="absolute -top-4 -right-4 w-8 h-8" viewBox="0 0 32 32">
          <path d="M32,16 Q32,0 16,0 L20,6 Q26,6 26,12 L32,16" fill="#8B6F47" stroke="#C9A961" strokeWidth="1.5" />
        </svg>
        <svg className="absolute -bottom-4 -left-4 w-8 h-8" viewBox="0 0 32 32">
          <path d="M0,16 Q0,32 16,32 L12,26 Q6,26 6,20 L0,16" fill="#8B6F47" stroke="#C9A961" strokeWidth="1.5" />
        </svg>
        <svg className="absolute -bottom-4 -right-4 w-8 h-8" viewBox="0 0 32 32">
          <path d="M32,16 Q32,32 16,32 L20,26 Q26,26 26,20 L32,16" fill="#8B6F47" stroke="#C9A961" strokeWidth="1.5" />
        </svg>

        {/* Message text */}
        <div className="relative">
          <div className={`${styles.darkText} text-2xl text-center font-bold leading-tight`}>
            {currentText}
          </div>
        </div>

        {/* Decorative scrollwork */}
        <div className="absolute -bottom-3 left-1/2 -translate-x-1/2">
          <svg width="60" height="12" viewBox="0 0 60 12">
            <path 
              d="M6,6 Q12,3 18,6 T30,6 T42,6 T54,6" 
              fill="none" 
              stroke="#8B6F47" 
              strokeWidth="1.5"
              opacity="0.6"
            />
            <circle cx="30" cy="6" r="3" fill="#C9A961" stroke="#8B6F47" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

