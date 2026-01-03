/**
 * Dijkstra's Algorithm - Step-by-Step Generator
 * 
 * This implementation uses a generator function to yield each step,
 * allowing the UI to visualize the algorithm's progress incrementally.
 * 
 * Time Complexity: O((V + E) log V) with a priority queue
 * Space Complexity: O(V)
 */

import { Graph, Node, AlgorithmStep, NodeState, EdgeState } from '../types';
import { getNeighbors } from '../graph';

// ============================================
// PRIORITY QUEUE (Min-Heap)
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
// DIJKSTRA PSEUDOCODE (for display)
// ============================================

export const DIJKSTRA_PSEUDOCODE = [
  'function Dijkstra(Graph, source):',
  '    for each vertex v in Graph:',
  '        dist[v] ← INFINITY',
  '        prev[v] ← UNDEFINED',
  '    dist[source] ← 0',
  '    Q ← priority queue with all vertices',
  '',
  '    while Q is not empty:',
  '        u ← vertex in Q with min dist[u]',
  '        remove u from Q',
  '',
  '        for each neighbor v of u:',
  '            alt ← dist[u] + weight(u, v)',
  '            if alt < dist[v]:',
  '                dist[v] ← alt',
  '                prev[v] ← u',
  '',
  '    return dist[], prev[]',
];

// ============================================
// STEP GENERATOR
// ============================================

