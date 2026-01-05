/**
 * MapView - Real-world map shortest path finder (Mode 2)
 * Interactive map with click-to-place markers and route visualization
 */

import React from 'react';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { LeafletMap } from './LeafletMap';
import { MapControlPanel } from './MapControlPanel';
import { MapInfoPanel } from './MapInfoPanel';
import { useMapRouting } from '@/hooks/useMapRouting';

interface MapViewProps {
  onBackToDashboard?: () => void;
}

export function MapView({ onBackToDashboard }: MapViewProps) {
  const {
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
  } = useMapRouting();

  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackToDashboard}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Real-World Pathfinding
              </h1>
              <p className="text-sm text-muted-foreground">
                Find shortest paths on real maps using A* algorithm
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Map */}
        <main className="flex-1 relative">
          <LeafletMap
            markers={markers}
            route={route}
            exploredNodes={exploredNodes}
            showExplored={showExplored}
            onMapClick={handleMapClick}
            onMarkerDrag={handleMarkerDrag}
          />
          
          {/* Map attribution overlay */}
          <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 backdrop-blur-sm px-2 py-1 rounded">
            Powered by OpenStreetMap & OSRM
          </div>
        </main>
        
        {/* Sidebar */}
        <aside className="w-80 flex-shrink-0 border-l border-border bg-sidebar overflow-y-auto">
          <div className="p-4 space-y-6">
            {/* Control Panel */}
            <MapControlPanel
              markers={markers}
              route={route}
              showExplored={showExplored}
              onShowExploredChange={setShowExplored}
              onCalculateRoute={calculateRoute}
              onClear={clearAll}
              onSwap={swapMarkers}
            />
            
            {/* Divider */}
            <div className="border-t border-border" />
            
            {/* Info Panel */}
            <MapInfoPanel />
          </div>
        </aside>
      </div>
    </div>
  );
}
