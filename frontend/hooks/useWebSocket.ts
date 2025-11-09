"use client";

import { useEffect, useState, useRef } from 'react';
import { GameState } from '@/types/game-state';

const WS_URL = 'ws://localhost:8787/ws';
const RECONNECT_DELAY = 2000; // 2 seconds

const defaultState: GameState = {
  player: { lat: 37.7749, lon: -122.4194, heading: 0 },
  pois: [],
  objective: 'Connecting...',
  message: { text: '', visible: false, timeoutMs: 0 },
  danger_level: 'none',
  boss_fight_active: false,
  boss_name: null,
  environment: '',
};

export function useWebSocket() {
  const [state, setState] = useState<GameState>(defaultState);
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(() => {
    function connect() {
      try {
        const ws = new WebSocket(WS_URL);
        wsRef.current = ws;

        ws.onopen = () => {
          console.log('WebSocket connected');
          setIsConnected(true);
        };

        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data) as GameState;
            setState(data);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
          console.log('WebSocket disconnected');
          setIsConnected(false);
          wsRef.current = null;

          // Attempt to reconnect after delay
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            connect();
          }, RECONNECT_DELAY);
        };
      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        // Retry connection
        reconnectTimeoutRef.current = setTimeout(connect, RECONNECT_DELAY);
      }
    }

    connect();

    // Cleanup on unmount
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return { state, isConnected };
}

