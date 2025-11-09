"use client";

import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import { Player, POI } from '@/types/game-state';
import styles from '@/styles/fantasy-ui.module.css';

interface MapOverlayProps {
  player: Player;
  pois: POI[];
  dangerLevel?: string;
}

export default function MapOverlay({ player, pois, dangerLevel = 'none' }: MapOverlayProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);

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
      center: [-122.4194, 37.7749],  // San Francisco center
      zoom: 13,  // City-level view
      pitch: 0,
      bearing: 0,
      interactive: false,
      attributionControl: false,
    });

    mapRef.current = map;

    // Add player marker (center point)
    const playerMarker = document.createElement('div');
    playerMarker.style.width = '16px';
    playerMarker.style.height = '16px';
    playerMarker.style.backgroundColor = '#C9A961';
    playerMarker.style.border = '3px solid #FFFFFF';
    playerMarker.style.borderRadius = '50%';
    playerMarker.style.boxShadow = '0 0 10px rgba(201, 169, 97, 0.8)';

    new maplibregl.Marker({ element: playerMarker, anchor: 'center' })
      .setLngLat([player.lon, player.lat])
      .addTo(map);

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update map center and bearing
  useEffect(() => {
    if (!mapRef.current) return;

    mapRef.current.easeTo({
      center: [player.lon, player.lat],
      bearing: player.heading,
      duration: 100,
    });
  }, [player.lat, player.lon, player.heading]);

  // Update POI markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach(marker => marker.remove());
    markersRef.current = [];

    // Add new markers
    pois.forEach((poi) => {
      const el = document.createElement('div');
      el.style.width = '32px';
      el.style.height = '32px';
      el.style.position = 'relative';
      el.innerHTML = `
        <svg width="32" height="32" viewBox="0 0 32 32">
          <polygon 
            points="16,6 22,16 16,26 10,16" 
            fill="#C9A961" 
            stroke="#FFFFFF" 
            stroke-width="2"
          />
          <circle cx="16" cy="16" r="4" fill="#FFFFFF" />
        </svg>
      `;

      const marker = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat([poi.lon, poi.lat])
        .addTo(mapRef.current!);

      markersRef.current.push(marker);
    });
  }, [pois]);

  const borderColor = dangerLevel === 'high' ? 'border-red-700' : dangerLevel === 'low' ? 'border-yellow-700' : '';
  const glowEffect = dangerLevel === 'high' ? 'shadow-[0_0_20px_rgba(255,0,0,0.8)]' : '';

  return (
    <div className="fixed bottom-8 left-8 z-10">
      <div className={`${styles.metalBorder} ${styles.vignette} ${borderColor} ${glowEffect} relative overflow-hidden rounded-lg transition-all duration-500`}>
        <div
          ref={mapContainerRef}
          className="w-[500px] h-[500px]"
          style={{ background: '#1a1a1a' }}
        />
        {/* Compass decoration */}
        <div className="absolute top-2 right-2 w-12 h-12 pointer-events-none">
          <svg width="48" height="48" viewBox="0 0 48 48">
            <circle cx="24" cy="24" r="20" fill="none" stroke="#C9A961" strokeWidth="2" opacity="0.6" />
            <polygon points="24,8 26,22 24,24 22,22" fill="#C9A961" />
            <text x="24" y="12" textAnchor="middle" fill="#C9A961" fontSize="10" fontWeight="bold">N</text>
          </svg>
        </div>
      </div>
    </div>
  );
}

