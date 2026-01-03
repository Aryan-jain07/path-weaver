/**
 * Toolbar - Graph editing tools and algorithm selection
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { 
  Plus, 
  Link, 
  MousePointer, 
  CircleDot,
  Target,
  Trash2,
  RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { AlgorithmType } from '@/core/types';

type ToolMode = 'select-source' | 'select-target' | 'add-node' | 'add-edge' | 'view';

interface ToolbarProps {
  mode: ToolMode;
  algorithm: AlgorithmType;
  sourceId: string | null;
  targetId: string | null;
  onModeChange: (mode: ToolMode) => void;
  onAlgorithmChange: (algorithm: AlgorithmType) => void;
  onClearGraph: () => void;
  onLoadSample: () => void;
}

export function Toolbar({
  mode,
  algorithm,
  sourceId,
  targetId,
  onModeChange,
  onAlgorithmChange,
  onClearGraph,
  onLoadSample,
}: ToolbarProps) {
  const tools: { mode: ToolMode; icon: React.ElementType; label: string; color?: string }[] = [
    { mode: 'view', icon: MousePointer, label: 'Select / Move' },
    { mode: 'add-node', icon: Plus, label: 'Add Node' },
    { mode: 'add-edge', icon: Link, label: 'Add Edge' },
    { mode: 'select-source', icon: CircleDot, label: 'Set Source', color: 'text-node-start' },
    { mode: 'select-target', icon: Target, label: 'Set Target', color: 'text-node-end' },
  ];
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Algorithm selector */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">Algorithm</div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => onAlgorithmChange('dijkstra')}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              algorithm === 'dijkstra'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Dijkstra
          </button>
          <button
            onClick={() => onAlgorithmChange('astar')}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              algorithm === 'astar'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            A*
          </button>
        </div>
      </div>
      
      {/* Tool buttons */}
      <div className="space-y-2">
        <div className="text-sm font-medium text-foreground">Tools</div>
        <div className="grid grid-cols-2 gap-2">
          {tools.map(({ mode: toolMode, icon: Icon, label, color }) => (
            <Button
              key={toolMode}
              variant={mode === toolMode ? 'default' : 'outline'}
              size="sm"
              onClick={() => onModeChange(toolMode)}
              className={cn(
                'justify-start gap-2',
                mode === toolMode && color
              )}
            >
              <Icon className={cn('h-4 w-4', color && mode !== toolMode && color)} />
              <span className="text-xs">{label}</span>
            </Button>
          ))}
        </div>
      </div>
      
      {/* Status display */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Source:</span>
          <span className={cn(
            'font-mono',
            sourceId ? 'text-node-start' : 'text-muted-foreground'
          )}>
            {sourceId || 'None'}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">Target:</span>
          <span className={cn(
            'font-mono',
            targetId ? 'text-node-end' : 'text-muted-foreground'
          )}>
            {targetId || 'None'}
          </span>
        </div>
      </div>
      
      {/* Graph actions */}
      <div className="flex gap-2 pt-2 border-t border-border">
        <Button
          variant="outline"
          size="sm"
          onClick={onLoadSample}
          className="flex-1"
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Sample
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={onClearGraph}
          className="flex-1 text-destructive hover:text-destructive"
        >
          <Trash2 className="h-4 w-4 mr-2" />
          Clear
        </Button>
      </div>
    </div>
  );
}
