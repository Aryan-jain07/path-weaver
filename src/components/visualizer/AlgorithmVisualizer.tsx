/**
 * AlgorithmVisualizer - Main component for Mode 1
 * Orchestrates graph editing, algorithm execution, and educational panels
 */

import React, { useState, useCallback } from 'react';
import { Graph, AlgorithmType, Node } from '@/core/types';
import { 
  createGraph, 
  createSampleGraph, 
  addNode, 
  addEdge,
  removeNode,
  generateNodeId,
  generateEdgeId,
  resetIdCounters,
  getEdgeBetween
} from '@/core/graph';
import { useAlgorithmVisualizer } from '@/hooks/useAlgorithmVisualizer';
import { GraphCanvas } from './GraphCanvas';
import { PseudocodePanel } from './PseudocodePanel';
import { InsightPanel } from './InsightPanel';
import { ControlPanel } from './ControlPanel';
import { Toolbar } from './Toolbar';
import { EdgeWeightDialog } from './EdgeWeightDialog';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { Button } from '@/components/ui/button';
import { Home } from 'lucide-react';

interface AlgorithmVisualizerProps {
  onBackToDashboard?: () => void;
}

type ToolMode = 'select-source' | 'select-target' | 'add-node' | 'add-edge' | 'view';

const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export function AlgorithmVisualizer({ onBackToDashboard }: AlgorithmVisualizerProps) {
  // Graph state
  const [graph, setGraph] = useState<Graph>(() => createSampleGraph());
  const [nodeCounter, setNodeCounter] = useState(6); // Sample graph has A-F
  
  // Selection state
  const [sourceId, setSourceId] = useState<string | null>('A');
  const [targetId, setTargetId] = useState<string | null>('F');
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  
  // Tool state
  const [mode, setMode] = useState<ToolMode>('view');
  const [algorithm, setAlgorithm] = useState<AlgorithmType>('dijkstra');
  const [edgeStartNode, setEdgeStartNode] = useState<string | null>(null);
  
  // Edge dialog state
  const [edgeDialogOpen, setEdgeDialogOpen] = useState(false);
  const [pendingEdge, setPendingEdge] = useState<{ source: string; target: string } | null>(null);
  
  // Algorithm visualizer hook
  const visualizer = useAlgorithmVisualizer({
    graph,
    sourceId,
    targetId,
    algorithm,
  });
  
  // Handle node click based on current mode
  const handleNodeClick = useCallback((nodeId: string) => {
    switch (mode) {
      case 'select-source':
        setSourceId(nodeId);
        visualizer.reset();
        break;
      case 'select-target':
        setTargetId(nodeId);
        visualizer.reset();
        break;
      case 'add-edge':
        if (!edgeStartNode) {
          setEdgeStartNode(nodeId);
        } else if (edgeStartNode !== nodeId) {
          // Check if edge already exists
          const existingEdge = getEdgeBetween(graph, edgeStartNode, nodeId);
          if (!existingEdge) {
            setPendingEdge({ source: edgeStartNode, target: nodeId });
            setEdgeDialogOpen(true);
          }
          setEdgeStartNode(null);
        }
        break;
      case 'view':
        setSelectedNodeId(nodeId === selectedNodeId ? null : nodeId);
        break;
    }
  }, [mode, edgeStartNode, graph, selectedNodeId, visualizer]);
  
  // Handle canvas click for adding nodes
  const handleCanvasClick = useCallback((x: number, y: number) => {
    if (mode === 'add-node') {
      const label = nodeCounter < 26 
        ? ALPHABET[nodeCounter] 
        : `N${nodeCounter - 25}`;
      
      const newNode: Node = {
        id: label,
        x,
        y,
        label,
      };
      
      setGraph(g => addNode(g, newNode));
      setNodeCounter(c => c + 1);
      visualizer.reset();
    }
  }, [mode, nodeCounter, visualizer]);
  
  // Handle node dragging
  const handleNodeDrag = useCallback((nodeId: string, x: number, y: number) => {
    setGraph(g => {
      const node = g.nodes.get(nodeId);
      if (!node) return g;
      
      const newNodes = new Map(g.nodes);
      newNodes.set(nodeId, { ...node, x, y });
      
      return { ...g, nodes: newNodes };
    });
  }, []);
  
  // Handle edge creation confirmation
  const handleEdgeConfirm = useCallback((weight: number) => {
    if (pendingEdge) {
      const edgeId = `${pendingEdge.source}${pendingEdge.target}`;
      setGraph(g => addEdge(g, {
        id: edgeId,
        source: pendingEdge.source,
        target: pendingEdge.target,
        weight,
      }));
      visualizer.reset();
    }
    setEdgeDialogOpen(false);
    setPendingEdge(null);
  }, [pendingEdge, visualizer]);
  
  // Clear graph
  const handleClearGraph = useCallback(() => {
    setGraph(createGraph(false));
    setSourceId(null);
    setTargetId(null);
    setSelectedNodeId(null);
    setNodeCounter(0);
    resetIdCounters();
    visualizer.reset();
  }, [visualizer]);
  
  // Load sample graph
  const handleLoadSample = useCallback(() => {
    setGraph(createSampleGraph());
    setSourceId('A');
    setTargetId('F');
    setNodeCounter(6);
    visualizer.reset();
  }, [visualizer]);
  
  // Check if we can start the algorithm
  const canStart = sourceId !== null && 
    graph.nodes.size > 0 && 
    (algorithm === 'dijkstra' || targetId !== null);
  
  return (
    <div className="h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="flex-shrink-0 border-b border-border bg-card px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-4">
            {onBackToDashboard && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={onBackToDashboard}
                className="gap-2"
              >
                <Home className="h-4 w-4" />
                Dashboard
              </Button>
            )}
            <div>
              <h1 className="text-xl font-semibold text-foreground">
                Algorithm Visualizer
              </h1>
              <p className="text-sm text-muted-foreground">
                Interactive shortest-path algorithm exploration
              </p>
            </div>
          </div>
          <div className="text-sm text-muted-foreground">
            <span className="font-mono">{graph.nodes.size}</span> nodes,{' '}
            <span className="font-mono">{graph.edges.size}</span> edges
          </div>
        </div>
      </header>
      
      {/* Main content with resizable panels */}
      <ResizablePanelGroup direction="horizontal" className="flex-1">
        {/* Left sidebar - Toolbar */}
        <ResizablePanel defaultSize={20} minSize={15} maxSize={30}>
          <aside className="h-full border-r border-border bg-sidebar p-4 overflow-y-auto">
            <Toolbar
              mode={mode}
              algorithm={algorithm}
              sourceId={sourceId}
              targetId={targetId}
              onModeChange={setMode}
              onAlgorithmChange={(alg) => {
                setAlgorithm(alg);
                visualizer.reset();
              }}
              onClearGraph={handleClearGraph}
              onLoadSample={handleLoadSample}
            />
            
            <div className="mt-4">
              <ControlPanel
                isRunning={visualizer.isRunning}
                isPaused={visualizer.isPaused}
                isComplete={visualizer.isComplete}
                canStart={canStart}
                currentStepIndex={visualizer.currentStepIndex}
                totalSteps={visualizer.steps.length}
                speed={visualizer.speed}
                explanationLevel={visualizer.explanationLevel}
                onStart={visualizer.start}
                onPause={visualizer.pause}
                onResume={visualizer.resume}
                onReset={visualizer.reset}
                onNextStep={visualizer.nextStep}
                onPrevStep={visualizer.prevStep}
                onSpeedChange={visualizer.setSpeed}
                onExplanationLevelChange={visualizer.setExplanationLevel}
              />
            </div>
          </aside>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Center - Graph canvas */}
        <ResizablePanel defaultSize={55} minSize={30}>
          <main className="h-full relative">
            <GraphCanvas
              graph={graph}
              currentStep={visualizer.currentStep}
              sourceId={sourceId}
              targetId={targetId}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              onCanvasClick={handleCanvasClick}
              onNodeDrag={handleNodeDrag}
              mode={mode}
              edgeStartNode={edgeStartNode}
            />
            
            {/* Mode indicator */}
            {mode !== 'view' && (
              <div className="absolute top-4 left-4 bg-primary text-primary-foreground px-3 py-1.5 rounded-full text-sm font-medium">
                {mode === 'add-node' && 'Click canvas to add node'}
                {mode === 'add-edge' && (edgeStartNode ? `Click second node (from ${edgeStartNode})` : 'Click first node')}
                {mode === 'select-source' && 'Click node to set as source'}
                {mode === 'select-target' && 'Click node to set as target'}
              </div>
            )}
          </main>
        </ResizablePanel>
        
        <ResizableHandle withHandle />
        
        {/* Right sidebar - Educational panels */}
        <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
          <aside className="h-full border-l border-border bg-sidebar flex flex-col">
            <div className="flex-1 border-b border-border overflow-hidden">
              <PseudocodePanel
                algorithm={algorithm}
                currentLine={visualizer.currentStep?.pseudocodeLine ?? -1}
              />
            </div>
            <div className="flex-1 overflow-hidden">
              <InsightPanel
                currentStep={visualizer.currentStep}
                explanationLevel={visualizer.explanationLevel}
              />
            </div>
          </aside>
        </ResizablePanel>
      </ResizablePanelGroup>
      
      {/* Edge weight dialog */}
      <EdgeWeightDialog
        open={edgeDialogOpen}
        sourceLabel={pendingEdge?.source ?? ''}
        targetLabel={pendingEdge?.target ?? ''}
        onConfirm={handleEdgeConfirm}
        onCancel={() => {
          setEdgeDialogOpen(false);
          setPendingEdge(null);
        }}
      />
    </div>
  );
}
