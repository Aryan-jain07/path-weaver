/**
 * MapControlPanel - Controls for the map routing interface
 */

import React from 'react';
import { 
  Navigation, 
  Trash2, 
  ArrowUpDown, 
  Map, 
  Eye,
  EyeOff,
  Clock,
  Route,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { MapMarker, RouteData } from './LeafletMap';

interface MapControlPanelProps {
  markers: MapMarker[];
  route: RouteData | null;
  showExplored: boolean;
  onShowExploredChange: (show: boolean) => void;
  onCalculateRoute: () => void;
  onClear: () => void;
  onSwap: () => void;
}

function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  return `${(meters / 1000).toFixed(1)} km`;
}

function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${remainingMinutes}m`;
}

export function MapControlPanel({
  markers,
  route,
  showExplored,
  onShowExploredChange,
  onCalculateRoute,
  onClear,
  onSwap,
}: MapControlPanelProps) {
  const startMarker = markers.find(m => m.type === 'start');
  const endMarker = markers.find(m => m.type === 'end');
  const canCalculate = startMarker && endMarker && !route?.isLoading;

  return (
    <div className="space-y-4">
      {/* Instructions */}
      <section className="bg-muted/30 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
          <Map className="w-4 h-4" />
          How to Use
        </h3>
        <ol className="text-xs text-muted-foreground space-y-1.5 list-decimal list-inside">
          <li>Click on the map to place your <span className="text-emerald-400 font-medium">start point (A)</span></li>
          <li>Click again to place your <span className="text-rose-400 font-medium">end point (B)</span></li>
          <li>Click "Find Route" to calculate the shortest path</li>
          <li>Drag markers to adjust positions</li>
        </ol>
      </section>

      {/* Marker Status */}
      <section className="space-y-2">
        <h3 className="text-sm font-semibold text-foreground">Waypoints</h3>
        
        <div className="bg-card rounded-lg border border-border p-3 space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              A
            </div>
            <div className="flex-1 min-w-0">
              {startMarker ? (
                <p className="text-xs text-foreground truncate">
                  {startMarker.lat.toFixed(5)}, {startMarker.lng.toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Click map to set start</p>
              )}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs font-bold">
              B
            </div>
            <div className="flex-1 min-w-0">
              {endMarker ? (
                <p className="text-xs text-foreground truncate">
                  {endMarker.lat.toFixed(5)}, {endMarker.lng.toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Click map to set destination</p>
              )}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onSwap}
            disabled={markers.length < 2}
            className="flex-1"
          >
            <ArrowUpDown className="w-3 h-3 mr-1" />
            Swap
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onClear}
            disabled={markers.length === 0}
            className="flex-1"
          >
            <Trash2 className="w-3 h-3 mr-1" />
            Clear
          </Button>
        </div>
      </section>

      {/* Calculate Route Button */}
      <Button 
        onClick={onCalculateRoute}
        disabled={!canCalculate}
        className="w-full"
        size="lg"
      >
        {route?.isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            Calculating...
          </>
        ) : (
          <>
            <Navigation className="w-4 h-4 mr-2" />
            Find Route
          </>
        )}
      </Button>

      {/* Route Results */}
      {route && !route.isLoading && (
        <section className="space-y-3">
          {route.error ? (
            <div className="bg-destructive/10 text-destructive rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Route Error</p>
                <p className="text-xs mt-0.5">{route.error}</p>
                <p className="text-xs mt-2 text-muted-foreground">
                  Tip: Make sure both points are on or near roads. The routing service works globally.
                </p>
              </div>
            </div>
          ) : (
            <>
              <h3 className="text-sm font-semibold text-foreground">Route Info</h3>
              
              <div className="bg-card rounded-lg border border-border p-3">
                <div className="flex items-center gap-2 text-muted-foreground mb-1">
                  <Route className="w-3 h-3" />
                  <span className="text-xs">Distance</span>
                </div>
                <p className="text-lg font-semibold text-foreground">
                  {formatDistance(route.distance)}
                </p>
              </div>

              {/* Show Explored Toggle */}
              <div className="flex items-center justify-between bg-card rounded-lg border border-border p-3">
                <div className="flex items-center gap-2">
                  {showExplored ? (
                    <Eye className="w-4 h-4 text-amber-500" />
                  ) : (
                    <EyeOff className="w-4 h-4 text-muted-foreground" />
                  )}
                  <Label htmlFor="show-explored" className="text-sm cursor-pointer">
                    Show explored nodes
                  </Label>
                </div>
                <Switch
                  id="show-explored"
                  checked={showExplored}
                  onCheckedChange={onShowExploredChange}
                />
              </div>
              
              {showExplored && (
                <p className="text-xs text-muted-foreground">
                  Orange dots represent nodes the algorithm explored while searching for the optimal path. 
                  A* uses a heuristic to focus the search toward the destination.
                </p>
              )}
            </>
          )}
        </section>
      )}
    </div>
  );
}
