/**
 * GraphCanvas - SVG-based graph rendering component
 * Handles node/edge visualization and user interactions
 */

import React, { useCallback, useState } from 'react';
import { Graph, Node, Edge, NodeState, EdgeState, AlgorithmStep } from '@/core/types';
import { cn } from '@/lib/utils';

interface GraphCanvasProps {
  graph: Graph;
  currentStep: AlgorithmStep | null;
  sourceId: string | null;
  targetId: string | null;
  selectedNodeId: string | null;
  onNodeClick: (nodeId: string) => void;
  onCanvasClick: (x: number, y: number) => void;
  onNodeDrag: (nodeId: string, x: number, y: number) => void;
  mode: 'select-source' | 'select-target' | 'add-node' | 'add-edge' | 'view';
  edgeStartNode: string | null;
}

const NODE_RADIUS = 24;

export function GraphCanvas({
  graph,
  currentStep,
  sourceId,
  targetId,
  selectedNodeId,
  onNodeClick,
  onCanvasClick,
  onNodeDrag,
  mode,
  edgeStartNode,
}: GraphCanvasProps) {
  const [draggingNode, setDraggingNode] = useState<string | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  
  const getNodeState = useCallback((nodeId: string): NodeState => {
    if (currentStep?.nodeStates.has(nodeId)) {
      return currentStep.nodeStates.get(nodeId)!;
    }
    if (nodeId === sourceId) return 'start';
    if (nodeId === targetId) return 'end';
    return 'default';
  }, [currentStep, sourceId, targetId]);
  
  const getEdgeState = useCallback((edgeId: string): EdgeState => {
    if (currentStep?.edgeStates.has(edgeId)) {
      return currentStep.edgeStates.get(edgeId)!;
    }
    return 'default';
  }, [currentStep]);
  
  const getNodeColor = (state: NodeState): string => {
    switch (state) {
      case 'start': return 'hsl(var(--node-start))';
      case 'end': return 'hsl(var(--node-end))';
      case 'current': return 'hsl(var(--node-current))';
      case 'visited': return 'hsl(var(--node-visited))';
      case 'in-queue': return 'hsl(var(--primary) / 0.5)';
      case 'path': return 'hsl(var(--node-path))';
      default: return 'hsl(var(--node-default))';
    }
  };
  
  const getEdgeColor = (state: EdgeState): string => {
    switch (state) {
      case 'considering': return 'hsl(var(--primary))';
      case 'relaxed': return 'hsl(var(--edge-relaxed))';
      case 'rejected': return 'hsl(var(--destructive) / 0.5)';
      case 'path': return 'hsl(var(--edge-path))';
      default: return 'hsl(var(--edge-default))';
    }
  };
  
  const getEdgeWidth = (state: EdgeState): number => {
    switch (state) {
      case 'path': return 4;
      case 'considering':
      case 'relaxed': return 3;
      default: return 2;
    }
  };
  
  const getDistance = (nodeId: string): string => {
    if (!currentStep) return '';
    const dist = currentStep.distances.get(nodeId);
    if (dist === undefined || dist === Infinity) return '∞';
    return dist.toFixed(1);
  };
  
  const handleSvgClick = (e: React.MouseEvent<SVGSVGElement>) => {
    if (mode === 'add-node') {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onCanvasClick(x, y);
    }
  };
  
  const handleNodeMouseDown = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    
    if (mode === 'view') {
      const node = graph.nodes.get(nodeId);
      if (node) {
        setDraggingNode(nodeId);
        setDragOffset({
          x: e.clientX - node.x,
          y: e.clientY - node.y,
        });
      }
    }
  };
  
  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (draggingNode) {
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      onNodeDrag(draggingNode, x, y);
    }
  };
  
  const handleMouseUp = () => {
    setDraggingNode(null);
  };
  
  const handleNodeClick = (e: React.MouseEvent, nodeId: string) => {
    e.stopPropagation();
    if (!draggingNode) {
      onNodeClick(nodeId);
    }
  };
  
  // Render edges
  const renderEdges = () => {
    const edges: JSX.Element[] = [];
    
    for (const [edgeId, edge] of graph.edges) {
      const sourceNode = graph.nodes.get(edge.source);
      const targetNode = graph.nodes.get(edge.target);
      
      if (!sourceNode || !targetNode) continue;
      
      const state = getEdgeState(edgeId);
      const color = getEdgeColor(state);
      const width = getEdgeWidth(state);
      
      // Calculate edge midpoint for weight label
      const midX = (sourceNode.x + targetNode.x) / 2;
      const midY = (sourceNode.y + targetNode.y) / 2;
      
      // Calculate direction for arrow
      const dx = targetNode.x - sourceNode.x;
      const dy = targetNode.y - sourceNode.y;
      const length = Math.sqrt(dx * dx + dy * dy);
      const unitX = dx / length;
      const unitY = dy / length;
      
      // Offset start and end to not overlap with nodes
      const startX = sourceNode.x + unitX * NODE_RADIUS;
      const startY = sourceNode.y + unitY * NODE_RADIUS;
      const endX = targetNode.x - unitX * NODE_RADIUS;
      const endY = targetNode.y - unitY * NODE_RADIUS;
      
      edges.push(
        <g key={edgeId}>
          <line
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke={color}
            strokeWidth={width}
            className={cn(
              'transition-all duration-200',
              state === 'path' && 'edge-animate'
            )}
            strokeDasharray={state === 'path' ? '100' : undefined}
          />
          
          {/* Weight label */}
          <g transform={`translate(${midX}, ${midY})`}>
            <rect
              x={-12}
              y={-10}
              width={24}
              height={20}
              rx={4}
              fill="hsl(var(--card))"
              stroke="hsl(var(--border))"
              strokeWidth={1}
            />
            <text
              textAnchor="middle"
              dominantBaseline="middle"
              className="fill-foreground text-xs font-mono"
            >
              {edge.weight}
            </text>
          </g>
          
          {/* Arrow for directed graphs */}
          {graph.directed && (
            <polygon
              points={`0,-6 12,0 0,6`}
              fill={color}
              transform={`translate(${endX}, ${endY}) rotate(${Math.atan2(dy, dx) * 180 / Math.PI})`}
            />
          )}
        </g>
      );
    }
    
    return edges;
  };
  
  // Render nodes
  const renderNodes = () => {
    const nodes: JSX.Element[] = [];
    
    for (const [nodeId, node] of graph.nodes) {
      const state = getNodeState(nodeId);
      const color = getNodeColor(state);
      const distance = getDistance(nodeId);
      const isSelected = nodeId === selectedNodeId || nodeId === edgeStartNode;
      const isCurrent = state === 'current';
      
      nodes.push(
        <g
          key={nodeId}
          transform={`translate(${node.x}, ${node.y})`}
          className={cn(
            'cursor-pointer transition-transform',
            draggingNode === nodeId && 'cursor-grabbing'
          )}
          onMouseDown={(e) => handleNodeMouseDown(e, nodeId)}
          onClick={(e) => handleNodeClick(e, nodeId)}
        >
          {/* Pulse animation for current node */}
          {isCurrent && (
            <circle
              r={NODE_RADIUS + 8}
              fill="none"
              stroke={color}
              strokeWidth={2}
              opacity={0.5}
              className="node-pulse"
            />
          )}
          
          {/* Selection ring */}
          {isSelected && (
            <circle
              r={NODE_RADIUS + 4}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth={2}
              strokeDasharray="4 2"
            />
          )}
          
          {/* Main node circle */}
          <circle
            r={NODE_RADIUS}
            fill={color}
            stroke="hsl(var(--border))"
            strokeWidth={2}
            className="transition-all duration-200"
          />
          
          {/* Node label */}
          <text
            textAnchor="middle"
            dominantBaseline="middle"
            className="fill-foreground font-semibold text-sm pointer-events-none select-none"
          >
            {node.label || nodeId}
          </text>
          
          {/* Distance label (below node) */}
          {distance && currentStep && (
            <g transform="translate(0, 36)">
              <rect
                x={-16}
                y={-10}
                width={32}
                height={20}
                rx={4}
                fill="hsl(var(--code-bg))"
                stroke="hsl(var(--border))"
                strokeWidth={1}
              />
              <text
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-primary font-mono text-xs pointer-events-none"
              >
                {distance}
              </text>
            </g>
          )}
        </g>
      );
    }
    
    return nodes;
  };
  
  return (
    <svg
      className="w-full h-full graph-container"
      onClick={handleSvgClick}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      {/* Edge being created */}
      {edgeStartNode && graph.nodes.has(edgeStartNode) && (
        <line
          x1={graph.nodes.get(edgeStartNode)!.x}
          y1={graph.nodes.get(edgeStartNode)!.y}
          x2={graph.nodes.get(edgeStartNode)!.x}
          y2={graph.nodes.get(edgeStartNode)!.y}
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          strokeDasharray="4 4"
          className="pointer-events-none"
        />
      )}
      
      {renderEdges()}
      {renderNodes()}
    </svg>
  );
}
