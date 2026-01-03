/**
 * InsightPanel - Educational explanations for each algorithm step
 */

import React from 'react';
import { AlgorithmStep, ExplanationLevel } from '@/core/types';
import { cn } from '@/lib/utils';
import { Lightbulb, ArrowRight, Check, X, Circle } from 'lucide-react';

interface InsightPanelProps {
  currentStep: AlgorithmStep | null;
  explanationLevel: ExplanationLevel;
}

export function InsightPanel({ currentStep, explanationLevel }: InsightPanelProps) {
  if (!currentStep) {
    return (
      <div className="h-full flex items-center justify-center text-muted-foreground">
        <div className="text-center">
          <Lightbulb className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">Run the algorithm to see insights</p>
        </div>
      </div>
    );
  }
  
  const getStepIcon = () => {
    switch (currentStep.type) {
      case 'init':
        return <Circle className="w-5 h-5 text-primary" />;
      case 'select-node':
        return <ArrowRight className="w-5 h-5 text-node-current" />;
      case 'relax-edge':
        return <Check className="w-5 h-5 text-node-visited" />;
      case 'skip-edge':
        return <X className="w-5 h-5 text-destructive" />;
      case 'path-found':
        return <Check className="w-5 h-5 text-accent" />;
      default:
        return <Lightbulb className="w-5 h-5 text-primary" />;
    }
  };
  
  const getStepTitle = () => {
    switch (currentStep.type) {
      case 'init': return 'Initialization';
      case 'select-node': return 'Node Selection';
      case 'examine-edge': return 'Examining Edge';
      case 'relax-edge': return 'Edge Relaxation';
      case 'skip-edge': return 'Edge Skipped';
      case 'mark-visited': return 'Node Visited';
      case 'path-found': return 'Path Found!';
      case 'no-path': return 'No Path Exists';
      case 'complete': return 'Algorithm Complete';
      default: return 'Step';
    }
  };
  
  const explanation = explanationLevel === 'beginner'
    ? currentStep.explanation.beginner
    : currentStep.explanation.advanced;
  
  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border">
        {getStepIcon()}
        <h3 className="text-sm font-semibold text-foreground">
          {getStepTitle()}
        </h3>
      </div>
      
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {/* Main explanation */}
        <p className="text-sm text-foreground leading-relaxed animate-fade-in">
          {explanation}
        </p>
        
        {/* Edge details if applicable */}
        {currentStep.currentEdge && (
          <div className="bg-muted/50 rounded-lg p-3 space-y-2 animate-slide-in">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Edge Details
            </div>
            <div className="grid grid-cols-2 gap-2 text-sm font-mono">
              <div>
                <span className="text-muted-foreground">From: </span>
                <span className="text-foreground">{currentStep.currentEdge.from}</span>
              </div>
              <div>
                <span className="text-muted-foreground">To: </span>
                <span className="text-foreground">{currentStep.currentEdge.to}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Weight: </span>
                <span className="text-foreground">{currentStep.currentEdge.weight}</span>
              </div>
              <div>
                <span className="text-muted-foreground">New dist: </span>
                <span className={cn(
                  currentStep.currentEdge.wasRelaxed ? 'text-node-visited' : 'text-destructive'
                )}>
                  {currentStep.currentEdge.newDistance.toFixed(1)}
                </span>
              </div>
            </div>
            {currentStep.currentEdge.wasRelaxed ? (
              <div className="flex items-center gap-1 text-xs text-node-visited">
                <Check className="w-3 h-3" />
                Distance improved!
              </div>
            ) : (
              <div className="flex items-center gap-1 text-xs text-destructive">
                <X className="w-3 h-3" />
                Not an improvement
              </div>
            )}
          </div>
        )}
        
        {/* Queue state */}
        {currentStep.queue.length > 0 && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Priority Queue
            </div>
            <div className="flex flex-wrap gap-1">
              {currentStep.queue.slice(0, 6).map((item, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs font-mono rounded"
                >
                  {item.nodeId}:{item.priority.toFixed(1)}
                </span>
              ))}
              {currentStep.queue.length > 6 && (
                <span className="px-2 py-1 text-muted-foreground text-xs">
                  +{currentStep.queue.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}
        
        {/* Final path */}
        {currentStep.shortestPath && (
          <div className="space-y-2">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Shortest Path
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentStep.shortestPath.map((nodeId, i) => (
                <React.Fragment key={nodeId}>
                  <span className="px-2 py-1 bg-accent/20 text-accent text-sm font-mono rounded">
                    {nodeId}
                  </span>
                  {i < currentStep.shortestPath!.length - 1 && (
                    <ArrowRight className="w-4 h-4 text-muted-foreground" />
                  )}
                </React.Fragment>
              ))}
            </div>
            <div className="text-sm text-muted-foreground">
              Total distance: <span className="text-accent font-mono">{currentStep.totalDistance?.toFixed(1)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
