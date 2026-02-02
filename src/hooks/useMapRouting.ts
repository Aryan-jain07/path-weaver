/**
 * useMapRouting - Hook for fetching routes from OSRM (Open Source Routing Machine)
 * Uses real OpenStreetMap road network data
 */

import { useState, useCallback } from 'react';
import { MapMarker, RouteData, ExploredNode } from '@/components/map/LeafletMap';

// Leaflet can return longitudes outside [-180, 180] when the map wraps horizontally.
// OSRM rejects those values, so we normalize before building the request URL.
function normalizeLongitude(lng: number): number {
  // Map any number to [-180, 180)
  return ((((lng + 180) % 360) + 360) % 360) - 180;
}

function clampLatitude(lat: number): number {
  return Math.max(-90, Math.min(90, lat));
}

interface OSRMResponse {
  code: string;
  routes: Array<{
    geometry: {
      coordinates: [number, number][];
    };
    distance: number;
    duration: number;
    legs: Array<{
      steps: Array<{
        geometry: {
          coordinates: [number, number][];
        };
        distance: number;
        duration: number;
        name: string;
        maneuver: {
          type: string;
          modifier?: string;
          location: [number, number];
        };
      }>;
    }>;
  }>;
  waypoints: Array<{
    name: string;
    location: [number, number];
  }>;
}

