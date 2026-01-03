/**
 * Graph utilities and factory functions
 * Handles graph creation, modification, and adjacency management
 */

import { Graph, Node, Edge } from './types';

// ============================================
// GRAPH FACTORY
// ============================================

export function createGraph(directed: boolean = false): Graph {
  return {
    nodes: new Map(),
    edges: new Map(),
    adjacencyList: new Map(),
    directed,
  };
}

// ============================================
// NODE OPERATIONS
// ============================================

export function addNode(graph: Graph, node: Node): Graph {
  const newNodes = new Map(graph.nodes);
  newNodes.set(node.id, node);
  
  const newAdjacency = new Map(graph.adjacencyList);
  if (!newAdjacency.has(node.id)) {
    newAdjacency.set(node.id, new Set());
  }
  
  return {
    ...graph,
    nodes: newNodes,
    adjacencyList: newAdjacency,
  };
}

export function removeNode(graph: Graph, nodeId: string): Graph {
  const newNodes = new Map(graph.nodes);
  newNodes.delete(nodeId);
  
  // Remove all edges connected to this node
  const newEdges = new Map(graph.edges);
  const newAdjacency = new Map(graph.adjacencyList);
  
  for (const [edgeId, edge] of graph.edges) {
    if (edge.source === nodeId || edge.target === nodeId) {
      newEdges.delete(edgeId);
      
      // Update adjacency for the other node
      const otherId = edge.source === nodeId ? edge.target : edge.source;
      const otherAdj = newAdjacency.get(otherId);
      if (otherAdj) {
        otherAdj.delete(edgeId);
      }
    }
  }
  
  newAdjacency.delete(nodeId);
  
  return {
    ...graph,
    nodes: newNodes,
    edges: newEdges,
    adjacencyList: newAdjacency,
  };
}

// ============================================
// EDGE OPERATIONS
// ============================================

export function addEdge(graph: Graph, edge: Edge): Graph {
  const newEdges = new Map(graph.edges);
  newEdges.set(edge.id, { ...edge, directed: graph.directed });
  
  const newAdjacency = new Map(graph.adjacencyList);
  
  // Add to source's adjacency
  if (!newAdjacency.has(edge.source)) {
    newAdjacency.set(edge.source, new Set());
  }
  newAdjacency.get(edge.source)!.add(edge.id);
  
  // For undirected graphs, also add to target's adjacency
  if (!graph.directed) {
    if (!newAdjacency.has(edge.target)) {
      newAdjacency.set(edge.target, new Set());
    }
    newAdjacency.get(edge.target)!.add(edge.id);
  }
  
  return {
    ...graph,
    edges: newEdges,
    adjacencyList: newAdjacency,
  };
}

export function removeEdge(graph: Graph, edgeId: string): Graph {
  const edge = graph.edges.get(edgeId);
  if (!edge) return graph;
  
  const newEdges = new Map(graph.edges);
  newEdges.delete(edgeId);
  
  const newAdjacency = new Map(graph.adjacencyList);
  
  // Remove from source's adjacency
  const sourceAdj = newAdjacency.get(edge.source);
  if (sourceAdj) {
    sourceAdj.delete(edgeId);
  }
  
  // For undirected graphs, also remove from target's adjacency
  if (!graph.directed) {
    const targetAdj = newAdjacency.get(edge.target);
    if (targetAdj) {
      targetAdj.delete(edgeId);
    }
  }
  
  return {
    ...graph,
    edges: newEdges,
    adjacencyList: newAdjacency,
  };
}

// ============================================
// GRAPH QUERIES
// ============================================

export function getNeighbors(graph: Graph, nodeId: string): Array<{ nodeId: string; edgeId: string; weight: number }> {
  const neighbors: Array<{ nodeId: string; edgeId: string; weight: number }> = [];
  const edgeIds = graph.adjacencyList.get(nodeId);
  
  if (!edgeIds) return neighbors;
  
  for (const edgeId of edgeIds) {
    const edge = graph.edges.get(edgeId);
    if (!edge) continue;
    
    // Determine the neighbor node
    let neighborId: string;
    if (edge.source === nodeId) {
      neighborId = edge.target;
    } else if (!graph.directed && edge.target === nodeId) {
      neighborId = edge.source;
    } else {
      continue; // Directed edge pointing the wrong way
    }
    
    neighbors.push({
      nodeId: neighborId,
      edgeId,
      weight: edge.weight,
    });
  }
  
  return neighbors;
}

export function getEdgeBetween(graph: Graph, sourceId: string, targetId: string): Edge | null {
  const edgeIds = graph.adjacencyList.get(sourceId);
  if (!edgeIds) return null;
  
  for (const edgeId of edgeIds) {
    const edge = graph.edges.get(edgeId);
    if (!edge) continue;
    
    if (edge.source === sourceId && edge.target === targetId) {
      return edge;
    }
    if (!graph.directed && edge.source === targetId && edge.target === sourceId) {
      return edge;
    }
  }
  
  return null;
}

// ============================================
// SAMPLE GRAPHS FOR TESTING
// ============================================

export function createSampleGraph(): Graph {
  let graph = createGraph(false);
  
  // Add nodes in a meaningful layout
  const nodes: Node[] = [
    { id: 'A', x: 100, y: 200, label: 'A' },
    { id: 'B', x: 250, y: 100, label: 'B' },
    { id: 'C', x: 250, y: 300, label: 'C' },
    { id: 'D', x: 400, y: 150, label: 'D' },
    { id: 'E', x: 400, y: 250, label: 'E' },
    { id: 'F', x: 550, y: 200, label: 'F' },
  ];
  
  for (const node of nodes) {
    graph = addNode(graph, node);
  }
  
  // Add weighted edges
  const edges: Omit<Edge, 'directed'>[] = [
    { id: 'AB', source: 'A', target: 'B', weight: 4 },
    { id: 'AC', source: 'A', target: 'C', weight: 2 },
    { id: 'BD', source: 'B', target: 'D', weight: 5 },
    { id: 'CD', source: 'C', target: 'D', weight: 8 },
    { id: 'CE', source: 'C', target: 'E', weight: 3 },
    { id: 'DE', source: 'D', target: 'E', weight: 2 },
    { id: 'DF', source: 'D', target: 'F', weight: 6 },
    { id: 'EF', source: 'E', target: 'F', weight: 3 },
  ];
  
  for (const edge of edges) {
    graph = addEdge(graph, edge as Edge);
  }
  
  return graph;
}

// Generate unique IDs
let nodeCounter = 0;
let edgeCounter = 0;

export function generateNodeId(): string {
  return `node_${++nodeCounter}`;
}

export function generateEdgeId(): string {
  return `edge_${++edgeCounter}`;
}

export function resetIdCounters(): void {
  nodeCounter = 0;
  edgeCounter = 0;
}
