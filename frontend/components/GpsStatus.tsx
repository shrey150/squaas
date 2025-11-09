"use client";

import { GpsStatus as GpsStatusType } from '@/hooks/useGeolocation';

interface GpsStatusProps {
  status: GpsStatusType;
  error: string | null;
  hasCompass?: boolean;
}

export default function GpsStatus({ status, error, hasCompass = true }: GpsStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'active':
        return {
          color: 'bg-green-500',
          text: hasCompass ? 'GPS + Compass' : 'GPS Active',
          pulse: false,
        };
      case 'acquiring':
        return {
          color: 'bg-yellow-500',
          text: 'Acquiring...',
          pulse: true,
        };
      case 'denied':
        return {
          color: 'bg-red-500',
          text: 'Permission Denied',
          pulse: false,
        };
      case 'error':
        return {
          color: 'bg-red-500',
          text: 'GPS Error',
          pulse: false,
        };
      case 'inactive':
        return {
          color: 'bg-gray-500',
          text: 'GPS Inactive',
          pulse: false,
        };
      default:
        return {
          color: 'bg-gray-500',
          text: 'Unknown',
          pulse: false,
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="fixed top-2 left-2 z-50 flex items-center gap-2">
      {/* Status dot */}
      <div className="relative">
        <div
          className={`w-3 h-3 rounded-full ${config.color} ${config.pulse ? 'animate-pulse' : ''}`}
        />
        {config.pulse && (
          <div className={`absolute inset-0 w-3 h-3 rounded-full ${config.color} animate-ping opacity-75`} />
        )}
      </div>

      {/* Status text - shows on hover or when there's an error */}
      <div className="group relative">
        <div className="text-[10px] text-white/70 font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
          {config.text}
        </div>
        
        {/* Error tooltip */}
        {error && (
          <div className="absolute top-full left-0 mt-1 p-2 bg-red-900/90 text-white text-[10px] rounded shadow-lg whitespace-nowrap max-w-[200px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}

