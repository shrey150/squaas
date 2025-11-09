"use client";

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Player, POI } from '@/types/game-state';
import styles from '@/styles/fantasy-ui.module.css';

interface MobileMapProps {
  player: Player;
  pois: POI[];
  dangerLevel?: string;
  gpsPosition?: { lat: number; lon: number; heading: number } | null;
}

export default function MobileMap({ player, pois, dangerLevel = 'none', gpsPosition = null }: MobileMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const playerMarkerRef = useRef<maplibregl.Marker | null>(null);

  // Use GPS position if available, otherwise fall back to WebSocket player data
  const currentPosition = gpsPosition || player;

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map
    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: {
        version: 8,
        sources: {
          'osm': {
            type: 'raster',
            tiles: [
              'https://a.tile.openstreetmap.org/{z}/{x}/{y}.png',
            ],
            tileSize: 256,
            attribution: '© OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm',
            type: 'raster',
            source: 'osm',
            paint: {
              'raster-opacity': 0.6,
              'raster-brightness-min': 0.2,
              'raster-brightness-max': 0.6,
              'raster-saturation': -0.5,
            },
          },
        ],
        glyphs: 'https://demotiles.maplibre.org/font/{fontstack}/{range}.pbf',
      },
      center: [currentPosition.lon, currentPosition.lat],
      zoom: 14,  // Slightly more zoomed in for mobile
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    // Add player marker (center point)
    const playerMarker = document.createElement('div');
    playerMarker.style.width = '14px';
    playerMarker.style.height = '14px';
    playerMarker.style.backgroundColor = '#C9A961';
    playerMarker.style.border = '2px solid #FFFFFF';
    playerMarker.style.borderRadius = '50%';
    playerMarker.style.boxShadow = '0 0 8px rgba(201, 169, 97, 0.8)';

    const marker = new maplibregl.Marker({ element: playerMarker, anchor: 'center' })
      .setLngLat([currentPosition.lon, currentPosition.lat])
      .addTo(map);
    
    playerMarkerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      playerMarkerRef.current = null;
    };
  }, []);

  // Update map center and bearing (GTA V style rotation)
  useEffect(() => {
    if (!mapRef.current) return;

    // Update map center and rotation
    mapRef.current.easeTo({
      center: [currentPosition.lon, currentPosition.lat],
      bearing: currentPosition.heading,
      duration: 100,
    });

    // Update player marker position
    if (playerMarkerRef.current) {
      playerMarkerRef.current.setLngLat([currentPosition.lon, currentPosition.lat]);
    }
  }, [currentPosition.lat, currentPosition.lon, currentPosition.heading]);

  // Update POI markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    pois.forEach((poi) => {
      const el = document.createElement('div');
      el.style.width = '24px';
      el.style.height = '24px';
      el.style.position = 'relative';
      el.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24">
          <polygon 
            points="12,4 16,12 12,20 8,12" 
            fill="#C9A961" 
            stroke="#FFFFFF" 
            stroke-width="1.5"
          />
          <circle cx="12" cy="12" r="3" fill="#FFFFFF" />
        </svg>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([poi.lon, poi.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [pois]);

  const borderColor = dangerLevel === 'high' ? 'border-red-700' : dangerLevel === 'low' ? 'border-yellow-700' : '';
  const glowEffect = dangerLevel === 'high' ? 'shadow-[0_0_15px_rgba(255,0,0,0.8)]' : '';

  return (
    <div className="w-full flex justify-center pt-4 px-4">
      <div className={`${styles.metalBorder} ${styles.vignette} ${borderColor} ${glowEffect} relative overflow-hidden rounded-lg transition-all duration-500`}>
        <div
          ref={mapContainerRef}
          className="w-[280px] h-[280px]"
          style={{ background: '#1a1a1a' }}
        />
        {/* Compass decoration */}
        <div className="absolute top-1 right-1 w-10 h-10 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 40 40">
            <circle cx="20" cy="20" r="16" fill="none" stroke="#C9A961" strokeWidth="1.5" opacity="0.6" />
            <polygon points="20,8 21,18 20,20 19,18" fill="#C9A961" />
            <text x="20" y="11" textAnchor="middle" fill="#C9A961" fontSize="8" fontWeight="bold">N</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

