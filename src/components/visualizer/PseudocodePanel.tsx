/**
 * PseudocodePanel - Displays algorithm pseudocode with line highlighting
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { AlgorithmType } from '@/core/types';
import { DIJKSTRA_PSEUDOCODE } from '@/core/algorithms/dijkstra';
import { ASTAR_PSEUDOCODE } from '@/core/algorithms/astar';

interface PseudocodePanelProps {
  algorithm: AlgorithmType;
  currentLine: number;
}

export function PseudocodePanel({ algorithm, currentLine }: PseudocodePanelProps) {
  const pseudocode = algorithm === 'dijkstra' ? DIJKSTRA_PSEUDOCODE : ASTAR_PSEUDOCODE;
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">
          {algorithm === 'dijkstra' ? "Dijkstra's Algorithm" : 'A* Algorithm'}
        </h3>
        <span className="text-xs text-muted-foreground font-mono">
          Line {currentLine + 1}
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <pre className="p-4 text-sm">
          {pseudocode.map((line, index) => (
            <div
              key={index}
              className={cn(
                'flex items-center py-0.5 px-2 -mx-2 rounded transition-all duration-200',
                index === currentLine && 'bg-code-highlight border-l-2 border-code-active'
              )}
            >
              <span className="w-6 text-right text-muted-foreground text-xs mr-4 select-none">
                {index + 1}
              </span>
              <code
                className={cn(
                  'font-mono whitespace-pre',
                  index === currentLine ? 'text-primary font-medium' : 'text-muted-foreground'
                )}
              >
                {line || ' '}
              </code>
            </div>
          ))}
        </pre>
      </div>
    </div>
  );
}
