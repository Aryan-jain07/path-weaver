/**
 * Core data structures for graph algorithms
 * Designed for extensibility and type safety
 */

// ============================================
// GRAPH DATA STRUCTURES
// ============================================

export interface Node {
  id: string;
  x: number;
  y: number;
  label?: string;
}

export interface Edge {
  id: string;
  source: string;
  target: string;
  weight: number;
  directed?: boolean;
}

export interface Graph {
  nodes: Map<string, Node>;
  edges: Map<string, Edge>;
  adjacencyList: Map<string, Set<string>>; // nodeId -> Set of edgeIds
  directed: boolean;
}

// ============================================
// ALGORITHM STATE & STEPS
// ============================================

export type NodeState = 
  | 'default' 
  | 'current' 
  | 'visited' 
  | 'in-queue'
  | 'path'
  | 'start'
  | 'end';

export type EdgeState = 
  | 'default' 
  | 'considering' 
  | 'relaxed' 
  | 'rejected'
  | 'path';

export interface AlgorithmStep {
  type: 
    | 'init'
    | 'select-node'
    | 'examine-edge'
    | 'relax-edge'
    | 'skip-edge'
    | 'mark-visited'
    | 'update-queue'
    | 'path-found'
    | 'no-path'
    | 'complete';
  
  // Current algorithm state
  currentNode: string | null;
  distances: Map<string, number>;
  predecessors: Map<string, string | null>;
  visited: Set<string>;
  queue: Array<{ nodeId: string; priority: number }>;
  
  // Visual state
  nodeStates: Map<string, NodeState>;
  edgeStates: Map<string, EdgeState>;
  
  // Educational content
  pseudocodeLine: number;
  explanation: {
    beginner: string;
    advanced: string;
  };
  
  // Edge being processed (if applicable)
  currentEdge?: {
    edgeId: string;
    from: string;
    to: string;
    weight: number;
    oldDistance: number;
    newDistance: number;
    wasRelaxed: boolean;
  };
  
  // Final path (when complete)
  shortestPath?: string[];
  totalDistance?: number;
}

// ============================================
// ALGORITHM CONFIGURATION
// ============================================

export type AlgorithmType = 'dijkstra' | 'astar';

export interface AlgorithmConfig {
  type: AlgorithmType;
  sourceId: string;
  targetId?: string; // Optional for Dijkstra, required for A*
  heuristic?: (nodeA: Node, nodeB: Node) => number;
}

export type HeuristicType = 'euclidean' | 'manhattan' | 'haversine';

// ============================================
// MAP MODE TYPES
// ============================================

export interface GeoNode extends Node {
  lat: number;
  lng: number;
}

export interface GeoEdge extends Edge {
  // Additional properties for road segments
  roadType?: string;
  speedLimit?: number;
}

export interface MapGraph extends Omit<Graph, 'nodes' | 'edges'> {
  nodes: Map<string, GeoNode>;
  edges: Map<string, GeoEdge>;
}

// ============================================
// UI STATE
// ============================================

export type AppMode = 'visualizer' | 'map';

export type ExplanationLevel = 'beginner' | 'advanced';

export interface VisualizerState {
  isRunning: boolean;
  isPaused: boolean;
  speed: number; // ms between steps
  currentStepIndex: number;
  steps: AlgorithmStep[];
}
