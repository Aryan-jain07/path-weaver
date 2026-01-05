/**
 * MapInfoPanel - Educational information about map-based pathfinding
 */

import React from 'react';
import { 
  BookOpen, 
  Network, 
  Compass, 
  Cpu,
  Globe,
  Route
} from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function MapInfoPanel() {
  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
        <BookOpen className="w-4 h-4" />
        Learn About Map Routing
      </h3>

      <Tabs defaultValue="graph" className="w-full">
        <TabsList className="grid w-full grid-cols-3 h-auto">
          <TabsTrigger value="graph" className="text-xs py-1.5">Graph</TabsTrigger>
          <TabsTrigger value="astar" className="text-xs py-1.5">A*</TabsTrigger>
          <TabsTrigger value="haversine" className="text-xs py-1.5">Haversine</TabsTrigger>
        </TabsList>

        <TabsContent value="graph" className="mt-3 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Network className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Maps as Graphs</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Road networks are naturally represented as weighted graphs:
              </p>
            </div>
          </div>
          
          <div className="bg-muted/30 rounded-lg p-3 space-y-2 text-xs">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-primary"></div>
              <span className="text-foreground font-medium">Nodes</span>
              <span className="text-muted-foreground">= Intersections</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-0.5 bg-primary"></div>
              <span className="text-foreground font-medium">Edges</span>
              <span className="text-muted-foreground">= Road segments</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-primary font-mono">w</span>
              <span className="text-foreground font-medium">Weights</span>
              <span className="text-muted-foreground">= Distance or travel time</span>
            </div>
          </div>

          <p className="text-xs text-muted-foreground">
            OpenStreetMap data provides the real-world coordinates and road information 
            that gets converted into this graph structure.
          </p>
        </TabsContent>

        <TabsContent value="astar" className="mt-3 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Compass className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Why A* for Maps?</h4>
              <p className="text-xs text-muted-foreground mt-1">
                A* is preferred over Dijkstra for geographic routing because it uses a heuristic 
                to guide the search toward the destination.
              </p>
            </div>
          </div>

          <div className="bg-muted/30 rounded-lg p-3 space-y-2">
            <p className="text-xs text-foreground font-medium">Key formula:</p>
            <code className="block text-xs font-mono text-primary bg-code-bg rounded px-2 py-1">
              f(n) = g(n) + h(n)
            </code>
            <ul className="text-xs text-muted-foreground space-y-1 mt-2">
              <li><code className="text-primary">g(n)</code> = actual cost from start to n</li>
              <li><code className="text-primary">h(n)</code> = estimated cost from n to goal</li>
              <li><code className="text-primary">f(n)</code> = estimated total cost through n</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            For maps, <code className="text-primary">h(n)</code> is typically the straight-line 
            distance to the destination, calculated using the Haversine formula.
          </p>
        </TabsContent>

        <TabsContent value="haversine" className="mt-3 space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h4 className="text-sm font-medium text-foreground">Haversine Formula</h4>
              <p className="text-xs text-muted-foreground mt-1">
                Calculates the great-circle distance between two points on Earth's surface.
              </p>
            </div>
          </div>

          <div className="bg-code-bg rounded-lg p-3">
            <code className="block text-xs font-mono text-muted-foreground leading-relaxed">
              <span className="text-primary">a</span> = sin²(Δφ/2) + cos(φ₁)·cos(φ₂)·sin²(Δλ/2)
              <br />
              <span className="text-primary">c</span> = 2·atan2(√a, √(1-a))
              <br />
              <span className="text-primary">d</span> = R·c
            </code>
          </div>

          <div className="text-xs text-muted-foreground space-y-1">
            <p>Where:</p>
            <ul className="pl-4 space-y-0.5">
              <li>• φ = latitude in radians</li>
              <li>• λ = longitude in radians</li>
              <li>• R = Earth's radius (≈6,371 km)</li>
              <li>• d = distance between points</li>
            </ul>
          </div>

          <p className="text-xs text-muted-foreground">
            This gives an admissible heuristic because the straight-line distance is always 
            ≤ the actual road distance, ensuring A* finds the optimal path.
          </p>
        </TabsContent>
      </Tabs>

      {/* Performance Note */}
      <section className="border-t border-border pt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Cpu className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Performance</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Real routing engines use techniques like contraction hierarchies to preprocess 
              graphs, enabling continent-scale routing in milliseconds.
            </p>
          </div>
        </div>
      </section>

      {/* Data Source */}
      <section className="border-t border-border pt-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
            <Route className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-foreground">Data Source</h4>
            <p className="text-xs text-muted-foreground mt-1">
              Routes are calculated using OSRM (Open Source Routing Machine) with 
              OpenStreetMap road network data.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
