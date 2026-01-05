/**
 * Index - Main application page
 * Manages mode switching between Visualizer and Map modes
 */

import React, { useState } from 'react';
import { AppMode } from '@/core/types';
import { ModeSelector } from '@/components/ModeSelector';
import { AlgorithmVisualizer } from '@/components/visualizer/AlgorithmVisualizer';
import { MapView } from '@/components/map/MapView';

const Index = () => {
  const [mode, setMode] = useState<AppMode | null>(null);
  
  const handleBackToDashboard = () => setMode(null);
  
  if (!mode) {
    return <ModeSelector onSelectMode={setMode} />;
  }
  
  if (mode === 'visualizer') {
    return <AlgorithmVisualizer onBackToDashboard={handleBackToDashboard} />;
  }
  
  return <MapView onBackToDashboard={handleBackToDashboard} />;
};

export default Index;
