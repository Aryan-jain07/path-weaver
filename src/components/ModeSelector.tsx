/**
 * ModeSelector - Landing page to choose between Visualizer and Map modes
 */

import React from 'react';
import { AppMode } from '@/core/types';
import { Network, Map, ArrowRight, BookOpen, Code, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ModeSelectorProps {
  onSelectMode: (mode: AppMode) => void;
}

export function ModeSelector({ onSelectMode }: ModeSelectorProps) {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="max-w-5xl mx-auto px-6 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <Network className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                PathFinder
              </h1>
              <p className="text-sm text-muted-foreground">
                Educational Shortest-Path Algorithm Explorer
              </p>
            </div>
          </div>
        </div>
      </header>
      
      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-6">
        <div className="max-w-4xl w-full">
          {/* Mode cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {/* Visualizer Mode */}
            <button
              onClick={() => onSelectMode('visualizer')}
              className={cn(
                'group relative bg-card border border-border rounded-xl p-6 text-left',
                'hover:border-primary/50 hover:bg-card/80 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Network className="w-6 h-6 text-primary" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Algorithm Visualizer
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Learn how Dijkstra and A* work step-by-step with interactive 
                graph building and detailed explanations.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  Interactive Graph
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  Step-by-Step
                </span>
                <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded">
                  Pseudocode
                </span>
              </div>
            </button>
            
            {/* Map Mode */}
            <button
              onClick={() => onSelectMode('map')}
              className={cn(
                'group relative bg-card border border-border rounded-xl p-6 text-left',
                'hover:border-primary/50 hover:bg-card/80 transition-all duration-200',
                'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background'
              )}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Map className="w-6 h-6 text-accent" />
                </div>
                <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
              </div>
              
              <h2 className="text-lg font-semibold text-foreground mb-2">
                Real-World Pathfinding
              </h2>
              <p className="text-sm text-muted-foreground mb-4">
                Apply shortest-path algorithms to real maps. See how 
                roads become graphs and routes are calculated.
              </p>
              
              <div className="flex flex-wrap gap-2">
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                  Real Maps
                </span>
                <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded">
                  A* + Haversine
                </span>
                <span className="px-2 py-1 bg-muted text-muted-foreground text-xs rounded">
                  Coming Soon
                </span>
              </div>
            </button>
          </div>
          
          {/* Feature highlights */}
          <div className="grid md:grid-cols-3 gap-6">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Educational First</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Clear explanations at beginner and advanced levels
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Code className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Clean Architecture</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Algorithm logic fully decoupled from UI
                </p>
              </div>
            </div>
            
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                <Layers className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-foreground">Extensible Design</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Easy to add new algorithms and visualizations
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="border-t border-border py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center justify-between text-xs text-muted-foreground">
          <span>Built for algorithm understanding and portfolio showcasing</span>
          <span>Dijkstra & A* Visualizations</span>
        </div>
      </footer>
    </div>
  );
}
