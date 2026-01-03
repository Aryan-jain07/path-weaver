/**
 * A* Algorithm - Step-by-Step Generator
 * 
 * A* extends Dijkstra by using a heuristic function to guide the search
 * toward the target, making it more efficient for point-to-point pathfinding.
 * 
 * f(n) = g(n) + h(n)
 * where g(n) is the actual cost from start to n
 * and h(n) is the estimated cost from n to goal
 * 
 * Time Complexity: O(E) in best case (with perfect heuristic), O((V + E) log V) worst case
 * Space Complexity: O(V)
 */

import { Graph, Node, AlgorithmStep, NodeState, EdgeState } from '../types';
import { getNeighbors } from '../graph';

// ============================================
// HEURISTIC FUNCTIONS
// ============================================

export function euclideanDistance(nodeA: Node, nodeB: Node): number {
  const dx = nodeA.x - nodeB.x;
  const dy = nodeA.y - nodeB.y;
  return Math.sqrt(dx * dx + dy * dy) / 50; // Scale down for reasonable weights
}

export function manhattanDistance(nodeA: Node, nodeB: Node): number {
  return (Math.abs(nodeA.x - nodeB.x) + Math.abs(nodeA.y - nodeB.y)) / 50;
}

// Haversine distance for geographic coordinates (in km)
export function haversineDistance(nodeA: { lat: number; lng: number }, nodeB: { lat: number; lng: number }): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(nodeB.lat - nodeA.lat);
  const dLon = toRad(nodeB.lng - nodeA.lng);
  const lat1 = toRad(nodeA.lat);
  const lat2 = toRad(nodeB.lat);
  
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  
  return R * c;
}

function toRad(deg: number): number {
  return deg * (Math.PI / 180);
}

// ============================================
// A* PSEUDOCODE (for display)
// ============================================

export const ASTAR_PSEUDOCODE = [
  'function A*(Graph, source, target, h):',
  '    openSet ← {source}',
  '    cameFrom ← empty map',
  '',
  '    gScore[source] ← 0',
  '    fScore[source] ← h(source, target)',
  '',
  '    while openSet is not empty:',
  '        current ← node in openSet with lowest fScore',
  '        if current = target:',
  '            return reconstructPath(cameFrom, current)',
  '',
  '        remove current from openSet',
  '        for each neighbor of current:',
  '            tentative_gScore ← gScore[current] + d(current, neighbor)',
  '            if tentative_gScore < gScore[neighbor]:',
  '                cameFrom[neighbor] ← current',
  '                gScore[neighbor] ← tentative_gScore',
  '                fScore[neighbor] ← gScore[neighbor] + h(neighbor, target)',
  '                add neighbor to openSet',
  '',
  '    return failure (no path exists)',
];

// ============================================
// PRIORITY QUEUE
// ============================================

class PriorityQueue<T> {
  private heap: Array<{ item: T; priority: number }> = [];
  
  enqueue(item: T, priority: number): void {
    this.heap.push({ item, priority });
    this.bubbleUp(this.heap.length - 1);
  }
  
  dequeue(): T | undefined {
    if (this.isEmpty()) return undefined;
    
    const min = this.heap[0];
    const last = this.heap.pop()!;
    
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.bubbleDown(0);
    }
    
    return min.item;
  }
  
  isEmpty(): boolean {
    return this.heap.length === 0;
  }
  
  toArray(): Array<{ nodeId: string; priority: number }> {
    return this.heap.map(h => ({ 
      nodeId: h.item as unknown as string, 
      priority: h.priority 
    }));
  }
  
  private bubbleUp(index: number): void {
    while (index > 0) {
      const parentIndex = Math.floor((index - 1) / 2);
      if (this.heap[parentIndex].priority <= this.heap[index].priority) break;
      [this.heap[parentIndex], this.heap[index]] = [this.heap[index], this.heap[parentIndex]];
      index = parentIndex;
    }
  }
  
  private bubbleDown(index: number): void {
    while (true) {
      const leftChild = 2 * index + 1;
      const rightChild = 2 * index + 2;
      let smallest = index;
      
      if (leftChild < this.heap.length && this.heap[leftChild].priority < this.heap[smallest].priority) {
        smallest = leftChild;
      }
      if (rightChild < this.heap.length && this.heap[rightChild].priority < this.heap[smallest].priority) {
        smallest = rightChild;
      }
      
      if (smallest === index) break;
      
      [this.heap[smallest], this.heap[index]] = [this.heap[index], this.heap[smallest]];
      index = smallest;
    }
  }
}

// ============================================
// A* STEP GENERATOR
// ============================================

