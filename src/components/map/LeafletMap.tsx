/**
 * LeafletMap - Interactive map component with click-to-place markers
 * and shortest path visualization using real OpenStreetMap data
 */

import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
});

export interface MapMarker {
  id: string;
  type: 'start' | 'end';
  lat: number;
  lng: number;
}

export interface RouteData {
  coordinates: [number, number][];
  distance: number; // in meters
  duration: number; // in seconds
  isLoading: boolean;
  error?: string;
}

export interface ExploredNode {
  lat: number;
  lng: number;
}

interface LeafletMapProps {
  markers: MapMarker[];
  route: RouteData | null;
  exploredNodes: ExploredNode[];
  showExplored: boolean;
  onMapClick: (lat: number, lng: number) => void;
  onMarkerDrag: (id: string, lat: number, lng: number) => void;
}

// Custom marker icons
const createIcon = (color: string, label: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div class="relative">
        <div class="w-8 h-8 rounded-full ${color} border-2 border-white shadow-lg flex items-center justify-center text-white font-bold text-sm">
          ${label}
        </div>
        <div class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-6 border-transparent ${color.replace('bg-', 'border-t-')}"></div>
      </div>
    `,
    iconSize: [32, 40],
    iconAnchor: [16, 40],
  });
};

export function LeafletMap({
  markers,
  route,
  exploredNodes,
  showExplored,
  onMapClick,
  onMarkerDrag,
}: LeafletMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const exploredLayerRef = useRef<L.LayerGroup | null>(null);

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: [40.7128, -74.006], // New York City
      zoom: 13,
      zoomControl: true,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      maxZoom: 19,
    }).addTo(map);

    // Add click handler
    map.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });

    // Create layer group for explored nodes
    exploredLayerRef.current = L.layerGroup().addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update click handler when callback changes
  useEffect(() => {
    if (!mapRef.current) return;
    
    mapRef.current.off('click');
    mapRef.current.on('click', (e: L.LeafletMouseEvent) => {
      onMapClick(e.latlng.lat, e.latlng.lng);
    });
  }, [onMapClick]);

  // Update markers
  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkerIds = new Set(markers.map(m => m.id));

    // Remove markers that no longer exist
    markersRef.current.forEach((marker, id) => {
      if (!currentMarkerIds.has(id)) {
        marker.remove();
        markersRef.current.delete(id);
      }
    });

    // Add or update markers
    markers.forEach((markerData) => {
      const existingMarker = markersRef.current.get(markerData.id);
      
      if (existingMarker) {
        existingMarker.setLatLng([markerData.lat, markerData.lng]);
      } else {
        const icon = L.divIcon({
          className: 'custom-marker',
          html: `
            <div class="relative flex flex-col items-center">
              <div class="w-10 h-10 rounded-full ${markerData.type === 'start' ? 'bg-emerald-500' : 'bg-rose-500'} border-3 border-white shadow-xl flex items-center justify-center text-white font-bold text-base transform transition-transform hover:scale-110">
                ${markerData.type === 'start' ? 'A' : 'B'}
              </div>
              <div class="w-3 h-3 ${markerData.type === 'start' ? 'bg-emerald-500' : 'bg-rose-500'} rotate-45 -mt-1.5 shadow-md"></div>
            </div>
          `,
          iconSize: [40, 52],
          iconAnchor: [20, 52],
        });

        const marker = L.marker([markerData.lat, markerData.lng], {
          icon,
          draggable: true,
        }).addTo(map);

        marker.on('dragend', (e) => {
          const latlng = e.target.getLatLng();
          onMarkerDrag(markerData.id, latlng.lat, latlng.lng);
        });

        markersRef.current.set(markerData.id, marker);
      }
    });

    // Fit bounds if we have markers
    if (markers.length >= 2) {
      const bounds = L.latLngBounds(markers.map(m => [m.lat, m.lng]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers, onMarkerDrag]);

  // Update route polyline
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing route
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    // Add new route if available
    if (route && route.coordinates.length > 0 && !route.isLoading && !route.error) {
      const latLngs = route.coordinates.map(coord => L.latLng(coord[0], coord[1]));
      
      // Route shadow for depth
      L.polyline(latLngs, {
        color: '#000',
        weight: 8,
        opacity: 0.2,
      }).addTo(mapRef.current);

      // Main route line
      routeLayerRef.current = L.polyline(latLngs, {
        color: '#3b82f6',
        weight: 5,
        opacity: 0.9,
        lineJoin: 'round',
        lineCap: 'round',
      }).addTo(mapRef.current);

      // Animate the route
      const path = routeLayerRef.current.getElement() as SVGPathElement | null;
      if (path && path.getTotalLength) {
        const length = path.getTotalLength();
        if (length) {
          path.style.strokeDasharray = `${length}`;
          path.style.strokeDashoffset = `${length}`;
          path.style.transition = 'stroke-dashoffset 1.5s ease-in-out';
          requestAnimationFrame(() => {
            path.style.strokeDashoffset = '0';
          });
        }
      }
    }
  }, [route]);

  // Update explored nodes visualization
  useEffect(() => {
    if (!exploredLayerRef.current) return;

    exploredLayerRef.current.clearLayers();

    if (showExplored && exploredNodes.length > 0) {
      exploredNodes.forEach((node, index) => {
        const circle = L.circleMarker([node.lat, node.lng], {
          radius: 4,
          fillColor: '#f59e0b',
          fillOpacity: 0.6,
          color: '#d97706',
          weight: 1,
          opacity: 0.8,
        });
        
        // Stagger the animation
        setTimeout(() => {
          if (exploredLayerRef.current) {
            circle.addTo(exploredLayerRef.current);
          }
        }, index * 20);
      });
    }
  }, [exploredNodes, showExplored]);

  return (
    <div 
      ref={mapContainerRef} 
      className="w-full h-full rounded-lg overflow-hidden"
      style={{ minHeight: '400px' }}
    />
  );
}
