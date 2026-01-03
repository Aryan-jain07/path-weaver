/**
 * Custom hook for managing algorithm visualization state
 * Handles step generation, playback controls, and timing
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { Graph, AlgorithmStep, AlgorithmType, ExplanationLevel } from '@/core/types';
import { generateDijkstraSteps } from '@/core/algorithms/dijkstra';
import { generateAStarSteps, euclideanDistance } from '@/core/algorithms/astar';

interface UseAlgorithmVisualizerProps {
  graph: Graph;
  sourceId: string | null;
  targetId: string | null;
  algorithm: AlgorithmType;
}

interface UseAlgorithmVisualizerReturn {
  // State
  steps: AlgorithmStep[];
  currentStepIndex: number;
  isRunning: boolean;
  isPaused: boolean;
  isComplete: boolean;
  speed: number;
  explanationLevel: ExplanationLevel;
  
  // Current step data
  currentStep: AlgorithmStep | null;
  
  // Controls
  start: () => void;
  pause: () => void;
  resume: () => void;
  reset: () => void;
  nextStep: () => void;
  prevStep: () => void;
  goToStep: (index: number) => void;
  setSpeed: (speed: number) => void;
  setExplanationLevel: (level: ExplanationLevel) => void;
}

export function useAlgorithmVisualizer({
  graph,
  sourceId,
  targetId,
  algorithm,
}: UseAlgorithmVisualizerProps): UseAlgorithmVisualizerReturn {
  const [steps, setSteps] = useState<AlgorithmStep[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [speed, setSpeed] = useState(500); // ms between steps
  const [explanationLevel, setExplanationLevel] = useState<ExplanationLevel>('beginner');
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const stepsRef = useRef<AlgorithmStep[]>([]);
  
  // Generate all steps when algorithm starts
  const generateSteps = useCallback(() => {
    if (!sourceId || graph.nodes.size === 0) return [];
    
    const generator = algorithm === 'dijkstra'
      ? generateDijkstraSteps(graph, sourceId, targetId ?? undefined)
      : generateAStarSteps(graph, sourceId, targetId!, euclideanDistance);
    
    const allSteps: AlgorithmStep[] = [];
    for (const step of generator) {
      allSteps.push(step);
    }
    
    return allSteps;
  }, [graph, sourceId, targetId, algorithm]);
  
  // Clear timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);
  
  // Auto-advance when running
  useEffect(() => {
    if (isRunning && !isPaused && currentStepIndex < stepsRef.current.length - 1) {
      timerRef.current = setTimeout(() => {
        setCurrentStepIndex(prev => prev + 1);
      }, speed);
    } else if (currentStepIndex >= stepsRef.current.length - 1 && isRunning) {
      setIsRunning(false);
    }
    
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isRunning, isPaused, currentStepIndex, speed]);
  
  const start = useCallback(() => {
    if (!sourceId) return;
    if (algorithm === 'astar' && !targetId) return;
    
    const generatedSteps = generateSteps();
    setSteps(generatedSteps);
    stepsRef.current = generatedSteps;
    setCurrentStepIndex(0);
    setIsRunning(true);
    setIsPaused(false);
  }, [generateSteps, sourceId, targetId, algorithm]);
  
  const pause = useCallback(() => {
    setIsPaused(true);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);
  
  const resume = useCallback(() => {
    setIsPaused(false);
  }, []);
  
  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentStepIndex(-1);
    setSteps([]);
    stepsRef.current = [];
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);
  
  const nextStep = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    }
  }, [currentStepIndex, steps.length]);
  
  const prevStep = useCallback(() => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    }
  }, [currentStepIndex]);
  
  const goToStep = useCallback((index: number) => {
    if (index >= 0 && index < steps.length) {
      setCurrentStepIndex(index);
    }
  }, [steps.length]);
  
  const currentStep = currentStepIndex >= 0 && currentStepIndex < steps.length
    ? steps[currentStepIndex]
    : null;
  
  const isComplete = currentStepIndex >= 0 && 
    currentStepIndex === steps.length - 1 && 
    (currentStep?.type === 'complete' || currentStep?.type === 'path-found' || currentStep?.type === 'no-path');
  
  return {
    steps,
    currentStepIndex,
    isRunning,
    isPaused,
    isComplete,
    speed,
    explanationLevel,
    currentStep,
    start,
    pause,
    resume,
    reset,
    nextStep,
    prevStep,
    goToStep,
    setSpeed,
    setExplanationLevel,
  };
}
