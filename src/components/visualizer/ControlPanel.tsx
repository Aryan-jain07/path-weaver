/**
 * ControlPanel - Playback controls and settings for visualization
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack, 
  RotateCcw,
  Gauge
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ExplanationLevel } from '@/core/types';

interface ControlPanelProps {
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  canStart: boolean;
  currentStepIndex: number;
  totalSteps: number;
  speed: number;
  explanationLevel: ExplanationLevel;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onReset: () => void;
  onNextStep: () => void;
  onPrevStep: () => void;
  onSpeedChange: (speed: number) => void;
  onExplanationLevelChange: (level: ExplanationLevel) => void;
}

export function ControlPanel({
  isRunning,
  isPaused,
  isComplete,
  canStart,
  currentStepIndex,
  totalSteps,
  speed,
  explanationLevel,
  onStart,
  onPause,
  onResume,
  onReset,
  onNextStep,
  onPrevStep,
  onSpeedChange,
  onExplanationLevelChange,
}: ControlPanelProps) {
  const hasStarted = currentStepIndex >= 0;
  
  return (
    <div className="bg-card border border-border rounded-lg p-4 space-y-4">
      {/* Playback controls */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant="outline"
          size="icon"
          onClick={onPrevStep}
          disabled={!hasStarted || currentStepIndex === 0}
          title="Previous Step"
        >
          <SkipBack className="h-4 w-4" />
        </Button>
        
        {!isRunning || isPaused ? (
          <Button
            size="icon"
            onClick={hasStarted && !isComplete ? onResume : onStart}
            disabled={!canStart}
            className="w-12 h-12"
            title={hasStarted ? 'Resume' : 'Start'}
          >
            <Play className="h-5 w-5" />
          </Button>
        ) : (
          <Button
            size="icon"
            onClick={onPause}
            className="w-12 h-12"
            title="Pause"
          >
            <Pause className="h-5 w-5" />
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          onClick={onNextStep}
          disabled={!hasStarted || currentStepIndex >= totalSteps - 1}
          title="Next Step"
        >
          <SkipForward className="h-4 w-4" />
        </Button>
        
        <Button
          variant="outline"
          size="icon"
          onClick={onReset}
          disabled={!hasStarted}
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
      </div>
      
      {/* Progress indicator */}
      {hasStarted && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Step {currentStepIndex + 1} of {totalSteps}</span>
            <span>{Math.round((currentStepIndex + 1) / totalSteps * 100)}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary transition-all duration-200"
              style={{ width: `${(currentStepIndex + 1) / totalSteps * 100}%` }}
            />
          </div>
        </div>
      )}
      
      {/* Speed control */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Gauge className="h-4 w-4" />
            <span>Speed</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground">
            {speed}ms
          </span>
        </div>
        <Slider
          value={[speed]}
          onValueChange={([value]) => onSpeedChange(value)}
          min={100}
          max={2000}
          step={100}
          className="w-full"
        />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Faster</span>
          <span>Slower</span>
        </div>
      </div>
      
      {/* Explanation level toggle */}
      <div className="space-y-2">
        <div className="text-sm text-muted-foreground">Explanation Level</div>
        <div className="flex rounded-lg border border-border overflow-hidden">
          <button
            onClick={() => onExplanationLevelChange('beginner')}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              explanationLevel === 'beginner'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Beginner
          </button>
          <button
            onClick={() => onExplanationLevelChange('advanced')}
            className={cn(
              'flex-1 py-2 text-sm font-medium transition-colors',
              explanationLevel === 'advanced'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:text-foreground'
            )}
          >
            Advanced
          </button>
        </div>
      </div>
    </div>
  );
}
