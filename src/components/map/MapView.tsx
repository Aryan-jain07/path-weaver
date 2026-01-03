/**
 * MapView - Real-world map shortest path finder (Mode 2)
 * Foundation for map-based pathfinding
 */

import React from 'react';
import { Map, Navigation, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MapViewProps {
  onSwitchMode: () => void;
}

export function MapView({ onSwitchMode }: MapViewProps) {
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              Real-World Pathfinding
            </h1>
            <p className="text-sm text-muted-foreground">
              Apply shortest-path algorithms to real maps
            </p>
          </div>
          <Button variant="outline" onClick={onSwitchMode}>
            <Navigation className="h-4 w-4 mr-2" />
            Switch to Visualizer
          </Button>
        </div>
      </header>
      
      {/* Main content */}
      <div className="flex-1 flex">
        {/* Map placeholder */}
        <main className="flex-1 relative bg-muted flex items-center justify-center">
          <div className="text-center max-w-md p-8">
            <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Map className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-lg font-semibold text-foreground mb-2">
              Map Mode Coming Soon
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              This mode will allow you to apply the same shortest-path algorithms 
              to real-world maps using OpenStreetMap data.
            </p>
            
            <div className="bg-card border border-border rounded-lg p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-sm font-medium text-foreground">
                    How it will work:
                  </h3>
                  <ul className="text-xs text-muted-foreground mt-1 space-y-1">
                    <li>• Click to select start and end points</li>
                    <li>• Road network converted to weighted graph</li>
                    <li>• Same A* algorithm with Haversine heuristic</li>
                    <li>• Visualize explored nodes on the map</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <Button 
              className="mt-6" 
              onClick={onSwitchMode}
            >
              Try the Algorithm Visualizer
            </Button>
          </div>
        </main>
        
        {/* Info sidebar */}
        <aside className="w-80 flex-shrink-0 border-l border-border bg-sidebar p-4 overflow-y-auto">
          <div className="space-y-6">
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Understanding Map Graphs
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real-world maps are represented as weighted graphs where 
                intersections become nodes and road segments become edges. 
                Edge weights can represent distance or travel time.
              </p>
            </section>
            
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Why A* for Maps?
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                A* is preferred over Dijkstra for map routing because the 
                heuristic (straight-line distance to goal) guides the search 
                toward the destination, exploring fewer nodes overall.
              </p>
            </section>
            
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Haversine Formula
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                For geographic coordinates, we use the Haversine formula to 
                calculate straight-line distance between two points on Earth's 
                surface, accounting for the planet's curvature.
              </p>
              <code className="block mt-2 p-2 bg-code-bg rounded text-xs font-mono text-muted-foreground">
                d = 2R × arcsin(√(sin²(Δφ/2) + cos(φ1)cos(φ2)sin²(Δλ/2)))
              </code>
            </section>
            
            <section>
              <h3 className="text-sm font-semibold text-foreground mb-3">
                Performance Considerations
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Real maps can have millions of nodes. Efficient implementations use:
              </p>
              <ul className="text-xs text-muted-foreground mt-2 space-y-1">
                <li>• Fibonacci heaps for O(1) decrease-key</li>
                <li>• Contraction hierarchies for preprocessing</li>
                <li>• Grid-based spatial indexing</li>
              </ul>
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
