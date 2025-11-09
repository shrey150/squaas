"use client";

import { useWebSocket } from '@/hooks/useWebSocket';
import MapOverlay from '@/components/MapOverlay';
import ObjectiveBar from '@/components/ObjectiveBar';
import MessageOverlay from '@/components/MessageOverlay';
import BossHealthBar from '@/components/BossHealthBar';

export default function Home() {
  const { state, isConnected } = useWebSocket();

  return (
    <div className="w-screen h-screen overflow-hidden">
      {/* Connection status indicator (for debugging) */}
      {!isConnected && (
        <div className="fixed top-4 right-4 bg-red-600 text-white px-4 py-2 rounded text-sm opacity-50 z-50">
          Disconnected
        </div>
      )}

      {/* Boss Health Bar (appears during confrontations) */}
      <BossHealthBar 
        bossName={state.boss_name} 
        isActive={state.boss_fight_active} 
      />

      {/* Objective Bar */}
      <ObjectiveBar 
        objective={state.objective} 
        dangerLevel={state.danger_level}
      />

      {/* Map Overlay */}
      <MapOverlay 
        player={state.player} 
        pois={state.pois}
        dangerLevel={state.danger_level}
      />

      {/* Message Overlay */}
      <MessageOverlay message={state.message} />
    </div>
  );
}