export function* generateAStarSteps(
  graph: Graph,
  sourceId: string,
  targetId: string,
  heuristic: (a: Node, b: Node) => number = euclideanDistance
): Generator<AlgorithmStep, void, unknown> {
  const targetNode = graph.nodes.get(targetId);
  if (!targetNode) {
    throw new Error(`Target node ${targetId} not found in graph`);
  }
  
  // g(n) - actual cost from start to n
  const gScore = new Map<string, number>();
  // f(n) = g(n) + h(n)
  const fScore = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const visited = new Set<string>(); // Closed set
  const nodeStates = new Map<string, NodeState>();
  const edgeStates = new Map<string, EdgeState>();
  const openSet = new PriorityQueue<string>();
  const inOpenSet = new Set<string>();
  
  // Initialize all nodes
  for (const [nodeId] of graph.nodes) {
    gScore.set(nodeId, Infinity);
    fScore.set(nodeId, Infinity);
    predecessors.set(nodeId, null);
    nodeStates.set(nodeId, 'default');
  }
  
  // Initialize source
  const sourceNode = graph.nodes.get(sourceId)!;
  const hValue = heuristic(sourceNode, targetNode);
  
  gScore.set(sourceId, 0);
  fScore.set(sourceId, hValue);
  openSet.enqueue(sourceId, hValue);
  inOpenSet.add(sourceId);
  
  nodeStates.set(sourceId, 'start');
  nodeStates.set(targetId, 'end');
  
  // Initialize all edges
  for (const [edgeId] of graph.edges) {
    edgeStates.set(edgeId, 'default');
  }
  
  // Yield initialization step
  yield {
    type: 'init',
    currentNode: null,
    distances: new Map(gScore),
    predecessors: new Map(predecessors),
    visited: new Set(visited),
    queue: openSet.toArray(),
    nodeStates: new Map(nodeStates),
    edgeStates: new Map(edgeStates),
    pseudocodeLine: 0,
    explanation: {
      beginner: `Starting A* from ${sourceId} to ${targetId}. We use a heuristic to guide our search toward the goal more efficiently than Dijkstra.`,
      advanced: `Init: g(${sourceId})=0, f(${sourceId})=h(${sourceId},${targetId})=${hValue.toFixed(1)}. Open set: {${sourceId}}.`,
    },
  };
  
  while (!openSet.isEmpty()) {
    const currentId = openSet.dequeue()!;
    inOpenSet.delete(currentId);
    
    // Skip if already visited
    if (visited.has(currentId)) continue;
    
    const currentNode = graph.nodes.get(currentId)!;
    
    // Mark as current
    if (currentId !== sourceId && currentId !== targetId) {
      nodeStates.set(currentId, 'current');
    }
    
    const currentF = fScore.get(currentId)!;
    const currentG = gScore.get(currentId)!;
    const currentH = heuristic(currentNode, targetNode);
    
    yield {
      type: 'select-node',
      currentNode: currentId,
      distances: new Map(gScore),
      predecessors: new Map(predecessors),
      visited: new Set(visited),
      queue: openSet.toArray(),
      nodeStates: new Map(nodeStates),
      edgeStates: new Map(edgeStates),
      pseudocodeLine: 8,
      explanation: {
        beginner: `Selecting node ${currentId} because it has the lowest f-score (${currentF.toFixed(1)}). This combines actual distance (${currentG.toFixed(1)}) + estimated remaining (${currentH.toFixed(1)}).`,
        advanced: `Pop ${currentId}: f=${currentF.toFixed(1)} = g(${currentG.toFixed(1)}) + h(${currentH.toFixed(1)})`,
      },
    };
    
    // Check if we've reached the target
    if (currentId === targetId) {
      const path = reconstructPath(predecessors, targetId);
      
      // Mark path
      for (let i = 0; i < path.length - 1; i++) {
        const edgeId = findEdgeId(graph, path[i], path[i + 1]);
        if (edgeId) edgeStates.set(edgeId, 'path');
        nodeStates.set(path[i], path[i] === sourceId ? 'start' : 'path');
      }
      nodeStates.set(targetId, 'end');
      
      yield {
        type: 'path-found',
        currentNode: currentId,
        distances: new Map(gScore),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        queue: openSet.toArray(),
        nodeStates: new Map(nodeStates),
        edgeStates: new Map(edgeStates),
        pseudocodeLine: 10,
        explanation: {
          beginner: `Found the shortest path! Total distance: ${gScore.get(targetId)?.toFixed(1)}. A* found this by prioritizing nodes that seem closer to the goal.`,
          advanced: `Path found: ${path.join(' → ')}. Cost: ${gScore.get(targetId)?.toFixed(1)}. Nodes explored: ${visited.size + 1}.`,
        },
        shortestPath: path,
        totalDistance: gScore.get(targetId),
      };
      return;
    }
    
    // Add to closed set
    visited.add(currentId);
    if (currentId !== sourceId) {
      nodeStates.set(currentId, 'visited');
    }
    
    // Examine neighbors
    const neighbors = getNeighbors(graph, currentId);
    
    for (const { nodeId: neighborId, edgeId, weight } of neighbors) {
      if (visited.has(neighborId)) continue;
      
      const neighborNode = graph.nodes.get(neighborId)!;
      const tentativeG = gScore.get(currentId)! + weight;
      const currentNeighborG = gScore.get(neighborId)!;
      
      edgeStates.set(edgeId, 'considering');
      
      yield {
        type: 'examine-edge',
        currentNode: currentId,
        distances: new Map(gScore),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        queue: openSet.toArray(),
        nodeStates: new Map(nodeStates),
        edgeStates: new Map(edgeStates),
        pseudocodeLine: 14,
        currentEdge: {
          edgeId,
          from: currentId,
          to: neighborId,
          weight,
          oldDistance: currentNeighborG,
          newDistance: tentativeG,
          wasRelaxed: tentativeG < currentNeighborG,
        },
        explanation: {
          beginner: `Checking neighbor ${neighborId}. Path through ${currentId} would cost ${tentativeG.toFixed(1)}, current best is ${currentNeighborG === Infinity ? '∞' : currentNeighborG.toFixed(1)}.`,
          advanced: `Edge (${currentId},${neighborId}): tentative_g = ${gScore.get(currentId)!.toFixed(1)} + ${weight} = ${tentativeG.toFixed(1)}`,
        },
      };
      
      if (tentativeG < currentNeighborG) {
        // Found a better path
        const h = heuristic(neighborNode, targetNode);
        const f = tentativeG + h;
        
        predecessors.set(neighborId, currentId);
        gScore.set(neighborId, tentativeG);
        fScore.set(neighborId, f);
        edgeStates.set(edgeId, 'relaxed');
        
        if (!inOpenSet.has(neighborId)) {
          openSet.enqueue(neighborId, f);
          inOpenSet.add(neighborId);
        }
        
        if (neighborId !== targetId) {
          nodeStates.set(neighborId, 'in-queue');
        }
        
        yield {
          type: 'relax-edge',
          currentNode: currentId,
          distances: new Map(gScore),
          predecessors: new Map(predecessors),
          visited: new Set(visited),
          queue: openSet.toArray(),
          nodeStates: new Map(nodeStates),
          edgeStates: new Map(edgeStates),
          pseudocodeLine: 17,
          currentEdge: {
            edgeId,
            from: currentId,
            to: neighborId,
            weight,
            oldDistance: currentNeighborG,
            newDistance: tentativeG,
            wasRelaxed: true,
          },
          explanation: {
            beginner: `Found better path to ${neighborId}! g=${tentativeG.toFixed(1)}, h=${h.toFixed(1)}, f=${f.toFixed(1)}`,
            advanced: `Update: g[${neighborId}]=${tentativeG.toFixed(1)}, f[${neighborId}]=${f.toFixed(1)}, prev[${neighborId}]=${currentId}`,
          },
        };
      } else {
        edgeStates.set(edgeId, 'rejected');
        
        yield {
          type: 'skip-edge',
          currentNode: currentId,
          distances: new Map(gScore),
          predecessors: new Map(predecessors),
          visited: new Set(visited),
          queue: openSet.toArray(),
          nodeStates: new Map(nodeStates),
          edgeStates: new Map(edgeStates),
          pseudocodeLine: 15,
          currentEdge: {
            edgeId,
            from: currentId,
            to: neighborId,
            weight,
            oldDistance: currentNeighborG,
            newDistance: tentativeG,
            wasRelaxed: false,
          },
          explanation: {
            beginner: `Path through ${currentId} to ${neighborId} isn't better. Keeping current path.`,
            advanced: `No update: ${tentativeG.toFixed(1)} ≥ ${currentNeighborG.toFixed(1)}`,
          },
        };
        
        edgeStates.set(edgeId, 'default');
      }
    }
    
    // Reset relaxed edges
    for (const [edgeId, state] of edgeStates) {
      if (state === 'relaxed') {
        edgeStates.set(edgeId, 'default');
      }
    }
  }
  
  // No path found
  yield {
    type: 'no-path',
    currentNode: null,
    distances: new Map(gScore),
    predecessors: new Map(predecessors),
    visited: new Set(visited),
    queue: [],
    nodeStates: new Map(nodeStates),
    edgeStates: new Map(edgeStates),
    pseudocodeLine: 21,
    explanation: {
      beginner: `No path exists from ${sourceId} to ${targetId}.`,
      advanced: `Open set empty. Target ${targetId} unreachable.`,
    },
  };
}

// ============================================
// HELPER FUNCTIONS
// ============================================

function reconstructPath(predecessors: Map<string, string | null>, targetId: string): string[] {
  const path: string[] = [];
  let current: string | null = targetId;
  
  while (current !== null) {
    path.unshift(current);
    current = predecessors.get(current) ?? null;
  }
  
  return path;
}

function findEdgeId(graph: Graph, nodeA: string, nodeB: string): string | null {
  for (const [edgeId, edge] of graph.edges) {
    if (
      (edge.source === nodeA && edge.target === nodeB) ||
      (!graph.directed && edge.source === nodeB && edge.target === nodeA)
    ) {
      return edgeId;
    }
  }
  return null;
}
