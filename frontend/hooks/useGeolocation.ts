"use client";

import { useEffect, useState, useRef } from 'react';

export type GpsStatus = 'acquiring' | 'active' | 'denied' | 'error' | 'inactive';

interface GeolocationData {
  lat: number;
  lon: number;
  heading: number;
}

interface UseGeolocationReturn {
  position: GeolocationData | null;
  status: GpsStatus;
  error: string | null;
  requestPermissions: () => Promise<void>;
}

const UPDATE_INTERVAL = 1000; // 1 second
const HEADING_SMOOTHING = 0.3; // Lerp factor for smooth heading transitions

export function useGeolocation(): UseGeolocationReturn {
  const [position, setPosition] = useState<GeolocationData | null>(null);
  const [status, setStatus] = useState<GpsStatus>('inactive');
  const [error, setError] = useState<string | null>(null);
  
  const watchIdRef = useRef<number | null>(null);
  const lastUpdateRef = useRef<number>(0);
  const currentHeadingRef = useRef<number>(0);
  const hasCompassRef = useRef<boolean>(false);

  // Smooth angle interpolation (handles 0-360 wrap)
  const lerpAngle = (from: number, to: number, t: number): number => {
    let diff = to - from;
    
    // Handle wrap-around (e.g., 350° -> 10° should go through 0°, not 340°)
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    
    let result = from + diff * t;
    
    // Normalize to 0-360
    if (result < 0) result += 360;
    if (result >= 360) result -= 360;
    
    return result;
  };

  // Send position update to backend
  const sendPositionUpdate = async (lat: number, lon: number, heading: number) => {
    try {
      const wsUrl = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8787/ws';
      const backendUrl = wsUrl.replace('ws://', 'http://').replace('wss://', 'https://').replace('/ws', '');

      await fetch(`${backendUrl}/api/location`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ lat, lon, heading }),
      });
    } catch (err) {
      console.warn('Failed to send position update to backend:', err);
    }
  };

  // Handle device orientation (compass)
  const handleOrientation = (event: DeviceOrientationEvent) => {
    if (event.alpha !== null) {
      hasCompassRef.current = true;
      
      // alpha is 0-360 where 0 is North
      // For iOS, we might need to use webkitCompassHeading
      let compassHeading = event.alpha;
      
      // iOS uses webkitCompassHeading which is more accurate
      if ('webkitCompassHeading' in event && typeof (event as any).webkitCompassHeading === 'number') {
        compassHeading = (event as any).webkitCompassHeading;
      }
      
      // Smooth the heading change using lerp
      currentHeadingRef.current = lerpAngle(
        currentHeadingRef.current,
        compassHeading,
        HEADING_SMOOTHING
      );
    }
  };

  // Request iOS orientation permission if needed
  const requestOrientationPermission = async () => {
    if (typeof DeviceOrientationEvent !== 'undefined' && 
        typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
      try {
        const permission = await (DeviceOrientationEvent as any).requestPermission();
        if (permission === 'granted') {
          window.addEventListener('deviceorientation', handleOrientation, true);
          window.addEventListener('deviceorientationabsolute', handleOrientation, true);
        }
      } catch (err) {
        console.warn('Orientation permission denied:', err);
      }
    } else {
      // Not iOS or permission not needed, just add listeners
      window.addEventListener('deviceorientation', handleOrientation, true);
      window.addEventListener('deviceorientationabsolute', handleOrientation, true);
    }
  };

  // Handle GPS position update
  const handlePosition = (pos: GeolocationPosition) => {
    const now = Date.now();
    
    // Throttle updates to UPDATE_INTERVAL
    if (now - lastUpdateRef.current < UPDATE_INTERVAL) {
      return;
    }
    lastUpdateRef.current = now;

    const lat = pos.coords.latitude;
    const lon = pos.coords.longitude;
    
    // Use compass heading if available, otherwise fall back to GPS heading
    let heading = currentHeadingRef.current;
    
    if (!hasCompassRef.current && pos.coords.heading !== null) {
      // Use GPS course/bearing as fallback
      heading = pos.coords.heading;
      currentHeadingRef.current = heading;
    }

    setPosition({ lat, lon, heading });
    setStatus('active');
    setError(null);

    // Send to backend
    sendPositionUpdate(lat, lon, heading);
  };

  // Handle GPS errors
  const handleError = (err: GeolocationPositionError) => {
    console.warn('Geolocation error:', err.message);
    
    switch (err.code) {
      case err.PERMISSION_DENIED:
        setStatus('denied');
        setError('Location permission denied. Please enable location access.');
        break;
      case err.POSITION_UNAVAILABLE:
        setStatus('error');
        setError('Location unavailable. Check GPS signal.');
        break;
      case err.TIMEOUT:
        setStatus('error');
        setError('Location request timed out.');
        break;
      default:
        setStatus('error');
        setError('Unknown location error.');
    }
  };

  // Request all permissions
  const requestPermissions = async () => {
    setStatus('acquiring');
    setError(null);

    // Request location permission
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser');
      return;
    }

    // Start watching position
    watchIdRef.current = navigator.geolocation.watchPosition(
      handlePosition,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      }
    );

    // Request orientation permission (compass)
    await requestOrientationPermission();
  };

  // Auto-start on mount
  useEffect(() => {
    requestPermissions();

    // Cleanup
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
      window.removeEventListener('deviceorientation', handleOrientation, true);
      window.removeEventListener('deviceorientationabsolute', handleOrientation, true);
    };
  }, []);

  return { position, status, error, requestPermissions };
}