export function* generateDijkstraSteps(
  graph: Graph,
  sourceId: string,
  targetId?: string
): Generator<AlgorithmStep, void, unknown> {
  // Initialize data structures
  const distances = new Map<string, number>();
  const predecessors = new Map<string, string | null>();
  const visited = new Set<string>();
  const nodeStates = new Map<string, NodeState>();
  const edgeStates = new Map<string, EdgeState>();
  const pq = new PriorityQueue<string>();
  
  // Initialize all nodes
  for (const [nodeId] of graph.nodes) {
    distances.set(nodeId, nodeId === sourceId ? 0 : Infinity);
    predecessors.set(nodeId, null);
    nodeStates.set(nodeId, nodeId === sourceId ? 'start' : 'default');
  }
  
  if (targetId) {
    nodeStates.set(targetId, 'end');
  }
  
  // Initialize all edges
  for (const [edgeId] of graph.edges) {
    edgeStates.set(edgeId, 'default');
  }
  
  // Enqueue source
  pq.enqueue(sourceId, 0);
  
  // Yield initialization step
  yield {
    type: 'init',
    currentNode: null,
    distances: new Map(distances),
    predecessors: new Map(predecessors),
    visited: new Set(visited),
    queue: pq.toArray(),
    nodeStates: new Map(nodeStates),
    edgeStates: new Map(edgeStates),
    pseudocodeLine: 0,
    explanation: {
      beginner: `Starting Dijkstra's algorithm from node ${sourceId}. All distances are set to infinity except the source, which is 0.`,
      advanced: `Initialization: dist[${sourceId}] = 0, dist[v] = ∞ for all v ≠ ${sourceId}. Priority queue contains all vertices.`,
    },
  };
  
  // Main algorithm loop
  while (!pq.isEmpty()) {
    const currentId = pq.dequeue()!;
    
    // Skip if already visited (we may have duplicate entries in PQ)
    if (visited.has(currentId)) continue;
    
    // Mark as current
    if (currentId !== sourceId && currentId !== targetId) {
      nodeStates.set(currentId, 'current');
    }
    
    // Yield node selection step
    yield {
      type: 'select-node',
      currentNode: currentId,
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      visited: new Set(visited),
      queue: pq.toArray(),
      nodeStates: new Map(nodeStates),
      edgeStates: new Map(edgeStates),
      pseudocodeLine: 8,
      explanation: {
        beginner: `Selecting node ${currentId} because it has the smallest known distance (${distances.get(currentId)}).`,
        advanced: `Extract-min: u = ${currentId} with dist[u] = ${distances.get(currentId)}. This distance is now final.`,
      },
    };
    
    // Check if we've reached the target (for single-target mode)
    if (targetId && currentId === targetId) {
      visited.add(currentId);
      nodeStates.set(currentId, 'end');
      
      // Reconstruct path
      const path = reconstructPath(predecessors, targetId);
      
      // Mark path edges
      for (let i = 0; i < path.length - 1; i++) {
        const edgeId = findEdgeId(graph, path[i], path[i + 1]);
        if (edgeId) edgeStates.set(edgeId, 'path');
        nodeStates.set(path[i], path[i] === sourceId ? 'start' : 'path');
      }
      
      yield {
        type: 'path-found',
        currentNode: currentId,
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        queue: pq.toArray(),
        nodeStates: new Map(nodeStates),
        edgeStates: new Map(edgeStates),
        pseudocodeLine: 16,
        explanation: {
          beginner: `Found the shortest path to ${targetId}! Total distance: ${distances.get(targetId)}.`,
          advanced: `Target reached. Shortest path: ${path.join(' → ')} with total weight ${distances.get(targetId)}.`,
        },
        shortestPath: path,
        totalDistance: distances.get(targetId),
      };
      return;
    }
    
    // Mark as visited
    visited.add(currentId);
    if (currentId !== sourceId && currentId !== targetId) {
      nodeStates.set(currentId, 'visited');
    }
    
    yield {
      type: 'mark-visited',
      currentNode: currentId,
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      visited: new Set(visited),
      queue: pq.toArray(),
      nodeStates: new Map(nodeStates),
      edgeStates: new Map(edgeStates),
      pseudocodeLine: 9,
      explanation: {
        beginner: `Node ${currentId} is now permanently visited. We've found the shortest path to it.`,
        advanced: `Remove ${currentId} from Q. dist[${currentId}] = ${distances.get(currentId)} is now finalized.`,
      },
    };
    
    // Examine neighbors
    const neighbors = getNeighbors(graph, currentId);
    
    for (const { nodeId: neighborId, edgeId, weight } of neighbors) {
      if (visited.has(neighborId)) continue;
      
      const currentDist = distances.get(currentId)!;
      const oldDist = distances.get(neighborId)!;
      const newDist = currentDist + weight;
      
      // Mark edge as being considered
      edgeStates.set(edgeId, 'considering');
      
      yield {
        type: 'examine-edge',
        currentNode: currentId,
        distances: new Map(distances),
        predecessors: new Map(predecessors),
        visited: new Set(visited),
        queue: pq.toArray(),
        nodeStates: new Map(nodeStates),
        edgeStates: new Map(edgeStates),
        pseudocodeLine: 11,
        currentEdge: {
          edgeId,
          from: currentId,
          to: neighborId,
          weight,
          oldDistance: oldDist,
          newDistance: newDist,
          wasRelaxed: newDist < oldDist,
        },
        explanation: {
          beginner: `Looking at neighbor ${neighborId}. Current path to it costs ${oldDist === Infinity ? '∞' : oldDist}. Going through ${currentId} would cost ${newDist}.`,
          advanced: `Examining edge (${currentId}, ${neighborId}). alt = dist[${currentId}] + w(${currentId},${neighborId}) = ${currentDist} + ${weight} = ${newDist}`,
        },
      };
      
      // Relaxation
      if (newDist < oldDist) {
        distances.set(neighborId, newDist);
        predecessors.set(neighborId, currentId);
        pq.enqueue(neighborId, newDist);
        edgeStates.set(edgeId, 'relaxed');
        
        if (neighborId !== targetId) {
          nodeStates.set(neighborId, 'in-queue');
        }
        
        yield {
          type: 'relax-edge',
          currentNode: currentId,
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          visited: new Set(visited),
          queue: pq.toArray(),
          nodeStates: new Map(nodeStates),
          edgeStates: new Map(edgeStates),
          pseudocodeLine: 14,
          currentEdge: {
            edgeId,
            from: currentId,
            to: neighborId,
            weight,
            oldDistance: oldDist,
            newDistance: newDist,
            wasRelaxed: true,
          },
          explanation: {
            beginner: `Found a shorter path to ${neighborId}! Updated distance from ${oldDist === Infinity ? '∞' : oldDist} to ${newDist}.`,
            advanced: `Relaxation: ${newDist} < ${oldDist === Infinity ? '∞' : oldDist}, so dist[${neighborId}] ← ${newDist}, prev[${neighborId}] ← ${currentId}`,
          },
        };
      } else {
        edgeStates.set(edgeId, 'rejected');
        
        yield {
          type: 'skip-edge',
          currentNode: currentId,
          distances: new Map(distances),
          predecessors: new Map(predecessors),
          visited: new Set(visited),
          queue: pq.toArray(),
          nodeStates: new Map(nodeStates),
          edgeStates: new Map(edgeStates),
          pseudocodeLine: 13,
          currentEdge: {
            edgeId,
            from: currentId,
            to: neighborId,
            weight,
            oldDistance: oldDist,
            newDistance: newDist,
            wasRelaxed: false,
          },
          explanation: {
            beginner: `Path through ${currentId} to ${neighborId} costs ${newDist}, which isn't better than the current ${oldDist}. No update needed.`,
            advanced: `No relaxation: ${newDist} ≥ ${oldDist}, so dist[${neighborId}] remains ${oldDist}`,
          },
        };
        
        // Reset edge state after showing rejection
        edgeStates.set(edgeId, 'default');
      }
    }
    
    // Reset relaxed edges to default for next iteration
    for (const [edgeId, state] of edgeStates) {
      if (state === 'relaxed') {
        edgeStates.set(edgeId, 'default');
      }
    }
  }
  
  // Algorithm complete
  if (targetId && !visited.has(targetId)) {
    yield {
      type: 'no-path',
      currentNode: null,
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      visited: new Set(visited),
      queue: [],
      nodeStates: new Map(nodeStates),
      edgeStates: new Map(edgeStates),
      pseudocodeLine: 16,
      explanation: {
        beginner: `No path exists from ${sourceId} to ${targetId}.`,
        advanced: `Algorithm terminated. Target ${targetId} unreachable from ${sourceId}.`,
      },
    };
  } else {
    yield {
      type: 'complete',
      currentNode: null,
      distances: new Map(distances),
      predecessors: new Map(predecessors),
      visited: new Set(visited),
      queue: [],
      nodeStates: new Map(nodeStates),
      edgeStates: new Map(edgeStates),
      pseudocodeLine: 16,
      explanation: {
        beginner: `Dijkstra's algorithm complete! Found shortest paths from ${sourceId} to all reachable nodes.`,
        advanced: `Algorithm terminated. Single-source shortest paths computed for all vertices reachable from ${sourceId}.`,
      },
    };
  }
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
