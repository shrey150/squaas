"use client";

import { useWebSocket } from '@/hooks/useWebSocket';
import { useGeolocation } from '@/hooks/useGeolocation';
import MobileMap from '@/components/MobileMap';
import MobileObjective from '@/components/MobileObjective';
import MobileMessage from '@/components/MobileMessage';
import MobileBossBar from '@/components/MobileBossBar';
import PanicButton from '@/components/PanicButton';
import GpsStatus from '@/components/GpsStatus';

export default function PhonePage() {
  const { state, isConnected } = useWebSocket();
  const { position: gpsPosition, status: gpsStatus, error: gpsError } = useGeolocation();

  return (
    <div className="w-screen h-screen overflow-hidden bg-black">
      {/* Mobile viewport meta is handled in layout.tsx */}
      
      {/* Connection status indicator */}
      {!isConnected && (
        <div className="fixed top-2 right-2 z-50">
          <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse" />
        </div>
      )}

      {/* GPS Status Indicator */}
      <GpsStatus status={gpsStatus} error={gpsError} />

      {/* Connected status indicator (subtle) */}
      {isConnected && (
        <div className="fixed top-2 right-2 z-50">
          <div className="w-2 h-2 rounded-full bg-green-500 opacity-50" />
        </div>
      )}

      {/* Main content container */}
      <div className="flex flex-col h-full">
        {/* Map at top - uses real GPS if available */}
        <MobileMap 
          player={state.player} 
          pois={state.pois}
          dangerLevel={state.danger_level}
          gpsPosition={gpsPosition}
        />

        {/* Objective Bar */}
        <MobileObjective 
          objective={state.objective} 
          dangerLevel={state.danger_level}
        />

        {/* Boss Health Bar (appears during confrontations) */}
        <MobileBossBar 
          bossName={state.boss_name} 
          isActive={state.boss_fight_active} 
        />

        {/* Spacer to push content up and allow for safe area at bottom */}
        <div className="flex-grow" />
      </div>

      {/* Panic Button */}
      <PanicButton />

      {/* Message Overlay */}
      <MobileMessage message={state.message} />
    </div>
  );
}

