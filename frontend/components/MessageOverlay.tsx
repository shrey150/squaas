"use client";

import { useEffect, useState } from 'react';
import { Message } from '@/types/game-state';
import styles from '@/styles/fantasy-ui.module.css';

interface MessageOverlayProps {
  message: Message;
}

export default function MessageOverlay({ message }: MessageOverlayProps) {
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
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className={`${styles.parchmentTexture} ${!isFadingOut ? styles.fadeInScale : styles.fadeOutScale} relative px-16 py-12 max-w-2xl`}
        style={{ 
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        }}
      >
        {/* Ornate border */}
        <div className="absolute inset-0 border-4 pointer-events-none" style={{
          borderImage: 'linear-gradient(135deg, #8B6F47 0%, #C9A961 25%, #8B6F47 50%, #C9A961 75%, #8B6F47 100%) 1',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.9), inset 0 0 20px rgba(0, 0, 0, 0.3)'
        }} />

        {/* Corner decorations */}
        <svg className="absolute -top-6 -left-6 w-12 h-12" viewBox="0 0 48 48">
          <path d="M0,24 Q0,0 24,0 L16,8 Q8,8 8,16 L0,24" fill="#8B6F47" stroke="#C9A961" strokeWidth="2" />
        </svg>
        <svg className="absolute -top-6 -right-6 w-12 h-12" viewBox="0 0 48 48">
          <path d="M48,24 Q48,0 24,0 L32,8 Q40,8 40,16 L48,24" fill="#8B6F47" stroke="#C9A961" strokeWidth="2" />
        </svg>
        <svg className="absolute -bottom-6 -left-6 w-12 h-12" viewBox="0 0 48 48">
          <path d="M0,24 Q0,48 24,48 L16,40 Q8,40 8,32 L0,24" fill="#8B6F47" stroke="#C9A961" strokeWidth="2" />
        </svg>
        <svg className="absolute -bottom-6 -right-6 w-12 h-12" viewBox="0 0 48 48">
          <path d="M48,24 Q48,48 24,48 L32,40 Q40,40 40,32 L48,24" fill="#8B6F47" stroke="#C9A961" strokeWidth="2" />
        </svg>

        {/* Message text */}
        <div className="relative">
          <div className={`${styles.darkText} text-4xl text-center font-bold leading-tight`}>
            {currentText}
          </div>
        </div>

        {/* Decorative scrollwork */}
        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2">
          <svg width="100" height="20" viewBox="0 0 100 20">
            <path 
              d="M10,10 Q20,5 30,10 T50,10 T70,10 T90,10" 
              fill="none" 
              stroke="#8B6F47" 
              strokeWidth="2"
              opacity="0.6"
            />
            <circle cx="50" cy="10" r="4" fill="#C9A961" stroke="#8B6F47" strokeWidth="1" />
          </svg>
        </div>
      </div>
    </div>
  );
}