export function useMapRouting() {
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const [route, setRoute] = useState<RouteData | null>(null);
  const [exploredNodes, setExploredNodes] = useState<ExploredNode[]>([]);
  const [showExplored, setShowExplored] = useState(false);

  // Fetch route from OSRM public demo server
  // The demo server works globally but may have occasional availability issues
  const fetchRoute = useCallback(async (start: MapMarker, end: MapMarker) => {
    setRoute({ coordinates: [], distance: 0, duration: 0, isLoading: true });
    setExploredNodes([]);

    try {
      const startLat = clampLatitude(start.lat);
      const startLng = normalizeLongitude(start.lng);
      const endLat = clampLatitude(end.lat);
      const endLng = normalizeLongitude(end.lng);

      // If Leaflet reported an “unwrapped” longitude (e.g., -282), keep the same world copy
      // when rendering route geometry so it lines up visually with the markers.
      const lngOffset = start.lng - startLng;

      const normalizedStart: MapMarker = { ...start, lat: startLat, lng: startLng };
      const normalizedEnd: MapMarker = { ...end, lat: endLat, lng: endLng };

      // OSRM expects coordinates as lng,lat
      // Using the public OSRM demo server - works worldwide for driving routes
      const url = `https://router.project-osrm.org/route/v1/driving/${startLng},${startLat};${endLng},${endLat}?overview=full&geometries=geojson&steps=true&annotations=true`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout
      
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        // OSRM returns JSON bodies even on errors; surface the actual reason when possible.
        const errBody = await response.json().catch(() => null) as null | { code?: string; message?: string };
        if (errBody?.code === 'InvalidValue') {
          throw new Error('Invalid coordinate value. Try reloading the page and selecting points again.');
        }
        if (errBody?.message) {
          throw new Error(errBody.message);
        }
        if (response.status === 429) {
          throw new Error('Rate limit exceeded. Please wait a moment and try again.');
        }
        throw new Error(`Server error (${response.status}). Please try again.`);
      }

      const data: OSRMResponse = await response.json();

      if (data.code === 'InvalidValue') {
        throw new Error('Invalid coordinates. If you dragged the map around the world, try reloading and selecting points again.');
      }

      if (data.code === 'NoRoute') {
        throw new Error('No driving route exists between these points. Try points closer to roads.');
      }
      
      if (data.code === 'NoSegment') {
        throw new Error('One or both points are too far from any road. Click closer to a road.');
      }

      if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
        throw new Error(`Could not find route: ${data.code || 'Unknown error'}`);
      }

      const routeData = data.routes[0];
      
      // Convert coordinates from [lng, lat] to [lat, lng] for Leaflet
      const coordinates: [number, number][] = routeData.geometry.coordinates.map((coord) => {
        const lat = coord[1];
        const lng = coord[0] + lngOffset;
        return [lat, lng];
      });

      // Simulate explored nodes for educational visualization
      // In a real implementation, these would come from our A* algorithm
      const simulatedExplored = generateExploredNodes(
        normalizedStart,
        normalizedEnd,
        // Use normalized coordinates for the simulation, then offset for display.
        routeData.geometry.coordinates.map((coord) => [coord[1], coord[0]])
      ).map((n) => ({ ...n, lng: n.lng + lngOffset }));

      setExploredNodes(simulatedExplored);

      setRoute({
        coordinates,
        distance: routeData.distance,
        duration: routeData.duration,
        isLoading: false,
      });
    } catch (error) {
      console.error('Routing error:', error);
      
      let errorMessage = 'Unknown error occurred';
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = 'Request timed out. The routing server may be busy. Please try again.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setRoute({
        coordinates: [],
        distance: 0,
        duration: 0,
        isLoading: false,
        error: errorMessage,
      });
    }
  }, []);

  // Generate simulated explored nodes for visualization
  const generateExploredNodes = (
    start: MapMarker,
    end: MapMarker,
    pathCoords: [number, number][]
  ): ExploredNode[] => {
    const explored: ExploredNode[] = [];
    const gridSize = 0.002; // Approximately 200m
    
    // Calculate bounding box
    const minLat = Math.min(start.lat, end.lat) - 0.01;
    const maxLat = Math.max(start.lat, end.lat) + 0.01;
    const minLng = Math.min(start.lng, end.lng) - 0.01;
    const maxLng = Math.max(start.lng, end.lng) + 0.01;

    // Generate grid points that simulate exploration
    // Points closer to the path have higher probability of being "explored"
    for (let lat = minLat; lat <= maxLat; lat += gridSize) {
      for (let lng = minLng; lng <= maxLng; lng += gridSize) {
        const distToPath = minDistanceToPath(lat, lng, pathCoords);
        const distToLine = distanceToLine(lat, lng, start.lat, start.lng, end.lat, end.lng);
        
        // Higher probability for points near the direct line (simulating A* heuristic)
        const probability = Math.exp(-distToLine * 80) * 0.8 + Math.exp(-distToPath * 150) * 0.4;
        
        if (Math.random() < probability) {
          explored.push({ lat, lng });
        }
      }
    }

    return explored;
  };

  // Calculate minimum distance from a point to a path
  const minDistanceToPath = (
    lat: number,
    lng: number,
    path: [number, number][]
  ): number => {
    let minDist = Infinity;
    for (const [pLat, pLng] of path) {
      const dist = Math.sqrt(Math.pow(lat - pLat, 2) + Math.pow(lng - pLng, 2));
      if (dist < minDist) minDist = dist;
    }
    return minDist;
  };

  // Calculate distance from point to line segment
  const distanceToLine = (
    px: number,
    py: number,
    x1: number,
    y1: number,
    x2: number,
    y2: number
  ): number => {
    const A = px - x1;
    const B = py - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    return Math.sqrt(Math.pow(px - xx, 2) + Math.pow(py - yy, 2));
  };

  // Handle map click - add or update markers
  const handleMapClick = useCallback((lat: number, lng: number) => {
    setMarkers(prev => {
      if (prev.length === 0) {
        return [{ id: 'start', type: 'start', lat, lng }];
      } else if (prev.length === 1) {
        const newMarkers: MapMarker[] = [
          prev[0],
          { id: 'end', type: 'end', lat, lng },
        ];
        return newMarkers;
      } else {
        // Replace the end marker
        const newMarkers: MapMarker[] = [
          prev[0],
          { id: 'end', type: 'end', lat, lng },
        ];
        return newMarkers;
      }
    });
  }, []);

  // Handle marker drag
  const handleMarkerDrag = useCallback((id: string, lat: number, lng: number) => {
    setMarkers(prev => prev.map(m => 
      m.id === id ? { ...m, lat, lng } : m
    ));
  }, []);

  // Calculate route when we have both markers
  const calculateRoute = useCallback(() => {
    const start = markers.find(m => m.type === 'start');
    const end = markers.find(m => m.type === 'end');
    
    if (start && end) {
      fetchRoute(start, end);
    }
  }, [markers, fetchRoute]);

  // Clear all markers and route
  const clearAll = useCallback(() => {
    setMarkers([]);
    setRoute(null);
    setExploredNodes([]);
  }, []);

  // Swap start and end markers
  const swapMarkers = useCallback(() => {
    setMarkers(prev => {
      if (prev.length !== 2) return prev;
      return prev.map(m => ({
        ...m,
        type: m.type === 'start' ? 'end' as const : 'start' as const,
        id: m.type === 'start' ? 'end' : 'start',
      }));
    });
    setRoute(null);
    setExploredNodes([]);
  }, []);

  return {
    markers,
    route,
    exploredNodes,
    showExplored,
    setShowExplored,
    handleMapClick,
    handleMarkerDrag,
    calculateRoute,
    clearAll,
    swapMarkers,
  };
}
